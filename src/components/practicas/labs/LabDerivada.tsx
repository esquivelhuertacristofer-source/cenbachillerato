"use client";

/**
 * Laboratorio 3D — La derivada: la secante que se vuelve tangente (cociente de
 * Newton).
 * Práctica experimental para PM-V-P03-A2 (ejercicio_matematico "Derivando desde
 * la definición: el cociente de Newton"; progresión 3, UAC PM-V Cálculo
 * Diferencial).
 *
 * El alumno elige una función, fija el punto de tangencia a y reduce la
 * separación h: la recta SECANTE (cociente de Newton) se confunde con la
 * TANGENTE y su pendiente tiende a la DERIVADA f'(a).
 * Casos verbatim del A2:
 *  (c) f(x)=x²  → tangente en x=2 es y=4x−4   (default)
 *  (a) f(x)=x²+3x → f'(x)=2x+3
 *  (b) f(x)=1/x  → f'(x)=−1/x²
 * + caso físico (verbatim A1): h(t)=−5t²+30t → velocidad h'(t)=−10t+30.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { DERIVADA_FICHA } from "./derivada-secante-tangente-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./derivada-secante-tangente-data";
import { LabSfx } from "./lab-audio";
import {
  FUNCIONES, func, evalFunc, deriv, pendienteSecante, tangente, cruzaCorte,
  tablaSecante, rectaStr, conUnidad,
  IDEAS, DATOS, fmt1, fmt2, fmt3,
  FUNC_DEF, H_MIN, H_MAX, H_DEF, H_STEP, type FuncId,
} from "./derivada-data";

const DerivadaScene = dynamic(() => import("./DerivadaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-combined fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Dibujando el plano…</span>
    </div>
  ),
});

const SEC_COL = "#fbbf24";   // secante (cociente de Newton)
const TAN_COL = "#34D399";   // tangente (derivada)
const Q_COL = "#f472b6";     // segundo punto a+h
const A_COL = "#7dd3fc";     // punto de tangencia a

export function LabDerivada({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [funcId, setFuncId] = useState<FuncId>(FUNC_DEF);
  const [aPos, setAPos] = useState<number>(func(FUNC_DEF).aDef);
  const [hSep, setHSep] = useState<number>(H_DEF);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, cajón de teoría y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const f = useMemo(() => func(funcId), [funcId]);

  // Animación: h oscila entre H_MAX y H_MIN → la secante "se cierra" sobre la
  // tangente una y otra vez (ilustra el límite h → 0).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = -1; // empieza cerrándose hacia h = 0
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setHSep((prev) => {
        let next = prev + dir * dt * (H_MAX - H_MIN) * 0.45;
        if (next <= H_MIN) { next = H_MIN; dir = 1; }
        else if (next >= H_MAX) { next = H_MAX; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirFunc = (id: FuncId) => {
    if (sonido) audioRef.current?.blip();
    setPlaying(false);
    setFuncId(id);
    setAPos(func(id).aDef);
    setHSep(H_DEF);
    bump();
  };
  const reset = () => {
    setPlaying(false);
    setFuncId(FUNC_DEF);
    setAPos(func(FUNC_DEF).aDef);
    setHSep(H_DEF);
    bump();
  };

  // valores en vivo
  const fa = evalFunc(funcId, aPos);
  const mDer = deriv(funcId, aPos);
  const mSec = pendienteSecante(funcId, aPos, hSep);
  const { m: mt, b: bt } = tangente(funcId, aPos);
  const secValida = !cruzaCorte(funcId, aPos, hSep) && Number.isFinite(mSec);
  const tabla = useMemo(() => tablaSecante(funcId, aPos), [funcId, aPos]);
  const esVerbatimTangente = funcId === "cuadratica" && Math.abs(aPos - 2) < 1e-6;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${f.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{f.titulo}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: la secante por (a, f(a)) y (a+h, f(a+h)) se vuelve tangente cuando h→0, y su pendiente es la derivada {f.derivExpr}.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseDer { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseDer 1.6s ease-in-out infinite; }
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
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:7px; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ex-drawer[data-open="true"] { transform:translateX(0); }
        .ex-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ex-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ex-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ex-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <DerivadaScene funcId={funcId} aPos={aPos} hSep={hSep} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{f.expr}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Cerrar la secante (h→0)"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className="fa-solid fa-ruler-combined" style={{ color: SEC_COL, marginRight: 7 }} />
                pendiente secante = <strong style={{ color: SEC_COL }}>{secValida ? fmt3(mSec) : "—"}</strong>
                &nbsp;&nbsp;→&nbsp;&nbsp;
                f&apos;({fmt2(aPos)}) = <strong style={{ color: TAN_COL }}>{fmt3(mDer)}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {hSep <= 0.1
                  ? `Con h = ${fmt2(hSep)} la secante casi coincide con la tangente: su pendiente ≈ f'(${fmt2(aPos)}).`
                  : `Reduce h hacia 0: la pendiente de la secante (${secValida ? fmt3(mSec) : "—"}) tiende a la derivada (${fmt3(mDer)}).`}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-ruler-combined" style={{ marginRight: 8, color: accent }} />
              Mueve el punto de tangencia a y cierra la separación h
            </Eyebrow>
            <Deslizador
              label="punto de tangencia a"
              icon="fa-crosshairs"
              colr={A_COL}
              valor={conUnidad(aPos, f.unidadX, 2)}
              min={f.aMin} max={f.aMax} step={0.05} value={aPos}
              onChange={(v) => { setPlaying(false); setAPos(v); }}
              hintL={conUnidad(f.aMin, f.unidadX, 1)} hintR={conUnidad(f.aMax, f.unidadX, 1)}
            />
            <div style={{ height: 14 }} />
            <Deslizador
              label="separación h (cociente de Newton)"
              icon="fa-arrows-left-right-to-line"
              colr={SEC_COL}
              valor={fmt2(hSep)}
              min={H_MIN} max={H_MAX} step={H_STEP} value={hSep}
              onChange={(v) => { setPlaying(false); setHSep(v); }}
              hintL={`h→0 (${fmt2(H_MIN)})`} hintR={fmt1(H_MAX)}
            />
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>
              ELIGE UNA FUNCIÓN
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FUNCIONES.map((ff) => (
                <button key={ff.id} className="ex-chip" data-on={funcId === ff.id} onClick={() => elegirFunc(ff.id)} title={ff.titulo}>
                  <i className={`fa-solid ${ff.icono}`} style={{ color: ff.color }} />
                  {ff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de acercamiento: la secante → la tangente */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-table-list" style={{ marginRight: 8, color: accent }} />
              Cuando h → 0, la pendiente de la secante → f&apos;({fmt2(aPos)}) = {fmt3(mDer)}
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <TablaLado titulo="por la derecha (h > 0)" filas={tabla.der} col={SEC_COL} />
              <TablaLado titulo="por la izquierda (h < 0)" filas={tabla.izq} col={Q_COL} />
            </div>
            <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 12, border: `1px solid ${TAN_COL}55`, background: `${TAN_COL}12`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
              <i className="fa-solid fa-arrow-right-long" style={{ color: TAN_COL, marginRight: 8 }} />
              Ambos lados convergen a <strong style={{ color: TAN_COL }}>{fmt3(mDer)}</strong>: ese límite es la derivada f&apos;({fmt2(aPos)}). La recta tangente es <strong style={{ color: TAN_COL, fontFamily: "ui-monospace, monospace" }}>{rectaStr(mt, bt)}</strong>.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Veredicto / función */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${f.color}66`, background: `${f.color}12` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: f.color }}>
                <i className={`fa-solid ${f.icono}`} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{f.titulo}</div>
                <div style={{ fontSize: 12.5, color: f.color, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{f.expr} · {f.derivExpr}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{f.contexto}</div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <MiniVal label={`f(${fmt2(aPos)})`} value={conUnidad(fa, f.unidadY, 2)} col={f.color} />
              <MiniVal label={f.esFisica ? "velocidad f'(a)" : "f'(a) (pendiente)"} value={f.esFisica ? conUnidad(mDer, `${f.unidadY}/${f.unidadX}`, 2) : fmt3(mDer)} col={TAN_COL} />
              <MiniVal label="secante (Newton)" value={secValida ? fmt3(mSec) : "—"} col={SEC_COL} />
            </div>
            {esVerbatimTangente && (
              <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 12, border: `1px solid ${TAN_COL}66`, background: `${TAN_COL}16`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                <i className="fa-solid fa-bullseye" style={{ color: TAN_COL, marginRight: 8 }} />
                Caso verbatim A2 (c): en <strong>x = 2</strong>, m = f&apos;(2) = <strong style={{ color: TAN_COL }}>4</strong>, punto (2, 4), tangente <strong style={{ color: TAN_COL, fontFamily: "ui-monospace, monospace" }}>y = 4x − 4</strong>.
              </div>
            )}
          </div>

          {/* Resolución paso a paso (verbatim A2) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Derivada por definición — paso a paso
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {f.pasos.map((p) => (
                <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notación y reglas (referencia) */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
              Cómo se lee la derivada
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <TipoRef icono="fa-infinity" col="#FB923C" titulo="Como límite" texto="f'(x) = lim(h→0) [f(x+h) − f(x)] / h: el límite del cociente de Newton." />
              <TipoRef icono="fa-ruler-combined" col="#34D399" titulo="Como pendiente" texto="f'(a) es la pendiente de la recta tangente a la curva en (a, f(a))." />
              <TipoRef icono="fa-gauge-high" col="#60A5FA" titulo="Como tasa de cambio" texto="Si s(t) es posición, s'(t) es velocidad: la rapidez instantánea del cambio." />
            </div>
          </div>
        </div>
      </div>

      {/* ── Objetivos ──────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Reduce h hacia 0 y observa la secante → tangente", done: hSep <= 0.15 },
            { txt: "Explora las 4 funciones disponibles", done: funcId !== FUNC_DEF },
            { txt: "Activa la animación h→0 (botón play)", done: playing },
            { txt: "Observa el caso verbatim A2 (c): x², x=2, y=4x−4", done: esVerbatimTangente },
            { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
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
            <Readout label={`punto a`} value={conUnidad(aPos, f.unidadX, 2)} col={A_COL} size={15} />
            <Readout label={`f(a)`} value={conUnidad(fa, f.unidadY, 2)} col={f.color} size={15} />
            <Readout label="secante (h)" value={secValida ? fmt3(mSec) : "—"} col={SEC_COL} size={15} />
            <Readout label="f'(a) derivada" value={fmt3(mDer)} col={TAN_COL} size={15} />
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
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
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Cálculo <strong>exacto</strong>: la derivada f&apos;(x) es simbólica y el cociente de Newton [f(a+h) − f(a)]/h se evalúa con la fórmula real, así que la secante converge numéricamente a la tangente. Los casos <strong>x² (tangente y = 4x − 4 en x = 2)</strong>, <strong>x² + 3x</strong> y <strong>1/x</strong> son verbatim del enunciado A2; el proyectil <strong>h(t) = −5t² + 30t</strong> es la interpretación física verbatim de la lectura A1 (la derivada como velocidad). El plano se dibuja a escala propia por caso para mostrar valores reales.
        </span>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────── */}
      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={
          sonido
            ? (ok) => {
                if (ok) audioRef.current?.correcto();
                else audioRef.current?.incorrecto();
              }
            : undefined
        }
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ex-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={DERIVADA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Mini valor ───────────────────────────────────────────────────────────── */
function MiniVal({ label, value, col }: { label: string; value: string; col: string }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}33` }}>
      <div style={{ fontSize: 10, color: T.text3, fontWeight: 800, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{value}</div>
    </div>
  );
}

/* ── Tarjeta de referencia ────────────────────────────────────────────────── */
function TipoRef({ icono, col, titulo, texto }: { icono: string; col: string; titulo: string; texto: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: T.glass, border: `1px solid ${col}33` }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icono}`} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{titulo}</div>
        <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{texto}</div>
      </div>
    </div>
  );
}

/* ── Columna de la tabla de acercamiento ──────────────────────────────────── */
function TablaLado({ titulo, filas, col }: {
  titulo: string;
  filas: { h: number; pendiente: number; valido: boolean }[];
  col: string;
}) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${col}33`, background: "rgba(4,10,22,0.35)", overflow: "hidden" }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, color: col, padding: "8px 12px", borderBottom: `1px solid ${col}22`, letterSpacing: "0.04em" }}>{titulo}</div>
      <div style={{ display: "grid", gap: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 10, color: T.text3, fontWeight: 800, padding: "5px 12px" }}>
          <span>h</span><span style={{ textAlign: "right" }}>pendiente</span>
        </div>
        {filas.map((fila, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 12, padding: "5px 12px", fontFamily: "ui-monospace, monospace", color: "#fff" }}>
            <span style={{ color: T.text2 }}>{fmt2(fila.h)}</span>
            <span style={{ textAlign: "right", color: fila.valido ? col : T.text3, fontWeight: 700 }}>
              {fila.valido ? fmt3(fila.pendiente) : "—"}
            </span>
          </div>
        ))}
      </div>
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
