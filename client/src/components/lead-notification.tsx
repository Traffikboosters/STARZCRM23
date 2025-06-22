import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, MessageSquare, User, Phone, Mail, Building, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Contact } from "@shared/schema";

interface LeadNotificationProps {
  className?: string;
  onLeadView?: (contact: Contact) => void;
  onDismiss?: () => void;
}

interface NewLeadNotification {
  id: string;
  contact: Contact;
  timestamp: Date;
  source: string;
  isRead: boolean;
}

export default function LeadNotification({ className, onLeadView, onDismiss }: LeadNotificationProps) {
  const [notifications, setNotifications] = useState<NewLeadNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  // WebSocket for real-time lead notifications
  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'new_lead') {
        const newNotification: NewLeadNotification = {
          id: Date.now().toString(),
          contact: data.data,
          timestamp: new Date(),
          source: data.source || 'website',
          isRead: false
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
        setIsVisible(true);
        
        // Show toast notification
        toast({
          title: "New Lead Received!",
          description: `${data.data.firstName} ${data.data.lastName} just submitted a lead form`,
          duration: 5000,
        });

        // Auto-hide after 10 seconds if not interacted with
        setTimeout(() => {
          if (!isVisible) return;
          setIsVisible(false);
        }, 10000);
      }
    }
  });

  const handleViewLead = (contact: Contact) => {
    onLeadView?.(contact);
    markAsRead(contact.id.toString());
  };

  const markAsRead = (contactId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.contact.id.toString() === contactId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const dismissAll = () => {
    setNotifications([]);
    setIsVisible(false);
    onDismiss?.();
  };

  const getContactInitials = (contact: Contact) => {
    return `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase();
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'website': return 'bg-green-100 text-green-800';
      case 'chat': return 'bg-blue-100 text-blue-800';
      case 'form': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 w-96 max-h-screen overflow-hidden",
      className
    )}>
      <Card className="shadow-xl border-l-4 border-l-green-500 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              New Leads
              <Badge variant="secondary" className="ml-2">
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissAll}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 max-h-80 overflow-y-auto">
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50",
                  notification.isRead ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                )}
                onClick={() => handleViewLead(notification.contact)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-500 text-white text-sm">
                      {getContactInitials(notification.contact)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {notification.contact.firstName} {notification.contact.lastName}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(notification.timestamp)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {notification.contact.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{notification.contact.email}</span>
                        </div>
                      )}
                      
                      {notification.contact.company && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{notification.contact.company}</span>
                        </div>
                      )}
                      
                      {notification.contact.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{notification.contact.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={getSourceBadgeColor(notification.source)}>
                        {notification.source}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs bg-green-500 hover:bg-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewLead(notification.contact);
                          }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {notifications.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={dismissAll}
                className="w-full text-xs"
              >
                Dismiss All Notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}