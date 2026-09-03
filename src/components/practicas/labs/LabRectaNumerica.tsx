"use client";

/**
 * Laboratorio 3D — Recta numérica.
 * Práctica experimental para PM-I-P02-A2.
 *
 * El estudiante ubica un número (entero o racional) sobre la recta y, en un
 * contexto real (termómetro, altitud, dinero), descubre tres ideas:
 *   · El SIGNO ubica a cada lado del cero.
 *   · El OPUESTO −a está a la misma distancia del cero, del otro lado.
 *   · El VALOR ABSOLUTO |a| es esa distancia (siempre ≥ 0).
 * En el modo OPERAR, sumar es un salto a la derecha y restar un salto a la
 * izquierda: así se ve por qué restar es sumar el opuesto.
 * Pensamiento Matemático I.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RECTA_NUMERICA_FICHA } from "./recta-numerica-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./recta-numerica-data";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import {
  CONTEXTOS,
  RANGO,
  RANGO_OP,
  opuesto,
  absoluto,
  operar,
  fmtNum,
  type Contexto,
  type Modo,
  type Operacion,
} from "./recta-data";

const RectaScene = dynamic(() => import("./RectaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-horizontal fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const OPP_COL = "#22D3EE";
const ABS_COL = "#FFD166";

const RETO_KEY = "cen-recta-numerica-reto";

export function LabRectaNumerica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [ctxKey, setCtxKey] = useState(CONTEXTOS[0]!.key);
  const ctx = useMemo<Contexto>(() => CONTEXTOS.find((c) => c.key === ctxKey) ?? CONTEXTOS[0]!, [ctxKey]);

  const [modo, setModo] = useState<Modo>("ubicar");
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const [op, setOp] = useState<Operacion>("suma");
  const [showOpuesto, setShowOpuesto] = useState(false);
  const [showAbsoluto, setShowAbsoluto] = useState(false);

  const [autoRotate, setAutoRotate] = useState(true);
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

  // seguimiento de objetivos
  const [movioA, setMovioA] = useState(false);
  const [vioNegativo, setVioNegativo] = useState(false);
  const [vioOpuesto, setVioOpuesto] = useState(false);
  const [vioAbsoluto, setVioAbsoluto] = useState(false);
  const [vioSuma, setVioSuma] = useState(false);
  const [vioResta, setVioResta] = useState(false);

  const fmtVal = (n: number) => (ctx.unidad ? `${fmtNum(n)} ${ctx.unidad}` : fmtNum(n));

  const resultado = useMemo(() => operar(a, b, op), [a, b, op]);
  const opp = useMemo(() => opuesto(a), [a]);
  const abs = useMemo(() => absoluto(a), [a]);

  const moverA = (v: number) => {
    setA(v);
    setMovioA(true);
    if (v < 0) setVioNegativo(true);
  };
  const moverB = (v: number) => {
    setB(v);
    setMovioA(true);
  };
  const elegirOp = (o: Operacion) => {
    setOp(o);
    if (sonido) audioRef.current?.blip();
    if (o === "suma") setVioSuma(true);
    else setVioResta(true);
    if (operar(a, b, o) < 0) setVioNegativo(true);
  };
  const elegirModo = (m: Modo) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "operar") {
      if (op === "suma") setVioSuma(true);
      else setVioResta(true);
    }
  };
  const toggleOpuesto = () => {
    if (sonido) audioRef.current?.blip();
    setShowOpuesto((v) => {
      if (!v) setVioOpuesto(true);
      return !v;
    });
  };
  const toggleAbsoluto = () => {
    if (sonido) audioRef.current?.blip();
    setShowAbsoluto((v) => {
      if (!v) setVioAbsoluto(true);
      return !v;
    });
  };
  const reset = () => {
    setResetNonce((n) => n + 1);
  };

  const sumando = op === "suma";

  const objetivos = [
    { txt: "Mueve un número sobre la recta", done: movioA },
    { txt: "Coloca un número negativo (izquierda del cero)", done: vioNegativo },
    { txt: "Activa el opuesto y el valor absoluto", done: vioOpuesto && vioAbsoluto },
    { txt: "Haz una suma y una resta como saltos", done: vioSuma && vioResta },
    { txt: "Resuelve el reto de operaciones con enteros", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const liveTxt =
    modo === "operar"
      ? `${fmtNum(a)} ${sumando ? "+" : "−"} ${fmtNum(b)} = ${fmtNum(resultado)}`
      : `${ctx.titulo === "Número puro" ? "" : `${ctx.titulo}: `}${fmtVal(a)}`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${ctx.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>{liveTxt}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la recta 3D, pero la idea sigue: cada número ocupa un único lugar según su signo y su distancia al cero.
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
        .ex-chip { cursor:pointer; text-align:left; border-radius:11px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          padding:10px 12px; transition:all .14s ease; display:flex; align-items:center; gap:10px; }
        .ex-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-chip[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-seg { display:flex; gap:4px; padding:4px; border-radius:12px; background:${T.inset}; border:1px solid ${T.line}; }
        .ex-segbtn { flex:1; cursor:pointer; border:none; border-radius:9px; padding:9px 10px; font-size:13.5px; font-weight:800;
          background:transparent; color:${T.text2}; transition:all .14s ease; display:flex; align-items:center; justify-content:center; gap:8px; }
        .ex-segbtn:hover { color:#fff; }
        .ex-segbtn[data-on="true"] { background:rgba(${color.rgba},0.2); color:#fff; box-shadow:0 0 14px -6px ${accent}; }
        .ex-slider { -webkit-appearance:none; appearance:none; width:100%; height:7px; border-radius:999px; background:${T.lineStrong}; outline:none; cursor:pointer; }
        .ex-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-slider::-moz-range-thumb { width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-toggle { cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          padding:12px 14px; transition:all .14s ease; display:flex; align-items:center; gap:11px; width:100%; }
        .ex-toggle:hover { border-color:${T.lineStrong}; color:#fff; }
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
              <RectaScene
                modo={modo}
                a={a}
                b={b}
                op={op}
                resultado={resultado}
                showOpuesto={showOpuesto}
                showAbsoluto={showAbsoluto}
                unidad={ctx.unidad}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>{liveTxt}</span>
            </div>

            {/* Etiqueta inferior */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className={`fa-solid ${ctx.icono}`} style={{ marginRight: 7, color: accent }} />
              {modo === "ubicar" ? "Ubicar · signo, opuesto y valor absoluto" : "Operar · sumar y restar como saltos"}
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar vista">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Controles según el modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            {modo === "ubicar" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Número en la recta</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: accent, ...NUM }}>{fmtVal(a)}</span>
                </div>
                <input className="ex-slider" type="range" min={-RANGO} max={RANGO} step={0.5} value={a} onChange={(e) => moverA(Number(e.target.value))} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
                  <span>−{RANGO}</span>
                  <span>0</span>
                  <span>+{RANGO}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                  <button className="ex-toggle" data-on={showOpuesto} onClick={toggleOpuesto} style={showOpuesto ? { borderColor: OPP_COL, background: `${OPP_COL}1f`, color: "#fff" } : undefined}>
                    <i className="fa-solid fa-left-right" style={{ color: OPP_COL, fontSize: 16 }} />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Opuesto −a</span>
                  </button>
                  <button className="ex-toggle" data-on={showAbsoluto} onClick={toggleAbsoluto} style={showAbsoluto ? { borderColor: ABS_COL, background: `${ABS_COL}1f`, color: "#fff" } : undefined}>
                    <i className="fa-solid fa-ruler" style={{ color: ABS_COL, fontSize: 16 }} />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Valor absoluto |a|</span>
                  </button>
                </div>

                <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 16 }}>
                  <Readout label="Número" value={fmtNum(a)} unit={ctx.unidad || undefined} col={accent} size={15} />
                  <div style={{ width: 1, background: T.line }} />
                  <Readout label="Opuesto −a" value={fmtNum(opp)} col={OPP_COL} size={15} />
                  <div style={{ width: 1, background: T.line }} />
                  <Readout label="Valor absoluto |a|" value={fmtNum(abs)} col={ABS_COL} size={15} />
                </div>
              </>
            ) : (
              <>
                <div className="ex-seg" style={{ marginBottom: 16 }}>
                  <button className="ex-segbtn" data-on={sumando} onClick={() => elegirOp("suma")}>
                    <i className="fa-solid fa-plus" /> Sumar
                  </button>
                  <button className="ex-segbtn" data-on={!sumando} onClick={() => elegirOp("resta")}>
                    <i className="fa-solid fa-minus" /> Restar
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Inicio (a)</span>
                  <span style={{ fontSize: 17, fontWeight: 900, color: T.text, ...NUM }}>{fmtVal(a)}</span>
                </div>
                <input className="ex-slider" type="range" min={-RANGO_OP} max={RANGO_OP} step={0.5} value={a} onChange={(e) => moverA(Number(e.target.value))} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
                  <span>−{RANGO_OP}</span>
                  <span>+{RANGO_OP}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "16px 0 9px" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Cantidad ({sumando ? "salto a la derecha" : "salto a la izquierda"})</span>
                  <span style={{ fontSize: 17, fontWeight: 900, color: ABS_COL, ...NUM }}>{fmtNum(b)}</span>
                </div>
                <input className="ex-slider" type="range" min={0} max={RANGO_OP} step={0.5} value={b} onChange={(e) => moverB(Number(e.target.value))} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
                  <span>0</span>
                  <span>+{RANGO_OP}</span>
                </div>

                <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 16 }}>
                  <Readout label="Inicio" value={fmtNum(a)} unit={ctx.unidad || undefined} size={15} />
                  <div style={{ width: 1, background: T.line }} />
                  <Readout label={sumando ? "Sumas" : "Restas"} value={`${sumando ? "+" : "−"}${fmtNum(b)}`} col={ABS_COL} size={15} />
                  <div style={{ width: 1, background: T.line }} />
                  <Readout label="Resultado" value={fmtNum(resultado)} unit={ctx.unidad || undefined} col={accent} size={15} />
                </div>
              </>
            )}
          </div>

          {/* El corazón de la idea */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>{modo === "ubicar" ? "Signo, opuesto y valor absoluto" : "Sumar y restar es moverse"}</Eyebrow>
            {modo === "ubicar" ? (
              <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
                Un número {a > 0 ? <strong style={{ color: T.text }}>positivo</strong> : a < 0 ? <strong style={{ color: T.text }}>negativo</strong> : <strong style={{ color: T.text }}>cero</strong>}{" "}
                vive {a > 0 ? "a la derecha" : a < 0 ? "a la izquierda" : "en el origen"} del cero ({ctx.cero}). Su <strong style={{ color: OPP_COL }}>opuesto</strong> es{" "}
                <strong style={{ color: OPP_COL, ...NUM }}>{fmtNum(opp)}</strong>: la misma distancia del cero, del otro lado. Y su{" "}
                <strong style={{ color: ABS_COL }}>valor absoluto</strong> <strong style={{ color: ABS_COL, ...NUM }}>|{fmtNum(a)}| = {fmtNum(abs)}</strong> es esa distancia —
                nunca es negativa.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
                  {sumando ? (
                    <>
                      <strong style={{ color: T.text }}>Sumar</strong> es avanzar a la <strong style={{ color: T.text }}>derecha</strong>: partes de{" "}
                      <strong style={{ color: T.text, ...NUM }}>{fmtNum(a)}</strong> y das un salto de <strong style={{ color: ABS_COL, ...NUM }}>{fmtNum(b)}</strong>.
                    </>
                  ) : (
                    <>
                      <strong style={{ color: T.text }}>Restar</strong> es avanzar a la <strong style={{ color: T.text }}>izquierda</strong>: partes de{" "}
                      <strong style={{ color: T.text, ...NUM }}>{fmtNum(a)}</strong> y retrocedes <strong style={{ color: ABS_COL, ...NUM }}>{fmtNum(b)}</strong>. Restar{" "}
                      {fmtNum(b)} es lo mismo que sumar su opuesto, −{fmtNum(b)}.
                    </>
                  )}
                </div>
                <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${accent}55`, background: `${accent}14`, padding: "13px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                  <i className={`fa-solid ${sumando ? "fa-arrow-right" : "fa-arrow-left"}`} style={{ color: accent, fontSize: 18 }} />
                  <div style={{ fontSize: 16, fontWeight: 900, color: T.text, ...NUM }}>
                    {fmtNum(a)} {sumando ? "+" : "−"} {fmtNum(b)} = {fmtNum(resultado)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>¿Qué quieres hacer?</Eyebrow>
          <div className="ex-seg">
            <button className="ex-segbtn" data-on={modo === "ubicar"} onClick={() => elegirModo("ubicar")}>
              <i className="fa-solid fa-location-dot" /> Ubicar
            </button>
            <button className="ex-segbtn" data-on={modo === "operar"} onClick={() => elegirModo("operar")}>
              <i className="fa-solid fa-plus-minus" /> Operar
            </button>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Contexto · ¿qué significa el signo?</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {CONTEXTOS.map((c) => (
              <button key={c.key} className="ex-chip" data-on={c.key === ctxKey} onClick={() => setCtxKey(c.key)}>
                <i className={`fa-solid ${c.icono}`} style={{ fontSize: 15, width: 18, textAlign: "center", color: c.key === ctxKey ? accent : T.text3 }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{c.titulo}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, padding: "13px 15px", fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            <div style={{ display: "flex", gap: 9, marginBottom: 7 }}>
              <span style={{ color: accent, fontWeight: 900, minWidth: 16 }}>+</span>
              <span>Derecha del cero: <strong style={{ color: T.text }}>{ctx.positivo}</strong>.</span>
            </div>
            <div style={{ display: "flex", gap: 9, marginBottom: 7 }}>
              <span style={{ color: OPP_COL, fontWeight: 900, minWidth: 16 }}>−</span>
              <span>Izquierda del cero: <strong style={{ color: T.text }}>{ctx.negativo}</strong>.</span>
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <span style={{ color: T.text3, fontWeight: 900, minWidth: 16 }}>0</span>
              <span>El origen: <strong style={{ color: T.text }}>{ctx.cero}</strong>.</span>
            </div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Modo" value={modo === "ubicar" ? "Ubicar" : "Operar"} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label={modo === "ubicar" ? "Posición" : "Resultado"} value={fmtNum(modo === "ubicar" ? a : resultado)} unit={ctx.unidad || undefined} size={15} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            El cero no es el menor de todos: a su izquierda los números siguen, cada vez más pequeños (−1, −2, −3…).
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
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? OK : T.text2 }}>
                <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
                <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Cada número tiene <strong style={{ color: T.text }}>un solo lugar</strong> en la recta: su <strong style={{ color: T.text }}>signo</strong> dice de qué lado del cero, y su{" "}
            <strong style={{ color: ABS_COL }}>distancia al cero</strong> (el valor absoluto) dice qué tan lejos. Operar es <strong style={{ color: T.text }}>moverse</strong> sobre ella.
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
          <FichaTeorica data={RECTA_NUMERICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
