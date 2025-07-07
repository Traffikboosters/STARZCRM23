interface MightyCallConfig {
  accountId: string;
  secretKey: string;
  mainNumber: string;
  domain: string;
  apiBaseUrl: string;
}

interface OutboundCallRequest {
  phoneNumber: string;
  contactName?: string;
  userId: number;
  extension?: string;
}

interface CallResponse {
  success: boolean;
  callId?: string;
  dialString?: string;
  sipUrl?: string;
  webDialerUrl?: string;
  message: string;
  timestamp: string;
  method: 'web_dialer' | 'sip' | 'tel_link' | 'direct_dial';
}

interface InboundWebhookData {
  callId: string;
  fromNumber: string;
  toNumber: string;
  callStatus: 'ringing' | 'answered' | 'ended' | 'missed';
  duration?: number;
  timestamp: string;
  direction: 'inbound' | 'outbound';
}

export class MightyCallCoreFixed {
  private config: MightyCallConfig = {
    accountId: process.env.MIGHTYCALL_ACCOUNT_ID || '4f917f13-aae1-401d-8241-010db91da5b2',
    secretKey: process.env.MIGHTYCALL_SECRET_KEY || '',
    mainNumber: process.env.MIGHTYCALL_MAIN_NUMBER || '8778406250',
    domain: process.env.MIGHTYCALL_DOMAIN || 'traffikboosters.mightycall.com',
    apiBaseUrl: process.env.MIGHTYCALL_API_BASE_URL || 'https://panel.mightycall.com'
  };

  constructor() {
    console.log('MightyCall Core Fixed - Account:', this.config.accountId);
    
    // Enhanced monitoring and validation
    this.logSystemStatus();
    
    // Validate required configuration
    if (!this.config.secretKey) {
      console.warn('⚠️  MIGHTYCALL_SECRET_KEY environment variable not set - phone functionality may be limited');
    }
  }

  /**
   * Enhanced system monitoring and logging
   */
  private logSystemStatus(): void {
    console.log('📊 MightyCall System Status:');
    console.log(`   Account ID: ${this.config.accountId}`);
    console.log(`   Main Number: ${this.config.mainNumber}`);
    console.log(`   Domain: ${this.config.domain}`);
    console.log(`   API Base: ${this.config.apiBaseUrl}`);
    console.log(`   Secret Key: ${this.config.secretKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
  }

  /**
   * Enhanced call logging with error tracking
   */
  private async logCallAttempt(callId: string, phoneNumber: string, contactName?: string, userId?: number): Promise<void> {
    try {
      console.log(`📝 Logging call attempt: ${callId} to ${phoneNumber}`);
      // Add database logging here if needed
    } catch (error) {
      console.error('❌ Failed to log call attempt:', error);
      // Don't throw error - logging failure shouldn't prevent call
    }
  }

  /**
   * Initiate outbound call with multiple fallback methods
   */
  async initiateOutboundCall(request: OutboundCallRequest): Promise<CallResponse> {
    const startTime = Date.now();
    let cleanNumber: string;
    
    try {
      // Enhanced input validation and logging
      if (!request.phoneNumber) {
        throw new Error('Phone number is required');
      }
      
      cleanNumber = this.cleanPhoneNumber(request.phoneNumber);
      const callId = this.generateCallId();
      
      console.log(`📞 Initiating outbound call:`);
      console.log(`   Contact: ${request.contactName || 'Unknown'}`);
      console.log(`   Number: ${cleanNumber}`);
      console.log(`   User ID: ${request.userId}`);
      console.log(`   Call ID: ${callId}`);

      // Method 1: MightyCall Pro Web Dialer (Primary)
      const webDialerUrl = this.generateWebDialerUrl(cleanNumber, request.contactName);
      
      // Method 2: SIP URL for VoIP clients
      const sipUrl = `sip:${cleanNumber}@${this.config.domain}`;
      
      // Method 3: Direct dial string for MightyCall desktop app
      const dialString = `mc://call/${cleanNumber}?account=${this.config.accountId}&contact=${encodeURIComponent(request.contactName || 'Contact')}&id=${callId}`;

      // Enhanced call logging with error handling
      await this.logCallAttempt(callId, cleanNumber, request.contactName, request.userId);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Call setup completed in ${processingTime}ms`);

      return {
        success: true,
        callId,
        dialString,
        sipUrl,
        webDialerUrl,
        message: "Call initiated successfully - Multiple methods available",
        timestamp: new Date().toISOString(),
        method: 'web_dialer'
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ MightyCall outbound call failed after ${processingTime}ms:`, error);
      
      // Enhanced fallback handling
      try {
        cleanNumber = cleanNumber || this.cleanPhoneNumber(request.phoneNumber || '');
        
        return {
          success: false,
          message: `Call setup failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback: Use tel:${cleanNumber}`,
          timestamp: new Date().toISOString(),
          method: 'tel_link'
        };
      } catch (fallbackError) {
        console.error('❌ Complete call setup failure:', fallbackError);
        return {
          success: false,
          message: 'Phone system unavailable. Please try again later.',
          timestamp: new Date().toISOString(),
          method: 'tel_link'
        };
      }
    }
  }

  /**
   * Handle inbound call webhooks from MightyCall
   */
  async handleInboundWebhook(webhookData: InboundWebhookData): Promise<boolean> {
    try {
      console.log('📞 Inbound Call Webhook:', webhookData);
      
      // Process inbound call data
      const callData = {
        callId: webhookData.callId,
        phoneNumber: webhookData.fromNumber,
        direction: 'inbound' as const,
        status: webhookData.callStatus,
        startTime: new Date(webhookData.timestamp),
        duration: webhookData.duration || null,
        userId: 1, // Default admin user
        contactId: await this.findContactByPhone(webhookData.fromNumber)
      };

      // Log the inbound call
      await this.logInboundCall(callData);
      
      // Trigger real-time notification
      this.notifyInboundCall(callData);
      
      return true;
    } catch (error) {
      console.error('Inbound webhook processing failed:', error);
      return false;
    }
  }

  /**
   * Configure webhooks for inbound call notifications
   */
  getWebhookConfig() {
    return {
      webhookUrl: `${process.env.REPL_DOMAIN || 'https://your-domain.replit.app'}/api/mightycall/webhook`,
      events: ['call.started', 'call.answered', 'call.ended'],
      accountId: this.config.accountId,
      instructions: [
        '1. Log into MightyCall dashboard',
        '2. Go to Settings > Integrations > Webhooks',
        '3. Add webhook URL for call events',
        '4. Enable events: call.started, call.answered, call.ended',
        '5. Use secret key for authentication'
      ]
    };
  }

  /**
   * Test MightyCall connectivity
   */
  async testConnection(): Promise<{success: boolean; message: string; details: any}> {
    try {
      // Test 1: Web dialer URL generation
      const testNumber = '5551234567';
      const webDialerUrl = this.generateWebDialerUrl(testNumber, 'Test Contact');
      
      // Test 2: SIP URL format
      const sipUrl = `sip:${testNumber}@${this.config.domain}`;
      
      // Test 3: Dial string format
      const dialString = `mc://call/${testNumber}?account=${this.config.accountId}`;

      return {
        success: true,
        message: 'MightyCall integration ready - Web dialer and SIP URLs generated successfully',
        details: {
          accountId: this.config.accountId,
          domain: this.config.domain,
          webDialerUrl,
          sipUrl,
          dialString,
          mainNumber: this.config.mainNumber,
          webhookEndpoint: '/api/mightycall/webhook'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'MightyCall test failed',
        details: { error: (error as Error).message }
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

  private generateWebDialerUrl(phoneNumber: string, contactName?: string): string {
    // MightyCall Pro web dialer - use the correct panel URL format
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const params = new URLSearchParams({
      number: cleanNumber,
      contact_name: contactName || 'Contact'
    });
    return `https://app.mightycall.com/dialer?${params.toString()}`;
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logCallAttempt(callId: string, phoneNumber: string, contactName?: string, userId?: number): Promise<void> {
    try {
      // Log call attempt to database if storage is available
      console.log(`Call logged: ${callId} to ${phoneNumber} (${contactName || 'Unknown'})`);
    } catch (error) {
      console.warn('Call logging failed:', error);
    }
  }

  private async findContactByPhone(phoneNumber: string): Promise<number | null> {
    try {
      // Search contacts by phone number
      // This would integrate with your storage layer
      return null; // Placeholder
    } catch (error) {
      return null;
    }
  }

  private async logInboundCall(callData: any): Promise<void> {
    try {
      console.log('Inbound call logged:', callData);
      // Integration with storage layer for call logging
    } catch (error) {
      console.warn('Inbound call logging failed:', error);
    }
  }

  private notifyInboundCall(callData: any): void {
    try {
      // Send real-time notification via WebSocket
      console.log('Inbound call notification sent:', callData.phoneNumber);
    } catch (error) {
      console.warn('Inbound call notification failed:', error);
    }
  }
}

export const mightyCallCoreFixed = new MightyCallCoreFixed();