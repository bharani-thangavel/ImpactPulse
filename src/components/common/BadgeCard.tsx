import React from 'react';
import { Award, ShieldCheck, Leaf, Footprints, GraduationCap, Lock } from 'lucide-react';
import { Badge } from '../../types';

interface BadgeCardProps {
  badge: Badge;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints':
        return Footprints;
      case 'Leaf':
        return Leaf;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'GraduationCap':
        return GraduationCap;
      default:
        return Award;
    }
  };

  const IconComponent = getIcon(badge.iconName);

  return (
    <div
      className={`rounded-2xl border p-4 flex items-start gap-3.5 transition-all ${
        badge.isUnlocked
          ? 'bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/40 dark:to-teal-950/20 border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs'
          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          badge.isUnlocked
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        }`}
      >
        {badge.isUnlocked ? <IconComponent className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{badge.badgeName}</h4>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              badge.isUnlocked
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {badge.category}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{badge.description}</p>
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2">
          {badge.isUnlocked ? `Earned: ${badge.earnedDate}` : 'Locked'}
        </p>
      </div>
    </div>
  );
};
