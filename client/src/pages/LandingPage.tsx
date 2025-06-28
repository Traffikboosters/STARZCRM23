import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Star, TrendingUp, Users, Target, CheckCircle, ArrowRight, Play } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";

export default function LandingPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/chat-widget/submit", {
        name: `${formData.firstName} ${formData.lastName}`,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        message: formData.message || `Interested in digital marketing services for ${formData.company}`
      });
      
      toast({
        title: "Thank you for your interest!",
        description: "A growth expert will call you within 24 business hours.",
      });
      
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or call us directly at (877) 840-6250.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      title: "Search Engine Optimization",
      description: "Dominate Google rankings and drive organic traffic",
      price: "Starting at $1,500/month",
      features: ["Keyword Research", "On-Page Optimization", "Link Building", "Monthly Reporting"],
      badge: "Most Popular"
    },
    {
      title: "Pay-Per-Click Advertising",
      description: "Instant visibility with targeted Google & Facebook ads",
      price: "Starting at $2,000/month",
      features: ["Google Ads Management", "Facebook & Instagram Ads", "Landing Page Creation", "Conversion Tracking"],
      badge: "Best ROI"
    },
    {
      title: "Website Development",
      description: "Modern, mobile-responsive websites that convert",
      price: "Starting at $3,500",
      features: ["Custom Design", "Mobile Responsive", "SEO Optimized", "Speed Optimized"],
      badge: "Premium"
    },
    {
      title: "Social Media Marketing",
      description: "Build your brand and engage customers on social platforms",
      price: "Starting at $1,200/month",
      features: ["Content Creation", "Community Management", "Paid Social Campaigns", "Analytics & Reporting"],
      badge: "Growth"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Williams",
      company: "Austin Home Renovation",
      rating: 5,
      text: "Traffik Boosters increased our leads by 300% in just 3 months. Their SEO work is incredible!"
    },
    {
      name: "Michael Chen",
      company: "Denver Plumbing Pro",
      rating: 5,
      text: "Best investment we've made. Our phone rings constantly with qualified leads now."
    },
    {
      name: "Emma Rodriguez",
      company: "SF Wedding Photography",
      rating: 5,
      text: "Professional service and amazing results. Our website traffic doubled!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={traffikBoostersLogo} 
                alt="Traffik Boosters" 
                className="h-28 w-auto object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Traffik Boosters</h1>
                <p className="text-sm text-orange-600 font-medium">More Traffik! More Sales!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="tel:8778406250" className="flex items-center text-orange-600 hover:text-orange-700">
                <Phone className="h-4 w-4 mr-2" />
                <span className="font-semibold">(877) 840-6250</span>
              </a>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Get Free Quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-100 text-orange-800">
                #1 Digital Marketing Agency
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Drive More Traffic,
                <span className="text-orange-600"> Generate More Sales</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                We help service businesses dominate their local market with proven SEO, PPC, and web development strategies that deliver real results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <Phone className="h-5 w-5 mr-2" />
                  Call (877) 840-6250
                </Button>
                <Button size="lg" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Free Consultation
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  No Long-Term Contracts
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Results Guaranteed
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Your Free Marketing Audit</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <Input
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Business Email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                  <Textarea
                    placeholder="Tell us about your business goals..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Get Free Audit"}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  We'll call you within 24 hours with your custom marketing strategy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See Our Results in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how we've transformed businesses like yours with our proven digital marketing strategies
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Client Success Stories</h3>
                  <p className="text-lg opacity-90 mb-6">
                    Real results from real businesses
                  </p>
                  <button 
                    onClick={() => setShowVideo(true)}
                    className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Watch Demo (3:45)
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">300% Lead Increase</h4>
                <p className="text-gray-600">Local HVAC company tripled their leads in 90 days</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">$50K Monthly Revenue</h4>
                <p className="text-gray-600">Plumbing business doubled their monthly income</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">24/7 Lead Flow</h4>
                <p className="text-gray-600">Automated systems that work around the clock</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">300%</div>
              <div className="text-orange-100">Average Lead Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24hrs</div>
              <div className="text-orange-100">Response Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-orange-100">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Digital Marketing Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialize in helping service businesses grow with proven digital marketing strategies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-shadow">
                {service.badge && (
                  <Badge className="absolute -top-2 left-4 bg-orange-600 text-white">
                    {service.badge}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                  <div className="text-2xl font-bold text-orange-600">{service.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real results from real businesses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Get a free marketing audit and discover how we can help you dominate your market
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
              <Phone className="h-5 w-5 mr-2" />
              Call (877) 840-6250
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-orange-700">
              <Mail className="h-5 w-5 mr-2" />
              Get Free Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={traffikBoostersLogo} 
                  alt="Traffik Boosters" 
                  className="h-28 w-auto object-contain"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <div>
                  <h3 className="text-lg font-bold">Traffik Boosters</h3>
                  <p className="text-sm text-orange-400">More Traffik! More Sales!</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner for digital marketing success
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Search Engine Optimization</li>
                <li>Pay-Per-Click Advertising</li>
                <li>Website Development</li>
                <li>Social Media Marketing</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Case Studies</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>(877) 840-6250</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>hello@traffikboosters.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Nationwide Service</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Traffik Boosters. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">Traffik Boosters - Client Success Stories</h3>
              <button 
                onClick={() => setShowVideo(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Demo Video Coming Soon</h4>
                <p className="text-lg mb-6 opacity-90">
                  We're currently producing a comprehensive video showcasing our client success stories
                </p>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>300% lead increase for HVAC company</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>$50K monthly revenue for plumbing business</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>24/7 automated lead generation systems</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Button 
                    onClick={() => setShowVideo(false)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
                  >
                    Get Free Audit Instead
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}