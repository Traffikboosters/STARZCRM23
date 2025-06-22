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
import HRPortal from "./hr-portal";
import RightSidebar from "@/components/right-sidebar";
import VideoCallModal from "@/components/video-call-modal";
import EventModal from "@/components/event-modal";
import LeadNotification from "@/components/lead-notification";
import type { Contact } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("scraping");
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleLeadView = (contact: Contact) => {
    setSelectedContact(contact);
    setActiveTab("crm");
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
      case "crm":
        return <CRMAnalyticsDashboard />;
      case "campaigns":
        return <CampaignManagementView />;
      case "video":
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
      case "analytics":
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
      case "files":
        return <SecureFileManager />;
      case "chat":
        return <ChatWidget />;
      case "documents":
        return <DocumentSigning />;
      case "hr":
        return <HRPortal />;
      default:
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-lightest">
      <Header />
      
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onCreateEvent={() => setIsEventModalOpen(true)}
          onStartVideoCall={() => setIsVideoCallOpen(true)}
        />
        
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
        
        <RightSidebar 
          onJoinCall={() => setIsVideoCallOpen(true)}
          onCreateEvent={() => setIsEventModalOpen(true)}
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
    </div>
  );
}
