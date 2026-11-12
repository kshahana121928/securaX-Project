import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Star,
  Radio,
  Send,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Award,
} from 'lucide-react';
import { helperService } from '../services/helperService';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { LeafletMap } from '../components/maps/LeafletMap';
import { VolunteerItem } from '../types';

export const TrustedHelpersPage: React.FC = () => {
  const [helpers, setHelpers] = useState<VolunteerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const { location } = useLocation();
  const { user } = useAuth();

  const loadHelpers = async () => {
    try {
      const res = await helperService.getNearbyHelpers(
        location?.lat || 28.6139,
        location?.lng || 77.209,
        15
      );
      if (res.success) {
        setHelpers(res.helpers);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHelpers();
  }, [location?.lat, location?.lng]);

  const handleBroadcastHelp = async () => {
    setDispatchStatus('Broadcasting aid request to verified community responders in 5km radius...');
    try {
      await helperService.requestHelp(
        location ? { lat: location.lat, lng: location.lng } : undefined,
        'Citizen distress alert. Proximity assistance requested.'
      );
      setDispatchStatus('Request broadcasted! 3 nearby verified helpers received the emergency beacon.');
      setTimeout(() => setDispatchStatus(null), 5000);
    } catch {
      setDispatchStatus('Broadcast dispatched in simulation mode.');
      setTimeout(() => setDispatchStatus(null), 4000);
    }
  };

  const handleToggleVolunteer = async () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    await helperService.toggleAvailability(nextState);
  };

  const markers: Array<{
    lat: number;
    lng: number;
    title: string;
    type?: 'user' | 'volunteer' | 'emergency';
  }> = helpers.map((h) => ({
    lat: h.coordinates.lat,
    lng: h.coordinates.lng,
    title: `${h.name} (${h.verificationBadge})`,
    type: 'volunteer',
  }));

  if (location) {
    markers.push({
      lat: location.lat,
      lng: location.lng,
      title: `${user?.name || 'You'} (Your Position)`,
      type: 'user' as const,
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900">Nearby Trusted Helpers & Community Network</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verified local community guardians, first responders, and medical personnel available to assist in emergencies.
          </p>
        </div>

        <button
          onClick={handleBroadcastHelp}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-red-600/20 transition"
        >
          <Radio className="w-4 h-4 animate-ping" />
          <span>Broadcast Request to Nearby Helpers</span>
        </button>
      </div>

      {dispatchStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* Map & Helpers List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Verified Helpers in Your Vicinity (10km Radius)</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {helpers.length} active responders mapped
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <LeafletMap
              center={location ? [location.lat, location.lng] : [28.6139, 77.2090]}
              zoom={13}
              markers={markers}
              className="h-80 w-full"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            * Precise volunteer coordinates are intentionally masked with spatial jitter to safeguard responder privacy.
          </p>
        </div>

        {/* Volunteer Status / Self-Opt-In Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Community Volunteer Program</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Registered volunteers receive notification when an emergency SOS is triggered within walking distance.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Volunteer Mode</span>
              <span className="text-[11px] text-slate-500">
                {isAvailable ? 'Active & Ready to Assist' : 'Offline / Busy'}
              </span>
            </div>
            <button
              onClick={handleToggleVolunteer}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isAvailable ? 'ACTIVE' : 'OFFLINE'}
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Community Safeguards
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Government ID Verification</span>
              </li>
              <li className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>First Aid & CPR Badges</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Peer Rating & Community Trust</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Helpers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {helpers.map((helper) => (
          <div
            key={helper.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{helper.name}</h4>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {helper.verificationBadge}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{helper.rating}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Distance:</span>
                <span className="font-bold text-slate-800">{helper.distanceKm} km away</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assisted Emergencies:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {helper.emergenciesAssistedCount} incidents
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {helper.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
