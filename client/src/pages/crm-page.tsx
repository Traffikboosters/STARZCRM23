// CRMPage.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PowerDials from '../components/powerdials-component';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, User, Filter, RefreshCw, BarChart3 } from 'lucide-react';
import CallAnalytics from '../components/CallAnalytics';

export default function CRMPage() {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState({ contact: '', startDate: '', endDate: '' });
  const [activeTab, setActiveTab] = useState('dialer');
  const { toast } = useToast();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/users/me'],
  });

  // Get contacts for selection
  const { data: contactsData } = useQuery({
    queryKey: ['/api/contacts'],
  });

  useEffect(() => {
    const fetchCallLogs = async () => {
      if (!currentUser?.id) return;
      
      try {
        setLoading(true);
        const params = new URLSearchParams({ userId: currentUser.id.toString() });
        if (filter.contact) params.append('contact', filter.contact);
        if (filter.startDate) params.append('startDate', filter.startDate);
        if (filter.endDate) params.append('endDate', filter.endDate);

        const res = await fetch(`/api/call-logs?${params.toString()}`);
        const data = await res.json();
        setCallLogs(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch call logs:", error);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch call logs",
          variant: "destructive"
        });
      }
    };

    fetchCallLogs();
  }, [currentUser, filter, toast]);

  const handleLogCall = async (log) => {
    try {
      const res = await fetch('/api/call-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...log, 
          userId: currentUser.id,
          contact: selectedContact?.firstName + ' ' + selectedContact?.lastName || log.contact,
          contactId: selectedContact?.id || null
        }),
      });

      if (res.ok) {
        const newCallLog = await res.json();
        setCallLogs(prev => [newCallLog, ...prev]);
        toast({
          title: "Call Logged",
          description: `Call with ${log.contact || selectedContact?.firstName} logged successfully`,
        });
      }
    } catch (err) {
      console.error("Failed to save call log:", err);
      toast({
        title: "Error",
        description: "Failed to save call log",
        variant: "destructive"
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    toast({
      title: "Contact Selected",
      description: `Selected ${contact.firstName} ${contact.lastName} for calling`,
    });
  };

  const clearFilters = () => {
    setFilter({ contact: '', startDate: '', endDate: '' });
  };

  const formatCallDuration = (duration) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'completed':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'no_answer':
        return 'bg-yellow-100 text-yellow-800';
      case 'busy':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM PowerDials Integration</h1>
          <p className="text-gray-600">Complete contact management with integrated calling system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">PowerDials Ready</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dialer')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dialer'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>PowerDials & Call History</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Call Analytics</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dialer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Selection & PowerDials */}
        <div className="space-y-4">
          {/* Contact Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Select Contact to Call</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedContact ? (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedContact.firstName} {selectedContact.lastName}</h3>
                      <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                      <p className="text-xs text-gray-500">{selectedContact.company}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedContact(null)}>
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {contactsData?.contacts?.slice(0, 10).map((contact) => (
                    <div
                      key={contact.id}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="font-medium text-sm">{contact.firstName} {contact.lastName}</div>
                      <div className="text-xs text-gray-500">{contact.phone} • {contact.company}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* PowerDials Component */}
          <Card>
            <CardHeader>
              <CardTitle>PowerDials Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <PowerDials 
                contact={selectedContact} 
                onCallLog={handleLogCall} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Call History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Call History</span>
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <Input
                type="text"
                name="contact"
                placeholder="Filter by contact name"
                value={filter.contact}
                onChange={handleFilterChange}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  name="startDate"
                  value={filter.startDate}
                  onChange={handleFilterChange}
                />
                <Input
                  type="date"
                  name="endDate"
                  value={filter.endDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            {/* Call Logs List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading call logs...</p>
                </div>
              ) : callLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No calls logged yet</p>
                  <p className="text-sm text-gray-400">Start making calls to see them here</p>
                </div>
              ) : (
                callLogs.map((log, i) => (
                  <div key={log.id || i} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-sm">
                            {log.contact || `${log.contactId ? 'Contact ID: ' + log.contactId : 'Unknown'}`}
                          </h3>
                          <Badge className={getOutcomeColor(log.outcome || log.dialResult)}>
                            {log.outcome || log.dialResult || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span>📞 {log.phoneNumber}</span>
                            <span>⏱️ {formatCallDuration(log.duration)}</span>
                          </div>
                          <div>
                            🕒 {new Date(log.startTime || log.dialTimestamp).toLocaleString()}
                          </div>
                          {log.notes && (
                            <div className="text-gray-500 italic">"{log.notes}"</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        #{log.id}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && currentUser?.id && (
        <div className="space-y-6">
          <CallAnalytics userId={currentUser.id} />
        </div>
      )}
    </div>
  );
}