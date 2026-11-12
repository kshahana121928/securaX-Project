import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmergencySession } from '../types';
import { emergencyService } from '../services/emergencyService';
import { useLocation } from './LocationContext';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { playEmergencySiren, stopEmergencySiren, playBeep, playSafeChime } from '../utils/soundAlerts';

interface EmergencyContextType {
  isSosActive: boolean;
  activeSession: EmergencySession | null;
  shareUrl: string | null;
  countdown: number;
  isCountdownActive: boolean;
  startSosCountdown: (triggerType?: string) => void;
  cancelSosCountdown: () => void;
  triggerInstantSos: (triggerType?: string, notes?: string) => Promise<void>;
  triggerSilentSos: (notes?: string) => Promise<void>;
  cancelActiveSos: (reason: string, notes?: string) => Promise<void>;
  isSirenPlaying: boolean;
  toggleSiren: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSosActive, setIsSosActive] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<EmergencySession | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);
  const [pendingTriggerType, setPendingTriggerType] = useState<string>('one_tap_sos');

  const { location } = useLocation();
  const { user } = useAuth();
  const { socket } = useSocket();

  // Check active emergency session on user load
  useEffect(() => {
    if (!user) {
      setIsSosActive(false);
      setActiveSession(null);
      return;
    }

    const checkActive = async () => {
      try {
        const res = await emergencyService.getActiveEmergency();
        if (res.isActive && res.session) {
          setIsSosActive(true);
          setActiveSession(res.session);
          setShareUrl(res.shareUrl);
        } else {
          setIsSosActive(false);
          setActiveSession(null);
        }
      } catch (e) {
        // Ignore network / offline error
      }
    };

    checkActive();
  }, [user]);

  // Socket listener for emergency status changes
  useEffect(() => {
    if (!socket) return;

    socket.on('emergency_status_changed', (data: { status: string; session: EmergencySession; shareUrl?: string }) => {
      if (data.status === 'active') {
        setIsSosActive(true);
        setActiveSession(data.session);
        if (data.shareUrl) setShareUrl(data.shareUrl);
      } else if (data.status === 'cancelled' || data.status === 'resolved') {
        setIsSosActive(false);
        setActiveSession(null);
        stopEmergencySiren();
        setIsSirenPlaying(false);
      }
    });

    return () => {
      socket.off('emergency_status_changed');
    };
  }, [socket]);

  // Countdown timer effect
  useEffect(() => {
    let timer: any = null;
    if (isCountdownActive && countdown > 0) {
      playBeep(880, 0.12);
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountdownActive && countdown === 0) {
      setIsCountdownActive(false);
      triggerInstantSos(pendingTriggerType);
    }

    return () => clearTimeout(timer);
  }, [isCountdownActive, countdown]);

  const startSosCountdown = (triggerType: string = 'one_tap_sos') => {
    setPendingTriggerType(triggerType);
    setCountdown(5);
    setIsCountdownActive(true);
  };

  const cancelSosCountdown = () => {
    setIsCountdownActive(false);
    setCountdown(5);
    playSafeChime();
  };

  const triggerInstantSos = async (triggerType: string = 'one_tap_sos', notes?: string) => {
    setIsCountdownActive(false);
    try {
      const res = await emergencyService.activateSos({
        triggerType,
        triggerSource: 'manual',
        location: location ? {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          address: location.address,
        } : undefined,
        notes,
      });

      if (res.success && res.session) {
        setIsSosActive(true);
        setActiveSession(res.session);
        setShareUrl(res.shareUrl);
      }
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    }
  };

  const triggerSilentSos = async (notes?: string) => {
    try {
      const res = await emergencyService.silentActivate({
        location: location ? {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          address: location.address,
        } : undefined,
        notes: notes || 'Silent Emergency PIN entered.',
      });

      if (res.success && res.session) {
        setIsSosActive(true);
        setActiveSession(res.session);
        setShareUrl(res.shareUrl);
      }
    } catch (err) {
      console.error('Silent SOS error:', err);
    }
  };

  const cancelActiveSos = async (reason: string, notes?: string) => {
    try {
      await emergencyService.cancelSos(reason, notes);
      setIsSosActive(false);
      setActiveSession(null);
      stopEmergencySiren();
      setIsSirenPlaying(false);
      playSafeChime();
    } catch (err) {
      console.error('Failed to cancel SOS:', err);
      throw err;
    }
  };

  const toggleSiren = () => {
    if (isSirenPlaying) {
      stopEmergencySiren();
      setIsSirenPlaying(false);
    } else {
      playEmergencySiren();
      setIsSirenPlaying(true);
    }
  };

  return (
    <EmergencyContext.Provider
      value={{
        isSosActive,
        activeSession,
        shareUrl,
        countdown,
        isCountdownActive,
        startSosCountdown,
        cancelSosCountdown,
        triggerInstantSos,
        triggerSilentSos,
        cancelActiveSos,
        isSirenPlaying,
        toggleSiren,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
