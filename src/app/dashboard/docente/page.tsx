import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import {
  getMetricasDocente,
  getTopAlumnosDocente,
  getUACsConCompletionGrupo,
} from "@/lib/queries/docente";
import Sidebar from "@/components/dashboard/Sidebar";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import MetricCards from "@/components/dashboard/MetricCards";
import LatestDeliveries from "@/components/dashboard/LatestDeliveries";
import TopAlumnos from "@/components/dashboard/TopAlumnos";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Docente — CEN Bachillerato",
};

export default async function DocenteDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");
  if (profile.role === "student") redirect("/hub");
  if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");

  const metricas = await getMetricasDocente(user.id);
  const grupoIds = metricas.grupos.map((g) => g.id);

  const primerGrupo = metricas.grupos[0];
  const semestre = primerGrupo?.semestre ?? 1;

  // Calc avance global del primer grupo (si existe)
  let pctAvance = 0;
  if (primerGrupo) {
    const uacs = await getUACsConCompletionGrupo(primerGrupo.id);
    if (uacs.length > 0) {
      pctAvance = Math.round(uacs.reduce((s, u) => s + u.pct_completion, 0) / uacs.length);
    }
  }

  const topList = await getTopAlumnosDocente(user.id, 5);

  // Total actividades completadas (sum de top list como proxy)
  const totalActividadesCompletadas = topList.reduce((s, a) => s + a.actividades_completadas, 0);

  if (metricas.grupos.length === 0) {
    return (
      <div className="flex min-h-screen font-['Epilogue'] bg-[#011C40] theme-dark">
        <Sidebar
          teacherName={profile.full_name ?? undefined}
          grupoNombre={undefined}
          currentSemestre={1}
        />
        <main className="flex-1 md:ml-[260px] flex items-center justify-center p-8">
          <EmptyState
            icon="🏫"
            title="Sin grupos asignados"
            description="Aún no tienes grupos asignados. Contacta al administrador de tu escuela para que te asigne un grupo y puedas comenzar a monitorear el progreso de tus alumnos."
            variant="dark"
            className="max-w-md"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-['Epilogue'] relative overflow-hidden bg-[#011C40] theme-dark">

      {/* Cinematic background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1400px] h-[1400px] rounded-full blur-[200px] -mr-80 -mt-80 animate-pulse bg-[#D4A574]/5 opacity-100" />
        <div className="absolute bottom-0 left-[300px] w-[1200px] h-[1200px] rounded-full blur-[180px] -ml-80 -mb-80 bg-[#7DD3FC]/5 opacity-100" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
      </div>

      <Sidebar
        teacherName={profile.full_name ?? undefined}
        grupoNombre={primerGrupo?.nombre}
        currentSemestre={semestre as 1 | 2 | 3 | 4 | 5 | 6}
      />

      <main className="flex-1 md:ml-[260px] relative z-10 custom-scrollbar md:overflow-y-auto md:h-screen flex flex-col">

        {/* HUD Status Bar */}
        <div className="sticky top-0 z-50 backdrop-blur-3xl border-b px-4 sm:px-8 md:px-12 py-4 flex items-center justify-between bg-[#011C40]/80 border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)] bg-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50">SISTEMA ONLINE</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border bg-white/5 border-white/10">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
              CEN Bachillerato MCCEMS
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4 sm:p-8 md:p-12 space-y-12 lg:space-y-24 flex-1">

          {/* Welcome */}
          <div>
            <WelcomeBanner
              teacherName={profile.full_name ?? undefined}
              pctAvance={pctAvance}
              isDark={true}
            />
          </div>

          {/* Metric cards */}
          <div className="space-y-12">
            <h2 className="text-4xl font-black tracking-tighter leading-none text-white">
              Resumen Ejecutivo
            </h2>
            <MetricCards
              totalAlumnos={metricas.totalAlumnos}
              totalGrupos={metricas.totalGrupos}
              totalActividades={totalActividadesCompletadas}
              isDark={true}
            />
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch pb-20">
            <div className="lg:col-span-7">
              <LatestDeliveries grupoIds={grupoIds} isDark={true} />
            </div>
            <div className="lg:col-span-5">
              <TopAlumnos topList={topList} isDark={true} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
