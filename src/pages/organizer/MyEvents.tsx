import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  PlusCircle,
  Eye,
  Crown,
  CheckCircle2,
  Filter,
  Download,
} from 'lucide-react';
import { api } from '../../services/api';
import { EventItem, User } from '../../types';
import { EventDetailsModal } from '../../components/organizer/EventDetailsModal';
import { exportEventsSummaryCsv } from '../../utils/exportCsv';

interface MyEventsProps {
  currentUser: User;
  onCreateNew: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const MyEvents: React.FC<MyEventsProps> = ({ currentUser, onCreateNew, onNavigateTab }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'approved' | 'pending' | 'all'>('approved');
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
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

  const filteredEvents = events.filter((e) => {
    if (filterTab === 'approved') return e.status === 'ongoing';
    if (filterTab === 'pending') return e.status === 'pending';
    return true; // 'all'
  });

  const approvedCount = events.filter((e) => e.status === 'ongoing').length;
  const pendingCount = events.filter((e) => e.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-7xl">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            My Events & Volunteer Roster
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review approved drives, monitor seat capacity, view registered members, and contact team leaders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportEventsSummaryCsv(events, 'Organizer_Events_Roster')}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
            title="Download CSV summary sheet of all events"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Download Events Sheet (.CSV)</span>
          </button>

          <button
            onClick={onCreateNew}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event Drive
          </button>
        </div>
      </div>

      {/* Category/Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              filterTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved Events ({approvedCount})
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              filterTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Verification ({pendingCount})
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Drives ({events.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
          Click any approved event to inspect registered members & contact details
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 font-medium">Loading your events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
          <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No events found in this tab.</p>
          {filterTab === 'approved' && (
            <p className="text-xs mt-1 text-slate-500">Events approved by Platform Admin will appear here.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredEvents.map((event) => {
            const fillPct = Math.round((event.membersRegistered / event.membersRequired) * 100);
            const isApproved = event.status === 'ongoing';

            return (
              <div
                key={event.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isApproved
                    ? 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {isApproved ? '✅ Approved / Live Drive' : '⏳ Pending Admin Review'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {event.category}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedEventForModal(event)}
                    className="font-extrabold text-slate-900 dark:text-slate-100 text-base hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.date} • {event.time} ({event.duration} hrs)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Registered Volunteers
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">
                        {event.membersRegistered} / {event.membersRequired} ({fillPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedEventForModal(event)}
                      className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isApproved
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      {isApproved ? 'View Approved Members & Details' : 'View Event Details'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Event Details & Registered Members */}
      <EventDetailsModal
        isOpen={!!selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        event={selectedEventForModal}
        currentUser={currentUser}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
