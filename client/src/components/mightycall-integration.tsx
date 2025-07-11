import { useState, useEffect } from "react";
import { Phone, PhoneCall, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface CallLog {
  id: string;
  phoneNumber: string;
  contactName?: string;
  duration: number;
  timestamp: Date;
  status: 'completed' | 'missed' | 'busy' | 'failed';
  direction: 'inbound' | 'outbound';
}

interface POWERDIALSConfig {
  apiKey: string;
  accountId: string;
  phoneNumber: string;
  isEnabled: boolean;
}

export default function POWERDIALSIntegration() {
  const [config, setConfig] = useState<POWERDIALSConfig>({
    apiKey: 'Your POWERDIALS API Key',
    accountId: '4f917f13-aae1-401d-8241-010db91da5b2',
    phoneNumber: '+1-877-840-6250',
    isEnabled: true
  });
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [activeCall, setActiveCall] = useState<CallLog | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Initialize with demo data
  useEffect(() => {
    const demoLogs: CallLog[] = [
      {
        id: '1',
        phoneNumber: '+1-555-0123',
        contactName: 'John Smith',
        duration: 245,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'completed',
        direction: 'outbound'
      },
      {
        id: '2',
        phoneNumber: '+1-555-0456',
        contactName: 'Sarah Johnson',
        duration: 0,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'missed',
        direction: 'inbound'
      },
      {
        id: '3',
        phoneNumber: '+1-555-0789',
        contactName: 'Mike Wilson',
        duration: 180,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        status: 'completed',
        direction: 'outbound'
      }
    ];
    setCallLogs(demoLogs);
  }, []);

  const handleClickToCall = async (phoneNumber: string, contactName?: string) => {
    if (!config.isEnabled) {
      toast({
        title: "POWERDIALS Disabled",
        description: "Please enable POWERDIALS integration first.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const response = await fetch('/api/powerdials/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          contactName
        })
      });

      const result = await response.json();

      if (result.success) {
        const newCall: CallLog = {
          id: result.callId,
          phoneNumber: result.phoneNumber,
          contactName,
          duration: 0,
          timestamp: new Date(),
          status: 'completed',
          direction: 'outbound'
        };

        // Log the call in backend
        await fetch('/api/call-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: result.phoneNumber,
            status: "initiated",
            userId: 1,
            direction: "outbound",
            startTime: new Date().toISOString(),
            notes: `Core plan call via ${result.method}`,
            contactName: contactName || ""
          })
        });

        // Open phone dialer for Core plan
        const telLink = `tel:${phoneNumber.replace(/\D/g, '')}`;
        window.open(telLink, '_self');

        setCallLogs(prev => [newCall, ...prev]);
        
        toast({
          title: "Call Ready",
          description: `Opening dialer for ${contactName || phoneNumber}. Use your POWERDIALS app to complete the call.`,
        });

      } else {
        throw new Error(result.message || 'Call preparation failed');
      }
    } catch (error) {
      toast({
        title: "Call Setup Failed",
        description: "Unable to prepare call. Check your POWERDIALS configuration.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndCall = () => {
    if (activeCall) {
      const completedCall = {
        ...activeCall,
        duration: Math.floor(Math.random() * 180) + 30,
        status: 'completed' as const
      };
      setCallLogs(prev => [completedCall, ...prev]);
      setActiveCall(null);
      toast({
        title: "Call Ended",
        description: "Call has been disconnected.",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            POWERDIALS Integration
          </CardTitle>
          <CardDescription>
            Configure your POWERDIALS settings for click-to-call functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your POWERDIALS API key"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="Enter your POWERDIALS Account ID"
                value={config.accountId}
                onChange={(e) => setConfig(prev => ({ ...prev, accountId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Your Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="+1-555-0123"
                value={config.phoneNumber}
                onChange={(e) => setConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={config.isEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isEnabled: checked }))}
              />
              <Label htmlFor="enabled">Enable POWERDIALS Integration</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Call Section */}
      {activeCall && (
        <Card className="border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-blue-600 animate-pulse" />
                Active Call
              </div>
              <Badge variant="secondary">Connected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{activeCall.contactName || 'Unknown Contact'}</p>
                <p className="text-sm text-gray-600">{activeCall.phoneNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-4 w-4" />
                  End Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Call Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Call</CardTitle>
          <CardDescription>
            Make a quick call to any number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter phone number"
              className="flex-1"
              id="quickCallNumber"
            />
            <Button
              onClick={() => {
                const input = document.getElementById('quickCallNumber') as HTMLInputElement;
                if (input?.value) {
                  handleClickToCall(input.value);
                  input.value = '';
                }
              }}
              disabled={isConnecting || !config.isEnabled}
            >
              {isConnecting ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <PhoneCall className="h-4 w-4" />
              )}
              Call
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>
            Your call history with POWERDIALS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {callLogs.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${call.direction === 'inbound' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <Phone className={`h-4 w-4 ${call.direction === 'inbound' ? 'text-green-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{call.contactName || 'Unknown Contact'}</p>
                    <p className="text-sm text-gray-600">{call.phoneNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(call.status)}>
                    {call.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {call.duration > 0 ? formatDuration(call.duration) : 'No answer'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {call.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClickToCall(call.phoneNumber, call.contactName)}
                  disabled={isConnecting || !config.isEnabled}
                >
                  <PhoneCall className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}