import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, Calendar, User, Building, Settings, LogOut } from "lucide-react";
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

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies'],
  });

  const company = companies?.[0];

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
    <header className="bg-white border-b border-neutral-lighter px-6 py-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Traffik Boosters Logo */}
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-32 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="min-w-max">
            <h1 className="text-2xl font-bold text-black whitespace-nowrap">
              Starz
            </h1>
            <p className="text-lg font-bold text-black whitespace-nowrap">
              More Traffik! More Sales!
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 flex-shrink min-w-0">
          {/* Search functionality */}
          <div className="relative flex-shrink min-w-0">
            <Input
              type="text"
              placeholder="Search contacts, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-light" />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-neutral-medium" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>
          
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="companyName" className="text-right">Company Name</label>
              <Input id="companyName" defaultValue="Traffik Boosters" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="domain" className="text-right">Domain</label>
              <Input id="domain" defaultValue="traffikboosters.com" className="col-span-3" />
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
