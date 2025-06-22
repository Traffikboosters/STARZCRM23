import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle, Clock, Play, Database, Target, Mail, DollarSign } from "lucide-react";

const workflowSteps = [
  {
    id: 1,
    title: "Data Scraping",
    description: "Automatically collect high-quality leads from multiple sources",
    icon: Database,
    status: "completed",
    details: [
      "Inc 5000 companies scraped: 45 leads",
      "Yelp restaurants identified: 78 prospects", 
      "LinkedIn B2B contacts: 32 qualified leads",
      "Quality score: 87% average"
    ],
    metrics: { leads: 155, quality: 87, timeframe: "This week" }
  },
  {
    id: 2,
    title: "Lead Qualification", 
    description: "AI-powered filtering and scoring of scraped prospects",
    icon: Target,
    status: "completed",
    details: [
      "High-rated restaurants (4+ stars): 67 leads",
      "Fast-growing companies (50%+ growth): 28 leads",
      "Revenue potential scored and ranked",
      "Contact verification completed"
    ],
    metrics: { qualified: 95, score: 92, conversion: "61%" }
  },
  {
    id: 3,
    title: "Campaign Assignment",
    description: "Automated lead distribution and campaign targeting",
    icon: Mail,
    status: "active",
    details: [
      "Restaurant SEO campaign: 35 leads assigned",
      "B2B growth strategy: 28 leads targeted",
      "Local business outreach: 32 leads active",
      "Personalized messaging deployed"
    ],
    metrics: { campaigns: 3, assigned: 95, response: "23%" }
  },
  {
    id: 4,
    title: "Revenue Generation",
    description: "Closed deals and recurring revenue from automated pipeline",
    icon: DollarSign,
    status: "ongoing",
    details: [
      "Bella Vista Restaurant: $4,500 (Local SEO)",
      "TechFlow Solutions: $12,000 (Growth Marketing)",
      "Metro Bistro: $3,200 (Social Media)",
      "DataSync Corp: $18,500 (Enterprise SEO)"
    ],
    metrics: { revenue: 105600, deals: 12, roi: "618%" }
  }
];

export default function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const playDemo = () => {
    setIsPlaying(true);
    setActiveStep(1);
    
    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setIsPlaying(false);
          return 4;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < activeStep) return "completed";
    if (stepId === activeStep) return "active";
    return "pending";
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Complete Lead Generation Workflow</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Watch how our automated system transforms raw data into revenue through intelligent scraping, 
          qualification, campaign management, and conversion tracking.
        </p>
        <Button onClick={playDemo} disabled={isPlaying} className="px-8">
          <Play className="w-4 h-4 mr-2" />
          {isPlaying ? "Demo Running..." : "Start Workflow Demo"}
        </Button>
      </div>

      {/* Progress Timeline */}
      <div className="relative">
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(step.id);
            
            return (
              <Card 
                key={step.id}
                className={`relative cursor-pointer transition-all duration-300 ${
                  status === "active" ? "ring-2 ring-primary shadow-lg scale-105" : ""
                } ${status === "completed" ? "bg-green-50 border-green-200" : ""}`}
                onClick={() => setActiveStep(step.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      status === "completed" ? "bg-green-100 text-green-600" :
                      status === "active" ? "bg-primary text-primary-foreground animate-pulse" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {status === "completed" ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : status === "active" ? (
                        <Clock className="w-8 h-8" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>
                    <Badge 
                      className="absolute -top-1 -right-1"
                      variant={status === "completed" ? "default" : status === "active" ? "secondary" : "outline"}
                    >
                      {step.id}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="text-sm">{step.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Key Metrics */}
                  <div className="space-y-2 mb-4">
                    {step.id === 1 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Leads</span>
                          <span className="font-semibold">{step.metrics.leads}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Quality Score</span>
                          <span className="font-semibold">{step.metrics.quality}%</span>
                        </div>
                      </>
                    )}
                    
                    {step.id === 2 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Qualified</span>
                          <span className="font-semibold">{step.metrics.qualified}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Score</span>
                          <span className="font-semibold">{step.metrics.score}%</span>
                        </div>
                      </>
                    )}
                    
                    {step.id === 3 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Campaigns</span>
                          <span className="font-semibold">{step.metrics.campaigns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Response Rate</span>
                          <span className="font-semibold">{step.metrics.response}</span>
                        </div>
                      </>
                    )}
                    
                    {step.id === 4 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-semibold text-green-600">
                            ${step.metrics.revenue?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">ROI</span>
                          <span className="font-semibold text-green-600">{step.metrics.roi}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Step Details */}
                  {activeStep === step.id && (
                    <div className="space-y-2 border-t pt-3">
                      <h4 className="font-medium text-sm">Recent Activity:</h4>
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                {/* Arrow connector */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-3 z-10">
                    <div className="w-6 h-6 bg-white border rounded-full flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Monthly Performance Summary
          </CardTitle>
          <CardDescription>
            Complete automation delivers consistent results with minimal manual intervention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,247</div>
              <div className="text-sm text-muted-foreground">Leads Scraped</div>
              <Progress value={78} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">892</div>
              <div className="text-sm text-muted-foreground">Qualified (71.5%)</div>
              <Progress value={71} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-sm text-muted-foreground">Conversions (9.98%)</div>
              <Progress value={10} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$105,600</div>
              <div className="text-sm text-muted-foreground">Revenue (618% ROI)</div>
              <Progress value={95} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}