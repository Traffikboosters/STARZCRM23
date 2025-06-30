import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StripeCheckout from "@/components/stripe-checkout";
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Repeat,
  Receipt
} from "lucide-react";
import { type Contact } from "../../../shared/schema";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: Date;
  description: string;
}

export default function Payments() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: { amount: number; contactId?: number }) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Payment Created",
        description: "Payment intent has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    }
  });

  const handleCreatePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount < 0.5) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount of at least $0.50",
        variant: "destructive",
      });
      return;
    }

    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setPaymentAmount("");
    setSelectedContact(null);
    toast({
      title: "Payment Successful",
      description: "Payment has been processed successfully!",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
  };

  const recentPayments = payments.slice(0, 5);
  const totalRevenue = payments.reduce((sum, payment) => 
    payment.status === 'succeeded' ? sum + payment.amount : sum, 0
  );
  const successfulPayments = payments.filter(p => p.status === 'succeeded').length;
  const pendingPayments = payments.filter(p => p.status === 'processing').length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payment Processing</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setActiveTab("create")} className="gap-2">
            <CreditCard className="h-4 w-4" />
            Create Payment
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{successfulPayments}</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPayments}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">
                  Industry leading
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Latest payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.length > 0 ? (
                    recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">${payment.amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.created.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No payments yet</h3>
                      <p className="text-muted-foreground">Create your first payment to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Payment Integration Status</CardTitle>
                <CardDescription>
                  Connected payment processors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Stripe</p>
                    <p className="text-sm text-muted-foreground">
                      Credit cards & bank transfers
                    </p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-muted-foreground">
                      Alternative payment method
                    </p>
                  </div>
                  <Badge variant="outline">
                    Available
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Create New Payment
              </CardTitle>
              <CardDescription>
                Process a one-time payment for services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact (Optional)</Label>
                  <Select 
                    value={selectedContact?.id?.toString() || ""} 
                    onValueChange={(value) => {
                      const contact = contacts.find(c => c.id === parseInt(value));
                      setSelectedContact(contact || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contact..." />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.firstName} {contact.lastName} - {contact.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.50"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreatePayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) < 0.5}
                  className="flex-1"
                >
                  Create Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          {showCheckout && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <StripeCheckout
                  amount={parseFloat(paymentAmount)}
                  contactId={selectedContact?.id}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setShowCheckout(false)}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                All payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.created.toLocaleDateString()} • {payment.id}
                          </p>
                          {payment.description && (
                            <p className="text-xs text-muted-foreground">{payment.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={payment.status === 'succeeded' ? 'default' : 
                                   payment.status === 'processing' ? 'secondary' : 'destructive'}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No payment history</h3>
                    <p className="text-muted-foreground mb-4">
                      Payment transactions will appear here once you start processing payments
                    </p>
                    <Button onClick={() => setActiveTab("create")}>
                      Create First Payment
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment processing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Stripe Integration</p>
                    <p className="text-sm text-muted-foreground">
                      Process payments and manage subscriptions
                    </p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-medium mb-4">Payment Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Default Currency</label>
                      <Select defaultValue="usd">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD - US Dollar</SelectItem>
                          <SelectItem value="eur">EUR - Euro</SelectItem>
                          <SelectItem value="gbp">GBP - British Pound</SelectItem>
                          <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Minimum Amount</label>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue="0.50"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Stripe minimum is $0.50
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}