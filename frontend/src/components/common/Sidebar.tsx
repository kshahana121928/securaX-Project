import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Users,
  Car,
  Compass,
  Clock,
  HeartHandshake,
  FolderLock,
  History,
  Bell,
  Settings,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/emergency', label: 'Emergency SOS', icon: AlertTriangle, isSos: true },
  { to: '/location', label: 'Live Location', icon: MapPin },
  { to: '/contacts', label: 'Emergency Contacts', icon: Users },
  { to: '/cab-safety', label: 'Cab Safety', icon: Car },
  { to: '/route-monitoring', label: 'Route Monitoring', icon: Compass },
  { to: '/safety-timer', label: 'Safety Timer', icon: Clock },
  { to: '/helpers', label: 'Trusted Helpers', icon: HeartHandshake },
  { to: '/evidence', label: 'Evidence Locker', icon: FolderLock },
  { to: '/history', label: 'Emergency History', icon: History },
  { to: '/notifications', label: 'Notification Center', icon: Bell },
  { to: '/settings', label: 'Settings & PIN', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { isSosActive } = useEmergency();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0B1F3A] border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4rem)] p-4 select-none">
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition
                ${
                  item.isSos && isSosActive
                    ? 'bg-red-600 text-white animate-pulse font-bold'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }
              `}
            >
              <Icon
                className={`w-4 h-4 ${
                  item.isSos && isSosActive ? 'text-white' : 'text-cyan-400'
                }`}
              />
              <span>{item.label}</span>
              {item.isSos && isSosActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-white animate-ping"></span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Emergency Hotlines Card */}
      <div className="mt-auto pt-6">
        <div className="bg-[#071629] border border-slate-800 rounded-2xl p-4 text-xs">
          <p className="font-bold text-slate-200 mb-2 flex items-center justify-between">
            <span>Direct Emergency</span>
            <span className="text-[10px] text-red-400 font-normal">All India</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:112"
              className="p-2 bg-red-600 hover:bg-red-700 text-white text-center font-black rounded-lg transition"
            >
              112 Police
            </a>
            <a
              href="tel:102"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white text-center font-bold rounded-lg transition"
            >
              102 Med
            </a>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 text-center">
            Zero network required for phone calls
          </div>
        </div>
      </div>
    </aside>
  );
};
