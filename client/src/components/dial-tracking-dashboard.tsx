import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Phone,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Timer,
  CheckCircle,
  XCircle,
  Voicemail,
  PhoneOff,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface DialStats {
  date: string;
  totalDials: number;
  connectedCalls: number;
  voicemails: number;
  noAnswers: number;
  busySignals: number;
  failedDials: number;
  totalTalkTime: number;
  connectRate: number;
  avgDialsPerHour: number;
  peakHour: string;
}

interface HourlyData {
  hour: number;
  timeLabel: string;
  totalDials: number;
  connected: number;
  voicemails: number;
  noAnswers: number;
  connectRate: number;
}

interface PerformanceMetrics {
  period: string;
  totalDials: number;
  avgDialsPerDay: number;
  connectRate: number;
  bestDay: { date: string; dials: number };
  consistencyScore: number;
  trend: string;
  weekdayPerformance: Array<{
    day: string;
    totalDials: number;
    connectRate: number;
  }>;
}

export function DialTrackingDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedUserId, setSelectedUserId] = useState<string>("current");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get daily dial statistics
  const { data: dailyStats, isLoading: dailyLoading } = useQuery({
    queryKey: ["/api/dial-tracking/daily-stats", selectedDate, selectedUserId],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: selectedDate,
        ...(selectedUserId !== "current" && { userId: selectedUserId })
      });
      const response = await fetch(`/api/dial-tracking/daily-stats?${params}`);
      return response.json();
    }
  });

  // Get hourly breakdown
  const { data: hourlyData, isLoading: hourlyLoading } = useQuery({
    queryKey: ["/api/dial-tracking/hourly-breakdown", selectedDate, selectedUserId],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: selectedDate,
        ...(selectedUserId !== "current" && { userId: selectedUserId })
      });
      const response = await fetch(`/api/dial-tracking/hourly-breakdown?${params}`);
      return response.json();
    }
  });

  // Get performance metrics
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dial-tracking/performance-metrics", selectedPeriod, selectedUserId],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedUserId !== "current" && { userId: selectedUserId })
      });
      const response = await fetch(`/api/dial-tracking/performance-metrics?${params}`);
      return response.json();
    }
  });

  // Log dial mutation for testing
  const logDialMutation = useMutation({
    mutationFn: async (dialData: { phoneNumber: string; dialResult: string; notes?: string }) => {
      return apiRequest("POST", "/api/dial-tracking/log-dial", dialData);
    },
    onSuccess: () => {
      toast({
        title: "Dial Logged",
        description: "Call attempt has been recorded with timestamp"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dial-tracking"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Log Dial",
        description: error.message || "Failed to record dial attempt",
        variant: "destructive"
      });
    }
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "connected": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "voicemail": return <Voicemail className="w-4 h-4 text-blue-600" />;
      case "no_answer": return <PhoneOff className="w-4 h-4 text-yellow-600" />;
      case "busy": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Phone className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "decreasing": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  // Demo dial logging for testing
  const logTestDial = (result: string) => {
    const testNumber = "+1-555-" + Math.floor(Math.random() * 9000 + 1000);
    logDialMutation.mutate({
      phoneNumber: testNumber,
      dialResult: result,
      notes: `Test dial with ${result} result at ${new Date().toLocaleTimeString()}`
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={traffikBoostersLogo} alt="Traffik Boosters" className="h-12 w-auto" />
          <div>
            <h1 className="text-3xl font-bold text-black">Starz Dial Tracking KPIs</h1>
            <p className="text-gray-600">Comprehensive calling metrics with hourly/daily logging and timestamps</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Test Dial Buttons */}
      <Card className="border-[#e45c2b] bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-black">Test Dial Logging</h3>
              <p className="text-sm text-gray-600">Log test dials to see tracking in action</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => logTestDial("connected")}
                disabled={logDialMutation.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Connected
              </Button>
              <Button
                onClick={() => logTestDial("voicemail")}
                disabled={logDialMutation.isPending}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Voicemail className="w-4 h-4 mr-1" />
                Voicemail
              </Button>
              <Button
                onClick={() => logTestDial("no_answer")}
                disabled={logDialMutation.isPending}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <PhoneOff className="w-4 h-4 mr-1" />
                No Answer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily Metrics</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Breakdown</TabsTrigger>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          {/* Daily Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-[#e45c2b]" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Total Dials</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailyLoading ? "..." : dailyStats?.totalDials || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Connected</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailyLoading ? "..." : dailyStats?.connectedCalls || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Target className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Connect Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailyLoading ? "..." : `${dailyStats?.connectRate || 0}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Timer className="h-6 w-6 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Talk Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailyLoading ? "..." : formatTime(dailyStats?.totalTalkTime || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Peak Hour</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailyLoading ? "..." : dailyStats?.peakHour || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Dial Results Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getResultIcon("connected")}
                      <span>Connected Calls</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{dailyStats?.connectedCalls || 0}</span>
                      <Badge variant="secondary" className="ml-2">
                        {dailyStats?.totalDials > 0 ? Math.round((dailyStats.connectedCalls / dailyStats.totalDials) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getResultIcon("voicemail")}
                      <span>Voicemails</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{dailyStats?.voicemails || 0}</span>
                      <Badge variant="secondary" className="ml-2">
                        {dailyStats?.totalDials > 0 ? Math.round((dailyStats.voicemails / dailyStats.totalDials) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getResultIcon("no_answer")}
                      <span>No Answers</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{dailyStats?.noAnswers || 0}</span>
                      <Badge variant="secondary" className="ml-2">
                        {dailyStats?.totalDials > 0 ? Math.round((dailyStats.noAnswers / dailyStats.totalDials) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getResultIcon("busy")}
                      <span>Busy Signals</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{dailyStats?.busySignals || 0}</span>
                      <Badge variant="secondary" className="ml-2">
                        {dailyStats?.totalDials > 0 ? Math.round((dailyStats.busySignals / dailyStats.totalDials) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Dials/Hour</span>
                    <span className="font-semibold">{dailyStats?.avgDialsPerHour || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Activity</span>
                    <span className="font-semibold">{dailyStats?.peakHour || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Talk Time</span>
                    <span className="font-semibold">{formatTime(dailyStats?.totalTalkTime || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="font-semibold">{selectedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Dial Activity - {selectedDate}</CardTitle>
              <CardDescription>Timestamped dial tracking throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              {hourlyLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-[#e45c2b] border-t-transparent rounded-full" />
                </div>
              ) : hourlyData && hourlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeLabel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalDials" fill="#e45c2b" name="Total Dials" />
                    <Bar dataKey="connected" fill="#10b981" name="Connected" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No dial activity recorded for this date
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hourly Detail Table */}
          {hourlyData && hourlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hourly Breakdown Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Hour</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Total Dials</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Connected</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Voicemails</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">No Answer</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Connect Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hourlyData.map((hour: HourlyData) => (
                        <tr key={hour.hour} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">{hour.timeLabel}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{hour.totalDials}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-green-600">{hour.connected}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-blue-600">{hour.voicemails}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-yellow-600">{hour.noAnswers}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{hour.connectRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-[#e45c2b]" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Total Dials ({selectedPeriod})</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metricsLoading ? "..." : performanceMetrics?.totalDials || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Avg/Day</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metricsLoading ? "..." : performanceMetrics?.avgDialsPerDay || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  {performanceMetrics && getTrendIcon(performanceMetrics.trend)}
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Trend</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metricsLoading ? "..." : performanceMetrics?.trend || "stable"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Target className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Consistency</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metricsLoading ? "..." : `${performanceMetrics?.consistencyScore || 0}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Best Performance */}
          {performanceMetrics?.bestDay && (
            <Card>
              <CardHeader>
                <CardTitle>Best Performance Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-semibold">{performanceMetrics.bestDay.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dials Made</p>
                    <p className="text-lg font-semibold">{performanceMetrics.bestDay.dials}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekday Performance */}
          {performanceMetrics?.weekdayPerformance && performanceMetrics.weekdayPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weekday Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceMetrics.weekdayPerformance.map((day: any) => (
                    <div key={day.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{day.day}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{day.totalDials} dials</span>
                        <Badge variant={day.connectRate >= 30 ? "default" : "secondary"}>
                          {day.connectRate}% connect rate
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}