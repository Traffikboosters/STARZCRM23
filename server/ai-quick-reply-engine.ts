import type { Contact } from "@shared/schema";

interface QuickReplyTemplate {
  id: string;
  category: 'follow_up' | 'objection_handling' | 'pricing' | 'scheduling' | 'closing' | 'nurturing' | 'introduction' | 'value_proposition';
  trigger: string[];
  subject: string;
  template: string;
  context: string;
  industry?: string[];
  leadStatus?: string[];
  urgency: 'low' | 'medium' | 'high';
  effectiveness: number;
  personalizable: boolean;
  responseRate: number;
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
  industryInsights: string[];
}

export class AIQuickReplyEngine {
  private static followUpTemplates: QuickReplyTemplate[] = [
    {
      id: 'fu_001',
      category: 'follow_up',
      trigger: ['no_response', 'initial_contact', 'meeting_followup'],
      subject: 'Quick follow-up - {company_name}',
      template: `Hi {first_name},

I wanted to follow up on our conversation about helping {company_name} {specific_goal}.

Based on what you mentioned about {pain_point}, I think our {relevant_service} could be a perfect fit. We've helped similar {industry} businesses {specific_result}.

Would you have 15 minutes this week for a quick call to discuss how we can help {company_name} {achieve_goal}?

Best regards,
{sender_name}
Traffik Boosters
(877) 840-6250
michael@traffikboosters.com

P.S. I can share a case study of how we helped {similar_company} {similar_result} if that would be helpful.`,
      context: 'Professional follow-up for initial contacts who haven\'t responded',
      industry: ['all'],
      leadStatus: ['new', 'contacted'],
      urgency: 'medium',
      effectiveness: 85,
      personalizable: true,
      responseRate: 32
    },
    {
      id: 'fu_002',
      category: 'follow_up',
      trigger: ['second_followup', 'no_response_week'],
      subject: 'Last chance - {specific_benefit} for {company_name}',
      template: `Hi {first_name},

I know you're busy running {company_name}, so I'll keep this brief.

I've been thinking about our conversation regarding {specific_challenge}. I have an idea that could help you {specific_solution} without the usual {common_objection}.

This week only, I can offer a complimentary {consultation_type} to show you exactly how this would work for {company_name}.

Interested? Just reply "YES" and I'll send you my calendar link.

{sender_name}
Traffik Boosters
"More Traffik! More Sales!"`,
      context: 'Urgency-driven follow-up for non-responsive leads',
      industry: ['all'],
      leadStatus: ['contacted', 'no_response'],
      urgency: 'high',
      effectiveness: 78,
      personalizable: true,
      responseRate: 28
    }
  ];

  private static objectionHandlingTemplates: QuickReplyTemplate[] = [
    {
      id: 'oh_001',
      category: 'objection_handling',
      trigger: ['price_objection', 'budget_concern'],
      subject: 'Re: Budget concerns for {company_name}',
      template: `Hi {first_name},

I completely understand your concern about budget - it's always a valid consideration.

Let me put this in perspective: The {service_name} investment of {price_range} typically pays for itself within {roi_timeframe} through {specific_benefits}.

For example, one of our {industry} clients saw {specific_result} in just {timeframe}, which more than covered their investment.

Would it help if I showed you exactly how this ROI works for businesses like {company_name}? I can prepare a custom projection based on your specific situation.

No obligation - just information to help you make the best decision.

{sender_name}
Traffik Boosters`,
      context: 'Addresses price objections with ROI focus',
      industry: ['all'],
      leadStatus: ['qualified', 'interested'],
      urgency: 'high',
      effectiveness: 82,
      personalizable: true,
      responseRate: 45
    },
    {
      id: 'oh_002',
      category: 'objection_handling',
      trigger: ['timing_objection', 'not_right_time'],
      subject: 'Perfect timing actually - here\'s why',
      template: `Hi {first_name},

I hear "not the right time" often, and I understand. However, let me share something interesting...

Most successful {industry} businesses implement growth strategies during {current_season/market_condition} because:

1. {seasonal_advantage_1}
2. {competitive_advantage}
3. {market_timing_benefit}

We could start with a pilot program that requires minimal time investment from you while delivering {quick_win} in the first {short_timeframe}.

What if timing wasn't an issue? Would this be something {company_name} would benefit from?

{sender_name}
Traffik Boosters`,
      context: 'Reframes timing objections as opportunities',
      industry: ['all'],
      leadStatus: ['interested', 'objection'],
      urgency: 'medium',
      effectiveness: 76,
      personalizable: true,
      responseRate: 38
    }
  ];

  private static pricingTemplates: QuickReplyTemplate[] = [
    {
      id: 'pr_001',
      category: 'pricing',
      trigger: ['pricing_request', 'quote_request'],
      subject: 'Custom pricing for {company_name} - {service_name}',
      template: `Hi {first_name},

Thank you for your interest in our {service_name} for {company_name}.

Based on our conversation about {specific_needs}, here's what I recommend:

**{recommended_package}** - {package_price}
✓ {benefit_1}
✓ {benefit_2}
✓ {benefit_3}
✓ {unique_value_add}

**Why this investment makes sense:**
• Expected ROI: {roi_percentage}% within {timeframe}
• Industry average for {industry}: {industry_benchmark}
• {specific_guarantee}

I've also included a {bonus_item} at no extra cost because {personalized_reason}.

Ready to move forward? I can have this started for {company_name} as early as {start_date}.

{sender_name}
Traffik Boosters
(877) 840-6250`,
      context: 'Professional pricing presentation with value justification',
      industry: ['all'],
      leadStatus: ['qualified', 'interested'],
      urgency: 'high',
      effectiveness: 88,
      personalizable: true,
      responseRate: 52
    }
  ];

  private static industrySpecificTemplates = {
    'HVAC': {
      painPoints: ['seasonal demand fluctuations', 'emergency call competition', 'customer acquisition cost'],
      solutions: ['predictable lead flow', '24/7 online presence', 'customer retention systems'],
      results: ['40% more service calls', 'reduced seasonal downtime', 'higher customer lifetime value']
    },
    'Plumbing': {
      painPoints: ['emergency competition', 'trust building', 'pricing transparency'],
      solutions: ['local SEO dominance', 'review management', 'online booking systems'],
      results: ['3x more emergency calls', 'improved online reputation', 'streamlined scheduling']
    },
    'Electrical': {
      painPoints: ['safety concerns', 'licensing credibility', 'residential vs commercial'],
      solutions: ['safety-focused marketing', 'credential highlighting', 'service specialization'],
      results: ['enhanced credibility', 'premium pricing acceptance', 'specialized market leadership']
    },
    'Restaurant': {
      painPoints: ['food delivery competition', 'customer retention', 'online ordering'],
      solutions: ['local food marketing', 'loyalty programs', 'delivery optimization'],
      results: ['increased repeat customers', 'higher order values', 'reduced delivery costs']
    },
    'Healthcare': {
      painPoints: ['patient acquisition', 'HIPAA compliance', 'online reputation'],
      solutions: ['compliant digital marketing', 'patient portal optimization', 'reputation management'],
      results: ['more patient bookings', 'improved online presence', 'enhanced patient satisfaction']
    },
    'Professional Services': {
      painPoints: ['lead qualification', 'expertise demonstration', 'client retention'],
      solutions: ['thought leadership content', 'case study marketing', 'client success tracking'],
      results: ['higher quality leads', 'increased authority', 'improved client lifetime value']
    }
  };

  static generateContextAwareTemplates(
    contact: Partial<Contact>, 
    context: {
      conversationStage?: string;
      lastInteraction?: string;
      responseHistory?: string[];
      urgencyLevel?: 'low' | 'medium' | 'high';
      campaignType?: string;
    } = {}
  ): QuickReplyResult {
    const industry = this.extractIndustry(contact);
    const companySize = this.estimateCompanySize(contact);
    const leadStatus = contact.status || 'new';
    
    // Combine all template categories
    const allTemplates = [
      ...this.followUpTemplates,
      ...this.objectionHandlingTemplates,
      ...this.pricingTemplates
    ];

    // Filter templates based on context and relevance
    const relevantTemplates = allTemplates.filter(template => 
      this.isTemplateRelevant(template, contact, context, industry, leadStatus)
    );

    // Score and rank templates
    const scoredTemplates = relevantTemplates.map(template => ({
      ...template,
      contextScore: this.calculateContextScore(template, contact, context, industry)
    })).sort((a, b) => b.contextScore - a.contextScore);

    const mostRelevant = scoredTemplates[0];
    const alternativeOptions = scoredTemplates.slice(1, 4);

    // Generate personalization data
    const personalizationTips = this.generatePersonalizationTips(contact, industry, context);
    const industryInsights = this.getIndustryInsights(industry, contact);
    const bestSendTime = this.calculateOptimalSendTime(industry, leadStatus, context);
    const expectedResponseRate = this.calculateExpectedResponseRate(contact, mostRelevant, context);

    return {
      templates: scoredTemplates.slice(0, 8),
      contextualSuggestions: {
        mostRelevant,
        alternativeOptions,
        contextReason: this.generateContextReason(contact, industry, context, mostRelevant)
      },
      personalizationTips,
      bestSendTime,
      expectedResponseRate,
      industryInsights
    };
  }

  private static isTemplateRelevant(
    template: QuickReplyTemplate,
    contact: Partial<Contact>,
    context: any,
    industry: string,
    leadStatus: string
  ): boolean {
    // Check industry relevance
    if (template.industry && !template.industry.includes('all') && !template.industry.includes(industry)) {
      return false;
    }

    // Check lead status relevance
    if (template.leadStatus && !template.leadStatus.includes(leadStatus)) {
      return false;
    }

    // Check context triggers
    if (context.conversationStage && template.trigger.includes(context.conversationStage)) {
      return true;
    }

    return true;
  }

  private static calculateContextScore(
    template: QuickReplyTemplate,
    contact: Partial<Contact>,
    context: any,
    industry: string
  ): number {
    let score = template.effectiveness;

    // Boost score for trigger matches
    if (context.conversationStage && template.trigger.includes(context.conversationStage)) {
      score += 20;
    }

    // Industry-specific boost
    if (template.industry?.includes(industry)) {
      score += 15;
    }

    // Urgency matching
    if (context.urgencyLevel === template.urgency) {
      score += 10;
    }

    // Response history consideration
    if (context.responseHistory?.length === 0 && template.category === 'follow_up') {
      score += 15;
    }

    return score;
  }

  private static extractIndustry(contact: Partial<Contact>): string {
    const notes = contact.notes?.toLowerCase() || '';
    const company = contact.company?.toLowerCase() || '';
    
    // Industry keyword matching
    const industryKeywords = {
      'HVAC': ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ac repair'],
      'Plumbing': ['plumbing', 'plumber', 'pipes', 'drain', 'water heater', 'leak'],
      'Electrical': ['electrical', 'electrician', 'wiring', 'electric', 'generator', 'lighting'],
      'Restaurant': ['restaurant', 'food', 'dining', 'cafe', 'bistro', 'catering'],
      'Healthcare': ['medical', 'doctor', 'dental', 'clinic', 'health', 'physician'],
      'Professional Services': ['consulting', 'legal', 'accounting', 'financial', 'advisory']
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => notes.includes(keyword) || company.includes(keyword))) {
        return industry;
      }
    }

    return 'General Business';
  }

  private static estimateCompanySize(contact: Partial<Contact>): string {
    const notes = contact.notes?.toLowerCase() || '';
    const company = contact.company?.toLowerCase() || '';
    
    if (notes.includes('small') || notes.includes('startup') || company.includes('llc')) {
      return 'small';
    }
    if (notes.includes('medium') || notes.includes('growing')) {
      return 'medium';
    }
    if (notes.includes('large') || notes.includes('enterprise') || company.includes('inc')) {
      return 'large';
    }
    
    return 'small'; // Default assumption
  }

  private static generatePersonalizationTips(
    contact: Partial<Contact>,
    industry: string,
    context: any
  ): string[] {
    const tips = [
      `Use "${contact.firstName}" frequently to build personal rapport`,
      `Reference "${contact.company || contact.firstName + "'s business"}" to show you understand their context`
    ];

    if (industry !== 'General Business') {
      const industryData = this.industrySpecificTemplates[industry as keyof typeof this.industrySpecificTemplates];
      if (industryData) {
        tips.push(`Mention ${industry}-specific challenges like "${industryData.painPoints[0]}"`);
        tips.push(`Highlight relevant results: "${industryData.results[0]}"`);
      }
    }

    if (contact.notes) {
      tips.push(`Reference their specific situation mentioned in notes: "${contact.notes.substring(0, 50)}..."`);
    }

    if (context.urgencyLevel === 'high') {
      tips.push('Use urgency language: "This week only", "Limited time", "Quick response needed"');
    }

    return tips;
  }

  private static getIndustryInsights(industry: string, contact: Partial<Contact>): string[] {
    const industryData = this.industrySpecificTemplates[industry as keyof typeof this.industrySpecificTemplates];
    
    if (!industryData) {
      return [
        'Focus on ROI and measurable results',
        'Highlight competitive advantages',
        'Emphasize time-saving benefits'
      ];
    }

    return [
      `${industry} businesses typically struggle with: ${industryData.painPoints.join(', ')}`,
      `Most effective solutions include: ${industryData.solutions.join(', ')}`,
      `Expected results: ${industryData.results.join(', ')}`,
      `Industry-specific urgency: Peak demand periods require advance planning`
    ];
  }

  private static calculateOptimalSendTime(
    industry: string,
    leadStatus: string,
    context: any
  ): string {
    const timePreferences = {
      'HVAC': 'Tuesday-Thursday, 10 AM - 2 PM (before afternoon service calls)',
      'Plumbing': 'Monday-Wednesday, 9 AM - 11 AM (before emergency calls)',
      'Electrical': 'Tuesday-Thursday, 1 PM - 3 PM (after morning installations)',
      'Restaurant': 'Tuesday-Thursday, 2 PM - 4 PM (between lunch and dinner)',
      'Healthcare': 'Wednesday-Friday, 11 AM - 1 PM (administrative time)',
      'Professional Services': 'Tuesday-Thursday, 9 AM - 11 AM (start of business day)'
    };

    if (context.urgencyLevel === 'high') {
      return 'Send immediately - high urgency requires quick response';
    }

    return timePreferences[industry as keyof typeof timePreferences] || 
           'Tuesday-Thursday, 10 AM - 2 PM (general business hours)';
  }

  private static calculateExpectedResponseRate(
    contact: Partial<Contact>,
    template: QuickReplyTemplate,
    context: any
  ): number {
    let baseRate = template.responseRate;

    // Adjust for personalization
    if (contact.firstName && contact.company) {
      baseRate += 8;
    }

    // Adjust for industry relevance
    if (template.industry?.includes(this.extractIndustry(contact))) {
      baseRate += 5;
    }

    // Adjust for urgency
    if (context.urgencyLevel === 'high') {
      baseRate += 7;
    }

    // Adjust for lead quality
    if (contact.status === 'qualified') {
      baseRate += 12;
    }

    return Math.min(baseRate, 85); // Cap at 85%
  }

  private static generateContextReason(
    contact: Partial<Contact>,
    industry: string,
    context: any,
    template: QuickReplyTemplate
  ): string {
    const reasons = [];

    if (template.category === 'follow_up' && !context.responseHistory?.length) {
      reasons.push('No previous responses detected');
    }

    if (industry !== 'General Business') {
      reasons.push(`${industry} industry-specific template`);
    }

    if (contact.status === 'qualified') {
      reasons.push('Lead is qualified and ready for next steps');
    }

    if (context.urgencyLevel === 'high') {
      reasons.push('High urgency situation requires immediate attention');
    }

    if (template.effectiveness > 80) {
      reasons.push(`High effectiveness rate (${template.effectiveness}%)`);
    }

    return reasons.length > 0 
      ? `Recommended because: ${reasons.join(', ')}`
      : 'Best match based on current context and lead profile';
  }

  static personalizeTemplate(
    template: QuickReplyTemplate,
    contact: Partial<Contact>,
    customData: Record<string, string> = {}
  ): QuickReplyTemplate {
    const industry = this.extractIndustry(contact);
    const industryData = this.industrySpecificTemplates[industry as keyof typeof this.industrySpecificTemplates];

    const replacements = {
      '{first_name}': contact.firstName || 'there',
      '{company_name}': contact.company || `${contact.firstName}'s business`,
      '{sender_name}': 'Michael Thompson',
      '{specific_goal}': industryData?.solutions[0] || 'grow your business',
      '{pain_point}': industryData?.painPoints[0] || 'marketing challenges',
      '{relevant_service}': 'digital marketing solution',
      '{industry}': industry.toLowerCase(),
      '{specific_result}': industryData?.results[0] || 'significant growth',
      '{achieve_goal}': 'reach your growth targets',
      '{similar_company}': `another ${industry.toLowerCase()} business`,
      '{similar_result}': industryData?.results[1] || 'increase their revenue by 40%',
      ...customData
    };

    let personalizedSubject = template.subject;
    let personalizedTemplate = template.template;

    Object.entries(replacements).forEach(([placeholder, value]) => {
      personalizedSubject = personalizedSubject.replace(new RegExp(placeholder, 'g'), value);
      personalizedTemplate = personalizedTemplate.replace(new RegExp(placeholder, 'g'), value);
    });

    return {
      ...template,
      subject: personalizedSubject,
      template: personalizedTemplate
    };
  }
}

export const aiQuickReplyEngine = new AIQuickReplyEngine();