import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getAlumnosConProgreso, getUACsConCompletionGrupo, getGruposDocente } from "@/lib/queries/docente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalle de grupo — Dashboard Docente | CEN Bachillerato",
};

const ESTADO_CONFIG = {
  verde: { color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'En buen camino' },
  amarillo: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', label: 'Atención' },
  rojo: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', label: 'Crítico' },
  'sin-datos': { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', label: 'Sin datos' },
};

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: 'rgba(11,37,69,0.08)', borderRadius: 999, height: 8, overflow: 'hidden', width: '100%' }}>
      <div style={{
        background: color, height: '100%', borderRadius: 999,
        width: `${Math.min(pct, 100)}%`,
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

export default async function GrupoDetallePage({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;

  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile || profile.role === "student") redirect("/hub");

  // Verificar que el grupo pertenece al docente
  const grupos = await getGruposDocente(user.id);
  const grupo = grupos.find((g) => g.id === grupoId);
  if (!grupo) notFound();

  const [alumnos, uacs] = await Promise.all([
    getAlumnosConProgreso(grupoId, user.id),
    getUACsConCompletionGrupo(grupoId),
  ]);

  const pctGlobal = uacs.length > 0
    ? Math.round(uacs.reduce((s, u) => s + u.pct_completion, 0) / uacs.length)
    : 0;

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Back link */}
      <Link href="/dashboard/docente/grupos" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'rgba(11,37,69,0.55)', fontSize: 13, fontWeight: 600,
        textDecoration: 'none', marginBottom: 24,
      }}>
        <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }} />
        Volver a mis grupos
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
            Semestre {grupo.semestre}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
            {grupo.nombre}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
            {grupo.total_alumnos} alumno{grupo.total_alumnos !== 1 ? 's' : ''} · Semestre {grupo.semestre} MCCEMS
          </p>
        </div>
        <Link href={`/dashboard/docente/planteamiento?grupo=${grupoId}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#0B2545', color: '#7DD3FC',
          padding: '10px 20px', borderRadius: 999, textDecoration: 'none',
          fontSize: 13, fontWeight: 700,
        }}>
          <i className="fa-solid fa-map" />
          Planteamiento
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Alumnos', valor: grupo.total_alumnos, icon: 'fa-solid fa-user-graduate', color: '#7DD3FC' },
          { label: 'UAC del semestre', valor: uacs.length, icon: 'fa-solid fa-book', color: '#7DD3FC' },
          { label: 'Avance global', valor: `${pctGlobal}%`, icon: 'fa-solid fa-chart-bar', color: pctGlobal >= 70 ? '#10b981' : pctGlobal >= 40 ? '#f59e0b' : '#ef4444' },
          { label: 'Alumnos activos', valor: alumnos.filter((a) => a.actividades_completadas > 0).length, icon: 'fa-solid fa-bolt', color: '#7DD3FC' },
        ].map((m) => (
          <div key={m.label} style={{
            background: '#0B2545', borderRadius: 20, padding: '22px 26px',
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* UAC tabla */}
        <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 20, padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0B2545', marginBottom: 20, letterSpacing: '-0.02em' }}>
            <i className="fa-solid fa-book" style={{ color: '#1E40AF', marginRight: 8 }} />
            UAC del Semestre {grupo.semestre}
          </h2>
          {uacs.length === 0 ? (
            <p style={{ color: 'rgba(11,37,69,0.50)', fontSize: 14 }}>No hay UAC registradas para este semestre.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {uacs.map((uac) => {
                const cfg = ESTADO_CONFIG[uac.estado];
                return (
                  <div key={uac.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', marginRight: 8, fontFamily: 'monospace' }}>
                          {uac.codigo}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0B2545' }}>{uac.nombre}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{uac.pct_completion}%</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: cfg.color,
                          background: cfg.bg, borderRadius: 999, padding: '2px 8px',
                        }}>{cfg.label}</span>
                      </div>
                    </div>
                    <ProgressBar pct={uac.pct_completion} color={cfg.color} />
                    <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.45)', marginTop: 4 }}>
                      {uac.total_actividades} actividades · {uac.total_progresiones} progresiones
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alumnos tabla */}
        <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 20, padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0B2545', marginBottom: 20, letterSpacing: '-0.02em' }}>
            <i className="fa-solid fa-user-graduate" style={{ color: '#1E40AF', marginRight: 8 }} />
            Alumnos ({alumnos.length})
          </h2>
          {alumnos.length === 0 ? (
            <p style={{ color: 'rgba(11,37,69,0.50)', fontSize: 14 }}>No hay alumnos en este grupo.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {alumnos.map((alumno) => (
                <Link
                  key={alumno.id}
                  href={`/dashboard/docente/alumnos/${alumno.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 12, textDecoration: 'none',
                    color: 'inherit', transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(11,37,69,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 999,
                      background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#1E40AF', flexShrink: 0,
                    }}>
                      {(alumno.full_name ?? alumno.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0B2545' }}>
                        {alumno.full_name ?? alumno.email}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.50)' }}>
                        {alumno.actividades_completadas} completadas
                        {alumno.score_promedio !== null ? ` · ${alumno.score_promedio} pts` : ''}
                      </div>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: 'rgba(11,37,69,0.25)' }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
