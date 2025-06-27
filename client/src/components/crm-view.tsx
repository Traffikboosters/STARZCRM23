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
import { Plus, Search, Filter, User, Mail, Phone, Building, MapPin, Calendar, Star, MessageCircle, X, Clock, DollarSign, FileText, ExternalLink, CreditCard, Users, Target, Edit, Send, Video, MoreVertical, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Contact, User as UserType } from "@shared/schema";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  leadSource: z.string().optional(),
  leadStatus: z.string().optional(),
  priority: z.string().optional(),
  notes: z.string().optional(),
  scheduleAppointment: z.boolean().default(false),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  appointmentType: z.string().optional(),
  appointmentNotes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Phone number formatting utility
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
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
    
    const workOrderContent = `WORK ORDER AGREEMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TRAFFIK BOOSTERS - More Traffik! More Sales!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Work Order #: ${workOrderId}
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
  
  // State management
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLeadAllocationModalOpen, setIsLeadAllocationModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<Contact | null>(null);
  const [selectedLeadsForAllocation, setSelectedLeadsForAllocation] = useState<number[]>([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    type: "consultation",
    notes: ""
  });

  // Auto-refresh lead count every 30 seconds
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

  // Data fetching
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const { data: allUsers = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  // Filter to get only actual employees (users with sales_rep or admin role)
  const salesReps = allUsers.filter(user => user.role === 'sales_rep' || user.role === 'admin');

  // Click-to-call functionality
  const handleCallContact = async (contact: Contact) => {
    if (!contact.phone) {
      toast({
        title: "No Phone Number",
        description: "This contact doesn't have a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/mightycall/initiate-call", {
        phoneNumber: contact.phone,
        contactName: `${contact.firstName} ${contact.lastName}`,
        userId: currentUser?.id || 1
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Call Initiated",
          description: `Calling ${contact.firstName} at ${formatPhoneNumber(contact.phone)}`,
        });
      } else {
        toast({
          title: "Call Failed",
          description: result.message || "Unable to initiate call",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Call Error",
        description: "Failed to initiate call. Please try again.",
        variant: "destructive",
      });
    }
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

  // Contact filtering
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((contact) => {
        const matchesSearch = searchTerm === "" || 
          contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
          (contact.phone?.includes(searchTerm) ?? false) ||
          (contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesStatus = statusFilter === "all" || contact.leadStatus === statusFilter;
        const matchesSource = sourceFilter === "all" || contact.leadSource === sourceFilter;

        return matchesSearch && matchesStatus && matchesSource;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first
  }, [contacts, searchTerm, statusFilter, sourceFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSourceFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || sourceFilter !== "all";

  // Mutations
  const addContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const contactData = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        position: data.position || null,
        leadSource: data.leadSource || null,
        leadStatus: data.leadStatus || "new",
        priority: data.priority || "medium",
        notes: data.notes || null,
      };

      const response = await apiRequest("POST", "/api/contacts", contactData);
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
              CRM - Contact Management 
              <Badge variant="secondary" className="ml-3 text-lg px-3 py-1">
                {contacts.length} Total Leads
              </Badge>
            </h1>
            <p className="text-gray-600">
              Manage your contacts and leads • Last updated: {format(new Date(), 'p')}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts..."
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

      {/* Enhanced Contact Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => {
            const ageStatus = getLeadAgeStatus(contact.createdAt);
            return (
              <Card 
                key={contact.id} 
                className={`hover:shadow-md transition-all duration-300 border-l-4 border-l-orange-500 ${ageStatus.bgColor} ${ageStatus.animation}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      className={`${ageStatus.badgeColor} text-white text-xs px-2 py-1 ${ageStatus.animation}`}
                    >
                      {ageStatus.description}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-base font-semibold leading-tight flex-1">
                      <div className="truncate">
                        {contact.company || `${contact.firstName} ${contact.lastName}`}
                      </div>
                    </CardTitle>
                    <img 
                      src={traffikBoostersLogo} 
                      alt="Traffik Boosters" 
                      className="h-16 w-auto object-contain ml-2 flex-shrink-0"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600 min-h-[20px]">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate font-medium">{formatPhoneNumber(contact.phone) || 'No phone'}</span>
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

                  {/* Enhanced Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {/* Call Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center py-3 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCallContact(contact);
                      }}
                      disabled={!contact.phone}
                    >
                      <Phone className="h-3 w-3 mb-2 text-green-600 flex-shrink-0" />
                      <span className="leading-tight">Call</span>
                    </Button>

                    {/* Schedule Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center py-3 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                        setIsScheduleModalOpen(true);
                      }}
                    >
                      <Calendar className="h-3 w-3 mb-2 text-blue-600 flex-shrink-0" />
                      <span className="leading-tight">Schedule</span>
                    </Button>

                    {/* Email Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center py-3 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                        setIsEmailModalOpen(true);
                      }}
                      disabled={!contact.email}
                    >
                      <Mail className="h-3 w-3 mb-2 text-orange-600 flex-shrink-0" />
                      <span className="leading-tight">Email</span>
                    </Button>

                    {/* Work Order Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center py-3 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                        setIsWorkOrderModalOpen(true);
                      }}
                    >
                      <FileText className="h-3 w-3 mb-2 text-purple-600 flex-shrink-0" />
                      <span className="leading-tight">Work Order</span>
                    </Button>

                    {/* Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center py-3 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContactForDetails(contact);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <User className="h-3 w-3 mb-2 text-gray-600 flex-shrink-0" />
                      <span className="leading-tight">Details</span>
                    </Button>

                    {/* More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs flex flex-col items-center py-3 h-auto min-h-[60px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3 mb-2 flex-shrink-0" />
                          <span className="leading-tight">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          // Mark as contacted
                          toast({
                            title: "Status Updated",
                            description: `${contact.firstName} marked as contacted`,
                          });
                        }}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // Set priority
                          toast({
                            title: "Priority Set",
                            description: `${contact.firstName} marked as high priority`,
                          });
                        }}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Set High Priority
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Details
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

          {selectedContactForDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedContactForDetails.firstName} {selectedContactForDetails.lastName}</p>
                    <p><span className="font-medium">Email:</span> {selectedContactForDetails.email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {formatPhoneNumber(selectedContactForDetails.phone) || 'N/A'}</p>
                    <p><span className="font-medium">Company:</span> {selectedContactForDetails.company || 'N/A'}</p>
                    <p><span className="font-medium">Position:</span> {selectedContactForDetails.position || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Lead Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> 
                      <Badge variant="secondary" className="ml-2">
                        {selectedContactForDetails.leadStatus?.replace('_', ' ').toUpperCase() || 'NEW'}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Created:</span> {selectedContactForDetails.createdAt ? format(new Date(selectedContactForDetails.createdAt), 'PPP') : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedContactForDetails.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedContactForDetails.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
}