import { useState } from "react";
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
  Brain,
  Copy,
  Phone,
  Users,
  Target,
  Clock,
  TrendingUp
} from "lucide-react";
import { Contact } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface SimpleAITipsModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleAITipsModal({ contact, isOpen, onClose }: SimpleAITipsModalProps) {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Script copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const salesTips = [
    {
      id: "opener",
      icon: <Phone className="h-4 w-4" />,
      title: "B2B Rapport Building Opener",
      category: "Opener",
      script: `Hello ${contact.firstName}, this is Michael Thompson from Traffik Boosters. I specialize in helping business owners like yourself scale their operations through strategic digital marketing. I've been researching ${contact.company || 'your industry'} and noticed some opportunities that could significantly impact your bottom line. Do you have 3 minutes for me to share what I've found?`,
      tip: "Build credibility immediately by showing you've done research on their business"
    },
    {
      id: "qualification",
      icon: <Users className="h-4 w-4" />,
      title: "Business Value Discovery",
      category: "Discovery",
      script: `${contact.firstName}, as a business owner, I'm sure you're focused on sustainable growth and profitable revenue streams. What's your current biggest obstacle to reaching your next revenue milestone? Most successful business owners I work with are investing 8-12% of revenue back into marketing to stay competitive. Where do you see the biggest opportunity for ${contact.company || 'your business'} right now?`,
      tip: "Focus on business growth goals and position marketing as a strategic investment"
    },
    {
      id: "objection",
      icon: <Target className="h-4 w-4" />,
      title: "Investment ROI Discussion",
      category: "Objections",
      script: `${contact.firstName}, I appreciate that you're being fiscally responsible - that's what makes you a successful business owner. Let me frame this differently: if I could show you a strategy that generates an additional $25,000-$50,000 in monthly revenue within 6 months, and the investment required is less than 10% of that return, would that be worth exploring? Our clients typically see 300-500% ROI because we focus on high-intent leads that convert to actual customers.`,
      tip: "Speak their language - ROI, profit margins, and business growth metrics"
    },
    {
      id: "closing",
      icon: <Clock className="h-4 w-4" />,
      title: "Executive Decision Closing",
      category: "Closing",
      script: `${contact.firstName}, based on our conversation, I can see ${contact.company || 'your business'} has tremendous potential for scaled growth. I'd like to put together a customized growth strategy specifically for your situation. I have two spots available this week for a 30-minute strategy consultation - Tuesday at 10 AM or Thursday at 2 PM. Which works better for your schedule? I'll come prepared with specific recommendations for your industry and market.`,
      tip: "Position as a strategic consultation, not a sales call. Give limited availability to create urgency."
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="h-10 w-auto object-contain"
              />
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Starz Sales Tips
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Personalized for {contact.firstName} {contact.lastName} at {contact.company || 'Individual Contact'}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* B2B Lead Analysis Dashboard */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Strategic Business Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Business Profile</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Business Type:</span> {contact.company ? "Established Business" : "Growing Business"}</p>
                      <p><span className="font-medium">Industry:</span> {
                        contact.notes?.includes("restaurant") ? "Food Service & Hospitality" : 
                        contact.notes?.includes("HVAC") ? "HVAC & Home Services" :
                        contact.notes?.includes("plumbing") ? "Plumbing & Mechanical Services" :
                        contact.notes?.includes("electrical") ? "Electrical & Contracting Services" :
                        contact.notes?.includes("dental") ? "Healthcare & Medical" :
                        contact.notes?.includes("law") ? "Professional Services" :
                        "Service-Based Business"
                      }</p>
                      <p><span className="font-medium">Priority Level:</span> <Badge variant="secondary">High Value Prospect</Badge></p>
                      <p><span className="font-medium">Investment Range:</span> $3,500 - $8,500/month</p>
                      <p><span className="font-medium">Decision Timeline:</span> 45-90 days</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Business Challenges</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Scaling customer acquisition</li>
                      <li>• Competing with larger companies</li>
                      <li>• Converting leads to high-value customers</li>
                      <li>• Measuring marketing ROI</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Growth Opportunities</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Digital presence optimization</li>
                      <li>• Automated lead nurturing systems</li>
                      <li>• High-intent keyword targeting</li>
                      <li>• Competitive market positioning</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Strategic Next Steps</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Executive strategy consultation</li>
                      <li>• Comprehensive competitor audit</li>
                      <li>• Custom growth plan presentation</li>
                      <li>• Implementation roadmap discussion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {salesTips.map((tip) => (
              <Card key={tip.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {tip.icon}
                      {tip.title}
                    </CardTitle>
                    <Badge variant="outline">{tip.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 italic">{tip.tip}</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg mb-3">
                    <p className="text-sm font-medium text-gray-800">{tip.script}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(tip.script)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Script
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="border-t pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lead Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Lead Score</p>
                    <p className="text-lg font-bold text-green-600">85/100</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Priority</p>
                    <Badge variant="destructive">High</Badge>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Best Call Time</p>
                    <p className="text-sm">9-11 AM EST</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Est. Budget</p>
                    <p className="text-sm">$2,500-$5,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}