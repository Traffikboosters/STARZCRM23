import { storage } from "./storage";

interface BarkRawData {
  html: string;
  url: string;
  timestamp: Date;
}

interface BarkLead {
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string | null;
  mobilePhone: string | null;
  landlinePhone: string | null;
  email: string | null;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  profileUrl: string;
  services: string[];
  responseTime: string | null;
  verificationStatus: string;
  joinedDate: string | null;
  leadScore: number;
  estimatedValue: string;
}

export class BarkDecoder {
  private selectors = {
    // Primary selectors for service provider cards
    providerCard: '.provider-card, .pro-card, [data-testid="provider-card"]',
    
    // Name extraction - prioritize individual names over business names
    firstName: '[data-testid="first-name"], .first-name, .provider-first-name, .pro-first-name',
    lastName: '[data-testid="last-name"], .last-name, .provider-last-name, .pro-last-name',
    fullName: '[data-testid="provider-name"], .provider-name, .pro-name, .contact-name, .owner-name',
    businessName: '.business-name, .company-name, .provider-title h2, .business-title',
    
    // Enhanced phone number extraction
    phone: '[data-testid="phone"], .phone-number, .contact-phone, .pro-phone, .phone-link, a[href^="tel:"]',
    mobilePhone: '.mobile, .mobile-phone, .cell-phone, .mobile-number',
    landlinePhone: '.landline, .office-phone, .business-phone, .landline-number',
    
    // Contact information
    email: '[data-testid="email"], .email-address, .contact-email, .pro-email, .email-link, a[href^="mailto:"]',
    
    // Location and service details
    location: '[data-testid="location"], .location, .service-area, .pro-location, .provider-location',
    category: '[data-testid="category"], .service-category, .business-type, .pro-category, .category-tag',
    
    // Reviews and ratings
    rating: '[data-testid="rating"], .rating-score, .review-rating, .pro-rating, .stars',
    reviewCount: '[data-testid="review-count"], .review-count, .reviews-number, .total-reviews',
    
    // Profile information
    description: '[data-testid="description"], .service-description, .about-text, .pro-bio, .provider-description',
    services: '.services-list, .service-tags, .specialties, .skills-list',
    responseTime: '.response-time, .avg-response, .reply-time',
    verified: '.verified, .badge-verified, .verification-badge',
    joinedDate: '.member-since, .joined-date, .date-joined'
  };

  async decodeBarkData(rawData: BarkRawData): Promise<BarkLead[]> {
    const leads: BarkLead[] = [];
    
    try {
      // Parse HTML content
      const htmlContent = rawData.html;
      const providers = this.extractProviderCards(htmlContent);
      
      for (const provider of providers) {
        const lead = await this.parseProviderData(provider, rawData.url);
        if (this.isValidLead(lead)) {
          leads.push(lead);
        }
      }
      
      console.log(`[Bark Decoder] Extracted ${leads.length} valid leads from ${rawData.url}`);
      return leads;
      
    } catch (error) {
      console.error('[Bark Decoder] Error decoding data:', error);
      return [];
    }
  }

  private extractProviderCards(html: string): string[] {
    // Extract individual provider card HTML sections
    const cards: string[] = [];
    
    // Look for common Bark.com provider card patterns
    const cardPatterns = [
      'provider-card',
      'pro-card', 
      'provider-listing',
      'service-provider'
    ];
    
    // Split HTML into sections and find provider cards
    const htmlSections = html.split(/<(?:div|article|section)/i);
    
    for (const section of htmlSections) {
      for (const pattern of cardPatterns) {
        if (section.toLowerCase().includes(pattern)) {
          cards.push('<div' + section);
          break;
        }
      }
    }
    
    return cards;
  }

  private async parseProviderData(cardHtml: string, sourceUrl: string): Promise<BarkLead> {
    const lead: Partial<BarkLead> = {
      profileUrl: sourceUrl,
      services: [],
    };

    // Extract names with priority: individual names first, then parse from full name
    const nameData = this.extractNames(cardHtml);
    lead.firstName = nameData.firstName;
    lead.lastName = nameData.lastName;
    lead.businessName = nameData.businessName;

    // Extract phone numbers with enhanced detection
    const phoneData = this.extractPhoneNumbers(cardHtml);
    lead.phone = phoneData.primary;
    lead.mobilePhone = phoneData.mobile;
    lead.landlinePhone = phoneData.landline;

    // Extract email
    lead.email = this.extractEmail(cardHtml);

    // Extract location
    lead.location = this.extractText(cardHtml, [
      /data-testid="location"[^>]*>([^<]+)</i,
      /class="[^"]*location[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*service-area[^"]*"[^>]*>([^<]+)</i
    ]) || 'Location not specified';

    // Extract category/service type
    lead.category = this.extractText(cardHtml, [
      /data-testid="category"[^>]*>([^<]+)</i,
      /class="[^"]*service-category[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*business-type[^"]*"[^>]*>([^<]+)</i
    ]) || 'General Services';

    // Extract rating
    const ratingText = this.extractText(cardHtml, [
      /data-testid="rating"[^>]*>([^<]+)</i,
      /class="[^"]*rating[^"]*"[^>]*>([^<]+)</i,
      /(\d+\.?\d*)\s*(?:stars?|\/5)/i
    ]);
    lead.rating = ratingText ? parseFloat(ratingText) : 0;

    // Extract review count
    const reviewText = this.extractText(cardHtml, [
      /(\d+)\s*reviews?/i,
      /(\d+)\s*ratings?/i,
      /class="[^"]*review-count[^"]*"[^>]*>([^<]+)</i
    ]);
    lead.reviewCount = reviewText ? parseInt(reviewText) : 0;

    // Extract description
    lead.description = this.extractText(cardHtml, [
      /data-testid="description"[^>]*>([^<]+)</i,
      /class="[^"]*description[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*about-text[^"]*"[^>]*>([^<]+)</i
    ]) || 'No description available';

    // Extract services/specialties
    lead.services = this.extractServices(cardHtml);

    // Extract additional metadata
    lead.responseTime = this.extractText(cardHtml, [
      /responds?\s+in\s+([^<]+)/i,
      /response\s+time[^>]*>([^<]+)</i
    ]);

    lead.verificationStatus = cardHtml.includes('verified') || cardHtml.includes('badge') ? 'Verified' : 'Unverified';

    lead.joinedDate = this.extractText(cardHtml, [
      /member\s+since\s+([^<]+)/i,
      /joined\s+([^<]+)/i
    ]);

    // Calculate lead score and estimated value
    lead.leadScore = this.calculateLeadScore(lead as BarkLead);
    lead.estimatedValue = this.estimateLeadValue(lead as BarkLead);

    return lead as BarkLead;
  }

  private extractNames(html: string): { firstName: string, lastName: string, businessName: string } {
    // Try to extract individual first and last names first
    let firstName = this.extractText(html, [
      /data-testid="first-name"[^>]*>([^<]+)</i,
      /class="[^"]*first-name[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*provider-first-name[^"]*"[^>]*>([^<]+)</i
    ]);

    let lastName = this.extractText(html, [
      /data-testid="last-name"[^>]*>([^<]+)</i,
      /class="[^"]*last-name[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*provider-last-name[^"]*"[^>]*>([^<]+)</i
    ]);

    // If individual names not found, try to extract full name and parse it
    if (!firstName || !lastName) {
      const fullName = this.extractText(html, [
        /data-testid="provider-name"[^>]*>([^<]+)</i,
        /class="[^"]*provider-name[^"]*"[^>]*>([^<]+)</i,
        /class="[^"]*pro-name[^"]*"[^>]*>([^<]+)</i,
        /class="[^"]*contact-name[^"]*"[^>]*>([^<]+)</i,
        /class="[^"]*owner-name[^"]*"[^>]*>([^<]+)</i,
        /<h[1-6][^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)</i
      ]);

      if (fullName) {
        const parsedName = this.parseFullName(fullName);
        firstName = firstName || parsedName.firstName;
        lastName = lastName || parsedName.lastName;
      }
    }

    // Extract business name separately
    const businessName = this.extractText(html, [
      /class="[^"]*business-name[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*company-name[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*business-title[^"]*"[^>]*>([^<]+)</i,
      /<h[1-6][^>]*class="[^"]*business[^"]*"[^>]*>([^<]+)</i
    ]) || `${firstName || ''} ${lastName || ''}`.trim() || 'Business';

    return {
      firstName: firstName || 'Unknown',
      lastName: lastName || 'Provider',
      businessName: businessName
    };
  }

  private parseFullName(fullName: string): { firstName: string, lastName: string } {
    // Clean the name and remove common business suffixes
    const cleanName = fullName
      .replace(/\b(Ltd|Limited|Inc|LLC|Corp|Corporation|Co|Company|Services|Solutions|Group)\b/gi, '')
      .replace(/[^\w\s]/g, '')
      .trim();

    const nameParts = cleanName.split(/\s+/).filter(part => part.length > 0);
    
    if (nameParts.length >= 2) {
      return {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ')
      };
    } else if (nameParts.length === 1) {
      return {
        firstName: nameParts[0],
        lastName: 'Provider'
      };
    }

    return {
      firstName: 'Unknown',
      lastName: 'Provider'
    };
  }

  private extractPhoneNumbers(html: string): { primary: string | null, mobile: string | null, landline: string | null } {
    const result = {
      primary: null as string | null,
      mobile: null as string | null,
      landline: null as string | null
    };

    // Enhanced phone number patterns for UK numbers
    const phonePatterns = [
      // UK mobile numbers
      /(?:mobile|cell|mob)[\s:]*(\+44\s*7\d{3}\s*\d{3}\s*\d{3})/i,
      /(?:mobile|cell|mob)[\s:]*(\b07\d{3}\s*\d{3}\s*\d{3})/i,
      
      // UK landline numbers
      /(?:landline|office|business)[\s:]*(\+44\s*\d{2,4}\s*\d{3,4}\s*\d{3,4})/i,
      /(?:landline|office|business)[\s:]*(\b0\d{2,4}\s*\d{3,4}\s*\d{3,4})/i,
      
      // General phone patterns
      /(?:tel|phone)[\s:]*(\+44\s*\d{2,4}\s*\d{3,4}\s*\d{3,4})/i,
      /href="tel:(\+44[\d\s]+)"/i,
      /href="tel:(0[\d\s]+)"/i,
      
      // Formatted UK numbers
      /(\+44\s*\d{2,4}\s*\d{3,4}\s*\d{3,4})/,
      /(\b0\d{2,4}\s*\d{3,4}\s*\d{3,4})/,
      /(\b\d{11})/,
      
      // International format
      /(\+44\d{10})/
    ];

    // Extract all phone numbers found
    const foundNumbers: string[] = [];
    
    for (const pattern of phonePatterns) {
      const matches = html.match(pattern);
      if (matches && matches[1]) {
        const cleanNumber = this.cleanPhoneNumber(matches[1]);
        if (cleanNumber && !foundNumbers.includes(cleanNumber)) {
          foundNumbers.push(cleanNumber);
        }
      }
    }

    // Categorize numbers
    for (const number of foundNumbers) {
      if (this.isMobileNumber(number)) {
        result.mobile = result.mobile || number;
      } else if (this.isLandlineNumber(number)) {
        result.landline = result.landline || number;
      }
      
      // Set primary to first valid number found
      result.primary = result.primary || number;
    }

    return result;
  }

  private cleanPhoneNumber(phone: string): string | null {
    if (!phone) return null;
    
    // Remove HTML entities and tags
    let cleaned = phone.replace(/&[^;]+;/g, '').replace(/<[^>]*>/g, '');
    
    // Normalize spacing and formatting
    cleaned = cleaned.replace(/[\s\-\(\)\.]/g, '');
    
    // Ensure UK format
    if (cleaned.startsWith('0')) {
      cleaned = '+44' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+44')) {
      // If it's all digits and looks like a UK number, add +44
      if (/^\d{10,11}$/.test(cleaned)) {
        cleaned = '+44' + (cleaned.startsWith('0') ? cleaned.substring(1) : cleaned);
      }
    }
    
    // Validate format
    if (/^\+44\d{10}$/.test(cleaned)) {
      return this.formatPhoneNumber(cleaned);
    }
    
    return null;
  }

  private formatPhoneNumber(phone: string): string {
    // Format +44XXXXXXXXXX to +44 XX XXXX XXXX
    if (phone.startsWith('+44') && phone.length === 13) {
      return `+44 ${phone.substring(3, 5)} ${phone.substring(5, 9)} ${phone.substring(9)}`;
    }
    return phone;
  }

  private isMobileNumber(phone: string): boolean {
    // UK mobile numbers start with 07 (or +447)
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    return /^\+447/.test(cleaned) || /^07/.test(cleaned);
  }

  private isLandlineNumber(phone: string): boolean {
    // UK landline numbers don't start with 07
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    return (/^\+44[1-6]/.test(cleaned) || /^0[1-6]/.test(cleaned)) && !this.isMobileNumber(phone);
  }

  private extractText(html: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/&[^;]+;/g, '').replace(/<[^>]*>/g, '');
      }
    }
    return null;
  }

  private extractEmail(html: string): string | null {
    const emailPatterns = [
      /mailto:([^"]+@[^"]+)/i,
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
    ];
    
    return this.extractText(html, emailPatterns);
  }

  private extractServices(html: string): string[] {
    const services: string[] = [];
    const servicePatterns = [
      /class="[^"]*service[^"]*"[^>]*>([^<]+)</gi,
      /class="[^"]*specialty[^"]*"[^>]*>([^<]+)</gi,
      /class="[^"]*skill[^"]*"[^>]*>([^<]+)</gi
    ];

    for (const pattern of servicePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1]) {
          services.push(match[1].trim());
        }
      }
    }

    return services.slice(0, 10); // Limit to first 10 services
  }

  private calculateLeadScore(lead: BarkLead): number {
    let score = 50; // Base score

    // Rating contribution (0-25 points)
    if (lead.rating > 4.5) score += 25;
    else if (lead.rating > 4.0) score += 20;
    else if (lead.rating > 3.5) score += 15;
    else if (lead.rating > 3.0) score += 10;

    // Review count contribution (0-20 points)
    if (lead.reviewCount > 50) score += 20;
    else if (lead.reviewCount > 20) score += 15;
    else if (lead.reviewCount > 10) score += 10;
    else if (lead.reviewCount > 5) score += 5;

    // Verification status (0-10 points)
    if (lead.verificationStatus === 'Verified') score += 10;

    // Contact information completeness (0-15 points)
    if (lead.phone) score += 8;
    if (lead.email) score += 7;

    // Response time (0-10 points)
    if (lead.responseTime) {
      if (lead.responseTime.includes('hour') || lead.responseTime.includes('minute')) score += 10;
      else if (lead.responseTime.includes('day')) score += 5;
    }

    // Service diversity (0-10 points)
    if (lead.services.length > 5) score += 10;
    else if (lead.services.length > 2) score += 5;

    // Category bonus for high-value services
    const highValueCategories = ['business services', 'marketing', 'consultancy', 'professional services'];
    if (highValueCategories.some(cat => lead.category.toLowerCase().includes(cat))) {
      score += 10;
    }

    return Math.min(score, 100); // Cap at 100
  }

  private estimateLeadValue(lead: BarkLead): string {
    const baseValue = 1000;
    let multiplier = 1;

    // Category-based value estimation
    const categoryMultipliers: { [key: string]: number } = {
      'business services': 3.5,
      'marketing': 4.0,
      'consultancy': 3.8,
      'professional services': 3.2,
      'home improvement': 2.5,
      'events': 2.8,
      'wellness': 2.0,
      'fitness': 1.8
    };

    for (const [category, mult] of Object.entries(categoryMultipliers)) {
      if (lead.category.toLowerCase().includes(category)) {
        multiplier = mult;
        break;
      }
    }

    // Rating and review adjustments
    if (lead.rating > 4.5 && lead.reviewCount > 20) multiplier *= 1.3;
    else if (lead.rating > 4.0 && lead.reviewCount > 10) multiplier *= 1.15;

    // Verification bonus
    if (lead.verificationStatus === 'Verified') multiplier *= 1.1;

    const estimatedValue = Math.round(baseValue * multiplier);
    return `£${estimatedValue.toLocaleString()}`;
  }

  private isValidLead(lead: BarkLead): boolean {
    return !!(
      lead.businessName &&
      lead.businessName !== 'Unknown Business' &&
      lead.businessName.length > 2 &&
      (lead.phone || lead.email) &&
      lead.location &&
      lead.location !== 'Location not specified'
    );
  }

  async processAndStoreBarkLeads(rawData: BarkRawData, userId: number): Promise<{ leads: BarkLead[], stored: number }> {
    const decodedLeads = await this.decodeBarkData(rawData);
    let storedCount = 0;

    for (const lead of decodedLeads) {
      try {
        // Create comprehensive notes with all phone numbers
        const phoneInfo = [];
        if (lead.phone) phoneInfo.push(`Primary: ${lead.phone}`);
        if (lead.mobilePhone) phoneInfo.push(`Mobile: ${lead.mobilePhone}`);
        if (lead.landlinePhone) phoneInfo.push(`Landline: ${lead.landlinePhone}`);

        const notes = [
          lead.description,
          `Rating: ${lead.rating}/5 (${lead.reviewCount} reviews)`,
          `Services: ${lead.services.join(', ')}`,
          `Verification: ${lead.verificationStatus}`,
          `Location: ${lead.location}`,
          phoneInfo.length > 0 ? `Contact: ${phoneInfo.join(' | ')}` : ''
        ].filter(Boolean).join(' | ');

        await storage.createContact({
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone || lead.mobilePhone || lead.landlinePhone,
          company: lead.businessName,
          position: "Business Owner",
          leadSource: "bark.com",
          leadStatus: "new",
          notes: notes,
          tags: [lead.category, "bark.com", "service-provider", ...lead.services.slice(0, 3)],
          createdBy: userId
        });
        storedCount++;
        
        console.log(`[Bark Decoder] Stored: ${lead.firstName} ${lead.lastName} (${lead.businessName}) - ${lead.phone || 'No phone'}`);
      } catch (error) {
        console.error('[Bark Decoder] Error storing lead:', error);
      }
    }

    console.log(`[Bark Decoder] Successfully processed ${decodedLeads.length} leads, stored ${storedCount} in CRM`);
    return { leads: decodedLeads, stored: storedCount };
  }
}

export const barkDecoder = new BarkDecoder();