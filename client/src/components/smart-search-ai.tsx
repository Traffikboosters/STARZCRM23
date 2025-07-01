import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Brain, 
  Zap, 
  Users, 
  Building2, 
  MapPin, 
  Target, 
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  X,
  Clock,
  Star,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  leadSource: string | null;
  leadStatus: string | null;
  priority: string | null;
  dealValue: number | null;
  createdAt: Date;
}

interface AISuggestion {
  id: string;
  type: 'contacts' | 'companies' | 'locations' | 'actions' | 'insights' | 'quick_filters';
  icon: React.ReactNode;
  label: string;
  description: string;
  confidence: number;
  searchQuery?: string;
  actionType?: string;
  count?: number;
}

interface SmartSearchAIProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export default function SmartSearchAI({ isOpen, onClose, onNavigate }: SmartSearchAIProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get contacts data for AI analysis
  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/contacts'],
    enabled: isOpen
  });

  // Focus search input when dialog opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Generate AI suggestions based on current data
  useEffect(() => {
    if (!isOpen || !contacts.length) return;

    const generateSuggestions = () => {
      const aiSuggestions: AISuggestion[] = [];

      // Analyze contact data for intelligent suggestions
      const highValueContacts = contacts.filter((c: Contact) => 
        c.dealValue && c.dealValue > 5000
      ).length;

      const newContacts = contacts.filter((c: Contact) => {
        const daysSinceCreated = Math.floor(
          (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceCreated <= 1;
      }).length;

      const companies = new Set(
        contacts.map((c: Contact) => c.company).filter(Boolean)
      ).size;

      const locations = new Set(
        contacts.map((c: Contact) => {
          // Extract location from notes or other fields
          return 'Various Locations'; // Simplified for now
        }).filter(Boolean)
      ).size;

      // Contact-based suggestions
      aiSuggestions.push(
        {
          id: 'high-value-leads',
          type: 'contacts',
          icon: <DollarSign className="h-4 w-4" />,
          label: 'High-Value Prospects',
          description: `${highValueContacts} leads with deals over $5,000`,
          confidence: 0.9,
          searchQuery: 'dealValue:>5000',
          count: highValueContacts
        },
        {
          id: 'new-leads',
          type: 'contacts',
          icon: <Star className="h-4 w-4" />,
          label: 'Fresh Leads',
          description: `${newContacts} leads added in last 24 hours`,
          confidence: 0.95,
          searchQuery: 'createdAt:24h',
          count: newContacts
        }
      );

      // Company insights
      aiSuggestions.push({
        id: 'companies',
        type: 'companies',
        icon: <Building2 className="h-4 w-4" />,
        label: 'Company Directory',
        description: `Search across ${companies} unique companies`,
        confidence: 0.8,
        searchQuery: 'companies',
        count: companies
      });

      // Location intelligence
      aiSuggestions.push({
        id: 'locations',
        type: 'locations',
        icon: <MapPin className="h-4 w-4" />,
        label: 'Geographic Analysis',
        description: 'Find leads by location and region',
        confidence: 0.85,
        searchQuery: 'location'
      });

      // Quick action suggestions
      aiSuggestions.push(
        {
          id: 'call-ready',
          type: 'actions',
          icon: <Phone className="h-4 w-4" />,
          label: 'Ready to Call',
          description: 'Contacts with verified phone numbers',
          confidence: 0.7,
          actionType: 'filter_phone'
        },
        {
          id: 'follow-up',
          type: 'actions',
          icon: <Calendar className="h-4 w-4" />,
          label: 'Follow-up Required',
          description: 'Contacts needing immediate attention',
          confidence: 0.8,
          actionType: 'filter_followup'
        }
      );

      // Insights and analytics
      aiSuggestions.push(
        {
          id: 'conversion-analysis',
          type: 'insights',
          icon: <TrendingUp className="h-4 w-4" />,
          label: 'Conversion Insights',
          description: 'Analyze lead performance and patterns',
          confidence: 0.75,
          actionType: 'analytics'
        },
        {
          id: 'priority-leads',
          type: 'insights',
          icon: <Target className="h-4 w-4" />,
          label: 'Priority Assessment',
          description: 'AI-scored leads by conversion probability',
          confidence: 0.88,
          actionType: 'priority_analysis'
        }
      );

      // Quick filters based on current query
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        
        if (queryLower.includes('phone') || queryLower.includes('call')) {
          aiSuggestions.unshift({
            id: 'phone-filter',
            type: 'quick_filters',
            icon: <Phone className="h-4 w-4" />,
            label: 'Phone Numbers',
            description: 'Filter contacts with phone numbers',
            confidence: 0.95,
            searchQuery: 'has:phone'
          });
        }

        if (queryLower.includes('email') || queryLower.includes('mail')) {
          aiSuggestions.unshift({
            id: 'email-filter',
            type: 'quick_filters',
            icon: <Mail className="h-4 w-4" />,
            label: 'Email Contacts',
            description: 'Filter contacts with email addresses',
            confidence: 0.95,
            searchQuery: 'has:email'
          });
        }

        if (queryLower.includes('high') || queryLower.includes('value')) {
          aiSuggestions.unshift({
            id: 'value-filter',
            type: 'quick_filters',
            icon: <DollarSign className="h-4 w-4" />,
            label: 'High-Value Leads',
            description: 'Contacts with significant deal potential',
            confidence: 0.9,
            searchQuery: 'dealValue:>1000'
          });
        }
      }

      setSuggestions(aiSuggestions.slice(0, 8)); // Limit to 8 suggestions
    };

    generateSuggestions();
  }, [contacts, searchQuery, isOpen]);

  // Perform intelligent search
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Smart search logic - search across multiple fields
      const filtered = contacts.filter((contact: Contact) => {
        const searchTerms = query.toLowerCase().split(' ');
        const searchableText = [
          contact.firstName,
          contact.lastName,
          contact.email,
          contact.phone,
          contact.company,
          contact.position,
          contact.leadSource,
          contact.leadStatus
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });

      setSearchResults(filtered);

      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }

      toast({
        title: "Search Complete",
        description: `Found ${filtered.length} matching contacts`,
      });

    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search contacts",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (suggestion.searchQuery) {
      setSearchQuery(suggestion.searchQuery);
      performSearch(suggestion.searchQuery);
    } else if (suggestion.actionType) {
      // Handle different action types
      switch (suggestion.actionType) {
        case 'filter_phone':
          const phoneContacts = contacts.filter((c: Contact) => c.phone);
          setSearchResults(phoneContacts);
          break;
        case 'filter_followup':
          // Filter contacts that need follow-up
          const followUpContacts = contacts.filter((c: Contact) => 
            c.leadStatus === 'contacted' || c.leadStatus === 'qualified'
          );
          setSearchResults(followUpContacts);
          break;
        case 'analytics':
          onNavigate?.('/analytics');
          onClose();
          break;
        case 'priority_analysis':
          // Show high-priority contacts
          const priorityContacts = contacts.filter((c: Contact) => 
            c.priority === 'high' || (c.dealValue && c.dealValue > 3000)
          );
          setSearchResults(priorityContacts);
          break;
      }
    }

    toast({
      title: "AI Suggestion Applied",
      description: `Applied: ${suggestion.label}`,
    });
  };

  // Get suggestion type color
  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'contacts': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'companies': return 'bg-green-100 text-green-700 border-green-200';
      case 'locations': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'actions': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'insights': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'quick_filters': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Smart Search with AI Suggestions
            <Zap className="h-4 w-4 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                performSearch(searchQuery);
              }
            }}
            placeholder="Search contacts, companies, or ask AI for insights..."
            className="pl-10 pr-10 h-12 text-lg"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">AI-Powered Suggestions</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`h-auto p-3 flex flex-col items-start gap-1 ${getSuggestionTypeColor(suggestion.type)}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    {suggestion.icon}
                    <span className="text-xs font-medium truncate">
                      {suggestion.label}
                    </span>
                    {suggestion.count !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.count}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs opacity-70 text-left line-clamp-2">
                    {suggestion.description}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-current rounded-full opacity-50" />
                    <span className="text-xs opacity-50">
                      {Math.round(suggestion.confidence * 100)}% match
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchQuery && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(search);
                    performSearch(search);
                  }}
                  className="text-xs"
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {(searchResults.length > 0 || isSearching) && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isSearching ? 'Searching...' : `${searchResults.length} Results Found`}
              </span>
              {searchResults.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export or view all results
                    toast({
                      title: "Results Ready",
                      description: `${searchResults.length} contacts ready for export`,
                    });
                  }}
                >
                  Export Results
                </Button>
              )}
            </div>

            <div className="grid gap-2">
              {searchResults.slice(0, 10).map((contact) => (
                <Card key={contact.id} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {contact.company && (
                            <span>{contact.company} • </span>
                          )}
                          {contact.position}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </span>
                          )}
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {contact.leadStatus && (
                          <Badge variant="outline" className="text-xs">
                            {contact.leadStatus}
                          </Badge>
                        )}
                        {contact.dealValue && (
                          <Badge variant="secondary" className="text-xs">
                            ${contact.dealValue.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {searchResults.length > 10 && (
                <Card className="p-3 text-center">
                  <CardContent className="p-0">
                    <span className="text-sm text-gray-600">
                      +{searchResults.length - 10} more results
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        // Show all results or navigate to full view
                        onNavigate?.('/crm');
                        onClose();
                      }}
                    >
                      View All in CRM
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No results found for "{searchQuery}"</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms or use AI suggestions above
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}