import { useState } from "react";
import { Phone, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ClickToCallButtonProps {
  phoneNumber: string;
  contactName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showText?: boolean;
}

export default function ClickToCallButton({
  phoneNumber,
  contactName,
  variant = "outline",
  size = "sm",
  showText = false
}: ClickToCallButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    if (!phoneNumber) {
      toast({
        title: "No Phone Number",
        description: "No phone number available for this contact.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const response = await apiRequest("POST", "/api/mightycall/call", {
        phoneNumber,
        contactName
      });

      const result = await response.json();

      if (result.success) {
        // Log the call attempt
        await apiRequest("POST", "/api/call-logs", {
          phoneNumber: result.phoneNumber,
          status: "initiated",
          userId: 1,
          direction: "outbound",
          startTime: new Date().toISOString(),
          notes: `Core plan call prepared via ${result.method}`,
          contactName: contactName || ""
        });

        // Create click-to-call action
        const telLink = `tel:${phoneNumber.replace(/\D/g, '')}`;
        
        toast({
          title: "Call Prepared",
          description: `Ready to call ${contactName || phoneNumber}. Opening phone dialer...`,
          duration: 4000,
        });

        // Auto-open the phone dialer after a brief delay
        setTimeout(() => {
          window.open(telLink, '_self');
        }, 500);
        
      } else {
        throw new Error(result.message || 'Call preparation failed');
      }
    } catch (error) {
      toast({
        title: "Call Setup Failed",
        description: "Unable to prepare call. Check your MightyCall configuration.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isConnecting || !phoneNumber}
      className="gap-2"
    >
      {isConnecting ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <PhoneCall className="h-4 w-4" />
      )}
      {showText && (isConnecting ? "Calling..." : "Call")}
    </Button>
  );
}