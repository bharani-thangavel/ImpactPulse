import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Download } from 'lucide-react';
import { BadgeCard } from '../../components/common/BadgeCard';
import { api } from '../../services/api';
import { Badge, User } from '../../types';
import { exportBadgesCsv } from '../../utils/exportCsv';

interface VolunteerBadgesProps {
  currentUser: User;
}

export const VolunteerBadges: React.FC<VolunteerBadgesProps> = ({ currentUser }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const data = await api.getBadges(currentUser.id);
      setBadges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Impact Achievements & Badges Gallery
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Digital credentials unlocked through verified volunteer hours, team leadership, and social contribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center gap-2 w-fit">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{unlockedCount} / {badges.length} Unlocked Badges</span>
          </div>

          <button
            onClick={() => exportBadgesCsv(currentUser, badges)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download credentials & unlocked badges sheet in CSV format"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Download Credentials (.CSV)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading achievements...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
};
