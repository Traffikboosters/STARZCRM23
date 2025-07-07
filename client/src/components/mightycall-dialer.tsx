import { useEffect, useState } from 'react';
import { Phone, PhoneCall, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Import Traffik Boosters logo
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

declare global {
  interface Window {
    MightyCall: {
      init: (config: { apiKey: string }) => void;
      call: (number: string) => void;
      on: (event: string, callback: () => void) => void;
      off: (event: string, callback: () => void) => void;
    };
  }
}

export default function MightyCallDialer() {
  const { toast } = useToast();
  const [micAllowed, setMicAllowed] = useState(false);
  const [dialerReady, setDialerReady] = useState(false);
  const [callInProgress, setCallInProgress] = useState(false);
  const [sdkLoading, setSdkLoading] = useState(false);
  const [lastCalledNumber, setLastCalledNumber] = useState<string>('');

  useEffect(() => {
    // Request microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setMicAllowed(true);
        toast({
          title: "Microphone Access Granted",
          description: "Ready to initialize MightyCall dialer",
        });
      })
      .catch((error) => {
        console.warn('Microphone permission denied:', error);
        toast({
          title: "Microphone Access Required",
          description: "Microphone access is required to make calls. Please allow access and refresh.",
          variant: "destructive"
        });
      });
  }, [toast]);

  useEffect(() => {
    if (!micAllowed) return;

    const loadMightyCallSDK = async () => {
      try {
        setSdkLoading(true);
        
        // Check if SDK is already loaded
        if (window.MightyCall) {
          await initializeMightyCall();
          return;
        }

        // Load MightyCall SDK
        const script = document.createElement("script");
        script.src = "https://cdn.mightycall.com/sdk.js";
        script.onload = async () => {
          console.log('✅ MightyCall SDK loaded successfully');
          await initializeMightyCall();
        };
        script.onerror = () => {
          console.error('❌ Failed to load MightyCall SDK');
          toast({
            title: "SDK Loading Failed",
            description: "Unable to load MightyCall SDK. Please check internet connection.",
            variant: "destructive"
          });
          setSdkLoading(false);
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('MightyCall SDK loading error:', error);
        setSdkLoading(false);
      }
    };

    const initializeMightyCall = async () => {
      try {
        // Get secure token from backend
        const response = await fetch("/api/mightycall/token");
        if (!response.ok) {
          throw new Error(`Token fetch failed: ${response.status}`);
        }
        
        const tokenData = await response.json();
        if (!tokenData.success) {
          throw new Error(tokenData.error || 'Token fetch failed');
        }
        
        const { token, method } = tokenData;
        console.log(`🔑 MightyCall token obtained via ${method || 'unknown'} method`);
        
        // Initialize MightyCall with secure token
        window.MightyCall.init({ apiKey: token });
        
        // Setup event listeners
        window.MightyCall.on("callStart", () => {
          setCallInProgress(true);
          toast({
            title: "Call Started",
            description: "Call is now in progress",
          });
        });
        
        window.MightyCall.on("callEnd", () => {
          setCallInProgress(false);
          toast({
            title: "Call Ended",
            description: "Call has been completed",
          });
        });

        setDialerReady(true);
        setSdkLoading(false);
        
        toast({
          title: "MightyCall Ready",
          description: "Dialer is now ready to make calls",
        });
        
        console.log('🎉 MightyCall dialer initialized successfully');
      } catch (error) {
        console.error('MightyCall initialization failed:', error);
        setSdkLoading(false);
        toast({
          title: "Initialization Failed",
          description: "Unable to initialize MightyCall dialer. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadMightyCallSDK();
  }, [micAllowed, toast]);

  const handleCall = (phoneNumber?: string) => {
    if (!dialerReady || !window.MightyCall) {
      toast({
        title: "Dialer Not Ready",
        description: "Please wait for the dialer to initialize",
        variant: "destructive"
      });
      return;
    }

    const number = phoneNumber || prompt("Enter phone number to dial:");
    if (number) {
      try {
        window.MightyCall.call(number);
        setLastCalledNumber(number);
        console.log('📞 Initiating call to:', number.replace(/\d/g, '*'));
      } catch (error) {
        console.error('Call initiation failed:', error);
        toast({
          title: "Call Failed",
          description: "Unable to initiate call. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRedial = () => {
    if (lastCalledNumber) {
      handleCall(lastCalledNumber);
    } else {
      toast({
        title: "No Previous Number",
        description: "No previous number to redial",
        variant: "default"
      });
    }
  };

  // Loading state
  if (!micAllowed || sdkLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src={traffikBoostersLogo}
              alt="Traffik Boosters" 
              className="h-20 w-20 object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div>
              <p className="text-lg font-bold text-gray-900">More Traffik!</p>
              <p className="text-lg font-bold text-gray-900">More Sales!</p>
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading MightyCall Dialer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {!micAllowed ? "Requesting microphone permission..." : "Loading dialer SDK..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src={traffikBoostersLogo}
            alt="Traffik Boosters" 
            className="h-20 w-20 object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <p className="text-lg font-bold text-gray-900">More Traffik!</p>
            <p className="text-lg font-bold text-gray-900">More Sales!</p>
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="h-5 w-5" />
          MightyCall Dialer
        </CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          <Badge variant={micAllowed ? "default" : "secondary"}>
            {micAllowed ? <Mic className="h-3 w-3 mr-1" /> : <MicOff className="h-3 w-3 mr-1" />}
            {micAllowed ? "Mic Ready" : "Mic Off"}
          </Badge>
          <Badge variant={dialerReady ? "default" : "secondary"}>
            <PhoneCall className="h-3 w-3 mr-1" />
            {dialerReady ? "Dialer Ready" : "Initializing"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => handleCall()} 
            disabled={!dialerReady || callInProgress}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {callInProgress ? (
              <>
                <PhoneCall className="h-4 w-4 mr-2 animate-pulse" />
                Call In Progress...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Make a Call
              </>
            )}
          </Button>
          
          {lastCalledNumber && (
            <Button 
              onClick={handleRedial}
              variant="outline"
              disabled={!dialerReady || callInProgress}
              className="w-full"
            >
              <PhoneCall className="h-4 w-4 mr-2" />
              Redial {lastCalledNumber.replace(/\d/g, '*')}
            </Button>
          )}
        </div>
        
        <div className="text-xs text-center text-muted-foreground">
          {callInProgress ? "Call active - use your device's call controls" : "Ready to make calls"}
        </div>
      </CardContent>
    </Card>
  );
}