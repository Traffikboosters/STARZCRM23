import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Target,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Zap,
  Bot,
  FileText,
  BarChart3,
  PhoneCall
} from "lucide-react";
import traffikBoostersLogo from "@assets/TRAFIC BOOSTERS3 copy_1751060321835.png";
import ContactDetailsModal from "./contact-details-modal";

interface SalesRepDashboardProps {
  currentUser: any;
}

interface DashboardMetrics {
  dailyGoals: {
    callsTarget: number;
    callsMade: number;
    appointmentsTarget: number;
    appointmentsSet: number;
    dealsTarget: number;
    dealsClosed: number;
  };
  performance: {
    connectRate: number;
    appointmentRate: number;
    closingRate: number;
    avgDealSize: number;
    monthlyCommission: number;
    tier: string;
  };
  todaysActivity: {
    callsCompleted: number;
    emailsSent: number;
    appointmentsScheduled: number;
    dealsWorked: number;
  };
  upcomingTasks: Array<{
    id: number;
    type: 'call' | 'email' | 'meeting' | 'follow-up';
    contact: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recentLeads: Array<{
    id: number;
    name: string;
    company: string;
    phone: string;
    email: string;
    source: string;
    status: string;
    value: number;
    age: string;
  }>;
}

export default function SalesRepDashboard({ currentUser }: SalesRepDashboardProps) {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    dailyGoals: {
      callsTarget: 50,
      callsMade: 32,
      appointmentsTarget: 8,
      appointmentsSet: 5,
      dealsTarget: 2,
      dealsClosed: 1
    },
    performance: {
      connectRate: 68,
      appointmentRate: 15.6,
      closingRate: 12.5,
      avgDealSize: 2850,
      monthlyCommission: 3420,
      tier: "Gold"
    },
    todaysActivity: {
      callsCompleted: 32,
      emailsSent: 18,
      appointmentsScheduled: 5,
      dealsWorked: 8
    },
    upcomingTasks: [
      { id: 1, type: 'call', contact: 'Sarah Martinez - ABC Plumbing', time: '2:30 PM', priority: 'high' },
      { id: 2, type: 'meeting', contact: 'Demo - Tech Solutions Inc', time: '3:15 PM', priority: 'high' },
      { id: 3, type: 'follow-up', contact: 'Mike Johnson - Elite HVAC', time: '4:00 PM', priority: 'medium' },
      { id: 4, type: 'email', contact: 'Lisa Chen - Green Landscaping', time: '4:30 PM', priority: 'medium' },
      { id: 5, type: 'call', contact: 'David Rodriguez - Pro Electric', time: '5:00 PM', priority: 'low' }
    ],
    recentLeads: [
      { id: 1, name: 'Jennifer Wilson', company: 'Wilson Dental Care', phone: '(312) 555-0123', email: 'j.wilson@wilsondental.com', source: 'Bark.com', status: 'New', value: 3500, age: '2 hours' },
      { id: 2, name: 'Robert Kim', company: 'Kim Auto Repair', phone: '(415) 555-0456', email: 'robert@kimauto.com', source: 'Website', status: 'Contacted', value: 2200, age: '4 hours' },
      { id: 3, name: 'Amanda Foster', company: 'Foster Real Estate', phone: '(713) 555-0789', email: 'amanda@fosterrealestate.com', source: 'Yellow Pages', status: 'Qualified', value: 4800, age: '6 hours' },
      { id: 4, name: 'Carlos Mendez', company: 'Mendez Construction', phone: '(602) 555-0321', email: 'carlos@mendezconstruction.com', source: 'Business Insider', status: 'Demo Scheduled', value: 5200, age: '1 day' },
      { id: 5, name: 'Nicole Thompson', company: 'Thompson Law Firm', phone: '(206) 555-0654', email: 'nicole@thompsonlaw.com', source: 'Bark.com', status: 'Proposal Sent', value: 3800, age: '2 days' }
    ]
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-500';
      case 'Gold': return 'bg-yellow-500';
      case 'Silver': return 'bg-gray-400';
      case 'Bronze': return 'bg-orange-600';
      default: return 'bg-blue-500';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'follow-up': return <Clock className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'Contacted': return 'bg-orange-500';
      case 'Qualified': return 'bg-green-500';
      case 'Demo Scheduled': return 'bg-purple-500';
      case 'Proposal Sent': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Rep Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-12 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser?.firstName || 'Sales Rep'}!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${getTierColor(metrics.performance.tier)} text-white px-3 py-1`}>
            <Award className="h-4 w-4 mr-1" />
            {metrics.performance.tier} Tier
          </Badge>
          <Badge className="bg-green-500 text-white px-3 py-1">
            ${metrics.performance.monthlyCommission.toLocaleString()} Commission
          </Badge>
        </div>
      </div>

      {/* Daily Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Phone className="h-4 w-4 mr-2 text-blue-500" />
              Daily Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{metrics.dailyGoals.callsMade}</span>
              <span className="text-sm text-gray-500">/ {metrics.dailyGoals.callsTarget}</span>
            </div>
            <Progress value={(metrics.dailyGoals.callsMade / metrics.dailyGoals.callsTarget) * 100} className="mb-2" />
            <p className="text-xs text-gray-600">{Math.round((metrics.dailyGoals.callsMade / metrics.dailyGoals.callsTarget) * 100)}% of goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-green-500" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{metrics.dailyGoals.appointmentsSet}</span>
              <span className="text-sm text-gray-500">/ {metrics.dailyGoals.appointmentsTarget}</span>
            </div>
            <Progress value={(metrics.dailyGoals.appointmentsSet / metrics.dailyGoals.appointmentsTarget) * 100} className="mb-2" />
            <p className="text-xs text-gray-600">{Math.round((metrics.dailyGoals.appointmentsSet / metrics.dailyGoals.appointmentsTarget) * 100)}% of goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-purple-500" />
              Deals Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{metrics.dailyGoals.dealsClosed}</span>
              <span className="text-sm text-gray-500">/ {metrics.dailyGoals.dealsTarget}</span>
            </div>
            <Progress value={(metrics.dailyGoals.dealsClosed / metrics.dailyGoals.dealsTarget) * 100} className="mb-2" />
            <p className="text-xs text-gray-600">{Math.round((metrics.dailyGoals.dealsClosed / metrics.dailyGoals.dealsTarget) * 100)}% of goal</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="today">Today's Activity</TabsTrigger>
          <TabsTrigger value="leads">My Leads</TabsTrigger>
          <TabsTrigger value="tasks">Upcoming Tasks</TabsTrigger>
          <TabsTrigger value="email">Corporate Email</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.todaysActivity.callsCompleted}</p>
                    <p className="text-sm text-gray-600">Calls Made</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.todaysActivity.emailsSent}</p>
                    <p className="text-sm text-gray-600">Emails Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.todaysActivity.appointmentsScheduled}</p>
                    <p className="text-sm text-gray-600">Appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.todaysActivity.dealsWorked}</p>
                    <p className="text-sm text-gray-600">Deals Worked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="space-y-4">
            {metrics.recentLeads.map((lead) => (
              <Card 
                key={lead.id} 
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Lead card clicked:', lead);
                  const contactData = {
                    id: lead.id,
                    firstName: lead.name.split(' ')[0],
                    lastName: lead.name.split(' ').slice(1).join(' '),
                    email: lead.email,
                    phone: lead.phone,
                    company: lead.company,
                    status: lead.status,
                    dealValue: lead.value,
                    notes: `${lead.source} lead - ${lead.age} old`,
                    leadSource: lead.source,
                    priority: lead.status === 'New' ? 'high' : 'medium'
                  };
                  console.log('Setting contact data:', contactData);
                  setSelectedContact(contactData);
                  setIsDetailsModalOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{lead.name}</h3>
                          <p className="text-gray-600">{lead.company}</p>
                        </div>
                        <Badge className={`${getStatusColor(lead.status)} text-white`}>
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {lead.email}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                          ${lead.value.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {lead.age} ago
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <Bot className="h-4 w-4 mr-1" />
                        AI Assist
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-3">
            {metrics.upcomingTasks.map((task) => (
              <Card key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTaskIcon(task.type)}
                      <div>
                        <h4 className="font-medium">{task.contact}</h4>
                        <p className="text-sm text-gray-600 capitalize">{task.type.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{task.time}</p>
                      <Badge variant="outline" className="text-xs">
                        {task.priority} priority
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Access Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Corporate Email Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Work Email:</span>
                    <span className="text-sm font-bold text-blue-600">
                      {currentUser?.firstName?.toLowerCase() || 'michael'}.{currentUser?.lastName?.toLowerCase() || 'thompson'}@traffikboosters.com
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Email Server:</span>
                    <span className="text-sm">emailmg.ipage.com</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => window.open('https://emailmg.ipage.com/sqmail/src/webmail.php', '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Open Traffik Boosters Webmail
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const email = `${currentUser?.firstName?.toLowerCase() || 'michael'}.${currentUser?.lastName?.toLowerCase() || 'thompson'}@traffikboosters.com`;
                        navigator.clipboard.writeText(email);
                      }}
                    >
                      Copy Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const settings = `IMAP: imap.ipage.com:993 (SSL)\nSMTP: smtp.ipage.com:465 (SSL)\nUsername: ${currentUser?.firstName?.toLowerCase() || 'michael'}.${currentUser?.lastName?.toLowerCase() || 'thompson'}@traffikboosters.com`;
                        navigator.clipboard.writeText(settings);
                      }}
                    >
                      Copy Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Email Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const template = `Subject: Follow-up on Your Digital Marketing Needs

Hi [Client Name],

Thank you for your interest in Traffik Boosters' digital marketing services. I wanted to follow up on our conversation about boosting your online presence.

Our team specializes in:
• SEO Optimization & Local Search Rankings
• Google Ads & PPC Management  
• Website Design & Development
• Social Media Marketing

I'd love to schedule a brief 15-minute call to discuss how we can help drive more traffic and sales to your business.

Best regards,
${currentUser?.firstName || 'Michael'} ${currentUser?.lastName || 'Thompson'}
${currentUser?.firstName?.toLowerCase() || 'michael'}.${currentUser?.lastName?.toLowerCase() || 'thompson'}@traffikboosters.com
(877) 840-6250`;
                      navigator.clipboard.writeText(template);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Follow-up Template
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const template = `Subject: Service Proposal - Digital Marketing Solutions

Dear [Client Name],

Thank you for your interest in our services. Based on our discussion, I've prepared a customized proposal for your business needs.

Recommended Services:
• [Service Package] - $[Price]
• Estimated ROI: [Percentage]%
• Timeline: [Duration]

This proposal includes:
✓ Complete service implementation
✓ Monthly reporting & analytics
✓ Dedicated account management
✓ 3-day full refund guarantee

I'm available for a call at your convenience to discuss the details.

Best regards,
${currentUser?.firstName || 'Michael'} ${currentUser?.lastName || 'Thompson'}
Traffik Boosters Sales Team`;
                      navigator.clipboard.writeText(template);
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Proposal Template
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const template = `Subject: Appointment Confirmation - Digital Marketing Consultation

Hi [Client Name],

This confirms our appointment scheduled for:
Date: [Date]
Time: [Time]
Duration: 30 minutes
Meeting Link: [Video Call Link]

What to expect:
• Business needs assessment
• Custom strategy recommendations
• Pricing & timeline discussion
• Q&A session

Please let me know if you need to reschedule.

Looking forward to speaking with you!

${currentUser?.firstName || 'Michael'} ${currentUser?.lastName || 'Thompson'}
${currentUser?.firstName?.toLowerCase() || 'michael'}.${currentUser?.lastName?.toLowerCase() || 'thompson'}@traffikboosters.com`;
                      navigator.clipboard.writeText(template);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Appointment Confirmation
                  </Button>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Click any template to copy to clipboard, then paste into your email client.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Connect Rate</span>
                  <span className="font-bold text-green-600">{metrics.performance.connectRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Appointment Rate</span>
                  <span className="font-bold text-blue-600">{metrics.performance.appointmentRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Closing Rate</span>
                  <span className="font-bold text-purple-600">{metrics.performance.closingRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Deal Size</span>
                  <span className="font-bold text-orange-600">${metrics.performance.avgDealSize.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  AI Quick Replies
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bot className="h-4 w-4 mr-2" />
                  Conversation Starters
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Proposal
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Corporate Email Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Email:</span>
                    <span className="font-medium">{currentUser?.firstName?.toLowerCase() || 'sales'}.{currentUser?.lastName?.toLowerCase() || 'rep'}@traffikboosters.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Server:</span>
                    <span className="font-medium">emailmg.ipage.com</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => window.open('https://emailmg.ipage.com/sqmail/src/webmail.php', '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Open Webmail
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const email = `${currentUser?.firstName?.toLowerCase() || 'sales'}.${currentUser?.lastName?.toLowerCase() || 'rep'}@traffikboosters.com`;
                      navigator.clipboard.writeText(email);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Copy Email Address
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const settings = `
IMAP Settings:
Server: imap.ipage.com
Port: 993 (SSL/TLS)
Username: ${currentUser?.firstName?.toLowerCase() || 'sales'}.${currentUser?.lastName?.toLowerCase() || 'rep'}@traffikboosters.com

SMTP Settings:
Server: smtp.ipage.com
Port: 465 (SSL/TLS)
Username: ${currentUser?.firstName?.toLowerCase() || 'sales'}.${currentUser?.lastName?.toLowerCase() || 'rep'}@traffikboosters.com`;
                      navigator.clipboard.writeText(settings);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Copy IMAP/SMTP Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            console.log('Closing modal');
            setSelectedContact(null);
            setIsDetailsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}