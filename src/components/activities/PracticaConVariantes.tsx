'use client';

/**
 * PRÁCTICA CON OTROS NÚMEROS.
 *
 * Panel que vive dentro del ejercicio matemático (sin navegar): muestra una
 * variante del mismo problema —misma situación, mismo procedimiento, otros
 * números—, la califica con `coincideNumero` y ofrece la solución paso a paso.
 *
 * Es práctica libre: NO llama a `onProgreso` ni cambia la calificación.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RefreshCw, Eye, EyeOff, Shuffle, Dumbbell } from 'lucide-react';
import { springs } from '@/lib/motion/tokens';
import { coincideNumero } from '@/lib/activities/leer-numero';
import { generarVariante, nuevaSemilla, type Variante } from '@/lib/ejercicios/variantes';
import type { AreaColor } from '@/components/hub/hub-colors';

interface Props {
  codigo: string;
  color: AreaColor;
  reducedMotion: boolean;
  onCerrar: () => void;
}

/** Variante nueva, distinta de la anterior cuando se puede. */
function otraVariante(codigo: string, anterior?: Variante | null): Variante | null {
  let v = generarVariante(codigo, nuevaSemilla());
  for (let i = 0; i < 5 && v && anterior && v.problema === anterior.problema; i++) {
    v = generarVariante(codigo, nuevaSemilla());
  }
  return v;
}

export function PracticaConVariantes({ codigo, color, reducedMotion, onCerrar }: Props) {
  const [variante, setVariante] = useState<Variante | null>(() => otraVariante(codigo));
  const [respuesta, setRespuesta] = useState('');
  const [resultado, setResultado] = useState<'correcta' | 'incorrecta' | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [resueltos, setResueltos] = useState(0);
  const [intentados, setIntentados] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const yaContado = useRef(false);

  // Al abrir el panel (y en cada ejercicio nuevo) el foco va a la casilla.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  }, [variante, reducedMotion]);

  if (!variante) return null;

  const inputId = `em-practica-${codigo}`;
  const puedeVerificar = respuesta.trim().length > 0 && resultado !== 'correcta';

  function verificar() {
    if (!variante || !puedeVerificar) return;
    const ok = coincideNumero(respuesta, String(variante.respuesta), variante.tolerancia);
    setResultado(ok ? 'correcta' : 'incorrecta');
    if (!yaContado.current) {
      yaContado.current = true;
      setIntentados((n) => n + 1);
      if (ok) setResueltos((n) => n + 1);
    }
  }

  function siguiente() {
    setVariante((prev) => otraVariante(codigo, prev));
    setRespuesta('');
    setResultado(null);
    setVerSolucion(false);
    yaContado.current = false;
  }

  const entrada = reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 };
  const btnSec: React.CSSProperties = {
    flex: '1 1 150px', padding: '13px 16px', borderRadius: 12,
    border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'var(--font-epilogue), sans-serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'background 0.2s',
  };

  return (
    <motion.section
      aria-labelledby={`${inputId}-titulo`}
      initial={entrada}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.smooth}
      style={{
        borderRadius: 20,
        padding: 'clamp(16px, 4.5vw, 28px)',
        background: `rgba(${color.rgba}, 0.05)`,
        border: `1.5px solid rgba(${color.rgba}, 0.22)`,
        display: 'flex', flexDirection: 'column', gap: 16,
        minWidth: 0,
      }}
    >
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(${color.rgba}, 0.14)`,
        }}>
          <Dumbbell size={18} style={{ color: color.hex }} aria-hidden="true" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p id={`${inputId}-titulo`} style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: color.hex, margin: '0 0 4px' }}>
            Practica con otros números
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)', margin: 0, lineHeight: 1.5 }}>
            Mismo procedimiento, datos nuevos. Esta práctica no cambia tu calificación.
            {intentados > 0 && <> · Llevas {resueltos} de {intentados} a la primera.</>}
          </p>
        </div>
        <button
          type="button"
          className="em-btn-sec"
          onClick={onCerrar}
          aria-label="Cerrar la práctica"
          style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      {/* Problema */}
      <p style={{
        fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0,
        lineHeight: 1.65, fontFamily: 'var(--font-epilogue), sans-serif',
        overflowWrap: 'anywhere',
      }}>
        {variante.problema}
      </p>

      {/* Casilla */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label htmlFor={inputId} style={{
          fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.38)',
        }}>
          {`Tu respuesta${variante.unidades ? ` (${variante.unidades})` : ''}`}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="em-input"
          value={respuesta}
          onChange={(e) => {
            if (resultado === 'correcta') return;
            setRespuesta(e.target.value);
            if (resultado === 'incorrecta') setResultado(null);
          }}
          readOnly={resultado === 'correcta'}
          placeholder="Escribe tu resultado..."
          onKeyDown={(e) => { if (e.key === 'Enter') verificar(); }}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)',
            border: `2px solid ${
              resultado === 'correcta' ? 'rgba(74,222,128,0.45)'
                : resultado === 'incorrecta' ? 'rgba(248,113,113,0.40)'
                  : 'rgba(255,255,255,0.12)'
            }`,
            borderRadius: 14, padding: '14px 18px',
            fontSize: 20, fontWeight: 800, textAlign: 'center', letterSpacing: '0.02em',
            color: resultado === 'correcta' ? '#4ADE80' : resultado === 'incorrecta' ? '#F87171' : 'rgba(255,255,255,0.93)',
            fontFamily: 'var(--font-epilogue), sans-serif',
            transition: 'border-color 0.25s ease, color 0.25s ease',
          }}
        />
      </div>

      {/* Retroalimentación */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {resultado && (
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: resultado === 'correcta' ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.10)',
            border: `1px solid ${resultado === 'correcta' ? 'rgba(74,222,128,0.30)' : 'rgba(248,113,113,0.26)'}`,
          }}>
            {resultado === 'correcta'
              ? <Check size={16} style={{ color: '#4ADE80', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              : <X size={16} style={{ color: '#F87171', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />}
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: resultado === 'correcta' ? '#4ADE80' : '#FCA5A5', fontWeight: 700 }}>
              {resultado === 'correcta'
                ? `¡Correcto! ${variante.respuestaTexto}.`
                : 'Todavía no. Revisa tu procedimiento y vuelve a intentarlo, o abre la solución.'}
            </p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {resultado !== 'correcta' && (
          <button
            type="button"
            className="em-btn-pri"
            onClick={verificar}
            disabled={!puedeVerificar}
            style={{
              flex: '1 1 150px', padding: '13px 16px', borderRadius: 12, border: 'none',
              cursor: puedeVerificar ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.10em',
              background: puedeVerificar ? color.hex : 'rgba(255,255,255,0.08)',
              color: puedeVerificar ? '#011126' : 'rgba(255,255,255,0.28)',
              fontFamily: 'var(--font-epilogue), sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.25s, color 0.25s, transform 0.15s',
            }}
          >
            <Check size={15} aria-hidden="true" />
            Verificar
          </button>
        )}
        <button
          type="button"
          className="em-btn-sec"
          onClick={() => setVerSolucion((v) => !v)}
          aria-expanded={verSolucion}
          style={btnSec}
        >
          {verSolucion ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
          {verSolucion ? 'Ocultar solución' : 'Ver solución'}
        </button>
        <button
          type="button"
          className={resultado === 'correcta' ? 'em-btn-pri' : 'em-btn-sec'}
          onClick={siguiente}
          style={resultado === 'correcta'
            ? { ...btnSec, border: 'none', background: color.hex, color: '#011126', fontWeight: 900 }
            : btnSec}
        >
          {resultado === 'correcta' ? <Shuffle size={15} aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />}
          Otro ejercicio
        </button>
      </div>

      {/* Solución paso a paso */}
      <AnimatePresence initial={false}>
        {verSolucion && (
          <motion.div
            key="solucion"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ ...springs.smooth, opacity: { duration: 0.2 } }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderRadius: 14, padding: '16px 18px',
              background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)',
              borderLeft: '4px solid #FBBF24',
            }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#FBBF24', margin: '0 0 10px' }}>
                Solución
              </p>
              <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {variante.pasos.map((paso, i) => (
                  <li key={i} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.74)', lineHeight: 1.6, overflowWrap: 'anywhere' }}>
                    {paso}
                  </li>
                ))}
              </ol>
              <p style={{ margin: '12px 0 0', fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-epilogue), sans-serif', overflowWrap: 'anywhere' }}>
                Resultado: {variante.respuestaTexto}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
