import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, BellRing, Megaphone } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationItem, User } from '../../types';
import { SendQuickNotificationModal } from '../../components/common/SendQuickNotificationModal';

interface OrganizerNotificationsProps {
  currentUser: User;
  onRefreshNotifs: () => void;
}

export const OrganizerNotifications: React.FC<OrganizerNotificationsProps> = ({ currentUser, onRefreshNotifs }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickNotifModal, setShowQuickNotifModal] = useState(false);

  useEffect(() => {
    loadNotifs();
  }, []);

  const loadNotifs = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications(currentUser.id);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n)));
    onRefreshNotifs();
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    onRefreshNotifs();
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Organizer Activity Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time alerts regarding event approvals, volunteer signups, and leadership applications.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickNotifModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            Send Quick Notification
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Mark All Read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
          <BellRing className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-semibold">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                n.readStatus
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 font-medium'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{n.createdAt}</p>
                </div>
                {!n.readStatus && (
                  <span className="w-2.5 h-2.5 bg-emerald-600 dark:bg-emerald-400 rounded-full shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <SendQuickNotificationModal
        isOpen={showQuickNotifModal}
        onClose={() => setShowQuickNotifModal(false)}
        currentUser={currentUser}
        onSuccess={loadNotifs}
      />
    </div>
  );
};
