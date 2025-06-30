import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  X,
  Star
} from "lucide-react";
import { Contact } from "@shared/schema";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface CoachingTip {
  id: string;
  type: 'opportunity' | 'warning' | 'best_practice' | 'timing' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionItems: string[];
  context: string;
  confidence: number;
  category: 'calling' | 'email' | 'follow_up' | 'closing' | 'qualification';
}

interface ContextualSalesCoachingProps {
  contact?: Contact;
  currentAction?: 'calling' | 'emailing' | 'scheduling' | 'qualifying' | 'closing';
  leadAge?: number; // hours since lead creation
  lastContactDate?: Date;
  onClose: () => void;
  onApplyTip?: (tipId: string) => void;
}

export function ContextualSalesCoaching({ 
  contact, 
  currentAction, 
  leadAge = 0, 
  lastContactDate,
  onClose,
  onApplyTip 
}: ContextualSalesCoachingProps) {
  const [activeTips, setActiveTips] = useState<CoachingTip[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showCoaching, setShowCoaching] = useState(false);

  // Generate contextual coaching tips based on current situation
  useEffect(() => {
    if (contact) {
      const tips = generateContextualTips(contact, currentAction, leadAge, lastContactDate);
      setActiveTips(tips);
      if (tips.length > 0) {
        setShowCoaching(true);
      }
    }
  }, [contact, currentAction, leadAge, lastContactDate]);

  const generateContextualTips = (
    contact: Contact, 
    action?: string, 
    age?: number, 
    lastContact?: Date
  ): CoachingTip[] => {
    const tips: CoachingTip[] = [];
    
    // New lead coaching (0-24 hours)
    if (age && age <= 24) {
      tips.push({
        id: 'new_lead_urgency',
        type: 'opportunity',
        priority: 'high',
        title: 'Strike While Hot! 🔥',
        message: 'This is a fresh lead! Statistics show 78% higher conversion when contacted within the first hour.',
        actionItems: [
          'Call immediately - don\'t wait',
          'Use warm opener: "Hi [Name], I see you just inquired about our services"',
          'Be enthusiastic and responsive to their immediate need'
        ],
        context: 'New leads are 21x more likely to qualify when contacted within 5 minutes',
        confidence: 95,
        category: 'calling'
      });
    }

    // Lead age warnings
    if (age && age > 72) {
      tips.push({
        id: 'stale_lead_recovery',
        type: 'warning',
        priority: 'high',
        title: 'Lead Recovery Strategy',
        message: 'This lead is getting cold. Use re-engagement tactics to revive interest.',
        actionItems: [
          'Acknowledge the delay: "I apologize for not reaching out sooner"',
          'Provide immediate value: share a relevant case study',
          'Create urgency with limited-time offer or bonus'
        ],
        context: 'Leads older than 3 days require 60% more effort to convert',
        confidence: 85,
        category: 'follow_up'
      });
    }

    // Industry-specific coaching
    if (contact.company || contact.notes) {
      const industry = extractIndustry(contact);
      if (industry === 'restaurant') {
        tips.push({
          id: 'restaurant_coaching',
          type: 'strategy',
          priority: 'medium',
          title: 'Restaurant Industry Approach',
          message: 'Restaurants need immediate ROI. Focus on increasing foot traffic and online orders.',
          actionItems: [
            'Highlight Google My Business optimization for local search',
            'Mention food delivery app integration',
            'Show how online reviews drive 30% more customers'
          ],
          context: 'Restaurant margins are tight - emphasize quick wins',
          confidence: 90,
          category: 'qualification'
        });
      } else if (industry === 'hvac') {
        tips.push({
          id: 'hvac_coaching',
          type: 'strategy',
          priority: 'medium',
          title: 'HVAC Service Strategy',
          message: 'HVAC businesses are seasonal. Focus on emergency services and maintenance contracts.',
          actionItems: [
            'Emphasize 24/7 emergency call tracking',
            'Highlight seasonal campaign automation',
            'Show maintenance reminder systems'
          ],
          context: 'HVAC peak seasons: Summer (AC) and Winter (heating)',
          confidence: 88,
          category: 'qualification'
        });
      }
    }

    // Action-specific coaching
    if (action === 'calling') {
      tips.push({
        id: 'calling_best_practices',
        type: 'best_practice',
        priority: 'medium',
        title: 'Perfect Cold Call Framework',
        message: 'Use the BANT qualification method: Budget, Authority, Need, Timeline.',
        actionItems: [
          'Open with pattern interrupt: "Did I catch you at a bad time?"',
          'Ask permission: "I have a quick question - are you the person who handles marketing?"',
          'Listen 70%, talk 30% - let them reveal their pain points'
        ],
        context: 'Average cold call success rate: 2.5%. Perfect your script!',
        confidence: 92,
        category: 'calling'
      });
    }

    if (action === 'emailing') {
      tips.push({
        id: 'email_best_practices',
        type: 'best_practice',
        priority: 'medium',
        title: 'High-Converting Email Strategy',
        message: 'Personalization increases response rates by 220%. Make it about them, not you.',
        actionItems: [
          'Subject line: Use their company name or specific pain point',
          'First line: Reference something specific about their business',
          'Include ONE clear call-to-action'
        ],
        context: 'Best email times: Tuesday-Thursday, 10 AM or 2 PM',
        confidence: 87,
        category: 'email'
      });
    }

    // Budget and deal value coaching
    if (contact.budget && contact.budget > 5000) {
      tips.push({
        id: 'high_value_approach',
        type: 'opportunity',
        priority: 'high',
        title: 'High-Value Prospect Strategy',
        message: `This prospect has a ${contact.budget >= 10000 ? 'substantial' : 'good'} budget. Adjust your approach accordingly.`,
        actionItems: [
          'Focus on ROI and business growth, not price',
          'Offer premium packages first',
          'Request face-to-face or video meeting',
          'Involve decision makers early'
        ],
        context: 'High-budget leads convert 40% better with consultative selling',
        confidence: 93,
        category: 'closing'
      });
    }

    // Timing coaching
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    if (action === 'calling' && (hour < 9 || hour > 17)) {
      tips.push({
        id: 'timing_warning',
        type: 'warning',
        priority: 'medium',
        title: 'Calling Time Optimization',
        message: 'You\'re calling outside optimal hours. Consider adjusting your approach.',
        actionItems: [
          'If after hours: Leave voicemail and send follow-up email',
          'If before hours: Schedule call for 10 AM - 4 PM window',
          'Mention you\'ll call back during business hours'
        ],
        context: 'Best calling times: 10 AM - 12 PM and 2 PM - 4 PM',
        confidence: 80,
        category: 'calling'
      });
    }

    // Lead source coaching
    if (contact.leadSource === 'bark') {
      tips.push({
        id: 'bark_lead_coaching',
        type: 'strategy',
        priority: 'high',
        title: 'Bark.com Lead Strategy',
        message: 'This lead is actively seeking services. They\'re comparing multiple providers.',
        actionItems: [
          'Respond within 15 minutes - speed matters most',
          'Lead with credentials and local presence',
          'Offer free consultation to stand out',
          'Follow up with detailed proposal within 24 hours'
        ],
        context: 'Bark leads convert 3x higher when contacted first',
        confidence: 94,
        category: 'qualification'
      });
    }

    return tips.filter(tip => tip.confidence > 75).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const extractIndustry = (contact: Contact): string => {
    const text = `${contact.company || ''} ${contact.notes || ''}`.toLowerCase();
    
    if (text.includes('restaurant') || text.includes('food') || text.includes('cafe') || text.includes('dining')) return 'restaurant';
    if (text.includes('hvac') || text.includes('heating') || text.includes('cooling') || text.includes('air conditioning')) return 'hvac';
    if (text.includes('plumbing') || text.includes('plumber')) return 'plumbing';
    if (text.includes('electrical') || text.includes('electrician')) return 'electrical';
    if (text.includes('dental') || text.includes('dentist') || text.includes('medical') || text.includes('doctor')) return 'healthcare';
    if (text.includes('law') || text.includes('legal') || text.includes('attorney') || text.includes('lawyer')) return 'legal';
    
    return 'general';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'best_practice': return <Star className="h-5 w-5 text-blue-600" />;
      case 'timing': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'strategy': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default: return <Lightbulb className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApplyTip = (tipId: string) => {
    if (onApplyTip) {
      onApplyTip(tipId);
    }
    
    // Move to next tip or close if last tip
    if (currentTipIndex < activeTips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setShowCoaching(false);
    onClose();
  };

  if (!showCoaching || activeTips.length === 0) return null;

  const currentTip = activeTips[currentTipIndex];

  return (
    <Dialog open={showCoaching} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="h-12 w-auto object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-orange-600" />
                  Sales Coaching Assistant
                </DialogTitle>
                <p className="text-sm text-gray-600">Real-time guidance for better conversions</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Tip {currentTipIndex + 1} of {activeTips.length}
            </div>
            <div className="flex gap-1">
              {activeTips.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full ${
                    index === currentTipIndex ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current tip */}
          <Card className="border-l-4 border-l-orange-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(currentTip.type)}
                  <div>
                    <CardTitle className="text-lg">{currentTip.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPriorityColor(currentTip.priority)}>
                        {currentTip.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(currentTip.confidence)}% Confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{currentTip.message}</p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Action Items:</h4>
                <ul className="space-y-1">
                  {currentTip.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Context:</strong> {currentTip.context}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => handleApplyTip(currentTip.id)}
                  className="flex-1"
                >
                  Apply This Tip
                </Button>
                {currentTipIndex < activeTips.length - 1 ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentTipIndex(currentTipIndex + 1)}
                  >
                    Next Tip
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleClose}>
                    Done
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact context */}
          {contact && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-700">Lead Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Lead:</span> {contact.firstName} {contact.lastName}
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span> {leadAge}h old
                  </div>
                  <div>
                    <span className="text-gray-600">Source:</span> {contact.leadSource || 'Direct'}
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span> {contact.leadStatus || 'New'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContextualSalesCoaching;