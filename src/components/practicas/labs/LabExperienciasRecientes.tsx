"use client";

/**
 * Laboratorio — Have you ever…? Compartir experiencias recientes
 * Progresión IN-III-P02 (Inglés III, semestre 3). Ancla evaluable: IN-III-P02-A4.
 *
 * Ya existe un laboratorio de present perfect (`present-perfect-ingles`, de
 * IN-V-P02) y hace lo que se espera: clasifica oraciones sueltas por tiempo
 * verbal y empareja estructuras con su definición. Repetir eso aquí no serviría
 * de nada, así que este laboratorio trabaja lo que aquél no toca: LA
 * CONVERSACIÓN.
 *
 * Porque el problema real del alumno no es conjugar «I have visited»: es que la
 * charla no se queda en present perfect. La pregunta abre ahí («Have you ever
 * tried chapulines?»), la respuesta corta contesta con el mismo auxiliar
 * («Yes, I have.») y en cuanto alguien pregunta cuándo, dónde o con quién, el
 * inglés SALTA al past simple («I tried them last year»). Ese salto —«Yes, I
 * have. I went there last summer»— es el corazón de la progresión y es donde
 * todo el mundo se atora.
 *
 * Modo 0 — «La entrevista del club» (SIMULADOR): la maestra Rivas entrevista al
 * alumno con su línea de tiempo delante; la oración que elige decide qué ANOTA
 * el club (marca correcta, un «?» si no lo entendió, o una marca falsa en rojo si
 * la oración contradice el perfil).
 *
 * Y cuatro modos de práctica, cuatro actos distintos:
 *  1. «Arma la charla» — cuatro intercambios entre dos estudiantes, turno por
 *     turno. Tres líneas posibles y sólo una encaja. Los distractores son los
 *     errores reales («Yes, I did», una fecha metida en el present perfect) y,
 *     en varios casos, inglés correcto que comunica OTRA COSA; la explicación
 *     lo dice así, sin llamarlo «mal».
 *  2. «¿Cuál va y dónde?» — ever, never, already, yet, just, for y since. El
 *     alumno elige la palabra Y su lugar, y ve la frase que le quedó antes de
 *     saber si acertó. Se distingue lo imposible de lo que existe pero
 *     significa otra cosa.
 *  3. «¿Le pones fecha?» — la misma vivencia contada de dos maneras. Pega la
 *     marca de tiempo y la frase tiene que cambiar de tiempo verbal; quítala y
 *     vuelve al present perfect. «I have visited Oaxaca» / «I visited Oaxaca in
 *     2024».
 *  4. «Completa el texto» — el párrafo de A2, escribiendo.
 *
 * La escena es una LÍNEA DE VIDA: una banda que cubre toda la vida hasta hoy
 * cuando la frase va en present perfect, y un alfiler clavado en un punto
 * cuando la frase lleva fecha. El alumno ve la gramática, no sólo la lee.
 *
 * DOM puro (sin three.js). Interfaz y explicaciones en español de México; el
 * contenido evaluado, en inglés estadounidense estándar.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { hablarLab, callarLab, puedeHablarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { EXPERIENCIAS_RECIENTES_INGLES_FICHA } from "./experiencias-recientes-ingles-ficha";
import {
  PREGUNTAS,
  resumen,
  estrellasEntrevista,
  type PreguntaSim,
  type ResumenSim,
} from "./experiencias-recientes-sim";
import {
  CHARLAS,
  FOCO_INFO,
  MARCADORES,
  EXPERIENCIAS,
  HUECOS_A2,
  QUIZ_A4,
  LECTURA_A1,
  CALLOUT_A1,
  PREGUNTAS_A1,
  GLOSARIO_A5,
  TAREA_A3,
  DEL_VIDEO_A9,
  FRASE_CLAVE,
  TOTAL_TURNOS,
  TURNOS_SALTO,
  type ItemMarcador,
  type Hablante,
} from "./experiencias-recientes-ingles-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-experiencias-recientes-ingles-reto";
const META_PRIMERAS = 12;
const META_ESCUCHAS = 5;

/** Los seis primeros ítems del modo 2 son de posición; los cuatro últimos, de for/since. */
const MK_POSICION = MARCADORES.filter((m) => !m.ranurasActivas);
const MK_DESDE = MARCADORES.filter((m) => m.ranurasActivas);

type Modo = "simulador" | "charla" | "marcador" | "fecha" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "simulador", label: "La entrevista del club", icono: "fa-id-card" },
  { id: "charla", label: "Arma la charla", icono: "fa-comments" },
  { id: "marcador", label: "¿Cuál va y dónde?", icono: "fa-arrows-left-right-to-line" },
  { id: "fecha", label: "¿Le pones fecha?", icono: "fa-calendar-day" },
  { id: "texto", label: "Completa el texto", icono: "fa-keyboard" },
];

/* ── utilidades puras ─────────────────────────────────────────────────── */

/** PRNG con semilla: el orden de las opciones es el mismo en cada carga. */
function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function baraja(n: number, rnd: () => number): number[] {
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

/** Orden fijo de las opciones de cada turno, para que la buena no caiga siempre igual. */
const ORDEN_TURNO: Record<string, number[]> = (() => {
  const rnd = mulberry32(20260921);
  const out: Record<string, number[]> = {};
  for (const c of CHARLAS) for (const t of c.turnos) out[t.id] = baraja(t.opciones.length, rnd);
  return out;
})();

/** Orden fijo de las opciones de cada estado de cada experiencia. */
const ORDEN_EXP: Record<string, number[]> = (() => {
  const rnd = mulberry32(777001);
  const out: Record<string, number[]> = {};
  for (const e of EXPERIENCIAS) {
    out[`${e.id}:sin`] = baraja(e.sinFecha.opciones.length, rnd);
    out[`${e.id}:con`] = baraja(e.conFecha.opciones.length, rnd);
  }
  return out;
})();

/** Arma la oración con la ficha puesta en esa ranura, para enseñarla tal cual queda. */
function armarFrase(item: ItemMarcador, ficha: string, ranura: number): string {
  const trozos: string[] = [];
  item.partes.forEach((p, i) => {
    trozos.push(p);
    if (i === ranura) trozos.push(ficha);
  });
  const cuerpo = trozos.join(" ");
  return item.cierre === "?" || item.cierre === "." ? cuerpo + item.cierre : `${cuerpo} ${item.cierre}`;
}

function BotonEscuchar({ texto, onPlay }: { texto: string; onPlay: () => void }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button
      type="button"
      className="exr-escuchar"
      title="Escuchar en inglés"
      aria-label={`Escuchar: ${texto}`}
      onClick={(e) => {
        e.stopPropagation();
        hablarLab(texto);
        onPlay();
      }}
    >
      <i className="fa-solid fa-volume-high" />
      Escuchar
    </button>
  );
}

/* ── la escena: la línea de vida y los dos que conversan ──────────────── */

type TipoLinea = "banda" | "pin" | "desde" | "nada";

function LineaDeVida({ tipo, pos, accent, rgba }: { tipo: TipoLinea; pos: number; accent: string; rgba: string }) {
  const x0 = 54;
  const x1 = 546;
  const px = x0 + (x1 - x0) * Math.min(1, Math.max(0, pos));
  return (
    <svg viewBox="0 0 600 72" className="exr-svg" aria-hidden focusable="false">
      <line x1={x0} y1={46} x2={x1} y2={46} stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeLinecap="round" />
      {tipo === "banda" && <rect x={x0} y={36} width={x1 - x0} height={20} rx={10} fill={`rgba(${rgba},0.26)`} stroke={accent} strokeWidth={1.5} />}
      {tipo === "desde" && <rect x={px} y={36} width={Math.max(6, x1 - px)} height={20} rx={10} fill={`rgba(${rgba},0.26)`} stroke={accent} strokeWidth={1.5} />}
      {(tipo === "pin" || tipo === "desde") && (
        <>
          <line x1={px} y1={22} x2={px} y2={58} stroke={accent} strokeWidth={3} strokeLinecap="round" />
          <circle cx={px} cy={19} r={6.5} fill={accent} />
        </>
      )}
      <circle cx={x1} cy={46} r={5} fill="#ffffff" opacity={0.85} />
      <text x={x0 - 6} y={50} textAnchor="end" fontSize={11} fontWeight={800} fill="rgba(255,255,255,0.42)">
        antes
      </text>
      <text x={x1 + 6} y={50} textAnchor="start" fontSize={11} fontWeight={800} fill="rgba(255,255,255,0.72)">
        NOW
      </text>
    </svg>
  );
}

function Persona({ lado, activo, accent }: { lado: "izq" | "der"; activo: boolean; accent: string }) {
  const col = activo ? accent : "rgba(255,255,255,0.44)";
  return (
    <svg width={70} height={96} viewBox="0 0 70 96" aria-hidden focusable="false">
      <ellipse cx="35" cy="91" rx="24" ry="4.5" fill="rgba(0,0,0,0.4)" />
      <circle cx="35" cy="22" r="13.5" fill={col} opacity={activo ? 0.98 : 0.76} />
      <path d="M16 88 Q16 45 35 43 Q54 45 54 88 Z" fill={col} opacity={activo ? 0.9 : 0.6} />
      {lado === "izq" ? (
        // la mochila de quien llega a la escuela
        <rect x="8" y="52" width="11" height="24" rx="4" fill="rgba(255,255,255,0.26)" />
      ) : (
        // la gorra de quien ya estaba ahí
        <path d="M21 14 Q35 2 49 14 L52 17 L18 17 Z" fill="rgba(255,255,255,0.3)" />
      )}
    </svg>
  );
}

function Escena({
  tipo,
  pos,
  rotulo,
  nombreA,
  nombreB,
  hablante,
  burbuja,
  es,
  veredicto,
  accent,
  rgba,
}: {
  tipo: TipoLinea;
  pos: number;
  rotulo: string;
  nombreA: string;
  nombreB: string;
  hablante: Hablante | null;
  burbuja: string | null;
  es: string | null;
  veredicto: "ok" | "mal" | null;
  accent: string;
  rgba: string;
}) {
  return (
    <div className="exr-escena">
      <div className="exr-linea">
        <LineaDeVida tipo={tipo} pos={pos} accent={accent} rgba={rgba} />
        <span className="exr-rotulo">{rotulo}</span>
      </div>
      <div className="exr-piso">
        <div className="exr-persona" data-on={hablante === "a"}>
          <Persona lado="izq" activo={hablante === "a"} accent={accent} />
          <span className="exr-etq">{nombreA}</span>
        </div>

        <div className="exr-burbuja-zona">
          {burbuja ? (
            <div
              className="exr-burbuja"
              data-ver={veredicto ?? "neutro"}
              style={veredicto === null ? { borderColor: `rgba(${rgba},0.45)` } : undefined}
            >
              <span className="exr-burbuja-en">{burbuja}</span>
              {es ? <span className="exr-burbuja-es">{es}</span> : null}
            </div>
          ) : (
            <div className="exr-burbuja exr-burbuja-vacia">
              <i className="fa-solid fa-ellipsis" />
            </div>
          )}
        </div>

        <div className="exr-persona" data-on={hablante === "b"}>
          <Persona lado="der" activo={hablante === "b"} accent={accent} />
          <span className="exr-etq">{nombreB}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * El laboratorio
 * ═══════════════════════════════════════════════════════════════════════════ */

export function LabExperienciasRecientes({ color }: PracticaLabProps) {
  const accent = color.hex;
  const [modo, setModo] = useState<Modo>("simulador");
  const [teoriaVista, setTeoriaVista] = useState(false);
  const [escuchados, setEscuchados] = useState(0);
  const partida = usePartida();

  /* ── sonido ───────────────────────────────────────────────────────────── */
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      callarLab();
    };
  }, []);
  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabSfx();
      await audioRef.current.enable();
      setSonido(true);
    } else {
      audioRef.current?.mute();
      setSonido(false);
    }
  };
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxBien = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };
  const contarEscucha = () => setEscuchados((n) => n + 1);

  /* ── MODO 1 · Arma la charla ──────────────────────────────────────────── */
  const [chIdx, setChIdx] = useState(0);
  const [avance, setAvance] = useState<Record<string, number>>({});
  const [tocadasTurno, setTocadasTurno] = useState<Record<string, number[]>>({});
  const [turnosOk, setTurnosOk] = useState<Record<string, boolean>>({});
  const [primeras, setPrimeras] = useState(0);

  const charla = CHARLAS[Math.min(chIdx, CHARLAS.length - 1)]!;
  const puestos = avance[charla.id] ?? 0;
  const turnoActual = charla.turnos[puestos] ?? null;
  const tocadasActual = turnoActual ? tocadasTurno[turnoActual.id] ?? [] : [];

  const elegirTurno = (oi: number) => {
    if (!turnoActual) return;
    if (tocadasActual.includes(oi)) return;
    const op = turnoActual.opciones[oi];
    if (!op) return;
    const previas = tocadasActual.length;
    const tid = turnoActual.id;
    setTocadasTurno((m) => ({ ...m, [tid]: [...(m[tid] ?? []), oi] }));
    if (op.correcta) {
      setTurnosOk((m) => ({ ...m, [tid]: true }));
      setAvance((m) => ({ ...m, [charla.id]: puestos + 1 }));
      if (previas === 0) setPrimeras((n) => n + 1);
      sfxBien();
      if (puestos + 1 >= charla.turnos.length) sfxOk();
    } else {
      sfxNo();
    }
  };
  const resetCharla = () => {
    setAvance({});
    setTocadasTurno({});
    setTurnosOk({});
    setPrimeras(0);
    setChIdx(0);
  };

  /* ── MODO 2 · ¿Cuál va y dónde? ───────────────────────────────────────── */
  const [mkIdx, setMkIdx] = useState(0);
  const [fichaSel, setFichaSel] = useState<string | null>(null);
  const [mkOk, setMkOk] = useState<Record<string, boolean>>({});
  const [mkPrueba, setMkPrueba] = useState<{ id: string; frase: string; ok: boolean; motivo: string } | null>(null);
  const [shakeRanura, setShakeRanura] = useState<number | null>(null);

  const mkItem = MARCADORES[Math.min(mkIdx, MARCADORES.length - 1)]!;
  const mkResuelto = mkOk[mkItem.id] === true;
  const ranurasActivas = mkItem.ranurasActivas ?? mkItem.partes.map((_, i) => i);

  const colocarFicha = (ranura: number) => {
    if (mkResuelto || !fichaSel) return;
    const frase = armarFrase(mkItem, fichaSel, ranura);
    const buenaFicha = fichaSel === mkItem.fichaCorrecta;
    const buenaRanura = ranura === mkItem.ranuraCorrecta;
    if (buenaFicha && buenaRanura) {
      setMkOk((m) => ({ ...m, [mkItem.id]: true }));
      setMkPrueba({ id: mkItem.id, frase, ok: true, motivo: mkItem.regla });
      setFichaSel(null);
      sfxBien();
      return;
    }
    const motivo = buenaFicha
      ? mkItem.porRanura[String(ranura)] ?? "Esa palabra sí es, pero no va en ese lugar."
      : mkItem.porFicha[fichaSel] ?? "Esa palabra no es la que pide esta frase.";
    setMkPrueba({ id: mkItem.id, frase, ok: false, motivo });
    setShakeRanura(ranura);
    sfxNo();
    window.setTimeout(() => setShakeRanura(null), 420);
  };
  const resetMarcador = () => {
    setMkOk({});
    setMkPrueba(null);
    setFichaSel(null);
    setMkIdx(0);
  };

  /* ── MODO 3 · ¿Le pones fecha? ────────────────────────────────────────── */
  const [expIdx, setExpIdx] = useState(0);
  const [fechaPuesta, setFechaPuesta] = useState(false);
  const [exOk, setExOk] = useState<Record<string, boolean>>({});
  const [exTocadas, setExTocadas] = useState<Record<string, number[]>>({});
  const [exAviso, setExAviso] = useState<{ clave: string; texto: string; ok: boolean; frase: string } | null>(null);

  const exp = EXPERIENCIAS[Math.min(expIdx, EXPERIENCIAS.length - 1)]!;
  const estado: "sin" | "con" = fechaPuesta ? "con" : "sin";
  const claveEx = `${exp.id}:${estado}`;
  const bloqueEx = fechaPuesta ? exp.conFecha : exp.sinFecha;
  const exResuelto = exOk[claveEx] === true;

  const elegirFrase = (oi: number) => {
    if (exResuelto) return;
    const tocadas = exTocadas[claveEx] ?? [];
    if (tocadas.includes(oi)) return;
    const op = bloqueEx.opciones[oi];
    if (!op) return;
    setExTocadas((m) => ({ ...m, [claveEx]: [...tocadas, oi] }));
    setExAviso({ clave: claveEx, texto: op.nota, ok: op.correcta, frase: op.texto });
    if (op.correcta) {
      setExOk((m) => ({ ...m, [claveEx]: true }));
      sfxBien();
    } else {
      sfxNo();
    }
  };
  const resetFecha = () => {
    setExOk({});
    setExTocadas({});
    setExAviso(null);
    setFechaPuesta(false);
    setExpIdx(0);
  };

  /* ── MODO 4 · Completa el texto ───────────────────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── SIMULADOR · La entrevista del club ───────────────────────────────── */
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const [entIdx, setEntIdx] = useState(0);
  const [entElegidas, setEntElegidas] = useState<Record<string, number>>({});
  const res = resumen(entElegidas);
  const entDone = res.hechas >= PREGUNTAS.length;
  const estrellasEnt = estrellasEntrevista(res);
  const bestEstrellas = Math.max(estrellasEnt, mejor);

  const responderEntrevista = (ri: number) => {
    const p = PREGUNTAS[entIdx]!;
    if (entElegidas[p.id] !== undefined) return;
    const r = p.respuestas[ri];
    if (!r) return;
    const siguiente = { ...entElegidas, [p.id]: ri };
    setEntElegidas(siguiente);
    if (r.clase === "ok") sfxBien();
    else sfxNo();
    const rs = resumen(siguiente);
    if (rs.hechas >= PREGUNTAS.length) {
      registraEstrellas(estrellasEntrevista(rs));
      sfxOk();
    }
  };
  const irEntrevista = (i: number) => {
    const n = PREGUNTAS.length;
    setEntIdx(((i % n) + n) % n);
  };
  const resetEntrevista = () => {
    setEntIdx(0);
    setEntElegidas({});
    partida.reiniciar();
  };

  /* ── progreso ─────────────────────────────────────────────────────────── */
  const charlaDone = CHARLAS.every((c) => (avance[c.id] ?? 0) >= c.turnos.length);
  const saltosOk = TURNOS_SALTO.filter((id) => turnosOk[id]).length;
  const posDone = MK_POSICION.every((m) => mkOk[m.id]);
  const desdeDone = MK_DESDE.every((m) => mkOk[m.id]);
  const fechaDone = EXPERIENCIAS.every((e) => exOk[`${e.id}:sin`] && exOk[`${e.id}:con`]);
  const todoHecho = charlaDone && posDone && desdeDone && fechaDone && textoDone && quizAprobado;

  const objetivos = [
    { txt: `Responde las ${PREGUNTAS.length} preguntas de la entrevista del club`, done: entDone },
    { txt: "Logra que la maestra anote lo cierto en las 5", done: res.exactas >= PREGUNTAS.length },
    { txt: `Arma las ${CHARLAS.length} charlas completas (${TOTAL_TURNOS} turnos)`, done: charlaDone },
    { txt: `Acierta a la primera en ${META_PRIMERAS} turnos o más`, done: primeras >= META_PRIMERAS },
    { txt: `Resuelve los ${TURNOS_SALTO.length} seguimientos que saltan al past simple`, done: saltosOk >= TURNOS_SALTO.length },
    { txt: `Coloca en su sitio los ${MK_POSICION.length} marcadores (ever, never, already, yet, just)`, done: posDone },
    { txt: `Decide entre for y since en los ${MK_DESDE.length} casos`, done: desdeDone },
    { txt: `Cuenta las ${EXPERIENCIAS.length} experiencias con fecha y sin fecha`, done: fechaDone },
    { txt: `Completa el párrafo de A2 con sus ${HUECOS_A2.huecos.length} formas verbales`, done: textoDone, modo: "texto" },
    { txt: `Escucha ${META_ESCUCHAS} frases en inglés`, done: escuchados >= META_ESCUCHAS },
    { txt: "Abre la ficha teórica y revisa la lectura A1", done: teoriaVista },
    { txt: "Aprueba el reto evaluable (quiz A4)", done: quizAprobado },
    { txt: "Termina la sesión con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  const resetActual = modo === "simulador" ? resetEntrevista : modo === "charla" ? resetCharla : modo === "marcador" ? resetMarcador : modo === "fecha" ? resetFecha : resetTexto;

  /* ── lo que se ve en la escena según el modo ──────────────────────────── */
  const ultimoTurno = puestos > 0 ? charla.turnos[puestos - 1] ?? null : null;
  const lineaCharla = turnoActual ? FOCO_INFO[turnoActual.foco].linea : "pin";
  const exUltima = exAviso && exAviso.clave === claveEx ? exAviso : null;

  const escena: {
    tipo: TipoLinea;
    pos: number;
    rotulo: string;
    hablante: Hablante | null;
    burbuja: string | null;
    es: string | null;
    veredicto: "ok" | "mal" | null;
  } =
    modo === "charla"
      ? {
          tipo: lineaCharla,
          pos: 0.58,
          rotulo: turnoActual ? FOCO_INFO[turnoActual.foco].titulo : "Charla completa",
          hablante: turnoActual ? turnoActual.quien : ultimoTurno?.quien ?? null,
          burbuja: ultimoTurno ? ultimoTurno.opciones.find((o) => o.correcta)?.texto ?? null : null,
          es: ultimoTurno?.es ?? null,
          veredicto: ultimoTurno ? "ok" : null,
        }
      : modo === "marcador"
        ? {
            tipo: mkItem.ranurasActivas ? "desde" : "banda",
            pos: 0.34,
            rotulo: mkItem.ranurasActivas ? "for / since: empezó antes y sigue hoy" : "Toda la vida hasta hoy",
            hablante: "a" as Hablante | null,
            burbuja: mkPrueba && mkPrueba.id === mkItem.id ? mkPrueba.frase : null,
            es: mkPrueba && mkPrueba.id === mkItem.id && mkPrueba.ok ? mkItem.es : null,
            veredicto: mkPrueba && mkPrueba.id === mkItem.id ? (mkPrueba.ok ? "ok" : "mal") : null,
          }
        : modo === "fecha"
          ? {
              tipo: fechaPuesta ? "pin" : "banda",
              pos: exp.posLinea,
              rotulo: fechaPuesta ? `Con fecha: ${exp.fecha}` : "Sin fecha: la experiencia",
              hablante: "b" as Hablante | null,
              burbuja: exUltima ? exUltima.frase : null,
              es: null,
              veredicto: exUltima ? (exUltima.ok ? "ok" : "mal") : null,
            }
          : {
              // El párrafo de A2 va entero en present perfect: la banda cubre toda la vida.
              tipo: "banda" as TipoLinea,
              pos: 0.5,
              rotulo: "Maria and her brother · sin fecha",
              hablante: "a" as Hablante | null,
              burbuja: "Have you ever visited another country?",
              es: "¿Alguna vez has visitado otro país?",
              veredicto: null,
            };

  const lectura =
    modo === "simulador" ? (
      <>
        El club entendió {res.entendidas}/{res.hechas} · Exactas {res.exactas}/{PREGUNTAS.length}
      </>
    ) : (
      <>Sin fecha: present perfect · con fecha: past simple</>
    );

  const consejo =
    modo === "simulador" ? (
      <>
        Lo que dices decide qué anota el club: una oración mal armada es un <strong style={{ color: T.text }}>«?»</strong>, y una bien armada pero
        contraria a tu perfil queda <strong style={{ color: T.text }}>en rojo</strong>. Todo el truco: <strong style={{ color: T.text }}>{FRASE_CLAVE}</strong>
      </>
    ) : modo === "charla" ? (
      <>
        Todo el truco cabe en dos renglones: <strong style={{ color: T.text }}>{FRASE_CLAVE}</strong> La pregunta y la respuesta corta van en present
        perfect; el detalle, que ya trae fecha, va en past simple.
      </>
    ) : modo === "marcador" ? (
      <>
        <strong style={{ color: T.text }}>ever, never, already, just</strong> y <strong style={{ color: T.text }}>always</strong> van entre el auxiliar y el
        participio; <strong style={{ color: T.text }}>yet</strong> va al final, y sólo en preguntas y negativas. <strong style={{ color: T.text }}>for</strong>{" "}
        pide una duración y <strong style={{ color: T.text }}>since</strong> un punto de inicio.
      </>
    ) : modo === "fecha" ? (
      <>
        La pregunta de siempre: <strong style={{ color: T.text }}>¿la frase dice cuándo?</strong> Si no lo dice, present perfect. Si lo dice —un año, un mes,
        «last Saturday», «two summers ago», «when I was twelve»—, past simple. No hay término medio.
      </>
    ) : (
      <>
        Este es el párrafo de la actividad <strong style={{ color: T.text }}>A2</strong>, tal cual. Escribe la forma verbal completa (has visited,
        haven&apos;t seen…); no se distinguen mayúsculas.
      </>
    );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      dom
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })),
        valor: modo,
        cambiar: (id) => setModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{`
        @keyframes exrShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes exrPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .exr-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:10px 16px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .exr-btn:hover:not(:disabled) { border-color:${accent}; }
        .exr-btn:disabled { opacity:.38; cursor:not-allowed; }
        .exr-escuchar { cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px;
          border:1px solid rgba(${color.rgba},0.4); background:rgba(${color.rgba},0.12); color:#fff; font-size:14px; font-weight:800; transition:all .14s; }
        .exr-escuchar:hover { background:rgba(${color.rgba},0.26); }
        .exr-divider { height:1px; background:${T.line}; margin:16px 0; }

        /* Escena: línea de vida + los dos que conversan */
        .exr-escena { border-radius:18px; border:1px solid ${T.line}; overflow:hidden;
          background:linear-gradient(180deg, rgba(${color.rgba},0.13) 0%, rgba(2,12,28,0.72) 62%); }
        .exr-linea { padding:14px 22px 0; position:relative; }
        .exr-svg { display:block; width:100%; height:auto; }
        .exr-rotulo { display:block; text-align:center; font-size:14px; font-weight:800; letter-spacing:.06em;
          text-transform:uppercase; color:${T.text3}; margin-top:2px; }
        .exr-piso { display:flex; align-items:flex-end; justify-content:space-between; gap:14px; padding:10px 22px 18px; }
        .exr-persona { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; opacity:.6; transition:opacity .2s; }
        .exr-persona[data-on="true"] { opacity:1; }
        .exr-etq { font-size:14px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:${T.text3}; }
        .exr-burbuja-zona { flex:1; min-width:0; display:flex; justify-content:center; align-items:flex-end; padding-bottom:18px; }
        .exr-burbuja { max-width:100%; border-radius:16px; border:1.5px solid ${T.lineStrong}; background:rgba(2,12,28,0.82);
          padding:12px 17px; display:flex; flex-direction:column; gap:4px; text-align:center; animation:exrPop .22s ease; }
        .exr-burbuja[data-ver="ok"] { border-color:${OK}; background:${OK}14; }
        .exr-burbuja[data-ver="mal"] { border-color:${NO}; background:${NO}12; }
        .exr-burbuja-vacia { color:${T.text3}; font-size:16px; padding:10px 17px; }
        .exr-burbuja-en { font-size:15.5px; font-weight:800; color:#fff; line-height:1.4; }
        .exr-burbuja-es { font-size:14px; color:${T.text3}; font-style:italic; }

        /* Opciones de línea */
        .exr-opt { cursor:pointer; display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left;
          border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:14.5px; font-weight:700; padding:13px 16px; transition:all .14s; }
        .exr-opt:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .exr-opt:disabled { cursor:default; }
        .exr-opt[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .exr-opt[data-bad="true"] { border-color:${NO}; background:${NO}16; color:#fff; }
        .exr-letra { flex-shrink:0; width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:900; border:1px solid ${T.line}; color:${T.text3}; }

        /* Hilo de la charla */
        .exr-hilo { display:flex; flex-direction:column; gap:10px; }
        .exr-msg { border-radius:15px; padding:11px 15px; max-width:88%; animation:exrPop .22s ease; line-height:1.45; }
        .exr-msg[data-quien="a"] { align-self:flex-start; background:rgba(255,255,255,0.07); border:1px solid ${T.line}; }
        .exr-msg[data-quien="b"] { align-self:flex-end; background:rgba(${color.rgba},0.16); border:1px solid rgba(${color.rgba},0.38); }
        .exr-quien { flex-shrink:0; font-size:14px; font-weight:900; letter-spacing:.08em; text-transform:uppercase;
          padding:3px 8px; border-radius:999px; border:1px solid ${T.line}; color:${T.text3}; }

        /* Frase con ranuras */
        .exr-frase { display:flex; flex-wrap:wrap; align-items:center; gap:7px; font-size:17px; font-weight:800; color:#fff; line-height:1.9; }
        .exr-ranura { cursor:pointer; min-width:60px; height:34px; padding:0 12px; border-radius:9px; border:1.5px dashed ${T.lineStrong};
          background:${T.inset}; color:${T.text3}; font-size:14px; font-weight:800; transition:all .14s; }
        .exr-ranura:hover:not(:disabled) { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.14); }
        .exr-ranura[data-shake="true"] { animation:exrShake .4s; border-color:${NO}; }
        .exr-ranura[data-lleno="true"] { border-style:solid; border-color:${OK}; background:${OK}1c; color:#fff; }
        .exr-ranura:disabled { cursor:default; }

        /* Fichas, cubetas y filas */
        .exr-chip { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:11px 18px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:800; transition:all .14s; user-select:none; }
        .exr-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .exr-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .exr-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; }
        .exr-bin[data-activo="false"] { opacity:.55; }
        .exr-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 16px; transition:all .16s; }
        .exr-row[data-done="true"] { border-color:${OK}55; background:${OK}0d; }
        .exr-pastilla { cursor:pointer; width:28px; height:28px; border-radius:8px; font-size:14px; font-weight:900;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text3}; transition:all .14s; }
        .exr-pastilla[data-on="true"] { border-color:${accent}; color:#fff; }
        .exr-pastilla[data-done="true"] { background:${OK}22; color:${OK}; }

        @media (max-width: 860px){ .exr-piso { flex-wrap:wrap; justify-content:center; } .exr-burbuja-zona { order:-1; width:100%; padding-bottom:10px; } }
        /* Simulador «La entrevista del club» */
        .exrs-foto { position:relative; aspect-ratio:16/9; max-height:210px; width:100%; border-radius:14px; overflow:hidden;
          display:flex; align-items:center; justify-content:center; border:1px solid ${T.line}; }
        .exrs-foto > i { font-size:54px; color:rgba(255,255,255,0.28); }
        .exrs-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .exrs-perfil { display:flex; gap:10px; align-items:flex-start; font-size:14.5px; line-height:1.5; color:${T.text2};
          padding:10px 13px; border-radius:11px; background:${T.inset}; border:1px solid ${T.line}; }
        .exrs-burbuja { display:flex; align-items:center; gap:12px; flex-wrap:wrap; padding:12px 14px; border-radius:14px; background:${T.inset}; border:1px solid ${T.line}; }
        .exrs-cara { font-size:34px; color:${accent}; }
        .exrs-porque { border-radius:12px; padding:12px 14px; font-size:14.5px; line-height:1.55; color:${T.text2}; border:1px solid ${NO}55; background:${NO}12; }
        .exrs-porque[data-ok="true"] { border-color:${OK}55; background:${OK}12; }
        .exrs-porque strong { color:#fff; }
        .exrs-eje { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:800; color:${T.text3}; padding-left:112px; }
        .exrs-carril { display:grid; grid-template-columns:104px minmax(0,1fr); gap:8px; align-items:center; padding:4px 6px; border-radius:10px; border:1.5px solid transparent; }
        .exrs-carril[data-actual="true"] { border-color:rgba(${color.rgba},0.5); background:rgba(${color.rgba},0.07); }
        .exrs-carril-et { font-size:14px; font-weight:800; color:#fff; min-width:0; overflow-wrap:anywhere; }
        .exrs-carril-et i { color:${accent}; margin-right:3px; }
        .exrs-pista { position:relative; height:30px; border-radius:8px; background:${T.inset}; border:1px dashed ${T.line}; overflow:hidden; --marca:${OK}; }
        .exrs-pista[data-clase="datos"] { --marca:${NO}; }
        .exrs-pista[data-clase="duda"] { --marca:#FFC75A; }
        .exrs-vacio { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:14px; color:${T.text3}; }
        .exrs-banda { position:absolute; top:6px; bottom:6px; border-radius:6px; background:color-mix(in srgb, var(--marca) 32%, transparent); border:1.5px solid var(--marca); animation:exrPop .25s ease; }
        .exrs-punto { position:absolute; top:50%; width:14px; height:14px; margin:-7px 0 0 -7px; border-radius:50%; background:var(--marca); }
        .exrs-palo { position:absolute; top:3px; bottom:3px; width:3px; margin-left:-1.5px; background:var(--marca); border-radius:2px; }
        .exrs-nunca { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:7px; font-size:14px; font-weight:800; color:var(--marca); }
        .exrs-duda { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:var(--marca); }
        .exrs-final { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:12px 14px; border-radius:12px; border:1px solid ${NO}55; background:${NO}10;
          font-size:14.5px; line-height:1.5; color:${T.text2}; }
        .exrs-final[data-ok="true"] { border-color:${OK}55; background:${OK}10; }
        .exrs-final span { flex:1 1 200px; min-width:0; }
        @media (max-width: 480px){ .exrs-carril { grid-template-columns:84px minmax(0,1fr); } .exrs-eje { padding-left:92px; } }

        /* Identidad del tablero */
        .exr-bin, .exr-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .exr-bin:nth-of-type(6n+1), .exr-row:nth-of-type(6n+1) { --tono:188; }
        .exr-bin:nth-of-type(6n+2), .exr-row:nth-of-type(6n+2) { --tono:262; }
        .exr-bin:nth-of-type(6n+3), .exr-row:nth-of-type(6n+3) { --tono:44; }
        .exr-bin:nth-of-type(6n+4), .exr-row:nth-of-type(6n+4) { --tono:152; }
        .exr-bin:nth-of-type(6n+5), .exr-row:nth-of-type(6n+5) { --tono:330; }
        .exr-bin:nth-of-type(6n+6), .exr-row:nth-of-type(6n+6) { --tono:18; }
        .exr-bin::before, .exr-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .exr-bin[data-done="true"], .exr-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .exr-chip:hover { transform:translateY(-2px); }
        .exr-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .exr-chip, .exr-chip:hover, .exr-chip[data-sel="true"] { transform:none; transition:none; }
          .exr-ranura[data-shake="true"], .exr-burbuja, .exr-msg { animation:none; }
        }
          `}</style>

          {modo !== "simulador" && (
          <Escena
            tipo={escena.tipo}
            pos={escena.pos}
            rotulo={escena.rotulo}
            nombreA={modo === "charla" ? charla.a : "Sofía"}
            nombreB={modo === "charla" ? charla.b : "Bruno"}
            hablante={escena.hablante}
            burbuja={escena.burbuja}
            es={escena.es}
            veredicto={escena.veredicto}
            accent={accent}
            rgba={color.rgba}
          />
          )}

          {modo === "simulador" && (
            <SimPanel accent={accent} rgba={color.rgba} indice={entIdx} elegidas={entElegidas} resumenSim={res} onIr={irEntrevista} onResponder={responderEntrevista} onPlay={contarEscucha} />
          )}

          {/* MODO 1 — Arma la charla */}
          {modo === "charla" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <Eyebrow>
                    {charla.titulo} · charla {chIdx + 1} de {CHARLAS.length}
                  </Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: puestos >= charla.turnos.length ? OK : T.text3 }}>
                    {puestos}/{charla.turnos.length} turnos
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>{charla.contexto}</div>

                <div className="exr-hilo">
                  {charla.turnos.slice(0, puestos).map((t, i) => {
                    const buena = t.opciones.find((o) => o.correcta)!;
                    return (
                      <div key={t.id} className="exr-msg" data-quien={t.quien}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4, flexWrap: "wrap" }}>
                          <span className="exr-quien">{t.quien === "a" ? charla.a : charla.b}</span>
                          <span style={{ fontSize: 14, color: T.text3, fontWeight: 800 }}>#{i + 1}</span>
                          <BotonEscuchar texto={buena.texto} onPlay={contarEscucha} />
                        </div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#fff" }}>{buena.texto}</div>
                        <div style={{ fontSize: 14, color: T.text3, fontStyle: "italic", marginTop: 3 }}>{t.es}</div>
                      </div>
                    );
                  })}
                  {puestos === 0 && (
                    <div style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>La charla empieza abajo: elige la primera línea.</div>
                  )}
                </div>

                {turnoActual ? (
                  <>
                    <div className="exr-divider" />
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                      <span className="exr-quien">{turnoActual.quien === "a" ? charla.a : charla.b}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: accent, letterSpacing: ".03em" }}>{FOCO_INFO[turnoActual.foco].titulo}</span>
                    </div>
                    <div style={{ fontSize: 14, color: T.text, lineHeight: 1.55, fontWeight: 700, display: "flex", gap: 9 }}>
                      <i className="fa-solid fa-bullseye" style={{ color: accent, marginTop: 4 }} />
                      <span>{turnoActual.intencion}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                      {(ORDEN_TURNO[turnoActual.id] ?? []).map((oi, pos) => {
                        const op = turnoActual.opciones[oi]!;
                        const tocada = tocadasActual.includes(oi);
                        return (
                          <div key={oi}>
                            <button className="exr-opt" data-ok={tocada && op.correcta} data-bad={tocada && !op.correcta} disabled={tocada} onClick={() => elegirTurno(oi)}>
                              <span className="exr-letra">
                                {tocada ? <i className={`fa-solid ${op.correcta ? "fa-check" : "fa-xmark"}`} /> : String.fromCharCode(65 + pos)}
                              </span>
                              <span style={{ flex: 1, lineHeight: 1.4 }}>{op.texto}</span>
                            </button>
                            {tocada && (
                              <div
                                style={{
                                  marginTop: 8,
                                  marginLeft: 38,
                                  fontSize: 14,
                                  color: T.text2,
                                  lineHeight: 1.5,
                                  borderRadius: 10,
                                  border: `1px solid ${op.correcta ? `${OK}55` : T.line}`,
                                  background: op.correcta ? `${OK}12` : T.inset,
                                  padding: "9px 13px",
                                }}
                              >
                                <i className={`fa-solid ${op.correcta ? "fa-circle-check" : "fa-circle-info"}`} style={{ marginRight: 8, color: op.correcta ? OK : accent }} />
                                {op.comunica}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 12,
                      border: `1px solid ${OK}55`,
                      background: `${OK}12`,
                      padding: "12px 15px",
                      fontSize: 14,
                      color: T.text2,
                      lineHeight: 1.55,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
                    <span>
                      Charla completa. Relee el hilo de arriba: empieza en present perfect y, en cuanto alguien pregunta cuándo, dónde o con quién, todo lo que
                      sigue va en past simple.
                    </span>
                  </div>
                )}

                {ultimoTurno && (
                  <div
                    style={{
                      marginTop: 15,
                      borderRadius: 13,
                      border: `1px solid rgba(${color.rgba},0.34)`,
                      background: `rgba(${color.rgba},0.1)`,
                      padding: "13px 16px",
                      fontSize: 14,
                      color: T.text2,
                      lineHeight: 1.55,
                      display: "flex",
                      gap: 11,
                    }}
                  >
                    <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 2 }} />
                    <span>{ultimoTurno.regla}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {CHARLAS.map((c, i) => {
                  const listo = (avance[c.id] ?? 0) >= c.turnos.length;
                  return (
                    <button key={c.id} className="exr-btn" onClick={() => setChIdx(i)} style={i === chIdx ? { borderColor: accent, color: "#fff" } : undefined}>
                      <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-comment-dots"}`} style={{ color: listo ? OK : T.text3 }} />
                      {c.titulo}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* MODO 2 — ¿Cuál va y dónde? */}
          {modo === "marcador" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <Eyebrow>
                    Frase {mkIdx + 1} de {MARCADORES.length} · elige la palabra y su lugar
                  </Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: posDone && desdeDone ? OK : T.text3 }}>
                    {Object.keys(mkOk).length}/{MARCADORES.length}
                  </span>
                </div>

                <div className="exr-frase">
                  {mkItem.partes.map((p, i) => (
                    <span key={i} style={{ display: "contents" }}>
                      <span>{p}</span>
                      {/* Resuelta la frase, las ranuras vacías se van: lo que queda es la oración, no el andamio. */}
                      {ranurasActivas.includes(i) && (!mkResuelto || i === mkItem.ranuraCorrecta) ? (
                        <button
                          className="exr-ranura"
                          data-shake={shakeRanura === i}
                          data-lleno={mkResuelto && i === mkItem.ranuraCorrecta}
                          disabled={mkResuelto}
                          onClick={() => colocarFicha(i)}
                          aria-label={`Ranura ${i + 1}`}
                        >
                          {mkResuelto && i === mkItem.ranuraCorrecta ? mkItem.fichaCorrecta : "▸"}
                        </button>
                      ) : null}
                    </span>
                  ))}
                  <span>{mkItem.cierre}</span>
                </div>

                <div className="exr-divider" />

                <div style={{ fontSize: 14, color: T.text3, marginBottom: 10 }}>
                  {mkResuelto ? "Resuelta. Pasa a la siguiente." : fichaSel ? "Ahora toca la ranura donde crees que va." : "Primero elige la palabra."}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {mkItem.fichas.map((f) => (
                    <button key={f} className="exr-chip" data-sel={fichaSel === f} disabled={mkResuelto} onClick={() => setFichaSel((s) => (s === f ? null : f))}>
                      {f}
                    </button>
                  ))}
                </div>

                {mkPrueba && mkPrueba.id === mkItem.id && (
                  <div
                    style={{
                      marginTop: 15,
                      borderRadius: 13,
                      border: `1px solid ${mkPrueba.ok ? `${OK}55` : `${NO}55`}`,
                      background: mkPrueba.ok ? `${OK}12` : `${NO}10`,
                      padding: "13px 16px",
                      fontSize: 14,
                      color: T.text2,
                      lineHeight: 1.55,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <i className={`fa-solid ${mkPrueba.ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: mkPrueba.ok ? OK : NO }} />
                      <span style={{ fontSize: 14.5, fontWeight: 800, color: "#fff" }}>{mkPrueba.frase}</span>
                      {mkPrueba.ok && <BotonEscuchar texto={mkPrueba.frase} onPlay={contarEscucha} />}
                    </div>
                    <span>{mkPrueba.motivo}</span>
                    {mkPrueba.ok && <div style={{ marginTop: 5, fontStyle: "italic", color: T.text3 }}>{mkItem.es}</div>}
                  </div>
                )}

                {/* Al volver a una frase ya resuelta, la regla sigue ahí: se vino a consultarla. */}
                {mkResuelto && (!mkPrueba || mkPrueba.id !== mkItem.id) && (
                  <div
                    style={{
                      marginTop: 15,
                      borderRadius: 13,
                      border: `1px solid ${OK}55`,
                      background: `${OK}12`,
                      padding: "13px 16px",
                      fontSize: 14,
                      color: T.text2,
                      lineHeight: 1.55,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <i className="fa-solid fa-circle-check" style={{ color: OK }} />
                      <span style={{ fontSize: 14.5, fontWeight: 800, color: "#fff" }}>{armarFrase(mkItem, mkItem.fichaCorrecta, mkItem.ranuraCorrecta)}</span>
                      <BotonEscuchar texto={armarFrase(mkItem, mkItem.fichaCorrecta, mkItem.ranuraCorrecta)} onPlay={contarEscucha} />
                    </div>
                    <span>{mkItem.regla}</span>
                    <div style={{ marginTop: 5, fontStyle: "italic", color: T.text3 }}>{mkItem.es}</div>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <button className="exr-btn" onClick={() => setMkIdx((i) => Math.max(0, i - 1))} disabled={mkIdx === 0}>
                    <i className="fa-solid fa-arrow-left" /> Anterior
                  </button>
                  <button
                    className="exr-btn"
                    style={mkResuelto ? { background: accent, color: "#04121f", borderColor: accent } : undefined}
                    onClick={() => setMkIdx((i) => Math.min(MARCADORES.length - 1, i + 1))}
                    disabled={mkIdx >= MARCADORES.length - 1}
                  >
                    Siguiente <i className="fa-solid fa-arrow-right" />
                  </button>
                  <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
                    {MARCADORES.map((m, i) => (
                      <button
                        key={m.id}
                        className="exr-pastilla"
                        data-on={i === mkIdx}
                        data-done={mkOk[m.id] === true}
                        onClick={() => {
                          setMkIdx(i);
                          setFichaSel(null);
                        }}
                        aria-label={`Ir a la frase ${i + 1}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: "18px 22px" }}>
                <Eyebrow>Dónde vive cada palabra</Eyebrow>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {MARCADORES.map((m) => (
                    <div key={m.id} className="exr-row" data-done={mkOk[m.id] === true}>
                      <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase" }}>{m.fichaCorrecta}</div>
                      {mkOk[m.id] ? (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 5 }}>{armarFrase(m, m.fichaCorrecta, m.ranuraCorrecta)}</div>
                          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 4 }}>{m.regla}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 14, color: T.text3, marginTop: 5, fontStyle: "italic" }}>Coloca esta palabra para ver la regla.</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MODO 3 — ¿Le pones fecha? */}
          {modo === "fecha" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <Eyebrow>
                    Vivencia {expIdx + 1} de {EXPERIENCIAS.length} · {exp.hecho}
                  </Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: fechaDone ? OK : T.text3 }}>
                    {Object.keys(exOk).length}/{EXPERIENCIAS.length * 2}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <button className="exr-chip" data-sel={fechaPuesta} onClick={() => setFechaPuesta((v) => !v)}>
                    <i className={`fa-solid ${fechaPuesta ? "fa-thumbtack" : "fa-calendar-day"}`} />
                    {exp.fecha}
                  </button>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, flex: 1, minWidth: 200 }}>
                    {fechaPuesta ? (
                      <>
                        La fecha está <strong style={{ color: "#fff" }}>clavada en la frase</strong>. Tócala otra vez para quitarla.
                      </>
                    ) : (
                      <>
                        La fecha está <strong style={{ color: "#fff" }}>fuera de la frase</strong>. Tócala para clavarla y ver qué cambia.
                      </>
                    )}
                  </span>
                </div>

                <div className="exr-divider" />

                <div style={{ fontSize: 14.5, color: T.text, lineHeight: 1.55, fontWeight: 700, display: "flex", gap: 9 }}>
                  <i className="fa-solid fa-comment-dots" style={{ color: accent, marginTop: 4 }} />
                  <span>{bloqueEx.consigna}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                  {(ORDEN_EXP[claveEx] ?? []).map((oi, pos) => {
                    const op = bloqueEx.opciones[oi]!;
                    const tocada = (exTocadas[claveEx] ?? []).includes(oi);
                    return (
                      <div key={oi}>
                        <button className="exr-opt" data-ok={tocada && op.correcta} data-bad={tocada && !op.correcta} disabled={tocada || exResuelto} onClick={() => elegirFrase(oi)}>
                          <span className="exr-letra">{tocada ? <i className={`fa-solid ${op.correcta ? "fa-check" : "fa-xmark"}`} /> : String.fromCharCode(65 + pos)}</span>
                          <span style={{ flex: 1, lineHeight: 1.4 }}>{op.texto}</span>
                        </button>
                        {tocada && (
                          <div
                            style={{
                              marginTop: 8,
                              marginLeft: 38,
                              fontSize: 14,
                              color: T.text2,
                              lineHeight: 1.5,
                              borderRadius: 10,
                              border: `1px solid ${op.correcta ? `${OK}55` : T.line}`,
                              background: op.correcta ? `${OK}12` : T.inset,
                              padding: "9px 13px",
                            }}
                          >
                            <i className={`fa-solid ${op.correcta ? "fa-circle-check" : "fa-circle-info"}`} style={{ marginRight: 8, color: op.correcta ? OK : accent }} />
                            {op.nota}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {exResuelto && (
                  <div
                    style={{
                      marginTop: 15,
                      borderRadius: 13,
                      border: `1px solid rgba(${color.rgba},0.34)`,
                      background: `rgba(${color.rgba},0.1)`,
                      padding: "13px 16px",
                      fontSize: 14,
                      color: T.text2,
                      lineHeight: 1.55,
                      display: "flex",
                      gap: 11,
                    }}
                  >
                    <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 2 }} />
                    <span>{bloqueEx.regla}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
                {(["sin", "con"] as const).map((e) => {
                  const clave = `${exp.id}:${e}`;
                  const hecha = exOk[clave] === true;
                  const frase = (e === "sin" ? exp.sinFecha : exp.conFecha).opciones.find((o) => o.correcta)!.texto;
                  return (
                    <div key={e} className="exr-bin" data-activo={estado === e} data-done={hecha}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                        <i className={`fa-solid ${e === "sin" ? "fa-infinity" : "fa-thumbtack"}`} style={{ color: T.text2 }} />
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{e === "sin" ? "Sin fecha · la experiencia" : "Con fecha · el hecho"}</span>
                      </div>
                      <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>
                        {e === "sin" ? "Present perfect: have/has + participio." : "Past simple: el verbo en pasado."}
                      </div>
                      {hecha ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "exrPop .25s ease" }}>
                          <span style={{ fontSize: 14.5, fontWeight: 800, color: "#fff", lineHeight: 1.4 }}>
                            <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginRight: 8 }} />
                            {frase}
                          </span>
                          <BotonEscuchar texto={frase} onPlay={contarEscucha} />
                        </div>
                      ) : (
                        <div style={{ fontSize: 14, color: T.text3, opacity: 0.75, fontStyle: "italic" }}>
                          {estado === e ? "Elige arriba la frase que queda así." : e === "sin" ? "Quita la fecha para trabajar aquí." : "Clava la fecha para trabajar aquí."}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {EXPERIENCIAS.map((e, i) => (
                  <button
                    key={e.id}
                    className="exr-pastilla"
                    data-on={i === expIdx}
                    data-done={exOk[`${e.id}:sin`] === true && exOk[`${e.id}:con`] === true}
                    onClick={() => {
                      setExpIdx(i);
                      setExAviso(null);
                    }}
                    aria-label={`Ir a la vivencia ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* MODO 4 — Completa el texto */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={HUECOS_A2}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
              }}
              onAcierto={sfxBien}
              onError={sfxNo}
            />
          )}
        </div>
      }
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="El club entendió" value={`${res.entendidas}/${PREGUNTAS.length}`} />
                  <Dato label="Respuestas exactas" value={`${res.exactas}/${PREGUNTAS.length}`} col={res.exactas >= PREGUNTAS.length ? OK : undefined} />
                  <Dato label="Charlas armadas" value={`${CHARLAS.filter((c) => (avance[c.id] ?? 0) >= c.turnos.length).length}/${CHARLAS.length}`} />
                  <Dato label="Frases escuchadas" value={`${escuchados}`} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((n) => (
                      <i key={n} className="fa-solid fa-star" style={{ fontSize: 20, color: n <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    1★ terminar la entrevista · 2★ cuatro respuestas exactas · 3★ las cinco.
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Pista del modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{consejo}</p>
              </Bloque>
              {PREGUNTAS.map((p, i) => {
                const k = entElegidas[p.id];
                const r = k !== undefined ? p.respuestas[k] : undefined;
                return (
                  <Bloque key={p.id} titulo={`${i + 1}. ${p.carril}`} icono={r ? (r.clase === "ok" ? "fa-circle-check" : "fa-circle-xmark") : "fa-folder-open"}>
                    {r ? (
                      <p style={{ margin: 0, color: T.text2 }}>
                        <strong style={{ color: T.text }}>«{r.texto}»</strong> {r.porque}
                      </p>
                    ) : (
                      <p style={{ margin: 0, color: T.text3 }}>Sin responder todavía. Ábrela en «La entrevista del club».</p>
                    )}
                  </Bloque>
                );
              })}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={QUIZ_A4}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={(ok) => (ok ? sfxOk() : sfxNo())}
              mensajeAprobado="Ya distingues la experiencia del hecho con fecha: eso es la progresión entera."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo={`Lectura A1 · ${EXPERIENCIAS_RECIENTES_INGLES_FICHA.ancla}`} icono="fa-book-open-reader">
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    {p}
                  </p>
                ))}
                <button type="button" className="exr-btn" onClick={() => setTeoriaVista(true)} data-hecho={teoriaVista}>
                  <i className={`fa-solid ${teoriaVista ? "fa-circle-check" : "fa-book-open"}`} style={{ color: teoriaVista ? OK : accent }} />
                  {teoriaVista ? "Lectura A1 revisada" : "Ya leí la lectura A1"}
                </button>
              </Bloque>
              <Bloque titulo="Comprensión de la lectura" icono="fa-circle-question">
                {PREGUNTAS_A1.map((p) => (
                  <p key={p.pregunta} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{p.pregunta}</strong> <span style={{ color: T.text3 }}>{p.respuesta}</span>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Glosario de la progresión (A5)" icono="fa-spell-check">
                {GLOSARIO_A5.map((g) => (
                  <div key={g.termino}>
                    <div style={{ fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>{g.termino}</div>
                    <div style={{ color: T.text2, lineHeight: 1.45, marginTop: 2 }}>{g.definicion}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ color: T.text3, fontStyle: "italic" }}>{g.ejemplo}</span>
                      <BotonEscuchar texto={g.ejemplo} onPlay={contarEscucha} />
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Lo que pregunta el video (A9)" icono="fa-circle-check">
                {DEL_VIDEO_A9.map((v) => (
                  <p key={v.pregunta} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{v.pregunta}</strong> <span style={{ color: T.text3 }}>{v.respuesta}</span>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Tu tarea escrita (A3)" icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text2 }}>{TAREA_A3.prompt}</p>
                {TAREA_A3.criterios.map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text3 }}>
                    <i className="fa-regular fa-square-check" style={{ color: accent, marginRight: 8 }} />
                    {c}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Nota regional" icono="fa-quote-left">
                <p style={{ margin: 0, color: T.text2 }}>{CALLOUT_A1}</p>
              </Bloque>
              <Bloque titulo="Qué es verbatim y qué es de este laboratorio" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text2 }}>
                  Verbatim de la progresión IN-III-P02: la lectura y su nota regional (A1), el párrafo con huecos (A2), la tarea escrita (A3), el quiz
                  evaluable (A4), el glosario (A5) y las preguntas del video (A9). La entrevista del club (simulación), las cuatro charlas, las diez frases
                  de marcadores y las seis vivencias son material nuevo escrito para esta práctica con el vocabulario y los ejemplos de la propia lectura
                  (chapulines, cenote, Yucatán, las mariposas monarca, «for three years», «since 2021», «since primary school»); Sofía, Bruno, la maestra
                  Rivas y el club «Viajeros del Sur» son personajes ficticios y los datos del perfil, de simulación. Inglés estadounidense estándar.
                  Fuente: {EXPERIENCIAS_RECIENTES_INGLES_FICHA.fuente}.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={EXPERIENCIAS_RECIENTES_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Eyebrow local (14 px) y modo 0 — «La entrevista del club» (simulador)
 * ═══════════════════════════════════════════════════════════════════════════ */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.text3, margin: "0 0 13px" }}>{children}</p>
  );
}

const RUTA_FOTOS = "/media/labs-sim/experiencias-recientes-ingles";

/** Orden fijo de las respuestas de cada pregunta, para que la exacta no caiga siempre igual. */
const ORDEN_ENTREVISTA: Record<string, number[]> = (() => {
  const rnd = mulberry32(4401972);
  const out: Record<string, number[]> = {};
  for (const p of PREGUNTAS) out[p.id] = baraja(p.respuestas.length, rnd);
  return out;
})();

function Carril({ p, indiceResp, actual }: { p: PreguntaSim; indiceResp: number | undefined; actual: boolean }) {
  const r = indiceResp !== undefined ? p.respuestas[indiceResp] : undefined;
  const m = r?.marca;
  const clase = r ? (r.clase === "ok" ? "ok" : r.clase === "datos" ? "datos" : "duda") : "";
  return (
    <div className="exrs-carril" data-actual={actual}>
      <span className="exrs-carril-et">
        <i className={`fa-solid ${p.icono}`} aria-hidden /> {p.carril}
      </span>
      <div className="exrs-pista" data-clase={clase}>
        {!m && <span className="exrs-vacio">sin anotar</span>}
        {m && m.tipo === "banda" && <span className="exrs-banda" style={{ left: 0, right: 0 }} />}
        {m && m.tipo === "desde" && (
          <>
            <span className="exrs-banda" style={{ left: `${m.pos * 100}%`, right: 0 }} />
            <span className="exrs-punto" style={{ left: `${m.pos * 100}%` }} />
          </>
        )}
        {m && m.tipo === "pin" && (
          <>
            <span className="exrs-palo" style={{ left: `${m.pos * 100}%` }} />
            <span className="exrs-punto" style={{ left: `${m.pos * 100}%` }} />
          </>
        )}
        {m && m.tipo === "nunca" && (
          <span className="exrs-nunca">
            <i className="fa-solid fa-ban" aria-hidden /> never
          </span>
        )}
        {m && m.tipo === "duda" && <span className="exrs-duda">?</span>}
      </div>
    </div>
  );
}

function SimPanel({
  accent,
  rgba,
  indice,
  elegidas,
  resumenSim,
  onIr,
  onResponder,
  onPlay,
}: {
  accent: string;
  rgba: string;
  indice: number;
  elegidas: Record<string, number>;
  resumenSim: ResumenSim;
  onIr: (i: number) => void;
  onResponder: (i: number) => void;
  onPlay: () => void;
}) {
  const p = PREGUNTAS[indice] ?? PREGUNTAS[0]!;
  const k = elegidas[p.id];
  const r = k !== undefined ? p.respuestas[k] : undefined;
  const fin = resumenSim.hechas >= PREGUNTAS.length;
  const estrellas = estrellasEntrevista(resumenSim);
  const cara = !r ? "fa-face-smile" : r.clase === "gramatica" ? "fa-face-dizzy" : "fa-face-smile";

  return (
    <>
      <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PREGUNTAS.map((x, i) => (
              <button
                key={x.id}
                type="button"
                className="exr-pastilla"
                data-on={i === indice}
                data-done={elegidas[x.id] !== undefined}
                onClick={() => onIr(i)}
                aria-label={`Pregunta ${i + 1} de ${PREGUNTAS.length}`}
              >
                {elegidas[x.id] !== undefined ? <i className="fa-solid fa-check" /> : i + 1}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: fin ? OK : T.text3 }}>
            {resumenSim.hechas}/{PREGUNTAS.length} preguntas
          </span>
        </div>

        <div className="exrs-foto" style={{ background: `linear-gradient(135deg, rgba(${rgba},0.34), rgba(2,12,28,0.92))` }}>
          <i className={`fa-solid ${p.icono}`} aria-hidden />
          <img
            src={`${RUTA_FOTOS}/${p.foto}.webp`}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="exrs-perfil">
          <i className="fa-solid fa-id-card" aria-hidden style={{ color: accent }} />
          <span>
            <strong style={{ color: T.text }}>Tu perfil (simulación):</strong> {p.hecho}
          </span>
        </div>
      </div>

      <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="exrs-burbuja">
          <i className={`fa-solid ${cara} exrs-cara`} aria-hidden />
          <div style={{ minWidth: 0, flex: 1 }}>
            <strong style={{ color: T.text, fontSize: 14 }}>Maestra Rivas · club «Viajeros del Sur»</strong>
            <p style={{ margin: "2px 0 0", fontSize: 16, lineHeight: 1.45, color: "#fff", fontWeight: 700 }}>«{r ? r.maestra : p.pregunta}»</p>
          </div>
          <BotonEscuchar texto={r ? r.maestra : p.pregunta} onPlay={onPlay} />
        </div>

        <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{r ? "Dijiste:" : "Elige lo que le contestas:"}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {(ORDEN_ENTREVISTA[p.id] ?? []).map((ri, pos) => {
            const x = p.respuestas[ri]!;
            const elegida = k === ri;
            return (
              <button key={ri} type="button" className="exr-opt" disabled={r !== undefined} data-ok={elegida && x.clase === "ok"} data-bad={elegida && x.clase !== "ok"} onClick={() => onResponder(ri)}>
                <span className="exr-letra">{elegida ? <i className={`fa-solid ${x.clase === "ok" ? "fa-check" : "fa-xmark"}`} /> : String.fromCharCode(65 + pos)}</span>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{x.texto}</span>
              </button>
            );
          })}
        </div>

        {r && (
          <div className="exrs-porque" data-ok={r.clase === "ok"}>
            <strong>{r.clase === "ok" ? "Bien armada y fiel a tu perfil." : r.clase === "gramatica" ? "Mal armada: la maestra anotó un «?»." : "Bien armada, pero contradice tu perfil."}</strong> {r.porque}
          </div>
        )}
        {r && indice < PREGUNTAS.length - 1 && (
          <button type="button" className="exr-btn" style={{ alignSelf: "flex-end" }} onClick={() => onIr(indice + 1)}>
            Siguiente pregunta <i className="fa-solid fa-arrow-right" aria-hidden />
          </button>
        )}
      </div>

      <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Eyebrow>
          <i className="fa-solid fa-timeline" style={{ marginRight: 8, color: accent }} />
          Lo que el club anotó de tu vida
        </Eyebrow>
        <div className="exrs-eje">
          <span>0 años</span>
          <span>AHORA · 16</span>
        </div>
        {PREGUNTAS.map((x, i) => (
          <Carril key={x.id} p={x} indiceResp={elegidas[x.id]} actual={i === indice} />
        ))}
        <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Franja = vale desde ese punto hasta hoy · alfiler = un hecho con fecha · verde = fiel a tu perfil · rojo = el club anotó algo falso · ? = no te entendió.
        </div>
        {fin && (
          <div className="exrs-final" data-ok={estrellas >= 2}>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3].map((n) => (
                <i key={n} className="fa-solid fa-star" style={{ fontSize: 20, color: n <= estrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
              ))}
            </div>
            <span>
              {estrellas === 3
                ? "Entrevista perfecta: el club tiene tu línea de vida tal como es. Reinicia para ver cómo cambia con otras respuestas."
                : estrellas === 2
                  ? "Casi: una respuesta quedó mal. Mira cuál carril está en rojo o con «?» y repítela."
                  : "El club anotó varias cosas que no son. Cada «?» o carril rojo es una oración que cambió tu historia: reinicia y corrígelas."}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
