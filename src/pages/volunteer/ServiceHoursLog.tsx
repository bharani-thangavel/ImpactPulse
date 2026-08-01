import React, { useEffect, useState } from 'react';
import {
  Clock,
  PlusCircle,
  DollarSign,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Download,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';
import { User, ServiceLogEntry } from '../../types';
import { api } from '../../services/api';
import { exportServiceLogsCsv } from '../../utils/exportCsv';

interface ServiceHoursLogProps {
  currentUser: User;
}

export const ServiceHoursLog: React.FC<ServiceHoursLogProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<ServiceLogEntry[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form fields
  const [activityTitle, setActivityTitle] = useState('');
  const [category, setCategory] = useState('Off-Site Community Service');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursLogged, setHoursLogged] = useState<number | string>(2);
  const [expenseAmount, setExpenseAmount] = useState<number | string>('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [notes, setNotes] = useState('');

  const categoryOptions = [
    'Off-Site Community Service',
    'Self-Directed Environmental Care',
    'Youth Mentoring & Tutoring',
    'Event Logistics Preparation',
    'Supply & Food Drive Collection',
    'Community Outreach & Advocacy'
  ];

  useEffect(() => {
    loadLogs();
  }, [currentUser.id]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getServiceLogs(currentUser.id);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load service logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim() || !hoursLogged) return;

    setSubmitting(true);
    try {
      const res = await api.logServiceHours({
        volunteerId: currentUser.id,
        volunteerName: currentUser.name,
        activityTitle: activityTitle.trim(),
        category,
        date,
        hoursLogged: Number(hoursLogged),
        expenseAmount: expenseAmount ? Number(expenseAmount) : 0,
        expenseDescription: expenseDescription.trim(),
        notes: notes.trim()
      });

      setLogs((prev) => [res.log, ...prev]);
      setToastMessage('Service hours & expense entry logged successfully! Sent for verification.');
      setShowLogModal(false);
      resetForm();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to submit service log:', err);
      alert(err.message || 'Error submitting service log');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setActivityTitle('');
    setCategory('Off-Site Community Service');
    setDate(new Date().toISOString().split('T')[0]);
    setHoursLogged(2);
    setExpenseAmount('');
    setExpenseDescription('');
    setNotes('');
  };

  // Calculations
  const verifiedHours = logs
    .filter((l) => l.status === 'verified')
    .reduce((acc, l) => acc + l.hoursLogged, 0);

  const pendingHours = logs
    .filter((l) => l.status === 'pending')
    .reduce((acc, l) => acc + l.hoursLogged, 0);

  const totalExpenses = logs
    .reduce((acc, l) => acc + (l.expenseAmount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Service Hours & Expense Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log independent or off-site volunteering hours, record travel/supplies expenses, and track verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={() => exportServiceLogsCsv(currentUser, logs)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Download service hours and expenses in CSV spreadsheet format"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export Sheet (.CSV)</span>
            </button>
          )}

          <button
            onClick={() => setShowLogModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Service Hours</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Logged Hours</span>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{verifiedHours} hrs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Hourglass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{pendingHours} hrs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Out-of-Pocket</span>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Logged Activities Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Logged Service & Expense Entries ({logs.length})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading logged records...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs space-y-2">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p>No off-site service hours logged yet.</p>
            <p className="text-[11px] text-slate-500">Click 'Log Service Hours' above to submit independent activity records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3">Activity & Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Hours</th>
                  <th className="pb-3">Expenses</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 pr-3 font-semibold">
                      <div className="text-slate-900 dark:text-slate-100 font-bold">{log.activityTitle}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {log.category}
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{log.date}</td>
                    <td className="py-3 pr-3 font-bold text-slate-900 dark:text-slate-100">{log.hoursLogged} hrs</td>
                    <td className="py-3 pr-3">
                      {log.expenseAmount && log.expenseAmount > 0 ? (
                        <div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">${log.expenseAmount.toFixed(2)}</span>
                          {log.expenseDescription && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                              {log.expenseDescription}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">$0.00</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase ${
                        log.status === 'verified'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : log.status === 'declined'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-[11px] max-w-[180px] truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Service Hours Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                Log Off-Site Service Hours & Expenses
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLog} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Title / Brief Description *
                </label>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Independent Beach Cleanup / Food Drive Packing"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Activity Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date Performed
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hours Contributed *
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={hoursLogged}
                    onChange={(e) => setHoursLogged(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Out-of-Pocket Expense ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 15.50 (Optional)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {Number(expenseAmount) > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Details / Items
                  </label>
                  <input
                    type="text"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="e.g. Trash bags & gloves / Travel gasoline"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Notes & Verification Summary
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide context or supervisor contact to verify hours..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Log Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
