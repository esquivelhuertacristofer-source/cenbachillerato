'use client';

import { Moon, Sun } from 'lucide-react';
import { useDashboardTheme } from '@/lib/stores/dashboard-theme';

export function ThemeToggle() {
  const { isDark, toggle } = useDashboardTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px]
        uppercase tracking-widest transition-all duration-200 border
        ${isDark
          ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
          : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
        }
      `}
    >
      {isDark ? <Sun className="w-3.5 h-3.5 flex-shrink-0" /> : <Moon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span className="hidden sm:inline">{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  );
}
