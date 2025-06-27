import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Activity, 
  Clock, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  MousePointer,
  Wifi,
  WifiOff,
  Circle,
  TrendingUp,
  BarChart3,
  Timer,
  Target,
  Trophy
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserSession {
  id: number;
  userId: number;
  sessionId: string;
  loginTime: string;
  lastActivity: string;
  logoutTime?: string;
  isActive: boolean;
  duration?: number;
  activityCount: number;
  pagesVisited: string[];
  featuresUsed: string[];
  leadsInteracted: number[];
  callsMade: number;
  emailsSent: number;
  appointmentsScheduled: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
  };
}

interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  activityDetails: any;
  targetId?: number;
  targetType?: string;
  page?: string;
  feature?: string;
  timestamp: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface EngagementStats {
  totalSalesReps: number;
  currentlyActive: number;
  avgSessionDuration: number;
  totalActivitiesToday: number;
  topPerformer: {
    name: string;
    activityCount: number;
  };
}

export default function SalesRepEngagement() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');

  const { data: activeSessions, refetch: refetchSessions } = useQuery({
    queryKey: ['/api/user-sessions/active'],
    refetchInterval: refreshInterval,
  });

  const { data: recentActivity, refetch: refetchActivity } = useQuery({
    queryKey: ['/api/user-activity/recent', selectedTimeframe],
    refetchInterval: refreshInterval,
  });

  const { data: engagementStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/engagement/stats', selectedTimeframe],
    refetchInterval: refreshInterval,
  });

  const sessions = Array.isArray(activeSessions) ? activeSessions : [];
  const activities = Array.isArray(recentActivity) ? recentActivity : [];
  const stats = engagementStats || {
    totalSalesReps: 0,
    currentlyActive: 0,
    avgSessionDuration: 0,
    totalActivitiesToday: 0,
    topPerformer: { name: 'N/A', activityCount: 0 }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'login': return <Wifi className="h-4 w-4" />;
      case 'logout': return <WifiOff className="h-4 w-4" />;
      case 'contact_view': return <Eye className="h-4 w-4" />;
      case 'call_made': return <Phone className="h-4 w-4" />;
      case 'email_sent': return <Mail className="h-4 w-4" />;
      case 'appointment_scheduled': return <Calendar className="h-4 w-4" />;
      case 'page_view': return <MousePointer className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'login': return 'text-green-600';
      case 'logout': return 'text-gray-600';
      case 'contact_view': return 'text-blue-600';
      case 'call_made': return 'text-orange-600';
      case 'email_sent': return 'text-purple-600';
      case 'appointment_scheduled': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const manualRefresh = () => {
    refetchSessions();
    refetchActivity();
    refetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Rep Engagement</h2>
          <p className="text-neutral-light">Real-time monitoring of sales team activity on Starz platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={manualRefresh}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Circle className="h-2 w-2 mr-1 fill-current" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Reps</CardTitle>
            <Users className="h-4 w-4 text-neutral-light" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSalesReps}</div>
            <p className="text-xs text-neutral-light">
              Registered sales representatives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.currentlyActive}</div>
            <p className="text-xs text-neutral-light">
              Online right now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-neutral-light" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgSessionDuration)}</div>
            <p className="text-xs text-neutral-light">
              Average session duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-light" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivitiesToday}</div>
            <p className="text-xs text-neutral-light">
              Total platform interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="active-sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active-sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="active-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="h-5 w-5 mr-2 text-green-600" />
                Active Sessions ({sessions.length})
              </CardTitle>
              <CardDescription>
                Sales representatives currently logged into Starz platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-neutral-light">
                  <WifiOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No sales reps currently active</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session: UserSession) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="font-medium">
                            {session.user.firstName} {session.user.lastName}
                          </p>
                          <p className="text-sm text-neutral-light">
                            {session.user.role} • {session.user.department}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{session.activityCount}</p>
                          <p className="text-neutral-light">Actions</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{session.callsMade}</p>
                          <p className="text-neutral-light">Calls</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{session.emailsSent}</p>
                          <p className="text-neutral-light">Emails</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{formatTimeAgo(session.lastActivity)}</p>
                          <p className="text-neutral-light">Last Active</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">
                            {session.duration ? formatDuration(session.duration) : formatTimeAgo(session.loginTime)}
                          </p>
                          <p className="text-neutral-light">Session Time</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest actions performed by sales representatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.slice(0, 20).map((activity: UserActivity, index) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className={`${getActivityColor(activity.activityType)}`}>
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.user.firstName} {activity.user.lastName}
                        </span>
                        <span className="text-neutral-light ml-1">
                          {activity.activityType.replace('_', ' ')}
                        </span>
                        {activity.feature && (
                          <span className="text-neutral-light"> in {activity.feature}</span>
                        )}
                      </p>
                      {activity.page && (
                        <p className="text-xs text-neutral-light">Page: {activity.page}</p>
                      )}
                    </div>
                    <div className="text-xs text-neutral-light">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Sales rep engagement and productivity metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Top Performer */}
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Top Performer Today</p>
                    <p className="text-2xl font-bold">{stats.topPerformer.name}</p>
                    <p className="text-sm text-neutral-light">
                      {stats.topPerformer.activityCount} platform interactions
                    </p>
                  </div>
                  <Trophy className="h-12 w-12 text-primary opacity-20" />
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Platform Adoption</span>
                    <span className="text-sm">
                      {stats.currentlyActive}/{stats.totalSalesReps}
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalSalesReps > 0 ? (stats.currentlyActive / stats.totalSalesReps) * 100 : 0} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Daily Activity Goal</span>
                    <span className="text-sm">{Math.min(stats.totalActivitiesToday, 100)}/100</span>
                  </div>
                  <Progress 
                    value={Math.min(stats.totalActivitiesToday, 100)} 
                    className="h-2" 
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{stats.avgSessionDuration}</p>
                  <p className="text-sm text-neutral-light">Avg Session (min)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.currentlyActive}</p>
                  <p className="text-sm text-neutral-light">Active Now</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalActivitiesToday}</p>
                  <p className="text-sm text-neutral-light">Activities Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}