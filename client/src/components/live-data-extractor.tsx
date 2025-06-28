import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Play, 
  Pause, 
  Clock, 
  Target, 
  TrendingUp, 
  Database,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Activity
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface LiveScrapingJob {
  id: string;
  name: string;
  platform: string;
  isActive: boolean;
  schedule?: string;
  nextRun?: string;
  lastRun?: string;
}

interface JobMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalLeadsExtracted: number;
  averageLeadsPerRun: number;
  lastSuccessfulRun?: string;
}

export default function LiveDataExtractor() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [extractionInProgress, setExtractionInProgress] = useState(false);
  const queryClient = useQueryClient();

  // Audio notification function
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuL0/LSdSYFKHfH7N+QQAoUXrTn66hVFApGn+DymlAGAD+Nz9nqfwIJGHbF8NqEQwYWTKfc8OKfSBEOVqXd7s+FOQUJJ2Y1pJNKEgxGm9jR1rVjGwU7ldP0z5M/CDCa0fDQhEQFGT+m4+7JZyUCjXXh7I1GCBo+jdXqjQsNP4rVvbPKkwgJI2D0dYdDt2EQGmGVdgVPa2xqDw=');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors if audio fails
  };

  // Desktop notification function
  const showDesktopNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'lead-extraction'
      });
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // WebSocket connection for real-time monitoring
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Live monitoring WebSocket connected');
      setIsMonitoringActive(true);
      
      // Show monitoring active notification
      toast({
        title: "Live Monitoring Active",
        description: "Real-time lead extraction monitoring is now active",
        duration: 3000,
      });
      
      showDesktopNotification(
        "Starz Live Monitoring", 
        "Real-time lead extraction monitoring activated"
      );
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'lead_extraction_start') {
          setExtractionInProgress(true);
          
          toast({
            title: "Lead Extraction Started",
            description: `Extracting leads from ${data.platform}...`,
          });
          
          playNotificationSound();
          showDesktopNotification(
            "Lead Extraction Active", 
            `Now extracting leads from ${data.platform}`
          );
        }
        
        if (data.type === 'lead_extraction_complete') {
          setExtractionInProgress(false);
          
          const now = Date.now();
          // Only show notifications if it's been more than 30 seconds since last one
          if (now - lastNotificationTime > 30000) {
            setLastNotificationTime(now);
            
            toast({
              title: "Lead Extraction Complete",
              description: `Successfully extracted ${data.leadsCount || 0} leads from ${data.platform}`,
              duration: 5000,
            });
            
            playNotificationSound();
            showDesktopNotification(
              "Lead Extraction Complete", 
              `${data.leadsCount || 0} new leads extracted from ${data.platform}`
            );
          }
          
          // Refresh contact data
          queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
        }
        
        if (data.type === 'job_status_change') {
          toast({
            title: "Job Status Changed",
            description: `${data.jobName} is now ${data.status}`,
          });
        }
        
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Live monitoring WebSocket disconnected');
      setIsMonitoringActive(false);
      
      toast({
        title: "Live Monitoring Disconnected",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsMonitoringActive(false);
    };

    // Cleanup on component unmount
    return () => {
      socket.close();
    };
  }, [queryClient, lastNotificationTime]);

  // Fetch live scraping status
  const { data: scrapingStatus, isLoading } = useQuery({
    queryKey: ["/api/live-scraping/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch job metrics
  const { data: jobMetrics } = useQuery({
    queryKey: ["/api/live-scraping/metrics"],
    refetchInterval: 30000,
  });

  // Pause job mutation
  const pauseJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest("POST", `/api/live-scraping/jobs/${jobId}/pause`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-scraping/status"] });
      toast({
        title: "Job Paused",
        description: "Live data extraction has been paused for this job",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to pause the job",
        variant: "destructive",
      });
    },
  });

  // Resume job mutation
  const resumeJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest("POST", `/api/live-scraping/jobs/${jobId}/resume`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-scraping/status"] });
      toast({
        title: "Job Resumed",
        description: "Live data extraction has been resumed for this job",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resume the job",
        variant: "destructive",
      });
    },
  });

  // Test Bark scraping mutation
  const testBarkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/live-scraping/test-bark");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-scraping/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Bark.com Test Successful",
        description: `Extracted ${data.leadsExtracted} leads from Bark.com`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bark.com Test Failed",
        description: error.message || "Failed to extract data from Bark.com",
        variant: "destructive",
      });
    },
  });

  // Bark Dashboard scraping mutation
  const testBarkDashboardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/scraping-jobs/bark-dashboard", {
        sessionCookies: ""
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      
      // Play notification sound
      playNotificationSound();
      
      // Show desktop notification
      showDesktopNotification(
        "Bark Dashboard Extraction Complete",
        `Successfully extracted ${data.data.leadsExtracted} leads with ${data.data.dashboardMetrics.membershipLevel} membership`
      );
      
      toast({
        title: "Bark Dashboard Extraction Complete",
        description: `Successfully extracted ${data.data.leadsExtracted} leads from Bark sellers dashboard`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bark Dashboard Extraction Failed",
        description: error.message || "Failed to extract data from Bark Dashboard",
        variant: "destructive",
      });
    },
  });

  const getJobMetrics = (jobId: string): JobMetrics | null => {
    if (!jobMetrics) return null;
    const jobMetric = jobMetrics.find((m: any) => m.jobId === jobId);
    return jobMetric?.metrics || null;
  };

  const formatSchedule = (schedule: string) => {
    const scheduleMap: { [key: string]: string } = {
      "0 */2 * * *": "Every 2 hours",
      "0 9 * * *": "Daily at 9 AM",
      "0 */4 * * *": "Every 4 hours",
      "0 6 * * *": "Daily at 6 AM",
      "0 12 * * *": "Daily at 12 PM"
    };
    return scheduleMap[schedule] || schedule;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'bark':
        return <Target className="h-5 w-5" />;
      case 'businessinsider':
        return <TrendingUp className="h-5 w-5" />;
      case 'craigslist':
        return <Globe className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'bark':
        return 'bg-orange-100 text-orange-800';
      case 'businessinsider':
        return 'bg-blue-100 text-blue-800';
      case 'craigslist':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-16 w-auto crisp-edges"
          />
          <div>
            <h1 className="text-3xl font-bold text-black">Live Data Extraction</h1>
            <p className="text-lg text-black font-medium">More Traffik! More Sales!</p>
            <p className="text-gray-600">Continuous automated lead generation from multiple platforms</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Live Monitoring Status */}
          <Card className={`p-4 ${isMonitoringActive ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isMonitoringActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <p className="font-semibold text-sm">
                  {isMonitoringActive ? "Live Monitoring Active" : "Monitoring Disconnected"}
                </p>
                <p className="text-xs text-gray-600">
                  {extractionInProgress ? "Extracting leads..." : "Ready for extraction"}
                </p>
              </div>
            </div>
          </Card>

          <Button
            onClick={() => testBarkMutation.mutate()}
            disabled={testBarkMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {testBarkMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            Test Bark.com
          </Button>

          <Button
            onClick={() => testBarkDashboardMutation.mutate()}
            disabled={testBarkDashboardMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {testBarkDashboardMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Extract Dashboard
          </Button>
          
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-lg font-semibold text-green-600">
                {scrapingStatus?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {scrapingStatus?.activeJobs || 0} jobs running
            </p>
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold">{scrapingStatus?.activeJobs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Extractions</p>
                <p className="text-2xl font-bold">
                  {jobMetrics?.reduce((sum: number, job: any) => 
                    sum + (job.metrics?.totalLeadsExtracted || 0), 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {jobMetrics?.length > 0 
                    ? Math.round(
                        jobMetrics.reduce((sum: number, job: any) => 
                          sum + (job.metrics?.successfulRuns || 0), 0) /
                        jobMetrics.reduce((sum: number, job: any) => 
                          sum + (job.metrics?.totalRuns || 1), 0) * 100
                      )
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg per Run</p>
                <p className="text-2xl font-bold">
                  {jobMetrics?.length > 0 
                    ? Math.round(
                        jobMetrics.reduce((sum: number, job: any) => 
                          sum + (job.metrics?.averageLeadsPerRun || 0), 0) / jobMetrics.length
                      )
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Live Extraction Jobs
              </CardTitle>
              <CardDescription>
                Manage automated data extraction schedules across platforms
              </CardDescription>
            </div>
            <Button 
              onClick={() => queryClient.invalidateQueries()}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scrapingStatus?.jobs?.map((job: LiveScrapingJob) => {
              const metrics = getJobMetrics(job.id);
              
              return (
                <div key={job.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getPlatformColor(job.platform)}`}>
                        {getPlatformIcon(job.platform)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{job.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{job.schedule ? formatSchedule(job.schedule) : "Manual"}</span>
                          <Badge variant={job.isActive ? "default" : "secondary"}>
                            {job.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {job.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pauseJobMutation.mutate(job.id)}
                          disabled={pauseJobMutation.isPending}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => resumeJobMutation.mutate(job.id)}
                          disabled={resumeJobMutation.isPending}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>

                  {metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Runs</p>
                        <p className="text-lg font-semibold">{metrics.totalRuns}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="text-lg font-semibold">
                          {metrics.totalRuns > 0 
                            ? Math.round((metrics.successfulRuns / metrics.totalRuns) * 100)
                            : 0}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Leads</p>
                        <p className="text-lg font-semibold">{metrics.totalLeadsExtracted}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Avg per Run</p>
                        <p className="text-lg font-semibold">
                          {Math.round(metrics.averageLeadsPerRun || 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Last Success</p>
                        <p className="text-sm">
                          {metrics.lastSuccessfulRun 
                            ? new Date(metrics.lastSuccessfulRun).toLocaleDateString()
                            : "Never"
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {(!scrapingStatus?.jobs || scrapingStatus.jobs.length === 0) && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-600">No Active Jobs</h3>
              <p className="text-gray-500">Live data extraction engine is starting up...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Bark.com Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Providers</span>
                <Badge className="bg-orange-100 text-orange-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Schedule</span>
                <span className="text-sm text-gray-600">Every 2 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lead Quality</span>
                <span className="text-sm font-semibold text-green-600">High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Business Insider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Executive Leads</span>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Schedule</span>
                <span className="text-sm text-gray-600">Daily at 9 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lead Quality</span>
                <span className="text-sm font-semibold text-green-600">Premium</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              Craigslist Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Local Businesses</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Schedule</span>
                <span className="text-sm text-gray-600">Every 4 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lead Quality</span>
                <span className="text-sm font-semibold text-blue-600">Good</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-yellow-600" />
              Yellow Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Business Directory</span>
                <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Schedule</span>
                <span className="text-sm text-gray-600">Every 6 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lead Quality</span>
                <span className="text-sm font-semibold text-green-600">High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              White Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Professional Directory</span>
                <Badge className="bg-purple-100 text-purple-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Schedule</span>
                <span className="text-sm text-gray-600">Every 8 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lead Quality</span>
                <span className="text-sm font-semibold text-green-600">Premium</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}