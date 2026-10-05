'use client';

/**
 * QUIZ PASO A PASO — piezas de presentación compartidas por los dos quizzes
 * (verdadero/falso y opción múltiple): una pregunta a la vez, puntos para
 * saltar entre las ya vistas, retroalimentación inmediata y navegación
 * anterior/siguiente. Sigue la línea visual de LecturaGuiada: bloques con
 * borde suave, acento por materia (AreaColor), letra legible y CSS de clases
 * propias. Aquí no vive lógica de calificación: cada quiz conserva la suya.
 */

import { useState, type ReactNode, type RefObject } from 'react';
import { Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import type { AreaColor } from '@/components/hub/hub-colors';

export const QUIZ_CSS = `
.qz { display:flex; flex-direction:column; gap:18px; width:100%; max-width:720px; margin:0 auto; font-family:var(--font-epilogue), sans-serif; }
.qz-bloque { border-radius:22px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); }
.qz-portada { position:relative; border-radius:18px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); }
.qz-portada img { display:block; width:100%; }
.qz-portada .qz-lamina { max-height:280px; object-fit:contain; }
.qz-portada .qz-tema { height:140px; object-fit:cover; }
.qz-velo { position:absolute; inset:0; pointer-events:none; background:linear-gradient(to top, rgba(1,17,38,0.70) 0%, rgba(1,17,38,0.15) 55%, transparent 80%); }
.qz-portada p { position:absolute; left:16px; right:16px; bottom:10px; margin:0; font-size:14px; font-weight:700; line-height:1.3; color:rgba(255,255,255,0.92); }
.qz-portada-vacia { display:flex; align-items:center; justify-content:center; gap:10px; min-height:84px; padding:14px 18px; border-radius:18px; text-align:center; border:1px solid rgba(var(--qz-rgb),0.25); background:linear-gradient(135deg, rgba(var(--qz-rgb),0.14), rgba(var(--qz-rgb),0.04)); color:rgba(255,255,255,0.82); font-size:15px; font-weight:700; }
.qz-portada-vacia svg { flex-shrink:0; color:var(--qz-c); opacity:0.75; }
.qz-progreso { display:flex; flex-direction:column; gap:10px; }
.qz-cabeza { display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.qz-rotulo { font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--qz-c); }
.qz-cuenta { font-size:14px; font-weight:600; color:rgba(255,255,255,0.62); }
.qz-barra { height:6px; border-radius:99px; background:rgba(255,255,255,0.08); overflow:hidden; }
.qz-barra > div { height:100%; border-radius:99px; background:var(--qz-c); transition:width .3s ease; }
.qz-puntos { display:flex; flex-wrap:wrap; gap:6px; }
.qz-punto { width:34px; height:34px; padding:0; border-radius:50%; display:grid; place-items:center; font-family:inherit; font-size:13px; font-weight:800; cursor:pointer; border:1.5px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.72); transition:border-color .15s, background .15s; }
.qz-punto:hover:not(:disabled) { border-color:rgba(var(--qz-rgb),0.6); }
.qz-punto:disabled { opacity:0.35; cursor:not-allowed; }
.qz-punto[data-r="bien"] { background:rgba(74,222,128,0.16); border-color:rgba(74,222,128,0.55); color:#4ADE80; }
.qz-punto[data-r="mal"] { background:rgba(248,113,113,0.16); border-color:rgba(248,113,113,0.55); color:#F87171; }
.qz-punto[aria-current="step"] { box-shadow:0 0 0 2px #011126, 0 0 0 4px var(--qz-c); color:#fff; }
.qz-pregunta { display:flex; flex-direction:column; gap:18px; padding:clamp(20px,4vw,32px) clamp(18px,4vw,32px); }
.qz-enunciado { margin:0; font-size:clamp(18px,2.3vw,21px); line-height:1.45; font-weight:700; color:#fff; }
.qz-vf { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.qz-ops { display:flex; flex-direction:column; gap:10px; }
.qz-op { display:flex; align-items:center; gap:12px; width:100%; min-height:52px; padding:9px 16px 9px 9px; border-radius:16px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.9); font-family:inherit; font-size:16px; line-height:1.4; font-weight:600; text-align:left; cursor:pointer; transition:border-color .15s, background .15s, color .15s, opacity .15s; }
.qz-vf .qz-op { justify-content:center; min-height:58px; padding:12px; font-size:17px; font-weight:800; }
.qz-op:hover:not(:disabled) { border-color:rgba(var(--qz-rgb),0.6); background:rgba(var(--qz-rgb),0.08); }
.qz-op:disabled { cursor:default; }
.qz-letra { flex-shrink:0; width:34px; height:34px; border-radius:50%; display:grid; place-items:center; font-size:14px; font-weight:800; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); }
.qz-op[data-r="bien"] { border-color:#4ADE80; background:rgba(74,222,128,0.12); color:#fff; }
.qz-op[data-r="bien"] .qz-letra { background:rgba(74,222,128,0.22); color:#4ADE80; }
.qz-op[data-r="mal"] { border-color:#F87171; background:rgba(248,113,113,0.12); color:#fff; }
.qz-op[data-r="mal"] .qz-letra { background:rgba(248,113,113,0.22); color:#F87171; }
.qz-op[data-r="revela"] { border-color:rgba(74,222,128,0.55); border-style:dashed; color:#fff; }
.qz-op[data-r="revela"] .qz-letra { background:rgba(74,222,128,0.14); color:#4ADE80; }
.qz-op[data-r="apagada"] { opacity:0.5; }
.qz-retro { padding:14px 18px; border-radius:16px; border-left:4px solid; font-size:16px; line-height:1.55; color:rgba(255,255,255,0.85); }
.qz-retro[data-r="bien"] { border-color:#4ADE80; background:rgba(74,222,128,0.08); }
.qz-retro[data-r="mal"] { border-color:#F87171; background:rgba(248,113,113,0.08); }
.qz-retro-titulo { display:flex; align-items:center; gap:8px; margin:0 0 4px; font-size:16px; font-weight:800; }
.qz-retro[data-r="bien"] .qz-retro-titulo { color:#4ADE80; }
.qz-retro[data-r="mal"] .qz-retro-titulo { color:#F87171; }
.qz-retro p { margin:0; }
.qz-retro .qz-retro-correcta { color:#fff; font-weight:600; }
.qz-retro .qz-retro-correcta + p { margin-top:6px; }
.qz-nav { display:flex; gap:10px; }
.qz-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:48px; padding:12px 20px; border-radius:14px; font-family:inherit; font-size:15px; font-weight:800; cursor:pointer; border:1.5px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.85); transition:background .15s, border-color .15s; }
.qz-btn:hover:not(:disabled) { border-color:rgba(255,255,255,0.28); }
.qz-btn-pri { flex:1; border:none; background:var(--qz-c); color:#011126; }
.qz-btn-pri:hover:not(:disabled) { filter:brightness(1.08); }
.qz-btn:disabled { background:rgba(255,255,255,0.06); border-color:transparent; color:rgba(255,255,255,0.42); cursor:not-allowed; }
.qz-btn:focus-visible, .qz-op:focus-visible, .qz-punto:focus-visible { outline:2px solid var(--qz-c); outline-offset:3px; }
.qz-resultado { padding:clamp(22px,4vw,34px) clamp(18px,4vw,32px); text-align:center; }
.qz-resultado[data-r="bien"] { border-color:rgba(74,222,128,0.28); background:rgba(74,222,128,0.06); }
.qz-resultado[data-r="mal"] { border-color:rgba(248,113,113,0.25); background:rgba(248,113,113,0.05); }
.qz-res-titulo { display:flex; align-items:center; justify-content:center; gap:10px; margin:0; font-size:clamp(20px,3vw,24px); font-weight:800; color:#fff; }
.qz-pct { margin:12px 0 8px; font-size:clamp(48px,9vw,64px); font-weight:900; line-height:1; letter-spacing:-0.04em; color:var(--qz-c); }
.qz-res-sub { margin:0; font-size:15px; line-height:1.5; color:rgba(255,255,255,0.72); }
.qz-chips { display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:16px; }
.qz-chip { display:inline-flex; align-items:center; gap:8px; padding:8px 14px; border-radius:999px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); font-size:14px; font-weight:700; color:#fff; }
.qz-chip small { font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); }
.qz-repaso { display:flex; flex-direction:column; gap:12px; padding:20px 22px; }
.qz-repaso h3 { margin:0; font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--qz-c); }
.qz-repaso-ok { margin:0; font-size:16px; line-height:1.5; color:rgba(255,255,255,0.82); }
.qz-fallo { padding:14px 16px; border-radius:16px; background:rgba(248,113,113,0.05); border:1px solid rgba(248,113,113,0.20); }
.qz-fallo p { margin:0; }
.qz-fallo .qz-fallo-enun { margin-bottom:8px; font-size:16px; line-height:1.45; font-weight:700; color:#fff; }
.qz-fallo .qz-fallo-dato { font-size:15px; line-height:1.45; color:rgba(255,255,255,0.75); }
.qz-fallo .qz-tuya { color:#F87171; font-weight:700; }
.qz-fallo .qz-buena { color:#4ADE80; font-weight:700; }
.qz-fallo .qz-fallo-exp { margin-top:6px; font-size:15px; line-height:1.5; color:rgba(255,255,255,0.68); }
.qz-acciones { display:flex; gap:10px; flex-wrap:wrap; }
.qz-acciones > * { flex:1 1 200px; }
.qz-hecho { display:flex; align-items:center; justify-content:center; gap:8px; min-height:48px; padding:12px 20px; border-radius:14px; background:rgba(74,222,128,0.10); border:1px solid rgba(74,222,128,0.25); color:#4ADE80; font-size:15px; font-weight:800; }
.qz-aviso { display:flex; align-items:flex-start; gap:12px; padding:12px 16px; border-radius:14px; background:rgba(var(--qz-rgb),0.08); border:1px solid rgba(var(--qz-rgb),0.22); font-size:15px; line-height:1.5; color:rgba(255,255,255,0.72); }
.qz-aviso svg { flex-shrink:0; margin-top:3px; color:var(--qz-c); }
.qz-aviso b { color:#fff; }
.qz-neutral { padding:clamp(24px,4vw,36px) clamp(18px,4vw,32px); text-align:center; }
.qz-neutral svg { display:block; margin:0 auto 14px; color:var(--qz-c); opacity:0.85; }
.qz-neutral h2 { margin:0 0 8px; font-size:clamp(20px,3vw,24px); font-weight:800; color:#fff; }
.qz-neutral p { margin:0 auto; max-width:460px; font-size:16px; line-height:1.55; color:rgba(255,255,255,0.68); }
@media (max-width:480px) {
  .qz-puntos { gap:5px; }
  .qz-punto { width:30px; height:30px; }
  .qz-portada .qz-tema { height:112px; }
  .qz-nav .qz-btn-ant span { display:none; }
  .qz-nav .qz-btn-ant { padding:12px 14px; }
}
`;

/** Variables CSS del acento de la materia. */
export function quizVars(color: AreaColor): React.CSSProperties {
  return { '--qz-c': color.hex, '--qz-rgb': color.rgba } as React.CSSProperties;
}

// ── Portada compacta ───────────────────────────────────────────────────────────

interface PortadaProps {
  urlImagen: string;
  imagenTematica: string;
  titulo: string;
  icono: ReactNode;
}

/**
 * Imagen de ambientación, ahora compacta para no empujar la pregunta fuera de
 * la pantalla. Misma cascada de siempre: lámina propia → imagen temática de la
 * materia → bloque temático sin <img> roto. Los SVG de placeholder ya no
 * existen en disco: cualquier url con "placeholder" cuenta como "sin lámina".
 */
export function PortadaQuiz({ urlImagen, imagenTematica, titulo, icono }: PortadaProps) {
  const [imgError, setImgError] = useState(false);
  const [imgTematicaError, setImgTematicaError] = useState(false);
  const tieneImagen = urlImagen.length > 0 && !/placeholder/i.test(urlImagen) && !imgError;

  if (tieneImagen) {
    return (
      <div className="qz-portada">
        <img className="qz-lamina" src={urlImagen} alt={titulo} onError={() => setImgError(true)} />
      </div>
    );
  }
  if (!imgTematicaError) {
    return (
      <div className="qz-portada">
        <img className="qz-tema" src={imagenTematica} alt={titulo} onError={() => setImgTematicaError(true)} />
        <div className="qz-velo" />
        <p>{titulo}</p>
      </div>
    );
  }
  return (
    <div className="qz-portada-vacia">
      {icono}
      <span>{titulo}</span>
    </div>
  );
}

// ── Progreso: rótulo, barra y puntos ───────────────────────────────────────────

export type ResultadoPunto = 'bien' | 'mal' | undefined;

interface ProgresoProps {
  /** Pregunta en pantalla, o null en la pantalla de resultado. */
  actual: number | null;
  /** Un resultado por pregunta (undefined = sin responder). */
  resultados: ResultadoPunto[];
  /** Si el punto i se puede tocar (solo preguntas ya vistas, o todas en revisión). */
  habilitado: (i: number) => boolean;
  onIr: (i: number) => void;
}

export function ProgresoQuiz({ actual, resultados, habilitado, onIr }: ProgresoProps) {
  const total = resultados.length;
  const respondidas = resultados.filter((r) => r !== undefined).length;
  const pct = total > 0 ? (respondidas / total) * 100 : 0;
  return (
    <div className="qz-progreso">
      <div className="qz-cabeza">
        <span className="qz-rotulo">
          {actual === null ? 'Resultado' : `Pregunta ${actual + 1} de ${total}`}
        </span>
        <span className="qz-cuenta">{respondidas} de {total} respondidas</span>
      </div>
      <div
        className="qz-barra"
        role="progressbar"
        aria-valuenow={respondidas}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${respondidas} de ${total} preguntas respondidas`}
      >
        <div style={{ width: `${pct}%` }} />
      </div>
      {total > 1 && (
        <nav className="qz-puntos" aria-label="Ir a una pregunta">
          {resultados.map((r, i) => {
            const puede = habilitado(i);
            const estadoTxt = r === 'bien' ? ', correcta' : r === 'mal' ? ', incorrecta' : puede ? '' : ', aún no disponible';
            return (
              <button
                key={i}
                type="button"
                className="qz-punto"
                data-r={r}
                disabled={!puede}
                aria-current={actual === i ? 'step' : undefined}
                aria-label={`Pregunta ${i + 1}${estadoTxt}`}
                onClick={() => onIr(i)}
              >
                {i + 1}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ── Retroalimentación inmediata ────────────────────────────────────────────────

interface RetroProps {
  bien: boolean;
  /** Título; por omisión «¡Correcto!» / «Incorrecto». */
  titulo?: string;
  /** Línea con la respuesta correcta (solo cuando se falló). */
  correcta?: ReactNode;
  explicacion?: string;
}

export function RetroQuiz({ bien, titulo, correcta, explicacion }: RetroProps) {
  return (
    <div className="qz-retro" data-r={bien ? 'bien' : 'mal'} role="status" aria-live="polite" aria-atomic="true">
      <p className="qz-retro-titulo">
        {bien ? <Check size={18} /> : <X size={18} />}
        {titulo ?? (bien ? '¡Correcto!' : 'Incorrecto')}
      </p>
      {correcta && <p className="qz-retro-correcta">{correcta}</p>}
      {explicacion && <p>{explicacion}</p>}
    </div>
  );
}

// ── Navegación anterior / siguiente ────────────────────────────────────────────

interface NavProps {
  puedeAnterior: boolean;
  onAnterior: () => void;
  puedeSiguiente: boolean;
  onSiguiente: () => void;
  esUltima: boolean;
  sigRef?: RefObject<HTMLButtonElement | null>;
}

export function NavQuiz({ puedeAnterior, onAnterior, puedeSiguiente, onSiguiente, esUltima, sigRef }: NavProps) {
  return (
    <div className="qz-nav">
      <button
        type="button"
        className="qz-btn qz-btn-ant"
        onClick={onAnterior}
        disabled={!puedeAnterior}
        aria-label="Pregunta anterior"
      >
        <ArrowLeft size={18} />
        <span>Anterior</span>
      </button>
      <button
        ref={sigRef}
        type="button"
        className="qz-btn qz-btn-pri"
        onClick={onSiguiente}
        disabled={!puedeSiguiente}
      >
        {!puedeSiguiente ? 'Elige una respuesta' : esUltima ? 'Ver resultado' : 'Siguiente'}
        {puedeSiguiente && <ArrowRight size={18} />}
      </button>
    </div>
  );
}

/**
 * Lleva el inicio del quiz a la vista si quedó arriba de la pantalla (en el
 * celular el alumno baja hasta «Siguiente» y la nueva pregunta empezaría
 * fuera de vista). No hace nada si ya está visible.
 */
export function asomarArriba(el: HTMLElement | null, suave: boolean) {
  if (!el) return;
  if (el.getBoundingClientRect().top < 0) {
    el.scrollIntoView?.({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
  }
}

/** Da el foco a un botón cuando ya se habilitó (tras el siguiente render). */
export function enfocarLuego(ref: RefObject<HTMLElement | null>) {
  if (typeof window === 'undefined') return;
  window.requestAnimationFrame(() => ref.current?.focus({ preventScroll: false }));
}
