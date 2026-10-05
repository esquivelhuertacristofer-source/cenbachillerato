"use client";

/**
 * Laboratorio 3D — "Directions in town: ask for and give directions".
 * Práctica anclada a IN-II-P06 (Inglés II): «Pregunta cómo llegar a un lugar y
 * orienta a otras personas en su comunidad». El marco teórico es la lectura
 * A1; el reto evaluable reúne el verdadero/falso A4 y las preguntas del video
 * A9; el texto a completar es el A6 y el glosario el A5.
 *
 * Tres modos sobre un mismo barrio 3D:
 *  (1) Follow the directions — comprender indicaciones en inglés y llevar a
 *      Emma paso a paso; al final se valida si llegó y qué paso falló.
 *  (2) Give directions — escribir la ruta en inglés; Sam la ejecuta al pie de
 *      la letra y se explica qué indicación lo desvió.
 *  (3) Where is it? — armar la pregunta cortés con fichas y ubicar el lugar
 *      con next to / across from / between / on the corner of, validado contra
 *      el mapa.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import type { ObjetivoLab } from "./_objetivos";
import { hablarLab, callarLab } from "./lab-voz";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { CIUDAD_DIRECCIONES_FICHA } from "./ciudad-direcciones-ingles-ficha";
import type { RelacionDibujo } from "./CiudadDireccionesInglesScene";
import {
  type Modo,
  type Prim,
  type Prep,
  type Marco,
  type Referente,
  type CalleId,
  type Relacion,
  type VeredictoDar,
  MODOS,
  MODOS_DEF,
  MISIONES_COMP,
  TAREAS,
  RONDAS,
  BANCO_FRASES,
  CALLES,
  LUGARES,
  PREP_DEF,
  RUMBO_ES,
  PASO,
  aplicarPrim,
  estadosDe,
  evaluarSeguimiento,
  evaluarRuta,
  dividirIndicaciones,
  parseIndicacion,
  puntosRuta,
  calleActual,
  nombreEsquina,
  nombreEn,
  iconoDe,
  lugar,
  preguntaDe,
  unirFichas,
  revisarPregunta,
  respuestaDe,
  relacionVerdadera,
  explicaRelacionFalsa,
  rondaEnunciados,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  PREGUNTAS_A1,
  GLOSARIO,
  ACTIVIDAD_A5,
  A3,
  AUTOEVALUACION_A7,
  REFLEXION_A7,
  ABIERTA_A9,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ,
  HUECOS_A6,
  type EnunciadoMapa,
} from "./ciudad-direcciones-ingles-data";

const CiudadScene = dynamic(() => import("./CiudadDireccionesInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-city fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el barrio en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-ciudad-direcciones-ingles-reto";
const WARN = "#FF8A3C";
const COLOR_EMMA = "#38bdf8";
const COLOR_SAM = "#f59e0b";
const VEL = 3.6;
const RONDA_INICIAL = rondaEnunciados(mulberry32(11));
const PREPS_CLAVE: Prep[] = ["next", "across", "between", "corner"];
const REFERENTES: Referente[] = [...LUGARES.map((l) => l.id as Referente), "park", "busstop"];

function barajar<T>(xs: T[], semilla: number): T[] {
  const rnd = mulberry32(semilla);
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/* ── Tarjeta de estrellas: ¿es cierto en el mapa? ─────────────────────── */
function MapaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<EnunciadoMapa[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ronda[pos] ?? ronda[0]!;

  const responder = (cierto: boolean) => {
    if (resuelto !== null) return;
    const ok = cierto === actual.cierto;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(actual.porque);
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
          ¿Es cierto en el mapa?
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
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>Enunciado {pos + 1} de {ronda.length} · mira el barrio 3D (o el mapa de la ficha) y decide</div>
          <div className="cd-enunciado" style={{ fontSize: 16, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            «{actual.texto}»
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="cd-opt cd-vf" data-on="true" onClick={() => responder(true)} style={{ ["--cdc" as string]: OK }}>
              <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
              True: así está en el mapa
            </button>
            <button className="cd-opt cd-vf" data-on="true" onClick={() => responder(false)} style={{ ["--cdc" as string]: WARN }}>
              <i className="fa-solid fa-xmark" style={{ marginRight: 8 }} />
              False: no está así
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

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabCiudadDireccionesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("seguir");

  // ── Follow the directions
  const [misionIdx, setMisionIdx] = useState(0);
  const [prims, setPrims] = useState<Prim[]>([]);
  const [verSeg, setVerSeg] = useState<{ ok: boolean; msg: string; paso: number | null } | null>(null);
  const [misionesOk, setMisionesOk] = useState<Set<string>>(() => new Set());
  const [fallosMision, setFallosMision] = useState(0);
  const [sinErrores, setSinErrores] = useState(false);
  const [camSeguir, setCamSeguir] = useState(false);
  const [ayudaLados, setAyudaLados] = useState(false);
  const [animSeg, setAnimSeg] = useState(0);

  // ── Give directions
  const [tareaIdx, setTareaIdx] = useState(0);
  const [texto, setTexto] = useState("");
  const [banco, setBanco] = useState(false);
  const [verDar, setVerDar] = useState<VeredictoDar | null>(null);
  const [verDarVisible, setVerDarVisible] = useState(false);
  const [primsDar, setPrimsDar] = useState<Prim[]>([]);
  const [animDar, setAnimDar] = useState(0);
  const [tareasOk, setTareasOk] = useState<Set<string>>(() => new Set());
  const [fallosDar, setFallosDar] = useState(0);
  const [conReferencia, setConReferencia] = useState(false);
  const [sePerdio, setSePerdio] = useState(false);
  const [verNombres, setVerNombres] = useState(false);
  const corrida = useRef(0);

  // ── Where is it?
  const [rondaIdx, setRondaIdx] = useState(0);
  const [fichasSel, setFichasSel] = useState<number[]>([]);
  const [pregFb, setPregFb] = useState<{ ok: boolean; msg: string } | null>(null);
  const [prep, setPrep] = useState<Prep>("next");
  const [refA, setRefA] = useState<Referente | "">("");
  const [refB, setRefB] = useState<Referente | "">("");
  const [calleA, setCalleA] = useState<CalleId | "">("");
  const [calleB, setCalleB] = useState<CalleId | "">("");
  const [respFb, setRespFb] = useState<{ ok: boolean; msg: string; rel: Relacion } | null>(null);
  const [marcosOk, setMarcosOk] = useState<Set<Marco>>(() => new Set());
  const [prepsOk, setPrepsOk] = useState<Set<Prep>>(() => new Set());
  const [rondasOk, setRondasOk] = useState<Set<number>>(() => new Set());

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const [sinVoz, setSinVoz] = useState(false);
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
      callarLab();
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
  const escuchar = (txt: string) => {
    if (!hablarLab(txt)) setSinVoz(true);
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Follow the directions ─────────────────────────────────────────── */
  const mc = MISIONES_COMP[misionIdx]!;
  const mision = mc.mision;
  const primsMov = prims.filter((p) => p === "F" || p === "L" || p === "R");
  const estadosSeg = estadosDe(mision.inicio, primsMov);
  const eSeg = estadosSeg[estadosSeg.length - 1]!;
  const terminoSeg = prims.some((p) => p === "EL" || p === "ER");
  const puedeAvanzar = aplicarPrim(eSeg, "F") !== null;
  const puntosSeg = useMemo(() => puntosRuta(mision.inicio, prims, mision.lugar), [mision, prims]);

  const mover = (p: Prim) => {
    if (verSeg || terminoSeg) return;
    if (p === "F" && !puedeAvanzar) return;
    const nuevos = [...prims, p];
    setPrims(nuevos);
    if (p === "EL" || p === "ER") {
      const r = evaluarSeguimiento(mc, nuevos);
      setVerSeg(r);
      sfx(r.ok);
      if (r.ok) {
        setMisionesOk((s) => new Set(s).add(mision.id));
        if (fallosMision === 0) setSinErrores(true);
      } else setFallosMision((f) => f + 1);
    } else blip();
  };
  const deshacer = () => {
    if (verSeg || prims.length === 0) return;
    setPrims((xs) => xs.slice(0, -1));
    blip();
  };
  const reintentarSeg = () => {
    setPrims([]);
    setVerSeg(null);
    setAnimSeg((k) => k + 1);
    blip();
  };
  const elegirMision = (i: number) => {
    setMisionIdx(i);
    setPrims([]);
    setVerSeg(null);
    setFallosMision(0);
    setAnimSeg((k) => k + 1);
    blip();
  };

  /* ── Give directions ───────────────────────────────────────────────── */
  const tarea = TAREAS[tareaIdx]!;
  const lineas = useMemo(() => dividirIndicaciones(texto), [texto]);
  const lecturas = useMemo(() => lineas.map(parseIndicacion), [lineas]);
  const puntosDar = useMemo(() => puntosRuta(tarea.inicio, primsDar, tarea.lugar), [tarea, primsDar]);

  const enviarSam = () => {
    if (lineas.length === 0) return;
    const v = evaluarRuta(lineas, tarea);
    corrida.current += 1;
    const id = corrida.current;
    setPrimsDar(v.prims);
    setAnimDar((k) => k + 1);
    setVerDar(v);
    setVerDarVisible(false);
    blip();
    const espera = v.prims.reduce((acc, p) => acc + (p === "F" ? (PASO / VEL) * 1000 : p === "L" || p === "R" ? 700 : 1500), 600);
    despues(espera, () => {
      if (corrida.current !== id) return;
      setVerDarVisible(true);
      sfx(v.ok);
      if (v.ok) {
        setTareasOk((s) => new Set(s).add(tarea.id));
        if (v.usoReferencia) setConReferencia(true);
      } else {
        setFallosDar((f) => f + 1);
        // Sam se movió y no llegó: la ruta equivocada se vio en el mapa.
        if (v.prims.length > 0) setSePerdio(true);
      }
    });
  };
  const elegirTarea = (i: number) => {
    corrida.current += 1;
    setTareaIdx(i);
    setTexto("");
    setPrimsDar([]);
    setVerDar(null);
    setVerDarVisible(false);
    setFallosDar(0);
    setAnimDar((k) => k + 1);
    blip();
  };
  const agregarFrase = (f: string) => {
    setTexto((t) => (t.trim() ? `${t.trim()}\n${f}` : f));
    blip();
  };

  /* ── Where is it? ──────────────────────────────────────────────────── */
  const ronda = RONDAS[rondaIdx]!;
  const preg = useMemo(() => preguntaDe(ronda), [ronda]);
  const fichas = useMemo(() => barajar(preg.fichas, rondaIdx * 7 + 3), [preg, rondaIdx]);
  const preguntaOk = !!pregFb?.ok;
  const relActual: Relacion | null = (() => {
    if (prep === "corner") return calleA && calleB ? { prep, calles: [calleA, calleB] } : null;
    if (prep === "between") return refA && refB ? { prep, a: refA, b: refB } : null;
    return refA ? { prep, a: refA } : null;
  })();

  const tocarFicha = (i: number) => {
    if (preguntaOk) return;
    setFichasSel((xs) => (xs.includes(i) ? xs.filter((x) => x !== i) : [...xs, i]));
    setPregFb(null);
    blip();
  };
  const revisarPreg = () => {
    const r = revisarPregunta(
      ronda,
      fichasSel.map((i) => fichas[i]!),
    );
    setPregFb(r);
    sfx(r.ok);
    if (r.ok) setMarcosOk((s) => new Set(s).add(ronda.marco));
  };
  const cambiarPrep = (p: Prep) => {
    setPrep(p);
    setRespFb(null);
    blip();
  };
  const comprobarDonde = () => {
    if (!relActual) return;
    const ok = relacionVerdadera(ronda.sujeto, relActual);
    sfx(ok);
    setRespFb({ ok, rel: relActual, msg: ok ? `¡Correcto! ${PREP_DEF[relActual.prep].regla}` : explicaRelacionFalsa(ronda.sujeto, relActual) });
    if (ok) {
      setPrepsOk((s) => new Set(s).add(relActual.prep));
      setRondasOk((s) => new Set(s).add(rondaIdx));
    }
  };
  const elegirRonda = (i: number) => {
    setRondaIdx(i);
    setFichasSel([]);
    setPregFb(null);
    setRefA("");
    setRefB("");
    setCalleA("");
    setCalleB("");
    setRespFb(null);
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "seguir") reintentarSeg();
    if (modo === "dar") {
      corrida.current += 1;
      setPrimsDar([]);
      setVerDar(null);
      setVerDarVisible(false);
      setAnimDar((k) => k + 1);
    }
    if (modo === "donde") elegirRonda(rondaIdx);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: ObjetivoLab[] = [
    { txt: "Llevar a Emma a su destino siguiendo indicaciones en inglés", done: misionesOk.size >= 1 },
    { txt: "Completar las cinco misiones de Follow the directions", done: misionesOk.size === MISIONES_COMP.length },
    { txt: "Terminar una misión sin ningún error", done: sinErrores },
    { txt: "Escribir una ruta en inglés que Sam siga hasta el destino", done: tareasOk.size >= 1 },
    // Misión nueva (experimento central): una indicación equivocada se VE en el mapa.
    { txt: "Cambia un giro a propósito (left por right) y mira dónde se pierde Sam", done: sePerdio || tareasOk.size === TAREAS.length },
    { txt: "Resolver las tres tareas de Give directions", done: tareasOk.size === TAREAS.length },
    { txt: "Dar una ruta que funcione con una referencia (the traffic light, the bank, una calle…)", done: conReferencia },
    { txt: "Hacer las tres preguntas corteses: Where…? How…? Is there…?", done: marcosOk.size === 3 },
    { txt: "Ubicar lugares con next to, across from, between y on the corner of", done: PREPS_CLAVE.every((p) => prepsOk.has(p)) },
    { txt: "Ganar estrellas en «¿Es cierto en el mapa?»", done: identifico },
    { txt: "Aprobar el reto evaluable (A4 + A9)", done: quizAprobado },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "seguir") {
    chipVivo = `misión ${misionIdx + 1}/${MISIONES_COMP.length} · ${calleActual(eSeg).corto} · mira al ${RUMBO_ES[eSeg.h]}`;
    pie = verSeg ? verSeg.msg : `«${mision.pregunta}» Sigue las indicaciones con los botones: left y right son los de Emma, que ahora mira al ${RUMBO_ES[eSeg.h]}.`;
  } else if (modo === "dar") {
    chipVivo = `Sam · ${lineas.length} ${lineas.length === 1 ? "indicación" : "indicaciones"} · → the ${lugar(tarea.lugar).en}`;
    pie = verDar && verDarVisible ? `${verDar.titulo}. ${verDar.msg}` : verDar ? "Sam sigue tus indicaciones al pie de la letra…" : `Sam está en ${nombreEsquina(tarea.inicio.x, tarea.inicio.z)}, mirando al ${RUMBO_ES[tarea.inicio.h]}. Escribe en inglés cómo llegar a the ${lugar(tarea.lugar).en}.`;
  } else {
    chipVivo = `ronda ${rondaIdx + 1}/${RONDAS.length} · ${preguntaOk ? "¿dónde está?" : "arma la pregunta"} · the ${nombreEn(ronda.sujeto)}`;
    pie = respFb ? respFb.msg : preguntaOk ? `Ahora responde dónde está the ${nombreEn(ronda.sujeto)} usando una preposición de lugar.` : `${MARCO_ES[ronda.marco]} sobre the ${nombreEn(ronda.sujeto)}: toca las fichas en orden.`;
  }

  const burbujaSeg = verSeg ? (verSeg.ok ? "I found it! Thank you!" : `Hmm… I can't see the ${lugar(mision.lugar).en}.`) : null;
  const burbujaDar = verDar && verDarVisible ? (verDar.ok ? "Here it is! Thanks!" : "Hmm… I'm lost.") : !verDar ? tarea.pregunta.replace("Excuse me, ", "") : null;
  const relacionesDibujo: RelacionDibujo[] = respFb && respFb.rel.prep !== "corner" ? [respFb.rel.a, respFb.rel.b].filter((x): x is Referente => !!x).map((ref) => ({ ref, ok: respFb.ok })) : [];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const btnVoz = (txt: string) => (
    <button className="cd-voz" onClick={() => escuchar(txt)} title="Escuchar en inglés" aria-label="Escuchar en inglés">
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );
  const PRIM_ICONO: Record<Prim, string> = { F: "fa-arrow-up", L: "fa-arrow-turn-up fa-flip-horizontal", R: "fa-arrow-turn-up", EL: "fa-location-dot", ER: "fa-location-dot" };

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "seguir") {
    const bloqueado = !!verSeg;
    control = (
      <>
        <div className="cd-opts">
          {MISIONES_COMP.map((m, i) => (
            <button key={m.mision.id} className="cd-opt cd-mision" data-on={i === misionIdx} onClick={() => elegirMision(i)} style={{ ["--cdc" as string]: modoCol, background: i === misionIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${lugar(m.mision.lugar).icono}`} style={{ marginRight: 7 }} />
              {i + 1} · the {lugar(m.mision.lugar).en}
              {misionesOk.has(m.mision.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("La conversación")}
        <div className="cd-dialogo">
          <div className="cd-linea">
            <span className="cd-quien" style={{ background: COLOR_EMMA }}>Emma</span>
            <span>{mision.pregunta}</span>
          </div>
          <div className="cd-linea">
            <span className="cd-quien" style={{ background: "#f472b6" }}>Local</span>
            <span>
              {mision.intro}
              <ol style={{ margin: "6px 0 4px", paddingLeft: 20, display: "grid", gap: 3 }}>
                {mision.pasos.map((p, i) => (
                  <li key={i} className="cd-paso" style={{ color: verSeg && !verSeg.ok && verSeg.paso === i ? WARN : "#fff", fontWeight: verSeg && !verSeg.ok && verSeg.paso === i ? 900 : 700 }}>
                    {p}
                  </li>
                ))}
              </ol>
              {mision.cierre}
            </span>
          </div>
          <div style={{ marginTop: 8 }}>{btnVoz(`${mision.intro} ${mision.pasos.join(" ")} ${mision.cierre}`)}</div>
        </div>
        {sinVoz && nota("Tu navegador no tiene voz en inglés; lee las indicaciones.", T.text3)}
        {sub(`Mueve a Emma · está en ${nombreEsquina(eSeg.x, eSeg.z)}, mirando al ${RUMBO_ES[eSeg.h]}`)}
        <div className="cd-pad">
          <button className="cd-mov" onClick={() => mover("L")} disabled={bloqueado || terminoSeg} style={{ ["--cdc" as string]: modoCol }}>
            <i className="fa-solid fa-arrow-turn-up fa-flip-horizontal" />
            <span>Girar a la izquierda</span>
          </button>
          <button className="cd-mov" onClick={() => mover("F")} disabled={bloqueado || terminoSeg || !puedeAvanzar} style={{ ["--cdc" as string]: modoCol }}>
            <i className="fa-solid fa-arrow-up" />
            <span>Seguir derecho una cuadra</span>
          </button>
          <button className="cd-mov" onClick={() => mover("R")} disabled={bloqueado || terminoSeg} style={{ ["--cdc" as string]: modoCol }}>
            <i className="fa-solid fa-arrow-turn-up" />
            <span>Girar a la derecha</span>
          </button>
        </div>
        <div className="cd-opts" style={{ marginTop: 8 }}>
          <button className="cd-opt cd-fin" data-on="true" onClick={() => mover("EL")} disabled={bloqueado || terminoSeg} style={{ ["--cdc" as string]: OK }}>
            <i className="fa-solid fa-location-dot" style={{ marginRight: 8 }} />
            Llegamos: está a la izquierda
          </button>
          <button className="cd-opt cd-fin" data-on="true" onClick={() => mover("ER")} disabled={bloqueado || terminoSeg} style={{ ["--cdc" as string]: OK }}>
            <i className="fa-solid fa-location-dot" style={{ marginRight: 8 }} />
            Llegamos: está a la derecha
          </button>
          <button className="cd-opt" data-on="false" onClick={deshacer} disabled={bloqueado || prims.length === 0} style={{ ["--cdc" as string]: modoCol }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
            Deshacer
          </button>
        </div>
        {!puedeAvanzar && !bloqueado && nota(`Hacia el ${RUMBO_ES[eSeg.h]} se acaba el barrio: no hay más calle.`, T.text3)}
        {prims.length > 0 && (
          <div className="cd-log">
            {prims.map((p, i) => (
              <span key={i} title={p}>
                <i className={`fa-solid ${PRIM_ICONO[p]}`} />
                {p === "EL" ? " izq." : p === "ER" ? " der." : ""}
              </span>
            ))}
          </div>
        )}
        <div className="cd-opts" style={{ marginTop: 10 }}>
          <button className="cd-toggle-sm" data-on={camSeguir} onClick={() => setCamSeguir((v) => !v)}>
            <i className="fa-solid fa-video" style={{ marginRight: 7 }} />
            {camSeguir ? "Vista de mapa" : "Cámara detrás de Emma"}
          </button>
          <button className="cd-toggle-sm" data-on={ayudaLados} onClick={() => setAyudaLados((v) => !v)}>
            <i className="fa-solid fa-left-right" style={{ marginRight: 7 }} />
            {ayudaLados ? "Ocultar left / right" : "Mostrar left / right de Emma"}
          </button>
        </div>
        {verSeg &&
          nota(
            <>
              <strong>{verSeg.ok ? "¡Llegó! " : "No llegó. "}</strong>
              {verSeg.msg}
            </>,
            verSeg.ok ? OK : WARN,
            verSeg.ok ? "fa-circle-check" : "fa-circle-xmark",
          )}
        {verSeg && (
          <div className="cd-opts" style={{ marginTop: 10 }}>
            {!verSeg.ok && (
              <button className="cd-opt" data-on="true" onClick={reintentarSeg} style={{ ["--cdc" as string]: modoCol }}>
                <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                Intentar de nuevo
              </button>
            )}
            <button className="cd-opt cd-sig" data-on="true" onClick={() => elegirMision((misionIdx + 1) % MISIONES_COMP.length)} style={{ ["--cdc" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente misión
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          </div>
        )}
      </>
    );
  } else if (modo === "dar") {
    const hayError = lecturas.some((l) => !l.ok);
    control = (
      <>
        <div className="cd-opts">
          {TAREAS.map((t, i) => (
            <button key={t.id} className="cd-opt cd-tarea" data-on={i === tareaIdx} onClick={() => elegirTarea(i)} style={{ ["--cdc" as string]: modoCol, background: i === tareaIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${lugar(t.lugar).icono}`} style={{ marginRight: 7 }} />
              {i + 1} · the {lugar(t.lugar).en}
              {tareasOk.has(t.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("La situación")}
        <div className="cd-dialogo">
          <div className="cd-linea">
            <span className="cd-quien" style={{ background: COLOR_SAM }}>Sam</span>
            <span>{tarea.pregunta}</span>
          </div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>
            Sam está en <strong style={{ color: "#fff" }}>{nombreEsquina(tarea.inicio.x, tarea.inicio.z)}</strong> (bandera START), mirando al <strong style={{ color: "#fff" }}>{RUMBO_ES[tarea.inicio.h]}</strong>. El destino brilla en el mapa.
          </div>
          <div style={{ marginTop: 8 }}>{btnVoz(tarea.pregunta)}</div>
        </div>
        {sub("Tus indicaciones en inglés (una por renglón o separadas por punto)")}
        <textarea
          className="cd-texto"
          aria-label="Tus indicaciones en inglés"
          value={texto}
          rows={4}
          spellCheck={false}
          placeholder={"Go straight for two blocks.\nTurn left at the traffic light.\nIt's on your right."}
          onChange={(e) => {
            setTexto(e.target.value);
          }}
        />
        {lineas.length > 0 && (
          <div style={{ display: "grid", gap: 5, marginTop: 8 }}>
            {lineas.map((l, i) => {
              const lec = lecturas[i]!;
              const culpa = verDarVisible && verDar && !verDar.ok && verDar.culpable === i;
              const col = !lec.ok || culpa ? WARN : lec.cmd ? OK : T.text3;
              return (
                <div key={i} className="cd-lectura" style={{ borderColor: `${col}55` }}>
                  <span style={{ color: col, fontWeight: 900, minWidth: 18 }}>{i + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ color: "#fff", fontWeight: 800 }}>{l}</span>
                    <span style={{ display: "block", color: lec.ok ? T.text2 : WARN, fontSize: 14, marginTop: 2 }}>
                      <i className={`fa-solid ${lec.ok ? "fa-arrow-right" : "fa-triangle-exclamation"}`} style={{ marginRight: 6 }} />
                      {lec.ok ? lec.lee : lec.error}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="cd-opts" style={{ marginTop: 10 }}>
          <button className="cd-toggle cd-enviar" onClick={enviarSam} disabled={lineas.length === 0} style={{ ["--cdc" as string]: COLOR_SAM }}>
            <i className="fa-solid fa-person-walking" style={{ marginRight: 9, color: COLOR_SAM }} />
            {hayError ? "Que Sam lo intente (hay indicaciones que no entiende)" : "Que Sam siga tus indicaciones"}
          </button>
        </div>
        <div className="cd-opts" style={{ marginTop: 8 }}>
          <button className="cd-toggle-sm" data-on={banco} onClick={() => setBanco((v) => !v)}>
            <i className={`fa-solid ${banco ? "fa-eye-slash" : "fa-list-ul"}`} style={{ marginRight: 7 }} />
            {banco ? "Ocultar el banco de frases" : "Ver el banco de frases"}
          </button>
          <button className="cd-toggle-sm" data-on="false" onClick={() => setTexto("")} disabled={!texto}>
            <i className="fa-solid fa-eraser" style={{ marginRight: 7 }} />
            Borrar
          </button>
          <button className="cd-toggle-sm" data-on={ayudaLados} onClick={() => setAyudaLados((v) => !v)}>
            <i className="fa-solid fa-left-right" style={{ marginRight: 7 }} />
            {ayudaLados ? "Ocultar left / right" : "Mostrar left / right de Sam"}
          </button>
          <button className="cd-toggle-sm" data-on={camSeguir} onClick={() => setCamSeguir((v) => !v)}>
            <i className="fa-solid fa-video" style={{ marginRight: 7 }} />
            {camSeguir ? "Vista de mapa" : "Cámara detrás de Sam"}
          </button>
        </div>
        {banco && (
          <div className="cd-banco">
            {BANCO_FRASES.map((f) => (
              <button key={f} className="cd-frase" onClick={() => agregarFrase(f)}>
                {f}
              </button>
            ))}
            <div style={{ fontSize: 14, color: T.text3, width: "100%" }}>También entiende: «Turn right at Reforma Avenue», «Turn left at the bank», «Cross Hidalgo Street», «It&apos;s on your left, next to the bank».</div>
          </div>
        )}
        {verDar && verDarVisible &&
          nota(
            <>
              <strong>{verDar.titulo}. </strong>
              {verDar.msg}
            </>,
            verDar.ok ? OK : WARN,
            verDar.ok ? "fa-circle-check" : "fa-circle-xmark",
          )}
        {verDar && !verDarVisible && nota("Sam camina siguiendo tus indicaciones…", T.text3, "fa-person-walking")}
        {fallosDar >= 2 && !tareasOk.has(tarea.id) && nota(<>Una ruta posible: «{tarea.ejemplo}» Escríbela a tu manera.</>, T.text2, "fa-lightbulb")}
      </>
    );
  } else {
    const refsOpciones = REFERENTES.filter((r) => r !== ronda.sujeto);
    const selRef = (valor: Referente | "", set: (v: Referente | "") => void, etq: string) => (
      <select
        className="cd-select"
        aria-label={etq}
        value={valor}
        onChange={(e) => {
          set(e.target.value as Referente | "");
          setRespFb(null);
        }}
      >
        <option value="">— elige —</option>
        {refsOpciones.map((r) => (
          <option key={r} value={r}>
            the {nombreEn(r)}
          </option>
        ))}
      </select>
    );
    const selCalle = (valor: CalleId | "", set: (v: CalleId | "") => void, etq: string) => (
      <select
        className="cd-select"
        aria-label={etq}
        value={valor}
        onChange={(e) => {
          set(e.target.value as CalleId | "");
          setRespFb(null);
        }}
      >
        <option value="">— elige —</option>
        {CALLES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
    );
    control = (
      <>
        <div className="cd-opts">
          {RONDAS.map((r, i) => (
            <button key={i} className="cd-opt cd-ronda" data-on={i === rondaIdx} onClick={() => elegirRonda(i)} style={{ ["--cdc" as string]: modoCol, background: i === rondaIdx ? `${modoCol}1f` : "transparent" }} title={`the ${nombreEn(r.sujeto)}`}>
              <i className={`fa-solid ${iconoDe(r.sujeto)}`} style={{ marginRight: 6 }} />
              {i + 1}
              {rondasOk.has(i) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        {sub(`1 · ${MARCO_ES[ronda.marco]} sobre the ${nombreEn(ronda.sujeto)}`)}
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginBottom: 8 }}>{MARCO_AYUDA[ronda.marco]} Toca las fichas en orden (no necesitas usarlas todas).</div>
        <div className="cd-armado" aria-label="Tu pregunta">
          {fichasSel.length === 0 ? <span style={{ color: T.text3 }}>Tu pregunta aparecerá aquí…</span> : unirFichas(fichasSel.map((i) => fichas[i]!))}
        </div>
        <div className="cd-opts" style={{ marginTop: 8 }}>
          {fichas.map((f, i) => {
            const usada = fichasSel.includes(i);
            return (
              <button key={`${f}-${i}`} className="cd-ficha" data-usada={usada} onClick={() => tocarFicha(i)} disabled={preguntaOk}>
                {f}
              </button>
            );
          })}
        </div>
        <div className="cd-opts" style={{ marginTop: 8 }}>
          <button className="cd-opt cd-revisar" data-on="true" onClick={revisarPreg} disabled={preguntaOk || fichasSel.length === 0} style={{ ["--cdc" as string]: modoCol }}>
            <i className="fa-solid fa-spell-check" style={{ marginRight: 8 }} />
            Revisar la pregunta
          </button>
          <button className="cd-opt" data-on="false" onClick={() => { setFichasSel([]); setPregFb(null); }} disabled={preguntaOk || fichasSel.length === 0} style={{ ["--cdc" as string]: modoCol }}>
            <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
            Vaciar
          </button>
          {preguntaOk && btnVoz(unirFichas(fichasSel.map((i) => fichas[i]!)))}
        </div>
        {pregFb && nota(pregFb.msg, pregFb.ok ? OK : WARN, pregFb.ok ? "fa-circle-check" : "fa-circle-xmark")}

        {sub("2 · Responde dónde está (se comprueba en el mapa)")}
        <div style={{ opacity: preguntaOk ? 1 : 0.45, pointerEvents: preguntaOk ? "auto" : "none" }}>
          <div className="cd-opts">
            {(["next", "across", "between", "corner", "front"] as Prep[]).map((p) => (
              <button key={p} className="cd-opt cd-prep" data-on={p === prep} onClick={() => cambiarPrep(p)} style={{ ["--cdc" as string]: modoCol, background: p === prep ? `${modoCol}1f` : "transparent" }}>
                {PREP_DEF[p].en}
                {prepsOk.has(p) && <i className="fa-solid fa-check" style={{ marginLeft: 6, color: OK }} />}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{PREP_DEF[prep].es}</div>
          <div className="cd-constructor">
            <span>{ronda.marco === "isthere" ? "Yes, there is one" : ronda.marco === "how" ? "It's" : `The ${nombreEn(ronda.sujeto)} is`}</span>
            {prep === "corner" ? (
              <>
                <span>on the corner of</span>
                {selCalle(calleA, setCalleA, "Primera calle")}
                <span>and</span>
                {selCalle(calleB, setCalleB, "Segunda calle")}
              </>
            ) : prep === "between" ? (
              <>
                <span>between</span>
                {selRef(refA, setRefA, "Primer lugar")}
                <span>and</span>
                {selRef(refB, setRefB, "Segundo lugar")}
              </>
            ) : (
              <>
                <span>{PREP_DEF[prep].en}</span>
                {selRef(refA, setRefA, "Lugar de referencia")}
              </>
            )}
          </div>
          {relActual && (
            <div style={{ marginTop: 8, fontSize: 14, color: "#fff", fontWeight: 800 }}>
              «{respuestaDe(ronda, relActual)}» {btnVoz(respuestaDe(ronda, relActual))}
            </div>
          )}
          <div className="cd-opts" style={{ marginTop: 10 }}>
            <button className="cd-toggle cd-comprobar" onClick={comprobarDonde} disabled={!relActual} style={{ ["--cdc" as string]: modoCol }}>
              <i className="fa-solid fa-map-location-dot" style={{ marginRight: 9, color: modoCol }} />
              Comprobar en el mapa
            </button>
          </div>
          {respFb && nota(respFb.msg, respFb.ok ? OK : WARN, respFb.ok ? "fa-circle-check" : "fa-circle-xmark")}
          {respFb?.ok && (
            <div className="cd-opts" style={{ marginTop: 10 }}>
              <button className="cd-opt cd-sig" data-on="true" onClick={() => elegirRonda((rondaIdx + 1) % RONDAS.length)} style={{ ["--cdc" as string]: modoCol, background: `${modoCol}1f` }}>
                Siguiente ronda
                <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .cd-opts { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .cd-opt { cursor:pointer; border:1px solid var(--cdc); border-radius:10px; padding:9px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .cd-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .cd-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cd-opt:disabled { cursor:default; opacity:0.5; }
        .cd-toggle { width:100%; cursor:pointer; border:1px solid var(--cdc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
        .cd-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .cd-toggle:disabled { cursor:default; opacity:0.5; }
        .cd-toggle-sm { cursor:pointer; border:1px solid rgba(255,255,255,0.14); border-radius:9px; padding:8px 11px; font-size:14px; font-weight:800; color:rgba(255,255,255,0.75); background:transparent; transition:all .15s; }
        .cd-toggle-sm[data-on="true"] { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.14); }
        .cd-toggle-sm:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cd-toggle-sm:disabled { opacity:0.45; cursor:default; }
        .cd-dialogo { padding:12px 14px; border-radius:12px; background:rgba(248,250,252,0.05); border:1px solid ${T.line}; display:grid; gap:8px; }
        .cd-linea { display:flex; gap:10px; align-items:flex-start; font-size:14px; color:#fff; line-height:1.5; font-weight:700; }
        .cd-quien { flex-shrink:0; font-size:14px; font-weight:900; color:#04121f; padding:2px 7px; border-radius:6px; margin-top:1px; letter-spacing:0.02em; }
        .cd-voz { cursor:pointer; border:1px solid rgba(255,255,255,0.18); border-radius:999px; padding:6px 12px; font-size:14px; font-weight:800; color:#e0f2fe; background:rgba(56,189,248,0.1); }
        .cd-voz:hover { background:rgba(56,189,248,0.2); }
        .cd-pad { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:8px; }
        .cd-mov { cursor:pointer; border:1px solid var(--cdc); border-radius:12px; padding:12px 6px; background:rgba(4,10,22,0.45); color:#fff; display:flex; flex-direction:column; align-items:center; gap:6px; font-size:14px; font-weight:800; transition:all .15s; text-align:center; }
        .cd-mov i { font-size:20px; color:var(--cdc); }
        .cd-mov:hover:not(:disabled) { background:rgba(255,255,255,0.07); transform:translateY(-1px); }
        .cd-mov:disabled { opacity:0.4; cursor:default; }
        .cd-log { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
        .cd-log span { font-size:14px; color:#cbd5e1; padding:4px 8px; border-radius:7px; background:rgba(4,10,22,0.5); border:1px solid ${T.line}; font-weight:800; }
        .cd-texto { width:100%; box-sizing:border-box; resize:vertical; min-height:96px; border-radius:11px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:14px; font-weight:700; line-height:1.55; padding:10px 12px; font-family:inherit; outline:none; }
        .cd-texto:focus { border-color:${COLOR_SAM}; box-shadow:0 0 0 3px rgba(245,158,11,0.18); }
        .cd-lectura { display:flex; gap:8px; align-items:flex-start; font-size:14px; padding:7px 10px; border-radius:9px; border:1px solid; background:rgba(4,10,22,0.35); }
        .cd-banco { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .cd-frase { cursor:pointer; border:1px solid ${T.line}; background:${T.glass}; color:#fff; border-radius:9px; padding:7px 10px; font-size:14px; font-weight:700; }
        .cd-frase:hover { border-color:${COLOR_SAM}; background:rgba(245,158,11,0.12); }
        .cd-armado { min-height:44px; display:flex; align-items:center; padding:9px 12px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:800; }
        .cd-ficha { cursor:pointer; border:1.5px solid ${T.lineStrong}; background:rgba(167,139,250,0.1); color:#fff; border-radius:9px; padding:7px 12px; font-size:14px; font-weight:800; transition:all .14s; }
        .cd-ficha[data-usada="true"] { opacity:0.35; border-style:dashed; }
        .cd-ficha:hover:not(:disabled) { border-color:#a78bfa; }
        .cd-ficha:disabled { cursor:default; }
        .cd-constructor { display:flex; flex-wrap:wrap; gap:7px; align-items:center; margin-top:10px; font-size:14px; font-weight:800; color:#fff; }
        .cd-select { max-width:100%; border-radius:9px; border:1.5px solid ${T.lineStrong}; background:#0b1628; color:#fff; font-size:14px; font-weight:700; padding:6px 8px; font-family:inherit; }
        .cd-select:focus { outline:2px solid #a78bfa; }
        .cd-opt:focus-visible, .cd-toggle:focus-visible, .cd-mov:focus-visible, .cd-ficha:focus-visible, .cd-frase:focus-visible, .cd-toggle-sm:focus-visible, .cd-voz:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <CiudadScene
              vista={modo}
              modoColor={modoCol}
              resetNonce={resetNonce}
              camSeguir={camSeguir}
              ayudaLados={ayudaLados}
              verNombres={verNombres}
              puntos={modo === "dar" ? puntosDar : puntosSeg}
              animKey={modo === "dar" ? animDar : animSeg}
              nombre={modo === "dar" ? "Sam" : "Emma"}
              colorPersona={modo === "dar" ? COLOR_SAM : COLOR_EMMA}
              inicio={modo === "dar" ? tarea.inicio : mision.inicio}
              burbuja={modo === "dar" ? burbujaDar : burbujaSeg}
              destino={modo === "dar" ? tarea.lugar : verSeg?.ok ? mision.lugar : null}
              destinoColor={modo === "dar" ? (verDar?.ok && verDarVisible ? OK : COLOR_SAM) : OK}
              foco={ronda.sujeto}
              pregunta={preguntaOk ? unirFichas(fichasSel.map((i) => fichas[i]!)) : null}
              respuesta={respFb?.ok ? respuestaDe(ronda, respFb.rel) : null}
              relaciones={relacionesDibujo}
              esquina={respFb && respFb.rel.prep === "corner" && respFb.rel.calles ? { calles: respFb.rel.calles, ok: respFb.ok } : null}
            />
          </SceneBoundary>
        }
        modos={{
          opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
          valor: modo,
          cambiar: (id) => cambiarModo(id as Modo),
        }}
        herramientas={
          <>
            {modo !== "donde" && <BotonHerramienta icono="fa-tags" titulo={verNombres ? "Ocultar los nombres lejanos" : "Ver todos los nombres del mapa"} activo={verNombres} onClick={() => setVerNombres((v) => !v)} />}
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
          </>
        }
        leyenda={
          <>
            <span style={{ color: "#fff", fontWeight: 800 }}>
              <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 8 }} />
              {def.etq}
            </span>
            <span style={{ color: T.text2 }}>{def.subtitulo}</span>
          </>
        }
        lectura={chipVivo}
        objetivos={objetivos}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Cuaderno",
            icono: "fa-pen",
            contenido: (
              <>
                <Bloque titulo={`${def.etq} · lo que pasa`} icono={def.icono}>
                  <div style={{ color: "#e6eefb", lineHeight: 1.5, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>{pie}</div>
                </Bloque>
                <Bloque titulo="Controles" icono="fa-sliders">
                  {control}
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
                <MapaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

                <RetoQuizCard quiz={QUIZ} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ya puedes orientar a alguien en inglés." />

                <div style={{ ...card, padding: "18px 16px 20px", marginTop: 22 }}>
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
              </>
            ),
          },
          {
            id: "teoria",
            etiqueta: "Teoría",
            icono: "fa-book-open",
            contenido: (
              <>
                <Bloque titulo="Excuse me, how do I get to…?" icono="fa-signs-post">
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
                </Bloque>

                <Bloque titulo="Lectura A1" icono="fa-book-open">
                  <div style={{ color: "#fff", fontWeight: 800, lineHeight: 1.4 }}>{TITULO_A1}</div>
                  <div style={{ display: "grid", gap: 9 }}>
                    {LECTURA_A1.map((p, i) => (
                      <div key={i} style={{ color: T.text2, lineHeight: 1.55 }}>
                        {p}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
                    {PREGUNTAS_A1.map((q, i) => (
                      <li key={i} style={{ color: T.text2, lineHeight: 1.45 }}>
                        {q}
                      </li>
                    ))}
                  </ul>
                </Bloque>

                <Bloque titulo="Importante (lectura A1)" icono="fa-circle-info">
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
                </Bloque>

                <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                  <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                    {INSTRUCCIONES.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                </Bloque>

                <Bloque titulo="Glosario (A5)" icono="fa-book">
                  <div style={{ display: "grid", gap: 8 }}>
                    {GLOSARIO.map((gi, i) => (
                      <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                        <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                        <span style={{ color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                        <div style={{ color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                          <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                          {gi.ejemplo}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: T.text2 }}>
                    <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
                  </div>
                </Bloque>

                <Bloque titulo="Tu turno fuera del laboratorio (A3 y video A9)" icono="fa-pen-nib">
                  <div style={{ color: "#fff", fontWeight: 800 }}>{A3.titulo}</div>
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>{A3.prompt}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 5, color: T.text2, lineHeight: 1.45 }}>
                    {A3.pistas.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>
                    <strong style={{ color: "#fff" }}>Video A9:</strong> {ABIERTA_A9}
                  </div>
                </Bloque>

                <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9, color: T.text2, lineHeight: 1.45 }}>
                    {IDEAS.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Bloque>

                <Bloque titulo="¿Cómo voy? (autoevaluación A7)" icono="fa-list-check">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 7, color: T.text2, lineHeight: 1.45 }}>
                    {AUTOEVALUACION_A7.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                  <div style={{ color: T.text2, fontStyle: "italic" }}>{REFLEXION_A7}</div>
                </Bloque>

                <Bloque titulo="Qué es verbatim y qué es ilustrativo" icono="fa-circle-info">
                  <div style={{ color: T.text3, lineHeight: 1.5 }}>
                    La lectura A1 con su recuadro y sus preguntas, el glosario A5, los enunciados y retroalimentaciones del verdadero/falso A4, las preguntas del video A9, la escritura A3, la
                    autoevaluación A7 y el texto A6 son <strong>verbatim</strong> de la plataforma (en el reto, dos retroalimentaciones del video A9 son del laboratorio porque la actividad no las
                    trae). El barrio, sus calles, sus lugares, las misiones y las tareas son <strong>ilustrativos</strong>: una colonia ficticia. El modelo simplifica: quien camina se detiene
                    en las esquinas, «It&apos;s on your left/right» se refiere a la cuadra de enfrente y «Cross the street» sin nombre no avanza cuadras. Las oraciones en inglés del
                    laboratorio siguen el inglés estadounidense estándar. Fuente: {FUENTE}
                  </div>
                </Bloque>

                <FichaTeorica data={CIUDAD_DIRECCIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </>
            ),
          },
        ]}
      />
    </>
  );
}

const MARCO_ES: Record<Marco, string> = {
  where: "Pregunta dónde está",
  how: "Pregunta cómo llegar",
  isthere: "Pregunta si hay uno cerca",
};

const MARCO_AYUDA: Record<Marco, string> = {
  where: "Where = dónde. Estructura: Excuse me, + where + is + the + lugar + ?",
  how: "How = cómo. «How can I get to…?» o «How do I get to…?» = ¿Cómo llego a…?",
  isthere: "Is there a …? pregunta si existe uno (singular); la respuesta usa there is.",
};
