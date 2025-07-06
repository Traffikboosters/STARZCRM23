import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, Search, Phone, Mail, Calendar, Star, DollarSign, 
  User, Clock, CheckCircle, Briefcase, StickyNote, 
  Zap, Bot, ClipboardList, FileUp, ExternalLink,
  Eye, Users
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

import { apiRequest } from "@/lib/queryClient";
import { authService } from "@/lib/auth";
import type { Contact } from "@shared/schema";
import { AISalesTipGenerator } from "./ai-sales-tip-generator";
import { formatPhoneNumber } from "@/lib/utils";

// Import Traffik Boosters logo
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

export default function CRMView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // User authentication and role checking
  const currentUser = authService.getCurrentUser();
  const isManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  
  // State management
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAITipGeneratorOpen, setIsAITipGeneratorOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentAction, setCurrentAction] = useState<'calling' | 'emailing' | 'scheduling' | 'qualifying' | 'closing' | undefined>(undefined);

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
    },
  });

  // Data fetching
  const { data: contactsResponse, isLoading } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: () => apiRequest("/api/contacts?limit=1000"),
    refetchInterval: 60000,
  });

  const contacts: Contact[] = useMemo(() => {
    if (contactsResponse?.contacts) {
      return contactsResponse.contacts;
    }
    if (Array.isArray(contactsResponse)) {
      return contactsResponse;
    }
    return [];
  }, [contactsResponse]);

  const { data: allUsers = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const salesReps = allUsers.filter(user => user.role === 'sales_rep' || user.role === 'admin');

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const contactData = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        position: data.position || null,
        website: data.website || null,
        leadSource: data.leadSource || 'manual_entry',
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    addContactMutation.mutate(data);
  };

  // Contact filtering
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

        return matchesSearch && matchesStatus && matchesSource;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [contacts, searchTerm, statusFilter, sourceFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSourceFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || sourceFilter !== "all";

  // Get lead age status for visual alerts
  const getLeadAgeStatus = (createdAt: string | Date) => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff <= 24) {
      return { status: 'new', color: 'bg-green-100 border-green-300', badge: 'NEW' };
    } else if (hoursDiff <= 72) {
      return { status: 'follow_up', color: 'bg-yellow-100 border-yellow-300', badge: 'FOLLOW UP' };
    } else {
      return { status: 'urgent', color: 'bg-red-100 border-red-300', badge: 'URGENT' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo}
            alt="Traffik Boosters" 
            className="h-12 w-12"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Contact Management</h1>
            <p className="text-gray-600">Manage your lead cards and customer relationships</p>
          </div>
        </div>
        <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Lead
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

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
            </SelectContent>
          </Select>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="google_maps">Google Maps</SelectItem>
              <SelectItem value="bark_com">Bark.com</SelectItem>
              <SelectItem value="yellow_pages">Yellow Pages</SelectItem>
              <SelectItem value="chat_widget">Chat Widget</SelectItem>
              <SelectItem value="manual_entry">Manual Entry</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="whitespace-nowrap"
            >
              <Eye className="h-4 w-4 mr-2" />
              View All ({contacts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} lead cards
        {hasActiveFilters && " (filtered)"}
      </div>

      {/* Lead Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => {
            const ageStatus = getLeadAgeStatus(contact.createdAt);
            
            return (
              <Card 
                key={contact.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500 ${ageStatus.color}`}
                onClick={() => {
                  setSelectedContactForDetails(contact);
                  setIsDetailsModalOpen(true);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={traffikBoostersLogo}
                        alt="Traffik Boosters" 
                        className="h-6 w-6"
                      />
                      <span className="text-sm font-medium text-gray-500">LEAD CARD</span>
                    </div>
                    {ageStatus.status === 'new' && (
                      <Badge className={`text-xs animate-pulse ${ageStatus.status === 'new' ? 'bg-green-500' : ageStatus.status === 'follow_up' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                        {ageStatus.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">
                    {contact.firstName} {contact.lastName}
                  </CardTitle>
                  {contact.company && (
                    <p className="text-sm text-gray-600">{contact.company}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    {contact.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{formatPhoneNumber(contact.phone)}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-2" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        <a 
                          href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Lead Status and Priority */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {contact.leadStatus?.replace('_', ' ').toUpperCase() || 'NEW'}
                    </Badge>
                    {contact.priority && (
                      <Badge 
                        variant={contact.priority === 'high' ? 'destructive' : contact.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {contact.priority.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-4 gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
                    {/* Call Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (contact.phone) {
                          window.open(`tel:${contact.phone}`, '_self');
                          toast({
                            title: "Call Initiated",
                            description: `Calling ${contact.firstName} ${contact.lastName}`,
                          });
                        } else {
                          toast({
                            title: "No Phone Number",
                            description: "This contact doesn't have a phone number",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!contact.phone}
                    >
                      <Phone className="h-3 w-3 mb-1 text-green-600" />
                      <span>Call</span>
                    </Button>

                    {/* Schedule Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContactForDetails(contact);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <Calendar className="h-3 w-3 mb-1 text-blue-600" />
                      <span>Schedule</span>
                    </Button>

                    {/* Email Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (contact.email) {
                          window.open(`mailto:${contact.email}`, '_self');
                        } else {
                          toast({
                            title: "No Email Address",
                            description: "This contact doesn't have an email address",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!contact.email}
                    >
                      <Mail className="h-3 w-3 mb-1 text-orange-600" />
                      <span>Email</span>
                    </Button>

                    {/* Starz Conversation Starters Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                        setCurrentAction('calling');
                        setIsAITipGeneratorOpen(true);
                      }}
                    >
                      <ClipboardList className="h-3 w-3 mb-1 text-purple-600" />
                      <span>Starz</span>
                    </Button>
                  </div>

                  {/* Lead Source */}
                  {contact.leadSource && (
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <span>Source: {contact.leadSource.replace('_', ' ')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Contact Modal */}
      <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Lead
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              </div>

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
                  {addContactMutation.isPending ? "Adding..." : "Add Lead"}
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

      {/* AI Sales Tip Generator Modal */}
      {isAITipGeneratorOpen && selectedContact && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold">Starz Conversation Starters</h2>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={traffikBoostersLogo}
                    alt="Traffik Boosters" 
                    className="h-8 w-8"
                  />
                  <div className="text-right">
                    <div className="text-sm font-semibold text-black">Starz Sales Intelligence</div>
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
    </div>
  );
}