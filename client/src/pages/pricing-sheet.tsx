import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertServicePackageSchema, insertCostStructureSchema, insertProfitabilityAnalysisSchema, type ServicePackage, type CostStructure, type ProfitabilityAnalysis } from "@shared/schema";
import { z } from "zod";
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  PieChart, 
  Target, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  BarChart3,
  FileText,
  ArrowUp,
  ArrowDown,
  Percent
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

const servicePackageForm = insertServicePackageSchema.extend({
  features: z.array(z.string()).min(1, "At least one feature is required")
});

const costStructureForm = insertCostStructureSchema;
const profitabilityForm = insertProfitabilityAnalysisSchema;

export default function PricingSheet() {
  const [activeTab, setActiveTab] = useState("packages");
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const { toast } = useToast();

  // Queries
  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ["/api/service-packages"],
  });

  const { data: profitAnalyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ["/api/profitability-analyses"],
  });

  const { data: costs = [], isLoading: costsLoading } = useQuery({
    queryKey: ["/api/cost-structures", selectedPackage?.id],
    enabled: !!selectedPackage?.id,
  });

  // Forms
  const packageForm = useForm({
    resolver: zodResolver(servicePackageForm),
    defaultValues: {
      name: "",
      description: "",
      category: "digital_marketing",
      basePrice: "0",
      setupFee: "0",
      monthlyRecurring: "0",
      deliveryTimeframe: "",
      features: [""]
    }
  });

  const costForm = useForm({
    resolver: zodResolver(costStructureForm),
    defaultValues: {
      servicePackageId: 0,
      costType: "labor",
      costName: "",
      fixedCost: "0",
      variableCostPercentage: "0",
      monthlyRecurringCost: "0",
      notes: ""
    }
  });

  const analysisForm = useForm({
    resolver: zodResolver(profitabilityForm),
    defaultValues: {
      servicePackageId: 0,
      clientSize: "small_business",
      industry: "",
      averageContractValue: "0",
      totalCosts: "0",
      grossProfit: "0",
      profitMargin: "0",
      closingProbability: "0",
      expectedValue: "0",
      timeToClose: 30,
      customerLifetimeValue: "0",
      churnRate: "5"
    }
  });

  // Mutations
  const createPackageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof servicePackageForm>) => {
      const response = await apiRequest("POST", "/api/service-packages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-packages"] });
      setShowPackageDialog(false);
      packageForm.reset();
      toast({
        title: "Service Package Created",
        description: "New service package has been added successfully."
      });
    }
  });

  const createCostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof costStructureForm>) => {
      const response = await apiRequest("POST", "/api/cost-structures", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-structures", selectedPackage?.id] });
      setShowCostDialog(false);
      costForm.reset();
      toast({
        title: "Cost Structure Added",
        description: "Cost component has been added to the package."
      });
    }
  });

  const createAnalysisMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profitabilityForm>) => {
      const response = await apiRequest("POST", "/api/profitability-analyses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profitability-analyses"] });
      setShowAnalysisDialog(false);
      analysisForm.reset();
      toast({
        title: "Profitability Analysis Created",
        description: "Analysis has been saved successfully."
      });
    }
  });

  const onCreatePackage = (data: z.infer<typeof servicePackageForm>) => {
    createPackageMutation.mutate(data);
  };

  const onCreateCost = (data: z.infer<typeof costStructureForm>) => {
    createCostMutation.mutate({
      ...data,
      servicePackageId: selectedPackage?.id || 0
    });
  };

  const onCreateAnalysis = (data: z.infer<typeof profitabilityForm>) => {
    const contractValue = parseFloat(data.averageContractValue);
    const totalCosts = parseFloat(data.totalCosts);
    const grossProfit = contractValue - totalCosts;
    const profitMargin = contractValue > 0 ? (grossProfit / contractValue) * 100 : 0;
    const closingProb = parseFloat(data.closingProbability) / 100;
    const expectedValue = contractValue * closingProb;

    createAnalysisMutation.mutate({
      ...data,
      servicePackageId: selectedPackage?.id || 0,
      grossProfit: grossProfit.toString(),
      profitMargin: profitMargin.toString(),
      expectedValue: expectedValue.toString()
    });
  };

  const addFeature = () => {
    const currentFeatures = packageForm.getValues("features");
    packageForm.setValue("features", [...currentFeatures, ""]);
  };

  const removeFeature = (index: number) => {
    const currentFeatures = packageForm.getValues("features");
    packageForm.setValue("features", currentFeatures.filter((_, i) => i !== index));
  };

  const calculateTotalCosts = (packageId: number) => {
    const packageCosts = costs.filter((cost: CostStructure) => 
      cost.servicePackageId === packageId
    );
    return packageCosts.reduce((total, cost) => {
      return total + parseFloat(cost.fixedCost || "0") + parseFloat(cost.monthlyRecurringCost || "0");
    }, 0);
  };

  const getPackageAnalysis = (packageId: number) => {
    return profitAnalyses.find((analysis: ProfitabilityAnalysis) => 
      analysis.servicePackageId === packageId
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-black">Pricing & Profitability</h1>
            <p className="text-muted-foreground">
              Manage service packages, analyze costs, and track profit margins
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#e45c2b]">More Traffik! More Sales!</p>
          <p className="text-xs text-gray-600">Professional Service Pricing</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Service Packages
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Profitability
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Pricing Proposals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Service Packages</h2>
            <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#e45c2b] hover:bg-[#d44d20]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Service Package</DialogTitle>
                  <DialogDescription>
                    Define a new service package with pricing and features
                  </DialogDescription>
                </DialogHeader>
                <Form {...packageForm}>
                  <form onSubmit={packageForm.handleSubmit(onCreatePackage)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={packageForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Package Name</FormLabel>
                            <FormControl>
                              <Input placeholder="SEO Starter Package" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={packageForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                                <SelectItem value="seo">SEO Services</SelectItem>
                                <SelectItem value="ppc">PPC Advertising</SelectItem>
                                <SelectItem value="web_design">Web Design</SelectItem>
                                <SelectItem value="social_media">Social Media</SelectItem>
                                <SelectItem value="consulting">Consulting</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={packageForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Comprehensive SEO package for small businesses..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={packageForm.control}
                        name="basePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Base Price ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2500" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={packageForm.control}
                        name="setupFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Setup Fee ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="500" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={packageForm.control}
                        name="monthlyRecurring"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Recurring ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="800" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={packageForm.control}
                      name="deliveryTimeframe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Timeframe</FormLabel>
                          <FormControl>
                            <Input placeholder="4-6 weeks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label>Package Features</Label>
                      {packageForm.watch("features").map((_, index) => (
                        <div key={index} className="flex gap-2">
                          <FormField
                            control={packageForm.control}
                            name={`features.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="Feature description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {packageForm.watch("features").length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFeature(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowPackageDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPackageMutation.isPending}>
                        {createPackageMutation.isPending ? "Creating..." : "Create Package"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagesLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Loading packages...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No service packages yet</p>
                <p className="text-sm text-muted-foreground">Create your first service package to get started</p>
              </div>
            ) : (
              packages.map((pkg: ServicePackage) => {
                const analysis = getPackageAnalysis(pkg.id);
                const totalCosts = calculateTotalCosts(pkg.id);
                const estimatedProfit = parseFloat(pkg.basePrice) - totalCosts;
                const profitMargin = parseFloat(pkg.basePrice) > 0 ? (estimatedProfit / parseFloat(pkg.basePrice)) * 100 : 0;

                return (
                  <Card 
                    key={pkg.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedPackage?.id === pkg.id ? 'border-[#e45c2b] bg-orange-50' : ''
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {pkg.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#e45c2b]">
                            ${parseFloat(pkg.basePrice).toLocaleString()}
                          </p>
                          {parseFloat(pkg.monthlyRecurring) > 0 && (
                            <p className="text-sm text-muted-foreground">
                              +${parseFloat(pkg.monthlyRecurring).toLocaleString()}/mo
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Delivery Time:</span>
                          <Badge variant="secondary">{pkg.deliveryTimeframe}</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Estimated Profit:</span>
                          <span className={`font-semibold ${estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${estimatedProfit.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Profit Margin:</span>
                          <div className="flex items-center gap-2">
                            {profitMargin > 30 ? (
                              <ArrowUp className="w-4 h-4 text-green-600" />
                            ) : profitMargin > 15 ? (
                              <Percent className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`font-semibold ${
                              profitMargin > 30 ? 'text-green-600' : 
                              profitMargin > 15 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {profitMargin.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {analysis && (
                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Closing Probability:</span>
                              <span className="font-semibold text-[#e45c2b]">
                                {parseFloat(analysis.closingProbability).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm">Expected Value:</span>
                              <span className="font-semibold">
                                ${parseFloat(analysis.expectedValue).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <Progress 
                            value={Math.min(profitMargin, 100)} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Profitability Score: {Math.round(profitMargin)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Cost Analysis</h2>
              {selectedPackage ? (
                <p className="text-sm text-muted-foreground">
                  Managing costs for: <span className="font-medium">{selectedPackage.name}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a service package to manage its cost structure
                </p>
              )}
            </div>
            {selectedPackage && (
              <Dialog open={showCostDialog} onOpenChange={setShowCostDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#e45c2b] hover:bg-[#d44d20]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cost
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Cost Component</DialogTitle>
                    <DialogDescription>
                      Add a cost component to {selectedPackage.name}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...costForm}>
                    <form onSubmit={costForm.handleSubmit(onCreateCost)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={costForm.control}
                          name="costType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="labor">Labor</SelectItem>
                                  <SelectItem value="tools">Tools & Software</SelectItem>
                                  <SelectItem value="advertising">Advertising</SelectItem>
                                  <SelectItem value="overhead">Overhead</SelectItem>
                                  <SelectItem value="third_party">Third Party Services</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={costForm.control}
                          name="costName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost Name</FormLabel>
                              <FormControl>
                                <Input placeholder="SEO Specialist Hours" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={costForm.control}
                          name="fixedCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fixed Cost ($)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="500" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={costForm.control}
                          name="variableCostPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Variable Cost (%)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="15" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={costForm.control}
                          name="monthlyRecurringCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Cost ($)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="200" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={costForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Additional cost details..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCostDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createCostMutation.isPending}>
                          {createCostMutation.isPending ? "Adding..." : "Add Cost"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!selectedPackage ? (
            <Card className="p-8 text-center">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Service Package</h3>
              <p className="text-sm text-muted-foreground">
                Choose a service package from the Packages tab to view and manage its cost structure
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {selectedPackage.name} - Cost Breakdown
                  </CardTitle>
                  <CardDescription>
                    Detailed cost analysis for this service package
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {costsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">Loading costs...</p>
                    </div>
                  ) : costs.length === 0 ? (
                    <div className="text-center py-8">
                      <Calculator className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No cost components added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {costs.map((cost: CostStructure) => (
                        <div key={cost.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{cost.costName}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {cost.costType.replace('_', ' ')}
                            </p>
                            {cost.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{cost.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="space-y-1">
                              {parseFloat(cost.fixedCost || "0") > 0 && (
                                <div className="text-sm">
                                  Fixed: <span className="font-medium">${parseFloat(cost.fixedCost).toLocaleString()}</span>
                                </div>
                              )}
                              {parseFloat(cost.variableCostPercentage || "0") > 0 && (
                                <div className="text-sm">
                                  Variable: <span className="font-medium">{cost.variableCostPercentage}%</span>
                                </div>
                              )}
                              {parseFloat(cost.monthlyRecurringCost || "0") > 0 && (
                                <div className="text-sm">
                                  Monthly: <span className="font-medium">${parseFloat(cost.monthlyRecurringCost).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                        <span className="font-semibold">Total Estimated Costs:</span>
                        <span className="text-xl font-bold text-[#e45c2b]">
                          ${calculateTotalCosts(selectedPackage.id).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Profitability Analysis</h2>
            {selectedPackage && (
              <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#e45c2b] hover:bg-[#d44d20]">
                    <Plus className="w-4 h-4 mr-2" />
                    New Analysis
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Profitability Analysis</DialogTitle>
                    <DialogDescription>
                      Analyze profitability for {selectedPackage?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...analysisForm}>
                    <form onSubmit={analysisForm.handleSubmit(onCreateAnalysis)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={analysisForm.control}
                          name="clientSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Size</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="small_business">Small Business</SelectItem>
                                  <SelectItem value="medium_business">Medium Business</SelectItem>
                                  <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={analysisForm.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <FormControl>
                                <Input placeholder="Healthcare, SaaS, E-commerce..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={analysisForm.control}
                          name="averageContractValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Average Contract Value ($)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="5000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={analysisForm.control}
                          name="totalCosts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Costs ($)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="2000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={analysisForm.control}
                          name="closingProbability"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Closing Probability (%)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="25" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={analysisForm.control}
                          name="timeToClose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time to Close (days)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="30" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={analysisForm.control}
                          name="customerLifetimeValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Lifetime Value ($)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="15000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={analysisForm.control}
                          name="churnRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Churn Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="5" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowAnalysisDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createAnalysisMutation.isPending}>
                          {createAnalysisMutation.isPending ? "Creating..." : "Create Analysis"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {analysesLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Loading analyses...</p>
              </div>
            ) : profitAnalyses.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No profitability analyses yet</p>
                <p className="text-sm text-muted-foreground">Create analyses to track package profitability</p>
              </div>
            ) : (
              profitAnalyses.map((analysis: ProfitabilityAnalysis) => {
                const pkg = packages.find((p: ServicePackage) => p.id === analysis.servicePackageId);
                return (
                  <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{pkg?.name || 'Unknown Package'}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{analysis.clientSize.replace('_', ' ')}</Badge>
                        {analysis.industry && (
                          <Badge variant="secondary">{analysis.industry}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Contract Value</p>
                          <p className="text-lg font-semibold">
                            ${parseFloat(analysis.averageContractValue).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gross Profit</p>
                          <p className={`text-lg font-semibold ${
                            parseFloat(analysis.grossProfit) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${parseFloat(analysis.grossProfit).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Profit Margin</p>
                          <p className={`text-lg font-semibold ${
                            parseFloat(analysis.profitMargin) > 30 ? 'text-green-600' : 
                            parseFloat(analysis.profitMargin) > 15 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {parseFloat(analysis.profitMargin).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Closing Probability</p>
                          <p className="text-lg font-semibold text-[#e45c2b]">
                            {parseFloat(analysis.closingProbability).toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Expected Value</p>
                        <p className="text-xl font-bold">
                          ${parseFloat(analysis.expectedValue).toLocaleString()}
                        </p>
                      </div>

                      {analysis.customerLifetimeValue && (
                        <div className="pt-2 border-t">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Customer LTV</p>
                              <p className="font-semibold">
                                ${parseFloat(analysis.customerLifetimeValue).toLocaleString()}
                              </p>
                            </div>
                            {analysis.timeToClose && (
                              <div>
                                <p className="text-sm text-muted-foreground">Time to Close</p>
                                <p className="font-semibold">{analysis.timeToClose} days</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Progress 
                        value={Math.min(parseFloat(analysis.profitMargin), 100)} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pricing Proposals</h3>
            <p className="text-muted-foreground mb-6">
              Generate and manage pricing proposals for your clients based on service packages
            </p>
            <Button className="bg-[#e45c2b] hover:bg-[#d44d20]">
              <Plus className="w-4 h-4 mr-2" />
              Create Proposal
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}