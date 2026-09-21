"use client";

/**
 * Laboratorio — A trip to remember
 * Práctica experimental para IN-IV-P01 (Inglés IV, progresión 1).
 *
 * El ángulo: NARRAR con detalle. No es «pasado simple» a secas (eso ya lo
 * trabaja `pasado-simple-ingles` de Inglés III) ni la distinción con el present
 * perfect: aquí lo que se practica es lo que convierte una lista de acciones en
 * una historia —la ortografía del pasado, el fondo que se interrumpe, el orden
 * con conectores y la coherencia temporal de todo el relato—.
 *
 *  1. «Spelling the past» — dieciséis verbos y las cinco maneras de formar su
 *     pasado: la regla general (-ed), la -e que solo pide -d, la y que se
 *     vuelve i, la consonante que se dobla y la lista irregular que no tiene
 *     regla. Se clasifica y aparece la forma escrita; el fallo explica la regla
 *     de la columna, no la respuesta.
 *  2. «Background & interruption» — cinco escenas en lugares reales de México.
 *     El alumno coloca el verbo del FONDO (past continuous) y el de la
 *     INTERRUPCIÓN (past simple) sobre una línea del tiempo que se dibuja, y
 *     después elige cuál de las dos oraciones está bien armada.
 *  3. «Build the trip» — dos fases: ordenar los seis momentos de una excursión
 *     escolar bajo su conector de tiempo, y después cazar, en tres rondas, la
 *     oración que rompe el tiempo verbal del resto.
 *  4. «Write the verb» — SE ESCRIBE: ocho oraciones donde hay que decidir
 *     simple o continuous y, además, escribirlo bien.
 *  5. «Completa el texto» — los dos textos con huecos de la progresión (A2 y
 *     A6), verbatim.
 *  + Reto evaluable con el True/False verbatim de A4.
 *
 * DOM puro (sin three.js): el fenómeno aquí es la lengua. El escenario —la
 * línea del tiempo con su banda de fondo y su rayo, y el itinerario del
 * viaje— se dibuja en SVG.
 *
 * Interfaz, pistas y explicaciones en español de México; todo el inglés que el
 * alumno lee o produce es inglés estadounidense estándar. Ver la nota al pie y
 * el encabezado de `pasado-viaje-data.ts` para lo que es verbatim y lo que es
 * ilustrativo.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { hablarLab, callarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto, normaliza } from "./_mecanica-huecos";
import { PASADO_VIAJE_HUECOS_A2, PASADO_VIAJE_HUECOS_A6 } from "./pasado-viaje-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { PASADO_VIAJE_FICHA } from "./pasado-viaje-ficha";
import {
  VERBOS,
  TOTAL_VERBOS,
  ORDEN_REGLAS,
  REGLA_INFO,
  ESCENAS,
  RELATO,
  RELATO_TITULO,
  CONECTORES_INFO,
  EXPRESIONES_TIEMPO,
  INTRUSOS,
  ESCRITURA,
  LECTURA_A1,
  LECTURA_A1_TITULO,
  NOTA_GRAMATICAL_A1,
  PREGUNTAS_A1,
  DATO_A1,
  TU_TURNO_A3,
  GLOSARIO_A5,
  CIERRE_A5,
  AUTOEVAL_A7,
  AUTOEVAL_A7_CIERRE,
  VIDEO_A8,
  QUIZ,
  DATO_BILINGUE,
  FUENTE,
  type ReglaEd,
  type EscenaFondo,
  type FichaVerbo,
} from "./pasado-viaje-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-pasado-viaje-reto";

type Modo = "ortografia" | "fondo" | "relato" | "escribir" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "ortografia", label: "Spelling the past", icono: "fa-spell-check" },
  { id: "fondo", label: "Background & interruption", icono: "fa-timeline" },
  { id: "relato", label: "Build the trip", icono: "fa-route" },
  { id: "escribir", label: "Write the verb", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/**
 * Orden fijo en que se ofrecen los verbos del modo 1: revuelto respecto a las
 * columnas, pero DETERMINISTA. Barajar con Math.random durante el render está
 * prohibido por el compilador de React, y además haría que las fichas se
 * movieran solas en cada repintado.
 */
const ORDEN_VERBOS = [
  "arrive", "go", "study", "stop", "visit", "buy", "carry", "decorate",
  "plan", "see", "try", "walk", "shop", "taste", "take", "play",
];

/** Igual de determinista: el orden en que se presentan las cartas del relato. */
const ORDEN_CARTAS = ["m3", "m6", "m1", "m5", "m2", "m4"];

/** Por qué esa ficha no va en esa zona de la línea del tiempo. */
function razonZona(ficha: FichaVerbo, zona: "fondo" | "inter"): string {
  if (zona === "fondo") {
    return ficha.tipo === "simple"
      ? "El fondo es lo que YA venía pasando: va en past continuous (was / were + -ing), no en past simple."
      : "Esa sí es una forma de past continuous, pero pertenece al otro verbo de la escena. Mira cuál de los dos duraba.";
  }
  return ficha.tipo === "cont"
    ? "Lo que interrumpe ocurre de golpe y se acaba: va en past simple, no en past continuous."
    : "Esa sí es una forma de past simple, pero pertenece al otro verbo de la escena. Mira cuál de los dos fue instantáneo.";
}

export function LabPasadoViajeIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("ortografia");

  /* ── sonido y partida ─────────────────────────────────────────────── */
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  useEffect(
    // `callarLab()` ya se traga sus propios fallos: no hace falta envolverlo.
    () => callarLab,
    []
  );
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
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  /* ═══ MODO 1 · Spelling the past ═══════════════════════════════════ */
  const [colocado, setColocado] = useState<Record<string, ReglaEd>>({});
  const [selVerbo, setSelVerbo] = useState<string | null>(null);
  const [shakeCol, setShakeCol] = useState<ReglaEd | null>(null);
  const [msgOrt, setMsgOrt] = useState<{ ok: boolean; txt: string } | null>(null);

  const ponerVerbo = (verboId: string, regla: ReglaEd) => {
    const v = VERBOS.find((x) => x.id === verboId);
    if (!v || colocado[verboId]) return;
    if (v.regla === regla) {
      setColocado((prev) => ({ ...prev, [verboId]: regla }));
      setSelVerbo(null);
      setMsgOrt({ ok: true, txt: `${v.base} → ${v.pasado}. ${v.porque}` });
      sfxPlace();
    } else {
      setShakeCol(regla);
      setMsgOrt({ ok: false, txt: `«${v.base}» no entra en «${REGLA_INFO[regla].titulo}». ${REGLA_INFO[regla].explica}` });
      sfxNo();
      window.setTimeout(() => setShakeCol(null), 420);
    }
  };

  const colocadosTotal = Object.keys(colocado).length;
  const ortografiaDone = colocadosTotal >= TOTAL_VERBOS;
  const verbosLibres = ORDEN_VERBOS.filter((id) => !colocado[id]);

  const resetOrtografia = () => {
    setColocado({});
    setSelVerbo(null);
    setMsgOrt(null);
    setShakeCol(null);
  };

  /* ═══ MODO 2 · Background & interruption ═══════════════════════════ */
  const [escIdx, setEscIdx] = useState(0);
  const [zonas, setZonas] = useState<Record<string, { fondo?: string; inter?: string }>>({});
  const [selFicha, setSelFicha] = useState<string | null>(null);
  const [elegida, setElegida] = useState<Record<string, boolean>>({});
  const [msgEsc, setMsgEsc] = useState<{ ok: boolean; txt: string } | null>(null);
  const [shakeZona, setShakeZona] = useState<"fondo" | "inter" | null>(null);

  const esc: EscenaFondo = ESCENAS[escIdx] ?? ESCENAS[0]!;
  const zonaEsc = zonas[esc.id] ?? {};

  const ponerFicha = (fichaId: string, zona: "fondo" | "inter") => {
    if (zonaEsc[zona]) return;
    const ficha = esc.fichas.find((f) => f.id === fichaId);
    if (!ficha) return;
    const esperado = zona === "fondo" ? esc.fondoId : esc.interId;
    if (fichaId === esperado) {
      setZonas((prev) => ({ ...prev, [esc.id]: { ...(prev[esc.id] ?? {}), [zona]: fichaId } }));
      setSelFicha(null);
      setMsgEsc({
        ok: true,
        txt:
          zona === "fondo"
            ? `«${ficha.forma}» es el fondo: past continuous, la acción que ya estaba en marcha.`
            : `«${ficha.forma}» es la interrupción: past simple, un hecho puntual y terminado.`,
      });
      sfxPlace();
    } else {
      setShakeZona(zona);
      setMsgEsc({ ok: false, txt: razonZona(ficha, zona) });
      sfxNo();
      window.setTimeout(() => setShakeZona(null), 420);
    }
  };

  const elegirOracion = (i: number) => {
    if (elegida[esc.id]) return;
    const op = esc.opciones[i === 0 ? 0 : 1];
    if (op.correcta) {
      setElegida((prev) => ({ ...prev, [esc.id]: true }));
      setMsgEsc({ ok: true, txt: `${op.razon} ${esc.explica}` });
      sfxOk();
    } else {
      setMsgEsc({ ok: false, txt: op.razon });
      sfxNo();
    }
  };

  const escenasArmadas = ESCENAS.filter((e) => zonas[e.id]?.fondo && zonas[e.id]?.inter).length;
  const escenasElegidas = ESCENAS.filter((e) => elegida[e.id]).length;
  const fondoDone = escenasArmadas >= ESCENAS.length;
  const oracionesDone = escenasElegidas >= ESCENAS.length;

  const resetFondo = () => {
    setZonas({});
    setElegida({});
    setSelFicha(null);
    setMsgEsc(null);
    setEscIdx(0);
    setShakeZona(null);
  };

  /* ═══ MODO 3 · Build the trip ══════════════════════════════════════ */
  const [fase, setFase] = useState<"orden" | "intrusos">("orden");
  const [slots, setSlots] = useState<(string | null)[]>(() => RELATO.map(() => null));
  const [selCarta, setSelCarta] = useState<string | null>(null);
  const [shakeSlot, setShakeSlot] = useState<number | null>(null);
  const [msgRelato, setMsgRelato] = useState<{ ok: boolean; txt: string } | null>(null);
  const [cazados, setCazados] = useState<Record<string, boolean>>({});
  const [fallado, setFallado] = useState<Record<string, number>>({});
  const [msgIntruso, setMsgIntruso] = useState<Record<string, { ok: boolean; txt: string }>>({});

  const ponerCarta = (cartaId: string, i: number) => {
    if (slots[i]) return;
    const esperado = RELATO[i];
    if (!esperado) return;
    if (esperado.id === cartaId) {
      setSlots((prev) => {
        const nx = [...prev];
        nx[i] = cartaId;
        return nx;
      });
      setSelCarta(null);
      setMsgRelato({ ok: true, txt: esperado.pista });
      sfxPlace();
    } else {
      const carta = RELATO.find((m) => m.id === cartaId);
      setShakeSlot(i);
      setMsgRelato({
        ok: false,
        txt: carta
          ? `«${esperado.conector}» no encaja con esa oración. Fíjate en el verbo y en lo que anuncia el conector de la ranura.`
          : "Elige primero una oración de abajo.",
      });
      sfxNo();
      window.setTimeout(() => setShakeSlot(null), 420);
    }
  };

  const cazar = (rondaId: string, i: number) => {
    const ronda = INTRUSOS.find((r) => r.id === rondaId);
    if (!ronda || cazados[rondaId]) return;
    if (ronda.intruso === i) {
      setCazados((prev) => ({ ...prev, [rondaId]: true }));
      setMsgIntruso((prev) => ({ ...prev, [rondaId]: { ok: true, txt: `${ronda.explica} Debería decir: «${ronda.correccion}»` } }));
      sfxOk();
    } else {
      setFallado((prev) => ({ ...prev, [rondaId]: i }));
      setMsgIntruso((prev) => ({
        ...prev,
        [rondaId]: { ok: false, txt: "Esa oración sí está en pasado. Busca un verbo en presente o en futuro: es el que rompe la narración." },
      }));
      sfxNo();
    }
  };

  const colocadasRelato = slots.filter(Boolean).length;
  const ordenDone = colocadasRelato >= RELATO.length;
  const intrusosDone = Object.keys(cazados).length >= INTRUSOS.length;
  const cartasLibres = ORDEN_CARTAS.filter((id) => !slots.includes(id));

  const resetRelato = () => {
    setSlots(RELATO.map(() => null));
    setSelCarta(null);
    setMsgRelato(null);
    setCazados({});
    setFallado({});
    setMsgIntruso({});
    setFase("orden");
    setShakeSlot(null);
  };

  /* ═══ MODO 4 · Write the verb (se escribe) ═════════════════════════ */
  const [vals, setVals] = useState<Record<string, string>>({});
  const [estados, setEstados] = useState<Record<string, "vacio" | "bien" | "mal">>({});
  const [pistas, setPistas] = useState<Record<string, boolean>>({});
  const [notas, setNotas] = useState<Record<string, string>>({});

  const comprobarEscritura = (id: string) => {
    const item = ESCRITURA.find((x) => x.id === id);
    if (!item || estados[id] === "bien") return;
    const v = (vals[id] ?? "").trim();
    if (v === "") {
      setEstados((prev) => ({ ...prev, [id]: "vacio" }));
      return;
    }
    const bien = [item.respuesta, ...item.alternativas].some((r) => normaliza(r) === normaliza(v));
    setEstados((prev) => ({ ...prev, [id]: bien ? "bien" : "mal" }));
    setNotas((prev) => ({ ...prev, [id]: bien ? item.explica : `Todavía no. ${item.pista}` }));
    if (bien) sfxPlace();
    else sfxNo();
  };

  const escritasBien = ESCRITURA.filter((x) => estados[x.id] === "bien").length;
  const escribirDone = escritasBien >= ESCRITURA.length;

  const resetEscribir = () => {
    setVals({});
    setEstados({});
    setPistas({});
    setNotas({});
  };

  /* ═══ MODO 5 · Completa el texto (A2 y A6 verbatim) ════════════════ */
  const [texto2Done, setTexto2Done] = useState(false);
  const [texto6Done, setTexto6Done] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTexto2Done(false);
    setTexto6Done(false);
    setTextoIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ────────────────────────────────────────────────────── */
  const todoHecho =
    ortografiaDone && fondoDone && oracionesDone && ordenDone && intrusosDone && escribirDone && texto2Done && texto6Done;
  const objetivos = [
    { txt: `Clasifica los ${TOTAL_VERBOS} verbos por su regla de escritura`, done: ortografiaDone },
    { txt: `Coloca fondo e interrupción en las ${ESCENAS.length} escenas`, done: fondoDone },
    { txt: "Elige la oración bien armada en cada escena", done: oracionesDone },
    { txt: `Ordena los ${RELATO.length} momentos del viaje con su conector`, done: ordenDone },
    { txt: `Caza las ${INTRUSOS.length} oraciones que rompen el tiempo verbal`, done: intrusosDone },
    { txt: `Escribe las ${ESCRITURA.length} formas verbales (simple o continuous)`, done: escribirDone },
    { txt: "Completa el texto de A2 (past simple)", done: texto2Done },
    { txt: "Completa el texto de A6 (past continuous)", done: texto6Done },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  const resetActual =
    modo === "ortografia"
      ? resetOrtografia
      : modo === "fondo"
        ? resetFondo
        : modo === "relato"
          ? resetRelato
          : modo === "escribir"
            ? resetEscribir
            : resetTexto;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes psvShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes psvPop { 0%{transform:scale(.72);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        @keyframes psvBanda { 0%{transform:scaleX(0);} 100%{transform:scaleX(1);} }
        @keyframes psvRayo { 0%,100%{opacity:.95;} 50%{opacity:.35;} }
        @keyframes psvLluvia { 0%{transform:translateY(-12px);opacity:0;} 15%{opacity:.8;} 100%{transform:translateY(110px);opacity:0;} }

        .psv-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .psv-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .psv-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }

        .psv-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .psv-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .psv-icobtn:hover { background:rgba(255,255,255,0.12); }

        .psv-chip { cursor:grab; display:inline-flex; align-items:center; gap:8px; padding:10px 15px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:800; transition:all .14s; user-select:none; }
        .psv-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .psv-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .psv-chip:active { cursor:grabbing; }

        .psv-col { border-radius:14px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:12px 11px; min-height:150px; transition:all .16s; }
        .psv-col[data-hot="true"] { border-color:${accent}; background:rgba(${color.rgba},0.08); }
        .psv-col[data-shake="true"] { animation:psvShake .42s; border-color:${NO}; }
        .psv-col[data-full="true"] { border-style:solid; border-color:${OK}55; background:${OK}0c; }

        .psv-forma { display:flex; align-items:center; justify-content:space-between; gap:7px; padding:7px 10px; border-radius:9px;
          background:rgba(255,255,255,0.05); font-size:13px; font-weight:800; color:#fff; animation:psvPop .2s ease-out; }
        .psv-forma small { color:${T.text3}; font-weight:600; font-size:11px; }

        .psv-zona { cursor:pointer; border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          padding:12px 14px; display:flex; flex-direction:column; gap:5px; transition:all .16s; min-height:66px; justify-content:center; }
        .psv-zona:hover { border-color:${accent}; }
        .psv-zona[data-shake="true"] { animation:psvShake .42s; border-color:${NO}; }
        .psv-zona[data-done="true"] { cursor:default; border-style:solid; border-color:${OK}66; background:${OK}10; }

        .psv-slot { cursor:pointer; border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          padding:11px 14px; transition:all .16s; min-height:54px; display:flex; align-items:center; gap:10px; }
        .psv-slot:hover { border-color:${accent}; }
        .psv-slot[data-shake="true"] { animation:psvShake .42s; border-color:${NO}; }
        .psv-slot[data-done="true"] { cursor:default; border-style:solid; border-color:${OK}55; background:${OK}0e; }

        .psv-carta { cursor:pointer; text-align:left; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text}; font-size:13.5px; font-weight:600; padding:11px 14px; transition:all .14s; font-family:inherit; line-height:1.45; }
        .psv-carta:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
        .psv-carta[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -6px ${accent}; }

        .psv-frase { cursor:pointer; width:100%; text-align:left; border-radius:11px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text}; font-size:13.5px; font-weight:600; padding:11px 14px; transition:all .14s; font-family:inherit; line-height:1.45; }
        .psv-frase:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.12); }
        .psv-frase:disabled { cursor:default; }
        .psv-frase[data-e="bien"] { border-color:${OK}; background:${OK}18; }
        .psv-frase[data-e="mal"] { border-color:${NO}66; background:${NO}10; }

        .psv-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:9px 15px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13px; font-weight:800; transition:all .14s; font-family:inherit; }
        .psv-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .psv-btn:disabled { opacity:.42; cursor:default; }
        .psv-btn[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .psv-btn[data-done="true"] { border-color:${OK}77; background:${OK}18; color:#fff; }

        .psv-pill { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:8px 13px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; font-family:inherit; }
        .psv-pill:hover { border-color:${T.lineStrong}; color:#fff; }
        .psv-pill[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .psv-pill[data-done="true"] { color:${OK}; border-color:${OK}66; }

        .psv-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff;
          font-size:14.5px; font-weight:700; padding:6px 11px; font-family:inherit; transition:all .15s; outline:none; width:170px; }
        .psv-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .psv-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .psv-in[data-e="mal"] { border-color:${NO}; background:${NO}14; animation:psvShake .35s; }

        .psv-banda { transform-origin:left center; animation:psvBanda .55s cubic-bezier(.4,0,.2,1); }
        .psv-rayo { animation:psvRayo 1.4s ease-in-out infinite; }
        .psv-gota { animation:psvLluvia 1.2s linear infinite; }
        .psv-divider { height:1px; background:${T.line}; margin:15px 0; }

        @media (prefers-reduced-motion: reduce){
          .psv-col[data-shake="true"], .psv-zona[data-shake="true"], .psv-slot[data-shake="true"], .psv-in[data-e="mal"] { animation:none; }
          .psv-chip, .psv-chip:hover, .psv-chip[data-sel="true"] { transform:none; }
          .psv-banda, .psv-rayo, .psv-gota, .psv-forma { animation:none; }
        }

        /* Cajón de teoría */
        .psv-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .psv-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .psv-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .psv-drawer[data-open="true"] { transform:translateX(0); }
        .psv-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .psv-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .psv-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .psv-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .psv-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .psv-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .psv-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (max-width: 980px){ .psv-grid { grid-template-columns:minmax(0,1fr) !important; } }
      `}</style>

      {/* ── barra de modos y herramientas ───────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="psv-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="psv-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="psv-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="psv-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── cajón de teoría ─────────────────────────────────────────── */}
      <button className="psv-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="psv-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="psv-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="psv-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="psv-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="psv-drawer-body">
          <FichaTeorica data={PASADO_VIAJE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="psv-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ══ columna principal ══════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* ─────────────── MODO 1 · Spelling the past ─────────────── */}
          {modo === "ortografia" && (
            <div style={{ ...card, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <Eyebrow>El pasado no se dice: se escribe. ¿Qué regla le toca a cada verbo?</Eyebrow>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: ortografiaDone ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
                  {colocadosTotal}/{TOTAL_VERBOS}
                </span>
              </div>

              <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 14 }}>
                Toca un verbo y después su columna (o arrástralo). Cuatro columnas son reglas de escritura del <strong style={{ color: T.text2 }}>-ed</strong>; la
                quinta es la <strong style={{ color: T.text2 }}>lista irregular</strong>, la que no tiene regla y hay que aprenderse.
              </div>

              {/* las cinco columnas */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(152px,1fr))", gap: 11 }}>
                {ORDEN_REGLAS.map((r) => {
                  const info = REGLA_INFO[r];
                  const dentro = VERBOS.filter((v) => colocado[v.id] === r);
                  const cupo = VERBOS.filter((v) => v.regla === r).length;
                  return (
                    <div
                      key={r}
                      className="psv-col"
                      data-hot={selVerbo !== null}
                      data-shake={shakeCol === r}
                      data-full={dentro.length >= cupo}
                      onClick={() => {
                        if (selVerbo) ponerVerbo(selVerbo, r);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/plain");
                        if (id) ponerVerbo(id, r);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                        <i className={`fa-solid ${info.icono}`} style={{ color: info.color, fontSize: 13 }} />
                        <span style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.text3, marginBottom: 10, fontStyle: "italic" }}>{info.ejemplo}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {dentro.map((v) => (
                          <div key={v.id} className="psv-forma">
                            <span>
                              {v.base} <i className="fa-solid fa-arrow-right" style={{ fontSize: 9, color: T.text3, margin: "0 2px" }} /> {v.pasado}
                            </span>
                            <small>{v.es}</small>
                          </div>
                        ))}
                        {dentro.length === 0 && <div style={{ fontSize: 11, color: T.text3 }}>vacío</div>}
                      </div>
                      <div style={{ marginTop: 9, fontSize: 10.5, color: dentro.length >= cupo ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
                        {dentro.length}/{cupo}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* verbos sueltos */}
              <div className="psv-divider" />
              {verbosLibres.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                  {verbosLibres.map((id) => {
                    const v = VERBOS.find((x) => x.id === id);
                    if (!v) return null;
                    return (
                      <button
                        key={id}
                        className="psv-chip"
                        data-sel={selVerbo === id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onClick={() => setSelVerbo(selVerbo === id ? null : id)}
                      >
                        {v.base}
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.text3 }}>{v.es}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: OK, fontWeight: 800 }}>
                  <i className="fa-solid fa-circle-check" />
                  Los {TOTAL_VERBOS} verbos están en su columna. Cuatro reglas y una lista que se memoriza.
                </div>
              )}

              {msgOrt && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 11,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: T.text2,
                    borderRadius: 12,
                    padding: "12px 14px",
                    border: `1px solid ${msgOrt.ok ? `${OK}55` : `${NO}55`}`,
                    background: msgOrt.ok ? `${OK}0e` : `${NO}0e`,
                  }}
                >
                  <i className={`fa-solid ${msgOrt.ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: msgOrt.ok ? OK : NO, marginTop: 2 }} />
                  <span>{msgOrt.txt}</span>
                </div>
              )}
            </div>
          )}

          {/* ────────── MODO 2 · Background & interruption ─────────── */}
          {modo === "fondo" && (
            <div style={{ ...card, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <Eyebrow>¿Qué estaba pasando y qué lo cortó?</Eyebrow>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: oracionesDone ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
                  {escenasElegidas}/{ESCENAS.length}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 15 }}>
                {ESCENAS.map((e, i) => {
                  const listo = Boolean(elegida[e.id]);
                  return (
                    <button
                      key={e.id}
                      className="psv-pill"
                      data-on={escIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setEscIdx(i);
                        setSelFicha(null);
                        setMsgEsc(null);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-location-dot"}`} />
                      {e.lugar.split(",")[0]}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, marginBottom: 6 }}>
                <strong style={{ color: "#fff" }}>{esc.lugar}</strong>
              </div>
              <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 14 }}>{esc.contexto}</div>

              {/* la línea del tiempo */}
              <LineaTiempo
                accent={accent}
                sujetoFondo={esc.fondoAntes.trim()}
                sujetoInter={esc.interAntes.trim()}
                fondoPuesto={zonaEsc.fondo ? esc.fichas.find((f) => f.id === zonaEsc.fondo)?.forma ?? null : null}
                interPuesta={zonaEsc.inter ? esc.fichas.find((f) => f.id === zonaEsc.inter)?.forma ?? null : null}
              />

              {/* las dos zonas */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12, marginTop: 14 }}>
                <div
                  className="psv-zona"
                  data-shake={shakeZona === "fondo"}
                  data-done={Boolean(zonaEsc.fondo)}
                  onClick={() => {
                    if (selFicha) ponerFicha(selFicha, "fondo");
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) ponerFicha(id, "fondo");
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: accent }}>
                    <i className="fa-solid fa-grip-lines" style={{ marginRight: 7 }} />
                    Fondo · lo que ya pasaba
                  </div>
                  <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 700 }}>
                    {esc.fondoAntes}
                    <span style={{ color: zonaEsc.fondo ? OK : T.text3, borderBottom: `2px solid ${zonaEsc.fondo ? OK : T.lineStrong}`, padding: "0 6px" }}>
                      {zonaEsc.fondo ? esc.fichas.find((f) => f.id === zonaEsc.fondo)?.forma : "     "}
                    </span>
                    {esc.fondoDespues}
                  </div>
                </div>

                <div
                  className="psv-zona"
                  data-shake={shakeZona === "inter"}
                  data-done={Boolean(zonaEsc.inter)}
                  onClick={() => {
                    if (selFicha) ponerFicha(selFicha, "inter");
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) ponerFicha(id, "inter");
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FBBF24" }}>
                    <i className="fa-solid fa-bolt" style={{ marginRight: 7 }} />
                    Interrupción · lo que ocurrió
                  </div>
                  <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 700 }}>
                    {esc.interAntes}
                    <span style={{ color: zonaEsc.inter ? OK : T.text3, borderBottom: `2px solid ${zonaEsc.inter ? OK : T.lineStrong}`, padding: "0 6px" }}>
                      {zonaEsc.inter ? esc.fichas.find((f) => f.id === zonaEsc.inter)?.forma : "     "}
                    </span>
                    {esc.interDespues}
                  </div>
                </div>
              </div>

              {/* fichas */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 14 }}>
                {esc.fichas
                  .filter((f) => zonaEsc.fondo !== f.id && zonaEsc.inter !== f.id)
                  .map((f) => (
                    <button
                      key={f.id}
                      className="psv-chip"
                      data-sel={selFicha === f.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", f.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => setSelFicha(selFicha === f.id ? null : f.id)}
                    >
                      {f.forma}
                    </button>
                  ))}
                {esc.fichas.filter((f) => zonaEsc.fondo !== f.id && zonaEsc.inter !== f.id).length === 0 && (
                  <span style={{ fontSize: 12.5, color: T.text3 }}>Las dos formas están colocadas. Ahora decide cómo se arma la oración.</span>
                )}
              </div>

              {/* paso 3: la oración bien armada */}
              {zonaEsc.fondo && zonaEsc.inter && (
                <>
                  <div className="psv-divider" />
                  <Eyebrow>
                    ¿Cuál de las dos oraciones está bien armada con <span style={{ color: accent }}>{esc.opciones[0].texto.startsWith("While") ? "while" : "when"}</span>?
                  </Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {esc.opciones.map((op, i) => (
                      <button
                        key={i}
                        className="psv-frase"
                        data-e={elegida[esc.id] ? (op.correcta ? "bien" : undefined) : undefined}
                        disabled={Boolean(elegida[esc.id])}
                        onClick={() => elegirOracion(i)}
                      >
                        {op.texto}
                      </button>
                    ))}
                  </div>
                  {elegida[esc.id] && (
                    <button
                      className="psv-btn"
                      style={{ marginTop: 11 }}
                      onClick={() => hablarLab(esc.opciones.find((o) => o.correcta)?.texto ?? "")}
                      title="Escuchar la oración en inglés"
                    >
                      <i className="fa-solid fa-volume-high" />
                      Escuchar
                    </button>
                  )}
                </>
              )}

              {msgEsc && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 11,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: T.text2,
                    borderRadius: 12,
                    padding: "12px 14px",
                    border: `1px solid ${msgEsc.ok ? `${OK}55` : `${NO}55`}`,
                    background: msgEsc.ok ? `${OK}0e` : `${NO}0e`,
                  }}
                >
                  <i className={`fa-solid ${msgEsc.ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: msgEsc.ok ? OK : NO, marginTop: 2 }} />
                  <span>{msgEsc.txt}</span>
                </div>
              )}

              <div style={{ marginTop: 14, fontSize: 11.5, color: T.text3, lineHeight: 1.55, display: "flex", gap: 10 }}>
                <i className="fa-solid fa-location-dot" style={{ marginTop: 2 }} />
                <span>{esc.dato}</span>
              </div>
            </div>
          )}

          {/* ─────────────── MODO 3 · Build the trip ─────────────────── */}
          {modo === "relato" && (
            <div style={{ ...card, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <Eyebrow>{RELATO_TITULO}</Eyebrow>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="psv-pill" data-on={fase === "orden"} data-done={ordenDone} onClick={() => setFase("orden")}>
                    <i className="fa-solid fa-list-ol" /> 1 · Ordena
                  </button>
                  <button className="psv-pill" data-on={fase === "intrusos"} data-done={intrusosDone} onClick={() => setFase("intrusos")}>
                    <i className="fa-solid fa-magnifying-glass" /> 2 · Caza al intruso
                  </button>
                </div>
              </div>

              {fase === "orden" && (
                <>
                  <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 14 }}>
                    Cada ranura ya trae su <strong style={{ color: T.text2 }}>conector de tiempo</strong>. Toca una oración de abajo y después la ranura a la que
                    pertenece: el conector te dice en qué momento del viaje ocurrió.{" "}
                    <span style={{ color: T.text3 }}>
                      {colocadasRelato}/{RELATO.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {RELATO.map((m, i) => {
                      const puesta = slots[i];
                      return (
                        <div
                          key={m.id}
                          className="psv-slot"
                          data-shake={shakeSlot === i}
                          data-done={Boolean(puesta)}
                          onClick={() => {
                            if (selCarta) ponerCarta(selCarta, i);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const id = e.dataTransfer.getData("text/plain");
                            if (id) ponerCarta(id, i);
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              width: 22,
                              height: 22,
                              borderRadius: 7,
                              background: puesta ? `${OK}22` : T.glassSoft,
                              color: puesta ? OK : T.text3,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 900,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ fontSize: 14, color: accent, fontWeight: 800, flexShrink: 0 }}>{m.conector}</span>
                          <span style={{ fontSize: 14, color: puesta ? "#fff" : T.text3, fontWeight: puesta ? 600 : 500 }}>
                            {puesta ? m.texto : "— coloca aquí la oración —"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="psv-divider" />

                  {cartasLibres.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 9 }}>
                      {cartasLibres.map((id) => {
                        const m = RELATO.find((x) => x.id === id);
                        if (!m) return null;
                        return (
                          <button
                            key={id}
                            className="psv-carta"
                            data-sel={selCarta === id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", id);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onClick={() => setSelCarta(selCarta === id ? null : id)}
                          >
                            {m.texto}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13.5, color: OK, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 9 }}>
                        <i className="fa-solid fa-circle-check" /> El relato está completo y en orden.
                      </span>
                      <button className="psv-btn" onClick={() => hablarLab(RELATO.map((m) => `${m.conector} ${m.texto}`).join(" "))} title="Escuchar el relato">
                        <i className="fa-solid fa-volume-high" />
                        Escuchar el relato
                      </button>
                      <button className="psv-btn" data-on onClick={() => setFase("intrusos")}>
                        <i className="fa-solid fa-magnifying-glass" />
                        Ir a «Caza al intruso»
                      </button>
                    </div>
                  )}

                  {msgRelato && (
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        gap: 11,
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: T.text2,
                        borderRadius: 12,
                        padding: "12px 14px",
                        border: `1px solid ${msgRelato.ok ? `${OK}55` : `${NO}55`}`,
                        background: msgRelato.ok ? `${OK}0e` : `${NO}0e`,
                      }}
                    >
                      <i className={`fa-solid ${msgRelato.ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: msgRelato.ok ? OK : NO, marginTop: 2 }} />
                      <span>{msgRelato.txt}</span>
                    </div>
                  )}
                </>
              )}

              {fase === "intrusos" && (
                <>
                  <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 14 }}>
                    Las cuatro oraciones de cada ronda cuentan el mismo viaje, pero{" "}
                    <strong style={{ color: T.text2 }}>una rompe el tiempo verbal del resto</strong>: está en presente o en futuro. Encuéntrala.{" "}
                    <span style={{ color: T.text3 }}>
                      {Object.keys(cazados).length}/{INTRUSOS.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {INTRUSOS.map((ronda, n) => {
                      const resuelta = Boolean(cazados[ronda.id]);
                      const msg = msgIntruso[ronda.id];
                      return (
                        <div key={ronda.id} style={{ borderRadius: 14, border: `1px solid ${resuelta ? `${OK}55` : T.line}`, background: resuelta ? `${OK}0a` : T.glass, padding: "14px 16px" }}>
                          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: resuelta ? OK : T.text3, marginBottom: 10 }}>
                            Ronda {n + 1}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {ronda.frases.map((f, i) => {
                              const esIntruso = ronda.intruso === i;
                              const estado = resuelta && esIntruso ? "bien" : fallado[ronda.id] === i ? "mal" : undefined;
                              return (
                                <button key={i} className="psv-frase" data-e={estado} disabled={resuelta} onClick={() => cazar(ronda.id, i)}>
                                  {resuelta && esIntruso ? (
                                    <>
                                      <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginRight: 8 }} />
                                      <s style={{ opacity: 0.75 }}>{f}</s>
                                      <br />
                                      <i className="fa-solid fa-arrow-right" style={{ color: OK, margin: "6px 8px 0 0" }} />
                                      <span style={{ color: OK, fontWeight: 800 }}>{ronda.correccion}</span>
                                    </>
                                  ) : (
                                    f
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {msg && (
                            <div style={{ marginTop: 11, display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.55, color: msg.ok ? T.text2 : T.text2 }}>
                              <i className={`fa-solid ${msg.ok ? "fa-circle-check" : "fa-circle-info"}`} style={{ color: msg.ok ? OK : NO, marginTop: 2 }} />
                              <span>{msg.txt}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─────────────── MODO 4 · Write the verb ─────────────────── */}
          {modo === "escribir" && (
            <div style={{ ...card, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <Eyebrow>Aquí no se arrastra: se escribe</Eyebrow>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: escribirDone ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
                  {escritasBien}/{ESCRITURA.length}
                </span>
              </div>

              <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 16 }}>
                Escribe la forma del verbo que pide cada oración y pulsa <strong style={{ color: T.text2 }}>Enter</strong>. Primero decide si es un hecho terminado
                (<strong style={{ color: T.text2 }}>past simple</strong>) o algo que ya estaba pasando (<strong style={{ color: T.text2 }}>past continuous</strong>); después,
                escríbelo bien. No se distinguen mayúsculas ni acentos.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {ESCRITURA.map((item, i) => {
                  const est = estados[item.id] ?? "vacio";
                  const listo = est === "bien";
                  return (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: 13,
                        border: `1.5px solid ${listo ? `${OK}55` : est === "mal" ? `${NO}55` : T.line}`,
                        background: listo ? `${OK}0c` : T.glass,
                        padding: "13px 15px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap", fontSize: 15, lineHeight: 2, color: T.text2 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: T.text3, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                        <span>{item.antes}</span>
                        <input
                          className="psv-in"
                          data-e={est}
                          value={vals[item.id] ?? ""}
                          disabled={listo}
                          aria-label={`Oración ${i + 1}: forma de «${item.base}»`}
                          placeholder={item.base}
                          onChange={(e) => {
                            const valor = e.target.value;
                            setVals((prev) => ({ ...prev, [item.id]: valor }));
                            if (estados[item.id] === "mal") setEstados((prev) => ({ ...prev, [item.id]: "vacio" }));
                          }}
                          onBlur={() => comprobarEscritura(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              comprobarEscritura(item.id);
                            }
                          }}
                        />
                        <span>{item.despues}</span>
                        <span style={{ fontSize: 12, color: T.text3, fontStyle: "italic" }}>({item.base})</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 8, flexWrap: "wrap" }}>
                        {!listo && (
                          <button className="psv-btn" onClick={() => setPistas((prev) => ({ ...prev, [item.id]: !prev[item.id] }))} style={{ padding: "6px 11px", fontSize: 12 }}>
                            <i className="fa-solid fa-lightbulb" />
                            {pistas[item.id] ? "Ocultar pista" : "Pista"}
                          </button>
                        )}
                        {listo && (
                          <button className="psv-btn" style={{ padding: "6px 11px", fontSize: 12 }} onClick={() => hablarLab(`${item.antes}${item.respuesta}${item.despues}`)}>
                            <i className="fa-solid fa-volume-high" />
                            Escuchar
                          </button>
                        )}
                        {pistas[item.id] && !listo && <span style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>{item.pista}</span>}
                      </div>

                      {notas[item.id] && (
                        <div style={{ marginTop: 9, display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.55, color: T.text2 }}>
                          <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-circle-info"}`} style={{ color: listo ? OK : NO, marginTop: 2 }} />
                          <span>{notas[item.id]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─────────── MODO 5 · Completa el texto (verbatim) ───────── */}
          {modo === "texto" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <Eyebrow>
                  <i className="fa-solid fa-1" style={{ marginRight: 8, color: accent }} />
                  Past simple · {PASADO_VIAJE_HUECOS_A2.ancla}
                </Eyebrow>
                <CompletaTexto
                  key={`a2-${textoIntento}`}
                  data={PASADO_VIAJE_HUECOS_A2}
                  accent={accent}
                  rgba={color.rgba}
                  completado={texto2Done}
                  onCompletado={() => {
                    setTexto2Done(true);
                    sfxOk();
                  }}
                  onAcierto={sfxPlace}
                  onError={sfxNo}
                />
              </div>
              <div>
                <Eyebrow>
                  <i className="fa-solid fa-2" style={{ marginRight: 8, color: accent }} />
                  Past continuous · {PASADO_VIAJE_HUECOS_A6.ancla}
                </Eyebrow>
                <CompletaTexto
                  key={`a6-${textoIntento}`}
                  data={PASADO_VIAJE_HUECOS_A6}
                  accent={accent}
                  rgba={color.rgba}
                  completado={texto6Done}
                  onCompletado={() => {
                    setTexto6Done(true);
                    sfxOk();
                  }}
                  onAcierto={sfxPlace}
                  onError={sfxNo}
                />
              </div>
            </div>
          )}
        </div>

        {/* ══ columna lateral ════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

          {/* pista del modo actual */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid rgba(${color.rgba},0.3)`,
              background: `rgba(${color.rgba},0.08)`,
              fontSize: 13,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "ortografia" && (
                <>
                  Pregúntate en este orden: ¿acaba en <strong style={{ color: T.text }}>-e</strong>? ¿acaba en <strong style={{ color: T.text }}>consonante + y</strong>? ¿es{" "}
                  <strong style={{ color: T.text }}>una sílaba con vocal + consonante</strong>? Si no es ninguna, es -ed a secas… o irregular.
                </>
              )}
              {modo === "fondo" && (
                <>
                  El fondo <strong style={{ color: T.text }}>duraba</strong>: was / were + -ing. Lo que lo corta <strong style={{ color: T.text }}>ocurrió y se acabó</strong>:
                  past simple. Tras <strong style={{ color: T.text }}>while</strong> suele ir el continuous; tras <strong style={{ color: T.text }}>when</strong>, el simple.
                </>
              )}
              {modo === "relato" && (
                <>
                  Los conectores no adornan: <strong style={{ color: T.text }}>ordenan</strong>. First abre, Then y After that encadenan, Later deja pasar tiempo y Finally
                  cierra. Y todo el relato tiene que estar en el mismo tiempo verbal.
                </>
              )}
              {modo === "escribir" && (
                <>
                  Dos decisiones por oración: primero <strong style={{ color: T.text }}>qué tiempo</strong> (simple o continuous) y después{" "}
                  <strong style={{ color: T.text }}>cómo se escribe</strong>. Se acepta la contracción (didn&apos;t) y no se castigan mayúsculas ni acentos.
                </>
              )}
              {modo === "texto" && <>Son los dos textos con huecos de la progresión, tal como están publicados. El botón de pista y el banco de palabras están ahí si te atoras.</>}
            </span>
          </div>

          {/* conectores y expresiones de tiempo */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-arrow-right-long" style={{ marginRight: 8, color: accent }} />
              Conectores de secuencia
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CONECTORES_INFO.map((c) => (
                <div key={c.conector} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 900, color: "#fff" }}>{c.conector}</span>{" "}
                  <span style={{ color: T.text3 }}>— {c.es}.</span> <span style={{ color: T.text3 }}>{c.uso}</span>
                </div>
              ))}
            </div>
            <div className="psv-divider" />
            <Eyebrow>
              <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8, color: accent }} />
              Expresiones de tiempo
            </Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {EXPRESIONES_TIEMPO.map((e) => (
                <span
                  key={e.en}
                  title={e.es}
                  style={{ fontSize: 12, fontWeight: 700, color: T.text2, border: `1px solid ${T.line}`, borderRadius: 999, padding: "5px 11px", background: T.glass }}
                >
                  {e.en}
                </span>
              ))}
            </div>
          </div>

          {/* glosario verbatim A5 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
              Glosario de la progresión
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {GLOSARIO_A5.map((g) => (
                <div key={g.termino} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 800, color: "#fff" }}>{g.termino}</div>
                  <div style={{ color: T.text3 }}>{g.definicion}</div>
                  <div style={{ color: T.text3, fontStyle: "italic" }}>{g.ejemplo}</div>
                </div>
              ))}
            </div>
            <div className="psv-divider" />
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.55 }}>{CIERRE_A5}</div>
          </div>

          {/* dato */}
          <div
            style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}
          >
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_BILINGUE}</span>
          </div>
        </div>
      </div>

      {/* ══ paneles verbatim ═════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
            Lectura A1 · {LECTURA_A1_TITULO}
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LECTURA_A1.map((p, i) => (
              <p key={i} style={{ margin: 0, fontSize: 12.5, lineHeight: 1.65, color: T.text2 }}>
                {p}
              </p>
            ))}
          </div>
          <div className="psv-divider" />
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>{NOTA_GRAMATICAL_A1}</div>
          <button className="psv-btn" style={{ marginTop: 12 }} onClick={() => hablarLab(LECTURA_A1[0] ?? "")}>
            <i className="fa-solid fa-volume-high" />
            Escuchar el primer párrafo
          </button>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
            Preguntas de comprensión
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PREGUNTAS_A1.map((q, i) => (
              <div key={i} style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                <div style={{ color: "#fff", fontWeight: 700 }}>{q.pregunta}</div>
                <div style={{ color: T.text3, marginTop: 3 }}>{q.respuesta}</div>
              </div>
            ))}
          </div>
          <div className="psv-divider" />
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
            <strong style={{ color: T.text2 }}>¿Sabías?</strong> {DATO_A1}
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
            Tu turno
          </Eyebrow>
          <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.55, marginBottom: 12, whiteSpace: "pre-line" }}>{TU_TURNO_A3.prompt}</div>
          <ul style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 5 }}>
            {TU_TURNO_A3.pistas.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.55 }}>
            Mínimo {TU_TURNO_A3.minimo} palabras. Se evalúa: {TU_TURNO_A3.criterios.join(" · ")}.
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-clipboard-check" style={{ marginRight: 8, color: accent }} />
            Autoevaluación
          </Eyebrow>
          <ul style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
            {AUTOEVAL_A7.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.55 }}>{AUTOEVAL_A7_CIERRE}</div>
          <div className="psv-divider" />
          <Eyebrow>
            <i className="fa-solid fa-film" style={{ marginRight: 8, color: accent }} />
            Del video de la progresión
          </Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 9 }}>{VIDEO_A8.titulo}</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 6 }}>
            {VIDEO_A8.preguntas.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ══ reto evaluable (A4 verbatim) ═════════════════════════════ */}
      <RetoQuizCard
        quiz={QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Ya distingues el fondo de la interrupción y sabes con qué anclar una narración pasada."
      />

      {/* ══ nota al pie ══════════════════════════════════════════════ */}
      <div style={{ marginTop: 18, display: "flex", gap: 12, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Son <strong>verbatim</strong> de la progresión IN-IV-P01: la lectura, su nota gramatical, sus preguntas de comprensión y su dato «¿Sabías?» (A1); los dos
          textos con huecos con sus pistas y alternativas (A2 y A6); el encargo de escritura y sus criterios (A3); el reto evaluable True/False (A4); el glosario y
          su actividad de cierre (A5); los criterios de autoevaluación (A7); y el título y las preguntas del video (A8). Lo que escribí para esta práctica y hay
          que leer como <strong>ilustrativo</strong>: los dieciséis verbos del taller de ortografía, las cinco escenas de fondo e interrupción, el itinerario de la
          excursión a Teotihuacán, las tres rondas de «caza al intruso» y las ocho oraciones que se teclean. Las reglas de escritura del -ed y las formas verbales
          son las de cualquier gramática descriptiva del inglés estadounidense estándar. Los <strong>lugares son reales</strong> y los datos que los acompañan,
          verificables —Teotihuacán, Monte Albán, el Centro Histórico de Oaxaca y Xochimilco están inscritos en la Lista del Patrimonio Mundial de la UNESCO desde
          1987; el Día de Muertos, en la Lista del Patrimonio Cultural Inmaterial desde 2008—, pero las <strong>personas son ficticias</strong>: Sofía, Emiliano,
          Abril y Tadeo no existen. Nota: la actividad A2 narra que el grupo sube a la Pirámide del Sol; desde la reapertura de 2020 el INAH no permite el ascenso
          a las pirámides de Teotihuacán, así que el relato del modo «Build the trip» recorre la Calzada de los Muertos en vez de subir. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * La línea del tiempo del modo «Background & interruption».
 *
 * Vive fuera del shell a propósito: aquí no toca ningún ref ni ningún estado,
 * solo dibuja lo que se le pasa, y así el cierre que construye el SVG no cae
 * en las reglas del compilador de React sobre refs en render.
 *
 * La banda larga es el FONDO (lo que ya venía pasando) y el rayo, la
 * INTERRUPCIÓN. Se dibujan apagados hasta que el alumno coloca el verbo que
 * les corresponde: la escena no explica la gramática, la representa.
 * ═══════════════════════════════════════════════════════════════════════════ */
function LineaTiempo({
  accent,
  sujetoFondo,
  sujetoInter,
  fondoPuesto,
  interPuesta,
}: {
  accent: string;
  /** El sujeto de la acción de fondo, para rotular la banda («We», «Sofía»…). */
  sujetoFondo: string;
  /** El sujeto de lo que interrumpe («it», «her phone»…). */
  sujetoInter: string;
  fondoPuesto: string | null;
  interPuesta: string | null;
}) {
  const W = 640;
  const H = 168;
  const yBase = 118;
  const xIni = 40;
  const xFin = 600;
  const xCorte = 430;

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${T.line}`, background: "linear-gradient(180deg,rgba(8,22,44,0.85) 0%,rgba(3,11,25,0.9) 100%)", padding: "8px 6px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Línea del tiempo: la banda es la acción de fondo y el rayo la interrupción">
        <defs>
          <linearGradient id="psvBandaGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* eje */}
        <line x1={xIni - 18} y1={yBase + 26} x2={xFin + 12} y2={yBase + 26} stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
        <polygon points={`${xFin + 12},${yBase + 26} ${xFin + 3},${yBase + 21} ${xFin + 3},${yBase + 31}`} fill="rgba(255,255,255,0.3)" />
        <text x={xIni - 18} y={yBase + 45} fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="system-ui, sans-serif">
          antes
        </text>
        <text x={xFin - 18} y={yBase + 45} fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="system-ui, sans-serif">
          ahora
        </text>

        {/* banda del fondo */}
        <rect x={xIni} y={yBase - 14} width={xFin - xIni} height={26} rx={13} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeDasharray="5 5" />
        {fondoPuesto && (
          <g className="psv-banda">
            <rect x={xIni} y={yBase - 14} width={xFin - xIni} height={26} rx={13} fill="url(#psvBandaGrad)" stroke={accent} strokeOpacity="0.55" />
          </g>
        )}
        <text x={xIni + 12} y={yBase + 4} fill={fondoPuesto ? "#fff" : "rgba(255,255,255,0.35)"} fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
          {fondoPuesto ? `${sujetoFondo} ${fondoPuesto}…` : "acción de fondo (past continuous)"}
        </text>

        {/* rayo de la interrupción */}
        <line x1={xCorte} y1={yBase - 40} x2={xCorte} y2={yBase + 26} stroke={interPuesta ? "#FBBF24" : "rgba(255,255,255,0.14)"} strokeWidth="2" strokeDasharray={interPuesta ? "0" : "4 4"} />
        <g className={interPuesta ? "psv-rayo" : undefined} transform={`translate(${xCorte - 11}, ${yBase - 74})`}>
          <path
            d="M14 0 L2 20 L11 20 L6 36 L20 14 L11 14 Z"
            fill={interPuesta ? "#FBBF24" : "rgba(255,255,255,0.13)"}
            stroke={interPuesta ? "#FDE68A" : "rgba(255,255,255,0.18)"}
            strokeWidth="1"
          />
        </g>
        <text
          x={xCorte + 20}
          y={yBase - 48}
          fill={interPuesta ? "#FDE68A" : "rgba(255,255,255,0.35)"}
          fontSize="13"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          {interPuesta ? `…${sujetoInter} ${interPuesta}` : "interrupción (past simple)"}
        </text>

        {/* marcas de duración */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={xIni + 40 + i * 62}
            y1={yBase + 18}
            x2={xIni + 40 + i * 62}
            y2={yBase + 26}
            stroke={fondoPuesto ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.1)"}
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}
