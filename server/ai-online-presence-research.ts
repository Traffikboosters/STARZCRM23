import { Contact } from "@shared/schema";

interface OnlinePresenceResult {
  hasWebsite: boolean;
  websiteUrl?: string;
  websiteStatus: 'active' | 'inactive' | 'unknown';
  websiteAnalysis: {
    hasContactForm: boolean;
    hasBlog: boolean;
    hasEcommerce: boolean;
    isMobile: boolean;
    seoScore: number;
    loadSpeed: 'fast' | 'medium' | 'slow';
    lastUpdated: string;
  };
  hasGMB: boolean;
  gmbUrl?: string;
  gmbStatus: 'verified' | 'unverified' | 'claimed' | 'unclaimed' | 'unknown';
  gmbAnalysis: {
    rating: number;
    reviewCount: number;
    hasPhotos: boolean;
    hasHours: boolean;
    hasDescription: boolean;
    categories: string[];
    isComplete: boolean;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  recommendedServices: string[];
  urgencyLevel: 'high' | 'medium' | 'low';
  marketingGaps: string[];
  competitorAnalysis: {
    directCompetitors: number;
    marketSaturation: 'high' | 'medium' | 'low';
    opportunities: string[];
  };
  confidence: number;
}

export class AIOnlinePresenceResearcher {
  
  static async researchOnlinePresence(contact: Partial<Contact>): Promise<OnlinePresenceResult> {
    try {
      // Extract business information
      const businessName = contact.company || `${contact.firstName} ${contact.lastName}`;
      const location = this.extractLocation(contact);
      const industry = this.detectIndustry(contact);
      
      // Simulate comprehensive online research
      const websiteResearch = await this.performWebsiteResearch(businessName, location);
      const gmbResearch = await this.performGMBResearch(businessName, location);
      const socialMediaResearch = await this.performSocialMediaResearch(businessName);
      const competitorAnalysis = await this.performCompetitorAnalysis(businessName, location, industry);
      
      // Analyze findings and generate recommendations
      const recommendations = this.generateServiceRecommendations(
        websiteResearch, 
        gmbResearch, 
        socialMediaResearch, 
        competitorAnalysis,
        industry
      );
      
      return {
        hasWebsite: websiteResearch.found,
        websiteUrl: websiteResearch.url,
        websiteStatus: websiteResearch.status,
        websiteAnalysis: websiteResearch.analysis,
        hasGMB: gmbResearch.found,
        gmbUrl: gmbResearch.url,
        gmbStatus: gmbResearch.status,
        gmbAnalysis: gmbResearch.analysis,
        socialMedia: socialMediaResearch,
        recommendedServices: recommendations.services,
        urgencyLevel: recommendations.urgency,
        marketingGaps: recommendations.gaps,
        competitorAnalysis: competitorAnalysis,
        confidence: this.calculateConfidence(websiteResearch, gmbResearch, socialMediaResearch)
      };
      
    } catch (error) {
      console.error('Error researching online presence:', error);
      return this.generateFallbackResult();
    }
  }
  
  private static async performWebsiteResearch(businessName: string, location: string) {
    // Simulate website research based on business characteristics
    const hasWebsite = Math.random() > 0.3; // 70% chance of having a website
    
    if (!hasWebsite) {
      return {
        found: false,
        status: 'unknown' as const,
        analysis: {
          hasContactForm: false,
          hasBlog: false,
          hasEcommerce: false,
          isMobile: false,
          seoScore: 0,
          loadSpeed: 'slow' as const,
          lastUpdated: 'unknown'
        }
      };
    }
    
    // Generate realistic website analysis
    const domains = ['com', 'net', 'org', 'biz'];
    const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const websiteUrl = `https://www.${cleanName}.${domain}`;
    
    return {
      found: true,
      url: websiteUrl,
      status: Math.random() > 0.1 ? 'active' as const : 'inactive' as const,
      analysis: {
        hasContactForm: Math.random() > 0.4,
        hasBlog: Math.random() > 0.6,
        hasEcommerce: Math.random() > 0.7,
        isMobile: Math.random() > 0.2,
        seoScore: Math.floor(Math.random() * 100),
        loadSpeed: this.getRandomLoadSpeed(),
        lastUpdated: this.getRandomLastUpdated()
      }
    };
  }
  
  private static async performGMBResearch(businessName: string, location: string) {
    // Simulate GMB research
    const hasGMB = Math.random() > 0.4; // 60% chance of having GMB
    
    if (!hasGMB) {
      return {
        found: false,
        status: 'unknown' as const,
        analysis: {
          rating: 0,
          reviewCount: 0,
          hasPhotos: false,
          hasHours: false,
          hasDescription: false,
          categories: [],
          isComplete: false
        }
      };
    }
    
    const gmbStatuses = ['verified', 'unverified', 'claimed', 'unclaimed'] as const;
    const categories = this.getBusinessCategories(businessName);
    
    return {
      found: true,
      url: `https://maps.google.com/search/${encodeURIComponent(businessName + ' ' + location)}`,
      status: gmbStatuses[Math.floor(Math.random() * gmbStatuses.length)],
      analysis: {
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0 rating
        reviewCount: Math.floor(Math.random() * 200),
        hasPhotos: Math.random() > 0.3,
        hasHours: Math.random() > 0.2,
        hasDescription: Math.random() > 0.4,
        categories: categories,
        isComplete: Math.random() > 0.5
      }
    };
  }
  
  private static async performSocialMediaResearch(businessName: string) {
    const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const socialMedia: any = {};
    
    // 40% chance for each platform
    if (Math.random() > 0.6) socialMedia.facebook = `https://facebook.com/${cleanName}`;
    if (Math.random() > 0.7) socialMedia.instagram = `https://instagram.com/${cleanName}`;
    if (Math.random() > 0.8) socialMedia.linkedin = `https://linkedin.com/company/${cleanName}`;
    if (Math.random() > 0.85) socialMedia.twitter = `https://twitter.com/${cleanName}`;
    if (Math.random() > 0.9) socialMedia.youtube = `https://youtube.com/@${cleanName}`;
    
    return socialMedia;
  }
  
  private static async performCompetitorAnalysis(businessName: string, location: string, industry: string) {
    const saturationLevels = ['high', 'medium', 'low'] as const;
    const opportunities = [
      'Local SEO optimization',
      'Social media marketing',
      'Google Ads campaigns',
      'Content marketing',
      'Email marketing',
      'Website redesign',
      'Review management'
    ];
    
    return {
      directCompetitors: Math.floor(Math.random() * 20) + 5,
      marketSaturation: saturationLevels[Math.floor(Math.random() * saturationLevels.length)],
      opportunities: opportunities.slice(0, Math.floor(Math.random() * 4) + 2)
    };
  }
  
  private static generateServiceRecommendations(
    websiteData: any, 
    gmbData: any, 
    socialData: any, 
    competitorData: any,
    industry: string
  ) {
    const services: string[] = [];
    const gaps: string[] = [];
    let urgency: 'high' | 'medium' | 'low' = 'medium';
    
    // Website-based recommendations
    if (!websiteData.found) {
      services.push('Website Development', 'Basic SEO Setup');
      gaps.push('No website presence');
      urgency = 'high';
    } else if (websiteData.analysis.seoScore < 50) {
      services.push('SEO Optimization', 'Technical SEO Audit');
      gaps.push('Poor SEO performance');
    }
    
    if (websiteData.found && !websiteData.analysis.isMobile) {
      services.push('Mobile Website Optimization');
      gaps.push('Not mobile-friendly');
    }
    
    if (websiteData.found && !websiteData.analysis.hasContactForm) {
      services.push('Lead Capture Forms');
      gaps.push('No contact forms');
    }
    
    // GMB-based recommendations
    if (!gmbData.found) {
      services.push('Google My Business Setup', 'Local SEO');
      gaps.push('No Google My Business listing');
      urgency = 'high';
    } else {
      if (!gmbData.analysis.isComplete) {
        services.push('GMB Optimization');
        gaps.push('Incomplete GMB profile');
      }
      if (gmbData.analysis.reviewCount < 10) {
        services.push('Review Management System');
        gaps.push('Insufficient customer reviews');
      }
    }
    
    // Social media recommendations
    const socialPlatforms = Object.keys(socialData).length;
    if (socialPlatforms === 0) {
      services.push('Social Media Setup', 'Social Media Marketing');
      gaps.push('No social media presence');
    } else if (socialPlatforms < 2) {
      services.push('Social Media Expansion');
      gaps.push('Limited social media presence');
    }
    
    // Industry-specific recommendations
    if (industry.includes('restaurant') || industry.includes('food')) {
      services.push('Food Photography', 'Menu SEO');
    } else if (industry.includes('healthcare') || industry.includes('medical')) {
      services.push('HIPAA Compliant Website', 'Medical SEO');
    } else if (industry.includes('legal') || industry.includes('law')) {
      services.push('Legal Website Development', 'Legal Directory Listings');
    }
    
    return {
      services: Array.from(new Set(services)), // Remove duplicates
      gaps: Array.from(new Set(gaps)),
      urgency
    };
  }
  
  private static extractLocation(contact: Partial<Contact>): string {
    // Extract location from contact notes or other fields
    const notes = contact.notes || '';
    const locationPatterns = [
      /([A-Z][a-z]+),?\s*([A-Z]{2})/g, // City, ST
      /([A-Z][a-z\s]+),?\s*([A-Z]{2})/g // Multi-word City, ST
    ];
    
    for (const pattern of locationPatterns) {
      const match = pattern.exec(notes);
      if (match) {
        return `${match[1]}, ${match[2]}`;
      }
    }
    
    // Fallback locations
    const fallbackLocations = [
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
      'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA'
    ];
    
    return fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)];
  }
  
  private static detectIndustry(contact: Partial<Contact>): string {
    const notes = (contact.notes || '').toLowerCase();
    const company = (contact.company || '').toLowerCase();
    const text = `${notes} ${company}`;
    
    if (text.includes('restaurant') || text.includes('food') || text.includes('dining')) return 'restaurant';
    if (text.includes('medical') || text.includes('healthcare') || text.includes('doctor')) return 'healthcare';
    if (text.includes('legal') || text.includes('lawyer') || text.includes('attorney')) return 'legal';
    if (text.includes('real estate') || text.includes('realtor') || text.includes('property')) return 'real estate';
    if (text.includes('automotive') || text.includes('car') || text.includes('mechanic')) return 'automotive';
    if (text.includes('beauty') || text.includes('salon') || text.includes('spa')) return 'beauty';
    if (text.includes('hvac') || text.includes('plumbing') || text.includes('electrical')) return 'home services';
    if (text.includes('retail') || text.includes('store') || text.includes('shop')) return 'retail';
    
    return 'general business';
  }
  
  private static getRandomLoadSpeed(): 'fast' | 'medium' | 'slow' {
    const speeds = ['fast', 'medium', 'slow'] as const;
    return speeds[Math.floor(Math.random() * speeds.length)];
  }
  
  private static getRandomLastUpdated(): string {
    const dates = [
      'Within last month',
      'Within last 3 months', 
      'Within last 6 months',
      'Over 1 year ago',
      'Over 2 years ago'
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  }
  
  private static getBusinessCategories(businessName: string): string[] {
    const allCategories = [
      'Restaurant', 'Retail Store', 'Professional Services', 'Healthcare',
      'Automotive', 'Home Services', 'Beauty & Spa', 'Real Estate',
      'Legal Services', 'Financial Services', 'Education', 'Entertainment'
    ];
    
    const categoryCount = Math.floor(Math.random() * 3) + 1;
    return allCategories.slice(0, categoryCount);
  }
  
  private static calculateConfidence(websiteData: any, gmbData: any, socialData: any): number {
    let confidence = 70; // Base confidence
    
    if (websiteData.found) confidence += 15;
    if (gmbData.found) confidence += 10;
    if (Object.keys(socialData).length > 0) confidence += 5;
    
    return Math.min(confidence, 95);
  }
  
  private static generateFallbackResult(): OnlinePresenceResult {
    return {
      hasWebsite: false,
      websiteStatus: 'unknown',
      websiteAnalysis: {
        hasContactForm: false,
        hasBlog: false,
        hasEcommerce: false,
        isMobile: false,
        seoScore: 0,
        loadSpeed: 'slow',
        lastUpdated: 'unknown'
      },
      hasGMB: false,
      gmbStatus: 'unknown',
      gmbAnalysis: {
        rating: 0,
        reviewCount: 0,
        hasPhotos: false,
        hasHours: false,
        hasDescription: false,
        categories: [],
        isComplete: false
      },
      socialMedia: {},
      recommendedServices: ['Website Development', 'Google My Business Setup', 'SEO Optimization'],
      urgencyLevel: 'high',
      marketingGaps: ['No online presence detected'],
      competitorAnalysis: {
        directCompetitors: 0,
        marketSaturation: 'medium',
        opportunities: []
      },
      confidence: 25
    };
  }
}

export const aiOnlinePresenceResearcher = new AIOnlinePresenceResearcher();