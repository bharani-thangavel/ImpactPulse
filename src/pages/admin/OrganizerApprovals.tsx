import React, { useEffect, useState } from 'react';
import { UserCheck, Check, X, ShieldAlert, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

export const OrganizerApprovals: React.FC = () => {
  const [pendingOrganizers, setPendingOrganizers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers('organizer', 'pending');
      setPendingOrganizers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'declined') => {
    try {
      await api.updateUserStatus(id, status);
      setPendingOrganizers((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          Organizer Registration Approvals
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review institutional registration numbers and credentials before granting organizer publishing access.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading pending organizer registrations...</div>
      ) : pendingOrganizers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-8 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">All Registration Requests Cleared</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No pending organizer registration requests at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingOrganizers.map((org) => (
            <div key={org.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{org.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{org.organizationName}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold rounded-full text-[10px]">
                    Pending Verification
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Email:</span> {org.email}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Contact Details:</span>{' '}
                    <span className="font-medium text-slate-900 dark:text-slate-100">{org.contactDetails || '+1 (555) 019-2831'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleAction(org.id, 'approved')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Approve Organizer
                </button>
                <button
                  onClick={() => handleAction(org.id, 'declined')}
                  className="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
