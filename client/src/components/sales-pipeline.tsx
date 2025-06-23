import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { User, DollarSign, Calendar, Phone, Mail, MoreHorizontal, UserPlus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber } from "@/lib/utils";
import type { Contact, User as UserType } from "@shared/schema";

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  leads: Contact[];
}

const pipelineStages: Omit<PipelineStage, 'leads'>[] = [
  { id: 'prospect', name: 'Prospects', color: 'bg-gray-100 border-gray-300' },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-100 border-blue-300' },
  { id: 'demo', name: 'Demo Scheduled', color: 'bg-purple-100 border-purple-300' },
  { id: 'proposal', name: 'Proposal Sent', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100 border-orange-300' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-100 border-green-300' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-100 border-red-300' }
];

interface LeadAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Contact | null;
  salesReps: UserType[];
}

function LeadAssignmentModal({ isOpen, onClose, lead, salesReps }: LeadAssignmentModalProps) {
  const [selectedRep, setSelectedRep] = useState<string>("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignLeadMutation = useMutation({
    mutationFn: async (data: { leadId: number; assignedTo: number; notes?: string }) => {
      const response = await apiRequest("POST", "/api/leads/assign", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Lead Assigned",
        description: `Lead assigned successfully to ${salesReps.find(r => r.id === parseInt(selectedRep))?.username}`,
      });
      onClose();
      setSelectedRep("");
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (!lead || !selectedRep) return;
    
    assignLeadMutation.mutate({
      leadId: lead.id,
      assignedTo: parseInt(selectedRep),
      notes
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {lead && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">{lead.firstName} {lead.lastName}</h3>
              <p className="text-sm text-gray-600">{lead.company}</p>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
          )}
          
          <div>
            <Label htmlFor="salesRep">Assign to Sales Rep</Label>
            <Select value={selectedRep} onValueChange={setSelectedRep}>
              <SelectTrigger>
                <SelectValue placeholder="Select sales representative" />
              </SelectTrigger>
              <SelectContent>
                {salesReps.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id.toString()}>
                    {rep.username} ({rep.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Assignment Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this assignment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedRep || assignLeadMutation.isPending}
            >
              {assignLeadMutation.isPending ? "Assigning..." : "Assign Lead"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SalesPipeline() {
  const [selectedLead, setSelectedLead] = useState<Contact | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filterByRep, setFilterByRep] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/users/me"],
  });

  const salesReps = users.filter(user => user.role === 'sales_rep' || user.role === 'admin');

  // Filter contacts based on user role and selected filter
  const filteredContacts = contacts.filter(contact => {
    // If user is sales rep, only show their assigned leads
    if (currentUser?.role === 'sales_rep') {
      return contact.assignedTo === currentUser.id;
    }
    
    // If filtering by specific rep
    if (filterByRep !== "all") {
      return contact.assignedTo === parseInt(filterByRep);
    }
    
    return true;
  });

  // Group contacts by pipeline stage
  const stagesWithLeads: PipelineStage[] = pipelineStages.map(stage => ({
    ...stage,
    leads: filteredContacts.filter(contact => contact.pipelineStage === stage.id)
  }));

  const updateStageMutation = useMutation({
    mutationFn: async (data: { contactId: number; newStage: string }) => {
      const response = await apiRequest("PATCH", `/api/contacts/${data.contactId}`, {
        pipelineStage: data.newStage
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pipeline stage",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const contactId = parseInt(draggableId);
    const newStage = destination.droppableId;

    updateStageMutation.mutate({ contactId, newStage });
  };

  const getLeadValue = (contact: Contact) => {
    return contact.dealValue || contact.budget || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getAssignedRepName = (assignedTo: number | null) => {
    if (!assignedTo) return "Unassigned";
    const rep = users.find(u => u.id === assignedTo);
    return rep ? rep.username : "Unknown";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-2">Track and manage your sales opportunities</p>
        </div>
        
        <div className="flex items-center gap-3">
          {currentUser?.role !== 'sales_rep' && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select value={filterByRep} onValueChange={setFilterByRep}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales Reps</SelectItem>
                  {salesReps.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id.toString()}>
                      {rep.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{filteredContacts.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(filteredContacts.reduce((sum, contact) => sum + getLeadValue(contact), 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Won This Month</p>
                <p className="text-2xl font-bold">
                  {stagesWithLeads.find(s => s.id === 'closed_won')?.leads.length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {filteredContacts.length > 0 
                    ? Math.round(((stagesWithLeads.find(s => s.id === 'closed_won')?.leads.length || 0) / filteredContacts.length) * 100)
                    : 0}%
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 min-h-[600px]">
          {stagesWithLeads.map((stage) => (
            <div key={stage.id} className="space-y-3">
              <div className={`p-3 rounded-lg border-2 ${stage.color}`}>
                <h3 className="font-semibold text-center">{stage.name}</h3>
                <p className="text-sm text-center text-gray-600">
                  {stage.leads.length} leads • {formatCurrency(stage.leads.reduce((sum, lead) => sum + getLeadValue(lead), 0))}
                </p>
              </div>
              
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[400px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {stage.leads.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-transform ${
                              snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                            }`}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm">
                                      {lead.firstName} {lead.lastName}
                                    </h4>
                                    <p className="text-xs text-gray-600">{lead.company}</p>
                                  </div>
                                  
                                  {currentUser?.role !== 'sales_rep' && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedLead(lead);
                                            setIsAssignModalOpen(true);
                                          }}
                                        >
                                          <UserPlus className="h-3 w-3 mr-2" />
                                          Assign Rep
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <Badge className={getPriorityColor(lead.priority || 'medium')} variant="secondary">
                                    {lead.priority || 'medium'}
                                  </Badge>
                                  {getLeadValue(lead) > 0 && (
                                    <span className="text-xs font-semibold text-green-600">
                                      {formatCurrency(getLeadValue(lead))}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <span>{getAssignedRepName(lead.assignedTo)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className="flex gap-1">
                                    {lead.phone && (
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <Phone className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {lead.email && (
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <Mail className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {lead.nextFollowUpAt && (
                                    <span className="text-xs text-orange-600">
                                      Follow up: {new Date(lead.nextFollowUpAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <LeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        lead={selectedLead}
        salesReps={salesReps}
      />
    </div>
  );
}