import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Phone, 
  Mail, 
  Building, 
  User, 
  Calendar, 
  FileText, 
  Plus,
  Star,
  Clock,
  DollarSign,
  Target,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatPhoneNumber } from "@/lib/utils";
import ClickToCallButton from "@/components/click-to-call-button";
import { authService } from "@/lib/auth";
import { Contact, ContactNote, LeadIntake } from "@shared/schema";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface ContactDetailsModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

const noteFormSchema = z.object({
  type: z.string(),
  subject: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  disposition: z.string().optional(),
  nextAction: z.string().optional(),
  followUpDate: z.string().optional(),
  duration: z.number().optional(),
});

const intakeFormSchema = z.object({
  qualification: z.string(),
  budget: z.number().optional(),
  authority: z.string(),
  need: z.string().min(1, "Need is required"),
  timeline: z.string(),
  currentSolution: z.string().optional(),
  competitors: z.array(z.string()).optional(),
  objections: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  score: z.number().min(1).max(100).optional(),
  notes: z.string().optional(),
});

const contactUpdateSchema = z.object({
  disposition: z.string().optional(),
  priority: z.string().optional(),
  leadStatus: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
  budget: z.number().optional(),
  timeline: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteFormSchema>;
type IntakeFormData = z.infer<typeof intakeFormSchema>;
type ContactUpdateData = z.infer<typeof contactUpdateSchema>;

export default function ContactDetailsModal({ 
  contact, 
  isOpen, 
  onClose 
}: ContactDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const currentUser = authService.getCurrentUser();
  const isManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const { data: notes = [] } = useQuery<ContactNote[]>({
    queryKey: ["/api/contact-notes", contact?.id],
    enabled: !!contact?.id,
  });

  const { data: intakes = [] } = useQuery<LeadIntake[]>({
    queryKey: ["/api/lead-intakes", contact?.id],
    enabled: !!contact?.id,
  });

  const noteForm = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      type: "call",
      content: "",
    },
  });

  const intakeForm = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      qualification: "qualified",
      authority: "decision_maker",
      need: "",
      timeline: "1_month",
    },
  });

  const contactForm = useForm<ContactUpdateData>({
    resolver: zodResolver(contactUpdateSchema),
    defaultValues: {
      disposition: contact?.disposition || "",
      priority: contact?.priority || "medium",
      leadStatus: contact?.leadStatus || "new",
      timeline: contact?.timeline || "",
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: NoteFormData) => apiRequest("POST", "/api/contact-notes", {
      ...data,
      contactId: contact?.id,
      userId: 1,
      duration: data.duration || null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-notes"] });
      noteForm.reset();
    },
  });

  const createIntakeMutation = useMutation({
    mutationFn: (data: IntakeFormData) => apiRequest("POST", "/api/lead-intakes", {
      ...data,
      contactId: contact?.id,
      userId: 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-intakes"] });
      intakeForm.reset();
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: (data: ContactUpdateData) => apiRequest("PATCH", `/api/contacts/${contact?.id}`, {
      ...data,
      nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });

  const onSubmitNote = (data: NoteFormData) => {
    createNoteMutation.mutate(data);
  };

  const onSubmitIntake = (data: IntakeFormData) => {
    createIntakeMutation.mutate(data);
  };

  const onSubmitContactUpdate = (data: ContactUpdateData) => {
    updateContactMutation.mutate(data);
  };

  if (!contact) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new": return "default";
      case "contacted": return "secondary";
      case "qualified": return "outline";
      case "proposal": return "destructive";
      case "closed_won": return "default";
      case "closed_lost": return "secondary";
      default: return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              {contact.firstName} {contact.lastName}
              <Badge variant={getStatusBadgeVariant(contact.leadStatus || "new")}>
                {contact.leadStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="h-12 w-auto"
              />
              <div className="text-right">
                <p className="text-sm font-medium text-black">More Traffik! More Sales!</p>
                <p className="text-xs text-gray-600">CRM Lead Details</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger key="overview-tab" value="overview">Overview</TabsTrigger>
            <TabsTrigger key="notes-tab" value="notes">Notes ({notes.length})</TabsTrigger>
            <TabsTrigger key="intake-tab" value="intake">Lead Intake</TabsTrigger>
            <TabsTrigger key="disposition-tab" value="disposition">Disposition</TabsTrigger>
            <TabsTrigger key="timeline-tab" value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {contact.email ? (
                      <div className="flex items-center gap-2">
                        <span>{contact.email}</span>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `mailto:${contact.email}`}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(contact.email);
                              // toast functionality would go here
                            }}
                            className="text-blue-600"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span>No email</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {contact.phone ? (
                      <div className="flex items-center gap-2">
                        <span>{formatPhoneNumber(contact.phone)}</span>
                        <ClickToCallButton 
                          phoneNumber={contact.phone} 
                          contactName={`${contact.firstName} ${contact.lastName}`}
                          variant="outline"
                          size="sm"
                          showText
                        />
                      </div>
                    ) : (
                      <span>No phone</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.company || "No company"}</span>
                  </div>
                  {contact.position && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.position}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Lead Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Lead Source - Management Only */}
                  {isManagement && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Source:</span>
                      <span>{contact.leadSource || "Unknown"}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Disposition:</span>
                    <span>{contact.disposition || "Not set"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`h-4 w-4 ${getPriorityColor(contact.priority || "medium")}`} />
                    <span className="text-muted-foreground">Priority:</span>
                    <span className="capitalize">{contact.priority || "medium"}</span>
                  </div>
                  {contact.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${(contact.budget / 100).toLocaleString()}</span>
                    </div>
                  )}
                  {contact.timeline && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{contact.timeline.replace('_', ' ')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {contact.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>General Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{contact.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...noteForm}>
                  <form onSubmit={noteForm.handleSubmit(onSubmitNote)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={noteForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="call">Call</SelectItem>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={noteForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Meeting subject..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={noteForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter note content..." rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={noteForm.control}
                        name="disposition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Disposition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select disposition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="interested">Interested</SelectItem>
                                <SelectItem value="not_interested">Not Interested</SelectItem>
                                <SelectItem value="callback">Callback</SelectItem>
                                <SelectItem value="busy">Busy</SelectItem>
                                <SelectItem value="voicemail">Voicemail</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={noteForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Call duration..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={createNoteMutation.isPending}>
                      {createNoteMutation.isPending ? "Adding..." : "Add Note"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{note.type}</Badge>
                        {note.subject && <span className="font-medium">{note.subject}</span>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{note.content}</p>
                    {note.disposition && (
                      <div className="mt-2">
                        <Badge variant="secondary">{note.disposition}</Badge>
                      </div>
                    )}
                    {note.duration && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Duration: {note.duration} minutes
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="intake" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Qualification Form</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...intakeForm}>
                  <form onSubmit={intakeForm.handleSubmit(onSubmitIntake)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={intakeForm.control}
                        name="qualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualification Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="unqualified">Unqualified</SelectItem>
                                <SelectItem value="needs_nurturing">Needs Nurturing</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={intakeForm.control}
                        name="authority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authority Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="decision_maker">Decision Maker</SelectItem>
                                <SelectItem value="influencer">Influencer</SelectItem>
                                <SelectItem value="end_user">End User</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={intakeForm.control}
                      name="need"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Needs</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="What are their specific needs and pain points?" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={intakeForm.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) * 100 : undefined)}
                                placeholder="Budget amount..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={intakeForm.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeline</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="1_month">1 Month</SelectItem>
                                <SelectItem value="3_months">3 Months</SelectItem>
                                <SelectItem value="6_months">6 Months</SelectItem>
                                <SelectItem value="1_year">1 Year</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={intakeForm.control}
                      name="score"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead Score (1-100)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="100" 
                              {...field} 
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="Lead scoring..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={createIntakeMutation.isPending}>
                      {createIntakeMutation.isPending ? "Saving..." : "Save Intake"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {intakes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Previous Intakes</h3>
                {intakes.map((intake) => (
                  <Card key={intake.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Badge variant="outline">{intake.qualification}</Badge>
                          <Badge variant="secondary">{intake.authority}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(intake.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">{intake.need}</p>
                      {intake.score && (
                        <div className="text-sm text-muted-foreground">
                          Lead Score: {intake.score}/100
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="disposition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Lead Disposition</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit(onSubmitContactUpdate)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={contactForm.control}
                        name="disposition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Disposition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select disposition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="interested">Interested</SelectItem>
                                <SelectItem value="not_interested">Not Interested</SelectItem>
                                <SelectItem value="callback">Callback Required</SelectItem>
                                <SelectItem value="do_not_call">Do Not Call</SelectItem>
                                <SelectItem value="wrong_number">Wrong Number</SelectItem>
                                <SelectItem value="busy">Busy</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={contactForm.control}
                        name="leadStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="proposal">Proposal</SelectItem>
                                <SelectItem value="closed_won">Closed Won</SelectItem>
                                <SelectItem value="closed_lost">Closed Lost</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name="nextFollowUpAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Next Follow-up</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={updateContactMutation.isPending}>
                      {updateContactMutation.isPending ? "Updating..." : "Update Disposition"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Timeline</h3>
              
              {/* Contact Creation */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Contact Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(contact.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Timeline */}
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium capitalize">{note.type}</p>
                          {note.subject && <span className="text-sm text-muted-foreground">- {note.subject}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Intakes Timeline */}
              {intakes.map((intake) => (
                <Card key={intake.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Lead Intake Completed</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          {intake.qualification} - {intake.authority}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(intake.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}