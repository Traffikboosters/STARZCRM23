interface SimplifiedCallRequest {
  phoneNumber: string;
  contactName?: string;
  userId: number;
}

interface SimplifiedCallResponse {
  success: boolean;
  dialString?: string;
  sipUrl?: string;
  message: string;
  timestamp: string;
  callMethod: 'dial_string' | 'sip_url' | 'web_dialer';
}

export class MightyCallSimplified {
  private accountId = '4f917f13-aae1-401d-8241-010db91da5b2';
  private mainNumber = '(877) 840-6250';
  private domain = 'traffikboosters.mightycall.com';

  constructor() {
    console.log('MightyCall Simplified initialized for Traffik Boosters');
  }

  async generateCallString(request: SimplifiedCallRequest): Promise<SimplifiedCallResponse> {
    try {
      // Clean and format phone number
      const cleanNumber = request.phoneNumber.replace(/\D/g, '');
      let formattedNumber: string;
      
      if (cleanNumber.length === 10) {
        formattedNumber = `+1${cleanNumber}`;
      } else if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        formattedNumber = `+${cleanNumber}`;
      } else {
        formattedNumber = `+${cleanNumber}`;
      }

      // Generate multiple call options for maximum compatibility
      const callId = this.generateCallId();
      
      // Option 1: Direct dial string for MightyCall desktop app
      const dialString = `mc://call/${formattedNumber}?account=${this.accountId}&contact=${encodeURIComponent(request.contactName || 'Contact')}&id=${callId}`;
      
      // Option 2: SIP URL for VoIP clients
      const sipUrl = `sip:${formattedNumber}@${this.domain}`;
      
      // Option 3: Web dialer URL
      const webDialerUrl = `https://panel.mightycall.com/dialer?number=${encodeURIComponent(formattedNumber)}&contact=${encodeURIComponent(request.contactName || 'Contact')}`;

      // Log call attempt for tracking
      console.log(`📞 Call initiated - Contact: ${request.contactName}, Number: ${formattedNumber}, Method: Dial String`);

      return {
        success: true,
        dialString: dialString,
        sipUrl: sipUrl,
        message: 'Call ready - Use dial string or SIP URL to initiate call',
        timestamp: new Date().toISOString(),
        callMethod: 'dial_string'
      };
    } catch (error) {
      console.error('Call string generation error:', error);
      return {
        success: false,
        message: `Failed to generate call string: ${error}`,
        timestamp: new Date().toISOString(),
        callMethod: 'dial_string'
      };
    }
  }

  async getConnectionStatus(): Promise<any> {
    return {
      connected: true,
      method: 'Simplified Dial String',
      accountId: this.accountId,
      mainNumber: this.mainNumber,
      domain: this.domain,
      status: 'ready',
      capabilities: [
        'Click-to-call via dial strings',
        'SIP URL generation',
        'Web dialer integration',
        'Call logging and tracking'
      ]
    };
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatPhoneForDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const withoutCountry = cleaned.substr(1);
      return `(${withoutCountry.substr(0, 3)}) ${withoutCountry.substr(3, 3)}-${withoutCountry.substr(6, 4)}`;
    }
    return phone;
  }
}

export const mightyCallSimplified = new MightyCallSimplified();