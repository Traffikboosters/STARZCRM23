import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Mail, MoreVertical, Plus, Filter, Search, RefreshCw, Users, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import type { Contact, User } from '@shared/schema';
import CompactLeadCards from './compact-lead-cards';
import ContactDetailsModal from './contact-details-modal';

function getLeadAgeStatus(createdAt: string | Date) {
  const created = new Date(createdAt);
  const now = new Date();
  const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo <= 24) {
    return {
      description: '0-24H',
      badgeColor: 'bg-green-600',
      animation: 'animate-pulse'
    };
  } else if (hoursAgo <= 72) {
    return {
      description: '1-3D',
      badgeColor: 'bg-yellow-600',
      animation: ''
    };
  } else {
    return {
      description: '3D+',
      badgeColor: 'bg-red-600',
      animation: ''
    };
  }
}

export default function CRMViewCompact() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLeadAllocationModalOpen, setIsLeadAllocationModalOpen] = useState(false);
  const [selectedLeadsForAllocation, setSelectedLeadsForAllocation] = useState<number[]>([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 50;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users for sales rep assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  // Fetch contacts with high limit to get all records
  const { data: contactsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/contacts?limit=2000'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const contacts = (contactsResponse as any)?.contacts || [];
  
  // Get sales representatives (excluding admin-only accounts)  
  const salesReps = (users as User[]).filter((user: User) => user.role === 'sales_rep' || user.role === 'admin');

  // Lead allocation mutation
  const allocateLeadsMutation = useMutation({
    mutationFn: async ({ leadIds, salesRepId }: { leadIds: number[], salesRepId: number }) => {
      const response = await apiRequest('POST', '/api/contacts/allocate', { leadIds, salesRepId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Success",
        description: `Successfully allocated ${selectedLeadsForAllocation.length} leads`,
      });
      setIsLeadAllocationModalOpen(false);
      setSelectedLeadsForAllocation([]);
      setSelectedSalesRep("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to allocate leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact: Contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.firstName?.toLowerCase().includes(searchLower) ||
      contact.lastName?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.phone?.includes(searchTerm) ||
      contact.company?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalLeads = filteredContacts.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const currentLeads = filteredContacts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCallContact = (contact: Contact) => {
    if (contact.phone) {
      // Open phone dialer
      window.open(`tel:${contact.phone}`, '_self');
      toast({
        title: "Call Ready",
        description: `Calling ${contact.firstName} ${contact.lastName}`,
      });
    }
  };

  const handleEmailContact = (contact: Contact) => {
    if (contact.email) {
      // Open email client
      window.open(`mailto:${contact.email}`, '_blank');
      toast({
        title: "Email Ready",
        description: `Opening email to ${contact.firstName} ${contact.lastName}`,
      });
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading contacts. Please try again.</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Card Management</h1>
          <p className="text-gray-600">8x8 Compact Lead Cards</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {currentUser?.role === 'admin' && (
            <Button 
              variant="outline"
              onClick={() => setIsLeadAllocationModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Allocate Leads
            </Button>
          )}
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Lead Count and Pagination Info */}
      <div className="flex items-center justify-between">
        <div className="text-green-600 font-semibold">
          Displaying {currentLeads.length} of {filteredContacts.length} lead cards
          {filteredContacts.length !== contacts.length && ` (filtered from ${contacts.length} total)`}
        </div>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} ({leadsPerPage} per page)
        </div>
      </div>

      {/* Compact Lead Cards Grid */}
      {currentLeads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No contacts found matching your criteria.
        </div>
      ) : (
        <CompactLeadCards
          contacts={currentLeads}
          onContactClick={handleContactClick}
          onCallContact={handleCallContact}
          onEmailContact={handleEmailContact}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Full-Featured Contact Details Modal with All Tabs */}
      <ContactDetailsModal
        contact={selectedContact}
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
                    onClick={() => setSelectedLeadsForAllocation(currentLeads.map((c: Contact) => c.id))}
                  >
                    Select All (Current Page)
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
                  {currentLeads.map((contact: Contact) => {
                    const ageStatus = getLeadAgeStatus(contact.createdAt);
                    const isSelected = selectedLeadsForAllocation.includes(contact.id);
                    
                    return (
                      <div
                        key={contact.id}
                        className={`
                          flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all
                          ${isSelected ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                        `}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLeadsForAllocation(prev => prev.filter(id => id !== contact.id));
                          } else {
                            setSelectedLeadsForAllocation(prev => [...prev, contact.id]);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-orange-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {contact.firstName} {contact.lastName}
                            </span>
                            <Badge className={`${ageStatus.badgeColor} text-white text-xs`}>
                              {ageStatus.description}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {contact.email} • {formatPhoneNumber(contact.phone)}
                          </div>
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