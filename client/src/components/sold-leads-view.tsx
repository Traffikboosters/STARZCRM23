import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Mail,
  Phone,
  Building,
  MapPin,
  Trophy
} from "lucide-react";
import { Contact } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

export default function SoldLeadsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch all contacts and filter for sold leads
  const { data: allContacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Filter contacts to show only sold leads
  const soldLeads = allContacts.filter(contact => 
    contact.disposition === "sold" || contact.leadStatus === "sold"
  );

  // Apply search and filter
  const filteredSoldLeads = soldLeads.filter(lead => {
    const matchesSearch = !searchTerm || 
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = sourceFilter === "all" || lead.leadSource === sourceFilter;

    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      const leadDate = new Date(lead.updatedAt || lead.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case "today":
          return leadDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return leadDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return leadDate >= monthAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesSource && matchesDate;
  });

  // Calculate metrics
  const totalSales = filteredSoldLeads.length;
  const totalRevenue = filteredSoldLeads.reduce((sum, lead) => sum + (lead.budget || 0), 0); // Budget stored as dollars
  const averageDealSize = totalSales > 0 ? totalRevenue / totalSales : 0;

  const exportSoldLeads = () => {
    const csvContent = [
      ["Name", "Company", "Email", "Phone", "Deal Value", "Source", "Date Sold"].join(","),
      ...filteredSoldLeads.map(lead => [
        `"${lead.firstName} ${lead.lastName}"`,
        `"${lead.company || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"$${(lead.budget || 0).toLocaleString()}"`,
        `"${lead.leadSource || ''}"`,
        `"${new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sold-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredSoldLeads.length} sold leads to CSV`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sold leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sold Lead Cards</h1>
          <p className="text-gray-600 mt-1">Track and manage your closed deals</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="text-center">
            <div className="text-sm font-semibold text-black">STARZ</div>
            <div className="text-xs text-black">More Traffik! More Sales!</div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Sales</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalSales}</div>
            <p className="text-xs text-green-600">Closed deals</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-blue-600">Total deal value</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Average Deal Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${averageDealSize.toLocaleString()}</div>
            <p className="text-xs text-purple-600">Per deal</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sold leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="google_maps">Google Maps</SelectItem>
              <SelectItem value="yelp">Yelp</SelectItem>
              <SelectItem value="yellowpages">Yellow Pages</SelectItem>
              <SelectItem value="bark">Bark.com</SelectItem>
              <SelectItem value="chat_widget">Chat Widget</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="website">Website</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportSoldLeads} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Results */}
      {filteredSoldLeads.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sold Lead Cards Found</h3>
            <p className="text-gray-600">
              {soldLeads.length === 0 
                ? "You haven't marked any leads as sold yet."
                : "No sold leads match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSoldLeads.map((lead) => (
            <Card key={lead.id} className="border-green-200 hover:border-green-300 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{lead.firstName} {lead.lastName}</CardTitle>
                    {lead.company && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Building className="h-3 w-3 mr-1" />
                        {lead.company}
                      </p>
                    )}
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    SOLD
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-3 w-3 mr-2" />
                    {lead.email}
                  </div>
                )}
                
                {lead.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-3 w-3 mr-2" />
                    {lead.phone}
                  </div>
                )}

                {lead.budget && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Deal Value:</span>
                    <span className="font-semibold text-green-600">
                      ${(lead.budget || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {lead.leadSource && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Source:</span>
                    <Badge variant="outline">{lead.leadSource}</Badge>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Date Sold:</span>
                  <span className="text-gray-800">
                    {new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {lead.assignedUser && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sales Rep:</span>
                    <span className="text-gray-800">
                      {lead.assignedUser.firstName} {lead.assignedUser.lastName}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}