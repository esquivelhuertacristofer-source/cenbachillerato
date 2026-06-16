'use client';

import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  LogOut,
  Sparkles,
  Zap,
  ChevronDown,
  Library,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, LayoutGroup } from 'motion/react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const navItems = [
  { icon: LayoutDashboard, label: 'Panel Principal',       href: '/dashboard/docente' },
  { icon: Users,           label: 'Mis Alumnos',           href: '/dashboard/docente/alumnos' },
  { icon: BookOpen,        label: 'Módulos CEN',           href: '/dashboard/docente/modulos' },
  { icon: GraduationCap,   label: 'Planteamiento',         href: '/dashboard/docente/planteamiento' },
  { icon: BarChart3,       label: 'Reportes Académicos',   href: '/dashboard/docente/reportes' },
  { icon: Library,         label: 'Biblioteca',            href: '/dashboard/docente/biblioteca' },
];

const SEMESTRES = [1, 2, 3, 4, 5, 6] as const;
type Semestre = (typeof SEMESTRES)[number];

export default function Sidebar({
  teacherName,
  grupoNombre,
  currentSemestre = 1,
  onSemestreChange,
}: {
  teacherName?: string;
  grupoNombre?: string;
  currentSemestre?: Semestre;
  onSemestreChange?: (s: Semestre) => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex sticky top-0 z-40 h-screen w-[260px] flex-shrink-0 flex-col overflow-hidden border-r border-white/10 font-['Epilogue'] noise-texture"
      style={{
        background:
          'radial-gradient(120% 60% at 0% -5%, rgba(212,165,116,0.12) 0%, transparent 55%), linear-gradient(180deg, #06234A 0%, #011C40 42%, #01152F 100%)',
      }}
    >
      {/* Hairline de acento dorado en el borde derecho */}
      <div
        className="absolute top-0 right-0 w-px h-full pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(212,165,116,0.40) 0%, transparent 28%)' }}
      />

      {/* Decorative Gradient Glow (suave) */}
      <div className="absolute -left-24 -top-24 w-64 h-64 bg-[#D4A574]/20 rounded-full blur-[110px] pointer-events-none opacity-50" />

      {/* Logo Section */}
      <div className="relative z-10 pt-7 pb-6 px-5 border-b border-white/[0.06]">
        <Link href="/dashboard/docente" className="flex items-center gap-3 group">
          <div className="relative flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-gradient-to-br from-[#E5C295] via-[#D4A574] to-[#b8895a] shadow-[0_6px_16px_rgba(212,165,116,0.30),inset_0_1px_0_rgba(255,255,255,0.45)] overflow-hidden">
            <span className="relative text-[#3a2410] font-black text-lg tracking-tighter">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-[17px] leading-[1.05] tracking-[-0.03em]">CEN Bachillerato</span>
            <span className="text-[#E5C295]/70 text-[9.5px] font-bold uppercase tracking-[0.16em] mt-[3px]">Panel docente</span>
          </div>
        </Link>
      </div>

      {/* Semestre Selector */}
      <div className="relative z-10 px-[18px] pt-4 mb-5">
        <p className="text-white/28 text-[9.5px] font-extrabold uppercase tracking-[0.16em] mb-2 px-0.5">Semestre activo</p>
        <div className="bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08] grid grid-cols-3 gap-1">
          {SEMESTRES.map((s) => (
            <button
              key={s}
              onClick={() => onSemestreChange?.(s)}
              className={`py-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 ${
                currentSemestre === s
                  ? 'bg-gradient-to-br from-[#E5C295] to-[#D4A574] text-[#3a2410] shadow-[0_6px_14px_rgba(212,165,116,0.30)]'
                  : 'text-white/35 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              {s}°
            </button>
          ))}
        </div>
      </div>

      {/* Active Group Badge */}
      <div className="relative z-10 px-[18px] mb-5">
        <button className="w-full flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] px-3.5 py-3 group transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.14] text-left">
          <div className="relative h-[34px] w-[34px] shrink-0 rounded-[10px] bg-gradient-to-br from-[#E5C295] to-[#b8895a] flex items-center justify-center text-[#3a2410] shadow-[0_4px_12px_rgba(212,165,116,0.35)]">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/40 text-[9px] font-extrabold uppercase tracking-[0.14em] leading-none mb-1">Grupo activo</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-white font-bold text-[13px] truncate tracking-tight">
                {grupoNombre || `Semestre ${currentSemestre}`}
              </p>
              <ChevronDown className="w-3.5 h-3.5 text-white/25 group-hover:text-white/70 transition-colors shrink-0" />
            </div>
          </div>
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="relative z-10 flex-1 px-2.5 flex flex-col gap-[3px]">
        <p className="text-white/28 text-[9.5px] font-extrabold uppercase tracking-[0.16em] px-3.5 pt-1 pb-1.5">Navegación</p>
        <LayoutGroup id="docente-nav">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard/docente'
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex items-center gap-3 rounded-[14px] px-4 py-[11px] text-[14px] font-bold transition-[color,transform] duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-white/55 hover:text-white/90 hover:translate-x-[3px]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="docente-nav-active"
                    transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                    className="absolute inset-0 rounded-[14px] border"
                    style={{
                      zIndex: 0,
                      background:
                        'linear-gradient(135deg, rgba(212,165,116,0.22) 0%, rgba(184,137,90,0.10) 100%)',
                      borderColor: 'rgba(212,165,116,0.32)',
                      boxShadow:
                        '0 10px 24px rgba(212,165,116,0.16), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                  >
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-[3px]"
                      style={{ background: '#E5C295', boxShadow: '0 0 10px rgba(212,165,116,0.65)' }}
                    />
                  </motion.span>
                )}
                <span
                  className={`relative z-[1] flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] border transition-all duration-200 ${
                    isActive
                      ? 'border-transparent bg-gradient-to-br from-[#E5C295] to-[#D4A574] text-[#3a2410] shadow-[0_4px_12px_rgba(212,165,116,0.40)]'
                      : 'border-white/[0.05] bg-white/[0.04] text-white/65 group-hover:bg-[#D4A574]/15 group-hover:text-[#E5C295]'
                  }`}
                >
                  <item.icon className="h-[17px] w-[17px]" />
                </span>
                <span className="relative z-[1] flex-1">{item.label}</span>
              </Link>
            );
          })}
        </LayoutGroup>
      </nav>

      {/* Footer / Profile */}
      <div className="relative z-10 px-2.5 pb-[18px] pt-2.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="h-[34px] w-[34px] rounded-full bg-gradient-to-tr from-[#E5C295] to-[#D4A574] flex items-center justify-center text-[#3a2410] font-extrabold text-[13px] shadow-[0_4px_12px_rgba(212,165,116,0.30),inset_0_1px_0_rgba(255,255,255,0.4)] shrink-0">
            {teacherName?.charAt(0)?.toUpperCase() ?? 'D'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-[13px] truncate leading-tight">{teacherName ?? 'Docente CEN'}</p>
            <p className="text-white/32 text-[10px] truncate leading-tight">Docente</p>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-[#D4A574] shrink-0" />
        </div>

        <button
          onClick={async () => {
            await getSupabaseBrowser().auth.signOut();
            window.location.href = '/log-in';
          }}
          className="group mt-1 flex w-full items-center gap-[7px] rounded-[10px] px-2 py-2 text-[12px] font-semibold text-white/30 transition-colors duration-200 hover:text-white/65"
        >
          <LogOut className="h-[13px] w-[13px] transition-transform group-hover:-translate-x-0.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
