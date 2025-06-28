import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Building2, Home, Users, MapPin, Clock, CheckCircle, AlertCircle, Send, FileText, Monitor, Phone } from 'lucide-react';
import traffikBoostersLogo from '@assets/TRAFIC BOOSTERS3 copy_1751060321835.png';

interface OnboardingEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  workLocation: 'remote' | 'onsite';
  startDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  timeZone?: string;
  homeAddress?: string;
  officeLocation?: string;
}

export function DualOnboardingPortal() {
  const { toast } = useToast();
  const [employees] = useState<OnboardingEmployee[]>([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      role: 'sales_rep',
      department: 'Sales',
      workLocation: 'remote',
      startDate: '2025-07-01',
      status: 'pending',
      timeZone: 'EST',
      homeAddress: '123 Main St, Austin, TX'
    },
    {
      id: '2',
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@email.com',
      role: 'sales_rep',
      department: 'Sales',
      workLocation: 'onsite',
      startDate: '2025-07-05',
      status: 'in_progress',
      officeLocation: 'Traffik Boosters HQ, Dallas, TX'
    }
  ]);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
    workLocation: 'remote' as 'remote' | 'onsite',
    startDate: '',
    timeZone: 'EST',
    homeAddress: '',
    officeLocation: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<OnboardingEmployee | null>(null);

  const handleCreateOnboarding = async () => {
    try {
      const response = await apiRequest('POST', '/api/hr/onboarding', newEmployee);
      
      if (response.ok) {
        toast({
          title: "Onboarding Created",
          description: `${newEmployee.workLocation === 'remote' ? 'Remote' : 'On-site'} onboarding packet sent to ${newEmployee.firstName} ${newEmployee.lastName}`,
        });
        
        setNewEmployee({
          firstName: '',
          lastName: '',
          email: '',
          role: '',
          department: '',
          workLocation: 'remote',
          startDate: '',
          timeZone: 'EST',
          homeAddress: '',
          officeLocation: ''
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create onboarding packet",
        variant: "destructive",
      });
    }
  };

  const getLocationIcon = (location: 'remote' | 'onsite') => {
    return location === 'remote' ? <Home className="h-4 w-4" /> : <Building2 className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold">Dual Onboarding System</h1>
            <p className="text-muted-foreground">Manage remote and on-site employee onboarding</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Create Onboarding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Employee Onboarding</DialogTitle>
              <DialogDescription>
                Set up onboarding for new remote or on-site employees
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales_rep">Sales Representative</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div>
                  <Label htmlFor="workLocation">Work Location</Label>
                  <Select 
                    value={newEmployee.workLocation} 
                    onValueChange={(value: 'remote' | 'onsite') => setNewEmployee({ ...newEmployee, workLocation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          Remote Work
                        </div>
                      </SelectItem>
                      <SelectItem value="onsite">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          On-Site Work
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newEmployee.workLocation === 'remote' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timeZone">Time Zone</Label>
                      <Select value={newEmployee.timeZone} onValueChange={(value) => setNewEmployee({ ...newEmployee, timeZone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                          <SelectItem value="CST">Central Time (CST)</SelectItem>
                          <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                          <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="homeAddress">Home Address (Optional)</Label>
                      <Textarea
                        id="homeAddress"
                        value={newEmployee.homeAddress}
                        onChange={(e) => setNewEmployee({ ...newEmployee, homeAddress: e.target.value })}
                        placeholder="123 Main St, City, State, ZIP"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="officeLocation">Office Location</Label>
                    <Textarea
                      id="officeLocation"
                      value={newEmployee.officeLocation}
                      onChange={(e) => setNewEmployee({ ...newEmployee, officeLocation: e.target.value })}
                      placeholder="Traffik Boosters HQ, 123 Business Ave, Dallas, TX"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newEmployee.startDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Onboarding Preview</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Employee: {newEmployee.firstName} {newEmployee.lastName}</p>
                    <p>Work Location: {newEmployee.workLocation === 'remote' ? 'Remote' : 'On-Site'}</p>
                    <p>Department: {newEmployee.department}</p>
                    {newEmployee.workLocation === 'remote' && (
                      <p>Time Zone: {newEmployee.timeZone}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button onClick={handleCreateOnboarding}>
                <Send className="h-4 w-4 mr-2" />
                Send Onboarding Packet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remote Workers</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.workLocation === 'remote').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Site Workers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.workLocation === 'onsite').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Status</CardTitle>
          <CardDescription>Track employee onboarding progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getLocationIcon(employee.workLocation)}
                    <div>
                      <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{employee.role.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{employee.department}</Badge>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{employee.workLocation === 'remote' ? 'Remote' : 'On-Site'}</p>
                    <p className="text-xs text-muted-foreground">
                      Start: {new Date(employee.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      {selectedEmployee && (
        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee.firstName} {selectedEmployee.lastName} - Onboarding Details
              </DialogTitle>
              <DialogDescription>
                {selectedEmployee.workLocation === 'remote' ? 'Remote' : 'On-Site'} Employee Information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Work Location</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getLocationIcon(selectedEmployee.workLocation)}
                    <span>{selectedEmployee.workLocation === 'remote' ? 'Remote Work' : 'On-Site Work'}</span>
                  </div>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="mt-1">{selectedEmployee.department}</p>
                </div>
              </div>

              {selectedEmployee.workLocation === 'remote' ? (
                <div className="space-y-4">
                  <div>
                    <Label>Time Zone</Label>
                    <p className="mt-1">{selectedEmployee.timeZone}</p>
                  </div>
                  {selectedEmployee.homeAddress && (
                    <div>
                      <Label>Home Address</Label>
                      <p className="mt-1">{selectedEmployee.homeAddress}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Remote Work Requirements</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• High-speed internet (25+ Mbps)</li>
                      <li>• Professional workspace setup</li>
                      <li>• Noise-canceling headset</li>
                      <li>• Backup internet connection</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedEmployee.officeLocation && (
                    <div>
                      <Label>Office Location</Label>
                      <p className="mt-1">{selectedEmployee.officeLocation}</p>
                    </div>
                  )}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">On-Site Benefits</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Modern workstation setup</li>
                      <li>• Complimentary coffee and snacks</li>
                      <li>• Conference rooms available</li>
                      <li>• Parking space included</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Onboarding Status</p>
                  <Badge className={getStatusColor(selectedEmployee.status)}>
                    {selectedEmployee.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(selectedEmployee.startDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}