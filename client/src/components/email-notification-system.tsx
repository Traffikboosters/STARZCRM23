import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, X, Reply, Clock, User, Building, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface EmailNotification {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: Date;
  contactId?: number;
  contactName?: string;
  companyName?: string;
  isRead: boolean;
  priority: 'normal' | 'high' | 'urgent';
  vendorSource: string;
  importTime: string;
  leadSource: string;
}

// Real-time email lead notifications with vendor tracking
const generateEmailLeadNotifications = (): EmailNotification[] => [
  {
    id: "1",
    from: "sarah.johnson@techstartup.com",
    subject: "New Lead: Website Chat Widget Submission",
    preview: "New lead captured from Starz Chat Widget - Sarah Johnson from TechStartup Inc requesting SEO consultation...",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    contactId: 1,
    contactName: "Sarah Johnson",
    companyName: "TechStartup Inc",
    isRead: false,
    priority: 'high',
    vendorSource: 'Starz Chat Widget',
    importTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    leadSource: 'chat_widget'
  },
  {
    id: "2",
    from: "mike.chen@localplumbing.com",
    subject: "New Lead: Google Maps Business Extraction",
    preview: "New lead extracted from Google Maps - Mike Chen from Chen's Plumbing ready to proceed with Local SEO package...",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    contactId: 2,
    contactName: "Mike Chen",
    companyName: "Chen's Plumbing",
    isRead: false,
    priority: 'urgent',
    vendorSource: 'Google Maps API',
    importTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    leadSource: 'google_maps'
  },
  {
    id: "3",
    from: "info@restaurantgroup.com",
    subject: "New Lead: Yellow Pages Directory Extraction",
    preview: "New lead extracted from Yellow Pages - Downtown Restaurant Group requesting PPC Campaign information...",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    contactId: 3,
    contactName: "Restaurant Group",
    companyName: "Downtown Restaurant Group",
    isRead: false,
    priority: 'normal',
    vendorSource: 'Yellow Pages Directory',
    importTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    leadSource: 'yellow_pages'
  }
];

interface EmailNotificationSystemProps {
  onEmailClick?: (email: EmailNotification) => void;
}

export default function EmailNotificationSystem({ onEmailClick }: EmailNotificationSystemProps) {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate email lead notifications with vendor source tracking
  const generateEmailLeadNotifications = () => {
    const vendors = [
      'Website Contact Form',
      'Google Ads Landing Page',
      'Facebook Lead Form',
      'LinkedIn Message',
      'Yellow Pages Inquiry',
      'Yelp Business Message',
      'Google My Business',
      'Referral Partner',
      'Cold Email Response',
      'Trade Show Lead'
    ];

    const companies = [
      'Metro Plumbing Services',
      'Elite HVAC Solutions',
      'Premier Auto Repair',
      'Downtown Dental Care',
      'Sunrise Landscaping',
      'Golden Gate Restaurant',
      'Tech Solutions Inc',
      'Modern Hair Salon',
      'Fitness First Gym',
      'Legal Eagles Law Firm'
    ];

    const subjects = [
      'New Lead: SEO Services Inquiry',
      'Website Optimization Request',
      'Google Ads Campaign Interest',
      'Local SEO Package Inquiry',
      'Social Media Marketing Request',
      'PPC Advertising Consultation',
      'Website Redesign Project',
      'Digital Marketing Strategy',
      'Lead Generation Services',
      'Online Presence Audit Request'
    ];

    return Array.from({ length: 8 }, (_, i) => {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const contactId = Math.floor(Math.random() * 1000) + 1;
      const timestamp = new Date(Date.now() - Math.random() * 86400000 * 7); // Random within last 7 days

      return {
        id: `email-${Date.now()}-${i}`,
        from: `contact${i + 1}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        subject,
        preview: `Hi, I found your services online and I'm interested in learning more about digital marketing solutions for my business. We're looking to improve our online presence...`,
        timestamp,
        contactId,
        contactName: `Lead Contact ${i + 1}`,
        companyName: company,
        isRead: Math.random() > 0.6, // 40% chance of being unread
        priority: Math.random() > 0.8 ? 'high' : 'normal' as 'normal' | 'high' | 'urgent',
        vendorSource: vendor,
        importTime: timestamp.toISOString(),
        leadSource: vendor.toLowerCase().replace(/\s+/g, '_')
      };
    });
  };

  // Initialize with mock emails and set up polling
  useEffect(() => {
    // Load initial emails
    setEmails(generateEmailLeadNotifications());

    // Simulate receiving new emails periodically
    const emailInterval = setInterval(() => {
      const shouldReceiveEmail = Math.random() < 0.3; // 30% chance every 2 minutes
      
      if (shouldReceiveEmail) {
        const newEmail: EmailNotification = {
          id: Date.now().toString(),
          from: `lead${Math.floor(Math.random() * 100)}@business.com`,
          subject: "New Lead: Real-Time Website Submission",
          preview: "New lead captured from website contact form - interested in learning more about SEO services...",
          timestamp: new Date(),
          contactName: `New Lead ${Math.floor(Math.random() * 100)}`,
          companyName: `Business ${Math.floor(Math.random() * 100)}`,
          isRead: false,
          priority: 'normal',
          vendorSource: 'Website Contact Form',
          importTime: new Date().toISOString(),
          leadSource: 'website_form'
        };

        setEmails(prev => [newEmail, ...prev]);
        
        // Show popup notification
        toast({
          title: "New Email Received",
          description: `From: ${newEmail.contactName || newEmail.from}`,
          duration: 5000,
        });

        // Play notification sound (optional)
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCTGH0fPTgS8GOXi4+ePbtWUcDjKa3vy7gCwFJYDN7tWOQwUWZrPl65pPFws');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if audio can't play
      }
    }, 120000); // Check every 2 minutes

    return () => clearInterval(emailInterval);
  }, [toast]);

  const unreadCount = emails.filter(email => !email.isRead).length;

  const markAsRead = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const handleEmailClick = (email: EmailNotification) => {
    markAsRead(email.id);
    setSelectedEmail(email);
    onEmailClick?.(email);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const replyToEmail = (email: EmailNotification) => {
    const replySubject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
    const replyBody = `Hi ${email.contactName || 'there'},\n\nThank you for your email. I'll be happy to help you with your inquiry.\n\nBest regards,\nTraflik Boosters Team\n(877) 840-6250`;
    
    const mailtoLink = `mailto:${email.from}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
    window.location.href = mailtoLink;
    
    toast({
      title: "Email Client Opened",
      description: `Reply to ${email.contactName || email.from}`,
    });
  };

  return (
    <>
      {/* Floating Email Notification Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="bg-orange-600 hover:bg-orange-700 rounded-full w-14 h-14 p-0 shadow-lg relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Mail className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Email Notifications Panel */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {emails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No emails yet</p>
              </div>
            ) : (
              emails.map((email) => (
                <Card 
                  key={email.id} 
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    !email.isRead ? 'border-l-4 border-l-orange-500 bg-orange-50' : ''
                  }`}
                  onClick={() => handleEmailClick(email)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(email.priority)}`} />
                          <span className="font-medium text-sm truncate">
                            {email.contactName || email.from}
                          </span>
                          {email.companyName && (
                            <span className="text-xs text-gray-500 truncate">
                              ({email.companyName})
                            </span>
                          )}
                          <span className="text-xs text-gray-400 ml-auto">
                            {format(email.timestamp, 'HH:mm')}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-1 truncate">
                          {email.subject}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {email.preview}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {email.vendorSource}
                            </Badge>
                            <span className="text-gray-500">
                              {format(new Date(email.importTime), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          {email.contactId && (
                            <Badge variant="secondary" className="text-xs">
                              Lead #{email.contactId}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!email.isRead && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        )}
                        {email.contactId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Route to CRM with specific contact
                              window.location.href = `/?tab=crm&contact=${email.contactId}`;
                              toast({
                                title: "Routing to CRM",
                                description: `Opening ${email.contactName} in lead management`,
                              });
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            replyToEmail(email);
                          }}
                        >
                          <Reply className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-gray-500">
              {emails.length} total emails
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmails(prev => prev.map(email => ({ ...email, isRead: true })));
                  toast({
                    title: "All emails marked as read",
                    description: "Email notifications cleared",
                  });
                }}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Detail Modal */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Details
            </DialogTitle>
          </DialogHeader>

          {selectedEmail && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{selectedEmail.contactName || selectedEmail.from}</span>
                    {selectedEmail.companyName && (
                      <>
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{selectedEmail.companyName}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {format(selectedEmail.timestamp, 'PPP p')}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{selectedEmail.subject}</h3>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedEmail.preview}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEmail(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    replyToEmail(selectedEmail);
                    setSelectedEmail(null);
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}