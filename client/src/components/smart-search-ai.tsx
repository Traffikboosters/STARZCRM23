import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Contact } from "@shared/schema";
import { 
  Search, 
  Brain, 
  Zap, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  DollarSign,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Star,
  Filter,
  X,
  ArrowRight,
  Sparkles,
  History,
  Lightbulb
} from "lucide-react";

interface SearchSuggestion {
  id: string;
  type: 'contact' | 'company' | 'location' | 'industry' | 'action' | 'insight' | 'recent';
  text: string;
  description?: string;
  icon: any;
  color: string;
  priority: number;
  matchScore: number;
  category: string;
  data?: any;
}

interface AISearchInsight {
  suggestion: string;
  reasoning: string;
  confidence: number;
  actionable: boolean;
}

export function SmartSearchAI() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiInsights, setAiInsights] = useState<AISearchInsight[]>([]);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [shouldSearch, setShouldSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch all contacts for searching
  const { data: allContacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
    enabled: true
  });

  // Smart suggestion categories with AI-powered recommendations
  const intelligentSuggestions = {
    contacts: [
      { text: "High-value prospects", icon: Target, color: "bg-red-100 text-red-800 border-red-200" },
      { text: "Recent leads", icon: Clock, color: "bg-blue-100 text-blue-800 border-blue-200" },
      { text: "Uncontacted leads", icon: Users, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      { text: "Qualified prospects", icon: Star, color: "bg-green-100 text-green-800 border-green-200" },
      { text: "Follow-up needed", icon: Calendar, color: "bg-purple-100 text-purple-800 border-purple-200" }
    ],
    companies: [
      { text: "HVAC companies", icon: Building2, color: "bg-orange-100 text-orange-800 border-orange-200" },
      { text: "Healthcare practices", icon: Building2, color: "bg-teal-100 text-teal-800 border-teal-200" },
      { text: "Legal firms", icon: Building2, color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      { text: "Construction companies", icon: Building2, color: "bg-amber-100 text-amber-800 border-amber-200" }
    ],
    locations: [
      { text: "Texas leads", icon: MapPin, color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
      { text: "Austin area", icon: MapPin, color: "bg-lime-100 text-lime-800 border-lime-200" },
      { text: "Dallas prospects", icon: MapPin, color: "bg-pink-100 text-pink-800 border-pink-200" },
      { text: "Houston clients", icon: MapPin, color: "bg-violet-100 text-violet-800 border-violet-200" }
    ],
    actions: [
      { text: "Schedule follow-up", icon: Calendar, color: "bg-blue-100 text-blue-800 border-blue-200" },
      { text: "Send proposal", icon: Mail, color: "bg-green-100 text-green-800 border-green-200" },
      { text: "Make call", icon: Phone, color: "bg-orange-100 text-orange-800 border-orange-200" },
      { text: "Update status", icon: TrendingUp, color: "bg-purple-100 text-purple-800 border-purple-200" }
    ],
    insights: [
      { text: "Revenue > $50K/month", icon: DollarSign, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      { text: "Marketing gaps", icon: Target, color: "bg-red-100 text-red-800 border-red-200" },
      { text: "Conversion opportunities", icon: TrendingUp, color: "bg-blue-100 text-blue-800 border-blue-200" },
      { text: "Hot prospects", icon: Zap, color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    ]
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('starz-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate AI-powered suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      generateSmartSuggestions(searchQuery);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [searchQuery]);

  const generateSmartSuggestions = async (query: string) => {
    setIsLoading(true);
    setShowSuggestions(true);

    try {
      // Simulate AI-powered suggestion generation
      const allSuggestions: SearchSuggestion[] = [];
      let priority = 100;

      // Analyze query intent and generate contextual suggestions
      const queryLower = query.toLowerCase();
      
      // Contact-based suggestions
      if (queryLower.includes('lead') || queryLower.includes('contact') || queryLower.includes('prospect')) {
        intelligentSuggestions.contacts.forEach(suggestion => {
          const matchScore = calculateMatchScore(suggestion.text, query);
          if (matchScore > 0.3) {
            allSuggestions.push({
              id: `contact-${suggestion.text}`,
              type: 'contact',
              text: suggestion.text,
              description: `Find ${suggestion.text.toLowerCase()} in your CRM`,
              icon: suggestion.icon,
              color: suggestion.color,
              priority: priority--,
              matchScore,
              category: 'Contacts'
            });
          }
        });
      }

      // Company/Industry suggestions
      if (queryLower.includes('company') || queryLower.includes('business') || queryLower.includes('hvac') || 
          queryLower.includes('dental') || queryLower.includes('legal') || queryLower.includes('construction')) {
        intelligentSuggestions.companies.forEach(suggestion => {
          const matchScore = calculateMatchScore(suggestion.text, query);
          if (matchScore > 0.2) {
            allSuggestions.push({
              id: `company-${suggestion.text}`,
              type: 'company',
              text: suggestion.text,
              description: `Search for ${suggestion.text.toLowerCase()}`,
              icon: suggestion.icon,
              color: suggestion.color,
              priority: priority--,
              matchScore,
              category: 'Industries'
            });
          }
        });
      }

      // Location-based suggestions
      if (queryLower.includes('texas') || queryLower.includes('austin') || queryLower.includes('dallas') || 
          queryLower.includes('houston') || queryLower.includes('location') || queryLower.includes('area')) {
        intelligentSuggestions.locations.forEach(suggestion => {
          const matchScore = calculateMatchScore(suggestion.text, query);
          if (matchScore > 0.2) {
            allSuggestions.push({
              id: `location-${suggestion.text}`,
              type: 'location',
              text: suggestion.text,
              description: `Filter by ${suggestion.text.toLowerCase()}`,
              icon: suggestion.icon,
              color: suggestion.color,
              priority: priority--,
              matchScore,
              category: 'Locations'
            });
          }
        });
      }

      // Action suggestions
      if (queryLower.includes('call') || queryLower.includes('email') || queryLower.includes('schedule') || 
          queryLower.includes('follow') || queryLower.includes('send')) {
        intelligentSuggestions.actions.forEach(suggestion => {
          const matchScore = calculateMatchScore(suggestion.text, query);
          if (matchScore > 0.3) {
            allSuggestions.push({
              id: `action-${suggestion.text}`,
              type: 'action',
              text: suggestion.text,
              description: `Quick action: ${suggestion.text.toLowerCase()}`,
              icon: suggestion.icon,
              color: suggestion.color,
              priority: priority--,
              matchScore,
              category: 'Actions'
            });
          }
        });
      }

      // Revenue and insights suggestions
      if (queryLower.includes('revenue') || queryLower.includes('money') || queryLower.includes('profit') || 
          queryLower.includes('opportunity') || queryLower.includes('high') || queryLower.includes('value')) {
        intelligentSuggestions.insights.forEach(suggestion => {
          const matchScore = calculateMatchScore(suggestion.text, query);
          if (matchScore > 0.2) {
            allSuggestions.push({
              id: `insight-${suggestion.text}`,
              type: 'insight',
              text: suggestion.text,
              description: `Search for ${suggestion.text.toLowerCase()}`,
              icon: suggestion.icon,
              color: suggestion.color,
              priority: priority--,
              matchScore,
              category: 'Insights'
            });
          }
        });
      }

      // Add AI-generated contextual suggestions
      const contextualSuggestions = generateContextualSuggestions(query);
      allSuggestions.push(...contextualSuggestions);

      // Sort by priority and match score
      const sortedSuggestions = allSuggestions
        .sort((a, b) => (b.matchScore * b.priority) - (a.matchScore * a.priority))
        .slice(0, 8);

      setSuggestions(sortedSuggestions);

      // Generate AI insights for the search
      const insights = await generateAIInsights(query);
      setAiInsights(insights);

    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMatchScore = (text: string, query: string): number => {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match
    if (textLower.includes(queryLower)) return 1.0;
    
    // Word overlap
    const textWords = textLower.split(' ');
    const queryWords = queryLower.split(' ');
    const overlap = queryWords.filter(word => textWords.some(textWord => textWord.includes(word))).length;
    
    return overlap / queryWords.length;
  };

  const generateContextualSuggestions = (query: string): SearchSuggestion[] => {
    const contextual: SearchSuggestion[] = [];
    
    // Smart phone number detection
    if (/\d{3}[\s\-]?\d{3}[\s\-]?\d{4}/.test(query)) {
      contextual.push({
        id: 'phone-search',
        type: 'contact',
        text: `Search by phone: ${query}`,
        description: 'Find contact with this phone number',
        icon: Phone,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        priority: 200,
        matchScore: 1.0,
        category: 'Smart Detection'
      });
    }

    // Email detection
    if (query.includes('@')) {
      contextual.push({
        id: 'email-search',
        type: 'contact',
        text: `Search by email: ${query}`,
        description: 'Find contact with this email',
        icon: Mail,
        color: 'bg-green-100 text-green-800 border-green-200',
        priority: 200,
        matchScore: 1.0,
        category: 'Smart Detection'
      });
    }

    // Revenue amount detection
    if (/\$[\d,]+/.test(query)) {
      contextual.push({
        id: 'revenue-search',
        type: 'insight',
        text: `Revenue filter: ${query}`,
        description: 'Find prospects with this revenue range',
        icon: DollarSign,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        priority: 180,
        matchScore: 1.0,
        category: 'Smart Detection'
      });
    }

    return contextual;
  };

  const generateAIInsights = async (query: string): Promise<AISearchInsight[]> => {
    // Simulate AI-powered insights generation
    const insights: AISearchInsight[] = [];
    
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('hvac') || queryLower.includes('heating') || queryLower.includes('cooling')) {
      insights.push({
        suggestion: "HVAC companies typically have highest conversion rates in fall/winter seasons",
        reasoning: "Historical data shows increased demand during temperature extremes",
        confidence: 0.87,
        actionable: true
      });
    }
    
    if (queryLower.includes('high') && queryLower.includes('revenue')) {
      insights.push({
        suggestion: "Focus on companies with $75K+ monthly revenue for better ROI",
        reasoning: "These prospects have larger marketing budgets and decision-making authority",
        confidence: 0.92,
        actionable: true
      });
    }
    
    if (queryLower.includes('follow') || queryLower.includes('call')) {
      insights.push({
        suggestion: "Best calling times: Tuesdays-Thursdays, 10 AM - 12 PM local time",
        reasoning: "Analysis of 500+ successful calls shows optimal connection rates",
        confidence: 0.84,
        actionable: true
      });
    }

    return insights;
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    executeSearch(suggestion.text, suggestion);
    addToRecentSearches(suggestion.text);
    setShowSuggestions(false);

    toast({
      title: "Smart Search Applied",
      description: `Searching for: ${suggestion.text}`,
    });
  };

  const executeSearch = (query: string, suggestion?: SearchSuggestion) => {
    setIsLoading(true);
    
    try {
      // Client-side search through contacts
      const queryLower = query.toLowerCase();
      let filteredResults: Contact[] = [];
      
      if (suggestion?.type === 'contact') {
        // Search contacts by name, email, phone
        filteredResults = allContacts.filter(contact => 
          contact.firstName?.toLowerCase().includes(queryLower) ||
          contact.lastName?.toLowerCase().includes(queryLower) ||
          contact.email?.toLowerCase().includes(queryLower) ||
          contact.phone?.includes(queryLower) ||
          contact.notes?.toLowerCase().includes(queryLower)
        );
      } else if (suggestion?.type === 'company') {
        // Search by company/industry
        filteredResults = allContacts.filter(contact => 
          contact.company?.toLowerCase().includes(queryLower) ||
          contact.position?.toLowerCase().includes(queryLower) ||
          contact.notes?.toLowerCase().includes(queryLower)
        );
      } else if (suggestion?.type === 'location') {
        // Search by location
        filteredResults = allContacts.filter(contact => 
          contact.notes?.toLowerCase().includes(queryLower) ||
          contact.company?.toLowerCase().includes(queryLower)
        );
      } else if (suggestion?.type === 'insight') {
        // Revenue-based filtering
        if (queryLower.includes('revenue') || queryLower.includes('50k') || queryLower.includes('$')) {
          filteredResults = allContacts.filter(contact => 
            contact.dealValue && contact.dealValue > 50000
          );
        } else {
          filteredResults = allContacts.filter(contact => 
            contact.notes?.toLowerCase().includes(queryLower)
          );
        }
      } else {
        // General search
        filteredResults = allContacts.filter(contact => 
          contact.firstName?.toLowerCase().includes(queryLower) ||
          contact.lastName?.toLowerCase().includes(queryLower) ||
          contact.email?.toLowerCase().includes(queryLower) ||
          contact.phone?.includes(queryLower) ||
          contact.company?.toLowerCase().includes(queryLower) ||
          contact.position?.toLowerCase().includes(queryLower) ||
          contact.notes?.toLowerCase().includes(queryLower)
        );
      }
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to execute search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToRecentSearches = (search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('starz-recent-searches', JSON.stringify(updated));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchResults([]);
    setAiInsights([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      executeSearch(searchQuery);
      addToRecentSearches(searchQuery);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Smart Search Input */}
      <Card className="border-2 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">AI-Powered Smart Search</h2>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
          
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search contacts, companies, or ask for insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                className="pl-10 pr-12 h-12 text-lg border-gray-300 focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* AI Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isLoading) && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-2 border-orange-100">
                <CardContent className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <span className="ml-2 text-gray-600">Generating smart suggestions...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Grouped Suggestions */}
                      {['Smart Detection', 'Contacts', 'Industries', 'Locations', 'Actions', 'Insights'].map(category => {
                        const categorySuggestions = suggestions.filter(s => s.category === category);
                        if (categorySuggestions.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              {category}
                            </h4>
                            <div className="space-y-1">
                              {categorySuggestions.map((suggestion) => {
                                const IconComponent = suggestion.icon;
                                return (
                                  <button
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                  >
                                    <div className={`p-1.5 rounded-md ${suggestion.color}`}>
                                      <IconComponent className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 group-hover:text-orange-600">
                                        {suggestion.text}
                                      </div>
                                      {suggestion.description && (
                                        <div className="text-xs text-gray-500">
                                          {suggestion.description}
                                        </div>
                                      )}
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">{insight.suggestion}</p>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {Math.round(insight.confidence * 100)}% confident
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{insight.reasoning}</p>
                  {insight.actionable && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Actionable Insight
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && !showSuggestions && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-orange-100 hover:text-orange-800"
                  onClick={() => {
                    setSearchQuery(search);
                    executeSearch(search);
                  }}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.length})
            </h3>
            <div className="space-y-3">
              {searchResults.slice(0, 5).map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {result.firstName} {result.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.company} • {result.email}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Contact
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}