import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, UserX, TrendingDown, AlertTriangle, Users, DollarSign, Phone, Mail, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCancellationMetricSchema, type CancellationMetric, type Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

const cancellationFormSchema = insertCancellationMetricSchema.extend({
  serviceStartDate: z.string(),
  cancellationDate: z.string(),
  followUpDate: z.string().optional(),
});

type CancellationFormData = z.infer<typeof cancellationFormSchema>;

export default function CancellationMetrics() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CancellationFormData>({
    resolver: zodResolver(cancellationFormSchema),
    defaultValues: {
      cancellationType: "voluntary",
      wasRetentionAttempted: false,
      retentionResponse: "no_response",
      refundAmount: 0,
      priceComplaint: false,
      serviceComplaint: false,
      supportComplaint: false,
      exitSurveyCompleted: false,
      followUpScheduled: false,
      reactivationProbability: "low",
      businessSize: "small",
      isWinback: false,
    },
  });

  // Fetch cancellation metrics
  const { data: cancellationMetrics, isLoading } = useQuery({
    queryKey: ["/api/cancellation-metrics"],
    queryFn: () => apiRequest("/api/cancellation-metrics"),
  });

  // Fetch contacts for dropdown
  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: () => apiRequest("/api/contacts"),
  });

  // Fetch cancellation trends
  const { data: cancellationTrends } = useQuery({
    queryKey: ["/api/cancellation-trends"],
    queryFn: () => apiRequest("/api/cancellation-trends"),
  });

  // Create cancellation metric mutation
  const createMutation = useMutation({
    mutationFn: async (data: CancellationFormData) => {
      const payload = {
        ...data,
        serviceStartDate: new Date(data.serviceStartDate),
        cancellationDate: new Date(data.cancellationDate),
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      };
      return apiRequest("POST", "/api/cancellation-metrics", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cancellation-metrics"] });
      toast({
        title: "Cancellation Recorded",
        description: "Customer cancellation has been tracked successfully.",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record cancellation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CancellationFormData) => {
    createMutation.mutate(data);
  };

  // Calculate metrics
  const metrics = cancellationMetrics || [];
  const totalCancellations = metrics.length;
  const avgServiceDuration = metrics.length > 0 
    ? (metrics.reduce((sum: number, m: CancellationMetric) => sum + m.serviceDuration, 0) / metrics.length / 30).toFixed(1)
    : "0";
  const totalLostRevenue = metrics.reduce((sum: number, m: CancellationMetric) => sum + m.totalLifetimeValue, 0);
  const retentionAttempts = metrics.filter((m: CancellationMetric) => m.wasRetentionAttempted).length;
  const retentionSuccessRate = retentionAttempts > 0 
    ? ((metrics.filter((m: CancellationMetric) => m.retentionResponse === "accepted").length / retentionAttempts) * 100).toFixed(1)
    : "0";

  // Filter cancellations by service duration (3+ months)
  const qualifiedCancellations = metrics.filter((m: CancellationMetric) => m.serviceDuration >= 90);

  // Group by cancellation reason
  const reasonBreakdown = qualifiedCancellations.reduce((acc: Record<string, number>, metric: CancellationMetric) => {
    acc[metric.cancellationReason] = (acc[metric.cancellationReason] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-16 w-auto object-contain image-rendering-crisp-edges"
          />
          <div>
            <h1 className="text-3xl font-bold text-black">Cancellation Metrics</h1>
            <p className="text-gray-600">Track customer churn for clients with 3+ months of service</p>
            <p className="text-sm text-orange-600 font-medium">More Traffik! More Sales!</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Cancellation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Customer Cancellation</DialogTitle>
              <DialogDescription>
                Track cancellation details for customers who had service for 3+ months
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contacts?.map((contact: Contact) => (
                              <SelectItem key={contact.id} value={contact.id.toString()}>
                                {contact.firstName} {contact.lastName} - {contact.company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cancellationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="voluntary">Voluntary</SelectItem>
                            <SelectItem value="involuntary">Involuntary</SelectItem>
                            <SelectItem value="non_payment">Non-Payment</SelectItem>
                            <SelectItem value="competition">Competition</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cancellationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cancellationReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Reason *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget_constraints">Budget Constraints</SelectItem>
                            <SelectItem value="poor_results">Poor Results</SelectItem>
                            <SelectItem value="poor_communication">Poor Communication</SelectItem>
                            <SelectItem value="found_competitor">Found Competitor</SelectItem>
                            <SelectItem value="business_closure">Business Closure</SelectItem>
                            <SelectItem value="service_quality">Service Quality Issues</SelectItem>
                            <SelectItem value="pricing_too_high">Pricing Too High</SelectItem>
                            <SelectItem value="response_time">Slow Response Time</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="finalMonthlyValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Monthly Value ($) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value) * 100))}
                            value={field.value ? (field.value / 100).toFixed(2) : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalLifetimeValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Lifetime Value ($) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value) * 100))}
                            value={field.value ? (field.value / 100).toFixed(2) : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industryCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="professional_services">Professional Services</SelectItem>
                            <SelectItem value="home_services">Home Services</SelectItem>
                            <SelectItem value="automotive">Automotive</SelectItem>
                            <SelectItem value="beauty_wellness">Beauty & Wellness</SelectItem>
                            <SelectItem value="real_estate">Real Estate</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="wasRetentionAttempted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Retention Attempted</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priceComplaint"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Price Complaint</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceComplaint"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Service Complaint</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="internalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional details about the cancellation..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Recording..." : "Record Cancellation"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cancellations</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCancellations}</div>
            <p className="text-xs text-muted-foreground">
              {qualifiedCancellations.length} with 3+ months service
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Service Duration</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgServiceDuration} months</div>
            <p className="text-xs text-muted-foreground">
              Before cancellation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalLostRevenue / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total lifetime value lost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Success</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              {retentionAttempts} attempts made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cancellations">Cancellation Details</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cancellation Reasons</CardTitle>
                <CardDescription>Most common reasons for service cancellation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reasonBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([reason, count]) => (
                      <div key={reason} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{reason.replace(/_/g, ' ')}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Indicators</CardTitle>
                <CardDescription>Key factors contributing to cancellations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Price Complaints</span>
                    <Badge variant="destructive">
                      {metrics.filter((m: CancellationMetric) => m.priceComplaint).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Complaints</span>
                    <Badge variant="destructive">
                      {metrics.filter((m: CancellationMetric) => m.serviceComplaint).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Support Complaints</span>
                    <Badge variant="destructive">
                      {metrics.filter((m: CancellationMetric) => m.supportComplaint).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Competition Losses</span>
                    <Badge variant="destructive">
                      {metrics.filter((m: CancellationMetric) => m.cancellationType === "competition").length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Cancellations</CardTitle>
              <CardDescription>Customer cancellations with 3+ months of service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualifiedCancellations.slice(0, 10).map((metric: CancellationMetric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Customer ID: {metric.contactId}</div>
                      <div className="text-sm text-gray-600">
                        {metric.industryCategory} • {(metric.serviceDuration / 30).toFixed(1)} months service
                      </div>
                      <div className="text-sm">
                        Reason: <span className="capitalize">{metric.cancellationReason.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold">${(metric.totalLifetimeValue / 100).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(metric.cancellationDate), 'MMM d, yyyy')}
                      </div>
                      <Badge 
                        variant={metric.wasRetentionAttempted ? 
                          (metric.retentionResponse === "accepted" ? "default" : "secondary") : 
                          "destructive"
                        }
                      >
                        {metric.wasRetentionAttempted ? 
                          (metric.retentionResponse === "accepted" ? "Retained" : "Attempted") : 
                          "No Attempt"
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Trends</CardTitle>
              <CardDescription>Monthly analysis of customer churn patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingDown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Trend analysis will be displayed here</p>
                <p className="text-sm text-gray-500">
                  Data visualization coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}