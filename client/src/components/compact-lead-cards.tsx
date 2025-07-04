import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/utils';
import type { Contact } from '@shared/schema';

interface CompactLeadCardsProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onCallContact: (contact: Contact) => void;
  onEmailContact: (contact: Contact) => void;
}

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

export default function CompactLeadCards({ contacts, onContactClick, onCallContact, onEmailContact }: CompactLeadCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2">
      {contacts.map((contact) => {
        const ageStatus = getLeadAgeStatus(contact.createdAt);
        
        return (
          <Card 
            key={contact.id} 
            className="w-32 h-32 hover:shadow-md transition-all duration-300 border-l-2 border-l-orange-500 cursor-pointer"
          >
            <CardContent className="p-1 h-full flex flex-col justify-between">
              {/* Top section with status and name */}
              <div className="space-y-1">
                <Badge 
                  className={`${ageStatus.badgeColor} text-white text-[8px] px-1 py-0 ${ageStatus.description === '0-24H' ? ageStatus.animation : ''}`}
                >
                  {ageStatus.description}
                </Badge>
                <div className="text-[9px] font-bold text-gray-900 truncate">
                  {contact.firstName} {contact.lastName}
                </div>
                <div className="text-[8px] text-gray-600 truncate">
                  {contact.company || formatPhoneNumber(contact.phone)}
                </div>
              </div>
              
              {/* Bottom section with action buttons */}
              <div className="space-y-1">
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[8px] px-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallContact(contact);
                    }}
                    disabled={!contact.phone}
                  >
                    <Phone className="h-2 w-2" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[8px] px-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEmailContact(contact);
                    }}
                    disabled={!contact.email}
                  >
                    <Mail className="h-2 w-2" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  className="w-full h-5 text-[8px] bg-orange-500 hover:bg-orange-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContactClick(contact);
                  }}
                >
                  More
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}