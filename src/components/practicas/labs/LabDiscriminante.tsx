"use client";

/**
 * Laboratorio 3D — El discriminante: naturaleza de las raíces.
 * Práctica experimental para PM-III-P03-A2 (ejercicio_matematico; progresión 3).
 *
 * El alumno mueve los coeficientes a, b, c de y = ax² + bx + c y ve, en vivo,
 * cómo el DISCRIMINANTE Δ = b² − 4ac decide cuántas raíces hay:
 *   Δ > 0 dos reales (cruza el eje X) · Δ = 0 una doble (tangente) ·
 *   Δ < 0 ninguna real (las raíces se despegan al eje imaginario: a ± b·i).
 * Una recta y = k modela "¿cuántas veces el cohete alcanza la altura k?"
 * (aplicación: h(t) = −5t² + 30t + 10). Matemática exacta (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  calcDiscriminante, calcAltura, CASOS, ESCENARIOS, FORMULA, IDEAS, DATOS,
  A_MIN, A_MAX, A_STEP, A_DEF, B_MIN, B_MAX, B_STEP, B_DEF,
  C_MIN, C_MAX, C_STEP, C_DEF, K_MIN, K_MAX, K_STEP, K_DEF,
  fmtDelta, fmtNum, fmtCoef, type Caso, type Escenario,
} from "./discriminante-data";

const DiscriminanteScene = dynamic(() => import("./DiscriminanteScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-square-root-variable fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Trazando la parábola…</span>
    </div>
  ),
});

const B_COL = "#60a5fa";
const C_COL = "#c084fc";
const K_COL = "#fbbf24";
const ROJO = "#f87171";

/** Texto legible de las raíces según el caso. */
function raicesTexto(caso: Caso, raices: number[], compleja: { re: number; im: number } | null): string {
  if (caso === "dos" && raices.length === 2) return `x₁ = ${fmtNum(raices[0]!)} , x₂ = ${fmtNum(raices[1]!)}`;
  if (caso === "una" && raices.length === 1) return `x = ${fmtNum(raices[0]!)} (doble)`;
  if (caso === "ninguna" && compleja) {
    const im = fmtNum(compleja.im);
    return `${fmtNum(compleja.re)} ± ${im}i`;
  }
  if (caso === "lineal") return raices.length ? `x = ${fmtNum(raices[0]!)}` : "sin raíz";
  return "—";
}

export function LabDiscriminante({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(A_DEF);
  const [b, setB] = useState(B_DEF);
  const [c, setC] = useState(C_DEF);
  const [k, setK] = useState(K_DEF);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);

  const calc = useMemo(() => calcDiscriminante(a, b, c), [a, b, c]);
  const altura = useMemo(() => calcAltura(a, b, c, k), [a, b, c, k]);
  const casoInfo = calc.caso !== "lineal" ? CASOS[calc.caso] : null;
  const casoColor = casoInfo?.color ?? "#94a3b8";
  const nReales = calc.esCuadratica ? calc.raices.length : 0;

  const aplicar = (e: Escenario) => { setA(e.a); setB(e.b); setC(e.c); setK(e.k); bump(); };
  const reset = () => { setA(A_DEF); setB(B_DEF); setC(C_DEF); setK(K_DEF); bump(); };

  const mostrarK = Math.abs(k) > 1e-9;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-square-root-variable" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El signo de Δ basta</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la parábola en 3D, pero la idea sigue: el discriminante Δ = b² − 4ac dice cuántas raíces tiene ax² + bx + c = 0 — dos si Δ &gt; 0, una si Δ = 0, ninguna real si Δ &lt; 0. Usa los controles y las lecturas para comprobarlo.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseQ { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseQ 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 720px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0a1730 0%,#06101f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <DiscriminanteScene
                a={a} b={b} c={c} k={k}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — discriminante */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${casoColor}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${casoColor}aa`, width: 9, height: 9, borderRadius: "50%", background: casoColor }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: casoColor }}>
                Δ = {fmtDelta(calc.delta)}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((vv) => !vv)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: ecuación + caso */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13.5, color: "#eaf0fb", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
                y = {fmtCoef(a)}x² {b >= 0 ? "+" : "−"} {fmtCoef(Math.abs(b))}x {c >= 0 ? "+" : "−"} {fmtCoef(Math.abs(c))}
              </div>
              <div style={{ fontSize: 12.5, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                <i className={`fa-solid ${casoInfo?.icono ?? "fa-minus"}`} style={{ color: casoColor, marginRight: 7 }} />
                {casoInfo ? `${casoInfo.signo} → ${casoInfo.label.toLowerCase()}. ${casoInfo.geom}` : "Con a = 0 ya no es una ecuación cuadrática."}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Coeficientes de y = ax² + bx + c
            </Eyebrow>
            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="a · abre/cierra la parábola" icon="fa-a" colr={accent}
                valor={fmtCoef(a)} min={A_MIN} max={A_MAX} step={A_STEP} value={a}
                onChange={setA} hintL="cóncava ↓ (a<0)" hintR="cóncava ↑ (a>0)" />
              <Deslizador label="b · inclina y desplaza" icon="fa-b" colr={B_COL}
                valor={fmtCoef(b)} min={B_MIN} max={B_MAX} step={B_STEP} value={b}
                onChange={setB} hintL={`${B_MIN}`} hintR={`${B_MAX}`} />
              <Deslizador label="c · corte con el eje Y" icon="fa-c" colr={C_COL}
                valor={fmtCoef(c)} min={C_MIN} max={C_MAX} step={C_STEP} value={c}
                onChange={setC} hintL={`${C_MIN}`} hintR={`${C_MAX}`} />
              <Deslizador label="altura objetivo y = k (cohete)" icon="fa-ruler-horizontal" colr={K_COL}
                valor={fmtCoef(k)} min={K_MIN} max={K_MAX} step={K_STEP} value={k}
                onChange={setK} hintL="suelo (k=0)" hintR={`${K_MAX} m`} />
            </div>

            {a === 0 && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", borderRadius: 10, border: `1px dashed ${ROJO}66`, background: `${ROJO}12` }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: ROJO }} />
                <span style={{ fontSize: 11.5, color: T.text2 }}>Con <strong>a = 0</strong> ya no hay término x²: deja de ser cuadrática y el discriminante no aplica.</span>
              </div>
            )}

            {/* escenarios guiados */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>ESCENARIOS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc}
                  onClick={() => aplicar(e)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Los tres casos del discriminante */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-code-branch" style={{ marginRight: 8, color: accent }} />
              Los tres casos del discriminante
            </Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              {(["dos", "una", "ninguna"] as const).map((key) => {
                const ci = CASOS[key];
                const on = calc.caso === key;
                return (
                  <div key={key} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 13px", borderRadius: 12, border: `1px solid ${on ? ci.color + "88" : T.line}`, background: on ? `${ci.color}18` : T.inset, transition: "all .2s" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: on ? "#04121f" : ci.color, background: on ? ci.color : `${ci.color}22`, flexShrink: 0 }}>
                      <i className={`fa-solid ${ci.icono}`} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: on ? "#fff" : T.text2 }}>
                        {ci.signo} · {ci.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, marginTop: 3 }}>{ci.geom}</div>
                    </div>
                    {on && <i className="fa-solid fa-circle-check" style={{ color: ci.color, marginLeft: "auto" }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Caso actual */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${casoColor}66`, background: `${casoColor}14` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: casoColor }}>
                <i className={`fa-solid ${casoInfo?.icono ?? "fa-minus"}`} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{casoInfo?.label ?? "No es cuadrática"}</div>
                <div style={{ fontSize: 11.5, color: casoColor, fontWeight: 800 }}>{casoInfo?.signo ?? "a = 0"} · {nReales} raíz{nReales === 1 ? "" : "es"} real{nReales === 1 ? "" : "es"}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Mini label="Discriminante Δ" value={fmtDelta(calc.delta)} col={casoColor} />
              <Mini label="Vértice (x, y)" value={calc.esCuadratica ? `(${fmtNum(calc.vx)}, ${fmtNum(calc.vy)})` : "—"} col={accent} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: T.text, lineHeight: 1.5, padding: "10px 12px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>RAÍCES</span>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 4 }}>
                {raicesTexto(calc.caso, calc.raices, calc.compleja)}
              </div>
              {casoInfo && <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4, marginTop: 7 }}>{casoInfo.desc}</div>}
            </div>
          </div>

          {/* Fórmula general */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-square-root-variable" style={{ marginRight: 8, color: accent }} />
              Fórmula general
            </Eyebrow>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", textAlign: "center", padding: "12px 8px", borderRadius: 12, background: T.inset, border: `1px solid ${T.line}` }}>
              {FORMULA}
            </div>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginTop: 11 }}>
              El <strong style={{ color: accent }}>discriminante</strong> Δ = b² − 4ac es exactamente lo que vive bajo el radical. Su signo manda: <strong style={{ color: CASOS.dos.color }}>+ dos</strong>, <strong style={{ color: CASOS.una.color }}>0 una</strong>, <strong style={{ color: CASOS.ninguna.color }}>− ninguna real</strong>.
            </div>
          </div>

          {/* Números complejos */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${ROJO}55`, background: `${ROJO}10` }}>
            <Eyebrow>
              <i className="fa-solid fa-infinity" style={{ marginRight: 8, color: ROJO }} />
              Cuando Δ &lt; 0: números complejos
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              Si Δ &lt; 0, la raíz de un número negativo no existe en los reales: las raíces son <strong style={{ color: ROJO }}>complejas a ± b·i</strong> (i = √−1) y se despegan al eje imaginario. No son inútiles: el <strong>audio de tu celular</strong>, la ingeniería eléctrica y la física cuántica los usan a diario.
            </div>
          </div>

          {/* Aplicación cohete */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-rocket" style={{ marginRight: 8, color: K_COL }} />
              Aplicación: el cohete
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 10 }}>
              <strong style={{ color: "#fff", fontFamily: "ui-monospace, monospace" }}>h(t) = −5t² + 30t + 10</strong>. Mueve la <strong style={{ color: K_COL }}>altura objetivo y = k</strong>: el discriminante de h(t) = k dice cuántas veces la alcanza.
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 11.5, color: T.text2 }}>A la altura <strong style={{ color: K_COL }}>k = {fmtCoef(k)}</strong></span>
              <span style={{ fontSize: 13, fontWeight: 900, color: K_COL, fontFamily: "ui-monospace, monospace" }}>
                {mostrarK ? `${altura.n} vez${altura.n === 1 ? "" : "es"}` : "= eje X (suelo)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="Discriminante Δ" value={fmtDelta(calc.delta)} col={casoColor} size={18} />
            <Readout label="Raíces reales" value={`${nReales}`} col={accent} size={18} />
            <Readout label="Vértice x" value={calc.esCuadratica ? fmtNum(calc.vx) : "—"} col={B_COL} size={18} />
            <Readout label="Vértice y" value={calc.esCuadratica ? fmtNum(calc.vy) : "—"} col={C_COL} size={18} />
          </div>
          <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>RAÍCES DE ax² + bx + c = 0</span>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 4 }}>
              {raicesTexto(calc.caso, calc.raices, calc.compleja)}
            </div>
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{d.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{d.texto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((d, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Cálculo <strong>exacto</strong>: Δ, raíces, vértice y los cruces con y = k se obtienen de forma cerrada con la fórmula general; no hay aproximación didáctica. El eje vertical de la escena se reescala para encuadrar la parábola, así que las unidades de pantalla cambian, pero los <strong>valores numéricos</strong> de las lecturas siempre son reales. El cohete <strong>h(t) = −5t² + 30t + 10</strong> y sus alturas son verbatim de la actividad.
        </span>
      </div>
    </div>
  );
}

/* ── Mini-lectura para la tarjeta del caso ───────────────────────────────── */
function Mini({ label, value, col }: { label: string; value: string; col: string }) {
  return (
    <div style={{ padding: "9px 11px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace", marginTop: 3 }}>{value}</div>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  const fill = `${((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
