"use client";

/**
 * Laboratorio — Free time activities: what do people do?
 * Práctica experimental de IN-II-P02 (Inglés II), anclada en IN-II-P02-A2
 * («Third Person Present Simple: Gaps»).
 *
 * El tema de la progresión es el presente simple y, dentro de él, lo único que
 * de verdad cuesta: la -s de la tercera persona. El riesgo evidente era pintar
 * una tabla de conjugación y pedir que se lea. Aquí la tabla se MANIPULA, en
 * cinco actos que atacan una dificultad distinta cada uno:
 *
 *  1. «Spin the subject» — una misma oración con el sujeto girando (I / you /
 *     he / she / it / we / they). La -s aparece y desaparece según quién hable,
 *     y el alumno tiene que hacer que el verbo siga al sujeto.
 *  2. «The three -s rules» — clasificar doce verbos según la regla que les toca
 *     (add -s, add -es, y → ies) en vez de memorizar una lista. Con la trampa
 *     buena: «play» acaba en y y aun así sólo lleva -s, porque antes hay vocal.
 *  3. «Negative & question machine» — armar la negativa y la pregunta eligiendo
 *     DOS piezas: el auxiliar (do/does/don't/doesn't) y la forma del verbo. Ahí
 *     vive el error central del tema, «She doesn't plays», que al resolver cada
 *     tarjeta se ve tachado.
 *  4. «Where does the adverb go?» — colocar el adverbio de frecuencia en el
 *     hueco correcto de la oración: antes del verbo principal, pero DESPUÉS de
 *     «to be».
 *  5. «Completa el texto» — el párrafo verbatim de IN-II-P02-A2, escribiendo.
 *
 * DOM puro (sin three.js): es una práctica de lengua, no de geometría; así
 * carga al instante y funciona con ratón, teclado y pantalla táctil.
 *
 * Idioma: la interfaz y toda la retroalimentación van en español de México; el
 * inglés es el objeto de estudio y está revisado frase por frase.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { hablarLab, callarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { TIEMPO_LIBRE_INGLES_HUECOS } from "./tiempo-libre-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { TIEMPO_LIBRE_INGLES_FICHA } from "./tiempo-libre-ingles-ficha";
import {
  RONDAS_SUJETO,
  VERBOS,
  REGLA_INFO,
  AUXILIARES,
  TRANSFORMACIONES,
  ADVERBIOS,
  FRASES_ADVERBIO,
  QUIZ,
  QUIZ_TITULO,
  QUIZ_MINIMO,
  DATO_TIEMPO_LIBRE,
  VOCABULARIO_OCIO,
  type TipoRegla,
  type Auxiliar,
  type Transformacion,
} from "./tiempo-libre-ingles-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-tiempo-libre-ingles-reto";

type Modo = "sujeto" | "reglas" | "auxiliar" | "frecuencia" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "sujeto", label: "Spin the subject", icono: "fa-arrows-rotate" },
  { id: "reglas", label: "The three -s rules", icono: "fa-table-columns" },
  { id: "auxiliar", label: "Negative & question", icono: "fa-gears" },
  { id: "frecuencia", label: "Where does it go?", icono: "fa-ruler-horizontal" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

interface Nota {
  ok: boolean;
  texto: string;
}

/** Por qué ese auxiliar no encaja, en español y sin rodeos. */
function porqueAuxMal(t: Transformacion, elegido: Auxiliar): string {
  const pregunta = t.meta === "pregunta";
  const esDeNegar = elegido === "don't" || elegido === "doesn't";
  if (pregunta && esDeNegar) {
    return `Aquí hay que PREGUNTAR, y las preguntas empiezan por Do o Does. «${elegido}» sirve para negar.`;
  }
  if (!pregunta && !esDeNegar) {
    return `Aquí hay que NEGAR, y para negar se usa don't o doesn't. «${elegido}» abre una pregunta.`;
  }
  const tercera = t.aux === "Does" || t.aux === "doesn't";
  return tercera
    ? `«${t.sujeto}» es tercera persona del singular (equivale a he, she o it): le toca ${t.aux}, no ${elegido}.`
    : `«${t.sujeto}» no es tercera persona del singular: le toca ${t.aux}, no ${elegido}.`;
}

export function LabTiempoLibreIngles({ color }: PracticaLabProps) {
  const accent = color.hex;
  const [modo, setModo] = useState<Modo>("sujeto");

  // ── partida, sonido y voz ─────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  useEffect(
    () => () => {
      audioRef.current?.dispose();
      callarLab();
    },
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

  // Todos los aciertos y todos los fallos del laboratorio pasan por aquí, así
  // que la contabilidad de la partida se lleva en un solo sitio. `sfxFin` no
  // cuenta: marca el fin de un modo, no una respuesta suelta.
  const sfxFin = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxOk = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── MODO 1 · Spin the subject ─────────────────────────────────────────
  const [idxSujeto, setIdxSujeto] = useState(0);
  const [resueltoSujeto, setResueltoSujeto] = useState<Record<string, boolean>>({});
  const [shakeSujeto, setShakeSujeto] = useState(false);
  const [notaSujeto, setNotaSujeto] = useState<Nota | null>(null);
  const ronda = RONDAS_SUJETO[idxSujeto]!;
  const sujetoDone = Object.keys(resueltoSujeto).length >= RONDAS_SUJETO.length;

  const girar = (paso: number) => {
    setIdxSujeto((i) => (i + paso + RONDAS_SUJETO.length) % RONDAS_SUJETO.length);
    setNotaSujeto(null);
    setShakeSujeto(false);
  };

  const elegirForma = (i: number) => {
    if (resueltoSujeto[ronda.id]) return;
    if (i === ronda.correcta) {
      const siguiente = { ...resueltoSujeto, [ronda.id]: true };
      setResueltoSujeto(siguiente);
      setNotaSujeto({ ok: true, texto: ronda.porque });
      sfxOk();
      if (Object.keys(siguiente).length >= RONDAS_SUJETO.length) sfxFin();
    } else {
      const mal = ronda.opciones[i] ?? "";
      setNotaSujeto({
        ok: false,
        texto: `«${ronda.sujeto} ${mal}…» no funciona. ${ronda.porque}`,
      });
      setShakeSujeto(true);
      sfxNo();
      window.setTimeout(() => setShakeSujeto(false), 420);
    }
  };

  const resetSujeto = () => {
    setResueltoSujeto({});
    setIdxSujeto(0);
    setNotaSujeto(null);
  };

  // ── MODO 2 · The three -s rules ───────────────────────────────────────
  const [ubicado, setUbicado] = useState<Record<string, TipoRegla>>({});
  const [selVerbo, setSelVerbo] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<TipoRegla | null>(null);
  const [notaRegla, setNotaRegla] = useState<Nota | null>(null);
  const reglasDone = Object.keys(ubicado).length >= VERBOS.length;
  const verbosLibres = VERBOS.filter((v) => !ubicado[v.id]);

  const intentarRegla = (verboId: string, bin: TipoRegla) => {
    if (ubicado[verboId]) return;
    const v = VERBOS.find((x) => x.id === verboId);
    if (!v) return;
    if (v.tipo === bin) {
      const siguiente = { ...ubicado, [verboId]: bin };
      setUbicado(siguiente);
      setSelVerbo(null);
      setNotaRegla({ ok: true, texto: `${v.base} → ${v.tercera}. ${v.nota}` });
      sfxOk();
      if (Object.keys(siguiente).length >= VERBOS.length) sfxFin();
    } else {
      setNotaRegla({
        ok: false,
        texto: `«${v.base}» no va en «${REGLA_INFO[bin].titulo}». ${v.nota}`,
      });
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };

  const resetReglas = () => {
    setUbicado({});
    setSelVerbo(null);
    setNotaRegla(null);
  };

  // ── MODO 3 · Negative & question machine ──────────────────────────────
  const [auxOk, setAuxOk] = useState<Record<string, boolean>>({});
  const [verbOk, setVerbOk] = useState<Record<string, boolean>>({});
  const [shakeAux, setShakeAux] = useState<string | null>(null);
  const [notaAux, setNotaAux] = useState<Nota | null>(null);
  const auxiliarDone = TRANSFORMACIONES.every((t) => auxOk[t.id] && verbOk[t.id]);
  const trampaVista = TRANSFORMACIONES.some((t) => auxOk[t.id] && verbOk[t.id]);

  const marcarPieza = (t: Transformacion, pieza: "aux" | "verbo", bien: boolean, nota: Nota) => {
    setNotaAux(nota);
    if (!bien) {
      setShakeAux(t.id);
      sfxNo();
      window.setTimeout(() => setShakeAux(null), 420);
      return;
    }
    sfxOk();
    const auxNuevo = pieza === "aux" ? { ...auxOk, [t.id]: true } : auxOk;
    const verbNuevo = pieza === "verbo" ? { ...verbOk, [t.id]: true } : verbOk;
    if (pieza === "aux") setAuxOk(auxNuevo);
    else setVerbOk(verbNuevo);
    if (TRANSFORMACIONES.every((x) => auxNuevo[x.id] && verbNuevo[x.id])) sfxFin();
  };

  const elegirAux = (t: Transformacion, elegido: Auxiliar) => {
    if (auxOk[t.id]) return;
    if (elegido === t.aux) {
      marcarPieza(t, "aux", true, {
        ok: true,
        texto: `Bien: ${t.aux}. Ahora decide la forma del verbo.`,
      });
    } else {
      marcarPieza(t, "aux", false, { ok: false, texto: porqueAuxMal(t, elegido) });
    }
  };

  const elegirVerbo = (t: Transformacion, i: number) => {
    if (verbOk[t.id]) return;
    if (i === t.verboCorrecto) {
      marcarPieza(t, "verbo", true, { ok: true, texto: t.porque });
    } else {
      marcarPieza(t, "verbo", false, {
        ok: false,
        texto: `«${t.verbos[i === 0 ? 0 : 1]}» lleva la marca de tercera persona, y esa marca ya la tiene el auxiliar. ${t.porque}`,
      });
    }
  };

  const resetAuxiliar = () => {
    setAuxOk({});
    setVerbOk({});
    setNotaAux(null);
  };

  // ── MODO 4 · Where does the adverb go? ────────────────────────────────
  const [resueltoFrase, setResueltoFrase] = useState<Record<string, boolean>>({});
  const [shakeFrase, setShakeFrase] = useState<string | null>(null);
  const [notaFrase, setNotaFrase] = useState<Nota | null>(null);
  const frecuenciaDone = Object.keys(resueltoFrase).length >= FRASES_ADVERBIO.length;
  const toBeHecha = resueltoFrase["f-6"] === true || resueltoFrase["f-7"] === true;

  const colocarAdverbio = (fraseId: string, hueco: number) => {
    const f = FRASES_ADVERBIO.find((x) => x.id === fraseId);
    if (!f || resueltoFrase[fraseId]) return;
    if (hueco === f.hueco) {
      const siguiente = { ...resueltoFrase, [fraseId]: true };
      setResueltoFrase(siguiente);
      setNotaFrase({ ok: true, texto: `${f.completa} — ${f.porque}` });
      sfxOk();
      if (Object.keys(siguiente).length >= FRASES_ADVERBIO.length) sfxFin();
    } else {
      setNotaFrase({
        ok: false,
        texto: f.esToBe
          ? `Ahí no. El verbo de esta oración es «to be» (${f.tokens[0]}), y con to be el adverbio va DESPUÉS del verbo. ${f.porque}`
          : `Ahí no. El adverbio de frecuencia va justo ANTES del verbo principal («${f.tokens[0]}»). ${f.porque}`,
      });
      setShakeFrase(fraseId);
      sfxNo();
      window.setTimeout(() => setShakeFrase(null), 420);
    }
  };

  const resetFrecuencia = () => {
    setResueltoFrase({});
    setNotaFrase(null);
  };

  // ── MODO 5 · Completa el texto ────────────────────────────────────────
  // El contador hace de `key`: subirlo remonta el componente y devuelve todos
  // los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // El reinicio de la barra despacha por modo y tiene que poder llegar al de
  // los huecos, o el alumno se queda con el texto resuelto y sin repetirlo.
  const resetActual =
    modo === "texto" ? resetTexto
    : modo === "sujeto" ? resetSujeto
    : modo === "reglas" ? resetReglas
    : modo === "auxiliar" ? resetAuxiliar
    : resetFrecuencia;

  const objetivos = [
    { txt: `Ajusta el verbo a los ${RONDAS_SUJETO.length} sujetos del dial`, done: sujetoDone },
    { txt: `Clasifica los ${VERBOS.length} verbos por su regla de -s`, done: reglasDone },
    { txt: "Descubre por qué «play» sólo lleva -s", done: ubicado["v-play"] === "s" },
    { txt: `Arma las ${TRANSFORMACIONES.length} negativas y preguntas`, done: auxiliarDone },
    { txt: "Caza la trampa «She doesn't plays»", done: trampaVista },
    { txt: `Coloca los ${FRASES_ADVERBIO.length} adverbios de frecuencia`, done: frecuenciaDone },
    { txt: "Coloca un adverbio después de «to be»", done: toBeHecha },
    { txt: "Completa el párrafo de IN-II-P02-A2", done: textoDone },
    { txt: "Encadena 5 aciertos seguidos", done: partida.mejorRacha >= 5 },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
  ];

  // arrastre nativo (modo 2)
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      // El hueco que deja la tarjeta mientras viaja. Por atributo y no por
      // estado: un render por cada gesto de arrastre se nota con 20 tarjetas.
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: React.DragEvent) => {
      // También cuando se suelta FUERA de cualquier zona; si no, la tarjeta se
      // queda medio borrada para siempre.
      e.currentTarget.removeAttribute("data-arrastrando");
      document.querySelectorAll('[data-sobre="true"]').forEach((z) => z.removeAttribute("data-sobre"));
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.setAttribute("data-sobre", "true");
    },
    onDragLeave: (e: React.DragEvent) => {
      // `dragleave` salta también al pasar sobre un HIJO de la zona. Apagar sin
      // comprobar deja la zona parpadeando mientras mueves la mano por dentro.
      const r = e.currentTarget.getBoundingClientRect();
      const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fuera) e.currentTarget.removeAttribute("data-sobre");
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.removeAttribute("data-sobre");
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
  });

  const notaActual =
    modo === "sujeto" ? notaSujeto : modo === "reglas" ? notaRegla : modo === "auxiliar" ? notaAux : modo === "frecuencia" ? notaFrase : null;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tliShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes tliPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .tli-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .tli-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .tli-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .tli-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .tli-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .tli-icobtn:hover { background:rgba(255,255,255,0.12); }
        .tli-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 15px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; user-select:none; }
        .tli-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .tli-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .tli-chip:active { cursor:grabbing; }
        .tli-opt { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:12px 20px; border-radius:12px;
          border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:16px; font-weight:800;
          font-family:ui-monospace,SFMono-Regular,Menlo,monospace; transition:all .14s; }
        .tli-opt:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        .tli-opt:disabled { cursor:default; opacity:.45; }
        .tli-opt[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:${OK}; opacity:1; }
        .tli-mini { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:6px 12px; border-radius:9px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12px; font-weight:800; transition:all .14s; }
        .tli-mini:hover { border-color:${accent}; color:#fff; }
        .tli-mini[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .tli-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; }
        .tli-row[data-shake="true"] { animation:tliShake .4s; border-color:${NO}; }
        .tli-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .tli-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:210px; }
        .tli-bin[data-shake="true"] { animation:tliShake .4s; border-color:${NO}; }
        .tli-gap { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:26px; height:30px; margin:0 1px;
          border-radius:7px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; color:${T.text3}; font-size:11px; transition:all .14s; vertical-align:middle; }
        .tli-gap:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .tli-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:10px 16px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13px; font-weight:800; transition:all .14s; }
        .tli-btn:hover { border-color:${accent}; }
        .tli-divider { height:1px; background:${T.line}; margin:16px 0; }

        /* Cajón de teoría */
        .tli-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .tli-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .tli-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .tli-drawer[data-open="true"] { transform:translateX(0); }
        .tli-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .tli-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .tli-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .tli-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .tli-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .tli-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .tli-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero: cada columna y cada fila con su tono */
        .tli-bin, .tli-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .tli-bin:nth-of-type(6n+1), .tli-row:nth-of-type(6n+1) { --tono:188; }
        .tli-bin:nth-of-type(6n+2), .tli-row:nth-of-type(6n+2) { --tono:262; }
        .tli-bin:nth-of-type(6n+3), .tli-row:nth-of-type(6n+3) { --tono:44; }
        .tli-bin:nth-of-type(6n+4), .tli-row:nth-of-type(6n+4) { --tono:152; }
        .tli-bin:nth-of-type(6n+5), .tli-row:nth-of-type(6n+5) { --tono:330; }
        .tli-bin:nth-of-type(6n+6), .tli-row:nth-of-type(6n+6) { --tono:18; }
        .tli-bin::before, .tli-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .tli-row[data-done="true"], .tli-bin[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }

        @media (prefers-reduced-motion: reduce){
          .tli-row[data-shake="true"], .tli-bin[data-shake="true"] { animation:none; }
          .tli-chip, .tli-chip:hover, .tli-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* ── Barra de modos ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="tli-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="tli-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="tli-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="tli-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="tli-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="tli-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="tli-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="tli-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="tli-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="tli-drawer-body">
          <FichaTeorica data={TIEMPO_LIBRE_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "sujeto" && (
            <PanelSujeto
              idx={idxSujeto}
              resuelto={resueltoSujeto}
              shake={shakeSujeto}
              accent={accent}
              rgba={color.rgba}
              onGirar={girar}
              onSaltar={(i) => {
                setIdxSujeto(i);
                setNotaSujeto(null);
              }}
              onElegir={elegirForma}
              onHablar={hablarLab}
            />
          )}

          {modo === "reglas" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Lleva cada verbo a la regla que le toca en tercera persona</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: reglasDone ? OK : T.text3 }}>
                    {Object.keys(ubicado).length}/{VERBOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Mira la ÚLTIMA letra (y la anterior). Ojo: hay verbos que terminan en <strong style={{ color: T.text2 }}>y</strong> y aun así no cambian.
                </div>
                {verbosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {VERBOS.length} verbos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {verbosLibres.map((v) => (
                      <button
                        key={v.id}
                        className="tli-chip"
                        data-sel={selVerbo === v.id}
                        onClick={() => setSelVerbo((s) => (s === v.id ? null : v.id))}
                        {...dragProps(v.id)}
                      >
                        {v.base}
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: T.text3 }}>{v.es}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsRegla selVerbo={selVerbo} shakeBin={shakeBin} ubicado={ubicado} onMatch={intentarRegla} dropProps={dropProps} />
            </>
          )}

          {modo === "auxiliar" && (
            <PanelAuxiliar
              auxOk={auxOk}
              verbOk={verbOk}
              shake={shakeAux}
              accent={accent}
              rgba={color.rgba}
              onAux={elegirAux}
              onVerbo={elegirVerbo}
              onHablar={hablarLab}
            />
          )}

          {modo === "frecuencia" && (
            <PanelFrecuencia
              resuelto={resueltoFrase}
              shake={shakeFrase}
              accent={accent}
              rgba={color.rgba}
              onColocar={colocarAdverbio}
              onHablar={hablarLab}
            />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={TIEMPO_LIBRE_INGLES_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxFin();
              }}
              onAcierto={sfxOk}
              onError={sfxNo}
            />
          )}

          {/* Pie del modo: la explicación viva */}
          {notaActual && (
            <div
              role="status"
              aria-live="polite"
              style={{
                borderRadius: 14,
                border: `1px solid ${notaActual.ok ? OK : NO}55`,
                background: `${notaActual.ok ? OK : NO}12`,
                padding: "13px 16px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                fontSize: 13.5,
                lineHeight: 1.55,
                color: T.text2,
              }}
            >
              <i
                className={`fa-solid ${notaActual.ok ? "fa-circle-check" : "fa-circle-exclamation"}`}
                style={{ color: notaActual.ok ? OK : NO, marginTop: 2, fontSize: 15 }}
              />
              <span>{notaActual.texto}</span>
            </div>
          )}
        </div>

        {/* ── Columna lateral ────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

          {/* Instrucciones del modo actual */}
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
              {modo === "sujeto" && (
                <>
                  Gira el sujeto con las flechas y elige la forma del verbo. Sólo <strong style={{ color: T.text }}>he, she, it</strong> (y cualquier
                  persona o cosa en singular) marcan el verbo.
                </>
              )}
              {modo === "reglas" && (
                <>
                  <strong style={{ color: T.text }}>-s</strong> para casi todos · <strong style={{ color: T.text }}>-es</strong> tras -sh, -ch, -x, -o,
                  -ss · <strong style={{ color: T.text }}>y → ies</strong> sólo si antes de la y hay consonante.
                </>
              )}
              {modo === "auxiliar" && (
                <>
                  Elige el auxiliar y la forma del verbo. La marca de tercera persona <strong style={{ color: T.text }}>viaja al auxiliar</strong>: tras
                  does y doesn&apos;t el verbo vuelve a su forma base.
                </>
              )}
              {modo === "frecuencia" && (
                <>
                  El adverbio va <strong style={{ color: T.text }}>antes del verbo principal</strong>… salvo con el verbo{" "}
                  <strong style={{ color: T.text }}>to be</strong> (am / is / are), donde va detrás.
                </>
              )}
              {modo === "texto" && (
                <>
                  Escribe cada forma de tercera persona. Puedes pedir la pista de cada hueco o abrir el banco de palabras si te atoras.
                </>
              )}
            </span>
          </div>

          {/* Escala de frecuencia (verbatim A1) */}
          {modo === "frecuencia" && <EscalaFrecuencia accent={accent} />}

          {/* Vocabulario de ocio, verbatim de la lectura */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ul" style={{ marginRight: 8, color: accent }} />
              Free time vocabulary · A1
            </Eyebrow>
            <p style={{ margin: 0, fontSize: 12.5, color: T.text2, lineHeight: 1.6 }}>{VOCABULARIO_OCIO}</p>
          </div>

          {/* Dato verbatim del callout de A1 */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid ${T.line}`,
              background: T.glass,
              fontSize: 12.5,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_TIEMPO_LIBRE}</span>
          </div>
        </div>
      </div>

      <RetoQuizCard
        quiz={{ titulo: QUIZ_TITULO, puntajeMinimo: QUIZ_MINIMO, reactivos: QUIZ }}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={(ok) => (ok ? sfxFin() : sonido && audioRef.current?.incorrecto())}
        mensajeAprobado="Ya distingues la -s de la tercera persona de la forma base tras do / does."
      />

      <p style={{ margin: "18px 2px 0", fontSize: 11.5, color: T.text3, lineHeight: 1.6, fontStyle: "italic" }}>
        Verbatim de la progresión IN-II-P02: la lectura A1 (reglas de la -s, escala de adverbios y sus porcentajes, vocabulario de ocio y la nota sobre
        «go + -ing»), el párrafo con huecos de A2, el cuestionario de A4 y las dos preguntas del video A9. Las demás oraciones de práctica se
        escribieron para este laboratorio en inglés estadounidense estándar; los nombres y lugares son ficticios, en el mismo contexto mexicano (el
        tianguis, el parque) que usa la lectura.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — Spin the subject
 * ═══════════════════════════════════════════════════════════════════════════ */
function PanelSujeto({
  idx,
  resuelto,
  shake,
  accent,
  rgba,
  onGirar,
  onSaltar,
  onElegir,
  onHablar,
}: {
  idx: number;
  resuelto: Record<string, boolean>;
  shake: boolean;
  accent: string;
  rgba: string;
  onGirar: (paso: number) => void;
  onSaltar: (i: number) => void;
  onElegir: (i: number) => void;
  onHablar: (frase: string) => void;
}) {
  const r = RONDAS_SUJETO[idx]!;
  const hecho = resuelto[r.id] === true;
  const forma = r.opciones[r.correcta] ?? "";
  const hechos = Object.keys(resuelto).length;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Gira el sujeto y haz que el verbo lo siga</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hechos >= RONDAS_SUJETO.length ? OK : T.text3 }}>
            {hechos}/{RONDAS_SUJETO.length}
          </span>
        </div>

        {/* Dial de sujetos */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button className="tli-btn" onClick={() => onGirar(-1)} aria-label="Sujeto anterior">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <div
            style={{
              flex: 1,
              minWidth: 180,
              textAlign: "center",
              borderRadius: 14,
              border: `1.5px solid ${r.tercera ? accent : T.lineStrong}`,
              background: r.tercera ? `rgba(${rgba},0.14)` : T.inset,
              padding: "12px 16px",
              transition: "all .18s",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{r.sujeto}</div>
            <div style={{ marginTop: 5, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", color: r.tercera ? accent : T.text3 }}>
              {r.tercera ? (
                <>
                  <i className="fa-solid fa-bolt" style={{ marginRight: 6 }} />
                  3.ª persona singular ({r.pronombre}) · el verbo SÍ se marca
                </>
              ) : (
                <>
                  <i className="fa-regular fa-circle" style={{ marginRight: 6 }} />
                  {r.pronombre} · el verbo NO se marca
                </>
              )}
            </div>
          </div>
          <button className="tli-btn" onClick={() => onGirar(1)} aria-label="Sujeto siguiente">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>

        {/* Atajos a cada sujeto */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 14 }}>
          {RONDAS_SUJETO.map((x, i) => (
            <button
              key={x.id}
              className="tli-mini"
              data-on={i === idx}
              onClick={() => onSaltar(i)}
              title={resuelto[x.id] ? "Ya resuelto" : "Ir a este sujeto"}
            >
              {resuelto[x.id] && <i className="fa-solid fa-check" style={{ color: OK, fontSize: 10 }} />}
              {x.sujeto}
            </button>
          ))}
        </div>
      </div>

      {/* La oración viva */}
      <div className="tli-row" data-shake={shake} data-done={hecho} style={{ padding: "22px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: T.text3, marginBottom: 12 }}>
          <i className="fa-solid fa-tower-broadcast" style={{ marginRight: 8, color: accent }} />
          En vivo · la oración cambia con el sujeto
        </div>
        <div style={{ fontSize: 22, lineHeight: 1.6, color: "#fff", fontWeight: 700, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 9 }}>
          <span>{r.sujeto}</span>
          {r.antes && <span>{r.antes}</span>}
          {hecho ? (
            <span style={{ animation: "tliPop .25s ease", color: OK, fontWeight: 900 }}>{forma}</span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 108,
                height: 40,
                borderRadius: 11,
                border: `1.5px dashed ${T.lineStrong}`,
                background: T.inset,
                color: T.text3,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {r.base} + ?
            </span>
          )}
          <span>{r.despues}</span>
        </div>

        <div className="tli-divider" />

        {hecho ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: OK, display: "inline-flex", alignItems: "center", gap: 9 }}>
              <i className="fa-solid fa-circle-check" /> Correcto
            </span>
            <button className="tli-mini" onClick={() => onHablar(`${r.sujeto} ${forma}${r.despues}`)}>
              <i className="fa-solid fa-volume-high" />
              Escuchar
            </button>
            <button className="tli-mini" onClick={() => onGirar(1)}>
              Siguiente sujeto
              <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 11 }}>
              Elige la forma de <strong style={{ color: T.text2 }}>{r.base}</strong> que le corresponde a «{r.sujeto}»:
            </div>
            <div style={{ display: "flex", gap: 11, flexWrap: "wrap" }}>
              {r.opciones.map((op, i) => (
                <button key={op} className="tli-opt" onClick={() => onElegir(i)}>
                  {op}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — The three -s rules
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsRegla({
  selVerbo,
  shakeBin,
  ubicado,
  onMatch,
  dropProps,
}: {
  selVerbo: string | null;
  shakeBin: TipoRegla | null;
  ubicado: Record<string, TipoRegla>;
  onMatch: (verboId: string, bin: TipoRegla) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoRegla[] = ["s", "es", "ies"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      {bins.map((bin) => {
        const info = REGLA_INFO[bin];
        const dentro = VERBOS.filter((v) => ubicado[v.id] === bin);
        return (
          <div
            key={bin}
            className="tli-bin"
            data-shake={shakeBin === bin}
            data-done={dentro.length === VERBOS.filter((v) => v.tipo === bin).length}
            role="button"
            tabIndex={0}
            onClick={() => selVerbo && onMatch(selVerbo, bin)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && selVerbo) {
                e.preventDefault();
                onMatch(selVerbo, bin);
              }
            }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 14.5, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 4 }}>{info.subtitulo}</div>
            <div style={{ fontSize: 11, color: T.text3, fontStyle: "italic", marginBottom: 12 }}>{info.ejemplo}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra o toca aquí…</div>
              ) : (
                dentro.map((v) => (
                  <span
                    key={v.id}
                    style={{
                      animation: "tliPop .25s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 13px",
                      borderRadius: 999,
                      background: `${OK}1a`,
                      border: `1px solid ${OK}55`,
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {v.base}
                    <i className="fa-solid fa-arrow-right-long" style={{ fontSize: 10, color: T.text3 }} />
                    <span style={{ color: OK }}>{v.tercera}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — Negative & question machine
 * ═══════════════════════════════════════════════════════════════════════════ */
function PanelAuxiliar({
  auxOk,
  verbOk,
  shake,
  accent,
  rgba,
  onAux,
  onVerbo,
  onHablar,
}: {
  auxOk: Record<string, boolean>;
  verbOk: Record<string, boolean>;
  shake: string | null;
  accent: string;
  rgba: string;
  onAux: (t: Transformacion, a: Auxiliar) => void;
  onVerbo: (t: Transformacion, i: number) => void;
  onHablar: (frase: string) => void;
}) {
  const hechas = TRANSFORMACIONES.filter((t) => auxOk[t.id] && verbOk[t.id]).length;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Transforma cada oración: elige el auxiliar y la forma del verbo</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hechas >= TRANSFORMACIONES.length ? OK : T.text3 }}>
            {hechas}/{TRANSFORMACIONES.length}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
          Son <strong style={{ color: T.text2 }}>dos decisiones</strong> por tarjeta. La segunda es la que casi todo el mundo falla: al resolverla verás
          tachado el error típico.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TRANSFORMACIONES.map((t) => {
          const okAux = auxOk[t.id] === true;
          const okVerbo = verbOk[t.id] === true;
          const done = okAux && okVerbo;
          const verbo = t.verbos[t.verboCorrecto === 0 ? 0 : 1];
          const frase =
            t.meta === "pregunta" ? `${t.aux} ${t.sujeto} ${verbo} ${t.resto}` : `${t.sujeto} ${t.aux} ${verbo} ${t.resto}`;
          return (
            <div key={t.id} className="tli-row" data-shake={shake === t.id} data-done={done}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap", marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 900,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "#04121f",
                    background: accent,
                    borderRadius: 6,
                    padding: "3px 9px",
                  }}
                >
                  {t.meta === "pregunta" ? "Question" : "Negative"}
                </span>
                <span style={{ fontSize: 14.5, color: T.text2 }}>{t.afirmativa}</span>
                <i className="fa-solid fa-arrow-right-long" style={{ fontSize: 12, color: T.text3 }} />
              </div>

              {done ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 19, fontWeight: 900, color: OK, animation: "tliPop .25s ease" }}>{frase}</div>
                  <div style={{ fontSize: 13.5, color: NO, textDecoration: "line-through", opacity: 0.75 }}>
                    <i className="fa-solid fa-xmark" style={{ marginRight: 8, textDecoration: "none", display: "inline-block" }} />
                    {t.error}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, color: T.text3 }}>
                      Short answer: <strong style={{ color: T.text2 }}>{t.corta}</strong>
                    </span>
                    <button className="tli-mini" onClick={() => onHablar(frase)}>
                      <i className="fa-solid fa-volume-high" />
                      Escuchar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Paso 1 — auxiliar */}
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: okAux ? OK : T.text3, marginBottom: 8 }}>
                      1 · Auxiliar {okAux && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6 }} />}
                    </div>
                    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                      {AUXILIARES.map((a) => (
                        <button key={a} className="tli-opt" data-ok={okAux && a === t.aux} disabled={okAux} onClick={() => onAux(t, a)} style={{ fontSize: 14, padding: "9px 15px" }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Paso 2 — forma del verbo */}
                  <div style={{ opacity: okAux ? 1 : 0.55 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: okVerbo ? OK : T.text3, marginBottom: 8 }}>
                      2 · Forma del verbo {okVerbo && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6 }} />}
                    </div>
                    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                      {t.verbos.map((v, i) => (
                        <button
                          key={v}
                          className="tli-opt"
                          data-ok={okVerbo && i === t.verboCorrecto}
                          disabled={!okAux || okVerbo}
                          onClick={() => onVerbo(t, i)}
                          style={{ fontSize: 14, padding: "9px 15px" }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vista previa de lo que se está armando */}
                  <div
                    style={{
                      borderRadius: 11,
                      border: `1px dashed ${T.lineStrong}`,
                      background: `rgba(${rgba},0.06)`,
                      padding: "10px 14px",
                      fontSize: 15,
                      color: T.text2,
                      fontWeight: 700,
                    }}
                  >
                    {t.meta === "pregunta" ? (
                      <>
                        <Pieza valor={okAux ? t.aux : "___"} listo={okAux} /> {t.sujeto} <Pieza valor={okVerbo ? verbo : "___"} listo={okVerbo} />{" "}
                        {t.resto}
                      </>
                    ) : (
                      <>
                        {t.sujeto} <Pieza valor={okAux ? t.aux : "___"} listo={okAux} /> <Pieza valor={okVerbo ? verbo : "___"} listo={okVerbo} />{" "}
                        {t.resto}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Pieza({ valor, listo }: { valor: string; listo: boolean }) {
  return <span style={{ color: listo ? OK : T.text3, fontWeight: 900 }}>{valor}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 4 — Where does the adverb go?
 * ═══════════════════════════════════════════════════════════════════════════ */
function PanelFrecuencia({
  resuelto,
  shake,
  accent,
  rgba,
  onColocar,
  onHablar,
}: {
  resuelto: Record<string, boolean>;
  shake: string | null;
  accent: string;
  rgba: string;
  onColocar: (fraseId: string, hueco: number) => void;
  onHablar: (frase: string) => void;
}) {
  const hechas = Object.keys(resuelto).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Coloca el adverbio en el hueco donde encaja</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hechas >= FRASES_ADVERBIO.length ? OK : T.text3 }}>
            {hechas}/{FRASES_ADVERBIO.length}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
          Toca uno de los huecos <i className="fa-solid fa-plus" style={{ fontSize: 10 }} /> de la oración. Dos de las oraciones llevan el verbo{" "}
          <strong style={{ color: T.text2 }}>to be</strong>: ahí la regla se invierte.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FRASES_ADVERBIO.map((f) => {
          const done = resuelto[f.id] === true;
          return (
            <div key={f.id} className="tli-row" data-shake={shake === f.id} data-done={done} style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap", marginBottom: 12 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 999,
                    border: `1.5px solid ${done ? OK : accent}`,
                    background: done ? `${OK}1a` : `rgba(${rgba},0.16)`,
                    color: "#fff",
                    padding: "7px 15px",
                    fontSize: 14.5,
                    fontWeight: 900,
                  }}
                >
                  <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 11, color: done ? OK : accent }} />
                  {f.adverbio}
                </span>
                {f.esToBe && (
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3, border: `1px solid ${T.line}`, borderRadius: 6, padding: "3px 8px" }}>
                    verbo to be
                  </span>
                )}
              </div>

              <div style={{ fontSize: 17.5, lineHeight: 2, color: done ? "#fff" : T.text2, fontWeight: 700 }}>
                <span>{f.sujeto} </span>
                {done ? (
                  <>
                    {f.tokens.map((tok, i) => (
                      <span key={i}>
                        {i === f.hueco && <span style={{ color: OK, fontWeight: 900, animation: "tliPop .25s ease" }}>{f.adverbio} </span>}
                        {tok}{" "}
                      </span>
                    ))}
                  </>
                ) : (
                  // Los huecos van ANTES de cada palabra y nunca después del punto
                  // final: un «+» detrás del punto invitaría a colocar el adverbio
                  // fuera de la oración, que no es una de las opciones en juego.
                  <>
                    {f.tokens.map((tok, i) => (
                      <span key={i}>
                        <button className="tli-gap" onClick={() => onColocar(f.id, i)} aria-label={`Colocar ${f.adverbio} en la posición ${i + 1}`}>
                          <i className="fa-solid fa-plus" />
                        </button>{" "}
                        {tok}{" "}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {done && (
                <div style={{ marginTop: 11 }}>
                  <button className="tli-mini" onClick={() => onHablar(f.completa)}>
                    <i className="fa-solid fa-volume-high" />
                    Escuchar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function EscalaFrecuencia({ accent }: { accent: string }) {
  return (
    <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass }}>
      <Eyebrow>
        <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
        Frequency adverbs · A1
      </Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {ADVERBIOS.map((a) => (
          <div key={a.palabra} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 106, flexShrink: 0, fontSize: 12.5, fontWeight: 800, color: T.text }}>{a.palabra}</span>
            <span style={{ flex: 1, height: 7, borderRadius: 4, background: T.inset, overflow: "hidden" }}>
              <span style={{ display: "block", width: `${Math.max(a.nivel, 3)}%`, height: "100%", borderRadius: 4, background: accent, opacity: a.nivel === 0 ? 0.25 : 1 }} />
            </span>
            <span style={{ width: 68, flexShrink: 0, textAlign: "right", fontSize: 11.5, color: T.text3, fontVariantNumeric: "tabular-nums" }}>
              {a.porcentaje}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
