import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Clock, Zap, Phone, Globe, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ExtractionResult {
  success: boolean;
  leadsExtracted: number;
  leads: any[];
  timestamp: string;
  location: string;
  industry: string;
}

export default function GoogleMapsExtractor() {
  const [location, setLocation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [radius, setRadius] = useState('5000');
  const [maxResults, setMaxResults] = useState('10');
  const [isExtracting, setIsExtracting] = useState(false);
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
    'professional_services': {
      name: 'Professional Services',
      types: ['lawyer', 'accounting', 'real_estate_agency', 'insurance_agency', 'bank', 'atm'],
      icon: '💼'
    },
    'beauty_wellness': {
      name: 'Beauty & Wellness',
      types: ['beauty_salon', 'hair_care', 'spa', 'gym', 'nail_salon', 'massage'],
      icon: '💅'
    },
    'home_services': {
      name: 'Home & Construction',
      types: ['plumber', 'electrician', 'roofing_contractor', 'painter', 'general_contractor', 'locksmith'],
      icon: '🔨'
    },
    'real_estate': {
      name: 'Real Estate & Property',
      types: ['real_estate_agency', 'moving_company', 'storage', 'home_goods_store'],
      icon: '🏠'
    },
    'education': {
      name: 'Education & Training',
      types: ['school', 'university', 'library', 'driving_school', 'training_center'],
      icon: '📚'
    },
    'entertainment': {
      name: 'Entertainment & Recreation',
      types: ['movie_theater', 'amusement_park', 'bowling_alley', 'casino', 'night_club', 'tourist_attraction'],
      icon: '🎭'
    },
    'technology': {
      name: 'Technology & IT',
      types: ['computer_store', 'electronics_repair', 'software_company', 'it_services'],
      icon: '💻'
    },
    'manufacturing': {
      name: 'Manufacturing & Industrial',
      types: ['factory', 'warehouse', 'logistics', 'industrial_equipment'],
      icon: '🏭'
    }
  };

  const handleExtraction = async () => {
    if (!location || !selectedIndustry || !businessType) {
      toast({
        title: "Missing Information",
        description: "Please select location, industry, and business type",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      const data = await apiRequest('POST', '/api/real-extraction/google-maps', {
        location,
        categories: [businessType],
        radius: parseInt(radius),
        maxResults: parseInt(maxResults),
        apiKey: 'AIzaSyAek_29lbVmrNswmCHqsHypfP6-Je0pgh0'
      });

      if (data.success) {
        const result: ExtractionResult = {
          success: true,
          leadsExtracted: data.leadsExtracted,
          leads: data.leads,
          timestamp: new Date().toLocaleString(),
          location,
          industry: industries[selectedIndustry as keyof typeof industries].name
        };

        setExtractionHistory(prev => [result, ...prev.slice(0, 9)]);

        toast({
          title: "✅ Extraction Complete",
          description: `Successfully extracted ${data.leadsExtracted} ${industries[selectedIndustry as keyof typeof industries].name.toLowerCase()} leads from ${location}`,
        });

        // Reset form
        setLocation('');
        setSelectedIndustry('');
        setBusinessType('');
      } else {
        throw new Error('Extraction failed');
      }
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Failed to extract leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Google Maps Lead Extractor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Target Location</Label>
              <Input
                id="location"
                placeholder="e.g., Miami, FL or New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry Category</Label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(industries).map(([key, industry]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{industry.icon}</span>
                        {industry.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIndustry && (
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
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

            <div className="space-y-2">
              <Label htmlFor="radius">Search Radius (meters)</Label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="maxResults">Max Results</Label>
              <Select value={maxResults} onValueChange={setMaxResults}>
                <SelectTrigger>
                  <SelectValue />
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

          <Button 
            onClick={handleExtraction} 
            disabled={isExtracting || !location || !selectedIndustry || !businessType}
            className="w-full"
          >
            {isExtracting ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-spin" />
                Extracting Leads...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Extract Google Maps Leads
              </>
            )}
          </Button>
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
            <div className="space-y-3">
              {extractionHistory.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{result.industry}</span>
                      <Badge variant="secondary">{result.location}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {result.timestamp}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-primary">{result.leadsExtracted}</span>
                      <span>leads extracted</span>
                    </div>
                    {result.leads.length > 0 && (
                      <>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{result.leads.filter(l => l.phone).length} with phone</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{result.leads.filter(l => l.website).length} with website</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{(result.leads.reduce((sum, l) => sum + (l.rating || 0), 0) / result.leads.length).toFixed(1)} avg rating</span>
                        </div>
                      </>
                    )}
                  </div>

                  {result.leads.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Sample Leads:</div>
                      <div className="flex flex-wrap gap-1">
                        {result.leads.slice(0, 3).map((lead, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
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