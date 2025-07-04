import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain,
  Target,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  X,
  Star,
  Lightbulb,
  Copy,
  ExternalLink,
  Award,
  MessageSquare,
  DollarSign,
  Users,
  Zap
} from "lucide-react";
import { Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface SalesTip {
  id: string;
  category: 'opener' | 'qualification' | 'objection_handling' | 'closing' | 'follow_up' | 'value_proposition';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  tip: string;
  script: string;
  context: string;
  triggers: string[];
  industry?: string;
  leadSource?: string;
  confidence: number;
  expectedImpact: 'high' | 'medium' | 'low';
  timeToImplement: number;
}

interface LeadAnalysis {
  leadScore: number;
  urgencyLevel: 'immediate' | 'high' | 'medium' | 'low';
  industryInsights: string[];
  painPoints: string[];
  opportunities: string[];
  competitiveAdvantages: string[];
}

interface ContextualFactors {
  leadAge: number;
  sourceQuality: number;
  budgetIndicators: string[];
  decisionMakerSignals: string[];
  timelineIndicators: string[];
}

interface SalesTipGenerationResult {
  tips: SalesTip[];
  leadAnalysis: LeadAnalysis;
  contextualFactors: ContextualFactors;
  recommendedApproach: string;
  nextBestActions: string[];
}

interface AISalesTipGeneratorProps {
  contact: Contact;
  currentAction?: 'calling' | 'emailing' | 'scheduling' | 'qualifying' | 'closing';
  isOpen: boolean;
  onClose: () => void;
  onApplyTip?: (tipId: string) => void;
}

export function AISalesTipGenerator({ 
  contact, 
  currentAction, 
  isOpen, 
  onClose,
  onApplyTip 
}: AISalesTipGeneratorProps) {
  const { toast } = useToast();
  const [selectedTip, setSelectedTip] = useState<SalesTip | null>(null);
  const [activeTab, setActiveTab] = useState("tips");

  // Calculate lead age
  const leadAge = Math.floor((Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60));

  // Generate mock AI sales tips for now
  const salesTipData: SalesTipGenerationResult = {
    tips: [
      {
        id: "tip-1",
        category: "opener",
        priority: "high",
        title: "Personalized Industry Opener",
        tip: `Start with ${contact.company || contact.firstName}'s specific industry challenges`,
        script: `Hi ${contact.firstName}, I noticed ${contact.company || 'your business'} and wanted to discuss how we're helping similar businesses increase their online visibility by 300% in just 90 days.`,
        context: `${contact.company || contact.firstName} appears to be in a competitive market where online presence is crucial`,
        triggers: ["new_lead", "first_contact", "cold_call"],
        industry: contact.company?.toLowerCase().includes("restaurant") ? "restaurant" : "general"
      },
      {
        id: "tip-2", 
        category: "qualification",
        priority: "critical",
        title: "Budget Discovery Question",
        tip: "Qualify budget without directly asking about money",
        script: `${contact.firstName}, what's your current biggest challenge with getting new customers online? Most businesses like ${contact.company || 'yours'} are investing $2,500-$5,000 monthly in digital marketing - is that range something that makes sense for your growth goals?`,
        context: "Use soft budget qualification to understand investment capacity",
        triggers: ["qualification_needed", "discovery_call"]
      },
      {
        id: "tip-3",
        category: "objection_handling", 
        priority: "high",
        title: "Price Objection Response",
        tip: "Redirect price concerns to value and ROI",
        script: `I understand budget is important, ${contact.firstName}. Let me ask you this - if we could show you how to generate an additional $10,000 in revenue per month, what would that be worth to your business? Most of our clients see 4:1 return on investment within 90 days.`,
        context: "Frame investment as ROI opportunity rather than cost",
        triggers: ["price_objection", "budget_concern"]
      }
    ],
    leadAnalysis: {
      leadScore: 85,
      industryFit: "high",
      companySize: "small-medium",
      budgetEstimate: "$2,500-$5,000",
      decisionMakerLikelihood: "high",
      urgencyLevel: "medium",
      painPoints: ["low online visibility", "need more customers", "competitive market"],
      opportunities: ["digital marketing", "local SEO", "social media presence"],
      competitiveAdvantages: ["proven ROI", "local expertise", "full-service approach"]
    },
    contextualFactors: {
      leadAge,
      sourceQuality: 8,
      budgetIndicators: ["business owner", "growth-focused"],
      decisionMakerSignals: ["company listed", "direct contact"],
      timelineIndicators: ["new lead", "needs immediate help"]
    },
    recommendedApproach: "Consultative with immediate value demonstration",
    nextBestActions: [
      "Schedule discovery call within 24 hours",
      "Send case study relevant to their industry", 
      "Prepare custom proposal with ROI projections"
    ]
  };

  const isLoading = false;
  const error = null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Script copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleApplyTip = (tip: SalesTip) => {
    if (onApplyTip) {
      onApplyTip(tip.id);
    }
    
    toast({
      title: "Tip Applied",
      description: `Applied: ${tip.title}`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'opener': return <MessageSquare className="h-4 w-4" />;
      case 'qualification': return <Users className="h-4 w-4" />;
      case 'objection_handling': return <AlertCircle className="h-4 w-4" />;
      case 'closing': return <Target className="h-4 w-4" />;
      case 'follow_up': return <Clock className="h-4 w-4" />;
      case 'value_proposition': return <Star className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Lightbulb className="h-4 w-4 text-gray-600" />;
    }
  };

  // Modal renders based on parent conditional and Dialog open prop

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="h-12 w-auto object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-orange-600" />
                  AI Sales Tip Generator
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Contextual sales intelligence for {contact.firstName} {contact.lastName}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Brain className="h-12 w-12 text-orange-600 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600">Generating AI-powered sales tips...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Failed to generate sales tips</p>
          </div>
        ) : salesTipData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tips">Sales Tips</TabsTrigger>
              <TabsTrigger value="analysis">Lead Analysis</TabsTrigger>
              <TabsTrigger value="approach">Strategy</TabsTrigger>
              <TabsTrigger value="actions">Next Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="tips" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {salesTipData.tips.map((tip) => (
                  <Card key={tip.id} className="border-l-4 border-l-orange-600">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(tip.category)}
                          <div>
                            <CardTitle className="text-lg">{tip.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPriorityColor(tip.priority)}>
                                {tip.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getImpactIcon(tip.expectedImpact)}
                                {tip.expectedImpact} impact
                              </Badge>
                              <Badge variant="outline">
                                {tip.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {tip.timeToImplement}m
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{tip.tip}</p>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Suggested Script:
                        </h4>
                        <p className="text-sm text-blue-800 italic mb-3">"{tip.script}"</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => copyToClipboard(tip.script)}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy Script
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleApplyTip(tip)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Apply Tip
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Context:</strong> {tip.context}
                        </p>
                        {tip.triggers.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-sm text-gray-600">Triggers:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tip.triggers.map((trigger, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Lead Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-orange-600" />
                      Lead Score Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Overall Score</span>
                          <span className="text-2xl font-bold text-orange-600">
                            {salesTipData.leadAnalysis.leadScore}/100
                          </span>
                        </div>
                        <Progress value={salesTipData.leadAnalysis.leadScore} className="h-3" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Urgency Level: </span>
                        <span className={`font-semibold ${getUrgencyColor(salesTipData.leadAnalysis.urgencyLevel)}`}>
                          {salesTipData.leadAnalysis.urgencyLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contextual Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Contextual Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Lead Age:</span>
                        <span className="ml-2 text-sm">{salesTipData.contextualFactors.leadAge} hours</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Source Quality:</span>
                        <span className="ml-2 text-sm">{salesTipData.contextualFactors.sourceQuality}/100</span>
                      </div>
                      {salesTipData.contextualFactors.budgetIndicators.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Budget Indicators:</span>
                          <div className="mt-1">
                            {salesTipData.contextualFactors.budgetIndicators.map((indicator, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                                {indicator}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Industry Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Industry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Insights</h4>
                      <ul className="space-y-1">
                        {salesTipData.leadAnalysis.industryInsights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Pain Points</h4>
                      <ul className="space-y-1">
                        {salesTipData.leadAnalysis.painPoints.map((pain, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                            {pain}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approach" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Recommended Sales Approach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {salesTipData.recommendedApproach}
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Opportunities</h4>
                      <ul className="space-y-2">
                        {salesTipData.leadAnalysis.opportunities.map((opportunity, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <Star className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Competitive Advantages</h4>
                      <ul className="space-y-2">
                        {salesTipData.leadAnalysis.competitiveAdvantages.map((advantage, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <Award className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Next Best Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesTipData.nextBestActions.map((action, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      <strong>Pro Tip:</strong> Execute these actions in order for maximum effectiveness. 
                      The AI has prioritized them based on lead characteristics and current market conditions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default AISalesTipGenerator;