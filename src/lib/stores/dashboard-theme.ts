import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (val: boolean) => void;
}

export const useDashboardTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: true,
      toggle: () => set((s) => ({ isDark: !s.isDark })),
      setDark: (val) => set({ isDark: val }),
    }),
    { name: 'cen-dashboard-theme' }
  )
);
