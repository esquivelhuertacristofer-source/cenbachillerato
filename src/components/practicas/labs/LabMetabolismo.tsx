"use client";

/**
 * Laboratorio 3D — "Metabolismo celular en 3D: respiración y fotosíntesis".
 * Práctica experimental para CNEYT-VI-P03-A2 (ejercicio matemático "ATP total en
 * respiración aerobia"; progresión 3 "Explica los procesos de metabolismo celular:
 * respiración celular y fotosíntesis a nivel molecular", UAC CNEYT-VI).
 *
 * Tres procesos:
 *  (a) respiracion  — respiración aerobia (mitocondria): glucólisis → Krebs → cadena.
 *  (b) fotosintesis — cloroplasto: fase lumínica → ciclo de Calvin.
 *  (c) fermentacion — citosol (sin O₂): glucólisis → fermentación.
 * Avanza etapa por etapa con ‹ ›; en respiración y fermentación el contador de ATP
 * acumulado demuestra el ejercicio A2: 2 + 2 + 32 = 36 ATP.
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { METABOLISMO_FICHA } from "./metabolismo-ficha";
import {
  type Proceso, PROCESOS, PROCESOS_DEF, etapasDe,
  PROBLEMA_ATP, RESPUESTA_ATP, DESGLOSE_ATP, RETO_A2,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, GLOSARIO, CONTEXTO, FUENTE, DATOS,
} from "./metabolismo-data";

const MetabolismoScene = dynamic(() => import("./MetabolismoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el metabolismo en 3D…</span>
    </div>
  ),
});

export function LabMetabolismo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [proceso, setProceso] = useState<Proceso>("respiracion");
  const [idx, setIdx] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
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

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarProceso = (p: Proceso) => {
    setProceso(p);
    setIdx(0);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const resetProceso = () => {
    setIdx(0);
    bump();
  };

  // valores en vivo
  const def = PROCESOS_DEF[proceso];
  const etapas = etapasDe(proceso);
  const seguro = etapas.length > 0 ? Math.min(idx, etapas.length - 1) : 0;
  const etapa = etapas[seguro];
  const etapaActiva = etapa ? etapa.id : null;
  const procCol = `#${def.color.replace("#", "")}`;

  // ATP acumulado hasta la etapa actual (respiración / fermentación)
  const muestraAtp = def.atpTotal >= 0; // -1 = fotosíntesis (n/a)
  const atpAcum = etapas.slice(0, seguro + 1).reduce((s, e) => s + e.atp, 0);
  const atpTotal = etapas.reduce((s, e) => s + e.atp, 0);
  const pasoUltimo = seguro >= etapas.length - 1;

  const prev = () => {
    if (sonido) audioRef.current?.blip();
    setIdx((i) => Math.max(0, i - 1));
  };
  const next = () => {
    if (sonido) audioRef.current?.blip();
    setIdx((i) => Math.min(etapas.length - 1, i + 1));
  };

  // panel de contador (valor calculado, no componente anidado)
  const contador: ReactNode = muestraAtp ? (
    <div style={{ borderRadius: 14, padding: "16px 18px", border: `1px solid ${procCol}55`, background: `${procCol}14` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: T.text3 }}>ATP ACUMULADO</span>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3 }}>etapa {seguro + 1} / {etapas.length}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: "#fde047", fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>{atpAcum}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>/ {atpTotal} ATP</span>
        {pasoUltimo && atpAcum === 36 && (
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 900, color: "#86efac", border: "1px solid #86efac55", borderRadius: 7, padding: "4px 9px" }}>
            <i className="fa-solid fa-check" style={{ marginRight: 6 }} />2 + 2 + 32 = 36
          </span>
        )}
      </div>
      {/* barra segmentada por etapa */}
      <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
        {etapas.map((e, i) => {
          const ec = `#${e.color.replace("#", "")}`;
          const peso = atpTotal > 0 ? Math.max(e.atp / atpTotal, e.atp === 0 ? 0.06 : 0.08) : 1 / etapas.length;
          return (
            <div key={e.id} style={{ flex: peso, height: 10, borderRadius: 4, background: i <= seguro ? ec : "rgba(255,255,255,0.08)", opacity: i <= seguro ? 1 : 0.5, transition: "all .2s" }} title={`${e.nombre}: +${e.atp} ATP`} />
          );
        })}
      </div>
    </div>
  ) : (
    <div style={{ borderRadius: 14, padding: "16px 18px", border: `1px solid ${procCol}55`, background: `${procCol}14` }}>
      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: T.text3, marginBottom: 8 }}>BALANCE DE LA FOTOSÍNTESIS</div>
      <div style={{ fontSize: 12.5, color: "#eaf0fb", lineHeight: 1.5 }}>
        La fotosíntesis <strong>no rinde ATP neto para la célula</strong>: el ATP que genera la fase lumínica se consume en el ciclo de Calvin para fabricar glucosa. Su producto energético es la <strong>glucosa</strong> (C₆H₁₂O₆), combustible que luego la respiración oxida para liberar ~36 ATP.
      </div>
    </div>
  );

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar el proceso en 3D, pero la información sigue aquí. {def.resumen} {etapa ? `Etapa actual — ${etapa.nombre}: ${etapa.descripcion}` : ""}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes mePulse { 0%,100%{ box-shadow:0 0 0 0 var(--mec); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .me-live-dot { animation: mePulse 1.6s ease-in-out infinite; }
        .me-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,27vw,400px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .me-grid { grid-template-columns: 1fr; } }
        .me-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .me-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .me-icobtn:hover { background:rgba(255,255,255,0.12); }
        .me-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .me-tab { cursor:pointer; border:1px solid var(--mec); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .me-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .me-tab:hover { background:rgba(255,255,255,0.06); }
        .me-step { cursor:pointer; border-radius:9px; padding:8px 6px; text-align:center; transition:all .15s;
          border:1px solid rgba(255,255,255,0.12); background:rgba(4,10,22,0.4); color:#fff; }
        .me-nav { cursor:pointer; width:42px; height:42px; border-radius:11px; border:1px solid var(--mec);
          background:transparent; color:#fff; font-size:16px; transition:all .15s; flex-shrink:0; }
        .me-nav:disabled { opacity:0.3; cursor:not-allowed; }
        .me-nav:not(:disabled):hover { background:var(--mecf); }
        @media (max-width: 1000px){ .me-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .mt-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .mt-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .mt-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .mt-drawer[data-open="true"] { transform:translateX(0); }
        .mt-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .mt-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .mt-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .mt-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .mt-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .mt-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de proceso */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="me-tabs">
          {PROCESOS.map((p) => {
            const d = PROCESOS_DEF[p];
            const col = `#${d.color.replace("#", "")}`;
            const on = p === proceso;
            return (
              <button key={p} className="me-tab" data-on={on} onClick={() => cambiarProceso(p)}
                style={{ ["--mec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="me-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <MetabolismoScene
                proceso={proceso}
                etapaActiva={etapaActiva}
                onSelect={(id) => {
                  const i = etapas.findIndex((e) => e.id === id);
                  if (i >= 0) setIdx(i);
                }}
                playing={playing}
                accent={accent}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${procCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="me-live-dot" style={{ ["--mec" as string]: `${procCol}aa`, width: 9, height: 9, borderRadius: "50%", background: procCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="me-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="me-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="me-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar animación" : "Reanudar animación"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="me-icobtn" onClick={resetProceso} title="Reiniciar la vista">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="mt-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: procCol, marginRight: 7 }} />
                {def.etq} · {def.organelo} · {etapas.length} etapas{muestraAtp ? ` · ${atpTotal} ATP por glucosa` : ""}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {etapa
                  ? `${etapa.nombre} (${etapa.lugar}): ${etapa.reactivos} → ${etapa.productos}${etapa.atp > 0 ? ` · +${etapa.atp} ATP` : ""}`
                  : "Selecciona un proceso para comenzar."}
              </div>
            </div>
          </div>

          {/* Stepper: navegación por etapas */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-shoe-prints" style={{ marginRight: 8, color: procCol }} />
                Recorrido paso a paso — {def.etq}
              </Eyebrow>
            </div>

            <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
              <button className="me-nav" onClick={prev} disabled={seguro <= 0}
                style={{ ["--mec" as string]: `${procCol}66`, ["--mecf" as string]: `${procCol}22` }} title="Etapa anterior">
                <i className="fa-solid fa-chevron-left" />
              </button>

              <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${etapas.length}, 1fr)`, gap: 8 }}>
                {etapas.map((e, i) => {
                  const on = i === seguro;
                  const done = i < seguro;
                  const ec = `#${e.color.replace("#", "")}`;
                  return (
                    <button key={e.id} className="me-step" onClick={() => setIdx(i)}
                      style={{ border: `1px solid ${on ? ec : done ? `${ec}55` : "rgba(255,255,255,0.12)"}`, background: on ? `${ec}22` : done ? `${ec}10` : "rgba(4,10,22,0.4)" }}>
                      <div style={{ fontSize: 15, marginBottom: 3, color: on || done ? ec : T.text3 }}><i className={`fa-solid ${e.icono}`} /></div>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: on ? "#fff" : T.text2, lineHeight: 1.2 }}>{e.nombre}</div>
                      <div style={{ fontSize: 9.5, fontWeight: 900, marginTop: 3, color: e.atp > 0 ? "#fde047" : T.text3, fontFamily: "ui-monospace, monospace" }}>{e.atp > 0 ? `+${e.atp} ATP` : "0 ATP"}</div>
                    </button>
                  );
                })}
              </div>

              <button className="me-nav" onClick={next} disabled={seguro >= etapas.length - 1}
                style={{ ["--mec" as string]: `${procCol}66`, ["--mecf" as string]: `${procCol}22` }} title="Siguiente etapa">
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>

            {/* Detalle de la etapa seleccionada */}
            {etapa && (
              <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${`#${etapa.color.replace("#", "")}`}44`, background: `${`#${etapa.color.replace("#", "")}`}12` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#04121f", background: `#${etapa.color.replace("#", "")}` }}>
                    <i className={`fa-solid ${etapa.icono}`} />
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{etapa.nombre}</div>
                    <div style={{ fontSize: 10.5, color: T.text3 }}><i className="fa-solid fa-location-dot" style={{ marginRight: 5 }} />{etapa.lugar}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: etapa.fuente === "A2" ? "#fcd34d" : etapa.fuente === "A5" ? "#86efac" : T.text3, border: `1px solid ${etapa.fuente === "A2" ? "#fcd34d55" : etapa.fuente === "A5" ? "#86efac55" : T.line}`, borderRadius: 6, padding: "3px 7px" }}>
                    {etapa.fuente === "A2" ? "EJERCICIO A2" : etapa.fuente === "A5" ? "GLOSARIO A5" : "LECTURA A1"}
                  </span>
                </div>
                {/* reactivos → productos */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#cdd8ec", fontFamily: "ui-monospace, monospace", padding: "4px 9px", borderRadius: 7, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>{etapa.reactivos}</span>
                  <i className="fa-solid fa-arrow-right" style={{ color: procCol }} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", fontFamily: "ui-monospace, monospace", padding: "4px 9px", borderRadius: 7, background: `${procCol}1f`, border: `1px solid ${procCol}55` }}>{etapa.productos}</span>
                  {etapa.atp > 0 && (
                    <span style={{ fontSize: 11.5, fontWeight: 900, color: "#fde047", fontFamily: "ui-monospace, monospace", padding: "4px 9px", borderRadius: 7, background: "#fde0471f", border: "1px solid #fde04755" }}>
                      <i className="fa-solid fa-bolt" style={{ marginRight: 5 }} />+{etapa.atp} ATP
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: "#eaf0fb", lineHeight: 1.55 }}>{etapa.descripcion}</div>
                {etapa.detalle && (
                  <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${T.line}`, fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>
                    <i className="fa-solid fa-lightbulb" style={{ color: "#fbbf24", marginRight: 7 }} />
                    {etapa.detalle}
                  </div>
                )}
              </div>
            )}

            {/* Contador de ATP / balance */}
            <div style={{ marginTop: 14 }}>{contador}</div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-bolt" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor del metabolismo</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ecuación global del proceso */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${procCol}40`, background: `${procCol}10` }}>
            <Eyebrow>
              <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: procCol }} />
              Ecuación global — {def.etq}
            </Eyebrow>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", lineHeight: 1.5, padding: "10px 12px", borderRadius: 10, background: "rgba(4,10,22,0.5)", border: `1px solid ${procCol}33` }}>
              {def.ecuacion}
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginTop: 11 }}>{def.resumen}</div>
          </div>

          {/* Reto A2: ATP total */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #fcd34d55", background: "rgba(252,211,77,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: "#fcd34d" }} />
              Reto A2 — ATP total en respiración aerobia
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{PROBLEMA_ATP}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {DESGLOSE_ATP.map((d, i) => {
                const pct = Math.max(8, (d.atp / 36) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
                      <span style={{ color: "#fff" }}>{d.etapa} <span style={{ color: T.text3, fontWeight: 600 }}>· {d.lugar}</span></span>
                      <span style={{ color: "#fde047", fontFamily: "ui-monospace, monospace" }}>{d.atp} ATP</span>
                    </div>
                    <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "#fbbf24" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 11, background: "rgba(252,211,77,0.12)", border: "1px solid #fcd34d44" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>2 + 2 + 32 =</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fde047", fontFamily: "ui-monospace, monospace" }}>{RESPUESTA_ATP} ATP</span>
            </div>
          </div>

          {/* Pasos para explorar */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Cómo usar el laboratorio
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas de reflexión */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Para reflexionar
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="me-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${def.icono}`} style={{ marginRight: 8, color: procCol }} />
            Lecturas — {def.etq}
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="etapas" value={`${etapas.length}`} col={procCol} size={14} />
            <Readout label="organelo" value={def.organelo.split(" ")[0] ?? def.organelo} col="#fff" size={13} />
            <Readout label="usa O₂" value={def.aerobio ? "Sí" : "No"} col={def.aerobio ? "#86efac" : "#fca5a5"} size={14} />
            <Readout label="ATP / glucosa" value={muestraAtp ? `${atpTotal}` : "n/a"} col="#fde047" size={14} />
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

          {/* Contexto mexicano: SINAP */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />
              México: el equilibrio fotosíntesis–respiración
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          {/* Glosario */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((g, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{g.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</span>
                </div>
              ))}
            </div>
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
          El problema, los pasos guía y la respuesta (<strong>2 + 2 + 32 = 36 ATP</strong>) son <strong>verbatim</strong> del ejercicio A2 (etiqueta «EJERCICIO A2»). Las definiciones de las etapas de la respiración, la fotosíntesis y la fermentación son verbatim del glosario A5 (etiqueta «GLOSARIO A5»). El modelo 3D es <strong>esquemático</strong>: la mitocondria, el cloroplasto y el citosol, los nodos de cada etapa, las moléculas que recorren la ruta y las fichas de ATP son representaciones visuales (no a escala, ni con el número real de moléculas) para identificar dónde ocurre cada etapa y cuánta energía produce. Las ideas clave, el contexto del SINAP y las preguntas para reflexionar son de la lectura A1. Fuente: {FUENTE}
        </span>
      </div>

      {/* Objetivo evaluable */}
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: ejercicioAprobado ? "#86efac" : T.text2 }}>
        <i className={`fa-solid ${ejercicioAprobado ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: ejercicioAprobado ? 1 : 0.3, color: ejercicioAprobado ? "#86efac" : undefined }} />
        <span style={{ fontWeight: ejercicioAprobado ? 700 : 500 }}>Resuelve el reto evaluable de la actividad A2</span>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────── */}
      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={() => {
          if (sonido) audioRef.current?.correcto();
        }}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="mt-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="mt-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="mt-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="mt-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="mt-drawer-body">
          <FichaTeorica data={METABOLISMO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
