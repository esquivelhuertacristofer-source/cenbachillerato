import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getGruposDocente, getActividadesStatsGrupo } from "@/lib/queries/docente";
import { GrupoSelectorClient } from "@/components/dashboard/GrupoSelectorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actividades — Dashboard Docente | CEN Bachillerato",
};

const TIPO_LABEL: Record<string, string> = {
  quiz: 'Quiz',
  flashcard: 'Flashcard',
  lectura: 'Lectura',
  video: 'Video',
  ejercicio: 'Ejercicio',
};

function ScoreBar({ score, total }: { score: number | null; total: number }) {
  if (total === 0) {
    return <span style={{ color: 'rgba(11,37,69,0.30)', fontSize: 12 }}>—</span>;
  }
  if (score === null) {
    return <span style={{ color: 'rgba(11,37,69,0.45)', fontSize: 12 }}>N/A</span>;
  }
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <span style={{ fontWeight: 700, color, fontSize: 13 }}>{score}</span>
  );
}

export default async function ActividadesPage({
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
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', marginBottom: 8 }}>Actividades</h1>
        <p style={{ color: 'rgba(11,37,69,0.55)' }}>No tienes grupos asignados.</p>
      </main>
    );
  }

  const grupoId = grupoParam && grupos.some((g) => g.id === grupoParam)
    ? grupoParam
    : grupos[0]!.id;

  const grupo = grupos.find((g) => g.id === grupoId)!;
  const actividades = await getActividadesStatsGrupo(grupoId, user.id);

  const totalIntento = actividades.reduce((s, a) => s + a.total_intentos, 0);
  const totalCompletadas = actividades.reduce((s, a) => s + a.completadas, 0);
  const actConScore = actividades.filter((a) => a.score_promedio !== null);
  const scoreGlobal = actConScore.length > 0
    ? Math.round(actConScore.reduce((s, a) => s + (a.score_promedio ?? 0), 0) / actConScore.length)
    : null;

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
            <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#10b981', marginRight: 6 }} />
            Docente · Actividades
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
            Seguimiento de actividades
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
            {grupo.nombre} · Semestre {grupo.semestre}°
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(11,37,69,0.55)' }}>Grupo:</span>
          <GrupoSelectorClient
            grupos={grupos}
            selectedId={grupoId}
            basePath="/dashboard/docente/actividades"
          />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Actividades', valor: actividades.length, icon: 'fa-solid fa-list-check', color: '#7DD3FC' },
          { label: 'Total intentos', valor: totalIntento, icon: 'fa-solid fa-rotate-right', color: '#7DD3FC' },
          { label: 'Completaciones', valor: totalCompletadas, icon: 'fa-solid fa-circle-check', color: '#10b981' },
          { label: 'Score promedio', valor: scoreGlobal !== null ? `${scoreGlobal}` : '—', icon: 'fa-solid fa-star', color: scoreGlobal !== null ? (scoreGlobal >= 80 ? '#10b981' : scoreGlobal >= 60 ? '#f59e0b' : '#ef4444') : '#7DD3FC' },
        ].map((m) => (
          <div key={m.label} style={{
            background: '#0B2545', borderRadius: 20, padding: '22px 24px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <i className={m.icon} style={{ fontSize: 20, color: m.color }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{m.valor}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginTop: 4 }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {actividades.length === 0 ? (
        <div style={{
          background: '#fff', border: '2px dashed rgba(11,37,69,0.14)',
          borderRadius: 24, padding: '80px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <i className="fa-solid fa-list-check" style={{ fontSize: 48, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>Sin actividades</h2>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.55)', maxWidth: 420, lineHeight: 1.65 }}>
            No hay actividades publicadas para el semestre {grupo.semestre} con alumnos en este grupo.
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Dificultades callout */}
          {actividades.some((a) => (a.score_promedio !== null && a.score_promedio < 50) || a.tasa_abandono > 30) && (
            <div style={{
              background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.15)',
              padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <i className="fa-solid fa-fire" style={{ color: '#ef4444', fontSize: 14 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>
                {actividades.filter((a) => (a.score_promedio !== null && a.score_promedio < 50) || a.tasa_abandono > 30).length} actividad(es) con dificultad elevada
              </span>
              <Link
                href={`/dashboard/docente/dificultades?grupo=${grupoId}`}
                style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#ef4444', textDecoration: 'none' }}
              >
                Ver análisis <i className="fa-solid fa-chevron-right" style={{ fontSize: 10 }} />
              </Link>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(11,37,69,0.02)' }}>
                  {['Actividad', 'UAC', 'Tipo', 'Intentos', 'Completadas', 'Score avg', 'Abandono', 'Tiempo avg'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: 'rgba(11,37,69,0.50)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      borderBottom: '2px solid rgba(11,37,69,0.08)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {actividades.map((act) => {
                  const esDificil = (act.score_promedio !== null && act.score_promedio < 50) || act.tasa_abandono > 30;
                  return (
                    <tr
                      key={act.id}
                      style={{
                        borderBottom: '1px solid rgba(11,37,69,0.05)',
                        background: esDificil ? 'rgba(239,68,68,0.025)' : undefined,
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#0B2545', fontSize: 13 }}>{act.titulo}</div>
                        <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.45)', fontFamily: 'monospace' }}>{act.codigo}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', fontFamily: 'monospace' }}>{act.uac_codigo}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'rgba(11,37,69,0.55)', fontSize: 12 }}>
                        {TIPO_LABEL[act.tipo] ?? act.tipo}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: act.total_intentos > 0 ? 700 : 400, color: act.total_intentos > 0 ? '#0B2545' : 'rgba(11,37,69,0.35)', fontSize: 13 }}>
                        {act.total_intentos}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'rgba(11,37,69,0.65)', fontSize: 13 }}>
                        {act.completadas > 0 ? act.completadas : <span style={{ color: 'rgba(11,37,69,0.30)' }}>0</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <ScoreBar score={act.score_promedio} total={act.total_intentos} />
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {act.total_intentos === 0 ? (
                          <span style={{ color: 'rgba(11,37,69,0.30)', fontSize: 12 }}>—</span>
                        ) : (
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: act.tasa_abandono > 30 ? '#ef4444' : act.tasa_abandono > 15 ? '#f59e0b' : 'rgba(11,37,69,0.55)',
                          }}>
                            {act.tasa_abandono}%
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'rgba(11,37,69,0.55)', fontSize: 12 }}>
                        {act.tiempo_promedio_min !== null ? `${act.tiempo_promedio_min}m` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
