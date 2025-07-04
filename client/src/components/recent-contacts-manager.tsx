import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowRight, Calendar, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  disposition: string;
  dispositionDate: string;
  redistributionEligibleAt: string;
  isRecentContact: boolean;
  assignedTo: number;
  dealValue: number;
  leadSource: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function RecentContactsManager() {
  const [selectedRepId, setSelectedRepId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent contacts
  const { data: recentContacts = [], isLoading: loadingRecent } = useQuery({
    queryKey: ["/api/contacts/recent"],
    queryFn: () => apiRequest("GET", "/api/contacts/recent").then(res => res.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch contacts eligible for redistribution
  const { data: eligibleContacts = [], isLoading: loadingEligible } = useQuery({
    queryKey: ["/api/contacts/redistribution-eligible"],
    queryFn: () => apiRequest("GET", "/api/contacts/redistribution-eligible").then(res => res.json()),
    refetchInterval: 30000,
  });

  // Fetch sales reps
  const { data: salesReps = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("GET", "/api/users").then(res => res.json()),
    select: (users: User[]) => users.filter(user => user.role === "sales_rep"),
  });

  // Redistribution mutation
  const redistributeMutation = useMutation({
    mutationFn: ({ contactId, newRepId }: { contactId: number; newRepId: number }) =>
      apiRequest("POST", `/api/contacts/${contactId}/redistribute`, { newRepId }),
    onSuccess: (_, { contactId }) => {
      toast({
        title: "Lead Redistributed",
        description: "Lead has been successfully redistributed to the new sales representative.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts/redistribution-eligible"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setSelectedRepId(null);
    },
    onError: (error) => {
      toast({
        title: "Redistribution Failed",
        description: "Failed to redistribute lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRedistribute = (contactId: number) => {
    if (!selectedRepId) {
      toast({
        title: "Select Sales Representative",
        description: "Please select a sales representative to redistribute the lead to.",
        variant: "destructive",
      });
      return;
    }
    redistributeMutation.mutate({ contactId, newRepId: selectedRepId });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysRemaining = (redistributionDate: string) => {
    const now = new Date();
    const redistDate = new Date(redistributionDate);
    const diffTime = redistDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Disposition Workflow</h2>
          <p className="text-muted-foreground">
            Manage recent contacts and redistribution after 10-day closing period
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Note: Sold leads are automatically routed to Sold Lead Cards Files
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Recent: {recentContacts.length}
          </Badge>
          <Badge variant="destructive" className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Eligible: {eligibleContacts.length}
          </Badge>
        </div>
      </div>

      {/* Recent Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Contacts ({recentContacts.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Leads that have been dispositioned but not sold - waiting for 10-day closing period
          </p>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : recentContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent contacts found
            </div>
          ) : (
            <div className="grid gap-4">
              {recentContacts.map((contact: Contact) => {
                const daysRemaining = getDaysRemaining(contact.redistributionEligibleAt);
                return (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </h4>
                        <Badge variant="secondary">{contact.disposition}</Badge>
                        <Badge variant="outline">{contact.leadSource}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contact.company} • {contact.email}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Dispositioned: {formatDate(contact.dispositionDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${(contact.dealValue / 100).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {daysRemaining > 0 ? (
                          <span className="text-amber-600">
                            {daysRemaining} days remaining
                          </span>
                        ) : (
                          <span className="text-red-600">
                            Redistribution eligible
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eligible for Redistribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-red-500" />
            Eligible for Redistribution ({eligibleContacts.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Leads that have exceeded the 10-day closing period and can be redistributed
          </p>
        </CardHeader>
        <CardContent>
          {loadingEligible ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : eligibleContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads eligible for redistribution
            </div>
          ) : (
            <div className="space-y-4">
              {/* Redistribution Controls */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <Select onValueChange={(value) => setSelectedRepId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales representative" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesReps.map((rep: User) => (
                        <SelectItem key={rep.id} value={rep.id.toString()}>
                          {rep.firstName} {rep.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="outline" className="text-xs">
                  {eligibleContacts.length} leads selected
                </Badge>
              </div>

              {/* Eligible Contacts List */}
              <div className="grid gap-4">
                {eligibleContacts.map((contact: Contact) => {
                  const daysOverdue = Math.abs(getDaysRemaining(contact.redistributionEligibleAt));
                  return (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-950/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </h4>
                          <Badge variant="destructive">{contact.disposition}</Badge>
                          <Badge variant="outline">{contact.leadSource}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contact.company} • {contact.email}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          {daysOverdue} days overdue for redistribution
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${(contact.dealValue / 100).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Deal Value
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleRedistribute(contact.id)}
                          disabled={!selectedRepId || redistributeMutation.isPending}
                          className="gap-1"
                        >
                          <ArrowRight className="h-3 w-3" />
                          Redistribute
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}