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
import { Users, DollarSign, Calendar, TrendingUp, Award, Building2, Phone, Mail, UserPlus, Trash2, Edit, Send, Package, Copy, CheckCircle, User, Shield, Building, CreditCard } from 'lucide-react';
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";
import UserInvitation from '@/components/user-invitation';
import EmployeeOnboarding from '@/components/employee-onboarding';

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
  employmentType?: 'w2_employee' | 'contractor_1099';
  taxStatus?: 'employee' | 'contractor';
  baseSalary?: number;
  commissionRate?: number;
  bonusCommissionRate?: number;
  commissionTier?: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

interface EmailSetup {
  id: number;
  employeeId: number;
  emailAddress: string;
  firstName: string;
  lastName: string;
  department: string;
  status: string;
  instructions?: string;
  createdAt: string;
}

export default function HRPortal() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCompensationType, setSelectedCompensationType] = useState<string>('all');
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  
  // Email Management State
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isCreateEmailDialogOpen, setIsCreateEmailDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    mobilePhone: '',
    extension: '',
    workEmail: '',
    role: 'sales_rep',
    compensationType: 'commission',
    employmentType: 'w2_employee', // w2_employee or contractor_1099
    taxStatus: 'employee', // employee or contractor
    baseSalary: 50000,
    commissionRate: 10,
    bonusCommissionRate: 0,
    commissionTier: 'standard',
    department: 'sales',
    // Direct Deposit Information
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking',
    directDepositEnabled: false,
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    // Employment Details
    hireDate: '',
    employeeId: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  // Email Management Queries
  const { data: emailSetups = [], isLoading: emailLoading } = useQuery({
    queryKey: ['/api/email-accounts'],
    queryFn: () => apiRequest('GET', '/api/email-accounts').then(response => response.json())
  });

  const { data: employeesWithoutEmail = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees/without-email'],
    queryFn: () => apiRequest('GET', '/api/employees/without-email').then(response => response.json())
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: (employeeData: any) => apiRequest('POST', '/api/users', {
      ...employeeData,
      password: 'TempPassword123!', // Temporary password - should be changed on first login
      commissionRate: employeeData.commissionRate?.toString() || '10',
      baseCommissionRate: employeeData.commissionRate?.toString() || '10',
      bonusCommissionRate: (employeeData.bonusCommissionRate || 0).toString(),
      hireDate: employeeData.hireDate ? new Date(employeeData.hireDate) : null,
      isActive: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAddEmployeeModalOpen(false);
      setNewEmployee({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        mobilePhone: '',
        extension: '',
        workEmail: '',
        role: 'sales_rep',
        compensationType: 'commission',
        employmentType: 'w2_employee',
        taxStatus: 'employee',
        baseSalary: 50000,
        commissionRate: 10,
        bonusCommissionRate: 0,
        commissionTier: 'standard',
        department: 'sales',
        bankName: '',
        routingNumber: '',
        accountNumber: '',
        accountType: 'checking',
        directDepositEnabled: false,
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        hireDate: '',
        employeeId: ''
      });
      toast({
        title: "Employee Added",
        description: "New employee has been successfully added.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.response?.data?.error || "Failed to add employee.";
      
      if (errorMessage.includes("Email already exists")) {
        toast({
          title: "Email Already Exists",
          description: "This email address is already registered in the system. Please use a different email.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("Username already exists")) {
        toast({
          title: "Username Already Exists", 
          description: "This username is already taken. Please choose a different username.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  });

  // Edit employee mutation
  const editEmployeeMutation = useMutation({
    mutationFn: (employeeData: any) => apiRequest('PUT', `/api/users/${employeeData.id}`, {
      ...employeeData,
      commissionRate: employeeData.commissionRate?.toString() || '10',
      baseCommissionRate: employeeData.commissionRate?.toString() || '10',
      bonusCommissionRate: (employeeData.bonusCommissionRate || 0).toString(),
    }),
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

  // Show all employees including admins
  const allEmployees = Array.isArray(employees) ? employees : [];
  
  const filteredEmployees = allEmployees.filter((emp: any) => {
    const departmentMatch = selectedDepartment === 'all' || emp.department === selectedDepartment;
    const compensationMatch = selectedCompensationType === 'all' || emp.compensationType === selectedCompensationType;
    return departmentMatch && compensationMatch;
  });

  // HR Data calculations
  const hrData = {
    totalEmployees: allEmployees.length,
    salesReps: allEmployees.filter((emp: User) => emp.role === 'sales_rep').length,
    hrStaff: allEmployees.filter((emp: User) => emp.role === 'hr_staff').length,
    totalPayroll: allEmployees.reduce((sum: number, emp: User) => {
      return sum + (emp.compensationType === 'salary' ? (emp.baseSalary || 0) : 0);
    }, 0),
    avgSalary: allEmployees.length > 0 ? allEmployees.reduce((sum: number, emp: User) => 
      sum + (emp.compensationType === 'salary' ? (emp.baseSalary || 0) : 50000), 0) / allEmployees.length : 0,
    commissionPaid: allEmployees.filter((emp: User) => emp.compensationType === 'commission')
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

  // Email Management Functions
  const generateEmailAddress = (firstName: string, lastName: string): string => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@traffikboosters.com`;
  };

  const generateSecurePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createEmailMutation = useMutation({
    mutationFn: (emailData: any) => apiRequest('POST', '/api/email-accounts', emailData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees/without-email'] });
      setIsCreateEmailDialogOpen(false);
      setSelectedEmployee(null);
      setGeneratedPassword('');
      toast({
        title: "Email Account Created Successfully",
        description: "Setup instructions generated and employee notified",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Email Account",
        description: error.message || "An error occurred while creating the email account",
        variant: "destructive",
      });
    }
  });

  const handleCreateEmail = () => {
    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee to create an email for",
        variant: "destructive",
      });
      return;
    }

    const password = generateSecurePassword();
    setGeneratedPassword(password);

    const emailAddress = generateEmailAddress(selectedEmployee.firstName, selectedEmployee.lastName);
    
    const emailAccountData = {
      employeeId: selectedEmployee.id,
      emailAddress,
      firstName: selectedEmployee.firstName,
      lastName: selectedEmployee.lastName,
      department: selectedEmployee.department || 'General',
      status: 'pending',
      storageLimit: 5000,
      forwardingEnabled: false,
      autoReplyEnabled: false
    };

    createEmailMutation.mutate(emailAccountData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Text has been copied to your clipboard",
    });
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
        {/* Traffik Boosters Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-4">
            <img 
              src={traffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="h-20 w-auto object-contain" 
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-black">HR PORTAL</h1>
              <p className="text-lg font-semibold text-black">More Traffik! More Sales!</p>
            </div>
          </div>
        </div>

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
            <div className="flex flex-wrap gap-4 items-end">
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
              
              <Button 
                onClick={() => setIsAddEmployeeModalOpen(true)}
                className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="employees">Employee Management</TabsTrigger>
            <TabsTrigger value="invitations">Send Invitations</TabsTrigger>
            <TabsTrigger value="onboarding">Employee Onboarding</TabsTrigger>
            <TabsTrigger value="email">Email Management</TabsTrigger>
            <TabsTrigger value="recruitment">OnlineJobs.ph</TabsTrigger>
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
                          
                          <div className="space-y-2">
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
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  <span className="font-medium">Personal:</span> {employee.email}
                                </div>
                                {employee.workEmail && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    <span className="font-medium">Work:</span> {employee.workEmail}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  <span className="font-medium">Phone:</span> {employee.phone}
                                </div>
                                {employee.mobilePhone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    <span className="font-medium">Mobile:</span> {employee.mobilePhone}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                {employee.extension && (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    <span className="font-medium">Ext:</span> {employee.extension}
                                  </div>
                                )}
                                {employee.employeeId && (
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" />
                                    <span className="font-medium">ID:</span> {employee.employeeId}
                                  </div>
                                )}
                                {employee.directDepositEnabled && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="font-medium">Direct Deposit Active</span>
                                  </div>
                                )}
                                {employee.hireDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Hired:</span> {new Date(employee.hireDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-xs text-gray-500 space-y-1">
                              <p>
                                Department: {employee.department?.charAt(0).toUpperCase() + employee.department?.slice(1)} • 
                                Joined: {new Date(employee.createdAt).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  employee.employmentType === 'w2_employee' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {employee.employmentType === 'w2_employee' ? 'W-2 Employee' : '1099 Contractor'}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  employee.taxStatus === 'employee' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {employee.taxStatus === 'employee' ? 'Tax Withholding' : 'No Withholding'}
                                </span>
                              </div>
                            </div>
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
                                // Ensure all required properties are present
                                const editEmployee = {
                                  ...employee,
                                  commissionRate: employee.commissionRate || 10,
                                  bonusCommissionRate: employee.bonusCommissionRate || 0,
                                  baseSalary: employee.baseSalary || 50000,
                                  commissionTier: employee.commissionTier || 'standard',
                                  compensationType: employee.compensationType || 'commission',
                                  employmentType: employee.employmentType || 'w2_employee',
                                  taxStatus: employee.taxStatus || 'employee',
                                  department: employee.department || 'sales'
                                };
                                setEditingEmployee(editEmployee);
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

          <TabsContent value="onboarding" className="space-y-6">
            <EmployeeOnboarding />
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            {/* Email Management Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-[#e45c2b]" />
                  Employee Email Management
                </CardTitle>
                <p className="text-gray-600">Manage employee email accounts and access credentials</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{emailSetups.length}</span> Email Accounts Created
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{employeesWithoutEmail.length}</span> Employees Available
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsCreateEmailDialogOpen(true)}
                    className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
                    disabled={employeesWithoutEmail.length === 0}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Create Email Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Accounts List */}
            {emailLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {emailSetups.length > 0 ? (
                  emailSetups.map((setup: any) => (
                    <Card key={setup.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-[#e45c2b] text-white">
                                {setup.firstName?.[0]}{setup.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {setup.firstName} {setup.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{setup.emailAddress}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {setup.department}
                                </Badge>
                                <Badge 
                                  variant={setup.status === 'active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {setup.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(setup.emailAddress)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Email
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Accounts Created</h3>
                      <p className="text-gray-600 mb-4">
                        Create email accounts for employees to provide them with @traffikboosters.com addresses
                      </p>
                      <Button 
                        onClick={() => setIsCreateEmailDialogOpen(true)}
                        className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
                        disabled={employeesWithoutEmail.length === 0}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Create First Email Account
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Create Email Account Dialog */}
            <Dialog open={isCreateEmailDialogOpen} onOpenChange={setIsCreateEmailDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Account</DialogTitle>
                  <DialogDescription>
                    Select an employee to create a @traffikboosters.com email account
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Employee Selection */}
                  <div>
                    <Label htmlFor="employee">Select Employee</Label>
                    <Select 
                      value={selectedEmployee?.id.toString() || ""} 
                      onValueChange={(value) => {
                        const employee = employeesWithoutEmail.find(emp => emp.id.toString() === value);
                        setSelectedEmployee(employee || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesWithoutEmail.map((employee: any) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.firstName} {employee.lastName} - {employee.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview */}
                  {selectedEmployee && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Email Setup Preview</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Employee:</span> 
                          <span className="ml-2 font-medium">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email Address:</span> 
                          <span className="ml-2 font-medium">{generateEmailAddress(selectedEmployee.firstName, selectedEmployee.lastName)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Department:</span> 
                          <span className="ml-2 font-medium">{selectedEmployee.department}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generated Password */}
                  {generatedPassword && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-900">Email Account Created Successfully!</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-green-700">Temporary Password:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-white px-2 py-1 rounded border text-green-800 font-mono">
                              {generatedPassword}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedPassword)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateEmailDialogOpen(false);
                        setSelectedEmployee(null);
                        setGeneratedPassword('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateEmail}
                      disabled={!selectedEmployee || createEmailMutation.isPending}
                      className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
                    >
                      {createEmailMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Creating...
                        </div>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Create Email Account
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="recruitment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  OnlineJobs.ph Recruitment Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Quick Access Panel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Access</h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.open('https://www.onlinejobs.ph/', '_blank')}
                      >
                        <Building2 className="h-5 w-5 mr-3" />
                        Open OnlineJobs.ph Platform
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-12"
                        onClick={() => window.open('https://www.onlinejobs.ph/jobseekers', '_blank')}
                      >
                        <Users className="h-5 w-5 mr-3" />
                        Browse Job Seekers
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-12"
                        onClick={() => window.open('https://www.onlinejobs.ph/post-a-job', '_blank')}
                      >
                        <UserPlus className="h-5 w-5 mr-3" />
                        Post New Job Opening
                      </Button>
                    </div>
                  </div>

                  {/* Recruitment Stats */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recruitment Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">0</div>
                          <div className="text-sm text-gray-600">Active Job Posts</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">0</div>
                          <div className="text-sm text-gray-600">Applications Received</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">0</div>
                          <div className="text-sm text-gray-600">Interviews Scheduled</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">0</div>
                          <div className="text-sm text-gray-600">Candidates Hired</div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Popular Job Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Popular Job Categories for Remote Work</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" 
                          onClick={() => window.open('https://www.onlinejobs.ph/jobseekers/info/Virtual-Assistant', '_blank')}>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">Virtual Assistants</div>
                        <div className="text-sm text-gray-600 mt-2">General admin, customer service, data entry</div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open('https://www.onlinejobs.ph/jobseekers/search?q=web+developer', '_blank')}>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">Web Developers</div>
                        <div className="text-sm text-gray-600 mt-2">Frontend, backend, full-stack development</div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open('https://www.onlinejobs.ph/jobseekers/search?q=digital+marketing', '_blank')}>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">Digital Marketers</div>
                        <div className="text-sm text-gray-600 mt-2">SEO, social media, content marketing</div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open('https://www.onlinejobs.ph/jobseekers/search?q=graphic+designer', '_blank')}>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">Graphic Designers</div>
                        <div className="text-sm text-gray-600 mt-2">Logo design, branding, web graphics</div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open('https://www.onlinejobs.ph/jobseekers/search?q=content+writer', '_blank')}>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">Content Writers</div>
                        <div className="text-sm text-gray-600 mt-2">Blog posts, website copy, technical writing</div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open('https://www.onlinejobs.ph/jobseekers/search?q=customer+service', '_blank')}>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-teal-600">Customer Service</div>
                        <div className="text-sm text-gray-600 mt-2">Chat support, phone support, help desk</div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Quick Tips */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">OnlineJobs.ph Recruitment Tips</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                      <div>
                        <div className="font-medium mb-2">✓ Cost-Effective Hiring</div>
                        <p>Access to skilled Filipino professionals at competitive rates</p>
                      </div>
                      <div>
                        <div className="font-medium mb-2">✓ English Proficiency</div>
                        <p>Strong English communication skills across all candidates</p>
                      </div>
                      <div>
                        <div className="font-medium mb-2">✓ Time Zone Advantage</div>
                        <p>Philippines timezone works well for US business operations</p>
                      </div>
                      <div>
                        <div className="font-medium mb-2">✓ Dedicated Workers</div>
                        <p>Known for loyalty, dedication, and long-term employment</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Employee Modal */}
        <Dialog open={isAddEmployeeModalOpen} onOpenChange={setIsAddEmployeeModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Add a new employee to the HR system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    placeholder="Last name"
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
                  placeholder="email@traffikboosters.com"
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                  placeholder="username"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    placeholder="(877) 840-6250"
                  />
                </div>
                <div>
                  <Label htmlFor="mobilePhone">Mobile Phone</Label>
                  <Input
                    id="mobilePhone"
                    value={newEmployee.mobilePhone}
                    onChange={(e) => setNewEmployee({...newEmployee, mobilePhone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="extension">Extension</Label>
                  <Input
                    id="extension"
                    value={newEmployee.extension}
                    onChange={(e) => setNewEmployee({...newEmployee, extension: e.target.value})}
                    placeholder="1001"
                  />
                </div>
                <div>
                  <Label htmlFor="workEmail">Work Email</Label>
                  <Input
                    id="workEmail"
                    value={newEmployee.workEmail}
                    onChange={(e) => setNewEmployee({...newEmployee, workEmail: e.target.value})}
                    placeholder="firstname.lastname@traffikboosters.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={newEmployee.employeeId}
                    onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                    placeholder="EMP-001"
                  />
                </div>
                <div>
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee({...newEmployee, hireDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_rep">Sales Representative</SelectItem>
                    <SelectItem value="hr_staff">HR Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={newEmployee.employmentType} onValueChange={(value) => setNewEmployee({...newEmployee, employmentType: value, taxStatus: value === 'w2_employee' ? 'employee' : 'contractor'})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="w2_employee">W-2 Employee</SelectItem>
                      <SelectItem value="contractor_1099">1099 Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxStatus">Tax Status</Label>
                  <Select value={newEmployee.taxStatus} onValueChange={(value) => setNewEmployee({...newEmployee, taxStatus: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee (W-2 Tax Withholding)</SelectItem>
                      <SelectItem value="contractor">Contractor (1099 No Withholding)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="compensationType">Compensation Type</Label>
                <Select value={newEmployee.compensationType} onValueChange={(value) => setNewEmployee({...newEmployee, compensationType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compensation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newEmployee.compensationType === 'commission' && (
                <>
                  <div>
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={newEmployee.commissionRate}
                      onChange={(e) => setNewEmployee({...newEmployee, commissionRate: parseInt(e.target.value)})}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bonusCommissionRate">Bonus Commission Rate (%)</Label>
                    <Input
                      id="bonusCommissionRate"
                      type="number"
                      value={newEmployee.bonusCommissionRate}
                      onChange={(e) => setNewEmployee({...newEmployee, bonusCommissionRate: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionTier">Commission Tier</Label>
                    <Select value={newEmployee.commissionTier} onValueChange={(value) => setNewEmployee({...newEmployee, commissionTier: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {newEmployee.compensationType === 'salary' && (
                <div>
                  <Label htmlFor="baseSalary">Base Salary</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={newEmployee.baseSalary}
                    onChange={(e) => setNewEmployee({...newEmployee, baseSalary: parseInt(e.target.value)})}
                    placeholder="50000"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Direct Deposit Section */}
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Direct Deposit Information</h4>
                
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="directDepositEnabled"
                    checked={newEmployee.directDepositEnabled}
                    onChange={(e) => setNewEmployee({...newEmployee, directDepositEnabled: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="directDepositEnabled">Enable Direct Deposit</Label>
                </div>

                {newEmployee.directDepositEnabled && (
                  <div className="grid grid-cols-2 gap-4 space-y-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={newEmployee.bankName}
                        onChange={(e) => setNewEmployee({...newEmployee, bankName: e.target.value})}
                        placeholder="Bank of America"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountType">Account Type</Label>
                      <Select value={newEmployee.accountType} onValueChange={(value) => setNewEmployee({...newEmployee, accountType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={newEmployee.routingNumber}
                        onChange={(e) => setNewEmployee({...newEmployee, routingNumber: e.target.value})}
                        placeholder="123456789"
                        maxLength={9}
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        type="password"
                        value={newEmployee.accountNumber}
                        onChange={(e) => setNewEmployee({...newEmployee, accountNumber: e.target.value})}
                        placeholder="••••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contact Section */}
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={newEmployee.emergencyContactName}
                      onChange={(e) => setNewEmployee({...newEmployee, emergencyContactName: e.target.value})}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={newEmployee.emergencyContactPhone}
                      onChange={(e) => setNewEmployee({...newEmployee, emergencyContactPhone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="emergencyContactRelation">Relationship</Label>
                  <Select value={newEmployee.emergencyContactRelation} onValueChange={(value) => setNewEmployee({...newEmployee, emergencyContactRelation: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddEmployeeModalOpen(false);
                    setNewEmployee({
                      username: '',
                      email: '',
                      firstName: '',
                      lastName: '',
                      phone: '',
                      mobilePhone: '',
                      extension: '',
                      workEmail: '',
                      role: 'sales_rep',
                      compensationType: 'commission',
                      employmentType: 'w2_employee',
                      taxStatus: 'employee',
                      commissionRate: 10,
                      bonusCommissionRate: 0,
                      commissionTier: 'standard',
                      baseSalary: 50000,
                      department: 'sales',
                      bankName: '',
                      routingNumber: '',
                      accountNumber: '',
                      accountType: 'checking',
                      directDepositEnabled: false,
                      emergencyContactName: '',
                      emergencyContactPhone: '',
                      emergencyContactRelation: '',
                      hireDate: '',
                      employeeId: ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    addEmployeeMutation.mutate(newEmployee);
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

        {/* Edit Employee Modal */}
        <Dialog open={isEditEmployeeModalOpen} onOpenChange={setIsEditEmployeeModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information and compensation details
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
                    placeholder="email@traffikboosters.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="editUsername">Username</Label>
                  <Input
                    id="editUsername"
                    value={editingEmployee.username}
                    onChange={(e) => setEditingEmployee({...editingEmployee, username: e.target.value})}
                    placeholder="username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editingEmployee.phone || ''}
                    onChange={(e) => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                    placeholder="(877) 840-6250"
                  />
                </div>
                
                <div>
                  <Label htmlFor="editRole">Role</Label>
                  <Select value={editingEmployee.role} onValueChange={(value) => setEditingEmployee({...editingEmployee, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_rep">Sales Representative</SelectItem>
                      <SelectItem value="hr_staff">HR Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="editCompensationType">Compensation Type</Label>
                  <Select value={editingEmployee.compensationType} onValueChange={(value: "commission" | "salary") => setEditingEmployee({...editingEmployee, compensationType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select compensation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commission">Commission</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {editingEmployee.compensationType === 'commission' && (
                  <>
                    <div>
                      <Label htmlFor="editCommissionRate">Commission Rate (%)</Label>
                      <Input
                        id="editCommissionRate"
                        type="number"
                        value={editingEmployee.commissionRate}
                        onChange={(e) => setEditingEmployee({...editingEmployee, commissionRate: parseInt(e.target.value)})}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editBonusCommissionRate">Bonus Commission Rate (%)</Label>
                      <Input
                        id="editBonusCommissionRate"
                        type="number"
                        value={editingEmployee.bonusCommissionRate}
                        onChange={(e) => setEditingEmployee({...editingEmployee, bonusCommissionRate: parseInt(e.target.value)})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCommissionTier">Commission Tier</Label>
                      <Select value={editingEmployee.commissionTier} onValueChange={(value) => setEditingEmployee({...editingEmployee, commissionTier: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {editingEmployee.compensationType === 'salary' && (
                  <div>
                    <Label htmlFor="editBaseSalary">Base Salary</Label>
                    <Input
                      id="editBaseSalary"
                      type="number"
                      value={editingEmployee.baseSalary}
                      onChange={(e) => setEditingEmployee({...editingEmployee, baseSalary: parseInt(e.target.value)})}
                      placeholder="50000"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="editDepartment">Department</Label>
                  <Select value={editingEmployee.department} onValueChange={(value) => setEditingEmployee({...editingEmployee, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditEmployeeModalOpen(false);
                      setEditingEmployee(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      editEmployeeMutation.mutate(editingEmployee);
                    }}
                    disabled={editEmployeeMutation.isPending}
                    className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white"
                  >
                    {editEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}