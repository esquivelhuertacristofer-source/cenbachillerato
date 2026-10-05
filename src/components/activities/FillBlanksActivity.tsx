'use client';

/**
 * COMPLETA LOS ESPACIOS — el texto se lee como un párrafo normal y cada espacio
 * es un campo dentro de la línea, numerado y del ancho de la respuesta.
 *
 * Diseño (misma familia que LecturaGuiada): bloques con borde suave, acento de
 * la materia, letra legible (cuerpo 17 px, nada debajo de 13 px) y CSS en clases
 * propias. Las pistas ya no flotan sobre el texto (se salían de la pantalla en
 * celular): se abren en una franja bajo el párrafo. Al comprobar, cada espacio
 * se colorea y abajo aparece la revisión espacio por espacio.
 */

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

/**
 * Banco de palabras escrito dentro de las instrucciones («…del cuadro: am / is /
 * are» · «Choose from: better, usually, always»). Solo se acepta una lista de 3+
 * términos cortos; una frase después de dos puntos («Recuerda: tras estos…») no.
 * Si el banco cierra las instrucciones, se devuelven también las instrucciones
 * sin la lista para no repetirla.
 */
function extraerBanco(instrucciones: string): { banco: string[]; texto: string } {
  const banco: string[] = [];
  let texto = instrucciones;
  const regex = /:\s*([^:.()]+)/g;
  let m: RegExpExecArray | null;
  let segmentos = 0;
  let ultimoAlFinal = false;
  let inicioUltimo = -1;
  while ((m = regex.exec(instrucciones)) !== null) {
    const items = (m[1] ?? '').split(/\s*[\/,]\s*/).map(s => s.trim()).filter(Boolean);
    const esLista = items.length >= 3 && items.every(s => s.length <= 24 && s.split(/\s+/).length <= 4);
    if (!esLista) continue;
    segmentos++;
    for (const it of items) if (!banco.includes(it)) banco.push(it);
    const resto = instrucciones.slice(m.index + m[0].length).trim();
    ultimoAlFinal = resto === '' || resto === '.';
    inicioUltimo = m.index;
  }
  if (segmentos === 1 && ultimoAlFinal && inicioUltimo > 0) {
    texto = `${instrucciones.slice(0, inicioUltimo).trim()}:`;
  }
  return { banco, texto };
}

const CSS = `
.fb { display:flex; flex-direction:column; gap:20px; font-family:var(--font-epilogue), sans-serif; }
.fb-bloque { border-radius:22px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); }
.fb-aviso { display:flex; align-items:center; gap:12px; padding:14px 18px; border-radius:16px; background:rgba(99,102,241,0.12); border:1px solid rgba(99,102,241,0.28); }
.fb-aviso p { margin:0; font-size:15px; font-weight:700; color:#A5B4FC; line-height:1.4; }
.fb-amb { position:relative; overflow:hidden; border-radius:20px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); }
.fb-amb img { display:block; width:100%; height:clamp(140px, 30vw, 220px); object-fit:cover; }
.fb-amb::after { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(to top, rgba(1,17,38,0.55) 0%, rgba(1,17,38,0.08) 45%, transparent 70%); }
.fb-amb-sin { height:clamp(120px, 24vw, 160px); display:flex; align-items:center; justify-content:center; gap:12px; border-color:rgba(var(--fb-rgb),0.25); background:linear-gradient(135deg, rgba(var(--fb-rgb),0.14), rgba(var(--fb-rgb),0.04)); }
.fb-amb-sin i { font-size:28px; color:rgba(var(--fb-rgb),0.6); }
.fb-amb-sin::after { display:none; }
.fb-cab { padding:18px 22px; display:flex; gap:14px; align-items:flex-start; border-color:rgba(var(--fb-rgb),0.22); background:rgba(var(--fb-rgb),0.06); }
.fb-cab-ico { width:40px; height:40px; border-radius:12px; flex-shrink:0; display:grid; place-items:center; background:rgba(var(--fb-rgb),0.15); color:var(--fb-c); }
.fb-rotulo { margin:0 0 4px; font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--fb-c); }
.fb-instr { margin:0; font-size:16px; line-height:1.5; font-weight:600; color:#fff; }
.fb-estado { margin:6px 0 0; font-size:14px; font-weight:600; color:rgba(255,255,255,0.6); }
.fb-banco { margin-top:12px; display:flex; flex-wrap:wrap; gap:8px; }
.fb-chip { min-height:38px; padding:6px 14px; border-radius:999px; border:1px solid rgba(var(--fb-rgb),0.35); background:rgba(var(--fb-rgb),0.10); color:#fff; font-size:15px; font-weight:600; font-family:inherit; cursor:pointer; transition:background .15s, opacity .15s; }
.fb-chip:hover:not(:disabled) { background:rgba(var(--fb-rgb),0.20); }
.fb-chip[data-usada="si"] { opacity:0.5; }
.fb-chip:disabled { cursor:default; }
.fb-texto { padding:clamp(20px,4vw,34px) clamp(18px,4vw,38px); }
.fb-texto p { margin:0; max-width:72ch; font-size:17px; line-height:2.15; color:rgba(255,255,255,0.88); white-space:pre-line; overflow-wrap:break-word; }
.fb-h { display:inline-flex; align-items:center; gap:4px; vertical-align:baseline; white-space:nowrap; max-width:100%; margin:0 2px; }
.fb-num { display:inline-grid; place-items:center; min-width:22px; height:22px; padding:0 4px; border-radius:999px; font-size:13px; font-weight:800; line-height:1; background:rgba(var(--fb-rgb),0.16); color:var(--fb-c); }
.fb-h[data-r="bien"] .fb-num { background:rgba(74,222,128,0.18); color:#4ADE80; }
.fb-h[data-r="mal"] .fb-num { background:rgba(248,113,113,0.18); color:#F87171; }
.fb-in { max-width:min(100%, 60vw); min-width:4.5ch; height:1.75em; padding:0 8px; border:none; border-bottom:2px solid rgba(255,255,255,0.32); border-radius:8px 8px 2px 2px; background:rgba(255,255,255,0.06); color:#fff; font-size:17px; font-weight:700; font-family:inherit; text-align:center; outline:none; box-sizing:content-box; transition:border-color .2s, background .2s, color .2s; }
.fb-in::placeholder { color:rgba(255,255,255,0.3); font-weight:600; }
.fb-in:focus { border-bottom-color:var(--fb-c); background:rgba(var(--fb-rgb),0.12); box-shadow:0 0 0 2px rgba(var(--fb-rgb),0.30); }
.fb-h[data-lleno="si"] .fb-in { border-bottom-color:var(--fb-c); }
.fb-h[data-r="bien"] .fb-in { border-bottom-color:#4ADE80; color:#4ADE80; background:rgba(74,222,128,0.08); }
.fb-h[data-r="mal"] .fb-in { border-bottom-color:#F87171; color:#FCA5A5; background:rgba(248,113,113,0.08); }
.fb-h[data-r="revelada"] .fb-in { border-bottom-color:#FB923C; color:#FDBA74; background:rgba(251,146,60,0.08); }
.fb-pbtn { display:inline-grid; place-items:center; width:30px; height:30px; border-radius:50%; border:none; background:rgba(255,255,255,0.08); color:var(--fb-c); cursor:pointer; flex-shrink:0; }
.fb-pbtn:hover, .fb-pbtn[aria-expanded="true"] { background:rgba(var(--fb-rgb),0.22); }
.fb-pista { display:flex; align-items:flex-start; gap:10px; margin-top:18px; padding:12px 14px; border-radius:14px; background:rgba(var(--fb-rgb),0.10); border-left:4px solid var(--fb-c); }
.fb-pista p { margin:0; flex:1; font-size:16px; line-height:1.45; color:#fff; white-space:normal; }
.fb-pista b { color:var(--fb-c); }
.fb-pista svg { flex-shrink:0; margin-top:3px; color:var(--fb-c); }
.fb-pista button { border:none; background:transparent; color:rgba(255,255,255,0.6); cursor:pointer; padding:4px; min-width:32px; min-height:32px; display:grid; place-items:center; border-radius:8px; }
.fb-avance { display:flex; align-items:center; gap:14px; }
.fb-barra { flex:1; height:6px; border-radius:999px; background:rgba(255,255,255,0.08); overflow:hidden; }
.fb-barra > div { height:100%; border-radius:999px; background:var(--fb-c); transition:width .3s ease; }
.fb-avance span { font-size:14px; font-weight:700; color:rgba(255,255,255,0.6); white-space:nowrap; }
.fb-res { padding:18px 22px; display:flex; align-items:center; gap:16px; }
.fb-res[data-ok="si"] { background:rgba(74,222,128,0.08); border-color:rgba(74,222,128,0.30); border-left:4px solid #4ADE80; }
.fb-res[data-ok="no"] { background:rgba(251,146,60,0.07); border-color:rgba(251,146,60,0.25); border-left:4px solid #FB923C; }
.fb-res-txt { flex:1; }
.fb-res-txt small { display:block; font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:2px; }
.fb-res[data-ok="si"] small { color:#4ADE80; }
.fb-res[data-ok="no"] small { color:#FB923C; }
.fb-res-txt strong { font-size:clamp(20px,3vw,24px); color:#fff; }
.fb-rev { padding:16px 20px; }
.fb-rev ol { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.fb-rev li { display:flex; align-items:baseline; gap:10px; font-size:15px; line-height:1.45; color:rgba(255,255,255,0.82); }
.fb-rev li .fb-num { flex-shrink:0; }
.fb-rev li svg { flex-shrink:0; align-self:center; }
.fb-rev s { color:rgba(255,255,255,0.5); }
.fb-rev em { font-style:normal; font-weight:700; color:#4ADE80; }
.fb-acciones { display:flex; flex-direction:column; gap:10px; }
.fb-dos { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.fb-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; min-height:52px; padding:14px 20px; border-radius:16px; border:none; font-size:16px; font-weight:800; font-family:inherit; cursor:pointer; transition:filter .15s, transform .15s, background .2s; }
.fb-btn-pri { background:var(--fb-c); color:#011126; }
.fb-btn-pri:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
.fb-btn-pri:disabled { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.45); cursor:not-allowed; }
.fb-btn-sec { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.14); color:rgba(255,255,255,0.85); font-weight:700; }
.fb-btn-sec:hover { background:rgba(255,255,255,0.10); }
.fb-btn:focus-visible, .fb-chip:focus-visible, .fb-pbtn:focus-visible { outline:2px solid var(--fb-c); outline-offset:3px; }
.fb-spin { animation:fb-spin 1s linear infinite; }
@keyframes fb-spin { to { transform:rotate(360deg); } }
@media (max-width:640px) {
  .fb-cab { padding:16px; }
  .fb-texto p { font-size:16.5px; line-height:2.2; }
  .fb-in { font-size:16.5px; }
  .fb-dos { grid-template-columns:1fr; }
}
`;

// ── HuecoInput ─────────────────────────────────────────────────────────────────

interface HuecoInputProps {
  indice: number;
  valor: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
  verificado: boolean;
  reveladas: boolean;
  esCorrecta: boolean | null;
  respuestaCorrecta: string;
  tienePista: boolean;
  pistaVisible: boolean;
  onTogglePista: () => void;
  shakingAll: boolean;
  disabled: boolean;
  reducedMotion: boolean;
}

function HuecoInput({
  indice, valor, onChange, onFocus, inputRef, verificado, reveladas,
  esCorrecta, respuestaCorrecta, tienePista, pistaVisible, onTogglePista,
  shakingAll, disabled, reducedMotion,
}: HuecoInputProps) {
  const valorMostrado = reveladas ? respuestaCorrecta : valor;
  const r = reveladas ? 'revelada' : esCorrecta === true ? 'bien' : esCorrecta === false ? 'mal' : undefined;
  // Ancho del campo ≈ largo de la respuesta esperada (como antes), en caracteres.
  const ancho = Math.max(respuestaCorrecta.length * 0.75 + 1, 4.5);

  return (
    <motion.span
      className="fb-h"
      data-r={r}
      data-lleno={valor.trim() ? 'si' : undefined}
      animate={shakingAll && esCorrecta === false && !reducedMotion
        ? { x: [0, -6, 6, -4, 4, 0] }
        : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="fb-num" aria-hidden="true">{indice + 1}</span>
      <input
        ref={inputRef}
        className="fb-in"
        type="text"
        value={valorMostrado}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        readOnly={disabled || reveladas || verificado}
        placeholder="…"
        aria-label={`Hueco ${indice + 1}`}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{ width: `${ancho}ch` }}
      />
      {esCorrecta === true && !reveladas && <Check size={18} color="#4ADE80" aria-label="Correcto" />}
      {esCorrecta === false && !reveladas && <X size={18} color="#F87171" aria-label="Incorrecto" />}
      {tienePista && !verificado && !reveladas && !disabled && (
        <button
          type="button"
          className="fb-pbtn"
          onClick={onTogglePista}
          aria-expanded={pistaVisible}
          aria-label={`Pista para hueco ${indice + 1}`}
        >
          <Lightbulb size={15} />
        </button>
      )}
    </motion.span>
  );
}

// ── Imagen de ambientación ─────────────────────────────────────────────────────

function Ambientacion({ url, tematica, titulo }: { url: string; tematica: string; titulo: string }) {
  const [imgError, setImgError] = useState(false);
  const [imgTematicaError, setImgTematicaError] = useState(false);
  // Los SVG de placeholder ya no existen en disco; cualquier url que contenga
  // "placeholder" se trata como "sin lámina" para ir directo a la imagen temática.
  const tieneImagen = url.length > 0 && !/placeholder/i.test(url) && !imgError;
  if (tieneImagen) {
    return (
      <div className="fb-amb">
        <img src={url} alt={titulo} onError={() => setImgError(true)} />
      </div>
    );
  }
  if (!imgTematicaError) {
    return (
      <div className="fb-amb">
        <img src={tematica} alt={titulo} onError={() => setImgTematicaError(true)} />
      </div>
    );
  }
  // Fallback honesto si tampoco hay imagen temática en disco: bloque sin <img> roto.
  return (
    <div className="fb-amb fb-amb-sin" aria-hidden="true">
      <TextCursor size={30} />
    </div>
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
  const instrucciones = contenido.instrucciones ?? 'Completa los espacios con la palabra correcta';
  const { banco, texto: instruccionesSinBanco } = extraerBanco(instrucciones);

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
  const [activo, setActivo] = useState<number | null>(null);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

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
  const editable = !verificado && !reveladas && !modoRevision;

  function actualizarRespuesta(i: number, valor: string) {
    if (verificado || reveladas) return;
    setRespuestas(prev => { const n = [...prev]; n[i] = valor; return n; });
  }

  /** Toca una palabra del banco → va al espacio activo (o al primero vacío). */
  function usarDelBanco(palabra: string) {
    if (!editable) return;
    const destino = activo ?? respuestas.findIndex(r => r.trim() === '');
    if (destino < 0 || destino >= numHuecos) return;
    actualizarRespuesta(destino, palabra);
    // Siguiente espacio vacío después del que se llenó.
    const sig = respuestas.findIndex((r, i) => i > destino && r.trim() === '');
    const foco = sig >= 0 ? sig : destino;
    setActivo(foco);
    inputs.current[foco]?.focus();
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

  const pistaActual = pistaVisible !== null ? contenido.huecos[pistaVisible]?.pista : undefined;

  return (
    <div
      className="fb"
      style={{ '--fb-c': color.hex, '--fb-rgb': color.rgba } as React.CSSProperties}
    >
      <style>{CSS}</style>

      {/* Aviso de revisión */}
      {modoRevision && (
        <div className="fb-aviso">
          <Eye size={18} color="#A5B4FC" style={{ flexShrink: 0 }} />
          <p>
            {revisionSinDetalle
              ? 'Entrega registrada — la revisión detallada no está disponible'
              : 'Ya completaste esta actividad · Revisando tus respuestas anteriores'}
          </p>
        </div>
      )}

      <Ambientacion url={contenido.url_imagen ?? ''} tematica={imagenTematica} titulo={actividad.titulo} />

      {/* Consigna + banco de palabras */}
      <div className="fb-bloque fb-cab">
        <div className="fb-cab-ico" aria-hidden="true"><TextCursor size={20} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="fb-rotulo">Completa los espacios</p>
          <p className="fb-instr">{instruccionesSinBanco}</p>
          <p className="fb-estado">
            {revisionSinDetalle
              ? 'Entrega registrada'
              : verificado ? `${aciertos} / ${numHuecos} correctos` : `${llenos} / ${numHuecos} huecos completados`}
          </p>
          {banco.length > 0 && (
            <div className="fb-banco" role="group" aria-label="Banco de palabras">
              {banco.map(p => {
                const usada = respuestas.some(r => r.trim().toLowerCase() === p.toLowerCase());
                return (
                  <button
                    key={p}
                    type="button"
                    className="fb-chip"
                    data-usada={usada ? 'si' : undefined}
                    disabled={!editable}
                    // Conserva el foco del espacio activo al tocar la palabra.
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => usarDelBanco(p)}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Texto con los espacios dentro de la línea */}
      <div className="fb-bloque fb-texto">
        <p>
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
                onFocus={() => setActivo(idx)}
                inputRef={el => { inputs.current[idx] = el; }}
                verificado={verificado}
                reveladas={reveladas}
                esCorrecta={getEsCorrecta(idx)}
                respuestaCorrecta={hueco.respuesta_correcta}
                tienePista={!!hueco.pista}
                pistaVisible={pistaVisible === idx}
                onTogglePista={() => setPistaVisible(p => p === idx ? null : idx)}
                shakingAll={shakingAll}
                disabled={modoRevision}
                reducedMotion={reducedMotion}
              />
            );
          })}
        </p>

        {/* Pista del espacio elegido: bajo el párrafo, nunca encima del texto */}
        {pistaActual && pistaVisible !== null && !verificado && (
          <div className="fb-pista" aria-live="polite">
            <Lightbulb size={18} />
            <p><b>Pista · espacio {pistaVisible + 1}:</b> {pistaActual}</p>
            <button type="button" onClick={() => setPistaVisible(null)} aria-label="Cerrar pista">
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Avance — oculto en revisión: en el estado neutral (sin respuestas
          guardadas) "0 / N completados" sugeriría trabajo perdido */}
      {!verificado && !modoRevision && (
        <div className="fb-avance">
          <div
            className="fb-barra"
            role="progressbar"
            aria-valuenow={llenos}
            aria-valuemin={0}
            aria-valuemax={numHuecos}
            aria-label={`${llenos} de ${numHuecos} huecos completados`}
          >
            <div style={{ width: `${pct}%` }} />
          </div>
          <span>{llenos} / {numHuecos} completados</span>
        </div>
      )}

      {/* Resultado + revisión espacio por espacio */}
      <AnimatePresence>
        {verificado && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.gentle}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div
              className="fb-bloque fb-res"
              data-ok={todosCorrectos ? 'si' : 'no'}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="fb-res-txt">
                <small>{todosCorrectos ? '¡Todos correctos!' : 'Resultado'}</small>
                <strong>{aciertos} / {numHuecos} aciertos</strong>
              </div>
              {todosCorrectos && <CheckCircle size={36} color="#4ADE80" aria-hidden="true" />}
            </div>

            {!todosCorrectos && (
              <div className="fb-bloque fb-rev">
                <ol aria-label="Revisión por espacio">
                  {contenido.huecos.map((h, i) => {
                    const ok = resultados[i] === true;
                    const tuya = (respuestas[i] ?? '').trim();
                    return (
                      <li key={i}>
                        <span className="fb-num" aria-hidden="true">{i + 1}</span>
                        {ok ? <Check size={16} color="#4ADE80" /> : <X size={16} color="#F87171" />}
                        <span>
                          {ok
                            ? <>{tuya}</>
                            : <>{tuya ? <s>{tuya}</s> : <s>(vacío)</s>} → <em>{h.respuesta_correcta}</em></>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Acciones */}
      {!modoRevision && (
        <div className="fb-acciones">
          {!verificado && (
            <button
              type="button"
              className="fb-btn fb-btn-pri"
              onClick={handleVerificar}
              disabled={!todosLlenos}
            >
              <Check size={18} />
              {todosLlenos
                ? 'Verificar respuestas'
                : numHuecos - llenos === 1 ? 'Falta 1 espacio' : `Faltan ${numHuecos - llenos} espacios`}
            </button>
          )}

          {verificado && !todosCorrectos && !reveladas && (
            <div className="fb-dos">
              <button type="button" className="fb-btn fb-btn-sec" onClick={handleReintentar}>
                <RotateCcw size={17} />
                Volver a intentar
              </button>
              <button type="button" className="fb-btn fb-btn-sec" onClick={() => setReveladas(true)}>
                <Eye size={17} />
                Ver respuestas correctas
              </button>
            </div>
          )}

          {(todosCorrectos || reveladas) && (
            <button
              type="button"
              className="fb-btn fb-btn-pri"
              onClick={handleEntregar}
              disabled={entregando}
            >
              {entregando
                ? <><Loader2 size={18} className="fb-spin" /> Registrando...</>
                : <><ArrowRight size={18} /> Continuar</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
