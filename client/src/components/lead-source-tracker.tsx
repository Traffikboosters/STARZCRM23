import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Phone, Mail, Globe, Facebook, Instagram, Linkedin, Twitter, Youtube, Search, Users, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LeadSourceData {
  source: string;
  count: number;
  lastReceived: string;
  conversionRate: number;
  avgDealValue: number;
  recentLeads: {
    id: number;
    name: string;
    timestamp: string;
    status: string;
  }[];
}

interface LeadSourceTrackerProps {
  showRecentActivity?: boolean;
  timeframe?: '24h' | '7d' | '30d';
}

export function LeadSourceTracker({ showRecentActivity = true, timeframe = '24h' }: LeadSourceTrackerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const { data: sourceData, isLoading } = useQuery<LeadSourceData[]>({
    queryKey: ['/api/analytics/lead-sources', selectedTimeframe],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getSourceIcon = (source: string) => {
    const iconMap: Record<string, any> = {
      'chat_widget': MessageSquare,
      'website': Globe,
      'google_maps': MapPin,
      'facebook': Facebook,
      'instagram': Instagram,
      'linkedin': Linkedin,
      'twitter': Twitter,
      'youtube': Youtube,
      'google_ads': Search,
      'yelp': Search,
      'bark': Search,
      'yellowpages': Phone,
      'whitepages': Phone,
      'referral': Users,
      'cold_call': Phone,
      'email': Mail,
    };
    
    const IconComponent = iconMap[source] || Globe;
    return <IconComponent className="w-5 h-5" />;
  };

  const getSourceColor = (source: string) => {
    const colorMap: Record<string, string> = {
      'chat_widget': 'bg-green-100 text-green-800 border-green-200',
      'website': 'bg-blue-100 text-blue-800 border-blue-200',
      'google_maps': 'bg-red-100 text-red-800 border-red-200',
      'facebook': 'bg-blue-100 text-blue-800 border-blue-200',
      'instagram': 'bg-pink-100 text-pink-800 border-pink-200',
      'linkedin': 'bg-blue-100 text-blue-800 border-blue-200',
      'twitter': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'youtube': 'bg-red-100 text-red-800 border-red-200',
      'google_ads': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'yelp': 'bg-orange-100 text-orange-800 border-orange-200',
      'bark': 'bg-green-100 text-green-800 border-green-200',
      'yellowpages': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'whitepages': 'bg-gray-100 text-gray-800 border-gray-200',
      'referral': 'bg-purple-100 text-purple-800 border-purple-200',
      'cold_call': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'email': 'bg-teal-100 text-teal-800 border-teal-200',
    };
    
    return colorMap[source] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const mockSourceData: LeadSourceData[] = [
    {
      source: 'chat_widget',
      count: 12,
      lastReceived: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      conversionRate: 35.2,
      avgDealValue: 2850,
      recentLeads: [
        { id: 1, name: 'Sarah Johnson - HVAC', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: 'new' },
        { id: 2, name: 'Mike Chen - Plumbing', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: 'contacted' },
        { id: 3, name: 'Lisa Rodriguez - Carpet', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'qualified' },
      ]
    },
    {
      source: 'google_maps',
      count: 8,
      lastReceived: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      conversionRate: 28.7,
      avgDealValue: 3200,
      recentLeads: [
        { id: 4, name: 'David Thompson - Electrical', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'new' },
        { id: 5, name: 'Amanda Davis - Landscaping', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), status: 'contacted' },
      ]
    },
    {
      source: 'bark',
      count: 15,
      lastReceived: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      conversionRate: 22.4,
      avgDealValue: 1950,
      recentLeads: [
        { id: 6, name: 'Jennifer Wilson - Home Services', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: 'new' },
        { id: 7, name: 'Robert Martinez - Roofing', timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(), status: 'contacted' },
        { id: 8, name: 'Emily Brown - Cleaning', timestamp: new Date(Date.now() - 1000 * 60 * 105).toISOString(), status: 'qualified' },
      ]
    },
    {
      source: 'yelp',
      count: 6,
      lastReceived: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      conversionRate: 31.5,
      avgDealValue: 2650,
      recentLeads: [
        { id: 9, name: 'Chris Taylor - Auto Repair', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: 'new' },
        { id: 10, name: 'Maria Garcia - Restaurant', timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), status: 'contacted' },
      ]
    },
    {
      source: 'facebook',
      count: 4,
      lastReceived: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      conversionRate: 18.3,
      avgDealValue: 1800,
      recentLeads: [
        { id: 11, name: 'James Anderson - Fitness', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'new' },
      ]
    }
  ];

  const displayData: LeadSourceData[] = sourceData || mockSourceData;
  const totalLeads = displayData.reduce((sum: number, source: LeadSourceData) => sum + source.count, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Source Tracking</CardTitle>
          <CardDescription>Loading lead source analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Source Tracking</h2>
          <p className="text-muted-foreground">Monitor where leads are coming from and when they arrive</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d'].map((period) => (
            <Button
              key={period}
              variant={selectedTimeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(period as any)}
            >
              {period === '24h' ? 'Today' : period === '7d' ? 'Week' : 'Month'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Lead</p>
                <p className="text-2xl font-bold">
                  {displayData.length > 0 ? formatTimestamp(displayData[0].lastReceived) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Source</p>
                <p className="text-2xl font-bold capitalize">
                  {displayData.length > 0 ? displayData[0].source.replace('_', ' ') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Deal Value</p>
                <p className="text-2xl font-bold">
                  ${displayData.length > 0 ? Math.round(displayData.reduce((sum, s) => sum + s.avgDealValue, 0) / displayData.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources Overview</CardTitle>
          <CardDescription>
            Breakdown by source with timestamps and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayData.map((source) => (
              <div key={source.source} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getSourceColor(source.source).split(' ')[0]} ${getSourceColor(source.source).split(' ')[2]}`}>
                      {getSourceIcon(source.source)}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {source.source.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Last lead: {formatTimestamp(source.lastReceived)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getSourceColor(source.source)}>
                      {source.count} leads
                    </Badge>
                    <Badge variant="secondary">
                      {source.conversionRate}% conv.
                    </Badge>
                    <Badge variant="outline">
                      ${source.avgDealValue.toLocaleString()} avg.
                    </Badge>
                  </div>
                </div>
                
                {showRecentActivity && source.recentLeads.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Recent Leads:</p>
                    <div className="space-y-2">
                      {source.recentLeads.slice(0, 3).map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between text-sm">
                          <span>{lead.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={lead.status === 'new' ? 'default' : lead.status === 'contacted' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {lead.status}
                            </Badge>
                            <span className="text-muted-foreground">
                              {formatTimestamp(lead.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LeadSourceTracker;