import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  BarChart3, 
  Lightbulb,
  Zap,
  Calendar,
  Phone,
  Mail,
  Globe,
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PlusCircle,
  Trash2,
  Copy,
  Download,
  Send,
  Brain
} from "lucide-react";

interface MarketingStrategy {
  id: number;
  strategyName: string;
  targetAudience: string;
  budget: number;
  duration: string;
  channels: string[];
  objectives: string[];
  expectedROI: number;
  costPerLead: number;
  estimatedLeads: number;
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
  actualROI?: number;
  actualLeads?: number;
  actualCostPerLead?: number;
}

interface MarketingChannel {
  name: string;
  cost: number;
  expectedLeads: number;
  costPerLead: number;
  roi: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToResults: string;
  description: string;
  icon: any;
  category: 'Free' | 'Low-Cost' | 'Paid' | 'Premium';
}

interface MarketingTactic {
  id: string;
  name: string;
  description: string;
  cost: number;
  timeframe: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedResults: string;
  category: 'Content' | 'Social' | 'Email' | 'SEO' | 'Paid' | 'Networking' | 'Partnership';
  steps: string[];
}

const LOW_COST_CHANNELS: MarketingChannel[] = [
  {
    name: "Google My Business Optimization",
    cost: 0,
    expectedLeads: 15,
    costPerLead: 0,
    roi: 500,
    difficulty: 'Easy',
    timeToResults: '2-4 weeks',
    description: 'Free local SEO that brings high-intent customers directly to your business',
    icon: Globe,
    category: 'Free'
  },
  {
    name: "Facebook Business Page",
    cost: 0,
    expectedLeads: 8,
    costPerLead: 0,
    roi: 300,
    difficulty: 'Easy',
    timeToResults: '1-2 weeks',
    description: 'Build credibility and reach local customers through organic posts and engagement',
    icon: Users,
    category: 'Free'
  },
  {
    name: "Email Newsletter",
    cost: 25,
    expectedLeads: 12,
    costPerLead: 2.08,
    roi: 400,
    difficulty: 'Medium',
    timeToResults: '3-6 weeks',
    description: 'Direct communication with prospects and customers for repeat business',
    icon: Mail,
    category: 'Low-Cost'
  },
  {
    name: "Content Marketing Blog",
    cost: 50,
    expectedLeads: 20,
    costPerLead: 2.50,
    roi: 600,
    difficulty: 'Medium',
    timeToResults: '8-12 weeks',
    description: 'Establish expertise and attract customers through valuable content',
    icon: Lightbulb,
    category: 'Low-Cost'
  },
  {
    name: "Local Networking Events",
    cost: 100,
    expectedLeads: 5,
    costPerLead: 20.00,
    roi: 250,
    difficulty: 'Easy',
    timeToResults: '1-2 weeks',
    description: 'Build relationships and generate referrals through in-person connections',
    icon: Users,
    category: 'Low-Cost'
  },
  {
    name: "Google Ads (Local)",
    cost: 300,
    expectedLeads: 25,
    costPerLead: 12.00,
    roi: 400,
    difficulty: 'Hard',
    timeToResults: '1-3 weeks',
    description: 'Immediate visibility for high-intent local search terms',
    icon: Target,
    category: 'Paid'
  },
  {
    name: "Facebook Ads (Local)",
    cost: 200,
    expectedLeads: 18,
    costPerLead: 11.11,
    roi: 350,
    difficulty: 'Medium',
    timeToResults: '1-2 weeks',
    description: 'Targeted advertising to specific demographics in your service area',
    icon: Target,
    category: 'Paid'
  },
  {
    name: "Customer Referral Program",
    cost: 150,
    expectedLeads: 10,
    costPerLead: 15.00,
    roi: 500,
    difficulty: 'Easy',
    timeToResults: '2-4 weeks',
    description: 'Incentivize existing customers to bring in new business',
    icon: Award,
    category: 'Low-Cost'
  }
];

const MARKETING_TACTICS: MarketingTactic[] = [
  {
    id: 'gmb-optimization',
    name: 'Google My Business Complete Setup',
    description: 'Fully optimize your GMB profile for maximum local visibility',
    cost: 0,
    timeframe: '1 week',
    difficulty: 'Easy',
    expectedResults: '15-25 new leads per month',
    category: 'SEO',
    steps: [
      'Claim and verify your Google My Business listing',
      'Add high-quality photos of your work and team',
      'Write compelling business description with keywords',
      'Set up accurate business hours and contact info',
      'Create posts about services, offers, and updates',
      'Respond to all customer reviews professionally'
    ]
  },
  {
    id: 'social-media-content',
    name: 'Social Media Content Calendar',
    description: 'Consistent posting schedule across Facebook, Instagram, and LinkedIn',
    cost: 30,
    timeframe: '1 month',
    difficulty: 'Medium',
    expectedResults: '8-15 leads per month',
    category: 'Social',
    steps: [
      'Create content calendar with 3-4 posts per week',
      'Mix educational, promotional, and behind-the-scenes content',
      'Use local hashtags and location tags',
      'Share customer success stories and testimonials',
      'Engage with comments and messages within 4 hours',
      'Cross-promote across all social platforms'
    ]
  },
  {
    id: 'email-nurture-sequence',
    name: 'Email Nurture Campaign',
    description: 'Automated email sequence to convert leads into customers',
    cost: 25,
    timeframe: '2 weeks',
    difficulty: 'Medium',
    expectedResults: '10-20% increase in conversion rate',
    category: 'Email',
    steps: [
      'Set up email marketing platform (Mailchimp, ConvertKit)',
      'Create lead magnet (free guide, checklist, quote)',
      'Write 5-email welcome series for new subscribers',
      'Design monthly newsletter template',
      'Set up abandoned quote follow-up sequence',
      'Create customer retention email campaign'
    ]
  },
  {
    id: 'local-seo-strategy',
    name: 'Local SEO Optimization',
    description: 'Improve local search rankings for high-intent keywords',
    cost: 50,
    timeframe: '6 weeks',
    difficulty: 'Hard',
    expectedResults: '20-35 organic leads per month',
    category: 'SEO',
    steps: [
      'Research local service keywords with search volume',
      'Optimize website for local search terms',
      'Create location-specific service pages',
      'Build citations on local directory sites',
      'Get backlinks from local business associations',
      'Monitor rankings and adjust strategy monthly'
    ]
  },
  {
    id: 'referral-program',
    name: 'Customer Referral System',
    description: 'Structured program to generate referrals from satisfied customers',
    cost: 100,
    timeframe: '3 weeks',
    difficulty: 'Easy',
    expectedResults: '5-12 referral leads per month',
    category: 'Partnership',
    steps: [
      'Design referral reward structure (discounts, cash)',
      'Create referral tracking system',
      'Develop referral request email templates',
      'Train staff on referral program promotion',
      'Create referral cards for customers to share',
      'Follow up with referral sources monthly'
    ]
  },
  {
    id: 'video-marketing',
    name: 'Video Content Strategy',
    description: 'Create engaging video content to showcase expertise and build trust',
    cost: 75,
    timeframe: '4 weeks',
    difficulty: 'Medium',
    expectedResults: '12-20 leads per month',
    category: 'Content',
    steps: [
      'Plan video content calendar (tips, tutorials, testimonials)',
      'Set up basic video recording equipment',
      'Create template for service demonstration videos',
      'Film customer testimonial interviews',
      'Optimize videos for YouTube and social media',
      'Include clear calls-to-action in every video'
    ]
  }
];

export function MarketingStrategyBuilder() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedTactics, setSelectedTactics] = useState<string[]>([]);
  const [budget, setBudget] = useState(500);
  const [timeframe, setTimeframe] = useState("3-months");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: strategies, isLoading } = useQuery({
    queryKey: ['/api/marketing-strategies'],
  });

  // Ensure strategies is always an array
  const strategiesArray: MarketingStrategy[] = Array.isArray(strategies) ? strategies : [];

  const createStrategyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/marketing-strategies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-strategies'] });
      toast({
        title: "Strategy Created",
        description: "Your marketing strategy has been saved successfully.",
      });
    },
  });

  const calculateTotalCost = () => {
    const channelCosts = selectedChannels.reduce((total, channelName) => {
      const channel = LOW_COST_CHANNELS.find(c => c.name === channelName);
      return total + (channel?.cost || 0);
    }, 0);
    
    const tacticCosts = selectedTactics.reduce((total, tacticId) => {
      const tactic = MARKETING_TACTICS.find(t => t.id === tacticId);
      return total + (tactic?.cost || 0);
    }, 0);
    
    return channelCosts + tacticCosts;
  };

  const calculateEstimatedLeads = () => {
    const channelLeads = selectedChannels.reduce((total, channelName) => {
      const channel = LOW_COST_CHANNELS.find(c => c.name === channelName);
      return total + (channel?.expectedLeads || 0);
    }, 0);
    
    return Math.round(channelLeads * (timeframe === "1-month" ? 1 : timeframe === "3-months" ? 3 : 6));
  };

  const calculateROI = () => {
    const totalCost = calculateTotalCost();
    const totalLeads = calculateEstimatedLeads();
    const avgDealValue = 2500; // Average service business deal
    const conversionRate = 0.15; // 15% of leads convert
    
    const revenue = totalLeads * conversionRate * avgDealValue;
    const roi = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0;
    
    return Math.round(roi);
  };

  const handleCreateStrategy = () => {
    if (!businessType || !targetAudience || !primaryGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill in business type, target audience, and primary goal.",
        variant: "destructive",
      });
      return;
    }

    const strategyData = {
      strategyName: `${businessType} Marketing Strategy - ${new Date().toLocaleDateString()}`,
      targetAudience,
      budget: calculateTotalCost(),
      duration: timeframe,
      channels: selectedChannels,
      objectives: [primaryGoal],
      expectedROI: calculateROI(),
      costPerLead: calculateTotalCost() / Math.max(calculateEstimatedLeads(), 1),
      estimatedLeads: calculateEstimatedLeads(),
      status: 'draft' as const
    };

    createStrategyMutation.mutate(strategyData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Strategy Builder</h1>
          <p className="text-gray-600 mt-2">Create cost-effective marketing campaigns to attract customers</p>
        </div>
        <div className="flex items-center gap-4">
          <img 
            src="/attached_assets/TRAFIC BOOSTERS3 copy_1751060321835.png" 
            alt="Traffik Boosters" 
            className="h-16 w-auto object-contain"
          />
          <div className="text-right">
            <div className="text-sm font-medium text-orange-600">More Traffik!</div>
            <div className="text-sm font-medium text-orange-600">More Sales!</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Strategy Builder</TabsTrigger>
          <TabsTrigger value="channels">Channel Analysis</TabsTrigger>
          <TabsTrigger value="tactics">Marketing Tactics</TabsTrigger>
          <TabsTrigger value="strategies">Saved Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select value={businessType} onValueChange={setBusinessType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hvac">HVAC Services</SelectItem>
                          <SelectItem value="plumbing">Plumbing Services</SelectItem>
                          <SelectItem value="electrical">Electrical Services</SelectItem>
                          <SelectItem value="landscaping">Landscaping</SelectItem>
                          <SelectItem value="cleaning">Cleaning Services</SelectItem>
                          <SelectItem value="home-repair">Home Repair</SelectItem>
                          <SelectItem value="dental">Dental Practice</SelectItem>
                          <SelectItem value="legal">Legal Services</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="retail">Retail Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="timeframe">Campaign Duration</Label>
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="6-months">6 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Textarea
                      id="targetAudience"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Homeowners aged 35-55 in suburban areas with household income $75k+"
                      className="h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="primaryGoal">Primary Marketing Goal</Label>
                    <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your main objective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generate-leads">Generate More Leads</SelectItem>
                        <SelectItem value="increase-sales">Increase Sales Revenue</SelectItem>
                        <SelectItem value="brand-awareness">Build Brand Awareness</SelectItem>
                        <SelectItem value="customer-retention">Improve Customer Retention</SelectItem>
                        <SelectItem value="market-expansion">Expand to New Markets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Channels Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Select Marketing Channels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {LOW_COST_CHANNELS.map((channel) => (
                      <div key={channel.name} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedChannels.includes(channel.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedChannels([...selectedChannels, channel.name]);
                                } else {
                                  setSelectedChannels(selectedChannels.filter(c => c !== channel.name));
                                }
                              }}
                            />
                            <channel.icon className="h-4 w-4 text-primary" />
                            <h4 className="font-medium text-sm">{channel.name}</h4>
                          </div>
                          <Badge variant={channel.category === 'Free' ? 'default' : channel.category === 'Low-Cost' ? 'secondary' : 'outline'}>
                            {channel.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{channel.description}</p>
                        <div className="flex justify-between text-xs">
                          <span>Cost: ${channel.cost}/month</span>
                          <span>Est. Leads: {channel.expectedLeads}/month</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>ROI: {channel.roi}%</span>
                          <span>Time: {channel.timeToResults}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Tactics Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Implementation Tactics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {MARKETING_TACTICS.map((tactic) => (
                      <div key={tactic.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedTactics.includes(tactic.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTactics([...selectedTactics, tactic.id]);
                                } else {
                                  setSelectedTactics(selectedTactics.filter(t => t !== tactic.id));
                                }
                              }}
                            />
                            <h4 className="font-medium">{tactic.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{tactic.category}</Badge>
                            <Badge variant={tactic.difficulty === 'Easy' ? 'default' : tactic.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                              {tactic.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{tactic.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <span>Cost: ${tactic.cost}</span>
                          <span>Time: {tactic.timeframe}</span>
                          <span>Results: {tactic.expectedResults}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategy Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Strategy Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Investment</span>
                      <span className="font-medium">${calculateTotalCost()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estimated Leads</span>
                      <span className="font-medium">{calculateEstimatedLeads()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost per Lead</span>
                      <span className="font-medium">${(calculateTotalCost() / Math.max(calculateEstimatedLeads(), 1)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expected ROI</span>
                      <span className="font-medium text-green-600">{calculateROI()}%</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Selected Channels ({selectedChannels.length})</h4>
                    <div className="space-y-1">
                      {selectedChannels.map((channel) => (
                        <div key={channel} className="text-xs text-gray-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {channel}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Selected Tactics ({selectedTactics.length})</h4>
                    <div className="space-y-1">
                      {selectedTactics.map((tacticId) => {
                        const tactic = MARKETING_TACTICS.find(t => t.id === tacticId);
                        return (
                          <div key={tacticId} className="text-xs text-gray-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {tactic?.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateStrategy}
                    className="w-full"
                    disabled={createStrategyMutation.isPending || selectedChannels.length === 0}
                  >
                    {createStrategyMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Creating Strategy...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Marketing Strategy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Cost-Effective Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="flex items-start gap-2">
                      <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                      <span>Start with free channels (GMB, social media) to build foundation</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                      <span>Focus on local SEO for service businesses - highest ROI</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                      <span>Customer referrals cost less than paid advertising</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                      <span>Track results weekly and adjust spending based on performance</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Channel Analysis</CardTitle>
              <p className="text-gray-600">Compare costs, effectiveness, and ROI across different marketing channels</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {LOW_COST_CHANNELS.map((channel) => (
                  <Card key={channel.name} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <channel.icon className="h-6 w-6 text-primary" />
                        <Badge variant={channel.category === 'Free' ? 'default' : channel.category === 'Low-Cost' ? 'secondary' : 'outline'}>
                          {channel.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{channel.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Monthly Cost</span>
                          <p className="font-medium">${channel.cost}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected Leads</span>
                          <p className="font-medium">{channel.expectedLeads}/month</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost per Lead</span>
                          <p className="font-medium">${channel.costPerLead.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected ROI</span>
                          <p className="font-medium text-green-600">{channel.roi}%</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Difficulty</span>
                          <span className={`font-medium ${
                            channel.difficulty === 'Easy' ? 'text-green-600' : 
                            channel.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {channel.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Time to Results</span>
                          <span className="font-medium">{channel.timeToResults}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tactics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Tactics</CardTitle>
              <p className="text-gray-600">Step-by-step marketing tactics to execute your strategy</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {MARKETING_TACTICS.map((tactic) => (
                  <Card key={tactic.id} className="border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tactic.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{tactic.category}</Badge>
                          <Badge variant={tactic.difficulty === 'Easy' ? 'default' : tactic.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                            {tactic.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600">{tactic.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Investment</span>
                          <p className="font-medium">${tactic.cost}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Timeframe</span>
                          <p className="font-medium">{tactic.timeframe}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected Results</span>
                          <p className="font-medium">{tactic.expectedResults}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Implementation Steps:</h4>
                        <ol className="space-y-1 text-sm">
                          {tactic.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Marketing Strategies</CardTitle>
              <p className="text-gray-600">View and manage your created marketing strategies</p>
            </CardHeader>
            <CardContent>
              {strategiesArray && strategiesArray.length > 0 ? (
                <div className="space-y-4">
                  {strategiesArray.map((strategy: MarketingStrategy) => (
                    <Card key={strategy.id} className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{strategy.strategyName}</CardTitle>
                          <Badge variant={strategy.status === 'active' ? 'default' : strategy.status === 'completed' ? 'secondary' : 'outline'}>
                            {strategy.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">Target: {strategy.targetAudience}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Budget</span>
                            <p className="font-medium">${strategy.budget}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration</span>
                            <p className="font-medium">{strategy.duration}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Est. Leads</span>
                            <p className="font-medium">{strategy.estimatedLeads}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Expected ROI</span>
                            <p className="font-medium text-green-600">{strategy.expectedROI}%</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Channels ({strategy.channels.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {strategy.channels.map((channel) => (
                              <Badge key={channel} variant="outline">{channel}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Objectives</h4>
                          <div className="flex flex-wrap gap-2">
                            {strategy.objectives.map((objective) => (
                              <Badge key={objective} variant="secondary">{objective}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies created yet</h3>
                  <p className="text-gray-600 mb-4">Create your first marketing strategy to get started</p>
                  <Button onClick={() => setActiveTab("create")}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Strategy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}