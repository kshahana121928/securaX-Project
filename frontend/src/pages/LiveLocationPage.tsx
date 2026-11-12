import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Share2,
  RefreshCw,
  Compass,
  Gauge,
  Sliders,
  History,
  Check,
  Copy,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { LeafletMap } from '../components/maps/LeafletMap';

// Fallback interface if service method is called
export const LiveLocationPage: React.FC = () => {
  const { location, accuracy, isSimulated, toggleSimulation, setManualLocation, refreshLocation } =
    useLocation();
  const { user } = useAuth();

  const [historyPoints, setHistoryPoints] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [customLat, setCustomLat] = useState('28.6139');
  const [customLng, setCustomLng] = useState('77.2090');

  useEffect(() => {
    // In memory or demo breadcrumbs
    if (location) {
      setHistoryPoints((prev) => [
        {
          lat: location.lat,
          lng: location.lng,
          time: new Date().toLocaleTimeString(),
          accuracy,
        },
        ...prev.slice(0, 9),
      ]);
    }
  }, [location?.lat, location?.lng]);

  const shareText = `Live GPS Location for ${user?.name || 'SecuraX User'}: https://maps.google.com/?q=${location?.lat},${location?.lng}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCustomCoords = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setManualLocation(lat, lng, 'Custom Evaluator Coordinate');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">Live GPS Location Telemetry</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geolocation tracking using HTML5 Geolocation & OpenStreetMap tile layer.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refreshLocation}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Fix</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share GPS'}</span>
          </button>
        </div>
      </div>

      {/* Main Map View */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <span className="w-3 h-3 rounded-full bg-cyan-500 animate-ping"></span>
            <span className="font-bold text-slate-900">Beacon Position</span>
            <span className="font-mono text-slate-500">
              {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Fixing...'}
            </span>
          </div>

          {/* Quick Simulation Mode Toggle */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">Desktop Simulation Mode:</span>
            <button
              onClick={toggleSimulation}
              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                isSimulated ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isSimulated ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Full Interactive Map */}
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
                      title: `${user?.name || 'You'} (Live Fix)`,
                      type: 'user',
                    },
                  ]
                : []
            }
            className="h-96 w-full"
            onMapClick={(lat, lng) => {
              if (isSimulated) {
                setManualLocation(lat, lng, 'Map Click Simulation Point');
              }
            }}
          />
        </div>

        {/* Location Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Fix Accuracy</div>
            <div className="text-xl font-black text-slate-900">±{accuracy} meters</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Latitude</div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {location?.lat.toFixed(5)}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Longitude</div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {location?.lng.toFixed(5)}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Updated</div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Controls for Evaluators & Breadcrumbs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evaluator Simulation Control Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>GPS Coordinate Simulation Tools</span>
          </h3>
          <p className="text-xs text-slate-500">
            Allows testing GPS location, cab movement, and route deviation on desktop machines without physical GPS movement.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Latitude</label>
              <input
                type="text"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Longitude</label>
              <input
                type="text"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleApplyCustomCoords}
              className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Teleport to Coords
            </button>
            <button
              onClick={() => setManualLocation(28.6139, 77.209, 'Connaught Place, New Delhi')}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Delhi (CP)
            </button>
            <button
              onClick={() => setManualLocation(28.5355, 77.391, 'Cyber City, Gurugram')}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Gurugram
            </button>
            <button
              onClick={() => setManualLocation(19.076, 72.8777, 'Bandra Kurla, Mumbai')}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Mumbai
            </button>
          </div>
        </div>

        {/* Live Breadcrumb Trail */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-600" />
            <span>Recent Geolocation Breadcrumbs</span>
          </h3>

          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {historyPoints.map((pt, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">{pt.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
