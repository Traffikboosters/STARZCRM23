import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { 
  Building, 
  DollarSign, 
  MapPin, 
  Users, 
  Database,
  TrendingUp,
  Zap,
  Target,
  RefreshCw
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface ZoomInfoSearchParams {
  industry?: string;
  location?: string;
  city?: string;
  state?: string;
  minRevenue?: string;
  maxRevenue?: string;
  companySize?: string;
}

export default function ZoomInfoScraper() {
  const [activeTab, setActiveTab] = useState<'industry' | 'revenue' | 'location'>('industry');
  const [searchParams, setSearchParams] = useState<ZoomInfoSearchParams>({});

  // Industry search mutation
  const industryMutation = useMutation({
    mutationFn: async (params: { industry: string; location?: string }) => {
      return await apiRequest("POST", "/api/scraping-jobs/zoominfo-industry", params);
    },
    onSuccess: (data) => {
      toast({
        title: "ZoomInfo Industry Extraction Complete",
        description: `Successfully extracted ${data.extracted} leads from ${searchParams.industry}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "ZoomInfo Industry Extraction Failed",
        description: error.message || "Failed to extract industry data from ZoomInfo",
        variant: "destructive",
      });
    },
  });

  // Revenue search mutation
  const revenueMutation = useMutation({
    mutationFn: async (params: { minRevenue: string; maxRevenue: string }) => {
      return await apiRequest("POST", "/api/scraping-jobs/zoominfo-revenue", params);
    },
    onSuccess: (data) => {
      toast({
        title: "ZoomInfo Revenue Extraction Complete",
        description: `Successfully extracted ${data.extracted} high-revenue prospects`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "ZoomInfo Revenue Extraction Failed",
        description: error.message || "Failed to extract revenue data from ZoomInfo",
        variant: "destructive",
      });
    },
  });

  // Location search mutation
  const locationMutation = useMutation({
    mutationFn: async (params: { city: string; state: string }) => {
      return await apiRequest("POST", "/api/scraping-jobs/zoominfo-location", params);
    },
    onSuccess: (data) => {
      toast({
        title: "ZoomInfo Location Extraction Complete",
        description: `Successfully extracted ${data.extracted} leads from ${searchParams.city}, ${searchParams.state}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "ZoomInfo Location Extraction Failed",
        description: error.message || "Failed to extract location data from ZoomInfo",
        variant: "destructive",
      });
    },
  });

  const handleIndustrySearch = async () => {
    if (!searchParams.industry) {
      toast({
        title: "Industry Required",
        description: "Please select an industry before extracting data",
        variant: "destructive",
      });
      return;
    }

    industryMutation.mutate({
      industry: searchParams.industry,
      location: searchParams.location
    });
  };

  const handleRevenueSearch = async () => {
    if (!searchParams.minRevenue || !searchParams.maxRevenue) {
      toast({
        title: "Revenue Range Required",
        description: "Please select both minimum and maximum revenue ranges",
        variant: "destructive",
      });
      return;
    }

    revenueMutation.mutate({
      minRevenue: searchParams.minRevenue,
      maxRevenue: searchParams.maxRevenue
    });
  };

  const handleLocationSearch = async () => {
    if (!searchParams.city || !searchParams.state) {
      toast({
        title: "Location Required",
        description: "Please enter both city and state for location search",
        variant: "destructive",
      });
      return;
    }

    locationMutation.mutate({
      city: searchParams.city,
      state: searchParams.state
    });
  };

  const isExtracting = industryMutation.isPending || revenueMutation.isPending || locationMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Database className="h-6 w-6 text-blue-600" />
                ZoomInfo Business Intelligence
              </CardTitle>
              <CardDescription className="mt-1">
                Extract high-quality business leads and company data from ZoomInfo's enterprise database
              </CardDescription>
            </div>
            <img 
              src={traffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="h-16 w-auto object-contain rendering-crisp-edges" 
            />
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'industry' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('industry')}
          className="flex-1"
        >
          <Building className="h-4 w-4 mr-2" />
          Industry Search
        </Button>
        <Button
          variant={activeTab === 'revenue' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('revenue')}
          className="flex-1"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Revenue Search
        </Button>
        <Button
          variant={activeTab === 'location' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('location')}
          className="flex-1"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Location Search
        </Button>
      </div>

      {/* Industry Search Tab */}
      {activeTab === 'industry' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Industry-Based Lead Extraction
            </CardTitle>
            <CardDescription>
              Extract companies by industry with optional location filtering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select 
                  value={searchParams.industry} 
                  onValueChange={(value) => setSearchParams({...searchParams, industry: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Financial Services">Financial Services</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Professional Services">Professional Services</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                    <SelectItem value="Hospitality">Hospitality</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  placeholder="e.g., New York, NY"
                  value={searchParams.location || ''}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                />
              </div>
            </div>
            <Separator />
            <Button 
              onClick={handleIndustrySearch}
              disabled={isExtracting || !searchParams.industry}
              className="w-full"
            >
              {industryMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Extracting Industry Data...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Extract {searchParams.industry} Companies
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Revenue Search Tab */}
      {activeTab === 'revenue' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              High-Revenue Company Extraction
            </CardTitle>
            <CardDescription>
              Target companies based on revenue ranges for premium prospects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minRevenue">Minimum Revenue *</Label>
                <Select 
                  value={searchParams.minRevenue} 
                  onValueChange={(value) => setSearchParams({...searchParams, minRevenue: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select minimum revenue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$1M">$1M+</SelectItem>
                    <SelectItem value="$5M">$5M+</SelectItem>
                    <SelectItem value="$10M">$10M+</SelectItem>
                    <SelectItem value="$25M">$25M+</SelectItem>
                    <SelectItem value="$50M">$50M+</SelectItem>
                    <SelectItem value="$100M">$100M+</SelectItem>
                    <SelectItem value="$500M">$500M+</SelectItem>
                    <SelectItem value="$1B">$1B+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRevenue">Maximum Revenue *</Label>
                <Select 
                  value={searchParams.maxRevenue} 
                  onValueChange={(value) => setSearchParams({...searchParams, maxRevenue: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maximum revenue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$5M">$5M</SelectItem>
                    <SelectItem value="$10M">$10M</SelectItem>
                    <SelectItem value="$25M">$25M</SelectItem>
                    <SelectItem value="$50M">$50M</SelectItem>
                    <SelectItem value="$100M">$100M</SelectItem>
                    <SelectItem value="$500M">$500M</SelectItem>
                    <SelectItem value="$1B">$1B</SelectItem>
                    <SelectItem value="$5B+">$5B+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">High-Value Prospects</span>
              </div>
              <p className="text-sm text-green-700">
                Revenue-based targeting helps identify companies with higher budget capacity for premium services.
              </p>
            </div>
            <Separator />
            <Button 
              onClick={handleRevenueSearch}
              disabled={isExtracting || !searchParams.minRevenue || !searchParams.maxRevenue}
              className="w-full"
            >
              {revenueMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Extracting Revenue Data...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Extract High-Revenue Companies
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Location Search Tab */}
      {activeTab === 'location' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Geographic Lead Extraction
            </CardTitle>
            <CardDescription>
              Extract companies from specific cities and states for local targeting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  placeholder="e.g., Chicago"
                  value={searchParams.city || ''}
                  onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select 
                  value={searchParams.state} 
                  onValueChange={(value) => setSearchParams({...searchParams, state: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Local Market Focus</span>
              </div>
              <p className="text-sm text-blue-700">
                Geographic targeting enables local market penetration and regional sales strategies.
              </p>
            </div>
            <Separator />
            <Button 
              onClick={handleLocationSearch}
              disabled={isExtracting || !searchParams.city || !searchParams.state}
              className="w-full"
            >
              {locationMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Extracting Location Data...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Extract {searchParams.city} Companies
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ZoomInfo Features */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            ZoomInfo Platform Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="bg-indigo-100 p-3 rounded-full w-fit mx-auto">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="font-medium">Enterprise Database</h4>
              <p className="text-sm text-gray-600">Access to millions of company profiles and contact records</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium">Contact Intelligence</h4>
              <p className="text-sm text-gray-600">Detailed contact information including titles and departments</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Revenue Data</h4>
              <p className="text-sm text-gray-600">Company financials and growth indicators for better targeting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}