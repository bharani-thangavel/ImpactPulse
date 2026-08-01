import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, BellRing, Megaphone, HeartPulse, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationItem, User } from '../../types';
import { SendQuickNotificationModal } from '../../components/common/SendQuickNotificationModal';

interface VolunteerNotificationsProps {
  currentUser: User;
  onRefreshNotifs: () => void;
}

export const VolunteerNotifications: React.FC<VolunteerNotificationsProps> = ({ currentUser, onRefreshNotifs }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuickNotifModal, setShowQuickNotifModal] = useState(false);

  // Reply state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadNotifsAndLeadership();
  }, []);

  const loadNotifsAndLeadership = async () => {
    try {
      setLoading(true);
      const [notifData, leadershipData] = await Promise.all([
        api.getNotifications(currentUser.id),
        api.getLeadershipApplications(undefined, currentUser.id),
      ]);
      setNotifications(notifData);
      setIsLeader(leadershipData.some((a) => a.status === 'approved'));
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

  const handleSendReply = async (notifId: string) => {
    const text = replyTextMap[notifId]?.trim();
    if (!text) return;

    try {
      setSendingReplyId(notifId);
      await api.replyBurnoutCheckIn({
        notificationId: notifId,
        volunteerId: currentUser.id,
        replyMessage: text,
      });

      setToastMessage('Your reply has been sent to the organizer!');
      setTimeout(() => setToastMessage(null), 4000);

      // Refresh list
      await loadNotifsAndLeadership();
      onRefreshNotifs();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setSendingReplyId(null);
    }
  };

  const quickReplies = [
    "Doing well! Just taking a short rest. Thanks for checking in!",
    "Feeling a bit fatigued; taking time off to recharge.",
    "Appreciate checking in! Lighter tasks on the next drive would be helpful."
  ];

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Volunteer Personal Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Updates on registered activities, leadership status, and organizer wellness check-ins.</p>
        </div>

        <div className="flex items-center gap-2">
          {isLeader && (
            <button
              onClick={() => setShowQuickNotifModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              Leader Quick Broadcast
            </button>
          )}

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Mark All Read
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
          <BellRing className="w-10 h-10 mx-auto mb-2 opacity-40 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-semibold">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => {
            const isBurnoutCheckIn = n.isBurnoutCheckIn || n.category === 'burnout_checkin' || n.title.toLowerCase().includes('check-in');

            if (isBurnoutCheckIn) {
              return (
                <div
                  key={n.id}
                  className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/80 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                          Organizer Wellness Check-In
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{n.title}</h4>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{n.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 leading-relaxed font-medium">
                    "{n.message}"
                  </p>

                  {/* Replied view */}
                  {n.replyMessage ? (
                    <div className="mt-4 p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Your Reply Sent ({n.repliedAt || 'Just now'}):</span>
                      </div>
                      <p className="text-emerald-800 dark:text-emerald-300 italic pl-5">"{n.replyMessage}"</p>
                    </div>
                  ) : (
                    /* Reply input form */
                    <div className="mt-4 space-y-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Reply to Organizer</span>
                      </div>

                      {/* Quick chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {quickReplies.map((qr, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setReplyTextMap((prev) => ({ ...prev, [n.id]: qr }))}
                            className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer text-left"
                          >
                            + "{qr.substring(0, 32)}..."
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={replyTextMap[n.id] || ''}
                          onChange={(e) => setReplyTextMap({ ...replyTextMap, [n.id]: e.target.value })}
                          placeholder="Write your response to the organizer..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                        <button
                          onClick={() => handleSendReply(n.id)}
                          disabled={sendingReplyId === n.id || !replyTextMap[n.id]?.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {sendingReplyId === n.id ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.readStatus
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60 font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{n.createdAt}</p>
                  </div>
                  {!n.readStatus && (
                    <span className="w-2.5 h-2.5 bg-teal-600 dark:bg-teal-400 rounded-full shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SendQuickNotificationModal
        isOpen={showQuickNotifModal}
        onClose={() => setShowQuickNotifModal(false)}
        currentUser={currentUser}
        isVolunteerLeader={isLeader}
        onSuccess={loadNotifsAndLeadership}
      />
    </div>
  );
};
