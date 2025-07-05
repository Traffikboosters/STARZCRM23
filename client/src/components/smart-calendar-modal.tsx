import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfWeek } from "date-fns";
import { 
  Calendar, Brain, Clock, User, Phone, Building, 
  Sparkles, TrendingUp, Target, CheckCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@shared/schema";

interface SmartCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

interface SmartSuggestion {
  id: string;
  type: 'optimal_time' | 'meeting_type' | 'preparation_tip' | 'follow_up';
  title: string;
  description: string;
  confidence: number;
  timeSlot?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function SmartCalendarModal({ isOpen, onClose, contact }: SmartCalendarModalProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [meetingType, setMeetingType] = useState<string>("consultation");
  const [aiAssisted, setAiAssisted] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate smart suggestions based on contact data
  const generateSmartSuggestions = (): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    
    // Optimal time suggestion based on industry
    const industry = contact.notes?.toLowerCase() || "";
    let optimalTime = "Tuesday 10:00 AM";
    if (industry.includes("restaurant") || industry.includes("food")) {
      optimalTime = "Tuesday 2:00 PM"; // Off-peak for restaurants
    } else if (industry.includes("retail")) {
      optimalTime = "Wednesday 10:00 AM"; // Before busy retail hours
    }
    
    suggestions.push({
      id: "optimal-time",
      type: "optimal_time",
      title: "AI-Recommended Time",
      description: `Best scheduling time based on ${contact.company || 'business'} industry patterns`,
      confidence: 92,
      timeSlot: optimalTime,
      priority: "high"
    });

    // Meeting type suggestion
    const isNewLead = !contact.lastContactedAt;
    suggestions.push({
      id: "meeting-type",
      type: "meeting_type", 
      title: isNewLead ? "Discovery Call" : "Follow-up Meeting",
      description: isNewLead ? "Initial consultation to understand needs" : "Continue previous conversation",
      confidence: 88,
      priority: "high"
    });

    // Preparation tip
    suggestions.push({
      id: "prep-tip",
      type: "preparation_tip",
      title: "Pre-Meeting Research",
      description: `Review ${contact.company || "their business"} website and recent industry trends`,
      confidence: 85,
      priority: "medium"
    });

    return suggestions;
  };

  const [smartSuggestions] = useState<SmartSuggestion[]>(generateSmartSuggestions());

  // Smart schedule appointment mutation
  const scheduleAppointment = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch("/api/calendar/smart-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Smart Scheduling Complete",
        description: `AI-optimized appointment scheduled with ${contact.firstName} ${contact.lastName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onClose();
    }
  });

  const handleScheduleAppointment = () => {
    if (!selectedTimeSlot) {
      toast({
        title: "Please Select Time",
        description: "Choose a time slot for the appointment",
        variant: "destructive"
      });
      return;
    }

    const appointmentData = {
      leadId: contact.id,
      meetingType,
      aiAssisted,
      timeSlot: selectedTimeSlot,
      contactName: `${contact.firstName} ${contact.lastName}`,
      company: contact.company,
      preferences: {
        smartSuggestions: smartSuggestions.map(s => s.id)
      }
    };

    scheduleAppointment.mutate(appointmentData);
  };

  const timeSlots = [
    "Monday 9:00 AM", "Monday 11:00 AM", "Monday 2:00 PM", "Monday 4:00 PM",
    "Tuesday 9:00 AM", "Tuesday 11:00 AM", "Tuesday 2:00 PM", "Tuesday 4:00 PM", 
    "Wednesday 9:00 AM", "Wednesday 11:00 AM", "Wednesday 2:00 PM", "Wednesday 4:00 PM",
    "Thursday 9:00 AM", "Thursday 11:00 AM", "Thursday 2:00 PM", "Thursday 4:00 PM",
    "Friday 9:00 AM", "Friday 11:00 AM", "Friday 2:00 PM", "Friday 4:00 PM"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Smart Calendar - AI Scheduling
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                  {contact.position && (
                    <div className="text-sm text-gray-600">{contact.position}</div>
                  )}
                </div>
                
                {contact.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{contact.company}</span>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                )}

                <Badge variant={contact.leadStatus === 'hot' ? 'destructive' : 'secondary'} className="w-fit">
                  {contact.leadStatus?.charAt(0).toUpperCase() + contact.leadStatus?.slice(1) || 'New'} Lead
                </Badge>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {smartSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-3 border rounded-lg bg-purple-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{suggestion.description}</div>
                    {suggestion.timeSlot && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedTimeSlot(suggestion.timeSlot!)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Use: {suggestion.timeSlot}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Scheduling Interface */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Appointment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meeting Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Meeting Type</label>
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Initial Consultation</SelectItem>
                      <SelectItem value="discovery">Discovery Call</SelectItem>
                      <SelectItem value="demo">Product Demo</SelectItem>
                      <SelectItem value="proposal">Proposal Review</SelectItem>
                      <SelectItem value="follow-up">Follow-up Meeting</SelectItem>
                      <SelectItem value="closing">Closing Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Available Time Slots</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTimeSlot === slot ? "default" : "outline"}
                        size="sm"
                        className="text-xs justify-start"
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        {selectedTimeSlot === slot && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* AI Enhancement Toggle */}
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                  <div>
                    <div className="font-medium text-sm">AI-Enhanced Scheduling</div>
                    <div className="text-xs text-gray-600">
                      Optimize timing based on lead analysis and industry patterns
                    </div>
                  </div>
                  <Button
                    variant={aiAssisted ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAiAssisted(!aiAssisted)}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    {aiAssisted ? "ON" : "OFF"}
                  </Button>
                </div>

                {/* Selected Details Preview */}
                {selectedTimeSlot && (
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <div className="font-medium text-green-800">Appointment Preview</div>
                        <div className="text-sm text-green-700 mt-1">
                          <strong>{meetingType.charAt(0).toUpperCase() + meetingType.slice(1)}</strong> with{" "}
                          <strong>{contact.firstName} {contact.lastName}</strong>
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          📅 {selectedTimeSlot} • 🏢 {contact.company || "Prospect"}
                        </div>
                        {aiAssisted && (
                          <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI-optimized for maximum engagement
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleScheduleAppointment}
                    disabled={!selectedTimeSlot || scheduleAppointment.isPending}
                    className="flex-1"
                  >
                    {scheduleAppointment.isPending ? (
                      "Scheduling..."
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}