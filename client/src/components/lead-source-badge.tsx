import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Search, 
  Building, 
  Globe, 
  Phone, 
  Users, 
  Target, 
  Mail, 
  TrendingUp 
} from "lucide-react";

interface LeadSourceBadgeProps {
  source: string;
  timestamp?: Date | string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const sourceConfig = {
  'google_maps': {
    name: 'Google Maps',
    icon: MapPin,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    description: 'Google Maps API extraction'
  },
  'google_maps_enhanced': {
    name: 'Google Maps+',
    icon: Search,
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
    description: 'Enhanced Google Maps with email extraction'
  },
  'bark_com': {
    name: 'Bark.com',
    icon: Building,
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    description: 'Bark.com lead marketplace'
  },
  'business_insider': {
    name: 'Business Insider',
    icon: Globe,
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    description: 'Business Insider directory'
  },
  'yellowpages': {
    name: 'Yellow Pages',
    icon: Phone,
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    description: 'Yellow Pages directory'
  },
  'whitepages': {
    name: 'White Pages',
    icon: Users,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    description: 'White Pages directory'
  },
  'yelp': {
    name: 'Yelp',
    icon: Target,
    color: 'bg-red-100 text-red-700 hover:bg-red-200',
    description: 'Yelp business directory'
  },
  'chat_widget': {
    name: 'Chat Widget',
    icon: Mail,
    color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    description: 'Website chat widget submission'
  },
  'manual_entry': {
    name: 'Manual Entry',
    icon: Users,
    color: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    description: 'Manually entered contact'
  },
  'referral': {
    name: 'Referral',
    icon: TrendingUp,
    color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    description: 'Referred by existing client'
  },
  'website_form': {
    name: 'Website Form',
    icon: Globe,
    color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
    description: 'Website contact form submission'
  }
};

export default function LeadSourceBadge({ 
  source, 
  timestamp, 
  size = "sm", 
  showIcon = true 
}: LeadSourceBadgeProps) {
  const config = sourceConfig[source as keyof typeof sourceConfig] || {
    name: source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: Users,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    description: 'Unknown source'
  };

  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5", 
    lg: "h-4 w-4"
  };

  const formatTimestamp = (ts: Date | string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-1">
      <Badge 
        variant="secondary" 
        className={`${config.color} ${sizeClasses[size]} flex items-center gap-1 font-medium`}
        title={config.description}
      >
        {showIcon && <Icon className={iconSizes[size]} />}
        {config.name}
      </Badge>
      {timestamp && (
        <span className="text-xs text-muted-foreground ml-1">
          {formatTimestamp(timestamp)}
        </span>
      )}
    </div>
  );
}

export function getLeadSourceIcon(source: string) {
  const config = sourceConfig[source as keyof typeof sourceConfig];
  return config ? config.icon : Users;
}

export function getLeadSourceName(source: string) {
  const config = sourceConfig[source as keyof typeof sourceConfig];
  return config ? config.name : source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function getLeadSourceColor(source: string) {
  const config = sourceConfig[source as keyof typeof sourceConfig];
  return config ? config.color : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
}