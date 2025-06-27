import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Send, Copy, Clock, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const invitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface UserInvitation {
  id: number;
  email: string;
  role: string;
  invitationToken: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  createdAt: string;
  invitedBy: number;
  acceptedAt?: string;
}

export default function UserInvitations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      role: "user",
    },
  });

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["/api/invitations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/invitations");
      if (!response.ok) throw new Error("Failed to fetch invitations");
      return response.json();
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: async (data: InvitationFormData) => {
      const response = await apiRequest("POST", "/api/invitations", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invitation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: "Invitation Sent",
        description: "User invitation has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvitationFormData) => {
    createInvitationMutation.mutate(data);
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard.",
    });
  };

  const getStatusBadge = (invitation: UserInvitation) => {
    const isExpired = new Date() > new Date(invitation.expiresAt);
    
    if (invitation.status === "accepted") {
      return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
    }
    if (isExpired || invitation.status === "expired") {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrator",
      manager: "Manager",
      sales_rep: "Sales Representative",
      user: "User",
    };
    return roleMap[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#e45c2b] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Invitations</h2>
          <p className="text-gray-600">Send secure invitations to access Starz platform</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#e45c2b] hover:bg-[#d54823] text-white">
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send User Invitation</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="user@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="sales_rep">Sales Representative</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createInvitationMutation.isPending}
                    className="bg-[#e45c2b] hover:bg-[#d54823] text-white"
                  >
                    {createInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {invitations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations sent</h3>
              <p className="text-gray-500 text-center mb-4">
                Start by sending your first user invitation to grant access to Starz.
              </p>
            </CardContent>
          </Card>
        ) : (
          invitations.map((invitation: UserInvitation) => (
            <Card key={invitation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-[#e45c2b]/10 rounded-full">
                      <UserPlus className="h-5 w-5 text-[#e45c2b]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{invitation.email}</h3>
                        {getStatusBadge(invitation)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Role: {getRoleDisplay(invitation.role)} • 
                        Sent {formatDistanceToNow(new Date(invitation.createdAt))} ago
                      </p>
                      {invitation.status === "pending" && (
                        <p className="text-xs text-gray-400 mt-1">
                          Expires {formatDistanceToNow(new Date(invitation.expiresAt))} from now
                        </p>
                      )}
                      {invitation.acceptedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Accepted {formatDistanceToNow(new Date(invitation.acceptedAt))} ago
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {invitation.status === "pending" && new Date() <= new Date(invitation.expiresAt) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteLink(invitation.invitationToken)}
                      className="border-[#e45c2b] text-[#e45c2b] hover:bg-[#e45c2b] hover:text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}