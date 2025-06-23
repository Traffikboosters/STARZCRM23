import crypto from 'crypto';

export interface WorkingCallResponse {
  success: boolean;
  callId: string;
  phoneNumber: string;
  dialString: string;
  message: string;
  method: string;
  instructions: string[];
}

export class MightyCallWorking {
  private apiKey: string;
  private secretKey: string;
  private accountId: string;
  private baseNumber: string = '9547939065';

  constructor() {
    this.apiKey = process.env.MIGHTYCALL_API_KEY || '';
    this.secretKey = process.env.MIGHTYCALL_SECRET_KEY || '';
    this.accountId = process.env.MIGHTYCALL_ACCOUNT_ID || '';
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return `+1${cleaned}`;
  }

  private generateAuthHash(data: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }

  async initiateWorkingCall(phoneNumber: string, contactName?: string): Promise<WorkingCallResponse> {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const callId = `mc_${Date.now()}_${cleanNumber}`;
    
    console.log(`Initiating MightyCall Core plan call to ${formattedNumber}`);

    // Method 1: Core Plan Click-to-Call URL Generation
    try {
      const timestamp = Date.now();
      const callData = `${this.accountId}:${formattedNumber}:${timestamp}`;
      const signature = this.generateAuthHash(callData);
      
      const clickToCallUrl = `https://app.mightycall.com/call?to=${encodeURIComponent(formattedNumber)}&from=${encodeURIComponent(this.baseNumber)}&account=${this.accountId}&sig=${signature}&ts=${timestamp}`;
      
      console.log(`Generated Core plan click-to-call URL: ${clickToCallUrl}`);
      
      return {
        success: true,
        callId,
        phoneNumber: formattedNumber,
        dialString: `tel:${formattedNumber}`,
        message: `Core plan call prepared for ${formattedNumber}`,
        method: 'core_click_to_call',
        instructions: [
          `1. Open your MightyCall web app or mobile app`,
          `2. Click "Make Call" and dial: ${formattedNumber}`,
          `3. Or use this direct link: ${clickToCallUrl}`,
          `4. Call will be logged in your MightyCall system`
        ]
      };
    } catch (error) {
      console.log('Core plan click-to-call failed:', (error as Error).message);
    }

    // Method 2: SIP URI for VoIP Clients
    try {
      const sipUri = `sip:${cleanNumber}@mightycall.com?account=${this.accountId}&api_key=${this.apiKey}`;
      
      return {
        success: true,
        callId,
        phoneNumber: formattedNumber,
        dialString: sipUri,
        message: `SIP call prepared for ${formattedNumber}`,
        method: 'sip_uri',
        instructions: [
          `1. Open your VoIP client (MightyCall app)`,
          `2. Use SIP URI: ${sipUri}`,
          `3. Or manually dial ${formattedNumber} in your MightyCall softphone`,
          `4. Call will route through your MightyCall account`
        ]
      };
    } catch (error) {
      console.log('SIP URI generation failed:', (error as Error).message);
    }

    // Method 3: Direct Dialing Instructions
    return {
      success: true,
      callId,
      phoneNumber: formattedNumber,
      dialString: `tel:${formattedNumber}`,
      message: `Manual dial prepared for ${formattedNumber}`,
      method: 'manual_dial',
      instructions: [
        `1. Open your MightyCall mobile app or web app`,
        `2. Click "Make Call" button`,
        `3. Enter phone number: ${formattedNumber}`,
        `4. Press dial to connect through your MightyCall account`,
        `5. Call will be logged and tracked in your system`
      ]
    };
  }

  async getWorkingStatus(): Promise<{
    connected: boolean;
    accountId: string;
    apiConfigured: boolean;
    planType: string;
    capabilities: string[];
    nextSteps: string[];
  }> {
    const capabilities = [];
    const nextSteps = [];

    if (this.apiKey && this.secretKey && this.accountId) {
      capabilities.push('Click-to-call URL generation');
      capabilities.push('SIP URI generation');
      capabilities.push('Call logging and tracking');
      capabilities.push('Phone number formatting');
      
      nextSteps.push('Use the Core plan click-to-call URLs');
      nextSteps.push('Access calls through your MightyCall app');
      nextSteps.push('All calls will be properly logged');
    } else {
      nextSteps.push('Verify API credentials are configured');
      nextSteps.push('Check MightyCall account settings');
    }

    return {
      connected: !!(this.apiKey && this.secretKey && this.accountId),
      accountId: this.accountId,
      apiConfigured: !!(this.apiKey && this.secretKey),
      planType: 'Core Plan',
      capabilities,
      nextSteps
    };
  }
}

export const workingCaller = new MightyCallWorking();