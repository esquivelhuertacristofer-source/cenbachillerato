"use client";

/**
 * Laboratorio 3D — Ecuaciones cuadráticas: tres métodos y el discriminante.
 * Práctica experimental para PM-III-P02-A2 (progresión 2).
 *
 * El alumno mueve los coeficientes a, b, c y ve la parábola y = ax²+bx+c como
 * un "valle" sobre el "agua" (y = 0): las raíces de ax²+bx+c=0 son donde el
 * valle toca el agua. En vivo se calculan el discriminante Δ = b²−4ac, el número
 * de soluciones reales, el vértice y las tres formas de resolver (factorización,
 * completar el cuadrado y fórmula general). Incluye el caso verbatim del terreno
 * del agricultor (2w²+5w−133=0 → w=7 m, l=19 m).
 * Pensamiento Matemático III — ecuaciones cuadráticas (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  EJEMPLOS, METODOS, CASO_AGRICULTOR,
  discriminante, resolver, vertice, polinomio, fmt, fmtCoef,
  A_MIN, A_MAX, A_STEP, A_DEFAULT,
  B_MIN, B_MAX, B_STEP, B_DEFAULT,
  C_MIN, C_MAX, C_STEP, C_DEFAULT,
} from "./cuadratica-data";

const CuadraticaScene = dynamic(() => import("./CuadraticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-superscript fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const AZUL = "#3aa0ff";
const AMBAR = "#ffd24a";
const ROSA = "#ff7ad9";
const VERDE = "#34D399";

export function LabCuadratica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(A_DEFAULT);
  const [b, setB] = useState(B_DEFAULT);
  const [c, setC] = useState(C_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioDos, setVioDos] = useState(false);
  const [vioUna, setVioUna] = useState(false);
  const [vioNinguna, setVioNinguna] = useState(false);
  const [vioCaso, setVioCaso] = useState(false);

  const bump = () => setResetNonce((n) => n + 1);

  const aSeguro = (v: number) => (v === 0 ? (a >= 0 ? 1 : -1) : v); // a ≠ 0

  const disc = useMemo(() => discriminante(a, b, c), [a, b, c]);
  const raices = useMemo(() => resolver(a, b, c), [a, b, c]);
  const v = useMemo(() => vertice(a, b, c), [a, b, c]);
  const poli = useMemo(() => polinomio(a, b, c), [a, b, c]);

  // marca objetivos según el tipo de solución actual
  if (raices.tipo === "dos" && !vioDos) setVioDos(true);
  if (raices.tipo === "una" && !vioUna) setVioUna(true);
  if (raices.tipo === "ninguna" && !vioNinguna) setVioNinguna(true);

  const cargar = (na: number, nb: number, nc: number) => {
    setA(aSeguro(na)); setB(nb); setC(nc); bump();
  };
  const cargarCaso = () => {
    cargar(CASO_AGRICULTOR.a, CASO_AGRICULTOR.b, CASO_AGRICULTOR.c);
    setVioCaso(true);
  };
  const reset = () => cargar(A_DEFAULT, B_DEFAULT, C_DEFAULT);

  // texto del estado de las soluciones
  const estado = useMemo(() => {
    if (raices.tipo === "no_cuadratica") return { txt: "no es cuadrática (a = 0)", col: T.text3, n: "—" };
    if (raices.tipo === "dos") return { txt: "dos soluciones reales", col: VERDE, n: "2" };
    if (raices.tipo === "una") return { txt: "una solución (raíz doble)", col: AMBAR, n: "1" };
    return { txt: "sin soluciones reales", col: "#94a3b8", n: "0" };
  }, [raices.tipo]);

  // formas resueltas (para el panel de métodos)
  const formaFactor = useMemo(() => {
    if (raices.tipo === "dos") {
      const [r1, r2] = raices.reales;
      const fac = (r: number) => `(x ${r >= 0 ? "−" : "+"} ${fmt(Math.abs(r))})`;
      return `${a === 1 ? "" : a === -1 ? "−" : fmtCoef(a)}${fac(r1!)}${fac(r2!)} = 0`;
    }
    if (raices.tipo === "una") {
      const r = raices.reales[0]!;
      return `${a === 1 ? "" : fmtCoef(a)}(x ${r >= 0 ? "−" : "+"} ${fmt(Math.abs(r))})² = 0`;
    }
    return "no factoriza en los reales";
  }, [a, raices]);

  const formaCuadrado = useMemo(() => {
    const h = v.x; // a(x − h)² + k
    const k = v.y;
    const coef = a === 1 ? "" : fmtCoef(a);
    return `${coef}(x ${h <= 0 ? "+" : "−"} ${fmt(Math.abs(h))})² ${k >= 0 ? "+" : "−"} ${fmt(Math.abs(k))}`;
  }, [a, v]);

  const objetivos = [
    { txt: "Mira una ecuación con 2 raíces", done: vioDos },
    { txt: "Encuentra una raíz doble (Δ=0)", done: vioUna },
    { txt: "Halla un caso sin raíces (Δ<0)", done: vioNinguna },
    { txt: "Resuelve el caso del agricultor", done: vioCaso },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-superscript" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Las raíces tocan el eje</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: las soluciones de {poli} son los puntos donde la parábola corta el eje x. El discriminante Δ = b²−4ac dice cuántos cortes hay.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse2 { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse2 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182c 0%,#03101f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <CuadraticaScene
                a={a} b={b} c={c}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — la ecuación */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${estado.col}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${estado.col}aa`, width: 9, height: 9, borderRadius: "50%", background: estado.col }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14.5, fontWeight: 900, color: "#eaf2fb", fontFamily: "ui-monospace, monospace" }}>{poli}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
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

            {/* Pie: lectura del discriminante */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.9) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 14, color: "#eaf6ee", fontFamily: "ui-monospace, monospace", fontWeight: 800 }}>
                Δ = b² − 4ac = <span style={{ color: estado.col }}>{fmtCoef(disc)}</span> → <span style={{ color: estado.col }}>{estado.txt}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>
                {raices.tipo === "dos" && <>La parábola corta el agua (eje x) en dos puntos: <strong style={{ color: AMBAR }}>x = {raices.reales.map((r) => fmt(r)).join(" y ")}</strong>.</>}
                {raices.tipo === "una" && <>El vértice toca justo el agua: una <strong style={{ color: AMBAR }}>raíz doble x = {fmt(raices.reales[0]!)}</strong>.</>}
                {raices.tipo === "ninguna" && <>El valle no alcanza el agua: <strong style={{ color: "#94a3b8" }}>no hay soluciones reales</strong> (sí complejas).</>}
                {raices.tipo === "no_cuadratica" && <>Con a = 0 deja de ser cuadrática: ya no hay parábola.</>}
              </div>
            </div>
          </div>

          {/* Controles: coeficientes */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Coeficientes de ax² + bx + c
            </Eyebrow>
            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="a (abre/cierra y orienta la parábola)" icon="fa-a" colr={accent}
                valor={fmtCoef(a)} min={A_MIN} max={A_MAX} step={A_STEP} value={a}
                onChange={(val) => { setA(aSeguro(val)); }} hintL="a ≠ 0" hintR={`${A_MAX}`} />
              <Deslizador label="b (desplaza el vértice)" icon="fa-b" colr={ROSA}
                valor={fmtCoef(b)} min={B_MIN} max={B_MAX} step={B_STEP} value={b}
                onChange={setB} hintL={`${B_MIN}`} hintR={`${B_MAX}`} />
              <Deslizador label="c (sube/baja la curva = corte con y)" icon="fa-c" colr={AMBAR}
                valor={fmtCoef(c)} min={C_MIN} max={C_MAX} step={C_STEP} value={c}
                onChange={setC} hintL={`${C_MIN}`} hintR={`${C_MAX}`} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {EJEMPLOS.map((e) => (
                <button key={e.label} className="ex-chip" onClick={() => cargar(e.a, e.b, e.c)}
                  style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontFamily: "ui-monospace, monospace", color: "#fff" }}>{e.label}</span>
                  <span style={{ fontSize: 10.5, color: T.text3, fontWeight: 600 }}>{e.metodo}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Soluciones + vértice */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
              Soluciones
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
              <Readout label="Discriminante Δ" value={fmtCoef(disc)} col={estado.col} size={16} />
              <Readout label="Soluciones reales" value={estado.n} col={estado.col} size={18} />
              <Readout label="Raíces (x)" value={raices.reales.length ? raices.reales.map((r) => fmt(r)).join(", ") : "—"} col={AMBAR} size={15} />
              <Readout label="Vértice" value={`(${fmt(v.x)}, ${fmt(v.y)})`} col={ROSA} size={14} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              El <strong style={{ color: estado.col }}>discriminante</strong> Δ = b² − 4ac decide todo: si es positivo hay dos raíces, si es cero una raíz doble (el vértice toca el eje) y si es negativo ninguna real. El signo de <strong style={{ color: accent }}>a</strong> dice si la parábola abre hacia arriba (a&gt;0) o hacia abajo (a&lt;0).
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Los tres métodos, en vivo</Eyebrow>

          {/* Factorización */}
          <Metodo icono={METODOS[0]!.icono} nombre={METODOS[0]!.nombre} color={accent} desc={METODOS[0]!.desc}
            formula={formaFactor} />
          <div className="ex-divider" />
          {/* Completar el cuadrado */}
          <Metodo icono={METODOS[1]!.icono} nombre={METODOS[1]!.nombre} color={ROSA} desc={METODOS[1]!.desc}
            formula={`${formaCuadrado} = 0`} />
          <div className="ex-divider" />
          {/* Fórmula general */}
          <Metodo icono={METODOS[2]!.icono} nombre={METODOS[2]!.nombre} color={AMBAR} desc={METODOS[2]!.desc}
            formula={`x = (−(${fmtCoef(b)}) ± √${fmtCoef(disc)}) / (2·${fmtCoef(a)})`} />

          <div className="ex-divider" />

          {/* Caso del agricultor */}
          <Eyebrow>Caso real: el terreno</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
            {CASO_AGRICULTOR.resumen}
          </div>
          <button onClick={cargarCaso}
            style={{ width: "100%", cursor: "pointer", padding: "11px 14px", borderRadius: 12, border: `1px solid rgba(${color.rgba},0.5)`, background: `rgba(${color.rgba},0.16)`, color: "#fff", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
            <i className="fa-solid fa-ruler-combined" />
            Cargar {CASO_AGRICULTOR.ecuacion}
          </button>
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
            Sube <strong style={{ color: AMBAR }}>c</strong> poco a poco con <strong style={{ color: accent }}>a&gt;0</strong>: el valle sube hasta despegarse del <strong style={{ color: AZUL }}>agua</strong> y las dos raíces se juntan, se vuelven una (Δ=0) y desaparecen (Δ&lt;0). Eso es el discriminante hecho imagen.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Un método con su fórmula resuelta en vivo ───────────────────────── */
function Metodo({ icono, nombre, color, desc, formula }: {
  icono: string; nombre: string; color: string; desc: string; formula: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color, background: `${color}22` }}>
          <i className={`fa-solid ${icono}`} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{nombre}</span>
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45, marginBottom: 8 }}>{desc}</div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5, fontWeight: 800, color, padding: "8px 11px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${color}33`, wordBreak: "break-word" }}>
        {formula}
      </div>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────── */
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
