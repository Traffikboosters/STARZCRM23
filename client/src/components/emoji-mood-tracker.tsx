import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Clock, 
  Target, 
  Trophy,
  MessageCircle,
  Heart,
  Zap,
  RefreshCw
} from "lucide-react";

interface MoodEntry {
  id: string;
  userId: number;
  emoji: string;
  moodScore: number;
  moodLabel: string;
  energyLevel: number;
  confidence: number;
  notes?: string;
  timestamp: Date;
  performanceMetrics?: {
    callsMade: number;
    leadsGenerated: number;
    dealsClosedValue: number;
    meetingsScheduled: number;
  };
}

interface MoodAnalytics {
  averageMood: number;
  moodTrend: 'up' | 'down' | 'stable';
  bestPerformanceMood: string;
  correlationScore: number;
  weeklyPattern: Array<{ day: string; mood: number; performance: number }>;
  recommendations: string[];
}

interface MoodTrackerProps {
  currentUserId: number;
}

export default function EmojiMoodTracker({ currentUserId }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; score: number; label: string } | null>(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [notes, setNotes] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mood options with emojis
  const moodOptions = [
    { emoji: "😄", score: 10, label: "Excellent", color: "bg-green-100 text-green-800" },
    { emoji: "😊", score: 9, label: "Great", color: "bg-green-100 text-green-700" },
    { emoji: "🙂", score: 8, label: "Good", color: "bg-blue-100 text-blue-800" },
    { emoji: "😐", score: 7, label: "Okay", color: "bg-blue-100 text-blue-700" },
    { emoji: "😌", score: 6, label: "Neutral", color: "bg-gray-100 text-gray-800" },
    { emoji: "😕", score: 5, label: "Meh", color: "bg-yellow-100 text-yellow-800" },
    { emoji: "😟", score: 4, label: "Low", color: "bg-orange-100 text-orange-800" },
    { emoji: "😞", score: 3, label: "Down", color: "bg-red-100 text-red-700" },
    { emoji: "😢", score: 2, label: "Sad", color: "bg-red-100 text-red-800" },
    { emoji: "😤", score: 1, label: "Frustrated", color: "bg-red-200 text-red-900" }
  ];

  // Mock mood history data
  const moodHistory: MoodEntry[] = [
    {
      id: "1",
      userId: currentUserId,
      emoji: "😊",
      moodScore: 9,
      moodLabel: "Great",
      energyLevel: 8,
      confidence: 9,
      notes: "Closed two major deals today!",
      timestamp: new Date(Date.now() - 3600000),
      performanceMetrics: {
        callsMade: 25,
        leadsGenerated: 8,
        dealsClosedValue: 15000,
        meetingsScheduled: 4
      }
    },
    {
      id: "2",
      userId: currentUserId,
      emoji: "😐",
      moodScore: 7,
      moodLabel: "Okay",
      energyLevel: 6,
      confidence: 7,
      notes: "Average day, had some challenging prospects",
      timestamp: new Date(Date.now() - 86400000),
      performanceMetrics: {
        callsMade: 18,
        leadsGenerated: 3,
        dealsClosedValue: 2500,
        meetingsScheduled: 2
      }
    },
    {
      id: "3",
      userId: currentUserId,
      emoji: "😄",
      moodScore: 10,
      moodLabel: "Excellent",
      energyLevel: 10,
      confidence: 10,
      notes: "Everything went perfectly! Team meeting was inspiring.",
      timestamp: new Date(Date.now() - 172800000),
      performanceMetrics: {
        callsMade: 30,
        leadsGenerated: 12,
        dealsClosedValue: 22000,
        meetingsScheduled: 6
      }
    }
  ];

  // Mock analytics data
  const analytics: MoodAnalytics = {
    averageMood: 8.5,
    moodTrend: 'up',
    bestPerformanceMood: "😄",
    correlationScore: 85,
    weeklyPattern: [
      { day: "Mon", mood: 7.5, performance: 75 },
      { day: "Tue", mood: 8.2, performance: 82 },
      { day: "Wed", mood: 9.1, performance: 91 },
      { day: "Thu", mood: 8.8, performance: 88 },
      { day: "Fri", mood: 9.5, performance: 95 },
      { day: "Sat", mood: 8.0, performance: 80 },
      { day: "Sun", mood: 7.8, performance: 78 }
    ],
    recommendations: [
      "Your performance peaks when mood is 9+ - try starting days with positive activities",
      "Wednesday and Friday show strongest correlation between mood and sales",
      "Consider mood check-ins before important client calls",
      "Energy levels above 8 correlate with 23% higher close rates"
    ]
  };

  const submitMoodEntry = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Mood Logged",
        description: "Your mood entry has been recorded successfully",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      
      // Reset form
      setSelectedMood(null);
      setEnergyLevel(5);
      setConfidence(5);
      setNotes("");
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log mood entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmitMood = () => {
    if (!selectedMood) return;

    const moodData = {
      userId: currentUserId,
      emoji: selectedMood.emoji,
      moodScore: selectedMood.score,
      moodLabel: selectedMood.label,
      energyLevel,
      confidence,
      notes,
      timestamp: new Date().toISOString()
    };

    submitMoodEntry.mutate(moodData);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Current Mood Logger */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-600" />
            How are you feeling today?
          </CardTitle>
          <p className="text-gray-600">Track your mood to optimize sales performance</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Select your current mood:
            </label>
            <div className="grid grid-cols-5 gap-3">
              {moodOptions.map((mood) => (
                <Button
                  key={mood.emoji}
                  variant={selectedMood?.emoji === mood.emoji ? "default" : "outline"}
                  className={`h-20 flex-col ${selectedMood?.emoji === mood.emoji ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  onClick={() => setSelectedMood(mood)}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedMood && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-center">
                <span className="text-4xl">{selectedMood.emoji}</span>
                <p className="font-medium text-purple-800 mt-2">
                  Feeling {selectedMood.label} (Score: {selectedMood.score}/10)
                </p>
              </div>

              {/* Energy Level */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Energy Level: {energyLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Confidence Level */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Confidence: {confidence}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Notes (Optional)
                </label>
                <Textarea
                  placeholder="What's contributing to your mood today? Any specific wins or challenges?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleSubmitMood}
                disabled={submitMoodEntry.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {submitMoodEntry.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Logging Mood...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Log My Mood
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Correlation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Mood-Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-800">{analytics.averageMood.toFixed(1)}/10</p>
                <p className="text-sm text-blue-600">Average Mood</p>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(analytics.moodTrend)}
                  <span className="text-xs ml-1 capitalize">{analytics.moodTrend}</span>
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-800">{analytics.correlationScore}%</p>
                <p className="text-sm text-green-600">Mood-Performance Correlation</p>
                <p className="text-xs text-green-500 mt-1">Strong positive link</p>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Best Performance Mood</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{analytics.bestPerformanceMood}</span>
                <span className="text-yellow-700">
                  {moodOptions.find(m => m.emoji === analytics.bestPerformanceMood)?.label} mood
                  correlates with highest sales performance
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Recent Mood Entries
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodHistory.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{entry.moodLabel}</p>
                      <p className="text-xs text-gray-500">
                        {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{entry.moodScore}/10</p>
                    {entry.performanceMetrics && (
                      <p className="text-xs text-gray-500">
                        ${entry.performanceMetrics.dealsClosedValue.toLocaleString()} closed
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            AI Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-orange-800">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Pattern Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Weekly Mood & Performance Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {analytics.weeklyPattern.map((day) => (
              <div key={day.day} className="text-center p-3 border rounded-lg">
                <p className="font-medium text-sm text-gray-700">{day.day}</p>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-600">Mood</div>
                  <div className="text-lg font-bold text-purple-600">{day.mood.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Performance</div>
                  <div className={`text-lg font-bold ${getPerformanceColor(day.performance)}`}>
                    {day.performance}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Complete Mood History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {moodHistory.map((entry) => (
              <div key={entry.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{entry.emoji}</span>
                    <div>
                      <p className="font-medium">{entry.moodLabel}</p>
                      <p className="text-sm text-gray-600">
                        {entry.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">{entry.moodScore}/10</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>Energy: {entry.energyLevel}</span>
                      <span>Confidence: {entry.confidence}</span>
                    </div>
                  </div>
                </div>
                
                {entry.notes && (
                  <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                    <MessageCircle className="h-4 w-4 inline mr-2 text-gray-600" />
                    {entry.notes}
                  </div>
                )}
                
                {entry.performanceMetrics && (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-lg font-bold text-blue-600">{entry.performanceMetrics.callsMade}</p>
                      <p className="text-xs text-blue-500">Calls</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-lg font-bold text-green-600">{entry.performanceMetrics.leadsGenerated}</p>
                      <p className="text-xs text-green-500">Leads</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <p className="text-lg font-bold text-purple-600">${(entry.performanceMetrics.dealsClosedValue / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-purple-500">Deals</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded">
                      <p className="text-lg font-bold text-orange-600">{entry.performanceMetrics.meetingsScheduled}</p>
                      <p className="text-xs text-orange-500">Meetings</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}