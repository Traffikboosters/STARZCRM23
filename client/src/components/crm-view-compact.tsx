import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Mail, MoreVertical, Plus, Filter, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import type { Contact } from '@shared/schema';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts with high limit to get all records
  const { data: contactsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/contacts?limit=2000'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const contacts = (contactsResponse as any)?.contacts || [];

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
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Lead Count */}
      <div className="text-green-600 font-semibold">
        Displaying {filteredContacts.length} of {contacts.length} lead cards
      </div>

      {/* Compact Lead Cards Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No contacts found matching your criteria.
        </div>
      ) : (
        <CompactLeadCards
          contacts={filteredContacts}
          onContactClick={handleContactClick}
          onCallContact={handleCallContact}
          onEmailContact={handleEmailContact}
        />
      )}

      {/* Full-Featured Contact Details Modal with All Tabs */}
      <ContactDetailsModal
        contact={selectedContact}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}