import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Volume2, 
  VolumeX, 
  Bell, 
  BellRing, 
  Play, 
  Settings,
  CheckCircle,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { useLeadNotifications } from "@/hooks/use-lead-notifications";

export default function LeadNotificationSettings() {
  const [notificationSettings, setNotificationSettings] = useState({
    enableSound: true,
    soundVolume: 0.7,
    notificationTypes: {
      newLead: true,
      highValueLead: true,
      qualifiedLead: true,
    }
  });

  const {
    isEnabled,
    setIsEnabled,
    volume,
    setVolume,
    permissionGranted,
    simulateIncomingLead,
    playNotificationSound
  } = useLeadNotifications(notificationSettings);

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    setNotificationSettings(prev => ({
      ...prev,
      soundVolume: volumeValue
    }));
  };

  const handleNotificationTypeToggle = (type: keyof typeof notificationSettings.notificationTypes) => {
    setNotificationSettings(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: !prev.notificationTypes[type]
      }
    }));
  };

  const testSound = (type: 'newLead' | 'highValue' | 'qualified') => {
    playNotificationSound(type);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Lead Notification Settings
        </CardTitle>
        <CardDescription>
          Configure audio and visual alerts for incoming leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Enable */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Enable Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Turn on/off all lead notifications
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>

        <Separator />

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              Sound Volume
            </Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
            disabled={!isEnabled}
          />
        </div>

        <Separator />

        {/* Notification Types */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Notification Types</Label>
          
          {/* New Lead */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">New Lead</p>
                <p className="text-xs text-muted-foreground">Basic lead notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testSound('newLead')}
                disabled={!isEnabled}
              >
                <Play className="w-3 h-3" />
              </Button>
              <Switch
                checked={notificationSettings.notificationTypes.newLead}
                onCheckedChange={() => handleNotificationTypeToggle('newLead')}
                disabled={!isEnabled}
              />
            </div>
          </div>

          {/* High Value Lead */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">High Value Lead</p>
                <p className="text-xs text-muted-foreground">Leads over $10k or Critical priority</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testSound('highValue')}
                disabled={!isEnabled}
              >
                <Play className="w-3 h-3" />
              </Button>
              <Switch
                checked={notificationSettings.notificationTypes.highValueLead}
                onCheckedChange={() => handleNotificationTypeToggle('highValueLead')}
                disabled={!isEnabled}
              />
            </div>
          </div>

          {/* Qualified Lead */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Qualified Lead</p>
                <p className="text-xs text-muted-foreground">High priority qualified prospects</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testSound('qualified')}
                disabled={!isEnabled}
              >
                <Play className="w-3 h-3" />
              </Button>
              <Switch
                checked={notificationSettings.notificationTypes.qualifiedLead}
                onCheckedChange={() => handleNotificationTypeToggle('qualifiedLead')}
                disabled={!isEnabled}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Browser Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Browser Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Desktop popup notifications
              </p>
            </div>
            <Badge variant={permissionGranted ? "default" : "secondary"}>
              {permissionGranted ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          {!permissionGranted && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Click "Allow" when prompted to enable desktop notifications
            </p>
          )}
        </div>

        <Separator />

        {/* Test Notifications */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Test Notifications</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={simulateIncomingLead}
              disabled={!isEnabled}
              className="flex items-center gap-2"
            >
              <BellRing className="w-3 h-3" />
              Simulate Incoming Lead
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}