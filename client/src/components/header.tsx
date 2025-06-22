import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies'],
  });

  const company = companies?.[0];

  return (
    <header className="bg-white border-b border-neutral-lighter px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Company logo */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: company?.primaryColor || '#0078D4' }}
          >
            {company?.logo ? (
              <img src={company.logo} alt={company.name} className="w-6 h-6" />
            ) : (
              <Calendar className="text-white text-lg" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-dark">
              {company?.name || "Enterprise Scheduler Pro"}
            </h1>
            <p className="text-xs text-neutral-medium">
              {user?.role === "admin" ? "Administrator Dashboard" : 
               user?.role === "manager" ? "Manager Dashboard" :
               user?.role === "sales_rep" ? "Sales Dashboard" : "User Dashboard"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search functionality */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search contacts, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
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
                  <AvatarImage src={user?.avatar || ""} />
                  <AvatarFallback 
                    className="text-white text-sm font-medium"
                    style={{ backgroundColor: company?.primaryColor || '#0078D4' }}
                  >
                    {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'JD'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-neutral-dark hidden md:block">
                  {user ? `${user.firstName} ${user.lastName}` : 'John Doe'}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-light" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Company Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
