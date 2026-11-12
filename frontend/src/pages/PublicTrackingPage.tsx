import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  PhoneCall,
  Clock,
  Heart,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { LeafletMap } from '../components/maps/LeafletMap';
import { emergencyService } from '../services/emergencyService';

export const PublicTrackingPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTracking = async () => {
    if (!shareToken) return;
    try {
      const res = await emergencyService.getPublicTracking(shareToken);
      if (res.success) {
        setData(res);
      } else {
        setError('Tracking link has expired or is invalid.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load emergency tracking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 6000);
    return () => clearInterval(interval);
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold tracking-wider uppercase text-cyan-400">
            Establishing Encrypted Emergency Stream...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tracking Session Not Found</h2>
          <p className="text-xs text-slate-600 mb-6">{error || 'This safety tracking session is no longer active.'}</p>
          <a
            href="tel:112"
            className="w-full inline-block py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Direct Dial Police (112)
          </a>
        </div>
      </div>
    );
  }

  const { session, user, recentLocations } = data;
  const isEmergencyActive = session.status === 'active';
  const lastLocation = session.lastLocation || session.initialLocation || { lat: 28.6139, lng: 77.2090 };

  return (
    <div className="min-h-screen bg-[#F4F7FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Emergency Status Header */}
        <div
          className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl ${
            isEmergencyActive
              ? 'bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-500'
              : 'bg-[#0B1F3A] border border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                <span className="text-xs font-black uppercase tracking-widest text-red-200">
                  {isEmergencyActive ? '🚨 URGENT EMERGENCY ACTIVE' : 'Safety Session Resolved'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{user?.name}'s Live Safety Tracker</h1>
              <p className="text-xs text-slate-200">
                You are viewing real-time telemetry shared by {user?.name} via SecuraX.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`tel:${user?.phone}`}
                className="py-2.5 px-4 bg-white text-slate-900 font-bold text-xs rounded-xl shadow hover:bg-slate-100 flex items-center space-x-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-green-600" />
                <span>Call {user?.name}</span>
              </a>
              <a
                href="tel:112"
                className="py-2.5 px-4 bg-red-950 text-white font-bold text-xs rounded-xl shadow hover:bg-black flex items-center space-x-1.5 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Call 112</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-slate-900 text-sm">Real-Time GPS Map Beacon</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Last updated: {new Date(lastLocation.timestamp || Date.now()).toLocaleTimeString()}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <LeafletMap
              center={[lastLocation.lat, lastLocation.lng]}
              zoom={16}
              markers={[
                {
                  lat: lastLocation.lat,
                  lng: lastLocation.lng,
                  title: `${user?.name} (Current)`,
                  type: isEmergencyActive ? 'emergency' : 'user',
                },
              ]}
              className="h-96 w-full"
            />
          </div>
        </div>

        {/* User Medical & Emergency Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Medical & Critical Info</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Blood Group:</span>
                <span className="font-bold text-slate-800">{user?.bloodGroup || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-bold text-slate-800 font-mono">{user?.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Emergency Instructions</span>
            </h3>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {user?.emergencyNote || 'Please contact family members or dial emergency services if unreachable.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
