import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Phone,
  Database,
  Wifi,
  WifiOff
} from "lucide-react";

interface LiveUpdate {
  type: string;
  platform?: string;
  leadsFound?: number;
  contactsCreated?: number;
  totalLeads?: number;
  progress?: number;
  timestamp: string;
  jobId?: number;
  status?: string;
  message?: string;
  lead?: {
    id: number;
    name: string;
    company: string;
    phone: string;
    email: string;
    leadScore?: number;
    estimatedValue?: string;
    location?: string;
    category?: string;
    industry?: string;
    position?: string;
  };
}

export default function LiveMonitoring() {
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for live monitoring');
        setIsConnected(true);
        setConnectionError(null);
        
        // Send ping to maintain connection
        wsRef.current?.send(JSON.stringify({ type: 'ping' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Live monitoring update:', data);
          
          if (data.type === 'pong') {
            // Just maintain connection, don't add to updates
            return;
          }
          
          const update: LiveUpdate = {
            ...data,
            timestamp: data.timestamp || new Date().toISOString()
          };
          
          // Handle all live monitoring events
          if (data.type === 'scraping_started' || 
              data.type === 'scraping_completed' || 
              data.type === 'new_lead' || 
              data.type === 'call_completed') {
            setUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
    }
  };

  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Send periodic ping to keep connection alive
  useEffect(() => {
    if (isConnected && wsRef.current) {
      const pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [isConnected]);

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'scraping_completed':
        return <Database className="h-4 w-4 text-green-600" />;
      case 'new_lead':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'call_completed':
        return <Phone className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Monitoring
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectionError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700 dark:text-red-300">{connectionError}</span>
            <Button size="sm" variant="outline" onClick={connectWebSocket}>
              Retry
            </Button>
          </div>
        )}

        {!isConnected && !connectionError && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Activity className="h-4 w-4 text-yellow-600 animate-spin" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">Connecting to live monitoring...</span>
          </div>
        )}

        {isConnected && updates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Monitoring active - Updates will appear here</p>
          </div>
        )}

        {updates.map((update, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {getUpdateIcon(update.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {update.type === 'scraping_started' && `${update.platform} - Starting Lead Extraction`}
                  {update.type === 'scraping_completed' && `${update.platform} - Extraction Complete`}
                  {update.type === 'new_lead' && `New Lead: ${update.platform}`}
                  {update.type === 'call_completed' && 'Call Completed'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {formatTimestamp(update.timestamp)}
                </Badge>
              </div>
              
              {update.type === 'new_lead' && update.lead && (
                <div className="space-y-1 mb-2 p-2 bg-white dark:bg-gray-700 rounded border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#e45c2b]">{update.lead.name}</span>
                    {update.lead.estimatedValue && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {update.lead.estimatedValue}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <div>{update.lead.company}</div>
                    <div className="flex gap-4 mt-1">
                      {update.lead.phone && <span>📞 {update.lead.phone}</span>}
                      {update.lead.email && <span>✉️ {update.lead.email}</span>}
                    </div>
                    {update.lead.location && <div>📍 {update.lead.location}</div>}
                    {update.lead.category && <div>🏷️ {update.lead.category}</div>}
                    {update.lead.industry && <div>🏢 {update.lead.industry}</div>}
                    {update.lead.leadScore && (
                      <div className="mt-1">
                        <span className="text-xs font-medium">Score: {update.lead.leadScore}/100</span>
                      </div>
                    )}
                  </div>
                  {update.progress && (
                    <div className="text-xs text-gray-500">
                      Progress: {update.progress}%
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {update.type === 'scraping_started' && update.message}
                {update.type === 'scraping_completed' && 
                  `Successfully extracted ${update.totalLeads} leads`}
                {update.type === 'new_lead' && !update.lead && update.message}
                {update.type === 'call_completed' && update.message}
              </p>
            </div>
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}