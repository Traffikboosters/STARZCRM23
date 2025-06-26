import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Facebook, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Youtube, 
  ExternalLink,
  Users,
  TrendingUp,
  MessageCircle
} from "lucide-react";

interface SocialMediaPanelProps {
  company?: {
    name: string;
    facebookUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
  };
}

export default function SocialMediaPanel({ company }: SocialMediaPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const socialChannels = [
    {
      name: "Facebook",
      icon: Facebook,
      url: company?.facebookUrl || "https://www.facebook.com/profile.php?id=61558218231561",
      followers: "2.1K",
      engagement: "4.2%",
      color: "#1877F2",
      lastPost: "2 hours ago",
      status: "connected"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: company?.linkedinUrl || "#",
      followers: "856",
      engagement: "6.8%",
      color: "#0A66C2",
      lastPost: "1 day ago",
      status: company?.linkedinUrl ? "connected" : "pending"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: company?.twitterUrl || "#",
      followers: "1.3K",
      engagement: "3.1%",
      color: "#1DA1F2",
      lastPost: "4 hours ago",
      status: company?.twitterUrl ? "connected" : "pending"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: company?.instagramUrl || "#",
      followers: "987",
      engagement: "5.4%",
      color: "#E4405F",
      lastPost: "6 hours ago",
      status: company?.instagramUrl ? "connected" : "pending"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: company?.youtubeUrl || "#",
      followers: "432",
      engagement: "7.2%",
      color: "#FF0000",
      lastPost: "3 days ago",
      status: company?.youtubeUrl ? "connected" : "pending"
    }
  ];

  const connectedChannels = socialChannels.filter(channel => channel.status === "connected");
  const pendingChannels = socialChannels.filter(channel => channel.status === "pending");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#e45c2b]" />
            Social Media Management
          </div>
          <Badge variant="outline" className="text-xs">
            {connectedChannels.length} Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connected Channels */}
        <div>
          <h3 className="font-medium text-sm mb-3 text-gray-700">Connected Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedChannels.map((channel) => {
              const IconComponent = channel.icon;
              return (
                <Card key={channel.name} className="border-l-4" style={{ borderLeftColor: channel.color }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" style={{ color: channel.color }} />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Followers:</span>
                        <span className="font-medium">{channel.followers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engagement:</span>
                        <span className="font-medium text-green-600">{channel.engagement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Post:</span>
                        <span className="text-gray-500">{channel.lastPost}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => window.open(channel.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Profile
                      </Button>
                      <Button size="sm" className="flex-1 text-xs bg-[#e45c2b] hover:bg-[#d44d20]">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Pending Connections */}
        {pendingChannels.length > 0 && (
          <div>
            <h3 className="font-medium text-sm mb-3 text-gray-700">Connect Additional Channels</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pendingChannels.map((channel) => {
                const IconComponent = channel.icon;
                return (
                  <Button
                    key={channel.name}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <IconComponent className="h-6 w-6" style={{ color: channel.color }} />
                    <span className="text-xs">{channel.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Media Insights */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="font-semibold text-lg text-[#e45c2b]">4.8K</div>
            <div className="text-xs text-gray-600">Total Reach</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg text-[#e45c2b]">186</div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg text-[#e45c2b]">5.2%</div>
            <div className="text-xs text-gray-600">Avg Engagement</div>
          </div>
        </div>

        {/* Facebook Profile Highlight */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Facebook className="h-6 w-6 text-[#1877F2]" />
              <div>
                <h4 className="font-medium text-[#1877F2]">Facebook Business Profile</h4>
                <p className="text-xs text-gray-600">Primary social media presence for Traffik Boosters</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Profile Status:</span>
                <Badge className="bg-green-100 text-green-800 text-xs">Active & Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Recent Activity:</span>
                <span className="text-gray-600">Posted 2 hours ago</span>
              </div>
            </div>
            <Button 
              className="w-full mt-3 bg-[#1877F2] hover:bg-[#166FE5] text-white"
              onClick={() => window.open("https://www.facebook.com/profile.php?id=61558218231561", '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Facebook Profile
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}