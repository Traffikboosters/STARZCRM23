import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Play, 
  Settings, 
  Target, 
  Globe, 
  Filter, 
  Zap, 
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Mail,
  DollarSign
} from "lucide-react";

const scrapingTemplates = [
  {
    id: 1,
    name: "Restaurant Prospects (Yelp)",
    description: "Local restaurants with high ratings for SEO/marketing services",
    url: "https://www.yelp.com/search?find_desc=restaurants&find_loc=",
    selectors: {
      business_name: ".biz-name span",
      rating: ".rating-large",
      review_count: ".review-count",
      phone: ".biz-phone",
      address: ".address",
      website: ".website-link"
    },
    filters: {
      min_rating: 4.0,
      min_reviews: 50,
      exclude_chains: true
    },
    expectedLeads: "60-80 per city",
    conversionRate: "12%"
  },
  {
    id: 2,
    name: "High-Growth B2B (Inc 5000)",
    description: "Fast-growing companies needing digital marketing scale",
    url: "https://www.inc.com/inc5000/",
    selectors: {
      company_name: ".company-name",
      revenue: ".revenue",
      growth_rate: ".growth",
      industry: ".industry",
      location: ".location",
      employees: ".employees"
    },
    filters: {
      min_growth: 50,
      revenue_range: "10M-500M",
      exclude_industries: ["finance", "healthcare"]
    },
    expectedLeads: "200-300 per scrape",
    conversionRate: "8%"
  },
  {
    id: 3,
    name: "Local Service Businesses",
    description: "Professional services lacking digital presence",
    url: "https://www.yellowpages.com/search?search_terms=",
    selectors: {
      business_name: ".business-name",
      category: ".categories",
      phone: ".phones",
      address: ".street-address",
      website: ".website-link",
      years_in_business: ".years-in-business"
    },
    filters: {
      min_years: 3,
      has_website: false,
      categories: ["legal", "accounting", "consulting", "real estate"]
    },
    expectedLeads: "40-60 per area",
    conversionRate: "15%"
  }
];

const automationRules = [
  {
    id: 1,
    name: "High-Value Restaurant Auto-Assignment",
    trigger: "New restaurant lead with 4.5+ rating and 100+ reviews",
    actions: [
      "Assign to senior sales rep",
      "Create 'Premium Restaurant' campaign",
      "Send personalized outreach within 2 hours",
      "Schedule follow-up in 3 days"
    ],
    priority: "High",
    isActive: true
  },
  {
    id: 2,
    name: "B2B Growth Company Pipeline",
    trigger: "Inc 5000 company with 100%+ growth rate",
    actions: [
      "Add to 'Enterprise Growth' segment",
      "Research company leadership on LinkedIn",
      "Create custom proposal template",
      "Flag for CEO outreach"
    ],
    priority: "Critical",
    isActive: true
  },
  {
    id: 3,
    name: "Local Service Lead Nurture",
    trigger: "Service business without website",
    actions: [
      "Add to 'Website Development' campaign",
      "Send local business success stories",
      "Offer free website audit",
      "Schedule in 'Quick Win' pipeline"
    ],
    priority: "Medium",
    isActive: true
  }
];

export default function ScrapingConfigurationDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState(scrapingTemplates[0]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("templates");

  const handleStartScraping = () => {
    setIsConfiguring(true);
    setProgress(0);
    
    // Simulate configuration process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsConfiguring(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const configSteps = [
    "Validating target URLs",
    "Testing CSS selectors", 
    "Applying quality filters",
    "Setting up automation rules",
    "Initializing data collection",
    "Starting lead pipeline"
  ];

  const currentStep = Math.floor(progress / 16.66);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Generation Configuration</h2>
          <p className="text-muted-foreground">
            Set up automated data collection and lead processing workflows
          </p>
        </div>
        <Button 
          onClick={handleStartScraping} 
          disabled={isConfiguring}
          className="px-6"
        >
          <Play className="w-4 h-4 mr-2" />
          {isConfiguring ? "Configuring..." : "Start New Job"}
        </Button>
      </div>

      {/* Configuration Progress */}
      {isConfiguring && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Setting up: {selectedTemplate.name}</h3>
                <Badge variant="secondary">{progress}%</Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {currentStep < configSteps.length ? configSteps[currentStep] : "Configuration complete"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Scraping Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Template Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose Scraping Template</h3>
              <div className="space-y-3">
                {scrapingTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTemplate.id === template.id 
                        ? "ring-2 ring-primary border-primary bg-primary/5" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                        {selectedTemplate.id === template.id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Expected: {template.expectedLeads}</span>
                        <Badge variant="secondary">{template.conversionRate} conversion</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Template Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configure Selected Template</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {selectedTemplate.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target URL Pattern</Label>
                    <Input 
                      value={selectedTemplate.url} 
                      readOnly 
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Geographic Area</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Major Cities</SelectItem>
                        <SelectItem value="tier1">Tier 1 Cities Only</SelectItem>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Schedule Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Quality Filters</Label>
                    {Object.entries(selectedTemplate.filters).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Automation Rules</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {rule.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <strong>Trigger:</strong> {rule.trigger}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={rule.priority === 'Critical' ? 'destructive' : 
                                rule.priority === 'High' ? 'default' : 'secondary'}
                      >
                        {rule.priority}
                      </Badge>
                      <Switch checked={rule.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Automated Actions:</Label>
                    <ul className="space-y-1">
                      {rule.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">2 running, 1 scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">+12% from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Assigned</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">31</div>
                <p className="text-xs text-muted-foreground">66% automation rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,400</div>
                <p className="text-xs text-muted-foreground">This week's pipeline</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Jobs Status */}
          <Card>
            <CardHeader>
              <CardTitle>Live Scraping Status</CardTitle>
              <CardDescription>Real-time monitoring of active data collection jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Yelp Restaurant Scan - Chicago", status: "running", progress: 67, leads: 23, eta: "45 min" },
                  { name: "Inc 5000 Tech Companies", status: "running", progress: 34, leads: 12, eta: "2h 15min" },
                  { name: "Local Service Businesses - Miami", status: "scheduled", progress: 0, leads: 0, eta: "6h 30min" }
                ].map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{job.name}</h4>
                        <Badge variant={job.status === 'running' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={job.progress} className="h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {job.leads} leads • ETA: {job.eta}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Automation Triggers */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Automation Activity</CardTitle>
              <CardDescription>Latest automated actions triggered by new leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "2 min ago", action: "High-value restaurant auto-assigned to Sarah M.", type: "assignment" },
                  { time: "8 min ago", action: "B2B growth company added to enterprise pipeline", type: "pipeline" },
                  { time: "15 min ago", action: "Local service business flagged for website audit", type: "opportunity" },
                  { time: "23 min ago", action: "Premium restaurant campaign automatically created", type: "campaign" },
                  { time: "31 min ago", action: "CEO outreach scheduled for high-growth tech company", type: "outreach" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'assignment' ? 'bg-blue-500' :
                      activity.type === 'pipeline' ? 'bg-green-500' :
                      activity.type === 'opportunity' ? 'bg-yellow-500' :
                      activity.type === 'campaign' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}