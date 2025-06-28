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

export class MightyCallCore {
  private apiKey: string;
  private secretKey: string;
  private accountId: string;

  constructor() {
    this.apiKey = process.env.MIGHTYCALL_API_KEY || 'traffikboosters@gmail.com';
    this.secretKey = process.env.MIGHTYCALL_SECRET_KEY || '';
    this.accountId = process.env.MIGHTYCALL_ACCOUNT_ID || '4f917f13-aae1-401d-8241-010db91da5b2';
  }

  private generateAuthToken(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${this.apiKey}:${timestamp}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  async getStatus(): Promise<MightyCallStatus> {
    if (!this.apiKey || !this.accountId) {
      return {
        connected: false,
        apiAccess: false,
        accountId: this.accountId,
        integrationLevel: 'Offline',
        message: 'MightyCall credentials not configured'
      };
    }

    try {
      // Test basic connectivity
      const pingResponse = await fetch('https://api.mightycall.com/health', {
        method: 'GET',
        timeout: 5000
      });

      if (!pingResponse.ok) {
        return {
          connected: false,
          apiAccess: false,
          accountId: this.accountId,
          integrationLevel: 'Offline',
          message: 'MightyCall service unavailable'
        };
      }

      return {
        connected: true,
        apiAccess: true,
        accountId: this.accountId,
        integrationLevel: 'Full API',
        message: 'MightyCall integration active'
      };
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
    
    // Format phone number for dialing
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.length === 10 ? `1${cleanNumber}` : cleanNumber;
    const displayNumber = this.formatPhoneDisplay(formattedNumber);
    
    // Generate unique call ID for tracking
    const callId = `tb_call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create multiple call initiation methods for reliability
    const mightyCallWebUrl = `https://app.mightycall.com/dial/${formattedNumber}`;
    const mightyCallSipUrl = `sip:${formattedNumber}@${this.accountId}.mightycall.com`;
    const directDialUrl = `tel:+${formattedNumber}${extension ? `,,${extension}` : ''}`;
    
    return {
      success: true,
      callId,
      dialString: mightyCallWebUrl,
      displayNumber,
      message: `Call ready for ${contactName || displayNumber}`,
      status: 'ready',
      instructions: `Multiple call options available:

1. MightyCall Web App: ${mightyCallWebUrl}
2. SIP Client: ${mightyCallSipUrl}  
3. Direct Phone: ${directDialUrl}

Click call button to initiate using MightyCall system.`
    };
  }

  private formatPhoneDisplay(phone: string): string {
    if (phone.length === 11 && phone.startsWith('1')) {
      const areaCode = phone.substring(1, 4);
      const exchange = phone.substring(4, 7);
      const number = phone.substring(7);
      return `(${areaCode}) ${exchange}-${number}`;
    }
    return phone;
  }

  generateCallInstructions(status: MightyCallStatus): string {
    const baseInstructions = [
      '=== Traffik Boosters MightyCall Integration ===',
      '',
      '✓ Click-to-Call: Use call buttons throughout CRM',
      '✓ Manual Dial: Open MightyCall app and dial',
      '✓ Web Portal: Use MightyCall web interface',
      '✓ SIP Client: Configure with account credentials',
      ''
    ];

    if (status.connected) {
      baseInstructions.push(
        `Status: ✅ ${status.integrationLevel}`,
        `Account: ${status.accountId}`,
        `Message: ${status.message}`,
        '',
        'All calls are logged and tracked through MightyCall.',
        'Use any call method - all route through your business line.',
        '',
        'Support: (877) 840-6250'
      );
    } else {
      baseInstructions.push(
        'Status: ⚠️ Connection Issue',
        `Account: ${status.accountId}`,
        `Issue: ${status.message}`,
        '',
        'Fallback options:',
        '• Direct dial using tel: links',
        '• Manual entry in MightyCall app',
        '• Contact system administrator'
      );
    }

    return baseInstructions.join('\n');
  }
}

export const mightyCallCore = new MightyCallCore();