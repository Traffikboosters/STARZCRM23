import { Check, X, Phone, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlanFeature {
  name: string;
  core: boolean;
  business: boolean;
  enterprise: boolean;
}

const planFeatures: PlanFeature[] = [
  { name: "Basic phone service", core: true, business: true, enterprise: true },
  { name: "Click-to-call (manual dial)", core: true, business: true, enterprise: true },
  { name: "Call logging & history", core: true, business: true, enterprise: true },
  { name: "Voicemail", core: true, business: true, enterprise: true },
  { name: "Call forwarding", core: true, business: true, enterprise: true },
  { name: "API access for call data", core: false, business: true, enterprise: true },
  { name: "Automated API calling", core: false, business: true, enterprise: true },
  { name: "Advanced integrations", core: false, business: true, enterprise: true },
  { name: "Multiple phone numbers", core: false, business: true, enterprise: true },
  { name: "Team management", core: false, business: true, enterprise: true },
  { name: "Call recording", core: false, business: true, enterprise: true },
  { name: "Advanced analytics", core: false, business: false, enterprise: true },
  { name: "Custom integrations", core: false, business: false, enterprise: true },
  { name: "Dedicated support", core: false, business: false, enterprise: true },
];

const FeatureIcon = ({ supported }: { supported: boolean }) => (
  supported ? 
    <Check className="h-4 w-4 text-green-600" /> : 
    <X className="h-4 w-4 text-gray-400" />
);

export default function POWERDIALSPlansComparison() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">POWERDIALS Plans Comparison</h2>
        <p className="text-muted-foreground">
          Current plan: <Badge variant="outline">Core Plan</Badge> - Upgrade for automated calling
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Plan */}
        <Card className="relative border-2 border-orange-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Current Plan
              </Badge>
            </div>
            <CardTitle className="text-xl">Core Plan</CardTitle>
            <CardDescription>Basic phone service</CardDescription>
            <div className="text-2xl font-bold">~$20/month</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {planFeatures.map((feature) => (
              <div key={feature.name} className="flex items-center gap-3">
                <FeatureIcon supported={feature.core} />
                <span className={`text-sm ${!feature.core ? 'text-gray-400' : ''}`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Business Plan */}
        <Card className="relative border-2 border-blue-500 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4 text-blue-600" />
              <Badge variant="default" className="bg-blue-600">
                Recommended
              </Badge>
            </div>
            <CardTitle className="text-xl">Business Plan</CardTitle>
            <CardDescription>Full API access & automation</CardDescription>
            <div className="text-2xl font-bold">~$40/month</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {planFeatures.map((feature) => (
              <div key={feature.name} className="flex items-center gap-3">
                <FeatureIcon supported={feature.business} />
                <span className={`text-sm ${!feature.business ? 'text-gray-400' : ''}`}>
                  {feature.name}
                </span>
                {feature.name === "Automated API calling" && feature.business && (
                  <Badge variant="outline" className="text-xs ml-auto">NEW</Badge>
                )}
              </div>
            ))}
            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={() => window.open('https://my.powerdials.com/billing', '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Upgrade to Business
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card className="relative border-2 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Enterprise Plan</CardTitle>
            <CardDescription>Advanced features & support</CardDescription>
            <div className="text-2xl font-bold">~$80/month</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {planFeatures.map((feature) => (
              <div key={feature.name} className="flex items-center gap-3">
                <FeatureIcon supported={feature.enterprise} />
                <span className={`text-sm ${!feature.enterprise ? 'text-gray-400' : ''}`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-600" />
          What Changes with Business Plan?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current (Core Plan):</p>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Click phone number in Starz</li>
              <li>• Phone dialer opens automatically</li>
              <li>• You press call button manually</li>
              <li>• Call gets logged in CRM</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">With Business Plan:</p>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Click phone number in Starz</li>
              <li>• Call automatically starts dialing</li>
              <li>• No manual steps required</li>
              <li>• Advanced call analytics</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Contact POWERDIALS sales: <strong>traffikboosters@gmail.com</strong>
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.open('https://my.powerdials.com', '_blank')}
        >
          Manage POWERDIALS Account
        </Button>
      </div>
    </div>
  );
}