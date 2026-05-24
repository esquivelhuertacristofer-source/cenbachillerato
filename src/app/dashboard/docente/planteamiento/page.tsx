import { redirect, notFound } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getGruposDocente, getPlanteamientoGrupo } from "@/lib/queries/docente";
import { PlanteamientoTabs } from "@/components/dashboard/PlanteamientoTabs";
import { GrupoSelectorClient } from "@/components/dashboard/GrupoSelectorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planteamiento académico — Dashboard Docente | CEN Bachillerato",
};

export default async function PlanteamientoPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string }>;
}) {
  const { grupo: grupoParam } = await searchParams;

  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile || profile.role === "student") redirect("/hub");

  const grupos = await getGruposDocente(user.id);

  if (grupos.length === 0) {
    return (
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
          Docente · Planteamiento
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: '0 0 32px' }}>
          Planteamiento académico
        </h1>
        <div style={{
          background: '#fff', border: '2px dashed rgba(11,37,69,0.14)',
          borderRadius: 24, padding: '80px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <i className="fa-solid fa-map" style={{ fontSize: 48, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>Sin grupos asignados</h2>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.55)', maxWidth: 420, lineHeight: 1.65 }}>
            El administrador debe asignarte a un grupo para ver el planteamiento académico.
          </p>
        </div>
      </main>
    );
  }

  // Validar grupoId: debe pertenecer al docente
  const grupoId = grupoParam && grupos.some((g) => g.id === grupoParam)
    ? grupoParam
    : grupos[0]!.id;

  const data = await getPlanteamientoGrupo(grupoId, user.id);

  if (!data) notFound();

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
            <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#10b981', marginRight: 6 }} />
            Docente · Planteamiento
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
            Planteamiento académico
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
            Seguimiento curricular MCCEMS · Semestre {data.grupo.semestre}
          </p>
        </div>

        {/* Grupo selector (client island) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(11,37,69,0.55)' }}>Grupo:</span>
          <GrupoSelectorClient grupos={grupos} selectedId={grupoId} />
        </div>
      </div>

      {/* Tabs */}
      <PlanteamientoTabs
        uacs={data.uacs}
        progresiones={data.progresiones}
        recomendaciones={data.recomendaciones}
        totalActividades={data.total_actividades_semestre}
        pctGlobal={data.pct_completion_global}
        grupoNombre={data.grupo.nombre}
        semestre={data.grupo.semestre}
      />
    </main>
  );
}
