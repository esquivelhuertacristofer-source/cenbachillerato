"use client";
// =============================================================================
// Sistema Solar — piezas del PANEL (DOM, sin three)
// =============================================================================
// · Miniaturas hechas con la misma fotografía de cada cuerpo (del Explorador).
// · «Predice» de cada modo: apuesta antes de mover, se revela al comprobar.
// · Gráficas SVG: T contra a en escala logarítmica (3.ª ley), la fuerza del Sol
//   sobre los ocho, la rapidez a lo largo de una vuelta (vis-viva) y el área
//   medida de cada sector (2.ª ley).
// Texto propio ≥ 14 px; sin anchos fijos (las gráficas usan viewBox al 100 %).
// =============================================================================

import { useState, type ReactNode } from "react";
import { T } from "./_kit";
import { RUTA_ESPACIO } from "./_espacio";
import {
  PLANETAS, fuerzaSol, keplerDe, miles, periodoAnios, puntoKepler, sci, visViva,
  type Planeta, type PrediccionModo,
} from "./sistema-solar-datos";

const OK = "#34D399";
const MAL = "#fb7185";

/* ── Miniatura: una esfera hecha con la fotografía del cuerpo ─────────────── */
export function Esfera({ textura, tam, anillo, brillo }: { textura: string; tam: number; anillo?: boolean; brillo?: boolean }) {
  return (
    <span style={{ position: "relative", width: tam, height: tam, flex: "0 0 auto", display: "inline-block" }} aria-hidden>
      {anillo && (
        <span
          style={{
            position: "absolute", left: -tam * 0.42, right: -tam * 0.42, top: "50%", height: tam * 0.42,
            transform: "translateY(-50%) rotate(-18deg)", borderRadius: "50%",
            border: `${Math.max(2, tam * 0.07)}px solid rgba(222,204,160,.75)`,
          }}
        />
      )}
      <span
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          backgroundImage: `url(${RUTA_ESPACIO}/${textura}-2k.webp)`,
          backgroundSize: "200% 100%", backgroundPosition: "30% 50%", backgroundColor: "#1e293b",
          boxShadow: brillo
            ? `0 0 ${tam * 0.35}px rgba(255,170,60,.65), inset ${-tam * 0.08}px ${-tam * 0.06}px ${tam * 0.2}px rgba(120,40,0,.45)`
            : `inset ${-tam * 0.16}px ${-tam * 0.1}px ${tam * 0.28}px rgba(0,0,0,.82), inset ${tam * 0.04}px ${tam * 0.04}px ${tam * 0.1}px rgba(255,255,255,.22)`,
        }}
      />
    </span>
  );
}

/* ── Selector de planetas (rejilla, sin anchos fijos) ────────────────────── */
export function SelectorPlanetas({ valor, onElegir, color }: { valor: string; onElegir: (id: string) => void; color: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 92px), 1fr))", gap: 6 }}>
      {[{ id: "sol", nombre: "Sol", textura: "sol" } as const, ...PLANETAS].map((p) => {
        const on = p.id === valor;
        const esPlaneta = p.id !== "sol";
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onElegir(p.id)}
            aria-pressed={on}
            style={{
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 4px 8px",
              borderRadius: 12, border: `1px solid ${on ? color : T.line}`, background: on ? `${color}22` : "rgba(255,255,255,0.03)",
              color: on ? "#fff" : T.text2, fontSize: 14, fontWeight: 800,
            }}
          >
            <Esfera textura={p.textura} tam={p.id === "jupiter" || p.id === "saturno" || p.id === "sol" ? 30 : 24} anillo={esPlaneta && !!(p as Planeta).anillo} brillo={p.id === "sol"} />
            {p.nombre}
          </button>
        );
      })}
    </div>
  );
}

/* ── Interruptor ─────────────────────────────────────────────────────────── */
export function Interruptor({ etiqueta, detalle, activo, onClick, color }: { etiqueta: string; detalle: string; activo: boolean; onClick: () => void; color: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 50, padding: "8px 2px", background: "none", border: "none", borderTop: `1px solid ${T.line}`, color: "#fff", textAlign: "left", cursor: "pointer" }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{etiqueta}</span>
        <span style={{ display: "block", fontSize: 14, color: T.text2, marginTop: 2 }}>{detalle}</span>
      </span>
      <span style={{ width: 40, height: 24, borderRadius: 99, background: activo ? color : "rgba(255,255,255,.16)", position: "relative", flex: "0 0 auto", transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 3, left: activo ? 19 : 3, width: 18, height: 18, borderRadius: 99, background: activo ? "#04121f" : "#dfe5f1", transition: "left .2s" }} />
      </span>
    </button>
  );
}

/* ── Botón de chip ───────────────────────────────────────────────────────── */
export function Chip({ on, onClick, color, children, titulo }: { on: boolean; onClick: () => void; color: string; children: ReactNode; titulo?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={titulo}
      onClick={onClick}
      style={{
        cursor: "pointer", fontSize: 14, fontWeight: 800, borderRadius: 10, padding: "9px 12px",
        color: on ? "#04121f" : color, background: on ? color : `${color}1f`, border: `1px solid ${color}66`,
        display: "inline-flex", alignItems: "center", gap: 7,
      }}
    >
      {children}
    </button>
  );
}

/* ── «Predice» del modo ──────────────────────────────────────────────────── */
export function PrediceModo({
  pred, eleccion, onElegir, comprobado, color,
}: {
  pred: PrediccionModo;
  eleccion: string | null;
  onElegir: (id: string) => void;
  /** El alumno ya hizo el experimento que la contesta. */
  comprobado: boolean;
  color: string;
}) {
  const [verYa, setVerYa] = useState(false);
  const revelar = eleccion !== null && (comprobado || verYa);
  const acerto = eleccion === pred.correcta;
  return (
    <div style={{ display: "grid", gap: 10, padding: 14, borderRadius: 14, background: `${color}14`, border: `1px solid ${color}55` }}>
      <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color }}>
        <i className="fa-solid fa-wand-magic-sparkles" aria-hidden style={{ marginRight: 8 }} />
        Predice antes de mover
      </div>
      <div style={{ fontSize: 14, color: T.text2 }}>{pred.escena}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>{pred.pregunta}</div>
      <div style={{ display: "grid", gap: 6 }}>
        {pred.opciones.map((o) => {
          const elegida = eleccion === o.id;
          const esCorrecta = o.id === pred.correcta;
          const borde = revelar && esCorrecta ? OK : revelar && elegida ? MAL : elegida ? color : T.line;
          return (
            <button
              key={o.id}
              type="button"
              disabled={eleccion !== null}
              onClick={() => onElegir(o.id)}
              aria-pressed={elegida}
              style={{
                cursor: eleccion === null ? "pointer" : "default", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 11, textAlign: "left", fontSize: 15, fontWeight: 700, color: "#fff",
                border: `1px solid ${borde}`, background: elegida ? `${color}26` : "rgba(4,10,22,0.45)",
              }}
            >
              <i className={`fa-solid ${o.icono}`} aria-hidden style={{ width: 18, color: revelar && esCorrecta ? OK : color }} />
              <span style={{ flex: 1 }}>{o.texto}</span>
              {revelar && esCorrecta && <i className="fa-solid fa-circle-check" aria-hidden style={{ color: OK }} />}
              {revelar && elegida && !esCorrecta && <i className="fa-solid fa-circle-xmark" aria-hidden style={{ color: MAL }} />}
            </button>
          );
        })}
      </div>
      {eleccion !== null && !revelar && (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 14, color: "#fff" }}>
            <i className="fa-solid fa-flask" aria-hidden style={{ marginRight: 8, color }} />
            <strong>Ahora compruébalo:</strong> {pred.comoComprobarlo}
          </div>
          <button type="button" onClick={() => setVerYa(true)} style={{ justifySelf: "start", cursor: "pointer", border: "none", background: "none", color: T.text2, fontSize: 14, textDecoration: "underline", padding: 0 }}>
            Ver la respuesta sin comprobar
          </button>
        </div>
      )}
      {revelar && (
        <div role="status" style={{ fontSize: 14, lineHeight: 1.5, color: "#fff", padding: "10px 12px", borderRadius: 10, background: acerto ? "rgba(52,211,153,0.12)" : "rgba(251,113,133,0.10)", border: `1px solid ${acerto ? OK : MAL}55` }}>
          <strong style={{ color: acerto ? OK : MAL }}>{acerto ? "¡Lo predijiste! " : "No era esa. "}</strong>
          {pred.porque}
        </div>
      )}
    </div>
  );
}

/* ── 3.ª ley: T contra a en escala log-log (pendiente 3/2) ───────────────── */
export function GraficaKepler({ aX, color }: { aX: number; color: string }) {
  const W = 340;
  const H = 230;
  const m = { l: 46, r: 12, t: 12, b: 40 };
  const lx = (a: number) => m.l + ((Math.log10(a) - -0.6) / (1.7 - -0.6)) * (W - m.l - m.r);
  const ly = (t: number) => H - m.b - ((Math.log10(t) - -0.8) / (2.5 - -0.8)) * (H - m.t - m.b);
  const ticksA = [0.3, 1, 3, 10, 30];
  const ticksT = [0.3, 1, 10, 100];
  const TX = periodoAnios(aX);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Periodo contra semieje mayor en escala logarítmica: los ocho planetas caen sobre la recta T = a elevado a 3/2" style={{ display: "block" }}>
      {ticksA.map((a) => (
        <g key={`a${a}`}>
          <line x1={lx(a)} x2={lx(a)} y1={m.t} y2={H - m.b} stroke="rgba(255,255,255,0.08)" />
          <text x={lx(a)} y={H - m.b + 18} fill={T.text2} fontSize="13" textAnchor="middle">{a}</text>
        </g>
      ))}
      {ticksT.map((t) => (
        <g key={`t${t}`}>
          <line x1={m.l} x2={W - m.r} y1={ly(t)} y2={ly(t)} stroke="rgba(255,255,255,0.08)" />
          <text x={m.l - 6} y={ly(t) + 4} fill={T.text2} fontSize="13" textAnchor="end">{t}</text>
        </g>
      ))}
      <text x={(W + m.l) / 2} y={H - 4} fill={T.text2} fontSize="13" textAnchor="middle">a (UA)</text>
      <text x={12} y={(H - m.b) / 2} fill={T.text2} fontSize="13" textAnchor="middle" transform={`rotate(-90 12 ${(H - m.b) / 2})`}>T (años)</text>
      {/* La recta T = a^(3/2) */}
      <line x1={lx(0.25)} y1={ly(periodoAnios(0.25))} x2={lx(50)} y2={ly(periodoAnios(50))} stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeDasharray="5 4" />
      {PLANETAS.map((p) => {
        const k = keplerDe(p);
        return <circle key={p.id} cx={lx(p.ua)} cy={ly(k.T)} r="5.5" fill={p.color} stroke="#04121f" strokeWidth="1.5"><title>{`${p.nombre}: a = ${p.ua.toFixed(2)} UA, T = ${k.T.toFixed(2)} años`}</title></circle>;
      })}
      <circle cx={lx(aX)} cy={ly(TX)} r="7.5" fill="none" stroke={color} strokeWidth="2.5" />
      <text x={lx(aX) + 10} y={ly(TX) - 8} fill={color} fontSize="14" fontWeight="800">X</text>
    </svg>
  );
}

export function TablaKepler({ aX, color }: { aX: number; color: string }) {
  const TX = periodoAnios(aX);
  const filas = [
    ...PLANETAS.map((p) => ({ id: p.id, nombre: p.nombre, color: p.color, a: p.ua, ...keplerDe(p) })),
    { id: "x", nombre: "Planeta X", color, a: aX, T: TX, T2a3: (TX * TX) / (aX * aX * aX) },
  ];
  const celda = { padding: "6px 6px", borderTop: `1px solid ${T.line}`, fontVariantNumeric: "tabular-nums" as const, textAlign: "right" as const };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ color: T.text2 }}>
            <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 800 }}>Planeta</th>
            <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 800 }}>a (UA)</th>
            <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 800 }}>T (años)</th>
            <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 800 }}>T²/a³</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id} style={{ color: f.id === "x" ? color : "#fff" }}>
              <td style={{ ...celda, textAlign: "left", fontWeight: 800 }}>
                <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: f.color, marginRight: 7 }} />
                {f.nombre}
              </td>
              <td style={celda}>{f.a < 10 ? f.a.toFixed(3) : f.a.toFixed(2)}</td>
              <td style={celda}>{f.T < 10 ? f.T.toFixed(3) : f.T.toFixed(1)}</td>
              <td style={{ ...celda, fontWeight: 900, color: f.id === "x" ? color : OK }}>{f.T2a3.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Gravitación: la fuerza del Sol sobre los ocho (escala log) ──────────── */
export function BarrasFuerza({ horaMs, seleccion, rDe, color }: { horaMs: number; seleccion: string; rDe: (p: Planeta, ms: number) => number; color: string }) {
  const lmin = 20;
  const lmax = 24;
  return (
    <div style={{ display: "grid", gap: 5 }}>
      {PLANETAS.map((p) => {
        const F = fuerzaSol(p.masaKg, rDe(p, horaMs));
        const frac = (Math.log10(F) - lmin) / (lmax - lmin);
        const on = p.id === seleccion;
        return (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 76px) minmax(0,1fr) minmax(0, 96px)", alignItems: "center", gap: 8, fontSize: 14 }}>
            <span style={{ fontWeight: on ? 900 : 700, color: on ? "#fff" : T.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</span>
            <span style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${Math.max(2, frac * 100)}%`, background: on ? color : p.color, opacity: on ? 1 : 0.55, transition: "width .3s" }} />
            </span>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13.5, color: on ? "#fff" : T.text2, textAlign: "right", whiteSpace: "nowrap" }}>{sci(F, 1)} N</span>
          </div>
        );
      })}
      <div style={{ fontSize: 14, color: T.text3 }}>Barras en escala logarítmica: cada marca de 25 % es 10 veces más fuerza.</div>
    </div>
  );
}

/* ── Vis-viva: rapidez a lo largo de una vuelta ──────────────────────────── */
export function GraficaRapidez({ a, e, M, color }: { a: number; e: number; M: number; color: string }) {
  const W = 340;
  const H = 190;
  const m = { l: 44, r: 12, t: 14, b: 36 };
  const vp = visViva(a * (1 - e), a);
  const vmax = vp * 1.1;
  const px = (f: number) => m.l + f * (W - m.l - m.r);
  const py = (v: number) => H - m.b - (v / vmax) * (H - m.t - m.b);
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const Mi = (i / 160) * 2 * Math.PI;
    const k = puntoKepler(a, e, Mi);
    pts.push(`${px(i / 160).toFixed(1)},${py(visViva(k.r, a)).toFixed(1)}`);
  }
  const k = puntoKepler(a, e, M);
  const v = visViva(k.r, a);
  const ticks = [0, vmax / 2, vmax].map((t) => Math.round(t));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Rapidez del cuerpo a lo largo de una vuelta: máxima en el perihelio, mínima en el afelio" style={{ display: "block" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={m.l} x2={W - m.r} y1={py(t)} y2={py(t)} stroke="rgba(255,255,255,0.08)" />
          <text x={m.l - 6} y={py(t) + 4} fill={T.text2} fontSize="13" textAnchor="end">{t}</text>
        </g>
      ))}
      <line x1={px(0.5)} x2={px(0.5)} y1={m.t} y2={H - m.b} stroke="rgba(96,165,250,0.5)" strokeDasharray="4 4" />
      <text x={px(0)} y={H - m.b + 18} fill="#fb923c" fontSize="13" textAnchor="start">perihelio</text>
      <text x={px(0.5)} y={H - m.b + 18} fill="#60a5fa" fontSize="13" textAnchor="middle">afelio</text>
      <text x={px(1)} y={H - m.b + 18} fill="#fb923c" fontSize="13" textAnchor="end">perihelio</text>
      <text x={12} y={(H - m.b) / 2} fill={T.text2} fontSize="13" textAnchor="middle" transform={`rotate(-90 12 ${(H - m.b) / 2})`}>v (km/s)</text>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx={px(M / (2 * Math.PI))} cy={py(v)} r="6.5" fill="#fff" stroke={color} strokeWidth="3" />
    </svg>
  );
}

/* ── 2.ª ley: el área MEDIDA de cada sector ──────────────────────────────── */
export function BarrasAreas({ areas, pintados }: { areas: number[]; pintados: number }) {
  const N = areas.length;
  const max = Math.max(...areas) * 1.15;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N}, minmax(0,1fr))`, gap: 3, alignItems: "end", height: 110 }}>
        {areas.map((f, i) => {
          const hecho = i < pintados;
          const col = i % 2 === 0 ? "#38bdf8" : "#f59e0b";
          return (
            <div key={i} title={`Sector ${i + 1}: ${(f * 100).toFixed(2)} % del área`} style={{ height: `${(f / max) * 100}%`, borderRadius: "5px 5px 2px 2px", background: hecho ? col : "rgba(255,255,255,0.10)", transition: "background .3s" }} />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.text2 }}>
        <span>1 (junto al Sol)</span>
        <span>{N} sectores, mismo tiempo cada uno</span>
      </div>
    </div>
  );
}

export function textoVueltas(aX: number): string {
  const T = periodoAnios(aX);
  return T >= 1
    ? `Mientras X da 1 vuelta, la Tierra da ${miles(T, 2)}.`
    : `Mientras la Tierra da 1 vuelta, X da ${miles(1 / T, 2)}.`;
}
