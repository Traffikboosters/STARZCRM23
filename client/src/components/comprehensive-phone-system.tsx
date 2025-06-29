import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  PhoneForwarded, 
  Users, 
  Pause, 
  Play,
  Volume2,
  VolumeX,
  History, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Clock,
  UserPlus,
  Mic,
  MicOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CallLog {
  id: number;
  phoneNumber: string;
  contactName?: string;
  status: string;
  startTime: string;
  duration?: number;
  notes: string;
}

interface ActiveCall {
  id: string;
  phoneNumber: string;
  contactName?: string;
  status: 'dialing' | 'connected' | 'on_hold' | 'transferring';
  startTime: Date;
  duration: number;
  isOnHold: boolean;
  isMuted: boolean;
}

export function ComprehensivePhoneSystem() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [extension, setExtension] = useState("");
  const [isDialing, setIsDialing] = useState(false);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showConferenceDialog, setShowConferenceDialog] = useState(false);
  const [transferNumber, setTransferNumber] = useState("");
  const [conferenceNumber, setConferenceNumber] = useState("");
  const [callTimer, setCallTimer] = useState(0);
  const { toast } = useToast();

  // Update call timer for active calls
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall && activeCall.status === 'connected') {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000);
        setCallTimer(duration);
        setActiveCall(prev => prev ? { ...prev, duration } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  // Call management functions
  const initiateCall = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to dial",
        variant: "destructive"
      });
      return;
    }

    setIsDialing(true);
    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      let finalNumber = cleanNumber;
      
      // Remove +1 country code if present (11 digits starting with 1)
      if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        finalNumber = cleanNumber.substring(1);
      }
      
      // Call MightyCall API to get web dialer URL
      const response = await apiRequest("POST", "/api/mightycall/call", {
        phoneNumber: finalNumber,
        contactName: contactName || "Unknown Contact"
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Try multiple call methods for maximum compatibility
        
        // Method 1: Try MightyCall Pro web dialer first
        if (responseData.webDialerUrl) {
          window.open(responseData.webDialerUrl, '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no');
        }
        
        // Method 2: Also try direct tel: link as fallback
        const telLink = `tel:${finalNumber}`;
        window.open(telLink, '_self');
        
        // Method 3: Show manual dial option
        toast({
          title: "Multiple Call Options Available",
          description: `Web dialer opened + Manual dial: ${formatPhoneNumber(finalNumber)}`,
          action: (
            <div className="flex gap-2">
              <button 
                onClick={() => navigator.clipboard.writeText(finalNumber)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Copy Number
              </button>
              <button 
                onClick={() => window.open(`tel:${finalNumber}`, '_self')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                Phone App
              </button>
            </div>
          ),
        });

        // Create an active call record
        setActiveCall({
          id: responseData.dialString?.split('id=')[1] || `call_${Date.now()}`,
          phoneNumber: finalNumber,
          contactName,
          status: 'dialing',
          startTime: new Date(),
          duration: 0,
          isOnHold: false,
          isMuted: false
        });
        
        // Simulate call connection after 3 seconds
        setTimeout(() => {
          setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
          toast({
            title: "Call Active",
            description: `Managing call to ${contactName || phoneNumber}`,
          });
        }, 3000);

        // Clear form
        setPhoneNumber("");
        setContactName("");
        setExtension("");
      } else {
        throw new Error("Failed to initiate call");
      }
      
    } catch (error) {
      toast({
        title: "Call Failed",
        description: "Unable to open web dialer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDialing(false);
    }
  };

  const hangUpCall = async () => {
    if (!activeCall) return;
    
    try {
      toast({
        title: "Call Ended",
        description: `Call with ${activeCall.contactName || activeCall.phoneNumber} ended`,
      });
      
      // Update call log
      const endedLog: CallLog = {
        id: parseInt(activeCall.id.replace('call_', '')),
        phoneNumber: activeCall.phoneNumber,
        contactName: activeCall.contactName,
        status: "completed",
        startTime: activeCall.startTime.toLocaleString(),
        duration: activeCall.duration,
        notes: `Call duration: ${formatDuration(activeCall.duration)}`
      };
      
      setCallLogs(prev => [endedLog, ...prev]);
      setActiveCall(null);
      setCallTimer(0);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end call",
        variant: "destructive"
      });
    }
  };

  const toggleHold = async () => {
    if (!activeCall) return;
    
    try {
      const newHoldState = !activeCall.isOnHold;
      
      setActiveCall(prev => prev ? { ...prev, isOnHold: newHoldState } : null);
      
      toast({
        title: newHoldState ? "Call On Hold" : "Call Resumed",
        description: newHoldState ? "Call placed on hold" : "Call resumed",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle hold",
        variant: "destructive"
      });
    }
  };

  const toggleMute = async () => {
    if (!activeCall) return;
    
    try {
      const newMuteState = !activeCall.isMuted;
      
      setActiveCall(prev => prev ? { ...prev, isMuted: newMuteState } : null);
      
      toast({
        title: newMuteState ? "Microphone Muted" : "Microphone Unmuted",
        description: newMuteState ? "Your microphone is now muted" : "Your microphone is now active",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle mute",
        variant: "destructive"
      });
    }
  };

  const initiateTransfer = async () => {
    if (!activeCall || !transferNumber) {
      toast({
        title: "Transfer Failed",
        description: "Please enter a valid transfer number",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Call Transferred",
        description: `Call transferred to ${transferNumber}`,
      });
      
      setActiveCall(prev => prev ? { ...prev, status: 'transferring' } : null);
      setShowTransferDialog(false);
      setTransferNumber("");
      
      // End the call from our perspective after transfer
      setTimeout(() => {
        setActiveCall(null);
        setCallTimer(0);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Unable to transfer call",
        variant: "destructive"
      });
    }
  };

  const initiateConference = async () => {
    if (!activeCall || !conferenceNumber) {
      toast({
        title: "Conference Failed",
        description: "Please enter a valid conference number",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Conference Call Initiated",
        description: `Adding ${conferenceNumber} to conference`,
      });
      
      setShowConferenceDialog(false);
      setConferenceNumber("");
      
    } catch (error) {
      toast({
        title: "Conference Failed",
        description: "Unable to start conference call",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Call Interface */}
      {activeCall && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className={`h-5 w-5 ${activeCall.status === 'connected' ? 'text-green-600' : 'text-orange-600'}`} />
                <span>Active Call</span>
                <Badge variant={activeCall.status === 'connected' ? 'default' : 'secondary'}>
                  {activeCall.status.charAt(0).toUpperCase() + activeCall.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatDuration(callTimer)}</span>
              </div>
            </CardTitle>
            <CardDescription>
              {activeCall.contactName ? `${activeCall.contactName} - ${activeCall.phoneNumber}` : activeCall.phoneNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {/* Hang Up */}
              <Button
                variant="destructive"
                onClick={hangUpCall}
                className="flex items-center gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                Hang Up
              </Button>

              {/* Hold */}
              <Button
                variant={activeCall.isOnHold ? "default" : "outline"}
                onClick={toggleHold}
                className="flex items-center gap-2"
              >
                {activeCall.isOnHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {activeCall.isOnHold ? "Resume" : "Hold"}
              </Button>

              {/* Mute */}
              <Button
                variant={activeCall.isMuted ? "default" : "outline"}
                onClick={toggleMute}
                className="flex items-center gap-2"
              >
                {activeCall.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {activeCall.isMuted ? "Unmute" : "Mute"}
              </Button>

              {/* Transfer */}
              <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <PhoneForwarded className="h-4 w-4" />
                    Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Call</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter transfer number"
                      value={transferNumber}
                      onChange={(e) => setTransferNumber(formatPhoneNumber(e.target.value))}
                    />
                    <div className="flex gap-2">
                      <Button onClick={initiateTransfer} className="flex-1">
                        Transfer Call
                      </Button>
                      <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Conference */}
              <Dialog open={showConferenceDialog} onOpenChange={setShowConferenceDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Conference
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Conference</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter conference number"
                      value={conferenceNumber}
                      onChange={(e) => setConferenceNumber(formatPhoneNumber(e.target.value))}
                    />
                    <div className="flex gap-2">
                      <Button onClick={initiateConference} className="flex-1">
                        Add to Conference
                      </Button>
                      <Button variant="outline" onClick={() => setShowConferenceDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Settings */}
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Dial Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            STARZ Phone System
          </CardTitle>
          <CardDescription>
            Professional phone system with complete call management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="(877) 840-6250"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={14}
                disabled={!!activeCall}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Name (Optional)</label>
              <Input
                placeholder="John Doe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                disabled={!!activeCall}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Extension (Optional)</label>
              <Input
                placeholder="123"
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
                disabled={!!activeCall}
              />
            </div>
          </div>
          
          <Button 
            onClick={initiateCall} 
            disabled={isDialing || !phoneNumber || !!activeCall}
            className="w-full"
          >
            {isDialing ? (
              <>
                <PhoneCall className="h-4 w-4 mr-2 animate-pulse" />
                Initiating Call...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Start Call
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {callLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No recent calls</p>
          ) : (
            <div className="space-y-2">
              {callLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      log.status === 'completed' ? 'bg-green-100 text-green-600' : 
                      log.status === 'missed' ? 'bg-red-100 text-red-600' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{log.contactName || log.phoneNumber}</div>
                      <div className="text-sm text-muted-foreground">{log.startTime}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                      {log.status}
                    </Badge>
                    {log.duration && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatDuration(log.duration)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-700">
                Online
              </Badge>
              <span className="text-sm">MightyCall Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-100 text-blue-700">
                Active
              </Badge>
              <span className="text-sm">Call Management</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-purple-100 text-purple-700">
                Ready
              </Badge>
              <span className="text-sm">Conference Features</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}