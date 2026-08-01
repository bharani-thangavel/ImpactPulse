import React, { useEffect, useState } from 'react';
import { CalendarCheck, MapPin, Clock, Trash2, MessageSquare, Smile, Meh, Frown, CheckCircle2, Eye, Users, Crown, Calendar, Download } from 'lucide-react';
import { api } from '../../services/api';
import { Registration, EventItem, User, AttendanceRecord } from '../../types';
import { EventDetailsModal } from '../../components/organizer/EventDetailsModal';
import { exportEventToIcs } from '../../utils/exportCalendar';
import { exportEventsSummaryCsv } from '../../utils/exportCsv';

interface MyRegistrationsProps {
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

export const MyRegistrations: React.FC<MyRegistrationsProps> = ({ currentUser, onNavigateTab }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, EventItem>>({});
  const [loading, setLoading] = useState(true);
  const [feedbackState, setFeedbackState] = useState<Record<string, { comment: string; sentiment: 'positive' | 'neutral' | 'negative' }>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, atts, evs] = await Promise.all([
        api.getRegistrations(currentUser.id),
        api.getAttendance(undefined, currentUser.id),
        api.getEvents(),
      ]);
      setRegistrations(regs);
      setAttendance(atts.filter((a) => a.status === 'present'));

      const map: Record<string, EventItem> = {};
      evs.forEach((e) => {
        map[e.id] = e;
      });
      setEventsMap(map);

      // Initialize feedback state
      const initialFb: Record<string, { comment: string; sentiment: 'positive' | 'neutral' | 'negative' }> = {};
      atts.forEach((a) => {
        initialFb[a.id] = {
          comment: a.feedbackComment || '',
          sentiment: a.feedbackSentiment || 'positive',
        };
      });
      setFeedbackState(initialFb);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId: string) => {
    if (!confirm('Are you sure you want to cancel your event registration?')) return;
    try {
      await api.cancelRegistration(registrationId);
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration');
    }
  };

  const handleSubmitFeedback = async (attId: string) => {
    const fb = feedbackState[attId] || { comment: '', sentiment: 'positive' };
    try {
      await api.submitFeedback(attId, fb.comment, fb.sentiment);
      setAttendance((prev) =>
        prev.map((a) =>
          a.id === attId
            ? { ...a, feedbackComment: fb.comment, feedbackSentiment: fb.sentiment, feedbackSubmittedAt: 'Just now' }
            : a
        )
      );
      setToastMessage('Thank you! Your optional feedback was saved.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            My Registered & Completed Activities
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal schedule, sync event dates to your calendar, and submit optional post-event feedback.
          </p>
        </div>

        {registrations.length > 0 && (
          <button
            onClick={() => {
              const activeEvents = registrations.map((r) => eventsMap[r.eventId]).filter(Boolean);
              exportEventsSummaryCsv(activeEvents, `${currentUser.name.replace(/\s+/g, '_')}_Registered_Events`);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-sm cursor-pointer shrink-0"
            title="Download personal registered volunteering schedule in CSV spreadsheet format"
          >
            <Download className="w-4 h-4" />
            <span>Download My Schedule (.CSV)</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACTIVE REGISTRATIONS SECTION */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Active Event Registrations
        </h2>
        {loading ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">Loading your registrations...</div>
        ) : registrations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500">
            <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs font-semibold">No active event registrations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.map((reg) => {
              const event = eventsMap[reg.eventId];
              return (
                <div key={reg.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-full text-[10px]">
                        Seat Confirmed
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Registered {reg.registeredAt}</span>
                    </div>

                    <h3
                      onClick={() => event && setSelectedEventForModal(event)}
                      className="font-extrabold text-slate-900 dark:text-slate-100 text-base hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {event?.title || 'Volunteering Event'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{event?.description}</p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event?.venue || 'Campus Venue'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event?.date} • {event?.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {event && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedEventForModal(event)}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Event ({event.membersRegistered || 1}/{event.membersRequired || 10})
                        </button>
                        <button
                          onClick={() => exportEventToIcs(event)}
                          className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title="Export calendar file to sync with Google Calendar, iCal, or Outlook"
                        >
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          Sync to Calendar (.ICS)
                        </button>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">+{event?.points || 30} Points Rewarded</span>
                      <button
                        onClick={() => handleCancel(reg.id)}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cancel Registration
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPLETED EVENTS & OPTIONAL POST-EVENT FEEDBACK SECTION */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Completed Events & Optional Feedback
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share a minimal comment or sentiment on how your experience felt. Your wellness signals help organizers support you.
            </p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold">No completed attendance records yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendance.map((att) => {
              const event = eventsMap[att.eventId];
              const fb = feedbackState[att.id] || { comment: att.feedbackComment || '', sentiment: att.feedbackSentiment || 'positive' };

              return (
                <div key={att.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold rounded-full text-[10px]">
                        Verified Attendance
                      </span>
                      {att.feedbackSubmittedAt && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Feedback Submitted ({att.feedbackSubmittedAt})
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => event && setSelectedEventForModal(event)}
                      className="font-bold text-slate-900 dark:text-slate-100 text-base hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {event?.title || 'Community Event'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{event?.date} • {event?.venue}</p>

                    {/* Minimal optional feedback form */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          How did this event experience feel? (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFeedbackState((prev) => ({ ...prev, [att.id]: { ...fb, sentiment: 'positive' } }))}
                            className={`flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              fb.sentiment === 'positive'
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Smile className="w-3.5 h-3.5" /> Motivated
                          </button>
                          <button
                            type="button"
                            onClick={() => setFeedbackState((prev) => ({ ...prev, [att.id]: { ...fb, sentiment: 'neutral' } }))}
                            className={`flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              fb.sentiment === 'neutral'
                                ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Meh className="w-3.5 h-3.5" /> Normal
                          </button>
                          <button
                            type="button"
                            onClick={() => setFeedbackState((prev) => ({ ...prev, [att.id]: { ...fb, sentiment: 'negative' } }))}
                            className={`flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              fb.sentiment === 'negative'
                                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-800 dark:text-rose-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Frown className="w-3.5 h-3.5" /> Fatigued
                          </button>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Optional comment (e.g., 'Felt great', 'A bit tired after 4 hours')..."
                          value={fb.comment}
                          onChange={(e) => setFeedbackState((prev) => ({ ...prev, [att.id]: { ...fb, comment: e.target.value } }))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSubmitFeedback(att.id)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
                    >
                      Save Optional Feedback
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Event Details & Registered Members */}
      <EventDetailsModal
        isOpen={!!selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        event={selectedEventForModal}
        currentUser={currentUser}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};

