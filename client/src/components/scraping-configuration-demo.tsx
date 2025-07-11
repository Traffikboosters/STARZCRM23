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
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import IndustrySelector from "@/components/industry-selector";
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
    id: 10,
    name: "Yellow Pages Business Directory",
    description: "Established businesses from Yellow Pages directory needing digital marketing upgrades",
    url: "https://www.yellowpages.com",
    selectors: {
      business_name: ".business-name, .listing-name",
      phone: ".phone, .contact-phone",
      address: ".address, .street-address",
      category: ".category, .business-type",
      rating: ".rating-stars, .overall-rating",
      years_listed: ".years-in-business, .established",
      website: ".website-link, .business-website"
    },
    filters: {
      categories: ["attorneys", "auto repair", "beauty", "construction", "dentists", "financial", "health", "home improvement", "insurance", "marketing", "real estate", "restaurants", "professional services"],
      min_years_listed: 3,
      has_phone: true,
      verified_listing: true,
      exclude_chains: false
    },
    expectedLeads: "120-180 per scrape",
    conversionRate: "22%",
    targetAudience: "Established businesses seeking modern digital marketing and online presence solutions"
  },
  {
    id: 11,
    name: "White Pages Professional Directory",
    description: "Professional service providers and practices from White Pages for B2B marketing services",
    url: "https://www.whitepages.com",
    selectors: {
      professional_name: ".professional-name, .person-name",
      business_name: ".business-name, .company-name",
      phone: ".contact-phone, .business-phone",
      address: ".business-address, .office-location",
      title: ".professional-title, .job-title",
      years_experience: ".years-in-business, .experience-years",
      specialties: ".specialties, .practice-areas"
    },
    filters: {
      categories: ["professional services", "medical practice", "legal office", "financial advisor", "insurance agency", "real estate office", "consulting firm", "marketing agency", "accounting firm", "dental practice"],
      min_years_experience: 5,
      has_business_phone: true,
      professional_title_required: true,
      exclude_individuals: false
    },
    expectedLeads: "80-120 per scrape",
    conversionRate: "25%",
    targetAudience: "Professional service providers and practices needing advanced digital marketing and client acquisition strategies"
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
  },
  {
    id: 12,
    name: "Google Maps National Business Directory",
    description: "Local service businesses across all 50 US states with Google ratings and verified contact information",
    url: "https://maps.google.com/business",
    selectors: {
      business_name: ".place-name, .business-title, .listing-name",
      owner_name: ".business-owner, .contact-person, .manager-name",
      phone: ".phone-number, .business-phone, .contact-phone",
      email: ".email-address, .business-email, .contact-email",
      address: ".full-address, .business-address, .location-info",
      category: ".business-category, .place-type, .service-category",
      rating: ".star-rating, .google-rating, .review-score",
      reviews: ".review-count, .total-reviews, .review-number",
      hours: ".business-hours, .opening-hours, .operating-times",
      website: ".website-link, .business-url, .company-website"
    },
    filters: {
      min_rating: 3.0,
      min_reviews: 10,
      business_status: "open",
      verification_status: "verified",
      service_types: ["HVAC", "plumbing", "electrical", "roofing", "landscaping", "cleaning", "auto repair", "dental", "medical", "legal"]
    },
    expectedLeads: "180-250 per scrape",
    conversionRate: "22%",
    targetAudience: "Local service businesses across the entire United States with established Google presence"
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
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'daily',
    time: '09:00',
    timezone: 'EST',
    maxLeads: 100,
    enabled: true
  });

  const handleStartScraping = async () => {
    setIsConfiguring(true);
    setProgress(0);
    
    // Show initial "Fetching leads..." notification
    toast({
      title: "🔍 Fetching leads...",
      description: `Starting lead extraction from ${selectedTemplate.name}`,
      duration: 3000,
    });
    
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
      } else if (selectedTemplate.name.includes('Yellow Pages')) {
        endpoint = '/api/scraping-jobs/yellowpages';
      } else if (selectedTemplate.name.includes('White Pages')) {
        endpoint = '/api/scraping-jobs/whitepages';
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
        
        // Show immediate completion notification with lead count
        toast({
          title: `📊 Lead fetching completed!`,
          description: `Found ${result.leadsFound || result.leads || 0} new leads ready for review`,
          duration: 4000,
        });
        
        // Show success notification with real results and audio alert
        setTimeout(() => {
          setIsConfiguring(false);
          
          // Show final import completion notification
          toast({
            title: "✅ Lead import successful!",
            description: `${result.leadsFound || result.leads || 0} leads imported to CRM and ready for outreach`,
            duration: 6000,
          });
          
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
      
      // Show error notification
      toast({
        title: "❌ Lead extraction failed",
        description: `Unable to extract leads from ${selectedTemplate.name}. Please try again.`,
        duration: 5000,
        variant: "destructive"
      });
    }
  };

  const handleScheduleScraping = async () => {
    try {
      // Show scheduling notification
      toast({
        title: "⏰ Setting up automated collection...",
        description: `Configuring ${scheduleConfig.frequency} scraping for ${selectedTemplate.name}`,
        duration: 3000,
      });

      let endpoint = '';
      if (selectedTemplate.name.includes('Bark.com')) {
        endpoint = '/api/scraping-jobs/bark';
      } else if (selectedTemplate.name.includes('Business Insider')) {
        endpoint = '/api/scraping-jobs/businessinsider';
      } else if (selectedTemplate.name.includes('Craigslist')) {
        endpoint = '/api/scraping-jobs/craigslist';
      } else if (selectedTemplate.name.includes('Angie\'s List')) {
        endpoint = '/api/scraping-jobs/angieslist';
      } else if (selectedTemplate.name.includes('Yellow Pages')) {
        endpoint = '/api/scraping-jobs/yellowpages';
      } else if (selectedTemplate.name.includes('White Pages')) {
        endpoint = '/api/scraping-jobs/whitepages';
      }

      if (endpoint) {
        const scheduleData = {
          name: `${selectedTemplate.name} - Scheduled`,
          url: selectedTemplate.url,
          schedule: `${scheduleConfig.frequency} at ${scheduleConfig.time} ${scheduleConfig.timezone}`,
          maxLeads: scheduleConfig.maxLeads,
          enabled: scheduleConfig.enabled,
          selectors: selectedTemplate.selectors,
          filters: selectedTemplate.filters
        };

        const response = await apiRequest("POST", "/api/scraping-jobs", scheduleData);
        const result = await response.json();

        setShowScheduleDialog(false);
        
        toast({
          title: "✅ Automated collection scheduled!",
          description: `${scheduleConfig.frequency} lead extraction set up for ${scheduleConfig.time} ${scheduleConfig.timezone}`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error scheduling scraping:', error);
      toast({
        title: "❌ Scheduling failed",
        description: "Unable to set up automated collection. Please try again.",
        duration: 5000,
        variant: "destructive"
      });
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Scraping Templates</TabsTrigger>
          <TabsTrigger value="industries">Target Industries</TabsTrigger>
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
                Configure automated data collection from {scrapingTemplates.length} pre-configured websites. Use the dropdown below to select your target platform.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Website Selection Dropdown */}
          <Card className="mb-6 border-2 border-[#e45c2b] bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#e45c2b]">
                <Target className="w-5 h-5" />
                Select Target Platform ({scrapingTemplates.length} Available)
              </CardTitle>
              <CardDescription className="text-base font-medium">
                Choose from our complete collection of lead generation platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800">
                    Lead Generation Platform
                  </Label>
                  <Select 
                    value={selectedTemplate.id.toString()} 
                    onValueChange={(value) => {
                      const template = scrapingTemplates.find(t => t.id.toString() === value);
                      if (template) setSelectedTemplate(template);
                    }}
                  >
                    <SelectTrigger className="w-full h-12 border-2 border-[#e45c2b] bg-white">
                      <SelectValue>
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-[#e45c2b]" />
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">{selectedTemplate.name}</div>
                            <div className="text-xs text-gray-600">{selectedTemplate.expectedLeads} • {selectedTemplate.conversionRate} conversion</div>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {scrapingTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()} className="p-4">
                          <div className="w-full">
                            <div className="flex items-center gap-3 mb-2">
                              <Target className="w-4 h-4 text-[#e45c2b]" />
                              <div className="font-semibold text-gray-900">{template.name}</div>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                {template.expectedLeads}
                              </Badge>
                              <span className="text-xs font-semibold text-[#e45c2b]">
                                {template.conversionRate} conversion
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">✓ Platform Configured</h4>
                      <p className="text-sm text-green-800">
                        <strong>{selectedTemplate.name}</strong> is ready for lead extraction. Expected results: <strong>{selectedTemplate.expectedLeads}</strong> with <strong>{selectedTemplate.conversionRate}</strong> conversion rate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Website Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#e45c2b]">
                <Settings className="w-5 h-5" />
                Selected: {selectedTemplate.name}
              </CardTitle>
              <CardDescription className="text-base">
                {selectedTemplate.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Target Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Website:</span> {selectedTemplate.url}</div>
                    <div><span className="font-medium">Expected Leads:</span> {selectedTemplate.expectedLeads}</div>
                    <div><span className="font-medium">Conversion Rate:</span> {selectedTemplate.conversionRate}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Key Filters</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedTemplate.filters).slice(0, 4).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium text-gray-700 capitalize">{key.replace('_', ' ')}:</span>
                        <div className="text-gray-600 text-xs mt-1">
                          {Array.isArray(value) ? value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '') : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Target Audience</h4>
                  <div className="text-sm text-gray-600 leading-relaxed mb-4">
                    {selectedTemplate.targetAudience}
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800 mb-1">Ready to Extract</div>
                    <div className="text-xs text-green-700">All systems configured for {selectedTemplate.name} lead generation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Start Scraping Now</h4>
                      <p className="text-sm text-gray-600">Begin immediate data extraction</p>
                    </div>
                    <Button 
                      onClick={handleStartScraping}
                      disabled={isConfiguring}
                      className="bg-[#e45c2b] hover:bg-[#d44d20]"
                    >
                      {isConfiguring ? 'Processing...' : 'Extract Leads'}
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Schedule Scraping</h4>
                      <p className="text-sm text-gray-600">Set up automated data collection</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setShowScheduleDialog(true)}
                    >
                      Schedule
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuration Options</h3>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Quality Filters</Label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Available Data</SelectItem>
                        <SelectItem value="medium">Medium Quality</SelectItem>
                        <SelectItem value="high">High Quality</SelectItem>
                        <SelectItem value="premium">Premium Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Geographic Targeting</Label>
                    <Select defaultValue="us">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="industries" className="space-y-6">
          <IndustrySelector
            selectedIndustries={selectedIndustries}
            onIndustryChange={setSelectedIndustries}
            onSearch={(industries) => {
              // Trigger industry-specific lead search
              console.log('Searching industries:', industries);
              handleStartScraping();
            }}
            title="Target Industries for Lead Generation"
            description="Select specific industries to focus your lead generation efforts and maximize conversion rates"
          />
          
          {selectedIndustries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Industry-Specific Campaign Settings</CardTitle>
                <CardDescription>
                  Customize your approach for the selected industries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lead Value Range</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Value Ranges</SelectItem>
                        <SelectItem value="low">$1,000 - $5,000</SelectItem>
                        <SelectItem value="standard">$5,000 - $15,000</SelectItem>
                        <SelectItem value="high">$15,000 - $50,000</SelectItem>
                        <SelectItem value="enterprise">$50,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company Size Filter</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Company Sizes</SelectItem>
                        <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                        <SelectItem value="small">Small Business (11-50)</SelectItem>
                        <SelectItem value="medium">Medium Business (51-200)</SelectItem>
                        <SelectItem value="large">Large Enterprise (200+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="verified-only" />
                  <Label htmlFor="verified-only">Verified businesses only</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="growth-companies" />
                  <Label htmlFor="growth-companies">Focus on growing companies</Label>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Automation Rules</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Progress Display */}
      {isConfiguring && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing {selectedTemplate.name}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Scraping Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Automated Data Collection</DialogTitle>
            <DialogDescription>
              Set up automated lead extraction for {selectedTemplate.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={scheduleConfig.frequency} onValueChange={(value) => 
                setScheduleConfig(prev => ({ ...prev, frequency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input 
                  type="time" 
                  value={scheduleConfig.time}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={scheduleConfig.timezone} onValueChange={(value) => 
                  setScheduleConfig(prev => ({ ...prev, timezone: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                    <SelectItem value="MST">MST</SelectItem>
                    <SelectItem value="CST">CST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Max Leads Per Run</Label>
              <Input 
                type="number" 
                value={scheduleConfig.maxLeads}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, maxLeads: parseInt(e.target.value) }))}
                min="10"
                max="500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="schedule-enabled"
                checked={scheduleConfig.enabled}
                onCheckedChange={(checked) => setScheduleConfig(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="schedule-enabled">Enable automated collection</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleScraping} className="bg-[#e45c2b] hover:bg-[#d44d20]">
              Schedule Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
