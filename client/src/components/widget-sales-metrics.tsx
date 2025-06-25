import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Phone, 
  Video, 
  DollarSign,
  Target,
  Calendar,
  Clock,
  MapPin,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface WidgetMetrics {
  totalInteractions: number;
  leadConversions: number;
  conversionRate: number;
  videoCalls: number;
  phoneCallRequests: number;
  averageSessionTime: number;
  topPages: { page: string; interactions: number }[];
  hourlyBreakdown: { hour: number; interactions: number }[];
  geographicData: { location: string; interactions: number }[];
  revenue: {
    generated: number;
    pending: number;
    projected: number;
  };
}

const mockMetrics: WidgetMetrics = {
  totalInteractions: 2847,
  leadConversions: 892,
  conversionRate: 31.3,
  videoCalls: 156,
  phoneCallRequests: 334,
  averageSessionTime: 4.2,
  topPages: [
    { page: "/services", interactions: 756 },
    { page: "/pricing", interactions: 623 },
    { page: "/", interactions: 511 },
    { page: "/contact", interactions: 412 },
    { page: "/about", interactions: 298 }
  ],
  hourlyBreakdown: [
    { hour: 9, interactions: 234 },
    { hour: 10, interactions: 287 },
    { hour: 11, interactions: 312 },
    { hour: 12, interactions: 298 },
    { hour: 13, interactions: 267 },
    { hour: 14, interactions: 334 },
    { hour: 15, interactions: 389 },
    { hour: 16, interactions: 356 },
    { hour: 17, interactions: 371 }
  ],
  geographicData: [
    { location: "California", interactions: 543 },
    { location: "Texas", interactions: 421 },
    { location: "Florida", interactions: 387 },
    { location: "New York", interactions: 356 },
    { location: "Illinois", interactions: 289 }
  ],
  revenue: {
    generated: 127650,
    pending: 45200,
    projected: 89300
  }
};

export default function WidgetSalesMetrics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [metrics] = useState<WidgetMetrics>(mockMetrics);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getPerformanceColor = (rate: number) => {
    if (rate >= 30) return "text-green-600 bg-green-50";
    if (rate >= 20) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Starz Widget Analytics</h2>
          <p className="text-gray-600">Sales metrics and marketing performance</p>
        </div>
        <div className="flex space-x-2">
          {["7d", "30d", "90d", "1y"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="bg-brand-primary hover:bg-brand-secondary"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold">{metrics.totalInteractions.toLocaleString()}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12.3% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lead Conversions</p>
                <p className="text-2xl font-bold">{metrics.leadConversions.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <Badge className={getPerformanceColor(metrics.conversionRate)}>
                {metrics.conversionRate}% conversion rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Video Calls</p>
                <p className="text-2xl font-bold">{metrics.videoCalls}</p>
              </div>
              <Video className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">{metrics.phoneCallRequests} phone requests</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Generated</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.revenue.generated)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-brand-primary" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">{formatCurrency(metrics.revenue.pending)} pending</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Hourly Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.hourlyBreakdown.map((item) => (
                    <div key={item.hour} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {item.hour}:00 - {item.hour + 1}:00
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-brand-primary h-2 rounded-full" 
                            style={{ width: `${(item.interactions / 400) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{item.interactions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Top Performing Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm">{page.page}</span>
                      </div>
                      <span className="text-sm font-medium">{page.interactions}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Session Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Session Time</p>
                    <p className="text-2xl font-bold">{metrics.averageSessionTime} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bounce Rate</p>
                    <p className="text-2xl font-bold">23.7%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Return Visitors</p>
                    <p className="text-2xl font-bold">34.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Engagement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Form Completions</p>
                    <p className="text-2xl font-bold">67.8%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Video Call Acceptance</p>
                    <p className="text-2xl font-bold">42.1%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Call Requests</p>
                    <p className="text-2xl font-bold">18.9%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Geographic Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.geographicData.map((location) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <span className="text-sm">{location.location}</span>
                      <span className="text-sm font-medium">{location.interactions}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Revenue Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600">Generated Revenue</p>
                      <p className="text-xl font-bold text-green-800">{formatCurrency(metrics.revenue.generated)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm text-yellow-600">Pending Revenue</p>
                      <p className="text-xl font-bold text-yellow-800">{formatCurrency(metrics.revenue.pending)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-blue-600">Projected Revenue</p>
                      <p className="text-xl font-bold text-blue-800">{formatCurrency(metrics.revenue.projected)}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Per Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Direct Chat Leads</span>
                    <span className="font-medium">{formatCurrency(89340)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Video Consultations</span>
                    <span className="font-medium">{formatCurrency(23180)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Phone Call Conversions</span>
                    <span className="font-medium">{formatCurrency(15130)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(127650)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Performance Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">High Performing</h4>
                    <p className="text-sm text-green-600">2-4 PM shows highest conversion rates (38.7%)</p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Opportunity</h4>
                    <p className="text-sm text-yellow-600">Video call acceptance could improve with better positioning</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Recommendation</h4>
                    <p className="text-sm text-blue-600">Add chat widget to /pricing page for 23% boost</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>A/B Testing Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Welcome Message Test</h4>
                    <p className="text-sm text-gray-600">Current vs. Alternative messaging</p>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm">Current: 31.3%</span>
                      <span className="text-sm font-medium text-green-600">Alternative: 34.7% (+3.4%)</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Widget Position Test</h4>
                    <p className="text-sm text-gray-600">Bottom-right vs. Bottom-left</p>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm font-medium text-green-600">Bottom-right: 31.3%</span>
                      <span className="text-sm">Bottom-left: 27.8% (-3.5%)</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Color Scheme Test</h4>
                    <p className="text-sm text-gray-600">Current orange vs. Blue variant</p>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm font-medium text-green-600">Orange: 31.3%</span>
                      <span className="text-sm">Blue: 29.1% (-2.2%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}