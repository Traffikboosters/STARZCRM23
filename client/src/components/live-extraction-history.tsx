import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Building2, CheckCircle, XCircle, TrendingUp, RefreshCw, MapPin, Search, Filter, Activity } from "lucide-react";
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
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);
  const queryClient = useQueryClient();

  // Fetch extraction history with real-time updates
  const { data: extractionHistory = [], isLoading, refetch } = useQuery<ExtractionHistory[]>({
    queryKey: ['/api/extraction-history'],
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
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
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Live Extraction History</h1>
          <p className="text-sm text-muted-foreground">Real-time monitoring of data extraction activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="secondary" className="shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            Auto: {refreshInterval / 1000}s
          </Badge>
        </div>
      </div>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold text-primary">{liveStats.totalExtractions}</p>
                <p className="text-xs text-muted-foreground truncate">Total Extractions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold text-green-600">{liveStats.successfulExtractions}</p>
                <p className="text-xs text-muted-foreground truncate">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold text-blue-600">{liveStats.totalLeadsExtracted}</p>
                <p className="text-xs text-muted-foreground truncate">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold text-purple-600">{liveStats.averageLeadsPerExtraction}</p>
                <p className="text-xs text-muted-foreground truncate">Avg per Run</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold text-orange-600">{liveStats.recentActivity}</p>
                <p className="text-xs text-muted-foreground truncate">Last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-indigo-600 truncate">
                  {platformNames[liveStats.topPerformingPlatform] || liveStats.topPerformingPlatform}
                </p>
                <p className="text-xs text-muted-foreground truncate">Top Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Platform:</span>
        </div>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {availablePlatforms.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platformNames[platform] || platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Extraction History List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading extraction history...</span>
            </div>
          </CardContent>
        </Card>
      ) : filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No extraction history found</h3>
              <p className="text-sm text-muted-foreground">
                {selectedPlatform === 'all' 
                  ? 'No extraction activities have been recorded yet.'
                  : `No extractions found for ${platformNames[selectedPlatform] || selectedPlatform}.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((extraction: ExtractionHistory) => (
            <Card key={extraction.id}>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  {/* Left side - Platform and status */}
                  <div className="flex items-center space-x-3">
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
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(extraction.extractionTime), 'MMM d, yyyy HH:mm:ss')}
                    </span>
                  </div>

                  {/* Right side - Metrics */}
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{extraction.leadsExtracted}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{extraction.totalResults}</div>
                      <div className="text-xs text-muted-foreground">Total Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{formatDuration(extraction.processingDuration ?? 0)}</div>
                      <div className="text-xs text-muted-foreground">Processing Time</div>
                    </div>
                  </div>
                </div>

                {/* Error message if failed */}
                {!extraction.success && extraction.errorMessage && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {extraction.errorMessage}
                    </p>
                  </div>
                )}

                {/* API Key Status */}
                {extraction.apiKeyUsed && (
                  <div className="mt-4 flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      API Key: {extraction.apiKeyUsed ? 'Used' : 'Not Used'}
                    </Badge>
                    {extraction.notes && (
                      <span className="text-xs text-muted-foreground">{extraction.notes}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Activity Summary */}
      {filteredHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredHistory.slice(0, 5).map((extraction: ExtractionHistory) => (
                <div key={extraction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <Badge className={getPlatformColor(extraction.platform)} variant="outline">
                      {platformNames[extraction.platform] || extraction.platform}
                    </Badge>
                    <span className="text-sm">{extraction.leadsExtracted} leads</span>
                  </div>
                  <div className="flex items-center space-x-2">
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