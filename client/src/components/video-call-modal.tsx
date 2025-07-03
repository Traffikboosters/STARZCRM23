import { useState } from "react";
import { X, Dock, Paperclip, StopCircle, Mic, MicOff, Video, VideoOff, MessageSquare, Users } from "lucide-react";
import TraffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751503217918.png";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Participant {
  id: string;
  name: string;
  initials: string;
  isMuted: boolean;
}

export default function VideoCallModal({ isOpen, onClose }: VideoCallModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState("00:15:32");

  const participants: Participant[] = [
    { id: "1", name: "John Doe (You)", initials: "JD", isMuted: false },
    { id: "2", name: "Sarah Johnson", initials: "SJ", isMuted: true },
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-full p-0 bg-neutral-dark border-0">
        {/* Video call header */}
        <div className="bg-black bg-opacity-20 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <Video className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Team Standup</h3>
              <p className="text-gray-300 text-sm">{callDuration}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Dock className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-white hover:bg-white hover:bg-opacity-20 ${isRecording ? 'text-error' : ''}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive"
              size="sm"
              onClick={onClose}
            >
              End Call
            </Button>
          </div>
        </div>
        
        {/* Video grid */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-neutral-dark min-h-96 relative">
          {/* Traffik Boosters Logo Overlay - Upper Right Corner */}
          <div className="absolute top-8 right-8 z-20">
            <img 
              src={TraffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="h-14 w-auto opacity-90 drop-shadow-lg"
              style={{ filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.4))' }}
            />
          </div>
          
          {participants.map((participant, index) => (
            <div key={participant.id} className="bg-black rounded-lg relative overflow-hidden aspect-video">
              {/* Video placeholder - would be actual video stream */}
              <div className={`w-full h-full flex items-center justify-center ${
                index === 0 ? 'bg-gradient-to-br from-brand-primary to-brand-secondary' : 
                'bg-gradient-to-br from-success to-green-600'
              }`}>
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-white bg-opacity-20 text-white text-xl font-medium">
                    {participant.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {participant.name}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-3 right-3 text-white hover:bg-white hover:bg-opacity-20"
              >
                {participant.isMuted ? (
                  <MicOff className="h-4 w-4 text-error" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
        
        {/* Video call controls */}
        <div className="bg-black bg-opacity-20 p-4 flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="lg"
            className={`bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-full ${
              isMicMuted ? 'bg-error hover:bg-red-600' : ''
            }`}
            onClick={() => setIsMicMuted(!isMicMuted)}
          >
            {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className={`bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-full ${
              isCameraOff ? 'bg-error hover:bg-red-600' : ''
            }`}
            onClick={() => setIsCameraOff(!isCameraOff)}
          >
            {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-full"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-full"
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
