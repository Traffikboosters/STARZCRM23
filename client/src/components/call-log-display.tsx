import { useState, useEffect } from 'react';
import { Phone, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CallLog {
  contact: string;
  number: string;
  timestamp: string;
  outcome: string;
}

interface CallLogDisplayProps {
  logs: CallLog[];
}

export function CallLogDisplay({ logs }: CallLogDisplayProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-orange-500" />
            Recent Call Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No calls logged yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Call activity will appear here when you make calls
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-orange-500" />
          Recent Call Activity
          <Badge variant="outline" className="ml-auto">
            {logs.length} call{logs.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.slice(0, 10).map((log, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {log.contact}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {log.number}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(log.timestamp)}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(log.timestamp)}
              </p>
              <Badge 
                variant={log.outcome === 'Completed' ? 'default' : 'secondary'}
                className="text-xs mt-1"
              >
                {log.outcome}
              </Badge>
            </div>
          </div>
        ))}
        
        {logs.length > 10 && (
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              + {logs.length - 10} more calls
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}