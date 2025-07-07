import { useEffect, useState } from 'react';
import { Mic, Phone, PhoneCall, Settings, User } from 'lucide-react';

// TypeScript window extension for PowerDials SDK
declare global {
  interface Window {
    PowerDials: any;
    MightyCall: any;
  }
}

interface Contact {
  name?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface CallLog {
  contact: string;
  number: string;
  timestamp: string;
  outcome: string;
}

interface PowerDialsProps {
  contact?: Contact | null;
  onCallLog?: (log: CallLog) => void;
}

export default function PowerDials({ contact = null, onCallLog = () => {} }: PowerDialsProps) {
  const [micAllowed, setMicAllowed] = useState(false);
  const [dialerReady, setDialerReady] = useState(false);
  const [callInProgress, setCallInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setMicAllowed(true);
        console.log('🎤 Microphone access granted');
      })
      .catch((err) => {
        setError("Microphone access is required to make calls.");
        console.error('❌ Microphone access denied:', err);
      });
  }, []);

  useEffect(() => {
    if (!micAllowed) return;

    const loadSDK = async () => {
      try {
        setLoading(true);
        console.log('🔧 Loading PowerDials SDK...');
        
        const script = document.createElement("script");
        script.src = "https://cdn.mightycall.com/sdk.js";
        script.onload = async () => {
          try {
            console.log('📞 Fetching PowerDials token...');
            const res = await fetch("/api/powerdials/token");
            const data = await res.json();
            
            if (!data.success) {
              throw new Error(data.error || 'Failed to get PowerDials token');
            }

            // Alias MightyCall SDK as PowerDials for user interface
            window.PowerDials = window.MightyCall;
            window.PowerDials.init({ apiKey: data.token });
            
            console.log('✅ PowerDials initialized successfully');
            setDialerReady(true);
            setLoading(false);

            // Set up event listeners
            window.PowerDials.on("callStart", () => {
              console.log('📞 Call started');
              setCallInProgress(true);
            });
            
            window.PowerDials.on("callEnd", () => {
              console.log('📞 Call ended');
              setCallInProgress(false);
              
              // Log the call
              const contactName = contact?.name || 
                                 (contact?.firstName && contact?.lastName 
                                   ? `${contact.firstName} ${contact.lastName}` 
                                   : "Manual Entry");
              const contactPhone = contact?.phone || contact?.phoneNumber || "Unknown";
              
              const log: CallLog = {
                contact: contactName,
                number: contactPhone,
                timestamp: new Date().toISOString(),
                outcome: "Completed"
              };
              onCallLog(log);
            });
          } catch (tokenError) {
            console.error('❌ PowerDials token error:', tokenError);
            setError('Failed to initialize PowerDials authentication');
            setLoading(false);
          }
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load PowerDials SDK');
          setError('Failed to load PowerDials SDK');
          setLoading(false);
        };
        
        document.body.appendChild(script);
      } catch (error) {
        console.error("❌ PowerDials initialization failed:", error);
        setError('PowerDials initialization failed');
        setLoading(false);
      }
    };

    loadSDK();
  }, [micAllowed]);

  const handleCall = () => {
    const number = contact?.phone || contact?.phoneNumber || prompt("Enter phone number to dial:");
    if (number && window.PowerDials) {
      try {
        console.log('📞 Initiating call to:', number);
        // Store the last dialed number for redial functionality
        localStorage.setItem('lastDialedNumber', number);
        window.PowerDials.call(number);
      } catch (error) {
        console.error('❌ Call failed:', error);
        alert('Failed to initiate call. Please try again.');
      }
    }
  };

  const handleRedial = () => {
    const lastNumber = localStorage.getItem('lastDialedNumber');
    if (lastNumber && window.PowerDials) {
      try {
        console.log('📞 Redialing:', lastNumber);
        window.PowerDials.call(lastNumber);
      } catch (error) {
        console.error('❌ Redial failed:', error);
        alert('Failed to redial. Please try again.');
      }
    } else {
      alert('No previous number to redial');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading PowerDials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
        <div className="flex items-center mb-2">
          <Settings className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-red-700 dark:text-red-400 font-medium">PowerDials Setup Required</h3>
        </div>
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
      {/* Header with Traffik Boosters Branding */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img 
            src="/attached_assets/TRAFIC BOOSTERS3 copy_1751503217918.png" 
            alt="Traffik Boosters" 
            className="h-8 w-auto mr-3 object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">PowerDials</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Professional Phone System</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Mic className={`h-5 w-5 ${micAllowed ? 'text-green-500' : 'text-red-500'}`} />
          <div className={`w-2 h-2 rounded-full ${dialerReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        </div>
      </div>

      {/* Contact Information */}
      {contact && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-center">
            <User className="h-4 w-4 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Calling: {contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim()}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {contact.phone || contact.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {contact ? 'Contact Mode' : 'Manual Dialing Mode'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${micAllowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {dialerReady ? 'Ready to Call' : 'Initializing...'}
            </span>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={handleCall}
          disabled={!dialerReady || callInProgress}
          className={`flex items-center justify-center px-6 py-4 rounded-xl font-medium transition-all ${
            callInProgress 
              ? 'bg-yellow-500 text-white cursor-not-allowed' 
              : dialerReady 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          }`}
        >
          {callInProgress ? (
            <>
              <PhoneCall className="h-5 w-5 mr-2 animate-pulse" />
              Call In Progress...
            </>
          ) : (
            <>
              <Phone className="h-5 w-5 mr-2" />
              {contact ? 'Start Call' : 'Make a Call'}
            </>
          )}
        </button>

        <button 
          onClick={handleRedial}
          disabled={!dialerReady || callInProgress}
          className={`flex items-center justify-center px-6 py-4 rounded-xl font-medium transition-all ${
            dialerReady && !callInProgress
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          }`}
        >
          <PhoneCall className="h-5 w-5 mr-2" />
          Redial
        </button>
      </div>

      {/* Call Status */}
      {callInProgress && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-center">
            <PhoneCall className="h-5 w-5 text-yellow-600 mr-2 animate-pulse" />
            <span className="text-yellow-700 dark:text-yellow-400 font-medium">
              Call in progress - Use your phone to continue
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          More Traffik! More Sales! • PowerDials Professional Phone System
        </p>
      </div>
    </div>
  );
}