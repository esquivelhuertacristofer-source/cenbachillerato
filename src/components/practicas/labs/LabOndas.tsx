"use client";

/**
 * Laboratorio 3D — "Ondas: amplitud, frecuencia y longitud de onda".
 * Práctica experimental para CNEYT-V-P04-A2 (simulación "Simulación de ondas:
 * amplitud, frecuencia y longitud de onda"; progresión 4 "El movimiento
 * ondulatorio: sonido, mar y terremotos", UAC CNEYT-V "La energía en procesos
 * de vida diaria").
 *
 * Tres modos, según la simulación verbatim del A2:
 *  (a) Onda          — generador de una onda mecánica: amplitud, frecuencia y
 *      medio fijan la longitud de onda por v = λ·f (sube f y λ baja).
 *  (b) Interferencia — dos ondas que se superponen (constructiva/destructiva) o,
 *      en sentidos opuestos, una onda estacionaria con nodos y antinodos.
 *  (c) Doppler       — una fuente en movimiento comprime las ondas por delante
 *      (tono agudo) y las estira por detrás (grave).
 * Toda la física es de cálculo cerrado (v = λ·f y efecto Doppler clásico).
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  type Modo, resolverOnda, resolverInterferencia, resolverDoppler, medioPorId, MEDIOS,
  A_MIN, A_MAX, A_DEF, F_MIN, F_MAX, F_DEF, MEDIO_DEF,
  FASE_MIN, FASE_MAX, FASE_DEF,
  FD_MIN, FD_MAX, FD_DEF, VS_MIN, VS_MAX, VS_DEF,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, EJEMPLO,
  fmt0, fmt1, fmt2, fmtLambda,
} from "./ondas-data";

const OndasScene = dynamic(() => import("./OndasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wave-square fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Generando el frente de onda…</span>
    </div>
  ),
});

const C_ONDA = "#7dd3fc";
const C_INTER = "#34D399";
const C_DOPP = "#f59e0b";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "onda",          etq: "Onda",          icono: "fa-wave-square",       col: C_ONDA,  desc: "Generador de onda: v = λ·f" },
  { id: "interferencia", etq: "Interferencia", icono: "fa-water",             col: C_INTER, desc: "Dos ondas: suma, cancelación y estacionaria" },
  { id: "doppler",       etq: "Doppler",       icono: "fa-tower-broadcast",   col: C_DOPP,  desc: "Fuente en movimiento: agudo y grave" },
];

const FASE_PRESETS = [
  { etq: "en fase (0)", phi: 0 },
  { etq: "π/2", phi: Math.PI / 2 },
  { etq: "oposición (π)", phi: Math.PI },
  { etq: "3π/2", phi: (3 * Math.PI) / 2 },
];

export function LabOndas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("onda");
  const [A, setA] = useState<number>(A_DEF);                 // (a) y (b)
  const [f, setF] = useState<number>(F_DEF);                 // (a)
  const [medioId, setMedioId] = useState<string>(MEDIO_DEF); // (a)
  const [phi, setPhi] = useState<number>(FASE_DEF);          // (b)
  const [estacionaria, setEstacionaria] = useState<boolean>(false); // (b)
  const [fd, setFd] = useState<number>(FD_DEF);              // (c)
  const [vs, setVs] = useState<number>(VS_DEF);              // (c)
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);
  const resetModo = () => {
    if (modo === "onda") { setA(A_DEF); setF(F_DEF); setMedioId(MEDIO_DEF); }
    else if (modo === "interferencia") { setA(A_DEF); setPhi(FASE_DEF); setEstacionaria(false); }
    else { setFd(FD_DEF); setVs(VS_DEF); }
    bump();
  };
  const cambiarModo = (nm: Modo) => { setModo(nm); bump(); };

  // valores en vivo según el modo
  const medio = medioPorId(medioId);
  const onda = resolverOnda(A, f, medio.v);
  const inter = resolverInterferencia(A, phi);
  const dopp = resolverDoppler(fd, vs);

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const tipoCol = estacionaria ? "#a78bfa" : inter.tipo === "constructiva" ? C_INTER : inter.tipo === "destructiva" ? "#f87171" : "#fbbf24";

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wave-square" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>v = λ · f</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "onda" && ` En ${medio.nombre.toLowerCase()} (v = ${fmt0(medio.v)} m/s) a f = ${fmt0(f)} Hz: λ = ${fmtLambda(onda.lambda)}.`}
        {modo === "interferencia" && ` Con φ = ${fmt2(phi)} rad la resultante es ${inter.tipo} (A_res = ${fmt2(inter.Ares)}).`}
        {modo === "doppler" && ` f = ${fmt0(fd)} Hz, vs = ${fmt0(vs)} m/s → adelante ${fmt0(dopp.fAcerca)} Hz, atrás ${fmt0(dopp.fAleja)} Hz.`}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes onPulse { 0%,100%{ box-shadow:0 0 0 0 var(--onc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .on-live-dot { animation: onPulse 1.6s ease-in-out infinite; }
        .on-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .on-grid { grid-template-columns: 1fr; } }
        .on-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .on-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .on-icobtn:hover { background:rgba(255,255,255,0.12); }
        .on-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--onc) 0%, var(--onc) var(--onfill), rgba(255,255,255,0.12) var(--onfill), rgba(255,255,255,0.12) 100%); }
        .on-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--onc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .on-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--onc); cursor:pointer; }
        .on-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .on-tab { cursor:pointer; border:1px solid var(--onc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .on-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .on-tab:hover { background:rgba(255,255,255,0.06); }
        .on-media { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        @media (max-width: 1000px){ .on-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="on-tabs">
          {MODOS.map((mo) => {
            const on = mo.id === modo;
            return (
              <button key={mo.id} className="on-tab" data-on={on} onClick={() => cambiarModo(mo.id)}
                style={{ ["--onc" as string]: mo.col, background: on ? `${mo.col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? mo.col : "inherit" }}><i className={`fa-solid ${mo.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{mo.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{mo.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="on-grid">
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
              <OndasScene modo={modo} A={A} f={f} medioId={medioId} phi={phi} estacionaria={estacionaria} fd={fd} vs={vs} playing={playing} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="on-live-dot" style={{ ["--onc" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{modoActual.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="on-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reproducir"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="on-icobtn" onClick={resetModo} title="Reiniciar a los valores de inicio">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "onda" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-wave-square" style={{ color: C_ONDA, marginRight: 7 }} />
                  {medio.nombre}: v = {fmt0(medio.v)} m/s · f = {fmt0(f)} Hz · λ = {fmtLambda(onda.lambda)} · T = {fmt2(onda.T * 1000)} ms
                </div>
              )}
              {modo === "interferencia" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-water" style={{ color: tipoCol, marginRight: 7 }} />
                  {estacionaria ? "onda estacionaria — nodos fijos y antinodos cada λ/2" : `desfase φ = ${fmt2(phi)} rad → ${inter.tipo} · A_res = ${fmt2(inter.Ares)} (${fmt0(inter.pct * 100)}%)`}
                </div>
              )}
              {modo === "doppler" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-tower-broadcast" style={{ color: C_DOPP, marginRight: 7 }} />
                  f = {fmt0(fd)} Hz · vs = {fmt0(vs)} m/s → adelante {fmt0(dopp.fAcerca)} Hz (agudo) · atrás {fmt0(dopp.fAleja)} Hz (grave)
                </div>
              )}
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {modo === "onda" && "Sube la frecuencia: la longitud de onda baja (v = λf). Cambia de medio: en agua y acero el sonido va más rápido, así que λ crece. La esfera blanca solo sube y baja: el medio no viaja, la perturbación sí."}
                {modo === "interferencia" && "Mueve el desfase: en fase se suman (constructiva), en oposición se cancelan (destructiva). Activa la onda estacionaria para ver los nodos fijos y los antinodos."}
                {modo === "doppler" && "Sube la rapidez de la fuente: por delante los frentes se aprietan (más frecuencia, tono agudo) y por detrás se separan (grave). Así suena la sirena de la ambulancia al pasar."}
              </div>
            </div>
          </div>

          {/* Controles del modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                {modo === "onda" ? "Amplitud, frecuencia y medio" : modo === "interferencia" ? "Desfase y tipo de superposición" : "Frecuencia y rapidez de la fuente"}
              </Eyebrow>
            </div>

            {modo === "onda" && (
              <>
                <Deslizador label="frecuencia  f" icon="fa-gauge-high" colr={C_ONDA}
                  valor={`${fmt0(f)} Hz`} min={F_MIN} max={F_MAX} step={1} value={f}
                  onChange={setF} hintL={`${fmt0(F_MIN)} Hz`} hintR={`${fmt0(F_MAX)} Hz`} />
                <div style={{ height: 14 }} />
                <Deslizador label="amplitud  A" icon="fa-up-down" colr={C_ONDA}
                  valor={fmt2(A)} min={A_MIN} max={A_MAX} step={0.05} value={A}
                  onChange={setA} hintL={fmt1(A_MIN)} hintR={fmt1(A_MAX)} />
                <div style={{ marginTop: 16, marginBottom: 6, fontSize: 11.5, fontWeight: 800, color: T.text3, letterSpacing: "0.04em" }}>MEDIO DE PROPAGACIÓN</div>
                <div className="on-media">
                  {MEDIOS.map((me) => {
                    const on = me.id === medioId;
                    return (
                      <button key={me.id} className="on-tab" data-on={on} onClick={() => setMedioId(me.id)}
                        style={{ ["--onc" as string]: me.color, background: on ? `${me.color}22` : "transparent" }}>
                        <div style={{ fontSize: 16, marginBottom: 3, color: on ? me.color : "inherit" }}><i className={`fa-solid ${me.icono}`} /></div>
                        <div style={{ fontSize: 12, fontWeight: 900 }}>{me.nombre}</div>
                        <div style={{ fontSize: 9.5, color: T.text3, marginTop: 2 }}>{fmt0(me.v)} m/s</div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_ONDA}44`, background: `${C_ONDA}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-half-stroke" style={{ color: C_ONDA, marginRight: 8 }} />
                  Con v = <strong>{fmt0(medio.v)} m/s</strong> y f = <strong>{fmt0(f)} Hz</strong>: λ = v/f = <strong style={{ color: C_ONDA }}>{fmtLambda(onda.lambda)}</strong>. Al <strong>duplicar f</strong>, λ se reduce a la <strong>mitad</strong> (v constante).
                </div>
              </>
            )}

            {modo === "interferencia" && (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button onClick={() => setEstacionaria(false)} className="on-tab" data-on={!estacionaria} style={{ flex: 1, ["--onc" as string]: C_INTER, background: !estacionaria ? `${C_INTER}22` : "transparent" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 900 }}><i className="fa-solid fa-plus-minus" style={{ marginRight: 6 }} />Superposición (desfase)</div>
                    <div style={{ fontSize: 9.5, color: T.text3, marginTop: 2 }}>constructiva ↔ destructiva</div>
                  </button>
                  <button onClick={() => setEstacionaria(true)} className="on-tab" data-on={estacionaria} style={{ flex: 1, ["--onc" as string]: "#a78bfa", background: estacionaria ? "#a78bfa22" : "transparent" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 900 }}><i className="fa-solid fa-grip-lines-vertical" style={{ marginRight: 6 }} />Onda estacionaria</div>
                    <div style={{ fontSize: 9.5, color: T.text3, marginTop: 2 }}>sentidos opuestos · nodos</div>
                  </button>
                </div>
                {!estacionaria ? (
                  <>
                    <Deslizador label="desfase  φ" icon="fa-arrows-left-right-to-line" colr={tipoCol}
                      valor={`${fmt2(phi)} rad`} min={FASE_MIN} max={FASE_MAX} step={0.01} value={phi}
                      onChange={setPhi} hintL="0" hintR="2π" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginTop: 12 }}>
                      {FASE_PRESETS.map((p) => (
                        <button key={p.etq} onClick={() => setPhi(p.phi)} style={{ cursor: "pointer", fontSize: 10.5, fontWeight: 800, color: Math.abs(phi - p.phi) < 0.02 ? "#04121f" : C_INTER, background: Math.abs(phi - p.phi) < 0.02 ? C_INTER : `${C_INTER}1f`, border: `1px solid ${C_INTER}55`, borderRadius: 8, padding: "7px 4px" }}>
                          {p.etq}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${tipoCol}44`, background: `${tipoCol}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                      <i className="fa-solid fa-wave-square" style={{ color: tipoCol, marginRight: 8 }} />
                      Resultante <strong style={{ color: tipoCol }}>{inter.tipo}</strong>: A_res = |2A·cos(φ/2)| = <strong>{fmt2(inter.Ares)}</strong> ({fmt0(inter.pct * 100)}% del máximo). En fase se <strong>suman</strong>; en oposición se <strong>cancelan</strong>.
                    </div>
                  </>
                ) : (
                  <>
                    <Deslizador label="amplitud de cada onda  A" icon="fa-up-down" colr="#a78bfa"
                      valor={fmt2(A)} min={A_MIN} max={A_MAX} step={0.05} value={A}
                      onChange={setA} hintL={fmt1(A_MIN)} hintR={fmt1(A_MAX)} />
                    <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: "1px solid #a78bfa44", background: "#a78bfa14", fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                      <i className="fa-solid fa-grip-lines-vertical" style={{ color: "#a78bfa", marginRight: 8 }} />
                      Dos ondas iguales viajando en <strong>sentidos opuestos</strong> forman una <strong>onda estacionaria</strong>: los <strong>nodos</strong> (grises) nunca se mueven y los <strong>antinodos</strong> (morados) oscilan al máximo, separados <strong>λ/2</strong>.
                    </div>
                  </>
                )}
              </>
            )}

            {modo === "doppler" && (
              <>
                <Deslizador label="frecuencia de la fuente  f" icon="fa-music" colr={C_DOPP}
                  valor={`${fmt0(fd)} Hz`} min={FD_MIN} max={FD_MAX} step={10} value={fd}
                  onChange={setFd} hintL={`${fmt0(FD_MIN)} Hz`} hintR={`${fmt0(FD_MAX)} Hz`} />
                <div style={{ height: 14 }} />
                <Deslizador label="rapidez de la fuente  vs" icon="fa-gauge-high" colr={C_DOPP}
                  valor={`${fmt0(vs)} m/s`} min={VS_MIN} max={VS_MAX} step={1} value={vs}
                  onChange={setVs} hintL="0 (reposo)" hintR={`${fmt0(VS_MAX)} m/s`} />
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid #f8717144", background: "#f8717114", fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                    <i className="fa-solid fa-arrow-right" style={{ color: "#f87171", marginRight: 8 }} />
                    Se acerca: <strong style={{ color: "#f87171" }}>{fmt0(dopp.fAcerca)} Hz</strong> (+{fmt0(dopp.dAcerca)} Hz, más agudo)
                  </div>
                  <div style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid #60a5fa44", background: "#60a5fa14", fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                    <i className="fa-solid fa-arrow-left" style={{ color: "#60a5fa", marginRight: 8 }} />
                    Se aleja: <strong style={{ color: "#60a5fa" }}>{fmt0(dopp.fAleja)} Hz</strong> (−{fmt0(dopp.dAleja)} Hz, más grave)
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* La simulación verbatim */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-wave-square" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>La simulación</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ejemplo resuelto verbatim */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-square-check" style={{ marginRight: 8, color: accent }} />
              Ejemplo resuelto
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 10 }}>{EJEMPLO.enunciado}</div>
            <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_ONDA}44` }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: C_ONDA, flexShrink: 0 }}>λ</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>λ = {fmt1(EJEMPLO.lambda * 100)} cm (0.5 m)</div>
                <div style={{ fontSize: 10.5, color: T.text2, lineHeight: 1.3 }}>{EJEMPLO.solucion}</div>
              </div>
            </div>
          </div>

          {/* Pasos de la simulación (instrucciones verbatim) */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Pasos de la simulación
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
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="on-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${modoActual.icono}`} style={{ marginRight: 8, color: modoCol }} />
            Lecturas — {modoActual.etq}
          </Eyebrow>
          {modo === "onda" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="frecuencia f" value={fmt0(f)} unit="Hz" col={C_ONDA} size={15} />
              <Readout label="velocidad v" value={fmt0(medio.v)} unit="m/s" col={medio.color} size={15} />
              <Readout label="long. onda λ" value={fmtLambda(onda.lambda)} col={C_ONDA} size={14} />
              <Readout label="período T" value={fmt2(onda.T * 1000)} unit="ms" col="#fff" size={15} />
            </div>
          )}
          {modo === "interferencia" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="amplitud A" value={fmt2(A)} col="#fff" size={15} />
              <Readout label="desfase φ" value={estacionaria ? "—" : `${fmt2(phi)}`} unit={estacionaria ? "" : "rad"} col={tipoCol} size={15} />
              <Readout label="A resultante" value={estacionaria ? `${fmt2(2 * A)}` : fmt2(inter.Ares)} col={tipoCol} size={15} />
              <Readout label="tipo" value={estacionaria ? "estac." : inter.tipo === "constructiva" ? "constr." : inter.tipo === "destructiva" ? "destr." : "parcial"} col={tipoCol} size={14} />
            </div>
          )}
          {modo === "doppler" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="f fuente" value={fmt0(fd)} unit="Hz" col={C_DOPP} size={15} />
              <Readout label="vs fuente" value={fmt0(vs)} unit="m/s" col={C_DOPP} size={15} />
              <Readout label="se acerca" value={fmt0(dopp.fAcerca)} unit="Hz" col="#f87171" size={15} />
              <Readout label="se aleja" value={fmt0(dopp.fAleja)} unit="Hz" col="#60a5fa" size={15} />
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
          Física <strong>exacta</strong> de cálculo cerrado: relación fundamental v = λ·f, superposición A_res = |2A·cos(φ/2)| y efecto Doppler clásico con fuente en movimiento (f′ = f·v/(v∓vs), v_sonido = 340 m/s). La onda que ves en pantalla es <strong>esquemática</strong>: la longitud de onda visual está acotada para que quepa (por eso en acero, con v ≈ 5000 m/s, se ve muy larga), pero los valores de λ, T y de las frecuencias Doppler de los paneles son <strong>exactos</strong>. Enunciado, instrucciones, ejemplo y preguntas son verbatim de la actividad A2.
        </span>
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
      <input type="range" className="on-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--onc" as string]: colr, ["--onfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
