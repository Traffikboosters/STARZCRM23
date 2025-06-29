import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Clock, Zap, Phone, Globe, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ExtractionResult {
  success: boolean;
  leadsExtracted: number;
  leads: any[];
  timestamp: string;
  location: string;
  industry: string;
}

export default function EnhancedGoogleMapsExtractor() {
  const [location, setLocation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [radius, setRadius] = useState('5000');
  const [maxResults, setMaxResults] = useState('10');
  const [extractionHistory, setExtractionHistory] = useState<ExtractionResult[]>([]);
  const { toast } = useToast();

  const industries = {
    'restaurant': {
      name: 'Restaurants & Food Service',
      types: ['restaurant', 'fast_food', 'cafe', 'bakery', 'bar', 'meal_delivery', 'meal_takeaway', 'food_court'],
      icon: '🍽️'
    },
    'retail': {
      name: 'Retail & Shopping',
      types: ['clothing_store', 'electronics_store', 'furniture_store', 'grocery_store', 'shopping_mall', 'department_store'],
      icon: '🛍️'
    },
    'automotive': {
      name: 'Automotive Services',
      types: ['car_dealer', 'car_repair', 'car_wash', 'gas_station', 'parking', 'car_rental'],
      icon: '🚗'
    },
    'healthcare': {
      name: 'Healthcare & Medical',
      types: ['hospital', 'dentist', 'doctor', 'pharmacy', 'physiotherapist', 'veterinary_care'],
      icon: '🏥'
    },
    'professional': {
      name: 'Professional Services',
      types: ['lawyer', 'accounting', 'real_estate_agency', 'insurance_agency', 'travel_agency', 'finance'],
      icon: '💼'
    },
    'beauty': {
      name: 'Beauty & Wellness',
      types: ['beauty_salon', 'hair_care', 'spa', 'gym', 'nail_salon', 'massage'],
      icon: '💅'
    },
    'home': {
      name: 'Home & Construction',
      types: ['plumber', 'electrician', 'roofing_contractor', 'general_contractor', 'painter', 'locksmith'],
      icon: '🔨'
    },
    'realestate': {
      name: 'Real Estate & Property',
      types: ['real_estate_agency', 'moving_company', 'storage', 'home_goods_store'],
      icon: '🏠'
    },
    'education': {
      name: 'Education & Training',
      types: ['school', 'university', 'library', 'tutoring', 'driving_school'],
      icon: '📚'
    },
    'entertainment': {
      name: 'Entertainment & Recreation',
      types: ['movie_theater', 'amusement_park', 'bowling_alley', 'casino', 'night_club'],
      icon: '🎭'
    },
    'technology': {
      name: 'Technology & IT',
      types: ['computer_store', 'electronics_repair', 'software_company', 'it_support'],
      icon: '💻'
    },
    'manufacturing': {
      name: 'Manufacturing & Industrial',
      types: ['factory', 'warehouse', 'logistics', 'industrial_supply'],
      icon: '🏭'
    }
  };

  const extractionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/scraping-jobs/google-maps-enhanced', {
        location,
        industry: selectedIndustry,
        businessType,
        radius: parseInt(radius),
        maxResults: parseInt(maxResults)
      });
      return response;
    },
    onSuccess: (data: any) => {
      const result: ExtractionResult = {
        success: data.success,
        leadsExtracted: data.leadsExtracted || 0,
        leads: data.leads || [],
        timestamp: new Date().toISOString(),
        location,
        industry: selectedIndustry
      };
      
      setExtractionHistory(prev => [result, ...prev]);
      
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted ${result.leadsExtracted} leads from ${location}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Extraction Failed",
        description: "Failed to extract leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExtraction = () => {
    if (!location || !selectedIndustry || !businessType) {
      toast({
        title: "Missing Information",
        description: "Please select location, industry, and business type",
        variant: "destructive",
      });
      return;
    }

    extractionMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Enhanced Google Maps Lead Extractor with Industry Selection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Extract real business leads by industry category with timestamp tracking
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Target Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Miami, FL or New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">Industry Category</Label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an industry category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(industries).map(([key, industry]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{industry.icon}</span>
                          <span>{industry.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedIndustry && (
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-sm font-medium">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select specific business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries[selectedIndustry as keyof typeof industries].types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="radius" className="text-sm font-medium">Search Radius</Label>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select search radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2000">2km (Local)</SelectItem>
                    <SelectItem value="5000">5km (City Center)</SelectItem>
                    <SelectItem value="10000">10km (Metro Area)</SelectItem>
                    <SelectItem value="25000">25km (Regional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxResults" className="text-sm font-medium">Maximum Results</Label>
                <Select value={maxResults} onValueChange={setMaxResults}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of leads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 leads</SelectItem>
                    <SelectItem value="10">10 leads</SelectItem>
                    <SelectItem value="15">15 leads</SelectItem>
                    <SelectItem value="20">20 leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleExtraction} 
              disabled={extractionMutation.isPending || !location || !selectedIndustry || !businessType}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {extractionMutation.isPending ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Leads...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Extract {selectedIndustry ? industries[selectedIndustry as keyof typeof industries].name : 'Business'} Leads
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {extractionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Extraction History & Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {extractionHistory.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                      <span className="text-sm font-medium">{result.location}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Industry:</span>
                      <p className="text-muted-foreground">
                        {industries[result.industry as keyof typeof industries]?.name || result.industry}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Leads Extracted:</span>
                      <p className="text-muted-foreground">{result.leadsExtracted}</p>
                    </div>
                    <div>
                      <span className="font-medium">With Phone:</span>
                      <p className="text-muted-foreground">
                        {result.leads.filter(lead => lead.phone).length}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">With Website:</span>
                      <p className="text-muted-foreground">
                        {result.leads.filter(lead => lead.website).length}
                      </p>
                    </div>
                  </div>

                  {result.leads.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Sample Businesses:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.leads.slice(0, 3).map((lead, leadIndex) => (
                          <Badge key={leadIndex} variant="outline" className="text-xs">
                            {lead.name}
                          </Badge>
                        ))}
                        {result.leads.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{result.leads.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}