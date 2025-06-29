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
  Activity, Zap, Shield, Coffee
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CallRecording {
  id: number;
  callId: string;
  participantName: string;
  duration: number;
  fileUrl: string;
  fileSize: number;
  recordingDate: string;
  callType: string;
  contactId?: number;
  salesRepId: number;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

interface VoiceToneAnalysis {
  id: number;
  recordingId: number;
  overallTone: string;
  confidence: number;
  emotionalMetrics: {
    enthusiasm: number;
    empathy: number;
    assertiveness: number;
    nervousness: number;
    professionalism: number;
  };
  speakingPatterns: {
    averagePace: number;
    pauseFrequency: number;
    volumeVariation: number;
    tonalRange: number;
  };
  keyMoments: Array<{
    timestamp: number;
    moment: string;
    tone: string;
    importance: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
  salesScore: number;
  createdAt: string;
}

export default function VoiceToneAnalysisComplete() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [callType, setCallType] = useState('discovery');
  const [participantName, setParticipantName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [playingRecording, setPlayingRecording] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch call recordings
  const { data: recordings = [], isLoading: recordingsLoading } = useQuery({
    queryKey: ['/api/voice-analysis/recordings'],
  });

  // Fetch voice analyses
  const { data: analyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ['/api/voice-analysis/analyses'],
  });

  // Upload recording mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; callType: string; participantName: string; industry: string; contactId?: number }) => {
      const formData = new FormData();
      formData.append('recording', data.file);
      formData.append('callType', data.callType);
      formData.append('participantName', data.participantName);
      formData.append('industry', data.industry);
      if (data.contactId) formData.append('contactId', data.contactId.toString());

      const response = await fetch('/api/voice-analysis/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recording Uploaded",
        description: "Voice tone analysis will begin shortly",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/voice-analysis/recordings'] });
      setSelectedFile(null);
      setParticipantName('');
      setSelectedIndustry('');
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload recording",
        variant: "destructive",
      });
    },
  });

  // Analyze recording mutation
  const analyzeMutation = useMutation({
    mutationFn: async (recordingId: number) => {
      return apiRequest('POST', `/api/voice-analysis/${recordingId}/analyze`);
    },
    onSuccess: () => {
      toast({
        title: "Analysis Started",
        description: "Voice tone analysis is processing",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/voice-analysis/recordings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/voice-analysis/analyses'] });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an audio file (MP3, WAV)",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile && participantName.trim() && selectedIndustry) {
      uploadMutation.mutate({
        file: selectedFile,
        callType,
        participantName: participantName.trim(),
        industry: selectedIndustry
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please select a file, enter participant name, and choose an industry",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getToneColor = (tone: string) => {
    const colors: Record<string, string> = {
      'positive': 'text-green-600',
      'neutral': 'text-gray-600',
      'negative': 'text-red-600',
      'enthusiastic': 'text-blue-600',
      'professional': 'text-purple-600',
      'concerned': 'text-orange-600',
    };
    return colors[tone] || 'text-gray-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Voice Tone Analysis</h2>
          <p className="text-gray-600">Analyze sales call recordings for communication effectiveness and coaching insights</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{recordings.length}</div>
            <div className="text-sm text-gray-600">Recordings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analyses.length}</div>
            <div className="text-sm text-gray-600">Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analyses.length > 0 
                ? Math.round(analyses.reduce((sum: any, a: any) => sum + a.salesScore, 0) / analyses.length)
                : 0
              }
            </div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Call Recording
              </CardTitle>
              <CardDescription>
                Upload audio files to analyze voice tone, emotional intelligence, and communication patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop audio files here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports MP3, WAV files up to 100MB</p>
                </div>
                <Input
                  type="file"
                  accept="audio/*,.mp3,.wav"
                  onChange={handleFileUpload}
                  className="mt-4 cursor-pointer"
                />
              </div>

              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FileAudio className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">{selectedFile.name}</p>
                        <p className="text-sm text-blue-700">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-blue-900">Call Type</Label>
                      <select 
                        className="w-full mt-1 p-2 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        value={callType}
                        onChange={(e) => setCallType(e.target.value)}
                      >
                        <option value="discovery">Discovery Call</option>
                        <option value="demo">Product Demo</option>
                        <option value="closing">Closing Call</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="objection">Objection Handling</option>
                        <option value="consultation">Consultation</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-blue-900">Industry</Label>
                      <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                        <SelectTrigger className="mt-1 border-blue-300 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurants">Restaurants & Food Service</SelectItem>
                          <SelectItem value="retail">Retail & E-commerce</SelectItem>
                          <SelectItem value="automotive">Automotive Services</SelectItem>
                          <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                          <SelectItem value="professional">Professional Services</SelectItem>
                          <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                          <SelectItem value="home_services">Home Services & Contractors</SelectItem>
                          <SelectItem value="real_estate">Real Estate</SelectItem>
                          <SelectItem value="education">Education & Training</SelectItem>
                          <SelectItem value="entertainment">Entertainment & Events</SelectItem>
                          <SelectItem value="technology">Technology & Software</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing & Industrial</SelectItem>
                          <SelectItem value="fitness">Fitness & Wellness</SelectItem>
                          <SelectItem value="financial">Financial Services</SelectItem>
                          <SelectItem value="legal">Legal Services</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="travel">Travel & Hospitality</SelectItem>
                          <SelectItem value="construction">Construction & Engineering</SelectItem>
                          <SelectItem value="consulting">Business Consulting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-blue-900">Participant Name</Label>
                      <Input 
                        placeholder="Enter prospect/client name" 
                        className="mt-1 border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending || !participantName.trim() || !selectedIndustry}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Uploading & Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Upload & Analyze Recording
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-6">
          <div className="grid gap-4">
            {recordingsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading recordings...</p>
              </div>
            ) : recordings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recordings found</h3>
                  <p className="text-gray-600 mb-4">Upload your first call recording to get started with voice tone analysis.</p>
                  <Button onClick={() => setActiveTab('upload')} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Recording
                  </Button>
                </CardContent>
              </Card>
            ) : (
              recordings.map((recording: CallRecording) => (
                <Card key={recording.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{recording.participantName}</h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {recording.callType.replace('_', ' ')} • {formatDuration(recording.duration)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(recording.recordingDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={recording.analysisStatus === 'completed' ? 'default' : 
                                  recording.analysisStatus === 'processing' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {recording.analysisStatus === 'processing' && (
                            <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"></div>
                          )}
                          {recording.analysisStatus}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlayingRecording(playingRecording === recording.id ? null : recording.id)}
                        >
                          {playingRecording === recording.id ? 
                            <Pause className="h-4 w-4" /> : 
                            <Play className="h-4 w-4" />
                          }
                        </Button>
                        
                        {recording.analysisStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => analyzeMutation.mutate(recording.id)}
                            disabled={analyzeMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {analyzeMutation.isPending ? (
                              <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                            ) : (
                              <Brain className="h-4 w-4 mr-1" />
                            )}
                            Analyze
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6">
            {analysesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading analyses...</p>
              </div>
            ) : analyses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No analyses available</h3>
                  <p className="text-gray-600 mb-4">Upload and analyze call recordings to see detailed insights.</p>
                  <Button onClick={() => setActiveTab('upload')} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ) : (
              analyses.map((analysis: VoiceToneAnalysis) => (
                <Card key={analysis.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Brain className="h-6 w-6 mr-2 text-blue-600" />
                        Voice Analysis Report
                      </CardTitle>
                      <Badge variant={getScoreBadgeVariant(analysis.salesScore)} className="px-3 py-1">
                        Sales Score: {analysis.salesScore}/100
                      </Badge>
                    </div>
                    <CardDescription>
                      Overall tone: <span className={`font-semibold ${getToneColor(analysis.overallTone)}`}>
                        {analysis.overallTone}
                      </span> • Confidence: {analysis.confidence}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Emotional Intelligence Metrics */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-red-500" />
                        Emotional Intelligence Metrics
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {Object.entries(analysis.emotionalMetrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="relative w-20 h-20 mx-auto mb-3">
                              <div className="w-full h-full bg-gray-200 rounded-full"></div>
                              <div 
                                className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-full transition-transform duration-500"
                                style={{ transform: `scale(${Math.sqrt(value / 100)})` }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-gray-700">{value}%</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium capitalize text-gray-700">{key}</p>
                            <Progress value={value} className="mt-1 h-1" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Speaking Patterns */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <Volume2 className="h-5 w-5 mr-2 text-purple-500" />
                        Speaking Patterns Analysis
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-blue-700">
                            {analysis.speakingPatterns.averagePace}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">Words/Min</div>
                          <div className="text-xs text-gray-600">Average Pace</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                          <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-green-700">
                            {analysis.speakingPatterns.pauseFrequency}
                          </div>
                          <div className="text-xs text-green-600 font-medium">Per Minute</div>
                          <div className="text-xs text-gray-600">Pause Frequency</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                          <Volume2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-purple-700">
                            {analysis.speakingPatterns.volumeVariation}%
                          </div>
                          <div className="text-xs text-purple-600 font-medium">Variation</div>
                          <div className="text-xs text-gray-600">Volume Range</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                          <MessageSquare className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-orange-700">
                            {analysis.speakingPatterns.tonalRange}
                          </div>
                          <div className="text-xs text-orange-600 font-medium">Hz Range</div>
                          <div className="text-xs text-gray-600">Tonal Variety</div>
                        </div>
                      </div>
                    </div>

                    {/* Key Call Moments */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-green-500" />
                        Key Call Moments
                      </h4>
                      <div className="space-y-3">
                        {analysis.keyMoments.map((moment, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-l-blue-400">
                            <div className="flex items-center space-x-4">
                              <div className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {Math.floor(moment.timestamp / 60)}:{(moment.timestamp % 60).toString().padStart(2, '0')}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{moment.moment}</p>
                                <p className={`text-sm ${getToneColor(moment.tone)} font-medium`}>
                                  {moment.tone} tone
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={moment.importance === 'high' ? 'destructive' : 
                                      moment.importance === 'medium' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {moment.importance === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {moment.importance}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coaching Recommendations */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-500" />
                        Coaching Recommendations
                      </h4>
                      <div className="space-y-3">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-800 leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Sales Score</span>
                    <span className="font-bold text-lg">
                      {analyses.length > 0 
                        ? Math.round(analyses.reduce((sum: number, a: VoiceToneAnalysis) => sum + a.salesScore, 0) / analyses.length)
                        : 0
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Top Strength</span>
                    <span className="font-semibold text-green-600">Professionalism</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Focus Area</span>
                    <span className="font-semibold text-orange-600">Enthusiasm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confidence Level</span>
                    <span className="font-semibold">
                      {analyses.length > 0 
                        ? Math.round(analyses.reduce((sum: number, a: VoiceToneAnalysis) => sum + a.confidence, 0) / analyses.length)
                        : 0
                      }%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Call Type Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Discovery', 'Demo', 'Closing', 'Follow-up'].map((type, index) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type} Calls</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${70 + index * 5}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold w-8 text-right">
                          {70 + index * 5}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Improvement Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-1">
                      <Coffee className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Energy Level</span>
                    </div>
                    <p className="text-xs text-yellow-700">Increase enthusiasm in opening statements</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-1">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">Pacing</span>
                    </div>
                    <p className="text-xs text-blue-700">Allow more pauses for prospect responses</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center mb-1">
                      <Heart className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Empathy</span>
                    </div>
                    <p className="text-xs text-green-700">Strong emotional connection with prospects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coaching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Personalized Coaching Dashboard
              </CardTitle>
              <CardDescription>
                AI-powered recommendations to improve your sales call performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Strengths to Leverage</h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Professional Tone</p>
                        <p className="text-xs text-green-600">Consistently maintains authority and credibility</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Users className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Active Listening</p>
                        <p className="text-xs text-green-600">Good use of pauses and follow-up questions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-orange-700">Areas for Development</h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <Zap className="h-5 w-5 text-orange-600 mr-3" />
                      <div>
                        <p className="font-medium text-orange-800">Energy & Enthusiasm</p>
                        <p className="text-xs text-orange-600">Practice vocal variety and excitement in demos</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-orange-600 mr-3" />
                      <div>
                        <p className="font-medium text-orange-800">Objection Handling</p>
                        <p className="text-xs text-orange-600">Work on calm, confident responses to pushback</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">This Week's Focus</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium text-blue-900">Energy Practice</p>
                    <p className="text-xs text-blue-700">5 min vocal warm-ups before calls</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium text-blue-900">Objection Drills</p>
                    <p className="text-xs text-blue-700">Practice common objection responses</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium text-blue-900">Pace Control</p>
                    <p className="text-xs text-blue-700">Use 3-second pauses after questions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}