import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Phone, 
  Video,
  MoreVertical,
  Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Contact, ChatMessage, ChatConversation } from "@shared/schema";

interface ChatWidgetProps {
  selectedContact?: Contact | null;
  onContactSelect?: (contact: Contact) => void;
  className?: string;
}

export default function ChatWidget({ selectedContact, onContactSelect, className }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch contacts for conversation list
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: isOpen
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery<ChatConversation[]>({
    queryKey: ["/api/chat/conversations"],
    enabled: isOpen
  });

  // Fetch messages for active contact
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", activeContactId],
    enabled: !!activeContactId
  });

  // WebSocket for real-time messages
  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'chat_message') {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
        queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
        
        // Show notification if chat is minimized or closed
        if (!isOpen || isMinimized) {
          toast({
            title: "New message",
            description: `Message from ${getContactName(data.data.contactId)}`,
          });
        }
      }
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; contactId: number; senderId: number; isFromContact: boolean; type: string }) => {
      return apiRequest("POST", "/api/chat/messages", messageData);
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", activeContactId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (contactId: number) => {
      return apiRequest("POST", "/api/chat/conversations", { contactId, status: "active", priority: "normal" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedContact && selectedContact.id !== activeContactId) {
      setActiveContactId(selectedContact.id);
      setIsOpen(true);
      setIsMinimized(false);
      
      // Create conversation if it doesn't exist
      const existingConversation = conversations.find(c => c.contactId === selectedContact.id);
      if (!existingConversation) {
        createConversationMutation.mutate(selectedContact.id);
      }
    }
  }, [selectedContact, activeContactId, conversations]);

  const getContactName = (contactId: number | null) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getContactInitials = (contactId: number | null) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return "?";
    return `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeContactId) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      contactId: activeContactId,
      senderId: 1, // Current user ID
      isFromContact: false,
      type: "text"
    });
  };

  const handleContactSelect = (contact: Contact) => {
    setActiveContactId(contact.id);
    onContactSelect?.(contact);
    
    // Create conversation if it doesn't exist
    const existingConversation = conversations.find(c => c.contactId === contact.id);
    if (!existingConversation) {
      createConversationMutation.mutate(contact.id);
    }
  };

  const activeContact = contacts.find(c => c.id === activeContactId);

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          {conversations.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
              {conversations.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <div className={cn(
        "bg-background border rounded-lg shadow-xl w-80 h-96 flex flex-col",
        isMinimized && "h-12"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium text-sm">
              {activeContact ? getContactName(activeContact.id) : "Chat"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {activeContact && (
              <>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Phone className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Video className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Content */}
            <div className="flex-1 flex">
              {/* Contact List */}
              {!activeContactId && (
                <div className="flex-1 p-3">
                  <div className="text-sm font-medium mb-3">Recent Conversations</div>
                  <div className="space-y-2">
                    {conversations.map((conversation) => {
                      const contact = contacts.find(c => c.id === conversation.contactId);
                      if (!contact) return null;
                      
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => handleContactSelect(contact)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getContactInitials(contact.id)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {getContactName(contact.id)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {conversation.status}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    
                    {contacts.filter(contact => 
                      !conversations.find(c => c.contactId === contact.id)
                    ).map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => handleContactSelect(contact)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getContactInitials(contact.id)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {getContactName(contact.id)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Start conversation
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {activeContactId && (
                <div className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-2",
                            !msg.isFromContact && "flex-row-reverse"
                          )}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {msg.isFromContact 
                                ? getContactInitials(msg.contactId)
                                : "Me"
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                              msg.isFromContact
                                ? "bg-muted"
                                : "bg-primary text-primary-foreground"
                            )}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t">
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Paperclip className="h-3 w-3" />
                      </Button>
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-8"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button 
                        type="submit" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}