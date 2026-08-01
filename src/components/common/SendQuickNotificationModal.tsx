import React, { useState } from 'react';
import {
  Send,
  X,
  BellRing,
  Sparkles,
  Crown,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldAlert,
  Megaphone,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

interface SendQuickNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  isVolunteerLeader?: boolean;
  onSuccess?: () => void;
}

export const SendQuickNotificationModal: React.FC<SendQuickNotificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isVolunteerLeader = false,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'alert' | 'success'>('alert');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const presets = [
    { label: '🚨 Urgent Briefing', title: 'Urgent Activity Briefing', type: 'alert' as const },
    { label: '⏰ Schedule Update', title: 'Schedule / Timing Notice', type: 'warning' as const },
    { label: '📍 Venue Gathering', title: 'Venue & Meeting Location Spot', type: 'info' as const },
    { label: '🌧️ Weather Contingency', title: 'Weather & Safety Update', type: 'warning' as const },
    { label: '👑 Team Leader Announcement', title: 'Leader Message to All Volunteers', type: 'info' as const },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setTitle(preset.title);
    setType(preset.type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please enter both a title and message for the quick notification.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.sendQuickNotification({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        title: title.trim(),
        message: message.trim(),
        type,
      });

      setSuccessMsg(res.message || 'Notification floated to all volunteers successfully!');
      setTitle('');
      setMessage('');

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccessMsg('');
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send quick notification.');
    } finally {
      setLoading(false);
    }
  };

  const senderRoleBadge =
    currentUser.role === 'organizer' ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
        <Users className="w-3.5 h-3.5" /> Event Organizer
      </span>
    ) : isVolunteerLeader || currentUser.role === 'volunteer' ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-800">
        <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Certified Volunteer Team Leader
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
        <Sparkles className="w-3.5 h-3.5" /> Platform Admin
      </span>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Send Quick Notification
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Float a real-time broadcast alert directly to all volunteers across the platform.
              </p>
              <div className="mt-2">{senderRoleBadge}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Quick Topic Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
              Notification Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Venue Change Notice for Tomorrow's Drive"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
          </div>

          {/* Type / Urgency Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
              Urgency / Type Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'alert', label: 'Alert (Red)', icon: ShieldAlert, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800' },
                { id: 'warning', label: 'Warning (Amber)', icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800' },
                { id: 'info', label: 'Info (Indigo)', icon: Info, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800' },
                { id: 'success', label: 'Success (Green)', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? `${item.color} font-bold ring-2 ring-slate-900 dark:ring-slate-100`
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px]">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
              Broadcast Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Type the detailed announcement message to float to all volunteers..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed"
              required
            />
          </div>

          {/* Notice Banner */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-[11px] font-medium leading-normal">
              This message will be immediately floated into the notification drawers and activity feeds of all active volunteers.
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              {successMsg}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim() || !message.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Floating Notification...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Float to All Volunteers
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
