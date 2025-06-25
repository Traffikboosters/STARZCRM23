import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  User,
  Zap,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface EmbeddedChatWidgetProps {
  className?: string;
  companyName?: string;
  primaryColor?: string;
  welcomeMessage?: string;
  position?: "bottom-right" | "bottom-left";
  apiEndpoint?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  isFromUser: boolean;
  timestamp: Date;
  type: "text" | "system";
}

export default function EmbeddedChatWidget({ 
  className,
  companyName = "Traffik Boosters",
  primaryColor = "#9ACD32", // Lime green from logo
  welcomeMessage = "Hi! How can we help boost your traffic today?",
  position = "bottom-right",
  apiEndpoint = "/api/leads"
}: EmbeddedChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  const [chatPhase, setChatPhase] = useState<"greeting" | "form" | "chat" | "video">("greeting");
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize messages with business hours awareness
  useEffect(() => {
    const initialMessage = isBusinessHours() 
      ? welcomeMessage
      : "Hi! Thanks for your interest in Traffik Boosters. We're currently outside business hours (Monday-Friday, 9 AM - 6 PM EST), but a growth expert will call you within 24 business hours. How can we help boost your traffic?";
    
    setMessages([{
      id: "welcome",
      message: initialMessage,
      isFromUser: false,
      timestamp: new Date(),
      type: "system"
    }]);
  }, [welcomeMessage]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Business hours check (9 AM - 6 PM EST, Monday-Friday)
  const isBusinessHours = () => {
    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = estTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = estTime.getHours();
    
    // Monday (1) to Friday (5), 9 AM to 6 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isFromUser: boolean, type: "text" | "system" = "text") => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message: text,
      isFromUser,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleInitialResponse = () => {
    addMessage("I'm interested in learning more about your services!", true);
    setTimeout(() => {
      addMessage("Great! I'd love to help you boost your traffic. Could you share some details so I can provide personalized recommendations?", false, "system");
      setChatPhase("form");
    }, 1000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;

    setIsSubmitting(true);
    
    try {
      // Submit lead to your CRM/backend
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...leadForm,
          source: "website_chat",
          url: window.location.href,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        if (isBusinessHours()) {
          addMessage(`Thanks ${leadForm.name}! I've received your information. Our team will reach out within 24 hours to discuss how we can boost your traffic.`, false, "system");
          setTimeout(() => {
            addMessage("In the meantime, feel free to ask any questions about our services!", false, "system");
          }, 2000);
        } else {
          addMessage(`Thanks ${leadForm.name}! I've received your information. Since you're contacting us after business hours, one of our growth experts will call you within 24 business hours (Monday-Friday, 9 AM - 6 PM EST) to discuss how we can boost your traffic.`, false, "system");
          setTimeout(() => {
            addMessage("We appreciate your interest and look forward to speaking with you soon about growing your business!", false, "system");
          }, 2000);
        }
        setChatPhase("chat");
      } else {
        addMessage("There was an issue submitting your information. Please try again or contact us directly.", false, "system");
      }
    } catch (error) {
      addMessage("Connection error. Please try again or call us at (877) 840-6250", false, "system");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    addMessage(message, true);
    
    // Auto-responses for common questions
    const lowerMessage = message.toLowerCase();
    setTimeout(() => {
      if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
        addMessage("Our pricing varies based on your specific needs and goals. I'll have our team prepare a custom quote for you based on the information you provided.", false, "system");
      } else if (lowerMessage.includes("service") || lowerMessage.includes("what do you do")) {
        addMessage("We specialize in digital marketing, SEO, social media marketing, and paid advertising to boost your online traffic and conversions. Our team will discuss the best strategy for your business.", false, "system");
      } else if (lowerMessage.includes("time") || lowerMessage.includes("long")) {
        addMessage("Results typically start showing within 30-60 days, with significant improvements in 3-6 months. Our team will provide a detailed timeline during your consultation.", false, "system");
      } else {
        addMessage("Thanks for your question! Our team will address this in detail when they contact you. Is there anything else I can help with?", false, "system");
      }
    }, 1500);

    setMessage("");
  };

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4"
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed z-50", positionClasses[position], className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="h-7 w-7 text-white" />
          <div className="absolute -top-1 -right-1">
            <div className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      <div className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-2xl w-80 flex flex-col",
        isMinimized ? "h-14" : chatPhase === "video" ? "h-[450px]" : "h-96"
      )}>
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 rounded-t-lg text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center p-1">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="h-full w-full object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <div>
              <div className="font-semibold text-sm">{companyName}</div>
              <div className="text-xs opacity-90 flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${isBusinessHours() ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                {isBusinessHours() ? 'Online Now' : 'Will Call Within 24hrs'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.isFromUser && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn(
                        "text-xs",
                        msg.isFromUser ? "bg-gray-100" : "bg-white"
                      )}>
                        {msg.isFromUser ? (
                          <User className="h-4 w-4 text-gray-600" />
                        ) : (
                          <img 
                            src={traffikBoostersLogo} 
                            alt="TB" 
                            className="h-7 w-7 object-contain"
                            style={{ imageRendering: 'crisp-edges' }}
                          />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        msg.isFromUser
                          ? "bg-gray-100 text-gray-900"
                          : "text-white"
                      )}
                      style={!msg.isFromUser ? { backgroundColor: primaryColor } : {}}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-gray-50">
              {chatPhase === "greeting" && (
                <div className="space-y-2">
                  <Button 
                    onClick={handleInitialResponse}
                    className="w-full text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Yes, I'm interested in boosting my traffic!
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-sm"
                  >
                    Maybe later
                  </Button>
                </div>
              )}

              {chatPhase === "form" && (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <Input
                    placeholder="Your name *"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                    className="text-sm"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Business email address *"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                    className="text-sm"
                    required
                  />
                  <Input
                    placeholder="Company name *"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
                    className="text-sm"
                    required
                  />
                  <Input
                    placeholder="Phone number"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="flex-1 text-sm"
                      style={{ backgroundColor: primaryColor }}
                      disabled={isSubmitting || !leadForm.name || !leadForm.email || !leadForm.company}
                    >
                      {isSubmitting ? "Submitting..." : "Start Chat"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="text-sm px-3"
                      onClick={() => setChatPhase("video")}
                      disabled={!leadForm.name || !leadForm.email || !leadForm.company}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}

              {chatPhase === "video" && (
                <div className="space-y-3">
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    {/* Video Call Interface */}
                    <div className="relative h-32">
                      {/* Remote video (agent) */}
                      <video 
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover bg-gray-800"
                        autoPlay
                        playsInline
                      />
                      {!isVideoCallActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <div className="text-white text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                              <img 
                                src={traffikBoostersLogo} 
                                alt="Agent" 
                                className="w-12 h-12 object-contain"
                              />
                            </div>
                            <p className="text-xs">Connecting to agent...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Local video (user) - small overlay */}
                      <div className="absolute bottom-2 right-2 w-16 h-12 bg-gray-700 rounded overflow-hidden">
                        <video 
                          ref={localVideoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                        />
                        {!isCameraOn && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                            <VideoOff className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Video Controls */}
                    <div className="p-3 bg-gray-800 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant={isMicOn ? "default" : "secondary"}
                        className="h-8 w-8 p-0"
                        onClick={() => setIsMicOn(!isMicOn)}
                      >
                        {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isCameraOn ? "default" : "secondary"}
                        className="h-8 w-8 p-0"
                        onClick={startVideoCall}
                      >
                        {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={endVideoCall}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2"
                        onClick={() => setChatPhase("chat")}
                      >
                        Chat
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">
                      Video consultation with Traffik Boosters expert
                    </p>
                    <p className="text-xs text-gray-500">
                      {leadForm.name} from {leadForm.company}
                    </p>
                  </div>
                </div>
              )}

              {chatPhase === "chat" && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2"
                      onClick={() => setChatPhase("video")}
                    >
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2"
                      onClick={() => window.open(`tel:(877) 840-6250`)}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask us anything..."
                      className="flex-1 text-sm"
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="px-3"
                      style={{ backgroundColor: primaryColor }}
                      disabled={!message.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}