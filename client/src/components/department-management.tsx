import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus, 
  Building2, 
  TrendingUp, 
  Phone, 
  Mail, 
  Target,
  BarChart3,
  Settings,
  Award,
  DollarSign,
  Calendar,
  FileText,
  MessageSquare,
  Megaphone,
  Heart,
  Cog
} from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";
import { DepartmentSpecificFeatures } from "@/components/department-specific-features";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  workEmail: string;
  phone: string;
  role: string;
  department: string;
  compensationType: string;
  commissionRate: string;
  baseSalary: number;
  commissionTier: string;
  isActive: boolean;
}

interface DepartmentStats {
  totalEmployees: number;
  activeEmployees: number;
  averagePerformance: number;
  monthlyBudget: number;
  departmentGoals: string[];
}

export function DepartmentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDepartment, setSelectedDepartment] = useState("sales");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const departments = [
    {
      id: "sales",
      name: "Sales Department",
      icon: TrendingUp,
      color: "bg-green-500",
      description: "Lead generation, customer acquisition, and revenue growth",
      employees: (users as User[]).filter((user: User) => user.department === "sales"),
      goals: ["Generate 500+ leads monthly", "Achieve 25% conversion rate", "Maintain $50K monthly revenue"]
    },
    {
      id: "marketing",
      name: "Marketing Department", 
      icon: Megaphone,
      color: "bg-blue-500",
      description: "Brand awareness, digital campaigns, and lead nurturing",
      employees: (users as User[]).filter((user: User) => user.department === "marketing"),
      goals: ["Increase brand visibility by 40%", "Launch 10 campaigns monthly", "Generate 1000+ qualified leads"]
    },
    {
      id: "hr",
      name: "HR Department",
      icon: Heart,
      color: "bg-purple-500", 
      description: "Employee management, recruitment, and organizational development",
      employees: (users as User[]).filter((user: User) => user.department === "hr"),
      goals: ["Maintain 95% employee satisfaction", "Reduce turnover to <5%", "Complete quarterly reviews"]
    },
    {
      id: "operations",
      name: "Operations Department",
      icon: Cog,
      color: "bg-orange-500",
      description: "Process optimization, quality assurance, and operational efficiency",
      employees: (users as User[]).filter((user: User) => user.department === "operations"),
      goals: ["Achieve 99% uptime", "Reduce response time by 30%", "Implement 5 process improvements"]
    }
  ];

  const currentDepartment = departments.find(dept => dept.id === selectedDepartment);

  const getDepartmentStats = (deptId: string): DepartmentStats => {
    const deptEmployees = (users as User[]).filter((user: User) => user.department === deptId);
    const activeEmployees = deptEmployees.filter((user: User) => user.isActive);
    
    const budgetMap = {
      sales: 75000,
      marketing: 50000,
      hr: 40000,
      operations: 60000
    };

    return {
      totalEmployees: deptEmployees.length,
      activeEmployees: activeEmployees.length,
      averagePerformance: Math.floor(Math.random() * 15) + 85, // 85-100%
      monthlyBudget: budgetMap[deptId as keyof typeof budgetMap] || 50000,
      departmentGoals: currentDepartment?.goals || []
    };
  };

  const reassignUserMutation = useMutation({
    mutationFn: async ({ userId, newDepartment }: { userId: number; newDepartment: string }) => {
      return apiRequest("PATCH", `/api/users/${userId}`, { department: newDepartment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Department Updated",
        description: "Employee has been reassigned to new department.",
      });
    },
  });

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const DepartmentCard = ({ department }: { department: any }) => {
    const stats = getDepartmentStats(department.id);
    const Icon = department.icon;

    return (
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2" 
            onClick={() => setSelectedDepartment(department.id)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${department.color} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{department.name}</CardTitle>
                <CardDescription className="text-sm">{stats.totalEmployees} employees</CardDescription>
              </div>
            </div>
            <Badge variant={selectedDepartment === department.id ? "default" : "outline"}>
              {selectedDepartment === department.id ? "Active" : "View"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-3">{department.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Active: </span>
              <span className="text-green-600">{stats.activeEmployees}</span>
            </div>
            <div>
              <span className="font-medium">Performance: </span>
              <span className="text-blue-600">{stats.averagePerformance}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmployeeCard = ({ employee }: { employee: User }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-semibold">{employee.firstName} {employee.lastName}</h4>
              <p className="text-sm text-gray-600">{employee.role}</p>
            </div>
          </div>
          <Badge variant={employee.isActive ? "default" : "secondary"}>
            {employee.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{employee.workEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{employee.phone}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            {employee.compensationType === "commission" ? (
              <span className="text-green-600">
                Commission: {employee.commissionRate}% ({employee.commissionTier})
              </span>
            ) : (
              <span className="text-blue-600">
                Salary: {formatSalary(employee.baseSalary)}
              </span>
            )}
          </div>
          <select 
            value={employee.department}
            onChange={(e) => reassignUserMutation.mutate({ 
              userId: employee.id, 
              newDepartment: e.target.value 
            })}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="hr">HR</option>
            <option value="operations">Operations</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );

  const DepartmentOverview = () => {
    const stats = getDepartmentStats(selectedDepartment);
    
    return (
      <div className="space-y-6">
        {/* Department Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={traffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="h-16 w-auto object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div>
              <h2 className="text-2xl font-bold">{currentDepartment?.name}</h2>
              <p className="text-gray-600">{currentDepartment?.description}</p>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Department Settings
          </Button>
        </div>

        {/* Department Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                  <p className="text-sm text-gray-600">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeEmployees}</p>
                  <p className="text-sm text-gray-600">Active Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.averagePerformance}%</p>
                  <p className="text-sm text-gray-600">Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{formatSalary(stats.monthlyBudget)}</p>
                  <p className="text-sm text-gray-600">Monthly Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department-Specific Features */}
        <DepartmentSpecificFeatures 
          department={selectedDepartment} 
          employees={currentDepartment?.employees || []} 
        />

        {/* Department Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Department Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.departmentGoals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Department Members</CardTitle>
            <CardDescription>
              Manage employees in the {currentDepartment?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentDepartment?.employees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No employees in this department yet</p>
                <Button className="mt-4" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentDepartment?.employees.map((employee: User) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-20 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <h1 className="text-3xl font-bold">Department Management</h1>
            <p className="text-gray-600">Manage all departments and employees</p>
          </div>
        </div>
      </div>

      <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="hr" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            HR
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <DepartmentOverview />
        </TabsContent>
        
        <TabsContent value="marketing">
          <DepartmentOverview />
        </TabsContent>
        
        <TabsContent value="hr">
          <DepartmentOverview />
        </TabsContent>
        
        <TabsContent value="operations">
          <DepartmentOverview />
        </TabsContent>
      </Tabs>

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((department) => (
          <DepartmentCard key={department.id} department={department} />
        ))}
      </div>
    </div>
  );
}