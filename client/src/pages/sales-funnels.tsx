import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import SalesFunnelBuilder from "@/components/sales-funnel-builder";

export default function SalesFunnelsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  const company = companies[0];

  return (
    <div className="flex h-screen bg-neutral-lightest">
      <Sidebar 
        user={user} 
        company={company}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} company={company} />
        <main className="flex-1 overflow-y-auto p-6">
          <SalesFunnelBuilder />
        </main>
      </div>
    </div>
  );
}