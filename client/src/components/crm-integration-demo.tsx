import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  DollarSign,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  Zap,
  PhoneCall
} from "lucide-react";
import ClickToCallButton from "@/components/click-to-call-button";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

const scrapedLeads = [
  {
    id: 1,
    businessName: "Bella Vista Restaurant",
    contactName: "Maria Gonzalez",
    phone: "(305) 555-0123",
    email: "maria@bellavista.com",
    address: "1234 Ocean Drive, Miami Beach, FL",
    rating: 4.7,
    reviewCount: 342,
    source: "Yelp",
    scrapedAt: "2 minutes ago",
    status: "new",
    estimatedValue: 4500,
    category: "Restaurant",
    priority: "High"
  },
  {
    id: 2,
    businessName: "TechFlow Solutions",
    contactName: "David Chen",
    phone: "(415) 555-0456",
    email: "d.chen@techflow.com",
    address: "567 Market St, San Francisco, CA",
    revenue: "25M",
    growthRate: "156%",
    source: "Inc 5000",
    scrapedAt: "5 minutes ago",
    status: "qualified",
    estimatedValue: 12000,
    category: "Technology",
    priority: "Critical"
  },
  {
    id: 3,
    businessName: "Metro Legal Associates",
    contactName: "Jennifer Smith",
    phone: "(212) 555-0789",
    email: "j.smith@metrolegal.com",
    address: "890 Broadway, New York, NY",
    yearsInBusiness: 8,
    hasWebsite: false,
    source: "YellowPages",
    scrapedAt: "8 minutes ago",
    status: "assigned",
    estimatedValue: 3200,
    category: "Legal Services",
    priority: "Medium"
  }
];

const automationSteps = [
  {
    id: 1,
    title: "Lead Qualification",
    description: "AI analyzes scraped data against quality criteria",
    icon: Target,
    status: "completed",
    time: "< 1 second"
  },
  {
    id: 2,
    title: "CRM Integration",
    description: "Contact automatically created with all scraped details",
    icon: User,
    status: "completed",
    time: "2 seconds"
  },
  {
    id: 3,
    title: "Campaign Assignment",
    description: "Lead added to appropriate marketing campaign",
    icon: MessageSquare,
    status: "in-progress",
    time: "5 seconds"
  },
  {
    id: 4,
    title: "Sales Assignment",
    description: "Round-robin assignment to available sales rep",
    icon: Users,
    status: "pending",
    time: "10 seconds"
  },
  {
    id: 5,
    title: "Outreach Automation",
    description: "Personalized email sequence initiated",
    icon: Mail,
    status: "pending",
    time: "30 seconds"
  }
];

export default function CRMIntegrationDemo() {
  const [selectedLead, setSelectedLead] = useState(scrapedLeads[0]);
  const [automationProgress, setAutomationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutomationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });

      setCurrentStep(prev => {
        const newStep = Math.floor(automationProgress / 20);
        return Math.min(newStep, automationSteps.length - 1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [automationProgress]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "qualified": return "bg-green-100 text-green-800";
      case "assigned": return "bg-purple-100 text-purple-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
            <h2 className="text-2xl font-bold">CRM Integration Workflow</h2>
            <p className="text-muted-foreground">
              Watch how scraped leads automatically flow into your sales pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            Real-time Processing
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Automation Workflow</TabsTrigger>
          <TabsTrigger value="leads">Scraped Leads Queue</TabsTrigger>
          <TabsTrigger value="crm">CRM Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          {/* Lead Processing Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Live Lead Processing Pipeline
              </CardTitle>
              <CardDescription>
                Automatic processing of: {selectedLead.businessName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing Progress</span>
                  <span className="text-sm text-muted-foreground">{automationProgress}%</span>
                </div>
                <Progress value={automationProgress} className="h-2" />
              </div>

              {/* Automation Steps */}
              <div className="space-y-4">
                {automationSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStep;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div 
                      key={step.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 ${
                        isActive ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        isCompleted ? 'bg-green-100 text-green-600' :
                        isCurrent ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {isActive && (
                          <p className="text-xs text-primary mt-1">
                            {isCompleted ? 'Completed' : `Processing... (${step.time})`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          isCompleted ? 'default' :
                          isCurrent ? 'secondary' : 'outline'
                        }>
                          {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12 sec</div>
                <p className="text-xs text-muted-foreground">Average lead processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.7%</div>
                <p className="text-xs text-muted-foreground">Successful integrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Assigned</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">Immediate assignment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$19,700</div>
                <p className="text-xs text-muted-foreground">Today's potential</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          {/* Lead Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recently Scraped Leads</h3>
              <div className="space-y-3">
                {scrapedLeads.map((lead) => (
                  <Card 
                    key={lead.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedLead.id === lead.id 
                        ? "ring-2 ring-primary border-primary bg-primary/5" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{lead.businessName}</h4>
                          <p className="text-sm text-muted-foreground">{lead.contactName}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getPriorityColor(lead.priority)}>
                            {lead.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lead.source}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{lead.scrapedAt}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(lead.status)} variant="secondary">
                            {lead.status}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            ${lead.estimatedValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Lead Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lead Details & Processing</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {selectedLead.businessName}
                  </CardTitle>
                  <CardDescription>
                    Scraped from {selectedLead.source} • {selectedLead.scrapedAt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.phone}</span>
                        <ClickToCallButton 
                          phoneNumber={selectedLead.phone} 
                          contactName={selectedLead.contactName}
                          variant="outline"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.address}</span>
                      </div>
                      {selectedLead.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{selectedLead.rating} ({selectedLead.reviewCount} reviews)</span>
                        </div>
                      )}
                      {selectedLead.growthRate && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{selectedLead.growthRate} growth</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Automated Actions Triggered</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Contact created in CRM with all scraped data
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Added to "{selectedLead.category}" campaign segment
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-yellow-500" />
                        Assigned to {selectedLead.priority === "Critical" ? "Senior Sales Rep" : "Available Rep"}
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-yellow-500" />
                        Personalized outreach sequence queued
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium">Estimated Deal Value</span>
                    <span className="text-lg font-bold text-green-600">
                      ${selectedLead.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="crm" className="space-y-6">
          {/* CRM Integration Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CRM Contact Record</CardTitle>
                <CardDescription>Automatically created from scraped data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{selectedLead.businessName}</h4>
                    <Badge variant="secondary">New Contact</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedLead.contactName}</div>
                    <div><strong>Email:</strong> {selectedLead.email}</div>
                    <div><strong>Phone:</strong> {selectedLead.phone}</div>
                    <div><strong>Company:</strong> {selectedLead.businessName}</div>
                    <div><strong>Source:</strong> {selectedLead.source} Scraping</div>
                    <div><strong>Lead Score:</strong> {selectedLead.priority === "Critical" ? "95" : selectedLead.priority === "High" ? "87" : "74"}/100</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Enriched Data Fields</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Business address and location</li>
                    <li>• Industry classification</li>
                    <li>• Quality metrics (ratings, reviews)</li>
                    <li>• Revenue/growth indicators</li>
                    <li>• Website and social presence</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Assignment</CardTitle>
                <CardDescription>Automatic segmentation and targeting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">
                      {selectedLead.category} Growth Campaign
                    </h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Personalized outreach sequence for {selectedLead.category.toLowerCase()} businesses
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Email Sequence:</span>
                      <Badge variant="outline">5 emails</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Follow-up Schedule:</span>
                      <Badge variant="outline">14 days</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Rate:</span>
                      <Badge variant="secondary">
                        {selectedLead.category === "Restaurant" ? "18.5%" : 
                         selectedLead.category === "Technology" ? "12.8%" : "21.2%"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Next Actions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span>Initial outreach: Within 2 hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span>Follow-up call: Day 3</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span>Email sequence: 14-day nurture</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Health */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Health Dashboard</CardTitle>
              <CardDescription>Real-time status of CRM data flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">99.2%</div>
                  <p className="text-sm text-muted-foreground">Sync Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">47</div>
                  <p className="text-sm text-muted-foreground">Contacts Added Today</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">8.3s</div>
                  <p className="text-sm text-muted-foreground">Average Processing Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}