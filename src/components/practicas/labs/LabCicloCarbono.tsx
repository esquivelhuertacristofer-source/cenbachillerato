"use client";

/**
 * Laboratorio 3D — El ciclo del carbono: equilibrio y desequilibrio.
 * Práctica experimental para CNEYT-III-P04-A1 (progresión 4).
 *
 * Una Tierra rodeada por sus reservorios de carbono (atmósfera, vegetación,
 * animales, suelo, océano y combustibles fósiles); entre ellos viajan átomos de
 * carbono por los procesos del ciclo (fotosíntesis, respiración, descomposición,
 * disolución oceánica, fosilización). El alumno mueve las EMISIONES humanas por
 * quema de fósiles y ve, en vivo, cuánto CO₂ alcanzan a reabsorber océano y
 * bosques y cuánto se acumula en la atmósfera (y cuántas ppm sube al año). A 0
 * el ciclo está en equilibrio; al subir, la atmósfera se tiñe de naranja.
 * Ciencias Naturales, Experimentales y Tecnología III — Ecosistemas y energía
 * (MCCEMS 2025); datos verbatim de INECC 2022 / SEMARNAT / CONAFOR.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { CICLO_CARBONO_FICHA } from "./ciclo-carbono-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./ciclo-carbono-data";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  RESERVORIOS,
  DATOS_MX,
  TIEMPOS,
  acumAtm,
  absorbido,
  ppmAnual,
  fmtGt,
  fmtPpm,
  EMIS_MIN, EMIS_MAX, EMIS_STEP, EMIS_DEFAULT, FRAC_AEREA,
} from "./carbono-data";

const CicloCarbonoScene = dynamic(() => import("./CicloCarbonoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-spin fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const AZUL = "#38bdf8";
const ROJO = "#ef4444";
const NARANJA = "#f59e0b";
const WARN = "#FF8A3C";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-carbono-reto";

/** Instrumentos para medir el carbono (3 correctos + 3 distractores). */
const INSTRUMENTOS: EppItem[] = [
  { key: "sensor", nombre: "Sensor de CO₂", icono: "fa-gauge-high", ok: true, nota: "Mide la concentración de CO₂ en el aire, en ppm: el dato central del ciclo." },
  { key: "termometro", nombre: "Termómetro", icono: "fa-temperature-half", ok: true, nota: "Registra la temperatura, ligada al efecto invernadero del CO₂." },
  { key: "bascula", nombre: "Báscula", icono: "fa-scale-balanced", ok: true, nota: "Pesa la biomasa para estimar el carbono fijado, en gigatoneladas." },
  { key: "pala", nombre: "Pala", icono: "fa-shovel", ok: false, nota: "Sirve para cavar el suelo, no para medir el carbono." },
  { key: "planta", nombre: "Planta", icono: "fa-seedling", ok: false, nota: "Es un reservorio que estudias, no un instrumento de medición." },
  { key: "regadera", nombre: "Regadera", icono: "fa-shower", ok: false, nota: "Riega las plantas, pero no mide nada del ciclo." },
];

export function LabCicloCarbono({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [emisiones, setEmisiones] = useState(EMIS_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // compuerta de equipamiento (pilar: equiparse)
  const [eppListo, setEppListo] = useState(false);

  // objetivos / pasos
  const [vioCiclo] = useState(true);
  const [bajoEquilibrio, setBajoEquilibrio] = useState(false);
  const [subioEmisiones, setSubioEmisiones] = useState(false);
  const [vioMexico, setVioMexico] = useState(false);
  const [arrastro, setArrastro] = useState(false); // arrastró la palanca de emisiones en 3D
  const [predicho, setPredicho] = useState(false); // resolvió el cálculo del carbono al aire

  // récord de estrellas del reto de cálculo (persistido)
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);

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
  const cambiarEmis = (v: number) => {
    setEmisiones(v);
    if (sonido) audioRef.current?.blip();
    if (v === 0) setBajoEquilibrio(true);
    if (v > EMIS_DEFAULT) setSubioEmisiones(true);
  };
  // la palanca de emisiones arrastrada en 3D entra por aquí (pilar: arrastrar)
  const onEmisionesArrastre = useCallback((v: number) => {
    const nv = Math.round(v);
    setArrastro(true);
    setEmisiones(nv);
    if (nv === 0) setBajoEquilibrio(true);
    if (nv > EMIS_DEFAULT) setSubioEmisiones(true);
  }, []);
  const onGrabPalanca = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);
  const reset = () => { setEmisiones(EMIS_DEFAULT); bump(); };

  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    guardaEstrellas(est);
  }, [guardaEstrellas]);

  const acum = useMemo(() => acumAtm(emisiones), [emisiones]);
  const abs = useMemo(() => absorbido(emisiones), [emisiones]);
  const ppm = useMemo(() => ppmAnual(emisiones), [emisiones]);
  const equilibrio = emisiones === 0;

  // pasos guiados (pilar: seguir pasos)
  const pasos = [
    { t: "Equípate", icon: "fa-gauge-high", done: eppListo },
    { t: "Arrastra la palanca de emisiones", icon: "fa-hand-pointer", done: arrastro },
    { t: "Lee el caso de México", icon: "fa-earth-americas", done: vioMexico },
    { t: "Calcula el CO₂ que queda al aire", icon: "fa-calculator", done: predicho },
  ];
  const pasoActivo = pasos.findIndex((p) => !p.done);

  const objetivos = [
    { txt: "Observa el ciclo en equilibrio", done: vioCiclo },
    { txt: "Arrastra la palanca de emisiones en 3D", done: arrastro },
    { txt: "Baja las emisiones a cero", done: bajoEquilibrio },
    { txt: "Sube las emisiones (mira la atmósfera)", done: subioEmisiones },
    { txt: "Lee el caso de México", done: vioMexico },
    { txt: "Calcula el CO₂ que queda al aire", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A3", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: VERDE, boxShadow: `0 10px 30px -6px ${VERDE}` }}>
        <i className="fa-solid fa-arrows-spin" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El carbono no se gasta: circula</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: el carbono pasa entre atmósfera, plantas, animales, suelo, océano y fósiles. Quemar fósiles añade carbono más rápido de lo que océano y bosques pueden reabsorber.
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
        .ex-chip { cursor:pointer; padding:8px 14px; border-radius:999px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

        /* Pasos guiados */
        .ex-steps { display:flex; gap:8px; flex-wrap:wrap; }
        .ex-step { flex:1 1 0; min-width:130px; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px;
          border:1px solid ${T.line}; background:${T.inset}; transition:all .18s; }
        .ex-step[data-state="done"] { border-color:${OK}66; background:${OK}12; }
        .ex-step[data-state="active"] { border-color:${accent}; background:rgba(${color.rgba},0.14); box-shadow:0 0 0 1px ${accent}55; }
        .ex-step-n { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; }

        /* Entrada de cálculo */
        .calc-in { width:100%; box-sizing:border-box; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:18px; font-weight:900; text-align:center; padding:12px; outline:none; transition:border-color .15s; -moz-appearance:textfield; }
        .calc-in:focus { border-color:${accent}; }
        .calc-in::-webkit-outer-spin-button, .calc-in::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        .calc-btn { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:12px 18px; transition:all .15s; }
        .calc-btn-primary { background:${accent}; color:#04121f; }
        .calc-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .calc-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .calc-btn-ghost { background:${T.glass}; border:1px solid ${T.line}; color:#fff; }
        .calc-btn-ghost:hover { border-color:${accent}; }

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

      {/* ── Pasos guiados ──────────────────────────────────────────── */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 16 }}>
        <div className="ex-steps">
          {pasos.map((p, i) => {
            const state = p.done ? "done" : i === pasoActivo ? "active" : "pending";
            return (
              <div key={i} className="ex-step" data-state={state}>
                <span className="ex-step-n" style={{ background: p.done ? OK : i === pasoActivo ? accent : T.glass, color: p.done || i === pasoActivo ? "#04121f" : T.text3 }}>
                  {p.done ? <i className="fa-solid fa-check" /> : <i className={`fa-solid ${p.icon}`} />}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: p.done ? OK : i === pasoActivo ? "#fff" : T.text2, lineHeight: 1.2 }}>{p.t}</span>
              </div>
            );
          })}
        </div>
      </div>

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
              <CicloCarbonoScene
                emisiones={emisiones}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
                arrastrable={eppListo}
                onEmisionesChange={onEmisionesArrastre}
                onGrab={onGrabPalanca}
              />
            </SceneBoundary>

            {/* Compuerta de equipamiento */}
            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Antes de medir: equípate"
                subtitulo="Identifica tus instrumentos de medición"
                verbo="instrumentos de medición"
                intro="Para estudiar el carbono hay que medirlo. Entre el material de abajo, selecciona solo los 3 instrumentos de medición (no la pala, la planta ni la regadera) para entrar."
                onEntrar={() => setEppListo(true)}
              />
            )}

            {/* Cinta EN VIVO — estado del balance */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${equilibrio ? VERDE : ROJO}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${equilibrio ? VERDE : ROJO}aa`, width: 9, height: 9, borderRadius: "50%", background: equilibrio ? VERDE : ROJO }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: equilibrio ? VERDE : ROJO, fontFamily: "ui-monospace, monospace" }}>
                <i className={`fa-solid ${equilibrio ? "fa-scale-balanced" : "fa-temperature-arrow-up"}`} style={{ marginRight: 8 }} />
                {equilibrio ? "ciclo en equilibrio" : `+${fmtGt(acum)} Gt/año al aire`}
              </span>
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
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura del balance */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.9) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 14, color: "#eaf6ee", fontFamily: "ui-monospace, monospace", fontWeight: 800, letterSpacing: "0.01em" }}>
                <span style={{ color: ROJO }}>{fmtGt(emisiones)} Gt CO₂</span> emitidas → <span style={{ color: AZUL }}>{fmtGt(abs)}</span> reabsorbidas, <span style={{ color: NARANJA }}>{fmtGt(acum)}</span> al aire
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>
                {equilibrio
                  ? "Sin combustión humana, lo que las plantas fijan iguala a lo que sale por respiración: el carbono solo circula."
                  : <>Cerca del <strong style={{ color: NARANJA }}>{Math.round(FRAC_AEREA * 100)} %</strong> de lo que emitimos se queda en la atmósfera: el CO₂ sube ~<strong style={{ color: ROJO }}>{fmtPpm(ppm)} ppm</strong> al año y atrapa más calor.</>}
              </div>
            </div>
          </div>

          {/* Control de emisiones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Emisiones humanas de CO₂
            </Eyebrow>
            <Deslizador label="Quema de fósiles + cambio de uso de suelo" icon="fa-industry" colr={ROJO}
              valor={`${emisiones} Gt/año`} min={EMIS_MIN} max={EMIS_MAX} step={EMIS_STEP} value={emisiones} onChange={cambiarEmis}
              hintL="0 (equilibrio natural)" hintR={`${EMIS_MAX} Gt/año`} />
            <div style={{ fontSize: 12, color: T.text3, marginTop: 10, lineHeight: 1.45 }}>
              Hoy el mundo emite <strong style={{ color: T.text2 }}>~37 Gt de CO₂ al año</strong> (INECC 2022). Llévalo a 0 para ver el ciclo natural en equilibrio.
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: T.text3, textAlign: "center", lineHeight: 1.4 }}>
              <i className="fa-solid fa-hand-pointer" style={{ marginRight: 6, color: accent }} />
              o <strong style={{ color: T.text2 }}>arrastra la palanca</strong> (el botón a la izquierda de la Tierra) directamente en la escena.
            </div>
          </div>

          {/* Reto de cálculo: el CO₂ que queda al aire (pilar: hacer cálculos) */}
          <PrediccionCarbonoCard
            accent={accent}
            emisLive={emisiones}
            mejor={mejorEstrellas}
            onResultado={registraEstrellas}
            playSfx={sonido ? (ok) => (ok ? audioRef.current?.correcto() : audioRef.current?.incorrecto()) : undefined}
          />

          {/* Resultado en vivo — balance del carbono */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
              ¿Adónde va el carbono que emitimos?
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
              <Readout label="Emitido" value={`${fmtGt(emisiones)} Gt`} col={ROJO} size={15} />
              <Readout label="Reabsorbido" value={`${fmtGt(abs)} Gt`} col={AZUL} size={15} />
              <Readout label="Queda al aire" value={`${fmtGt(acum)} Gt`} col={NARANJA} size={15} />
              <Readout label="CO₂ sube" value={`${fmtPpm(ppm)} ppm`} col={ROJO} size={16} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              El océano y los bosques son <strong style={{ color: AZUL }}>sumideros</strong>: reabsorben un poco más de la mitad de lo que emitimos. El resto se <strong style={{ color: NARANJA }}>acumula</strong> en la atmósfera año tras año —por eso el CO₂ sube de forma sostenida—. Si un sumidero se destruye (talar un bosque, calentar el océano), reabsorbe menos y deja de ser sumidero para volverse <strong style={{ color: ROJO }}>fuente</strong>. La fracción aérea (~{Math.round(FRAC_AEREA * 100)} %) es aproximada (IPCC).
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Los reservorios de carbono</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RESERVORIOS.map((r) => (
              <div key={r.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: r.color, background: `${r.color}1f` }}>
                  <i className={`fa-solid ${r.icono}`} />
                </div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: r.color }}>{r.nombre}</strong> <span style={{ color: T.text3, fontFamily: "ui-monospace, monospace" }}>(~{r.gtC.toLocaleString("es-MX")} GtC)</span> — {r.resumen}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginTop: 10 }}>
            Tamaños globales aproximados, en gigatoneladas de carbono (GtC). 1 GtC = mil millones de toneladas.
          </div>

          <div className="ex-divider" />

          <Eyebrow>El carbono en México</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} onMouseEnter={() => setVioMexico(true)}>
            {DATOS_MX.map((d) => (
              <div key={d.titulo} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)` }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: T.text }}>{d.titulo}</strong> — {d.texto}
                </div>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Cada ciclo a su ritmo</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TIEMPOS.map((t) => (
              <div key={t.ciclo} style={{ fontSize: 12, color: T.text2, lineHeight: 1.4 }}>
                <strong style={{ color: t.color }}>{t.ciclo}:</strong> {t.tiempo}
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
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Pon las emisiones en <strong style={{ color: VERDE }}>0</strong>: los átomos siguen circulando, pero la atmósfera se mantiene azul (equilibrio). Sube el control: el flujo rojo de <strong style={{ color: ROJO }}>combustión</strong> se dispara y la capa de aire se vuelve naranja. El carbono no desaparece: solo cambia de reservorio.
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
          <FichaTeorica data={CICLO_CARBONO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: `${((value - min) / (max - min)) * 100}%` }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}

/* ── Reto de cálculo: el CO₂ que queda al aire = emisiones × 0.45 ───────── */
function PrediccionCarbonoCard({
  accent,
  emisLive,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  emisLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<number | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap(emisLive);
    setVal("");
    setIntentos(0);
    setCheck(false);
    setEstrellas(null);
  };

  const esp = snap !== null ? acumAtm(snap) : 0; // emisiones × 0.45
  const num = Number((val || "").trim().replace(",", "."));
  const okActual = snap !== null && val.trim() !== "" && !Number.isNaN(num) && Math.abs(num - esp) <= Math.max(0.5, Math.abs(esp) * 0.04);

  const comprobar = () => {
    if (snap === null) return;
    const intentoN = intentos + 1;
    setIntentos(intentoN);
    setCheck(true);
    if (okActual) {
      const est = intentoN <= 1 ? 3 : intentoN === 2 ? 2 : 1;
      setEstrellas(est);
      onResultado(est);
    }
    playSfx?.(okActual);
  };

  return (
    <div style={{ ...card, padding: "22px 24px 24px" }}>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto de cálculo · El CO₂ que queda al aire
      </Eyebrow>

      <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Toma una lectura de las emisiones actuales y calcula cuánto CO₂ se queda en la atmósfera: cerca del{" "}
        <strong style={{ color: NARANJA }}>{Math.round(FRAC_AEREA * 100)} %</strong> de lo emitido, con{" "}
        <strong style={{ color: accent, ...NUM }}>queda al aire = emisiones × {FRAC_AEREA}</strong>. Compruébalo contra la lectura de la escena.
      </div>

      {snap === null ? (
        <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura de las emisiones
        </button>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: "1 1 0", minWidth: 120, borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "9px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>EMISIONES</div>
              <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: ROJO, ...NUM }}>{fmtGt(snap)} Gt/año</div>
            </div>
            <div style={{ flex: "1 1 0", minWidth: 120, borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "9px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>FRACCIÓN AÉREA</div>
              <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: NARANJA, ...NUM }}>{FRAC_AEREA}</div>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 800, color: T.text2, marginBottom: 7 }}>¿Cuánto CO₂ queda al aire? (Gt/año)</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", maxWidth: 320 }}>
            <input
              className="calc-in"
              type="number"
              inputMode="decimal"
              placeholder="Gt"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              style={{ flex: 1, borderColor: check ? (okActual ? OK : WARN) : undefined }}
            />
            <span style={{ fontSize: 14, fontWeight: 900, color: T.text2 }}>Gt</span>
            {check && <i className={`fa-solid ${okActual ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: okActual ? OK : WARN, fontSize: 17 }} />}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            {!(check && okActual) && (
              <button className="calc-btn calc-btn-primary" onClick={comprobar} disabled={val.trim() === ""}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
                Comprobar
              </button>
            )}
            <button className="calc-btn calc-btn-ghost" onClick={tomarLectura}>
              <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 8 }} />
              Otra lectura
            </button>
            {estrellas !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 16, color: s <= estrellas ? "#FBBF24" : "rgba(255,255,255,0.18)" }} />
                  ))}
                </div>
                <span style={{ fontSize: 11.5, color: T.text3 }}>Mejor: <strong style={{ color: mejor >= 3 ? OK : T.text2 }}>{mejor}★</strong></span>
              </div>
            )}
          </div>

          {check && (
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${okActual ? OK : WARN}66`, background: `${okActual ? OK : WARN}14`, padding: "14px 16px", fontSize: 13, color: T.text, lineHeight: 1.5 }}>
              {okActual ? (
                <>
                  <div style={{ fontWeight: 900, color: OK, marginBottom: 6 }}>
                    <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
                    ¡Correcto! Quedan {fmtGt(esp)} Gt al aire
                  </div>
                  <div style={{ color: T.text2, ...NUM }}>
                    {fmtGt(snap)} × {FRAC_AEREA} = {fmtGt(esp)} Gt/año se acumulan en la atmósfera, igual que la lectura naranja de la escena. El resto lo reabsorben océano y bosques.
                  </div>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. Multiplica las emisiones por la fracción aérea: queda al aire = emisiones × {FRAC_AEREA}. Vuelve a intentarlo.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
