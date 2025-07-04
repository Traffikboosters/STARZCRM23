import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Zap, 
  Globe, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Play,
  BarChart3,
  Target,
  Rocket,
  Shield,
  Award,
  MessageCircle
} from 'lucide-react';
import ChatWidget from '@/components/chat-widget';
import traffikBoostersLogo from '@assets/TRAFIC BOOSTERS3 copy_1751503217918.png';

export default function TraffikBoostersWebsite() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleLeadSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const leadData = {
      firstName: company.split(' ')[0] || 'Business',
      lastName: 'Owner',
      email,
      phone,
      company,
      notes: `Website lead - Interested in digital marketing services. Company: ${company}`,
      leadSource: 'website',
      status: 'new',
      priority: 'high'
    };

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        setLeadSubmitted(true);
        setEmail('');
        setPhone('');
        setCompany('');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-orange-200 dark:border-orange-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={traffikBoostersLogo} 
              alt="Traffik Boosters" 
              className="h-12 w-auto crisp-edges"
            />
            <div>
              <h1 className="text-xl font-bold text-orange-600 dark:text-orange-400">Traffik Boosters</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">More Traffik! More Sales!</p>
            </div>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            Get Started Today
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-4 py-2">
            🚀 AI-Powered Marketing Revolution 2025
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-orange-800 bg-clip-text text-transparent">
            Dominate Your Market with AI-Driven Growth
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
            Transform your business with cutting-edge AI automation, viral social media strategies, 
            and conversion optimization that delivers 300%+ growth in today's competitive landscape.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg">
              <Rocket className="w-5 h-5 mr-2" />
              Launch AI Marketing Campaign
            </Button>
            <Button size="lg" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg">
              <Play className="w-5 h-5 mr-2" />
              Watch Success Stories
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Businesses Scaled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">300%</div>
              <div className="text-gray-600 dark:text-gray-400">Average ROI</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">AI Automation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">10M+</div>
              <div className="text-gray-600 dark:text-gray-400">Leads Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              2025's Hottest Marketing Solutions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Stay ahead with AI-powered strategies that capitalize on today's biggest trends
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* AI-Powered SEO */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">AI-Powered SEO</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    ChatGPT-optimized content and voice search optimization for 2025's search landscape
                  </p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    🔥 Trending Now
                  </Badge>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI content generation & optimization
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Voice search & mobile-first indexing
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Real-time algorithm adaptation
                  </li>
                </ul>
                <div className="text-2xl font-bold text-orange-600 mb-4">$2,500/mo</div>
              </CardContent>
            </Card>

            {/* Social Media Domination */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Viral Social Media</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    TikTok, Instagram Reels, and YouTube Shorts strategies that go viral in 2025
                  </p>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    📱 Gen Z Approved
                  </Badge>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI-generated viral content
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Cross-platform automation
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Influencer collaboration network
                  </li>
                </ul>
                <div className="text-2xl font-bold text-pink-600 mb-4">$3,500/mo</div>
              </CardContent>
            </Card>

            {/* Conversion Automation */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">AI Sales Funnels</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Automated lead nurturing with AI chatbots and personalized customer journeys
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    🤖 AI-Driven
                  </Badge>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    24/7 AI customer support
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Predictive lead scoring
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Automated follow-up sequences
                  </li>
                </ul>
                <div className="text-2xl font-bold text-blue-600 mb-4">$4,500/mo</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Trends Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Capitalize on 2025's Biggest Trends
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              We're ahead of the curve on what's driving business growth right now
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">AI Chat Commerce</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customers buy through AI chatbots on social media
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Sustainability Marketing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Eco-conscious branding drives customer loyalty
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Community Building</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Private communities create recurring revenue
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Micro-Influencers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Niche creators deliver better ROI than celebrities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Real Results from Real Businesses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "Traffik Boosters transformed our local HVAC business. We went from 10 leads per month to 150+ with their AI-powered local SEO."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    JM
                  </div>
                  <div>
                    <div className="font-semibold">John Martinez</div>
                    <div className="text-sm text-gray-500">Cool Air HVAC</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "Their viral TikTok strategy took our restaurant from unknown to 50K followers and tripled our weekend bookings in 3 months."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    SC
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-gray-500">Fusion Bistro</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "The AI chatbot handles 80% of our customer inquiries and actually converts better than our human sales team. ROI is incredible."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    DR
                  </div>
                  <div>
                    <div className="font-semibold">David Rodriguez</div>
                    <div className="text-sm text-gray-500">Elite Dental Care</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Dominate Your Market in 2025?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join 500+ businesses already using AI-powered marketing to crush their competition. 
            Get a free strategy session and see how we can 3x your growth.
          </p>

          {leadSubmitted ? (
            <div className="bg-white text-gray-900 rounded-lg p-8 max-w-md mx-auto">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p>We'll contact you within 24 hours with your custom growth strategy.</p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmission} className="max-w-md mx-auto">
              <div className="space-y-4 mb-6">
                <Input
                  type="email"
                  placeholder="Business Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white text-gray-900"
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-white text-gray-900"
                />
                <Input
                  type="text"
                  placeholder="Company Name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="bg-white text-gray-900"
                />
              </div>
              <Button size="lg" type="submit" className="w-full bg-white text-orange-600 hover:bg-gray-100 text-lg py-4">
                Get My Free Strategy Session
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          )}
          
          <p className="text-sm mt-4 opacity-75">
            No spam, ever. We respect your privacy.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={traffikBoostersLogo} 
                  alt="Traffik Boosters" 
                  className="h-8 w-auto"
                />
                <div>
                  <h3 className="font-bold text-orange-400">Traffik Boosters</h3>
                  <p className="text-sm text-gray-400">More Traffik! More Sales!</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered marketing solutions for the digital age.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>AI-Powered SEO</li>
                <li>Social Media Marketing</li>
                <li>Conversion Optimization</li>
                <li>Lead Generation</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Case Studies</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>(877) 840-6250</p>
                <p>hello@traffikboosters.com</p>
                <p>Available 24/7</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Traffik Boosters. All rights reserved. Built for today's digital leaders.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}