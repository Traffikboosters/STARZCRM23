import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmailNotificationManager } from "./email-notification-sound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Send, 
  Users, 
  FileText, 
  Eye, 
  Plus,
  Calendar,
  TrendingUp,
  Target,
  MessageSquare,
  Copy,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download
} from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";
import type { Contact } from "@shared/schema";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  senderName: string;
  senderEmail: string;
  targetAudience: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  scheduledDate?: Date;
  createdAt: Date;
  createdBy: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  unsubscribeCount: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'follow_up' | 'promotion' | 'newsletter' | 'service_intro' | 'testimonial';
  variables: string[];
  createdAt: Date;
  isActive: boolean;
}

const campaignFormSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Valid email is required"),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

export default function EmailMarketing() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [previewContact, setPreviewContact] = useState<number | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/marketing/campaigns"],
  });

  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/marketing/templates"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: preview } = useQuery({
    queryKey: ["/api/marketing/preview", selectedTemplate, previewContact],
    enabled: !!(selectedTemplate && previewContact),
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/marketing/preview", {
        templateId: selectedTemplate,
        contactId: previewContact,
        senderInfo: {
          name: "Traffik Boosters Marketing",
          email: "moretraffikmoresales@traffikboosters.com",
          role: "Marketing Team"
        }
      });
      return response.json();
    }
  });

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      senderName: "Traffik Boosters Marketing",
      senderEmail: "moretraffikmoresales@traffikboosters.com",
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await apiRequest("POST", "/api/marketing/campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created",
        description: "Email campaign created successfully",
      });
      setIsCampaignModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, templateId, senderInfo }: { 
      campaignId: string; 
      templateId: string;
      senderInfo?: { name: string; email: string; role: string };
    }) => {
      const response = await apiRequest("POST", `/api/marketing/campaigns/${campaignId}/send`, {
        templateId,
        contactIds: selectedContacts.length > 0 ? selectedContacts : null,
        senderInfo: senderInfo || {
          name: "Traffik Boosters Marketing",
          email: "moretraffikmoresales@traffikboosters.com",
          role: "Marketing Team"
        }
      });
      return response.json();
    },
    onSuccess: async (data) => {
      // Play email notification sound
      const notificationManager = EmailNotificationManager.getInstance();
      await notificationManager.playNotification(`Mass email campaign sent to ${data.sentCount} recipients`);
      
      toast({
        title: "📧 Campaign Sent",
        description: `Successfully sent ${data.sentCount} emails`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
      setSelectedContacts([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send campaign",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  const handleSendCampaign = (campaignId: string) => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select an email template",
        variant: "destructive",
      });
      return;
    }

    sendCampaignMutation.mutate({ 
      campaignId, 
      templateId: selectedTemplate,
      senderInfo: {
        name: "Traffik Boosters Marketing",
        email: "moretraffikmoresales@traffikboosters.com",
        role: "Marketing Team"
      }
    });
  };

  const handleContactToggle = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'follow_up': return 'bg-blue-100 text-blue-800';
      case 'promotion': return 'bg-orange-100 text-orange-800';
      case 'newsletter': return 'bg-purple-100 text-purple-800';
      case 'service_intro': return 'bg-cyan-100 text-cyan-800';
      case 'testimonial': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const eligibleContacts = contacts.filter(contact => 
    contact.email && contact.leadStatus !== 'unsubscribed'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
            <p className="text-gray-600">Mass email campaigns and templates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="text-right">
            <p className="text-sm font-medium text-black">More Traffik! More Sales!</p>
            <p className="text-xs text-gray-600">Marketing Department</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Total Campaigns</h3>
                <p className="text-2xl font-bold text-orange-600">{campaigns.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Eligible Contacts</h3>
                <p className="text-2xl font-bold text-blue-600">{eligibleContacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Emails Sent</h3>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.reduce((sum, c) => sum + c.sentCount, 0)}
                </p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Templates</h3>
                <p className="text-2xl font-bold text-purple-600">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="contacts">Target Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Email Campaigns</h2>
              <Badge variant="secondary">{campaigns.length} campaigns</Badge>
            </div>
            <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{campaign.subject}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sent:</span>
                      <span className="font-medium">{campaign.sentCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">{campaign.senderName}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleSendCampaign(campaign.id)}
                        disabled={sendCampaignMutation.isPending || !selectedTemplate}
                      >
                        <Send className="h-3 w-3 mr-2" />
                        Send
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Email Templates</h2>
              <Badge variant="secondary">{templates.length} templates</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label>Select Template:</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose template for campaigns" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className={`hover:shadow-md transition-shadow ${selectedTemplate === template.id ? 'ring-2 ring-orange-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Variables: {template.variables.length}</span>
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <Target className="h-3 w-3 mr-2" />
                        Select
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setPreviewContact(eligibleContacts[0]?.id || null);
                          setIsPreviewModalOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Target Contacts</h2>
              <Badge variant="secondary">{selectedContacts.length} of {eligibleContacts.length} selected</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedContacts([])}>
                Clear Selection
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedContacts(eligibleContacts.map(c => c.id))}
              >
                Select All
              </Button>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-2">
              {eligibleContacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                    selectedContacts.includes(contact.id) ? 'bg-orange-50 border-orange-200' : ''
                  }`}
                  onClick={() => handleContactToggle(contact.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                      />
                      <div>
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {contact.email} • {contact.company}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{contact.leadStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Modal */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Email Campaign</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateCampaign)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email subject line" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the campaign purpose and goals"
                        className="min-h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCampaignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          
          {preview && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Subject Line:</h3>
                <p className="text-lg">{preview.subject}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Personalized for:</h3>
                <p>{preview.contact.firstName} {preview.contact.lastName} ({preview.contact.company})</p>
              </div>
              
              <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="whitespace-pre-wrap">{preview.content}</div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}