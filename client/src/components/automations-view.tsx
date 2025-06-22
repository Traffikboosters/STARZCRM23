import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Play, Pause, Edit, Trash2, Zap, Clock, Mail, UserPlus, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { insertAutomationSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Automation } from "@shared/schema";

const automationFormSchema = insertAutomationSchema.extend({
  trigger: z.string(),
  actions: z.string(),
});

type AutomationFormData = z.infer<typeof automationFormSchema>;

interface TriggerOption {
  id: string;
  label: string;
  icon: any;
  description: string;
}

interface ActionOption {
  id: string;
  label: string;
  icon: any;
  description: string;
}

export default function AutomationsView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string>("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: automations = [], isLoading } = useQuery<Automation[]>({
    queryKey: ['/api/automations'],
  });

  const triggerOptions: TriggerOption[] = [
    {
      id: "file_upload",
      label: "File Upload",
      icon: FileText,
      description: "Trigger when a new file is uploaded"
    },
    {
      id: "contact_created",
      label: "New Contact",
      icon: UserPlus,
      description: "Trigger when a new contact is added"
    },
    {
      id: "event_created",
      label: "New Event",
      icon: Clock,
      description: "Trigger when a new event is scheduled"
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: Clock,
      description: "Trigger on a recurring schedule"
    }
  ];

  const actionOptions: ActionOption[] = [
    {
      id: "send_email",
      label: "Send Email",
      icon: Mail,
      description: "Send an automated email"
    },
    {
      id: "create_task",
      label: "Create Task",
      icon: Plus,
      description: "Create a new task or event"
    },
    {
      id: "update_contact",
      label: "Update Contact",
      icon: UserPlus,
      description: "Update contact information"
    },
    {
      id: "send_notification",
      label: "Send Notification",
      icon: Bell,
      description: "Send a system notification"
    }
  ];

  const form = useForm<AutomationFormData>({
    resolver: zodResolver(automationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      trigger: "",
      actions: "",
      isActive: true,
    },
  });

  const createAutomationMutation = useMutation({
    mutationFn: async (data: AutomationFormData) => {
      const automationData = {
        ...data,
        trigger: JSON.parse(data.trigger),
        actions: JSON.parse(data.actions),
      };
      
      const response = await apiRequest("POST", "/api/automations", automationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
      toast({
        title: "Automation created",
        description: "Your automation has been successfully created.",
      });
      setIsCreateModalOpen(false);
      form.reset();
      setSelectedTrigger("");
      setSelectedActions([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create automation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/automations/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
      toast({
        title: "Automation updated",
        description: "Automation status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update automation status.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AutomationFormData) => {
    if (!selectedTrigger || selectedActions.length === 0) {
      toast({
        title: "Incomplete configuration",
        description: "Please select a trigger and at least one action.",
        variant: "destructive",
      });
      return;
    }

    const triggerData = JSON.stringify({ type: selectedTrigger });
    const actionsData = JSON.stringify(selectedActions.map(action => ({ type: action })));

    createAutomationMutation.mutate({
      ...data,
      trigger: triggerData,
      actions: actionsData,
    });
  };

  const getTriggerIcon = (automation: Automation) => {
    const trigger = automation.trigger as any;
    const triggerType = trigger?.type || "unknown";
    const option = triggerOptions.find(t => t.id === triggerType);
    const Icon = option?.icon || Zap;
    return <Icon className="h-4 w-4" />;
  };

  const toggleAutomation = (id: number, currentStatus: boolean) => {
    toggleAutomationMutation.mutate({ id, isActive: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-lighter px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-neutral-dark">Automations</h2>
            <Badge variant="secondary" className="text-xs">
              {automations.filter(a => a.isActive).length} active
            </Badge>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-primary text-white hover:bg-brand-secondary">
                <Plus className="h-4 w-4 mr-2" />
                New Automation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Automation</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Automation Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter automation name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 mt-8">
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Active</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Describe what this automation does..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Trigger Selection */}
                  <div>
                    <FormLabel className="text-base font-medium">Trigger</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {triggerOptions.map((trigger) => {
                        const Icon = trigger.icon;
                        return (
                          <Card 
                            key={trigger.id}
                            className={`cursor-pointer transition-colors ${
                              selectedTrigger === trigger.id 
                                ? 'ring-2 ring-brand-primary bg-brand-primary bg-opacity-5' 
                                : 'hover:bg-neutral-lightest'
                            }`}
                            onClick={() => setSelectedTrigger(trigger.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <Icon className="h-5 w-5 text-brand-primary mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-neutral-dark">{trigger.label}</h4>
                                  <p className="text-sm text-neutral-medium">{trigger.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Actions Selection */}
                  <div>
                    <FormLabel className="text-base font-medium">Actions</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {actionOptions.map((action) => {
                        const Icon = action.icon;
                        const isSelected = selectedActions.includes(action.id);
                        return (
                          <Card 
                            key={action.id}
                            className={`cursor-pointer transition-colors ${
                              isSelected 
                                ? 'ring-2 ring-brand-primary bg-brand-primary bg-opacity-5' 
                                : 'hover:bg-neutral-lightest'
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedActions(prev => prev.filter(id => id !== action.id));
                              } else {
                                setSelectedActions(prev => [...prev, action.id]);
                              }
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <Icon className="h-5 w-5 text-brand-primary mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-neutral-dark">{action.label}</h4>
                                  <p className="text-sm text-neutral-medium">{action.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-brand-primary text-white hover:bg-brand-secondary"
                      disabled={createAutomationMutation.isPending}
                    >
                      {createAutomationMutation.isPending ? "Creating..." : "Create Automation"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-neutral-lightest p-6 overflow-auto">
        {automations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <p className="text-neutral-medium text-lg mb-4">No automations yet</p>
            <Button 
              className="bg-brand-primary text-white hover:bg-brand-secondary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Automation
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations.map((automation) => (
              <Card key={automation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTriggerIcon(automation)}
                      <CardTitle className="text-lg text-neutral-dark">{automation.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={() => toggleAutomation(automation.id, automation.isActive)}
                        disabled={toggleAutomationMutation.isPending}
                      />
                      <Badge variant={automation.isActive ? "default" : "secondary"}>
                        {automation.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {automation.description && (
                      <p className="text-sm text-neutral-medium">{automation.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-neutral-dark">Trigger:</span>
                        <span className="text-neutral-medium">
                          {triggerOptions.find(t => t.id === (automation.trigger as any)?.type)?.label || "Unknown"}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-neutral-dark">Actions:</span>
                        <span className="text-neutral-medium">
                          {Array.isArray(automation.actions) && automation.actions.length > 0
                            ? `${automation.actions.length} action${automation.actions.length > 1 ? 's' : ''}`
                            : "None"}
                        </span>
                      </div>
                    </div>
                    
                    {automation.lastRun && (
                      <div className="text-sm text-neutral-medium">
                        Last run: {format(new Date(automation.lastRun), "MMM d, yyyy h:mm a")}
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
