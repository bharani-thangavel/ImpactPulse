import React, { useEffect, useState } from 'react';
import {
  Crown,
  Check,
  X,
  CheckCircle2,
  Award,
  Mail,
  Phone,
  Copy,
  Eye,
  Users,
  Send,
  Clock,
  Filter,
  Sparkles,
  ShieldCheck,
  Calendar,
  MapPin,
} from 'lucide-react';
import { api } from '../../services/api';
import { LeadershipApplication, EventItem, User } from '../../types';
import { EventDetailsModal } from '../../components/organizer/EventDetailsModal';

interface LeaderSelectionProps {
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

export const LeaderSelection: React.FC<LeaderSelectionProps> = ({ currentUser, onNavigateTab }) => {
  const [applications, setApplications] = useState<LeadershipApplication[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, EventItem>>({});
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'approved' | 'pending' | 'all'>('approved');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Quick message modal state for leader check-in
  const [selectedVolunteerForMsg, setSelectedVolunteerForMsg] = useState<{ id: string; name: string } | null>(null);
  const [quickMsgText, setQuickMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, eventsData] = await Promise.all([
        api.getLeadershipApplications(),
        api.getEvents(),
      ]);
      setApplications(appsData);

      const map: Record<string, EventItem> = {};
      eventsData.forEach((e) => {
        map[e.id] = e;
      });
      setEventsMap(map);
    } catch (err) {
      console.error('Error loading leadership data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected', isOverride?: boolean) => {
    try {
      await api.updateLeadershipStatus(id, status, isOverride);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status, organizerOverride: isOverride } : app
        )
      );
      if (status === 'approved') {
        setToastMessage(
          isOverride
            ? 'Leader Approved with Organizer Override! Leadership Badge awarded & controls unlocked.'
            : 'Leader Approved! Leadership Badge awarded & Team Leader controls unlocked for volunteer.'
        );
      } else {
        setToastMessage('Application declined.');
      }
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleSendCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteerForMsg || !quickMsgText.trim()) return;

    try {
      setSendingMsg(true);
      await api.sendCheckInMessage(selectedVolunteerForMsg.id, quickMsgText.trim(), currentUser.id);
      setMsgSuccess(`Message sent to ${selectedVolunteerForMsg.name}!`);
      setTimeout(() => {
        setSelectedVolunteerForMsg(null);
        setQuickMsgText('');
        setMsgSuccess('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to send check-in message');
    } finally {
      setSendingMsg(false);
    }
  };

  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  const filteredApplications = applications.filter((a) => {
    if (filterTab === 'approved') return a.status === 'approved';
    if (filterTab === 'pending') return a.status === 'pending';
    return true; // 'all'
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-7xl">
      {/* Top Banner Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 mb-2">
          <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Auto-Ranked by Badge Score & Category-Fit
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Volunteer Leader Selection & Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review approved team leaders and pending candidates. Click any leader or event to inspect full event details, registered members, and contact details.
        </p>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-Tab Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              filterTab === 'approved'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Approved Team Leaders ({approvedCount})
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              filterTab === 'pending'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Candidates ({pendingCount})
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Applications ({applications.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
          Click any leader or event to view registered members roster & contact details
        </div>
      </div>

      {/* Applications / Leaders Content */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading leadership data...</div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
          <Crown className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
          <p className="text-sm font-semibold">No leadership records in this filter tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.map((app, idx) => {
            const isApproved = app.status === 'approved';
            const phone = app.volunteerPhone || '+1 (555) 019-2834';
            const eventItem = eventsMap[app.eventId];

            return (
              <div
                key={app.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-md ${
                  isApproved
                    ? 'border-amber-300 dark:border-amber-800/80 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Volunteer Info & Contact */}
                  <div className="flex items-start gap-4 max-w-xl">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm ${
                        isApproved
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isApproved ? <Crown className="w-6 h-6" /> : app.volunteerName.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                          {app.volunteerName}
                        </h3>

                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-2xs">
                            <Crown className="w-3 h-3" /> Appointed Leader
                          </span>
                        )}

                        {app.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                            Pending Review
                          </span>
                        )}

                        {app.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                            Declined
                          </span>
                        )}
                      </div>

                      {/* Contact Details */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <a href={`mailto:${app.volunteerEmail}`} className="hover:underline font-bold text-slate-900 dark:text-slate-100">
                            {app.volunteerEmail}
                          </a>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <a href={`tel:${phone}`} className="hover:underline font-bold text-slate-900 dark:text-slate-100">
                            {phone}
                          </a>
                          <button
                            onClick={() => handleCopyPhone(phone)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer ml-0.5"
                            title="Copy phone number"
                          >
                            {copiedPhone === phone ? (
                              <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Statement / Reason */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic leading-relaxed">
                        "{app.reason}"
                      </p>

                      {/* Rank Factors */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                          #{idx + 1} Auto-Rank
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-[10px] font-semibold">
                          Badge Score: <strong>{app.badgeScore || 0}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[10px] font-semibold">
                          Category Fit: <strong>{app.categoryFitScore || 0}</strong> ({app.categoryHistoryCount || 0} history)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Associated Event Info */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xs w-full">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Target Event Drive
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                      {app.eventTitle}
                    </h4>
                    {eventItem && (
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                        <div>📍 {eventItem.venue}</div>
                        <div>📅 {eventItem.date} ({eventItem.time})</div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (eventItem) {
                          setSelectedEventForModal(eventItem);
                        } else {
                          // Fetch event on demand
                          api.getEvents(app.eventId).then((evs) => {
                            if (evs.length > 0) setSelectedEventForModal(evs[0]);
                          });
                        }
                      }}
                      className="mt-2.5 w-full py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] rounded-lg border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Event & Member Roster
                    </button>
                  </div>

                  {/* Right Column: Direct Contact & Decision Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2 shrink-0 w-full lg:w-auto">
                    
                    {/* Contact Actions */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`mailto:${app.volunteerEmail}`}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                      <a
                        href={`tel:${phone}`}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <button
                        onClick={() => setSelectedVolunteerForMsg({ id: app.volunteerId, name: app.volunteerName })}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Message
                      </button>
                    </div>

                    {/* Pending Decision Buttons */}
                    {app.status === 'pending' && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          onClick={() => handleAction(app.id, 'approved', idx > 0)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {idx === 0 ? 'Approve #1 Lead' : 'Override & Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(app.id, 'rejected')}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 font-bold rounded-xl border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Check-in Notice Drawer overlay */}
      {selectedVolunteerForMsg && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-4 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-emerald-600" /> Message Leader Candidate: {selectedVolunteerForMsg.name}
            </span>
            <button
              onClick={() => setSelectedVolunteerForMsg(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSendCheckIn} className="space-y-2">
            <textarea
              value={quickMsgText}
              onChange={(e) => setQuickMsgText(e.target.value)}
              placeholder={`Write a quick message or check-in note for ${selectedVolunteerForMsg.name}...`}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVolunteerForMsg(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingMsg || !quickMsgText.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                {sendingMsg ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {msgSuccess && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{msgSuccess}</p>
            )}
          </form>
        </div>
      )}

      {/* Modal for Event Details & Registered Members Roster */}
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
