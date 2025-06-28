import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Clock, 
  User, 
  Calendar, 
  CheckCircle, 
  PlayCircle, 
  PauseCircle,
  Edit,
  Timer,
  Target,
  Code,
  Search,
  Palette,
  FileText,
  BarChart3
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  type: 'SEO' | 'Development' | 'Design' | 'Content' | 'Analysis';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo: string;
  clientName: string;
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number;
  dueDate: string;
  startDate?: string;
  completedDate?: string;
  notes: string;
  tags: string[];
}

interface TimeEntry {
  id: number;
  taskId: number;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
}

const sampleTasks: Task[] = [
  {
    id: 1,
    title: "Local SEO Optimization",
    description: "Optimize Google My Business and local citations for Metro HVAC",
    type: "SEO",
    status: "In Progress",
    priority: "High",
    assignedTo: "Sarah Chen",
    clientName: "Metro HVAC Solutions",
    estimatedHours: 12,
    actualHours: 8,
    hourlyRate: 95,
    dueDate: "2025-07-15",
    startDate: "2025-06-28",
    notes: "Focus on service area pages and citation consistency",
    tags: ["Local SEO", "GMB", "Citations"]
  },
  {
    id: 2,
    title: "E-commerce Website Development",
    description: "Build custom WordPress e-commerce site with WooCommerce",
    type: "Development",
    status: "In Progress",
    priority: "High",
    assignedTo: "Mike Rodriguez",
    clientName: "Precision Tools Inc",
    estimatedHours: 45,
    actualHours: 28,
    hourlyRate: 125,
    dueDate: "2025-08-01",
    startDate: "2025-06-20",
    notes: "Custom product configurator needed",
    tags: ["WordPress", "WooCommerce", "E-commerce"]
  },
  {
    id: 3,
    title: "Website Speed Optimization",
    description: "Improve Core Web Vitals and page load speeds",
    type: "Development",
    status: "Pending",
    priority: "Medium",
    assignedTo: "David Kim",
    clientName: "Elite Carpet Cleaning",
    estimatedHours: 8,
    actualHours: 0,
    hourlyRate: 85,
    dueDate: "2025-07-20",
    notes: "Focus on image optimization and caching",
    tags: ["Performance", "Core Web Vitals", "Optimization"]
  },
  {
    id: 4,
    title: "Content Strategy & Blog Setup",
    description: "Create content calendar and establish blog structure",
    type: "Content",
    status: "Completed",
    priority: "Medium",
    assignedTo: "Sarah Chen",
    clientName: "Green Valley Landscaping",
    estimatedHours: 10,
    actualHours: 12,
    hourlyRate: 75,
    dueDate: "2025-06-30",
    startDate: "2025-06-15",
    completedDate: "2025-06-28",
    notes: "Successfully launched with 20 blog post topics",
    tags: ["Content Marketing", "Blog", "Strategy"]
  }
];

const teamMembers = [
  "Sarah Chen",
  "Mike Rodriguez", 
  "David Kim",
  "Jessica Park",
  "Ryan Thompson"
];

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-black';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SEO': return <Search className="w-4 h-4" />;
      case 'Development': return <Code className="w-4 h-4" />;
      case 'Design': return <Palette className="w-4 h-4" />;
      case 'Content': return <FileText className="w-4 h-4" />;
      case 'Analysis': return <BarChart3 className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const calculateRevenue = (task: Task) => {
    return task.actualHours * task.hourlyRate;
  };

  const startTimer = (taskId: number) => {
    setActiveTimer(taskId);
    toast({
      title: "Timer Started",
      description: "Time tracking activated for this task",
    });
  };

  const stopTimer = (taskId: number) => {
    setActiveTimer(null);
    toast({
      title: "Timer Stopped",
      description: "Time logged for this task",
    });
  };

  const updateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as Task['status'] }
        : task
    ));
    
    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus}`,
    });
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const assigneeMatch = filterAssignee === "all" || task.assignedTo === filterAssignee;
    return statusMatch && assigneeMatch;
  });

  const totalRevenue = filteredTasks.reduce((acc, task) => acc + calculateRevenue(task), 0);
  const totalHours = filteredTasks.reduce((acc, task) => acc + task.actualHours, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header & Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Manage SEO & Development Projects</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Task Title</label>
                  <Input placeholder="Enter task title" />
                </div>
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <Input placeholder="Client name" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Task description" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEO">SEO</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Content">Content</SelectItem>
                      <SelectItem value="Analysis">Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member} value={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Estimated Hours</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <label className="text-sm font-medium">Hourly Rate ($)</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsCreateModalOpen(false);
                  toast({
                    title: "Task Created",
                    description: "New task has been added successfully",
                  });
                }}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Stats */}
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium mr-2">Status:</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mr-2">Assignee:</label>
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member} value={member}>{member}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="font-medium">Total Hours:</span>
            <span className="ml-2">{totalHours}h</span>
          </div>
          <div>
            <span className="font-medium">Total Revenue:</span>
            <span className="ml-2">${totalRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="font-medium">Tasks:</span>
            <span className="ml-2">{filteredTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(task.type)}
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{task.clientName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline">
                    {task.type}
                  </Badge>
                  <Badge className={`text-white ${getStatusColor(task.status)}`}>
                    {task.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{task.description}</p>
                
                {/* Task Details */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{task.actualHours}h / {task.estimatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${task.hourlyRate}/hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">
                      ${calculateRevenue(task).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {task.status === 'In Progress' && (
                      <>
                        {activeTimer === task.id ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => stopTimer(task.id)}
                          >
                            <PauseCircle className="w-4 h-4 mr-1" />
                            Stop Timer
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startTimer(task.id)}
                          >
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Start Timer
                          </Button>
                        )}
                      </>
                    )}
                    
                    <Select onValueChange={(value) => updateTaskStatus(task.id, value)}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTask(task)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    
                    {task.status === 'Pending' && (
                      <Button 
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'In Progress')}
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Start Task
                      </Button>
                    )}
                    
                    {task.status === 'In Progress' && (
                      <Button 
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'Completed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTask.title} - Task Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Task Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Task Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Client:</strong> {selectedTask.clientName}</div>
                      <div><strong>Type:</strong> {selectedTask.type}</div>
                      <div><strong>Status:</strong> {selectedTask.status}</div>
                      <div><strong>Priority:</strong> {selectedTask.priority}</div>
                      <div><strong>Assigned To:</strong> {selectedTask.assignedTo}</div>
                      <div><strong>Due Date:</strong> {new Date(selectedTask.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Time & Budget</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Estimated:</strong> {selectedTask.estimatedHours} hours</div>
                      <div><strong>Actual:</strong> {selectedTask.actualHours} hours</div>
                      <div><strong>Hourly Rate:</strong> ${selectedTask.hourlyRate}</div>
                      <div><strong>Total Revenue:</strong> ${calculateRevenue(selectedTask).toLocaleString()}</div>
                      <div><strong>Progress:</strong> {Math.round((selectedTask.actualHours / selectedTask.estimatedHours) * 100)}%</div>
                    </div>
                  </div>
                  
                  {selectedTask.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-sm text-muted-foreground">{selectedTask.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              {selectedTask.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}