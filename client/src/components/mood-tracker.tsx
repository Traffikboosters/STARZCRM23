import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Emoji mood options
const moodEmojis = [
  { emoji: "😞", label: "Very Sad", score: 1, color: "#ef4444" },
  { emoji: "😟", label: "Sad", score: 2, color: "#f97316" },
  { emoji: "😐", label: "Neutral", score: 3, color: "#eab308" },
  { emoji: "😊", label: "Happy", score: 4, color: "#22c55e" },
  { emoji: "😃", label: "Very Happy", score: 5, color: "#10b981" },
  { emoji: "🚀", label: "Energized", score: 6, color: "#3b82f6" },
  { emoji: "💪", label: "Motivated", score: 7, color: "#8b5cf6" },
  { emoji: "🔥", label: "On Fire", score: 8, color: "#ec4899" },
  { emoji: "⭐", label: "Excellent", score: 9, color: "#f59e0b" },
  { emoji: "🏆", label: "Peak", score: 10, color: "#dc2626" }
];

// Performance factors
const performanceFactors = [
  "Energy Level",
  "Focus",
  "Confidence",
  "Team Collaboration",
  "Client Interactions",
  "Goal Achievement"
];

interface MoodEntry {
  id: number;
  userId: number;
  moodScore: number;
  notes?: string;
  performanceFactors?: Record<string, number>;
  entryDate: Date;
  createdAt: Date;
}

interface MoodTrackerProps {
  currentUserId: number;
}

export default function MoodTracker({ currentUserId }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [performanceRatings, setPerformanceRatings] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's mood entries
  const { data: moodEntries = [] } = useQuery({
    queryKey: ['/api/mood-entries/user', currentUserId],
    queryFn: () => fetch(`/api/mood-entries/user/${currentUserId}?limit=30`).then(r => r.json())
  });

  // Get mood analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/mood-analytics', currentUserId],
    queryFn: () => fetch(`/api/mood-analytics/${currentUserId}?days=30`).then(r => r.json())
  });

  // Create mood entry mutation
  const createMoodEntryMutation = useMutation({
    mutationFn: (entry: any) => fetch('/api/mood-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-entries/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mood-analytics'] });
      toast({ title: "Mood entry saved successfully!" });
      setSelectedMood(null);
      setNotes("");
      setPerformanceRatings({});
    },
    onError: () => {
      toast({ title: "Failed to save mood entry", variant: "destructive" });
    }
  });

  const handleSubmitMoodEntry = () => {
    if (!selectedMood) {
      toast({ title: "Please select your mood", variant: "destructive" });
      return;
    }

    const entry = {
      userId: currentUserId,
      moodScore: selectedMood,
      notes: notes.trim() || null,
      performanceFactors: Object.keys(performanceRatings).length > 0 ? performanceRatings : null,
      entryDate: new Date().toISOString()
    };

    createMoodEntryMutation.mutate(entry);
  };

  // Prepare chart data
  const chartData = moodEntries.slice(0, 7).reverse().map((entry: MoodEntry, index: number) => ({
    date: format(new Date(entry.entryDate), 'MMM dd'),
    mood: entry.moodScore,
    emoji: moodEmojis.find(m => m.score === entry.moodScore)?.emoji || "😐"
  }));

  const getMoodEmoji = (score: number) => {
    return moodEmojis.find(m => m.score === score)?.emoji || "😐";
  };

  const getMoodColor = (score: number) => {
    return moodEmojis.find(m => m.score === score)?.color || "#eab308";
  };

  // Get today's entry
  const todayEntry = moodEntries.find((entry: MoodEntry) => {
    const entryDate = new Date(entry.entryDate);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Daily Mood & Performance Tracker
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your daily mood and correlate it with your sales performance
        </p>
      </div>

      {/* Today's Mood Entry */}
      {!todayEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Select your current mood:</label>
              <div className="grid grid-cols-5 gap-3">
                {moodEmojis.map((mood) => (
                  <button
                    key={mood.score}
                    onClick={() => setSelectedMood(mood.score)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedMood === mood.score
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Factors */}
            {selectedMood && (
              <div>
                <label className="block text-sm font-medium mb-3">Rate your performance factors (1-10):</label>
                <div className="grid grid-cols-2 gap-4">
                  {performanceFactors.map((factor) => (
                    <div key={factor} className="flex items-center justify-between">
                      <span className="text-sm">{factor}:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setPerformanceRatings(prev => ({ ...prev, [factor]: rating }))}
                            className={`w-6 h-6 text-xs rounded ${
                              performanceRatings[factor] === rating
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedMood && (
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional):</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What's contributing to your mood today? Any specific wins or challenges?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  rows={3}
                />
              </div>
            )}

            {selectedMood && (
              <Button 
                onClick={handleSubmitMoodEntry}
                disabled={createMoodEntryMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {createMoodEntryMutation.isPending ? "Saving..." : "Save Mood Entry"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's Entry Display */}
      {todayEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ Today's Mood Recorded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getMoodEmoji(todayEntry.moodScore)}</div>
              <div>
                <div className="font-semibold">
                  {moodEmojis.find(m => m.score === todayEntry.moodScore)?.label} ({todayEntry.moodScore}/10)
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Recorded at {format(new Date(todayEntry.entryDate), 'h:mm a')}
                </div>
                {todayEntry.notes && (
                  <div className="text-sm mt-2 italic">"{todayEntry.notes}"</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Dashboard */}
      {analytics && moodEntries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📈 7-Day Mood Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 10]} />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${props.payload.emoji} ${value}/10`,
                        'Mood Score'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#ea580c" 
                      strokeWidth={3}
                      dot={{ fill: '#ea580c', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No mood data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Mood Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Mood (30 days):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(Math.round(analytics.averageMood))}</span>
                    <span className="font-semibold">{analytics.averageMood}/10</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Mood Trend:</span>
                  <span className={`font-semibold ${
                    analytics.moodTrend === 'improving' 
                      ? 'text-green-600' 
                      : analytics.moodTrend === 'declining' 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {analytics.moodTrend === 'improving' && '📈 Improving'}
                    {analytics.moodTrend === 'declining' && '📉 Declining'}
                    {analytics.moodTrend === 'stable' && '➡️ Stable'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Total Entries:</span>
                  <span className="font-semibold">{moodEntries.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Best Day:</span>
                  <div className="flex items-center gap-2">
                    {moodEntries.length > 0 && (
                      <>
                        <span className="text-xl">
                          {getMoodEmoji(Math.max(...moodEntries.map((e: MoodEntry) => e.moodScore)))}
                        </span>
                        <span className="font-semibold">
                          {Math.max(...moodEntries.map((e: MoodEntry) => e.moodScore))}/10
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Entries */}
      {moodEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Recent Mood Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodEntries.slice(0, 5).map((entry: MoodEntry) => (
                <div key={entry.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl">{getMoodEmoji(entry.moodScore)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {moodEmojis.find(m => m.score === entry.moodScore)?.label} ({entry.moodScore}/10)
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(entry.entryDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        "{entry.notes}"
                      </div>
                    )}
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