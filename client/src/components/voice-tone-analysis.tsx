import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, Mic, Play, Pause, BarChart3, TrendingUp, TrendingDown, 
  Clock, Volume2, Target, Award, AlertTriangle, CheckCircle,
  Phone, Star, Users, MessageSquare, Heart, Brain
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

export function VoiceToneAnalysis() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    mutationFn: async (data: { file: File; callType: string; participantName: string; contactId?: number }) => {
      const formData = new FormData();
      formData.append('recording', data.file);
      formData.append('callType', data.callType);
      formData.append('participantName', data.participantName);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Voice Tone Analysis</h2>
          <p className="text-gray-600">Analyze sales call recordings for communication effectiveness</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{recordings.length}</div>
            <div className="text-sm text-gray-600">Recordings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analyses.length}</div>
            <div className="text-sm text-gray-600">Analyzed</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Call Recording
              </CardTitle>
              <CardDescription>
                Upload audio files to analyze voice tone and communication patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop audio files here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports MP3, WAV files up to 100MB</p>
                </div>
                <Input
                  type="file"
                  accept="audio/*,.mp3,.wav"
                  onChange={handleFileUpload}
                  className="mt-4"
                />
              </div>

              {selectedFile && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Call Type</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option value="discovery">Discovery Call</option>
                        <option value="demo">Product Demo</option>
                        <option value="closing">Closing Call</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="objection">Objection Handling</option>
                      </select>
                    </div>
                    <div>
                      <Label>Participant Name</Label>
                      <Input placeholder="Enter prospect name" className="mt-1" />
                    </div>
                  </div>

                  <Button
                    onClick={() => uploadMutation.mutate({
                      file: selectedFile,
                      callType: 'discovery',
                      participantName: 'Test Prospect'
                    })}
                    disabled={uploadMutation.isPending}
                    className="w-full mt-4"
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload & Analyze'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-6">
          <div className="grid gap-4">
            {recordingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading recordings...</p>
              </div>
            ) : recordings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recordings found. Upload your first call recording to get started.</p>
                </CardContent>
              </Card>
            ) : (
              recordings.map((recording: CallRecording) => (
                <Card key={recording.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{recording.participantName}</h3>
                          <p className="text-sm text-gray-600">
                            {recording.callType} • {formatDuration(recording.duration)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(recording.recordingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={recording.analysisStatus === 'completed' ? 'default' : 'secondary'}
                        >
                          {recording.analysisStatus}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlayingRecording(playingRecording === recording.id ? null : recording.id)}
                        >
                          {playingRecording === recording.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        
                        {recording.analysisStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => analyzeMutation.mutate(recording.id)}
                            disabled={analyzeMutation.isPending}
                          >
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
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading analyses...</p>
              </div>
            ) : analyses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No analyses available. Upload and analyze recordings to see results.</p>
                </CardContent>
              </Card>
            ) : (
              analyses.map((analysis: VoiceToneAnalysis) => (
                <Card key={analysis.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Brain className="h-5 w-5 mr-2" />
                        Voice Analysis Report
                      </CardTitle>
                      <Badge className={getScoreColor(analysis.salesScore)}>
                        Sales Score: {analysis.salesScore}/100
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overall Tone */}
                    <div>
                      <h4 className="font-semibold mb-3">Overall Tone Assessment</h4>
                      <div className="flex items-center space-x-4">
                        <Badge className={getToneColor(analysis.overallTone)}>
                          {analysis.overallTone}
                        </Badge>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Confidence:</span>
                          <Progress value={analysis.confidence} className="w-24" />
                          <span className="text-sm ml-2">{analysis.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Emotional Metrics */}
                    <div>
                      <h4 className="font-semibold mb-3">Emotional Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(analysis.emotionalMetrics).map(([metric, value]) => (
                          <div key={metric} className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{value}%</div>
                            <div className="text-sm text-gray-600 capitalize">{metric}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Speaking Patterns */}
                    <div>
                      <h4 className="font-semibold mb-3">Speaking Patterns</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                          <div className="text-sm font-medium">{analysis.speakingPatterns.averagePace} WPM</div>
                          <div className="text-xs text-gray-600">Average Pace</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <Volume2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
                          <div className="text-sm font-medium">{analysis.speakingPatterns.volumeVariation}%</div>
                          <div className="text-xs text-gray-600">Volume Variation</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <MessageSquare className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                          <div className="text-sm font-medium">{analysis.speakingPatterns.pauseFrequency}</div>
                          <div className="text-xs text-gray-600">Pause Frequency</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                          <div className="text-sm font-medium">{analysis.speakingPatterns.tonalRange}%</div>
                          <div className="text-xs text-gray-600">Tonal Range</div>
                        </div>
                      </div>
                    </div>

                    {/* Key Moments */}
                    <div>
                      <h4 className="font-semibold mb-3">Key Moments</h4>
                      <div className="space-y-2">
                        {analysis.keyMoments.map((moment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant={moment.importance === 'high' ? 'default' : 'secondary'}>
                                {Math.floor(moment.timestamp / 60)}:{(moment.timestamp % 60).toString().padStart(2, '0')}
                              </Badge>
                              <span className="text-sm">{moment.moment}</span>
                            </div>
                            <Badge className={getToneColor(moment.tone)}>
                              {moment.tone}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Sales Score</p>
                    <p className="text-2xl font-bold text-green-600">78.5</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Emotion</p>
                    <p className="text-2xl font-bold text-blue-600">Professional</p>
                  </div>
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Speaking Pace</p>
                    <p className="text-2xl font-bold text-purple-600">145 WPM</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Improvement Rate</p>
                    <p className="text-2xl font-bold text-green-600">+12%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Communication Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Professionalism</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="w-24" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enthusiasm</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-24" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Empathy</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={78} className="w-24" />
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assertiveness</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={72} className="w-24" />
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clarity</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={89} className="w-24" />
                      <span className="text-sm font-medium">89%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidence</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={81} className="w-24" />
                      <span className="text-sm font-medium">81%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Track improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Trend analysis will appear here as you analyze more recordings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}