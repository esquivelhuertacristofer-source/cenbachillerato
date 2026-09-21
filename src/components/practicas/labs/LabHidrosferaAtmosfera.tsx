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
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el aire y el agua del planeta en 3D…</span>
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
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Tiempo atmosférico o clima?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
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
          {aviso && <div style={{ marginTop: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
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
          <text x={x(r)} y={H - 8} fill="rgba(255,255,255,0.55)" fontSize={9} textAnchor="middle">
            {r}
          </text>
        </g>
      ))}
      {[0, 250, 1000, 4000].map((d) => (
        <text key={d} x={32} y={y(d) + 3} fill="rgba(255,255,255,0.55)" fontSize={9} textAnchor="end">
          {d} m
        </text>
      ))}
      <polyline points={pts} fill="none" stroke={col} strokeWidth={2.4} />
      <circle cx={x(actual.rho)} cy={y(prof)} r={4.5} fill="#fbbf24" stroke="#04121f" strokeWidth={1.5} />
      <text x={W - 12} y={24} fill="rgba(255,255,255,0.7)" fontSize={9.5} textAnchor="end" fontWeight={700}>
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
          <text x={x(t)} y={H - 10} fill="rgba(255,255,255,0.55)" fontSize={9} textAnchor="middle">
            {t} °C
          </text>
        </g>
      ))}
      {[0, 1000, 2000, 3000].map((z) => (
        <text key={z} x={26} y={y(z) + 3} fill="rgba(255,255,255,0.55)" fontSize={9} textAnchor="end">
          {z / 1000} km
        </text>
      ))}
      {/* Referencia: subir y bajar sin condensar (adiabática seca) */}
      <polyline points={`${x(viaje.t0)},${y(0)} ${x(viaje.t0 - GAMMA_SECO * 3)},${y(3000)}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} strokeDasharray="4 3" />
      {viaje.zNube !== null && <line x1={30} x2={W - 12} y1={y(viaje.zNube)} y2={y(viaje.zNube)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />}
      <polyline points={recorrido} fill="none" stroke={col} strokeWidth={2.6} />
      <circle cx={x(actual.tC)} cy={y(actual.z)} r={4.5} fill="#fff" stroke="#04121f" strokeWidth={1.5} />
      <text x={W - 12} y={20} fill="rgba(255,255,255,0.6)" fontSize={9} textAnchor="end">
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
  const [drawer, setDrawer] = useState(false);
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
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Predecir qué pasa con la temperatura en la estratósfera y subir a comprobarlo", done: subioEstratosfera },
    { t: "Soltar el globo sonda y ver a qué altura revienta", done: globoReventado },
    { t: "Comparar el punto de ebullición del agua en tres lugares en tierra firme", done: lugares.size >= 3 },
    { t: "Bajar el CTD por debajo de una termoclina y de una haloclina", done: clinas.size === 2 },
    { t: "Soltar un bloque de hielo y ver qué parte queda bajo el agua", done: hieloVisto },
    { t: "Hacer flotar agua dulce y llevar una masa de agua a más de 1 000 m", done: flotoDulce && hundioHondo },
    { t: "Formar una nube y lluvia en la ladera de barlovento", done: conNube !== null },
    { t: "Cruzar la sierra con y sin nube y comparar el aire que llega a Perote", done: conNube !== null && sinNube !== null },
    { t: "Clasificar tiempo o clima y ganar estrellas", done: clasifico },
    { t: "Resolver el reto de densidad y presión (A2)", done: retoOk },
    { t: "Completar el texto (A6)", done: textoOk },
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
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, valor: string, col = "#fff") => (
    <div className="ha-dato">
      <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.07em", color: T.text3, textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );
  const deslizador = (etq: string, icono: string, colR: string, min: number, max: number, step: number, valor: number, onChange: (v: number) => void, txt: string, disabled = false) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, opacity: disabled ? 0.5 : 1 }}>
      <i className={`fa-solid ${icono}`} style={{ color: colR, width: 16, textAlign: "center" }} />
      <span style={{ fontSize: 11.5, color: T.text2, width: 92, flexShrink: 0 }}>{etq}</span>
      <input type="range" aria-label={etq} className="ha-range" min={min} max={max} step={step} value={valor} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} style={{ ["--hac" as string]: colR }} />
      <span style={{ width: 74, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>{txt}</span>
    </label>
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
        <div style={{ marginTop: 10, fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
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
            <span key={c.formula} style={{ fontSize: 11.5, color: T.text2, ...NUM }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: c.color, marginRight: 6 }} />
              {c.formula} {c.pct} %
            </span>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
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
        <div style={{ marginTop: 8, fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
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
            <div style={{ fontSize: 10, color: T.text3, fontWeight: 800 }}>CARA FRONTAL · TEMPERATURA</div>
            <div style={{ height: 8, borderRadius: 4, background: GRAD_T, marginTop: 4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.text3 }}>
              <span>−2 °C</span>
              <span>30 °C</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.text3, fontWeight: 800 }}>LATERAL · SALINIDAD</div>
            <div style={{ height: 8, borderRadius: 4, background: GRAD_S, marginTop: 4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.text3 }}>
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
        {MASAS.find((m) => m.t === masaT && m.s === masaS) && <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{MASAS.find((m) => m.t === masaT && m.s === masaS)!.nota}</div>}
        {deslizador("Temperatura", "fa-temperature-half", "#fb923c", T_MASA.min, T_MASA.max, 0.1, masaT, setMasaT, `${num(masaT, 1)} °C`, cayendo)}
        {deslizador("Salinidad", "fa-droplet", "#4ade80", S_MASA.min, S_MASA.max, 0.1, masaS, setMasaS, `${num(masaS, 1)} g/kg`, cayendo)}
        <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
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
            <div key={a.etq} style={{ display: "grid", gridTemplateColumns: "150px 1fr 64px", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: T.text2 }}>{a.etq}</span>
              <div style={{ height: 9, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${Math.max(0.8, (Math.log10(a.litros * 1000 + 1) / Math.log10(965001)) * 100)}%`, height: "100%", background: a.color }} />
              </div>
              <span style={{ fontSize: 11.5, color: "#fff", fontWeight: 800, textAlign: "right", ...NUM }}>{a.litros >= 1 ? `${num(a.litros, a.litros < 100 ? 1 : 0)} L` : `${num(a.litros * 1000, a.litros < 0.1 ? 0 : 0)} mL`}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Barras en escala logarítmica. Del agua dulce (≈ 2.5 %), cerca de 69 % es hielo y 30 % subterránea; ríos y lagos son una fracción mínima.</div>
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
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes haPulse { 0%,100%{ box-shadow:0 0 0 0 var(--had); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ha-live-dot { animation: haPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .ha-live-dot { animation:none; } }
        .ha-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ha-grid { grid-template-columns: 1fr; } }
        .ha-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ha-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ha-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ha-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ha-tab { cursor:pointer; border:1px solid var(--hac); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .ha-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ha-tab:hover { background:rgba(255,255,255,0.06); }
        .ha-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .ha-opt { cursor:pointer; border:1px solid var(--hac); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .ha-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .ha-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ha-opt:disabled { cursor:default; }
        .ha-opt:disabled[data-on="false"] { opacity:0.55; }
        .ha-toggle { width:100%; cursor:pointer; border:1px solid var(--hac); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ha-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ha-toggle:disabled { cursor:default; opacity:0.75; }
        .ha-range { flex:1; min-width:0; accent-color: var(--hac); }
        .ha-datos { display:grid; grid-template-columns: repeat(auto-fit, minmax(118px,1fr)); gap:7px; }
        .ha-dato { padding:9px 11px; border-radius:10px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; min-width:0; }
        .ha-tabla { width:100%; border-collapse:collapse; font-size:12px; }
        .ha-tabla th { text-align:left; font-size:10px; letter-spacing:.06em; color:${T.text3}; text-transform:uppercase; padding:6px 8px; border-bottom:1px solid ${T.line}; }
        .ha-tabla td { padding:7px 8px; border-bottom:1px solid ${T.line}; color:#fff; font-weight:700; font-variant-numeric: tabular-nums; }
        .ha-tabla td:first-child { color:${T.text2}; font-weight:600; }
        .ha-opt:focus-visible, .ha-tab:focus-visible, .ha-toggle:focus-visible, .ha-icobtn:focus-visible, .ha-range:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .ha-bottom { grid-template-columns: 1fr !important; } }
        .ha-glosario { display:grid; grid-template-columns: repeat(auto-fit, minmax(230px,1fr)); gap:8px; }
        .ha-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ha-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ha-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .ha-drawer[data-open="true"] { transform:translateX(0); }
        .ha-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ha-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ha-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ha-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ha-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ha-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ha-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ha-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--hac" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ha-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 62vh, 700px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
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

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="ha-live-dot" style={{ ["--had" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ha-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ha-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ha-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>{pie}</div>
            </div>

            <button className="ha-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 4 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-earth-americas" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Por qué el aire y el agua se acomodan en capas?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 10 }}>{TITULO_A1}</div>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Cómo usar el laboratorio
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

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Eyebrow>
                <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
                Objetivos de la sesión
              </Eyebrow>
              <span style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ha-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />
              En tu localidad (reflexión A3)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{REFLEXION_A3}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (verdadero o falso, A4)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, marginTop: 1, fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 6, color: "#04121f", background: h.verdadero ? OK : WARN }}>{h.verdadero ? "V" : "F"}</span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                    <span style={{ color: "#fff" }}>«{h.enunciado}»</span> {h.retro}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5)
            </Eyebrow>
            <div className="ha-glosario">
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
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
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas, la reflexión A3, los hechos A4, el glosario A5, el ejercicio A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma. La columna de aire
          usa la <strong>Atmósfera Estándar de EUA (1976)</strong>, un promedio global: da 0 °C a 2 240 m, aunque la Ciudad de México promedia unos 16 °C; las fronteras de las capas varían con la
          latitud y la estación. La ebullición se calcula con la ecuación de Antoine y el globo como gas ideal con valores típicos de radiosondeo. La densidad del agua de mar usa la ecuación de estado
          UNESCO 1981 sin el efecto de la presión; los perfiles de las tres zonas son <strong>típicos e ilustrativos</strong>. La parcela de aire es un <strong>modelo simplificado</strong> (toda el
          agua condensada cae como lluvia; terreno y distancias esquemáticos). La distribución del agua es del USGS. Fuente: {FUENTE}
        </span>
      </div>

      <TiempoClimaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={retoOk} onAprobado={() => setRetoOk(true)} playSfx={sfx} />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="ha-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ha-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ha-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ha-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ha-drawer-body">
          <FichaTeorica data={HIDROSFERA_ATMOSFERA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
