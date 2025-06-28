import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Copy, 
  Clock, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  MessageSquare,
  Zap,
  Bot,
  Mail,
  Send,
  RefreshCw,
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import type { Contact } from "@shared/schema";

interface QuickReplyTemplate {
  id: string;
  category: 'follow_up' | 'objection_handling' | 'pricing' | 'scheduling' | 'closing' | 'nurturing' | 'introduction' | 'value_proposition';
  trigger: string[];
  subject: string;
  template: string;
  context: string;
  industry?: string[];
  leadStatus?: string[];
  urgency: 'low' | 'medium' | 'high';
  effectiveness: number;
  personalizable: boolean;
  responseRate: number;
  contextScore?: number;
}

interface QuickReplyResult {
  templates: QuickReplyTemplate[];
  contextualSuggestions: {
    mostRelevant: QuickReplyTemplate;
    alternativeOptions: QuickReplyTemplate[];
    contextReason: string;
  };
  personalizationTips: string[];
  bestSendTime: string;
  expectedResponseRate: number;
  industryInsights: string[];
}

interface SmartQuickRepliesProps {
  contact: Contact;
  onClose?: () => void;
}

export function SmartQuickReplies({ contact, onClose }: SmartQuickRepliesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [contextSettings, setContextSettings] = useState({
    conversationStage: 'initial_contact',
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high',
    campaignType: 'standard'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<QuickReplyTemplate | null>(null);
  const [customData, setCustomData] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch smart quick reply templates
  const { data: templatesData, isLoading, refetch } = useQuery({
    queryKey: ['smart-quick-replies', contact.id, contextSettings],
    queryFn: () => apiRequest('POST', '/api/ai/quick-reply-templates', {
      contactId: contact.id,
      context: contextSettings
    }),
  });

  // Personalize template mutation
  const personalizeTemplateMutation = useMutation({
    mutationFn: async (data: { templateId: string; customData: Record<string, string> }) => {
      return apiRequest('POST', '/api/ai/personalize-template', {
        templateId: data.templateId,
        contactId: contact.id,
        customData: data.customData
      });
    },
    onSuccess: () => {
      toast({
        title: "Template Personalized",
        description: "The template has been customized for this contact."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Personalization Failed",
        description: error.message || "Failed to personalize template",
        variant: "destructive"
      });
    }
  });

  const quickReplyResult: QuickReplyResult | null = templatesData?.data || null;

  const categoryIcons = {
    follow_up: MessageSquare,
    objection_handling: Target,
    pricing: TrendingUp,
    scheduling: Clock,
    closing: CheckCircle,
    nurturing: Lightbulb,
    introduction: Bot,
    value_proposition: Star
  };

  const urgencyColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800", 
    high: "bg-red-100 text-red-800"
  };

  const handleCopyTemplate = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`
    });
  };

  const handlePersonalizeTemplate = (template: QuickReplyTemplate) => {
    personalizeTemplateMutation.mutate({
      templateId: template.id,
      customData
    });
    setSelectedTemplate(template);
  };

  const filteredTemplates = quickReplyResult?.templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  ) || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-lg">Generating Smart Templates...</span>
        </div>
      </div>
    );
  }

  if (!quickReplyResult) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Unable to generate quick reply templates</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Context Controls */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Smart Quick Replies</h3>
            <Badge variant="secondary">AI-Powered</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {quickReplyResult.expectedResponseRate}% Expected Response Rate
            </span>
          </div>
        </div>

        {/* Context Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="conversation-stage">Conversation Stage</Label>
            <Select 
              value={contextSettings.conversationStage} 
              onValueChange={(value) => setContextSettings(prev => ({ ...prev, conversationStage: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial_contact">Initial Contact</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="objection">Handling Objection</SelectItem>
                <SelectItem value="pricing_discussion">Pricing Discussion</SelectItem>
                <SelectItem value="closing">Closing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="urgency-level">Urgency Level</Label>
            <Select 
              value={contextSettings.urgencyLevel} 
              onValueChange={(value: 'low' | 'medium' | 'high') => setContextSettings(prev => ({ ...prev, urgencyLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="campaign-type">Campaign Type</Label>
            <Select 
              value={contextSettings.campaignType} 
              onValueChange={(value) => setContextSettings(prev => ({ ...prev, campaignType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Outreach</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="seasonal">Seasonal Campaign</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="follow_up">Follow Up</TabsTrigger>
          <TabsTrigger value="objection_handling">Objections</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {/* Most Relevant Template */}
          {selectedCategory === 'all' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-orange-800">Most Relevant Template</CardTitle>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    {quickReplyResult.contextualSuggestions.mostRelevant.effectiveness}% Effectiveness
                  </Badge>
                </div>
                <CardDescription className="text-orange-700">
                  {quickReplyResult.contextualSuggestions.contextReason}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-orange-800">
                        {quickReplyResult.contextualSuggestions.mostRelevant.subject}
                      </h4>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyTemplate(quickReplyResult.contextualSuggestions.mostRelevant.subject, 'Subject')}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Subject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleCopyTemplate(quickReplyResult.contextualSuggestions.mostRelevant.template, 'Email Template')}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Copy Email
                        </Button>
                      </div>
                    </div>
                    <Textarea 
                      value={quickReplyResult.contextualSuggestions.mostRelevant.template}
                      readOnly
                      className="min-h-[200px] text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template Grid */}
          <div className="grid gap-4">
            {filteredTemplates.map((template) => {
              const CategoryIcon = categoryIcons[template.category];
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="h-4 w-4 text-orange-600" />
                        <CardTitle className="text-sm">{template.subject}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={urgencyColors[template.urgency]}>
                          {template.urgency}
                        </Badge>
                        <Badge variant="outline">
                          {template.responseRate}% Response Rate
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {template.context}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea 
                      value={template.template}
                      readOnly
                      className="min-h-[120px] text-xs"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.category.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Effectiveness: {template.effectiveness}%
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyTemplate(template.subject, 'Subject')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleCopyTemplate(template.template, 'Template')}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>AI Insights & Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              Best Send Time
            </h4>
            <p className="text-sm text-gray-600">{quickReplyResult.bestSendTime}</p>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Target className="h-4 w-4 mr-2 text-green-600" />
              Personalization Tips
            </h4>
            <ul className="space-y-1">
              {quickReplyResult.personalizationTips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
              Industry Insights
            </h4>
            <ul className="space-y-1">
              {quickReplyResult.industryInsights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}