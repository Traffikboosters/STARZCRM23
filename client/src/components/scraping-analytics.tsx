import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Target, TrendingUp, Users, Database, Mail, Phone, CheckCircle, Volume2, Bell, Settings, Play, Pause, RotateCcw } from "lucide-react";
import WorkflowDemo from "./workflow-demo";
import { useLeadNotifications } from "@/hooks/use-lead-notifications";
import { useEffect, useState } from "react";

const scrapingPerformanceData = [
  { name: 'Inc 5000', leads: 45, quality: 92, converted: 8 },
  { name: 'Yelp Restaurants', leads: 78, quality: 87, converted: 12 },
  { name: 'LinkedIn B2B', leads: 32, quality: 95, converted: 6 },
  { name: 'Local Directory', leads: 56, quality: 75, converted: 4 }
];

const weeklyScrapingData = [
  { week: 'Week 1', scraped: 45, qualified: 38, contacted: 22, converted: 3 },
  { week: 'Week 2', scraped: 62, qualified: 51, contacted: 34, converted: 5 },
  { week: 'Week 3', scraped: 78, qualified: 67, contacted: 45, converted: 8 },
  { week: 'Week 4', scraped: 89, qualified: 76, contacted: 52, converted: 12 }
];

const campaignROIData = [
  { campaign: 'Restaurant SEO', spent: 2500, revenue: 18500, roi: 640 },
  { campaign: 'B2B Growth', spent: 4200, revenue: 32100, roi: 664 },
  { campaign: 'Local Business', spent: 1800, revenue: 9200, roi: 411 },
  { campaign: 'Enterprise', spent: 6500, revenue: 45800, roi: 605 }
];

const leadSourceData = [
  { name: 'Yelp Scraping', value: 35, color: '#8884d8' },
  { name: 'Inc 5000', value: 28, color: '#82ca9d' },
  { name: 'LinkedIn', value: 22, color: '#ffc658' },
  { name: 'Manual Entry', value: 15, color: '#ff7300' }
];

export default function ScrapingAnalytics() {
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    handleIncomingLead,
    simulateIncomingLead
  } = useLeadNotifications({
    enableSound: true,
    soundVolume: 0.8,
    notificationTypes: {
      newLead: true,
      highValueLead: true,
      qualifiedLead: true,
    }
  });

  // Simulate scraping leads
  useEffect(() => {
    if (!isScrapingActive) return;

    const interval = setInterval(() => {
      const businesses = [
        "Oceanfront Bistro", "TechCorp Solutions", "Metro Fitness Center", 
        "Downtown Legal Group", "Sunrise Dental Care", "Elite Auto Repair"
      ];
      const sources = ["Yelp", "Inc 5000", "LinkedIn", "Google Business"];
      const priorities = ["Medium", "High", "Critical"] as const;

      const newLead = {
        id: Date.now(),
        businessName: businesses[Math.floor(Math.random() * businesses.length)],
        contactName: "Auto-Generated Contact",
        source: sources[Math.floor(Math.random() * sources.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        estimatedValue: Math.floor(Math.random() * 15000) + 2000,
        timestamp: new Date()
      };

      setRecentLeads(prev => [newLead, ...prev.slice(0, 4)]);
      handleIncomingLead(newLead);
    }, 6000); // New lead every 6 seconds

    return () => clearInterval(interval);
  }, [isScrapingActive, handleIncomingLead]);

  return (
    <div className="space-y-6">
      {/* Lead Notification Control */}
      <Card className="border-brand-primary bg-brand-lighter">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isScrapingActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <div>
                <p className="font-medium">Lead Generation with Audio Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {isScrapingActive ? 'Active scraping with popup notifications and sounds' : 'Start live demo to see notifications in action'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={simulateIncomingLead}
              >
                <Bell className="w-3 h-3 mr-1" />
                Test Notification
              </Button>
              <Button
                variant={isScrapingActive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsScrapingActive(!isScrapingActive)}
              >
                <Volume2 className="w-3 h-3 mr-1" />
                {isScrapingActive ? 'Stop Demo' : 'Start Live Demo'}
              </Button>
            </div>
          </div>
          {recentLeads.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Recent Notifications:</p>
              {recentLeads.map((lead, index) => (
                <div key={lead.id} className="flex items-center justify-between text-xs p-2 bg-white rounded border">
                  <span>{lead.businessName} ({lead.source})</span>
                  <Badge className={`${lead.priority === 'Critical' ? 'bg-red-100 text-red-800' : 
                    lead.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {lead.priority} - ${lead.estimatedValue.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Demo Section */}
      <div className="mb-8">
        <WorkflowDemo />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scraped Leads</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">+23% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">892</div>
                <p className="text-xs text-muted-foreground">71.5% qualification rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campaign Conversions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">9.98% conversion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$105,600</div>
                <p className="text-xs text-muted-foreground">618% average ROI</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          {/* Scraping Performance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scraping Source Performance</CardTitle>
                <CardDescription>Lead quality and conversion by data source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scrapingPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#8884d8" name="Total Leads" />
                    <Bar dataKey="converted" fill="#82ca9d" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Source Distribution</CardTitle>
                <CardDescription>Where your best leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {leadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Scraping Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Active Scraping Jobs</CardTitle>
              <CardDescription>Current data collection operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
{[
                  { 
                    id: 1, 
                    name: 'Inc 5000 High Growth', 
                    status: 'running', 
                    progress: 78, 
                    nextRun: '2 hours',
                    frequency: 'Daily',
                    targetCount: 50,
                    filters: { minRevenue: '$1M+', location: 'US' }
                  },
                  { 
                    id: 2, 
                    name: 'Yelp Restaurant Prospects', 
                    status: 'running', 
                    progress: 45, 
                    nextRun: '6 hours',
                    frequency: 'Every 6 hours',
                    targetCount: 25,
                    filters: { rating: '4.0+', reviewCount: '50+' }
                  },
                  { 
                    id: 3, 
                    name: 'LinkedIn B2B Contacts', 
                    status: 'paused', 
                    progress: 0, 
                    nextRun: 'Manual',
                    frequency: 'Weekly',
                    targetCount: 100,
                    filters: { industry: 'Technology', employees: '50-200' }
                  },
                  { 
                    id: 4, 
                    name: 'Local Business Directory', 
                    status: 'completed', 
                    progress: 100, 
                    nextRun: '1 day',
                    frequency: 'Daily',
                    targetCount: 30,
                    filters: { hasWebsite: false, category: 'Services' }
                  }
                ].map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{job.name}</h4>
                        <Badge variant={job.status === 'running' ? 'default' : job.status === 'completed' ? 'secondary' : 'outline'}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={job.progress} className="h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Next run: {job.nextRun}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === 'running' ? (
                        <Button variant="outline" size="sm">
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                      ) : job.status === 'paused' ? (
                        <Button variant="outline" size="sm">
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restart
                        </Button>
                      )}
                      <Dialog open={isSettingsOpen && selectedJob?.id === job.id} onOpenChange={(open) => {
                        if (!open) {
                          setIsSettingsOpen(false);
                          setSelectedJob(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedJob(job);
                              setIsSettingsOpen(true);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Configure Scraping Job</DialogTitle>
                            <DialogDescription>
                              Adjust settings for "{job.name}" scraping job
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="frequency" className="text-right">
                                Frequency
                              </Label>
                              <Select defaultValue={job.frequency}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Hourly">Every Hour</SelectItem>
                                  <SelectItem value="Every 6 hours">Every 6 Hours</SelectItem>
                                  <SelectItem value="Daily">Daily</SelectItem>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                  <SelectItem value="Manual">Manual Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="target" className="text-right">
                                Target Count
                              </Label>
                              <Input
                                id="target"
                                defaultValue={job.targetCount}
                                className="col-span-3"
                                type="number"
                                min="1"
                                max="1000"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">
                                Auto-notify
                              </Label>
                              <Switch defaultChecked className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">
                                Active
                              </Label>
                              <Switch defaultChecked={job.status !== 'paused'} className="col-span-3" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => {
                              setIsSettingsOpen(false);
                              setSelectedJob(null);
                            }}>
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Weekly Scraping Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Scraping Funnel</CardTitle>
              <CardDescription>Lead progression through the sales funnel</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyScrapingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="scraped" stroke="#8884d8" name="Scraped" />
                  <Line type="monotone" dataKey="qualified" stroke="#82ca9d" name="Qualified" />
                  <Line type="monotone" dataKey="contacted" stroke="#ffc658" name="Contacted" />
                  <Line type="monotone" dataKey="converted" stroke="#ff7300" name="Converted" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Campaign ROI */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign ROI Performance</CardTitle>
              <CardDescription>Revenue return on campaign investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignROIData.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{campaign.campaign}</p>
                      <p className="text-xs text-muted-foreground">
                        Spent: ${campaign.spent.toLocaleString()} | Revenue: ${campaign.revenue.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={campaign.roi > 600 ? "default" : "secondary"}>
                      {campaign.roi}% ROI
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversions from Scraped Leads</CardTitle>
              <CardDescription>Successful deals closed from data scraping</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { company: 'Bella Vista Restaurant', source: 'Yelp', value: '$4,500', service: 'Local SEO Package', date: '2 days ago' },
                  { company: 'TechFlow Solutions', source: 'Inc 5000', value: '$12,000', service: 'Growth Marketing', date: '5 days ago' },
                  { company: 'Metro Bistro', source: 'Yelp', value: '$3,200', service: 'Social Media Management', date: '1 week ago' },
                  { company: 'DataSync Corp', source: 'LinkedIn', value: '$18,500', service: 'Enterprise SEO', date: '1 week ago' }
                ].map((conversion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{conversion.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {conversion.service} • Source: {conversion.source}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{conversion.value}</p>
                      <p className="text-xs text-muted-foreground">{conversion.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}