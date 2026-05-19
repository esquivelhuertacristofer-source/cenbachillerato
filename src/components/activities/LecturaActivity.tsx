'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Info, Lightbulb, AlertCircle, Quote, Check, Loader2 } from 'lucide-react';
import { springs, stagger as staggerTokens } from '@/lib/motion/tokens';
import { useReducedMotion, useInView } from '@/lib/motion/hooks';
import { celebrate } from '@/lib/motion/celebrate';
import type { ActividadLectura, CallbackProgreso, CalloutLectura } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = {
  hex: '#38BDF8', rgba: '56,189,248', faIcon: 'fa-book-open', gradient: '',
};

interface Props {
  actividad: ActividadLectura;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string>;
}

// ── Callout ────────────────────────────────────────────────────────────────────

const CALLOUT_CONFIG = {
  info:        { Icon: Info,        color: '#38BDF8', label: 'Información' },
  importante:  { Icon: AlertCircle, color: '#FB923C', label: 'Importante' },
  sabias:      { Icon: Lightbulb,   color: '#FBBF24', label: '¿Sabías que...?' },
  advertencia: { Icon: AlertCircle, color: '#F87171', label: 'Advertencia' },
};

function Callout({ tipo, contenido }: CalloutLectura) {
  const reducedMotion = useReducedMotion();
  const cfg = CALLOUT_CONFIG[tipo] ?? CALLOUT_CONFIG.info;
  const Icon = cfg.Icon;
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={reducedMotion ? {} : springs.gentle}
      style={{
        margin: '32px 0',
        padding: '20px 24px',
        borderRadius: 16,
        borderLeft: `4px solid ${cfg.color}`,
        background: `${cfg.color}14`,
        backdropFilter: 'blur(8px)',
        display: 'flex', gap: 16, alignItems: 'flex-start',
      }}
    >
      <Icon size={20} color={cfg.color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.18em', color: cfg.color, marginBottom: 6,
        }}>
          {cfg.label}
        </div>
        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.7, margin: 0,
          fontFamily: "var(--font-epilogue), sans-serif",
        }}>
          {contenido}
        </p>
      </div>
    </motion.div>
  );
}

// ── Pregunta card ──────────────────────────────────────────────────────────────

interface PreguntaCardProps {
  numero: number;
  pregunta: string;
  valor: string;
  onChange: (v: string) => void;
  disabled: boolean;
  areaColor: AreaColor;
  mostrarGuia: boolean;
  respuestaGuia?: string;
}

function PreguntaCard({
  numero, pregunta, valor, onChange, disabled, areaColor, mostrarGuia, respuestaGuia,
}: PreguntaCardProps) {
  const reducedMotion = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>();
  const [focused, setFocused] = useState(false);
  const completada = valor.trim().length > 0;

  return (
    <motion.div
      ref={ref}
      initial={reducedMotion ? {} : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={reducedMotion ? {} : { ...springs.gentle }}
      style={{
        borderRadius: 24,
        border: `1.5px solid ${
          focused
            ? areaColor.hex
            : completada
              ? `rgba(${areaColor.rgba}, 0.30)`
              : 'rgba(255,255,255,0.09)'
        }`,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        padding: 'clamp(24px, 4vw, 36px)',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Number + check row */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 14,
      }}>
        <div style={{
          fontSize: 'clamp(2.2rem, 5vw, 3rem)',
          fontWeight: 900, lineHeight: 1,
          color: areaColor.hex, opacity: 0.25,
          fontFamily: "var(--font-epilogue), sans-serif",
          letterSpacing: '-0.04em',
        }}>
          {String(numero).padStart(2, '0')}
        </div>
        {completada && (
          <motion.div
            initial={reducedMotion ? {} : { scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={reducedMotion ? {} : springs.bouncy}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `rgba(${areaColor.rgba}, 0.14)`,
              border: `1.5px solid rgba(${areaColor.rgba}, 0.32)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={15} color={areaColor.hex} />
          </motion.div>
        )}
      </div>

      {/* Question text */}
      <h3 style={{
        fontSize: '1.15rem', fontWeight: 700,
        color: 'rgba(255,255,255,0.95)',
        margin: '0 0 18px', lineHeight: 1.45,
        fontFamily: "var(--font-epilogue), sans-serif",
        letterSpacing: '-0.01em',
      }}>
        {pregunta}
      </h3>

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={valor}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="Escribe tu respuesta aquí..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', minHeight: 120,
            background: 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${
              focused ? areaColor.hex : completada
                ? `rgba(${areaColor.rgba}, 0.25)` : 'rgba(255,255,255,0.09)'
            }`,
            borderRadius: 16,
            padding: '16px 20px',
            fontSize: 15,
            color: disabled ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.90)',
            outline: 'none', resize: 'vertical',
            fontFamily: "var(--font-epilogue), sans-serif",
            lineHeight: 1.7, boxSizing: 'border-box',
            transition: 'border-color 0.2s ease',
            cursor: disabled ? 'default' : 'text',
          }}
        />
      </div>

      {/* Char counter */}
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: valor.length > 20
            ? `rgba(${areaColor.rgba}, 0.65)` : 'rgba(255,255,255,0.28)',
          transition: 'color 0.2s ease',
        }}>
          {valor.length} caracteres
        </span>
      </div>

      {/* Guide answer (after submit) */}
      {mostrarGuia && respuestaGuia && (
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? {} : springs.gentle}
          style={{
            marginTop: 16, padding: '16px 20px',
            borderRadius: 14,
            background: `rgba(${areaColor.rgba}, 0.07)`,
            border: `1px solid rgba(${areaColor.rgba}, 0.18)`,
          }}
        >
          <div style={{
            fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.18em', color: areaColor.hex, marginBottom: 8,
          }}>
            Respuesta guía
          </div>
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.68)',
            margin: 0, lineHeight: 1.6,
            fontFamily: "var(--font-epilogue), sans-serif",
          }}>
            {respuestaGuia}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function LecturaActivity({
  actividad,
  onProgreso,
  color = FALLBACK_COLOR,
  estado,
  respuestasIntento,
}: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas_comprension ?? [];
  const callouts = contenido.callouts ?? [];
  const reducedMotion = useReducedMotion();
  const [bodyRef, bodyInView] = useInView<HTMLDivElement>();

  const initialRespuestas = respuestasIntento
    ? Object.fromEntries(
        Object.entries(respuestasIntento).map(([k, v]) => [parseInt(k, 10), v])
      )
    : {};

  const [respuestas, setRespuestas] = useState<Record<number, string>>(initialRespuestas);
  const [entregado, setEntregado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modoRevision = estado === 'completada';
  const todasRespondidas = preguntas.length === 0 ||
    preguntas.every((_, i) => (respuestas[i] ?? '').trim().length > 0);

  function handleEntregar() {
    if (isSubmitting || entregado) return;
    setIsSubmitting(true);
    void celebrate('medium');
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: preguntas.length > 0 ? respuestas : undefined,
    });
    setEntregado(true);
  }

  // ── Markdown components ──────────────────────────────────────────────────────

  const mdComponents = {
    p({ children }: { children?: React.ReactNode }) {
      return (
        <motion.p
          variants={reducedMotion
            ? {}
            : { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { ...springs.gentle } } }
          }
          style={{
            fontSize: 'clamp(17px, 2vw, 19px)',
            lineHeight: 1.85,
            color: 'rgba(255,255,255,0.90)',
            margin: '0 0 1.8em',
            fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.01em',
          }}
        >
          {children}
        </motion.p>
      );
    },
    h2({ children }: { children?: React.ReactNode }) {
      return (
        <h2 style={{
          fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
          fontWeight: 800, color: '#fff',
          margin: '2.5em 0 0.75em',
          letterSpacing: '-0.03em', lineHeight: 1.2,
          fontFamily: "var(--font-epilogue), sans-serif",
        }}>
          {children}
        </h2>
      );
    },
    h3({ children }: { children?: React.ReactNode }) {
      return (
        <h3 style={{
          fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
          fontWeight: 700, color: 'rgba(255,255,255,0.95)',
          margin: '2em 0 0.6em',
          letterSpacing: '-0.02em', lineHeight: 1.3,
          fontFamily: "var(--font-epilogue), sans-serif",
        }}>
          {children}
        </h3>
      );
    },
    blockquote({ children }: { children?: React.ReactNode }) {
      return (
        <blockquote style={{
          margin: '2em 0',
          paddingLeft: '1.5em',
          borderLeft: `4px solid ${color.hex}`,
          position: 'relative',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.70)',
        }}>
          <Quote
            size={20}
            color={color.hex}
            style={{
              position: 'absolute', top: -4, left: -10,
              opacity: 0.45,
            }}
          />
          {children}
        </blockquote>
      );
    },
    ul({ children }: { children?: React.ReactNode }) {
      return (
        <ul style={{
          margin: '1.2em 0', padding: 0, listStyle: 'none',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {children}
        </ul>
      );
    },
    li({ children }: { children?: React.ReactNode }) {
      return (
        <li style={{
          fontSize: 'clamp(16px, 1.8vw, 18px)',
          lineHeight: 1.75,
          color: 'rgba(255,255,255,0.85)',
          paddingLeft: '1.4em',
          position: 'relative',
          fontFamily: "var(--font-epilogue), sans-serif",
        }}>
          <span style={{
            position: 'absolute', left: 0, top: '0.65em',
            width: 7, height: 7, borderRadius: '50%',
            background: color.hex,
          }} />
          {children}
        </li>
      );
    },
    strong({ children }: { children?: React.ReactNode }) {
      return (
        <strong style={{ fontWeight: 800, color: '#fff' }}>
          {children}
        </strong>
      );
    },
    em({ children }: { children?: React.ReactNode }) {
      return (
        <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.75)' }}>
          {children}
        </em>
      );
    },
    code({ children }: { children?: React.ReactNode }) {
      return (
        <code style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.875em',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 6, padding: '2px 7px',
          color: color.hex,
        }}>
          {children}
        </code>
      );
    },
  };

  const bodyVariants = {
    hidden: { opacity: reducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: reducedMotion
        ? {}
        : { staggerChildren: staggerTokens.fast * 1.5, delayChildren: 0.1 },
    },
  };

  return (
    <>
      <style>{`
        .lec-ta::placeholder { color: rgba(255,255,255,0.28); }
        .lec-ta:focus { outline: none; }
        .lec-btn:focus-visible {
          outline: 2px solid var(--lec-color, #38BDF8);
          outline-offset: 4px;
        }
        @media (max-width: 640px) {
          .lec-body-inner { padding: 28px 20px !important; }
          .lec-questions { padding: 0 !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Modo revisión banner ── */}
        {modoRevision && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? {} : springs.gentle}
            style={{
              padding: '16px 22px',
              borderRadius: 16,
              background: `rgba(${color.rgba}, 0.08)`,
              border: `1px solid rgba(${color.rgba}, 0.22)`,
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}
          >
            <Check size={18} color={color.hex} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                Ya completaste esta lectura
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>
                Esta es una revisión. Puedes re-entregar para actualizar tus respuestas.
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Metadata strip ── */}
        {(contenido.fuente || contenido.nivel_lectura || contenido.tiempo_estimado_minutos) && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? {} : { ...springs.gentle, delay: 0.05 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
          >
            {contenido.fuente && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)',
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <i className="fa-solid fa-quote-left" style={{ marginRight: 6, fontSize: 9 }} />
                {contenido.fuente}
              </span>
            )}
            {contenido.nivel_lectura && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: color.hex, textTransform: 'capitalize',
                padding: '4px 12px', borderRadius: 999,
                background: `rgba(${color.rgba}, 0.10)`, border: `1px solid rgba(${color.rgba}, 0.20)`,
              }}>
                {contenido.nivel_lectura}
              </span>
            )}
            {contenido.tiempo_estimado_minutos && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)',
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <i className="fa-regular fa-clock" style={{ marginRight: 6, fontSize: 10 }} />
                {contenido.tiempo_estimado_minutos} min
              </span>
            )}
          </motion.div>
        )}

        {/* ── Imagen destacada ── */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reducedMotion ? {} : { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }}
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            aspectRatio: '2 / 1',
            position: 'relative',
            border: `1px solid rgba(${color.rgba}, 0.15)`,
            boxShadow: `0 24px 60px rgba(${color.rgba}, 0.08)`,
          }}
        >
          <Image
            src="/biblioteca/placeholder-lectura.svg"
            alt="Imagen destacada de la lectura"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          {/* Color overlay tint */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, rgba(${color.rgba}, 0.04) 0%, transparent 60%)`,
            pointerEvents: 'none',
          }} />
        </motion.div>

        {/* ── Cuerpo de la lectura ── */}
        <motion.div
          ref={bodyRef}
          initial="hidden"
          animate={bodyInView ? 'visible' : 'hidden'}
          variants={bodyVariants}
          style={{
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="lec-body-inner"
            style={{
              maxWidth: 720,
              margin: '0 auto',
              padding: 'clamp(32px, 5vw, 52px) clamp(24px, 5vw, 52px)',
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={mdComponents}
            >
              {contenido.texto}
            </ReactMarkdown>

            {/* Callouts inline */}
            {callouts.map((c, i) => (
              <Callout key={i} tipo={c.tipo} contenido={c.contenido} />
            ))}
          </div>
        </motion.div>

        {/* ── Preguntas de comprensión ── */}
        {preguntas.length > 0 && (
          <div className="lec-questions" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Section divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              margin: '8px 0 20px',
            }}>
              <div style={{
                flex: 1, height: 1,
                background: `linear-gradient(to right, rgba(${color.rgba}, 0.40), transparent)`,
                boxShadow: `0 0 12px rgba(${color.rgba}, 0.20)`,
              }} />
              <h2 style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                fontWeight: 900, color: '#fff', margin: 0,
                letterSpacing: '-0.03em', flexShrink: 0,
                fontFamily: "var(--font-epilogue), sans-serif",
              }}>
                Preguntas de comprensión
              </h2>
              <div style={{
                flex: 1, height: 1,
                background: `linear-gradient(to left, rgba(${color.rgba}, 0.40), transparent)`,
              }} />
            </div>

            {preguntas.map((p, i) => (
              <PreguntaCard
                key={i}
                numero={i + 1}
                pregunta={p.pregunta}
                valor={respuestas[i] ?? ''}
                onChange={v => setRespuestas(r => ({ ...r, [i]: v }))}
                disabled={entregado}
                areaColor={color}
                mostrarGuia={entregado}
                respuestaGuia={p.respuesta_guia}
              />
            ))}
          </div>
        )}

        {/* ── CTA ── */}
        <AnimatePresence mode="wait">
          {!entregado ? (
            <motion.div
              key="cta"
              initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
              transition={reducedMotion ? {} : springs.gentle}
            >
              <motion.button
                className="lec-btn"
                onClick={handleEntregar}
                disabled={!todasRespondidas || isSubmitting}
                whileHover={todasRespondidas && !isSubmitting && !reducedMotion
                  ? { scale: 1.02, y: -2 } : {}}
                whileTap={todasRespondidas && !isSubmitting && !reducedMotion
                  ? { scale: 0.98 } : {}}
                transition={springs.snappy}
                style={{
                  '--lec-color': color.hex,
                  width: '100%',
                  padding: '18px 32px',
                  borderRadius: 18, border: 'none',
                  cursor: todasRespondidas && !isSubmitting ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  background: todasRespondidas
                    ? color.hex
                    : 'rgba(255,255,255,0.07)',
                  color: todasRespondidas ? '#011126' : 'rgba(255,255,255,0.25)',
                  boxShadow: todasRespondidas
                    ? `0 12px 32px rgba(${color.rgba}, 0.30)`
                    : 'none',
                  fontFamily: "var(--font-epilogue), sans-serif",
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 10,
                  transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
                } as React.CSSProperties}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {modoRevision ? 'Re-entregar lectura' : 'Entregar lectura'}
                  </>
                )}
              </motion.button>

              {/* Disabled hint */}
              {!todasRespondidas && preguntas.length > 0 && (
                <p style={{
                  textAlign: 'center', marginTop: 10,
                  fontSize: 12, color: 'rgba(255,255,255,0.32)',
                }}>
                  Responde todas las preguntas para continuar
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reducedMotion ? {} : springs.bouncy}
              style={{
                padding: '22px 28px', borderRadius: 18,
                background: 'rgba(74,222,128,0.10)',
                border: '1px solid rgba(74,222,128,0.25)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(74,222,128,0.14)',
                border: '1.5px solid rgba(74,222,128,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Check size={22} color="#4ADE80" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#4ADE80', margin: 0 }}>
                  ¡Lectura entregada!
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '3px 0 0' }}>
                  Regresando a la progresión...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spinner keyframes */}
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}
