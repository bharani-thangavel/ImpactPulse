import React, { useEffect, useState } from 'react';
import { Crown, Clock, CheckCircle2, XCircle, Sparkles, ShieldCheck, Megaphone, Eye, Users } from 'lucide-react';
import { api } from '../../services/api';
import { LeadershipApplication, EventItem, User } from '../../types';
import { SendQuickNotificationModal } from '../../components/common/SendQuickNotificationModal';
import { EventDetailsModal } from '../../components/organizer/EventDetailsModal';

interface LeadershipApplicationsProps {
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

export const LeadershipApplications: React.FC<LeadershipApplicationsProps> = ({ currentUser, onNavigateTab }) => {
  const [applications, setApplications] = useState<LeadershipApplication[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, EventItem>>({});
  const [loading, setLoading] = useState(true);
  const [showQuickNotifModal, setShowQuickNotifModal] = useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apps, evs] = await Promise.all([
        api.getLeadershipApplications(),
        api.getEvents(),
      ]);
      setApplications(apps.filter((a) => a.volunteerId === currentUser.id));

      const map: Record<string, EventItem> = {};
      evs.forEach((e) => {
        map[e.id] = e;
      });
      setEventsMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasApprovedLeader = applications.some((a) => a.status === 'approved');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          My Team Leadership Applications
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor organizer decisions on your event leadership role applications and unlocked privileges.
        </p>
      </div>

      {/* Unlocked Team Leader Controls Banner */}
      {hasApprovedLeader && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 font-extrabold flex items-center justify-center shrink-0">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-slate-950/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase text-slate-950 mb-1">
                <Sparkles className="w-3 h-3" /> Certified Event Leader
              </div>
              <h3 className="text-lg font-bold">Team Leader Badges & Privileges Active!</h3>
              <p className="text-xs text-slate-900/90 font-medium mt-0.5">
                You have been appointed Team Leader. You can broadcast quick notifications to all volunteers and lead team coordination.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQuickNotifModal(true)}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            Float Quick Notification
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
          <Crown className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
          <p className="text-sm font-semibold">No leadership applications submitted yet.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Visit Activity Discovery to apply for Team Leader positions!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const event = eventsMap[app.eventId];
            return (
              <div key={app.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      onClick={() => event && setSelectedEventForModal(event)}
                      className="font-extrabold text-slate-900 dark:text-slate-100 text-sm hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                    >
                      {app.eventTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Submitted {app.appliedAt}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{app.reason}"</p>

                  {event && (
                    <button
                      onClick={() => setSelectedEventForModal(event)}
                      className="mt-3 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> View Event Details & Registered Members
                    </button>
                  )}
                </div>

                <div>
                  {app.status === 'approved' && (
                    <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Approved Team Leader
                    </span>
                  )}
                  {app.status === 'rejected' && (
                    <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Application Declined
                    </span>
                  )}
                  {app.status === 'pending' && (
                    <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Pending Organizer Review
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SendQuickNotificationModal
        isOpen={showQuickNotifModal}
        onClose={() => setShowQuickNotifModal(false)}
        currentUser={currentUser}
        isVolunteerLeader={hasApprovedLeader}
      />

      {/* Event Details & Registered Members Modal */}
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
