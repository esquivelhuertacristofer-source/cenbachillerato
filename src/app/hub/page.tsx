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
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 40px 64px" }}>
      {/* 2-column layout: main + sidebar */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 40 }}>

          {/* Hero — Continuar */}
          <section aria-label="Continuar donde dejaste">
            <ContinuarCard data={continuar} nombre={nombre} />
          </section>

          {/* UAC grid */}
          <section id="mis-materias" aria-label="Mis materias del semestre">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1E40AF", margin: "0 0 4px" }}>
                  Tus áreas de aprendizaje
                </p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0B2545", letterSpacing: "-0.03em", margin: 0, lineHeight: 1 }}>
                  Semestre {semestre}
                </h2>
              </div>
              <span style={{
                borderRadius: 999,
                background: "#EFF6FF",
                border: "1px solid rgba(30,64,175,0.15)",
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 700,
                color: "#1E40AF",
              }}>
                {uacConProgreso.length} materias
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
              }}
              className="hub-uac-grid"
            >
              {uacConProgreso.map((uac, i) => (
                <div
                  key={uac.codigo}
                  style={{
                    animationDelay: `${i * 70}ms`,
                    animation: "fadeInUp 0.45s cubic-bezier(.22,1,.36,1) both",
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

        {/* Sidebar — desktop */}
        <div
          style={{ width: 310, flexShrink: 0, position: "sticky", top: 88, alignSelf: "flex-start" }}
          className="hub-sidebar-desktop"
        >
          <ProgressSidebar progreso={progreso} racha={racha} semestre={semestre} />
        </div>
      </div>

      {/* Sidebar — mobile */}
      <div className="hub-sidebar-mobile" style={{ marginTop: 40 }}>
        <ProgressSidebar progreso={progreso} racha={racha} semestre={semestre} />
      </div>
    </div>
  );
}
