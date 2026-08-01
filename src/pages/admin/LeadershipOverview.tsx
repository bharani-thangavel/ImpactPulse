import React, { useEffect, useState } from 'react';
import { Crown, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { LeadershipApplication } from '../../types';

export const LeadershipOverview: React.FC = () => {
  const [applications, setApplications] = useState<LeadershipApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeadership();
  }, []);

  const loadLeadership = async () => {
    try {
      setLoading(true);
      const data = await api.getLeadershipApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: LeadershipApplication['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Approved Leader
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px] flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" /> Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px] flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Pending Organizer Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Volunteer Leadership Overview (Read-Only)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Read-only audit monitor of leadership position applications submitted across events and organizer approvals.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading leadership applications...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Volunteer Name</th>
                  <th className="py-3.5 px-4">Event Title</th>
                  <th className="py-3.5 px-4">Application Reason</th>
                  <th className="py-3.5 px-4">Leadership Status</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{app.volunteerName}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">{app.eventTitle}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{app.reason}</td>
                    <td className="py-4 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-4 px-4 text-slate-400 dark:text-slate-500 font-mono text-[11px]">{app.appliedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
