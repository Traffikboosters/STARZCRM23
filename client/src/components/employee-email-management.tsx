import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  Lock,
  Users,
  Building2,
  AlertCircle
} from "lucide-react";

interface EmailAccount {
  id: number;
  employeeId: number;
  emailAddress: string;
  firstName: string;
  lastName: string;
  department: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLogin?: string;
  storageUsed: number;
  storageLimit: number;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'credentials' | 'policy' | 'suspension';
}

export default function EmployeeEmailManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [emailCredentials, setEmailCredentials] = useState({
    password: '',
    confirmPassword: ''
  });
  const [emailSettings, setEmailSettings] = useState({
    storageLimit: 5000, // MB
    forwardingEnabled: false,
    autoReplyEnabled: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email accounts
  const { data: emailAccounts = [], isLoading } = useQuery({
    queryKey: ['/api/email-accounts'],
    queryFn: () => apiRequest('GET', '/api/email-accounts')
  });

  // Fetch employees without email accounts
  const { data: availableEmployees = [] } = useQuery({
    queryKey: ['/api/employees/without-email'],
    queryFn: () => apiRequest('GET', '/api/employees/without-email')
  });

  // Fetch email templates
  const { data: emailTemplates = [] } = useQuery({
    queryKey: ['/api/email-templates'],
    queryFn: () => apiRequest('GET', '/api/email-templates')
  });

  // Create email account mutation
  const createEmailMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/email-accounts', data),
    onSuccess: (data) => {
      toast({
        title: "Email Account Created",
        description: `Successfully created ${data.emailAddress}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees/without-email'] });
      setIsCreateDialogOpen(false);
      setSelectedEmployee(null);
      setEmailCredentials({ password: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Email",
        description: error.message || "Failed to create email account",
        variant: "destructive",
      });
    }
  });

  // Send credentials mutation
  const sendCredentialsMutation = useMutation({
    mutationFn: (accountId: number) => apiRequest('POST', `/api/email-accounts/${accountId}/send-credentials`),
    onSuccess: () => {
      toast({
        title: "Credentials Sent",
        description: "Email credentials sent to employee",
      });
    }
  });

  // Update account status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest('PATCH', `/api/email-accounts/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      toast({
        title: "Status Updated",
        description: "Email account status updated successfully",
      });
    }
  });

  const handleCreateEmail = () => {
    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee to create an email account for",
        variant: "destructive",
      });
      return;
    }

    if (emailCredentials.password !== emailCredentials.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (emailCredentials.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    const emailAddress = `${selectedEmployee.firstName.toLowerCase()}.${selectedEmployee.lastName.toLowerCase()}@traffikboosters.com`;

    createEmailMutation.mutate({
      employeeId: selectedEmployee.id,
      emailAddress,
      password: emailCredentials.password,
      settings: emailSettings
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800"
    };
    return <Badge className={variants[status as keyof typeof variants] || ""}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Email Management</h1>
          <p className="text-muted-foreground">Manage Traffik Boosters employee email accounts</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Email Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Employee Email Account</DialogTitle>
              <DialogDescription>
                Set up a new @traffikboosters.com email account for an employee
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
                        {employee.firstName} {employee.lastName} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email Preview */}
              {selectedEmployee && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Email Address</Label>
                  <p className="font-mono text-lg">
                    {selectedEmployee.firstName.toLowerCase()}.{selectedEmployee.lastName.toLowerCase()}@traffikboosters.com
                  </p>
                </div>
              )}

              {/* Password Setup */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={emailCredentials.password}
                    onChange={(e) => setEmailCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={emailCredentials.confirmPassword}
                    onChange={(e) => setEmailCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              {/* Email Settings */}
              <div className="space-y-3">
                <Label>Account Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storageLimit" className="text-sm">Storage Limit (MB)</Label>
                    <Input
                      id="storageLimit"
                      type="number"
                      value={emailSettings.storageLimit}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, storageLimit: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="forwarding"
                      checked={emailSettings.forwardingEnabled}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, forwardingEnabled: e.target.checked }))}
                    />
                    <Label htmlFor="forwarding" className="text-sm">Enable Forwarding</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEmail}
                  disabled={createEmailMutation.isPending || !selectedEmployee}
                >
                  {createEmailMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
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
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Accounts</p>
                    <p className="text-2xl font-bold">{emailAccounts.length}</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {emailAccounts.filter((acc: EmailAccount) => acc.status === 'active').length}
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
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {emailAccounts.filter((acc: EmailAccount) => acc.status === 'pending').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">
                      {emailAccounts.filter((acc: EmailAccount) => acc.status === 'suspended').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Accounts List */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Email Accounts</CardTitle>
              <CardDescription>Manage all employee email accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : emailAccounts.length === 0 ? (
                <div className="text-center p-8">
                  <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Email Accounts</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first employee email account</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {emailAccounts.map((account: EmailAccount) => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
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
                              {getStatusBadge(account.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Storage</p>
                            <p>{account.storageUsed}MB / {account.storageLimit}MB</p>
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendCredentialsMutation.mutate(account.id)}
                              disabled={sendCredentialsMutation.isPending}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({
                                id: account.id,
                                status: account.status === 'active' ? 'suspended' : 'active'
                              })}
                            >
                              {account.status === 'active' ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
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
                Email Server Configuration
              </CardTitle>
              <CardDescription>Traffik Boosters email server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    IMAP Settings (Incoming)
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
                    SMTP Settings (Outgoing)
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
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Server Status</h4>
                    <p className="text-sm text-blue-600">All email servers are operational and configured for @traffikboosters.com domain</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Pre-configured templates for employee communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailTemplates.map((template: EmailTemplate) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-3">{template.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-medium">Total Storage Used</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {emailAccounts.reduce((sum: number, acc: EmailAccount) => sum + acc.storageUsed, 0)}MB
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-medium">Average Usage</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {emailAccounts.length ? Math.round(emailAccounts.reduce((sum: number, acc: EmailAccount) => sum + acc.storageUsed, 0) / emailAccounts.length) : 0}MB
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-medium">Active This Month</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {emailAccounts.filter((acc: EmailAccount) => acc.lastLogin).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}