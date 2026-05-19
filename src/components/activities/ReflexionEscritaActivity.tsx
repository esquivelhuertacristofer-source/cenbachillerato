'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Clock, CheckCircle, Lightbulb, ClipboardList, Loader2, Send, RotateCcw } from 'lucide-react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import { celebrate } from '@/lib/motion/celebrate';
import type { ActividadReflexionEscrita, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = {
  hex: '#F87171', rgba: '248,113,113', faIcon: 'fa-feather-pointed', gradient: '',
};

interface Props {
  actividad: ActividadReflexionEscrita;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string>;
}

// ── TiempoDedicado ─────────────────────────────────────────────────────────────

function TiempoDedicado({ paused }: { paused: boolean }) {
  const [segundos, setSegundos] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setSegundos(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  const label = m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{label}</span>;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ReflexionEscritaActivity({
  actividad,
  onProgreso,
  color = FALLBACK_COLOR,
  estado,
  respuestasIntento,
}: Props) {
  const { contenido } = actividad;
  const minPalabras = contenido.longitud_minima_palabras ?? 80;
  const modoRevision = estado === 'completada';
  const reducedMotion = useReducedMotion();

  const textoInicial = modoRevision ? (respuestasIntento?.texto ?? '') : '';
  const [texto, setTexto] = useState(textoInicial);
  const [enviando, setEnviando] = useState(false);

  const palabras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;
  const pct = Math.min(100, minPalabras > 0 ? Math.round((palabras / minPalabras) * 100) : 100);
  const cumpleMinimo = palabras >= minPalabras;

  async function handleEnviar() {
    if (!cumpleMinimo || enviando || modoRevision) return;
    setEnviando(true);
    void celebrate('medium');
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: { texto },
    });
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <style>{`
        .reflexion-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .reflexion-grid {
            grid-template-columns: minmax(0, 1fr) 300px;
            align-items: start;
          }
        }
        .reflexion-textarea:focus {
          outline: none;
          border-color: rgba(${color.rgba}, 0.40) !important;
          box-shadow: 0 0 0 3px rgba(${color.rgba}, 0.10);
        }
        .reflexion-textarea:disabled, .reflexion-textarea[readonly] {
          opacity: 0.75;
          cursor: default;
        }
        .reflexion-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 16px 40px rgba(${color.rgba}, 0.36) !important;
        }
        .reflexion-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .reflexion-btn:focus-visible {
          outline: 2px solid rgba(${color.rgba}, 0.70);
          outline-offset: 3px;
        }
        .reflexion-btn:disabled {
          cursor: not-allowed;
        }
      `}</style>

      {/* Revision mode banner */}
      <AnimatePresence>
        {modoRevision && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.gentle}
            style={{
              padding: '14px 20px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)',
            }}
          >
            <RotateCcw size={18} style={{ color: '#818CF8', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#818CF8', margin: 0 }}>
                Revisando tu entrega anterior
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>
                Esta es la reflexión que enviaste. Puedes leerla pero no editarla.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero prompt card */}
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.05 }}
        style={{
          ...card,
          padding: '32px 36px',
          background: `rgba(${color.rgba}, 0.07)`,
          border: `1.5px solid rgba(${color.rgba}, 0.20)`,
          borderLeft: `4px solid ${color.hex}`,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `rgba(${color.rgba}, 0.15)`,
          }}>
            <PenLine size={18} style={{ color: color.hex }} />
          </div>
          <span style={{
            fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em',
            color: color.hex,
          }}>
            Tu tarea de reflexión
          </span>
        </div>
        <p style={{
          fontSize: 19, fontWeight: 700, color: 'rgba(255,255,255,0.93)',
          margin: 0, lineHeight: 1.65, letterSpacing: '-0.01em',
          fontFamily: 'var(--font-epilogue), sans-serif',
        }}>
          {contenido.prompt}
        </p>
        {contenido.formato_esperado && contenido.formato_esperado !== 'libre' && (
          <span style={{
            display: 'inline-block', marginTop: 14, fontSize: 11, fontWeight: 700,
            textTransform: 'capitalize', color: color.hex, padding: '4px 12px',
            background: `rgba(${color.rgba}, 0.12)`, borderRadius: 999,
            border: `1px solid rgba(${color.rgba}, 0.22)`,
          }}>
            {contenido.formato_esperado}
          </span>
        )}
      </motion.div>

      {/* 2-column layout */}
      <div className="reflexion-grid">

        {/* ── Editor column ── */}
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.smooth, delay: 0.12 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <textarea
            className="reflexion-textarea"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            readOnly={modoRevision || enviando}
            disabled={enviando}
            placeholder="Escribe tu reflexión aquí. Desarrolla tus ideas con profundidad, usando ejemplos y argumentos..."
            style={{
              width: '100%',
              minHeight: 480,
              background: 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${cumpleMinimo
                ? `rgba(${color.rgba}, 0.35)`
                : 'rgba(255,255,255,0.10)'}`,
              borderRadius: 18,
              padding: '24px 28px',
              fontSize: 18,
              color: 'rgba(255,255,255,0.90)',
              resize: 'vertical',
              fontFamily: 'var(--font-epilogue), sans-serif',
              lineHeight: 1.75,
              boxSizing: 'border-box',
              transition: 'border-color 0.25s ease',
            }}
          />

          {/* Word counter + progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                flex: 1, height: 5, borderRadius: 999,
                background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
              }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={reducedMotion ? { duration: 0 } : { ...springs.gentle }}
                  style={{
                    height: '100%', borderRadius: 999,
                    background: cumpleMinimo ? '#4ADE80' : color.hex,
                    transition: 'background 0.4s ease',
                  }}
                />
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                color: cumpleMinimo ? '#4ADE80' : 'rgba(255,255,255,0.40)',
                transition: 'color 0.3s ease',
              }}>
                {palabras} / {minPalabras} palabras
              </span>
            </div>

            {/* "Mínimo alcanzado" badge */}
            <AnimatePresence>
              {cumpleMinimo && (
                <motion.div
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={reducedMotion ? { duration: 0 } : { ...springs.bouncy }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px', borderRadius: 999, alignSelf: 'flex-start',
                    background: 'rgba(74,222,128,0.14)',
                    border: '1px solid rgba(74,222,128,0.30)',
                  }}
                >
                  <CheckCircle size={14} style={{ color: '#4ADE80' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80' }}>
                    Mínimo alcanzado
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit button */}
          {!modoRevision && (
            <motion.button
              className="reflexion-btn"
              onClick={handleEnviar}
              disabled={!cumpleMinimo || enviando}
              animate={cumpleMinimo && !enviando && !reducedMotion
                ? { scale: [1, 1.01, 1] }
                : { scale: 1 }}
              transition={springs.gentle}
              style={{
                width: '100%', padding: '18px 32px', borderRadius: 16, border: 'none',
                fontSize: 14, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.12em',
                background: cumpleMinimo ? color.hex : 'rgba(255,255,255,0.08)',
                color: cumpleMinimo ? '#011126' : 'rgba(255,255,255,0.25)',
                boxShadow: cumpleMinimo
                  ? `0 12px 32px rgba(${color.rgba}, 0.28)`
                  : 'none',
                fontFamily: 'var(--font-epilogue), sans-serif',
                transition: 'background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {enviando ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Entregando...
                </>
              ) : cumpleMinimo ? (
                <>
                  <Send size={16} />
                  Entregar reflexión
                </>
              ) : (
                `Faltan ${minPalabras - palabras} palabras`
              )}
            </motion.button>
          )}
        </motion.div>

        {/* ── Sidebar column ── */}
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springs.smooth, delay: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* Tiempo dedicado */}
          <div style={{
            ...card, padding: '20px 22px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)',
            }}>
              <Clock size={12} />
              Tiempo dedicado
            </div>
            <div style={{
              fontSize: 32, fontWeight: 900, color: 'rgba(255,255,255,0.88)',
              fontFamily: 'var(--font-epilogue), sans-serif',
              letterSpacing: '-0.02em',
            }}>
              <TiempoDedicado paused={enviando || modoRevision} />
            </div>
          </div>

          {/* Criterios de evaluación */}
          {contenido.criterios_evaluacion && contenido.criterios_evaluacion.length > 0 && (
            <div style={{ ...card, padding: '20px 22px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)',
              }}>
                <ClipboardList size={12} />
                Criterios de evaluación
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contenido.criterios_evaluacion.map((criterio, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                      background: color.hex,
                    }} />
                    <p style={{
                      fontSize: 13, color: 'rgba(255,255,255,0.62)',
                      margin: 0, lineHeight: 1.55,
                    }}>
                      {criterio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pistas */}
          {contenido.pistas && contenido.pistas.length > 0 && (
            <div style={{ ...card, padding: '20px 22px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)',
              }}>
                <Lightbulb size={12} style={{ color: '#FBBF24' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Pistas</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contenido.pistas.map((pista, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      background: 'rgba(251,191,36,0.15)', color: '#FBBF24',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 900,
                    }}>
                      {i + 1}
                    </div>
                    <p style={{
                      fontSize: 13, color: 'rgba(255,255,255,0.60)',
                      margin: 0, lineHeight: 1.55,
                    }}>
                      {pista}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
