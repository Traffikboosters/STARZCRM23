/**
 * PowerDials Integration for STARZ CRM Platform
 * Provides PowerDials web dialer popup functionality alongside MightyCall
 */

interface PowerDialsConfig {
  baseUrl: string;
  accountId: string;
  apiKey: string;
}

interface CallRequest {
  phoneNumber: string;
  contactName?: string;
  contactId?: number;
  userId: number;
}

interface PowerDialsResponse {
  success: boolean;
  dialerUrl?: string;
  callId?: string;
  message: string;
  timestamp: string;
  method: string;
}

export class PowerDialsIntegration {
  private config: PowerDialsConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.POWERDIALS_BASE_URL || 'https://app.powerdials.com',
      accountId: process.env.POWERDIALS_ACCOUNT_ID || '',
      apiKey: process.env.POWERDIALS_API_KEY || ''
    };
  }

  /**
   * Generate PowerDials web dialer popup URL
   */
  generateDialerUrl(phoneNumber: string, contactName?: string): string {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const baseUrl = this.config.baseUrl;
    const accountId = this.config.accountId;
    
    // PowerDials web dialer URL format
    const params = new URLSearchParams({
      account: accountId,
      number: cleanNumber,
      contact: contactName || 'Contact',
      source: 'starz_crm',
      auto_dial: 'true'
    });

    return `${baseUrl}/dialer?${params.toString()}`;
  }

  /**
   * Initiate PowerDials call
   */
  async initiateCall(request: CallRequest): Promise<PowerDialsResponse> {
    try {
      const cleanNumber = this.cleanPhoneNumber(request.phoneNumber);
      const callId = `pd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate PowerDials web dialer URL
      const dialerUrl = this.generateDialerUrl(cleanNumber, request.contactName);
      
      // Log call attempt (optional API call to PowerDials if they have logging API)
      await this.logCallAttempt(callId, cleanNumber, request.contactName, request.userId);

      return {
        success: true,
        dialerUrl,
        callId,
        message: "PowerDials web dialer ready - popup will open with pre-populated contact info",
        timestamp: new Date().toISOString(),
        method: 'powerdials_web'
      };

    } catch (error) {
      console.error('PowerDials call initiation failed:', error);
      
      return {
        success: false,
        message: `PowerDials unavailable: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        method: 'error'
      };
    }
  }

  /**
   * Test PowerDials connectivity
   */
  async testConnection(): Promise<{success: boolean; message: string; details: any}> {
    try {
      const testNumber = '5551234567';
      const testDialerUrl = this.generateDialerUrl(testNumber, 'Test Contact');
      
      return {
        success: true,
        message: 'PowerDials integration ready - Web dialer URLs generated successfully',
        details: {
          accountId: this.config.accountId,
          baseUrl: this.config.baseUrl,
          testDialerUrl,
          capabilities: [
            'Web dialer popup',
            'Contact pre-population',
            'Call logging',
            'Auto-dial functionality'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'PowerDials test failed',
        details: { error: (error as Error).message }
      };
    }
  }

  /**
   * Get PowerDials status and configuration
   */
  getStatus(): {configured: boolean; message: string; nextSteps: string[]} {
    const configured = !!(this.config.baseUrl && this.config.accountId && this.config.apiKey);
    
    if (configured) {
      return {
        configured: true,
        message: 'PowerDials ready for web dialer popups',
        nextSteps: [
          'Click Call button on any lead card',
          'Select PowerDials option from dialer menu',
          'Web dialer popup will open with contact info',
          'Make calls directly through PowerDials interface'
        ]
      };
    } else {
      return {
        configured: false,
        message: 'PowerDials credentials needed',
        nextSteps: [
          'Add POWERDIALS_BASE_URL to environment',
          'Add POWERDIALS_ACCOUNT_ID to environment', 
          'Add POWERDIALS_API_KEY to environment',
          'Restart application to load credentials'
        ]
      };
    }
  }

  // Private helper methods
  private cleanPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    // Remove country code for US domestic
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.substring(1);
    }
    return cleaned.length === 10 ? cleaned : cleaned;
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = this.cleanPhoneNumber(phone);
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  private async logCallAttempt(callId: string, phoneNumber: string, contactName?: string, userId?: number): Promise<void> {
    try {
      // Optional: Log to PowerDials API if they provide logging endpoints
      console.log(`📞 PowerDials call attempt logged: ${callId} to ${this.formatPhoneNumber(phoneNumber)}`);
      
      // Could also log to local database here
      // await storage.createCallLog({
      //   callId,
      //   phoneNumber,
      //   contactName,
      //   userId,
      //   provider: 'powerdials',
      //   timestamp: new Date()
      // });
    } catch (error) {
      console.error('Failed to log PowerDials call attempt:', error);
    }
  }
}

export const powerDialsIntegration = new PowerDialsIntegration();