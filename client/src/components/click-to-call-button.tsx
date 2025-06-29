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
      // Call MightyCall API first
      const response = await apiRequest("POST", "/api/mightycall/call", {
        phoneNumber,
        contactName,
        userId: 1
      });

      const result = await response.json();
      
      if (result.success && result.dialString) {
        console.log('MightyCall dial string generated:', result.dialString);
        
        // Try to open the dial string URL directly
        try {
          window.location.href = result.dialString;
        } catch (error) {
          // Fallback: copy dial string to clipboard and show instructions
          navigator.clipboard.writeText(result.dialString);
          toast({
            title: "Call Ready",
            description: "Dial string copied to clipboard. Open MightyCall app to place call.",
            variant: "default",
          });
          return;
        }
        
        toast({
          title: "MightyCall Ready",
          description: `Call prepared for ${contactName || phoneNumber}. Opening dashboard...`,
          duration: 5000,
        });

        // Open MightyCall dashboard in new tab
        const mightyCallDashboard = `https://app.mightycall.com/dashboard`;
        window.open(mightyCallDashboard, '_blank');
        
        // Show SIP URL for VoIP clients
        console.log('SIP URL for VoIP clients:', result.sipUrl);
        console.log('Call ID for tracking:', result.callId);
        
        // Copy number to clipboard for manual dial
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        navigator.clipboard.writeText(cleanNumber).then(() => {
          console.log('Phone number copied to clipboard:', cleanNumber);
        });
        
      } else {
        throw new Error(result.message || 'MightyCall connection failed');
      }
    } catch (error) {
      console.error('MightyCall error:', error);
      toast({
        title: "MightyCall Error",
        description: `Unable to connect to MightyCall. Copy: ${phoneNumber}`,
        variant: "destructive",
        duration: 5000,
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