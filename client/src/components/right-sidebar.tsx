import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { format } from "date-fns";
import { Video, User, FileText, Phone, Mail, Play, ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber } from "@/lib/utils";
import LiveMonitoring from "@/components/live-monitoring";
import SocialMediaPanel from "@/components/social-media-panel";
import ClickToCallButton from "@/components/click-to-call-button";
import type { Event, Contact, Company } from "@shared/schema";

interface RightSidebarProps {
  onJoinCall: () => void;
  onCreateEvent: () => void;
  onContactClick?: (contact: Contact) => void;
}

export default function RightSidebar({ onJoinCall, onCreateEvent, onContactClick }: RightSidebarProps) {
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const { data: contactsResponse } = useQuery({
    queryKey: ['/api/contacts'],
  });

  // Extract contacts from paginated response structure
  const contacts: Contact[] = useMemo(() => {
    if (contactsResponse?.contacts) {
      return contactsResponse.contacts;
    }
    // Fallback for old response format
    if (Array.isArray(contactsResponse)) {
      return contactsResponse;
    }
    return [];
  }, [contactsResponse]);

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  const company = companies[0]; // Get primary company

  // Get upcoming events (next 5)
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  // Get recently contacted contacts
  const recentContacts = contacts
    .filter(contact => contact.lastContactedAt)
    .sort((a, b) => new Date(b.lastContactedAt!).getTime() - new Date(a.lastContactedAt!).getTime())
    .slice(0, 3);

  const getContactInitials = (contact: Contact) => {
    return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
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

  const getEventIcon = (event: Event) => {
    if (event.isVideoCall) return <Video className="text-brand-primary text-xs" />;
    if (event.type === "call") return <Phone className="text-success text-xs" />;
    return <User className="text-neutral-medium text-xs" />;
  };

  return (
    <aside className="w-80 bg-white border-l border-neutral-lighter flex-shrink-0">
      <div className="p-6">
        {/* Upcoming Events */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-medium text-sm">No upcoming events</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={onCreateEvent}
                >
                  Create Event
                </Button>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <Card key={event.id} className="p-3 border border-neutral-lighter hover:bg-neutral-lightest cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-dark">{event.title}</h4>
                      <p className="text-sm text-neutral-medium">
                        {format(new Date(event.startDate), "MMM d, h:mm a")}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getEventIcon(event)}
                        <span className="text-xs text-neutral-medium">
                          {event.isVideoCall ? "Video call" : event.type}
                        </span>
                        {event.attachments && event.attachments.length > 0 && (
                          <>
                            <FileText className="text-neutral-light text-xs" />
                            <span className="text-xs text-neutral-medium">
                              {event.attachments.length} files
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={onJoinCall}
                      className="text-brand-primary hover:text-brand-secondary"
                    >
                      {event.isVideoCall ? <Play className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-dark">Recent Contacts</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-brand-primary hover:text-brand-secondary"
              onClick={() => window.location.href = '/dashboard'}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentContacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-medium text-sm">No recent contacts</p>
              </div>
            ) : (
              recentContacts.map((contact) => {
                const ageAlert = getLeadAgeAlert(contact);
                return (
                  <Card 
                    key={contact.id} 
                    className={`p-3 border border-neutral-lighter hover:bg-neutral-lightest cursor-pointer relative ${ageAlert ? ageAlert.alertClass : ''}`}
                    onClick={() => onContactClick?.(contact)}
                  >
                    {/* Age Alert Badge */}
                    {ageAlert && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className={`text-xs px-1 py-0.5 ${ageAlert.badgeColor} animate-pulse`}>
                          {ageAlert.badgeText}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar || ""} />
                      <AvatarFallback className="bg-brand-primary text-white text-sm font-medium">
                        {getContactInitials(contact)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-dark">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p className="text-sm text-neutral-medium">{contact.company}</p>
                      {contact.phone && (
                        <p className="text-xs text-neutral-medium">{formatPhoneNumber(contact.phone)}</p>
                      )}
                    </div>
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
                </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Social Media Management */}
        <div className="mb-6">
          <SocialMediaPanel company={company} />
        </div>

        {/* Live Monitoring */}
        <div className="mb-6">
          <LiveMonitoring />
        </div>

        {/* File Upload Zone */}
        <Card className="border-2 border-dashed border-neutral-lighter hover:border-brand-primary transition-colors">
          <CardContent className="p-6 text-center">
            <Upload className="h-8 w-8 text-neutral-light mb-3 mx-auto" />
            <h4 className="font-medium text-neutral-dark mb-2">Drop files here</h4>
            <p className="text-sm text-neutral-medium mb-4">or click to browse</p>
            <Button className="bg-brand-primary text-white hover:bg-brand-secondary">
              Browse Files
            </Button>
            <p className="text-xs text-neutral-light mt-2">
              CSV, Excel, PDF, Word, images supported
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
