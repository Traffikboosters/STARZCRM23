import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileSignature, 
  Upload, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Users,
  Calendar,
  Shield,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  fields: string[];
  estimatedTime: string;
  price?: string;
}

interface SigningRequest {
  id: string;
  documentName: string;
  recipientEmail: string;
  recipientName: string;
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'expired';
  sentDate: string;
  completedDate?: string;
  template: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: 'service-agreement',
    name: 'Digital Marketing Service Agreement',
    description: 'Comprehensive agreement for digital marketing services including SEO, PPC, and social media management',
    type: 'Contract',
    fields: ['Client Name', 'Service Package', 'Monthly Fee', 'Contract Duration', 'Performance Metrics'],
    estimatedTime: '5-10 minutes',
    price: '$2,500-$15,000/month'
  },
  {
    id: 'website-development',
    name: 'Website Development Contract',
    description: 'Complete website design and development agreement with hosting and maintenance terms',
    type: 'Contract',
    fields: ['Project Scope', 'Timeline', 'Total Cost', 'Payment Schedule', 'Maintenance Terms'],
    estimatedTime: '10-15 minutes',
    price: '$5,000-$50,000'
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    description: 'Standard NDA for protecting confidential business information and strategies',
    type: 'Legal',
    fields: ['Parties', 'Confidential Information', 'Duration', 'Jurisdiction'],
    estimatedTime: '3-5 minutes'
  },
  {
    id: 'proposal-acceptance',
    name: 'Proposal Acceptance Form',
    description: 'Quick acceptance form for marketing proposals and service quotes',
    type: 'Acceptance',
    fields: ['Proposal Number', 'Services Selected', 'Start Date', 'Initial Payment'],
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'retainer-agreement',
    name: 'Monthly Retainer Agreement',
    description: 'Ongoing retainer agreement for continuous marketing support and consultation',
    type: 'Retainer',
    fields: ['Retainer Amount', 'Included Services', 'Additional Rates', 'Review Schedule'],
    estimatedTime: '5-8 minutes',
    price: '$3,000-$10,000/month'
  }
];

const mockSigningRequests: SigningRequest[] = [
  {
    id: 'req-001',
    documentName: 'Digital Marketing Service Agreement - TechFlow Innovations',
    recipientEmail: 'sarah@techflow-innovations.com',
    recipientName: 'Sarah Chen',
    status: 'signed',
    sentDate: '2025-06-20',
    completedDate: '2025-06-21',
    template: 'Service Agreement',
    priority: 'high'
  },
  {
    id: 'req-002',
    documentName: 'Website Development Contract - GreenTech Solutions',
    recipientEmail: 'david@greentech-solutions.com',
    recipientName: 'David Park',
    status: 'viewed',
    sentDate: '2025-06-21',
    template: 'Development Contract',
    priority: 'urgent'
  },
  {
    id: 'req-003',
    documentName: 'NDA - FinanceForward Partnership',
    recipientEmail: 'james@financeforward.io',
    recipientName: 'James Thompson',
    status: 'sent',
    sentDate: '2025-06-22',
    template: 'NDA',
    priority: 'medium'
  }
];

export default function DocumentSigning() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(documentTemplates[0]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('create');
  const { toast } = useToast();

  const handleCreateDocument = async () => {
    if (!recipientEmail || !recipientName || !documentTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    setProgress(0);

    try {
      // Simulate ApproveMe integration progress
      const steps = [
        "Connecting to ApproveMe API...",
        "Creating document from template...",
        "Setting up signature fields...",
        "Configuring recipient access...",
        "Sending invitation email...",
        "Document ready for signing"
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // Create signing request via API
      const response = await apiRequest("POST", "/api/documents/create-signing-request", {
        templateId: selectedTemplate.id,
        recipientEmail,
        recipientName,
        documentTitle,
        customMessage,
        template: selectedTemplate.name
      });

      const result = await response.json();

      toast({
        title: "Document Sent Successfully!",
        description: `Signing request sent to ${recipientName} at ${recipientEmail}`,
      });

      // Reset form
      setRecipientEmail('');
      setRecipientName('');
      setDocumentTitle('');
      setCustomMessage('');
      setActiveTab('status');

    } catch (error) {
      toast({
        title: "Failed to Send Document",
        description: "Please check your ApproveMe integration settings",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'viewed': return 'bg-yellow-500';
      case 'sent': return 'bg-orange-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-10 w-auto"
          />
          <div>
            <h2 className="text-2xl font-bold">Document Signing</h2>
            <p className="text-muted-foreground">
              Secure electronic signatures powered by ApproveMe
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            SOC 2 Compliant
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Zap className="w-3 h-3 mr-1" />
            ApproveMe Connected
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Document</TabsTrigger>
          <TabsTrigger value="status">Signing Status</TabsTrigger>
          <TabsTrigger value="templates">Manage Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Select Document Template
                </CardTitle>
                <CardDescription>
                  Choose from pre-built templates optimized for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {documentTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTemplate.id === template.id 
                        ? "ring-2 ring-primary border-primary bg-primary/5" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {template.estimatedTime}
                            </span>
                            {template.price && (
                              <span className="text-green-600 font-medium">{template.price}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Document Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Document Details
                </CardTitle>
                <CardDescription>
                  Configure recipient and document settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-title">Document Title</Label>
                  <Input
                    id="document-title"
                    placeholder={`${selectedTemplate.name} - [Client Name]`}
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">Recipient Name</Label>
                    <Input
                      id="recipient-name"
                      placeholder="Client full name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient-email">Recipient Email</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      placeholder="client@company.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                  <Textarea
                    id="custom-message"
                    placeholder="Add a personal message for the recipient..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Template Preview */}
                <div className="space-y-2">
                  <Label>Required Fields</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.fields.map((field, index) => (
                        <Badge key={`field-${field}-${index}`} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {isCreating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Creating document...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button 
                  onClick={handleCreateDocument}
                  disabled={isCreating || !recipientEmail || !recipientName || !documentTitle}
                  className="w-full"
                >
                  {isCreating ? (
                    <>Creating & Sending...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send for Signature
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Signing Requests
              </CardTitle>
              <CardDescription>
                Track document status and manage signatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSigningRequests.map((request) => (
                  <Card key={request.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{request.documentName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{request.recipientName}</span>
                            <span>{request.recipientEmail}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Sent: {request.sentDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(request.status)} text-white border-0`}
                          >
                            {request.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="w-5 h-5" />
                Document Templates
              </CardTitle>
              <CardDescription>
                Manage and customize your document templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentTemplates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm">{template.name}</h3>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{template.estimatedTime}</span>
                          {template.price && (
                            <span className="text-green-600 font-medium">{template.price}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}