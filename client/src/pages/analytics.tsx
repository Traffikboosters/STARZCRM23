import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsView from "@/components/analytics-view";
import ScrapingAnalytics from "@/components/scraping-analytics";
import FormLeadNotifications from "@/components/form-lead-notifications";
import LeadNotificationSettings from "@/components/lead-notification-settings";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your business performance, lead generation, and campaign effectiveness
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Lead Notifications</TabsTrigger>
          <TabsTrigger value="forms">Online Forms</TabsTrigger>
          <TabsTrigger value="scraping">Lead Generation</TabsTrigger>
          <TabsTrigger value="business">Business Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <div className="space-y-6">
            <LeadNotificationSettings />
          </div>
        </TabsContent>

        <TabsContent value="forms">
          <FormLeadNotifications />
        </TabsContent>

        <TabsContent value="scraping">
          <ScrapingAnalytics />
        </TabsContent>

        <TabsContent value="business">
          <AnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}