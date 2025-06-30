import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  FileText, 
  Phone,
  Mail,
  Calendar,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts for messaging
  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/contacts'],
  });

  const contactsList = contacts as any[];

  // WhatsApp templates
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
      return apiRequest("POST", "/api/whatsapp/send", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "WhatsApp message sent successfully!",
      });
      setMessage("");
      setPhoneNumber("");
      setSelectedContact(null);
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/messages'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send",
        description: "Could not send WhatsApp message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send template message mutation
  const sendTemplateMutation = useMutation({
    mutationFn: async (data: { contactId?: number; phoneNumber: string; templateName: string; variables?: string[] }) => {
      return apiRequest("POST", "/api/whatsapp/send-template", data);
    },
    onSuccess: () => {
      toast({
        title: "Template Sent",
        description: "WhatsApp template message sent successfully!",
      });
      setSelectedTemplate("");
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/messages'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Template",
        description: "Could not send template message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mock analytics data
  const analytics = {
    totalMessages: 1247,
    deliveredMessages: 1198,
    readMessages: 1089,
    repliedMessages: 342,
    templatesUsed: 156,
    activeConversations: 28
  };

  const handleSendMessage = () => {
    if (!phoneNumber || !message) {
      toast({
        title: "Missing Information",
        description: "Please enter phone number and message",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      contactId: selectedContact?.id,
      phoneNumber,
      message,
    });
  };

  const handleSendTemplate = () => {
    if (!phoneNumber || !selectedTemplate) {
      toast({
        title: "Missing Information",
        description: "Please select contact and template",
        variant: "destructive",
      });
      return;
    }

    const template = templates.find(t => t.name === selectedTemplate);
    if (!template) return;

    sendTemplateMutation.mutate({
      contactId: selectedContact?.id,
      phoneNumber,
      templateName: selectedTemplate,
      variables: [selectedContact?.firstName || "Customer"]
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
            <p className="text-gray-500">Manage WhatsApp communications and campaigns</p>
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
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-lg font-bold">{analytics.deliveredMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Read Messages</p>
                <p className="text-lg font-bold">{analytics.readMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Replies</p>
                <p className="text-lg font-bold">{analytics.repliedMessages}</p>
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
              <Users className="h-4 w-4 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-600">Active Chats</p>
                <p className="text-lg font-bold">{analytics.activeConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Send Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Contact</Label>
              <Select
                value={selectedContact?.id?.toString() || ""}
                onValueChange={(value) => {
                  const contact = contactsList.find((c: any) => c.id.toString() === value);
                  setSelectedContact(contact);
                  setPhoneNumber(contact?.phone || "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contactsList.map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.firstName} {contact.lastName} - {contact.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
              />
            </div>

            <Button 
              onClick={handleSendMessage} 
              className="w-full"
              disabled={sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Send Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Send Template</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Contact</Label>
              <Select
                value={selectedContact?.id?.toString() || ""}
                onValueChange={(value) => {
                  const contact = contactsList.find((c: any) => c.id.toString() === value);
                  setSelectedContact(contact);
                  setPhoneNumber(contact?.phone || "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contactsList.map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.firstName} {contact.lastName} - {contact.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
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
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <p className="text-sm">
                  {templates.find(t => t.name === selectedTemplate)?.template.replace('{{1}}', selectedContact?.firstName || 'Customer')}
                </p>
              </div>
            )}

            <Button 
              onClick={handleSendTemplate} 
              className="w-full"
              disabled={sendTemplateMutation.isPending}
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
      </div>

      {/* Templates Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Message Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{template.description}</h3>
                  <Badge variant="outline">{template.name}</Badge>
                </div>
                <p className="text-sm text-gray-600">{template.template}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}