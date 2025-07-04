import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Filter, User, Mail, Phone, Building, MapPin, Calendar, Star, MessageCircle, X, Clock, DollarSign, FileText, ExternalLink, CreditCard, Users, Target, Edit, Send, Video, MoreVertical, CheckCircle, AlertCircle, Briefcase, TrendingUp, Bot, Zap, ClipboardList, StickyNote, Copy, TestTube, Settings, FileUp, Globe, Brain } from "lucide-react";
import { format } from "date-fns";
import type { Contact, User as UserType } from "@shared/schema";
import { authService } from "@/lib/auth";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";
import ContactDetailsModal from "@/components/contact-details-modal";
import TechnicalProposalForm from "@/components/technical-proposal-form";
import LeadSourceBadge from "@/components/lead-source-badge";
import ContextualSalesCoaching from "@/components/contextual-sales-coaching";
import AISalesTipGenerator from "@/components/ai-sales-tip-generator";
import DataTypeFilter from "@/components/data-type-filter";
import STARZPOWERDIALSDialer from "@/components/starz-mightycall-dialer";
import RealTimeLeadManager from "@/components/real-time-lead-manager";







const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  leadSource: z.string().optional(),
  leadStatus: z.string().optional(),
  priority: z.string().optional(),
  notes: z.string().optional(),
  isDemo: z.boolean().default(false),
  scheduleAppointment: z.boolean().default(false),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  appointmentType: z.string().optional(),
  appointmentNotes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Phone number formatting utility - removes country codes
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle US phone numbers with country code (11 digits starting with 1)
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    const digits = cleaned.substring(1);
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  }
  
  // Handle 10-digit US numbers without country code
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  // Return original if no formatting rules match
  return phone;
};

// Lead age calculation and styling utility
const getLeadAgeStatus = (createdAt: string | Date) => {
  const now = new Date();
  const leadDate = new Date(createdAt);
  const ageInHours = (now.getTime() - leadDate.getTime()) / (1000 * 60 * 60);
  const ageInDays = ageInHours / 24;

  if (ageInHours <= 24) {
    return {
      status: 'new',
      color: 'green',
      animation: 'animate-pulse',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      badgeColor: 'bg-green-500',
      description: 'NEW'
    };
  } else if (ageInDays <= 3) {
    return {
      status: 'medium',
      color: 'yellow',
      animation: '',
      bgColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      badgeColor: 'bg-yellow-500',
      description: 'Follow Up'
    };
  } else {
    return {
      status: 'urgent',
      color: 'red',
      animation: '',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      badgeColor: 'bg-red-500',
      description: 'Urgent'
    };
  }
};

// Email notification component
const EmailNotificationPopup = ({ isOpen, onClose, contact }: { isOpen: boolean; onClose: () => void; contact: Contact | null }) => {
  const [emailType, setEmailType] = useState("compose");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && contact) {
      setEmailSubject(`Follow-up: ${contact.company || `${contact.firstName} ${contact.lastName}`}`);
      setEmailBody(`Dear ${contact.firstName},\n\nThank you for your interest in Traffik Boosters. I wanted to follow up on our conversation regarding your digital marketing needs.\n\nBest regards,\nTraflik Boosters Team\n(877) 840-6250`);
    }
  }, [isOpen, contact]);

  const sendEmail = () => {
    if (contact?.email) {
      const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      toast({
        title: "Email Opened",
        description: `Email client opened for ${contact.firstName} ${contact.lastName}`,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Communication
          </DialogTitle>
        </DialogHeader>
        
        {contact && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={emailType === "compose" ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailType("compose")}
              >
                Compose Email
              </Button>
              <Button
                variant={emailType === "templates" ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailType("templates")}
              >
                Email Templates
              </Button>
            </div>

            {emailType === "compose" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email-to">To:</Label>
                  <Input 
                    id="email-to" 
                    value={contact.email || ""} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="email-subject">Subject:</Label>
                  <Input 
                    id="email-subject" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email-body">Message:</Label>
                  <Textarea 
                    id="email-body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={sendEmail} className="bg-orange-600 hover:bg-orange-700">
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            )}

            {emailType === "templates" && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setEmailType("compose");
                    setEmailSubject("Initial Follow-up");
                    setEmailBody(`Hi ${contact.firstName},\n\nThank you for connecting with Traffik Boosters! I wanted to reach out personally to discuss how we can help grow your business.\n\nWould you be available for a quick 15-minute call this week to explore opportunities?\n\nBest regards,\nTraflik Boosters Team\n(877) 840-6250`);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Initial Follow-up Template
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setEmailType("compose");
                    setEmailSubject("Service Proposal - Digital Marketing Solutions");
                    setEmailBody(`Dear ${contact.firstName},\n\nBased on our conversation, I've prepared a customized proposal for ${contact.company || "your business"}.\n\nOur services include:\n• SEO Optimization ($1,500-$3,000/month)\n• Local Business Listings ($275-$500)\n• Google My Business Setup ($400-$800)\n• Social Media Marketing ($800-$1,500/month)\n\nI'd love to schedule a call to discuss these options in detail.\n\nBest regards,\nTraflik Boosters Team\n(877) 840-6250`);
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Service Proposal Template
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setEmailType("compose");
                    setEmailSubject("Check-in: How are things going?");
                    setEmailBody(`Hi ${contact.firstName},\n\nI hope this email finds you well. I wanted to check in and see how things are progressing with your business.\n\nIf you're still interested in growing your online presence, I'd be happy to schedule a no-obligation consultation.\n\nLet me know if you have any questions!\n\nBest regards,\nTraflik Boosters Team\n(877) 840-6250`);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Check-in Template
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Work Order Modal Component
const WorkOrderModal = ({ isOpen, onClose, contact }: { isOpen: boolean; onClose: () => void; contact: Contact | null }) => {
  const [selectedService, setSelectedService] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const { toast } = useToast();

  const services = [
    { name: "SEO Package (3-month)", price: "$2,500", timeline: "90 days" },
    { name: "Local Business Listings", price: "$375", timeline: "5-7 days" },
    { name: "Google My Business Setup", price: "$600", timeline: "3-5 days" },
    { name: "Website Development", price: "$3,500", timeline: "2-3 weeks" },
    { name: "Social Media Marketing", price: "$1,200/month", timeline: "Ongoing" },
    { name: "PPC Campaign Setup", price: "$800", timeline: "1 week" },
    { name: "Content Creation Package", price: "$950", timeline: "2 weeks" },
    { name: "Brand Development", price: "$1,800", timeline: "3 weeks" },
  ];

  const generateWorkOrder = () => {
    if (!contact || !selectedService) return;
    
    const service = services.find(s => s.name === selectedService);
    const workOrderId = `WO-${Date.now().toString().slice(-6)}`;
    
    // Generate account number with first 3 letters of service
    const servicePrefix = selectedService.substring(0, 3).toUpperCase();
    const accountNumber = `${servicePrefix}-${Date.now().toString().slice(-8)}`;
    
    const workOrderContent = `WORK ORDER AGREEMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TRAFFIK BOOSTERS - More Traffik! More Sales!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Work Order #: ${workOrderId}
Account Number: ${accountNumber}
Date: ${new Date().toLocaleDateString()}

CLIENT INFORMATION:
Name: ${contact.firstName} ${contact.lastName}
Company: ${contact.company || `${contact.firstName}'s Business`}
Email: ${contact.email}
Phone: ${formatPhoneNumber(contact.phone)}

SERVICE DETAILS:
Service: ${service?.name || selectedService}
Investment: ${customAmount || service?.price || "TBD"}
Timeline: ${service?.timeline || "TBD"}

TERMS & CONDITIONS:
• Payment is due within 3 business days of work commencement
• Full refund available within 3 days of project start
• 50% refund available thereafter until project completion
• All work guaranteed to meet agreed specifications

CLIENT SIGNATURE:
Signature: ____________________________
Date: _______________

By signing this work order, you authorize Traffik Boosters to proceed with the requested services.

Thank you for choosing Traffik Boosters!
"More Traffik! More Sales!"

Contact: (877) 840-6250
Email: info@traffikboosters.com`;

    const emailSubject = `Work Order Agreement - ${workOrderId}`;
    const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(workOrderContent)}`;
    
    window.location.href = mailtoLink;
    
    toast({
      title: "Work Order Created",
      description: `Work order ${workOrderId} sent to ${contact.firstName}`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Work Order
          </DialogTitle>
        </DialogHeader>
        
        {contact && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Client Information</h3>
              <p><strong>Name:</strong> {contact.firstName} {contact.lastName}</p>
              <p><strong>Company:</strong> {contact.company || "N/A"}</p>
              <p><strong>Email:</strong> {contact.email}</p>
              <p><strong>Phone:</strong> {formatPhoneNumber(contact.phone)}</p>
            </div>

            <div>
              <Label htmlFor="service-select">Select Service:</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name} - {service.price} ({service.timeline})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedService === "custom" && (
              <div>
                <Label htmlFor="custom-amount">Custom Amount:</Label>
                <Input 
                  id="custom-amount"
                  placeholder="Enter custom amount (e.g., $1,500)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={generateWorkOrder}
                disabled={!selectedService}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Work Order
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function CRMView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // User authentication and role checking
  const currentUser = authService.getCurrentUser();
  const isManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  
  // WebSocket connection for real-time Lead Card updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_lead') {
          // Invalidate contacts query to trigger immediate refresh
          queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
          
          // Show real-time notification
          toast({
            title: "New Lead Added",
            description: `${data.contact.firstName} ${data.contact.lastName} from ${data.leadSource} has been added to your Lead Cards`,
          });
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onopen = () => {
      console.log('CRM WebSocket connected for real-time Lead Card updates');
    };

    ws.onclose = () => {
      console.log('CRM WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [queryClient, toast]);
  
  // State management
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCoachingModalOpen, setIsCoachingModalOpen] = useState(false);
  const [isAITipGeneratorOpen, setIsAITipGeneratorOpen] = useState(false);
  const [isTechnicalProposalModalOpen, setIsTechnicalProposalModalOpen] = useState(false);
  const [showSTARZDialer, setShowSTARZDialer] = useState(false);

  const [isLeadAllocationModalOpen, setIsLeadAllocationModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<Contact | null>(null);
  const [selectedLeadsForAllocation, setSelectedLeadsForAllocation] = useState<number[]>([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dataTypeFilter, setDataTypeFilter] = useState<'all' | 'real' | 'demo'>('all');
  const [currentAction, setCurrentAction] = useState<'calling' | 'emailing' | 'scheduling' | 'qualifying' | 'closing' | undefined>(undefined);
  const [coachingContact, setCoachingContact] = useState<Contact | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    type: "consultation",
    notes: ""
  });

  // WebSocket connection for real-time email lead updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle lead count updates from any source
        if (data.type === 'lead_count_update' || data.type === 'new_lead' || data.type === 'chat_widget_submission' || data.type === 'high_revenue_prospect' || data.type === 'scraping_complete') {
          // Invalidate and refetch contacts immediately for real-time updates
          queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
          
          // Show toast notification for new leads from various sources
          if (data.type === 'chat_widget_submission' && data.newLead) {
            toast({
              title: "New Email Lead Received!",
              description: `${data.newLead.name} from ${data.newLead.company} via ${data.newLead.source}`,
              duration: 5000,
            });
          } else if (data.type === 'high_revenue_prospect' && data.contact) {
            toast({
              title: "New High Revenue Prospect!",
              description: `${data.contact.firstName} ${data.contact.lastName} - $${data.contact.estimatedMonthlyRevenue?.toLocaleString()}/month`,
              duration: 5000,
            });
          } else if (data.type === 'new_lead' && data.contact) {
            toast({
              title: "New Lead Added!",
              description: `${data.contact.firstName} ${data.contact.lastName} via ${data.contact.leadSource || 'Unknown Source'}`,
              duration: 4000,
            });
          } else if (data.type === 'scraping_complete' && data.newLeads) {
            toast({
              title: "Lead Extraction Complete!",
              description: `${data.newLeads} new leads added to your CRM`,
              duration: 4000,
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    return () => {
      socket.close();
    };
  }, [queryClient, toast]);

  // Auto-refresh lead count every 30 seconds (backup)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Form setup
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      website: "",
      company: "",
      position: "",
      leadSource: "",
      leadStatus: "new",
      priority: "medium",
      notes: "",
      scheduleAppointment: false,
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "",
      appointmentNotes: "",
    },
  });

  // Data fetching with optimized performance and pagination
  const { data: contactsResponse, isLoading } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: () => apiRequest("/api/contacts?limit=1000"), // Get first 1000 for now
    refetchInterval: 120000, // Reduced to 2 minutes for optimal performance
    staleTime: 20000, // Consider data fresh for 20 seconds
    gcTime: 300000, // Keep in cache for 5 minutes (renamed from cacheTime in v5)
  });

  // Extract contacts from paginated response structure
  const contacts: Contact[] = useMemo(() => {
    if (contactsResponse?.contacts) {
      return contactsResponse.contacts;
    }
    // Fallback for old response format
    if (Array.isArray(contactsResponse)) {
      return contactsResponse;
    }
    return [];
  }, [contactsResponse]);

  // Current user already defined above using authService

  const { data: allUsers = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  // Filter to get only actual employees (users with sales_rep or admin role)
  const salesReps = allUsers.filter(user => user.role === 'sales_rep' || user.role === 'admin');

  // STARZ POWERDIALS Dialer Integration
  const handleCallContact = async (contact: Contact) => {
    if (!contact.phone) {
      toast({
        title: "No Phone Number",
        description: "This contact doesn't have a phone number",
        variant: "destructive",
      });
      return;
    }

    // Set selected contact and open STARZ dialer
    setSelectedContact(contact);
    setShowSTARZDialer(true);
    
    console.log(`📞 OPENING STARZ DIALER: ${contact.firstName} ${contact.lastName} (${contact.phone})`);
    toast({
      title: "STARZ Dialer Opening",
      description: `Preparing to call ${contact.firstName} ${contact.lastName}`,
    });
  };

  // Schedule appointment functionality
  const handleScheduleAppointment = async () => {
    if (!selectedContact || !scheduleForm.date || !scheduleForm.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const appointmentDateTime = new Date(`${scheduleForm.date}T${scheduleForm.time}`);
    
    const eventData = {
      title: `${scheduleForm.type} with ${selectedContact.firstName} ${selectedContact.lastName}`,
      description: `Contact: ${selectedContact.firstName} ${selectedContact.lastName}\nCompany: ${selectedContact.company || 'N/A'}\nPhone: ${selectedContact.phone || 'N/A'}\nEmail: ${selectedContact.email || 'N/A'}\nNotes: ${scheduleForm.notes || 'No additional notes'}`,
      startTime: appointmentDateTime.toISOString(),
      endTime: new Date(appointmentDateTime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      contactId: selectedContact.id,
      userId: currentUser?.id || 1,
    };

    try {
      const response = await apiRequest("POST", "/api/events", eventData);
      if (response.ok) {
        toast({
          title: "Appointment Scheduled",
          description: `Meeting scheduled for ${format(appointmentDateTime, 'PPP p')}`,
        });
        setIsScheduleModalOpen(false);
        setScheduleForm({ date: "", time: "", type: "consultation", notes: "" });
      }
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    }
  };

  // Contact filtering with data type support
  const filteredContacts = useMemo(() => {
    if (!contacts || !Array.isArray(contacts)) {
      return [];
    }
    
    return contacts
      .filter((contact) => {
        const matchesSearch = searchTerm === "" || 
          contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
          (contact.phone?.includes(searchTerm) ?? false) ||
          (contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesStatus = statusFilter === "all" || contact.leadStatus === statusFilter;
        const matchesSource = sourceFilter === "all" || contact.leadSource === sourceFilter;
        
        // Data type filtering: real customer inquiries vs demo data
        const matchesDataType = dataTypeFilter === "all" || 
          (dataTypeFilter === "real" && !contact.isDemo) ||
          (dataTypeFilter === "demo" && contact.isDemo);

        return matchesSearch && matchesStatus && matchesSource && matchesDataType;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first
  }, [contacts, searchTerm, statusFilter, sourceFilter, dataTypeFilter]);

  // Calculate data type counts
  const realCount = useMemo(() => {
    return contacts?.filter(contact => !contact.isDemo).length || 0;
  }, [contacts]);

  const demoCount = useMemo(() => {
    return contacts?.filter(contact => contact.isDemo).length || 0;
  }, [contacts]);

  const totalCount = contacts?.length || 0;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSourceFilter("all");
    setDataTypeFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || sourceFilter !== "all" || dataTypeFilter !== "all";

  // Calculate time since import timestamp
  const getTimeSinceImport = (importedAt: string | Date) => {
    if (!importedAt) return 'Unknown';
    
    const now = new Date();
    const importTime = new Date(importedAt);
    const diffInSeconds = Math.floor((now.getTime() - importTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      return `${hours}h ${minutes}m ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      const hours = Math.floor((diffInSeconds % 86400) / 3600);
      return `${days}d ${hours}h ago`;
    }
  };

  // Format import timestamp for detailed display (H:M:S format)
  const formatImportTimestamp = (importedAt: string | Date) => {
    if (!importedAt) return 'No timestamp';
    
    const importTime = new Date(importedAt);
    return importTime.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Mutations
  const addContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const contactData = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        position: data.position || null,
        leadSource: data.leadSource || 'manual_entry',
        leadStatus: data.leadStatus || "new",
        priority: data.priority || "medium",
        notes: data.notes || null,
      };

      // Use enhanced contact creation endpoint with lead source tracking
      const response = await apiRequest("POST", "/api/contacts/with-source", contactData);
      if (!response.ok) {
        throw new Error("Failed to add contact");
      }
      return response.json();
    },
    onSuccess: async (newContact) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsAddContactModalOpen(false);
      form.reset();

      toast({
        title: "Contact Added",
        description: `${newContact.firstName} ${newContact.lastName} has been added to your contacts`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Lead allocation mutation
  const allocateLeadsMutation = useMutation({
    mutationFn: async ({ leadIds, salesRepId }: { leadIds: number[], salesRepId: number }) => {
      const response = await apiRequest("POST", "/api/contacts/allocate", {
        contactIds: leadIds,
        assignedTo: salesRepId,
      });
      if (!response.ok) {
        throw new Error("Failed to allocate leads");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsLeadAllocationModalOpen(false);
      setSelectedLeadsForAllocation([]);
      setSelectedSalesRep("");
      
      toast({
        title: "Leads Allocated",
        description: `${data.updatedCount} leads successfully assigned`,
      });
    },
    onError: (error) => {
      toast({
        title: "Allocation Failed",
        description: "Failed to allocate leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (data: ContactFormData) => {
    addContactMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Live Lead Count */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-20 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              CRM - Lead Card Management 
              <Badge variant="secondary" className="ml-3 text-lg px-3 py-1">
                {contacts.length} Lead Cards
              </Badge>
            </h1>
            <p className="text-gray-600">
              Manage your lead cards and prospects • Last updated: {format(new Date(), 'p')}
            </p>
            <p className="text-sm font-bold text-black">More Traffik! More Sales!</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Dialog open={isLeadAllocationModalOpen} onOpenChange={setIsLeadAllocationModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                <Users className="h-4 w-4 mr-2" />
                Allocate Leads
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Leads
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Data Type Filter */}
      <DataTypeFilter
        onFilterChange={setDataTypeFilter}
        currentFilter={dataTypeFilter}
        realCount={realCount}
        demoCount={demoCount}
        totalCount={totalCount}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search lead cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="not_interested">Not Interested</SelectItem>
              <SelectItem value="callback">Callback</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="email_campaign">Email Campaign</SelectItem>
              <SelectItem value="phone_call">Phone Call</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="whitespace-nowrap"
            >
              View All ({contacts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
        {hasActiveFilters && " (filtered)"}
      </div>

      {/* Real-Time Lead Manager */}
      <RealTimeLeadManager />

      {/* Enhanced Contact Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No contacts found matching your criteria.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-green-600 font-semibold">
            Displaying {filteredContacts.length} lead cards
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => {
              const ageStatus = getLeadAgeStatus(contact.createdAt);
              return (
                <Card 
                  key={contact.id} 
                  className={`hover:shadow-md transition-all duration-300 border-l-4 border-l-orange-500 ${ageStatus.bgColor} lead-card-content`}
                >
                <CardHeader className="pb-1 p-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge 
                      className={`${ageStatus.badgeColor} text-white text-[10px] px-1 py-0 ${ageStatus.description === '0-24H' ? ageStatus.animation : ''}`}
                    >
                      {ageStatus.description}
                    </Badge>
                    <Badge 
                      className={`text-[10px] px-1 py-0 ${contact.isDemo ? 'bg-gray-500 text-white' : 'bg-green-600 text-white'}`}
                    >
                      {contact.isDemo ? 'DEMO' : 'REAL'}
                    </Badge>
                  </div>
                  
                  {/* Smaller Logo */}
                  <div className="flex justify-center mb-1">
                    <img 
                      src={traffikBoostersLogo} 
                      alt="Traffik Boosters" 
                      className="h-8 w-auto object-contain"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mb-0">
                    <h3 className="text-[10px] font-bold text-gray-900">LEAD CARD</h3>
                    <CardTitle className="text-[10px] font-semibold leading-tight flex-1 text-right">
                      <div className="truncate">
                        {contact.company || `${contact.firstName} ${contact.lastName}`}
                      </div>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 lead-card-section p-2">
                  {/* Contact Information */}
                  <div className="space-y-0 lead-card-text">
                    <div className="flex items-center text-[10px] text-gray-600 min-h-[14px] leading-none">
                      <User className="h-2 w-2 mr-1 flex-shrink-0" />
                      <span className="truncate font-medium">{contact.firstName} {contact.lastName}</span>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-600 min-h-[14px] leading-none">
                      <Phone className="h-2 w-2 mr-1 flex-shrink-0" />
                      <span className="truncate font-medium">{formatPhoneNumber(contact.phone) || 'No phone'}</span>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-600 min-h-[14px] leading-none">
                      <Mail className="h-2 w-2 mr-1 flex-shrink-0" />
                      <span className="truncate font-medium">{contact.email || 'No email'}</span>
                    </div>
                    {contact.website && (
                      <div className="flex items-center text-[10px] text-gray-600 min-h-[14px] leading-none">
                        <ExternalLink className="h-2 w-2 mr-1 flex-shrink-0" />
                        <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="truncate font-medium text-blue-600 hover:underline">
                          {contact.website}
                        </a>
                      </div>
                    )}
                    {contact.position && (
                      <div className="flex items-center text-[10px] text-gray-600 min-h-[14px] leading-none">
                        <Briefcase className="h-2 w-2 mr-1 flex-shrink-0" />
                        <span className="truncate font-medium">{contact.position}</span>
                      </div>
                    )}
                  </div>

                  {/* Import Timestamp - Management Only */}
                  {isManagement && (
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Imported: {formatImportTimestamp(contact.importedAt || contact.createdAt)}</span>
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        {getTimeSinceImport(contact.importedAt || contact.createdAt)}
                      </div>
                    </div>
                  )}

                  {/* Lead Status & Priority */}
                  <div className="flex items-center justify-between pt-0.5 border-t border-gray-100">
                    <div className="flex items-center gap-0.5">
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3">
                        {contact.leadStatus?.replace('_', ' ').toUpperCase() || 'NEW'}
                      </Badge>
                      {contact.priority && (
                        <Badge variant={contact.priority === 'high' ? 'destructive' : contact.priority === 'medium' ? 'default' : 'secondary'} className="text-[8px] px-1 py-0 h-3">
                          {contact.priority.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Service Interest Information */}
                  {(contact.primaryServiceNeed || (contact.servicesInterested && contact.servicesInterested.length > 0)) && (
                    <div className="pt-0.5 border-t border-gray-100 space-y-0">
                      <div className="flex items-center text-[8px] text-gray-600 mb-0.5">
                        <Target className="h-2 w-2 mr-0.5" />
                        <span className="font-medium">Service Interest</span>
                      </div>
                      {contact.primaryServiceNeed && (
                        <div className="text-[8px] font-medium text-blue-600 mb-0.5">
                          {contact.primaryServiceNeed}
                        </div>
                      )}
                      {contact.servicesInterested && contact.servicesInterested.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mb-0.5">
                          {contact.servicesInterested.slice(0, 2).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-[8px] px-1 py-0 h-3">
                              {service}
                            </Badge>
                          ))}
                          {contact.servicesInterested.length > 2 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-3">
                              +{contact.servicesInterested.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      {contact.serviceDescription && (
                        <div className="text-[8px] text-gray-600 truncate mb-0.5">
                          {contact.serviceDescription}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[8px]">
                        {contact.serviceUrgency && (
                          <Badge 
                            variant={
                              contact.serviceUrgency === 'urgent' ? 'destructive' : 
                              contact.serviceUrgency === 'high' ? 'default' : 
                              'secondary'
                            } 
                            className="text-[8px] px-1 py-0 h-3"
                          >
                            {contact.serviceUrgency.toUpperCase()}
                          </Badge>
                        )}
                        {contact.serviceBudget && (
                          <span className="text-green-600 font-medium">
                            ${(contact.serviceBudget / 100).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lead Source Badge */}
                  {contact.leadSource && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <LeadSourceBadge 
                        source={contact.leadSource} 
                        timestamp={contact.createdAt}
                        size="sm"
                        showIcon={true}
                      />
                      <span className="text-xs text-muted-foreground">
                        {getTimeSinceImport(contact.importedAt || contact.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Deal Value - Prominently Displayed */}
                  {contact.dealValue && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-green-700">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <div>
                            <div className="text-lg font-bold">
                              ${contact.dealValue.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600">Prospect Deal Value</div>
                          </div>
                        </div>
                        {contact.pipelineStage && (
                          <Badge 
                            variant={
                              contact.pipelineStage === 'closed_won' ? 'default' :
                              contact.pipelineStage === 'negotiation' ? 'secondary' :
                              'outline'
                            }
                            className="text-xs px-2 py-1"
                          >
                            {contact.pipelineStage.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Business Intelligence Section */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <Building className="h-3 w-3 mr-1" />
                      <span className="font-medium">Business Details</span>
                    </div>
                    
                    {/* Company Size & Industry */}
                    {(contact.companySize || contact.position) && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {contact.companySize && (
                          <div>
                            <span className="text-gray-500">Size:</span>
                            <Badge variant="outline" className="ml-1 text-xs px-1 py-0">
                              {contact.companySize.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        )}
                        {contact.position && (
                          <div>
                            <span className="text-gray-500">Role:</span>
                            <span className="ml-1 font-medium truncate">{contact.position}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Budget & Timeline */}
                    {((contact.budget || contact.serviceBudget) || (contact.timeline || contact.serviceTimeline)) && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {(contact.budget || contact.serviceBudget) && (
                          <div className="flex items-center text-green-600">
                            <DollarSign className="h-3 w-3 mr-1" />
                            <span className="font-medium">
                              ${((contact.serviceBudget || contact.budget) / 100).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {(contact.timeline || contact.serviceTimeline) && (
                          <div className="flex items-center text-blue-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="font-medium truncate">
                              {(contact.serviceTimeline || contact.timeline)?.replace('_', ' ') || 'TBD'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contact Activity Timeline */}
                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="font-medium">Activity Timeline</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      {contact.lastContactedAt && (
                        <div className="flex items-center justify-between">
                          <span>Last Contact:</span>
                          <span className="font-medium">{format(new Date(contact.lastContactedAt), 'MMM d')}</span>
                        </div>
                      )}
                      {contact.nextFollowUpAt && (
                        <div className="flex items-center justify-between">
                          <span>Next Follow-up:</span>
                          <span className="font-medium text-orange-600">
                            {format(new Date(contact.nextFollowUpAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Qualification & Notes Section */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span className="font-medium">Qualification Status</span>
                      </div>
                      {contact.qualificationScore && contact.qualificationScore > 0 && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          <span className="text-xs font-medium">{contact.qualificationScore}/100</span>
                        </div>
                      )}
                    </div>

                    {/* Current Provider & Competition */}
                    {contact.currentProvider && (
                      <div className="text-xs">
                        <span className="text-gray-500">Current Provider:</span>
                        <span className="ml-1 font-medium text-red-600">{contact.currentProvider}</span>
                      </div>
                    )}

                    {/* Disposition & Interest Level */}
                    {contact.disposition && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <span className="text-gray-500">Status:</span>
                          <Badge 
                            variant={
                              contact.disposition === 'interested' ? 'default' :
                              contact.disposition === 'callback' ? 'secondary' :
                              contact.disposition === 'not_interested' ? 'destructive' :
                              'outline'
                            }
                            className="ml-1 text-xs px-1 py-0"
                          >
                            {contact.disposition.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        {contact.urgencyLevel && (
                          <Badge 
                            variant={
                              contact.urgencyLevel === 'critical' ? 'destructive' :
                              contact.urgencyLevel === 'high' ? 'default' :
                              'secondary'
                            }
                            className="text-xs px-1 py-0"
                          >
                            {contact.urgencyLevel.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Key Notes Preview */}
                    {contact.notes && (
                      <div className="text-xs">
                        <span className="text-gray-500">Notes:</span>
                        <div className="mt-1 p-2 bg-yellow-50 rounded text-xs text-gray-700 border-l-2 border-yellow-300">
                          {contact.notes.length > 100 ? 
                            `${contact.notes.substring(0, 100)}...` : 
                            contact.notes
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assigned Sales Rep Display */}
                  <div className="bg-gray-50 p-2 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                        <div className="truncate">
                          {contact.assignedTo ? (
                            <div>
                              <div className="font-medium">
                                {salesReps.find(rep => rep.id === contact.assignedTo)?.firstName} {salesReps.find(rep => rep.id === contact.assignedTo)?.lastName}
                              </div>
                              <div className="text-gray-500 truncate">
                                {salesReps.find(rep => rep.id === contact.assignedTo)?.firstName?.toLowerCase()}.{salesReps.find(rep => rep.id === contact.assignedTo)?.lastName?.toLowerCase()}@traffikboosters.com
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </div>
                      </div>
                      {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Reassign Lead</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {salesReps.filter(rep => rep.role !== 'admin').map((rep) => (
                              <DropdownMenuItem
                                key={rep.id}
                                onClick={async () => {
                                  try {
                                    await apiRequest('PATCH', `/api/contacts/${contact.id}`, {
                                      assignedTo: rep.id
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
                                    toast({
                                      title: "Lead Reassigned",
                                      description: `Lead assigned to ${rep.firstName} ${rep.lastName}`,
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to reassign lead",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <User className="h-3 w-3 mr-2" />
                                {rep.firstName} {rep.lastName}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Ultra Compact Action Buttons */}
                  <div className="grid grid-cols-5 gap-0.5 mt-1">
                    {/* Call Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-0 h-auto min-h-[24px] px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCallContact(contact);
                      }}
                      disabled={!contact.phone}
                    >
                      <Phone className="h-2 w-2 mb-0.5 text-green-600 flex-shrink-0" />
                      <span className="leading-none text-center text-[8px]">Call</span>
                    </Button>

                    {/* Schedule Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-0 h-auto min-h-[24px] px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                        setIsScheduleModalOpen(true);
                      }}
                    >
                      <Calendar className="h-2 w-2 mb-0.5 text-blue-600 flex-shrink-0" />
                      <span className="leading-none text-center text-[8px]">Schedule</span>
                    </Button>

                    {/* Email Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-0 h-auto min-h-[24px] px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                        setIsEmailModalOpen(true);
                      }}
                      disabled={!contact.email}
                    >
                      <Mail className="h-2 w-2 mb-0.5 text-orange-600 flex-shrink-0" />
                      <span className="leading-none text-center text-[8px]">Email</span>
                    </Button>

                    {/* AI Starters Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-0 h-auto min-h-[24px] px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContactForDetails(contact);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <Bot className="h-2 w-2 mb-0.5 text-indigo-600 flex-shrink-0" />
                      <span className="leading-none text-center text-[8px]">AI Starters</span>
                    </Button>

                    {/* Quick Replies Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-0 h-auto min-h-[24px] px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContactForDetails(contact);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <Zap className="h-2 w-2 mb-0.5 text-yellow-600 flex-shrink-0" />
                      <span className="leading-none text-center text-[8px]">Quick Reply</span>
                    </Button>

                    {/* Notes Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-0 h-auto min-h-[24px] px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContactForDetails(contact);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <StickyNote className="h-2 w-2 mb-0.5 text-amber-600 flex-shrink-0" />
                      <span className="leading-none text-center text-[8px]">Notes</span>
                    </Button>

                    {/* AI Sales Tips Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-0 h-auto min-h-[24px] px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("AI Tips button clicked for contact:", contact.firstName, contact.lastName);
                        console.log("Current isAITipGeneratorOpen state:", isAITipGeneratorOpen);
                        alert("AI Tips button clicked!"); // Temporary debugging
                        setSelectedContact(contact);
                        setCurrentAction('calling');
                        setIsAITipGeneratorOpen(true);
                        console.log("AI Tip Generator state set to true");
                        // Force re-render check
                        setTimeout(() => {
                          console.log("AI Tip Generator state after timeout:", isAITipGeneratorOpen);
                        }, 100);
                      }}
                    >
                      <ClipboardList className="h-2 w-2 mb-0.5 text-purple-600 flex-shrink-0" />
                      <span className="leading-none text-center text-[8px]">AI Tips</span>
                    </Button>

                    {/* Send to Technical Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-0 h-auto min-h-[24px] px-0 border-orange-300 hover:bg-orange-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Send to Tech button clicked for contact:", contact.firstName, contact.lastName);
                        console.log("Current isTechnicalProposalModalOpen state:", isTechnicalProposalModalOpen);
                        alert("Send to Tech button clicked!"); // Temporary debugging
                        setSelectedContact(contact);
                        setIsTechnicalProposalModalOpen(true);
                        console.log("Technical Proposal Modal state set to true");
                        // Force re-render check
                        setTimeout(() => {
                          console.log("Technical Proposal Modal state after timeout:", isTechnicalProposalModalOpen);
                        }, 100);
                      }}
                    >
                      <FileUp className="h-2 w-2 mb-0.5 text-orange-600 flex-shrink-0" />
                      <span className="leading-none text-center text-[8px]">Send to Tech</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      )}

      {/* Modals */}
      <EmailNotificationPopup 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        contact={selectedContact} 
      />

      <WorkOrderModal 
        isOpen={isWorkOrderModalOpen} 
        onClose={() => setIsWorkOrderModalOpen(false)} 
        contact={selectedContact} 
      />



      {/* Schedule Appointment Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Appointment
            </DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p><strong>Client:</strong> {selectedContact.firstName} {selectedContact.lastName}</p>
                <p><strong>Company:</strong> {selectedContact.company || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule-date">Date:</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-time">Time:</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="meeting-type">Meeting Type:</Label>
                <Select value={scheduleForm.type} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Initial Consultation</SelectItem>
                    <SelectItem value="discovery">Discovery Call</SelectItem>
                    <SelectItem value="demo">Product Demo</SelectItem>
                    <SelectItem value="proposal">Proposal Review</SelectItem>
                    <SelectItem value="follow_up">Follow-up Call</SelectItem>
                    <SelectItem value="closing">Closing Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="schedule-notes">Notes:</Label>
                <Textarea
                  id="schedule-notes"
                  placeholder="Additional notes for the appointment..."
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleAppointment} className="bg-orange-600 hover:bg-orange-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Contact Modal */}
      <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Contact
              <div className="ml-auto flex items-center gap-3">
                <img 
                  src="/generated-icon.png" 
                  alt="Traffik Boosters" 
                  className="h-8 w-8"
                />
                <div className="text-right">
                  <div className="text-sm font-semibold text-black">Starz</div>
                  <div className="text-xs text-black">More Traffik! More Sales!</div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="www.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="CEO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isDemo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Demo Data
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Check this if this is demonstration/sample data rather than a real customer inquiry
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this contact..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddContactModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addContactMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Contact Details Modal */}
      <ContactDetailsModal
        contact={selectedContactForDetails}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      {/* Lead Allocation Modal */}
      <Dialog open={isLeadAllocationModalOpen} onOpenChange={setIsLeadAllocationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Allocate Leads to Sales Representatives
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Sales Rep Selection */}
            <div>
              <Label htmlFor="sales-rep-select">Assign to Sales Representative:</Label>
              <Select value={selectedSalesRep} onValueChange={setSelectedSalesRep}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a sales representative..." />
                </SelectTrigger>
                <SelectContent>
                  {salesReps.filter(rep => rep.role !== 'admin').map((rep) => (
                    <SelectItem key={rep.id} value={rep.id.toString()}>
                      {rep.firstName} {rep.lastName} - {rep.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lead Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Select Leads to Allocate ({selectedLeadsForAllocation.length} selected):</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLeadsForAllocation(filteredContacts.map(c => c.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLeadsForAllocation([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <div className="grid gap-2 p-4">
                  {filteredContacts.map((contact) => {
                    const ageStatus = getLeadAgeStatus(contact.createdAt);
                    const isSelected = selectedLeadsForAllocation.includes(contact.id);
                    
                    return (
                      <div
                        key={contact.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border ${
                          isSelected ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                        } hover:bg-gray-50 cursor-pointer`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLeadsForAllocation(prev => prev.filter(id => id !== contact.id));
                          } else {
                            setSelectedLeadsForAllocation(prev => [...prev, contact.id]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}} // Handled by parent onClick
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {contact.company || `${contact.firstName} ${contact.lastName}`}
                            </span>
                            <Badge 
                              className={`text-xs ${ageStatus.animation}`}
                              style={{ backgroundColor: ageStatus.badgeColor }}
                            >
                              {ageStatus.description}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatPhoneNumber(contact.phone)} • {contact.email}
                          </div>
                          {contact.assignedTo && (
                            <div className="text-xs text-blue-600 mt-1">
                              Currently assigned to: {salesReps.find(rep => rep.id === contact.assignedTo)?.firstName} {salesReps.find(rep => rep.id === contact.assignedTo)?.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLeadAllocationModalOpen(false);
                  setSelectedLeadsForAllocation([]);
                  setSelectedSalesRep("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!selectedSalesRep || selectedLeadsForAllocation.length === 0 || allocateLeadsMutation.isPending}
                onClick={() => {
                  if (selectedSalesRep && selectedLeadsForAllocation.length > 0) {
                    allocateLeadsMutation.mutate({
                      leadIds: selectedLeadsForAllocation,
                      salesRepId: parseInt(selectedSalesRep)
                    });
                  }
                }}
              >
                {allocateLeadsMutation.isPending ? "Allocating..." : `Allocate ${selectedLeadsForAllocation.length} Leads`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Sales Tip Generator Modal - Fixed Implementation */}
      {isAITipGeneratorOpen && selectedContact && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold">AI Sales Tips</h2>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={traffikBoostersLogo}
                    alt="Traffik Boosters" 
                    className="h-8 w-8"
                  />
                  <div className="text-right">
                    <div className="text-sm font-semibold text-black">AI Sales Intelligence</div>
                    <div className="text-xs text-black">More Traffik! More Sales!</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAITipGeneratorOpen(false);
                      setSelectedContact(null);
                      setCurrentAction(undefined);
                    }}
                    className="ml-2"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              <AISalesTipGenerator
                contact={selectedContact}
                currentAction={currentAction}
                isOpen={isAITipGeneratorOpen}
                onClose={() => {
                  setIsAITipGeneratorOpen(false);
                  setSelectedContact(null);
                  setCurrentAction(undefined);
                }}
                onApplyTip={(tipId) => {
                  toast({
                    title: "Sales Tip Applied",
                    description: `AI tip ${tipId} has been applied to your sales approach.`,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* STARZ POWERDIALS Dialer Modal */}
      <Dialog open={showSTARZDialer} onOpenChange={setShowSTARZDialer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              STARZ POWERDIALS Dialer
              <div className="ml-auto flex items-center gap-3">
                <img 
                  src={traffikBoostersLogo}
                  alt="Traffik Boosters" 
                  className="h-8 w-8"
                />
                <div className="text-right">
                  <div className="text-sm font-semibold text-black">STARZ</div>
                  <div className="text-xs text-black">More Traffik! More Sales!</div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <STARZPOWERDIALSDialer
              contact={{
                firstName: selectedContact.firstName,
                lastName: selectedContact.lastName,
                phone: selectedContact.phone || ""
              }}
              onCallEnd={() => {
                setShowSTARZDialer(false);
                setSelectedContact(null);
                toast({
                  title: "Call Completed",
                  description: "STARZ dialer session ended",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Technical Proposal Modal - Fixed Overlapping Issue */}
      {isTechnicalProposalModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">Send to Technical Team</h2>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={traffikBoostersLogo}
                    alt="Traffik Boosters" 
                    className="h-8 w-8"
                  />
                  <div className="text-right">
                    <div className="text-sm font-semibold text-black">Technical Portal</div>
                    <div className="text-xs text-black">More Traffik! More Sales!</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTechnicalProposalModalOpen(false)}
                    className="ml-2"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {selectedContact && (
                <TechnicalProposalForm
                  contact={selectedContact}
                  currentUser={currentUser as any}
                  technicians={allUsers.filter(user => user.department === 'technical' || user.role === 'admin')}
                  onSubmit={async (proposalData) => {
                    try {
                      const response = await apiRequest('POST', '/api/technical-proposals', {
                        ...proposalData,
                        contactId: selectedContact.id,
                        assignedSalesRep: currentUser?.id,
                        requestedBy: currentUser?.id,
                        status: 'pending'
                      });
                      
                      toast({
                        title: "Proposal Request Sent!",
                        description: `Technical proposal request sent for ${selectedContact.firstName} ${selectedContact.lastName}`,
                      });
                      
                      setIsTechnicalProposalModalOpen(false);
                      queryClient.invalidateQueries({ queryKey: ["/api/technical-proposals"] });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to send technical proposal request",
                        variant: "destructive",
                      });
                    }
                  }}
                  onCancel={() => setIsTechnicalProposalModalOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}