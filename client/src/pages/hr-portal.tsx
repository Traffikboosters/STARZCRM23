import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, DollarSign, Calendar, TrendingUp, Award, Building2, Phone, Mail, UserPlus, Trash2, Edit, Send } from 'lucide-react';
import UserInvitation from '@/components/user-invitation';

interface User {
  id: number;
  username: string;
  role: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  extension: string;
  compensationType: 'commission' | 'salary';
  baseSalary?: number;
  commissionRate?: number;
  bonusCommissionRate?: number;
  commissionTier?: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

export default function HRPortal() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCompensationType, setSelectedCompensationType] = useState<string>('all');
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'sales_rep',
    compensationType: 'commission',
    baseSalary: 0,
    commissionRate: 10,
    bonusCommissionRate: 0,
    commissionTier: 'standard',
    department: 'sales'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: (employeeData: any) => apiRequest('POST', '/api/users', employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAddEmployeeModalOpen(false);
      setNewEmployee({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'sales_rep',
        compensationType: 'commission',
        baseSalary: 0,
        commissionRate: 10,
        bonusCommissionRate: 0,
        commissionTier: 'standard',
        department: 'sales'
      });
      toast({
        title: "Employee Added",
        description: "New employee has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee.",
        variant: "destructive",
      });
    }
  });

  // Edit employee mutation
  const editEmployeeMutation = useMutation({
    mutationFn: (employeeData: any) => apiRequest('PUT', `/api/users/${employeeData.id}`, employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditEmployeeModalOpen(false);
      setEditingEmployee(null);
      toast({
        title: "Employee Updated",
        description: "Employee information has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee.",
        variant: "destructive",
      });
    }
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Employee Deleted",
        description: "Employee has been successfully removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee.",
        variant: "destructive",
      });
    }
  });

  // Filter employees (exclude admin users from HR Portal display)
  const nonAdminEmployees = employees.filter((emp: User) => emp.role !== 'admin');
  
  const filteredEmployees = nonAdminEmployees
    .filter((emp: User) => emp.role !== 'admin') // Remove admin users from HR Portal display
    .filter((emp: User) => {
      const departmentMatch = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const compensationMatch = selectedCompensationType === 'all' || emp.compensationType === selectedCompensationType;
      return departmentMatch && compensationMatch;
    });

  // HR Data calculations
  const hrData = {
    totalEmployees: nonAdminEmployees.length,
    salesReps: nonAdminEmployees.filter((emp: User) => emp.role === 'sales_rep').length,
    hrStaff: nonAdminEmployees.filter((emp: User) => emp.role === 'hr_staff').length,
    totalPayroll: nonAdminEmployees.reduce((sum: number, emp: User) => {
      return sum + (emp.compensationType === 'salary' ? (emp.baseSalary || 0) : 0);
    }, 0),
    avgSalary: nonAdminEmployees.length > 0 ? nonAdminEmployees.reduce((sum: number, emp: User) => 
      sum + (emp.compensationType === 'salary' ? (emp.baseSalary || 0) : 50000), 0) / nonAdminEmployees.length : 0,
    commissionPaid: nonAdminEmployees.filter((emp: User) => emp.compensationType === 'commission')
      .reduce((sum: number, emp: User) => {
        return sum + ((emp.commissionRate || 10) * 1000); // Estimated commission earnings
      }, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'sales_rep': 'Sales Rep',
      'hr_staff': 'HR Staff',
      'manager': 'Manager',
      'viewer': 'Viewer'
    };
    return roleMap[role] || role;
  };

  const getCompensationDisplay = (employee: User) => {
    if (employee.compensationType === 'commission') {
      return {
        type: 'Commission',
        amount: `${employee.commissionRate || 10}% + $${employee.bonusCommissionRate || 0} bonus`,
        badge: employee.commissionTier?.toUpperCase() || 'STANDARD',
        badgeColor: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        type: 'Salary',
        amount: formatCurrency(employee.baseSalary || 0),
        badge: 'SALARY',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Portal</h1>
            <p className="text-gray-600">Manage employee compensation and organizational structure</p>
          </div>
          <Button 
            onClick={() => setIsAddEmployeeModalOpen(true)}
            className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{hrData.totalEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(hrData.totalPayroll)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(hrData.avgSalary)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Commission Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(hrData.commissionPaid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="compensation">Compensation Type</Label>
                <Select value={selectedCompensationType} onValueChange={setSelectedCompensationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="salary">Salary-Based</SelectItem>
                    <SelectItem value="commission">Commission-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees">Employee Management</TabsTrigger>
            <TabsTrigger value="invitations">Send Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            {/* Employee List */}
            <div className="space-y-4">
              {filteredEmployees.map((employee) => {
                const compensation = getCompensationDisplay(employee);
                
                return (
                  <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback className="bg-[#e45c2b] text-white text-lg font-semibold">
                              {employee.firstName?.[0]}{employee.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </h3>
                              <Badge className={compensation.badgeColor}>
                                {compensation.badge}
                              </Badge>
                              <Badge variant="outline">
                                {getRoleDisplay(employee.role)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {employee.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {employee.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                Ext. {employee.extension}
                              </div>
                            </div>

                            <p className="text-xs text-gray-500">
                              Department: {employee.department?.charAt(0).toUpperCase() + employee.department?.slice(1)} • 
                              Joined: {new Date(employee.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">{compensation.type}</p>
                            <p className="text-lg font-bold text-gray-900">{compensation.amount}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setEditingEmployee(employee);
                                setIsEditEmployeeModalOpen(true);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredEmployees.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters or add a new employee.</p>
                    <Button 
                      onClick={() => setIsAddEmployeeModalOpen(true)}
                      className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-6">
            <UserInvitation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}