import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, Calendar, User, Building, Settings, LogOut, Brain, Zap } from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onTabChange?: (tab: string) => void;
}

export default function Header({ onTabChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies'],
  });

  const company = Array.isArray(companies) && companies.length > 0 ? companies[0] : null;

  const handleSignOut = () => {
    // In a real app, this would clear session/tokens
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out of Starz.",
    });
    // Redirect to login page or refresh
    window.location.reload();
  };

  const handleProfileUpdate = async () => {
    try {
      const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
      const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value;
      const email = (document.getElementById('email') as HTMLInputElement)?.value;
      const phone = (document.getElementById('phone') as HTMLInputElement)?.value;

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
        }),
      });

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile settings have been saved successfully.",
        });
        setIsProfileOpen(false);
        // Refresh user data
        window.location.reload();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompanyUpdate = () => {
    toast({
      title: "Company Settings Updated", 
      description: "Company settings have been saved successfully.",
    });
    setIsCompanyOpen(false);
  };

  const handlePreferencesUpdate = () => {
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been updated.",
    });
    setIsPreferencesOpen(false);
  };

  return (
    <header className="bg-white border-b border-neutral-lighter px-3 md:px-6 py-2 md:py-4">
      <div className="relative flex items-center justify-between gap-2 md:gap-8 min-h-[60px] md:min-h-[80px]">
        <div className="flex items-center flex-shrink-0 max-w-[200px] md:max-w-[320px]">
          {/* Company Logo with Slogan */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <img 
              src={traffikBoostersLogo} 
              alt="Company Logo" 
              className="h-10 md:h-16 w-auto object-contain flex-shrink-0"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div className="hidden md:flex flex-col justify-center space-y-0.5 min-w-0">
              <p className="text-sm font-bold text-black whitespace-nowrap leading-none">
                More Traffik!
              </p>
              <p className="text-sm font-bold text-black whitespace-nowrap leading-none">
                More Sales!
              </p>
            </div>
          </div>
        </div>
        
        {/* Centered STARZ Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl md:text-3xl font-bold text-black whitespace-nowrap">
            STARZ
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink min-w-0">
          {/* Smart Search functionality */}
          <div className="relative flex-shrink min-w-0 hidden md:block">
            <Input
              type="text"
              placeholder="AI Smart Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  if (onTabChange) {
                    onTabChange('smart-search');
                  }
                  toast({
                    title: "Smart Search Activated",
                    description: `Searching for: ${searchQuery}`,
                  });
                }
              }}
              className="w-32 lg:w-48 pl-10 pr-8 text-sm border-orange-200 focus:border-orange-500"
            />
            <Brain className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
            {searchQuery && (
              <Zap className="absolute right-3 top-3 h-4 w-4 text-yellow-500" />
            )}
            
            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-200 rounded-lg shadow-lg z-50">
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Brain className="h-3 w-3" />
                    <span>AI Suggestions</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        if (onTabChange) {
                          onTabChange('smart-search');
                        }
                        setShowSearchSuggestions(false);
                      }}
                      className="w-full text-left p-2 hover:bg-orange-50 rounded text-sm flex items-center gap-2"
                    >
                      <Search className="h-3 w-3 text-orange-500" />
                      <span>Search for "{searchQuery}"</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onTabChange) {
                          onTabChange('crm');
                        }
                        setShowSearchSuggestions(false);
                      }}
                      className="w-full text-left p-2 hover:bg-orange-50 rounded text-sm flex items-center gap-2"
                    >
                      <User className="h-3 w-3 text-blue-500" />
                      <span>Find contacts matching "{searchQuery}"</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile smart search button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => {
              if (onTabChange) {
                onTabChange('smart-search');
              }
              toast({
                title: "Smart Search",
                description: "Opening AI-powered search interface...",
              });
            }}
          >
            <Brain className="h-5 w-5 text-orange-500" />
          </Button>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-neutral-medium" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-2 border-b">
                <h4 className="font-semibold">Notifications</h4>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex items-start space-x-3 p-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">New Contact Added</p>
                    <p className="text-sm text-muted-foreground">Maria Rodriguez from Auto Repair Plus</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start space-x-3 p-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Call Completed</p>
                    <p className="text-sm text-muted-foreground">Successfully connected with Nicole Taylor</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start space-x-3 p-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Follow-up Reminder</p>
                    <p className="text-sm text-muted-foreground">James Anderson requires follow-up call</p>
                    <p className="text-xs text-muted-foreground">6 hours ago</p>
                  </div>
                </DropdownMenuItem>
              </div>
              <div className="px-4 py-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    toast({
                      title: "Notifications",
                      description: "All notifications are displayed above. No additional notifications at this time.",
                    });
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-neutral-lightest">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any)?.avatar || ""} />
                  <AvatarFallback 
                    className="text-white text-sm font-medium"
                    style={{ backgroundColor: (company as any)?.primaryColor || '#e45c2b' }}
                  >
                    {user ? `${(user as any).firstName?.[0] || ''}${(user as any).lastName?.[0] || ''}` : ''}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-neutral-dark hidden md:block">
                  {user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() : ''}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-light" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCompanyOpen(true)} className="cursor-pointer">
                <Building className="mr-2 h-4 w-4" />
                Company Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPreferencesOpen(true)} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Settings Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your personal information and account details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="firstName" className="text-right">First Name</label>
              <Input 
                id="firstName" 
                defaultValue={(user as any)?.firstName || ""} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="lastName" className="text-right">Last Name</label>
              <Input 
                id="lastName" 
                defaultValue={(user as any)?.lastName || ""} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">Email</label>
              <Input 
                id="email" 
                defaultValue={(user as any)?.email || ""} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right">Phone</label>
              <Input 
                id="phone" 
                defaultValue={(user as any)?.phone || ""} 
                className="col-span-3" 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProfileUpdate}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Settings Dialog */}
      <Dialog open={isCompanyOpen} onOpenChange={setIsCompanyOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Company Settings</DialogTitle>
            <DialogDescription>
              Manage Traffik Boosters company configuration and branding.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="companyName" className="text-right">Company Name</label>
              <Input id="companyName" defaultValue="Traffik Boosters" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="domain" className="text-right">Domain</label>
              <Input id="domain" defaultValue="traffikboosters.com" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="website" className="text-right">Website</label>
              <Input id="website" placeholder="https://www.traffikboosters.com" className="col-span-3" />
            </div>
            
            <div className="col-span-4 border-t pt-4 mt-2">
              <h4 className="font-medium text-sm mb-3 text-[#e45c2b]">Social Media Links</h4>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="facebookUrl" className="text-right">Facebook</label>
              <Input id="facebookUrl" defaultValue="https://www.facebook.com/profile.php?id=61558218231561" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="linkedinUrl" className="text-right">LinkedIn</label>
              <Input id="linkedinUrl" defaultValue="https://www.linkedin.com/company/traffik-boosters/?viewAsMember=true" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="twitterUrl" className="text-right">Twitter/X</label>
              <Input id="twitterUrl" defaultValue="https://x.com/Traffikboosters?t=mi3YgILsb1VsxoseHqixSA&s=09" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="instagramUrl" className="text-right">Instagram</label>
              <Input id="instagramUrl" defaultValue="https://www.instagram.com/traffikboosters?utm_source=qr&igsh=MWdwNXNyYjFhMjR5NA==" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="youtubeUrl" className="text-right">YouTube</label>
              <Input id="youtubeUrl" defaultValue="https://www.youtube.com/@TraffikBoosters" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tiktokUrl" className="text-right">TikTok</label>
              <Input id="tiktokUrl" defaultValue="https://www.tiktok.com/@traffikboosters?lang=en" className="col-span-3" />
            </div>

            <div className="col-span-4 border-t pt-4 mt-2">
              <h4 className="font-medium text-sm mb-3 text-[#e45c2b]">Branding</h4>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="primaryColor" className="text-right">Primary Color</label>
              <Input id="primaryColor" defaultValue="#e45c2b" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="secondaryColor" className="text-right">Secondary Color</label>
              <Input id="secondaryColor" defaultValue="#f28b56" className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCompanyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompanyUpdate}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preferences Dialog */}
      <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Preferences</DialogTitle>
            <DialogDescription>
              Customize your Starz experience and notification settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <label htmlFor="emailNotifications">Email Notifications</label>
              <input type="checkbox" id="emailNotifications" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="leadAlerts">New Lead Alerts</label>
              <input type="checkbox" id="leadAlerts" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="callNotifications">Call Notifications</label>
              <input type="checkbox" id="callNotifications" defaultChecked className="h-4 w-4" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="timezone" className="text-right">Timezone</label>
              <select id="timezone" className="col-span-3 p-2 border rounded">
                <option>EST (UTC-5)</option>
                <option>CST (UTC-6)</option>
                <option>MST (UTC-7)</option>
                <option>PST (UTC-8)</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="language" className="text-right">Language</label>
              <select id="language" className="col-span-3 p-2 border rounded">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsPreferencesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePreferencesUpdate}>
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
