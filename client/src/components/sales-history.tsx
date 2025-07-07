import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";
import { insertSalesHistorySchema, insertCancellationHistorySchema } from "@shared/schema";

type SalesHistory = {
  id: number;
  contactId: number;
  salesRepId: number;
  serviceType: string;
  amount: number;
  commission: number;
  saleDate: Date;
  notes?: string;
  createdAt: Date;
};

type CancellationHistory = {
  id: number;
  contactId: number;
  salesRepId: number;
  originalSaleId: number;
  reason: string;
  refundAmount?: number;
  cancellationDate: Date;
  notes?: string;
  createdAt: Date;
};

const saleFormSchema = insertSalesHistorySchema.omit({ id: true, createdAt: true });
const cancellationFormSchema = insertCancellationHistorySchema.omit({ id: true, createdAt: true });

export default function SalesHistory() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isAddCancellationOpen, setIsAddCancellationOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sales history
  const { data: salesHistory = [], isLoading: salesLoading } = useQuery<SalesHistory[]>({
    queryKey: ["/api/sales-history"],
  });

  // Fetch cancellation history
  const { data: cancellationHistory = [], isLoading: cancellationsLoading } = useQuery<CancellationHistory[]>({
    queryKey: ["/api/cancellation-history"],
  });

  // Fetch contacts for dropdowns
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
  });

  // Fetch users for sales rep dropdown
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const saleForm = useForm<z.infer<typeof saleFormSchema>>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      contactId: 0,
      salesRepId: 1,
      serviceType: "",
      amount: 0,
      commission: 0,
      saleDate: new Date(),
      notes: "",
    },
  });

  const cancellationForm = useForm<z.infer<typeof cancellationFormSchema>>({
    resolver: zodResolver(cancellationFormSchema),
    defaultValues: {
      contactId: 0,
      salesRepId: 1,
      originalSaleId: 0,
      reason: "",
      refundAmount: 0,
      cancellationDate: new Date(),
      notes: "",
    },
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof saleFormSchema>) => {
      const response = await fetch("/api/sales-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create sale");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-history"] });
      toast({ title: "Sale Added", description: "Sale record has been created successfully." });
      setIsAddSaleOpen(false);
      saleForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create sale record.", variant: "destructive" });
    },
  });

  // Create cancellation mutation
  const createCancellationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof cancellationFormSchema>) => {
      const response = await fetch("/api/cancellation-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create cancellation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cancellation-history"] });
      toast({ title: "Cancellation Added", description: "Cancellation record has been created successfully." });
      setIsAddCancellationOpen(false);
      cancellationForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create cancellation record.", variant: "destructive" });
    },
  });

  const handleSaleSubmit = (data: z.infer<typeof saleFormSchema>) => {
    createSaleMutation.mutate(data);
  };

  const handleCancellationSubmit = (data: z.infer<typeof cancellationFormSchema>) => {
    createCancellationMutation.mutate(data);
  };

  // Calculate metrics
  const totalSales = salesHistory.reduce((sum, sale) => sum + sale.amount, 0);
  const totalCommissions = salesHistory.reduce((sum, sale) => sum + sale.commission, 0);
  const totalRefunds = cancellationHistory.reduce((sum, cancel) => sum + (cancel.refundAmount || 0), 0);
  const netRevenue = totalSales - totalRefunds;

  const serviceTypes = [
    "SEO Optimization",
    "Website Development",
    "Google Ads Management",
    "Social Media Marketing",
    "Content Creation",
    "Local SEO",
    "E-commerce Development",
    "Brand Design",
    "Video Marketing",
    "Email Marketing"
  ];

  const cancellationReasons = [
    "Customer Request",
    "Financial Constraints",
    "Unsatisfied with Service",
    "Business Closure",
    "Change in Requirements",
    "Found Alternative Solution",
    "Technical Issues",
    "Communication Issues",
    "Billing Dispute",
    "Other"
  ];

  return (
    <div className="space-y-6">
      {/* Traffik Boosters Header */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-20 w-auto object-contain" 
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black">SALES HISTORY</h1>
            <p className="text-lg font-semibold text-black">More Traffik! More Sales!</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold">Sales History</h1>
            <p className="text-muted-foreground">Track sales and cancellations</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{salesHistory.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${netRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">After refunds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sales team earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationHistory.length}</div>
            <p className="text-xs text-muted-foreground">${totalRefunds.toLocaleString()} refunded</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
          <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sales Records</h2>
            <Dialog open={isAddSaleOpen} onOpenChange={setIsAddSaleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Sale</DialogTitle>
                </DialogHeader>
                <Form {...saleForm}>
                  <form onSubmit={saleForm.handleSubmit(handleSaleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={saleForm.control}
                        name="contactId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select contact" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contacts.map((contact) => (
                                  <SelectItem key={contact.id} value={contact.id.toString()}>
                                    {contact.firstName} {contact.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={saleForm.control}
                        name="salesRepId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sales Rep</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sales rep" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.firstName} {user.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={saleForm.control}
                        name="serviceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <Select onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {serviceTypes.map((service) => (
                                  <SelectItem key={service} value={service}>
                                    {service}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={saleForm.control}
                        name="saleDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={saleForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Amount ($)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={saleForm.control}
                        name="commission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission ($)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={saleForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Additional notes about the sale..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddSaleOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createSaleMutation.isPending}>
                        {createSaleMutation.isPending ? "Adding..." : "Add Sale"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Sales Rep</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading sales history...
                      </TableCell>
                    </TableRow>
                  ) : salesHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No sales records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesHistory.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {contacts.find(c => c.id === sale.contactId)?.firstName} {contacts.find(c => c.id === sale.contactId)?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sale.serviceType}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">${sale.amount.toLocaleString()}</TableCell>
                        <TableCell>${sale.commission.toLocaleString()}</TableCell>
                        <TableCell>
                          {users.find(u => u.id === sale.salesRepId)?.firstName} {users.find(u => u.id === sale.salesRepId)?.lastName}
                        </TableCell>
                        <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Cancellation Records</h2>
            <Dialog open={isAddCancellationOpen} onOpenChange={setIsAddCancellationOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Cancellation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Cancellation Record</DialogTitle>
                </DialogHeader>
                <Form {...cancellationForm}>
                  <form onSubmit={cancellationForm.handleSubmit(handleCancellationSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={cancellationForm.control}
                        name="contactId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select contact" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contacts.map((contact) => (
                                  <SelectItem key={contact.id} value={contact.id.toString()}>
                                    {contact.firstName} {contact.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={cancellationForm.control}
                        name="originalSaleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Sale</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sale" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {salesHistory.map((sale) => (
                                  <SelectItem key={sale.id} value={sale.id.toString()}>
                                    {sale.serviceType} - ${sale.amount}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={cancellationForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cancellation Reason</FormLabel>
                            <Select onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cancellationReasons.map((reason) => (
                                  <SelectItem key={reason} value={reason}>
                                    {reason}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={cancellationForm.control}
                        name="cancellationDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cancellation Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={cancellationForm.control}
                      name="refundAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refund Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={cancellationForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Additional notes about the cancellation..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddCancellationOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="destructive" disabled={createCancellationMutation.isPending}>
                        {createCancellationMutation.isPending ? "Adding..." : "Add Cancellation"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Refund Amount</TableHead>
                    <TableHead>Sales Rep</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancellationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading cancellation history...
                      </TableCell>
                    </TableRow>
                  ) : cancellationHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No cancellation records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    cancellationHistory.map((cancellation) => (
                      <TableRow key={cancellation.id}>
                        <TableCell>
                          {contacts.find(c => c.id === cancellation.contactId)?.firstName} {contacts.find(c => c.id === cancellation.contactId)?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{cancellation.reason}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">${(cancellation.refundAmount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {users.find(u => u.id === cancellation.salesRepId)?.firstName} {users.find(u => u.id === cancellation.salesRepId)?.lastName}
                        </TableCell>
                        <TableCell>{new Date(cancellation.cancellationDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}