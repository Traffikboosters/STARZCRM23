import OpenAI from "openai";

// Voice tone analysis interface definitions
interface VoiceToneMetrics {
  confidence: number;
  enthusiasm: number;
  professionalism: number;
  empathy: number;
  urgency: number;
  clarity: number;
  persuasiveness: number;
  friendliness: number;
}

interface ToneAnalysisResult {
  overallTone: 'professional' | 'friendly' | 'aggressive' | 'passive' | 'confident' | 'uncertain';
  sentimentScore: number; // -1 to 1 scale
  voiceToneMetrics: VoiceToneMetrics;
  communicationStyle: 'consultative' | 'direct' | 'relationship-building' | 'solution-focused' | 'pressure-based';
  emotionalIntelligence: number; // 0-100 scale
  recommendations: string[];
  keyMoments: {
    timestamp: string;
    moment: string;
    impact: 'positive' | 'negative' | 'neutral';
    suggestion?: string;
  }[];
  speakingPace: 'too_fast' | 'optimal' | 'too_slow';
  wordCount: number;
  fillerWords: number;
  interruptionCount: number;
}

interface CallParticipant {
  role: 'sales_rep' | 'prospect' | 'customer';
  name: string;
  speakingTime: number; // in seconds
  wordCount: number;
  dominanceRatio: number; // percentage of conversation
}

interface CallAnalysisData {
  callId: number;
  salesRepId: number;
  customerName: string;
  callDuration: number; // in minutes
  callDate: Date;
  callOutcome: 'appointment_set' | 'follow_up_scheduled' | 'not_interested' | 'callback_requested' | 'deal_closed' | 'objection_received';
  participants: CallParticipant[];
  transcript: string;
  salesRepAnalysis: ToneAnalysisResult;
  prospectResponse: {
    engagementLevel: number; // 0-100
    objectionCount: number;
    positiveResponses: number;
    questionsAsked: number;
  };
}

export class VoiceToneAnalyzer {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable must be set for voice tone analysis");
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyzeCallTone(transcript: string, callData: Partial<CallAnalysisData>): Promise<ToneAnalysisResult> {
    try {
      const prompt = `
Analyze the following sales call transcript for voice tone and communication effectiveness. 
Focus on the sales representative's communication style, tone, and persuasiveness.

Call Duration: ${callData.callDuration} minutes
Customer: ${callData.customerName}
Outcome: ${callData.callOutcome}

TRANSCRIPT:
${transcript}

Provide a comprehensive analysis in JSON format with the following structure:
{
  "overallTone": "professional|friendly|aggressive|passive|confident|uncertain",
  "sentimentScore": number (-1 to 1),
  "voiceToneMetrics": {
    "confidence": number (0-100),
    "enthusiasm": number (0-100),
    "professionalism": number (0-100),
    "empathy": number (0-100),
    "urgency": number (0-100),
    "clarity": number (0-100),
    "persuasiveness": number (0-100),
    "friendliness": number (0-100)
  },
  "communicationStyle": "consultative|direct|relationship-building|solution-focused|pressure-based",
  "emotionalIntelligence": number (0-100),
  "recommendations": ["string array of 3-5 specific improvement suggestions"],
  "keyMoments": [
    {
      "timestamp": "MM:SS format",
      "moment": "description of key moment",
      "impact": "positive|negative|neutral",
      "suggestion": "optional improvement suggestion"
    }
  ],
  "speakingPace": "too_fast|optimal|too_slow",
  "wordCount": number,
  "fillerWords": number,
  "interruptionCount": number
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert sales communication analyst specializing in voice tone analysis and sales effectiveness. Provide detailed, actionable insights to help sales representatives improve their communication skills."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and ensure all required fields are present
      return {
        overallTone: analysis.overallTone || 'professional',
        sentimentScore: analysis.sentimentScore || 0,
        voiceToneMetrics: {
          confidence: analysis.voiceToneMetrics?.confidence || 70,
          enthusiasm: analysis.voiceToneMetrics?.enthusiasm || 60,
          professionalism: analysis.voiceToneMetrics?.professionalism || 80,
          empathy: analysis.voiceToneMetrics?.empathy || 65,
          urgency: analysis.voiceToneMetrics?.urgency || 50,
          clarity: analysis.voiceToneMetrics?.clarity || 75,
          persuasiveness: analysis.voiceToneMetrics?.persuasiveness || 70,
          friendliness: analysis.voiceToneMetrics?.friendliness || 75
        },
        communicationStyle: analysis.communicationStyle || 'consultative',
        emotionalIntelligence: analysis.emotionalIntelligence || 75,
        recommendations: analysis.recommendations || [
          "Practice active listening techniques",
          "Use more empathy-building language",
          "Ask more discovery questions"
        ],
        keyMoments: analysis.keyMoments || [],
        speakingPace: analysis.speakingPace || 'optimal',
        wordCount: analysis.wordCount || transcript.split(' ').length,
        fillerWords: analysis.fillerWords || 0,
        interruptionCount: analysis.interruptionCount || 0
      };

    } catch (error) {
      console.error('Error analyzing call tone:', error);
      throw new Error(`Voice tone analysis failed: ${error.message}`);
    }
  }

  async generateCallInsights(callData: CallAnalysisData): Promise<{
    performanceScore: number;
    improvementAreas: string[];
    strengths: string[];
    nextCallStrategy: string[];
    coachingTips: string[];
  }> {
    try {
      const prompt = `
Based on this sales call analysis, provide coaching insights and improvement recommendations:

Call Outcome: ${callData.callOutcome}
Overall Tone: ${callData.salesRepAnalysis.overallTone}
Sentiment Score: ${callData.salesRepAnalysis.sentimentScore}
Communication Style: ${callData.salesRepAnalysis.communicationStyle}
Emotional Intelligence: ${callData.salesRepAnalysis.emotionalIntelligence}

Voice Metrics:
- Confidence: ${callData.salesRepAnalysis.voiceToneMetrics.confidence}%
- Enthusiasm: ${callData.salesRepAnalysis.voiceToneMetrics.enthusiasm}%
- Professionalism: ${callData.salesRepAnalysis.voiceToneMetrics.professionalism}%
- Empathy: ${callData.salesRepAnalysis.voiceToneMetrics.empathy}%
- Persuasiveness: ${callData.salesRepAnalysis.voiceToneMetrics.persuasiveness}%

Prospect Response:
- Engagement Level: ${callData.prospectResponse.engagementLevel}%
- Objections: ${callData.prospectResponse.objectionCount}
- Positive Responses: ${callData.prospectResponse.positiveResponses}

Provide coaching insights in JSON format:
{
  "performanceScore": number (0-100),
  "improvementAreas": ["array of 3-4 specific areas to improve"],
  "strengths": ["array of 3-4 strengths to leverage"],
  "nextCallStrategy": ["array of 3-4 strategic recommendations for future calls"],
  "coachingTips": ["array of 4-5 actionable coaching tips"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert sales coach specializing in communication analysis and performance improvement. Provide specific, actionable coaching insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || '{}');

    } catch (error) {
      console.error('Error generating call insights:', error);
      throw new Error(`Call insights generation failed: ${error.message}`);
    }
  }

  // Analyze multiple calls to identify patterns and trends
  async analyzeCallTrends(callAnalyses: CallAnalysisData[], timeframe: 'week' | 'month' | 'quarter'): Promise<{
    trendAnalysis: {
      confidenceTrend: 'improving' | 'declining' | 'stable';
      persuasivenessTrend: 'improving' | 'declining' | 'stable';
      empathyTrend: 'improving' | 'declining' | 'stable';
      overallPerformanceTrend: 'improving' | 'declining' | 'stable';
    };
    averageMetrics: VoiceToneMetrics;
    consistencyScore: number;
    topStrengths: string[];
    persistentWeaknesses: string[];
    developmentPlan: string[];
  }> {
    if (callAnalyses.length === 0) {
      throw new Error('No call data provided for trend analysis');
    }

    // Calculate average metrics
    const totalCalls = callAnalyses.length;
    const averageMetrics: VoiceToneMetrics = {
      confidence: Math.round(callAnalyses.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.confidence, 0) / totalCalls),
      enthusiasm: Math.round(callAnalyses.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.enthusiasm, 0) / totalCalls),
      professionalism: Math.round(callAnalyses.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.professionalism, 0) / totalCalls),
      empathy: Math.round(callAnalyses.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.empathy, 0) / totalCalls),
      urgency: Math.round(callAnalyses.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.urgency, 0) / totalCalls),
      clarity: Math.round(callAnalyses.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.clarity, 0) / totalCalls),
      persuasiveness: Math.round(callAnalyses.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.persuasiveness, 0) / totalCalls),
      friendliness: Math.round(callAnalyses.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.friendliness, 0) / totalCalls)
    };

    // Analyze trends (simplified - compare first half vs second half of calls)
    const midpoint = Math.floor(totalCalls / 2);
    const firstHalf = callAnalyses.slice(0, midpoint);
    const secondHalf = callAnalyses.slice(midpoint);

    const getAverageConfidence = (calls: CallAnalysisData[]) => 
      calls.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.confidence, 0) / calls.length;
    
    const getAveragePersuasiveness = (calls: CallAnalysisData[]) => 
      calls.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.persuasiveness, 0) / calls.length;
    
    const getAverageEmpathy = (calls: CallAnalysisData[]) => 
      calls.reduce((sum, call) => sum + call.salesRepAnalysis.voiceToneMetrics.empathy, 0) / calls.length;

    const confidenceDiff = getAverageConfidence(secondHalf) - getAverageConfidence(firstHalf);
    const persuasivenessDiff = getAveragePersuasiveness(secondHalf) - getAveragePersuasiveness(firstHalf);
    const empathyDiff = getAverageEmpathy(secondHalf) - getAverageEmpathy(firstHalf);

    const getTrend = (diff: number) => {
      if (diff > 5) return 'improving';
      if (diff < -5) return 'declining';
      return 'stable';
    };

    return {
      trendAnalysis: {
        confidenceTrend: getTrend(confidenceDiff),
        persuasivenessTrend: getTrend(persuasivenessDiff),
        empathyTrend: getTrend(empathyDiff),
        overallPerformanceTrend: getTrend((confidenceDiff + persuasivenessDiff + empathyDiff) / 3)
      },
      averageMetrics,
      consistencyScore: Math.round(100 - (Math.abs(confidenceDiff) + Math.abs(persuasivenessDiff) + Math.abs(empathyDiff)) / 3),
      topStrengths: this.identifyTopStrengths(averageMetrics),
      persistentWeaknesses: this.identifyWeaknesses(averageMetrics),
      developmentPlan: this.generateDevelopmentPlan(averageMetrics)
    };
  }

  private identifyTopStrengths(metrics: VoiceToneMetrics): string[] {
    const strengths = [];
    if (metrics.professionalism >= 80) strengths.push("Maintains high professionalism");
    if (metrics.confidence >= 80) strengths.push("Projects strong confidence");
    if (metrics.empathy >= 80) strengths.push("Demonstrates excellent empathy");
    if (metrics.clarity >= 80) strengths.push("Communicates with clarity");
    if (metrics.persuasiveness >= 80) strengths.push("Highly persuasive communication");
    
    return strengths.slice(0, 3); // Return top 3
  }

  private identifyWeaknesses(metrics: VoiceToneMetrics): string[] {
    const weaknesses = [];
    if (metrics.confidence < 60) weaknesses.push("Low confidence in delivery");
    if (metrics.enthusiasm < 60) weaknesses.push("Lacks enthusiasm and energy");
    if (metrics.empathy < 60) weaknesses.push("Limited empathy expression");
    if (metrics.clarity < 60) weaknesses.push("Communication clarity issues");
    if (metrics.persuasiveness < 60) weaknesses.push("Weak persuasive abilities");
    
    return weaknesses;
  }

  private generateDevelopmentPlan(metrics: VoiceToneMetrics): string[] {
    const plan = [];
    
    if (metrics.confidence < 70) {
      plan.push("Practice confident language patterns and vocal projection");
    }
    if (metrics.empathy < 70) {
      plan.push("Develop active listening and empathy-building techniques");
    }
    if (metrics.persuasiveness < 70) {
      plan.push("Study advanced persuasion and influence methodologies");
    }
    if (metrics.enthusiasm < 70) {
      plan.push("Work on energy and enthusiasm in communication");
    }
    
    return plan;
  }
}

export const voiceToneAnalyzer = new VoiceToneAnalyzer();