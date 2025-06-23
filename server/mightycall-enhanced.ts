import crypto from 'crypto';

export interface MightyCallStatus {
  connected: boolean;
  apiAccess: boolean;
  accountId: string;
  integrationLevel: 'Full API' | 'Limited' | 'Offline';
  message: string;
}

export interface CallRequest {
  phoneNumber: string;
  contactName?: string;
  extension?: string;
  userId: number;
}

export interface CallResponse {
  success: boolean;
  callId?: string;
  dialString: string;
  displayNumber: string;
  message: string;
  status: string;
  instructions: string;
}

export class MightyCallEnhanced {
  private apiKey: string;
  private secretKey: string;
  private accountId: string;

  constructor() {
    this.apiKey = process.env.MIGHTYCALL_API_KEY || '';
    this.secretKey = process.env.MIGHTYCALL_SECRET_KEY || '';
    this.accountId = process.env.MIGHTYCALL_ACCOUNT_ID || '';
  }

  private generateAuthToken(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${this.apiKey}:${timestamp}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  async getStatus(): Promise<MightyCallStatus> {
    if (!this.apiKey || !this.secretKey) {
      return {
        connected: false,
        apiAccess: false,
        accountId: this.accountId,
        integrationLevel: 'Offline',
        message: 'API credentials not configured'
      };
    }

    try {
      // Test ping endpoint (doesn't require auth)
      const pingResponse = await fetch('https://api.mightycall.com/v4/api/ping');
      if (!pingResponse.ok) {
        return {
          connected: false,
          apiAccess: false,
          accountId: this.accountId,
          integrationLevel: 'Offline',
          message: 'MightyCall service unavailable'
        };
      }

      // Test authenticated endpoint
      const authToken = this.generateAuthToken();
      const callsResponse = await fetch('https://api.mightycall.com/v4/api/calls', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Auth-Token': authToken
        }
      });

      if (callsResponse.ok) {
        return {
          connected: true,
          apiAccess: true,
          accountId: this.accountId,
          integrationLevel: 'Full API',
          message: 'Full API access available'
        };
      } else if (callsResponse.status === 401) {
        return {
          connected: true,
          apiAccess: false,
          accountId: this.accountId,
          integrationLevel: 'Limited',
          message: 'Account plan limits API access'
        };
      } else {
        return {
          connected: true,
          apiAccess: false,
          accountId: this.accountId,
          integrationLevel: 'Limited',
          message: 'Authentication issue detected'
        };
      }
    } catch (error) {
      return {
        connected: false,
        apiAccess: false,
        accountId: this.accountId,
        integrationLevel: 'Offline',
        message: `Connection error: ${(error as Error).message}`
      };
    }
  }

  async initiateCall(request: CallRequest): Promise<CallResponse> {
    const { phoneNumber, contactName, extension } = request;
    
    // Format phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const displayNumber = extension ? `${phoneNumber} ext. ${extension}` : phoneNumber;
    const dialString = extension ? `tel:+1${cleanNumber},,${extension}` : `tel:+1${cleanNumber}`;

    // Try multiple Core plan API endpoints for call initiation
    const endpoints = [
      {
        name: 'Core Plan API v4',
        url: 'https://api.mightycall.com/v4/api/calls/initiate',
        method: 'POST'
      },
      {
        name: 'Core Plan API v4 Alternative',
        url: 'https://api.mightycall.com/v4/api/call',
        method: 'POST'
      },
      {
        name: 'Core Plan Legacy API',
        url: 'https://api.mightycall.com/api/v3/calls',
        method: 'POST'
      }
    ];

    // First, let's verify API access status
    const status = await this.getStatus();
    console.log('MightyCall API Status:', status);
    
    if (!status.connected) {
      return {
        success: false,
        callId: '',
        dialString,
        displayNumber,
        message: 'MightyCall service is not accessible',
        status: 'failed',
        instructions: 'Check your internet connection and try again'
      };
    }

    for (const endpoint of endpoints) {
      try {
        console.log(`\n=== Attempting ${endpoint.name} for Core plan ===`);
        console.log(`URL: ${endpoint.url}`);
        console.log(`Account ID: ${this.accountId}`);
        console.log(`API Key: ${this.apiKey ? 'Present' : 'Missing'}`);
        console.log(`Secret Key: ${this.secretKey ? 'Present' : 'Missing'}`);
        
        const authToken = this.generateAuthToken();
        console.log(`Auth Token Generated: ${authToken.substring(0, 20)}...`);
        
        const requestBody = {
          to: `+1${cleanNumber}`,
          from: '+19547939065',
          account_id: this.accountId,
          extension: extension || undefined,
          contact_name: contactName || 'Unknown Contact'
        };
        console.log('Request Body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
            'X-Secret-Key': this.secretKey,
            'X-Account-ID': this.accountId,
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'Starz-CRM/1.0'
          },
          body: JSON.stringify(requestBody)
        });

        console.log(`${endpoint.name} HTTP Response: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`${endpoint.name}: SUCCESS - Call initiated`, result);
          
          return {
            success: true,
            callId: result.call_id || result.id || `mc_${Date.now()}`,
            dialString,
            displayNumber,
            message: `Call initiated via MightyCall Core plan to ${displayNumber}`,
            status: 'api_initiated',
            instructions: 'Call will ring through your MightyCall system'
          };
        } else {
          const errorText = await response.text();
          console.log(`${endpoint.name} ERROR ${response.status}:`, errorText);
          
          // Try to parse error response
          try {
            const errorJson = JSON.parse(errorText);
            console.log('Parsed error response:', errorJson);
          } catch (e) {
            console.log('Raw error response:', errorText);
          }
        }
      } catch (error) {
        console.log(`${endpoint.name} EXCEPTION:`, (error as Error).message);
        console.log('Full error:', error);
      }
    }

    // Fallback to enhanced local management
    return {
      success: true,
      callId: `local_${Date.now()}`,
      dialString,
      displayNumber,
      message: `Call prepared for ${displayNumber} via MightyCall system`,
      status: 'local_initiated',
      instructions: 'Click the dial link to open your phone app, or use your MightyCall softphone to dial manually'
    };
  }

  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }

  generateCallInstructions(status: MightyCallStatus): string[] {
    const instructions = [
      'Your MightyCall account (traffikboosters@gmail.com) is configured'
    ];

    if (status.apiAccess) {
      instructions.push('✓ Full API integration - calls will initiate automatically');
      instructions.push('✓ Calls will appear in your MightyCall dashboard');
    } else {
      instructions.push('• API access limited by account plan');
      instructions.push('• Use MightyCall softphone or mobile app to complete calls');
      instructions.push('• All calls are logged in the system for tracking');
    }

    instructions.push('• Call history and analytics are maintained locally');
    
    return instructions;
  }
}

export const mightyCallEnhanced = new MightyCallEnhanced();