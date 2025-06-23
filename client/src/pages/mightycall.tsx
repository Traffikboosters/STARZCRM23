import { useState, useEffect } from "react";
import { Phone, AlertCircle, CheckCircle, ExternalLink, Info, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MightyCallPlansComparison from "@/components/mightycall-plans-comparison";

interface MightyCallStatus {
  connected: boolean;
  apiAccess: boolean;
  accountId: string;
  integrationLevel: string;
  message: string;
}

export default function MightyCallPage() {
  const { data: status, isLoading } = useQuery<MightyCallStatus>({
    queryKey: ["/api/mightycall/status"],
  });

  const testCall = async () => {
    try {
      const response = await apiRequest("POST", "/api/mightycall/call", {
        phoneNumber: "8778406250",
        contactName: "Test Call"
      });
      const result = await response.json();
      
      if (result.success) {
        // Open phone dialer
        const telLink = `tel:${result.phoneNumber}`;
        window.open(telLink, '_self');
      }
    } catch (error) {
      console.error("Test call failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Phone System</h1>
        <p className="text-gray-600 mt-2">
          MightyCall integration for Traffik Boosters business calls
        </p>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Current Status</TabsTrigger>
          <TabsTrigger value="plans">
            <Zap className="h-4 w-4 mr-2" />
            Plan Comparison
          </TabsTrigger>
          <TabsTrigger value="instructions">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">

          {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              MightyCall Status
            </CardTitle>
            {status?.connected ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Account ID</p>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {status.accountId}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Plan Type</p>
                <Badge variant="outline">{status.integrationLevel}</Badge>
              </div>
            </div>
          )}

          {status?.integrationLevel === "Limited" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Core Plan Limitations:</strong> Your MightyCall Core plan doesn't support automated API calling. 
                Click-to-call will open your phone dialer or MightyCall app for manual dialing.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* How Click-to-Call Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Click-to-Call Works</CardTitle>
          <CardDescription>
            Understanding your current phone system capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Click Call Button</p>
                <p className="text-sm text-muted-foreground">Click any phone number in contacts or leads</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Call Preparation</p>
                <p className="text-sm text-muted-foreground">System logs the call attempt and prepares dial string</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Phone Dialer Opens</p>
                <p className="text-sm text-muted-foreground">Your device's phone app opens with the number ready to dial</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-medium">Manual Dial</p>
                <p className="text-sm text-muted-foreground">Press call in your phone app or use MightyCall softphone</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={testCall} className="w-full sm:w-auto">
              <Phone className="h-4 w-4 mr-2" />
              Test Call System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MightyCall Dashboard Access */}
      <Card>
        <CardHeader>
          <CardTitle>MightyCall Dashboard</CardTitle>
          <CardDescription>
            Access your MightyCall account for advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => window.open('https://my.mightycall.com', '_blank')}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open MightyCall Dashboard
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Use your Traffik Boosters credentials: traffikboosters@gmail.com
          </p>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="plans">
          <MightyCallPlansComparison />
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6">
          {/* How Click-to-Call Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Click-to-Call Works</CardTitle>
              <CardDescription>
                Understanding your current phone system capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Click Call Button</p>
                    <p className="text-sm text-muted-foreground">Click any phone number in contacts or leads</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Call Preparation</p>
                    <p className="text-sm text-muted-foreground">System logs the call attempt and prepares dial string</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Phone Dialer Opens</p>
                    <p className="text-sm text-muted-foreground">Your device's phone app opens with the number ready to dial</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">Manual Dial</p>
                    <p className="text-sm text-muted-foreground">Press call in your phone app or use MightyCall softphone</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={testCall} className="w-full sm:w-auto">
                  <Phone className="h-4 w-4 mr-2" />
                  Test Call System
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}