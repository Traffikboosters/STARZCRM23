import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Zap, CheckCircle, AlertCircle, Timer } from "lucide-react";

interface PerformanceMetrics {
  apiResponseTime: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdated: Date;
  totalRequests: number;
  avgResponseTime: number;
  slowQueries: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: 0,
    connectionStatus: 'connecting',
    lastUpdated: new Date(),
    totalRequests: 0,
    avgResponseTime: 0,
    slowQueries: 0
  });

  const [isLoading, setIsLoading] = useState(false);

  const testPerformance = async () => {
    setIsLoading(true);
    try {
      const startTime = Date.now();
      const response = await fetch('/api/contacts?limit=10');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: responseTime,
          connectionStatus: 'connected',
          lastUpdated: new Date(),
          totalRequests: prev.totalRequests + 1,
          avgResponseTime: (prev.avgResponseTime + responseTime) / 2,
          slowQueries: responseTime > 1000 ? prev.slowQueries + 1 : prev.slowQueries
        }));
      } else {
        setMetrics(prev => ({
          ...prev,
          connectionStatus: 'disconnected',
          lastUpdated: new Date()
        }));
      }
    } catch (error) {
      setMetrics(prev => ({
        ...prev,
        connectionStatus: 'disconnected',
        lastUpdated: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testPerformance();
    const interval = setInterval(testPerformance, 30000); // Test every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceRating = (time: number) => {
    if (time < 200) return { label: 'Excellent', color: 'bg-green-500', icon: Zap };
    if (time < 500) return { label: 'Good', color: 'bg-blue-500', icon: CheckCircle };
    if (time < 1000) return { label: 'Fair', color: 'bg-yellow-500', icon: Timer };
    return { label: 'Poor', color: 'bg-red-500', icon: AlertCircle };
  };

  const performance = getPerformanceRating(metrics.apiResponseTime);
  const PerformanceIcon = performance.icon;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          STARZ Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.connectionStatus)}`} />
            <span className="font-medium">Connection Status</span>
          </div>
          <Badge variant={metrics.connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {metrics.connectionStatus.toUpperCase()}
          </Badge>
        </div>

        {/* API Response Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">API Response Time</span>
            <Badge className={`${performance.color} text-white`}>
              <PerformanceIcon className="h-3 w-3 mr-1" />
              {metrics.apiResponseTime}ms - {performance.label}
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${performance.color}`}
              style={{ width: `${Math.min(100, (metrics.apiResponseTime / 1000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalRequests}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(metrics.avgResponseTime)}ms</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Performance Insights</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Slow Queries (over 1s):</span>
              <span className={metrics.slowQueries > 0 ? 'text-red-600' : 'text-green-600'}>
                {metrics.slowQueries}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{metrics.lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button 
            onClick={testPerformance} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Testing...' : 'Test Performance'}
          </Button>
        </div>

        {/* Optimization Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Optimizations Applied</span>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✓ API caching enabled (60 seconds)</li>
            <li>✓ Pagination implemented (50 records per page)</li>
            <li>✓ Reduced refresh intervals (2 minutes)</li>
            <li>✓ Response time monitoring</li>
            <li>✓ Slow query detection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}