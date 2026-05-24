import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getGruposDocente, getActividadesDificiles } from "@/lib/queries/docente";
import { GrupoSelectorClient } from "@/components/dashboard/GrupoSelectorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actividades difíciles — Dashboard Docente | CEN Bachillerato",
};

const RAZON_CFG = {
  score_bajo: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', icon: 'fa-solid fa-arrow-trend-down', label: 'Score bajo' },
  abandono_alto: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: 'fa-solid fa-person-walking-arrow-right', label: 'Abandono alto' },
  fallo_alto: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', icon: 'fa-solid fa-circle-xmark', label: 'Fallo alto' },
};

export default async function DificultadesPage({
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
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', marginBottom: 8 }}>Actividades difíciles</h1>
        <p style={{ color: 'rgba(11,37,69,0.55)' }}>No tienes grupos asignados.</p>
      </main>
    );
  }

  const grupoId = grupoParam && grupos.some((g) => g.id === grupoParam)
    ? grupoParam
    : grupos[0]!.id;

  const grupo = grupos.find((g) => g.id === grupoId)!;
  const dificiles = await getActividadesDificiles(grupoId, user.id);

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Link href={`/dashboard/docente/actividades?grupo=${grupoId}`} style={{
              fontSize: 12, fontWeight: 700, color: 'rgba(11,37,69,0.55)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
              Actividades
            </Link>
            <span style={{ color: 'rgba(11,37,69,0.25)', fontSize: 12 }}>·</span>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#ef4444' }}>
              Análisis de dificultad
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
            Actividades difíciles
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
            {grupo.nombre} · {dificiles.length === 0 ? 'Sin alertas activas' : `${dificiles.length} actividad${dificiles.length > 1 ? 'es' : ''} requieren atención`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(11,37,69,0.55)' }}>Grupo:</span>
          <GrupoSelectorClient
            grupos={grupos}
            selectedId={grupoId}
            basePath="/dashboard/docente/dificultades"
          />
        </div>
      </div>

      {dificiles.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 24, padding: '80px 32px',
          border: '1px solid rgba(11,37,69,0.10)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>¡Sin alertas de dificultad!</h2>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.55)', maxWidth: 420, lineHeight: 1.65 }}>
            Todas las actividades con suficientes intentos tienen score promedio ≥ 50 y tasa de abandono ≤ 30%. Buen trabajo.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dificiles.map((act) => {
            const cfg = RAZON_CFG[act.razon] ?? RAZON_CFG.score_bajo;
            return (
              <div key={act.id} style={{
                background: '#fff', borderRadius: 20,
                border: '1px solid rgba(11,37,69,0.10)',
                borderLeft: `4px solid ${cfg.color}`,
                padding: '24px 28px',
                display: 'flex', gap: 20, flexWrap: 'wrap',
              }}>
                {/* Icono + razón */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: cfg.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={cfg.icon} style={{ fontSize: 20, color: cfg.color }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0B2545' }}>{act.titulo}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: cfg.color,
                      background: cfg.bg, padding: '2px 8px', borderRadius: 999,
                    }}>{cfg.label}</span>
                    <span style={{ fontSize: 12, color: 'rgba(11,37,69,0.45)', fontFamily: 'monospace' }}>{act.codigo}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#1E40AF', fontWeight: 600, marginBottom: 12 }}>
                    UAC: {act.uac_codigo} · Tipo: {act.tipo}
                  </div>

                  {/* Stats grid */}
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: act.score_promedio < 50 ? '#ef4444' : '#0B2545', lineHeight: 1 }}>
                        {act.score_promedio}/100
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.50)' }}>Score promedio</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: act.tasa_abandono > 30 ? '#f59e0b' : '#0B2545', lineHeight: 1 }}>
                        {act.tasa_abandono}%
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.50)' }}>Tasa de abandono</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#0B2545', lineHeight: 1 }}>
                        {act.total_intentos}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.50)' }}>Intentos registrados</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>
                        {act.tasa_error}%
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.50)' }}>Tasa de error</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>
    </main>
  );
}
