import React, { useEffect, useState } from 'react';
import { Search, Filter, Calendar, MapPin, Building2, Crown, CheckCircle2, Clock, X } from 'lucide-react';
import { api } from '../../services/api';
import { EventItem, Registration, LeadershipApplication, User, EVENT_CATEGORIES } from '../../types';

interface EventDiscoveryProps {
  currentUser: User;
  onUpdateUser?: (user: User) => void;
}

export const EventDiscovery: React.FC<EventDiscoveryProps> = ({ currentUser, onUpdateUser }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [leadershipApps, setLeadershipApps] = useState<LeadershipApplication[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Leader modal state
  const [leaderModalEvent, setLeaderModalEvent] = useState<EventItem | null>(null);
  const [leaderReason, setLeaderReason] = useState('');
  const [leaderSubmitting, setLeaderSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evs, regs, leads] = await Promise.all([
        api.getEvents('ongoing'),
        api.getRegistrations(currentUser.id),
        api.getLeadershipApplications(),
      ]);
      setEvents(evs);
      setRegistrations(regs);
      setLeadershipApps(leads.filter((l) => l.volunteerId === currentUser.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const registeredEventIds = new Set(registrations.map((r) => r.eventId));
  const appliedLeaderEventIds = new Set(leadershipApps.map((l) => l.eventId));

  const handleRegister = async (eventId: string) => {
    try {
      await api.registerForEvent(eventId, currentUser.id);
      setRegistrations((prev) => [
        ...prev,
        {
          id: `reg-${Date.now()}`,
          eventId,
          volunteerId: currentUser.id,
          volunteerName: currentUser.name,
          volunteerEmail: currentUser.email,
          registeredAt: new Date().toISOString().substring(0, 10),
          status: 'registered',
        },
      ]);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, membersRegistered: e.membersRegistered + 1 } : e))
      );
      setToastMessage('Successfully registered for event! Added to your schedule.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  const handleApplyLeaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderModalEvent || !leaderReason) return;
    setLeaderSubmitting(true);
    try {
      await api.applyForLeadership(leaderModalEvent.id, currentUser.id, leaderReason);
      setLeadershipApps((prev) => [
        ...prev,
        {
          id: `lead-${Date.now()}`,
          eventId: leaderModalEvent.id,
          eventTitle: leaderModalEvent.title,
          volunteerId: currentUser.id,
          volunteerName: currentUser.name,
          reason: leaderReason,
          status: 'pending',
          appliedAt: new Date().toISOString().substring(0, 10),
        },
      ]);
      setLeaderModalEvent(null);
      setLeaderReason('');
      setToastMessage('Leadership Application Submitted! Pending Organizer Approval.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setLeaderSubmitting(false);
    }
  };

  const userInterests = currentUser.interests || [];

  const handleToggleInterest = async (cat: string) => {
    const updated = userInterests.includes(cat)
      ? userInterests.filter((i) => i !== cat)
      : [...userInterests, cat];
    try {
      const res = await api.updateUserProfile(currentUser.id, { interests: updated });
      onUpdateUser?.(res.user);
    } catch (err) {
      console.error('Failed to update interest:', err);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCat = true;
    if (categoryFilter === 'for-you') {
      matchesCat = userInterests.includes(e.category);
    } else if (categoryFilter !== 'all') {
      matchesCat = e.category === categoryFilter;
    }
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Volunteering Activity Discovery
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore verified campus & community events, claim spots, and apply for team leadership opportunities.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search activities by title, location, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="for-you">✨ For You ({userInterests.length} interest{userInterests.length !== 1 ? 's' : ''})</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {categoryFilter === 'for-you' && (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <span>✨ Recommended Events Matching Your Interests</span>
            </h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 mt-0.5">
              {userInterests.length === 0
                ? 'No interests selected yet. Click categories below to add them to your profile!'
                : `Showing events in: ${userInterests.join(', ')}. Click badges to toggle your interest areas:`}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_CATEGORIES.map((cat) => {
              const isSelected = userInterests.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleToggleInterest(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}{cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Events */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading open activities...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
          No activities found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const isRegistered = registeredEventIds.has(event.id);
            const isAppliedLeader = appliedLeaderEventIds.has(event.id);
            const seatFill = Math.round((event.membersRegistered / event.membersRequired) * 100);

            return (
              <div key={event.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-full text-[10px]">
                      {event.category}
                    </span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-xs">+{event.points} pts</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">{event.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{event.description}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.organizerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Seats Filled</span>
                    <span>{event.membersRegistered}/{event.membersRequired} ({seatFill}%)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isRegistered ? (
                      <button
                        disabled
                        className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center gap-1 cursor-default"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Registered
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
                      >
                        Register Now
                      </button>
                    )}

                    {isAppliedLeader ? (
                      <button
                        disabled
                        className="px-3 py-2 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800/80 flex items-center gap-1 cursor-default"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Leader Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => setLeaderModalEvent(event)}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        Apply Lead
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply for Team Leader Modal */}
      {leaderModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setLeaderModalEvent(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase mb-2">
              <Crown className="w-4 h-4" /> Team Leader Application
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{leaderModalEvent.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Apply to lead the volunteer team, manage on-site logistics, and earn a Leadership Badge.
            </p>

            <form onSubmit={handleApplyLeaderSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Why are you interested in leading this activity? *
                </label>
                <textarea
                  rows={4}
                  required
                  value={leaderReason}
                  onChange={(e) => setLeaderReason(e.target.value)}
                  placeholder="Share your prior volunteer experience, organization skills, or team motivation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLeaderModalEvent(null)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaderSubmitting}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  {leaderSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
