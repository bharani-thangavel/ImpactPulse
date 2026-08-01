import React, { useEffect, useState } from 'react';
import { Users, Search, Award, Clock, Download } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { exportVolunteersRosterCsv } from '../../utils/exportCsv';

export const VolunteersList: React.FC = () => {
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers('volunteer');
      setVolunteers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Volunteer Roster & Leaderboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered ecosystem volunteers, verified contribution hours, accumulated points, and status.
          </p>
        </div>

        <button
          onClick={() => exportVolunteersRosterCsv(filtered)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
          title="Download volunteer roster spreadsheet as CSV"
        >
          <Download className="w-4 h-4" />
          <span>Download Volunteers Sheet (.CSV)</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search volunteer by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading volunteer directory...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Volunteer Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Total Hours</th>
                  <th className="py-3.5 px-4">Total Points</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((vol) => (
                  <tr key={vol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                        {vol.name.charAt(0)}
                      </div>
                      <span>{vol.name}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{vol.email}</td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{vol.phone || '+1 (555) 000-0000'}</td>
                    <td className="py-4 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{vol.totalHours || 0} hrs</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-amber-700 dark:text-amber-400">
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{vol.totalPoints || 0} pts</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-full text-[10px]">
                        Active Member
                      </span>
                    </td>
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
