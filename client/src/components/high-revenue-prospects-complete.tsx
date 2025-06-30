import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  TrendingUp,
  Download,
  Search,
  Filter,
  Target,
  Star,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface HighRevenueProspect {
  id: number;
  companyName: string;
  industry: string;
  estimatedMonthlyRevenue: number;
  employeeCount: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  businessType: string;
  services: string[];
  painPoints: string[];
  opportunityScore: number;
  lastContact: string | null;
  status: 'new' | 'contacted' | 'interested' | 'qualified' | 'proposal_sent';
  notes: string;
  leadSource: string;
  marketingIntent: 'actively_searching' | 'research_phase' | 'comparing_options' | 'budget_approved' | 'ready_to_buy' | 'not_searching';
  googleSearchActivity: string[];
  lastSearchDate: string;
  searchKeywords: string[];
}

const highRevenueProspects: HighRevenueProspect[] = [
  {
    id: 1,
    companyName: "Premier Medical Group",
    industry: "Healthcare",
    estimatedMonthlyRevenue: 125000,
    employeeCount: "50-100",
    location: "Miami, FL",
    contactPerson: "Dr. Sarah Rodriguez",
    email: "srodriguez@premiermg.com",
    phone: "(305) 847-9200",
    website: "premiermedicalgroupmiami.com",
    businessType: "Medical Practice",
    services: ["SEO", "Local Marketing", "Website Optimization"],
    painPoints: ["Low online visibility", "Competition from larger practices", "Patient acquisition"],
    opportunityScore: 92,
    lastContact: null,
    status: "new",
    notes: "Multi-location practice, strong revenue potential",
    leadSource: "Google Maps Analysis",
    marketingIntent: "actively_searching",
    googleSearchActivity: ["medical practice marketing", "healthcare SEO services", "patient acquisition strategies"],
    lastSearchDate: "2025-06-29",
    searchKeywords: ["medical practice marketing", "healthcare digital marketing", "patient lead generation", "medical SEO"]
  },
  {
    id: 2,
    companyName: "Elite Construction Corp",
    industry: "Construction",
    estimatedMonthlyRevenue: 180000,
    employeeCount: "25-50",
    location: "Tampa, FL",
    contactPerson: "Mike Thompson",
    email: "mike@eliteconstruction.com",
    phone: "(813) 692-5500",
    website: "eliteconstructioncorp.com",
    businessType: "General Contractor",
    services: ["Lead Generation", "Website Development", "Google Ads"],
    painPoints: ["Seasonal revenue fluctuations", "Lead quality issues", "Digital presence"],
    opportunityScore: 88,
    lastContact: null,
    status: "new",
    notes: "Commercial and residential projects, expanding market",
    leadSource: "Industry Research",
    marketingIntent: "budget_approved",
    googleSearchActivity: ["construction marketing companies", "contractor lead generation", "construction company SEO"],
    lastSearchDate: "2025-06-28",
    searchKeywords: ["construction digital marketing", "contractor PPC", "construction lead generation", "building company websites"]
  },
  {
    id: 3,
    companyName: "Sunset Automotive Group",
    industry: "Automotive",
    estimatedMonthlyRevenue: 95000,
    employeeCount: "30-75",
    location: "Orlando, FL",
    contactPerson: "Jennifer Martinez",
    email: "jmartinez@sunsetauto.com",
    phone: "(407) 835-7400",
    website: "sunsetautomotivegroup.com",
    businessType: "Auto Dealership",
    services: ["Digital Marketing", "Inventory Management", "Customer Retention"],
    painPoints: ["Inventory turnover", "Online lead conversion", "Brand awareness"],
    opportunityScore: 85,
    lastContact: null,
    status: "new",
    notes: "Multiple dealerships, high-volume sales potential",
    leadSource: "Market Research",
    marketingIntent: "comparing_options",
    googleSearchActivity: ["automotive digital marketing", "car dealership advertising", "automotive lead generation"],
    lastSearchDate: "2025-06-27",
    searchKeywords: ["car dealership marketing", "automotive PPC", "dealer lead generation", "auto inventory marketing"]
  },
  {
    id: 4,
    companyName: "Meridian Law Firm",
    industry: "Legal Services",
    estimatedMonthlyRevenue: 145000,
    employeeCount: "15-30",
    location: "Jacksonville, FL",
    contactPerson: "Robert Williams",
    email: "rwilliams@meridianlegal.com",
    phone: "(904) 758-2100",
    website: "meridianlawfirm.com",
    businessType: "Law Practice",
    services: ["Client Acquisition", "SEO", "Reputation Management"],
    painPoints: ["Client trust", "Online reputation", "Competition"],
    opportunityScore: 90,
    lastContact: null,
    status: "new",
    notes: "Personal injury and corporate law, strong case volume",
    leadSource: "Professional Network",
    marketingIntent: "ready_to_buy",
    googleSearchActivity: ["law firm marketing", "legal SEO services", "attorney lead generation"],
    lastSearchDate: "2025-06-30",
    searchKeywords: ["law firm SEO", "legal marketing agency", "attorney PPC", "lawyer lead generation"]
  },
  {
    id: 5,
    companyName: "TechFlow Solutions",
    industry: "Technology",
    estimatedMonthlyRevenue: 200000,
    employeeCount: "40-80",
    location: "Fort Lauderdale, FL",
    contactPerson: "Alex Chen",
    email: "achen@techflowsolutions.com",
    phone: "(954) 632-7800",
    website: "techflowsolutions.com",
    businessType: "Software Development",
    services: ["B2B Marketing", "Lead Generation", "Content Strategy"],
    painPoints: ["Market penetration", "Lead qualification", "Sales cycle"],
    opportunityScore: 94,
    lastContact: null,
    status: "new",
    notes: "B2B software company, expanding client base",
    leadSource: "Technology Directory",
    marketingIntent: "actively_searching",
    googleSearchActivity: ["B2B marketing agency", "software company marketing", "tech startup marketing"],
    lastSearchDate: "2025-06-29",
    searchKeywords: ["B2B digital marketing", "software marketing agency", "tech lead generation", "SaaS marketing"]
  },
  {
    id: 6,
    companyName: "Coastal Hospitality Group",
    industry: "Hospitality",
    estimatedMonthlyRevenue: 180000,
    employeeCount: "100-200",
    location: "Key West, FL",
    contactPerson: "Maria Santos",
    email: "msantos@coastalhospitality.com",
    phone: "(305) 294-8500",
    website: "coastalhospitalitygroup.com",
    businessType: "Hotel & Resort",
    services: ["Digital Marketing", "Booking Optimization", "Brand Management"],
    painPoints: ["Seasonal bookings", "Online presence", "Direct bookings"],
    opportunityScore: 86,
    lastContact: null,
    status: "new",
    notes: "Multiple properties, seasonal revenue challenges",
    leadSource: "Tourism Board",
    marketingIntent: "research_phase",
    googleSearchActivity: ["hotel marketing strategies", "hospitality digital marketing", "resort advertising"],
    lastSearchDate: "2025-06-26",
    searchKeywords: ["hotel digital marketing", "resort marketing agency", "hospitality SEO", "booking optimization"]
  },
  {
    id: 7,
    companyName: "Digital Marketing Masters Inc",
    industry: "Marketing Agency",
    estimatedMonthlyRevenue: 85000,
    employeeCount: "15-25",
    location: "Atlanta, GA",
    contactPerson: "Ryan Patterson",
    email: "rpatterson@dmmastersagency.com",
    phone: "(404) 892-7300",
    website: "digitalmarketingmasters.com",
    businessType: "Marketing Agency",
    services: ["White-label Services", "Advanced Analytics", "Enterprise Solutions"],
    painPoints: ["Scaling operations", "Client retention", "Competitive pricing"],
    opportunityScore: 91,
    lastContact: null,
    status: "new",
    notes: "Looking for white-label partnership, actively searching Google for marketing automation",
    leadSource: "Google Search Analysis",
    marketingIntent: "actively_searching",
    googleSearchActivity: ["white label digital marketing", "marketing automation tools", "agency partnership programs"],
    lastSearchDate: "2025-06-30",
    searchKeywords: ["white label SEO", "marketing automation platform", "agency partnership", "digital marketing tools"]
  },
  {
    id: 8,
    companyName: "Florida Real Estate Partners",
    industry: "Real Estate",
    estimatedMonthlyRevenue: 120000,
    employeeCount: "25-50",
    location: "Naples, FL",
    contactPerson: "James Rodriguez",
    email: "jrodriguez@flrealtypartners.com",
    phone: "(239) 774-9200",
    website: "flrealtypartners.com",
    businessType: "Real Estate Brokerage",
    services: ["Lead Generation", "Virtual Tours", "Social Media Marketing"],
    painPoints: ["Market competition", "Lead quality", "Listing visibility"],
    opportunityScore: 89,
    lastContact: null,
    status: "new",
    notes: "Luxury and commercial properties, high transaction values",
    leadSource: "Real Estate Network",
    marketingIntent: "actively_searching",
    googleSearchActivity: ["real estate marketing", "realtor lead generation", "property marketing services"],
    lastSearchDate: "2025-06-29",
    searchKeywords: ["real estate digital marketing", "realtor PPC", "property lead generation", "real estate SEO"]
  }
];

export function HighRevenueProspects() {
  const [prospects, setProspects] = useState<HighRevenueProspect[]>(highRevenueProspects);
  const [filteredProspects, setFilteredProspects] = useState<HighRevenueProspect[]>(highRevenueProspects);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [revenueFilter, setRevenueFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketingIntentFilter, setMarketingIntentFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    let filtered = prospects;

    if (searchTerm) {
      filtered = filtered.filter(prospect =>
        prospect.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(prospect => prospect.industry === industryFilter);
    }

    if (revenueFilter !== 'all') {
      filtered = filtered.filter(prospect => {
        switch (revenueFilter) {
          case '55k-100k': return prospect.estimatedMonthlyRevenue >= 55000 && prospect.estimatedMonthlyRevenue < 100000;
          case '100k-150k': return prospect.estimatedMonthlyRevenue >= 100000 && prospect.estimatedMonthlyRevenue < 150000;
          case '150k+': return prospect.estimatedMonthlyRevenue >= 150000;
          default: return true;
        }
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(prospect => prospect.status === statusFilter);
    }

    if (marketingIntentFilter !== 'all') {
      filtered = filtered.filter(prospect => prospect.marketingIntent === marketingIntentFilter);
    }

    setFilteredProspects(filtered);
  }, [searchTerm, industryFilter, revenueFilter, statusFilter, marketingIntentFilter, prospects]);

  const handleContactProspect = async (prospect: HighRevenueProspect) => {
    try {
      // Create contact in CRM
      await apiRequest('POST', '/api/contacts', {
        firstName: prospect.contactPerson.split(' ')[0],
        lastName: prospect.contactPerson.split(' ').slice(1).join(' '),
        email: prospect.email,
        phone: prospect.phone,
        company: prospect.companyName,
        position: 'Decision Maker',
        leadSource: 'High Revenue Prospects',
        status: 'new',
        notes: `High revenue prospect: $${prospect.estimatedMonthlyRevenue.toLocaleString()}/month. ${prospect.notes}. Marketing Intent: ${prospect.marketingIntent}. Recent Google searches: ${prospect.googleSearchActivity.join(', ')}`,
        tags: ['high-revenue', 'qualified-prospect', prospect.industry.toLowerCase(), prospect.marketingIntent],
        dealValue: 5000,
        budget: 2500,
        isDemo: false
      });

      toast({
        title: "Contact Added",
        description: `${prospect.contactPerson} from ${prospect.companyName} has been added to your CRM.`,
      });

      // Update prospect status
      setProspects(prev => prev.map(p => 
        p.id === prospect.id ? { ...p, status: 'contacted' as const } : p
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contact to CRM. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportProspects = () => {
    const csvContent = [
      ['Company', 'Contact', 'Industry', 'Revenue', 'Location', 'Email', 'Phone', 'Marketing Intent', 'Last Search Date', 'Google Activity'],
      ...filteredProspects.map(p => [
        p.companyName,
        p.contactPerson,
        p.industry,
        `$${p.estimatedMonthlyRevenue.toLocaleString()}`,
        p.location,
        p.email,
        p.phone,
        p.marketingIntent,
        p.lastSearchDate,
        p.googleSearchActivity.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'high-revenue-prospects.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredProspects.length} high-revenue prospects to CSV.`,
    });
  };

  const totalRevenue = filteredProspects.reduce((sum, p) => sum + p.estimatedMonthlyRevenue, 0);
  const averageRevenue = filteredProspects.length > 0 ? totalRevenue / filteredProspects.length : 0;
  const activelySearchingCount = filteredProspects.filter(p => p.marketingIntent === 'actively_searching').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">High Revenue Prospects</h1>
          <p className="text-gray-600">Businesses averaging $55,000+ monthly revenue actively searching for digital marketing services</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportProspects} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Prospects</p>
                <p className="text-xl font-bold">{filteredProspects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Monthly Revenue</p>
                <p className="text-xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Actively Searching</p>
                <p className="text-xl font-bold">{activelySearchingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Opportunity Score</p>
                <p className="text-xl font-bold">
                  {filteredProspects.length > 0 
                    ? Math.round(filteredProspects.reduce((sum, p) => sum + p.opportunityScore, 0) / filteredProspects.length)
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Automotive">Automotive</SelectItem>
                <SelectItem value="Legal Services">Legal Services</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Hospitality">Hospitality</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Marketing Agency">Marketing Agency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={revenueFilter} onValueChange={setRevenueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Revenue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Revenue</SelectItem>
                <SelectItem value="55k-100k">$55K - $100K</SelectItem>
                <SelectItem value="100k-150k">$100K - $150K</SelectItem>
                <SelectItem value="150k+">$150K+</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={marketingIntentFilter} onValueChange={setMarketingIntentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Marketing Intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intent</SelectItem>
                <SelectItem value="actively_searching">Actively Searching</SelectItem>
                <SelectItem value="research_phase">Research Phase</SelectItem>
                <SelectItem value="comparing_options">Comparing Options</SelectItem>
                <SelectItem value="budget_approved">Budget Approved</SelectItem>
                <SelectItem value="ready_to_buy">Ready to Buy</SelectItem>
                <SelectItem value="not_searching">Not Searching</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setIndustryFilter('all');
              setRevenueFilter('all');
              setStatusFilter('all');
              setMarketingIntentFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prospects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProspects.map((prospect) => (
          <Card key={prospect.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{prospect.companyName}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{prospect.industry}</Badge>
                  <Badge 
                    variant={prospect.marketingIntent === 'actively_searching' ? 'default' : 'outline'}
                    className={prospect.marketingIntent === 'actively_searching' ? 'bg-green-600' : ''}
                  >
                    {prospect.marketingIntent === 'actively_searching' ? 'Searching Now' : 
                     prospect.marketingIntent === 'ready_to_buy' ? 'Ready to Buy' :
                     prospect.marketingIntent === 'budget_approved' ? 'Budget OK' : 'Research'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{prospect.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">${prospect.estimatedMonthlyRevenue.toLocaleString()}/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{prospect.location}</span>
                </div>
              </div>

              {/* Google Search Activity */}
              {prospect.marketingIntent === 'actively_searching' && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-600">Recent Google Searches:</h4>
                  <div className="flex flex-wrap gap-1">
                    {prospect.googleSearchActivity.slice(0, 3).map((search, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {search}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Last searched: {prospect.lastSearchDate}</p>
                </div>
              )}

              {/* Services Needed */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Services Needed:</h4>
                <div className="flex flex-wrap gap-1">
                  {prospect.services.map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Opportunity Score */}
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Opportunity Score: <strong>{prospect.opportunityScore}/100</strong></span>
              </div>

              {/* Contact Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => handleContactProspect(prospect)}
                  disabled={prospect.status === 'contacted'}
                  className="flex-1"
                >
                  {prospect.status === 'contacted' ? 'Added to CRM' : 'Add to CRM'}
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProspects.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}