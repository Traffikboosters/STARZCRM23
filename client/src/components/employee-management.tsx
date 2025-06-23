import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, PhoneCall, Edit2, Save, X, Plus, Users, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  mobilePhone?: string;
  extension?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
}

interface MightyCallResponse {
  success: boolean;
  callId?: string;
  message?: string;
}

export default function EmployeeManagement() {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [phoneData, setPhoneData] = useState<{
    phone: string;
    mobilePhone: string;
    extension: string;
  }>({ phone: "", mobilePhone: "", extension: "" });
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobilePhone: "",
    extension: "",
    role: "viewer",
    username: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const updatePhoneMutation = useMutation({
    mutationFn: async ({ userId, ...data }: { userId: number; phone: string; mobilePhone?: string; extension?: string }) => {
      const response = await apiRequest("PUT", `/api/users/${userId}/phone`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Phone Updated",
        description: "Employee phone numbers updated successfully.",
      });
      setEditingUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update phone numbers.",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Employee Added",
        description: "New employee added successfully.",
      });
      setIsAddingEmployee(false);
      setNewEmployee({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        mobilePhone: "",
        extension: "",
        role: "viewer",
        username: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Employee",
        description: error.message || "Failed to create new employee.",
        variant: "destructive",
      });
    },
  });

  const handleEditPhone = (user: User) => {
    setEditingUserId(user.id);
    setPhoneData({
      phone: user.phone || "",
      mobilePhone: user.mobilePhone || "",
      extension: user.extension || "",
    });
  };

  const handleSavePhone = () => {
    if (!editingUserId) return;
    
    if (!phoneData.phone) {
      toast({
        title: "Phone Required",
        description: "Main phone number is required.",
        variant: "destructive",
      });
      return;
    }

    updatePhoneMutation.mutate({
      userId: editingUserId,
      ...phoneData,
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setPhoneData({ phone: "", mobilePhone: "", extension: "" });
  };

  const initiateCall = async (phoneNumber: string, employeeName: string, extension?: string) => {
    try {
      const callNumber = extension ? `${phoneNumber},${extension}` : phoneNumber;
      
      const response = await apiRequest("POST", "/api/mightycall/call", {
        phoneNumber: callNumber,
        contactName: employeeName,
        callType: "employee",
        extension: extension || null
      });
      
      const result: MightyCallResponse = await response.json();
      
      if (result.success) {
        const displayNumber = extension ? `${phoneNumber} ext. ${extension}` : phoneNumber;
        toast({
          title: "Call Initiated",
          description: `Calling ${employeeName} at ${displayNumber}`,
        });
      } else {
        toast({
          title: "Call Failed",
          description: result.message || "Failed to initiate call",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Call Error",
        description: "Failed to connect to phone system",
        variant: "destructive",
      });
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+1-${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "sales_rep": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email || !newEmployee.phone || !newEmployee.username) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      ...newEmployee,
      password: "temp123" // Temporary password
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-brand-primary" />
          <div>
            <h1 className="text-2xl font-bold text-neutral-dark">Employee Management</h1>
            <p className="text-neutral-medium">Manage employee phone numbers and click-to-call functionality</p>
          </div>
        </div>
        
        <Dialog open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
          <DialogTrigger asChild>
            <Button className="bg-brand-primary hover:bg-brand-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First Name*"
                  value={newEmployee.firstName}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                />
                <Input
                  placeholder="Last Name*"
                  value={newEmployee.lastName}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Username*"
                value={newEmployee.username}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, username: e.target.value }))}
              />
              <Input
                placeholder="Email*"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Main Phone*"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Mobile Phone"
                value={newEmployee.mobilePhone}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, mobilePhone: e.target.value }))}
              />
              <Input
                placeholder="Extension"
                value={newEmployee.extension}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, extension: e.target.value }))}
              />
              <Select
                value={newEmployee.role}
                onValueChange={(value) => setNewEmployee(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="sales_rep">Sales Rep</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex space-x-3">
                <Button 
                  onClick={handleAddEmployee}
                  disabled={createUserMutation.isPending}
                  className="flex-1 bg-brand-primary hover:bg-brand-secondary"
                >
                  {createUserMutation.isPending ? "Adding..." : "Add Employee"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingEmployee(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user: User) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || ""} />
                    <AvatarFallback className="bg-brand-primary text-white">
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="secondary">INACTIVE</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingUserId === user.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSavePhone}
                        disabled={updatePhoneMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPhone(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-neutral-medium">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-neutral-medium">
                    <MapPin className="h-4 w-4" />
                    <span>@{user.username}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-neutral-dark">Main Phone</label>
                    {editingUserId === user.id ? (
                      <Input
                        value={phoneData.phone}
                        onChange={(e) => setPhoneData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1-555-0123"
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">
                          {user.phone ? formatPhoneNumber(user.phone) : "Not set"}
                        </span>
                        {user.phone && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => initiateCall(user.phone!, `${user.firstName} ${user.lastName}`, user.extension)}
                              className="h-6 px-2 text-brand-primary hover:text-brand-secondary"
                              title={user.extension ? `Call with extension ${user.extension}` : "Call main number"}
                            >
                              <PhoneCall className="h-3 w-3" />
                            </Button>
                            {user.extension && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => initiateCall(user.phone!, `${user.firstName} ${user.lastName} (Direct)`)}
                                className="h-6 px-2 text-neutral-medium hover:text-neutral-dark"
                                title="Call without extension"
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-dark">Mobile Phone</label>
                    {editingUserId === user.id ? (
                      <Input
                        value={phoneData.mobilePhone}
                        onChange={(e) => setPhoneData(prev => ({ ...prev, mobilePhone: e.target.value }))}
                        placeholder="+1-555-0124"
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">
                          {user.mobilePhone ? formatPhoneNumber(user.mobilePhone) : "Not set"}
                        </span>
                        {user.mobilePhone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => initiateCall(user.mobilePhone!, `${user.firstName} ${user.lastName} (Mobile)`)}
                            className="h-6 px-2 text-brand-primary hover:text-brand-secondary"
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-dark">Extension</label>
                  {editingUserId === user.id ? (
                    <Input
                      value={phoneData.extension}
                      onChange={(e) => setPhoneData(prev => ({ ...prev, extension: e.target.value }))}
                      placeholder="200"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1">
                      <span className="text-sm">
                        {user.extension ? `Ext. ${user.extension}` : "Not set"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-neutral-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-dark mb-2">No Employees Found</h3>
            <p className="text-neutral-medium mb-4">Get started by adding your first employee.</p>
            <Button 
              onClick={() => setIsAddingEmployee(true)}
              className="bg-brand-primary hover:bg-brand-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}