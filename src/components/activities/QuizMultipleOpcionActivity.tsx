'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListChecks, Check, X, RotateCcw, ArrowRight, Trophy, Sparkles, Clock } from 'lucide-react';
import { springs, stagger as staggerTokens } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import { celebrate, fireworks } from '@/lib/motion/celebrate';
import type { ActividadQuizMultipleOpcion, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface Props {
  actividad: ActividadQuizMultipleOpcion;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string>;
}

type Fase = 'inicio' | 'quiz' | 'resumen';
type EstadoOpcion = 'default' | 'correct' | 'incorrect' | 'reveal' | 'dimmed';

interface RespuestaRegistrada {
  seleccionada: number;
  correcta: boolean;
}

// ── CounterAnimation ───────────────────────────────────────────────────────────

function CounterAnimation({ to, duracion = 1.2, sufijo = '' }: { to: number; duracion?: number; sufijo?: string }) {
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(reducedMotion ? to : 0);
  const started = useRef(false);

  useEffect(() => {
    if (reducedMotion) return;
    if (started.current) return;
    started.current = true;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duracion, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duracion, reducedMotion]);

  return <>{count}{sufijo}</>;
}

// ── TiempoFormat ───────────────────────────────────────────────────────────────

function formatTiempo(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// ── OpcionCard ─────────────────────────────────────────────────────────────────

interface OpcionCardProps {
  letra: string;
  texto: string;
  estado: EstadoOpcion;
  onClick: () => void;
  disabled: boolean;
}

function OpcionCard({ letra, texto, estado, onClick, disabled }: OpcionCardProps) {
  const reducedMotion = useReducedMotion();

  const estilos: Record<EstadoOpcion, { bg: string; border: string; letraBg: string; letraColor: string; textColor: string }> = {
    default: {
      bg: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.09)',
      letraBg: 'rgba(255,255,255,0.08)', letraColor: 'rgba(255,255,255,0.45)', textColor: 'rgba(255,255,255,0.78)',
    },
    correct: {
      bg: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.50)',
      letraBg: 'rgba(74,222,128,0.22)', letraColor: '#4ADE80', textColor: '#fff',
    },
    incorrect: {
      bg: 'rgba(248,113,113,0.12)', border: '2px solid rgba(248,113,113,0.50)',
      letraBg: 'rgba(248,113,113,0.22)', letraColor: '#F87171', textColor: '#fff',
    },
    reveal: {
      bg: 'rgba(74,222,128,0.06)', border: '1.5px solid rgba(74,222,128,0.28)',
      letraBg: 'rgba(74,222,128,0.14)', letraColor: '#4ADE80', textColor: 'rgba(255,255,255,0.80)',
    },
    dimmed: {
      bg: 'rgba(255,255,255,0.02)', border: '1.5px solid rgba(255,255,255,0.05)',
      letraBg: 'rgba(255,255,255,0.05)', letraColor: 'rgba(255,255,255,0.25)', textColor: 'rgba(255,255,255,0.35)',
    },
  };

  const s = estilos[estado];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled && !reducedMotion ? { scale: 1.015, y: -2 } : {}}
      whileTap={!disabled && !reducedMotion ? { scale: 0.98 } : {}}
      animate={estado === 'correct' && !reducedMotion ? { scale: [1, 1.025, 1] } : { scale: 1 }}
      transition={estado === 'correct' ? springs.bouncy : springs.snappy}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 22px', borderRadius: 18,
        background: s.bg, border: s.border,
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left',
        fontFamily: "var(--font-epilogue), sans-serif",
        outline: 'none',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
      className="quiz-opcion"
    >
      {/* Letter circle */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: s.letraBg, color: s.letraColor,
        fontSize: estado === 'correct' || estado === 'incorrect' || estado === 'reveal' ? 18 : 15,
        fontWeight: 900, transition: 'background 0.2s ease, color 0.2s ease',
      }}>
        {estado === 'correct' || estado === 'reveal'
          ? <Check size={20} />
          : estado === 'incorrect'
            ? <X size={20} />
            : letra}
      </div>
      {/* Text */}
      <span style={{
        fontSize: 16, fontWeight: 600, color: s.textColor,
        lineHeight: 1.45, transition: 'color 0.2s ease',
      }}>
        {texto}
      </span>
    </motion.button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function QuizMultipleOpcionActivity({ actividad, onProgreso, color = FALLBACK_COLOR, estado, respuestasIntento }: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas;
  const total = preguntas.length;
  const minPuntaje = contenido.puntaje_minimo_aprobacion ?? 70;
  const reducedMotion = useReducedMotion();
  const modoRevision = estado === 'completada';
  const fireworksFired = useRef(false);

  // Reconstruct previous answers for revision mode
  const initialRespuestasArr: RespuestaRegistrada[] = modoRevision && respuestasIntento
    ? preguntas.map((p, i) => {
        const seleccionada = parseInt(respuestasIntento[String(i)] ?? '-1', 10);
        return { seleccionada, correcta: seleccionada === p.respuesta_correcta };
      })
    : [];

  const [fase, setFase] = useState<Fase>(modoRevision ? 'resumen' : 'inicio');
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestasArr, setRespuestasArr] = useState<RespuestaRegistrada[]>(initialRespuestasArr);
  const [respuestaActual, setRespuestaActual] = useState<number | null>(null);
  const [verificada, setVerificada] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(0);
  const [xpGanado, setXpGanado] = useState(0);
  const [entregado, setEntregado] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tiempoFin, setTiempoFin] = useState(0);

  // Cleanup timer on unmount
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  // fireworks on resumen si score >= 80
  useEffect(() => {
    if (fase === 'resumen' && !fireworksFired.current) {
      const aciertos = (respuestasArr.length > 0 ? respuestasArr : initialRespuestasArr)
        .filter(r => r.correcta).length;
      const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;
      if (pct >= 80 && !reducedMotion) {
        fireworksFired.current = true;
        setTimeout(() => { void fireworks(); }, 400);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  function handleEmpezar() {
    setFase('quiz');
    setTiempoInicio(Date.now());
    setPreguntaActual(0);
    setRespuestasArr([]);
    setRespuestaActual(null);
    setVerificada(false);
    setXpGanado(0);
  }

  function handleSeleccion(indice: number) {
    if (verificada) return;
    const pregunta = preguntas[preguntaActual]!;
    const correcta = indice === pregunta.respuesta_correcta;

    setRespuestaActual(indice);
    setVerificada(true);
    setRespuestasArr(prev => [...prev, { seleccionada: indice, correcta }]);

    if (correcta && !reducedMotion) {
      void celebrate('small');
      setXpGanado(prev => prev + Math.floor((actividad.xp ?? 0) / total));
    }

    const delay = correcta ? 1200 : 2500;
    advanceTimer.current = setTimeout(() => {
      if (preguntaActual + 1 >= total) {
        setTiempoFin(Date.now());
        setFase('resumen');
      } else {
        setPreguntaActual(prev => prev + 1);
        setRespuestaActual(null);
        setVerificada(false);
      }
    }, reducedMotion ? 600 : delay);
  }

  function handleReiniciar() {
    fireworksFired.current = false;
    setFase('quiz');
    setPreguntaActual(0);
    setRespuestasArr([]);
    setRespuestaActual(null);
    setVerificada(false);
    setXpGanado(0);
    setTiempoInicio(Date.now());
    setTiempoFin(0);
    setEntregado(false);
  }

  function handleEntregar() {
    if (entregado) return;
    const arr = respuestasArr.length > 0 ? respuestasArr : initialRespuestasArr;
    const aciertos = arr.filter(r => r.correcta).length;
    const puntaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;
    setEntregado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: puntaje >= minPuntaje,
      puntaje,
      respuestas: arr.reduce<Record<number, number>>((acc, r, i) => ({ ...acc, [i]: r.seleccionada }), {}),
    });
  }

  // ── RESUMEN ──────────────────────────────────────────────────────────────────

  if (fase === 'resumen') {
    const arr = respuestasArr.length > 0 ? respuestasArr : initialRespuestasArr;
    const aciertos = arr.filter(r => r.correcta).length;
    const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;
    const tiempoTotal = tiempoInicio > 0 && tiempoFin > 0
      ? Math.round((tiempoFin - tiempoInicio) / 1000) : 0;
    const aprobado = pct >= minPuntaje;

    const containerVariants = {
      hidden: { opacity: reducedMotion ? 1 : 0 },
      visible: {
        opacity: 1,
        transition: reducedMotion ? {} : { staggerChildren: staggerTokens.normal, delayChildren: 0.15 },
      },
    };
    const itemVariants = reducedMotion
      ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
      : { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { ...springs.gentle } } };

    return (
      <motion.div
        initial="hidden" animate="visible" variants={containerVariants}
        style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
      >
        <style>{`
          .quiz-btn-sec:focus-visible { outline: 2px solid rgba(255,255,255,0.50); outline-offset: 3px; }
          .quiz-btn-pri:focus-visible { outline: 2px solid var(--quiz-color); outline-offset: 3px; }
        `}</style>

        {/* Modo revisión banner */}
        {modoRevision && (
          <motion.div variants={itemVariants} style={{
            padding: '14px 20px', borderRadius: 14,
            background: `rgba(${color.rgba}, 0.08)`,
            border: `1px solid rgba(${color.rgba}, 0.22)`,
            display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
          }}>
            <Check size={16} color={color.hex} style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 700, color: '#fff' }}>Ya completaste este quiz.</span>
              {' '}
              <span style={{ color: 'rgba(255,255,255,0.50)' }}>Esta es una revisión.</span>
            </div>
          </motion.div>
        )}

        {/* Score hero */}
        <motion.div
          variants={itemVariants}
          style={{
            borderRadius: 28, padding: 'clamp(32px,5vw,52px) clamp(24px,5vw,48px)',
            textAlign: 'center',
            background: aprobado ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
            border: aprobado ? '1.5px solid rgba(74,222,128,0.22)' : '1.5px solid rgba(248,113,113,0.20)',
          }}
        >
          <motion.div
            initial={reducedMotion ? {} : { scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={reducedMotion ? {} : { ...springs.bouncy, delay: 0.3 }}
            style={{ marginBottom: 20 }}
          >
            {aprobado
              ? <Trophy size={64} color={color.hex} style={{ margin: '0 auto' }} />
              : <Sparkles size={64} color="rgba(255,255,255,0.35)" style={{ margin: '0 auto' }} />
            }
          </motion.div>

          <h2 style={{
            fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, color: '#fff',
            margin: '0 0 12px', letterSpacing: '-0.04em',
            fontFamily: "var(--font-epilogue), sans-serif",
          }}>
            {aprobado ? '¡Excelente trabajo!' : 'Buen intento'}
          </h2>

          <motion.div
            initial={reducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reducedMotion ? {} : { ...springs.bouncy, delay: 0.5 }}
            style={{
              fontSize: 'clamp(4rem,10vw,6rem)', fontWeight: 900, color: color.hex,
              lineHeight: 1, letterSpacing: '-0.05em',
              fontFamily: "var(--font-epilogue), sans-serif",
            }}
          >
            <CounterAnimation to={pct} sufijo="%" />
          </motion.div>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '12px 0 0' }}>
            {aciertos} de {total} correctas · Mínimo aprobatorio: {minPuntaje}%
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 24,
            marginTop: 28, flexWrap: 'wrap',
          }}>
            {[
              { label: 'Aciertos', value: `${aciertos}/${total}`, Icon: Check },
              { label: 'Tiempo', value: tiempoTotal > 0 ? formatTiempo(tiempoTotal) : '—', Icon: Clock },
              { label: 'XP', value: `+${xpGanado}`, Icon: Sparkles },
            ].map(({ label, value, Icon }) => (
              <div key={label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '16px 24px', borderRadius: 16, minWidth: 90,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <Icon size={16} color={color.hex} />
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.40)' }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Per-question breakdown */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {preguntas.map((p, i) => {
            const r = arr[i];
            const isOk = r?.correcta ?? false;
            return (
              <div key={i} style={{
                borderRadius: 16, padding: '16px 20px',
                background: isOk ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)',
                border: isOk ? '1px solid rgba(74,222,128,0.18)' : '1px solid rgba(248,113,113,0.18)',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isOk ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                  color: isOk ? '#4ADE80' : '#F87171',
                }}>
                  {isOk ? <Check size={14} /> : <X size={14} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', margin: '0 0 4px', lineHeight: 1.4 }}>
                    {p.enunciado}
                  </p>
                  {!isOk && r && r.seleccionada >= 0 && (
                    <p style={{ fontSize: 12, color: '#4ADE80', margin: '0 0 2px' }}>
                      Correcta: {LETTERS[p.respuesta_correcta]} — {p.opciones[p.respuesta_correcta]}
                    </p>
                  )}
                  {p.retroalimentacion && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', margin: 0, fontStyle: 'italic' }}>
                      {p.retroalimentacion}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
        >
          <motion.button
            className="quiz-btn-sec"
            onClick={handleReiniciar}
            whileHover={reducedMotion ? {} : { scale: 1.02, y: -2 }}
            whileTap={reducedMotion ? {} : { scale: 0.98 }}
            transition={springs.snappy}
            style={{
              '--quiz-color': color.hex,
              flex: 1, minWidth: 160,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '16px 28px', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
              fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em',
              color: 'rgba(255,255,255,0.65)', fontFamily: "var(--font-epilogue), sans-serif",
              outline: 'none',
            } as React.CSSProperties}
          >
            <RotateCcw size={14} />
            Volver a hacer
          </motion.button>

          {!entregado ? (
            <motion.button
              className="quiz-btn-pri"
              onClick={handleEntregar}
              whileHover={reducedMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={reducedMotion ? {} : { scale: 0.98 }}
              transition={springs.snappy}
              style={{
                '--quiz-color': color.hex,
                flex: 1, minWidth: 160,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '16px 28px', borderRadius: 16, border: 'none',
                background: color.hex, cursor: 'pointer',
                fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em',
                color: '#011126', fontFamily: "var(--font-epilogue), sans-serif",
                boxShadow: `0 10px 28px rgba(${color.rgba}, 0.28)`,
                outline: 'none',
              } as React.CSSProperties}
            >
              Continuar
              <ArrowRight size={14} />
            </motion.button>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '16px 28px', borderRadius: 16,
              background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.22)',
              fontSize: 14, fontWeight: 800, color: '#4ADE80',
            }}>
              <Check size={16} />
              Quiz entregado
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // ── INICIO ───────────────────────────────────────────────────────────────────

  if (fase === 'inicio') {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? {} : springs.gentle}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 32,
          padding: 'clamp(40px,6vw,64px) clamp(24px,5vw,48px)',
          borderRadius: 28,
          border: `1.5px solid rgba(${color.rgba}, 0.18)`,
          background: `rgba(${color.rgba}, 0.04)`,
        }}
      >
        <style>{`
          .quiz-start-btn:focus-visible { outline: 2px solid var(--quiz-color); outline-offset: 3px; }
          .quiz-opcion:focus-visible { outline: 2px solid var(--quiz-opt-color, #A78BFA); outline-offset: 3px; }
        `}</style>

        <motion.div
          initial={reducedMotion ? {} : { scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={reducedMotion ? {} : { ...springs.bouncy, delay: 0.1 }}
          style={{
            width: 100, height: 100, borderRadius: 28,
            background: `rgba(${color.rgba}, 0.12)`,
            border: `2px solid rgba(${color.rgba}, 0.25)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ListChecks size={48} color={color.hex} />
        </motion.div>

        <div>
          <p style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em',
            color: color.hex, marginBottom: 10,
          }}>
            Quiz de comprensión
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, color: '#fff',
            margin: '0 0 12px', letterSpacing: '-0.03em',
            fontFamily: "var(--font-epilogue), sans-serif",
          }}>
            {actividad.titulo}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            {total} pregunta{total !== 1 ? 's' : ''} · Responde con cuidado
          </p>
        </div>

        <motion.button
          className="quiz-start-btn"
          onClick={handleEmpezar}
          whileHover={reducedMotion ? {} : { scale: 1.03, y: -3 }}
          whileTap={reducedMotion ? {} : { scale: 0.97 }}
          transition={springs.snappy}
          style={{
            '--quiz-color': color.hex,
            padding: '18px 48px', borderRadius: 18, border: 'none',
            background: color.hex, color: '#011126', cursor: 'pointer',
            fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
            fontFamily: "var(--font-epilogue), sans-serif",
            boxShadow: `0 12px 32px rgba(${color.rgba}, 0.30)`,
            display: 'flex', alignItems: 'center', gap: 10, outline: 'none',
          } as React.CSSProperties}
        >
          Empezar
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    );
  }

  // ── QUIZ (una pregunta por pantalla) ─────────────────────────────────────────

  const pregunta = preguntas[preguntaActual]!;
  const progPct = ((preguntaActual) / total) * 100;
  const progPctFinal = ((preguntaActual + 1) / total) * 100;

  function getEstadoOpcion(i: number): EstadoOpcion {
    if (!verificada) return 'default';
    const isSelected = respuestaActual === i;
    const isCorrect = i === pregunta.respuesta_correcta;
    if (isSelected && isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    if (!isSelected && isCorrect) return 'reveal';
    return 'dimmed';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <style>{`
        .quiz-opcion:focus-visible { outline: 2px solid var(--quiz-opt-color, #A78BFA); outline-offset: 3px; }
      `}</style>

      {/* Progress bar + counter */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.38)',
          }}>
            Pregunta {preguntaActual + 1} de {total}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 800, color: color.hex,
            padding: '3px 12px', borderRadius: 999,
            background: `rgba(${color.rgba}, 0.10)`,
          }}>
            +{xpGanado} XP
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: `${progPct}%` }}
            animate={{ width: verificada ? `${progPctFinal}%` : `${progPct}%` }}
            transition={reducedMotion ? {} : springs.smooth}
            style={{ height: '100%', borderRadius: 999, background: color.hex }}
          />
        </div>
      </div>

      {/* Question with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={preguntaActual}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
          transition={reducedMotion ? { duration: 0.2 } : springs.smooth}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {/* Enunciado */}
          <div style={{
            borderRadius: 22,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            padding: 'clamp(24px,4vw,36px)',
          }}>
            <p style={{
              fontSize: 'clamp(1.25rem,2.5vw,1.75rem)',
              fontWeight: 700, color: 'rgba(255,255,255,0.96)',
              margin: 0, lineHeight: 1.45, letterSpacing: '-0.02em',
              fontFamily: "var(--font-epilogue), sans-serif",
            }}>
              {pregunta.enunciado}
            </p>
          </div>

          {/* Opciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pregunta.opciones.map((opcion, i) => (
              <OpcionCard
                key={i}
                letra={LETTERS[i] ?? String(i + 1)}
                texto={opcion}
                estado={getEstadoOpcion(i)}
                onClick={() => handleSeleccion(i)}
                disabled={verificada}
              />
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {verificada && (
              <motion.div
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={reducedMotion ? { duration: 0.2 } : springs.gentle}
                style={{
                  padding: '18px 22px', borderRadius: 16,
                  borderLeft: `4px solid ${respuestaActual === pregunta.respuesta_correcta ? '#4ADE80' : '#F87171'}`,
                  background: respuestaActual === pregunta.respuesta_correcta
                    ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                }}
              >
                <div style={{
                  fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em',
                  color: respuestaActual === pregunta.respuesta_correcta ? '#4ADE80' : '#F87171',
                  marginBottom: pregunta.retroalimentacion ? 8 : 0,
                }}>
                  {respuestaActual === pregunta.respuesta_correcta ? '¡Correcto!' : 'Respuesta incorrecta'}
                </div>
                {pregunta.retroalimentacion && (
                  <p style={{
                    fontSize: 15, color: 'rgba(255,255,255,0.75)',
                    margin: 0, lineHeight: 1.6,
                    fontFamily: "var(--font-epilogue), sans-serif",
                  }}>
                    {pregunta.retroalimentacion}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
