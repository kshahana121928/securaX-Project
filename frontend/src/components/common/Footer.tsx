import React from 'react';
import { Shield, PhoneCall, Lock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#071629] border-t border-slate-800 text-slate-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white">
              SECURA<span className="text-red-500">X</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Smart Personal Safety & Emergency Response Platform. Providing real-time GPS tracking, silent alerts, cab monitoring and evidence locking.
          </p>
          <p className="text-[11px] text-cyan-400 font-medium">
            Tagline: Your Safety. Your Control. Always.
          </p>
        </div>

        {/* Emergency Hotlines */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center space-x-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-red-500" />
            <span>Emergency Hotlines (India)</span>
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="tel:112" className="text-red-400 hover:text-red-300 font-bold">
                112 – National Unified Emergency
              </a>
            </li>
            <li>
              <a href="tel:102" className="text-slate-300 hover:text-white">
                102 / 108 – Ambulance & Medical
              </a>
            </li>
            <li>
              <a href="tel:1091" className="text-slate-300 hover:text-white">
                1091 – Women in Distress Helpline
              </a>
            </li>
            <li>
              <a href="tel:1098" className="text-slate-300 hover:text-white">
                1098 – Childline Emergency
              </a>
            </li>
          </ul>
        </div>

        {/* Key Safety Pillars */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Privacy & Engineering</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>End-to-End User Controlled Access</li>
            <li>Zero Background Unwarranted Tracking</li>
            <li>Duress Secret PIN Stealth Disguise</li>
            <li>Encrypted Incident Evidence Vault</li>
            <li>Offline PWA Shell & Fallback SMS</li>
          </ul>
        </div>

        {/* Technical Notice */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
            Academic Project Notice
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            SecuraX is designed as a software placement portfolio and major engineering project demonstration. In true life-threatening emergencies, always dial 112 directly.
          </p>
          <div className="text-[11px] text-slate-500">
            Node.js • Express • MongoDB • React • Socket.IO • Leaflet
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div>&copy; {new Date().getFullYear()} SecuraX Platform. All rights reserved.</div>
        <div className="flex items-center space-x-1 mt-2 sm:mt-0">
          <span>Engineered with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>for personal safety & emergency defense.</span>
        </div>
      </div>
    </footer>
  );
};
