'use client';

/**
 * REFLEXIÓN ESCRITA — consigna corta y destacada arriba, el área de texto justo
 * debajo y, en pantallas anchas, la pregunta guía fija a un lado mientras se
 * escribe. Las consignas largas (productos integradores de miles de caracteres)
 * enseñan solo su arranque y el resto se abre con «Ver instrucciones completas»,
 * con las listas del texto convertidas en viñetas.
 *
 * Diseño de la familia de LecturaGuiada: bloques con borde suave, acento de la
 * materia, letra legible (cuerpo 16–17 px, nada debajo de 13 px), CSS en clases.
 */

import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Clock, CheckCircle, Lightbulb, ClipboardList, Loader2, Send, RotateCcw, ImageOff, ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import { celebrate } from '@/lib/motion/celebrate';
import type { ActividadReflexionEscrita, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { imagenDeLectura } from '@/lib/contenido/lectura-imagenes';

const FALLBACK_COLOR: AreaColor = {
  hex: '#F87171', rgba: '248,113,113', faIcon: 'fa-feather-pointed', gradient: '',
};

interface Props {
  actividad: ActividadReflexionEscrita;
  onProgreso?: CallbackProgreso;
  /** Código de la UAC, para elegir una imagen temática cuando no hay lámina propia. */
  uacCodigo?: string;
  color?: AreaColor;
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string>;
}

const FORMATOS: Record<string, string> = {
  ensayo: 'Ensayo', carta: 'Carta', diario: 'Diario', descripcion: 'Descripción',
};

// ── Consigna: arranque visible + resto plegable ───────────────────────────────

/** Hasta qué largo la consigna se muestra completa (con viñetas si trae listas). */
const LARGO_SIN_PLEGAR = 900;

/** Corta `p` en el último fin de oración antes de `max` (o no corta). */
function cortarOracion(p: string, max: number): [string, string] {
  const trozo = p.slice(0, max);
  let corte = -1;
  const re = /[.!?:](\s|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(trozo)) !== null) {
    if (m.index >= 60) corte = m.index + 1;
  }
  if (corte < 0) return ['', p];
  return [p.slice(0, corte).trim(), p.slice(corte).trim()];
}

function partirConsigna(prompt: string): { lead: string; resto: string } {
  const t = prompt.trim();
  if (t.length <= LARGO_SIN_PLEGAR) return { lead: t, resto: '' };
  const paras = t.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  let lead = '';
  let i = 0;
  while (i < paras.length && lead.length < 140) {
    const sep = lead ? '\n\n' : '';
    const p = paras[i] ?? '';
    if ((lead + sep + p).length <= 520) {
      lead += sep + p;
      i++;
      continue;
    }
    let [cabeza, cola] = cortarOracion(p, 520 - lead.length - sep.length);
    if (!cabeza && !lead) {
      // Primer párrafo enorme y sin puntos: cortar en un espacio para no
      // enseñar un muro de miles de caracteres.
      const esp = p.lastIndexOf(' ', 420);
      if (esp > 120) { cabeza = `${p.slice(0, esp)}…`; cola = `…${p.slice(esp + 1)}`; }
    }
    if (cabeza) {
      lead += sep + cabeza;
      paras[i] = cola;
      if (!cola) i++;
    }
    break;
  }
  if (!lead) return { lead: t, resto: '' };
  return { lead, resto: paras.slice(i).join('\n\n') };
}

/** Preguntas «¿…?» de la consigna: lo que hay que responder, a la vista al escribir. */
function preguntasGuia(prompt: string): string[] {
  const qs = prompt.match(/¿[^?¿]{3,}\?/g) ?? [];
  return qs.length >= 1 && qs.length <= 6 ? qs.map(q => q.replace(/\s+/g, ' ').trim()) : [];
}

const RE_VINETA = /^\s*(?:[-•*]|\d{1,2}[).]|[A-Za-z][).])\s+/;

/** Texto plano → párrafos, subtítulos en MAYÚSCULAS y viñetas. Nada de HTML crudo. */
function TextoEstructurado({ texto }: { texto: string }) {
  const bloques: ReactNode[] = [];
  let lista: string[] = [];
  let parrafo: string[] = [];
  const cerrarLista = () => {
    if (lista.length) {
      bloques.push(<ul key={`l${bloques.length}`}>{lista.map((l, k) => <li key={k}>{l}</li>)}</ul>);
      lista = [];
    }
  };
  const cerrarParrafo = () => {
    if (parrafo.length) {
      bloques.push(<p key={`p${bloques.length}`}>{parrafo.join(' ')}</p>);
      parrafo = [];
    }
  };
  for (const linea of texto.split('\n')) {
    const l = linea.trim();
    if (!l) { cerrarParrafo(); cerrarLista(); continue; }
    if (RE_VINETA.test(l)) {
      cerrarParrafo();
      lista.push(l.replace(/^\s*[-•*]\s+/, ''));
      continue;
    }
    const letras = l.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, '');
    const esTitulo = l.length <= 90 && letras.length >= 4 && letras === letras.toUpperCase();
    if (esTitulo) {
      cerrarParrafo(); cerrarLista();
      bloques.push(<p key={`t${bloques.length}`} className="rf-sub">{l.replace(/:$/, '')}</p>);
      continue;
    }
    cerrarLista();
    parrafo.push(l);
  }
  cerrarParrafo(); cerrarLista();
  return <div className="rf-estructura">{bloques}</div>;
}

const CSS = `
.rf { display:flex; flex-direction:column; gap:20px; font-family:var(--font-epilogue), sans-serif; }
.rf-bloque { border-radius:22px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); }
.rf-aviso { display:flex; align-items:flex-start; gap:12px; padding:14px 18px; border-radius:16px; background:rgba(99,102,241,0.12); border:1px solid rgba(99,102,241,0.28); }
.rf-aviso svg { flex-shrink:0; margin-top:2px; }
.rf-aviso p { margin:0; font-size:15px; font-weight:700; color:#A5B4FC; }
.rf-aviso p + p { margin-top:2px; font-size:14px; font-weight:500; color:rgba(255,255,255,0.65); line-height:1.45; }
.rf-amb { position:relative; overflow:hidden; border-radius:20px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); }
.rf-amb img { display:block; width:100%; height:clamp(140px, 30vw, 220px); object-fit:cover; }
.rf-amb::after { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(to top, rgba(1,17,38,0.55) 0%, rgba(1,17,38,0.08) 45%, transparent 70%); }
.rf-amb-sin { height:clamp(120px, 24vw, 160px); display:flex; align-items:center; justify-content:center; color:var(--rf-c); border-color:rgba(var(--rf-rgb),0.25); background:linear-gradient(135deg, rgba(var(--rf-rgb),0.14), rgba(var(--rf-rgb),0.04)); }
.rf-amb-sin::after { display:none; }
.rf-consigna { padding:clamp(18px,3.5vw,28px) clamp(18px,3.5vw,30px); border-color:rgba(var(--rf-rgb),0.22); background:rgba(var(--rf-rgb),0.06); border-left:4px solid var(--rf-c); }
.rf-cab { display:flex; align-items:center; flex-wrap:wrap; gap:8px 10px; margin-bottom:12px; }
.rf-rotulo { display:flex; align-items:center; gap:8px; margin:0; font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--rf-c); }
.rf-chip { font-size:13px; font-weight:700; padding:3px 10px; border-radius:999px; color:var(--rf-c); background:rgba(var(--rf-rgb),0.12); border:1px solid rgba(var(--rf-rgb),0.25); }
.rf-lead { font-size:17px; line-height:1.55; font-weight:600; color:#fff; }
.rf-estructura p { margin:0 0 10px; }
.rf-estructura p:last-child, .rf-estructura ul:last-child { margin-bottom:0; }
.rf-estructura ul { margin:0 0 10px; padding:0; list-style:none; display:flex; flex-direction:column; gap:6px; }
.rf-estructura li { position:relative; padding-left:18px; }
.rf-estructura li::before { content:''; position:absolute; left:2px; top:0.62em; width:6px; height:6px; border-radius:50%; background:var(--rf-c); }
.rf-estructura .rf-sub { margin-top:14px; font-size:14px; font-weight:800; letter-spacing:0.05em; color:var(--rf-c); }
.rf-mas { margin-top:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px; }
.rf-mas > summary, .rf-det > summary { list-style:none; display:flex; align-items:center; gap:8px; min-height:44px; cursor:pointer; font-size:15px; font-weight:700; color:var(--rf-c); }
.rf-mas > summary::-webkit-details-marker, .rf-det > summary::-webkit-details-marker { display:none; }
.rf-mas > summary svg:last-child, .rf-det > summary svg:last-child { margin-left:auto; transition:transform .2s; }
.rf-mas[open] > summary svg:last-child, .rf-det[open] > summary svg:last-child { transform:rotate(180deg); }
.rf-mas .rf-estructura { margin-top:8px; font-size:16px; line-height:1.6; color:rgba(255,255,255,0.82); max-height:min(60vh, 520px); overflow:auto; padding-right:6px; }
.rf-grid { display:grid; grid-template-columns:1fr; gap:20px; }
@media (min-width:900px) {
  .rf-grid { grid-template-columns:minmax(0,1fr) 300px; align-items:start; }
  .rf-lado { position:sticky; top:88px; }
}
.rf-editor { display:flex; flex-direction:column; gap:12px; }
.rf-ta { width:100%; min-height:clamp(220px, 42vh, 380px); box-sizing:border-box; padding:18px 20px; border-radius:18px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.92); font-size:17px; line-height:1.65; font-family:inherit; resize:vertical; transition:border-color .25s, box-shadow .25s; }
.rf-ta::placeholder { color:rgba(255,255,255,0.38); }
.rf-ta[data-ok="si"] { border-color:rgba(var(--rf-rgb),0.40); }
.rf-ta:focus { outline:none; border-color:rgba(var(--rf-rgb),0.55); box-shadow:0 0 0 3px rgba(var(--rf-rgb),0.12); }
.rf-ta[readonly], .rf-ta:disabled { opacity:0.8; cursor:default; }
.rf-cont { display:flex; align-items:center; flex-wrap:wrap; gap:8px 14px; }
.rf-barra { flex:1 1 140px; height:6px; border-radius:999px; background:rgba(255,255,255,0.08); overflow:hidden; }
.rf-barra > div { height:100%; border-radius:999px; background:var(--rf-c); transition:width .3s ease, background .4s ease; }
.rf-barra[data-ok="si"] > div { background:#4ADE80; }
.rf-cuenta { font-size:14px; font-weight:700; color:rgba(255,255,255,0.6); white-space:nowrap; font-variant-numeric:tabular-nums; }
.rf-cuenta[data-ok="si"] { color:#4ADE80; }
.rf-meta { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.55); white-space:nowrap; }
.rf-meta[data-tono="ok"] { color:#4ADE80; }
.rf-meta[data-tono="aviso"] { color:#FBBF24; }
.rf-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; min-height:52px; padding:14px 20px; border-radius:16px; border:none; font-size:16px; font-weight:800; font-family:inherit; cursor:pointer; background:var(--rf-c); color:#011126; transition:filter .15s, transform .15s, background .2s; }
.rf-btn:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
.rf-btn:disabled { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.5); cursor:not-allowed; }
.rf-btn:focus-visible, .rf-mas > summary:focus-visible, .rf-det > summary:focus-visible { outline:2px solid var(--rf-c); outline-offset:3px; border-radius:8px; }
.rf-lado { display:flex; flex-direction:column; gap:12px; }
.rf-guia { padding:16px 18px; border-color:rgba(var(--rf-rgb),0.22); }
.rf-guia .rf-rotulo { margin-bottom:10px; }
.rf-guia ul { margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:8px; }
.rf-guia li { position:relative; padding-left:16px; font-size:15px; line-height:1.45; color:rgba(255,255,255,0.88); }
.rf-guia li::before { content:''; position:absolute; left:0; top:0.6em; width:6px; height:6px; border-radius:50%; background:var(--rf-c); }
.rf-guia > p { margin:0; font-size:15px; line-height:1.5; color:rgba(255,255,255,0.85); display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden; }
.rf-det { padding:4px 18px; }
.rf-det[open] { padding-bottom:16px; }
.rf-det > summary { color:rgba(255,255,255,0.88); }
.rf-det > summary .rf-ico { color:var(--rf-c); }
.rf-det ol, .rf-det ul { margin:4px 0 0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px; }
.rf-det li { display:flex; gap:10px; align-items:flex-start; font-size:15px; line-height:1.45; color:rgba(255,255,255,0.78); }
.rf-det li i { flex-shrink:0; display:grid; place-items:center; width:24px; height:24px; border-radius:8px; font-style:normal; font-size:13px; font-weight:800; background:rgba(var(--rf-rgb),0.15); color:var(--rf-c); }
.rf-tiempo { display:flex; align-items:center; gap:8px; padding:0 4px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.5); }
.rf-neutro { min-height:220px; padding:40px 28px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; text-align:center; }
.rf-neutro p { margin:0; }
.rf-neutro p:first-of-type { font-size:17px; font-weight:800; color:rgba(255,255,255,0.92); }
.rf-neutro p + p { font-size:15px; line-height:1.55; color:rgba(255,255,255,0.6); max-width:420px; }
.rf-spin { animation:rf-spin 1s linear infinite; }
@keyframes rf-spin { to { transform:rotate(360deg); } }
@media (max-width:899px) {
  .rf-guia { display:none; }
}
@media (max-width:640px) {
  .rf-lead { font-size:16.5px; }
  .rf-ta { padding:14px 16px; font-size:16.5px; }
}
`;

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

// ── Imagen de ambientación ─────────────────────────────────────────────────────

function Ambientacion({ url, tematica, titulo }: { url: string; tematica: string; titulo: string }) {
  const [imgError, setImgError] = useState(false);
  const [imgTematicaError, setImgTematicaError] = useState(false);
  // Los SVG de placeholder ya no existen en disco; cualquier url que contenga
  // "placeholder" se trata como "sin lámina" para ir directo a la imagen temática.
  const tieneImagen = url.length > 0 && !/placeholder/i.test(url) && !imgError;
  if (tieneImagen) {
    return (
      <div className="rf-amb">
        <img src={url} alt={titulo} onError={() => setImgError(true)} />
      </div>
    );
  }
  if (!imgTematicaError) {
    return (
      <div className="rf-amb">
        <img src={tematica} alt={titulo} onError={() => setImgTematicaError(true)} />
      </div>
    );
  }
  // Fallback honesto si tampoco hay imagen temática en disco: bloque sin <img> roto.
  return (
    <div className="rf-amb rf-amb-sin" aria-hidden="true">
      <ImageOff size={30} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ReflexionEscritaActivity({
  actividad,
  onProgreso,
  uacCodigo,
  color = FALLBACK_COLOR,
  estado,
  respuestasIntento,
}: Props) {
  const { contenido } = actividad;
  const minPalabras = contenido.longitud_minima_palabras ?? 80;
  const maxPalabras = contenido.longitud_maxima_palabras;
  const modoRevision = estado === 'completada';
  const reducedMotion = useReducedMotion();

  const textoInicial = modoRevision ? (respuestasIntento?.texto ?? '') : '';
  // Estado neutral de revisión: el intento existe pero el texto guardado no
  // está disponible (`respuestas` null en BD, o próximamente texto largo
  // externo ausente). Sin este guard mostrábamos un textarea vacío con
  // "0 / N palabras", como si la entrega se hubiera perdido.
  const revisionSinDetalle = modoRevision && textoInicial.trim() === '';
  const [texto, setTexto] = useState(textoInicial);
  const [enviando, setEnviando] = useState(false);

  // Sin lámina propia → imagen temática con licencia libre acorde a la materia.
  const imagenTematica = imagenDeLectura(uacCodigo, actividad.titulo);

  const { lead, resto } = partirConsigna(contenido.prompt ?? '');
  const preguntas = preguntasGuia(contenido.prompt ?? '');
  const formato = contenido.formato_esperado && contenido.formato_esperado !== 'libre'
    ? FORMATOS[contenido.formato_esperado] ?? contenido.formato_esperado
    : null;
  const extension = maxPalabras ? `${minPalabras}–${maxPalabras} palabras` : `Mínimo ${minPalabras} palabras`;

  const palabras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;
  const pct = Math.min(100, minPalabras > 0 ? Math.round((palabras / minPalabras) * 100) : 100);
  const cumpleMinimo = palabras >= minPalabras;
  const pasaMaximo = !!maxPalabras && palabras > maxPalabras;

  async function handleEnviar() {
    if (!cumpleMinimo || enviando || modoRevision) return;
    setEnviando(true);
    void celebrate('medium');
    const res = await onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: { texto },
    });
    // En éxito el runner navega y desmonta; si la entrega falló, rehabilitamos.
    if (res && !res.ok) setEnviando(false);
  }

  const criterios = contenido.criterios_evaluacion ?? [];
  const pistas = contenido.pistas ?? [];

  return (
    <div
      className="rf"
      style={{ '--rf-c': color.hex, '--rf-rgb': color.rgba } as React.CSSProperties}
    >
      <style>{CSS}</style>

      {/* Aviso de revisión */}
      <AnimatePresence>
        {modoRevision && (
          <motion.div
            className="rf-aviso"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.gentle}
          >
            <RotateCcw size={18} color="#A5B4FC" />
            <div>
              <p>{revisionSinDetalle ? 'Entrega registrada' : 'Revisando tu entrega anterior'}</p>
              <p>
                {revisionSinDetalle
                  ? 'La revisión detallada no está disponible, pero tu reflexión quedó registrada al entregarla.'
                  : 'Esta es la reflexión que enviaste. Puedes leerla pero no editarla.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Ambientacion url={contenido.url_imagen ?? ''} tematica={imagenTematica} titulo={actividad.titulo} />

      {/* Consigna: corta y destacada; lo largo, plegado */}
      <section className="rf-bloque rf-consigna" aria-label="Consigna">
        <div className="rf-cab">
          <p className="rf-rotulo"><PenLine size={16} /> Tu reflexión</p>
          {formato && <span className="rf-chip">{formato}</span>}
          <span className="rf-chip">{extension}</span>
        </div>
        <div className="rf-lead"><TextoEstructurado texto={lead} /></div>
        {resto && (
          <details className="rf-mas">
            <summary>
              <ClipboardList size={17} />
              Ver instrucciones completas
              <ChevronDown size={18} />
            </summary>
            <TextoEstructurado texto={resto} />
          </details>
        )}
      </section>

      <div className="rf-grid">
        {/* ── Editor ── */}
        <div className="rf-editor">
          {revisionSinDetalle ? (
            /* Estado neutral: no hay texto que mostrar. Evitamos el textarea
               vacío y el contador "0 / N palabras", que sugerían una entrega
               perdida o fallida. */
            <div className="rf-bloque rf-neutro">
              <CheckCircle size={36} color={color.hex} style={{ opacity: 0.8 }} />
              <p>Entrega registrada</p>
              <p>La revisión detallada no está disponible para este intento.</p>
            </div>
          ) : (
            <>
              <textarea
                className="rf-ta"
                data-ok={cumpleMinimo ? 'si' : undefined}
                value={texto}
                onChange={e => setTexto(e.target.value)}
                readOnly={modoRevision || enviando}
                disabled={enviando}
                aria-label="Tu reflexión"
                placeholder="Escribe aquí tu reflexión con tus propias palabras…"
              />

              {/* Contador discreto */}
              <div className="rf-cont">
                <div className="rf-barra" data-ok={cumpleMinimo ? 'si' : undefined} aria-hidden="true">
                  <div style={{ width: `${pct}%` }} />
                </div>
                <span className="rf-cuenta" data-ok={cumpleMinimo ? 'si' : undefined}>
                  {palabras} / {minPalabras} palabras
                </span>
                {pasaMaximo ? (
                  <span className="rf-meta" data-tono="aviso">Pasaste el máximo de {maxPalabras}</span>
                ) : cumpleMinimo ? (
                  <span className="rf-meta" data-tono="ok"><CheckCircle size={14} /> Mínimo alcanzado</span>
                ) : null}
                <span className="rf-meta" title="Tiempo dedicado">
                  <Clock size={14} /> <TiempoDedicado paused={enviando || modoRevision} />
                </span>
              </div>

              {!modoRevision && (
                <button
                  type="button"
                  className="rf-btn"
                  onClick={handleEnviar}
                  disabled={!cumpleMinimo || enviando}
                >
                  {enviando ? (
                    <><Loader2 size={18} className="rf-spin" /> Entregando...</>
                  ) : cumpleMinimo ? (
                    <><Send size={18} /> Entregar reflexión</>
                  ) : minPalabras - palabras === 1 ? (
                    'Falta 1 palabra'
                  ) : (
                    `Faltan ${minPalabras - palabras} palabras`
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Lado: pregunta guía (fija en escritorio), ideas y criterios ── */}
        <aside className="rf-lado" aria-label="Apoyos para escribir">
          {!revisionSinDetalle && (
            <div className="rf-bloque rf-guia">
              <p className="rf-rotulo"><MessageCircleQuestion size={16} /> Responde a esto</p>
              {preguntas.length > 0 ? (
                <ul>{preguntas.map((q, i) => <li key={i}>{q}</li>)}</ul>
              ) : (
                <p>{lead.replace(/\s+/g, ' ')}</p>
              )}
            </div>
          )}

          {pistas.length > 0 && (
            <details className="rf-bloque rf-det">
              <summary>
                <Lightbulb size={17} className="rf-ico" />
                Ideas para empezar ({pistas.length})
                <ChevronDown size={18} />
              </summary>
              <ol>
                {pistas.map((pista, i) => (
                  <li key={i}><i>{i + 1}</i><span>{pista}</span></li>
                ))}
              </ol>
            </details>
          )}

          {criterios.length > 0 && (
            <details className="rf-bloque rf-det">
              <summary>
                <ClipboardList size={17} className="rf-ico" />
                Cómo se evalúa ({criterios.length})
                <ChevronDown size={18} />
              </summary>
              <ul>
                {criterios.map((criterio, i) => (
                  <li key={i}><i><CheckCircle size={13} /></i><span>{criterio}</span></li>
                ))}
              </ul>
            </details>
          )}
        </aside>
      </div>
    </div>
  );
}
