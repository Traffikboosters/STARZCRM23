import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ServicePackage, InsertServicePackage } from "@shared/schema";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Target, 
  Clock, 
  Users,
  CheckCircle,
  TrendingUp,
  Globe,
  Megaphone,
  ShoppingCart,
  Palette,
  Search,
  Star
} from "lucide-react";

interface PackagePricing {
  tier1: { name: string; price: number; description: string; features: string[] };
  tier2: { name: string; price: number; description: string; features: string[] };
  tier3: { name: string; price: number; description: string; features: string[] };
}

// Pre-defined Traffik Boosters service packages
const TRAFFIK_BOOSTERS_PACKAGES: Omit<InsertServicePackage, 'createdBy' | 'updatedBy'>[] = [
  {
    name: "Lead Generation Package",
    description: "Comprehensive lead generation system with AI-powered targeting and multi-channel campaigns",
    category: "lead-generation",
    pricing: {
      tier1: {
        name: "Starter",
        price: 1500,
        description: "Essential lead generation for small businesses",
        features: [
          "Google Ads Campaign Setup",
          "Facebook Lead Ads",
          "Landing Page Creation",
          "Basic Analytics",
          "50 Qualified Leads/Month"
        ]
      },
      tier2: {
        name: "Professional",
        price: 2500,
        description: "Advanced multi-channel lead generation",
        features: [
          "Google & Bing Ads Management",
          "Facebook & Instagram Campaigns",
          "LinkedIn Lead Generation",
          "A/B Testing",
          "CRM Integration",
          "150 Qualified Leads/Month"
        ]
      },
      tier3: {
        name: "Enterprise",
        price: 4500,
        description: "Full-scale lead generation powerhouse",
        features: [
          "All Professional Features",
          "YouTube Advertising",
          "Retargeting Campaigns",
          "Advanced Attribution",
          "Dedicated Account Manager",
          "300+ Qualified Leads/Month"
        ]
      }
    },
    features: [
      "Multi-platform advertising",
      "Lead scoring and qualification",
      "Real-time analytics",
      "CRM integration",
      "Landing page optimization"
    ],
    deliverables: [
      "Campaign setup and configuration",
      "Monthly performance reports",
      "Lead quality analysis",
      "Conversion tracking setup",
      "Weekly optimization reviews"
    ],
    timeline: "Setup: 7-10 days, Ongoing monthly optimization",
    targetAudience: ["Small businesses", "Service contractors", "E-commerce stores", "Professional services"],
    successMetrics: [
      "Cost per lead reduction",
      "Lead quality score improvement",
      "Conversion rate optimization",
      "ROI increase"
    ],
    setupFee: 50000,
    isActive: true,
    displayOrder: 1
  },
  {
    name: "SEO Growth Package",
    description: "Complete SEO solution to dominate search rankings and drive organic traffic",
    category: "seo",
    pricing: {
      tier1: {
        name: "Local SEO",
        price: 1200,
        description: "Local search domination for service businesses",
        features: [
          "Google My Business Optimization",
          "Local Citation Building",
          "On-page SEO (10 pages)",
          "Monthly Reporting",
          "Keyword Research (25 keywords)"
        ]
      },
      tier2: {
        name: "Regional SEO",
        price: 2200,
        description: "Multi-city SEO dominance",
        features: [
          "Everything in Local SEO",
          "Content Marketing (4 posts/month)",
          "Link Building Campaign",
          "Technical SEO Audit",
          "Competitor Analysis",
          "50 Target Keywords"
        ]
      },
      tier3: {
        name: "National SEO",
        price: 3800,
        description: "National search visibility and authority",
        features: [
          "Everything in Regional SEO",
          "Advanced Technical SEO",
          "Content Strategy (8 posts/month)",
          "Authority Link Building",
          "E-A-T Optimization",
          "100+ Target Keywords"
        ]
      }
    },
    features: [
      "Comprehensive keyword research",
      "On-page optimization",
      "Technical SEO",
      "Content marketing",
      "Link building"
    ],
    deliverables: [
      "SEO audit and strategy",
      "Optimized website pages",
      "Monthly content calendar",
      "Backlink acquisition",
      "Performance tracking dashboard"
    ],
    timeline: "Initial results: 30-60 days, Full impact: 3-6 months",
    targetAudience: ["Local businesses", "E-commerce sites", "Professional services", "Healthcare providers"],
    successMetrics: [
      "Search ranking improvements",
      "Organic traffic growth",
      "Local pack visibility",
      "Lead generation increase"
    ],
    setupFee: 75000,
    isActive: true,
    displayOrder: 2
  },
  {
    name: "Social Media Marketing Package",
    description: "Viral social media management with content creation and community building",
    category: "social-media",
    pricing: {
      tier1: {
        name: "Essentials",
        price: 800,
        description: "Core social media presence",
        features: [
          "2 Platform Management",
          "12 Posts per Month",
          "Basic Graphics Design",
          "Community Management",
          "Monthly Analytics"
        ]
      },
      tier2: {
        name: "Growth",
        price: 1500,
        description: "Multi-platform growth strategy",
        features: [
          "4 Platform Management",
          "20 Posts per Month",
          "Video Content Creation",
          "Paid Social Advertising",
          "Influencer Outreach",
          "Advanced Analytics"
        ]
      },
      tier3: {
        name: "Viral",
        price: 2800,
        description: "Full viral marketing campaign",
        features: [
          "All Major Platforms",
          "30+ Posts per Month",
          "Professional Video Production",
          "TikTok & Reel Creation",
          "Influencer Partnerships",
          "Real-time Monitoring"
        ]
      }
    },
    features: [
      "Content strategy and creation",
      "Multi-platform management",
      "Community engagement",
      "Paid social advertising",
      "Analytics and reporting"
    ],
    deliverables: [
      "Content calendar",
      "Branded graphics and videos",
      "Daily posting schedule",
      "Engagement reports",
      "Growth strategy updates"
    ],
    timeline: "Immediate start, results visible within 30 days",
    targetAudience: ["Restaurants", "Retail stores", "Entertainment venues", "Personal brands"],
    successMetrics: [
      "Follower growth rate",
      "Engagement rate increase",
      "Reach and impressions",
      "Social media conversions"
    ],
    setupFee: 25000,
    isActive: true,
    displayOrder: 3
  },
  {
    name: "Full-Funnel Marketing Package",
    description: "Complete customer journey optimization from awareness to retention",
    category: "full-funnel",
    pricing: {
      tier1: {
        name: "Foundation",
        price: 3500,
        description: "Essential funnel optimization",
        features: [
          "Landing Page Optimization",
          "Email Marketing Setup",
          "Basic Automation",
          "Conversion Tracking",
          "Monthly Funnel Analysis"
        ]
      },
      tier2: {
        name: "Advanced",
        price: 5500,
        description: "Multi-channel funnel mastery",
        features: [
          "Everything in Foundation",
          "Advanced Email Sequences",
          "Retargeting Campaigns",
          "A/B Testing",
          "CRM Integration",
          "Customer Journey Mapping"
        ]
      },
      tier3: {
        name: "Enterprise",
        price: 8500,
        description: "Complete marketing automation",
        features: [
          "Everything in Advanced",
          "Marketing Automation Platform",
          "Predictive Analytics",
          "Personalization Engine",
          "Multi-touch Attribution",
          "Dedicated Strategy Team"
        ]
      }
    },
    features: [
      "Customer journey mapping",
      "Marketing automation",
      "Multi-channel campaigns",
      "Conversion optimization",
      "Advanced analytics"
    ],
    deliverables: [
      "Funnel strategy document",
      "Automated email sequences",
      "Conversion-optimized pages",
      "Performance dashboard",
      "Monthly optimization reports"
    ],
    timeline: "Setup: 14-21 days, Optimization ongoing",
    targetAudience: ["SaaS companies", "E-commerce businesses", "Professional services", "B2B companies"],
    successMetrics: [
      "Conversion rate improvement",
      "Customer acquisition cost",
      "Lifetime value increase",
      "Marketing ROI"
    ],
    setupFee: 100000,
    isActive: true,
    displayOrder: 4
  },
  {
    name: "Content Marketing & Branding Package",
    description: "Premium content creation and brand building for thought leadership",
    category: "content",
    pricing: {
      tier1: {
        name: "Starter",
        price: 1800,
        description: "Essential content and branding",
        features: [
          "Brand Identity Design",
          "4 Blog Posts per Month",
          "Social Media Graphics",
          "Basic SEO Content",
          "Content Calendar"
        ]
      },
      tier2: {
        name: "Professional",
        price: 3200,
        description: "Comprehensive content strategy",
        features: [
          "Everything in Starter",
          "Video Content Creation",
          "Podcast Production",
          "Email Newsletter",
          "Case Study Development",
          "Thought Leadership Articles"
        ]
      },
      tier3: {
        name: "Authority",
        price: 5500,
        description: "Premium brand authority building",
        features: [
          "Everything in Professional",
          "Documentary-style Videos",
          "Book/eBook Writing",
          "Speaking Opportunities",
          "PR Campaign",
          "Media Appearances"
        ]
      }
    },
    features: [
      "Brand strategy development",
      "High-quality content creation",
      "Multi-format content",
      "Distribution strategy",
      "Brand monitoring"
    ],
    deliverables: [
      "Brand guidelines",
      "Content library",
      "Publishing schedule",
      "Performance analytics",
      "Brand reputation reports"
    ],
    timeline: "Brand development: 14 days, Content production ongoing",
    targetAudience: ["Professional services", "Consultants", "Tech companies", "Healthcare providers"],
    successMetrics: [
      "Brand awareness increase",
      "Thought leadership positioning",
      "Content engagement rates",
      "Authority score improvement"
    ],
    setupFee: 60000,
    isActive: true,
    displayOrder: 5
  },
  {
    name: "E-Commerce Performance Package",
    description: "Complete e-commerce optimization for maximum sales and conversions",
    category: "ecommerce",
    pricing: {
      tier1: {
        name: "Store Optimization",
        price: 2200,
        description: "Essential e-commerce improvements",
        features: [
          "Site Speed Optimization",
          "Product Page Enhancement",
          "Checkout Optimization",
          "Basic Analytics Setup",
          "Mobile Optimization"
        ]
      },
      tier2: {
        name: "Growth Acceleration",
        price: 3800,
        description: "Advanced e-commerce growth",
        features: [
          "Everything in Store Optimization",
          "Advanced Product Recommendations",
          "Email Marketing Automation",
          "Abandoned Cart Recovery",
          "Inventory Management",
          "Customer Segmentation"
        ]
      },
      tier3: {
        name: "Revenue Maximizer",
        price: 6500,
        description: "Premium e-commerce domination",
        features: [
          "Everything in Growth Acceleration",
          "AI-powered Personalization",
          "Advanced Analytics & BI",
          "Multi-channel Integration",
          "Subscription Management",
          "Enterprise Features"
        ]
      }
    },
    features: [
      "Conversion rate optimization",
      "User experience enhancement",
      "Performance optimization",
      "Marketing automation",
      "Analytics and insights"
    ],
    deliverables: [
      "Site audit and recommendations",
      "Optimized product pages",
      "Enhanced checkout flow",
      "Marketing automation setup",
      "Performance dashboard"
    ],
    timeline: "Initial optimization: 14-21 days, Ongoing improvements",
    targetAudience: ["Online retailers", "Product-based businesses", "Marketplace sellers", "Subscription services"],
    successMetrics: [
      "Conversion rate increase",
      "Average order value growth",
      "Customer retention rate",
      "Revenue per visitor"
    ],
    setupFee: 85000,
    isActive: true,
    displayOrder: 6
  }
];

const categoryIcons = {
  "lead-generation": Target,
  "seo": Search,
  "social-media": Megaphone,
  "full-funnel": TrendingUp,
  "content": Palette,
  "ecommerce": ShoppingCart
};

const categoryColors = {
  "lead-generation": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "seo": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "social-media": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "full-funnel": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "content": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  "ecommerce": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
};

export default function ServicePackages() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/me");
        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: servicePackages, isLoading } = useQuery({
    queryKey: ["/api/service-packages"],
    queryFn: async () => {
      const response = await fetch("/api/service-packages");
      if (!response.ok) throw new Error("Failed to fetch service packages");
      return response.json() as Promise<ServicePackage[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertServicePackage) => {
      return apiRequest("/api/service-packages", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-packages"] });
      toast({
        title: "Success",
        description: "Service package created successfully",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create service package",
        variant: "destructive",
      });
    },
  });

  // Initialize Traffik Boosters packages
  const initializePackages = async () => {
    if (!currentUser) return;
    
    try {
      for (const packageData of TRAFFIK_BOOSTERS_PACKAGES) {
        await createMutation.mutateAsync({
          ...packageData,
          createdBy: currentUser.id,
          updatedBy: currentUser.id
        });
      }
      toast({
        title: "Success",
        description: "All Traffik Boosters service packages have been created!",
      });
    } catch (error) {
      console.error("Error initializing packages:", error);
    }
  };

  const filteredPackages = servicePackages?.filter(pkg => 
    selectedCategory === "all" || pkg.category === selectedCategory
  ) || [];

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Service Packages</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Traffik Boosters Service Packages</h2>
        </div>
        <div className="flex gap-2">
          {(!servicePackages || servicePackages.length === 0) && currentUser && (
            <Button onClick={initializePackages} disabled={createMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Create Traffik Boosters Packages
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Service Packages</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{servicePackages?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Active service offerings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Service categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price Range</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$800 - $8,500</div>
                <p className="text-xs text-muted-foreground">Monthly pricing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Setup Fees</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$250 - $1,000</div>
                <p className="text-xs text-muted-foreground">One-time setup</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryIcons).map(([category, Icon]) => (
                  <div key={category} className="flex items-center gap-3 p-4 border rounded-lg">
                    <Icon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold capitalize">{category.replace('-', ' ')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {filteredPackages.filter(pkg => pkg.category === category).length} packages
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="lead-generation">Lead Generation</SelectItem>
                <SelectItem value="seo">SEO Growth</SelectItem>
                <SelectItem value="social-media">Social Media Marketing</SelectItem>
                <SelectItem value="full-funnel">Full-Funnel Marketing</SelectItem>
                <SelectItem value="content">Content & Branding</SelectItem>
                <SelectItem value="ecommerce">E-Commerce Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPackages.map((pkg) => {
              const Icon = categoryIcons[pkg.category as keyof typeof categoryIcons];
              return (
                <Card key={pkg.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle className="text-xl">{pkg.name}</CardTitle>
                          <Badge className={categoryColors[pkg.category as keyof typeof categoryColors]}>
                            {pkg.category.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-2">{pkg.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Pricing Tiers */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Pricing Tiers</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(pkg.pricing as PackagePricing).map(([tier, data]) => (
                          <div key={tier} className="border rounded-lg p-3 text-center">
                            <h5 className="font-medium text-sm">{data.name}</h5>
                            <p className="text-2xl font-bold text-primary">
                              {formatPrice(data.price)}
                            </p>
                            <p className="text-xs text-muted-foreground">/month</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Key Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {pkg.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline and Setup */}
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{pkg.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Setup: {formatPrice(pkg.setupFee || 0)}</span>
                      </div>
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Target Audience</h4>
                      <div className="flex flex-wrap gap-1">
                        {pkg.targetAudience.slice(0, 3).map((audience, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Package Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryIcons).map(([category, Icon]) => {
                    const packageCount = filteredPackages.filter(pkg => pkg.category === category).length;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="capitalize">{category.replace('-', ' ')}</span>
                        </div>
                        <Badge variant="secondary">{packageCount} packages</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-primary">
                    $500K - $2.5M
                  </div>
                  <p className="text-muted-foreground">
                    Estimated annual revenue potential across all packages
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Package Value</span>
                      <span className="font-medium">$2,800/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target Clients per Package</span>
                      <span className="font-medium">15-30</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Client Retention Rate</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}