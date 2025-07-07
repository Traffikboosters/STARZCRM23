import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, User, Star, Clock } from "lucide-react";
import PowerDials from "./powerdials-component";
import { CallLogDisplay } from "./call-log-display";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import type { Contact } from "@shared/schema";

interface CallLog {
  contact: string;
  number: string;
  timestamp: string;
  outcome: string;
  contactId?: number;
  userId?: number;
}

interface CRMPowerDialsIntegrationProps {
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact | null) => void;
}

export default function CRMPowerDialsIntegration({ 
  selectedContact, 
  onContactSelect 
}: CRMPowerDialsIntegrationProps) {
  const { toast } = useToast();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  
  // Get current user from auth service
  const currentUser = authService.getCurrentUser();

  // Query recent contacts for testing
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Sample contacts for demonstration
  const sampleContacts = contacts.slice(0, 3);

  const handleCallLog = async (log: CallLog) => {
    try {
      const userId = currentUser?.id;
      const callLogData = { 
        ...log, 
        userId,
        contactId: selectedContact?.id,
        contactName: selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : log.contact,
        phoneNumber: selectedContact?.phone || log.number,
        outcome: log.outcome || 'completed',
        duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        notes: `Call with ${log.contact} - ${log.outcome}`
      };

      const response = await fetch("/api/call-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(callLogData),
      });

      if (response.ok) {
        const savedLog = await response.json();
        setCallLogs(prev => [savedLog, ...prev]);
        toast({
          title: "Call Logged",
          description: `Call with ${log.contact} logged successfully`,
        });
      } else {
        throw new Error('Failed to save call log');
      }
    } catch (error) {
      console.error('Call logging error:', error);
      toast({
        title: "Logging Error",
        description: "Failed to save call log",
        variant: "destructive",
      });
    }
  };

  const formatContactName = (contact: Contact) => {
    return `${contact.firstName} ${contact.lastName}`;
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove any existing formatting
    const cleaned = phone.replace(/\D/g, '');
    // Add formatting for US numbers
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    return phone;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Contact Selection and PowerDials */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              PowerDials Contact Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample Contact Buttons */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-600">Select Contact for Testing:</h4>
              <div className="grid gap-2">
                {sampleContacts.map((contact) => (
                  <Button
                    key={contact.id}
                    variant={selectedContact?.id === contact.id ? "default" : "outline"}
                    onClick={() => onContactSelect(contact)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{formatContactName(contact)}</div>
                        <div className="text-xs text-gray-500">{contact.phone}</div>
                      </div>
                      {contact.priority === 'high' && (
                        <Star className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
              {selectedContact && (
                <Button 
                  variant="ghost" 
                  onClick={() => onContactSelect(null)}
                  className="w-full"
                >
                  Clear Selection (Manual Dialing Mode)
                </Button>
              )}
            </div>

            {/* Current Selection Display */}
            {selectedContact && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {formatContactName(selectedContact)}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-300">
                      {selectedContact.phone}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      {selectedContact.company} • {selectedContact.leadStatus}
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    Selected
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PowerDials Component */}
        <PowerDials
          contact={selectedContact ? {
            name: formatContactName(selectedContact),
            phone: formatPhoneNumber(selectedContact.phone || '')
          } : undefined}
          onCallLog={handleCallLog}
        />

        {/* Integration Code Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Implementation Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto">
              <div className="text-blue-600 dark:text-blue-400">&lt;PowerDials</div>
              <div className="ml-2 text-green-600 dark:text-green-400">
                contact={selectedContact ? `{${JSON.stringify({
                  name: formatContactName(selectedContact),
                  phone: formatPhoneNumber(selectedContact.phone || '')
                }, null, 2).split('\n').join('\n    ')}}` : 'undefined'}
              </div>
              <div className="ml-2 text-purple-600 dark:text-purple-400">
                onCallLog={`{async (log) => {`}
              </div>
              <div className="ml-4 text-gray-600 dark:text-gray-400">
                const userId = currentUser?.id;
              </div>
              <div className="ml-4 text-gray-600 dark:text-gray-400">
                await fetch("/api/call-logs", {`{`}
              </div>
              <div className="ml-6 text-gray-600 dark:text-gray-400">
                method: "POST",
              </div>
              <div className="ml-6 text-gray-600 dark:text-gray-400">
                headers: {`{ "Content-Type": "application/json" }`},
              </div>
              <div className="ml-6 text-gray-600 dark:text-gray-400">
                body: JSON.stringify({`{ ...log, userId }`}),
              </div>
              <div className="ml-4 text-gray-600 dark:text-gray-400">
                {`});`}
              </div>
              <div className="ml-2 text-purple-600 dark:text-purple-400">
                {`}}`}
              </div>
              <div className="text-blue-600 dark:text-blue-400">/&gt;</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Logs Display */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Call Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CallLogDisplay logs={callLogs} />
            {callLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No calls logged yet</p>
                <p className="text-sm">Make a call using PowerDials to see activity here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Session Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{callLogs.length}</div>
                <div className="text-xs text-gray-500">Calls Made</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {callLogs.filter(log => log.outcome === 'completed').length}
                </div>
                <div className="text-xs text-gray-500">Successful</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}