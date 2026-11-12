import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  Car,
  Clock,
  PhoneCall,
  MapPin,
  ChevronRight,
  Radio,
  Zap,
  Activity,
  HeartHandshake,
  CheckCircle,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { useLocation } from '../context/LocationContext';
import { LeafletMap } from '../components/maps/LeafletMap';
import { CancelSosModal } from '../components/modals/CancelSosModal';
import { contactService } from '../services/contactService';
import { journeyService } from '../services/journeyService';
import { safetyService } from '../services/safetyService';
import { EmergencyContact, Journey, SafetyCheckIn } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isSosActive, activeSession, startSosCountdown, toggleSiren, isSirenPlaying } = useEmergency();
  const { location, accuracy, refreshLocation } = useLocation();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [activeTimer, setActiveTimer] = useState<SafetyCheckIn | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [cRes, jRes, tRes] = await Promise.allSettled([
          contactService.getContacts(),
          journeyService.getActiveJourney(),
          safetyService.getActiveTimer(),
        ]);

        if (cRes.status === 'fulfilled' && cRes.value.contacts) {
          setContacts(cRes.value.contacts);
        }
        if (jRes.status === 'fulfilled' && jRes.value.journey) {
          setActiveJourney(jRes.value.journey);
        }
        if (tRes.status === 'fulfilled' && tRes.value.checkIn) {
          setActiveTimer(tRes.value.checkIn);
        }
      } catch (e) {
        console.warn('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isSosActive]);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Safety Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900">
              Welcome, {user?.name || 'Guardian'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
              SecuraX Safe Guard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time emergency telemetry is synchronized. All 15 safety protocols armed.
          </p>
        </div>

        <div>
          {isSosActive ? (
            <div className="flex items-center space-x-3 bg-red-50 border-2 border-red-500 rounded-2xl p-3 shadow-md">
              <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping"></div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
                  EMERGENCY BROADCAST ACTIVE
                </span>
                <span className="text-[11px] text-red-600">Contacts receiving live coordinates</span>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="ml-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Resolve & Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5 bg-green-50 border border-green-200 rounded-2xl px-4 py-2.5 text-green-800">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <div>
                <span className="text-xs font-bold block">Status: Protected & Safe</span>
                <span className="text-[10px] text-green-600">No active incidents</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CENTERPIECE: GIANT PROMINENT RED SOS BUTTON */}
      <div className="bg-gradient-to-b from-[#0B1F3A] to-[#071629] rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Glow rings in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-96 h-96 rounded-full border-4 border-red-500 animate-ping"></div>
          <div className="w-72 h-72 rounded-full border-2 border-cyan-400 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-400 mb-2">
            One-Tap Emergency Response
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mb-6">
            Press in Any Threat or Danger
          </h2>

          {/* Pulsating Giant Red Button */}
          <div className="relative my-4">
            <div className="absolute -inset-4 bg-red-600 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <button
              onClick={() => startSosCountdown('one_tap_sos')}
              className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 text-white font-black text-3xl sm:text-4xl shadow-2xl border-8 border-red-400/40 flex flex-col items-center justify-center space-y-1 transition transform active:scale-95 hover:scale-105 group"
            >
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-bounce group-hover:rotate-12 transition" />
              <span className="tracking-wider">SOS</span>
              <span className="text-[11px] font-semibold text-red-200 uppercase tracking-widest">
                Hold 1-Tap
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-6 leading-relaxed">
            Clicking SOS triggers a 5-second countdown with immediate override. Automatically captures your GPS location, starts emergency audio evidence recording, and alerts {contacts.length} saved emergency contacts.
          </p>

          {/* Quick Siren and Hotline Pill */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={toggleSiren}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                isSirenPlaying
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSirenPlaying ? 'STOP EMERGENCY SIREN' : 'SOUND ALARM SIREN'}</span>
            </button>

            <a
              href="tel:112"
              className="px-4 py-2 bg-red-700/80 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow"
            >
              <PhoneCall className="w-4 h-4" />
              <span>DIAL 112 (POLICE)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4 Quick Telemetry Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Contacts Status */}
        <Link
          to="/contacts"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition flex items-center">
              Manage <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{contacts.length}</div>
          <div className="text-xs font-semibold text-slate-500">Emergency Contacts Armed</div>
          <div className="mt-2 text-[11px] text-slate-400">
            {contacts.find((c) => c.isPrimary)?.name || 'No primary selected'}
          </div>
        </Link>

        {/* Cab Safety Status */}
        <Link
          to="/cab-safety"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition flex items-center">
              Monitor <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeJourney ? 'Active' : 'Standby'}
          </div>
          <div className="text-xs font-semibold text-slate-500">Cab Journey Guardian</div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            {activeJourney
              ? `${activeJourney.cabDetails.vehicleNumber} (${activeJourney.cabDetails.driverName})`
              : 'Start ride monitoring'}
          </div>
        </Link>

        {/* Safety Timer */}
        <Link
          to="/safety-timer"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-cyan-600 group-hover:translate-x-0.5 transition flex items-center">
              Timer <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeTimer ? `${activeTimer.durationMinutes}m` : 'Off'}
          </div>
          <div className="text-xs font-semibold text-slate-500">Safety Check-In Switch</div>
          <div className="mt-2 text-[11px] text-slate-400">
            {activeTimer ? 'Countdown in progress' : '15m • 30m • 60m presets'}
          </div>
        </Link>

        {/* Live GPS Telemetry */}
        <Link
          to="/location"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-600 group-hover:translate-x-0.5 transition flex items-center">
              View Map <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">±{accuracy}m</div>
          <div className="text-xs font-semibold text-slate-500">GPS Fix Accuracy</div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
          </div>
        </Link>
      </div>

      {/* Mini Live Location Map & Emergency Helplines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Preview */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Live Location Beacon Preview</h3>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
              <span className="text-slate-500 font-mono text-[11px]">
                {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Fixing...'}
              </span>
              <button
                onClick={refreshLocation}
                className="text-blue-600 hover:text-blue-700 font-semibold text-xs ml-2"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
            <LeafletMap
              center={location ? [location.lat, location.lng] : [28.6139, 77.2090]}
              zoom={15}
              markers={
                location
                  ? [
                      {
                        lat: location.lat,
                        lng: location.lng,
                        title: `${user?.name || 'User'} (Current Location)`,
                        type: isSosActive ? 'emergency' : 'user',
                      },
                    ]
                  : []
              }
              className="h-72 w-full"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>OpenStreetMap / Leaflet tile engine</span>
            <Link to="/location" className="text-blue-600 font-semibold hover:underline">
              Open Full-Screen Map →
            </Link>
          </div>
        </div>

        {/* Quick Emergency Dialers & Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-red-500" />
              <span>One-Tap Direct Dialers</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Direct device dialer links. Bypasses internet restrictions.
            </p>

            <div className="space-y-2.5">
              <a
                href="tel:112"
                className="w-full p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-between font-bold text-sm shadow-md shadow-red-600/20 transition transform active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-5 h-5 text-white" />
                  <div>
                    <span className="block leading-none">POLICE / 112</span>
                    <span className="text-[10px] text-red-200 font-normal">Unified Emergency</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-red-800 px-2 py-0.5 rounded-lg">tel:112</span>
              </a>

              <a
                href="tel:102"
                className="w-full p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-between font-bold text-sm shadow-md shadow-blue-600/20 transition transform active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <Activity className="w-5 h-5 text-white" />
                  <div>
                    <span className="block leading-none">AMBULANCE / 102</span>
                    <span className="text-[10px] text-blue-200 font-normal">Medical Response</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-blue-800 px-2 py-0.5 rounded-lg">tel:102</span>
              </a>

              {contacts.slice(0, 2).map((contact) => (
                <a
                  key={contact._id}
                  href={`tel:${contact.phone}`}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-800 transition"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="truncate">{contact.name}</span>
                    <span className="text-[10px] text-slate-400">({contact.relationship})</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">{contact.phone}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/emergency"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Open Emergency Command Center</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Emergency SOS Modal */}
      <CancelSosModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} />
    </div>
  );
};
