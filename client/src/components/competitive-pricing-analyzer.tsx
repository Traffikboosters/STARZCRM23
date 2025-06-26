import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3, 
  Calculator,
  Zap,
  Crown,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingDown
} from "lucide-react";

interface ServicePricing {
  category: string;
  service: string;
  marketLow: number;
  marketHigh: number;
  suggested: number;
  premium: number;
  competitorAvg: number;
  profit: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  demand: 'Low' | 'Medium' | 'High';
  competition: 'Low' | 'Medium' | 'High';
  timeframe: string;
}

const pricingData: ServicePricing[] = [
  // SEO Services
  {
    category: "SEO & Digital Marketing",
    service: "Local SEO Package",
    marketLow: 500,
    marketHigh: 2500,
    suggested: 1200,
    premium: 1800,
    competitorAvg: 1100,
    profit: 75,
    difficulty: 'Medium',
    demand: 'High',
    competition: 'High',
    timeframe: "3-6 months"
  },
  {
    category: "SEO & Digital Marketing",
    service: "Google My Business Optimization",
    marketLow: 200,
    marketHigh: 800,
    suggested: 450,
    premium: 650,
    competitorAvg: 400,
    profit: 80,
    difficulty: 'Easy',
    demand: 'High',
    competition: 'Medium',
    timeframe: "2-4 weeks"
  },
  {
    category: "SEO & Digital Marketing",
    service: "Website SEO Audit",
    marketLow: 150,
    marketHigh: 500,
    suggested: 275,
    premium: 400,
    competitorAvg: 250,
    profit: 85,
    difficulty: 'Easy',
    demand: 'High',
    competition: 'High',
    timeframe: "1-2 weeks"
  },
  {
    category: "SEO & Digital Marketing",
    service: "Social Media Management",
    marketLow: 800,
    marketHigh: 3000,
    suggested: 1500,
    premium: 2200,
    competitorAvg: 1400,
    profit: 70,
    difficulty: 'Medium',
    demand: 'High',
    competition: 'High',
    timeframe: "Monthly"
  },
  
  // Web Development
  {
    category: "Web Development",
    service: "Business Website (5-10 pages)",
    marketLow: 1500,
    marketHigh: 8000,
    suggested: 3500,
    premium: 5500,
    competitorAvg: 3200,
    profit: 65,
    difficulty: 'Medium',
    demand: 'High',
    competition: 'High',
    timeframe: "4-8 weeks"
  },
  {
    category: "Web Development",
    service: "E-commerce Website",
    marketLow: 3000,
    marketHigh: 15000,
    suggested: 7500,
    premium: 12000,
    competitorAvg: 7000,
    profit: 60,
    difficulty: 'Hard',
    demand: 'High',
    competition: 'Medium',
    timeframe: "8-12 weeks"
  },
  {
    category: "Web Development",
    service: "Landing Page Design",
    marketLow: 500,
    marketHigh: 2500,
    suggested: 1200,
    premium: 1800,
    competitorAvg: 1000,
    profit: 75,
    difficulty: 'Easy',
    demand: 'High',
    competition: 'High',
    timeframe: "1-3 weeks"
  },
  
  // PPC & Advertising
  {
    category: "PPC & Advertising",
    service: "Google Ads Setup + Management",
    marketLow: 1000,
    marketHigh: 5000,
    suggested: 2200,
    premium: 3500,
    competitorAvg: 2000,
    profit: 70,
    difficulty: 'Medium',
    demand: 'High',
    competition: 'High',
    timeframe: "Monthly"
  },
  {
    category: "PPC & Advertising",
    service: "Facebook Ads Campaign",
    marketLow: 800,
    marketHigh: 3500,
    suggested: 1800,
    premium: 2800,
    competitorAvg: 1600,
    profit: 70,
    difficulty: 'Medium',
    demand: 'High',
    competition: 'High',
    timeframe: "Monthly"
  },
  
  // Content & Branding
  {
    category: "Content & Branding",
    service: "Logo Design + Brand Package",
    marketLow: 300,
    marketHigh: 2000,
    suggested: 850,
    premium: 1400,
    competitorAvg: 750,
    profit: 80,
    difficulty: 'Medium',
    demand: 'Medium',
    competition: 'High',
    timeframe: "2-4 weeks"
  },
  {
    category: "Content & Branding",
    service: "Content Writing (10 articles)",
    marketLow: 500,
    marketHigh: 2500,
    suggested: 1200,
    premium: 1800,
    competitorAvg: 1100,
    profit: 75,
    difficulty: 'Medium',
    demand: 'Medium',
    competition: 'High',
    timeframe: "3-4 weeks"
  }
];

export function CompetitivePricingAnalyzer() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("profit");

  const categories = ["All", ...Array.from(new Set(pricingData.map(item => item.category)))];
  
  const filteredData = selectedCategory === "All" 
    ? pricingData 
    : pricingData.filter(item => item.category === selectedCategory);

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "profit":
        return b.profit - a.profit;
      case "suggested":
        return b.suggested - a.suggested;
      case "demand":
        const demandOrder = { High: 3, Medium: 2, Low: 1 };
        return demandOrder[b.demand] - demandOrder[a.demand];
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "High": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Low": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "Low": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "High": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const averageProfit = Math.round(pricingData.reduce((sum, item) => sum + item.profit, 0) / pricingData.length);
  const totalRevenuePotential = pricingData.reduce((sum, item) => sum + item.suggested, 0);
  const highDemandServices = pricingData.filter(item => item.demand === 'High').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-green-600">{averageProfit}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue Potential</p>
                <p className="text-2xl font-bold">${totalRevenuePotential.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">High Demand Services</p>
                <p className="text-2xl font-bold text-green-600">{highDemandServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Service Categories</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pricing-table" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing-table">Pricing Analysis</TabsTrigger>
          <TabsTrigger value="market-comparison">Market Comparison</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing-table" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <span className="text-sm font-medium">Category:</span>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Sort by:</span>
              <Button
                variant={sortBy === "profit" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("profit")}
              >
                Profit
              </Button>
              <Button
                variant={sortBy === "suggested" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("suggested")}
              >
                Price
              </Button>
              <Button
                variant={sortBy === "demand" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("demand")}
              >
                Demand
              </Button>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="grid grid-cols-1 gap-4">
            {sortedData.map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                    <div className="lg:col-span-2">
                      <h3 className="font-semibold text-lg">{service.service}</h3>
                      <p className="text-sm text-muted-foreground">{service.category}</p>
                      <p className="text-xs text-muted-foreground mt-1">Delivery: {service.timeframe}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Market Range:</span>
                        <span className="text-sm font-medium">${service.marketLow} - ${service.marketHigh}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Competitor Avg:</span>
                        <span className="text-sm font-medium">${service.competitorAvg}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold text-primary">${service.suggested}</span>
                        <Badge variant="secondary">Suggested</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">${service.premium}</span>
                        <Badge variant="outline">Premium</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge className={getDifficultyColor(service.difficulty)}>
                        {service.difficulty}
                      </Badge>
                      <Badge className={getDemandColor(service.demand)}>
                        {service.demand} Demand
                      </Badge>
                      <Badge className={getCompetitionColor(service.competition)}>
                        {service.competition} Competition
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{service.profit}%</div>
                      <div className="text-sm text-muted-foreground">Profit Margin</div>
                      <Progress value={service.profit} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market-comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.slice(1).map(category => {
              const categoryData = pricingData.filter(item => item.category === category);
              const avgSuggested = Math.round(categoryData.reduce((sum, item) => sum + item.suggested, 0) / categoryData.length);
              const avgCompetitor = Math.round(categoryData.reduce((sum, item) => sum + item.competitorAvg, 0) / categoryData.length);
              const pricingAdvantage = ((avgSuggested - avgCompetitor) / avgCompetitor * 100).toFixed(1);
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Our Average Price</p>
                        <p className="text-2xl font-bold text-primary">${avgSuggested}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Market Average</p>
                        <p className="text-2xl font-bold">${avgCompetitor}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {parseFloat(pricingAdvantage) > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={parseFloat(pricingAdvantage) > 0 ? "text-green-600" : "text-red-600"}>
                        {pricingAdvantage}% {parseFloat(pricingAdvantage) > 0 ? "above" : "below"} market
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {categoryData.map((service, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{service.service}</span>
                          <span className="font-medium">${service.suggested}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* High-Profit Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  High-Profit Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pricingData
                  .filter(item => item.profit >= 75)
                  .sort((a, b) => b.profit - a.profit)
                  .slice(0, 5)
                  .map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <p className="text-sm text-muted-foreground">${service.suggested} • {service.timeframe}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {service.profit}% profit
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Quick Win Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Win Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pricingData
                  .filter(item => item.difficulty === 'Easy' && item.demand === 'High')
                  .sort((a, b) => b.suggested - a.suggested)
                  .map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <p className="text-sm text-muted-foreground">${service.suggested} • {service.timeframe}</p>
                      </div>
                      <div className="flex gap-1">
                        <Badge className="bg-green-100 text-green-800">Easy</Badge>
                        <Badge className="bg-blue-100 text-blue-800">High Demand</Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Market Gaps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Market Positioning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">Premium Positioning Strategy</p>
                    <p className="text-sm text-blue-600">
                      Your suggested prices are 8.5% above market average, positioning you as a premium service provider.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">High-Value Services</p>
                    <p className="text-sm text-green-600">
                      Focus on SEO and web development services - they offer the highest profit margins and strong demand.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-800">Competition Strategy</p>
                    <p className="text-sm text-yellow-600">
                      Consider competitive pricing for high-competition services like content writing and logo design.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Start with GMB Optimization</p>
                      <p className="text-sm text-muted-foreground">
                        Easy to deliver, high demand, $450 price point with 80% profit margin
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Package SEO Services</p>
                      <p className="text-sm text-muted-foreground">
                        Combine audit + optimization + GMB for $1,900 premium package
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Focus on Local Businesses</p>
                      <p className="text-sm text-muted-foreground">
                        Your pricing is competitive for local SEO and web development services
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Offer Retainer Packages</p>
                      <p className="text-sm text-muted-foreground">
                        Monthly management services provide recurring revenue streams
                      </p>
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