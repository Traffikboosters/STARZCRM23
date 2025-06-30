import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  User, 
  Building2, 
  Globe, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Star,
  Clock,
  Database,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Smartphone,
  Mail,
  Phone,
  Award,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
  Target
} from "lucide-react";

interface EnrichmentData {
  id: number;
  contactId: number;
  linkedinUrl?: string;
  linkedinFollowers?: number;
  linkedinConnections?: number;
  linkedinJobTitle?: string;
  linkedinCompany?: string;
  facebookUrl?: string;
  facebookFollowers?: number;
  twitterHandle?: string;
  twitterFollowers?: number;
  instagramFollowers?: number;
  companyWebsite?: string;
  companySize?: string;
  companyRevenue?: string;
  companyIndustry?: string;
  jobTitle?: string;
  seniority?: string;
  department?: string;
  engagementScore?: number;
  influencerScore?: number;
  socialMediaActivity?: string;
  preferredContactMethod?: string;
  bestContactTime?: string;
  enrichmentStatus?: string;
  confidence?: number;
  lastEnriched?: string;
}

interface EnrichmentHistory {
  id: number;
  contactId: number;
  enrichmentType: string;
  dataProvider: string;
  fieldsUpdated: string[];
  confidence: number;
  processingTime: number;
  success: boolean;
  createdAt: string;
}

interface LeadEnrichmentViewProps {
  contactId: number;
  contactName: string;
  onClose: () => void;
}

export function LeadEnrichmentView({ contactId, contactName, onClose }: LeadEnrichmentViewProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const { toast } = useToast();

  const { data: enrichmentData, isLoading: loadingEnrichment } = useQuery({
    queryKey: ["/api/contacts", contactId, "enrichment"],
    queryFn: () => apiRequest(`/api/contacts/${contactId}/enrichment`),
  });

  const { data: enrichmentHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["/api/enrichment/history", contactId],
    queryFn: () => apiRequest(`/api/enrichment/history/${contactId}`),
  });

  const enrichContactMutation = useMutation({
    mutationFn: () => apiRequest(`/api/contacts/${contactId}/enrich`, {
      method: "POST",
    }),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Lead Enrichment Complete",
          description: `Successfully enriched ${contactName} with ${data.fieldsEnriched.length} data sources`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/contacts", contactId, "enrichment"] });
        queryClient.invalidateQueries({ queryKey: ["/api/enrichment/history", contactId] });
      } else {
        toast({
          title: "Enrichment Failed",
          description: data.error || "Failed to enrich lead data",
          variant: "destructive",
        });
      }
      setIsEnriching(false);
    },
    onError: (error) => {
      console.error("Enrichment error:", error);
      toast({
        title: "Enrichment Error",
        description: "Failed to process lead enrichment",
        variant: "destructive",
      });
      setIsEnriching(false);
    },
  });

  const handleEnrichContact = async () => {
    setIsEnriching(true);
    enrichContactMutation.mutate();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin": return <Linkedin className="h-4 w-4" />;
      case "facebook": return <Facebook className="h-4 w-4" />;
      case "twitter": return <Twitter className="h-4 w-4" />;
      case "instagram": return <Instagram className="h-4 w-4" />;
      case "youtube": return <Youtube className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  if (loadingEnrichment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading enrichment data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Enrichment</h2>
          <p className="text-gray-600">Social media insights for {contactName}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleEnrichContact}
            disabled={isEnriching}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isEnriching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Enrich Lead
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Enrichment Status */}
      {enrichmentData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-orange-600" />
                  Enrichment Status
                </CardTitle>
                <CardDescription>
                  Last updated: {new Date(enrichmentData.lastEnriched).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={enrichmentData.enrichmentStatus === "completed" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {enrichmentData.enrichmentStatus === "completed" ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {enrichmentData.enrichmentStatus}
                </Badge>
                <Badge 
                  variant={getScoreBadgeVariant(enrichmentData.confidence || 0)}
                  className="text-xs"
                >
                  {enrichmentData.confidence}% Confidence
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="social" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LinkedIn Profile */}
            {enrichmentData?.linkedinUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Linkedin className="h-5 w-5 mr-2 text-blue-600" />
                    LinkedIn Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Profile URL:</p>
                    <a 
                      href={enrichmentData.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {enrichmentData.linkedinUrl}
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Connections:</p>
                      <p className="font-semibold">{enrichmentData.linkedinConnections?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Followers:</p>
                      <p className="font-semibold">{enrichmentData.linkedinFollowers?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Current Role:</p>
                    <p className="font-semibold">{enrichmentData.linkedinJobTitle}</p>
                    <p className="text-gray-500 text-sm">{enrichmentData.linkedinCompany}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                  Social Media Reach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {enrichmentData?.facebookFollowers && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-sm">Facebook</span>
                      </div>
                      <span className="font-semibold">{enrichmentData.facebookFollowers.toLocaleString()}</span>
                    </div>
                  )}
                  {enrichmentData?.twitterFollowers && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                        <span className="text-sm">Twitter</span>
                      </div>
                      <span className="font-semibold">{enrichmentData.twitterFollowers.toLocaleString()}</span>
                    </div>
                  )}
                  {enrichmentData?.instagramFollowers && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                        <span className="text-sm">Instagram</span>
                      </div>
                      <span className="font-semibold">{enrichmentData.instagramFollowers.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engagement Score:</span>
                    <Badge variant={getScoreBadgeVariant(enrichmentData?.engagementScore || 0)}>
                      {enrichmentData?.engagementScore}/100
                    </Badge>
                  </div>
                  <Progress 
                    value={enrichmentData?.engagementScore || 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Influencer Score:</span>
                    <Badge variant={getScoreBadgeVariant(enrichmentData?.influencerScore || 0)}>
                      {enrichmentData?.influencerScore}/100
                    </Badge>
                  </div>
                  <Progress 
                    value={enrichmentData?.influencerScore || 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Briefcase className="h-5 w-5 mr-2 text-orange-600" />
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Job Title:</p>
                    <p className="font-semibold">{enrichmentData?.jobTitle || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seniority:</p>
                    <Badge variant="outline" className="text-xs">
                      {enrichmentData?.seniority || "Unknown"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department:</p>
                    <p className="font-semibold capitalize">{enrichmentData?.department || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Activity Level:</p>
                    <Badge variant="secondary" className="text-xs">
                      {enrichmentData?.socialMediaActivity || "Low"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Target className="h-5 w-5 mr-2 text-orange-600" />
                  Contact Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preferred Method:</span>
                    <div className="flex items-center">
                      {enrichmentData?.preferredContactMethod === "linkedin" && <Linkedin className="h-4 w-4 mr-1" />}
                      {enrichmentData?.preferredContactMethod === "email" && <Mail className="h-4 w-4 mr-1" />}
                      {enrichmentData?.preferredContactMethod === "phone" && <Phone className="h-4 w-4 mr-1" />}
                      <span className="text-sm font-semibold capitalize">
                        {enrichmentData?.preferredContactMethod || "Email"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Best Time:</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm font-semibold capitalize">
                        {enrichmentData?.bestContactTime || "Morning"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Company Info Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building2 className="h-5 w-5 mr-2 text-orange-600" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Website:</p>
                    {enrichmentData?.companyWebsite ? (
                      <a 
                        href={enrichmentData.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {enrichmentData.companyWebsite}
                      </a>
                    ) : (
                      <p className="text-sm">N/A</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Industry:</p>
                    <p className="font-semibold">{enrichmentData?.companyIndustry || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Company Size:</p>
                    <Badge variant="outline">{enrichmentData?.companySize || "Unknown"}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Revenue:</p>
                    <p className="font-semibold">{enrichmentData?.companyRevenue || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Enrichment History
              </CardTitle>
              <CardDescription>
                Track all enrichment activities for this lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">Loading history...</span>
                </div>
              ) : enrichmentHistory && enrichmentHistory.length > 0 ? (
                <div className="space-y-4">
                  {enrichmentHistory.map((record: EnrichmentHistory) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {record.enrichmentType}
                          </Badge>
                          <span className="text-sm text-gray-600">{record.dataProvider}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={record.success ? "default" : "destructive"} className="text-xs">
                            {record.confidence}% confidence
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {record.processingTime}ms
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Fields updated: {record.fieldsUpdated.join(", ")}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(record.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No enrichment history available</p>
                  <p className="text-sm text-gray-400">Click "Enrich Lead" to start collecting data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}