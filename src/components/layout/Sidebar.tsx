import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Archive,
  Building2,
  UserCheck,
  Users,
  Award,
  BarChart3,
  Bell,
  Settings,
  PlusCircle,
  CalendarDays,
  History,
  ClipboardCheck,
  UserPlus,
  Compass,
  BookmarkCheck,
  ShieldAlert,
  User,
  Crown,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  HeartPulse,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { Role } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  role: Role;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingEventCount?: number;
  pendingOrganizerCount?: number;
  unreadNotifCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onTabChange,
  pendingEventCount = 0,
  pendingOrganizerCount = 0,
  unreadNotifCount = 0,
}) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'approval-queue', label: 'Approval Queue', icon: CheckCircle2, badge: pendingEventCount },
    { id: 'event-archive', label: 'Event Archive', icon: Archive },
    { id: 'organizers-list', label: 'Organizers', icon: Building2 },
    { id: 'organizer-approvals', label: 'Organizer Approvals', icon: UserCheck, badge: pendingOrganizerCount },
    { id: 'volunteers-list', label: 'Volunteers', icon: Users },
    { id: 'leadership-overview', label: 'Leadership Overview', icon: Crown },
    { id: 'impact-summary', label: 'Impact Summary', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const organizerNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-event', label: 'Create Event', icon: PlusCircle },
    { id: 'my-events', label: 'My Events', icon: CalendarDays },
    { id: 'history', label: 'History', icon: History },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'leader-selection', label: 'Leader Selection', icon: UserPlus },
    { id: 'burnout-alerts', label: 'Burnout Early-Warning', icon: HeartPulse },
    { id: 'impact-summary', label: 'Impact Summary', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const volunteerNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover', label: 'Activity Discovery', icon: Compass },
    { id: 'my-registrations', label: 'My Registrations', icon: BookmarkCheck },
    { id: 'team-hub', label: 'Event Team Hub', icon: MessageSquare },
    { id: 'volunteer-network', label: 'Volunteer Network', icon: Users },
    { id: 'hours-log', label: 'Service Hours & Expense Log', icon: Clock },
    { id: 'leadership-apps', label: 'Leadership Applications', icon: ShieldAlert },
    { id: 'badges', label: 'Badges & Achievements', icon: Award },
    { id: 'impact-analytics', label: 'Impact & Transcript', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'organizer' ? organizerNav : volunteerNav;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 transition-colors duration-200">
      <div className="space-y-6">
        
        {/* Role Portal Header */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Portal</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2 mt-0.5">
            {role === 'admin' && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
            {role === 'organizer' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            {role === 'volunteer' && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />}
            {role} Workspace
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info & Theme Switcher */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 px-2 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
          title="Click to cycle theme (Light -> Dark -> System)"
        >
          <span className="flex items-center gap-2">
            {theme === 'system' ? (
              <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>Theme Mode</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-900 uppercase text-slate-700 dark:text-slate-300">
            {theme}
          </span>
        </button>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">ImpactPulse v2.5</p>
          <p>Trusted Volunteer SaaS Platform</p>
        </div>
      </div>
    </aside>
  );
};
