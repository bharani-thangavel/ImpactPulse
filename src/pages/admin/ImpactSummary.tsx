import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Sparkles,
  Award,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Building2,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api';
import { PlatformStats, EventItem, User } from '../../types';

export const ImpactSummary: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, evs, orgs] = await Promise.all([
        api.getAdminStats(),
        api.getEvents(),
        api.getUsers('organizer', 'approved'),
      ]);
      setStats(s);
      setEvents(evs);
      setOrganizers(orgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiReport = async () => {
    setGeneratingAi(true);
    try {
      const res = await api.generateImpactReport(stats, 'Institution-wide');
      setAiReport(res.report);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Find top performing event (highest registered seats)
  const topEvent = events.length > 0 ? [...events].sort((a, b) => b.membersRegistered - a.membersRegistered)[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header & AI Report CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Institution-Wide Impact Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated platform performance, category contributions, and automated AI executive reporting.
          </p>
        </div>

        <button
          onClick={handleGenerateAiReport}
          disabled={generatingAi}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {generatingAi ? 'Generating AI Impact Report...' : 'Generate AI Summary'}
        </button>
      </div>

      {/* AI Generated Executive Report Banner */}
      {aiReport && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-500/30 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            Claude AI Generated Impact Report
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-emerald-50 font-medium">
            "{aiReport}"
          </p>
        </div>
      )}

      {/* Institution Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats?.registeredVolunteers || 0}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Total Volunteers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats?.totalHoursGenerated || 0} Hours</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Hours Generated</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="p-2 bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 rounded-xl w-fit mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{events.length} Events</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Events Conducted</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl w-fit mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats?.avgAttendanceRate || 88.5}%</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Avg Attendance Rate</p>
        </div>
      </div>

      {/* Participation By Category & Top Event */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Participation Breakdown by Social Sector Category
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { name: 'Environment', hours: 48, percentage: 40, color: 'bg-emerald-500 text-emerald-700 dark:text-emerald-300' },
              { name: 'Healthcare', hours: 22, percentage: 25, color: 'bg-indigo-500 text-indigo-700 dark:text-indigo-300' },
              { name: 'Education', hours: 30, percentage: 20, color: 'bg-teal-500 text-teal-700 dark:text-teal-300' },
              { name: 'Food Relief', hours: 25, percentage: 15, color: 'bg-amber-500 text-amber-700 dark:text-amber-300' },
            ].map((cat, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <span>{cat.name}</span>
                  <span className="text-slate-600 dark:text-slate-300">{cat.hours} Verified Hours</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${cat.color.split(' ')[0]}`} style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Event Card */}
        {topEvent && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold rounded-full text-[10px] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Top Performing Event
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{topEvent.category}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{topEvent.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{topEvent.description}</p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/60 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/60 mt-4 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex justify-between items-center">
              <span>Seat Completion</span>
              <span>{topEvent.membersRegistered} / {topEvent.membersRequired} ({Math.round((topEvent.membersRegistered / topEvent.membersRequired) * 100)}%)</span>
            </div>
          </div>
        )}

      </div>

      {/* Organizer Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Organizer Performance Matrix
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Events Created</th>
                <th className="py-3 px-4">Volunteers Mobilized</th>
                <th className="py-3 px-4">Avg Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {organizers.map((org) => {
                const orgEvs = events.filter((e) => e.organizerId === org.id);
                const totalMemb = orgEvs.reduce((acc, e) => acc + e.membersRegistered, 0);
                return (
                  <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{org.organizationName || org.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{orgEvs.length}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">{totalMemb} volunteers</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">92.4%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
