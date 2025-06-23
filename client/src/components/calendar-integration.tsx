import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Code,
  Copy,
  ExternalLink,
  Settings,
  Clock,
  Users,
  CheckCircle,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";
import EmbeddableCalendarWidget from "./embeddable-calendar-widget";

export default function CalendarIntegration() {
  const [embedDomain, setEmbedDomain] = useState("traffikboosters.com");
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get embed code
  const { data: embedData, isLoading: embedLoading } = useQuery({
    queryKey: ["/api/calendar/embed-code", embedDomain],
    queryFn: async () => {
      const response = await fetch(`/api/calendar/embed-code?domain=${embedDomain}`);
      return response.json();
    }
  });

  // Get calendar services
  const { data: servicesData } = useQuery({
    queryKey: ["/api/calendar/services"],
    queryFn: async () => {
      const response = await fetch("/api/calendar/services");
      return response.json();
    }
  });

  // Get recent bookings
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  const websiteBookings = events.filter((event: any) => 
    event.description?.includes("Source: Website Calendar") || 
    event.description?.includes("website-booking")
  );

  const copyEmbedCode = () => {
    if (embedData?.embedCode) {
      navigator.clipboard.writeText(embedData.embedCode);
      setCopiedCode(true);
      toast({
        title: "Embed Code Copied",
        description: "The calendar widget code has been copied to your clipboard."
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const testCalendar = () => {
    if (embedData?.testUrl) {
      window.open(embedData.testUrl, '_blank');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={traffikBoostersLogo} alt="Traffik Boosters" className="h-12 w-auto" />
          <div>
            <h1 className="text-3xl font-bold text-black">Calendar Integration</h1>
            <p className="text-gray-600">Connect your Starz calendar to traffikboosters.com</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup & Embed</TabsTrigger>
          <TabsTrigger value="preview">Widget Preview</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {/* Integration Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Website Integration</h3>
                    <p className="text-sm text-gray-600">Embed calendar on your site</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Auto Sync</h3>
                    <p className="text-sm text-gray-600">Bookings sync to Starz</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Lead Capture</h3>
                    <p className="text-sm text-gray-600">Automatic contact creation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Embed Code Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Website Embed Code
              </CardTitle>
              <CardDescription>
                Copy this code and paste it into your website where you want the calendar to appear
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domain">Website Domain</Label>
                <Input
                  id="domain"
                  value={embedDomain}
                  onChange={(e) => setEmbedDomain(e.target.value)}
                  placeholder="traffikboosters.com"
                  className="max-w-sm"
                />
              </div>

              {embedData && (
                <div className="space-y-4">
                  <div>
                    <Label>Embed Code</Label>
                    <div className="relative">
                      <Textarea
                        value={embedData.embedCode}
                        readOnly
                        className="min-h-32 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={copyEmbedCode}
                        className="absolute top-2 right-2"
                        variant={copiedCode ? "default" : "outline"}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copiedCode ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={testCalendar} variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Test Calendar
                    </Button>
                    <Button onClick={copyEmbedCode}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Embed Code
                    </Button>
                  </div>

                  {/* Instructions */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Integration Instructions:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {embedData.instructions?.map((instruction: string, index: number) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Services */}
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
              <CardDescription>These services are available for booking through your website</CardDescription>
            </CardHeader>
            <CardContent>
              {servicesData?.services && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesData.services.map((service: any) => (
                    <Card key={service.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <div className="text-right">
                            <Badge variant="secondary">{service.duration} min</Badge>
                            <p className="text-sm text-green-600 font-semibold">{service.price}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Widget Preview</CardTitle>
              <CardDescription>This is how the calendar will appear on your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <EmbeddableCalendarWidget
                  apiBaseUrl=""
                  primaryColor="#e45c2b"
                  companyName="Traffik Boosters"
                  companyLogo={traffikBoostersLogo}
                  timeZone="America/New_York"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Website Bookings
              </CardTitle>
              <CardDescription>
                Appointments booked through your website calendar widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              {websiteBookings.length > 0 ? (
                <div className="space-y-4">
                  {websiteBookings.slice(0, 10).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{booking.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.startDate).toLocaleDateString()} at{' '}
                          {new Date(booking.startDate).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-500">{booking.location}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{booking.type}</Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.attendees?.[0] || 'No email'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No website bookings yet</p>
                  <p className="text-sm text-gray-400">Appointments booked through your website will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Settings</CardTitle>
              <CardDescription>Configure your calendar integration preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Business Hours</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Monday - Friday: 9:00 AM - 6:00 PM EST</span>
                    </div>
                    <p className="text-xs text-gray-500">Appointments can only be booked during business hours</p>
                  </div>
                </div>

                <div>
                  <Label>Time Zone</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">America/New_York (EST/EDT)</span>
                    </div>
                    <p className="text-xs text-gray-500">All appointments are scheduled in Eastern Time</p>
                  </div>
                </div>

                <div>
                  <Label>Automatic Notifications</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Email confirmations enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">CRM contact creation enabled</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Widget Appearance</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="text-sm">Primary Color: #e45c2b</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm">Responsive design enabled</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Integration Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">API endpoints active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Widget code generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Calendar sync enabled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}