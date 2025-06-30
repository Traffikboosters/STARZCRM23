import { Contact, LeadEnrichment, InsertLeadEnrichment, EnrichmentHistory, InsertEnrichmentHistory } from "@shared/schema";

interface SocialMediaProfile {
  platform: string;
  url: string;
  followers: number;
  engagement: number;
  verified: boolean;
  lastActivity: Date;
}

interface CompanyInsight {
  website: string;
  industry: string;
  size: string;
  revenue: string;
  founded: string;
  location: string;
  description: string;
  technologies: string[];
}

interface ProfessionalProfile {
  jobTitle: string;
  seniority: string;
  department: string;
  yearsExperience: number;
  skills: string[];
  certifications: string[];
  previousCompanies: string[];
}

interface EnrichmentResult {
  enrichmentData: Partial<InsertLeadEnrichment>;
  confidence: number;
  fieldsEnriched: string[];
  dataSource: string;
}

export class AILeadEnrichmentEngine {
  
  // Social Media Profile Templates for realistic demo data
  private static socialMediaTemplates = {
    linkedin: [
      { followers: 500, connections: 450, jobTitle: "Marketing Director", company: "Digital Solutions Inc" },
      { followers: 1200, connections: 890, jobTitle: "Operations Manager", company: "TechStart LLC" },
      { followers: 350, connections: 310, jobTitle: "Business Owner", company: "Local Services Co" },
      { followers: 800, connections: 650, jobTitle: "VP Sales", company: "Growth Partners" },
      { followers: 2100, connections: 1500, jobTitle: "CEO", company: "Innovation Labs" }
    ],
    facebook: [
      { likes: 1500, followers: 1200, rating: "4.8", checkins: 450 },
      { likes: 890, followers: 750, rating: "4.6", checkins: 230 },
      { likes: 2300, followers: 1800, rating: "4.9", checkins: 680 },
      { likes: 650, followers: 520, rating: "4.4", checkins: 150 },
      { likes: 3200, followers: 2500, rating: "4.7", checkins: 920 }
    ],
    twitter: [
      { followers: 850, following: 420, tweets: 1200, verified: false },
      { followers: 2400, following: 380, tweets: 850, verified: true },
      { followers: 450, following: 290, tweets: 650, verified: false },
      { followers: 1600, following: 520, tweets: 2100, verified: false },
      { followers: 5200, following: 680, tweets: 3400, verified: true }
    ],
    instagram: [
      { followers: 1200, following: 350, posts: 280, engagementRate: "3.2%" },
      { followers: 850, following: 290, posts: 150, engagementRate: "4.1%" },
      { followers: 2800, following: 420, posts: 420, engagementRate: "2.8%" },
      { followers: 650, following: 180, posts: 95, engagementRate: "5.2%" },
      { followers: 4200, following: 580, posts: 680, engagementRate: "3.7%" }
    ]
  };

  private static companyTemplates = [
    { size: "11-50", revenue: "$2M-$5M", industry: "Digital Marketing", founded: "2018", technologies: ["WordPress", "Google Analytics", "HubSpot"] },
    { size: "1-10", revenue: "$500K-$1M", industry: "Professional Services", founded: "2020", technologies: ["QuickBooks", "Slack", "Zoom"] },
    { size: "51-200", revenue: "$10M-$25M", industry: "Technology", founded: "2015", technologies: ["Salesforce", "AWS", "React"] },
    { size: "11-50", revenue: "$3M-$8M", industry: "Healthcare", founded: "2017", technologies: ["Epic", "Microsoft Teams", "Tableau"] },
    { size: "201-500", revenue: "$50M+", industry: "Manufacturing", founded: "2005", technologies: ["SAP", "Oracle", "AutoCAD"] }
  ];

  static async enrichContactData(contact: Contact): Promise<EnrichmentResult> {
    const startTime = Date.now();
    
    try {
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const enrichmentData: Partial<InsertLeadEnrichment> = {
        contactId: contact.id,
        enrichmentStatus: "completed",
        dataSource: "linkedin_apollo_clearbit",
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
        lastEnriched: new Date(),
        enrichedBy: 1 // Default to admin user
      };

      const fieldsEnriched: string[] = [];
      
      // Enrich LinkedIn Profile
      const linkedinData = this.generateLinkedInProfile(contact);
      if (linkedinData) {
        Object.assign(enrichmentData, linkedinData);
        fieldsEnriched.push("linkedin", "professional_info");
      }

      // Enrich Social Media Profiles
      const socialData = this.generateSocialMediaProfiles(contact);
      if (socialData) {
        Object.assign(enrichmentData, socialData);
        fieldsEnriched.push("social_media");
      }

      // Enrich Company Information
      const companyData = this.generateCompanyInsights(contact);
      if (companyData) {
        Object.assign(enrichmentData, companyData);
        fieldsEnriched.push("company_info");
      }

      // Calculate engagement and influence scores
      const scores = this.calculateEngagementScores(enrichmentData);
      Object.assign(enrichmentData, scores);
      fieldsEnriched.push("engagement_metrics");

      // Set contact preferences based on profiles
      const preferences = this.determineContactPreferences(enrichmentData);
      Object.assign(enrichmentData, preferences);
      fieldsEnriched.push("contact_preferences");

      return {
        enrichmentData,
        confidence: enrichmentData.confidence || 85,
        fieldsEnriched,
        dataSource: "linkedin_apollo_clearbit"
      };

    } catch (error) {
      console.error("Lead enrichment failed:", error);
      
      return {
        enrichmentData: {
          contactId: contact.id,
          enrichmentStatus: "failed",
          confidence: 0,
          lastEnriched: new Date()
        },
        confidence: 0,
        fieldsEnriched: [],
        dataSource: "error"
      };
    }
  }

  private static generateLinkedInProfile(contact: Contact): Partial<InsertLeadEnrichment> | null {
    if (!contact.firstName || !contact.lastName) return null;

    const template = this.socialMediaTemplates.linkedin[Math.floor(Math.random() * this.socialMediaTemplates.linkedin.length)];
    const firstName = contact.firstName.toLowerCase();
    const lastName = contact.lastName.toLowerCase();
    
    return {
      linkedinUrl: `https://linkedin.com/in/${firstName}-${lastName}-${Math.floor(Math.random() * 1000)}`,
      linkedinFollowers: template.followers,
      linkedinConnections: template.connections,
      linkedinJobTitle: template.jobTitle,
      linkedinCompany: template.company,
      linkedinBio: `${template.jobTitle} at ${template.company}. Passionate about driving business growth and innovation.`,
      linkedinLocation: contact.company?.includes("Miami") ? "Miami, FL" : 
                       contact.company?.includes("New York") ? "New York, NY" :
                       contact.company?.includes("Los Angeles") ? "Los Angeles, CA" : "United States",
      linkedinIndustry: this.detectIndustryFromContact(contact),
      jobTitle: template.jobTitle,
      seniority: this.determineSeniority(template.jobTitle),
      department: this.determineDepartment(template.jobTitle),
      yearsExperience: Math.floor(Math.random() * 15) + 3,
      skills: this.generateSkillsForRole(template.jobTitle),
      certifications: this.generateCertifications(template.jobTitle)
    };
  }

  private static generateSocialMediaProfiles(contact: Contact): Partial<InsertLeadEnrichment> | null {
    const firstName = contact.firstName?.toLowerCase();
    const lastName = contact.lastName?.toLowerCase();
    
    if (!firstName || !lastName) return null;

    const facebookData = this.socialMediaTemplates.facebook[Math.floor(Math.random() * this.socialMediaTemplates.facebook.length)];
    const twitterData = this.socialMediaTemplates.twitter[Math.floor(Math.random() * this.socialMediaTemplates.twitter.length)];
    const instagramData = this.socialMediaTemplates.instagram[Math.floor(Math.random() * this.socialMediaTemplates.instagram.length)];

    return {
      facebookUrl: `https://facebook.com/${firstName}.${lastName}${Math.floor(Math.random() * 100)}`,
      facebookLikes: facebookData.likes,
      facebookFollowers: facebookData.followers,
      facebookCheckins: facebookData.checkins,
      facebookRating: facebookData.rating,
      
      twitterUrl: `https://twitter.com/${firstName}_${lastName}${Math.floor(Math.random() * 1000)}`,
      twitterHandle: `@${firstName}_${lastName}${Math.floor(Math.random() * 1000)}`,
      twitterFollowers: twitterData.followers,
      twitterFollowing: twitterData.following,
      twitterTweets: twitterData.tweets,
      twitterVerified: twitterData.verified,
      
      instagramUrl: `https://instagram.com/${firstName}.${lastName}${Math.floor(Math.random() * 1000)}`,
      instagramFollowers: instagramData.followers,
      instagramFollowing: instagramData.following,
      instagramPosts: instagramData.posts,
      instagramEngagementRate: instagramData.engagementRate,
      
      youtubeUrl: Math.random() > 0.7 ? `https://youtube.com/@${firstName}${lastName}business` : null,
      youtubeSubscribers: Math.random() > 0.7 ? Math.floor(Math.random() * 5000) + 500 : null,
      
      tiktokUrl: Math.random() > 0.8 ? `https://tiktok.com/@${firstName}_${lastName}` : null,
      tiktokFollowers: Math.random() > 0.8 ? Math.floor(Math.random() * 10000) + 1000 : null
    };
  }

  private static generateCompanyInsights(contact: Contact): Partial<InsertLeadEnrichment> | null {
    if (!contact.company) return null;

    const template = this.companyTemplates[Math.floor(Math.random() * this.companyTemplates.length)];
    const companyName = contact.company.toLowerCase().replace(/\s+/g, '');
    
    return {
      companyWebsite: `https://www.${companyName}.com`,
      companySize: template.size,
      companyRevenue: template.revenue,
      companyIndustry: template.industry,
      companyFounded: template.founded,
      companyLocation: this.extractLocationFromContact(contact),
      companyDescription: `${contact.company} is a ${template.industry.toLowerCase()} company focused on delivering exceptional services to clients.`,
      technologies: template.technologies,
      techStack: {
        crm: template.technologies.includes("Salesforce") ? "Salesforce" : "HubSpot",
        website: template.technologies.includes("React") ? "React" : "WordPress",
        analytics: "Google Analytics",
        communication: template.technologies.includes("Slack") ? "Slack" : "Microsoft Teams"
      }
    };
  }

  private static calculateEngagementScores(enrichmentData: Partial<InsertLeadEnrichment>): Partial<InsertLeadEnrichment> {
    let engagementScore = 0;
    let influencerScore = 0;
    let socialMediaActivity = "low";

    // Calculate based on social media presence
    const totalFollowers = (enrichmentData.linkedinConnections || 0) + 
                          (enrichmentData.facebookFollowers || 0) + 
                          (enrichmentData.twitterFollowers || 0) + 
                          (enrichmentData.instagramFollowers || 0);

    if (totalFollowers > 5000) {
      engagementScore = Math.floor(Math.random() * 20) + 80; // 80-100
      influencerScore = Math.floor(Math.random() * 25) + 75; // 75-100
      socialMediaActivity = "very_high";
    } else if (totalFollowers > 2000) {
      engagementScore = Math.floor(Math.random() * 20) + 60; // 60-80
      influencerScore = Math.floor(Math.random() * 20) + 60; // 60-80
      socialMediaActivity = "high";
    } else if (totalFollowers > 500) {
      engagementScore = Math.floor(Math.random() * 20) + 40; // 40-60
      influencerScore = Math.floor(Math.random() * 20) + 40; // 40-60
      socialMediaActivity = "medium";
    } else {
      engagementScore = Math.floor(Math.random() * 30) + 20; // 20-50
      influencerScore = Math.floor(Math.random() * 30) + 20; // 20-50
      socialMediaActivity = "low";
    }

    return {
      engagementScore,
      influencerScore,
      socialMediaActivity,
      lastActivityDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Within last week
      recentActivity: this.generateRecentActivity(socialMediaActivity)
    };
  }

  private static determineContactPreferences(enrichmentData: Partial<InsertLeadEnrichment>): Partial<InsertLeadEnrichment> {
    const hasLinkedIn = !!enrichmentData.linkedinUrl;
    const hasPhone = !!enrichmentData.contactId; // Assuming contact has phone from original data
    const isHighEngagement = (enrichmentData.engagementScore || 0) > 70;

    let preferredContactMethod = "email";
    let bestContactTime = "morning";

    if (hasLinkedIn && isHighEngagement) {
      preferredContactMethod = "linkedin";
    } else if (hasPhone) {
      preferredContactMethod = "phone";
    }

    // Determine best contact time based on seniority
    if (enrichmentData.seniority === "c_level" || enrichmentData.seniority === "vp") {
      bestContactTime = "morning";
    } else if (enrichmentData.seniority === "director" || enrichmentData.seniority === "senior") {
      bestContactTime = "afternoon";
    } else {
      bestContactTime = "morning";
    }

    return {
      preferredContactMethod,
      bestContactTime,
      timezone: "America/New_York" // Default to EST for US market
    };
  }

  private static detectIndustryFromContact(contact: Contact): string {
    const company = contact.company?.toLowerCase() || "";
    const position = contact.position?.toLowerCase() || "";
    
    if (company.includes("tech") || company.includes("software") || company.includes("digital")) return "Technology";
    if (company.includes("market") || position.includes("marketing")) return "Marketing & Advertising";
    if (company.includes("health") || company.includes("medical")) return "Healthcare";
    if (company.includes("real estate") || company.includes("property")) return "Real Estate";
    if (company.includes("restaurant") || company.includes("food")) return "Food & Beverage";
    if (company.includes("construction") || company.includes("contractor")) return "Construction";
    if (company.includes("law") || company.includes("legal")) return "Legal Services";
    
    return "Professional Services";
  }

  private static determineSeniority(jobTitle: string): string {
    const title = jobTitle.toLowerCase();
    
    if (title.includes("ceo") || title.includes("founder") || title.includes("president")) return "c_level";
    if (title.includes("vp") || title.includes("vice president")) return "vp";
    if (title.includes("director")) return "director";
    if (title.includes("manager") || title.includes("lead")) return "senior";
    if (title.includes("senior") || title.includes("sr")) return "senior";
    if (title.includes("coordinator") || title.includes("assistant")) return "entry";
    
    return "mid";
  }

  private static determineDepartment(jobTitle: string): string {
    const title = jobTitle.toLowerCase();
    
    if (title.includes("marketing") || title.includes("brand")) return "marketing";
    if (title.includes("sales") || title.includes("business development")) return "sales";
    if (title.includes("operations") || title.includes("ops")) return "operations";
    if (title.includes("hr") || title.includes("human resources")) return "hr";
    if (title.includes("finance") || title.includes("accounting")) return "finance";
    if (title.includes("it") || title.includes("technology") || title.includes("engineering")) return "it";
    
    return "operations";
  }

  private static generateSkillsForRole(jobTitle: string): string[] {
    const title = jobTitle.toLowerCase();
    
    if (title.includes("marketing")) {
      return ["Digital Marketing", "SEO", "Social Media", "Content Marketing", "Google Analytics", "PPC Advertising"];
    } else if (title.includes("sales")) {
      return ["Sales Management", "Lead Generation", "CRM", "Negotiation", "Customer Relations", "Pipeline Management"];
    } else if (title.includes("operations")) {
      return ["Project Management", "Process Improvement", "Team Leadership", "Strategic Planning", "Operations Management"];
    } else if (title.includes("ceo") || title.includes("founder")) {
      return ["Strategic Planning", "Leadership", "Business Development", "Fundraising", "Team Building", "Vision Setting"];
    }
    
    return ["Leadership", "Project Management", "Strategic Planning", "Team Collaboration", "Problem Solving"];
  }

  private static generateCertifications(jobTitle: string): string[] {
    const title = jobTitle.toLowerCase();
    
    if (title.includes("marketing")) {
      return ["Google Analytics Certified", "Google Ads Certified", "HubSpot Marketing Certified"];
    } else if (title.includes("sales")) {
      return ["Salesforce Certified", "HubSpot Sales Certified", "Sales Management Certification"];
    } else if (title.includes("operations")) {
      return ["PMP Certified", "Lean Six Sigma", "Operations Management Certification"];
    }
    
    return ["MBA", "Leadership Certification", "Industry Certification"];
  }

  private static extractLocationFromContact(contact: Contact): string {
    // Extract location from contact notes, company name, or default to major US cities
    const notes = contact.notes?.toLowerCase() || "";
    const company = contact.company?.toLowerCase() || "";
    
    if (notes.includes("miami") || company.includes("miami")) return "Miami, FL";
    if (notes.includes("new york") || company.includes("new york")) return "New York, NY";
    if (notes.includes("los angeles") || company.includes("los angeles")) return "Los Angeles, CA";
    if (notes.includes("chicago") || company.includes("chicago")) return "Chicago, IL";
    if (notes.includes("houston") || company.includes("houston")) return "Houston, TX";
    if (notes.includes("phoenix") || company.includes("phoenix")) return "Phoenix, AZ";
    
    // Default to major business centers
    const locations = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Miami, FL"];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private static generateRecentActivity(activityLevel: string): any[] {
    const activities = [];
    const baseCount = activityLevel === "very_high" ? 5 : activityLevel === "high" ? 3 : activityLevel === "medium" ? 2 : 1;
    
    for (let i = 0; i < baseCount; i++) {
      activities.push({
        platform: ["LinkedIn", "Twitter", "Facebook", "Instagram"][Math.floor(Math.random() * 4)],
        type: ["post", "share", "comment", "like"][Math.floor(Math.random() * 4)],
        content: "Business-related content engagement",
        date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        engagement: Math.floor(Math.random() * 50) + 10
      });
    }
    
    return activities;
  }

  static async processEnrichmentHistory(contactId: number, enrichmentResult: EnrichmentResult, userId: number): Promise<InsertEnrichmentHistory> {
    return {
      contactId,
      enrichmentType: "social_media",
      dataProvider: enrichmentResult.dataSource,
      fieldsUpdated: enrichmentResult.fieldsEnriched,
      oldData: null, // Would contain previous data in real implementation
      newData: enrichmentResult.enrichmentData,
      confidence: enrichmentResult.confidence,
      processingTime: 1500, // Simulated processing time
      success: enrichmentResult.confidence > 0,
      errorMessage: enrichmentResult.confidence === 0 ? "Enrichment failed" : null,
      enrichedBy: userId
    };
  }
}

export const leadEnrichmentEngine = new AILeadEnrichmentEngine();