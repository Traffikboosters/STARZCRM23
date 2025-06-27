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
import PaymentIntegration from "@/components/payment-integration";
import LegalDocumentsView from "@/components/legal-documents-view";
import MightyCallIntegration from "@/components/mightycall-integration";
import WorkOrders from "@/pages/work-orders";
import SecureFileManager from "@/components/secure-file-manager";
import ChatWidget from "@/components/chat-widget";
import DocumentSigning from "@/components/document-signing";
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
      case "calendar":
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
      case "crm":
        return <CRMView />;
      case "campaigns":
        return <CampaignManagementView />;
      case "video":
        return <VideoCallsView />;
      case "pipeline":
        return <SalesPipeline />;
      case "analytics":
        return <CRMAnalyticsDashboard />;
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
        return <PaymentIntegration />;
      case "legal":
        return <WorkOrders />;
      case "phone":
        return <MightyCallIntegration />;
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
      case "dial-tracking":
        return <DialTrackingDashboard />;
      case "pricing":
        return <PricingSheet />;
      case "competitive-pricing":
        return <PricingSheet />;
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
      case "email-marketing":
        return <EmailMarketing />;
      case "sms-marketing":
        return <SMSMarketing />;
      default:
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-lightest">
      <Header />
      
      <div className="flex min-h-screen">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onCreateEvent={() => setIsEventModalOpen(true)}
          onStartVideoCall={() => setIsVideoCallOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto main-content">
          <div className="container mx-auto py-6 px-4">
            {renderMainContent()}
          </div>
        </main>
        
        <RightSidebar 
          onJoinCall={() => setIsVideoCallOpen(true)}
          onCreateEvent={() => setIsEventModalOpen(true)}
          onContactClick={(contact) => setSelectedContact(contact)}
        />
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
