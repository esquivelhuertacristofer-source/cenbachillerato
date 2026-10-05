'use client';

/**
 * LECTURA GUIADA — la misma lectura oficial, partida en partes que se abren de
 * una en una: título, idea clave, el texto tal cual, un esquema y una pregunta
 * rápida para seguir. Arriba, los conceptos clave de toda la lectura.
 *
 * Responde a «demasiado texto»: el alumno nunca tiene delante más de una parte
 * nueva, y cada parte le dice primero qué tiene que llevarse.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Check, X, ArrowRight, Lock } from 'lucide-react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import type { AreaColor } from '@/components/hub/hub-colors';
import type { ComprobacionGuia, LecturaGuia, VisualGuia } from '@/lib/contenido/lectura-guia';

interface Props {
  guia: LecturaGuia;
  parrafos: string[];
  /** Pinta un trozo de la lectura con el mismo markdown + glosario de siempre. */
  pintar: (md: string) => ReactNode;
  color: AreaColor;
  /** En revisión (ya completada) se abren todas las partes. */
  todoAbierto: boolean;
  /** Avisa cuando la última parte quedó abierta. */
  onCompleta: () => void;
}

const CSS = `
.lg { display:flex; flex-direction:column; gap:28px; }
.lg-bloque { border-radius:22px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); }
.lg-conceptos { padding:22px 24px; }
.lg-rotulo { font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--lg-c); margin:0 0 14px; display:flex; align-items:center; gap:8px; }
.lg-cgrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px; }
.lg-concepto { padding:14px 16px; border-radius:16px; background:rgba(var(--lg-rgb),0.07); border:1px solid rgba(var(--lg-rgb),0.18); }
.lg-concepto b { display:block; font-size:16px; color:#fff; margin-bottom:4px; font-family:var(--font-epilogue), sans-serif; }
.lg-concepto span { font-size:15px; line-height:1.5; color:rgba(255,255,255,0.78); }
.lg-mapa { display:flex; gap:8px; flex-wrap:wrap; }
.lg-paso { display:flex; align-items:center; gap:8px; padding:8px 14px 8px 8px; border-radius:999px; border:1px solid rgba(255,255,255,0.10); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.55); font-size:14px; font-weight:600; cursor:default; font-family:inherit; }
.lg-paso[data-estado="abierta"] { color:#fff; border-color:rgba(var(--lg-rgb),0.35); cursor:pointer; }
.lg-paso[data-estado="actual"] { color:#011126; background:var(--lg-c); border-color:var(--lg-c); cursor:pointer; }
.lg-paso i { width:24px; height:24px; border-radius:50%; display:grid; place-items:center; font-style:normal; font-size:13px; font-weight:800; background:rgba(255,255,255,0.08); }
.lg-paso[data-estado="actual"] i { background:rgba(1,17,38,0.18); }
.lg-parte { padding:clamp(22px,4vw,40px) clamp(20px,4vw,44px); scroll-margin-top:90px; }
.lg-parte-num { font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--lg-c); }
.lg-parte h2 { font-size:clamp(1.35rem,2.6vw,1.75rem); line-height:1.2; letter-spacing:-0.02em; color:#fff; margin:6px 0 16px; font-family:var(--font-epilogue), sans-serif; font-weight:800; }
.lg-idea { display:flex; gap:12px; align-items:flex-start; margin:0 0 22px; padding:14px 18px; border-radius:16px; background:rgba(var(--lg-rgb),0.10); border-left:4px solid var(--lg-c); font-size:17px; line-height:1.5; font-weight:600; color:#fff; }
.lg-idea svg { flex-shrink:0; margin-top:2px; color:var(--lg-c); }
.lg-texto { max-width:720px; }
.lg-texto p:last-child { margin-bottom:0 !important; }
.lg-visual { margin-top:26px; }
.lg-vgrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; }
.lg-formula { padding:16px 18px; border-radius:16px; background:rgba(1,17,38,0.55); border:1px solid rgba(var(--lg-rgb),0.25); }
.lg-formula small, .lg-dato small { display:block; font-size:13px; font-weight:700; color:rgba(255,255,255,0.6); margin-bottom:8px; }
.lg-formula code { display:block; font-family:'Cambria Math','STIX Two Math','Times New Roman',serif; font-size:clamp(20px,2.4vw,25px); color:#fff; white-space:normal; overflow-wrap:anywhere; }
.lg-formula p { margin:8px 0 0; font-size:14px; line-height:1.45; color:rgba(255,255,255,0.7); }
.lg-col { padding:16px 18px; border-radius:16px; background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.09); border-top:3px solid var(--lg-c); }
.lg-col h3 { margin:0 0 10px; font-size:17px; color:#fff; font-family:var(--font-epilogue), sans-serif; }
.lg-col ul { margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:8px; }
.lg-col li { font-size:15px; line-height:1.45; color:rgba(255,255,255,0.82); padding-left:16px; position:relative; }
.lg-col li::before { content:''; position:absolute; left:0; top:0.6em; width:6px; height:6px; border-radius:50%; background:var(--lg-c); }
.lg-dato { padding:16px 18px; border-radius:16px; background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.09); }
.lg-dato strong { display:block; font-size:clamp(26px,3.4vw,34px); line-height:1.05; color:var(--lg-c); font-family:var(--font-epilogue), sans-serif; margin-bottom:6px; }
.lg-dato span { font-size:15px; line-height:1.4; color:rgba(255,255,255,0.8); }
.lg-barra { margin-top:10px; height:8px; border-radius:99px; background:rgba(255,255,255,0.08); overflow:hidden; }
.lg-barra > div { height:100%; border-radius:99px; background:var(--lg-c); }
.lg-fgrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px; }
.lg-barras { display:flex; flex-direction:column; gap:12px; padding:18px 20px; border-radius:16px; background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.09); }
.lg-fila { display:grid; grid-template-columns:minmax(0, 38%) 1fr auto; align-items:center; gap:14px; }
.lg-fila span { font-size:15px; line-height:1.35; color:rgba(255,255,255,0.82); }
.lg-fila .lg-barra { margin:0; height:14px; }
.lg-fila strong { font-size:20px; color:var(--lg-c); font-family:var(--font-epilogue), sans-serif; min-width:3.5em; text-align:right; }
.lg-fuente { margin:10px 0 0; font-size:13px; color:rgba(255,255,255,0.5); }
.lg-pasos { display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px; counter-reset:paso; }
.lg-pasito { position:relative; padding:16px 18px; border-radius:16px; background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.09); }
.lg-pasito::before { counter-increment:paso; content:counter(paso); display:grid; place-items:center; width:28px; height:28px; border-radius:50%; background:var(--lg-c); color:#011126; font-weight:800; font-size:14px; margin-bottom:10px; }
.lg-pasito h3 { margin:0 0 6px; font-size:16px; color:#fff; font-family:var(--font-epilogue), sans-serif; }
.lg-pasito p { margin:0; font-size:15px; line-height:1.45; color:rgba(255,255,255,0.78); }
.lg-ejemplo { padding:18px 20px; border-radius:16px; background:rgba(1,17,38,0.55); border:1px dashed rgba(var(--lg-rgb),0.4); }
.lg-ejemplo h3 { margin:0 0 10px; font-size:16px; color:#fff; font-family:var(--font-epilogue), sans-serif; }
.lg-ejemplo ol { margin:0; padding-left:22px; display:flex; flex-direction:column; gap:6px; }
.lg-ejemplo li { font-size:18px; line-height:1.5; color:rgba(255,255,255,0.85); font-family:'Cambria Math','Times New Roman',serif; }
.lg-ejemplo .lg-res { margin-top:12px; padding:10px 14px; border-radius:12px; background:rgba(var(--lg-rgb),0.14); color:#fff; font-weight:700; font-size:16px; }
.lg-check { margin-top:28px; padding:18px 20px; border-radius:18px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.10); }
.lg-check > p { margin:0 0 12px; font-size:17px; line-height:1.45; font-weight:700; color:#fff; }
.lg-ops { display:grid; gap:8px; }
.lg-op { display:flex; align-items:center; gap:10px; text-align:left; width:100%; padding:12px 16px; border-radius:14px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.88); font-size:16px; line-height:1.4; cursor:pointer; font-family:inherit; transition:border-color .15s, background .15s; }
.lg-op:hover:not(:disabled) { border-color:rgba(var(--lg-rgb),0.5); background:rgba(var(--lg-rgb),0.06); }
.lg-op:disabled { cursor:default; }
.lg-op[data-r="bien"] { border-color:#4ADE80; background:rgba(74,222,128,0.10); color:#fff; }
.lg-op[data-r="mal"] { border-color:#F87171; background:rgba(248,113,113,0.10); }
.lg-op svg { flex-shrink:0; }
.lg-porque { margin:12px 0 0; font-size:15px; line-height:1.5; color:rgba(255,255,255,0.8); }
.lg-porque b { color:#fff; }
.lg-sig { margin-top:24px; display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:16px 20px; border-radius:16px; border:none; font-size:16px; font-weight:800; cursor:pointer; background:var(--lg-c); color:#011126; font-family:var(--font-epilogue), sans-serif; }
.lg-sig:disabled { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.45); cursor:not-allowed; }
.lg-sig:focus-visible, .lg-op:focus-visible, .lg-paso:focus-visible { outline:2px solid var(--lg-c); outline-offset:3px; }
@media (max-width:640px) {
  .lg-fila { grid-template-columns:1fr auto; }
  .lg-fila .lg-barra { grid-column:1 / -1; grid-row:2; }
  .lg-concepto { padding:12px 14px; }
  .lg-concepto span { font-size:14px; }
  .lg-conceptos { padding:18px 16px; }
  .lg-paso span { display:none; }
  .lg-paso { padding:6px; }
  .lg-idea { font-size:16px; }
}
`;

function Visual({ v }: { v: VisualGuia }) {
  switch (v.tipo) {
    case 'formulas':
      return (
        <div className="lg-fgrid">
          {v.items.map((f, i) => (
            <div key={i} className="lg-formula">
              <small>{f.nombre}</small>
              <code>{f.expr}</code>
              {f.leyenda && <p>{f.leyenda}</p>}
            </div>
          ))}
        </div>
      );
    case 'comparar':
      return (
        <div className="lg-vgrid">
          {v.columnas.map((c, i) => (
            <div key={i} className="lg-col">
              <h3>{c.titulo}</h3>
              <ul>{c.puntos.map((p, j) => <li key={j}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
      );
    case 'datos':
      // Con barras: una gráfica de barras horizontal (se compara de un vistazo).
      if (v.items.every((d) => typeof d.barra === 'number')) {
        return (
          <div>
            <div className="lg-barras">
              {v.items.map((d, i) => (
                <div key={i} className="lg-fila">
                  <span>{d.etiqueta}</span>
                  <div className="lg-barra" aria-hidden="true">
                    <div style={{ width: `${Math.max(2, Math.min(100, d.barra ?? 0))}%` }} />
                  </div>
                  <strong>{d.valor}</strong>
                </div>
              ))}
            </div>
            {v.fuente && <p className="lg-fuente">Fuente: {v.fuente}</p>}
          </div>
        );
      }
      return (
        <div>
          <div className="lg-vgrid">
            {v.items.map((d, i) => (
              <div key={i} className="lg-dato">
                <strong>{d.valor}</strong>
                <span>{d.etiqueta}</span>
                {typeof d.barra === 'number' && (
                  <div className="lg-barra" aria-hidden="true">
                    <div style={{ width: `${Math.max(2, Math.min(100, d.barra))}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {v.fuente && <p className="lg-fuente">Fuente: {v.fuente}</p>}
        </div>
      );
    case 'pasos':
      return (
        <div className="lg-pasos">
          {v.items.map((p, i) => (
            <div key={i} className="lg-pasito">
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      );
    case 'ejemplo':
      return (
        <div className="lg-ejemplo">
          <h3>Ejemplo resuelto · {v.titulo}</h3>
          <ol>{v.lineas.map((l, i) => <li key={i}>{l}</li>)}</ol>
          <div className="lg-res">{v.resultado}</div>
        </div>
      );
    default:
      return null;
  }
}

function Comprueba({ c, elegida, onElegir }: { c: ComprobacionGuia; elegida: number | undefined; onElegir: (i: number) => void }) {
  const respondida = elegida !== undefined;
  return (
    <div className="lg-check">
      <p>¿Lo captaste? {c.pregunta}</p>
      <div className="lg-ops" role="group" aria-label="Opciones">
        {c.opciones.map((o, i) => {
          const r = !respondida ? undefined : i === c.correcta ? 'bien' : i === elegida ? 'mal' : undefined;
          return (
            <button key={i} type="button" className="lg-op" data-r={r} disabled={respondida} onClick={() => onElegir(i)}>
              {r === 'bien' && <Check size={18} color="#4ADE80" />}
              {r === 'mal' && <X size={18} color="#F87171" />}
              {o}
            </button>
          );
        })}
      </div>
      {respondida && (
        <p className="lg-porque" aria-live="polite">
          <b>{elegida === c.correcta ? '¡Bien! ' : 'Casi. '}</b>
          {c.porque}
        </p>
      )}
    </div>
  );
}

export function LecturaGuiada({ guia, parrafos, pintar, color, todoAbierto, onCompleta }: Props) {
  const total = guia.partes.length;
  const [abiertasPropias, setAbiertas] = useState(1);
  // En revisión se ve todo; si no, lo que el alumno ha ido abriendo.
  const abiertas = todoAbierto ? total : abiertasPropias;
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const reducedMotion = useReducedMotion();
  const refs = useRef<(HTMLElement | null)[]>([]);
  const primera = useRef(true);

  useEffect(() => {
    if (abiertas >= total) onCompleta();
    // Al abrir una parte nueva, llevar al alumno a su inicio (no en la carga).
    if (primera.current) { primera.current = false; return; }
    refs.current[abiertas - 1]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, [abiertas, total, onCompleta, reducedMotion]);

  const ir = (i: number) => refs.current[i]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });

  return (
    <section
      className="lg"
      style={{ '--lg-c': color.hex, '--lg-rgb': color.rgba } as React.CSSProperties}
    >
      <style>{CSS}</style>

      {guia.conceptos.length > 0 && (
        <div className="lg-bloque lg-conceptos">
          <p className="lg-rotulo"><Lightbulb size={16} /> Conceptos clave de esta lectura</p>
          <div className="lg-cgrid">
            {guia.conceptos.map((c, i) => (
              <div key={i} className="lg-concepto">
                <b>{c.termino}</b>
                <span>{c.idea}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="lg-mapa" aria-label="Partes de la lectura">
        {guia.partes.map((p, i) => {
          const estado = i >= abiertas ? 'cerrada' : i === abiertas - 1 && abiertas < total ? 'actual' : 'abierta';
          return (
            <button
              key={i}
              type="button"
              className="lg-paso"
              data-estado={estado}
              disabled={estado === 'cerrada'}
              onClick={() => ir(i)}
              aria-label={`Parte ${i + 1}: ${p.titulo}${estado === 'cerrada' ? ' (aún cerrada)' : ''}`}
            >
              <i>{estado === 'cerrada' ? <Lock size={12} /> : i + 1}</i>
              <span>{p.titulo}</span>
            </button>
          );
        })}
      </nav>

      {guia.partes.slice(0, abiertas).map((p, i) => {
        const ultimaAbierta = i === abiertas - 1;
        const c = p.comprueba;
        const puedeSeguir = !c || respuestas[i] !== undefined;
        return (
          <motion.article
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className="lg-bloque lg-parte"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : springs.gentle}
          >
            <span className="lg-parte-num">Parte {i + 1} de {total}</span>
            <h2>{p.titulo}</h2>
            <p className="lg-idea"><Lightbulb size={20} />{p.idea}</p>
            <div className="lg-texto">{pintar(p.parrafos.map((k) => parrafos[k]).join('\n\n'))}</div>
            {p.visual && <div className="lg-visual"><Visual v={p.visual} /></div>}
            {c && (
              <Comprueba
                c={c}
                elegida={respuestas[i]}
                onElegir={(k) => setRespuestas((r) => ({ ...r, [i]: k }))}
              />
            )}
            {ultimaAbierta && i < total - 1 && (
              <button type="button" className="lg-sig" disabled={!puedeSeguir} onClick={() => setAbiertas((n) => n + 1)}>
                {puedeSeguir ? <>Siguiente: {guia.partes[i + 1]?.titulo} <ArrowRight size={18} /></> : 'Responde la pregunta para seguir'}
              </button>
            )}
          </motion.article>
        );
      })}
    </section>
  );
}
