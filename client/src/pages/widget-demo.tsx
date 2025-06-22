import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmbeddedChatWidget from "@/components/embedded-chat-widget";
import { Code, Copy, Download, ExternalLink, Zap, Users, TrendingUp, MessageSquare } from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

export default function WidgetDemo() {
  const embedCode = `<!-- Traffik Boosters Chat Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['TrafficBoostersWidget']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','tbw','https://your-domain.com/widget.js'));
  
  tbw('init', {
    apiEndpoint: 'https://your-crm-domain.com/api/leads',
    companyName: 'Traffik Boosters',
    primaryColor: '#9ACD32',
    position: 'bottom-right'
  });
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Website Chat Widget for Lead Generation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Convert website visitors into leads with our intelligent chat widget. 
              Designed specifically for Traffik Boosters' website integration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-8 w-8 mx-auto text-[#9ACD32] mb-2" />
                <CardTitle className="text-lg">Lead Capture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Automatically captures visitor information and creates leads in your CRM</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-8 w-8 mx-auto text-[#9ACD32] mb-2" />
                <CardTitle className="text-lg">Smart Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Engages visitors with intelligent responses and qualification questions</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-8 w-8 mx-auto text-[#9ACD32] mb-2" />
                <CardTitle className="text-lg">Boost Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Turn anonymous visitors into qualified leads ready for consultation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Features */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              See It In Action
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#9ACD32] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Visitor Engagement</h3>
                  <p className="text-gray-600 text-sm">
                    Widget appears with your Traffik Boosters branding and engages visitors with a personalized greeting
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#9ACD32] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Lead Qualification</h3>
                  <p className="text-gray-600 text-sm">
                    Collects essential contact information and business details through a friendly conversation flow
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#9ACD32] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">CRM Integration</h3>
                  <p className="text-gray-600 text-sm">
                    Automatically creates leads in your CRM system with conversation history and source tracking
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#9ACD32]" />
                Key Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Branded with Traffik Boosters colors and messaging</li>
                <li>• Mobile-responsive design for all devices</li>
                <li>• Lead scoring and automatic qualification</li>
                <li>• Real-time notifications for new leads</li>
                <li>• Integration with your existing CRM workflow</li>
                <li>• GDPR compliant data collection</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Live Demo */}
          <div>
            <div className="relative">
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg p-8 text-white mb-6">
                <h3 className="text-xl font-semibold mb-4">Live Demo</h3>
                <p className="text-gray-300 mb-4">
                  Click the chat widget in the bottom-right corner to see how it works on your website.
                </p>
                <Badge className="bg-[#9ACD32] text-black">
                  Try it now →
                </Badge>
              </div>
              
              {/* Screenshot placeholder */}
              <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-dashed border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#9ACD32] rounded-full flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-600">Your Traffik Boosters website</p>
                    <p className="text-sm text-gray-500">with integrated chat widget</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Easy Installation
              </CardTitle>
              <CardDescription>
                Add this code to your website before the closing &lt;/body&gt; tag on all pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button className="bg-[#9ACD32] hover:bg-[#8BB82A] text-black">
                  <Download className="h-4 w-4 mr-2" />
                  Download Widget Package
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Installation Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#9ACD32]">3x</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Lead Generation</p>
              <p className="text-sm text-gray-600">Average increase in qualified leads</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#9ACD32]">24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Always Available</p>
              <p className="text-sm text-gray-600">Captures leads even outside business hours</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#9ACD32]">85%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Engagement Rate</p>
              <p className="text-sm text-gray-600">Visitors who interact with the widget</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Widget Demo */}
      <EmbeddedChatWidget 
        companyName="Traffik Boosters"
        primaryColor="#9ACD32"
        welcomeMessage="Hi! Ready to boost your website traffic? Let's chat!"
        apiEndpoint="/api/leads"
      />
    </div>
  );
}