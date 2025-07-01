import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  UserCircle,
  Pause,
  Play,
  Settings,
  History,
  PhoneIncoming,
  PhoneOutgoing
} from "lucide-react";
import type { Contact } from "@shared/schema";

interface CallSession {
  callId: string;
  contactName: string;
  phoneNumber: string;
  startTime: Date;
  status: 'connecting' | 'connected' | 'on_hold' | 'ended';
  duration: number;
  muted: boolean;
  onHold: boolean;
}

interface CallHistory {
  id: string;
  contactName: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  duration: number;
  status: 'completed' | 'missed' | 'busy' | 'failed';
  timestamp: Date;
  notes?: string;
}

interface MightyCallDialerProps {
  contact?: Contact;
  onClose?: () => void;
  isFloating?: boolean;
}

export default function EnhancedMightyCallDialer({ contact, onClose, isFloating = false }: MightyCallDialerProps) {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(contact?.phone || "");
  const [isDialing, setIsDialing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock call history data
  const callHistory: CallHistory[] = [
    {
      id: "1",
      contactName: "Kevin Williams",
      phoneNumber: "(305) 847-9200",
      direction: "outbound",
      duration: 180,
      status: "completed",
      timestamp: new Date(Date.now() - 3600000),
      notes: "Discussed SEO package options"
    },
    {
      id: "2",
      contactName: "Sarah Rodriguez",
      phoneNumber: "(512) 892-8475",
      direction: "outbound",
      duration: 95,
      status: "completed",
      timestamp: new Date(Date.now() - 7200000),
      notes: "Follow-up call on website project"
    },
    {
      id: "3",
      contactName: "Mike Thompson",
      phoneNumber: "(813) 692-5500",
      direction: "inbound",
      duration: 0,
      status: "missed",
      timestamp: new Date(Date.now() - 10800000)
    }
  ];

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall && activeCall.status === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const initiateCall = async (targetNumber: string, contactName?: string) => {
    if (isDialing || activeCall) return;
    
    setIsDialing(true);
    try {
      // Create call session
      const callSession: CallSession = {
        callId: `call_${Date.now()}`,
        contactName: contactName || "Unknown Contact",
        phoneNumber: formatPhoneNumber(targetNumber),
        startTime: new Date(),
        status: 'connecting',
        duration: 0,
        muted: false,
        onHold: false
      };
      
      setActiveCall(callSession);
      setCallDuration(0);

      // MightyCall Pro web dialer integration
      const cleanedNumber = targetNumber.replace(/\D/g, '');
      const dialerUrl = `https://panel.mightycall.com/dialer?number=${cleanedNumber}&contact=${encodeURIComponent(contactName || 'Contact')}`;
      
      // Open MightyCall Pro web dialer
      const dialerWindow = window.open(
        dialerUrl,
        'mightycall_dialer',
        'width=400,height=600,scrollbars=yes,resizable=yes'
      );

      // Also use device phone dialer as backup
      const telLink = `tel:${cleanedNumber}`;
      window.location.href = telLink;

      // Simulate call connection after 3 seconds
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
        setIsDialing(false);
        
        toast({
          title: "Call Connected",
          description: `Connected to ${formatPhoneNumber(targetNumber)}`,
          className: "bg-green-50 border-green-200 text-green-800"
        });
      }, 3000);

      // Log call attempt
      await apiRequest('POST', '/api/mightycall/log-call', {
        phoneNumber: targetNumber,
        contactName: contactName || 'Unknown',
        callType: 'outbound',
        status: 'initiated',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Call initiation error:', error);
      setIsDialing(false);
      setActiveCall(null);
      
      toast({
        title: "Call Failed",
        description: "Unable to initiate call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const endCall = async () => {
    if (!activeCall) return;
    
    try {
      // Log call completion
      await apiRequest('POST', '/api/mightycall/log-call', {
        callId: activeCall.callId,
        phoneNumber: activeCall.phoneNumber,
        contactName: activeCall.contactName,
        duration: callDuration,
        status: 'completed',
        timestamp: new Date().toISOString()
      });

      setActiveCall(null);
      setCallDuration(0);
      setIsMuted(false);
      setIsOnHold(false);
      
      toast({
        title: "Call Ended",
        description: `Call duration: ${formatDuration(callDuration)}`,
        className: "bg-blue-50 border-blue-200 text-blue-800"
      });

      // Refresh call history
      queryClient.invalidateQueries({ queryKey: ["/api/call-history"] });
      
    } catch (error) {
      console.error('End call error:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone Enabled" : "Microphone Muted",
      description: isMuted ? "You can now speak" : "Your microphone is muted",
      className: "bg-yellow-50 border-yellow-200 text-yellow-800"
    });
  };

  const toggleHold = () => {
    setIsOnHold(!isOnHold);
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        onHold: !isOnHold
      });
    }
    toast({
      title: isOnHold ? "Call Resumed" : "Call On Hold",
      description: isOnHold ? "Call has been resumed" : "Call has been placed on hold",
      className: "bg-purple-50 border-purple-200 text-purple-800"
    });
  };

  if (isFloating && !activeCall) {
    return null;
  }

  const containerClasses = isFloating 
    ? "fixed top-4 right-4 z-50 w-80" 
    : "w-full max-w-md mx-auto";

  return (
    <div className={containerClasses}>
      <Card className="border-l-4 border-l-orange-500 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-600" />
              STARZ Dialer
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={
                  activeCall?.status === 'connected' ? 'border-green-500 text-green-700' :
                  activeCall?.status === 'connecting' ? 'border-yellow-500 text-yellow-700' :
                  'border-gray-500 text-gray-700'
                }
              >
                {activeCall?.status === 'connected' ? 'Connected' :
                 activeCall?.status === 'connecting' ? 'Connecting...' :
                 'Ready'}
              </Badge>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Active Call Display */}
          {activeCall && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div className="text-center space-y-2">
                <UserCircle className="h-12 w-12 mx-auto text-orange-600" />
                <div>
                  <p className="font-semibold text-gray-900">{activeCall.contactName}</p>
                  <p className="text-sm text-gray-600">{activeCall.phoneNumber}</p>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-lg font-mono">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-700">{formatDuration(callDuration)}</span>
                </div>
                
                {activeCall.status === 'connected' && (
                  <div className="flex justify-center space-x-2 mt-3">
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      size="sm"
                      onClick={toggleMute}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant={isOnHold ? "secondary" : "outline"}
                      size="sm"
                      onClick={toggleHold}
                    >
                      {isOnHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={endCall}
                    >
                      <PhoneOff className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dialer Interface */}
          {!activeCall && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="(XXX) XXX-XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-center font-mono"
                />
              </div>
              
              {contact && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                      <p className="text-sm text-gray-600">{contact.company}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => initiateCall(phoneNumber, contact ? `${contact.firstName} ${contact.lastName}` : undefined)}
                disabled={!phoneNumber || isDialing}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isDialing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call Now
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          {!activeCall && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="flex-1"
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          )}

          {/* MightyCall Status */}
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">MightyCall Pro</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Professional calling with web dialer + device fallback
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Call History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Call History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {callHistory.map((call) => (
              <div key={call.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {call.direction === 'outbound' ? (
                      <PhoneOutgoing className="h-4 w-4 text-green-600" />
                    ) : (
                      <PhoneIncoming className="h-4 w-4 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{call.contactName}</p>
                      <p className="text-xs text-gray-600">{call.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">
                      {call.timestamp.toLocaleTimeString()}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={
                        call.status === 'completed' ? 'border-green-200 text-green-700' :
                        call.status === 'missed' ? 'border-red-200 text-red-700' :
                        'border-gray-200 text-gray-700'
                      }
                    >
                      {call.status}
                    </Badge>
                  </div>
                </div>
                {call.status === 'completed' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {formatDuration(call.duration)}
                  </p>
                )}
                {call.notes && (
                  <p className="text-xs text-gray-600 mt-1 italic">{call.notes}</p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dialer Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Audio Notifications</label>
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(e) => setAudioEnabled(e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="p-3 bg-orange-50 rounded border border-orange-200">
              <p className="text-sm font-medium text-orange-800">MightyCall Account</p>
              <p className="text-xs text-orange-600">
                Account: 4f917f13-aae1-401d-8241-010db91da5b2
              </p>
              <p className="text-xs text-orange-600">
                Plan: Pro (Web Dialer Enabled)
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}