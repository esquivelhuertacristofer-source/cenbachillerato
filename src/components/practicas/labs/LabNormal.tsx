"use client";

/**
 * Laboratorio 3D — Distribución normal (campana de Gauss).
 * Práctica experimental para PM-VI-P09-A2
 * ("Modelo un evento aleatorio con la distribución normal y calculo su
 *  probabilidad"; progresión 8 / propósito formativo O8).
 *
 * El alumno toma un fenómeno real de México (estaturas ENSANUT, puntajes
 * PLANEA/PISA, CI) y lo modela con una normal: mueve la media μ (la campana
 * se desplaza) y la desviación σ (la campana se ensancha o se estrecha) en el
 * modo CAMPANA; comprueba la regla empírica 68-95-99.7 en el modo REGLA; y en
 * PROBABILIDAD elige un rango [a, b] cuyo área es la probabilidad, con la
 * puntuación z = (x−μ)/σ que estandariza cada extremo. Pensamiento Matemático
 * VI — «Pensamiento estadístico y probabilístico», propósito formativo 8
 * (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { NORMAL_FICHA } from "./normal-ficha";
import {
  PRESETS,
  PRESET_DEFAULT,
  presetPorId,
  MODOS,
  REGLA_EMPIRICA,
  PROBLEMA,
  IDEAS,
  GLOSARIO,
  areaEntre,
  zScore,
  cdfEstandar,
  fmtNum,
  fmtPct,
  RETO_A2,
  type Modo,
} from "./normal-data";

const NormalScene = dynamic(() => import("./NormalScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bell fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const AZUL = "#5fb0ff";
const MAGENTA = "#f0a6ff";

import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-normal-reto";

// Pilar EQUIPARSE: en un estudio estadístico el “equipo” es el instrumental para
// MUESTREAR y CALCULAR (3 correctos + 3 distractores que miden otra cosa o azar).
const INSTRUMENTOS: EppItem[] = [
  { key: "cinta", nombre: "Cinta métrica", icono: "fa-ruler-vertical", ok: true, nota: "Mide la estatura de cada persona de la muestra: es tu dato X." },
  { key: "hoja", nombre: "Hoja de registro", icono: "fa-table-list", ok: true, nota: "Anota cada medición para luego calcular media μ y desviación σ." },
  { key: "calc", nombre: "Calculadora científica", icono: "fa-calculator", ok: true, nota: "Calcula μ, σ, la puntuación z = (x−μ)/σ y las áreas/probabilidades." },
  { key: "dado", nombre: "Dado", icono: "fa-dice", ok: false, nota: "Genera azar artificial; no mide el fenómeno real que quieres modelar." },
  { key: "termo", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura, no la variable de este estudio." },
  { key: "crono", nombre: "Cronómetro", icono: "fa-stopwatch", ok: false, nota: "Mide tiempo; aquí la variable son las estaturas, no la duración." },
];

export function LabNormal({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const inicial = presetPorId(PRESET_DEFAULT);
  const [presetId, setPresetId] = useState(PRESET_DEFAULT);
  const [modo, setModo] = useState<Modo>("campana");
  const [mu, setMu] = useState(inicial.mu);
  const [sigma, setSigma] = useState(inicial.sigma);
  const [a, setA] = useState(inicial.mu - inicial.sigma);
  const [b, setB] = useState(inicial.mu + inicial.sigma);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [movioMu, setMovioMu] = useState(false);
  const [movioSigma, setMovioSigma] = useState(false);
  const [vioEmpirica, setVioEmpirica] = useState(false);
  const [calculoProb, setCalculoProb] = useState(false);
  const [arrastro, setArrastro] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const [cubre95, setCubre95] = useState(false);

  // compuerta de equipamiento (pilar EQUIPARSE)
  const [eppListo, setEppListo] = useState(false);

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // mejor marca de la predicción (estrellas), persistida en el navegador
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);

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

  const bump = () => setResetNonce((k) => k + 1);

  const preset = useMemo(() => presetPorId(presetId), [presetId]);

  const elegirPreset = (id: string) => {
    const p = presetPorId(id);
    setPresetId(id);
    setMu(p.mu);
    setSigma(p.sigma);
    setA(p.mu - p.sigma);
    setB(p.mu + p.sigma);
    bump();
  };

  const elegirModo = (m: Modo) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "empirica") setVioEmpirica(true);
    if (m === "probabilidad") setCalculoProb(true);
  };

  const cambiarMu = (v: number) => { setMu(v); setMovioMu(true); };
  const cambiarSigma = (v: number) => { setSigma(v); setMovioSigma(true); };

  // arrastre directo en 3D (pilar ARRASTRAR/MANIPULAR)
  const onDragMu = useCallback((v: number) => { setMu(v); setMovioMu(true); setArrastro(true); }, []);
  const onDragSigma = useCallback((v: number) => { setSigma(v); setMovioSigma(true); setArrastro(true); }, []);
  const onDragA = useCallback((v: number) => { setA(v); setArrastro(true); }, []);
  const onDragB = useCallback((v: number) => { setB(v); setArrastro(true); }, []);
  const onGrab = useCallback(() => { audioRef.current?.blip(); }, []);

  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    guardaEstrellas(est);
  }, [guardaEstrellas]);

  const reset = () => {
    const p = presetPorId(presetId);
    setModo("campana");
    setMu(p.mu); setSigma(p.sigma);
    setA(p.mu - p.sigma); setB(p.mu + p.sigma);
    bump();
  };

  // magnitudes estadísticas (deterministas)
  const prob = useMemo(() => areaEntre(a, b, mu, sigma), [a, b, mu, sigma]);
  const za = useMemo(() => zScore(Math.min(a, b), mu, sigma), [a, b, mu, sigma]);
  const zb = useMemo(() => zScore(Math.max(a, b), mu, sigma), [a, b, mu, sigma]);
  const varianza = sigma * sigma;

  const modoActual = MODOS.find((m) => m.id === modo) ?? MODOS[0]!;

  // Experimento central: el área bajo la campana ES la probabilidad.
  const en95 = modo === "probabilidad" && prob >= 0.94 && prob <= 0.96;
  if (en95 && !cubre95) setCubre95(true);
  const gLo = modo === "probabilidad" ? Math.min(a, b) : mu - sigma;
  const gHi = modo === "probabilidad" ? Math.max(a, b) : mu + sigma;
  const gProb = modo === "probabilidad" ? prob : areaEntre(mu - sigma, mu + sigma, mu, sigma);

  const objetivos = [
    { txt: "Equípate con el instrumental de muestreo", done: eppListo },
    { txt: "En Probabilidad, lleva a y b hasta que el área valga entre 94 % y 96 %", done: cubre95 },
    { txt: "Desplaza la media μ", done: movioMu },
    { txt: "Cambia la dispersión σ", done: movioSigma },
    { txt: "Arrastra los controles en la escena 3D", done: arrastro },
    { txt: "Observa la regla 68-95-99.7", done: vioEmpirica },
    { txt: "Calcula una probabilidad P(a≤X≤b)", done: calculoProb },
    { txt: "Predice un área y acierta", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bell" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El área bajo la campana es la probabilidad</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: una distribución normal se describe por su media μ (el centro) y su desviación σ (el ancho). El área bajo la curva entre a y b es P(a ≤ X ≤ b), y el área total vale 1. Con z = (x−μ)/σ comparas cualquier valor con la normal estándar.
      </div>
    </div>
  );

  const U = preset.unidad;
  const lecturaCorta = modo === "probabilidad"
    ? <>P({fmtNum(gLo, 0)} ≤ X ≤ {fmtNum(gHi, 0)}) = {fmtPct(prob, 1)}</>
    : modo === "empirica"
      ? <>μ ± 2σ cubre el 95 % de los datos</>
      : <>Entre μ ± σ siempre cae el {fmtPct(gProb, 1)}</>;

  return (
    <>
      <style>{`
        .nrm-cat { cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:2px; width:100%;
          padding:10px 12px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; transition:all .15s; }
        .nrm-cat:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .nrm-cat[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.14); color:#fff; }
        .nrm-calc-in { width:120px; padding:9px 12px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:15px; font-weight:800; font-family:ui-monospace, monospace; outline:none; transition:border-color .15s; }
        .nrm-calc-in:focus { border-color:var(--nrm); }
        .nrm-calc-btn { cursor:pointer; border-radius:10px; font-size:14px; font-weight:800; padding:10px 16px; border:1px solid transparent; transition:filter .15s, background .15s; }
        .nrm-calc-primary { background:var(--nrm); color:#04121f; }
        .nrm-calc-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .nrm-calc-primary:disabled { opacity:.45; cursor:not-allowed; }
        .nrm-calc-ghost { background:transparent; border-color:${T.line}; color:${T.text2}; }
        .nrm-calc-ghost:hover { border-color:${T.lineStrong}; color:#fff; }
        .nrm-sub { display:grid; gap:14px; margin-top:12px; }
        .nrm-cols { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <>
            <SceneBoundary fallback={sceneFallback}>
              <NormalScene
                presetId={presetId}
                accent={accent}
                modo={modo}
                mu={mu}
                sigma={sigma}
                a={a}
                b={b}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
                arrastrable={eppListo}
                onDragMu={onDragMu}
                onDragSigma={onDragSigma}
                onDragA={onDragA}
                onDragB={onDragB}
                onGrab={onGrab}
              />
            </SceneBoundary>
            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Prepara tu estación de muestreo"
                subtitulo="Antes de modelar, equípate con el instrumental correcto"
                intro={`Para levantar la muestra y calcular μ, σ y las probabilidades necesitas el instrumental adecuado. Selecciona solo las ${INSTRUMENTOS.filter((i) => i.ok).length} piezas que sirven para medir y calcular este fenómeno (deja fuera las que miden otra cosa o generan azar).`}
                verbo="muestreo y cálculo"
                onEntrar={() => {
                  setEppListo(true);
                  if (sonido) audioRef.current?.blip();
                }}
              />
            )}
          </>
        }
        modos={{
          opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.nombre, icono: m.icon })),
          valor: modo,
          cambiar: (id) => elegirModo(id as Modo),
        }}
        herramientas={
          <>
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar la lluvia de datos" : "Pausar la lluvia de datos"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
          </>
        }
        leyenda={<MedidorArea p={gProb} lo={gLo} hi={gHi} unidad={U} modo={modo} compacto />}
        lectura={lecturaCorta}
        objetivos={objetivos}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Controles",
            icono: "fa-sliders",
            contenido: (
              <>
                <Bloque titulo={preset.nombre} icono="fa-bell">
                  <Deslizador label="Media μ (centro)" icon="fa-arrows-left-right" colr={ORO} valor={`${fmtNum(mu, 1)} ${U}`} min={preset.muMin} max={preset.muMax} step={(preset.muMax - preset.muMin) / 100} value={mu} onChange={cambiarMu} />
                  <Deslizador label="Desviación σ (ancho)" icon="fa-left-right" colr={AZUL} valor={`${fmtNum(sigma, 1)} ${U}`} min={preset.sigmaMin} max={preset.sigmaMax} step={(preset.sigmaMax - preset.sigmaMin) / 100} value={sigma} onChange={cambiarSigma} />
                  {modo === "probabilidad" && (
                    <>
                      <Deslizador label="Extremo inferior a" icon="fa-arrow-right-to-bracket" colr={VERDE} valor={`${fmtNum(a, 1)} ${U}`} min={preset.xMin} max={preset.xMax} step={(preset.xMax - preset.xMin) / 200} value={a} onChange={setA} />
                      <Deslizador label="Extremo superior b" icon="fa-arrow-right-from-bracket" colr={MAGENTA} valor={`${fmtNum(b, 1)} ${U}`} min={preset.xMin} max={preset.xMax} step={(preset.xMax - preset.xMin) / 200} value={b} onChange={setB} />
                    </>
                  )}
                  <p style={{ margin: 0, color: T.text2 }}>{modoActual.desc}</p>
                </Bloque>

                <Bloque titulo="El área es la probabilidad" icono="fa-chart-area">
                  <MedidorArea p={gProb} lo={gLo} hi={gHi} unidad={U} modo={modo} />
                  <p style={{ margin: 0, color: T.text2 }}>
                    {modo === "probabilidad"
                      ? <>Mueve a y b: el área sombreada crece y la barra la mide. Con z = (x−μ)/σ, el rango va de <strong style={{ color: AZUL }}>z = {fmtNum(za, 2)}</strong> a <strong style={{ color: AZUL }}>z = {fmtNum(zb, 2)}</strong>.</>
                      : <>Ensancha o estrecha σ: la campana cambia de forma, pero el área entre μ ± σ sigue valiendo <strong style={{ color: VERDE }}>68 %</strong>.</>}
                  </p>
                </Bloque>

                <Bloque titulo="Lecturas" icono="fa-magnifying-glass-chart">
                  <div className="nrm-cols">
                    <Dato label="Media μ" value={`${fmtNum(mu, 1)} ${U}`} col={ORO} />
                    <Dato label="Desviación σ" value={`${fmtNum(sigma, 1)} ${U}`} col={AZUL} />
                    <Dato label="Varianza σ²" value={fmtNum(varianza, 1)} col={MAGENTA} />
                    {modo === "probabilidad" ? (
                      <>
                        <Dato label={`P(${fmtNum(gLo, 0)} ≤ X ≤ ${fmtNum(gHi, 0)})`} value={fmtPct(prob, 2)} col={VERDE} />
                        <Dato label="z inferior" value={fmtNum(za, 2)} col={AZUL} />
                        <Dato label="z superior" value={fmtNum(zb, 2)} col={AZUL} />
                      </>
                    ) : (
                      REGLA_EMPIRICA.map((r) => (
                        <Dato key={r.k} label={r.etiqueta} value={`${fmtNum(r.pct, 1)} %`} col={r.k === 1 ? VERDE : r.k === 2 ? AZUL : MAGENTA} />
                      ))
                    )}
                  </div>
                  {modo === "empirica" && (
                    <p style={{ margin: 0, color: T.text2 }}>
                      Aquí, μ ± 2σ = [<strong>{fmtNum(mu - 2 * sigma, 1)}</strong>, <strong>{fmtNum(mu + 2 * sigma, 1)}</strong>] {U}.
                    </p>
                  )}
                </Bloque>

                <Bloque titulo="Elige un fenómeno real" icono="fa-database">
                  {PRESETS.map((p) => (
                    <button key={p.id} type="button" className="nrm-cat" data-on={presetId === p.id} onClick={() => elegirPreset(p.id)}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: presetId === p.id ? accent : T.text }}>{p.nombre}</span>
                      <span style={{ fontSize: 14, color: T.text3, fontFamily: "ui-monospace, monospace" }}>μ = {p.mu} {p.unidad} · σ = {p.sigma} {p.unidad}</span>
                    </button>
                  ))}
                  <p style={{ margin: 0, color: T.text2 }}>{preset.contexto}</p>
                </Bloque>
              </>
            ),
          },
          {
            id: "reto",
            etiqueta: "Reto",
            icono: "fa-trophy",
            contenido: (
              <>
                <Bloque titulo="Pista para el ejercicio A2" icono="fa-lightbulb">
                  <p style={{ margin: 0, color: T.text2 }}>
                    Usa el fenómeno <strong style={{ color: accent }}>estaturas</strong> con <strong>μ = 170</strong> y <strong>σ = 7</strong>. En «Regla» verás que entre <strong style={{ color: VERDE }}>163 y 177</strong> cae el 68 %; en «Probabilidad», lleva b a <strong>184</strong> (z = 2) y obtén P(X &lt; 184) = <strong style={{ color: AZUL }}>{fmtPct(cdfEstandar(2), 2)}</strong>.
                  </p>
                </Bloque>
                <div className="nrm-sub">
                  <PrediccionProbCard
                    accent={accent}
                    rgba={color.rgba}
                    mu={mu}
                    sigma={sigma}
                    a={a}
                    b={b}
                    unidad={preset.unidad}
                    mejorEstrellas={mejorEstrellas}
                    onResultado={registraEstrellas}
                    playSfx={() => {
                      if (sonido) audioRef.current?.correcto();
                    }}
                    playFail={() => {
                      if (sonido) audioRef.current?.incorrecto();
                    }}
                  />
                  <RetoNumericoCard
                    reto={RETO_A2}
                    accent={accent}
                    aprobado={ejercicioAprobado}
                    onAprobado={() => setEjercicioAprobado(true)}
                    playSfx={() => {
                      if (sonido) audioRef.current?.correcto();
                    }}
                  />
                </div>
              </>
            ),
          },
          {
            id: "teoria",
            etiqueta: "Teoría",
            icono: "fa-book-open",
            contenido: (
              <>
                <Bloque titulo="Qué es la distribución normal" icono="fa-bell">
                  <p style={{ margin: 0, color: T.text2 }}>
                    La <strong style={{ color: T.text }}>distribución normal</strong> es un modelo en forma de <strong style={{ color: accent }}>campana simétrica</strong> que aparece una y otra vez en datos reales. Queda totalmente definida por dos números: la media <strong style={{ color: ORO }}>μ</strong> (dónde está el centro) y la desviación estándar <strong style={{ color: AZUL }}>σ</strong> (qué tan ancha es). El área bajo la curva entre dos valores es la <strong style={{ color: VERDE }}>probabilidad</strong> de caer ahí.
                  </p>
                </Bloque>
                <Bloque titulo="Las ideas a leer" icono="fa-lightbulb">
                  <Parte col={ORO} icon="fa-arrows-left-right" titulo="Media μ — tendencia central">
                    μ es el centro y eje de simetría de la campana. En una normal perfecta, media = mediana = moda.
                  </Parte>
                  <Parte col={AZUL} icon="fa-left-right" titulo="Desviación σ — dispersión">
                    σ mide qué tan esparcidos están los datos. A mayor σ, campana más ancha y baja; a menor σ, más alta y angosta.
                  </Parte>
                  <Parte col={VERDE} icon="fa-layer-group" titulo="Regla 68-95-99.7">
                    ~68 % de los datos cae en μ±1σ, ~95 % en μ±2σ y ~99.7 % en μ±3σ. Casi todo está a tres σ del centro.
                  </Parte>
                  <Parte col={AZUL} icon="fa-percent" titulo="Puntuación z y probabilidad">
                    z = (x−μ)/σ traduce a la normal estándar; el área bajo la curva es la probabilidad del rango.
                  </Parte>
                </Bloque>
                <Bloque titulo="De los datos a la campana" icono="fa-chart-simple">
                  <p style={{ margin: 0, color: T.text2 }}>
                    Cuando medimos muchas veces algo natural —estaturas, errores, calificaciones— los valores se <strong style={{ color: T.text }}>amontonan</strong> cerca del promedio y se vuelven raros en los extremos. Esa forma de campana es la normal. Estandarizar con <strong style={{ color: AZUL }}>z</strong> permite comparar cosas distintas: un 184 cm de estatura y un 700 de PLANEA pueden ser ambos «z = 2», igual de excepcionales.
                  </p>
                </Bloque>
                <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                  <p style={{ margin: 0, color: T.text2 }}>
                    La <strong>ENSANUT</strong> (INEGI/Salud) describe estaturas y pesos con campanas; <strong>PLANEA</strong> (SEP) y <strong>PISA</strong> (OCDE) escalan sus puntajes a una normal para comparar generaciones y países; las escalas de <strong>CI</strong> se diseñan normales con μ = 100 y σ = 15. La normal permite estimar qué tan común o raro es un valor y decidir con probabilidades.
                  </p>
                </Bloque>
                <Bloque titulo={`Problema guía — ${PROBLEMA.titulo}`} icono="fa-flask-vial">
                  <p style={{ margin: 0, color: T.text }}>{PROBLEMA.enunciado}</p>
                  {PROBLEMA.solucion.map((s, i) => (
                    <div key={i} style={{ color: T.text2, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>{s}</div>
                  ))}
                  <div style={{ padding: "11px 14px", borderRadius: 11, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)`, color: T.text }}>
                    <strong style={{ color: accent }}>Respuesta. </strong>{PROBLEMA.respuesta}
                  </div>
                </Bloque>
                <Bloque titulo="Ideas clave" icono="fa-key">
                  <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2 }}>
                    {IDEAS.map((idea, i) => <li key={i}>{idea}</li>)}
                  </ul>
                </Bloque>
                <Bloque titulo="Glosario" icono="fa-spell-check">
                  {GLOSARIO.map((g) => (
                    <div key={g.termino} style={{ padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}` }}>
                      <div style={{ fontWeight: 800, color: T.text, marginBottom: 3 }}>{g.termino}</div>
                      <div style={{ color: T.text2 }}>{g.definicion}</div>
                      <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-angle-right" style={{ marginRight: 5, color: accent }} />{g.ejemplo}</div>
                    </div>
                  ))}
                </Bloque>
                <Bloque titulo="Ficha teórica" icono="fa-book">
                  <FichaTeorica data={NORMAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

/* ── Medidor del área: el experimento central (área = probabilidad) ────── */
function MedidorArea({ p, lo, hi, unidad, modo, compacto = false }: { p: number; lo: number; hi: number; unidad: string; modo: Modo; compacto?: boolean }) {
  const pct = Math.max(0, Math.min(100, p * 100));
  const marcas = [68.27, 95.45, 99.73];
  const fs = compacto ? 14 : 15;
  return (
    <div style={{ display: "grid", gap: 6, width: compacto ? 200 : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: fs, fontWeight: 800, color: "#dce6f5" }}>
        <span>{modo === "probabilidad" ? "Área de [a, b]" : "Área de μ ± σ"}</span>
        <span style={{ fontFamily: "ui-monospace, monospace", color: VERDE }}>{fmtNum(pct, 1)} %</span>
      </div>
      <div style={{ position: "relative", height: compacto ? 12 : 16, borderRadius: 8, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: VERDE, transition: "width 120ms linear" }} />
        {marcas.map((m) => (
          <span key={m} style={{ position: "absolute", left: `${m}%`, top: 0, bottom: 0, width: 2, background: "rgba(4,18,31,0.85)" }} />
        ))}
      </div>
      {!compacto && (
        <div style={{ position: "relative", height: 18, fontSize: 14, color: T.text3 }}>
          <span style={{ position: "absolute", left: "68.27%", transform: "translateX(-50%)" }}>68</span>
          <span style={{ position: "absolute", left: "95.45%", transform: "translateX(-50%)" }}>95</span>
        </div>
      )}
      <div style={{ fontSize: fs, color: T.text2 }}>
        de {fmtNum(lo, 0)} a {fmtNum(hi, 0)} {unidad}
      </div>
    </div>
  );
}

/* ── Tarjeta de predicción de área (HACER CÁLCULOS + reto con estrellas) ── */
function PrediccionProbCard({
  accent,
  rgba,
  mu,
  sigma,
  a,
  b,
  unidad,
  mejorEstrellas,
  onResultado,
  playSfx,
  playFail,
}: {
  accent: string;
  rgba: string;
  mu: number;
  sigma: number;
  a: number;
  b: number;
  unidad: string;
  mejorEstrellas: number;
  onResultado: (estrellas: number) => void;
  playSfx: () => void;
  playFail: () => void;
}) {
  const [snap, setSnap] = useState<{ a: number; b: number; mu: number; sigma: number } | null>(null);
  const [valor, setValor] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [veredicto, setVeredicto] = useState<{ ok: boolean; real: number; estrellas: number; dif: number } | null>(null);

  const tomar = () => {
    setSnap({ a, b, mu, sigma });
    setValor("");
    setIntentos(0);
    setVeredicto(null);
  };

  const comprobar = () => {
    if (!snap) return;
    const pred = Number(valor);
    if (!Number.isFinite(pred)) return;
    const real = areaEntre(snap.a, snap.b, snap.mu, snap.sigma) * 100;
    const dif = Math.abs(pred - real);
    const ok = dif <= 3;
    if (ok) {
      const estrellas = intentos === 0 ? 3 : intentos === 1 ? 2 : 1;
      setVeredicto({ ok: true, real, estrellas, dif });
      onResultado(estrellas);
      playSfx();
    } else {
      setIntentos((n) => n + 1);
      setVeredicto({ ok: false, real, estrellas: 0, dif });
      playFail();
    }
  };

  const lo = snap ? Math.min(snap.a, snap.b) : Math.min(a, b);
  const hi = snap ? Math.max(snap.a, snap.b) : Math.max(a, b);

  return (
    <div style={{ ...card, padding: "20px 22px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 8, color: accent }} />
          Predice el área antes de calcularla
        </Eyebrow>
        {mejorEstrellas > 0 && (
          <span style={{ fontSize: 14, fontWeight: 800, color: "#ffd24a", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <i className="fa-solid fa-trophy" />
            Mejor marca:
            {[1, 2, 3].map((s) => (
              <i key={s} className="fa-solid fa-star" style={{ fontSize: 14, color: s <= mejorEstrellas ? "#ffd24a" : "rgba(255,255,255,0.18)" }} />
            ))}
          </span>
        )}
      </div>

      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, margin: "6px 0 14px" }}>
        Estima a ojo qué porcentaje del área cae en el rango y escríbelo. Luego compáralo con el valor exacto que calcula la normal. Aciertas si tu predicción está a <strong style={{ color: accent }}>±3 puntos</strong>; menos intentos, más estrellas.
      </div>

      {!snap ? (
        <button className="nrm-calc-btn nrm-calc-primary" style={{ ["--nrm" as string]: accent }} onClick={tomar}>
          <i className="fa-solid fa-crosshairs" style={{ marginRight: 7 }} />
          Tomar la lectura actual (a, b, μ, σ)
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: "11px 14px", borderRadius: 11, background: `rgba(${rgba},0.08)`, border: `1px solid rgba(${rgba},0.28)`, fontSize: 14, color: T.text2 }}>
            Lectura tomada: <strong style={{ color: "#34D399" }}>P({fmtNum(lo, 1)} ≤ X ≤ {fmtNum(hi, 1)} {unidad})</strong> con μ = <strong>{fmtNum(snap.mu, 1)}</strong>, σ = <strong>{fmtNum(snap.sigma, 1)}</strong>.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: T.text2, fontWeight: 700 }}>Mi predicción:</span>
            <input
              className="nrm-calc-in"
              style={{ ["--nrm" as string]: accent }}
              type="number"
              inputMode="decimal"
              placeholder="0–100"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
            />
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>%</span>
            <button className="nrm-calc-btn nrm-calc-primary" style={{ ["--nrm" as string]: accent }} onClick={comprobar} disabled={valor.trim() === ""}>
              <i className="fa-solid fa-check-double" style={{ marginRight: 7 }} />
              Comprobar
            </button>
            <button className="nrm-calc-btn nrm-calc-ghost" onClick={tomar}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
              Otra lectura
            </button>
          </div>

          {veredicto && (
            <div
              style={{
                padding: "12px 15px",
                borderRadius: 12,
                border: `1px solid ${veredicto.ok ? "#34D39988" : "#FF5E5E66"}`,
                background: veredicto.ok ? "#34D39914" : "#FF5E5E12",
                fontSize: 14, color: T.text, lineHeight: 1.55,
              }}
            >
              {veredicto.ok ? (
                <span>
                  <i className="fa-solid fa-circle-check" style={{ color: "#34D399", marginRight: 8 }} />
                  ¡Acertaste! El área exacta es <strong style={{ color: "#34D399" }}>{fmtPct(veredicto.real / 100, 2)}</strong> (tu error: {fmtNum(veredicto.dif, 1)} pts).{" "}
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 14, marginLeft: 2, color: s <= veredicto.estrellas ? "#ffd24a" : "rgba(255,255,255,0.18)" }} />
                  ))}
                </span>
              ) : (
                <span>
                  <i className="fa-solid fa-circle-xmark" style={{ color: "#FF5E5E", marginRight: 8 }} />
                  Aún no. El área exacta es <strong style={{ color: "#34D399" }}>{fmtPct(veredicto.real / 100, 2)}</strong>; tu predicción se aleja {fmtNum(veredicto.dif, 1)} pts (necesitas ±3). Ajusta y vuelve a intentar.
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de "parte" en el panel lateral ──────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}
