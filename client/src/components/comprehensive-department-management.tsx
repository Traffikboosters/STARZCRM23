import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Building2, 
  UserCircle, 
  BarChart3, 
  Settings,
  Trophy,
  Mail,
  Phone,
  Calendar,
  FileText,
  Zap,
  Shield,
  Briefcase,
  HeadphonesIcon
} from "lucide-react";
import type { User } from "@shared/schema";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface DepartmentStats {
  totalEmployees: number;
  activeProjects: number;
  monthlyBudget: number;
  performance: number;
  efficiency: string;
}

interface DepartmentEmployee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  performance: number;
  currentProjects: string[];
  monthlyTarget?: number;
  commission?: number;
  salary?: number;
  lastActive: string;
  status: 'active' | 'offline' | 'busy' | 'away';
}

export default function ComprehensiveDepartmentManagement() {
  const [selectedDepartment, setSelectedDepartment] = useState("sales");
  const [selectedEmployee, setSelectedEmployee] = useState<DepartmentEmployee | null>(null);
  const [reassignmentTarget, setReassignmentTarget] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Department configurations
  const departments = {
    sales: {
      name: "Sales Department",
      icon: <Target className="h-5 w-5" />,
      color: "orange",
      description: "Lead conversion and customer acquisition"
    },
    marketing: {
      name: "Marketing Department", 
      icon: <TrendingUp className="h-5 w-5" />,
      color: "blue",
      description: "Brand promotion and lead generation"
    },
    hr: {
      name: "HR Department",
      icon: <Users className="h-5 w-5" />,
      color: "green", 
      description: "Human resources and employee management"
    },
    operations: {
      name: "Operations Department",
      icon: <Settings className="h-5 w-5" />,
      color: "purple",
      description: "Business operations and system management"
    }
  };

  // Mock department data - would come from API in real implementation
  const departmentStats: Record<string, DepartmentStats> = {
    sales: {
      totalEmployees: 4,
      activeProjects: 23,
      monthlyBudget: 45000,
      performance: 92,
      efficiency: "High"
    },
    marketing: {
      totalEmployees: 3,
      activeProjects: 12,
      monthlyBudget: 35000,
      performance: 88,
      efficiency: "High"
    },
    hr: {
      totalEmployees: 2,
      activeProjects: 8,
      monthlyBudget: 25000,
      performance: 95,
      efficiency: "Excellent"
    },
    operations: {
      totalEmployees: 3,
      activeProjects: 15,
      monthlyBudget: 40000,
      performance: 90,
      efficiency: "High"
    }
  };

  const departmentEmployees: Record<string, DepartmentEmployee[]> = {
    sales: [
      {
        id: 1,
        name: "Michael Thompson",
        email: "michael.thompson@traffikboosters.com",
        role: "Sales Manager",
        department: "Sales",
        performance: 95,
        currentProjects: ["Enterprise Clients", "High-Value Prospects", "Lead Qualification"],
        monthlyTarget: 15000,
        commission: 12,
        lastActive: "2 mins ago",
        status: "active"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@traffikboosters.com",
        role: "Senior Sales Rep",
        department: "Sales",
        performance: 88,
        currentProjects: ["SMB Outreach", "Follow-up Campaigns"],
        monthlyTarget: 12000,
        commission: 10,
        lastActive: "5 mins ago",
        status: "active"
      },
      {
        id: 3,
        name: "David Chen",
        email: "david.chen@traffikboosters.com",
        role: "Sales Representative",
        department: "Sales",
        performance: 82,
        currentProjects: ["Lead Nurturing", "Cold Outreach"],
        monthlyTarget: 10000,
        commission: 8,
        lastActive: "1 hour ago",
        status: "busy"
      },
      {
        id: 4,
        name: "Amanda Davis",
        email: "amanda.davis@traffikboosters.com",
        role: "Inside Sales Rep",
        department: "Sales",
        performance: 79,
        currentProjects: ["Inbound Leads", "Phone Campaigns"],
        monthlyTarget: 8000,
        commission: 7,
        lastActive: "15 mins ago",
        status: "active"
      }
    ],
    marketing: [
      {
        id: 5,
        name: "Jennifer Martinez",
        email: "jennifer.martinez@traffikboosters.com",
        role: "Marketing Manager",
        department: "Marketing",
        performance: 92,
        currentProjects: ["Brand Strategy", "Campaign Analytics", "Content Planning"],
        salary: 65000,
        lastActive: "3 mins ago",
        status: "active"
      },
      {
        id: 6,
        name: "Robert Wilson",
        email: "robert.wilson@traffikboosters.com",
        role: "Digital Marketing Specialist",
        department: "Marketing",
        performance: 85,
        currentProjects: ["SEO Campaigns", "PPC Management"],
        salary: 55000,
        lastActive: "10 mins ago",
        status: "active"
      },
      {
        id: 7,
        name: "Lisa Brown",
        email: "lisa.brown@traffikboosters.com",
        role: "Content Marketing Specialist",
        department: "Marketing",
        performance: 87,
        currentProjects: ["Content Creation", "Social Media"],
        salary: 52000,
        lastActive: "2 hours ago",
        status: "away"
      }
    ],
    hr: [
      {
        id: 8,
        name: "Patricia Johnson",
        email: "patricia.johnson@traffikboosters.com",
        role: "HR Manager",
        department: "HR",
        performance: 96,
        currentProjects: ["Employee Onboarding", "Performance Reviews", "Benefits Administration"],
        salary: 70000,
        lastActive: "1 min ago",
        status: "active"
      },
      {
        id: 9,
        name: "Thomas Anderson",
        email: "thomas.anderson@traffikboosters.com",
        role: "HR Specialist",
        department: "HR",
        performance: 94,
        currentProjects: ["Recruitment", "Training Programs"],
        salary: 58000,
        lastActive: "20 mins ago",
        status: "active"
      }
    ],
    operations: [
      {
        id: 10,
        name: "Kevin Murphy",
        email: "kevin.murphy@traffikboosters.com",
        role: "Operations Manager",
        department: "Operations",
        performance: 93,
        currentProjects: ["System Integration", "Process Optimization", "Quality Assurance"],
        salary: 75000,
        lastActive: "5 mins ago",
        status: "active"
      },
      {
        id: 11,
        name: "Michelle Taylor",
        email: "michelle.taylor@traffikboosters.com",
        role: "Business Analyst",
        department: "Operations",
        performance: 89,
        currentProjects: ["Data Analysis", "Reporting"],
        salary: 62000,
        lastActive: "30 mins ago",
        status: "busy"
      },
      {
        id: 12,
        name: "James Rodriguez",
        email: "james.rodriguez@traffikboosters.com",
        role: "Technical Operations Specialist",
        department: "Operations",
        performance: 88,
        currentProjects: ["System Maintenance", "Technical Support"],
        salary: 58000,
        lastActive: "1 hour ago",
        status: "offline"
      }
    ]
  };

  const currentStats = departmentStats[selectedDepartment];
  const currentEmployees = departmentEmployees[selectedDepartment];
  const currentDept = departments[selectedDepartment as keyof typeof departments];

  const reassignEmployee = async (employeeId: number, newDepartment: string) => {
    try {
      await apiRequest('PUT', `/api/employees/${employeeId}/department`, {
        department: newDepartment
      });
      
      toast({
        title: "Employee Reassigned",
        description: `Employee has been moved to ${departments[newDepartment as keyof typeof departments].name}`,
        className: "bg-green-50 border-green-200 text-green-800"
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    } catch (error) {
      toast({
        title: "Reassignment Failed",
        description: "Unable to reassign employee. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'away': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-blue-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-16 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600">Manage teams, assignments, and performance across all departments</p>
            <p className="text-sm font-bold text-black">More Traffik! More Sales!</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {Object.values(departmentStats).reduce((sum, dept) => sum + dept.totalEmployees, 0)} Total Employees
        </Badge>
      </div>

      {/* Department Selector */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(departments).map(([key, dept]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDepartment === key ? `border-${dept.color}-500 bg-${dept.color}-50` : ''
            }`}
            onClick={() => setSelectedDepartment(key)}
          >
            <CardContent className="p-4 text-center">
              <div className={`flex justify-center mb-2 text-${dept.color}-600`}>
                {dept.icon}
              </div>
              <h3 className="font-semibold text-sm">{dept.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{departmentStats[key].totalEmployees} employees</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Overview */}
      <Card className={`border-l-4 border-l-${currentDept.color}-500`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentDept.icon}
            {currentDept.name}
          </CardTitle>
          <p className="text-gray-600">{currentDept.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-800">{currentStats.totalEmployees}</p>
              <p className="text-sm text-blue-600">Employees</p>
            </div>
            <div className="text-center">
              <Briefcase className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-800">{currentStats.activeProjects}</p>
              <p className="text-sm text-green-600">Active Projects</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-800">${(currentStats.monthlyBudget / 1000).toFixed(0)}K</p>
              <p className="text-sm text-purple-600">Monthly Budget</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-800">{currentStats.performance}%</p>
              <p className="text-sm text-orange-600">Performance</p>
            </div>
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold text-yellow-800">{currentStats.efficiency}</p>
              <p className="text-sm text-yellow-600">Efficiency</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Team Members
            </CardTitle>
            <Select value={reassignmentTarget} onValueChange={setReassignmentTarget}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Reassign to department..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(departments)
                  .filter(([key]) => key !== selectedDepartment)
                  .map(([key, dept]) => (
                    <SelectItem key={key} value={key}>
                      {dept.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentEmployees.map((employee) => (
              <div key={employee.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <UserCircle className="h-10 w-10 text-gray-600" />
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.role}</p>
                      <p className="text-xs text-gray-500">{employee.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{employee.lastActive}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className={`text-lg font-bold ${getPerformanceColor(employee.performance)}`}>
                        {employee.performance}%
                      </p>
                      <p className="text-xs text-gray-600">Performance</p>
                    </div>
                    
                    {selectedDepartment === 'sales' && employee.commission && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{employee.commission}%</p>
                        <p className="text-xs text-gray-600">Commission</p>
                      </div>
                    )}
                    
                    {(selectedDepartment !== 'sales' || !employee.commission) && employee.salary && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">${(employee.salary / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-600">Salary</p>
                      </div>
                    )}
                    
                    {reassignmentTarget && (
                      <Button
                        size="sm"
                        onClick={() => reassignEmployee(employee.id, reassignmentTarget)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Reassign
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Current Projects:</p>
                  <div className="flex flex-wrap gap-1">
                    {employee.currentProjects.map((project, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {selectedDepartment === 'sales' && employee.monthlyTarget && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <p className="text-sm text-green-800">
                      Monthly Target: <span className="font-semibold">${employee.monthlyTarget.toLocaleString()}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department-Specific Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Department Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {selectedDepartment === 'sales' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <Target className="h-6 w-6 mb-2" />
                  <span>Sales Pipeline</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Phone className="h-6 w-6 mb-2" />
                  <span>Call Management</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Trophy className="h-6 w-6 mb-2" />
                  <span>Performance Tracking</span>
                </Button>
              </>
            )}
            
            {selectedDepartment === 'marketing' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Campaign Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Mail className="h-6 w-6 mb-2" />
                  <span>Email Marketing</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>Lead Generation</span>
                </Button>
              </>
            )}
            
            {selectedDepartment === 'hr' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Employee Management</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Onboarding</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Compliance</span>
                </Button>
              </>
            )}
            
            {selectedDepartment === 'operations' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  <span>System Management</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <HeadphonesIcon className="h-6 w-6 mb-2" />
                  <span>Support</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}