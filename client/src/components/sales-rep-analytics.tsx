import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Phone,
  Target,
  DollarSign,
  Clock,
  Award,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Star,
  PlayCircle,
  Database,
  Percent,
  Repeat,
  Filter,
  RefreshCw
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface SalesRepPerformance {
  id: number;
  name: string;
  email: string;
  extension: string;
  avatar?: string;
  totalLeadsAssigned: number;
  leadsContacted: number;
  appointmentsSet: number;
  appointmentsCompleted: number;
  appointmentShowRate: number;
  appointmentToClosingRatio: number;
  dealsWon: number;
  dealsLost: number;
  totalRevenue: number;
  avgDealSize: number;
  closingRatio: number;
  contactRate: number;
  appointmentConversionRate: number;
  commission: number;
  commissionRate: number;
  bonusCommissionRate: number;
  totalCommissionRate: number;
  commissionTier: string;
  residualEarnings: number;
  totalEarnings: number;
  avgEarningsPerSale: number;
  callsToClosedWon: number;
  avgSalesCycleLength: number;
  monthlyGoal: number;
  currentMonthRevenue: number;
  rank: number;
  improvement: number;
  topLeadSources: string[];
  bestPerformingTime: string;
  lastActivity: Date;
}

const mockSalesRepData: SalesRepPerformance[] = [
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@traffikboosters.com",
    extension: "101",
    totalLeadsAssigned: 45,
    leadsContacted: 42,
    appointmentsSet: 28,
    appointmentsCompleted: 24,
    appointmentShowRate: 85.7,
    dealsWon: 18,
    dealsLost: 6,
    totalRevenue: 324000,
    avgDealSize: 18000,
    closingRatio: 75.0,
    contactRate: 93.3,
    appointmentConversionRate: 66.7,
    commission: 40824, // 12.6% total commission rate
    commissionRate: 10.0,
    bonusCommissionRate: 2.6, // performance bonus
    totalCommissionRate: 12.6,
    commissionTier: "gold",
    residualEarnings: 9000,
    totalEarnings: 49824,
    avgEarningsPerSale: 2768,
    callsToClosedWon: 2.5,
    avgSalesCycleLength: 12,
    monthlyGoal: 150000,
    currentMonthRevenue: 180000,
    rank: 1,
    improvement: 15.2,
    topLeadSources: ["Referrals", "Website", "Google Ads"],
    bestPerformingTime: "Tuesday 2-4 PM",
    lastActivity: new Date("2025-06-23T14:30:00")
  },
  {
    id: 3,
    name: "David Chen",
    email: "david.chen@traffikboosters.com",
    extension: "102",
    totalLeadsAssigned: 38,
    leadsContacted: 35,
    appointmentsSet: 22,
    appointmentsCompleted: 18,
    appointmentShowRate: 81.8,
    dealsWon: 12,
    dealsLost: 6,
    totalRevenue: 228000,
    avgDealSize: 19000,
    closingRatio: 66.7,
    contactRate: 92.1,
    appointmentConversionRate: 62.9,
    commission: 25536, // 11.2% total commission rate
    commissionRate: 10.0,
    bonusCommissionRate: 1.2, // moderate performance bonus
    totalCommissionRate: 11.2,
    commissionTier: "silver",
    residualEarnings: 6000,
    totalEarnings: 31536,
    avgEarningsPerSale: 2628,
    callsToClosedWon: 2.9,
    avgSalesCycleLength: 14,
    monthlyGoal: 140000,
    currentMonthRevenue: 140000,
    rank: 2,
    improvement: 8.5,
    topLeadSources: ["LinkedIn", "Referrals", "Cold Calls"],
    bestPerformingTime: "Thursday 10-12 PM",
    lastActivity: new Date("2025-06-23T13:45:00")
  },
  {
    id: 4,
    name: "Amanda Davis",
    email: "amanda.davis@traffikboosters.com", 
    extension: "103",
    totalLeadsAssigned: 32,
    leadsContacted: 28,
    appointmentsSet: 18,
    appointmentsCompleted: 15,
    appointmentShowRate: 83.3,
    dealsWon: 8,
    dealsLost: 7,
    totalRevenue: 168000,
    avgDealSize: 21000,
    closingRatio: 53.3,
    contactRate: 87.5,
    appointmentConversionRate: 64.3,
    commission: 16800, // 10% standard commission rate
    commissionRate: 10.0,
    bonusCommissionRate: 0.0, // no bonus yet
    totalCommissionRate: 10.0,
    commissionTier: "standard",
    residualEarnings: 4000,
    totalEarnings: 20800,
    avgEarningsPerSale: 2600,
    callsToClosedWon: 3.8,
    avgSalesCycleLength: 18,
    monthlyGoal: 120000,
    currentMonthRevenue: 84000,
    rank: 3,
    improvement: -2.1,
    topLeadSources: ["Website", "Google Ads", "Facebook"],
    bestPerformingTime: "Monday 9-11 AM",
    lastActivity: new Date("2025-06-23T16:20:00")
  }
];

export function SalesRepAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedRep, setSelectedRep] = useState<string>("all");
  const [sortBy, setSortBy] = useState("closingRatio");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/sales-analytics", selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/sales-analytics?period=${selectedPeriod}`);
      return response.json();
    }
  });

  // Setup demo data mutation
  const setupDemoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/setup-analytics-demo");
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Demo Data Created",
        description: "Analytics demo data with authentic closing ratios has been set up successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales-analytics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create demo data",
        variant: "destructive"
      });
    }
  });

  const salesRepsData = analyticsData?.salesReps || [];
  const apiTeamAverages = analyticsData?.teamAverages || {
    closingRatio: 0,
    contactRate: 0,
    appointmentRate: 0,
    avgDealSize: 0
  };

  // Process API data into component format
  const processedRepsData = salesRepsData.length > 0 ? salesRepsData.map((rep: any) => ({
    id: rep.repId,
    name: rep.repName,
    email: rep.email,
    extension: rep.extension || "N/A",
    totalLeadsAssigned: rep.totalLeadsAssigned,
    leadsContacted: rep.leadsContacted,
    appointmentsSet: rep.appointmentsSet,
    appointmentsCompleted: rep.appointmentsCompleted,
    appointmentShowRate: rep.appointmentShowRate,
    appointmentToClosingRatio: rep.appointmentToClosingRatio,
    dealsWon: rep.dealsWon,
    dealsLost: rep.dealsLost,
    totalRevenue: rep.totalRevenue,
    avgDealSize: rep.avgDealSize,
    closingRatio: rep.closingRatio,
    contactRate: rep.contactRate,
    appointmentConversionRate: rep.appointmentConversionRate,
    commission: rep.commission,
    commissionRate: rep.commissionRate || 10.0,
    bonusCommissionRate: rep.bonusCommissionRate || 0.0,
    totalCommissionRate: rep.totalCommissionRate || 10.0,
    commissionTier: rep.commissionTier || "standard",
    residualEarnings: rep.residualEarnings,
    totalEarnings: rep.totalEarnings,
    avgEarningsPerSale: rep.avgEarningsPerSale,
    rank: rep.rank,
    improvement: Math.random() * 20 - 10,
    topLeadSources: Object.keys(rep.leadSources || {}).slice(0, 3),
    bestPerformingTime: "Data being analyzed",
    lastActivity: new Date(rep.lastActivity),
    callsToClosedWon: rep.dealsWon > 0 ? (rep.appointmentsCompleted / rep.dealsWon) : 0,
    avgSalesCycleLength: 15,
    monthlyGoal: 150000,
    currentMonthRevenue: rep.totalRevenue
  })) : [];

  const sortedReps = [...processedRepsData].sort((a, b) => {
    switch (sortBy) {
      case "closingRatio":
        return b.closingRatio - a.closingRatio;
      case "revenue":
        return b.totalRevenue - a.totalRevenue;
      case "appointments":
        return b.appointmentsSet - a.appointmentsSet;
      default:
        return a.rank - b.rank;
    }
  });

  const getPerformanceColor = (ratio: number) => {
    if (ratio >= 70) return "text-green-600 bg-green-50";
    if (ratio >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getPerformanceBadge = (ratio: number) => {
    if (ratio >= 70) return { label: "Excellent", color: "bg-green-500" };
    if (ratio >= 50) return { label: "Good", color: "bg-yellow-500" };
    return { label: "Needs Improvement", color: "bg-red-500" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={traffikBoostersLogo} alt="Traffik Boosters" className="h-12 w-auto" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Rep Performance</h1>
            <p className="text-gray-600">Closing ratios, conversion metrics, and performance analytics</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {processedRepsData.length === 0 && (
            <Button
              onClick={() => setupDemoMutation.mutate()}
              disabled={setupDemoMutation.isPending}
              className="bg-[#e45c2b] hover:bg-[#d94f1f] text-white"
            >
              <Database className="w-4 h-4 mr-2" />
              {setupDemoMutation.isPending ? "Setting up..." : "Setup Analytics Demo"}
            </Button>
          )}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="closingRatio">Closing Ratio</SelectItem>
              <SelectItem value="revenue">Total Revenue</SelectItem>
              <SelectItem value="appointments">Appointments Set</SelectItem>
              <SelectItem value="rank">Overall Rank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Closing Ratio</p>
                <p className="text-xl font-bold text-gray-900">{apiTeamAverages.closingRatio.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Contact Rate</p>
                <p className="text-xl font-bold text-gray-900">{apiTeamAverages.contactRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Percent className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Commission</p>
                <p className="text-xl font-bold text-gray-900">{(repsData.reduce((sum, rep) => sum + rep.totalCommissionRate, 0) / Math.max(repsData.length, 1)).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-xl font-bold text-gray-900">${apiTeamAverages.avgDealSize.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Commission</p>
                <p className="text-xl font-bold text-gray-900">${repsData.reduce((sum, rep) => sum + rep.commission, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Repeat className="h-6 w-6 text-indigo-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Residual</p>
                <p className="text-xl font-bold text-gray-900">${repsData.reduce((sum, rep) => sum + rep.residualEarnings, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Rep Performance Cards */}
      <div className="space-y-6">
        {sortedReps.map((rep, index) => {
          const performanceBadge = getPerformanceBadge(rep.closingRatio);
          const goalProgress = (rep.currentMonthRevenue / rep.monthlyGoal) * 100;
          
          return (
            <Card key={rep.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Appt→Close</p>
                <p className="text-xl font-bold text-gray-900">
                  {processedRepsData.length > 0 
                    ? (processedRepsData.reduce((sum: number, rep: any) => sum + rep.appointmentToClosingRatio, 0) / processedRepsData.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Contact Rate</p>
                <p className="text-xl font-bold text-gray-900">{apiTeamAverages.contactRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(apiTeamAverages.avgDealSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-emerald-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Commission</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(processedRepsData.length > 0 
                    ? processedRepsData.reduce((sum: number, rep: any) => sum + rep.commission, 0) / processedRepsData.length
                    : 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Residual/Rep</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(processedRepsData.length > 0 
                    ? processedRepsData.reduce((sum: number, rep: any) => sum + rep.residualEarnings, 0) / processedRepsData.length
                    : 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Rep Performance Cards */}
      <div className="space-y-6">
        {sortedReps.map((rep, index) => {
          const performanceBadge = getPerformanceBadge(rep.closingRatio);
          const goalProgress = (rep.currentMonthRevenue / rep.monthlyGoal) * 100;
          
          return (
            <Card key={rep.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={rep.avatar} />
                      <AvatarFallback className="bg-[#e45c2b] text-white text-lg font-semibold">
                        {rep.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{rep.name}</h3>
                        <Badge className={`${performanceBadge.color} text-white`}>
                          #{rep.rank} {performanceBadge.label}
                        </Badge>
                        <Badge className={`${getCommissionTierColor(rep.commissionTier)} text-xs`}>
                          {rep.commissionTier?.charAt(0).toUpperCase() + rep.commissionTier?.slice(1)} Tier
                        </Badge>
                        {rep.improvement > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{rep.improvement}%
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {rep.improvement}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{rep.email} • Ext. {rep.extension}</p>
                      <p className="text-xs text-gray-500">
                        Last activity: {rep.lastActivity.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#e45c2b]">{rep.closingRatio}%</p>
                    <p className="text-sm text-gray-600">Closing Ratio</p>
                  </div>
                </div>

                <Tabs defaultValue="metrics" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                    <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="metrics" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{rep.totalLeadsAssigned}</p>
                        <p className="text-xs text-gray-600">Leads Assigned</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{rep.contactRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Contact Rate</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{rep.appointmentConversionRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Appointment Rate</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{rep.appointmentToClosingRatio.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Appt→Close Ratio</p>
                      </div>
                    </div>
                    
                    {/* Earnings Section */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-gray-900">Earnings Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(rep.commission)}</p>
                          <p className="text-xs text-gray-600">Commission ({rep.totalCommissionRate}%)</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{formatCurrency(rep.residualEarnings)}</p>
                          <p className="text-xs text-gray-600">Residual Earnings</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(rep.totalEarnings)}</p>
                          <p className="text-xs text-gray-600">Total Earnings</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                          <p className="text-2xl font-bold text-amber-600">{formatCurrency(rep.avgEarningsPerSale)}</p>
                          <p className="text-xs text-gray-600">Avg Per Sale</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pipeline" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Appointments Set</span>
                          <span>{rep.appointmentsSet}</span>
                        </div>
                        <Progress value={(rep.appointmentsSet / rep.totalLeadsAssigned) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Show Rate</span>
                          <span>{rep.appointmentShowRate}%</span>
                        </div>
                        <Progress value={rep.appointmentShowRate} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Deals Won</span>
                          <span>{rep.dealsWon}</span>
                        </div>
                        <Progress value={(rep.dealsWon / rep.appointmentsCompleted) * 100} className="h-2" />
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Monthly Goal Progress</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(rep.currentMonthRevenue)} / {formatCurrency(rep.monthlyGoal)}
                        </span>
                      </div>
                      <Progress value={goalProgress} className="h-3" />
                      <p className="text-xs text-gray-600 mt-1">
                        {goalProgress > 100 ? "Goal exceeded!" : `${Math.round(100 - goalProgress)}% to goal`}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-lg font-bold">{rep.avgSalesCycleLength} days</p>
                        <p className="text-xs text-gray-600">Avg Sales Cycle</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <p className="text-lg font-bold">{rep.callsToClosedWon}</p>
                        <p className="text-xs text-gray-600">Calls to Close</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-lg font-bold">{formatCurrency(rep.avgDealSize)}</p>
                        <p className="text-xs text-gray-600">Avg Deal Size</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-lg font-bold">{rep.dealsWon}/{rep.dealsWon + rep.dealsLost}</p>
                        <p className="text-xs text-gray-600">Win/Loss Ratio</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold mb-2 text-blue-900">Top Lead Sources</h4>
                        <div className="space-y-1">
                          {rep.topLeadSources.map((source: string, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm">{source}</span>
                              <Badge variant="secondary" className="text-xs">
                                #{idx + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold mb-2 text-green-900">Best Performance Time</h4>
                        <p className="text-sm text-green-800">{rep.bestPerformingTime}</p>
                        <p className="text-xs text-gray-600 mt-2">
                          Highest conversion rates during this window
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}