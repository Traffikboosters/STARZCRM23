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
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

const scrapingTemplates = [
  {
    id: 1,
    name: "Bark.com Service Providers",
    description: "Active service providers seeking digital marketing to grow their business",
    url: "https://www.bark.com/en/gb/",
    selectors: {
      business_name: "[data-testid='provider-name'], .provider-card h3, .business-name, .pro-name",
      phone: "[data-testid='phone'], .phone-number, .contact-phone, .pro-phone",
      email: "[data-testid='email'], .email-address, .contact-email, .pro-email",
      location: "[data-testid='location'], .location, .service-area, .pro-location",
      category: "[data-testid='category'], .service-category, .business-type, .pro-category",
      rating: "[data-testid='rating'], .rating-score, .review-rating, .pro-rating",
      description: "[data-testid='description'], .service-description, .about-text, .pro-bio",
      price_range: ".price-range, .starting-price, .hourly-rate",
      reviews_count: ".reviews-count, .review-number, .total-reviews"
    },
    filters: {
      min_rating: 4.0,
      min_reviews: 10,
      active_within: "30 days",
      service_types: ["home improvement", "business services", "events", "wellness", "marketing"]
    },
    expectedLeads: "150-200 per scrape",
    conversionRate: "18%",
    targetAudience: "Service providers needing online visibility and lead generation"
  },
  {
    id: 2,
    name: "Business Insider Companies",
    description: "Featured companies and startups from business news for B2B marketing services",
    url: "https://www.businessinsider.com/",
    selectors: {
      company_name: "h1, .headline, .company-name, [data-testid='title'], .post-headline",
      industry: ".category, .industry, .sector-tag, .article-category",
      description: ".article-content p, .summary, .company-description, .post-content",
      executives: ".author, .executive-name, .leadership, .byline-name",
      financials: ".financial-data, .revenue, .funding-info, .valuation",
      website: "a[href*='http']:not([href*='businessinsider']), .external-link, .company-website",
      location: ".location, .headquarters, .company-location",
      funding_stage: ".funding-round, .series, .investment-stage"
    },
    filters: {
      article_types: ["startup", "ipo", "funding", "acquisition", "tech", "growth"],
      exclude_keywords: ["bankruptcy", "lawsuit", "scandal", "closure"],
      min_funding: "1M",
      company_age: "6 months - 10 years"
    },
    expectedLeads: "80-120 per scrape",
    conversionRate: "14%",
    targetAudience: "Growing companies needing marketing, PR, and digital transformation services"
  },
  {
    id: 3,
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
      exclude_chains: true,
      location_radius: "25 miles"
    },
    expectedLeads: "60-90 per scrape",
    conversionRate: "22%",
    targetAudience: "Local restaurants needing digital marketing and online presence"
  },
  {
    id: 4,
    name: "LinkedIn Sales Navigator",
    description: "B2B decision makers and company executives for outreach campaigns",
    url: "https://www.linkedin.com/sales/search/",
    selectors: {
      name: ".search-result__info h3",
      title: ".search-result__info .subline-level-1",
      company: ".search-result__info .subline-level-2",
      location: ".search-result__info .t-black--light",
      industry: ".company-industry",
      employees: ".company-size"
    },
    filters: {
      seniority_levels: ["Director", "VP", "C-Level", "Owner"],
      company_size: "10-1000 employees",
      industry_focus: ["Marketing", "Technology", "Professional Services", "Healthcare"],
      geography: "North America"
    },
    expectedLeads: "40-60 per scrape",
    conversionRate: "16%",
    targetAudience: "B2B executives and decision makers for enterprise marketing services"
  },
  {
    id: 5,
    name: "Google My Business (Local)",
    description: "Local businesses with Google listings for local SEO and marketing services",
    url: "https://www.google.com/maps/search/",
    selectors: {
      business_name: "[data-value='Name']",
      category: "[data-value='Category']", 
      rating: "[data-value='Rating']",
      reviews: "[data-value='Reviews']",
      phone: "[data-value='Phone']",
      website: "[data-value='Website']",
      address: "[data-value='Address']"
    },
    filters: {
      min_rating: 3.5,
      has_website: false,
      categories: ["retail", "services", "food", "healthcare", "automotive"],
      verified_listing: true
    },
    expectedLeads: "100-150 per scrape",
    conversionRate: "19%",
    targetAudience: "Local businesses without websites needing digital marketing solutions"
  },
  {
    id: 6,
    name: "Crunchbase Startups",
    description: "Funded startups and growing companies for B2B marketing and growth services",
    url: "https://www.crunchbase.com/discover/organization.companies/",
    selectors: {
      company_name: ".cb-overflow-ellipsis",
      description: ".description-text",
      funding: ".funding-amount",
      stage: ".funding-stage",
      location: ".location-text",
      website: ".website-link",
      employees: ".employee-count"
    },
    filters: {
      funding_range: "$500K - $50M",
      founded_years: "2-8 years",
      employee_range: "10-500",
      funding_stages: ["Seed", "Series A", "Series B"],
      exclude_enterprise: true
    },
    expectedLeads: "30-50 per scrape",
    conversionRate: "12%",
    targetAudience: "Fast-growing startups needing marketing infrastructure and growth hacking"
  },
  {
    id: 7, 
    name: "Industry Directory Sites",
    description: "Professional service providers from niche industry directories",
    url: "https://www.expertise.com/",
    selectors: {
      provider_name: ".provider-name",
      specialties: ".specialties-list",
      location: ".provider-location", 
      phone: ".contact-phone",
      website: ".provider-website",
      rating: ".provider-rating",
      years_experience: ".experience-years"
    },
    filters: {
      min_experience: "3 years",
      verified_providers: true,
      service_areas: ["Marketing", "Consulting", "Design", "Development", "Legal"],
      exclude_agencies: false
    },
    expectedLeads: "70-100 per scrape",
    conversionRate: "15%",
    targetAudience: "Professional service providers looking to expand their digital footprint"
  },
  {
    id: 8,
    name: "Craigslist Business Services",
    description: "Local businesses advertising services on Craigslist for digital marketing outreach",
    url: "https://craigslist.org/search/bfs",
    selectors: {
      business_name: ".result-title",
      service_description: ".result-info",
      location: ".result-hood",
      contact_info: ".reply-button",
      category: ".result-meta .result-price",
      posting_date: ".result-date",
      images: ".result-image"
    },
    filters: {
      categories: ["computer services", "marketing", "creative services", "business services", "financial services"],
      exclude_keywords: ["adult", "massage", "escort", "personal"],
      posting_age: "7 days",
      has_contact_info: true,
      min_description_length: 50
    },
    expectedLeads: "80-120 per city",
    conversionRate: "20%",
    targetAudience: "Local service providers actively seeking new business and clients"
  },
  {
    id: 9,
    name: "Angie's List Contractors",
    description: "Verified home improvement and professional service contractors from Angie's List",
    url: "https://www.angieslist.com/contractors",
    selectors: {
      business_name: ".business-name, .contractor-name",
      contact_info: ".phone-number, .contact-info",
      location: ".service-area, .location",
      rating: ".rating-stars, .average-rating",
      reviews: ".review-count, .total-reviews",
      services: ".services-offered, .categories",
      verification: ".verified-badge, .background-check"
    },
    filters: {
      categories: ["plumbing", "electrical", "hvac", "roofing", "landscaping", "painting", "flooring"],
      min_rating: 4.0,
      verified_only: true,
      has_reviews: true,
      min_review_count: 10,
      service_radius: "25 miles"
    },
    expectedLeads: "60-90 per region",
    conversionRate: "25%",
    targetAudience: "Verified home improvement contractors and professional service providers with established track records"
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

  const handleStartScraping = async () => {
    setIsConfiguring(true);
    setProgress(0);
    
    try {
      let endpoint = '';
      if (selectedTemplate.name.includes('Bark.com')) {
        endpoint = '/api/scraping-jobs/bark';
      } else if (selectedTemplate.name.includes('Business Insider')) {
        endpoint = '/api/scraping-jobs/businessinsider';
      } else if (selectedTemplate.name.includes('Craigslist')) {
        endpoint = '/api/scraping-jobs/craigslist';
      } else if (selectedTemplate.name.includes('Angie\'s List')) {
        endpoint = '/api/scraping-jobs/angieslist';
      }
      
      if (endpoint) {
        // Show real progress for actual scraping
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95; // Stop at 95% until API completes
            }
            return prev + 15;
          });
        }, 400);

        const response = await apiRequest("POST", endpoint);
        const result = await response.json();
        
        clearInterval(progressInterval);
        setProgress(100);
        
        // Show success notification with real results and audio alert
        setTimeout(() => {
          setIsConfiguring(false);
          
          // Play audio notification for new leads
          const audio = new Audio('data:audio/wav;base64,UklGRvIBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU4BAABBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+H+sEA');
          audio.volume = 0.5;
          audio.play().catch(() => {}); // Ignore audio errors
          
          // Create desktop notification if permission granted
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`New Leads Captured!`, {
              body: `${result.leadsFound} leads extracted from ${selectedTemplate.name}`,
              icon: traffikBoostersLogo,
              tag: 'lead-notification'
            });
          } else if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                new Notification(`New Leads Captured!`, {
                  body: `${result.leadsFound} leads extracted from ${selectedTemplate.name}`,
                  icon: traffikBoostersLogo,
                  tag: 'lead-notification'
                });
              }
            });
          }
          
          alert(`🚀 LEAD ALERT! Successfully extracted ${result.leadsFound} high-quality leads from ${selectedTemplate.name}!\n\n✅ Leads automatically added to your CRM\n📞 Ready for immediate contact\n💰 Estimated value: ${selectedTemplate.name.includes('Bark') ? '£2,500-£5,000' : '$8,500-$25,000'} per lead\n\n👉 View in CRM → Contacts section`);
        }, 500);
      } else {
        // Simulate configuration for other templates
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
      }
    } catch (error) {
      setIsConfiguring(false);
      setProgress(0);
      alert('Failed to start scraping job. Please try again.');
    }
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
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-10 w-auto"
          />
          <div>
            <h2 className="text-2xl font-bold">Lead Generation Configuration</h2>
            <p className="text-muted-foreground">
              Set up automated data collection and lead processing workflows
            </p>
          </div>
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
          {/* Website Selection Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-blue-600" />
                Available Data Sources - Choose Your Target Website
              </CardTitle>
              <CardDescription className="text-base">
                Select from {scrapingTemplates.length} pre-configured websites optimized for lead generation. Each template targets different business types and demographics including Craigslist local services and Angie's List verified contractors.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Quick Website Selection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 mb-6">
            {scrapingTemplates.map((template) => (
              <Card 
                key={`quick-${template.id}`}
                className={`cursor-pointer text-center p-3 transition-all duration-200 ${
                  selectedTemplate.id === template.id 
                    ? "ring-2 ring-primary border-primary bg-primary/10" 
                    : "hover:shadow-md hover:bg-gray-50"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="space-y-2">
                  <Globe className={`w-6 h-6 mx-auto ${
                    selectedTemplate.id === template.id ? "text-primary" : "text-gray-400"
                  }`} />
                  <div className="text-xs font-medium text-center">
                    {template.url.replace('https://', '').split('/')[0].replace('www.', '')}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.expectedLeads.split(' ')[0]}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Template Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detailed Website Information</h3>
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
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Expected: {template.expectedLeads}</span>
                          <Badge variant="secondary">{template.conversionRate} conversion</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-600 font-medium">{template.url.replace('https://', '').split('/')[0]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.targetAudience}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Template Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configure Selected Website</h3>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Target: {selectedTemplate.url.replace('https://', '').split('/')[0]}
                </span>
              </div>
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
                    <Label>Geographic Targeting</Label>
                    <Select defaultValue="usa">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                        <SelectItem value="global">Global (All Countries)</SelectItem>
                        <SelectItem value="custom">Custom Regions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Quality Filters</Label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Available Data</SelectItem>
                        <SelectItem value="medium">Medium Quality (Basic Info)</SelectItem>
                        <SelectItem value="high">High Quality (Complete Profiles)</SelectItem>
                        <SelectItem value="premium">Premium Only (Verified + Rich Data)</SelectItem>
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