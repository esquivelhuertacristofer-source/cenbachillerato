'use client';

import { useState } from 'react';
import type {
  UACCompletionData,
  ProgresionData,
  Recomendacion,
} from '@/lib/queries/docente';

// ── Helpers ────────────────────────────────────────────────────────────────

const ESTADO_CFG = {
  verde:      { color: '#10b981', bg: 'rgba(16,185,129,0.10)',  label: 'En buen camino' },
  amarillo:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  label: 'Atención' },
  rojo:       { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   label: 'Crítico' },
  'sin-datos':{ color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', label: 'Sin datos' },
};

const REC_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  UAC_BAJO:             { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  icon: 'fa-solid fa-triangle-exclamation' },
  ACTIVIDAD_DIFICIL:    { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   icon: 'fa-solid fa-fire' },
  ALUMNO_RIESGO:        { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  icon: 'fa-solid fa-person-circle-exclamation' },
  PROGRESION_PENDIENTE: { color: '#06b6d4', bg: 'rgba(6,182,212,0.10)',   icon: 'fa-solid fa-hourglass-half' },
};

const PRIORIDAD_ORDEN = { alta: 0, media: 1, baja: 2 };

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: 'rgba(11,37,69,0.08)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
      <div style={{
        background: color, height: '100%', borderRadius: 999,
        width: `${Math.min(pct, 100)}%`,
        transition: 'width 0.5s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  );
}

// ── Tab 1: Plan General ────────────────────────────────────────────────────

function TabPlanGeneral({
  uacs,
  totalActividades,
  pctGlobal,
  grupoNombre,
  semestre,
}: {
  uacs: UACCompletionData[];
  totalActividades: number;
  pctGlobal: number;
  grupoNombre: string;
  semestre: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const colorGlobal = pctGlobal >= 70 ? '#10b981' : pctGlobal >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      {/* Resumen global */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16, marginBottom: 32,
      }}>
        {[
          { label: 'Semestre', valor: `${semestre}°`, sub: 'MCCEMS', color: '#7DD3FC' },
          { label: 'UAC totales', valor: uacs.length, sub: 'del semestre', color: '#7DD3FC' },
          { label: 'Actividades', valor: totalActividades, sub: 'publicadas', color: '#7DD3FC' },
          { label: 'Avance global', valor: `${pctGlobal}%`, sub: 'cohorte', color: colorGlobal },
        ].map((m) => (
          <div key={m.label} style={{
            background: '#0B2545', borderRadius: 16, padding: '20px 22px',
          }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{m.valor}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Barra global */}
      <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0B2545' }}>Avance total de la cohorte — {grupoNombre}</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: colorGlobal }}>{pctGlobal}%</span>
        </div>
        <ProgressBar pct={pctGlobal} color={colorGlobal} />
      </div>

      {/* UAC por UAC */}
      {uacs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(11,37,69,0.45)' }}>
          <i className="fa-solid fa-book" style={{ fontSize: 36, marginBottom: 12, display: 'block' }} />
          <p>No hay UAC registradas para este semestre.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {uacs.map((uac) => {
            const cfg = ESTADO_CFG[uac.estado];
            const isOpen = expanded === uac.id;
            return (
              <div
                key={uac.id}
                style={{
                  background: '#fff', border: '1px solid rgba(11,37,69,0.10)',
                  borderRadius: 16, overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : uac.id)}
                  style={{
                    width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1E40AF', background: '#EFF6FF', padding: '2px 8px', borderRadius: 6 }}>
                          {uac.codigo}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0B2545' }}>{uac.nombre}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: cfg.color,
                          background: cfg.bg, padding: '2px 10px', borderRadius: 999,
                        }}>{cfg.label}</span>
                      </div>
                      <ProgressBar pct={uac.pct_completion} color={cfg.color} />
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: cfg.color }}>{uac.pct_completion}%</div>
                      <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.45)' }}>completado</div>
                    </div>
                    <i
                      className={isOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}
                      style={{ color: 'rgba(11,37,69,0.35)', fontSize: 13, flexShrink: 0 }}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 24px 20px', borderTop: '1px solid rgba(11,37,69,0.06)' }}>
                    <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13, color: 'rgba(11,37,69,0.65)' }}>
                        <i className="fa-solid fa-list" style={{ marginRight: 6, color: '#1E40AF' }} />
                        <strong>{uac.total_actividades}</strong> actividades publicadas
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(11,37,69,0.65)' }}>
                        <i className="fa-solid fa-sitemap" style={{ marginRight: 6, color: '#1E40AF' }} />
                        <strong>{uac.total_progresiones}</strong> progresiones MCCEMS
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(11,37,69,0.65)' }}>
                        <i className="fa-solid fa-circle-check" style={{ marginRight: 6, color: '#10b981' }} />
                        <strong>{uac.actividades_completadas_cohorte}</strong> completadas (cohorte)
                      </div>
                    </div>
                    {uac.estado === 'rojo' && (
                      <div style={{
                        marginTop: 12, padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(239,68,68,0.06)', fontSize: 13, color: '#ef4444', fontWeight: 600,
                      }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
                        Esta UAC necesita atención urgente — revisar en Recomendaciones
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Progresiones MCCEMS ─────────────────────────────────────────────

function TabProgresiones({ progresiones }: { progresiones: ProgresionData[] }) {
  const [filtro, setFiltro] = useState('');

  const uacsUnicas = [...new Set(progresiones.map((p) => p.uac_codigo))];
  const [uacFiltro, setUacFiltro] = useState('');

  const filtradas = progresiones.filter((p) => {
    const matchTexto = !filtro || p.titulo.toLowerCase().includes(filtro.toLowerCase()) || p.codigo.toLowerCase().includes(filtro.toLowerCase());
    const matchUac = !uacFiltro || p.uac_codigo === uacFiltro;
    return matchTexto && matchUac;
  });

  const grupos = filtradas.reduce((acc, p) => {
    const key = p.uac_codigo;
    if (!acc[key]) acc[key] = { uac_nombre: p.uac_nombre, progresiones: [] };
    acc[key]!.progresiones.push(p);
    return acc;
  }, {} as Record<string, { uac_nombre: string; progresiones: ProgresionData[] }>);

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <i className="fa-solid fa-magnifying-glass" style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(11,37,69,0.40)', fontSize: 13,
          }} />
          <input
            type="search"
            placeholder="Buscar progresión..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
              border: '1.5px solid rgba(11,37,69,0.12)', borderRadius: 12,
              fontSize: 14, color: '#0B2545', outline: 'none',
              background: '#fff', boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={uacFiltro}
          onChange={(e) => setUacFiltro(e.target.value)}
          style={{
            padding: '10px 14px', border: '1.5px solid rgba(11,37,69,0.12)', borderRadius: 12,
            fontSize: 14, color: '#0B2545', background: '#fff', outline: 'none',
          }}
        >
          <option value="">Todas las UAC</option>
          {uacsUnicas.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Resumen */}
      <div style={{ fontSize: 13, color: 'rgba(11,37,69,0.55)', marginBottom: 20 }}>
        {filtradas.length} de {progresiones.length} progresiones MCCEMS
      </div>

      {Object.entries(grupos).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(11,37,69,0.45)' }}>
          <p>No hay progresiones que coincidan con el filtro.</p>
        </div>
      ) : (
        Object.entries(grupos).map(([uacCodigo, grp]) => (
          <div key={uacCodigo} style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 13, fontWeight: 800, color: '#1E40AF',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontFamily: 'monospace', background: '#EFF6FF', padding: '2px 10px', borderRadius: 6 }}>{uacCodigo}</span>
              <span style={{ color: 'rgba(11,37,69,0.60)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>{grp.uac_nombre}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {grp.progresiones.map((prog) => {
                const pct = prog.pct_completion;
                const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
                const hasData = prog.total_alumnos > 0;

                return (
                  <div key={prog.id} style={{
                    background: '#fff', border: '1px solid rgba(11,37,69,0.08)',
                    borderRadius: 12, padding: '14px 18px',
                    display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6366f1', fontWeight: 700 }}>P{String(prog.numero).padStart(2, '0')}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0B2545' }}>{prog.titulo}</span>
                        {prog.total_actividades === 0 && (
                          <span style={{ fontSize: 10, color: '#94a3b8', background: 'rgba(148,163,184,0.12)', padding: '1px 8px', borderRadius: 999 }}>Sin actividades</span>
                        )}
                      </div>
                      {hasData && prog.total_actividades > 0 && (
                        <ProgressBar pct={pct} color={color} />
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {hasData ? (
                        <>
                          <div style={{ fontSize: 16, fontWeight: 900, color: prog.total_actividades > 0 ? color : '#94a3b8' }}>
                            {prog.total_actividades > 0 ? `${pct}%` : '—'}
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(11,37,69,0.45)' }}>
                            {prog.alumnos_completaron}/{prog.total_alumnos} alumnos
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: 'rgba(11,37,69,0.35)' }}>Sin datos</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Tab 3: Recomendaciones ─────────────────────────────────────────────────

function TabRecomendaciones({ recomendaciones }: { recomendaciones: Recomendacion[] }) {
  const sorted = [...recomendaciones].sort((a, b) => PRIORIDAD_ORDEN[a.prioridad] - PRIORIDAD_ORDEN[b.prioridad]);

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>¡Sin alertas!</h3>
        <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.55)', maxWidth: 380, margin: '0 auto', lineHeight: 1.65 }}>
          No hay recomendaciones automáticas en este momento. Puede ser que el grupo aún no haya registrado actividad suficiente, o que todo esté marchando bien.
        </p>
        <div style={{
          marginTop: 24, padding: '14px 20px', borderRadius: 14,
          background: 'rgba(16,185,129,0.08)', color: '#10b981',
          fontSize: 14, fontWeight: 600, display: 'inline-block',
        }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
          El sistema revisará automáticamente cuando haya más datos de intentos
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: 'rgba(11,37,69,0.55)', marginBottom: 24 }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
        {sorted.length} recomendación{sorted.length > 1 ? 'es' : ''} generada{sorted.length > 1 ? 's' : ''} a partir de datos reales de intentos
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sorted.map((rec, i) => {
          const cfg = REC_CFG[rec.tipo] ?? { color: '#6366f1', bg: 'rgba(99,102,241,0.10)', icon: 'fa-solid fa-bell' };
          const prioridadColor = rec.prioridad === 'alta' ? '#ef4444' : rec.prioridad === 'media' ? '#f59e0b' : '#94a3b8';

          return (
            <div
              key={i}
              style={{
                background: '#fff', border: `1.5px solid ${cfg.color}30`,
                borderRadius: 16, padding: '20px 24px',
                borderLeft: `4px solid ${cfg.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={cfg.icon} style={{ fontSize: 16, color: cfg.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B2545', margin: 0 }}>{rec.titulo}</h3>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: prioridadColor, background: `${prioridadColor}15`,
                      padding: '2px 8px', borderRadius: 999,
                    }}>{rec.prioridad}</span>
                  </div>

                  <p style={{ fontSize: 14, color: 'rgba(11,37,69,0.75)', margin: '0 0 10px', lineHeight: 1.6 }}>
                    {rec.descripcion}
                  </p>

                  <div style={{
                    fontSize: 12, color: 'rgba(11,37,69,0.55)',
                    background: 'rgba(11,37,69,0.04)', borderRadius: 8, padding: '6px 12px',
                    marginBottom: 10, display: 'inline-block',
                  }}>
                    <i className="fa-solid fa-database" style={{ marginRight: 6, fontSize: 10 }} />
                    {rec.dato_respaldo}
                  </div>

                  <div style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600 }}>
                    <i className="fa-solid fa-lightbulb" style={{ marginRight: 6, color: '#f59e0b' }} />
                    {rec.accion_sugerida}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

const TABS = [
  { id: 'plan', label: 'Plan General', icon: 'fa-solid fa-table-columns' },
  { id: 'progresiones', label: 'Progresiones MCCEMS', icon: 'fa-solid fa-sitemap' },
  { id: 'recomendaciones', label: 'Recomendaciones', icon: 'fa-solid fa-lightbulb' },
] as const;

type TabId = typeof TABS[number]['id'];

export function PlanteamientoTabs({
  uacs,
  progresiones,
  recomendaciones,
  totalActividades,
  pctGlobal,
  grupoNombre,
  semestre,
}: {
  uacs: UACCompletionData[];
  progresiones: ProgresionData[];
  recomendaciones: Recomendacion[];
  totalActividades: number;
  pctGlobal: number;
  grupoNombre: string;
  semestre: number;
}) {
  const [tab, setTab] = useState<TabId>('plan');

  const alertCount = recomendaciones.filter((r) => r.prioridad === 'alta').length;

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex', borderBottom: '2px solid rgba(11,37,69,0.08)',
        marginBottom: 32, gap: 4, overflowX: 'auto',
      }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          const badge = t.id === 'recomendaciones' && alertCount > 0 ? alertCount : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? '#1E40AF' : 'transparent'}`,
                marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap',
                color: active ? '#1E40AF' : 'rgba(11,37,69,0.55)',
                fontSize: 14, fontWeight: active ? 700 : 500,
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <i className={t.icon} style={{ fontSize: 13 }} />
              {t.label}
              {badge > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff',
                  borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 800,
                }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'plan' && (
        <TabPlanGeneral
          uacs={uacs}
          totalActividades={totalActividades}
          pctGlobal={pctGlobal}
          grupoNombre={grupoNombre}
          semestre={semestre}
        />
      )}
      {tab === 'progresiones' && <TabProgresiones progresiones={progresiones} />}
      {tab === 'recomendaciones' && <TabRecomendaciones recomendaciones={recomendaciones} />}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
