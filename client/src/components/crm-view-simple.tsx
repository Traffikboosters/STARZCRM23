import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { 
  Plus, Search, Phone, Mail, Calendar, 
  User, Clock, StickyNote, 
  Zap, ClipboardList, Eye, Brain
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

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
import { SimpleAITipsModal } from "./simple-ai-tips-modal";
import LeadDetailsModal from "./lead-details-modal";
import SmartCalendarModal from "./smart-calendar-modal";
import RealPhoneUpdater from "./real-phone-updater";
import { formatPhoneNumber } from "@/lib/utils";

// Import Traffik Boosters logo
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

// Form schema and types
interface ContactFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  website?: string;
  company?: string;
  position?: string;
  leadSource?: string;
  leadStatus?: string;
  priority?: string;
  notes?: string;
}

export default function CRMView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // User authentication and role checking
  const currentUser = authService.getCurrentUser();

  // Helper function to clean phone numbers for US domestic calls (remove country code "1")
  const cleanPhoneForDialing = (phone: string | null): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    // Remove country code "1" for US domestic calls
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.substring(1);
    }
    return cleaned.length === 10 ? cleaned : cleaned;
  };
  
  // State management
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAITipGeneratorOpen, setIsAITipGeneratorOpen] = useState(false);
  const [isSmartCalendarOpen, setIsSmartCalendarOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<Contact | null>(null);
  const [selectedContactForCalendar, setSelectedContactForCalendar] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAction, setCurrentAction] = useState<'calling' | 'emailing' | 'scheduling' | 'qualifying' | 'closing' | undefined>(undefined);

  // Form setup
  const form = useForm<ContactFormData>({
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
  const { data: contactsResponse, isLoading, error } = useQuery({
    queryKey: ["/api/contacts", currentPage],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/contacts?limit=50&page=${currentPage}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch contacts: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
      }
    },
    refetchInterval: 60000,
  });

  const { contacts, totalContactCount } = useMemo(() => {
    // Handle different response structures
    if (contactsResponse && typeof contactsResponse === 'object') {
      if ('contacts' in contactsResponse && Array.isArray((contactsResponse as any).contacts)) {
        const paginatedResponse = contactsResponse as { 
          contacts: Contact[], 
          pagination?: { total: number } 
        };
        return {
          contacts: paginatedResponse.contacts,
          totalContactCount: paginatedResponse.pagination?.total || paginatedResponse.contacts.length
        };
      }
      if (Array.isArray(contactsResponse)) {
        return {
          contacts: contactsResponse,
          totalContactCount: contactsResponse.length
        };
      }
    }
    return {
      contacts: [],
      totalContactCount: 0
    };
  }, [contactsResponse]);

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
      return { status: 'new', color: 'bg-green-100 border-green-300', badge: 'NEW', badgeColor: 'bg-green-500' };
    } else if (hoursDiff <= 48) {
      return { status: 'follow_up', color: 'bg-yellow-100 border-yellow-300', badge: 'FOLLOW UP', badgeColor: 'bg-yellow-500' };
    } else {
      return { status: 'urgent', color: 'bg-red-100 border-red-300', badge: 'URGENT', badgeColor: 'bg-red-500' };
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
        <div className="flex gap-3">
          <RealPhoneUpdater 
            contactIds={filteredContacts.map(c => c.id)}
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
              toast({
                title: "Phone Numbers Updated",
                description: "Contact phone numbers have been refreshed with real business data"
              });
            }}
          />
          <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Lead
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
              View All ({totalContactCount.toLocaleString()})
            </Button>
          )}
        </div>
      </div>

      {/* Results count and pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * 50 + 1}-{Math.min(currentPage * 50, totalContactCount)} of {totalContactCount.toLocaleString()} lead cards
          {hasActiveFilters && " (filtered)"}
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Page {currentPage} of {Math.ceil(totalContactCount / 50)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(totalContactCount / 50)}
          >
            Next
          </Button>
          {/* Quick page jump for first/last */}
          {currentPage > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(1)}
              className="text-xs"
            >
              First
            </Button>
          )}
          {currentPage < Math.ceil(totalContactCount / 50) - 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.ceil(totalContactCount / 50))}
              className="text-xs"
            >
              Last
            </Button>
          )}
        </div>
      </div>

      {/* Lead Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Contacts</h3>
            <p className="text-red-600 mb-4">There was an error loading your contacts. Please try refreshing the page.</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Refresh Page
            </Button>
          </div>
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
                    <Badge className={`text-xs ${ageStatus.status === 'new' ? 'animate-pulse' : ''} ${ageStatus.badgeColor} text-white`}>
                      {ageStatus.badge}
                    </Badge>
                  </div>
                  <CardTitle 
                    className={`text-lg ${contact.phone ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                    onClick={(e) => {
                      if (contact.phone) {
                        e.stopPropagation();
                        // Use PowerDials integration for calling
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
                            // Fallback to device dialer
                            const cleanedPhone = cleanPhoneForDialing(contact.phone);
                            window.open(`tel:${cleanedPhone}`, '_self');
                            toast({
                              title: "Call Initiated",
                              description: `Calling ${contact.firstName} ${contact.lastName}`,
                            });
                          }
                        })
                        .catch(error => {
                          console.error('PowerDials error:', error);
                          if (powerDialsWindow) powerDialsWindow.close();
                          // Fallback to device dialer
                          const cleanedPhone = cleanPhoneForDialing(contact.phone);
                          window.open(`tel:${cleanedPhone}`, '_self');
                          toast({
                            title: "Call Initiated", 
                            description: `Calling ${contact.firstName} ${contact.lastName}`,
                          });
                        });
                      }
                    }}
                    title={contact.phone ? "Click to call" : ""}
                  >
                    {contact.firstName} {contact.lastName}
                    {contact.phone && <Phone className="h-4 w-4 ml-2 inline text-green-600" />}
                  </CardTitle>
                  {contact.company && (
                    <p className="text-sm text-gray-600">{contact.company}</p>
                  )}
                  
                  {/* Timestamp Display */}
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span title={format(new Date(contact.createdAt), "PPpp")}>
                      Posted {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    {contact.phone && (
                      <div 
                        className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
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
                              // Fallback to device dialer
                              const cleanedPhone = cleanPhoneForDialing(contact.phone);
                              window.open(`tel:${cleanedPhone}`, '_self');
                              toast({
                                title: "Call Initiated",
                                description: `Calling ${contact.firstName} ${contact.lastName}`,
                              });
                            }
                          })
                          .catch(error => {
                            console.error('PowerDials error:', error);
                            if (powerDialsWindow) powerDialsWindow.close();
                            // Fallback to device dialer
                            const cleanedPhone = cleanPhoneForDialing(contact.phone);
                            window.open(`tel:${cleanedPhone}`, '_self');
                            toast({
                              title: "Call Initiated",
                              description: `Calling ${contact.firstName} ${contact.lastName}`,
                            });
                          });
                        }}
                        title="Click to call"
                      >
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

                  {/* Disposition Display */}
                  {contact.disposition && (
                    <div className="flex items-center text-sm">
                      <Badge 
                        variant={
                          contact.disposition === 'interested' ? 'default' :
                          contact.disposition === 'sold' ? 'default' :
                          contact.disposition === 'not_interested' ? 'destructive' :
                          contact.disposition === 'callback' ? 'secondary' :
                          contact.disposition === 'contacted' ? 'outline' :
                          'outline'
                        }
                        className="text-xs"
                      >
                        {contact.disposition.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {contact.dispositionDate && (
                        <span className="text-xs text-gray-500 ml-2">
                          {format(new Date(contact.dispositionDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons Grid - 7 buttons in 4-column layout */}
                  <div className="grid grid-cols-4 gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
                    {/* Call Button with Dialer Options */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs flex flex-col items-center justify-center py-2 h-auto min-h-[60px]"
                          disabled={!contact.phone}
                        >
                          <Phone className="h-3 w-3 mb-2 text-green-600" />
                          <span className="leading-tight">Call</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (contact.phone) {
                              // PowerDials Web Dialer (using MightyCall backend)
                              // Pre-open window immediately to bypass popup blockers
                              const powerDialsWindow = window.open('', 'PowerDialsDialer', 'width=800,height=600,scrollbars=yes,resizable=yes,noopener=no');
                              
                              if (!powerDialsWindow) {
                                // Popup was blocked - provide multiple fallback options
                                const cleanNumber = cleanPhoneForDialing(contact.phone);
                                const manualUrl = `https://app.powerdials.com/dialer?number=${cleanNumber}&contact=${encodeURIComponent(contact.firstName + ' ' + contact.lastName)}`;
                                
                                // Try to copy URL to clipboard first
                                navigator.clipboard.writeText(manualUrl).then(() => {
                                  toast({
                                    title: "Popup Blocked - URL Copied",
                                    description: "PowerDials URL copied to clipboard. Open new tab and paste (Ctrl+V), or allow popups and try again.",
                                  });
                                }).catch(() => {
                                  // If clipboard fails, show manual instructions
                                  toast({
                                    title: "Popup Blocked",
                                    description: "To enable PowerDials: Click popup blocker icon in address bar → Allow popups → Try again. Using device dialer now.",
                                    variant: "destructive",
                                  });
                                  window.open(`tel:${cleanNumber}`, '_self');
                                });
                                return;
                              }

                              // Show loading page while fetching dialer URL
                              powerDialsWindow.document.write(`
                                <html>
                                  <head><title>PowerDials Loading...</title></head>
                                  <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
                                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
                                      <h2 style="color: #333; margin-bottom: 20px;">🚀 PowerDials Dialer</h2>
                                      <p style="color: #666; margin-bottom: 10px;">Loading dialer for <strong>${contact.firstName} ${contact.lastName}</strong></p>
                                      <p style="color: #666; margin-bottom: 20px;">Phone: <strong>${formatPhoneNumber(contact.phone)}</strong></p>
                                      <div style="margin: 20px; color: #007bff;">⏳ Connecting to dialer...</div>
                                      <small style="color: #999;">Powered by PowerDials & MightyCall</small>
                                    </div>
                                  </body>
                                </html>
                              `);

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
                                    description: `PowerDials web dialer ready for ${contact.firstName} ${contact.lastName}`,
                                  });
                                } else {
                                  if (powerDialsWindow) powerDialsWindow.close();
                                  throw new Error(data.message || 'PowerDials unavailable');
                                }
                              })
                              .catch(error => {
                                if (powerDialsWindow) powerDialsWindow.close();
                                console.error('PowerDials error:', error);
                                
                                // Try to generate manual PowerDials URL as fallback
                                const cleanNumber = cleanPhoneForDialing(contact.phone);
                                const manualUrl = `https://app.powerdials.com/dialer?number=${cleanNumber}&contact=${encodeURIComponent(contact.firstName + ' ' + contact.lastName)}`;
                                
                                // Copy URL to clipboard for manual access
                                navigator.clipboard.writeText(manualUrl).then(() => {
                                  toast({
                                    title: "PowerDials URL Copied",
                                    description: "PowerDials URL copied to clipboard. Paste in new tab or allow popups.",
                                  });
                                }).catch(() => {
                                  // Fallback to device dialer if clipboard fails
                                  toast({
                                    title: "PowerDials Error",
                                    description: "PowerDials web dialer unavailable. Using device dialer.",
                                    variant: "destructive",
                                  });
                                  window.open(`tel:${cleanNumber}`, '_self');
                                });
                              });
                            }
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2 text-blue-600" />
                          PowerDials Web
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (contact.phone) {
                              // PowerDials Desktop (using MightyCall backend)
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
                                const cleanedPhone = cleanPhoneForDialing(contact.phone);
                                window.open(`tel:${cleanedPhone}`, '_self');
                                toast({
                                  title: "PowerDials Desktop",
                                  description: `Calling ${contact.firstName} ${contact.lastName} via PowerDials`,
                                });
                              })
                              .catch(error => {
                                const cleanedPhone = cleanPhoneForDialing(contact.phone);
                                window.open(`tel:${cleanedPhone}`, '_self');
                                toast({
                                  title: "PowerDials Call",
                                  description: `Calling ${contact.firstName} ${contact.lastName}`,
                                });
                              });
                            }
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2 text-blue-700" />
                          PowerDials Desktop
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (contact.phone) {
                              const cleanedPhone = cleanPhoneForDialing(contact.phone);
                              window.open(`tel:${cleanedPhone}`, '_self');
                              toast({
                                title: "Device Dialer",
                                description: `Calling ${contact.firstName} ${contact.lastName}`,
                              });
                            }
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2 text-gray-600" />
                          Device Dialer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Smart Schedule Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Smart Schedule clicked for contact:', contact.firstName, contact.lastName);
                        setSelectedContactForCalendar(contact);
                        setIsSmartCalendarOpen(true);
                      }}
                    >
                      <Brain className="h-3 w-3 mb-2 text-purple-600" />
                      <span className="leading-tight">Smart Schedule</span>
                    </Button>

                    {/* Email Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto min-h-[60px]"
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
                      <Mail className="h-3 w-3 mb-2 text-orange-600" />
                      <span className="leading-tight">Email</span>
                    </Button>

                    {/* Starz Tips Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Starz Tips clicked for contact:', contact.firstName, contact.lastName);
                        setSelectedContact(contact);
                        setCurrentAction('calling');
                        setIsAITipGeneratorOpen(true);
                        console.log('AI Tip Generator state set to open:', true);
                        console.log('Current state values:', {
                          selectedContact: contact,
                          isAITipGeneratorOpen: true,
                          currentAction: 'calling'
                        });
                        toast({
                          title: "Starz Conversation Starters Opening",
                          description: `Loading Starz conversation starters for ${contact.firstName} ${contact.lastName}`,
                        });
                      }}
                    >
                      <ClipboardList className="h-3 w-3 mb-2 text-purple-600" />
                      <span className="leading-tight">Starz</span>
                    </Button>

                    {/* Notes Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Notes clicked for contact:', contact.firstName, contact.lastName);
                        const currentNotes = contact.notes || '';
                        const newNote = prompt(`Add a note for ${contact.firstName} ${contact.lastName}:`, currentNotes);
                        if (newNote !== null && newNote !== currentNotes) {
                          // Here you would update the contact notes via API
                          toast({
                            title: "Note Updated",
                            description: `Notes updated for ${contact.firstName} ${contact.lastName}`,
                          });
                        }
                      }}
                    >
                      <StickyNote className="h-3 w-3 mb-2 text-yellow-600" />
                      <span className="leading-tight">Notes</span>
                    </Button>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit clicked for contact:', contact.firstName, contact.lastName);
                        setSelectedContactForDetails(contact);
                        setIsDetailsModalOpen(true);
                        toast({
                          title: "Contact Details",
                          description: `Opening contact details for ${contact.firstName} ${contact.lastName}`,
                        });
                      }}
                    >
                      <User className="h-3 w-3 mb-2 text-gray-600" />
                      <span className="leading-tight">Details</span>
                    </Button>

                    {/* Quick Reply Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex flex-col items-center justify-center py-2 h-auto min-h-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Reply clicked for contact:', contact.firstName, contact.lastName);
                        if (contact.email) {
                          const subject = `Follow-up: Traffik Boosters Services for ${contact.company || contact.firstName}`;
                          const body = `Hi ${contact.firstName},\n\nI wanted to follow up on our conversation about digital marketing services for ${contact.company || 'your business'}.\n\nWe specialize in:\n• SEO & Local Search Optimization\n• Google Ads & PPC Management\n• Social Media Marketing\n• Website Development\n\nWould you be available for a brief 15-minute call this week to discuss how we can help grow your business?\n\nBest regards,\nMichael Thompson\nTraffikBoosters.com\n(877) 840-6250`;
                          window.open(`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
                        } else {
                          toast({
                            title: "No Email Available",
                            description: "This contact doesn't have an email address for quick reply",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!contact.email}
                    >
                      <Zap className="h-3 w-3 mb-2 text-indigo-600" />
                      <span className="leading-tight">Reply</span>
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

      {/* Contact Details Modal with Tabs */}
      {isDetailsModalOpen && selectedContactForDetails && (
        <LeadDetailsModal 
          contact={selectedContactForDetails}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedContactForDetails(null);
          }}
        />
      )}

      {/* Starz Sales Tip Generator Modal */}
      {selectedContact && (
        <SimpleAITipsModal
          contact={selectedContact}
          isOpen={isAITipGeneratorOpen}
          onClose={() => {
            setIsAITipGeneratorOpen(false);
            setSelectedContact(null);
            setCurrentAction(undefined);
          }}
        />
      )}

      {/* Smart Calendar Modal */}
      {selectedContactForCalendar && (
        <SmartCalendarModal
          contact={selectedContactForCalendar}
          isOpen={isSmartCalendarOpen}
          onClose={() => {
            setIsSmartCalendarOpen(false);
            setSelectedContactForCalendar(null);
          }}
        />
      )}
    </div>
  );
}