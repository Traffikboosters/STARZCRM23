import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AnalyticsPage from "@/pages/analytics";
import PowerDialsPage from "@/pages/powerdials";
import WorkOrders from "@/pages/work-orders";
import CareersPage from "@/pages/careers";
import DialTrackingPage from "@/pages/dial-tracking";
import PricingSheet from "@/pages/pricing-sheet";
import WidgetDemo from "@/pages/widget-demo";
import TimeZoneManager from "@/components/timezone-manager";
import SalesFunnelsPage from "@/pages/sales-funnels";
import CompetitivePricingPage from "@/pages/competitive-pricing";
import AcceptInvitation from "@/pages/accept-invitation";
import LandingPage from "@/pages/landing";
import Payments from "@/pages/payments";
import DownloadPlugin from "@/pages/download-plugin";
import STARZLandingPage from "@/components/starz-landing-page";
import VendorSelectorPage from "@/pages/vendor-selector";
import TimeClockPage from "@/pages/time-clock";
import HRPortal from "@/pages/hr-portal";
import CancellationMetrics from "@/components/cancellation-metrics";
import TraffikBoostersWebsite from "@/pages/traffik-boosters-website";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/starz-landing" component={STARZLandingPage} />
      <Route path="/traffik-boosters" component={TraffikBoostersWebsite} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/powerdials" component={PowerDialsPage} />
      <Route path="/work-orders" component={WorkOrders} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/dial-tracking" component={DialTrackingPage} />
      <Route path="/pricing-sheet" component={PricingSheet} />
      <Route path="/widget-demo" component={WidgetDemo} />
      <Route path="/timezone-settings" component={TimeZoneManager} />
      <Route path="/sales-funnels" component={SalesFunnelsPage} />
      <Route path="/competitive-pricing" component={CompetitivePricingPage} />
      <Route path="/payments" component={Payments} />
      <Route path="/vendor-selector" component={VendorSelectorPage} />
      <Route path="/time-clock" component={TimeClockPage} />
      <Route path="/hr-portal" component={HRPortal} />
      <Route path="/cancellation-metrics" component={CancellationMetrics} />
      <Route path="/accept-invitation" component={AcceptInvitation} />
      <Route path="/download-plugin" component={DownloadPlugin} />
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
