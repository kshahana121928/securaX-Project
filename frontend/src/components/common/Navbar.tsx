import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Volume2,
  VolumeX,
  Calculator,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  AlertOctagon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';
import { OfflineBadge } from './OfflineBadge';
import { DisguiseModal } from '../modals/DisguiseModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSosActive, isSirenPlaying, toggleSiren, startSosCountdown } = useEmergency();
  const [isDisguiseOpen, setIsDisguiseOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#071629] border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0B1F3A] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white">
                SECURA<span className="text-red-500">X</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-cyan-400 uppercase tracking-widest font-semibold border-l border-slate-700 pl-2">
                Emergency Response
              </span>
            </div>
          </Link>

          {/* Center Emergency SOS Quick Trigger Pill */}
          {user && (
            <div className="flex items-center">
              {isSosActive ? (
                <Link
                  to="/emergency"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full flex items-center space-x-2 animate-pulse shadow-lg shadow-red-600/40"
                >
                  <AlertOctagon className="w-4 h-4 animate-spin" />
                  <span>EMERGENCY SOS ACTIVE</span>
                </Link>
              ) : (
                <button
                  onClick={() => startSosCountdown('one_tap_sos')}
                  className="px-3.5 py-1.5 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-full flex items-center space-x-1.5 shadow-md shadow-red-600/20 transition transform active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>TRIGGER SOS</span>
                </button>
              )}
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <OfflineBadge />

            {/* Siren Toggle */}
            <button
              onClick={toggleSiren}
              title={isSirenPlaying ? 'Mute Siren' : 'Test Emergency Siren'}
              className={`p-2 rounded-xl transition ${
                isSirenPlaying
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isSirenPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Disguise Mode / Fake Calculator */}
            <button
              onClick={() => setIsDisguiseOpen(true)}
              title="Stealth Mode (Calculator Disguise)"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition"
            >
              <Calculator className="w-5 h-5" />
            </button>

            {user ? (
              <>
                <Link
                  to="/notifications"
                  title="Notification Center"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
                </Link>

                <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-semibold max-w-[100px] truncate">{user.name}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-red-400 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-800 rounded-xl text-slate-200"
                  >
                    Overview Dashboard
                  </Link>
                  <Link
                    to="/emergency"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-red-900/40 text-red-300 rounded-xl"
                  >
                    Emergency SOS
                  </Link>
                  <Link
                    to="/cab-safety"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-800 rounded-xl text-slate-200"
                  >
                    Cab Journey Safety
                  </Link>
                  <Link
                    to="/safety-timer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-800 rounded-xl text-slate-200"
                  >
                    Safety Timer
                  </Link>
                  <Link
                    to="/contacts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-800 rounded-xl text-slate-200"
                  >
                    Emergency Contacts
                  </Link>
                  <Link
                    to="/evidence"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-800 rounded-xl text-slate-200"
                  >
                    Evidence Locker
                  </Link>
                  <Link
                    to="/helpers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-800 rounded-xl text-slate-200"
                  >
                    Trusted Helpers
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-800 rounded-xl text-slate-200"
                  >
                    Settings & Security
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold bg-slate-800 rounded-xl text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold bg-blue-600 rounded-xl text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Disguise Calculator Modal */}
      <DisguiseModal isOpen={isDisguiseOpen} onClose={() => setIsDisguiseOpen(false)} />
    </>
  );
};
