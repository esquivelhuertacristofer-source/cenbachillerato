'use client';

/**
 * AUTOEVALUACIÓN — un criterio a la vez («Criterio 2 de 5»), la escala como
 * botones grandes y tocables (≥ 56 px, con su descripción dentro) y, al final,
 * un resumen para revisar o cambiar antes de entregar.
 *
 * Diseño de la familia de LecturaGuiada: bloques con borde suave, acento de la
 * materia, letra legible (cuerpo 16–17 px, nada debajo de 13 px), CSS en clases.
 * El cálculo del puntaje y lo que se envía a `onProgreso` no cambian.
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, ClipboardCheck, Eye, Pencil } from 'lucide-react';
import type { ActividadAutoevaluacion, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { imagenDeLectura } from '@/lib/contenido/lectura-imagenes';
import { useReducedMotion } from '@/lib/motion/hooks';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };

interface Props {
  actividad: ActividadAutoevaluacion;
  onProgreso?: CallbackProgreso;
  /** Código de la UAC, para elegir una imagen temática cuando no hay lámina propia. */
  uacCodigo?: string;
  color?: AreaColor;
}

const CSS = `
.ae { max-width:720px; margin:0 auto; display:flex; flex-direction:column; gap:20px; font-family:var(--font-epilogue), sans-serif; }
.ae-bloque { border-radius:22px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); }
.ae-amb { position:relative; overflow:hidden; border-radius:20px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); }
.ae-amb img { display:block; width:100%; height:clamp(130px, 28vw, 200px); object-fit:cover; }
.ae-amb::after { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(to top, rgba(1,17,38,0.55) 0%, rgba(1,17,38,0.08) 45%, transparent 70%); }
.ae-amb-sin { height:clamp(110px, 22vw, 150px); display:flex; align-items:center; justify-content:center; color:var(--ae-c); border-color:rgba(var(--ae-rgb),0.25); background:linear-gradient(135deg, rgba(var(--ae-rgb),0.14), rgba(var(--ae-rgb),0.04)); }
.ae-amb-sin::after { display:none; }
.ae-cab { padding:16px 20px; display:flex; gap:14px; align-items:flex-start; border-color:rgba(var(--ae-rgb),0.22); background:rgba(var(--ae-rgb),0.06); }
.ae-cab-ico { width:40px; height:40px; border-radius:12px; flex-shrink:0; display:grid; place-items:center; background:rgba(var(--ae-rgb),0.15); color:var(--ae-c); }
.ae-rotulo { margin:0 0 4px; font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--ae-c); }
.ae-instr { margin:0; font-size:16px; line-height:1.5; color:rgba(255,255,255,0.88); }
.ae-docente { display:inline-flex; align-items:center; gap:6px; margin-top:8px; font-size:13px; font-weight:700; padding:3px 10px; border-radius:999px; background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.30); color:#FBBF24; }
.ae-avance { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.ae-avance > span { font-size:15px; font-weight:800; color:#fff; }
.ae-puntos { display:flex; gap:6px; flex-wrap:wrap; }
.ae-punto { width:32px; height:32px; border-radius:50%; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6); font-size:13px; font-weight:800; font-family:inherit; display:grid; place-items:center; cursor:pointer; padding:0; }
.ae-punto[data-hecho="si"] { background:rgba(var(--ae-rgb),0.18); border-color:rgba(var(--ae-rgb),0.45); color:var(--ae-c); }
.ae-punto[aria-current="step"] { background:var(--ae-c); border-color:var(--ae-c); color:#011126; }
.ae-crit { padding:clamp(18px,3.5vw,28px) clamp(16px,3.5vw,28px); }
.ae-crit h2 { margin:0 0 16px; font-size:clamp(18px,2.4vw,20px); line-height:1.4; font-weight:800; color:#fff; }
.ae-escala { display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:10px; }
.ae-op { display:flex; align-items:flex-start; gap:12px; width:100%; min-height:56px; padding:12px 14px; text-align:left; border-radius:16px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.9); font-family:inherit; cursor:pointer; transition:border-color .15s, background .15s; }
.ae-op:hover { border-color:rgba(var(--ae-rgb),0.5); background:rgba(var(--ae-rgb),0.06); }
.ae-op[aria-checked="true"] { border-color:var(--ae-c); background:rgba(var(--ae-rgb),0.14); }
.ae-op-marca { flex-shrink:0; width:28px; height:28px; margin-top:1px; border-radius:50%; display:grid; place-items:center; font-size:14px; font-weight:800; border:1.5px solid rgba(255,255,255,0.25); color:rgba(255,255,255,0.7); }
.ae-op[aria-checked="true"] .ae-op-marca { background:var(--ae-c); border-color:var(--ae-c); color:#011126; }
.ae-op b { display:block; font-size:16px; line-height:1.3; color:#fff; }
.ae-op small { display:block; margin-top:3px; font-size:14px; line-height:1.4; color:rgba(255,255,255,0.68); }
.ae-nav { display:flex; gap:10px; margin-top:18px; }
.ae-btn { display:flex; align-items:center; justify-content:center; gap:10px; min-height:52px; padding:14px 20px; border-radius:16px; border:none; font-size:16px; font-weight:800; font-family:inherit; cursor:pointer; transition:filter .15s, transform .15s, background .2s; }
.ae-btn-pri { flex:1; background:var(--ae-c); color:#011126; }
.ae-btn-pri:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
.ae-btn-pri:disabled { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.45); cursor:not-allowed; }
.ae-btn-sec { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.14); color:rgba(255,255,255,0.85); font-weight:700; }
.ae-btn-sec:hover { background:rgba(255,255,255,0.10); }
.ae-btn:focus-visible, .ae-op:focus-visible, .ae-punto:focus-visible, .ae-cambiar:focus-visible { outline:2px solid var(--ae-c); outline-offset:3px; }
.ae-res { padding:clamp(18px,3.5vw,26px) clamp(16px,3.5vw,26px); display:flex; flex-direction:column; gap:16px; }
.ae-res h2 { margin:0; font-size:18px; font-weight:800; color:#fff; }
.ae-lista { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.ae-fila { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); }
.ae-fila-txt { flex:1; min-width:0; }
.ae-fila-txt p { margin:0; font-size:15px; line-height:1.4; color:rgba(255,255,255,0.85); }
.ae-nivel { display:inline-flex; align-items:center; gap:8px; margin-top:6px; font-size:14px; font-weight:700; color:var(--ae-c); }
.ae-nivel[data-falta="si"] { color:#FBBF24; }
.ae-barras { display:inline-flex; gap:3px; }
.ae-barras i { width:14px; height:6px; border-radius:3px; background:rgba(255,255,255,0.12); }
.ae-barras i[data-on="si"] { background:var(--ae-c); }
.ae-cambiar { flex-shrink:0; display:inline-flex; align-items:center; gap:6px; min-height:44px; padding:0 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background:transparent; color:rgba(255,255,255,0.8); font-size:14px; font-weight:700; font-family:inherit; cursor:pointer; }
.ae-cambiar:hover { background:rgba(255,255,255,0.08); }
.ae-refl { display:flex; flex-direction:column; gap:8px; }
.ae-refl label { font-size:16px; font-weight:700; line-height:1.45; color:#fff; }
.ae-refl textarea { width:100%; box-sizing:border-box; min-height:120px; padding:14px 16px; border-radius:14px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); color:#fff; font-size:16px; line-height:1.6; font-family:inherit; resize:vertical; outline:none; }
.ae-refl textarea:focus { border-color:rgba(var(--ae-rgb),0.55); box-shadow:0 0 0 3px rgba(var(--ae-rgb),0.12); }
.ae-refl textarea:disabled { opacity:0.8; }
.ae-ok { display:flex; align-items:center; justify-content:center; gap:10px; padding:14px; border-radius:16px; background:rgba(74,222,128,0.10); border:1px solid rgba(74,222,128,0.30); color:#4ADE80; font-size:16px; font-weight:800; }
@media (max-width:640px) {
  .ae-escala { grid-template-columns:1fr; }
  .ae-cab { padding:14px 16px; }
  .ae-punto { width:30px; height:30px; }
}
`;

// ── Imagen de ambientación ─────────────────────────────────────────────────────

function Ambientacion({ url, tematica, titulo }: { url: string; tematica: string; titulo: string }) {
  const [imgError, setImgError] = useState(false);
  const [imgTematicaError, setImgTematicaError] = useState(false);
  // Los SVG de placeholder ya no existen en disco; cualquier url que contenga
  // "placeholder" se trata como "sin lámina" para ir directo a la imagen temática.
  const tieneImagen = url.length > 0 && !/placeholder/i.test(url) && !imgError;
  if (tieneImagen) {
    return (
      <div className="ae-amb">
        <img src={url} alt={titulo} onError={() => setImgError(true)} />
      </div>
    );
  }
  if (!imgTematicaError) {
    return (
      <div className="ae-amb">
        <img src={tematica} alt={titulo} onError={() => setImgTematicaError(true)} />
      </div>
    );
  }
  // Fallback honesto si tampoco hay imagen temática en disco: bloque sin <img> roto.
  return (
    <div className="ae-amb ae-amb-sin" aria-hidden="true">
      <ClipboardCheck size={30} />
    </div>
  );
}

export function AutoevaluacionActivity({ actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [reflexion, setReflexion] = useState('');
  const [entregado, setEntregado] = useState(false);
  // Paso actual: 0..N-1 = un criterio; N = resumen antes de entregar.
  const [paso, setPaso] = useState(0);
  const avanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tarjeta = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  // Sin lámina propia → imagen temática con licencia libre acorde a la materia.
  const imagenTematica = imagenDeLectura(uacCodigo, actividad.titulo);

  const totalCriterios = contenido.criterios.length;
  const respondidos = Object.keys(respuestas).length;
  const todosRespondidos = respondidos === totalCriterios;
  const enResumen = paso >= totalCriterios;
  const criterio = enResumen ? undefined : contenido.criterios[paso];

  useEffect(() => () => { if (avanceTimer.current) clearTimeout(avanceTimer.current); }, []);

  function irA(n: number) {
    if (avanceTimer.current) { clearTimeout(avanceTimer.current); avanceTimer.current = null; }
    setPaso(Math.max(0, Math.min(totalCriterios, n)));
    // Al cambiar de criterio, que la tarjeta quede a la vista (en celular sobre todo).
    requestAnimationFrame(() => {
      const el = tarjeta.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  function handleSeleccion(criterioIdx: number, valor: number) {
    if (entregado) return;
    const primeraVez = respuestas[criterioIdx] === undefined;
    setRespuestas(prev => ({ ...prev, [criterioIdx]: valor }));
    // La primera vez que se elige nivel, pasar solo al siguiente criterio sin
    // evaluar (o al resumen si ya no queda ninguno).
    if (primeraVez) {
      const pendientes = contenido.criterios
        .map((_, i) => i)
        .filter(i => i !== criterioIdx && respuestas[i] === undefined);
      const destino = pendientes.find(i => i > criterioIdx) ?? pendientes[0] ?? totalCriterios;
      if (avanceTimer.current) clearTimeout(avanceTimer.current);
      avanceTimer.current = setTimeout(() => irA(destino), 380);
    }
  }

  function handleEntregar() {
    setEntregado(true);
    // Máximo posible = suma del valor más alto de la escala de CADA criterio.
    // (Antes usaba un único máximo global y, con escalas vacías, Math.max() daba
    // -Infinity → puntaje NaN.)
    const maxPosible = contenido.criterios.reduce((acc, c) => {
      const valores = c.escala.map(e => e.valor);
      return acc + (valores.length > 0 ? Math.max(...valores) : 0);
    }, 0);
    const sumaObtenida = Object.values(respuestas).reduce((a, b) => a + b, 0);
    const puntaje = maxPosible > 0 ? Math.round((sumaObtenida / maxPosible) * 100) : 100;
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje, respuestas: { criterios: respuestas, reflexion } });
  }

  const faltan = totalCriterios - respondidos;

  return (
    <div
      className="ae"
      style={{ '--ae-c': color.hex, '--ae-rgb': color.rgba } as React.CSSProperties}
    >
      <style>{CSS}</style>

      <Ambientacion url={contenido.url_imagen ?? ''} tematica={imagenTematica} titulo={actividad.titulo} />

      <div className="ae-bloque ae-cab">
        <div className="ae-cab-ico" aria-hidden="true"><ClipboardCheck size={20} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="ae-rotulo">Autoevaluación</p>
          <p className="ae-instr">{contenido.instrucciones ?? 'Marca tu nivel honesto en cada criterio.'}</p>
          {contenido.visible_para_docente && (
            <span className="ae-docente"><Eye size={14} /> Visible para docente</span>
          )}
        </div>
      </div>

      {/* Avance: «Criterio 2 de 5» + un punto por criterio */}
      {totalCriterios > 0 && (
        <div className="ae-avance">
          <span aria-live="polite">
            {entregado ? 'Entregada' : enResumen ? 'Resumen' : `Criterio ${paso + 1} de ${totalCriterios}`}
          </span>
          <nav className="ae-puntos" aria-label="Criterios">
            {contenido.criterios.map((c, i) => (
              <button
                key={i}
                type="button"
                className="ae-punto"
                data-hecho={respuestas[i] !== undefined ? 'si' : undefined}
                aria-current={!enResumen && i === paso ? 'step' : undefined}
                aria-label={`Criterio ${i + 1}${respuestas[i] !== undefined ? ' (evaluado)' : ''}`}
                disabled={entregado}
                onClick={() => irA(i)}
              >
                {respuestas[i] !== undefined && !(i === paso && !enResumen) ? <Check size={14} /> : i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div ref={tarjeta} style={{ scrollMarginTop: 90 }}>
        {criterio && !entregado ? (
          /* ── Un criterio a la vez ── */
          <section className="ae-bloque ae-crit" aria-label={`Criterio ${paso + 1} de ${totalCriterios}`}>
            <h2>{criterio.descripcion}</h2>
            <div className="ae-escala" role="radiogroup" aria-label="Tu nivel">
              {criterio.escala.map((nivel, ni) => {
                const activo = respuestas[paso] === nivel.valor;
                return (
                  <button
                    key={`${nivel.valor}-${ni}`}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    className="ae-op"
                    onClick={() => handleSeleccion(paso, nivel.valor)}
                  >
                    <span className="ae-op-marca" aria-hidden="true">{activo ? <Check size={15} /> : ni + 1}</span>
                    <span>
                      <b>{nivel.etiqueta}</b>
                      {nivel.descripcion && <small>{nivel.descripcion}</small>}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="ae-nav">
              {paso > 0 && (
                <button type="button" className="ae-btn ae-btn-sec" onClick={() => irA(paso - 1)} aria-label="Criterio anterior">
                  <ArrowLeft size={18} />
                </button>
              )}
              <button
                type="button"
                className="ae-btn ae-btn-pri"
                disabled={respuestas[paso] === undefined}
                // Si ya están todos evaluados (vino de «Cambiar»), regresa al resumen.
                onClick={() => irA(todosRespondidos ? totalCriterios : paso + 1)}
              >
                {todosRespondidos ? 'Volver al resumen' : paso + 1 < totalCriterios ? 'Siguiente criterio' : 'Ver resumen'}
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        ) : (
          /* ── Resumen antes de entregar (y vista final tras entregar) ── */
          <section className="ae-bloque ae-res" aria-label="Resumen de tu autoevaluación">
            <h2>{entregado ? 'Así te evaluaste' : 'Revisa antes de entregar'}</h2>
            {totalCriterios > 0 && (
              <ul className="ae-lista">
                {contenido.criterios.map((c, i) => {
                  const nivel = c.escala.find(e => e.valor === respuestas[i]);
                  const posicion = nivel ? c.escala.indexOf(nivel) : -1;
                  return (
                    <li key={i} className="ae-fila">
                      <div className="ae-fila-txt">
                        <p>{c.descripcion}</p>
                        <span className="ae-nivel" data-falta={nivel ? undefined : 'si'}>
                          {nivel && (
                            <span className="ae-barras" aria-hidden="true">
                              {c.escala.map((_, k) => <i key={k} data-on={k <= posicion ? 'si' : undefined} />)}
                            </span>
                          )}
                          {nivel ? nivel.etiqueta : 'Sin evaluar'}
                        </span>
                      </div>
                      {!entregado && (
                        <button type="button" className="ae-cambiar" onClick={() => irA(i)} aria-label={`Cambiar criterio ${i + 1}`}>
                          <Pencil size={14} /> Cambiar
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {contenido.reflexion_final_prompt && (
              <div className="ae-refl">
                <label htmlFor="ae-reflexion">{contenido.reflexion_final_prompt}</label>
                <textarea
                  id="ae-reflexion"
                  value={reflexion}
                  onChange={e => setReflexion(e.target.value)}
                  disabled={entregado}
                  rows={4}
                  placeholder="Escribe tu reflexión..."
                />
              </div>
            )}

            {!entregado ? (
              <button
                type="button"
                className="ae-btn ae-btn-pri"
                onClick={handleEntregar}
                disabled={!todosRespondidos}
              >
                {todosRespondidos
                  ? <><Check size={18} /> Entregar autoevaluación</>
                  : faltan === 1 ? 'Falta 1 criterio por evaluar' : `Faltan ${faltan} criterios por evaluar`}
              </button>
            ) : (
              <div className="ae-ok" role="status">
                <CheckCircle size={20} /> Autoevaluación entregada
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
