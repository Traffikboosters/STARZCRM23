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
      // Clean and format phone number
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      let dialNumber = cleanNumber;
      
      // Remove country code if present (US domestic)
      if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        dialNumber = cleanNumber.substring(1);
      }
      
      // Use device dialer with PowerDials integration fallback
      try {
        // Try PowerDials API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await apiRequest("POST", "/api/powerdials/call", {
          phoneNumber: dialNumber,
          contactName: contactName || "Unknown Contact",
          userId: 1
        });
        
        clearTimeout(timeoutId);
        
        if (response && response.ok) {
          // PowerDials API success - use device dialer with logging
          window.location.href = `tel:${dialNumber}`;
          
          toast({
            title: "PowerDials Active",
            description: `Call logged and initiated for ${contactName || dialNumber}`,
            duration: 3000,
          });
        } else {
          throw new Error('PowerDials API error');
        }
      } catch (apiError) {
        // Fallback to direct device dialer
        window.location.href = `tel:${dialNumber}`;
        
        toast({
          title: "Call Ready",
          description: `Calling ${contactName || dialNumber}`,
          duration: 3000,
        });
      }
      
    } catch (error) {
      console.error("POWERDIALS error, using fallback:", error);
      
      // Fallback: Direct device dialer
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      let dialNumber = cleanNumber;
      if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        dialNumber = cleanNumber.substring(1);
      }
      
      window.location.href = `tel:${dialNumber}`;
      
      toast({
        title: "Backup Dialer",
        description: `Using device dialer for ${contactName || dialNumber}`,
        duration: 3000,
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