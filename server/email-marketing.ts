import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  senderName: string;
  senderEmail: string;
  targetAudience: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  scheduledDate?: Date;
  createdAt: Date;
  createdBy: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  unsubscribeCount: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'follow_up' | 'promotion' | 'newsletter' | 'service_intro' | 'testimonial';
  variables: string[];
  createdAt: Date;
  isActive: boolean;
}

interface MarketingContact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  industry: string;
  location: string;
  leadSource: string;
  tags: string[];
  isSubscribed: boolean;
  lastEmailSent?: Date;
  engagementScore: number;
}

export class EmailMarketingService {
  private emailTransporter: nodemailer.Transporter;
  private campaigns: Map<string, EmailCampaign> = new Map();
  private templates: Map<string, EmailTemplate> = new Map();
  private currentCampaignId = 1;
  private currentTemplateId = 1;

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: 'smtp.ipage.com',
      port: 465,
      secure: true,
      auth: {
        user: 'starz@traffikboosters.com',
        pass: 'Gn954793*'
      }
    });

    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: Omit<EmailTemplate, 'id' | 'createdAt'>[] = [
      {
        name: "Welcome New Lead",
        subject: "Welcome to Traffik Boosters - Let's Boost Your Business!",
        category: "welcome",
        variables: ["firstName", "lastName", "company", "senderName", "senderEmail"],
        isActive: true,
        content: `
Hi {{firstName}},

Welcome to Traffik Boosters! We're excited to help {{company}} achieve remarkable growth.

Our proven strategies have helped hundreds of businesses:
• Increase website traffic by 300-500%
• Generate 10x more qualified leads
• Boost conversion rates by 25-50%
• Maximize ROI on marketing investments

I'd love to schedule a free 30-minute consultation to discuss your specific goals and show you exactly how we can help {{company}} achieve similar results.

Ready to get started? Reply to this email or call me directly at (877) 840-6250.

Best regards,
{{senderName}}
Traffik Boosters
Phone: (877) 840-6250
Email: {{senderEmail}}

"More Traffik! More Sales!"
        `
      },
      {
        name: "Service Introduction - SEO Package",
        subject: "Rank #1 on Google - SEO Package for {{company}}",
        category: "service_intro",
        variables: ["firstName", "lastName", "company", "senderName", "senderEmail"],
        isActive: true,
        content: `
Hi {{firstName}},

Is {{company}} struggling to rank on Google? You're not alone.

95% of businesses never make it to page 1 of Google search results. But what if I told you we could get {{company}} ranking #1 for your most profitable keywords?

Our SEO specialists have a proven track record:
✓ 300+ businesses ranked on page 1
✓ Average 450% increase in organic traffic
✓ ROI of $12 for every $1 invested
✓ Results visible within 90 days

I'd like to offer {{company}} a complimentary SEO audit (valued at $500) to show you exactly what opportunities you're missing.

Would you be available for a 15-minute call this week to discuss your SEO goals?

Best regards,
{{senderName}}
Traffik Boosters
Phone: (877) 840-6250
Email: {{senderEmail}}

"More Traffik! More Sales!"
        `
      },
      {
        name: "Follow-Up After No Response",
        subject: "Re: Growing {{company}} - Quick Question",
        category: "follow_up",
        variables: ["firstName", "lastName", "company", "senderName", "senderEmail"],
        isActive: true,
        content: `
Hi {{firstName}},

I wanted to follow up on my previous email about helping {{company}} increase traffic and sales.

I understand you're busy running {{company}}, so I'll keep this brief.

We're currently working with several businesses in your industry and seeing incredible results:
• One client increased leads by 400% in 6 months
• Another doubled their revenue within a year
• A third reduced their marketing costs by 30% while increasing sales

I believe {{company}} could achieve similar results.

Would a quick 10-minute call work for you this week? I can share exactly how we're helping companies like yours dominate their competition.

Best regards,
{{senderName}}
Traffik Boosters
Phone: (877) 840-6250
Email: {{senderEmail}}

"More Traffik! More Sales!"
        `
      },
      {
        name: "Limited Time Promotion",
        subject: "Last Chance: 50% Off Digital Marketing Package",
        category: "promotion",
        variables: ["firstName", "lastName", "company", "senderName", "senderEmail"],
        isActive: true,
        content: `
Hi {{firstName}},

This email expires at midnight tonight.

I'm offering {{company}} an exclusive 50% discount on our complete digital marketing package - but only for the next 24 hours.

This package normally costs $4,500/month and includes:
✓ Professional website optimization
✓ Google Ads management
✓ Social media marketing
✓ Content creation and blogging
✓ Local SEO optimization
✓ Monthly performance reports

For qualified businesses like {{company}}, I can offer this complete package for just $2,250/month (50% savings).

But this offer expires tonight at midnight.

Ready to dominate your competition? Call me now at (877) 840-6250 or reply to this email.

Best regards,
{{senderName}}
Traffik Boosters
Phone: (877) 840-6250
Email: {{senderEmail}}

"More Traffik! More Sales!"
        `
      },
      {
        name: "Success Story Newsletter",
        subject: "How This Business Increased Sales 400% (Case Study Inside)",
        category: "newsletter",
        variables: ["firstName", "lastName", "company", "senderName", "senderEmail"],
        isActive: true,
        content: `
Hi {{firstName}},

I wanted to share an incredible success story that might inspire you.

Last year, we started working with a business similar to {{company}}. They were struggling with:
• Low website traffic
• Poor lead generation
• High marketing costs with little return

Here's what happened after partnering with us:

MONTH 1-3: Website redesign and SEO optimization
MONTH 4-6: Google Ads campaigns and content marketing
MONTH 7-12: Advanced automation and conversion optimization

THE RESULTS:
✓ 400% increase in qualified leads
✓ 300% boost in website traffic
✓ 250% growth in monthly revenue
✓ 50% reduction in cost per acquisition

The business owner said: "Traffik Boosters transformed our company. We went from struggling to find customers to having more business than we can handle."

Want to see if {{company}} could achieve similar results?

I'm offering a free 30-minute strategy session where I'll show you exactly how we achieved these results and how they could apply to {{company}}.

Book your free session: Reply to this email or call (877) 840-6250.

Best regards,
{{senderName}}
Traffik Boosters
Phone: (877) 840-6250
Email: {{senderEmail}}

"More Traffik! More Sales!"
        `
      },
      {
        name: "Customer Testimonial Showcase",
        subject: "{{company}} Owner: 'Best Investment We Ever Made'",
        category: "testimonial",
        variables: ["firstName", "lastName", "company", "senderName", "senderEmail"],
        isActive: true,
        content: `
Hi {{firstName}},

I love receiving messages like this from our clients:

"Working with Traffik Boosters was the best investment we ever made. In 8 months, our revenue increased by 300%, and we're booked solid for the next 6 months. I wish we had started sooner!"
- Sarah M., Marketing Director

This isn't unusual. Here are more results from recent clients:

"Traffik Boosters helped us dominate our local market. We're now the #1 choice for customers in our area."
- Mike R., Business Owner

"Our phone rings constantly with qualified leads. We've had to hire 3 new employees to keep up with demand."
- Lisa T., Operations Manager

"The ROI is incredible. For every dollar we spend with Traffik Boosters, we make back $15."
- David C., CEO

{{company}} could be our next success story.

Would you like to see how we achieved these results? I'm offering a complimentary business growth audit (normally $750) to show you the exact strategies we use.

Ready to transform {{company}}? Reply to this email or call me at (877) 840-6250.

Best regards,
{{senderName}}
Traffik Boosters
Phone: (877) 840-6250
Email: {{senderEmail}}

"More Traffik! More Sales!"
        `
      }
    ];

    defaultTemplates.forEach(templateData => {
      const template: EmailTemplate = {
        ...templateData,
        id: (this.currentTemplateId++).toString(),
        createdAt: new Date()
      };
      this.templates.set(template.id, template);
    });
  }

  async createCampaign(campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'sentCount' | 'openRate' | 'clickRate' | 'unsubscribeCount'>): Promise<EmailCampaign> {
    const campaign: EmailCampaign = {
      ...campaignData,
      id: (this.currentCampaignId++).toString(),
      createdAt: new Date(),
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      unsubscribeCount: 0
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async sendMassEmail(
    campaignId: string, 
    contacts: MarketingContact[], 
    templateId: string,
    senderInfo: { name: string; email: string; role: string }
  ): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
    const campaign = this.campaigns.get(campaignId);
    const template = this.templates.get(templateId);

    if (!campaign || !template) {
      throw new Error('Campaign or template not found');
    }

    const errors: string[] = [];
    let sentCount = 0;

    // Update campaign status
    campaign.status = 'sending';
    this.campaigns.set(campaignId, campaign);

    for (const contact of contacts) {
      if (!contact.isSubscribed || !contact.email) {
        continue;
      }

      try {
        const personalizedContent = this.personalizeContent(template.content, contact, senderInfo);
        const personalizedSubject = this.personalizeContent(template.subject, contact, senderInfo);

        await this.emailTransporter.sendMail({
          from: `${senderInfo.name} - Traffik Boosters <${senderInfo.email}>`,
          to: contact.email,
          subject: personalizedSubject,
          attachments: [{
            filename: 'traffik-boosters-logo.png',
            path: './attached_assets/TRAFIC BOOSTERS3 copy_1751060321835.png',
            cid: 'traffikLogo'
          }],
          html: this.generateEmailHTML(personalizedContent, senderInfo),
          text: personalizedContent
        });

        sentCount++;
        console.log(`[Email Marketing] Sent to ${contact.email}`);

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`[Email Marketing] Failed to send to ${contact.email}:`, error);
        errors.push(`Failed to send to ${contact.email}: ${error.message}`);
      }
    }

    // Update campaign statistics
    campaign.status = 'completed';
    campaign.sentCount = sentCount;
    this.campaigns.set(campaignId, campaign);

    return { success: sentCount > 0, sentCount, errors };
  }

  private personalizeContent(content: string, contact: MarketingContact, senderInfo: { name: string; email: string; role: string }): string {
    return content
      .replace(/\{\{firstName\}\}/g, contact.firstName || 'there')
      .replace(/\{\{lastName\}\}/g, contact.lastName || '')
      .replace(/\{\{company\}\}/g, contact.company || 'your business')
      .replace(/\{\{senderName\}\}/g, senderInfo.name)
      .replace(/\{\{senderEmail\}\}/g, senderInfo.email);
  }

  private generateEmailHTML(content: string, senderInfo: { name: string; email: string; role: string }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .email-container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, hsl(14, 88%, 55%) 0%, hsl(29, 85%, 58%) 100%); padding: 20px; text-align: center; color: white; border-radius: 12px 12px 0 0; }
          .logo { width: 80px; height: auto; margin: 0 auto 15px; display: block; }
          .content { padding: 30px; background: white; }
          .signature { margin-top: 30px; padding-top: 20px; border-top: 2px solid hsl(14, 88%, 55%); }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 12px 12px; }
          .unsubscribe { font-size: 12px; color: #999; margin-top: 15px; }
          p { margin-bottom: 15px; }
          ul { margin: 15px 0; padding-left: 20px; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="cid:traffikLogo" alt="Traffik Boosters" class="logo" />
            <h1 style="margin: 0; font-size: 24px;">TRAFFIK BOOSTERS</h1>
            <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">More Traffik! More Sales!</p>
          </div>
          
          <div class="content">
            ${content.split('\n').map(line => 
              line.trim() === '' ? '<br>' : 
              line.startsWith('✓') || line.startsWith('•') ? `<ul><li>${line.substring(1).trim()}</li></ul>` :
              `<p>${line}</p>`
            ).join('')}
            
            <div class="signature">
              <p><strong>${senderInfo.name}</strong><br>
              ${senderInfo.role}<br>
              Traffik Boosters<br>
              Phone: (877) 840-6250<br>
              Email: ${senderInfo.email}</p>
              <p style="color: hsl(14, 88%, 55%); font-weight: bold; margin-top: 15px;">More Traffik! More Sales!</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>TRAFFIK BOOSTERS</strong><br>
            Professional Digital Marketing Services<br>
            Phone: (877) 840-6250 | Website: traffikboosters.com</p>
            
            <div class="unsubscribe">
              <p>You're receiving this email because you showed interest in our services.<br>
              <a href="mailto:unsubscribe@traffikboosters.com?subject=Unsubscribe">Click here to unsubscribe</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getCampaigns(): EmailCampaign[] {
    return Array.from(this.campaigns.values());
  }

  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  getCampaign(id: string): EmailCampaign | undefined {
    return this.campaigns.get(id);
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async updateCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return null;

    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
}

export const emailMarketingService = new EmailMarketingService();