import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Bell, RefreshCw, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RealTimeUpdate {
  type: 'lead_added' | 'lead_updated' | 'lead_contacted' | 'lead_converted' | 'system_update';
  leadId?: number;
  companyName?: string;
  leadSource?: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

interface PerformanceMetrics {
  totalLeads: number;
  newLeads24h: number;
  conversionRate: number;
  lastUpdateTime: string;
  systemPerformance: 'optimal' | 'good' | 'moderate' | 'slow';
  refreshRate: number;
}

export default function RealTimeLeadManager() {
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    totalLeads: 0,
    newLeads24h: 0,
    conversionRate: 0,
    lastUpdateTime: new Date().toISOString(),
    systemPerformance: 'optimal',
    refreshRate: 45000
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('Real-time lead manager connected');
          setIsConnected(true);
          
          // Send initial metrics request
          ws.send(JSON.stringify({
            type: 'request_metrics',
            timestamp: new Date().toISOString()
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleRealTimeUpdate(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('Real-time connection closed, attempting reconnect...');
          setIsConnected(false);
          // Attempt reconnection after 30 seconds to reduce server load
          setTimeout(connectWebSocket, 30000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        return ws;
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setIsConnected(false);
        return null;
      }
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Auto-refresh mechanism for performance optimization
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshLeadData();
    }, performanceMetrics.refreshRate);

    return () => clearInterval(interval);
  }, [autoRefresh, performanceMetrics.refreshRate]);

  const handleRealTimeUpdate = useCallback((data: any) => {
    const timestamp = new Date().toISOString();
    
    // Handle different types of real-time updates
    switch (data.type) {
      case 'lead_extraction_complete':
        const newUpdate: RealTimeUpdate = {
          type: 'lead_added',
          leadId: data.leadId,
          companyName: data.companyName,
          leadSource: data.leadSource,
          timestamp,
          priority: 'high',
          message: `New lead: ${data.companyName} from ${data.leadSource}`
        };
        
        setUpdates(prev => [newUpdate, ...prev.slice(0, 19)]); // Keep last 20 updates
        
        // Refresh lead list
        queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
        
        // Show toast notification
        toast({
          title: "New Lead Added",
          description: `${data.companyName} has been added to your pipeline`,
          className: "bg-green-50 border-green-200 text-green-800"
        });
        
        // Update performance metrics
        setPerformanceMetrics(prev => ({
          ...prev,
          totalLeads: prev.totalLeads + 1,
          newLeads24h: prev.newLeads24h + 1,
          lastUpdateTime: timestamp
        }));
        break;

      case 'lead_status_update':
        setUpdates(prev => [{
          type: 'lead_updated',
          leadId: data.leadId,
          companyName: data.companyName,
          timestamp,
          priority: 'medium',
          message: `${data.companyName} status updated to ${data.status}`
        }, ...prev.slice(0, 19)]);
        
        queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
        break;

      case 'performance_metrics':
        setPerformanceMetrics(prev => ({
          ...prev,
          ...data.metrics,
          lastUpdateTime: timestamp
        }));
        break;
    }
  }, [queryClient, toast]);

  const refreshLeadData = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      // Invalidate all lead-related queries for fresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/lead-metrics"] });
      
      // Update last refresh time
      setPerformanceMetrics(prev => ({
        ...prev,
        lastUpdateTime: new Date().toISOString()
      }));
      
      // Success feedback
      toast({
        title: "Data Refreshed",
        description: "Lead cards updated with latest information",
        className: "bg-blue-50 border-blue-200 text-blue-800"
      });
      
    } catch (error) {
      console.error('Error refreshing lead data:', error);
      toast({
        title: "Refresh Error",
        description: "Failed to update lead data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, toast, refreshing]);

  const getConnectionStatus = () => {
    if (isConnected) {
      return { text: "Connected", color: "bg-green-100 text-green-800", icon: <Zap className="h-3 w-3" /> };
    } else {
      return { text: "Reconnecting", color: "bg-orange-100 text-orange-800", icon: <AlertCircle className="h-3 w-3" /> };
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'optimal': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'moderate': return 'text-yellow-600';
      case 'slow': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const status = getConnectionStatus();

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Real-Time Lead Manager
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${status.color} flex items-center gap-1`}>
              {status.icon}
              {status.text}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshLeadData}
              disabled={refreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Total Leads</p>
            <p className="text-lg font-bold text-blue-800">{performanceMetrics.totalLeads}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-600 font-medium">New (24h)</p>
            <p className="text-lg font-bold text-green-800">{performanceMetrics.newLeads24h}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-purple-600 font-medium">Conversion</p>
            <p className="text-lg font-bold text-purple-800">{performanceMetrics.conversionRate}%</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-orange-600 font-medium">Performance</p>
            <p className={`text-sm font-bold ${getPerformanceColor(performanceMetrics.systemPerformance)}`}>
              {performanceMetrics.systemPerformance.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Auto-Refresh Controls */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="auto-refresh" className="text-sm font-medium">
              Auto-refresh every {(performanceMetrics.refreshRate / 1000)}s
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Last update: {new Date(performanceMetrics.lastUpdateTime).toLocaleTimeString()}
          </p>
        </div>

        {/* Recent Updates */}
        {updates.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Recent Updates ({updates.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {updates.slice(0, 5).map((update, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-white border rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={
                        update.priority === 'critical' ? 'border-red-200 text-red-700' :
                        update.priority === 'high' ? 'border-orange-200 text-orange-700' :
                        update.priority === 'medium' ? 'border-blue-200 text-blue-700' :
                        'border-gray-200 text-gray-700'
                      }
                    >
                      {update.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-gray-700">{update.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Real-time sync active' : 'Connection lost - retrying...'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Refresh Rate: {performanceMetrics.refreshRate}ms
          </span>
        </div>
      </CardContent>
    </Card>
  );
}