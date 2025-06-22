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

export class BarkDecoderUS {
  async decodeBarkData(rawData: BarkRawData): Promise<BarkLead[]> {
    const leads: BarkLead[] = [];
    
    try {
      console.log(`[Bark Decoder US] Processing HTML content...`);
      
      // Extract provider cards from HTML
      const providerCards = this.extractProviderCards(rawData.html);
      console.log(`[Bark Decoder US] Found ${providerCards.length} provider cards`);
      
      for (let i = 0; i < providerCards.length; i++) {
        try {
          console.log(`[Bark Decoder US] Processing card ${i + 1}/${providerCards.length}`);
          const lead = await this.parseProviderData(providerCards[i], rawData.url);
          
          if (this.isValidLead(lead)) {
            leads.push(lead);
            console.log(`[Bark Decoder US] Valid lead added: ${lead.firstName} ${lead.lastName} - ${lead.phone}`);
          } else {
            console.log(`[Bark Decoder US] Lead rejected: Missing required data`);
          }
        } catch (error) {
          console.error(`[Bark Decoder US] Error processing card ${i + 1}:`, error);
        }
      }
      
      return leads;
    } catch (error) {
      console.error('[Bark Decoder US] Error decoding data:', error);
      return [];
    }
  }

  private extractProviderCards(html: string): string[] {
    const cards: string[] = [];
    
    // Look for provider-card divs in the HTML
    const cardRegex = /<div[^>]*class="[^"]*provider-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*provider-card|$)/gi;
    let match;
    
    while ((match = cardRegex.exec(html)) !== null) {
      cards.push(match[0]);
    }
    
    console.log(`[Bark Decoder US] Extracted ${cards.length} provider cards`);
    return cards;
  }

  private async parseProviderData(cardHtml: string, sourceUrl: string): Promise<BarkLead> {
    console.log(`[Bark Decoder US] Parsing card HTML: ${cardHtml.substring(0, 150)}...`);
    
    const lead: Partial<BarkLead> = {
      profileUrl: sourceUrl,
      services: [],
    };

    // Extract name
    const nameMatch = cardHtml.match(/<h3[^>]*class="[^"]*provider-name[^"]*"[^>]*>([^<]+)<\/h3>/i);
    if (nameMatch) {
      const fullName = nameMatch[1].trim();
      console.log(`[Bark Decoder US] Found name: ${fullName}`);
      const { firstName, lastName } = this.parseFullName(fullName);
      lead.firstName = firstName;
      lead.lastName = lastName;
    } else {
      lead.firstName = 'Unknown';
      lead.lastName = 'Provider';
    }

    // Extract business name
    const businessMatch = cardHtml.match(/<div[^>]*class="[^"]*business-name[^"]*"[^>]*>([^<]+)<\/div>/i);
    if (businessMatch) {
      lead.businessName = businessMatch[1].trim();
      console.log(`[Bark Decoder US] Found business: ${lead.businessName}`);
    } else {
      lead.businessName = `${lead.firstName} ${lead.lastName} Services`;
    }

    // Extract phone numbers (US format)
    const phoneData = this.extractUSPhoneNumbers(cardHtml);
    lead.phone = phoneData.primary;
    lead.mobilePhone = phoneData.mobile;
    lead.landlinePhone = phoneData.landline;
    
    console.log(`[Bark Decoder US] Extracted phones - Primary: ${lead.phone}, Mobile: ${lead.mobilePhone}, Landline: ${lead.landlinePhone}`);

    // Extract email
    const emailMatch = cardHtml.match(/href="mailto:([^"]+)"/i) || cardHtml.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    lead.email = emailMatch ? emailMatch[1].trim() : null;
    console.log(`[Bark Decoder US] Found email: ${lead.email}`);

    // Extract location
    const locationMatch = cardHtml.match(/<div[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/div>/i);
    lead.location = locationMatch ? locationMatch[1].trim() : 'United States';
    console.log(`[Bark Decoder US] Found location: ${lead.location}`);

    // Extract category
    const categoryMatch = cardHtml.match(/<div[^>]*class="[^"]*service-category[^"]*"[^>]*>([^<]+)<\/div>/i);
    lead.category = categoryMatch ? categoryMatch[1].trim() : 'General Services';

    // Extract rating
    const ratingMatch = cardHtml.match(/<span[^>]*class="[^"]*rating-score[^"]*"[^>]*>([0-9.]+)<\/span>/i);
    lead.rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.0;

    // Extract review count
    const reviewMatch = cardHtml.match(/<span[^>]*class="[^"]*review-count[^"]*"[^>]*>(\d+)[^<]*<\/span>/i);
    lead.reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : 0;

    // Extract description
    const descMatch = cardHtml.match(/<div[^>]*class="[^"]*service-description[^"]*"[^>]*>([^<]+)<\/div>/i);
    lead.description = descMatch ? descMatch[1].trim() : 'Professional service provider';

    // Extract services
    const serviceMatches = cardHtml.match(/<span[^>]*class="[^"]*service-tag[^"]*"[^>]*>([^<]+)<\/span>/gi);
    if (serviceMatches) {
      lead.services = serviceMatches.map(match => {
        const serviceMatch = match.match(/>([^<]+)</);
        return serviceMatch ? serviceMatch[1].trim() : '';
      }).filter(service => service);
    }

    // Extract response time
    const responseMatch = cardHtml.match(/<div[^>]*class="[^"]*response-time[^"]*"[^>]*>([^<]+)<\/div>/i);
    lead.responseTime = responseMatch ? responseMatch[1].trim() : null;

    // Check verification status
    lead.verificationStatus = cardHtml.includes('verified') || cardHtml.includes('Verified') ? 'Verified' : 'Unverified';

    // Calculate lead score and estimated value
    lead.leadScore = this.calculateLeadScore(lead as BarkLead);
    lead.estimatedValue = this.estimateLeadValue(lead as BarkLead);

    return lead as BarkLead;
  }

  private parseFullName(fullName: string): { firstName: string, lastName: string } {
    const cleanName = fullName
      .replace(/\b(Dr|Mr|Mrs|Ms|Prof)\b\.?\s*/gi, '')
      .replace(/\b(Ltd|Limited|Inc|LLC|Corp|Corporation|Co|Company|Services|Solutions|Group)\b/gi, '')
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

  private extractUSPhoneNumbers(html: string): { primary: string | null, mobile: string | null, landline: string | null } {
    const result = {
      primary: null as string | null,
      mobile: null as string | null,
      landline: null as string | null
    };

    // US phone number patterns
    const phonePatterns = [
      // href="tel:" patterns
      /href="tel:(\+?1?[\s\-\(\)]?\d{3}[\s\-\(\)]?\d{3}[\s\-]?\d{4})"/gi,
      // Direct phone patterns
      /(\+1\s?\(\d{3}\)\s?\d{3}-\d{4})/g,
      /(\(\d{3}\)\s?\d{3}-\d{4})/g,
      /(\d{3}-\d{3}-\d{4})/g,
      /(\d{3}\.\d{3}\.\d{4})/g,
      /(\d{3}\s\d{3}\s\d{4})/g,
      /(\d{10})/g
    ];

    const foundNumbers: string[] = [];
    
    for (const pattern of phonePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const cleanNumber = this.cleanUSPhoneNumber(match[1]);
        if (cleanNumber && !foundNumbers.includes(cleanNumber)) {
          foundNumbers.push(cleanNumber);
        }
      }
    }

    console.log(`[Bark Decoder US] Found phone numbers: ${foundNumbers.join(', ')}`);

    // Assign numbers based on context and format
    for (const number of foundNumbers) {
      if (!result.primary) {
        result.primary = number;
      }
      
      // Simple heuristic: if it's mentioned with mobile/cell, it's mobile
      if (html.toLowerCase().includes('mobile') || html.toLowerCase().includes('cell')) {
        result.mobile = result.mobile || number;
      } else if (html.toLowerCase().includes('office') || html.toLowerCase().includes('business')) {
        result.landline = result.landline || number;
      }
    }

    return result;
  }

  private cleanUSPhoneNumber(phone: string): string | null {
    if (!phone) return null;
    
    // Extract only digits
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Handle US phone numbers
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return this.formatUSPhoneNumber('+' + digitsOnly);
    } else if (digitsOnly.length === 10) {
      return this.formatUSPhoneNumber('+1' + digitsOnly);
    }
    
    return null;
  }

  private formatUSPhoneNumber(phone: string): string {
    if (phone.startsWith('+1') && phone.replace(/\D/g, '').length === 11) {
      const digits = phone.replace(/\D/g, '');
      const areaCode = digits.substring(1, 4);
      const exchange = digits.substring(4, 7);
      const number = digits.substring(7, 11);
      return `+1 (${areaCode}) ${exchange}-${number}`;
    }
    return phone;
  }

  private calculateLeadScore(lead: BarkLead): number {
    let score = 50; // Base score
    
    // Contact information
    if (lead.phone) score += 20;
    if (lead.email) score += 15;
    if (lead.mobilePhone && lead.landlinePhone) score += 10;
    
    // Business quality indicators
    if (lead.rating >= 4.5) score += 15;
    else if (lead.rating >= 4.0) score += 10;
    
    if (lead.reviewCount > 50) score += 15;
    else if (lead.reviewCount > 20) score += 10;
    else if (lead.reviewCount > 5) score += 5;
    
    // Services and response time
    if (lead.services.length > 3) score += 10;
    if (lead.responseTime && lead.responseTime.includes('hour')) score += 5;
    
    // Verification status
    if (lead.verificationStatus === 'Verified') score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private estimateLeadValue(lead: BarkLead): string {
    let baseValue = 1500; // Base value in USD
    
    // Category multipliers for US market
    const categoryMultipliers: { [key: string]: number } = {
      'legal': 2.5,
      'construction': 2.2,
      'marketing': 2.0,
      'photography': 1.8,
      'plumbing': 1.5,
      'general': 1.0
    };
    
    let multiplier = 1.0;
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
    return `$${estimatedValue.toLocaleString()}`;
  }

  private isValidLead(lead: BarkLead): boolean {
    const hasValidName = lead.firstName && lead.lastName && 
                        lead.firstName !== 'Unknown' && lead.lastName !== 'Provider';
    const hasValidBusiness = lead.businessName && lead.businessName.length > 2;
    const hasContact = lead.phone || lead.email;
    const hasLocation = lead.location && lead.location.length > 2;
    
    console.log(`[Bark Decoder US] Validation for ${lead.firstName} ${lead.lastName}:`);
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
        await storage.createContact({
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.businessName,
          position: "Business Owner",
          leadSource: "bark.com",
          leadStatus: "new",
          notes: `${lead.description} | Rating: ${lead.rating}/5 (${lead.reviewCount} reviews) | Services: ${lead.services.join(', ')} | Estimated Value: ${lead.estimatedValue}`,
          tags: [lead.category, "bark.com", "us-provider", lead.verificationStatus.toLowerCase()],
          createdBy: userId
        });
        storedCount++;
      } catch (error) {
        console.error('[Bark Decoder US] Error storing lead:', error);
      }
    }

    return { leads: decodedLeads, stored: storedCount };
  }
}

export const barkDecoderUS = new BarkDecoderUS();