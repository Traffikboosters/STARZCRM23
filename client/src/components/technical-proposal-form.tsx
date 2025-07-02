import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User, Building, DollarSign, Clock, Users, FileText, Target, Zap, Calendar, Star, CheckCircle } from "lucide-react";
import type { Contact, User as UserType } from "@shared/schema";
import { canViewFinancialInfo, isTechnician } from "@/lib/auth";

const technicalProposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(1, "Description is required"),
  clientRequirements: z.string().optional(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  priority: z.string().default("medium"),
  assignedTechnician: z.number().optional(),
  serviceScope: z.array(z.string()).default([]),
  estimatedHours: z.number().optional(),
  proposedPrice: z.number().optional(),
  dueDate: z.string().optional(),
  internalNotes: z.string().optional(),
});

type TechnicalProposalFormData = z.infer<typeof technicalProposalSchema>;

interface TechnicalProposalFormProps {
  contact: Contact;
  currentUser?: UserType;
  technicians: UserType[];
  onSubmit: (data: TechnicalProposalFormData) => Promise<void>;
  onCancel: () => void;
}

const serviceTypes = [
  { value: "seo", label: "SEO Optimization", icon: Target },
  { value: "web_development", label: "Web Development", icon: FileText },
  { value: "ppc", label: "PPC Advertising", icon: DollarSign },
  { value: "content_marketing", label: "Content Marketing", icon: Zap },
  { value: "social_media", label: "Social Media Management", icon: Users },
  { value: "local_seo", label: "Local SEO", icon: Building },
  { value: "ecommerce", label: "E-commerce Solutions", icon: Star },
  { value: "analytics", label: "Analytics & Tracking", icon: CheckCircle },
];

const scopeOptions = [
  "Keyword Research & Analysis",
  "On-Page SEO Optimization", 
  "Technical SEO Audit",
  "Content Creation & Optimization",
  "Link Building Strategy",
  "Local Business Optimization",
  "Website Speed Optimization",
  "Mobile Optimization",
  "Conversion Rate Optimization",
  "Analytics Setup & Reporting",
  "Social Media Integration",
  "PPC Campaign Management",
  "Landing Page Development",
  "E-commerce Setup",
  "Custom Development",
];

export default function TechnicalProposalForm({ 
  contact, 
  currentUser, 
  technicians, 
  onSubmit, 
  onCancel 
}: TechnicalProposalFormProps) {
  const { toast } = useToast();
  const [selectedScope, setSelectedScope] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if current user can view financial information
  const showFinancialInfo = canViewFinancialInfo();
  const userIsTechnician = isTechnician();

  const form = useForm<TechnicalProposalFormData>({
    resolver: zodResolver(technicalProposalSchema),
    defaultValues: {
      title: `${contact.primaryServiceNeed || 'Digital Marketing'} Proposal for ${contact.company || contact.firstName + ' ' + contact.lastName}`,
      serviceType: contact.primaryServiceNeed?.toLowerCase().replace(' ', '_') || "seo",
      description: `Comprehensive ${contact.primaryServiceNeed || 'digital marketing'} proposal for ${contact.company || contact.firstName + ' ' + contact.lastName}. Based on initial consultation, client is looking for ${contact.serviceDescription || 'improved online presence and lead generation'}.`,
      // Only include budget information if user can view financial data
      budgetRange: showFinancialInfo ? (contact.serviceBudget || (contact.dealValue ? String(contact.dealValue) : undefined) || "5000-15000") : undefined,
      timeline: contact.serviceTimeline || contact.timeline || "4-6 weeks",
      priority: contact.urgencyLevel === 'high' ? 'high' : contact.urgencyLevel === 'critical' ? 'urgent' : 'medium',
      serviceScope: [],
      // Exclude budget information from client requirements if user is technician
      clientRequirements: contact.notes || `Client Requirements:\n• Service Type: ${contact.primaryServiceNeed || 'Digital Marketing'}\n${showFinancialInfo ? `• Budget Range: ${contact.serviceBudget || 'TBD'}\n` : ''}• Timeline: ${contact.serviceTimeline || 'TBD'}\n• Company Size: ${contact.companySize || 'Unknown'}\n• Current Provider: ${contact.currentProvider || 'None'}`,
    },
  });

  const handleScopeChange = (scope: string, checked: boolean) => {
    if (checked) {
      setSelectedScope([...selectedScope, scope]);
    } else {
      setSelectedScope(selectedScope.filter(s => s !== scope));
    }
    form.setValue('serviceScope', checked ? [...selectedScope, scope] : selectedScope.filter(s => s !== scope));
  };

  const handleSubmit = async (data: TechnicalProposalFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        serviceScope: selectedScope,
        proposedPrice: data.proposedPrice ? data.proposedPrice * 100 : undefined, // Convert to cents
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit technical proposal request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role-based notification for technicians */}
      {userIsTechnician && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <strong className="text-blue-700">Technical Team Access</strong>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Financial information (budget ranges and pricing) is restricted for technical team members. 
            Focus on delivering high-quality technical solutions while the sales team handles financial discussions.
          </p>
        </div>
      )}

      {/* Contact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Contact</Label>
              <p className="text-sm">{contact.firstName} {contact.lastName}</p>
              <p className="text-xs text-gray-500">{contact.position}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Company</Label>
              <p className="text-sm">{contact.company || 'Not provided'}</p>
              <p className="text-xs text-gray-500">Size: {contact.companySize || 'Unknown'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Service Interest</Label>
              <p className="text-sm">{contact.primaryServiceNeed || 'Digital Marketing'}</p>
              {showFinancialInfo && (
                <p className="text-xs text-gray-500">Budget: {contact.serviceBudget || 'TBD'}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Timeline</Label>
              <p className="text-sm">{contact.serviceTimeline || contact.timeline || 'TBD'}</p>
              <p className="text-xs text-gray-500">Urgency: {contact.urgencyLevel || 'Medium'}</p>
            </div>
          </div>
          {contact.notes && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <Label className="text-sm font-medium">Sales Notes</Label>
              <p className="text-xs mt-1">{contact.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposal Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proposal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypes.map((service) => (
                            <SelectItem key={service.value} value={service.value}>
                              <div className="flex items-center gap-2">
                                <service.icon className="h-4 w-4" />
                                {service.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        placeholder="Detailed description of the project requirements and goals..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Service Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Service Scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {scopeOptions.map((scope) => (
                  <div key={scope} className="flex items-center space-x-2">
                    <Checkbox
                      id={scope}
                      checked={selectedScope.includes(scope)}
                      onCheckedChange={(checked) => handleScopeChange(scope, checked as boolean)}
                    />
                    <Label htmlFor={scope} className="text-sm">
                      {scope}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Project Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid ${showFinancialInfo ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                {/* Only show budget range if user can view financial information */}
                {showFinancialInfo && (
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="$5,000 - $15,000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Timeline</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="4-6 weeks" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          placeholder="40"
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assignedTechnician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Technician (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Auto-assign to available technician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id.toString()}>
                              {tech.firstName} {tech.lastName} - {tech.department || 'Technical'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clientRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Requirements & Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        placeholder="Specific client requirements, preferences, constraints..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes (For Technical Team)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={3}
                        placeholder="Internal notes, technical considerations, client context..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? "Sending..." : "Send to Technical Team"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}