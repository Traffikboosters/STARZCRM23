interface MightyCallAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface MightyCallRequest {
  phoneNumber: string;
  contactName?: string;
  extension?: string;
  userId: number;
}

interface MightyCallResponse {
  success: boolean;
  callId?: string;
  status?: string;
  message: string;
  timestamp: string;
  error?: string;
}

export class MightyCallNativeAPI {
  private apiKey = process.env.MIGHTYCALL_API_KEY;
  private secretKey = process.env.MIGHTYCALL_SECRET_KEY;
  private baseUrl = 'https://api.mightycall.com/v4';
  private authToken: string | null = null;
  private tokenExpiration: number = 0;

  constructor() {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('MightyCall API credentials not configured');
    }
  }

  private async authenticate(): Promise<string> {
    // Check if current token is still valid
    if (this.authToken && Date.now() < this.tokenExpiration) {
      return this.authToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': this.apiKey!
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'client_id': this.apiKey!,
          'client_secret': this.secretKey!
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const authData: MightyCallAuthResponse = await response.json();
      
      this.authToken = authData.access_token;
      // Set expiration to 90% of actual expiration time for safety
      this.tokenExpiration = Date.now() + (authData.expires_in * 900);
      
      console.log('MightyCall authentication successful');
      return this.authToken;
    } catch (error) {
      console.error('MightyCall authentication error:', error);
      throw new Error(`Failed to authenticate with MightyCall: ${error}`);
    }
  }

  async makeCall(request: MightyCallRequest): Promise<MightyCallResponse> {
    try {
      // Ensure we have a valid auth token
      const token = await this.authenticate();

      // Clean phone number
      const cleanNumber = request.phoneNumber.replace(/\D/g, '');
      const formattedNumber = cleanNumber.length === 10 ? `+1${cleanNumber}` : `+${cleanNumber}`;

      // Get profile info to determine available phone numbers
      const profileResponse = await fetch(`${this.baseUrl}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': this.apiKey!,
          'Accept': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        throw new Error(`Profile fetch failed: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      console.log('Profile data:', profileData);

      // Attempt to make the call
      const callPayload = {
        to: formattedNumber,
        from: profileData.data?.phoneNumbers?.[0] || '', // Use first available number
        extension: request.extension || '101', // Default extension
        caller_id: request.contactName || 'Traffik Boosters'
      };

      console.log('Making call with payload:', callPayload);

      const callResponse = await fetch(`${this.baseUrl}/api/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': this.apiKey!,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(callPayload)
      });

      const callResult = await callResponse.json();
      console.log('Call API response:', callResult);

      if (callResponse.ok && callResult.isSuccess) {
        return {
          success: true,
          callId: callResult.data?.id || `mc_${Date.now()}`,
          status: 'initiated',
          message: `Call initiated to ${formattedNumber} via MightyCall`,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(callResult.message || 'Call initiation failed');
      }

    } catch (error) {
      console.error('MightyCall API error:', error);
      
      return {
        success: false,
        message: `Call failed: ${error}`,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAccountStatus(): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': this.apiKey!,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        connected: true,
        accountId: data.data?.id || 'unknown',
        phoneNumbers: data.data?.phoneNumbers || [],
        plan: data.data?.plan || 'Core',
        status: 'active'
      };
    } catch (error) {
      console.error('Status check error:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }
}

export const mightyCallNativeAPI = new MightyCallNativeAPI();