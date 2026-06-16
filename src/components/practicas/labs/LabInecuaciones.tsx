"use client";

/**
 * Laboratorio 3D — Inecuaciones lineales.
 * Práctica experimental para PM-II-P06-A2
 * ("Planteo y resuelvo inecuaciones lineales"; progresión 103).
 *
 * Una inecuación compara dos cantidades con <, ≤, > o ≥ y su solución es un
 * CONJUNTO, no un punto: un rayo sobre la recta numérica (una variable) o un
 * semiplano en el plano (dos variables). Se resuelve igual que una ecuación con
 * una excepción crítica: al dividir entre un número negativo, el signo se
 * invierte. En la recta, punto abierto (○) si el límite no se incluye, cerrado
 * (●) si sí; en el plano, frontera continua (≤/≥) o punteada (</>).
 * Pensamiento Matemático II — Introducción al Álgebra (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { INECUACIONES_FICHA } from "./inecuaciones-lineales-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./inecuaciones-lineales-data";
import { LabSfx } from "./lab-audio";
import {
  type ModoKey,
  type Op,
  MODOS,
  OPS,
  getModo,
  getOp,
  DEFAULTS,
  resolverRecta,
  fmtNum,
  fmtTerminoX,
  fmtTerminoXY,
  A_MIN, A_MAX, A_STEP, B_MIN, B_MAX, B_STEP, C_MIN, C_MAX, C_STEP,
} from "./inecuaciones-data";

const InecuacionesScene = dynamic(() => import("./InecuacionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-left-right-to-line fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";

export function LabInecuaciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoKey>("recta");
  const [a, setA] = useState(DEFAULTS.recta.a);
  const [b, setB] = useState(DEFAULTS.recta.b);
  const [c, setC] = useState(DEFAULTS.recta.c);
  const [op, setOp] = useState<Op>(DEFAULTS.recta.op);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, teoría (cajón deslizable) y sonido
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

  // objetivos
  const [vioRecta, setVioRecta] = useState(true);
  const [vioPlano, setVioPlano] = useState(false);
  const [vioFlip, setVioFlip] = useState(false);
  const [cambioOp, setCambioOp] = useState(false);

  const md = useMemo(() => getModo(modo), [modo]);
  const esRecta = modo === "recta";
  const opDef = useMemo(() => getOp(op), [op]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (k: ModoKey) => {
    setModo(k);
    const d = DEFAULTS[k];
    setA(d.a); setB(d.b); setC(d.c); setOp(d.op);
    bump();
    if (k === "recta") setVioRecta(true);
    if (k === "plano") setVioPlano(true);
  };

  // 'a' no puede ser 0 en modo recta (dejaría de ser inecuación en x);
  // en modo plano, no pueden ser 0 a y b a la vez.
  const cambiarA = (v: number) => {
    if (esRecta && v === 0) v = a < 0 ? -1 : 1;
    if (!esRecta && v === 0 && b === 0) v = 1;
    setA(v);
    if (v < 0) setVioFlip(true);
  };
  const cambiarB = (v: number) => {
    if (!esRecta && v === 0 && a === 0) v = 1;
    setB(v);
  };
  const cambiarOp = (k: Op) => { setOp(k); setCambioOp(true); if (sonido) audioRef.current?.blip(); };

  const reset = () => {
    const d = DEFAULTS[modo];
    setA(d.a); setB(d.b); setC(d.c); setOp(d.op);
    bump();
  };

  const sol = useMemo(() => resolverRecta(a, b, c, op), [a, b, c, op]);

  // textos de la inecuación
  const izq = esRecta ? fmtTerminoX(a, b) : fmtTerminoXY(a, b);
  const inecuacion = `${izq} ${opDef.sim} ${fmtNum(c, 0)}`;
  const solucionTxt = `x ${getOp(sol.opFinal).sim} ${fmtNum(sol.k, 2)}`;

  const objetivos = [
    { txt: "Resuelve una inecuación de una variable", done: vioRecta },
    { txt: "Pon a negativa y observa el giro del signo", done: vioFlip },
    { txt: "Cambia el símbolo (< ≤ > ≥)", done: cambioOp },
    { txt: "Explora el semiplano con dos variables", done: vioPlano },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-arrows-left-right-to-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La solución de una inecuación es un conjunto, no un punto</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: una inecuación define un rayo en la recta o un semiplano en el plano. Y recuerda: dividir entre un negativo invierte el signo.
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
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-seg { display:flex; gap:6px; flex-wrap:wrap; }
        .ex-segbtn { cursor:pointer; flex:1 1 0; min-width:92px; display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:11px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2};
          font-size:12.5px; font-weight:700; transition:all .15s; }
        .ex-segbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-segbtn[data-on="true"] { border-color:var(--exc); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--exc); }
        .ex-opbtn { cursor:pointer; flex:1 1 0; min-width:54px; padding:10px 6px; border-radius:11px; border:1px solid ${T.line};
          background:${T.inset}; color:${T.text2}; font-size:18px; font-weight:900; font-family:ui-monospace,monospace; transition:all .15s; }
        .ex-opbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-opbtn[data-on="true"] { border-color:var(--exc); background:rgba(${color.rgba},0.16); color:#fff; }
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
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <InecuacionesScene
                modo={modo}
                a={a}
                b={b}
                c={c}
                op={op}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className={`fa-solid ${md.icono}`} style={{ marginRight: 8 }} />
                {inecuacion}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
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

            {/* Pie: descripción del modo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 580 }}>{md.resumen}</div>
            </div>
          </div>

          {/* Selector de modo + controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Arma tu inecuación
            </Eyebrow>
            <div className="ex-seg" style={{ marginBottom: 18 }}>
              {MODOS.map((m) => (
                <button
                  key={m.key}
                  className="ex-segbtn"
                  data-on={modo === m.key}
                  onClick={() => cambiarModo(m.key)}
                  style={{ ["--exc" as string]: accent }}
                >
                  <i className={`fa-solid ${m.icono}`} style={{ fontSize: 18, color: modo === m.key ? accent : T.text3 }} />
                  {m.nombre}
                </button>
              ))}
            </div>

            {/* Selector de símbolo */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text2, marginBottom: 8 }}>Símbolo de desigualdad</div>
              <div style={{ display: "flex", gap: 6 }}>
                {OPS.map((o) => (
                  <button
                    key={o.key}
                    className="ex-opbtn"
                    data-on={op === o.key}
                    onClick={() => cambiarOp(o.key)}
                    style={{ ["--exc" as string]: accent }}
                    title={o.lee}
                  >
                    {o.sim}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Deslizador label={esRecta ? "Coeficiente de x (a)" : "Coeficiente de x (a)"} icon="fa-a" colr={accent}
                valor={fmtNum(a, 0)} min={A_MIN} max={A_MAX} step={A_STEP} value={a} onChange={cambiarA}
                hintL={esRecta ? "negativo: el signo gira" : undefined} hintR={esRecta ? "0 no permitido" : undefined} />
              <Deslizador label={esRecta ? "Término independiente (b)" : "Coeficiente de y (b)"} icon="fa-b" colr={"#7fb0e0"}
                valor={fmtNum(b, 0)} min={B_MIN} max={B_MAX} step={B_STEP} value={b} onChange={cambiarB} />
              <Deslizador label="Lado derecho (c)" icon="fa-equals" colr={ORO}
                valor={fmtNum(c, 0)} min={C_MIN} max={C_MAX} step={C_STEP} value={c} onChange={setC} />
            </div>
          </div>

          {/* Resultado en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-square-root-variable" style={{ marginRight: 8, color: accent }} />
              {esRecta ? "Solución sobre la recta" : "El semiplano solución"}
            </Eyebrow>
            {esRecta ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Solución" value={solucionTxt} col={accent} size={16} />
                  <Readout label="Frontera x =" value={fmtNum(sol.k, 2)} col={ORO} />
                  <Readout label="Límite" value={sol.incluye ? "● incluido" : "○ abierto"} col={VERDE} size={15} />
                </div>
                {sol.flipped ? (
                  <div style={{ fontSize: 12.5, color: "#ffd9a8", lineHeight: 1.5, background: "rgba(255,138,58,0.12)", border: "1px solid rgba(255,138,58,0.35)", borderRadius: 10, padding: "10px 12px" }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7, color: ORO }} />
                    Como <strong>a = {fmtNum(a, 0)}</strong> es negativo, al dividir entre él el signo se <strong>invirtió</strong>: <strong style={{ color: accent }}>{opDef.sim}</strong> pasó a <strong style={{ color: accent }}>{getOp(sol.opFinal).sim}</strong>.
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                    Despejas la x igual que en una ecuación: <strong style={{ color: T.text }}>{inecuacion}</strong> → <strong style={{ color: accent }}>{solucionTxt}</strong>. La solución son <strong>todos</strong> los valores del rayo, no uno solo.
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Frontera" value={`${fmtTerminoXY(a, b)} = ${fmtNum(c, 0)}`} col={ORO} size={15} />
                  <Readout label="Trazo de la frontera" value={opDef.incluye ? "continua" : "punteada"} col={VERDE} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  La recta <strong style={{ color: ORO }}>{fmtTerminoXY(a, b)} = {fmtNum(c, 0)}</strong> parte el plano en dos. La región <strong style={{ color: VERDE }}>verde elevada</strong> es el conjunto solución: todos los puntos (x, y) que cumplen <strong style={{ color: accent }}>{inecuacion}</strong>. {opDef.incluye ? "La frontera está incluida (trazo continuo)." : "La frontera no está incluida (trazo punteado)."}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Ecuación vs. inecuación</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Una <strong style={{ color: T.text }}>ecuación</strong> (=) tiene una solución única: un punto. Una <strong style={{ color: accent }}>inecuación</strong> (&lt;, ≤, &gt;, ≥) tiene un <strong>conjunto infinito</strong> de soluciones: un <strong>intervalo</strong> sobre la recta (una variable) o un <strong>semiplano</strong> en el plano (dos variables).
          </div>

          <div className="ex-divider" />

          <Eyebrow>Los cuatro símbolos</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {OPS.map((o) => (
              <div key={o.key} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 12.5, color: T.text2 }}>
                <span style={{ width: 30, textAlign: "center", fontSize: 17, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{o.sim}</span>
                <span>{o.lee} — límite <strong style={{ color: o.incluye ? VERDE : "#9fb2c8" }}>{o.incluye ? "incluido (●)" : "abierto (○)"}</strong></span>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>¡Cuidado! El giro del signo</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Operas igual que en una ecuación, con <strong>una</strong> excepción: al multiplicar o dividir ambos lados por un número <strong style={{ color: ORO }}>negativo</strong>, el signo de la desigualdad se <strong style={{ color: accent }}>invierte</strong>.
            <div style={{ marginTop: 8, padding: "8px 11px", borderRadius: 8, background: T.inset, fontFamily: "ui-monospace, monospace", fontSize: 13, color: T.text }}>
              −2x &gt; 6 → x <strong style={{ color: accent }}>&lt;</strong> −3
            </div>
            <span style={{ display: "block", marginTop: 7, fontSize: 12 }}>Pon <strong>a</strong> en negativo y míralo en el panel de solución.</span>
          </div>

          <div className="ex-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Las inecuaciones son el lenguaje de las <strong>restricciones</strong>: el salario mínimo (salario ≥ mínimo), el presupuesto familiar (gastos ≤ ingreso), o las hectáreas de un cultivo (trigo + maíz ≤ 100). Empresas como FEMSA o Bimbo usan sistemas de inecuaciones —<strong>programación lineal</strong>— para optimizar rutas y producción.
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
            En <strong style={{ color: accent }}>Una variable</strong>, la cuenta que recorre la recta se pone <strong style={{ color: VERDE }}>verde</strong> justo donde cumple la inecuación: ese tramo es la solución. En <strong style={{ color: accent }}>Dos variables</strong>, la región que se <strong style={{ color: VERDE }}>eleva</strong> es el semiplano solución.
          </span>
        </div>
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
          <FichaTeorica data={INECUACIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: `${((value - min) / (max - min)) * 100}%` }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
