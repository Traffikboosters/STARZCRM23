import fetch from 'node-fetch';

interface YelpLead {
  id: string;
  businessName: string;
  address: string;
  phone?: string;
  website?: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceRange?: string;
  imageUrl?: string;
  isOpenNow?: boolean;
  location: {
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  businessHours?: string[];
  specialOffers?: string[];
}

interface YelpSearchResult {
  leads: YelpLead[];
  totalResults: number;
  searchTerm: string;
  searchLocation: string;
  radius: number;
  apiStatus: 'success' | 'error' | 'rate_limited' | 'unauthorized';
  errorMessage?: string;
}

export class YelpLeadExtractor {
  private apiKey: string;
  private baseUrl = 'https://api.yelp.com/v3';
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YELP_API_KEY || '';
  }

  async extractBusinessLeads(
    searchTerm: string = 'restaurants',
    location: string = 'New York, NY',
    radius: number = 25000, // meters
    maxResults: number = 50
  ): Promise<YelpSearchResult> {
    if (!this.apiKey) {
      return this.createErrorResult('Yelp API key not provided', 'unauthorized', searchTerm, location, radius);
    }

    try {
      const results = await this.searchBusinesses(searchTerm, location, radius, maxResults);
      return results;
    } catch (error: any) {
      return this.handleApiError(error, searchTerm, location, radius);
    }
  }

  private async searchBusinesses(
    term: string,
    location: string,
    radius: number,
    limit: number
  ): Promise<YelpSearchResult> {
    const url = `${this.baseUrl}/businesses/search`;
    const params = new URLSearchParams({
      term,
      location,
      radius: radius.toString(),
      limit: Math.min(limit, 50).toString(), // Yelp API limit is 50
      sort_by: 'rating'
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Yelp API key or unauthorized access');
      } else if (response.status === 429) {
        throw new Error('Yelp API rate limit exceeded');
      } else {
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json() as any;
    
    return {
      leads: this.transformYelpResults(data.businesses || []),
      totalResults: data.total || 0,
      searchTerm: term,
      searchLocation: location,
      radius,
      apiStatus: 'success'
    };
  }

  private transformYelpResults(businesses: any[]): YelpLead[] {
    return businesses.map((business, index) => ({
      id: `yelp_${business.id || Date.now()}_${index}`,
      businessName: business.name || 'Unknown Business',
      address: this.formatAddress(business.location),
      phone: business.display_phone || business.phone || undefined,
      website: business.url || undefined,
      category: this.formatCategories(business.categories),
      rating: business.rating || 0,
      reviewCount: business.review_count || 0,
      priceRange: business.price || undefined,
      imageUrl: business.image_url || undefined,
      isOpenNow: business.is_closed === false,
      location: {
        city: business.location?.city || 'Unknown',
        state: business.location?.state || 'Unknown',
        zipCode: business.location?.zip_code || undefined,
        country: business.location?.country || 'US'
      },
      coordinates: {
        latitude: business.coordinates?.latitude || 0,
        longitude: business.coordinates?.longitude || 0
      },
      businessHours: this.formatBusinessHours(business.hours),
      specialOffers: this.extractSpecialOffers(business)
    }));
  }

  private formatAddress(location: any): string {
    if (!location) return 'Address not available';
    
    const addressParts = [];
    
    if (location.address1) addressParts.push(location.address1);
    if (location.address2) addressParts.push(location.address2);
    if (location.city) addressParts.push(location.city);
    if (location.state) addressParts.push(location.state);
    if (location.zip_code) addressParts.push(location.zip_code);
    
    return addressParts.join(', ') || 'Address not available';
  }

  private formatCategories(categories: any[]): string {
    if (!categories || categories.length === 0) return 'Business';
    
    return categories.map(cat => cat.title).join(', ');
  }

  private formatBusinessHours(hours: any[]): string[] | undefined {
    if (!hours || hours.length === 0) return undefined;
    
    const firstWeek = hours[0];
    if (!firstWeek || !firstWeek.open) return undefined;
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const formattedHours: string[] = [];
    
    firstWeek.open.forEach((period: any) => {
      const day = daysOfWeek[period.day];
      const start = this.formatTime(period.start);
      const end = this.formatTime(period.end);
      formattedHours.push(`${day}: ${start} - ${end}`);
    });
    
    return formattedHours;
  }

  private formatTime(timeString: string): string {
    if (!timeString || timeString.length !== 4) return timeString;
    
    const hours = parseInt(timeString.substring(0, 2));
    const minutes = timeString.substring(2, 4);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    
    return `${displayHours}:${minutes} ${ampm}`;
  }

  private extractSpecialOffers(business: any): string[] {
    const offers: string[] = [];
    
    if (business.transactions) {
      business.transactions.forEach((transaction: string) => {
        switch (transaction) {
          case 'delivery':
            offers.push('Delivery Available');
            break;
          case 'pickup':
            offers.push('Pickup Available');
            break;
          case 'restaurant_reservation':
            offers.push('Reservations Accepted');
            break;
        }
      });
    }
    
    if (business.price) {
      offers.push(`Price Range: ${business.price}`);
    }
    
    return offers;
  }

  private handleApiError(error: any, searchTerm: string, location: string, radius: number): YelpSearchResult {
    const errorMessage = error.message || 'Unknown error';
    
    let status: 'error' | 'rate_limited' | 'unauthorized' = 'error';
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('API key')) {
      status = 'unauthorized';
    } else if (errorMessage.includes('rate limit')) {
      status = 'rate_limited';
    }
    
    return this.createErrorResult(errorMessage, status, searchTerm, location, radius);
  }

  private createErrorResult(
    message: string, 
    status: 'error' | 'rate_limited' | 'unauthorized',
    searchTerm: string,
    location: string,
    radius: number
  ): YelpSearchResult {
    return {
      leads: [],
      totalResults: 0,
      searchTerm,
      searchLocation: location,
      radius,
      apiStatus: status,
      errorMessage: message
    };
  }

  async validateApiKey(): Promise<{
    isValid: boolean;
    hasAccess: boolean;
    errorMessage?: string;
  }> {
    if (!this.apiKey) {
      return {
        isValid: false,
        hasAccess: false,
        errorMessage: 'No Yelp API key provided'
      };
    }

    try {
      // Test with a simple search request
      const response = await fetch(`${this.baseUrl}/businesses/search?term=coffee&location=New York&limit=1`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return {
          isValid: true,
          hasAccess: true
        };
      } else if (response.status === 401) {
        return {
          isValid: false,
          hasAccess: false,
          errorMessage: 'Invalid Yelp API key'
        };
      } else {
        return {
          isValid: true,
          hasAccess: false,
          errorMessage: `API validation failed: ${response.status}`
        };
      }
    } catch (error: any) {
      return {
        isValid: false,
        hasAccess: false,
        errorMessage: error.message
      };
    }
  }

  async getBusinessDetails(businessId: string): Promise<YelpLead | null> {
    if (!this.apiKey) {
      throw new Error('Yelp API key not provided');
    }

    try {
      const response = await fetch(`${this.baseUrl}/businesses/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get business details: ${response.status}`);
      }

      const business = await response.json() as any;
      return this.transformYelpResults([business])[0];
    } catch (error: any) {
      console.error('Error getting Yelp business details:', error);
      return null;
    }
  }

  async searchByCategory(
    category: string,
    location: string,
    limit: number = 50
  ): Promise<YelpSearchResult> {
    const categoryMap: Record<string, string> = {
      'restaurants': 'restaurants',
      'food': 'food',
      'automotive': 'auto',
      'beauty': 'beautysvc',
      'fitness': 'fitness',
      'health': 'health',
      'home_services': 'homeservices',
      'professional': 'professional',
      'shopping': 'shopping',
      'nightlife': 'nightlife'
    };

    const yelpCategory = categoryMap[category.toLowerCase()] || category;
    return await this.extractBusinessLeads(yelpCategory, location, 25000, limit);
  }
}

export const yelpExtractor = new YelpLeadExtractor();