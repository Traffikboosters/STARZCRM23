import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Clock,
  Brain,
  Zap,
  Users,
  CheckCircle,
  TrendingUp,
  Target,
  Phone,
  Video,
  Mail,
  MapPin,
  Star,
  AlertCircle,
  Bot,
  Calendar as CalendarIcon,
  Timer,
  Sparkles
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface SmartSuggestion {
  id: string;
  type: 'optimal_time' | 'meeting_type' | 'preparation_tip' | 'follow_up';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  timeSlot?: string;
  priority: 'high' | 'medium' | 'low';
}

interface SchedulingInsight {
  bestDays: string[];
  bestTimes: string[];
  avgMeetingDuration: number;
  conversionRate: number;
  preferredMeetingTypes: { type: string; percentage: number }[];
  seasonalTrends: { month: string; bookingRate: number }[];
}

interface LeadSchedulingProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  leadSource: string;
  previousMeetings: number;
  responseTime: string;
  preferredTimes: string[];
  communicationStyle: 'formal' | 'casual' | 'technical';
  urgencyLevel: 'high' | 'medium' | 'low';
  budget: string;
  timeZone: string;
}

export default function SmartCalendarIntegration() {
  const [selectedLead, setSelectedLead] = useState<LeadSchedulingProfile | null>(null);
  const [schedulingMode, setSchedulingMode] = useState<'ai_assisted' | 'manual'>('ai_assisted');
  const [preferredMeetingType, setPreferredMeetingType] = useState('consultation');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get smart scheduling suggestions
  const { data: smartSuggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/calendar/smart-suggestions", selectedLead?.id],
    queryFn: async () => {
      if (!selectedLead) return [];
      const response = await fetch(`/api/calendar/smart-suggestions?leadId=${selectedLead.id}&meetingType=${preferredMeetingType}`);
      return response.json();
    },
    enabled: !!selectedLead
  });

  // Get scheduling insights
  const { data: schedulingInsights } = useQuery({
    queryKey: ["/api/calendar/scheduling-insights"],
    queryFn: async () => {
      const response = await fetch("/api/calendar/scheduling-insights");
      return response.json();
    }
  });

  // Get lead profiles for scheduling
  const { data: leadProfiles = [] } = useQuery({
    queryKey: ["/api/calendar/lead-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/calendar/lead-profiles");
      return response.json();
    }
  });

  // Get recent appointments
  const { data: recentAppointments = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  // Type the appointments data
  const typedAppointments = recentAppointments as any[];

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
        description: "Appointment scheduled with AI optimization"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });

  // AI meeting optimization
  const optimizeMeeting = useMutation({
    mutationFn: async (meetingData: any) => {
      const response = await fetch("/api/calendar/optimize-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData)
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Meeting Optimized",
        description: `AI suggestions applied: ${data.optimizations.join(', ')}`
      });
    }
  });

  const handleSmartSchedule = () => {
    if (!selectedLead) return;

    const appointmentData = {
      leadId: selectedLead.id,
      meetingType: preferredMeetingType,
      aiAssisted: schedulingMode === 'ai_assisted',
      preferences: {
        timeZone: selectedLead.timeZone,
        communicationStyle: selectedLead.communicationStyle,
        urgencyLevel: selectedLead.urgencyLevel
      }
    };

    scheduleAppointment.mutate(appointmentData);
  };

  const handleOptimizeMeeting = (suggestion: SmartSuggestion) => {
    if (!selectedLead) return;

    optimizeMeeting.mutate({
      leadId: selectedLead.id,
      suggestion: suggestion,
      meetingType: preferredMeetingType
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={traffikBoostersLogo} alt="Traffik Boosters" className="h-12 w-auto" />
          <div>
            <h1 className="text-3xl font-bold text-black flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-600" />
              Smart Calendar Integration
            </h1>
            <p className="text-gray-600">AI-powered sales scheduling and optimization</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Sparkles className="w-4 h-4 mr-1" />
            AI Enabled
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="smart-scheduler" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="smart-scheduler">AI Scheduler</TabsTrigger>
          <TabsTrigger value="insights">Scheduling Insights</TabsTrigger>
          <TabsTrigger value="optimization">Meeting Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="smart-scheduler" className="space-y-6">
          {/* Smart Scheduling Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Lead
                </CardTitle>
                <CardDescription>Choose a lead to schedule with AI assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {leadProfiles.slice(0, 8).map((lead: LeadSchedulingProfile) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedLead?.id === lead.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm">{lead.name}</h4>
                          <p className="text-xs text-gray-600">{lead.company}</p>
                          <p className="text-xs text-gray-500">{lead.industry}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={lead.urgencyLevel === 'high' ? 'destructive' : 
                                   lead.urgencyLevel === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {lead.urgencyLevel}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{lead.responseTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI Scheduling Suggestions
                </CardTitle>
                <CardDescription>
                  {selectedLead ? `Smart recommendations for ${selectedLead.name}` : 'Select a lead to see AI suggestions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedLead ? (
                  <div className="space-y-4">
                    {/* Lead Profile Summary */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                      <h4 className="font-semibold text-lg mb-2">{selectedLead.name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Company:</strong> {selectedLead.company}</p>
                          <p><strong>Industry:</strong> {selectedLead.industry}</p>
                          <p><strong>Source:</strong> {selectedLead.leadSource}</p>
                        </div>
                        <div>
                          <p><strong>Previous Meetings:</strong> {selectedLead.previousMeetings}</p>
                          <p><strong>Response Time:</strong> {selectedLead.responseTime}</p>
                          <p><strong>Budget:</strong> {selectedLead.budget}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Scheduling Mode</Label>
                        <Select value={schedulingMode} onValueChange={(value: string) => setSchedulingMode(value as 'ai_assisted' | 'manual')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ai_assisted">AI Assisted</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Meeting Type</Label>
                        <Select value={preferredMeetingType} onValueChange={setPreferredMeetingType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Initial Consultation</SelectItem>
                            <SelectItem value="discovery">Discovery Call</SelectItem>
                            <SelectItem value="demo">Product Demo</SelectItem>
                            <SelectItem value="proposal">Proposal Review</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="closing">Closing Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* AI Suggestions */}
                    {smartSuggestions.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-600" />
                          AI Recommendations
                        </h5>
                        {smartSuggestions.map((suggestion: SmartSuggestion) => (
                          <div key={suggestion.id} className="p-3 border rounded-lg bg-white">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {suggestion.type === 'optimal_time' && <Clock className="w-4 h-4 text-blue-600" />}
                                {suggestion.type === 'meeting_type' && <Target className="w-4 h-4 text-green-600" />}
                                {suggestion.type === 'preparation_tip' && <Brain className="w-4 h-4 text-purple-600" />}
                                {suggestion.type === 'follow_up' && <Mail className="w-4 h-4 text-orange-600" />}
                                <h6 className="font-medium text-sm">{suggestion.title}</h6>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={suggestion.priority === 'high' ? 'destructive' : 
                                         suggestion.priority === 'medium' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {suggestion.priority}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="text-xs">{Math.round(suggestion.confidence * 100)}%</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                            {suggestion.timeSlot && (
                              <p className="text-sm font-medium text-blue-600">{suggestion.timeSlot}</p>
                            )}
                            {suggestion.action && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => handleOptimizeMeeting(suggestion)}
                              >
                                {suggestion.action}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Schedule Button */}
                    <Button 
                      onClick={handleSmartSchedule}
                      disabled={scheduleAppointment.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {scheduleAppointment.isPending ? (
                        <>
                          <Timer className="w-4 h-4 mr-2 animate-spin" />
                          Processing AI Schedule...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Schedule with AI Optimization
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a lead to see AI-powered scheduling suggestions</p>
                    <p className="text-sm text-gray-400">Our AI will analyze lead behavior and recommend optimal meeting times</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Scheduling Insights Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Optimal Times</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {schedulingInsights?.bestTimes?.[0] || "10:00 AM"}
                    </p>
                    <p className="text-sm text-gray-600">Peak booking time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Conversion Rate</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {schedulingInsights?.conversionRate || 67}%
                    </p>
                    <p className="text-sm text-gray-600">Meeting to sale</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Timer className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Avg Duration</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {schedulingInsights?.avgMeetingDuration || 45} min
                    </p>
                    <p className="text-sm text-gray-600">Per meeting</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold">Best Days</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {schedulingInsights?.bestDays?.[0] || "Tuesday"}
                    </p>
                    <p className="text-sm text-gray-600">Highest success</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferred Meeting Types</CardTitle>
                <CardDescription>Most successful meeting formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedulingInsights?.preferredMeetingTypes?.map((type: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{type.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            style={{ width: `${type.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{type.percentage}%</span>
                      </div>
                    </div>
                  )) || (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Initial Consultation</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-[45%]" />
                          </div>
                          <span className="text-sm font-semibold">45%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Discovery Call</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-[30%]" />
                          </div>
                          <span className="text-sm font-semibold">30%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Product Demo</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-[25%]" />
                          </div>
                          <span className="text-sm font-semibold">25%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Booking Patterns</CardTitle>
                <CardDescription>Best days and times for scheduling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Top Performing Days</h4>
                    <div className="space-y-2">
                      {['Tuesday', 'Wednesday', 'Thursday', 'Monday', 'Friday'].map((day, index) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="text-sm">{day}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${90 - (index * 15)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{90 - (index * 15)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Peak Time Slots</h4>
                    <div className="space-y-2">
                      {['10:00 AM - 11:00 AM', '2:00 PM - 3:00 PM', '11:00 AM - 12:00 PM', '3:00 PM - 4:00 PM'].map((time, index) => (
                        <div key={time} className="flex justify-between items-center">
                          <span className="text-sm">{time}</span>
                          <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                            {index === 0 ? 'Peak' : index === 1 ? 'High' : 'Good'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Meeting Optimization Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  AI Meeting Optimizer
                </CardTitle>
                <CardDescription>Automatically improve meeting success rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
                  <h4 className="font-semibold text-lg mb-2">Current Optimizations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Smart time slot selection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Lead behavior analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Automated follow-up scheduling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Meeting preparation suggestions</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold">Optimization Settings</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-sm">Auto-schedule buffer time</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-sm">Lead timezone detection</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-sm">Smart reminder timing</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-sm">Meeting type optimization</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Success Metrics
                </CardTitle>
                <CardDescription>Track optimization performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-gray-600">Show-up Rate</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">78%</div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">42 min</div>
                    <div className="text-sm text-gray-600">Avg Duration</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">4.8/5</div>
                    <div className="text-sm text-gray-600">Client Rating</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-3">Recent Improvements</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>Show-up rate increased by 12%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>Meeting duration optimized (-8 min avg)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>Conversion rate improved by 15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Performance Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">This Month</h3>
                    <p className="text-2xl font-bold text-blue-600">247</p>
                    <p className="text-sm text-gray-600">Meetings Scheduled</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Completed</h3>
                    <p className="text-2xl font-bold text-green-600">189</p>
                    <p className="text-sm text-gray-600">Successfully Held</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold">No-Shows</h3>
                    <p className="text-2xl font-bold text-orange-600">14</p>
                    <p className="text-sm text-gray-600">Missed Meetings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Smart Scheduled Appointments</CardTitle>
              <CardDescription>AI-optimized meetings and their outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typedAppointments.slice(0, 8).map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {appointment.isVideoCall ? (
                          <Video className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Phone className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{appointment.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.startDate).toLocaleDateString()} at{' '}
                          {new Date(appointment.startDate).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={appointment.status === 'completed' ? 'default' : 
                               appointment.status === 'scheduled' ? 'secondary' : 'destructive'}
                      >
                        {appointment.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {appointment.attendees?.[0] || 'No attendee'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}