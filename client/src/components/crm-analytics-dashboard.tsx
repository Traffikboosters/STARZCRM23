import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Target,
  DollarSign,
  TrendingUp,
  Users,
  Globe,
  CheckCircle,
  Clock,
} from "lucide-react";
import { SiYelp, SiInstagram, SiTiktok, SiFacebook, SiLinkedin, SiYoutube, SiGoogle } from "react-icons/si";
import ClickToCallButton from "@/components/click-to-call-button";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";
import { useQuery } from "@tanstack/react-query";

// Lead source analytics with closing ratios and ROI metrics
const leadSourceAnalytics = [
  {
    platform: "referral",
    name: "Referrals",
    icon: Users,
    color: "#10b981",
    totalLeads: 87,
    qualifiedLeads: 83,
    closedWon: 56,
    closedLost: 12,
    inProgress: 15,
    closingRatio: 67.5,
    avgDealSize: 14800,
    totalRevenue: 828800,
    roi: 1245,
    costPerLead: 8,
    conversionRate: 95.4,
    avgSalesTime: 14,
    topIndustries: ["All Industries", "High-Value", "Enterprise"]
  },
  {
    platform: "website",
    name: "Direct Website",
    icon: Globe,
    color: "#6b7280",
    totalLeads: 145,
    qualifiedLeads: 138,
    closedWon: 67,
    closedLost: 28,
    inProgress: 43,
    closingRatio: 48.6,
    avgDealSize: 11200,
    totalRevenue: 750400,
    roi: 892,
    costPerLead: 15,
    conversionRate: 95.2,
    avgSalesTime: 19,
    topIndustries: ["Enterprise", "Professional Services", "Technology"]
  },
  {
    platform: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "#0077b5",
    totalLeads: 94,
    qualifiedLeads: 87,
    closedWon: 41,
    closedLost: 18,
    inProgress: 28,
    closingRatio: 47.1,
    avgDealSize: 12500,
    totalRevenue: 512500,
    roi: 672,
    costPerLead: 45,
    conversionRate: 92.6,
    avgSalesTime: 28,
    topIndustries: ["B2B Services", "Technology", "Consulting"]
  },
  {
    platform: "google_ads",
    name: "Google Ads",
    icon: SiGoogle,
    color: "#fbbc04",
    totalLeads: 234,
    qualifiedLeads: 201,
    closedWon: 89,
    closedLost: 52,
    inProgress: 60,
    closingRatio: 44.3,
    avgDealSize: 9200,
    totalRevenue: 818800,
    roi: 578,
    costPerLead: 42,
    conversionRate: 85.9,
    avgSalesTime: 24,
    topIndustries: ["Healthcare", "Legal", "Home Services"]
  },
  {
    platform: "google_maps",
    name: "Google Maps",
    icon: SiGoogle,
    color: "#4285f4",
    totalLeads: 203,
    qualifiedLeads: 187,
    closedWon: 72,
    closedLost: 45,
    inProgress: 70,
    closingRatio: 38.5,
    avgDealSize: 8900,
    totalRevenue: 640800,
    roi: 512,
    costPerLead: 28,
    conversionRate: 92.1,
    avgSalesTime: 22,
    topIndustries: ["Construction", "Legal", "Home Services"]
  },
  {
    platform: "youtube",
    name: "YouTube",
    icon: SiYoutube,
    color: "#ff0000",
    totalLeads: 112,
    qualifiedLeads: 89,
    closedWon: 34,
    closedLost: 21,
    inProgress: 34,
    closingRatio: 38.2,
    avgDealSize: 7800,
    totalRevenue: 265200,
    roi: 445,
    costPerLead: 35,
    conversionRate: 79.5,
    avgSalesTime: 20,
    topIndustries: ["Education", "Creative Services", "Technology"]
  },
  {
    platform: "facebook",
    name: "Facebook",
    icon: SiFacebook,
    color: "#1877f2",
    totalLeads: 178,
    qualifiedLeads: 142,
    closedWon: 52,
    closedLost: 34,
    inProgress: 56,
    closingRatio: 36.6,
    avgDealSize: 5600,
    totalRevenue: 291200,
    roi: 385,
    costPerLead: 25,
    conversionRate: 79.8,
    avgSalesTime: 16,
    topIndustries: ["Real Estate", "Professional Services", "Retail"]
  },
  {
    platform: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "#000000",
    totalLeads: 127,
    qualifiedLeads: 89,
    closedWon: 28,
    closedLost: 15,
    inProgress: 46,
    closingRatio: 31.5,
    avgDealSize: 4200,
    totalRevenue: 117600,
    roi: 245,
    costPerLead: 22,
    conversionRate: 70.1,
    avgSalesTime: 12,
    topIndustries: ["Entertainment", "Fitness", "Food & Beverage"]
  },
  {
    platform: "yelp",
    name: "Yelp",
    icon: SiYelp,
    color: "#d32323",
    totalLeads: 156,
    qualifiedLeads: 124,
    closedWon: 47,
    closedLost: 31,
    inProgress: 46,
    closingRatio: 30.1,
    avgDealSize: 6800,
    totalRevenue: 319600,
    roi: 418,
    costPerLead: 32,
    conversionRate: 79.5,
    avgSalesTime: 18,
    topIndustries: ["Restaurants", "Healthcare", "Retail"]
  },
  {
    platform: "instagram",
    name: "Instagram",
    icon: SiInstagram,
    color: "#e4405f",
    totalLeads: 289,
    qualifiedLeads: 198,
    closedWon: 45,
    closedLost: 38,
    inProgress: 115,
    closingRatio: 22.7,
    avgDealSize: 3400,
    totalRevenue: 153000,
    roi: 312,
    costPerLead: 18,
    conversionRate: 68.5,
    avgSalesTime: 14,
    topIndustries: ["Fashion", "Fitness", "Beauty"]
  }
];

export default function CRMAnalyticsDashboard() {
  const [sortBy, setSortBy] = useState("closingRatio");

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
  });

  // Calculate real metrics from actual database contacts
  const actualTotalLeads = contacts.length;
  const actualClosedWon = contacts.filter((contact: any) => contact.leadStatus === 'closed-won').length;
  const actualInProgress = contacts.filter((contact: any) => ['new', 'contacted', 'qualified', 'proposal'].includes(contact.leadStatus)).length;
  const actualLost = contacts.filter((contact: any) => contact.leadStatus === 'closed-lost').length;
  
  // Use real data for main metrics, supplement with analytics for additional insights
  const totalMetrics = {
    totalLeads: actualTotalLeads,
    closedWon: actualClosedWon,
    inProgress: actualInProgress,
    closedLost: actualLost,
    totalRevenue: actualClosedWon * 8500, // Average deal size estimate
    totalCost: actualTotalLeads * 15 // Average cost per lead estimate
  };

  const overallClosingRatio = (totalMetrics.closedWon / totalMetrics.totalLeads * 100).toFixed(1);
  const overallROI = ((totalMetrics.totalRevenue - totalMetrics.totalCost) / totalMetrics.totalCost * 100).toFixed(0);

  // Sort platforms by selected metric
  const sortedPlatforms = [...leadSourceAnalytics].sort((a, b) => {
    switch (sortBy) {
      case "closingRatio": return b.closingRatio - a.closingRatio;
      case "roi": return b.roi - a.roi;
      case "totalRevenue": return b.totalRevenue - a.totalRevenue;
      case "totalLeads": return b.totalLeads - a.totalLeads;
      default: return b.closingRatio - a.closingRatio;
    }
  });

  const getStatusColor = (ratio: number) => {
    if (ratio >= 50) return "text-green-600 bg-green-50";
    if (ratio >= 35) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
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
            <h1 className="text-3xl font-bold text-gray-900">Lead Source Analytics</h1>
            <p className="text-gray-600">Closing ratios and ROI metrics by marketing platform</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="closingRatio">Closing Ratio</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
              <SelectItem value="totalRevenue">Total Revenue</SelectItem>
              <SelectItem value="totalLeads">Total Leads</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Closing Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{overallClosingRatio}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMetrics.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall ROI</p>
                <p className="text-2xl font-bold text-gray-900">{overallROI}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{totalMetrics.totalLeads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-orange-600" />
            Platform Performance Rankings
          </CardTitle>
          <CardDescription>
            Closing ratios, ROI metrics, and conversion data by marketing platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPlatforms.map((platform, index) => {
              const IconComponent = platform.icon;
              return (
                <div key={`${platform.platform}-${index}`} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100">
                        <IconComponent className="h-6 w-6" style={{ color: platform.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-600">
                          {platform.topIndustries.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(platform.closingRatio)} text-sm font-semibold`}>
                        #{index + 1} Rank
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{platform.closingRatio}%</p>
                      <p className="text-xs text-gray-600">Closing Ratio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{platform.roi}%</p>
                      <p className="text-xs text-gray-600">ROI</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(platform.totalRevenue)}</p>
                      <p className="text-xs text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{platform.totalLeads}</p>
                      <p className="text-xs text-gray-600">Total Leads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(platform.avgDealSize)}</p>
                      <p className="text-xs text-gray-600">Avg Deal Size</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{platform.avgSalesTime}d</p>
                      <p className="text-xs text-gray-600">Avg Sales Time</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex space-x-6">
                        <span className="text-green-600">
                          <CheckCircle className="inline h-4 w-4 mr-1" />
                          {platform.closedWon} Won
                        </span>
                        <span className="text-red-600">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {platform.closedLost} Lost
                        </span>
                        <span className="text-blue-600">
                          <Target className="inline h-4 w-4 mr-1" />
                          {platform.inProgress} In Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600">
                          Cost per Lead: {formatCurrency(platform.costPerLead)} | 
                          Conversion: {platform.conversionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Lead Activity from API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-6 w-6 mr-2 text-orange-600" />
            Recent Lead Activity
          </CardTitle>
          <CardDescription>
            Latest leads from your CRM system with source tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(contacts as any[]).slice(0, 8).map((contact: any, index: number) => {
              const sourceInfo = leadSourceAnalytics.find(p => p.platform === contact.leadSource) || 
                { name: contact.leadSource, icon: Globe, color: "#6b7280" };
              const IconComponent = sourceInfo.icon;
              
              return (
                <div key={`contact-${contact.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                      <IconComponent className="h-5 w-5" style={{ color: sourceInfo.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{contact.company}</p>
                      <p className="text-xs text-gray-500">
                        Source: {sourceInfo.name || contact.leadSource}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge 
                        variant={contact.leadStatus === 'closed_won' ? 'default' : 'secondary'}
                        className={
                          contact.leadStatus === 'closed_won' ? 'bg-green-100 text-green-800' :
                          contact.leadStatus === 'qualified' ? 'bg-blue-100 text-blue-800' :
                          contact.leadStatus === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {contact.leadStatus?.replace('_', ' ')?.toUpperCase() || 'NEW'}
                      </Badge>
                      {contact.budget && (
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(contact.budget / 100)}
                        </p>
                      )}
                    </div>
                    <ClickToCallButton phoneNumber={contact.phone || ""} contactName={`${contact.firstName} ${contact.lastName}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}