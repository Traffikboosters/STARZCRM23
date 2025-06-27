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
import { Users, DollarSign, Calendar, TrendingUp, Award, Building2, Phone, Mail, UserPlus, Trash2, Edit } from 'lucide-react';

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
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'sales_rep',
    compensationType: 'commission',
    baseSalary: 0,
    commissionRate: 10.0,
    department: 'sales',
    extension: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch users from API
  const { data: employees = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const response = await apiRequest('POST', '/api/users', employeeData);
      return response.json();
    },
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
        commissionRate: 10.0,
        department: 'sales',
        extension: ''
      });
    }
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

  // Calculate HR metrics from actual data
  const hrData = {
    totalEmployees: employees.length,
    salesReps: employees.filter((emp: User) => emp.role === 'sales_rep').length,
    hrStaff: employees.filter((emp: User) => emp.department === 'hr').length,
    admins: employees.filter((emp: User) => emp.role === 'admin').length,
    totalPayroll: employees.reduce((sum: number, emp: User) => {
      if (emp.compensationType === 'salary') {
        return sum + (emp.baseSalary || 0);
      } else {
        return sum + 60000; // Estimated annual commission earnings
      }
    }, 0),
    avgSalary: employees.length > 0 ? employees.reduce((sum: number, emp: User) => 
      sum + (emp.baseSalary || 60000), 0) / employees.length : 0,
    commissionPaid: employees.filter((emp: User) => emp.compensationType === 'commission')
      .reduce((sum: number, emp: User) => {
        const rate = typeof emp.commissionRate === 'string' ? parseFloat(emp.commissionRate) : (emp.commissionRate || 10);
        return sum + (rate * 500);
      }, 0)
  };

  const mockEmployees: User[] = [
    {
      id: 1,
      username: "admin",
      role: "admin",
      email: "michael.thompson@traffikboosters.com",
      phone: "(877) 840-6250",
      firstName: "Michael",
      lastName: "Thompson",
      extension: "101",
      compensationType: "salary",
      baseSalary: 85000,
      department: "admin",
      isActive: true,
      createdAt: "2025-01-15T09:00:00Z",
    },
    {
      id: 2,
      username: "sarah.johnson",
      role: "sales_rep",
      email: "sarah.johnson@traffikboosters.com",
      phone: "(312) 555-0198",
      firstName: "Sarah",
      lastName: "Johnson",
      extension: "201",
      compensationType: "commission",
      commissionRate: 10.0,
      bonusCommissionRate: 2.6,
      commissionTier: "gold",
      department: "sales",
      isActive: true,
      createdAt: "2025-02-01T09:00:00Z",
    },
    {
      id: 3,
      username: "david.chen",
      role: "sales_rep",
      email: "david.chen@traffikboosters.com",
      phone: "(415) 555-0167",
      firstName: "David",
      lastName: "Chen",
      extension: "202",
      compensationType: "commission",
      commissionRate: 10.0,
      bonusCommissionRate: 1.2,
      commissionTier: "silver",
      department: "sales",
      isActive: true,
      createdAt: "2025-02-15T09:00:00Z",
    },
    {
      id: 4,
      username: "jennifer.martinez",
      role: "hr_staff",
      email: "jennifer.martinez@traffikboosters.com",
      phone: "(213) 555-0143",
      firstName: "Jennifer",
      lastName: "Martinez",
      extension: "301",
      compensationType: "salary",
      baseSalary: 65000,
      department: "hr",
      isActive: true,
      createdAt: "2025-01-20T09:00:00Z",
    },
    {
      id: 5,
      username: "robert.williams",
      role: "hr_staff",
      email: "robert.williams@traffikboosters.com",
      phone: "(404) 555-0189",
      firstName: "Robert",
      lastName: "Williams",
      extension: "302",
      compensationType: "salary",
      baseSalary: 58000,
      department: "hr",
      isActive: true,
      createdAt: "2025-03-01T09:00:00Z",
    },
  ];

  const filteredEmployees = employees.filter((emp: User) => {
    const departmentMatch = selectedDepartment === 'all' || emp.department === selectedDepartment;
    const compensationMatch = selectedCompensationType === 'all' || emp.compensationType === selectedCompensationType;
    return departmentMatch && compensationMatch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCompensationDisplay = (employee: User) => {
    if (employee.compensationType === 'salary') {
      return {
        primary: formatCurrency(employee.baseSalary || 0),
        secondary: 'Annual Salary',
        badge: 'Salary',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    } else {
      const baseRate = typeof employee.commissionRate === 'string' ? parseFloat(employee.commissionRate) : (employee.commissionRate || 0);
      const bonusRate = typeof employee.bonusCommissionRate === 'string' ? parseFloat(employee.bonusCommissionRate) : (employee.bonusCommissionRate || 0);
      const totalRate = baseRate + bonusRate;
      return {
        primary: `${totalRate}%`,
        secondary: `Base: ${baseRate}% + Bonus: ${bonusRate}%`,
        badge: `${employee.commissionTier?.charAt(0).toUpperCase()}${employee.commissionTier?.slice(1)} Tier`,
        badgeColor: employee.commissionTier === 'gold' ? 'bg-yellow-100 text-yellow-800' : 
                   employee.commissionTier === 'silver' ? 'bg-gray-100 text-gray-800' : 
                   'bg-green-100 text-green-800'
      };
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrator',
      'sales_rep': 'Sales Representative',
      'hr_staff': 'HR Staff',
      'manager': 'Manager',
      'viewer': 'Viewer'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
                        <p className="text-2xl font-bold text-[#e45c2b]">{compensation.primary}</p>
                        <p className="text-sm text-gray-600">{compensation.secondary}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Edit employee functionality can be added later
                            toast({
                              title: "Edit Employee",
                              description: "Edit functionality coming soon",
                            });
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
                              deleteEmployeeMutation.mutate(employee.id);
                              toast({
                                title: "Employee Deleted",
                                description: `${employee.firstName} ${employee.lastName} has been removed from the system`,
                              });
                            }
                          }}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                          disabled={deleteEmployeeMutation.isPending}
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
        </div>

        {filteredEmployees.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more employees.</p>
            </CardContent>
          </Card>
        )}

        {/* Add Employee Modal */}
        <Dialog open={isAddEmployeeModalOpen} onOpenChange={setIsAddEmployeeModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee account with compensation details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="john.doe@traffikboosters.com"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                  placeholder="jdoe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="extension">Extension</Label>
                  <Input
                    id="extension"
                    value={newEmployee.extension}
                    onChange={(e) => setNewEmployee({...newEmployee, extension: e.target.value})}
                    placeholder="101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="sales_rep">Sales Representative</SelectItem>
                      <SelectItem value="hr_staff">HR Staff</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="compensationType">Compensation Type</Label>
                <Select value={newEmployee.compensationType} onValueChange={(value) => setNewEmployee({...newEmployee, compensationType: value as 'commission' | 'salary'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commission">Commission-Based</SelectItem>
                    <SelectItem value="salary">Salary-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newEmployee.compensationType === 'salary' ? (
                <div>
                  <Label htmlFor="baseSalary">Annual Salary</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={newEmployee.baseSalary}
                    onChange={(e) => setNewEmployee({...newEmployee, baseSalary: parseInt(e.target.value) || 0})}
                    placeholder="50000"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    value={newEmployee.commissionRate}
                    onChange={(e) => setNewEmployee({...newEmployee, commissionRate: parseFloat(e.target.value) || 10})}
                    placeholder="10"
                    step="0.1"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    addEmployeeMutation.mutate({
                      ...newEmployee,
                      password: 'temppass123',
                      isActive: true
                    });
                  }}
                  disabled={addEmployeeMutation.isPending || !newEmployee.firstName || !newEmployee.lastName || !newEmployee.email}
                  className="flex-1 bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
                >
                  {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}