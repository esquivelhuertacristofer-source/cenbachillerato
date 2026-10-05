"use client";

/**
 * Laboratorio 3D — "Polite conversations: open, keep, close".
 * Práctica anclada a IN-IV-P06 (Inglés IV): «Participa en conversaciones
 * sociales breves con expresiones de cortesía (inicia, mantiene y cierra
 * intercambios breves con respeto y empatía)». La progresión no tiene lectura:
 * el marco teórico es el glosario A1; el reto evaluable reúne el quiz A2 y las
 * preguntas cerradas del video A8; los hechos son el verdadero/falso A4, el
 * texto a completar el A6 y el glosario de la ficha el A5.
 *
 * Tres modos sobre escenarios 3D con personajes que reaccionan:
 *  (1) Open, keep, close — conversación ramificada: en cada turno eliges qué
 *      decir; el interlocutor reacciona (sonríe, se incomoda, se confunde, se
 *      despide), se mueven los medidores de cortesía y fluidez, y una respuesta
 *      que corta la conversación obliga a empezar de nuevo.
 *  (2) Formal or informal? — armas la frase con piezas para un amigo, tu
 *      maestra o una recepcionista; la aguja muestra tu registro y la persona
 *      responde según lo adecuado que fue.
 *  (3) Fix the conversation — detectas la línea descortés (también tocándola
 *      en la torre de turnos 3D), la reescribes en inglés con validación
 *      tolerante y reproduces la conversación arreglada.
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
import { CORTESIA_CONVERSACION_FICHA } from "./cortesia-conversacion-ingles-ficha";
import type { LineaTorre } from "./CortesiaConversacionInglesScene";
import {
  type Modo,
  type Emocion,
  type Etapa,
  type Escenario,
  type PersonajeId,
  type InterId,
  type PropId,
  type VeredictoRegistro,
  type ResultadoReescritura,
  type ExpresionEtapa,
  MODOS,
  MODOS_DEF,
  PERSONAJES,
  ETAPA_DEF,
  CALIDAD_DEF,
  EMOCION_DEF,
  ESCENARIO_DEF,
  BANDA_DEF,
  CONVERSACIONES,
  INTERLOCUTORES,
  PROPOSITOS,
  TIPO_DEF,
  ARREGLOS,
  medidores,
  componer,
  nivelParcial,
  bandaDe,
  evaluarRegistro,
  revisarReescritura,
  rondaEtapas,
  estrellasPorErrores,
  mulberry32,
  baraja,
  inter as interPorId,
  proposito as propPorId,
  TITULO_A1,
  GLOSARIO_A1,
  ACTIVIDAD_A1,
  GLOSARIO_A5,
  ACTIVIDAD_A5,
  HECHOS_A4,
  AUTOEVALUACION_A3,
  ESCRITURA_A3,
  AUTOEVALUACION_A7,
  REFLEXION_A7,
  VIDEO_A8,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ,
  HUECOS_A6,
} from "./cortesia-conversacion-ingles-data";

const CortesiaScene = dynamic(() => import("./CortesiaConversacionInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-comments fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando los escenarios en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-cortesia-conversacion-ingles-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaEtapas(mulberry32(17));
const ETAPAS: Etapa[] = ["open", "keep", "close"];
const PASO_MS = 1900;

/* ── Tarjeta de estrellas: ¿abrir, mantener o cerrar? ─────────────────── */
function EtapasCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<ExpresionEtapa[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ronda[pos] ?? ronda[0]!;

  const responder = (e: Etapa) => {
    if (resuelto !== null) return;
    const ok = e === actual.etapa;
    playSfx?.(ok);
    if (!ok) {
      setErrores((x) => x + 1);
      setAviso(`No es ${ETAPA_DEF[e].es.toLowerCase()}. ${actual.porque}`);
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
    setRonda(rondaEtapas(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "18px 16px 20px", marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Abrir, mantener o cerrar?
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
            Expresión {pos + 1} de {ronda.length} · ¿en qué momento de la conversación se usa?
          </div>
          <div className="cc-enunciado" style={{ fontSize: 17, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            «{actual.texto}»
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ETAPAS.map((e) => (
              <button key={e} className="cc-opt cc-etapa" data-on="true" onClick={() => responder(e)} style={{ ["--ccc" as string]: ETAPA_DEF[e].col }}>
                {ETAPA_DEF[e].en} · {ETAPA_DEF[e].es}
              </button>
            ))}
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

type FaseConv = "elige" | "responde" | "cortada" | "fin";

export function LabCortesiaConversacionIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("conversar");

  // ── Open, keep, close
  const [convIdx, setConvIdx] = useState(0);
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [elegidas, setElegidas] = useState<number[]>([]);
  const [fase, setFase] = useState<FaseConv>("elige");
  const [intento, setIntento] = useState(0);
  const [convsOk, setConvsOk] = useState<Set<string>>(() => new Set());
  const [perfecta, setPerfecta] = useState(false);
  const [empatia, setEmpatia] = useState(false);
  // Experimento central: decir algo descortés a propósito y ver cómo reacciona la persona.
  const [vioError, setVioError] = useState(false);

  // ── Formal or informal?
  const [interId, setInterId] = useState<InterId>("amigo");
  const [propId, setPropId] = useState<PropId>("saludar");
  const [sel, setSel] = useState<(string | null)[]>([null, null]);
  const [veredicto, setVeredicto] = useState<VeredictoRegistro | null>(null);
  const [combosOk, setCombosOk] = useState<Set<string>>(() => new Set());
  const [intersOk, setIntersOk] = useState<Set<InterId>>(() => new Set());
  const [propsOk, setPropsOk] = useState<Set<PropId>>(() => new Set());

  // ── Fix the conversation
  const [arrIdx, setArrIdx] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [detectado, setDetectado] = useState(false);
  const [fbDetect, setFbDetect] = useState<{ ok: boolean; msg: string } | null>(null);
  const [texto, setTexto] = useState("");
  const [rev, setRev] = useState<ResultadoReescritura | null>(null);
  const [fallosRe, setFallosRe] = useState(0);
  const [arreglos, setArreglos] = useState<Record<string, string>>({});
  const [play, setPlay] = useState<number | null>(null);
  const corrida = useRef(0);

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

  /* ── Open, keep, close ─────────────────────────────────────────────── */
  const conv = CONVERSACIONES[convIdx]!;
  const turno = conv.turnos[turnoIdx]!;
  const orden = useMemo(() => baraja(turno.opciones.map((_, i) => i), mulberry32(convIdx * 31 + turnoIdx * 7 + intento * 13 + 1)), [turno, convIdx, turnoIdx, intento]);
  const opcionesElegidas = elegidas.map((o, k) => conv.turnos[k]!.opciones[o]!);
  const ultima = fase === "elige" ? null : (opcionesElegidas[opcionesElegidas.length - 1] ?? null);
  const med = medidores(opcionesElegidas.map((o) => o.calidad));
  const npcConv = PERSONAJES[conv.npc];

  const elegirOpcion = (oIdx: number) => {
    if (fase !== "elige") return;
    const op = turno.opciones[oIdx]!;
    const nuevas = [...elegidas, oIdx];
    setElegidas(nuevas);
    sfx(op.calidad === "ideal");
    if (op.calidad !== "ideal") setVioError(true);
    if (op.marca === "empatia" && op.calidad === "ideal") setEmpatia(true);
    if (op.calidad === "corta") {
      setFase("cortada");
      return;
    }
    if (turnoIdx + 1 >= conv.turnos.length) {
      setFase("fin");
      setConvsOk((s) => new Set(s).add(conv.id));
      const todas = nuevas.map((o, k) => conv.turnos[k]!.opciones[o]!);
      if (todas.every((o) => o.calidad === "ideal")) setPerfecta(true);
      return;
    }
    setFase("responde");
  };
  const siguienteTurno = () => {
    if (fase !== "responde") return;
    setTurnoIdx((t) => t + 1);
    setFase("elige");
    blip();
  };
  const reiniciarConv = () => {
    setTurnoIdx(0);
    setElegidas([]);
    setFase("elige");
    setIntento((k) => k + 1);
    blip();
  };
  const elegirConv = (i: number) => {
    setConvIdx(i);
    setTurnoIdx(0);
    setElegidas([]);
    setFase("elige");
    blip();
  };

  const turnosPasados = fase === "elige" ? turnoIdx : fase === "cortada" ? turnoIdx : turnoIdx + 1;
  const etapasHechas = ETAPAS.filter((e) => {
    const idx = conv.turnos.map((t, i) => (t.etapa === e ? i : -1)).filter((i) => i >= 0);
    return idx.length > 0 && idx.every((i) => i < turnosPasados);
  });

  /* ── Formal or informal? ───────────────────────────────────────────── */
  const it = interPorId(interId);
  const prop = propPorId(propId);
  const aguja = nivelParcial(propId, sel);
  const frase = componer(propId, sel, interId);
  const npcReg = PERSONAJES[it.personaje];

  const elegirInter = (id: InterId) => {
    setInterId(id);
    setVeredicto(null);
    blip();
  };
  const elegirProp = (id: PropId) => {
    setPropId(id);
    setSel(propPorId(id).ranuras.map(() => null));
    setVeredicto(null);
    blip();
  };
  const elegirPieza = (r: number, id: string) => {
    setSel((xs) => xs.map((x, i) => (i === r ? id : x)));
    setVeredicto(null);
    blip();
  };
  const decirFrase = () => {
    const v = evaluarRegistro(propId, sel, interId);
    if (!v) return;
    setVeredicto(v);
    sfx(v.ok);
    if (!v.ok) setVioError(true);
    if (v.ok) {
      setCombosOk((s) => new Set(s).add(`${propId}:${interId}`));
      setIntersOk((s) => new Set(s).add(interId));
      setPropsOk((s) => new Set(s).add(propId));
    }
  };

  /* ── Fix the conversation ──────────────────────────────────────────── */
  const arr = ARREGLOS[arrIdx]!;
  const npcArr = PERSONAJES[arr.npc];
  const arreglado = arreglos[arr.id];

  const textoLinea = (i: number): string => {
    const l = arr.lineas[i]!;
    if (arreglado !== undefined && i === arr.problema) return arreglado;
    if (arreglado !== undefined && i === arr.problema + 1) return arr.respuestaOk;
    return l.texto;
  };
  const emoLinea = (i: number): Emocion => {
    const l = arr.lineas[i]!;
    if (arreglado !== undefined && i === arr.problema + 1) return "feliz";
    return l.emo ?? "neutral";
  };

  const tocarLinea = (i: number) => {
    if (detectado || play !== null) return;
    setElegida(i);
    if (i === arr.problema) {
      setDetectado(true);
      setFbDetect({ ok: true, msg: arr.porque });
      sfx(true);
    } else {
      const l = arr.lineas[i]!;
      setFbDetect({ ok: false, msg: l.quien === "npc" ? `Esa línea la dice ${npcArr.nombre.replace(/^La /, "la ")}, no tú: ${l.bien}` : `Esa línea está bien: ${l.bien}` });
      sfx(false);
    }
  };
  const reproducir = () => {
    corrida.current += 1;
    const id = corrida.current;
    setPlay(0);
    blip();
    arr.lineas.forEach((_, i) => {
      if (i === 0) return;
      despues(PASO_MS * i, () => {
        if (corrida.current === id) setPlay(i);
      });
    });
    despues(PASO_MS * arr.lineas.length + 400, () => {
      if (corrida.current === id) setPlay(null);
    });
  };
  const revisarTexto = () => {
    const r = revisarReescritura(texto, arr);
    setRev(r);
    sfx(r.ok);
    if (r.ok) {
      setArreglos((m) => ({ ...m, [arr.id]: texto.trim() }));
      despues(700, reproducir);
    } else setFallosRe((f) => f + 1);
  };
  const elegirArreglo = (i: number) => {
    corrida.current += 1;
    setArrIdx(i);
    setElegida(null);
    setDetectado(false);
    setFbDetect(null);
    setTexto("");
    setRev(null);
    setFallosRe(0);
    setPlay(null);
    blip();
  };

  const actualArr = play ?? elegida;
  const lineasTorre: LineaTorre[] = arr.lineas.map((l, i) => ({
    quien: l.quien,
    estado: arreglado !== undefined && i === arr.problema ? "arreglada" : detectado && i === arr.problema ? "mal" : !detectado && elegida === i ? "elegida" : "normal",
    activa: actualArr === i,
  }));

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "conversar") reiniciarConv();
    if (modo === "registro") elegirProp(propId);
    if (modo === "arreglar") {
      corrida.current += 1;
      setPlay(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const nArreglados = Object.keys(arreglos).length;
  const objetivos: ObjetivoLab[] = [
    // Misión del experimento central: equivocarse a propósito y ver la reacción.
    { txt: "Elige a propósito una respuesta o una frase descortés y mira cómo reacciona la persona", done: vioError },
    { txt: "Completar una conversación en Open, keep, close sin que se corte", done: convsOk.size >= 1 },
    { txt: "Lograr una conversación perfecta: cortesía y fluidez al 100 %", done: perfecta },
    { txt: "Responder con empatía a una mala noticia o a alguien que se siente mal", done: empatia },
    { txt: "Completar las tres conversaciones (Carlos, Sofía y Emily)", done: convsOk.size === CONVERSACIONES.length },
    { txt: "Ajustar el registro con Carlos, Ms. Ramírez y la recepcionista", done: intersOk.size === INTERLOCUTORES.length },
    { txt: "Ajustar el registro en los cuatro propósitos: saludar, pedir, agradecer y despedirse", done: propsOk.size === PROPOSITOS.length },
    { txt: "Detectar y reescribir con cortesía tres líneas descorteses", done: nArreglados >= 3 },
    { txt: "Arreglar las cinco conversaciones de Fix the conversation", done: nArreglados === ARREGLOS.length },
    { txt: "Ganar estrellas en «¿Abrir, mantener o cerrar?»", done: identifico },
    { txt: "Aprobar el reto evaluable (A2 + A8)", done: quizAprobado },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie: ReactNode = "";
  let escena: {
    escenario: Escenario;
    npc: PersonajeId;
    npcEmo: Emocion;
    npcDice: string | null;
    tuDice: string | null;
    tuAccion: boolean;
    habla: "npc" | "tu" | null;
    orbeColor: string;
  };
  if (modo === "conversar") {
    const et = ETAPA_DEF[turno.etapa];
    chipVivo = `${npcConv.nombre} · turno ${turnoIdx + 1}/${conv.turnos.length} · ${et.en.toUpperCase()} · cortesía ${elegidas.length ? `${med.cort}%` : "—"}`;
    if (fase === "elige") pie = `${et.es} (${et.en}): ${turno.contexto}`;
    else if (ultima) pie = `${CALIDAD_DEF[ultima.calidad].es}. ${ultima.porque}`;
    escena = {
      escenario: conv.escenario,
      npc: conv.npc,
      npcEmo: fase === "elige" ? turno.npcEmo : fase === "fin" && ultima?.calidad === "ideal" ? "despide" : (ultima?.emo ?? "neutral"),
      npcDice: fase === "elige" ? turno.npc : (ultima?.reaccion ?? null),
      tuDice: fase === "elige" ? null : (ultima?.accion ? "(…)" : (ultima?.texto ?? null)),
      tuAccion: !!ultima?.accion,
      habla: fase === "elige" ? (turno.npc ? "npc" : "tu") : ultima?.reaccion ? "npc" : "tu",
      orbeColor: ultima ? CALIDAD_DEF[ultima.calidad].col : modoCol,
    };
  } else if (modo === "registro") {
    const banda = aguja === null ? null : bandaDe(aguja);
    chipVivo = `${npcReg.nombre} · ${prop.es} · ${banda ? `registro ${BANDA_DEF[banda].es}` : "arma tu frase"}`;
    pie = veredicto ? `${veredicto.titulo}. ${veredicto.msg}` : `${it.situacion[propId]} Elige una pieza en cada casilla y mira la aguja: ${it.espera === "informal" ? "con un amigo va bien informal o neutral" : "aquí se espera un registro formal"}.`;
    escena = {
      escenario: it.escenario,
      npc: it.personaje,
      npcEmo: veredicto?.emo ?? "neutral",
      npcDice: veredicto?.respuesta ?? null,
      tuDice: veredicto?.frase ?? null,
      tuAccion: false,
      habla: veredicto ? "npc" : null,
      orbeColor: veredicto ? (veredicto.ok ? OK : veredicto.casi ? "#fbbf24" : WARN) : modoCol,
    };
  } else {
    const paso = arreglado !== undefined ? "arreglada" : detectado ? "reescribe la línea" : "encuentra la línea descortés";
    chipVivo = `${arr.titulo} · ${paso}${play !== null ? ` · línea ${play + 1}/${arr.lineas.length}` : ""}`;
    pie = rev?.ok ? `¡Arreglada! ${npcArr.nombre} ahora responde: «${arr.respuestaOk}»` : fbDetect ? fbDetect.msg : `${arr.situacion} Toca en la torre de turnos (o en el panel) la línea que suena descortés.`;
    let npcDice: string | null = null;
    let tuDice: string | null = null;
    let npcEmo: Emocion = "neutral";
    if (actualArr !== null) {
      for (const i of [actualArr - 1, actualArr]) {
        const l = arr.lineas[i];
        if (!l) continue;
        if (l.quien === "npc") {
          npcDice = textoLinea(i);
          npcEmo = emoLinea(i);
        } else tuDice = textoLinea(i);
      }
      if (actualArr - 1 >= 0 && arr.lineas[actualArr]!.quien === arr.lineas[actualArr - 1]!.quien) {
        if (arr.lineas[actualArr]!.quien === "npc") tuDice = null;
        else npcDice = null;
      }
    }
    escena = {
      escenario: arr.escenario,
      npc: arr.npc,
      npcEmo,
      npcDice,
      tuDice,
      tuAccion: false,
      habla: actualArr === null ? null : arr.lineas[actualArr]!.quien,
      orbeColor: arreglado !== undefined ? OK : detectado ? WARN : modoCol,
    };
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

  const sub = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const btnVoz = (txt: string) => (
    <button className="cc-voz" onClick={() => escuchar(txt)} title="Escuchar en inglés" aria-label="Escuchar en inglés">
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );
  const quien = (nombre: string, col: string) => (
    <span className="cc-quien" style={{ background: col }}>
      {nombre}
    </span>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "conversar") {
    control = (
      <>
        <div className="cc-opts">
          {CONVERSACIONES.map((c, i) => (
            <button key={c.id} className="cc-opt cc-conv" data-on={i === convIdx} onClick={() => elegirConv(i)} style={{ ["--ccc" as string]: modoCol, background: i === convIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${ESCENARIO_DEF[c.escenario].icono}`} style={{ marginRight: 7 }} />
              {c.titulo}
              {convsOk.has(c.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 10 }}>{conv.situacion}</div>
        <div className="cc-etapas" aria-label="Momentos de la conversación">
          {conv.turnos.map((t, i) => {
            const o = opcionesElegidas[i];
            const col = o ? CALIDAD_DEF[o.calidad].col : i === turnoIdx ? ETAPA_DEF[t.etapa].col : "rgba(255,255,255,0.14)";
            return (
              <span key={i} className="cc-paso" style={{ borderColor: col, background: o ? `${col}26` : "transparent" }} title={`${ETAPA_DEF[t.etapa].en} · turno ${i + 1}`}>
                {ETAPA_DEF[t.etapa].en}
              </span>
            );
          })}
        </div>

        {sub(`Turno ${turnoIdx + 1} · ${ETAPA_DEF[turno.etapa].es} (${ETAPA_DEF[turno.etapa].en})`)}
        <div className="cc-dialogo">
          {turno.npc ? (
            <div className="cc-linea">
              {quien(npcConv.nombre, npcConv.aspecto.camisa)}
              <span>{turno.npc}</span>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: T.text2 }}>Abres tú la conversación.</div>
          )}
          <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45 }}>{turno.contexto}</div>
          {turno.npc && <div>{btnVoz(turno.npc)}</div>}
        </div>
        {sinVoz && nota("Tu navegador no tiene voz en inglés; lee las líneas.", T.text3)}

        {sub("¿Qué dices?")}
        <div style={{ display: "grid", gap: 7 }}>
          {orden.map((oIdx) => {
            const o = turno.opciones[oIdx]!;
            const elegidaAqui = fase !== "elige" && elegidas[turnoIdx] === oIdx;
            const col = elegidaAqui ? CALIDAD_DEF[o.calidad].col : modoCol;
            return (
              <button key={oIdx} className="cc-resp" data-on={elegidaAqui} disabled={fase !== "elige"} onClick={() => elegirOpcion(oIdx)} style={{ ["--ccc" as string]: col, fontStyle: o.accion ? "italic" : "normal" }}>
                {o.texto}
              </button>
            );
          })}
        </div>
        {ultima &&
          nota(
            <>
              <strong>{CALIDAD_DEF[ultima.calidad].es}. </strong>
              {ultima.porque}
              {ultima.reaccion && (
                <span style={{ display: "block", marginTop: 5, color: "#fff" }}>
                  {npcConv.nombre} {EMOCION_DEF[ultima.emo].es}: «{ultima.reaccion}»
                </span>
              )}
            </>,
            ultima.calidad === "ideal" ? OK : ultima.calidad === "seca" || ultima.calidad === "fuera" ? "#fbbf24" : WARN,
            ultima.calidad === "ideal" ? "fa-circle-check" : "fa-circle-exclamation",
          )}
        <div className="cc-opts" style={{ marginTop: 10 }}>
          {fase === "responde" && (
            <button className="cc-opt cc-sig" data-on="true" onClick={siguienteTurno} style={{ ["--ccc" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente turno
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          )}
          {(fase === "cortada" || fase === "fin" || elegidas.length > 0) && (
            <button className="cc-opt cc-reiniciar" data-on={fase === "cortada"} onClick={reiniciarConv} style={{ ["--ccc" as string]: modoCol }}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
              {fase === "cortada" ? "La conversación se cortó: empezar de nuevo" : "Empezar de nuevo"}
            </button>
          )}
          {fase === "fin" && convIdx + 1 < CONVERSACIONES.length && (
            <button className="cc-opt cc-sig" data-on="true" onClick={() => elegirConv(convIdx + 1)} style={{ ["--ccc" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente conversación
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          )}
        </div>
        {fase === "fin" && (
          <div className="cc-resumen" style={{ borderColor: `${med.cort === 100 && med.flu === 100 ? OK : "#fbbf24"}66` }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>
              <i className="fa-solid fa-flag-checkered" style={{ marginRight: 8, color: OK }} />
              Conversación completa · cortesía {med.cort}% · fluidez {med.flu}%
            </div>
            <div style={{ fontSize: 14, color: T.text2, marginTop: 5, lineHeight: 1.5 }}>
              {med.cort === 100 && med.flu === 100
                ? "Perfecta: abriste, mantuviste y cerraste con respeto y empatía."
                : "Llegaste al cierre, pero algunas respuestas bajaron los medidores. Empieza de nuevo y busca la respuesta cortés y fluida en cada turno."}
            </div>
          </div>
        )}
      </>
    );
  } else if (modo === "registro") {
    control = (
      <>
        {sub("¿Con quién hablas?")}
        <div className="cc-opts">
          {INTERLOCUTORES.map((x) => {
            const p = PERSONAJES[x.personaje];
            return (
              <button key={x.id} className="cc-opt cc-inter" data-on={x.id === interId} onClick={() => elegirInter(x.id)} style={{ ["--ccc" as string]: modoCol, background: x.id === interId ? `${modoCol}1f` : "transparent" }}>
                <i className={`fa-solid ${ESCENARIO_DEF[x.escenario].icono}`} style={{ marginRight: 7 }} />
                {p.nombre}
                <span style={{ color: T.text3, fontWeight: 700 }}> · {x.espera === "informal" ? "amigo" : x.id === "maestra" ? "maestra" : "desconocida"}</span>
                {intersOk.has(x.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
              </button>
            );
          })}
        </div>
        {sub("¿Qué quieres hacer?")}
        <div className="cc-opts">
          {PROPOSITOS.map((p) => (
            <button key={p.id} className="cc-opt cc-prop" data-on={p.id === propId} onClick={() => elegirProp(p.id)} style={{ ["--ccc" as string]: modoCol, background: p.id === propId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${p.icono}`} style={{ marginRight: 7 }} />
              {p.es}
              {combosOk.has(`${p.id}:${interId}`) && <i className="fa-solid fa-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 10 }}>
          <strong style={{ color: "#fff" }}>{it.situacion[propId]}</strong> {npcReg.nombre} espera un registro <strong style={{ color: "#fbbf24" }}>{it.espera === "informal" ? "informal o neutral" : "formal"}</strong>.
        </div>
        {prop.ranuras.map((r, ri) => (
          <div key={r.etq}>
            {sub(`${ri + 1} · ${r.etq}`)}
            <div className="cc-opts">
              {r.piezas.map((pz) => {
                const on = sel[ri] === pz.id;
                const vista = pz.txt === "" ? "(nada)" : pz.txt.replace("{n}", it.nombre ? `, ${it.nombre}` : "").replace("{base}", it.pedido.base).replace("{ing}", it.pedido.ing);
                return (
                  <button key={pz.id} className="cc-pieza" data-on={on} data-nivel={pz.nivel} onClick={() => elegirPieza(ri, pz.id)} title={pz.nota}>
                    {vista}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {sub("Tu frase")}
        <div className="cc-armado" aria-label="Tu frase">
          {frase ?? <span style={{ color: T.text3 }}>Elige una pieza en cada casilla…</span>}
        </div>
        {aguja !== null && (
          <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>
            Aguja: <strong style={{ color: BANDA_DEF[bandaDe(aguja)].col }}>{BANDA_DEF[bandaDe(aguja)].es}</strong> ({aguja.toFixed(2)} de 2)
          </div>
        )}
        <div className="cc-opts" style={{ marginTop: 10 }}>
          <button className="cc-toggle cc-decir" onClick={decirFrase} disabled={!frase} style={{ ["--ccc" as string]: modoCol }}>
            <i className="fa-solid fa-comment-dots" style={{ marginRight: 9, color: modoCol }} />
            Decírselo a {npcReg.nombre}
          </button>
          {frase && btnVoz(frase)}
        </div>
        {veredicto &&
          nota(
            <>
              <strong>{veredicto.titulo}. </strong>
              {veredicto.msg}
              <span style={{ display: "block", marginTop: 5, color: "#fff" }}>
                {npcReg.nombre} {EMOCION_DEF[veredicto.emo].es}: «{veredicto.respuesta}»
              </span>
            </>,
            veredicto.ok ? OK : veredicto.casi ? "#fbbf24" : WARN,
            veredicto.ok ? "fa-circle-check" : "fa-circle-exclamation",
          )}
        {sinVoz && nota("Tu navegador no tiene voz en inglés; lee las frases.", T.text3)}
      </>
    );
  } else {
    const hayEjemplo = fallosRe >= 2 || arreglado !== undefined;
    control = (
      <>
        <div className="cc-opts">
          {ARREGLOS.map((a, i) => (
            <button key={a.id} className="cc-opt cc-arr" data-on={i === arrIdx} onClick={() => elegirArreglo(i)} style={{ ["--ccc" as string]: modoCol, background: i === arrIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${ESCENARIO_DEF[a.escenario].icono}`} style={{ marginRight: 7 }} />
              {i + 1} · {a.titulo}
              {arreglos[a.id] !== undefined && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 10 }}>{arr.situacion}</div>
        {sub(detectado ? "La conversación · línea detectada" : "1 · Toca la línea que suena descortés")}
        <div className="cc-dialogo">
          {arr.lineas.map((l, i) => {
            const estado = lineasTorre[i]!.estado;
            const col = estado === "mal" ? WARN : estado === "arreglada" ? OK : estado === "elegida" ? "#a78bfa" : "transparent";
            const nombre = l.quien === "tu" ? "Alex" : npcArr.nombre;
            return (
              <button key={i} className="cc-lin" data-activa={actualArr === i} onClick={() => tocarLinea(i)} disabled={detectado || play !== null} style={{ borderColor: col }}>
                {quien(`${i + 1} · ${nombre}`, l.quien === "tu" ? "#60a5fa" : npcArr.aspecto.camisa)}
                <span style={{ textDecorationLine: estado === "mal" && arreglado === undefined ? "line-through" : "none", textDecorationColor: WARN }}>{textoLinea(i)}</span>
              </button>
            );
          })}
        </div>
        {fbDetect && nota(fbDetect.msg, fbDetect.ok ? OK : WARN, fbDetect.ok ? "fa-circle-check" : "fa-circle-xmark")}
        <div className="cc-opts" style={{ marginTop: 10 }}>
          <button className="cc-toggle-sm cc-play" data-on={play !== null} onClick={reproducir} disabled={play !== null}>
            <i className="fa-solid fa-play" style={{ marginRight: 7 }} />
            {arreglado !== undefined ? "Reproducir la conversación arreglada" : "Reproducir la conversación"}
          </button>
          {btnVoz(arr.lineas.map((_, i) => textoLinea(i)).join(" "))}
        </div>

        {detectado && (
          <>
            {sub(`2 · Reescribe la línea ${arr.problema + 1} en inglés · ${TIPO_DEF[arr.tipo].es}`)}
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginBottom: 8 }}>{TIPO_DEF[arr.tipo].regla}</div>
            <textarea
              className="cc-texto"
              aria-label="Tu línea en inglés"
              value={texto}
              rows={2}
              spellCheck={false}
              disabled={arreglado !== undefined}
              placeholder="Escribe aquí tu versión cortés…"
              onChange={(e) => {
                setTexto(e.target.value);
                setRev(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (texto.trim() && arreglado === undefined) revisarTexto();
                }
              }}
            />
            <div className="cc-opts" style={{ marginTop: 8 }}>
              <button className="cc-opt cc-revisar" data-on="true" onClick={revisarTexto} disabled={!texto.trim() || arreglado !== undefined} style={{ ["--ccc" as string]: modoCol }}>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8 }} />
                Revisar mi línea
              </button>
              {texto.trim() && btnVoz(texto)}
            </div>
            {rev && (
              <div style={{ display: "grid", gap: 2 }}>
                {rev.ok && nota(<strong>¡Así sí! {npcArr.nombre} ahora responde: «{arr.respuestaOk}»</strong>, OK, "fa-circle-check")}
                {rev.avisos.map((a, i) => (
                  <div key={i}>{nota(a.texto, a.tipo === "error" ? WARN : "#7dd3fc", a.tipo === "error" ? "fa-triangle-exclamation" : "fa-lightbulb")}</div>
                ))}
              </div>
            )}
            {hayEjemplo && nota(<>Una versión posible: «{arr.ejemplo}» {arreglado === undefined ? "Escríbela a tu manera." : ""}</>, T.text2, "fa-lightbulb")}
            {arreglado !== undefined && arrIdx + 1 < ARREGLOS.length && (
              <div className="cc-opts" style={{ marginTop: 10 }}>
                <button className="cc-opt cc-sig" data-on="true" onClick={() => elegirArreglo(arrIdx + 1)} style={{ ["--ccc" as string]: modoCol, background: `${modoCol}1f` }}>
                  Siguiente conversación
                  <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                </button>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <>
      <style>{`
        .cc-opts { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .cc-opt { cursor:pointer; border:1px solid var(--ccc); border-radius:10px; padding:9px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .cc-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .cc-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cc-opt:disabled { cursor:default; opacity:0.5; }
        .cc-toggle { flex:1 1 180px; min-width:0; cursor:pointer; border:1px solid var(--ccc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
        .cc-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .cc-toggle:disabled { cursor:default; opacity:0.5; }
        .cc-toggle-sm { cursor:pointer; border:1px solid rgba(255,255,255,0.14); border-radius:9px; padding:7px 11px; font-size:14px; font-weight:800; color:rgba(255,255,255,0.75); background:transparent; transition:all .15s; }
        .cc-toggle-sm[data-on="true"] { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.14); }
        .cc-toggle-sm:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cc-toggle-sm:disabled { opacity:0.45; cursor:default; }
        .cc-dialogo { padding:12px 14px; border-radius:12px; background:rgba(248,250,252,0.05); border:1px solid ${T.line}; display:grid; gap:8px; }
        .cc-linea { display:flex; gap:10px; align-items:flex-start; font-size:15px; color:#fff; line-height:1.5; font-weight:700; }
        .cc-quien { flex-shrink:0; font-size:14px; font-weight:900; color:#04121f; padding:3px 7px; border-radius:6px; margin-top:2px; letter-spacing:0.02em; }
        .cc-voz { cursor:pointer; border:1px solid rgba(255,255,255,0.18); border-radius:999px; padding:6px 12px; font-size:14px; font-weight:800; color:#e0f2fe; background:rgba(56,189,248,0.1); }
        .cc-voz:hover { background:rgba(56,189,248,0.2); }
        .cc-etapas { display:flex; gap:6px; margin-top:10px; flex-wrap:wrap; }
        .cc-paso { font-size:14px; font-weight:900; letter-spacing:0.04em; color:#e2e8f0; padding:4px 9px; border-radius:7px; border:1.5px solid; text-transform:uppercase; }
        .cc-resp { cursor:pointer; text-align:left; border:1.5px solid rgba(255,255,255,0.14); border-radius:11px; padding:10px 13px; font-size:15px; font-weight:800; color:#fff; background:rgba(4,10,22,0.4); line-height:1.4; transition:all .15s; }
        .cc-resp:hover:not(:disabled) { border-color:var(--ccc); background:rgba(255,255,255,0.06); transform:translateY(-1px); }
        .cc-resp:disabled { cursor:default; opacity:0.45; }
        .cc-resp[data-on="true"] { opacity:1; border-color:var(--ccc); background:rgba(255,255,255,0.08); }
        .cc-resumen { margin-top:12px; padding:12px 14px; border-radius:12px; border:1px solid; background:rgba(4,10,22,0.45); }
        .cc-pieza { cursor:pointer; border:1.5px solid ${T.lineStrong}; background:rgba(245,158,11,0.07); color:#fff; border-radius:9px; padding:7px 11px; font-size:14px; font-weight:800; transition:all .14s; }
        .cc-pieza[data-on="true"] { border-color:#f59e0b; background:rgba(245,158,11,0.24); box-shadow:0 0 0 2px rgba(245,158,11,0.25); }
        .cc-pieza:hover { border-color:#fbbf24; }
        .cc-armado { min-height:44px; display:flex; align-items:center; padding:9px 12px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:800; line-height:1.4; }
        .cc-lin { cursor:pointer; display:flex; gap:10px; align-items:flex-start; text-align:left; font-size:14px; color:#fff; line-height:1.45; font-weight:700; padding:7px 9px; border-radius:10px; border:1.5px solid transparent; background:rgba(4,10,22,0.3); transition:all .14s; font-family:inherit; }
        .cc-lin:hover:not(:disabled) { background:rgba(167,139,250,0.12); border-color:rgba(167,139,250,0.5) !important; }
        .cc-lin:disabled { cursor:default; }
        .cc-lin[data-activa="true"] { background:rgba(255,255,255,0.09); }
        .cc-texto { width:100%; box-sizing:border-box; resize:vertical; min-height:62px; border-radius:11px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:700; line-height:1.5; padding:10px 12px; font-family:inherit; outline:none; }
        .cc-texto:focus { border-color:#a78bfa; box-shadow:0 0 0 3px rgba(167,139,250,0.2); }
        .cc-opt:focus-visible, .cc-toggle:focus-visible, .cc-resp:focus-visible, .cc-pieza:focus-visible, .cc-lin:focus-visible, .cc-toggle-sm:focus-visible, .cc-voz:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <CortesiaScene
              vista={modo}
              modoColor={modoCol}
              resetNonce={resetNonce}
              escenario={escena.escenario}
              npc={escena.npc}
              npcEmo={escena.npcEmo}
              npcDice={escena.npcDice}
              tuDice={escena.tuDice}
              tuAccion={escena.tuAccion}
              habla={escena.habla}
              orbeColor={escena.orbeColor}
              etapa={fase === "fin" || fase === "cortada" ? null : turno.etapa}
              etapasHechas={etapasHechas}
              cortesia={elegidas.length ? med.cort : null}
              fluidez={elegidas.length ? med.flu : null}
              aguja={aguja}
              objetivo={it.espera}
              lineas={lineasTorre}
              onTocarLinea={tocarLinea}
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
            <span style={{ color: T.text2 }}>{ESCENARIO_DEF[escena.escenario].es}</span>
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
                <EtapasCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

                <RetoQuizCard quiz={QUIZ} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ya puedes abrir, mantener y cerrar una conversación con cortesía." />

                <div style={{ ...card, padding: "18px 16px 20px", marginTop: 18 }}>
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
                <Bloque titulo="Hi! How have you been?" icono="fa-comments">
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
                </Bloque>

                <Bloque titulo="Glosario A1" icono="fa-book-open">
                  <div style={{ color: "#fff", fontWeight: 800, lineHeight: 1.4 }}>{TITULO_A1}</div>
                  <div style={{ display: "grid", gap: 9 }}>
                    {GLOSARIO_A1.map((g) => (
                      <div key={g.termino} style={{ color: T.text2, lineHeight: 1.5 }}>
                        <strong style={{ color: "#7dd3fc" }}>{g.termino}.</strong> {g.definicion}
                        <div style={{ color: T.text3, marginTop: 3 }}>
                          <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: "#7dd3fc" }} />
                          {g.ejemplo}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>ACTIVIDAD</div>
                  <div style={{ color: T.text2, lineHeight: 1.45 }}>{ACTIVIDAD_A1}</div>
                </Bloque>

                <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                  <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                    {INSTRUCCIONES.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                </Bloque>

                <Bloque titulo="Hechos: True or False (A4)" icono="fa-scale-balanced">
                  <div style={{ display: "grid", gap: 8 }}>
                    {HECHOS_A4.map((h, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                        <span style={{ flexShrink: 0, fontSize: 14, fontWeight: 900, padding: "3px 7px", borderRadius: 6, color: "#04121f", background: h.respuesta ? OK : WARN }}>{h.respuesta ? "TRUE" : "FALSE"}</span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: "block", color: "#fff", fontWeight: 700, lineHeight: 1.45 }}>{h.enunciado}</span>
                          <span style={{ display: "block", color: T.text2, lineHeight: 1.45, marginTop: 3 }}>{h.retroalimentacion}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </Bloque>

                <Bloque titulo="Glosario (A5)" icono="fa-book">
                  <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))" }}>
                    {GLOSARIO_A5.map((gi, i) => (
                      <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{gi.etiqueta}</span>
                        <div>
                          <span style={{ fontWeight: 900, color: accent }}>{gi.termino} </span>
                          <span style={{ color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                        </div>
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

                <Bloque titulo="Tu turno fuera del laboratorio (A3 y video A8)" icono="fa-pen-nib">
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>
                    <strong style={{ color: "#fff" }}>Escritura (A3):</strong> {ESCRITURA_A3}
                  </div>
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>
                    <strong style={{ color: "#fff" }}>Video A8 — {VIDEO_A8.titulo}:</strong> {VIDEO_A8.abierta}
                  </div>
                </Bloque>

                <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9, color: T.text2, lineHeight: 1.45 }}>
                    {IDEAS.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Bloque>

                <Bloque titulo="¿Cómo voy? (autoevaluaciones A3 y A7)" icono="fa-list-check">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 7, color: T.text2, lineHeight: 1.45 }}>
                    {[...AUTOEVALUACION_A3, ...AUTOEVALUACION_A7].map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                  <div style={{ color: T.text2, fontStyle: "italic" }}>{REFLEXION_A7}</div>
                </Bloque>

                <Bloque titulo="Qué es verbatim y qué es ilustrativo" icono="fa-circle-info">
                  <div style={{ color: T.text3, lineHeight: 1.5 }}>
                    Los glosarios A1 y A5, el quiz A2 (enunciados, opciones y retroalimentaciones), el verdadero/falso A4, el texto A6, los criterios y escrituras de las autoevaluaciones A3 y A7, y
                    el título, la descripción y las preguntas del video A8 son <strong>verbatim</strong> de la plataforma (las retroalimentaciones de las dos preguntas del video A8 son del
                    laboratorio porque la actividad no las trae; la relación de columnas A9 repite términos del glosario A1 y no se duplica). Las conversaciones, los personajes (Alex, Carlos,
                    Sofía, Emily, Lupita, Ms. Ramírez), la Clínica Los Pinos, las piezas de registro y los diálogos por arreglar son <strong>ilustrativos</strong>: personas y lugares
                    ficticios. Los medidores de cortesía y fluidez y la aguja de registro son un <strong>modelo didáctico</strong> (promedios de niveles asignados por el laboratorio), no una
                    medida lingüística estándar; la validación de lo escrito es tolerante (mayúsculas, puntuación y contracciones como I&apos;m / I am), pero no reconoce todas las respuestas
                    correctas posibles. Las oraciones en inglés siguen el inglés estadounidense estándar. Fuente: {FUENTE}
                  </div>
                </Bloque>

                <FichaTeorica data={CORTESIA_CONVERSACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </>
            ),
          },
        ]}
      />
    </>
  );
}
