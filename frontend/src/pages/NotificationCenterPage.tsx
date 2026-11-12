import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';

export const NotificationCenterPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      const channel = channelFilter === 'all' ? undefined : channelFilter;
      const res = await notificationService.getNotifications(channel);
      if (res.success) {
        setNotifications(res.notifications);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [channelFilter]);

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setNotice('Dispatched test broadcast across Push, SMS & Email channels...');
    try {
      await notificationService.sendTestNotification('push', 'Portfolio demonstration alert verification test.');
      loadNotifications();
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getChannelIcon = (ch: string) => {
    if (ch === 'sms') return <MessageSquare className="w-4 h-4 text-emerald-600" />;
    if (ch === 'email') return <Mail className="w-4 h-4 text-blue-600" />;
    return <Smartphone className="w-4 h-4 text-purple-600" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'delivered') {
      return (
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
          DELIVERED
        </span>
      );
    }
    if (status === 'simulated') {
      return (
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
          SIMULATED (DEMO)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
        FAILED
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">Emergency Notification Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch logs tracking automated alerts sent to emergency contacts via Web Push, Email & SMS.
          </p>
        </div>

        <button
          onClick={handleSendTest}
          disabled={isSendingTest}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSendingTest ? 'Broadcasting...' : 'Trigger Test Dispatch'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['all', 'sms', 'email', 'push'].map((ch) => (
          <button
            key={ch}
            onClick={() => setChannelFilter(ch)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
              channelFilter === ch
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {ch === 'all' ? 'All Channels' : ch}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Notifications in this Channel</h3>
          <p className="text-xs text-slate-500 mt-1">
            Emergency alerts dispatched by the engine will be logged here with proof of delivery.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <div key={item._id} className="p-5 hover:bg-slate-50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-slate-100 rounded-xl">{getChannelIcon(item.channel)}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
                      <span className="text-[11px] text-slate-500">
                        Recipient: <strong className="text-slate-700">{item.recipient}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      {new Date(item.sentAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line font-mono text-[11px]">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
