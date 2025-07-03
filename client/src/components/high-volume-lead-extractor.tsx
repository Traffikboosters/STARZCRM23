import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  Play, 
  Pause, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Zap,
  BarChart3
} from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface VendorStatus {
  id: string;
  name: string;
  baseUrl: string;
  dailyLimit: number;
  currentDaily: number;
  extractionMethod: string;
  searchCategories: string[];
  regions: string[];
  isActive: boolean;
  lastExtraction: string;
  successRate: number;
}

interface ExtractionResult {
  vendor: string;
  leadsExtracted: number;
  successRate: number;
  executionTime: number;
  errors: string[];
  leadSample: any[];
}

interface ExtractorStatus {
  vendors: VendorStatus[];
  summary: {
    totalDailyCapacity: number;
    totalExtractedToday: number;
    remainingCapacity: number;
    activeVendors: number;
    totalVendors: number;
    canExtract100PerVendor: boolean;
  };
}

export default function HighVolumeLeadExtractor() {
  const [status, setStatus] = useState<ExtractorStatus | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [lastResults, setLastResults] = useState<ExtractionResult[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await apiRequest("GET", "/api/high-volume-extraction/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error loading status:", error);
    }
  };

  const executeFullExtraction = async () => {
    if (!status?.summary.canExtract100PerVendor) {
      toast({
        title: "Extraction Limit Reached",
        description: "Some vendors have reached their daily limit. Reset counters or wait until tomorrow.",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      const response = await apiRequest("POST", "/api/high-volume-extraction/execute");
      const data = await response.json();
      
      setLastResults(data.results);
      
      toast({
        title: "Extraction Complete!",
        description: `Successfully extracted ${data.totalLeads} leads from ${data.results.length} vendors`,
      });
      
      loadStatus(); // Refresh status
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Failed to execute high-volume extraction",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const executeSingleVendor = async (vendorId: string) => {
    setIsExtracting(true);
    
    try {
      const response = await apiRequest("POST", "/api/high-volume-extraction/single-vendor", {
        vendorId: vendorId,
        leadCount: 100
      });
      const data = await response.json();
      
      toast({
        title: "Vendor Extraction Complete!",
        description: `Extracted ${data.leadsExtracted} leads from ${data.vendor}`,
      });
      
      loadStatus(); // Refresh status
    } catch (error) {
      toast({
        title: "Vendor Extraction Failed",
        description: "Failed to extract leads from selected vendor",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleVendor = async (vendorId: string, isActive: boolean) => {
    try {
      await apiRequest("POST", `/api/high-volume-extraction/vendor/${vendorId}/toggle`, {
        isActive
      });
      
      toast({
        title: "Vendor Updated",
        description: `Vendor ${isActive ? 'enabled' : 'disabled'} successfully`,
      });
      
      loadStatus();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update vendor status",
        variant: "destructive"
      });
    }
  };

  const resetCounters = async () => {
    try {
      await apiRequest("POST", "/api/high-volume-extraction/reset-counters");
      
      toast({
        title: "Counters Reset",
        description: "Daily extraction counters have been reset",
      });
      
      loadStatus();
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset daily counters",
        variant: "destructive"
      });
    }
  };

  const getProgressPercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (!status) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 w-auto"
          />
          <div>
            <h2 className="text-2xl font-bold">High-Volume Lead Extractor</h2>
            <p className="text-muted-foreground">Extract 100 real leads per vendor per day</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">More Traffik! More Sales!</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Daily Capacity</p>
                <p className="text-2xl font-bold">{status.summary.totalDailyCapacity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Extracted Today</p>
                <p className="text-2xl font-bold">{status.summary.totalExtractedToday.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Remaining</p>
                <p className="text-2xl font-bold">{status.summary.remainingCapacity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Active Vendors</p>
                <p className="text-2xl font-bold">{status.summary.activeVendors}/{status.summary.totalVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={executeFullExtraction}
          disabled={isExtracting || !status.summary.canExtract100PerVendor}
          size="lg"
          className="flex-1"
        >
          {isExtracting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Extract 100 Leads from All Vendors
            </>
          )}
        </Button>

        <Button
          onClick={resetCounters}
          variant="outline"
          size="lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Daily Counters
        </Button>
      </div>

      {/* Status Alert */}
      {!status.summary.canExtract100PerVendor && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Daily Limits Reached</p>
                <p className="text-sm text-yellow-700">
                  Some vendors have reached their 100-lead daily limit. Reset counters to continue extraction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendors">Vendor Status</TabsTrigger>
          <TabsTrigger value="results">Extraction Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-4">
          <div className="grid gap-4">
            {status.vendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${vendor.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <CardTitle className="text-lg">{vendor.name}</CardTitle>
                        <CardDescription>
                          {vendor.extractionMethod} • {vendor.searchCategories.length} categories
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={vendor.successRate >= 90 ? "default" : "secondary"}>
                        {vendor.successRate}% success
                      </Badge>
                      <Switch
                        checked={vendor.isActive}
                        onCheckedChange={(checked) => toggleVendor(vendor.id, checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Progress</span>
                      <span>{vendor.currentDaily}/{vendor.dailyLimit} leads</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(vendor.currentDaily, vendor.dailyLimit)}
                      className="h-2"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => executeSingleVendor(vendor.id)}
                      disabled={isExtracting || vendor.currentDaily >= vendor.dailyLimit || !vendor.isActive}
                      size="sm"
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Extract 100 Leads
                    </Button>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Last: {new Date(vendor.lastExtraction).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <strong>Categories:</strong> {vendor.searchCategories.join(", ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {lastResults.length > 0 ? (
            <div className="grid gap-4">
              {lastResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{result.vendor}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.leadsExtracted > 0 ? "default" : "destructive"}>
                          {result.leadsExtracted} leads
                        </Badge>
                        <Badge variant="outline">
                          {result.successRate}% success
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Execution Time:</span>
                        <span>{result.executionTime}ms</span>
                      </div>
                      
                      {result.errors.length > 0 && (
                        <div className="text-sm text-red-600">
                          <strong>Errors:</strong> {result.errors.join(", ")}
                        </div>
                      )}
                      
                      {result.leadSample.length > 0 && (
                        <div className="text-sm">
                          <strong>Sample Lead:</strong> {result.leadSample[0]?.firstName} {result.leadSample[0]?.lastName} - {result.leadSample[0]?.company}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Extraction Results Yet</h3>
                <p className="text-muted-foreground text-center">
                  Execute a high-volume extraction to see detailed results here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {status.vendors.map((vendor) => (
                  <div key={vendor.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{vendor.name}</span>
                      <span className="text-sm">{vendor.successRate}%</span>
                    </div>
                    <Progress value={vendor.successRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Extraction Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {status.vendors.map((vendor) => (
                  <div key={vendor.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{vendor.name}</span>
                      <span className="text-sm">{vendor.currentDaily}/{vendor.dailyLimit}</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(vendor.currentDaily, vendor.dailyLimit)}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Extraction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {status.summary.totalExtractedToday.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Leads Extracted Today</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {status.summary.remainingCapacity.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Remaining Capacity</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round((status.summary.totalExtractedToday / status.summary.totalDailyCapacity) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Daily Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {status.summary.activeVendors}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}