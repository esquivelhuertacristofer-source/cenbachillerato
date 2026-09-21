"use client";

/**
 * Laboratorio 3D — "Where and when? La terminal de autobuses".
 * Práctica anclada a IN-I-P05 (Inglés I): «Hace preguntas sencillas para
 * obtener información general (ubicación, horarios)». El marco teórico es la
 * lectura A1; el reto evaluable reúne el quiz A4 y las preguntas del video A8;
 * el texto a completar es el A2, los hechos el A5 y el glosario el A6.
 *
 * Tres modos sobre una misma terminal 3D:
 *  (1) Ask the right question — Lucy necesita un dato; el alumno escribe la
 *      pregunta. Rosa responde SOLO si la pregunta es correcta, y responde lo
 *      que se preguntó: si la palabra interrogativa no corresponde al dato,
 *      se ve (y se explica) el desajuste.
 *  (2) Read the board — el reloj corre y el tablero cambia (retrasos, cambio
 *      de andén, cancelación); los viajeros preguntan y el alumno responde con
 *      lo que dice el tablero en ese momento.
 *  (3) Info desk — el alumno atiende el módulo: escribe respuestas cortas y
 *      completas que se validan contra el plano 3D y la hoja del módulo.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { hablarLab, callarLab } from "./lab-voz";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { TERMINAL_HORARIOS_FICHA } from "./terminal-horarios-ingles-ficha";
import type { PersonajeEscena } from "./TerminalHorariosInglesScene";
import {
  type Modo,
  type Qw,
  type Foco,
  type PreguntaTablero,
  type ItemEstrella,
  type BotonQw,
  type LugarId,
  type DestId,
  type OrigenId,
  MODOS,
  MODOS_DEF,
  NECESIDADES,
  FICHAS_COMUNES,
  VISITANTES,
  FRASES_APOYO,
  SALIDAS,
  SERVICIOS,
  CIUDAD_EN,
  AVISOS,
  BOTONES_QW,
  BOTON_EN,
  DESK_FRENTE,
  ENTRADA_FUERA,
  T_INICIO,
  T_FIN,
  lugar,
  salida,
  estadoSalida,
  avisoVigente,
  interpretarPregunta,
  responder,
  evaluarNecesidad,
  evaluarRespuesta,
  rutaDesdeModulo,
  rondaTablero,
  rondaEstrellas,
  unirFichas,
  fmtHora,
  fmt12,
  mulberry32,
  estrellasPorErrores,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  HECHOS_A5,
  GLOSARIO,
  ACTIVIDAD_A6,
  A3,
  AUTOEVALUACION_A7,
  REFLEXION_A7,
  ABIERTA_A8,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ,
  HUECOS_A2,
  NOMBRE_TERMINAL,
} from "./terminal-horarios-ingles-data";

const TerminalScene = dynamic(() => import("./TerminalHorariosInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bus fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la terminal en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-terminal-horarios-ingles-reto";
const WARN = "#FF8A3C";
const COLOR_LUCY = "#38bdf8";
const RONDA_TAB_INICIAL = rondaTablero(mulberry32(7));
const RONDA_EST_INICIAL = rondaEstrellas(mulberry32(21));
const MIRA_DESK = Math.PI;
const FAMILIAS: { id: string; etq: string; qws: Qw[] }[] = [
  { id: "where", etq: "Where", qws: ["where"] },
  { id: "time", etq: "What time / When", qws: ["whattime", "when"] },
  { id: "howmuch", etq: "How much", qws: ["howmuch"] },
  { id: "howlong", etq: "How long", qws: ["howlong"] },
  { id: "which", etq: "Which", qws: ["which"] },
  { id: "isthere", etq: "Is there", qws: ["isthere"] },
];

/* ── Tarjeta de estrellas: ¿qué se preguntó? ──────────────────────────── */
function PreguntaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<ItemEstrella[]>(RONDA_EST_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ronda[pos] ?? ronda[0]!;

  const responderQw = (b: BotonQw) => {
    if (resuelto !== null) return;
    const ok = actual.acepta.includes(b);
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No: «${BOTON_EN[b]}» pide otra cosa. ${actual.porque}`);
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
    setRonda(rondaEstrellas(Math.random));
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
          ¿Qué se preguntó?
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
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>Respuesta {pos + 1} de {ronda.length} · ¿con qué palabra interrogativa empezaba la pregunta?</div>
          <div className="th-estrella-item" style={{ fontSize: 16, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            «{actual.respuesta}»
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {BOTONES_QW.map((b) => (
              <button key={b} className="th-opt th-qw" data-on="true" onClick={() => responderQw(b)} style={{ ["--thc" as string]: accent }}>
                {BOTON_EN[b]}…?
              </button>
            ))}
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

interface ResultadoM1 {
  pregunta: string;
  ok: boolean;
  entendida: boolean;
  respuesta: string;
  msg: string;
  foco: Foco;
}

export function LabTerminalHorariosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("preguntar");
  const [t, setT] = useState(T_INICIO);
  const [corriendo, setCorriendo] = useState(false);
  const [vel, setVel] = useState<1 | 3>(1);

  // ── Ask the right question
  const [necIdx, setNecIdx] = useState(0);
  const [texto, setTexto] = useState("");
  const [fichasOn, setFichasOn] = useState(false);
  const [resM1, setResM1] = useState<ResultadoM1 | null>(null);
  const [necOk, setNecOk] = useState<Set<string>>(() => new Set());
  const [familiasOk, setFamiliasOk] = useState<Set<string>>(() => new Set());
  const [cortes, setCortes] = useState(false);
  const [fallosNec, setFallosNec] = useState(0);
  const [lucy, setLucy] = useState<{ puntos: [number, number][]; key: number }>({ puntos: [DESK_FRENTE], key: 0 });

  // ── Read the board
  const [rondaTab, setRondaTab] = useState<PreguntaTablero[]>(RONDA_TAB_INICIAL);
  const [posTab, setPosTab] = useState(0);
  const [fbTab, setFbTab] = useState<{ ok: boolean; msg: string; clave: string } | null>(null);
  const [tabOk, setTabOk] = useState<Set<string>>(() => new Set());
  const [llegadasOk, setLlegadasOk] = useState(false);
  const [vivoOk, setVivoOk] = useState(false);

  // ── Info desk
  const [visIdx, setVisIdx] = useState(0);
  const [resp, setResp] = useState("");
  const [fbInfo, setFbInfo] = useState<{ ok: boolean; msg: string; dicho: string } | null>(null);
  const [visOk, setVisOk] = useState<Set<string>>(() => new Set());
  const [usoAt, setUsoAt] = useState(false);
  const [usoPrep, setUsoPrep] = useState(false);
  const [pistaOn, setPistaOn] = useState(false);
  const [visMov, setVisMov] = useState<{ puntos: [number, number][]; key: number }>({ puntos: [ENTRADA_FUERA, DESK_FRENTE], key: 0 });

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const [sinVoz, setSinVoz] = useState(false);
  const [guiaA1, setGuiaA1] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
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
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      callarLab();
    };
  }, []);

  // Reloj de la terminal (solo corre en Read the board).
  const relojActivo = corriendo && t < T_FIN;
  useEffect(() => {
    if (!relojActivo) return;
    const id = window.setInterval(() => setT((x) => Math.min(T_FIN, x + 1)), vel === 3 ? 500 : 1500);
    return () => window.clearInterval(id);
  }, [relojActivo, vel]);

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
  const aviso = avisoVigente(t);

  /* ── Ask the right question ────────────────────────────────────────── */
  const nec = NECESIDADES[necIdx]!;
  const fichas = [...FICHAS_COMUNES.slice(0, -1), ...nec.fichas, "?"];

  const preguntarRosa = () => {
    if (!texto.trim()) return;
    const i = interpretarPregunta(texto);
    const pregunta = texto.trim();
    if (!i.ok) {
      setResM1({ pregunta, ok: false, entendida: false, respuesta: "Sorry? Could you ask that again, please?", msg: i.error ?? "Revisa la pregunta.", foco: null });
      setFallosNec((f) => f + 1);
      sfx(false);
      return;
    }
    const r = responder(i, t);
    const v = evaluarNecesidad(nec, i, r);
    setResM1({ pregunta, ok: v.ok, entendida: true, respuesta: r.texto, msg: v.msg, foco: r.foco });
    sfx(v.ok);
    if (v.ok) {
      setNecOk((s) => new Set(s).add(nec.id));
      const fam = FAMILIAS.find((f) => f.qws.includes(i.qw!));
      if (fam) setFamiliasOk((s) => new Set(s).add(fam.id));
      if (i.cortes) setCortes(true);
      if (nec.camina) {
        const destino = "lugar" in nec.camina ? { lugar: nec.camina.lugar } : { gate: estadoSalida(salida(nec.camina.gateDe), t).puerta };
        setLucy((l) => ({ puntos: rutaDesdeModulo(destino), key: l.key + 1 }));
      }
    } else setFallosNec((f) => f + 1);
  };
  const elegirNecesidad = (i: number) => {
    setNecIdx(i);
    setTexto("");
    setResM1(null);
    setFallosNec(0);
    setLucy((l) => ({ puntos: [DESK_FRENTE], key: l.key + 1 }));
    blip();
  };
  const agregarFicha = (f: string) => {
    setTexto((x) => unirFichas([x.trim(), f].filter(Boolean)));
    blip();
  };

  /* ── Read the board ────────────────────────────────────────────────── */
  const pt = rondaTab[posTab] ?? rondaTab[0]!;
  const rondaTerminada = tabOk.size >= rondaTab.length && rondaTab.every((p) => tabOk.has(p.id));
  const responderTab = (clave: string) => {
    if (fbTab?.ok) return;
    const correcta = pt.correcta(t);
    const ok = clave === correcta;
    sfx(ok);
    const msg = ok ? `¡Correcto! ${pt.porque(t)}` : `Esa no es la respuesta con el tablero de las ${fmtHora(t)}. ${pt.porque(t)}`;
    setFbTab({ ok, msg, clave });
    if (ok) {
      setTabOk((s) => new Set(s).add(pt.id));
      if (pt.tablero === "llegadas") setLlegadasOk(true);
      if (pt.enVivo(t)) setVivoOk(true);
    }
  };
  const siguienteTab = () => {
    setFbTab(null);
    setPosTab((p) => (p + 1) % rondaTab.length);
    blip();
  };
  const nuevaRondaTab = () => {
    setRondaTab(rondaTablero(Math.random));
    setPosTab(0);
    setFbTab(null);
    setTabOk(new Set());
    blip();
  };
  const reiniciarReloj = () => {
    setT(T_INICIO);
    setCorriendo(false);
    setFbTab(null);
    setResetNonce((k) => k + 1);
    blip();
  };

  /* ── Info desk ─────────────────────────────────────────────────────── */
  const vis = VISITANTES[visIdx]!;
  const responderInfo = () => {
    if (!resp.trim()) return;
    const v = evaluarRespuesta(vis, resp, t);
    setFbInfo({ ok: v.ok, msg: v.msg, dicho: resp.trim() });
    sfx(v.ok);
    if (v.ok) {
      setVisOk((s) => new Set(s).add(vis.id));
      if (v.usaAt) setUsoAt(true);
      if (v.usaPrep) setUsoPrep(true);
      const destino = "lugar" in vis.camina ? { lugar: vis.camina.lugar } : { gate: estadoSalida(salida(vis.camina.gateDe), t).puerta };
      setVisMov((m) => ({ puntos: rutaDesdeModulo(destino), key: m.key + 1 }));
    }
  };
  const elegirVisitante = (i: number) => {
    setVisIdx(i);
    setResp("");
    setFbInfo(null);
    setPistaOn(false);
    setVisMov((m) => ({ puntos: [ENTRADA_FUERA, DESK_FRENTE], key: m.key + 1 }));
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setCorriendo(false);
    blip();
  };
  const reiniciar = () => {
    if (modo === "preguntar") elegirNecesidad(necIdx);
    if (modo === "tablero") reiniciarReloj();
    if (modo === "informacion") elegirVisitante(visIdx);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Conseguir tu primer dato para Lucy con una pregunta bien hecha", done: necOk.size >= 1 },
    { t: `Conseguir los ${NECESIDADES.length} datos que necesita Lucy`, done: necOk.size === NECESIDADES.length },
    { t: "Preguntar con Where, What time / When, How much, How long, Which e Is there", done: FAMILIAS.every((f) => familiasOk.has(f.id)) },
    { t: "Abrir una pregunta con cortesía: Excuse me, … (A6)", done: cortes },
    { t: "Responder a 6 viajeros leyendo el tablero, incluida una llegada (ARRIVALS)", done: tabOk.size >= 6 && llegadasOk },
    { t: "Responder bien después de un cambio en vivo (retraso, cambio de andén o cancelación)", done: vivoOk },
    { t: `Atender a los ${VISITANTES.length} visitantes del módulo de información`, done: visOk.size === VISITANTES.length },
    { t: "En Info desk, dar una hora con at y una ubicación con preposición de lugar", done: usoAt && usoPrep },
    { t: "Ganar estrellas en «¿Qué se preguntó?»", done: identifico },
    { t: "Aprobar el reto evaluable (A4 + video A8)", done: quizAprobado },
    { t: "Completar el texto (A2)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie: ReactNode = "";
  let visitante: PersonajeEscena;
  let empleada: { nombre: string; burbuja: string | null } = { nombre: "Rosa", burbuja: null };
  let foco: { lugar: LugarId; ok: boolean } | null = null;
  let filaSalida: { id: DestId; ok: boolean } | null = null;
  let filaLlegada: { id: OrigenId; ok: boolean } | null = null;

  if (modo === "preguntar") {
    chipVivo = `Lucy · datos ${necOk.size}/${NECESIDADES.length} · ${fmtHora(t)}`;
    pie = resM1 ? resM1.msg : `Lucy necesita saber ${nec.pide}. Escribe la pregunta en inglés; Rosa responde exactamente lo que preguntes.`;
    visitante = { nombre: "Lucy", color: COLOR_LUCY, puntos: lucy.puntos, animKey: lucy.key, burbuja: resM1 && lucy.puntos.length === 1 ? resM1.pregunta : null, mira: MIRA_DESK, maleta: true };
    empleada = { nombre: "Rosa", burbuja: resM1 ? resM1.respuesta : null };
    if (resM1?.foco) {
      const f = resM1.foco;
      if (f.t === "lugar") foco = { lugar: f.id, ok: resM1.ok };
      if (f.t === "salida") filaSalida = { id: f.id, ok: resM1.ok };
      if (f.t === "llegada") filaLlegada = { id: f.id, ok: resM1.ok };
    }
  } else if (modo === "tablero") {
    chipVivo = `${fmtHora(t)} · ${relojActivo ? "reloj en marcha" : "reloj en pausa"} · viajero ${posTab + 1}/${rondaTab.length}`;
    pie = aviso ? `Aviso: ${aviso.es}` : fbTab ? fbTab.msg : `${pt.quien} pregunta: «${pt.texto}». Lee ${pt.tablero === "salidas" ? "DEPARTURES" : "ARRIVALS"} y elige la respuesta que es verdad a las ${fmtHora(t)}.`;
    visitante = { nombre: pt.quien, color: "#f472b6", puntos: [[4.6, -4.6]], animKey: 0, burbuja: fbTab?.ok ? "Thank you!" : null, mira: Math.atan2(-4.6, 11), maleta: true };
    if (fbTab) {
      if (pt.tablero === "salidas") filaSalida = { id: pt.fila as DestId, ok: fbTab.ok };
      else filaLlegada = { id: pt.fila as OrigenId, ok: fbTab.ok };
    }
  } else {
    chipVivo = `visitante ${visIdx + 1}/${VISITANTES.length} · ${vis.nombre} · ${fmtHora(t)}`;
    pie = fbInfo ? fbInfo.msg : `${vis.nombre} pregunta: «${vis.pregunta}». Busca el dato en el plano o en la hoja del módulo y respóndele en inglés.`;
    visitante = { nombre: vis.nombre, color: vis.color, puntos: visMov.puntos, animKey: visMov.key, burbuja: fbInfo?.ok ? "Thank you!" : visMov.puntos.length === 2 ? vis.pregunta : null, maleta: true };
    empleada = { nombre: "You", burbuja: fbInfo ? fbInfo.dicho : null };
    if (fbInfo?.ok) {
      if ("lugar" in vis.camina) foco = { lugar: vis.camina.lugar, ok: true };
      else filaSalida = { id: vis.camina.gateDe, ok: true };
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
  const btnVoz = (txt: string) => (
    <button className="th-voz" onClick={() => escuchar(txt)} title="Escuchar en inglés" aria-label="Escuchar en inglés">
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );

  /* ── Tablero compacto (pantalla del módulo) ────────────────────────── */
  const pantallaModulo = (
    <div className="th-mini">
      <div className="th-mini-head">
        <span>DEPARTURES</span>
        <span style={{ color: "#fbbf24" }}>{fmtHora(t)}</span>
      </div>
      {SALIDAS.map((s) => {
        const e = estadoSalida(s, t);
        const col = e.estado === "canceled" ? "#f87171" : e.estado === "departed" ? "#64748b" : e.estado === "delayed" ? "#fb923c" : e.estado === "boarding" ? "#22d3ee" : e.cambioPuerta ? "#facc15" : "#4ade80";
        return (
          <div key={s.id} className="th-mini-fila" style={{ opacity: e.estado === "departed" ? 0.6 : 1 }}>
            <span>{fmtHora(s.hora)}</span>
            <span>{CIUDAD_EN[s.id]}</span>
            <span>{e.cancel ? "–" : e.puerta}</span>
            <span style={{ color: col }}>{e.remarks}</span>
          </div>
        );
      })}
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "preguntar") {
    control = (
      <>
        <div className="th-opts">
          {NECESIDADES.map((n, i) => (
            <button key={n.id} className="th-opt th-nec" data-on={i === necIdx} onClick={() => elegirNecesidad(i)} title={n.pide} style={{ ["--thc" as string]: modoCol, background: i === necIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${n.icono}`} style={{ marginRight: 6 }} />
              {i + 1}
              {necOk.has(n.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        {sub(`Dato ${necIdx + 1} de ${NECESIDADES.length}`)}
        <div className="th-dialogo">
          <div className="th-linea">
            <span className="th-quien" style={{ background: COLOR_LUCY }}>Lucy</span>
            <span>
              Necesito saber <strong style={{ color: "#fff" }}>{nec.pide}</strong>.
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45 }}>
            <i className="fa-solid fa-language" style={{ marginRight: 6 }} />
            Vocabulario: {nec.vocab}
          </div>
        </div>
        {sub("Tu pregunta en inglés (Enter para preguntar)")}
        <input
          className="th-input"
          aria-label="Tu pregunta en inglés"
          value={texto}
          spellCheck={false}
          autoComplete="off"
          placeholder="Excuse me, …?"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              preguntarRosa();
            }
          }}
        />
        <div className="th-opts" style={{ marginTop: 8 }}>
          <button className="th-toggle th-preguntar" onClick={preguntarRosa} disabled={!texto.trim()} style={{ ["--thc" as string]: modoCol }}>
            <i className="fa-solid fa-comment-dots" style={{ marginRight: 9, color: modoCol }} />
            Preguntar a Rosa
          </button>
        </div>
        <div className="th-opts" style={{ marginTop: 8 }}>
          <button className="th-toggle-sm" data-on={fichasOn} onClick={() => setFichasOn((v) => !v)}>
            <i className={`fa-solid ${fichasOn ? "fa-eye-slash" : "fa-puzzle-piece"}`} style={{ marginRight: 7 }} />
            {fichasOn ? "Ocultar fichas" : "Armar con fichas"}
          </button>
          <button className="th-toggle-sm" data-on="false" onClick={() => setTexto("")} disabled={!texto}>
            <i className="fa-solid fa-eraser" style={{ marginRight: 7 }} />
            Borrar
          </button>
        </div>
        {fichasOn && (
          <div className="th-banco">
            {fichas.map((f, k) => (
              <button key={`${f}-${k}`} className="th-ficha" onClick={() => agregarFicha(f)}>
                {f}
              </button>
            ))}
            <div style={{ fontSize: 11, color: T.text3, width: "100%" }}>Las fichas escriben en el cuadro; puedes corregir a mano. No todas sirven.</div>
          </div>
        )}
        {resM1 && (
          <>
            {sub("La conversación")}
            <div className="th-dialogo">
              <div className="th-linea">
                <span className="th-quien" style={{ background: COLOR_LUCY }}>Lucy</span>
                <span>{resM1.pregunta}</span>
              </div>
              <div className="th-linea">
                <span className="th-quien" style={{ background: "#60a5fa" }}>Rosa</span>
                <span className="th-rosa">{resM1.respuesta}</span>
              </div>
              <div>{btnVoz(`${resM1.pregunta} ... ${resM1.respuesta}`)}</div>
            </div>
            {nota(
              <>
                <strong>{resM1.ok ? "¡Bien! " : resM1.entendida ? "Pregunta correcta, dato equivocado. " : "Rosa no entendió. "}</strong>
                {resM1.msg}
              </>,
              resM1.ok ? OK : WARN,
              resM1.ok ? "fa-circle-check" : "fa-circle-xmark",
            )}
            {resM1.ok && (
              <div className="th-opts" style={{ marginTop: 10 }}>
                <button className="th-opt th-sig" data-on="true" onClick={() => elegirNecesidad((necIdx + 1) % NECESIDADES.length)} style={{ ["--thc" as string]: modoCol, background: `${modoCol}1f` }}>
                  Siguiente dato
                  <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                </button>
              </div>
            )}
          </>
        )}
        {sinVoz && nota("Tu navegador no tiene voz en inglés; lee la conversación.", T.text3)}
        {fallosNec >= 3 && !necOk.has(nec.id) && nota(<>Una pregunta posible: «{nec.modelo}». Escríbela tú (o una variante) para que Rosa responda.</>, T.text2, "fa-lightbulb")}
        {sub("Palabras interrogativas que ya usaste bien")}
        <div className="th-opts">
          {FAMILIAS.map((f) => (
            <span key={f.id} className="th-chip" data-on={familiasOk.has(f.id)}>
              {familiasOk.has(f.id) && <i className="fa-solid fa-check" style={{ marginRight: 5 }} />}
              {f.etq}
            </span>
          ))}
        </div>
      </>
    );
  } else if (modo === "tablero") {
    const avisosPasados = AVISOS.filter((a) => t >= a.en);
    control = (
      <>
        <div className="th-reloj">
          <span className="th-hora">{fmtHora(t)}</span>
          <button className="th-opt th-play" data-on="true" onClick={() => setCorriendo((c) => !c)} disabled={t >= T_FIN} style={{ ["--thc" as string]: modoCol, background: relojActivo ? `${modoCol}1f` : "transparent" }}>
            <i className={`fa-solid ${relojActivo ? "fa-pause" : "fa-play"}`} style={{ marginRight: 7 }} />
            {relojActivo ? "Pausar" : "Poner a correr el reloj"}
          </button>
          <button className="th-opt th-mas5" data-on="false" onClick={() => setT((x) => Math.min(T_FIN, x + 5))} disabled={t >= T_FIN} style={{ ["--thc" as string]: modoCol }}>
            +5 min
          </button>
          <button className="th-opt" data-on={vel === 3} onClick={() => setVel((v) => (v === 1 ? 3 : 1))} style={{ ["--thc" as string]: modoCol }}>
            ×{vel === 1 ? "1" : "3"}
          </button>
          <button className="th-opt" data-on="false" onClick={reiniciarReloj} style={{ ["--thc" as string]: modoCol }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} />
            10:30
          </button>
        </div>
        {t >= T_FIN && nota("El reloj llegó a las 12:45. Regrésalo a las 10:30 para ver otra vez los cambios.", T.text3)}
        <div className="th-opts" style={{ marginTop: 10 }}>
          {rondaTab.map((p, i) => (
            <button key={p.id} className="th-opt th-viajero" data-on={i === posTab} onClick={() => { setPosTab(i); setFbTab(null); blip(); }} style={{ ["--thc" as string]: modoCol, background: i === posTab ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${p.tablero === "salidas" ? "fa-plane-departure" : "fa-plane-arrival"}`} style={{ marginRight: 6 }} />
              {i + 1}
              {tabOk.has(p.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        {sub(`Viajero ${posTab + 1} · mira ${pt.tablero === "salidas" ? "DEPARTURES (izquierda)" : "ARRIVALS (derecha)"}`)}
        <div className="th-dialogo">
          <div className="th-linea">
            <span className="th-quien" style={{ background: "#f472b6" }}>{pt.quien}</span>
            <span>{pt.texto}</span>
          </div>
          <div>{btnVoz(pt.texto)}</div>
        </div>
        {sub("Tu respuesta (verdadera a esta hora)")}
        <div style={{ display: "grid", gap: 7 }}>
          {pt.opciones.map((o) => {
            const elegida = fbTab?.clave === o.clave;
            const col = elegida ? (fbTab!.ok ? OK : WARN) : modoCol;
            return (
              <button key={o.clave} className="th-resp-tab" data-el={elegida} onClick={() => responderTab(o.clave)} disabled={!!fbTab?.ok} style={{ ["--thc" as string]: col }}>
                {o.texto}
              </button>
            );
          })}
        </div>
        {fbTab && nota(fbTab.msg, fbTab.ok ? OK : WARN, fbTab.ok ? "fa-circle-check" : "fa-circle-xmark")}
        <div className="th-opts" style={{ marginTop: 10 }}>
          {fbTab?.ok && !rondaTerminada && (
            <button className="th-opt th-sig" data-on="true" onClick={siguienteTab} style={{ ["--thc" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente viajero
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          )}
          {rondaTerminada && (
            <button className="th-opt th-nueva" data-on="true" onClick={nuevaRondaTab} style={{ ["--thc" as string]: modoCol, background: `${modoCol}1f` }}>
              <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
              Otros viajeros
            </button>
          )}
        </div>
        {sub("Vocabulario del tablero")}
        <div className="th-vocab">
          {[
            ["departures", "salidas"],
            ["arrivals", "llegadas"],
            ["gate", "andén"],
            ["on time", "a tiempo"],
            ["delayed", "retrasado"],
            ["boarding", "abordando"],
            ["departed", "ya salió"],
            ["arrived", "ya llegó"],
            ["canceled", "cancelado"],
            ["gate changed", "cambió el andén"],
          ].map(([en, es]) => (
            <span key={en}>
              <strong>{en}</strong> = {es}
            </span>
          ))}
        </div>
        {avisosPasados.length > 0 && (
          <>
            {sub("Avisos por altavoz")}
            <div style={{ display: "grid", gap: 6 }}>
              {avisosPasados.map((a) => (
                <div key={a.en} className="th-aviso">
                  <span style={{ color: "#fbbf24", fontWeight: 900, marginRight: 6 }}>{fmtHora(a.en)}</span>
                  <span style={{ color: "#fff" }}>{a.texto}</span>
                  <span style={{ display: "block", color: T.text3, marginTop: 2 }}>{a.es}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </>
    );
  } else {
    const serv = (id: "tickets" | "cafe" | "pharmacy" | "lostfound" | "luggage" | "restrooms") => {
      const s = SERVICIOS[id]!;
      const l = lugar(id);
      const horario = s.abre === null ? "24 hours" : `${s.dias === "lunvie" ? "Mon–Fri" : "Every day"} · ${fmt12(s.abre)} – ${s.cierra! >= 1440 ? "midnight" : fmt12(s.cierra!)}`;
      return (
        <div key={id} className="th-hoja-fila">
          <span>
            <i className={`fa-solid ${l.icono}`} style={{ marginRight: 6, color: l.color }} />
            {id === "restrooms" ? "Restrooms" : l.en.charAt(0).toUpperCase() + l.en.slice(1)}
          </span>
          <span>{horario}</span>
        </div>
      );
    };
    control = (
      <>
        <div className="th-opts">
          {VISITANTES.map((v, i) => (
            <button key={v.id} className="th-opt th-vis" data-on={i === visIdx} onClick={() => elegirVisitante(i)} style={{ ["--thc" as string]: modoCol, background: i === visIdx ? `${modoCol}1f` : "transparent" }} title={v.nombre}>
              {i + 1}
              {visOk.has(v.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        {sub(`Visitante ${visIdx + 1} de ${VISITANTES.length}`)}
        <div className="th-dialogo">
          <div className="th-linea">
            <span className="th-quien" style={{ background: vis.color }}>{vis.nombre}</span>
            <span>{vis.pregunta}</span>
          </div>
          <div className="th-opts">
            {btnVoz(vis.pregunta)}
            <button className="th-toggle-sm" data-on={pistaOn} onClick={() => setPistaOn((v) => !v)}>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 6 }} />
              {pistaOn ? "Ocultar pista" : "Pista"}
            </button>
          </div>
          {pistaOn && <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>{vis.pista}</div>}
        </div>
        {sub("Tu respuesta en inglés (Enter para responder)")}
        <input
          className="th-input"
          aria-label="Tu respuesta en inglés"
          value={resp}
          spellCheck={false}
          autoComplete="off"
          placeholder="Escribe una respuesta corta y completa…"
          onChange={(e) => setResp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              responderInfo();
            }
          }}
          disabled={!!fbInfo?.ok}
        />
        <div className="th-opts" style={{ marginTop: 8 }}>
          <button className="th-toggle th-responder" onClick={responderInfo} disabled={!resp.trim() || !!fbInfo?.ok} style={{ ["--thc" as string]: modoCol }}>
            <i className="fa-solid fa-reply" style={{ marginRight: 9, color: modoCol }} />
            Responder a {vis.nombre}
          </button>
        </div>
        <div className="th-banco">
          {FRASES_APOYO.map((f) => (
            <button key={f} className="th-frase" onClick={() => { setResp(f); blip(); }} disabled={!!fbInfo?.ok}>
              {f}
            </button>
          ))}
        </div>
        {fbInfo && nota(fbInfo.msg, fbInfo.ok ? OK : WARN, fbInfo.ok ? "fa-circle-check" : "fa-circle-xmark")}
        {fbInfo?.ok && (
          <div className="th-opts" style={{ marginTop: 10 }}>
            <button className="th-opt th-sig" data-on="true" onClick={() => elegirVisitante((visIdx + 1) % VISITANTES.length)} style={{ ["--thc" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente visitante
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          </div>
        )}
        {sub("Hoja del módulo")}
        <div className="th-hoja">
          <div className="th-hoja-tit">Services · opening hours</div>
          {(["tickets", "cafe", "pharmacy", "lostfound", "luggage", "restrooms"] as const).map((id) => serv(id))}
          <div className="th-hoja-tit">Tickets · one way</div>
          <div className="th-hoja-grid">
            {SALIDAS.map((s) => (
              <span key={s.id}>
                {CIUDAD_EN[s.id]} <strong>${s.precio.toLocaleString("en-US")}</strong>
              </span>
            ))}
          </div>
          <div className="th-hoja-tit">Travel times</div>
          <div className="th-hoja-grid">
            {SALIDAS.map((s) => (
              <span key={s.id}>
                {CIUDAD_EN[s.id]} <strong>{Math.floor(s.duracion / 60)} h{s.duracion % 60 ? ` ${s.duracion % 60} min` : ""}</strong>
              </span>
            ))}
          </div>
        </div>
        {sub("Pantalla del módulo")}
        {pantallaModulo}
        <div style={{ fontSize: 11, color: T.text3, marginTop: 6 }}>Las ubicaciones no están en la hoja: búscalas en el plano 3D. La pantalla usa el mismo reloj que Read the board.</div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes thPulse { 0%,100%{ box-shadow:0 0 0 0 var(--thd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .th-live-dot { animation: thPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .th-live-dot { animation:none; } }
        .th-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .th-grid { grid-template-columns: 1fr; } }
        .th-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .th-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .th-icobtn:hover { background:rgba(255,255,255,0.12); }
        .th-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .th-tab { cursor:pointer; border:1px solid var(--thc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .th-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .th-tab:hover { background:rgba(255,255,255,0.06); }
        .th-opts { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }
        .th-opt { cursor:pointer; border:1px solid var(--thc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .th-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .th-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .th-opt:disabled { cursor:default; opacity:0.5; }
        .th-toggle { width:100%; cursor:pointer; border:1px solid var(--thc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .th-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .th-toggle:disabled { cursor:default; opacity:0.5; }
        .th-toggle-sm { cursor:pointer; border:1px solid rgba(255,255,255,0.14); border-radius:9px; padding:7px 11px; font-size:11.5px; font-weight:800; color:rgba(255,255,255,0.75); background:transparent; transition:all .15s; }
        .th-toggle-sm[data-on="true"] { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.14); }
        .th-toggle-sm:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .th-toggle-sm:disabled { opacity:0.45; cursor:default; }
        .th-dialogo { padding:12px 14px; border-radius:12px; background:rgba(248,250,252,0.05); border:1px solid ${T.line}; display:grid; gap:8px; }
        .th-linea { display:flex; gap:10px; align-items:flex-start; font-size:13px; color:#fff; line-height:1.5; font-weight:700; }
        .th-quien { flex-shrink:0; font-size:10px; font-weight:900; color:#04121f; padding:3px 7px; border-radius:6px; margin-top:2px; letter-spacing:0.04em; }
        .th-voz { cursor:pointer; border:1px solid rgba(255,255,255,0.18); border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; color:#e0f2fe; background:rgba(56,189,248,0.1); }
        .th-voz:hover { background:rgba(56,189,248,0.2); }
        .th-input { width:100%; box-sizing:border-box; border-radius:11px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:700; padding:10px 12px; font-family:inherit; outline:none; }
        .th-input:focus { border-color:${modoCol}; box-shadow:0 0 0 3px ${modoCol}2e; }
        .th-input:disabled { opacity:0.6; }
        .th-banco { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .th-ficha { cursor:pointer; border:1.5px solid ${T.lineStrong}; background:rgba(56,189,248,0.1); color:#fff; border-radius:9px; padding:6px 11px; font-size:12.5px; font-weight:800; }
        .th-ficha:hover { border-color:#38bdf8; }
        .th-frase { cursor:pointer; border:1px solid ${T.line}; background:${T.glass}; color:#fff; border-radius:9px; padding:6px 10px; font-size:12px; font-weight:700; }
        .th-frase:hover:not(:disabled) { border-color:#a78bfa; background:rgba(167,139,250,0.12); }
        .th-frase:disabled { opacity:0.45; cursor:default; }
        .th-chip { font-size:11px; font-weight:800; padding:5px 9px; border-radius:999px; border:1px solid ${T.line}; color:${T.text3}; }
        .th-chip[data-on="true"] { border-color:${OK}; color:${OK}; background:rgba(52,211,153,0.08); }
        .th-rosa { color:#dbeafe; }
        .th-reloj { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }
        .th-hora { font-family:ui-monospace, monospace; font-size:24px; font-weight:900; color:#fbbf24; padding:4px 12px; border-radius:10px; background:#04070c; border:1px solid #f59e0b55; }
        .th-resp-tab { cursor:pointer; text-align:left; border:1px solid ${T.line}; border-radius:10px; padding:10px 13px; font-size:13.5px; font-weight:800; color:#fff; background:${T.glass}; transition:all .14s; }
        .th-resp-tab:hover:not(:disabled) { border-color:var(--thc); background:rgba(255,255,255,0.06); }
        .th-resp-tab[data-el="true"] { border-color:var(--thc); background:rgba(255,255,255,0.07); box-shadow:0 0 0 1px var(--thc) inset; }
        .th-resp-tab:disabled { cursor:default; }
        .th-vocab { display:flex; flex-wrap:wrap; gap:6px; }
        .th-vocab span { font-size:11.5px; color:${T.text2}; padding:4px 8px; border-radius:8px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; }
        .th-vocab strong { color:#fcd34d; }
        .th-aviso { font-size:11.5px; line-height:1.45; padding:7px 10px; border-radius:9px; background:rgba(120,53,15,0.25); border:1px solid #f59e0b44; }
        .th-hoja { border-radius:12px; border:1px solid ${T.line}; background:rgba(248,250,252,0.04); padding:10px 12px; display:grid; gap:5px; }
        .th-hoja-tit { font-size:10px; font-weight:900; letter-spacing:0.08em; text-transform:uppercase; color:#c4b5fd; margin-top:4px; }
        .th-hoja-fila { display:flex; justify-content:space-between; gap:10px; font-size:12px; color:#fff; font-weight:700; }
        .th-hoja-fila span:last-child { color:${T.text2}; font-weight:600; text-align:right; }
        .th-hoja-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(130px,1fr)); gap:4px 10px; font-size:12px; color:${T.text2}; }
        .th-hoja-grid strong { color:#fff; }
        .th-mini { border-radius:10px; background:#04070c; border:1px solid #1e293b; padding:8px 10px; font-family:ui-monospace, monospace; font-size:12px; }
        .th-mini-head { display:flex; justify-content:space-between; font-weight:900; color:#fff; border-bottom:2px solid #f59e0b; padding-bottom:4px; margin-bottom:4px; }
        .th-mini-fila { display:grid; grid-template-columns: 48px 1fr 26px minmax(0,1.2fr); gap:6px; color:#fcd34d; font-weight:800; padding:2px 0; }
        .th-opt:focus-visible, .th-tab:focus-visible, .th-toggle:focus-visible, .th-icobtn:focus-visible, .th-ficha:focus-visible, .th-frase:focus-visible, .th-toggle-sm:focus-visible, .th-voz:focus-visible, .th-resp-tab:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .th-bottom { grid-template-columns: 1fr !important; } }
        .th-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .th-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .th-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .th-drawer[data-open="true"] { transform:translateX(0); }
        .th-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .th-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .th-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .th-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .th-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .th-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="th-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="th-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--thc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="th-grid">
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
              <TerminalScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                t={t}
                visitante={visitante}
                empleada={empleada}
                foco={foco}
                filaSalida={filaSalida}
                filaLlegada={filaLlegada}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="th-live-dot" style={{ ["--thd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chipVivo}</span>
              </div>
              {aviso && modo === "tablero" && (
                <div className="th-pa" style={{ display: "inline-flex", alignItems: "flex-start", gap: 9, maxWidth: 560, padding: "7px 13px", borderRadius: 12, background: "rgba(120,53,15,0.9)", border: "1px solid #fbbf24", color: "#fff7ed", fontSize: 12.5, fontWeight: 800, lineHeight: 1.35 }}>
                  <i className="fa-solid fa-bullhorn" style={{ color: "#fbbf24", marginTop: 2 }} />
                  <span>{aviso.texto}</span>
                </div>
              )}
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="th-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="th-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="th-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="th-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-bus" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Excuse me, what time…? — {NOMBRE_TERMINAL}</div>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR</div>
              <button className="th-toggle-sm" data-on={guiaA1} onClick={() => setGuiaA1((v) => !v)}>
                {guiaA1 ? "Ocultar respuestas" : "Ver respuestas guía"}
              </button>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS_A1.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q.pregunta}
                  {guiaA1 && <span style={{ display: "block", color: "#bae6fd", fontWeight: 700, marginTop: 2 }}>{q.guia}</span>}
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
              <span className="th-contador" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="th-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              Hechos (verdadero o falso, A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {HECHOS_A5.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 900, padding: "3px 8px", borderRadius: 6, color: "#04121f", background: h.respuesta ? OK : WARN }}>{h.respuesta ? "VERDADERO" : "FALSO"}</span>
                  <span style={{ fontSize: 12, color: "#fff", lineHeight: 1.45 }}>
                    {h.enunciado} <span style={{ color: T.text3 }}>{h.retro}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A6)
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
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A6}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
              Tu turno fuera del laboratorio (A3 y video A8)
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
              <strong style={{ color: "#fff" }}>Video A8:</strong> {ABIERTA_A8}
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
          La lectura A1 con sus preguntas y respuestas guía, el quiz A4, los hechos A5, el glosario A6, la escritura A3, la autoevaluación A7, las preguntas del video A8 y el texto A2 son{" "}
          <strong>verbatim</strong> de la plataforma, con dos salvedades: las retroalimentaciones de las dos preguntas del video A8 son del laboratorio (la actividad no las trae), y en el
          texto A2 la pregunta «___ time is it?» se cambió por «___ time is the exam?», porque a «What time is it?» se responde «It is 2:30 pm», sin at. La {NOMBRE_TERMINAL}, sus
          locales, las personas y las situaciones son <strong>ficticias</strong>; los destinos son ciudades reales, pero horarios, andenes, retrasos, precios y servicios son{" "}
          <strong>ilustrativos</strong> (precios del orden de un boleto de primera clase desde la Ciudad de México en 2025; duraciones aproximadas por carretera). Las oraciones en inglés del
          laboratorio siguen el inglés estadounidense estándar. Fuente: {FUENTE}
        </span>
      </div>

      <PreguntaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ya sabes pedir ubicaciones y horarios en inglés." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A2)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto
            data={HUECOS_A2}
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

      <div className="th-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="th-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="th-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="th-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="th-drawer-body">
          <FichaTeorica data={TERMINAL_HORARIOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

