import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, Legend } from "recharts";
import { Smile, TrendingUp, Users, Calendar, Target, Zap } from "lucide-react";
import type { MoodEntry } from "@shared/schema";

// Mood options with emojis and labels
const MOOD_OPTIONS = [
  { emoji: "😊", label: "Great", score: 10, color: "bg-green-500" },
  { emoji: "😎", label: "Confident", score: 9, color: "bg-blue-500" },
  { emoji: "💪", label: "Motivated", score: 8, color: "bg-purple-500" },
  { emoji: "🔥", label: "On Fire", score: 10, color: "bg-red-500" },
  { emoji: "🎯", label: "Focused", score: 8, color: "bg-indigo-500" },
  { emoji: "😐", label: "Neutral", score: 5, color: "bg-gray-500" },
  { emoji: "😟", label: "Concerned", score: 4, color: "bg-yellow-500" },
  { emoji: "😤", label: "Frustrated", score: 3, color: "bg-orange-500" },
  { emoji: "😴", label: "Tired", score: 3, color: "bg-slate-500" },
];

const SHIFT_OPTIONS = [
  { value: "morning", label: "Morning (9AM-1PM)" },
  { value: "afternoon", label: "Afternoon (1PM-5PM)" },
  { value: "evening", label: "Evening (5PM-9PM)" },
];

const ENTRY_TYPES = [
  { value: "daily", label: "Daily Check-in" },
  { value: "pre_call", label: "Before Calling" },
  { value: "post_call", label: "After Calling" },
  { value: "weekly", label: "Weekly Summary" },
];

const moodEntrySchema = z.object({
  moodEmoji: z.string().min(1, "Please select a mood"),
  moodLabel: z.string().min(1, "Mood label is required"),
  moodScore: z.number().min(1).max(10),
  energyLevel: z.number().min(1).max(10),
  motivationLevel: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  confidenceLevel: z.number().min(1).max(10),
  notes: z.string().optional(),
  shift: z.string().min(1, "Please select shift"),
  entryType: z.string().min(1, "Please select entry type"),
});

type MoodEntryData = z.infer<typeof moodEntrySchema>;

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
  });

  // Get user's mood entries
  const { data: moodEntriesData } = useQuery({
    queryKey: ["/api/mood-entries/user", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  // Get team mood summary for today
  const { data: teamMoodSummary } = useQuery({
    queryKey: ["/api/team-mood-summary", new Date().toISOString().split('T')[0]],
  });

  const moodEntries = Array.isArray(moodEntriesData) ? moodEntriesData : [];

  const form = useForm<MoodEntryData>({
    resolver: zodResolver(moodEntrySchema),
    defaultValues: {
      moodEmoji: "",
      moodLabel: "",
      moodScore: 5,
      energyLevel: 5,
      motivationLevel: 5,
      stressLevel: 5,
      confidenceLevel: 5,
      notes: "",
      shift: getCurrentShift(),
      entryType: "daily",
    },
  });

  function getCurrentShift() {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 13) return "morning";
    if (hour >= 13 && hour < 17) return "afternoon";
    return "evening";
  }

  const createMoodEntry = useMutation({
    mutationFn: async (data: MoodEntryData) => {
      return apiRequest("POST", "/api/mood-entries", {
        ...data,
        userId: currentUser?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Mood Recorded",
        description: "Your mood has been successfully tracked!",
      });
      setShowForm(false);
      setSelectedMood(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries/user", currentUser?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (mood: typeof MOOD_OPTIONS[0]) => {
    setSelectedMood(mood);
    form.setValue("moodEmoji", mood.emoji);
    form.setValue("moodLabel", mood.label);
    form.setValue("moodScore", mood.score);
    setShowForm(true);
  };

  const onSubmit = (data: MoodEntryData) => {
    createMoodEntry.mutate(data);
  };

  // Get today's entry
  const todayEntry = moodEntries.find((entry: any) => {
    const entryDate = new Date(entry.entryDate);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });

  // Calculate mood trends for chart
  const moodTrendData = moodEntries.slice(0, 7).reverse().map((entry: any) => ({
    date: new Date(entry.entryDate).toLocaleDateString(),
    mood: entry.moodScore,
    energy: entry.energyLevel,
    motivation: entry.motivationLevel,
    stress: entry.stressLevel,
    confidence: entry.confidenceLevel,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mood Tracker</h2>
          <p className="text-muted-foreground">
            Track your daily mood and see how it correlates with your sales performance
          </p>
        </div>
        {todayEntry && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Today: {todayEntry.moodEmoji} {todayEntry.moodLabel}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Mood Entry Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5" />
              {todayEntry ? "Update Today's Mood" : "How are you feeling today?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!showForm ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {MOOD_OPTIONS.map((mood) => (
                    <Button
                      key={mood.emoji}
                      variant="outline"
                      size="lg"
                      className="h-20 flex-col gap-2 hover:scale-105 transition-transform"
                      onClick={() => handleMoodSelect(mood)}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-sm">{mood.label}</span>
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Selected Mood Display */}
                  {selectedMood && (
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                      <span className="text-4xl">{selectedMood.emoji}</span>
                      <div>
                        <h3 className="font-semibold">{selectedMood.label}</h3>
                        <p className="text-sm text-muted-foreground">Mood Score: {selectedMood.score}/10</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    {/* Energy Level */}
                    <FormField
                      control={form.control}
                      name="energyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Energy Level: {field.value}/10</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Motivation Level */}
                    <FormField
                      control={form.control}
                      name="motivationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivation Level: {field.value}/10</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Stress Level */}
                    <FormField
                      control={form.control}
                      name="stressLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stress Level: {field.value}/10</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confidence Level */}
                    <FormField
                      control={form.control}
                      name="confidenceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confidence Level: {field.value}/10</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
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
                      name="shift"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shift</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SHIFT_OPTIONS.map((shift) => (
                                <SelectItem key={shift.value} value={shift.value}>
                                  {shift.label}
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
                      name="entryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entry Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ENTRY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional context about your mood today..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={createMoodEntry.isPending}
                    >
                      {createMoodEntry.isPending ? "Recording..." : "Record Mood"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setSelectedMood(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Today's Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Today's Vibe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayEntry ? (
              <>
                <div className="text-center">
                  <div className="text-4xl mb-2">{todayEntry.moodEmoji}</div>
                  <div className="font-semibold">{todayEntry.moodLabel}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(todayEntry.entryDate).toLocaleTimeString()}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Energy</span>
                    <div className="flex items-center gap-2">
                      <Progress value={todayEntry.energyLevel * 10} className="w-16" />
                      <span className="text-sm">{todayEntry.energyLevel}/10</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Motivation</span>
                    <div className="flex items-center gap-2">
                      <Progress value={todayEntry.motivationLevel * 10} className="w-16" />
                      <span className="text-sm">{todayEntry.motivationLevel}/10</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence</span>
                    <div className="flex items-center gap-2">
                      <Progress value={todayEntry.confidenceLevel * 10} className="w-16" />
                      <span className="text-sm">{todayEntry.confidenceLevel}/10</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Stress</span>
                    <div className="flex items-center gap-2">
                      <Progress value={todayEntry.stressLevel * 10} className="w-16" />
                      <span className="text-sm">{todayEntry.stressLevel}/10</span>
                    </div>
                  </div>
                </div>

                {todayEntry.notes && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium mb-1">Notes</div>
                      <div className="text-sm text-muted-foreground">{todayEntry.notes}</div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No mood recorded today</p>
                <p className="text-xs">Record your mood to start tracking</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mood Trends Chart */}
      {moodTrendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              7-Day Mood Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8884d8" 
                  name="Mood Score"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#82ca9d" 
                  name="Energy"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="motivation" 
                  stroke="#ffc658" 
                  name="Motivation"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#ff7c7c" 
                  name="Confidence"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Mood History */}
      {moodEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Mood History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodEntries.slice(0, 5).map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.moodEmoji}</span>
                    <div>
                      <div className="font-medium">{entry.moodLabel}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.entryDate).toLocaleDateString()} • {entry.shift} • {entry.entryType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>Score: {entry.moodScore}/10</div>
                    <div className="text-muted-foreground">
                      E:{entry.energyLevel} M:{entry.motivationLevel} C:{entry.confidenceLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}