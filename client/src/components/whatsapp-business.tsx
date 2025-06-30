import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Plus,
  MessageCircle,
  Smartphone,
  TrendingUp,
  BarChart3,
  Star
} from "lucide-react";

interface WhatsAppTemplate {
  name: string;
  template: string;
  description: string;
}

interface WhatsAppMessage {
  id: number;
  contactId: number | null;
  fromNumber: string;
  toNumber: string;
  messageBody: string;
  direction: 'inbound' | 'outbound';
  status: string;
  messageType: string;
  createdAt: string;
}

export default function WhatsAppBusiness() {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts for messaging
  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/contacts'],
  });

  const contactsList = contacts as any[];

  // Fetch WhatsApp templates
  // Mock templates for demonstration
  const templates: WhatsAppTemplate[] = [
    {
      name: "welcome",
      template: "Hello {{1}}! Welcome to Traffik Boosters. We're here to help grow your business traffic and sales.",
      description: "Welcome Message"
    },
    {
      name: "followup",
      template: "Hi {{1}}, following up on our conversation about your digital marketing needs. Ready to boost your traffic?",
      description: "Follow-up Message"
    },
    {
      name: "appointment",
      template: "Hi {{1}}, your consultation is confirmed for {{2}} at {{3}}. We'll discuss strategies to increase your business traffic.",
      description: "Appointment Confirmation"
    },
    {
      name: "proposal",
      template: "Hi {{1}}, your custom marketing proposal is ready! Our team has identified key opportunities to drive more traffic to your business.",
      description: "Proposal Ready"
    }
  ];

  // Send WhatsApp message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { contactId?: number; phoneNumber: string; message: string }) => {
      return apiRequest('POST', '/api/whatsapp/send', data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "WhatsApp message delivered successfully",
      });
      setMessage("");
      setPhoneNumber("");
      setSelectedContact(null);
    },
    onError: (error: any) => {
      toast({
        title: "Message Failed", 
        description: error.message || "Failed to send WhatsApp message",
        variant: "destructive",
      });
    },
  });

  // Send template message mutation
  const sendTemplateMutation = useMutation({
    mutationFn: async (data: { contactId?: number; phoneNumber: string; templateName: string; variables?: string[] }) => {
      return apiRequest('POST', '/api/whatsapp/template', data);
    },
    onSuccess: () => {
      toast({
        title: "Template Sent",
        description: "WhatsApp template message delivered successfully",
      });
      setSelectedTemplate("");
      setPhoneNumber("");
      setSelectedContact(null);
    },
    onError: (error: any) => {
      toast({
        title: "Template Failed",
        description: error.message || "Failed to send WhatsApp template",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    const phone = selectedContact?.phone || phoneNumber;
    if (!phone || !message) {
      toast({
        title: "Missing Information",
        description: "Please provide phone number and message",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      contactId: selectedContact?.id,
      phoneNumber: phone,
      message: message,
    });
  };

  const handleSendTemplate = () => {
    const phone = selectedContact?.phone || phoneNumber;
    if (!phone || !selectedTemplate) {
      toast({
        title: "Missing Information", 
        description: "Please provide phone number and select template",
        variant: "destructive",
      });
      return;
    }

    sendTemplateMutation.mutate({
      contactId: selectedContact?.id,
      phoneNumber: phone,
      templateName: selectedTemplate,
      variables: [selectedContact?.firstName || "Customer"],
    });
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    return phone.startsWith('+') ? phone : `+${cleaned}`;
  };

  // Mock analytics data for demonstration
  const analytics = {
    totalMessages: 156,
    deliveryRate: 98.5,
    responseRate: 67.2,
    activeConversations: 23,
    templatesUsed: 8,
    avgResponseTime: "4.2 mins"
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
            <p className="text-gray-600">Send messages and manage conversations with customers</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-lg font-bold">{analytics.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-lg font-bold">{analytics.deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-lg font-bold">{analytics.responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Active Chats</p>
                <p className="text-lg font-bold">{analytics.activeConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-sm text-gray-600">Templates Used</p>
                <p className="text-lg font-bold">{analytics.templatesUsed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-lg font-bold">{analytics.avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">Compose Message</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Compose Message Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Send WhatsApp Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Contact</label>
                  <Select 
                    value={selectedContact?.id?.toString() || ""} 
                    onValueChange={(value) => {
                      const contact = contacts.find((c: any) => c.id.toString() === value);
                      setSelectedContact(contact);
                      setPhoneNumber(contact?.phone || "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact: any) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.firstName} {contact.lastName} - {contact.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your WhatsApp message here..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send WhatsApp Message
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>WhatsApp API Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Setup Required</h3>
                  <p className="text-gray-600 mb-4">
                    WhatsApp Business API requires Twilio credentials to send messages.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-blue-900 mb-2">Required Environment Variables:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• TWILIO_ACCOUNT_SID</li>
                      <li>• TWILIO_AUTH_TOKEN</li>
                      <li>• TWILIO_WHATSAPP_NUMBER</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Template className="h-5 w-5" />
                  <span>Send Template Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Contact</label>
                  <Select 
                    value={selectedContact?.id?.toString() || ""} 
                    onValueChange={(value) => {
                      const contact = contacts.find((c: any) => c.id.toString() === value);
                      setSelectedContact(contact);
                      setPhoneNumber(contact?.phone || "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact: any) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.firstName} {contact.lastName} - {contact.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <p className="text-sm">
                      {templates.find(t => t.name === selectedTemplate)?.template}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleSendTemplate}
                  disabled={sendTemplateMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {sendTemplateMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Send Template
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.name} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.description}</h4>
                        <Badge variant="outline">{template.name}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.template}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>WhatsApp Conversations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Conversations</h3>
                <p className="text-gray-500">
                  WhatsApp conversations will appear here once customers start messaging.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">WhatsApp Business API via Twilio</h3>
                <p className="text-green-800 text-sm mb-3">
                  STARZ uses Twilio as the WhatsApp Business Solution Provider for reliable message delivery.
                </p>
                <div className="space-y-2 text-sm text-green-700">
                  <p>• <strong>Service Provider:</strong> Twilio (Official BSP)</p>
                  <p>• <strong>Pricing Model:</strong> Conversation-based (transitioning to per-message in 2025)</p>
                  <p>• <strong>Features:</strong> Template messages, media support, webhook integration</p>
                  <p>• <strong>Coverage:</strong> Global messaging with US/international support</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">2025 Pricing Updates</h3>
                <p className="text-blue-800 text-sm mb-2">
                  Meta is transitioning from conversation-based to per-message pricing:
                </p>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>• <strong>Phase 1:</strong> May 1, 2025 (select businesses)</p>
                  <p>• <strong>Phase 2:</strong> July 1, 2025 (all remaining businesses)</p>
                  <p>• <strong>Service conversations:</strong> FREE (unlimited since Nov 1, 2024)</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Setup Requirements</h3>
                <p className="text-yellow-800 text-sm mb-2">
                  To activate WhatsApp messaging, please provide the following secrets:
                </p>
                <div className="space-y-1 text-sm text-yellow-700">
                  <p>• <strong>TWILIO_ACCOUNT_SID:</strong> Your Twilio Account SID</p>
                  <p>• <strong>TWILIO_AUTH_TOKEN:</strong> Your Twilio Auth Token</p>
                  <p>• <strong>TWILIO_WHATSAPP_NUMBER:</strong> Your WhatsApp Business number</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}