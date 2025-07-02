import { useState } from "react";
import { Phone, PhoneCall, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface POWERDIALSCoreInstructionsProps {
  phoneNumber: string;
  contactName?: string;
  onCallInitiated?: () => void;
}

export default function POWERDIALSCoreInstructions({
  phoneNumber,
  contactName,
  onCallInitiated
}: POWERDIALSCoreInstructionsProps) {
  const [isPreparingCall, setIsPreparingCall] = useState(false);
  const [callPrepared, setCallPrepared] = useState(false);
  const { toast } = useToast();

  const handlePrepareCall = async () => {
    setIsPreparingCall(true);
    
    try {
      const response = await apiRequest("POST", "/api/powerdials/call", {
        phoneNumber,
        contactName
      });

      const result = await response.json();

      if (result.success) {
        setCallPrepared(true);
        onCallInitiated?.();

        toast({
          title: "Call Ready",
          description: `Calling ${contactName || phoneNumber} via POWERDIALS`,
        });

        // Open the phone dialer
        const telLink = `tel:${phoneNumber.replace(/\D/g, '')}`;
        window.open(telLink, '_self');
        
      } else {
        throw new Error(result.message || 'Call preparation failed');
      }
    } catch (error) {
      toast({
        title: "Call Error",
        description: "Unable to connect to POWERDIALS system.",
        variant: "destructive",
      });
    } finally {
      setIsPreparingCall(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">POWERDIALS Integration</CardTitle>
          <Badge variant="outline" className="text-xs">Core Plan</Badge>
        </div>
        <CardDescription>
          Connected to Traffik Boosters POWERDIALS account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Core Plan Limitations</p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Automated API calling requires a higher plan. Click-to-call opens your phone dialer for manual dialing.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Contact</p>
            <p className="text-sm text-muted-foreground">{contactName || "Unknown Contact"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Phone Number</p>
            <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{phoneNumber}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handlePrepareCall}
            disabled={isPreparingCall}
            className="w-full"
            size="sm"
          >
            {isPreparingCall ? (
              <>
                <PhoneCall className="h-4 w-4 mr-2 animate-spin" />
                Preparing Call...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Prepare & Dial
              </>
            )}
          </Button>

          {callPrepared && (
            <div className="text-xs text-center text-muted-foreground">
              Call logged in CRM. Use your phone or POWERDIALS app to complete the call.
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => window.open('https://my.powerdials.com', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Open POWERDIALS Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}