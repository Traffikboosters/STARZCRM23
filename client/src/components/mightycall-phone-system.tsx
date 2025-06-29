import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, History, Settings, AlertCircle, CheckCircle } from "lucide-react";
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

export function MightyCallPhoneSystem() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [extension, setExtension] = useState("");
  const [isDialing, setIsDialing] = useState(false);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const { toast } = useToast();

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
      const response = await apiRequest("POST", "/api/mightycall/initiate-call", {
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        contactName,
        extension
      });

      if (response.ok) {
        const result = await response.json();
        
        // Create clickable tel: link for immediate dialing (remove country code)
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        let finalNumber = cleanNumber;
        
        // Remove +1 country code if present (11 digits starting with 1)
        if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
          finalNumber = cleanNumber.substring(1);
        }
        
        const dialString = extension ? `tel:${finalNumber},,${extension}` : `tel:${finalNumber}`;
        
        // Open phone dialer
        window.location.href = dialString;
        
        toast({
          title: "Call Initiated",
          description: `Calling ${contactName || phoneNumber}${extension ? ` ext. ${extension}` : ''}`,
        });

        // Add to call logs
        const newLog: CallLog = {
          id: result.callId,
          phoneNumber: phoneNumber + (extension ? ` ext. ${extension}` : ''),
          contactName,
          status: "initiated",
          startTime: new Date().toLocaleString(),
          notes: `Call via MightyCall system`
        };
        
        setCallLogs(prev => [newLog, ...prev]);
        
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
        description: "Unable to initiate call. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDialing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Dial Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            MightyCall Dialer
          </CardTitle>
          <CardDescription>
            Enter phone number to initiate call through your MightyCall system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="(954) 793-9065"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Name (Optional)</label>
              <Input
                placeholder="John Doe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Extension (Optional)</label>
              <Input
                placeholder="123"
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
          
          <Button 
            onClick={initiateCall} 
            disabled={isDialing || !phoneNumber}
            className="w-full md:w-auto"
          >
            <PhoneCall className="h-4 w-4 mr-2" />
            {isDialing ? "Initiating Call..." : "Call Now"}
          </Button>
        </CardContent>
      </Card>

      {/* MightyCall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">MightyCall Account</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Connected (traffikboosters@gmail.com)
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Integration</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                Limited (Account Plan)
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Call Logging</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Active
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Your MightyCall account is configured but API access is limited. 
              Calls are logged locally and will open your default phone app for dialing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Call Logs */}
      {callLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {callLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{log.contactName || "Unknown Contact"}</div>
                    <div className="text-sm text-gray-500">{log.phoneNumber}</div>
                    <div className="text-xs text-gray-400">{log.startTime}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === "completed" ? "default" : "secondary"}>
                      {log.status}
                    </Badge>
                    {log.duration && (
                      <div className="text-xs text-gray-400 mt-1">
                        {Math.floor(log.duration / 60)}:{(log.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}