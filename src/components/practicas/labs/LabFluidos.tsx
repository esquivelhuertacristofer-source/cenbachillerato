"use client";

/**
 * Laboratorio 3D — "El comportamiento de los fluidos: Arquímedes, Pascal y Bernoulli".
 * Práctica experimental para CNEYT-V-P09-A2 (progresión numero 6 "Comportamiento de
 * los fluidos y sus propiedades físicas", UAC CNEYT-V "Del átomo al universo. Fuerza
 * y energía").
 *
 * Tres modos:
 *  (a) Flotación — Arquímedes: empuje E = ρ_fluido·V_sumergido·g frente al peso
 *      W = ρ_cuerpo·V·g; la fracción sumergida es ρ_cuerpo/ρ_fluido.
 *  (b) Presión   — presión hidrostática P = P_ext + ρ·g·h y principio de Pascal
 *      (la presión externa se transmite por igual a toda profundidad).
 *  (c) Flujo     — ecuación de continuidad A₁v₁ = A₂v₂ y de Bernoulli: donde el
 *      fluido acelera, la presión cae.
 * Toda la física es de cálculo cerrado (modelos estándar de hidrostática e hidrodinámica).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { FLUIDOS_FICHA } from "./fluidos-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import {
  type Modo,
  FLUIDOS, MATERIALES, fluidoPorId,
  resolverFlotacion, resolverPresion, resolverFlujo,
  RHO_OBJ_MIN, RHO_OBJ_MAX, RHO_OBJ_DEF, VOL_MIN_L, VOL_MAX_L, VOL_DEF_L,
  PROF_MIN, PROF_MAX, PROF_DEF, PEXT_MIN_KPA, PEXT_MAX_KPA, PEXT_DEF_KPA,
  CAUDAL_MIN, CAUDAL_MAX, CAUDAL_DEF, RAZON_MIN, RAZON_MAX, RAZON_DEF, P_ATM,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, EJEMPLO, GLOSARIO,
  fmt0, fmt1, fmt2, fmtPresion, fmtFuerza, fmtVel, fmtDens, fmtVol, fmtProf,
  RETO_A2,
} from "./fluidos-data";

const FluidosScene = dynamic(() => import("./FluidosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-droplet fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Llenando el tanque…</span>
    </div>
  ),
});

const C_FLOT = "#34d399";
const C_PRES = "#fbbf24";
const C_FLUJ = "#38bdf8";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "flotacion", etq: "Flotación", icono: "fa-water", col: C_FLOT, desc: "Arquímedes: empuje y flotación" },
  { id: "presion", etq: "Presión", icono: "fa-gauge-high", col: C_PRES, desc: "Hidrostática y principio de Pascal" },
  { id: "flujo", etq: "Flujo", icono: "fa-wind", col: C_FLUJ, desc: "Continuidad y Bernoulli" },
];

export function LabFluidos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("flotacion");
  const [fluidoId, setFluidoId] = useState<string>("agua");
  // (a) flotación
  const [rhoObj, setRhoObj] = useState<number>(RHO_OBJ_DEF);
  const [volL, setVolL] = useState<number>(VOL_DEF_L);
  // (b) presión
  const [prof, setProf] = useState<number>(PROF_DEF);
  const [pextKpa, setPextKpa] = useState<number>(PEXT_DEF_KPA);
  // (c) flujo
  const [caudalLs, setCaudalLs] = useState<number>(CAUDAL_DEF);
  const [razon, setRazon] = useState<number>(RAZON_DEF);

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
  const resetModo = () => {
    if (modo === "flotacion") { setRhoObj(RHO_OBJ_DEF); setVolL(VOL_DEF_L); setFluidoId("agua"); }
    else if (modo === "presion") { setProf(PROF_DEF); setPextKpa(PEXT_DEF_KPA); setFluidoId("agua"); }
    else { setCaudalLs(CAUDAL_DEF); setRazon(RAZON_DEF); setFluidoId("agua"); }
    bump();
  };
  const cambiarModo = (m: Modo) => {
    setModo(m);
    bump();
    if (sonido) audioRef.current?.blip();
  };

  // valores en vivo
  const fluido = fluidoPorId(fluidoId);
  const rFlot = resolverFlotacion(rhoObj, fluido.rho, volL / 1000);
  const rPres = resolverPresion(fluido.rho, prof, P_ATM + pextKpa * 1000);
  const rFluj = resolverFlujo(caudalLs / 1000, razon, fluido);

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const objetivos = [
    { txt: "Explora el modo Flotación (Arquímedes)", done: false },
    { txt: "Explora el modo Presión (Pascal / hidrostática)", done: false },
    { txt: "Explora el modo Flujo (continuidad y Bernoulli)", done: false },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-droplet" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>P = P₀ + ρ·g·h</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "flotacion" && ` Cuerpo de ${fmtDens(rhoObj)} en ${fluido.nombre}: ${rFlot.flota ? `flota, ${fmt1(rFlot.fraccionSumergida * 100)} % sumergido` : "se hunde"}; E = ${fmtFuerza(rFlot.empuje)}, W = ${fmtFuerza(rFlot.peso)}.`}
        {modo === "presion" && ` ${fluido.nombre} a ${fmtProf(prof)}: P = ${fmtPresion(rPres.pAbsoluta)} (manométrica ${fmtPresion(rPres.pManometrica)}).`}
        {modo === "flujo" && ` ${fluido.nombre} con Q = ${fmtVol(caudalLs)}/s: v₁ = ${fmtVel(rFluj.v1)} → v₂ = ${fmtVel(rFluj.v2)}; la presión cae ${fmtPresion(Math.abs(rFluj.deltaP))}.`}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes flPulse { 0%,100%{ box-shadow:0 0 0 0 var(--flc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .fl-live-dot { animation: flPulse 1.6s ease-in-out infinite; }
        .fl-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .fl-grid { grid-template-columns: 1fr; } }
        .fl-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .fl-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .fl-icobtn:hover { background:rgba(255,255,255,0.12); }
        .fl-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--flc) 0%, var(--flc) var(--flfill), rgba(255,255,255,0.12) var(--flfill), rgba(255,255,255,0.12) 100%); }
        .fl-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--flc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .fl-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--flc); cursor:pointer; }
        .fl-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .fl-tab { cursor:pointer; border:1px solid var(--flc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .fl-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .fl-tab:hover { background:rgba(255,255,255,0.06); }
        @media (max-width: 1000px){ .fl-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .fl-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .fl-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .fl-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .fl-drawer[data-open="true"] { transform:translateX(0); }
        .fl-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .fl-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .fl-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .fl-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .fl-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .fl-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="fl-tabs">
          {MODOS.map((mo) => {
            const on = mo.id === modo;
            return (
              <button key={mo.id} className="fl-tab" data-on={on} onClick={() => cambiarModo(mo.id)}
                style={{ ["--flc" as string]: mo.col, background: on ? `${mo.col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? mo.col : "inherit" }}><i className={`fa-solid ${mo.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{mo.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{mo.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fl-grid">
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
              <FluidosScene
                modo={modo}
                fluidoId={fluidoId}
                rhoObj={rhoObj} volL={volL}
                prof={prof} pextKpa={pextKpa}
                caudalLs={caudalLs} razon={razon}
                playing={playing} accent={accent} resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="fl-live-dot" style={{ ["--flc" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{modoActual.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="fl-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="fl-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="fl-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reproducir"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="fl-icobtn" onClick={resetModo} title="Reiniciar a los valores de inicio">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="fl-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "flotacion" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-water" style={{ color: modoCol, marginRight: 7 }} />
                  Cuerpo {fmtDens(rhoObj)} en {fluido.nombre} ({fmtDens(fluido.rho)}): {rFlot.flota ? `flota, ${fmt1(rFlot.fraccionSumergida * 100)} % sumergido` : "se hunde"} · E = {fmtFuerza(rFlot.empuje)} · W = {fmtFuerza(rFlot.peso)}
                </div>
              )}
              {modo === "presion" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-gauge-high" style={{ color: modoCol, marginRight: 7 }} />
                  {fluido.nombre} a h = {fmtProf(prof)} · P_ext +{fmt0(pextKpa)} kPa → P = {fmtPresion(rPres.pAbsoluta)} (manométrica {fmtPresion(rPres.pManometrica)})
                </div>
              )}
              {modo === "flujo" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-wind" style={{ color: modoCol, marginRight: 7 }} />
                  {fluido.nombre} · Q = {fmtVol(caudalLs)}/s · v₁ = {fmtVel(rFluj.v1)} → v₂ = {fmtVel(rFluj.v2)} · ΔP = {fmtPresion(rFluj.deltaP)}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {modo === "flotacion" && "Sube la densidad del cuerpo por encima de la del fluido y se hundirá; cámbialo a mercurio y casi todo flotará. La fracción sumergida solo depende de la razón de densidades."}
                {modo === "presion" && "Baja la sonda y la presión crece linealmente con la profundidad. Aprieta el émbolo (sube P_ext): por el principio de Pascal ese aumento llega por igual a todos los puntos del fluido."}
                {modo === "flujo" && "Estrecha la tubería (baja la razón A₂/A₁): el fluido acelera para conservar el caudal y, por Bernoulli, su presión cae. Por eso un techo se levanta con viento fuerte."}
              </div>
            </div>
          </div>

          {/* Controles del modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                {modo === "flotacion" ? "Fluido y cuerpo" : modo === "presion" ? "Fluido, profundidad y émbolo" : "Fluido, caudal y estrechamiento"}
              </Eyebrow>
            </div>

            {/* Selector de fluido (común) */}
            <FluidoSelector fluidoId={fluidoId} onChange={setFluidoId} />
            <div style={{ height: 16 }} />

            {modo === "flotacion" && (
              <>
                <Deslizador label="densidad del cuerpo  ρ" icon="fa-cube" colr={modoCol}
                  valor={fmtDens(rhoObj)} min={RHO_OBJ_MIN} max={RHO_OBJ_MAX} step={10} value={rhoObj}
                  onChange={setRhoObj} hintL="ligero (flota)" hintR="denso (se hunde)" />
                <div style={{ height: 14 }} />
                <Deslizador label="volumen del cuerpo  V" icon="fa-expand" colr={modoCol}
                  valor={fmtVol(volL)} min={VOL_MIN_L} max={VOL_MAX_L} step={1} value={volL}
                  onChange={setVolL} hintL="pequeño" hintR="grande" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 14 }}>
                  {MATERIALES.map((mt) => {
                    const on = Math.abs(mt.rho - rhoObj) < 5;
                    return (
                      <button key={mt.id} onClick={() => setRhoObj(mt.rho)}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : modoCol, background: on ? modoCol : `${modoCol}1f`, border: `1px solid ${modoCol}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {mt.nombre}<br /><span style={{ fontSize: 8.5, opacity: 0.85 }}>{fmt0(mt.rho)} kg/m³</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-half-stroke" style={{ color: modoCol, marginRight: 8 }} />
                  {rFlot.flota
                    ? <>ρ_cuerpo &lt; ρ_fluido → <strong style={{ color: modoCol }}>flota</strong>. Fracción sumergida = ρ_cuerpo/ρ_fluido = <strong>{fmt1(rFlot.fraccionSumergida * 100)} %</strong>; en equilibrio E = W = <strong>{fmtFuerza(rFlot.empuje)}</strong>.</>
                    : <>ρ_cuerpo ≥ ρ_fluido → <strong style={{ color: "#fca5a5" }}>se hunde</strong>. Empuje E = <strong>{fmtFuerza(rFlot.empuje)}</strong> &lt; peso W = <strong>{fmtFuerza(rFlot.peso)}</strong>; peso aparente <strong>{fmtFuerza(rFlot.pesoAparente)}</strong>.</>}
                </div>
              </>
            )}

            {modo === "presion" && (
              <>
                <Deslizador label="profundidad de la sonda  h" icon="fa-arrow-down" colr={modoCol}
                  valor={fmtProf(prof)} min={PROF_MIN} max={PROF_MAX} step={0.5} value={prof}
                  onChange={setProf} hintL="superficie" hintR={`${fmt0(PROF_MAX)} m`} />
                <div style={{ height: 14 }} />
                <Deslizador label="presión externa  P_ext (Pascal)" icon="fa-down-long" colr={modoCol}
                  valor={`+${fmt0(pextKpa)} kPa`} min={PEXT_MIN_KPA} max={PEXT_MAX_KPA} step={5} value={pextKpa}
                  onChange={setPextKpa} hintL="émbolo libre" hintR="émbolo apretado" />
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-half-stroke" style={{ color: modoCol, marginRight: 8 }} />
                  P = P_ext + ρ·g·h = ({fmtPresion(rPres.pExterna)}) + ({fmtPresion(rPres.pManometrica)}) = <strong style={{ color: modoCol }}>{fmtPresion(rPres.pAbsoluta)}</strong>. Equivale a una columna de <strong>{fmt1(rPres.columnaEquivAgua)} m</strong> de agua. Por Pascal, subir P_ext eleva la presión por igual a toda profundidad.
                </div>
              </>
            )}

            {modo === "flujo" && (
              <>
                <Deslizador label="caudal  Q" icon="fa-faucet" colr={modoCol}
                  valor={`${fmtVol(caudalLs)}/s`} min={CAUDAL_MIN} max={CAUDAL_MAX} step={1} value={caudalLs}
                  onChange={setCaudalLs} hintL="poco flujo" hintR="mucho flujo" />
                <div style={{ height: 14 }} />
                <Deslizador label="estrechamiento  A₂ / A₁" icon="fa-compress" colr={modoCol}
                  valor={`${fmt2(razon)}×`} min={RAZON_MIN} max={RAZON_MAX} step={0.05} value={razon}
                  onChange={setRazon} hintL="muy estrecho" hintR="sin estrechar" />
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-half-stroke" style={{ color: modoCol, marginRight: 8 }} />
                  Continuidad: v₂ = v₁·(A₁/A₂) = <strong style={{ color: modoCol }}>{fmtVel(rFluj.v2)}</strong> (de {fmtVel(rFluj.v1)}). Bernoulli: la presión cae <strong>{fmtPresion(Math.abs(rFluj.deltaP))}</strong> en la sección estrecha.
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El reto */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-droplet" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El reto de los fluidos</div>
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
            <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_FLOT}44` }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: C_FLOT, flexShrink: 0 }}>E</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{EJEMPLO.resultado}</div>
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
              {INSTRUCCIONES[modo].map((p, i) => (
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
              {PREGUNTAS[modo].map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="fl-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${modoActual.icono}`} style={{ marginRight: 8, color: modoCol }} />
            Lecturas — {modoActual.etq}
          </Eyebrow>
          {modo === "flotacion" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="densidad relativa" value={`${fmt2(rFlot.densidadRelativa)}×`} col={rFlot.flota ? "#86efac" : "#fca5a5"} size={14} />
              <Readout label="fracción sumergida" value={rFlot.flota ? `${fmt1(rFlot.fraccionSumergida * 100)} %` : "100 %"} col="#fff" size={14} />
              <Readout label="empuje E" value={fmtFuerza(rFlot.empuje)} col={C_FLOT} size={14} />
              <Readout label="peso W" value={fmtFuerza(rFlot.peso)} col="#fca5a5" size={14} />
            </div>
          )}
          {modo === "presion" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="profundidad h" value={fmtProf(prof)} col="#fff" size={14} />
              <Readout label="P manométrica" value={fmtPresion(rPres.pManometrica)} col={C_PRES} size={14} />
              <Readout label="P absoluta" value={fmtPresion(rPres.pAbsoluta)} col={C_PRES} size={14} />
              <Readout label="columna de agua" value={`${fmt1(rPres.columnaEquivAgua)} m`} col="#93c5fd" size={14} />
            </div>
          )}
          {modo === "flujo" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="velocidad v₁" value={fmtVel(rFluj.v1)} col="#86efac" size={14} />
              <Readout label="velocidad v₂" value={fmtVel(rFluj.v2)} col="#fca5a5" size={14} />
              <Readout label="caída de presión" value={fmtPresion(rFluj.deltaP)} col={C_FLUJ} size={14} />
              <Readout label="Reynolds (estrecha)" value={`${fmt2(rFluj.numReynolds / 1000)}k`} col="#fff" size={14} />
            </div>
          )}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  {dd.icono}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
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
          Física <strong>exacta</strong> de cálculo cerrado: principio de Arquímedes E = ρ_fluido·V_sumergido·g, presión hidrostática P = P₀ + ρ·g·h con el principio de Pascal, ecuación de continuidad A₁·v₁ = A₂·v₂ y de Bernoulli P + ½ρv² = constante. Los valores de los paneles son <strong>exactos</strong> (g = 9.81 m/s²). La escena 3D es <strong>esquemática</strong>: usa una escala visual para tanque, sonda y tubería, y las partículas ilustran la velocidad relativa. El contenido formativo (Pascal, Arquímedes, tensión superficial, capilaridad, continuidad, Bernoulli y viscosidad) es <strong>verbatim del MCCEMS 2025 (CNEyT V)</strong>; los datos de densidad y viscosidad son valores de referencia a ~20 °C.
        </span>
      </div>

      {/* ── Objetivos ──────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#4ade80" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto evaluable: ejercicio verbatim de A2 ──────────────────── */}
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
      <div className="fl-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="fl-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="fl-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="fl-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="fl-drawer-body">
          <FichaTeorica data={FLUIDOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Selector de fluido ──────────────────────────────────────────────────── */
function FluidoSelector({ fluidoId, onChange }: { fluidoId: string; onChange: (id: string) => void }) {
  return (
    <div>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Fluido</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginTop: 8 }}>
        {FLUIDOS.map((fd) => {
          const on = fd.id === fluidoId;
          return (
            <button key={fd.id} onClick={() => onChange(fd.id)}
              style={{ cursor: "pointer", fontSize: 10, fontWeight: 800, color: on ? "#04121f" : fd.color, background: on ? fd.color : `${fd.color}1f`, border: `1px solid ${fd.color}66`, borderRadius: 8, padding: "8px 3px", lineHeight: 1.2 }}>
              {fd.nombre}<br /><span style={{ fontSize: 8, opacity: 0.85 }}>{fmt0(fd.rho)}</span>
            </button>
          );
        })}
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
      <input type="range" className="fl-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--flc" as string]: colr, ["--flfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
