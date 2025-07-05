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

  // Query PowerDials status (uses MightyCall backend)
  const { data: powerDialsStatus, refetch: refetchPowerDials } = useQuery({
    queryKey: ['/api/powerdials/status'],
  });

  // Type guard for PowerDials status
  const isPowerDialsConfigured = (status: any): boolean => {
    return status && typeof status === 'object' && 'configured' in status && status.configured;
  };

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
    
    try {
      const response = await fetch('/api/powerdials/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testNumber,
          contactName: 'PowerDials Test Call',
          userId: 1
        })
      });
      
      const result = await response.json();
      
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="powerdials">PowerDials Control</TabsTrigger>
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



        <TabsContent value="powerdials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                PowerDials Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              <div className="pt-4 border-t">
                <Button onClick={testPowerDialsConnection} className="mr-2">
                  Test Connection
                </Button>
                <Button 
                  onClick={() => makeTestCall('web')} 
                  variant="outline"
                  disabled={!isPowerDialsConfigured(powerDialsStatus)}
                >
                  Test Web Call
                </Button>
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