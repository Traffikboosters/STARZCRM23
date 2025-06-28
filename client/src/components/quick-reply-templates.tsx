import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Copy, 
  Star, 
  Clock, 
  Target, 
  TrendingUp,
  Mail,
  MessageSquare,
  DollarSign,
  Calendar,
  Handshake,
  Heart,
  Bot,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QuickReplyTemplatesProps {
  contact: any;
}

export function QuickReplyTemplates({ contact }: QuickReplyTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('follow_up');
  const [customizedTemplate, setCustomizedTemplate] = useState('');
  const { toast } = useToast();

  const { data: quickReplyData, isLoading, refetch } = useQuery({
    queryKey: [`/api/contacts/${contact.id}/quick-replies`, selectedCategory],
    queryFn: () => apiRequest('POST', `/api/contacts/${contact.id}/quick-replies`, { 
      replyType: selectedCategory 
    }).then(res => res.json()),
    enabled: !!contact.id
  });

  const categories = [
    { id: 'follow_up', label: 'Follow Up', icon: MessageSquare, color: 'bg-blue-100 text-blue-800' },
    { id: 'objection_handling', label: 'Objection Handling', icon: Target, color: 'bg-red-100 text-red-800' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, color: 'bg-green-100 text-green-800' },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
    { id: 'closing', label: 'Closing', icon: Handshake, color: 'bg-orange-100 text-orange-800' },
    { id: 'nurturing', label: 'Nurturing', icon: Heart, color: 'bg-pink-100 text-pink-800' }
  ];

  const copyToClipboard = (text: string, templateName: string) => {
    const personalizedText = personalizeTemplate(text);
    navigator.clipboard.writeText(personalizedText).then(() => {
      toast({
        title: "Template Copied!",
        description: `${templateName} template copied to clipboard with personalization`,
      });
    });
  };

  const personalizeTemplate = (template: string) => {
    return template
      .replace(/{first_name}/g, contact.firstName || 'there')
      .replace(/{last_name}/g, contact.lastName || '')
      .replace(/{company_name}/g, contact.company || 'your business')
      .replace(/{sender_name}/g, 'Michael Thompson')
      .replace(/{specific_goal}/g, 'increase online visibility and generate more leads')
      .replace(/{pain_point}/g, 'limited online presence')
      .replace(/{relevant_service}/g, 'local SEO and Google My Business optimization')
      .replace(/{industry}/g, getContactIndustry())
      .replace(/{specific_result}/g, 'increase their online visibility by 300%')
      .replace(/{achieve_goal}/g, 'dominate your local market online');
  };

  const getContactIndustry = () => {
    if (contact.notes?.includes('HVAC')) return 'HVAC';
    if (contact.notes?.includes('Restaurant')) return 'restaurant';
    if (contact.notes?.includes('Healthcare')) return 'healthcare';
    if (contact.notes?.includes('Plumbing')) return 'plumbing';
    if (contact.notes?.includes('Electrical')) return 'electrical';
    return 'service';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffectivenessStars = (effectiveness: number) => {
    const stars = Math.round(effectiveness / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Generating AI-powered quick replies...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Smart Context-Aware Quick Reply Templates</h3>
            <p className="text-sm text-muted-foreground">
              AI-generated templates personalized for {contact.firstName} {contact.lastName}
              {contact.company && ` at ${contact.company}`}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50">
          <Lightbulb className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                setSelectedCategory(category.id);
                refetch();
              }}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs">{category.label}</span>
            </Button>
          );
        })}
      </div>

      {quickReplyData?.success && (
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            {/* Most Relevant Template */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Most Relevant Template
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(quickReplyData.data.contextualSuggestions.mostRelevant.urgency)}>
                      {quickReplyData.data.contextualSuggestions.mostRelevant.urgency} priority
                    </Badge>
                    <div className="flex">
                      {getEffectivenessStars(quickReplyData.data.contextualSuggestions.mostRelevant.effectiveness)}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Subject: {quickReplyData.data.contextualSuggestions.mostRelevant.subject}</p>
                  <div className="bg-white p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {personalizeTemplate(quickReplyData.data.contextualSuggestions.mostRelevant.template)}
                    </pre>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {quickReplyData.data.contextualSuggestions.mostRelevant.responseRate}% response rate
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Best time: {quickReplyData.data.bestSendTime}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => copyToClipboard(
                      quickReplyData.data.contextualSuggestions.mostRelevant.template,
                      'Most Relevant'
                    )}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Template
                  </Button>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Context:</strong> {quickReplyData.data.contextualSuggestions.contextReason}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Templates */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Alternative Templates
              </h4>
              
              {quickReplyData.data.contextualSuggestions.alternativeOptions.map((template: any, index: number) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{template.category.replace('_', ' ')}</Badge>
                        <div className="flex">
                          {getEffectivenessStars(template.effectiveness)}
                        </div>
                      </div>
                      <Badge className={getUrgencyColor(template.urgency)}>
                        {template.urgency}
                      </Badge>
                    </div>
                    
                    <p className="font-medium mb-2">Subject: {template.subject}</p>
                    <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                      <pre className="whitespace-pre-wrap">
                        {personalizeTemplate(template.template).substring(0, 200)}...
                      </pre>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {template.responseRate}% response rate
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(template.template, `Alternative ${index + 1}`)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personalization Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Personalization Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {quickReplyData.data.personalizationTips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Industry Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Industry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {quickReplyData.data.industryInsights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Expected Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Expected Results
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {quickReplyData.data.expectedResponseRate}%
                  </div>
                  <div className="text-sm text-green-800">Expected Response Rate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {quickReplyData.data.bestSendTime}
                  </div>
                  <div className="text-sm text-blue-800">Best Send Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {getContactIndustry()}
                  </div>
                  <div className="text-sm text-purple-800">Industry Focus</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Customize Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start with template:
                  </label>
                  <Select 
                    onValueChange={(value) => {
                      const template = quickReplyData.data.templates.find((t: any) => t.id === value);
                      if (template) {
                        setCustomizedTemplate(personalizeTemplate(template.template));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template to customize" />
                    </SelectTrigger>
                    <SelectContent>
                      {quickReplyData.data.templates.map((template: any) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Customize your message:
                  </label>
                  <Textarea
                    value={customizedTemplate}
                    onChange={(e) => setCustomizedTemplate(e.target.value)}
                    rows={12}
                    placeholder="Customize your template here..."
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => copyToClipboard(customizedTemplate, 'Customized')}
                    disabled={!customizedTemplate}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Customized Template
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const subject = "Follow up from Traffik Boosters";
                      const body = encodeURIComponent(customizedTemplate);
                      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
                    }}
                    disabled={!customizedTemplate || !contact.email}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}