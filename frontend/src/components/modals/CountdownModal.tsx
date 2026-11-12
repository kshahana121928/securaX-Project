import React from 'react';
import { AlertTriangle, X, ShieldAlert, Zap } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const CountdownModal: React.FC = () => {
  const { isCountdownActive, countdown, cancelSosCountdown, triggerInstantSos } = useEmergency();

  if (!isCountdownActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-4 border-red-500 relative">
        <button
          onClick={cancelSosCountdown}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center border-4 border-red-500 mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40"></div>
          <span className="text-5xl font-black text-red-600 font-mono tracking-tighter">
            {countdown}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Emergency SOS Activating</h2>
        <p className="text-sm text-slate-600 mb-6">
          Dispatching emergency alerts with live GPS tracking to all your emergency contacts in{' '}
          <span className="font-bold text-red-600">{countdown}s</span>.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => triggerInstantSos('one_tap_sos')}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-red-500/30 transition transform active:scale-95"
          >
            <Zap className="w-5 h-5" />
            <span>DISPATCH IMMEDIATELY</span>
          </button>

          <button
            onClick={cancelSosCountdown}
            className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition"
          >
            Cancel (Accidental Press)
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>India Police Emergency: Dial 112 directly if offline</span>
        </div>
      </div>
    </div>
  );
};
