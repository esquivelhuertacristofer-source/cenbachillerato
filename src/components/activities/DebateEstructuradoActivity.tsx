'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessagesSquare, CheckCircle2, ArrowRight, ArrowLeftRight, Loader2, Lightbulb, RotateCcw } from 'lucide-react';
import { springs, stagger } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import { celebrate } from '@/lib/motion/celebrate';
import type { ActividadDebateEstructurado, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#D97706', rgba: '217,119,6', faIcon: 'fa-comments', gradient: '' };

// Complementary color for posture B
const POSTURA_B = { hex: '#F59E0B', rgba: '245,158,11' };

interface Props {
  actividad: ActividadDebateEstructurado;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string>;
}

function getPosturaColor(i: number, areaHex: string, areaRgba: string) {
  if (i === 0) return { hex: areaHex, rgba: areaRgba };
  return POSTURA_B;
}

export function DebateEstructuradoActivity({
  actividad, onProgreso, color = FALLBACK_COLOR, estado, respuestasIntento,
}: Props) {
  const { contenido } = actividad;
  const reducedMotion = useReducedMotion();
  const modoRevision = estado === 'completada';
  const minPalabras = 80;
  const editorRef = useRef<HTMLDivElement>(null);

  const posturaInicial = modoRevision && respuestasIntento?.postura !== undefined
    ? Number(respuestasIntento.postura)
    : null;
  const argumentacionInicial = modoRevision ? (respuestasIntento?.argumentacion ?? '') : '';

  const [posturaSeleccionada, setPosturaSeleccionada] = useState<number | null>(posturaInicial);
  const [argumentacion, setArgumentacion] = useState(argumentacionInicial);
  const [enviando, setEnviando] = useState(false);

  const palabras = argumentacion.trim() === '' ? 0 : argumentacion.trim().split(/\s+/).length;
  const cumpleMinimo = palabras >= minPalabras;

  function handleSeleccionarPostura(i: number) {
    setPosturaSeleccionada(i);
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }

  function handleEntregar() {
    if (!cumpleMinimo || enviando || modoRevision) return;
    setEnviando(true);
    void celebrate('medium');
    const posturaNombre = posturaSeleccionada !== null ? contenido.posturas[posturaSeleccionada] : '';
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: {
        postura: String(posturaSeleccionada),
        posturaNombre: posturaNombre ?? '',
        argumentacion,
      },
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
        .deb-textarea:focus { outline: none; }
        .deb-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .deb-btn-pri:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .deb-btn-pri:active:not(:disabled) { transform: translateY(0); }
        .deb-btn-pri:focus-visible { outline: 2px solid rgba(255,255,255,0.50); outline-offset: 3px; }
        .deb-btn-sec:hover { background: rgba(255,255,255,0.10) !important; }
        .deb-btn-sec:focus-visible { outline: 2px solid rgba(255,255,255,0.40); outline-offset: 3px; }
        .deb-postura-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.40); outline-offset: 3px; }
        .deb-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) { .deb-grid { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; } }
        .deb-sidebar { display: none; }
        @media (min-width: 1024px) { .deb-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 32px; } }
        .deb-posturas-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px) { .deb-posturas-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* Revision banner */}
      {modoRevision && (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.gentle}
          style={{
            padding: '14px 20px', borderRadius: 14,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <RotateCcw size={16} style={{ color: '#818CF8', flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#818CF8', margin: 0 }}>
            Revisando tu entrega · Postura: {posturaSeleccionada !== null ? contenido.posturas[posturaSeleccionada] : '—'}
          </p>
        </motion.div>
      )}

      {/* Hero tema */}
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.05 }}
        style={{
          ...card,
          padding: '32px 36px',
          background: `rgba(${color.rgba}, 0.07)`,
          border: `1.5px solid rgba(${color.rgba}, 0.20)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: `rgba(${color.rgba}, 0.15)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessagesSquare size={26} style={{ color: color.hex }} />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: color.hex, margin: '0 0 4px' }}>
              Debate estructurado
            </p>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
              Tema
            </p>
            <p style={{
              fontSize: 'clamp(17px, 2.4vw, 22px)', fontWeight: 800,
              color: 'rgba(255,255,255,0.95)', margin: 0, lineHeight: 1.45,
              letterSpacing: '-0.02em', fontFamily: 'var(--font-epilogue), sans-serif',
            }}>
              {contenido.tema}
            </p>
            {contenido.modalidad && (
              <span style={{
                display: 'inline-block', marginTop: 12, fontSize: 11, fontWeight: 700,
                textTransform: 'capitalize', color: 'rgba(255,255,255,0.45)',
                padding: '4px 12px', background: 'rgba(255,255,255,0.07)',
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.10)',
              }}>
                {contenido.modalidad}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Posturas (when none selected and not revision mode) */}
      {posturaSeleccionada === null && !modoRevision && (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={springs.smooth}
        >
          {/* Posturas grid */}
          <div style={{ marginBottom: 28 }}>
            <p style={{
              fontSize: 18, fontWeight: 800, color: '#fff', textAlign: 'center',
              margin: '0 0 6px', fontFamily: 'var(--font-epilogue), sans-serif',
            }}>
              Conocé las dos posturas
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: '0 0 24px' }}>
              Explorá ambas perspectivas antes de elegir la que vas a defender.
            </p>
            <div className="deb-posturas-grid">
              {contenido.posturas.map((postura, i) => {
                const pc = getPosturaColor(i, color.hex, color.rgba);
                const fromX = i === 0 ? -24 : 24;
                const letra = String.fromCharCode(65 + i);
                const argumentosGuia = contenido.argumentos_guia?.[postura] ?? [];
                return (
                  <motion.div
                    key={i}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: fromX }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...springs.gentle, delay: i * stagger.normal }}
                    style={{
                      borderRadius: 20,
                      border: `2px solid rgba(${pc.rgba}, 0.38)`,
                      background: `rgba(${pc.rgba}, 0.06)`,
                      padding: '24px',
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: pc.hex, marginBottom: 6 }}>
                      Postura {letra}
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.45, fontFamily: 'var(--font-epilogue), sans-serif' }}>
                      {postura}
                    </p>
                    {argumentosGuia.length > 0 && (
                      <>
                        <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
                          Argumentos clave
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {argumentosGuia.map((arg, j) => (
                            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6, background: pc.hex }} />
                              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>{arg}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selector */}
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.gentle, delay: 0.25 }}
            style={{ textAlign: 'center' }}
          >
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px', fontFamily: 'var(--font-epilogue), sans-serif' }}>
              ¿Cuál es tu posición?
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', margin: '0 0 20px' }}>
              Elegí la postura que vas a defender con argumentos propios.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contenido.posturas.map((postura, i) => {
                const pc = getPosturaColor(i, color.hex, color.rgba);
                return (
                  <motion.button
                    key={i}
                    className="deb-postura-btn"
                    onClick={() => handleSeleccionarPostura(i)}
                    whileHover={!reducedMotion ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!reducedMotion ? { scale: 0.97 } : {}}
                    transition={springs.snappy}
                    style={{
                      padding: '18px 28px', borderRadius: 16,
                      border: `2px solid rgba(${pc.rgba}, 0.40)`,
                      background: `rgba(${pc.rgba}, 0.10)`,
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--font-epilogue), sans-serif',
                      transition: 'background 0.2s, transform 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: pc.hex, display: 'block', marginBottom: 4 }}>
                      Defender postura {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
                      {postura}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Editor (postura selected) */}
      {posturaSeleccionada !== null && (
        <motion.div
          ref={editorRef}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.smooth}
          className="deb-grid"
        >
          {/* Main editor column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Selected postura banner */}
            {(() => {
              const pc = getPosturaColor(posturaSeleccionada, color.hex, color.rgba);
              return (
                <div style={{
                  padding: '18px 22px', borderRadius: 14,
                  background: `rgba(${pc.rgba}, 0.10)`,
                  borderLeft: `4px solid ${pc.hex}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.45)', margin: '0 0 4px' }}>
                      Tu postura
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-epilogue), sans-serif' }}>
                      {contenido.posturas[posturaSeleccionada]}
                    </p>
                  </div>
                  {!modoRevision && (
                    <button
                      className="deb-btn-sec"
                      onClick={() => setPosturaSeleccionada(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.50)',
                        padding: '8px 12px', borderRadius: 8,
                        transition: 'background 0.2s, color 0.2s',
                        fontFamily: 'var(--font-epilogue), sans-serif',
                      }}
                    >
                      <ArrowLeftRight size={13} />
                      Cambiar
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Textarea */}
            <div style={{
              ...card,
              overflow: 'hidden',
              borderColor: argumentacion.length > 0 ? `rgba(${color.rgba}, 0.28)` : 'rgba(255,255,255,0.08)',
              transition: 'border-color 0.25s ease',
            }}>
              <textarea
                className="deb-textarea"
                value={argumentacion}
                onChange={e => !modoRevision && !enviando ? setArgumentacion(e.target.value) : undefined}
                readOnly={modoRevision || enviando}
                placeholder="Escribí tu argumentación defendiendo tu postura con evidencias, ejemplos y razonamiento lógico..."
                style={{
                  width: '100%', minHeight: 360,
                  background: 'transparent',
                  border: 'none',
                  padding: '28px 32px',
                  fontSize: 18, color: 'rgba(255,255,255,0.90)',
                  resize: 'vertical',
                  fontFamily: 'var(--font-epilogue), sans-serif',
                  lineHeight: 1.72,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{
                padding: '14px 32px 16px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                  {palabras} / {minPalabras} palabras
                </span>
                <div style={{ flex: 1, maxWidth: 180, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${Math.min((palabras / minPalabras) * 100, 100)}%` }}
                    transition={reducedMotion ? { duration: 0 } : { ...springs.gentle }}
                    style={{ height: '100%', borderRadius: 999, background: cumpleMinimo ? '#4ADE80' : color.hex, transition: 'background 0.3s ease' }}
                  />
                </div>
                <AnimatePresence>
                  {cumpleMinimo && (
                    <motion.div
                      initial={reducedMotion ? { opacity: 1 } : { scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={springs.bouncy}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
                    >
                      <CheckCircle2 size={14} style={{ color: '#4ADE80' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80' }}>Listo</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit button */}
            {!modoRevision && (
              <motion.button
                className="deb-btn-pri"
                onClick={handleEntregar}
                disabled={!cumpleMinimo || enviando}
                whileHover={cumpleMinimo && !enviando && !reducedMotion ? { y: -2, scale: 1.01 } : {}}
                whileTap={cumpleMinimo && !enviando && !reducedMotion ? { scale: 0.98 } : {}}
                transition={springs.snappy}
                style={{
                  padding: '18px 32px', borderRadius: 16, border: 'none', alignSelf: 'flex-start',
                  cursor: !cumpleMinimo || enviando ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                  background: cumpleMinimo ? color.hex : 'rgba(255,255,255,0.08)',
                  color: cumpleMinimo ? '#011126' : 'rgba(255,255,255,0.25)',
                  boxShadow: cumpleMinimo && !enviando ? `0 12px 32px rgba(${color.rgba}, 0.28)` : 'none',
                  fontFamily: 'var(--font-epilogue), sans-serif',
                  transition: 'background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.15s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                {enviando
                  ? <><Loader2 size={16} style={{ animation: 'deb-spin 1s linear infinite' }} /> Enviando...</>
                  : <><ArrowRight size={16} /> Entregar argumentación</>}
              </motion.button>
            )}
          </div>

          {/* Sidebar */}
          <aside className="deb-sidebar">
            {/* Argumentos guía */}
            {(() => {
              const posturaNombre = contenido.posturas[posturaSeleccionada];
              const argumentosGuia = contenido.argumentos_guia?.[posturaNombre ?? ''] ?? [];
              if (argumentosGuia.length === 0) return null;
              return (
                <div style={{ ...card, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Lightbulb size={13} style={{ color: color.hex, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.35)' }}>
                      Argumentos guía
                    </span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {argumentosGuia.map((arg, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6, background: color.hex }} />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.55 }}>{arg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* Criterios evaluación */}
            {contenido.criterios_evaluacion && contenido.criterios_evaluacion.length > 0 && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <CheckCircle2 size={13} style={{ color: color.hex, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.35)' }}>
                    Criterios
                  </span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {contenido.criterios_evaluacion.map((criterio, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6, background: color.hex }} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.55 }}>{criterio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reglas */}
            {contenido.reglas && contenido.reglas.length > 0 && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.35)', margin: '0 0 12px' }}>
                  Reglas del debate
                </p>
                <ol style={{ padding: '0 0 0 18px', margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {contenido.reglas.map((r, i) => (
                    <li key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>{r}</li>
                  ))}
                </ol>
              </div>
            )}
          </aside>
        </motion.div>
      )}

      <style>{`
        @keyframes deb-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
