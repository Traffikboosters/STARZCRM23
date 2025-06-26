import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AnalyticsPage from "@/pages/analytics";
import MightyCallPage from "@/pages/mightycall";
import WorkOrders from "@/pages/work-orders";
import CareersPage from "@/pages/careers";
import DialTrackingPage from "@/pages/dial-tracking";
import PricingSheet from "@/pages/pricing-sheet";
import WidgetDemo from "@/pages/widget-demo";
import TimeZoneManager from "@/components/timezone-manager";
import SalesFunnelsPage from "@/pages/sales-funnels";
import CompetitivePricingPage from "@/pages/competitive-pricing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/mightycall" component={MightyCallPage} />
      <Route path="/work-orders" component={WorkOrders} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/dial-tracking" component={DialTrackingPage} />
      <Route path="/pricing-sheet" component={PricingSheet} />
      <Route path="/widget-demo" component={WidgetDemo} />
      <Route path="/timezone-settings" component={TimeZoneManager} />
      <Route path="/sales-funnels" component={SalesFunnelsPage} />
      <Route path="/competitive-pricing" component={CompetitivePricingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
