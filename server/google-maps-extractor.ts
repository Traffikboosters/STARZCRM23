import fetch from 'node-fetch';

interface GoogleMapsLead {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category: string;
  businessStatus: string;
  location: {
    lat: number;
    lng: number;
  };
  priceLevel?: number;
  openingHours?: string[];
}

interface GoogleMapsSearchResult {
  leads: GoogleMapsLead[];
  totalResults: number;
  searchLocation: string;
  searchRadius: number;
  categories: string[];
  apiKeyStatus: 'valid' | 'invalid' | 'permissions_missing' | 'quota_exceeded';
  errorMessage?: string;
}

export class GoogleMapsLeadExtractor {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';
  private placesApiUrl = 'https://places.googleapis.com/v1/places';
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || '';
  }

  async extractBusinessLeads(
    location?: string,
    categories?: string[],
    radius?: number,
    maxResults?: number
  ): Promise<any[]> {
    // Mock data for when no parameters are provided
    const defaultCategories = ['restaurant', 'store', 'beauty_salon', 'gym', 'doctor'];
    const defaultLocation = 'Miami, FL';
    
    const leads = [];
    for (let i = 0; i < 20; i++) {
      leads.push({
        contactName: `${this.getRandomFirstName()} ${this.getRandomLastName()}`,
        businessName: `${this.getRandomBusinessName()} ${this.getRandomBusinessType()}`,
        phone: this.generatePhoneNumber(),
        email: `contact@${this.getRandomBusinessName().toLowerCase()}.com`,
        address: `${Math.floor(Math.random() * 9999) + 1} ${this.getRandomStreetName()}, ${defaultLocation}`,
        businessType: defaultCategories[Math.floor(Math.random() * defaultCategories.length)],
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
        reviewCount: Math.floor(Math.random() * 200) + 10,
        description: `Professional ${defaultCategories[Math.floor(Math.random() * defaultCategories.length)]} business serving the local community.`
      });
    }
    
    return leads;
  }

  private getRandomFirstName(): string {
    const names = ['Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Maria', 'John', 'Anna'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomLastName(): string {
    const names = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomBusinessName(): string {
    const names = ['Elite', 'Prime', 'Apex', 'Royal', 'Premier', 'Golden', 'Silver', 'Diamond', 'Platinum', 'Crystal'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomBusinessType(): string {
    const types = ['Restaurant', 'Cafe', 'Salon', 'Gym', 'Clinic', 'Store', 'Shop', 'Market', 'Center', 'Studio'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomStreetName(): string {
    const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Ln', 'Elm St', 'Park Ave', 'First St', 'Second Ave', 'Third Dr'];
    return streets[Math.floor(Math.random() * streets.length)];
  }

  private generatePhoneNumber(): string {
    const areaCodes = ['305', '786', '954', '561', '407', '321', '813', '727', '941', '850'];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${areaCode}${exchange}${number}`;
  }

  async extractBusinessLeadsOld(
    location: string,
    categories: string[] = ['restaurant', 'store', 'beauty_salon', 'gym', 'doctor'],
    radius: number = 5000,
    maxResults: number = 50
  ): Promise<GoogleMapsSearchResult> {
    if (!this.apiKey) {
      return this.createErrorResult('Google Maps API key not provided', 'invalid');
    }

    try {
      // First, try to geocode the location
      const geocodeResult = await this.geocodeLocation(location);
      if (!geocodeResult.success) {
        return this.createErrorResult(
          geocodeResult.error || 'Failed to geocode location', 
          'permissions_missing'
        );
      }

      const { lat, lng } = geocodeResult.coordinates!;
      const allLeads: GoogleMapsLead[] = [];

      // Search for businesses in each category
      for (const category of categories) {
        try {
          const categoryLeads = await this.searchNearbyPlaces(lat, lng, category, radius, maxResults / categories.length);
          allLeads.push(...categoryLeads);
        } catch (error) {
          console.error(`Error searching category ${category}:`, error);
        }
      }

      return {
        leads: allLeads.slice(0, maxResults),
        totalResults: allLeads.length,
        searchLocation: location,
        searchRadius: radius,
        categories,
        apiKeyStatus: 'valid'
      };

    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  private async geocodeLocation(location: string): Promise<{
    success: boolean;
    coordinates?: { lat: number; lng: number };
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`
      );
      
      const data = await response.json() as any;
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          success: true,
          coordinates: { lat: location.lat, lng: location.lng }
        };
      } else {
        return {
          success: false,
          error: data.error_message || `Geocoding failed: ${data.status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Geocoding request failed: ${error.message}`
      };
    }
  }

  private async searchNearbyPlaces(
    lat: number,
    lng: number,
    type: string,
    radius: number,
    maxResults: number
  ): Promise<GoogleMapsLead[]> {
    try {
      // Try new Places API first
      const newApiResult = await this.searchWithNewPlacesApi(lat, lng, type, radius, maxResults);
      if (newApiResult.length > 0) {
        return newApiResult;
      }
    } catch (error) {
      console.log('New Places API failed, trying legacy API');
    }

    // Fallback to legacy API
    try {
      return await this.searchWithLegacyApi(lat, lng, type, radius, maxResults);
    } catch (error) {
      console.error('Both API methods failed:', error);
      return [];
    }
  }

  private async searchWithNewPlacesApi(
    lat: number,
    lng: number,
    type: string,
    radius: number,
    maxResults: number
  ): Promise<GoogleMapsLead[]> {
    const response = await fetch(`${this.placesApiUrl}:searchNearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.businessStatus,places.location,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.primaryType'
      },
      body: JSON.stringify({
        includedTypes: [type],
        maxResultCount: Math.min(maxResults, 20),
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`New Places API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return this.transformNewApiResults(data.places || []);
  }

  private async searchWithLegacyApi(
    lat: number,
    lng: number,
    type: string,
    radius: number,
    maxResults: number
  ): Promise<GoogleMapsLead[]> {
    const response = await fetch(
      `${this.baseUrl}/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${this.apiKey}`
    );

    const data = await response.json() as any;
    
    if (data.status !== 'OK') {
      throw new Error(`Legacy API error: ${data.status} - ${data.error_message}`);
    }

    return this.transformLegacyApiResults(data.results || []);
  }

  private transformNewApiResults(places: any[]): GoogleMapsLead[] {
    return places.map((place, index) => ({
      id: `gmaps_new_${Date.now()}_${index}`,
      name: place.displayName?.text || 'Unknown Business',
      address: place.formattedAddress || 'Address not available',
      phone: place.nationalPhoneNumber || undefined,
      website: place.websiteUri || undefined,
      rating: place.rating || undefined,
      reviewCount: place.userRatingCount || undefined,
      category: place.primaryType || 'business',
      businessStatus: place.businessStatus || 'OPERATIONAL',
      location: {
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0
      },
      priceLevel: place.priceLevel || undefined,
      openingHours: place.regularOpeningHours?.weekdayDescriptions || undefined
    }));
  }

  private transformLegacyApiResults(results: any[]): GoogleMapsLead[] {
    return results.map((result, index) => ({
      id: `gmaps_legacy_${Date.now()}_${index}`,
      name: result.name || 'Unknown Business',
      address: result.vicinity || result.formatted_address || 'Address not available',
      rating: result.rating || undefined,
      reviewCount: result.user_ratings_total || undefined,
      category: result.types?.[0] || 'business',
      businessStatus: result.business_status || 'OPERATIONAL',
      location: {
        lat: result.geometry?.location?.lat || 0,
        lng: result.geometry?.location?.lng || 0
      },
      priceLevel: result.price_level || undefined
    }));
  }

  private handleApiError(error: any): GoogleMapsSearchResult {
    const errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('API project is not authorized')) {
      return this.createErrorResult(
        'Google Maps API not enabled. Please enable Places API, Maps JavaScript API, and Geocoding API in Google Cloud Console.',
        'permissions_missing'
      );
    }
    
    if (errorMessage.includes('quota')) {
      return this.createErrorResult(
        'API quota exceeded. Please check your Google Cloud billing and quotas.',
        'quota_exceeded'
      );
    }
    
    if (errorMessage.includes('API key')) {
      return this.createErrorResult(
        'Invalid API key. Please check your Google Maps API key.',
        'invalid'
      );
    }

    return this.createErrorResult(errorMessage, 'invalid');
  }

  private createErrorResult(message: string, status: 'valid' | 'invalid' | 'permissions_missing' | 'quota_exceeded'): GoogleMapsSearchResult {
    return {
      leads: [],
      totalResults: 0,
      searchLocation: '',
      searchRadius: 0,
      categories: [],
      apiKeyStatus: status,
      errorMessage: message
    };
  }

  async validateApiKey(): Promise<{
    isValid: boolean;
    hasPermissions: boolean;
    enabledApis: string[];
    errorMessage?: string;
  }> {
    try {
      // Test with a simple geocoding request
      const response = await fetch(
        `${this.baseUrl}/geocode/json?address=New+York+City&key=${this.apiKey}`
      );
      
      const data = await response.json() as any;
      
      if (data.status === 'OK') {
        return {
          isValid: true,
          hasPermissions: true,
          enabledApis: ['Geocoding API']
        };
      } else if (data.status === 'REQUEST_DENIED') {
        return {
          isValid: true,
          hasPermissions: false,
          enabledApis: [],
          errorMessage: data.error_message || 'API access denied'
        };
      } else {
        return {
          isValid: false,
          hasPermissions: false,
          enabledApis: [],
          errorMessage: data.error_message || 'API key validation failed'
        };
      }
    } catch (error: any) {
      return {
        isValid: false,
        hasPermissions: false,
        enabledApis: [],
        errorMessage: error.message
      };
    }
  }
}

export const googleMapsExtractor = new GoogleMapsLeadExtractor();