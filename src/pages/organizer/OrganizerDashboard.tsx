import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Clock,
  UserPlus,
  BarChart3,
  CheckCircle,
  PlusCircle,
  ClipboardCheck,
  Crown,
  Users,
  HeartPulse,
  Megaphone,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { SendQuickNotificationModal } from '../../components/common/SendQuickNotificationModal';
import { api } from '../../services/api';
import { EventItem, LeadershipApplication, User } from '../../types';

interface OrganizerDashboardProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ currentUser, onNavigateTab }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [leadershipApps, setLeadershipApps] = useState<LeadershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickNotifModal, setShowQuickNotifModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evs, leads] = await Promise.all([
        api.getEvents(undefined, currentUser.id),
        api.getLeadershipApplications(),
      ]);
      setEvents(evs);
      
      // Filter leadership applications for this organizer's events
      const myEventIds = new Set(evs.map((e) => e.id));
      setLeadershipApps(leads.filter((l) => myEventIds.has(l.eventId) && l.status === 'pending'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeEvents = events.filter((e) => e.status === 'ongoing');
  const pendingApprovals = events.filter((e) => e.status === 'pending');
  const completedEvents = events.filter((e) => e.status === 'completed');

  const totalCapacity = events.reduce((acc, e) => acc + e.membersRequired, 0);
  const totalRegistered = events.reduce((acc, e) => acc + e.membersRegistered, 0);
  const seatFillPercentage = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Organizer Dashboard — {currentUser.organizationName || currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage events, track attendance, review team leader applicants, and monitor impact.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickNotifModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            Send Quick Notification
          </button>

          <button
            onClick={() => onNavigateTab('create-event')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Event
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Events"
          value={activeEvents.length}
          subtitle="Currently published"
          icon={CalendarDays}
          color="emerald"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          subtitle="Awaiting admin review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Leader Applicants"
          value={leadershipApps.length}
          subtitle="Pending applications"
          icon={UserPlus}
          color="indigo"
        />
        <StatCard
          title="Seat Fill Rate"
          value={`${seatFillPercentage}%`}
          subtitle={`${totalRegistered}/${totalCapacity} filled`}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Completed Events"
          value={completedEvents.length}
          subtitle="Past activities"
          icon={CheckCircle}
          color="slate"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
        <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-500 dark:text-slate-400">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setShowQuickNotifModal(true)}
            className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/70 dark:to-teal-950/70 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/90 dark:hover:to-teal-900/90 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl text-left transition-all cursor-pointer shadow-2xs group"
          >
            <Megaphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">Quick Broadcast</p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">Float to all volunteers</p>
          </button>

          <button
            onClick={() => onNavigateTab('create-event')}
            className="p-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/80 border border-emerald-100 dark:border-emerald-800/60 rounded-xl text-left transition-colors cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Create Event</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Submit multi-step form</p>
          </button>

          <button
            onClick={() => onNavigateTab('attendance')}
            className="p-3 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100/80 dark:hover:bg-teal-900/80 border border-teal-100 dark:border-teal-800/60 rounded-xl text-left transition-colors cursor-pointer"
          >
            <ClipboardCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 mb-1" />
            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Attendance</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Verify volunteer presence</p>
          </button>

          <button
            onClick={() => onNavigateTab('leader-selection')}
            className="p-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/80 border border-indigo-100 dark:border-indigo-800/60 rounded-xl text-left transition-colors cursor-pointer"
          >
            <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1" />
            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Leader Selection</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Approve team leaders</p>
          </button>

          <button
            onClick={() => onNavigateTab('burnout-alerts')}
            className="p-3 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100/80 dark:hover:bg-rose-900/80 border border-rose-100 dark:border-rose-800/60 rounded-xl text-left transition-colors cursor-pointer"
          >
            <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400 mb-1" />
            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Burnout Alerts</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Volunteer early-warning</p>
          </button>

          <button
            onClick={() => onNavigateTab('impact-summary')}
            className="p-3 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/80 border border-amber-100 dark:border-amber-800/60 rounded-xl text-left transition-colors cursor-pointer"
          >
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Impact Summary</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">View org statistics</p>
          </button>
        </div>
      </div>

      {/* Sections: Upcoming Schedule & Leader Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4 flex items-center justify-between">
            <span>Upcoming Schedule & Active Events</span>
            <button
              onClick={() => onNavigateTab('my-events')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </h3>

          <div className="space-y-3">
            {events.filter((e) => e.status === 'ongoing' || e.status === 'pending').length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4">No active or scheduled events.</p>
            ) : (
              events
                .filter((e) => e.status === 'ongoing' || e.status === 'pending')
                .map((e) => (
                  <div key={e.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{e.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            e.status === 'ongoing'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {e.status}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">{e.date} • {e.venue}</p>
                    </div>
                    <div className="text-right font-semibold text-slate-700 dark:text-slate-300">
                      {e.membersRegistered}/{e.membersRequired} Joined
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Leader Applicants */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4 flex items-center justify-between">
            <span>Pending Leader Applicants</span>
            <button
              onClick={() => onNavigateTab('leader-selection')}
              className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Review All
            </button>
          </h3>

          <div className="space-y-3">
            {leadershipApps.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4">No pending leadership applications.</p>
            ) : (
              leadershipApps.map((app) => (
                <div key={app.id} className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800/60 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-900 dark:text-slate-100">
                    <span>{app.volunteerName}</span>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                      {app.eventTitle}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 italic">"{app.reason}"</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <SendQuickNotificationModal
        isOpen={showQuickNotifModal}
        onClose={() => setShowQuickNotifModal(false)}
        currentUser={currentUser}
      />

    </div>
  );
};
