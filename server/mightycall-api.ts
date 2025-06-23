import crypto from 'crypto';

export interface MightyCallConfig {
  apiKey: string;
  secretKey: string;
  environment: 'sandbox' | 'api'; // sandbox for testing, api for production
  version: string; // v4 is latest
}

export interface MightyCallResponse {
  success: boolean;
  data?: any;
  error?: string;
  status: number;
}

export class MightyCallAPI {
  private config: MightyCallConfig;
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: MightyCallConfig) {
    this.config = config;
  }

  private generateAuthToken(): string {
    // Generate auth_token based on api_key and secret_key
    // Using HMAC-SHA256 as commonly used for API token generation
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${this.config.apiKey}:${timestamp}`;
    const authToken = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(message)
      .digest('hex');
    
    return authToken;
  }

  private async ensureValidToken(): Promise<string> {
    const now = new Date();
    
    // Generate new token if expired or doesn't exist (24-hour lifetime)
    if (!this.authToken || !this.tokenExpiry || now >= this.tokenExpiry) {
      this.authToken = this.generateAuthToken();
      this.tokenExpiry = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours to be safe
    }
    
    return this.authToken;
  }

  private getBaseUrl(): string {
    return `https://${this.config.environment}.mightycall.com/${this.config.version}/api`;
  }

  async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<MightyCallResponse> {
    try {
      const authToken = await this.ensureValidToken();
      const url = `${this.getBaseUrl()}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        'X-Auth-Token': authToken
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = await response.json().catch(() => ({}));

      return {
        success: response.ok,
        data: responseData,
        status: response.status,
        error: response.ok ? undefined : responseData.message || `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }

  // Test API connectivity
  async ping(): Promise<MightyCallResponse> {
    return this.makeRequest('/ping');
  }

  // Get account information
  async getAccount(): Promise<MightyCallResponse> {
    return this.makeRequest('/account');
  }

  // Initiate a call
  async initiateCall(fromNumber: string, toNumber: string, options?: {
    callerId?: string;
    extension?: string;
  }): Promise<MightyCallResponse> {
    const callData = {
      from: fromNumber,
      to: toNumber,
      caller_id: options?.callerId,
      extension: options?.extension
    };

    return this.makeRequest('/calls/initiate', 'POST', callData);
  }

  // Get call history
  async getCallHistory(params?: {
    limit?: number;
    offset?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<MightyCallResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.dateFrom) queryParams.set('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.set('date_to', params.dateTo);
    
    const endpoint = `/calls${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Get phone numbers associated with account
  async getPhoneNumbers(): Promise<MightyCallResponse> {
    return this.makeRequest('/phone-numbers');
  }
}

// Create singleton instance
export function createMightyCallAPI(): MightyCallAPI | null {
  const apiKey = process.env.MIGHTYCALL_API_KEY;
  const secretKey = process.env.MIGHTYCALL_SECRET_KEY; // We'll need this from user
  
  if (!apiKey || !secretKey) {
    console.warn('MightyCall API credentials not fully configured');
    return null;
  }

  return new MightyCallAPI({
    apiKey,
    secretKey,
    environment: 'api', // Use production environment
    version: 'v4'
  });
}