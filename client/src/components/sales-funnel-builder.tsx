import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter, 
  Target, 
  Users, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Settings,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  Wrench,
  Home,
  Droplets,
  Zap,
  Wind,
  Hammer,
  Paintbrush
} from "lucide-react";
import React from "react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

// Industry-specific funnel templates for service businesses
const serviceFunnelTemplates = [
  {
    id: 'hvac',
    name: 'HVAC Services',
    icon: Wind,
    color: '#3b82f6',
    description: 'Complete funnel for heating, ventilation, and air conditioning services',
    avgDealSize: 4500,
    conversionRate: 18,
    leadSources: ['Google Ads', 'Facebook Ads', 'Referrals', 'Website', 'Emergency Calls'],
    stages: [
      { name: 'Lead Capture', description: 'Emergency service forms, quote requests', conversion: 100 },
      { name: 'Initial Contact', description: 'Same-day response, phone qualification', conversion: 85 },
      { name: 'Service Assessment', description: 'On-site evaluation, diagnostic', conversion: 70 },
      { name: 'Quote Presentation', description: 'Detailed proposal with options', conversion: 45 },
      { name: 'Service Delivery', description: 'Installation or repair completion', conversion: 18 }
    ],
    automations: [
      'Emergency response within 2 hours',
      'Follow-up maintenance reminders',
      'Seasonal service campaigns',
      'Warranty and service agreement renewals'
    ]
  },
  {
    id: 'plumbing',
    name: 'Plumbing Services',
    icon: Droplets,
    color: '#06b6d4',
    description: 'Emergency and residential plumbing service funnel',
    avgDealSize: 650,
    conversionRate: 25,
    leadSources: ['Emergency Calls', 'Google Local', 'Nextdoor', 'Referrals', 'Home Shows'],
    stages: [
      { name: 'Emergency Intake', description: 'Urgent call handling, triage', conversion: 100 },
      { name: 'Rapid Response', description: '1-hour response commitment', conversion: 90 },
      { name: 'Problem Diagnosis', description: 'On-site assessment and quote', conversion: 80 },
      { name: 'Service Authorization', description: 'Approval and scheduling', conversion: 65 },
      { name: 'Completion & Payment', description: 'Work completion and follow-up', conversion: 25 }
    ],
    automations: [
      'Emergency dispatch system',
      'Appointment confirmations and reminders',
      'Post-service satisfaction surveys',
      'Annual maintenance check offers'
    ]
  },
  {
    id: 'carpet_cleaning',
    name: 'Carpet Cleaning',
    icon: Home,
    color: '#8b5cf6',
    description: 'Residential and commercial carpet cleaning funnel',
    avgDealSize: 280,
    conversionRate: 35,
    leadSources: ['Online Booking', 'Facebook Ads', 'Door Hangers', 'Groupon', 'Referrals'],
    stages: [
      { name: 'Online Booking', description: 'Instant quote calculator, scheduling', conversion: 100 },
      { name: 'Booking Confirmation', description: 'Service details and preparation', conversion: 85 },
      { name: 'Pre-Service Contact', description: '24-hour confirmation call', conversion: 80 },
      { name: 'Service Delivery', description: 'Professional cleaning service', conversion: 75 },
      { name: 'Upsell & Rebooking', description: 'Additional services, maintenance plan', conversion: 35 }
    ],
    automations: [
      'Instant online quotes and booking',
      'Service preparation instructions',
      'Post-cleaning care tips',
      'Quarterly cleaning reminders'
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical Services',
    icon: Zap,
    color: '#f59e0b',
    description: 'Residential and commercial electrical work funnel',
    avgDealSize: 850,
    conversionRate: 22,
    leadSources: ['Google Ads', 'Angie\'s List', 'Referrals', 'Emergency Calls', 'Home Depot'],
    stages: [
      { name: 'Service Request', description: 'Safety-focused intake, urgency assessment', conversion: 100 },
      { name: 'Safety Consultation', description: 'Phone screening, safety protocols', conversion: 88 },
      { name: 'On-Site Evaluation', description: 'Electrical inspection and quote', conversion: 75 },
      { name: 'Work Authorization', description: 'Permit handling, scheduling', conversion: 55 },
      { name: 'Project Completion', description: 'Installation, testing, certification', conversion: 22 }
    ],
    automations: [
      'Safety compliance checklists',
      'Permit status updates',
      'Electrical safety tips and reminders',
      'Annual safety inspection offers'
    ]
  },
  {
    id: 'handyman',
    name: 'Handyman Services',
    icon: Hammer,
    color: '#dc2626',
    description: 'General home repair and maintenance funnel',
    avgDealSize: 320,
    conversionRate: 42,
    leadSources: ['TaskRabbit', 'Thumbtack', 'Facebook', 'Neighborhood Apps', 'Word of Mouth'],
    stages: [
      { name: 'Project Inquiry', description: 'Multi-service intake form', conversion: 100 },
      { name: 'Scope Discussion', description: 'Phone consultation, photo review', conversion: 78 },
      { name: 'In-Person Estimate', description: 'Detailed assessment and quote', conversion: 65 },
      { name: 'Job Scheduling', description: 'Timeline and material coordination', conversion: 55 },
      { name: 'Project Delivery', description: 'Quality completion and follow-up', conversion: 42 }
    ],
    automations: [
      'Photo-based pre-screening',
      'Material sourcing coordination',
      'Progress update communications',
      'Seasonal maintenance reminders'
    ]
  },
  {
    id: 'painting',
    name: 'Painting Services',
    icon: Paintbrush,
    color: '#059669',
    description: 'Interior and exterior painting contractor funnel',
    avgDealSize: 2800,
    conversionRate: 28,
    leadSources: ['Google Ads', 'Home Advisor', 'Referrals', 'Seasonal Campaigns', 'Social Media'],
    stages: [
      { name: 'Color Consultation', description: 'Visual estimate request, style consultation', conversion: 100 },
      { name: 'In-Home Estimate', description: 'Detailed measurement and material selection', conversion: 82 },
      { name: 'Proposal Review', description: 'Contract terms, timeline, color samples', conversion: 68 },
      { name: 'Project Start', description: 'Preparation, protection, and painting', conversion: 45 },
      { name: 'Final Walkthrough', description: 'Quality check, warranty, maintenance tips', conversion: 28 }
    ],
    automations: [
      'Color trend newsletters',
      'Weather-based scheduling adjustments',
      'Paint warranty and care instructions',
      'Annual touch-up service offers'
    ]
  }
];

// Funnel stage templates with industry-specific messaging
const stageTemplates = [
  {
    name: 'Lead Capture',
    description: 'Capture high-intent prospects',
    methods: ['Landing Pages', 'Contact Forms', 'Quote Calculators', 'Emergency Hotlines'],
    kpis: ['Conversion Rate', 'Cost Per Lead', 'Lead Quality Score']
  },
  {
    name: 'Qualification',
    description: 'Qualify and prioritize leads',
    methods: ['Phone Screening', 'Online Qualification', 'Urgency Assessment', 'Budget Confirmation'],
    kpis: ['Qualification Rate', 'Time to Contact', 'Lead Score Distribution']
  },
  {
    name: 'Consultation',
    description: 'Provide expert consultation',
    methods: ['On-Site Visits', 'Virtual Consultations', 'Photo Assessments', 'Problem Diagnosis'],
    kpis: ['Show Rate', 'Consultation to Quote Rate', 'Average Consultation Time']
  },
  {
    name: 'Proposal',
    description: 'Present compelling proposals',
    methods: ['Written Estimates', 'Service Options', 'Financing Options', 'Warranty Information'],
    kpis: ['Proposal Acceptance Rate', 'Average Deal Size', 'Time to Decision']
  },
  {
    name: 'Conversion',
    description: 'Close and deliver services',
    methods: ['Contract Signing', 'Service Scheduling', 'Work Completion', 'Quality Assurance'],
    kpis: ['Close Rate', 'Revenue Per Customer', 'Customer Satisfaction']
  },
  {
    name: 'Retention',
    description: 'Retain and grow customers',
    methods: ['Maintenance Plans', 'Follow-up Services', 'Referral Programs', 'Seasonal Campaigns'],
    kpis: ['Customer Lifetime Value', 'Repeat Business Rate', 'Referral Rate']
  }
];

export default function SalesFunnelBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof serviceFunnelTemplates[0] | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Calculate funnel metrics
  const calculateFunnelMetrics = (template: typeof serviceFunnelTemplates[0]) => {
    const totalLeads = 1000; // Example monthly leads
    const stages = template.stages.map((stage, index) => ({
      ...stage,
      leads: Math.round(totalLeads * (stage.conversion / 100)),
      dropOff: index > 0 ? Math.round(totalLeads * ((template.stages[index - 1].conversion - stage.conversion) / 100)) : 0
    }));
    
    return {
      ...template,
      stages,
      monthlyRevenue: Math.round((totalLeads * (template.conversionRate / 100)) * template.avgDealSize),
      totalLeads
    };
  };

  const getIndustryIcon = (industryId: string) => {
    const template = serviceFunnelTemplates.find(t => t.id === industryId);
    return template ? template.icon : Wrench;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="w-16 h-16 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-black">Service Business Sales Funnels</h1>
            <p className="text-gray-600">More Traffik! More Sales!</p>
          </div>
        </div>
        <Button 
          className="bg-[#e45c2b] hover:bg-[#d14a21] text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Funnel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Industry Templates</TabsTrigger>
          <TabsTrigger value="builder">Funnel Builder</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation Sequences</TabsTrigger>
        </TabsList>

        {/* Industry Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceFunnelTemplates.map((template) => {
              const IconComponent = template.icon;
              const metrics = calculateFunnelMetrics(template);
              
              return (
                <Card 
                  key={template.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#e45c2b]"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${template.color}20`, color: template.color }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.conversionRate}% conversion
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{template.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Avg Deal Size</p>
                        <p className="text-[#e45c2b] font-semibold">${template.avgDealSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Monthly Revenue</p>
                        <p className="text-green-600 font-semibold">${metrics.monthlyRevenue.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Funnel Stages ({template.stages.length})</p>
                      <div className="flex gap-1">
                        {template.stages.map((stage, index) => (
                          <div 
                            key={index}
                            className={`flex-1 h-2 rounded`}
                            style={{ 
                              backgroundColor: template.color,
                              opacity: 1 - (index * 0.15)
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>100% → {template.conversionRate}%</span>
                        <span>{template.stages.length} stages</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {template.leadSources.length} lead sources
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            Customize
                          </Button>
                          <Button size="sm" className="bg-[#e45c2b] hover:bg-[#d14a21] text-white">
                            <Play className="w-3 h-3 mr-1" />
                            Launch
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Custom Funnel Templates */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Plus className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Custom Service Funnel</h3>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                Build a personalized funnel for your specific service business with custom stages, automations, and messaging.
              </p>
              <Button 
                className="bg-[#e45c2b] hover:bg-[#d14a21] text-white"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Start Custom Builder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Builder */}
        <TabsContent value="builder" className="space-y-6">
          {selectedTemplate ? (
            <div className="space-y-6">
              {/* Template Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${selectedTemplate.color}20`, color: selectedTemplate.color }}
                      >
                        {React.createElement(selectedTemplate.icon, { className: "w-8 h-8" })}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{selectedTemplate.name} Funnel</CardTitle>
                        <CardDescription>{selectedTemplate.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button className="bg-[#e45c2b] hover:bg-[#d14a21] text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Activate Funnel
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Funnel Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle>Funnel Flow Visualization</CardTitle>
                  <CardDescription>
                    Interactive funnel stages with conversion rates and optimization opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTemplate.stages.map((stage, index) => {
                      const metrics = calculateFunnelMetrics(selectedTemplate);
                      const stageData = metrics.stages[index];
                      const isLast = index === selectedTemplate.stages.length - 1;
                      
                      return (
                        <div key={index} className="relative">
                          <div 
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              selectedStage === stage.name 
                                ? 'border-[#e45c2b] bg-orange-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedStage(selectedStage === stage.name ? null : stage.name)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e45c2b] text-white font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg">{stage.name}</h4>
                                  <p className="text-gray-600 text-sm">{stage.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-[#e45c2b]">
                                  {stageData.leads.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {stage.conversion}% conversion
                                </div>
                                {stageData.dropOff > 0 && (
                                  <div className="text-xs text-red-600">
                                    -{stageData.dropOff} drop-off
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {selectedStage === stage.name && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h5 className="font-medium mb-2">Optimization Tips</h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      <li>• A/B test messaging variations</li>
                                      <li>• Reduce friction in process</li>
                                      <li>• Improve response times</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="font-medium mb-2">Automation Rules</h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      <li>• Auto-assign to team members</li>
                                      <li>• Send follow-up sequences</li>
                                      <li>• Schedule reminders</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="font-medium mb-2">Key Metrics</h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Time in Stage:</span>
                                        <span className="font-medium">2.3 days avg</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Success Rate:</span>
                                        <span className="font-medium text-green-600">{stage.conversion}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {!isLast && (
                            <div className="flex justify-center py-2">
                              <ArrowRight className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Stage Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Sources Configuration</CardTitle>
                    <CardDescription>Optimize lead generation channels for maximum ROI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTemplate.leadSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#e45c2b]" />
                            <span className="font-medium">{source}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Active</Badge>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Automation Sequences</CardTitle>
                    <CardDescription>Automated workflows to nurture and convert leads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTemplate.automations.map((automation, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm">{automation}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a Template to Start Building</h3>
              <p className="text-gray-600 mb-4">Choose an industry template from the Templates tab to begin customizing your sales funnel.</p>
              <Button 
                variant="outline"
                onClick={() => setActiveTab("templates")}
              >
                Browse Templates
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Performance Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-[#e45c2b]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Funnels</p>
                    <p className="text-2xl font-bold text-gray-900">6</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Leads</p>
                    <p className="text-2xl font-bold text-gray-900">2,847</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
                    <p className="text-2xl font-bold text-gray-900">28.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$186K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Performance Comparison</CardTitle>
              <CardDescription>Compare conversion rates and revenue across service industries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceFunnelTemplates.map((template) => {
                  const IconComponent = template.icon;
                  const metrics = calculateFunnelMetrics(template);
                  
                  return (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${template.color}20`, color: template.color }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.stages.length} stages</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Conversion Rate</p>
                          <p className="font-semibold text-lg">{template.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Deal Size</p>
                          <p className="font-semibold text-lg">${template.avgDealSize.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monthly Revenue</p>
                          <p className="font-semibold text-lg text-green-600">${metrics.monthlyRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Sequences */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stageTemplates.map((stage, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#e45c2b] text-white flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    {stage.name}
                  </CardTitle>
                  <CardDescription>{stage.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Automation Methods</h5>
                      <div className="space-y-2">
                        {stage.methods.map((method, methodIndex) => (
                          <div key={methodIndex} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Key Performance Indicators</h5>
                      <div className="flex flex-wrap gap-2">
                        {stage.kpis.map((kpi, kpiIndex) => (
                          <Badge key={kpiIndex} variant="secondary" className="text-xs">
                            {kpi}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Custom Funnel Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Custom Service Funnel</DialogTitle>
            <DialogDescription>
              Build a personalized sales funnel tailored to your specific service business needs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Business Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hvac">HVAC Services</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="cleaning">Cleaning Services</SelectItem>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                    <SelectItem value="roofing">Roofing</SelectItem>
                    <SelectItem value="custom">Custom Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Average Deal Size</label>
                <Input type="number" placeholder="$1,500" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Funnel Name</label>
              <Input placeholder="e.g., Emergency HVAC Repair Funnel" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Service Description</label>
              <Textarea placeholder="Describe your service offering and target customers..." />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-[#e45c2b] hover:bg-[#d14a21] text-white">
                Create Funnel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}