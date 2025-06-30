import { Contact } from "@shared/schema";

interface SalesTip {
  id: string;
  category: 'opener' | 'qualification' | 'objection_handling' | 'closing' | 'follow_up' | 'value_proposition';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  tip: string;
  script: string;
  context: string;
  triggers: string[];
  industry?: string;
  leadSource?: string;
  confidence: number;
  expectedImpact: 'high' | 'medium' | 'low';
  timeToImplement: number; // in minutes
}

interface SalesTipGenerationResult {
  tips: SalesTip[];
  leadAnalysis: {
    leadScore: number;
    urgencyLevel: 'immediate' | 'high' | 'medium' | 'low';
    industryInsights: string[];
    painPoints: string[];
    opportunities: string[];
    competitiveAdvantages: string[];
  };
  contextualFactors: {
    leadAge: number;
    sourceQuality: number;
    budgetIndicators: string[];
    decisionMakerSignals: string[];
    timelineIndicators: string[];
  };
  recommendedApproach: string;
  nextBestActions: string[];
}

export class AISalesTipGenerator {
  
  // Industry-specific sales tips database
  private static industryTips: Record<string, SalesTip[]> = {
    restaurant: [
      {
        id: 'restaurant_opener_1',
        category: 'opener',
        priority: 'high',
        title: 'Restaurant ROI Focus Opener',
        tip: 'Restaurants need immediate ROI. Lead with foot traffic and revenue impact.',
        script: "Hi [Name], I noticed your restaurant [Restaurant Name]. I help restaurants like yours increase foot traffic by 30-50% through local search optimization. Are you currently getting enough customers finding you online when they search for [cuisine type] in [location]?",
        context: 'Restaurants operate on thin margins and need quick wins',
        triggers: ['restaurant', 'food', 'dining', 'cafe', 'bar'],
        industry: 'restaurant',
        confidence: 92,
        expectedImpact: 'high',
        timeToImplement: 2
      },
      {
        id: 'restaurant_value_prop_1',
        category: 'value_proposition',
        priority: 'critical',
        title: 'Restaurant Local Dominance',
        tip: 'Focus on local search dominance and online review management',
        script: "Here's what we typically see with restaurants: when someone searches '[cuisine] near me' or '[cuisine] in [city]', you want to be the first result they see. We help you dominate those local searches and manage your online reputation so you're getting more reservations and walk-ins every day.",
        context: 'Local search is critical for restaurant discovery',
        triggers: ['local search', 'google maps', 'reviews'],
        industry: 'restaurant',
        confidence: 89,
        expectedImpact: 'high',
        timeToImplement: 3
      }
    ],
    hvac: [
      {
        id: 'hvac_opener_1',
        category: 'opener',
        priority: 'high',
        title: 'HVAC Emergency Response Opener',
        tip: 'HVAC businesses thrive on emergency calls. Emphasize 24/7 availability.',
        script: "Hi [Name], I help HVAC companies like [Company Name] capture more emergency service calls and maintenance contracts. When someone's AC breaks down at 2 AM in the summer, are they finding your business first on Google?",
        context: 'HVAC emergency services are high-value, time-sensitive',
        triggers: ['hvac', 'heating', 'cooling', 'air conditioning'],
        industry: 'hvac',
        confidence: 91,
        expectedImpact: 'high',
        timeToImplement: 2
      },
      {
        id: 'hvac_seasonal_1',
        category: 'value_proposition',
        priority: 'critical',
        title: 'HVAC Seasonal Marketing Strategy',
        tip: 'Emphasize seasonal campaigns and preventive maintenance marketing',
        script: "We set up automated seasonal campaigns for HVAC companies. Before summer hits, we're already marketing your AC tune-up services. Before winter, we're promoting heating system checks. This creates steady revenue year-round instead of just emergency calls.",
        context: 'HVAC demand is highly seasonal - plan ahead for peak periods',
        triggers: ['seasonal', 'maintenance', 'tune-up'],
        industry: 'hvac',
        confidence: 87,
        expectedImpact: 'high',
        timeToImplement: 4
      }
    ],
    plumbing: [
      {
        id: 'plumbing_opener_1',
        category: 'opener',
        priority: 'high',
        title: 'Plumbing Emergency Positioning',
        tip: 'Position as the reliable emergency plumber who answers calls',
        script: "Hi [Name], when someone has a burst pipe or backed-up toilet at [time], they need a plumber who actually answers the phone and shows up. I help plumbing companies like yours be the first result they find and the first one they call. How are you currently handling emergency leads?",
        context: 'Plumbing emergencies are stress-driven decisions with high urgency',
        triggers: ['plumbing', 'plumber', 'emergency', 'water damage'],
        industry: 'plumbing',
        confidence: 90,
        expectedImpact: 'high',
        timeToImplement: 2
      }
    ],
    electrical: [
      {
        id: 'electrical_opener_1',
        category: 'opener',
        priority: 'high',
        title: 'Electrical Safety Focus Opener',
        tip: 'Emphasize safety and code compliance - electrical work is about protection',
        script: "Hi [Name], electrical work isn't just about fixing problems - it's about keeping families and businesses safe. I help electrical contractors like [Company Name] attract customers who value quality, licensed work over the cheapest option. Are you getting leads from customers who understand the value of proper electrical work?",
        context: 'Electrical work involves safety concerns and licensing requirements',
        triggers: ['electrical', 'electrician', 'wiring', 'panel'],
        industry: 'electrical',
        confidence: 88,
        expectedImpact: 'high',
        timeToImplement: 3
      }
    ],
    healthcare: [
      {
        id: 'healthcare_opener_1',
        category: 'opener',
        priority: 'high',
        title: 'Healthcare Trust Building Opener',
        tip: 'Healthcare requires trust and credibility - emphasize patient experience',
        script: "Hi [Name], patients today research their healthcare providers online before making appointments. I help medical practices like [Practice Name] build trust online through patient reviews, professional web presence, and making it easy for patients to find and choose you. How are new patients currently discovering your practice?",
        context: 'Healthcare decisions are based on trust, reviews, and credibility',
        triggers: ['medical', 'doctor', 'dental', 'healthcare', 'clinic'],
        industry: 'healthcare',
        confidence: 85,
        expectedImpact: 'medium',
        timeToImplement: 3
      }
    ],
    legal: [
      {
        id: 'legal_opener_1',
        category: 'opener',
        priority: 'high',
        title: 'Legal Authority Positioning',
        tip: 'Legal services require authority and expertise positioning',
        script: "Hi [Name], when someone needs legal help, they're looking for an attorney they can trust with expertise in their specific issue. I help law firms like [Firm Name] establish authority online and attract clients who need your specific legal expertise. What types of cases are you looking to attract more of?",
        context: 'Legal clients seek specialized expertise and proven track records',
        triggers: ['legal', 'attorney', 'lawyer', 'law firm'],
        industry: 'legal',
        confidence: 86,
        expectedImpact: 'medium',
        timeToImplement: 3
      }
    ]
  };

  // Lead source specific tips
  private static sourceSpecificTips: Record<string, SalesTip[]> = {
    bark: [
      {
        id: 'bark_speed_tip',
        category: 'opener',
        priority: 'critical',
        title: 'Bark Lead Speed Response',
        tip: 'Bark leads are actively shopping - speed is everything',
        script: "Hi [Name], I just saw your request on Bark for [service type]. I know you're probably getting multiple quotes, so let me cut straight to what makes us different: [unique value proposition]. Can I ask what's most important to you in choosing a provider for this project?",
        context: 'Bark leads are comparison shopping with multiple providers',
        triggers: ['bark', 'quote request', 'multiple providers'],
        leadSource: 'bark',
        confidence: 95,
        expectedImpact: 'high',
        timeToImplement: 1
      }
    ],
    google_maps: [
      {
        id: 'google_local_tip',
        category: 'opener',
        priority: 'high',
        title: 'Google Maps Local Intent',
        tip: 'Google Maps leads have local intent - emphasize proximity and availability',
        script: "Hi [Name], I see you found us through Google Maps - that's great because we specifically focus on serving businesses in [local area]. Local businesses have unique challenges and we understand [specific local market insight]. What's driving your interest in [service] right now?",
        context: 'Google Maps indicates local search intent and immediacy',
        triggers: ['google maps', 'local search', 'near me'],
        leadSource: 'google_maps',
        confidence: 88,
        expectedImpact: 'high',
        timeToImplement: 2
      }
    ],
    chat_widget: [
      {
        id: 'chat_engagement_tip',
        category: 'opener',
        priority: 'high',
        title: 'Chat Widget Engagement Response',
        tip: 'Chat widget leads showed initiative - acknowledge their proactive approach',
        script: "Hi [Name], thanks for reaching out through our website chat. I appreciate you taking the initiative to connect with us directly. Based on what you shared about [specific need mentioned], I think we can definitely help. What timeline are you working with for [project/service]?",
        context: 'Chat widget suggests active engagement and immediate interest',
        triggers: ['chat widget', 'website inquiry', 'direct contact'],
        leadSource: 'chat_widget',
        confidence: 87,
        expectedImpact: 'medium',
        timeToImplement: 2
      }
    ]
  };

  // Generic high-impact tips for all situations
  private static universalTips: SalesTip[] = [
    {
      id: 'universal_permission_opener',
      category: 'opener',
      priority: 'medium',
      title: 'Permission-Based Opening',
      tip: 'Always ask for permission to continue the conversation',
      script: "Hi [Name], I know you're busy, so I'll be brief. I have some ideas about how we could help [Company Name] with [specific need]. Do you have 60 seconds for me to share a quick thought?",
      context: 'Asking permission shows respect and increases engagement',
      triggers: ['cold call', 'interruption', 'busy prospect'],
      confidence: 82,
      expectedImpact: 'medium',
      timeToImplement: 1
    },
    {
      id: 'universal_social_proof',
      category: 'value_proposition',
      priority: 'high',
      title: 'Local Social Proof',
      tip: 'Use specific local examples and results',
      script: "We just helped [Similar Business Type] in [Nearby Location] increase their [relevant metric] by [specific percentage]. They were facing the same challenge you mentioned about [specific pain point]. Would you like to hear how we solved it for them?",
      context: 'Local social proof builds immediate credibility and relevance',
      triggers: ['credibility', 'proof', 'results'],
      confidence: 89,
      expectedImpact: 'high',
      timeToImplement: 2
    },
    {
      id: 'universal_time_scarcity',
      category: 'closing',
      priority: 'medium',
      title: 'Respectful Time Scarcity',
      tip: 'Create urgency without being pushy',
      script: "I'm working with a limited number of businesses this quarter to ensure quality results. Based on what you've told me about [specific need], I think we'd be a great fit. My next availability for a strategy session is [specific time]. Does that work for you?",
      context: 'Scarcity motivates action when presented professionally',
      triggers: ['closing', 'urgency', 'availability'],
      confidence: 78,
      expectedImpact: 'medium',
      timeToImplement: 2
    }
  ];

  static generateSalesTips(
    contact: Partial<Contact>,
    currentAction?: string,
    leadAge?: number,
    callContext?: any
  ): SalesTipGenerationResult {
    
    const industry = this.detectIndustry(contact);
    const leadSource = contact.leadSource || 'unknown';
    const budget = contact.budget || 0;
    
    // Analyze lead characteristics
    const leadAnalysis = this.analyzeLeadCharacteristics(contact, leadAge);
    const contextualFactors = this.analyzeContextualFactors(contact, leadAge);
    
    // Generate relevant tips
    let relevantTips: SalesTip[] = [];
    
    // Add industry-specific tips
    if (industry && this.industryTips[industry]) {
      relevantTips.push(...this.industryTips[industry]);
    }
    
    // Add source-specific tips
    if (leadSource && this.sourceSpecificTips[leadSource]) {
      relevantTips.push(...this.sourceSpecificTips[leadSource]);
    }
    
    // Add universal tips
    relevantTips.push(...this.universalTips);
    
    // Filter and score tips based on context
    const scoredTips = this.scoreTipsForContext(relevantTips, contact, currentAction, leadAge);
    
    // Select top 5 most relevant tips
    const finalTips = scoredTips
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
    
    // Generate recommended approach
    const recommendedApproach = this.generateRecommendedApproach(contact, industry, leadSource, leadAge);
    
    // Generate next best actions
    const nextBestActions = this.generateNextBestActions(contact, leadAnalysis, contextualFactors);
    
    return {
      tips: finalTips,
      leadAnalysis,
      contextualFactors,
      recommendedApproach,
      nextBestActions
    };
  }

  private static detectIndustry(contact: Partial<Contact>): string {
    const text = `${contact.company || ''} ${contact.notes || ''} ${contact.position || ''}`.toLowerCase();
    
    // Industry detection logic
    if (text.includes('restaurant') || text.includes('food') || text.includes('dining') || text.includes('cafe')) return 'restaurant';
    if (text.includes('hvac') || text.includes('heating') || text.includes('cooling') || text.includes('air conditioning')) return 'hvac';
    if (text.includes('plumbing') || text.includes('plumber')) return 'plumbing';
    if (text.includes('electrical') || text.includes('electrician')) return 'electrical';
    if (text.includes('medical') || text.includes('doctor') || text.includes('dental') || text.includes('healthcare')) return 'healthcare';
    if (text.includes('legal') || text.includes('attorney') || text.includes('lawyer')) return 'legal';
    if (text.includes('real estate') || text.includes('realtor')) return 'real_estate';
    if (text.includes('auto') || text.includes('automotive') || text.includes('car repair')) return 'automotive';
    
    return 'general';
  }

  private static analyzeLeadCharacteristics(contact: Partial<Contact>, leadAge?: number) {
    const industry = this.detectIndustry(contact);
    const budget = contact.budget || 0;
    
    // Calculate lead score based on multiple factors
    let leadScore = 50; // Base score
    
    // Budget scoring
    if (budget > 10000) leadScore += 25;
    else if (budget > 5000) leadScore += 15;
    else if (budget > 1000) leadScore += 10;
    
    // Lead age scoring
    if (leadAge !== undefined) {
      if (leadAge <= 1) leadScore += 20; // Very fresh
      else if (leadAge <= 24) leadScore += 15; // Fresh
      else if (leadAge <= 72) leadScore += 5; // Recent
      else leadScore -= 10; // Stale
    }
    
    // Lead source scoring
    const sourceBonus = {
      'bark': 20,
      'google_maps': 15,
      'chat_widget': 15,
      'referral': 25,
      'manual_entry': 5
    };
    
    leadScore += sourceBonus[contact.leadSource as keyof typeof sourceBonus] || 0;
    
    // Determine urgency level
    let urgencyLevel: 'immediate' | 'high' | 'medium' | 'low' = 'medium';
    if (leadScore >= 80) urgencyLevel = 'immediate';
    else if (leadScore >= 65) urgencyLevel = 'high';
    else if (leadScore >= 40) urgencyLevel = 'medium';
    else urgencyLevel = 'low';
    
    // Generate industry insights
    const industryInsights = this.getIndustryInsights(industry);
    const painPoints = this.identifyPainPoints(contact, industry);
    const opportunities = this.identifyOpportunities(contact, industry);
    const competitiveAdvantages = this.getCompetitiveAdvantages(industry);
    
    return {
      leadScore: Math.min(100, leadScore),
      urgencyLevel,
      industryInsights,
      painPoints,
      opportunities,
      competitiveAdvantages
    };
  }

  private static analyzeContextualFactors(contact: Partial<Contact>, leadAge?: number) {
    const budget = contact.budget || 0;
    
    // Source quality scoring
    const sourceQualityMap = {
      'bark': 85,
      'google_maps': 80,
      'referral': 95,
      'chat_widget': 75,
      'manual_entry': 60
    };
    
    const sourceQuality = sourceQualityMap[contact.leadSource as keyof typeof sourceQualityMap] || 50;
    
    // Budget indicators
    const budgetIndicators = [];
    if (budget > 10000) budgetIndicators.push('High-value prospect', 'Decision maker likely involved');
    else if (budget > 5000) budgetIndicators.push('Substantial budget', 'Quality-focused buyer');
    else if (budget > 1000) budgetIndicators.push('Moderate budget', 'Value-conscious decision');
    else budgetIndicators.push('Budget-sensitive', 'ROI-focused approach needed');
    
    // Decision maker signals
    const decisionMakerSignals = [];
    if (contact.position?.toLowerCase().includes('owner')) decisionMakerSignals.push('Business owner - quick decisions');
    if (contact.position?.toLowerCase().includes('manager')) decisionMakerSignals.push('Management level - approval authority');
    if (contact.position?.toLowerCase().includes('director')) decisionMakerSignals.push('Director level - strategic decisions');
    
    // Timeline indicators
    const timelineIndicators = [];
    if (leadAge !== undefined && leadAge <= 1) timelineIndicators.push('Immediate need - hot lead');
    if (contact.leadSource === 'bark') timelineIndicators.push('Active shopping - comparing options');
    if (contact.notes?.toLowerCase().includes('urgent')) timelineIndicators.push('Urgent timeline mentioned');
    if (contact.notes?.toLowerCase().includes('asap')) timelineIndicators.push('ASAP requirement');
    
    return {
      leadAge: leadAge || 0,
      sourceQuality,
      budgetIndicators,
      decisionMakerSignals,
      timelineIndicators
    };
  }

  private static scoreTipsForContext(
    tips: SalesTip[],
    contact: Partial<Contact>,
    currentAction?: string,
    leadAge?: number
  ): SalesTip[] {
    
    return tips.map(tip => {
      let adjustedConfidence = tip.confidence;
      
      // Boost confidence for matching categories
      if (currentAction === 'calling' && tip.category === 'opener') adjustedConfidence += 10;
      if (currentAction === 'emailing' && tip.category === 'follow_up') adjustedConfidence += 10;
      if (currentAction === 'closing' && tip.category === 'closing') adjustedConfidence += 15;
      
      // Boost for lead source match
      if (tip.leadSource === contact.leadSource) adjustedConfidence += 15;
      
      // Boost for industry match
      if (tip.industry === this.detectIndustry(contact)) adjustedConfidence += 12;
      
      // Adjust for lead age
      if (leadAge !== undefined && leadAge <= 1 && tip.priority === 'critical') {
        adjustedConfidence += 8;
      }
      
      // Boost high-impact tips
      if (tip.expectedImpact === 'high') adjustedConfidence += 5;
      
      return {
        ...tip,
        confidence: Math.min(100, adjustedConfidence)
      };
    });
  }

  private static getIndustryInsights(industry: string): string[] {
    const insights = {
      restaurant: [
        'Restaurants rely heavily on local search and online reviews',
        'Peak hours and seasonal variations affect marketing needs',
        'Food delivery integration is increasingly important',
        'Visual content (photos) drives customer decisions'
      ],
      hvac: [
        'Emergency services generate highest revenue per call',
        'Seasonal demand requires year-round marketing strategy',
        'Maintenance contracts provide steady recurring revenue',
        'Service area geography is crucial for efficiency'
      ],
      plumbing: [
        'Emergency calls have highest conversion rates',
        'Water damage creates immediate urgency',
        'Licensed, insured positioning is critical',
        'Local reputation and response time matter most'
      ],
      electrical: [
        'Safety concerns drive quality over price decisions',
        'Code compliance and licensing are key differentiators',
        'Commercial vs residential have different sales cycles',
        'Emergency electrical work commands premium pricing'
      ],
      healthcare: [
        'Patient reviews and reputation are paramount',
        'Insurance and payment options affect decisions',
        'Specialized services require targeted marketing',
        'Trust and credibility drive patient acquisition'
      ],
      legal: [
        'Expertise specialization is crucial for positioning',
        'Case results and experience build authority',
        'Referrals are primary source of quality leads',
        'Initial consultation approach affects conversion'
      ]
    };
    
    return insights[industry] || [
      'Local market presence is important',
      'Quality and reliability are key differentiators',
      'Customer reviews influence decisions',
      'Competitive pricing within quality standards'
    ];
  }

  private static identifyPainPoints(contact: Partial<Contact>, industry: string): string[] {
    const commonPainPoints = {
      restaurant: ['Low foot traffic', 'Poor online visibility', 'Negative reviews', 'Delivery app competition'],
      hvac: ['Seasonal revenue fluctuations', 'Emergency call competition', 'Customer acquisition costs', 'Service scheduling'],
      plumbing: ['Emergency response competition', 'Service area coverage', 'Customer trust issues', 'Pricing competition'],
      electrical: ['Safety liability concerns', 'Licensed competition', 'Complex project pricing', 'Emergency availability'],
      healthcare: ['Patient acquisition', 'Insurance complexities', 'Online reputation', 'Appointment scheduling'],
      legal: ['Client acquisition costs', 'Case type specialization', 'Marketing restrictions', 'Consultation conversion']
    };
    
    return commonPainPoints[industry] || [
      'Customer acquisition challenges',
      'Online visibility issues',
      'Competitive pricing pressure',
      'Quality service differentiation'
    ];
  }

  private static identifyOpportunities(contact: Partial<Contact>, industry: string): string[] {
    const opportunities = {
      restaurant: ['Local SEO dominance', 'Review management', 'Online ordering integration', 'Social media presence'],
      hvac: ['Maintenance contract marketing', 'Seasonal campaign automation', 'Emergency service positioning', 'Energy efficiency trends'],
      plumbing: ['Emergency response optimization', 'Preventive maintenance plans', 'Water conservation services', 'Smart home integration'],
      electrical: ['Smart home installations', 'Energy efficiency upgrades', 'Commercial electrical growth', 'Safety compliance services'],
      healthcare: ['Telemedicine integration', 'Patient education content', 'Specialized service marketing', 'Insurance navigation'],
      legal: ['Practice area specialization', 'Thought leadership content', 'Referral network expansion', 'Consultation optimization']
    };
    
    return opportunities[industry] || [
      'Digital marketing enhancement',
      'Customer service automation',
      'Local market expansion',
      'Service quality differentiation'
    ];
  }

  private static getCompetitiveAdvantages(industry: string): string[] {
    const advantages = {
      restaurant: ['Unique cuisine positioning', 'Exceptional service experience', 'Local community connection', 'Authentic atmosphere'],
      hvac: ['24/7 emergency availability', 'Certified technician expertise', 'Comprehensive service offerings', 'Maintenance plan value'],
      plumbing: ['Rapid emergency response', 'Licensed and insured reliability', 'Modern equipment and techniques', 'Transparent pricing'],
      electrical: ['Safety-first approach', 'Licensed professional expertise', 'Code compliance guarantee', 'Modern technology adoption'],
      healthcare: ['Specialized expertise', 'Patient-centered care', 'Advanced treatment options', 'Comprehensive service approach'],
      legal: ['Practice area specialization', 'Proven case results', 'Client communication excellence', 'Strategic legal approach']
    };
    
    return advantages[industry] || [
      'Quality service delivery',
      'Professional expertise',
      'Customer satisfaction focus',
      'Reliable business practices'
    ];
  }

  private static generateRecommendedApproach(
    contact: Partial<Contact>,
    industry: string,
    leadSource: string,
    leadAge?: number
  ): string {
    
    let approach = '';
    
    // Base approach on lead source
    if (leadSource === 'bark') {
      approach = 'Speed-focused competitive approach: Respond immediately, differentiate quickly, provide detailed proposal within 2 hours.';
    } else if (leadSource === 'google_maps') {
      approach = 'Local-focused consultative approach: Emphasize local expertise, schedule in-person meeting, build relationship first.';
    } else if (leadSource === 'chat_widget') {
      approach = 'Engagement-focused approach: Acknowledge their initiative, provide immediate value, schedule follow-up consultation.';
    } else {
      approach = 'Relationship-focused approach: Build trust first, understand their specific needs, provide customized solution.';
    }
    
    // Adjust for industry
    if (industry === 'restaurant') {
      approach += ' Focus on immediate ROI and foot traffic increase.';
    } else if (industry === 'hvac') {
      approach += ' Emphasize emergency availability and maintenance value.';
    } else if (industry === 'healthcare') {
      approach += ' Build credibility and trust through expertise demonstration.';
    }
    
    // Adjust for lead age
    if (leadAge !== undefined && leadAge <= 1) {
      approach += ' Priority: Strike while hot - this is a fresh lead requiring immediate attention.';
    } else if (leadAge !== undefined && leadAge > 72) {
      approach += ' Re-engagement strategy: Acknowledge delay, provide new value, create urgency.';
    }
    
    return approach;
  }

  private static generateNextBestActions(
    contact: Partial<Contact>,
    leadAnalysis: any,
    contextualFactors: any
  ): string[] {
    
    const actions = [];
    
    // Urgency-based actions
    if (leadAnalysis.urgencyLevel === 'immediate') {
      actions.push('Call immediately - within 5 minutes');
      actions.push('Send follow-up email with specific proposal');
      actions.push('Schedule same-day consultation if possible');
    } else if (leadAnalysis.urgencyLevel === 'high') {
      actions.push('Call within 1 hour');
      actions.push('Send personalized email with relevant case study');
      actions.push('Schedule consultation within 48 hours');
    } else {
      actions.push('Call within 4 hours');
      actions.push('Send educational content email');
      actions.push('Schedule consultation within 1 week');
    }
    
    // Lead source specific actions
    if (contact.leadSource === 'bark') {
      actions.push('Prepare competitive differentiation talking points');
      actions.push('Have detailed proposal ready to send immediately');
    }
    
    // Budget-based actions
    if (contact.budget && contact.budget > 5000) {
      actions.push('Prepare premium service presentation');
      actions.push('Include ROI calculations and case studies');
    }
    
    // Industry-specific actions
    const industry = this.detectIndustry(contact);
    if (industry === 'restaurant') {
      actions.push('Research their current online presence');
      actions.push('Prepare local competition analysis');
    } else if (industry === 'hvac') {
      actions.push('Check current season relevance');
      actions.push('Prepare maintenance contract options');
    }
    
    return actions.slice(0, 6); // Return top 6 actions
  }
}

export const aiSalesTipGenerator = new AISalesTipGenerator();