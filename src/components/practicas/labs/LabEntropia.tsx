"use client";

/**
 * Laboratorio 3D — Entropía y leyes de la termodinámica.
 * Práctica experimental para CNEYT-II-P10-A1
 * ("Entropía, entalpía y leyes de la termodinámica").
 *
 * La primera ley dice que la energía se conserva, pero no explica por qué los
 * procesos ocurren en un solo sentido. La ENTROPÍA (S) mide el desorden —la
 * dispersión de la energía— y la SEGUNDA LEY afirma que en todo proceso
 * espontáneo la entropía total del universo aumenta: el calor fluye de lo
 * caliente a lo frío, dos gases se mezclan pero no se separan solos. La TERCERA
 * LEY dice que la entropía de un cristal perfecto en el cero absoluto es cero,
 * y que 0 K es inalcanzable. El lab hace visible la flecha del tiempo.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import { ENTROPIA_FICHA } from "./entropia-segunda-ley-ficha";
import { QUIZ_A2 } from "./entropia-segunda-ley-data";
import {
  type ProcesoKey,
  PROCESOS,
  getProceso,
  LEYES,
  kelvinACelsius,
  fmtNum,
  T_CRISTAL_MIN, T_CRISTAL_MAX, T_CRISTAL_STEP,
} from "./entropia-data";

const EntropiaScene = dynamic(() => import("./EntropiaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-snowflake fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const FRIO = "#5BC8FF";

const RETO_KEY = "cen-entropia-segunda-ley-reto";

export function LabEntropia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [proceso, setProceso] = useState<ProcesoKey>("mezcla");
  const [activo, setActivo] = useState(false); // pared quitada / en contacto
  const [tempCristal, setTempCristal] = useState(220); // K
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioMezcla, setVioMezcla] = useState(false);
  const [vioCalor, setVioCalor] = useState(false);
  const [vioCristal, setVioCristal] = useState(false);
  const [enfrioCerca, setEnfrioCerca] = useState(false);

  // reto evaluable, teoría (cajón) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const proc = useMemo(() => getProceso(proceso), [proceso]);
  const tC = useMemo(() => kelvinACelsius(tempCristal), [tempCristal]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarProceso = (k: ProcesoKey) => {
    setProceso(k);
    setActivo(false); // cada proceso arranca en su estado inicial
    bump();
    if (sonido) audioRef.current?.blip();
    if (k === "mezcla") setVioMezcla(true);
    if (k === "calor") setVioCalor(true);
    if (k === "cristal") setVioCristal(true);
  };

  const cambiarTemp = (k: number) => {
    setTempCristal(k);
    if (k <= 40) setEnfrioCerca(true);
  };

  const reset = () => {
    setActivo(false);
    if (proceso === "cristal") setTempCristal(220);
    bump();
  };

  const esCristal = proceso === "cristal";

  const objetivos = [
    { txt: "Mezcla dos gases y ve que no se separan", done: vioMezcla && activo },
    { txt: "Deja que el calor fluya al equilibrio", done: vioCalor },
    { txt: "Ordena un cristal cerca de 0 K", done: vioCristal },
    { txt: "Acércate al cero absoluto (S → 0)", done: enfrioCerca },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
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

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-shuffle" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El desorden del universo siempre aumenta</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: en todo proceso espontáneo la entropía total sube. Por eso el calor va de lo caliente a lo frío y los gases se mezclan, pero nunca al revés.
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
        .ex-actbtn { cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:9px;
          padding:13px 16px; border-radius:13px; border:1px solid var(--exc); font-size:13.5px; font-weight:800; transition:all .15s; }
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
              <EntropiaScene
                proceso={proceso}
                activo={activo}
                tempCristal={tempCristal}
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
              <span style={{ fontSize: 13, fontWeight: 900, color: accent }}>
                <i className={`fa-solid ${proc.icono}`} style={{ marginRight: 7 }} />
                {proc.nombre}
              </span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: `rgba(${color.rgba},0.18)`, color: T.text2 }}>{proc.ley}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawerOpen} onClick={() => setDrawerOpen(true)} title="Teoría">
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

            {/* Pie: descripción del proceso */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 560 }}>{proc.resumen}</div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawerOpen(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Selector de proceso + controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
              Proceso a observar
            </Eyebrow>
            <div className="ex-seg" style={{ marginBottom: 18 }}>
              {PROCESOS.map((p) => (
                <button
                  key={p.key}
                  className="ex-segbtn"
                  data-on={proceso === p.key}
                  onClick={() => cambiarProceso(p.key)}
                  style={{ ["--exc" as string]: accent }}
                >
                  <i className={`fa-solid ${p.icono}`} style={{ fontSize: 18, color: proceso === p.key ? accent : T.text3 }} />
                  {p.nombre}
                </button>
              ))}
            </div>

            {/* Acción: pared / contacto (mezcla y calor) */}
            {!esCristal && (
              <button
                className="ex-actbtn"
                onClick={() => setActivo((v) => !v)}
                style={{
                  ["--exc" as string]: activo ? OK : accent,
                  background: activo ? `rgba(52,211,153,0.14)` : `rgba(${color.rgba},0.14)`,
                  color: activo ? OK : "#fff",
                }}
              >
                <i className={`fa-solid ${activo ? "fa-rotate-left" : "fa-play"}`} />
                {activo ? (proc.accionOff ?? "Reiniciar") : (proc.accionOn ?? "Iniciar")}
              </button>
            )}

            {/* Deslizador de temperatura (cristal) */}
            {esCristal && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: FRIO }}>
                    <i className="fa-solid fa-temperature-half" style={{ marginRight: 6 }} />
                    Temperatura del cristal
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: FRIO }}>{fmtNum(tempCristal, 0)} K · {fmtNum(tC, 0)} °C</span>
                </div>
                <input type="range" className="ex-range" min={T_CRISTAL_MIN} max={T_CRISTAL_MAX} step={T_CRISTAL_STEP} value={tempCristal}
                  onChange={(e) => cambiarTemp(Number(e.target.value))}
                  style={{ ["--exc" as string]: FRIO, ["--exfill" as string]: `${((tempCristal - T_CRISTAL_MIN) / (T_CRISTAL_MAX - T_CRISTAL_MIN)) * 100}%` }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3 }}>
                  <span>≈ 0 K (orden total)</span>
                  <span>{T_CRISTAL_MAX} K (caliente)</span>
                </div>
              </div>
            )}
          </div>

          {/* Por qué funciona */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>La entropía y la flecha del tiempo</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
              La <strong style={{ color: accent }}>entropía (S)</strong> mide el desorden: qué tan dispersa está la energía. La primera ley dice que la energía se <strong style={{ color: T.text }}>conserva</strong>, pero no explica el sentido de los procesos. La <strong style={{ color: accent }}>segunda ley</strong> sí: en todo cambio espontáneo, la entropía total del universo <strong style={{ color: T.text }}>aumenta</strong>. Esa es la flecha del tiempo.
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>EN ESTE PROCESO</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                {proc.resumen}
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Las leyes de la termodinámica</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LEYES.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{l.nombre}</div>
                  <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{l.enunciado}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Entalpía: exo y endotérmico</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La <strong style={{ color: accent }}>entalpía (H = U + PV)</strong> es el calor que se intercambia a presión constante. Si el proceso <strong style={{ color: "#ff8a5a" }}>libera</strong> calor es <strong style={{ color: "#ff8a5a" }}>exotérmico</strong> (como la combustión); si <strong style={{ color: FRIO }}>absorbe</strong> calor es <strong style={{ color: FRIO }}>endotérmico</strong> (como disolver ciertas sales, que enfrían el agua).
          </div>

          <div className="ex-divider" />

          <Eyebrow>El cero absoluto</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La escala <strong style={{ color: accent }}>Kelvin</strong> empieza en el <strong style={{ color: T.text }}>cero absoluto</strong> (−273.15 °C): el punto donde un cristal perfecto tendría su entropía mínima (cero). Puedes acercarte cuanto quieras, pero <strong style={{ color: FRIO }}>nunca llegar</strong>.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Para pensar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué nunca ves que una taza fría caliente sola a la mesa que la rodea?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Si la energía se conserva, ¿por qué no se puede deshacer la mezcla?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué ninguna máquina térmica puede ser 100% eficiente?</div>
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
            Fíjate en la <strong style={{ color: accent }}>barra de entropía</strong> a la derecha: en la mezcla y el flujo de calor solo <strong style={{ color: T.text }}>sube</strong>. Solo al enfriar el cristal hacia 0 K la verás <strong style={{ color: FRIO }}>bajar</strong> hacia cero.
          </span>
        </div>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla ───────────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
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
        playPick={sonido ? () => audioRef.current?.blip() : undefined}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawerOpen} onClick={() => setDrawerOpen(false)} />
      <aside className="ex-drawer" data-open={drawerOpen} aria-hidden={!drawerOpen}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawerOpen(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={ENTROPIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
