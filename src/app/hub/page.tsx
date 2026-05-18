import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { ContinuarCard } from "@/components/hub/ContinuarCard";
import { UACCardHub } from "@/components/hub/UACCardHub";
import { ProgressSidebar } from "@/components/hub/ProgressSidebar";
import {
  getUltimaActividadActiva,
  getProgresoSemestre,
  getRachaDelAlumno,
  getProgresionesCompletadasDeUAC,
} from "@/lib/queries/hub";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Hub — CEN Bachillerato",
};

export default async function HubPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const semestre = profile.semestre ?? 1;
  const nombre = profile.full_name?.split(" ")[0] ?? "Alumno";

  const uacDelSemestre = UAC_BASE.filter((u) => u.semestre === semestre);

  // Parallel queries
  const [continuar, progreso, racha, ...progresosUAC] = await Promise.all([
    getUltimaActividadActiva(user.id, semestre),
    getProgresoSemestre(user.id, semestre),
    getRachaDelAlumno(user.id),
    ...uacDelSemestre.map((u) => getProgresionesCompletadasDeUAC(u.codigo, user.id)),
  ]);

  const uacConProgreso = uacDelSemestre.map((uac, i) => {
    const recurso = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === uac.recursoCodigo);
    const p = progresosUAC[i] ?? { completadas: 0, total: uac.totalProgresionesEsperadas, ultimaActividad: null };
    return {
      codigo: uac.codigo,
      nombre: uac.nombre,
      rscCodigo: uac.recursoCodigo ?? "RSC-LC",
      totalProgresiones: p.total > 0 ? p.total : uac.totalProgresionesEsperadas,
      completadas: p.completadas,
      ultimaActividad: p.ultimaActividad,
      recurso,
    };
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 48px" }}>
      {/* 2-column layout: main + sidebar */}
      <div style={{
        display: "flex",
        gap: 28,
        alignItems: "flex-start",
      }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 32 }}>

          {/* BLOQUE 2 — Continuar */}
          <section aria-label="Continuar donde dejaste">
            <ContinuarCard data={continuar} nombre={nombre} />
          </section>

          {/* BLOQUE 3 — Mis UAC */}
          <section id="mis-materias" aria-label="Mis materias del semestre">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0B2545", letterSpacing: "-0.02em", margin: 0 }}>
                Semestre {semestre}
              </h2>
              <span style={{
                borderRadius: 999,
                background: "#EFF6FF",
                border: "1px solid rgba(30,64,175,0.15)",
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 700,
                color: "#1E40AF",
              }}>
                {uacConProgreso.length} materias
              </span>
            </div>

            {/* UAC grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
              className="hub-uac-grid"
            >
              {uacConProgreso.map((uac, i) => (
                <div
                  key={uac.codigo}
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animation: "fadeInUp 0.4s ease both",
                  }}
                >
                  <UACCardHub
                    codigo={uac.codigo}
                    nombre={uac.nombre}
                    rscCodigo={uac.rscCodigo}
                    totalProgresiones={uac.totalProgresiones}
                    completadas={uac.completadas}
                    ultimaActividad={uac.ultimaActividad}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* BLOQUE 4 — Sidebar progreso (desktop) */}
        <div
          style={{
            width: 296,
            flexShrink: 0,
            position: "sticky",
            top: 88,
            alignSelf: "flex-start",
          }}
          className="hub-sidebar-desktop"
        >
          <ProgressSidebar progreso={progreso} racha={racha} semestre={semestre} />
        </div>
      </div>

      {/* BLOQUE 4 — Sidebar mobile (below grid) */}
      <div className="hub-sidebar-mobile" style={{ marginTop: 32 }}>
        <ProgressSidebar progreso={progreso} racha={racha} semestre={semestre} />
      </div>
    </div>
  );
}
