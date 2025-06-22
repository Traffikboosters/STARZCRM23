import { 
  Calendar, 
  Users, 
  Video, 
  BarChart3, 
  Worm, 
  ServerCog, 
  Folder,
  Plus,
  UserPlus,
  VideoIcon,
  Target,
  CreditCard,
  FileText,
  Phone,
  MessageCircle,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateEvent: () => void;
  onStartVideoCall: () => void;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  onCreateEvent, 
  onStartVideoCall 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "crm", label: "CRM", icon: Users },
    { id: "campaigns", label: "Campaigns", icon: Target },
    { id: "video", label: "Video Calls", icon: Video },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "phone", label: "Phone System", icon: Phone },
    { id: "legal", label: "Work Orders", icon: FileText },
    { id: "scraping", label: "Data Scraping", icon: Worm },
    { id: "automations", label: "Automations", icon: ServerCog },
    { id: "files", label: "Secure Files", icon: Shield },
    { id: "chat", label: "Chat Widget", icon: MessageCircle },
    { id: "documents", label: "Document Signing", icon: FileText },
    { id: "hr", label: "HR Portal", icon: UserPlus },
  ];

  return (
    <nav className={cn(
      "bg-white border-r border-neutral-lighter flex-shrink-0 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn("p-4", isCollapsed && "p-2")}>
        {/* Collapse Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 hover:bg-neutral-lightest"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Traffik Boosters Branding */}
        {!isCollapsed && (
          <div className="mb-6 text-center">
            <img 
              src={traffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="w-56 h-auto mx-auto mb-3 object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <p className="text-sm font-bold text-black tracking-wide">
              More Traffik! More Sales!
            </p>
          </div>
        )}

        {/* Collapsed Logo with Slogan */}
        {isCollapsed && (
          <div className="mb-6 text-center">
            <img 
              src={traffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="w-10 h-auto mx-auto object-contain mb-2"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <p className="text-[10px] font-bold text-black tracking-tight leading-tight px-1">
              More Traffik!<br />More Sales!
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <div key={item.id} className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full space-x-3",
                    isCollapsed ? "justify-center px-2" : "justify-start",
                    isActive 
                      ? "bg-brand-primary text-white hover:bg-brand-secondary" 
                      : "text-neutral-medium hover:bg-neutral-lightest"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 
                                  bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                  pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-neutral-light uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 text-neutral-medium hover:bg-neutral-lightest"
                onClick={onCreateEvent}
              >
                <Plus className="h-4 w-4" />
                <span>New Event</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 text-neutral-medium hover:bg-neutral-lightest"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Contact</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 text-neutral-medium hover:bg-neutral-lightest"
                onClick={onStartVideoCall}
              >
                <VideoIcon className="h-4 w-4" />
                <span>Start Call</span>
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed Quick Actions */}
        {isCollapsed && (
          <div className="mt-8 space-y-2">
            <div className="relative group">
              <Button
                variant="ghost"
                className="w-full justify-center px-2 text-neutral-medium hover:bg-neutral-lightest"
                onClick={onCreateEvent}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 
                              bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              pointer-events-none whitespace-nowrap z-50">
                New Event
              </div>
            </div>
            <div className="relative group">
              <Button
                variant="ghost"
                className="w-full justify-center px-2 text-neutral-medium hover:bg-neutral-lightest"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 
                              bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              pointer-events-none whitespace-nowrap z-50">
                Add Contact
              </div>
            </div>
            <div className="relative group">
              <Button
                variant="ghost"
                className="w-full justify-center px-2 text-neutral-medium hover:bg-neutral-lightest"
                onClick={onStartVideoCall}
              >
                <VideoIcon className="h-4 w-4" />
              </Button>
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 
                              bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              pointer-events-none whitespace-nowrap z-50">
                Start Call
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
