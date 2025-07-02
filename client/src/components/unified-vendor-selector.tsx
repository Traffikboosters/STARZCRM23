import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Globe,
  Building2,
  Phone,
  Map,
  Users,
  Target,
  TrendingUp,
  Database,
  Search,
  RefreshCw,
  CheckCircle,
  Star,
  MapPin,
  Briefcase,
  Home
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface VendorPlatform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  leadCount: string;
  leadType: string;
  avgRevenue: string;
  successRate: string;
  category: 'directory' | 'social' | 'business' | 'maps';
  color: string;
  features: string[];
}

const platforms: VendorPlatform[] = [
  {
    id: 'bark',
    name: 'Bark.com',
    description: 'Service professionals actively seeking customers',
    icon: <Target className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/bark',
    leadCount: '25-30',
    leadType: 'Service Professionals',
    avgRevenue: '$45K-$85K/month',
    successRate: '92%',
    category: 'business',
    color: 'bg-orange-100 border-orange-300',
    features: ['High Intent', 'Service Based', 'Active Seekers']
  },
  {
    id: 'bark-dashboard',
    name: 'Bark Dashboard',
    description: 'High-revenue contractors from seller dashboard',
    icon: <Database className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/bark-dashboard',
    leadCount: '15-20',
    leadType: 'High-Revenue Contractors',
    avgRevenue: '$55K-$100K/month',
    successRate: '95%',
    category: 'business',
    color: 'bg-blue-100 border-blue-300',
    features: ['High Revenue', 'Verified Sellers', 'Premium Prospects']
  },
  {
    id: 'yellowpages',
    name: 'Yellow Pages',
    description: 'Established businesses from directory listings',
    icon: <Phone className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/yellowpages',
    leadCount: '20-25',
    leadType: 'Established Businesses',
    avgRevenue: '$60K-$110K/month',
    successRate: '88%',
    category: 'directory',
    color: 'bg-yellow-100 border-yellow-300',
    features: ['Long Standing', 'Directory Listed', 'Trusted Brands']
  },
  {
    id: 'whitepages',
    name: 'White Pages',
    description: 'Verified professionals and licensed practitioners',
    icon: <Users className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/whitepages',
    leadCount: '18-22',
    leadType: 'Licensed Professionals',
    avgRevenue: '$45K-$75K/month',
    successRate: '85%',
    category: 'directory',
    color: 'bg-gray-100 border-gray-300',
    features: ['Licensed', 'Verified', 'Professional']
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    description: 'Local businesses with verified locations and reviews',
    icon: <Map className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/google-maps',
    leadCount: '20-30',
    leadType: 'Local Businesses',
    avgRevenue: '$35K-$65K/month',
    successRate: '90%',
    category: 'maps',
    color: 'bg-green-100 border-green-300',
    features: ['Local Focus', 'Review Verified', 'Geographic']
  },
  {
    id: 'google-maps-enhanced',
    name: 'Google Maps Enhanced',
    description: 'Premium businesses with extracted email contacts',
    icon: <MapPin className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/google-maps-enhanced',
    leadCount: '15-25',
    leadType: 'Premium Businesses',
    avgRevenue: '$50K-$90K/month',
    successRate: '93%',
    category: 'maps',
    color: 'bg-emerald-100 border-emerald-300',
    features: ['Email Extraction', 'Premium Quality', 'Enhanced Data']
  },
  {
    id: 'zoominfo-industry',
    name: 'ZoomInfo Industry',
    description: 'B2B prospects filtered by industry sector',
    icon: <Briefcase className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/zoominfo-industry',
    leadCount: '10-15',
    leadType: 'B2B Prospects',
    avgRevenue: '$75K-$150K/month',
    successRate: '96%',
    category: 'business',
    color: 'bg-purple-100 border-purple-300',
    features: ['B2B Focus', 'Industry Specific', 'Decision Makers']
  },
  {
    id: 'zoominfo-revenue',
    name: 'ZoomInfo Revenue',
    description: 'High-revenue companies by revenue threshold',
    icon: <TrendingUp className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/zoominfo-revenue',
    leadCount: '8-12',
    leadType: 'High-Revenue Companies',
    avgRevenue: '$100K-$500K/month',
    successRate: '98%',
    category: 'business',
    color: 'bg-indigo-100 border-indigo-300',
    features: ['High Revenue', 'Enterprise', 'Fortune Prospects']
  },
  {
    id: 'business-insider',
    name: 'Business Insider',
    description: 'Featured companies and business news prospects',
    icon: <Globe className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/business-insider',
    leadCount: '12-18',
    leadType: 'Featured Companies',
    avgRevenue: '$80K-$200K/month',
    successRate: '89%',
    category: 'business',
    color: 'bg-red-100 border-red-300',
    features: ['News Featured', 'High Profile', 'Media Presence']
  },
  {
    id: 'craigslist',
    name: 'Craigslist',
    description: 'Local service providers actively posting services',
    icon: <Briefcase className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/craigslist',
    leadCount: '15-22',
    leadType: 'Service Providers',
    avgRevenue: '$25K-$55K/month',
    successRate: '83%',
    category: 'directory',
    color: 'bg-blue-100 border-blue-300',
    features: ['Local Focus', 'Service Based', 'Recent Posts']
  },
  {
    id: 'angies-list',
    name: "Angie's List",
    description: 'Verified home service contractors with ratings',
    icon: <Home className="h-6 w-6" />,
    endpoint: '/api/scraping-jobs/angies-list',
    leadCount: '18-25',
    leadType: 'Home Contractors',
    avgRevenue: '$45K-$120K/month',
    successRate: '88%',
    category: 'directory',
    color: 'bg-green-100 border-green-300',
    features: ['Verified Reviews', 'Home Services', 'Licensed Pros']
  }
];

const categoryColors = {
  directory: 'bg-amber-50 border-amber-200',
  social: 'bg-blue-50 border-blue-200',
  business: 'bg-purple-50 border-purple-200',
  maps: 'bg-green-50 border-green-200'
};

const categoryIcons = {
  directory: <Phone className="h-4 w-4" />,
  social: <Users className="h-4 w-4" />,
  business: <Building2 className="h-4 w-4" />,
  maps: <Map className="h-4 w-4" />
};

export default function UnifiedVendorSelector() {
  const [extractingPlatforms, setExtractingPlatforms] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generic extraction mutation
  const extractMutation = useMutation({
    mutationFn: async ({ platform, endpoint }: { platform: VendorPlatform; endpoint: string }) => {
      const response = await apiRequest("POST", endpoint, {});
      return { platform, result: await response.json() };
    },
    onSuccess: ({ platform, result }) => {
      setExtractingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform.id);
        return newSet;
      });

      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      
      toast({
        title: `${platform.name} Extraction Complete`,
        description: `Successfully extracted ${result.leadsExtracted || result.extracted || 0} ${platform.leadType.toLowerCase()}`,
      });
    },
    onError: (error: any, { platform }) => {
      setExtractingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform.id);
        return newSet;
      });

      toast({
        title: `${platform.name} Extraction Failed`,
        description: error.message || "Failed to extract leads",
        variant: "destructive",
      });
    },
  });

  const handleExtraction = (platform: VendorPlatform) => {
    setExtractingPlatforms(prev => new Set(prev).add(platform.id));
    extractMutation.mutate({ platform, endpoint: platform.endpoint });
  };

  const filteredPlatforms = selectedCategory === 'all' 
    ? platforms 
    : platforms.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Platforms', count: platforms.length },
    { id: 'directory', name: 'Directory', count: platforms.filter(p => p.category === 'directory').length },
    { id: 'business', name: 'Business', count: platforms.filter(p => p.category === 'business').length },
    { id: 'maps', name: 'Maps', count: platforms.filter(p => p.category === 'maps').length }
  ];

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
            <h1 className="text-3xl font-bold text-black">Lead Extraction Vendors</h1>
            <p className="text-lg text-black font-medium">More Traffik! More Sales!</p>
            <p className="text-gray-600">Choose from 9 premium lead generation platforms</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.id !== 'all' && categoryIcons[category.id as keyof typeof categoryIcons]}
            {category.name}
            <Badge variant="secondary" className="ml-1">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlatforms.map((platform) => {
          const isExtracting = extractingPlatforms.has(platform.id);
          
          return (
            <Card key={platform.id} className={`transition-all hover:shadow-lg ${platform.color}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryColors[platform.category]}`}>
                      {platform.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {platform.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold">{platform.successRate}</span>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Lead Count</p>
                    <p className="font-semibold">{platform.leadCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Revenue</p>
                    <p className="font-semibold">{platform.avgRevenue}</p>
                  </div>
                </div>

                {/* Lead Type */}
                <div>
                  <p className="text-gray-600 text-sm">Lead Type</p>
                  <p className="font-semibold">{platform.leadType}</p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {platform.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Extract Button */}
                <Button
                  onClick={() => handleExtraction(platform)}
                  disabled={isExtracting}
                  className="w-full"
                  variant={isExtracting ? "outline" : "default"}
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Extract Leads
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">{platforms.length}</p>
              <p className="text-sm text-gray-600">Total Platforms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">183-267</p>
              <p className="text-sm text-gray-600">Leads per Cycle</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">89%</p>
              <p className="text-sm text-gray-600">Avg Success Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">$25K-$500K</p>
              <p className="text-sm text-gray-600">Revenue Range</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}