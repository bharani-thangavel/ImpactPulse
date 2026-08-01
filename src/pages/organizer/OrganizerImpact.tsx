import React, { useEffect, useState } from 'react';
import { BarChart3, Sparkles, Users, Clock, CheckCircle2, Crown, Award } from 'lucide-react';
import { api } from '../../services/api';
import { EventItem, User } from '../../types';

interface OrganizerImpactProps {
  currentUser: User;
}

export const OrganizerImpact: React.FC<OrganizerImpactProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents(undefined, currentUser.id);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiReport = async () => {
    setGeneratingAi(true);
    try {
      const stats = {
        totalHoursGenerated: events.reduce((acc, e) => acc + e.duration * e.membersRegistered, 0),
        registeredVolunteers: events.reduce((acc, e) => acc + e.membersRegistered, 0),
        completedEventsThisMonth: events.filter((e) => e.status === 'completed').length,
        avgAttendanceRate: 91.2,
      };
      const res = await api.generateImpactReport(stats, currentUser.organizationName || currentUser.name);
      setAiReport(res.report);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const totalVolunteersManaged = events.reduce((acc, e) => acc + e.membersRegistered, 0);
  const totalHoursGenerated = events.reduce((acc, e) => acc + e.duration * e.membersRegistered, 0);
  const completedCount = events.filter((e) => e.status === 'completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Organizer Social Impact Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Impact metrics for {currentUser.organizationName || currentUser.name}</p>
        </div>

        <button
          onClick={handleGenerateAiReport}
          disabled={generatingAi}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {generatingAi ? 'Generating AI Report...' : 'Generate AI Impact Report'}
        </button>
      </div>

      {aiReport && (
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 dark:from-slate-950 dark:to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            AI Generated Organization Summary
          </div>
          <p className="text-sm leading-relaxed text-emerald-50 font-medium">"{aiReport}"</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalVolunteersManaged}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase">Volunteers Mobilized</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalHoursGenerated} hrs</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase">Hours Generated</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl w-fit mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{completedCount}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase">Completed Events</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl w-fit mb-3">
            <Crown className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">4 Leaders</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase">Leaders Developed</p>
        </div>
      </div>

    </div>
  );
};
