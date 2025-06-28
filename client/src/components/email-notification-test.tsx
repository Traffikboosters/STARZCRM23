import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { EmailNotificationManager } from './email-notification-sound';
import { Volume2, VolumeX, Mail, Bell, TestTube } from 'lucide-react';

export default function EmailNotificationTest() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const notificationManager = EmailNotificationManager.getInstance();

  const testEmailNotification = async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    
    try {
      // Request notification permission if needed
      notificationManager.requestNotificationPermission();
      
      // Play email notification sound
      await notificationManager.playNotification("Test email notification - Bark.com Lead: John Smith at ABC Company");
      
      toast({
        title: "📧 Email Notification Test",
        description: "Email notification sound played successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error('Email notification test failed:', error);
      toast({
        title: "Test Failed",
        description: "Email notification could not be played",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsTesting(false), 1000);
    }
  };

  const toggleNotifications = (enabled: boolean) => {
    setIsEnabled(enabled);
    notificationManager.setEnabled(enabled);
    
    toast({
      title: enabled ? "Notifications Enabled" : "Notifications Disabled",
      description: enabled ? "Email notification sounds are now active" : "Email notification sounds are now muted",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Email Notification System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications-toggle" className="flex items-center gap-2">
            {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Email Notifications
          </Label>
          <Switch
            id="notifications-toggle"
            checked={isEnabled}
            onCheckedChange={toggleNotifications}
          />
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={testEmailNotification}
            disabled={isTesting || !isEnabled}
            className="w-full"
            variant="outline"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTesting ? "Playing..." : "Test Email Sound"}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            Click to test the email notification sound that plays when new leads arrive via chat widget or email
          </p>
        </div>

        <div className="bg-muted p-3 rounded-lg text-sm">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Auto-Triggered Events:
          </h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Chat widget submissions</li>
            <li>• Email marketing campaigns</li>
            <li>• New lead assignments</li>
            <li>• Email auto-replies sent</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}