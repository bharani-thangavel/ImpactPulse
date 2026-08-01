import React, { useEffect, useState } from 'react';
import { Check, X, CheckCircle2, Clock, MapPin, Calendar, Building2, Tag, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { EventItem } from '../../types';

export const ApprovalQueue: React.FC = () => {
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents('pending');
      setPendingEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'ongoing' | 'declined') => {
    try {
      await api.updateEventStatus(id, status);
      setPendingEvents((prev) => prev.filter((e) => e.id !== id));
      setActionMessage(`Event ${status === 'ongoing' ? 'Approved & Published' : 'Declined'}`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Event Verification & Approval Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verify event authenticity, location, and points reward before publishing to volunteers.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{pendingEvents.length} Pending Review</span>
        </div>
      </div>

      {/* Toast Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Queue Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading pending event queue...</div>
      ) : pendingEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto my-8 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Queue is clear</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            "Queue is clear — no events awaiting approval"
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Organizer</th>
                  <th className="py-3.5 px-4">Venue & Schedule</th>
                  <th className="py-3.5 px-4">Seats & Points</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Event Title & Desc */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{event.title}</div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 max-w-xs">{event.description}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-md text-[10px]">
                        {event.category}
                      </span>
                    </td>

                    {/* Organizer */}
                    <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.organizerName}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">{event.organizationName}</p>
                    </td>

                    {/* Venue & Date */}
                    <td className="py-4 px-4 space-y-1 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.date} • {event.time}</span>
                      </div>
                    </td>

                    {/* Members & Points */}
                    <td className="py-4 px-4 space-y-1">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{event.membersRequired} Seats Needed</div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold">+{event.points} Points Rewarded</div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(event.id, 'ongoing')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(event.id, 'declined')}
                          className="px-3 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 font-bold rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
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
