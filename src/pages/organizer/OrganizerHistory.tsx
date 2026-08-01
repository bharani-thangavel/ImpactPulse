import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { EventItem, User } from '../../types';

interface OrganizerHistoryProps {
  currentUser: User;
}

export const OrganizerHistory: React.FC<OrganizerHistoryProps> = ({ currentUser }) => {
  const [historyEvents, setHistoryEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents(undefined, currentUser.id);
      setHistoryEvents(data.filter((e) => e.status === 'completed' || e.status === 'declined'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          Event History & Past Records
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Archived records of completed activities and declined submissions.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading history records...</div>
      ) : historyEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
          <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No past completed or declined events.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Event Title</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Final Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{e.title}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{e.venue}</td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{e.date}</td>
                    <td className="py-4 px-4">
                      {e.status === 'completed' ? (
                        <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold rounded-full text-[10px]">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold rounded-full text-[10px]">
                          Declined by Admin
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {e.membersRegistered} / {e.membersRequired} Volunteers
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
