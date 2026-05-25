'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Library,
  LogOut,
} from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const navItems = [
  { icon: LayoutDashboard, label: 'Panel Principal',     href: '/dashboard/docente' },
  { icon: Users,           label: 'Mis Alumnos',         href: '/dashboard/docente/alumnos' },
  { icon: BookOpen,        label: 'Módulos CEN',         href: '/dashboard/docente/modulos' },
  { icon: GraduationCap,   label: 'Planteamiento',       href: '/dashboard/docente/planteamiento' },
  { icon: BarChart3,       label: 'Reportes',            href: '/dashboard/docente/reportes' },
  { icon: Library,         label: 'Biblioteca',          href: '/dashboard/docente/biblioteca' },
];

export default function MobileNav({ teacherName }: { teacherName?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* ── Fixed top bar — mobile only ──────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[60] h-14 flex items-center justify-between px-4 border-b border-white/5 shadow-lg bg-[#011C40]"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-[#D4A574] to-[#b8895a] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm leading-none">C</span>
          </div>
          <div className="leading-none">
            <span className="text-white font-black text-[15px] tracking-tighter">CEN</span>
            <span className="text-[#7DD3FC] text-[8px] font-black uppercase tracking-[0.15em] ml-1.5">Bachillerato</span>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú de navegación"
          aria-expanded={open}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Drawer overlay ────────────────────────────────────────────────── */}
      {open && (
        <div className="md:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div className="fixed top-0 left-0 bottom-0 z-[80] w-[280px] flex flex-col bg-[#011C40] shadow-2xl border-r border-white/5">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4A574] to-[#b8895a] rounded-[1rem] flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-black text-lg leading-none">C</span>
                </div>
                <div>
                  <div className="text-white font-black text-lg tracking-tighter leading-none">CEN</div>
                  <div className="text-[#7DD3FC] text-[8px] font-black uppercase tracking-[0.15em] mt-0.5">Bachillerato MCCEMS</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher badge */}
            {teacherName && (
              <div className="mx-4 mb-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-white/30 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Docente</p>
                <p className="text-white font-black text-sm truncate">{teacherName}</p>
              </div>
            )}

            {/* Nav items */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto" aria-label="Navegación docente">
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard/docente'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-[12px] font-black uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-[#011C40] shadow-lg'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#D4A574]' : 'text-white/20'}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer / sign out */}
            <div className="p-4 mt-auto border-t border-white/5">
              <button
                onClick={async () => {
                  await getSupabaseBrowser().auth.signOut();
                  window.location.href = '/log-in';
                }}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white hover:text-[#011C40] transition-all duration-300 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                Desconectar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
