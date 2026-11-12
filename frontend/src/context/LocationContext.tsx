import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LocationPoint } from '../types';
import { emergencyService } from '../services/emergencyService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface LocationContextType {
  location: LocationPoint | null;
  accuracy: number;
  isWatching: boolean;
  isSimulated: boolean;
  toggleSimulation: () => void;
  setManualLocation: (lat: number, lng: number, address?: string) => void;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default starting point (New Delhi Central / Connaught Place)
const DEFAULT_COORDS: LocationPoint = {
  lat: 28.6139,
  lng: 77.2090,
  accuracy: 10,
  address: 'Connaught Place, New Delhi',
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationPoint>(DEFAULT_COORDS);
  const [accuracy, setAccuracy] = useState<number>(10);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  const handlePositionSuccess = (position: GeolocationPosition) => {
    if (isSimulated) return;

    const newLoc: LocationPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy),
      timestamp: new Date().toISOString(),
    };
    setLocation(newLoc);
    setAccuracy(Math.round(position.coords.accuracy));

    // Stream through socket
    if (socket && user?.id) {
      socket.emit('stream_location', {
        userId: user.id,
        coordinates: { lat: newLoc.lat, lng: newLoc.lng },
        accuracy: newLoc.accuracy,
        speed: position.coords.speed || 0,
        heading: position.coords.heading || 0,
        timestamp: Date.now(),
      });
    }
  };

  const startWatching = () => {
    if ('geolocation' in navigator) {
      setIsWatching(true);
      navigator.geolocation.getCurrentPosition(
        handlePositionSuccess,
        (err) => {
          console.warn('[LocationContext] Geolocation notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        (err) => console.warn('[LocationContext] Watch error:', err.message),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }
  };

  useEffect(() => {
    startWatching();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isSimulated]);

  const toggleSimulation = () => {
    setIsSimulated((prev) => !prev);
  };

  const setManualLocation = (lat: number, lng: number, address?: string) => {
    const simulatedLoc: LocationPoint = {
      lat,
      lng,
      accuracy: 5,
      address: address || `Simulated Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      timestamp: new Date().toISOString(),
    };
    setLocation(simulatedLoc);
    setAccuracy(5);

    if (user?.id) {
      emergencyService.updateLocation({
        lat,
        lng,
        accuracy: 5,
        address: simulatedLoc.address,
      });

      if (socket) {
        socket.emit('stream_location', {
          userId: user.id,
          coordinates: { lat, lng },
          accuracy: 5,
          timestamp: Date.now(),
        });
      }
    }
  };

  const refreshLocation = () => {
    if (!isSimulated && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        handlePositionSuccess,
        (err) => console.warn(err.message),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        accuracy,
        isWatching,
        isSimulated,
        toggleSimulation,
        setManualLocation,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
