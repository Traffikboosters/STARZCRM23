import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, User } from "lucide-react";
import PowerDials from "./powerdials-component";
import { CallLogDisplay } from "./call-log-display";

interface CallLog {
  contact: string;
  number: string;
  timestamp: string;
  outcome: string;
}

interface Contact {
  name: string;
  phone: string;
}

export default function PowerDialsDemo() {
  const [demoContact, setDemoContact] = useState<Contact>({
    name: "Jane Doe",
    phone: "+1234567890"
  });
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [showPowerDials, setShowPowerDials] = useState(false);

  const handleCallLog = (log: CallLog) => {
    setCallLogs(prev => [log, ...prev]);
    console.log("Logged call:", log);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PowerDials Contact Integration Demo</h2>
        <p className="text-gray-600">Test the PowerDials component with contact object integration</p>
      </div>

      {/* Contact Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Demo Contact Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-name">Contact Name</Label>
              <Input
                id="contact-name"
                value={demoContact.name}
                onChange={(e) => setDemoContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone Number</Label>
              <Input
                id="contact-phone"
                value={demoContact.phone}
                onChange={(e) => setDemoContact(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowPowerDials(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Launch PowerDials with Contact
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowPowerDials(false)}
            >
              Hide PowerDials
            </Button>
          </div>

          {/* Code Example */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {`<PowerDials`}<br />
              {`  contact={{ name: "${demoContact.name}", phone: "${demoContact.phone}" }}`}<br />
              {`  onCallLog={(log) => console.log("Logged call:", log)}`}<br />
              {`/>`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PowerDials Integration */}
      {showPowerDials && (
        <div className="grid gap-6 lg:grid-cols-2">
          <PowerDials 
            contact={{ 
              name: demoContact.name, 
              phone: demoContact.phone 
            }} 
            onCallLog={handleCallLog} 
          />
          <CallLogDisplay logs={callLogs} />
        </div>
      )}

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">From CRM Lead Card:</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono whitespace-pre">
              {`const handleCallContact = (contact) => {
  // PowerDials automatically integrates with contact data
  // Shows contact name and pre-fills phone number  
  // Logs all calls with contact information
}`}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Manual Dialing Mode:</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono whitespace-pre">
              {`<PowerDials onCallLog={handleCallLog} />
// No contact prop = manual dialing interface`}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Contact Mode:</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono whitespace-pre">
              {`<PowerDials contact={contactObject} onCallLog={handleCallLog} />
// Contact prop provided = pre-filled contact information`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}