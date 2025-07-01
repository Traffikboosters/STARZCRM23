import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Target,
  Download,
  Search,
  Filter,
  AlertCircle,
  Database,
  Trophy,
  Calendar,
  Bot,
  Zap,
  StickyNote,
  ClipboardList
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import traffikBoostersLogo from '@assets/TRAFIC BOOSTERS3 copy_1751060321835.png';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  notes: string | null;
  leadSource: string | null;
  leadStatus: string | null;
  priority: string | null;
  dealValue: number | null;
  lastContactedAt: Date | null;
  nextFollowUpAt: Date | null;
  assignedTo: number | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number | null;
  tags: string[] | null;
  isDemo: boolean;
}

export function HighRevenueProspects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch high-revenue prospects from contacts with specific lead sources
  const { data: allContacts = [], isLoading, refetch } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  // Filter for high-revenue prospect sources
  const prospects = allContacts.filter(contact => {
    const sources = ['google_maps_enhanced', 'bark_dashboard', 'yellowpages'];
    return sources.includes(contact.leadSource || '') && !contact.isDemo;
  });

  // Apply filters
  const filteredProspects = prospects.filter(contact => {
    const matchesSearch = !searchTerm || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform = platformFilter === 'all' || contact.leadSource === platformFilter;
    
    return matchesSearch && matchesPlatform;
  });

  // Check if a contact is new (created within 24 hours)
  const isNewContact = (contact: Contact) => {
    const now = new Date();
    const createdAt = new Date(contact.createdAt);
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  // Format phone number
  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return 'No phone';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  // Get lead source display name
  const getSourceDisplayName = (source: string | null) => {
    switch (source) {
      case 'google_maps_enhanced': return 'Google Maps';
      case 'bark_dashboard': return 'Bark.com';
      case 'yellowpages': return 'Yellow Pages';
      default: return source || 'Unknown';
    }
  };

  // Get lead source color
  const getSourceColor = (source: string | null) => {
    switch (source) {
      case 'google_maps_enhanced': return 'bg-blue-100 text-blue-800';
      case 'bark_dashboard': return 'bg-purple-100 text-purple-800';
      case 'yellowpages': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Extraction functions
  const extractGoogleMapsLeads = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    toast({
      title: "Starting Extraction",
      description: "Extracting high-revenue prospects from Google Maps...",
    });
    
    try {
      const response = await fetch('/api/scraping-jobs/google-maps-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (response.ok && result.leadsExtracted > 0) {
        toast({
          title: "✅ Extraction Successful",
          description: `Extracted ${result.leadsExtracted} high-revenue prospects from Google Maps`,
        });
        refetch();
      } else {
        throw new Error(`Extraction returned ${result.leadsExtracted || 0} leads`);
      }
    } catch (error) {
      toast({
        title: "❌ Extraction Failed",
        description: "Unable to extract Google Maps leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractBarkLeads = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    toast({
      title: "Starting Extraction",
      description: "Extracting high-revenue service businesses from Bark.com...",
    });
    
    try {
      const response = await fetch('/api/scraping-jobs/bark-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (response.ok && result.leadsExtracted > 0) {
        toast({
          title: "✅ Extraction Successful",
          description: `Extracted ${result.leadsExtracted} high-revenue service businesses from Bark.com`,
        });
        refetch();
      } else {
        throw new Error(`Extraction returned ${result.leadsExtracted || 0} leads`);
      }
    } catch (error) {
      toast({
        title: "❌ Extraction Failed",
        description: "Unable to extract Bark.com leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractYellowPagesLeads = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    toast({
      title: "Starting Extraction",
      description: "Extracting established businesses from Yellow Pages...",
    });
    
    try {
      const response = await fetch('/api/scraping-jobs/yellowpages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (response.ok && result.leadsExtracted > 0) {
        toast({
          title: "✅ Extraction Successful",
          description: `Extracted ${result.leadsExtracted} established businesses from Yellow Pages`,
        });
        refetch();
      } else {
        throw new Error(`Extraction returned ${result.leadsExtracted || 0} leads`);
      }
    } catch (error) {
      toast({
        title: "❌ Extraction Failed",
        description: "Unable to extract Yellow Pages leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-20 w-auto crisp-edges"
          />
          <div>
            <h1 className="text-3xl font-bold text-black">High Revenue Prospects</h1>
            <p className="text-gray-600">Target businesses averaging $55,000+ monthly revenue</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          <Trophy className="h-4 w-4 mr-2" />
          {prospects.length} Prospects
        </Badge>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search prospects by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Platform Filter */}
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="google_maps_enhanced">Google Maps</SelectItem>
            <SelectItem value="bark_dashboard">Bark.com</SelectItem>
            <SelectItem value="yellowpages">Yellow Pages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Extraction Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={extractGoogleMapsLeads}
          disabled={loading}
          className="h-16 bg-blue-600 hover:bg-blue-700"
        >
          <Globe className="h-5 w-5 mr-2" />
          Extract Google Maps
        </Button>
        <Button 
          onClick={extractBarkLeads}
          disabled={loading}
          className="h-16 bg-purple-600 hover:bg-purple-700"
        >
          <Building2 className="h-5 w-5 mr-2" />
          Extract Bark.com
        </Button>
        <Button 
          onClick={extractYellowPagesLeads}
          disabled={loading}
          className="h-16 bg-yellow-600 hover:bg-yellow-700"
        >
          <Database className="h-5 w-5 mr-2" />
          Extract Yellow Pages
        </Button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading prospects...</p>
        </div>
      ) : filteredProspects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No High Revenue Prospects Found</h3>
            <p className="text-gray-600 mb-4">
              Use the extraction buttons above to find high-revenue businesses from Google Maps, Bark.com, and Yellow Pages.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProspects.map((contact) => {
            const isNew = isNewContact(contact);
            return (
              <Card 
                key={contact.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  isNew ? 'bg-green-50 border-green-200 ring-2 ring-green-300' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={traffikBoostersLogo} 
                        alt="Traffik Boosters" 
                        className="h-16 w-auto crisp-edges"
                      />
                      <div>
                        <h3 className="text-black font-medium">Lead Card</h3>
                      </div>
                    </div>
                    {isNew && (
                      <Badge className="bg-green-600 text-white animate-pulse">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <Badge className={`w-fit ${getSourceColor(contact.leadSource)}`}>
                    {getSourceDisplayName(contact.leadSource)}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">
                      {contact.firstName} {contact.lastName}
                    </h4>
                    {contact.company && (
                      <p className="text-gray-600 font-medium">{contact.company}</p>
                    )}
                    {contact.position && (
                      <p className="text-sm text-gray-500">{contact.position}</p>
                    )}
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{contact.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{formatPhoneNumber(contact.phone)}</span>
                    </div>
                  </div>

                  {/* Deal Value */}
                  {contact.dealValue && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Deal Value: ${contact.dealValue.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Priority */}
                  {contact.priority && (
                    <Badge 
                      variant={contact.priority === 'high' ? 'destructive' : 'secondary'}
                      className="w-fit"
                    >
                      {contact.priority.toUpperCase()} Priority
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-16 flex-col gap-1"
                      onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-xs">Call</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-16 flex-col gap-1"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Schedule</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-16 flex-col gap-1"
                      onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-xs">Email</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-16 flex-col gap-1"
                    >
                      <StickyNote className="h-4 w-4" />
                      <span className="text-xs">Notes</span>
                    </Button>
                  </div>

                  {/* Creation Date */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Added: {new Date(contact.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}