import twilio from 'twilio';

interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
  templateName?: string;
  templateVariables?: string[];
}

interface WhatsAppWebhookData {
  From: string;
  To: string;
  Body: string;
  MediaUrl0?: string;
  MessageSid: string;
  AccountSid: string;
  ProfileName?: string;
}

export class WhatsAppService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('WhatsApp API credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
    }

    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const formattedTo = message.to.startsWith('whatsapp:') ? message.to : `whatsapp:${message.to}`;
      
      const messageOptions: any = {
        from: this.fromNumber,
        to: formattedTo,
        body: message.body
      };

      if (message.mediaUrl) {
        messageOptions.mediaUrl = [message.mediaUrl];
      }

      const result = await this.client.messages.create(messageOptions);
      console.log(`WhatsApp message sent successfully: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  async sendTemplateMessage(to: string, templateName: string, variables: string[] = []): Promise<boolean> {
    try {
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: formattedTo,
        contentSid: templateName,
        contentVariables: JSON.stringify(variables)
      });

      console.log(`WhatsApp template message sent: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp template message:', error);
      return false;
    }
  }

  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Add country code if missing (default to US +1)
    if (cleanPhone.length === 10) {
      return `+1${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith('1') && cleanPhone.length > 11) {
      return `+${cleanPhone}`;
    }
    
    return `+${cleanPhone}`;
  }

  parseWebhookMessage(body: WhatsAppWebhookData) {
    return {
      from: body.From.replace('whatsapp:', ''),
      to: body.To.replace('whatsapp:', ''),
      message: body.Body,
      mediaUrl: body.MediaUrl0,
      messageSid: body.MessageSid,
      profileName: body.ProfileName || 'Unknown',
      timestamp: new Date()
    };
  }

  // Pre-built message templates for common business scenarios
  getBusinessTemplates() {
    return {
      welcome: (customerName: string) => 
        `Hi ${customerName}! 👋 Welcome to Traffik Boosters! We're excited to help you grow your business with more traffic and more sales. How can we assist you today?`,
      
      followUp: (customerName: string, serviceName: string) => 
        `Hi ${customerName}, this is a quick follow-up regarding your ${serviceName} inquiry. Our team is ready to discuss your digital marketing needs. When would be a good time for a brief consultation?`,
      
      appointmentConfirmation: (customerName: string, date: string, time: string) => 
        `Hi ${customerName}, this confirms your consultation appointment on ${date} at ${time}. We'll discuss how to boost your business traffic and sales. Looking forward to speaking with you!`,
      
      proposalReady: (customerName: string) => 
        `Great news ${customerName}! Your custom digital marketing proposal is ready. We've identified key opportunities to increase your traffic and sales. Can we schedule a call to review the details?`,
      
      serviceUpdate: (customerName: string, serviceName: string, progress: string) => 
        `Hi ${customerName}, quick update on your ${serviceName} project: ${progress}. Your traffic growth is on track! Any questions? We're here to help.`,
      
      paymentReminder: (customerName: string, amount: string, dueDate: string) => 
        `Hi ${customerName}, friendly reminder that your payment of ${amount} is due on ${dueDate}. You can pay securely through our portal or give us a call. Thank you!`
    };
  }
}

export const whatsappService = new WhatsAppService();