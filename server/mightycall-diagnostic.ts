// MightyCall API Diagnostic Tool
// Comprehensive testing of MightyCall integration for Traffik Boosters

export interface MightyCallDiagnostic {
  accountId: string;
  apiKey: string;
  targetNumber: string;
  timestamp: Date;
  results: DiagnosticResult[];
  recommendation: string;
}

export interface DiagnosticResult {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  error?: string;
  success: boolean;
}

export class MightyCallDiagnostics {
  private apiKey: string;
  private accountId: string;

  constructor(apiKey: string, accountId: string) {
    this.apiKey = apiKey;
    this.accountId = accountId;
  }

  async runComprehensiveDiagnostic(phoneNumber: string): Promise<MightyCallDiagnostic> {
    const results: DiagnosticResult[] = [];
    const startTime = Date.now();

    // Test 1: Account verification
    const accountResult = await this.testEndpoint(
      'https://api.mightycall.com/v1/account',
      'GET',
      { 'Authorization': `Bearer ${this.apiKey}` }
    );
    results.push(accountResult);

    // Test 2: Alternative account endpoints
    const altAccountResult = await this.testEndpoint(
      'https://app.mightycall.com/api/account/info',
      'GET',
      { 'X-API-Key': this.apiKey }
    );
    results.push(altAccountResult);

    // Test 3: Call initiation endpoints
    const callEndpoints = [
      {
        url: 'https://api.mightycall.com/v2/calls/initiate',
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: { to: `+1${phoneNumber}`, from: this.accountId }
      },
      {
        url: 'https://api.mightycall.com/v1/calls',
        headers: { 'X-API-Key': this.apiKey, 'Content-Type': 'application/json' },
        body: { phone_number: `+1${phoneNumber}`, account_id: this.accountId }
      },
      {
        url: 'https://app.mightycall.com/api/calls/click-to-call',
        headers: { 'Authorization': `Token ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: { number: `+1${phoneNumber}`, account: this.accountId }
      }
    ];

    for (const endpoint of callEndpoints) {
      const result = await this.testEndpoint(
        endpoint.url,
        'POST',
        endpoint.headers,
        JSON.stringify(endpoint.body)
      );
      results.push(result);
    }

    // Test 4: Webhook endpoints
    const webhookResult = await this.testEndpoint(
      'https://hooks.mightycall.com/call/trigger',
      'POST',
      { 'Content-Type': 'application/x-www-form-urlencoded', 'X-MightyCall-Token': this.apiKey },
      new URLSearchParams({
        account: this.accountId,
        number: `+1${phoneNumber}`,
        action: 'initiate_call'
      }).toString()
    );
    results.push(webhookResult);

    const recommendation = this.generateRecommendation(results);

    return {
      accountId: this.accountId,
      apiKey: this.apiKey ? 'Present' : 'Missing',
      targetNumber: phoneNumber,
      timestamp: new Date(),
      results,
      recommendation
    };
  }

  private async testEndpoint(
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: string
  ): Promise<DiagnosticResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method,
        headers,
        body
      });

      const responseTime = Date.now() - startTime;
      const responseText = await response.text();

      return {
        endpoint: url,
        method,
        status: response.status,
        responseTime,
        success: response.ok,
        error: response.ok ? undefined : responseText
      };
    } catch (error) {
      return {
        endpoint: url,
        method,
        status: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateRecommendation(results: DiagnosticResult[]): string {
    const successfulResults = results.filter(r => r.success);
    const authErrors = results.filter(r => r.status === 401 || r.status === 403);
    const notFoundErrors = results.filter(r => r.status === 404);

    if (successfulResults.length > 0) {
      return 'SUCCESS: Found working MightyCall endpoint. Integration should work normally.';
    }

    if (authErrors.length > 0) {
      return 'AUTHENTICATION ISSUE: API credentials appear to be invalid or expired. Please verify your MightyCall API key and account ID in the dashboard.';
    }

    if (notFoundErrors.length === results.length) {
      return 'API ACCESS ISSUE: All endpoints return 404. This suggests:\n1. API access may not be enabled for your MightyCall account\n2. Account may be on a plan that doesn\'t include API access\n3. API endpoints may have changed\n\nRecommendation: Contact MightyCall support to verify API access.';
    }

    return 'CONNECTIVITY ISSUE: Unable to reach MightyCall servers. This may be a temporary network issue or service outage.';
  }
}