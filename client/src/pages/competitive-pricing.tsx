import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { CompetitivePricingAnalyzer } from "@/components/competitive-pricing-analyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Award, 
  Target,
  Download,
  Share,
  BookOpen
} from "lucide-react";

export default function CompetitivePricingPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/users/me']
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies']
  });

  const company = Array.isArray(companies) ? companies[0] : null;

  // Pricing strategy insights
  const pricingInsights = [
    {
      title: "Premium Positioning",
      description: "Your pricing is positioned 8.5% above market average",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "High-Profit Services",
      description: "GMB optimization and SEO audits offer 80%+ profit margins",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Market Opportunity",
      description: "Local SEO services show highest demand with competitive rates",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Revenue Potential",
      description: "Combined service packages can reach $25K+ monthly recurring",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab="competitive-pricing"
        onCreateEvent={() => {}}
        onStartVideoCall={() => {}}
        onTabChange={() => {}}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Competitive Pricing Analysis</h1>
              <p className="text-gray-600 mt-2">Strategic pricing recommendations based on market research and competitor analysis</p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share Analysis
              </Button>
              <Button className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Pricing Guide
              </Button>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricingInsights.map((insight, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg ${insight.bgColor} mb-3`}>
                    <insight.icon className={`h-5 w-5 ${insight.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Strategy Alert */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calculator className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Pricing Strategy Recommendation</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Based on market analysis, your services are competitively priced with strong profit margins. 
                    Focus on high-demand, easy-to-deliver services like GMB optimization and SEO audits to maximize profitability.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge className="bg-orange-100 text-orange-800">Premium Positioning</Badge>
                    <Badge className="bg-green-100 text-green-800">High Profit Margins</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Market Competitive</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Pricing Analyzer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Comprehensive Pricing Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompetitivePricingAnalyzer />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}