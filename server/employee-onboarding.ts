import nodemailer from 'nodemailer';

interface OnboardingPacketData {
  firstName: string;
  lastName: string;
  email: string;
  workEmail: string;
  role: string;
  startDate: string;
  department: string;
}

interface OnboardingDocument {
  title: string;
  content: string;
  type: 'policy' | 'guide' | 'form' | 'reference';
  priority: 'high' | 'medium' | 'low';
}

export class EmployeeOnboardingService {
  private emailTransporter: nodemailer.Transporter;

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
  }

  generateOnboardingPacket(employeeData: OnboardingPacketData): OnboardingDocument[] {
    return [
      {
        title: "Welcome to Traffik Boosters",
        type: "guide",
        priority: "high",
        content: `
Dear ${employeeData.firstName},

Welcome to the Traffik Boosters family! We're thrilled to have you join our dynamic team as a ${employeeData.role.replace('_', ' ')}.

At Traffik Boosters, our mission is simple: "More Traffik! More Sales!" We help businesses grow through innovative digital marketing solutions, and you're now part of that success story.

Your Start Date: ${employeeData.startDate}
Your Work Email: ${employeeData.workEmail}
Department: ${employeeData.department}

Key First-Day Information:
• Office Hours: Monday-Friday, 9:00 AM - 6:00 PM EST
• Main Phone: (877) 840-6250
• Support Email: support@traffikboosters.com
• Your Direct Manager: Michael Thompson (michael.thompson@traffikboosters.com)

We look forward to seeing you succeed and grow with our team!

Best regards,
Traffik Boosters HR Team
        `.trim()
      },
      {
        title: "Company Policies & Procedures",
        type: "policy",
        priority: "high",
        content: `
TRAFFIK BOOSTERS EMPLOYEE HANDBOOK

1. CODE OF CONDUCT
   • Maintain professionalism in all client interactions
   • Represent Traffik Boosters brand values at all times
   • Respect confidentiality of client information
   • Follow "More Traffik! More Sales!" mission in all activities

2. WORK SCHEDULE & ATTENDANCE
   • Standard Hours: 9:00 AM - 6:00 PM EST, Monday-Friday
   • Remote Work: Available with manager approval
   • Time Off: Submit requests 2 weeks in advance
   • Sick Leave: Notify manager immediately

3. COMMUNICATION GUIDELINES
   • Use @traffikboosters.com email for all business communication
   • Response Time: Within 2 hours during business hours
   • Client Communication: Professional, solution-focused approach
   • Internal Communication: Slack, email, and team meetings

4. PERFORMANCE EXPECTATIONS
   • Meet weekly sales/project targets
   • Maintain 90%+ client satisfaction ratings
   • Complete training modules within 30 days
   • Participate in team meetings and professional development

5. TECHNOLOGY & SECURITY
   • Use provided Starz CRM platform for all client management
   • Protect login credentials and client data
   • Follow IT security protocols
   • Report security incidents immediately

6. DRESS CODE
   • Business casual for office days
   • Professional attire for client meetings
   • Company branded items encouraged

7. COMPENSATION & BENEFITS
   • Salary/Commission structure outlined in employment agreement
   • Performance bonuses based on quarterly reviews
   • Professional development opportunities
   • Team building events and company culture activities
        `.trim()
      },
      {
        title: "Starz CRM Platform Guide",
        type: "guide",
        priority: "high",
        content: `
STARZ CRM PLATFORM - EMPLOYEE GUIDE

ACCESS INFORMATION:
• Platform URL: [Your Replit App URL]/login
• Your Username: ${employeeData.workEmail}
• Password: Set during account activation

MAIN FEATURES:

1. CRM - Contact Management
   • View and manage all leads and clients
   • Update contact information and notes
   • Track communication history
   • Assign leads and manage pipeline

2. Phone System Integration
   • Click-to-call functionality with MightyCall
   • Call logging and history tracking
   • Dial tracking and performance metrics

3. Calendar & Scheduling
   • Schedule client appointments
   • Manage your daily/weekly calendar
   • Set reminders for follow-ups

4. Email Integration
   • Send professional email templates
   • Track email responses and engagement
   • Auto-reply functionality for leads

5. Analytics & Reporting
   • View your performance metrics
   • Track sales pipeline progress
   • Monitor lead conversion rates

6. Work Orders & Documentation
   • Create and send professional work orders
   • Generate client agreements
   • Manage project documentation

7. Chat Widget Management
   • Monitor website visitor interactions
   • Respond to live chat inquiries
   • Track lead capture from website

GETTING STARTED:
1. Complete account activation using invitation link
2. Set up your profile and preferences
3. Review assigned leads in CRM
4. Schedule your first client calls
5. Complete platform training modules

SUPPORT:
• Platform Issues: Contact IT support at support@traffikboosters.com
• Training Questions: Ask your manager during onboarding
• Technical Help: Use in-platform help documentation
        `.trim()
      },
      {
        title: "Sales Process & Procedures",
        type: "guide",
        priority: "high",
        content: `
TRAFFIK BOOSTERS SALES PROCESS

LEAD MANAGEMENT:
1. Lead Assignment
   • New leads automatically assigned via CRM
   • Review lead details and source information
   • Prioritize based on urgency and potential value

2. Initial Contact (Within 24 Hours)
   • Call leads using click-to-call functionality
   • Use AI-generated conversation starters
   • Follow up with professional email template

3. Qualification Process
   • Assess business needs and pain points
   • Determine budget and decision-making authority
   • Establish timeline for implementation
   • Use BANT criteria (Budget, Authority, Need, Timeline)

4. Service Presentation
   • Present relevant service packages:
     * SEO & Digital Marketing ($500-$2,500/month)
     * Website Development ($1,500-$8,500)
     * PPC Advertising ($800-$3,000/month)
     * Content & Branding ($275-$1,200/month)

5. Proposal & Closing
   • Create custom work orders using CRM templates
   • Include clear timelines and deliverables
   • Present 3-day full refund / 50% refund policy
   • Secure client signature and payment

6. Follow-Up & Retention
   • Schedule regular check-ins
   • Monitor project progress
   • Identify upselling opportunities
   • Maintain long-term client relationships

PERFORMANCE METRICS:
• Contact Rate: 60%+ of assigned leads
• Appointment Setting: 25%+ conversion
• Closing Ratio: 15%+ of qualified leads
• Client Satisfaction: 90%+ rating

COMMISSION STRUCTURE:
• Base Commission: 10% of sale value
• Residual Earnings: $500 per closed deal
• Bonus Tiers: Bronze (15%), Silver (20%), Gold (25%), Platinum (30%)
• Monthly Performance Reviews

TOOLS & RESOURCES:
• Starz CRM Platform for all activities
• MightyCall phone system integration
• Email templates and quick replies
• AI conversation starters and objection handling
• Competitive pricing analysis tools
        `.trim()
      },
      {
        title: "Company Culture & Values",
        type: "reference",
        priority: "medium",
        content: `
TRAFFIK BOOSTERS CULTURE GUIDE

OUR MISSION: "More Traffik! More Sales!"

CORE VALUES:
1. Customer Success First
   • Every decision prioritizes client results
   • Deliver measurable ROI for every client
   • Build lasting business relationships

2. Innovation & Excellence
   • Continuously improve service offerings
   • Stay ahead of digital marketing trends
   • Exceed client expectations consistently

3. Teamwork & Collaboration
   • Support colleagues' success
   • Share knowledge and best practices
   • Celebrate team achievements

4. Integrity & Transparency
   • Honest communication with clients and team
   • Ethical business practices always
   • Admit mistakes and learn from them

5. Growth Mindset
   • Embrace learning opportunities
   • Adapt to industry changes
   • Personal and professional development

TEAM STRUCTURE:
• Leadership: Michael Thompson (Admin/Manager)
• Sales Team: Commission-based representatives
• HR Department: Salary-based support staff
• Technical Support: Platform and IT assistance

COMMUNICATION CHANNELS:
• Daily Standups: 9:15 AM EST
• Weekly Team Meetings: Fridays 4:00 PM EST
• Monthly All-Hands: First Monday of each month
• Quarterly Reviews: Individual performance discussions

RECOGNITION PROGRAMS:
• Sales Leaderboard: Monthly top performers
• Achievement Badges: Milestone recognition
• Performance Bonuses: Quarterly awards
• Annual Company Awards: Outstanding contributions

PROFESSIONAL DEVELOPMENT:
• Industry certification reimbursement
• Conference and training attendance
• Mentorship programs
• Career advancement pathways

WORK-LIFE BALANCE:
• Flexible work arrangements when possible
• Paid time off and sick leave
• Mental health support resources
• Team building activities and events
        `.trim()
      },
      {
        title: "Emergency Contacts & Resources",
        type: "reference",
        priority: "medium",
        content: `
EMERGENCY CONTACTS & IMPORTANT RESOURCES

IMMEDIATE CONTACTS:
• Manager: Michael Thompson
  - Email: michael.thompson@traffikboosters.com
  - Phone: (877) 840-6250 ext. 101
  - Emergency: Available 24/7 for urgent issues

• HR Department:
  - Email: hr@traffikboosters.com
  - Phone: (877) 840-6250 ext. 102
  - Hours: Monday-Friday, 9:00 AM - 5:00 PM EST

• IT Support:
  - Email: support@traffikboosters.com
  - Phone: (877) 840-6250 ext. 103
  - Platform Issues: Submit ticket through Starz CRM

• Company Main Line: (877) 840-6250
• After-Hours Emergency: Press 0 for operator

PLATFORM ACCESS:
• Starz CRM: [Your platform URL]
• Email Server: webmail.traffikboosters.com
• Phone System: MightyCall integration via CRM
• File Sharing: Secure document portal in Starz

TRAINING RESOURCES:
• Employee Portal: Access through Starz CRM
• Video Training Library: Platform tutorials
• Sales Playbooks: Best practices and scripts
• Product Documentation: Service descriptions and pricing

CLIENT ESCALATION:
• Level 1: Direct supervisor
• Level 2: Department manager
• Level 3: Company leadership
• Always CC: support@traffikboosters.com

COMPLIANCE & LEGAL:
• Data Protection: GDPR and privacy compliance
• Client Contracts: Legal review required for modifications
• Dispute Resolution: HR and legal team involvement
• Regulatory Questions: Consult compliance officer

SOCIAL MEDIA & MARKETING:
• Facebook: https://www.facebook.com/profile.php?id=61558218231561
• TikTok: @traffikboosters
• YouTube: @TraffikBoosters
• Instagram: @traffikboosters
• Twitter/X: @Traffikboosters
• LinkedIn: traffik-boosters

OFFICE INFORMATION:
• Business Hours: Monday-Friday, 9:00 AM - 6:00 PM EST
• Time Zone: Eastern Standard Time (EST)
• Lunch Break: 12:00 PM - 1:00 PM
• Holiday Schedule: Standard US business holidays
        `.trim()
      }
    ];
  }

  async sendOnboardingPacket(employeeData: OnboardingPacketData): Promise<boolean> {
    try {
      const onboardingDocs = this.generateOnboardingPacket(employeeData);
      
      // Create comprehensive HTML email with all onboarding documents
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, hsl(14, 88%, 55%), hsl(29, 85%, 58%)); color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
            .logo { width: 120px; height: auto; margin: 0 auto 15px; display: block; }
            .section { background: #f8f9fa; padding: 25px; margin: 20px 0; border-radius: 8px; border-left: 4px solid hsl(14, 88%, 55%); }
            .priority-high { border-left-color: #dc3545; }
            .priority-medium { border-left-color: #ffc107; }
            .priority-low { border-left-color: #28a745; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 40px; padding: 20px; border-top: 2px solid hsl(14, 88%, 55%); }
            h1 { margin: 0; font-size: 28px; }
            h2 { color: hsl(14, 88%, 55%); border-bottom: 2px solid hsl(14, 88%, 55%); padding-bottom: 10px; }
            h3 { color: hsl(29, 85%, 58%); }
            .welcome-message { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="cid:traffikLogo" alt="Traffik Boosters" class="logo" />
            <h1>Welcome to Traffik Boosters!</h1>
            <p style="font-size: 18px; margin: 10px 0;">Employee Onboarding Packet</p>
            <p style="color: hsl(14, 88%, 55%); font-weight: 600; font-size: 20px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; display: inline-block;">More Traffik! More Sales!</p>
          </div>

          <div class="welcome-message">
            <h2>🎉 Welcome ${employeeData.firstName} ${employeeData.lastName}!</h2>
            <p>We're excited to have you join our growing team. This comprehensive onboarding packet contains everything you need to get started at Traffik Boosters.</p>
            <p><strong>Your Role:</strong> ${employeeData.role.replace('_', ' ')}</p>
            <p><strong>Work Email:</strong> ${employeeData.workEmail}</p>
            <p><strong>Start Date:</strong> ${employeeData.startDate}</p>
          </div>

          ${onboardingDocs.map(doc => `
            <div class="section priority-${doc.priority}">
              <h2>${doc.title}</h2>
              <div class="content">
                <pre>${doc.content}</pre>
              </div>
            </div>
          `).join('')}

          <div class="footer">
            <h3>Need Help?</h3>
            <p><strong>Traffik Boosters Support Team</strong><br>
            Phone: (877) 840-6250<br>
            Email: support@traffikboosters.com<br>
            HR: hr@traffikboosters.com</p>
            <p style="margin-top: 20px;">
              <strong>Follow Us:</strong><br>
              Facebook | TikTok | YouTube | Instagram | Twitter | LinkedIn
            </p>
            <p style="font-style: italic; color: hsl(14, 88%, 55%); font-weight: bold;">"More Traffik! More Sales!"</p>
          </div>
        </body>
        </html>
      `;

      // Send the onboarding email
      const emailResult = await this.emailTransporter.sendMail({
        from: 'Traffik Boosters HR <hr@traffikboosters.com>',
        to: employeeData.email,
        subject: `Welcome to Traffik Boosters - Employee Onboarding Packet`,
        html: htmlContent,
        attachments: [{
          filename: 'traffik-boosters-logo.png',
          path: './attached_assets/TRAFIC BOOSTERS3 copy_1751060321835.png',
          cid: 'traffikLogo'
        }]
      });

      console.log(`[Onboarding] Successfully sent packet to: ${employeeData.email}`);
      console.log(`[Onboarding] Message ID: ${emailResult.messageId}`);
      
      return true;
    } catch (error) {
      console.error('[Onboarding] Error sending packet:', error);
      return false;
    }
  }

  generateQuickReferenceCard(employeeData: OnboardingPacketData): string {
    return `
TRAFFIK BOOSTERS - QUICK REFERENCE CARD
${employeeData.firstName} ${employeeData.lastName}

CONTACT INFO:
• Work Email: ${employeeData.workEmail}
• Main Phone: (877) 840-6250
• Manager: Michael Thompson (ext. 101)
• HR: hr@traffikboosters.com (ext. 102)
• IT Support: support@traffikboosters.com (ext. 103)

PLATFORM ACCESS:
• Starz CRM: [Platform URL]/login
• Email: webmail.traffikboosters.com
• Phone: MightyCall integration via CRM

DAILY SCHEDULE:
• Hours: 9:00 AM - 6:00 PM EST
• Daily Standup: 9:15 AM
• Lunch: 12:00 PM - 1:00 PM
• Team Meeting: Fridays 4:00 PM

KEY METRICS:
• Contact Rate: 60%+
• Appointment Setting: 25%+
• Closing Ratio: 15%+
• Client Satisfaction: 90%+

EMERGENCY: (877) 840-6250, Press 0

"More Traffik! More Sales!"
    `.trim();
  }
}

export const onboardingService = new EmployeeOnboardingService();