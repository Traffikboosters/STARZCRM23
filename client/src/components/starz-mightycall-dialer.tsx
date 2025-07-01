import { useState, useEffect, useRef } from "react";
import { Phone, PhoneCall, PhoneOff, Volume2, VolumeX, Pause, Play, UserPlus, Settings, Mic, MicOff } from "lucide-react";
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
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

  // Initialize audio on component mount
  useEffect(() => {
    initializeAudio();
    return () => {
      // Cleanup audio resources
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Initialize audio system with improved settings
  const initializeAudio = async () => {
    try {
      // Request microphone access with enhanced settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      localStreamRef.current = stream;
      setAudioEnabled(true);
      
      // Create audio context for call tones
      audioContextRef.current = new AudioContext();
      
      // Create audio element for call audio
      audioRef.current = new Audio();
      audioRef.current.autoplay = true;
      audioRef.current.volume = 0.8;
      audioRef.current.preload = "auto";

      toast({
        title: "Audio System Ready",
        description: "Microphone and speakers initialized for calls",
      });
    } catch (error) {
      console.error('Audio initialization failed:', error);
      toast({
        title: "Audio Setup Failed", 
        description: "Please allow microphone access in browser settings",
        variant: "destructive",
      });
    }
  };

  // Play audio tones for call states with improved audio
  const playCallTone = (type: 'dial' | 'ring' | 'busy' | 'connect') => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    let frequency = 440;
    let duration = 1000;
    
    switch (type) {
      case 'dial':
        frequency = 350;
        duration = 500;
        break;
      case 'ring':
        frequency = 440;
        duration = 2000;
        // Create periodic ringing pattern
        const ringInterval = setInterval(() => {
          if (currentCall?.status === 'ringing') {
            const ringOsc = audioContextRef.current!.createOscillator();
            const ringGain = audioContextRef.current!.createGain();
            ringOsc.connect(ringGain);
            ringGain.connect(audioContextRef.current!.destination);
            ringOsc.frequency.setValueAtTime(440, audioContextRef.current!.currentTime);
            ringGain.gain.setValueAtTime(0.1, audioContextRef.current!.currentTime);
            ringGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current!.currentTime + 0.5);
            ringOsc.start();
            ringOsc.stop(audioContextRef.current!.currentTime + 0.5);
          } else {
            clearInterval(ringInterval);
          }
        }, 3000);
        break;
      case 'busy':
        frequency = 480;
        duration = 250;
        break;
      case 'connect':
        frequency = 800;
        duration = 300;
        break;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
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

      // Play initial dial tone
      playCallTone('dial');

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

        toast({
          title: "Call Initiated",
          description: `Connecting to ${contactName} via STARZ Dialer`,
        });

        // Update call status with audio feedback
        setTimeout(() => {
          setCurrentCall(prev => prev ? { ...prev, status: 'ringing' } : null);
          playCallTone('ring');
          toast({
            title: "Ringing",
            description: `Phone ringing for ${contactName}...`,
          });
        }, 1500);

        // For actual outbound calling, also open device dialer
        const deviceDialString = `tel:+1${dialNumber}`;
        window.location.href = deviceDialString;

        // Simulate call connection with audio
        setTimeout(() => {
          setCurrentCall(prev => prev ? { ...prev, status: 'connected' } : null);
          playCallTone('connect');
          toast({
            title: "Call Connected",
            description: `Device dialer opened for ${contactName}`,
          });
        }, 3000);

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
  const endCall = () => {
    if (currentCall) {
      setCurrentCall(prev => prev ? { ...prev, status: 'ended' } : null);
      setCallDuration(0);
      setIsMuted(false);
      setIsHeld(false);

      // Stop audio tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      toast({
        title: "Call Ended",
        description: `Call with ${currentCall.contactName} ended`,
      });

      if (onCallEnd) {
        onCallEnd();
      }
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
      
      toast({
        title: micEnabled ? "Microphone Muted" : "Microphone Enabled",
        description: micEnabled ? "Your mic is now muted" : "Your mic is now active",
      });
    }
  };

  // Toggle hold
  const toggleHold = () => {
    if (currentCall) {
      setIsHeld(!isHeld);
      setCurrentCall(prev => prev ? { ...prev, status: isHeld ? 'connected' : 'held' } : null);
      
      toast({
        title: isHeld ? "Call Resumed" : "Call On Hold",
        description: isHeld ? "Call resumed" : "Call placed on hold",
      });
    }
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          STARZ Dialer
        </CardTitle>
        <CardDescription>
          Enhanced calling with audio feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Number Input */}
        <div className="space-y-2">
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!!currentCall}
          />
        </div>

        {/* Audio Status */}
        <div className="flex items-center gap-2">
          <Badge variant={audioEnabled ? "default" : "destructive"}>
            {audioEnabled ? "Audio Ready" : "Audio Unavailable"}
          </Badge>
          {currentCall && (
            <Badge variant="outline">
              {currentCall.status.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Active Call Info */}
        {currentCall && (
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="font-medium">{currentCall.contactName}</div>
            <div className="text-sm text-muted-foreground">
              {currentCall.phoneNumber}
            </div>
            {currentCall.status === 'connected' && (
              <div className="text-lg font-mono">
                {formatDuration(callDuration)}
              </div>
            )}
          </div>
        )}

        {/* Call Controls */}
        <div className="space-y-3">
          {!currentCall ? (
            <Button 
              onClick={initiateCall} 
              disabled={isDialing || !phoneNumber}
              className="w-full"
              size="lg"
            >
              {isDialing ? (
                <>
                  <PhoneCall className="w-4 h-4 mr-2 animate-pulse" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </>
              )}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={toggleMic}
                variant={micEnabled ? "outline" : "destructive"}
                size="sm"
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={toggleHold}
                variant={isHeld ? "destructive" : "outline"}
                size="sm"
              >
                {isHeld ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={endCall}
                variant="destructive"
                size="sm"
                className="col-span-2"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}