import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe, AlertTriangle, CheckCircle } from "lucide-react";

interface TimeZoneCheck {
  isWithinBusinessHours: boolean;
  isAllowedRegion: boolean;
  isRestrictedTimeZone: boolean;
  currentTime: string;
  businessStatus: string;
  userTimeZone: string;
}

export default function TimeZoneRestrictions() {
  const [timeCheck, setTimeCheck] = useState<TimeZoneCheck>({
    isWithinBusinessHours: true,
    isAllowedRegion: true,
    isRestrictedTimeZone: false,
    currentTime: "",
    businessStatus: "open",
    userTimeZone: ""
  });

  const businessHours = {
    start: "09:00",
    end: "18:00",
    timezone: "America/New_York",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  };

  const allowedRegions = ["US", "CA"];
  const restrictedTimeZones = ["Asia/Tokyo", "Europe/London"]; // Example restrictions

  useEffect(() => {
    const checkTimeZoneRestrictions = () => {
      const now = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Check business hours
      const currentTime = now.toLocaleTimeString("en-US", { 
        hour12: false, 
        timeZone: businessHours.timezone 
      }).slice(0, 5);
      
      const currentDay = now.toLocaleDateString("en-US", { 
        weekday: "long", 
        timeZone: businessHours.timezone 
      });
      
      const isBusinessDay = businessHours.days.includes(currentDay);
      const isBusinessTime = currentTime >= businessHours.start && currentTime <= businessHours.end;
      const isWithinBusinessHours = isBusinessDay && isBusinessTime;
      
      // Check if user's timezone is restricted
      const isRestrictedTimeZone = restrictedTimeZones.includes(userTimeZone);
      
      // Get user's region (simplified - in production, use IP geolocation)
      const userRegion = getUserRegionFromTimeZone(userTimeZone);
      const isAllowedRegion = allowedRegions.includes(userRegion);
      
      const businessStatus = isWithinBusinessHours ? "open" : "closed";
      const displayTime = now.toLocaleString("en-US", {
        timeZone: businessHours.timezone,
        hour12: true,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      setTimeCheck({
        isWithinBusinessHours,
        isAllowedRegion,
        isRestrictedTimeZone,
        currentTime: displayTime,
        businessStatus,
        userTimeZone
      });
    };

    checkTimeZoneRestrictions();
    const interval = setInterval(checkTimeZoneRestrictions, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getUserRegionFromTimeZone = (timezone: string): string => {
    if (timezone.startsWith("America/")) {
      if (timezone.includes("Toronto") || timezone.includes("Vancouver")) return "CA";
      return "US";
    }
    if (timezone.startsWith("Europe/")) return "EU";
    if (timezone.startsWith("Asia/")) return "AS";
    if (timezone.startsWith("Australia/")) return "AU";
    return "US"; // Default
  };

  const getStatusIcon = () => {
    if (!timeCheck.isAllowedRegion || timeCheck.isRestrictedTimeZone) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    if (!timeCheck.isWithinBusinessHours) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusMessage = () => {
    if (!timeCheck.isAllowedRegion) {
      return "Service not available in your region";
    }
    if (timeCheck.isRestrictedTimeZone) {
      return "Access restricted from your time zone";
    }
    if (!timeCheck.isWithinBusinessHours) {
      return "Outside business hours - Limited functionality available";
    }
    return "All systems operational";
  };

  const getAlertVariant = () => {
    if (!timeCheck.isAllowedRegion || timeCheck.isRestrictedTimeZone) {
      return "destructive";
    }
    if (!timeCheck.isWithinBusinessHours) {
      return "default";
    }
    return "default";
  };

  return (
    <div className="space-y-4">
      {/* Main Status Alert */}
      <Alert variant={getAlertVariant()} className={
        timeCheck.isWithinBusinessHours && timeCheck.isAllowedRegion && !timeCheck.isRestrictedTimeZone
          ? "border-green-200 bg-green-50"
          : timeCheck.isAllowedRegion && !timeCheck.isRestrictedTimeZone
          ? "border-yellow-200 bg-yellow-50"
          : "border-red-200 bg-red-50"
      }>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <AlertDescription className="flex-1">
            {getStatusMessage()}
          </AlertDescription>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              EST: {timeCheck.currentTime}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              {timeCheck.userTimeZone}
            </Badge>
          </div>
        </div>
      </Alert>

      {/* Business Hours Info */}
      {!timeCheck.isWithinBusinessHours && timeCheck.isAllowedRegion && !timeCheck.isRestrictedTimeZone && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Business Hours (EST):</p>
              <p className="text-sm">Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p className="text-sm">
                We'll respond to your inquiry within 24 business hours. 
                For urgent matters, please call (877) 840-6250.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Regional Restriction Info */}
      {!timeCheck.isAllowedRegion && (
        <Alert variant="destructive">
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Service Unavailable</p>
              <p className="text-sm">
                Traffik Boosters services are currently only available in the United States and Canada.
                If you're traveling or using a VPN, please try again from your primary location.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Time Zone Restriction Info */}
      {timeCheck.isRestrictedTimeZone && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Access Restricted</p>
              <p className="text-sm">
                Access from your time zone ({timeCheck.userTimeZone}) is currently restricted. 
                Please contact support if you believe this is an error.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}