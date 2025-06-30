import { useState, useEffect } from "react";
import { Phone, PhoneCall, PhoneOff, Volume2, VolumeX, Users, Clock, History, Settings, User, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MightyCallWebDialer from "@/components/mightycall-web-dialer";

interface CallLog {
  id: string;
  phoneNumber: string;
  contactName?: string;
  duration: number;
  timestamp: Date;
  status: 'completed' | 'missed' | 'busy' | 'failed' | 'active';
  direction: 'inbound' | 'outbound';
  notes?: string;
}

interface ActiveCall {
  id: string;
  phoneNumber: string;
  contactName?: string;
  startTime: Date;
  isOnHold: boolean;
  isMuted: boolean;
  status: 'connecting' | 'active' | 'holding' | 'transferring';
}

export function AdvancedPhoneSystem() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [extension, setExtension] = useState("");
  const [isDialing, setIsDialing] = useState(false);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transferNumber, setTransferNumber] = useState("");
  const [conferenceNumbers, setConferenceNumbers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  // Initialize with recent call logs
  useEffect(() => {
    const recentCalls: CallLog[] = [
      {
        id: '1',
        phoneNumber: '(212) 555-0123',
        contactName: 'Sarah Johnson - HVAC Contractor',
        duration: 420,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        status: 'completed',
        direction: 'outbound',
        notes: 'Discussed SEO package pricing'
      },
      {
        id: '2',
        phoneNumber: '(718) 555-0456',
        contactName: 'Mike Chen - Plumbing Services',
        duration: 185,
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        status: 'missed',
        direction: 'inbound',
        notes: 'Callback requested for website quote'
      },
      {
        id: '3',
        phoneNumber: '(213) 555-0789',
        contactName: 'Lisa Rodriguez - Carpet Cleaning',
        duration: 312,
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        status: 'completed',
        direction: 'outbound',
        notes: 'Closed deal for GMB optimization package'
      },
      {
        id: '4',
        phoneNumber: '(312) 555-0321',
        contactName: 'David Thompson - Electrical',
        duration: 0,
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        status: 'busy',
        direction: 'outbound',
        notes: 'Follow up scheduled for tomorrow'
      }
    ];
    setCallLogs(recentCalls);
  }, []);

  const handleMakeCall = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to call",
        variant: "destructive",
      });
      return;
    }

    setIsDialing(true);
    
    try {
      // MightyCall API integration
      const response = await fetch('/api/mightycall/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          contactName: contactName || 'Unknown Contact'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Create active call
        const newActiveCall: ActiveCall = {
          id: result.callId || Date.now().toString(),
          phoneNumber,
          contactName: contactName || 'Unknown Contact',
          startTime: new Date(),
          isOnHold: false,
          isMuted: false,
          status: 'connecting'
        };
        
        setActiveCall(newActiveCall);
        
        // Open MightyCall web dialer if available
        if (result.webDialerUrl) {
          window.open(result.webDialerUrl, '_blank', 'width=400,height=600');
        }
        
        toast({
          title: "Call Initiated",
          description: `Calling ${contactName || phoneNumber}...`,
        });

        // Simulate call connection after 3 seconds
        setTimeout(() => {
          if (newActiveCall) {
            setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
            toast({
              title: "Call Connected",
              description: `Connected to ${contactName || phoneNumber}`,
            });
          }
        }, 3000);

      } else {
        throw new Error('Failed to initiate call');
      }
    } catch (error) {
      toast({
        title: "Call Failed",
        description: "Unable to connect call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDialing(false);
    }
  };

  const handleEndCall = () => {
    if (activeCall) {
      const duration = Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000);
      
      // Add to call logs
      const completedCall: CallLog = {
        id: activeCall.id,
        phoneNumber: activeCall.phoneNumber,
        contactName: activeCall.contactName,
        duration,
        timestamp: activeCall.startTime,
        status: 'completed',
        direction: 'outbound',
        notes: 'Call completed successfully'
      };
      
      setCallLogs(prev => [completedCall, ...prev]);
      setActiveCall(null);
      setIsMuted(false);
      setIsRecording(false);
      
      toast({
        title: "Call Ended",
        description: `Call duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      });
    }
  };

  const handleHoldCall = () => {
    if (activeCall) {
      setActiveCall(prev => prev ? { ...prev, isOnHold: !prev.isOnHold } : null);
      toast({
        title: activeCall.isOnHold ? "Call Resumed" : "Call On Hold",
        description: activeCall.isOnHold ? "Call resumed" : "Call placed on hold",
      });
    }
  };

  const handleMuteCall = () => {
    setIsMuted(!isMuted);
    if (activeCall) {
      setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
    }
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "Microphone unmuted" : "Microphone muted",
    });
  };

  const handleTransferCall = () => {
    if (!transferNumber.trim()) {
      toast({
        title: "Transfer Number Required",
        description: "Please enter a number to transfer the call",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transfer Initiated",
      description: `Transferring call to ${transferNumber}...`,
    });
    
    // Simulate transfer completion
    setTimeout(() => {
      handleEndCall();
      toast({
        title: "Transfer Complete",
        description: `Call transferred to ${transferNumber}`,
      });
      setTransferNumber("");
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      missed: 'destructive', 
      busy: 'secondary',
      failed: 'destructive',
      active: 'default'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phone System</h1>
          <p className="text-muted-foreground">MightyCall Pro Integration - Traffik Boosters</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <Phone className="w-4 h-4 mr-2" />
          (877) 840-6250
        </Badge>
      </div>

      {/* Active Call Display */}
      {activeCall && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-green-600" />
                Active Call - {activeCall.contactName || activeCall.phoneNumber}
              </div>
              <Badge variant={activeCall.status === 'active' ? 'default' : 'secondary'}>
                {activeCall.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">{activeCall.phoneNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Duration: {formatDuration(Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000))}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeCall.isOnHold ? "default" : "outline"}
                  size="sm"
                  onClick={handleHoldCall}
                >
                  {activeCall.isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {activeCall.isOnHold ? "Resume" : "Hold"}
                </Button>
                <Button
                  variant={isMuted ? "default" : "outline"}
                  size="sm"
                  onClick={handleMuteCall}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="w-4 h-4" />
                  End Call
                </Button>
              </div>
            </div>
            
            {/* Transfer Controls */}
            <div className="flex gap-2">
              <Input
                placeholder="Transfer to number..."
                value={transferNumber}
                onChange={(e) => setTransferNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTransferCall} disabled={!transferNumber.trim()}>
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="dialer" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dialer">Dialer</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
          <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
          <TabsTrigger value="conference">Conference</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dialer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MightyCall Web Dialer */}
            <div>
              <MightyCallWebDialer 
                phoneNumber={phoneNumber}
                contactName={contactName}
                onCallStatusChange={(status) => {
                  if (status === 'connected') {
                    setActiveCall({
                      id: `call_${Date.now()}`,
                      phoneNumber,
                      contactName,
                      startTime: new Date(),
                      isOnHold: false,
                      isMuted: false,
                      status: 'active'
                    });
                  } else if (status === 'ended' || status === 'idle') {
                    setActiveCall(null);
                  }
                }}
              />
            </div>

            {/* Quick Call Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Dial</CardTitle>
                <CardDescription>
                  Frequently called numbers and contacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setPhoneNumber("8778406250");
                      setContactName("Traffik Boosters Main");
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Traffik Boosters Main: (877) 840-6250
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setPhoneNumber("5551234567");
                      setContactName("Customer Service");
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Customer Service: (555) 123-4567
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setPhoneNumber("5559876543");
                      setContactName("Technical Support");
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Technical Support: (555) 987-6543
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quickPhone">Phone Number</Label>
                      <Input
                        id="quickPhone"
                        type="tel"
                        placeholder="Enter number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quickContact">Contact Name</Label>
                      <Input
                        id="quickContact"
                        placeholder="Contact name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legacy Call Button (Hidden) */}
          <div style={{ display: 'none' }}>
            <Button 
              onClick={handleMakeCall} 
              disabled={isDialing || !!activeCall}
              className="w-full"
              size="lg"
            >
                {isDialing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Make Call
                  </>
                )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>
                View your recent call activity and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {callLogs.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        call.direction === 'inbound' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Phone className={`w-4 h-4 ${
                          call.direction === 'inbound' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{call.contactName || call.phoneNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {call.phoneNumber} • {call.timestamp.toLocaleString()}
                        </p>
                        {call.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{call.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(call.status)}
                      <span className="text-sm text-muted-foreground">
                        {call.duration > 0 ? formatDuration(call.duration) : '-'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPhoneNumber(call.phoneNumber)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supervisor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                MightyCall Contact Center Supervisor
              </CardTitle>
              <CardDescription>
                Access your Contact Center supervisor dashboard for call monitoring, analytics, and team management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Account Information</h4>
                    <p className="text-sm text-blue-700">Account ID: 4f917f13-aae1-401d-8241-010db91da5b2</p>
                    <p className="text-sm text-blue-700">Main Number: 8778406250</p>
                    <p className="text-sm text-blue-700">Domain: traffikboosters.mightycall.com</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">System Status</h4>
                    <p className="text-sm text-green-700">✓ MightyCall Pro Plan Active</p>
                    <p className="text-sm text-green-700">✓ Web Dialer Enabled</p>
                    <p className="text-sm text-green-700">✓ Call Recording Available</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.open('https://console.mightycall.com/ContactCenter/supervisor', '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Open Supervisor Dashboard
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('https://panel.mightycall.com', '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    MightyCall Admin Panel
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('https://traffikboosters.mightycall.com', '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Company Portal
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toast({ title: "Feature Available", description: "Access supervisor dashboard for live call monitoring" })}
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Monitor Calls
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toast({ title: "Feature Available", description: "View call analytics in supervisor dashboard" })}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Call Reports
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Supervisor Features</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Real-time call monitoring and whisper coaching</li>
                  <li>• Call queue management and agent status</li>
                  <li>• Performance analytics and reporting</li>
                  <li>• Call recording playback and management</li>
                  <li>• Agent productivity tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conference Calls</CardTitle>
              <CardDescription>
                Set up and manage multi-party conference calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Conference Bridge: (877) 840-6250 ext. 9999</Label>
                </div>
                <Button className="w-full" disabled>
                  <Users className="w-4 h-4 mr-2" />
                  Start Conference Call (Pro Feature)
                </Button>
                <p className="text-sm text-muted-foreground">
                  Conference calling requires MightyCall Pro plan upgrade
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phone System Settings</CardTitle>
              <CardDescription>
                Configure your MightyCall integration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Information</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Account ID</Label>
                    <p className="font-mono text-sm">4f917f13-aae1-401d-8241-010db91da5b2</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Main Number</Label>
                    <p className="font-mono text-sm">(877) 840-6250</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Call Recording</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically record all calls for training purposes
                  </p>
                </div>
                <Switch 
                  checked={isRecording}
                  onCheckedChange={setIsRecording}
                />
              </div>

              <div className="space-y-2">
                <Label>Plan Status</Label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  MightyCall Pro - Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}