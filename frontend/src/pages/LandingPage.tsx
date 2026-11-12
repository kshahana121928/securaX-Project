import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Car,
  Clock,
  Mic,
  Calculator,
  Lock,
  HeartHandshake,
  Smartphone,
  Radio,
  CheckCircle,
  PhoneCall,
  Sparkles,
  ArrowRight,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';

const FEATURES_LIST = [
  {
    title: 'One-Tap Emergency SOS',
    desc: 'Instant 5-second countdown with immediate override. Automatically transmits live coordinates to verified contacts.',
    icon: AlertTriangle,
    badge: 'Core Feature',
    color: 'text-red-500 bg-red-50 border-red-100',
  },
  {
    title: 'Live GPS Location Sharing',
    desc: 'Real-time WebSocket telemetry with accuracy meters, speed, heading and secure shareable tracking link.',
    icon: MapPin,
    badge: 'Real-Time',
    color: 'text-blue-500 bg-blue-50 border-blue-100',
  },
  {
    title: 'Emergency Audio Recording',
    desc: 'Automated high-fidelity microphone evidence capture with visual waveform meter and protected vault upload.',
    icon: Mic,
    badge: 'Evidence',
    color: 'text-purple-500 bg-purple-50 border-purple-100',
  },
  {
    title: 'One-Tap Emergency Calling',
    desc: 'Instant direct dialer integration to National Emergency 112, Medical 102, and primary family contacts.',
    icon: PhoneCall,
    badge: 'Offline-Ready',
    color: 'text-green-500 bg-green-50 border-green-100',
  },
  {
    title: 'Fake PIN / Silent SOS',
    desc: 'Dual PIN defense: Normal PIN (1234) unlocks the app, while Secret Duress PIN (9999) silently alerts contacts.',
    icon: Lock,
    badge: 'Anti-Coercion',
    color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
  },
  {
    title: 'Smart Cab Journey Monitoring',
    desc: 'Automated ride tracking with vehicle details, driver phone, estimated arrival countdown, and overdue prompts.',
    icon: Car,
    badge: 'Cab Safety',
    color: 'text-amber-500 bg-amber-50 border-amber-100',
  },
  {
    title: 'Route Deviation Detection',
    desc: 'Haversine distance algorithm detects when a vehicle strays >300m off the planned route corridor.',
    icon: Radio,
    badge: 'Geo-Fencing',
    color: 'text-rose-500 bg-rose-50 border-rose-100',
  },
  {
    title: 'Safety Check-In Timer',
    desc: 'Pre-set intervals (15m, 30m, 60m). If safe confirmation is missed, automatic emergency escalation fires.',
    icon: Clock,
    badge: 'Dead-Man Switch',
    color: 'text-cyan-500 bg-cyan-50 border-cyan-100',
  },
  {
    title: 'Shake to Activate SOS',
    desc: 'DeviceMotion accelerometer integration detects repeated physical shaking with false-trigger suppression.',
    icon: Smartphone,
    badge: 'Hardware Sensor',
    color: 'text-orange-500 bg-orange-50 border-orange-100',
  },
  {
    title: 'Nearby Trusted Helpers',
    desc: 'Community guardian network allowing verified local volunteers to receive emergency pings within 5km.',
    icon: HeartHandshake,
    badge: 'Community Defense',
    color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
  },
  {
    title: 'Emergency Evidence Locker',
    desc: 'Tamper-evident vault storing audio recordings, telemetry logs, journey history, and incident notes.',
    icon: Shield,
    badge: 'Encrypted Vault',
    color: 'text-blue-500 bg-blue-50 border-blue-100',
  },
  {
    title: 'Offline Emergency Mode',
    desc: 'PWA service worker caching emergency contact dialers and prefilled SMS templates with zero network.',
    icon: WifiOff,
    badge: 'PWA Offline',
    color: 'text-slate-500 bg-slate-50 border-slate-200',
  },
  {
    title: 'Voice-Activated SOS',
    desc: 'Web Speech recognition listens for user-defined trigger phrase ("Help SecuraX") and launches alarm.',
    icon: Radio,
    badge: 'Hands-Free',
    color: 'text-teal-500 bg-teal-50 border-teal-100',
  },
  {
    title: 'Calculator Disguise Mode',
    desc: 'Full-screen functional calculator stealth screen masking the emergency response system under threat.',
    icon: Calculator,
    badge: 'Stealth Camouflage',
    color: 'text-zinc-500 bg-zinc-50 border-zinc-200',
  },
  {
    title: 'Automatic Notification Engine',
    desc: 'Multi-channel dispatch engine syncing Web Push, SMTP Email alerts, and SMS fallback logs.',
    icon: Sparkles,
    badge: 'Multi-Channel',
    color: 'text-sky-500 bg-sky-50 border-sky-100',
  },
];

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const { startSosCountdown } = useEmergency();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    await demoLogin();
    navigate('/dashboard');
  };

  return (
    <div className="bg-[#F4F7FB] min-h-screen">
      {/* Top Emergency Hotlines Ticker */}
      <div className="bg-[#071629] text-slate-300 py-2 px-4 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              India Emergency 24/7 Hotlines:
            </span>
            <span className="text-slate-400">Dial 112 (Police & General) • 102 (Ambulance) • 1091 (Women Safety)</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-cyan-400 font-semibold">Zero-Config Demo Mode Ready</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1F3A] via-[#0B1F3A] to-[#071629] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Personal Safety & Emergency Response Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Stay Safe. Stay Connected. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-red-400">
                Always In Control.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              SecuraX empowers solo travellers, students, women, and seniors with one-tap emergency SOS, real-time GPS streaming, cab journey deviation detection, duress silent PINs, and encrypted evidence lockers.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleQuickDemo}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-cyan-500/20 transition transform active:scale-95"
              >
                <span>Launch Live Demonstration</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => startSosCountdown('one_tap_sos')}
                className="w-full sm:w-auto px-7 py-3.5 bg-red-600/90 hover:bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-red-600/30 transition transform active:scale-95 border border-red-400/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Test Live SOS Trigger</span>
              </button>

              {!user && (
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-2xl border border-slate-700 transition"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Quick Demo Credentials Pill */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 inline-block">
                Evaluator Quick Demo: <strong className="text-cyan-300">demo@securax.com</strong> / <strong className="text-cyan-300">SecuraX@123</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Step Flow */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Emergency Architecture
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">How SecuraX Protects You in Seconds</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-xl mb-6">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Emergency Trigger</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trigger via One-Tap Red SOS, secret Duress PIN (9999), device shake, voice command, or unconfirmed cab route deviation.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl mb-6">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Channel Broadcast</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time WebSocket telemetry transmits precise coordinates, ambient audio evidence, and a secure live tracking link to emergency contacts.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center font-black text-xl mb-6">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Coordinated Response</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Contacts view live GPS movement on interactive Leaflet maps, nearby verified community guardians are alerted, and direct 112 dialing is armed.
            </p>
          </div>
        </div>
      </section>

      {/* 15 Core Features Showcase Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              All 15 Safety Technologies Built-In
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every single module is fully functional with connected MongoDB models, REST endpoints, and responsive interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_LIST.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety & Anti-Coercion Guarantee */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0B1F3A] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Stealth & Anti-Coercion Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 mb-4">
              Under Duress? Switch to Calculator Camouflage Instantly.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              If an assailant forces you to open your phone, entering your Secret Duress PIN (9999) on the disguise calculator silently transmits your coordinates, starts mic capture, and alerts contacts without ever showing an emergency indicator on screen.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Zero Suspicious Screens</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Bcrypt PIN Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No Third-Party Tracker SDKs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Placement & Tech Portfolio Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-slate-900">
            Engineered for Placement Demonstration & Portfolio Review
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Built with modern React 18, TypeScript, Tailwind CSS, Express REST API, MongoDB/Mongoose, Socket.IO, Web Audio API, DeviceMotion API, Web Speech API, and OpenStreetMap Leaflet integration.
          </p>
          <div className="pt-2">
            <button
              onClick={handleQuickDemo}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Open Dashboard as Demo User
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
