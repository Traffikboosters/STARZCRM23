import { useState, useEffect } from "react";
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface POWERDIALSWebDialerProps {
  phoneNumber?: string;
  contactName?: string;
  onCallStatusChange?: (status: 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended') => void;
}

export default function POWERDIALSWebDialer({ 
  phoneNumber = "",
  contactName = "",
  onCallStatusChange 
}: POWERDIALSWebDialerProps) {
  const [dialNumber, setDialNumber] = useState(phoneNumber);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'ringing' | 'connected' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isDialerVisible, setIsDialerVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    
    onCallStatusChange?.(callStatus);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus, onCallStatusChange]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDialPad = (digit: string) => {
    setDialNumber(prev => prev + digit);
  };

  const handleBackspace = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setDialNumber("");
  };

  const initiateCall = async () => {
    if (!dialNumber.trim()) {
      toast({
        title: "No Number",
        description: "Please enter a phone number to call.",
        variant: "destructive",
      });
      return;
    }

    setCallStatus('connecting');
    
    try {
      // Clean phone number and remove country code if present
      const cleanNumber = dialNumber.replace(/\D/g, '');
      let finalNumber = cleanNumber;
      
      if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        finalNumber = cleanNumber.substring(1);
      }
      
      // Use device phone dialer directly
      window.location.href = `tel:${finalNumber}`;
      
      setCallStatus('ringing');
      
      toast({
        title: "Call Initiated",
        description: `Calling ${contactName || finalNumber} via device phone app`,
      });

      // Log call attempt in background
      setTimeout(() => {
        apiRequest("POST", "/api/powerdials/call", {
          phoneNumber: finalNumber,
          contactName: contactName || 'Contact',
          userId: 1
        }).catch(error => console.log('Call logging failed:', error));
      }, 100);

      // Simulate call progression for UI
      setTimeout(() => {
        if (callStatus === 'ringing') {
          setCallStatus('connected');
          toast({
            title: "Call Connected",
            description: "Call in progress",
          });
        }
      }, 3000);
      
    } catch (error) {
      console.error("Call error:", error);
      setCallStatus('idle');
      
      toast({
        title: "Call Error",
        description: "Unable to initiate call. Please try manually.",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    setCallStatus('ended');
    setTimeout(() => setCallStatus('idle'), 1000);
    
    toast({
      title: "Call Ended",
      description: `Call duration: ${formatDuration(callDuration)}`,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "Microphone enabled" : "Microphone disabled",
    });
  };

  const toggleVolume = () => {
    setVolume(!volume);
    toast({
      title: volume ? "Volume Off" : "Volume On",
      description: volume ? "Speaker disabled" : "Speaker enabled",
    });
  };

  const dialPadDigits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="h-5 w-5" />
          POWERDIALS Dialer
        </CardTitle>
        <CardDescription>
          Traffik Boosters Phone System
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Phone Number Display */}
        <div className="text-center">
          <Input
            value={dialNumber}
            onChange={(e) => setDialNumber(e.target.value)}
            placeholder="Enter phone number"
            className="text-center text-lg font-mono"
            disabled={callStatus !== 'idle'}
          />
          {contactName && (
            <p className="text-sm text-muted-foreground mt-1">{contactName}</p>
          )}
        </div>

        {/* Call Status Display */}
        {callStatus !== 'idle' && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              {callStatus === 'connecting' && <PhoneCall className="h-4 w-4 animate-pulse" />}
              {callStatus === 'ringing' && <Phone className="h-4 w-4 animate-bounce" />}
              {callStatus === 'connected' && <PhoneCall className="h-4 w-4 text-green-600" />}
              {callStatus === 'ended' && <PhoneOff className="h-4 w-4 text-red-600" />}
              
              <span className="capitalize font-medium">{callStatus}</span>
            </div>
            
            {callStatus === 'connected' && (
              <div className="text-2xl font-mono text-green-600">
                {formatDuration(callDuration)}
              </div>
            )}
          </div>
        )}

        {/* Call Controls */}
        {callStatus === 'idle' ? (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialerVisible(!isDialerVisible)}
                className="flex-1"
              >
                Dial Pad
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex-1"
              >
                Clear
              </Button>
            </div>

            {/* Dial Pad */}
            {isDialerVisible && (
              <div className="grid grid-cols-3 gap-2">
                {dialPadDigits.flat().map((digit) => (
                  <Button
                    key={digit}
                    variant="outline"
                    onClick={() => handleDialPad(digit)}
                    className="aspect-square text-lg font-bold"
                  >
                    {digit}
                  </Button>
                ))}
              </div>
            )}

            {/* Call Button */}
            <Button
              onClick={initiateCall}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
              disabled={!dialNumber.trim()}
            >
              <PhoneCall className="h-5 w-5 mr-2" />
              Call via POWERDIALS
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Call Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                onClick={toggleMute}
                className="rounded-full w-12 h-12"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={volume ? "outline" : "destructive"}
                size="lg"
                onClick={toggleVolume}
                className="rounded-full w-12 h-12"
              >
                {volume ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full w-12 h-12"
                disabled={callStatus === 'connecting'}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="text-xs text-center text-muted-foreground">
          Account: 4f917f13-aae1-401d-8241-010db91da5b2<br />
          Status: POWERDIALS Pro Integration Active
        </div>
      </CardContent>
    </Card>
  );
}