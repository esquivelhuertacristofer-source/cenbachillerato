"use client";

/**
 * Laboratorio 3D insignia — «El Sistema Solar: gravitación y leyes de Kepler».
 *
 * Fusión de dos labs de NEM básica (el Explorador espacial y El Sistema
 * Solar) con la capa de física de bachillerato que les faltaba:
 *   · CNEYT-V P3 — gravitación universal, F = G·M·m/r².
 *   · PM-IV P6  — leyes de Kepler (la elipse como lugar geométrico).
 *
 * Cuatro modos, cada uno con su experimento, su «Predice» y sus misiones:
 *  1. Explorador — la vitrina: los ocho planetas con fotografías reales, cada
 *     uno donde está HOY (efemérides del JPL + ecuación de Kepler), con control
 *     del tiempo. El planeta elegido lleva la flecha de la fuerza del Sol a su
 *     distancia de ese día.
 *  2. Periodos (3.ª ley) — la carrera de los planetas y un planeta X que el
 *     alumno coloca: T² ∝ a³, con la tabla de T²/a³ para los ocho.
 *  3. Áreas (2.ª ley) — el planeta pinta los sectores que barre en tiempos
 *     iguales; sus áreas, medidas, son iguales.
 *  4. Rapidez (vis-viva) — v² = GM(2/r − 1/a): perihelio contra afelio, del
 *     casi-círculo de la Tierra al cometa Halley (60 veces más rápido).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { GRAVITACION_FICHA } from "./gravitacion-universal-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { CREDITO_ESPACIO } from "./_espacio";
import type { EscenaSistemaSolarProps } from "./sistema-solar-escena";
import {
  ANIO_DIAS, GM_SOL, KEPLER_SI, M_SOL, ORBITAS, PLANETAS, PREDICCIONES_MODO, RETO_SISTEMA_SOLAR, TIERRA, UA,
  aceleracionSol, areasSectores, estadoPlaneta, fuerzaSol, miles, periodoAnios, planetaPorId, sci, visViva,
  type ModoSS, type Planeta,
} from "./sistema-solar-datos";
import {
  BarrasAreas, BarrasFuerza, Chip, Esfera, GraficaKepler, GraficaRapidez, Interruptor, PrediceModo, SelectorPlanetas,
  TablaKepler, textoVueltas,
} from "./sistema-solar-ui";

const EscenaSistemaSolar = dynamic<EscenaSistemaSolarProps>(() => import("./sistema-solar-escena"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.6)", background: "#02040a" }}>
      <i className="fa-solid fa-sun fa-spin" style={{ fontSize: 28, color: "#fbbf24" }} aria-hidden />
      <span style={{ fontSize: 15, fontWeight: 700 }}>Calculando dónde está cada planeta hoy…</span>
    </div>
  ),
});

const RETO_KEY = "cen-sistema-solar-3d-reto";

const C_EXP = "#fbbf24";
const C_PER = "#a78bfa";
const C_ARE = "#38bdf8";
const C_RAP = "#fb923c";

const MODOS: { id: ModoSS; etq: string; icono: string; col: string }[] = [
  { id: "explorador", etq: "Explorador", icono: "fa-earth-americas", col: C_EXP },
  { id: "periodos", etq: "Periodos", icono: "fa-stopwatch", col: C_PER },
  { id: "areas", etq: "Áreas", icono: "fa-chart-pie", col: C_ARE },
  { id: "rapidez", etq: "Rapidez", icono: "fa-gauge-high", col: C_RAP },
];

const DIA = 86_400;
const VELOCIDADES = [
  { v: DIA, corto: "Día", largo: "1 día por segundo" },
  { v: 7 * DIA, corto: "Semana", largo: "1 semana por segundo" },
  { v: 30.44 * DIA, corto: "Mes", largo: "1 mes por segundo" },
  { v: 365.25 * DIA, corto: "Año", largo: "1 año por segundo" },
];
const MES = 30.44 * DIA;
const ANIOS_POR_SEG = [0.5, 1, 4, 16];
const DIVISIONES = [6, 8, 12, 16];
const AX_DEF = 1.5;
const E_LIBRE_DEF = 0.3;

const fmtDia = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "short", year: "numeric" });

/** Distancia al Sol de un planeta en una fecha (UA). */
const rDe = (p: Planeta, ms: number) => estadoPlaneta(p, ms).r;

export function LabSistemaSolar({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoSS>("explorador");

  // ── Explorador ──
  const [velocidad, setVelocidad] = useState<number>(7 * DIA);
  const [pausa, setPausa] = useState(false);
  const [hoyN, setHoyN] = useState(0);
  const [horaMs, setHoraMs] = useState<number>(() => Date.now());
  const [seleccion, setSeleccion] = useState<string>("tierra");
  const [vuelo, setVuelo] = useState<{ a: string; n: number }>({ a: "interior", n: 0 });
  const [clara, setClara] = useState(false);
  const [orbitas, setOrbitas] = useState(true);
  const [ejes, setEjes] = useState(false);
  const [todosNombres, setTodosNombres] = useState(false);
  const [vistos, setVistos] = useState<string[]>(["tierra"]);
  const [razonMercurio, setRazonMercurio] = useState(1);
  const selRef = useRef(seleccion);
  const extremosMercurio = useRef<{ min: number; max: number } | null>(null);

  // ── Periodos ──
  const [aX, setAX] = useState(AX_DEF);
  const [aniosPorSeg, setAniosPorSeg] = useState(1);
  const [corriendo, setCorriendo] = useState(true);
  const [carreraN, setCarreraN] = useState(0);
  const [carreraAnios, setCarreraAnios] = useState(0);

  // ── Órbita de Kepler (Áreas y Rapidez) ──
  const [orbitaId, setOrbitaId] = useState<string>("libre");
  const [eLibre, setELibre] = useState(E_LIBRE_DEF);
  const [aLibre, setALibre] = useState(1);
  const [divisiones, setDivisiones] = useState(12);
  const [playingE, setPlayingE] = useState(true);
  const [ritmo, setRitmo] = useState(1);
  const [irA, setIrA] = useState<{ cual: "peri" | "afel" | "ninguno"; n: number }>({ cual: "ninguno", n: 0 });
  const [pintarN, setPintarN] = useState(0);
  const [estadoE, setEstadoE] = useState({ M: 0, rUA: 1, v: 0, pintados: 0 });
  const [visto, setVisto] = useState<{ peri: boolean; afel: boolean }>({ peri: false, afel: false });
  const [respAreas, setRespAreas] = useState<string | null>(null);

  // ── Predicciones, reto y sonido ──
  const [predice, setPredice] = useState<Record<ModoSS, string | null>>({ explorador: null, periodos: null, areas: null, rapidez: null });
  const [retoAprobado, setRetoAprobado] = useState(false);
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
  useEffect(() => () => {
    audioRef.current?.dispose();
    audioRef.current = null;
  }, []);
  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };

  // ── Derivados ──
  const preset = ORBITAS.find((o) => o.id === orbitaId) ?? ORBITAS[ORBITAS.length - 1]!;
  const orbA = orbitaId === "libre" ? aLibre : preset.a;
  const orbE = orbitaId === "libre" ? eLibre : preset.e;
  const sel = planetaPorId(seleccion);
  const rSel = sel ? rDe(sel, horaMs) : 1;
  const Fsel = sel ? fuerzaSol(sel.masaKg, rSel) : 0;
  const Ftierra = fuerzaSol(TIERRA.masaKg, rDe(TIERRA, horaMs));
  const TX = periodoAnios(aX);
  const vp = visViva(orbA * (1 - orbE), orbA);
  const va = visViva(orbA * (1 + orbE), orbA);
  const areas = useMemo(() => areasSectores(orbE, divisiones), [orbE, divisiones]);

  // ── Acciones ──
  const elegir = (id: string) => {
    blip();
    setSeleccion(id);
    selRef.current = id;
    setVistos((v) => (v.includes(id) ? v : [...v, id]));
    if (id === "mercurio") {
      extremosMercurio.current = null;
      setRazonMercurio(1);
    }
  };
  const volar = (a: string) => setVuelo((v) => ({ a, n: v.n + 1 }));

  const onHora = useCallback((ms: number) => {
    setHoraMs(ms);
    if (selRef.current === "mercurio") {
      const merc = PLANETAS[0]!;
      const F = fuerzaSol(merc.masaKg, rDe(merc, ms));
      const x = extremosMercurio.current;
      const nx = x ? { min: Math.min(x.min, F), max: Math.max(x.max, F) } : { min: F, max: F };
      extremosMercurio.current = nx;
      setRazonMercurio(nx.max / nx.min);
    }
  }, []);
  const onSeleccion = useCallback((id: string) => {
    setSeleccion(id);
    selRef.current = id;
    setVistos((v) => (v.includes(id) ? v : [...v, id]));
    if (id === "mercurio") {
      extremosMercurio.current = null;
      setRazonMercurio(1);
    }
  }, []);
  const onCarrera = useCallback((t: number) => setCarreraAnios(t), []);
  const onEstado = useCallback((s: { M: number; rUA: number; v: number; pintados: number }) => setEstadoE(s), []);
  const onPaso = useCallback((cual: "peri" | "afel") => setVisto((v) => (v[cual] ? v : { ...v, [cual]: true })), []);

  const cambiarModo = (m: ModoSS) => {
    blip();
    setModo(m);
    if (m === "rapidez" || m === "areas") setVisto({ peri: false, afel: false });
  };
  const elegirOrbita = (id: string) => {
    blip();
    setOrbitaId(id);
    setVisto({ peri: false, afel: false });
    setPintarN((n) => n + 1);
  };
  const ir = (cual: "peri" | "afel") => {
    blip();
    setPlayingE(false);
    setIrA((x) => ({ cual, n: x.n + 1 }));
    setVisto((v) => ({ ...v, [cual]: true }));
  };
  const alinear = () => {
    blip();
    setCarreraN((n) => n + 1);
    setCarreraAnios(0);
    setCorriendo(true);
  };

  const enPausa = modo === "explorador" ? pausa : modo === "periodos" ? !corriendo : !playingE;
  const alternarPausa = () => {
    if (modo === "explorador") setPausa((x) => !x);
    else if (modo === "periodos") setCorriendo((x) => !x);
    else setPlayingE((x) => !x);
  };
  const reiniciar = () => {
    blip();
    if (modo === "explorador") {
      setHoyN((n) => n + 1);
      setVelocidad(7 * DIA);
      setPausa(false);
      volar("sistema");
    } else if (modo === "periodos") {
      setAX(AX_DEF);
      alinear();
    } else {
      setOrbitaId("libre");
      setELibre(E_LIBRE_DEF);
      setALibre(1);
      setPintarN((n) => n + 1);
      setPlayingE(true);
      setVisto({ peri: false, afel: false });
    }
  };

  // ── Misiones ──
  const comprobado: Record<ModoSS, boolean> = {
    explorador: vistos.includes("tierra") && vistos.includes("jupiter"),
    periodos: Math.abs(aX - 2) <= 0.05 && carreraN > 0 && carreraAnios >= TX,
    areas: orbE >= 0.6 && estadoE.pintados >= divisiones,
    rapidez: orbitaId === "halley" && visto.peri && visto.afel,
  };
  const objetivos = [
    { txt: "Corre el tiempo a «1 mes por segundo» o más y mira qué planetas dan la vuelta más rápido", done: modo === "explorador" && !pausa && velocidad >= MES, modo: "explorador" },
    { txt: "Compara la fuerza del Sol sobre la Tierra y sobre Júpiter: ¿a quién jala más?", done: comprobado.explorador, modo: "explorador" },
    { txt: "Elige Mercurio y deja correr el tiempo hasta que la fuerza del Sol sobre él cambie más del doble", done: razonMercurio >= 2, modo: "explorador" },
    { txt: "Pon el planeta X al doble de distancia que la Tierra (a = 2 UA)", done: Math.abs(aX - 2) <= 0.05, modo: "periodos" },
    { txt: "Suelta la carrera y deja que X complete una vuelta: ¿cuántas dio la Tierra?", done: modo === "periodos" && carreraN > 0 && carreraAnios >= TX, modo: "periodos" },
    { txt: "Sube la excentricidad a 0.6 o más y deja que el planeta pinte una vuelta completa", done: comprobado.areas, modo: "areas" },
    { txt: "Responde: ¿el sector junto al Sol tiene más, menos o la misma área que el lejano?", done: respAreas === "iguales", modo: "areas" },
    { txt: "Lleva el cuerpo al perihelio y al afelio y compara su rapidez", done: modo === "rapidez" && visto.peri && visto.afel, modo: "rapidez" },
    { txt: "Elige el cometa Halley: ¿cuántas veces más rápido va junto al Sol?", done: comprobado.rapidez, modo: "rapidez" },
    { txt: "Resuelve el reto del laboratorio (gravitación y Kepler)", done: retoAprobado },
  ];

  // ── Lectura en vivo (≤ 10 palabras) ──
  const lectura =
    modo === "explorador"
      ? sel
        ? <>{fmtDia.format(horaMs)} · {sel.nombre}: F = {sci(Fsel)} N</>
        : <>{fmtDia.format(horaMs)} · elige un planeta</>
      : modo === "periodos"
        ? <>X: T = {miles(TX, 2)} años · T²/a³ = {(TX * TX / (aX * aX * aX)).toFixed(3)}</>
        : modo === "areas"
          ? <>Cada sector: {(100 / divisiones).toFixed(2)} % del área · e = {orbE.toFixed(2)}</>
          : <>v = {miles(estadoE.v, estadoE.v < 10 ? 2 : 1)} km/s · r = {miles(estadoE.rUA, 2)} UA</>;

  // ── Leyenda sobre la escena: el reloj ──
  const leyenda =
    modo === "explorador" ? (
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
          <i className="fa-solid fa-calendar-day" aria-hidden style={{ color: C_EXP, marginRight: 8 }} />
          {fmtDia.format(horaMs)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {VELOCIDADES.map((v) => {
            const on = !pausa && velocidad === v.v;
            return (
              <button key={v.v} type="button" title={v.largo} aria-label={v.largo} aria-pressed={on} onClick={() => { setVelocidad(v.v); setPausa(false); }}
                style={{ cursor: "pointer", border: "none", borderRadius: 8, padding: "5px 9px", fontSize: 14, fontWeight: 800, background: on ? C_EXP : "rgba(255,255,255,0.08)", color: on ? "#1a1205" : "#dfe6f3" }}>
                {v.corto}
              </button>
            );
          })}
          <button type="button" title="Volver a hoy" onClick={() => { setHoyN((n) => n + 1); setPausa(false); }}
            style={{ cursor: "pointer", border: "none", borderRadius: 8, padding: "5px 9px", fontSize: 14, fontWeight: 800, background: "rgba(255,255,255,0.08)", color: "#dfe6f3" }}>
            <i className="fa-solid fa-clock-rotate-left" aria-hidden style={{ marginRight: 6 }} />Hoy
          </button>
        </div>
      </div>
    ) : modo === "periodos" ? (
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
          <i className="fa-solid fa-stopwatch" aria-hidden style={{ color: C_PER, marginRight: 8 }} />
          {miles(carreraAnios, 1)} años desde la salida
        </div>
        <button type="button" onClick={alinear}
          style={{ cursor: "pointer", justifySelf: "start", border: `1px solid ${C_PER}`, borderRadius: 8, padding: "5px 10px", fontSize: 14, fontWeight: 800, background: `${C_PER}26`, color: "#fff" }}>
          <i className="fa-solid fa-flag-checkered" aria-hidden style={{ marginRight: 6, color: C_PER }} />Alinear y soltar
        </button>
      </div>
    ) : modo === "rapidez" ? (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 60, height: 8, borderRadius: 99, background: "linear-gradient(90deg,#60a5fa,#fb923c)" }} aria-hidden />
        <span>lento → rápido</span>
      </div>
    ) : (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: 3, background: C_ARE }} aria-hidden />
        <span style={{ width: 12, height: 12, borderRadius: 3, background: "#f59e0b" }} aria-hidden />
        <span>cada color: el mismo tiempo</span>
      </div>
    );

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 28, textAlign: "center", background: "#02040a" }}>
      <i className="fa-solid fa-sun" style={{ fontSize: 36, color: C_EXP }} aria-hidden />
      <div style={{ fontSize: 18, fontWeight: 900 }}>Tu equipo no puede mostrar la escena en 3D</div>
      <div style={{ fontSize: 15, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Los cálculos siguen en el panel: la fuerza del Sol, la tabla de T²/a³ de los ocho planetas y la rapidez en el perihelio y el afelio.
      </div>
    </div>
  );

  const escenaProps: EscenaSistemaSolarProps =
    modo === "explorador" || modo === "periodos"
      ? {
          grupo: "vitrina", modo, velocidad: pausa ? 0 : velocidad, hoyN, horaMs, seleccion, vuelo, clara, orbitas, ejes, todosNombres,
          onSeleccion, onHora, aX, aniosPorSeg, carreraN, corriendo, onCarrera,
        }
      : {
          grupo: "elipse", modo,
          orbita: { id: orbitaId, a: orbA, e: orbE, textura: preset.textura, color: preset.color },
          divisiones, playing: playingE, ritmo, irA, pintarN, onEstado, onPaso,
        };

  const modoCol = MODOS.find((m) => m.id === modo)!.col;
  const grid2 = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 } as const;
  const fila = { display: "flex", flexWrap: "wrap", gap: 8 } as const;
  const p = (txt: React.ReactNode) => <p style={{ margin: 0, color: T.text2 }}>{txt}</p>;

  /* ── Selector de órbita (Áreas y Rapidez) ── */
  const selectorOrbita = (col: string) => (
    <Bloque titulo="La órbita" icono="fa-circle-notch">
      <div style={fila}>
        {ORBITAS.map((o) => (
          <Chip key={o.id} on={orbitaId === o.id} onClick={() => elegirOrbita(o.id)} color={col}>
            {o.textura ? <Esfera textura={o.textura} tam={18} /> : <i className="fa-solid fa-meteor" aria-hidden />}
            {o.nombre}
          </Chip>
        ))}
      </div>
      {p(preset.nota)}
      {orbitaId === "libre" && (
        <>
          <Deslizador label="excentricidad e" icon="fa-circle-half-stroke" colr={col} valor={orbE.toFixed(2)} min={0} max={0.95} step={0.01} value={eLibre}
            onChange={(v) => { setELibre(v); setPintarN((n) => n + 1); }} hintL="0 · círculo" hintR="0.95 · muy alargada" />
          <Deslizador label="semieje mayor a" icon="fa-arrows-left-right" colr={col} valor={`${miles(aLibre, 2)} UA`} min={0.3} max={30} step={0.1} value={aLibre}
            onChange={(v) => setALibre(v)} hintL="0.3 UA" hintR="30 UA" />
        </>
      )}
    </Bloque>
  );

  const controles = (
    <>
      <div style={{ marginBottom: 18 }}>
        <PrediceModo key={modo} pred={PREDICCIONES_MODO[modo]} eleccion={predice[modo]} color={modoCol}
          onElegir={(id) => { blip(); setPredice((x) => ({ ...x, [modo]: id })); }} comprobado={comprobado[modo]} />
      </div>

      {modo === "explorador" && (
        <>
          <Bloque titulo="Elige un cuerpo" icono="fa-hand-pointer">
            <SelectorPlanetas valor={seleccion} onElegir={elegir} color={C_EXP} />
            <div style={fila}>
              {seleccion !== "sol" && sel && (
                <Chip on={false} onClick={() => volar(seleccion)} color={C_EXP}><i className="fa-solid fa-rocket" aria-hidden />Volar a {sel.nombre}</Chip>
              )}
              <Chip on={false} onClick={() => volar("interior")} color={C_EXP}><i className="fa-solid fa-circle-dot" aria-hidden />Planetas interiores</Chip>
              <Chip on={false} onClick={() => volar("sistema")} color={C_EXP}><i className="fa-solid fa-expand" aria-hidden />Todo el sistema</Chip>
            </div>
            {p("También puedes tocar un planeta en la escena.")}
          </Bloque>

          {sel ? (
            <>
              <Bloque titulo="Gravitación: la fuerza del Sol" icono="fa-magnet">
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, color: "#fff" }}>F = G·M☉·m / r²</div>
                <div style={grid2}>
                  <Dato label="fuerza F" value={`${sci(Fsel)} N`} col={C_EXP} />
                  <Dato label="distancia r hoy" value={`${miles(rSel, 3)} UA`} col={sel.color} />
                  <Dato label="r en km" value={`${miles((rSel * UA) / 1e9, 1)} mill. km`} />
                  <Dato label="masa m" value={`${sci(sel.masaKg)} kg`} />
                  <Dato label="vs la Tierra" value={`${miles(Fsel / Ftierra, Fsel / Ftierra < 10 ? 2 : 1)}×`} col={C_EXP} />
                  <Dato label="g del Sol ahí" value={`${miles(aceleracionSol(rSel) * 1000, 3)} mm/s²`} />
                </div>
                {seleccion === "mercurio" && p(<>Su distancia cambia de 0.31 a 0.47 UA: la fuerza va y viene. Variación vista: <strong style={{ color: "#fff" }}>{miles(razonMercurio, 2)}×</strong>.</>)}
                <BarrasFuerza horaMs={horaMs} seleccion={seleccion} rDe={rDe} color={C_EXP} />
              </Bloque>
              <Bloque titulo={`Ficha: ${sel.nombre}`} icono="fa-id-card">
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <Esfera textura={sel.textura} tam={64} anillo={!!sel.anillo} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: C_EXP }}>{sel.tipo}</div>
                    <div style={{ fontSize: 15, color: T.text2, marginTop: 4 }}>{sel.resumen}</div>
                  </div>
                </div>
                <div style={grid2}>
                  <Dato label="una vuelta al Sol" value={sel.anioDias < 2 * ANIO_DIAS ? `${miles(sel.anioDias, 0)} días` : `${miles(sel.anioDias / ANIO_DIAS, 1)} años`} />
                  <Dato label="excentricidad e" value={sel.e.toFixed(3)} />
                  {sel.datos.map((d) => <Dato key={d.etiqueta} label={d.etiqueta.toLowerCase()} value={d.valor} />)}
                </div>
                {p(<><strong style={{ color: "#fff" }}>Cómo lo conocemos:</strong> {sel.historia}</>)}
              </Bloque>
            </>
          ) : (
            <Bloque titulo="El Sol" icono="fa-sun">
              {p("Una estrella: una esfera de gas tan caliente que brilla con luz propia. Concentra el 99.86 % de la masa del Sistema Solar; por eso todo gira a su alrededor.")}
              <div style={grid2}>
                <Dato label="masa M☉" value={`${sci(M_SOL)} kg`} col={C_EXP} />
                <Dato label="G·M☉" value={`${sci(GM_SOL)} m³/s²`} />
                <Dato label="diámetro" value="1.39 mill. km" />
                <Dato label="luz a la Tierra" value="8 min 20 s" />
              </div>
            </Bloque>
          )}

          <Bloque titulo="Capas" icono="fa-layer-group">
            <div>
              <Interruptor etiqueta="Órbitas" detalle="Las elipses reales de traslación" activo={orbitas} onClick={() => setOrbitas((x) => !x)} color={C_EXP} />
              <Interruptor etiqueta="Ejes de giro" detalle="El eje y el sentido de la rotación" activo={ejes} onClick={() => setEjes((x) => !x)} color={C_EXP} />
              <Interruptor etiqueta="Vista clara" detalle="Ilumina y agranda los planetas" activo={clara} onClick={() => setClara((x) => !x)} color={C_EXP} />
              <Interruptor etiqueta="Todos los nombres" detalle="El nombre junto a cada planeta" activo={todosNombres} onClick={() => setTodosNombres((x) => !x)} color={C_EXP} />
            </div>
          </Bloque>
        </>
      )}

      {modo === "periodos" && (
        <>
          <Bloque titulo="Planeta X" icono="fa-circle-dot">
            <Deslizador label="distancia al Sol a" icon="fa-arrows-left-right" colr={C_PER} valor={`${miles(aX, 2)} UA`}
              min={-0.5} max={1.6} step={0.005} value={Math.log10(aX)} onChange={(v) => setAX(Math.round(Math.pow(10, v) * 100) / 100)} hintL="0.32 UA" hintR="40 UA" />
            <div style={fila}>
              <Chip on={Math.abs(aX - 1) < 0.01} onClick={() => setAX(1)} color={C_PER}>Como la Tierra · 1 UA</Chip>
              <Chip on={Math.abs(aX - 2) < 0.01} onClick={() => setAX(2)} color={C_PER}>El doble · 2 UA</Chip>
              <Chip on={Math.abs(aX - 5.2) < 0.01} onClick={() => setAX(5.2)} color={C_PER}>Como Júpiter · 5.2 UA</Chip>
            </div>
            <div style={grid2}>
              <Dato label="periodo T = a^(3/2)" value={`${miles(TX, 2)} años`} col={C_PER} />
              <Dato label="T²/a³" value={(TX * TX / (aX * aX * aX)).toFixed(3)} col={C_PER} />
            </div>
            {p(textoVueltas(aX))}
          </Bloque>
          <Bloque titulo="La carrera" icono="fa-flag-checkered">
            <div style={fila}>
              <Chip on={false} onClick={alinear} color={C_PER}><i className="fa-solid fa-flag-checkered" aria-hidden />Alinear y soltar</Chip>
              {ANIOS_POR_SEG.map((v) => (
                <Chip key={v} on={corriendo && aniosPorSeg === v} onClick={() => { setAniosPorSeg(v); setCorriendo(true); }} color={C_PER}>{v} {v === 1 ? "año" : "años"}/s</Chip>
              ))}
            </div>
            <div style={grid2}>
              <Dato label="tiempo transcurrido" value={`${miles(carreraAnios, 2)} años`} />
              <Dato label="vueltas de la Tierra" value={miles(carreraAnios / (TIERRA.anioDias / ANIO_DIAS), 2)} col={TIERRA.color} />
              <Dato label="vueltas de X" value={miles(carreraAnios / TX, 2)} col={C_PER} />
              <Dato label="vueltas de Neptuno" value={miles(carreraAnios / (PLANETAS[7]!.anioDias / ANIO_DIAS), 3)} col={PLANETAS[7]!.color} />
            </div>
            {p("Todos salen alineados; cada uno deja una estela de su color sobre lo que ya recorrió.")}
          </Bloque>
          <Bloque titulo="3.ª ley con los datos reales" icono="fa-chart-line">
            {p(<>En escala logarítmica, T² ∝ a³ es una <strong style={{ color: "#fff" }}>recta de pendiente 3/2</strong>, y los ocho planetas caen sobre ella.</>)}
            <GraficaKepler aX={aX} color={C_PER} />
            <TablaKepler aX={aX} color={C_PER} />
            {p(<>Con T en años y a en UA, T²/a³ = 1 para todos. En el SI vale 4π²/(G·M☉) = {sci(KEPLER_SI)} s²/m³. Las diferencias en la tercera cifra son reales: la masa del propio planeta (la de Júpiter es 1/1,000 de la del Sol) y los tirones de los demás.</>)}
          </Bloque>
        </>
      )}

      {modo === "areas" && (
        <>
          {selectorOrbita(C_ARE)}
          <Bloque titulo="Tiempos iguales" icono="fa-chart-pie">
            <div style={fila}>
              {DIVISIONES.map((n) => (
                <Chip key={n} on={divisiones === n} onClick={() => { setDivisiones(n); setPintarN((x) => x + 1); }} color={C_ARE}>{n} sectores</Chip>
              ))}
              <Chip on={false} onClick={() => { blip(); setPintarN((x) => x + 1); setPlayingE(true); }} color={C_ARE}><i className="fa-solid fa-paintbrush" aria-hidden />Volver a pintar</Chip>
            </div>
            {p(<>Cada sector es lo que barre la línea Sol–planeta en <strong style={{ color: "#fff" }}>1/{divisiones} del periodo</strong>. El área de cada uno se mide con la fórmula del cordón.</>)}
            <BarrasAreas areas={areas} pintados={estadoE.pintados} />
            <div style={grid2}>
              <Dato label="sector junto al Sol" value={`${((areas[0] ?? 0) * 100).toFixed(2)} %`} col={C_ARE} />
              <Dato label="sector lejano" value={`${((areas[Math.floor(divisiones / 2)] ?? 0) * 100).toFixed(2)} %`} col="#f59e0b" />
              <Dato label="r mínima / máxima" value={`${miles(orbA * (1 - orbE), 2)} / ${miles(orbA * (1 + orbE), 2)} UA`} />
              <Dato label="sectores pintados" value={`${estadoE.pintados} de ${divisiones}`} />
            </div>
          </Bloque>
          <Bloque titulo="Tu conclusión" icono="fa-comment-dots">
            {p("Junto al Sol el sector es largo y flaco; lejos, corto y ancho. ¿Cuál tiene más área?")}
            <div style={fila}>
              {[{ id: "cerca", t: "El de junto al Sol" }, { id: "lejos", t: "El lejano" }, { id: "iguales", t: "Tienen la misma" }].map((o) => (
                <Chip key={o.id} on={respAreas === o.id} onClick={() => { setRespAreas(o.id); if (sonido) { if (o.id === "iguales") audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } }} color={C_ARE}>{o.t}</Chip>
              ))}
            </div>
            {respAreas && (
              <p role="status" style={{ margin: 0, color: respAreas === "iguales" ? "#34D399" : "#fb7185", fontWeight: 700 }}>
                {respAreas === "iguales"
                  ? "Correcto: es la 2.ª ley de Kepler. Lo que pierde en ancho cerca del Sol lo gana en largo, porque ahí va más rápido."
                  : "Mira los números del medidor: los dos sectores miden lo mismo. Cerca del Sol el planeta va más rápido y el triángulo se alarga lo que se adelgaza."}
              </p>
            )}
          </Bloque>
        </>
      )}

      {modo === "rapidez" && (
        <>
          {selectorOrbita(C_RAP)}
          <Bloque titulo="Perihelio contra afelio" icono="fa-gauge-high">
            <div style={fila}>
              <Chip on={false} onClick={() => ir("peri")} color={C_RAP}><i className="fa-solid fa-sun" aria-hidden />Ir al perihelio</Chip>
              <Chip on={false} onClick={() => ir("afel")} color="#60a5fa"><i className="fa-solid fa-snowflake" aria-hidden />Ir al afelio</Chip>
              <Chip on={playingE} onClick={() => setPlayingE((x) => !x)} color={C_RAP}><i className={`fa-solid ${playingE ? "fa-pause" : "fa-play"}`} aria-hidden />{playingE ? "Pausar" : "Seguir"}</Chip>
            </div>
            <div style={grid2}>
              <Dato label="v ahora" value={`${miles(estadoE.v, estadoE.v < 10 ? 2 : 1)} km/s`} col={C_RAP} />
              <Dato label="r ahora" value={`${miles(estadoE.rUA, 3)} UA`} />
              <Dato label="v en el perihelio" value={`${miles(vp, vp < 10 ? 2 : 1)} km/s`} col={C_RAP} />
              <Dato label="v en el afelio" value={`${miles(va, va < 10 ? 2 : 1)} km/s`} col="#60a5fa" />
              <Dato label="v_p / v_a" value={`${miles(vp / va, 2)}×`} col={C_RAP} />
              <Dato label="(1+e)/(1−e)" value={`${miles((1 + orbE) / (1 - orbE), 2)}`} />
            </div>
            <GraficaRapidez a={orbA} e={orbE} M={estadoE.M} color={C_RAP} />
            {p(<>Vis-viva: <strong style={{ color: "#fff", fontFamily: "ui-monospace, monospace" }}>v² = G·M☉·(2/r − 1/a)</strong>. Cerca del Sol r es chico y v crece; la razón v_p/v_a sale igual a (1+e)/(1−e), sin importar a.</>)}
          </Bloque>
          <Bloque titulo="Ritmo de la animación" icono="fa-forward">
            <div style={fila}>
              {[0.5, 1, 2].map((r) => (
                <Chip key={r} on={ritmo === r} onClick={() => setRitmo(r)} color={C_RAP}>{r}×</Chip>
              ))}
            </div>
            {p(`Una vuelta dura ${miles(14 / ritmo, 0)} s en pantalla; en la realidad, ${miles(periodoAnios(orbA), periodoAnios(orbA) < 10 ? 2 : 1)} años.`)}
          </Bloque>
        </>
      )}
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EscenaSistemaSolar {...escenaProps} />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.etq, icono: m.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as ModoSS),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={enPausa ? "fa-play" : "fa-pause"} titulo={enPausa ? "Reanudar el tiempo" : "Pausar el tiempo"} activo={!enPausa} onClick={alternarPausa} />
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "explorador" ? "Volver a hoy y a la vista completa" : "Reiniciar este modo"} onClick={reiniciar} />
        </>
      }
      leyenda={leyenda}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        { id: "controles", etiqueta: "Controles", icono: "fa-sliders", contenido: controles },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoNumericoCard
              reto={RETO_SISTEMA_SOLAR}
              accent={accent}
              aprobado={retoAprobado}
              onAprobado={() => setRetoAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? audioRef.current?.correcto() : audioRef.current?.incorrecto()) : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Gravitación universal" icono="fa-magnet">
                {p(<>Newton (1687): dos masas se atraen con una fuerza proporcional al producto de sus masas e inversa al cuadrado de su distancia, <strong style={{ color: "#fff" }}>F = G·M·m/r²</strong>, con G = 6.674 × 10⁻¹¹ N·m²/kg². El Sol tiene {sci(M_SOL)} kg: por eso domina el movimiento de todo lo que lo rodea.</>)}
                {p("La fuerza depende de la masa del planeta Y de su distancia. Júpiter está 5.2 veces más lejos que la Tierra, pero su masa es 318 veces mayor: el Sol lo jala unas 12 veces más fuerte.")}
              </Bloque>
              <Bloque titulo="Las tres leyes de Kepler" icono="fa-circle-nodes">
                {p(<><strong style={{ color: "#fff" }}>1.ª (órbitas):</strong> cada planeta recorre una elipse con el Sol en uno de sus focos. La excentricidad e mide qué tan alargada es: 0 es un círculo.</>)}
                {p(<><strong style={{ color: "#fff" }}>2.ª (áreas):</strong> la línea Sol–planeta barre áreas iguales en tiempos iguales. Consecuencia: el planeta va más rápido cerca del Sol.</>)}
                {p(<><strong style={{ color: "#fff" }}>3.ª (periodos):</strong> T² ∝ a³. Para cualquier cuerpo que gire alrededor del Sol, con T en años y a en UA, T² = a³.</>)}
                {p("Kepler las sacó (1609–1619) de las observaciones de Marte de Tycho Brahe, sin saber por qué se cumplían. Newton demostró que las tres son consecuencia de F = G·M·m/r²: igualando esa fuerza con la centrípeta en una órbita circular, m·v²/r = G·M·m/r², y con v = 2πr/T sale T² = (4π²/GM)·r³.")}
              </Bloque>
              <Bloque titulo="La ecuación vis-viva" icono="fa-gauge-high">
                {p(<>De la conservación de la energía en la órbita: ½·v² − G·M/r = −G·M/(2a). Despejando, <strong style={{ color: "#fff" }}>v² = G·M·(2/r − 1/a)</strong>. En el perihelio r = a(1−e) y en el afelio r = a(1+e); dividiendo, v_p/v_a = (1+e)/(1−e).</>)}
                {p("Para una órbita circular (r = a) queda v = √(GM/a): a 1 UA, 29.8 km/s, la rapidez media de la Tierra.")}
              </Bloque>
              <Bloque titulo="De dónde salen las posiciones" icono="fa-satellite-dish">
                {p("Elementos orbitales medios del JPL (E. M. Standish, «Approximate Positions of the Planets»): para cada fecha se calcula la anomalía media M y se resuelve la ecuación de Kepler, M = E − e·sen E, por el método de Newton. De E salen la distancia al Sol y la dirección. Error de alrededor de 1° entre 1800 y 2050.")}
                {p("Masas, radios y periodos: NASA, Planetary Fact Sheet. G·M☉ = 1.32712440018 × 10²⁰ m³/s² (UAI). Todas las cifras del panel se calculan con esos datos; ninguna se escribe a mano.")}
              </Bloque>
              <Bloque titulo="Qué está a escala y qué no" icono="fa-ruler-combined">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li><strong style={{ color: "#fff" }}>Sí:</strong> el orden de los planetas, dónde está cada uno hoy, el tiempo de cada vuelta, la forma (excentricidad) de cada órbita y la inclinación de cada eje.</li>
                  <li><strong style={{ color: "#fff" }}>No:</strong> las distancias (crecen como r^0.6) y los tamaños (como la raíz del radio), para que todo quepa. El giro sobre su eje va más lento que el real. La flecha de fuerza crece con el logaritmo de F. El cometa de la vitrina es un ejemplo, no uno en particular.</li>
                  <li><strong style={{ color: "#fff" }}>Periodos:</strong> las órbitas se dibujan circulares (con su semieje real) para que la carrera se lea; los periodos son los reales.</li>
                  <li><strong style={{ color: "#fff" }}>Áreas y Rapidez:</strong> la órbita siempre se dibuja del mismo tamaño en pantalla; su forma sí es la real, y el movimiento sale de la ecuación de Kepler.</li>
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={GRAVITACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                {CREDITO_ESPACIO} Laboratorio hecho a partir del Explorador espacial y de El Sistema Solar de NEM básica.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
