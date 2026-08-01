import React, { useEffect, useState } from 'react';
import { Search, Filter, Archive, Calendar, MapPin, Building2, Download } from 'lucide-react';
import { api } from '../../services/api';
import { EventItem } from '../../types';
import { exportEventsSummaryCsv } from '../../utils/exportCsv';

export const EventArchive: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizerSearch, setOrganizerSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      // Exclude pending from archive, or show ongoing/completed/declined
      setEvents(data.filter((e) => e.status !== 'pending'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesName = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = e.organizerName.toLowerCase().includes(organizerSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesName && matchesOrg && matchesStatus;
  });

  const getStatusBadge = (status: EventItem['status']) => {
    switch (status) {
      case 'ongoing':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">Ongoing / Active</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-full text-[10px]">Completed</span>;
      case 'declined':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px]">Declined</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-full text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Archive className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Event Archive & Master Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical repository of published, ongoing, completed, and declined volunteering events across the platform.
          </p>
        </div>

        <button
          onClick={() => exportEventsSummaryCsv(filteredEvents, 'Master_Event_Archive')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
          title="Download master CSV spreadsheet of all archived events"
        >
          <Download className="w-4 h-4" />
          <span>Download Master Sheet (.CSV)</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Event Name */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search event name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Search Organizer */}
        <div className="relative">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search organizer..."
            value={organizerSearch}
            onChange={(e) => setOrganizerSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading master event records...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
          No archived events found matching the search criteria.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Organizer</th>
                  <th className="py-3.5 px-4">Venue & Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{event.title}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{event.organizerName}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      <div>{event.venue}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{event.date}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-400">{event.category}</td>
                    <td className="py-4 px-4">{getStatusBadge(event.status)}</td>
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
