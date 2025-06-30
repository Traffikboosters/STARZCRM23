import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, Mic, Play, Pause, BarChart3, TrendingUp, TrendingDown, 
  Clock, Volume2, Target, Award, AlertTriangle, CheckCircle,
  Phone, Star, Users, MessageSquare, Heart, Brain, FileAudio,
  Activity, Zap, Shield, Coffee, ChevronRight, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CallRecording {
  id: number;
  customerName: string;
  industry: string;
  callType: string;
  duration: number;
  callDate: string;
  callOutcome: string;
  salesRepId: number;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  recordingUrl?: string;
}

interface VoiceToneAnalysis {
  id: number;
  callRecordingId: number;
  overallTone: string;
  sentimentScore: number;
  communicationStyle: string;
  emotionalIntelligence: number;
  speakingPace: string;
  confidenceScore: number;
  enthusiasmScore: number;
  professionalismScore: number;
  empathyScore: number;
  urgencyScore: number;
  clarityScore: number;
  persuasivenessScore: number;
  friendlinessScore: number;
  analysisTimestamp: string;
}

interface CallInsights {
  id: number;
  performanceScore: number;
  improvementAreas: string[];
  strengths: string[];
  nextCallStrategy: string[];
  coachingTips: string[];
  recommendations: string[];
}

export default function VoiceToneAnalysisEnhanced() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [callType, setCallType] = useState('discovery');
  const [customerName, setCustomerName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [playingRecording, setPlayingRecording] = useState<number | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<CallRecording | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockRecordings: CallRecording[] = [
    {
      id: 1,
      customerName: "Sarah Mitchell",
      industry: "Healthcare",
      callType: "Discovery",
      duration: 18,
      callDate: "2025-01-01T10:30:00Z",
      callOutcome: "appointment_set",
      salesRepId: 1,
      analysisStatus: "completed",
      recordingUrl: "/recordings/call_001.mp3"
    },
    {
      id: 2,
      customerName: "David Rodriguez",
      industry: "Real Estate",
      callType: "Demo",
      duration: 25,
      callDate: "2025-01-01T14:15:00Z",
      callOutcome: "follow_up_scheduled",
      salesRepId: 1,
      analysisStatus: "completed",
      recordingUrl: "/recordings/call_002.mp3"
    },
    {
      id: 3,
      customerName: "Jennifer Chen",
      industry: "Technology",
      callType: "Closing",
      duration: 32,
      callDate: "2025-01-01T16:45:00Z",
      callOutcome: "deal_closed",
      salesRepId: 1,
      analysisStatus: "processing"
    }
  ];

  const mockAnalyses: VoiceToneAnalysis[] = [
    {
      id: 1,
      callRecordingId: 1,
      overallTone: "Professional",
      sentimentScore: 0.78,
      communicationStyle: "Consultative",
      emotionalIntelligence: 85,
      speakingPace: "Optimal",
      confidenceScore: 88,
      enthusiasmScore: 76,
      professionalismScore: 92,
      empathyScore: 84,
      urgencyScore: 45,
      clarityScore: 89,
      persuasivenessScore: 73,
      friendlinessScore: 82,
      analysisTimestamp: "2025-01-01T10:48:00Z"
    },
    {
      id: 2,
      callRecordingId: 2,
      overallTone: "Enthusiastic",
      sentimentScore: 0.85,
      communicationStyle: "Solution-focused",
      emotionalIntelligence: 79,
      speakingPace: "Slightly Fast",
      confidenceScore: 91,
      enthusiasmScore: 94,
      professionalismScore: 87,
      empathyScore: 78,
      urgencyScore: 62,
      clarityScore: 85,
      persuasivenessScore: 88,
      friendlinessScore: 90,
      analysisTimestamp: "2025-01-01T14:40:00Z"
    }
  ];

  const mockInsights: CallInsights[] = [
    {
      id: 1,
      performanceScore: 85,
      improvementAreas: [
        "Increase emotional intelligence by 10%",
        "Reduce speaking pace during technical explanations",
        "Add more urgency indicators when appropriate"
      ],
      strengths: [
        "Excellent professionalism throughout the call",
        "Strong clarity in communication",
        "Good empathy and listening skills"
      ],
      nextCallStrategy: [
        "Focus on value proposition early",
        "Use more industry-specific examples",
        "Ask more qualifying questions"
      ],
      coachingTips: [
        "Practice slowing down during complex topics",
        "Use emotional mirroring techniques",
        "Implement urgency-building language"
      ],
      recommendations: [
        "Schedule follow-up call within 48 hours",
        "Send industry-specific case studies",
        "Prepare customized proposal"
      ]
    }
  ];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('POST', '/api/voice-analysis/upload', formData);
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "Call recording uploaded and analysis started",
      });
      setSelectedFile(null);
      setCustomerName('');
      setSelectedIndustry('');
      queryClient.invalidateQueries({ queryKey: ['/api/voice-analysis/recordings'] });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload recording. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !customerName || !selectedIndustry) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('recording', selectedFile);
    formData.append('customerName', customerName);
    formData.append('industry', selectedIndustry);
    formData.append('callType', callType);

    uploadMutation.mutate(formData);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const industryOptions = [
    "Healthcare", "Real Estate", "Technology", "Finance", "Manufacturing",
    "Retail", "Education", "Professional Services", "Construction", "Automotive"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Voice Tone Analysis</h2>
          <p className="text-gray-600">Analyze sales call recordings for communication effectiveness and coaching insights</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{mockRecordings.length}</div>
            <div className="text-sm text-gray-600">Total Calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{mockAnalyses.length}</div>
            <div className="text-sm text-gray-600">Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {mockAnalyses.length > 0 
                ? Math.round(mockAnalyses.reduce((sum, a) => sum + ((a.confidenceScore + a.professionalismScore + a.empathyScore) / 3), 0) / mockAnalyses.length)
                : 0
              }
            </div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="upload">Upload Call</TabsTrigger>
          <TabsTrigger value="recordings">Call Library</TabsTrigger>
          <TabsTrigger value="insights">Coaching Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">87%</div>
                <p className="text-xs text-muted-foreground">+5% from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calls This Week</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">34%</div>
                <p className="text-xs text-muted-foreground">+2% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Michael T.</div>
                <p className="text-xs text-muted-foreground">92% avg score</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Analyses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Call Analyses</CardTitle>
              <CardDescription>Latest voice tone analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyses.map((analysis) => {
                  const recording = mockRecordings.find(r => r.id === analysis.callRecordingId);
                  if (!recording) return null;
                  
                  return (
                    <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{recording.customerName}</div>
                          <div className="text-sm text-gray-600">{recording.industry} • {recording.callType}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`font-medium ${getScoreColor((analysis.confidenceScore + analysis.professionalismScore + analysis.empathyScore) / 3)}`}>
                            {Math.round((analysis.confidenceScore + analysis.professionalismScore + analysis.empathyScore) / 3)}%
                          </div>
                          <div className="text-sm text-gray-600">{analysis.overallTone}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRecording(recording)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Call Recording</CardTitle>
              <CardDescription>Upload and analyze sales call recordings for performance insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="call-type">Call Type</Label>
                    <Select value={callType} onValueChange={setCallType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discovery">Discovery Call</SelectItem>
                        <SelectItem value="demo">Product Demo</SelectItem>
                        <SelectItem value="closing">Closing Call</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="objection">Objection Handling</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recording-file">Call Recording</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        id="recording-file"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="recording-file" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : "Click to upload audio file"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Supports MP3, WAV, M4A files up to 100MB
                        </div>
                      </label>
                    </div>
                  </div>

                  <Button 
                    onClick={handleUploadSubmit} 
                    disabled={!selectedFile || !customerName || !selectedIndustry || uploadMutation.isPending}
                    className="w-full"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload & Analyze"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-6">
          <div className="grid gap-6">
            {mockRecordings.map((recording) => {
              const analysis = mockAnalyses.find(a => a.callRecordingId === recording.id);
              
              return (
                <Card key={recording.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">{recording.customerName}</div>
                          <div className="text-sm text-gray-600">
                            {recording.industry} • {recording.callType} • {recording.duration} mins
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(recording.callDate).toLocaleDateString()} at {new Date(recording.callDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {recording.analysisStatus === 'completed' && analysis && (
                          <div className="text-right">
                            <Badge className={getScoreBadgeColor((analysis.confidenceScore + analysis.professionalismScore + analysis.empathyScore) / 3)}>
                              {Math.round((analysis.confidenceScore + analysis.professionalismScore + analysis.empathyScore) / 3)}% Score
                            </Badge>
                            <div className="text-sm text-gray-600 mt-1">{analysis.overallTone}</div>
                          </div>
                        )}
                        
                        {recording.analysisStatus === 'processing' && (
                          <div className="text-right">
                            <Badge variant="secondary">Processing...</Badge>
                            <div className="text-sm text-gray-600 mt-1">Analysis in progress</div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          {recording.recordingUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPlayingRecording(playingRecording === recording.id ? null : recording.id)}
                            >
                              {playingRecording === recording.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          )}
                          
                          {recording.analysisStatus === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRecording(recording)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Analysis
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {analysis && recording.analysisStatus === 'completed' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getScoreColor(analysis.confidenceScore)}`}>
                              {analysis.confidenceScore}%
                            </div>
                            <div className="text-xs text-gray-600">Confidence</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getScoreColor(analysis.empathyScore)}`}>
                              {analysis.empathyScore}%
                            </div>
                            <div className="text-xs text-gray-600">Empathy</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getScoreColor(analysis.persuasivenessScore)}`}>
                              {analysis.persuasivenessScore}%
                            </div>
                            <div className="text-xs text-gray-600">Persuasiveness</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getScoreColor(analysis.clarityScore)}`}>
                              {analysis.clarityScore}%
                            </div>
                            <div className="text-xs text-gray-600">Clarity</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {mockInsights.map((insight, index) => {
            const analysis = mockAnalyses[index];
            const recording = analysis ? mockRecordings.find(r => r.id === analysis.callRecordingId) : null;
            
            return (
              <Card key={insight.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Coaching Insights</span>
                    {recording && (
                      <span className="text-sm font-normal text-gray-600">
                        {recording.customerName} - {recording.callType}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>Performance analysis and improvement recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-green-600 mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {insight.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-orange-600 mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Improvement Areas
                      </h4>
                      <ul className="space-y-2">
                        {insight.improvementAreas.map((area, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-blue-600 mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Next Call Strategy
                      </h4>
                      <ul className="space-y-2">
                        {insight.nextCallStrategy.map((strategy, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-purple-600 mb-3 flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        Coaching Tips
                      </h4>
                      <ul className="space-y-2">
                        {insight.coachingTips.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge className={getScoreBadgeColor(insight.performanceScore)}>
                          {insight.performanceScore}% Performance Score
                        </Badge>
                        {analysis && (
                          <span className="text-sm text-gray-600">
                            Communication Style: {analysis.communicationStyle}
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Detailed Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Selected Recording Modal would go here */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Call Analysis: {selectedRecording.customerName}
              </h3>
              <Button
                variant="outline"
                onClick={() => setSelectedRecording(null)}
              >
                Close
              </Button>
            </div>
            {/* Detailed analysis view would be implemented here */}
            <div className="text-center py-8 text-gray-600">
              Detailed analysis view coming soon...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}