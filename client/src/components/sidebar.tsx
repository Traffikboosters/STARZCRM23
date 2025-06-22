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
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  ];

  return (
    <nav className="w-64 bg-white border-r border-neutral-lighter flex-shrink-0">
      <div className="p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start space-x-3",
                  isActive 
                    ? "bg-brand-primary text-white hover:bg-brand-secondary" 
                    : "text-neutral-medium hover:bg-neutral-lightest"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Quick Actions */}
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
      </div>
    </nav>
  );
}
