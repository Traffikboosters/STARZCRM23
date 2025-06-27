import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  MessageSquare, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertCircle,
  Copy,
  Phone,
  Lightbulb,
  Users,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationSuggestion {
  id: string;
  type: 'industry_insight' | 'pain_point' | 'success_story' | 'trend_analysis' | 'value_proposition' | 'local_focus';
  title: string;
  opener: string;
  followUp: string[];
  context: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  businessRelevance: number;
}

interface ConversationStarterResult {
  suggestions: ConversationSuggestion[];
  leadContext: {
    industry: string;
    businessSize: string;
    location: string;
    painPoints: string[];
    opportunities: string[];
  };
  recommendedApproach: string;
  bestTimeToCall: string;
  keyTalkingPoints: string[];
}

interface ConversationStartersProps {
  contactId: number;
  contactName: string;
}

const typeIcons = {
  industry_insight: TrendingUp,
  pain_point: AlertCircle,
  success_story: Target,
  trend_analysis: Brain,
  value_proposition: Lightbulb,
  local_focus: MapPin
};

const urgencyColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-red-100 text-red-800"
};

export default function ConversationStarters({ contactId, contactName }: ConversationStartersProps) {
  const { toast } = useToast();
  const [selectedSuggestion, setSelectedSuggestion] = useState<ConversationSuggestion | null>(null);

  const { data: conversationData, isLoading, error } = useQuery<ConversationStarterResult>({
    queryKey: [`/api/contacts/${contactId}/conversation-starters`],
    enabled: !!contactId
  });

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} copied successfully`,
    });
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Conversation Starters
          </CardTitle>
          <CardDescription>Loading intelligent conversation suggestions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Loading Suggestions
          </CardTitle>
          <CardDescription>Unable to generate conversation starters at this time.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!conversationData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Conversation Starters for {contactName}
          </CardTitle>
          <CardDescription>
            Smart conversation suggestions based on lead context and industry insights
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Lead Context Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            Lead Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600">Industry</div>
              <div className="text-sm">{conversationData.leadContext.industry}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Business Size</div>
              <div className="text-sm">{conversationData.leadContext.businessSize}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Location</div>
              <div className="text-sm">{conversationData.leadContext.location}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Key Pain Points</div>
              <div className="space-y-1">
                {conversationData.leadContext.painPoints.map((point, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Opportunities</div>
              <div className="space-y-1">
                {conversationData.leadContext.opportunities.map((opportunity, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                    {opportunity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Best Time to Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{conversationData.bestTimeToCall}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Recommended Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{conversationData.recommendedApproach}</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation Suggestions
          </CardTitle>
          <CardDescription>
            AI-generated openers ranked by relevance and confidence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversationData.suggestions.map((suggestion, index) => {
            const IconComponent = typeIcons[suggestion.type];
            return (
              <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={urgencyColors[suggestion.urgency]}>
                        {suggestion.urgency.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {formatConfidence(suggestion.confidence)} confident
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {suggestion.context}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Opening Line */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-gray-600">Opening Line</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion.opener, "Opening line")}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      "{suggestion.opener}"
                    </div>
                  </div>

                  {/* Follow-up Lines */}
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">Follow-up Options</div>
                    <div className="space-y-2">
                      {suggestion.followUp.map((followUp, followUpIndex) => (
                        <div key={followUpIndex} className="flex items-start gap-2">
                          <div className="bg-blue-50 p-2 rounded text-xs flex-1">
                            "{followUp}"
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(followUp, "Follow-up")}
                            className="h-6 px-2 mt-1"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSuggestion(suggestion)}
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Use This Approach
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${suggestion.opener}\n\n${suggestion.followUp.join('\n\n')}`, "Complete script")}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Script
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Key Talking Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4" />
            Key Talking Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {conversationData.keyTalkingPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>{point}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(point, "Talking point")}
                  className="h-6 px-2 ml-auto"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}