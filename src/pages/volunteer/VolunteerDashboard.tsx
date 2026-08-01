import React, { useEffect, useState } from 'react';
import {
  Clock,
  Award,
  CalendarCheck,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Calendar,
  Megaphone,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { SendQuickNotificationModal } from '../../components/common/SendQuickNotificationModal';
import { api } from '../../services/api';
import { EventItem, Registration, LeadershipApplication, User } from '../../types';

interface VolunteerDashboardProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ currentUser, onNavigateTab }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [leadershipApps, setLeadershipApps] = useState<LeadershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickNotifModal, setShowQuickNotifModal] = useState(false);

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

  const isLeader = leadershipApps.some((l) => l.status === 'approved');
  const myRegisteredEventIds = new Set(registrations.map((r) => r.eventId));

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
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Volunteer Impact Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-2 leading-relaxed">
            You have contributed <span className="font-bold text-white">{currentUser.totalHours || 28} verified hours</span> and earned <span className="font-bold text-amber-300">{currentUser.totalPoints || 320} impact points</span> across campus activities.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigateTab('discover')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              Browse Open Activities
              <ArrowRight className="w-4 h-4" />
            </button>

            {isLeader && (
              <button
                onClick={() => setShowQuickNotifModal(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                Send Leader Quick Notification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Team Leader Special Broadcast Action Card */}
      {isLeader && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-teal-500/10 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-teal-950/30 border-2 border-amber-400/80 dark:border-amber-700/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shrink-0 shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Team Leader Privileges Unlocked</span>
                <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold rounded-full border border-amber-300 dark:border-amber-700">
                  Approved Leader
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                As an appointed Volunteer Team Leader, you can send quick announcements directly floated to all volunteers!
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQuickNotifModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Megaphone className="w-4 h-4" />
            Float Notification to Volunteers
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Hours Logged"
          value={`${currentUser.totalHours || 28} hrs`}
          subtitle="Verified contribution"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Impact Points"
          value={`${currentUser.totalPoints || 320} pts`}
          subtitle="Tier: Silver Pillar"
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Active Registrations"
          value={registrations.length}
          subtitle="Upcoming events"
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Leader Status"
          value={leadershipApps.some((l) => l.status === 'approved') ? 'Team Leader' : 'Member'}
          subtitle={leadershipApps.some((l) => l.status === 'approved') ? 'Leader badge active' : '1 application pending'}
          icon={Crown}
          color="teal"
        />
      </div>

      {/* Featured Upcoming Events Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Recommended Volunteering Opportunities</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Discover open activities matching your interests</p>
          </div>
          <button
            onClick={() => onNavigateTab('discover')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Explore All ({events.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.slice(0, 3).map((event) => {
            const isRegistered = myRegisteredEventIds.has(event.id);
            return (
              <div key={event.id} className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 flex flex-col justify-between hover:shadow-xs transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-md text-[10px]">
                      {event.category}
                    </span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-xs">+{event.points} pts</span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{event.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">{event.description}</p>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {event.membersRegistered}/{event.membersRequired} Joined
                  </span>

                  {isRegistered ? (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
                    >
                      Join Event
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SendQuickNotificationModal
        isOpen={showQuickNotifModal}
        onClose={() => setShowQuickNotifModal(false)}
        currentUser={currentUser}
        isVolunteerLeader={isLeader}
      />

    </div>
  );
};
