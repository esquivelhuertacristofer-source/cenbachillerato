import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import {
  getMetricasDocente,
  getTopAlumnosDocente,
  getUACsConCompletionGrupo,
} from "@/lib/queries/docente";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { EmptyState } from "@/components/ui/EmptyState";
import Sidebar from "@/components/dashboard/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Docente — CEN Bachillerato",
};

/*
 * `?grupo=<id>` es lo que pulsa el docente en el lateral. Se comprueba contra SUS
 * grupos antes de usarlo: un id pegado a mano no puede abrirle el panel de otro.
 * Sin parametro, o con uno que no es suyo, se cae al primero, como toda la vida.
 */
export default async function DocenteDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");
  if (profile.role === "student") redirect("/hub");
  if (profile.role === "admin" || profile.role === "super_admin")
    redirect("/admin/escuelas");

  const metricas = await getMetricasDocente(user.id);
  const grupoIds = metricas.grupos.map((g) => g.id);
  const { grupo: grupoPedido } = await searchParams;
  const primerGrupo =
    metricas.grupos.find((g) => g.id === grupoPedido) ?? metricas.grupos[0];
  const semestre = primerGrupo?.semestre ?? 1;

  /*
   * El avance del grupo y el cuadro de honor no se necesitan el uno al otro, y
   * en serie eran dos cadenas de consultas esperándose. Van a la vez, y a la
   * segunda se le pasan los grupos que ya tenemos para que no los vuelva a pedir.
   */
  const [uacs, topList] = await Promise.all([
    primerGrupo ? getUACsConCompletionGrupo(primerGrupo.id, user.id) : Promise.resolve([]),
    getTopAlumnosDocente(user.id, 5, grupoIds),
  ]);

  // Avance global del grupo activo
  const pctAvance = uacs.length > 0
    ? Math.round(uacs.reduce((s, u) => s + u.pct_completion, 0) / uacs.length)
    : 0;
  const totalActividadesCompletadas = topList.reduce(
    (s, a) => s + a.actividades_completadas,
    0
  );

  if (metricas.grupos.length === 0) {
    return (
      <div className="flex min-h-screen font-['Epilogue'] bg-[#060D1A]">
        <Sidebar
          teacherName={profile.full_name ?? undefined}
          grupoNombre={undefined}
          currentSemestre={1}
        />
        <main className="flex-1 flex items-center justify-center p-8">
          <EmptyState
            icon="🏫"
            title="Sin grupos asignados"
            description="Aún no tienes grupos asignados. Contacta al administrador de tu escuela para que te asigne un grupo."
            variant="dark"
            className="max-w-md"
          />
        </main>
      </div>
    );
  }

  return (
    <DashboardContent
      teacherName={profile.full_name ?? undefined}
      pctAvance={pctAvance}
      totalAlumnos={metricas.totalAlumnos}
      totalGrupos={metricas.totalGrupos}
      totalActividadesCompletadas={totalActividadesCompletadas}
      primerGrupo={primerGrupo ? {
        id: primerGrupo.id,
        nombre: primerGrupo.nombre,
        semestre: primerGrupo.semestre,
      } : undefined}
      grupos={metricas.grupos.map((g) => ({ id: g.id, nombre: g.nombre, semestre: g.semestre }))}
      semestre={semestre}
      grupoIds={grupoIds}
      topList={topList}
    />
  );
}
