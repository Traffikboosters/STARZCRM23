import type { Contact } from "@shared/schema";

interface ScoreFactors {
  industryValue: number;
  companySizeValue: number;
  budgetScore: number;
  timelineScore: number;
  engagementScore: number;
  sourceQuality: number;
  urgencyMultiplier: number;
  qualificationLevel: number;
}

interface LeadScoringResult {
  aiScore: number;
  scoreFactors: ScoreFactors;
  industryScore: number;
  urgencyLevel: string;
  qualificationScore: number;
  recommendations: string[];
  priorityLevel: string;
}

export class AILeadScoringEngine {
  // Industry scoring based on service demand and market value
  private static industryScores: Record<string, number> = {
    "healthcare": 95,
    "legal": 90,
    "finance": 88,
    "real_estate": 85,
    "automotive": 82,
    "home_services": 80,
    "restaurant": 75,
    "retail": 70,
    "education": 68,
    "nonprofit": 45,
    "government": 40,
    "other": 50
  };

  // Company size impact on deal potential
  private static companySizeScores: Record<string, number> = {
    "enterprise": 100,
    "large": 85,
    "medium": 70,
    "small": 55,
    "startup": 40
  };

  // Lead source quality ratings
  private static sourceQualityScores: Record<string, number> = {
    "referral": 95,
    "website": 85,
    "google_ads": 80,
    "linkedin": 75,
    "facebook": 70,
    "chat_widget": 68,
    "yelp": 65,
    "google_maps": 60,
    "cold_call": 45,
    "email": 40,
    "other": 35
  };

  // Timeline urgency scoring
  private static timelineScores: Record<string, number> = {
    "immediate": 100,
    "1_month": 85,
    "3_months": 70,
    "6_months": 55,
    "1_year": 35,
    "unknown": 25
  };

  static calculateLeadScore(contact: Partial<Contact>): LeadScoringResult {
    const factors: ScoreFactors = {
      industryValue: this.calculateIndustryScore(contact.notes || ""),
      companySizeValue: this.calculateCompanySizeScore(contact.companySize || undefined),
      budgetScore: this.calculateBudgetScore(contact.budget || undefined, contact.dealValue || undefined),
      timelineScore: this.calculateTimelineScore(contact.timeline || undefined),
      engagementScore: this.calculateEngagementScore(contact),
      sourceQuality: this.calculateSourceQuality(contact.leadSource || undefined),
      urgencyMultiplier: this.calculateUrgencyMultiplier(contact),
      qualificationLevel: this.calculateQualificationScore(contact)
    };

    // Calculate weighted AI score
    const baseScore = (
      factors.industryValue * 0.20 +
      factors.companySizeValue * 0.15 +
      factors.budgetScore * 0.20 +
      factors.timelineScore * 0.15 +
      factors.engagementScore * 0.10 +
      factors.sourceQuality * 0.10 +
      factors.qualificationLevel * 0.10
    );

    const aiScore = Math.min(100, Math.round(baseScore * factors.urgencyMultiplier));
    
    const result: LeadScoringResult = {
      aiScore,
      scoreFactors: factors,
      industryScore: factors.industryValue,
      urgencyLevel: this.determineUrgencyLevel(aiScore, factors),
      qualificationScore: factors.qualificationLevel,
      recommendations: this.generateRecommendations(aiScore, factors, contact),
      priorityLevel: this.determinePriorityLevel(aiScore)
    };

    return result;
  }

  private static calculateIndustryScore(notes: string): number {
    const notesLower = notes.toLowerCase();
    
    // Extract industry keywords from notes
    for (const [industry, score] of Object.entries(this.industryScores)) {
      const keywords = this.getIndustryKeywords(industry);
      if (keywords.some(keyword => notesLower.includes(keyword))) {
        return score;
      }
    }
    
    return this.industryScores.other;
  }

  private static getIndustryKeywords(industry: string): string[] {
    const keywordMap: Record<string, string[]> = {
      healthcare: ["medical", "healthcare", "clinic", "hospital", "dental", "doctor", "physician"],
      legal: ["law", "legal", "attorney", "lawyer", "firm", "litigation"],
      finance: ["financial", "bank", "investment", "accounting", "insurance"],
      real_estate: ["real estate", "property", "realtor", "mortgage"],
      automotive: ["auto", "car", "vehicle", "dealership", "repair"],
      home_services: ["plumbing", "hvac", "electrical", "roofing", "cleaning", "landscaping"],
      restaurant: ["restaurant", "food", "dining", "catering"],
      retail: ["retail", "store", "shop", "e-commerce"],
      education: ["school", "education", "university", "training"],
      nonprofit: ["nonprofit", "charity", "foundation"],
      government: ["government", "municipal", "city", "state"]
    };
    
    return keywordMap[industry] || [];
  }

  private static calculateCompanySizeScore(companySize?: string): number {
    if (!companySize) return 50;
    return this.companySizeScores[companySize] || 50;
  }

  private static calculateBudgetScore(budget?: number, dealValue?: number): number {
    const value = budget || dealValue || 0;
    
    if (value >= 1000000) return 100; // $10,000+
    if (value >= 500000) return 85;   // $5,000+
    if (value >= 300000) return 70;   // $3,000+
    if (value >= 150000) return 55;   // $1,500+
    if (value >= 50000) return 40;    // $500+
    
    return 25; // Under $500 or unknown
  }

  private static calculateTimelineScore(timeline?: string): number {
    if (!timeline) return 25;
    return this.timelineScores[timeline] || 25;
  }

  private static calculateEngagementScore(contact: Partial<Contact>): number {
    let score = 0;
    
    // Recent contact activity
    if (contact.lastContactedAt) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(contact.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceContact <= 1) score += 30;
      else if (daysSinceContact <= 3) score += 20;
      else if (daysSinceContact <= 7) score += 10;
    }

    // Lead status progression
    const statusScores: Record<string, number> = {
      "qualified": 25,
      "proposal": 20,
      "negotiation": 15,
      "contacted": 10,
      "new": 5
    };
    score += statusScores[contact.leadStatus || "new"] || 0;

    // Pipeline advancement
    const pipelineScores: Record<string, number> = {
      "negotiation": 25,
      "proposal": 20,
      "demo": 15,
      "qualified": 10,
      "prospect": 5
    };
    score += pipelineScores[contact.pipelineStage || "prospect"] || 0;

    return Math.min(100, score);
  }

  private static calculateSourceQuality(leadSource?: string): number {
    if (!leadSource) return 35;
    return this.sourceQualityScores[leadSource] || 35;
  }

  private static calculateUrgencyMultiplier(contact: Partial<Contact>): number {
    const timeline = contact.timeline;
    const lastContacted = contact.lastContactedAt;
    
    let multiplier = 1.0;
    
    // Timeline urgency
    if (timeline === "immediate") multiplier += 0.3;
    else if (timeline === "1_month") multiplier += 0.2;
    else if (timeline === "3_months") multiplier += 0.1;
    
    // Recent engagement
    if (lastContacted) {
      const hoursAgo = (Date.now() - new Date(lastContacted).getTime()) / (1000 * 60 * 60);
      if (hoursAgo <= 24) multiplier += 0.2;
      else if (hoursAgo <= 72) multiplier += 0.1;
    }
    
    return Math.min(1.5, multiplier);
  }

  private static calculateQualificationScore(contact: Partial<Contact>): number {
    let score = 0;
    
    // BANT qualification factors
    if (contact.budget && contact.budget > 0) score += 25; // Budget
    if (contact.position && ["owner", "ceo", "manager", "director"].some(title => 
      contact.position!.toLowerCase().includes(title))) score += 25; // Authority
    if (contact.timeline && contact.timeline !== "unknown") score += 25; // Need/Timeline
    if (contact.phone && contact.email) score += 25; // Contact info completeness
    
    return score;
  }

  private static determineUrgencyLevel(aiScore: number, factors: ScoreFactors): string {
    if (aiScore >= 80 && factors.timelineScore >= 85) return "critical";
    if (aiScore >= 70 && factors.timelineScore >= 70) return "high";
    if (aiScore >= 50) return "medium";
    return "low";
  }

  private static determinePriorityLevel(aiScore: number): string {
    if (aiScore >= 80) return "urgent";
    if (aiScore >= 65) return "high";
    if (aiScore >= 45) return "medium";
    return "low";
  }

  private static generateRecommendations(
    aiScore: number, 
    factors: ScoreFactors, 
    contact: Partial<Contact>
  ): string[] {
    const recommendations: string[] = [];
    
    if (aiScore >= 80) {
      recommendations.push("🔥 High-priority lead - Contact immediately");
      recommendations.push("💰 High deal potential - Prepare premium service proposals");
    } else if (aiScore >= 65) {
      recommendations.push("📞 Priority contact - Reach out within 2 hours");
      recommendations.push("📋 Prepare detailed service presentation");
    } else if (aiScore >= 45) {
      recommendations.push("📅 Schedule follow-up within 24 hours");
      recommendations.push("📧 Send informational materials");
    } else {
      recommendations.push("📝 Add to nurture campaign");
      recommendations.push("🔍 Gather more qualification information");
    }
    
    // Specific factor-based recommendations
    if (factors.budgetScore < 40) {
      recommendations.push("💵 Qualify budget requirements during next contact");
    }
    
    if (factors.timelineScore >= 85) {
      recommendations.push("⚡ Urgent timeline - Fast-track proposal process");
    }
    
    if (factors.engagementScore < 30) {
      recommendations.push("📈 Low engagement - Try different contact methods");
    }
    
    if (factors.qualificationLevel < 50) {
      recommendations.push("❓ Incomplete qualification - Focus on BANT discovery");
    }
    
    return recommendations;
  }

  // Batch scoring for multiple leads
  static scoreMultipleLeads(contacts: Partial<Contact>[]): Map<number, LeadScoringResult> {
    const results = new Map<number, LeadScoringResult>();
    
    contacts.forEach(contact => {
      if (contact.id) {
        results.set(contact.id, this.calculateLeadScore(contact));
      }
    });
    
    return results;
  }

  // Priority sorting
  static sortLeadsByPriority(contacts: Partial<Contact>[]): Partial<Contact>[] {
    return contacts
      .map(contact => ({
        ...contact,
        calculatedScore: this.calculateLeadScore(contact)
      }))
      .sort((a, b) => b.calculatedScore.aiScore - a.calculatedScore.aiScore);
  }
}