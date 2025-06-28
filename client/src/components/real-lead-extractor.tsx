import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Building, Phone, Mail, Star, DollarSign, Key, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ExtractionResult {
  success: boolean;
  apiKeyStatus?: string;
  apiStatus?: string;
  leadsExtracted: number;
  contactsCreated: number;
  totalResults: number;
  errorMessage?: string;
  leads?: any[];
}

export default function RealLeadExtractor() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("google-maps");
  const [progress, setProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResults, setExtractionResults] = useState<ExtractionResult | null>(null);

  // Google Maps configuration
  const [googleMapsConfig, setGoogleMapsConfig] = useState({
    apiKey: "AIzaSyAek_29lbVmrNswmCHqsHypfP6-Je0pgh0",
    location: "New York, NY",
    categories: ["restaurant", "store", "beauty_salon", "gym", "doctor"],
    radius: 5000,
    maxResults: 50
  });

  // Yellow Pages configuration
  const [yellowPagesConfig, setYellowPagesConfig] = useState({
    apiKey: "",
    searchTerm: "restaurants",
    location: "New York, NY",
    maxResults: 30
  });

  // Yelp configuration
  const [yelpConfig, setYelpConfig] = useState({
    apiKey: "",
    searchTerm: "restaurants",
    location: "New York, NY",
    radius: 25000,
    maxResults: 50
  });

  // Google Maps extraction mutation
  const googleMapsMutation = useMutation({
    mutationFn: async () => {
      setIsExtracting(true);
      setProgress(0);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      try {
        const response = await apiRequest("POST", "/api/real-extraction/google-maps", {
          testKey: googleMapsConfig.apiKey,
          location: googleMapsConfig.location,
          categories: googleMapsConfig.categories,
          radius: googleMapsConfig.radius,
          maxResults: googleMapsConfig.maxResults,
          apiKey: googleMapsConfig.apiKey
        });
        
        clearInterval(progressInterval);
        setProgress(100);
        
        return response.json();
      } finally {
        clearInterval(progressInterval);
        setIsExtracting(false);
      }
    },
    onSuccess: (data) => {
      setExtractionResults(data);
      
      if (data.success) {
        toast({
          title: "Google Maps Extraction Complete",
          description: `Successfully extracted ${data.leadsExtracted} real leads from Google Maps`,
        });
      } else {
        toast({
          title: "Google Maps API Issue",
          description: data.errorMessage || "API key needs proper permissions",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setIsExtracting(false);
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract leads from Google Maps",
        variant: "destructive",
      });
    },
  });

  // Yellow Pages extraction mutation
  const yellowPagesMutation = useMutation({
    mutationFn: async () => {
      setIsExtracting(true);
      setProgress(0);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 400);

      try {
        const response = await apiRequest("POST", "/api/real-extraction/yellowpages", yellowPagesConfig);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        return response.json();
      } finally {
        clearInterval(progressInterval);
        setIsExtracting(false);
      }
    },
    onSuccess: (data) => {
      setExtractionResults(data);
      
      if (data.success) {
        toast({
          title: "Yellow Pages Extraction Complete",
          description: `Successfully extracted ${data.leadsExtracted} real leads from Yellow Pages`,
        });
      } else {
        toast({
          title: "Yellow Pages Extraction Issue",
          description: data.errorMessage || "Extraction failed",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setIsExtracting(false);
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract leads from Yellow Pages",
        variant: "destructive",
      });
    },
  });

  // Yelp extraction mutation
  const yelpMutation = useMutation({
    mutationFn: async () => {
      setIsExtracting(true);
      setProgress(0);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 12, 90));
      }, 600);

      try {
        const response = await apiRequest("POST", "/api/real-extraction/yelp", yelpConfig);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        return response.json();
      } finally {
        clearInterval(progressInterval);
        setIsExtracting(false);
      }
    },
    onSuccess: (data) => {
      setExtractionResults(data);
      
      if (data.success) {
        toast({
          title: "Yelp Extraction Complete",
          description: `Successfully extracted ${data.leadsExtracted} real leads from Yelp`,
        });
      } else {
        toast({
          title: "Yelp API Issue",
          description: data.errorMessage || "API key required or invalid",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setIsExtracting(false);
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract leads from Yelp",
        variant: "destructive",
      });
    },
  });

  const getApiStatusIcon = (status?: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'permissions_missing':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'invalid':
      case 'unauthorized':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Key className="h-4 w-4 text-gray-400" />;
    }
  };

  const getApiStatusText = (status?: string) => {
    switch (status) {
      case 'valid':
        return 'API Key Valid';
      case 'permissions_missing':
        return 'Permissions Missing';
      case 'invalid':
        return 'Invalid API Key';
      case 'unauthorized':
        return 'Unauthorized Access';
      default:
        return 'Not Tested';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Building className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Real Lead Extraction</h2>
        <Badge variant="outline">API Integration</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentic Business Lead Sources</CardTitle>
          <CardDescription>
            Extract real business contacts from Google Maps, Yellow Pages, and Yelp using API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="google-maps">Google Maps</TabsTrigger>
              <TabsTrigger value="yellow-pages">Yellow Pages</TabsTrigger>
              <TabsTrigger value="yelp">Yelp</TabsTrigger>
            </TabsList>

            <TabsContent value="google-maps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Google Maps Places API</span>
                    {getApiStatusIcon(extractionResults?.apiKeyStatus)}
                  </CardTitle>
                  <CardDescription>
                    Extract real business listings from Google Maps Places API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="google-api-key">API Key</Label>
                      <Input
                        id="google-api-key"
                        placeholder="AIzaSy..."
                        value={googleMapsConfig.apiKey}
                        onChange={(e) => setGoogleMapsConfig({...googleMapsConfig, apiKey: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Get your API key from Google Cloud Console
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="google-location">Location</Label>
                      <Input
                        id="google-location"
                        placeholder="New York, NY"
                        value={googleMapsConfig.location}
                        onChange={(e) => setGoogleMapsConfig({...googleMapsConfig, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="google-radius">Radius (meters)</Label>
                      <Input
                        id="google-radius"
                        type="number"
                        value={googleMapsConfig.radius}
                        onChange={(e) => setGoogleMapsConfig({...googleMapsConfig, radius: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="google-max-results">Max Results</Label>
                      <Input
                        id="google-max-results"
                        type="number"
                        value={googleMapsConfig.maxResults}
                        onChange={(e) => setGoogleMapsConfig({...googleMapsConfig, maxResults: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {googleMapsConfig.categories.map((category, index) => (
                        <Badge key={index} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </div>

                  {extractionResults?.apiKeyStatus === 'permissions_missing' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800">API Setup Required</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your Google API key needs the following APIs enabled:
                      </p>
                      <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                        <li>Places API (New)</li>
                        <li>Maps JavaScript API</li>
                        <li>Geocoding API</li>
                      </ul>
                      <p className="text-sm text-yellow-700 mt-2">
                        Go to Google Cloud Console → APIs & Services → Library → Enable required APIs → Enable billing
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => googleMapsMutation.mutate()}
                    disabled={isExtracting || !googleMapsConfig.apiKey}
                    className="w-full"
                  >
                    {isExtracting ? "Extracting..." : "Extract Google Maps Leads"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="yellow-pages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Yellow Pages Directory</span>
                    {getApiStatusIcon(extractionResults?.apiStatus)}
                  </CardTitle>
                  <CardDescription>
                    Extract business listings from Yellow Pages directory
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yp-api-key">API Key (Optional)</Label>
                      <Input
                        id="yp-api-key"
                        placeholder="Leave empty for sample data"
                        value={yellowPagesConfig.apiKey}
                        onChange={(e) => setYellowPagesConfig({...yellowPagesConfig, apiKey: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yp-search">Search Term</Label>
                      <Select
                        value={yellowPagesConfig.searchTerm}
                        onValueChange={(value) => setYellowPagesConfig({...yellowPagesConfig, searchTerm: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurants">Restaurants</SelectItem>
                          <SelectItem value="plumbing">Plumbing Services</SelectItem>
                          <SelectItem value="lawyers">Lawyers</SelectItem>
                          <SelectItem value="doctors">Medical Practices</SelectItem>
                          <SelectItem value="contractors">Contractors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yp-location">Location</Label>
                      <Input
                        id="yp-location"
                        value={yellowPagesConfig.location}
                        onChange={(e) => setYellowPagesConfig({...yellowPagesConfig, location: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yp-max-results">Max Results</Label>
                      <Input
                        id="yp-max-results"
                        type="number"
                        value={yellowPagesConfig.maxResults}
                        onChange={(e) => setYellowPagesConfig({...yellowPagesConfig, maxResults: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => yellowPagesMutation.mutate()}
                    disabled={isExtracting}
                    className="w-full"
                  >
                    {isExtracting ? "Extracting..." : "Extract Yellow Pages Leads"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="yelp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Yelp Fusion API</span>
                    {getApiStatusIcon(extractionResults?.apiStatus)}
                  </CardTitle>
                  <CardDescription>
                    Extract business reviews and data from Yelp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yelp-api-key">Yelp API Key</Label>
                      <Input
                        id="yelp-api-key"
                        placeholder="Bearer token from Yelp"
                        value={yelpConfig.apiKey}
                        onChange={(e) => setYelpConfig({...yelpConfig, apiKey: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Get your API key from yelp.com/developers
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yelp-search">Search Term</Label>
                      <Input
                        id="yelp-search"
                        value={yelpConfig.searchTerm}
                        onChange={(e) => setYelpConfig({...yelpConfig, searchTerm: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yelp-location">Location</Label>
                      <Input
                        id="yelp-location"
                        value={yelpConfig.location}
                        onChange={(e) => setYelpConfig({...yelpConfig, location: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yelp-radius">Radius (meters)</Label>
                      <Input
                        id="yelp-radius"
                        type="number"
                        value={yelpConfig.radius}
                        onChange={(e) => setYelpConfig({...yelpConfig, radius: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yelp-max-results">Max Results</Label>
                      <Input
                        id="yelp-max-results"
                        type="number"
                        value={yelpConfig.maxResults}
                        onChange={(e) => setYelpConfig({...yelpConfig, maxResults: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  {!yelpConfig.apiKey && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Yelp API Key Required</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Visit yelp.com/developers/v3/manage_app to create an app and get your API key
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => yelpMutation.mutate()}
                    disabled={isExtracting || !yelpConfig.apiKey}
                    className="w-full"
                  >
                    {isExtracting ? "Extracting..." : "Extract Yelp Leads"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {isExtracting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Extraction Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {extractionResults && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {extractionResults.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Extraction Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {extractionResults.success ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {extractionResults.leadsExtracted}
                      </div>
                      <div className="text-sm text-muted-foreground">Leads Extracted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {extractionResults.contactsCreated}
                      </div>
                      <div className="text-sm text-muted-foreground">Contacts Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {extractionResults.totalResults}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Available</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-red-600">Extraction Failed</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {extractionResults.errorMessage}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-red-600">
                        {getApiStatusText(extractionResults.apiKeyStatus)}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}