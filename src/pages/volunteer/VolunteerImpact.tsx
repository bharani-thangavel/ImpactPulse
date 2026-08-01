import React, { useEffect, useState } from 'react';
import { BarChart3, Sparkles, Download, Award, Clock, Printer, FileCheck } from 'lucide-react';
import { User, AttendanceRecord, EventItem } from '../../types';
import { api } from '../../services/api';
import { exportVolunteerTranscriptCsv } from '../../utils/exportCsv';

interface VolunteerImpactProps {
  currentUser: User;
}

export const VolunteerImpact: React.FC<VolunteerImpactProps> = ({ currentUser }) => {
  const [aiResume, setAiResume] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, EventItem>>({});

  useEffect(() => {
    loadTranscriptData();
  }, []);

  const loadTranscriptData = async () => {
    try {
      const [atts, evs] = await Promise.all([
        api.getAttendance(undefined, currentUser.id),
        api.getEvents(),
      ]);
      setAttendance(atts.filter((a) => a.status === 'present'));
      const map: Record<string, EventItem> = {};
      evs.forEach((e) => {
        map[e.id] = e;
      });
      setEventsMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateResume = async () => {
    setGenerating(true);
    try {
      const stats = {
        totalHoursGenerated: currentUser.totalHours || 28,
        registeredVolunteers: 1,
        completedEventsThisMonth: 4,
        avgAttendanceRate: 100,
      };
      const res = await api.generateImpactReport(stats, `${currentUser.name} Personal Resume`);
      setAiResume(res.report);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleDownloadTranscriptCsv = () => {
    exportVolunteerTranscriptCsv(currentUser, attendance, eventsMap);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Personal Impact & Verified Certificate
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Official volunteering transcript, hours breakdown, and AI resume builder.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTranscriptCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Download full verified service hours transcript in CSV format"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Download Transcript Sheet (.CSV)</span>
          </button>

          <button
            onClick={handleGenerateResume}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating AI Resume...' : 'Generate AI Impact Statement'}
          </button>
        </div>
      </div>

      {aiResume && (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 dark:from-teal-950 dark:to-slate-950 text-white p-6 rounded-3xl shadow-xl border border-teal-500/30">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            AI Generated Resume Impact Statement
          </div>
          <p className="text-sm leading-relaxed text-teal-50 font-medium">"{aiResume}"</p>
        </div>
      )}

      {/* Official Certificate Preview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/30 p-8 shadow-xl relative overflow-hidden text-center max-w-3xl mx-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 dark:bg-emerald-950 rounded-bl-full opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100 dark:bg-teal-950 rounded-tr-full opacity-30 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-4">
          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Verified Institutional Record
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Certificate of Social Impact</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">This officially certifies that</p>

        <p className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-400 my-4 underline decoration-emerald-300 dark:decoration-emerald-600 decoration-wavy underline-offset-8">
          {currentUser.name}
        </p>

        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Has completed <span className="font-bold text-slate-900 dark:text-slate-100">{currentUser.totalHours || 28} hours</span> of verified community service and accumulated <span className="font-bold text-slate-900 dark:text-slate-100">{currentUser.totalPoints || 320} impact points</span> across environmental and social initiatives.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto my-6 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase">Member Email</p>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{currentUser.email}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase">Account Status</p>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Verified Member</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handlePrintCertificate}
            className="px-6 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Certificate
          </button>

          <button
            onClick={handleDownloadTranscriptCsv}
            className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Hours Transcript (.CSV)
          </button>
        </div>
      </div>

    </div>
  );
};

