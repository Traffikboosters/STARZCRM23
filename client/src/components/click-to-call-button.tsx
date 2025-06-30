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
      // Call MightyCall Fixed API
      const response = await apiRequest("POST", "/api/mightycall/call", {
        phoneNumber,
        contactName,
        userId: 1
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('MightyCall Fixed API - Call initiated:', result);
        
        // Priority 1: MightyCall Pro Web Dialer
        if (result.webDialerUrl) {
          const popup = window.open(result.webDialerUrl, '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes');
          
          if (popup) {
            popup.focus();
            toast({
              title: "Call Ready",
              description: `MightyCall Pro dialer opened for ${contactName || phoneNumber}`,
            });
          } else {
            // Popup blocked - provide alternative
            navigator.clipboard.writeText(result.webDialerUrl).then(() => {
              toast({
                title: "Popup Blocked",
                description: "MightyCall dialer URL copied to clipboard. Please paste in browser to make call.",
                variant: "destructive",
              });
            });
          }
        }
        // Priority 2: Device phone app with tel: link
        else {
          const cleanNumber = phoneNumber.replace(/\D/g, '');
          window.location.href = `tel:${cleanNumber}`;
          
          toast({
            title: "Call Initiated",
            description: `Calling ${contactName || phoneNumber} via device phone app`,
          });
        }
      } else {
        // Fallback: Direct device dialing
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        window.location.href = `tel:${cleanNumber}`;
        
        toast({
          title: "Direct Call",
          description: `Opening device phone app for ${contactName || phoneNumber}`,
        });
      }
    } catch (error) {
      console.error("Call initiation error:", error);
      
      // Fallback: Direct device dialing
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      window.location.href = `tel:${cleanNumber}`;
      
      toast({
        title: "Call Initiated",
        description: `Using device phone app for ${contactName || phoneNumber}`,
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
      disabled={isConnecting}
      className="flex items-center gap-2"
    >
      {isConnecting ? (
        <PhoneCall className="h-4 w-4 animate-spin" />
      ) : (
        <Phone className="h-4 w-4" />
      )}
      {showText && (isConnecting ? "Connecting..." : "Call")}
    </Button>
  );
}