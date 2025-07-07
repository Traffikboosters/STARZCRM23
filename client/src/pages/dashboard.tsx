import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import ErrorBoundary from "@/components/error-boundary";

import SmartCalendarIntegration from "@/components/smart-calendar-integration";
import CRMView from "@/components/crm-view-simple";
import CampaignManagementView from "@/components/campaign-management-view";
import ScrapingAnalytics from "@/components/scraping-analytics";
import FilesView from "@/components/files-view";
import ScrapingConfigurationDemo from "@/components/scraping-configuration-demo";
import CRMAnalyticsDashboard from "@/components/crm-analytics-dashboard";
import AutomationsView from "@/components/automations-view";
import Payments from "@/pages/payments";
import LegalDocumentsView from "@/components/legal-documents-view";
import DualPhoneSystem from "@/components/dual-phone-system";
import WorkOrders from "@/pages/work-orders";
import SecureFileManager from "@/components/secure-file-manager";
import ChatWidget from "@/components/chat-widget";
import DocumentSigning from "@/components/document-signing";
import LeadSourceTracker from "@/components/lead-source-tracker";
import LeadSourceTracking from "@/components/lead-source-tracking";
import VideoCallsView from "@/components/video-calls-view";
import SalesPipeline from "@/components/sales-pipeline";
import SalesFunnelBuilder from "@/components/sales-funnel-builder";
import HRPortal from "./hr-portal";
import RightSidebar from "@/components/right-sidebar";
import { UserManagement } from "@/components/user-management";
import { SalesRepAnalytics } from "@/components/sales-rep-analytics";
import { DialTrackingDashboard } from "@/components/dial-tracking-dashboard";
import PricingSheet from "@/pages/pricing-sheet";
import SalesLeaderboard from "@/components/sales-leaderboard";
import VideoCallModal from "@/components/video-call-modal";
import EventModal from "@/components/event-modal";
import ContactDetailsModal from "@/components/contact-details-modal";
import LeadNotification from "@/components/lead-notification";
import LiveMonitoring from "@/components/live-monitoring";
import { AILeadScoring } from "@/components/ai-lead-scoring";
import { LocationTracker } from "@/components/location-tracker";
import LiveDataExtractor from "@/components/live-data-extractor";
import EmailNotificationSystem from "@/components/email-notification-system";
import EmailMarketing from "@/components/email-marketing";
import SMSMarketing from "@/components/sms-marketing";
import { ChatWidgetBackOffice } from "@/components/chat-widget-backoffice";
import SalesRepEngagement from "@/components/sales-rep-engagement";
import { DualOnboardingPortal } from "@/components/dual-onboarding-portal";
import EmailNotificationTest from "@/components/email-notification-test";
import TechnicalPortal from "@/components/technical-portal";
import { VoiceToneAnalysis } from "@/components/voice-tone-analysis";
import VoiceToneAnalysisEnhanced from "@/components/voice-tone-analysis-enhanced";
import PowerDialsDemo from "@/components/powerdials-demo";
import MoodTracker from "@/components/mood-tracker";
import RecentContactsManager from "@/components/recent-contacts-manager";
import SalesRepDashboard from "@/components/sales-rep-dashboard";
import { CareerManagement } from "@/components/career-management";
import GamificationSystemClean from "@/components/gamification-system-clean";
import EmployeeTimeClock from "@/components/employee-time-clock";

import { HighRevenueProspects } from "@/components/high-revenue-prospects-clean";
import { DepartmentManagement } from "@/components/department-management";
import SmartSearchAI from "@/components/smart-search-ai";
import SoldLeadsView from "@/components/sold-leads-view";
import WhatsAppBusiness from "@/components/whatsapp-business-clean";
import { LiveExtractionHistory } from "@/components/live-extraction-history";
import RealLeadExtractor from "@/components/real-lead-extractor";
import { PersonalizedDashboardWidgets } from "@/components/personalized-dashboard-widgets";
import ZoomInfoScraper from "@/components/zoominfo-scraper";
import UnifiedVendorSelector from "@/components/unified-vendor-selector";
import CancellationMetrics from "@/components/cancellation-metrics";
import HighVolumeLeadExtractor from "@/components/high-volume-lead-extractor";
import PerformanceMonitor from "@/components/performance-monitor";
import { MarketingStrategyBuilder } from "@/components/marketing-strategy-builder";
import TraffikBoostersWebsite from "@/pages/traffik-boosters-website";
import SalesHistory from "@/components/sales-history";
import ServicePackages from "@/components/service-packages";
import type { Contact } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("crm");
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const handleLeadView = (contact: Contact) => {
    setSelectedContact(contact);
    setActiveTab("crm");
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "smart-search":
        return <SmartSearchAI isOpen={true} onClose={() => setActiveTab("dashboard")} onNavigate={(path) => console.log('Navigate to:', path)} />;

      case "smart-calendar":
        return (
          <ErrorBoundary fallback={<div>Something went wrong in the smart calendar.</div>}>
            <SmartCalendarIntegration />
          </ErrorBoundary>
        );
      case "crm":
        return (
          <ErrorBoundary fallback={<div>Something went wrong in the CRM view.</div>}>
            <CRMView />
          </ErrorBoundary>
        );
      case "sold-leads":
        return <SoldLeadsView />;
      case "campaigns":
        return <CampaignManagementView />;
      case "video":
        return <VideoCallsView />;
      case "pipeline":
        return <SalesPipeline />;
      case "analytics":
        return (
          <ErrorBoundary fallback={<div>Something went wrong in the analytics dashboard.</div>}>
            <div className="space-y-6">
              <CRMAnalyticsDashboard />
              <div className="flex justify-center">
                <PerformanceMonitor />
              </div>
              <div className="flex justify-center">
                <EmailNotificationTest />
              </div>
            </div>
          </ErrorBoundary>
        );
      case "widget-recommendations":
        return (
          <PersonalizedDashboardWidgets 
            userRole={'sales_rep'} 
            userId={1} 
          />
        );
      case "lead-sources":
        return <LeadSourceTracker />;
      case "live-monitoring":
        return <LiveMonitoring />;
      case "sales-analytics":
        return <SalesRepAnalytics />;
      case "scraping-analytics":
        return <ScrapingAnalytics />;
      case "scraping":
        return <ScrapingConfigurationDemo />;
      case "automations":
        return <AutomationsView />;
      case "payments":
        return <Payments />;
      case "legal":
        return <LegalDocumentsView />;
      case "work-orders":
        return <WorkOrders />;
      case "phone":
        return currentUser ? (
          <ErrorBoundary fallback={<div>Something went wrong in the phone system.</div>}>
            <DualPhoneSystem />
          </ErrorBoundary>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading phone system…</p>
            </div>
          </div>
        );
      case "users":
        return currentUser ? (
          <ErrorBoundary fallback={<div>Something went wrong in user management.</div>}>
            <UserManagement currentUser={currentUser as any} />
          </ErrorBoundary>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading user management…</p>
            </div>
          </div>
        );
      case "files":
        return <SecureFileManager />;
      case "chat":
        return <ChatWidget />;
      case "chat-backoffice":
        return <ChatWidgetBackOffice />;
      case "documents":
        return <DocumentSigning />;
      case "hr":
        return (
          <ErrorBoundary fallback={<div>Something went wrong in the HR portal.</div>}>
            <HRPortal />
          </ErrorBoundary>
        );
      case "departments":
        return <DepartmentManagement />;
      case "dial-tracking":
        return <DialTrackingDashboard />;
      case "pricing":
        return <PricingSheet />;
      case "competitive-pricing":
        return <PricingSheet />;
      case "high-revenue-prospects":
        return <HighRevenueProspects />;
      case "sales-funnels":
        return <SalesFunnelBuilder />;
      case "leaderboard":
        return <SalesLeaderboard />;
      case "ai-scoring":
        return <AILeadScoring />;
      case "locations":
        return <LocationTracker />;
      case "live-extraction":
        return <LiveDataExtractor />;
      case "vendor-selector":
        return <UnifiedVendorSelector />;
      case "email-marketing":
        return <EmailMarketing />;
      case "sms-marketing":
        return <SMSMarketing />;
      case "sales-engagement":
        return <SalesRepEngagement />;
      case "sales-rep-dashboard":
        return <SalesRepDashboard currentUser={currentUser} />;
      case "technical-portal":
        return <TechnicalPortal />;
      case "dual-onboarding":
        return <DualOnboardingPortal />;
      case "voice-analysis":
        return <VoiceToneAnalysisEnhanced />;
      case "powerdials-demo":
        return <PowerDialsDemo />;
      case "mood-tracker":
        return <MoodTracker />;
      case "recent-contacts":
        return <RecentContactsManager />;
      case "whatsapp":
        return <WhatsAppBusiness />;
      case "real-leads":
        return <RealLeadExtractor />;
      case "zoominfo":
        return <ZoomInfoScraper />;
      case "extraction-history":
        return <LiveExtractionHistory />;
      case "time-clock":
        return <EmployeeTimeClock />;
      case "cancellation-metrics":
        return <CancellationMetrics />;
      case "marketing-strategy":
        return <MarketingStrategyBuilder />;
      case "career-management":
        return <CareerManagement />;
      case "gamification":
        return <GamificationSystemClean />;
      case "high-volume-extraction":
        return <HighVolumeLeadExtractor />;
      case "website":
        return <TraffikBoostersWebsite />;
      case "sales-history":
        return (
          <ErrorBoundary fallback={<div>Something went wrong in sales history.</div>}>
            <SalesHistory />
          </ErrorBoundary>
        );
      case "service-packages":
        return (
          <ErrorBoundary fallback={<div>Something went wrong in the service packages.</div>}>
            <ServicePackages />
          </ErrorBoundary>
        );

      default:
        // If activeTab is not empty and not recognized, show error message
        if (activeTab && activeTab !== "dashboard") {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Unknown View</h3>
                <p className="text-muted-foreground mb-4">The requested page "{activeTab}" could not be found.</p>
                <button 
                  onClick={() => setActiveTab("dashboard")} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          );
        }
        // Default to Smart Calendar Integration
        return (
          <ErrorBoundary fallback={<div>Something went wrong in the smart calendar.</div>}>
            <SmartCalendarIntegration />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-lightest">
      <Header onTabChange={setActiveTab} />
      
      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onCreateEvent={() => setIsEventModalOpen(true)}
          onStartVideoCall={() => setIsVideoCallOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="container mx-auto py-3 lg:py-6 px-2 lg:px-4">
            <ErrorBoundary>
              {renderMainContent()}
            </ErrorBoundary>
          </div>
        </main>
        
        <div className="hidden xl:block">
          <RightSidebar 
            onJoinCall={() => setIsVideoCallOpen(true)}
            onCreateEvent={() => setIsEventModalOpen(true)}
            onContactClick={(contact) => setSelectedContact(contact)}
          />
        </div>
      </div>

      <VideoCallModal 
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
      />
      
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
      
      <ContactDetailsModal
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      {/* Email Notification System */}
      <EmailNotificationSystem />
    </div>
  );
}
