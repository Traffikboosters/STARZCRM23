import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Target, Zap, TrendingUp, AlertTriangle, CheckCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ScoreBadge = ({ score, size = "default" }: { score: number; size?: "sm" | "default" | "lg" }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-red-500 text-white";
    if (score >= 65) return "bg-orange-500 text-white";
    if (score >= 45) return "bg-yellow-500 text-black";
    return "bg-gray-500 text-white";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Zap className="w-3 h-3" />;
    if (score >= 65) return <TrendingUp className="w-3 h-3" />;
    if (score >= 45) return <Target className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  return (
    <Badge className={`${getScoreColor(score)} gap-1 ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}>
      {getScoreIcon(score)}
      {score}
    </Badge>
  );
};

const UrgencyIndicator = ({ urgencyLevel }: { urgencyLevel: string }) => {
  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case "critical":
        return { color: "bg-red-600", pulse: "animate-pulse", icon: AlertTriangle, text: "CRITICAL" };
      case "high":
        return { color: "bg-orange-500", pulse: "", icon: Zap, text: "HIGH" };
      case "medium":
        return { color: "bg-yellow-500", pulse: "", icon: Target, text: "MEDIUM" };
      default:
        return { color: "bg-gray-400", pulse: "", icon: CheckCircle, text: "LOW" };
    }
  };

  const config = getUrgencyConfig(urgencyLevel);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.color} text-white text-xs font-medium ${config.pulse}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </div>
  );
};

export function AILeadScoring() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"]
  });

  const scoreBatchMutation = useMutation({
    mutationFn: (contactIds: number[]) => 
      apiRequest("POST", "/api/contacts/score-batch", { contactIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "AI Scoring Complete",
        description: "All leads have been analyzed and scored",
      });
    }
  });

  const handleBatchScoring = () => {
    if (Array.isArray(contacts) && contacts.length > 0) {
      const contactIds = contacts.map((c: any) => c.id);
      scoreBatchMutation.mutate(contactIds);
    }
  };

  // Calculate analytics from contacts data
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const analytics = {
    totalContacts: safeContacts.length,
    scoredContacts: safeContacts.filter((c: any) => c.aiScore && c.aiScore > 0).length,
    averageScore: safeContacts.length > 0 
      ? Math.round(safeContacts.reduce((sum: number, c: any) => sum + (c.aiScore || 0), 0) / safeContacts.length)
      : 0,
    scoreDistribution: {
      high: safeContacts.filter((c: any) => (c.aiScore || 0) >= 80).length,
      medium: safeContacts.filter((c: any) => (c.aiScore || 0) >= 50 && (c.aiScore || 0) < 80).length,
      low: safeContacts.filter((c: any) => (c.aiScore || 0) < 50).length
    },
    urgencyLevels: {
      critical: safeContacts.filter((c: any) => c.urgencyLevel === "critical").length,
      high: safeContacts.filter((c: any) => c.urgencyLevel === "high").length,
      medium: safeContacts.filter((c: any) => c.urgencyLevel === "medium").length,
      low: safeContacts.filter((c: any) => c.urgencyLevel === "low").length
    }
  };

  // Get prioritized leads (sorted by AI score)
  const prioritizedLeads = safeContacts
    .filter((c: any) => c.aiScore && c.aiScore > 0)
    .sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0))
    .slice(0, 20);

  const ScoreAnalytics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalContacts}</div>
          <p className="text-xs text-muted-foreground">
            {analytics.scoredContacts} scored
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageScore}</div>
          <Progress 
            value={analytics.averageScore} 
            className="mt-2" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {analytics.scoreDistribution.high}
          </div>
          <p className="text-xs text-muted-foreground">Score 80+</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Critical Urgency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {analytics.urgencyLevels.critical}
          </div>
          <p className="text-xs text-muted-foreground">Immediate action needed</p>
        </CardContent>
      </Card>
    </div>
  );

  const PriorityLeadsList = () => (
    <div className="space-y-4">
      {prioritizedLeads.length > 0 ? prioritizedLeads.map((lead: any) => (
        <Card key={lead.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{lead.firstName} {lead.lastName}</h3>
                <p className="text-sm text-muted-foreground">{lead.company}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <UrgencyIndicator urgencyLevel={lead.urgencyLevel || "low"} />
              <ScoreBadge score={lead.aiScore || 0} />
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">AI Analysis:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Industry Score:</span> {lead.industryScore || 0}
              </div>
              <div>
                <span className="font-medium">Qualification:</span> {lead.qualificationScore || 0}
              </div>
            </div>
          </div>
        </Card>
      )) : (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No scored leads available. Run AI scoring to analyze your leads.</p>
        </div>
      )}
    </div>
  );

  const ScoreDistribution = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">High Priority (80+)</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-red-100 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, analytics.scoreDistribution.high * 5)}%` }}
                />
              </div>
              <span className="text-sm font-medium">{analytics.scoreDistribution.high}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Medium Priority (50-79)</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-yellow-100 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, analytics.scoreDistribution.medium * 2)}%` }}
                />
              </div>
              <span className="text-sm font-medium">{analytics.scoreDistribution.medium}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Low Priority (Under 50)</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, analytics.scoreDistribution.low)}%` }}
                />
              </div>
              <span className="text-sm font-medium">{analytics.scoreDistribution.low}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Urgency Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analytics.urgencyLevels).map(([level, count]) => (
            <div key={level} className="flex justify-between items-center">
              <UrgencyIndicator urgencyLevel={level} />
              <span className="text-lg font-semibold">{count as number}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const TopScoringLeads = () => (
    <Card>
      <CardHeader>
        <CardTitle>Top Scoring Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prioritizedLeads.slice(0, 5).map((lead: any, index: number) => (
            <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UrgencyIndicator urgencyLevel={lead.urgencyLevel || "low"} />
                <ScoreBadge score={lead.aiScore || 0} size="sm" />
              </div>
            </div>
          ))}
          {prioritizedLeads.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No scored leads available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const AIFactors = () => (
    <Card>
      <CardHeader>
        <CardTitle>AI Scoring Factors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Industry Value</span>
            <span className="text-sm font-medium">20%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Budget & Deal Size</span>
            <span className="text-sm font-medium">20%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Company Size</span>
            <span className="text-sm font-medium">15%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Timeline Urgency</span>
            <span className="text-sm font-medium">15%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Engagement Level</span>
            <span className="text-sm font-medium">10%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Lead Source Quality</span>
            <span className="text-sm font-medium">10%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">BANT Qualification</span>
            <span className="text-sm font-medium">10%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Lead Scoring</h1>
          <p className="text-muted-foreground">
            Intelligent prioritization and lead analysis powered by AI
          </p>
        </div>
        
        <Button 
          onClick={handleBatchScoring}
          disabled={scoreBatchMutation.isPending || contacts.length === 0}
          className="bg-primary hover:bg-primary/90"
        >
          <Brain className="w-4 h-4 mr-2" />
          {scoreBatchMutation.isPending ? "Scoring..." : "Refresh Scores"}
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="priority-leads">Priority Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ScoreAnalytics />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopScoringLeads />
            <AIFactors />
          </div>
        </TabsContent>

        <TabsContent value="priority-leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>High-Priority Leads</CardTitle>
              <p className="text-sm text-muted-foreground">
                Leads ranked by AI scoring algorithm - focus on these first
              </p>
            </CardHeader>
            <CardContent>
              <PriorityLeadsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ScoreDistribution />
        </TabsContent>
      </Tabs>
    </div>
  );
}