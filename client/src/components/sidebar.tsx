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
  MessageSquare,
  Shield,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Timer,
  DollarSign,
  Filter,
  Calculator,
  Trophy,
  Brain,
  MapPin,
  Activity,
  Mail,
  Database,
  UserCheck,
  Code,
  Search,
  Mic,
  Clock,
  Lightbulb,
  Building2,
  UserX,
  Briefcase,
  Gamepad2,
  Globe,
  Package
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import LeadCountDisplay from "@/components/lead-count-display";

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
    { id: "smart-search", label: "Starz Smart Search", icon: Search },
    { id: "smart-calendar", label: "Smart Calendar", icon: Brain },
    { id: "crm", label: "CRM", icon: Users },
    { id: "crm-page", label: "CRM PowerDials Page", icon: Phone },
    { id: "sold-leads", label: "Sold Lead Cards", icon: Trophy },
    { id: "ai-scoring", label: "AI Lead Scoring", icon: Brain },
    { id: "pipeline", label: "Sales Pipeline", icon: TrendingUp },
    { id: "leaderboard", label: "Sales Leaderboard", icon: TrendingUp },
    { id: "campaigns", label: "Campaigns", icon: Target },
    { id: "video", label: "Video Calls", icon: Video },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "widget-recommendations", label: "Widget Recommendations", icon: Lightbulb },
    { id: "live-monitoring", label: "Live Monitoring", icon: BarChart3 },
    { id: "live-extraction", label: "Live Data Extractor", icon: Activity },
    { id: "vendor-selector", label: "Vendor Selector", icon: Database },
    { id: "extraction-history", label: "Live Extraction History", icon: Clock },
    { id: "high-volume-extraction", label: "High-Volume Lead Extractor", icon: Database },
    { id: "real-leads", label: "Lead Card Research", icon: Search },
    { id: "zoominfo", label: "ZoomInfo Scraping", icon: Building2 },
    { id: "dial-tracking", label: "Dial Tracking", icon: Timer },
    { id: "pricing", label: "Pricing & Profit", icon: DollarSign },
    { id: "competitive-pricing", label: "Competitive Pricing", icon: Calculator },
    { id: "service-packages", label: "Service Packages", icon: Package },
    { id: "sales-history", label: "Sales History", icon: Clock },
    { id: "high-revenue-prospects", label: "High Revenue Prospects", icon: Building2 },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "phone", label: "Phone System", icon: Phone },
    { id: "powerdials-demo", label: "PowerDials Demo", icon: Phone },
    { id: "powerdials-integration", label: "PowerDials Integration", icon: Phone },
    { id: "users", label: "User Management", icon: UserPlus },
    { id: "legal", label: "Legal Documents", icon: FileText },
    { id: "work-orders", label: "Work Orders", icon: FileText },
    { id: "scraping", label: "Data Scraping", icon: Worm },
    { id: "automations", label: "Automations", icon: ServerCog },
    { id: "files", label: "Secure Files", icon: Shield },
    { id: "chat", label: "Chat Widget", icon: MessageCircle },
    { id: "chat-backoffice", label: "Chat Back Office", icon: MessageSquare },
    { id: "documents", label: "Document Signing", icon: FileText },
    { id: "sales-funnels", label: "Sales Funnels", icon: Filter },
    { id: "locations", label: "Location Intelligence", icon: MapPin },
    { id: "marketing-strategy", label: "Marketing Strategy Builder", icon: Target },
    { id: "email-marketing", label: "Email Marketing", icon: Mail },
    { id: "sms-marketing", label: "SMS Marketing", icon: MessageSquare },
    { id: "whatsapp", label: "WhatsApp Business", icon: MessageCircle },
    { id: "sales-engagement", label: "Sales Rep Engagement", icon: Activity },
    { id: "sales-rep-dashboard", label: "Sales Rep Dashboard", icon: BarChart3 },
    { id: "technical-portal", label: "Technical Portal", icon: Code },
    { id: "voice-analysis", label: "Voice Tone Analysis", icon: Mic },
    { id: "hr", label: "HR Portal", icon: UserPlus },
    { id: "departments", label: "Department Management", icon: Building2 },
    { id: "mood-tracker", label: "Mood Tracker", icon: Activity },
    { id: "recent-contacts", label: "Recent Contacts", icon: Clock },
    { id: "dual-onboarding", label: "Employee Onboarding", icon: UserCheck },
    { id: "time-clock", label: "Employee Time Clock", icon: Clock },
    { id: "cancellation-metrics", label: "Cancellation Metrics", icon: UserX },
    { id: "career-management", label: "Career Management", icon: Briefcase },
    { id: "gamification", label: "Gamification", icon: Gamepad2 },
    { id: "website", label: "Traffik Boosters Website", icon: Globe },

  ];

  return (
    <>
      {/* Mobile Horizontal Navigation */}
      <nav className="lg:hidden bg-white border-b border-neutral-lighter w-full sticky top-0 z-30">
        <div 
          className="flex items-center px-4 py-3 gap-3 overflow-x-auto scrollbar-hide w-full mobile-nav-container" 
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            scrollBehavior: 'smooth',
            paddingRight: '60px'
          }}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  console.log(`Mobile nav clicked: ${item.id}`);
                  onTabChange(item.id);
                }}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg text-xs font-medium
                  min-w-max whitespace-nowrap flex-shrink-0 transition-all duration-200
                  border border-transparent touch-manipulation
                  ${isActive 
                    ? 'bg-green-500 text-white shadow-md border-green-600' 
                    : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                  }
                `}
                style={{ 
                  minHeight: '44px',
                  minWidth: '100px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Vertical Navigation */}
      <nav className={cn(
        "hidden lg:block bg-white border-r border-neutral-lighter flex-shrink-0 transition-all duration-300 ease-in-out",
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

          {/* Company Branding */}
          {!isCollapsed && (
            <div className="mb-6 text-center">
              <img 
                src={traffikBoostersLogo} 
                alt="Company Logo" 
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
            <div className="mb-6 text-center px-1 mt-4 relative z-10">
              <img 
                src={traffikBoostersLogo} 
                alt="Company Logo" 
                className="w-12 h-auto mx-auto object-contain mb-3"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <div className="text-[9px] font-bold text-black leading-relaxed space-y-1 tracking-tight">
                <div className="whitespace-nowrap">More Traffik!</div>
                <div className="whitespace-nowrap">More Sales!</div>
              </div>
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
                        ? "bg-green-600 text-white hover:bg-green-700" 
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

          {/* Lead Count Display */}
          {!isCollapsed && (
            <div className="mt-6">
              <LeadCountDisplay variant="sidebar" />
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
