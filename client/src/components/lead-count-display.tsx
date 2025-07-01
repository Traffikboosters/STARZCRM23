import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Clock, Target, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import type { Contact } from "@shared/schema";

interface LeadCountDisplayProps {
  variant?: "sidebar" | "header" | "dashboard" | "compact";
  className?: string;
}

export default function LeadCountDisplay({ variant = "sidebar", className = "" }: LeadCountDisplayProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Fetch contacts with optimized refresh
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    refetchInterval: 120000, // Reduced to 2 minutes for optimal performance
    staleTime: 20000, // Consider data fresh for 20 seconds
    gcTime: 300000, // Keep in cache for 5 minutes (renamed from cacheTime in v5)
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle lead count updates from email submissions
        if (data.type === 'lead_count_update' || data.type === 'new_lead') {
          // Invalidate and refetch contacts immediately
          queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    return () => {
      socket.close();
    };
  }, [queryClient]);

  // Update timestamp when data changes
  useEffect(() => {
    if (contacts.length > 0) {
      setLastUpdate(new Date());
    }
  }, [contacts.length]);

  // Calculate lead statistics
  const totalLeads = contacts.length;
  const newLeads = contacts.filter(contact => contact.leadStatus === 'new').length;
  const qualifiedLeads = contacts.filter(contact => contact.leadStatus === 'qualified').length;
  const todayLeads = contacts.filter(contact => {
    const today = new Date();
    const contactDate = new Date(contact.createdAt);
    return contactDate.toDateString() === today.toDateString();
  }).length;

  // Get recent leads (last 24 hours)
  const recentLeads = contacts.filter(contact => {
    const now = new Date();
    const contactDate = new Date(contact.createdAt);
    const hoursDiff = (now.getTime() - contactDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  }).length;

  // Calculate age-based lead categories
  const ageBasedLeads = contacts.reduce((acc, contact) => {
    const now = new Date();
    const contactDate = new Date(contact.createdAt);
    const ageInHours = (now.getTime() - contactDate.getTime()) / (1000 * 60 * 60);
    const ageInDays = ageInHours / 24;

    if (ageInHours <= 24) {
      acc.newLeads++;
    } else if (ageInDays <= 3) {
      acc.followUpLeads++;
    } else {
      acc.urgentLeads++;
    }
    return acc;
  }, { newLeads: 0, followUpLeads: 0, urgentLeads: 0 });

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Users className="h-3 w-3 mr-1" />
          {totalLeads} Leads
        </Badge>
        {newLeads > 0 && (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            {newLeads} New
          </Badge>
        )}
      </div>
    );
  }

  if (variant === "header") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-lg">
          <Users className="h-4 w-4 text-orange-600" />
          <span className="font-medium text-orange-800">{totalLeads} Total Leads</span>
        </div>
        {newLeads > 0 && (
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg">
            <Target className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-800">{newLeads} New</span>
          </div>
        )}
        <div className="text-xs text-gray-500">
          Updated: {format(lastUpdate, 'HH:mm')}
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-gray-900">{newLeads}</p>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-gray-900">{qualifiedLeads}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{todayLeads}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Lead Overview</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs opacity-90">Total Leads:</span>
            <span className="font-bold text-lg">{totalLeads}</span>
          </div>
          {isLoading && (
            <div className="text-xs opacity-75">Updating...</div>
          )}
        </div>
      </div>

      {/* Age-Based Lead Breakdown */}
      <div className="space-y-2">
        <div className="bg-green-50 border border-green-200 p-2 rounded animate-pulse">
          <div className="flex justify-between items-center">
            <span className="text-xs text-green-600">New (0-24h):</span>
            <span className="font-bold text-green-700 text-lg">{ageBasedLeads.newLeads}</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-1 mt-1">
            <div 
              className="bg-green-500 h-1 rounded-full" 
              style={{ width: `${totalLeads > 0 ? (ageBasedLeads.newLeads / totalLeads) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
          <div className="flex justify-between items-center">
            <span className="text-xs text-yellow-600">Follow Up (1-3d):</span>
            <span className="font-bold text-yellow-700 text-lg">{ageBasedLeads.followUpLeads}</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-1 mt-1">
            <div 
              className="bg-yellow-500 h-1 rounded-full" 
              style={{ width: `${totalLeads > 0 ? (ageBasedLeads.followUpLeads / totalLeads) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 p-2 rounded">
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-600">Urgent (3+ days):</span>
            <span className="font-bold text-red-700 text-lg">{ageBasedLeads.urgentLeads}</span>
          </div>
          <div className="w-full bg-red-200 rounded-full h-1 mt-1">
            <div 
              className="bg-red-500 h-1 rounded-full" 
              style={{ width: `${totalLeads > 0 ? (ageBasedLeads.urgentLeads / totalLeads) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-2 rounded">
        <div className="flex justify-between items-center">
          <span className="text-xs text-blue-600">Recent (24h):</span>
          <span className="font-semibold text-blue-700">{recentLeads}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-blue-600">Today:</span>
          <span className="font-semibold text-blue-700">{todayLeads}</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Last updated: {format(lastUpdate, 'HH:mm:ss')}
      </div>
    </div>
  );
}

// Real-time lead count hook for other components
export function useLeadCount() {
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    refetchInterval: 30000,
  });

  return {
    totalLeads: contacts.length,
    newLeads: contacts.filter(contact => contact.leadStatus === 'new').length,
    qualifiedLeads: contacts.filter(contact => contact.leadStatus === 'qualified').length,
    todayLeads: contacts.filter(contact => {
      const today = new Date();
      const contactDate = new Date(contact.createdAt);
      return contactDate.toDateString() === today.toDateString();
    }).length,
    recentLeads: contacts.filter(contact => {
      const now = new Date();
      const contactDate = new Date(contact.createdAt);
      const hoursDiff = (now.getTime() - contactDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    }).length,
  };
}