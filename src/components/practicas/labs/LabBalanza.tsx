"use client";

/**
 * Laboratorio 3D — Ecuación lineal de una variable (la balanza).
 * Práctica experimental para PM-II-P09-A8.
 *
 * Una ecuación a·x + b = c es una BALANZA en equilibrio. El estudiante despeja x
 * aplicando la PROPIEDAD DE UNIFORMIDAD: quita las mismas unidades de AMBOS lados
 * (la balanza sigue nivelada) y luego reparte en partes iguales. Si opera en un
 * SOLO lado, la balanza se inclina: rompió la igualdad. Cuando queda una sola x
 * frente a su valor, el problema está resuelto.
 * Pensamiento Matemático II — Ecuación, igualdad y sus propiedades (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  ESCENARIOS,
  solucion,
  ladoIzq,
  estadoInicial,
  type Escenario,
  type Estado,
} from "./balanza-data";

const BalanzaScene = dynamic(() => import("./BalanzaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-scale-balanced fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const GOLD = "#FFD166";
const WARN = "#F97066";

export function LabBalanza({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const xTrue = useMemo(() => solucion(esc), [esc]);
  const [st, setSt] = useState<Estado>(() => estadoInicial(ESCENARIOS[0]!));
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // seguimiento de objetivos
  const [usoUniformidad, setUsoUniformidad] = useState(false);
  const [rompioIgualdad, setRompioIgualdad] = useState(false);
  const [resueltos, setResueltos] = useState<Set<string>>(() => new Set<string>());

  const equilibrada = st.aCount * xTrue + st.leftUnits === st.rightUnits;
  const resuelto = st.aCount === 1 && st.leftUnits === 0 && equilibrada;

  const cargar = (e: Escenario) => {
    setEscKey(e.key);
    setSt(estadoInicial(e));
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    setSt(estadoInicial(esc));
    setResetNonce((n) => n + 1);
  };

  const marcarResuelto = (e: Estado) => {
    if (e.aCount === 1 && e.leftUnits === 0 && e.aCount * xTrue + e.leftUnits === e.rightUnits) {
      setResueltos((prev) => (prev.has(esc.key) ? prev : new Set(prev).add(esc.key)));
    }
  };

  // Operaciones
  const quitarAmbos = () => {
    if (st.leftUnits <= 0 || st.rightUnits <= 0) return;
    const e = { ...st, leftUnits: st.leftUnits - 1, rightUnits: st.rightUnits - 1 };
    setSt(e);
    setUsoUniformidad(true);
    marcarResuelto(e);
  };

  const dividir = () => {
    if (st.leftUnits !== 0 || st.aCount <= 1 || st.rightUnits % st.aCount !== 0) return;
    const e = { ...st, rightUnits: st.rightUnits / st.aCount, aCount: 1 };
    setSt(e);
    setUsoUniformidad(true);
    marcarResuelto(e);
  };

  const quitarIzq = () => {
    if (st.leftUnits <= 0) return;
    setSt({ ...st, leftUnits: st.leftUnits - 1 });
    setRompioIgualdad(true);
  };

  const quitarDer = () => {
    if (st.rightUnits <= 0) return;
    setSt({ ...st, rightUnits: st.rightUnits - 1 });
    setRompioIgualdad(true);
  };

  const leftLabel = ladoIzq(st.aCount, st.leftUnits);
  const rightLabel = String(st.rightUnits);

  const puedeAmbos = st.leftUnits > 0 && st.rightUnits > 0;
  const puedeDividir = st.leftUnits === 0 && st.aCount > 1 && st.rightUnits % st.aCount === 0;

  // Pista del siguiente paso
  const pista = resuelto
    ? `¡x está despejada! En "${esc.titulo}" la incógnita vale ${xTrue} ${esc.unidad}.`
    : !equilibrada
    ? "La balanza está inclinada: rompiste la igualdad. Aplica la MISMA operación en el otro lado o reinicia."
    : st.leftUnits > 0
    ? `Quita las ${st.leftUnits} unidad${st.leftUnits === 1 ? "" : "es"} sueltas de AMBOS lados para dejar sola la x.`
    : st.aCount > 1
    ? `Tienes ${st.aCount} cajas iguales. Reparte en partes iguales: divide AMBOS lados entre ${st.aCount}.`
    : "Quita peso de ambos lados hasta despejar la x.";

  const estadoColor = resuelto ? GOLD : equilibrada ? OK : WARN;
  const estadoTxt = resuelto ? "x despejada" : equilibrada ? "En equilibrio" : "Igualdad rota";

  const objetivos = [
    { txt: "Quita unidades de ambos lados (uniformidad)", done: usoUniformidad },
    { txt: "Despeja la x en este problema", done: resuelto },
    { txt: "Comprueba que romper un solo lado inclina la balanza", done: rompioIgualdad },
    { txt: "Resuelve 2 problemas distintos", done: resueltos.size >= 2 },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{`${leftLabel} = ${rightLabel}`}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: una balanza con{" "}
        <strong>{leftLabel}</strong> de un lado y <strong>{rightLabel}</strong> del otro. Quita lo mismo de ambos lados hasta dejar sola la x.
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
        .ex-op { cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text};
          padding:12px 13px; transition:all .14s ease; display:flex; align-items:center; gap:11px; width:100%; font-weight:700; font-size:13.5px; }
        .ex-op:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-op:disabled { opacity:0.38; cursor:not-allowed; }
        .ex-op[data-kind="ok"]:not(:disabled) { border-color:${OK}55; }
        .ex-op[data-kind="ok"]:hover:not(:disabled) { background:${OK}18; box-shadow:0 0 16px -7px ${OK}; }
        .ex-op[data-kind="warn"]:not(:disabled) { border-color:${WARN}44; color:${T.text2}; }
        .ex-op[data-kind="warn"]:hover:not(:disabled) { background:${WARN}14; color:#fff; }
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
              <BalanzaScene
                xTrue={xTrue}
                aCount={st.aCount}
                leftUnits={st.leftUnits}
                rightUnits={st.rightUnits}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
                resuelto={resuelto}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO con el estado de la balanza */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${estadoColor}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${estadoColor}aa`, width: 9, height: 9, borderRadius: "50%", background: estadoColor }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: estadoColor, ...NUM }}>
                {estadoTxt}
                {resuelto ? ` · x = ${xTrue} ${esc.unidad}` : ""}
              </span>
            </div>

            {/* Ecuación actual */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 10, alignItems: "baseline", fontSize: 18, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: accent }}>{leftLabel}</span>
              <span style={{ color: T.text3 }}>=</span>
              <span style={{ color: resuelto ? GOLD : "#c8d6e6" }}>{rightLabel}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar el problema">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* Operaciones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${esc.icono}`} style={{ marginRight: 8, color: accent }} />
              {esc.titulo}
            </Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.5, marginBottom: 16 }}>{esc.contexto}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="ex-op" data-kind="ok" onClick={quitarAmbos} disabled={!puedeAmbos}>
                <i className="fa-solid fa-minus" style={{ color: OK, width: 18, textAlign: "center" }} />
                Quitar 1 de <strong>ambos</strong> lados
              </button>
              <button className="ex-op" data-kind="ok" onClick={dividir} disabled={!puedeDividir}>
                <i className="fa-solid fa-divide" style={{ color: OK, width: 18, textAlign: "center" }} />
                Dividir ambos entre {st.aCount > 1 ? st.aCount : esc.a}
              </button>
            </div>

            <div style={{ marginTop: 14, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: T.text3 }}>
              Prueba romper la igualdad
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 9 }}>
              <button className="ex-op" data-kind="warn" onClick={quitarIzq} disabled={st.leftUnits <= 0}>
                <i className="fa-solid fa-arrow-left" style={{ color: WARN, width: 18, textAlign: "center" }} />
                Quitar 1 solo a la izquierda
              </button>
              <button className="ex-op" data-kind="warn" onClick={quitarDer} disabled={st.rightUnits <= 0}>
                <i className="fa-solid fa-arrow-right" style={{ color: WARN, width: 18, textAlign: "center" }} />
                Quitar 1 solo a la derecha
              </button>
            </div>

            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 16 }}>
              <Readout label="Lado izquierdo" value={leftLabel} col={accent} size={16} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Lado derecho" value={rightLabel} col="#c8d6e6" size={16} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Balanza" value={estadoTxt} col={estadoColor} size={14} />
            </div>

            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${estadoColor}55`, background: `${estadoColor}14`, padding: "12px 15px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className={`fa-solid ${resuelto ? "fa-circle-check" : equilibrada ? "fa-lightbulb" : "fa-triangle-exclamation"}`} style={{ color: estadoColor, fontSize: 17 }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>{pista}</div>
            </div>
          </div>

          {/* Qué está pasando */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>La propiedad de uniformidad</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              Una ecuación es una <strong style={{ color: T.text }}>igualdad</strong>: los dos platos pesan lo mismo. Si haces algo de un lado <strong style={{ color: T.text }}>tienes que hacerlo del otro</strong>, así la balanza sigue nivelada. Por eso para despejar la <strong style={{ color: accent }}>x</strong> quitas las mismas unidades de ambos lados y luego repartes en partes iguales: cuando queda una sola x, el otro plato muestra su valor.
            </div>
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.10)`, padding: "13px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className="fa-solid fa-equals" style={{ color: accent, fontSize: 18 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.4 }}>{esc.porque}</div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Elige un problema</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.map((e) => {
              const on = e.key === escKey;
              const hecho = resueltos.has(e.key);
              return (
                <button key={e.key} className="ex-esc" data-on={on} onClick={() => cargar(e)}>
                  <i className={`fa-solid ${e.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: on ? accent : T.text3 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{e.titulo}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text3, ...NUM }}>
                    {ladoIzq(e.a, e.b)} = {e.c}
                  </span>
                  {hecho && <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 13 }} />}
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Cómo se despeja</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><strong style={{ color: T.text }}>1.</strong> Quita las unidades sueltas de <strong>ambos</strong> lados (resta lo mismo en los dos).</div>
            <div><strong style={{ color: T.text }}>2.</strong> Si quedan varias cajas iguales, <strong>divide</strong> ambos lados entre cuántas son.</div>
            <div><strong style={{ color: T.text }}>3.</strong> Queda una sola x: el otro plato muestra su valor.</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Resueltos" value={`${resueltos.size}/${ESCENARIOS.length}`} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Este problema" value={resuelto ? "Resuelto" : "En curso"} col={resuelto ? OK : T.text3} size={15} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Las <strong style={{ color: WARN }}>operaciones de un solo lado</strong> sirven para comprobar el error: la balanza se inclina porque rompiste la igualdad.
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
            Resolver una ecuación es <strong style={{ color: T.text }}>mantener el equilibrio</strong>: lo que haces de un lado, hazlo del otro. Así despejas la <strong style={{ color: accent }}>x</strong> sin romper la igualdad.
          </span>
        </div>
      </div>
    </div>
  );
}
