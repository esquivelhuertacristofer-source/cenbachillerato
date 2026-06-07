"use client";

/**
 * Laboratorio 3D — Sistemas de ecuaciones lineales 2×2.
 * Práctica experimental para PM-II-P05-A2.
 *
 * El plano cartesiano es el piso y cada ecuación es una recta. Resolver el
 * sistema es hallar el punto donde se cruzan. El estudiante elige una situación
 * (real o uno de los tres casos) e INCLINA la segunda recta con un deslizador
 * para descubrir cuándo hay:
 *   · 1 solución   (rectas que se cruzan)        → se levanta una columna,
 *   · sin solución (rectas paralelas)            → nada se levanta,
 *   · infinitas    (rectas coincidentes)         → toda la recta brilla.
 * Pensamiento Matemático II — Introducción al Álgebra (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  ESCENARIOS,
  pendiente,
  ordenada,
  resolver,
  dentro,
  eqStr,
  fmtNum,
  CASO_LABEL,
  PEND_MIN,
  PEND_MAX,
  PEND_STEP,
  type Escenario,
  type Caso,
} from "./sistemas-data";

const SistemasScene = dynamic(() => import("./SistemasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-diagram-project fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const R2_COL = "#5EE6C5"; // recta 2
const SOL_COL = "#FFD166"; // solución / cruce

const CASO_ICON: Record<Caso, string> = {
  unica: "fa-circle-dot",
  paralelas: "fa-equals",
  coincidentes: "fa-clone",
};

/** y = m·x + i en texto legible. */
const rectaStr = (m: number, i: number) => {
  const mp = Math.abs(m) === 1 ? "" : fmtNum(Math.abs(m));
  const signoM = m < 0 ? "−" : "";
  const termX = m === 0 ? "" : `${signoM}${mp}x`;
  if (i === 0) return `y = ${termX || "0"}`;
  const signoI = i < 0 ? "−" : "+";
  return `y = ${termX} ${signoI} ${fmtNum(Math.abs(i))}`;
};

export function LabSistemas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [m2, setM2] = useState(pendiente(ESCENARIOS[0]!.r2));
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // seguimiento de objetivos
  const [movioPendiente, setMovioPendiente] = useState(false);
  const [, setEligioReal] = useState(false);
  const [casosVistos, setCasosVistos] = useState<Set<Caso>>(() => new Set<Caso>([ESCENARIOS[0]!.casoBase]));

  const m1 = useMemo(() => pendiente(esc.r1), [esc]);
  const i1 = useMemo(() => ordenada(esc.r1), [esc]);
  const i2 = useMemo(() => ordenada(esc.r2), [esc]);

  const sol = useMemo(() => resolver(m1, i1, m2, i2), [m1, i1, m2, i2]);
  const m2Base = useMemo(() => pendiente(esc.r2), [esc]);

  const registrarCaso = (c: Caso) =>
    setCasosVistos((prev) => (prev.has(c) ? prev : new Set(prev).add(c)));

  const elegir = (e: Escenario) => {
    setEscKey(e.key);
    const nm2 = pendiente(e.r2);
    setM2(nm2);
    if (e.grupo === "real") setEligioReal(true);
    registrarCaso(resolver(pendiente(e.r1), ordenada(e.r1), nm2, ordenada(e.r2)).caso);
  };

  const moverPendiente = (v: number) => {
    setM2(v);
    setMovioPendiente(true);
    registrarCaso(resolver(m1, i1, v, i2).caso);
  };

  const reset = () => {
    setM2(m2Base);
    setResetNonce((n) => n + 1);
  };

  const modificada = Math.abs(m2 - m2Base) > 1e-9;
  const solVisible = sol.caso === "unica" && sol.x != null && sol.y != null && dentro(sol.x, sol.y, esc.ventana);

  const colorCaso = sol.caso === "unica" ? SOL_COL : sol.caso === "coincidentes" ? SOL_COL : R2_COL;

  const objetivos = [
    { txt: "Inclina la segunda recta y observa el cruce", done: movioPendiente },
    { txt: "Encuentra una solución única (se cruzan)", done: casosVistos.has("unica") },
    { txt: "Logra rectas paralelas (sin solución)", done: casosVistos.has("paralelas") },
    { txt: "Logra rectas coincidentes (infinitas)", done: casosVistos.has("coincidentes") },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{CASO_LABEL[sol.caso]}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: dos rectas en el plano.{" "}
        {sol.caso === "unica" && sol.x != null && sol.y != null ? (
          <>Se cruzan en <strong style={{ color: SOL_COL, ...NUM }}>({fmtNum(sol.x)}, {fmtNum(sol.y)})</strong>.</>
        ) : sol.caso === "paralelas" ? (
          <>Son <strong>paralelas</strong>: nunca se tocan, así que no hay solución.</>
        ) : (
          <>Son <strong>la misma recta</strong>: se tocan en todos sus puntos (infinitas soluciones).</>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-esc { cursor:pointer; text-align:left; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          padding:11px 13px; transition:all .14s ease; display:flex; align-items:center; gap:11px; width:100%; }
        .ex-esc:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-esc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-slider { -webkit-appearance:none; appearance:none; width:100%; height:7px; border-radius:999px; background:${T.lineStrong}; outline:none; cursor:pointer; }
        .ex-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${R2_COL}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-slider::-moz-range-thumb { width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${R2_COL}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <SistemasScene
                win={esc.ventana}
                l1={{ m: m1, i: i1 }}
                l2={{ m: m2, i: i2 }}
                sol={sol}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO con el caso */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${colorCaso}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${colorCaso}aa`, width: 9, height: 9, borderRadius: "50%", background: colorCaso }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: colorCaso, ...NUM }}>
                {CASO_LABEL[sol.caso]}
                {sol.caso === "unica" && sol.x != null && sol.y != null ? ` · (${fmtNum(sol.x)}, ${fmtNum(sol.y)})` : ""}
              </span>
            </div>

            {/* Leyenda de las dos rectas */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 16, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.03em", pointerEvents: "none", ...NUM }}>
              <span style={{ color: accent }}>
                <i className="fa-solid fa-minus" style={{ marginRight: 6 }} />
                {eqStr(esc.r1)}
              </span>
              <span style={{ color: R2_COL }}>
                <i className="fa-solid fa-minus" style={{ marginRight: 6 }} />
                {modificada ? rectaStr(m2, i2) : eqStr(esc.r2)}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar la 2ª recta">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* Deslizador: inclinar la 2ª recta */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${esc.icono}`} style={{ marginRight: 8, color: accent }} />
              {esc.titulo}
            </Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.5, marginBottom: 16 }}>{esc.contexto}</div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                Inclinación de la <span style={{ color: R2_COL }}>2ª recta</span> (pendiente m₂)
              </span>
              <span style={{ fontSize: 18, fontWeight: 900, color: R2_COL, ...NUM }}>{fmtNum(m2)}</span>
            </div>
            <input
              className="ex-slider"
              type="range"
              min={PEND_MIN}
              max={PEND_MAX}
              step={PEND_STEP}
              value={m2}
              onChange={(e) => moverPendiente(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
              <span>{fmtNum(PEND_MIN)}</span>
              <span>
                pendiente de la 1ª recta: <strong style={{ color: accent }}>{fmtNum(m1)}</strong>
              </span>
              <span>{fmtNum(PEND_MAX)}</span>
            </div>

            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 16 }}>
              <Readout label="Caso" value={CASO_LABEL[sol.caso]} col={colorCaso} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="x" value={solVisible && sol.x != null ? fmtNum(sol.x) : "—"} col={accent} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="y" value={solVisible && sol.y != null ? fmtNum(sol.y) : "—"} col={R2_COL} />
            </div>

            {sol.caso === "unica" && !solVisible && (
              <div style={{ marginTop: 12, fontSize: 12.5, color: T.text2 }}>
                <i className="fa-solid fa-arrows-left-right-to-line" style={{ marginRight: 7, color: SOL_COL }} />
                Hay una solución, pero el cruce queda fuera de la vista. Acerca la pendiente m₂ a la de la otra recta para verlo entrar (y luego desaparecer al volverse paralelas).
              </div>
            )}
          </div>

          {/* Qué está pasando */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Qué significa el cruce</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              {sol.caso === "unica" ? (
                <>
                  Las dos rectas tienen <strong style={{ color: T.text }}>pendientes distintas</strong>, así que se cruzan en un solo punto. Ese punto{" "}
                  {solVisible && sol.x != null && sol.y != null ? (
                    <>
                      <strong style={{ color: SOL_COL, ...NUM }}>({fmtNum(sol.x)}, {fmtNum(sol.y)})</strong>
                    </>
                  ) : null}{" "}
                  es el único par (x, y) que cumple <strong>las dos ecuaciones a la vez</strong>: la <strong style={{ color: SOL_COL }}>solución única</strong>.
                </>
              ) : sol.caso === "paralelas" ? (
                <>
                  Las rectas tienen la <strong style={{ color: T.text }}>misma pendiente</strong> pero distinta altura: son <strong style={{ color: R2_COL }}>paralelas</strong> y nunca se tocan. No existe ningún (x, y) que cumpla ambas: el sistema <strong>no tiene solución</strong>.
                </>
              ) : (
                <>
                  Las dos ecuaciones describen <strong style={{ color: T.text }}>la misma recta</strong> (una es múltiplo de la otra): son <strong style={{ color: SOL_COL }}>coincidentes</strong>. Cualquier punto de la recta cumple ambas, por eso hay <strong>infinitas soluciones</strong>.
                </>
              )}
            </div>
            <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${colorCaso}55`, background: `${colorCaso}14`, padding: "13px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className={`fa-solid ${CASO_ICON[sol.caso]}`} style={{ color: colorCaso, fontSize: 18 }} />
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text }}>
                {esc.porque}
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Situaciones reales</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.filter((e) => e.grupo === "real").map((e) => (
              <button key={e.key} className="ex-esc" data-on={e.key === escKey} onClick={() => elegir(e)}>
                <i className={`fa-solid ${e.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: e.key === escKey ? accent : T.text3 }} />
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{e.titulo}</span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Los tres casos</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.filter((e) => e.grupo === "caso").map((e) => (
              <button key={e.key} className="ex-esc" data-on={e.key === escKey} onClick={() => elegir(e)}>
                <i className={`fa-solid ${e.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: e.key === escKey ? accent : T.text3 }} />
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{e.titulo}</span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Métodos para resolverlo</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><strong style={{ color: T.text }}>Gráfico:</strong> dibujar las dos rectas y leer el punto donde se cruzan (lo que haces aquí).</div>
            <div><strong style={{ color: T.text }}>Sustitución:</strong> despejar una variable en una ecuación y meterla en la otra.</div>
            <div><strong style={{ color: T.text }}>Igualación:</strong> despejar la misma variable en ambas e igualar los resultados.</div>
            <div><strong style={{ color: T.text }}>Eliminación:</strong> sumar o restar las ecuaciones para cancelar una variable.</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Casos vistos" value={`${casosVistos.size}/3`} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Recta 2" value={modificada ? "Modificada" : "Original"} col={R2_COL} size={15} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Mueve la pendiente m₂ hasta igualar la de la <strong style={{ color: accent }}>1ª recta</strong> ({fmtNum(m1)}): verás cómo la solución se va al infinito y las rectas quedan paralelas o coincidentes.
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Resolver un sistema 2×2 es <strong style={{ color: T.text }}>buscar dónde se cruzan dos rectas</strong>. Según cómo se acomoden hay tres finales: se cruzan{" "}
            <strong style={{ color: SOL_COL }}>(1 solución)</strong>, van paralelas{" "}
            <strong style={{ color: R2_COL }}>(ninguna)</strong> o son la misma recta{" "}
            <strong style={{ color: SOL_COL }}>(infinitas)</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
