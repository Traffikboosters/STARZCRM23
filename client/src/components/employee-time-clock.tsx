import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  Calendar,
  MapPin,
  Timer,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

interface TimeClockEntry {
  id: number;
  userId: number;
  clockInTime: string;
  clockOutTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  totalHours?: string;
  totalBreakMinutes: number;
  department: string;
  location: string;
  notes?: string;
  status: string;
}

interface TimeClockStatus {
  isClockedIn: boolean;
  activeEntry: TimeClockEntry | null;
  isOnBreak: boolean;
}

export default function EmployeeTimeClock() {
  const [notes, setNotes] = useState("");
  const [department, setDepartment] = useState("sales");
  const [location, setLocation] = useState("office");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current user (assuming user ID 1 for demo)
  const currentUserId = 1;

  // Fetch time clock status
  const { data: timeClockStatus, isLoading: statusLoading } = useQuery<TimeClockStatus>({
    queryKey: ["/api/timeclock/status", currentUserId],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent time entries
  const { data: timeEntries = [], isLoading: entriesLoading } = useQuery<TimeClockEntry[]>({
    queryKey: ["/api/timeclock/entries", currentUserId],
  });

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/timeclock/clock-in", {
      userId: currentUserId,
      department,
      location,
      notes
    }),
    onSuccess: () => {
      toast({
        title: "Clocked In Successfully",
        description: "Your work day has started. Have a productive day!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timeclock/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeclock/entries"] });
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Clock In Failed",
        description: error.message || "Failed to clock in",
        variant: "destructive",
      });
    },
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/timeclock/clock-out", {
      userId: currentUserId,
      notes
    }),
    onSuccess: () => {
      toast({
        title: "Clocked Out Successfully",
        description: "Your work day is complete. Great job today!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timeclock/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeclock/entries"] });
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Clock Out Failed",
        description: error.message || "Failed to clock out",
        variant: "destructive",
      });
    },
  });

  // Break start mutation
  const breakStartMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/timeclock/break-start", {
      userId: currentUserId
    }),
    onSuccess: () => {
      toast({
        title: "Break Started",
        description: "Enjoy your break!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timeclock/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Break Start Failed",
        description: error.message || "Failed to start break",
        variant: "destructive",
      });
    },
  });

  // Break end mutation
  const breakEndMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/timeclock/break-end", {
      userId: currentUserId
    }),
    onSuccess: () => {
      toast({
        title: "Break Ended",
        description: "Welcome back! Ready to continue working.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timeclock/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Break End Failed",
        description: error.message || "Failed to end break",
        variant: "destructive",
      });
    },
  });

  const formatTime = (date: Date) => {
    return format(date, 'h:mm:ss a');
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const calculateHoursWorked = (clockIn: string, clockOut?: string) => {
    const start = new Date(clockIn);
    const end = clockOut ? new Date(clockOut) : new Date();
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with current time */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className="h-6 w-6" />
            Employee Time Clock
          </CardTitle>
          <CardDescription>
            <div className="text-2xl font-mono text-primary">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(currentTime)}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="clock" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clock">Time Clock</TabsTrigger>
          <TabsTrigger value="history">Time History</TabsTrigger>
          <TabsTrigger value="summary">Weekly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-5 w-5 ${timeClockStatus?.isClockedIn ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="font-medium">
                    {timeClockStatus?.isClockedIn ? 'Clocked In' : 'Not Clocked In'}
                  </span>
                </div>
                
                {timeClockStatus?.activeEntry && (
                  <>
                    <div className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-blue-500" />
                      <span>
                        Hours: {calculateHoursWorked(timeClockStatus.activeEntry.clockInTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Coffee className={`h-5 w-5 ${timeClockStatus.isOnBreak ? 'text-orange-500' : 'text-gray-400'}`} />
                      <span>
                        {timeClockStatus.isOnBreak ? 'On Break' : 'Working'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {timeClockStatus?.activeEntry && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Clock In Time</Label>
                      <div className="font-medium">
                        {format(new Date(timeClockStatus.activeEntry.clockInTime), 'h:mm a')}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Department</Label>
                      <div className="font-medium capitalize">
                        {timeClockStatus.activeEntry.department}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <div className="font-medium capitalize">
                        {timeClockStatus.activeEntry.location}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Break Time</Label>
                      <div className="font-medium">
                        {timeClockStatus.activeEntry.totalBreakMinutes} min
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Clock Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Time Clock Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!timeClockStatus?.isClockedIn ? (
                <>
                  {/* Clock In Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="field">Field Work</SelectItem>
                          <SelectItem value="client-site">Client Site</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about your shift..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={() => clockInMutation.mutate()}
                    disabled={clockInMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
                  </Button>
                </>
              ) : (
                <>
                  {/* Clock Out and Break Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!timeClockStatus.isOnBreak ? (
                      <Button
                        onClick={() => breakStartMutation.mutate()}
                        disabled={breakStartMutation.isPending}
                        variant="outline"
                        size="lg"
                      >
                        <Coffee className="mr-2 h-4 w-4" />
                        {breakStartMutation.isPending ? "Starting..." : "Start Break"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => breakEndMutation.mutate()}
                        disabled={breakEndMutation.isPending}
                        variant="outline"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {breakEndMutation.isPending ? "Ending..." : "End Break"}
                      </Button>
                    )}

                    <Button
                      onClick={() => clockOutMutation.mutate()}
                      disabled={clockOutMutation.isPending}
                      variant="destructive"
                      size="lg"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="clockOutNotes">Clock Out Notes (Optional)</Label>
                    <Textarea
                      id="clockOutNotes"
                      placeholder="Add any notes about your shift completion..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Time Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No time entries found
                </div>
              ) : (
                <div className="space-y-4">
                  {timeEntries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(new Date(entry.clockInTime), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span>
                            {format(new Date(entry.clockInTime), 'h:mm a')} - 
                            {entry.clockOutTime ? format(new Date(entry.clockOutTime), 'h:mm a') : 'Active'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {entry.location}
                          </span>
                          <span>{entry.department}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(entry.status)}
                        <div className="text-sm font-medium">
                          {entry.totalHours ? `${entry.totalHours}h` : calculateHoursWorked(entry.clockInTime, entry.clockOutTime) + 'h'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {timeEntries.filter(e => e.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Worked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {timeEntries
                      .filter(e => e.totalHours)
                      .reduce((acc, e) => acc + parseFloat(e.totalHours || '0'), 0)
                      .toFixed(1)}h
                  </div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {timeEntries.length > 0 
                      ? (timeEntries
                          .filter(e => e.totalHours)
                          .reduce((acc, e) => acc + parseFloat(e.totalHours || '0'), 0) / 
                         timeEntries.filter(e => e.status === 'completed').length || 1)
                          .toFixed(1)
                      : '0'}h
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Per Day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}