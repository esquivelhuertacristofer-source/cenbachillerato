"use client";

/**
 * Laboratorio 3D — "Gravitación universal: fuerza, peso y órbitas".
 * Práctica experimental para CNEYT-V-P03-A2 ("Cálculos de gravitación: fuerza,
 * peso y órbitas"; progresión 3 "Analiza la gravitación universal y sus
 * implicaciones en el sistema solar y la exploración espacial", UAC CNEYT-V
 * "La energía en procesos de vida diaria").
 *
 * Tres modos, uno por inciso del problema verbatim:
 *  (a) Fuerza  — la atracción Tierra–Luna con F = G·M·m/r² y la ley del inverso
 *      del cuadrado (mueve la distancia y observa cómo cae la fuerza).
 *  (b) Peso    — W = m·g sobre la Luna, Marte, la Tierra o Júpiter; la masa no
 *      cambia, el peso sí.
 *  (c) Órbita  — un satélite Mexsat alrededor de la Tierra; cuando su período
 *      iguala la rotación terrestre (35 786 km → 24 h) queda geoestacionario.
 * Toda la física es de cálculo cerrado (Gravitación universal y 3.ª ley de Kepler).
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  type Modo, resolverFuerza, resolverPeso, resolverOrbita, cuerpoPorId, CUERPOS,
  R_MIN, R_MAX, R_DEF, F_DEF,
  M_MIN, M_MAX, M_DEF, CUERPO_DEF,
  ALT_MIN, ALT_MAX, ALT_GEO, ALT_DEF, T_TIERRA_H,
  PROBLEMA, PASOS, IDEAS, DATOS,
  sci, fmt0, fmt1, fmt2, fmtKm,
} from "./gravitacion-data";

const GravitacionScene = dynamic(() => import("./GravitacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-earth-americas fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Encendiendo el sistema Tierra–Luna…</span>
    </div>
  ),
});

const C_FUERZA = "#a78bfa";
const C_PESO = "#7dd3fc";
const C_ORBITA = "#34D399";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "fuerza", etq: "Fuerza", icono: "fa-down-left-and-up-right-to-center", col: C_FUERZA, desc: "Atracción Tierra–Luna: F = G·M·m/r²" },
  { id: "peso",   etq: "Peso",   icono: "fa-weight-hanging",                   col: C_PESO,   desc: "Peso en distintos cuerpos: W = m·g" },
  { id: "orbita", etq: "Órbita", icono: "fa-satellite",                        col: C_ORBITA, desc: "Satélite geoestacionario: T = 2π·√(r³/GM)" },
];

export function LabGravitacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("fuerza");
  const [r, setR] = useState<number>(R_DEF);          // (a)
  const [cuerpoId, setCuerpoId] = useState<string>(CUERPO_DEF); // (b)
  const [m, setM] = useState<number>(M_DEF);          // (b)
  const [alt, setAlt] = useState<number>(ALT_DEF);    // (c)
  const [t, setT] = useState<number>(0);              // (c) tiempo de simulación (h)
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // Reproduce el movimiento orbital (rAF) — solo en el modo órbita.
  useEffect(() => {
    if (modo !== "orbita" || !playing) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setT((prev) => {
        const next = prev + dt * 4;     // 4 h de simulación por segundo real
        return next >= 48 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [modo, playing]);

  const bump = () => setResetNonce((n) => n + 1);
  const resetModo = () => {
    if (modo === "fuerza") setR(R_DEF);
    else if (modo === "peso") { setCuerpoId(CUERPO_DEF); setM(M_DEF); }
    else { setAlt(ALT_DEF); setT(0); }
    bump();
  };
  const cambiarModo = (nm: Modo) => { setModo(nm); setT(0); bump(); };

  // valores en vivo según el modo
  const fz = resolverFuerza(r);
  const cuerpo = cuerpoPorId(cuerpoId);
  const pz = resolverPeso(m, cuerpo.g);
  const orb = resolverOrbita(alt);

  const ratioF = fz.F / F_DEF;
  const verbatim =
    modo === "fuerza" ? r === R_DEF
    : modo === "peso" ? cuerpoId === CUERPO_DEF && m === M_DEF
    : alt === ALT_DEF;

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-earth-americas" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>F = G·M·m / r²</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "fuerza" && ` Fuerza Tierra–Luna a r = ${sci(r)} m: F = ${sci(fz.F)} N.`}
        {modo === "peso" && ` En ${cuerpo.nombre}, ${fmt0(m)} kg pesan ${fmt1(pz.W)} N.`}
        {modo === "orbita" && ` A ${fmtKm(alt)} km de altura el período es ${fmt1(orb.Th)} h.`}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes gvPulse { 0%,100%{ box-shadow:0 0 0 0 var(--gvc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .gv-live-dot { animation: gvPulse 1.6s ease-in-out infinite; }
        .gv-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .gv-grid { grid-template-columns: 1fr; } }
        .gv-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .gv-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .gv-icobtn:hover { background:rgba(255,255,255,0.12); }
        .gv-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--gvc) 0%, var(--gvc) var(--gvfill), rgba(255,255,255,0.12) var(--gvfill), rgba(255,255,255,0.12) 100%); }
        .gv-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--gvc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .gv-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--gvc); cursor:pointer; }
        .gv-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .gv-tab { cursor:pointer; border:1px solid var(--gvc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .gv-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .gv-tab:hover { background:rgba(255,255,255,0.06); }
        .gv-bodies { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
        @media (max-width: 1000px){ .gv-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="gv-tabs">
          {MODOS.map((mo) => {
            const on = mo.id === modo;
            return (
              <button key={mo.id} className="gv-tab" data-on={on} onClick={() => cambiarModo(mo.id)}
                style={{ ["--gvc" as string]: mo.col, background: on ? `${mo.col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? mo.col : "inherit" }}><i className={`fa-solid ${mo.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{mo.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{mo.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="gv-grid">
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
              <GravitacionScene modo={modo} r={r} cuerpoId={cuerpoId} m={m} alt={alt} t={t} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="gv-live-dot" style={{ ["--gvc" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{modoActual.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              {modo === "orbita" && (
                <button className="gv-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reproducir la órbita"}>
                  <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
                </button>
              )}
              <button className="gv-icobtn" onClick={resetModo} title="Reiniciar a los valores del problema">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "fuerza" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-down-left-and-up-right-to-center" style={{ color: C_FUERZA, marginRight: 7 }} />
                  r = {sci(r)} m · F = {sci(fz.F)} N · {fmt1(ratioF)}× la fuerza del problema
                </div>
              )}
              {modo === "peso" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-weight-hanging" style={{ color: C_PESO, marginRight: 7 }} />
                  {cuerpo.nombre}: {fmt0(m)} kg × {fmt2(cuerpo.g)} m/s² = {fmt1(pz.W)} N ≈ {fmt1(pz.kgf)} kg-fuerza
                </div>
              )}
              {modo === "orbita" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-satellite" style={{ color: orb.geo ? C_ORBITA : "#eaf0fb", marginRight: 7 }} />
                  altura {fmtKm(alt)} km · T = {fmt1(orb.Th)} h · v = {fmt2(orb.v / 1000)} km/s {orb.geo ? "· GEOESTACIONARIA" : ""}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {modo === "fuerza" && "Acerca o aleja la Luna: la fuerza cae con el cuadrado de la distancia (ley del inverso del cuadrado)."}
                {modo === "peso" && "Cambia de cuerpo y de masa: el peso depende de g; la masa es la misma en todos lados."}
                {modo === "orbita" && "Reproduce la órbita; el punto dorado es una antena en la superficie que gira en 24 h. Si el satélite va a su ritmo, queda fijo sobre ella."}
              </div>
            </div>
          </div>

          {/* Controles del modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                {modo === "fuerza" ? "Distancia Tierra–Luna" : modo === "peso" ? "Cuerpo y masa" : "Altura de la órbita"}
              </Eyebrow>
              {!verbatim && (
                <button onClick={resetModo} style={{ cursor: "pointer", fontSize: 11, fontWeight: 800, color: modoCol, background: `${modoCol}22`, border: `1px solid ${modoCol}55`, borderRadius: 8, padding: "5px 10px" }}>
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} />volver al problema
                </button>
              )}
            </div>

            {modo === "fuerza" && (
              <>
                <Deslizador label="distancia  r (centro a centro)" icon="fa-arrows-left-right" colr={C_FUERZA}
                  valor={`${sci(r)} m`} min={R_MIN} max={R_MAX} step={0.01e8} value={r}
                  onChange={setR} hintL={`${sci(R_MIN)}`} hintR={`${sci(R_MAX)}`} />
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_FUERZA}44`, background: `${C_FUERZA}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-half-stroke" style={{ color: C_FUERZA, marginRight: 8 }} />
                  Al duplicar la distancia, la fuerza baja a la <strong>cuarta parte</strong>. Aquí F = <strong style={{ color: C_FUERZA }}>{sci(fz.F)} N</strong> ({fmt1(ratioF)}× la del problema, que es {sci(F_DEF)} N a r = {sci(R_DEF)} m).
                </div>
              </>
            )}

            {modo === "peso" && (
              <>
                <div className="gv-bodies" style={{ marginBottom: 16 }}>
                  {CUERPOS.map((c) => {
                    const on = c.id === cuerpoId;
                    return (
                      <button key={c.id} className="gv-tab" data-on={on} onClick={() => setCuerpoId(c.id)}
                        style={{ ["--gvc" as string]: c.color, background: on ? `${c.color}22` : "transparent" }}>
                        <div style={{ fontSize: 16, marginBottom: 3, color: on ? c.color : "inherit" }}><i className={`fa-solid ${c.icono}`} /></div>
                        <div style={{ fontSize: 12, fontWeight: 900 }}>{c.nombre}</div>
                        <div style={{ fontSize: 9.5, color: T.text3, marginTop: 2 }}>{c.rel}</div>
                      </button>
                    );
                  })}
                </div>
                <Deslizador label="masa  m" icon="fa-weight-scale" colr={C_PESO}
                  valor={`${fmt0(m)} kg`} min={M_MIN} max={M_MAX} step={1} value={m}
                  onChange={setM} hintL={`${fmt0(M_MIN)}`} hintR={`${fmt0(M_MAX)}`} />
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_PESO}44`, background: `${C_PESO}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-scale-balanced" style={{ color: C_PESO, marginRight: 8 }} />
                  En <strong>{cuerpo.nombre}</strong> pesas <strong style={{ color: C_PESO }}>{fmt1(pz.W)} N ≈ {fmt1(pz.kgf)} kg-fuerza</strong>; en la Tierra serían <strong>{fmt0(pz.WTierra)} N</strong>. Tu masa, {fmt0(m)} kg, <strong>no cambia</strong>.
                </div>
              </>
            )}

            {modo === "orbita" && (
              <>
                <Deslizador label="altura sobre la superficie" icon="fa-arrows-up-to-line" colr={C_ORBITA}
                  valor={`${fmtKm(alt)} km`} min={ALT_MIN} max={ALT_MAX} step={100e3} value={alt}
                  onChange={setAlt} hintL={`${fmtKm(ALT_MIN)} km`} hintR={`${fmtKm(ALT_MAX)} km`} />
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button onClick={() => setAlt(ALT_GEO)} style={{ flex: 1, cursor: "pointer", fontSize: 12, fontWeight: 800, color: orb.geo ? "#04121f" : C_ORBITA, background: orb.geo ? C_ORBITA : `${C_ORBITA}1f`, border: `1px solid ${C_ORBITA}66`, borderRadius: 10, padding: "9px 10px" }}>
                    <i className="fa-solid fa-satellite-dish" style={{ marginRight: 7 }} />ir a la geoestacionaria (35 786 km)
                  </button>
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${orb.geo ? C_ORBITA : "rgba(255,255,255,0.18)"}`, background: orb.geo ? `${C_ORBITA}14` : "rgba(4,10,22,0.4)", fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className={`fa-solid ${orb.geo ? "fa-circle-check" : "fa-satellite"}`} style={{ color: orb.geo ? C_ORBITA : "#9fb4cc", marginRight: 8 }} />
                  Período <strong style={{ color: orb.geo ? C_ORBITA : "#fff" }}>T = {fmt1(orb.Th)} h</strong> (Kepler: T² ∝ r³) · rapidez <strong>{fmt2(orb.v / 1000)} km/s</strong>. {orb.geo ? "Igual a la rotación terrestre: el satélite parece FIJO." : `Distinto a las 24 h de rotación: el satélite ${orb.Th < T_TIERRA_H ? "adelanta" : "retrasa"} a la Tierra y se mueve por el cielo.`}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El problema verbatim */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-meteor" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El problema</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Respuestas verbatim */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-square-check" style={{ marginRight: 8, color: accent }} />
              Respuestas
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <Respuesta etq="a" col={C_FUERZA} txt={`F ≈ ${sci(F_DEF)} N`} sub="atracción gravitacional Tierra–Luna" />
              <Respuesta etq="b" col={C_PESO} txt="113.4 N ≈ 11.6 kg-fuerza" sub="peso de 70 kg en la Luna (≈ 1/6 del terrestre)" />
              <Respuesta etq="c" col={C_ORBITA} txt="T = 24 h" sub="período = rotación terrestre ⇒ geoestacionaria" />
            </div>
          </div>

          {/* Procedimiento paso a paso (verbatim A2) */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Procedimiento
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {PASOS.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 24, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="gv-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${modoActual.icono}`} style={{ marginRight: 8, color: modoCol }} />
            Lecturas — {modoActual.etq}
          </Eyebrow>
          {modo === "fuerza" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Readout label="distancia r" value={sci(r)} unit="m" col={C_FUERZA} size={14} />
              <Readout label="fuerza F" value={sci(fz.F)} unit="N" col={C_FUERZA} size={14} />
              <Readout label="vs problema" value={`${fmt1(ratioF)}×`} col="#fff" size={15} />
            </div>
          )}
          {modo === "peso" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="masa m" value={fmt0(m)} unit="kg" col="#fff" size={15} />
              <Readout label="gravedad g" value={fmt2(cuerpo.g)} unit="m/s²" col={cuerpo.color} size={15} />
              <Readout label="peso W" value={fmt1(pz.W)} unit="N" col={C_PESO} size={15} />
              <Readout label="kg-fuerza" value={fmt1(pz.kgf)} unit="kgf" col={C_PESO} size={15} />
            </div>
          )}
          {modo === "orbita" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="altura" value={fmtKm(alt)} unit="km" col={C_ORBITA} size={15} />
              <Readout label="período T" value={fmt1(orb.Th)} unit="h" col={orb.geo ? C_ORBITA : "#fff"} size={15} />
              <Readout label="rapidez v" value={fmt2(orb.v / 1000)} unit="km/s" col={C_ORBITA} size={15} />
              <Readout label="estado" value={orb.geo ? "fija" : "móvil"} col={orb.geo ? C_ORBITA : "#9fb4cc"} size={15} />
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
          Física <strong>exacta</strong> de cálculo cerrado: Ley de Gravitación Universal (F = G·M·m/r²), peso (W = m·g, con g_Tierra = 9.81 m/s²) y órbita circular con la 3.ª ley de Kepler (T = 2π·√(r³/GM), v = √(GM/r)). Tamaños y distancias del sistema solar <strong>no</strong> están a escala real (la Luna está 30 diámetros terrestres más lejos de lo que cabe en pantalla); las longitudes de las flechas son proporcionales a sus magnitudes (acotadas para verse). El radio de la órbita sí es proporcional al radio terrestre. Valores, datos y procedimiento son verbatim del enunciado A2.
        </span>
      </div>
    </div>
  );
}

/* ── Tarjeta de respuesta ─────────────────────────────────────────────────── */
function Respuesta({ etq, col, txt, sub }: { etq: string; col: string; txt: string; sub: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}44` }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{etq}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{txt}</div>
        <div style={{ fontSize: 10.5, color: T.text2, lineHeight: 1.3 }}>{sub}</div>
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
      <input type="range" className="gv-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--gvc" as string]: colr, ["--gvfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
