import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Building2, CheckCircle, XCircle, TrendingUp, RefreshCw, MapPin, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import type { ExtractionHistory } from "@/../../shared/schema";

interface LiveStats {
  totalExtractions: number;
  successfulExtractions: number;
  totalLeadsExtracted: number;
  averageLeadsPerExtraction: number;
  topPerformingPlatform: string;
  recentActivity: number;
}

export function LiveExtractionHistory() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const queryClient = useQueryClient();

  // Fetch extraction history with real-time updates
  const { data: extractionHistory = [], isLoading, refetch } = useQuery<ExtractionHistory[]>({
    queryKey: ['/api/extraction-history'],
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });

  // Fetch recent extraction history (last 10)
  const { data: recentHistory = [] } = useQuery<ExtractionHistory[]>({
    queryKey: ['/api/extraction-history/recent'],
    refetchInterval: refreshInterval,
  });

  // Calculate live statistics
  const liveStats: LiveStats = {
    totalExtractions: extractionHistory?.length || 0,
    successfulExtractions: extractionHistory?.filter((h: ExtractionHistory) => h.success).length || 0,
    totalLeadsExtracted: extractionHistory?.reduce((sum: number, h: ExtractionHistory) => sum + (h.leadsExtracted || 0), 0) || 0,
    averageLeadsPerExtraction: extractionHistory && extractionHistory.length > 0 
      ? Math.round(extractionHistory.reduce((sum: number, h: ExtractionHistory) => sum + (h.leadsExtracted || 0), 0) / extractionHistory.length)
      : 0,
    topPerformingPlatform: extractionHistory ? getTopPerformingPlatform(extractionHistory) : 'None',
    recentActivity: extractionHistory?.filter((h: ExtractionHistory) => 
      new Date(h.extractionTime).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length || 0
  };

  function getTopPerformingPlatform(history: ExtractionHistory[]): string {
    if (!history || history.length === 0) return 'None';
    
    const platformStats = history.reduce((stats: Record<string, number>, h: ExtractionHistory) => {
      stats[h.platform] = (stats[h.platform] || 0) + (h.leadsExtracted || 0);
      return stats;
    }, {});

    const topPlatform = Object.entries(platformStats).reduce(
      (top, [platform, leads]) => leads > top.leads ? { platform, leads } : top,
      { platform: 'None', leads: 0 }
    );

    return topPlatform.platform;
  }

  // Filter history by platform
  const filteredHistory = selectedPlatform === 'all' 
    ? extractionHistory 
    : extractionHistory?.filter((h: ExtractionHistory) => h.platform === selectedPlatform) || [];

  // Get unique platforms for filtering
  const availablePlatforms = Array.from(new Set(extractionHistory?.map((h: ExtractionHistory) => h.platform) || []));

  // Platform display names
  const platformNames: Record<string, string> = {
    'google_maps': 'Google Maps',
    'bark_com': 'Bark.com',
    'bark_dashboard': 'Bark Dashboard',
    'yelp': 'Yelp',
    'yellowpages': 'Yellow Pages',
    'whitepages': 'White Pages',
    'business_insider': 'Business Insider'
  };

  const formatDuration = (milliseconds?: number): string => {
    if (!milliseconds) return 'N/A';
    const seconds = Math.round(milliseconds / 1000);
    return `${seconds}s`;
  };

  const getStatusColor = (success: boolean): string => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      'google_maps': 'bg-blue-100 text-blue-800',
      'bark_com': 'bg-orange-100 text-orange-800',
      'bark_dashboard': 'bg-purple-100 text-purple-800',
      'yelp': 'bg-red-100 text-red-800',
      'yellowpages': 'bg-yellow-100 text-yellow-800',
      'whitepages': 'bg-gray-100 text-gray-800',
      'business_insider': 'bg-indigo-100 text-indigo-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Live Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{liveStats.totalExtractions}</p>
                <p className="text-xs text-muted-foreground">Total Extractions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{liveStats.successfulExtractions}</p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{liveStats.totalLeadsExtracted}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{liveStats.averageLeadsPerExtraction}</p>
                <p className="text-xs text-muted-foreground">Avg Per Run</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-bold text-orange-600">{liveStats.topPerformingPlatform}</p>
                <p className="text-xs text-muted-foreground">Top Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{liveStats.recentActivity}</p>
                <p className="text-xs text-muted-foreground">Last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Live Extraction History & Timestamps
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2"></div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Platforms</option>
                {availablePlatforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platformNames[platform] || platform}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading extraction history...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No extraction history found</p>
              <p className="text-sm">Start extracting leads to see live tracking data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((extraction: ExtractionHistory) => (
                <div key={extraction.id} className="border rounded-lg p-4 space-y-3">
                  {/* Header with status and platform */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(extraction.success ?? false)}>
                        {extraction.success ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {extraction.success ? 'Success' : 'Failed'}
                      </Badge>
                      <Badge className={getPlatformColor(extraction.platform)}>
                        {platformNames[extraction.platform] || extraction.platform}
                      </Badge>
                      {extraction.industry && (
                        <Badge variant="outline">
                          {extraction.industry}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(extraction.extractionTime), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>

                  {/* Location and search terms */}
                  {(extraction.location || extraction.searchTerms?.length) && (
                    <div className="flex items-center gap-4 text-sm">
                      {extraction.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{extraction.location}</span>
                        </div>
                      )}
                      {extraction.searchTerms?.length && (
                        <div className="flex items-center gap-1">
                          <Search className="h-3 w-3 text-muted-foreground" />
                          <span>{extraction.searchTerms.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{extraction.leadsExtracted}</div>
                      <div className="text-muted-foreground">Leads Extracted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{extraction.contactsCreated}</div>
                      <div className="text-muted-foreground">Contacts Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{extraction.totalResults}</div>
                      <div className="text-muted-foreground">Total Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatDuration(extraction.processingDuration ?? 0)}</div>
                      <div className="text-muted-foreground">Processing Time</div>
                    </div>
                  </div>

                  {/* Error message if failed */}
                  {!extraction.success && extraction.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">
                        <strong>Error:</strong> {extraction.errorMessage}
                      </p>
                    </div>
                  )}

                  {/* API Key Status */}
                  {extraction.apiKeyStatus && (
                    <div className="flex items-center gap-2">
                      <Badge variant={extraction.apiKeyStatus === 'valid' ? 'default' : 'destructive'}>
                        API Key: {extraction.apiKeyStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      {recentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity (Last 10 Extractions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentHistory.map((extraction: ExtractionHistory, index: number) => (
                <div key={extraction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">#{recentHistory.length - index}</span>
                    <Badge className={getPlatformColor(extraction.platform)} variant="outline">
                      {platformNames[extraction.platform] || extraction.platform}
                    </Badge>
                    <span className="text-sm">{extraction.leadsExtracted} leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(extraction.success ?? false)} variant="outline">
                      {extraction.success ? 'Success' : 'Failed'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(extraction.extractionTime), 'HH:mm:ss')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}