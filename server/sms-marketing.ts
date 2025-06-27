import type { Contact } from "@shared/schema";

interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  senderName: string;
  targetAudience: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  scheduledDate?: Date;
  createdAt: Date;
  createdBy: number;
  sentCount: number;
  deliveryRate: number;
  responseRate: number;
  optOutCount: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  category: 'welcome' | 'follow_up' | 'promotion' | 'reminder' | 'appointment' | 'urgent';
  variables: string[];
  createdAt: Date;
  isActive: boolean;
}

interface SMSContact {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  industry: string;
  location: string;
  leadSource: string;
  tags: string[];
  isSubscribed: boolean;
  lastSMSSent?: Date;
  engagementScore: number;
}

export class SMSMarketingService {
  private campaigns: Map<string, SMSCampaign> = new Map();
  private templates: Map<string, SMSTemplate> = new Map();
  private currentCampaignId = 1;
  private currentTemplateId = 1;

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: Omit<SMSTemplate, 'id' | 'createdAt'>[] = [
      {
        name: "Welcome Message",
        message: "Hi {{firstName}}! Thanks for your interest in {{companyName}}. Our team will call you within 24 hours to discuss how we can boost your online presence. Reply STOP to opt out.",
        category: 'welcome',
        variables: ['firstName', 'companyName'],
        isActive: true
      },
      {
        name: "Follow-up Message",
        message: "Hi {{firstName}}, this is {{senderName}} from Traffik Boosters. We tried calling but couldn't reach you. When's a good time to discuss your digital marketing needs? Text back your preferred time.",
        category: 'follow_up',
        variables: ['firstName', 'senderName'],
        isActive: true
      },
      {
        name: "Appointment Reminder",
        message: "Hi {{firstName}}, reminder: Your consultation with {{senderName}} is tomorrow at {{appointmentTime}}. Reply YES to confirm or call (877) 840-6250 to reschedule.",
        category: 'appointment',
        variables: ['firstName', 'senderName', 'appointmentTime'],
        isActive: true
      },
      {
        name: "Special Promotion",
        message: "🚀 LIMITED TIME: Get 50% off your first month of SEO services! Perfect for {{industry}} businesses like {{companyName}}. Call (877) 840-6250 now. Expires in 48hrs!",
        category: 'promotion',
        variables: ['industry', 'companyName'],
        isActive: true
      },
      {
        name: "Urgent Follow-up",
        message: "{{firstName}}, your competitor just launched a new website! Don't fall behind. Call {{senderName}} at (877) 840-6250 TODAY to discuss your digital strategy. Time-sensitive!",
        category: 'urgent',
        variables: ['firstName', 'senderName'],
        isActive: true
      },
      {
        name: "Service Reminder",
        message: "Hi {{firstName}}, it's been 30 days since we optimized your online presence. Ready for the next phase? {{senderName}} has new strategies for {{industry}} businesses. Call us!",
        category: 'reminder',
        variables: ['firstName', 'senderName', 'industry'],
        isActive: true
      }
    ];

    defaultTemplates.forEach(template => {
      const smsTemplate: SMSTemplate = {
        ...template,
        id: `template_${this.currentTemplateId++}`,
        createdAt: new Date()
      };
      this.templates.set(smsTemplate.id, smsTemplate);
    });
  }

  async createCampaign(campaignData: Omit<SMSCampaign, 'id' | 'createdAt' | 'sentCount' | 'deliveryRate' | 'responseRate' | 'optOutCount'>): Promise<SMSCampaign> {
    const campaign: SMSCampaign = {
      ...campaignData,
      id: `campaign_${this.currentCampaignId++}`,
      createdAt: new Date(),
      sentCount: 0,
      deliveryRate: 0,
      responseRate: 0,
      optOutCount: 0
    };

    this.campaigns.set(campaign.id, campaign);
    console.log(`[SMS Marketing] Created campaign: ${campaign.name}`);
    
    return campaign;
  }

  async sendMassSMS(
    contacts: SMSContact[],
    template: SMSTemplate,
    senderInfo: { name: string; phone: string; role: string }
  ): Promise<{ sent: number; failed: number; optedOut: number }> {
    let sent = 0;
    let failed = 0;
    let optedOut = 0;

    console.log(`[SMS Marketing] Starting mass SMS to ${contacts.length} contacts`);

    for (const contact of contacts) {
      if (!contact.isSubscribed) {
        optedOut++;
        continue;
      }

      try {
        const personalizedMessage = this.personalizeMessage(template.message, contact, senderInfo);
        
        // Simulate SMS sending (in production, integrate with Twilio, etc.)
        const success = await this.sendSMS(contact.phone, personalizedMessage, senderInfo.phone);
        
        if (success) {
          sent++;
          console.log(`[SMS Marketing] Sent to ${contact.firstName} ${contact.lastName} (${contact.phone})`);
        } else {
          failed++;
        }

        // Rate limiting - wait 100ms between messages
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`[SMS Marketing] Failed to send to ${contact.phone}:`, error);
        failed++;
      }
    }

    console.log(`[SMS Marketing] Mass SMS complete. Sent: ${sent}, Failed: ${failed}, Opted Out: ${optedOut}`);
    
    return { sent, failed, optedOut };
  }

  private personalizeMessage(message: string, contact: SMSContact, senderInfo: { name: string; phone: string; role: string }): string {
    return message
      .replace(/\{\{firstName\}\}/g, contact.firstName)
      .replace(/\{\{lastName\}\}/g, contact.lastName)
      .replace(/\{\{companyName\}\}/g, contact.company || `${contact.firstName}'s Business`)
      .replace(/\{\{industry\}\}/g, contact.industry || 'your industry')
      .replace(/\{\{location\}\}/g, contact.location || 'your area')
      .replace(/\{\{senderName\}\}/g, senderInfo.name)
      .replace(/\{\{senderPhone\}\}/g, senderInfo.phone)
      .replace(/\{\{appointmentTime\}\}/g, 'your scheduled time'); // This would come from actual appointment data
  }

  private async sendSMS(toPhone: string, message: string, fromPhone: string): Promise<boolean> {
    // In production, integrate with SMS service (Twilio, etc.)
    // For now, simulate SMS sending
    console.log(`[SMS] To: ${toPhone}, From: ${fromPhone}`);
    console.log(`[SMS] Message: ${message}`);
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  getCampaigns(): SMSCampaign[] {
    return Array.from(this.campaigns.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getTemplates(): SMSTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  getCampaign(id: string): SMSCampaign | undefined {
    return this.campaigns.get(id);
  }

  getTemplate(id: string): SMSTemplate | undefined {
    return this.templates.get(id);
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async updateCampaign(id: string, updates: Partial<SMSCampaign>): Promise<SMSCampaign | null> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return null;

    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
}

export const smsMarketingService = new SMSMarketingService();