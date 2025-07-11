import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ContactDetailsModal from "./contact-details-modal";
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MoreHorizontal, 
  Filter, 
  MessageCircle,
  Eye,
  Star,
  AlertCircle,
  DollarSign,
  Clock,
  Globe,
  FileText,
  User,
  Users,
  Calendar,
  CalendarPlus,
  Calculator,
  ChevronDown,
  Send,
  Inbox,
  MailOpen,
  CreditCard,
  ExternalLink,
  Briefcase,
  X
} from "lucide-react";
import ChatWidget from "./chat-widget";
import WebsiteFormIntegration from "./website-form-integration";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPhoneNumber } from "@/lib/utils";
import ClickToCallButton from "@/components/click-to-call-button";
import { authService } from "@/lib/auth";
import type { Contact } from "@shared/schema";

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
  scheduleAppointment: z.boolean().optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  appointmentType: z.string().optional(),
  appointmentNotes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Service pricing data for sales reps
const servicePricing = [
  {
    category: "SEO & Digital Marketing",
    services: [
      { name: "Local SEO Package", price: 1200, timeframe: "3-6 months" },
      { name: "Google My Business Optimization", price: 450, timeframe: "2-4 weeks" },
      { name: "Website SEO Audit", price: 275, timeframe: "1-2 weeks" },
      { name: "Social Media Management", price: 1500, timeframe: "Monthly" }
    ]
  },
  {
    category: "Web Development",
    services: [
      { name: "Business Website (5-10 pages)", price: 3500, timeframe: "4-6 weeks" },
      { name: "E-commerce Website", price: 5500, timeframe: "6-8 weeks" },
      { name: "Website Redesign", price: 2800, timeframe: "3-5 weeks" },
      { name: "Mobile App Development", price: 8500, timeframe: "8-12 weeks" }
    ]
  },
  {
    category: "PPC Advertising",
    services: [
      { name: "Google Ads Setup & Management", price: 1800, timeframe: "Monthly" },
      { name: "Facebook Ads Campaign", price: 1200, timeframe: "Monthly" },
      { name: "PPC Audit & Optimization", price: 650, timeframe: "2-3 weeks" },
      { name: "Landing Page Creation", price: 850, timeframe: "1-2 weeks" }
    ]
  },
  {
    category: "Content & Branding",
    services: [
      { name: "Content Marketing Strategy", price: 2200, timeframe: "Monthly" },
      { name: "Logo & Brand Identity", price: 1100, timeframe: "2-3 weeks" },
      { name: "Video Production", price: 3200, timeframe: "3-4 weeks" },
      { name: "Copywriting Services", price: 800, timeframe: "1-2 weeks" }
    ]
  }
];

export default function CRMView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<Contact | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("contacts");
  
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();
  const isManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const { data: contacts = [], isLoading, error } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const queryClient = useQueryClient();

  // Debug logging
  console.log("Total contacts loaded:", contacts.length);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      leadSource: "manual",
      leadStatus: "new",
      priority: "medium",
      notes: "",
      scheduleAppointment: false,
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "consultation",
      appointmentNotes: "",
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/contacts/${data.id}`, {
        leadStatus: data.status
      });
      if (!response.ok) {
        throw new Error('Failed to update contact');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
  });

  const reassignContactMutation = useMutation({
    mutationFn: async (data: { contactId: number; assignedTo: number }) => {
      const response = await apiRequest("PATCH", `/api/contacts/${data.contactId}`, {
        assignedTo: data.assignedTo
      });
      if (!response.ok) {
        throw new Error('Failed to reassign contact');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact reassigned",
        description: "Contact has been successfully assigned to new sales rep.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reassign contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      // Create the contact first
      const contactResponse = await apiRequest("POST", "/api/contacts", {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        position: data.position || null,
        leadSource: data.leadSource || null,
        leadStatus: data.leadStatus || null,
        priority: data.priority || "medium",
        notes: data.notes || null,
      });
      
      if (!contactResponse.ok) {
        throw new Error('Failed to create contact');
      }
      
      const contact = await contactResponse.json();
      
      // If appointment scheduling is enabled, create the event
      if (data.scheduleAppointment && data.appointmentDate && data.appointmentTime) {
        const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
        const endDateTime = new Date(appointmentDateTime.getTime() + (60 * 60 * 1000)); // 1 hour duration
        
        const eventResponse = await apiRequest("POST", "/api/events", {
          title: `${data.appointmentType || 'Meeting'} with ${data.firstName} ${data.lastName}`,
          description: data.appointmentNotes || `Scheduled ${data.appointmentType || 'meeting'} with ${data.firstName} ${data.lastName} from ${data.company || 'N/A'}`,
          startTime: appointmentDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          location: "Phone/Video Call",
          attendees: data.email ? [data.email] : [],
          contactId: contact.id,
          type: "appointment",
          status: "scheduled"
        });
        
        if (!eventResponse.ok) {
          console.warn('Contact created but failed to schedule appointment');
        }
      }
      
      return contact;
    },
    onSuccess: (contact, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsAddContactModalOpen(false);
      form.reset();
      
      const appointmentMessage = variables.scheduleAppointment && variables.appointmentDate && variables.appointmentTime
        ? ` Appointment scheduled for ${new Date(`${variables.appointmentDate}T${variables.appointmentTime}`).toLocaleDateString()} at ${new Date(`${variables.appointmentDate}T${variables.appointmentTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`
        : '';
      
      toast({
        title: "Contact created successfully",
        description: `${contact.firstName} ${contact.lastName} has been added to your CRM.${appointmentMessage}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    createContactMutation.mutate(data);
  };

  const getContactInitials = (contact: Contact) => {
    return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "qualified": return "bg-purple-100 text-purple-800";
      case "proposal": return "bg-orange-100 text-orange-800";
      case "closed_won": return "bg-green-100 text-green-800";
      case "closed_lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLeadAgeAlert = (contact: Contact) => {
    const now = new Date();
    const createdAt = new Date(contact.createdAt);
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff <= 2) {
      // New leads (within 2 hours) - Green flash
      return {
        alertClass: "animate-pulse-green",
        badgeText: "NEW",
        badgeColor: "bg-green-500 text-white"
      };
    } else if (hoursDiff <= 24) {
      // 24-hour old leads - Yellow flash
      return {
        alertClass: "animate-pulse-yellow",
        badgeText: "24H",
        badgeColor: "bg-yellow-500 text-white"
      };
    } else if (hoursDiff <= 72) {
      // 3-day old leads - Red flash
      return {
        alertClass: "animate-pulse-red",
        badgeText: "3D",
        badgeColor: "bg-red-500 text-white"
      };
    }
    
    return null;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === "" || 
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contact.leadStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading contacts</p>
          <p className="text-sm text-gray-600">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* CRM Header */}
      <div className="bg-white border-b border-neutral-lighter px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-neutral-dark">CRM</h2>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {filteredContacts.length} of {contacts.length} contacts
            </Badge>
            {filteredContacts.length !== contacts.length && (
              <Badge variant="outline" className="text-xs text-blue-600">
                Filtered
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-light" />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="closed_won">Closed Won</SelectItem>
                <SelectItem value="closed_lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>

            {/* View All Button */}
            {(searchQuery || statusFilter !== "all") && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  toast({
                    title: "Filters Cleared",
                    description: `Showing all ${contacts.length} contacts`,
                  });
                }}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All ({contacts.length})
              </Button>
            )}
            
            {/* Add Contact */}
            <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-primary text-white hover:bg-brand-secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>
                    Create a new contact in your CRM system.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john@company.com" type="email" {...field} />
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
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
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
                    
                    <div className={`grid gap-4 ${isManagement ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {/* Lead Source - Management Only */}
                      {isManagement && (
                        <FormField
                          control={form.control}
                          name="leadSource"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lead Source</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select source" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="manual">Manual Entry</SelectItem>
                                    <SelectItem value="website">Website</SelectItem>
                                    <SelectItem value="referral">Referral</SelectItem>
                                    <SelectItem value="social_media">Social Media</SelectItem>
                                    <SelectItem value="google_ads">Google Ads</SelectItem>
                                    <SelectItem value="yelp">Yelp</SelectItem>
                                    <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="leadStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Status</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="qualified">Qualified</SelectItem>
                                  <SelectItem value="proposal">Proposal</SelectItem>
                                  <SelectItem value="closed_won">Closed Won</SelectItem>
                                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
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
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Schedule Appointment Section */}
                    <div className="border-t pt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="scheduleAppointment"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base flex items-center gap-2">
                                <CalendarPlus className="h-4 w-4 text-brand-primary" />
                                Schedule Appointment
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Book a meeting with this contact immediately after creating them
                              </div>
                            </div>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-primary focus:ring-2"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("scheduleAppointment") && (
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-200">
                          <div className="flex items-center gap-2 text-blue-800">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Appointment Details</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="appointmentDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      {...field} 
                                      min={new Date().toISOString().split('T')[0]}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="appointmentTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Time</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="09:00">9:00 AM</SelectItem>
                                        <SelectItem value="09:30">9:30 AM</SelectItem>
                                        <SelectItem value="10:00">10:00 AM</SelectItem>
                                        <SelectItem value="10:30">10:30 AM</SelectItem>
                                        <SelectItem value="11:00">11:00 AM</SelectItem>
                                        <SelectItem value="11:30">11:30 AM</SelectItem>
                                        <SelectItem value="12:00">12:00 PM</SelectItem>
                                        <SelectItem value="12:30">12:30 PM</SelectItem>
                                        <SelectItem value="13:00">1:00 PM</SelectItem>
                                        <SelectItem value="13:30">1:30 PM</SelectItem>
                                        <SelectItem value="14:00">2:00 PM</SelectItem>
                                        <SelectItem value="14:30">2:30 PM</SelectItem>
                                        <SelectItem value="15:00">3:00 PM</SelectItem>
                                        <SelectItem value="15:30">3:30 PM</SelectItem>
                                        <SelectItem value="16:00">4:00 PM</SelectItem>
                                        <SelectItem value="16:30">4:30 PM</SelectItem>
                                        <SelectItem value="17:00">5:00 PM</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="appointmentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meeting Type</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select meeting type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="consultation">Initial Consultation</SelectItem>
                                      <SelectItem value="discovery">Discovery Call</SelectItem>
                                      <SelectItem value="demo">Product Demo</SelectItem>
                                      <SelectItem value="proposal">Proposal Presentation</SelectItem>
                                      <SelectItem value="follow_up">Follow-up Meeting</SelectItem>
                                      <SelectItem value="closing">Closing Call</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="appointmentNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meeting Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Agenda, preparation notes, or special requirements..."
                                    className="min-h-[60px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddContactModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createContactMutation.isPending}
                        className="bg-brand-primary text-white hover:bg-brand-secondary"
                      >
                        {createContactMutation.isPending ? "Creating..." : "Create Contact"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* CRM Content */}
      <div className="flex-1 bg-neutral-lightest p-3 md:p-6">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-medium text-lg mb-4">
              {searchQuery || statusFilter !== "all" ? "No contacts match your filters" : "No contacts yet"}
            </p>
            <Button 
              className="bg-brand-primary text-white hover:bg-brand-secondary"
              onClick={() => setIsAddContactModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {filteredContacts.map((contact) => {
              const ageAlert = getLeadAgeAlert(contact);
              return (
                <Card 
                  key={contact.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer relative ${ageAlert ? ageAlert.alertClass : ''}`}
                  onClick={() => {
                    setSelectedContactForDetails(contact);
                    setIsDetailsModalOpen(true);
                  }}
                >
                <CardHeader className="pb-2 p-3 relative">
                  {/* Age Alert Badge */}
                  {ageAlert && (
                    <div className="absolute top-1 right-1 z-10">
                      <Badge className={`text-xs px-1.5 py-0.5 ${ageAlert.badgeColor} animate-pulse`}>
                        {ageAlert.badgeText}
                      </Badge>
                    </div>
                  )}
                  <div className="space-y-1">
                    {/* Company Name - Primary Display */}
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-semibold text-neutral-dark truncate leading-tight">
                        {contact.company || `${contact.firstName} ${contact.lastName}`}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Add to Campaign</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Phone Number - Secondary Display */}
                    {contact.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-neutral-medium flex-shrink-0" />
                        <span className="text-sm text-neutral-medium truncate">
                          {formatPhoneNumber(contact.phone)}
                        </span>
                      </div>
                    )}
                    
                    {/* Status Badge - Minimal */}
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs px-1.5 py-0.5 ${getStatusColor(contact.leadStatus || "new")}`}>
                        {contact.leadStatus?.replace("_", " ") || "new"}
                      </Badge>
                      <div className="text-xs text-neutral-light">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  {/* Compact Action Buttons - 3 columns only */}
                  <div className="grid grid-cols-3 gap-1">
                    {/* Phone Button */}
                    {contact.phone ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs flex items-center justify-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!contact.phone) return;
                          try {
                            const response = await apiRequest("POST", "/api/powerdials/call", {
                              phoneNumber: contact.phone,
                              contactName: `${contact.firstName} ${contact.lastName}`
                            });
                            const result = await response.json();
                            if (result.success) {
                              toast({
                                title: "Call Prepared",
                                description: `Ready to call ${contact.company || contact.firstName}`,
                              });
                              window.open(`tel:${contact.phone.replace(/\D/g, '')}`, '_self');
                            }
                          } catch (error) {
                            toast({
                              title: "Call Failed",
                              description: "Unable to initiate call",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled
                        className="h-8 text-xs flex items-center justify-center p-1 opacity-50"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}

                    {/* Email Button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs flex items-center justify-center p-1 text-green-600 hover:text-green-800 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (contact.email) {
                          window.open(`mailto:${contact.email}`, '_blank');
                        }
                      }}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>

                    {/* Details Button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs flex items-center justify-center p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContactForDetails(contact);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Contact
              {/* Traffik Boosters Logo in Modal Header */}
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
                {/* Basic Information */}
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
                <FormField
                  control={form.control}
                  name="leadSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="email_campaign">Email Campaign</SelectItem>
                          <SelectItem value="phone_call">Phone Call</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leadStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                          <SelectItem value="callback">Callback Scheduled</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Appointment Scheduling Section */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Schedule Appointment (Optional)</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="scheduleAppointment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Schedule an appointment with this contact
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("scheduleAppointment") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="appointmentTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="meetingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select meeting type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="consultation">Initial Consultation</SelectItem>
                              <SelectItem value="discovery">Discovery Call</SelectItem>
                              <SelectItem value="demo">Product Demo</SelectItem>
                              <SelectItem value="proposal">Proposal Review</SelectItem>
                              <SelectItem value="follow_up">Follow-up Call</SelectItem>
                              <SelectItem value="closing">Closing Meeting</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
              {/* Traffik Boosters Logo in Modal Header */}
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
                    {currentUser?.role === 'admin' || currentUser?.role === 'manager' ? (
                      <p><span className="font-medium">Source:</span> {selectedContactForDetails.leadSource?.replace('_', ' ').toUpperCase() || 'N/A'}</p>
                    ) : null}
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
    </div>
  );
}ame}'s Business`}%0D%0ADate: ${new Date().toLocaleDateString()}%0D%0A%0D%0ASEO SERVICES INCLUDED:%0D%0A✓ Keyword Research & Strategy%0D%0A✓ On-Page SEO Optimization%0D%0A✓ Google My Business Setup%0D%0A✓ Local Citation Building%0D%0A✓ Monthly Progress Reports%0D%0A%0D%0ATimeline: 30-60 days for initial results%0D%0AInvestment: $1,200/month%0D%0ASetup Fee: $450 (one-time)%0D%0A%0D%0ARefund Policy: 3-day full refund, 50% thereafter%0D%0A%0D%0AYour Sales Representative:%0D%0A${currentUser?.firstName} ${currentUser?.lastName}%0D%0A${currentUser?.email}%0D%0A(877) 840-6250%0D%0A%0D%0AClient Signature: _________________ Date: _______`;
                                  window.location.href = `mailto:${contact.email}?subject=SEO Work Order Agreement&body=${seoWorkOrder}`;
                                  toast({
                                    title: "SEO Work Order Ready",
                                    description: `SEO agreement prepared for ${contact.firstName}`,
                                  });
                                }}
                              >
                                SEO Package
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-xs h-8 bg-amber-100 hover:bg-amber-200"
                                onClick={() => {
                                  const webWorkOrder = `WEBSITE WORK ORDER AGREEMENT%0D%0A%0D%0A━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0D%0A   TRAFFIK BOOSTERS - More Traffik! More Sales!%0D%0A━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0D%0A%0D%0AClient: ${contact.firstName} ${contact.lastName}%0D%0ACompany: ${contact.company || `${contact.firstName}'s Business`}%0D%0ADate: ${new Date().toLocaleDateString()}%0D%0A%0D%0AWEBSITE SERVICES INCLUDED:%0D%0A✓ Custom Website Design%0D%0A✓ Mobile-Responsive Layout%0D%0A✓ SEO-Optimized Content%0D%0A✓ Contact Forms & Lead Capture%0D%0A✓ Social Media Integration%0D%0A%0D%0ATimeline: 14-21 business days%0D%0AInvestment: $2,500 (one-time)%0D%0ADeposit: $1,250 (50% upfront)%0D%0A%0D%0ARefund Policy: 3-day full refund, 50% thereafter%0D%0A%0D%0AYour Sales Representative:%0D%0A${currentUser?.firstName} ${currentUser?.lastName}%0D%0A${currentUser?.email}%0D%0A(877) 840-6250%0D%0A%0D%0AClient Signature: _________________ Date: _______`;
                                  window.location.href = `mailto:${contact.email}?subject=Website Work Order Agreement&body=${webWorkOrder}`;
                                  toast({
                                    title: "Website Work Order Ready",
                                    description: `Website agreement prepared for ${contact.firstName}`,
                                  });
                                }}
                              >
                                Website Build
                              </Button>
                            </div>
                          </div>

                          {/* Quick Payment Amounts */}
                          <div className="p-3 border-b">
                            <div className="font-semibold text-sm text-gray-900 mb-2">Quick Payment Requests</div>
                            <div className="grid grid-cols-3 gap-2">
                              {[500, 1000, 2500].map((amount) => (
                                <Button 
                                  key={amount}
                                  size="sm" 
                                  variant="ghost"
                                  className="text-xs h-8 bg-green-50 hover:bg-green-100"
                                  onClick={() => {
                                    const paymentRequest = `Hi ${contact.firstName},%0D%0A%0D%0ATo proceed with your digital marketing services, please complete your payment of $${amount.toLocaleString()}.%0D%0A%0D%0APayment Link: [Secure Payment Portal]%0D%0A%0D%0AThanks!%0D%0A${currentUser?.firstName} ${currentUser?.lastName}%0D%0A${currentUser?.email}%0D%0ATraflik Boosters%0D%0A(877) 840-6250`;
                                    window.location.href = `mailto:${contact.email}?subject=Payment Request - $${amount.toLocaleString()}&body=${paymentRequest}`;
                                    toast({
                                      title: "Payment Request Sent",
                                      description: `$${amount.toLocaleString()} payment request opened`,
                                    });
                                  }}
                                >
                                  ${amount.toLocaleString()}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Service Packages with Payment Integration */}
                          <div className="p-3">
                            <div className="font-semibold text-sm text-gray-900 mb-2">Service Packages</div>
                            {servicePricing.slice(0, 2).map((category, categoryIndex) => (
                              <div key={categoryIndex} className="mb-3">
                                <div className="font-medium text-xs text-gray-700 mb-1">{category.category}</div>
                                {category.services.slice(0, 3).map((service, serviceIndex) => (
                                  <div 
                                    key={serviceIndex}
                                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    onClick={() => {
                                      const serviceProposal = `Hi ${contact.firstName},%0D%0A%0D%0AI'm excited to propose our ${service.name} package for your business.%0D%0A%0D%0AService: ${service.name}%0D%0ADelivery: ${service.timeframe}%0D%0AInvestment: $${service.price.toLocaleString()}%0D%0A%0D%0AThis service will help you achieve "More Traffik! More Sales!" Let's schedule a call to discuss details.%0D%0A%0D%0ABest regards,%0D%0A${currentUser?.firstName} ${currentUser?.lastName}%0D%0A${currentUser?.email}%0D%0ATraflik Boosters%0D%0A(877) 840-6250`;
                                      window.location.href = `mailto:${contact.email}?subject=${service.name} Proposal - $${service.price.toLocaleString()}&body=${serviceProposal}`;
                                      toast({
                                        title: "Service Proposal Sent",
                                        description: `${service.name} proposal email opened`,
                                      });
                                    }}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-xs">{service.name}</div>
                                      <div className="text-xs text-gray-500">{service.timeframe}</div>
                                    </div>
                                    <div className="text-xs font-bold text-green-600">
                                      ${service.price.toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Contact Details Modal */}
      {selectedContactForDetails && (
        <ContactDetailsModal
          contact={selectedContactForDetails}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedContactForDetails(null);
          }}
        />
      )}



      {/* Contact Details Modal */}
      <ContactDetailsModal
        contact={selectedContactForDetails}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedContactForDetails(null);
        }}
      />

      {/* Chat Widget Integration */}
      <ChatWidget />
    </div>
  );
}
