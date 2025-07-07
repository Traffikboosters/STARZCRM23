interface MightyCallClientConfig {
  apiKey?: string;
  debug?: boolean;
  baseUrl?: string;
  timeout?: number;
}

interface MightyCallResponse {
  success: boolean;
  callId?: string;
  dialerUrl?: string;
  sipUrl?: string;
  message?: string;
  error?: string;
}

class MightyCallClient {
  private config: MightyCallClientConfig;
  private initialized: boolean = false;

  constructor() {
    this.config = {
      debug: import.meta.env.DEV || false,
      baseUrl: '/api',
      timeout: 10000
    };
  }

  /**
   * Initialize MightyCall client with secure token from backend
   */
  async init(options: MightyCallClientConfig = {}): Promise<void> {
    try {
      this.config = { ...this.config, ...options };
      
      if (this.config.debug) {
        console.log('🔧 Initializing MightyCall Client...', {
          baseUrl: this.config.baseUrl,
          timeout: this.config.timeout,
          timestamp: new Date().toISOString()
        });
      }

      // Verify backend connectivity
      const response = await fetch('/api/powerdials/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Backend connectivity failed: ${response.status}`);
      }

      const status = await response.json();
      
      if (this.config.debug) {
        console.log('✅ MightyCall Backend Status:', status);
      }

      this.initialized = true;
      
      if (this.config.debug) {
        console.log('🎉 MightyCall Client initialized successfully');
      }

    } catch (error) {
      if (this.config.debug) {
        console.error('❌ MightyCall Client initialization failed:', error);
      }
      throw error;
    }
  }

  /**
   * Initiate outbound call with comprehensive error handling
   */
  async initiateCall(phoneNumber: string, contactName?: string, contactId?: number): Promise<MightyCallResponse> {
    if (!this.initialized) {
      throw new Error('MightyCall client not initialized. Call init() first.');
    }

    try {
      if (this.config.debug) {
        console.log('📞 Initiating call:', {
          phoneNumber: phoneNumber.replace(/\d/g, '*'),
          contactName,
          contactId,
          timestamp: new Date().toISOString()
        });
      }

      const response = await fetch('/api/powerdials/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          contactName,
          contactId,
          userId: 1
        }),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`Call initiation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (this.config.debug) {
        console.log('📞 Call response:', {
          success: result.success,
          hasDialerUrl: !!result.dialerUrl,
          method: result.method || 'unknown'
        });
      }

      return result;

    } catch (error) {
      if (this.config.debug) {
        console.error('❌ Call initiation error:', error);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get MightyCall system status
   */
  async getStatus(): Promise<any> {
    try {
      const response = await fetch('/api/powerdials/status');
      return await response.json();
    } catch (error) {
      if (this.config.debug) {
        console.error('❌ Status check failed:', error);
      }
      throw error;
    }
  }

  /**
   * Check if client is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.config.debug = enabled;
  }

  /**
   * Fallback to device dialer with tracking
   */
  fallbackToDeviceDialer(phoneNumber: string, contactName?: string): void {
    if (this.config.debug) {
      console.log('📱 Falling back to device dialer:', {
        phoneNumber: phoneNumber.replace(/\d/g, '*'),
        contactName
      });
    }

    try {
      window.open(`tel:${phoneNumber}`, '_self');
    } catch (error) {
      if (this.config.debug) {
        console.error('❌ Device dialer fallback failed:', error);
      }
    }
  }
}

// Export singleton instance
export const mightyCallClient = new MightyCallClient();

// Auto-initialize with debug mode in development
if (import.meta.env.DEV) {
  mightyCallClient.init({ debug: true }).catch(console.error);
}

export default mightyCallClient;