import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Mail, 
  Copy, 
  Check, 
  DollarSign, 
  Calendar,
  User,
  Building,
  Send,
  Download,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface WorkOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  projectTitle: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'signed' | 'completed';
  createdAt: string;
  items: WorkOrderItem[];
}

interface WorkOrderItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

const sampleWorkOrders: WorkOrder[] = [
  {
    id: "WO-2025-001",
    clientName: "Maria Gonzalez",
    clientEmail: "maria@bellavista.com",
    clientCompany: "Bella Vista Restaurant",
    projectTitle: "Digital Marketing Campaign Setup",
    description: "Complete digital marketing package including Google Ads, Facebook advertising, and SEO optimization for restaurant visibility.",
    amount: 4500,
    dueDate: "2025-01-15",
    status: "draft",
    createdAt: "2025-01-02",
    items: [
      { id: "1", description: "Google Ads Setup & Management (3 months)", quantity: 1, rate: 1500, total: 1500 },
      { id: "2", description: "Facebook Advertising Campaign", quantity: 1, rate: 1200, total: 1200 },
      { id: "3", description: "SEO Optimization & Content Creation", quantity: 1, rate: 1800, total: 1800 }
    ]
  },
  {
    id: "WO-2025-002",
    clientName: "David Chen",
    clientEmail: "d.chen@techflow.com",
    clientCompany: "TechFlow Solutions",
    projectTitle: "Lead Generation System Implementation",
    description: "Custom CRM integration with automated lead capture and nurturing workflows for B2B technology services.",
    amount: 8900,
    dueDate: "2025-01-20",
    status: "sent",
    createdAt: "2025-01-03",
    items: [
      { id: "1", description: "CRM Setup & Configuration", quantity: 1, rate: 2500, total: 2500 },
      { id: "2", description: "Lead Capture Form Integration", quantity: 3, rate: 800, total: 2400 },
      { id: "3", description: "Automated Email Sequences", quantity: 1, rate: 2000, total: 2000 },
      { id: "4", description: "Analytics Dashboard Setup", quantity: 1, rate: 2000, total: 2000 }
    ]
  }
];

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(sampleWorkOrders);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder>(workOrders[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedEmailContent, setCopiedEmailContent] = useState(false);
  const { toast } = useToast();

  const [newOrder, setNewOrder] = useState<Partial<WorkOrder>>({
    clientName: "",
    clientEmail: "",
    clientCompany: "",
    projectTitle: "",
    description: "",
    amount: 0,
    dueDate: "",
    items: [{ id: "1", description: "", quantity: 1, rate: 0, total: 0 }]
  });

  const generateEmailContent = (order: WorkOrder) => {
    const emailSubject = `Work Order ${order.id} - ${order.projectTitle}`;
    const emailBody = `Dear ${order.clientName},

Thank you for choosing Traffik Boosters for your digital marketing needs. Please find attached your work order for the upcoming project.

WORK ORDER DETAILS
==================
Work Order #: ${order.id}
Project: ${order.projectTitle}
Client: ${order.clientName}
Company: ${order.clientCompany}
Due Date: ${new Date(order.dueDate).toLocaleDateString()}

PROJECT DESCRIPTION
==================
${order.description}

SERVICES BREAKDOWN
==================
${order.items.map(item => 
  `• ${item.description}
   Quantity: ${item.quantity} | Rate: $${item.rate.toLocaleString()} | Total: $${item.total.toLocaleString()}`
).join('\n')}

TOTAL PROJECT VALUE: $${order.amount.toLocaleString()}

NEXT STEPS
==========
1. Please review the work order details carefully
2. Reply to confirm your acceptance of the terms
3. We'll send you the electronic signature link to formalize the agreement
4. Project work will begin immediately upon signed agreement

PAYMENT TERMS
=============
• 50% deposit required to begin work
• Remaining balance due upon project completion
• Payment methods: Bank transfer, credit card, or check

If you have any questions or need modifications to this work order, please don't hesitate to reach out.

Best regards,
Traffik Boosters Team
Phone: +1-888-TRAFFIK
Email: traffikboosters@gmail.com
Website: https://traffikboosters.com

---
This work order is valid for 30 days from the date of issue.`;

    return { subject: emailSubject, body: emailBody };
  };

  const copyEmailToClipboard = (order: WorkOrder) => {
    const { subject, body } = generateEmailContent(order);
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    
    navigator.clipboard.writeText(fullEmail).then(() => {
      setCopiedEmailContent(true);
      toast({
        title: "Email Content Copied!",
        description: "Work order email content has been copied to your clipboard. You can now paste it into your email client.",
      });
      setTimeout(() => setCopiedEmailContent(false), 3000);
    });
  };

  const openInEmailClient = (order: WorkOrder) => {
    const { subject, body } = generateEmailContent(order);
    const mailtoLink = `mailto:${order.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const addNewItem = () => {
    const newItem: WorkOrderItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      total: 0
    };
    setNewOrder(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const updateItem = (index: number, field: keyof WorkOrderItem, value: string | number) => {
    setNewOrder(prev => {
      const items = [...(prev.items || [])];
      items[index] = { ...items[index], [field]: value };
      if (field === 'quantity' || field === 'rate') {
        items[index].total = items[index].quantity * items[index].rate;
      }
      const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
      return { ...prev, items, amount: totalAmount };
    });
  };

  const createWorkOrder = () => {
    const order: WorkOrder = {
      ...newOrder as WorkOrder,
      id: `WO-${new Date().getFullYear()}-${String(workOrders.length + 1).padStart(3, '0')}`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setWorkOrders([...workOrders, order]);
    setSelectedOrder(order);
    setIsCreating(false);
    setNewOrder({
      clientName: "",
      clientEmail: "",
      clientCompany: "",
      projectTitle: "",
      description: "",
      amount: 0,
      dueDate: "",
      items: [{ id: "1", description: "", quantity: 1, rate: 0, total: 0 }]
    });
    
    toast({
      title: "Work Order Created!",
      description: "Your work order has been created and is ready to send.",
    });
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Create and manage work orders for your clients</p>
        </div>
        <div className="flex items-center gap-2">
          <img src={traffikBoostersLogo} alt="Traffik Boosters" className="h-8 w-auto" />
          <Button onClick={() => setIsCreating(true)}>
            <FileText className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">Manage Orders</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Work Orders List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Work Orders</h3>
              {workOrders.map((order) => (
                <Card 
                  key={order.id}
                  className={`cursor-pointer transition-all ${
                    selectedOrder.id === order.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{order.id}</span>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{order.projectTitle}</h4>
                      <p className="text-sm text-muted-foreground">{order.clientName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Due: {new Date(order.dueDate).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-green-600">
                          ${order.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Work Order Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {selectedOrder.projectTitle}
                      </CardTitle>
                      <CardDescription>Work Order {selectedOrder.id}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedOrder.status)} variant="secondary">
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Client Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Client:</span>
                        <span>{selectedOrder.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Company:</span>
                        <span>{selectedOrder.clientCompany}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{selectedOrder.clientEmail}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Due Date:</span>
                        <span>{new Date(selectedOrder.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          ${selectedOrder.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Project Description */}
                  <div>
                    <h4 className="font-medium mb-2">Project Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.description}</p>
                  </div>

                  <Separator />

                  {/* Services Breakdown */}
                  <div>
                    <h4 className="font-medium mb-4">Services Breakdown</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ${item.rate.toLocaleString()}
                            </p>
                          </div>
                          <span className="font-medium">${item.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Email Actions */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Actions</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={() => openInEmailClient(selectedOrder)}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Open in Email Client
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => copyEmailToClipboard(selectedOrder)}
                        className="flex items-center gap-2"
                      >
                        {copiedEmailContent ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copiedEmailContent ? "Copied!" : "Copy Email Content"}
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          {/* Create New Work Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Work Order</CardTitle>
              <CardDescription>Fill in the details to create a new work order for your client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={newOrder.clientName || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newOrder.clientEmail || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="john@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientCompany">Company</Label>
                  <Input
                    id="clientCompany"
                    value={newOrder.clientCompany || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, clientCompany: e.target.value }))}
                    placeholder="Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newOrder.dueDate || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    value={newOrder.projectTitle || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, projectTitle: e.target.value }))}
                    placeholder="Digital Marketing Campaign"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={newOrder.description || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the project scope and deliverables..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Services/Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Services & Items</Label>
                  <Button variant="outline" size="sm" onClick={addNewItem}>
                    Add Item
                  </Button>
                </div>
                {newOrder.items?.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Service description"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label>Rate ($)</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-4 text-right">
                      <span className="text-sm text-muted-foreground">
                        Total: ${item.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    Total Project Value: ${(newOrder.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={createWorkOrder}>
                  Create Work Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}