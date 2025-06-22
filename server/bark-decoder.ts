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

    // Enhanced phone number patterns for US numbers
    const phonePatterns = [
      // US mobile and landline numbers
      /(?:mobile|cell|phone)[\s:]*(\+1\s*\(\d{3}\)\s*\d{3}-\d{4})/i,
      /(?:mobile|cell|phone)[\s:]*(\(\d{3}\)\s*\d{3}-\d{4})/i,
      /(?:mobile|cell|phone)[\s:]*(\d{3}-\d{3}-\d{4})/i,
      
      // Office/business numbers
      /(?:office|business|work)[\s:]*(\+1\s*\(\d{3}\)\s*\d{3}-\d{4})/i,
      /(?:office|business|work)[\s:]*(\(\d{3}\)\s*\d{3}-\d{4})/i,
      /(?:office|business|work)[\s:]*(\d{3}-\d{3}-\d{4})/i,
      
      // General phone patterns
      /(?:tel|phone)[\s:]*(\+1\s*\d{3}\s*\d{3}\s*\d{4})/i,
      /href="tel:(\+1[\d\s\-\(\)]+)"/i,
      /href="tel:([\d\s\-\(\)]+)"/i,
      
      // Formatted US numbers
      /(\+1\s*\(\d{3}\)\s*\d{3}-\d{4})/,
      /(\(\d{3}\)\s*\d{3}-\d{4})/,
      /(\d{3}-\d{3}-\d{4})/,
      /(\d{3}\.\d{3}\.\d{4})/,
      /(\d{3}\s\d{3}\s\d{4})/,
      
      // 10-digit numbers
      /(\b\d{10}\b)/,
      
      // International format
      /(\+1\d{10})/
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
    
    // Extract only digits
    const digitsOnly = cleaned.replace(/[^\d]/g, '');
    
    // Handle US phone numbers
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      // US number with country code
      return this.formatPhoneNumber('+' + digitsOnly);
    } else if (digitsOnly.length === 10) {
      // US number without country code
      return this.formatPhoneNumber('+1' + digitsOnly);
    }
    
    // Check if already has +1 prefix
    if (cleaned.startsWith('+1') && digitsOnly.length === 11) {
      return this.formatPhoneNumber(cleaned);
    }
    
    return null;
  }

  private formatPhoneNumber(phone: string): string {
    // Format +1XXXXXXXXXX to +1 (XXX) XXX-XXXX
    if (phone.startsWith('+1') && phone.replace(/\D/g, '').length === 11) {
      const digits = phone.replace(/\D/g, '');
      const areaCode = digits.substring(1, 4);
      const exchange = digits.substring(4, 7);
      const number = digits.substring(7, 11);
      return `+1 (${areaCode}) ${exchange}-${number}`;
    }
    return phone;
  }

  private isMobileNumber(phone: string): boolean {
    // In the US, mobile vs landline is harder to distinguish
    // We'll use common mobile area codes as indicators
    const mobileAreaCodes = ['201', '202', '203', '212', '213', '214', '215', '216', '217', '218', '219', '224', '225', '228', '229', '231', '234', '239', '240', '248', '251', '252', '253', '254', '256', '260', '262', '267', '269', '270', '272', '276', '281', '283', '301', '302', '303', '304', '305', '307', '308', '309', '310', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '323', '325', '330', '331', '334', '336', '337', '339', '347', '351', '352', '360', '361', '385', '386', '401', '402', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414', '415', '417', '419', '423', '424', '425', '430', '432', '434', '435', '440', '443', '458', '463', '464', '469', '470', '475', '478', '479', '480', '484', '501', '502', '503', '504', '505', '507', '508', '509', '510', '512', '513', '515', '516', '517', '518', '520', '530', '540', '541', '551', '559', '561', '562', '563', '564', '567', '570', '571', '573', '574', '575', '580', '585', '586', '601', '602', '603', '605', '606', '607', '608', '609', '610', '612', '614', '615', '616', '617', '618', '619', '620', '623', '626', '630', '631', '636', '641', '646', '650', '651', '660', '661', '662', '667', '678', '682', '701', '702', '703', '704', '706', '707', '708', '712', '713', '714', '715', '716', '717', '718', '719', '720', '724', '727', '731', '732', '734', '737', '740', '747', '754', '757', '760', '763', '765', '770', '772', '773', '774', '775', '781', '786', '801', '802', '803', '804', '805', '806', '808', '810', '812', '813', '814', '815', '816', '817', '818', '828', '830', '831', '832', '843', '845', '847', '848', '850', '856', '857', '858', '859', '860', '862', '863', '864', '865', '870', '872', '878', '901', '903', '904', '906', '907', '908', '909', '910', '912', '913', '914', '915', '916', '917', '918', '919', '920', '925', '928', '929', '931', '936', '937', '940', '941', '947', '949', '951', '952', '954', '956', '959', '970', '971', '972', '973', '978', '979', '980', '984', '985', '989'];
    
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      const areaCode = digitsOnly.substring(digitsOnly.length - 10, digitsOnly.length - 7);
      return mobileAreaCodes.includes(areaCode);
    }
    return false;
  }

  private isLandlineNumber(phone: string): boolean {
    // For US numbers, assume landline if not mobile
    return !this.isMobileNumber(phone);
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
    const hasValidName = lead.firstName && lead.lastName && 
                        lead.firstName !== 'Unknown' && lead.lastName !== 'Provider';
    const hasValidBusiness = lead.businessName && 
                            lead.businessName !== 'Unknown Business' && 
                            lead.businessName.length > 2;
    const hasContact = lead.phone || lead.email;
    const hasLocation = lead.location && lead.location !== 'Location not specified';
    
    console.log(`[Bark Decoder] Validation for ${lead.firstName} ${lead.lastName}:`);
    console.log(`  - Valid name: ${hasValidName}`);
    console.log(`  - Valid business: ${hasValidBusiness}`);
    console.log(`  - Has contact: ${hasContact} (phone: ${lead.phone}, email: ${lead.email})`);
    console.log(`  - Has location: ${hasLocation} (${lead.location})`);
    
    return !!(hasValidName && hasValidBusiness && hasContact && hasLocation);
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