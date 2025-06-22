import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Send, Eye, Edit, Trash2, Download, CheckCircle, Clock, AlertCircle, Copy, Mail, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { WorkOrder, DocumentTemplate, Contact } from "@shared/schema";

interface WorkOrderWithEmailContent extends WorkOrder {
  emailContent?: {
    subject: string;
    html: string;
    text: string;
  };
}

export default function LegalDocumentsView() {
  const [selectedTab, setSelectedTab] = useState("work-orders");
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderWithEmailContent | null>(null);
  const [emailPreview, setEmailPreview] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch work orders
  const { data: workOrders = [], isLoading: loadingWorkOrders } = useQuery({
    queryKey: ["/api/work-orders"],
    queryFn: () => apiRequest("GET", "/api/work-orders").then(res => res.json())
  });

  // Fetch document templates
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["/api/document-templates"],
    queryFn: () => apiRequest("GET", "/api/document-templates").then(res => res.json())
  });

  // Fetch contacts for work order creation
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: () => apiRequest("GET", "/api/contacts").then(res => res.json())
  });

  // Fetch company data for logo
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("GET", "/api/companies").then(res => res.json())
  });

  const company = companies[0];

  // Create work order mutation
  const createWorkOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/work-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      setShowWorkOrderForm(false);
      toast({
        title: "Work Order Created",
        description: "Work order has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create work order.",
        variant: "destructive"
      });
    }
  });

  // Send work order mutation (generates email content)
  const sendWorkOrderMutation = useMutation({
    mutationFn: (workOrderId: number) => 
      apiRequest("POST", `/api/work-orders/${workOrderId}/send`),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      setEmailPreview(response.emailContent);
      toast({
        title: "Email Content Generated",
        description: "Work order email content is ready for your email client."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate email content.",
        variant: "destructive"
      });
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/document-templates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-templates"] });
      setShowTemplateForm(false);
      toast({
        title: "Template Created",
        description: "Document template has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template.",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-500";
      case "ready_to_send": return "bg-blue-500";
      case "sent": return "bg-yellow-500";
      case "signed": return "bg-green-500";
      case "completed": return "bg-green-600";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Edit className="h-4 w-4" />;
      case "ready_to_send": return <Mail className="h-4 w-4" />;
      case "sent": return <Clock className="h-4 w-4" />;
      case "signed": return <CheckCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const copyEmailContent = (content: any) => {
    navigator.clipboard.writeText(`Subject: ${content.subject}\n\n${content.text}`);
    toast({
      title: "Copied to Clipboard",
      description: "Email content has been copied to your clipboard."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Legal Documents</h2>
          <p className="text-muted-foreground">
            Create and manage work orders with electronic signatures
          </p>
        </div>
        {company?.logo && (
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <img src={company.logo} alt={company.name} className="h-8 max-w-32 object-contain" />
          </div>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="templates">Document Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="work-orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Work Orders</h3>
            <Button onClick={() => setShowWorkOrderForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Button>
          </div>

          {loadingWorkOrders ? (
            <div className="text-center py-8">Loading work orders...</div>
          ) : (
            <div className="grid gap-4">
              {workOrders.map((order: WorkOrderWithEmailContent) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          {order.title}
                        </CardTitle>
                        <CardDescription>
                          Client: {order.contactName} • Amount: ${order.amount.toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        {order.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => sendWorkOrderMutation.mutate(order.id)}
                            disabled={sendWorkOrderMutation.isPending}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Generate Email
                          </Button>
                        )}
                        {order.status === "ready_to_send" && order.emailContent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyEmailContent(order.emailContent)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Email
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{order.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span>Terms: {order.terms}</span>
                      <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    {order.dueDate && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Due: {new Date(order.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Document Templates</h3>
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {loadingTemplates ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template: DocumentTemplate) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>
                      Category: {template.category.replace("_", " ").toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Variables:</strong> {template.variables.join(", ")}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Work Order Form Dialog */}
      <Dialog open={showWorkOrderForm} onOpenChange={setShowWorkOrderForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Work Order</DialogTitle>
            <DialogDescription>
              Create a new work order with your company branding for client signature
            </DialogDescription>
          </DialogHeader>
          <WorkOrderForm 
            contacts={contacts} 
            templates={templates}
            company={company}
            onSubmit={(data: any) => createWorkOrderMutation.mutate(data)}
            isLoading={createWorkOrderMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Template Form Dialog */}
      <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Document Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for work orders and contracts
            </DialogDescription>
          </DialogHeader>
          <TemplateForm 
            onSubmit={(data: any) => createTemplateMutation.mutate(data)}
            isLoading={createTemplateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      {emailPreview && (
        <Dialog open={!!emailPreview} onOpenChange={() => setEmailPreview(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email Content Ready</DialogTitle>
              <DialogDescription>
                Copy this content to send through your existing email client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Subject:</Label>
                <div className="p-2 bg-muted rounded text-sm">{emailPreview.subject}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">HTML Version:</Label>
                <div 
                  className="p-4 bg-muted rounded text-sm max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: emailPreview.html }}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Text Version:</Label>
                <pre className="p-4 bg-muted rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {emailPreview.text}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => copyEmailContent(emailPreview)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text Version
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(emailPreview.html);
                    toast({
                      title: "HTML Copied",
                      description: "HTML email content copied to clipboard."
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML Version
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function WorkOrderForm({ contacts, templates, company, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contactId: "",
    contactName: "",
    amount: "",
    terms: "",
    dueDate: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseInt(formData.amount),
      contactId: formData.contactId ? parseInt(formData.contactId) : null,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null
    });
  };

  const handleContactChange = (contactId: string) => {
    const contact = contacts.find((c: Contact) => c.id.toString() === contactId);
    setFormData(prev => ({
      ...prev,
      contactId,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : ""
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {company?.logo && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <img src={company.logo} alt={company.name} className="h-6 max-w-24 object-contain" />
          <span className="text-sm text-muted-foreground">This logo will appear on your work order</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Work Order Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Website Development Project"
            required
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="5000"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact">Client</Label>
        <Select value={formData.contactId} onValueChange={handleContactChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((contact: Contact) => (
              <SelectItem key={contact.id} value={contact.id.toString()}>
                {contact.firstName} {contact.lastName} - {contact.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Project Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed description of the work to be performed..."
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="terms">Payment Terms</Label>
        <Input
          id="terms"
          value={formData.terms}
          onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
          placeholder="e.g., 50% due upfront, remaining 50% on completion"
          required
        />
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date (Optional)</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Work Order"}
        </Button>
      </div>
    </form>
  );
}

function TemplateForm({ onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: "",
    category: "work_order",
    content: "",
    variables: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      variables: formData.variables.split(",").map(v => v.trim()).filter(v => v)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Custom Work Order Template"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work_order">Work Order</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="quote">Quote</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="variables">Variables (comma-separated)</Label>
        <Input
          id="variables"
          value={formData.variables}
          onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
          placeholder="companyName, customerName, amount, projectDescription"
        />
      </div>

      <div>
        <Label htmlFor="content">Template Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Use {{variableName}} for dynamic content..."
          rows={10}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Template"}
        </Button>
      </div>
    </form>
  );
}