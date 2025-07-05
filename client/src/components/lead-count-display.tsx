import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, UserCheck, Calendar, Clock } from "lucide-react";
import type { Contact } from "@db/schema";

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
  const { data: contactsResponse, isLoading } = useQuery({
    queryKey: ["/api/contacts"],
    refetchInterval: 120000, // Reduced to 2 minutes for optimal performance
    staleTime: 20000, // Consider data fresh for 20 seconds
    gcTime: 300000, // Keep in cache for 5 minutes (renamed from cacheTime in v5)
  });

  // Extract contacts and total count from response
  const { contacts, totalLeads } = useMemo(() => {
    // Handle paginated response with total count
    if (contactsResponse && typeof contactsResponse === 'object' && 'contacts' in contactsResponse) {
      const paginatedResponse = contactsResponse as { 
        contacts: Contact[], 
        pagination?: { total: number } 
      };
      return {
        contacts: paginatedResponse.contacts || [],
        totalLeads: paginatedResponse.pagination?.total || paginatedResponse.contacts?.length || 0
      };
    }
    
    // Handle direct array response (fallback)
    if (Array.isArray(contactsResponse)) {
      return {
        contacts: contactsResponse,
        totalLeads: contactsResponse.length
      };
    }
    
    return {
      contacts: [],
      totalLeads: 0
    };
  }, [contactsResponse]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle lead count updates from various sources
        if (data.type === 'lead_count_update' || 
            data.type === 'new_lead' || 
            data.type === 'single_vendor_extraction_complete') {
          // Invalidate and refetch contacts immediately
          queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
          setLastUpdate(new Date());
          console.log('Lead count refreshed due to:', data.type);
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

  // Calculate lead statistics from current page data
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

    if (ageInHours <= 24) {
      acc.new += 1;
    } else if (ageInHours <= 48) {
      acc.followUp += 1;
    } else {
      acc.urgent += 1;
    }
    return acc;
  }, { new: 0, followUp: 0, urgent: 0 });

  if (isLoading && contacts.length === 0) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-16"></div>
      </div>
    );
  }

  // Compact variant for dashboard cards
  if (variant === "compact") {
    return (
      <div className={`text-sm ${className}`}>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-orange-500" />
          <span className="font-semibold text-lg">{totalLeads.toLocaleString()}</span>
          <span className="text-gray-600">Total Leads</span>
        </div>
      </div>
    );
  }

  // Header variant for top navigation
  if (variant === "header") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {totalLeads.toLocaleString()} Leads
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {recentLeads} New (24h)
        </Badge>
      </div>
    );
  }

  // Dashboard variant for analytics display
  if (variant === "dashboard") {
    return (
      <div className={`space-y-4 p-4 bg-white rounded-lg border ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Lead Overview</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{totalLeads.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{recentLeads}</div>
            <div className="text-sm text-gray-600">Last 24 Hours</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>New Leads:</span>
            <Badge className="bg-green-100 text-green-800">{ageBasedLeads.new}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Follow Up:</span>
            <Badge className="bg-yellow-100 text-yellow-800">{ageBasedLeads.followUp}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Urgent:</span>
            <Badge className="bg-red-100 text-red-800">{ageBasedLeads.urgent}</Badge>
          </div>
        </div>
      </div>
    );
  }

  // Default sidebar variant
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main count display */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-orange-500">
            {totalLeads.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Status breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>New (0-24h)</span>
          </div>
          <Badge className="bg-green-100 text-green-800">{ageBasedLeads.new}</Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <span>Follow Up (24-48h)</span>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">{ageBasedLeads.followUp}</Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span>Urgent (48h+)</span>
          </div>
          <Badge className="bg-red-100 text-red-800">{ageBasedLeads.urgent}</Badge>
        </div>
      </div>

      {/* Last update timestamp */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t">
        Updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}