import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Check, X, Users, CheckCircle2, Award, Download } from 'lucide-react';
import { api } from '../../services/api';
import { EventItem, AttendanceRecord, User } from '../../types';
import { exportAttendanceRosterCsv } from '../../utils/exportCsv';

interface AttendanceTrackingProps {
  currentUser: User;
}

export const AttendanceTracking: React.FC<AttendanceTrackingProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadAttendance(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents(undefined, currentUser.id);
      const active = data.filter((e) => e.status === 'ongoing' || e.status === 'completed');
      setEvents(active);
      if (active.length > 0) {
        setSelectedEventId(active[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (eventId: string) => {
    try {
      const records = await api.getAttendance(eventId);
      setAttendance(records);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMark = async (volunteerId: string, status: 'present' | 'absent') => {
    try {
      await api.markAttendance(selectedEventId, volunteerId, status);
      setAttendance((prev) =>
        prev.map((a) =>
          a.volunteerId === volunteerId
            ? { ...a, status, markedAt: new Date().toISOString().substring(0, 16) }
            : a
        )
      );
      const selectedEvent = events.find((e) => e.id === selectedEventId);
      setToastMessage(
        status === 'present'
          ? `Marked Present! +${selectedEvent?.duration || 3} hrs & +${selectedEvent?.points || 30} pts awarded to volunteer.`
          : 'Marked Absent.'
      );
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update attendance');
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Digital Attendance Verification
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Verify registered volunteer presence to automatically calculate contribution hours and reward points.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Select Event */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Activity / Event</label>
        {events.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">No active events available for attendance tracking.</p>
        ) : (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.date} • {e.venue})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Attendance Roster Table */}
      {selectedEvent && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">{selectedEvent.title}</span>
              <p className="text-slate-500 dark:text-slate-400">{selectedEvent.date} • Rewarding +{selectedEvent.duration} hrs & +{selectedEvent.points} pts</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full text-[11px]">
                {attendance.filter((a) => a.status === 'present').length} Present / {attendance.length} Registered
              </span>
              <button
                onClick={() => exportAttendanceRosterCsv(selectedEvent.title, attendance)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Download attendance sheet as CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Attendance Sheet (.CSV)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Volunteer Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No registered volunteers for this event yet.
                    </td>
                  </tr>
                ) : (
                  attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{att.volunteerName}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{att.volunteerEmail}</td>
                      <td className="py-4 px-4">
                        {att.status === 'present' && (
                          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-full text-[10px]">
                            Present (Verified)
                          </span>
                        )}
                        {att.status === 'absent' && (
                          <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold rounded-full text-[10px]">
                            Absent
                          </span>
                        )}
                        {att.status === 'pending' && (
                          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold rounded-full text-[10px]">
                            Unmarked
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleMark(att.volunteerId, 'present')}
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              att.status === 'present'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark Present
                          </button>
                          <button
                            onClick={() => handleMark(att.volunteerId, 'absent')}
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              att.status === 'absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            Mark Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
