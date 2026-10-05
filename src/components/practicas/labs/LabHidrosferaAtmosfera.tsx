"use client";

/**
 * Laboratorio 3D — "Hidrósfera y atmósfera: capas, composición e intercambio".
 * CNEYT-III, progresión 2 (actividades CNEYT-III-P10). Evaluable principal:
 * ejercicio matemático A2 «Densidad, presión y el ciclo del agua»; también el
 * texto A6. El marco teórico es la lectura A1, los hechos salen del
 * verdadero/falso A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) Columna de aire — capas de la atmósfera con la Atmósfera Estándar 1976,
 *      predicción de la inversión térmica, lugares, ebullición, moléculas de O₂
 *      y un globo sonda que crece hasta reventar.
 *  (2) Océano en corte — perfiles de temperatura y salinidad de tres zonas,
 *      sensor CTD, picnoclina, masas de agua que se acomodan por densidad
 *      (EOS-80) y un bloque de hielo que flota.
 *  (3) Aire y agua se mezclan — una parcela de aire del Golfo de México sube
 *      la sierra: evaporación, nivel de condensación, lluvia, calor latente y
 *      sombra orográfica en Perote.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { RetoNumericoCard } from "./_reto-numerico";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { HIDROSFERA_ATMOSFERA_FICHA } from "./hidrosfera-atmosfera-ficha";
import {
  type Modo,
  type ZonaId,
  type ViajeParcela,
  MODOS,
  MODOS_DEF,
  num,
  cientifico,
  presionTxt,
  Z_MAX_KM,
  atmosfera,
  AIRE_0,
  capaDe,
  COMPOSICION,
  o2PorLitro,
  ebullicionC,
  LUGARES,
  LUGARES_TIERRA,
  PREDICCIONES_T,
  EXPLICA_INVERSION,
  GLOBO,
  Z_RUPTURA,
  diametroGlobo,
  ZONAS,
  aguaEn,
  PROF_MAX,
  rhoMar,
  profundidadEquilibrio,
  MASAS,
  T_MASA,
  S_MASA,
  RHO_HIELO,
  fraccionSumergida,
  AGUA_1000L,
  T_PARCELA,
  HR_PARCELA,
  viajeParcela,
  puntoRocio,
  presionVaporSat,
  calorLatente,
  estadoAguaParcela,
  GAMMA_SECO,
  SEG_VIAJE,
  CONTRASTE_SIERRA,
  ENUNCIADOS,
  rondaEnunciados,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS,
  REFLEXION_A3,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  RETO_A2,
  HUECOS_A6,
} from "./hidrosfera-atmosfera-data";

const HidrosferaScene = dynamic(() => import("./HidrosferaAtmosferaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-earth-americas fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el aire y el agua del planeta en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-hidrosfera-atmosfera-reto";
const WARN = "#FF8A3C";
const T_CAIDA_MASA = 2800;
const T_CAIDA_HIELO = 1600;
const RONDA_INICIAL = rondaEnunciados(mulberry32(7));
const GRAD_T = "linear-gradient(90deg, #312e81, #1d4ed8, #0284c7, #06b6d4, #34d399, #facc15, #f97316)";
const GRAD_S = "linear-gradient(90deg, #f0fdf4, #bbf7d0, #4ade80, #16a34a, #14532d)";

/* ── Tarjeta de estrellas: ¿tiempo o clima? ───────────────────────────── */
function TiempoClimaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ENUNCIADOS[ronda[pos] ?? 0]!;

  const responder = (clima: boolean) => {
    if (resuelto !== null) return;
    const ok = clima === actual.clima;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`Es ${actual.clima ? "clima" : "tiempo atmosférico"}: ${actual.porque}`);
      return;
    }
    setAviso(null);
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaEnunciados(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "16px", marginTop: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Tiempo atmosférico o clima?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Enunciado {pos + 1} de {ronda.length} · ¿describe un momento concreto o el patrón de muchos años?
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="ha-opt ha-tc" data-on="true" onClick={() => responder(false)} style={{ ["--hac" as string]: "#38bdf8" }}>
              <i className="fa-solid fa-cloud-sun-rain" style={{ marginRight: 8 }} />
              Tiempo atmosférico
            </button>
            <button className="ha-opt ha-tc" data-on="true" onClick={() => responder(true)} style={{ ["--hac" as string]: "#a78bfa" }}>
              <i className="fa-solid fa-calendar-days" style={{ marginRight: 8 }} />
              Clima
            </button>
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 14, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 14, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Gráficas SVG del panel ───────────────────────────────────────────── */

function GraficaDensidad({ zonaId, prof, col }: { zonaId: ZonaId; prof: number; col: string }) {
  const zona = ZONAS.find((z) => z.id === zonaId)!;
  const W = 300;
  const H = 170;
  const rMin = 1022;
  const rMax = 1029;
  const x = (r: number) => 36 + ((r - rMin) / (rMax - rMin)) * (W - 48);
  const y = (d: number) => 12 + Math.sqrt(d / PROF_MAX) * (H - 34);
  const pts = Array.from({ length: 81 }, (_, i) => {
    const f = i / 80;
    const d = f * f * PROF_MAX;
    return `${x(aguaEn(zona, d).rho).toFixed(1)},${y(d).toFixed(1)}`;
  }).join(" ");
  const actual = aguaEn(zona, prof);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", borderRadius: 10, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }} role="img" aria-label="Perfil de densidad del agua de mar">
      <rect x={36} y={y(zona.picnoclina.desde)} width={W - 48} height={y(zona.picnoclina.hasta) - y(zona.picnoclina.desde)} fill="#fbbf24" opacity={0.12} />
      {[1022, 1024, 1026, 1028].map((r) => (
        <g key={r}>
          <line x1={x(r)} x2={x(r)} y1={12} y2={H - 22} stroke="rgba(255,255,255,0.08)" />
          <text x={x(r)} y={H - 8} fill="rgba(255,255,255,0.55)" fontSize={12} textAnchor="middle">
            {r}
          </text>
        </g>
      ))}
      {[0, 250, 1000, 4000].map((d) => (
        <text key={d} x={32} y={y(d) + 3} fill="rgba(255,255,255,0.55)" fontSize={12} textAnchor="end">
          {d} m
        </text>
      ))}
      <polyline points={pts} fill="none" stroke={col} strokeWidth={2.4} />
      <circle cx={x(actual.rho)} cy={y(prof)} r={4.5} fill="#fbbf24" stroke="#04121f" strokeWidth={1.5} />
      <text x={W - 12} y={24} fill="rgba(255,255,255,0.7)" fontSize={12} textAnchor="end" fontWeight={700}>
        densidad (kg/m³)
      </text>
    </svg>
  );
}

function GraficaParcela({ viaje, progreso, lanzada, col }: { viaje: ViajeParcela; progreso: number; lanzada: boolean; col: string }) {
  const W = 300;
  const H = 180;
  const ts = viaje.puntos.map((p) => p.tC);
  const tMin = Math.floor(Math.min(...ts, viaje.tFinalSeco, viaje.t0 - GAMMA_SECO * 3) / 5) * 5;
  const tMax = Math.ceil(Math.max(...ts, viaje.t0) / 5) * 5;
  const x = (t: number) => 30 + ((t - tMin) / Math.max(1, tMax - tMin)) * (W - 42);
  const y = (z: number) => H - 24 - (z / 3200) * (H - 40);
  const hasta = lanzada ? Math.round(progreso * (viaje.puntos.length - 1)) : viaje.puntos.length - 1;
  const recorrido = viaje.puntos
    .slice(0, hasta + 1)
    .map((p) => `${x(p.tC).toFixed(1)},${y(p.z).toFixed(1)}`)
    .join(" ");
  const actual = viaje.puntos[Math.min(hasta, viaje.puntos.length - 1)]!;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", borderRadius: 10, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }} role="img" aria-label="Temperatura de la parcela contra la altitud">
      {Array.from({ length: Math.floor((tMax - tMin) / 10) + 1 }, (_, k) => tMin + k * 10).map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={10} y2={H - 24} stroke="rgba(255,255,255,0.08)" />
          <text x={x(t)} y={H - 10} fill="rgba(255,255,255,0.55)" fontSize={12} textAnchor="middle">
            {t} °C
          </text>
        </g>
      ))}
      {[0, 1000, 2000, 3000].map((z) => (
        <text key={z} x={26} y={y(z) + 3} fill="rgba(255,255,255,0.55)" fontSize={12} textAnchor="end">
          {z / 1000} km
        </text>
      ))}
      {/* Referencia: subir y bajar sin condensar (adiabática seca) */}
      <polyline points={`${x(viaje.t0)},${y(0)} ${x(viaje.t0 - GAMMA_SECO * 3)},${y(3000)}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} strokeDasharray="4 3" />
      {viaje.zNube !== null && <line x1={30} x2={W - 12} y1={y(viaje.zNube)} y2={y(viaje.zNube)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />}
      <polyline points={recorrido} fill="none" stroke={col} strokeWidth={2.6} />
      <circle cx={x(actual.tC)} cy={y(actual.z)} r={4.5} fill="#fff" stroke="#04121f" strokeWidth={1.5} />
      <text x={W - 12} y={20} fill="rgba(255,255,255,0.6)" fontSize={12} textAnchor="end">
        - - - sin condensar (−9.8 °C/km)
      </text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

type Vuelo = "suelo" | "subiendo" | "reventado";

export function LabHidrosferaAtmosfera({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("atmosfera");

  // ── Atmósfera
  const [zKm, setZKm] = useState(0.01);
  const [prediccion, setPrediccion] = useState<string | null>(null);
  const [vuelo, setVuelo] = useState<Vuelo>("suelo");
  const [subioEstratosfera, setSubioEstratosfera] = useState(false);
  const [globoReventado, setGloboReventado] = useState(false);
  const [lugares, setLugares] = useState<Set<string>>(() => new Set());
  const [lugarId, setLugarId] = useState<string | null>("veracruz");

  // ── Océano
  const [zonaId, setZonaId] = useState<ZonaId>("tropical");
  const [profCTD, setProfCTD] = useState(0);
  const [clinas, setClinas] = useState<Set<"termoclina" | "haloclina">>(() => new Set());
  const [masaT, setMasaT] = useState(20);
  const [masaS, setMasaS] = useState(0.2);
  const [masaNonce, setMasaNonce] = useState(0);
  const [resMasa, setResMasa] = useState<{ t: number; s: number; rho: number; donde: "flota" | "capa" | "fondo"; prof: number; zona: string } | null>(null);
  const [cayendo, setCayendo] = useState(false);
  const [hieloNonce, setHieloNonce] = useState(0);
  const [hieloListo, setHieloListo] = useState(false);
  const [hieloVisto, setHieloVisto] = useState(false);
  const [flotoDulce, setFlotoDulce] = useState(false);
  const [hundioHondo, setHundioHondo] = useState(false);

  // ── Ciclo
  const [t0, setT0] = useState(T_PARCELA.def);
  const [hr0, setHr0] = useState(HR_PARCELA.def);
  const [progreso, setProgreso] = useState(0);
  const [lanzada, setLanzada] = useState(false);
  const [enViaje, setEnViaje] = useState(false);
  const [conNube, setConNube] = useState<ViajeParcela | null>(null);
  const [sinNube, setSinNube] = useState<ViajeParcela | null>(null);
  const viaje = useMemo(() => viajeParcela(t0, hr0), [t0, hr0]);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [retoOk, setRetoOk] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
  const intervalos = useRef<number[]>([]);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setClasifico(true);
      guardaEstrellas(est);
    },
    [guardaEstrellas],
  );

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
    const lista = timers.current;
    const ints = intervalos.current;
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      lista.forEach((t) => window.clearTimeout(t));
      ints.forEach((t) => window.clearInterval(t));
    };
  }, []);

  const despues = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const cadaTanto = (ms: number, fn: () => boolean) => {
    const id = window.setInterval(() => {
      if (fn()) window.clearInterval(id);
    }, ms);
    intervalos.current.push(id);
  };
  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Atmósfera ─────────────────────────────────────────────────────── */
  const aire = atmosfera(zKm);
  const capa = capaDe(zKm);
  const eb = ebullicionC(aire.pPa);
  const zMaxSlider = prediccion ? Z_MAX_KM : 11;
  const predCorrecta = PREDICCIONES_T.find((p) => p.id === prediccion)?.correcta ?? false;

  const moverZ = (v: number) => {
    if (vuelo === "subiendo") return;
    const z = Math.min(zMaxSlider, v);
    setZKm(z);
    setLugarId(null);
    if (vuelo === "reventado") setVuelo("suelo");
    if (prediccion && z >= 25) setSubioEstratosfera(true);
  };
  const irALugar = (id: string) => {
    if (vuelo === "subiendo") return;
    const l = LUGARES.find((x) => x.id === id)!;
    if (!prediccion && l.zKm > 11) return;
    setZKm(l.zKm);
    setLugarId(id);
    if (vuelo === "reventado") setVuelo("suelo");
    if (LUGARES_TIERRA.includes(id)) setLugares((s) => new Set(s).add(id));
    if (prediccion && l.zKm >= 25) setSubioEstratosfera(true);
    blip();
  };
  const predecir = (id: string) => {
    if (prediccion) return;
    setPrediccion(id);
    sfx(PREDICCIONES_T.find((p) => p.id === id)!.correcta);
  };
  const soltarGlobo = () => {
    if (vuelo === "subiendo" || !prediccion) return;
    setVuelo("subiendo");
    setZKm(0);
    setLugarId(null);
    blip();
    let ticks = 0;
    cadaTanto(100, () => {
      ticks += 1;
      const z = (ticks * 0.1) / GLOBO.segPorKm;
      if (z >= Z_RUPTURA) {
        setZKm(Z_RUPTURA);
        setVuelo("reventado");
        setGloboReventado(true);
        setSubioEstratosfera(true);
        if (sonido) audioRef.current?.romper();
        return true;
      }
      setZKm(z);
      return false;
    });
  };

  /* ── Océano ────────────────────────────────────────────────────────── */
  const zona = ZONAS.find((z) => z.id === zonaId)!;
  const ctd = aguaEn(zona, profCTD);
  const sup = aguaEn(zona, 0);
  const rhoMasa = rhoMar(masaT, masaS);
  const tramoCTD = profCTD < zona.picnoclina.desde ? "Capa de mezcla (superficial)" : profCTD <= zona.picnoclina.hasta ? `${zona.picnoclina.causa === "termoclina" ? "Termoclina" : "Haloclina"}: la densidad cambia rápido` : "Agua profunda: fría y densa";

  const elegirZona = (id: ZonaId) => {
    setZonaId(id);
    setResMasa(null);
    setHieloListo(false);
    setMasaNonce(0);
    setHieloNonce(0);
    const z = ZONAS.find((x) => x.id === id)!;
    if (profCTD > z.picnoclina.hasta) setClinas((s) => new Set(s).add(z.picnoclina.causa));
    blip();
  };
  const moverCTD = (v: number) => {
    setProfCTD(v);
    if (v > zona.picnoclina.hasta) setClinas((s) => (s.has(zona.picnoclina.causa) ? s : new Set(s).add(zona.picnoclina.causa)));
  };
  const elegirMasa = (id: string) => {
    const m = MASAS.find((x) => x.id === id)!;
    setMasaT(m.t);
    setMasaS(m.s);
    blip();
  };
  const soltarMasa = () => {
    if (cayendo) return;
    const eq = profundidadEquilibrio(zona, rhoMasa);
    setMasaNonce((n) => n + 1);
    setResMasa(null);
    setCayendo(true);
    blip();
    const datos = { t: masaT, s: masaS, rho: rhoMasa, donde: eq.donde, prof: eq.prof, zona: zona.etq };
    despues(T_CAIDA_MASA, () => {
      setCayendo(false);
      setResMasa(datos);
      if (datos.donde === "flota" && datos.s < 5) setFlotoDulce(true);
      if (datos.prof > 1000) setHundioHondo(true);
      sfx(true);
    });
  };
  const soltarHielo = () => {
    setHieloNonce((n) => n + 1);
    setHieloListo(false);
    blip();
    despues(T_CAIDA_HIELO, () => {
      setHieloListo(true);
      setHieloVisto(true);
      if (sonido) audioRef.current?.gota();
    });
  };

  /* ── Ciclo ─────────────────────────────────────────────────────────── */
  const iActual = Math.min(viaje.puntos.length - 1, Math.round(progreso * (viaje.puntos.length - 1)));
  const pActual = viaje.puntos[iActual]!;
  const estadoAgua = estadoAguaParcela(pActual);
  const iCresta = viaje.puntos.reduce((mx, q, k) => (q.z > viaje.puntos[mx]!.z ? k : mx), 0);
  const llego = lanzada && !enViaje && progreso >= 1;
  const evaporacion = Math.min(100, (100 * presionVaporSat(t0) * (1 - hr0 / 100)) / 32);

  const cambiarT0 = (v: number) => {
    if (enViaje) return;
    setT0(v);
    setLanzada(false);
    setProgreso(0);
  };
  const cambiarHr = (v: number) => {
    if (enViaje) return;
    setHr0(v);
    setLanzada(false);
    setProgreso(0);
  };
  const soltarParcela = () => {
    if (enViaje) return;
    setLanzada(true);
    setEnViaje(true);
    setProgreso(0);
    blip();
    const v = viaje;
    let ticks = 0;
    cadaTanto(100, () => {
      ticks += 1;
      const p = (ticks * 0.1) / SEG_VIAJE;
      if (p >= 1) {
        setProgreso(1);
        setEnViaje(false);
        if (v.zNube !== null && v.lluviaTotal > 0) setConNube(v);
        else setSinNube(v);
        sfx(true);
        return true;
      }
      setProgreso(p);
      return false;
    });
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "atmosfera" && vuelo !== "subiendo") {
      setZKm(0.01);
      setLugarId("veracruz");
      setVuelo("suelo");
    }
    if (modo === "oceano" && !cayendo) {
      setProfCTD(0);
      setMasaNonce(0);
      setHieloNonce(0);
      setResMasa(null);
      setHieloListo(false);
    }
    if (modo === "ciclo" && !enViaje) {
      setLanzada(false);
      setProgreso(0);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { txt: string; done: boolean }[] = [
    { txt: "Predecir qué pasa con la temperatura en la estratósfera y subir a comprobarlo", done: subioEstratosfera },
    { txt: "Soltar el globo sonda y ver a qué altura revienta", done: globoReventado },
    { txt: "Comparar el punto de ebullición del agua en tres lugares en tierra firme", done: lugares.size >= 3 },
    { txt: "Bajar el CTD por debajo de una termoclina y de una haloclina", done: clinas.size === 2 },
    { txt: "Soltar un bloque de hielo y ver qué parte queda bajo el agua", done: hieloVisto },
    { txt: "Hacer flotar agua dulce y llevar una masa de agua a más de 1 000 m", done: flotoDulce && hundioHondo },
    { txt: "Formar una nube y lluvia en la ladera de barlovento", done: conNube !== null },
    { txt: "Cruzar la sierra con y sin nube y comparar el aire que llega a Perote", done: conNube !== null && sinNube !== null },
    { txt: "Clasificar tiempo o clima y ganar estrellas", done: clasifico },
    { txt: "Resolver el reto de densidad y presión (A2)", done: retoOk },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "atmosfera") {
    chipVivo =
      vuelo === "subiendo"
        ? `globo sonda · ${num(zKm, 1)} km · ⌀ ${num(diametroGlobo(zKm), 1)} m`
        : vuelo === "reventado"
          ? `¡reventó! · ${num(Z_RUPTURA, 1)} km · ${presionTxt(aire.pPa)}`
          : `${num(zKm, zKm < 10 ? 2 : 1)} km · ${capa.etq.toLowerCase()} · ${num(aire.tC, 1)} °C · ${presionTxt(aire.pPa)}`;
    pie =
      vuelo === "subiendo"
        ? `El globo sube a ${GLOBO.velocidad} m/s (llevamos ${num((zKm * 1000) / GLOBO.velocidad / 60)} min de vuelo). Afuera la presión baja a ${num((100 * aire.pPa) / AIRE_0.pPa, 1)} % de la del mar: el gas de adentro se expande y el globo crece.`
        : vuelo === "reventado"
          ? `A ${num(Z_RUPTURA, 1)} km el globo llegó a ${GLOBO.dRuptura} m de diámetro y el látex se rompió. La radiosonda baja en paracaídas con todas sus mediciones.`
          : lugarId
            ? `${LUGARES.find((l) => l.id === lugarId)!.nota}`
            : `${capa.clave} ${capa.temp}`;
  } else if (modo === "oceano") {
    chipVivo = `${zona.etq.toLowerCase()} · CTD ${num(profCTD)} m · ${num(ctd.t, 1)} °C · ${num(ctd.rho, 1)} kg/m³`;
    pie = cayendo ? "La masa de agua baja mientras sea más densa que el agua que la rodea…" : resMasa ? `${resMasa.donde === "flota" ? "Flotó: es menos densa que el agua de la superficie." : resMasa.donde === "fondo" ? "Llegó al fondo: es más densa que toda la columna." : `Se estacionó a ${num(resMasa.prof)} m, donde el agua del entorno tiene su misma densidad.`} ${zona.explica}` : zona.explica;
  } else {
    chipVivo = lanzada ? `parcela · ${num(pActual.z)} m · ${num(pActual.tC, 1)} °C · ${estadoAgua.etq.split(" (")[0]}` : `aire del Golfo · ${t0} °C · ${hr0} % de humedad`;
    pie = !lanzada
      ? `El Sol evapora el mar (líquido → gas). Con ${t0} °C y ${hr0} % de humedad, el punto de rocío es ${num(puntoRocio(t0, hr0), 1)} °C: la parcela tendrá que enfriarse ${num(t0 - puntoRocio(t0, hr0), 1)} °C para que su vapor se condense.`
      : pActual.nube
        ? `La parcela está saturada: su vapor se condensa en gotitas (gas → líquido) y libera calor latente, así que se enfría más despacio que el aire seco.`
        : iActual > iCresta
          ? `Baja hacia Perote: se comprime y se calienta ${num(GAMMA_SECO, 1)} °C por km. Como dejó su agua en la ladera, llega con menos vapor.`
          : `Sube por la ladera: se expande y se enfría ${num(GAMMA_SECO, 1)} °C por km sin que su vapor se condense todavía.`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, margin: "18px 0 8px" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, valor: string, col = "#fff") => <Dato label={etq} value={valor} col={col} />;
  const deslizador = (etq: string, icono: string, colR: string, min: number, max: number, step: number, valor: number, onChange: (v: number) => void, txt: string, disabled = false) => (
    <div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto", marginTop: 12 }}>
      <Deslizador label={etq} icon={icono} colr={colR} valor={txt} min={min} max={max} step={step} value={valor} onChange={onChange} />
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "atmosfera") {
    control = (
      <>
        {sub("1 · Predice: al pasar de la tropósfera a la estratósfera, la temperatura…")}
        <div className="ha-opts">
          {PREDICCIONES_T.map((p) => {
            const on = prediccion === p.id;
            const col = on ? (p.correcta ? OK : WARN) : prediccion && p.correcta ? OK : modoCol;
            return (
              <button key={p.id} className="ha-opt ha-pred" data-on={on || (!!prediccion && p.correcta)} disabled={!!prediccion} onClick={() => predecir(p.id)} style={{ ["--hac" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                {p.etq}
              </button>
            );
          })}
        </div>
        {!prediccion && nota("La sonda y el globo no pasan de 11 km hasta que hagas tu predicción.", T.text3, "fa-lock")}
        {prediccion && nota(`${predCorrecta ? "Bien predicho. " : "No es así. "}${subioEstratosfera ? EXPLICA_INVERSION : "Sube la sonda por encima de 25 km para comprobarlo en la curva de temperatura."}`, predCorrecta ? OK : WARN, predCorrecta ? "fa-circle-check" : "fa-circle-xmark")}

        {sub("2 · Mueve la sonda o salta a un lugar")}
        {deslizador("Altitud", "fa-arrows-up-down", modoCol, 0, Z_MAX_KM, 0.1, zKm, moverZ, `${num(zKm, zKm < 10 ? 2 : 1)} km`, vuelo === "subiendo")}
        <div className="ha-opts" style={{ marginTop: 10 }}>
          {LUGARES.map((l) => {
            const bloqueado = !prediccion && l.zKm > 11;
            const on = lugarId === l.id;
            return (
              <button key={l.id} className="ha-opt ha-lugar" data-on={on} disabled={bloqueado || vuelo === "subiendo"} onClick={() => irALugar(l.id)} style={{ ["--hac" as string]: accent, background: on ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                <i className={`fa-solid ${bloqueado ? "fa-lock" : l.icono}`} style={{ marginRight: 7 }} />
                {l.etq}
                {lugares.has(l.id) && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
              </button>
            );
          })}
        </div>
        <div className="ha-datos" style={{ marginTop: 12 }}>
          {dato("Capa", capa.etq, capa.color)}
          {dato("Temperatura", `${num(aire.tC, 1)} °C`, "#fb923c")}
          {dato("Presión", `${presionTxt(aire.pPa)} (${num((100 * aire.pPa) / AIRE_0.pPa, aire.pPa < 1000 ? 2 : 0)} %)`)}
          {dato("Densidad del aire", `${aire.rho >= 0.01 ? num(aire.rho, 3) : cientifico(aire.rho, 1)} kg/m³`)}
          {dato("El agua hierve a", eb === null ? "no hay líquido" : `${num(eb, 1)} °C`, "#7dd3fc")}
          {dato("O₂ por litro", `${cientifico(o2PorLitro(aire), 1)}`, "#f87171")}
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: capa.color }}>{capa.etq}.</strong> {capa.clave} {capa.temp}
          {eb === null && " Con menos de 0.61 kPa (punto triple del agua) el agua no puede estar líquida: el hielo pasa directo a vapor."}
        </div>

        {sub("3 · Globo sonda")}
        <button className="ha-toggle" onClick={soltarGlobo} disabled={vuelo === "subiendo" || !prediccion} style={{ ["--hac" as string]: "#fde68a" }}>
          <i className={`fa-solid ${vuelo === "subiendo" ? "fa-spinner fa-spin" : "fa-cloud-arrow-up"}`} style={{ marginRight: 9, color: "#fde68a" }} />
          {vuelo === "subiendo" ? `Subiendo… ${num(zKm, 1)} km · globo de ${num(diametroGlobo(zKm), 1)} m` : globoReventado ? "Soltar otro globo sonda" : "Soltar el globo sonda"}
        </button>
        {globoReventado &&
          nota(
            `El globo reventó a ${num(Z_RUPTURA, 1)} km, tras unos ${num((Z_RUPTURA * 1000) / GLOBO.velocidad / 60)} minutos de vuelo. Salió con ${GLOBO.d0} m de diámetro y llegó a ${GLOBO.dRuptura} m: el helio de adentro es el mismo, pero afuera la presión bajó a ${presionTxt(atmosfera(Z_RUPTURA).pPa)} (menos del 1 % de la del mar) y el gas se expandió unas ${num((GLOBO.dRuptura / GLOBO.d0) ** 3)} veces su volumen.`,
            OK,
            "fa-circle-check",
          )}

        {sub("Composición del aire seco (igual hasta ~100 km)")}
        <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.line}` }}>
          {COMPOSICION.map((c) => (
            <div key={c.formula} title={`${c.etq} ${c.pct} %`} style={{ width: `${Math.max(c.pct, 0.6)}%`, background: c.color }} />
          ))}
        </div>
        <div className="ha-opts" style={{ marginTop: 8 }}>
          {COMPOSICION.map((c) => (
            <span key={c.formula} style={{ fontSize: 14, color: T.text2, ...NUM }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: c.color, marginRight: 6 }} />
              {c.formula} {c.pct} %
            </span>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          El vapor de agua varía de casi 0 a ~4 % y vive sobre todo en la tropósfera. La proporción de los gases no cambia al subir; cambia cuántas moléculas caben en cada litro: aquí hay {num((100 * aire.rho) / AIRE_0.rho, aire.rho / AIRE_0.rho < 0.1 ? 2 : 0)} % de las del nivel del mar.
        </div>
      </>
    );
  } else if (modo === "oceano") {
    control = (
      <>
        <div className="ha-opts">
          {ZONAS.map((z) => (
            <button key={z.id} className="ha-opt ha-zona" data-on={z.id === zonaId} onClick={() => elegirZona(z.id)} style={{ ["--hac" as string]: modoCol, background: z.id === zonaId ? `${modoCol}1f` : "transparent" }}>
              {z.etq}
              {clinas.has(z.picnoclina.causa) && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>{zona.lugar}.</strong> {zona.explica}
        </div>

        {sub("1 · Baja el sensor CTD")}
        {deslizador("Profundidad", "fa-arrow-down", "#fbbf24", 0, PROF_MAX, 10, profCTD, moverCTD, `${num(profCTD)} m`)}
        <div className="ha-datos" style={{ marginTop: 12 }}>
          {dato("Temperatura", `${num(ctd.t, 1)} °C`, "#fb923c")}
          {dato("Salinidad", `${num(ctd.s, 2)} g/kg`, "#4ade80")}
          {dato("Densidad", `${num(ctd.rho, 2)} kg/m³`, "#fbbf24")}
        </div>
        {nota(`${tramoCTD}. En g/cm³ son ${num(ctd.rho / 1000, 4)}: apenas más que el agua dulce (≈ 1.0), pero esa pequeña diferencia acomoda todo el océano en capas.`, profCTD > zona.picnoclina.hasta ? OK : T.text2, "fa-layer-group")}
        <div style={{ marginTop: 10 }}>
          <GraficaDensidad zonaId={zonaId} prof={profCTD} col={modoCol} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 14, color: T.text3, fontWeight: 800 }}>CARA FRONTAL · TEMPERATURA</div>
            <div style={{ height: 8, borderRadius: 4, background: GRAD_T, marginTop: 4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.text3 }}>
              <span>−2 °C</span>
              <span>30 °C</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, color: T.text3, fontWeight: 800 }}>LATERAL · SALINIDAD</div>
            <div style={{ height: 8, borderRadius: 4, background: GRAD_S, marginTop: 4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.text3 }}>
              <span>31 g/kg</span>
              <span>36.5 g/kg</span>
            </div>
          </div>
        </div>

        {sub("2 · Suelta una masa de agua")}
        <div className="ha-opts">
          {MASAS.map((m) => {
            const on = masaT === m.t && masaS === m.s;
            return (
              <button key={m.id} className="ha-opt ha-masa" data-on={on} onClick={() => elegirMasa(m.id)} title={m.nota} style={{ ["--hac" as string]: accent, background: on ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                {m.etq}
              </button>
            );
          })}
        </div>
        {MASAS.find((m) => m.t === masaT && m.s === masaS) && <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{MASAS.find((m) => m.t === masaT && m.s === masaS)!.nota}</div>}
        {deslizador("Temperatura", "fa-temperature-half", "#fb923c", T_MASA.min, T_MASA.max, 0.1, masaT, setMasaT, `${num(masaT, 1)} °C`, cayendo)}
        {deslizador("Salinidad", "fa-droplet", "#4ade80", S_MASA.min, S_MASA.max, 0.1, masaS, setMasaS, `${num(masaS, 1)} g/kg`, cayendo)}
        <div style={{ fontSize: 14, color: T.text2, marginTop: 8, ...NUM }}>
          Densidad de tu masa de agua: <strong style={{ color: "#fff" }}>{num(rhoMasa, 2)} kg/m³</strong> · superficie de esta zona: {num(sup.rho, 2)} kg/m³
        </div>
        <div className="ha-opts" style={{ marginTop: 10 }}>
          <button className="ha-toggle" onClick={soltarMasa} disabled={cayendo} style={{ ["--hac" as string]: accent, width: "auto", flex: 1 }}>
            <i className={`fa-solid ${cayendo ? "fa-spinner fa-spin" : "fa-droplet"}`} style={{ marginRight: 9, color: accent }} />
            {cayendo ? "Buscando su capa…" : "Soltar la masa de agua"}
          </button>
          <button className="ha-toggle" onClick={soltarHielo} style={{ ["--hac" as string]: "#bae6fd", width: "auto", flex: 1 }}>
            <i className="fa-solid fa-cube" style={{ marginRight: 9, color: "#bae6fd" }} />
            Soltar un bloque de hielo
          </button>
        </div>
        {resMasa &&
          nota(
            resMasa.donde === "flota"
              ? `Flotó en ${resMasa.zona.toLowerCase()}: con ${num(resMasa.rho, 2)} kg/m³ es menos densa que el agua de la superficie (${num(sup.rho, 2)}). Así se extiende el agua de los ríos sobre el mar.`
              : resMasa.donde === "fondo"
                ? `Llegó al fondo: con ${num(resMasa.rho, 2)} kg/m³ es más densa que toda la columna de agua. El agua fría y salada que se forma junto al hielo polar llena así las profundidades del océano.`
                : `Se estacionó a ${num(resMasa.prof)} m: ahí el agua que la rodea tiene su misma densidad (${num(resMasa.rho, 2)} kg/m³). Más arriba el agua es más ligera; más abajo, más densa.`,
            OK,
            "fa-circle-check",
          )}
        {hieloListo &&
          nota(
            `El hielo (${RHO_HIELO} kg/m³ = 0.917 g/cm³) flota con el ${num(fraccionSumergida(sup.rho) * 100, 1)} % de su volumen bajo el agua: esa fracción es ρ hielo / ρ agua = ${RHO_HIELO} / ${num(sup.rho, 0)}. Por eso casi todo un iceberg está escondido.`,
            "#bae6fd",
            "fa-cube",
          )}

        {sub("Toda el agua de la Tierra en 1 000 litros")}
        <div style={{ display: "grid", gap: 6 }}>
          {AGUA_1000L.map((a) => (
            <div key={a.etq} style={{ display: "grid", gridTemplateColumns: "minmax(0,110px) minmax(0,1fr) 76px", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 14, color: T.text2 }}>{a.etq}</span>
              <div style={{ height: 9, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${Math.max(0.8, (Math.log10(a.litros * 1000 + 1) / Math.log10(965001)) * 100)}%`, height: "100%", background: a.color }} />
              </div>
              <span style={{ fontSize: 14, color: "#fff", fontWeight: 800, textAlign: "right", ...NUM }}>{a.litros >= 1 ? `${num(a.litros, a.litros < 100 ? 1 : 0)} L` : `${num(a.litros * 1000, a.litros < 0.1 ? 0 : 0)} mL`}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>Barras en escala logarítmica. Del agua dulce (≈ 2.5 %), cerca de 69 % es hielo y 30 % subterránea; ríos y lagos son una fracción mínima.</div>
      </>
    );
  } else {
    control = (
      <>
        {sub("1 · Ajusta el aire sobre el Golfo de México")}
        {deslizador("Temperatura", "fa-temperature-half", "#fb923c", T_PARCELA.min, T_PARCELA.max, 1, t0, cambiarT0, `${t0} °C`, enViaje)}
        {deslizador("Humedad rel.", "fa-droplet", "#7dd3fc", HR_PARCELA.min, HR_PARCELA.max, 5, hr0, cambiarHr, `${hr0} %`, enViaje)}
        <div className="ha-datos" style={{ marginTop: 12 }}>
          {dato("Punto de rocío", `${num(viaje.rocio0, 1)} °C`, "#7dd3fc")}
          {dato("Vapor de agua", `${num(viaje.r0, 1)} g/kg`)}
          {dato("Evaporación", `${num(evaporacion)} %`, "#67e8f9")}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Evaporar 1 kg de agua a {t0} °C cuesta {num(calorLatente(t0) / 1e6, 2)} MJ de energía del Sol. La evaporación crece con la temperatura y se detiene cuando el aire está saturado (100 %).
        </div>
        {sub("2 · Suelta la parcela de aire")}
        <button className="ha-toggle" onClick={soltarParcela} disabled={enViaje} style={{ ["--hac" as string]: modoCol }}>
          <i className={`fa-solid ${enViaje ? "fa-spinner fa-spin" : "fa-wind"}`} style={{ marginRight: 9, color: modoCol }} />
          {enViaje ? `Viajando… ${num(pActual.z)} m · ${num(pActual.tC, 1)} °C` : llego ? "Soltar otra parcela" : "Soltar la parcela hacia la sierra"}
        </button>
        {lanzada && (
          <div className="ha-datos" style={{ marginTop: 12 }}>
            {dato("Altitud", `${num(pActual.z)} m`)}
            {dato("Temperatura", `${num(pActual.tC, 1)} °C`, "#fb923c")}
            {dato("El agua está como", estadoAgua.etq.split(" (")[0]!, "#e2e8f0")}
          </div>
        )}
        <div style={{ marginTop: 10 }}>
          <GraficaParcela viaje={viaje} progreso={progreso} lanzada={lanzada} col={modoCol} />
        </div>
        {llego &&
          nota(
            viaje.zNube !== null && viaje.lluviaTotal > 0 ? (
              <>
                Al subir se enfrió hasta su punto de rocío a <strong>{num(viaje.zNube)} m</strong>: ahí nació la nube. Llovieron {num(viaje.lluviaTotal, 1)} g de agua por kg de aire, que liberaron {num(viaje.calorKJ, 1)} kJ/kg de calor latente. Llega a Perote a{" "}
                <strong>{num(viaje.tFinal, 1)} °C</strong> con {num(viaje.puntos[viaje.puntos.length - 1]!.r, 1)} g/kg de vapor; sin condensación habría llegado a {num(viaje.tFinalSeco, 1)} °C. Son {num(viaje.tFinal - viaje.tFinalSeco, 1)} °C más: el calor que el Sol usó para evaporar el mar se devolvió en la nube.
              </>
            ) : (
              <>
                El aire estaba tan seco que nunca llegó a su punto de rocío ({num(viaje.rocio0, 1)} °C): no hubo nube ni lluvia. Llega a Perote a <strong>{num(viaje.tFinal, 1)} °C</strong>, justo lo que predice el enfriamiento seco ({num(viaje.tFinalSeco, 1)} °C): sin condensación no hay calor latente.
              </>
            ),
            viaje.zNube !== null ? OK : "#fbbf24",
            viaje.zNube !== null ? "fa-cloud-rain" : "fa-sun",
          )}
        {conNube && sinNube && (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table className="ha-tabla">
              <thead>
                <tr>
                  <th />
                  <th>Con nube</th>
                  <th>Sin nube</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Aire en el Golfo</td>
                  <td>
                    {conNube.t0} °C · {conNube.hr0} %
                  </td>
                  <td>
                    {sinNube.t0} °C · {sinNube.hr0} %
                  </td>
                </tr>
                <tr>
                  <td>Lluvia en la ladera</td>
                  <td>{num(conNube.lluviaTotal, 1)} g/kg</td>
                  <td>0 g/kg</td>
                </tr>
                <tr>
                  <td>Llega a Perote</td>
                  <td>{num(conNube.tFinal, 1)} °C</td>
                  <td>{num(sinNube.tFinal, 1)} °C</td>
                </tr>
                <tr>
                  <td>Calentamiento extra por calor latente</td>
                  <td>+{num(conNube.tFinal - conNube.tFinalSeco, 1)} °C</td>
                  <td>+{num(sinNube.tFinal - sinNube.tFinalSeco, 1)} °C</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {nota(CONTRASTE_SIERRA, T.text3, "fa-map-location-dot")}
        {!conNube && !sinNube && nota("Pista: con aire cálido y húmedo se forma nube pronto; con humedad de 20 % y mucho calor, la parcela cruza la sierra sin condensarse.", T.text3, "fa-lightbulb")}
      </>
    );
  }

  const estiloCSS = `
        .ha-opts { display:flex; flex-wrap:wrap; gap:8px; }
        .ha-opt { cursor:pointer; border:1px solid var(--hac); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .ha-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .ha-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ha-opt:disabled { cursor:default; }
        .ha-opt:disabled[data-on="false"] { opacity:0.55; }
        .ha-toggle { width:100%; cursor:pointer; border:1px solid var(--hac); border-radius:11px; padding:12px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
        .ha-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ha-toggle:disabled { cursor:default; opacity:0.75; }
        .ha-datos { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:8px; }
        .ha-tabla { width:100%; border-collapse:collapse; font-size:14px; }
        .ha-tabla th { text-align:left; font-size:14px; color:${T.text3}; padding:6px 8px; border-bottom:1px solid ${T.line}; }
        .ha-tabla td { padding:7px 8px; border-bottom:1px solid ${T.line}; color:#fff; font-weight:700; font-variant-numeric: tabular-nums; }
        .ha-tabla td:first-child { color:${T.text2}; font-weight:600; }
        .ha-glosario { display:grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px),1fr)); gap:8px; }
        .ha-opt:focus-visible, .ha-toggle:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  `;

  const sceneEl = (
    <SceneBoundary fallback={sceneFallback}>
      <HidrosferaScene
        vista={modo}
        modoColor={modoCol}
        resetNonce={resetNonce}
        zKm={zKm}
        vuelo={vuelo}
        zonaId={zonaId}
        profCTD={profCTD}
        masaT={masaT}
        masaS={masaS}
        masaNonce={masaNonce}
        hieloNonce={hieloNonce}
        t0={t0}
        hr0={hr0}
        viaje={viaje}
        progreso={progreso}
        lanzada={lanzada}
      />
    </SceneBoundary>
  );

  const parrafo = (txt: ReactNode) => <p style={{ margin: 0, color: T.text2, lineHeight: 1.55 }}>{txt}</p>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={sceneEl}
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={chipVivo}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{estiloCSS}</style>
              <Bloque titulo={def.etq} icono={def.icono}>
                {control}
              </Bloque>
              <Bloque titulo="Qué está pasando" icono="fa-eye">
                {parrafo(pie)}
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
              <TiempoClimaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={retoOk} onAprobado={() => setRetoOk(true)} playSfx={sfx} />
              <div style={{ ...card, padding: "16px", marginTop: 22 }}>
                <Eyebrow>
                  <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                  Completa el texto (A6)
                </Eyebrow>
                <div style={{ marginTop: 12 }}>
                  <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
                </div>
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
              <Bloque titulo="¿Por qué el aire y el agua se acomodan en capas?" icono="fa-earth-americas">
                {parrafo(PROBLEMA)}
              </Bloque>
              <Bloque titulo={`Lectura A1 · ${TITULO_A1}`} icono="fa-book-open">
                {LECTURA_A1.map((p, i) => (
                  <div key={i}>{parrafo(p)}</div>
                ))}
                <strong style={{ color: T.text3, fontSize: 14 }}>Para reflexionar</strong>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </Bloque>
              <Bloque titulo="En tu localidad (reflexión A3)" icono="fa-location-dot">
                {parrafo(REFLEXION_A3)}
              </Bloque>
              <Bloque titulo="Hechos (verdadero o falso, A4)" icono="fa-circle-question">
                <div style={{ display: "grid", gap: 8 }}>
                  {HECHOS.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ flexShrink: 0, marginTop: 2, fontSize: 14, fontWeight: 900, padding: "1px 8px", borderRadius: 6, color: "#04121f", background: h.verdadero ? OK : WARN }}>{h.verdadero ? "V" : "F"}</span>
                      <span style={{ color: T.text2, lineHeight: 1.45 }}>
                        <span style={{ color: "#fff" }}>«{h.enunciado}»</span> {h.retro}
                      </span>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                <div className="ha-glosario">
                  {GLOSARIO.map((gi, i) => (
                    <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                      <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                      <span style={{ color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                      <div style={{ color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                        <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
                        {gi.ejemplo}
                      </div>
                    </div>
                  ))}
                </div>
                {parrafo(<><strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}</>)}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 9, color: T.text2 }}>
                  {IDEAS.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={HIDROSFERA_ATMOSFERA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La lectura A1 con sus preguntas, la reflexión A3, los hechos A4, el glosario A5, el ejercicio A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma. La columna de aire
                usa la <strong>Atmósfera Estándar de EUA (1976)</strong>, un promedio global: da 0 °C a 2 240 m, aunque la Ciudad de México promedia unos 16 °C; las fronteras de las capas varían con la
                latitud y la estación. La ebullición se calcula con la ecuación de Antoine y el globo como gas ideal con valores típicos de radiosondeo. La densidad del agua de mar usa la ecuación de estado
                UNESCO 1981 sin el efecto de la presión; los perfiles de las tres zonas son <strong>típicos e ilustrativos</strong>. La parcela de aire es un <strong>modelo simplificado</strong> (toda el
                agua condensada cae como lluvia; terreno y distancias esquemáticos). La distribución del agua es del USGS. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
