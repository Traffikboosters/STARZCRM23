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
  User
} from "lucide-react";
import ChatWidget from "./chat-widget";
import WebsiteFormIntegration from "./website-form-integration";
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
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function CRMView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<Contact | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");
  
  const { toast } = useToast();

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
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contacts", {
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
      
      if (!response.ok) {
        throw new Error('Failed to create contact');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setIsAddContactModalOpen(false);
      form.reset();
      toast({
        title: "Contact created",
        description: "New contact has been added to your CRM.",
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
                    
                    <div className="grid grid-cols-3 gap-4">
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
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(contact.leadStatus || "new")}>
                        {contact.leadStatus?.replace("_", " ") || "new"}
                      </Badge>
                      <div className="flex space-x-2">
                        {contact.phone && (
                          <ClickToCallButton 
                            phoneNumber={contact.phone} 
                            contactName={`${contact.firstName} ${contact.lastName}`}
                            variant="ghost"
                            size="sm"
                          />
                        )}
                        {contact.email && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-brand-primary hover:text-brand-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `mailto:${contact.email}`;
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {contact.email && (
                      <p className="text-sm text-neutral-medium">{contact.email}</p>
                    )}
                    {contact.phone && (
                      <p className="text-sm text-neutral-medium">{formatPhoneNumber(contact.phone)}</p>
                    )}
                    
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {contact.notes && (
                      <p className="text-sm text-neutral-medium line-clamp-2">
                        {contact.notes}
                      </p>
                    )}
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

      {/* Chat Widget Integration */}
      <ChatWidget />
    </div>
  );
}
