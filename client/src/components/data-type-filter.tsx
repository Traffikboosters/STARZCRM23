import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

interface DataTypeFilterProps {
  onFilterChange: (filter: 'all' | 'real' | 'demo') => void;
  currentFilter: 'all' | 'real' | 'demo';
  realCount: number;
  demoCount: number;
  totalCount: number;
}

export default function DataTypeFilter({ 
  onFilterChange, 
  currentFilter, 
  realCount, 
  demoCount, 
  totalCount 
}: DataTypeFilterProps) {
  const [showDemoWarning, setShowDemoWarning] = useState(true);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Lead Data Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Type Counts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Users className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Total Leads</p>
              <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">Real Customers</p>
              <p className="text-2xl font-bold text-green-600">{realCount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <TestTube className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Demo Data</p>
              <p className="text-2xl font-bold text-orange-600">{demoCount}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Filter Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Show Data Type</Label>
          <div className="flex gap-2">
            <Button
              variant={currentFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('all')}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              All Data ({totalCount})
            </Button>
            
            <Button
              variant={currentFilter === 'real' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('real')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Real Customers Only ({realCount})
            </Button>
            
            <Button
              variant={currentFilter === 'demo' ? 'outline' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('demo')}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Demo Data Only ({demoCount})
            </Button>
          </div>
        </div>

        {/* Demo Data Warning */}
        {showDemoWarning && demoCount > 0 && (
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800">Demo Data Detected</h4>
                <p className="text-sm text-orange-700 mt-1">
                  {demoCount} contacts are marked as demonstration data from lead generation testing. 
                  These include sample leads from Bark.com, Google Maps extraction, and other data sources 
                  used for platform demonstration.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    Demo Sources: Bark, Google Maps, Yellow Pages, Yelp
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDemoWarning(false)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Hide
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real Customer Info */}
        {realCount === 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Real Customer Inquiries</h4>
                <p className="text-sm text-blue-700 mt-1">
                  New customer inquiries from your chat widget, website forms, and direct submissions 
                  will appear here with "Real Customer" badges.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}