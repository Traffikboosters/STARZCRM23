import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Play,
  ChevronDown
} from "lucide-react";
import starzCoverImage from "@assets/TraffikBoosters11_1751408380219.jpg";
import { useToast } from "@/hooks/use-toast";

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function STARZLandingPage() {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/landing-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'STARZ Landing Page',
          leadType: 'inbound',
          priority: 'high'
        }),
      });

      if (response.ok) {
        toast({
          title: "Thank You!",
          description: "Your information has been received. Our team will contact you within 24 hours.",
        });
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Please try again or call us directly at (877) 840-6250",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section with Cover Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${starzCoverImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-orange-600/60"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
          <Badge className="mb-6 bg-orange-500 text-white text-lg px-6 py-2">
            STARZ Business Intelligence Platform
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            TRAFFIK<br />
            <span className="text-orange-400">BOOSTERS!!</span>
          </h1>
          
          <p className="text-2xl md:text-3xl mb-4 font-semibold text-orange-200">
            "MORE TRAFFIK! MORE SALES!"
          </p>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your business with AI-powered lead generation, smart CRM automation, 
            and proven marketing strategies that deliver results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg"
              onClick={() => setShowVideo(true)}
            >
              <Play className="mr-2 h-5 w-5" /> Watch Demo
            </Button>
          </div>
          
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-400">300%</div>
              <div className="text-lg">Lead Increase</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-400">$50K+</div>
              <div className="text-lg">Monthly Revenue</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-400">24/7</div>
              <div className="text-lg">Lead Flow</div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <ChevronDown className="h-8 w-8" />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete Business Growth Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to scale your business, from lead generation to conversion optimization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "AI Lead Generation",
                description: "Automated prospecting that finds and qualifies high-value leads 24/7",
                features: ["Smart targeting", "Lead scoring", "Automated outreach"]
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "CRM Automation",
                description: "Streamlined customer management with intelligent workflow automation",
                features: ["Contact management", "Pipeline tracking", "Follow-up automation"]
              },
              {
                icon: <Phone className="h-8 w-8" />,
                title: "Sales Optimization",
                description: "Convert more leads with AI-powered sales intelligence and coaching",
                features: ["Call tracking", "Performance analytics", "Sales coaching"]
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Digital Marketing",
                description: "Complete online presence optimization and marketing automation",
                features: ["SEO optimization", "Social media", "Content marketing"]
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "24/7 Lead Capture",
                description: "Never miss a potential customer with round-the-clock lead capture",
                features: ["Website chat", "Form optimization", "Lead notifications"]
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Proven Results",
                description: "Data-driven strategies that deliver measurable business growth",
                features: ["Performance tracking", "ROI analysis", "Growth reporting"]
              }
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300 border-orange-100">
                <CardHeader>
                  <div className="text-orange-500 mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 bg-gradient-to-br from-orange-500 to-red-600">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Boost Your Business?
            </h2>
            <p className="text-xl opacity-90">
              Get a free consultation and see how we can transform your lead generation
            </p>
          </div>
          
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Start Your Growth Journey</CardTitle>
              <CardDescription className="text-center">
                Fill out the form below and our team will contact you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Your company"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tell us about your business goals</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="What challenges are you facing? What are your growth goals?"
                    rows={4}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Get My Free Consultation'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-orange-400 mb-4">TRAFFIK BOOSTERS</h3>
              <p className="text-gray-300 mb-4">
                Your partner in business growth and digital transformation.
              </p>
              <p className="text-sm text-gray-400">
                More Traffik! More Sales!
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  (877) 840-6250
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  info@traffikboosters.com
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  www.traffikboosters.com
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
              <div className="text-gray-300 text-sm space-y-1">
                <div>Monday - Friday: 9:00 AM - 6:00 PM EST</div>
                <div>Emergency Support: 24/7</div>
                <div className="mt-4">
                  <Badge className="bg-green-600">
                    Available Now
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Traffik Boosters. All rights reserved. | Powered by STARZ Platform</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">STARZ Platform Demo</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowVideo(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
                  <p className="text-lg">Demo video coming soon...</p>
                  <p className="text-sm opacity-75 mt-2">
                    Call (877) 840-6250 for a live demonstration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}