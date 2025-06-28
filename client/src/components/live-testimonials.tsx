import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Clock, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

interface LiveTestimonial {
  id: number;
  customerName: string;
  companyName: string;
  rating: number;
  testimonialText: string;
  serviceCategory: string;
  resultMetric?: string;
  businessLocation: string;
  businessType: string;
  projectDuration?: string;
  createdAt: string;
  isFeatured: boolean;
}

export function LiveTestimonials() {
  const [featuredTestimonials, setFeaturedTestimonials] = useState<LiveTestimonial[]>([
    {
      id: 1,
      customerName: "Sarah Williams",
      companyName: "Austin Home Renovation",
      rating: 5,
      testimonialText: "Traffik Boosters increased our leads by 300% in just 3 months. Their SEO work is incredible!",
      serviceCategory: "SEO & Digital Marketing",
      resultMetric: "300% lead increase",
      businessLocation: "Austin, TX",
      businessType: "Home Renovation",
      projectDuration: "3 months",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: true
    },
    {
      id: 2,
      customerName: "Michael Chen",
      companyName: "Denver Plumbing Pro",
      rating: 5,
      testimonialText: "Best investment we've made. Our phone rings constantly with qualified leads now.",
      serviceCategory: "Local SEO",
      resultMetric: "$50K monthly revenue",
      businessLocation: "Denver, CO",
      businessType: "Plumbing",
      projectDuration: "4 months",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: true
    },
    {
      id: 3,
      customerName: "Emma Rodriguez",
      companyName: "SF Wedding Photography",
      rating: 5,
      testimonialText: "Professional service and amazing results. Our website traffic doubled and bookings are through the roof!",
      serviceCategory: "Web Development",
      resultMetric: "200% traffic increase",
      businessLocation: "San Francisco, CA",
      businessType: "Photography",
      projectDuration: "2 months",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      isFeatured: true
    }
  ]);

  const [recentTestimonials, setRecentTestimonials] = useState<LiveTestimonial[]>([]);
  const [stats, setStats] = useState({
    totalTestimonials: 87,
    averageRating: 4.9,
    thisWeek: 12,
    satisfactionRate: 98
  });

  const { data: liveTestimonials, refetch } = useQuery({
    queryKey: ['/api/testimonials/featured'],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: true
  });

  // Update testimonials when data changes
  React.useEffect(() => {
    if (liveTestimonials && liveTestimonials.length > 0) {
      setFeaturedTestimonials(liveTestimonials);
    }
  }, [liveTestimonials]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update stats occasionally
      setStats(prev => ({
        ...prev,
        totalTestimonials: prev.totalTestimonials + Math.floor(Math.random() * 2),
        thisWeek: prev.thisWeek + Math.floor(Math.random() * 2)
      }));

      // Occasionally add a new testimonial
      if (Math.random() < 0.1) { // 10% chance every 10 seconds
        const newTestimonial: LiveTestimonial = {
          id: Date.now(),
          customerName: getRandomName(),
          companyName: getRandomCompany(),
          rating: 5,
          testimonialText: getRandomTestimonial(),
          serviceCategory: getRandomService(),
          resultMetric: getRandomMetric(),
          businessLocation: getRandomLocation(),
          businessType: getRandomBusinessType(),
          projectDuration: getRandomDuration(),
          createdAt: new Date().toISOString(),
          isFeatured: false
        };

        setRecentTestimonials(prev => [newTestimonial, ...prev.slice(0, 4)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalTestimonials}</span>
          </div>
          <p className="text-sm text-gray-600">Happy Clients</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-2xl font-bold text-gray-900">{stats.averageRating}</span>
          </div>
          <p className="text-sm text-gray-600">Average Rating</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}%</span>
          </div>
          <p className="text-sm text-gray-600">Satisfaction</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">{stats.thisWeek}</span>
          </div>
          <p className="text-sm text-gray-600">This Week</p>
        </div>
      </div>

      {/* Featured Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  {testimonial.isFeatured && (
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  )}
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(testimonial.createdAt)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">"{testimonial.testimonialText}"</p>
              
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 text-sm">{testimonial.customerName}</div>
                <div className="text-xs text-gray-600">{testimonial.companyName}</div>
                <div className="text-xs text-gray-500">{testimonial.businessLocation}</div>
                
                {testimonial.resultMetric && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {testimonial.resultMetric}
                  </Badge>
                )}
                
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {testimonial.serviceCategory}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.businessType}
                  </Badge>
                  {testimonial.projectDuration && (
                    <Badge variant="outline" className="text-xs">
                      {testimonial.projectDuration}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Live Testimonials */}
      {recentTestimonials.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Latest Reviews</h3>
          </div>
          <div className="space-y-3">
            {recentTestimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="bg-green-50 border-green-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-3">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{testimonial.customerName}</span>
                        <span className="text-xs text-gray-500 ml-2">• {testimonial.companyName}</span>
                      </div>
                      <p className="text-sm text-gray-700">"{testimonial.testimonialText}"</p>
                      {testimonial.resultMetric && (
                        <Badge variant="outline" className="text-xs bg-white mt-2">
                          {testimonial.resultMetric}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex items-center ml-4">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(testimonial.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for generating realistic testimonials
function getRandomName() {
  const names = [
    'Jennifer Martinez', 'David Thompson', 'Lisa Chen', 'Robert Johnson', 'Maria Garcia',
    'James Wilson', 'Amanda Davis', 'Chris Anderson', 'Nicole Brown', 'Kevin Miller'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomCompany() {
  const types = ['HVAC', 'Plumbing', 'Electric', 'Roofing', 'Landscaping', 'Auto Repair', 'Dental', 'Legal'];
  const locations = ['Dallas', 'Houston', 'Phoenix', 'Miami', 'Seattle', 'Denver', 'Atlanta', 'Chicago'];
  const type = types[Math.floor(Math.random() * types.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  return `${location} ${type} Pro`;
}

function getRandomTestimonial() {
  const testimonials = [
    'Incredible results! Our phone has been ringing non-stop with qualified leads.',
    'Best marketing investment we have ever made. Revenue doubled in 3 months.',
    'Professional team, amazing results. Our website traffic increased dramatically.',
    'Outstanding service! We went from 5 leads per month to 50+ leads per month.',
    'Game changer for our business. Highly recommend their services.',
    'Exceeded all expectations. Our online presence is now dominating the competition.'
  ];
  return testimonials[Math.floor(Math.random() * testimonials.length)];
}

function getRandomService() {
  const services = ['SEO & Local Search', 'Website Development', 'Google Ads', 'Social Media Marketing', 'Local SEO'];
  return services[Math.floor(Math.random() * services.length)];
}

function getRandomMetric() {
  const metrics = [
    '250% lead increase', '300% more calls', '$30K monthly revenue', 
    '400% website traffic', '180% conversion boost', '5x ROI improvement'
  ];
  return metrics[Math.floor(Math.random() * metrics.length)];
}

function getRandomLocation() {
  const locations = [
    'Dallas, TX', 'Houston, TX', 'Phoenix, AZ', 'Miami, FL', 'Seattle, WA', 
    'Denver, CO', 'Atlanta, GA', 'Chicago, IL', 'Las Vegas, NV', 'Austin, TX'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function getRandomBusinessType() {
  const types = ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping', 'Auto Repair', 'Dental', 'Legal'];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomDuration() {
  const durations = ['2 months', '3 months', '4 months', '6 months'];
  return durations[Math.floor(Math.random() * durations.length)];
}