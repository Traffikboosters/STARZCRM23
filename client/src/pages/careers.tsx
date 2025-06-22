import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Users,
  Target,
  Award,
  Heart,
  Globe,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  coverLetter: z.string().min(1, "Cover letter is required"),
  linkedinUrl: z.string().url("Valid LinkedIn URL required").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Valid portfolio URL required").optional().or(z.literal("")),
  expectedSalary: z.string().optional(),
  startDate: z.string().min(1, "Available start date is required"),
});

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const { toast } = useToast();

  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/careers'],
  });

  const submitApplicationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/job-applications", data),
    onSuccess: () => {
      setIsApplicationOpen(false);
      applicationForm.reset();
      toast({
        title: "Application Submitted",
        description: "Thank you! We'll review your application and get back to you soon.",
      });
    },
  });

  const applicationForm = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      coverLetter: "",
      linkedinUrl: "",
      portfolioUrl: "",
      expectedSalary: "",
      startDate: "",
    },
  });

  const onSubmitApplication = (data: any) => {
    if (!selectedJob) return;
    
    const applicationData = {
      ...data,
      jobId: selectedJob.id,
    };
    submitApplicationMutation.mutate(applicationData);
  };

  const openApplication = (job: any) => {
    setSelectedJob(job);
    setIsApplicationOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <img 
              src={traffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-5xl font-bold text-black mb-4">
              Join Our Team
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Help businesses achieve <span className="font-bold text-[hsl(14,88%,55%)]">"More Traffik! More Sales!"</span> with innovative digital marketing solutions
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-[hsl(14,88%,55%)]" />
                <span className="text-gray-700">Growing Team</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-[hsl(14,88%,55%)]" />
                <span className="text-gray-700">Remote Friendly</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-[hsl(14,88%,55%)]" />
                <span className="text-gray-700">Results Driven</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Us Section */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-black mb-12">
            Why Choose Traffik Boosters?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:border-[hsl(14,88%,55%)] transition-colors">
              <CardHeader>
                <Award className="h-12 w-12 text-[hsl(14,88%,55%)] mx-auto mb-4" />
                <CardTitle>Industry Leadership</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Work with cutting-edge digital marketing strategies that deliver real results for businesses across industries.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-[hsl(14,88%,55%)] transition-colors">
              <CardHeader>
                <Heart className="h-12 w-12 text-[hsl(14,88%,55%)] mx-auto mb-4" />
                <CardTitle>Great Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Join a supportive team that values innovation, collaboration, and personal growth in a dynamic environment.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-[hsl(14,88%,55%)] transition-colors">
              <CardHeader>
                <Target className="h-12 w-12 text-[hsl(14,88%,55%)] mx-auto mb-4" />
                <CardTitle>Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advance your career with professional development, training programs, and leadership opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-black mb-12">
            Open Positions
          </h2>
          
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Open Positions</h3>
              <p className="text-gray-500">
                We're not actively hiring right now, but we'd love to hear from you! 
                Send us your resume at careers@traffikboosters.com
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {jobs.map((job: any) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-[hsl(14,88%,55%)]">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl text-black mb-2">{job.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2" />
                            {job.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {job.employmentType}
                          </div>
                          {job.salary && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              {job.salary}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={() => openApplication(job)}
                        className="bg-[hsl(14,88%,55%)] hover:bg-[hsl(14,88%,45%)] text-white px-8"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-6 leading-relaxed">{job.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-black mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-[hsl(14,88%,55%)]" />
                          Requirements
                        </h4>
                        <ul className="space-y-2">
                          {job.requirements?.map((req: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-[hsl(14,88%,55%)] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-600">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-black mb-3 flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-[hsl(14,88%,55%)]" />
                          Benefits & Perks
                        </h4>
                        <ul className="space-y-2">
                          {job.benefits?.map((benefit: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-[hsl(14,88%,55%)] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-600">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <p className="text-muted-foreground">
              Please fill out the application form below. We'll review your application and get back to you soon.
            </p>
          </DialogHeader>
          
          <Form {...applicationForm}>
            <form onSubmit={applicationForm.handleSubmit(onSubmitApplication)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={applicationForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={applicationForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={applicationForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john.doe@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={applicationForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={applicationForm.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={6} 
                        placeholder="Tell us why you're interested in this position and what makes you a great fit for our team..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={applicationForm.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://linkedin.com/in/yourprofile" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={applicationForm.control}
                  name="portfolioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio/Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://yourportfolio.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={applicationForm.control}
                  name="expectedSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Salary</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="$65,000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={applicationForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Start Date *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="2 weeks notice" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsApplicationOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitApplicationMutation.isPending}
                  className="bg-[hsl(14,88%,55%)] hover:bg-[hsl(14,88%,45%)]"
                >
                  {submitApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 mx-auto mb-4 filter brightness-0 invert"
          />
          <p className="text-gray-400 mb-4">
            Join us in helping businesses achieve more traffic and more sales
          </p>
          <p className="text-sm text-gray-500">
            © 2025 Traffik Boosters. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}