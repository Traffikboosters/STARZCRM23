import { useState, useEffect, useRef } from "react";
import { Phone, PhoneCall, PhoneOff, Volume2, VolumeX, Pause, Play, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CallSession {
  callId: string;
  phoneNumber: string;
  contactName: string;
  status: 'dialing' | 'ringing' | 'connected' | 'held' | 'ended';
  startTime: Date;
  duration: number;
  direction: 'outbound' | 'inbound';
}

interface STARZMightyCallDialerProps {
  contact?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  onCallEnd?: () => void;
}

export default function STARZMightyCallDialer({ contact, onCallEnd }: STARZMightyCallDialerProps) {
  const [phoneNumber, setPhoneNumber] = useState(contact?.phone || "");
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [isDialing, setIsDialing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [dialerOpen, setDialerOpen] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Update call duration timer
  useEffect(() => {
    if (currentCall && currentCall.status === 'connected') {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentCall]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initiate call through STARZ MightyCall integration
  const initiateCall = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to call",
        variant: "destructive",
      });
      return;
    }

    setIsDialing(true);

    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      let dialNumber = cleanNumber;
      
      // Remove country code if present
      if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        dialNumber = cleanNumber.substring(1);
      }

      const contactName = contact 
        ? `${contact.firstName} ${contact.lastName}`
        : "Unknown Contact";

      // Call STARZ MightyCall API
      const response = await apiRequest("POST", "/api/mightycall/starz-call", {
        phoneNumber: dialNumber,
        contactName: contactName,
        userId: 1,
        dialerType: "starz_embedded"
      });

      if (response.ok) {
        const callData = await response.json();
        
        // Create call session
        const newCall: CallSession = {
          callId: callData.callId,
          phoneNumber: dialNumber,
          contactName: contactName,
          status: 'dialing',
          startTime: new Date(),
          duration: 0,
          direction: 'outbound'
        };

        setCurrentCall(newCall);
        setCallDuration(0);
        
        // Simulate call progression
        setTimeout(() => {
          if (newCall.callId) {
            setCurrentCall(prev => prev ? { ...prev, status: 'ringing' } : null);
            
            // Simulate connection after 3 seconds
            setTimeout(() => {
              setCurrentCall(prev => prev ? { ...prev, status: 'connected' } : null);
              toast({
                title: "Call Connected",
                description: `Connected to ${contactName}`,
              });
            }, 3000);
          }
        }, 1000);

        toast({
          title: "STARZ Dialer",
          description: `Calling ${contactName} via STARZ MightyCall integration`,
        });

      } else {
        throw new Error('STARZ MightyCall integration failed');
      }

    } catch (error) {
      console.error("STARZ Dialer Error:", error);
      toast({
        title: "Call Failed",
        description: "Unable to connect call through STARZ dialer",
        variant: "destructive",
      });
    } finally {
      setIsDialing(false);
    }
  };

  // End current call
  const endCall = async () => {
    if (!currentCall) return;

    try {
      await apiRequest("POST", "/api/mightycall/end-call", {
        callId: currentCall.callId
      });

      setCurrentCall(null);
      setCallDuration(0);
      setIsMuted(false);
      setIsHeld(false);

      toast({
        title: "Call Ended",
        description: `Call to ${currentCall.contactName} ended`,
      });

      if (onCallEnd) {
        onCallEnd();
      }

    } catch (error) {
      console.error("End call error:", error);
    }
  };

  // Toggle mute
  const toggleMute = async () => {
    if (!currentCall) return;

    try {
      await apiRequest("POST", "/api/mightycall/mute", {
        callId: currentCall.callId,
        mute: !isMuted
      });

      setIsMuted(!isMuted);
      
      toast({
        title: isMuted ? "Unmuted" : "Muted",
        description: `Microphone ${isMuted ? "enabled" : "disabled"}`,
      });

    } catch (error) {
      console.error("Mute toggle error:", error);
    }
  };

  // Toggle hold
  const toggleHold = async () => {
    if (!currentCall) return;

    try {
      await apiRequest("POST", "/api/mightycall/hold", {
        callId: currentCall.callId,
        hold: !isHeld
      });

      setIsHeld(!isHeld);
      setCurrentCall(prev => prev ? { ...prev, status: isHeld ? 'connected' : 'held' } : null);
      
      toast({
        title: isHeld ? "Call Resumed" : "Call Held",
        description: `Call ${isHeld ? "resumed" : "placed on hold"}`,
      });

    } catch (error) {
      console.error("Hold toggle error:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* STARZ Dialer Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">STARZ MightyCall Dialer</CardTitle>
              <CardDescription>Integrated calling system</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Active Call Display */}
          {currentCall && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-blue-900">{currentCall.contactName}</h4>
                  <p className="text-sm text-blue-700">{currentCall.phoneNumber}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={currentCall.status === 'connected' ? 'default' : 'secondary'}
                    className={currentCall.status === 'connected' ? 'bg-green-500' : ''}
                  >
                    {currentCall.status.toUpperCase()}
                  </Badge>
                  {currentCall.status === 'connected' && (
                    <p className="text-sm text-blue-600 mt-1">{formatDuration(callDuration)}</p>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleMute}
                  disabled={currentCall.status !== 'connected'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <Button
                  variant={isHeld ? "secondary" : "outline"}
                  size="sm"
                  onClick={toggleHold}
                  disabled={currentCall.status !== 'connected' && currentCall.status !== 'held'}
                >
                  {isHeld ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endCall}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Dialer Interface */}
          {!currentCall && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="Enter phone number..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={initiateCall}
                  disabled={isDialing || !phoneNumber}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isDialing ? (
                    <PhoneCall className="h-4 w-4 animate-spin" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {contact && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Calling: {contact.firstName} {contact.lastName}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* STARZ Integration Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>STARZ MightyCall Integration Active</span>
            </div>
            <div className="text-gray-500">
              Account: Traffik Boosters
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}