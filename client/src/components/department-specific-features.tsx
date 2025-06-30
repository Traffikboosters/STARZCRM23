import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Megaphone, 
  Heart, 
  Cog,
  Target,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Phone,
  Mail,
  Award,
  Settings,
  DollarSign,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star
} from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

interface DepartmentFeatureProps {
  department: string;
  employees: any[];
}

export function DepartmentSpecificFeatures({ department, employees }: DepartmentFeatureProps) {
  const [activeMetric, setActiveMetric] = useState("overview");

  const getSalesDashboard = () => (
    <div className="space-y-6">
      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">127</p>
                <p className="text-sm text-gray-600">Leads This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">$42,350</p>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">23.4%</p>
                <p className="text-sm text-gray-600">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-gray-600">Calls Made Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Team Performance</CardTitle>
          <CardDescription>Individual performance metrics for sales representatives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{employee.firstName} {employee.lastName}</h4>
                    <p className="text-sm text-gray-600">Sales Representative</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{Math.floor(Math.random() * 30) + 10}</p>
                    <p className="text-xs text-gray-500">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">${(Math.random() * 15000 + 5000).toFixed(0)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getMarketingDashboard = () => (
    <div className="space-y-6">
      {/* Marketing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Active Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-gray-600">Leads Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">5,890</p>
                <p className="text-sm text-gray-600">Email Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">4.7%</p>
                <p className="text-sm text-gray-600">CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Recent marketing campaign results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Google Ads - SEO Services", status: "Active", leads: 45, budget: "$2,500", roi: "340%" },
              { name: "Facebook - Website Design", status: "Active", leads: 28, budget: "$1,800", roi: "280%" },
              { name: "LinkedIn - B2B Outreach", status: "Paused", leads: 12, budget: "$1,200", roi: "150%" },
              { name: "Email Newsletter", status: "Active", leads: 67, budget: "$500", roi: "890%" }
            ].map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{campaign.name}</h4>
                  <p className="text-sm text-gray-600">Budget: {campaign.budget}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{campaign.leads}</p>
                    <p className="text-xs text-gray-500">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{campaign.roi}</p>
                    <p className="text-xs text-gray-500">ROI</p>
                  </div>
                  <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getHRDashboard = () => (
    <div className="space-y-6">
      {/* HR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-gray-600">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">97%</p>
                <p className="text-sm text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-gray-600">New Hires</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Management */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>Current employee status and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "Performance Review", employee: "Sarah Johnson", due: "Dec 15, 2024", priority: "high" },
              { type: "Onboarding", employee: "New Hire", due: "Jan 5, 2025", priority: "medium" },
              { type: "Training", employee: "David Chen", due: "Dec 20, 2024", priority: "low" },
              { type: "Benefits Review", employee: "All Staff", due: "Jan 1, 2025", priority: "medium" }
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{task.type}</h4>
                  <p className="text-sm text-gray-600">{task.employee}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">Due: {task.due}</div>
                  <Badge variant={
                    task.priority === "high" ? "destructive" : 
                    task.priority === "medium" ? "default" : "secondary"
                  }>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getOperationsDashboard = () => (
    <div className="space-y-6">
      {/* Operations Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">99.2%</p>
                <p className="text-sm text-gray-600">System Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">1.2s</p>
                <p className="text-sm text-gray-600">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-gray-600">Active Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-sm text-gray-600">Process Improvements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current operational status and issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { system: "CRM Database", status: "Operational", uptime: "99.8%", lastCheck: "2 min ago" },
              { system: "Email Service", status: "Operational", uptime: "99.5%", lastCheck: "1 min ago" },
              { system: "Phone System", status: "Maintenance", uptime: "98.2%", lastCheck: "5 min ago" },
              { system: "Analytics Engine", status: "Operational", uptime: "99.9%", lastCheck: "1 min ago" }
            ].map((system, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{system.system}</h4>
                  <p className="text-sm text-gray-600">Last check: {system.lastCheck}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">Uptime: {system.uptime}</div>
                  <Badge variant={
                    system.status === "Operational" ? "default" : 
                    system.status === "Maintenance" ? "secondary" : "destructive"
                  }>
                    {system.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDepartmentContent = () => {
    switch (department) {
      case "sales":
        return getSalesDashboard();
      case "marketing":
        return getMarketingDashboard();
      case "hr":
        return getHRDashboard();
      case "operations":
        return getOperationsDashboard();
      default:
        return getSalesDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-16 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <h2 className="text-2xl font-bold capitalize">{department} Department Features</h2>
            <p className="text-gray-600">Specialized tools and metrics for {department} operations</p>
          </div>
        </div>
      </div>

      {/* Department-Specific Content */}
      {renderDepartmentContent()}
    </div>
  );
}