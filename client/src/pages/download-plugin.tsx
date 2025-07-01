import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Smartphone, CheckCircle, ArrowRight, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DownloadPlugin() {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const { toast } = useToast();

  const downloadFile = async (filename: string, displayName: string) => {
    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) throw new Error('File not found');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadStarted(true);
      toast({
        title: "Download Started",
        description: `${displayName} is downloading to your device`,
      });
    } catch (error) {
      toast({
        title: "Download Failed", 
        description: "Could not download file. Try the copy method below.",
        variant: "destructive"
      });
    }
  };

  const copyPluginCode = async () => {
    try {
      const response = await fetch('/starz-chat-widget.php');
      const code = await response.text();
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code Copied!",
        description: "Plugin code copied to clipboard. Paste it into a new file on your computer.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy code. Try downloading instead.",
        variant: "destructive"
      });
    }
  };

  const installationSteps = [
    { step: 1, title: "Download Plugin", description: "Save starz-chat-widget.php to your device" },
    { step: 2, title: "Create ZIP", description: "Compress the PHP file into starz-chat-widget.zip" },
    { step: 3, title: "Upload to WordPress", description: "Go to Plugins → Add New → Upload Plugin" },
    { step: 4, title: "Activate", description: "Install and activate the plugin" },
    { step: 5, title: "Configure", description: "Set up at Settings → STARZ Chat Widget" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6 rounded-xl">
            <h1 className="text-3xl font-bold mb-2">STARZ Chat Widget</h1>
            <p className="text-orange-100 text-lg">WordPress Plugin Download</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Smartphone className="h-5 w-5" />
              <span className="text-sm">Mobile-Optimized Download</span>
            </div>
          </div>
        </div>

        {/* Download Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          
          {/* Main Plugin File */}
          <Card className="border-2 border-orange-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-orange-600" />
                Main Plugin File
              </CardTitle>
              <CardDescription>
                Complete WordPress plugin (22KB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-mono text-sm text-orange-800">starz-chat-widget.php</p>
                <p className="text-xs text-orange-600 mt-1">Professional chat widget with CRM integration</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => downloadFile('starz-chat-widget.php', 'Plugin File')}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Plugin File
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={copyPluginCode}
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code to Clipboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Installation Guide */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Installation Guide
              </CardTitle>
              <CardDescription>
                Step-by-step setup instructions (15KB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-mono text-sm text-blue-800">Installation-Guide.md</p>
                <p className="text-xs text-blue-600 mt-1">Complete setup walkthrough with screenshots</p>
              </div>
              
              <Button 
                onClick={() => downloadFile('STARZ-Chat-Widget-Installation-Guide.md', 'Installation Guide')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Instructions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Installation Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Quick Installation Steps
            </CardTitle>
            <CardDescription>
              Follow these 5 simple steps to install your chat widget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installationSteps.map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Info */}
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Important Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-yellow-700">
              After installation, update the <strong>CRM API URL</strong> in plugin settings:
            </p>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
              https://your-starz-instance.replit.app/api/chat-widget-submit
            </div>
            <p className="text-xs text-yellow-600">
              Replace "your-starz-instance" with your actual Replit project URL
            </p>
          </CardContent>
        </Card>

        {/* Success Message */}
        {downloadStarted && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Download Started!</p>
                  <p className="text-sm text-green-600">Check your device's Downloads folder</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> starz@traffikboosters.com</p>
              <p><strong>Phone:</strong> (877) 840-6250</p>
              <p><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
          </CardContent>
        </Card>

        {/* Back to STARZ */}
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Back to STARZ Platform
          </Button>
        </div>

      </div>
    </div>
  );
}