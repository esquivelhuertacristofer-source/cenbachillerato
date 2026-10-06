"use client";

/**
 * Laboratorio — La entrevista (Inglés V · IN-V-P07).
 * «Participa en una interacción oral semiestructurada (entrevista, presentación
 * breve, panel)».
 *
 * EXPERIMENTO CENTRAL — «Interview»: una entrevista de beca simulada (Bridgeway
 * Exchange Program, ficticio). Siete preguntas, cada una con un reloj de
 * silencio. Algunas son poco claras a propósito (una palabra ambigua, una
 * pregunta que no se oye porque suena un teléfono) y una es difícil. Antes de
 * responder, el alumno puede pedir que repita, pedir aclaración o ganar tiempo;
 * luego arma su respuesta con piezas: respuesta + detalle + ejemplo. Las
 * consecuencias se ven: el entrevistador cambia de cara, tres medidores
 * (fluidez, desarrollo, escucha) suben o bajan, el silencio largo frunce el
 * ceño y cada decisión queda en su libreta. Al final: accepted / waitlist /
 * not selected, con la libreta que explica por qué. Puede «hablar» con la voz
 * del navegador (speechSynthesis) si existe.
 *
 * Modos:
 *  · «Interview» — el simulador (modelo en `entrevista-ingles-sim.ts`).
 *  · «Panel» — cinco momentos de un panel estudiantil; las seis jugadas son
 *    siempre las mismas y lo que cambia es el momento (turn-taking de A1/A2).
 *  · «Your turn» — el alumno ESCRIBE: abrir, pasar de punto, pedir aclaración,
 *    ganar tiempo, apoyarse en su experiencia y cerrar (glosario A5).
 *  · «Complete the text» — fill_blanks IN-V-P07-A6 verbatim.
 *  + Reto V/F (A4 + A2 verbatim) en «Reto»; toda la teoría verbatim en «Teoría».
 *
 * DOM puro (sin three.js). Personas, organizaciones y lugares ficticios.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { ENTREVISTA_INGLES_FICHA } from "./entrevista-ingles-ficha";
import { ENTREVISTA_INGLES_HUECOS } from "./entrevista-ingles-huecos";
import {
  LECTURA_A1,
  COMPRENSION_A1,
  RETO_QUIZ,
  REFLEXION_A3,
  GLOSARIO_A5,
  ACTIVIDAD_FINAL_A5,
  DISTRACTOR_A9,
  AUTOEVALUACION_A7,
  VIDEO_A8,
  type FraseId,
} from "./entrevista-ingles-data";
import {
  INICIO,
  MEDIDOR_INFO,
  ORDEN_MEDIDORES,
  TURNOS,
  ENTREVISTADOR,
  ESTRATEGIAS,
  SILENCIO,
  RELOJ_EXTRA,
  UMBRAL_ACEPTADO,
  UMBRAL_ESPERA,
  MOVIDAS,
  ORDEN_MOVIDAS,
  PANELISTAS,
  MOMENTOS,
  INICIO_PANEL,
  META_PANEL,
  TEMA_PANEL,
  TEMA_PANEL_ES,
  CONSIGNAS,
  ATENCION_INICIO,
  ATENCION_MAX,
  MIN_PALABRAS_DESARROLLO,
  impresion,
  suma,
  efectoEstrategia,
  evaluaRespuesta,
  filasDe,
  frase,
  decision,
  aplicaMovida,
  analizaEscrito,
  type Medidores,
  type MedidorId,
  type Turno,
  type Pieza,
  type Tono,
  type Estrategia,
  type EfectoEstrategia,
  type ResultadoTurno,
  type MovidaId,
  type EfectoMovida,
  type PanelistaId,
  type AnalisisEscrito,
  type EfectoEscrito,
} from "./entrevista-ingles-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const NO = "#FF5E5E";
const ORO = "#FFC75A";
const NARANJA = "#FF9F5A";
const RETO_KEY = "cen-entrevista-ingles-reto";
const RUTA_FOTOS = "/media/labs-sim/entrevista-ingles";

type Modo = "entrevista" | "panel" | "escribe" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "entrevista", label: "Interview", icono: "fa-user-tie" },
  { id: "panel", label: "Panel", icono: "fa-people-group" },
  { id: "escribe", label: "Your turn", icono: "fa-keyboard" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

type Animo = "neutral" | "contento" | "espera" | "frunce" | "confundido";

const ANIMO_INFO: Record<Animo, { etiqueta: string; icono: string; color: string }> = {
  neutral: { etiqueta: "Escucha", icono: "fa-face-smile", color: "#8FA3BF" },
  contento: { etiqueta: "Interesado", icono: "fa-face-grin-beam", color: OK },
  espera: { etiqueta: "Esperando…", icono: "fa-face-meh", color: ORO },
  frunce: { etiqueta: "Frunce el ceño", icono: "fa-face-frown", color: NO },
  confundido: { etiqueta: "Confundido", icono: "fa-face-grimace", color: NARANJA },
};

const TONO_COLOR: Record<Tono, string> = { bien: OK, regular: ORO, mal: NO };
const TONO_ICONO: Record<Tono, string> = { bien: "fa-circle-check", regular: "fa-circle-minus", mal: "fa-circle-xmark" };

const ROL_TXT: Record<string, string> = { respuesta: "respuesta", detalle: "detalle", ejemplo: "ejemplo", pregunta: "pregunta", seguimiento: "seguimiento", cierre: "cierre" };

/** Las filas opcionales (las que traen «sin detalle») empiezan ya elegidas en vacío. */
function selInicial(t: Turno, entendida: boolean): (string | null)[] {
  return filasDe(t, entendida).map((f) => (f.opciones[0]?.en === "" ? f.opciones[0]!.id : null));
}

/* ── Voz del navegador (speechSynthesis), con degradación si no existe ── */
function useVoz() {
  const [soportada] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function"
  );
  const hablar = useCallback(
    (texto: string, rate = 0.95) => {
      if (!soportada) return;
      try {
        const s = window.speechSynthesis;
        s.cancel();
        const u = new window.SpeechSynthesisUtterance(texto.replace(/▒+/g, " ").replace(/\s+/g, " "));
        u.lang = "en-US";
        u.rate = rate;
        const voces = s.getVoices();
        const v = voces.find((x) => x.lang === "en-US") ?? voces.find((x) => x.lang.startsWith("en"));
        if (v) u.voice = v;
        s.speak(u);
      } catch {
        /* sin voz: el texto sigue en pantalla */
      }
    },
    [soportada]
  );
  const callar = useCallback(() => {
    if (!soportada) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }, [soportada]);
  useEffect(() => callar, [callar]);
  return { soportada, hablar, callar };
}

interface Msg {
  de: "ellos" | "tu";
  quien?: string;
  en: string;
  es?: string;
  efecto?: EfectoEscrito;
}

const chatInicial = (): Msg[] => [{ de: "ellos", quien: CONSIGNAS[0]!.quien, en: CONSIGNAS[0]!.en, es: CONSIGNAS[0]!.es }];

export function LabEntrevistaIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const rgba = color.rgba;
  const [modo, setModoRaw] = useState<Modo>("entrevista");

  // ── sonido, voz y partida ─────────────────────────────────────────────
  const partida = usePartida();
  const errorPartida = partida.error;
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
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
  const sfxOk = () => {
    if (sonido) audioRef.current?.correcto();
  };
  const sfxNo = () => {
    partida.error();
    if (sonido) audioRef.current?.incorrecto();
  };
  const sfxBien = () => {
    partida.acierto();
    if (sonido) audioRef.current?.blip();
  };
  const sfxBlip = () => {
    if (sonido) audioRef.current?.blip();
  };

  const { soportada: vozSoportada, hablar, callar } = useVoz();
  const [voz, setVoz] = useState(false);
  const [avisoVoz, setAvisoVoz] = useState(false);
  const habla = (en: string, rate?: number) => {
    if (voz) hablar(en, rate);
  };

  const setModo = (m: Modo) => {
    callar();
    setModoRaw(m);
  };

  // ═════════════════════════════════════════════════════════════════════
  // MODO 1 — Interview
  // ═════════════════════════════════════════════════════════════════════
  const [iniciada, setIniciada] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [fase, setFase] = useState<"pregunta" | "reaccion">("pregunta");
  const [entendida, setEntendida] = useState(false);
  const [usadas, setUsadas] = useState<Estrategia[]>([]);
  const [silencio, setSilencio] = useState(false);
  const [sel, setSel] = useState<(string | null)[]>(() => selInicial(TURNOS[0]!, false));
  const [resultado, setResultado] = useState<ResultadoTurno | null>(null);
  const [ultimaEst, setUltimaEst] = useState<{ e: Estrategia; ef: EfectoEstrategia } | null>(null);
  const [med, setMed] = useState<Medidores>(INICIO);
  const [delta, setDelta] = useState<Partial<Medidores> | null>(null);
  const [linea, setLinea] = useState<{ en: string; es?: string } | null>(null);
  const [animo, setAnimo] = useState<Animo>("neutral");
  const [libreta, setLibreta] = useState<{ n: number; txt: string; tono: Tono }[]>([]);
  const [usosTiempo, setUsosTiempo] = useState(0);
  const [dichos, setDichos] = useState<{ n: number; texto: string; tono: Tono }[]>([]);
  const [verEs, setVerEs] = useState(false);
  const [relojOn, setRelojOn] = useState(true);
  const [restante, setRestante] = useState(TURNOS[0]!.reloj);
  const restanteRef = useRef(TURNOS[0]!.reloj);
  // logros
  const [primeraDesarrollada, setPrimeraDesarrollada] = useState(false);
  const [aclaroAmbigua, setAclaroAmbigua] = useState(false);
  const [entrevistaFin, setEntrevistaFin] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const [mejorImp, setMejorImp] = useState(0);

  const enFinal = tIdx >= TURNOS.length;
  const turno = TURNOS[Math.min(tIdx, TURNOS.length - 1)]!;
  const filas = filasDe(turno, entendida);
  const piezasSel = filas.map((f, i) => f.opciones.find((p) => p.id === sel[i]));
  const listo = piezasSel.every(Boolean);
  const imp = impresion(med);

  const preguntaHablada = (t: Turno, ent: boolean) =>
    t.tipo === "confusa" && !ent ? { txt: t.oido ?? t.pregunta, rate: 1.55 } : { txt: ent && t.aclarada ? t.aclarada : t.pregunta, rate: 0.95 };

  // Reloj de silencio: corre mientras el alumno no dice nada.
  const relojActivo = modo === "entrevista" && iniciada && !enFinal && fase === "pregunta" && relojOn && !silencio;
  useEffect(() => {
    if (!relojActivo) return undefined;
    const id = window.setInterval(() => {
      const r = Math.max(0, restanteRef.current - 0.25);
      restanteRef.current = r;
      setRestante(r);
      if (r <= 0) {
        window.clearInterval(id);
        setSilencio(true);
        setMed((m) => suma(m, SILENCIO.delta));
        setDelta(SILENCIO.delta);
        setAnimo("frunce");
        setLinea({ en: SILENCIO.respuesta });
        setUltimaEst(null);
        setLibreta((l) => [...l, { n: tIdx + 1, txt: SILENCIO.libreta, tono: "mal" }]);
        errorPartida();
        if (sonido) audioRef.current?.incorrecto();
        if (voz) hablar(SILENCIO.respuesta);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [relojActivo, tIdx, errorPartida, sonido, voz, hablar]);

  const reiniciaReloj = (s: number) => {
    restanteRef.current = s;
    setRestante(s);
  };

  const empezarTurno = (i: number) => {
    const t = TURNOS[i]!;
    setTIdx(i);
    setFase("pregunta");
    setEntendida(false);
    setUsadas([]);
    setSilencio(false);
    setSel(selInicial(t, false));
    setResultado(null);
    setUltimaEst(null);
    setDelta(null);
    setLinea(null);
    setAnimo("neutral");
    setVerEs(false);
    reiniciaReloj(t.reloj);
    const h = preguntaHablada(t, false);
    habla(h.txt, h.rate);
  };

  const iniciar = () => {
    setIniciada(true);
    empezarTurno(0);
    sfxBlip();
  };

  const usarEstrategia = (e: Estrategia) => {
    if (!iniciada || enFinal || fase !== "pregunta" || usadas.includes(e)) return;
    const ef = efectoEstrategia(turno, e, usosTiempo);
    setUsadas((u) => [...u, e]);
    if (e === "tiempo") setUsosTiempo((n) => n + 1);
    setMed((m) => suma(m, ef.delta));
    setDelta(ef.delta);
    setUltimaEst({ e, ef });
    setLinea({ en: ef.respuesta, es: ef.desbloquea ? turno.aclaradaEs : undefined });
    setLibreta((l) => [...l, { n: tIdx + 1, txt: ef.libreta, tono: ef.tono }]);
    setAnimo(ef.tono === "bien" ? "contento" : ef.tono === "mal" ? "frunce" : "neutral");
    if (ef.desbloquea && !entendida) {
      setEntendida(true);
      setSel(selInicial(turno, true));
    }
    if (ef.rellena && !silencio) reiniciaReloj(turno.reloj + (e === "tiempo" ? RELOJ_EXTRA : 0));
    if (e === "aclarar" && turno.tipo === "ambigua") setAclaroAmbigua(true);
    if (ef.tono === "bien") sfxBien();
    else if (ef.tono === "mal") sfxNo();
    else sfxBlip();
    habla(ef.respuesta);
  };

  const elegirPieza = (fila: number, id: string) => {
    if (fase !== "pregunta" || enFinal) return;
    setSel((s) => s.map((v, i) => (i === fila ? id : v)));
    sfxBlip();
  };

  const decir = () => {
    if (!iniciada || !listo || fase !== "pregunta" || enFinal) return;
    const piezas = piezasSel as Pieza[];
    const r = evaluaRespuesta(turno, piezas, entendida, silencio, med);
    setResultado(r);
    setMed(r.despues);
    setDelta(r.delta);
    setFase("reaccion");
    setUltimaEst(null);
    setLinea({ en: r.respuesta });
    setAnimo(r.nivel === "sinEntender" ? "confundido" : r.tono === "bien" ? "contento" : r.tono === "mal" ? "frunce" : "neutral");
    setLibreta((l) => [...l, { n: tIdx + 1, txt: r.libreta, tono: r.tono }]);
    setDichos((d) => [...d, { n: tIdx + 1, texto: frase(piezas), tono: r.tono }]);
    if (tIdx === 0 && r.nivel === "desarrollada") setPrimeraDesarrollada(true);
    if (r.tono === "bien") sfxBien();
    else if (r.tono === "mal") sfxNo();
    else sfxBlip();
    habla(r.respuesta);
  };

  const siguiente = () => {
    if (fase !== "reaccion") return;
    if (tIdx + 1 >= TURNOS.length) {
      setTIdx(TURNOS.length);
      setEntrevistaFin(true);
      setMejorImp((b) => Math.max(b, imp));
      const dec = decision(med);
      if (dec.id === "aceptado") {
        setAceptado(true);
        sfxOk();
        persistMejor(true, panelWin, glosarioDone, textoDone);
      }
      habla(dec.id === "aceptado" ? "Congratulations! You have been accepted." : dec.id === "espera" ? "You are on the waiting list." : "Thank you for applying. Unfortunately, you were not selected this time.");
    } else {
      empezarTurno(tIdx + 1);
    }
  };

  const resetEntrevista = () => {
    callar();
    setIniciada(false);
    setTIdx(0);
    setFase("pregunta");
    setEntendida(false);
    setUsadas([]);
    setSilencio(false);
    setSel(selInicial(TURNOS[0]!, false));
    setResultado(null);
    setUltimaEst(null);
    setMed(INICIO);
    setDelta(null);
    setLinea(null);
    setAnimo("neutral");
    setLibreta([]);
    setUsosTiempo(0);
    setDichos([]);
    setVerEs(false);
    reiniciaReloj(TURNOS[0]!.reloj);
  };

  // ═════════════════════════════════════════════════════════════════════
  // MODO 2 — Panel
  // ═════════════════════════════════════════════════════════════════════
  const [pIdx, setPIdx] = useState(0);
  const [pMed, setPMed] = useState(INICIO_PANEL);
  const [pRes, setPRes] = useState<{ id: MovidaId; tono: Tono; efecto: EfectoMovida } | null>(null);
  const [pHist, setPHist] = useState<{ n: number; id: MovidaId; tono: Tono }[]>([]);
  const [panelFin, setPanelFin] = useState(false);
  const [panelWin, setPanelWin] = useState(false);
  const pFinal = pIdx >= MOMENTOS.length;
  const momento = MOMENTOS[Math.min(pIdx, MOMENTOS.length - 1)]!;

  const jugar = (id: MovidaId) => {
    if (pRes || pFinal) return;
    const r = aplicaMovida(pMed, momento, id);
    setPMed(r.despues);
    setPRes({ id, tono: r.tono, efecto: r.efecto });
    setPHist((h) => [...h.filter((x) => x.n !== pIdx), { n: pIdx, id, tono: r.tono }]);
    if (r.tono === "bien") sfxBien();
    else if (r.tono === "mal") sfxNo();
    else sfxBlip();
    const sigue = r.tono === "bien" ? momento.sigueBien : momento.sigueMal;
    habla(sigue.replace(/^[^:]+:\s*/, "").replace(/"/g, "").replace(/\(.*\)/, ""));
  };
  const sigMomento = () => {
    if (!pRes) return;
    setPRes(null);
    if (pIdx + 1 >= MOMENTOS.length) {
      setPIdx(MOMENTOS.length);
      setPanelFin(true);
      if (pMed.conf >= META_PANEL) {
        setPanelWin(true);
        sfxOk();
        persistMejor(aceptado, true, glosarioDone, textoDone);
      }
    } else {
      setPIdx((i) => i + 1);
      habla(MOMENTOS[pIdx + 1]!.linea);
    }
  };
  const resetPanel = () => {
    callar();
    setPIdx(0);
    setPMed(INICIO_PANEL);
    setPRes(null);
    setPHist([]);
  };

  // ═════════════════════════════════════════════════════════════════════
  // MODO 3 — Your turn (el glosario A5 en uso, escribiendo)
  // ═════════════════════════════════════════════════════════════════════
  const [wIdx, setWIdx] = useState(0);
  const [borrador, setBorrador] = useState("");
  const [chat, setChat] = useState<Msg[]>(chatInicial);
  const [ultimo, setUltimo] = useState<AnalisisEscrito | null>(null);
  const [frasesUsadas, setFrasesUsadas] = useState<Set<FraseId>>(() => new Set<FraseId>());
  const [atencion, setAtencion] = useState(ATENCION_INICIO);
  const glosarioDone = frasesUsadas.size >= GLOSARIO_A5.length;
  const consigna = CONSIGNAS[wIdx]!;

  const enviar = () => {
    const a = analizaEscrito(borrador, consigna.espera);
    setUltimo(a);
    if (a.efecto === "vacio") return;
    const nuevas = new Set(frasesUsadas);
    if (a.efecto === "bien" || a.efecto === "corta") nuevas.add(consigna.espera);
    const avanza = a.efecto === "bien";
    const sig = (wIdx + 1) % CONSIGNAS.length;
    const r = avanza ? { en: consigna.ok } : RESPUESTA_ESCRITO[a.efecto as Exclude<EfectoEscrito, "bien">];
    setChat((c) => [
      ...c,
      { de: "tu", en: borrador.trim(), efecto: a.efecto },
      { de: "ellos", quien: consigna.quien, en: r.en, es: "es" in r ? r.es : undefined },
      ...(avanza ? [{ de: "ellos" as const, quien: CONSIGNAS[sig]!.quien, en: CONSIGNAS[sig]!.en, es: CONSIGNAS[sig]!.es }] : []),
    ]);
    if (avanza) setWIdx(sig);
    setAtencion((n) => Math.max(0, Math.min(ATENCION_MAX, n + a.atencion)));
    setFrasesUsadas(nuevas);
    setBorrador("");
    if (a.efecto === "error" || a.efecto === "otra" || a.efecto === "sinFrase") sfxNo();
    else if (avanza) sfxBien();
    else sfxBlip();
    if (avanza) habla(CONSIGNAS[sig]!.en);
    if (!glosarioDone && nuevas.size >= GLOSARIO_A5.length) {
      sfxOk();
      persistMejor(aceptado, panelWin, true, textoDone);
    }
  };
  const otraConsigna = () => {
    const sig = (wIdx + 1) % CONSIGNAS.length;
    setWIdx(sig);
    setChat((c) => [...c, { de: "ellos", quien: CONSIGNAS[sig]!.quien, en: CONSIGNAS[sig]!.en, es: CONSIGNAS[sig]!.es }]);
    setUltimo(null);
  };
  const resetGlosario = () => {
    setWIdx(0);
    setBorrador("");
    setChat(chatInicial());
    setUltimo(null);
    setFrasesUsadas(new Set<FraseId>());
    setAtencion(ATENCION_INICIO);
  };

  // ═════════════════════════════════════════════════════════════════════
  // MODO 4 — Complete the text (A6)
  // ═════════════════════════════════════════════════════════════════════
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const modosHechos = (aceptado ? 1 : 0) + (panelWin ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los cuatro modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  // Persiste la mejor marca al completar un modo (en el handler, no en un efecto).
  const persistMejor = (a: boolean, p: boolean, g: boolean, x: boolean) => {
    registraEstrellas(partida.estrellasCon((a ? 1 : 0) + (p ? 1 : 0) + (g ? 1 : 0) + (x ? 1 : 0), 4));
  };

  const objetivos = [
    { txt: "Empieza la entrevista y responde la 1.ª pregunta con respuesta + detalle + ejemplo", done: primeraDesarrollada, modo: "entrevista" },
    { txt: "Ante la pregunta poco clara, pide aclaración antes de responder", done: aclaroAmbigua, modo: "entrevista" },
    { txt: "Termina la entrevista y lee la libreta del entrevistador", done: entrevistaFin, modo: "entrevista" },
    { txt: `Consigue «Accepted» (impresión ${UMBRAL_ACEPTADO} o más)`, done: aceptado, modo: "entrevista" },
    { txt: "Termina el panel: cinco momentos para tomar o ceder la palabra", done: panelFin, modo: "panel" },
    { txt: `Cierra el panel con la confianza de la moderadora en ${META_PANEL} o más`, done: panelWin, modo: "panel" },
    { txt: "Usa bien las 6 frases del glosario al escribir", done: glosarioDone, modo: "escribe" },
    { txt: "Completa el guion de la presentación (A6)", done: textoDone, modo: "texto" },
    { txt: "Consigue 3★ (los cuatro modos, con 2 errores o menos)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el reto (70 % o más)", done: quizAprobado },
  ];

  const resetActual = modo === "entrevista" ? resetEntrevista : modo === "panel" ? resetPanel : modo === "escribe" ? resetGlosario : resetTexto;

  const dec = decision(med);
  const lectura =
    modo === "entrevista" ? (
      !iniciada ? (
        <>Entrevista de beca: siete preguntas, un reloj</>
      ) : enFinal ? (
        <>
          Decisión: {dec.titulo} · impresión {imp}
        </>
      ) : silencio && fase === "pregunta" ? (
        <>Silencio largo: el entrevistador frunce el ceño</>
      ) : (
        <>
          Impresión {imp} · pregunta {tIdx + 1}/{TURNOS.length}
        </>
      )
    ) : modo === "panel" ? (
      pFinal ? (
        <>Confianza final de la moderadora: {pMed.conf}</>
      ) : (
        <>
          Confianza {pMed.conf} · momento {pIdx + 1}/{MOMENTOS.length}
        </>
      )
    ) : modo === "escribe" ? (
      <>
        Frases usadas {frasesUsadas.size}/6 · público atento {atencion}/{ATENCION_MAX}
      </>
    ) : (
      <>Completa el guion de la presentación</>
    );

  const toggleVoz = () => {
    if (!vozSoportada) {
      setAvisoVoz(true);
      return;
    }
    if (voz) {
      callar();
      setVoz(false);
    } else {
      setVoz(true);
      if (modo === "entrevista" && iniciada && !enFinal) {
        const h = preguntaHablada(turno, entendida);
        hablar(linea?.en ?? h.txt, linea ? 0.95 : h.rate);
      }
    }
  };

  const animoVisto: Animo =
    iniciada && !enFinal && fase === "pregunta" && relojOn && !silencio && animo === "neutral" && restante <= turno.reloj * 0.35 ? "espera" : animo;

  /* ── Texto de la pregunta en pantalla ──────────────────────────────── */
  const preguntaEnPantalla = (): { en: ReactNode; es: string } => {
    if (turno.tipo === "confusa" && !entendida)
      return {
        en: (
          <>
            {turno
              .oido!.split(/(▒+)/)
              .map((p, i) => (p.startsWith("▒") ? <span key={i} className="ei-ruido" aria-label="(no se oye)">{p}</span> : <span key={i}>{p}</span>))}
          </>
        ),
        es: turno.oidoEs ?? "",
      };
    if (entendida && turno.aclarada) return { en: turno.aclarada, es: turno.aclaradaEs ?? turno.es };
    if (turno.palabraClave) {
      const [a, b] = turno.pregunta.split(turno.palabraClave);
      return {
        en: (
          <>
            {a}
            <mark className="ei-clave">{turno.palabraClave}</mark>
            {b}
          </>
        ),
        es: turno.es,
      };
    }
    return { en: turno.pregunta, es: turno.es };
  };

  const fotoPanelista = (id: PanelistaId) => PANELISTAS[id].foto;

  return (
    <LabShell
      accent={accent}
      rgba={rgba}
      retoKey={RETO_KEY}
      dom
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })),
        valor: modo,
        cambiar: (id) => setModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar efectos" : "Activar efectos de sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-comment-dots" titulo={voz ? "Apagar la voz de los personajes" : "Que los personajes hablen (voz del navegador)"} activo={voz} onClick={toggleVoz} />
          <BotonHerramienta icono="fa-stopwatch" titulo={relojOn ? "Quitar el reloj de silencio" : "Poner el reloj de silencio"} activo={relojOn} onClick={() => setRelojOn((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      escena={
        <div className="ei-raiz">
          <style>{css(accent, rgba)}</style>

          {avisoVoz && (
            <p className="ei-aviso" role="status">
              <i className="fa-solid fa-circle-info" aria-hidden /> Tu navegador no tiene voz sintética: el laboratorio funciona igual, con el texto en pantalla.
              <button type="button" className="ei-x" onClick={() => setAvisoVoz(false)} aria-label="Cerrar aviso">
                <i className="fa-solid fa-xmark" aria-hidden />
              </button>
            </p>
          )}

          {/* ═══ MODO — Interview ═══ */}
          {modo === "entrevista" &&
            (!iniciada ? (
              <div className="ei-intro">
                <div className="ei-foto ei-foto-ancha">
                  <i className="fa-solid fa-building-columns" aria-hidden />
                  <ImgSim src={`${RUTA_FOTOS}/sala-espera.webp`} />
                </div>
                <div className="ei-intro-cuerpo">
                  <Eyebrow>
                    <i className="fa-solid fa-user-tie" style={{ marginRight: 8, color: accent }} />
                    Bridgeway Exchange Program · entrevista (ficticia)
                  </Eyebrow>
                  <p>
                    Te entrevistan para una beca de intercambio de un semestre. {ENTREVISTADOR.nombre} hará <strong>siete preguntas en inglés</strong>; algunas serán
                    poco claras a propósito y una será difícil.
                  </p>
                  <ul className="ei-lista">
                    <li>
                      <i className="fa-solid fa-stopwatch" aria-hidden /> Cada pregunta tiene un <strong>reloj de silencio</strong>: si llega a cero sin que digas nada, el entrevistador frunce el ceño.
                    </li>
                    <li>
                      <i className="fa-solid fa-life-ring" aria-hidden /> Antes de responder puedes <strong>pedir que repita, pedir aclaración o ganar tiempo</strong>. Úsalas cuando hagan falta.
                    </li>
                    <li>
                      <i className="fa-solid fa-layer-group" aria-hidden /> Arma tu respuesta: <strong>respuesta + detalle + ejemplo</strong>, no solo «yes» o «no».
                    </li>
                  </ul>
                  <p className="ei-nota">Puedes quitar el reloj con el botón del cronómetro si necesitas más tiempo para leer. Puntajes: simulación.</p>
                  <button type="button" className="ei-btn ei-btn-pri" onClick={iniciar}>
                    <i className="fa-solid fa-door-open" aria-hidden /> Start the interview
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="ei-pasos" aria-label="Avance de la entrevista">
                  {TURNOS.map((t, i) => {
                    const d = dichos.find((x) => x.n === i + 1);
                    return <span key={t.id} className="ei-paso" data-on={i === tIdx && !enFinal} style={d ? { background: TONO_COLOR[d.tono], borderColor: TONO_COLOR[d.tono] } : undefined} />;
                  })}
                  <span className="ei-paso ei-paso-fin" data-on={enFinal}>
                    <i className="fa-solid fa-stamp" aria-hidden /> Decision
                  </span>
                </div>

                <div className="ei-sala">
                  <div className="ei-escritorio" data-animo={animoVisto}>
                    <div className="ei-escritorio-fondo">
                      <i className="fa-solid fa-briefcase" aria-hidden />
                      <ImgSim src={`${RUTA_FOTOS}/oficina-entrevista.webp`} />
                    </div>
                    <div className="ei-persona">
                      <div className="ei-retrato" data-animo={animoVisto} style={{ ["--ac" as string]: ANIMO_INFO[animoVisto].color }}>
                        <i className={`fa-solid ${ANIMO_INFO[animoVisto].icono}`} aria-hidden />
                        <ImgSim src={`${RUTA_FOTOS}/entrevistador.webp`} />
                        <span className="ei-cara" aria-hidden>
                          <i className={`fa-solid ${ANIMO_INFO[animoVisto].icono}`} />
                        </span>
                      </div>
                      <div className="ei-persona-txt">
                        <strong>{ENTREVISTADOR.nombre}</strong>
                        <span className="ei-animo" style={{ color: ANIMO_INFO[animoVisto].color }}>
                          <i className={`fa-solid ${ANIMO_INFO[animoVisto].icono}`} aria-hidden /> {ANIMO_INFO[animoVisto].etiqueta}
                        </span>
                        <span className="ei-imp">
                          Impresión <strong style={{ color: imp >= UMBRAL_ACEPTADO ? OK : imp >= UMBRAL_ESPERA ? ORO : NO }}>{imp}</strong>
                        </span>
                      </div>
                    </div>
                    {!enFinal && fase === "pregunta" && (
                      <Reloj restante={restante} total={turno.reloj + (usadas.includes("tiempo") ? RELOJ_EXTRA : 0)} on={relojOn} silencio={silencio} />
                    )}
                  </div>

                  <Libreta entradas={libreta} />
                </div>

                <div className="ei-medidores">
                  {ORDEN_MEDIDORES.map((k) => (
                    <Medidor key={k} etiqueta={MEDIDOR_INFO[k].etiqueta} icono={MEDIDOR_INFO[k].icono} valor={med[k]} delta={delta?.[k as MedidorId]} color={MEDIDOR_INFO[k].color} />
                  ))}
                  <span className="ei-nota">
                    Impresión = promedio de los tres · Accepted desde {UMBRAL_ACEPTADO}, waitlist desde {UMBRAL_ESPERA} (simulación).
                  </span>
                </div>

                {!enFinal ? (
                  <>
                    {/* La pregunta */}
                    <div className="ei-burbuja" aria-live="polite">
                      <div className="ei-burbuja-top">
                        <strong>
                          Pregunta {tIdx + 1} · {ENTREVISTADOR.nombre}:
                        </strong>
                        <span className="ei-burbuja-btns">
                          {vozSoportada && (
                            <button
                              type="button"
                              className="ei-mini"
                              onClick={() => {
                                const h = preguntaHablada(turno, entendida);
                                hablar(h.txt, h.rate);
                              }}
                            >
                              <i className="fa-solid fa-volume-high" aria-hidden /> Escuchar
                            </button>
                          )}
                          <button type="button" className="ei-mini" onClick={() => setVerEs((v) => !v)}>
                            <i className="fa-solid fa-language" aria-hidden /> {verEs ? "Ocultar traducción" : "Traducción"}
                          </button>
                        </span>
                      </div>
                      <div className="ei-ing">“{preguntaEnPantalla().en}”</div>
                      {verEs && <div className="ei-esp">{preguntaEnPantalla().es}</div>}
                      {turno.tipo === "confusa" && !entendida && (
                        <div className="ei-ruido-aviso">
                          <i className="fa-solid fa-phone-volume" aria-hidden /> Sonó un teléfono mientras preguntaba.
                        </div>
                      )}
                    </div>

                    {linea && (
                      <div className="ei-linea" style={{ ["--rc" as string]: ANIMO_INFO[animo].color }}>
                        <strong>{ENTREVISTADOR.nombre}:</strong> “{linea.en}”{linea.es && verEs && <span>{linea.es}</span>}
                      </div>
                    )}

                    {silencio && fase === "pregunta" && (
                      <div className="ei-retro" style={{ ["--rc" as string]: NO }}>
                        <strong>
                          <i className="fa-solid fa-hourglass-end" style={{ color: NO, marginRight: 8 }} aria-hidden />
                          Fluidez −12
                        </strong>
                        <span>{SILENCIO.porque}</span>
                      </div>
                    )}

                    {fase === "pregunta" && (
                      <>
                        {/* Estrategias */}
                        <div className="ei-caja">
                          <span className="ei-tit">Antes de responder (si hace falta)</span>
                          <div className="ei-estrategias">
                            {(Object.keys(ESTRATEGIAS) as Estrategia[]).map((e) => {
                              const usada = usadas.includes(e);
                              return (
                                <button key={e} type="button" className="ei-est" data-usada={usada} disabled={usada} onClick={() => usarEstrategia(e)}>
                                  <span className="ei-est-et">
                                    <i className={`fa-solid ${ESTRATEGIAS[e].icono}`} aria-hidden /> {ESTRATEGIAS[e].etiqueta}
                                  </span>
                                  <span className="ei-est-en">“{ESTRATEGIAS[e].en(turno)}”</span>
                                </button>
                              );
                            })}
                          </div>
                          {ultimaEst && (
                            <p className="ei-est-retro" style={{ color: TONO_COLOR[ultimaEst.ef.tono] }}>
                              <i className={`fa-solid ${TONO_ICONO[ultimaEst.ef.tono]}`} aria-hidden />
                              <span style={{ color: T.text2 }}>{ultimaEst.ef.porque}</span>
                            </p>
                          )}
                        </div>

                        {/* Constructor de respuesta */}
                        <div className="ei-constructor">
                          {filas.map((f, fi) => (
                            <div key={`${turno.id}-${entendida}-${fi}`} className="ei-fila">
                              <span className="ei-tit">
                                {fi + 1}. {f.etiqueta}
                              </span>
                              <div className="ei-chips">
                                {f.opciones.map((p) => (
                                  <button key={p.id} type="button" className="ei-chip" data-on={sel[fi] === p.id} data-vacia={p.en === ""} onClick={() => elegirPieza(fi, p.id)}>
                                    {p.en === "" ? `(sin ${ROL_TXT[f.rol]})` : p.en}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="ei-preview">
                            <span>Lo que vas a decir:</span>
                            <strong>{listo ? frase(piezasSel as Pieza[]) : "Elige una pieza en cada fila…"}</strong>
                          </div>
                          <button type="button" className="ei-btn ei-btn-pri" disabled={!listo} onClick={decir}>
                            <i className="fa-solid fa-comment" aria-hidden /> Say it
                          </button>
                        </div>
                      </>
                    )}

                    {fase === "reaccion" && resultado && (
                      <div className="ei-retro" style={{ ["--rc" as string]: TONO_COLOR[resultado.tono] }}>
                        <div className="ei-dijiste">
                          <span>Dijiste:</span> “{dichos[dichos.length - 1]?.texto}”
                        </div>
                        <Deltas d={resultado.delta} />
                        <ul className="ei-notas">
                          {resultado.notas.map((n, i) => (
                            <li key={i} data-tono={n.tono}>
                              <i className={`fa-solid ${TONO_ICONO[n.tono]}`} aria-hidden />
                              <span>
                                <strong>«{n.texto}»</strong> {n.porque}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <button type="button" className="ei-btn ei-btn-pri" onClick={siguiente}>
                          <i className="fa-solid fa-arrow-right" aria-hidden /> {tIdx + 1 >= TURNOS.length ? "See the decision" : "Next question"}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="ei-final">
                    <div className="ei-sello" style={{ ["--rc" as string]: dec.color }}>
                      <span>{dec.sello}</span>
                    </div>
                    <div className="ei-retro" style={{ ["--rc" as string]: dec.color }}>
                      <strong>
                        <i className={`fa-solid ${dec.icono}`} style={{ color: dec.color, marginRight: 8 }} aria-hidden />
                        {dec.titulo} · impresión {imp}
                      </strong>
                      <span>{dec.texto}</span>
                      <span>La libreta de {ENTREVISTADOR.nombre} (arriba) explica cada punto: lo verde sumó, lo rojo restó.</span>
                      <button type="button" className="ei-btn" onClick={resetEntrevista}>
                        <i className="fa-solid fa-rotate-left" aria-hidden /> Try the interview again
                      </button>
                    </div>
                  </div>
                )}
              </>
            ))}

          {/* ═══ MODO — Panel ═══ */}
          {modo === "panel" && (
            <>
              <div className="ei-tema">
                <Eyebrow>
                  <i className="fa-solid fa-people-group" style={{ marginRight: 8, color: accent }} />
                  Río Claro Youth Forum · panel (ficticio)
                </Eyebrow>
                <strong>“{TEMA_PANEL}”</strong>
                <span>{TEMA_PANEL_ES}</span>
              </div>

              <div className="ei-pasos" aria-label="Momentos del panel">
                {MOMENTOS.map((m, i) => {
                  const h = pHist.find((x) => x.n === i);
                  return <span key={m.id} className="ei-paso" data-on={i === pIdx && !pFinal} style={h ? { background: TONO_COLOR[h.tono], borderColor: TONO_COLOR[h.tono] } : undefined} />;
                })}
              </div>

              <div className="ei-mesa">
                <div className="ei-mesa-fondo">
                  <i className="fa-solid fa-microphone-lines" aria-hidden />
                  <ImgSim src={`${RUTA_FOTOS}/panel-mesa.webp`} />
                </div>
                <div className="ei-elenco">
                  {(["reyes", "tom", "aisha", "tu"] as PanelistaId[]).map((id) => {
                    const p = PANELISTAS[id];
                    const tienePalabra = !pFinal && (pRes ? (pRes.tono !== "mal" ? id === "tu" : id === momento.habla) : id === momento.habla);
                    return (
                      <div key={id} className="ei-pj" data-palabra={tienePalabra}>
                        <div className="ei-retrato ei-retrato-chico" style={{ ["--ac" as string]: tienePalabra ? accent : "#8FA3BF" }}>
                          <i className={`fa-solid ${p.icono}`} aria-hidden />
                          {p.foto && <ImgSim src={`${RUTA_FOTOS}/${fotoPanelista(id)}.webp`} />}
                        </div>
                        <span className="ei-pj-nombre">{p.nombre}</span>
                        <span className="ei-pj-mic" data-on={tienePalabra}>
                          <i className={`fa-solid ${tienePalabra ? "fa-microphone" : "fa-microphone-slash"}`} aria-hidden /> {tienePalabra ? "Tiene la palabra" : p.rol}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ei-medidores">
                <Medidor etiqueta="Confianza de la moderadora" icono="fa-handshake" valor={pMed.conf} delta={pRes?.efecto.conf} color={OK} umbral={META_PANEL} />
                <Medidor etiqueta="Atención del público" icono="fa-users" valor={pMed.aud} delta={pRes?.efecto.aud} color="#5BA8FF" />
              </div>

              {!pFinal ? (
                <>
                  <div className="ei-burbuja" aria-live="polite">
                    <div className="ei-burbuja-top">
                      <strong>
                        {PANELISTAS[momento.habla].nombre} ({PANELISTAS[momento.habla].rol}):
                      </strong>
                      {vozSoportada && (
                        <button type="button" className="ei-mini" onClick={() => hablar(momento.linea)}>
                          <i className="fa-solid fa-volume-high" aria-hidden /> Escuchar
                        </button>
                      )}
                    </div>
                    <div className="ei-ing">
                      “{momento.linea}”{momento.hablando && !pRes && <span className="ei-puntos" aria-label="sigue hablando" />}
                    </div>
                    <div className="ei-esp">{momento.es}</div>
                    <div className="ei-situacion">
                      <i className={`fa-solid ${momento.hablando ? "fa-comment-dots" : "fa-pause"}`} aria-hidden /> {momento.situacion}
                    </div>
                  </div>

                  {!pRes ? (
                    <div className="ei-caja">
                      <span className="ei-tit">¿Qué haces en este momento?</span>
                      <div className="ei-movidas">
                        {ORDEN_MOVIDAS.map((id) => (
                          <button key={id} type="button" className="ei-est" onClick={() => jugar(id)}>
                            <span className="ei-est-et">
                              <i className={`fa-solid ${MOVIDAS[id].icono}`} aria-hidden /> {MOVIDAS[id].etiqueta}
                            </span>
                            <span className="ei-est-en">“{MOVIDAS[id].en}”</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="ei-retro" style={{ ["--rc" as string]: TONO_COLOR[pRes.tono] }}>
                      <div className="ei-dijiste">
                        <span>Dijiste:</span> “{pRes.id === momento.mejor ? momento.tuLinea : MOVIDAS[pRes.id].en}”
                      </div>
                      <div className="ei-deltas">
                        <DeltaChip etiqueta="Confianza" v={pRes.efecto.conf} />
                        <DeltaChip etiqueta="Público" v={pRes.efecto.aud} />
                      </div>
                      <p className="ei-est-retro" style={{ color: TONO_COLOR[pRes.tono] }}>
                        <i className={`fa-solid ${TONO_ICONO[pRes.tono]}`} aria-hidden />
                        <span style={{ color: T.text2 }}>{pRes.efecto.porque}</span>
                      </p>
                      {pRes.id !== momento.mejor && (
                        <p className="ei-nota">
                          Lo que mejor funcionaba aquí: <strong style={{ color: T.text }}>{MOVIDAS[momento.mejor].etiqueta}</strong> — “{momento.tuLinea}”
                        </p>
                      )}
                      <div className="ei-linea" style={{ ["--rc" as string]: TONO_COLOR[pRes.tono] }}>
                        {pRes.tono === "bien" ? momento.sigueBien : momento.sigueMal}
                      </div>
                      <button type="button" className="ei-btn ei-btn-pri" onClick={sigMomento}>
                        <i className="fa-solid fa-arrow-right" aria-hidden /> {pIdx + 1 >= MOMENTOS.length ? "End the panel" : "Next moment"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="ei-retro" style={{ ["--rc" as string]: pMed.conf >= META_PANEL ? OK : NO }}>
                  <strong>
                    {pMed.conf >= META_PANEL ? "La moderadora confía en ti: tomaste y cediste la palabra a tiempo." : `Confianza ${pMed.conf}: te faltó leer el momento.`}
                  </strong>
                  <ul className="ei-notas">
                    {MOMENTOS.map((m, i) => {
                      const h = pHist.find((x) => x.n === i);
                      const t: Tono = h?.tono ?? "mal";
                      return (
                        <li key={m.id} data-tono={t}>
                          <i className={`fa-solid ${TONO_ICONO[t]}`} aria-hidden />
                          <span>
                            <strong>{m.situacion}</strong> Elegiste {h ? `«${MOVIDAS[h.id].etiqueta}»` : "—"}; funcionaba «{MOVIDAS[m.mejor].etiqueta}».
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <span>La misma frase puede ser cortés o grosera: depende de si el otro terminó, de quién tiene la palabra y de lo que te pidieron.</span>
                  <button type="button" className="ei-btn" onClick={resetPanel}>
                    <i className="fa-solid fa-rotate-left" aria-hidden /> Run the panel again
                  </button>
                </div>
              )}
            </>
          )}

          {/* ═══ MODO — Your turn (escribir con el glosario A5) ═══ */}
          {modo === "escribe" && (
            <>
              <div className="ei-auditorio">
                <div className="ei-auditorio-fondo">
                  <i className="fa-solid fa-chalkboard-user" aria-hidden />
                  <ImgSim src={`${RUTA_FOTOS}/auditorio.webp`} />
                </div>
                <div className="ei-asientos" role="meter" aria-label="Público atento" aria-valuemin={0} aria-valuemax={ATENCION_MAX} aria-valuenow={atencion}>
                  {Array.from({ length: ATENCION_MAX }, (_, i) => (
                    <span key={i} className="ei-asiento" data-on={i < atencion}>
                      <i className={`fa-solid ${i < atencion ? "fa-face-smile" : "fa-face-meh-blank"}`} aria-hidden />
                    </span>
                  ))}
                </div>
                <span className="ei-auditorio-txt">
                  Público atento: {atencion}/{ATENCION_MAX}
                </span>
              </div>

              <div className="ei-chat" aria-live="polite">
                {chat.slice(-6).map((m, i) => (
                  <div key={`${chat.length}-${i}`} className="ei-msg" data-de={m.de} data-efecto={m.efecto}>
                    {m.quien && <span className="ei-msg-quien">{m.quien}</span>}
                    <span className="ei-msg-en">{m.en}</span>
                    {m.es && <span className="ei-msg-es">{m.es}</span>}
                  </div>
                ))}
              </div>

              <div className="ei-constructor">
                <label htmlFor="ei-borrador" className="ei-tit">
                  Tu respuesta en inglés (frase del glosario + de qué o por qué)
                </label>
                <textarea
                  id="ei-borrador"
                  className="ei-textarea"
                  rows={2}
                  value={borrador}
                  placeholder="Ej.: Today I am going to talk about…"
                  onChange={(e) => setBorrador(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      enviar();
                    }
                  }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="ei-btn ei-btn-pri" disabled={borrador.trim() === ""} onClick={enviar}>
                    <i className="fa-solid fa-paper-plane" aria-hidden /> Say it
                  </button>
                  <button type="button" className="ei-btn" onClick={otraConsigna}>
                    <i className="fa-solid fa-forward" aria-hidden /> Otra situación
                  </button>
                </div>
              </div>

              {ultimo && <AnalisisCard a={ultimo} espera={consigna.espera} />}

              <div>
                <div className="ei-tit" style={{ marginBottom: 8 }}>
                  Tu caja de herramientas (glosario A5): {frasesUsadas.size}/6 usadas bien
                </div>
                <div className="ei-glosario">
                  {GLOSARIO_A5.map((g) => (
                    <div key={g.id} className="ei-term" data-on={frasesUsadas.has(g.id)} data-ahora={g.id === consigna.espera}>
                      <strong>
                        <i className={`fa-solid ${frasesUsadas.has(g.id) ? "fa-circle-check" : "fa-circle"}`} aria-hidden /> {g.termino}
                      </strong>
                      <span>{g.definicion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ MODO — Complete the text (fill_blanks verbatim A6) ═══ */}
          {modo === "texto" && (
            <div className="ei-caja">
              <span className="ei-tit">
                <i className="fa-solid fa-microphone-lines" style={{ color: accent, marginRight: 8 }} aria-hidden />
                Guion de una presentación breve · IN-V-P07-A6
              </span>
              <CompletaTexto
                key={textoIntento}
                data={ENTREVISTA_INGLES_HUECOS}
                accent={accent}
                rgba={rgba}
                completado={textoDone}
                onCompletado={() => {
                  setTextoDone(true);
                  sfxOk();
                  persistMejor(aceptado, panelWin, glosarioDone, true);
                }}
                onAcierto={sfxBien}
                onError={sfxNo}
              />
            </div>
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
                <MarcadorPartida partida={partida} accent={accent} rgba={rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Impresión" value={`${imp}`} col={imp >= UMBRAL_ACEPTADO ? OK : imp >= UMBRAL_ESPERA ? ORO : NO} />
                  <Dato label="Mejor entrevista" value={`${mejorImp}`} col={aceptado ? OK : undefined} />
                  <Dato label="Confianza (panel)" value={`${pMed.conf}`} col={panelWin ? OK : undefined} />
                  <Dato label="Frases usadas" value={`${frasesUsadas.size}/6`} col={glosarioDone ? OK : undefined} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? ORO : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Sostienes una entrevista y un panel en inglés!" : "Completa los cuatro modos para 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Cómo decide el entrevistador" icono="fa-scale-balanced">
                {ORDEN_MEDIDORES.map((k) => (
                  <p key={k} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: MEDIDOR_INFO[k].color }}>{MEDIDOR_INFO[k].etiqueta}:</strong> {MEDIDOR_INFO[k].que}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  Un silencio de más resta 12 de fluidez. Responder sin entender una pregunta ambigua o confusa resta 10 de escucha; aclararla primero suma 12. Ganar
                  tiempo ayuda en la pregunta difícil; usada en todas, se vuelve muletilla.
                </p>
              </Bloque>
              <Bloque titulo="Lo que dijiste en la entrevista" icono="fa-comments">
                {dichos.length === 0 ? (
                  <p style={{ margin: 0, color: T.text3 }}>Todavía no respondes ninguna pregunta.</p>
                ) : (
                  dichos.map((d) => (
                    <p key={d.n} style={{ margin: 0, color: T.text2 }}>
                      <strong style={{ color: T.text }}>{d.n}.</strong> <span style={{ color: TONO_COLOR[d.tono] }}>«{d.texto}»</span>
                    </p>
                  ))
                )}
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={RETO_QUIZ}
              accent={accent}
              rgba={rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Ya sabes pedir aclaración, tomar la palabra sin interrumpir y guiar una presentación en inglés."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo={`Lectura A1 · ${LECTURA_A1.titulo}`} icono="fa-book-open-reader">
                {LECTURA_A1.parrafos.map((p) => (
                  <p key={p.slice(0, 40)} style={{ margin: 0, color: T.text2, lineHeight: 1.6 }}>
                    {p}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>Fuente: {LECTURA_A1.fuente}</p>
              </Bloque>
              <Bloque titulo="Importante" icono="fa-circle-exclamation">
                <p style={{ margin: 0, color: T.text2 }}>{LECTURA_A1.importante}</p>
              </Bloque>
              <Bloque titulo="Preguntas de comprensión · A1" icono="fa-circle-question">
                {COMPRENSION_A1.map((c) => (
                  <details key={c.pregunta} className="ei-det">
                    <summary>{c.pregunta}</summary>
                    <p>{c.guia}</p>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="Glosario · A5 (y A9)" icono="fa-spell-check">
                {GLOSARIO_A5.map((g) => (
                  <div key={g.id} className="ei-glos">
                    <strong>{g.termino}</strong>
                    <span>{g.definicion}</span>
                    <em>{g.ejemplo}</em>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Actividad final:</strong> {ACTIVIDAD_FINAL_A5}
                </p>
                <p style={{ margin: 0, color: T.text3 }}>
                  A9 relaciona cinco de estas frases con su definición; la definición sobrante (distractor) es: «{DISTRACTOR_A9}»
                </p>
              </Bloque>
              <Bloque titulo={`La tarea que viene · A3`} icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text }}>{REFLEXION_A3.titulo}</p>
                <p style={{ margin: 0, color: T.text2 }}>{REFLEXION_A3.prompt}</p>
                {REFLEXION_A3.pistas.map((p) => (
                  <p key={p} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                    {p}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>
                  Criterios: {REFLEXION_A3.criterios.join(" · ")} · Mínimo {REFLEXION_A3.minimoPalabras} palabras.
                </p>
              </Bloque>
              <Bloque titulo={`Video · A8 · ${VIDEO_A8.titulo}`} icono="fa-circle-play">
                <p style={{ margin: 0, color: T.text2 }}>{VIDEO_A8.descripcion}</p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                  {VIDEO_A8.abierta}
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                  {VIDEO_A8.opcionMultiple.pregunta} <strong style={{ color: OK }}>{VIDEO_A8.opcionMultiple.opciones[VIDEO_A8.opcionMultiple.correcta]}</strong>
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                  {VIDEO_A8.verdaderoFalso.enunciado} <strong style={{ color: OK }}>{VIDEO_A8.verdaderoFalso.respuesta ? "Verdadero" : "Falso"}</strong>
                </p>
              </Bloque>
              <Bloque titulo="Autoevaluación · A7" icono="fa-list-check">
                <p style={{ margin: 0, color: T.text3 }}>
                  {AUTOEVALUACION_A7.instrucciones} Escala: {AUTOEVALUACION_A7.escala.join(" · ")}.
                </p>
                {AUTOEVALUACION_A7.criterios.map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-regular fa-square-check" style={{ color: accent, marginRight: 8 }} aria-hidden />
                    {c}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>{AUTOEVALUACION_A7.reflexion}</p>
              </Bloque>
              <Bloque titulo="Qué es verbatim" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text3 }}>
                  <strong style={{ color: T.text2 }}>Verbatim de IN-V-P07:</strong> la lectura A1 con su nota y sus preguntas, los V/F de A2 y A4 (el reto), la
                  consigna de A3, el glosario A5 (que A9 reconstruye), el texto con huecos A6, la autoevaluación A7 y el video A8.{" "}
                  <strong style={{ color: T.text2 }}>Escrito para este laboratorio:</strong> la entrevista del Bridgeway Exchange Program, el panel del Río Claro
                  Youth Forum y las situaciones de «Your turn». Personas, organizaciones y lugares son <strong style={{ color: T.text2 }}>ficticios</strong>; los
                  puntajes son simulación. Inglés estadounidense estándar.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ENTREVISTA_INGLES_FICHA} accent={accent} rgba={rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Imagen con respaldo: si el archivo aún no existe se oculta y queda el degradado + ícono. */
function ImgSim({ src }: { src: string }) {
  const [rota, setRota] = useState(false);
  if (rota) return null;
  return <img src={src} alt="" loading="lazy" onError={() => setRota(true)} />;
}

function Reloj({ restante, total, on, silencio }: { restante: number; total: number; on: boolean; silencio: boolean }) {
  if (!on) {
    return (
      <div className="ei-reloj" data-off>
        <i className="fa-solid fa-stopwatch" aria-hidden /> Reloj apagado: tómate tu tiempo
      </div>
    );
  }
  const frac = silencio ? 0 : Math.max(0, Math.min(1, restante / total));
  const col = silencio ? NO : frac <= 0.35 ? ORO : OK;
  return (
    <div className="ei-reloj" role="timer" aria-label="Reloj de silencio">
      <span className="ei-reloj-txt" style={{ color: col }}>
        <i className="fa-solid fa-stopwatch" aria-hidden /> {silencio ? "Silencio incómodo" : `Silencio tolerable: ${Math.ceil(restante)} s`}
      </span>
      <div className="ei-barra">
        <div style={{ width: `${frac * 100}%`, background: col }} />
      </div>
    </div>
  );
}

function Libreta({ entradas }: { entradas: { n: number; txt: string; tono: Tono }[] }) {
  return (
    <div className="ei-libreta" aria-label="Libreta del entrevistador">
      <span className="ei-libreta-tit">
        <i className="fa-solid fa-pen" aria-hidden /> Interviewer&apos;s notes
      </span>
      {entradas.length === 0 ? (
        <span className="ei-libreta-vacia">(todavía en blanco)</span>
      ) : (
        <ul>
          {entradas.slice(-7).map((e, i) => (
            <li key={`${e.n}-${i}-${e.txt}`} data-tono={e.tono}>
              <span>Q{e.n}</span> {e.txt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Medidor({ etiqueta, icono, valor, delta, color, umbral }: { etiqueta: string; icono: string; valor: number; delta?: number; color: string; umbral?: number }) {
  const bajo = umbral !== undefined && valor < umbral;
  return (
    <div className="ei-medidor">
      <span className="ei-medidor-tit">
        <i className={`fa-solid ${icono}`} style={{ color }} aria-hidden /> {etiqueta}
      </span>
      <div className="ei-barra" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor} aria-label={etiqueta}>
        <div style={{ width: `${valor}%`, background: bajo ? ORO : color }} />
        {umbral !== undefined && <span className="ei-umbral" style={{ left: `${umbral}%` }} title={`Meta: ${umbral}`} />}
      </div>
      <span className="ei-medidor-val">
        {valor}
        {delta !== undefined && delta !== 0 && (
          <em style={{ color: delta > 0 ? OK : NO }}>
            {delta > 0 ? "+" : ""}
            {delta}
          </em>
        )}
      </span>
    </div>
  );
}

function DeltaChip({ etiqueta, v }: { etiqueta: string; v: number }) {
  const col = v > 0 ? OK : v < 0 ? NO : T.text3;
  return (
    <span className="ei-delta" style={{ color: col, borderColor: `${col}66` }}>
      {etiqueta} {v > 0 ? "+" : ""}
      {v}
    </span>
  );
}

function Deltas({ d }: { d: Medidores }) {
  return (
    <div className="ei-deltas">
      {ORDEN_MEDIDORES.map((k) => (
        <DeltaChip key={k} etiqueta={MEDIDOR_INFO[k].etiqueta} v={d[k]} />
      ))}
    </div>
  );
}

const RESPUESTA_ESCRITO: Record<Exclude<EfectoEscrito, "bien">, { en: string; es: string }> = {
  corta: { en: "Okay... and?", es: `Usaste la frase, pero quedó corta: desarrolla con de qué o por qué (${MIN_PALABRAS_DESARROLLO} palabras o más).` },
  otra: { en: "Sorry, I'm a bit lost.", es: "Usaste una frase del glosario, pero no la que pide ESTE momento." },
  error: { en: "Sorry?", es: "Hay un error (abajo te decimos cuál). La frase no cuenta hasta que salga limpia." },
  sinFrase: { en: "Hmm, okay.", es: "Se entiende la idea, pero falta la frase que guía a quien te escucha." },
  vacio: { en: "", es: "" },
};

const EFECTO_TXT: Record<EfectoEscrito, string> = {
  bien: "Frase correcta para el momento y desarrollada: el público te sigue.",
  corta: "La frase es la correcta, pero quedó corta: agrega de qué o por qué.",
  otra: "Usaste una frase del glosario que no corresponde a este momento.",
  error: "Hay un error que confunde a quien te escucha.",
  sinFrase: "Falta la frase que este momento necesita.",
  vacio: "Escribe una frase completa (al menos tres palabras).",
};

function AnalisisCard({ a, espera }: { a: AnalisisEscrito; espera: FraseId }) {
  const color = a.efecto === "bien" ? OK : a.efecto === "corta" || a.efecto === "vacio" ? ORO : a.efecto === "error" ? NARANJA : NO;
  const g = GLOSARIO_A5.find((x) => x.id === espera)!;
  return (
    <div className="ei-retro" style={{ ["--rc" as string]: color }}>
      <strong>{EFECTO_TXT[a.efecto]}</strong>
      {a.efecto !== "vacio" && (
        <span>
          {a.palabras} palabras · público {a.atencion > 0 ? `+${a.atencion}` : a.atencion}
        </span>
      )}
      {a.errores.map((e) => (
        <span key={e.id} className="ei-error">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden /> {e.porque}
        </span>
      ))}
      {(a.efecto === "otra" || a.efecto === "sinFrase" || a.efecto === "corta") && (
        <span>
          Este momento pide: <strong style={{ color: T.text }}>{g.termino}</strong> — {g.ejemplo}
        </span>
      )}
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes eiShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes eiBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
  @keyframes eiIn { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
  @keyframes eiPuntos { 0%{content:"";} 33%{content:".";} 66%{content:"..";} 100%{content:"...";} }
  @keyframes eiSello { from{opacity:0; transform:rotate(-14deg) scale(1.6);} to{opacity:1; transform:rotate(-8deg) scale(1);} }
  .ei-raiz { display:flex; flex-direction:column; gap:14px; min-width:0; font-size:15px; color:${T.text}; }
  .ei-raiz p { margin:0; line-height:1.5; }
  .ei-nota { font-size:14px; color:${T.text3}; }
  .ei-aviso { display:flex; gap:8px; align-items:flex-start; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; font-size:14px; color:${T.text2}; }
  .ei-x { margin-left:auto; cursor:pointer; border:none; background:none; color:${T.text3}; font-size:15px; }

  .ei-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:15px; font-weight:800; transition:all .14s; align-self:flex-start; }
  .ei-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .ei-btn:disabled { opacity:.45; cursor:not-allowed; }
  .ei-btn-pri { background:${accent}; color:#04121f; border-color:${accent}; }
  .ei-btn:focus-visible, .ei-chip:focus-visible, .ei-est:focus-visible, .ei-mini:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  .ei-mini { cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:9px; border:1px solid ${T.line};
    background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:700; }
  .ei-mini:hover { color:#fff; border-color:${T.lineStrong}; }

  .ei-intro { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap:16px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; overflow:hidden; }
  .ei-intro-cuerpo { padding:16px 18px; display:grid; gap:12px; align-content:start; }
  .ei-lista { list-style:none; margin:0; padding:0; display:grid; gap:9px; font-size:15px; color:${T.text2}; }
  .ei-lista i { color:${accent}; width:20px; }
  .ei-foto { position:relative; display:flex; align-items:center; justify-content:center; min-height:180px;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,18,36,0.95)); }
  .ei-foto > i { font-size:54px; color:rgba(255,255,255,0.22); }
  .ei-foto img, .ei-escritorio-fondo img, .ei-mesa-fondo img, .ei-auditorio-fondo img, .ei-retrato img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }

  .ei-pasos { display:flex; gap:6px; align-items:center; }
  .ei-paso { flex:1; height:10px; border-radius:6px; background:${T.inset}; border:1px solid ${T.line}; }
  .ei-paso[data-on="true"] { border-color:${accent}; box-shadow:0 0 0 1px ${accent}; }
  .ei-paso-fin { flex:0 0 auto; height:auto; padding:3px 10px; font-size:14px; font-weight:800; color:${T.text3}; display:inline-flex; gap:6px; align-items:center; }
  .ei-paso-fin[data-on="true"] { color:#04121f; background:${accent}; }

  .ei-sala { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap:12px; }
  .ei-escritorio { position:relative; border-radius:16px; overflow:hidden; border:1.5px solid ${T.line}; min-height:200px; display:flex; flex-direction:column; justify-content:flex-end;
    background:linear-gradient(135deg, rgba(${rgba},0.28), rgba(8,18,36,0.95)); transition:border-color .3s; }
  .ei-escritorio[data-animo="frunce"] { border-color:${NO}; }
  .ei-escritorio[data-animo="contento"] { border-color:${OK}; }
  .ei-escritorio-fondo { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  .ei-escritorio-fondo > i { font-size:54px; color:rgba(255,255,255,0.12); }
  .ei-persona { position:relative; display:flex; gap:12px; align-items:center; padding:14px 14px 8px; background:linear-gradient(180deg, transparent, rgba(2,10,24,.85) 40%); }
  .ei-retrato { position:relative; width:84px; height:84px; flex-shrink:0; border-radius:50%; overflow:hidden; border:3px solid var(--ac,#8FA3BF);
    background:linear-gradient(135deg, rgba(${rgba},0.4), rgba(8,18,36,0.95)); display:flex; align-items:center; justify-content:center; transition:border-color .3s; }
  .ei-retrato > i { font-size:34px; color:var(--ac,#8FA3BF); }
  .ei-retrato-chico { width:60px; height:60px; }
  .ei-retrato-chico > i { font-size:24px; }
  .ei-cara { position:absolute; right:2px; bottom:2px; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    background:rgba(2,12,28,.92); color:var(--ac); font-size:17px; border:2px solid var(--ac); }
  .ei-retrato[data-animo="frunce"], .ei-retrato[data-animo="confundido"] { animation:eiShake .5s 1; }
  .ei-retrato[data-animo="contento"] { animation:eiBob 1.4s ease-in-out infinite; }
  .ei-persona-txt { display:grid; gap:3px; min-width:0; }
  .ei-persona-txt strong { font-size:16px; }
  .ei-animo { font-size:14px; font-weight:800; display:inline-flex; gap:6px; align-items:center; }
  .ei-imp { font-size:14px; color:${T.text2}; }
  .ei-imp strong { font-size:18px; font-variant-numeric:tabular-nums; }

  .ei-reloj { position:relative; display:grid; gap:6px; padding:8px 14px 12px; background:rgba(2,10,24,.85); font-size:14px; font-weight:700; color:${T.text2}; }
  .ei-reloj[data-off] { display:flex; gap:8px; align-items:center; }
  .ei-reloj-txt { display:inline-flex; gap:7px; align-items:center; font-variant-numeric:tabular-nums; }

  .ei-libreta { border-radius:16px; padding:14px 16px; color:#1d2633; min-height:200px; display:flex; flex-direction:column; gap:6px;
    background:repeating-linear-gradient(180deg, #f6f1e3 0px, #f6f1e3 27px, #c9d6e6 27px, #c9d6e6 28px); border-left:6px solid #e08a8a; }
  .ei-libreta-tit { font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:#37465a; display:inline-flex; gap:7px; align-items:center; }
  .ei-libreta-vacia { font-size:14px; color:#6b7a8e; font-style:italic; }
  .ei-libreta ul { list-style:none; margin:0; padding:0; display:grid; gap:2px; }
  .ei-libreta li { font-size:15px; line-height:28px; font-family:"Segoe Print","Bradley Hand","Comic Sans MS",cursive; color:#1f3f8a; animation:eiIn .3s ease; }
  .ei-libreta li[data-tono="mal"] { color:#b42323; }
  .ei-libreta li[data-tono="bien"] { color:#16703f; }
  .ei-libreta li span { font-family:ui-monospace, monospace; font-size:14px; font-weight:800; color:#37465a; margin-right:4px; }

  .ei-medidores { display:grid; gap:8px; padding:12px 14px; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; }
  .ei-medidor { display:grid; grid-template-columns:minmax(0, 190px) minmax(0,1fr) auto; gap:10px; align-items:center; }
  .ei-medidor-tit { font-size:14px; font-weight:800; color:${T.text2}; display:inline-flex; gap:7px; align-items:center; overflow:hidden; text-overflow:ellipsis; }
  .ei-barra { position:relative; height:12px; border-radius:8px; background:${T.inset}; border:1px solid ${T.line}; overflow:visible; }
  .ei-barra > div { height:100%; border-radius:8px; transition:width .45s ease, background .3s; }
  .ei-umbral { position:absolute; top:-4px; bottom:-4px; width:2px; background:#fff; border-radius:2px; }
  .ei-medidor-val { font-size:15px; font-weight:900; font-variant-numeric:tabular-nums; min-width:62px; text-align:right; display:inline-flex; gap:6px; justify-content:flex-end; }
  .ei-medidor-val em { font-style:normal; font-size:14px; animation:eiIn .3s ease; }

  .ei-burbuja { border-radius:16px; padding:12px 16px; background:${T.glass}; border:1.5px solid ${T.line}; animation:eiIn .3s ease; display:grid; gap:6px; }
  .ei-burbuja-top { display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; }
  .ei-burbuja-top strong { font-size:14px; color:${T.text3}; }
  .ei-burbuja-btns { display:inline-flex; gap:6px; flex-wrap:wrap; }
  .ei-ing { font-size:18px; font-weight:800; color:#fff; line-height:1.4; }
  .ei-esp { font-size:14px; color:${T.text3}; }
  .ei-clave { background:rgba(255,199,90,0.22); color:#fff; padding:0 4px; border-radius:5px; border-bottom:2px dashed ${ORO}; }
  .ei-ruido { color:${T.text3}; letter-spacing:-1px; filter:blur(1.2px); }
  .ei-ruido-aviso, .ei-situacion { font-size:14px; color:${ORO}; display:inline-flex; gap:7px; align-items:center; font-weight:700; }
  .ei-puntos::after { content:"..."; display:inline-block; width:22px; text-align:left; animation:eiPuntos 1.2s steps(1) infinite; color:${accent}; }
  .ei-linea { padding:10px 14px; border-radius:12px; border-left:4px solid var(--rc); background:${T.inset}; font-size:15px; color:#fff; display:grid; gap:2px; animation:eiIn .3s ease; }
  .ei-linea span { font-size:14px; color:${T.text3}; }

  .ei-caja { display:grid; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
  .ei-tit { font-size:14px; font-weight:900; letter-spacing:.04em; color:${T.text2}; }
  .ei-estrategias, .ei-movidas { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap:8px; }
  .ei-est { cursor:pointer; display:grid; gap:4px; text-align:left; padding:10px 12px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; transition:all .14s; }
  .ei-est:hover:not(:disabled) { border-color:${accent}; transform:translateY(-1px); }
  .ei-est:disabled { cursor:default; opacity:.55; }
  .ei-est[data-usada="true"] { border-style:dashed; }
  .ei-est-et { font-size:14px; font-weight:900; color:${accent}; display:inline-flex; gap:7px; align-items:center; }
  .ei-est-en { font-size:15px; font-weight:700; line-height:1.35; }
  .ei-est-retro { display:flex; gap:9px; align-items:flex-start; font-size:14px; line-height:1.45; }
  .ei-est-retro i { margin-top:3px; }

  .ei-constructor { display:grid; gap:12px; padding:14px; border-radius:16px; border:1.5px solid rgba(${rgba},0.35); background:rgba(${rgba},0.06); }
  .ei-fila { display:grid; gap:7px; }
  .ei-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .ei-chip { cursor:pointer; padding:10px 14px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
    font-size:15px; font-weight:700; line-height:1.3; text-align:left; transition:all .14s; max-width:100%; }
  .ei-chip:hover { border-color:${accent}; transform:translateY(-1px); }
  .ei-chip[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.22); box-shadow:0 0 14px -5px ${accent}; }
  .ei-chip[data-vacia="true"] { font-style:italic; color:${T.text2}; }
  .ei-preview { display:grid; gap:4px; padding:10px 12px; border-radius:12px; background:${T.inset}; border:1px solid ${T.line}; }
  .ei-preview span { font-size:14px; color:${T.text3}; font-weight:700; }
  .ei-preview strong { font-size:16px; line-height:1.4; }

  .ei-retro { display:flex; flex-direction:column; gap:10px; align-items:flex-start; padding:13px 15px; border-radius:13px; font-size:15px; line-height:1.5; color:${T.text2};
    border:1.5px solid var(--rc); background:${T.glass}; animation:eiIn .3s ease; }
  .ei-retro > strong { color:#fff; font-size:15px; }
  .ei-dijiste { color:#fff; font-size:16px; font-weight:700; }
  .ei-dijiste span { font-size:14px; color:${T.text3}; font-weight:700; margin-right:4px; }
  .ei-deltas { display:flex; flex-wrap:wrap; gap:6px; }
  .ei-delta { font-size:14px; font-weight:900; padding:3px 10px; border-radius:999px; border:1px solid; font-variant-numeric:tabular-nums; }
  .ei-notas { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  .ei-notas li { display:flex; gap:9px; align-items:flex-start; font-size:14px; line-height:1.45; }
  .ei-notas li strong { color:#fff; }
  .ei-notas li[data-tono="bien"] > i { color:${OK}; }
  .ei-notas li[data-tono="regular"] > i { color:${ORO}; }
  .ei-notas li[data-tono="mal"] > i { color:${NO}; }
  .ei-notas li > i { margin-top:3px; }
  .ei-error { display:flex; gap:8px; align-items:flex-start; font-size:14px; color:#ffd9c2; }
  .ei-error i { color:${NARANJA}; margin-top:3px; }

  .ei-final { display:grid; gap:12px; justify-items:center; }
  .ei-sello { padding:10px 22px; border:4px solid var(--rc); border-radius:12px; color:var(--rc); font-size:26px; font-weight:900; letter-spacing:.12em;
    transform:rotate(-8deg); animation:eiSello .45s ease; font-family:ui-monospace, monospace; }
  .ei-final .ei-retro { justify-self:stretch; }

  .ei-tema { display:grid; gap:4px; padding:12px 16px; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; }
  .ei-tema strong { font-size:17px; }
  .ei-tema span { font-size:14px; color:${T.text3}; }
  .ei-mesa { position:relative; border-radius:16px; overflow:hidden; border:1.5px solid ${T.line}; min-height:170px;
    background:linear-gradient(135deg, rgba(${rgba},0.28), rgba(8,18,36,0.95)); }
  .ei-mesa-fondo { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  .ei-mesa-fondo > i { font-size:54px; color:rgba(255,255,255,0.12); }
  .ei-elenco { position:relative; display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px; padding:18px 8px 12px;
    background:linear-gradient(180deg, rgba(2,10,24,.15), rgba(2,10,24,.85) 55%); }
  .ei-pj { display:flex; flex-direction:column; align-items:center; gap:5px; min-width:0; text-align:center; }
  .ei-pj[data-palabra="true"] .ei-retrato { box-shadow:0 0 0 3px ${accent}, 0 0 18px -2px ${accent}; }
  .ei-pj-nombre { padding:2px 9px; border-radius:999px; background:rgba(2,12,28,.85); color:#fff; font-size:14px; font-weight:800; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ei-pj-mic { font-size:14px; font-weight:700; padding:2px 8px; border-radius:8px; color:${T.text3}; background:rgba(2,12,28,.7); max-width:100%; }
  .ei-pj-mic[data-on="true"] { color:#04121f; background:${accent}; }

  .ei-auditorio { position:relative; border-radius:16px; overflow:hidden; border:1.5px solid ${T.line}; min-height:150px; display:flex; flex-direction:column; justify-content:flex-end;
    background:linear-gradient(135deg, rgba(${rgba},0.28), rgba(8,18,36,0.95)); }
  .ei-auditorio-fondo { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  .ei-auditorio-fondo > i { font-size:54px; color:rgba(255,255,255,0.12); }
  .ei-asientos { position:relative; display:grid; grid-template-columns:repeat(8, minmax(0,1fr)); gap:4px; padding:12px 10px 4px; background:linear-gradient(180deg, transparent, rgba(2,10,24,.85) 40%); }
  .ei-asiento { display:flex; align-items:center; justify-content:center; aspect-ratio:1; border-radius:50%; background:rgba(2,12,28,.8); border:2px solid ${T.line};
    font-size:18px; color:${T.text3}; transition:all .3s; max-width:44px; justify-self:center; width:100%; }
  .ei-asiento[data-on="true"] { color:${OK}; border-color:${OK}; }
  .ei-auditorio-txt { position:relative; padding:4px 12px 10px; font-size:14px; font-weight:800; color:#fff; background:rgba(2,10,24,.85); }

  .ei-chat { display:flex; flex-direction:column; gap:8px; }
  .ei-msg { display:grid; gap:2px; max-width:min(100%, 560px); padding:10px 13px; border-radius:14px; animation:eiIn .25s ease; }
  .ei-msg[data-de="ellos"] { align-self:flex-start; background:${T.glassSoft}; border:1px solid ${T.line}; border-bottom-left-radius:4px; }
  .ei-msg[data-de="tu"] { align-self:flex-end; background:rgba(${rgba},0.18); border:1px solid rgba(${rgba},0.45); border-bottom-right-radius:4px; }
  .ei-msg[data-efecto="error"], .ei-msg[data-efecto="otra"], .ei-msg[data-efecto="sinFrase"] { border-color:${NARANJA}; }
  .ei-msg[data-efecto="bien"] { border-color:${OK}; }
  .ei-msg-quien { font-size:14px; font-weight:800; color:${accent}; }
  .ei-msg-en { font-size:15px; font-weight:700; color:#fff; }
  .ei-msg-es { font-size:14px; color:${T.text3}; }
  .ei-textarea { width:100%; box-sizing:border-box; resize:vertical; min-height:64px; padding:11px 13px; border-radius:12px; border:1.5px solid ${T.lineStrong};
    background:${T.inset}; color:#fff; font:inherit; font-size:16px; line-height:1.4; }
  .ei-textarea:focus { outline:none; border-color:${accent}; }
  .ei-glosario { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:10px; }
  .ei-term { display:grid; gap:4px; padding:11px 13px; border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.glass}; font-size:14px; color:${T.text2}; transition:all .25s; }
  .ei-term strong { color:#fff; font-size:15px; display:flex; gap:7px; align-items:flex-start; }
  .ei-term strong i { color:${T.text3}; font-size:14px; margin-top:3px; }
  .ei-term[data-on="true"] { border-style:solid; border-color:${OK}; background:${OK}12; }
  .ei-term[data-on="true"] strong i { color:${OK}; }

  .ei-det { border:1px solid ${T.line}; border-radius:10px; padding:8px 12px; background:${T.inset}; }
  .ei-det summary { cursor:pointer; font-weight:800; color:${T.text}; font-size:15px; }
  .ei-det p { margin:8px 0 0; color:${T.text2}; font-size:14px; line-height:1.5; }
  .ei-glos { display:grid; gap:3px; font-size:14px; color:${T.text2}; }
  .ei-glos strong { color:${T.text}; font-size:15px; }
  .ei-glos em { color:${T.text3}; }

  @media (max-width: 560px) {
    .ei-elenco { grid-template-columns:repeat(2, minmax(0,1fr)); row-gap:12px; }
    .ei-medidor { grid-template-columns:minmax(0,1fr) auto; }
    .ei-medidor .ei-barra { grid-column:1 / -1; grid-row:2; }
    .ei-asientos { grid-template-columns:repeat(4, minmax(0,1fr)); }
    .ei-ing { font-size:17px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ei-retrato[data-animo], .ei-burbuja, .ei-retro, .ei-msg, .ei-linea, .ei-libreta li, .ei-sello, .ei-medidor-val em, .ei-puntos::after { animation:none; }
    .ei-barra > div, .ei-chip, .ei-chip:hover, .ei-est, .ei-est:hover:not(:disabled), .ei-asiento { transition:none; transform:none; }
  }
`;
