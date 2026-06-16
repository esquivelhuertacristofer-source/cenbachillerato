"use client";

/**
 * Laboratorio 3D — "El origen de la vida: hipótesis científicas".
 * Práctica experimental anclada a CNEYT-VI-P01-A1 (lectura "El origen de la
 * vida: hipótesis científicas"; progresión 1, UAC CNEYT-VI "Organismos y
 * evolución biológica"). P01 no tiene A2 manipulable (su A2 es un quiz de opción
 * múltiple), por lo que el laboratorio se ancla a la lectura A1, con datos
 * verbatim del glosario A5 y de los quizzes A2/A4.
 *
 * Tres modos:
 *  (1) Miller-Urey — reconstrucción del aparato de 1953: el océano hierve, la
 *      atmósfera primitiva (CH₄, NH₃, H₂, H₂O) recibe descargas eléctricas y los
 *      aminoácidos se acumulan en la trampa. Sin chispa no hay síntesis.
 *  (2) Ambientes — las cunas candidatas de la vida: caldo primordial,
 *      ventiladeros hidrotermales y panspermia (meteorito de Murchison).
 *  (3) Mundo ARN — la ribozima (información + catálisis) y el coacervado.
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { ORIGEN_VIDA_FICHA } from "./origen-vida-ficha";
import {
  QUIZ_A2,
  type Modo,
  type Ambiente,
  MODOS,
  MODOS_DEF,
  AMBIENTES,
  AMBIENTES_DEF,
  hipotesisPorId,
  HIPOTESIS,
  GASES_PRIMITIVOS,
  PRODUCTOS_MILLER,
  ETAPAS_MILLER,
  GLOSARIO,
  PROBLEMA,
  DEFINICION_ABIOTICA,
  PREGUNTAS,
  CONTEXTO,
  FUENTE,
  HECHOS,
  DATOS,
  INSTRUCCIONES,
  IDEAS,
} from "./origen-vida-data";

const OrigenVidaScene = dynamic(() => import("./OrigenVidaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el origen de la vida en 3D…</span>
    </div>
  ),
});

const DIAS_MAX = 7;
const AMINO_VIS = 12; // aminoácidos visibles máximos en la trampa

export function LabOrigenVida({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("miller");
  const [ambiente, setAmbiente] = useState<Ambiente>("caldo");
  const [dias, setDias] = useState<number>(0);
  const [chispa, setChispa] = useState<boolean>(true);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // teoría (cajón deslizable) y sonido
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

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  // avance automático de "días" en el modo Miller
  useEffect(() => {
    if (modo !== "miller" || !playing) return;
    if (dias >= DIAS_MAX) return;
    const t = setInterval(() => setDias((d) => Math.min(DIAS_MAX, d + 1)), 1100);
    return () => clearInterval(t);
  }, [modo, playing, dias]);

  // aminoácidos: sin energía no hay síntesis (honestidad del modelo)
  const nAmino = chispa ? Math.round((dias / DIAS_MAX) * AMINO_VIS) : 0;
  const productosActivos = chispa ? Math.min(PRODUCTOS_MILLER.length, Math.ceil((dias / DIAS_MAX) * PRODUCTOS_MILLER.length)) : 0;

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPlaying(true);
    if (m === "miller") setDias(0);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const cambiarAmbiente = (a: Ambiente) => {
    setAmbiente(a);
    setPlaying(true);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reiniciar = () => {
    if (modo === "miller") setDias(0);
    setPlaying(true);
    bump();
  };

  const ambDef = AMBIENTES_DEF[ambiente];
  const hipMiller = hipotesisPorId("miller");
  const hipArn = hipotesisPorId("mundoarn");

  // pie del visor
  const pie: string =
    modo === "miller"
      ? chispa
        ? `Día ${dias}/${DIAS_MAX}: la descarga eléctrica sintetiza moléculas orgánicas que se acumulan en la trampa.${dias >= DIAS_MAX ? " Tras una semana, Miller obtuvo más de 20 aminoácidos distintos." : ""}`
        : "Sin energía eléctrica no hay síntesis: la atmósfera primitiva no produce aminoácidos. Enciende la chispa para reproducir el experimento."
      : modo === "ambientes"
        ? `${ambDef.etq}: ${ambDef.resumen}`
        : "El ARN almacena información (como el ADN) y cataliza reacciones (como las proteínas): por eso resuelve el dilema del huevo y la gallina ADN-proteínas.";

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION_ABIOTICA}
      </div>
    </div>
  );

  /* ── Panel de control específico del modo ──────────────────────────── */
  let control: ReactNode = null;
  if (modo === "miller") {
    control = (
      <>
        {/* progreso de días */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: T.text3 }}>DÍAS DE EXPERIMENTO</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dias} / {DIAS_MAX}</span>
        </div>
        <input type="range" min={0} max={DIAS_MAX} value={dias} onChange={(e) => { setPlaying(false); setDias(Number(e.target.value)); }} className="ov-range" style={{ ["--ovc" as string]: modoCol, marginBottom: 14 }} />

        {/* chispa */}
        <button className="ov-toggle" data-on={chispa} onClick={() => setChispa((c) => !c)} style={{ ["--ovc" as string]: chispa ? "#fbbf24" : "rgba(255,255,255,0.2)" }}>
          <i className={`fa-solid ${chispa ? "fa-bolt" : "fa-bolt-slash"}`} style={{ marginRight: 9, color: chispa ? "#fbbf24" : T.text3 }} />
          {chispa ? "Descarga eléctrica: ENCENDIDA" : "Descarga eléctrica: APAGADA"}
        </button>

        {/* gases de la atmósfera primitiva */}
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 7px", textTransform: "uppercase" }}>Atmósfera primitiva (reductora)</div>
        <div className="ov-chips">
          {GASES_PRIMITIVOS.map((g) => (
            <span key={g.formula} className="ov-chip" style={{ borderColor: `${g.color}66`, background: `${g.color}1e`, color: "#fff" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: g.color, display: "inline-block" }} />
              <strong style={{ fontFamily: "ui-monospace,monospace" }}>{g.formula}</strong>
              <span style={{ color: T.text3, fontWeight: 700 }}>{g.nombre}</span>
            </span>
          ))}
        </div>

        {/* productos obtenidos */}
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 7px", textTransform: "uppercase" }}>Productos en la trampa</div>
        <div className="ov-chips">
          {PRODUCTOS_MILLER.map((p, i) => {
            const on = i < productosActivos;
            return (
              <span key={p.abr} className="ov-chip" data-on={on} style={{ borderColor: on ? p.color : "rgba(255,255,255,0.12)", background: on ? `${p.color}1e` : "transparent", color: on ? "#fff" : T.text3 }}>
                <strong style={{ color: on ? p.color : T.text3 }}>{p.abr}</strong>
                {p.nombre}
              </span>
            );
          })}
        </div>

        <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 11, border: `1px solid ${modoCol}44`, background: `${modoCol}12`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
          <i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 8 }} />
          {hipMiller.evidencia}
        </div>
      </>
    );
  } else if (modo === "ambientes") {
    const hip = hipotesisPorId(ambDef.hipotesisId);
    control = (
      <>
        <div className="ov-tabs" style={{ marginBottom: 14 }}>
          {AMBIENTES.map((a) => {
            const d = AMBIENTES_DEF[a];
            const col = `#${d.color.replace("#", "")}`;
            const on = a === ambiente;
            return (
              <button key={a} className="ov-tab" data-on={on} onClick={() => cambiarAmbiente(a)} style={{ ["--ovc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 16, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 11, fontWeight: 900, lineHeight: 1.15 }}>{d.etq}</div>
              </button>
            );
          })}
        </div>
        <div style={{ padding: "13px 15px", borderRadius: 12, border: `1px solid ${ambDef.color}55`, background: `${ambDef.color}12` }}>
          <div style={{ fontSize: 13.5, fontWeight: 900, color: "#fff", marginBottom: 6 }}>
            <i className={`fa-solid ${ambDef.icono}`} style={{ color: ambDef.color, marginRight: 8 }} />
            {hip.nombre} <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>· {hip.anio}</span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 10 }}>{hip.descripcion}</div>
          <div style={{ fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.5, padding: "9px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)" }}>
            <i className="fa-solid fa-flask-vial" style={{ color: ambDef.color, marginRight: 7 }} />{hip.evidencia}
          </div>
        </div>
      </>
    );
  } else {
    control = (
      <>
        <div style={{ padding: "13px 15px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12`, marginBottom: 12 }}>
          <div style={{ fontSize: 13.5, fontWeight: 900, color: "#fff", marginBottom: 6 }}>
            <i className="fa-solid fa-dna" style={{ color: modoCol, marginRight: 8 }} />{hipArn.nombre}
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{hipArn.descripcion}</div>
        </div>
        <div style={{ display: "grid", gap: 9 }}>
          <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${modoCol}25` }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: modoCol, background: `${modoCol}1e`, flexShrink: 0 }}>
              <i className="fa-solid fa-database" />
            </div>
            <div><div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>Almacena información</div><div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>Su secuencia de bases guarda el mensaje genético, como hace el ADN hoy.</div></div>
          </div>
          <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${modoCol}25` }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: modoCol, background: `${modoCol}1e`, flexShrink: 0 }}>
              <i className="fa-solid fa-bolt-lightning" />
            </div>
            <div><div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>Cataliza reacciones (ribozima)</div><div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>El ARN catalítico acelera reacciones, papel que hoy cumplen las proteínas.</div></div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, border: `1px solid ${modoCol}44`, background: `${modoCol}12`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
          <i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 8 }} />
          {hipArn.evidencia}
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes ovPulse { 0%,100%{ box-shadow:0 0 0 0 var(--ovd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ov-live-dot { animation: ovPulse 1.6s ease-in-out infinite; }
        .ov-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ov-grid { grid-template-columns: 1fr; } }
        .ov-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ov-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ov-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ov-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ov-tab { cursor:pointer; border:1px solid var(--ovc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .ov-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ov-tab:hover { background:rgba(255,255,255,0.06); }
        .ov-chips { display:flex; flex-wrap:wrap; gap:6px; }
        .ov-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:9px;
          border:1px solid; font-size:11.5px; font-weight:800; transition:all .12s; }
        .ov-range { width:100%; accent-color: var(--ovc); cursor:pointer; }
        .ov-toggle { width:100%; cursor:pointer; border:1px solid var(--ovc); border-radius:11px; padding:11px 14px;
          background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ov-toggle[data-on="true"] { background:rgba(251,191,36,0.12); }
        .ov-toggle:hover { background:rgba(255,255,255,0.07); }
        @media (max-width: 1000px){ .ov-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ov-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ov-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ov-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ov-drawer[data-open="true"] { transform:translateX(0); }
        .ov-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ov-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ov-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ov-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ov-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ov-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ov-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ov-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--ovc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ov-grid">
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
              <OrigenVidaScene
                modo={modo}
                ambiente={ambiente}
                dias={dias}
                chispa={chispa}
                nAmino={nAmino}
                playing={playing}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="ov-live-dot" style={{ ["--ovd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ov-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ov-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              {modo === "miller" && (
                <button className="ov-icobtn" data-on={chispa} onClick={() => setChispa((c) => !c)} title={chispa ? "Apagar chispa" : "Encender chispa"}>
                  <i className={`fa-solid ${chispa ? "fa-bolt" : "fa-bolt-slash"}`} />
                </button>
              )}
              <button className="ov-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ov-icobtn" onClick={reiniciar} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ov-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Panel de control del modo */}
          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", border: "1px solid #7dd3fc55", borderRadius: 6, padding: "3px 7px" }}>
                LECTURA A1
              </span>
            </div>
            {control}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-seedling" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El origen de la vida</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ancla A1 — hipótesis abiótica + reflexión */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow><i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />Lectura A1 — Hipótesis abióticas</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{DEFINICION_ABIOTICA}</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Las cinco hipótesis */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-diagram-project" style={{ marginRight: 8, color: accent }} />Las hipótesis (lectura A1)</Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {HIPOTESIS.map((h) => (
                <div key={h.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${h.color}25` }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: h.color, background: `${h.color}1e`, flexShrink: 0 }}>
                    <i className={`fa-solid ${h.icono}`} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>{h.nombre} <span style={{ fontSize: 10.5, color: T.text3, fontWeight: 700 }}>· {h.anio}</span></div>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>{h.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Etapas del aparato (solo Miller) */}
          {modo === "miller" && (
            <div style={{ ...card, padding: "18px 20px 20px" }}>
              <Eyebrow><i className="fa-solid fa-gears" style={{ marginRight: 8, color: accent }} />El aparato paso a paso</Eyebrow>
              <div style={{ display: "grid", gap: 9 }}>
                {ETAPAS_MILLER.map((e) => (
                  <div key={e.n} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${modoCol}25` }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: modoCol, flexShrink: 0 }}>{e.n}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}><i className={`fa-solid ${e.icono}`} style={{ marginRight: 7, color: modoCol }} />{e.titulo}</div>
                      <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>{e.detalle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cómo usar */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />Cómo usar el laboratorio</Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos + ideas clave ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ov-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos clave</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contexto mexicano: CONABIO */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: país megadiverso (CONABIO)</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          {/* ¿Sabías que? */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />¿Sabías que? (quizzes A2/A4)</Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{h}</li>
              ))}
            </ul>
          </div>

          {/* Glosario */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />Glosario (A5)</Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((g, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{g.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />{g.ejemplo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />Ideas clave</Eyebrow>
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
          Las cinco hipótesis, la definición de hipótesis abiótica, las preguntas de reflexión y el contexto de la CONABIO son <strong>verbatim</strong> de la lectura A1 (etiqueta «LECTURA A1»); el glosario y sus ejemplos son verbatim del glosario A5; los datos de «¿sabías que?» provienen de los quizzes A2/A4. El experimento de Miller-Urey está reconstruido de forma <strong>esquemática</strong>: el aparato (matraces, electrodos, condensador y trampa), la acumulación de aminoácidos y los dioramas de los ambientes son representaciones <strong>ilustrativas</strong> del mecanismo, no simulaciones químicas a escala molecular. La cifra «más de 20 aminoácidos tras una semana» es el resultado histórico verbatim del glosario A5. Fuente: {FUENTE}
        </span>
      </div>

      {/* ── Reto evaluable: el quiz verbatim de la actividad A2 ──────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={() => {
          if (sonido) audioRef.current?.correcto();
        }}
        playPick={() => {
          if (sonido) audioRef.current?.blip();
        }}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="ov-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ov-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ov-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ov-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ov-drawer-body">
          <FichaTeorica data={ORIGEN_VIDA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
