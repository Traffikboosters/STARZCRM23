import type { Contact } from "@shared/schema";

interface QuickReplyTemplate {
  id: string;
  category: 'follow_up' | 'objection_handling' | 'pricing' | 'scheduling' | 'closing' | 'nurturing';
  trigger: string;
  subject: string;
  template: string;
  context: string;
  industry?: string[];
  leadStatus?: string[];
  urgency: 'low' | 'medium' | 'high';
  effectiveness: number;
  personalizable: boolean;
}

interface QuickReplyResult {
  templates: QuickReplyTemplate[];
  contextualSuggestions: {
    mostRelevant: QuickReplyTemplate;
    alternativeOptions: QuickReplyTemplate[];
    contextReason: string;
  };
  personalizationTips: string[];
  bestSendTime: string;
  expectedResponseRate: number;
}

export class AIQuickReplyEngine {
  private static followUpTemplates: QuickReplyTemplate[] = [
    {
      id: "initial_followup",
      category: "follow_up",
      trigger: "First contact after lead capture",
      subject: "Quick question about {{companyName}}'s online presence",
      template: "Hi {{firstName}},\n\nI noticed {{companyName}} while researching {{industry}} businesses in {{location}}. I have a quick question about your current online marketing strategy.\n\nWhen you search for \"{{serviceKeyword}}\" in {{location}}, where does your business show up? Most business owners are surprised to learn they're missing out on 60-80% of potential customers because they're not visible in local search.\n\nI'd love to show you exactly where you rank and share a few quick wins that could bring you more customers this month. Would you be open to a brief 10-minute call this week?\n\nBest regards,\nSteve Williams\nTraffik Boosters\n(877) 840-6250",
      context: "Perfect for new leads who haven't been contacted yet",
      urgency: "high",
      effectiveness: 0.89,
      personalizable: true
    },
    {
      id: "second_followup",
      category: "follow_up", 
      trigger: "No response after initial contact",
      subject: "{{firstName}}, saw your competitors ranking higher...",
      template: "Hi {{firstName}},\n\nI sent you a message earlier about {{companyName}}'s online visibility. I hope you don't mind me following up, but I discovered something concerning.\n\nYour top 3 competitors in {{location}} are significantly outranking you online. This means they're capturing customers who should be calling you instead.\n\nI've helped {{industryExample}} businesses just like yours increase their customer calls by 200-400% within 90 days. The best part? We guarantee results or you don't pay.\n\nWould you be interested in a free competitive analysis that shows exactly where you're losing business to competitors?\n\nBest regards,\nSteve Williams\nTraffik Boosters\n(877) 840-6250",
      context: "Competitive pressure angle for unresponsive leads",
      urgency: "medium", 
      effectiveness: 0.76,
      personalizable: true
    },
    {
      id: "value_add_followup",
      category: "nurturing",
      trigger: "Lead showed interest but hasn't committed", 
      subject: "Free {{industry}} marketing tips for {{companyName}}",
      template: "Hi {{firstName}},\n\nSince we spoke, I've been thinking about {{companyName}} and the opportunities in the {{industry}} market in {{location}}.\n\nI wanted to share 3 quick wins you could implement this week to attract more customers:\n\n1. {{tip1}}\n2. {{tip2}} \n3. {{tip3}}\n\nThese strategies alone could bring you 15-20 additional customers this month. But when combined with our complete system, our {{industry}} clients typically see 200-400% increases in customer inquiries.\n\nWould you like me to create a custom growth plan specifically for {{companyName}}? I can show you exactly how to dominate your local market.\n\nBest regards,\nSteve Williams\nTraffik Boosters\n(877) 840-6250",
      context: "Provides value while maintaining sales momentum",
      urgency: "medium",
      effectiveness: 0.82,
      personalizable: true
    }
  ];

  private static objectionHandlingTemplates: QuickReplyTemplate[] = [
    {
      id: "price_objection", 
      category: "objection_handling",
      trigger: "Cost concerns expressed",
      subject: "Understanding your investment concerns for {{companyName}}",
      template: "Hi {{firstName}},\n\nI completely understand your concern about the investment. Let me put this in perspective for {{companyName}}.\n\nOur average {{industry}} client sees a 300% return on investment within the first 90 days. That means if you invest $2,500, you typically see $7,500+ in additional revenue.\n\nHere's what that looks like:\n- Average new customer value: {{avgCustomerValue}}\n- Additional customers per month: {{additionalCustomers}}\n- Monthly revenue increase: {{monthlyIncrease}}\n\nThe real question isn't whether you can afford to invest in growth - it's whether you can afford NOT to while your competitors are capturing customers that should be yours.\n\nWould you like to see the exact ROI projection for {{companyName}}?\n\nBest regards,\nSteve Williams\nTraffik Boosters\n(877) 840-6250",
      context: "ROI-focused response to price objections",
      urgency: "high",
      effectiveness: 0.73,
      personalizable: true
    },
    {
      id: "timing_objection",
      category: "objection_handling", 
      trigger: "Not the right time concerns",
      subject: "Perfect timing for {{companyName}}'s growth",
      template: "Hi {{firstName}},\n\nI hear this from successful {{industry}} business owners all the time - \"it's not the right time.\" But here's what I've learned after helping 500+ businesses:\n\nThere's never a \"perfect\" time to grow your business. But there are optimal times to get ahead of your competition.\n\nRight now, while your competitors are waiting for the \"right time,\" you have a window of opportunity to:\n- Capture market share they're leaving on the table\n- Build momentum before they wake up\n- Establish dominance in {{location}}\n\nOur most successful clients started during \"inconvenient\" times because they understood that growth creates its own momentum.\n\nWhat if we could implement this gradually, starting with just 2-3 hours of your time to see initial results?\n\nBest regards,\nSteve Williams\nTraffik Boosters\n(877) 840-6250", 
      context: "Reframes timing objections as opportunities",
      urgency: "medium",
      effectiveness: 0.69,
      personalizable: true
    }
  ];

  private static pricingTemplates: QuickReplyTemplate[] = [
    {
      id: "pricing_inquiry",
      category: "pricing",
      trigger: "Direct pricing questions",
      subject: "{{companyName}} pricing and package options",
      template: "Hi {{firstName}},\n\nThanks for your interest in growing {{companyName}}! I'm excited to help you dominate the {{industry}} market in {{location}}.\n\nOur packages are customized based on your specific goals and market competition. Here's what we typically see for {{industry}} businesses:\n\n📈 Starter Package ($1,995/month):\n- Local SEO optimization\n- Google My Business management\n- Monthly reporting\n- Typical result: 50-100% increase in calls\n\n🚀 Growth Package ($3,495/month):\n- Everything in Starter\n- Advanced website optimization\n- Paid advertising management\n- Social media marketing\n- Typical result: 200-300% increase in calls\n\n💎 Domination Package ($5,995/month):\n- Everything in Growth\n- Multi-location optimization\n- Advanced automation\n- Priority support\n- Typical result: 400%+ increase in calls\n\nThe best part? We guarantee results or you don't pay. Would you like me to recommend the perfect package for {{companyName}}?\n\nBest regards,\nSteve Williams\nTraffik Boosters\n(877) 840-6250",
      context: "Comprehensive pricing with value positioning",
      urgency: "high", 
      effectiveness: 0.84,
      personalizable: true
    }
  ];

  private static schedulingTemplates: QuickReplyTemplate[] = [
    {
      id: "meeting_request",
      category: "scheduling",
      trigger: "Ready to schedule consultation",
      subject: "Let's schedule your {{companyName}} growth consultation",
      template: "Hi {{firstName}},\n\nPerfect! I'm excited to show you exactly how we can help {{companyName}} attract more customers in {{location}}.\n\nI have a few time slots available this week for a personalized consultation:\n\n📅 {{timeSlot1}}\n📅 {{timeSlot2}} \n📅 {{timeSlot3}}\n\nDuring our 30-minute call, I'll:\n✅ Analyze your current online presence\n✅ Show you exactly where your competitors are beating you\n✅ Create a custom growth plan for {{companyName}}\n✅ Demonstrate how our {{industry}} clients typically see 200-400% increases\n\nWhich time works best for you? I'll send a calendar invite with all the details.\n\nLooking forward to helping {{companyName}} dominate the {{location}} market!\n\nBest regards,\nSteve Williams\nTraffik Boosters\n(877) 840-6250",
      context: "Professional meeting scheduling with clear agenda", 
      urgency: "high",
      effectiveness: 0.91,
      personalizable: true
    }
  ];

  private static closingTemplates: QuickReplyTemplate[] = [
    {
      id: "ready_to_start",
      category: "closing",
      trigger: "Interest confirmed, ready to close",
      subject: "Let's get {{companyName}} started today!",
      template: "Hi {{firstName}},\n\nFantastic! I'm thrilled to help {{companyName}} become the dominant {{industry}} business in {{location}}.\n\nBased on our conversation, I recommend the {{recommendedPackage}} for {{companyName}}. This will give you:\n\n✅ {{benefit1}}\n✅ {{benefit2}}\n✅ {{benefit3}}\n✅ {{benefit4}}\n\nWe can get started immediately with a simple agreement. I'm attaching:\n\n📋 Service agreement for your review\n💳 Secure payment link\n📞 Direct line to reach me: (877) 840-6250\n\nOnce we receive your signed agreement, our team will begin the optimization process within 24 hours. You should start seeing increased calls within the first 2 weeks.\n\nReady to dominate your market? Let's make it happen!\n\nBest regards,\nSteve Williams\nTraffik Boosters\n(877) 840-6250",
      context: "Strong closing with clear next steps",
      urgency: "high",
      effectiveness: 0.87,
      personalizable: true
    }
  ];

  private static industrySpecificTips = {
    'HVAC': {
      keywords: ['heating', 'cooling', 'HVAC repair', 'air conditioning'],
      example: 'an HVAC company like Smith Heating & Air',
      tips: [
        'Optimize for emergency repair searches',
        'Create seasonal maintenance campaigns', 
        'Target energy efficiency keywords'
      ],
      avgCustomerValue: '$850',
      additionalCustomers: '25-40',
      monthlyIncrease: '$21,250-$34,000'
    },
    'Plumbing': {
      keywords: ['plumber', 'drain cleaning', 'water heater', 'pipe repair'],
      example: 'a plumbing company like Pro Plumbing Solutions',
      tips: [
        'Focus on emergency plumbing keywords',
        'Build trust with customer testimonials',
        'Target water heater replacement searches'
      ],
      avgCustomerValue: '$425',
      additionalCustomers: '30-50', 
      monthlyIncrease: '$12,750-$21,250'
    },
    'Electrical': {
      keywords: ['electrician', 'electrical repair', 'panel upgrade', 'wiring'],
      example: 'an electrical company like Sparks Electric',
      tips: [
        'Emphasize safety and licensing',
        'Target panel upgrade keywords',
        'Focus on residential and commercial services'
      ],
      avgCustomerValue: '$650',
      additionalCustomers: '20-35',
      monthlyIncrease: '$13,000-$22,750'
    },
    'Restaurant': {
      keywords: ['restaurant', 'dining', 'takeout', 'delivery'],
      example: 'a restaurant like Tony\'s Italian Kitchen',
      tips: [
        'Optimize for food delivery searches',
        'Build strong Google My Business presence',
        'Target local dining keywords'
      ],
      avgCustomerValue: '$35',
      additionalCustomers: '200-400',
      monthlyIncrease: '$7,000-$14,000'
    },
    'Legal': {
      keywords: ['lawyer', 'attorney', 'legal services', 'law firm'],
      example: 'a law firm like Johnson & Associates',
      tips: [
        'Focus on practice area keywords',
        'Build authority with content marketing',
        'Target local legal service searches'
      ],
      avgCustomerValue: '$2,500',
      additionalCustomers: '8-15',
      monthlyIncrease: '$20,000-$37,500'
    },
    'Healthcare': {
      keywords: ['doctor', 'medical', 'healthcare', 'clinic'],
      example: 'a medical practice like Downtown Family Medicine',
      tips: [
        'Optimize for health condition searches',
        'Build patient review base',
        'Target insurance and location keywords'
      ],
      avgCustomerValue: '$300',
      additionalCustomers: '40-80',
      monthlyIncrease: '$12,000-$24,000'
    }
  };

  generateQuickReplies(contact: Partial<Contact>, replyType: string): QuickReplyResult {
    const industry = this.extractIndustry(contact);
    const leadStatus = contact.leadStatus || 'new';
    const location = this.extractLocation(contact);
    
    let relevantTemplates: QuickReplyTemplate[] = [];
    
    // Select templates based on reply type and context
    switch (replyType) {
      case 'follow_up':
        relevantTemplates = AIQuickReplyEngine.followUpTemplates;
        break;
      case 'objection_handling':
        relevantTemplates = AIQuickReplyEngine.objectionHandlingTemplates;
        break;
      case 'pricing':
        relevantTemplates = AIQuickReplyEngine.pricingTemplates;
        break;
      case 'scheduling':
        relevantTemplates = AIQuickReplyEngine.schedulingTemplates;
        break;
      case 'closing':
        relevantTemplates = AIQuickReplyEngine.closingTemplates;
        break;
      default:
        relevantTemplates = [...AIQuickReplyEngine.followUpTemplates, ...AIQuickReplyEngine.objectionHandlingTemplates];
    }

    // Filter templates based on context
    const contextualTemplates = relevantTemplates.filter(template => {
      if (template.industry && !template.industry.includes(industry)) return false;
      if (template.leadStatus && !template.leadStatus.includes(leadStatus)) return false;
      return true;
    });

    // Personalize templates
    const personalizedTemplates = contextualTemplates.map(template => 
      this.personalizeTemplate(template, contact, industry, location)
    );

    // Find most relevant template
    const mostRelevant = personalizedTemplates[0] || personalizedTemplates[0];
    const alternatives = personalizedTemplates.slice(1, 3);

    return {
      templates: personalizedTemplates,
      contextualSuggestions: {
        mostRelevant,
        alternativeOptions: alternatives,
        contextReason: this.generateContextReason(contact, industry, leadStatus)
      },
      personalizationTips: this.generatePersonalizationTips(contact, industry),
      bestSendTime: this.getBestSendTime(industry, leadStatus),
      expectedResponseRate: this.calculateExpectedResponseRate(contact, mostRelevant)
    };
  }

  private personalizeTemplate(
    template: QuickReplyTemplate, 
    contact: Partial<Contact>, 
    industry: string, 
    location: string
  ): QuickReplyTemplate {
    const industryData = AIQuickReplyEngine.industrySpecificTips[industry as keyof typeof AIQuickReplyEngine.industrySpecificTips] || AIQuickReplyEngine.industrySpecificTips['HVAC'];
    
    let personalizedTemplate = template.template
      .replace(/\{\{firstName\}\}/g, contact.firstName || 'there')
      .replace(/\{\{companyName\}\}/g, contact.company || 'your business')
      .replace(/\{\{industry\}\}/g, industry.toLowerCase())
      .replace(/\{\{location\}\}/g, location)
      .replace(/\{\{serviceKeyword\}\}/g, industryData.keywords[0])
      .replace(/\{\{industryExample\}\}/g, industryData.example)
      .replace(/\{\{avgCustomerValue\}\}/g, industryData.avgCustomerValue)
      .replace(/\{\{additionalCustomers\}\}/g, industryData.additionalCustomers)
      .replace(/\{\{monthlyIncrease\}\}/g, industryData.monthlyIncrease)
      .replace(/\{\{tip1\}\}/g, industryData.tips[0])
      .replace(/\{\{tip2\}\}/g, industryData.tips[1])
      .replace(/\{\{tip3\}\}/g, industryData.tips[2]);

    let personalizedSubject = template.subject
      .replace(/\{\{firstName\}\}/g, contact.firstName || 'Business Owner')
      .replace(/\{\{companyName\}\}/g, contact.company || 'your business')
      .replace(/\{\{industry\}\}/g, industry.toLowerCase());

    return {
      ...template,
      template: personalizedTemplate,
      subject: personalizedSubject
    };
  }

  private extractIndustry(contact: Partial<Contact>): string {
    if (!contact.notes) return 'Business';
    
    const notes = contact.notes.toLowerCase();
    
    if (notes.includes('hvac') || notes.includes('heating') || notes.includes('cooling')) return 'HVAC';
    if (notes.includes('plumb') || notes.includes('drain') || notes.includes('pipe')) return 'Plumbing';
    if (notes.includes('electric') || notes.includes('wiring') || notes.includes('panel')) return 'Electrical';
    if (notes.includes('restaurant') || notes.includes('dining') || notes.includes('food')) return 'Restaurant';
    if (notes.includes('legal') || notes.includes('lawyer') || notes.includes('attorney')) return 'Legal';
    if (notes.includes('medical') || notes.includes('doctor') || notes.includes('healthcare')) return 'Healthcare';
    
    return 'Business';
  }

  private extractLocation(contact: Partial<Contact>): string {
    if (contact.notes) {
      // Extract location from notes if available
      const locationMatch = contact.notes.match(/(?:from|in|located|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      if (locationMatch) {
        return locationMatch[1];
      }
    }
    return 'your area';
  }

  private generateContextReason(contact: Partial<Contact>, industry: string, status: string): string {
    return `Based on ${contact.firstName || 'this lead'}'s ${industry.toLowerCase()} business and ${status} status, this template addresses their most likely concerns and interests.`;
  }

  private generatePersonalizationTips(contact: Partial<Contact>, industry: string): string[] {
    return [
      `Mention specific ${industry.toLowerCase()} challenges when possible`,
      `Reference their business name (${contact.company || 'their company'}) throughout`,
      `Include local market references for their area`,
      `Use industry-specific terminology they'll recognize`,
      `Add recent industry trends or statistics if available`
    ];
  }

  private getBestSendTime(industry: string, status: string): string {
    if (industry === 'Restaurant') {
      return 'Tuesday-Thursday, 2-4 PM (between lunch and dinner rush)';
    } else if (industry === 'Healthcare') {
      return 'Tuesday-Thursday, 10 AM-12 PM or 2-4 PM';
    } else if (status === 'hot') {
      return 'As soon as possible, ideally within 1 hour';
    }
    return 'Tuesday-Thursday, 9-11 AM or 2-4 PM';
  }

  private calculateExpectedResponseRate(contact: Partial<Contact>, template: QuickReplyTemplate): number {
    let baseRate = template.effectiveness;
    
    // Adjust based on lead quality indicators
    if (contact.phone) baseRate += 0.05;
    if (contact.email) baseRate += 0.03;
    if (contact.company) baseRate += 0.04;
    
    return Math.min(0.95, baseRate);
  }
}

export const quickReplyEngine = new AIQuickReplyEngine();