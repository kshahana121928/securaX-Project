import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, PhoneCall, MessageSquare } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { location } = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const smsText = encodeURIComponent(
    `EMERGENCY: I need help! SecuraX offline alert. My last known location is: Lat ${location?.lat.toFixed(
      4
    )}, Lng ${location?.lng.toFixed(4)}. Please dispatch help immediately.`
  );

  if (isOnline) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span>ONLINE</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-amber-500 text-slate-900 rounded-2xl shadow-lg border border-amber-600 animate-pulse">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-5 h-5 text-slate-950" />
        <div>
          <h5 className="font-bold text-xs uppercase tracking-wider">Offline Emergency Mode Active</h5>
          <p className="text-[11px] text-slate-900">
            Network unavailable. Use direct dialer or prefilled SMS below.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <a
          href="tel:112"
          className="flex-1 sm:flex-none px-3 py-1.5 bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>DIAL 112</span>
        </a>

        <a
          href={`sms:?body=${smsText}`}
          className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>FALLBACK SMS</span>
        </a>
      </div>
    </div>
  );
};
