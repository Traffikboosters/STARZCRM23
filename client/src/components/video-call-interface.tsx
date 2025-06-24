import { useState, useEffect, useRef } from "react";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users, Share2, MessageSquare, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoCallInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  callTitle: string;
  participants: string[];
  isHost?: boolean;
}

interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  timestamp: Date;
}

export default function VideoCallInterface({ 
  isOpen, 
  onClose, 
  callTitle, 
  participants, 
  isHost = false 
}: VideoCallInterfaceProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "Michael Thompson",
      message: "Welcome to the meeting!",
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: 2,
      sender: "Maria Rodriguez",
      message: "Thanks for joining. Ready to discuss the strategy.",
      timestamp: new Date(Date.now() - 30000)
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Start call timer
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Initialize video stream
  useEffect(() => {
    if (isOpen && isVideoOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log('Error accessing camera:', err));
    }
  }, [isOpen, isVideoOn]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now(),
        sender: "You",
        message: newMessage.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleEndCall = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        // In real implementation, would switch video feed to screen share
      } else {
        setIsScreenSharing(false);
        // Switch back to camera
      }
    } catch (err) {
      console.log('Screen sharing error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold">{callTitle}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {participants.length} participants
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    {formatDuration(callDuration)}
                  </span>
                  {isRecording && (
                    <Badge variant="destructive" className="text-xs">
                      Recording
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowChat(!showChat)}>
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Video Area */}
            <div className="flex-1 flex flex-col bg-gray-900 relative">
              {/* Main Video */}
              <div className="flex-1 flex items-center justify-center relative">
                {isVideoOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white">
                    <VideoOff className="h-12 w-12 mb-4" />
                    <p>Camera is off</p>
                  </div>
                )}
                
                {/* Screen sharing indicator */}
                {isScreenSharing && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-600">
                      <Share2 className="h-3 w-3 mr-1" />
                      Sharing Screen
                    </Badge>
                  </div>
                )}
              </div>

              {/* Participant Videos */}
              <div className="flex gap-2 p-4 bg-gray-800">
                {participants.map((participant, index) => (
                  <div key={index} className="relative">
                    <div className="w-24 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-white text-xs">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center mb-1 mx-auto">
                          {participant.charAt(0)}
                        </div>
                        <div className="truncate w-20">{participant.split(' ')[0]}</div>
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      {Math.random() > 0.5 && <Mic className="h-2 w-2 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
                <Button
                  variant={isAudioOn ? "default" : "destructive"}
                  size="lg"
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className="rounded-full w-12 h-12"
                >
                  {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant={isVideoOn ? "default" : "destructive"}
                  size="lg"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="rounded-full w-12 h-12"
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

                <Button
                  variant={isScreenSharing ? "default" : "outline"}
                  size="lg"
                  onClick={handleScreenShare}
                  className="rounded-full w-12 h-12"
                >
                  <Share2 className="h-5 w-5" />
                </Button>

                {isHost && (
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="lg"
                    onClick={() => setIsRecording(!isRecording)}
                    className="rounded-full w-12 h-12"
                  >
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndCall}
                  className="rounded-full w-12 h-12"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Chat Sidebar */}
            {showChat && (
              <Card className="w-80 m-0 rounded-none border-l">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Meeting Chat</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-full">
                  <ScrollArea className="flex-1 px-4">
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-medium">{msg.sender}</span>
                            <span>{msg.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm bg-gray-100 rounded-lg px-3 py-2">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={handleSendMessage}>
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}