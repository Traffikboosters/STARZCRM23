import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Play, Pause, Download, Trash2, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { insertScrapingJobSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { ScrapingJob } from "@shared/schema";

const scrapingJobFormSchema = insertScrapingJobSchema.extend({
  selectors: z.string().optional(),
});

type ScrapingJobFormData = z.infer<typeof scrapingJobFormSchema>;

export default function DataScrapingView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ScrapingJob | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scrapingJobs = [], isLoading } = useQuery<ScrapingJob[]>({
    queryKey: ['/api/scraping-jobs'],
  });

  const form = useForm<ScrapingJobFormData>({
    resolver: zodResolver(scrapingJobFormSchema),
    defaultValues: {
      name: "",
      url: "",
      selectors: "",
      schedule: "",
      status: "pending",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: ScrapingJobFormData) => {
      const jobData = {
        ...data,
        selectors: data.selectors ? JSON.parse(data.selectors) : {},
      };
      
      const response = await apiRequest("POST", "/api/scraping-jobs", jobData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-jobs'] });
      toast({
        title: "Scraping job created",
        description: "Your scraping job has been successfully created.",
      });
      setIsCreateModalOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create scraping job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "running":
        return <Play className="h-4 w-4 text-brand-primary" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-error" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-neutral-medium" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const onSubmit = (data: ScrapingJobFormData) => {
    createJobMutation.mutate(data);
  };

  const exportResults = (job: ScrapingJob) => {
    if (!job.results) {
      toast({
        title: "No data to export",
        description: "This job has no results to export yet.",
        variant: "destructive",
      });
      return;
    }

    const dataStr = JSON.stringify(job.results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${job.name}-results.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-lighter px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-neutral-dark">Data Scraping</h2>
            <Badge variant="secondary" className="text-xs">
              {scrapingJobs.length} jobs
            </Badge>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-primary text-white hover:bg-brand-secondary">
                <Plus className="h-4 w-4 mr-2" />
                New Scraping Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Scraping Job</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="selectors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CSS Selectors (JSON format)</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={4} 
                            placeholder='{"title": "h1", "price": ".price", "description": ".description"}'
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule (Cron Expression)</FormLabel>
                        <FormControl>
                          <Input placeholder="0 0 * * * (daily at midnight)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-brand-primary text-white hover:bg-brand-secondary"
                      disabled={createJobMutation.isPending}
                    >
                      {createJobMutation.isPending ? "Creating..." : "Create Job"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-neutral-lightest p-6 overflow-auto">
        {scrapingJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-white" />
            </div>
            <p className="text-neutral-medium text-lg mb-4">No scraping jobs yet</p>
            <Button 
              className="bg-brand-primary text-white hover:bg-brand-secondary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Job Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scrapingJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-neutral-dark">{job.name}</CardTitle>
                        <p className="text-sm text-neutral-medium mt-1">{job.url}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(job.status || "pending")}
                        <Badge className={getStatusColor(job.status || "pending")}>
                          {job.status || "pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {job.schedule && (
                        <div className="flex items-center space-x-2 text-sm text-neutral-medium">
                          <Clock className="h-4 w-4" />
                          <span>{job.schedule}</span>
                        </div>
                      )}
                      
                      {job.lastRun && (
                        <div className="text-sm text-neutral-medium">
                          Last run: {format(new Date(job.lastRun), "MMM d, yyyy h:mm a")}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Run
                        </Button>
                        
                        {job.results && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportResults(job)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedJob(job)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Results Table */}
            {selectedJob && selectedJob.results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-neutral-dark">
                    Results for "{selectedJob.name}"
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(selectedJob.results as Record<string, any>).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{key}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </TableCell>
                            <TableCell>{typeof value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
