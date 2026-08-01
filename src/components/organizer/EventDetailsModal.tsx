import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Crown,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  Sparkles,
  Info,
  Send,
  User as UserIcon,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building2,
  Download,
} from 'lucide-react';
import { EventItem, Registration, LeadershipApplication, User } from '../../types';
import { api } from '../../services/api';
import { exportEventRosterCsv } from '../../utils/exportCsv';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  currentUser,
  onNavigateTab,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [leadershipApps, setLeadershipApps] = useState<LeadershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'overview'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'leaders'>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Quick message modal state
  const [selectedVolunteerForMsg, setSelectedVolunteerForMsg] = useState<{ id: string; name: string } | null>(null);
  const [quickMsgText, setQuickMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');

  useEffect(() => {
    if (isOpen && event) {
      loadEventData();
    }
  }, [isOpen, event]);

  const loadEventData = async () => {
    if (!event) return;
    try {
      setLoading(true);
      const [regs, leads] = await Promise.all([
        api.getRegistrations(undefined, event.id),
        api.getLeadershipApplications(event.id),
      ]);
      setRegistrations(regs);
      setLeadershipApps(leads);
    } catch (err) {
      console.error('Failed to load event registrations or leadership applications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  const approvedLeaderApp = leadershipApps.find((l) => l.status === 'approved');

  const leaderRegistration = registrations.find(
    (r) => r.isLeader || (approvedLeaderApp && r.volunteerId === approvedLeaderApp.volunteerId)
  );

  const fillPct = Math.round((event.membersRegistered / event.membersRequired) * 100);

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.volunteerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.volunteerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.volunteerPhone && r.volunteerPhone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = filterRole === 'all' || (filterRole === 'leaders' && (r.isLeader || (approvedLeaderApp && r.volunteerId === approvedLeaderApp.volunteerId)));

    return matchesSearch && matchesRole;
  });

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Header Banner */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                event.status === 'ongoing'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}
            >
              {event.status === 'ongoing' ? '✅ Approved & Ongoing' : '⏳ Pending Admin Verification'}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> +{event.points} Points
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight pr-10">
            {event.title}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{event.date} • {event.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{event.duration} Hours duration</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-3 pb-2 gap-2">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveSubTab('members')}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'members'
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Registered Members ({registrations.length})
            </button>

            <button
              onClick={() => setActiveSubTab('overview')}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'overview'
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4" />
              Event Overview & Details
            </button>
          </div>

          <button
            onClick={() => exportEventRosterCsv(event, registrations, approvedLeaderApp?.volunteerName)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-center"
            title="Download CSV spreadsheet containing all event details and volunteer participants"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Data Sheet (.CSV)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: REGISTERED MEMBERS */}
          {activeSubTab === 'members' && (
            <div className="space-y-6">
              
              {/* Highlight Approved Team Leader Card */}
              {approvedLeaderApp ? (
                <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-600/15 dark:from-amber-950/60 dark:via-amber-900/40 dark:to-amber-950/60 border-2 border-amber-400 dark:border-amber-700/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Crown className="w-3.5 h-3.5" /> Appointed Event Leader
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-md shrink-0">
                        <Crown className="w-6 h-6 text-slate-950" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                            {approvedLeaderApp.volunteerName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-[10px] font-extrabold border border-amber-300 dark:border-amber-800">
                            Leader
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic leading-relaxed">
                          "{approvedLeaderApp.reason || 'Appointed team leader guiding volunteer coordination and task execution.'}"
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <a href={`mailto:${approvedLeaderApp.volunteerEmail}`} className="hover:underline font-bold text-slate-900 dark:text-slate-100">
                              {approvedLeaderApp.volunteerEmail}
                            </a>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <a href={`tel:${leaderRegistration?.volunteerPhone || '+1 (555) 019-2834'}`} className="hover:underline font-bold text-slate-900 dark:text-slate-100">
                              {leaderRegistration?.volunteerPhone || '+1 (555) 019-2834'}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leader Direct Actions */}
                    <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
                      <a
                        href={`mailto:${approvedLeaderApp.volunteerEmail}`}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email Leader
                      </a>
                      <a
                        href={`tel:${leaderRegistration?.volunteerPhone || '+1 (555) 019-2834'}`}
                        className="px-3 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <button
                        onClick={() => setSelectedVolunteerForMsg({ id: approvedLeaderApp.volunteerId, name: approvedLeaderApp.volunteerName })}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Check-In
                      </button>
                    </div>
                  </div>
                </div>
              ) : (currentUser.role === 'organizer' || currentUser.role === 'admin') ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>No Team Leader appointed yet for this event drive.</span>
                  </div>
                  {onNavigateTab && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab('leader-selection');
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Select Leader
                    </button>
                  )}
                </div>
              ) : null}

              {/* Members Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filter:</span>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setFilterRole('all')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        filterRole === 'all'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      All Volunteers ({registrations.length})
                    </button>
                    <button
                      onClick={() => setFilterRole('leaders')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        filterRole === 'leaders'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Leaders
                    </button>
                  </div>
                </div>
              </div>

              {/* Volunteers List */}
              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading registered volunteers...</div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No registered members found matching criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRegistrations.map((reg) => {
                    const isAppLeader = approvedLeaderApp && reg.volunteerId === approvedLeaderApp.volunteerId;
                    const phone = reg.volunteerPhone || '+1 (555) 019-2834';

                    return (
                      <div
                        key={reg.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isAppLeader || reg.isLeader
                            ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-xs'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center text-sm shrink-0">
                              {reg.volunteerName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                                  {reg.volunteerName}
                                </h4>
                                {(isAppLeader || reg.isLeader) && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> Leader
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Registered on {reg.registeredAt}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Contact Details Section */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Email:
                            </span>
                            <a href={`mailto:${reg.volunteerEmail}`} className="font-bold hover:underline text-emerald-600 dark:text-emerald-400">
                              {reg.volunteerEmail}
                            </a>
                          </div>

                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Phone:
                            </span>
                            <div className="flex items-center gap-1.5 font-bold">
                              <span>{phone}</span>
                              <button
                                onClick={() => handleCopyPhone(phone)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                title="Copy Phone Number"
                              >
                                {copiedPhone === phone ? (
                                  <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quick Contact Actions */}
                        <div className="mt-3 pt-2.5 flex items-center justify-end gap-2">
                          <a
                            href={`mailto:${reg.volunteerEmail}`}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" /> Email
                          </a>
                          <a
                            href={`tel:${phone}`}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                          <button
                            onClick={() => setSelectedVolunteerForMsg({ id: reg.volunteerId, name: reg.volunteerName })}
                            className="px-2.5 py-1.5 bg-emerald-500/10 dark:bg-emerald-950/60 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Message
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: OVERVIEW & ORGANIZER DETAILS */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Event Description Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Event Description & Goal
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {event.description}
                </p>
              </div>

              {/* Progress & Seat Capacity */}
              <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Seat Capacity & Volunteer Progress
                  </span>
                  <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
                    {event.membersRegistered} / {event.membersRequired} Seats Filled ({fillPct}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                </div>
              </div>

              {/* Organizer & Venue Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                      Host Organization
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{event.organizationName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lead Organizer: {event.organizerName}</p>
                  {event.contactDetails && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                      Contact: {event.contactDetails}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                      Location & Schedule
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{event.venue}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.date} at {event.time}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Duration: {event.duration} hours</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Quick Message Box overlay */}
        {selectedVolunteerForMsg && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" /> Send Check-In Notice to {selectedVolunteerForMsg.name}
              </span>
              <button
                onClick={() => setSelectedVolunteerForMsg(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSendCheckIn} className="flex gap-2">
              <input
                type="text"
                value={quickMsgText}
                onChange={(e) => setQuickMsgText(e.target.value)}
                placeholder={`Type check-in message for ${selectedVolunteerForMsg.name}...`}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="submit"
                disabled={sendingMsg || !quickMsgText.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {sendingMsg ? 'Sending...' : 'Send'}
              </button>
            </form>

            {msgSuccess && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">{msgSuccess}</p>
            )}
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total {registrations.length} registered volunteers
          </div>

          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('attendance');
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Track Attendance
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
