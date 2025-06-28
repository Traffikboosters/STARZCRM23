import nodemailer from 'nodemailer';

interface OnboardingPacketData {
  firstName: string;
  lastName: string;
  email: string;
  workEmail: string;
  role: string;
  startDate: string;
  department: string;
  workLocation: 'remote' | 'onsite';
  timeZone?: string;
  homeAddress?: string;
  officeLocation?: string;
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
    const baseDocuments = this.getBaseDocuments(employeeData);
    const locationSpecificDocuments = employeeData.workLocation === 'remote' 
      ? this.getRemoteOnboardingDocuments(employeeData)
      : this.getOnsiteOnboardingDocuments(employeeData);
    
    return [...baseDocuments, ...locationSpecificDocuments];
  }

  private getBaseDocuments(employeeData: OnboardingPacketData): OnboardingDocument[] {
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
Work Location: ${employeeData.workLocation === 'remote' ? 'Remote' : 'On-site'}
${employeeData.timeZone ? `Time Zone: ${employeeData.timeZone}` : ''}
${employeeData.officeLocation ? `Office Location: ${employeeData.officeLocation}` : ''}

What You Can Expect:
• Professional development opportunities
• Competitive compensation with performance bonuses
• Flexible work environment designed for success
• Access to cutting-edge marketing tools and technologies
• Collaborative team culture focused on results

We're excited to see the impact you'll make!

Best regards,
The Traffik Boosters Team
"More Traffik! More Sales!"
        `
      },
      {
        title: "Company Values & Culture",
        type: "guide",
        priority: "high",
        content: `
TRAFFIK BOOSTERS CORE VALUES

1. RESULTS-DRIVEN EXCELLENCE
   We measure success by our clients' growth and our ability to deliver "More Traffik! More Sales!"

2. INTEGRITY IN ALL INTERACTIONS
   Honest communication, transparent processes, and ethical business practices guide everything we do.

3. CONTINUOUS INNOVATION
   We stay ahead of digital marketing trends and constantly improve our strategies and tools.

4. TEAM COLLABORATION
   Whether remote or on-site, we work together to achieve exceptional results for our clients.

5. CLIENT-FIRST MINDSET
   Every decision we make prioritizes our clients' success and long-term growth.

COMPANY CULTURE:
• Fast-paced, results-oriented environment
• Emphasis on data-driven decision making
• Encouragement of creative problem-solving
• Recognition and rewards for high performance
• Professional development and growth opportunities
        `
      },
      {
        title: "Communication Protocols",
        type: "policy",
        priority: "high",
        content: `
TRAFFIK BOOSTERS COMMUNICATION STANDARDS

PROFESSIONAL EMAIL:
• Use your assigned @traffikboosters.com email for all business communications
• Professional subject lines and clear, concise messaging
• Response time expectations: Within 4 hours during business hours

INTERNAL MESSAGING:
• Starz CRM platform for client-related communications
• Immediate response expected for urgent matters
• Use proper channels for different types of communication

CLIENT COMMUNICATIONS:
• Always maintain professional tone and Traffik Boosters branding
• Include "More Traffik! More Sales!" in email signatures
• Document all client interactions in the CRM system

MEETING PROTOCOLS:
• Be punctual and prepared for all scheduled meetings
• Use video when possible to maintain personal connections
• Follow up with action items and next steps
        `
      }
    ];
  }

  private getRemoteOnboardingDocuments(employeeData: OnboardingPacketData): OnboardingDocument[] {
    return [
      {
        title: "Remote Work Setup Guide",
        type: "guide",
        priority: "high",
        content: `
REMOTE WORK SETUP FOR ${employeeData.firstName.toUpperCase()}

ESSENTIAL EQUIPMENT:
✓ Reliable high-speed internet connection (minimum 25 Mbps upload/download)
✓ Professional workspace with good lighting for video calls
✓ Noise-canceling headphones or headset for client calls
✓ Backup internet connection (mobile hotspot recommended)
✓ Professional backdrop or virtual background for video meetings

TECHNICAL REQUIREMENTS:
• Access to Starz CRM platform (login credentials will be provided)
• MightyCall phone system integration
• Traffik Boosters email account: ${employeeData.workEmail}
• Time tracking software for productivity monitoring
• VPN access for secure connections (if handling sensitive data)

WORKSPACE STANDARDS:
• Dedicated work area free from distractions
• Professional appearance for video calls
• Quiet environment during client interactions
• Proper ergonomic setup to prevent fatigue

DAILY ROUTINE EXPECTATIONS:
• ${employeeData.timeZone ? `Work hours aligned with ${employeeData.timeZone}` : 'Standard business hours alignment'}
• Daily check-ins with team lead
• Active participation in team video meetings
• Regular availability during core collaboration hours (10 AM - 3 PM EST)

SECURITY PROTOCOLS:
• Strong passwords for all company accounts
• Two-factor authentication enabled
• Secure storage of client information
• Regular software updates and security patches
        `
      },
      {
        title: "Remote Communication Best Practices",
        type: "policy",
        priority: "high",
        content: `
REMOTE TEAM COMMUNICATION GUIDELINES

DAILY ENGAGEMENT:
• Morning check-in with status update by 9:30 AM
• Active participation in team chat throughout the day
• End-of-day summary with completed tasks and next-day priorities
• Immediate notification of any blockers or issues

VIDEO MEETING ETIQUETTE:
• Professional attire (at least business casual from waist up)
• Well-lit environment with minimal background distractions
• Mute when not speaking, unmute to contribute
• Camera on for all team meetings and client calls

AVAILABILITY INDICATORS:
• Update status regularly in communication platforms
• Clear "away" messages when stepping away from desk
• Emergency contact method for urgent matters
• Respect for team members' time zones and schedules

COLLABORATION TOOLS:
• Starz CRM for all client-related activities
• Company email for formal communications
• Instant messaging for quick questions and updates
• Video calls for complex discussions and client meetings

PERFORMANCE TRACKING:
• Sales activities logged in real-time
• Lead interactions documented immediately
• Weekly performance reviews with team lead
• Monthly goal-setting and progress evaluation
        `
      },
      {
        title: "Remote Employee Benefits & Support",
        type: "guide",
        priority: "medium",
        content: `
REMOTE EMPLOYEE SUPPORT SYSTEM

HOME OFFICE STIPEND:
• $500 initial setup allowance for essential equipment
• Monthly internet reimbursement up to $75
• Annual equipment upgrade budget of $300

PROFESSIONAL DEVELOPMENT:
• Access to online training platforms
• Virtual attendance at industry conferences
• Mentorship program with senior team members
• Skills development courses covered by company

WELLNESS SUPPORT:
• Flexible work schedule within core hours
• Mental health resources and counseling support
• Encouragement of regular breaks and time off
• Virtual team building activities and social events

CAREER ADVANCEMENT:
• Equal promotion opportunities regardless of location
• Regular performance feedback and coaching
• Leadership development programs
• Cross-department collaboration opportunities

TECHNOLOGY SUPPORT:
• 24/7 IT helpdesk for technical issues
• Regular software training and updates
• Cloud-based access to all necessary tools
• Backup equipment available if needed
        `
      }
    ];
  }

  private getOnsiteOnboardingDocuments(employeeData: OnboardingPacketData): OnboardingDocument[] {
    return [
      {
        title: "Office Orientation Guide",
        type: "guide",
        priority: "high",
        content: `
ON-SITE ORIENTATION FOR ${employeeData.firstName.toUpperCase()}

OFFICE LOCATION:
${employeeData.officeLocation || 'Traffik Boosters Headquarters'}

FIRST DAY SCHEDULE:
9:00 AM - Welcome & Badge/Key Distribution
9:30 AM - Office Tour & Facility Overview
10:00 AM - HR Paperwork & Benefits Enrollment
11:00 AM - IT Setup & Account Creation
12:00 PM - Team Lunch & Introductions
1:30 PM - Department Orientation
2:30 PM - Starz CRM Training Session
3:30 PM - Shadowing with Team Lead
4:30 PM - Q&A Session & Next Steps

OFFICE AMENITIES:
• Modern workstations with dual monitors
• High-speed fiber internet and WiFi
• Conference rooms with video conferencing capabilities
• Break room with complimentary coffee and snacks
• Quiet zones for focused work
• Collaborative spaces for team meetings

PARKING & ACCESS:
• Employee parking spaces available
• Badge access required for building entry
• Office hours: Monday-Friday, 8:00 AM - 6:00 PM
• After-hours access available with manager approval

DRESS CODE:
• Business casual standard
• Professional attire for client meetings
• Traffik Boosters branded apparel encouraged
• Comfortable shoes recommended (lots of collaboration!)
        `
      },
      {
        title: "Office Policies & Procedures",
        type: "policy",
        priority: "high",
        content: `
ON-SITE WORKPLACE POLICIES

ATTENDANCE & PUNCTUALITY:
• Core hours: 9:00 AM - 5:00 PM, Monday through Friday
• Flexible start time between 8:00 AM - 9:30 AM
• 1-hour lunch break (flexible timing)
• Regular attendance tracking via badge system

WORKSPACE GUIDELINES:
• Maintain clean and organized desk area
• Respect shared spaces and equipment
• No personal items on common area surfaces
• Security-conscious behavior (locking computer, securing documents)

MEETING ROOM ETIQUETTE:
• Reserve conference rooms in advance through calendar system
• Clean up after meetings (whiteboard, trash, equipment)
• Start and end meetings on time
• Limit personal calls in open office areas

VISITOR POLICY:
• All visitors must be registered and escorted
• Client meetings in designated conference rooms
• Personal visitors limited to lobby area
• Security protocols must be followed at all times

EMERGENCY PROCEDURES:
• Emergency exits and assembly points clearly marked
• Fire drill procedures posted in each work area
• First aid stations located on each floor
• Emergency contact information displayed prominently

TECHNOLOGY USE:
• Company equipment for business use only
• Regular data backups required
• Software installation requires IT approval
• Personal device connectivity through guest network only
        `
      },
      {
        title: "On-Site Employee Benefits & Facilities",
        type: "guide",
        priority: "medium",
        content: `
ON-SITE EMPLOYEE BENEFITS

OFFICE PERKS:
• Complimentary coffee, tea, and healthy snacks
• Catered lunch on Fridays
• Modern, ergonomic workstations
• Standing desk options available
• High-quality office supplies provided

WELLNESS FACILITIES:
• Quiet meditation/break room
• Adjustable lighting and temperature controls
• Air purification systems
• Ergonomic assessments available
• On-site first aid and emergency supplies

PROFESSIONAL DEVELOPMENT:
• Regular lunch-and-learn sessions
• Industry expert guest speakers
• Access to company library and resources
• Conference room bookings for training
• Mentorship program with senior staff

SOCIAL ACTIVITIES:
• Monthly team building events
• Holiday celebrations and company parties
• Employee recognition programs
• Volunteer opportunities and community involvement
• Sports leagues and recreational activities

CONVENIENCE SERVICES:
• Mail and package receiving
• Dry cleaning pickup/delivery service
• Mobile device charging stations
• Secure bicycle storage
• Public transportation access information

COLLABORATION SPACES:
• Open collaboration areas with whiteboards
• Informal meeting spaces throughout office
• Video conferencing capabilities in all meeting rooms
• Phone booths for private calls
• Project rooms for extended team work
        `
      }
    ];
  }

  async sendOnboardingPacket(employeeData: OnboardingPacketData): Promise<boolean> {
    try {
      const onboardingDocuments = this.generateOnboardingPacket(employeeData);
      
      // Generate email content with all documents
      let emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, hsl(14, 88%, 55%) 0%, hsl(29, 85%, 58%) 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Traffik Boosters!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">"More Traffik! More Sales!"</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Employee Onboarding Packet</h2>
            <p style="color: #666; font-size: 16px;">Welcome ${employeeData.firstName}! Your ${employeeData.workLocation === 'remote' ? 'remote' : 'on-site'} onboarding materials are ready.</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
              <p style="margin: 0; color: #333;"><strong>Work Email:</strong> ${employeeData.workEmail}</p>
              <p style="margin: 5px 0 0 0; color: #333;"><strong>Department:</strong> ${employeeData.department}</p>
              <p style="margin: 5px 0 0 0; color: #333;"><strong>Start Date:</strong> ${employeeData.startDate}</p>
            </div>
      `;

      onboardingDocuments.forEach((doc, index) => {
        emailContent += `
          <div style="margin: 25px 0; padding: 20px; background: #f8f9fa; border-left: 4px solid hsl(14, 88%, 55%); border-radius: 5px;">
            <h3 style="color: hsl(14, 88%, 55%); margin: 0 0 15px 0; font-size: 18px;">${doc.title}</h3>
            <div style="color: #333; line-height: 1.6; white-space: pre-line;">${doc.content}</div>
          </div>
        `;
      });

      emailContent += `
            <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; text-align: center;">
              <h4 style="color: #333; margin: 0 0 10px 0;">Key Contact Information</h4>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Main Phone: (877) 840-6250</p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">HR Support: hr@traffikboosters.com</p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Direct Manager: Michael Thompson (michael.thompson@traffikboosters.com)</p>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 12px;">Office Hours: Monday-Friday, 9:00 AM - 6:00 PM EST</p>
            </div>
          </div>
        </div>
      `;

      const mailOptions = {
        from: 'Traffik Boosters HR <starz@traffikboosters.com>',
        to: employeeData.email,
        subject: `Welcome to Traffik Boosters - ${employeeData.workLocation === 'remote' ? 'Remote' : 'On-Site'} Onboarding Packet`,
        html: emailContent,
        attachments: [
          {
            filename: 'traffik-boosters-logo.png',
            path: './attached_assets/TRAFIC BOOSTERS3 copy_1751060321835.png',
            cid: 'company-logo'
          }
        ]
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`[Onboarding] Successfully sent ${employeeData.workLocation} onboarding packet to ${employeeData.firstName} ${employeeData.lastName}`);
      return true;
    } catch (error) {
      console.error('[Onboarding] Error sending packet:', error);
      return false;
    }
  }
}

export const onboardingService = new EmployeeOnboardingService();