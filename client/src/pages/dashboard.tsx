import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import CalendarView from "@/components/calendar-view";
import CRMView from "@/components/crm-view";
import CampaignManagementView from "@/components/campaign-management-view";
import ScrapingAnalytics from "@/components/scraping-analytics";
import FilesView from "@/components/files-view";
import ScrapingConfigurationDemo from "@/components/scraping-configuration-demo";
import CRMAnalyticsDashboard from "@/components/crm-analytics-dashboard";
import AutomationsView from "@/components/automations-view";
import Payments from "@/pages/payments";
import LegalDocumentsView from "@/components/legal-documents-view";
import { ComprehensivePhoneSystem } from "@/components/comprehensive-phone-system";
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
import MoodTracker from "@/components/mood-tracker";
import SalesRepDashboard from "@/components/sales-rep-dashboard";
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
      case "calendar":
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
      case "crm":
        return <CRMView />;
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
          <div className="space-y-6">
            <CRMAnalyticsDashboard />
            <div className="flex justify-center">
              <EmailNotificationTest />
            </div>
          </div>
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
        return <ComprehensivePhoneSystem />;
      case "users":
        return currentUser ? <UserManagement currentUser={currentUser as any} /> : <div>Loading...</div>;
      case "files":
        return <SecureFileManager />;
      case "chat":
        return <ChatWidget />;
      case "chat-backoffice":
        return <ChatWidgetBackOffice />;
      case "documents":
        return <DocumentSigning />;
      case "hr":
        return <HRPortal />;
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
      case "mood-tracker":
        return currentUser ? <MoodTracker currentUserId={(currentUser as any).id} /> : <div>Loading...</div>;
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

      default:
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
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
            {renderMainContent()}
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
