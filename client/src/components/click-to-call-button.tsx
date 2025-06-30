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
      // Direct device calling - most reliable method
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      // Remove country code if present (US domestic)
      let dialNumber = cleanNumber;
      if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        dialNumber = cleanNumber.substring(1);
      }
      
      // Use device phone dialer
      window.location.href = `tel:${dialNumber}`;
      
      // Log call attempt in background
      apiRequest("POST", "/api/mightycall/call", {
        phoneNumber: dialNumber,
        contactName,
        userId: 1
      }).catch(error => console.log('Call logging failed:', error));
      
      toast({
        title: "Call Initiated",
        description: `Calling ${contactName || dialNumber} via device phone app`,
      });
    } catch (error) {
      console.error("Call initiation error:", error);
      
      toast({
        title: "Call Error",
        description: "Unable to initiate call. Please dial manually.",
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