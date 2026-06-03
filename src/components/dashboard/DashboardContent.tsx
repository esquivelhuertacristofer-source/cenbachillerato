'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import MetricCards from '@/components/dashboard/MetricCards';
import LatestDeliveries from '@/components/dashboard/LatestDeliveries';
import TopAlumnos from '@/components/dashboard/TopAlumnos';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { useDashboardTheme } from '@/lib/stores/dashboard-theme';

interface TopAlumnoItem {
  id: string;
  full_name: string | null;
  email: string;
  actividades_completadas: number;
  score_total: number;
  score_promedio: number | null;
}

interface DashboardContentProps {
  teacherName?: string;
  pctAvance: number;
  totalAlumnos: number;
  totalGrupos: number;
  totalActividadesCompletadas: number;
  primerGrupo?: { id: string; nombre: string; semestre: number };
  semestre: number;
  grupoIds: string[];
  topList: TopAlumnoItem[];
}

export function DashboardContent({
  teacherName,
  pctAvance,
  totalAlumnos,
  totalGrupos,
  totalActividadesCompletadas,
  primerGrupo,
  semestre,
  grupoIds,
  topList,
}: DashboardContentProps) {
  const { isDark } = useDashboardTheme();

  /* ── Colores por modo ── */
  const mainBg   = isDark ? 'bg-[#060D1A]'    : 'bg-[#F4F6FA]';
  const hudBg    = isDark ? 'bg-[#060D1A]/80'  : 'bg-white/90';
  const hudText  = isDark ? 'text-white/50'    : 'text-slate-400';
  const hudBorder = isDark ? 'border-white/5'  : 'border-slate-200';
  const heading  = isDark ? 'text-white'       : 'text-[#011C40]';

  return (
    <div className={`flex min-h-screen font-['Epilogue'] relative overflow-hidden ${mainBg}`}>

      {/* Fondo ambiental dark — fixed, fuera del flujo flex */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none z-0 md:left-[260px]">
          <div className="absolute top-0 right-0 w-[1200px] h-[1200px] rounded-full blur-[200px] -mr-80 -mt-80 bg-[#D4A574]/5" />
          <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] rounded-full blur-[180px] -ml-40 -mb-80 bg-[#7DD3FC]/5" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>
      )}

      {/* Sidebar dentro del flex — ocupa su slot de 260px empujando el main */}
      <Sidebar
        teacherName={teacherName}
        grupoNombre={primerGrupo?.nombre}
        currentSemestre={semestre as 1 | 2 | 3 | 4 | 5 | 6}
      />

      {/* Main sin ml — el slot del sidebar ya lo posiciona en x=260px */}
      <main className="flex-1 relative z-10 custom-scrollbar md:overflow-y-auto md:h-screen flex flex-col">

        {/* ── HUD Status Bar — sin el recuadro pill ── */}
        <div className={`sticky top-0 z-50 backdrop-blur-3xl border-b px-4 sm:px-8 md:pr-12 md:pl-6 py-4 flex items-center justify-between ${hudBg} ${hudBorder} shadow-md transition-colors duration-300`}>
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.5)] bg-emerald-400 flex-shrink-0" />
            <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${hudText}`}>
              SISTEMA ONLINE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Solo texto, sin el recuadro */}
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] hidden sm:block ${hudText}`}>
              CEN Bachillerato
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 sm:p-8 md:pt-12 md:pr-12 md:pb-12 md:pl-6 space-y-12 lg:space-y-24 flex-1">

          {/* Welcome */}
          <WelcomeBanner
            teacherName={teacherName}
            pctAvance={pctAvance}
            isDark={isDark}
          />

          {/* Metrics */}
          <div className="space-y-8">
            <h2 className={`text-4xl font-black tracking-tighter leading-none ${heading}`}>
              Resumen Ejecutivo
            </h2>
            <MetricCards
              totalAlumnos={totalAlumnos}
              totalGrupos={totalGrupos}
              totalActividades={totalActividadesCompletadas}
              isDark={isDark}
            />
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch pb-20">
            <div className="lg:col-span-7">
              <LatestDeliveries grupoIds={grupoIds} isDark={isDark} />
            </div>
            <div className="lg:col-span-5">
              <TopAlumnos topList={topList} isDark={isDark} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
