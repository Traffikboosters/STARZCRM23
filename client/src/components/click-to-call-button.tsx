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
      // Direct phone dialer approach - bypass API call
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const telLink = `tel:${cleanNumber}`;
      
      toast({
        title: "Calling Now",
        description: `Dialing ${contactName || phoneNumber}`,
        duration: 2000,
      });

      // Open phone dialer
      window.open(telLink, '_self');
      
    } catch (error) {
      console.error('Call error:', error);
      toast({
        title: "Call Failed",
        description: "Unable to open phone dialer. Please dial manually.",
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