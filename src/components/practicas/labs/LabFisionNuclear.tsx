"use client";

/**
 * Laboratorio 3D — "Energía nuclear: fisión y ética".
 * Práctica anclada a CNEYT-V-P08-A2 (quiz «¿Cuánto sabes sobre la ética del
 * desarrollo tecnológico?») y CNEYT-V-P08-A6 (completa el texto); progresión 9
 * de la UAC CNEYT-V. El marco teórico es la lectura A1, los hechos salen del
 * quiz A4, el glosario del A5 y el debate de A3, A5, A7 y A9.
 *
 * Progresión de ÉTICA: lo manipulable es la física; el debate se conserva
 * verbatim. Cuatro modos:
 *  (1) Reacción en cadena — barras, vapor, enriquecimiento y tipo de reactor;
 *      k < 1, k = 1, k > 1, SCRAM y calor residual con las bombas apagadas.
 *  (2) E = mc² — una fisión con su defecto de masa y la comparación de
 *      combustible nuclear frente a carbón.
 *  (3) Residuos y tiempo — ocho isótopos que decaen en una línea del tiempo
 *      logarítmica frente a la historia humana.
 *  (4) Ondas y sociedad — cobertura rural, exposición junto a una antena y
 *      ubicación de un celular con tres antenas.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FISION_NUCLEAR_FICHA } from "./fision-nuclear-ficha";
import type { SubEnergia } from "./FisionNuclearScene";
import {
  type Modo,
  type TipoReactor,
  type Enriquecimiento,
  type SimReactor,
  type DemandaId,
  type IsotopoId,
  type SubTelecom,
  type BandaId,
  type TorreId,
  MODOS,
  MODOS_DEF,
  TIPOS_REACTOR,
  ENRIQUECIMIENTOS,
  kEff,
  regimen,
  REGIMEN_DEF,
  simInicial,
  pasoReactor,
  calorResidual,
  formatoDuracion,
  SCRAM_UMBRAL,
  P_TERMICA_MW,
  P_ELECTRICA_MW,
  BETA_U235,
  L_VAPOR,
  REACCION,
  MASAS,
  MASA_ANTES,
  MASA_DESPUES,
  DEFECTO_U,
  E_FISION_MEV,
  E_FISION_TOTAL_MEV,
  TOL_E_MEV,
  U_MEV,
  E_UN_GRAMO_J,
  E_COMBUSTION_EV,
  KT_TNT_J,
  HIROSHIMA_KT,
  DEMANDAS,
  comparar,
  OPCIONES_RAZON,
  razonCorrecta,
  CO2_CARBON,
  CO2_NUCLEAR,
  ISOTOPOS,
  fraccionRestante,
  LOG_T_MIN,
  LOG_T_MAX,
  ANIOS_GENERACION,
  formatoAnios,
  hitoHumano,
  RETO_PU_ANIOS,
  TOL_PU_ANIOS,
  SUBS_TELECOM,
  BANDAS_TEL,
  alcanceKm,
  TORRES,
  LOCALIDADES,
  cubiertas,
  densidadPotencia,
  distanciaLimite,
  D_MIN_M,
  D_MAX_M,
  H_PLANCK_EV,
  E_IONIZACION_AGUA_EV,
  ANTENAS_RASTREO,
  INCERTIDUMBRE_KM,
  posicionCelular,
  ENDUTIH_2024,
  ENUNCIADOS,
  rondaEnunciados,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  NOTAS_ACTUALIZACION,
  PREGUNTAS,
  TITULO_A3,
  DEBATE_A3,
  PISTAS_A3,
  REFLEXION_A7,
  PREGUNTA_A9,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
  num,
  cient,
} from "./fision-nuclear-data";

const FisionScene = dynamic(() => import("./FisionNuclearScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el reactor en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-fision-nuclear-reto";
const WARN = "#FF8A3C";
const NO = "#f87171";
const TICK_MS = 100;
const RONDA_INICIAL = rondaEnunciados(mulberry32(23));

/* ── Estado del reactor con los logros que se ganan dentro de la simulación ── */
interface EstadoReactor {
  sim: SimReactor;
  vioSub: boolean;
  vioCrit: boolean;
  vioSuper: boolean;
  freno: boolean;
  descubierto: boolean;
}
interface CtrlReactor {
  tipo: TipoReactor;
  enr: Enriquecimiento;
  vacios: number;
  barras: number;
  bombas: boolean;
}

function avanzarReactor(e: EstadoReactor, c: CtrlReactor, dt: number): EstadoReactor {
  const antes = e.sim;
  const n = pasoReactor(antes, c, dt);
  const k = kEff(c.tipo, c.enr, c.vacios, Math.max(c.barras, n.barrasScram));
  const sim = { ...n, historial: [...antes.historial.slice(1), n.p] };
  return {
    sim,
    vioSub: e.vioSub || (!n.scram && k < 0.99 && n.p < 0.1),
    vioCrit: e.vioCrit || n.tCritico >= 3,
    vioSuper: e.vioSuper || (!antes.scram && n.scram && n.motivo === "sobrepotencia"),
    freno: e.freno || (!n.scram && c.tipo === "bwr" && c.barras <= 0.05 && (c.enr === "natural" || c.vacios >= 0.9) && k < 1),
    descubierto: e.descubierto || n.agua <= 0,
  };
}

/* ── Gráfica de la potencia ───────────────────────────────────────────── */
function GraficaPotencia({ datos, col }: { datos: number[]; col: string }) {
  const W = 300;
  const H = 86;
  const maxP = 1.5;
  const y = (p: number) => H - (Math.min(p, maxP) / maxP) * (H - 6) - 3;
  const pts = datos.map((p, i) => `${((i / (datos.length - 1)) * W).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 86, display: "block", borderRadius: 10, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }} role="img" aria-label="Potencia de fisión en los últimos 6 segundos">
      <line x1={0} x2={W} y1={y(1)} y2={y(1)} stroke="rgba(255,255,255,0.28)" strokeDasharray="4 4" />
      <line x1={0} x2={W} y1={y(SCRAM_UMBRAL)} y2={y(SCRAM_UMBRAL)} stroke={NO} strokeOpacity={0.6} strokeDasharray="2 3" />
      <text x={4} y={y(1) - 3} fill="rgba(255,255,255,0.55)" fontSize={9} fontWeight={700}>
        100 %
      </text>
      <text x={4} y={y(SCRAM_UMBRAL) - 3} fill={NO} fontSize={9} fontWeight={700}>
        120 % · SCRAM
      </text>
      <polyline points={pts} fill="none" stroke={col} strokeWidth={2.2} strokeLinejoin="round" />
    </svg>
  );
}

/* ── Tarjeta de estrellas: ¿ciencia o ética? ──────────────────────────── */
function CienciaEticaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ENUNCIADOS[ronda[pos] ?? 0]!;

  const responder = (etica: boolean) => {
    if (resuelto !== null) return;
    const ok = etica === actual.etica;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${actual.etica ? "Es una pregunta ética" : "Es una pregunta científica"}: ${actual.porque}`);
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
          ¿Ciencia o ética?
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
            Pregunta {pos + 1} de {ronda.length} · ¿se responde midiendo o deliberando?
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="fn-opt fn-clasif" data-on="true" onClick={() => responder(false)} style={{ ["--fnc" as string]: "#38bdf8" }}>
              <i className="fa-solid fa-flask" style={{ marginRight: 8 }} />
              Científica: se mide o se calcula
            </button>
            <button className="fn-opt fn-clasif" data-on="true" onClick={() => responder(true)} style={{ ["--fnc" as string]: "#c084fc" }}>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8 }} />
              Ética: se delibera con valores
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

/** Convierte "72 330" o "72,330" en número. */
function leerNumero(s: string): number {
  return Number(s.replace(/[\s,]/g, "").replace(/−/g, "-"));
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabFisionNuclear({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("reactor");

  // ── Reactor
  const [tipo, setTipo] = useState<TipoReactor>("bwr");
  const [enr, setEnr] = useState<Enriquecimiento>("leu");
  const [vacios, setVacios] = useState(30);
  const [barras, setBarras] = useState(25);
  const [bombas, setBombas] = useState(true);
  const [reactor, setReactor] = useState<EstadoReactor>(() => ({ sim: simInicial(), vioSub: false, vioCrit: false, vioSuper: false, freno: false, descubierto: false }));

  // ── Energía
  const [subEnergia, setSubEnergia] = useState<SubEnergia>("fision");
  const [disparo, setDisparo] = useState(0);
  const [eTexto, setETexto] = useState("");
  const [eIntento, setEIntento] = useState<number | null>(null);
  const [eOk, setEOk] = useState(false);
  const [demanda, setDemanda] = useState<DemandaId>("casa");
  const [prediccion, setPrediccion] = useState<number | null>(null);
  const [prediccionOk, setPrediccionOk] = useState(false);

  // ── Residuos
  const [logT, setLogT] = useState(LOG_T_MIN);
  const [isotopo, setIsotopo] = useState<IsotopoId>("pu239");
  const [puTexto, setPuTexto] = useState("");
  const [puIntento, setPuIntento] = useState<number | null>(null);
  const [puOk, setPuOk] = useState(false);
  const [puLlego, setPuLlego] = useState(false);

  // ── Telecom
  const [subTelecom, setSubTelecom] = useState<SubTelecom>("cobertura");
  const [banda, setBanda] = useState<BandaId>("b3500");
  const [torres, setTorres] = useState<TorreId[]>(["ciudad"]);
  const [conecto, setConecto] = useState(false);
  const [distanciaLog, setDistanciaLog] = useState(Math.log10(50));
  const [vioExcede, setVioExcede] = useState(false);
  const [vioCumple, setVioCumple] = useState(false);
  const [antenas, setAntenas] = useState<number[]>([]);
  const [telefono, setTelefono] = useState({ x: 0.9, z: 0.4 });
  const [ubico, setUbico] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
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
    const sfxObj = audioRef.current;
    if (sonido) {
      sfxObj.mute();
      setSonido(false);
    } else {
      await sfxObj.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  // Simulación del reactor: corre solo en su modo.
  useEffect(() => {
    if (modo !== "reactor") return;
    const ctrl: CtrlReactor = { tipo, enr, vacios: vacios / 100, barras: barras / 100, bombas };
    // El paso usa el tiempo real transcurrido: si el navegador se atrasa, la simulación no se frena.
    let previo = performance.now();
    const id = window.setInterval(() => {
      const ahora = performance.now();
      const dt = Math.min(0.25, Math.max(0, (ahora - previo) / 1000));
      previo = ahora;
      setReactor((e) => avanzarReactor(e, ctrl, dt));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [modo, tipo, enr, vacios, barras, bombas]);

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

  /* ── Reactor ───────────────────────────────────────────────────────── */
  const sim = reactor.sim;
  const barrasEf = Math.max(barras / 100, sim.barrasScram);
  const k = kEff(tipo, enr, vacios / 100, barrasEf);
  const reg = regimen(k);
  const tipoDef = TIPOS_REACTOR.find((t) => t.id === tipo)!;
  const calorFrac = sim.scram ? calorResidual(sim.tApagado) : 0;
  const calorMW = calorFrac * P_TERMICA_MW;
  const evapTh = (calorMW * 1e6 * 3600) / L_VAPOR / 1000;
  const ebullicion = !sim.scram ? (tipo === "bwr" ? (vacios / 100) * Math.min(1.2, sim.p) * 1.4 : 0.15 * Math.min(1, sim.p)) : !bombas ? Math.min(1, calorFrac * 40) : 0;
  const scramManual = () => {
    if (sim.scram) return;
    setReactor((e) => ({ ...e, sim: { ...e.sim, scram: true, motivo: "manual" } }));
    if (sonido) audioRef.current?.romper();
  };
  const reiniciarReactor = () => {
    setReactor((e) => ({ ...e, sim: simInicial() }));
    setBombas(true);
    blip();
  };

  /* ── Energía ───────────────────────────────────────────────────────── */
  const cmp = comparar(DEMANDAS.find((d) => d.id === demanda)!.kwh);
  const razonOk = razonCorrecta();
  const comprobarE = () => {
    const v = leerNumero(eTexto);
    if (!Number.isFinite(v)) return;
    setEIntento(v);
    const ok = Math.abs(v - E_FISION_MEV) <= TOL_E_MEV;
    sfx(ok);
    if (ok) setEOk(true);
  };
  const predecir = (v: number) => {
    if (prediccion !== null) return;
    setPrediccion(v);
    const ok = v === razonOk;
    sfx(ok);
    if (ok) setPrediccionOk(true);
  };

  /* ── Residuos ──────────────────────────────────────────────────────── */
  const tAnios = Math.pow(10, logT);
  const isoDef = ISOTOPOS.find((i) => i.id === isotopo)!;
  const fracSel = fraccionRestante(tAnios, isoDef.t12);
  const moverTiempo = (v: number) => {
    setLogT(v);
    if (puOk && Math.pow(10, v) >= RETO_PU_ANIOS * 0.97) setPuLlego(true);
  };
  const comprobarPu = () => {
    const v = leerNumero(puTexto);
    if (!Number.isFinite(v)) return;
    setPuIntento(v);
    const ok = Math.abs(v - RETO_PU_ANIOS) <= TOL_PU_ANIOS;
    sfx(ok);
    if (ok) {
      setPuOk(true);
      if (tAnios >= RETO_PU_ANIOS * 0.97) setPuLlego(true);
    }
  };

  /* ── Telecom ───────────────────────────────────────────────────────── */
  const bandaDef = BANDAS_TEL.find((b) => b.id === banda)!;
  const cub = cubiertas(bandaDef.mhz, torres);
  const pueblos = LOCALIDADES.filter((l) => !l.ciudad);
  const pueblosCub = pueblos.filter((l) => cub.has(l.id));
  const habCub = LOCALIDADES.filter((l) => cub.has(l.id)).reduce((a, l) => a + l.habitantes, 0);
  const habTot = LOCALIDADES.reduce((a, l) => a + l.habitantes, 0);
  const actualizaCobertura = (b: BandaId, ts: TorreId[]) => {
    const c = cubiertas(BANDAS_TEL.find((x) => x.id === b)!.mhz, ts);
    if (pueblos.every((l) => c.has(l.id))) {
      if (!conecto) sfx(true);
      setConecto(true);
    }
  };
  const elegirBanda = (b: BandaId) => {
    setBanda(b);
    blip();
    actualizaCobertura(b, torres);
    const dM = Math.pow(10, distanciaLog);
    const lim = BANDAS_TEL.find((x) => x.id === b)!.limite;
    if (densidadPotencia(dM) > lim) setVioExcede(true);
    else if (vioExcede) setVioCumple(true);
  };
  const alternarTorre = (id: TorreId) => {
    const ts = torres.includes(id) ? torres.filter((t) => t !== id) : [...torres, id];
    setTorres(ts);
    blip();
    actualizaCobertura(banda, ts);
  };
  const distanciaM = Math.pow(10, distanciaLog);
  const S = densidadPotencia(distanciaM);
  const dLim = distanciaLimite(bandaDef.limite);
  const moverDistancia = (v: number) => {
    setDistanciaLog(v);
    const s = densidadPotencia(Math.pow(10, v));
    if (s > bandaDef.limite) setVioExcede(true);
    else if (vioExcede) setVioCumple(true);
  };
  const alternarAntena = (id: number) => {
    const xs = antenas.includes(id) ? antenas.filter((a) => a !== id) : [...antenas, id];
    setAntenas(xs);
    if (xs.length === 3) {
      setUbico(true);
      if (sonido) audioRef.current?.chispa();
    } else blip();
  };
  const moverCelular = () => {
    setTelefono(posicionCelular(Math.random));
    blip();
  };
  const fotonEv = H_PLANCK_EV * bandaDef.mhz * 1e6;

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "reactor") reiniciarReactor();
    if (modo === "energia") {
      setDisparo(0);
      setPrediccion(null);
    }
    if (modo === "residuos") setLogT(LOG_T_MIN);
    if (modo === "telecom") {
      setTorres(["ciudad"]);
      setAntenas([]);
      setDistanciaLog(Math.log10(50));
    }
    setResetNonce((x) => x + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const regimenes = [reactor.vioSub, reactor.vioCrit, reactor.vioSuper].filter(Boolean).length;
  const objetivos: { t: string; done: boolean }[] = [
    { t: `Recorrer los tres regímenes: apagarse en k < 1, sostener k = 1 y llegar al SCRAM con k > 1 (${regimenes}/3)`, done: regimenes === 3 },
    { t: "Comprobar un freno físico: con uranio natural o sin agua, un BWR no llega a crítico", done: reactor.freno },
    { t: "Apagar el reactor, cortar las bombas y ver el calor residual dejar el combustible al descubierto", done: reactor.descubierto },
    { t: "Calcular con E = mc² la energía de una fisión", done: eOk },
    { t: "Predecir cuántas veces más carbón que uranio hace falta", done: prediccionOk },
    { t: "Calcular cuándo queda 1/8 del plutonio-239 y llevar el tiempo hasta ahí", done: puOk && puLlego },
    { t: "Conectar los tres pueblos eligiendo banda y torres", done: conecto },
    { t: "Cruzar la zona de exclusión de una antena y ubicar un celular con tres antenas", done: vioExcede && vioCumple && ubico },
    { t: "Clasificar preguntas en «¿Ciencia o ética?» y ganar estrellas", done: clasifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "reactor") {
    if (sim.scram) {
      chipVivo = `SCRAM · ${formatoDuracion(sim.tApagado)} · calor ${num(calorMW)} MW`;
      pie =
        sim.agua <= 0
          ? "Sin enfriamiento, el calor residual evaporó el agua y el combustible quedó al descubierto: así empezó la fusión de los núcleos de Fukushima Daiichi en 2011. Enciende las bombas para reponer el agua."
          : bombas
            ? `El reactor está apagado (${sim.motivo === "sobrepotencia" ? "disparo automático por sobrepotencia" : sim.motivo === "bombas" ? "disparo por pérdida de enfriamiento" : "SCRAM manual"}), pero los fragmentos de fisión siguen decayendo y producen ${num(calorFrac * 100, 2)} % de la potencia. Las bombas retiran ese calor.`
            : `Bombas apagadas: el calor residual (${num(calorMW)} MW) evapora unas ${num(evapTh)} t de agua por hora. El reloj corre 15 minutos por segundo.`;
    } else {
      chipVivo = `k = ${k.toFixed(3)} · ${num(sim.p * 100)} % · ${num(P_ELECTRICA_MW * sim.p)} MWe`;
      pie = `${REGIMEN_DEF[reg].explica} ${tipo === "rbmk" && vacios > 40 ? "En un RBMK, más vapor significa menos absorción de neutrones: la reactividad sube." : ""}`;
    }
  } else if (modo === "energia") {
    if (subEnergia === "fision") {
      chipVivo = disparo ? `${REACCION} · Δm = ${DEFECTO_U.toFixed(4)} u` : "²³⁵U en reposo · dispara un neutrón";
      pie = disparo ? "El núcleo absorbe el neutrón, se deforma y se parte en dos fragmentos que salen disparados, más tres neutrones que pueden provocar nuevas fisiones. La masa que falta se convirtió en energía." : "Un neutrón lento se acerca a un núcleo de uranio-235. Dispáralo y observa qué pasa.";
    } else {
      chipVivo = `${DEMANDAS.find((d) => d.id === demanda)!.etq.toLowerCase()} · ${prediccion === null ? "predice primero" : `×${num(cmp.razon)} más carbón`}`;
      pie = prediccion === null ? "Para producir la misma electricidad, ¿cuántas veces más masa de carbón que de uranio se necesita? Elige tu predicción en el panel." : `Nuclear: ${cmp.uKg < 1 ? `${num(cmp.uKg * 1000, 1)} g` : `${num(cmp.uKg / 1000, 1)} t`} de uranio y ${cmp.co2NucKg < 1000 ? `${num(cmp.co2NucKg)} kg` : `${cient(cmp.co2NucKg / 1000, 2)} t`} de CO₂. Carbón: ${cmp.carbonKg < 1e6 ? `${num(cmp.carbonKg)} kg` : `${cient(cmp.carbonKg / 1000, 2)} t`} y ${cmp.co2CarKg < 1e6 ? `${num(cmp.co2CarKg / 1000, 1)} t` : `${cient(cmp.co2CarKg / 1000, 2)} t`} de CO₂ (ciclo de vida).`;
    }
  } else if (modo === "residuos") {
    chipVivo = `t = ${formatoAnios(tAnios)} · ${num(tAnios / ANIOS_GENERACION, tAnios < 250 ? 1 : 0)} generaciones`;
    pie = `${isoDef.etq}: queda ${fracSel >= 0.001 ? `${num(fracSel * 100, fracSel < 0.1 ? 1 : 0)} %` : "menos de 0.1 %"}. ${hitoHumano(tAnios)}. ${isoDef.nota}`;
  } else {
    if (subTelecom === "cobertura") {
      chipVivo = `${bandaDef.etq} · ${pueblosCub.length}/3 pueblos · ${num((habCub / habTot) * 100, 1)} % con señal`;
      pie = `Con ${bandaDef.etq} cada torre alcanza unos ${num(alcanceKm(bandaDef.mhz), 1)} km. ${pueblosCub.length === 3 ? "Los tres pueblos tienen señal." : `Sin señal: ${pueblos.filter((l) => !cub.has(l.id)).map((l) => l.etq).join(", ")}.`} ${bandaDef.uso}`;
    } else if (subTelecom === "exposicion") {
      chipVivo = `${num(distanciaM, distanciaM < 10 ? 1 : 0)} m · ${S >= 0.01 ? num(S, 3) : cient(S, 1)} W/m² · ${num((S / bandaDef.limite) * 100, S / bandaDef.limite < 0.1 ? 2 : 0)} % del límite`;
      pie = S > bandaDef.limite ? `Dentro de ${num(dLim, 1)} m, en el haz principal, se rebasa el límite ICNIRP de ${num(bandaDef.limite, 1)} W/m²: por eso las azoteas con antenas tienen zona de acceso restringido. Aun así, un fotón de ${bandaDef.etq} no puede ionizar: solo calienta.` : `La intensidad baja con el cuadrado de la distancia: a ${num(distanciaM, 0)} m es ${num(bandaDef.limite / S, 0)} veces menor que el límite. Un fotón de ${bandaDef.etq} lleva ${cient(fotonEv, 2)} eV; para ionizar el agua hacen falta ${E_IONIZACION_AGUA_EV} eV.`;
    } else {
      chipVivo = antenas.length === 3 ? `ubicado · ± ${num(INCERTIDUMBRE_KM * 1000)} m` : `${antenas.length} ${antenas.length === 1 ? "antena" : "antenas"} · sin ubicar`;
      pie = antenas.length === 0 ? "Cada antena puede estimar a qué distancia está un celular por el tiempo que tarda su señal. Activa las antenas una por una." : antenas.length === 1 ? "Con una antena solo se sabe la distancia: el celular está en algún punto del círculo." : antenas.length === 2 ? "Con dos antenas quedan dos puntos posibles." : "Con tres antenas el celular queda ubicado sin que su dueño haga nada. La física que conecta es la misma que permite rastrear.";
    }
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
  const lectura = (etq: string, valor: string, col = "#fff") => (
    <div style={{ flex: "1 1 90px", padding: "9px 10px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.07em", color: T.text3, textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 14.5, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );
  const deslizador = (aria: string, icono: string, min: number, max: number, step: number, value: number, onChange: (v: number) => void, texto: string, col: string) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
      <i className={`fa-solid ${icono}`} style={{ color: col, width: 16 }} />
      <input type="range" aria-label={aria} className="fn-range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ["--fnc" as string]: col }} />
      <span style={{ minWidth: 92, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>{texto}</span>
    </label>
  );
  const pestanas = <X extends string>(items: { id: X; etq: string; icono: string }[], actual: X, set: (x: X) => void) => (
    <div className="fn-subtabs">
      {items.map((it) => (
        <button key={it.id} className="fn-subtab" data-on={it.id === actual} onClick={() => { set(it.id); blip(); }} style={{ ["--fnc" as string]: modoCol }}>
          <i className={`fa-solid ${it.icono}`} style={{ marginRight: 7 }} />
          {it.etq}
        </button>
      ))}
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "reactor") {
    control = (
      <>
        {sub("Tipo de reactor")}
        <div className="fn-opts">
          {TIPOS_REACTOR.map((t) => (
            <button key={t.id} className="fn-opt fn-tipo" data-on={t.id === tipo} onClick={() => { setTipo(t.id); blip(); }} style={{ ["--fnc" as string]: modoCol, background: t.id === tipo ? `${modoCol}1f` : "transparent" }}>
              {t.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, marginTop: 8 }}>{tipoDef.detalle}</div>
        {sub("Combustible")}
        <div className="fn-opts">
          {ENRIQUECIMIENTOS.map((e) => (
            <button key={e.id} className="fn-opt fn-enr" data-on={e.id === enr} onClick={() => { setEnr(e.id); blip(); }} style={{ ["--fnc" as string]: modoCol, background: e.id === enr ? `${modoCol}1f` : "transparent" }}>
              {e.etq}
            </button>
          ))}
        </div>
        {sub("Controles del núcleo")}
        {deslizador("Inserción de las barras de control (%)", "fa-grip-lines-vertical", 0, 100, 1, barras, setBarras, `${barras} % dentro`, "#cbd5e1")}
        {deslizador("Vapor en el núcleo (%)", "fa-cloud", 0, 100, 1, vacios, setVacios, `${vacios} % vapor`, "#7dd3fc")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {lectura("k efectivo", k.toFixed(3), REGIMEN_DEF[reg].color)}
          {lectura("Régimen", sim.scram ? "Apagado" : REGIMEN_DEF[reg].etq.split(" (")[0]!, sim.scram ? NO : REGIMEN_DEF[reg].color)}
          {lectura("Potencia", `${num(sim.p * 100)} %`)}
          {lectura("Eléctrica", `${num(P_ELECTRICA_MW * sim.p)} MW`)}
        </div>
        <div style={{ marginTop: 10 }}>
          <GraficaPotencia datos={sim.historial} col={sim.scram ? NO : REGIMEN_DEF[reg].color} />
        </div>
        <div className="fn-opts" style={{ marginTop: 10 }}>
          <button className="fn-opt fn-scram" data-on={!sim.scram} onClick={scramManual} disabled={sim.scram} style={{ ["--fnc" as string]: NO, background: sim.scram ? "transparent" : "rgba(248,113,113,0.12)" }}>
            <i className="fa-solid fa-power-off" style={{ marginRight: 8 }} />
            SCRAM manual
          </button>
          <button className="fn-opt fn-bombas" data-on={bombas} onClick={() => { setBombas((b) => !b); blip(); }} style={{ ["--fnc" as string]: bombas ? "#38bdf8" : NO, background: bombas ? "rgba(56,189,248,0.12)" : "rgba(248,113,113,0.12)" }}>
            <i className="fa-solid fa-fan" style={{ marginRight: 8 }} />
            {bombas ? "Apagar las bombas de enfriamiento" : "Encender las bombas"}
          </button>
          <button className="fn-opt fn-reinicio" data-on="false" onClick={reiniciarReactor} style={{ ["--fnc" as string]: modoCol }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
            Reiniciar el reactor
          </button>
        </div>
        {sim.scram && (
          <>
            {sub("Después del apagado")}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {lectura("Desde el apagado", formatoDuracion(sim.tApagado))}
              {lectura("Calor residual", `${num(calorFrac * 100, 2)} % · ${num(calorMW)} MW`, "#fbbf24")}
              {lectura("Agua sobre el combustible", sim.agua > 0 ? `${num(sim.agua)} t` : "¡Descubierto!", sim.agua > 0 ? "#7dd3fc" : NO)}
            </div>
            {nota(
              bombas
                ? "Las barras entraron y la fisión se detuvo, pero el calor residual no se puede apagar: sale del decaimiento de los fragmentos. Por eso un reactor necesita enfriamiento durante días después de apagarse."
                : `Sin bombas, ${num(calorMW)} MW evaporan unas ${num(evapTh)} toneladas de agua por hora (calor latente a 1 atm, cantidad de agua ilustrativa).`,
              bombas ? T.text2 : "#fbbf24",
              "fa-temperature-arrow-up",
            )}
          </>
        )}
        {nota(`Los neutrones retardados (${num(BETA_U235 * 100, 2)} % en el U-235) hacen que la potencia cambie en segundos y no en milésimas de segundo: eso da tiempo a las barras. Una bomba, en cambio, usa uranio enriquecido a más del 90 % y una reacción sin moderador que se completa en menos de un segundo; el combustible al 4 % de una central no puede explotar así.`, T.text3, "fa-shield-halved")}
      </>
    );
  } else if (modo === "energia") {
    control = (
      <>
        {pestanas(
          [
            { id: "fision" as SubEnergia, etq: "Una fisión", icono: "fa-atom" },
            { id: "combustible" as SubEnergia, etq: "Uranio frente a carbón", icono: "fa-train" },
          ],
          subEnergia,
          setSubEnergia,
        )}
        {subEnergia === "fision" ? (
          <>
            <button className="fn-toggle" onClick={() => { setDisparo((d) => d + 1); if (sonido) audioRef.current?.chispa(); }} style={{ marginTop: 12, ["--fnc" as string]: modoCol }}>
              <i className="fa-solid fa-circle-dot" style={{ marginRight: 9, color: modoCol }} />
              {disparo ? "Disparar otro neutrón" : "Disparar un neutrón al uranio-235"}
            </button>
            {sub(`La reacción: ${REACCION}`)}
            <div style={{ overflowX: "auto" }}>
              <table className="fn-tabla">
                <tbody>
                  <tr><td>²³⁵U</td><td>{MASAS.u235.toFixed(4)} u</td><td rowSpan={2} className="fn-suma">Antes: {MASA_ANTES.toFixed(4)} u</td></tr>
                  <tr><td>neutrón</td><td>{MASAS.n.toFixed(4)} u</td></tr>
                  <tr><td>¹⁴¹Ba</td><td>{MASAS.ba141.toFixed(4)} u</td><td rowSpan={3} className="fn-suma">Después: ?</td></tr>
                  <tr><td>⁹²Kr</td><td>{MASAS.kr92.toFixed(4)} u</td></tr>
                  <tr><td>3 neutrones</td><td>3 × {MASAS.n.toFixed(4)} u</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginTop: 8 }}>
              Calcula la masa que falta (Δm = antes − después) y conviértela: <strong style={{ color: "#fff" }}>E = Δm · c²</strong>, con 1 u · c² = {U_MEV} MeV.
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
              <input className="fn-input" aria-label="Energía de esta fisión (MeV)" inputMode="decimal" placeholder="MeV" value={eTexto} onChange={(e) => setETexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") comprobarE(); }} disabled={eOk} />
              <button className="fn-opt fn-comprobar-e" data-on="true" onClick={comprobarE} disabled={eOk} style={{ ["--fnc" as string]: modoCol }}>
                Comprobar
              </button>
            </div>
            {eIntento !== null &&
              (eOk
                ? nota(`Correcto: después suman ${MASA_DESPUES.toFixed(4)} u, faltan ${DEFECTO_U.toFixed(4)} u y E = ${DEFECTO_U.toFixed(4)} × ${U_MEV} = ${num(E_FISION_MEV, 1)} MeV al instante. Con los decaimientos posteriores de los fragmentos se llega a unos ${E_FISION_TOTAL_MEV} MeV por fisión: ${cient(E_FISION_TOTAL_MEV * 1e6 / E_COMBUSTION_EV, 1)} veces lo que libera quemar un átomo de carbono (${num(E_COMBUSTION_EV, 1)} eV).`, OK, "fa-circle-check")
                : nota(Math.abs(eIntento - E_FISION_MEV) < 30 ? "Cerca, pero revisa las cifras decimales: la diferencia de masa es muy pequeña y cada decimal cuenta." : eIntento > 1000 ? "Revisa las unidades: multiplica Δm en u por 931.5 para obtener MeV." : "Suma primero las masas de después (¡son tres neutrones!) y réstalas de las de antes.", WARN, "fa-rotate-left"))}
            {sub("Un gramo de masa")}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {lectura("E = 0.001 kg · c²", `${cient(E_UN_GRAMO_J, 2)} J`)}
              {lectura("En electricidad", `${num(E_UN_GRAMO_J / 3.6e12, 1)} GWh`)}
              {lectura("Hiroshima (~15 kt)", `≈ ${num((HIROSHIMA_KT * KT_TNT_J) / E_UN_GRAMO_J, 1)} g`, NO)}
            </div>
            {nota(`Laguna Verde convierte en energía unos ${num((2 * P_TERMICA_MW * 1e6 * 86400) / E_UN_GRAMO_J, 1)} g de masa al día; la bomba de Hiroshima convirtió menos de un gramo en un instante. La física es la misma: cambia el control, la velocidad y el propósito.`, T.text2, "fa-scale-unbalanced")}
          </>
        ) : (
          <>
            {sub("1 · ¿Cuánta electricidad?")}
            <div className="fn-opts">
              {DEMANDAS.map((d) => (
                <button key={d.id} className="fn-opt fn-demanda" data-on={d.id === demanda} onClick={() => { setDemanda(d.id); blip(); }} style={{ ["--fnc" as string]: modoCol, background: d.id === demanda ? `${modoCol}1f` : "transparent" }}>
                  {d.etq}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{DEMANDAS.find((d) => d.id === demanda)!.nota}</div>
            {sub("2 · Predice: ¿cuántas veces más masa de carbón que de uranio?")}
            <div className="fn-opts">
              {OPCIONES_RAZON.map((o) => {
                const on = prediccion === o.valor;
                const col = prediccion === null ? modoCol : o.valor === razonOk ? OK : on ? WARN : "rgba(255,255,255,0.14)";
                return (
                  <button key={o.valor} className="fn-opt fn-pred" data-on={on || (prediccion !== null && o.valor === razonOk)} onClick={() => predecir(o.valor)} disabled={prediccion !== null} style={{ ["--fnc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                    {o.etq}
                  </button>
                );
              })}
            </div>
            {prediccion !== null && (
              <>
                {nota(
                  <>
                    {prediccion === razonOk ? "Bien predicho. " : "No exactamente. "}
                    Con combustible real (45 GWd por tonelada, eficiencia 35 %) frente a carbón de 24 MJ/kg (eficiencia 36 %), hace falta <strong>{num(cmp.razon)} veces</strong> más masa de carbón. Si se fisionara todo el U-235, la razón sería de millones.
                  </>,
                  prediccion === razonOk ? OK : WARN,
                  prediccion === razonOk ? "fa-circle-check" : "fa-circle-xmark",
                )}
                {prediccion !== razonOk && (
                  <button className="fn-opt" data-on="false" onClick={() => setPrediccion(null)} style={{ marginTop: 8, ["--fnc" as string]: modoCol }}>
                    <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                    Volver a predecir
                  </button>
                )}
                {sub("3 · La misma electricidad")}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {lectura("Uranio", cmp.uKg < 1 ? `${num(cmp.uKg * 1000, 1)} g` : `${num(cmp.uKg / 1000, 1)} t`, "#7dd3fc")}
                  {lectura("Carbón", cmp.carbonKg < 1e6 ? `${num(cmp.carbonKg)} kg` : `${cient(cmp.carbonKg / 1000, 2)} t`, "#d6d3d1")}
                  {lectura("CO₂ nuclear", cmp.co2NucKg < 1e6 ? `${num(cmp.co2NucKg)} kg` : `${cient(cmp.co2NucKg / 1000, 2)} t`, OK)}
                  {lectura("CO₂ carbón", cmp.co2CarKg < 1e6 ? `${num(cmp.co2CarKg)} kg` : `${cient(cmp.co2CarKg / 1000, 2)} t`, NO)}
                </div>
                {nota(`Emisiones de todo el ciclo de vida (minería, construcción, operación): ${CO2_NUCLEAR} g de CO₂ por kWh la nuclear y ${CO2_CARBON} g el carbón (medianas del IPCC, 2014). El carbón no deja residuos de alta actividad; el uranio sí.`, T.text2, "fa-smog")}
              </>
            )}
          </>
        )}
      </>
    );
  } else if (modo === "residuos") {
    control = (
      <>
        {sub("Línea del tiempo (escala logarítmica)")}
        {deslizador("Tiempo desde que sale del reactor (log)", "fa-clock", LOG_T_MIN, LOG_T_MAX, 0.01, logT, moverTiempo, formatoAnios(tAnios), modoCol)}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 26 }}>
          <span>1 día</span>
          <span>1 año</span>
          <span>100 años</span>
          <span>10 000 años</span>
          <span>10 Ma</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {lectura("Tiempo", formatoAnios(tAnios))}
          {lectura("Generaciones", num(tAnios / ANIOS_GENERACION, tAnios < 250 ? 1 : 0))}
          {lectura(isoDef.etq, fracSel >= 0.001 ? `${num(fracSel * 100, fracSel < 0.1 ? 1 : 0)} %` : "< 0.1 %", isoDef.color)}
        </div>
        <div style={{ fontSize: 12, color: T.text2, marginTop: 8 }}>
          <i className="fa-solid fa-landmark" style={{ marginRight: 7, color: modoCol }} />
          {hitoHumano(tAnios)}
        </div>
        {sub("Isótopo")}
        <div className="fn-opts">
          {ISOTOPOS.map((i) => (
            <button key={i.id} className="fn-opt fn-iso" data-on={i.id === isotopo} onClick={() => { setIsotopo(i.id); blip(); }} style={{ ["--fnc" as string]: i.color, background: i.id === isotopo ? `${i.color}22` : "transparent" }}>
              {i.etq}
            </button>
          ))}
        </div>
        {nota(`${isoDef.nota} N = N₀ · (1/2)^(t / ${formatoAnios(isoDef.t12)}).`, T.text2)}
        {sub("Reto: ¿en cuántos años queda 1/8 del plutonio-239?")}
        <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>Su vida media es de 24 110 años. Calcúlalo y después lleva la línea del tiempo hasta ese momento.</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
          <input className="fn-input" aria-label="Años para que quede 1/8 del plutonio-239 (años)" inputMode="numeric" placeholder="años" value={puTexto} onChange={(e) => setPuTexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") comprobarPu(); }} disabled={puOk} />
          <button className="fn-opt fn-comprobar-pu" data-on="true" onClick={comprobarPu} disabled={puOk} style={{ ["--fnc" as string]: modoCol }}>
            Comprobar
          </button>
        </div>
        {puIntento !== null &&
          (puOk
            ? nota(puLlego ? `1/8 = (1/2)³: tres vidas medias, ${num(RETO_PU_ANIOS)} años, unas ${num(RETO_PU_ANIOS / ANIOS_GENERACION)} generaciones. Mira las columnas: el cesio y el estroncio ya no existen, pero el plutonio, el tecnecio y el yodo-129 siguen ahí.` : `Correcto: (1/2)³ = 1/8, tres vidas medias = ${num(RETO_PU_ANIOS)} años. Ahora mueve la línea del tiempo hasta ahí.`, OK, "fa-circle-check")
            : nota(Math.abs(puIntento - 24110 / 8) < 100 ? "Cuidado: 1/8 no es dividir entre 8 la vida media. Cada vida media deja la mitad: 1/2, 1/4, 1/8…" : "¿Cuántas veces hay que partir a la mitad para llegar a 1/8?", WARN, "fa-rotate-left"))}
        {nota("La lectura A1 dice que los residuos de alta actividad «mantienen su peligrosidad durante miles de años». Aquí puedes ver que algunos isótopos duran mucho más que eso: decidir cómo guardarlos es decidir por cientos de generaciones que no pueden opinar.", T.text3, "fa-people-arrows")}
      </>
    );
  } else {
    control = (
      <>
        {pestanas(SUBS_TELECOM, subTelecom, setSubTelecom)}
        {subTelecom !== "rastreo" && (
          <>
            {sub("Banda")}
            <div className="fn-opts">
              {BANDAS_TEL.map((b) => (
                <button key={b.id} className="fn-opt fn-banda" data-on={b.id === banda} onClick={() => elegirBanda(b.id)} style={{ ["--fnc" as string]: modoCol, background: b.id === banda ? `${modoCol}1f` : "transparent" }}>
                  {b.etq}
                </button>
              ))}
            </div>
          </>
        )}
        {subTelecom === "cobertura" && (
          <>
            {sub("Torres")}
            <div className="fn-opts">
              {TORRES.map((t) => {
                const on = torres.includes(t.id);
                return (
                  <button key={t.id} className="fn-opt fn-torre" data-on={on} disabled={t.fija} onClick={() => alternarTorre(t.id)} style={{ ["--fnc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                    <i className={`fa-solid ${on ? "fa-tower-cell" : "fa-plus"}`} style={{ marginRight: 8 }} />
                    {t.etq}
                    {t.fija ? " (ya existe)" : ""}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
              {pueblos.map((l) => {
                const on = cub.has(l.id);
                return (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, padding: "7px 10px", borderRadius: 9, background: "rgba(4,10,22,0.45)", border: `1px solid ${on ? `${OK}55` : T.line}` }}>
                    <span style={{ color: "#fff", fontWeight: 800 }}>
                      <i className={`fa-solid ${on ? "fa-signal" : "fa-ban"}`} style={{ marginRight: 8, color: on ? OK : NO }} />
                      {l.etq}
                    </span>
                    <span style={{ color: T.text2, ...NUM }}>
                      {num(l.habitantes)} hab. · a {num(Math.hypot(l.x, l.z), 0)} km de la ciudad
                    </span>
                  </div>
                );
              })}
            </div>
            {nota(`Modelo de pérdidas log-distancia: la señal cae ${num(10 * 4)} dB por cada década de distancia y ${num(20 * Math.log10(3500 / 700), 0)} dB más a 3.5 GHz que a 700 MHz. Por eso el 5G necesita más torres. La torre del cerro da servicio a 450 personas; la de la ciudad, a 250 000: ¿quién la paga?`, T.text2, "fa-signal")}
            {nota(`Brecha digital real (INEGI, ENDUTIH 2024): usa internet el ${ENDUTIH_2024.urbano} % de la población urbana y el ${ENDUTIH_2024.rural} % de la rural.`, T.text3, "fa-chart-simple")}
          </>
        )}
        {subTelecom === "exposicion" && (
          <>
            {deslizador("Distancia a la antena (m)", "fa-person-walking", Math.log10(D_MIN_M), Math.log10(D_MAX_M), 0.01, distanciaLog, moverDistancia, `${num(distanciaM, distanciaM < 10 ? 1 : 0)} m`, modoCol)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {lectura("Densidad de potencia", `${S >= 0.01 ? num(S, 3) : cient(S, 1)} W/m²`, S > bandaDef.limite ? NO : OK)}
              {lectura("Límite ICNIRP 2020", `${num(bandaDef.limite, 1)} W/m²`)}
              {lectura("Zona de exclusión", `${num(dLim, 1)} m`, "#fbbf24")}
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 10, ...NUM }}>
              S = PIRE / (4π d²) = 794 W / (4π · {num(distanciaM, 1)}²) = <strong style={{ color: "#fff" }}>{S >= 0.01 ? num(S, 3) : cient(S, 2)} W/m²</strong>
            </div>
            {sub("¿Puede ionizar?")}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {lectura(`Fotón de ${bandaDef.etq}`, `${cient(fotonEv, 2)} eV`)}
              {lectura("Ionizar el agua", `${E_IONIZACION_AGUA_EV} eV`, NO)}
            </div>
            {nota(`Un fotón de ${bandaDef.etq} tiene ${num(E_IONIZACION_AGUA_EV / fotonEv)} veces menos energía de la necesaria para ionizar. Subir la potencia da más fotones, no fotones más energéticos: la radiofrecuencia calienta, no rompe moléculas. Los rayos gamma de los residuos sí ionizan.`, T.text2, "fa-radiation")}
          </>
        )}
        {subTelecom === "rastreo" && (
          <>
            {sub("Activa las antenas")}
            <div className="fn-opts">
              {ANTENAS_RASTREO.map((a) => {
                const on = antenas.includes(a.id);
                return (
                  <button key={a.id} className="fn-opt fn-antena" data-on={on} onClick={() => alternarAntena(a.id)} style={{ ["--fnc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                    <i className="fa-solid fa-tower-broadcast" style={{ marginRight: 8 }} />
                    Antena {a.id + 1}
                  </button>
                );
              })}
              <button className="fn-opt fn-mover" data-on="false" onClick={moverCelular} style={{ ["--fnc" as string]: modoCol }}>
                <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
                Mover el celular
              </button>
            </div>
            <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
              {ANTENAS_RASTREO.filter((a) => antenas.includes(a.id)).map((a) => (
                <div key={a.id} style={{ fontSize: 12, color: T.text2, ...NUM }}>
                  Antena {a.id + 1}: el celular está a <strong style={{ color: "#fff" }}>{num(Math.hypot(telefono.x - a.x, telefono.z - a.z) * 1000, 0)} m</strong> (± {num(INCERTIDUMBRE_KM * 1000)} m)
                </div>
              ))}
            </div>
            {nota("Las ondas de radio viajan a la velocidad de la luz: medir cuánto tarda la respuesta del teléfono da la distancia. Tres distancias bastan para ubicarlo (trilateración). La precisión mostrada es ilustrativa.", T.text2, "fa-location-crosshairs")}
            {nota("La lectura A1 lo plantea: la misma infraestructura que da acceso al conocimiento permite el seguimiento de dispositivos móviles sin consentimiento. ¿Quién debe poder pedir esta ubicación y con qué controles?", T.text3, "fa-user-secret")}
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes fnAparece { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes fnPulse { 0%,100%{ box-shadow:0 0 0 0 var(--fnd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .fn-live-dot { animation: fnPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .fn-live-dot { animation:none; } }
        .fn-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .fn-grid { grid-template-columns: 1fr; } }
        .fn-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .fn-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .fn-icobtn:hover { background:rgba(255,255,255,0.12); }
        .fn-tabs { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
        @media (max-width: 760px){ .fn-tabs { grid-template-columns: repeat(2,1fr); } }
        .fn-tab { cursor:pointer; border:1px solid var(--fnc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .fn-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .fn-tab:hover { background:rgba(255,255,255,0.06); }
        .fn-subtabs { display:flex; flex-wrap:wrap; gap:6px; padding:4px; border-radius:12px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; }
        .fn-subtab { flex:1 1 140px; cursor:pointer; border:1px solid transparent; border-radius:9px; padding:8px 10px; font-size:12px; font-weight:800; color:rgba(255,255,255,0.66); background:transparent; transition:all .15s; }
        .fn-subtab[data-on="true"] { border-color:var(--fnc); color:#fff; background:rgba(255,255,255,0.07); }
        .fn-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .fn-opt { cursor:pointer; border:1px solid var(--fnc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .fn-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .fn-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .fn-opt:disabled { cursor:default; }
        .fn-opt:disabled[data-on="false"] { opacity:0.55; }
        .fn-toggle { width:100%; cursor:pointer; border:1px solid var(--fnc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .fn-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .fn-range { flex:1; accent-color: var(--fnc); min-width:0; }
        .fn-input { width:130px; padding:9px 11px; border-radius:10px; border:1px solid ${T.lineStrong}; background:rgba(4,10,22,0.6); color:#fff; font-size:13px; font-weight:800; font-variant-numeric:tabular-nums; }
        .fn-input:disabled { opacity:0.7; }
        .fn-tabla { width:100%; border-collapse:collapse; font-size:12px; font-variant-numeric:tabular-nums; }
        .fn-tabla td { padding:6px 9px; border-bottom:1px solid ${T.line}; color:${T.text2}; white-space:nowrap; }
        .fn-tabla td:first-child { color:#fff; font-weight:800; }
        .fn-tabla .fn-suma { color:#fff; font-weight:900; border-left:1px solid ${T.line}; text-align:center; }
        .fn-opt:focus-visible, .fn-tab:focus-visible, .fn-subtab:focus-visible, .fn-toggle:focus-visible, .fn-icobtn:focus-visible, .fn-range:focus-visible, .fn-input:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .fn-bottom { grid-template-columns: 1fr !important; } }
        .fn-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .fn-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .fn-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .fn-drawer[data-open="true"] { transform:translateX(0); }
        .fn-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .fn-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .fn-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .fn-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .fn-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .fn-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="fn-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="fn-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--fnc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="fn-grid">
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
              <FisionScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                p={sim.p}
                k={k}
                barras={barrasEf}
                vacios={vacios / 100}
                tipo={tipo}
                scram={sim.scram}
                agua={sim.agua}
                bombas={bombas}
                ebullicion={ebullicion}
                subEnergia={subEnergia}
                disparo={disparo}
                demanda={demanda}
                revelado={prediccion !== null}
                tAnios={tAnios}
                isotopo={isotopo}
                subTelecom={subTelecom}
                banda={banda}
                torres={torres}
                distanciaM={distanciaM}
                antenas={antenas}
                telefono={telefono}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="fn-live-dot" style={{ ["--fnd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="fn-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="fn-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="fn-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="fn-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-scale-balanced" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>La misma física, usos opuestos</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="fn-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid #c084fc55", background: "rgba(192,132,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-comments" style={{ marginRight: 8, color: "#c084fc" }} />
              Debate ético (A3, A7, A9 y A5)
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, marginBottom: 6 }}>{TITULO_A3}</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{DEBATE_A3}</div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "10px 0 6px" }}>PISTAS</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 5 }}>
              {PISTAS_A3.map((p, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {p}
                </li>
              ))}
            </ul>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
                <strong style={{ color: "#fff" }}>Si tuvieras que votar (A7):</strong> {REFLEXION_A7}
              </div>
              <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
                <strong style={{ color: "#fff" }}>Después del video (A9):</strong> {PREGUNTA_A9}
              </div>
              <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
                <strong style={{ color: "#fff" }}>Analiza una tecnología (A5):</strong> {ACTIVIDAD_A5}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-landmark" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (quiz A4)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
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
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          <div style={{ ...card, padding: "18px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8, color: "#fbbf24" }} />
              Actualizaciones
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
              {NOTAS_ACTUALIZACION.map((x, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas y su recuadro, el debate de A3, A5, A7 y A9, los hechos del quiz A4, el glosario A5, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma
          (en el texto A6 se acepta además «mc2», porque el «²» no se teclea fácilmente). La dimensión ética se conserva como <strong>debate</strong>; lo manipulable es la física. Son <strong>datos reales</strong>:
          masas atómicas (AME2020), vidas medias, calor residual (Way–Wigner), neutrones retardados, potencia de Laguna Verde (CFE), emisiones de ciclo de vida (IPCC 2014), límites de exposición
          (ICNIRP 2020) y brecha digital (INEGI, ENDUTIH 2024). Son <strong>modelos ilustrativos</strong>: la reactividad k y su respuesta a barras y vapor, la velocidad de la simulación, el agua sobre el
          combustible, el alcance de las torres, los pueblos y sus habitantes, la potencia de la antena y la precisión del rastreo. Las actualizaciones no son parte de la lectura. Fuente: {FUENTE}
        </span>
      </div>

      <CienciaEticaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Puedes argumentar con física y con ética." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="fn-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="fn-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="fn-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="fn-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="fn-drawer-body">
          <FichaTeorica data={FISION_NUCLEAR_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
