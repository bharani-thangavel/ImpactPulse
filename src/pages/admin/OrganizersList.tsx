import React, { useEffect, useState } from 'react';
import { Building2, Mail, Phone, Calendar, Users, Award, X, Eye, Download } from 'lucide-react';
import { api } from '../../services/api';
import { User, EventItem } from '../../types';
import { exportOrganizersDirectoryCsv } from '../../utils/exportCsv';

export const OrganizersList: React.FC = () => {
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgs, evs] = await Promise.all([
        api.getUsers('organizer', 'approved'),
        api.getEvents(),
      ]);
      setOrganizers(orgs);
      setEvents(evs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEventsCount = (orgId: string) => {
    return events.filter((e) => e.organizerId === orgId).length;
  };

  const getOrganizerEvents = (orgId: string) => {
    return events.filter((e) => e.organizerId === orgId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Verified Organizers Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active verified organizations, past event metrics, and volunteer engagement overview.
          </p>
        </div>

        <button
          onClick={() => exportOrganizersDirectoryCsv(organizers, events)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
          title="Download verified organizers directory spreadsheet as CSV"
        >
          <Download className="w-4 h-4" />
          <span>Download Organizers Sheet (.CSV)</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading organizers...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Organizer Name</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Contact Email</th>
                  <th className="py-3.5 px-4">Events Conducted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {organizers.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{org.name}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{org.organizationName || 'Independent'}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{org.email}</td>
                    <td className="py-4 px-4 font-bold text-emerald-700 dark:text-emerald-400">{getEventsCount(org.id)} events</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-full text-[10px]">
                        Verified
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrganizer(org)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Organizer Details Modal */}
      {selectedOrganizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelectedOrganizer(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-xl flex items-center justify-center">
                {selectedOrganizer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedOrganizer.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedOrganizer.organizationName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Email Contact</p>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedOrganizer.email}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Phone Number</p>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedOrganizer.contactDetails || '+1 (555) 019-2831'}</p>
              </div>
            </div>

            {/* Past Events */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Organized Events & Impact
              </h3>
              <div className="space-y-2">
                {getOrganizerEvents(selectedOrganizer.id).length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500">No events conducted yet.</p>
                ) : (
                  getOrganizerEvents(selectedOrganizer.id).map((e) => (
                    <div key={e.id} className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{e.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{e.date} • {e.venue}</p>
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full text-[10px]">
                        {e.membersRegistered}/{e.membersRequired} Joined
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
