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
  MailOpen
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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailContact, setSelectedEmailContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState("contacts");
  
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();
  const isManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const { data: contacts = [], isLoading, error } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
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
                <CardHeader className="pb-2 p-3 md:pb-3 md:p-6">
                  {/* Age Alert Badge */}
                  {ageAlert && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className={`text-xs px-2 py-1 ${ageAlert.badgeColor} animate-pulse`}>
                        {ageAlert.badgeText}
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <Avatar className="w-8 h-8 md:w-12 md:h-12 flex-shrink-0">
                        <AvatarImage src={contact.avatar || ""} />
                        <AvatarFallback className="bg-brand-primary text-white font-medium text-xs md:text-sm">
                          {getContactInitials(contact)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm md:text-lg text-neutral-dark truncate">
                          {contact.firstName} {contact.lastName}
                        </CardTitle>
                        <p className="text-xs md:text-sm text-neutral-medium truncate">{contact.position}</p>
                        <p className="text-xs md:text-sm text-neutral-light truncate">{contact.company}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      {contact.email && (
                        <p className="text-sm text-neutral-medium flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </p>
                      )}
                      {contact.phone && (
                        <p className="text-sm text-neutral-medium flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {formatPhoneNumber(contact.phone)}
                        </p>
                      )}
                    </div>
                    
                    {/* Lead Status */}
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(contact.leadStatus || "new")}>
                        {contact.leadStatus?.replace("_", " ") || "new"}
                      </Badge>
                      <div className="text-xs text-neutral-light">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Notes Preview */}
                    {contact.notes && (
                      <p className="text-sm text-neutral-medium line-clamp-2 bg-gray-50 p-2 rounded text-xs">
                        "{contact.notes}"
                      </p>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-6 gap-1 pt-2 border-t">
                      {/* Phone Button */}
                      {contact.phone ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-full text-xs flex flex-col items-center justify-center p-1 text-blue-600 hover:text-blue-800"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!contact.phone) return;
                            try {
                              const response = await apiRequest("POST", "/api/mightycall/call", {
                                phoneNumber: contact.phone,
                                contactName: `${contact.firstName} ${contact.lastName}`
                              });
                              const result = await response.json();
                              if (result.success) {
                                toast({
                                  title: "Call Prepared",
                                  description: `Ready to call ${contact.firstName} ${contact.lastName}`,
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
                          <Phone className="h-3 w-3 mb-1" />
                          <span className="text-[10px]">Call</span>
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled
                          className="h-8 w-full text-xs flex flex-col items-center justify-center p-1 opacity-50"
                        >
                          <Phone className="h-3 w-3 mb-1" />
                          <span className="text-[10px]">Call</span>
                        </Button>
                      )}
                      
                      {/* Schedule Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-full text-xs flex flex-col items-center justify-center p-1 text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open scheduling modal - we'll implement this
                          toast({
                            title: "Schedule Meeting",
                            description: `Opening scheduler for ${contact.firstName} ${contact.lastName}`,
                          });
                        }}
                      >
                        <CalendarPlus className="h-3 w-3 mb-1" />
                        <span className="text-[10px]">Schedule</span>
                      </Button>
                      
                      {/* Email Button */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-full text-xs flex flex-col items-center justify-center p-1 text-green-600 hover:text-green-800"
                            onClick={(e) => e.stopPropagation()}
                            disabled={!contact.email}
                          >
                            <Mail className="h-3 w-3 mb-1" />
                            <span className="text-[10px]">Email</span>
                          </Button>
                        </DropdownMenuTrigger>
                        {contact.email && (
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedEmailContact(contact);
                                setIsEmailModalOpen(true);
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Compose Email
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                window.location.href = `mailto:${contact.email}`;
                              }}
                            >
                              <MailOpen className="h-4 w-4 mr-2" />
                              Open Email Client
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                if (contact.email) {
                                  navigator.clipboard.writeText(contact.email);
                                  toast({
                                    title: "Email Copied",
                                    description: `${contact.email} copied to clipboard`,
                                  });
                                }
                              }}
                            >
                              <Inbox className="h-4 w-4 mr-2" />
                              Copy Email Address
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        )}
                      </DropdownMenu>
                      
                      {/* Notes Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-full text-xs flex flex-col items-center justify-center p-1 text-purple-600 hover:text-purple-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContactForDetails(contact);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <FileText className="h-3 w-3 mb-1" />
                        <span className="text-[10px]">Notes</span>
                      </Button>
                      
                      {/* Disposition Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-full text-xs flex flex-col items-center justify-center p-1 text-orange-600 hover:text-orange-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContactForDetails(contact);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <User className="h-3 w-3 mb-1" />
                        <span className="text-[10px]">Status</span>
                      </Button>
                      
                      {/* Service Pricing Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-full text-xs flex flex-col items-center justify-center p-1 text-green-600 hover:text-green-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Calculator className="h-3 w-3 mb-1" />
                            <span className="text-[10px]">Pricing</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                          {servicePricing.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="p-2">
                              <div className="font-semibold text-sm text-gray-900 mb-2 border-b pb-1">
                                {category.category}
                              </div>
                              {category.services.map((service, serviceIndex) => (
                                <DropdownMenuItem 
                                  key={serviceIndex}
                                  className="cursor-pointer p-2 hover:bg-gray-50"
                                  onClick={() => {
                                    toast({
                                      title: "Service Selected",
                                      description: `${service.name} - $${service.price.toLocaleString()} (${service.timeframe})`,
                                    });
                                  }}
                                >
                                  <div className="flex justify-between items-start w-full">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{service.name}</div>
                                      <div className="text-xs text-gray-500">{service.timeframe}</div>
                                    </div>
                                    <div className="text-sm font-bold text-green-600">
                                      ${service.price.toLocaleString()}
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          ))}
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

      {/* Email Composer Modal */}
      {selectedEmailContact && (
        <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5" />
                  Email to {selectedEmailContact.firstName} {selectedEmailContact.lastName}
                </div>
                <div className="flex items-center gap-2">
                  <img 
                    src={traffikBoostersLogo} 
                    alt="Traffik Boosters" 
                    className="h-8 w-auto"
                  />
                  <div className="text-right">
                    <p className="text-sm font-medium text-black">More Traffik! More Sales!</p>
                    <p className="text-xs text-gray-600">Email Communication</p>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Email Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">To:</label>
                  <p className="text-sm font-semibold">{selectedEmailContact.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact:</label>
                  <p className="text-sm">{selectedEmailContact.firstName} {selectedEmailContact.lastName}</p>
                  {selectedEmailContact.company && (
                    <p className="text-xs text-gray-600">{selectedEmailContact.company}</p>
                  )}
                </div>
              </div>

              {/* Email Templates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Email Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    {
                      name: "Initial Follow-up",
                      subject: "Following up on your inquiry",
                      preview: "Thank you for your interest in our services...",
                      template: `Hi ${selectedEmailContact.firstName},\n\nThank you for your interest in our digital marketing services. I wanted to follow up and see if you have any questions about how we can help grow your business.\n\nOur team specializes in:\n• Local SEO optimization\n• Google My Business management\n• Website development\n• Social media marketing\n\nWould you be available for a brief 15-minute call this week to discuss your specific needs?\n\nBest regards,\n${currentUser?.username || 'Sales Team'}\nTraflik Boosters\n(877) 840-6250`
                    },
                    {
                      name: "Service Proposal",
                      subject: "Digital Marketing Proposal for " + (selectedEmailContact.company || selectedEmailContact.firstName),
                      preview: "Attached is our comprehensive proposal...",
                      template: `Hi ${selectedEmailContact.firstName},\n\nThank you for taking the time to discuss your digital marketing needs. Based on our conversation, I've prepared a customized proposal that addresses your specific goals.\n\nOur recommended strategy includes:\n• Local SEO package - $1,200/month\n• Google My Business optimization - $450 one-time\n• Website audit and optimization - $275\n\nThis comprehensive approach will help you achieve "More Traffik! More Sales!" for your business.\n\nI'm available to discuss any questions you may have. When would be a good time for a follow-up call?\n\nBest regards,\n${currentUser?.username || 'Sales Team'}\nTraflik Boosters\n(877) 840-6250`
                    },
                    {
                      name: "Check-in",
                      subject: "Checking in - Any questions?",
                      preview: "Just wanted to check in and see how everything is going...",
                      template: `Hi ${selectedEmailContact.firstName},\n\nI hope this email finds you well. I wanted to check in and see if you have any questions about our digital marketing services.\n\nSince we last spoke, we've helped several businesses like yours increase their online visibility and generate more leads. I'd love to share some recent success stories with you.\n\nAre you still interested in exploring how we can help grow your business? I'm happy to schedule a quick call at your convenience.\n\nBest regards,\n${currentUser?.username || 'Sales Team'}\nTraflik Boosters\n(877) 840-6250`
                    }
                  ].map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{template.preview}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-3 w-full"
                          onClick={() => {
                            const subject = encodeURIComponent(template.subject);
                            const body = encodeURIComponent(template.template);
                            window.location.href = `mailto:${selectedEmailContact.email}?subject=${subject}&body=${body}`;
                            
                            toast({
                              title: "Email Template Opened",
                              description: `${template.name} template opened in your email client`,
                            });
                            
                            setIsEmailModalOpen(false);
                          }}
                        >
                          <Send className="h-3 w-3 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    window.location.href = `mailto:${selectedEmailContact.email}`;
                    toast({
                      title: "Email Client Opened",
                      description: `Compose email to ${selectedEmailContact.firstName} ${selectedEmailContact.lastName}`,
                    });
                    setIsEmailModalOpen(false);
                  }}
                >
                  <MailOpen className="h-4 w-4 mr-2" />
                  Open Email Client
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const email = selectedEmailContact.email;
                    if (email) {
                      navigator.clipboard.writeText(email);
                      toast({
                        title: "Email Copied",
                        description: `${email} copied to clipboard`,
                      });
                    }
                  }}
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  Copy Email
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsEmailModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Chat Widget Integration */}
      <ChatWidget />
    </div>
  );
}
