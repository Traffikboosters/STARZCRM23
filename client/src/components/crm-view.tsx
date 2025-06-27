import { useState, useMemo } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Filter, User, Mail, Phone, Building, MapPin, Calendar, Star, MessageCircle, X, Clock, DollarSign, FileText, ExternalLink, CreditCard, Users, Target, Edit } from "lucide-react";
import { format } from "date-fns";
import type { Contact, User as UserType } from "@shared/schema";

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

export default function CRMView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showActiveFilters, setShowActiveFilters] = useState(false);

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
  });

  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

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

      // Create appointment if scheduled
      if (form.getValues("scheduleAppointment") && form.getValues("appointmentDate") && form.getValues("appointmentTime")) {
        const appointmentDateTime = new Date(`${form.getValues("appointmentDate")}T${form.getValues("appointmentTime")}`);
        
        const eventData = {
          title: `${form.getValues("appointmentType") || "Meeting"} with ${newContact.firstName} ${newContact.lastName}`,
          description: `Contact: ${newContact.firstName} ${newContact.lastName}\nCompany: ${newContact.company || 'N/A'}\nPhone: ${newContact.phone || 'N/A'}\nEmail: ${newContact.email || 'N/A'}\nNotes: ${form.getValues("appointmentNotes") || 'No additional notes'}`,
          startTime: appointmentDateTime.toISOString(),
          endTime: new Date(appointmentDateTime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          contactId: newContact.id,
          userId: currentUser?.id || 1,
        };

        try {
          await apiRequest("POST", "/api/events", eventData);
          toast({
            title: "Success!",
            description: `Contact added and appointment scheduled for ${format(appointmentDateTime, 'PPP p')}`,
          });
        } catch (error) {
          toast({
            title: "Contact Added",
            description: "Contact was added but appointment scheduling failed",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Contact Added",
          description: `${newContact.firstName} ${newContact.lastName} has been added to your contacts`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (data: ContactFormData) => {
    addContactMutation.mutate(data);
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
    setShowActiveFilters(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || sourceFilter !== "all";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM - Contact Management</h1>
          <p className="text-gray-600">Manage your contacts and leads</p>
        </div>
        <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
        </Dialog>
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

      {/* Contacts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => {
            return (
              <Card 
                key={contact.id} 
                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500"
                onClick={() => {
                  setSelectedContactForDetails(contact);
                  setIsDetailsModalOpen(true);
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">
                      {contact.company || `${contact.firstName} ${contact.lastName}`}
                    </span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {contact.leadStatus?.replace('_', ' ').toUpperCase() || 'NEW'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="truncate">{formatPhoneNumber(contact.phone) || 'No phone'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
    </div>
  );
}