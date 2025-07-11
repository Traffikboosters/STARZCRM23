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
      url: company?.youtubeUrl || "https://www.youtube.com/@TraffikBoosters",
      followers: "892",
      engagement: "9.1%",
      color: "#FF0000",
      lastPost: "2 days ago",
      status: company?.youtubeUrl ? "connected" : "pending"
    },
    {
      name: "TikTok",
      icon: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.307-1.95-1.307-3.144V1H12.85v14.47c0 .014 0 .028-.001.042v.014a3.233 3.233 0 0 1-3.233 3.23 3.233 3.233 0 0 1-3.233-3.23 3.233 3.233 0 0 1 3.233-3.232c.34 0 .67.054.978.155V8.9a6.817 6.817 0 0 0-.978-.071A6.826 6.826 0 0 0 2.79 15.655a6.826 6.826 0 0 0 6.826 6.826 6.826 6.826 0 0 0 6.826-6.826V9.311a9.724 9.724 0 0 0 5.558 1.729V7.456a5.558 5.558 0 0 1-2.679-1.894z"/>
        </svg>
      ),
      url: company?.tiktokUrl || "https://www.tiktok.com/@traffikboosters?lang=en",
      followers: "1.2K",
      engagement: "8.4%",
      color: "#000000",
      lastPost: "1 day ago",
      status: company?.tiktokUrl ? "connected" : "pending"
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

        {/* Social Media Insights - Updated for 6 Platforms */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="font-semibold text-lg text-[#e45c2b]">12.6K</div>
            <div className="text-xs text-gray-600">Total Reach</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg text-[#e45c2b]">687</div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg text-[#e45c2b]">8.7%</div>
            <div className="text-xs text-gray-600">Avg Engagement</div>
          </div>
        </div>

        {/* YouTube Channel Highlight - New Platform */}
        {socialChannels.find(p => p.name === "YouTube")?.status === "connected" && (
          <Card className="bg-red-50 border-red-200 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Youtube className="h-6 w-6 text-[#FF0000]" />
                <div>
                  <h4 className="font-medium text-[#FF0000]">YouTube @TraffikBoosters</h4>
                  <p className="text-xs text-gray-600">Video content and tutorials for business growth</p>
                </div>
                <Badge variant="secondary" className="bg-red-500 text-white text-xs ml-auto">
                  NEW
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscribers:</span>
                  <span className="font-medium text-red-700">892</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement:</span>
                  <span className="font-medium text-green-600">9.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Upload:</span>
                  <span className="font-medium">2 days ago</span>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 w-full mt-3"
                onClick={() => window.open(socialChannels.find(p => p.name === "YouTube")?.url, '_blank')}
              >
                Visit YouTube Channel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instagram Profile Highlight - New Platform */}
        {socialChannels.find(p => p.name === "Instagram")?.status === "connected" && (
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Instagram className="h-6 w-6 text-[#E4405F]" />
                <div>
                  <h4 className="font-medium text-[#E4405F]">Instagram @traffikboosters</h4>
                  <p className="text-xs text-gray-600">Visual content and behind-the-scenes business insights</p>
                </div>
                <Badge variant="secondary" className="bg-pink-500 text-white text-xs ml-auto">
                  NEW
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers:</span>
                  <span className="font-medium text-pink-700">987</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement:</span>
                  <span className="font-medium text-green-600">5.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Post:</span>
                  <span className="font-medium">6 hours ago</span>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs h-7 w-full mt-3"
                onClick={() => window.open(socialChannels.find(p => p.name === "Instagram")?.url, '_blank')}
              >
                Visit Instagram Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Twitter/X Profile Highlight - New Platform */}
        {socialChannels.find(p => p.name === "Twitter")?.status === "connected" && (
          <Card className="bg-gradient-to-r from-blue-50 to-slate-50 border-blue-300 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                <div>
                  <h4 className="font-medium text-[#1DA1F2]">X (Twitter) @Traffikboosters</h4>
                  <p className="text-xs text-gray-600">Real-time updates and business insights</p>
                </div>
                <Badge variant="secondary" className="bg-blue-500 text-white text-xs ml-auto">
                  NEW
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers:</span>
                  <span className="font-medium text-blue-700">1.4K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement:</span>
                  <span className="font-medium text-green-600">4.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Tweet:</span>
                  <span className="font-medium">4 hours ago</span>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-500 to-slate-500 hover:from-blue-600 hover:to-slate-600 text-white text-xs h-7 w-full mt-3"
                onClick={() => window.open(socialChannels.find(p => p.name === "Twitter")?.url, '_blank')}
              >
                Visit X Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LinkedIn Company Profile Highlight - New Platform */}
        {socialChannels.find(p => p.name === "LinkedIn")?.status === "connected" && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Linkedin className="h-6 w-6 text-[#0077B5]" />
                <div>
                  <h4 className="font-medium text-[#0077B5]">LinkedIn Company Page</h4>
                  <p className="text-xs text-gray-600">Professional networking and B2B connections</p>
                </div>
                <Badge variant="secondary" className="bg-blue-600 text-white text-xs ml-auto">
                  NEW
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers:</span>
                  <span className="font-medium text-blue-700">2.5K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement:</span>
                  <span className="font-medium text-green-600">12.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="font-medium">1 day ago</span>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs h-7 w-full mt-3"
                onClick={() => window.open(socialChannels.find(p => p.name === "LinkedIn")?.url, '_blank')}
              >
                Visit LinkedIn Company Page
              </Button>
            </CardContent>
          </Card>
        )}

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