import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Users, Building, Globe, Phone, Mail, User, Filter, Target, Search } from "lucide-react";

interface LocationData {
  leads: any[];
  salesReps: any[];
  businessInfo: any;
}

export function LocationTracker() {
  const [selectedTab, setSelectedTab] = useState("leads");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetingMode, setTargetingMode] = useState("view"); // view, target, analyze

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"]
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"]
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"]
  });

  // Enhanced location extraction with city, state, county parsing
  const extractDetailedLocation = (notes: string, company?: string) => {
    if (!notes && !company) return { city: null, state: null, county: null, fullLocation: "Unknown" };
    
    const text = `${notes || ''} ${company || ''}`.toLowerCase();
    
    // State abbreviations and full names
    const stateMap: Record<string, string> = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
    };

    // Major cities with their states
    const cityStateMap: Record<string, string> = {
      'new york': 'NY', 'los angeles': 'CA', 'chicago': 'IL', 'houston': 'TX', 'phoenix': 'AZ',
      'philadelphia': 'PA', 'san antonio': 'TX', 'san diego': 'CA', 'dallas': 'TX', 'san jose': 'CA',
      'austin': 'TX', 'jacksonville': 'FL', 'fort worth': 'TX', 'columbus': 'OH', 'charlotte': 'NC',
      'san francisco': 'CA', 'indianapolis': 'IN', 'seattle': 'WA', 'denver': 'CO', 'washington': 'DC',
      'boston': 'MA', 'el paso': 'TX', 'detroit': 'MI', 'nashville': 'TN', 'portland': 'OR',
      'memphis': 'TN', 'oklahoma city': 'OK', 'las vegas': 'NV', 'louisville': 'KY', 'baltimore': 'MD',
      'milwaukee': 'WI', 'albuquerque': 'NM', 'tucson': 'AZ', 'fresno': 'CA', 'mesa': 'AZ',
      'sacramento': 'CA', 'atlanta': 'GA', 'kansas city': 'MO', 'colorado springs': 'CO', 'miami': 'FL',
      'raleigh': 'NC', 'omaha': 'NE', 'long beach': 'CA', 'virginia beach': 'VA', 'oakland': 'CA'
    };

    // Enhanced location patterns
    const patterns = [
      // City, State pattern
      /([a-z\s]+),\s*([a-z]{2}|[a-z\s]+)\b/gi,
      // "in City, State" pattern
      /(?:in|from|located in|based in)\s+([a-z\s]+),\s*([a-z]{2}|[a-z\s]+)/gi,
      // County patterns
      /([a-z\s]+)\s+county/gi,
      // State only patterns
      /(?:in|from|located in|based in)\s+([a-z\s]+)(?:\s+state)?/gi
    ];

    let city = null;
    let state = null;
    let county = null;

    // Try to extract city, state combinations
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[2]) {
          // City, State pattern
          const potentialCity = match[1].trim();
          const potentialState = match[2].trim();
          
          if (stateMap[potentialState] || Object.values(stateMap).includes(potentialState.toUpperCase())) {
            city = potentialCity;
            state = stateMap[potentialState] || potentialState.toUpperCase();
            break;
          }
        } else if (match[0].includes('county')) {
          // County pattern
          county = match[1].trim();
        }
      }
    }

    // Check for known cities
    for (const [cityName, stateCode] of Object.entries(cityStateMap)) {
      if (text.includes(cityName)) {
        city = cityName;
        state = stateCode;
        break;
      }
    }

    // Check for states
    if (!state) {
      for (const [stateName, stateCode] of Object.entries(stateMap)) {
        if (text.includes(stateName) || text.includes(stateCode.toLowerCase())) {
          state = stateCode;
          break;
        }
      }
    }

    const fullLocation = [city, state, county].filter(Boolean).join(', ') || 'Unknown';
    
    return { city, state, county, fullLocation };
  };

  // Process leads with enhanced location data
  const leadsWithLocations = contacts.map(contact => {
    const locationData = extractDetailedLocation(contact.notes, contact.company);
    
    return {
      ...contact,
      ...locationData,
      location: locationData.fullLocation,
      region: locationData.state || 'Unknown'
    };
  });

  // Get unique states, cities, counties for filtering
  const allStates = leadsWithLocations.map(lead => lead.state).filter(Boolean);
  const allCities = leadsWithLocations.map(lead => lead.city).filter(Boolean);
  const allCounties = leadsWithLocations.map(lead => lead.county).filter(Boolean);
  
  const uniqueStates = Array.from(new Set(allStates)).sort();
  const uniqueCities = Array.from(new Set(allCities)).sort();
  const uniqueCounties = Array.from(new Set(allCounties)).sort();

  // Apply geographic filters
  const filteredLeads = leadsWithLocations.filter(lead => {
    if (selectedState !== "all" && lead.state !== selectedState) return false;
    if (selectedCity !== "all" && lead.city !== selectedCity) return false;
    if (selectedCounty !== "all" && lead.county !== selectedCounty) return false;
    if (searchQuery && !lead.fullLocation.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group leads by location
  const leadsByLocation = filteredLeads.reduce((acc: any, lead) => {
    const loc = lead.location;
    if (!acc[loc]) {
      acc[loc] = [];
    }
    acc[loc].push(lead);
    return acc;
  }, {});

  // Geographic targeting controls
  const GeographicTargetingControls = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Geographic Targeting Controls
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Filter and target leads by specific cities, states, and counties
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="targeting-mode">Targeting Mode</Label>
            <Select value={targetingMode} onValueChange={setTargetingMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Leads</SelectItem>
                <SelectItem value="target">Target Campaign</SelectItem>
                <SelectItem value="analyze">Market Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="state-filter">State Filter</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state} ({allStates.filter(s => s === state).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="city-filter">City Filter</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city} ({allCities.filter(c => c === city).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="county-filter">County Filter</Label>
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger>
                <SelectValue placeholder="All Counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {uniqueCounties.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county} County ({allCounties.filter(c => c === county).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="location-search">Location Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="location-search"
                placeholder="Search by city, state, or county..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedState("all");
                setSelectedCity("all");
                setSelectedCounty("all");
                setSearchQuery("");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
            
            <Button variant="default">
              <Target className="w-4 h-4 mr-2" />
              Apply Targeting
            </Button>
          </div>
        </div>

        {(selectedState !== "all" || selectedCity !== "all" || selectedCounty !== "all" || searchQuery) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Active Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedState !== "all" && (
                <Badge variant="default" className="bg-blue-600">
                  State: {selectedState}
                </Badge>
              )}
              {selectedCity !== "all" && (
                <Badge variant="default" className="bg-green-600">
                  City: {selectedCity}
                </Badge>
              )}
              {selectedCounty !== "all" && (
                <Badge variant="default" className="bg-purple-600">
                  County: {selectedCounty}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="default" className="bg-orange-600">
                  Search: "{searchQuery}"
                </Badge>
              )}
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Showing {filteredLeads.length} of {contacts.length} total leads
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Sales representatives (users with sales_rep role)
  const salesReps = users.filter(user => user.role === "sales_rep");

  // Business operations data
  const businessInfo = companies[0] || {};

  const LocationCard = ({ title, icon: Icon, children }: any) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  const LeadsLocations = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead Distribution by Location</CardTitle>
          <p className="text-sm text-muted-foreground">
            Geographic breakdown of your {filteredLeads.length} filtered leads ({contacts.length} total)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(leadsByLocation).map(([location, leads]: [string, any]) => (
              <Card key={location} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{location}</span>
                  </div>
                  <Badge variant="secondary">{leads.length}</Badge>
                </div>
                
                <div className="space-y-2">
                  {leads.slice(0, 3).map((lead: any) => (
                    <div key={lead.id} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                      <div className="text-muted-foreground">{lead.company || 'No Company'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {lead.phone && <Phone className="w-3 h-3" />}
                        {lead.email && <Mail className="w-3 h-3" />}
                        <Badge variant="outline" className="text-xs">
                          {lead.leadStatus || 'new'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {leads.length > 3 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      +{leads.length - 3} more leads
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Lead Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(leadsByLocation)
                .sort(([,a], [,b]) => (b as any[]).length - (a as any[]).length)
                .slice(0, 5)
                .map(([location, leads]: [string, any], index) => (
                  <div key={location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{location}</p>
                        <p className="text-sm text-muted-foreground">
                          {leads.filter((l: any) => l.leadStatus === 'qualified').length} qualified
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">{leads.length} leads</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">United States</p>
                  <p className="text-sm text-muted-foreground">Primary market</p>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {leadsWithLocations.filter(l => l.region === 'US' || !l.location.includes(',')).length}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Canada</p>
                  <p className="text-sm text-muted-foreground">Secondary market</p>
                </div>
                <Badge className="bg-green-600 text-white">
                  {leadsWithLocations.filter(l => l.region === 'CA').length}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Unknown Location</p>
                  <p className="text-sm text-muted-foreground">Needs verification</p>
                </div>
                <Badge variant="outline">
                  {leadsWithLocations.filter(l => l.location === 'Location Unknown').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SalesRepsLocations = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Team Directory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Contact information for your {salesReps.length} sales representatives
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salesReps.map((rep) => (
              <Card key={rep.id} className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{rep.firstName} {rep.lastName}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{rep.role.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{rep.email}</span>
                  </div>
                  {rep.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{rep.phone}</span>
                    </div>
                  )}
                  {rep.extension && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>Ext: {rep.extension}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={rep.isActive ? "default" : "secondary"}>
                      {rep.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {rep.commissionTier} tier
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BusinessOperations = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Operations Center</CardTitle>
          <p className="text-sm text-muted-foreground">
            Traffik Boosters headquarters and operational details
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Company Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>{businessInfo.name || 'Traffik Boosters'}</span>
                  </div>
                  {businessInfo.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span>{businessInfo.website}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Eastern Time Zone (EST/EDT)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>{businessInfo.businessHoursStart || '9:00 AM'} - {businessInfo.businessHoursEnd || '6:00 PM'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekend:</span>
                    <span>Closed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Zone:</span>
                    <span>{businessInfo.timezone || 'America/New_York'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>(877) 840-6250</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>info@traffikboosters.com</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Service Areas</h3>
                <div className="space-y-1">
                  {(businessInfo.allowedRegions || ['US', 'CA']).map((region: string) => (
                    <Badge key={region} variant="outline" className="mr-2">
                      {region === 'US' ? 'United States' : region === 'CA' ? 'Canada' : region}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Social Media Presence</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {businessInfo.facebookUrl && (
                    <div>Facebook: Active</div>
                  )}
                  {businessInfo.linkedinUrl && (
                    <div>LinkedIn: Active</div>
                  )}
                  {businessInfo.twitterUrl && (
                    <div>Twitter/X: Active</div>
                  )}
                  {businessInfo.instagramUrl && (
                    <div>Instagram: Active</div>
                  )}
                  {businessInfo.youtubeUrl && (
                    <div>YouTube: Active</div>
                  )}
                  {businessInfo.tiktokUrl && (
                    <div>TikTok: Active</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Location Intelligence</h1>
          <p className="text-muted-foreground">
            Geographic insights for leads, team members, and business operations
          </p>
        </div>
      </div>

      <GeographicTargetingControls />

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leads">Lead Locations ({filteredLeads.length})</TabsTrigger>
          <TabsTrigger value="team">Sales Team ({salesReps.length})</TabsTrigger>
          <TabsTrigger value="business">Business Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <LeadsLocations />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <SalesRepsLocations />
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <BusinessOperations />
        </TabsContent>
      </Tabs>
    </div>
  );
}