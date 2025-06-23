import crypto from 'crypto';

interface CorePlanTestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  response: any;
  error?: string;
}

export class MightyCallCorePlanTester {
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
    const data = `${this.apiKey}${this.secretKey}${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async testCorePlanEndpoints(): Promise<CorePlanTestResult[]> {
    const results: CorePlanTestResult[] = [];
    
    // Core plan endpoints to test
    const endpoints = [
      {
        name: 'Core Plan Call Initiation v4',
        url: 'https://api.mightycall.com/v4/calls',
        method: 'POST'
      },
      {
        name: 'Core Plan Call Initiation v4 Alt',
        url: 'https://api.mightycall.com/v4/api/calls',
        method: 'POST'
      },
      {
        name: 'Core Plan Legacy v3',
        url: 'https://api.mightycall.com/api/v3/calls',
        method: 'POST'
      },
      {
        name: 'Core Plan Direct Call',
        url: 'https://api.mightycall.com/call',
        method: 'POST'
      },
      {
        name: 'Core Plan Account Calls',
        url: `https://api.mightycall.com/v4/accounts/${this.accountId}/calls`,
        method: 'POST'
      }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n=== Testing ${endpoint.name} ===`);
        
        const authToken = this.generateAuthToken();
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Test multiple authentication methods
        const authMethods = [
          {
            name: 'X-API-Key + X-Secret-Key',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.apiKey,
              'X-Secret-Key': this.secretKey,
              'X-Account-ID': this.accountId
            } as Record<string, string>
          },
          {
            name: 'Authorization Bearer',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
              'X-Account-ID': this.accountId
            } as Record<string, string>
          },
          {
            name: 'API Key + Hash Auth',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.apiKey,
              'X-Auth-Token': authToken,
              'X-Timestamp': timestamp.toString(),
              'X-Account-ID': this.accountId
            } as Record<string, string>
          }
        ];

        for (const auth of authMethods) {
          try {
            console.log(`Testing with ${auth.name}...`);
            
            const response = await fetch(endpoint.url, {
              method: endpoint.method,
              headers: auth.headers,
              body: JSON.stringify({
                to: '+19547939065',
                from: '+19547939065',
                account_id: this.accountId
              })
            });

            const responseText = await response.text();
            let parsedResponse;
            
            try {
              parsedResponse = JSON.parse(responseText);
            } catch {
              parsedResponse = responseText;
            }

            console.log(`${endpoint.name} (${auth.name}): ${response.status} - ${responseText.substring(0, 200)}`);

            results.push({
              endpoint: `${endpoint.name} (${auth.name})`,
              method: endpoint.method,
              status: response.status,
              success: response.ok,
              response: parsedResponse,
              error: response.ok ? undefined : responseText
            });

            // If we get success, break from auth methods
            if (response.ok) {
              console.log(`SUCCESS with ${auth.name}!`);
              break;
            }

          } catch (error) {
            console.log(`${endpoint.name} (${auth.name}) ERROR:`, (error as Error).message);
            results.push({
              endpoint: `${endpoint.name} (${auth.name})`,
              method: endpoint.method,
              status: 0,
              success: false,
              response: null,
              error: (error as Error).message
            });
          }
        }

      } catch (error) {
        console.log(`${endpoint.name} OVERALL ERROR:`, (error as Error).message);
        results.push({
          endpoint: endpoint.name,
          method: endpoint.method,
          status: 0,
          success: false,
          response: null,
          error: (error as Error).message
        });
      }
    }

    return results;
  }

  async generateCorePlanReport(): Promise<{
    accountId: string;
    apiKeyPresent: boolean;
    secretKeyPresent: boolean;
    testResults: CorePlanTestResult[];
    recommendations: string[];
  }> {
    console.log('\n=== MightyCall Core Plan Diagnostic Report ===');
    console.log(`Account ID: ${this.accountId}`);
    console.log(`API Key: ${this.apiKey ? 'Present' : 'Missing'}`);
    console.log(`Secret Key: ${this.secretKey ? 'Present' : 'Missing'}`);

    const testResults = await this.testCorePlanEndpoints();
    const recommendations: string[] = [];

    // Analyze results
    const successfulCalls = testResults.filter(r => r.success);
    const authErrors = testResults.filter(r => r.status === 401);
    const notFoundErrors = testResults.filter(r => r.status === 404);
    const serverErrors = testResults.filter(r => r.status >= 500);

    if (successfulCalls.length > 0) {
      recommendations.push(`SUCCESS: Found working endpoint: ${successfulCalls[0].endpoint}`);
    } else if (authErrors.length > 0) {
      recommendations.push('ISSUE: Authentication failed - verify API credentials in MightyCall dashboard');
    } else if (notFoundErrors.length > 0) {
      recommendations.push('ISSUE: API endpoints not found - Core plan may use different endpoint structure');
    } else if (serverErrors.length > 0) {
      recommendations.push('ISSUE: MightyCall server errors - service may be temporarily unavailable');
    } else {
      recommendations.push('ISSUE: No successful API calls - may need to contact MightyCall support for Core plan API access');
    }

    return {
      accountId: this.accountId,
      apiKeyPresent: !!this.apiKey,
      secretKeyPresent: !!this.secretKey,
      testResults,
      recommendations
    };
  }
}

export const corePlanTester = new MightyCallCorePlanTester();