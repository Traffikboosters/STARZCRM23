import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Clock, Target, TrendingUp, MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Contact } from "@shared/schema";

interface QuickReplyTemplate {
  id: string;
  category: 'follow_up' | 'objection_handling' | 'pricing' | 'scheduling' | 'closing' | 'nurturing';
  trigger: string;
  subject: string;
  template: string;
  context: string;
  industry?: string[];
  leadStatus?: string[];
  urgency: 'low' | 'medium' | 'high';
  effectiveness: number;
  personalizable: boolean;
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
}

interface QuickReplyTemplatesProps {
  contact: Contact;
}

export function QuickReplyTemplates({ contact }: QuickReplyTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("follow_up");
  const [quickReplyData, setQuickReplyData] = useState<QuickReplyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categoryIcons = {
    follow_up: MessageSquare,
    objection_handling: Target,
    pricing: TrendingUp,
    scheduling: Clock,
    closing: Star,
    nurturing: MessageSquare
  };

  const categoryLabels = {
    follow_up: "Follow Up",
    objection_handling: "Objection Handling",
    pricing: "Pricing Discussion",
    scheduling: "Scheduling",
    closing: "Closing",
    nurturing: "Nurturing"
  };

  const urgencyColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };

  const generateQuickReplies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts/${contact.id}/quick-replies?type=${selectedCategory}`);
      const data = await response.json();
      setQuickReplyData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quick reply templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const IconComponent = categoryIcons[selectedCategory as keyof typeof categoryIcons] || MessageSquare;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Reply Templates</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered context-aware email templates for {contact.firstName} {contact.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex items-center space-x-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select reply type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => {
              const Icon = categoryIcons[value as keyof typeof categoryIcons];
              return (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Button 
          onClick={generateQuickReplies}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <IconComponent className="h-4 w-4" />
          <span>{loading ? "Generating..." : "Generate Templates"}</span>
        </Button>
      </div>

      {/* Quick Reply Results */}
      {quickReplyData && (
        <div className="space-y-6">
          {/* Context Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>AI Context Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Send Time</p>
                  <p className="text-sm">{quickReplyData.bestSendTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected Response Rate</p>
                  <p className="text-sm">{Math.round(quickReplyData.expectedResponseRate * 100)}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Context Reason</p>
                <p className="text-sm">{quickReplyData.contextualSuggestions.contextReason}</p>
              </div>
            </CardContent>
          </Card>

          {/* Most Relevant Template */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Most Relevant Template</span>
                </div>
                <Badge className={urgencyColors[quickReplyData.contextualSuggestions.mostRelevant.urgency]}>
                  {quickReplyData.contextualSuggestions.mostRelevant.urgency} priority
                </Badge>
              </CardTitle>
              <CardDescription>
                {quickReplyData.contextualSuggestions.mostRelevant.context}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Subject Line</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(quickReplyData.contextualSuggestions.mostRelevant.subject, "Subject")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{quickReplyData.contextualSuggestions.mostRelevant.subject}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Email Template</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(quickReplyData.contextualSuggestions.mostRelevant.template, "Template")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={quickReplyData.contextualSuggestions.mostRelevant.template}
                  readOnly
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Effectiveness: {Math.round(quickReplyData.contextualSuggestions.mostRelevant.effectiveness * 100)}%</span>
                <span>Category: {categoryLabels[quickReplyData.contextualSuggestions.mostRelevant.category]}</span>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Templates */}
          <div>
            <h4 className="text-md font-semibold mb-4">Alternative Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickReplyData.contextualSuggestions.alternativeOptions.map((template, index) => (
                <Card key={template.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {categoryLabels[template.category]}
                      </CardTitle>
                      <Badge className={urgencyColors[template.urgency]} variant="outline">
                        {template.urgency}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {template.context}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                      <p className="text-xs bg-muted p-2 rounded">{template.subject}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Template Preview</p>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {template.template.substring(0, 100)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(template.effectiveness * 100)}% effective
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(template.template, "Template")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Personalization Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Personalization Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {quickReplyData.personalizationTips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!quickReplyData && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generate Smart Reply Templates</h3>
            <p className="text-muted-foreground mb-4">
              Select a reply category and generate AI-powered templates personalized for this contact
            </p>
            <Button onClick={generateQuickReplies} disabled={loading}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}