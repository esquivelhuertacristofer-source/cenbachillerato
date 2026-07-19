'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TextCursor, Check, X, Lightbulb, RotateCcw, ArrowRight, Loader2, Eye, CheckCircle } from 'lucide-react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import { celebrate } from '@/lib/motion/celebrate';
import type { ActividadFillBlanks, HuecoFillBlanks, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { imagenDeLectura } from '@/lib/contenido/lectura-imagenes';

const FALLBACK_COLOR: AreaColor = { hex: '#34D399', rgba: '52,211,153', faIcon: 'fa-pen-line', gradient: '' };

interface Props {
  actividad: ActividadFillBlanks;
  onProgreso?: CallbackProgreso;
  /** Código de la UAC, para elegir una imagen temática cuando no hay lámina propia. */
  uacCodigo?: string;
  color?: AreaColor;
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string>;
}

// ── Parser ──────────────────────────────────────────────────────────────────────

type Parte = { tipo: 'texto'; contenido: string } | { tipo: 'hueco'; indice: number };

function parsearTexto(texto: string): Parte[] {
  const partes: Parte[] = [];
  const regex = /___/g;
  let lastIndex = 0;
  let huecoIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > lastIndex) {
      partes.push({ tipo: 'texto', contenido: texto.slice(lastIndex, match.index) });
    }
    partes.push({ tipo: 'hueco', indice: huecoIndex });
    huecoIndex++;
    lastIndex = match.index + 3;
  }
  if (lastIndex < texto.length) {
    partes.push({ tipo: 'texto', contenido: texto.slice(lastIndex) });
  }
  return partes;
}

function esRespuestaCorrecta(respuesta: string, hueco: HuecoFillBlanks, distingue: boolean): boolean {
  const normalizada = distingue ? respuesta.trim() : respuesta.trim().toLowerCase();
  const correcta = distingue ? hueco.respuesta_correcta : hueco.respuesta_correcta.toLowerCase();
  if (normalizada === correcta) return true;
  if (hueco.alternativas_aceptadas) {
    return hueco.alternativas_aceptadas.some(alt =>
      distingue ? alt === respuesta.trim() : alt.toLowerCase() === normalizada
    );
  }
  return false;
}

// ── HuecoInput ─────────────────────────────────────────────────────────────────

interface HuecoInputProps {
  indice: number;
  valor: string;
  onChange: (v: string) => void;
  verificado: boolean;
  reveladas: boolean;
  esCorrecta: boolean | null;
  respuestaCorrecta: string;
  pista?: string;
  pistaVisible: boolean;
  onTogglePista: () => void;
  areaHex: string;
  areaRgba: string;
  shakingAll: boolean;
  disabled: boolean;
  reducedMotion: boolean;
}

function HuecoInput({
  indice, valor, onChange, verificado, reveladas,
  esCorrecta, respuestaCorrecta, pista, pistaVisible, onTogglePista,
  areaHex, areaRgba, shakingAll, disabled, reducedMotion,
}: HuecoInputProps) {
  const [focused, setFocused] = useState(false);
  const valorMostrado = reveladas ? respuestaCorrecta : valor;

  const borderColor = reveladas ? '#F97316'
    : esCorrecta === true ? '#4ADE80'
    : esCorrecta === false ? '#F87171'
    : focused || valor ? areaHex
    : 'rgba(255,255,255,0.28)';

  const textColor = reveladas ? '#F97316'
    : esCorrecta === true ? '#4ADE80'
    : esCorrecta === false ? '#F87171'
    : 'rgba(255,255,255,0.92)';

  const anchoEstimado = Math.max(respuestaCorrecta.length * 0.65 + 2, 4);

  return (
    <span style={{ display: 'inline-block', position: 'relative', margin: '0 2px', verticalAlign: 'baseline' }}>
      <motion.span
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        animate={shakingAll && esCorrecta === false && !verificado === false && !reducedMotion
          ? { x: [0, -7, 7, -5, 5, -3, 3, 0] }
          : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <input
          type="text"
          value={valorMostrado}
          onChange={e => onChange(e.target.value)}
          readOnly={disabled || reveladas || verificado}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="···"
          aria-label={`Hueco ${indice + 1}`}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: `2.5px solid ${borderColor}`,
            width: `${anchoEstimado}ch`,
            minWidth: 60,
            color: textColor,
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'var(--font-epilogue), sans-serif',
            textAlign: 'center',
            padding: '2px 6px',
            outline: 'none',
            transition: 'border-color 0.2s, color 0.2s, width 0.15s',
            boxSizing: 'border-box',
          }}
        />

        {/* Check/X inline icons */}
        <AnimatePresence mode="wait">
          {esCorrecta === true && (
            <motion.span key="check"
              initial={reducedMotion ? { opacity: 1 } : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={springs.bouncy}
              style={{ display: 'inline-flex', flexShrink: 0 }}
            >
              <Check size={14} style={{ color: '#4ADE80' }} />
            </motion.span>
          )}
          {esCorrecta === false && !reveladas && (
            <motion.span key="x"
              initial={reducedMotion ? { opacity: 1 } : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={springs.bouncy}
              style={{ display: 'inline-flex', flexShrink: 0 }}
            >
              <X size={14} style={{ color: '#F87171' }} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pista button */}
        {pista && !verificado && !reveladas && (
          <button
            onClick={onTogglePista}
            aria-label={`Pista para hueco ${indice + 1}`}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <Lightbulb size={10} style={{ color: areaHex }} />
          </button>
        )}
      </motion.span>

      {/* Pista tooltip */}
      <AnimatePresence>
        {pistaVisible && pista && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.95 }}
            transition={springs.smooth}
            style={{
              position: 'absolute',
              bottom: '100%', left: '50%', transform: 'translateX(-50%)',
              marginBottom: 8, zIndex: 20,
              padding: '8px 12px', borderRadius: 10,
              background: `rgba(${areaRgba}, 0.15)`,
              border: `1px solid rgba(${areaRgba}, 0.40)`,
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={11} style={{ color: areaHex, flexShrink: 0 }} />
              {pista}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrong answer correction label */}
      {esCorrecta === false && !reveladas && (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            marginTop: 4, whiteSpace: 'nowrap', zIndex: 10,
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            ✓{' '}<span style={{ color: '#4ADE80', fontWeight: 700 }}>{respuestaCorrecta}</span>
          </span>
        </motion.div>
      )}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FillBlanksActivity({
  actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR, estado, respuestasIntento,
}: Props) {
  const { contenido } = actividad;
  const reducedMotion = useReducedMotion();
  const modoRevision = estado === 'completada';
  const distingue = contenido.distingue_mayusculas ?? false;
  const partes = parsearTexto(contenido.texto_con_huecos);
  const numHuecos = contenido.huecos.length;

  const [imgError, setImgError] = useState(false);
  const [imgTematicaError, setImgTematicaError] = useState(false);
  // Los SVG de placeholder ya no existen en disco; cualquier url que contenga
  // "placeholder" se trata como "sin lámina" para ir directo a la imagen temática
  // (evita una petición 404 y el ícono de imagen rota).
  const urlImagen = contenido.url_imagen ?? '';
  const tieneImagen = urlImagen.length > 0 && !/placeholder/i.test(urlImagen) && !imgError;
  // Sin lámina propia → imagen temática con licencia libre acorde a la materia.
  const imagenTematica = imagenDeLectura(uacCodigo, actividad.titulo);

  // Estado neutral de revisión: el intento existe pero `respuestas` llegó null
  // o vacío desde la BD (datos históricos, o detalle no disponible). Sin este
  // guard reconstruíamos huecos vacíos y el marcador mostraba "0 / N aciertos"
  // como si el alumno hubiera fallado todo.
  const tieneRespuestasGuardadas = !!respuestasIntento && Object.keys(respuestasIntento).length > 0;
  const revisionSinDetalle = modoRevision && !tieneRespuestasGuardadas;

  const [respuestas, setRespuestas] = useState<string[]>(() => {
    if (modoRevision && tieneRespuestasGuardadas && respuestasIntento) {
      return Array.from({ length: numHuecos }, (_, i) => respuestasIntento[String(i)] ?? '');
    }
    return Array(numHuecos).fill('');
  });
  // Sin respuestas guardadas no hay nada que "verificar": arrancar verificado
  // pintaría todos los huecos en rojo y un marcador de 0 aciertos falso.
  const [verificado, setVerificado] = useState(modoRevision && !revisionSinDetalle);
  const [reveladas, setReveladas] = useState(false);
  const [pistaVisible, setPistaVisible] = useState<number | null>(null);
  const [shakingAll, setShakingAll] = useState(false);
  const [entregando, setEntregando] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (shakeTimer.current) clearTimeout(shakeTimer.current); }, []);

  const llenos = respuestas.filter(r => r.trim().length > 0).length;
  const todosLlenos = llenos === numHuecos;
  const pct = numHuecos > 0 ? Math.round((llenos / numHuecos) * 100) : 0;

  function getEsCorrecta(i: number): boolean | null {
    if (!verificado) return null;
    const hueco = contenido.huecos[i];
    if (!hueco) return null;
    return esRespuestaCorrecta(respuestas[i] ?? '', hueco, distingue);
  }

  const resultados = Array.from({ length: numHuecos }, (_, i) => getEsCorrecta(i));
  const aciertos = verificado ? resultados.filter(r => r === true).length : 0;
  const todosCorrectos = verificado && aciertos === numHuecos;

  function actualizarRespuesta(i: number, valor: string) {
    if (verificado || reveladas) return;
    setRespuestas(prev => { const n = [...prev]; n[i] = valor; return n; });
  }

  function handleVerificar() {
    setVerificado(true);
    setPistaVisible(null);
    const incorrectos = Array.from({ length: numHuecos }, (_, i) => {
      const h = contenido.huecos[i];
      if (!h) return false;
      return !esRespuestaCorrecta(respuestas[i] ?? '', h, distingue);
    });
    if (incorrectos.some(Boolean) && !reducedMotion) {
      setShakingAll(true);
      shakeTimer.current = setTimeout(() => setShakingAll(false), 500);
    }
    if (incorrectos.every(v => !v) && !reducedMotion) {
      void celebrate('medium');
    }
  }

  function handleReintentar() {
    setRespuestas(Array(numHuecos).fill(''));
    setVerificado(false);
    setReveladas(false);
    setPistaVisible(null);
    setShakingAll(false);
  }

  async function handleEntregar() {
    if (entregando) return;
    setEntregando(true);
    const puntaje = numHuecos > 0 ? Math.round((aciertos / numHuecos) * 100) : 0;
    const completada = puntaje >= 70;
    const res = await onProgreso?.({
      actividadId: actividad.id ?? '',
      completada,
      puntaje,
      respuestas: Object.fromEntries(respuestas.map((r, i) => [String(i), r])),
    });
    // En éxito con `completada` el runner navega y este componente se desmonta;
    // si la entrega falló o no se completó, rehabilitamos el botón.
    if (!completada || (res && !res.ok)) setEntregando(false);
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        .fb-pista-btn:hover { background: rgba(255,255,255,0.18) !important; }
        .fb-btn-pri:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .fb-btn-pri:active:not(:disabled) { transform: translateY(0); }
        .fb-btn-pri:focus-visible { outline: 2px solid rgba(255,255,255,0.50); outline-offset: 3px; }
        .fb-btn-sec:hover { background: rgba(255,255,255,0.10) !important; }
        .fb-btn-sec:focus-visible { outline: 2px solid rgba(255,255,255,0.40); outline-offset: 3px; }
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
          <Eye size={16} style={{ color: '#818CF8', flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#818CF8', margin: 0 }}>
            {revisionSinDetalle
              ? 'Entrega registrada — la revisión detallada no está disponible'
              : 'Ya completaste esta actividad · Revisando tus respuestas anteriores'}
          </p>
        </motion.div>
      )}

      {/* Imagen de ambientación */}
      {tieneImagen ? (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.smooth}
          style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}
        >
          <img
            src={urlImagen}
            alt={actividad.titulo}
            style={{ width: '100%', objectFit: 'contain', maxHeight: 500, display: 'block' }}
            onError={() => setImgError(true)}
          />
        </motion.div>
      ) : !imgTematicaError ? (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.smooth}
          style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', position: 'relative' }}
        >
          <img
            src={imagenTematica}
            alt={actividad.titulo}
            style={{ width: '100%', objectFit: 'cover', height: 224, display: 'block' }}
            onError={() => setImgTematicaError(true)}
          />
          <div
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(1,17,38,0.55) 0%, rgba(1,17,38,0.10) 40%, transparent 70%)' }}
          />
          <p style={{ position: 'absolute', bottom: 12, left: 16, right: 16, margin: 0, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
            {actividad.titulo}
          </p>
        </motion.div>
      ) : (
        // Fallback honesto si tampoco hay imagen temática en disco: bloque temático sin <img> roto.
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.smooth}
          style={{
            borderRadius: 16,
            border: `1px solid rgba(${color.rgba},0.25)`,
            background: `linear-gradient(135deg, rgba(${color.rgba},0.14), rgba(${color.rgba},0.04))`,
            height: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <i className={`fa-solid ${color.faIcon}`} style={{ fontSize: 34, color: `rgba(${color.rgba},0.55)` }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.70)', textAlign: 'center', maxWidth: 320 }}>
            {actividad.titulo}
          </p>
        </motion.div>
      )}

      {/* Hero */}
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.05 }}
        style={{
          ...card,
          padding: '22px 28px',
          background: `rgba(${color.rgba}, 0.07)`,
          border: `1.5px solid rgba(${color.rgba}, 0.18)`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `rgba(${color.rgba}, 0.14)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TextCursor size={20} style={{ color: color.hex }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: color.hex, margin: '0 0 3px' }}>
            {contenido.instrucciones ?? 'Completá los huecos con la palabra correcta'}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', margin: 0 }}>
            {revisionSinDetalle
              ? 'Entrega registrada'
              : verificado ? `${aciertos} / ${numHuecos} correctos` : `${llenos} / ${numHuecos} huecos completados`}
          </p>
        </div>
      </motion.div>

      {/* Text with inline blanks */}
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.1 }}
        style={{
          ...card,
          padding: '36px 40px',
          fontSize: 18, lineHeight: 2.4,
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'var(--font-epilogue), sans-serif',
        }}
      >
        <p style={{ margin: 0, lineHeight: 2.6 }}>
          {partes.map((parte, i) => {
            if (parte.tipo === 'texto') {
              return <span key={i}>{parte.contenido}</span>;
            }
            const idx = parte.indice;
            const hueco = contenido.huecos[idx];
            if (!hueco) return null;
            return (
              <HuecoInput
                key={i}
                indice={idx}
                valor={respuestas[idx] ?? ''}
                onChange={v => actualizarRespuesta(idx, v)}
                verificado={verificado}
                reveladas={reveladas}
                esCorrecta={getEsCorrecta(idx)}
                respuestaCorrecta={hueco.respuesta_correcta}
                pista={hueco.pista}
                pistaVisible={pistaVisible === idx}
                onTogglePista={() => setPistaVisible(p => p === idx ? null : idx)}
                areaHex={color.hex}
                areaRgba={color.rgba}
                shakingAll={shakingAll}
                disabled={modoRevision}
                reducedMotion={reducedMotion}
              />
            );
          })}
        </p>
      </motion.div>

      {/* Progress counter — oculto en revisión: en el estado neutral (sin
          respuestas guardadas) "0 / N completados" sugeriría trabajo perdido */}
      {!verificado && !modoRevision && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            role="progressbar"
            aria-valuenow={llenos}
            aria-valuemin={0}
            aria-valuemax={numHuecos}
            aria-label={`${llenos} de ${numHuecos} huecos completados`}
            style={{
              flex: 1, height: 5, borderRadius: 999,
              background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={reducedMotion ? { duration: 0 } : { ...springs.gentle }}
              style={{ height: '100%', borderRadius: 999, background: color.hex }}
            />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.40)', whiteSpace: 'nowrap' }}>
            {llenos} / {numHuecos} completados
          </span>
        </div>
      )}

      {/* Score after verification */}
      <AnimatePresence>
        {verificado && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.gentle}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              ...card,
              padding: '22px 28px',
              background: todosCorrectos ? 'rgba(74,222,128,0.10)' : 'rgba(251,146,60,0.08)',
              border: `1.5px solid ${todosCorrectos ? 'rgba(74,222,128,0.30)' : 'rgba(251,146,60,0.25)'}`,
              borderLeft: `4px solid ${todosCorrectos ? '#4ADE80' : '#FB923C'}`,
              display: 'flex', alignItems: 'center', gap: 18,
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em',
                color: todosCorrectos ? '#4ADE80' : '#FB923C', margin: '0 0 4px',
              }}>
                {todosCorrectos ? '¡Todos correctos!' : 'Resultado'}
              </p>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, fontFamily: 'var(--font-epilogue), sans-serif' }}>
                {aciertos} / {numHuecos} aciertos
              </p>
            </div>
            {todosCorrectos && (
              <motion.div
                initial={reducedMotion ? { opacity: 1 } : { scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={springs.bouncy}
              >
                <CheckCircle size={44} style={{ color: '#4ADE80' }} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Verify */}
        {!verificado && !modoRevision && (
          <motion.button
            className="fb-btn-pri"
            onClick={handleVerificar}
            disabled={!todosLlenos}
            whileHover={todosLlenos && !reducedMotion ? { y: -2 } : {}}
            whileTap={todosLlenos && !reducedMotion ? { scale: 0.98 } : {}}
            transition={springs.snappy}
            style={{
              width: '100%', padding: '18px 32px', borderRadius: 16, border: 'none',
              cursor: todosLlenos ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
              background: todosLlenos ? color.hex : 'rgba(255,255,255,0.08)',
              color: todosLlenos ? '#011126' : 'rgba(255,255,255,0.25)',
              boxShadow: todosLlenos ? `0 12px 32px rgba(${color.rgba}, 0.28)` : 'none',
              fontFamily: 'var(--font-epilogue), sans-serif',
              transition: 'background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Check size={16} />
            Verificar respuestas
          </motion.button>
        )}

        {/* Wrong: Retry + Reveal */}
        {verificado && !todosCorrectos && !reveladas && !modoRevision && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <motion.button
              className="fb-btn-sec"
              onClick={handleReintentar}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.gentle, delay: 0.1 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,0.12)',
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.78)',
                fontFamily: 'var(--font-epilogue), sans-serif',
                transition: 'background 0.2s, transform 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <RotateCcw size={15} />
              Volver a intentar
            </motion.button>
            <motion.button
              className="fb-btn-sec"
              onClick={() => setReveladas(true)}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.gentle, delay: 0.18 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,0.08)',
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
                background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.52)',
                fontFamily: 'var(--font-epilogue), sans-serif',
                transition: 'background 0.2s, transform 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <Eye size={15} />
              Ver respuestas correctas
            </motion.button>
          </div>
        )}

        {/* Continuar (all correct or revealed) */}
        {(todosCorrectos || reveladas) && !modoRevision && (
          <motion.button
            className="fb-btn-pri"
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
              background: entregando ? 'rgba(74,222,128,0.18)' : color.hex,
              color: entregando ? '#4ADE80' : '#011126',
              boxShadow: entregando ? 'none' : `0 12px 32px rgba(${color.rgba}, 0.28)`,
              fontFamily: 'var(--font-epilogue), sans-serif',
              transition: 'background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {entregando
              ? <><Loader2 size={16} style={{ animation: 'fb-spin 1s linear infinite' }} /> Registrando...</>
              : <><ArrowRight size={16} /> Continuar</>}
          </motion.button>
        )}
      </div>

      <style>{`
        @keyframes fb-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
