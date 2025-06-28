import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  MapPin, 
  Star, 
  Camera, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Eye,
  Zap,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Contact } from "@shared/schema";

interface OnlinePresenceResult {
  hasWebsite: boolean;
  websiteUrl?: string;
  websiteStatus: 'active' | 'inactive' | 'unknown';
  websiteAnalysis: {
    hasContactForm: boolean;
    hasBlog: boolean;
    hasEcommerce: boolean;
    isMobile: boolean;
    seoScore: number;
    loadSpeed: 'fast' | 'medium' | 'slow';
    lastUpdated: string;
  };
  hasGMB: boolean;
  gmbUrl?: string;
  gmbStatus: 'verified' | 'unverified' | 'claimed' | 'unclaimed' | 'unknown';
  gmbAnalysis: {
    rating: number;
    reviewCount: number;
    hasPhotos: boolean;
    hasHours: boolean;
    hasDescription: boolean;
    categories: string[];
    isComplete: boolean;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  recommendedServices: string[];
  urgencyLevel: 'high' | 'medium' | 'low';
  marketingGaps: string[];
  competitorAnalysis: {
    directCompetitors: number;
    marketSaturation: 'high' | 'medium' | 'low';
    opportunities: string[];
  };
  confidence: number;
}

interface OnlinePresenceResearchProps {
  contact: Contact;
}

export function OnlinePresenceResearch({ contact }: OnlinePresenceResearchProps) {
  const [research, setResearch] = useState<OnlinePresenceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyzePresence = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/contacts/${contact.id}/online-presence`);
      const result = await response.json();
      setResearch(result);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${result.recommendedServices.length} service opportunities`,
      });
    } catch (error) {
      console.error('Error analyzing online presence:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze online presence",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (!research) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">AI Online Presence Research</h3>
            <p className="text-sm text-muted-foreground">
              Analyze {contact.company || `${contact.firstName} ${contact.lastName}`}'s digital marketing presence
            </p>
          </div>
          <Button 
            onClick={handleAnalyzePresence} 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Analyze Presence
              </>
            )}
          </Button>
        </div>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Click "Analyze Presence" to research their website, Google My Business listing, and social media presence
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Online Presence Analysis</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getUrgencyColor(research.urgencyLevel)}>
              {research.urgencyLevel.toUpperCase()} PRIORITY
            </Badge>
            <span className="text-sm text-muted-foreground">
              {research.confidence}% confidence
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAnalyzePresence}
          disabled={isLoading}
        >
          <Zap className="mr-2 h-4 w-4" />
          Re-analyze
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="gmb">Google My Business</TabsTrigger>
          <TabsTrigger value="recommendations">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website Presence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(research.hasWebsite)}
                  <span className="text-sm">
                    {research.hasWebsite ? 'Website Found' : 'No Website'}
                  </span>
                </div>
                {research.websiteUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate">
                      {research.websiteUrl}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(research.websiteUrl!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Google My Business
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(research.hasGMB)}
                  <span className="text-sm">
                    {research.hasGMB ? 'GMB Listed' : 'No GMB'}
                  </span>
                </div>
                {research.hasGMB && (
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs">
                      {research.gmbAnalysis.rating}/5 ({research.gmbAnalysis.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Marketing Gaps Identified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {research.marketingGaps.map((gap, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">{gap}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Social Media Presence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(research.socialMedia).length > 0 ? (
                  Object.entries(research.socialMedia).map(([platform, url]) => (
                    <div key={platform} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="capitalize">{platform}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No social media profiles detected</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-4">
          {research.hasWebsite ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Website Analysis</CardTitle>
                  <CardDescription>{research.websiteUrl}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(research.websiteAnalysis.hasContactForm)}
                        <span className="text-sm">Contact Form</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(research.websiteAnalysis.hasBlog)}
                        <span className="text-sm">Blog/News</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(research.websiteAnalysis.hasEcommerce)}
                        <span className="text-sm">E-commerce</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(research.websiteAnalysis.isMobile)}
                        <span className="text-sm">Mobile Friendly</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{research.websiteAnalysis.loadSpeed} loading</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Last updated: {research.websiteAnalysis.lastUpdated}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">SEO Score</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={research.websiteAnalysis.seoScore} className="flex-1" />
                      <span className="text-sm font-medium">{research.websiteAnalysis.seoScore}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="font-medium">No Website Detected</p>
                  <p className="text-sm text-muted-foreground">
                    This business needs a professional website to establish online presence
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gmb" className="space-y-4">
          {research.hasGMB ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Google My Business Analysis</CardTitle>
                <CardDescription>Status: {research.gmbStatus}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{research.gmbAnalysis.rating}/5 Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{research.gmbAnalysis.reviewCount} Reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(research.gmbAnalysis.hasPhotos)}
                      <span className="text-sm">Photos Added</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(research.gmbAnalysis.hasHours)}
                      <span className="text-sm">Business Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(research.gmbAnalysis.hasDescription)}
                      <span className="text-sm">Description</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(research.gmbAnalysis.isComplete)}
                      <span className="text-sm">Profile Complete</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Business Categories</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {research.gmbAnalysis.categories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="font-medium">No Google My Business Listing</p>
                  <p className="text-sm text-muted-foreground">
                    Missing critical local search visibility and customer reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recommended Services
              </CardTitle>
              <CardDescription>
                Services that could help improve their online presence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {research.recommendedServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{service}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(service)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Market Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Direct Competitors</span>
                <Badge variant="secondary">{research.competitorAnalysis.directCompetitors}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Market Saturation</span>
                <Badge className={
                  research.competitorAnalysis.marketSaturation === 'high' ? 'bg-red-100 text-red-800' :
                  research.competitorAnalysis.marketSaturation === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {research.competitorAnalysis.marketSaturation}
                </Badge>
              </div>
              
              {research.competitorAnalysis.opportunities.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Market Opportunities</label>
                  <div className="mt-2 space-y-1">
                    {research.competitorAnalysis.opportunities.map((opportunity, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {opportunity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}