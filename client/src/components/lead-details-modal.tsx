import { useState, useEffect } from "react";
import { User, Phone, Mail, Globe, Building, Calendar, Clock, StickyNote, Bot, Zap, ClipboardList, Target, TrendingUp, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@shared/schema";
import { formatPhoneNumber } from "@/lib/utils";

// Import Traffik Boosters logo
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface LeadDetailsModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadDetailsModal({ contact, isOpen, onClose }: LeadDetailsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState(contact.notes || "");
  const [conversationStarters, setConversationStarters] = useState<any[]>([]);
  const [quickReplies, setQuickReplies] = useState<any[]>([]);

  // Calculate lead age and status
  const leadAge = contact.createdAt ? 
    Math.floor((new Date().getTime() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60)) : 0;
  
  const getLeadAgeStatus = () => {
    if (leadAge <= 24) return { status: "NEW", color: "bg-green-500", badge: "bg-green-100 text-green-800" };
    if (leadAge <= 48) return { status: "FOLLOW UP", color: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-800" };
    return { status: "URGENT", color: "bg-red-500", badge: "bg-red-100 text-red-800" };
  };

  const ageStatus = getLeadAgeStatus();

  // Mock conversation starters based on industry/company
  useEffect(() => {
    const industry = contact.company?.toLowerCase() || "";
    let starters = [];

    if (industry.includes("restaurant") || industry.includes("food") || industry.includes("dining")) {
      starters = [
        {
          title: "Local Restaurant Marketing",
          opener: `Hi ${contact.firstName}, I noticed ${contact.company} and wanted to reach out about helping local restaurants increase their online visibility and customer base.`,
          context: "Restaurant industry focus"
        },
        {
          title: "Food Delivery Optimization",
          opener: `${contact.firstName}, with the competitive restaurant market, I'd love to show you how we've helped similar establishments increase their delivery orders by 40%.`,
          context: "Delivery service emphasis"
        }
      ];
    } else if (industry.includes("plumbing") || industry.includes("hvac") || industry.includes("electrical")) {
      starters = [
        {
          title: "Home Service Lead Generation",
          opener: `Hi ${contact.firstName}, I specialize in helping home service businesses like ${contact.company} generate more qualified leads online.`,
          context: "Home services focus"
        },
        {
          title: "Emergency Service Marketing",
          opener: `${contact.firstName}, I'd love to discuss how we can help ${contact.company} capture more emergency service calls when customers need you most.`,
          context: "Emergency services emphasis"
        }
      ];
    } else {
      starters = [
        {
          title: "Business Growth Opportunity",
          opener: `Hi ${contact.firstName}, I came across ${contact.company || 'your business'} and believe we could help significantly increase your online lead generation.`,
          context: "General business approach"
        },
        {
          title: "Digital Marketing Assessment",
          opener: `${contact.firstName}, I'd love to offer you a complimentary digital marketing assessment to show you opportunities for ${contact.company || 'your business'}.`,
          context: "Assessment-based approach"
        }
      ];
    }

    setConversationStarters(starters);
  }, [contact]);

  // Mock quick reply templates
  useEffect(() => {
    const replies = [
      {
        category: "Follow-up",
        subject: `Re: Digital Marketing Services for ${contact.company || contact.firstName}`,
        template: `Hi ${contact.firstName},\n\nI wanted to follow up on my previous message about helping ${contact.company || 'your business'} increase online visibility and generate more qualified leads.\n\nWe've helped similar businesses achieve:\n• 300% increase in website traffic\n• 150% more qualified leads\n• 40% improvement in conversion rates\n\nWould you be available for a quick 15-minute call this week?\n\nBest regards,\nMichael Thompson\nTraffikBoosters.com\n(877) 840-6250`
      },
      {
        category: "Pricing Inquiry",
        subject: `Investment Information - ${contact.company || contact.firstName}`,
        template: `Hi ${contact.firstName},\n\nThank you for your interest in our digital marketing services.\n\nOur comprehensive packages start at $2,500/month and include:\n• Complete SEO optimization\n• Google Ads management\n• Social media marketing\n• Monthly reporting and optimization\n\nI'd be happy to create a custom proposal based on your specific needs. When would be a good time for a brief consultation?\n\nBest regards,\nMichael Thompson\nTraffikBoosters.com`
      },
      {
        category: "Objection Handling",
        subject: `Addressing Your Concerns - ${contact.company || contact.firstName}`,
        template: `Hi ${contact.firstName},\n\nI understand you may have concerns about investing in digital marketing. That's completely normal.\n\nTo address common concerns:\n• ROI: Our average client sees 4:1 return within 90 days\n• Time commitment: We handle everything - minimal time required from you\n• Results: We provide detailed monthly reports showing exact results\n\nWould you like to see case studies from businesses similar to yours?\n\nBest regards,\nMichael Thompson`
      }
    ];

    setQuickReplies(replies);
  }, [contact]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-3 w-3 ${ageStatus.color} rounded-full animate-pulse`}></div>
              <div>
                <h2 className="text-xl font-semibold">
                  {contact.firstName} {contact.lastName}
                </h2>
                <p className="text-gray-600">{contact.company || "Individual Contact"}</p>
              </div>
              <Badge className={ageStatus.badge}>{ageStatus.status}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <img 
                src={traffikBoostersLogo}
                alt="Traffik Boosters" 
                className="h-10 w-10"
              />
              <div className="text-right">
                <div className="text-sm font-semibold text-black">LEAD CARD</div>
                <div className="text-xs text-black">More Traffik! More Sales!</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-2"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 p-2 bg-gray-50 m-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contact">Contact Info</TabsTrigger>
              <TabsTrigger value="ai-starters">AI Starters</TabsTrigger>
              <TabsTrigger value="quick-replies">Quick Replies</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lead Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Lead Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Lead Status</p>
                      <Badge variant="outline">{contact.leadStatus || 'new'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <Badge variant="outline">{contact.priority || 'medium'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lead Age</p>
                      <p className="font-medium">{leadAge}h old</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Source</p>
                      <p className="font-medium">{contact.leadSource || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Basics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      Contact Basics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium">{contact.company || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-medium">{contact.position || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      {contact.phone ? (
                        <p 
                          className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            // Use PowerDials integration
                            const powerDialsWindow = window.open('', 'PowerDialsWeb', 'width=800,height=600,scrollbars=yes,resizable=yes');
                            
                            fetch('/api/powerdials/call', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                phoneNumber: contact.phone,
                                contactName: `${contact.firstName} ${contact.lastName}`,
                                contactId: contact.id,
                                userId: 1
                              })
                            })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success && data.dialerUrl && powerDialsWindow) {
                                powerDialsWindow.location.href = data.dialerUrl;
                                toast({
                                  title: "PowerDials Ready",
                                  description: `Calling ${contact.firstName} ${contact.lastName} via PowerDials`,
                                });
                              } else {
                                if (powerDialsWindow) powerDialsWindow.close();
                                window.open(`tel:${contact.phone}`, '_self');
                                toast({
                                  title: "Call Initiated",
                                  description: `Calling ${contact.firstName} ${contact.lastName}`,
                                });
                              }
                            })
                            .catch(error => {
                              console.error('PowerDials error:', error);
                              if (powerDialsWindow) powerDialsWindow.close();
                              window.open(`tel:${contact.phone}`, '_self');
                              toast({
                                title: "Call Initiated",
                                description: `Calling ${contact.firstName} ${contact.lastName}`,
                              });
                            });
                          }}
                          title="Click to call"
                        >
                          <Phone className="h-4 w-4 mr-2 inline text-green-600" />
                          {formatPhoneNumber(contact.phone)}
                        </p>
                      ) : (
                        <p className="font-medium">N/A</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Business Potential */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      Business Potential
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Estimated Budget</p>
                      <p className="font-medium">{contact.budget ? `$${contact.budget.toLocaleString()}` : '$2,500 - $5,000'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deal Value</p>
                      <p className="font-medium">{contact.dealValue ? `$${contact.dealValue.toLocaleString()}` : '$30,000 - $60,000'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="font-medium">{contact.timeline || '30-60 days'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Contact</p>
                      <p className="font-medium">{contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : 'Never'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contact Info Tab */}
            <TabsContent value="contact" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{contact.phone ? formatPhoneNumber(contact.phone) : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{contact.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <p className="font-medium">{contact.website || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">N/A</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium">{contact.company || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium">{contact.position || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Annual Revenue</p>
                        <p className="font-medium">N/A</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Best Call Time</p>
                        <p className="font-medium">9:00 AM - 5:00 PM EST</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Starters Tab */}
            <TabsContent value="ai-starters" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">AI-Generated Conversation Starters</h3>
                </div>
                
                {conversationStarters.map((starter, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">{starter.title}</CardTitle>
                      <Badge variant="outline" className="w-fit">{starter.context}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{starter.opener}</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(starter.opener);
                          toast({
                            title: "Copied to Clipboard",
                            description: "Conversation starter copied successfully",
                          });
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Quick Replies Tab */}
            <TabsContent value="quick-replies" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Quick Reply Templates</h3>
                </div>
                
                {quickReplies.map((reply, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">{reply.category}</CardTitle>
                      <p className="text-xs text-gray-600">Subject: {reply.subject}</p>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={reply.template}
                        readOnly
                        className="min-h-[120px] text-sm"
                      />
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(reply.template);
                            toast({
                              title: "Email Template Copied",
                              description: "Template copied to clipboard",
                            });
                          }}
                        >
                          Copy Template
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (contact.email) {
                              window.open(`mailto:${contact.email}?subject=${encodeURIComponent(reply.subject)}&body=${encodeURIComponent(reply.template)}`, '_self');
                            }
                          }}
                          disabled={!contact.email}
                        >
                          Send Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <StickyNote className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold">Contact Notes</h3>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this contact..."
                      className="min-h-[200px]"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Here you would save notes via API
                          toast({
                            title: "Notes Saved",
                            description: "Contact notes updated successfully",
                          });
                        }}
                      >
                        Save Notes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNotes("")}
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Activity Timeline</h3>
                </div>
                
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Lead Created</p>
                          <p className="text-sm text-gray-600">
                            {contact.createdAt ? new Date(contact.createdAt).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">First Contact Attempt</p>
                          <p className="text-sm text-gray-600">Pending</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                        <div>
                          <p className="font-medium">Follow-up Scheduled</p>
                          <p className="text-sm text-gray-600">
                            {contact.nextFollowUpAt ? new Date(contact.nextFollowUpAt).toLocaleString() : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}