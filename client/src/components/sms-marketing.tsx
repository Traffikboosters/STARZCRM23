import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Users, Clock, CheckCircle, XCircle, Phone, Eye } from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  senderName: string;
  targetAudience: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  scheduledDate?: Date;
  createdAt: Date;
  createdBy: number;
  sentCount: number;
  deliveryRate: number;
  responseRate: number;
  optOutCount: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  category: 'welcome' | 'follow_up' | 'promotion' | 'reminder' | 'appointment' | 'urgent';
  variables: string[];
  createdAt: Date;
  isActive: boolean;
}

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  notes: string;
  leadSource: string;
}

const defaultTemplates: SMSTemplate[] = [
  {
    id: "1",
    name: "Welcome Message",
    message: "Hi {firstName}, welcome to Traffik Boosters! We're excited to help grow your business. Reply STOP to opt out.",
    category: "welcome",
    variables: ["firstName"],
    createdAt: new Date(),
    isActive: true
  },
  {
    id: "2", 
    name: "Service Follow-up",
    message: "Hi {firstName}, this is {senderName} from Traffik Boosters. How did our {serviceName} work for you? We'd love your feedback!",
    category: "follow_up",
    variables: ["firstName", "senderName", "serviceName"],
    createdAt: new Date(),
    isActive: true
  },
  {
    id: "3",
    name: "Special Promotion",
    message: "🚀 {firstName}, limited time offer! Get 30% off our {serviceName} package. Call (877) 840-6250 today!",
    category: "promotion", 
    variables: ["firstName", "serviceName"],
    createdAt: new Date(),
    isActive: true
  },
  {
    id: "4",
    name: "Appointment Reminder",
    message: "Hi {firstName}, this is {senderName} from Traffik Boosters. Just confirming our call tomorrow at {appointmentTime}. See you then!",
    category: "appointment",
    variables: ["firstName", "senderName", "appointmentTime"],
    createdAt: new Date(),
    isActive: true
  },
  {
    id: "5",
    name: "Payment Reminder",
    message: "Hi {firstName}, friendly reminder that your {serviceName} payment is due. Please call (877) 840-6250 to complete payment.",
    category: "reminder",
    variables: ["firstName", "serviceName"],
    createdAt: new Date(),
    isActive: true
  },
  {
    id: "6",
    name: "Urgent Update",
    message: "URGENT: {firstName}, we need to discuss your {serviceName} project immediately. Please call {senderName} at (877) 840-6250.",
    category: "urgent",
    variables: ["firstName", "serviceName", "senderName"],
    createdAt: new Date(),
    isActive: true
  }
];

export default function SMSMarketing() {
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
  const [templates] = useState<SMSTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    senderName: "Traffik Boosters Team"
  });
  const [showPreview, setShowPreview] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest("POST", "/api/sms-campaigns", campaignData);
      if (!response.ok) throw new Error("Failed to create campaign");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created",
        description: "SMS campaign has been created successfully"
      });
      setNewCampaign({ name: "", message: "", senderName: "Traffik Boosters Team" });
    }
  });

  const sendSMSMutation = useMutation({
    mutationFn: async (smsData: any) => {
      const response = await apiRequest("POST", "/api/send-sms", smsData);
      if (!response.ok) throw new Error("Failed to send SMS");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "SMS Sent",
        description: `Successfully sent ${data.sent} messages`
      });
      setSelectedContacts([]);
      setCustomMessage("");
      setSelectedTemplate("");
    }
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in campaign name and message",
        variant: "destructive"
      });
      return;
    }

    createCampaignMutation.mutate({
      ...newCampaign,
      targetAudience: selectedContacts,
      status: 'draft'
    });
  };

  const handleSendSMS = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select contacts to send SMS to",
        variant: "destructive"
      });
      return;
    }

    const message = selectedTemplate ? 
      templates.find(t => t.id === selectedTemplate)?.message || customMessage :
      customMessage;

    if (!message) {
      toast({
        title: "No Message",
        description: "Please select a template or write a custom message",
        variant: "destructive"
      });
      return;
    }

    sendSMSMutation.mutate({
      message,
      contactIds: selectedContacts,
      senderName: "Traffik Boosters Team"
    });
  };

  const handleSelectAll = () => {
    const validContacts = contacts.filter((contact: Contact) => contact.phone);
    if (selectedContacts.length === validContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(validContacts.map((contact: Contact) => contact.id));
    }
  };

  const getPreviewMessage = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    const sampleContact = contacts.find((c: Contact) => c.phone) || { firstName: "John", lastName: "Doe", company: "Sample Business" };
    
    if (template) {
      return template.message
        .replace(/{firstName}/g, sampleContact.firstName)
        .replace(/{lastName}/g, sampleContact.lastName)
        .replace(/{senderName}/g, "Traffik Boosters Team")
        .replace(/{serviceName}/g, "SEO Optimization")
        .replace(/{appointmentTime}/g, "2:00 PM");
    }
    
    return customMessage;
  };

  const validContacts = contacts.filter((contact: Contact) => contact.phone);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={traffikBoostersLogo} alt="Traffik Boosters" className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SMS Marketing</h1>
            <p className="text-gray-600">Reach customers instantly with targeted text campaigns</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          More Traffik! More Sales!
        </div>
      </div>

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((total, campaign) => total + campaign.sentCount, 0)}
                </p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">24.5%</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opt-out Rate</p>
                <p className="text-2xl font-bold text-gray-900">2.1%</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Send SMS</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Send SMS Tab */}
        <TabsContent value="send">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SMS Composition */}
            <Card>
              <CardHeader>
                <CardTitle>Compose SMS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template or write custom message" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template: SMSTemplate) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customMessage">Custom Message</Label>
                  <Textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Write your custom SMS message here..."
                    rows={4}
                    disabled={!!selectedTemplate}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use variables: firstName, lastName, company, senderName
                  </p>
                  <p className="text-sm text-gray-500">
                    Character count: {(selectedTemplate ? 
                      templates.find(t => t.id === selectedTemplate)?.message.length || 0 : 
                      customMessage.length)}/160
                  </p>
                </div>

                <div className="flex gap-2">
                  <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>SMS Preview</DialogTitle>
                      </DialogHeader>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-2">Preview:</p>
                        <p className="text-gray-900">{getPreviewMessage()}</p>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    onClick={handleSendSMS}
                    disabled={sendSMSMutation.isPending || selectedContacts.length === 0}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendSMSMutation.isPending ? "Sending..." : "Send SMS"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Select Recipients ({selectedContacts.length})</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedContacts.length === validContacts.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {validContacts.map((contact: Contact) => (
                    <div key={contact.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedContacts(prev => [...prev, contact.id]);
                          } else {
                            setSelectedContacts(prev => prev.filter(id => id !== contact.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                        <p className="text-sm text-gray-600">{contact.company}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {contact.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Q1 Promotion Campaign"
                />
              </div>

              <div>
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  value={newCampaign.senderName}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="Traffik Boosters Team"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Hi there, this is the Traffik Boosters team..."
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use variables for personalization: firstName, lastName, company, senderName
                </p>
                <p className="text-sm text-gray-500">Character count: {newCampaign.message.length}/160</p>
              </div>

              <Button 
                onClick={handleCreateCampaign} 
                disabled={createCampaignMutation.isPending}
                className="w-full"
              >
                {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </CardContent>
          </Card>

          {/* Campaign List */}
          <div className="space-y-4 mt-6">
            {campaigns.map((campaign: SMSCampaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.message.substring(0, 50)}...</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-gray-500">Sent: {campaign.sentCount}</span>
                        <span className="text-sm text-gray-500">Response: {campaign.responseRate}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View Stats</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template: SMSTemplate) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{template.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Variables: {template.variables.join(", ")}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Use</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}