'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ChevronDown, ChevronUp, Check, RotateCcw, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import { celebrate } from '@/lib/motion/celebrate';
import type { ActividadEjercicioMatematico, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#FB923C', rgba: '251,146,60', faIcon: 'fa-calculator', gradient: '' };
const MAX_INTENTOS = 3;

interface Props {
  actividad: ActividadEjercicioMatematico;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string>;
}

export function EjercicioMatematicoActivity({
  actividad, onProgreso, color = FALLBACK_COLOR, estado, respuestasIntento,
}: Props) {
  const { contenido } = actividad;
  const reducedMotion = useReducedMotion();
  const modoRevision = estado === 'completada';
  const pasos = contenido.pasos_guia ?? [];
  const esDesarrollo = contenido.tipo_respuesta === 'desarrollo';

  const [respuesta, setRespuesta] = useState(() =>
    modoRevision ? (respuestasIntento?.respuesta ?? '') : ''
  );
  const [intentos, setIntentos] = useState(0);
  const [correcto, setCorrecto] = useState<boolean | null>(modoRevision ? true : null);
  const [solucionRevelada, setSolucionRevelada] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [entregando, setEntregando] = useState(false);
  const [pasosAbiertos, setPasosAbiertos] = useState<boolean[]>(() => Array(pasos.length).fill(false));
  const [maxUnlocked, setMaxUnlocked] = useState(modoRevision ? pasos.length : 0);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (shakeTimer.current) clearTimeout(shakeTimer.current); }, []);

  const verificado = correcto !== null || solucionRevelada;
  const intentosAgotados = intentos >= MAX_INTENTOS;

  function togglePaso(i: number) {
    if (i > maxUnlocked) return;
    const nuevos = [...pasosAbiertos];
    const abriendo = !nuevos[i];
    nuevos[i] = abriendo;
    if (abriendo) setMaxUnlocked(prev => Math.max(prev, i + 1));
    setPasosAbiertos(nuevos);
  }

  function handleVerificar() {
    if (esDesarrollo) {
      setCorrecto(true);
      if (!reducedMotion) void celebrate('small');
      return;
    }
    const tolerancia = contenido.tolerancia_error ?? 0;
    const esperada = parseFloat(contenido.respuesta_final ?? '');
    const dada = parseFloat(respuesta.replace(',', '.'));
    const esCorrecta = !isNaN(esperada) && !isNaN(dada) && Math.abs(dada - esperada) <= tolerancia;

    if (esCorrecta) {
      setCorrecto(true);
      if (!reducedMotion) void celebrate('small');
    } else {
      const nuevosIntentos = intentos + 1;
      setIntentos(nuevosIntentos);
      if (nuevosIntentos >= MAX_INTENTOS) {
        setSolucionRevelada(true);
      } else {
        setShaking(true);
        shakeTimer.current = setTimeout(() => setShaking(false), 500);
      }
    }
  }

  function handleEntregar() {
    if (entregando) return;
    setEntregando(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: correcto === true,
      puntaje: correcto === true ? 100 : 0,
      respuestas: { respuesta: respuesta.trim() },
    });
  }

  function handleReiniciar() {
    setRespuesta('');
    setIntentos(0);
    setCorrecto(null);
    setSolucionRevelada(false);
    setShaking(false);
    setEntregando(false);
    setPasosAbiertos(Array(pasos.length).fill(false));
    setMaxUnlocked(0);
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        @keyframes em-shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-4px)} 90%{transform:translateX(4px)} }
        .em-input:focus { outline: none; }
        .em-input::placeholder { color: rgba(255,255,255,0.25); }
        .em-textarea:focus { outline: none; }
        .em-textarea::placeholder { color: rgba(255,255,255,0.22); }
        .em-btn-pri:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .em-btn-pri:active:not(:disabled) { transform: translateY(0); }
        .em-btn-pri:focus-visible { outline: 2px solid rgba(255,255,255,0.50); outline-offset: 3px; }
        .em-btn-sec:hover { background: rgba(255,255,255,0.10) !important; }
        .em-btn-sec:focus-visible { outline: 2px solid rgba(255,255,255,0.40); outline-offset: 3px; }
        .em-paso-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.30); outline-offset: 2px; }
      `}</style>

      {/* Revision mode banner */}
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
          <Check size={16} style={{ color: '#818CF8', flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#818CF8', margin: 0 }}>
            Ya completaste este ejercicio · Revisando tu respuesta anterior
          </p>
        </motion.div>
      )}

      {/* Contexto */}
      {contenido.contexto && (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.smooth, delay: 0.05 }}
          style={{
            ...card,
            padding: '22px 28px',
            background: 'rgba(251,191,36,0.07)',
            border: '1px solid rgba(251,191,36,0.20)',
            borderLeft: '4px solid #FBBF24',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#FBBF24', margin: '0 0 10px' }}>
            Contexto
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.65 }}>
            {contenido.contexto}
          </p>
        </motion.div>
      )}

      {/* Hero problema */}
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.08 }}
        style={{
          ...card,
          padding: '32px 36px',
          background: `rgba(${color.rgba}, 0.06)`,
          border: `1.5px solid rgba(${color.rgba}, 0.18)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `rgba(${color.rgba}, 0.14)`,
          }}>
            <Calculator size={22} style={{ color: color.hex }} />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', color: color.hex, margin: '0 0 6px' }}>
              Problema
            </p>
            {contenido.instrucciones && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', margin: '0 0 4px', fontStyle: 'italic' }}>
                {contenido.instrucciones}
              </p>
            )}
          </div>
        </div>
        <p style={{
          fontSize: 19, fontWeight: 700, color: 'rgba(255,255,255,0.95)',
          margin: 0, lineHeight: 1.65, letterSpacing: '-0.01em',
          fontFamily: 'var(--font-epilogue), sans-serif',
        }}>
          {contenido.problema}
        </p>
        {contenido.unidades && (
          <div style={{ marginTop: 16 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: color.hex,
              background: `rgba(${color.rgba}, 0.10)`, padding: '4px 12px',
              borderRadius: 999, border: `1px solid rgba(${color.rgba}, 0.22)`,
            }}>
              Unidades: {contenido.unidades}
            </span>
          </div>
        )}
      </motion.div>

      {/* Accordion pasos */}
      {pasos.length > 0 && (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.smooth, delay: 0.13 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {pasos.map((paso, i) => {
            const unlocked = i <= maxUnlocked;
            const abierto = pasosAbiertos[i] ?? false;
            return (
              <div
                key={i}
                style={{
                  ...card,
                  overflow: 'hidden',
                  opacity: unlocked ? 1 : 0.38,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <button
                  className="em-paso-btn"
                  disabled={!unlocked}
                  onClick={() => togglePaso(i)}
                  style={{
                    width: '100%', padding: '16px 22px', background: 'transparent',
                    border: 'none', cursor: unlocked ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontFamily: 'var(--font-epilogue), sans-serif',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                    background: `rgba(${color.rgba}, 0.12)`,
                    border: `1px solid rgba(${color.rgba}, 0.22)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, color: color.hex,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.58)', flex: 1, textAlign: 'left' }}>
                    {unlocked ? (abierto ? 'Ocultar paso' : `Ver paso ${i + 1}`) : `Paso ${i + 1} (abre el anterior primero)`}
                  </span>
                  {abierto
                    ? <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                    : <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />}
                </button>
                <AnimatePresence initial={false}>
                  {abierto && (
                    <motion.div
                      key="content"
                      initial={reducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ ...springs.smooth, opacity: { duration: 0.2 } }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        padding: '16px 22px 18px',
                      }}>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.65 }}>
                          {paso}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Input / textarea */}
      {!modoRevision && (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.smooth, delay: 0.16 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <label style={{
            fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.20em',
            color: 'rgba(255,255,255,0.38)',
          }}>
            {esDesarrollo ? 'Desarrollo de tu solución' : `Tu respuesta${contenido.unidades ? ` (${contenido.unidades})` : ''}`}
          </label>

          {/* Intentos badge */}
          {!verificado && intentos > 0 && !intentosAgotados && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              borderRadius: 10, background: 'rgba(248,113,113,0.10)',
              border: '1px solid rgba(248,113,113,0.22)', alignSelf: 'flex-start',
            }}>
              <AlertCircle size={13} style={{ color: '#F87171' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#F87171' }}>
                Intento {intentos} de {MAX_INTENTOS} · Respuesta incorrecta
              </span>
            </div>
          )}

          <div style={{ animation: shaking && !reducedMotion ? 'em-shake 0.45s ease' : 'none' }}>
            {!esDesarrollo ? (
              <input
                type="text"
                className="em-input"
                value={respuesta}
                onChange={e => !verificado ? setRespuesta(e.target.value) : undefined}
                readOnly={verificado}
                placeholder="Escribe tu resultado aquí..."
                onKeyDown={e => { if (e.key === 'Enter' && !verificado && respuesta.trim()) handleVerificar(); }}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: `2px solid ${
                    correcto === true ? 'rgba(74,222,128,0.45)' :
                    correcto === false || solucionRevelada ? 'rgba(248,113,113,0.40)' :
                    'rgba(255,255,255,0.12)'
                  }`,
                  borderRadius: 16, padding: '20px 24px',
                  fontSize: 24, fontWeight: 800,
                  color: correcto === true ? '#4ADE80' : correcto === false ? '#F87171' : 'rgba(255,255,255,0.93)',
                  fontFamily: 'var(--font-epilogue), sans-serif',
                  letterSpacing: '0.02em', textAlign: 'center',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.25s ease, color 0.25s ease',
                }}
              />
            ) : (
              <textarea
                className="em-textarea"
                value={respuesta}
                onChange={e => !verificado ? setRespuesta(e.target.value) : undefined}
                readOnly={verificado}
                rows={8}
                placeholder="Escribe tu procedimiento, pasos y razonamiento..."
                style={{
                  width: '100%', minHeight: 200,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${correcto === true ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 16, padding: '20px 24px',
                  fontSize: 16, color: 'rgba(255,255,255,0.88)',
                  resize: 'vertical', fontFamily: 'var(--font-epilogue), sans-serif',
                  lineHeight: 1.75, boxSizing: 'border-box',
                  transition: 'border-color 0.25s ease',
                }}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Solucion revelada */}
      <AnimatePresence>
        {solucionRevelada && contenido.respuesta_final && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.gentle}
            style={{
              ...card,
              padding: '24px 28px',
              background: 'rgba(251,191,36,0.08)',
              border: '1.5px solid rgba(251,191,36,0.25)',
              borderLeft: '4px solid #FBBF24',
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#FBBF24', margin: '0 0 10px' }}>
              Solución correcta
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px', fontFamily: 'var(--font-epilogue), sans-serif' }}>
              {contenido.respuesta_final}{contenido.unidades ? ` ${contenido.unidades}` : ''}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', margin: 0 }}>
              Revisá los pasos guía para entender el procedimiento.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback correcto */}
      <AnimatePresence>
        {correcto === true && !modoRevision && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={springs.bouncy}
            style={{
              padding: '20px 26px', borderRadius: 16,
              background: 'rgba(74,222,128,0.10)', border: '1.5px solid rgba(74,222,128,0.30)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'rgba(74,222,128,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={20} style={{ color: '#4ADE80' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#4ADE80', margin: '0 0 2px' }}>
                {esDesarrollo ? '¡Solución registrada!' : '¡Respuesta correcta!'}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                {esDesarrollo ? 'Tu procedimiento fue guardado.' : `${contenido.respuesta_final ? `${contenido.respuesta_final}${contenido.unidades ? ` ${contenido.unidades}` : ''}` : 'Resultado perfecto.'}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Verify button */}
        {!verificado && !modoRevision && (
          <motion.button
            className="em-btn-pri"
            onClick={handleVerificar}
            disabled={respuesta.trim().length === 0}
            whileHover={respuesta.trim() && !reducedMotion ? { y: -2 } : {}}
            whileTap={respuesta.trim() && !reducedMotion ? { scale: 0.98 } : {}}
            transition={springs.snappy}
            style={{
              width: '100%', padding: '18px 32px', borderRadius: 16, border: 'none',
              cursor: respuesta.trim() ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
              background: respuesta.trim() ? color.hex : 'rgba(255,255,255,0.08)',
              color: respuesta.trim() ? '#011126' : 'rgba(255,255,255,0.25)',
              boxShadow: respuesta.trim() ? `0 12px 32px rgba(${color.rgba}, 0.28)` : 'none',
              fontFamily: 'var(--font-epilogue), sans-serif',
              transition: 'background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Check size={16} />
            {esDesarrollo ? 'Registrar solución' : `Verificar respuesta${intentos > 0 ? ` (intento ${intentos + 1})` : ''}`}
          </motion.button>
        )}

        {/* Retry after wrong (not exhausted) */}
        {correcto === false && !solucionRevelada && !modoRevision && (
          <motion.button
            className="em-btn-sec"
            onClick={handleReiniciar}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={springs.snappy}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', fontSize: 14, fontWeight: 700,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)',
              fontFamily: 'var(--font-epilogue), sans-serif',
              transition: 'background 0.2s, transform 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <RotateCcw size={15} />
            Volver a intentar
          </motion.button>
        )}

        {/* After solution revealed: try again */}
        {solucionRevelada && !modoRevision && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <motion.button
              className="em-btn-sec"
              onClick={handleReiniciar}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={springs.snappy}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.12)',
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)',
                fontFamily: 'var(--font-epilogue), sans-serif',
                transition: 'background 0.2s, transform 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <RotateCcw size={15} />
              Volver a hacer el ejercicio
            </motion.button>
            <motion.button
              className="em-btn-pri"
              onClick={handleEntregar}
              disabled={entregando}
              whileHover={!entregando && !reducedMotion ? { y: -2 } : {}}
              whileTap={!entregando && !reducedMotion ? { scale: 0.98 } : {}}
              transition={springs.snappy}
              style={{
                width: '100%', padding: '18px 32px', borderRadius: 16, border: 'none',
                cursor: entregando ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                background: 'rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.55)',
                fontFamily: 'var(--font-epilogue), sans-serif',
                transition: 'background 0.25s, transform 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {entregando ? <Loader2 size={16} style={{ animation: 'em-spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
              {entregando ? 'Registrando...' : 'Continuar de todas formas'}
            </motion.button>
          </div>
        )}

        {/* Continuar after correct */}
        {correcto === true && !modoRevision && (
          <motion.button
            className="em-btn-pri"
            onClick={handleEntregar}
            disabled={entregando}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.bouncy}
            whileHover={!entregando && !reducedMotion ? { y: -2, scale: 1.01 } : {}}
            whileTap={!entregando && !reducedMotion ? { scale: 0.98 } : {}}
            style={{
              width: '100%', padding: '18px 32px', borderRadius: 16, border: 'none',
              cursor: entregando ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
              background: entregando ? 'rgba(74,222,128,0.20)' : color.hex,
              color: entregando ? '#4ADE80' : '#011126',
              boxShadow: entregando ? 'none' : `0 12px 32px rgba(${color.rgba}, 0.30)`,
              fontFamily: 'var(--font-epilogue), sans-serif',
              transition: 'background 0.25s, box-shadow 0.25s, transform 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {entregando
              ? <><Loader2 size={16} style={{ animation: 'em-spin 1s linear infinite' }} /> Registrando...</>
              : <><ArrowRight size={16} /> Continuar</>}
          </motion.button>
        )}
      </div>

      <style>{`
        @keyframes em-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
