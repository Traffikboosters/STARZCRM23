import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Plus,
  Eye,
  Download,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Service packages for payment processing
const servicePackages = [
  {
    id: 'seo-starter',
    name: 'SEO Starter Package',
    price: 1500,
    description: 'Basic SEO optimization for small businesses',
    features: ['Keyword Research', 'On-Page SEO', 'Google My Business Setup', 'Monthly Reports'],
    duration: '3 months'
  },
  {
    id: 'ppc-management',
    name: 'PPC Management',
    price: 2500,
    description: 'Professional Google Ads management and optimization',
    features: ['Campaign Setup', 'Keyword Management', 'Ad Copy Creation', 'Performance Tracking'],
    duration: 'Monthly'
  },
  {
    id: 'website-design',
    name: 'Professional Website Design',
    price: 3500,
    description: 'Custom website design and development',
    features: ['Responsive Design', 'SEO Optimized', 'Mobile Friendly', 'Content Management'],
    duration: '6-8 weeks'
  },
  {
    id: 'social-media',
    name: 'Social Media Management',
    price: 1200,
    description: 'Complete social media management and content creation',
    features: ['Content Creation', 'Post Scheduling', 'Community Management', 'Analytics'],
    duration: 'Monthly'
  },
  {
    id: 'complete-digital',
    name: 'Complete Digital Marketing',
    price: 5000,
    description: 'Full-service digital marketing solution',
    features: ['SEO', 'PPC', 'Social Media', 'Content Marketing', 'Analytics'],
    duration: '6 months'
  }
];

// Payment form component
function PaymentForm({ packageInfo, onSuccess }: { packageInfo: any, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const response = await apiRequest('POST', '/api/payments/create-payment-intent', {
        amount: packageInfo.price,
        currency: 'usd',
        packageId: packageInfo.id,
        customerInfo
      });
      
      const { client_secret } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone
          }
        }
      });

      if (result.error) {
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Payment Successful",
          description: `Payment for ${packageInfo.name} has been processed successfully!`
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment",
        variant: "destructive"
      });
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={customerInfo.company}
            onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div>
        <Label>Payment Information</Label>
        <div className="border rounded-md p-3 mt-2">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Amount:</span>
          <span className="text-2xl font-bold text-orange-600">
            ${packageInfo.price.toLocaleString()}
          </span>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        {processing ? 'Processing...' : `Pay $${packageInfo.price.toLocaleString()}`}
      </Button>
    </form>
  );
}

export function PaymentProcessing() {
  const [activeTab, setActiveTab] = useState("packages");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payment transactions
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["/api/payments/transactions"],
  });

  // Fetch payment analytics
  const { data: analytics = {}, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["/api/payments/analytics"],
  });

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setSelectedPackage(null);
    queryClient.invalidateQueries({ queryKey: ["/api/payments/transactions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/payments/analytics"] });
    toast({
      title: "Payment Complete",
      description: "Your payment has been processed successfully!"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Traffik Boosters Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-16 w-auto object-contain crisp-edges"
          />
          <div>
            <h1 className="text-3xl font-bold text-black">Payment Processing</h1>
            <p className="text-orange-600 font-semibold">More Traffik! More Sales!</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="packages">Service Packages</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        {/* Service Packages Tab */}
        <TabsContent value="packages" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {servicePackages.map((pkg) => (
              <Card key={pkg.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {pkg.name}
                    <Badge className="bg-orange-100 text-orange-800">
                      {formatCurrency(pkg.price)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Features Included:</h4>
                      <ul className="space-y-1">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Duration: {pkg.duration}
                      </span>
                      <Button
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowPaymentDialog(true);
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Payment Transactions</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.status === 'succeeded' ? 'bg-green-100' :
                          transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {transaction.status === 'succeeded' ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> :
                            transaction.status === 'pending' ?
                            <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                            <XCircle className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <div className="font-semibold">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.customer_email} • {new Date(transaction.created).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(transaction.amount / 100)}</div>
                        <Badge className={
                          transaction.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics.revenueGrowth || 0}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.successfulPayments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.successRate || 0}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.activeCustomers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics.customerGrowth || 0} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.averageOrder || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.orderTrend > 0 ? '+' : ''}{analytics.orderTrend || 0}% vs last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Invoice Management</h2>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                Invoice management system coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Subscription Management</h2>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Subscription
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                Subscription management system coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="h-8 w-auto object-contain"
              />
              Complete Payment - {selectedPackage?.name}
            </DialogTitle>
            <DialogDescription>
              Secure payment processing powered by Stripe
            </DialogDescription>
          </DialogHeader>
          
          {selectedPackage && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                packageInfo={selectedPackage}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}