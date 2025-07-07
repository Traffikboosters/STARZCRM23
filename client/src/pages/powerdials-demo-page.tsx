import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CRMPowerDialsIntegration from "@/components/crm-powerdials-integration";
import PowerDials from "@/components/powerdials-component";
import { CallLogDisplay } from "@/components/call-log-display";
import { authService } from "@/lib/auth";
import { Phone, Code, Users, Activity } from "lucide-react";
import type { Contact } from "@shared/schema";

interface CallLog {
  contact: string;
  number: string;
  timestamp: string;
  outcome: string;
}

export default function PowerDialsDemoPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [manualCallLogs, setManualCallLogs] = useState<CallLog[]>([]);
  
  // Get current user
  const currentUser = authService.getCurrentUser();

  const handleManualCallLog = async (log: CallLog) => {
    try {
      const userId = currentUser?.id;
      const response = await fetch("/api/call-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...log, userId }),
      });
      
      if (response.ok) {
        setManualCallLogs(prev => [log, ...prev]);
      }
    } catch (error) {
      console.error('Call logging failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">PowerDials Integration Demo</h1>
        <p className="text-gray-600">
          Complete demonstration of PowerDials component with contact integration and call logging
        </p>
      </div>

      <Tabs defaultValue="contact-integration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact-integration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contact Integration
          </TabsTrigger>
          <TabsTrigger value="manual-dialing" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Manual Dialing
          </TabsTrigger>
          <TabsTrigger value="implementation" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code Examples
          </TabsTrigger>
          <TabsTrigger value="call-logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Monitor
          </TabsTrigger>
        </TabsList>

        {/* Contact Integration Tab */}
        <TabsContent value="contact-integration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>PowerDials with Contact Integration</CardTitle>
              <p className="text-sm text-gray-600">
                This demonstrates your exact PowerDials pattern with contact object and call logging
              </p>
            </CardHeader>
            <CardContent>
              <CRMPowerDialsIntegration 
                selectedContact={selectedContact}
                onContactSelect={setSelectedContact}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Dialing Tab */}
        <TabsContent value="manual-dialing" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Manual Dialing Mode</CardTitle>
                <p className="text-sm text-gray-600">
                  PowerDials without contact prop - manual phone number entry
                </p>
              </CardHeader>
              <CardContent>
                <PowerDials onCallLog={handleManualCallLog} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Manual Dialing Call Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <CallLogDisplay logs={manualCallLogs} />
                {manualCallLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No manual calls logged yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Implementation Examples Tab */}
        <TabsContent value="implementation" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Exact PowerDials Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-blue-400">&lt;<span className="text-yellow-400">PowerDials</span></div>
                  <div className="ml-2">
                    <span className="text-red-400">contact</span>=
                    <span className="text-orange-400">{`{selectedContact}`}</span>
                  </div>
                  <div className="ml-2">
                    <span className="text-red-400">onCallLog</span>=
                    <span className="text-orange-400">{`{async (log) => {`}</span>
                  </div>
                  <div className="ml-4 text-gray-300">const userId = currentUser?.id;</div>
                  <div className="ml-4 text-gray-300">await fetch("/api/call-logs", {`{`}</div>
                  <div className="ml-6 text-gray-300">method: "POST",</div>
                  <div className="ml-6 text-gray-300">headers: {`{ "Content-Type": "application/json" }`},</div>
                  <div className="ml-6 text-gray-300">body: JSON.stringify({`{ ...log, userId }`}),</div>
                  <div className="ml-4 text-gray-300">{`});`}</div>
                  <div className="ml-2 text-orange-400">{`}}`}</div>
                  <div className="text-blue-400">/&gt;</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Mode Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm font-mono">
                    <div className="text-blue-600">// Contact pre-selected</div>
                    <div>&lt;PowerDials</div>
                    <div className="ml-2 text-green-600">contact={`{{`}</div>
                    <div className="ml-4">name: "Jane Doe",</div>
                    <div className="ml-4">phone: "+1234567890"</div>
                    <div className="ml-2 text-green-600">{`}}`}</div>
                    <div className="ml-2 text-purple-600">onCallLog={`{handleCallLog}`}</div>
                    <div>/&gt;</div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    • Contact name and phone pre-filled<br/>
                    • One-click dialing<br/>
                    • Automatic call logging with contact info
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manual Mode Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm font-mono">
                    <div className="text-blue-600">// No contact prop</div>
                    <div>&lt;PowerDials</div>
                    <div className="ml-2 text-purple-600">onCallLog={`{handleCallLog}`}</div>
                    <div>/&gt;</div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    • Manual phone number entry<br/>
                    • Flexible dialing interface<br/>
                    • Still logs all call activity
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Call Logs Monitor Tab */}
        <TabsContent value="call-logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Call Activity Monitor</CardTitle>
              <p className="text-sm text-gray-600">
                All calls made through PowerDials are automatically logged to the /api/call-logs endpoint
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">Live</div>
                  <div className="text-sm text-blue-600">Call Logging</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">Auto</div>
                  <div className="text-sm text-green-600">Contact Integration</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">Real-time</div>
                  <div className="text-sm text-purple-600">API Updates</div>
                </div>
              </div>
              
              <div className="text-center text-gray-500">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">PowerDials Integration Active</p>
                <p className="text-sm">All call activity is automatically captured and stored</p>
                <p className="text-xs mt-2">
                  Use the Contact Integration or Manual Dialing tabs to test the system
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}