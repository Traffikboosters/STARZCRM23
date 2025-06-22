import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsView from "@/components/analytics-view";
import ScrapingAnalytics from "@/components/scraping-analytics";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your business performance, lead generation, and campaign effectiveness
        </p>
      </div>

      <Tabs defaultValue="scraping" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scraping">Lead Generation & Campaigns</TabsTrigger>
          <TabsTrigger value="business">Business Analytics</TabsTrigger>
        </TabsList>

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