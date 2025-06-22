import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import CalendarView from "@/components/calendar-view";
import CRMView from "@/components/crm-view";
import AnalyticsView from "@/components/analytics-view";
import FilesView from "@/components/files-view";
import DataScrapingView from "@/components/data-scraping-view";
import AutomationsView from "@/components/automations-view";
import RightSidebar from "@/components/right-sidebar";
import VideoCallModal from "@/components/video-call-modal";
import EventModal from "@/components/event-modal";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const renderMainContent = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
      case "crm":
        return <CRMView />;
      case "video":
        return <CalendarView onCreateEvent={() => setIsEventModalOpen(true)} />;
      case "analytics":
        return <AnalyticsView />;
      case "scraping":
        return <DataScrapingView />;
      case "automations":
        return <AutomationsView />;
      case "files":
        return <FilesView />;
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
