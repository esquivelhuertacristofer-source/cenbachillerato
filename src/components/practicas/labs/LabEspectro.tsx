"use client";

/**
 * Laboratorio 3D — "El espectro electromagnético".
 * Práctica experimental para CNEYT-V-P05-A1 (infografía "El espectro
 * electromagnético: de las ondas de radio a los rayos gamma"; progresión 5
 * "Describe el espectro electromagnético y sus aplicaciones tecnológicas y
 * biomédicas", UAC CNEYT-V "La energía en procesos de vida diaria").
 *
 * Tres modos:
 *  (a) Espectro     — recorre la frecuencia (10⁴–10²² Hz) y ve cambiar la
 *      longitud de onda (λ = c/f), la energía del fotón (E = h·f) y la banda;
 *      el umbral de radiación ionizante (rayos X y gamma) queda marcado.
 *  (b) Visible      — acerca la franja visible (380–700 nm): color, frecuencia
 *      y energía.
 *  (c) Aplicaciones — ubica aplicaciones reales de México (WiFi, 5G, GTM del
 *      INAOE, rayos X del IMSS, gamma del ININ…) sobre el espectro.
 * Toda la física es de cálculo cerrado (c = λ·f y E = h·f, con c = 3×10⁸ m/s).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { ESPECTRO_FICHA } from "./espectro-electromagnetico-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./espectro-electromagnetico-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo, resolverEM, resolverVisible, aplicacionPorId, APLICACIONES,
  bandaPorFrecuencia, CAT_COLOR, CAT_ETQ,
  LOGF_MIN, LOGF_MAX, LOGF_DEF, NM_MIN, NM_MAX, NM_DEF, APL_DEF, C_LUZ,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, EJEMPLO, GLOSARIO,
  fmt0, fmtFrec, fmtLambda, fmtEnergia, colorVisible,
} from "./espectro-data";

const EspectroScene = dynamic(() => import("./EspectroScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wave-square fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Desplegando el espectro…</span>
    </div>
  ),
});

const C_ESP = "#a78bfa";
const C_VIS = "#22d3ee";
const C_APL = "#34d399";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "espectro",     etq: "Espectro",     icono: "fa-bars-staggered",  col: C_ESP, desc: "Radio a gamma: λ = c/f, E = h·f" },
  { id: "visible",      etq: "Visible",      icono: "fa-eye",             col: C_VIS, desc: "380–700 nm: color, f y energía" },
  { id: "aplicaciones", etq: "Aplicaciones", icono: "fa-satellite-dish",  col: C_APL, desc: "WiFi, 5G, GTM, rayos X, gamma…" },
];

export function LabEspectro({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("espectro");
  const [logF, setLogF] = useState<number>(LOGF_DEF);  // (a)
  const [nm, setNm] = useState<number>(NM_DEF);        // (b)
  const [aplId, setAplId] = useState<string>(APL_DEF); // (c)
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
  const resetModo = () => {
    if (modo === "espectro") setLogF(LOGF_DEF);
    else if (modo === "visible") setNm(NM_DEF);
    else setAplId(APL_DEF);
    bump();
  };
  const cambiarModo = (nm2: Modo) => { setModo(nm2); bump(); if (sonido) audioRef.current?.blip(); };

  // valores en vivo
  const f = Math.pow(10, logF);
  const pt = resolverEM(f);
  const cv = resolverVisible(nm);
  const apl = aplicacionPorId(aplId);
  const aplPt = resolverEM(apl.f);
  const aplBanda = bandaPorFrecuencia(apl.f);

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const colVisLive = cv.hex;
  const colEspLive = pt.banda.esVisible ? colorVisible((C_LUZ / f) * 1e9) : pt.banda.color;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wave-square" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>c = λ · f</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "espectro" && ` ${pt.banda.nombre}: f = ${fmtFrec(f)}, λ = ${fmtLambda(pt.lambda)}, E = ${fmtEnergia(pt.E_eV)}.`}
        {modo === "visible" && ` Luz ${cv.nombre}: ${fmt0(nm)} nm → f = ${fmtFrec(cv.f)}, E = ${fmtEnergia(cv.E_eV)}.`}
        {modo === "aplicaciones" && ` ${apl.nombre} (${aplBanda.nombre}): f = ${fmtFrec(apl.f)}, λ = ${fmtLambda(aplPt.lambda)}.`}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes esPulse { 0%,100%{ box-shadow:0 0 0 0 var(--esc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .es-live-dot { animation: esPulse 1.6s ease-in-out infinite; }
        .es-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .es-grid { grid-template-columns: 1fr; } }
        .es-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .es-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .es-icobtn:hover { background:rgba(255,255,255,0.12); }
        .es-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--esc) 0%, var(--esc) var(--esfill), rgba(255,255,255,0.12) var(--esfill), rgba(255,255,255,0.12) 100%); }
        .es-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--esc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .es-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--esc); cursor:pointer; }
        .es-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .es-tab { cursor:pointer; border:1px solid var(--esc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .es-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .es-tab:hover { background:rgba(255,255,255,0.06); }
        .es-apl { display:grid; grid-template-columns: repeat(2,1fr); gap:8px; }
        @media (max-width: 1000px){ .es-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .es-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .es-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .es-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .es-drawer[data-open="true"] { transform:translateX(0); }
        .es-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .es-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .es-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .es-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .es-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .es-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="es-tabs">
          {MODOS.map((mo) => {
            const on = mo.id === modo;
            return (
              <button key={mo.id} className="es-tab" data-on={on} onClick={() => cambiarModo(mo.id)}
                style={{ ["--esc" as string]: mo.col, background: on ? `${mo.col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? mo.col : "inherit" }}><i className={`fa-solid ${mo.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{mo.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{mo.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="es-grid">
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
              <EspectroScene modo={modo} logF={logF} nm={nm} aplId={aplId} playing={playing} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="es-live-dot" style={{ ["--esc" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{modoActual.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="es-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="es-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="es-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reproducir"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="es-icobtn" onClick={resetModo} title="Reiniciar a los valores de inicio">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "espectro" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-bars-staggered" style={{ color: colEspLive, marginRight: 7 }} />
                  {pt.banda.nombre}: f = {fmtFrec(f)} · λ = {fmtLambda(pt.lambda)} · E = {fmtEnergia(pt.E_eV)} · {pt.ionizante ? "ionizante" : "no ionizante"}
                </div>
              )}
              {modo === "visible" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-eye" style={{ color: colVisLive, marginRight: 7 }} />
                  Luz {cv.nombre}: {fmt0(nm)} nm · f = {fmtFrec(cv.f)} · E = {fmtEnergia(cv.E_eV)}
                </div>
              )}
              {modo === "aplicaciones" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className={`fa-solid ${apl.icono}`} style={{ color: CAT_COLOR[apl.categoria], marginRight: 7 }} />
                  {apl.nombre} · {aplBanda.nombre} · f = {fmtFrec(apl.f)} · λ = {fmtLambda(aplPt.lambda)}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {modo === "espectro" && "Sube la frecuencia: la longitud de onda baja (c = λf) y la energía del fotón sube (E = hf). Pasa el umbral rojo: desde los rayos X la radiación es ionizante. Todas las ondas viajan a la misma rapidez (la de la luz)."}
                {modo === "visible" && "Recorre los 380–700 nm: del violeta (más energía) al rojo (menos energía). Lo que vemos como colores son distintas longitudes de onda de una franja diminuta de todo el espectro."}
                {modo === "aplicaciones" && "Elige una aplicación y mira en qué banda cae: WiFi y 5G en microondas, el GTM en milimétricas, los rayos X del IMSS y la gamma del ININ ya son radiación ionizante."}
              </div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="es-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Controles del modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                {modo === "espectro" ? "Frecuencia (escala logarítmica)" : modo === "visible" ? "Longitud de onda de la luz" : "Aplicación sobre el espectro"}
              </Eyebrow>
            </div>

            {modo === "espectro" && (
              <>
                <Deslizador label="frecuencia  f" icon="fa-gauge-high" colr={colEspLive}
                  valor={fmtFrec(f)} min={LOGF_MIN} max={LOGF_MAX} step={0.01} value={logF}
                  onChange={setLogF} hintL="10⁴ Hz (radio)" hintR="10²² Hz (gamma)" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 12 }}>
                  {[
                    { etq: "FM 100 MHz", lf: 8 },
                    { etq: "WiFi 2.4 GHz", lf: Math.log10(2.4e9) },
                    { etq: "Visible", lf: LOGF_DEF },
                    { etq: "UV", lf: Math.log10(1e15) },
                    { etq: "Rayos X", lf: Math.log10(3e18) },
                    { etq: "Gamma", lf: Math.log10(1e20) },
                  ].map((p) => (
                    <button key={p.etq} onClick={() => setLogF(p.lf)} style={{ cursor: "pointer", fontSize: 10.5, fontWeight: 800, color: Math.abs(logF - p.lf) < 0.05 ? "#04121f" : C_ESP, background: Math.abs(logF - p.lf) < 0.05 ? C_ESP : `${C_ESP}1f`, border: `1px solid ${C_ESP}55`, borderRadius: 8, padding: "7px 4px" }}>
                      {p.etq}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${colEspLive}44`, background: `${colEspLive}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-half-stroke" style={{ color: colEspLive, marginRight: 8 }} />
                  En <strong>{pt.banda.nombre}</strong>: con f = <strong>{fmtFrec(f)}</strong> → λ = c/f = <strong style={{ color: colEspLive }}>{fmtLambda(pt.lambda)}</strong> y E = h·f = <strong>{fmtEnergia(pt.E_eV)}</strong>. {pt.ionizante ? "Es radiación ionizante (puede dañar el ADN)." : "No es ionizante."}
                </div>
              </>
            )}

            {modo === "visible" && (
              <>
                <Deslizador label="longitud de onda  λ" icon="fa-ruler-horizontal" colr={colVisLive}
                  valor={`${fmt0(nm)} nm`} min={NM_MIN} max={NM_MAX} step={1} value={nm}
                  onChange={setNm} hintL="380 nm (violeta)" hintR="700 nm (rojo)" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginTop: 12 }}>
                  {[410, 470, 490, 540, 580, 610, 670].map((v) => (
                    <button key={v} onClick={() => setNm(v)} title={`${v} nm`} style={{ cursor: "pointer", height: 30, borderRadius: 8, border: Math.abs(nm - v) < 6 ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)", background: colorVisible(v) }} />
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${colVisLive}66`, background: `${colVisLive}18`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: colVisLive, marginRight: 8, verticalAlign: "middle" }} />
                  Luz <strong>{cv.nombre}</strong> de <strong>{fmt0(nm)} nm</strong>: f = c/λ = <strong>{fmtFrec(cv.f)}</strong>, E = h·f = <strong>{fmtEnergia(cv.E_eV)}</strong>. El violeta tiene más energía que el rojo.
                </div>
              </>
            )}

            {modo === "aplicaciones" && (
              <>
                <div className="es-apl">
                  {APLICACIONES.map((a) => {
                    const on = a.id === aplId;
                    const c = CAT_COLOR[a.categoria];
                    return (
                      <button key={a.id} className="es-tab" data-on={on} onClick={() => setAplId(a.id)}
                        style={{ ["--esc" as string]: c, background: on ? `${c}22` : "transparent", textAlign: "left", display: "flex", gap: 10, alignItems: "center", padding: "9px 11px" }}>
                        <div style={{ fontSize: 15, color: on ? c : "inherit", width: 18, textAlign: "center" }}><i className={`fa-solid ${a.icono}`} /></div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.nombre}</div>
                          <div style={{ fontSize: 9, color: T.text3 }}>{CAT_ETQ[a.categoria]} · {fmtFrec(a.f)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${CAT_COLOR[apl.categoria]}44`, background: `${CAT_COLOR[apl.categoria]}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className={`fa-solid ${apl.icono}`} style={{ color: CAT_COLOR[apl.categoria], marginRight: 8 }} />
                  <strong>{apl.nombre}</strong> ({aplBanda.nombre}, f = {fmtFrec(apl.f)}): {apl.detalle}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* La infografía */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-wave-square" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El explorador</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ejemplo resuelto */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-square-check" style={{ marginRight: 8, color: accent }} />
              Ejemplo resuelto
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 10 }}>{EJEMPLO.enunciado}</div>
            <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_ESP}44` }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: C_ESP, flexShrink: 0 }}>λ</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>λ = {fmt0(EJEMPLO.lambda)} m</div>
                <div style={{ fontSize: 10.5, color: T.text2, lineHeight: 1.3 }}>{EJEMPLO.solucion}</div>
              </div>
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

          {/* Preguntas de reflexión verbatim */}
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
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="es-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${modoActual.icono}`} style={{ marginRight: 8, color: modoCol }} />
            Lecturas — {modoActual.etq}
          </Eyebrow>
          {modo === "espectro" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="frecuencia f" value={fmtFrec(f)} col={colEspLive} size={13} />
              <Readout label="long. onda λ" value={fmtLambda(pt.lambda)} col={colEspLive} size={13} />
              <Readout label="energía E" value={fmtEnergia(pt.E_eV)} col="#fff" size={13} />
              <Readout label="radiación" value={pt.ionizante ? "ionizante" : "no ioniz."} col={pt.ionizante ? "#f87171" : "#34D399"} size={12} />
            </div>
          )}
          {modo === "visible" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="long. onda λ" value={`${fmt0(nm)} nm`} col={colVisLive} size={14} />
              <Readout label="color" value={cv.nombre} col={colVisLive} size={13} />
              <Readout label="frecuencia f" value={fmtFrec(cv.f)} col="#fff" size={13} />
              <Readout label="energía E" value={fmtEnergia(cv.E_eV)} col="#fff" size={13} />
            </div>
          )}
          {modo === "aplicaciones" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="aplicación" value={apl.nombre} col={CAT_COLOR[apl.categoria]} size={12} />
              <Readout label="banda" value={aplBanda.nombre} col={CAT_COLOR[apl.categoria]} size={12} />
              <Readout label="frecuencia f" value={fmtFrec(apl.f)} col="#fff" size={13} />
              <Readout label="long. onda λ" value={fmtLambda(aplPt.lambda)} col="#fff" size={13} />
            </div>
          )}
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

          {/* Glosario verbatim */}
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
          Física <strong>exacta</strong> de cálculo cerrado: c = λ·f y E = h·f, con c = 3×10⁸ m/s (≈299 792 km/s) y h = 6.626×10⁻³⁴ J·s. Los valores de frecuencia, longitud de onda y energía de los paneles son <strong>exactos</strong>. La onda y la barra que ves en pantalla son <strong>esquemáticas</strong>: la longitud de onda visual está comprimida (escala logarítmica de frecuencia) para que las 18 décadas del espectro quepan en una sola imagen, y los colores de las bandas invisibles son convencionales. Las ideas clave, el glosario y las preguntas son verbatim de la infografía A1; el explorador y el ejemplo son apoyos didácticos con física exacta.
        </span>
      </div>

      {/* ── Objetivos ─────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Recorre el espectro de radio a rayos gamma (c = λ·f)", done: true },
            { txt: "Identifica el umbral de radiación ionizante (rayos X y gamma)", done: true },
            { txt: "Explora la franja visible (380–700 nm) y sus colores", done: true },
            { txt: "Ubica aplicaciones reales de México en el espectro", done: true },
            { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
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
      <div className="es-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="es-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="es-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="es-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="es-drawer-body">
          <FichaTeorica data={ESPECTRO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
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
      <input type="range" className="es-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--esc" as string]: colr, ["--esfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
