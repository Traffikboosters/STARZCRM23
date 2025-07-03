import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Briefcase, 
  Plus, 
  Users, 
  Calendar, 
  Settings, 
  ExternalLink,
  Clock,
  DollarSign,
  MapPin,
  Building,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  User,
  Star,
  FileText,
  Phone,
  Mail,
  Globe
} from "lucide-react";
// Note: Type imports will be resolved at runtime
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

// Live job postings from Traffik Boosters website
const liveJobPostings = [
  {
    id: 1,
    title: "PPC Advertising Marketer",
    department: "Digital Marketing",
    type: "Full Time",
    location: "Remote",
    postedDate: "2025-01-17",
    description: "We are seeking a talented and results-driven PPC Advertising Marketer to join our digital marketing team. The ideal candidate will have a strong background in managing PPC campaigns, a deep understanding of digital advertising platforms, and a proven track record of driving measurable results through paid search and display advertising.",
    requirements: ["3+ years PPC experience", "Google Ads certified", "Analytics expertise", "Campaign optimization skills"],
    applyUrl: "https://traffikboosters.com/job-apply-ppc-advertising-marketer/",
    salary: "$55,000 - $75,000",
    status: "active"
  },
  {
    id: 2,
    title: "SEO Specialist",
    department: "Digital Marketing",
    type: "Full Time",
    location: "Remote",
    postedDate: "2025-01-06",
    description: "We are seeking a talented and motivated SEO Specialist to join our marketing team. The ideal candidate will have a strong understanding of search engine optimization strategies, stay updated on industry trends, and implement effective tactics to enhance our online visibility and drive organic traffic.",
    requirements: ["2+ years SEO experience", "Technical SEO knowledge", "Content optimization", "Analytics tools proficiency"],
    applyUrl: "https://traffikboosters.com/job-apply-seo-specialist/",
    salary: "$50,000 - $70,000",
    status: "active"
  },
  {
    id: 3,
    title: "Sales Consultant",
    department: "Sales",
    type: "Full Time",
    location: "Remote",
    postedDate: "2025-01-08",
    description: "Traffik Boosters is a leading digital marketing agency dedicated to empowering businesses with innovative and strategic online marketing solutions. Our mission is to elevate brands in the digital landscape by delivering measurable results and fostering long-term partnerships.",
    requirements: ["5+ years sales experience", "Digital marketing knowledge", "Client relationship management", "Commission-driven mindset"],
    applyUrl: "https://traffikboosters.com/job-apply-marketing-agency/",
    salary: "$45,000 + Commission",
    status: "active"
  },
  {
    id: 4,
    title: "Social Media Marketer",
    department: "Digital Marketing",
    type: "Full Time",
    location: "Remote",
    postedDate: "2025-01-09",
    description: "We are looking for a creative and results-driven Social Media Marketer to join our marketing team. The ideal candidate will have a passion for social media, a deep understanding of various platforms, and a proven track record of developing and implementing effective social media strategies.",
    requirements: ["3+ years social media experience", "Content creation skills", "Platform expertise", "Analytics and reporting"],
    applyUrl: "https://traffikboosters.com/job-apply-social-media-marketer/",
    salary: "$48,000 - $65,000",
    status: "active"
  },
  {
    id: 5,
    title: "Web Designer & Developer",
    department: "Development",
    type: "Full Time",
    location: "Remote",
    postedDate: "2025-01-12",
    description: "We are seeking a talented and creative Web Designer & Developer to join our team. The ideal candidate will have a passion for creating visually appealing and user-friendly websites. From conceptualization to execution, you will play a key role in crafting innovative designs and implementing robust web development solutions.",
    requirements: ["4+ years web development", "React/JavaScript expertise", "UI/UX design skills", "WordPress proficiency"],
    applyUrl: "https://traffikboosters.com/job-apply-web-designer-developer/",
    salary: "$60,000 - $80,000",
    status: "active"
  },
  {
    id: 6,
    title: "Content Marketing Marketer",
    department: "Marketing",
    type: "Full Time",
    location: "Remote",
    postedDate: "2025-01-14",
    description: "We are seeking a skilled and innovative Content Marketing Marketer to join our dynamic marketing team. The ideal candidate will have a passion for creating compelling content, a deep understanding of content marketing strategies, and the ability to drive engagement across various platforms.",
    requirements: ["3+ years content marketing", "Writing and editing skills", "Content strategy development", "SEO knowledge"],
    applyUrl: "https://traffikboosters.com/job-apply-content-marketing-marketer/",
    salary: "$52,000 - $68,000",
    status: "active"
  },
  {
    id: 7,
    title: "Digital Strategist",
    department: "Strategy",
    type: "Full Time",
    location: "Remote",
    postedDate: "2025-01-15",
    description: "We are seeking a talented and experienced Digital Strategist to join our team. The ideal candidate will play a crucial role in developing and implementing digital marketing strategies to achieve our business objectives. The Digital Strategist will work closely with cross-functional teams to optimize online presence, drive engagement, and enhance overall digital performance.",
    requirements: ["5+ years digital marketing", "Strategic planning skills", "Data analysis expertise", "Team leadership experience"],
    applyUrl: "https://traffikboosters.com/job-apply-digital-strategist/",
    salary: "$70,000 - $90,000",
    status: "active"
  }
];

export function CareerManagement() {
  const [activeTab, setActiveTab] = useState("website-management");
  const [selectedJobPosting, setSelectedJobPosting] = useState<any>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState<any>(null);
  const [isEditingWebsiteJob, setIsEditingWebsiteJob] = useState(false);
  const [editingJobData, setEditingJobData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch live job postings from traffikboosters.com
  const { data: jobPostings = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["/api/career/website-jobs"],
  });

  // Fetch applications
  const { data: applications = [], isLoading: loadingApplications } = useQuery({
    queryKey: ["/api/career/applications"],
  });

  // Fetch interviews
  const { data: interviews = [], isLoading: loadingInterviews } = useQuery({
    queryKey: ["/api/career/interviews"],
  });

  // Create job posting mutation
  const createJobMutation = useMutation({
    mutationFn: (jobData: any) => apiRequest("POST", "/api/career/job-postings", jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career/job-postings"] });
      setShowCreateJob(false);
      toast({
        title: "Job Posted Successfully",
        description: "The job posting has been created and is now live",
      });
    },
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PUT", `/api/career/applications/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career/applications"] });
      toast({
        title: "Application Updated",
        description: "Application status has been updated",
      });
    },
  });

  // Website job management mutations
  const updateWebsiteJobMutation = useMutation({
    mutationFn: async (jobData: any) => 
      apiRequest("PUT", `/api/career/website-jobs/${jobData.id}`, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career/website-jobs"] });
      setIsEditingWebsiteJob(false);
      setEditingJobData(null);
      toast({
        title: "Website Job Updated",
        description: "Job posting has been updated on traffikboosters.com",
      });
    },
  });

  const deleteWebsiteJobMutation = useMutation({
    mutationFn: async (jobId: string) => 
      apiRequest("DELETE", `/api/career/website-jobs/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career/website-jobs"] });
      toast({
        title: "Website Job Deleted",
        description: "Job posting has been removed from traffikboosters.com",
      });
    },
  });

  const publishWebsiteJobMutation = useMutation({
    mutationFn: async (jobData: any) => 
      apiRequest("POST", "/api/career/website-jobs", jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career/website-jobs"] });
      toast({
        title: "Job Published",
        description: "New job posting has been published to traffikboosters.com",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800";
      case "screening": return "bg-yellow-100 text-yellow-800";
      case "interviewing": return "bg-purple-100 text-purple-800";
      case "offer_extended": return "bg-green-100 text-green-800";
      case "hired": return "bg-emerald-100 text-emerald-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatSalaryRange = (min?: number, max?: number) => {
    if (!min && !max) return "Salary: Competitive";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Competitive";
  };

  const JobPostingForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      department: "",
      location: "",
      employmentType: "Full-time",
      experienceLevel: "Mid",
      description: "",
      requirements: [""],
      responsibilities: [""],
      benefits: [""],
      salaryRangeMin: "",
      salaryRangeMax: "",
      compensationType: "Salary",
      skillsRequired: [""],
      skillsPreferred: [""],
      isRemote: false,
      isUrgentHiring: false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createJobMutation.mutate({
        ...formData,
        salaryRangeMin: formData.salaryRangeMin ? parseInt(formData.salaryRangeMin) : null,
        salaryRangeMax: formData.salaryRangeMax ? parseInt(formData.salaryRangeMax) : null,
        requirements: formData.requirements.filter(r => r.trim()),
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        benefits: formData.benefits.filter(b => b.trim()),
        skillsRequired: formData.skillsRequired.filter(s => s.trim()),
        skillsPreferred: formData.skillsPreferred.filter(s => s.trim())
      });
    };

    const addField = (field: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev as any)[field], ""]
      }));
    };

    const updateField = (field: string, index: number, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: (prev as any)[field].map((item: string, i: number) => i === index ? value : item)
      }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Senior Sales Representative"
              required
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Customer Service">Customer Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="On-site">On-site</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="employmentType">Employment Type</Label>
            <Select 
              value={formData.employmentType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <Select 
              value={formData.experienceLevel} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entry">Entry Level</SelectItem>
                <SelectItem value="Mid">Mid Level</SelectItem>
                <SelectItem value="Senior">Senior Level</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salaryMin">Minimum Salary ($)</Label>
            <Input
              id="salaryMin"
              type="number"
              value={formData.salaryRangeMin}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryRangeMin: e.target.value }))}
              placeholder="e.g., 50000"
            />
          </div>
          <div>
            <Label htmlFor="salaryMax">Maximum Salary ($)</Label>
            <Input
              id="salaryMax"
              type="number"
              value={formData.salaryRangeMax}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryRangeMax: e.target.value }))}
              placeholder="e.g., 75000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Job Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the role, responsibilities, and what makes this position exciting..."
            rows={4}
            required
          />
        </div>

        <div>
          <Label>Requirements</Label>
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={req}
                onChange={(e) => updateField('requirements', index, e.target.value)}
                placeholder="e.g., 3+ years sales experience"
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addField('requirements')}>
            Add Requirement
          </Button>
        </div>

        <div>
          <Label>Key Responsibilities</Label>
          {formData.responsibilities.map((resp, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={resp}
                onChange={(e) => updateField('responsibilities', index, e.target.value)}
                placeholder="e.g., Manage client relationships and drive revenue growth"
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addField('responsibilities')}>
            Add Responsibility
          </Button>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isRemote}
              onChange={(e) => setFormData(prev => ({ ...prev, isRemote: e.target.checked }))}
            />
            <span>Remote Work Available</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isUrgentHiring}
              onChange={(e) => setFormData(prev => ({ ...prev, isUrgentHiring: e.target.checked }))}
            />
            <span>Urgent Hiring</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowCreateJob(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createJobMutation.isPending}>
            {createJobMutation.isPending ? "Creating..." : "Create Job Posting"}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-16 w-auto crisp-edges" 
          />
          <div>
            <h1 className="text-3xl font-bold text-black">Career Management</h1>
            <p className="text-black font-medium">More Traffik! More Sales!</p>
          </div>
        </div>
        <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
            </DialogHeader>
            <JobPostingForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="website-management">Website Management</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="postings">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="website-management" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Traffik Boosters Career Page Management</h2>
            <p className="text-gray-600">Manage job postings directly on traffikboosters.com/career from STARZ</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Live Website Job Postings
                  </CardTitle>
                  <Button
                    onClick={() => {
                      setEditingJobData({
                        title: "",
                        department: "",
                        location: "Remote",
                        type: "Full-time",
                        description: "",
                        requirements: "",
                        salary: ""
                      });
                      setIsEditingWebsiteJob(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {jobPostings.map((job) => (
                    <Card key={job.id} className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                            <Badge variant="outline" className="mt-1">{job.type}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingJobData(job);
                                setIsEditingWebsiteJob(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteWebsiteJobMutation.mutate(job.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-700 mb-3">{job.description.substring(0, 120)}...</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-green-600">{job.salary}</span>
                          <Badge 
                            variant={job.status === "active" ? "default" : "secondary"}
                            className={job.status === "active" ? "bg-green-100 text-green-800" : ""}
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => window.open(`https://traffikboosters.com/career/#${job.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Website
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Website Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">7</div>
                    <div className="text-sm text-gray-600">Active Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-gray-600">Page Views (Today)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <div className="text-sm text-gray-600">Applications (Week)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">94%</div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobPostings.filter((job: any) => job.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  {jobPostings.filter((job: any) => job.department === 'Digital Marketing').length} digital marketing roles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.filter((app: JobApplication) => app.status === 'received').length}</div>
                <p className="text-xs text-muted-foreground">
                  {applications.filter((app: JobApplication) => app.applicationScore && app.applicationScore > 80).length} high-scoring candidates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {interviews.filter((interview: InterviewSchedule) => 
                    new Date(interview.scheduledDate) > new Date() && interview.status === 'scheduled'
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">Next 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.slice(0, 5).map((application: JobApplication) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{application.applicantName}</p>
                        <p className="text-sm text-muted-foreground">{application.applicantEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {application.applicationScore && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{application.applicationScore}/100</span>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowApplicationDetails(application)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="postings" className="space-y-6">
          <div className="grid gap-6">
            {jobPostings.map((job: any) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {job.title}
                        <Badge className="bg-blue-100 text-blue-800">{job.type}</Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Posted {job.postedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {job.status.toUpperCase()}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(job.requirements) ? job.requirements : job.requirements.split(', ')).map((requirement: string, index: number) => (
                        <Badge key={index} variant="outline">{requirement}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button 
                      onClick={() => window.open(job.applyUrl, '_blank')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply Now on Website
                    </Button>
                    <Badge className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid gap-4">
            {applications.map((application: JobApplication) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{application.applicantName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {application.applicantEmail}
                        </span>
                        {application.applicantPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {application.applicantPhone}
                          </span>
                        )}
                        {application.linkedinProfile && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            LinkedIn
                          </span>
                        )}
                      </div>
                      {application.yearsExperience && (
                        <p className="text-sm text-muted-foreground">
                          {application.yearsExperience} years of experience
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {application.applicationScore && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{application.applicationScore}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationMutation.mutate({ 
                              id: application.id, 
                              status: 'interviewing' 
                            })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationMutation.mutate({ 
                              id: application.id, 
                              status: 'rejected' 
                            })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <div className="grid gap-4">
            {interviews.map((interview: InterviewSchedule) => (
              <Card key={interview.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{interview.interviewType.replace('_', ' ').toUpperCase()}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(interview.scheduledDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {interview.duration} minutes
                        </span>
                      </div>
                      {interview.meetingLink && (
                        <p className="text-sm">
                          <a 
                            href={interview.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Join Meeting
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                        {interview.status.toUpperCase()}
                      </Badge>
                      {interview.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{interview.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Details Modal */}
      {showApplicationDetails && (
        <Dialog open={!!showApplicationDetails} onOpenChange={() => setShowApplicationDetails(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{showApplicationDetails.applicantName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p>{showApplicationDetails.applicantEmail}</p>
                </div>
              </div>
              {showApplicationDetails.coverLetter && (
                <div>
                  <Label>Cover Letter</Label>
                  <p className="text-sm text-muted-foreground border rounded p-3">
                    {showApplicationDetails.coverLetter}
                  </p>
                </div>
              )}
              {showApplicationDetails.resumeUrl && (
                <div>
                  <Label>Resume</Label>
                  <a 
                    href={showApplicationDetails.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Website Job Editing Dialog */}
      {isEditingWebsiteJob && editingJobData && (
        <Dialog open={isEditingWebsiteJob} onOpenChange={setIsEditingWebsiteJob}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingJobData.id ? 'Edit Website Job' : 'Add New Website Job'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={editingJobData.title}
                    onChange={(e) => setEditingJobData({ 
                      ...editingJobData, 
                      title: e.target.value 
                    })}
                    placeholder="e.g., Senior SEO Specialist"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={editingJobData.department}
                    onValueChange={(value) => setEditingJobData({ 
                      ...editingJobData, 
                      department: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={editingJobData.location}
                    onValueChange={(value) => setEditingJobData({ 
                      ...editingJobData, 
                      location: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Employment Type</Label>
                  <Select
                    value={editingJobData.type}
                    onValueChange={(value) => setEditingJobData({ 
                      ...editingJobData, 
                      type: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  value={editingJobData.salary}
                  onChange={(e) => setEditingJobData({ 
                    ...editingJobData, 
                    salary: e.target.value 
                  })}
                  placeholder="e.g., $60,000 - $80,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={editingJobData.description}
                  onChange={(e) => setEditingJobData({ 
                    ...editingJobData, 
                    description: e.target.value 
                  })}
                  placeholder="Describe the role, responsibilities, and what we're looking for..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  rows={4}
                  value={editingJobData.requirements}
                  onChange={(e) => setEditingJobData({ 
                    ...editingJobData, 
                    requirements: e.target.value 
                  })}
                  placeholder="List the required skills, experience, and qualifications..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingWebsiteJob(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (editingJobData.id) {
                      updateWebsiteJobMutation.mutate(editingJobData);
                    } else {
                      publishWebsiteJobMutation.mutate({
                        ...editingJobData,
                        id: `job_${Date.now()}`,
                        status: "active"
                      });
                    }
                  }}
                  disabled={!editingJobData.title || !editingJobData.description}
                >
                  {editingJobData.id ? 'Update Job' : 'Publish Job'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}