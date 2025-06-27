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

  // Edit employee mutation
  const editEmployeeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<User>) => {
      const response = await apiRequest('PUT', `/api/users/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditEmployeeModalOpen(false);
      setEditingEmployee(null);
      toast({
        title: "Employee Updated",
        description: "Employee information has been successfully updated",
      });
    }
  });

  // Calculate HR metrics from filtered employee data (excluding admins)
  const nonAdminEmployees = employees.filter((emp: User) => emp.role !== 'admin');
  const hrData = {
    totalEmployees: nonAdminEmployees.length,
    salesReps: nonAdminEmployees.filter((emp: User) => emp.role === 'sales_rep').length,
    hrStaff: nonAdminEmployees.filter((emp: User) => emp.role === 'hr_staff').length,
    totalPayroll: nonAdminEmployees.reduce((sum: number, emp: User) => {
      if (emp.compensationType === 'salary') {
        return sum + (emp.baseSalary || 0);
      } else {
        return sum + 60000; // Estimated annual commission earnings
      }
    }, 0),
    avgSalary: nonAdminEmployees.length > 0 ? nonAdminEmployees.reduce((sum: number, emp: User) => 
      sum + (emp.baseSalary || 60000), 0) / nonAdminEmployees.length : 0,
    commissionPaid: nonAdminEmployees.filter((emp: User) => emp.compensationType === 'commission')
      .reduce((sum: number, emp: User) => {
        const rate = typeof emp.commissionRate === 'string' ? parseFloat(emp.commissionRate) : (emp.commissionRate || 10);
        return sum + (rate * 500);
      }, 0)
  };

  // Use only real database employees (no mock data)

  const filteredEmployees = employees
    .filter((emp: User) => emp.role !== 'admin') // Remove admin users from HR Portal display
    .filter((emp: User) => {
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
                        <p className="text-2xl font-bold text-[#e45c2b]">{compensation.primary}</p>
                        <p className="text-sm text-gray-600">{compensation.secondary}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEmployee(employee);
                            setIsEditEmployeeModalOpen(true);
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

        {/* Edit Employee Modal */}
        <Dialog open={isEditEmployeeModalOpen} onOpenChange={setIsEditEmployeeModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information and status
              </DialogDescription>
            </DialogHeader>
            
            {editingEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input
                      id="editFirstName"
                      value={editingEmployee.firstName}
                      onChange={(e) => setEditingEmployee({...editingEmployee, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      value={editingEmployee.lastName}
                      onChange={(e) => setEditingEmployee({...editingEmployee, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPhone">Phone</Label>
                    <Input
                      id="editPhone"
                      value={editingEmployee.phone || ''}
                      onChange={(e) => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editExtension">Extension</Label>
                    <Input
                      id="editExtension"
                      value={editingEmployee.extension || ''}
                      onChange={(e) => setEditingEmployee({...editingEmployee, extension: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editRole">Role</Label>
                    <Select value={editingEmployee.role} onValueChange={(value) => setEditingEmployee({...editingEmployee, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales_rep">Sales Representative</SelectItem>
                        <SelectItem value="hr_staff">HR Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select value={editingEmployee.isActive ? 'active' : 'inactive'} onValueChange={(value) => setEditingEmployee({...editingEmployee, isActive: value === 'active'})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="editCommissionRate">Commission Rate (%)</Label>
                  <Input
                    id="editCommissionRate"
                    type="number"
                    value={typeof editingEmployee.commissionRate === 'string' ? 
                      parseFloat(editingEmployee.commissionRate) || 0 : 
                      editingEmployee.commissionRate || 0}
                    onChange={(e) => setEditingEmployee({...editingEmployee, commissionRate: e.target.value})}
                    step="0.1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      setIsEditEmployeeModalOpen(false);
                      setEditingEmployee(null);
                    }}
                    variant="outline" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      if (editingEmployee) {
                        editEmployeeMutation.mutate({
                          id: editingEmployee.id,
                          firstName: editingEmployee.firstName,
                          lastName: editingEmployee.lastName,
                          email: editingEmployee.email,
                          phone: editingEmployee.phone,
                          extension: editingEmployee.extension,
                          role: editingEmployee.role,
                          isActive: editingEmployee.isActive,
                          commissionRate: editingEmployee.commissionRate
                        });
                      }
                    }}
                    disabled={editEmployeeMutation.isPending}
                    className="flex-1 bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
                  >
                    {editEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        )}

        {/* Add Employee Modal */}
        <Dialog open={isAddEmployeeModalOpen} onOpenChange={setIsAddEmployeeModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Create a new employee account with compensation details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
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
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_rep">Sales Representative</SelectItem>
                      <SelectItem value="hr_staff">HR Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    addEmployeeMutation.mutate({
                      firstName: newEmployee.firstName,
                      lastName: newEmployee.lastName,
                      email: newEmployee.email,
                      username: newEmployee.email,
                      password: 'temppass123',
                      phone: newEmployee.phone,
                      role: newEmployee.role,
                      compensationType: newEmployee.compensationType,
                      baseSalary: newEmployee.baseSalary,
                      commissionRate: newEmployee.commissionRate,
                      bonusCommissionRate: newEmployee.bonusCommissionRate,
                      commissionTier: newEmployee.commissionTier,
                      department: newEmployee.department
                    });
                  }}
                  disabled={addEmployeeMutation.isPending}
                  className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
                >
                  {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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