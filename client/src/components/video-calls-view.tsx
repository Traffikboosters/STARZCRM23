import { useState } from "react";
import { Video, Phone, Users, Calendar, Clock, Plus, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface VideoCall {
  id: number;
  title: string;
  participants: string[];
  scheduledTime: Date;
  duration: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  recordingEnabled: boolean;
  meetingUrl?: string;
}

const mockCalls: VideoCall[] = [
  {
    id: 1,
    title: "Client Strategy Session - Bella Cuisine",
    participants: ["Maria Rodriguez", "Michael Thompson"],
    scheduledTime: new Date(2025, 5, 23, 14, 0),
    duration: 60,
    status: 'scheduled',
    recordingEnabled: true
  },
  {
    id: 2,
    title: "Team Weekly Standup",
    participants: ["Michael Thompson", "Sarah Johnson", "David Chen"],
    scheduledTime: new Date(2025, 5, 23, 10, 0),
    duration: 30,
    status: 'completed',
    recordingEnabled: false
  },
  {
    id: 3,
    title: "Sales Demo - TechStart Solutions",
    participants: ["David Chen", "Michael Thompson"],
    scheduledTime: new Date(2025, 5, 23, 16, 30),
    duration: 45,
    status: 'scheduled',
    recordingEnabled: true
  }
];

export default function VideoCallsView() {
  const [isCreateCallOpen, setIsCreateCallOpen] = useState(false);
  const [calls, setCalls] = useState<VideoCall[]>(mockCalls);

  const getStatusColor = (status: VideoCall['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: VideoCall['status']) => {
    switch (status) {
      case 'active': return <Video className="h-4 w-4 text-green-600" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'completed': return <VideoOff className="h-4 w-4 text-gray-600" />;
      case 'cancelled': return <VideoOff className="h-4 w-4 text-red-600" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const handleJoinCall = (call: VideoCall) => {
    // In a real implementation, this would open the video call interface
    console.log(`Joining call: ${call.title}`);
  };

  const handleStartInstantMeeting = () => {
    const newCall: VideoCall = {
      id: calls.length + 1,
      title: "Instant Meeting",
      participants: ["Michael Thompson"],
      scheduledTime: new Date(),
      duration: 30,
      status: 'active',
      recordingEnabled: false,
      meetingUrl: `https://meet.traffikboosters.com/instant-${Date.now()}`
    };
    setCalls([newCall, ...calls]);
    handleJoinCall(newCall);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Calls</h1>
          <p className="text-gray-600 mt-2">Manage your video meetings and conferences</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleStartInstantMeeting} className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Start Instant Meeting
          </Button>
          <Dialog open={isCreateCallOpen} onOpenChange={setIsCreateCallOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Video Call</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input id="title" placeholder="Enter meeting title" />
                </div>
                <div>
                  <Label htmlFor="participants">Participants</Label>
                  <Input id="participants" placeholder="Enter email addresses" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" defaultValue={60} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Meeting description (optional)" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateCallOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateCallOpen(false)}>
                    Schedule Meeting
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-green-600" />
            Active Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calls.filter(call => call.status === 'active').length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active calls</p>
          ) : (
            <div className="space-y-3">
              {calls.filter(call => call.status === 'active').map(call => (
                <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold">{call.title}</h3>
                      <p className="text-sm text-gray-600">
                        {call.participants.length} participant(s)
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleJoinCall(call)} className="bg-green-600 hover:bg-green-700">
                    Join Call
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Scheduled Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calls.filter(call => call.status === 'scheduled').map(call => (
              <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(call.status)}
                  <div>
                    <h3 className="font-semibold">{call.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(call.scheduledTime, "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {call.participants.length} participants
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(call.status)}>
                    {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleJoinCall(call)}
                    disabled={call.status !== 'scheduled'}
                  >
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calls.filter(call => call.status === 'completed').map(call => (
              <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(call.status)}
                  <div>
                    <h3 className="font-semibold">{call.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{format(call.scheduledTime, "MMM d, yyyy")}</span>
                      <span>{call.duration} minutes</span>
                      {call.recordingEnabled && <Badge variant="secondary">Recorded</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(call.status)}>
                    Completed
                  </Badge>
                  {call.recordingEnabled && (
                    <Button variant="outline" size="sm">
                      View Recording
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}