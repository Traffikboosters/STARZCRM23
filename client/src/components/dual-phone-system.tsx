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

  // Query MightyCall status
  const { data: mightyCallStatus, refetch: refetchMightyCall } = useQuery({
    queryKey: ['/api/mightycall/status'],
  });

  // Query PowerDials status
  const { data: powerDialsStatus, refetch: refetchPowerDials } = useQuery({
    queryKey: ['/api/powerdials/status'],
  });

  const testMightyCallConnection = async () => {
    try {
      const response = await fetch('/api/mightycall/test', { method: 'POST' });
      const result = await response.json();
      toast({
        title: "MightyCall Test",
        description: result.success ? "Connection successful" : result.message,
        variant: result.success ? "default" : "destructive",
      });
      refetchMightyCall();
    } catch (error) {
      toast({
        title: "MightyCall Test Failed",
        description: "Unable to test connection",
        variant: "destructive",
      });
    }
  };

  const testPowerDialsConnection = async () => {
    try {
      const response = await fetch('/api/powerdials/status');
      const result = await response.json();
      toast({
        title: "PowerDials Test",
        description: result.configured ? "System ready" : result.message,
        variant: result.configured ? "default" : "destructive",
      });
      refetchPowerDials();
    } catch (error) {
      toast({
        title: "PowerDials Test Failed",
        description: "Unable to test connection",
        variant: "destructive",
      });
    }
  };

  const makeTestCall = async (system: 'mightycall' | 'powerdials') => {
    const endpoint = system === 'mightycall' ? '/api/mightycall/call' : '/api/powerdials/call';
    const testNumber = '8778406250'; // Traffik Boosters number
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testNumber,
          contactName: 'Test Call',
          userId: 1
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (system === 'powerdials' && result.dialerUrl) {
          window.open(result.dialerUrl, 'PowerDialsDialer', 'width=800,height=600,scrollbars=yes,resizable=yes');
        } else if (system === 'mightycall') {
          window.open(`tel:${testNumber}`, '_self');
        }
        
        toast({
          title: `${system === 'mightycall' ? 'MightyCall' : 'PowerDials'} Call Initiated`,
          description: `Test call to ${testNumber}`,
        });
      } else {
        throw new Error(result.message || 'Call failed');
      }
    } catch (error) {
      toast({
        title: "Call Failed",
        description: `${system === 'mightycall' ? 'MightyCall' : 'PowerDials'} call could not be initiated`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phone System</h1>
          <p className="text-muted-foreground">
            Dual dialer integration - Choose between MightyCall and PowerDials
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mightycall">MightyCall</TabsTrigger>
          <TabsTrigger value="powerdials">PowerDials</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* MightyCall Status Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MightyCall</CardTitle>
                <Phone className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-3">
                  {mightyCallStatus?.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={mightyCallStatus?.connected ? "default" : "destructive"}>
                    {mightyCallStatus?.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {mightyCallStatus?.message || "Status unknown"}
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={testMightyCallConnection} 
                    size="sm" 
                    className="w-full"
                  >
                    Test Connection
                  </Button>
                  <Button 
                    onClick={() => makeTestCall('mightycall')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled={!mightyCallStatus?.connected}
                  >
                    Make Test Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PowerDials Status Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PowerDials</CardTitle>
                <Zap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-3">
                  {powerDialsStatus?.configured ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={powerDialsStatus?.configured ? "default" : "destructive"}>
                    {powerDialsStatus?.configured ? "Ready" : "Needs Setup"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {powerDialsStatus?.message || "Status unknown"}
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={testPowerDialsConnection} 
                    size="sm" 
                    className="w-full"
                  >
                    Test Connection
                  </Button>
                  <Button 
                    onClick={() => makeTestCall('powerdials')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled={!powerDialsStatus?.configured}
                  >
                    Make Test Call
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

        <TabsContent value="mightycall" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                MightyCall Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Connection Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Access:</span>
                      <Badge variant={mightyCallStatus?.connected ? "default" : "destructive"}>
                        {mightyCallStatus?.connected ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Account ID:</span>
                      <span className="text-xs font-mono">
                        {mightyCallStatus?.accountId || "Not configured"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Capabilities</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Pro Plan Features</li>
                    <li>• Web Dialer Integration</li>
                    <li>• Call Logging</li>
                    <li>• Device Phone Dialer</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={testMightyCallConnection} className="mr-2">
                  Test Connection
                </Button>
                <Button 
                  onClick={() => makeTestCall('mightycall')} 
                  variant="outline"
                  disabled={!mightyCallStatus?.connected}
                >
                  Make Test Call
                </Button>
              </div>
            </CardContent>
          </Card>
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
                      <Badge variant={powerDialsStatus?.configured ? "default" : "destructive"}>
                        {powerDialsStatus?.configured ? "Ready" : "Needs Setup"}
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

              {!powerDialsStatus?.configured && (
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
                  onClick={() => makeTestCall('powerdials')} 
                  variant="outline"
                  disabled={!powerDialsStatus?.configured}
                >
                  Make Test Call
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
                <h4 className="font-semibold mb-3">System Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span>MightyCall</span>
                    </div>
                    <Badge variant={mightyCallStatus?.connected ? "default" : "destructive"}>
                      {mightyCallStatus?.connected ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span>PowerDials</span>
                    </div>
                    <Badge variant={powerDialsStatus?.configured ? "default" : "destructive"}>
                      {powerDialsStatus?.configured ? "Ready" : "Needs Setup"}
                    </Badge>
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