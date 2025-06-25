import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, DollarSign, Calendar, TrendingUp, Award, Building2, Phone, Mail, UserPlus } from 'lucide-react';

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
  
  // Mock data for HR Portal - in real app this would come from API
  const hrData = {
    totalEmployees: 5,
    salesReps: 2,
    hrStaff: 2,
    admins: 1,
    totalPayroll: 296000, // Combined salaries + estimated commissions
    avgSalary: 61500,
    commissionPaid: 45600, // Monthly commission estimates
  };

  const employees: User[] = [
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

  const filteredEmployees = employees.filter(emp => {
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
      const totalRate = (employee.commissionRate || 0) + (employee.bonusCommissionRate || 0);
      return {
        primary: `${totalRate}%`,
        secondary: `Base: ${employee.commissionRate}% + Bonus: ${employee.bonusCommissionRate}%`,
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
          <Button className="bg-[#e45c2b] hover:bg-[#d14a1f] text-white">
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

                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#e45c2b]">{compensation.primary}</p>
                      <p className="text-sm text-gray-600">{compensation.secondary}</p>
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
      </div>
    </div>
  );
}