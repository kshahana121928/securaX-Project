import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { safetyService } from '../services/safetyService';
import { useEmergency } from '../context/EmergencyContext';
import { playBeep, playSafeChime } from '../utils/soundAlerts';

export const SafetyTimerPage: React.FC = () => {
  const [totalSeconds, setTotalSeconds] = useState(15 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [graceSeconds, setGraceSeconds] = useState(30);
  const [activeCheckInId, setActiveCheckInId] = useState<string | null>(null);
  const [note, setNote] = useState('Walking back from library / night commute');
  const { isSosActive } = useEmergency();

  // Presets
  const setPreset = (mins: number) => {
    setIsActive(false);
    setIsExpired(false);
    setTotalSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
  };

  // Fast Test Preset for placement demo
  const setTestDemo = () => {
    setIsActive(false);
    setIsExpired(false);
    setTotalSeconds(10);
    setRemainingSeconds(10);
  };

  useEffect(() => {
    let timer: any = null;
    if (isActive && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isActive && remainingSeconds === 0) {
      setIsActive(false);
      setIsExpired(true);
      playBeep(980, 0.4);
    }
    return () => clearInterval(timer);
  }, [isActive, remainingSeconds]);

  // Grace period countdown when expired
  useEffect(() => {
    let graceTimer: any = null;
    if (isExpired && graceSeconds > 0) {
      graceTimer = setInterval(() => {
        playBeep(880, 0.1);
        setGraceSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isExpired && graceSeconds === 0) {
      // Auto-escalate to SOS!
      handleRespond('help_needed');
    }
    return () => clearInterval(graceTimer);
  }, [isExpired, graceSeconds]);

  const handleStart = async () => {
    try {
      const mins = Math.max(1, Math.round(totalSeconds / 60));
      const res = await safetyService.startTimer(mins, note);
      if (res.success && res.checkIn) {
        setActiveCheckInId(res.checkIn._id);
      }
      setIsActive(true);
      setIsExpired(false);
      setGraceSeconds(30);
    } catch {
      setIsActive(true);
      setIsExpired(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setIsExpired(false);
    setRemainingSeconds(totalSeconds);
    setGraceSeconds(30);
  };

  const handleRespond = async (status: 'safe' | 'help_needed') => {
    setIsExpired(false);
    setIsActive(false);
    setRemainingSeconds(totalSeconds);

    if (status === 'safe') {
      playSafeChime();
      if (activeCheckInId) {
        await safetyService.respondTimer(activeCheckInId, 'safe');
      }
    } else {
      if (activeCheckInId) {
        await safetyService.respondTimer(activeCheckInId, 'help_needed');
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-black text-slate-900">Safety Check-In Timer</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dead-man switch countdown. If you do not tap "I'M SAFE" before the timer expires, an automated SOS is escalated.
          </p>
        </div>

        {/* Demo Fast Test Pill */}
        <button
          onClick={setTestDemo}
          className="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold text-xs rounded-xl flex items-center space-x-1 transition"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Demo 10s Fast Test</span>
        </button>
      </div>

      {/* Safety Prompt Modal When Timer Expires */}
      {isExpired && (
        <div className="p-6 bg-red-600 text-white rounded-3xl shadow-2xl border-4 border-red-400 animate-bounce flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <ShieldAlert className="w-12 h-12 text-white animate-spin" />
            <div>
              <h3 className="text-xl font-black tracking-wide">
                ARE YOU SAFE? TIME HAS EXPIRED!
              </h3>
              <p className="text-xs text-red-100">
                Automatic SOS escalation will dispatch to all emergency contacts in{' '}
                <span className="font-bold underline text-white text-sm">{graceSeconds}s</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => handleRespond('safe')}
              className="flex-1 md:flex-none py-3.5 px-6 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs rounded-2xl shadow transition"
            >
              I AM SAFE (RESET)
            </button>
            <button
              onClick={() => handleRespond('help_needed')}
              className="flex-1 md:flex-none py-3.5 px-6 bg-slate-950 hover:bg-black text-white font-black text-xs rounded-2xl shadow-xl transition"
            >
              NEED HELP (DISPATCH SOS)
            </button>
          </div>
        </div>
      )}

      {/* Main Countdown Display Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm max-w-xl mx-auto text-center space-y-6">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[15, 30, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => setPreset(mins)}
              disabled={isActive}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                totalSeconds === mins * 60
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } disabled:opacity-50`}
            >
              {mins} Minutes
            </button>
          ))}
        </div>

        {/* Circular Animated Countdown Dial */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="108"
              stroke="#E2E8F0"
              strokeWidth="14"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="108"
              stroke={isActive ? '#06B6D4' : '#2563EB'}
              strokeWidth="14"
              strokeDasharray={678}
              strokeDashoffset={678 - (678 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black font-mono tracking-tight text-slate-900">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              {isActive ? 'Monitoring Active' : 'Standby'}
            </span>
          </div>
        </div>

        {/* Note input */}
        <div className="max-w-md mx-auto text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Activity / Destination Note
          </label>
          <input
            type="text"
            value={note}
            disabled={isActive}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-500/20 transition transform active:scale-95 flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START SAFETY TIMER</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CANCEL TIMER</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
