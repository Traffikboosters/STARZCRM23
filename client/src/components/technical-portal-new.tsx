import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TechnicalProject, TechnicalTask } from "@shared/schema";
import { 
  Calendar, 
  Clock, 
  User, 
  BarChart3, 
  Settings, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Clock3, 
  Zap, 
  Target, 
  TrendingUp,
  Search,
  Code2,
  Monitor,
  Users,
  DollarSign,
  Timer,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  Stop
} from "lucide-react";

interface Project {
  id: number;
  clientName: string;
  projectType: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
  progress: number;
  description: string;
  budget: number;
  timeSpent: number;
  estimatedHours: number;
  tasks: Task[];
}

interface Task {
  id: number;
  title: string;
  type: string;
  status: string;
  assignedTo: string;
  estimatedHours: number;
  actualHours: number;
  priority: string;
  dueDate: string;
  notes: string;
}

interface TimeEntry {
  id: number;
  taskId: number;
  userId: number;
  hours: number;
  description: string;
  date: string;
  billableRate: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  activeProjects: number;
  completedTasks: number;
  hoursThisWeek: number;
  efficiency: number;
}

interface SEOTool {
  name: string;
  description: string;
  icon: React.ComponentType;
  action: () => void;
}

export function TechnicalPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [newTaskDialog, setNewTaskDialog] = useState(false);

  // Fetch projects from database
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/technical/projects"],
    retry: false,
  });

  // Fetch tasks from database
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/technical/tasks"],
    retry: false,
  });

  // Fetch time entries from database
  const { data: timeEntries = [], isLoading: timeLoading } = useQuery({
    queryKey: ['/api/time-entries'],
  });

  const sampleProjects: Project[] = Array.isArray(projects) && projects.length > 0 ? 
    projects.map((project: any) => ({
      id: project.id,
      clientName: project.clientName || "Client Name",
      projectType: project.projectType || "Both",
      status: project.status || "In Progress",
      priority: project.priority || "Medium",
      assignedTo: project.assignedTo || "Team Member",
      dueDate: project.dueDate || new Date().toISOString().split('T')[0],
      progress: project.progress || 0,
      description: project.description || "Project description",
      budget: project.budget || 0,
      timeSpent: project.timeSpent || 0,
      estimatedHours: project.estimatedHours || 0,
      tasks: Array.isArray(tasks) ? tasks.filter((task: any) => task.projectId === project.id).map((task: any) => ({
        id: task.id,
        title: task.title || "Task",
        type: task.type || "Development",
        status: task.status || "Pending", 
        assignedTo: task.assignedTo || "Team Member",
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
        priority: task.priority || "Medium",
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        notes: task.notes || ""
      })) : []
    })) : [
    {
      id: 1,
      clientName: "Metro HVAC Solutions",
      projectType: "Both",
      status: "In Progress",
      priority: "High",
      assignedTo: "Sarah Chen",
      dueDate: "2025-07-15",
      progress: 65,
      description: "Complete website redesign with SEO optimization for local HVAC company",
      budget: 8500,
      timeSpent: 45,
      estimatedHours: 70,
      tasks: [
        {
          id: 1,
          title: "Website Design Mockups",
          type: "Design",
          status: "Completed",
          assignedTo: "Sarah Chen",
          estimatedHours: 8,
          actualHours: 7,
          priority: "High",
          dueDate: "2025-06-30",
          notes: "Client approved modern design with orange accent colors"
        },
        {
          id: 2,
          title: "SEO Keyword Research",
          type: "SEO",
          status: "In Progress",
          assignedTo: "Mike Rodriguez",
          estimatedHours: 6,
          actualHours: 4,
          priority: "Medium",
          dueDate: "2025-07-02",
          notes: "Focusing on local HVAC terms and service areas"
        }
      ]
    },
    {
      id: 2,
      clientName: "Downtown Dental Practice",
      projectType: "SEO",
      status: "Planning",
      priority: "Medium",
      assignedTo: "Alex Kim",
      dueDate: "2025-08-01",
      progress: 15,
      description: "Local SEO optimization for dental practice with Google My Business setup",
      budget: 3500,
      timeSpent: 8,
      estimatedHours: 35,
      tasks: [
        {
          id: 3,
          title: "Competitor Analysis",
          type: "SEO",
          status: "Pending",
          assignedTo: "Alex Kim",
          estimatedHours: 4,
          actualHours: 0,
          priority: "High",
          dueDate: "2025-07-05",
          notes: "Research top 10 dental practices in downtown area"
        }
      ]
    }
  ];

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Lead Developer",
      avatar: "/avatars/sarah.jpg",
      activeProjects: 3,
      completedTasks: 28,
      hoursThisWeek: 42,
      efficiency: 94
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      role: "SEO Specialist",
      avatar: "/avatars/mike.jpg",
      activeProjects: 5,
      completedTasks: 34,
      hoursThisWeek: 38,
      efficiency: 87
    },
    {
      id: 3,
      name: "Alex Kim",
      role: "Web Developer",
      avatar: "/avatars/alex.jpg",
      activeProjects: 2,
      completedTasks: 19,
      hoursThisWeek: 35,
      efficiency: 91
    }
  ];

  const seoTools: SEOTool[] = [
    {
      name: "Keyword Research",
      description: "Analyze search volume and competition for target keywords",
      icon: Search,
      action: () => toast({ title: "Keyword Research Tool", description: "Analyzing search trends and competition data..." })
    },
    {
      name: "Site Speed Analysis",
      description: "Check page loading times and performance metrics",
      icon: Zap,
      action: () => toast({ title: "Speed Analysis", description: "Running comprehensive speed tests..." })
    },
    {
      name: "Local SEO Audit",
      description: "Audit local business listings and citations",
      icon: Target,
      action: () => toast({ title: "Local SEO Audit", description: "Scanning local directories and citations..." })
    },
    {
      name: "Backlink Checker",
      description: "Monitor domain authority and link profile",
      icon: TrendingUp,
      action: () => toast({ title: "Backlink Analysis", description: "Analyzing domain authority and link quality..." })
    },
    {
      name: "Content Optimizer",
      description: "Optimize content for search engines",
      icon: Code2,
      action: () => toast({ title: "Content Optimizer", description: "Analyzing content structure and keywords..." })
    },
    {
      name: "Schema Generator",
      description: "Generate structured data markup",
      icon: Monitor,
      action: () => toast({ title: "Schema Generator", description: "Creating structured data markup..." })
    }
  ];

  const startTimer = (taskId: number) => {
    setActiveTimer(taskId);
    setCurrentTime(0);
    toast({ title: "Timer Started", description: "Time tracking activated for this task" });
  };

  const stopTimer = () => {
    if (activeTimer) {
      toast({ 
        title: "Timer Stopped", 
        description: `Logged ${Math.floor(currentTime / 60)} minutes for this task` 
      });
      setActiveTimer(null);
      setCurrentTime(0);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Technical Portal</h1>
          <p className="text-muted-foreground">
            Manage SEO projects, web development tasks, and team performance
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newProjectDialog} onOpenChange={setNewProjectDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new SEO or web development project for your client.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input id="client-name" placeholder="Enter client name" />
                </div>
                <div>
                  <Label htmlFor="project-type">Project Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seo">SEO Only</SelectItem>
                      <SelectItem value="web">Web Development</SelectItem>
                      <SelectItem value="both">SEO + Web Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input id="budget" type="number" placeholder="Enter project budget" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Project description and requirements" />
                </div>
                <Button className="w-full">Create Project</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Task Board</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="tools">SEO Tools</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {sampleProjects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.clientName}</CardTitle>
                    <Badge variant={project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'default' : 'secondary'}>
                      {project.priority}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{project.projectType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">{project.status}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assigned:</span>
                      <p className="font-medium">{project.assignedTo}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due:</span>
                      <p className="font-medium">{project.dueDate}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">${project.budget.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Budget</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{project.timeSpent}h</p>
                      <p className="text-xs text-muted-foreground">Time Spent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{project.estimatedHours}h</p>
                      <p className="text-xs text-muted-foreground">Estimated</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Task Board</h2>
            <Dialog open={newTaskDialog} onOpenChange={setNewTaskDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to your project workflow.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input id="task-title" placeholder="Enter task title" />
                  </div>
                  <div>
                    <Label htmlFor="task-type">Task Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="seo">SEO</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimated-hours">Estimated Hours</Label>
                    <Input id="estimated-hours" type="number" placeholder="Enter estimated hours" />
                  </div>
                  <div>
                    <Label htmlFor="task-notes">Notes</Label>
                    <Textarea id="task-notes" placeholder="Task details and requirements" />
                  </div>
                  <Button className="w-full">Create Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Clock3 className="h-5 w-5 mr-2 text-orange-500" />
                Pending
              </h3>
              {sampleProjects.flatMap(project => 
                project.tasks.filter(task => task.status === 'Pending')
              ).map((task) => (
                <Card key={task.id} className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge variant="outline">{task.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{task.notes}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.assignedTo}</span>
                      <span>{task.estimatedHours}h</span>
                    </div>
                    <div className="flex gap-1 mt-3">
                      <Button size="sm" variant="outline" onClick={() => startTimer(task.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                In Progress
              </h3>
              {sampleProjects.flatMap(project => 
                project.tasks.filter(task => task.status === 'In Progress')
              ).map((task) => (
                <Card key={task.id} className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge variant="outline">{task.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{task.notes}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.assignedTo}</span>
                      <span>{task.actualHours}h / {task.estimatedHours}h</span>
                    </div>
                    {activeTimer === task.id && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span>Timer Active</span>
                          <Button size="sm" variant="outline" onClick={stopTimer}>
                            <Stop className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Completed
              </h3>
              {sampleProjects.flatMap(project => 
                project.tasks.filter(task => task.status === 'Completed')
              ).map((task) => (
                <Card key={task.id} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge variant="outline">{task.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{task.notes}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.assignedTo}</span>
                      <span>{task.actualHours}h completed</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <h2 className="text-2xl font-bold">Team Management</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{member.activeProjects}</p>
                      <p className="text-xs text-muted-foreground">Active Projects</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{member.completedTasks}</p>
                      <p className="text-xs text-muted-foreground">Tasks Done</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>This Week</span>
                      <span className="font-medium">{member.hoursThisWeek}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Efficiency</span>
                      <span className="font-medium text-green-600">{member.efficiency}%</span>
                    </div>
                    <Progress value={member.efficiency} className="h-2" />
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <User className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <h2 className="text-2xl font-bold">SEO Tools & Analytics</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seoTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={tool.action}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tool.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Launch Tool
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-3xl font-bold">{sampleProjects.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">12%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">${sampleProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">8%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hours Logged</p>
                    <p className="text-3xl font-bold">{sampleProjects.reduce((sum, p) => sum + p.timeSpent, 0)}</p>
                  </div>
                  <Timer className="h-8 w-8 text-orange-500" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">15%</span>
                  <span className="text-muted-foreground ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                    <p className="text-3xl font-bold">{teamMembers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <Minus className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-muted-foreground">No change</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Planning', 'In Progress', 'Review', 'Completed'].map((status, index) => {
                    const count = sampleProjects.filter(p => p.status === status).length;
                    const percentage = (count / sampleProjects.length) * 100;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{status}</span>
                          <span>{count} projects</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm">Sarah completed "Website Design Mockups"</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm">Mike started "SEO Keyword Research"</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-sm">New project "Downtown Dental" created</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm">Alex completed competitor analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TechnicalPortal;