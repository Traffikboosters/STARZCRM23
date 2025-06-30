import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Phone, 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  MessageCircle, 
  FileText, 
  Settings, 
  Star,
  Plus,
  X,
  RefreshCw,
  Brain,
  Zap,
  Eye
} from "lucide-react";

interface WidgetRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
  icon: any;
  benefits: string[];
  estimatedImpact: string;
  setupTime: string;
  currentUsage?: boolean;
  reason: string;
}

interface UserActivity {
  totalLogins: number;
  contactsViewed: number;
  callsMade: number;
  emailsSent: number;
  appointmentsScheduled: number;
  reportsGenerated: number;
  mostUsedFeatures: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

interface PersonalizedDashboardWidgetsProps {
  userRole: string;
  userId: number;
}

export function PersonalizedDashboardWidgets({ userRole, userId }: PersonalizedDashboardWidgetsProps) {
  const [recommendations, setRecommendations] = useState<WidgetRecommendation[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // Simulate user activity analysis
  useEffect(() => {
    const analyzeUserBehavior = () => {
      // Simulate API call to analyze user behavior
      const mockActivity: UserActivity = {
        totalLogins: Math.floor(Math.random() * 50) + 10,
        contactsViewed: Math.floor(Math.random() * 200) + 50,
        callsMade: Math.floor(Math.random() * 100) + 20,
        emailsSent: Math.floor(Math.random() * 150) + 30,
        appointmentsScheduled: Math.floor(Math.random() * 25) + 5,
        reportsGenerated: Math.floor(Math.random() * 15) + 2,
        mostUsedFeatures: ['contacts', 'phone', 'calendar', 'analytics'],
        timeOfDay: 'morning',
        deviceType: 'desktop'
      };

      setUserActivity(mockActivity);
      generateRecommendations(mockActivity);
      setLoading(false);
    };

    analyzeUserBehavior();
  }, [userRole, userId]);

  const generateRecommendations = (activity: UserActivity) => {
    const allRecommendations: WidgetRecommendation[] = [
      {
        id: 'daily-call-goals',
        title: 'Daily Call Goals Tracker',
        description: 'Track your daily calling targets with visual progress indicators',
        category: 'productivity',
        priority: 'high',
        relevanceScore: 95,
        icon: Target,
        benefits: ['Increase call volume by 30%', 'Better goal tracking', 'Motivation boost'],
        estimatedImpact: 'High',
        setupTime: '2 minutes',
        reason: 'You make frequent calls but lack goal tracking',
        currentUsage: false
      },
      {
        id: 'lead-conversion-funnel',
        title: 'Lead Conversion Funnel',
        description: 'Visualize your lead progression through sales stages',
        category: 'analytics',
        priority: 'high',
        relevanceScore: 88,
        icon: TrendingUp,
        benefits: ['Identify bottlenecks', 'Improve conversion rates', 'Data-driven decisions'],
        estimatedImpact: 'High',
        setupTime: '3 minutes',
        reason: 'High contact viewing activity suggests need for conversion tracking',
        currentUsage: false
      },
      {
        id: 'quick-actions-panel',
        title: 'Quick Actions Panel',
        description: 'One-click access to your most used features',
        category: 'productivity',
        priority: 'medium',
        relevanceScore: 82,
        icon: Zap,
        benefits: ['Save 15 minutes daily', 'Streamlined workflow', 'Reduced clicks'],
        estimatedImpact: 'Medium',
        setupTime: '1 minute',
        reason: 'Based on your frequent feature usage patterns',
        currentUsage: false
      },
      {
        id: 'upcoming-appointments',
        title: 'Upcoming Appointments',
        description: 'Today\'s schedule with quick access to meeting details',
        category: 'scheduling',
        priority: 'high',
        relevanceScore: 90,
        icon: Calendar,
        benefits: ['Never miss appointments', 'Better time management', 'Quick preparation'],
        estimatedImpact: 'High',
        setupTime: '1 minute',
        reason: 'Regular appointment scheduling activity detected',
        currentUsage: false
      },
      {
        id: 'performance-metrics',
        title: 'Personal Performance Metrics',
        description: 'Your key performance indicators at a glance',
        category: 'analytics',
        priority: 'medium',
        relevanceScore: 75,
        icon: BarChart3,
        benefits: ['Track progress', 'Identify trends', 'Goal achievement'],
        estimatedImpact: 'Medium',
        setupTime: '2 minutes',
        reason: 'Analytics usage suggests interest in performance tracking',
        currentUsage: false
      },
      {
        id: 'recent-contacts',
        title: 'Recent Contacts Hub',
        description: 'Quick access to your most recently viewed contacts',
        category: 'contacts',
        priority: 'medium',
        relevanceScore: 85,
        icon: Users,
        benefits: ['Faster follow-ups', 'Improved workflow', 'Context retention'],
        estimatedImpact: 'Medium',
        setupTime: '1 minute',
        reason: 'High contact viewing frequency indicates need for quick access',
        currentUsage: false
      },
      {
        id: 'communication-center',
        title: 'Communication Center',
        description: 'Unified view of calls, emails, and messages',
        category: 'communication',
        priority: 'high',
        relevanceScore: 87,
        icon: MessageCircle,
        benefits: ['Centralized communications', 'Better response times', 'Organized workflow'],
        estimatedImpact: 'High',
        setupTime: '3 minutes',
        reason: 'Active in both calling and emailing suggests need for unified view',
        currentUsage: false
      },
      {
        id: 'weather-traffic',
        title: 'Weather & Traffic',
        description: 'Local conditions for better appointment planning',
        category: 'utility',
        priority: 'low',
        relevanceScore: 45,
        icon: Eye,
        benefits: ['Better planning', 'Professional preparation', 'Punctuality'],
        estimatedImpact: 'Low',
        setupTime: '2 minutes',
        reason: 'Useful for client meetings and travel planning',
        currentUsage: false
      }
    ];

    // Filter and sort based on user role and activity
    let filteredRecommendations = allRecommendations;

    if (userRole === 'sales_rep') {
      filteredRecommendations = allRecommendations.filter(rec => 
        ['productivity', 'communication', 'scheduling'].includes(rec.category)
      );
    } else if (userRole === 'manager') {
      filteredRecommendations = allRecommendations.filter(rec => 
        ['analytics', 'productivity'].includes(rec.category)
      );
    }

    // Boost relevance based on activity patterns
    filteredRecommendations.forEach(rec => {
      if (rec.category === 'communication' && activity.callsMade > 50) {
        rec.relevanceScore += 10;
      }
      if (rec.category === 'scheduling' && activity.appointmentsScheduled > 15) {
        rec.relevanceScore += 15;
      }
      if (rec.category === 'analytics' && activity.reportsGenerated > 10) {
        rec.relevanceScore += 12;
      }
    });

    // Sort by relevance score
    filteredRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

    setRecommendations(filteredRecommendations.slice(0, 6));
  };

  const addWidget = (widgetId: string) => {
    // Simulate adding widget to dashboard
    toast({
      title: "Widget Added",
      description: "The widget has been added to your dashboard",
    });

    // Update the recommendation to show it's been added
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === widgetId ? { ...rec, currentUsage: true } : rec
      )
    );
  };

  const dismissRecommendation = (widgetId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== widgetId));
    toast({
      title: "Recommendation Dismissed",
      description: "This widget won't be recommended again",
    });
  };

  const refreshRecommendations = () => {
    setLoading(true);
    setTimeout(() => {
      if (userActivity) {
        generateRecommendations(userActivity);
      }
      setLoading(false);
    }, 1000);
  };

  const categories = ['all', 'productivity', 'analytics', 'communication', 'scheduling', 'contacts', 'utility'];

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Analyzing Your Usage Patterns...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <div className="space-y-2 flex-1">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-gray-600">
                Personalizing widget recommendations based on your activity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-6 w-6 mr-2 text-blue-600" />
              Personalized Widget Recommendations
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshRecommendations}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            AI-powered recommendations based on your usage patterns and role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userActivity && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userActivity.contactsViewed}</div>
                <div className="text-sm text-gray-600">Contacts Viewed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userActivity.callsMade}</div>
                <div className="text-sm text-gray-600">Calls Made</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{userActivity.appointmentsScheduled}</div>
                <div className="text-sm text-gray-600">Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userActivity.emailsSent}</div>
                <div className="text-sm text-gray-600">Emails Sent</div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((recommendation) => {
          const IconComponent = recommendation.icon;
          return (
            <Card key={recommendation.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissRecommendation(recommendation.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                <CardDescription className="text-sm">
                  {recommendation.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Relevance Score */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Relevance Score</span>
                    <span className="font-medium">{recommendation.relevanceScore}%</span>
                  </div>
                  <Progress value={recommendation.relevanceScore} className="h-2" />
                </div>

                {/* Why Recommended */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">Why this widget?</p>
                  <p className="text-sm text-blue-700">{recommendation.reason}</p>
                </div>

                {/* Benefits */}
                <div>
                  <p className="text-sm font-medium mb-2">Key Benefits:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {recommendation.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <Star className="h-3 w-3 mr-2 text-yellow-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Impact</p>
                    <p className="text-green-600">{recommendation.estimatedImpact}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Setup Time</p>
                    <p className="text-blue-600">{recommendation.setupTime}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => addWidget(recommendation.id)}
                  disabled={recommendation.currentUsage}
                  className="w-full"
                >
                  {recommendation.currentUsage ? (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Added to Dashboard
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Widget
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Recommendations Available
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or refresh recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}