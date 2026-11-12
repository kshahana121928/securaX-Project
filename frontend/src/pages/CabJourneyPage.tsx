import React, { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Play,
  Square,
  AlertTriangle,
  Radio,
  Sliders,
} from 'lucide-react';
import { LeafletMap } from '../components/maps/LeafletMap';
import { journeyService } from '../services/journeyService';
import { useEmergency } from '../context/EmergencyContext';
import { Journey } from '../types';

export const CabJourneyPage: React.FC = () => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [simIndex, setSimIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const { isSosActive, triggerInstantSos } = useEmergency();

  // Form for new journey
  const [formData, setFormData] = useState({
    startAddress: 'Cyber City, Gurugram',
    startLat: 28.5355,
    startLng: 77.391,
    destAddress: 'Connaught Place, New Delhi',
    destLat: 28.6139,
    destLng: 77.209,
    expectedDurationMinutes: 30,
    cabProvider: 'Uber / Cab',
    vehicleNumber: 'DL-01-CZ-8821',
    driverName: 'Vikram Singh',
    driverPhone: '+91 98100 11223',
  });

  const fetchActiveJourney = async () => {
    try {
      const res = await journeyService.getActiveJourney();
      if (res.success && res.journey) {
        setJourney(res.journey);
        if (res.journey.status === 'overdue' || res.journey.status === 'deviation_alert') {
          setIsPromptOpen(true);
        }
      } else {
        setJourney(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJourney();
  }, []);

  // Cab Movement Simulator effect
  useEffect(() => {
    let interval: any = null;
    if (isSimulating && journey && journey.plannedRoute.length > 0) {
      interval = setInterval(() => {
        setSimIndex((prev) => {
          const next = (prev + 1) % journey.plannedRoute.length;
          const currentPoint = journey.plannedRoute[next];
          // Check route deviation
          journeyService.checkRouteDeviation(journey._id, currentPoint, 300);
          return next;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, journey]);

  const handleStartJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await journeyService.startJourney({
        startPoint: {
          lat: formData.startLat,
          lng: formData.startLng,
          address: formData.startAddress,
        },
        destination: {
          lat: formData.destLat,
          lng: formData.destLng,
          address: formData.destAddress,
        },
        expectedDurationMinutes: Number(formData.expectedDurationMinutes),
        cabDetails: {
          cabProvider: formData.cabProvider,
          vehicleNumber: formData.vehicleNumber,
          driverName: formData.driverName,
          driverPhone: formData.driverPhone,
        },
      });
      if (res.success) {
        setJourney(res.journey);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error starting journey.');
    }
  };

  const handleSafetyResponse = async (isSafe: boolean) => {
    if (!journey) return;
    setIsPromptOpen(false);
    await journeyService.checkIn(journey._id, isSafe, isSafe ? 'Confirmed safe' : 'Distress response during cab ride');
    fetchActiveJourney();
  };

  const handleEndJourney = async () => {
    if (!journey) return;
    await journeyService.endJourney(journey._id);
    setIsSimulating(false);
    fetchActiveJourney();
  };

  const triggerOverdueTest = () => {
    setIsPromptOpen(true);
  };

  const currentCabCoord = journey?.plannedRoute[simIndex] || journey?.startPoint || { lat: 28.5355, lng: 77.391 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Car className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-black text-slate-900">Smart Cab Journey Monitoring</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracks route progress, detects prolonged stops, and automatically initiates safety check-ins if overdue.
          </p>
        </div>

        {journey && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition ${
                isSimulating ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'SIMULATING MOVEMENT' : 'Simulate Ride Movement'}</span>
            </button>

            <button
              onClick={handleEndJourney}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Arrived Safely (End Ride)
            </button>
          </div>
        )}
      </div>

      {/* Safety Prompt Modal (Are You Safe?) */}
      {isPromptOpen && (
        <div className="p-6 bg-amber-500 text-white rounded-3xl shadow-xl border-2 border-amber-600 animate-in fade-in flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-10 h-10 text-slate-950 animate-bounce" />
            <div>
              <h3 className="text-lg font-black tracking-wide text-slate-950">
                SAFETY CHECK: ARE YOU SAFE?
              </h3>
              <p className="text-xs text-slate-900 font-medium">
                Your journey has exceeded the expected arrival time or detected prolonged standstill. Confirm your safety now.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => handleSafetyResponse(true)}
              className="flex-1 md:flex-none py-3 px-6 bg-slate-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow transition"
            >
              YES, I AM SAFE
            </button>
            <button
              onClick={() => handleSafetyResponse(false)}
              className="flex-1 md:flex-none py-3 px-6 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-lg transition"
            >
              NO, DISPATCH SOS!
            </button>
          </div>
        </div>
      )}

      {/* Active Journey Dashboard OR Start Form */}
      {journey ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Live Route Corridor & Vehicle Marker</span>
              </span>
              <span className="font-mono text-slate-500">
                Status: <strong className="uppercase text-amber-600">{journey.status}</strong>
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <LeafletMap
                center={[currentCabCoord.lat, currentCabCoord.lng]}
                zoom={14}
                routePolyline={journey.plannedRoute}
                markers={[
                  {
                    lat: currentCabCoord.lat,
                    lng: currentCabCoord.lng,
                    title: `Cab: ${journey.cabDetails.vehicleNumber}`,
                    type: 'emergency',
                  },
                  {
                    lat: journey.startPoint.lat,
                    lng: journey.startPoint.lng,
                    title: 'Start Location',
                    type: 'start',
                  },
                  {
                    lat: journey.destination.lat,
                    lng: journey.destination.lng,
                    title: 'Destination',
                    type: 'destination',
                  },
                ]}
                className="h-80 w-full"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Duration</span>
                <span className="font-bold text-slate-800 block">{journey.expectedDurationMinutes} mins</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Number</span>
                <span className="font-bold text-slate-800 block font-mono">{journey.cabDetails.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Driver Name</span>
                <span className="font-bold text-slate-800 block">{journey.cabDetails.driverName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Driver Phone</span>
                <span className="font-bold text-slate-800 block font-mono">{journey.cabDetails.driverPhone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Status & Simulation Testing Controls */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Journey Safety Telemetry</h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pick-up:</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[160px]">{journey.startPoint.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Drop-off:</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[160px]">{journey.destination.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Arrival:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {new Date(journey.estimatedArrivalTime).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={triggerOverdueTest}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Simulate Overdue Prompt
              </button>

              <button
                onClick={() => handleSafetyResponse(false)}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Report Emergency During Ride
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              * Manual ride setup. SecuraX monitors the trip independently without requiring Uber/Ola API secrets.
            </p>
          </div>
        </div>
      ) : (
        /* Journey Setup Form */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-lg font-black text-slate-900 mb-1">Start a Protected Cab Journey</h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your cab details and destination. SecuraX tracks your progress and alerts family if delayed.
          </p>

          <form onSubmit={handleStartJourney} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Point</label>
                <input
                  type="text"
                  required
                  value={formData.startAddress}
                  onChange={(e) => setFormData({ ...formData, startAddress: e.target.value })}
                  placeholder="e.g. Cyber City, Gurugram"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  required
                  value={formData.destAddress}
                  onChange={(e) => setFormData({ ...formData, destAddress: e.target.value })}
                  placeholder="e.g. Connaught Place, New Delhi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cab Provider</label>
                <input
                  type="text"
                  value={formData.cabProvider}
                  onChange={(e) => setFormData({ ...formData, cabProvider: e.target.value })}
                  placeholder="Uber / Ola / Auto"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Plate No.</label>
                <input
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  placeholder="DL-01-CZ-8821"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Duration (Mins)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  required
                  value={formData.expectedDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, expectedDurationMinutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name (Optional)</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  placeholder="+91 98111 22334"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Cab Safety Monitoring</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
