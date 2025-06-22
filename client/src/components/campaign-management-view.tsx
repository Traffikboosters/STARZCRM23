import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, Filter, MoreHorizontal, Play, Pause, Stop, 
  Users, Target, DollarSign, TrendingUp, Calendar as CalendarIcon,
  Mail, Phone, MessageSquare, Share2, Edit, Trash2, UserPlus
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Campaign, Contact, User, LeadAllocation } from "@shared/schema";

const campaignFormSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Campaign type is required"),
  targetAudience: z.string().optional(),
  budget: z.number().min(0, "Budget must be positive").optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  assignedTo: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

const leadAllocationFormSchema = z.object({
  contactIds: z.array(z.number()).min(1, "Select at least one lead"),
  assignedTo: z.number().min(1, "Select team member"),
  campaignId: z.number().optional(),
  priority: z.string().default("medium"),
  notes: z.string().optional(),
  dueDate: z.date().optional(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;
type LeadAllocationFormData = z.infer<typeof leadAllocationFormSchema>;

export default function CampaignManagementView() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isAllocateLeadsOpen, setIsAllocateLeadsOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: leadAllocations = [], isLoading: allocationsLoading } = useQuery<LeadAllocation[]>({
    queryKey: ["/api/lead-allocations"],
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      return await apiRequest('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setIsCreateCampaignOpen(false);
      toast({
        title: "Campaign Created",
        description: "Campaign has been created successfully",
      });
    },
  });

  // Allocate leads mutation
  const allocateLeadsMutation = useMutation({
    mutationFn: async (data: LeadAllocationFormData) => {
      const allocations = data.contactIds.map(contactId => ({
        contactId,
        assignedTo: data.assignedTo,
        assignedBy: 1, // Current user ID
        campaignId: data.campaignId,
        priority: data.priority,
        notes: data.notes,
        dueDate: data.dueDate,
      }));

      return await Promise.all(
        allocations.map(allocation => 
          apiRequest('/api/lead-allocations', {
            method: 'POST',
            body: JSON.stringify(allocation),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-allocations"] });
      setIsAllocateLeadsOpen(false);
      setSelectedContacts([]);
      toast({
        title: "Leads Allocated",
        description: "Leads have been allocated successfully",
      });
    },
  });

  // Update campaign status mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest(`/api/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign Updated",
        description: "Campaign status has been updated",
      });
    },
  });

  // Forms
  const campaignForm = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      targetAudience: "",
      tags: [],
    },
  });

  const allocationForm = useForm<LeadAllocationFormData>({
    resolver: zodResolver(leadAllocationFormSchema),
    defaultValues: {
      contactIds: [],
      assignedTo: 0,
      priority: "medium",
      notes: "",
    },
  });

  const onCreateCampaign = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  const onAllocateLeads = (data: LeadAllocationFormData) => {
    allocateLeadsMutation.mutate({
      ...data,
      contactIds: selectedContacts,
    });
  };

  const handleContactSelect = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'social': return <Share2 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contact.leadStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    return campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (campaignsLoading || contactsLoading || usersLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
          <p className="text-gray-600">Create campaigns and allocate leads to team members</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAllocateLeadsOpen} onOpenChange={setIsAllocateLeadsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Allocate Leads
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Allocate Leads</DialogTitle>
              </DialogHeader>
              <Form {...allocationForm}>
                <form onSubmit={allocationForm.handleSubmit(onAllocateLeads)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Select Leads</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="max-h-64 overflow-y-auto border rounded-lg">
                        {filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                              selectedContacts.includes(contact.id) ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => handleContactSelect(contact.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {contact.firstName[0]}{contact.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {contact.firstName} {contact.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{contact.email}</div>
                                </div>
                              </div>
                              <Badge variant="secondary">{contact.leadStatus}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedContacts.length} contacts selected
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Allocation Details</h3>
                      <FormField
                        control={allocationForm.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign To</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.firstName} {user.lastName} ({user.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={allocationForm.control}
                        name="campaignId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign (Optional)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select campaign" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No Campaign</SelectItem>
                                {campaigns.map((campaign) => (
                                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                                    {campaign.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={allocationForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={allocationForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : "Select date"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={allocationForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Any special instructions..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAllocateLeadsOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={allocateLeadsMutation.isPending || selectedContacts.length === 0}
                    >
                      {allocateLeadsMutation.isPending ? "Allocating..." : "Allocate Leads"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <Form {...campaignForm}>
                <form onSubmit={campaignForm.handleSubmit(onCreateCampaign)} className="space-y-4">
                  <FormField
                    control={campaignForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter campaign name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={campaignForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Type</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select campaign type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email Marketing</SelectItem>
                            <SelectItem value="sms">SMS Campaign</SelectItem>
                            <SelectItem value="phone">Phone Campaign</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="direct_mail">Direct Mail</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={campaignForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Campaign description..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={campaignForm.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="0.00" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={campaignForm.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select owner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.firstName} {user.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCampaignMutation.isPending}>
                      {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getTypeIcon(campaign.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <p className="text-sm text-gray-600">{campaign.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.leads || 0}</div>
                  <div className="text-sm text-gray-600">Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{campaign.conversions || 0}</div>
                  <div className="text-sm text-gray-600">Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{campaign.clicks || 0}</div>
                  <div className="text-sm text-gray-600">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    ${((campaign.spent || 0) / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Spent</div>
                </div>
              </div>
              
              {campaign.budget && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Progress</span>
                    <span>${((campaign.spent || 0) / 100).toFixed(2)} / ${(campaign.budget / 100).toFixed(2)}</span>
                  </div>
                  <Progress value={((campaign.spent || 0) / campaign.budget) * 100} />
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {campaign.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateCampaignMutation.mutate({ id: campaign.id, status: 'active' })}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {campaign.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateCampaignMutation.mutate({ id: campaign.id, status: 'paused' })}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button 
                      size="sm"
                      onClick={() => updateCampaignMutation.mutate({ id: campaign.id, status: 'active' })}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {campaign.startDate && format(new Date(campaign.startDate), "MMM d, yyyy")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">
              Create your first campaign to start managing leads and tracking performance.
            </p>
            <Button onClick={() => setIsCreateCampaignOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}