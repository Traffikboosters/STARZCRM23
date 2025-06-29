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
  private secretKey = process.env.MIGHTYCALL_SECRET_KEY || 'b0ec4538-9b35-42b3-b825-a8b88917f5ab';
  private accountId = '4f917f13-aae1-401d-8241-010db91da5b2';
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

    // Common extension numbers to try for Core plan
    const extensionCandidates = [
      this.secretKey!, // Try the provided secret first
      '501', '502', '503', '100', '101', '102', '200', '201', '202',
      '1001', '1002', '1003', '2000', '2001', '2002'
    ];

    for (const extension of extensionCandidates) {
      try {
        console.log(`MightyCall authentication attempt with extension: ${extension}`);
        
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
            'client_secret': extension
          })
        });

        console.log(`Auth response status for ${extension}:`, response.status);
        
        if (response.ok) {
          const authData: MightyCallAuthResponse = await response.json();
          this.authToken = authData.access_token;
          this.tokenExpiration = Date.now() + (authData.expires_in * 1000) - 60000; // 1 min buffer
          console.log(`✅ Authentication successful with extension: ${extension}`);
          return this.authToken;
        } else {
          const errorText = await response.text();
          console.log(`❌ Extension ${extension} failed:`, errorText);
        }
      } catch (error) {
        console.log(`❌ Extension ${extension} error:`, error);
        continue;
      }
    }

    throw new Error('Authentication failed: Unable to authenticate with any extension number');
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
          'x-account-id': this.accountId,
          'Accept': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        throw new Error(`Profile fetch failed: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      
      // Build call payload
      const callPayload = {
        from: formattedNumber,
        to: formattedNumber,
        contact_name: request.contactName || 'Unknown Contact',
        extension: request.extension || '501'
      };

      console.log('Making call with payload:', callPayload);

      const callResponse = await fetch(`${this.baseUrl}/api/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': this.apiKey!,
          'x-account-id': this.accountId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(callPayload)
      });

      if (!callResponse.ok) {
        const errorText = await callResponse.text();
        throw new Error(`Call request failed: ${callResponse.status} - ${errorText}`);
      }

      const callData = await callResponse.json();
      
      return {
        success: true,
        callId: callData.data?.id || 'unknown',
        status: callData.data?.status || 'initiated',
        message: 'Call initiated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('MightyCall call error:', error);
      return {
        success: false,
        message: `Failed to initiate call: ${error}`,
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
          'x-account-id': this.accountId,
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
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else {
      return `+${cleaned}`;
    }
  }
}

export const mightyCallNativeAPI = new MightyCallNativeAPI();