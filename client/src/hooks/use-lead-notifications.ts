import { useEffect, useRef, useState } from "react";

interface LeadNotificationOptions {
  enableSound: boolean;
  soundVolume: number;
  notificationTypes: {
    newLead: boolean;
    highValueLead: boolean;
    qualifiedLead: boolean;
  };
}

interface IncomingLead {
  id: number;
  businessName: string;
  contactName: string;
  source: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedValue: number;
  timestamp: Date;
}

export function useLeadNotifications(options: LeadNotificationOptions) {
  const [isEnabled, setIsEnabled] = useState(options.enableSound);
  const [volume, setVolume] = useState(options.soundVolume);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Request notification permission
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          setPermissionGranted(permission === 'granted');
        }
      } catch (error) {
        console.warn('Audio context initialization failed:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate notification sound
  const playNotificationSound = (type: 'newLead' | 'highValue' | 'qualified') => {
    if (!isEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different sounds for different lead types
    switch (type) {
      case 'newLead':
        // Pleasant chime for new leads
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        break;
      
      case 'highValue':
        // Excited beeps for high-value leads
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1400, ctx.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1400, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        break;
      
      case 'qualified':
        // Success tone for qualified leads
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        break;
    }

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  // Show browser notification
  const showBrowserNotification = (lead: IncomingLead) => {
    if (!permissionGranted) return;

    const notification = new Notification(`New ${lead.priority} Priority Lead`, {
      body: `${lead.businessName} from ${lead.source} - Est. Value: $${lead.estimatedValue.toLocaleString()}`,
      icon: '/favicon.ico',
      tag: `lead-${lead.id}`,
      requireInteraction: lead.priority === 'Critical',
    });

    // Auto-close after 5 seconds for non-critical leads
    if (lead.priority !== 'Critical') {
      setTimeout(() => notification.close(), 5000);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  // Main notification handler
  const handleIncomingLead = (lead: IncomingLead) => {
    const { priority, estimatedValue } = lead;
    
    // Determine notification type
    let notificationType: 'newLead' | 'highValue' | 'qualified' = 'newLead';
    
    if (estimatedValue > 10000 || priority === 'Critical') {
      notificationType = 'highValue';
    } else if (priority === 'High') {
      notificationType = 'qualified';
    }

    // Play sound based on settings
    if (options.notificationTypes[notificationType === 'highValue' ? 'highValueLead' : 
         notificationType === 'qualified' ? 'qualifiedLead' : 'newLead']) {
      playNotificationSound(notificationType);
    }

    // Show browser notification
    showBrowserNotification(lead);
  };

  // Simulate incoming leads for demo
  const simulateIncomingLead = () => {
    const sampleLeads: IncomingLead[] = [
      {
        id: Date.now(),
        businessName: "Bella Vista Restaurant",
        contactName: "Maria Gonzalez",
        source: "Yelp",
        priority: "High",
        estimatedValue: 4500,
        timestamp: new Date()
      },
      {
        id: Date.now() + 1,
        businessName: "TechFlow Solutions",
        contactName: "David Chen", 
        source: "Inc 5000",
        priority: "Critical",
        estimatedValue: 12000,
        timestamp: new Date()
      },
      {
        id: Date.now() + 2,
        businessName: "Metro Legal Associates",
        contactName: "Jennifer Smith",
        source: "YellowPages", 
        priority: "Medium",
        estimatedValue: 3200,
        timestamp: new Date()
      }
    ];

    const randomLead = sampleLeads[Math.floor(Math.random() * sampleLeads.length)];
    handleIncomingLead(randomLead);
  };

  return {
    isEnabled,
    setIsEnabled,
    volume,
    setVolume,
    permissionGranted,
    handleIncomingLead,
    simulateIncomingLead,
    playNotificationSound
  };
}