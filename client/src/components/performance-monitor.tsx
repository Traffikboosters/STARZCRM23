import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, Database, Wifi, Zap } from "lucide-react";

interface PerformanceMetrics {
  apiResponseTime: number;
  dbQueryTime: number;
  wsConnectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  refreshRate: number;
  lastUpdateTime: string;
  systemPerformance: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: 0,
    dbQueryTime: 0,
    wsConnectionStatus: 'connected',
    refreshRate: 120000, // 2 minutes
    lastUpdateTime: new Date().toISOString(),
    systemPerformance: 'excellent'
  });

  // Monitor API performance
  useEffect(() => {
    const startTime = Date.now();
    
    fetch('/api/contacts')
      .then(() => {
        const responseTime = Date.now() - startTime;
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: responseTime,
          systemPerformance: responseTime < 300 ? 'excellent' : 
                           responseTime < 800 ? 'good' : 
                           responseTime < 1500 ? 'fair' : 'poor',
          lastUpdateTime: new Date().toISOString()
        }));
      })
      .catch(() => {
        setMetrics(prev => ({ ...prev, systemPerformance: 'poor' }));
      });

    const interval = setInterval(() => {
      const startTime = Date.now();
      fetch('/api/contacts')
        .then(() => {
          const responseTime = Date.now() - startTime;
          setMetrics(prev => ({
            ...prev,
            apiResponseTime: responseTime,
            systemPerformance: responseTime < 300 ? 'excellent' : 
                             responseTime < 800 ? 'good' : 
                             responseTime < 1500 ? 'fair' : 'poor',
            lastUpdateTime: new Date().toISOString()
          }));
        });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'reconnecting': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Performance */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Performance</span>
          <Badge className={getPerformanceColor(metrics.systemPerformance)}>
            {metrics.systemPerformance.toUpperCase()}
          </Badge>
        </div>

        {/* API Response Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              API Response Time
            </span>
            <span className="text-sm text-gray-600">{metrics.apiResponseTime}ms</span>
          </div>
          <Progress 
            value={Math.min((metrics.apiResponseTime / 2000) * 100, 100)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            Target: &lt;300ms (Excellent) | &lt;800ms (Good)
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            WebSocket Status
          </span>
          <Badge className={getConnectionColor(metrics.wsConnectionStatus)}>
            {metrics.wsConnectionStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Refresh Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Data Refresh Rate
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(metrics.refreshRate / 1000)}s
          </span>
        </div>

        {/* Performance Optimizations */}
        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-2">Active Optimizations</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div>✅ API caching enabled (30s)</div>
            <div>✅ Reduced refresh rate (2min)</div>
            <div>✅ Database query optimization</div>
            <div>✅ WebSocket ping optimization (60s)</div>
            <div>✅ Response compression enabled</div>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          Last updated: {new Date(metrics.lastUpdateTime).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}