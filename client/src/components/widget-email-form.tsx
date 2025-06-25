import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function WidgetEmailForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive the widget plugin.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/email-widget-plugin", {
        email,
        name: name || undefined
      });

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Widget Plugin Sent!",
          description: `The chat widget plugin has been emailed to ${email}`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Email widget error:', error);
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send widget plugin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span>Widget Plugin Sent!</span>
          </CardTitle>
          <CardDescription>
            Check your email for the installation files and setup guide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <Mail className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              The Traffik Boosters chat widget plugin has been sent to <strong>{email}</strong>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Email includes:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-blue-500" />
                <span><code>traffik-boosters-chat-widget.js</code> - Complete plugin file</span>
              </li>
              <li className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-blue-500" />
                <span><code>WIDGET_INSTALLATION_GUIDE.md</code> - Setup instructions</span>
              </li>
            </ul>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> You'll need to configure the API endpoint in the widget 
              to connect to your CRM system. See the installation guide for details.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEmailSent(false);
                setEmail("");
                setName("");
              }}
            >
              Send to Another Email
            </Button>
            <Button 
              onClick={() => window.open("tel:8778406250")}
              className="bg-brand-primary hover:bg-brand-secondary"
            >
              Need Help? Call (877) 840-6250
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Get Chat Widget Plugin</span>
        </CardTitle>
        <CardDescription>
          Enter your email to receive the complete chat widget plugin files and installation guide
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <Alert>
            <AlertDescription>
              The plugin includes lead capture forms, video call integration, business hours detection, 
              and professional Traffik Boosters branding. Ready for immediate installation on any website.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full bg-brand-primary hover:bg-brand-secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Email...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Email Widget Plugin
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}