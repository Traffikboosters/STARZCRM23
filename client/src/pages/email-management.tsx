import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Plus, 
  Settings, 
  User, 
  Copy, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Server,
  AlertCircle,
  Building2
} from "lucide-react";

interface EmailSetup {
  id: number;
  employeeId: number;
  emailAddress: string;
  firstName: string;
  lastName: string;
  department: string;
  status: 'active' | 'pending' | 'suspended';
  instructions: string;
  createdAt: string;
}

export default function EmailManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email accounts
  const { data: emailSetups = [], isLoading: emailLoading } = useQuery({
    queryKey: ['/api/email-accounts'],
    queryFn: () => apiRequest('GET', '/api/email-accounts').then(response => response.json())
  });

  // Fetch employees without email accounts
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees/without-email'],
    queryFn: () => apiRequest('GET', '/api/employees/without-email').then(response => response.json())
  });

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
      setIsCreateDialogOpen(false);
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

    setIsCreateDialogOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const copyEmailSetupInstructions = (employee: any) => {
    const emailAddress = generateEmailAddress(employee.firstName, employee.lastName);
    const password = generateSecurePassword();
    
    const instructions = `TRAFFIK BOOSTERS EMAIL SETUP INSTRUCTIONS

Employee: ${employee.firstName} ${employee.lastName}
Email Address: ${emailAddress}
Temporary Password: ${password}

STEP 1: Email Client Configuration
- Server Type: IMAP/SMTP
- IMAP Server: imap.ipage.com
- IMAP Port: 993 (SSL/TLS)
- SMTP Server: smtp.ipage.com  
- SMTP Port: 465 (SSL/TLS)
- Username: ${emailAddress}
- Password: ${password}

STEP 2: Manual Setup Required
This email account needs to be created manually through your email hosting provider (iPage):

1. Log into your iPage hosting control panel
2. Navigate to Email Accounts section
3. Create new email account: ${emailAddress}
4. Set password: ${password}
5. Configure any additional settings (storage, forwarding, etc.)

STEP 3: Employee Instructions
1. Configure email client (Outlook, Mail app, etc.) with above settings
2. Test sending and receiving emails
3. Change password after first login
4. Contact IT support if any issues

Important: This is a temporary password that should be changed immediately after first login.

For technical support, contact: starz@traffikboosters.com`;

    copyToClipboard(instructions);
  };

  const availableEmployees = employees;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Traffik Boosters Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Employee Email Management</h1>
              <p className="text-orange-600 font-medium">More Traffik! More Sales!</p>
              <p className="text-muted-foreground">Create and manage @traffikboosters.com email accounts</p>
            </div>
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4" />
              Create Email Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Employee Email Account</DialogTitle>
              <DialogDescription>
                Generate setup instructions for a new @traffikboosters.com email account
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Employee Selection */}
              <div>
                <Label htmlFor="employee">Select Employee</Label>
                <Select onValueChange={(value) => {
                  const employee = availableEmployees.find((emp: any) => emp.id.toString() === value);
                  setSelectedEmployee(employee);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees.map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.firstName} {employee.lastName} - {employee.role || 'Employee'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email Preview */}
              {selectedEmployee && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Email Address</Label>
                  <p className="font-mono text-lg text-orange-600">
                    {generateEmailAddress(selectedEmployee.firstName, selectedEmployee.lastName)}
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Manual Setup Required</h4>
                    <p className="text-sm text-blue-600">
                      This will generate setup instructions. The email account must be created manually through your iPage hosting control panel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEmail}
                  disabled={!selectedEmployee}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Generate Instructions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Email Accounts</TabsTrigger>
          <TabsTrigger value="server-config">Server Configuration</TabsTrigger>
          <TabsTrigger value="instructions">Setup Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Accounts</p>
                    <p className="text-2xl font-bold">{emailSetups.length}</p>
                  </div>
                  <Mail className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {emailSetups.filter(acc => acc.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Employees</p>
                    <p className="text-2xl font-bold text-blue-600">{availableEmployees.length}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Email Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Current Email Accounts</CardTitle>
              <CardDescription>Existing @traffikboosters.com email accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {emailSetups.length === 0 ? (
                <div className="text-center p-8">
                  <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Email Accounts</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first employee email account</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {emailSetups.map((account) => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{account.firstName} {account.lastName}</h3>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-muted-foreground font-mono">{account.emailAddress}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(account.emailAddress)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{account.department}</Badge>
                              <Badge className={account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {account.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const employee = employees.find((emp: any) => emp.id === account.employeeId);
                              if (employee) copyEmailSetupInstructions(employee);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Setup Instructions
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Employees */}
          <Card>
            <CardHeader>
              <CardTitle>Available Employees</CardTitle>
              <CardDescription>Employees who don't have email accounts yet</CardDescription>
            </CardHeader>
            <CardContent>
              {availableEmployees.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">All employees have email accounts</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableEmployees.map((employee: any) => (
                    <div key={employee.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{employee.firstName} {employee.lastName}</h4>
                        <p className="text-sm text-muted-foreground">{employee.role || 'Employee'}</p>
                        <p className="text-xs text-orange-600 font-mono">
                          {generateEmailAddress(employee.firstName, employee.lastName)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyEmailSetupInstructions(employee)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Get Instructions
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server-config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Traffik Boosters Email Server Configuration
              </CardTitle>
              <CardDescription>Current email server settings for @traffikboosters.com</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    IMAP Settings (Incoming Mail)
                  </h3>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Server:</span>
                      <span className="font-mono text-sm">imap.ipage.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Port:</span>
                      <span className="font-mono text-sm">993</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Security:</span>
                      <span className="font-mono text-sm">SSL/TLS</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    SMTP Settings (Outgoing Mail)
                  </h3>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Server:</span>
                      <span className="font-mono text-sm">smtp.ipage.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Port:</span>
                      <span className="font-mono text-sm">465</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Security:</span>
                      <span className="font-mono text-sm">SSL/TLS</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800">Manual Setup Required</h4>
                    <p className="text-sm text-orange-600">
                      Email accounts must be created manually through your iPage hosting control panel. 
                      This interface generates setup instructions and credentials for easy deployment.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Setup Instructions</CardTitle>
              <CardDescription>Step-by-step guide for creating employee email accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold">Step 1: Create Email Account in iPage</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Log into your iPage hosting control panel</li>
                  <li>Navigate to "Email Accounts" section</li>
                  <li>Click "Create New Email Account"</li>
                  <li>Enter the employee's email address (firstname.lastname@traffikboosters.com)</li>
                  <li>Set a secure password (use the generated one from this system)</li>
                  <li>Configure storage limits and settings as needed</li>
                  <li>Save the account</li>
                </ol>

                <h3 className="text-lg font-semibold mt-6">Step 2: Send Credentials to Employee</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Use the "Copy Setup Instructions" button for the employee</li>
                  <li>Send the complete setup instructions via secure message</li>
                  <li>Include both IMAP and SMTP server settings</li>
                  <li>Remind employee to change password after first login</li>
                </ol>

                <h3 className="text-lg font-semibold mt-6">Step 3: Employee Configuration</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Employee configures their email client (Outlook, Mail app, etc.)</li>
                  <li>Tests sending and receiving emails</li>
                  <li>Changes password from temporary to permanent</li>
                  <li>Contacts IT support if any issues arise</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}