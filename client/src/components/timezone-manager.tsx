import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Globe, MapPin, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeZoneSettings {
  companyTimezone: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  businessDays: string[];
  restrictedTimeZones: string[];
  allowedRegions: string[];
  enableTimeRestrictions: boolean;
}

export default function TimeZoneManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TimeZoneSettings>({
    companyTimezone: "America/New_York",
    businessHoursStart: "09:00",
    businessHoursEnd: "18:00",
    businessDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    restrictedTimeZones: [],
    allowedRegions: ["US", "CA"],
    enableTimeRestrictions: true
  });

  const timeZones = [
    "America/New_York",
    "America/Chicago", 
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Vancouver",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney"
  ];

  const regions = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "JP", name: "Japan" }
  ];

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const isWithinBusinessHours = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-US", { hour12: false, timeZone: settings.companyTimezone }).slice(0, 5);
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long", timeZone: settings.companyTimezone });
    
    const isBusinessDay = settings.businessDays.includes(currentDay);
    const isBusinessTime = currentTime >= settings.businessHoursStart && currentTime <= settings.businessHoursEnd;
    
    return isBusinessDay && isBusinessTime;
  };

  const getCurrentTimeInTimezone = (timezone: string) => {
    return new Date().toLocaleString("en-US", {
      timeZone: timezone,
      hour12: true,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleBusinessDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      businessDays: prev.businessDays.includes(day)
        ? prev.businessDays.filter(d => d !== day)
        : [...prev.businessDays, day]
    }));
  };

  const handleRestrictedTimezoneAdd = (timezone: string) => {
    if (!settings.restrictedTimeZones.includes(timezone)) {
      setSettings(prev => ({
        ...prev,
        restrictedTimeZones: [...prev.restrictedTimeZones, timezone]
      }));
    }
  };

  const handleRestrictedTimezoneRemove = (timezone: string) => {
    setSettings(prev => ({
      ...prev,
      restrictedTimeZones: prev.restrictedTimeZones.filter(tz => tz !== timezone)
    }));
  };

  const handleAllowedRegionToggle = (regionCode: string) => {
    setSettings(prev => ({
      ...prev,
      allowedRegions: prev.allowedRegions.includes(regionCode)
        ? prev.allowedRegions.filter(r => r !== regionCode)
        : [...prev.allowedRegions, regionCode]
    }));
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings Saved",
      description: "Time zone restrictions have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Zone Management</h2>
          <p className="text-gray-600">Configure business hours and time zone restrictions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-brand-primary" />
          <span className="text-sm font-medium">
            Current: {getCurrentTimeInTimezone(settings.companyTimezone)}
          </span>
        </div>
      </div>

      {/* Business Hours Status */}
      <Alert className={isWithinBusinessHours() ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <div className="flex items-center space-x-2">
          {isWithinBusinessHours() ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
          <AlertDescription className={isWithinBusinessHours() ? "text-green-800" : "text-yellow-800"}>
            {isWithinBusinessHours() 
              ? "Currently within business hours - All operations available"
              : "Outside business hours - Limited operations may be restricted"
            }
          </AlertDescription>
        </div>
      </Alert>

      <Tabs defaultValue="business-hours" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business-hours">Business Hours</TabsTrigger>
          <TabsTrigger value="restrictions">Time Restrictions</TabsTrigger>
          <TabsTrigger value="regions">Regional Access</TabsTrigger>
        </TabsList>

        <TabsContent value="business-hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Business Hours Configuration</span>
              </CardTitle>
              <CardDescription>
                Set your company's operating hours and time zone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Company Time Zone</Label>
                  <Select value={settings.companyTimezone} onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, companyTimezone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace("_", " ")} - {getCurrentTimeInTimezone(tz)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Enable Time Restrictions</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.enableTimeRestrictions}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, enableTimeRestrictions: checked }))
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {settings.enableTimeRestrictions ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Business Hours Start</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={settings.businessHoursStart}
                    onChange={(e) => setSettings(prev => ({ ...prev, businessHoursStart: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">Business Hours End</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={settings.businessHoursEnd}
                    onChange={(e) => setSettings(prev => ({ ...prev, businessHoursEnd: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Business Days</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {weekDays.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Switch
                        checked={settings.businessDays.includes(day)}
                        onCheckedChange={() => handleBusinessDayToggle(day)}
                      />
                      <span className="text-sm">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Time Zone Restrictions</span>
              </CardTitle>
              <CardDescription>
                Block access from specific time zones during certain hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Add Restricted Time Zone</Label>
                  <Select onValueChange={handleRestrictedTimezoneAdd}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select timezone to restrict" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZones.filter(tz => !settings.restrictedTimeZones.includes(tz)).map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currently Restricted Time Zones</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.restrictedTimeZones.length > 0 ? (
                      settings.restrictedTimeZones.map(tz => (
                        <Badge key={tz} variant="destructive" className="cursor-pointer" 
                               onClick={() => handleRestrictedTimezoneRemove(tz)}>
                          {tz.replace("_", " ")} ✕
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No restrictions set</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Regional Access Control</span>
              </CardTitle>
              <CardDescription>
                Control which geographic regions can access the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Allowed Regions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {regions.map(region => (
                    <div key={region.code} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Switch
                        checked={settings.allowedRegions.includes(region.code)}
                        onCheckedChange={() => handleAllowedRegionToggle(region.code)}
                      />
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{region.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Users from blocked regions will see a message indicating the service is not available in their area.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="bg-brand-primary hover:bg-brand-secondary text-white">
          <Shield className="h-4 w-4 mr-2" />
          Save Time Zone Settings
        </Button>
      </div>
    </div>
  );
}