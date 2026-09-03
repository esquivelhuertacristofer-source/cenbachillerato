"use client";

/**
 * Laboratorio 3D — Interacciones entre los subsistemas terrestres.
 * Práctica experimental para CNEYT-III-P05-A2 (simulación; progresión 5).
 *
 * El alumno mueve las variables de la actividad —CO₂ atmosférico, cobertura
 * vegetal, actividad volcánica y la retroalimentación del permafrost— sobre una
 * Tierra 3D con sus cuatro subsistemas (atmósfera, hidrosfera, litosfera,
 * biosfera) y observa en vivo cómo el cambio en uno altera a todos:
 * temperatura media, nivel del mar, pH del océano, metano y ciclo del agua.
 * Incluye los escenarios guiados de la simulación (referencia 1850, hoy,
 * deforestación, erupción mayor, permafrost y restauración).
 * Ecosistemas, interacciones y energía — subsistemas terrestres (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { SUBSISTEMAS_FICHA } from "./subsistemas-terrestres-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./subsistemas-terrestres-data";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import {
  SUBSISTEMAS, ESCENARIOS, INTERACCIONES, calcularEstado,
  CO2_MIN, CO2_MAX, CO2_STEP, CO2_DEFAULT, CO2_REF, CO2_HOY,
  VEG_MIN, VEG_MAX, VEG_STEP, VEG_DEFAULT,
  VOLC_MIN, VOLC_MAX, VOLC_STEP, VOLC_DEFAULT,
  fmt1, fmt2, fmt0, fmtDelta,
} from "./subsistemas-data";

const SubsistemasScene = dynamic(() => import("./SubsistemasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-earth-americas fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el sistema Tierra…</span>
    </div>
  ),
});

const AZUL = "#7cc4ff";
const AGUA = "#3aa0ff";
const VERDE = "#34D399";
const NARANJA = "#f59e0b";
const ROJO = "#ef4444";
const MORADO = "#c084fc";

const RETO_KEY = "cen-subsistemas-terrestres-reto";

export function LabSubsistemas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [co2, setCo2] = useState(CO2_DEFAULT);
  const [veg, setVeg] = useState(VEG_DEFAULT);
  const [volc, setVolc] = useState(VOLC_DEFAULT);
  const [permafrost, setPermafrost] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioCalor, setVioCalor] = useState(false);    // ΔT ≥ +1.5
  const [vioDefor, setVioDefor] = useState(false);    // cobertura ≤ 50
  const [vioVolcan, setVioVolcan] = useState(false);  // volcán activo
  const [vioPNR, setVioPNR] = useState(false);        // punto de no retorno

  // teoría (cajón deslizable) + reto evaluable + sonido
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

  const est = useMemo(() => calcularEstado(co2, veg, volc, permafrost), [co2, veg, volc, permafrost]);

  // marca objetivos según el estado actual
  if (est.deltaT >= 1.5 && !vioCalor) setVioCalor(true);
  if (veg <= 50 && !vioDefor) setVioDefor(true);
  if (volc > 0 && !vioVolcan) setVioVolcan(true);
  if (est.puntoNoRetorno && !vioPNR) setVioPNR(true);

  const cargar = (nco2: number, nveg: number, nvolc: number, nperm: boolean) => {
    if (sonido) audioRef.current?.blip();
    setCo2(nco2); setVeg(nveg); setVolc(nvolc); setPermafrost(nperm); bump();
  };
  const reset = () => cargar(CO2_DEFAULT, VEG_DEFAULT, VOLC_DEFAULT, false);

  // estado de alerta climática (para la cinta EN VIVO)
  const alerta = useMemo(() => {
    if (est.puntoNoRetorno) return { txt: "punto de no retorno", col: MORADO };
    if (est.deltaT >= 2.0) return { txt: "calentamiento severo", col: ROJO };
    if (est.deltaT >= 1.0) return { txt: "calentamiento notable", col: NARANJA };
    if (est.deltaT <= -0.3) return { txt: "enfriamiento (aerosoles)", col: AZUL };
    return { txt: "cercano al equilibrio", col: VERDE };
  }, [est.deltaT, est.puntoNoRetorno]);

  const objetivos = [
    { txt: "Calienta el planeta +1.5 °C", done: vioCalor },
    { txt: "Deforesta hasta ≤ 50%", done: vioDefor },
    { txt: "Activa un volcán", done: vioVolcan },
    { txt: "Dispara el permafrost", done: vioPNR },
    { txt: "Resuelve el reto evaluable de la actividad A3", done: ejercicioAprobado },
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
        <i className="fa-solid fa-earth-americas" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Todo está conectado</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la Tierra en 3D, pero la idea sigue: atmósfera, hidrosfera, litosfera y biosfera forman un solo sistema. Mover una variable —como el CO₂— cambia la temperatura, el nivel del mar, el pH del océano y la vida.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse3 { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse3 1.6s ease-in-out infinite; }
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
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182c 0%,#03101f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <SubsistemasScene
                co2={co2} veg={veg} volc={volc} permafrost={permafrost}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — alerta climática */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${alerta.col}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${alerta.col}aa`, width: 9, height: 9, borderRadius: "50%", background: alerta.col }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: alerta.col }}>{fmtDelta(est.deltaT)} °C — {alerta.txt}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((vv) => !vv)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Volver a 1850">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura del sistema */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.9) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13.5, color: "#eaf6ee", fontWeight: 800 }}>
                CO₂ <span style={{ color: AZUL }}>{fmt0(co2)} ppm</span> · Temperatura <span style={{ color: alerta.col }}>{fmt1(est.temperatura)} °C</span> · Nivel del mar <span style={{ color: AGUA }}>{fmtDelta(est.nivelMar, 0)} cm</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>
                {est.puntoNoRetorno
                  ? <>El deshielo del permafrost libera metano (~{fmt0(est.ch4)} ppb) que amplifica el calentamiento: una retroalimentación que se dispara sola.</>
                  : volc > 0
                    ? <>El volcán inyecta SO₂ (enfría ~{fmt1(est.enfriaVolcan)} °C a corto plazo) y CO₂ que acidifica el océano (pH {fmt2(est.ph)}).</>
                    : veg < 70
                      ? <>Con menos bosque cae el sumidero de CO₂ y la lluvia tierra adentro (índice de precipitación {fmt0(est.precip)}).</>
                      : <>Mueve una variable y observa cómo responden los otros tres subsistemas: todo está conectado.</>}
              </div>
            </div>
            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Variables de la simulación
            </Eyebrow>
            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="CO₂ atmosférico" icon="fa-smog" colr={AZUL}
                valor={`${fmt0(co2)} ppm`} min={CO2_MIN} max={CO2_MAX} step={CO2_STEP} value={co2}
                onChange={setCo2} hintL={`${CO2_REF} (1850)`} hintR={`${CO2_MAX}`} />
              <Deslizador label="Cobertura vegetal (biosfera)" icon="fa-tree" colr={VERDE}
                valor={`${fmt0(veg)} %`} min={VEG_MIN} max={VEG_MAX} step={VEG_STEP} value={veg}
                onChange={setVeg} hintL={`${VEG_MIN}% (deforestado)`} hintR="100% (intacto)" />
              <Deslizador label="Actividad volcánica (litosfera)" icon="fa-volcano" colr={NARANJA}
                valor={volc === 0 ? "ninguna" : `${fmt0(volc)} / 10`} min={VOLC_MIN} max={VOLC_MAX} step={VOLC_STEP} value={volc}
                onChange={setVolc} hintL="0" hintR="10 (erupción mayor)" />
            </div>

            {/* toggle permafrost */}
            <button onClick={() => { setPermafrost((p) => !p); bump(); }}
              style={{ width: "100%", marginTop: 16, cursor: "pointer", padding: "11px 14px", borderRadius: 12, border: `1px solid ${permafrost ? MORADO : T.line}`, background: permafrost ? `${MORADO}22` : T.inset, color: permafrost ? "#fff" : T.text2, fontSize: 12.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, transition: "all .15s" }}>
              <i className={`fa-solid ${permafrost ? "fa-toggle-on" : "fa-toggle-off"}`} style={{ color: permafrost ? MORADO : T.text3, fontSize: 16 }} />
              Retroalimentación del permafrost {permafrost ? "ACTIVADA" : "desactivada"}
            </button>

            {/* escenarios */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc}
                  onClick={() => cargar(e.co2, e.veg, e.volc, e.permafrost)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lecturas del sistema */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
              Respuesta del sistema
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Readout label="Temperatura media" value={fmt1(est.temperatura)} unit="°C" col={alerta.col} size={18} />
              <Readout label="Δ vs 1850" value={fmtDelta(est.deltaT)} unit="°C" col={alerta.col} size={18} />
              <Readout label="Nivel del mar" value={fmtDelta(est.nivelMar, 0)} unit="cm" col={AGUA} size={18} />
              <Readout label="pH del océano" value={fmt2(est.ph)} col={est.ph < 8.05 ? ROJO : AGUA} size={18} />
              <Readout label="Metano (CH₄)" value={fmt0(est.ch4)} unit="ppb" col={MORADO} size={16} />
              <Readout label="Precipitación" value={fmt0(est.precip)} unit="índ." col={VERDE} size={16} />
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Los cuatro subsistemas</Eyebrow>
          {SUBSISTEMAS.map((s, i) => (
            <div key={s.key}>
              {i > 0 && <div className="ex-divider" />}
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: s.color, background: `${s.color}22` }}>
                  <i className={`fa-solid ${s.icono}`} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{s.nombre}</span>
              </div>
              <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 7 }}>{s.resumen}</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 3 }}>
                {s.datos.map((d, j) => (
                  <li key={j} style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4 }}>{d}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="ex-divider" />
          <Eyebrow>Interacciones clave</Eyebrow>
          <div style={{ display: "grid", gap: 10 }}>
            {INTERACCIONES.map((it, i) => (
              <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 800, color: accent }}>{it.de} → {it.a}: </span>
                {it.texto}
              </div>
            ))}
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
            Lleva el CO₂ de {CO2_REF} a {CO2_HOY} ppm y observa subir la temperatura y el mar mientras baja el pH. Luego prueba la <strong style={{ color: MORADO }}>restauración</strong>: ¿el sistema vuelve por completo? Esa «inercia» es lo que hace urgente actuar.
          </span>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Modelo cualitativo con fines didácticos: usa números de referencia conocidos (sensibilidad climática ~3 °C por duplicación de CO₂, IPCC; pH preindustrial 8.2) para mostrar la dirección y el orden de las interacciones entre subsistemas, no para predecir valores exactos.
        </span>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla A3 ─────────────── */}
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
          <FichaTeorica data={SUBSISTEMAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
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
      <input type="range" className="ex-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
