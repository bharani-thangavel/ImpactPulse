import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Database, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

interface AdminSettingsProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser, onUpdateUser }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  // Database Reset State
  const [resetting, setResetting] = useState(false);
  const [seedDemo, setSeedDemo] = useState(true);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateUserProfile(currentUser.id, { name, email });
      onUpdateUser(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handleResetDatabase = async () => {
    const confirmMsg = seedDemo
      ? 'Are you sure you want to reset all tables and re-seed default system accounts?'
      : 'WARNING: Are you sure you want to completely erase ALL data from the database? This cannot be undone.';

    if (!window.confirm(confirmMsg)) return;

    setResetting(true);
    setResetMessage(null);

    try {
      const res = await api.resetDatabase(seedDemo);
      setResetMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setResetMessage({ type: 'error', text: err.message || 'Failed to reset database.' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Admin Account & System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage system administrator identity, preferences, and database operations.</p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Administrator Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Administrator Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            Receive instant email alerts for pending event submissions and organizer registrations
          </label>
        </div>

        <button
          type="submit"
          className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </form>

      {/* Database Management Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
            <Database className="w-5 h-5" />
            <h2 className="text-base font-bold">Database Management & Reset</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Danger Zone
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Resetting the database will purge all existing events, registrations, user applications, service logs, badges, and notifications across PostgreSQL and system memory state.
        </p>

        {resetMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              resetMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {resetMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            {resetMessage.text}
          </div>
        )}

        <div className="pt-1 space-y-3">
          <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={seedDemo}
              onChange={(e) => setSeedDemo(e.target.checked)}
              className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            Re-initialize default system accounts (Admin, Organizer, Volunteer) after reset
          </label>

          <button
            type="button"
            onClick={handleResetDatabase}
            disabled={resetting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
          >
            {resetting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Resetting Database...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Reset All Database Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

