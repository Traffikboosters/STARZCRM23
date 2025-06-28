import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Code, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  BarChart3,
  TrendingUp,
  MapPin,
  Star,
  Eye,
  Users,
  Zap
} from 'lucide-react';

interface Project {
  id: number;
  clientName: string;
  projectType: 'SEO' | 'Web Development' | 'Both';
  status: 'Not Started' | 'In Progress' | 'Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo: string;
  dueDate: string;
  progress: number;
  description: string;
  tasks: Task[];
  budget: number;
  timeSpent: number;
  estimatedHours: number;
}

interface Task {
  id: number;
  title: string;
  type: 'SEO' | 'Development' | 'Design' | 'Content' | 'Analysis';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  assignedTo: string;
  estimatedHours: number;
  actualHours: number;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  notes: string;
}

const sampleProjects: Project[] = [
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
        title: "Keyword Research & Analysis",
        type: "SEO",
        status: "Completed",
        assignedTo: "Sarah Chen",
        estimatedHours: 8,
        actualHours: 7,
        priority: "High",
        dueDate: "2025-07-02",
        notes: "Completed comprehensive keyword analysis for HVAC services"
      },
      {
        id: 2,
        title: "Website Wireframe Design",
        type: "Design",
        status: "Completed",
        assignedTo: "Mike Rodriguez",
        estimatedHours: 12,
        actualHours: 14,
        priority: "High",
        dueDate: "2025-07-05",
        notes: "Client approved wireframes with minor revisions"
      },
      {
        id: 3,
        title: "Homepage Development",
        type: "Development",
        status: "In Progress",
        assignedTo: "Mike Rodriguez",
        estimatedHours: 15,
        actualHours: 8,
        priority: "High",
        dueDate: "2025-07-12",
        notes: "Working on responsive design implementation"
      },
      {
        id: 4,
        title: "Local SEO Setup",
        type: "SEO",
        status: "Pending",
        assignedTo: "Sarah Chen",
        estimatedHours: 10,
        actualHours: 0,
        priority: "Medium",
        dueDate: "2025-07-18",
        notes: "Awaiting completion of website structure"
      }
    ]
  },
  {
    id: 2,
    clientName: "Precision Plumbing",
    projectType: "SEO",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "David Kim",
    dueDate: "2025-07-25",
    progress: 40,
    description: "Complete SEO audit and optimization for plumbing services website",
    budget: 3200,
    timeSpent: 18,
    estimatedHours: 45,
    tasks: [
      {
        id: 5,
        title: "Technical SEO Audit",
        type: "SEO",
        status: "Completed",
        assignedTo: "David Kim",
        estimatedHours: 12,
        actualHours: 11,
        priority: "High",
        dueDate: "2025-07-08",
        notes: "Identified 23 technical issues requiring fixes"
      },
      {
        id: 6,
        title: "Content Optimization",
        type: "Content",
        status: "In Progress",
        assignedTo: "David Kim",
        estimatedHours: 15,
        actualHours: 7,
        priority: "Medium",
        dueDate: "2025-07-20",
        notes: "Optimizing service pages for local search terms"
      }
    ]
  },
  {
    id: 3,
    clientName: "Elite Carpet Cleaning",
    projectType: "Web Development",
    status: "Review",
    priority: "Medium",
    assignedTo: "Mike Rodriguez",
    dueDate: "2025-07-10",
    progress: 95,
    description: "Modern responsive website with booking system",
    budget: 5500,
    timeSpent: 52,
    estimatedHours: 55,
    tasks: [
      {
        id: 7,
        title: "Booking System Integration",
        type: "Development",
        status: "Completed",
        assignedTo: "Mike Rodriguez",
        estimatedHours: 20,
        actualHours: 22,
        priority: "High",
        dueDate: "2025-07-08",
        notes: "Calendar integration with automated confirmation emails"
      },
      {
        id: 8,
        title: "Client Review & Testing",
        type: "Analysis",
        status: "In Progress",
        assignedTo: "Mike Rodriguez",
        estimatedHours: 5,
        actualHours: 3,
        priority: "Medium",
        dueDate: "2025-07-10",
        notes: "Awaiting client feedback on final version"
      }
    ]
  }
];

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "Senior SEO Specialist",
    email: "sarah.chen@traffikboosters.com",
    expertise: ["Local SEO", "Technical SEO", "Content Strategy"],
    activeProjects: 3,
    completedThisMonth: 8,
    efficiency: 95
  },
  {
    name: "Mike Rodriguez",
    role: "Lead Web Developer",
    email: "mike.rodriguez@traffikboosters.com",
    expertise: ["React", "WordPress", "E-commerce"],
    activeProjects: 2,
    completedThisMonth: 5,
    efficiency: 92
  },
  {
    name: "David Kim",
    role: "SEO Analyst",
    email: "david.kim@traffikboosters.com",
    expertise: ["Analytics", "Reporting", "Keyword Research"],
    activeProjects: 4,
    completedThisMonth: 12,
    efficiency: 88
  }
];

export default function TechnicalPortal() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("projects");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Review': return 'bg-yellow-500';
      case 'Not Started': return 'bg-gray-500';
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

  const updateTaskStatus = (projectId: number, taskId: number, newStatus: string) => {
    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Technical Portal</h1>
          <p className="text-muted-foreground">SEO & Web Development Project Management</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            {teamMembers.length} Team Members
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Code className="w-4 h-4 mr-1" />
            {sampleProjects.length} Active Projects
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Task Board</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="tools">SEO Tools</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {sampleProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.clientName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <Badge variant="outline">
                        {project.projectType}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{project.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{project.timeSpent}h / {project.estimatedHours}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></span>
                        <span>{project.status}</span>
                      </div>
                    </div>

                    {/* Tasks Summary */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tasks: {project.tasks.length}</span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">
                            {project.tasks.filter(t => t.status === 'Completed').length} Done
                          </span>
                          <span className="text-blue-600">
                            {project.tasks.filter(t => t.status === 'In Progress').length} Active
                          </span>
                          <span className="text-gray-600">
                            {project.tasks.filter(t => t.status === 'Pending').length} Pending
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setSelectedProject(project)}
                      variant="outline" 
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Task Board Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            {['Pending', 'In Progress', 'Review', 'Completed'].map((status) => (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></span>
                    {status}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sampleProjects.flatMap(p => p.tasks)
                    .filter(task => task.status === status || (status === 'Review' && task.status === 'Completed'))
                    .map((task) => (
                    <Card key={task.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {task.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{task.assignedTo}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>{task.actualHours}h / {task.estimatedHours}h</span>
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            {task.priority}
                          </Badge>
                        </div>
                        {task.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Active Projects</span>
                      <Badge variant="outline">{member.activeProjects}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Completed This Month</span>
                      <Badge variant="outline">{member.completedThisMonth}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Efficiency Rate</span>
                      <Badge className="bg-green-500">{member.efficiency}%</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SEO Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Keyword Research Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Keyword Research
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Keyword</label>
                  <input 
                    type="text" 
                    placeholder="Enter keyword..."
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <input 
                    type="text" 
                    placeholder="City, State"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <Button className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Keywords
                </Button>
                <div className="text-xs text-muted-foreground">
                  Research search volume, competition, and related keywords
                </div>
              </CardContent>
            </Card>

            {/* Website Speed Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Speed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>
                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Test Speed
                </Button>
                <div className="text-xs text-muted-foreground">
                  Check Core Web Vitals and performance metrics
                </div>
              </CardContent>
            </Card>

            {/* Local SEO Audit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Local SEO Audit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <input 
                    type="text" 
                    placeholder="Business name"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Address</label>
                  <input 
                    type="text" 
                    placeholder="Full address"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <Button className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Audit Citations
                </Button>
                <div className="text-xs text-muted-foreground">
                  Check NAP consistency across directories
                </div>
              </CardContent>
            </Card>

            {/* Backlink Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Backlink Checker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Domain</label>
                  <input 
                    type="text" 
                    placeholder="example.com"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <Button className="w-full">
                  <Globe className="w-4 h-4 mr-2" />
                  Check Backlinks
                </Button>
                <div className="text-xs text-muted-foreground">
                  Analyze domain authority and link profile
                </div>
              </CardContent>
            </Card>

            {/* Content Optimizer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Optimizer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Keywords</label>
                  <input 
                    type="text" 
                    placeholder="keyword1, keyword2"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <textarea 
                    placeholder="Paste your content here..."
                    className="w-full p-2 border rounded h-20 resize-none"
                  />
                </div>
                <Button className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Optimize Content
                </Button>
                <div className="text-xs text-muted-foreground">
                  Get keyword density and SEO recommendations
                </div>
              </CardContent>
            </Card>

            {/* Schema Markup Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Schema Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schema Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="local-business">Local Business</option>
                    <option value="article">Article</option>
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>
                <Button className="w-full">
                  <Code className="w-4 h-4 mr-2" />
                  Generate Schema
                </Button>
                <div className="text-xs text-muted-foreground">
                  Create structured data markup for better SERP visibility
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-16 flex-col">
                  <Search className="w-6 h-6 mb-1" />
                  <span className="text-xs">Google Console</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <BarChart3 className="w-6 h-6 mb-1" />
                  <span className="text-xs">Analytics</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Globe className="w-6 h-6 mb-1" />
                  <span className="text-xs">Screaming Frog</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Zap className="w-6 h-6 mb-1" />
                  <span className="text-xs">PageSpeed</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <MapPin className="w-6 h-6 mb-1" />
                  <span className="text-xs">GMB Manager</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <FileText className="w-6 h-6 mb-1" />
                  <span className="text-xs">Yoast SEO</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Users className="w-6 h-6 mb-1" />
                  <span className="text-xs">SEMrush</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Star className="w-6 h-6 mb-1" />
                  <span className="text-xs">Ahrefs</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{sampleProjects.length}</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">+2 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {Math.round(sampleProjects.reduce((acc, p) => acc + p.progress, 0) / sampleProjects.length)}%
                  </span>
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    ${sampleProjects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}
                  </span>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground">Active projects value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {Math.round(teamMembers.reduce((acc, m) => acc + m.efficiency, 0) / teamMembers.length)}%
                  </span>
                  <Zap className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-xs text-muted-foreground">Average team performance</p>
              </CardContent>
            </Card>
          </div>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleProjects.map((project) => (
                  <div key={project.id} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(project.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{project.clientName}</span>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedProject.clientName} - Project Details</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Overview */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Project Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {selectedProject.projectType}</div>
                    <div><strong>Status:</strong> {selectedProject.status}</div>
                    <div><strong>Priority:</strong> {selectedProject.priority}</div>
                    <div><strong>Assigned To:</strong> {selectedProject.assignedTo}</div>
                    <div><strong>Due Date:</strong> {new Date(selectedProject.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Budget & Time</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Budget:</strong> ${selectedProject.budget.toLocaleString()}</div>
                    <div><strong>Time Spent:</strong> {selectedProject.timeSpent} hours</div>
                    <div><strong>Estimated:</strong> {selectedProject.estimatedHours} hours</div>
                    <div><strong>Progress:</strong> {selectedProject.progress}%</div>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="font-semibold mb-4">Project Tasks</h3>
                <div className="space-y-3">
                  {selectedProject.tasks.map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.type}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm mb-2">
                        <div><strong>Assigned:</strong> {task.assignedTo}</div>
                        <div><strong>Status:</strong> {task.status}</div>
                        <div><strong>Time:</strong> {task.actualHours}h / {task.estimatedHours}h</div>
                        <div><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</div>
                      </div>
                      {task.notes && (
                        <p className="text-sm text-muted-foreground italic">{task.notes}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}