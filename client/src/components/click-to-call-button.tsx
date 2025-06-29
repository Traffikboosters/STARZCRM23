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
      
      if (result.success) {
        console.log('MightyCall response:', result);
        
        // Clean and format phone number for dialer
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        const telLink = `tel:${cleanNumber}`;
        
        toast({
          title: "MightyCall Connected",
          description: `Calling ${contactName || phoneNumber} via MightyCall`,
          duration: 3000,
        });

        // Open phone dialer
        const link = document.createElement('a');
        link.href = telLink;
        link.click();
        
        // Fallback
        setTimeout(() => {
          window.location.href = telLink;
        }, 100);
        
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