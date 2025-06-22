import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FormInput, 
  Mail, 
  Phone, 
  Building, 
  Globe,
  CheckCircle,
  Clock,
  Bell,
  Volume2,
  AlertCircle
} from "lucide-react";
import { useLeadNotifications } from "@/hooks/use-lead-notifications";

interface FormSubmission {
  id: number;
  formName: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  service: string;
  message: string;
  submittedAt: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedValue: number;
  source: string;
}

const sampleFormSubmissions: FormSubmission[] = [
  {
    id: 1,
    formName: "Website Contact Form",
    businessName: "Sunset Cafe",
    contactName: "Carlos Rodriguez",
    email: "carlos@sunsetcafe.com",
    phone: "(305) 555-0198",
    website: "sunsetcafe.com",
    service: "Local SEO & Google My Business",
    message: "We need help ranking higher for 'best cafe miami beach'. Currently on page 3 of Google.",
    submittedAt: new Date(Date.now() - 120000), // 2 minutes ago
    priority: "High",
    estimatedValue: 3500,
    source: "Website Form"
  },
  {
    id: 2,
    formName: "Free Website Audit",
    businessName: "Miami Property Group",
    contactName: "Sarah Johnson",
    email: "sarah@miamipropertygroup.com",
    phone: "(305) 555-0287",
    website: "miamipropertygroup.com",
    service: "Website Redesign & SEO",
    message: "Our real estate website is outdated and not generating leads. Need a complete overhaul.",
    submittedAt: new Date(Date.now() - 300000), // 5 minutes ago
    priority: "Critical",
    estimatedValue: 15000,
    source: "Audit Form"
  },
  {
    id: 3,
    formName: "Social Media Consultation",
    businessName: "FitZone Gym",
    contactName: "Mike Thompson",
    email: "mike@fitzone.com",
    phone: "(305) 555-0346",
    service: "Social Media Management",
    message: "Want to increase membership through Instagram and Facebook marketing.",
    submittedAt: new Date(Date.now() - 600000), // 10 minutes ago
    priority: "Medium",
    estimatedValue: 2800,
    source: "Social Form"
  }
];

export default function FormLeadNotifications() {
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>(sampleFormSubmissions);
  const [isLiveMode, setIsLiveMode] = useState(false);

  const {
    handleIncomingLead,
    simulateIncomingLead
  } = useLeadNotifications({
    enableSound: true,
    soundVolume: 0.8,
    notificationTypes: {
      newLead: true,
      highValueLead: true,
      qualifiedLead: true,
    }
  });

  // Simulate new form submissions
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      const newSubmission: FormSubmission = {
        id: Date.now(),
        formName: ["Website Contact Form", "Free Website Audit", "Social Media Consultation", "PPC Quote Request"][Math.floor(Math.random() * 4)],
        businessName: ["Ocean View Restaurant", "Tech Startup Inc", "Local Fitness Studio", "Downtown Boutique"][Math.floor(Math.random() * 4)],
        contactName: ["Jessica Martinez", "Alex Chen", "Ryan Brooks", "Emma Wilson"][Math.floor(Math.random() * 4)],
        email: `contact${Date.now()}@business.com`,
        phone: `(305) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        website: `business${Date.now()}.com`,
        service: ["SEO", "PPC", "Social Media", "Website Design"][Math.floor(Math.random() * 4)],
        message: "Interested in growing our online presence and generating more leads.",
        submittedAt: new Date(),
        priority: ["Medium", "High", "Critical"][Math.floor(Math.random() * 3)] as 'Medium' | 'High' | 'Critical',
        estimatedValue: Math.floor(Math.random() * 15000) + 2000,
        source: "Website Form"
      };

      setFormSubmissions(prev => [newSubmission, ...prev.slice(0, 9)]);

      // Trigger notification
      handleIncomingLead({
        id: newSubmission.id,
        businessName: newSubmission.businessName,
        contactName: newSubmission.contactName,
        source: newSubmission.source,
        priority: newSubmission.priority,
        estimatedValue: newSubmission.estimatedValue,
        timestamp: newSubmission.submittedAt
      });
    }, 8000); // New form submission every 8 seconds

    return () => clearInterval(interval);
  }, [isLiveMode, handleIncomingLead]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FormInput className="w-5 h-5" />
            Form Lead Notifications
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time alerts for website form submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLiveMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLiveMode(!isLiveMode)}
          >
            {isLiveMode ? (
              <>
                <Volume2 className="w-3 h-3 mr-1" />
                Live Mode ON
              </>
            ) : (
              <>
                <Bell className="w-3 h-3 mr-1" />
                Start Live Demo
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={simulateIncomingLead}
          >
            Test Sound
          </Button>
        </div>
      </div>

      {/* Live Status */}
      {isLiveMode && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-green-800">
                Live form monitoring active - New submissions will trigger audio notifications
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Form Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Form Submissions</span>
            <Badge variant="secondary">
              {formSubmissions.length} submissions
            </Badge>
          </CardTitle>
          <CardDescription>
            Latest leads from website contact forms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formSubmissions.map((submission, index) => (
            <div key={submission.id}>
              <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="space-y-3 flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{submission.businessName}</h4>
                      <Badge className={getPriorityColor(submission.priority)}>
                        {submission.priority}
                      </Badge>
                      {index === 0 && isLiveMode && (
                        <Badge variant="outline" className="animate-pulse">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        ${submission.estimatedValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(submission.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span>{submission.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span>{submission.email}</span>
                      </div>
                      {submission.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{submission.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FormInput className="w-3 h-3 text-muted-foreground" />
                        <span>{submission.formName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-3 h-3 text-muted-foreground" />
                        <span>{submission.service}</span>
                      </div>
                      {submission.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span>{submission.website}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-muted/50 p-3 rounded text-sm">
                    <p className="italic">"{submission.message}"</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Assign to Rep
                    </Button>
                    <Button size="sm" variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      Schedule Call
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
              {index < formSubmissions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Form Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Form Integration Setup</CardTitle>
          <CardDescription>
            How to connect your website forms to the notification system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Add Webhook URL to Your Forms</p>
                <p className="text-muted-foreground">
                  Configure your contact forms to send submissions to: 
                  <code className="mx-1 px-2 py-1 bg-muted rounded text-xs">
                    https://your-domain.com/api/webhook/form-submission
                  </code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Enable Real-time Notifications</p>
                <p className="text-muted-foreground">
                  Notifications will automatically trigger for form submissions with priority based on estimated value
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Configure Alert Settings</p>
                <p className="text-muted-foreground">
                  Customize notification sounds and browser alerts in the settings panel above
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}