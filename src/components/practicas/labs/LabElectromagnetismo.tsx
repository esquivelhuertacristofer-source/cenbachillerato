"use client";

/**
 * Laboratorio 3D — "Electromagnetismo: Ohm, Faraday y motores".
 * Práctica experimental para CNEYT-V-P07-A2 (ejercicio matemático "Calculando
 * electromagnetismo: Ohm, Faraday y motores"; progresión 7 "Examina los
 * principios del electromagnetismo y su aplicación en motores, generadores y
 * tecnologías cotidianas", UAC CNEYT-V "La energía en procesos de vida diaria").
 *
 * Tres modos:
 *  (a) Circuito   — ley de Ohm V = I·R y potencia P = V·I = I²R = V²/R; energía
 *      (kWh) y costo en pesos. Es la parte (a) del ejercicio A2.
 *  (b) Generador  — inducción de Faraday: FEM = N·B·A·ω·sen(ωt) de una bobina que
 *      gira en un campo magnético (las hidroeléctricas, como Chicoasén).
 *  (c) Motor      — conversión eléctrica → mecánica con eficiencia η; el resto se
 *      pierde como calor. Es la parte (b) del ejercicio A2 (Metro CDMX).
 * Toda la física es de cálculo cerrado (ley de Ohm, potencia, FEM de Faraday y
 * balance de eficiencia).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { ELECTROMAGNETISMO_FICHA } from "./electromagnetismo-ohm-faraday-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./electromagnetismo-ohm-faraday-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo,
  resolverCircuito, resolverGenerador, resolverMotor,
  CASOS_CIRCUITO, CASOS_GENERADOR, CASOS_MOTOR,
  V_MIN, V_MAX, V_DEF, R_MIN, R_MAX, R_DEF, H_MIN, H_MAX, H_DEF,
  PRECIO_MIN, PRECIO_MAX, PRECIO_DEF,
  N_MIN, N_MAX, N_DEF, B_MIN, B_MAX, B_DEF, AREA_MIN, AREA_MAX, AREA_DEF, F_MIN, F_MAX, F_DEF,
  PEL_MIN, PEL_MAX, PEL_DEF, EFIC_MIN, EFIC_MAX, EFIC_DEF,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, GLOSARIO, EJEMPLO_A, EJEMPLO_B,
  fmt2, fmt3, fmtV, fmtA, fmtR, fmtW, fmtKw, fmtKwh, fmtMXN, fmtPct, fmtHz, fmtHp,
} from "./electromagnetismo-data";

const ElectromagnetismoScene = dynamic(() => import("./ElectromagnetismoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Conectando el banco electromagnético…</span>
    </div>
  ),
});

const C_CIR = "#38bdf8";
const C_GEN = "#a78bfa";
const C_MOT = "#34d399";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "circuito",  etq: "Circuito",  icono: "fa-plug-circle-bolt", col: C_CIR, desc: "Ley de Ohm, potencia y costo" },
  { id: "generador", etq: "Generador", icono: "fa-bolt",             col: C_GEN, desc: "Inducción de Faraday (FEM)" },
  { id: "motor",     etq: "Motor",     icono: "fa-gears",            col: C_MOT, desc: "Eficiencia: útil vs. calor" },
];

export function LabElectromagnetismo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("circuito");
  // (a) circuito
  const [V, setV] = useState<number>(V_DEF);
  const [R, setR] = useState<number>(R_DEF);
  const [horas, setHoras] = useState<number>(H_DEF);
  const [precio, setPrecio] = useState<number>(PRECIO_DEF);
  // (b) generador
  const [N, setN] = useState<number>(N_DEF);
  const [B, setB] = useState<number>(B_DEF);
  const [area, setArea] = useState<number>(AREA_DEF);
  const [f, setF] = useState<number>(F_DEF);
  // (c) motor
  const [pElec, setPElec] = useState<number>(PEL_DEF);
  const [efic, setEfic] = useState<number>(EFIC_DEF);

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
    if (modo === "circuito") { setV(V_DEF); setR(R_DEF); setHoras(H_DEF); setPrecio(PRECIO_DEF); }
    else if (modo === "generador") { setN(N_DEF); setB(B_DEF); setArea(AREA_DEF); setF(F_DEF); }
    else { setPElec(PEL_DEF); setEfic(EFIC_DEF); }
    bump();
  };
  const cambiarModo = (m: Modo) => {
    if (sonido) audioRef.current?.blip();
    setModo(m);
    bump();
  };

  // valores en vivo
  const cir = resolverCircuito(V, R, horas, precio);
  const gen = resolverGenerador(N, B, area, f);
  const mot = resolverMotor(pElec, efic);

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bolt" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>V = I·R</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "circuito" && ` Circuito: I = ${fmtA(cir.I)}, P = ${fmtW(cir.P)}, energía = ${fmtKwh(cir.energiaKwh)}, costo = ${fmtMXN(cir.costo)}.`}
        {modo === "generador" && ` Generador: FEM_pico = ${fmtV(gen.femPico)}, FEM_eficaz = ${fmtV(gen.femRms)} a ${fmtHz(f)}.`}
        {modo === "motor" && ` Motor: P_mec = ${fmtKw(mot.pMec)} (${fmtHp(mot.hp)}), calor perdido = ${fmtKw(mot.pPerdida)}.`}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes emPulse { 0%,100%{ box-shadow:0 0 0 0 var(--emc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .em-live-dot { animation: emPulse 1.6s ease-in-out infinite; }
        .em-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .em-grid { grid-template-columns: 1fr; } }
        .em-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .em-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .em-icobtn:hover { background:rgba(255,255,255,0.12); }
        .em-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--emc) 0%, var(--emc) var(--emfill), rgba(255,255,255,0.12) var(--emfill), rgba(255,255,255,0.12) 100%); }
        .em-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--emc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .em-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--emc); cursor:pointer; }
        .em-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .em-tab { cursor:pointer; border:1px solid var(--emc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .em-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .em-tab:hover { background:rgba(255,255,255,0.06); }
        @media (max-width: 1000px){ .em-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .em-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .em-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .em-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .em-drawer[data-open="true"] { transform:translateX(0); }
        .em-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .em-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .em-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .em-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .em-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .em-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="em-tabs">
          {MODOS.map((mo) => {
            const on = mo.id === modo;
            return (
              <button key={mo.id} className="em-tab" data-on={on} onClick={() => cambiarModo(mo.id)}
                style={{ ["--emc" as string]: mo.col, background: on ? `${mo.col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? mo.col : "inherit" }}><i className={`fa-solid ${mo.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{mo.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{mo.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="em-grid">
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
              <ElectromagnetismoScene
                modo={modo}
                V={V} R={R} horas={horas} precio={precio}
                N={N} B={B} area={area} f={f}
                pElec={pElec} efic={efic}
                playing={playing} accent={accent} resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="em-live-dot" style={{ ["--emc" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{modoActual.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="em-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="em-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="em-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reproducir"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="em-icobtn" onClick={resetModo} title="Reiniciar a los valores de inicio">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="em-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "circuito" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-plug-circle-bolt" style={{ color: modoCol, marginRight: 7 }} />
                  V = {fmtV(V)} · R = {fmtR(R)} → I = {fmtA(cir.I)} · P = {fmtW(cir.P)} · {horas} h → {fmtKwh(cir.energiaKwh)} · {fmtMXN(cir.costo)}
                </div>
              )}
              {modo === "generador" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-bolt" style={{ color: modoCol, marginRight: 7 }} />
                  N = {N} · B = {fmt2(B)} T · A = {fmt3(area)} m² · {fmtHz(f)} → FEM_pico = {fmtV(gen.femPico)} · FEM_eficaz = {fmtV(gen.femRms)}
                </div>
              )}
              {modo === "motor" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-gears" style={{ color: modoCol, marginRight: 7 }} />
                  P_elec = {fmtKw(pElec)} · η = {fmtPct(efic)} → P_mec = {fmtKw(mot.pMec)} ({fmtHp(mot.hp)}) · calor = {fmtKw(mot.pPerdida)}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {modo === "circuito" && "Sube la resistencia y la corriente baja (I = V/R); la potencia es P = V²/R. El recibo de luz se cobra por la energía (kWh) que consumes a lo largo del tiempo."}
                {modo === "generador" && "Más vueltas (N), un campo (B) más fuerte, mayor área (A) o más giro (ω = 2πf) → mayor FEM inducida. La bobina girando es el corazón de cada hidroeléctrica."}
                {modo === "motor" && "El motor convierte la energía eléctrica en movimiento; la barra verde es la potencia útil y la roja el calor perdido. Los motores eléctricos (90–97 %) ganan por mucho a la combustión (~35 %)."}
              </div>
            </div>
          </div>

          {/* Controles del modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                {modo === "circuito" ? "Fuente, resistencia y consumo" : modo === "generador" ? "Bobina, campo y giro" : "Potencia y eficiencia"}
              </Eyebrow>
            </div>

            {modo === "circuito" && (
              <>
                <Deslizador label="tensión  V" icon="fa-bolt" colr={C_CIR}
                  valor={fmtV(V)} min={V_MIN} max={V_MAX} step={1.5} value={V}
                  onChange={setV} hintL="1.5 V (pila)" hintR="240 V" />
                <div style={{ height: 14 }} />
                <Deslizador label="resistencia  R" icon="fa-wave-square" colr={C_CIR}
                  valor={fmtR(R)} min={R_MIN} max={R_MAX} step={1} value={R}
                  onChange={setR} hintL="poca (mucha corriente)" hintR="mucha (poca corriente)" />
                <div style={{ height: 14 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Deslizador label="horas de uso" icon="fa-clock" colr={C_CIR}
                    valor={`${horas} h`} min={H_MIN} max={H_MAX} step={1} value={horas}
                    onChange={setHoras} />
                  <Deslizador label="precio  $/kWh" icon="fa-coins" colr={C_CIR}
                    valor={fmtMXN(precio)} min={PRECIO_MIN} max={PRECIO_MAX} step={0.1} value={precio}
                    onChange={setPrecio} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginTop: 14 }}>
                  {CASOS_CIRCUITO.map((cs) => {
                    const on = Math.abs(cs.V - V) < 0.5 && Math.abs(cs.R - R) < 0.5;
                    return (
                      <button key={cs.id} onClick={() => { setV(cs.V); setR(cs.R); }}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : C_CIR, background: on ? C_CIR : `${C_CIR}1f`, border: `1px solid ${C_CIR}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {cs.etq}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_CIR}44`, background: `${C_CIR}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-plug-circle-bolt" style={{ color: C_CIR, marginRight: 8 }} />
                  I = V/R = <strong style={{ color: C_CIR }}>{fmtA(cir.I)}</strong>; P = V²/R = <strong>{fmtW(cir.P)}</strong>. En {horas} h: <strong>{fmtKwh(cir.energiaKwh)}</strong> → <strong style={{ color: "#fde047" }}>{fmtMXN(cir.costo)}</strong>.
                </div>
              </>
            )}

            {modo === "generador" && (
              <>
                <Deslizador label="vueltas de la bobina  N" icon="fa-arrows-spin" colr={C_GEN}
                  valor={`${N}`} min={N_MIN} max={N_MAX} step={5} value={N}
                  onChange={setN} hintL="pocas vueltas" hintR="muchas vueltas" />
                <div style={{ height: 14 }} />
                <Deslizador label="campo magnético  B" icon="fa-magnet" colr={C_GEN}
                  valor={`${fmt2(B)} T`} min={B_MIN} max={B_MAX} step={0.05} value={B}
                  onChange={setB} hintL="imán débil" hintR="imán fuerte" />
                <div style={{ height: 14 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Deslizador label="área  A" icon="fa-vector-square" colr={C_GEN}
                    valor={`${fmt3(area)} m²`} min={AREA_MIN} max={AREA_MAX} step={0.005} value={area}
                    onChange={setArea} />
                  <Deslizador label="frecuencia  f" icon="fa-rotate" colr={C_GEN}
                    valor={fmtHz(f)} min={F_MIN} max={F_MAX} step={1} value={f}
                    onChange={setF} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginTop: 14 }}>
                  {CASOS_GENERADOR.map((cs) => {
                    const on = cs.N === N && Math.abs(cs.B - B) < 0.03 && Math.abs(cs.f - f) < 0.5;
                    return (
                      <button key={cs.id} onClick={() => { setN(cs.N); setB(cs.B); setArea(cs.A); setF(cs.f); }}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : C_GEN, background: on ? C_GEN : `${C_GEN}1f`, border: `1px solid ${C_GEN}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {cs.etq}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_GEN}44`, background: `${C_GEN}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-bolt" style={{ color: C_GEN, marginRight: 8 }} />
                  ω = 2πf = <strong>{fmt2(gen.omega)} rad/s</strong>; FEM_pico = N·B·A·ω = <strong style={{ color: C_GEN }}>{fmtV(gen.femPico)}</strong>; FEM_eficaz = FEM_pico/√2 = <strong>{fmtV(gen.femRms)}</strong>.
                </div>
              </>
            )}

            {modo === "motor" && (
              <>
                <Deslizador label="potencia eléctrica  P_elec" icon="fa-plug" colr={C_MOT}
                  valor={fmtKw(pElec)} min={PEL_MIN} max={PEL_MAX} step={1} value={pElec}
                  onChange={setPElec} hintL="motor pequeño" hintR="motor grande" />
                <div style={{ height: 14 }} />
                <Deslizador label="eficiencia  η" icon="fa-gauge-high" colr={C_MOT}
                  valor={fmtPct(efic)} min={EFIC_MIN} max={EFIC_MAX} step={1} value={efic}
                  onChange={setEfic} hintL="combustión (~35 %)" hintR="eléctrico (≤99 %)" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginTop: 14 }}>
                  {CASOS_MOTOR.map((cs) => {
                    const on = Math.abs(cs.pElec - pElec) < 0.5 && Math.abs(cs.efic - efic) < 0.5;
                    return (
                      <button key={cs.id} onClick={() => { setPElec(cs.pElec); setEfic(cs.efic); }}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : C_MOT, background: on ? C_MOT : `${C_MOT}1f`, border: `1px solid ${C_MOT}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {cs.etq}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_MOT}44`, background: `${C_MOT}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-gears" style={{ color: C_MOT, marginRight: 8 }} />
                  P_mec = η·P_elec = <strong style={{ color: C_MOT }}>{fmtKw(mot.pMec)}</strong> ({fmtHp(mot.hp)}); se pierden como calor <strong style={{ color: "#fb7185" }}>{fmtKw(mot.pPerdida)}</strong> ({fmtPct(100 - efic)}).
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El banco electromagnético */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-bolt" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El banco electromagnético</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ejemplo resuelto (A2) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-square-check" style={{ marginRight: 8, color: accent }} />
              Ejemplo resuelto (A2)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 9 }}>{EJEMPLO_A.enunciado}</div>
            <ul style={{ margin: "0 0 10px", paddingLeft: 16, display: "grid", gap: 4 }}>
              {EJEMPLO_A.pasos.map((p, i) => (
                <li key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.4, fontFamily: "ui-monospace, monospace" }}>{p}</li>
              ))}
            </ul>
            <div style={{ padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_CIR}44`, fontSize: 11.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", lineHeight: 1.4, marginBottom: 14 }}>
              {EJEMPLO_A.resultado}
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 9 }}>{EJEMPLO_B.enunciado}</div>
            <ul style={{ margin: "0 0 10px", paddingLeft: 16, display: "grid", gap: 4 }}>
              {EJEMPLO_B.pasos.map((p, i) => (
                <li key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.4, fontFamily: "ui-monospace, monospace" }}>{p}</li>
              ))}
            </ul>
            <div style={{ padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_MOT}44`, fontSize: 11.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", lineHeight: 1.4 }}>
              {EJEMPLO_B.resultado}
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
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="em-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${modoActual.icono}`} style={{ marginRight: 8, color: modoCol }} />
            Lecturas — {modoActual.etq}
          </Eyebrow>
          {modo === "circuito" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="corriente I" value={fmtA(cir.I)} col={modoCol} size={14} />
              <Readout label="potencia P" value={fmtW(cir.P)} col="#fff" size={14} />
              <Readout label="energía" value={fmtKwh(cir.energiaKwh)} col={modoCol} size={14} />
              <Readout label="costo" value={fmtMXN(cir.costo)} col="#fde047" size={14} />
            </div>
          )}
          {modo === "generador" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="FEM máxima" value={fmtV(gen.femPico)} col={modoCol} size={14} />
              <Readout label="FEM eficaz" value={fmtV(gen.femRms)} col="#fff" size={14} />
              <Readout label="ω = 2πf" value={`${fmt2(gen.omega)}`} unit="rad/s" col={modoCol} size={14} />
              <Readout label="frecuencia" value={fmtHz(f)} col="#86efac" size={14} />
            </div>
          )}
          {modo === "motor" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="pot. mecánica" value={fmtKw(mot.pMec)} col={modoCol} size={14} />
              <Readout label="en caballos" value={fmtHp(mot.hp)} col="#fff" size={14} />
              <Readout label="calor perdido" value={fmtKw(mot.pPerdida)} col="#fb7185" size={14} />
              <Readout label="eficiencia" value={fmtPct(efic)} col="#86efac" size={14} />
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
          Física <strong>exacta</strong> de cálculo cerrado: ley de Ohm V = I·R, potencia P = V·I = I²R = V²/R, energía = P·t (kWh), FEM senoidal de un generador FEM = N·B·A·ω·sen(ωt) con ω = 2πf y balance de eficiencia P_mec = η·P_elec. Los valores de los paneles son <strong>exactos</strong>. La animación 3D es <strong>esquemática</strong>: la rapidez de los electrones, la rotación de la bobina/rotor y el brillo de las lámparas usan escalas visuales (no son magnitudes a escala real); los electrodomésticos se modelan como una resistencia equivalente a la red de CFE (127 V). El ejemplo resuelto es verbatim del ejercicio A2; las ideas clave, el glosario y el contexto se basan en la lectura A1; las preguntas para reflexionar se derivan de ese mismo contenido.
        </span>
      </div>

      {/* ── Objetivos ─────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Explora el modo Circuito y ajusta V y R", done: false },
            { txt: "Explora el modo Generador (FEM de Faraday)", done: false },
            { txt: "Explora el modo Motor y varía la eficiencia", done: false },
            { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────────── */}
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

      {/* ── Cajón de teoría ──────────────────────────────────────────────── */}
      <div className="em-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="em-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="em-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="em-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="em-drawer-body">
          <FichaTeorica data={ELECTROMAGNETISMO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
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
      <input type="range" className="em-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--emc" as string]: colr, ["--emfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
