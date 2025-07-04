import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Phone, 
  Video, 
  Minimize2, 
  Maximize2,
  User,
  Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface LeadForm {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatPhase, setChatPhase] = useState<'greeting' | 'form' | 'chat' | 'video'>('greeting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [leadForm, setLeadForm] = useState<LeadForm>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Check if it's business hours
  const isBusinessHours = () => {
    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hour = estTime.getHours();
    const day = estTime.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const isBusinessTime = hour >= 9 && hour < 18;
    return isWeekday && isBusinessTime;
  };

  // Initial greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: isBusinessHours() 
          ? "Hi! How can we help boost your traffic today?" 
          : "Hi! We're currently offline. Leave us a message and a growth expert will call within 24 business hours!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    addMessage(currentMessage, true);
    setCurrentMessage('');

    // Auto-response
    setTimeout(() => {
      const lowerMessage = currentMessage.toLowerCase();
      let response = "Thanks for your message! Let me connect you with our team.";
      
      if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        response = "Our pricing varies based on your specific needs. I'll have our team prepare a custom quote for you.";
      } else if (lowerMessage.includes('service')) {
        response = "We specialize in digital marketing, SEO, and paid advertising to boost your online traffic and conversions.";
      }
      
      addMessage(response, false);
      
      // Prompt for contact info after a few messages
      if (messages.length >= 2) {
        setTimeout(() => {
          addMessage("To better assist you, could you share your contact information? This helps us provide personalized recommendations.", false);
          setChatPhase('form');
        }, 1500);
      }
    }, 1000);
  };

  const handleSubmitLead = async () => {
    if (!leadForm.name || !leadForm.email || !leadForm.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/chat-widget/submit", {
        name: leadForm.name,
        company: leadForm.company,
        email: leadForm.email,
        phone: leadForm.phone,
        message: leadForm.message || "Contacted via chat widget"
      });
      
      toast({
        title: "Thank you!",
        description: "A growth expert will call you within 24 business hours.",
      });
      
      addMessage("Perfect! Your information has been submitted. A growth expert will call you within 24 business hours to discuss how we can help grow your business.", false);
      setChatPhase('chat');
      
      // Reset form
      setLeadForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was an issue submitting your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startVideoCall = () => {
    setChatPhase('video');
    addMessage("Starting video consultation...", false);
    // In a real implementation, this would integrate with video calling API
    setTimeout(() => {
      addMessage("Video calling requires camera permissions. Our team will call you to set up a consultation.", false);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg transition-transform hover:scale-105"
          size="lg"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
        
        {/* Status indicator */}
        <div className="absolute -top-2 -right-2">
          <div className={`w-4 h-4 rounded-full ${isBusinessHours() ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 ${chatPhase === 'video' ? 'h-[500px]' : 'h-[450px]'} flex flex-col shadow-2xl ${isMinimized ? 'h-14' : ''}`}>
        {/* Header */}
        <CardHeader className="bg-orange-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="w-8 h-8 rounded-full bg-white p-1"
              />
              <div>
                <CardTitle className="text-sm font-semibold">Traffik Boosters</CardTitle>
                <p className="text-xs opacity-90">More Traffik! More Sales!</p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${isBusinessHours() ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {isBusinessHours() ? 'Online Now' : 'Will Call Within 24hrs'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-orange-700 p-1"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-orange-700 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0">
            {chatPhase === 'form' ? (
              /* Contact Form */
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <h3 className="font-semibold text-gray-900">Let's Get Started</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Your Name *"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Business Email *"
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Company Name *"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Phone Number"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="text-sm"
                  />
                  <Textarea
                    placeholder="How can we help grow your business?"
                    value={leadForm.message}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, message: e.target.value }))}
                    className="text-sm"
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitLead}
                    disabled={isSubmitting}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {isSubmitting ? "Submitting..." : "Get Free Quote"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setChatPhase('chat')}
                    className="w-full text-sm"
                  >
                    Continue Chat Instead
                  </Button>
                </div>
              </div>
            ) : chatPhase === 'video' ? (
              /* Video Call Interface */
              <div className="p-4 flex-1 flex flex-col justify-center items-center bg-gray-900 text-white">
                <Video className="w-16 h-16 mb-4 text-orange-500" />
                <h3 className="text-lg font-semibold mb-2">Video Consultation</h3>
                <p className="text-sm text-center mb-4 opacity-80">
                  Video calls require camera permissions and setup. Our team will contact you to arrange a video consultation.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setChatPhase('chat')}
                    className="bg-white text-gray-900"
                  >
                    Back to Chat
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Call (877) 840-6250
                  </Button>
                </div>
              </div>
            ) : (
              /* Chat Interface */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[70%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.isUser ? 'bg-orange-600' : 'bg-gray-200'}`}>
                          {message.isUser ? (
                            <User className="w-3 h-3 text-white" />
                          ) : (
                            <img src={traffikBoostersLogo} alt="TB" className="w-3 h-3 rounded-full" />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            message.isUser
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Actions */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex space-x-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChatPhase('form')}
                      className="flex-1 text-xs"
                    >
                      Get Quote
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startVideoCall}
                      className="flex-1 text-xs"
                    >
                      <Video className="w-3 h-3 mr-1" />
                      Video
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('tel:8778406250')}
                      className="flex-1 text-xs"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}