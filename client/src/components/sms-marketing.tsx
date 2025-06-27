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

export default function SMSMarketing() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    senderName: "Traffik Boosters Team"
  });
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SMS campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/sms/campaigns"],
    queryFn: () => apiRequest("GET", "/api/sms/campaigns").then(res => res.json())
  });

  // Fetch SMS templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/sms/templates"],
    queryFn: () => apiRequest("GET", "/api/sms/templates").then(res => res.json())
  });

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: () => apiRequest("GET", "/api/contacts").then(res => res.json())
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (campaignData: any) => 
      apiRequest("POST", "/api/sms/campaigns", campaignData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms/campaigns"] });
      toast({
        title: "SMS Campaign Created",
        description: "Your SMS campaign has been created successfully.",
      });
      setNewCampaign({ name: "", message: "", senderName: "Traffik Boosters Team" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create SMS campaign",
        variant: "destructive",
      });
    }
  });

  // Send SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", "/api/sms/send", data).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms/campaigns"] });
      toast({
        title: "SMS Campaign Sent",
        description: `Successfully sent to ${data.sent} contacts. ${data.failed} failed, ${data.optedOut} opted out.`,
      });
      setSelectedContacts([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send SMS campaign",
        variant: "destructive",
      });
    }
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate(newCampaign);
  };

  const handleSendSMS = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one contact",
        variant: "destructive",
      });
      return;
    }

    const sendData = {
      contactIds: selectedContacts,
      templateId: selectedTemplate || undefined,
      message: selectedTemplate ? undefined : newCampaign.message
    };

    sendSMSMutation.mutate(sendData);
  };

  const handleContactToggle = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    const validContacts = contacts.filter((contact: Contact) => contact.phone);
    if (selectedContacts.length === validContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(validContacts.map((contact: Contact) => contact.id));
    }
  };

  const handlePreview = () => {
    const template = templates.find((t: SMSTemplate) => t.id === selectedTemplate);
    const sampleContact = contacts.find((c: Contact) => c.phone) || { firstName: "John", lastName: "Doe", company: "Sample Business" };
    
    let message = template ? template.message : newCampaign.message;
    message = message
      .replace(/\{\{firstName\}\}/g, sampleContact.firstName || "John")
      .replace(/\{\{lastName\}\}/g, sampleContact.lastName || "Doe")
      .replace(/\{\{companyName\}\}/g, sampleContact.company || "Sample Business")
      .replace(/\{\{senderName\}\}/g, newCampaign.senderName);
    
    setPreviewMessage(message);
    setIsPreviewOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sending': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'paused': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const validContacts = contacts.filter((contact: Contact) => contact.phone);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-20 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <h1 className="text-3xl font-bold text-black">SMS Marketing</h1>
            <p className="text-gray-600">Mass text campaign management for lead outreach</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <MessageSquare className="h-4 w-4 mr-1" />
          {validContacts.length} Contacts with Phone Numbers
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="send">Send SMS</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
              ))
            ) : campaigns.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No SMS campaigns yet. Create your first campaign to get started.</p>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign: SMSCampaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      {getStatusIcon(campaign.status)}
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 line-clamp-2">{campaign.message}</p>
                      <div className="flex justify-between">
                        <span>Sent:</span>
                        <span className="font-medium">{campaign.sentCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Rate:</span>
                        <span className="font-medium">{campaign.deliveryRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Rate:</span>
                        <span className="font-medium">{campaign.responseRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Create Campaign Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New SMS Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter campaign name"
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
                  placeholder="Hi {{firstName}}, this is {{senderName}} from Traffik Boosters..."
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use {{firstName}}, {{lastName}}, {{companyName}}, {{senderName}} for personalization
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
        </TabsContent>

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
                      <SelectItem value="">Custom Message</SelectItem>
                      {templates.map((template: SMSTemplate) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!selectedTemplate && (
                  <div>
                    <Label htmlFor="customMessage">Custom Message</Label>
                    <Textarea
                      id="customMessage"
                      value={newCampaign.message}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Hi {{firstName}}, this is Traffik Boosters..."
                      rows={4}
                    />
                    <p className="text-sm text-gray-500 mt-1">Character count: {newCampaign.message.length}/160</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePreview}
                    disabled={!selectedTemplate && !newCampaign.message}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    onClick={handleSendSMS}
                    disabled={sendSMSMutation.isPending || selectedContacts.length === 0}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendSMSMutation.isPending ? "Sending..." : `Send to ${selectedContacts.length} contacts`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Select Contacts ({selectedContacts.length}/{validContacts.length})</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedContacts.length === validContacts.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {validContacts.map((contact: Contact) => (
                    <div key={contact.id} className="flex items-center space-x-3 p-2 border rounded">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => handleContactToggle(contact.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {contact.company || `${contact.firstName} ${contact.lastName}`}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {contact.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
              ))
            ) : (
              templates.map((template: SMSTemplate) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.message}</p>
                    <div className="text-xs text-gray-500">
                      Variables: {template.variables.join(", ")}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SMS Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs ml-auto">
                {previewMessage}
              </div>
              <div className="text-xs text-gray-500 mt-2 text-right">
                From: (877) 840-6250
              </div>
            </div>
            <p className="text-sm text-gray-500">
              This is how your message will appear to recipients.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}