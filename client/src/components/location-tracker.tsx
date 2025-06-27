import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Building, Globe, Phone, Mail, User } from "lucide-react";

interface LocationData {
  leads: any[];
  salesReps: any[];
  businessInfo: any;
}

export function LocationTracker() {
  const [selectedTab, setSelectedTab] = useState("leads");

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"]
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"]
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"]
  });

  // Extract location data from contact notes and company information
  const extractLocationFromNotes = (notes: string) => {
    if (!notes) return null;
    
    // Common location patterns
    const locationPatterns = [
      /(?:in|from|located in|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/gi,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:area|region|city)\b/gi
    ];

    for (const pattern of locationPatterns) {
      const match = pattern.exec(notes);
      if (match) {
        return match[1] || match[0];
      }
    }
    return null;
  };

  // Process leads with location data
  const leadsWithLocations = contacts.map(contact => {
    const location = extractLocationFromNotes(contact.notes) || 
                    (contact.company && extractLocationFromNotes(contact.company)) ||
                    "Location Unknown";
    
    return {
      ...contact,
      location,
      region: location.includes(',') ? location.split(',')[1]?.trim() : 'US'
    };
  });

  // Group leads by location
  const leadsByLocation = leadsWithLocations.reduce((acc: any, lead) => {
    const loc = lead.location;
    if (!acc[loc]) {
      acc[loc] = [];
    }
    acc[loc].push(lead);
    return acc;
  }, {});

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
            Geographic breakdown of your {contacts.length} leads
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leads">Lead Locations ({contacts.length})</TabsTrigger>
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