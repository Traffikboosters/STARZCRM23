import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Mail,
  X,
  Minimize2,
  Maximize2,
  Settings,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Code,
  Eye,
  Download,
  Palette,
  Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface ChatMessage {
  id: string;
  message: string;
  sender: 'visitor' | 'agent';
  timestamp: Date;
  senderName: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatSession {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  startTime: Date;
  status: 'active' | 'waiting' | 'closed';
  messages: ChatMessage[];
  assignedAgent?: string;
  leadScore: number;
  source: string;
}

interface WidgetSettings {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  accentColor: string;
  welcomeMessage: string;
  offlineMessage: string;
  collectEmail: boolean;
  collectPhone: boolean;
  showTypingIndicator: boolean;
  playSound: boolean;
  autoResponders: boolean;
}

const defaultSettings: WidgetSettings = {
  position: 'bottom-right',
  primaryColor: 'hsl(14, 88%, 55%)',
  accentColor: 'hsl(29, 85%, 58%)',
  welcomeMessage: 'Hi! How can we help you today?',
  offlineMessage: 'We\'re currently offline. Leave us a message and we\'ll get back to you!',
  collectEmail: true,
  collectPhone: true,
  showTypingIndicator: true,
  playSound: true,
  autoResponders: true
};

const sampleSessions: ChatSession[] = [
  {
    id: "chat-001",
    visitorName: "Sarah Martinez",
    visitorEmail: "sarah@bellavista.com",
    visitorPhone: "+1-555-0123",
    startTime: new Date(Date.now() - 15 * 60 * 1000),
    status: "active",
    assignedAgent: "Mike Rodriguez",
    leadScore: 85,
    source: "Website - Services Page",
    messages: [
      {
        id: "msg-001",
        message: "Hi! I'm interested in your digital marketing services for my restaurant.",
        sender: "visitor",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        senderName: "Sarah Martinez",
        status: "read"
      },
      {
        id: "msg-002",
        message: "Hello Sarah! I'd be happy to help you with digital marketing for your restaurant. What specific areas are you looking to improve?",
        sender: "agent",
        timestamp: new Date(Date.now() - 14 * 60 * 1000),
        senderName: "Mike Rodriguez",
        status: "read"
      },
      {
        id: "msg-003",
        message: "We need help with social media management and Google Ads. Our current marketing isn't bringing in enough customers.",
        sender: "visitor",
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        senderName: "Sarah Martinez",
        status: "read"
      },
      {
        id: "msg-004",
        message: "Perfect! We specialize in restaurant marketing. I can schedule a free consultation to discuss a custom strategy. Would you prefer a call or video meeting?",
        sender: "agent",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        senderName: "Mike Rodriguez",
        status: "delivered"
      }
    ]
  },
  {
    id: "chat-002",
    visitorName: "Anonymous Visitor",
    visitorEmail: "",
    startTime: new Date(Date.now() - 5 * 60 * 1000),
    status: "waiting",
    leadScore: 45,
    source: "Website - Homepage",
    messages: [
      {
        id: "msg-005",
        message: "What are your pricing plans?",
        sender: "visitor",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        senderName: "Anonymous Visitor",
        status: "sent"
      }
    ]
  }
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'demo' | 'sessions' | 'settings'>('demo');
  const [sessions, setSessions] = useState<ChatSession[]>(sampleSessions);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(sessions[0]);
  const [newMessage, setNewMessage] = useState("");
  const [visitorInfo, setVisitorInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [settings, setSettings] = useState<WidgetSettings>(defaultSettings);
  const [widgetCode, setWidgetCode] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession?.messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      message: newMessage,
      sender: 'agent',
      timestamp: new Date(),
      senderName: "You",
      status: 'sent'
    };

    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === selectedSession.id
          ? { ...session, messages: [...session.messages, message] }
          : session
      )
    );

    setSelectedSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message]
    } : null);

    setNewMessage("");

    // Simulate typing indicator and auto response
    if (settings.autoResponders) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Could add auto-response logic here
      }, 2000);
    }

    toast({
      title: "Message Sent",
      description: "Your message has been delivered to the visitor.",
    });
  };

  const generateWidgetCode = () => {
    const code = `<!-- Traffik Boosters Chat Widget -->
<script>
  (function() {
    window.TrafficBoostersChat = {
      apiKey: 'YOUR_API_KEY',
      settings: {
        position: '${settings.position}',
        primaryColor: '${settings.primaryColor}',
        accentColor: '${settings.accentColor}',
        welcomeMessage: '${settings.welcomeMessage}',
        collectEmail: ${settings.collectEmail},
        collectPhone: ${settings.collectPhone}
      }
    };
    
    var script = document.createElement('script');
    script.src = 'https://widget.traffikboosters.com/chat.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>

<!-- Optional: Custom styling -->
<style>
  .tb-chat-widget {
    --tb-primary: ${settings.primaryColor};
    --tb-accent: ${settings.accentColor};
  }
</style>`;

    setWidgetCode(code);
    
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: "Widget Code Copied!",
        description: "The chat widget code has been copied to your clipboard.",
      });
    });
  };

  const getStatusColor = (status: ChatSession['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (startTime: Date) => {
    const duration = Math.floor((Date.now() - startTime.getTime()) / 60000);
    return `${duration} min`;
  };

  const startNewChat = () => {
    if (!visitorInfo.name || !visitorInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please provide at least name and email to start a chat.",
        variant: "destructive"
      });
      return;
    }

    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      visitorName: visitorInfo.name,
      visitorEmail: visitorInfo.email,
      visitorPhone: visitorInfo.phone,
      startTime: new Date(),
      status: 'waiting',
      leadScore: 50,
      source: "Demo Widget",
      messages: visitorInfo.message ? [{
        id: `msg-${Date.now()}`,
        message: visitorInfo.message,
        sender: 'visitor',
        timestamp: new Date(),
        senderName: visitorInfo.name,
        status: 'sent'
      }] : []
    };

    setSessions(prev => [newSession, ...prev]);
    setSelectedSession(newSession);
    setVisitorInfo({ name: "", email: "", phone: "", message: "" });
    setCurrentView('sessions');

    toast({
      title: "New Chat Started",
      description: `Chat session with ${visitorInfo.name} has been created.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Chat Widget</h1>
          <p className="text-muted-foreground">Engage visitors and convert leads in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <img src={traffikBoostersLogo} alt="Traffik Boosters" className="h-8 w-auto" />
          <Badge className="bg-green-100 text-green-800">
            {sessions.filter(s => s.status === 'active').length} Active Chats
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation & Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Widget Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setCurrentView('demo')}
                variant={currentView === 'demo' ? 'default' : 'outline'}
                className="w-full justify-start"
              >
                <Eye className="w-4 h-4 mr-2" />
                Demo Preview
              </Button>
              <Button 
                onClick={() => setCurrentView('sessions')}
                variant={currentView === 'sessions' ? 'default' : 'outline'}
                className="w-full justify-start"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Sessions ({sessions.length})
              </Button>
              <Button 
                onClick={() => setCurrentView('settings')}
                variant={currentView === 'settings' ? 'default' : 'outline'}
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Widget Settings
              </Button>
              <Button onClick={generateWidgetCode} className="w-full justify-start">
                <Code className="w-4 h-4 mr-2" />
                Get Widget Code
              </Button>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          {currentView === 'sessions' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSession?.id === session.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {session.visitorName || 'Anonymous'}
                          </span>
                          <Badge className={getStatusColor(session.status)} variant="secondary">
                            {session.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Started: {formatTime(session.startTime)}</div>
                          <div>Duration: {formatDuration(session.startTime)}</div>
                          <div className="flex items-center justify-between">
                            <span>Lead Score:</span>
                            <Badge className={getLeadScoreColor(session.leadScore)} variant="secondary">
                              {session.leadScore}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentView === 'demo' && (
            <Card>
              <CardHeader>
                <CardTitle>Widget Demo</CardTitle>
                <CardDescription>
                  Preview how your chat widget will look and behave on your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Widget Preview */}
                <div className="relative border-2 border-dashed border-muted rounded-lg p-8 bg-muted/20 min-h-[400px]">
                  <div className="text-center text-muted-foreground mb-8">
                    Website Preview Area
                  </div>
                  
                  {/* Chat Widget */}
                  <div className={`fixed ${
                    settings.position === 'bottom-right' ? 'bottom-4 right-4' :
                    settings.position === 'bottom-left' ? 'bottom-4 left-4' :
                    settings.position === 'top-right' ? 'top-4 right-4' :
                    'top-4 left-4'
                  } z-50`}>
                    {!isOpen ? (
                      <Button
                        onClick={() => setIsOpen(true)}
                        className="rounded-full w-14 h-14 shadow-lg"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        <MessageCircle className="w-6 h-6" />
                      </Button>
                    ) : (
                      <Card className="w-80 h-96 shadow-xl">
                        <CardHeader className="p-3" style={{ backgroundColor: settings.primaryColor, color: 'white' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={traffikBoostersLogo} alt="Logo" className="w-6 h-6 rounded" />
                              <div>
                                <p className="font-medium text-sm">Traffik Boosters</p>
                                <p className="text-xs opacity-90">We're online!</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-6 h-6 p-0 text-white hover:bg-white/20"
                                onClick={() => setIsMinimized(!isMinimized)}
                              >
                                <Minimize2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-6 h-6 p-0 text-white hover:bg-white/20"
                                onClick={() => setIsOpen(false)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {!isMinimized && (
                          <CardContent className="p-0 flex flex-col h-80">
                            <div className="p-3 border-b">
                              <p className="text-sm text-muted-foreground">{settings.welcomeMessage}</p>
                            </div>
                            
                            <div className="flex-1 p-3 space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="demo-name">Name *</Label>
                                <Input
                                  id="demo-name"
                                  value={visitorInfo.name}
                                  onChange={(e) => setVisitorInfo(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Your name"
                                />
                              </div>
                              
                              {settings.collectEmail && (
                                <div className="space-y-2">
                                  <Label htmlFor="demo-email">Email *</Label>
                                  <Input
                                    id="demo-email"
                                    type="email"
                                    value={visitorInfo.email}
                                    onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="your@email.com"
                                  />
                                </div>
                              )}
                              
                              {settings.collectPhone && (
                                <div className="space-y-2">
                                  <Label htmlFor="demo-phone">Phone</Label>
                                  <Input
                                    id="demo-phone"
                                    value={visitorInfo.phone}
                                    onChange={(e) => setVisitorInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="(555) 123-4567"
                                  />
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <Label htmlFor="demo-message">Message</Label>
                                <Textarea
                                  id="demo-message"
                                  value={visitorInfo.message}
                                  onChange={(e) => setVisitorInfo(prev => ({ ...prev, message: e.target.value }))}
                                  placeholder="How can we help you?"
                                  rows={2}
                                />
                              </div>
                            </div>
                            
                            <div className="p-3 border-t">
                              <Button 
                                onClick={startNewChat} 
                                className="w-full"
                                style={{ backgroundColor: settings.accentColor }}
                              >
                                Start Chat
                              </Button>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentView === 'sessions' && selectedSession && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {selectedSession.visitorName || 'Anonymous Visitor'}
                    </CardTitle>
                    <CardDescription>
                      {selectedSession.visitorEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedSession.visitorEmail}
                        </span>
                      )}
                      {selectedSession.visitorPhone && (
                        <span className="flex items-center gap-1 ml-4">
                          <Phone className="w-3 h-3" />
                          {selectedSession.visitorPhone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getLeadScoreColor(selectedSession.leadScore)} variant="secondary">
                      Lead Score: {selectedSession.leadScore}%
                    </Badge>
                    <Badge className={getStatusColor(selectedSession.status)} variant="secondary">
                      {selectedSession.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Messages */}
                  <ScrollArea className="h-64 border rounded-lg p-3">
                    <div className="space-y-3">
                      {selectedSession.messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            message.sender === 'agent' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                              </span>
                              {message.sender === 'agent' && message.status && (
                                <div className="flex items-center gap-1">
                                  {message.status === 'sent' && <Clock className="w-3 h-3" />}
                                  {message.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
                                  {message.status === 'read' && <CheckCircle className="w-3 h-3 text-blue-400" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && settings.showTypingIndicator && (
                        <div className="flex justify-start">
                          <div className="bg-muted px-3 py-2 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentView === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Widget Settings</CardTitle>
                <CardDescription>
                  Customize your chat widget appearance and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Widget Position</Label>
                      <Select value={settings.position} onValueChange={(value: any) => 
                        setSettings(prev => ({ ...prev, position: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        />
                        <div 
                          className="w-10 h-10 rounded border cursor-pointer"
                          style={{ backgroundColor: settings.primaryColor }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          value={settings.accentColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        />
                        <div 
                          className="w-10 h-10 rounded border cursor-pointer"
                          style={{ backgroundColor: settings.accentColor }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Welcome Message</Label>
                      <Textarea
                        value={settings.welcomeMessage}
                        onChange={(e) => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Offline Message</Label>
                      <Textarea
                        value={settings.offlineMessage}
                        onChange={(e) => setSettings(prev => ({ ...prev, offlineMessage: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Collect Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Require email before starting chat
                        </p>
                      </div>
                      <Switch 
                        checked={settings.collectEmail}
                        onCheckedChange={(checked) => setSettings(prev => ({ 
                          ...prev, 
                          collectEmail: checked 
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Collect Phone</Label>
                        <p className="text-sm text-muted-foreground">
                          Ask for phone number (optional)
                        </p>
                      </div>
                      <Switch 
                        checked={settings.collectPhone}
                        onCheckedChange={(checked) => setSettings(prev => ({ 
                          ...prev, 
                          collectPhone: checked 
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Typing Indicator</Label>
                        <p className="text-sm text-muted-foreground">
                          Show when agents are typing
                        </p>
                      </div>
                      <Switch 
                        checked={settings.showTypingIndicator}
                        onCheckedChange={(checked) => setSettings(prev => ({ 
                          ...prev, 
                          showTypingIndicator: checked 
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sound Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Play sound for new messages
                        </p>
                      </div>
                      <Switch 
                        checked={settings.playSound}
                        onCheckedChange={(checked) => setSettings(prev => ({ 
                          ...prev, 
                          playSound: checked 
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Responders</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatic responses when offline
                        </p>
                      </div>
                      <Switch 
                        checked={settings.autoResponders}
                        onCheckedChange={(checked) => setSettings(prev => ({ 
                          ...prev, 
                          autoResponders: checked 
                        }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button onClick={generateWidgetCode} className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Generate & Copy Widget Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Widget Code Display */}
          {widgetCode && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Widget Installation Code</CardTitle>
                <CardDescription>
                  Copy this code and paste it before the closing &lt;/body&gt; tag on your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-64">
                    <code>{widgetCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => navigator.clipboard.writeText(widgetCode)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}