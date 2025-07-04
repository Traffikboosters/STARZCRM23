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
  Clock
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
      title: "Opening Script",
      category: "Opener",
      script: `Hi ${contact.firstName}, this is Michael from Traffik Boosters. I noticed ${contact.company || 'your business'} and wanted to reach out about helping you increase your online visibility. We're helping similar businesses generate 300% more leads online. Do you have 2 minutes to discuss how this could work for your business?`,
      tip: "Start with their specific business name and immediate value proposition"
    },
    {
      id: "qualification",
      icon: <Users className="h-4 w-4" />,
      title: "Qualification Questions",
      category: "Discovery",
      script: `${contact.firstName}, what's your biggest challenge with getting new customers right now? Most businesses like ${contact.company || 'yours'} are investing $2,500-$5,000 monthly in digital marketing to solve this. Is growing your customer base a priority for you this quarter?`,
      tip: "Qualify budget and urgency without being direct about money"
    },
    {
      id: "objection",
      icon: <Target className="h-4 w-4" />,
      title: "Price Objection Handler",
      category: "Objections",
      script: `I understand budget is important, ${contact.firstName}. Let me ask you this - if we could show you how to generate an additional $10,000 in revenue per month, what would that investment be worth to your business? Our average client sees 4:1 return within 90 days.`,
      tip: "Redirect price concerns to ROI and value creation"
    },
    {
      id: "closing",
      icon: <Clock className="h-4 w-4" />,
      title: "Closing Script",
      category: "Closing",
      script: `${contact.firstName}, based on what you've told me about ${contact.company || 'your business'}, I believe we can help you achieve those growth goals. I'd like to schedule a 15-minute strategy session to show you exactly how we'd approach your specific situation. Are you available tomorrow at 2 PM or would Thursday at 10 AM work better?`,
      tip: "Assume the sale and offer specific time options"
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
                  AI Sales Tips
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Personalized for {contact.firstName} {contact.lastName} at {contact.company || 'Individual Contact'}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
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