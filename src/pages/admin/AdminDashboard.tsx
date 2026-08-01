import React, { useEffect, useState } from 'react';
import {
  Clock,
  Building2,
  Users,
  UserCheck,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { api } from '../../services/api';
import { PlatformStats, EventItem, User } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [pendingOrganizers, setPendingOrganizers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, evs, orgs] = await Promise.all([
        api.getAdminStats(),
        api.getEvents('pending'),
        api.getUsers('organizer', 'pending'),
      ]);
      setStats(s);
      setPendingEvents(evs);
      setPendingOrganizers(orgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Platform-wide statistics, active verification queues, and real-time logs</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('approval-queue')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors"
          >
            Review Event Queue ({pendingEvents.length})
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Database Live Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Pending Events"
          value={stats?.pendingEvents || 0}
          subtitle="Awaiting admin review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Active Organizers"
          value={stats?.activeOrganizers || 0}
          subtitle="Verified organizations"
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Registered Volunteers"
          value={stats?.registeredVolunteers || 0}
          subtitle="Active ecosystem members"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Organizer Requests"
          value={stats?.pendingOrganizerRequests || 0}
          subtitle="Pending verification"
          icon={UserCheck}
          color="rose"
        />
        <StatCard
          title="Completed Events"
          value={stats?.completedEventsThisMonth || 0}
          subtitle="This calendar month"
          icon={CheckCircle}
          color="teal"
        />
      </div>

      {/* Quick Verification Banners if Queues Active */}
      {/* Alert Banners if Pending Items */}
      {(pendingEvents.length > 0 || pendingOrganizers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingEvents.length > 0 && (
            <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{pendingEvents.length} Event(s) Awaiting Approval</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Latest: '{pendingEvents[0]?.title}'</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('approval-queue')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Approve Events
              </button>
            </div>
          )}

          {pendingOrganizers.length > 0 && (
            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{pendingOrganizers.length} Organizer Registration Request(s)</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Latest: '{pendingOrganizers[0]?.name}'</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('organizer-approvals')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Verify Credentials
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Charts & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Volunteer Growth Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Volunteer Growth Trend
            </h3>
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">+24% MoM</span>
          </div>
          <div className="h-44 flex items-end justify-between gap-2 pt-6">
            {[
              { month: 'Jan', value: 30 },
              { month: 'Feb', value: 45 },
              { month: 'Mar', value: 65 },
              { month: 'Apr', value: 80 },
              { month: 'May', value: 110 },
              { month: 'Jun', value: 145 },
            ].map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all hover:opacity-90"
                  style={{ height: `${(d.value / 150) * 100}%` }}
                />
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Event Category Distribution
            </h3>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { category: 'Environment', count: 42, color: 'bg-emerald-500' },
              { category: 'Healthcare', count: 28, color: 'bg-indigo-500' },
              { category: 'Education', count: 35, color: 'bg-teal-500' },
              { category: 'Food Relief', count: 22, color: 'bg-amber-500' },
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{cat.category}</span>
                  <span>{cat.count}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all`}
                    style={{ width: `${cat.count}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Recent Activity Feed
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Green Earth Club submitted 'Urban Tree Plantation'</p>
              <p className="text-[10px] text-slate-400 mt-1">10 minutes ago • Event Queue</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Sarah Chen marked Present for Coastal Cleanup</p>
              <p className="text-[10px] text-slate-400 mt-1">1 hour ago • Attendance Verified</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Health First Society registered as Organizer</p>
              <p className="text-[10px] text-slate-400 mt-1">2 hours ago • Pending Approval</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
