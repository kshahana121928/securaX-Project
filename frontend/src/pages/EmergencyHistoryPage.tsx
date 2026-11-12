import React, { useState, useEffect } from 'react';
import {
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { emergencyService } from '../services/emergencyService';
import { EmergencySession } from '../types';

export const EmergencyHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<EmergencySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await emergencyService.getHistory();
        if (res.success) {
          setSessions(res.sessions);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center space-x-1 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>ACTIVE</span>
        </span>
      );
    }
    if (status === 'resolved') {
      return (
        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>RESOLVED</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full flex items-center space-x-1">
        <XCircle className="w-3.5 h-3.5" />
        <span>CANCELLED</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">Emergency Incident History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete immutable audit log of all triggered SOS alerts, silent alarms, and resolutions.
          </p>
        </div>
      </div>

      {/* History List */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Past Emergency Sessions</h3>
          <p className="text-xs text-slate-500 mt-1">
            Historical emergency sessions and resolution reasons will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <div key={session._id} className="p-6 hover:bg-slate-50 transition space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(session.status)}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                        {session.triggerType.replace(/_/g, ' ')}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Session ID: {session._id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(session.startedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Trigger Source</span>
                    <span className="font-semibold text-slate-800 block capitalize">
                      {session.triggerSource}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Location Fixed</span>
                    <span className="font-mono text-slate-800 block truncate">
                      {session.initialLocation
                        ? `${session.initialLocation.lat.toFixed(4)}, ${session.initialLocation.lng.toFixed(4)}`
                        : 'GPS Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Resolution Reason</span>
                    <span className="font-semibold text-slate-800 block truncate">
                      {session.cancelReason || 'Active / In Progress'}
                    </span>
                  </div>
                </div>

                {session.notes && (
                  <p className="text-xs text-slate-600 italic">
                    Note: "{session.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
