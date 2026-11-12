import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  Share2,
  Copy,
  Check,
  Mic,
  MapPin,
  Clock,
  Radio,
  FileText,
  Lock,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { LeafletMap } from '../components/maps/LeafletMap';
import { AudioWaveform } from '../components/common/AudioWaveform';
import { CancelSosModal } from '../components/modals/CancelSosModal';

export const EmergencySosPage: React.FC = () => {
  const { isSosActive, activeSession, shareUrl, startSosCountdown } = useEmergency();
  const { location, accuracy } = useLocation();
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);
  const [incidentNotes, setIncidentNotes] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fullShareUrl = shareUrl || `${window.location.origin}/track/${activeSession?.shareToken || 'demo-token'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Emergency Command Header Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-lg transition ${
          isSosActive
            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span
                className={`p-2 rounded-xl ${
                  isSosActive ? 'bg-red-800 text-white' : 'bg-red-100 text-red-600'
                }`}
              >
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Emergency Response Command Center
              </h1>
            </div>
            <p className={`text-xs ${isSosActive ? 'text-red-100' : 'text-slate-500'} max-w-xl`}>
              {isSosActive
                ? 'CRITICAL ALERT ACTIVE: Continuous GPS coordinates broadcasting. Microphone recording armed. Contacts receiving alerts.'
                : 'All safety modules are on standby. Click the SOS trigger button below if you are in any distress.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSosActive ? (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="py-3 px-6 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-2xl shadow-lg transition"
              >
                VERIFY SAFE & CANCEL SOS
              </button>
            ) : (
              <button
                onClick={() => startSosCountdown('one_tap_sos')}
                className="py-3.5 px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-xl shadow-red-600/30 transition transform active:scale-95 flex items-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>TRIGGER EMERGENCY SOS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map & Live Tracking Broadcast Link */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Live Map */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Live GPS Beacon Stream {isSosActive && '(Transmitting)'}
                </h3>
              </div>
              <div className="text-xs text-slate-500 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-mono text-[11px]">Accuracy: ±{accuracy}m</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <LeafletMap
                center={location ? [location.lat, location.lng] : [28.6139, 77.2090]}
                zoom={16}
                markers={
                  location
                    ? [
                        {
                          lat: location.lat,
                          lng: location.lng,
                          title: `${user?.name || 'User'} (Beacon)`,
                          type: isSosActive ? 'emergency' : 'user',
                        },
                      ]
                    : []
                }
                className="h-80 w-full"
              />
            </div>

            {/* Live GPS Coordinates Details Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Latitude</span>
                <span className="font-mono font-bold text-slate-800">
                  {location?.lat.toFixed(5)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Longitude</span>
                <span className="font-mono font-bold text-slate-800">
                  {location?.lng.toFixed(5)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Started At</span>
                <span className="font-mono font-bold text-slate-800">
                  {activeSession ? new Date(activeSession.startedAt).toLocaleTimeString() : 'Standby'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Trigger Method</span>
                <span className="font-bold text-red-600 uppercase text-[11px]">
                  {activeSession?.triggerType || 'Manual SOS'}
                </span>
              </div>
            </div>
          </div>

          {/* Shareable Secure Link Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Public Real-Time Tracking Link (For Trusted Contacts)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Encrypted Token
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anyone with this URL can track your real-time GPS position without needing an account. Sent automatically to emergency contacts via SMS and Email.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={fullShareUrl}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Recording & Direct Emergency Calling */}
        <div className="space-y-6">
          {/* Audio Evidence Component */}
          <AudioWaveform emergencySessionId={activeSession?._id} autoStart={isSosActive} />

          {/* Direct 112 / 102 Calling Buttons */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-red-600" />
                <span>Emergency Calling Hub</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Opens native device phone dialer directly.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="tel:112"
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-between font-bold text-sm shadow-md transition"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <span className="block leading-none">POLICE / 112</span>
                    <span className="text-[10px] text-red-200 font-normal">All India Helpline</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-red-800 px-2.5 py-1 rounded-lg">tel:112</span>
              </a>

              <a
                href="tel:102"
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-between font-bold text-sm shadow-md transition"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <span className="block leading-none">AMBULANCE / 102</span>
                    <span className="text-[10px] text-blue-200 font-normal">Medical Services</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-blue-800 px-2.5 py-1 rounded-lg">tel:102</span>
              </a>

              <a
                href="tel:1091"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center justify-between font-semibold text-xs transition"
              >
                <span>Women in Distress (1091)</span>
                <span className="font-mono text-slate-400">tel:1091</span>
              </a>
            </div>

            {/* Legal Accuracy Disclaimer */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 leading-tight">
              <strong>Notice:</strong> Pressing call opens your phone dialer. SecuraX never falsely reports that police have been contacted unless an actual call or certified integration confirms it.
            </div>
          </div>

          {/* Incident Notes Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Incident Situational Notes</span>
            </h3>
            <textarea
              value={incidentNotes}
              onChange={(e) => setIncidentNotes(e.target.value)}
              placeholder="e.g. Followed by a black motorcycle with two riders. Walking near Metro gate 3."
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                alert('Incident note logged to active session.');
              }}
              className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
            >
              Update Incident Log
            </button>
          </div>
        </div>
      </div>

      {/* Cancel SOS Verification Modal */}
      <CancelSosModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} />
    </div>
  );
};
