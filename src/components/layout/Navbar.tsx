import React, { useState, useRef, useEffect } from 'react';
import { Shield, Users, UserCheck, HeartHandshake, LogOut, Bell, Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { User } from '../../types';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onSelectRole?: (role: 'admin' | 'organizer' | 'volunteer') => void;
  onRoleSwitch?: (role: 'admin' | 'organizer' | 'volunteer') => void;
  unreadCount: number;
  onToggleNotifications?: () => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSelectRole,
  onRoleSwitch,
  unreadCount,
  onToggleNotifications,
  onOpenNotifications,
}) => {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: 'admin' | 'organizer' | 'volunteer') => {
    if (onRoleSwitch) {
      onRoleSwitch(role);
    } else if (onSelectRole) {
      onSelectRole(role);
    }
  };

  const handleNotifyClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else if (onToggleNotifications) {
      onToggleNotifications();
    }
  };

  const themeOptions: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'light', label: 'Light Theme', icon: Sun },
    { id: 'dark', label: 'Dark Theme', icon: Moon },
    { id: 'system', label: 'System Theme', icon: Monitor },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleRoleSelect(currentUser?.role || 'volunteer')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight flex items-center gap-1.5">
              ImpactPulse <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Supabase Live
              </span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Volunteer Impact Management Platform</p>
          </div>
        </div>

        {/* User Controls or Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Theme Switcher Button with Popover */}
          <div className="relative" ref={menuRef}>
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-0.5">
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title={`Current: ${theme.toUpperCase()} (${resolvedTheme.toUpperCase()}). Click to quick switch.`}
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="capitalize text-xs hidden sm:inline">{theme}</span>
              </button>

              <button
                onClick={() => setShowThemeMenu((prev) => !prev)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-700"
                title="Theme Options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Theme Dropdown Menu */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Appearance Theme</p>
                </div>
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {currentUser ? (
            <>
              {/* Current Role Badge */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                {currentUser.role === 'organizer' && <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                {currentUser.role === 'volunteer' && <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                <span className="capitalize">{currentUser.role} Portal</span>
              </div>

              {/* Notifications Button */}
              <button
                onClick={handleNotifyClick}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Info & Switcher */}
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{currentUser.email}</p>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center ring-2 ring-emerald-500/30">
                  {currentUser.name.charAt(0)}
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors ml-1"
                  title="Switch Role / Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Sign In / Register:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleRoleSelect('admin')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={() => handleRoleSelect('organizer')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors"
                >
                  Organizer
                </button>
                <button
                  onClick={() => handleRoleSelect('volunteer')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/60 dark:border-teal-800/60 transition-colors"
                >
                  Volunteer
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};


