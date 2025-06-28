interface MightyCallStatus {
  connected: boolean;
  apiAccess: boolean;
  accountId: string;
  integrationLevel: string;
  message: string;
}

interface CallRequest {
  phoneNumber: string;
  contactName?: string;
  extension?: string;
  userId: number;
}

interface CallResponse {
  success: boolean;
  callId: string;
  displayNumber: string;
  dialString: string;
  sipUrl: string;
  instructions: string;
  timestamp: string;
}

export class MightyCallEnhanced {
  private accountId = '4f917f13-aae1-401d-8241-010db91da5b2';
  private baseUrl = 'https://api.mightycall.com';
  private email = 'traffikboosters@gmail.com';

  async getStatus(): Promise<MightyCallStatus> {
    return {
      connected: true,
      apiAccess: true,
      accountId: this.accountId,
      integrationLevel: 'Core Plan',
      message: 'MightyCall Core Plan - Manual dialing available'
    };
  }

  async initiateCall(request: CallRequest): Promise<CallResponse> {
    const cleanPhone = this.cleanPhoneNumber(request.phoneNumber);
    const displayNumber = this.formatPhoneNumber(cleanPhone);
    const callId = `tb_call_${Date.now()}`;
    
    // Generate multiple call options for Core plan
    const dialString = `tel:${cleanPhone}`;
    const sipUrl = `sip:${cleanPhone}@mightycall.com`;
    
    const instructions = this.generateCallInstructions({
      connected: true,
      apiAccess: true,
      accountId: this.accountId,
      integrationLevel: 'Core Plan',
      message: 'Manual dialing required for Core plan'
    });

    return {
      success: true,
      callId,
      displayNumber,
      dialString,
      sipUrl,
      instructions,
      timestamp: new Date().toISOString()
    };
  }

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = this.cleanPhoneNumber(phone);
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }

  generateCallInstructions(status: MightyCallStatus): string {
    const instructions = [
      `MightyCall Integration: ${status.integrationLevel}`,
      `Account: ${status.accountId}`,
      `Status: ${status.message}`,
      '',
      'Call Options:',
      '• Click phone number to dial directly',
      '• Use SIP client for VoIP calling',
      '• Manual dial from MightyCall dashboard',
      '',
      'Core Plan Features:',
      '• Professional caller ID',
      '• Call recording available',
      '• Voicemail to email',
      '• Multiple extensions',
      '',
      'Support: (877) 840-6250'
    ];

    return instructions.join('\n');
  }
}

export const mightyCallEnhanced = new MightyCallEnhanced();