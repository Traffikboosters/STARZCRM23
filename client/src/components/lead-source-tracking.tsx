import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Building,
  Search,
  Target,
  Calendar
} from "lucide-react";

interface LeadSourceData {
  source: string;
  count: number;
  percentage: number;
  conversionRate: number;
  avgDealValue: number;
  lastReceived: string;
  recentLeads: {
    id: number;
    name: string;
    timestamp: string;
    status: string;
  }[];
}

const sourceIcons = {
  'google_maps': <MapPin className="h-4 w-4" />,
  'google_maps_enhanced': <Search className="h-4 w-4" />,
  'bark_com': <Building className="h-4 w-4" />,
  'business_insider': <Globe className="h-4 w-4" />,
  'yellowpages': <Phone className="h-4 w-4" />,
  'whitepages': <Users className="h-4 w-4" />,
  'yelp': <Target className="h-4 w-4" />,
  'chat_widget': <Mail className="h-4 w-4" />,
  'manual_entry': <Users className="h-4 w-4" />,
  'referral': <TrendingUp className="h-4 w-4" />,
  'website_form': <Globe className="h-4 w-4" />
};

const sourceNames = {
  'google_maps': 'Google Maps',
  'google_maps_enhanced': 'Google Maps Enhanced',
  'bark_com': 'Bark.com',
  'business_insider': 'Business Insider',
  'yellowpages': 'Yellow Pages',
  'whitepages': 'White Pages',
  'yelp': 'Yelp',
  'chat_widget': 'Chat Widget',
  'manual_entry': 'Manual Entry',
  'referral': 'Referral',
  'website_form': 'Website Form'
};

export default function LeadSourceTracking() {
  const [timeRange, setTimeRange] = useState("30");

  const { data: sourceData = [], isLoading } = useQuery({
    queryKey: ['/api/analytics/lead-sources', timeRange],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Lead Source Analytics
            </CardTitle>
            <CardDescription>Loading lead source data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Lead Source Analytics
            </CardTitle>
            <CardDescription>No lead source data available</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No leads have been imported yet. Start by using the lead extraction tools to generate data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalLeads = sourceData.reduce((sum: number, source: LeadSourceData) => sum + source.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Source Tracking</h1>
          <p className="text-muted-foreground">
            Track and analyze the performance of your lead sources
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              From {sourceData.length} sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Source</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sourceNames[sourceData[0]?.source as keyof typeof sourceNames] || sourceData[0]?.source}
            </div>
            <p className="text-xs text-muted-foreground">
              {sourceData[0]?.count} leads ({sourceData[0]?.percentage.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(sourceData.reduce((sum: number, source: LeadSourceData) => sum + source.conversionRate, 0) / sourceData.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(sourceData.reduce((sum: number, source: LeadSourceData) => sum + source.avgDealValue, 0) / sourceData.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per lead
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Source Breakdown</CardTitle>
          <CardDescription>Performance metrics by lead source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sourceData.map((source: LeadSourceData) => (
              <div key={source.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sourceIcons[source.source as keyof typeof sourceIcons] || <Users className="h-4 w-4" />}
                    <span className="font-medium">
                      {sourceNames[source.source as keyof typeof sourceNames] || source.source}
                    </span>
                    <Badge variant="secondary">{source.count} leads</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{source.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {source.conversionRate}% conversion
                    </div>
                  </div>
                </div>
                <Progress value={source.percentage} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Deal Value:</span> ${source.avgDealValue.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Lead:</span> {new Date(source.lastReceived).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Recent Activity:</span> {source.recentLeads.length} this week
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Lead Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Lead Activity
          </CardTitle>
          <CardDescription>Latest leads from all sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sourceData.slice(0, 5).map((source: LeadSourceData) => (
              <div key={source.source}>
                <div className="flex items-center gap-2 mb-2">
                  {sourceIcons[source.source as keyof typeof sourceIcons]}
                  <span className="font-medium text-sm">
                    {sourceNames[source.source as keyof typeof sourceNames] || source.source}
                  </span>
                </div>
                <div className="space-y-1 ml-6">
                  {source.recentLeads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between text-sm">
                      <span>{lead.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="text-xs">
                          {lead.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lead.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}