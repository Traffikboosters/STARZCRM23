import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Calendar, Users, Video, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReportExport from "@/components/report-export";
import type { Event, Contact } from "@shared/schema";

export default function AnalyticsView() {
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const { data: contactsResponse } = useQuery<any>({
    queryKey: ['/api/contacts'],
  });

  // Handle the API response structure properly
  const contacts = contactsResponse?.contacts || [];

  // Calculate metrics
  const totalEvents = events.length;
  const totalContacts = Array.isArray(contacts) ? contacts.length : 0;
  const completedEvents = events.filter(e => e.status === "completed").length;
  const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).length;

  // Events by type data
  const eventsByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventTypeData = Object.entries(eventsByType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  // Lead status data
  const leadsByStatus = Array.isArray(contacts) ? contacts.reduce((acc, contact) => {
    const status = contact.leadStatus || "new";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

  const leadStatusData = Object.entries(leadsByStatus).map(([status, count]) => ({
    name: status.replace("_", " ").toUpperCase(),
    value: count,
  }));

  // Monthly events data (mock data for demo)
  const monthlyEventsData = [
    { month: "Jan", events: 12, calls: 8 },
    { month: "Feb", events: 19, calls: 12 },
    { month: "Mar", events: 15, calls: 10 },
    { month: "Apr", events: 22, calls: 15 },
    { month: "May", events: 18, calls: 11 },
    { month: "Jun", events: 25, calls: 18 },
  ];

  const COLORS = ['#0078D4', '#106EBE', '#00BCF2', '#107C10', '#FF8C00', '#D83B01'];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down";
    trendValue?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-neutral-light" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-dark">{value}</div>
        {trend && trendValue && (
          <div className="flex items-center space-x-1 mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-error" />
            )}
            <span className={`text-xs ${trend === "up" ? "text-success" : "text-error"}`}>
              {trendValue}
            </span>
            <span className="text-xs text-neutral-medium">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Analytics Header */}
      <div className="bg-white border-b border-neutral-lighter px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-dark">Analytics</h2>
          <Badge variant="secondary" className="text-xs">
            Real-time data
          </Badge>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="flex-1 bg-neutral-lightest p-6 overflow-auto">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={totalEvents}
            icon={Calendar}
            trend="up"
            trendValue="+12.5%"
          />
          <StatCard
            title="Total Contacts"
            value={totalContacts}
            icon={Users}
            trend="up"
            trendValue="+8.2%"
          />
          <StatCard
            title="Completed Events"
            value={completedEvents}
            icon={Video}
            trend="up"
            trendValue="+15.3%"
          />
          <StatCard
            title="Upcoming Events"
            value={upcomingEvents}
            icon={FileText}
            trend="down"
            trendValue="-3.1%"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Events by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-neutral-dark">Events by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lead Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-neutral-dark">Lead Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0078D4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-neutral-dark">Monthly Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyEventsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="events" stroke="#0078D4" strokeWidth={2} name="Events" />
                  <Line type="monotone" dataKey="calls" stroke="#107C10" strokeWidth={2} name="Calls" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-dark">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">
                  {((completedEvents / totalEvents) * 100 || 0).toFixed(1)}%
                </div>
                <p className="text-sm text-neutral-medium">Event Completion Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">
                  {contacts.filter(c => c.leadStatus === "closed_won").length}
                </div>
                <p className="text-sm text-neutral-medium">Closed Deals</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-2">
                  {contacts.filter(c => c.leadStatus === "qualified").length}
                </div>
                <p className="text-sm text-neutral-medium">Qualified Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Export Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-dark">Download & Email Analytics Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Performance Analytics Report</h4>
                <ReportExport
                  reportType="analytics"
                  reportData={{
                    metrics: {
                      totalEvents,
                      totalContacts,
                      completedEvents,
                      upcomingEvents,
                      eventCompletionRate: ((completedEvents / totalEvents) * 100 || 0).toFixed(1),
                      closedDeals: contacts.filter(c => c.leadStatus === "closed_won").length,
                      qualifiedLeads: contacts.filter(c => c.leadStatus === "qualified").length
                    },
                    eventTypeData,
                    monthlyEventsData,
                    contacts: contacts.map(c => ({
                      name: `${c.firstName} ${c.lastName}`,
                      email: c.email,
                      status: c.leadStatus,
                      source: c.leadSource,
                      budget: c.budget,
                      dealValue: c.dealValue
                    })),
                    events: events.map(e => ({
                      title: e.title,
                      type: e.type,
                      status: e.status,
                      startDate: e.startDate,
                      duration: e.duration
                    }))
                  }}
                  reportTitle="STARZ Analytics Dashboard Report"
                  fileName="starz_analytics_report"
                />
              </div>
              <div>
                <h4 className="font-semibold mb-3">Contact Performance Report</h4>
                <ReportExport
                  reportType="contacts"
                  reportData={contacts.map(c => ({
                    name: `${c.firstName} ${c.lastName}`,
                    email: c.email,
                    phone: c.phone,
                    company: c.company,
                    position: c.position,
                    leadStatus: c.leadStatus,
                    leadSource: c.leadSource,
                    budget: c.budget,
                    dealValue: c.dealValue,
                    priority: c.priority,
                    lastContact: c.lastContact,
                    nextFollowUp: c.nextFollowUp,
                    assignedUser: c.assignedUser?.firstName + ' ' + c.assignedUser?.lastName
                  }))}
                  reportTitle="STARZ Contact Management Report"
                  fileName="starz_contacts_report"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
