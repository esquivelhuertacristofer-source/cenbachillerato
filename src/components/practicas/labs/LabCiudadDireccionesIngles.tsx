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
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el barrio en 3D…</span>
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
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>Enunciado {pos + 1} de {ronda.length} · mira el barrio 3D (o el mapa de la ficha) y decide</div>
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
  const [drawer, setDrawer] = useState(false);
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
      } else setFallosDar((f) => f + 1);
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
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Llevar a Emma a su destino siguiendo indicaciones en inglés", done: misionesOk.size >= 1 },
    { t: "Completar las cinco misiones de Follow the directions", done: misionesOk.size === MISIONES_COMP.length },
    { t: "Terminar una misión sin ningún error", done: sinErrores },
    { t: "Escribir una ruta en inglés que Sam siga hasta el destino", done: tareasOk.size >= 1 },
    { t: "Resolver las tres tareas de Give directions", done: tareasOk.size === TAREAS.length },
    { t: "Dar una ruta que funcione con una referencia (the traffic light, the bank, una calle…)", done: conReferencia },
    { t: "Hacer las tres preguntas corteses: Where…? How…? Is there…?", done: marcosOk.size === 3 },
    { t: "Ubicar lugares con next to, across from, between y on the corner of", done: PREPS_CLAVE.every((p) => prepsOk.has(p)) },
    { t: "Ganar estrellas en «¿Es cierto en el mapa?»", done: identifico },
    { t: "Aprobar el reto evaluable (A4 + A9)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
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
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>
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
                    <span style={{ display: "block", color: lec.ok ? T.text2 : WARN, fontSize: 11.5, marginTop: 2 }}>
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
            <div style={{ fontSize: 11, color: T.text3, width: "100%" }}>También entiende: «Turn right at Reforma Avenue», «Turn left at the bank», «Cross Hidalgo Street», «It&apos;s on your left, next to the bank».</div>
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
        <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 8 }}>{MARCO_AYUDA[ronda.marco]} Toca las fichas en orden (no necesitas usarlas todas).</div>
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
          <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{PREP_DEF[prep].es}</div>
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
            <div style={{ marginTop: 8, fontSize: 13.5, color: "#fff", fontWeight: 800 }}>
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
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cdPulse { 0%,100%{ box-shadow:0 0 0 0 var(--cdd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .cd-live-dot { animation: cdPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .cd-live-dot { animation:none; } }
        .cd-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .cd-grid { grid-template-columns: 1fr; } }
        .cd-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cd-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .cd-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cd-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .cd-tab { cursor:pointer; border:1px solid var(--cdc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .cd-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .cd-tab:hover { background:rgba(255,255,255,0.06); }
        .cd-opts { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }
        .cd-opt { cursor:pointer; border:1px solid var(--cdc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .cd-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .cd-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cd-opt:disabled { cursor:default; opacity:0.5; }
        .cd-toggle { width:100%; cursor:pointer; border:1px solid var(--cdc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .cd-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .cd-toggle:disabled { cursor:default; opacity:0.5; }
        .cd-toggle-sm { cursor:pointer; border:1px solid rgba(255,255,255,0.14); border-radius:9px; padding:7px 11px; font-size:11.5px; font-weight:800; color:rgba(255,255,255,0.75); background:transparent; transition:all .15s; }
        .cd-toggle-sm[data-on="true"] { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.14); }
        .cd-toggle-sm:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cd-toggle-sm:disabled { opacity:0.45; cursor:default; }
        .cd-dialogo { padding:12px 14px; border-radius:12px; background:rgba(248,250,252,0.05); border:1px solid ${T.line}; display:grid; gap:8px; }
        .cd-linea { display:flex; gap:10px; align-items:flex-start; font-size:13px; color:#fff; line-height:1.5; font-weight:700; }
        .cd-quien { flex-shrink:0; font-size:10px; font-weight:900; color:#04121f; padding:3px 7px; border-radius:6px; margin-top:2px; letter-spacing:0.04em; }
        .cd-voz { cursor:pointer; border:1px solid rgba(255,255,255,0.18); border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; color:#e0f2fe; background:rgba(56,189,248,0.1); }
        .cd-voz:hover { background:rgba(56,189,248,0.2); }
        .cd-pad { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .cd-mov { cursor:pointer; border:1px solid var(--cdc); border-radius:12px; padding:12px 8px; background:rgba(4,10,22,0.45); color:#fff; display:flex; flex-direction:column; align-items:center; gap:6px; font-size:11.5px; font-weight:800; transition:all .15s; }
        .cd-mov i { font-size:20px; color:var(--cdc); }
        .cd-mov:hover:not(:disabled) { background:rgba(255,255,255,0.07); transform:translateY(-1px); }
        .cd-mov:disabled { opacity:0.4; cursor:default; }
        .cd-log { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
        .cd-log span { font-size:11px; color:#cbd5e1; padding:4px 8px; border-radius:7px; background:rgba(4,10,22,0.5); border:1px solid ${T.line}; font-weight:800; }
        .cd-texto { width:100%; box-sizing:border-box; resize:vertical; min-height:96px; border-radius:11px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:14px; font-weight:700; line-height:1.55; padding:10px 12px; font-family:inherit; outline:none; }
        .cd-texto:focus { border-color:${COLOR_SAM}; box-shadow:0 0 0 3px rgba(245,158,11,0.18); }
        .cd-lectura { display:flex; gap:8px; align-items:flex-start; font-size:12.5px; padding:7px 10px; border-radius:9px; border:1px solid; background:rgba(4,10,22,0.35); }
        .cd-banco { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .cd-frase { cursor:pointer; border:1px solid ${T.line}; background:${T.glass}; color:#fff; border-radius:9px; padding:6px 10px; font-size:12px; font-weight:700; }
        .cd-frase:hover { border-color:${COLOR_SAM}; background:rgba(245,158,11,0.12); }
        .cd-armado { min-height:44px; display:flex; align-items:center; padding:9px 12px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:800; }
        .cd-ficha { cursor:pointer; border:1.5px solid ${T.lineStrong}; background:rgba(167,139,250,0.1); color:#fff; border-radius:9px; padding:7px 12px; font-size:13px; font-weight:800; transition:all .14s; }
        .cd-ficha[data-usada="true"] { opacity:0.35; border-style:dashed; }
        .cd-ficha:hover:not(:disabled) { border-color:#a78bfa; }
        .cd-ficha:disabled { cursor:default; }
        .cd-constructor { display:flex; flex-wrap:wrap; gap:7px; align-items:center; margin-top:10px; font-size:13.5px; font-weight:800; color:#fff; }
        .cd-select { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:#0b1628; color:#fff; font-size:13px; font-weight:700; padding:6px 8px; font-family:inherit; }
        .cd-select:focus { outline:2px solid #a78bfa; }
        .cd-opt:focus-visible, .cd-tab:focus-visible, .cd-toggle:focus-visible, .cd-icobtn:focus-visible, .cd-mov:focus-visible, .cd-ficha:focus-visible, .cd-frase:focus-visible, .cd-toggle-sm:focus-visible, .cd-voz:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .cd-bottom { grid-template-columns: 1fr !important; } }
        .cd-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .cd-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .cd-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .cd-drawer[data-open="true"] { transform:translateX(0); }
        .cd-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .cd-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .cd-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .cd-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .cd-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .cd-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="cd-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="cd-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--cdc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="cd-grid">
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
              <CiudadScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                camSeguir={camSeguir}
                ayudaLados={ayudaLados}
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

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="cd-live-dot" style={{ ["--cdd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="cd-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="cd-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="cd-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            <button className="cd-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-signs-post" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Excuse me, how do I get to…?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 10 }}>{TITULO_A1}</div>
            <div style={{ display: "grid", gap: 9, marginBottom: 12, maxHeight: 360, overflowY: "auto", paddingRight: 6 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS_A1.map((q, i) => (
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
              <span className="cd-contador" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="cd-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
              Tu turno fuera del laboratorio (A3 y video A9)
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, marginBottom: 4 }}>{A3.titulo}</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{A3.prompt}</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 16, display: "grid", gap: 5 }}>
              {A3.pistas.map((p, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {p}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginTop: 8 }}>
              <strong style={{ color: "#fff" }}>Video A9:</strong> {ABIERTA_A9}
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
              <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
              ¿Cómo voy? (autoevaluación A7)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 7 }}>
              {AUTOEVALUACION_A7.map((x, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {x}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 8, fontStyle: "italic" }}>{REFLEXION_A7}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con su recuadro y sus preguntas, el glosario A5, los enunciados y retroalimentaciones del verdadero/falso A4, las preguntas del video A9, la escritura A3, la
          autoevaluación A7 y el texto A6 son <strong>verbatim</strong> de la plataforma (en el reto, dos retroalimentaciones del video A9 son del laboratorio porque la actividad no las
          trae). El barrio, sus calles, sus lugares, las misiones y las tareas son <strong>ilustrativos</strong>: una colonia ficticia. El modelo simplifica: quien camina se detiene
          en las esquinas, «It&apos;s on your left/right» se refiere a la cuadra de enfrente y «Cross the street» sin nombre no avanza cuadras. Las oraciones en inglés del
          laboratorio siguen el inglés estadounidense estándar. Fuente: {FUENTE}
        </span>
      </div>

      <MapaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ya puedes orientar a alguien en inglés." />

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

      <div className="cd-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="cd-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="cd-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="cd-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cd-drawer-body">
          <FichaTeorica data={CIUDAD_DIRECCIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
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

