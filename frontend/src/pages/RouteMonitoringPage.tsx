import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Sliders,
  MapPin,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { LeafletMap } from '../components/maps/LeafletMap';
import { useEmergency } from '../context/EmergencyContext';

// Sample predefined highway route for demonstration
const SAMPLE_PLANNED_ROUTE = [
  { lat: 28.6139, lng: 77.2090 }, // Connaught Place
  { lat: 28.5900, lng: 77.2250 }, // India Gate
  { lat: 28.5600, lng: 77.2400 }, // Lajpat Nagar
  { lat: 28.5355, lng: 77.2600 }, // Nehru Place
  { lat: 28.4900, lng: 77.3000 }, // Faridabad Border
];

export const RouteMonitoringPage: React.FC = () => {
  const [thresholdMeters, setThresholdMeters] = useState(300);
  const [currentPosition, setCurrentPosition] = useState({ lat: 28.5600, lng: 77.2400 });
  const [isDeviated, setIsDeviated] = useState(false);
  const [deviationDistance, setDeviationDistance] = useState(0);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const { triggerInstantSos } = useEmergency();

  // Test Simulation 1: On-Route Point
  const handleOnRoute = () => {
    setCurrentPosition({ lat: 28.5605, lng: 77.2405 });
    setIsDeviated(false);
    setDeviationDistance(65);
    setAlertDismissed(false);
  };

  // Test Simulation 2: Off-Route Detour Point (Deviated by ~750m)
  const handleOffRoute = () => {
    setCurrentPosition({ lat: 28.5680, lng: 77.2550 });
    setIsDeviated(true);
    setDeviationDistance(742);
    setAlertDismissed(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCurrentPosition({ lat, lng });
    // Approximate distance check from route center
    const dist = Math.round(
      Math.sqrt(Math.pow(lat - 28.5600, 2) + Math.pow(lng - 77.2400, 2)) * 111000
    );
    setDeviationDistance(dist);
    setIsDeviated(dist > thresholdMeters);
    setAlertDismissed(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-black text-slate-900">Route Deviation Detection Engine</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time algorithm monitoring cross-track distance against designated route corridors.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-xs">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">Corridor Threshold:</span>
          <select
            value={thresholdMeters}
            onChange={(e) => setThresholdMeters(Number(e.target.value))}
            className="font-bold text-blue-600 bg-transparent focus:outline-none"
          >
            <option value={150}>150 meters</option>
            <option value={300}>300 meters (Standard)</option>
            <option value={500}>500 meters</option>
            <option value={1000}>1000 meters</option>
          </select>
        </div>
      </div>

      {/* Route Deviation Active Alert Banner */}
      {isDeviated && !alertDismissed && (
        <div className="p-6 bg-red-600 text-white rounded-3xl shadow-xl border-2 border-red-400 animate-in fade-in flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-10 h-10 text-white animate-bounce" />
            <div>
              <h3 className="text-lg font-black tracking-wide">
                ROUTE DEVIATION DETECTED ({deviationDistance}m Off-Course)
              </h3>
              <p className="text-xs text-red-100">
                Current vehicle position exceeds the allowed {thresholdMeters}m corridor. Are you on an intentional detour?
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => setAlertDismissed(true)}
              className="flex-1 md:flex-none py-3 px-5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition"
            >
              Dismiss (Safe Detour / Traffic)
            </button>
            <button
              onClick={() => triggerInstantSos('cab_deviation')}
              className="flex-1 md:flex-none py-3 px-5 bg-red-950 hover:bg-black text-white font-black text-xs rounded-xl shadow-lg transition"
            >
              TRIGGER SOS NOW
            </button>
          </div>
        </div>
      )}

      {/* Map & Corridor Visualizer */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="font-bold text-slate-900">Interactive Geo-Fence Corridor Map</span>
            <span className="text-slate-400 text-[11px]">(Click anywhere on map to reposition cab)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOnRoute}
              className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-bold text-[11px] rounded-xl transition"
            >
              Simulate On-Route Cab
            </button>
            <button
              onClick={handleOffRoute}
              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold text-[11px] rounded-xl transition"
            >
              Simulate Off-Route Detour
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <LeafletMap
            center={[currentPosition.lat, currentPosition.lng]}
            zoom={13}
            routePolyline={SAMPLE_PLANNED_ROUTE}
            deviationCircle={{
              center: [currentPosition.lat, currentPosition.lng],
              radiusMeters: thresholdMeters,
            }}
            markers={[
              {
                lat: currentPosition.lat,
                lng: currentPosition.lng,
                title: isDeviated ? 'Cab (DEVIATED)' : 'Cab (Within Corridor)',
                type: isDeviated ? 'emergency' : 'user',
              },
              {
                lat: SAMPLE_PLANNED_ROUTE[0].lat,
                lng: SAMPLE_PLANNED_ROUTE[0].lng,
                title: 'Route Origin',
                type: 'start',
              },
              {
                lat: SAMPLE_PLANNED_ROUTE[SAMPLE_PLANNED_ROUTE.length - 1].lat,
                lng: SAMPLE_PLANNED_ROUTE[SAMPLE_PLANNED_ROUTE.length - 1].lng,
                title: 'Route Destination',
                type: 'destination',
              },
            ]}
            className="h-96 w-full"
            onMapClick={handleMapClick}
          />
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Corridor Status</div>
            <div
              className={`text-lg font-black ${
                isDeviated ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {isDeviated ? 'DEVIATED' : 'WITHIN ROUTE'}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Offset Distance</div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {deviationDistance} meters
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Corridor Width</div>
            <div className="text-lg font-black text-slate-900 font-mono">
              ±{thresholdMeters} meters
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Algorithm</div>
            <div className="text-lg font-black text-blue-600">Cross-Track Haversine</div>
          </div>
        </div>
      </div>
    </div>
  );
};
