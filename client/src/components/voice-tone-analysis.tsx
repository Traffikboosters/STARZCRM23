import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mic, 
  Upload, 
  BarChart3, 
  TrendingUp, 
  MessageCircle, 
  Brain, 
  Target,
  Calendar,
  Phone,
  User,
  Clock,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

interface CallRecording {
  id: number;
  salesRepId: number;
  contactId?: number;
  customerName: string;
  callDuration: number;
  callDate: string;
  callOutcome: string;
  transcript: string;
  transcriptionStatus: string;
  analysisStatus: string;
  createdAt: string;
}

interface VoiceToneAnalysis {
  id: number;
  callRecordingId: number;
  salesRepId: number;
  overallTone: string;
  sentimentScore: string;
  communicationStyle: string;
  emotionalIntelligence: number;
  speakingPace: string;
  wordCount: number;
  fillerWords: number;
  interruptionCount: number;
  confidenceScore: number;
  enthusiasmScore: number;
  professionalismScore: number;
  empathyScore: number;
  urgencyScore: number;
  clarityScore: number;
  persuasivenessScore: number;
  friendlinessScore: number;
  keyMoments?: Array<{
    timestamp: string;
    moment: string;
    impact: 'positive' | 'negative' | 'neutral';
    suggestion?: string;
  }>;
}

interface CallInsights {
  performanceScore: number;
  improvementAreas: string[];
  strengths: string[];
  nextCallStrategy: string[];
  coachingTips: string[];
}

export default function VoiceToneAnalysis() {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedRecording, setSelectedRecording] = useState<CallRecording | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VoiceToneAnalysis | null>(null);
  const [insights, setInsights] = useState<CallInsights | null>(null);
  const [salesRepId, setSalesRepId] = useState("1"); // Default to admin user
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch call recordings for selected sales rep
  const { data: recordings = [] } = useQuery({
    queryKey: ['/api/voice-analysis/recordings', salesRepId],
    enabled: !!salesRepId,
  });

  // Fetch users for sales rep selection
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Upload call recording mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: {
      salesRepId: number;
      contactId?: number;
      customerName: string;
      callDuration: number;
      callOutcome: string;
      transcript: string;
    }) => {
      return await apiRequest("POST", "/api/voice-analysis/upload", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Call recording uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/voice-analysis/recordings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload call recording",
        variant: "destructive",
      });
    },
  });

  // Analyze call mutation
  const analyzeMutation = useMutation({
    mutationFn: async (recordingId: number) => {
      return await apiRequest("POST", `/api/voice-analysis/analyze/${recordingId}`, {});
    },
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Voice tone analysis completed successfully",
      });
      setActiveTab("results");
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze call recording",
        variant: "destructive",
      });
    },
  });

  // Generate insights mutation
  const insightsMutation = useMutation({
    mutationFn: async (analysisId: number) => {
      return await apiRequest("POST", `/api/voice-analysis/insights/${analysisId}`, {});
    },
    onSuccess: (data) => {
      setInsights(data.insights);
      toast({
        title: "Insights Generated",
        description: "Call insights generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate insights",
        variant: "destructive",
      });
    },
  });

  const handleUpload = (formData: FormData) => {
    const data = {
      salesRepId: parseInt(formData.get('salesRepId') as string),
      contactId: formData.get('contactId') ? parseInt(formData.get('contactId') as string) : undefined,
      customerName: formData.get('customerName') as string,
      callDuration: parseInt(formData.get('callDuration') as string),
      callOutcome: formData.get('callOutcome') as string,
      transcript: formData.get('transcript') as string,
    };
    uploadMutation.mutate(data);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voice Tone Analysis</h1>
          <p className="text-gray-600 mt-2">
            Analyze sales call recordings to improve communication effectiveness and closing rates
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={salesRepId} onValueChange={setSalesRepId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Sales Rep" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Call</span>
          </TabsTrigger>
          <TabsTrigger value="recordings" className="flex items-center space-x-2">
            <Mic className="h-4 w-4" />
            <span>Recordings</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Upload Call Recording */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Call Recording</span>
              </CardTitle>
              <CardDescription>
                Upload call transcript and details for voice tone analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleUpload(formData);
                }}
                className="space-y-4"
              >
                <input type="hidden" name="salesRepId" value={salesRepId} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" name="customerName" required />
                  </div>
                  <div>
                    <Label htmlFor="callDuration">Call Duration (minutes)</Label>
                    <Input 
                      id="callDuration" 
                      name="callDuration" 
                      type="number" 
                      min="1" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="callOutcome">Call Outcome</Label>
                    <Select name="callOutcome" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment_set">Appointment Set</SelectItem>
                        <SelectItem value="follow_up_scheduled">Follow-up Scheduled</SelectItem>
                        <SelectItem value="not_interested">Not Interested</SelectItem>
                        <SelectItem value="callback_requested">Callback Requested</SelectItem>
                        <SelectItem value="deal_closed">Deal Closed</SelectItem>
                        <SelectItem value="objection_received">Objection Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contactId">Contact ID (optional)</Label>
                    <Input id="contactId" name="contactId" type="number" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="transcript">Call Transcript</Label>
                  <Textarea 
                    id="transcript" 
                    name="transcript" 
                    rows={8}
                    placeholder="Paste the full call transcript here..."
                    required 
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload Call Recording"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Call Recordings List */}
        <TabsContent value="recordings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-5 w-5" />
                <span>Call Recordings</span>
              </CardTitle>
              <CardDescription>
                Manage and analyze your uploaded call recordings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recordings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No call recordings found. Upload your first recording to get started.
                  </div>
                ) : (
                  recordings.map((recording: CallRecording) => (
                    <div
                      key={recording.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedRecording(recording)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{recording.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {recording.callDuration} min
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(recording.callDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {recording.callOutcome.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant={recording.analysisStatus === 'completed' ? 'default' : 'secondary'}
                          >
                            {recording.analysisStatus}
                          </Badge>
                          {recording.analysisStatus === 'pending' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                analyzeMutation.mutate(recording.id);
                              }}
                              disabled={analyzeMutation.isPending}
                            >
                              {analyzeMutation.isPending ? "Analyzing..." : "Analyze"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Results */}
        <TabsContent value="results" className="space-y-4">
          {analysisResult ? (
            <>
              {/* Voice Tone Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Voice Tone Metrics</span>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analysis of communication effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Confidence", score: analysisResult.confidenceScore, icon: Target },
                      { label: "Enthusiasm", score: analysisResult.enthusiasmScore, icon: TrendingUp },
                      { label: "Professionalism", score: analysisResult.professionalismScore, icon: Star },
                      { label: "Empathy", score: analysisResult.empathyScore, icon: MessageCircle },
                      { label: "Clarity", score: analysisResult.clarityScore, icon: CheckCircle },
                      { label: "Persuasiveness", score: analysisResult.persuasivenessScore, icon: Target },
                      { label: "Friendliness", score: analysisResult.friendlinessScore, icon: MessageCircle },
                      { label: "Urgency", score: analysisResult.urgencyScore, icon: AlertCircle },
                    ].map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <metric.icon className={`h-5 w-5 ${getScoreColor(metric.score)}`} />
                        </div>
                        <div className="text-2xl font-bold mb-1 text-gray-900">
                          {metric.score}%
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                        <Progress value={metric.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Communication Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Tone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {analysisResult.overallTone}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Communication Style</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {analysisResult.communicationStyle.replace('_', ' ')}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Emotional Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {analysisResult.emotionalIntelligence}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Call Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Speaking Pace</div>
                      <div className="font-medium">{analysisResult.speakingPace.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Word Count</div>
                      <div className="font-medium">{analysisResult.wordCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Filler Words</div>
                      <div className="font-medium">{analysisResult.fillerWords}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Interruptions</div>
                      <div className="font-medium">{analysisResult.interruptionCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Moments */}
              {analysisResult.keyMoments && analysisResult.keyMoments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Call Moments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.keyMoments.map((moment, index) => (
                        <div key={index} className="border-l-4 pl-4 py-2 border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant={
                                moment.impact === 'positive' ? 'default' : 
                                moment.impact === 'negative' ? 'destructive' : 'secondary'
                              }
                            >
                              {moment.timestamp} - {moment.impact}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{moment.moment}</p>
                          {moment.suggestion && (
                            <p className="text-sm text-blue-600 italic">💡 {moment.suggestion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={() => insightsMutation.mutate(analysisResult.id)}
                  disabled={insightsMutation.isPending}
                  size="lg"
                >
                  {insightsMutation.isPending ? "Generating..." : "Generate Coaching Insights"}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No analysis results available. Upload and analyze a call recording to see results.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Coaching Insights */}
        <TabsContent value="insights" className="space-y-4">
          {insights ? (
            <>
              {/* Performance Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Overall Performance Score</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-4 text-gray-900">
                      {insights.performanceScore}%
                    </div>
                    <Progress value={insights.performanceScore} className="h-4 mb-4" />
                    <Badge 
                      variant={getScoreBadgeVariant(insights.performanceScore)}
                      className="text-lg px-4 py-2"
                    >
                      {insights.performanceScore >= 80 ? "Excellent" : 
                       insights.performanceScore >= 60 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Improvement Areas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-orange-600">
                      <Target className="h-5 w-5" />
                      <span>Areas for Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.improvementAreas.map((area, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Next Call Strategy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-600">
                      <Phone className="h-5 w-5" />
                      <span>Next Call Strategy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.nextCallStrategy.map((strategy, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Phone className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Coaching Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-600">
                      <Lightbulb className="h-5 w-5" />
                      <span>Coaching Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.coachingTips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No coaching insights available. Complete a voice tone analysis to generate insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}