"use client";

/**
 * Laboratorio 3D — "La oxigenación de la atmósfera".
 * Práctica experimental de la progresión 5 de CNEYT-III (actividades
 * CNEYT-III-P11), anclada al ejercicio A2 «Óxidos y oxígeno: clasifica y
 * balancea». El marco teórico es la lectura A1, el quiz evaluable el A4
 * (verdadero o falso), el glosario el A5 y el texto el A6.
 *
 * Tres modos:
 *  (1) Mar primitivo — cianobacterias en estromatolitos liberan O₂ que primero
 *      oxida el hierro disuelto (hierro bandeado) y solo después llega al aire.
 *  (2) Historia del O₂ — 4,000 millones de años de atmósfera: curva con
 *      incertidumbre, Gran Evento de Oxidación, capa de ozono y rayos UV.
 *  (3) Química del oxígeno — balancear, quemar, disolver en agua con indicador
 *      y clasificar óxidos básicos y ácidos.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { RetoNumericoCard } from "./_reto-numerico";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { OXIGENACION_ATMOSFERA_FICHA } from "./oxigenacion-atmosfera-ficha";
import {
  type Modo,
  type EstadoMar,
  type Era,
  type ElementoId,
  type FaseOx,
  type Clase,
  MODOS,
  MODOS_DEF,
  MAR_INICIAL,
  P_MAX,
  S_MAX,
  GASES,
  FE_POR_O2,
  MS_CICLO,
  pasoMar,
  seAcumula,
  balanceTexto,
  bandasDe,
  T_MAX_MA,
  CURVA,
  O2_ACTUAL,
  rangoLog,
  rangoTexto,
  escudoOzono,
  HITOS,
  hitoEn,
  eraDe,
  PREGUNTAS_GRAFICA,
  ELEMENTOS,
  balance,
  ecuacion,
  COEF_MAX,
  T_ARDER,
  T_DISOLVER,
  colorPH,
  OXIDOS,
  rondaOxidos,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS,
  GLOSARIO,
  ACTIVIDAD_A5,
  HECHOS_A8,
  QUIZ_A4,
  RETO_A2,
  HUECOS_A6,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  MEXICO,
  num,
} from "./oxigenacion-atmosfera-data";

const OxigenacionScene = dynamic(() => import("./OxigenacionAtmosferaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-earth-americas fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la Tierra primitiva en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-oxigenacion-atmosfera-reto";
const WARN = "#FF8A3C";
const MAX_CICLOS = 150;
const RONDA_INICIAL = rondaOxidos(mulberry32(7));
const CLASE_ETQ: Record<Clase, string> = { basico: "Óxido básico", acido: "Óxido ácido" };

/* ── Gráfica de O₂ con incertidumbre (SVG) ────────────────────────────── */

const GW = 360;
const GH = 196;
const G_IZQ = 44;
const G_DER = 10;
const G_ARR = 12;
const G_ABA = 30;
const Y_MIN = -6;
const Y_MAX = 2;
const LOG_ACTUAL = Math.log10(O2_ACTUAL);
const gx = (t: number) => G_IZQ + ((T_MAX_MA - t) / T_MAX_MA) * (GW - G_IZQ - G_DER);
const gy = (logPct: number) => G_ARR + ((Y_MAX - Math.max(Y_MIN, logPct)) / (Y_MAX - Y_MIN)) * (GH - G_ARR - G_ABA);

const MUESTRAS_T = (() => {
  const ts = new Set<number>();
  for (let t = T_MAX_MA; t >= 0; t -= 25) ts.add(t);
  CURVA.forEach((c) => ts.add(c[0]));
  return [...ts].sort((a, b) => b - a);
})();
const BANDA_PATH = (() => {
  const arriba = MUESTRAS_T.map((t) => `${gx(t).toFixed(1)},${gy(rangoLog(t).max + LOG_ACTUAL).toFixed(1)}`);
  const abajo = [...MUESTRAS_T].reverse().map((t) => `${gx(t).toFixed(1)},${gy(rangoLog(t).min + LOG_ACTUAL).toFixed(1)}`);
  return `M${arriba.join(" L")} L${abajo.join(" L")} Z`;
})();
const MEDIO_PATH = `M${MUESTRAS_T.map((t) => `${gx(t).toFixed(1)},${gy(rangoLog(t).medio + LOG_ACTUAL).toFixed(1)}`).join(" L")}`;

function GraficaO2({ tMa, color }: { tMa: number; color: string }) {
  const r = rangoLog(tMa);
  const ticksY = [-6, -4, -2, 0, 2];
  const etqY: Record<number, string> = { [-6]: "0.000001", [-4]: "0.0001", [-2]: "0.01", 0: "1", 2: "100" };
  return (
    <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label="Oxígeno en el aire a lo largo del tiempo, con su banda de incertidumbre" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x={gx(2400)} y={G_ARR} width={gx(2100) - gx(2400)} height={GH - G_ARR - G_ABA} fill="#fbbf24" opacity={0.1} />
      <text x={(gx(2400) + gx(2100)) / 2} y={G_ARR + 10} fill="#fbbf24" fontSize={8.5} fontWeight={800} textAnchor="middle">
        Gran Oxidación
      </text>
      {ticksY.map((v) => (
        <g key={v}>
          <line x1={G_IZQ} x2={GW - G_DER} y1={gy(v)} y2={gy(v)} stroke="rgba(255,255,255,0.08)" />
          <text x={G_IZQ - 5} y={gy(v) + 3} fill="rgba(255,255,255,0.5)" fontSize={8.5} textAnchor="end">
            {etqY[v]}
          </text>
        </g>
      ))}
      {[4000, 3000, 2000, 1000, 0].map((t) => (
        <text key={t} x={gx(t)} y={GH - G_ABA + 13} fill="rgba(255,255,255,0.5)" fontSize={8.5} textAnchor="middle">
          {t === 0 ? "hoy" : num(t)}
        </text>
      ))}
      <text x={(G_IZQ + GW) / 2} y={GH - 4} fill="rgba(255,255,255,0.45)" fontSize={8.5} textAnchor="middle">
        millones de años atrás
      </text>
      <text x={10} y={GH / 2} fill="rgba(255,255,255,0.45)" fontSize={8.5} textAnchor="middle" transform={`rotate(-90 10 ${GH / 2})`}>
        % de O₂ en el aire (log)
      </text>
      <line x1={G_IZQ} x2={GW - G_DER} y1={gy(LOG_ACTUAL)} y2={gy(LOG_ACTUAL)} stroke="#34d399" strokeDasharray="3 3" opacity={0.7} />
      <text x={GW - G_DER - 2} y={gy(LOG_ACTUAL) - 3} fill="#34d399" fontSize={8} textAnchor="end">
        actual 21 %
      </text>
      <path d={BANDA_PATH} fill={color} opacity={0.28} />
      <path d={MEDIO_PATH} fill="none" stroke={color} strokeWidth={1.6} />
      {HITOS.map((h) => (
        <circle key={h.etq} cx={gx(h.t)} cy={GH - G_ABA} r={2.2} fill="rgba(255,255,255,0.55)" />
      ))}
      <line x1={gx(tMa)} x2={gx(tMa)} y1={G_ARR} y2={GH - G_ABA} stroke="#fff" strokeWidth={1.2} />
      <line x1={gx(tMa)} x2={gx(tMa)} y1={gy(r.max + LOG_ACTUAL)} y2={gy(r.min + LOG_ACTUAL)} stroke={color} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/* ── Tarjeta de estrellas: clasifica el óxido ─────────────────────────── */

function ClasificaOxidosCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = OXIDOS[ronda[pos] ?? 0]!;

  const responder = (c: Clase) => {
    if (resuelto !== null) return;
    const ok = c === actual.clase;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${actual.formula} es ${CLASE_ETQ[actual.clase].toLowerCase()}: ${actual.porque}`);
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
    setRonda(rondaOxidos(Math.random));
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
          Clasifica el óxido
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
            Óxido {pos + 1} de {ronda.length} · ¿de un metal o de un no metal?
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <span className="ox-formula" style={{ fontSize: 26, color: "#fff", fontWeight: 900, ...NUM }}>
              {actual.formula}
            </span>
            <span style={{ fontSize: 13, color: T.text2 }}>{actual.nombre}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="ox-opt ox-clasif" data-on="true" onClick={() => responder("basico")} style={{ ["--oxc" as string]: "#60a5fa" }}>
              <i className="fa-solid fa-flask" style={{ marginRight: 8 }} />
              Óxido básico (metal)
            </button>
            <button className="ox-opt ox-clasif" data-on="true" onClick={() => responder("acido")} style={{ ["--oxc" as string]: WARN }}>
              <i className="fa-solid fa-cloud-rain" style={{ marginRight: 8 }} />
              Óxido ácido (no metal)
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

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

type Prediccion = { P: number; S: number; valor: boolean; ok: boolean };

export function LabOxigenacionAtmosfera({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("mar");

  // ── Mar primitivo
  const [P, setP] = useState(6);
  const [S, setS] = useState(24);
  const [mar, setMar] = useState<EstadoMar>(MAR_INICIAL);
  const [corriendo, setCorriendo] = useState(false);
  const [prediccion, setPrediccion] = useState<Prediccion | null>(null);
  const [prediccionesOk, setPrediccionesOk] = useState<Set<string>>(() => new Set());
  const [bandasOk, setBandasOk] = useState(false);
  const [aireOk, setAireOk] = useState(false);
  const marRef = useRef<EstadoMar>(MAR_INICIAL);
  const psRef = useRef({ P: 6, S: 24 });
  const intervalo = useRef<number | null>(null);

  // ── Historia
  const [tMa, setTMa] = useState(T_MAX_MA);
  const [uv, setUv] = useState(false);
  const [visitadas, setVisitadas] = useState<Set<Era>>(() => new Set<Era>(["arcaico"]));
  const [uvSin, setUvSin] = useState(false);
  const [uvCon, setUvCon] = useState(false);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => PREGUNTAS_GRAFICA.map(() => null));

  // ── Óxidos
  const [elId, setElId] = useState<ElementoId>("mg");
  const [coefs, setCoefs] = useState<Record<ElementoId, [number, number, number]>>({ mg: [1, 1, 1], ca: [1, 1, 1], fe: [1, 1, 1], s: [1, 1, 1], c: [1, 1, 1] });
  const [revisado, setRevisado] = useState(false);
  const [balanceados, setBalanceados] = useState<Set<ElementoId>>(() => new Set());
  const [fase, setFase] = useState<FaseOx>("listo");
  const [clasif, setClasif] = useState<Clase | null>(null);
  const [phBasico, setPhBasico] = useState(false);
  const [phAcido, setPhAcido] = useState(false);
  const opOx = useRef(0);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [retoOk, setRetoOk] = useState(false);
  const [quizOk, setQuizOk] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setIdentifico(true);
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
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      lista.forEach((t) => window.clearTimeout(t));
      if (intervalo.current !== null) window.clearInterval(intervalo.current);
    };
  }, []);

  const despues = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
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

  /* ── Mar primitivo ─────────────────────────────────────────────────── */
  const detener = () => {
    if (intervalo.current !== null) window.clearInterval(intervalo.current);
    intervalo.current = null;
    setCorriendo(false);
    if (sonido) audioRef.current?.burbujas(false);
  };
  const iniciar = () => {
    if (intervalo.current !== null) return;
    setCorriendo(true);
    if (sonido) audioRef.current?.burbujas(true);
    intervalo.current = window.setInterval(() => {
      const sig = pasoMar(marRef.current, psRef.current.P, psRef.current.S);
      marRef.current = sig;
      setMar(sig);
      if (bandasDe(sig.depositado) >= 4) setBandasOk(true);
      if (sig.aire >= 15) setAireOk(true);
      if (sig.ciclo >= MAX_CICLOS) {
        if (intervalo.current !== null) window.clearInterval(intervalo.current);
        intervalo.current = null;
        setCorriendo(false);
      }
    }, MS_CICLO);
  };
  const reiniciarMar = () => {
    detener();
    marRef.current = MAR_INICIAL;
    setMar(MAR_INICIAL);
    setPrediccion(null);
  };
  const cambiarP = (v: number) => {
    setP(v);
    psRef.current = { ...psRef.current, P: v };
  };
  const cambiarS = (v: number) => {
    setS(v);
    psRef.current = { ...psRef.current, S: v };
  };
  const predecir = (valor: boolean) => {
    if (mar.ciclo > 0 || corriendo) return;
    const ok = valor === seAcumula(P, S);
    setPrediccion({ P, S, valor, ok });
    sfx(ok);
    if (ok) setPrediccionesOk((s) => new Set(s).add(String(valor)));
  };
  const prediccionVigente = prediccion && prediccion.P === P && prediccion.S === S ? prediccion : null;
  const acumula = seAcumula(P, S);
  const bandas = bandasDe(mar.depositado);

  /* ── Historia ──────────────────────────────────────────────────────── */
  const rango = rangoLog(tMa);
  const ozono = escudoOzono(rango.medio);
  const hito = hitoEn(tMa);
  const registrarTiempo = (t: number, uvOn: boolean) => {
    const era = eraDe(t);
    if (era !== "otra") setVisitadas((s) => (s.has(era) ? s : new Set(s).add(era)));
    if (uvOn) {
      const oz = escudoOzono(rangoLog(t).medio);
      if (oz < 0.1) setUvSin(true);
      if (oz > 0.9) setUvCon(true);
    }
  };
  const moverTiempo = (t: number) => {
    const v = Math.min(T_MAX_MA, Math.max(0, t));
    setTMa(v);
    registrarTiempo(v, uv);
  };
  const irHito = (d: number) => {
    const destino = d > 0 ? HITOS.find((h) => h.t < tMa) : [...HITOS].reverse().find((h) => h.t > tMa);
    if (destino) moverTiempo(destino.t);
    blip();
  };
  const toggleUv = () => {
    const on = !uv;
    setUv(on);
    registrarTiempo(tMa, on);
    blip();
  };
  const responderGrafica = (i: number, j: number) => {
    if (respuestas[i] === PREGUNTAS_GRAFICA[i]!.correcta) return;
    setRespuestas((r) => {
      const n = [...r];
      n[i] = j;
      return n;
    });
    sfx(j === PREGUNTAS_GRAFICA[i]!.correcta);
  };
  const graficaOk = PREGUNTAS_GRAFICA.every((q, i) => respuestas[i] === q.correcta);

  /* ── Óxidos ────────────────────────────────────────────────────────── */
  const el = ELEMENTOS.find((e) => e.id === elId)!;
  const coef = coefs[elId];
  const bal = balance(el, coef);
  const listoParaReaccion = revisado && bal.balanceada && bal.minima;
  const elegirElemento = (id: ElementoId) => {
    opOx.current += 1;
    setElId(id);
    setFase("listo");
    setRevisado(false);
    setClasif(null);
    if (sonido) audioRef.current?.fuego(false);
    blip();
  };
  const cambiarCoef = (k: 0 | 1 | 2, d: number) => {
    if (fase !== "listo") return;
    setCoefs((c) => {
      const actual = c[elId];
      const n: [number, number, number] = [...actual];
      n[k] = Math.min(COEF_MAX, Math.max(1, n[k] + d));
      return { ...c, [elId]: n };
    });
    setRevisado(false);
    blip();
  };
  const revisarBalance = () => {
    setRevisado(true);
    const ok = bal.balanceada && bal.minima;
    sfx(ok);
    if (ok) setBalanceados((s) => new Set(s).add(elId));
  };
  const reaccionar = () => {
    if (!listoParaReaccion || fase !== "listo") return;
    const op = ++opOx.current;
    setFase("reaccionando");
    if (sonido && el.proceso === "combustion") audioRef.current?.fuego(true);
    despues(T_ARDER, () => {
      if (opOx.current !== op) return;
      setFase("reaccionado");
      if (sonido) audioRef.current?.fuego(false);
    });
  };
  const disolver = () => {
    if (fase !== "reaccionado") return;
    const op = ++opOx.current;
    setFase("disolviendo");
    if (sonido) audioRef.current?.gota();
    despues(T_DISOLVER, () => {
      if (opOx.current !== op) return;
      setFase("disuelto");
    });
  };
  const clasificar = (c: Clase) => {
    if (fase !== "disuelto" || clasif === el.clase) return;
    setClasif(c);
    const ok = c === el.clase;
    sfx(ok);
    if (ok && el.pH > 7) setPhBasico(true);
    if (ok && el.pH < 7) setPhAcido(true);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "mar") reiniciarMar();
    if (modo === "historia") {
      setTMa(T_MAX_MA);
      setUv(false);
    }
    if (modo === "oxidos") {
      opOx.current += 1;
      setFase("listo");
      setRevisado(false);
      setClasif(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Formar 4 bandas de hierro y llevar O₂ al aire", done: bandasOk && aireOk },
    { t: "Predecir bien un caso en que el O₂ llega al aire y otro en que no", done: prediccionesOk.size === 2 },
    { t: "Visitar la Tierra antes, durante y después del Gran Evento de Oxidación", done: visitadas.has("arcaico") && visitadas.has("goe") && visitadas.has("fanerozoico") },
    { t: "Comparar los rayos UV sin capa de ozono y con ella", done: uvSin && uvCon },
    { t: "Responder las tres preguntas de la gráfica", done: graficaOk },
    { t: "Balancear tres ecuaciones de reacción con oxígeno", done: balanceados.size >= 3 },
    { t: "Medir el pH y clasificar un óxido básico y uno ácido", done: phBasico && phAcido },
    { t: "Clasificar óxidos y ganar estrellas", done: identifico },
    { t: "Resolver el reto A2", done: retoOk },
    { t: "Aprobar el quiz A4", done: quizOk },
    { t: "Completar el texto A6", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "mar") {
    chipVivo = `ciclo ${mar.ciclo} · Fe²⁺ ${num(mar.fe)} u · O₂ en el aire ${num(mar.aire)} u`;
    if (mar.ciclo === 0) pie = `Las cianobacterias liberan ${num(P)} u de O₂ por ciclo y las fuentes hidrotermales aportan ${num(S)} u de Fe²⁺. Cada O₂ oxida 4 Fe²⁺: el O₂ solo llega al aire si sobra.`;
    else if (mar.fe >= 0.5) pie = "El O₂ oxida el hierro disuelto y el óxido cae al fondo formando bandas: mientras quede hierro, el aire sigue sin oxígeno.";
    else if (mar.flujoAire > GASES) pie = "Ya no queda hierro disuelto: el O₂ que sobra escapa del mar, supera a los gases volcánicos y se acumula en el aire.";
    else pie = "El hierro que llega de las fuentes hidrotermales (y los gases volcánicos) consume todo el O₂ que se produce: el aire no se oxigena.";
  } else if (modo === "historia") {
    chipVivo = `${tMa <= 0 ? "hoy" : `hace ${num(tMa)} Ma`} · O₂ ${rangoTexto(tMa)}`;
    pie = `${hito.etq}: ${hito.texto}`;
  } else {
    chipVivo = `${ecuacion(el, coef)}${fase === "disuelto" ? ` · pH ${el.pHTexto}` : ""}`;
    if (fase === "listo") pie = revisado ? (listoParaReaccion ? `Balanceada: ya puedes ${el.proceso === "combustion" ? "quemar" : "dejar oxidar"} la muestra (${el.muestra}).` : "Cuenta los átomos de cada elemento a cada lado y ajusta los coeficientes.") : `Ajusta los coeficientes para que haya los mismos átomos de ${el.simbolo} y de O a cada lado de la flecha.`;
    else if (fase === "reaccionando") pie = el.observacion;
    else if (fase === "reaccionado") pie = `Se formó ${el.nombreProducto}. Introdúcelo en el frasco con agua e indicador universal.`;
    else if (fase === "disolviendo") pie = `${el.conAgua}. Observa el color del indicador.`;
    else pie = `${el.conAgua} · el indicador marca pH ${el.pHTexto}. ${clasif ? (clasif === el.clase ? el.explica : "Revisa: ¿es un metal o un no metal?") : "¿Es un óxido básico o ácido?"}`;
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
      <div style={{ fontSize: 9.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "mar") {
    const alHierro = Math.min(P, S / FE_POR_O2);
    const maxBarra = Math.max(P, S / FE_POR_O2 + GASES, 1);
    control = (
      <>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-bacteria" style={{ color: "#4ade80", width: 16 }} />
          <span style={{ fontSize: 12, color: T.text2, width: 150 }}>Cianobacterias (O₂/ciclo)</span>
          <input type="range" aria-label="Producción de O₂ de las cianobacterias (u por ciclo)" className="ox-range" min={0} max={P_MAX} step={1} value={P} onChange={(e) => cambiarP(Number(e.target.value))} style={{ ["--oxc" as string]: "#4ade80" }} />
          <span style={{ width: 44, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{P} u</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <i className="fa-solid fa-volcano" style={{ color: "#fb923c", width: 16 }} />
          <span style={{ fontSize: 12, color: T.text2, width: 150 }}>Fuentes hidrotermales (Fe²⁺/ciclo)</span>
          <input type="range" aria-label="Aporte de hierro de las fuentes hidrotermales (u por ciclo)" className="ox-range" min={0} max={S_MAX} step={4} value={S} onChange={(e) => cambiarS(Number(e.target.value))} style={{ ["--oxc" as string]: "#fb923c" }} />
          <span style={{ width: 44, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{S} u</span>
        </label>

        {sub("Balance de oxígeno por ciclo (cuando se acaba el hierro inicial)")}
        <div style={{ display: "grid", gap: 6 }}>
          {[
            { etq: "Producción de O₂", v: P, col: "#4ade80" },
            { etq: `Sumidero: hierro que llega (${num(S)} ÷ 4)`, v: alHierro, col: "#fb923c" },
            { etq: "Sumidero: gases volcánicos", v: GASES, col: "#a8a29e" },
          ].map((b) => (
            <div key={b.etq} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: T.text2, width: 190 }}>{b.etq}</span>
              <div style={{ flex: 1, height: 9, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${(b.v / maxBarra) * 100}%`, height: "100%", background: b.col, transition: "width .25s" }} />
              </div>
              <span style={{ width: 34, textAlign: "right", fontSize: 11.5, color: "#fff", fontWeight: 800, ...NUM }}>{num(b.v, Number.isInteger(b.v) ? 0 : 1)}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
          O₂ neto al aire = producción − hierro/4 − gases = <strong style={{ color: "#fff" }}>{balanceTexto(P, S)}</strong> u por ciclo
        </div>

        {sub("1 · Predice: con estos ajustes, ¿llegará O₂ al aire?")}
        <div className="ox-opts">
          {[true, false].map((v) => {
            const on = prediccionVigente?.valor === v;
            const col = on ? (prediccionVigente!.ok ? OK : WARN) : modoCol;
            return (
              <button key={String(v)} className="ox-opt ox-pred" data-on={on} onClick={() => predecir(v)} disabled={mar.ciclo > 0 || corriendo || !!prediccionVigente} style={{ ["--oxc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${v ? "fa-wind" : "fa-ban"}`} style={{ marginRight: 8 }} />
                {v ? "Sí: se acumulará en el aire" : "No: el aire seguirá sin O₂"}
              </button>
            );
          })}
        </div>
        {mar.ciclo > 0 && !prediccionVigente && nota("Para predecir, reinicia el mar y ajusta los controles antes de echar a andar los ciclos.", T.text3)}
        {prediccionVigente &&
          nota(
            <>
              {prediccionVigente.ok ? "Bien predicho. " : "No es así. "}
              {acumula
                ? `La producción (${num(P)}) supera a los sumideros (${num(S)}/4 + ${GASES}): cuando se agote el hierro disuelto, el O₂ sobrante se acumulará en el aire.`
                : `Los sumideros (${num(S)}/4 + ${GASES}) consumen todo lo que producen las cianobacterias (${num(P)}): el O₂ nunca se acumula en el aire.`}{" "}
              Compruébalo echando a andar los ciclos.
            </>,
            prediccionVigente.ok ? OK : WARN,
            prediccionVigente.ok ? "fa-circle-check" : "fa-circle-xmark",
          )}

        {sub("2 · Echa a andar el tiempo")}
        <div className="ox-opts">
          <button className="ox-toggle" onClick={corriendo ? detener : iniciar} disabled={!corriendo && mar.ciclo >= MAX_CICLOS} style={{ ["--oxc" as string]: modoCol, flex: 2 }}>
            <i className={`fa-solid ${corriendo ? "fa-pause" : "fa-play"}`} style={{ marginRight: 9, color: modoCol }} />
            {corriendo ? "Pausar los ciclos" : mar.ciclo > 0 ? "Continuar" : "Iniciar los ciclos"}
          </button>
          <button className="ox-toggle" onClick={reiniciarMar} style={{ ["--oxc" as string]: "rgba(255,255,255,0.3)", flex: 1 }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 9 }} />
            Reiniciar el mar
          </button>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
          {lectura("Ciclo", String(mar.ciclo))}
          {lectura("Fe²⁺ disuelto", `${num(mar.fe)} u`, "#86efac")}
          {lectura("Hierro bandeado", `${bandas} ${bandas === 1 ? "banda" : "bandas"}`, "#fb923c")}
          {lectura("O₂ en el aire", `${num(mar.aire)} u`, mar.aire > 0 ? "#7dd3fc" : "#fff")}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          Reacción del hierro: 4 Fe²⁺ + O₂ + 10 H₂O → 4 Fe(OH)₃ + 8 H⁺. Las cantidades son unidades relativas (ilustrativas); la estequiometría 4 : 1 es real.
        </div>
      </>
    );
  } else if (modo === "historia") {
    control = (
      <>
        <GraficaO2 tMa={tMa} color={modoCol} />
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>4,000 Ma</span>
          <input type="range" aria-label="Línea del tiempo (millones de años atrás)" className="ox-range" min={0} max={T_MAX_MA} step={10} value={T_MAX_MA - tMa} onChange={(e) => moverTiempo(T_MAX_MA - Number(e.target.value))} style={{ ["--oxc" as string]: modoCol }} />
          <span style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>hoy</span>
        </label>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
          {lectura("Tiempo", tMa <= 0 ? "hoy" : `hace ${num(tMa)} Ma`)}
          {lectura("O₂ en el aire", rangoTexto(tMa), modoCol)}
          {lectura("Escudo de ozono", `${Math.round(ozono * 100)} %`, "#c4b5fd")}
        </div>
        <div className="ox-opts" style={{ marginTop: 10 }}>
          <button className="ox-opt" data-on="false" onClick={() => irHito(-1)} disabled={tMa >= T_MAX_MA} style={{ ["--oxc" as string]: modoCol }}>
            <i className="fa-solid fa-backward-step" style={{ marginRight: 8 }} />
            Hito anterior
          </button>
          <button className="ox-opt ox-sig" data-on="true" onClick={() => irHito(1)} disabled={tMa <= 0} style={{ ["--oxc" as string]: modoCol, background: `${modoCol}1f` }}>
            Siguiente hito
            <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
          </button>
          <button className="ox-opt ox-uv" data-on={uv} onClick={toggleUv} style={{ ["--oxc" as string]: "#c084fc", background: uv ? "rgba(192,132,252,0.16)" : "transparent" }}>
            <i className="fa-solid fa-sun" style={{ marginRight: 8 }} />
            {uv ? "Ocultar rayos UV" : "Mostrar rayos UV"}
          </button>
        </div>
        <div style={{ marginTop: 10, padding: "11px 13px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: "rgba(4,10,22,0.45)" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: modoCol, marginBottom: 4 }}>
            <i className={`fa-solid ${hito.icono}`} style={{ marginRight: 7 }} />
            {hito.etq}
          </div>
          <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>{hito.texto}</div>
        </div>
        {uv && nota(ozono < 0.1 ? "Sin capa de ozono, casi todo el UV llega a la superficie: la vida solo podía prosperar protegida bajo el agua o en tapetes microbianos." : ozono > 0.9 ? "La capa de ozono absorbe casi todo el UV dañino antes de que llegue al suelo: así la vida pudo colonizar la tierra firme." : "La capa de ozono aún es delgada: detiene parte del UV, pero no todo.", ozono > 0.9 ? OK : "#c4b5fd", "fa-shield-halved")}

        {sub("¿Por qué importa el O₂ para la vida? Energía por glucosa")}
        <div style={{ display: "grid", gap: 6 }}>
          {[
            { etq: "Fermentación (sin O₂)", v: 2, txt: "2 ATP", col: "#a8a29e" },
            { etq: "Respiración aerobia (con O₂)", v: 31, txt: "~30–32 ATP", col: "#34d399" },
          ].map((b) => (
            <div key={b.etq} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: T.text2, width: 170 }}>{b.etq}</span>
              <div style={{ flex: 1, height: 9, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${(b.v / 32) * 100}%`, height: "100%", background: b.col }} />
              </div>
              <span style={{ width: 74, textAlign: "right", fontSize: 11.5, color: "#fff", fontWeight: 800, ...NUM }}>{b.txt}</span>
            </div>
          ))}
        </div>

        {sub("Lee la gráfica")}
        <div style={{ display: "grid", gap: 12 }}>
          {PREGUNTAS_GRAFICA.map((q, i) => {
            const r = respuestas[i];
            const bien = r === q.correcta;
            return (
              <div key={i}>
                <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 6 }}>
                  {i + 1}. {q.pregunta}
                </div>
                <div className="ox-opts">
                  {q.opciones.map((op, j) => {
                    const on = r === j;
                    const col = on ? (bien ? OK : WARN) : modoCol;
                    return (
                      <button key={j} className={`ox-opt ox-graf-${i}`} data-on={on} onClick={() => responderGrafica(i, j)} disabled={bien} style={{ ["--oxc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                        {op}
                      </button>
                    );
                  })}
                </div>
                {r !== null && nota(bien ? q.porque : "Todavía no. Mueve la línea del tiempo y observa la banda.", bien ? OK : WARN, bien ? "fa-circle-check" : "fa-rotate-left")}
              </div>
            );
          })}
        </div>
      </>
    );
  } else {
    const etqEspecie = [el.reactivo.formula, "O₂", el.producto.formula];
    control = (
      <>
        <div className="ox-opts">
          {ELEMENTOS.map((e) => (
            <button key={e.id} className="ox-opt ox-el" data-on={e.id === elId} onClick={() => elegirElemento(e.id)} style={{ ["--oxc" as string]: e.tipo === "metal" ? "#60a5fa" : WARN, background: e.id === elId ? `${e.tipo === "metal" ? "#60a5fa" : WARN}1f` : "transparent" }}>
              {e.etq} ({e.simbolo}) · {e.tipo}
              {balanceados.has(e.id) && <i className="fa-solid fa-scale-balanced" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>

        {sub("1 · Balancea la ecuación")}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "12px 12px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
          {([0, 1, 2] as const).map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {k === 1 && <span style={{ color: T.text3, fontWeight: 900 }}>+</span>}
              {k === 2 && <span style={{ color: T.text3, fontWeight: 900 }}>→</span>}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button className="ox-step" onClick={() => cambiarCoef(k, 1)} disabled={fase !== "listo" || coef[k] >= COEF_MAX} aria-label={`Aumentar coeficiente de ${etqEspecie[k]}`}>
                  <i className="fa-solid fa-chevron-up" />
                </button>
                <span className="ox-coef" style={{ fontSize: 17, fontWeight: 900, color: modoCol, ...NUM }}>
                  {coef[k]}
                </span>
                <button className="ox-step" onClick={() => cambiarCoef(k, -1)} disabled={fase !== "listo" || coef[k] <= 1} aria-label={`Disminuir coeficiente de ${etqEspecie[k]}`}>
                  <i className="fa-solid fa-chevron-down" />
                </button>
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>{etqEspecie[k]}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "4px 12px", marginTop: 10, fontSize: 12, ...NUM }}>
          <span style={{ color: T.text3, fontWeight: 800 }}>Átomos</span>
          <span style={{ color: T.text3, fontWeight: 800 }}>Reactivos</span>
          <span style={{ color: T.text3, fontWeight: 800 }}>Producto</span>
          {bal.elementos.map((s) => {
            const igual = (bal.izq[s] ?? 0) === (bal.der[s] ?? 0);
            return [
              <span key={`${s}a`} style={{ color: "#fff", fontWeight: 900 }}>{s}</span>,
              <span key={`${s}b`} style={{ color: revisado ? (igual ? OK : WARN) : "#fff", fontWeight: 800 }}>{bal.izq[s] ?? 0}</span>,
              <span key={`${s}c`} style={{ color: revisado ? (igual ? OK : WARN) : "#fff", fontWeight: 800 }}>{bal.der[s] ?? 0}</span>,
            ];
          })}
        </div>
        <div className="ox-opts" style={{ marginTop: 10 }}>
          <button className="ox-opt ox-revisar" data-on="true" onClick={revisarBalance} disabled={fase !== "listo"} style={{ ["--oxc" as string]: modoCol, background: `${modoCol}1f` }}>
            <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8 }} />
            Revisar el balance
          </button>
        </div>
        {revisado &&
          fase === "listo" &&
          nota(
            bal.balanceada && bal.minima
              ? `Balanceada: ${bal.elementos.map((s) => `${s} ${bal.izq[s]} = ${bal.der[s]}`).join(", ")}. Se conserva la materia.`
              : bal.balanceada
                ? "Los átomos coinciden, pero se puede simplificar: usa los coeficientes enteros más pequeños."
                : `Aún no: ${bal.elementos.filter((s) => (bal.izq[s] ?? 0) !== (bal.der[s] ?? 0)).map((s) => `${s} ${bal.izq[s] ?? 0} ≠ ${bal.der[s] ?? 0}`).join(", ")}.`,
            bal.balanceada && bal.minima ? OK : WARN,
            bal.balanceada && bal.minima ? "fa-circle-check" : "fa-rotate-left",
          )}

        {sub("2 · Provoca la reacción")}
        <div style={{ display: "grid", gap: 8, opacity: listoParaReaccion || fase !== "listo" ? 1 : 0.5 }}>
          <button className="ox-toggle ox-reaccionar" onClick={reaccionar} disabled={!listoParaReaccion || fase !== "listo"} style={{ ["--oxc" as string]: el.proceso === "combustion" ? "#fb923c" : "#b45309" }}>
            <i className={`fa-solid ${fase === "reaccionando" ? "fa-spinner fa-spin" : el.proceso === "combustion" ? "fa-fire-burner" : "fa-clock"}`} style={{ marginRight: 9, color: "#fb923c" }} />
            {fase === "reaccionando" ? (el.proceso === "combustion" ? "Ardiendo…" : "Oxidándose…") : fase === "listo" ? (el.proceso === "combustion" ? `Quemar la ${el.muestra} en el mechero` : "Dejar oxidar el clavo (cámara rápida)") : `Listo: ${el.nombreProducto}`}
          </button>
          <button className="ox-toggle ox-disolver" onClick={disolver} disabled={fase !== "reaccionado"} style={{ ["--oxc" as string]: "#22c55e" }}>
            <i className={`fa-solid ${fase === "disolviendo" ? "fa-spinner fa-spin" : "fa-flask"}`} style={{ marginRight: 9, color: "#22c55e" }} />
            {fase === "disolviendo" ? "Disolviendo…" : fase === "disuelto" ? `Disuelto · pH ${el.pHTexto}` : "Introducir en el frasco con agua e indicador"}
          </button>
        </div>
        {fase !== "listo" && fase !== "reaccionando" && nota(el.observacion, T.text2, "fa-eye")}

        {sub("3 · Clasifica el óxido")}
        <div className="ox-opts" style={{ opacity: fase === "disuelto" ? 1 : 0.5 }}>
          {(["basico", "acido"] as const).map((c) => {
            const on = clasif === c;
            const col = on ? (c === el.clase ? OK : WARN) : modoCol;
            return (
              <button key={c} className="ox-opt ox-clase" data-on={on} onClick={() => clasificar(c)} disabled={fase !== "disuelto" || clasif === el.clase} style={{ ["--oxc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                {CLASE_ETQ[c]}
              </button>
            );
          })}
        </div>
        {fase === "disuelto" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: colorPH(el.pH), border: "1px solid rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize: 12, color: T.text2 }}>
              Indicador universal: pH <strong style={{ color: "#fff" }}>{el.pHTexto}</strong> ({el.pH < 7 ? "ácido" : el.pH > 7 ? "básico" : "casi neutro"})
            </span>
          </div>
        )}
        {clasif && nota(clasif === el.clase ? el.explica : `No. El ${el.etq.toLowerCase()} es un ${el.tipo}: ¿qué tipo de óxido forma?`, clasif === el.clase ? OK : WARN, clasif === el.clase ? "fa-circle-check" : "fa-rotate-left")}
        {clasif === el.clase && el.id === "s" && nota("Los óxidos de azufre y de nitrógeno que emiten autos e industrias forman ácidos en el agua de la atmósfera: la lluvia ácida (pH menor de 5.6).", "#fdba74", "fa-cloud-rain")}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Reacciones reales; los pH son aproximados para una disolución de laboratorio escolar. El azufre y el calcio se queman solo con equipo de protección y en campana.</div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes oxPulse { 0%,100%{ box-shadow:0 0 0 0 var(--oxd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ox-live-dot { animation: oxPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .ox-live-dot { animation:none; } }
        .ox-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ox-grid { grid-template-columns: 1fr; } }
        .ox-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ox-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ox-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ox-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ox-tab { cursor:pointer; border:1px solid var(--oxc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .ox-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ox-tab:hover { background:rgba(255,255,255,0.06); }
        .ox-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .ox-opt { cursor:pointer; border:1px solid var(--oxc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .ox-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .ox-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ox-opt:disabled { cursor:default; }
        .ox-opt:disabled[data-on="false"] { opacity:0.55; }
        .ox-toggle { cursor:pointer; border:1px solid var(--oxc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ox-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ox-toggle:disabled { cursor:default; opacity:0.6; }
        .ox-range { flex:1; min-width:0; accent-color: var(--oxc); }
        .ox-step { cursor:pointer; width:30px; height:20px; border-radius:6px; border:1px solid rgba(255,255,255,0.16); background:rgba(255,255,255,0.04); color:#fff; font-size:10px; }
        .ox-step:hover:not(:disabled) { border-color:${accent}; }
        .ox-step:disabled { opacity:0.35; cursor:default; }
        .ox-opt:focus-visible, .ox-tab:focus-visible, .ox-toggle:focus-visible, .ox-icobtn:focus-visible, .ox-range:focus-visible, .ox-step:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .ox-bottom { grid-template-columns: 1fr !important; } }
        .ox-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ox-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ox-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .ox-drawer[data-open="true"] { transform:translateX(0); }
        .ox-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ox-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ox-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ox-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ox-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ox-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ox-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ox-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--oxc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="ox-grid">
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
              <OxigenacionScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                P={P}
                S={S}
                corriendo={corriendo}
                fe={mar.fe}
                aire={mar.aire}
                producido={mar.producido}
                depositado={mar.depositado}
                flujoFe={mar.flujoFe}
                flujoAire={mar.flujoAire}
                tMa={tMa}
                uv={uv}
                elementoId={elId}
                fase={fase}
                coefTexto={ecuacion(el, coef)}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="ox-live-dot" style={{ ["--oxd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ox-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ox-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ox-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="ox-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 12 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-lungs" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿De dónde salió el oxígeno que respiras?</div>
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
              <span className="ox-obj-cuenta" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ox-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />
              En México
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{MEXICO}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (video A8)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS_A8.map((h, i) => (
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
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
          La lectura A1 con sus preguntas, el ejercicio A2, el quiz A4, el glosario A5, el texto A6 y las preguntas del video A8 son <strong>verbatim</strong> del material de la plataforma. El mar
          primitivo es un <strong>modelo ilustrativo</strong> en unidades relativas, con la estequiometría real de la oxidación del hierro (4 Fe²⁺ por O₂). La curva de O₂ resume rangos
          publicados (Lyons, Reinhard y Planavsky, 2014, <em>Nature</em> 506: 307-315; reconstrucciones del Fanerozoico) e interpola entre ellos; el porcentaje de escudo de ozono es
          cualitativo. Las fechas de los hitos siguen la literatura geológica (explosión cámbrica: 538.8 Ma, Comisión Internacional de Estratigrafía). Las reacciones son reales y los pH,
          aproximados. Fuente: {FUENTE}
        </span>
      </div>

      <ClasificaOxidosCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={retoOk} onAprobado={() => setRetoOk(true)} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizOk} onAprobado={() => setQuizOk(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes de dónde viene el oxígeno y cómo reacciona." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto
            data={HUECOS_A6}
            accent={accent}
            rgba={color.rgba}
            completado={textoOk}
            onCompletado={() => {
              setTextoOk(true);
              sfx(true);
            }}
            onAcierto={blip}
            onError={() => sfx(false)}
          />
        </div>
      </div>

      <div className="ox-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ox-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ox-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ox-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ox-drawer-body">
          <FichaTeorica data={OXIGENACION_ATMOSFERA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
