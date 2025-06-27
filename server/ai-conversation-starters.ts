// AI-Powered Conversation Starter Engine for Traffik Boosters CRM
import type { Contact } from "../shared/schema";

interface ConversationSuggestion {
  id: string;
  type: 'industry_insight' | 'pain_point' | 'success_story' | 'trend_analysis' | 'value_proposition' | 'local_focus';
  title: string;
  opener: string;
  followUp: string[];
  context: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  businessRelevance: number;
}

interface ConversationStarterResult {
  suggestions: ConversationSuggestion[];
  leadContext: {
    industry: string;
    businessSize: string;
    location: string;
    painPoints: string[];
    opportunities: string[];
  };
  recommendedApproach: string;
  bestTimeToCall: string;
  keyTalkingPoints: string[];
}

export class AIConversationStarterEngine {
  
  // Industry-specific conversation starters
  private static industryStarters: Record<string, ConversationSuggestion[]> = {
    'HVAC': [
      {
        id: 'hvac_seasonal',
        type: 'trend_analysis',
        title: 'Seasonal HVAC Marketing Opportunity',
        opener: "Hi [Name], I noticed your HVAC business is in [Location]. With heating season approaching, are you seeing the typical surge in emergency calls?",
        followUp: [
          "We've helped HVAC companies increase their emergency call bookings by 40% during peak season",
          "Most HVAC businesses miss out on pre-season maintenance marketing - would you like to hear about our proven approach?"
        ],
        context: 'Seasonal business cycles create urgent marketing needs',
        confidence: 0.92,
        urgency: 'high',
        businessRelevance: 0.95
      },
      {
        id: 'hvac_competition',
        type: 'pain_point',
        title: 'HVAC Market Competition',
        opener: "Hi [Name], I was researching HVAC companies in [Location] and noticed there's quite a bit of competition. How are you currently standing out from the other 15+ HVAC companies in your area?",
        followUp: [
          "We specialize in helping HVAC companies dominate their local market through strategic SEO and Google Ads",
          "Most HVAC companies are invisible online when customers need them most - at 2 AM with a broken furnace"
        ],
        context: 'High competition in HVAC market requires differentiation',
        confidence: 0.88,
        urgency: 'medium',
        businessRelevance: 0.92
      }
    ],
    'Plumbing': [
      {
        id: 'plumbing_emergency',
        type: 'value_proposition',
        title: 'Emergency Plumbing Lead Generation',
        opener: "Hi [Name], quick question about your plumbing business - when someone has a burst pipe at midnight, are they finding you first or your competitors?",
        followUp: [
          "We've helped plumbers capture 60% more emergency calls through strategic online positioning",
          "Most plumbing companies lose thousands in emergency calls because they're not visible when customers need them most"
        ],
        context: 'Emergency services require immediate online visibility',
        confidence: 0.94,
        urgency: 'high',
        businessRelevance: 0.96
      }
    ],
    'Electrical': [
      {
        id: 'electrical_safety',
        type: 'industry_insight',
        title: 'Electrical Safety Marketing',
        opener: "Hi [Name], with all the electrical safety concerns in older homes, are you positioned as the go-to electrical safety expert in [Location]?",
        followUp: [
          "We help electricians become the trusted safety authority in their market",
          "Most homeowners don't know when to call an electrician until it's an emergency - we change that"
        ],
        context: 'Safety positioning builds trust and premium pricing',
        confidence: 0.87,
        urgency: 'medium',
        businessRelevance: 0.89
      }
    ],
    'Landscaping': [
      {
        id: 'landscaping_seasonal',
        type: 'trend_analysis',
        title: 'Seasonal Landscaping Demand',
        opener: "Hi [Name], spring is prime time for landscaping. Are you booked solid, or are you still looking to fill your schedule with high-value projects?",
        followUp: [
          "We help landscaping companies book their entire season 2-3 months in advance",
          "Most landscapers work project to project - we help you build a predictable pipeline"
        ],
        context: 'Seasonal demand creates revenue planning opportunities',
        confidence: 0.91,
        urgency: 'high',
        businessRelevance: 0.93
      }
    ],
    'Restaurants': [
      {
        id: 'restaurant_delivery',
        type: 'pain_point',
        title: 'Restaurant Delivery Competition',
        opener: "Hi [Name], with DoorDash and Uber Eats taking 30% commissions, how are you driving direct orders to maintain your profit margins?",
        followUp: [
          "We help restaurants build their own delivery customer base to reduce third-party fees",
          "Most restaurants are losing $3-5 per order to delivery apps - that adds up fast"
        ],
        context: 'Third-party delivery fees are a major pain point',
        confidence: 0.89,
        urgency: 'high',
        businessRelevance: 0.94
      }
    ],
    'Healthcare': [
      {
        id: 'healthcare_patients',
        type: 'value_proposition',
        title: 'Patient Acquisition Strategy',
        opener: "Hi [Name], are you finding it challenging to attract new patients while managing compliance requirements for healthcare marketing?",
        followUp: [
          "We specialize in HIPAA-compliant marketing that actually brings in quality patients",
          "Most healthcare practices struggle with online reviews and patient acquisition - we solve both"
        ],
        context: 'Healthcare has unique marketing compliance challenges',
        confidence: 0.85,
        urgency: 'medium',
        businessRelevance: 0.88
      }
    ]
  };

  // Generic conversation starters for any industry
  private static genericStarters: ConversationSuggestion[] = [
    {
      id: 'generic_visibility',
      type: 'pain_point',
      title: 'Online Visibility Assessment',
      opener: "Hi [Name], I was looking at your online presence for [Company]. When potential customers search for your services in [Location], are you showing up on the first page?",
      followUp: [
        "Most businesses lose 80% of potential customers by not being visible in local search",
        "We can show you exactly where you rank and how to improve your visibility quickly"
      ],
      context: 'Online visibility is crucial for modern businesses',
      confidence: 0.86,
      urgency: 'medium',
      businessRelevance: 0.90
    },
    {
      id: 'generic_competition',
      type: 'industry_insight',
      title: 'Competitive Analysis Opener',
      opener: "Hi [Name], I've been researching the [Industry] market in [Location]. Are you aware that your top 3 competitors are significantly outranking you online?",
      followUp: [
        "We specialize in helping businesses like yours overtake their competition",
        "Most business owners don't realize how much business they're losing to better-positioned competitors"
      ],
      context: 'Competitive positioning drives business urgency',
      confidence: 0.84,
      urgency: 'high',
      businessRelevance: 0.87
    }
  ];

  // Local market insights for different regions
  private static regionalInsights: Record<string, string[]> = {
    'California': [
      'High competition requires premium positioning',
      'Tech-savvy customers expect strong online presence',
      'Environmental consciousness affects buying decisions'
    ],
    'Texas': [
      'Price-sensitive market with growth opportunities',
      'Strong local business community values',
      'Seasonal weather drives service demands'
    ],
    'Florida': [
      'Tourist and retiree population creates unique opportunities',
      'Hurricane season drives emergency service needs',
      'Year-round business potential in most industries'
    ],
    'New York': [
      'Fast-paced market requires immediate responsiveness',
      'High customer expectations for service quality',
      'Premium pricing possible with right positioning'
    ]
  };

  static generateConversationStarters(contact: Partial<Contact>): ConversationStarterResult {
    const industry = this.extractIndustry(contact);
    const location = this.extractLocation(contact);
    const businessSize = this.estimateBusinessSize(contact);
    
    // Get industry-specific starters
    const industryStarters = this.industryStarters[industry] || [];
    
    // Get relevant generic starters
    const relevantGeneric = this.genericStarters.filter(starter => 
      this.isRelevantToContact(starter, contact)
    );
    
    // Combine and personalize suggestions
    const allSuggestions = [...industryStarters, ...relevantGeneric]
      .map(suggestion => this.personalizeSuggestion(suggestion, contact))
      .sort((a, b) => (b.confidence * b.businessRelevance) - (a.confidence * a.businessRelevance))
      .slice(0, 5); // Top 5 suggestions

    const leadContext = {
      industry,
      businessSize,
      location,
      painPoints: this.identifyPainPoints(contact, industry),
      opportunities: this.identifyOpportunities(contact, industry)
    };

    return {
      suggestions: allSuggestions,
      leadContext,
      recommendedApproach: this.getRecommendedApproach(contact, industry),
      bestTimeToCall: this.getBestCallTime(contact, industry),
      keyTalkingPoints: this.getKeyTalkingPoints(contact, industry)
    };
  }

  private static extractIndustry(contact: Partial<Contact>): string {
    const notes = contact.notes?.toLowerCase() || '';
    const company = contact.company?.toLowerCase() || '';
    
    const industryKeywords = {
      'HVAC': ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'heat pump'],
      'Plumbing': ['plumbing', 'plumber', 'pipe', 'drain', 'water', 'sewer'],
      'Electrical': ['electrical', 'electrician', 'electric', 'wiring', 'electric'],
      'Landscaping': ['landscaping', 'landscape', 'lawn', 'garden', 'tree', 'irrigation'],
      'Restaurants': ['restaurant', 'food', 'dining', 'cafe', 'pizza', 'catering'],
      'Healthcare': ['medical', 'healthcare', 'doctor', 'clinic', 'dental', 'therapy'],
      'Automotive': ['auto', 'car', 'automotive', 'mechanic', 'tire', 'repair'],
      'Real Estate': ['real estate', 'realtor', 'property', 'mortgage', 'home'],
      'Legal': ['law', 'legal', 'attorney', 'lawyer', 'firm'],
      'Technology': ['tech', 'software', 'it', 'computer', 'digital']
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => notes.includes(keyword) || company.includes(keyword))) {
        return industry;
      }
    }

    return 'General Business';
  }

  private static extractLocation(contact: Partial<Contact>): string {
    // Extract location from contact notes or other fields
    const locationField = contact.notes || '';
    
    // Simple state extraction
    const states = ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    for (const state of states) {
      if (locationField.includes(state)) {
        return this.getStateName(state);
      }
    }

    return 'Local Area';
  }

  private static getStateName(abbreviation: string): string {
    const stateMap: Record<string, string> = {
      'CA': 'California',
      'TX': 'Texas',
      'FL': 'Florida',
      'NY': 'New York',
      'IL': 'Illinois',
      'PA': 'Pennsylvania',
      'OH': 'Ohio',
      'GA': 'Georgia',
      'NC': 'North Carolina',
      'MI': 'Michigan'
    };
    return stateMap[abbreviation] || 'Local Area';
  }

  private static estimateBusinessSize(contact: Partial<Contact>): string {
    const notes = contact.notes?.toLowerCase() || '';
    
    if (notes.includes('small') || notes.includes('local') || notes.includes('family')) {
      return 'Small Local Business';
    } else if (notes.includes('medium') || notes.includes('regional')) {
      return 'Medium Regional Business';
    } else if (notes.includes('large') || notes.includes('enterprise')) {
      return 'Large Enterprise';
    }
    
    return 'Small to Medium Business';
  }

  private static isRelevantToContact(suggestion: ConversationSuggestion, contact: Partial<Contact>): boolean {
    // Check if suggestion is relevant based on contact data
    const notes = contact.notes?.toLowerCase() || '';
    const company = contact.company?.toLowerCase() || '';
    
    // Generic suggestions are always relevant
    if (suggestion.type === 'value_proposition' || suggestion.type === 'pain_point') {
      return true;
    }
    
    return suggestion.confidence > 0.8;
  }

  private static personalizeSuggestion(suggestion: ConversationSuggestion, contact: Partial<Contact>): ConversationSuggestion {
    const firstName = contact.firstName || 'there';
    const company = contact.company || 'your business';
    const location = this.extractLocation(contact);
    const industry = this.extractIndustry(contact);

    const personalizedOpener = suggestion.opener
      .replace('[Name]', firstName)
      .replace('[Company]', company)
      .replace('[Location]', location)
      .replace('[Industry]', industry);

    const personalizedFollowUp = suggestion.followUp.map(followUp =>
      followUp
        .replace('[Name]', firstName)
        .replace('[Company]', company)
        .replace('[Location]', location)
        .replace('[Industry]', industry)
    );

    return {
      ...suggestion,
      opener: personalizedOpener,
      followUp: personalizedFollowUp
    };
  }

  private static identifyPainPoints(contact: Partial<Contact>, industry: string): string[] {
    const commonPainPoints: Record<string, string[]> = {
      'HVAC': ['Seasonal demand fluctuations', 'Emergency call competition', 'Price competition'],
      'Plumbing': ['Emergency response competition', 'Customer acquisition costs', 'Seasonal slowdowns'],
      'Electrical': ['Safety liability concerns', 'Skilled labor shortage', 'Technology updates'],
      'Restaurants': ['Third-party delivery fees', 'Staff turnover', 'Food cost inflation'],
      'Healthcare': ['Patient acquisition', 'Insurance complications', 'Compliance requirements'],
      'General Business': ['Online visibility', 'Lead generation', 'Competition']
    };

    return commonPainPoints[industry] || commonPainPoints['General Business'];
  }

  private static identifyOpportunities(contact: Partial<Contact>, industry: string): string[] {
    const opportunities: Record<string, string[]> = {
      'HVAC': ['Maintenance contract growth', 'Energy efficiency upgrades', 'Smart home integration'],
      'Plumbing': ['Preventive maintenance programs', 'Water quality services', 'Bathroom renovations'],
      'Electrical': ['EV charging installation', 'Smart home automation', 'Solar panel installation'],
      'Restaurants': ['Direct delivery platform', 'Catering expansion', 'Online ordering system'],
      'Healthcare': ['Telemedicine services', 'Preventive care programs', 'Patient retention'],
      'General Business': ['Digital marketing expansion', 'Customer retention programs', 'Service diversification']
    };

    return opportunities[industry] || opportunities['General Business'];
  }

  private static getRecommendedApproach(contact: Partial<Contact>, industry: string): string {
    const approaches: Record<string, string> = {
      'HVAC': 'Focus on seasonal urgency and local market dominance',
      'Plumbing': 'Emphasize emergency response and reliability',
      'Electrical': 'Highlight safety expertise and modern solutions',
      'Restaurants': 'Address profit margins and customer acquisition',
      'Healthcare': 'Focus on patient care and compliance',
      'General Business': 'Lead with online visibility and competition analysis'
    };

    return approaches[industry] || approaches['General Business'];
  }

  private static getBestCallTime(contact: Partial<Contact>, industry: string): string {
    const callTimes: Record<string, string> = {
      'HVAC': 'Early morning (7-9 AM) or late afternoon (4-6 PM)',
      'Plumbing': 'Mid-morning (9-11 AM) when not on emergency calls',
      'Electrical': 'Early morning (7-9 AM) before job sites',
      'Restaurants': 'Mid-afternoon (2-4 PM) between lunch and dinner rush',
      'Healthcare': 'Late morning (10 AM-12 PM) or early afternoon (1-3 PM)',
      'General Business': 'Mid-morning (9-11 AM) or early afternoon (1-3 PM)'
    };

    return callTimes[industry] || callTimes['General Business'];
  }

  private static getKeyTalkingPoints(contact: Partial<Contact>, industry: string): string[] {
    const talkingPoints: Record<string, string[]> = {
      'HVAC': [
        'Seasonal marketing strategies for consistent revenue',
        'Emergency call capture and response optimization',
        'Maintenance contract customer retention'
      ],
      'Plumbing': [
        'Emergency service visibility and response',
        'Preventive maintenance program development',
        'Premium service positioning'
      ],
      'Electrical': [
        'Safety and expertise positioning',
        'Modern electrical service opportunities',
        'Residential and commercial growth'
      ],
      'Restaurants': [
        'Direct order platform to reduce delivery fees',
        'Customer retention and loyalty programs',
        'Local market penetration strategies'
      ],
      'Healthcare': [
        'Patient acquisition and retention',
        'Compliance-friendly marketing approaches',
        'Trust and credibility building'
      ],
      'General Business': [
        'Online visibility and local SEO',
        'Competitive positioning strategies',
        'Lead generation and conversion optimization'
      ]
    };

    return talkingPoints[industry] || talkingPoints['General Business'];
  }
}

export const conversationStarterEngine = new AIConversationStarterEngine();