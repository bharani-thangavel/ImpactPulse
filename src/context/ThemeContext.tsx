import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  themeNotice: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('impactpulse_theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [themeNotice, setThemeNotice] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    };

    const applyTheme = (mode: ThemeMode) => {
      const active = mode === 'system' ? getSystemTheme() : mode;
      setResolvedTheme(active);
      if (active === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('impactpulse_theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const showNotice = (msg: string) => {
    setThemeNotice(msg);
    setTimeout(() => {
      setThemeNotice(null);
    }, 2200);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      let next: ThemeMode;
      if (prev === 'light') next = 'dark';
      else if (prev === 'dark') next = 'system';
      else next = 'light';

      const noticeText =
        next === 'dark'
          ? 'Switched to Dark Theme'
          : next === 'light'
          ? 'Switched to Light Theme'
          : 'Matched System Theme';
      showNotice(noticeText);
      return next;
    });
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    const noticeText =
      newTheme === 'dark'
        ? 'Switched to Dark Theme'
        : newTheme === 'light'
        ? 'Switched to Light Theme'
        : 'Matched System Theme';
    showNotice(noticeText);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme, themeNotice }}>
      {children}
      {themeNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700 dark:border-slate-300 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-600 animate-pulse" />
          <span>{themeNotice}</span>
        </div>
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'system',
      resolvedTheme: 'light',
      toggleTheme: () => {},
      setTheme: () => {},
      themeNotice: null,
    };
  }
  return context;
};

