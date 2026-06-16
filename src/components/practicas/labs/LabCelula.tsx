"use client";

/**
 * Laboratorio 3D — "La célula en 3D: organelos y funciones".
 * Práctica experimental para CNEYT-VI-P02-A1 (infografía "Células procariota y
 * eucariota: organelos y funciones"; progresión 2 "Explica la estructura y
 * función de la célula: procariota y eucariota, animal y vegetal", UAC CNEYT-VI).
 *
 * Tres modos (tipos de célula):
 *  (a) animal     — eucariota animal (núcleo, mitocondria, RE, Golgi, lisosomas).
 *  (b) vegetal    — eucariota vegetal (+ pared, cloroplastos, vacuola central).
 *  (c) procariota — sin núcleo: ADN circular flotante (nucleoide) y ribosomas.
 * Haz clic en cada organelo para ver su función (verbatim del glosario A5/A1).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { CELULA_FICHA } from "./celula-ficha";
import {
  type Modo, MODOS, organelosDe, organeloPorId, CELULAS,
  COMPARACION, TAMANOS,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, GLOSARIO, CONTEXTO, FUENTE, DATOS, QUIZ_A2,
} from "./celula-data";

const CelulaScene = dynamic(() => import("./CelulaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bacterium fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Ensamblando la célula en 3D…</span>
    </div>
  ),
});

export function LabCelula({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("animal");
  const [selected, setSelected] = useState<string | null>("nucleo");
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
  const cambiarModo = (m: Modo) => {
    setModo(m);
    const primero = organelosDe(m)[0];
    setSelected(primero ? primero.id : null);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const resetModo = () => {
    const primero = organelosDe(modo)[0];
    setSelected(primero ? primero.id : null);
    bump();
  };

  // valores en vivo
  const cel = CELULAS[modo];
  const lista = organelosDe(modo);
  const sel = selected ? organeloPorId(selected) : undefined;
  // si el organelo seleccionado no existe en este modo, no se resalta
  const selEnModo = sel && sel.modos.includes(modo) ? sel : undefined;

  const modoCol = `#${cel.color.replace("#", "")}`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${cel.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{cel.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la célula en 3D, pero la información sigue aquí. {cel.subtitulo} · tamaño {cel.tamano} · {lista.length} estructuras etiquetadas. {selEnModo ? `${selEnModo.nombre}: ${selEnModo.funcion}` : ""}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cePulse { 0%,100%{ box-shadow:0 0 0 0 var(--cec); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ce-live-dot { animation: cePulse 1.6s ease-in-out infinite; }
        .ce-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,27vw,400px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ce-grid { grid-template-columns: 1fr; } }
        .ce-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ce-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ce-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ce-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ce-tab { cursor:pointer; border:1px solid var(--cec); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .ce-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .ce-tab:hover { background:rgba(255,255,255,0.06); }
        .ce-org { cursor:pointer; display:flex; align-items:center; gap:9px; text-align:left; width:100%;
          border-radius:10px; padding:9px 11px; transition:all .15s; }
        @media (max-width: 1000px){ .ce-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ce-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ce-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ce-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ce-drawer[data-open="true"] { transform:translateX(0); }
        .ce-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ce-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ce-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ce-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ce-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ce-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de tipo de célula */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ce-tabs">
          {MODOS.map((m) => {
            const c = CELULAS[m];
            const col = `#${c.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ce-tab" data-on={on} onClick={() => cambiarModo(m)}
                style={{ ["--cec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${c.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{c.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{c.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ce-grid">
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
              <CelulaScene
                modo={modo}
                selected={selEnModo ? selEnModo.id : null}
                onSelect={(id) => setSelected(id)}
                playing={playing}
                accent={accent}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="ce-live-dot" style={{ ["--cec" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{cel.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ce-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ce-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ce-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar giro" : "Reanudar giro"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ce-icobtn" onClick={resetModo} title="Reiniciar la vista">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${cel.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {cel.etq} · {cel.subtitulo} · tamaño {cel.tamano} · {lista.length} estructuras
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {selEnModo
                  ? `${selEnModo.nombre}: ${selEnModo.funcion}`
                  : "Haz clic en cualquier organelo de la célula para ver su nombre y su función."}
              </div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ce-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Organelos del modo actual */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-hand-pointer" style={{ marginRight: 8, color: modoCol }} />
                Organelos y estructuras — {cel.etq}
              </Eyebrow>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {lista.map((o) => {
                const on = selEnModo?.id === o.id;
                const oc = `#${o.color.replace("#", "")}`;
                return (
                  <button key={o.id} className="ce-org" onClick={() => setSelected(o.id)}
                    style={{ border: `1px solid ${on ? oc : "rgba(255,255,255,0.12)"}`, background: on ? `${oc}1f` : "rgba(4,10,22,0.4)" }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: on ? "#04121f" : oc, background: on ? oc : `${oc}22` }}>
                      <i className={`fa-solid ${o.icono}`} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: on ? "#fff" : T.text2, lineHeight: 1.2, minWidth: 0 }}>{o.nombre}</span>
                  </button>
                );
              })}
            </div>

            {/* Detalle del organelo seleccionado */}
            {selEnModo && (
              <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${`#${selEnModo.color.replace("#", "")}`}44`, background: `${`#${selEnModo.color.replace("#", "")}`}12` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#04121f", background: `#${selEnModo.color.replace("#", "")}` }}>
                    <i className={`fa-solid ${selEnModo.icono}`} />
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{selEnModo.nombre}</div>
                  <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: selEnModo.fuente === "A5" ? "#86efac" : T.text3, border: `1px solid ${selEnModo.fuente === "A5" ? "#86efac55" : T.line}`, borderRadius: 6, padding: "3px 7px" }}>
                    {selEnModo.fuente === "A5" ? "GLOSARIO A5" : "INFOGRAFÍA A1"}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "#eaf0fb", lineHeight: 1.55 }}>{selEnModo.funcion}</div>
                {selEnModo.ejemplo && (
                  <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${T.line}`, fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>
                    <i className="fa-solid fa-lightbulb" style={{ color: "#fbbf24", marginRight: 7 }} />
                    {selEnModo.ejemplo}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El visor de la célula */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-microscope" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor de la célula</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Procariota vs eucariota */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-code-compare" style={{ marginRight: 8, color: accent }} />
              Procariota vs eucariota
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: 1, background: T.line, borderRadius: 10, overflow: "hidden", border: `1px solid ${T.line}` }}>
              <div style={{ padding: "7px 9px", background: "rgba(4,10,22,0.6)", fontSize: 10, fontWeight: 900, color: T.text3 }}> </div>
              <div style={{ padding: "7px 9px", background: "rgba(4,10,22,0.6)", fontSize: 10.5, fontWeight: 900, color: "#7dd3fc" }}>Procariota</div>
              <div style={{ padding: "7px 9px", background: "rgba(4,10,22,0.6)", fontSize: 10.5, fontWeight: 900, color: "#f9a8d4" }}>Eucariota</div>
              {COMPARACION.map((f, i) => (
                <FilaCmp key={i} f={f} />
              ))}
            </div>
          </div>

          {/* Barra de tamaño */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-ruler-horizontal" style={{ marginRight: 8, color: accent }} />
              Comparación de tamaño
            </Eyebrow>
            <div style={{ display: "grid", gap: 11 }}>
              {TAMANOS.map((t, i) => {
                const pct = Math.max(6, (t.micras / 100) * 100);
                const tc = `#${t.color.replace("#", "")}`;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
                      <span style={{ color: "#fff" }}>{t.etq}</span>
                      <span style={{ color: tc, fontFamily: "ui-monospace, monospace" }}>{t.rango}</span>
                    </div>
                    <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: tc }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 10.5, color: T.text3, lineHeight: 1.45, marginTop: 10 }}>
              Las procariotas (0.5–5 μm) son hasta 20 veces más pequeñas que las eucariotas (10–100 μm). Barra a escala lineal respecto a 100 μm.
            </div>
          </div>

          {/* Pasos para explorar */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Pasos para explorar
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
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ce-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${cel.icono}`} style={{ marginRight: 8, color: modoCol }} />
            Lecturas — {cel.etq}
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="estructuras" value={`${lista.length}`} col={modoCol} size={14} />
            <Readout label="núcleo" value={cel.conNucleo ? "Sí" : "No"} col={cel.conNucleo ? "#86efac" : "#fca5a5"} size={14} />
            <Readout label="pared celular" value={cel.conPared ? "Sí" : "No"} col={cel.conPared ? "#86efac" : "#fca5a5"} size={14} />
            <Readout label="tamaño" value={cel.tamano} col="#fff" size={13} />
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

          {/* Contexto mexicano: el ajolote */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />
              El ajolote de Xochimilco
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
          Las funciones de cada organelo son <strong>verbatim</strong>: las del núcleo, mitocondria, cloroplasto, RE y Golgi provienen del glosario A5 (etiqueta «GLOSARIO A5»); las de membrana, pared, ribosomas, lisosomas, vacuola y nucleoide se basan en la infografía A1 (etiqueta «INFOGRAFÍA A1»). La tabla comparativa procariota/eucariota y la barra de tamaño son verbatim de A5 y A1. La célula en 3D es <strong>esquemática</strong>: las formas, los colores y las posiciones de los organelos son representaciones visuales (no a escala ni con número real de organelos) para identificarlos y comparar los tres tipos de célula. Las ideas clave, el glosario, el contexto del ajolote y las preguntas para reflexionar son de la lectura A1. Fuente: {FUENTE}
        </span>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla A2 ────────────── */}
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
      <div className="ce-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ce-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ce-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ce-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ce-drawer-body">
          <FichaTeorica data={CELULA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Fila de la tabla comparativa ─────────────────────────────────────────── */
function FilaCmp({ f }: { f: { caracteristica: string; procariota: string; eucariota: string } }) {
  return (
    <>
      <div style={{ padding: "7px 9px", background: "rgba(4,10,22,0.35)", fontSize: 10.5, fontWeight: 800, color: "#fff" }}>{f.caracteristica}</div>
      <div style={{ padding: "7px 9px", background: "rgba(4,10,22,0.35)", fontSize: 10.5, color: T.text2, lineHeight: 1.3 }}>{f.procariota}</div>
      <div style={{ padding: "7px 9px", background: "rgba(4,10,22,0.35)", fontSize: 10.5, color: T.text2, lineHeight: 1.3 }}>{f.eucariota}</div>
    </>
  );
}
