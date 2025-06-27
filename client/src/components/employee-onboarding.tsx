import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  Send, 
  Mail, 
  User, 
  Building, 
  Calendar, 
  FileText, 
  BookOpen,
  Shield,
  Users,
  Phone,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";
import type { User as UserType } from "@shared/schema";

const onboardingFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

export default function EmployeeOnboarding() {
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "sales_rep",
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const sendOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await apiRequest("POST", "/api/users/send-onboarding", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Onboarding Packet Sent",
        description: `Successfully sent to ${data.workEmail}`,
      });
      setIsOnboardingModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send onboarding packet",
        variant: "destructive",
      });
    },
  });

  const handleSendOnboarding = (data: OnboardingFormData) => {
    sendOnboardingMutation.mutate(data);
  };

  const sendOnboardingToEmployee = (employee: UserType) => {
    const onboardingData = {
      firstName: employee.firstName || "Employee",
      lastName: employee.lastName || "",
      email: employee.email || "",
      role: employee.role || "sales_rep",
      startDate: new Date().toISOString().split('T')[0],
    };
    sendOnboardingMutation.mutate(onboardingData);
  };

  const onboardingPacketContents = [
    {
      title: "Welcome Letter",
      description: "Personal welcome message with company mission and values",
      icon: Mail,
      priority: "High",
      color: "bg-red-100 text-red-800"
    },
    {
      title: "Company Policies",
      description: "Employee handbook, code of conduct, and procedures",
      icon: Shield,
      priority: "High", 
      color: "bg-red-100 text-red-800"
    },
    {
      title: "Starz CRM Guide",
      description: "Complete platform tutorial and access instructions",
      icon: BookOpen,
      priority: "High",
      color: "bg-red-100 text-red-800"
    },
    {
      title: "Sales Process",
      description: "Lead management, quotas, and commission structure",
      icon: Users,
      priority: "High",
      color: "bg-red-100 text-red-800"
    },
    {
      title: "Company Culture",
      description: "Team structure, values, and communication channels",
      icon: Building,
      priority: "Medium",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      title: "Emergency Contacts",
      description: "Important phone numbers and escalation procedures",
      icon: Phone,
      priority: "Medium",
      color: "bg-yellow-100 text-yellow-800"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Onboarding</h1>
            <p className="text-gray-600">Comprehensive onboarding packet management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="text-right">
            <p className="text-sm font-medium text-black">More Traffik! More Sales!</p>
            <p className="text-xs text-gray-600">Onboarding System</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Send New Packet</h3>
                <p className="text-gray-600">Create onboarding for new hire</p>
              </div>
              <Dialog open={isOnboardingModalOpen} onOpenChange={setIsOnboardingModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Send className="h-4 w-4 mr-2" />
                    Send Packet
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Active Employees</h3>
                <p className="text-gray-600">{employees.length} team members</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Packet Contents</h3>
                <p className="text-gray-600">{onboardingPacketContents.length} documents</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Packet Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Onboarding Packet Contents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onboardingPacketContents.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                    <IconComponent className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{item.title}</h4>
                      <Badge className={item.color}>{item.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Send Onboarding to Existing Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </span>
                  </div>
                  <Badge variant="secondary">{employee.role?.replace('_', ' ')}</Badge>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p>{employee.email}</p>
                  <p className="text-orange-600 font-medium">
                    {employee.firstName?.toLowerCase()}.{employee.lastName?.toLowerCase()}@traffikboosters.com
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => sendOnboardingToEmployee(employee)}
                  disabled={sendOnboardingMutation.isPending}
                >
                  <Send className="h-3 w-3 mr-2" />
                  Send Onboarding
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Onboarding Modal */}
      <Dialog open={isOnboardingModalOpen} onOpenChange={setIsOnboardingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Send Employee Onboarding Packet
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendOnboarding)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter personal email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sales_rep">Sales Representative</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Onboarding Packet Includes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Welcome letter with company mission and values</li>
                  <li>• Complete employee handbook and policies</li>
                  <li>• Starz CRM platform access and training guide</li>
                  <li>• Sales process documentation and procedures</li>
                  <li>• Company culture guide and team structure</li>
                  <li>• Emergency contacts and important resources</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOnboardingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={sendOnboardingMutation.isPending}
                >
                  {sendOnboardingMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Onboarding Packet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}