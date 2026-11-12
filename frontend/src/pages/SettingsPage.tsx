import React, { useState, useEffect } from 'react';
import {
  Settings,
  Lock,
  Smartphone,
  Radio,
  User,
  Heart,
  FileText,
  CheckCircle,
  Save,
  KeyRound,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { safetyService } from '../services/safetyService';
import { settingsService } from '../services/settingsService';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { startSosCountdown } = useEmergency();

  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || 'O+',
    medicalNotes: user?.medicalNotes || '',
    emergencyNote: user?.emergencyNote || '',
  });

  // PINs State (Feature 5)
  const [normalPin, setNormalPin] = useState('1234');
  const [secretEmergencyPin, setSecretEmergencyPin] = useState('9999');
  const [pinNotice, setPinNotice] = useState<string | null>(null);

  // Settings State (Features 9 & 13)
  const [settings, setSettings] = useState({
    voiceTriggerKeyword: 'help securax',
    isVoiceSOSActive: true,
    shakeSensitivity: 'medium' as 'low' | 'medium' | 'high',
    isShakeSOSEnabled: true,
    shakeCooldownSeconds: 5,
    routeDeviationThresholdMeters: 300,
  });

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.success && res.settings) {
          setSettings({
            voiceTriggerKeyword: res.settings.voiceTriggerKeyword || 'help securax',
            isVoiceSOSActive: res.settings.isVoiceSOSActive ?? true,
            shakeSensitivity: res.settings.shakeSensitivity || 'medium',
            isShakeSOSEnabled: res.settings.isShakeSOSEnabled ?? true,
            shakeCooldownSeconds: res.settings.shakeCooldownSeconds || 5,
            routeDeviationThresholdMeters: res.settings.routeDeviationThresholdMeters || 300,
          });
        }
      } catch (e) {
        // Use default
      }
    };
    loadSettings();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setSaveStatus('Profile updated successfully.');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('Failed to update profile.');
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safetyService.setupPins(normalPin, secretEmergencyPin);
      setPinNotice(res.message);
      setTimeout(() => setPinNotice(null), 4000);
    } catch (err: any) {
      setPinNotice(err.response?.data?.message || 'Error updating PINs.');
    }
  };

  const handleSettingsSave = async () => {
    try {
      await settingsService.updateSettings(settings);
      setSaveStatus('Safety sensor and hardware settings saved.');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('Error saving settings.');
    }
  };

  // Feature 9 Shake Simulator test
  const testShakeTrigger = () => {
    alert('DeviceMotion shake detected! Triggering emergency confirmation.');
    startSosCountdown('shake_sos');
  };

  // Feature 13 Voice Simulator test
  const testVoiceTrigger = () => {
    alert(`Web Speech keyword detected: "${settings.voiceTriggerKeyword}"! Triggering emergency confirmation.`);
    startSosCountdown('voice_sos');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">Safety & Security Configuration</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure emergency duress PINs, hardware shake triggers, voice keywords, and responder profiles.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal & Medical Responder Profile</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medical Notes / Allergies
              </label>
              <input
                type="text"
                value={profileForm.medicalNotes}
                onChange={(e) => setProfileForm({ ...profileForm, medicalNotes: e.target.value })}
                placeholder="e.g. Asthmatic, Penicillin allergy"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Instructions for Responders
              </label>
              <textarea
                rows={2}
                value={profileForm.emergencyNote}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyNote: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Update Profile Information
            </button>
          </form>
        </div>

        {/* Feature 5: Dual Security PIN Setup (Normal vs Secret Emergency PIN) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-red-600" />
              <span>Dual PIN Anti-Coercion Configuration</span>
            </h3>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Feature 5
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            If forced by an attacker, enter your Secret Duress PIN. It opens the calculator disguise without alarm while secretly alerting all contacts!
          </p>

          {pinNotice && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl">
              {pinNotice}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Normal Security PIN (Safe Exit & Resolve)
              </label>
              <input
                type="password"
                maxLength={6}
                required
                value={normalPin}
                onChange={(e) => setNormalPin(e.target.value)}
                placeholder="Default: 1234"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-center font-bold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Used to unlock disguise normally or verify safety when resolving an SOS.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-red-700 mb-1">
                2. Secret Emergency Duress PIN (Silent SOS)
              </label>
              <input
                type="password"
                maxLength={6}
                required
                value={secretEmergencyPin}
                onChange={(e) => setSecretEmergencyPin(e.target.value)}
                placeholder="Default: 9999"
                className="w-full px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-mono tracking-widest text-center font-bold text-red-700"
              />
              <span className="text-[10px] text-red-500 block mt-1">
                * Entering this PIN silently fires the emergency protocol without showing any alert on screen!
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Update Security PINs
            </button>
          </form>
        </div>
      </div>

      {/* Hardware Sensors: Shake to SOS (Feature 9) & Voice SOS (Feature 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature 9: Shake to Activate SOS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-orange-500" />
              <span>Shake to Activate SOS (Hardware Sensor)</span>
            </h3>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              Feature 9
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Uses HTML5 DeviceMotion API accelerometer data to detect vigorous repeated shaking. Provides a 5-second countdown to cancel accidental triggers.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Shake Detection Active:</span>
              <button
                onClick={() =>
                  setSettings({ ...settings, isShakeSOSEnabled: !settings.isShakeSOSEnabled })
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  settings.isShakeSOSEnabled
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {settings.isShakeSOSEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Accelerometer Sensitivity
              </label>
              <select
                value={settings.shakeSensitivity}
                onChange={(e: any) =>
                  setSettings({ ...settings, shakeSensitivity: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="low">Low (Requires hard shakes, prevents false alarms)</option>
                <option value="medium">Medium (Standard recommended)</option>
                <option value="high">High (Sensitive response)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={testShakeTrigger}
                className="flex-1 py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition"
              >
                Test Shake Trigger (Simulator)
              </button>
              <button
                onClick={handleSettingsSave}
                className="py-2 px-4 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Save
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              * Note: Continuous background shake detection while screen is locked requires a native mobile wrapper (Capacitor/PWA/Android).
            </p>
          </div>
        </div>

        {/* Feature 13: Voice-Activated SOS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Radio className="w-4 h-4 text-teal-600" />
              <span>Voice-Activated SOS (Web Speech Engine)</span>
            </h3>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              Feature 13
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Uses the browser's Web Speech API to detect your spoken keyword and arm the emergency countdown hands-free.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Voice SOS Active:</span>
              <button
                onClick={() =>
                  setSettings({ ...settings, isVoiceSOSActive: !settings.isVoiceSOSActive })
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  settings.isVoiceSOSActive
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {settings.isVoiceSOSActive ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Trigger Phrase
              </label>
              <input
                type="text"
                value={settings.voiceTriggerKeyword}
                onChange={(e) =>
                  setSettings({ ...settings, voiceTriggerKeyword: e.target.value })
                }
                placeholder="e.g. Help SecuraX, Emergency Alert"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={testVoiceTrigger}
                className="flex-1 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition"
              >
                Test Voice Phrase (Simulator)
              </button>
              <button
                onClick={handleSettingsSave}
                className="py-2 px-4 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Save
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              * Operates while tab is open. Browser security prevents continuous secret background listening without explicit user consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
