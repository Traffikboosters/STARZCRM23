import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, X, Reply, Clock, User, Building } from "lucide-react";
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
}

// Simulated email data - in production this would come from email API
const generateMockEmails = (): EmailNotification[] => [
  {
    id: "1",
    from: "sarah.johnson@techstartup.com",
    subject: "Re: SEO Proposal Discussion",
    preview: "Thank you for the detailed proposal. I have a few questions about the timeline and would like to schedule a follow-up call...",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    contactId: 1,
    contactName: "Sarah Johnson",
    companyName: "TechStartup Inc",
    isRead: false,
    priority: 'high'
  },
  {
    id: "2",
    from: "mike.chen@localplumbing.com",
    subject: "Ready to move forward with Local SEO",
    preview: "Hi, after reviewing your proposal, we're ready to proceed with the local SEO package. When can we start?",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    contactId: 2,
    contactName: "Mike Chen",
    companyName: "Chen's Plumbing",
    isRead: false,
    priority: 'urgent'
  },
  {
    id: "3",
    from: "info@restaurantgroup.com",
    subject: "Question about PPC Campaign",
    preview: "We received your PPC proposal. Could you clarify the monthly management fee structure?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    contactId: 3,
    contactName: "Restaurant Group",
    companyName: "Downtown Restaurant Group",
    isRead: true,
    priority: 'normal'
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

  // Initialize with mock emails and set up polling
  useEffect(() => {
    // Load initial emails
    setEmails(generateMockEmails());

    // Simulate receiving new emails periodically
    const emailInterval = setInterval(() => {
      const shouldReceiveEmail = Math.random() < 0.3; // 30% chance every 2 minutes
      
      if (shouldReceiveEmail) {
        const newEmail: EmailNotification = {
          id: Date.now().toString(),
          from: `lead${Math.floor(Math.random() * 100)}@business.com`,
          subject: "New inquiry from website",
          preview: "Hi, I saw your services online and I'm interested in learning more about SEO for my business...",
          timestamp: new Date(),
          contactName: `New Lead ${Math.floor(Math.random() * 100)}`,
          companyName: `Business ${Math.floor(Math.random() * 100)}`,
          isRead: false,
          priority: 'normal'
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
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {email.preview}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!email.isRead && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
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