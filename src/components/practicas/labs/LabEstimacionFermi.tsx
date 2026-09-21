"use client";

/**
 * Laboratorio 3D — "Estimación y órdenes de magnitud".
 * Práctica experimental de la progresión 10 de Pensamiento Matemático I
 * (actividades PM-I-P07). Anclas: ejercicio A2 «¿Es razonable este
 * resultado?» (reto numérico y casos del modo 3), quiz A4 y texto A6. El marco
 * teórico es la lectura A1, los hechos salen del verdadero/falso A5 y la
 * reflexión del A3; la tarjeta de estrellas es contrarreloj como el reto A9.
 *
 * Tres modos:
 *  (1) Problemas de Fermi — descomponer una cantidad enorme en factores,
 *      estimarlos con su incertidumbre, verla construirse en 3D y compararla
 *      con el dato real en una regla logarítmica.
 *  (2) Redondear y truncar — predecir a qué múltiplo llega un número y soltar
 *      la canica en la pista; estimar productos con números redondos.
 *  (3) ¿Es razonable? — estimar mentalmente, dictaminar un resultado y
 *      diagnosticar el error (punto decimal, unidades u operación).
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
import { ESTIMACION_FERMI_FICHA } from "./estimacion-fermi-ficha";
import type { VistaFermi } from "./EstimacionFermiScene";
import {
  type Modo,
  type VisualFermi,
  type Duda,
  type Metodo,
  type TipoError,
  MODOS,
  MODOS_DEF,
  PROBLEMAS,
  DUDAS,
  calcularFermi,
  rangoFermi,
  errorOrdenes,
  veredictoFermi,
  valorLog,
  indiceLog,
  NUMEROS,
  vecinos,
  resultadoMetodo,
  explicaMetodo,
  decimalesDe,
  OPERACIONES,
  errorRelativo,
  CASOS,
  TIPOS_ERROR,
  esRazonable,
  estimacionBuena,
  CANTIDADES,
  SEGUNDOS_POR_REACTIVO,
  rondaOrdenes,
  exponente,
  estrellasPorErrores,
  mulberry32,
  num,
  cient,
  cantidad,
  sup,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  PREGUNTAS,
  HECHOS,
  REFLEXION_A3,
  GLOSARIO,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A4,
  HUECOS_A6,
  RETO_A2,
} from "./estimacion-fermi-data";

const EstimacionScene = dynamic(() => import("./EstimacionFermiScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-cubes-stacked fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el laboratorio de estimación en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-estimacion-fermi-reto";
const WARN = "#FF8A3C";
const T_RODAR = 2300;
const RONDA_INICIAL = rondaOrdenes(mulberry32(7));

type Revelado = { est: number; lo: number; hi: number; err: number } | null;

const inicialesFermi = (): Record<VisualFermi, number[]> => ({
  salon: PROBLEMAS[0]!.factores.map((f) => f.inicial),
  costal: PROBLEMAS[1]!.factores.map((f) => f.inicial),
  agua: PROBLEMAS[2]!.factores.map((f) => f.inicial),
});
const dudasIniciales = (): Record<VisualFermi, Duda[]> => ({
  salon: PROBLEMAS[0]!.factores.map(() => "dudoso"),
  costal: PROBLEMAS[1]!.factores.map(() => "dudoso"),
  agua: PROBLEMAS[2]!.factores.map(() => "dudoso"),
});

/* ── Tarjeta de estrellas: ¿qué orden de magnitud? (contrarreloj) ──────── */
function OrdenCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<{ txt: string; ok: boolean } | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const [activo, setActivo] = useState(false);
  const [restante, setRestante] = useState(SEGUNDOS_POR_REACTIVO);
  const actual = ronda[pos] ?? ronda[0]!;
  const cant = CANTIDADES[actual.idx]!;

  const siguiente = (nuevosErrores: number) => {
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(nuevosErrores);
      setResuelto(est);
      onResultado(est);
    } else {
      setPos((p) => p + 1);
      setRestante(SEGUNDOS_POR_REACTIVO);
    }
  };

  useEffect(() => {
    if (!activo || resuelto !== null) return;
    const id = window.setTimeout(() => {
      if (restante > 1) {
        setRestante(restante - 1);
        return;
      }
      const e = errores + 1;
      setErrores(e);
      setAviso({ txt: `Se acabó el tiempo. Era 10${sup(exponente(cant.valor))}: ${cant.explica}`, ok: false });
      playSfx?.(false);
      if (pos + 1 >= ronda.length) {
        const est = estrellasPorErrores(e);
        setResuelto(est);
        onResultado(est);
      } else {
        setPos(pos + 1);
        setRestante(SEGUNDOS_POR_REACTIVO);
      }
    }, 1000);
    return () => window.clearTimeout(id);
  }, [activo, resuelto, restante, errores, pos, ronda, cant, onResultado, playSfx]);

  const responder = (exp: number) => {
    if (resuelto !== null || !activo) return;
    const correcto = exponente(cant.valor);
    const ok = exp === correcto;
    playSfx?.(ok);
    const e = ok ? errores : errores + 1;
    if (!ok) setErrores(e);
    setAviso({ txt: `${ok ? "¡Bien!" : `Era 10${sup(correcto)}.`} ${cant.explica}`, ok });
    siguiente(e);
  };
  const otra = () => {
    setRonda(rondaOrdenes(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
    setRestante(SEGUNDOS_POR_REACTIVO);
    setActivo(true);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Qué orden de magnitud? · contrarreloj
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {!activo ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, maxWidth: 560 }}>
            Seis cantidades reales. Para cada una elige su orden de magnitud (la potencia de 10 de su notación científica) antes de que pasen {SEGUNDOS_POR_REACTIVO} segundos, como en el reto contrarreloj A9. No calcules: estima.
          </div>
          <button className="ef-opt ef-empezar" data-on="true" onClick={() => setActivo(true)} style={{ ["--efc" as string]: accent, background: `rgba(${rgba},0.16)` }}>
            <i className="fa-solid fa-stopwatch" style={{ marginRight: 8 }} />
            Empezar
          </button>
        </div>
      ) : resuelto === null ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>
              Cantidad {pos + 1} de {ronda.length} · errores: {errores}
            </span>
            <span style={{ fontSize: 12, fontWeight: 900, color: restante <= 5 ? WARN : "#fff", ...NUM }}>
              <i className="fa-solid fa-stopwatch" style={{ marginRight: 6 }} />
              {restante} s
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${(restante / SEGUNDOS_POR_REACTIVO) * 100}%`, background: restante <= 5 ? WARN : accent, transition: "width 1s linear" }} />
          </div>
          <div className="ef-orden-q" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            {cant.texto}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {actual.opciones.map((x) => (
              <button key={x} className="ef-opt ef-orden" data-on="true" onClick={() => responder(x)} style={{ ["--efc" as string]: accent, minWidth: 74, fontSize: 15, ...NUM }}>
                10{sup(x)}
              </button>
            ))}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 12, color: aviso.ok ? OK : WARN, lineHeight: 1.5 }}>{aviso.txt}</div>}
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

export function LabEstimacionFermi({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("fermi");

  // ── Fermi
  const [problemaId, setProblemaId] = useState<VisualFermi>("salon");
  const [valores, setValores] = useState<Record<VisualFermi, number[]>>(inicialesFermi);
  const [dudas, setDudas] = useState<Record<VisualFermi, Duda[]>>(dudasIniciales);
  const [revelados, setRevelados] = useState<Record<VisualFermi, Revelado>>({ salon: null, costal: null, agua: null });
  const [fermiOrden, setFermiOrden] = useState<Set<VisualFermi>>(() => new Set());
  const [dentroRango, setDentroRango] = useState(false);

  // ── Redondeo
  const [subR, setSubR] = useState<"numero" | "operacion">("numero");
  const [numIdx, setNumIdx] = useState(0);
  const [metodo, setMetodo] = useState<Metodo>("redondear");
  const [prediccion, setPrediccion] = useState<number | null>(null);
  const [soltado, setSoltado] = useState(false);
  const [rodado, setRodado] = useState(false);
  const [redondeosOk, setRedondeosOk] = useState<Set<string>>(() => new Set());
  const [truncOk, setTruncOk] = useState(false);
  const [opIdx, setOpIdx] = useState(0);
  const [elegidos, setElegidos] = useState<Record<string, [number, number]>>(() => Object.fromEntries(OPERACIONES.map((o) => [o.id, [o.a, o.b] as [number, number]])));
  const [opsOk, setOpsOk] = useState<Set<string>>(() => new Set());

  // ── Razonable
  const [casoIdx, setCasoIdx] = useState(0);
  const [estTexto, setEstTexto] = useState("");
  const [estimacionAlumno, setEstimacionAlumno] = useState<number | null>(null);
  const [veredicto, setVeredicto] = useState<boolean | null>(null);
  const [tipo, setTipo] = useState<TipoError | null>(null);
  const [casosOk, setCasosOk] = useState<Set<string>>(() => new Set());
  const [casosVistos, setCasosVistos] = useState<Set<string>>(() => new Set());
  const [tiposOk, setTiposOk] = useState<Set<TipoError>>(() => new Set());

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [retoAprobado, setRetoAprobado] = useState(false);
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
    };
  }, []);

  const despues = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const sfx = useCallback(
    (ok: boolean) => {
      if (!sonido) return;
      if (ok) audioRef.current?.correcto();
      else audioRef.current?.incorrecto();
    },
    [sonido],
  );

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Fermi ─────────────────────────────────────────────────────────── */
  const problema = PROBLEMAS.find((p) => p.id === problemaId)!;
  const vals = valores[problemaId];
  const dudasP = dudas[problemaId];
  const estimacion = calcularFermi(problema, vals);
  const rango = rangoFermi(problema, vals, dudasP);
  const revelado = revelados[problemaId];

  const moverFactor = (i: number, v: number) => {
    setValores((r) => ({ ...r, [problemaId]: r[problemaId].map((x, k) => (k === i ? v : x)) }));
  };
  const cambiarDuda = (i: number, d: Duda) => {
    setDudas((r) => ({ ...r, [problemaId]: r[problemaId].map((x, k) => (k === i ? d : x)) }));
    blip();
  };
  const revelar = () => {
    if (revelado) return;
    const err = errorOrdenes(estimacion, problema.real);
    setRevelados((r) => ({ ...r, [problemaId]: { est: estimacion, lo: rango[0], hi: rango[1], err } }));
    const bien = Math.abs(err) < 1;
    if (bien) setFermiOrden((s) => new Set(s).add(problemaId));
    if (rango[0] <= problema.real && problema.real <= rango[1]) setDentroRango(true);
    sfx(bien);
  };
  const nuevoIntento = () => {
    setRevelados((r) => ({ ...r, [problemaId]: null }));
    blip();
  };
  const elegirProblema = (id: VisualFermi) => {
    setProblemaId(id);
    blip();
  };

  /* ── Redondeo ──────────────────────────────────────────────────────── */
  const ej = NUMEROS[numIdx]!;
  const [abajo, arriba] = vecinos(ej.valor, ej.paso);
  const resEj = resultadoMetodo(ej, metodo);
  const dEj = decimalesDe(ej.paso);
  const acierto = prediccion !== null && Math.abs(prediccion - resEj) < ej.paso * 1e-6;
  const difierenMetodos = resultadoMetodo(ej, "redondear") !== resultadoMetodo(ej, "truncar");

  const elegirNumero = (i: number) => {
    setNumIdx(i);
    setPrediccion(null);
    setSoltado(false);
    setRodado(false);
    blip();
  };
  const elegirMetodo = (m: Metodo) => {
    setMetodo(m);
    setPrediccion(null);
    setSoltado(false);
    setRodado(false);
    blip();
  };
  const predecir = (v: number) => {
    if (soltado) return;
    setPrediccion(v);
    blip();
  };
  const soltar = () => {
    if (prediccion === null || soltado) return;
    setSoltado(true);
    setRodado(false);
    const ok = acierto;
    const id = ej.id;
    const m = metodo;
    const difieren = difierenMetodos;
    despues(T_RODAR, () => {
      setRodado(true);
      sfx(ok);
      if (ok && m === "redondear") setRedondeosOk((s) => new Set(s).add(id));
      if (ok && m === "truncar" && difieren) setTruncOk(true);
    });
  };
  const otraVez = () => {
    setPrediccion(null);
    setSoltado(false);
    setRodado(false);
  };

  const op = OPERACIONES[opIdx]!;
  const [elA, elB] = elegidos[op.id] ?? [op.a, op.b];
  const exactoOp = op.a * op.b;
  const estimadoOp = elA * elB;
  const errOp = errorRelativo(estimadoOp, exactoOp);
  const redondos = elA !== op.a || elB !== op.b;
  const elegirFactor = (cual: 0 | 1, v: number) => {
    const nuevo: [number, number] = cual === 0 ? [v, elB] : [elA, v];
    setElegidos((r) => ({ ...r, [op.id]: nuevo }));
    const e = errorRelativo(nuevo[0] * nuevo[1], exactoOp);
    if ((nuevo[0] !== op.a || nuevo[1] !== op.b) && e < 0.05) {
      if (!opsOk.has(op.id)) sfx(true);
      setOpsOk((s) => new Set(s).add(op.id));
    } else blip();
  };

  /* ── Razonable ─────────────────────────────────────────────────────── */
  const caso = CASOS[casoIdx]!;
  const dictaminado = veredicto !== null && (veredicto || tipo !== null);
  const correctoVer = veredicto === esRazonable(caso);
  const correctoTipo = esRazonable(caso) ? true : tipo === caso.error;
  const casoBien = dictaminado && correctoVer && correctoTipo;

  const fijarEstimacion = () => {
    const v = Number(estTexto.replace(/[\s,$]/g, ""));
    if (!estTexto.trim() || !Number.isFinite(v) || v <= 0) return;
    setEstimacionAlumno(v);
    blip();
  };
  const cerrarCaso = (ver: boolean, t: TipoError | null) => {
    const bien = ver === esRazonable(caso) && (esRazonable(caso) || t === caso.error);
    sfx(bien);
    setCasosVistos((s) => new Set(s).add(caso.id));
    if (bien) {
      setCasosOk((s) => new Set(s).add(caso.id));
      if (caso.error !== "ninguno") setTiposOk((s) => new Set(s).add(caso.error));
    }
  };
  const dictaminar = (razonable: boolean) => {
    if (veredicto !== null || estimacionAlumno === null) return;
    setVeredicto(razonable);
    if (razonable) cerrarCaso(true, null);
    else blip();
  };
  const diagnosticar = (t: TipoError) => {
    if (veredicto !== false || tipo !== null) return;
    setTipo(t);
    cerrarCaso(false, t);
  };
  const elegirCaso = (i: number) => {
    setCasoIdx(i);
    setEstTexto("");
    setEstimacionAlumno(null);
    setVeredicto(null);
    setTipo(null);
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "fermi") {
      setValores((r) => ({ ...r, [problemaId]: problema.factores.map((f) => f.inicial) }));
      setRevelados((r) => ({ ...r, [problemaId]: null }));
    }
    if (modo === "redondeo") otraVez();
    if (modo === "razonable") elegirCaso(casoIdx);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Estimar dos problemas de Fermi a menos de un orden de magnitud del dato real", done: fermiOrden.size >= 2 },
    { t: "Que el dato real quede dentro de tu rango de incertidumbre", done: dentroRango },
    { t: "Redondear bien cinco números, prediciendo antes de soltar la canica", done: redondeosOk.size >= 5 },
    { t: "Truncar bien un número en el que truncar y redondear no coinciden", done: truncOk },
    { t: "Estimar las tres operaciones con números redondos y error menor al 5 %", done: opsOk.size === OPERACIONES.length },
    { t: "Dictaminar bien seis resultados", done: casosOk.size >= 6 },
    { t: "Diagnosticar los tres tipos de error: punto decimal, unidades y operación", done: tiposOk.size === 3 },
    { t: "Ganar estrellas en «¿Qué orden de magnitud?»", done: identifico },
    { t: "Resolver el ejercicio A2", done: retoAprobado },
    { t: "Aprobar el quiz evaluable (A4)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaFermi = modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "fermi") {
    chipVivo = `${problema.titulo.toLowerCase()} · ≈ ${cient(estimacion)}${revelado ? ` · real ${cient(problema.real)}` : ""}`;
    pie = revelado ? `${veredictoFermi(revelado.err).explica} ${problema.leccion}` : `${problema.pregunta} ${problema.formula}.`;
  } else if (modo === "redondeo") {
    if (subR === "numero") {
      chipVivo = `${metodo === "redondear" ? "redondear" : "truncar"} ${num(ej.valor, ej.dec)} ${ej.lugar}${rodado ? ` → ${num(resEj, dEj)}` : soltado ? " · rodando…" : ""}`;
      pie = rodado ? explicaMetodo(ej, metodo) : metodo === "redondear" ? "La pista tiene un valle en cada múltiplo y una cima a la mitad: la canica rueda al múltiplo más cercano. Predice a cuál llega y suéltala." : "Truncar es una rampa hacia el cero: la canica siempre baja al múltiplo más cercano al cero, sin importar las cifras que siguen.";
    } else {
      chipVivo = `${num(elA, op.decA)} × ${num(elB, op.decB)} ≈ ${num(estimadoOp, op.decB)} · error ${num(errOp * 100, 1)} %`;
      pie =
        op.id === "cuadrado" && elA === 50 && elB === 50
          ? "49 subió a 50 y 51 bajó a 50: los errores se compensan y la estimación (2,500) queda a 1 del resultado exacto (2,499)."
          : "La losa gris es el producto exacto; la morada, el producto con números redondos. Lo que sobra o falta entre ambas es el error de tu estimación.";
    }
  } else {
    chipVivo = `${caso.etq.toLowerCase()} · dado ${caso.dadoTexto}${dictaminado ? (casoBien ? " · bien dictaminado" : " · revisa") : ""}`;
    pie = dictaminado ? caso.explica : estimacionAlumno === null ? `${caso.enunciado} Primero haz tu estimación mental.` : `${caso.enunciado} ¿Tiene sentido comparado con tu estimación?`;
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

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "fermi") {
    const ver = revelado ? veredictoFermi(revelado.err) : null;
    control = (
      <>
        <div className="ef-opts">
          {PROBLEMAS.map((p) => (
            <button key={p.id} className="ef-opt ef-prob" data-on={p.id === problemaId} onClick={() => elegirProblema(p.id)} style={{ ["--efc" as string]: modoCol, background: p.id === problemaId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${p.icono}`} style={{ marginRight: 8 }} />
              {p.titulo}
              {fermiOrden.has(p.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 14.5, color: "#fff", fontWeight: 900, lineHeight: 1.45 }}>{problema.pregunta}</div>
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 4, ...NUM }}>{problema.formula}</div>
        {sub("1 · Estima cada factor y di qué tan seguro estás")}
        <div style={{ display: "grid", gap: 10 }}>
          {problema.factores.map((f, i) => {
            const v = vals[i]!;
            return (
              <div key={f.id} style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff" }}>{f.etq}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: modoCol, ...NUM }}>
                    {f.unidad === "×" ? `× ${num(v, f.dec)}` : `${num(v, f.dec)} ${f.unidad}`}
                  </span>
                </div>
                {f.fijo ? (
                  <div style={{ fontSize: 11.5, color: T.text3, marginTop: 4 }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: 6 }} />
                    Dato del problema: no se estima.
                  </div>
                ) : (
                  <>
                    <input
                      type="range"
                      className="ef-range"
                      aria-label={`${f.etq} (${f.unidad})`}
                      min={f.log ? 0 : f.min}
                      max={f.log ? f.paso : f.max}
                      step={f.log ? 1 : f.paso}
                      value={f.log ? indiceLog(f, v) : v}
                      onChange={(e) => moverFactor(i, f.log ? Number(valorLog(f, Number(e.target.value)).toPrecision(2)) : Number(e.target.value))}
                      style={{ ["--efc" as string]: modoCol, width: "100%", marginTop: 6 }}
                    />
                    <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4 }}>
                      <i className="fa-regular fa-lightbulb" style={{ marginRight: 6 }} />
                      {f.pista}
                    </div>
                    <div className="ef-opts" style={{ marginTop: 7 }}>
                      {DUDAS.map((d) => (
                        <button key={d.id} className="ef-chip" data-on={dudasP[i] === d.id} onClick={() => cambiarDuda(i, d.id)} style={{ ["--efc" as string]: modoCol }}>
                          {d.etq}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {revelado && (
                  <div style={{ fontSize: 11.5, color: T.text2, marginTop: 6, ...NUM }}>
                    <i className="fa-solid fa-flag-checkered" style={{ marginRight: 6, color: "#fbbf24" }} />
                    Referencia: {f.refTexto}
                    {!f.fijo && ` · tú: ${Math.abs(Math.log10(v / f.referencia)) < 0.05 ? "casi igual" : `${num(v >= f.referencia ? v / f.referencia : f.referencia / v, 1)} veces ${v >= f.referencia ? "más" : "menos"}`}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {sub("2 · Tu estimación")}
        <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12`, ...NUM }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
            ≈ {cient(estimacion)} {problema.unidad}
          </div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 4 }}>
            Rango con tus dudas: de {cient(rango[0])} a {cient(rango[1])} ({num(Math.log10(rango[1] / rango[0]), 1)} órdenes de magnitud de ancho)
          </div>
        </div>
        <div className="ef-opts" style={{ marginTop: 10 }}>
          {!revelado ? (
            <button className="ef-toggle ef-revelar" onClick={revelar} style={{ ["--efc" as string]: "#fbbf24" }}>
              <i className="fa-solid fa-flag-checkered" style={{ marginRight: 9, color: "#fbbf24" }} />
              Comprometer mi estimación y revelar el dato real
            </button>
          ) : (
            <button className="ef-toggle" onClick={nuevoIntento} style={{ ["--efc" as string]: modoCol }}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 9, color: modoCol }} />
              Nuevo intento (oculta el dato real)
            </button>
          )}
        </div>
        {revelado &&
          ver &&
          nota(
            <>
              <strong>{ver.etq}.</strong> Dato {problema.tipoReal === "medido" ? "real" : "de referencia"}: {cient(problema.real, 3)} {problema.unidad} ({problema.realTexto}). Estimaste {cient(revelado.est)}: error de {num(Math.abs(revelado.err), 2)} órdenes de magnitud. {ver.explica}{" "}
              {revelado.lo <= problema.real && problema.real <= revelado.hi ? "El dato cayó dentro de tu rango." : "El dato quedó fuera de tu rango: dudaste menos de lo que debías."}
              <div style={{ marginTop: 6, color: T.text3, fontSize: 11 }}>Fuente: {problema.fuente}</div>
            </>,
            ver.color,
            "fa-flag-checkered",
          )}
      </>
    );
  } else if (modo === "redondeo") {
    control = (
      <>
        <div className="ef-opts">
          <button className="ef-opt ef-sub" data-on={subR === "numero"} onClick={() => { setSubR("numero"); blip(); }} style={{ ["--efc" as string]: modoCol, background: subR === "numero" ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-circle-dot" style={{ marginRight: 8 }} />
            Redondear un número
          </button>
          <button className="ef-opt ef-sub" data-on={subR === "operacion"} onClick={() => { setSubR("operacion"); blip(); }} style={{ ["--efc" as string]: modoCol, background: subR === "operacion" ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-table-cells" style={{ marginRight: 8 }} />
            Estimar una operación
          </button>
        </div>
        {subR === "numero" ? (
          <>
            {sub("El número")}
            <div className="ef-opts">
              {NUMEROS.map((n, i) => (
                <button key={n.id} className="ef-opt ef-num" data-on={i === numIdx} onClick={() => elegirNumero(i)} style={{ ["--efc" as string]: modoCol, background: i === numIdx ? `${modoCol}1f` : "transparent", ...NUM }}>
                  {num(n.valor, n.dec)}
                  {redondeosOk.has(n.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{ej.nota}</div>
            {sub("1 · Método")}
            <div className="ef-opts">
              {(["redondear", "truncar"] as Metodo[]).map((m) => (
                <button key={m} className="ef-opt ef-metodo" data-on={metodo === m} onClick={() => elegirMetodo(m)} style={{ ["--efc" as string]: modoCol, background: metodo === m ? `${modoCol}1f` : "transparent" }}>
                  <i className={`fa-solid ${m === "redondear" ? "fa-wave-square" : "fa-scissors"}`} style={{ marginRight: 8 }} />
                  {m === "redondear" ? "Redondear" : "Truncar"} {ej.lugar}
                </button>
              ))}
            </div>
            {sub(`2 · Predice: ¿a qué valor llega ${num(ej.valor, ej.dec)}?`)}
            <div className="ef-opts">
              {[abajo, arriba].map((v) => {
                const on = prediccion !== null && Math.abs(prediccion - v) < ej.paso * 1e-6;
                const col = rodado && on ? (acierto ? OK : WARN) : modoCol;
                return (
                  <button key={v} className="ef-opt ef-pred" data-on={on} onClick={() => predecir(v)} disabled={soltado} style={{ ["--efc" as string]: col, background: on ? `${col}1f` : "transparent", fontSize: 15, minWidth: 110, ...NUM }}>
                    {num(v, dEj)}
                  </button>
                );
              })}
            </div>
            {sub("3 · Suelta la canica")}
            <button className="ef-toggle ef-soltar" onClick={soltar} disabled={prediccion === null || soltado} style={{ ["--efc" as string]: modoCol }}>
              <i className={`fa-solid ${soltado && !rodado ? "fa-spinner fa-spin" : "fa-hand-pointer"}`} style={{ marginRight: 9, color: modoCol }} />
              {soltado ? (rodado ? `Llegó a ${num(resEj, dEj)}` : "Rodando…") : prediccion === null ? "Primero haz tu predicción" : "Soltar la canica"}
            </button>
            {rodado &&
              nota(
                <>
                  {acierto ? "¡Predicción correcta! " : `Llegó a ${num(resEj, dEj)}, no a ${num(prediccion ?? 0, dEj)}. `}
                  {explicaMetodo(ej, metodo)}
                  {difierenMetodos && ` ${metodo === "redondear" ? "Truncando" : "Redondeando"} habría quedado ${num(resultadoMetodo(ej, metodo === "redondear" ? "truncar" : "redondear"), dEj)}.`}
                </>,
                acierto ? OK : WARN,
                acierto ? "fa-circle-check" : "fa-rotate-left",
              )}
            {rodado && (
              <div className="ef-opts" style={{ marginTop: 10 }}>
                <button className="ef-opt ef-sig" data-on="true" onClick={() => elegirNumero((numIdx + 1) % NUMEROS.length)} style={{ ["--efc" as string]: modoCol }}>
                  <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
                  Siguiente número
                </button>
                <button className="ef-opt" data-on="false" onClick={otraVez} style={{ ["--efc" as string]: modoCol }}>
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                  Otra vez
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {sub("La operación")}
            <div className="ef-opts">
              {OPERACIONES.map((o, i) => (
                <button key={o.id} className="ef-opt ef-op" data-on={i === opIdx} onClick={() => { setOpIdx(i); blip(); }} style={{ ["--efc" as string]: modoCol, background: i === opIdx ? `${modoCol}1f` : "transparent", ...NUM }}>
                  {o.etq}
                  {opsOk.has(o.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{op.fuente}</div>
            {([0, 1] as const).map((cual) => (
              <div key={cual}>
                {sub(`${cual === 0 ? "Redondea" : "Y redondea"} ${cual === 0 ? op.etqA : op.etqB}: ${num(cual === 0 ? op.a : op.b, cual === 0 ? op.decA : op.decB)}`)}
                <div className="ef-opts">
                  {(cual === 0 ? op.opcionesA : op.opcionesB).map((v) => {
                    const on = (cual === 0 ? elA : elB) === v;
                    const exacto = v === (cual === 0 ? op.a : op.b);
                    return (
                      <button key={v} className={`ef-opt ef-fac${cual}`} data-on={on} onClick={() => elegirFactor(cual, v)} style={{ ["--efc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent", minWidth: 80, ...NUM }}>
                        {num(v, cual === 0 ? op.decA : op.decB)}
                        {exacto && <span style={{ fontSize: 10, color: T.text3, marginLeft: 6 }}>(exacto)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, ...NUM }}>
              {[
                { l: "Exacto", v: num(exactoOp, op.decB), c: "#cbd5e1" },
                { l: "Estimado", v: num(estimadoOp, op.decB), c: modoCol },
                { l: "Error", v: `${num(errOp * 100, 1)} %`, c: redondos && errOp < 0.05 ? OK : errOp < 0.05 ? T.text2 : WARN },
              ].map((x) => (
                <div key={x.l} style={{ padding: "9px 8px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}`, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>{x.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: x.c, marginTop: 3 }}>{x.v}</div>
                </div>
              ))}
            </div>
            {!redondos
              ? nota("Con los dos factores exactos no estás estimando: elige números redondos que puedas multiplicar de memoria.", T.text3)
              : errOp < 0.05
                ? nota(`Buena estimación: ${num(elA, op.decA)} × ${num(elB, op.decB)} se calcula de memoria y queda a menos del 5 % del resultado exacto.${(elA - op.a) * (elB - op.b) < 0 ? " Un factor subió y el otro bajó: los errores se compensaron." : ""}`, OK, "fa-circle-check")
                : nota(`El error es de ${num(errOp * 100, 1)} %. ${elA < op.a && elB < op.b ? "Redondeaste los dos factores hacia abajo: los errores se suman." : elA > op.a && elB > op.b ? "Redondeaste los dos hacia arriba: los errores se suman." : "Prueba un redondeo más cercano en el factor que más cambió."}`, WARN, "fa-triangle-exclamation")}
          </>
        )}
      </>
    );
  } else {
    control = (
      <>
        <div className="ef-opts">
          {CASOS.map((c, i) => (
            <button key={c.id} className="ef-opt ef-caso" data-on={i === casoIdx} onClick={() => elegirCaso(i)} style={{ ["--efc" as string]: modoCol, background: i === casoIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${c.icono}`} style={{ marginRight: 7 }} />
              {c.etq}
              {casosOk.has(c.id) ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} /> : casosVistos.has(c.id) ? <i className="fa-solid fa-circle-xmark" style={{ marginLeft: 7, color: WARN }} /> : null}
            </button>
          ))}
        </div>
        {sub(`La situación · ${caso.fuente}`)}
        <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, lineHeight: 1.5 }}>{caso.enunciado}</div>
        {sub("1 · Tu estimación mental (sin calculadora)")}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="ef-input"
            inputMode="decimal"
            aria-label={`Tu estimación (${caso.unidad})`}
            placeholder="≈ ?"
            value={estTexto}
            disabled={veredicto !== null}
            onChange={(e) => setEstTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fijarEstimacion();
            }}
          />
          <span style={{ fontSize: 12.5, color: T.text2, fontWeight: 800, whiteSpace: "nowrap" }}>{caso.unidad}</span>
          <button className="ef-opt ef-fijar" data-on="true" onClick={fijarEstimacion} disabled={veredicto !== null} style={{ ["--efc" as string]: modoCol }}>
            Usar
          </button>
        </div>
        {estimacionAlumno !== null && nota(`Tu estimación: ${cantidad(estimacionAlumno)} ${caso.unidad}. Míralo en la pila izquierda y en el medidor.`, T.text2, "fa-brain")}
        {sub("2 · ¿El resultado dado es razonable?")}
        <div className="ef-opts" style={{ opacity: estimacionAlumno === null ? 0.45 : 1 }}>
          {[true, false].map((r) => {
            const on = veredicto === r;
            const col = on && dictaminado ? (r === esRazonable(caso) ? OK : WARN) : modoCol;
            return (
              <button key={String(r)} className="ef-opt ef-ver" data-on={on} onClick={() => dictaminar(r)} disabled={veredicto !== null || estimacionAlumno === null} style={{ ["--efc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${r ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginRight: 8 }} />
                {r ? "Es razonable" : "No es razonable"}
              </button>
            );
          })}
        </div>
        {veredicto === false && (
          <>
            {sub("3 · ¿Qué error se cometió?")}
            <div style={{ display: "grid", gap: 7 }}>
              {TIPOS_ERROR.map((t) => {
                const on = tipo === t.id;
                const col = on ? (t.id === caso.error ? OK : WARN) : tipo !== null && t.id === caso.error ? OK : modoCol;
                return (
                  <button key={t.id} className="ef-opt ef-tipo" data-on={on || (tipo !== null && t.id === caso.error)} onClick={() => diagnosticar(t.id)} disabled={tipo !== null} style={{ ["--efc" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}>
                    <i className={`fa-solid ${t.icono}`} style={{ marginRight: 8 }} />
                    {t.etq}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {dictaminado &&
          nota(
            <>
              <strong>{casoBien ? "¡Bien dictaminado! " : !correctoVer ? `En realidad ${esRazonable(caso) ? "sí es razonable" : "no es razonable"}. ` : `Bien visto que no es razonable, pero el error es: ${TIPOS_ERROR.find((t) => t.id === caso.error)?.etq.toLowerCase()}. `}</strong>
              Estimación guía: {caso.guia} {caso.explica}
              {estimacionAlumno !== null && (estimacionBuena(estimacionAlumno, caso.exacto) ? " Tu estimación mental quedó a menos del 25 % de la cuenta exacta." : ` Tu estimación quedó lejos de la cuenta exacta (${cantidad(caso.exacto)} ${caso.unidad}): practica con números redondos.`)}
            </>,
            casoBien ? OK : WARN,
            casoBien ? "fa-circle-check" : "fa-triangle-exclamation",
          )}
        {dictaminado && (
          <div className="ef-opts" style={{ marginTop: 10 }}>
            <button className="ef-opt ef-sigcaso" data-on="true" onClick={() => elegirCaso((casoIdx + 1) % CASOS.length)} style={{ ["--efc" as string]: modoCol }}>
              <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
              Siguiente caso
            </button>
            <button className="ef-opt" data-on="false" onClick={() => elegirCaso(casoIdx)} style={{ ["--efc" as string]: modoCol }}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
              Repetir
            </button>
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          Dictámenes bien hechos: {casosOk.size} de {CASOS.length}. Los precios de los casos nuevos son ilustrativos.
        </div>
      </>
    );
  }

  const [elASc, elBSc] = elegidos[op.id] ?? [op.a, op.b];

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes efPulse { 0%,100%{ box-shadow:0 0 0 0 var(--efd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ef-live-dot { animation: efPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .ef-live-dot { animation:none; } }
        .ef-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ef-grid { grid-template-columns: 1fr; } }
        .ef-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ef-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ef-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ef-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ef-tab { cursor:pointer; border:1px solid var(--efc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .ef-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ef-tab:hover { background:rgba(255,255,255,0.06); }
        .ef-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .ef-opt { cursor:pointer; border:1px solid var(--efc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .ef-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .ef-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ef-opt:disabled { cursor:default; }
        .ef-opt:disabled[data-on="false"] { opacity:0.55; }
        .ef-chip { cursor:pointer; border:1px solid rgba(255,255,255,0.14); border-radius:999px; padding:4px 10px; font-size:10.5px; font-weight:800; color:rgba(255,255,255,0.65); background:transparent; transition:all .15s; }
        .ef-chip[data-on="true"] { border-color:var(--efc); color:#fff; background:rgba(255,255,255,0.08); }
        .ef-toggle { width:100%; cursor:pointer; border:1px solid var(--efc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ef-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ef-toggle:disabled { cursor:default; opacity:0.75; }
        .ef-range { accent-color: var(--efc); }
        .ef-input { flex:1; min-width:0; box-sizing:border-box; border-radius:10px; border:1px solid ${T.line}; background:${T.inset}; color:#fff; font-size:16px; font-weight:900; padding:9px 12px; outline:none; font-variant-numeric:tabular-nums; }
        .ef-input:focus { border-color:${accent}; }
        .ef-opt:focus-visible, .ef-tab:focus-visible, .ef-toggle:focus-visible, .ef-icobtn:focus-visible, .ef-range:focus-visible, .ef-chip:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .ef-bottom { grid-template-columns: 1fr !important; } }
        .ef-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ef-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ef-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .ef-drawer[data-open="true"] { transform:translateX(0); }
        .ef-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ef-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ef-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ef-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ef-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ef-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ef-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ef-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--efc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="ef-grid">
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
              <EstimacionScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                problemaId={problemaId}
                valores={vals}
                estimacion={estimacion}
                rango={rango}
                real={revelado ? problema.real : null}
                subRedondeo={subR}
                numeroId={ej.id}
                metodo={metodo}
                soltado={soltado}
                prediccion={prediccion}
                operacionId={op.id}
                elegidoA={elASc}
                elegidoB={elBSc}
                casoId={caso.id}
                estimacionAlumno={estimacionAlumno}
                dictaminado={dictaminado}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="ef-live-dot" style={{ ["--efd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ef-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ef-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ef-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="ef-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-scale-unbalanced-flip" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Tiene sentido este número?</div>
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
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PREGUNTAS DE COMPRENSIÓN</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ef-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-landmark" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (verdadero o falso A5)
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
              Glosario del laboratorio
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: 8, color: accent }} />
              Para reflexionar (A3)
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 8 }}>{REFLEXION_A3.titulo}</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{REFLEXION_A3.prompt}</div>
            <ul style={{ margin: "10px 0 0", paddingLeft: 16, display: "grid", gap: 6 }}>
              {REFLEXION_A3.pistas.map((x, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45 }}>
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
          La lectura A1 con sus preguntas y su recuadro, el ejercicio A2 (problema, pasos y respuesta), la reflexión A3, el quiz A4, los hechos del A5 y el texto A6 son <strong>verbatim</strong> del material de la plataforma; las
          casillas del ejercicio A2 piden las estimaciones de sus pasos guía. Los datos reales están <strong>verificados</strong>: población de la CDMX (INEGI, Censo 2020), agua que entra a su red (32 000 L/s), consumo de 177 L por habitante y
          37 % de fugas (SACMEX), peso de mil granos de maíz (250–400 g), empaque aleatorio de esferas de 0.64 (Scott y Kilgour, 1969), Torre Latinoamericana de 182 m con antena y superficie de la CDMX (INEGI). El salón de 8 × 6 × 3 m es una
          medida de <strong>referencia</strong>, no una norma; los casos nuevos de «¿Es razonable?» son <strong>situaciones didácticas</strong> con cuentas exactas y precios ilustrativos (una dosis la indica siempre un médico). El rango
          de incertidumbre es pesimista: combina los extremos de todos los factores. Fuente: {FUENTE}
        </span>
      </div>

      <OrdenCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={retoAprobado} onAprobado={() => setRetoAprobado(true)} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes estimar y verificar resultados." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="ef-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ef-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ef-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ef-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ef-drawer-body">
          <FichaTeorica data={ESTIMACION_FERMI_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
