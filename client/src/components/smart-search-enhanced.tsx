import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Sparkles, 
  Filter, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign,
  Tag,
  Clock,
  TrendingUp,
  Bot,
  X,
  ArrowRight,
  Target,
  Zap
} from "lucide-react";
import type { Contact } from "@shared/schema";

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'contact' | 'company' | 'industry' | 'location' | 'action' | 'filter';
  icon: React.ReactNode;
  count?: number;
  confidence: number;
  context?: string;
}

interface SmartSearchResult {
  contacts: Contact[];
  suggestions: SearchSuggestion[];
  totalMatches: number;
  searchTime: number;
  aiInsights: string[];
}

interface SmartSearchProps {
  onContactSelect?: (contact: Contact) => void;
  onFilterApply?: (filters: any) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

export default function SmartSearchEnhanced({ onContactSelect, onFilterApply, placeholder = "Search contacts, companies, or ask AI...", fullWidth = false }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SmartSearchResult | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch contacts for search
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // AI-powered search suggestions based on query
  const generateSuggestions = useCallback((searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery || searchQuery.length < 2) {
      return [
        {
          id: 'recent-1',
          text: 'High-revenue prospects',
          type: 'filter',
          icon: <DollarSign className="h-4 w-4" />,
          confidence: 95,
          context: 'Companies with $55K+ monthly revenue'
        },
        {
          id: 'recent-2', 
          text: 'New leads from last 24 hours',
          type: 'filter',
          icon: <Clock className="h-4 w-4" />,
          confidence: 90,
          context: 'Contacts added in past day'
        },
        {
          id: 'recent-3',
          text: 'Healthcare industry prospects',
          type: 'industry',
          icon: <Building2 className="h-4 w-4" />,
          confidence: 85,
          context: 'Medical, dental, and health services'
        },
        {
          id: 'recent-4',
          text: 'Florida-based contacts',
          type: 'location',
          icon: <MapPin className="h-4 w-4" />,
          confidence: 80,
          context: 'Contacts located in Florida'
        }
      ];
    }

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Contact name matches
    const nameMatches = contacts.filter(contact => 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(lowerQuery)
    );
    if (nameMatches.length > 0) {
      suggestions.push({
        id: 'name-match',
        text: `Contacts named "${searchQuery}"`,
        type: 'contact',
        icon: <Users className="h-4 w-4" />,
        count: nameMatches.length,
        confidence: 95,
        context: `${nameMatches.length} matching contacts found`
      });
    }

    // Company matches
    const companyMatches = contacts.filter(contact => 
      contact.company?.toLowerCase().includes(lowerQuery)
    );
    if (companyMatches.length > 0) {
      suggestions.push({
        id: 'company-match',
        text: `Companies containing "${searchQuery}"`,
        type: 'company',
        icon: <Building2 className="h-4 w-4" />,
        count: companyMatches.length,
        confidence: 90,
        context: `${companyMatches.length} matching companies`
      });
    }

    // Location matches
    const locationMatches = contacts.filter(contact => 
      contact.notes?.toLowerCase().includes(lowerQuery) ||
      contact.position?.toLowerCase().includes(lowerQuery)
    );
    if (locationMatches.length > 0) {
      suggestions.push({
        id: 'location-match',
        text: `Contacts in "${searchQuery}"`,
        type: 'location',
        icon: <MapPin className="h-4 w-4" />,
        count: locationMatches.length,
        confidence: 85,
        context: `${locationMatches.length} contacts found`
      });
    }

    // Smart action suggestions
    if (lowerQuery.includes('call') || lowerQuery.includes('phone')) {
      suggestions.push({
        id: 'action-call',
        text: 'Show contacts with phone numbers',
        type: 'action',
        icon: <Phone className="h-4 w-4" />,
        confidence: 80,
        context: 'Filter contacts ready for calling'
      });
    }

    if (lowerQuery.includes('email') || lowerQuery.includes('mail')) {
      suggestions.push({
        id: 'action-email',
        text: 'Show contacts with email addresses',
        type: 'action',
        icon: <Mail className="h-4 w-4" />,
        confidence: 80,
        context: 'Filter contacts ready for email outreach'
      });
    }

    if (lowerQuery.includes('high') && lowerQuery.includes('value')) {
      suggestions.push({
        id: 'filter-high-value',
        text: 'High-value prospects ($10K+ deals)',
        type: 'filter',
        icon: <Target className="h-4 w-4" />,
        confidence: 90,
        context: 'Contacts with deal value over $10,000'
      });
    }

    // Industry suggestions
    const industries = ['healthcare', 'construction', 'automotive', 'restaurant', 'retail', 'technology', 'manufacturing'];
    industries.forEach(industry => {
      if (lowerQuery.includes(industry)) {
        suggestions.push({
          id: `industry-${industry}`,
          text: `${industry.charAt(0).toUpperCase() + industry.slice(1)} industry contacts`,
          type: 'industry',
          icon: <Building2 className="h-4 w-4" />,
          confidence: 85,
          context: `Contacts in ${industry} sector`
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
  }, [contacts]);

  // Perform smart search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    const startTime = Date.now();

    try {
      // Simulate API call delay for realism
      await new Promise(resolve => setTimeout(resolve, 300));

      const lowerQuery = searchQuery.toLowerCase();
      
      // Search contacts
      const matchingContacts = contacts.filter(contact => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        const company = contact.company?.toLowerCase() || '';
        const email = contact.email?.toLowerCase() || '';
        const phone = contact.phone?.toLowerCase() || '';
        const notes = contact.notes?.toLowerCase() || '';
        const position = contact.position?.toLowerCase() || '';

        return fullName.includes(lowerQuery) ||
               company.includes(lowerQuery) ||
               email.includes(lowerQuery) ||
               phone.includes(lowerQuery) ||
               notes.includes(lowerQuery) ||
               position.includes(lowerQuery);
      });

      // Generate AI insights
      const aiInsights = [
        `Found ${matchingContacts.length} contacts matching "${searchQuery}"`,
        matchingContacts.length > 0 ? 
          `Top result: ${matchingContacts[0].firstName} ${matchingContacts[0].lastName} at ${matchingContacts[0].company}` :
          'Try adjusting your search terms or use AI suggestions',
        matchingContacts.length > 5 ? 
          'Consider adding more specific filters to narrow results' :
          'Consider broadening your search for more results'
      ];

      const results: SmartSearchResult = {
        contacts: matchingContacts,
        suggestions: generateSuggestions(searchQuery),
        totalMatches: matchingContacts.length,
        searchTime: Date.now() - startTime,
        aiInsights
      };

      setSearchResults(results);
      
      // Add to search history
      setSearchHistory(prev => [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 5));

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Unable to perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [contacts, generateSuggestions, toast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0) {
        performSearch(query);
      } else {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const applySuggestion = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'contact':
      case 'company':
      case 'location':
        setQuery(suggestion.text.split('"')[1] || suggestion.text);
        break;
      case 'filter':
      case 'action':
        if (onFilterApply) {
          // Convert suggestion to filter
          const filter = {
            type: suggestion.type,
            value: suggestion.text,
            id: suggestion.id
          };
          onFilterApply(filter);
        }
        break;
      case 'industry':
        setQuery(suggestion.text.split(' ')[0]);
        break;
    }

    setSelectedSuggestions(prev => 
      prev.includes(suggestion.id) 
        ? prev.filter(id => id !== suggestion.id)
        : [...prev, suggestion.id]
    );
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults(null);
    setSelectedSuggestions([]);
  };

  return (
    <div className={`space-y-4 ${fullWidth ? 'w-full' : 'max-w-2xl mx-auto'}`}>
      {/* Search Input */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-20 text-base"
              autoComplete="off"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              {isSearching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
              )}
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(true)}
                className="h-6 w-6 p-0"
              >
                <Filter className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {(!query || query.length < 2) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {generateSuggestions("").map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {suggestion.icon}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{suggestion.text}</p>
                      {suggestion.context && (
                        <p className="text-xs text-gray-500">{suggestion.context}</p>
                      )}
                    </div>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Smart Search Results
              </CardTitle>
              <Badge variant="outline">
                {searchResults.totalMatches} matches in {searchResults.searchTime}ms
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* AI Insights */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                <Zap className="h-4 w-4" />
                AI Insights
              </h4>
              <ul className="space-y-1">
                {searchResults.aiInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-blue-700">• {insight}</li>
                ))}
              </ul>
            </div>

            {/* Enhanced Suggestions */}
            {searchResults.suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Related Suggestions</h4>
                <div className="flex flex-wrap gap-2">
                  {searchResults.suggestions.map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      variant={selectedSuggestions.includes(suggestion.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      className="flex items-center gap-1"
                    >
                      {suggestion.icon}
                      <span>{suggestion.text}</span>
                      {suggestion.count && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {suggestion.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Results */}
            {searchResults.contacts.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Matching Contacts</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.contacts.slice(0, 10).map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onContactSelect?.(contact)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-8 w-8 text-gray-600" />
                          <div>
                            <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                            <p className="text-sm text-gray-600">{contact.company}</p>
                            {contact.position && (
                              <p className="text-xs text-gray-500">{contact.position}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.phone && (
                            <Badge variant="outline" className="text-xs">
                              <Phone className="h-3 w-3 mr-1" />
                              Phone
                            </Badge>
                          )}
                          {contact.email && (
                            <Badge variant="outline" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {searchResults.contacts.length > 10 && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Showing first 10 of {searchResults.totalMatches} results
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No contacts found matching "{query}"</p>
                <p className="text-sm">Try using the AI suggestions above</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && !query && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {searchHistory.map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery(search)}
                  className="text-xs"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Search Dialog */}
      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Search
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Industry</label>
              <Input placeholder="e.g., Healthcare, Construction" />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="e.g., Florida, Miami" />
            </div>
            <div>
              <label className="text-sm font-medium">Deal Value</label>
              <Input placeholder="e.g., >$10,000" />
            </div>
            <div>
              <label className="text-sm font-medium">Lead Source</label>
              <Input placeholder="e.g., Google Maps, Referral" />
            </div>
            <Button className="w-full">Apply Advanced Filters</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}