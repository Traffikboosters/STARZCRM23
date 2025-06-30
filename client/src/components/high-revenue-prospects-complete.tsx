import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Globe, 
  Phone, 
  Mail, 
  MapPin,
  Search,
  Target,
  Star,
  Trophy,
  Zap,
  Filter,
  Download,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface HighRevenueProspect {
  id: string;
  companyName: string;
  industry: string;
  estimatedMonthlyRevenue: number;
  employeeCount: string;
  location: string;
  website: string;
  contactPerson: string;
  email: string;
  phone: string;
  digitalMarketingBudget: number;
  currentMarketingChannels: string[];
  painPoints: string[];
  marketingGaps: string[];
  opportunityScore: number;
  competitorAnalysis: {
    hasStrongSEO: boolean;
    hasPPC: boolean;
    socialMediaPresence: string;
    websiteQuality: string;
  };
  revenueGrowthTrend: 'increasing' | 'stable' | 'declining';
  decisionMaker: {
    role: string;
    linkedIn?: string;
    directContact: boolean;
  };
  lastUpdated: string;
  leadSource: string;
  priority: 'critical' | 'high' | 'medium';
  marketingSpend: string;
}

export function HighRevenueProspectsComplete() {
  const [prospects, setProspects] = useState<HighRevenueProspect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<HighRevenueProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [revenueFilter, setRevenueFilter] = useState('all');
  const { toast } = useToast();

  // Initialize with high-quality prospects data
  useEffect(() => {
    const loadHighRevenueProspects = () => {
      const mockProspects: HighRevenueProspect[] = [
        {
          id: 'hrp-001',
          companyName: 'Premier HVAC Solutions',
          industry: 'HVAC Services',
          estimatedMonthlyRevenue: 125000,
          employeeCount: '25-50',
          location: 'Austin, TX',
          website: 'premierhvacsolutions.com',
          contactPerson: 'Michael Rodriguez',
          email: 'mrodriguez@premierhvac.com',
          phone: '(512) 555-0123',
          digitalMarketingBudget: 8500,
          currentMarketingChannels: ['Yellow Pages', 'Local Referrals', 'Truck Wraps'],
          painPoints: ['No online presence', 'Seasonal revenue fluctuations', 'Limited lead generation'],
          marketingGaps: ['SEO optimization', 'Google Ads', 'Social media marketing', 'Website modernization'],
          opportunityScore: 94,
          competitorAnalysis: {
            hasStrongSEO: false,
            hasPPC: false,
            socialMediaPresence: 'weak',
            websiteQuality: 'poor'
          },
          revenueGrowthTrend: 'increasing',
          decisionMaker: {
            role: 'Owner/CEO',
            linkedIn: 'linkedin.com/in/mrodriguez-hvac',
            directContact: true
          },
          lastUpdated: '2025-06-30',
          leadSource: 'Google Maps Extraction',
          priority: 'critical',
          marketingSpend: '$5K-$10K/month'
        },
        {
          id: 'hrp-002',
          companyName: 'Elite Dental Group',
          industry: 'Healthcare',
          estimatedMonthlyRevenue: 89000,
          employeeCount: '15-25',
          location: 'Dallas, TX',
          website: 'elitedentalgroup.com',
          contactPerson: 'Dr. Sarah Thompson',
          email: 'sthompson@elitedental.com',
          phone: '(214) 555-0156',
          digitalMarketingBudget: 6500,
          currentMarketingChannels: ['Insurance Networks', 'Local Directory', 'Patient Referrals'],
          painPoints: ['Patient acquisition cost', 'New patient flow', 'Insurance dependencies'],
          marketingGaps: ['Local SEO', 'Patient review management', 'Social proof marketing'],
          opportunityScore: 88,
          competitorAnalysis: {
            hasStrongSEO: false,
            hasPPC: true,
            socialMediaPresence: 'moderate',
            websiteQuality: 'good'
          },
          revenueGrowthTrend: 'stable',
          decisionMaker: {
            role: 'Practice Manager',
            directContact: true
          },
          lastUpdated: '2025-06-30',
          leadSource: 'Healthcare Directory',
          priority: 'high',
          marketingSpend: '$8K-$12K/month'
        },
        {
          id: 'hrp-003',
          companyName: 'Precision Plumbing Contractors',
          industry: 'Plumbing Services',
          estimatedMonthlyRevenue: 156000,
          employeeCount: '35-50',
          location: 'Houston, TX',
          website: 'precisionplumbinghouston.com',
          contactPerson: 'James Wilson',
          email: 'jwilson@precisionplumbing.com',
          phone: '(713) 555-0189',
          digitalMarketingBudget: 12000,
          currentMarketingChannels: ['Google Ads', 'Local SEO', 'Service Websites'],
          painPoints: ['Lead quality', 'Emergency call optimization', 'Service area expansion'],
          marketingGaps: ['Advanced conversion tracking', 'Marketing automation', 'Customer retention'],
          opportunityScore: 91,
          competitorAnalysis: {
            hasStrongSEO: true,
            hasPPC: true,
            socialMediaPresence: 'strong',
            websiteQuality: 'excellent'
          },
          revenueGrowthTrend: 'increasing',
          decisionMaker: {
            role: 'Marketing Director',
            linkedIn: 'linkedin.com/in/jwilson-plumbing',
            directContact: true
          },
          lastUpdated: '2025-06-30',
          leadSource: 'Business Intelligence',
          priority: 'critical',
          marketingSpend: '$15K-$20K/month'
        },
        {
          id: 'hrp-004',
          companyName: 'Metro Legal Associates',
          industry: 'Legal Services',
          estimatedMonthlyRevenue: 78000,
          employeeCount: '10-15',
          location: 'San Antonio, TX',
          website: 'metrolegalassociates.com',
          contactPerson: 'Attorney Lisa Chen',
          email: 'lchen@metrolegal.com',
          phone: '(210) 555-0167',
          digitalMarketingBudget: 5500,
          currentMarketingChannels: ['Legal Directories', 'Bar Associations', 'Referral Network'],
          painPoints: ['Client acquisition', 'Online reputation', 'Practice area visibility'],
          marketingGaps: ['Content marketing', 'Video testimonials', 'Local search optimization'],
          opportunityScore: 85,
          competitorAnalysis: {
            hasStrongSEO: false,
            hasPPC: false,
            socialMediaPresence: 'weak',
            websiteQuality: 'fair'
          },
          revenueGrowthTrend: 'stable',
          decisionMaker: {
            role: 'Managing Partner',
            directContact: true
          },
          lastUpdated: '2025-06-30',
          leadSource: 'Professional Network',
          priority: 'high',
          marketingSpend: '$7K-$10K/month'
        },
        {
          id: 'hrp-005',
          companyName: 'Coastal Construction Group',
          industry: 'Construction',
          estimatedMonthlyRevenue: 245000,
          employeeCount: '50-100',
          location: 'Galveston, TX',
          website: 'coastalconstructiongroup.com',
          contactPerson: 'Robert Martinez',
          email: 'rmartinez@coastalconstruction.com',
          phone: '(409) 555-0198',
          digitalMarketingBudget: 18000,
          currentMarketingChannels: ['Industry Publications', 'Trade Shows', 'Contractor Networks'],
          painPoints: ['Project lead generation', 'Residential vs commercial balance', 'Seasonal variations'],
          marketingGaps: ['Digital portfolio showcase', 'Customer testimonials', 'Lead nurturing'],
          opportunityScore: 96,
          competitorAnalysis: {
            hasStrongSEO: false,
            hasPPC: false,
            socialMediaPresence: 'weak',
            websiteQuality: 'poor'
          },
          revenueGrowthTrend: 'increasing',
          decisionMaker: {
            role: 'Business Development Manager',
            linkedIn: 'linkedin.com/in/rmartinez-construction',
            directContact: true
          },
          lastUpdated: '2025-06-30',
          leadSource: 'Industry Research',
          priority: 'critical',
          marketingSpend: '$20K-$25K/month'
        },
        {
          id: 'hrp-006',
          companyName: 'Advanced Auto Repair Center',
          industry: 'Automotive',
          estimatedMonthlyRevenue: 67000,
          employeeCount: '8-15',
          location: 'Fort Worth, TX',
          website: 'advancedautorepair.com',
          contactPerson: 'Tony Gonzalez',
          email: 'tgonzalez@advancedauto.com',
          phone: '(817) 555-0134',
          digitalMarketingBudget: 4200,
          currentMarketingChannels: ['Local SEO', 'Google My Business', 'Customer Reviews'],
          painPoints: ['Customer retention', 'Service pricing transparency', 'Appointment scheduling'],
          marketingGaps: ['Email marketing', 'Loyalty programs', 'Social media engagement'],
          opportunityScore: 82,
          competitorAnalysis: {
            hasStrongSEO: true,
            hasPPC: false,
            socialMediaPresence: 'moderate',
            websiteQuality: 'good'
          },
          revenueGrowthTrend: 'stable',
          decisionMaker: {
            role: 'Owner',
            directContact: true
          },
          lastUpdated: '2025-06-30',
          leadSource: 'Local Business Directory',
          priority: 'medium',
          marketingSpend: '$5K-$8K/month'
        }
      ];

      setProspects(mockProspects);
      setFilteredProspects(mockProspects);
      setLoading(false);
    };

    loadHighRevenueProspects();
  }, []);

  // Filter prospects based on search and filters
  useEffect(() => {
    let filtered = prospects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(prospect =>
        prospect.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Industry filter
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(prospect => prospect.industry === selectedIndustry);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(prospect => prospect.priority === selectedPriority);
    }

    // Revenue filter
    if (revenueFilter !== 'all') {
      filtered = filtered.filter(prospect => {
        switch (revenueFilter) {
          case 'high': return prospect.estimatedMonthlyRevenue >= 100000;
          case 'medium': return prospect.estimatedMonthlyRevenue >= 75000 && prospect.estimatedMonthlyRevenue < 100000;
          case 'target': return prospect.estimatedMonthlyRevenue >= 55000;
          default: return true;
        }
      });
    }

    setFilteredProspects(filtered);
  }, [prospects, searchTerm, selectedIndustry, selectedPriority, revenueFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOpportunityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const formatRevenue = (revenue: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(revenue);
  };

  const createOutreachContact = async (prospect: HighRevenueProspect) => {
    try {
      const contactData = {
        firstName: prospect.contactPerson.split(' ')[0],
        lastName: prospect.contactPerson.split(' ').slice(1).join(' '),
        email: prospect.email,
        phone: prospect.phone,
        company: prospect.companyName,
        position: prospect.decisionMaker.role,
        website: prospect.website,
        notes: `High-revenue prospect: ${formatRevenue(prospect.estimatedMonthlyRevenue)}/month. Marketing budget: ${prospect.marketingSpend}. Key opportunities: ${prospect.marketingGaps.slice(0, 3).join(', ')}.`,
        leadSource: 'High-Revenue Prospects',
        leadValue: prospect.digitalMarketingBudget,
        priority: prospect.priority,
        industry: prospect.industry,
        location: prospect.location,
        tags: ['high-revenue', 'qualified-prospect', prospect.industry.toLowerCase().replace(' ', '-')],
        assignedTo: 1 // Assign to admin user
      };

      await apiRequest('POST', '/api/contacts', contactData);
      
      toast({
        title: "Contact Created",
        description: `${prospect.contactPerson} has been added to your CRM as a high-value prospect.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateOutreachEmail = (prospect: HighRevenueProspect) => {
    const emailContent = `Subject: Increase ${prospect.companyName}'s Revenue with Proven Digital Marketing

Hi ${prospect.contactPerson.split(' ')[0]},

I noticed that ${prospect.companyName} is doing excellent work in ${prospect.industry} in the ${prospect.location} area. With your estimated monthly revenue of ${formatRevenue(prospect.estimatedMonthlyRevenue)}, you're clearly successful, but I believe there's potential to grow even further.

I've identified several marketing opportunities that could significantly impact your business:

${prospect.marketingGaps.slice(0, 3).map(gap => `• ${gap}`).join('\n')}

Our clients in similar situations typically see:
• 30-50% increase in qualified leads
• 25% improvement in conversion rates  
• 20-40% growth in monthly revenue

Unlike traditional agencies that require long-term contracts, we work on a project basis. You only pay for results.

Would you be interested in a brief 15-minute call to discuss how we can help ${prospect.companyName} reach its next growth milestone?

Best regards,
Michael Thompson
Growth Specialist
Traffik Boosters
(877) 840-6250
michael.thompson@traffikboosters.com

P.S. No contracts, no monthly fees - just proven results for your business.`;

    navigator.clipboard.writeText(emailContent);
    toast({
      title: "Email Template Copied",
      description: "Personalized outreach email has been copied to your clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-orange-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analyzing High-Revenue Prospects
              </h3>
              <p className="text-gray-600">
                Identifying companies with $55K+ monthly revenue potential...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRevenuePotential = filteredProspects.reduce((sum, prospect) => sum + prospect.estimatedMonthlyRevenue, 0);
  const averageOpportunityScore = filteredProspects.reduce((sum, prospect) => sum + prospect.opportunityScore, 0) / filteredProspects.length;

  return (
    <div className="w-full space-y-6">
      {/* Header with Logo */}
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <CardTitle className="text-2xl">High-Revenue Business Prospects</CardTitle>
                <CardDescription>
                  Companies averaging $55,000+ monthly revenue with digital marketing opportunities
                </CardDescription>
              </div>
            </div>
            <img 
              src={traffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="h-16 w-auto"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">Total Prospects</p>
                  <p className="text-2xl font-bold text-green-900">{filteredProspects.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Combined Revenue</p>
                  <p className="text-2xl font-bold text-blue-900">{formatRevenue(totalRevenuePotential)}/mo</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Avg Opportunity</p>
                  <p className="text-2xl font-bold text-purple-900">{Math.round(averageOpportunityScore)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Critical Priority</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {filteredProspects.filter(p => p.priority === 'critical').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Prospect Filtering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="HVAC Services">HVAC Services</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Plumbing Services">Plumbing Services</SelectItem>
                <SelectItem value="Legal Services">Legal Services</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Automotive">Automotive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>

            <Select value={revenueFilter} onValueChange={setRevenueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Revenue Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Revenue</SelectItem>
                <SelectItem value="high">$100K+ /month</SelectItem>
                <SelectItem value="medium">$75K-$100K /month</SelectItem>
                <SelectItem value="target">$55K+ /month</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prospects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProspects.map((prospect) => (
          <Card key={prospect.id} className="border-2 hover:border-orange-300 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{prospect.companyName}</CardTitle>
                    <Badge className={getPriorityColor(prospect.priority)}>
                      {prospect.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {prospect.industry}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {prospect.location}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatRevenue(prospect.estimatedMonthlyRevenue)}
                  </div>
                  <div className="text-sm text-gray-500">/month</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Opportunity Score</span>
                    <span className={`text-lg font-bold ${getOpportunityScoreColor(prospect.opportunityScore)}`}>
                      {prospect.opportunityScore}%
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Marketing Budget</span>
                    <span className="text-lg font-bold text-blue-600">
                      {prospect.marketingSpend}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{prospect.contactPerson}</span>
                  <Badge variant="outline">{prospect.decisionMaker.role}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {prospect.phone}
                  </span>
                  <span className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {prospect.email}
                  </span>
                </div>
              </div>

              {/* Marketing Gaps */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Key Opportunities:</p>
                <div className="flex flex-wrap gap-1">
                  {prospect.marketingGaps.slice(0, 3).map((gap, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {gap}
                    </Badge>
                  ))}
                  {prospect.marketingGaps.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{prospect.marketingGaps.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={() => createOutreachContact(prospect)}
                  className="bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add to CRM
                </Button>
                <Button
                  onClick={() => generateOutreachEmail(prospect)}
                  variant="outline"
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Template
                </Button>
              </div>

              {/* Website Link */}
              <div className="pt-2 border-t">
                <a
                  href={`https://${prospect.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProspects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Prospects Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find high-revenue prospects.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}