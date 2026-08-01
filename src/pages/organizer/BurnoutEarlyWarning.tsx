import React, { useEffect, useState } from 'react';
import { HeartPulse, AlertTriangle, CheckCircle2, ShieldCheck, MessageCircle, Clock, TrendingDown, Frown, Send, X, MessageSquareQuote } from 'lucide-react';
import { api } from '../../services/api';
import { BurnoutAlert, BurnoutReply, User } from '../../types';

interface BurnoutEarlyWarningProps {
  currentUser: User;
}

export const BurnoutEarlyWarning: React.FC<BurnoutEarlyWarningProps> = ({ currentUser }) => {
  const [alerts, setAlerts] = useState<BurnoutAlert[]>([]);
  const [replies, setReplies] = useState<BurnoutReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<BurnoutAlert | null>(null);
  const [checkInMessage, setCheckInMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAlertsAndReplies();
  }, []);

  const loadAlertsAndReplies = async () => {
    try {
      setLoading(true);
      const [alertsData, repliesData] = await Promise.all([
        api.getBurnoutAlerts(currentUser.id),
        api.getBurnoutReplies(currentUser.id),
      ]);
      setAlerts(alertsData);
      setReplies(repliesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckIn = (alert: BurnoutAlert) => {
    setSelectedAlert(alert);
    setCheckInMessage(alert.suggestedCheckInMessage);
  };

  const handleSendCheckIn = async () => {
    if (!selectedAlert) return;
    try {
      setSending(true);
      await api.sendCheckInMessage(selectedAlert.volunteerId, checkInMessage, currentUser.id);
      setToastMessage(`Supportive check-in message sent to ${selectedAlert.volunteerName}`);
      setSelectedAlert(null);
      setTimeout(() => setToastMessage(null), 4000);
      await loadAlertsAndReplies();
    } catch (err: any) {
      alert(err.message || 'Failed to send check-in message');
    } finally {
      setSending(false);
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'cadence_drop':
        return <TrendingDown className="w-4 h-4 text-amber-500" />;
      case 'latency_increase':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'negative_sentiment':
        return <Frown className="w-4 h-4 text-rose-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Inverse Gamification • Volunteer Wellness
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Burnout Early-Warning System
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Flags volunteers quietly disengaging or fatigued — instead of pushing them to do more. Never affects points or badges.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Organizer-Only Visibility (Private Signals)</span>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading wellness signals...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
          <HeartPulse className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-500" />
          <p className="text-sm font-semibold">All active volunteers are displaying healthy engagement metrics.</p>
          <p className="text-xs mt-1">No burnout or fatigue signals flagged at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.volunteerId}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-2xs transition-all ${
                alert.riskLevel === 'high'
                  ? 'border-rose-300 dark:border-rose-800/80'
                  : alert.riskLevel === 'moderate'
                  ? 'border-amber-300 dark:border-amber-800/80'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{alert.volunteerName}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        alert.riskLevel === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : alert.riskLevel === 'moderate'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {alert.riskLevel.toUpperCase()} FATIGUE RISK • SCORE {alert.riskScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {alert.volunteerEmail} • Last active: {alert.lastActiveDate}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenCheckIn(alert)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Supportive Check-In
                </button>
              </div>

              {/* Signals Breakdown */}
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Contributing Signals (Recent Trend vs Baseline)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {alert.signals.map((signal) => (
                    <div
                      key={signal.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getSignalIcon(signal.type)}
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{signal.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                        {signal.detail}
                      </p>
                      <div className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Signal Weight: +{signal.weight} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Intervention */}
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold mb-1">
                  <HeartPulse className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Suggested Action: Supportive Check-In Message
                </div>
                <p className="text-indigo-800 dark:text-indigo-300/90 text-xs">
                  Explicitly <strong>NOT a new task or event invite</strong>. Send a low-pressure message to acknowledge their contributions and offer flexibility or rest.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volunteer Wellness Responses Section */}
      {replies.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 rounded-xl text-emerald-700 dark:text-emerald-300">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Volunteer Wellness Responses</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Replies sent by volunteers responding to organizer check-ins</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              {replies.length} Received
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {replies.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{r.volunteerName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{r.repliedAt}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 italic">
                  Check-in sent: "{r.originalMessage.substring(0, 60)}..."
                </div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                  "{r.replyMessage}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Send Supportive Check-In</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Sending to <strong>{selectedAlert.volunteerName}</strong> ({selectedAlert.volunteerEmail}). This message emphasizes volunteer wellness without requesting additional hours.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Check-In Message Content
              </label>
              <textarea
                rows={4}
                value={checkInMessage}
                onChange={(e) => setCheckInMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCheckIn}
                disabled={sending}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Check-In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
