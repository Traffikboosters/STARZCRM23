// CRMPage.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PowerDials from '../components/powerdials-component';
import CallAnalytics from '../components/CallAnalytics';

export default function CRMPage() {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState({ contact: '', startDate: '', endDate: '' });

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
      }
    };

    fetchCallLogs();
  }, [currentUser, filter]);

  const handleLogCall = async (log) => {
    try {
      const res = await fetch('/api/call-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...log, userId: currentUser.id }),
      });

      if (res.ok) {
        const updatedLogs = [log, ...callLogs];
        setCallLogs(updatedLogs);
      }
    } catch (err) {
      console.error("Failed to save call log:", err);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  if (!currentUser) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column - PowerDials and Analytics */}
      <div className="xl:col-span-1 space-y-6">
        {/* Contact Selection */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-bold mb-4">Select Contact</h2>
          {selectedContact ? (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedContact.firstName} {selectedContact.lastName}</h3>
                  <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                  <p className="text-xs text-gray-500">{selectedContact.company}</p>
                </div>
                <button 
                  onClick={() => setSelectedContact(null)}
                  className="text-sm px-3 py-1 bg-white border rounded hover:bg-gray-50"
                >
                  Change
                </button>
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
        </div>

        {/* PowerDials Component */}
        <PowerDials contact={selectedContact} onCallLog={handleLogCall} />
        
        {/* Call Analytics */}
        <div className="mt-6">
          <CallAnalytics userId={currentUser.id} />
        </div>
      </div>

      {/* Right Column - Call History */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-bold mb-4">Call History</h2>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            name="contact"
            placeholder="Filter by contact"
            value={filter.contact}
            onChange={handleFilterChange}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Call Logs */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-gray-600">Loading call logs...</p>
          </div>
        ) : callLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No calls logged yet.</p>
            <p className="text-gray-400">Start making calls to see them here</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {callLogs.map((log, i) => (
              <li key={log.id || i} className="border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {log.notes?.replace('Call with ', '') || `Contact ID: ${log.contactId}` || 'Unknown Contact'}
                    </div>
                    <div className="text-sm text-gray-500">{log.phoneNumber}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700">{new Date(log.startTime).toLocaleDateString()}</div>
                    <div className="text-gray-500">{new Date(log.startTime).toLocaleTimeString()}</div>
                  </div>
                  <div className="text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      log.outcome === 'completed' ? 'bg-green-100 text-green-800' :
                      log.outcome === 'no_answer' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.outcome || log.dialResult || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {log.duration ? `${Math.floor(log.duration / 60)}:${(log.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}