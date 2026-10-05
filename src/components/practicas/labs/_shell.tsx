"use client";

/**
 * EL ESQUELETO DE LABORATORIO — una sola forma de pantalla para todos.
 *
 * El defecto que arregla: cada laboratorio decidía su propia distribución y
 * casi todos apilaban, debajo de la escena, ocho a doce tarjetas (selector,
 * controles, lecturas, modelo, pasos, preguntas, ideas, notas, objetivos,
 * reto). La escena quedaba en un tercio de la pantalla, el texto en letra de
 * 11–12 px y en el celular había que bajar varias pantallas para encontrar el
 * deslizador que movía lo que se estaba viendo.
 *
 * Las reglas de esta pieza:
 *   · La escena manda: ocupa todo el alto disponible y, en escritorio, todo el
 *     ancho salvo un panel de 380 px.
 *   · Una sola consigna a la vez: los objetivos se vuelven MISIONES y en la
 *     escena solo se ve la que toca, con su avance en puntos.
 *   · Una sola lectura en vivo, corta, sobre la escena.
 *   · Lo demás vive en pestañas del panel. Las pestañas no se desmontan al
 *     cambiar (solo se ocultan): el tablero de objetivos y el reto siguen
 *     contando estrellas aunque el alumno esté en otra pestaña.
 *   · Ningún texto propio por debajo de 14 px y ningún ancho fijo: en el
 *     celular la escena va arriba y el panel debajo.
 *
 * La teoría verbatim NO se borra: se mueve a la pestaña «Teoría».
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { T } from "./_kit";
import { TableroObjetivos, type ObjetivoLab } from "./_objetivos";
import { useLogros } from "./_partida";

const OK = "#34D399";

export interface ModoShell {
  id: string;
  etiqueta: string;
  icono?: string;
}

export interface PestanaShell {
  id: string;
  etiqueta: string;
  icono: string;
  contenido: ReactNode;
}

export interface LabShellProps {
  accent: string;
  rgba: string;
  /** La escena (3D o DOM). Llena el escenario. */
  escena: ReactNode;
  /** Botones de la escena (sonido, reproducir, reiniciar…), arriba a la derecha. */
  herramientas?: ReactNode;
  /** Leyenda breve sobre la escena; en el celular se oculta. */
  leyenda?: ReactNode;
  /** Selector de modo/escenario, sobre la escena. */
  modos?: { opciones: ModoShell[]; valor: string; cambiar: (id: string) => void };
  /** Una frase en vivo: lo que está pasando ahora. Que sea corta. */
  lectura?: ReactNode;
  /** Los objetivos del laboratorio: se muestran como misiones, una a la vez. */
  objetivos: ObjetivoLab[];
  retoKey: string;
  /** Pestañas del panel. La de misiones se agrega sola, en segundo lugar. */
  pestanas: PestanaShell[];
  /**
   * Laboratorio de arrastre (sin 3D): la escena se desplaza por dentro y la
   * misión va debajo de ella, no encima, para no tapar fichas ni zonas.
   */
  dom?: boolean;
}

export function LabShell({ accent, rgba, escena, herramientas, leyenda, modos, lectura, objetivos, retoKey, pestanas, dom = false }: LabShellProps) {
  const { logros, cumplidos, total } = useLogros(objetivos.map((o) => o.done));
  const actual = logros.findIndex((l) => !l);
  const todas = actual === -1;

  const [tab, setTab] = useState(pestanas[0]?.id ?? "misiones");

  // Aviso breve cuando se cumple una misión nueva.
  const [aviso, setAviso] = useState<string | null>(null);
  const previos = useRef(cumplidos);
  const objetivosVistos = useRef<boolean[]>(logros.slice());
  useEffect(() => {
    if (cumplidos > previos.current) {
      const nueva = logros.findIndex((l, i) => l && !objetivosVistos.current[i]);
      setAviso(nueva >= 0 ? objetivos[nueva]!.txt : "Misión cumplida");
      const t = setTimeout(() => setAviso(null), 2600);
      previos.current = cumplidos;
      objetivosVistos.current = logros.slice();
      return () => clearTimeout(t);
    }
    previos.current = cumplidos;
    objetivosVistos.current = logros.slice();
    return undefined;
  }, [cumplidos, logros, objetivos]);

  const lista: PestanaShell[] = [
    ...pestanas.slice(0, 1),
    {
      id: "misiones",
      etiqueta: `${cumplidos}/${total}`,
      icono: "fa-bullseye",
      contenido: <TableroObjetivos objetivos={objetivos} retoKey={retoKey} accent={accent} />,
    },
    ...pestanas.slice(1),
  ];

  return (
    <div className="ls" style={{ ["--lsa" as string]: accent, ["--lsr" as string]: rgba }}>
      <style>{CSS}</style>

      {/* ── Escenario ─────────────────────────────────────────── */}
      <div className="ls-stage" data-dom={dom} style={{ border: `1px solid rgba(${rgba},0.25)` }}>
        <div className="ls-escena">{escena}</div>

        <div className="ls-top">
          {modos && (
            <div className="ls-modos" role="tablist" aria-label="Escenario">
              {modos.opciones.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={modos.valor === m.id}
                  className="ls-modo"
                  data-on={modos.valor === m.id}
                  onClick={() => modos.cambiar(m.id)}
                >
                  {m.icono && <i className={`fa-solid ${m.icono}`} aria-hidden />}
                  {m.etiqueta}
                </button>
              ))}
            </div>
          )}
          {herramientas && <div className="ls-tools">{herramientas}</div>}
        </div>

        {leyenda && <div className="ls-leyenda">{leyenda}</div>}

        {aviso && (
          <div className="ls-aviso" role="status">
            <i className="fa-solid fa-circle-check" aria-hidden /> ¡Misión cumplida! <span>{aviso}</span>
          </div>
        )}

        <div className="ls-pie">
          <div className="ls-mision" data-todas={todas}>
            <div className="ls-mision-ceja">
              {todas ? "Todas las misiones cumplidas" : `Misión ${actual + 1} de ${total}`}
              <span className="ls-puntos" aria-hidden>
                {logros.map((l, i) => (
                  <span key={i} data-on={l} data-actual={i === actual} />
                ))}
              </span>
            </div>
            <div className="ls-mision-txt">
              {todas ? (
                <>
                  Ahora, el reto: <button type="button" className="ls-link" onClick={() => setTab(pestanas.find((p) => p.id === "reto") ? "reto" : "misiones")}>ábrelo en el panel</button>
                </>
              ) : (
                objetivos[actual]!.txt
              )}
            </div>
          </div>
          {lectura && <div className="ls-lectura">{lectura}</div>}
        </div>
      </div>

      {/* ── Panel ─────────────────────────────────────────────── */}
      <div className="ls-panel">
        <div className="ls-tabs" role="tablist" aria-label="Panel del laboratorio">
          {lista.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={tab === p.id} className="ls-tab" data-on={tab === p.id} onClick={() => setTab(p.id)}>
              <i className={`fa-solid ${p.icono}`} aria-hidden />
              <span>{p.etiqueta}</span>
            </button>
          ))}
        </div>
        <div className="ls-cuerpo">
          {lista.map((p) => (
            <div key={p.id} role="tabpanel" hidden={tab !== p.id}>
              {p.contenido}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Piezas para el panel ──────────────────────────────────────────── */

/** Bloque titulado del panel (sustituye a las tarjetas apiladas). */
export function Bloque({ titulo, icono, children }: { titulo: string; icono?: string; children: ReactNode }) {
  return (
    <section className="ls-bloque">
      <h4>
        {icono && <i className={`fa-solid ${icono}`} aria-hidden />}
        {titulo}
      </h4>
      {children}
    </section>
  );
}

/**
 * Mesa de arrastre: banco de fichas a la izquierda (se queda a la vista al
 * desplazarse) y destino a la derecha. Si la escena es angosta, se apilan.
 * Espera exactamente dos hijos: el banco y el destino.
 */
export function Mesa({ children }: { children: ReactNode }) {
  return <div className="ls-mesa">{children}</div>;
}

/** Lectura numérica compacta: etiqueta arriba, valor grande. */
export function Dato({ label, value, col }: { label: string; value: string; col?: string }) {
  return (
    <div className="ls-dato" style={{ borderColor: col ? `${col}55` : undefined }}>
      <span>{label}</span>
      <strong style={{ color: col ?? "#fff" }}>{value}</strong>
    </div>
  );
}

/** Botón de icono para `herramientas`. */
export function BotonHerramienta({ icono, titulo, activo, onClick }: { icono: string; titulo: string; activo?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="ls-tool" data-on={activo ?? false} onClick={onClick} title={titulo} aria-label={titulo}>
      <i className={`fa-solid ${icono}`} aria-hidden />
    </button>
  );
}

/** Deslizador común: etiqueta y valor legibles, pulgar grande para el dedo. */
export function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon?: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  const v = Math.min(max, Math.max(min, value));
  const fill = `${((v - min) / (max - min)) * 100}%`;
  return (
    <label className="ls-slider" style={{ ["--lsc" as string]: colr, ["--lsf" as string]: fill }}>
      <span className="ls-slider-top">
        <span>{icon && <i className={`fa-solid ${icon}`} aria-hidden />}{label}</span>
        <strong>{valor}</strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(Number(e.target.value))} />
      {(hintL || hintR) && (
        <span className="ls-slider-hint">
          <span>{hintL}</span>
          <span>{hintR}</span>
        </span>
      )}
    </label>
  );
}

const CSS = `
.ls { display:grid; grid-template-columns:minmax(0,1fr) 380px; gap:16px;
  height:clamp(560px, calc(100dvh - 220px), 880px); color:${T.text}; }
.ls-stage { position:relative; border-radius:20px; overflow:hidden; min-height:0;
  background:radial-gradient(120% 80% at 30% 0%, rgba(var(--lsr),0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%); }
.ls-escena { position:absolute; inset:0; }
.ls-top { position:absolute; top:12px; left:12px; right:12px; display:flex; gap:10px; align-items:flex-start;
  justify-content:space-between; pointer-events:none; }
.ls-top > * { pointer-events:auto; }
.ls-modos { display:flex; gap:4px; padding:4px; border-radius:14px; background:rgba(4,10,22,0.78);
  border:1px solid ${T.line}; backdrop-filter:blur(10px); overflow-x:auto; max-width:100%; scrollbar-width:none; }
.ls-modo { cursor:pointer; white-space:nowrap; display:inline-flex; align-items:center; gap:8px; padding:9px 14px;
  border-radius:10px; border:none; background:transparent; color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; }
.ls-modo:hover { color:#fff; background:rgba(255,255,255,0.08); }
.ls-modo[data-on="true"] { background:var(--lsa); color:#04121f; }
.ls-tools { display:flex; gap:2px; padding:4px; border-radius:12px; background:rgba(4,10,22,0.78);
  border:1px solid ${T.line}; backdrop-filter:blur(10px); flex-shrink:0; }
.ls-tool { cursor:pointer; width:40px; height:40px; border-radius:9px; display:flex; align-items:center; justify-content:center;
  font-size:15px; border:none; background:transparent; color:rgba(255,255,255,0.75); transition:all .15s; }
.ls-tool:hover { background:rgba(255,255,255,0.12); }
.ls-tool[data-on="true"] { background:rgba(var(--lsr),0.25); color:#fff; }
.ls-leyenda { position:absolute; top:70px; left:12px; padding:10px 12px; border-radius:12px; background:rgba(4,10,22,0.72);
  border:1px solid ${T.line}; backdrop-filter:blur(8px); font-size:14px; display:grid; gap:6px; }
.ls-pie { position:absolute; left:0; right:0; bottom:0; padding:40px 14px 14px; display:grid; gap:8px;
  background:linear-gradient(0deg, rgba(3,8,18,0.94) 0%, rgba(3,8,18,0.6) 60%, transparent 100%); pointer-events:none; }
.ls-pie button { pointer-events:auto; }
.ls-mision { display:grid; gap:4px; padding:10px 14px; border-radius:14px; background:rgba(var(--lsr),0.16);
  border:1px solid rgba(var(--lsr),0.45); backdrop-filter:blur(8px); max-width:640px; }
.ls-mision[data-todas="true"] { background:rgba(52,211,153,0.14); border-color:rgba(52,211,153,0.5); }
.ls-mision-ceja { display:flex; align-items:center; gap:10px; font-size:12px; font-weight:900; letter-spacing:.12em;
  text-transform:uppercase; color:var(--lsa); }
.ls-mision[data-todas="true"] .ls-mision-ceja { color:${OK}; }
.ls-puntos { display:inline-flex; gap:4px; }
.ls-puntos span { width:14px; height:5px; border-radius:99px; background:rgba(255,255,255,0.2); transition:background .3s; }
.ls-puntos span[data-on="true"] { background:${OK}; }
.ls-puntos span[data-actual="true"] { background:var(--lsa); }
.ls-mision-txt { font-size:16px; font-weight:800; color:#fff; line-height:1.3; }
.ls-link { cursor:pointer; border:none; background:none; padding:0; color:${OK}; font:inherit; text-decoration:underline; }
.ls-lectura { font-size:14px; font-weight:700; color:#e6eefb; line-height:1.4; text-shadow:0 1px 6px rgba(0,0,0,0.8); }
.ls-aviso { position:absolute; top:70px; left:50%; transform:translateX(-50%); z-index:5; display:flex; align-items:center; gap:8px;
  padding:10px 16px; border-radius:999px; background:rgba(6,40,30,0.92); border:1px solid ${OK}; color:#fff; font-size:14px;
  font-weight:900; box-shadow:0 10px 30px -8px ${OK}; animation:lsIn .35s ease; max-width:calc(100% - 24px); }
.ls-aviso i { color:${OK}; }
.ls-aviso span { font-weight:600; color:${T.text2}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
@keyframes lsIn { from { opacity:0; transform:translate(-50%, -8px); } to { opacity:1; transform:translate(-50%, 0); } }

.ls-panel { display:flex; flex-direction:column; min-height:0; border-radius:20px; border:1px solid ${T.line};
  background:rgba(255,255,255,0.03); overflow:hidden; }
.ls-tabs { display:flex; gap:4px; padding:6px; border-bottom:1px solid ${T.line}; background:rgba(2,10,22,0.6); overflow-x:auto; scrollbar-width:none; }
.ls-tab { cursor:pointer; flex:1 0 auto; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:10px 10px;
  border-radius:10px; border:none; background:transparent; color:${T.text2}; font-size:14px; font-weight:800; white-space:nowrap; }
.ls-tab:hover { color:#fff; background:rgba(255,255,255,0.06); }
.ls-tab[data-on="true"] { background:rgba(var(--lsr),0.22); color:#fff; }
.ls-cuerpo { flex:1; min-height:0; overflow-y:auto; padding:16px; font-size:15px; line-height:1.5; }
.ls-bloque { display:grid; gap:10px; }
.ls-bloque + .ls-bloque { margin-top:20px; }
.ls-bloque h4 { margin:0; font-size:13px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:${T.text3};
  display:flex; align-items:center; gap:8px; }
.ls-bloque h4 i { color:var(--lsa); }
.ls-dato { display:grid; gap:2px; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:rgba(2,12,28,0.5); min-width:0; }
.ls-dato span { font-size:13px; color:${T.text2}; font-weight:700; }
.ls-dato strong { font-size:19px; font-weight:900; font-variant-numeric:tabular-nums; font-family:ui-monospace, monospace; }

.ls-slider { display:grid; gap:8px; }
.ls-slider + .ls-slider { margin-top:18px; }
.ls-slider-top { display:flex; justify-content:space-between; align-items:baseline; gap:10px; font-size:14px; font-weight:800; color:var(--lsc); }
.ls-slider-top i { margin-right:7px; }
.ls-slider-top strong { font-size:17px; font-weight:900; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; white-space:nowrap; }
.ls-slider input { -webkit-appearance:none; appearance:none; width:100%; height:8px; border-radius:999px; outline:none; margin:6px 0;
  background:linear-gradient(90deg, var(--lsc) 0%, var(--lsc) var(--lsf), rgba(255,255,255,0.14) var(--lsf), rgba(255,255,255,0.14) 100%); }
.ls-slider input::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:26px; height:26px; border-radius:50%;
  background:#fff; border:4px solid var(--lsc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.45); }
.ls-slider input::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:#fff; border:4px solid var(--lsc); cursor:pointer; }
.ls-slider input:focus-visible { box-shadow:0 0 0 3px rgba(var(--lsr),0.5); }
.ls-slider-hint { display:flex; justify-content:space-between; font-size:13px; color:${T.text3}; }

.ls-stage[data-dom="true"] { display:flex; flex-direction:column; }
.ls-stage[data-dom="true"] .ls-top { position:static; order:-1; padding:12px 12px 0; }
.ls-stage[data-dom="true"] .ls-escena { position:relative; inset:auto; flex:1; min-height:0; overflow-y:auto; padding:16px; container:lsescena / inline-size; }
.ls-mesa { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.25fr); gap:18px; align-items:start; }
.ls-mesa > :first-child { position:sticky; top:0; z-index:2; display:flex; flex-direction:column; gap:10px; }
@container lsescena (max-width: 760px) {
  .ls-mesa { grid-template-columns:1fr; }
  .ls-mesa > :first-child { position:static; max-height:44dvh; overflow-y:auto; padding-right:4px;
    mask-image:linear-gradient(180deg, #000 85%, transparent); }
}
.ls-stage[data-dom="true"] .ls-pie { position:static; padding:12px 14px 14px; background:rgba(3,8,18,0.7); border-top:1px solid ${T.line}; }

@media (max-width: 1000px) {
  .ls { grid-template-columns:1fr; height:auto; }
  .ls-stage { height:clamp(320px, 58dvh, 560px); }
  .ls-stage[data-dom="true"] { height:auto; }
  .ls-stage[data-dom="true"] .ls-escena { overflow:visible; }
  .ls-panel { max-height:none; }
  .ls-cuerpo { overflow:visible; }
  .ls-leyenda { display:none; }
}
@media (max-width: 560px) {
  .ls-top { flex-direction:column; align-items:stretch; }
  .ls-stage:not([data-dom="true"]) .ls-tools { align-self:flex-end; position:absolute; right:0; top:52px; flex-direction:column; }
  .ls-stage[data-dom="true"] .ls-top { flex-direction:row; flex-wrap:wrap; }
  .ls-mision-txt { font-size:15px; }
  .ls-lectura { display:none; }
}
`;
