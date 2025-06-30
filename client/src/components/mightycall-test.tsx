import { useState } from "react";
import { Phone, PhoneCall, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MightyCallTest() {
  const [testNumber, setTestNumber] = useState("8778406250");
  const [testName, setTestName] = useState("Test Contact");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/mightycall/call", {
        phoneNumber: testNumber,
        contactName: testName,
        userId: 1
      });

      const result = await response.json();
      setLastResult(result);
      
      if (result.success && result.webDialerUrl) {
        // Try to open the web dialer
        const popup = window.open(result.webDialerUrl, '_blank', 'width=900,height=700,resizable=yes,scrollbars=yes');
        
        if (popup) {
          popup.focus();
          toast({
            title: "✅ MightyCall Working!",
            description: "Web dialer opened successfully",
          });
        } else {
          toast({
            title: "⚠️ Popup Blocked",
            description: "Please allow popups or manually open the dialer URL",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "❌ MightyCall Failed",
          description: result.message || "Unknown error",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("MightyCall test error:", error);
      setLastResult({ error: (error as Error).message });
      toast({
        title: "❌ API Error",
        description: "Failed to connect to MightyCall API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          MightyCall Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Phone Number</label>
          <Input
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Name</label>
          <Input
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter contact name"
          />
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={isLoading || !testNumber}
          className="w-full"
        >
          {isLoading ? (
            <>
              <PhoneCall className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Phone className="h-4 w-4 mr-2" />
              Test MightyCall
            </>
          )}
        </Button>
        
        {lastResult && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs">
            <div className="flex items-center gap-2 mb-2">
              {lastResult.success ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                {lastResult.success ? "API Success" : "API Failed"}
              </span>
            </div>
            
            {lastResult.success && (
              <div className="space-y-1 text-gray-600">
                <div>Call ID: {lastResult.callId}</div>
                <div>Method: {lastResult.method}</div>
                {lastResult.webDialerUrl && (
                  <div className="break-all">
                    URL: {lastResult.webDialerUrl}
                  </div>
                )}
              </div>
            )}
            
            {lastResult.error && (
              <div className="text-red-600">
                Error: {lastResult.error}
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Account: 4f917f13-aae1-401d-8241-010db91da5b2
          </div>
          <div>Traffik Boosters MightyCall Pro Plan</div>
        </div>
      </CardContent>
    </Card>
  );
}