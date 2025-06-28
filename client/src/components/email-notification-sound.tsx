import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EmailNotificationSoundProps {
  isActive: boolean;
  onNewEmail?: () => void;
}

export function EmailNotificationSound({ isActive, onNewEmail }: EmailNotificationSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create audio element with email notification sound
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Use a pleasant email notification sound
      audioRef.current.src = "data:audio/wav;base64,UklGRvIGAABXQVZFZm10IBAAAAABAAABACAAAQABACAAAQBSATAGBAAA";
      audioRef.current.volume = 0.6;
      audioRef.current.preload = 'auto';
    }
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current && isActive) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Audio playback failed:', error);
      });
    }
  };

  useEffect(() => {
    if (isActive && onNewEmail) {
      onNewEmail();
      playNotificationSound();
      
      // Show visual notification
      toast({
        title: "📧 New Email Received",
        description: "You have a new email notification",
        duration: 3000,
      });
    }
  }, [isActive, onNewEmail, toast]);

  return null;
}

// Enhanced notification sound with multiple tones
export function createEmailNotificationSound(): HTMLAudioElement {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const gainNode = audioContext.createGain();
  
  // Create a pleasant two-tone notification
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  
  oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator1.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
  
  oscillator2.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
  oscillator2.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator1.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 0.15);
  
  oscillator2.start(audioContext.currentTime + 0.1);
  oscillator2.stop(audioContext.currentTime + 0.3);
  
  // Return a mock audio element for compatibility
  const mockAudio = document.createElement('audio');
  mockAudio.play = () => {
    const newOscillator1 = audioContext.createOscillator();
    const newOscillator2 = audioContext.createOscillator();
    const newGainNode = audioContext.createGain();
    
    newOscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
    newOscillator1.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    newOscillator2.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    newOscillator2.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    newGainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    newGainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    newOscillator1.connect(newGainNode);
    newOscillator2.connect(newGainNode);
    newGainNode.connect(audioContext.destination);
    
    newOscillator1.start(audioContext.currentTime);
    newOscillator1.stop(audioContext.currentTime + 0.15);
    
    newOscillator2.start(audioContext.currentTime + 0.1);
    newOscillator2.stop(audioContext.currentTime + 0.3);
    
    return Promise.resolve();
  };
  
  return mockAudio;
}

// Global email notification manager
export class EmailNotificationManager {
  private static instance: EmailNotificationManager;
  private audio: HTMLAudioElement;
  private isEnabled: boolean = true;
  private notificationQueue: string[] = [];

  private constructor() {
    this.audio = createEmailNotificationSound();
  }

  static getInstance(): EmailNotificationManager {
    if (!EmailNotificationManager.instance) {
      EmailNotificationManager.instance = new EmailNotificationManager();
    }
    return EmailNotificationManager.instance;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  async playNotification(emailSubject?: string) {
    if (!this.isEnabled) return;

    try {
      await this.audio.play();
      
      if (emailSubject) {
        this.notificationQueue.push(emailSubject);
      }
      
      // Show desktop notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('📧 New Email', {
          body: emailSubject || 'You have received a new email',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.log('Email notification failed:', error);
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  getQueuedNotifications(): string[] {
    const queue = [...this.notificationQueue];
    this.notificationQueue = [];
    return queue;
  }
}