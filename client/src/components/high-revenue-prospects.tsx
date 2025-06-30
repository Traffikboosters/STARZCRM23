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
  Star
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
    leadSource: "Google Maps Analysis"
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
    leadSource: "Industry Research"
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
    notes: "Multiple brands, strong service department revenue",
    leadSource: "Business Directory"
  },
  {
    id: 4,
    companyName: "Coastal Restaurant Group",
    industry: "Food & Beverage",
    estimatedMonthlyRevenue: 78000,
    employeeCount: "100-200",
    location: "Fort Lauderdale, FL",
    contactPerson: "Anthony Russo",
    email: "arusso@coastalrestaurants.com",
    phone: "(954) 762-3800",
    website: "coastalrestaurantgroup.com",
    businessType: "Restaurant Chain",
    services: ["Social Media Marketing", "Online Ordering", "Local SEO"],
    painPoints: ["Labor costs", "Online ordering competition", "Location visibility"],
    opportunityScore: 90,
    lastContact: null,
    status: "new",
    notes: "5 locations, catering services, strong weekend revenue",
    leadSource: "Market Analysis"
  },
  {
    id: 5,
    companyName: "Precision Manufacturing Inc",
    industry: "Manufacturing",
    estimatedMonthlyRevenue: 145000,
    employeeCount: "75-150",
    location: "Jacksonville, FL",
    contactPerson: "Robert Chen",
    email: "rchen@precisionmfg.com",
    phone: "(904) 458-9100",
    website: "precisionmanufacturing.com",
    businessType: "Contract Manufacturing",
    services: ["B2B Lead Generation", "Industry Website", "LinkedIn Marketing"],
    painPoints: ["Client acquisition", "Industry competition", "Digital presence"],
    opportunityScore: 87,
    lastContact: null,
    status: "new",
    notes: "Aerospace and medical device components, government contracts",
    leadSource: "LinkedIn Research"
  },
  {
    id: 6,
    companyName: "FlexTech Solutions",
    industry: "Technology",
    estimatedMonthlyRevenue: 110000,
    employeeCount: "20-40",
    location: "Boca Raton, FL",
    contactPerson: "Lisa Wang",
    email: "lwang@flextechsolutions.com",
    phone: "(561) 397-2600",
    website: "flextechsolutions.com",
    businessType: "IT Services",
    services: ["Content Marketing", "Technical SEO", "Lead Nurturing"],
    painPoints: ["Client retention", "Technical expertise marketing", "Competitive landscape"],
    opportunityScore: 91,
    lastContact: null,
    status: "new",
    notes: "MSP services, cloud migration specialist, growing client base",
    leadSource: "Tech Directory"
  },
  {
    id: 7,
    companyName: "Pinnacle Real Estate Group",
    industry: "Real Estate",
    estimatedMonthlyRevenue: 165000,
    employeeCount: "15-30",
    location: "Naples, FL",
    contactPerson: "David Kumar",
    email: "dkumar@pinnaclereg.com",
    phone: "(239) 581-4700",
    website: "pinnaclerealestategroup.com",
    businessType: "Real Estate Brokerage",
    services: ["Luxury Property Marketing", "Virtual Tours", "Social Media"],
    painPoints: ["Market competition", "Listing visibility", "Agent productivity"],
    opportunityScore: 89,
    lastContact: null,
    status: "new",
    notes: "Luxury market focus, waterfront properties, high-value transactions",
    leadSource: "MLS Analysis"
  },
  {
    id: 8,
    companyName: "Atlantic Legal Partners",
    industry: "Legal Services",
    estimatedMonthlyRevenue: 135000,
    employeeCount: "25-50",
    location: "West Palm Beach, FL",
    contactPerson: "Amanda Foster",
    email: "afoster@atlanticlegal.com",
    phone: "(561) 627-8900",
    website: "atlanticlegalpartners.com",
    businessType: "Law Firm",
    services: ["Legal SEO", "Content Marketing", "Reputation Management"],
    painPoints: ["Client acquisition", "Online reputation", "Referral generation"],
    opportunityScore: 86,
    lastContact: null,
    status: "new",
    notes: "Corporate and litigation practice, established client base",
    leadSource: "Legal Directory"
  }
];

export function HighRevenueProspects() {
  const [prospects, setProspects] = useState<HighRevenueProspect[]>(highRevenueProspects);
  const [filteredProspects, setFilteredProspects] = useState<HighRevenueProspect[]>(highRevenueProspects);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [revenueFilter, setRevenueFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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

    setFilteredProspects(filtered);
  }, [searchTerm, industryFilter, revenueFilter, statusFilter, prospects]);

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
        notes: `High revenue prospect: $${prospect.estimatedMonthlyRevenue.toLocaleString()}/month. ${prospect.notes}`,
        tags: ['high-revenue', 'qualified-prospect', prospect.industry.toLowerCase()],
        dealValue: 5000,
        budget: 2500,
        isDemo: false
      });

      // Update prospect status
      const updatedProspects = prospects.map(p =>
        p.id === prospect.id ? { ...p, status: 'contacted' as const, lastContact: new Date().toLocaleDateString() } : p
      );
      setProspects(updatedProspects);

      toast({
        title: "Contact Added to CRM",
        description: `${prospect.contactPerson} from ${prospect.companyName} has been added to your lead pipeline.`,
      });
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
      'Company,Contact,Email,Phone,Industry,Monthly Revenue,Location,Opportunity Score,Services Needed',
      ...filteredProspects.map(p => 
        `"${p.companyName}","${p.contactPerson}","${p.email}","${p.phone}","${p.industry}","$${p.estimatedMonthlyRevenue.toLocaleString()}","${p.location}",${p.opportunityScore},"${p.services.join(', ')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'high-revenue-prospects.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredProspects.length} high-revenue prospects to CSV file.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'interested': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'proposal_sent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = filteredProspects.reduce((sum, p) => sum + p.estimatedMonthlyRevenue, 0);
  const averageRevenue = filteredProspects.length > 0 ? totalRevenue / filteredProspects.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">High Revenue Prospects</h1>
          <p className="text-gray-600">Businesses averaging $55,000+ monthly revenue</p>
        </div>
        <div className="flex gap-3">
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
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Average Revenue</p>
                <p className="text-xl font-bold">${(averageRevenue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
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
          <div className="grid grid-cols-5 gap-4">
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
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Legal Services">Legal Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={revenueFilter} onValueChange={setRevenueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Revenue Range" />
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
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setIndustryFilter('all');
              setRevenueFilter('all');
              setStatusFilter('all');
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
                <CardTitle className="text-lg">{prospect.companyName}</CardTitle>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{prospect.opportunityScore}</span>
                </div>
              </div>
              <Badge className={getStatusColor(prospect.status)}>
                {prospect.status.replace('_', ' ')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{prospect.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{prospect.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{prospect.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{prospect.location}</span>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">
                    ${prospect.estimatedMonthlyRevenue.toLocaleString()}/month
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">{prospect.industry} • {prospect.employeeCount} employees</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Services Needed:</p>
                <div className="flex flex-wrap gap-1">
                  {prospect.services.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600">{prospect.notes}</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleContactProspect(prospect)}
                  className="flex-1"
                  disabled={prospect.status === 'contacted'}
                >
                  {prospect.status === 'contacted' ? 'Added to CRM' : 'Add to CRM'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => window.open(`mailto:${prospect.email}?subject=Partnership Opportunity with Traffik Boosters&body=Hi ${prospect.contactPerson},%0D%0A%0D%0AI hope this email finds you well. I wanted to reach out regarding potential marketing opportunities for ${prospect.companyName}.%0D%0A%0D%0ABest regards,%0D%0ATraffik Boosters Team`, '_blank')}
                >
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