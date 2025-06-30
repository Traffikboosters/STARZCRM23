import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Users, 
  CheckCircle, 
  Phone, 
  Mail,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Rocket,
  BarChart3,
  Globe
} from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

export default function LandingPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/contacts", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        notes: formData.message,
        leadSource: "landing_page",
        leadStatus: "new",
        isDemo: false
      });

      if (response.ok) {
        toast({
          title: "Request Submitted!",
          description: "We'll contact you within 24 hours to discuss your growth strategy.",
        });
        
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          message: ""
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or call us directly at (877) 840-6250",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex flex-col items-start">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="h-22 w-auto object-contain mb-2"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <p className="text-sm text-orange-600 font-semibold">More Traffik! More Sales!</p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span className="font-medium">(877) 840-6250</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@traffikboosters.com</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 mb-6">
                🚀 Digital Marketing Experts
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Get More
                <span className="text-orange-600"> Traffic </span>
                & Boost Your
                <span className="text-red-600"> Sales</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We help businesses increase their online visibility, generate quality leads, 
                and convert more customers. No long-term contracts. Results-driven approach.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">No Monthly Contracts</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Proven Results</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">24/7 Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Custom Solutions</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold"
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg font-semibold"
                  onClick={() => window.location.href = 'tel:8778406250'}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </div>
            </div>

            <div className="lg:pl-8">
              <Card className="border-2 border-orange-200 shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Rocket className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Grow?</h3>
                    <p className="text-gray-600">Get your free marketing analysis today</p>
                  </div>
                  
                  <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        name="firstName"
                        placeholder="First Name *"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="border-gray-300 focus:border-orange-500"
                      />
                      <Input
                        name="lastName"
                        placeholder="Last Name *"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="border-gray-300 focus:border-orange-500"
                      />
                    </div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Business Email *"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-orange-500"
                    />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-orange-500"
                    />
                    <Input
                      name="company"
                      placeholder="Company Name *"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-orange-500"
                    />
                    <Textarea
                      name="message"
                      placeholder="Tell us about your business goals..."
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="border-gray-300 focus:border-orange-500"
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
                    >
                      {isSubmitting ? "Submitting..." : "Get My Free Analysis"}
                    </Button>
                  </form>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    We'll contact you within 24 hours with your personalized growth strategy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services Drive Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive digital marketing solutions tailored to your business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">SEO & Local Search</h3>
                <p className="text-gray-600 mb-4">
                  Dominate local search results and drive more qualified traffic to your business.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Google My Business optimization</li>
                  <li>• Local keyword targeting</li>
                  <li>• Review management</li>
                  <li>• Citation building</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Website Development</h3>
                <p className="text-gray-600 mb-4">
                  Professional websites that convert visitors into customers.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Mobile-responsive design</li>
                  <li>• Lead capture optimization</li>
                  <li>• Fast loading speeds</li>
                  <li>• SEO-ready structure</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <Target className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">PPC Advertising</h3>
                <p className="text-gray-600 mb-4">
                  Targeted ads that bring immediate results and qualified leads.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Google Ads management</li>
                  <li>• Facebook advertising</li>
                  <li>• Landing page optimization</li>
                  <li>• Conversion tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Social Media Marketing</h3>
                <p className="text-gray-600 mb-4">
                  Build your brand presence and engage with your audience across all platforms.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Content creation & posting</li>
                  <li>• Community management</li>
                  <li>• Social advertising</li>
                  <li>• Analytics & reporting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics & Reporting</h3>
                <p className="text-gray-600 mb-4">
                  Data-driven insights to optimize your marketing performance.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Performance tracking</li>
                  <li>• ROI analysis</li>
                  <li>• Monthly reports</li>
                  <li>• Strategy optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <Zap className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketing Automation</h3>
                <p className="text-gray-600 mb-4">
                  Streamline your marketing efforts with automated workflows.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Email marketing campaigns</li>
                  <li>• Lead nurturing sequences</li>
                  <li>• Customer journey mapping</li>
                  <li>• CRM integration</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Businesses Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">250%</div>
              <div className="text-orange-100">Average Traffic Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$2M+</div>
              <div className="text-orange-100">Revenue Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-orange-100">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Businesses Choose Traffik Boosters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another marketing agency. We're your growth partners.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Long-Term Contracts</h3>
                    <p className="text-gray-600">
                      Work with us month-to-month. We earn your business through results, not contracts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Implementation</h3>
                    <p className="text-gray-600">
                      See results quickly with our proven strategies and rapid deployment process.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Reporting</h3>
                    <p className="text-gray-600">
                      Get detailed monthly reports showing exactly what we're doing and the results we're achieving.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Dedicated Support</h3>
                    <p className="text-gray-600">
                      Direct access to your marketing team. No call centers, no runaround.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Schedule your free consultation and discover how we can help grow your business.
              </p>
              <div className="space-y-4">
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 py-3 text-lg font-semibold"
                  onClick={() => window.location.href = 'tel:8778406250'}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call (877) 840-6250
                </Button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Available Monday-Friday, 9 AM - 6 PM EST
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex flex-col items-start mb-4">
                <img 
                  src={traffikBoostersLogo} 
                  alt="Traffik Boosters" 
                  className="h-17 w-auto object-contain mb-2"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <p className="text-orange-400 text-sm font-semibold">More Traffik! More Sales!</p>
              </div>
              <p className="text-gray-300 mb-4">
                Helping businesses grow through proven digital marketing strategies.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-orange-400" />
                  <span>(877) 840-6250</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-orange-400" />
                  <span>info@traffikboosters.com</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-orange-400" />
                  <span>Mon-Fri: 9 AM - 6 PM EST</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li>SEO & Local Search</li>
                <li>Website Development</li>
                <li>PPC Advertising</li>
                <li>Social Media Marketing</li>
                <li>Marketing Automation</li>
                <li>Analytics & Reporting</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Traffik Boosters. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}