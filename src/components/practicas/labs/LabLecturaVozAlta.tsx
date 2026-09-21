"use client";

/**
 * Laboratorio — Leer en voz alta
 * Práctica experimental para LC-I-P07 (Lengua y Comunicación I, semestre 1):
 * «Practica la lectura en voz alta de algunos textos para luego emitir
 * opiniones al respecto.»
 *
 * El problema honesto de este tema: la lectura en voz alta ocurre FUERA de la
 * pantalla. Este laboratorio no graba al alumno ni juzga su voz —no puede, y
 * fingir que sí sería mentirle—. Lo que sí es manipulable y evaluable es todo
 * lo que se decide ANTES y DESPUÉS de leer:
 *
 *  1. «Marca la partitura» — sobre tres textos reales, colocar dónde va la
 *     pausa breve, la pausa larga, el énfasis y el cambio de entonación, y ver
 *     por qué la puntuación o el sentido lo piden justo ahí.
 *  2. «Ajusta el ritmo» — decidir la velocidad (palabras por minuto) y la
 *     duración de las pausas de cuatro fragmentos según a quién van dirigidos,
 *     con la duración estimada en pantalla y un botón para oír la diferencia.
 *  3. «Juzga la lectura» — seis lecturas ajenas descritas por escrito:
 *     diagnosticar qué elemento falló y elegir la opinión FUNDAMENTADA, que es
 *     literalmente lo que pide el propósito de la progresión.
 *  4. «Escribe el término» — el glosario verbatim de A5, tecleado de memoria.
 *  5. «Completa el texto» — los huecos verbatim de A6.
 *  + Reto evaluable con el quiz verbatim de A2.
 *
 * El apoyo de voz sale de `lab-voz.ts`, con `es-MX-DaliaNeural` —la voz de la
 * plataforma— grabada de antemano, y cae al sintetizador del navegador si una
 * frase no tuviera clip. Es APOYO, no evaluación: sirve para comparar dos
 * maneras de leer el mismo texto. Se pide solo en manejadores y se calla al
 * desmontar.
 *
 * DOM puro (sin three.js): aquí el fenómeno es el texto y la voz; una escena
 * 3D sería decoración. Contenido verbatim de LC-I·P07 (ver la nota al pie).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, NUM } from "./_kit";
import { hablarLab, callarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { LECTURA_VOZ_ALTA_HUECOS } from "./lectura-voz-alta-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LECTURA_VOZ_ALTA_FICHA } from "./lectura-voz-alta-ficha";
import {
  TEXTOS,
  PUNTOS_TOTALES,
  MARCAS,
  MARCA_INFO,
  lecturaDe,
  lecturaCorridaDe,
  FRAGMENTOS,
  PPM_BASE,
  PPM_MIN,
  PPM_MAX,
  PAUSA_MIN,
  PAUSA_MAX,
  palabrasDe,
  duracionEstimada,
  LECTURAS,
  ELEMENTOS,
  ELEMENTO_INFO,
  PARES,
  ACTIVIDAD_FINAL_A5,
  QUIZ,
  HECHOS,
  DEBATE_A7,
  PISTAS_A3,
  CRITERIOS_A3,
  PREGUNTAS_A1,
  DATO_PAZ,
  FUENTE,
  type Marca,
  type PuntoTexto,
  type Elemento,
} from "./lectura-voz-alta-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-lectura-en-voz-alta-reto";

type Modo = "partitura" | "ritmo" | "juicio" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "partitura", label: "Marca la partitura", icono: "fa-highlighter" },
  { id: "ritmo", label: "Ajusta el ritmo", icono: "fa-gauge-high" },
  { id: "juicio", label: "Juzga la lectura", icono: "fa-user-check" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/* ── Apoyo de voz ──────────────────────────────────────────────────────── */
/**
 * ÉSTE ES EL ÚNICO LABORATORIO EN ESPAÑOL de los que tienen botón de voz: lo
 * que se oye aquí son los textos de LC-I·P07, no inglés. Su voz es por tanto
 * `es-MX-DaliaNeural`, la de la plataforma —la misma de los 211 videos y de la
 * narración de las lecturas— y no la locutora inglesa de los otros 17.
 *
 * El `rate` NO es decoración: el modo «Ajusta el ritmo» existe justamente para
 * oír la diferencia entre 110 y 190 palabras por minuto, y «Escuchar de
 * corrido» va deprisa a propósito para que se note qué se pierde sin
 * puntuación. `hablarLab` lo aplica al clip con `playbackRate`.
 */
const hablar = (texto: string, rate: number) => hablarLab(texto, { idioma: "es", rate });
const callarVoz = callarLab;

/** Etiqueta honesta de la velocidad: orienta sin dar la respuesta. */
function zonaDe(ppm: number): string {
  if (ppm < 110) return "muy pausado";
  if (ppm < 140) return "pausado";
  if (ppm < 170) return "ágil";
  return "acelerado";
}

export function LabLecturaVozAlta({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("partitura");

  /* ── sonido y partida ─────────────────────────────────────────────────── */
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(
    () => () => {
      audioRef.current?.dispose();
      callarVoz();
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
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  /* ═══ MODO 1 · Marca la partitura ═════════════════════════════════════ */
  const [txtIdx, setTxtIdx] = useState(0);
  const [marca, setMarca] = useState<Marca>("pausaBreve");
  const [puestos, setPuestos] = useState<Record<string, true>>({});
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [falloPart, setFalloPart] = useState<{ marca: Marca; hayOtro: boolean; esFinal: boolean } | null>(null);
  const [shakeTok, setShakeTok] = useState<number | null>(null);

  const texto = TEXTOS[txtIdx]!;
  const puntoPorToken = useMemo(() => {
    const m = new Map<number, PuntoTexto>();
    for (const p of texto.puntos) m.set(p.token, p);
    return m;
  }, [texto]);

  const puestosDelTexto = texto.puntos.filter((p) => puestos[p.id]).length;
  const textoListo = puestosDelTexto >= texto.puntos.length;

  const clicToken = (i: number) => {
    const punto = puntoPorToken.get(i);
    if (punto && puestos[punto.id]) return;
    if (punto && punto.marca === marca) {
      setPuestos((prev) => ({ ...prev, [punto.id]: true }));
      setUltimo(punto.id);
      setFalloPart(null);
      sfxPlace();
      if (puestosDelTexto + 1 >= texto.puntos.length) sfxOk();
      return;
    }
    setFalloPart({ marca, hayOtro: !!punto, esFinal: i === texto.tokens.length - 1 });
    setUltimo(null);
    setShakeTok(i);
    sfxNo();
    window.setTimeout(() => setShakeTok(null), 420);
  };

  const resetPartitura = () => {
    const quitar = new Set(texto.puntos.map((p) => p.id));
    setPuestos((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !quitar.has(k))));
    setUltimo(null);
    setFalloPart(null);
  };

  const partituraDone = Object.keys(puestos).length >= PUNTOS_TOTALES;
  const puntoUltimo = ultimo ? texto.puntos.find((p) => p.id === ultimo) : undefined;

  /* ═══ MODO 2 · Ajusta el ritmo ════════════════════════════════════════ */
  const [fragIdx, setFragIdx] = useState(0);
  const [ppm, setPpm] = useState<Record<string, number>>({});
  const [pausa, setPausa] = useState<Record<string, number>>({});
  const [ritmoOk, setRitmoOk] = useState<Record<string, true>>({});
  const [avisoRitmo, setAvisoRitmo] = useState<string | null>(null);

  const frag = FRAGMENTOS[fragIdx]!;
  const ppmActual = ppm[frag.id] ?? frag.ppmInicial;
  const pausaActual = pausa[frag.id] ?? frag.pausaInicial;
  const fragListo = ritmoOk[frag.id] === true;
  const ritmoDone = FRAGMENTOS.every((f) => ritmoOk[f.id]);

  const comprobarRitmo = () => {
    if (fragListo) return;
    const vBien = ppmActual >= frag.ppmMin && ppmActual <= frag.ppmMax;
    const pBien = pausaActual >= frag.pausaMin && pausaActual <= frag.pausaMax;
    if (vBien && pBien) {
      setRitmoOk((prev) => ({ ...prev, [frag.id]: true }));
      setAvisoRitmo(null);
      sfxPlace();
      if (FRAGMENTOS.filter((f) => ritmoOk[f.id]).length + 1 >= FRAGMENTOS.length) sfxOk();
      return;
    }
    const partes: string[] = [];
    if (!vBien) partes.push(ppmActual < frag.ppmMin ? "vas demasiado lento para este texto" : "vas demasiado rápido para este texto");
    if (!pBien) partes.push(pausaActual < frag.pausaMin ? "tus silencios son demasiado cortos" : "tus silencios son demasiado largos");
    setAvisoRitmo(`Todavía no: ${partes.join(" y ")}. Relee para quién es esta lectura y vuelve a ajustar.`);
    sfxNo();
  };

  const escucharFragmento = () => hablar(frag.texto, ppmActual / PPM_BASE);

  const resetRitmo = () => {
    setPpm((prev) => ({ ...prev, [frag.id]: frag.ppmInicial }));
    setPausa((prev) => ({ ...prev, [frag.id]: frag.pausaInicial }));
    setRitmoOk((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== frag.id)));
    setAvisoRitmo(null);
    callarVoz();
  };

  /* ═══ MODO 3 · Juzga la lectura ═══════════════════════════════════════ */
  const [lecIdx, setLecIdx] = useState(0);
  const [diag, setDiag] = useState<Record<string, true>>({});
  const [opi, setOpi] = useState<Record<string, true>>({});
  const [opElegida, setOpElegida] = useState<Record<string, number>>({});
  const [avisoDiag, setAvisoDiag] = useState<string | null>(null);

  const lectura = LECTURAS[lecIdx]!;
  const diagListo = diag[lectura.id] === true;
  const opiListo = opi[lectura.id] === true;
  const diagDone = LECTURAS.every((l) => diag[l.id]);
  const opiDone = LECTURAS.every((l) => opi[l.id]);

  const elegirElemento = (e: Elemento) => {
    if (diagListo) return;
    if (e === lectura.elemento) {
      setDiag((prev) => ({ ...prev, [lectura.id]: true }));
      setAvisoDiag(null);
      sfxPlace();
      return;
    }
    setAvisoDiag(
      `«${ELEMENTO_INFO[e].titulo}» no es lo que falló aquí. ${ELEMENTO_INFO[e].pista} Vuelve a la descripción y busca qué fue lo que el oyente sí notó.`
    );
    sfxNo();
  };

  const elegirOpinion = (j: number) => {
    if (opiListo) return;
    const op = lectura.opciones[j];
    if (!op) return;
    setOpElegida((prev) => ({ ...prev, [lectura.id]: j }));
    if (op.ok) {
      setOpi((prev) => ({ ...prev, [lectura.id]: true }));
      sfxPlace();
      if (LECTURAS.filter((l) => opi[l.id]).length + 1 >= LECTURAS.length) sfxOk();
      return;
    }
    sfxNo();
  };

  const resetJuicio = () => {
    setDiag((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== lectura.id)));
    setOpi((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== lectura.id)));
    setOpElegida((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== lectura.id)));
    setAvisoDiag(null);
  };

  /* ═══ MODO 4 · Escribe el término ═════════════════════════════════════ */
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  /* ═══ MODO 5 · Completa el texto ══════════════════════════════════════ */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos de la sesión ───────────────────────────────────────────── */
  const todoHecho = partituraDone && ritmoDone && diagDone && opiDone && glosarioDone && textoDone;
  const objetivos = [
    { txt: `Marca los ${TEXTOS[0]!.puntos.length} puntos de la nota informativa`, done: TEXTOS[0]!.puntos.every((p) => !!puestos[p.id]) },
    { txt: `Marca los ${TEXTOS[1]!.puntos.length} puntos del texto literario`, done: TEXTOS[1]!.puntos.every((p) => !!puestos[p.id]) },
    { txt: `Marca los ${TEXTOS[2]!.puntos.length} puntos del relato con diálogo`, done: TEXTOS[2]!.puntos.every((p) => !!puestos[p.id]) },
    { txt: `Ajusta el ritmo de los ${FRAGMENTOS.length} fragmentos`, done: ritmoDone },
    { txt: `Diagnostica las ${LECTURAS.length} lecturas ajenas`, done: diagDone },
    { txt: `Emite las ${LECTURAS.length} opiniones fundamentadas`, done: opiDone },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto con los cuatro elementos", done: textoDone },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  const resetActual = modo === "partitura" ? resetPartitura : modo === "ritmo" ? resetRitmo : modo === "juicio" ? resetJuicio : modo === "glosario" ? resetGlosario : resetTexto;

  const duracion = duracionEstimada(frag, ppmActual, pausaActual);

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes lvaShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes lvaPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .lva-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .lva-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .lva-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .lva-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .lva-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .lva-icobtn:hover { background:rgba(255,255,255,0.12); }

        /* Selector de texto / fragmento / lectura */
        .lva-doc { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .lva-doc:hover { border-color:${T.lineStrong}; color:#fff; }
        .lva-doc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .lva-doc[data-done="true"] { color:${OK}; border-color:${OK}66; }

        /* Los cuatro marcadores de voz */
        .lva-marca { cursor:pointer; flex:1; min-width:168px; text-align:left; padding:12px 14px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; transition:all .15s; }
        .lva-marca:hover { border-color:${T.lineStrong}; }
        .lva-marca[data-on="true"] { color:#fff; }

        /* La partitura */
        .lva-parrafo { font-size:16px; line-height:2.3; color:${T.text}; margin:0; }
        .lva-tok { cursor:pointer; display:inline-block; border-radius:6px; padding:1px 3px;
          border-bottom:2px dashed rgba(255,255,255,0.16); transition:background .14s, border-color .14s, color .14s; }
        .lva-tok:hover { background:rgba(255,255,255,0.10); border-bottom-color:rgba(255,255,255,0.45); }
        .lva-tok:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .lva-tok[data-done="true"] { cursor:default; border-bottom-style:solid; font-weight:800; }
        .lva-tok[data-done="true"]:hover { background:inherit; }
        .lva-tok[data-shake="true"] { animation:lvaShake .4s; background:${NO}22; border-bottom-color:${NO}; }
        .lva-sil { display:inline-block; font-weight:900; font-size:17px; margin:0 2px; animation:lvaPop .25s ease; }
        .lva-flecha { display:inline-block; font-weight:900; font-size:13px; margin-left:2px; vertical-align:super; animation:lvaPop .25s ease; }

        /* Controles de ritmo */
        .lva-slider { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:99px;
          background:linear-gradient(90deg, rgba(${color.rgba},0.55), rgba(255,255,255,0.14)); outline:none; cursor:pointer; }
        .lva-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:${accent}; border:2px solid #04121f; box-shadow:0 0 14px -3px ${accent}; cursor:grab; }
        .lva-slider::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:${accent}; border:2px solid #04121f; cursor:grab; }
        .lva-gauge { position:relative; height:12px; border-radius:99px; background:${T.inset}; border:1px solid ${T.line}; overflow:hidden; }
        .lva-gauge-zona { position:absolute; top:0; bottom:0; background:${OK}44; border-left:1px solid ${OK}; border-right:1px solid ${OK}; }
        .lva-gauge-aguja { position:absolute; top:-4px; bottom:-4px; width:3px; border-radius:2px; background:${accent}; box-shadow:0 0 10px ${accent}; }

        /* Opciones de opinión y elementos */
        .lva-elem { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:10px 14px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .lva-elem:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .lva-elem:disabled { cursor:default; }
        .lva-op { cursor:pointer; display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left; padding:13px 15px;
          border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:13.5px; font-weight:600; line-height:1.5; transition:all .14s; }
        .lva-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .lva-op:disabled { cursor:default; }

        .lva-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .lva-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .lva-btn:disabled { opacity:.45; cursor:default; }
        .lva-btn[data-primary="true"] { background:${accent}; color:#04121f; border-color:${accent}; }
        .lva-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){
          .lva-tok[data-shake="true"] { animation:none; }
          .lva-sil, .lva-flecha { animation:none; }
        }

        /* Cajón de teoría */
        .lva-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .lva-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .lva-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .lva-drawer[data-open="true"] { transform:translateX(0); }
        .lva-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .lva-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .lva-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .lva-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .lva-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .lva-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .lva-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (max-width: 900px){ .lva-grid { grid-template-columns:minmax(0,1fr) !important; } }
      `}</style>

      {/* ── barra de modos y herramientas ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="lva-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="lva-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="lva-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="lva-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── cajón de teoría ─────────────────────────────────────────────── */}
      <button className="lva-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="lva-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="lva-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="lva-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="lva-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="lva-drawer-body">
          <FichaTeorica data={LECTURA_VOZ_ALTA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="lva-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ══ columna principal ═══════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — marca la partitura */}
          {modo === "partitura" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {TEXTOS.map((t, i) => {
                  const listo = t.puntos.every((p) => !!puestos[p.id]);
                  return (
                    <button
                      key={t.id}
                      className="lva-doc"
                      data-on={txtIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setTxtIdx(i);
                        setUltimo(null);
                        setFalloPart(null);
                        callarVoz();
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : t.icono}`} />
                      {t.genero}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {MARCAS.map((m) => {
                  const info = MARCA_INFO[m];
                  const on = marca === m;
                  return (
                    <button
                      key={m}
                      className="lva-marca"
                      data-on={on}
                      aria-pressed={on}
                      onClick={() => setMarca(m)}
                      style={on ? { borderColor: info.color, background: `${info.color}1f`, boxShadow: `0 0 18px -7px ${info.color}` } : undefined}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 900, color: on ? "#fff" : info.color }}>
                        <i className={`fa-solid ${info.icono}`} />
                        {info.titulo}
                        <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 900, color: info.color }}>{info.simbolo}</span>
                      </div>
                      <div style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 5, color: on ? T.text2 : T.text3 }}>{info.descripcion}</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ ...card, padding: "20px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <i className={`fa-solid ${texto.icono}`} style={{ color: accent, fontSize: 15 }} />
                    <span style={{ fontSize: 16, fontWeight: 900 }}>{texto.titulo}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{texto.genero}</span>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: textoListo ? OK : T.text3, ...NUM }}>
                    {puestosDelTexto}/{texto.puntos.length} marcas
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>{texto.intencion}</div>

                <p className="lva-parrafo">
                  {texto.tokens.map((tok, i) => {
                    const punto = puntoPorToken.get(i);
                    const colocado = punto && puestos[punto.id] ? punto : undefined;
                    const info = colocado ? MARCA_INFO[colocado.marca] : null;
                    const esPausa = colocado ? colocado.marca === "pausaBreve" || colocado.marca === "pausaLarga" : false;
                    return (
                      <span key={i}>
                        <span
                          className="lva-tok"
                          role="button"
                          tabIndex={colocado ? -1 : 0}
                          aria-label={colocado ? `${tok} — ${info!.titulo}` : tok}
                          data-done={!!colocado}
                          data-shake={shakeTok === i}
                          onClick={() => clicToken(i)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              clicToken(i);
                            }
                          }}
                          style={
                            colocado && !esPausa
                              ? { background: `${info!.color}2e`, borderBottomColor: info!.color, color: "#fff" }
                              : colocado
                                ? { borderBottomColor: info!.color }
                                : undefined
                          }
                        >
                          {tok}
                        </span>
                        {colocado && esPausa && (
                          <span className="lva-sil" style={{ color: info!.color }}>
                            {info!.simbolo}
                          </span>
                        )}
                        {colocado && colocado.marca === "entonacion" && (
                          <span className="lva-flecha" style={{ color: info!.color }}>
                            {colocado.direccion === "baja" ? "↘" : "↗"}
                          </span>
                        )}{" "}
                      </span>
                    );
                  })}
                </p>

                {puntoUltimo && (
                  <div
                    style={{
                      marginTop: 18,
                      borderRadius: 13,
                      border: `1px solid ${MARCA_INFO[puntoUltimo.marca].color}66`,
                      background: `${MARCA_INFO[puntoUltimo.marca].color}14`,
                      padding: "13px 16px",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <i className={`fa-solid ${MARCA_INFO[puntoUltimo.marca].icono}`} style={{ color: MARCA_INFO[puntoUltimo.marca].color, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
                      <strong style={{ color: "#fff" }}>{MARCA_INFO[puntoUltimo.marca].titulo} en «{texto.tokens[puntoUltimo.token]}».</strong> {puntoUltimo.razon}
                    </div>
                  </div>
                )}

                {falloPart && (
                  <div style={{ marginTop: 18, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
                      {falloPart.hayOtro ? (
                        <>
                          <strong style={{ color: "#fff" }}>Aquí sí pasa algo, pero no es «{MARCA_INFO[falloPart.marca].titulo.toLowerCase()}».</strong> Mira el
                          signo que acompaña a esa palabra y prueba con otro marcador.
                        </>
                      ) : falloPart.esFinal ? (
                        <>
                          <strong style={{ color: "#fff" }}>Es el final del texto.</strong> La pausa de cierre se da por hecha: no hace falta marcarla, porque
                          después ya no viene nada que el oyente tenga que separar.
                        </>
                      ) : (
                        <>
                          <strong style={{ color: "#fff" }}>Ahí no va nada.</strong> {MARCA_INFO[falloPart.marca].errorGenerico}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {textoListo && (
                  <div style={{ marginTop: 18, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
                      Partitura completa. Ahora léela tú en voz alta respetando tus marcas: eso es lo que el laboratorio no puede hacer por ti.
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <button className="lva-btn" onClick={() => hablar(lecturaCorridaDe(texto), 1.3)} title="Sin puntuación y deprisa">
                    <i className="fa-solid fa-forward" />
                    Escuchar de corrido
                  </button>
                  <button className="lva-btn" data-primary onClick={() => hablar(lecturaDe(texto), 0.9)} title="Con su puntuación y a ritmo de lectura">
                    <i className="fa-solid fa-volume-high" />
                    Escuchar con la puntuación
                  </button>
                  <button className="lva-btn" onClick={callarVoz} title="Detener la voz">
                    <i className="fa-solid fa-volume-xmark" />
                    Detener
                  </button>
                </div>
                <div style={{ fontSize: 11.5, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
                  La voz es la del navegador y sirve para comparar, no para calificarte. Si tu equipo no tiene voz en español, los botones no sonarán: el resto
                  del laboratorio funciona igual.
                </div>
              </div>
            </>
          )}

          {/* MODO 2 — ajusta el ritmo */}
          {modo === "ritmo" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {FRAGMENTOS.map((f, i) => (
                  <button
                    key={f.id}
                    className="lva-doc"
                    data-on={fragIdx === i}
                    data-done={ritmoOk[f.id] === true}
                    onClick={() => {
                      setFragIdx(i);
                      setAvisoRitmo(null);
                      callarVoz();
                    }}
                  >
                    <i className={`fa-solid ${ritmoOk[f.id] ? "fa-circle-check" : f.icono}`} />
                    {f.titulo}
                  </button>
                ))}
              </div>

              <div style={{ ...card, padding: "20px 24px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
                  {f2(frag.genero)}
                </Eyebrow>
                <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.8, color: T.text }}>{frag.texto}</p>
                <div style={{ borderRadius: 12, border: `1px solid rgba(${color.rgba},0.28)`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px", display: "flex", gap: 11 }}>
                  <i className="fa-solid fa-user-group" style={{ color: accent, marginTop: 2 }} />
                  <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{frag.proposito}</span>
                </div>

                <div className="lva-divider" />

                {/* velocidad */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Velocidad de lectura</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: accent, ...NUM }}>
                    {ppmActual} <span style={{ fontSize: 11, fontWeight: 700, color: T.text3 }}>palabras/min · {zonaDe(ppmActual)}</span>
                  </span>
                </div>
                <input
                  className="lva-slider"
                  type="range"
                  min={PPM_MIN}
                  max={PPM_MAX}
                  step={5}
                  value={ppmActual}
                  aria-label="Velocidad de lectura (palabras por minuto)"
                  disabled={fragListo}
                  onChange={(e) => setPpm((prev) => ({ ...prev, [frag.id]: Number(e.target.value) }))}
                  style={{ marginTop: 10 }}
                />
                <div style={{ position: "relative", marginTop: 14 }}>
                  <div className="lva-gauge">
                    {fragListo && (
                      <div
                        className="lva-gauge-zona"
                        style={{
                          left: `${((frag.ppmMin - PPM_MIN) / (PPM_MAX - PPM_MIN)) * 100}%`,
                          width: `${((frag.ppmMax - frag.ppmMin) / (PPM_MAX - PPM_MIN)) * 100}%`,
                        }}
                      />
                    )}
                    <div className="lva-gauge-aguja" style={{ left: `${((ppmActual - PPM_MIN) / (PPM_MAX - PPM_MIN)) * 100}%` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: T.text3, marginTop: 6, ...NUM }}>
                    <span>{PPM_MIN}</span>
                    <span>muy pausado · pausado · ágil · acelerado</span>
                    <span>{PPM_MAX}</span>
                  </div>
                </div>

                {/* pausa */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Duración de cada pausa fuerte</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: accent, ...NUM }}>
                    {pausaActual.toFixed(1)} <span style={{ fontSize: 11, fontWeight: 700, color: T.text3 }}>segundos</span>
                  </span>
                </div>
                <input
                  className="lva-slider"
                  type="range"
                  min={PAUSA_MIN}
                  max={PAUSA_MAX}
                  step={0.1}
                  value={pausaActual}
                  aria-label="Duración de cada pausa fuerte (segundos)"
                  disabled={fragListo}
                  onChange={(e) => setPausa((prev) => ({ ...prev, [frag.id]: Number(e.target.value) }))}
                  style={{ marginTop: 10 }}
                />

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 18, fontSize: 12.5, color: T.text2 }}>
                  <span>
                    <strong style={{ color: T.text, ...NUM }}>{palabrasDe(frag.texto)}</strong> palabras
                  </span>
                  <span>·</span>
                  <span>
                    <strong style={{ color: T.text, ...NUM }}>{frag.pausas}</strong> pausas fuertes
                  </span>
                  <span>·</span>
                  <span>
                    duración estimada{" "}
                    <strong style={{ color: accent, ...NUM }}>
                      {Math.floor(duracion / 60) > 0 ? `${Math.floor(duracion / 60)} min ` : ""}
                      {(duracion % 60).toFixed(1)} s
                    </strong>
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <button className="lva-btn" onClick={escucharFragmento} title="Oír el fragmento a esa velocidad">
                    <i className="fa-solid fa-volume-high" />
                    Escuchar a {ppmActual} ppm
                  </button>
                  <button className="lva-btn" onClick={callarVoz} title="Detener la voz">
                    <i className="fa-solid fa-volume-xmark" />
                    Detener
                  </button>
                  <button className="lva-btn" data-primary onClick={comprobarRitmo} disabled={fragListo}>
                    <i className="fa-solid fa-circle-check" />
                    Comprobar el ajuste
                  </button>
                </div>

                {avisoRitmo && !fragListo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{avisoRitmo}</div>
                  </div>
                )}

                {fragListo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
                      <strong style={{ color: "#fff" }}>
                        Intervalo orientativo: {frag.ppmMin}–{frag.ppmMax} palabras/min y pausas de {frag.pausaMin.toFixed(1)}–{frag.pausaMax.toFixed(1)} s.
                      </strong>{" "}
                      {frag.razon}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO 3 — juzga la lectura */}
          {modo === "juicio" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {LECTURAS.map((l, i) => {
                  const listo = diag[l.id] === true && opi[l.id] === true;
                  return (
                    <button
                      key={l.id}
                      className="lva-doc"
                      data-on={lecIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setLecIdx(i);
                        setAvisoDiag(null);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-user"}`} />
                      {l.lector}
                    </button>
                  );
                })}
              </div>

              <div style={{ ...card, padding: "20px 24px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-ear-listen" style={{ marginRight: 8, color: accent }} />
                  Paso 1 · ¿Qué elemento falló?
                </Eyebrow>
                <div style={{ fontSize: 12, color: T.text3, marginBottom: 12 }}>{lectura.contexto}</div>
                <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.75, color: T.text }}>{lectura.descripcion}</p>

                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {ELEMENTOS.map((e) => {
                    const info = ELEMENTO_INFO[e];
                    const acertado = diagListo && e === lectura.elemento;
                    return (
                      <button
                        key={e}
                        className="lva-elem"
                        disabled={diagListo}
                        onClick={() => elegirElemento(e)}
                        style={acertado ? { borderColor: OK, background: `${OK}1c`, color: "#fff" } : undefined}
                      >
                        <i className={`fa-solid ${info.icono}`} style={{ color: acertado ? OK : info.color }} />
                        {info.titulo}
                      </button>
                    );
                  })}
                </div>

                {avisoDiag && !diagListo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{avisoDiag}</div>
                  </div>
                )}

                {diagListo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
                      <strong style={{ color: "#fff" }}>{ELEMENTO_INFO[lectura.elemento].titulo}. </strong>
                      {lectura.porQue}
                    </div>
                  </div>
                )}

                <div className="lva-divider" />

                <Eyebrow>
                  <i className="fa-solid fa-comment-dots" style={{ marginRight: 8, color: accent }} />
                  Paso 2 · ¿Cuál de las tres opiniones está fundamentada?
                </Eyebrow>
                {!diagListo && <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 12 }}>Primero diagnostica el elemento: sin eso, la opinión no tiene en qué apoyarse.</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: diagListo ? 1 : 0.45 }}>
                  {lectura.opciones.map((op, j) => {
                    const elegida = opElegida[lectura.id] === j;
                    // Resuelto el caso, se explican las TRES: saber por qué las otras
                    // dos no están fundamentadas enseña tanto como acertar.
                    const mostrar = elegida || opiListo;
                    const buena = opiListo && op.ok;
                    return (
                      <div key={j}>
                        <button
                          className="lva-op"
                          disabled={!diagListo || opiListo}
                          onClick={() => elegirOpinion(j)}
                          style={
                            buena
                              ? { borderColor: OK, background: `${OK}16`, color: "#fff" }
                              : elegida && !op.ok
                                ? { borderColor: NO, background: `${NO}12`, color: "#fff" }
                                : undefined
                          }
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 900,
                              border: `1px solid ${T.line}`,
                              color: T.text3,
                            }}
                          >
                            {String.fromCharCode(65 + j)}
                          </span>
                          <span style={{ flex: 1 }}>{op.txt}</span>
                        </button>
                        {mostrar && (
                          <div
                            style={{
                              marginTop: 7,
                              marginLeft: 14,
                              fontSize: 12.5,
                              color: T.text2,
                              lineHeight: 1.55,
                              borderLeft: `2px solid ${op.ok ? OK : NO}`,
                              paddingLeft: 12,
                            }}
                          >
                            {op.porQue}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* MODO 4 — escribe el término */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y su ejemplo y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {/* MODO 5 — completa el texto */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={LECTURA_VOZ_ALTA_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}
        </div>

        {/* ══ columna lateral ═════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

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
              {modo === "partitura" && (
                <>
                  La puntuación es la partitura: la <strong style={{ color: T.text }}>coma</strong> pide silencio corto, el{" "}
                  <strong style={{ color: T.text }}>punto</strong> y los <strong style={{ color: T.text }}>dos puntos</strong> piden respiración, y los signos de
                  interrogación y exclamación piden que el tono se mueva. El énfasis no lo marca ningún signo: lo decides tú, en la palabra que trae lo nuevo.
                </>
              )}
              {modo === "ritmo" && (
                <>
                  No hay una velocidad «correcta» para todo: hay una adecuada <strong style={{ color: T.text }}>para este texto y para quien lo escucha</strong>.
                  Pregúntate qué está haciendo el oyente mientras te oye. Los intervalos son orientativos, no una norma.
                </>
              )}
              {modo === "juicio" && (
                <>
                  Una opinión fundamentada tiene tres piezas: <strong style={{ color: T.text }}>qué se escuchó</strong>,{" "}
                  <strong style={{ color: T.text }}>qué elemento explica eso</strong> y <strong style={{ color: T.text }}>qué efecto tuvo</strong> en quien
                  escucha. Sin las tres, es un «me gustó» con más palabras.
                </>
              )}
              {modo === "glosario" && <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>}
              {modo === "texto" && <>Aquí se escribe. El botón de pista te da la definición y el banco de palabras te deja tocar el término en vez de teclearlo.</>}
            </span>
          </div>

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
            <span>{DATO_PAZ}</span>
          </div>

          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-microphone-lines" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              <strong style={{ color: T.text }}>Tarea fuera de la pantalla: </strong>
              {ACTIVIDAD_FINAL_A5}
            </span>
          </div>
        </div>
      </div>

      {/* ── hechos de A4, debate de A7, comprensión y criterios de A1/A3 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-check-double" style={{ marginRight: 8, color: accent }} />
            Hechos
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HECHOS.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 11 }}>
                <i className={`fa-solid ${h.verdadero ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: h.verdadero ? OK : NO, fontSize: 14, marginTop: 3, flexShrink: 0 }} />
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <div style={{ color: T.text }}>{h.enunciado}</div>
                  <div style={{ color: T.text3, marginTop: 3 }}>{h.retro}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
            Debate de la progresión
          </Eyebrow>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text, lineHeight: 1.5, marginBottom: 14 }}>{DEBATE_A7.tema}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {DEBATE_A7.posturas.map((p, i) => (
              <div key={i} style={{ borderRadius: 13, border: `1px solid ${T.line}`, background: T.inset, padding: "12px 14px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, lineHeight: 1.5 }}>{p.postura}</div>
                <ul style={{ margin: "8px 0 0", paddingLeft: 17, fontSize: 12, color: T.text3, lineHeight: 1.55 }}>
                  {p.argumentos.map((a, j) => (
                    <li key={j}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T.text3, marginTop: 12, lineHeight: 1.5 }}>
            Las dos posturas son defendibles: {DEBATE_A7.reglas.join(" ")}
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
            Comprensión de la lectura
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {PREGUNTAS_A1.map((p, i) => (
              <div key={i}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, lineHeight: 1.5 }}>{p.pregunta}</div>
                <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.55, marginTop: 4 }}>{p.respuesta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* criterios y preguntas de A3: con qué se juzga una lectura */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
            Criterios para opinar
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
            {CRITERIOS_A3.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <div className="lva-divider" />
          <Eyebrow>
            <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
            Preguntas para prepararte
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
            {PISTAS_A3.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── reto evaluable (quiz A2 verbatim) ───────────────────────────── */}
      <RetoQuizCard
        quiz={QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Sabes qué hace cada elemento de la voz y qué convierte un comentario en una opinión fundamentada."
      />

      {/* ── nota al pie ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 18, display: "flex", gap: 12, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Son <strong>verbatim</strong> de la progresión LC-I-P07: la lectura y el «¿sabías que?» de A1 con sus preguntas de comprensión, el quiz evaluable de
          A2, las pistas y los criterios de A3, los hechos de A4, el glosario de A5 con sus ejemplos, el texto con huecos de A6 y el debate de A7. Los{" "}
          <strong>tres textos que se marcan</strong>, los <strong>cuatro fragmentos de ritmo</strong> y las <strong>seis lecturas ajenas</strong> los escribí
          para esta práctica, porque la progresión pide «textos de su elección» y no trae ninguno: son <strong>ilustrativos</strong>, y los nombres de quienes
          leen son ficticios a propósito, para no atribuir a nadie real una lectura. Los intervalos de velocidad y de pausa son{" "}
          <strong>orientativos</strong>: parten de que una lectura en voz alta para público suele moverse alrededor de 120–150 palabras por minuto, más despacio
          que una conversación, y se mueven desde ahí según el texto; no son una norma y se pueden discutir. Sí son verificables los datos externos: la primera
          línea del Metro de la Ciudad de México se inauguró en 1969 y Octavio Paz recibió el Premio Nobel de Literatura en 1990. La descripción de la
          entonación —ascendente en las preguntas que se responden con sí o no, descendente en las que empiezan con «qué» o «cuántas»— es la descripción
          estándar de la prosodia del español. <strong>Este laboratorio no graba ni califica tu voz</strong>: el botón «Escuchar» usa el sintetizador del
          navegador y sirve para comparar dos maneras de leer. Fuente: {FUENTE}.
        </span>
      </div>
    </div>
  );
}

/** Primera letra en mayúscula, para los encabezados de género. */
function f2(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
