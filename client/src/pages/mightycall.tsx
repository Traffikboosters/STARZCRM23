import { useState } from "react";
import { Phone, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ComprehensivePhoneSystem } from "@/components/comprehensive-phone-system";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

interface MightyCallStatus {
  connected: boolean;
  apiAccess: boolean;
  accountId: string;
  integrationLevel: string;
  message: string;
}

export default function MightyCallPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['/api/users/me']
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies']
  });

  const company = Array.isArray(companies) ? companies[0] : null;

  const { data: status } = useQuery<MightyCallStatus>({
    queryKey: ["/api/mightycall/status"],
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user} 
        company={company} 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onTabChange={() => {}}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          user={user} 
          company={company} 
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Phone className="h-8 w-8 text-[#e45c2b]" />
                  STARZ Phone System
                </h1>
                <p className="text-muted-foreground mt-2">
                  Complete phone management with call control, hold, transfer, and conference features
                </p>
              </div>
              <div className="flex items-center gap-2">
                {status?.connected ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </div>
            </div>

            <ComprehensivePhoneSystem />
          </div>
        </main>
      </div>
    </div>
  );
}