import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, User, Clock, Star, Filter, Search, Phone, Mail, MoreVertical, Eye, UserCheck, MessageCircle, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface ChatConversation {
  id: number;
  contactId: number;
  assignedTo: number | null;
  status: string;
  priority: string;
  lastMessageAt: string;
  notes: string | null;
  createdAt: string;
  contact?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
  assignedRep?: {
    firstName: string;
    lastName: string;
    workEmail: string;
  };
  messageCount?: number;
  lastMessage?: string;
}

interface ChatMessage {
  id: number;
  contactId: number;
  senderId: number | null;
  message: string;
  type: string;
  isFromContact: boolean;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
}

export function ChatWidgetBackOffice() {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssigned, setFilterAssigned] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/chat/conversations"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch sales reps for assignment
  const { data: salesReps = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/messages", selectedConversation?.id],
    enabled: !!selectedConversation?.id,
    refetchInterval: 30000, // Optimized to 30 seconds for better performance
  });

  // Assign conversation mutation
  const assignConversationMutation = useMutation({
    mutationFn: async ({ conversationId, assignedTo }: { conversationId: number; assignedTo: number }) => {
      return apiRequest('PATCH', `/api/chat/conversations/${conversationId}`, { assignedTo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      toast({
        title: "Conversation Assigned",
        description: "Chat has been assigned to sales representative",
      });
    },
  });

  // Update conversation status/priority mutation
  const updateConversationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest('PATCH', `/api/chat/conversations/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      toast({
        title: "Conversation Updated",
        description: "Changes saved successfully",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: number; message: string }) => {
      return apiRequest('POST', `/api/chat/messages`, {
        contactId: selectedConversation?.contactId,
        senderId: currentUser?.id,
        message,
        isFromContact: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      setNewMessage("");
      toast({
        title: "Message Sent",
        description: "Your response has been delivered",
      });
    },
  });

  // Filter conversations
  const filteredConversations = conversations.filter((conv: ChatConversation) => {
    const statusMatch = filterStatus === "all" || conv.status === filterStatus;
    const priorityMatch = filterPriority === "all" || conv.priority === filterPriority;
    const assignedMatch = filterAssigned === "all" || 
      (filterAssigned === "unassigned" && !conv.assignedTo) ||
      (filterAssigned === "assigned" && conv.assignedTo) ||
      (filterAssigned === "mine" && conv.assignedTo === currentUser?.id);
    
    const searchMatch = !searchTerm || 
      conv.contact?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contact?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && priorityMatch && assignedMatch && searchMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "normal": return "bg-blue-500";
      case "low": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 w-auto"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Widget Back Office</h1>
            <p className="text-gray-600">Manage website chat conversations and assignments</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredConversations.length} conversations
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assignment</label>
              <Select value={filterAssigned} onValueChange={setFilterAssigned}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="mine">My Conversations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterStatus("all");
                  setFilterPriority("all");
                  setFilterAssigned("all");
                  setSearchTerm("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations ({filteredConversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[520px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading conversations...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No conversations found</div>
                ) : (
                  filteredConversations.map((conversation: ChatConversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {conversation.contact?.company || `${conversation.contact?.firstName} ${conversation.contact?.lastName}`}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {conversation.contact?.email}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Badge className={`${getPriorityColor(conversation.priority)} text-white text-xs`}>
                            {conversation.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(conversation.status)} text-white text-xs`}>
                            {conversation.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2 truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {conversation.lastMessageAt ? 
                            formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true }) :
                            formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          {conversation.assignedTo ? (
                            <div className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3 text-green-600" />
                              <span className="text-green-600">
                                {conversation.assignedRep?.firstName}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-orange-600" />
                              <span className="text-orange-600">Unassigned</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Details */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConversation.contact?.company || 
                         `${selectedConversation.contact?.firstName} ${selectedConversation.contact?.lastName}`}
                      </CardTitle>
                      <div className="text-sm text-gray-600">
                        {selectedConversation.contact?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Assignment Dropdown */}
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserCheck className="h-4 w-4 mr-2" />
                            {selectedConversation.assignedTo ? 'Reassign' : 'Assign'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Assign to Sales Rep</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {salesReps.filter((rep: any) => rep.role === 'sales_rep' || rep.role === 'admin').map((rep: any) => (
                            <DropdownMenuItem
                              key={rep.id}
                              onClick={() => {
                                assignConversationMutation.mutate({
                                  conversationId: selectedConversation.id,
                                  assignedTo: rep.id,
                                });
                              }}
                            >
                              <User className="h-4 w-4 mr-2" />
                              {rep.firstName} {rep.lastName}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {/* Status/Priority Controls */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          updateConversationMutation.mutate({
                            id: selectedConversation.id,
                            updates: { status: 'active' }
                          });
                        }}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Mark Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          updateConversationMutation.mutate({
                            id: selectedConversation.id,
                            updates: { status: 'pending' }
                          });
                        }}>
                          <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                          Mark Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          updateConversationMutation.mutate({
                            id: selectedConversation.id,
                            updates: { status: 'closed' }
                          });
                        }}>
                          <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                          Mark Closed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Priority</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          updateConversationMutation.mutate({
                            id: selectedConversation.id,
                            updates: { priority: 'urgent' }
                          });
                        }}>
                          <Star className="h-4 w-4 mr-2 text-red-600" />
                          Urgent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          updateConversationMutation.mutate({
                            id: selectedConversation.id,
                            updates: { priority: 'high' }
                          });
                        }}>
                          <Star className="h-4 w-4 mr-2 text-orange-600" />
                          High
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          updateConversationMutation.mutate({
                            id: selectedConversation.id,
                            updates: { priority: 'normal' }
                          });
                        }}>
                          <Star className="h-4 w-4 mr-2 text-blue-600" />
                          Normal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col h-[500px]">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages in this conversation
                    </div>
                  ) : (
                    messages.map((message: ChatMessage) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromContact ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromContact
                              ? 'bg-white text-gray-800 border'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <div className="text-sm">{message.message}</div>
                          <div className={`text-xs mt-1 ${
                            message.isFromContact ? 'text-gray-500' : 'text-blue-100'
                          }`}>
                            {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                            {!message.isFromContact && message.sender && (
                              <span className="ml-2">
                                - {message.sender.firstName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                {(selectedConversation.assignedTo === currentUser?.id || 
                  currentUser?.role === 'admin' || 
                  currentUser?.role === 'manager') && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newMessage.trim()) {
                            sendMessageMutation.mutate({
                              conversationId: selectedConversation.id,
                              message: newMessage.trim(),
                            });
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (newMessage.trim()) {
                          sendMessageMutation.mutate({
                            conversationId: selectedConversation.id,
                            message: newMessage.trim(),
                          });
                        }
                      }}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="self-end"
                    >
                      Send
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                <p>Choose a conversation from the list to view messages and respond</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}