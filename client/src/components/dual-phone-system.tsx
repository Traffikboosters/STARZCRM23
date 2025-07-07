import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Phone, Settings, Activity, History, Users, PhoneCall, 
  CheckCircle, XCircle, Clock, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { mightyCallClient } from "@/lib/mightycall-client";
import MightyCallDialer from "./mightycall-dialer";
import PowerDials from "./powerdials-component";

interface PhoneSystemStatus {
  configured: boolean;
  message: string;
  nextSteps?: string[];
  testResult?: {
    success: boolean;
    message: string;
    details?: any;
  };
}

interface CallRequest {
  phoneNumber: string;
  contactName?: string;
  contactId?: number;
}

export default function DualPhoneSystem() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [dialerInitialized, setDialerInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Query PowerDials status
  const { data: powerDialsStatus, refetch: refetchPowerDials } = useQuery({
    queryKey: ['/api/powerdials/status'],
  });

  // Type guard for PowerDials status
  const isPowerDialsConfigured = (status: any): boolean => {
    return status && typeof status === 'object' && 'configured' in status && status.configured;
  };

  // Initialize dialer with enhanced MightyCall client
  useEffect(() => {
    const initializeDialer = async () => {
      try {
        console.log('🔧 Initializing enhanced phone dialer system...');
        setConnectionStatus('checking');
        
        // Check microphone permissions
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('🎤 Microphone permission granted');
          } catch (permissionError) {
            console.warn('🎤 Microphone permission denied or not available');
            toast({
              title: "Microphone Access",
              description: "Microphone access recommended for optimal call quality",
              variant: "default"
            });
          }
        }

        // Initialize enhanced MightyCall client
        await mightyCallClient.init({ 
          debug: true,
          timeout: 15000
        });

        // Verify client status
        const status = await mightyCallClient.getStatus();
        if (isPowerDialsConfigured(status)) {
          setConnectionStatus('connected');
          setDialerInitialized(true);
          console.log('✅ Enhanced MightyCall system initialized successfully');
          setRetryCount(0);
        } else {
          throw new Error('MightyCall client not properly configured');
        }
      } catch (error) {
        console.error('❌ Enhanced dialer initialization failed:', error);
        setConnectionStatus('error');
        
        if (retryCount < MAX_RETRIES) {
          console.log(`🔄 Retrying enhanced dialer initialization (${retryCount + 1}/${MAX_RETRIES})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => initializeDialer(), 2000 * (retryCount + 1)); // Exponential backoff
        } else {
          toast({
            title: "Phone System Error",
            description: "Unable to initialize enhanced phone system. Please check connection.",
            variant: "destructive"
          });
        }
      }
    };

    initializeDialer();
  }, [retryCount, toast]);

  const testPowerDialsConnection = async () => {
    try {
      const response = await fetch('/api/powerdials/status');
      const result = await response.json();
      toast({
        title: "PowerDials System Test",
        description: result.configured ? "PowerDials system ready" : result.message,
        variant: result.configured ? "default" : "destructive",
      });
      refetchPowerDials();
    } catch (error) {
      toast({
        title: "PowerDials Test Failed",
        description: "Unable to test PowerDials connection",
        variant: "destructive",
      });
    }
  };

  const makeTestCall = async (mode: 'web' | 'desktop') => {
    const testNumber = '8778406250'; // Traffik Boosters number
    
    // Check if dialer is initialized
    if (!dialerInitialized || connectionStatus !== 'connected') {
      toast({
        title: "Phone System Not Ready",
        description: "Please wait for the phone system to initialize",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log(`📞 Initiating ${mode} call to ${testNumber}`);
      
      const response = await fetch('/api/powerdials/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testNumber,
          contactName: 'PowerDials Test Call',
          userId: 1,
          mode: mode
        })
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📞 Call API response:', result);
      
      if (result.success) {
        if (mode === 'web' && result.dialerUrl) {
          window.open(result.dialerUrl, 'PowerDialsDialer', 'width=800,height=600,scrollbars=yes,resizable=yes');
        } else {
          window.open(`tel:${testNumber}`, '_self');
        }
        
        toast({
          title: `PowerDials ${mode === 'web' ? 'Web' : 'Desktop'} Call`,
          description: `Test call initiated to ${testNumber}`,
        });
      } else {
        throw new Error(result.message || 'Call failed');
      }
    } catch (error) {
      toast({
        title: "PowerDials Call Failed",
        description: "PowerDials call could not be initiated",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PowerDials Phone System</h1>
          <p className="text-muted-foreground">
            Advanced cloud-based dialing system for high-performance sales teams
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="sdk-dialer">SDK Dialer</TabsTrigger>
          <TabsTrigger value="powerdials">PowerDials</TabsTrigger>
          <TabsTrigger value="powerdials-control">Control Panel</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* PowerDials Web Dialer */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PowerDials Web</CardTitle>
                <Zap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-3">
                  {isPowerDialsConfigured(powerDialsStatus) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={isPowerDialsConfigured(powerDialsStatus) ? "default" : "destructive"}>
                    {isPowerDialsConfigured(powerDialsStatus) ? "Online" : "Setup Required"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Browser-based dialing system with advanced call management
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={testPowerDialsConnection} 
                    size="sm" 
                    className="w-full"
                  >
                    Test System
                  </Button>
                  <Button 
                    onClick={() => makeTestCall('web')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled={!isPowerDialsConfigured(powerDialsStatus)}
                  >
                    Test Web Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PowerDials Desktop Integration */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PowerDials Desktop</CardTitle>
                <Phone className="h-4 w-4 text-blue-800" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-3">
                  {isPowerDialsConfigured(powerDialsStatus) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={isPowerDialsConfigured(powerDialsStatus) ? "default" : "destructive"}>
                    {isPowerDialsConfigured(powerDialsStatus) ? "Ready" : "Setup Required"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Desktop phone integration for seamless device calling
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={testPowerDialsConnection} 
                    size="sm" 
                    className="w-full"
                  >
                    Test System
                  </Button>
                  <Button 
                    onClick={() => makeTestCall('desktop')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled={!isPowerDialsConfigured(powerDialsStatus)}
                  >
                    Test Desktop Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <PhoneCall className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold">Quick Dial</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use lead cards to dial contacts
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Go to CRM
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">Call History</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    View recent call activity
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <h3 className="font-semibold">System Settings</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure phone systems
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("settings")}
                  >
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sdk-dialer" className="space-y-4">
          <div className="max-w-2xl mx-auto">
            <MightyCallDialer />
          </div>
        </TabsContent>

        <TabsContent value="powerdials" className="space-y-4">
          <PowerDials />
        </TabsContent>

        <TabsContent value="powerdials-control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                PowerDials Integration Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Status Indicator */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium">
                    {connectionStatus === 'connected' ? 'Phone System Ready' :
                     connectionStatus === 'checking' ? 'Initializing...' :
                     connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                  </span>
                </div>
                {retryCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Retry {retryCount}/{MAX_RETRIES}
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Configuration Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Status:</span>
                      <Badge variant={isPowerDialsConfigured(powerDialsStatus) ? "default" : "destructive"}>
                        {isPowerDialsConfigured(powerDialsStatus) ? "Ready" : "Needs Setup"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Web Dialer:</span>
                      <Badge variant="default">Available</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Web-based Dialer</li>
                    <li>• Pop-up Dialer Window</li>
                    <li>• Contact Integration</li>
                    <li>• Call Tracking</li>
                  </ul>
                </div>
              </div>

              {!isPowerDialsConfigured(powerDialsStatus) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Setup Required
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    PowerDials requires API credentials to function. Please configure:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• POWERDIALS_ACCOUNT_ID</li>
                    <li>• POWERDIALS_API_KEY</li>
                    <li>• POWERDIALS_BASE_URL</li>
                  </ul>
                </div>
              )}
              
              <div className="pt-4 border-t space-y-2">
                <div className="flex gap-2">
                  <Button 
                    onClick={testPowerDialsConnection} 
                    variant="outline"
                    disabled={connectionStatus === 'checking'}
                  >
                    Test Connection
                  </Button>
                  {connectionStatus === 'error' && (
                    <Button 
                      onClick={() => {
                        setRetryCount(0);
                        setConnectionStatus('checking');
                      }}
                      variant="outline"
                    >
                      Retry Connection
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => makeTestCall('web')}
                    disabled={!dialerInitialized || connectionStatus !== 'connected' || !isPowerDialsConfigured(powerDialsStatus)}
                    variant="outline"
                  >
                    Test Web Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phone System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">System Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Default Dialer:</span>
                    <Badge>Auto-Select</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fallback Method:</span>
                    <Badge variant="outline">Device Dialer</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Call Logging:</span>
                    <Badge>Enabled</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PowerDials System Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span>Web Dialer</span>
                    </div>
                    <Badge variant={isPowerDialsConfigured(powerDialsStatus) ? "default" : "destructive"}>
                      {isPowerDialsConfigured(powerDialsStatus) ? "Ready" : "Needs Setup"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-800" />
                      <span>Desktop Integration</span>
                    </div>
                    <Badge variant="default">Available</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}