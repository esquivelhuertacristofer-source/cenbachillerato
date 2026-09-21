"use client";

/**
 * Laboratorio — Leer más allá de lo literal
 * Práctica experimental para LC-III-P01 (Lengua y Comunicación III, semestre 3):
 * «Leer críticamente: más allá de la comprensión literal».
 *
 * El fenómeno de esta progresión es el TEXTO, así que el laboratorio es DOM
 * puro: cualquier escena 3D sería decoración. Lo que se manipula son las
 * operaciones del lector crítico, que en la plataforma no existían todavía —
 * `hecho-opinion-texto` (LC-I-P03) separa dato de juicio y `ideas-clave-
 * subrayado` (LC-I-P05) separa idea principal de detalle; aquí se trabaja el
 * paso siguiente: los tres NIVELES de lectura y la POSTURA propia.
 *
 * Seis modos, cada uno con un acto distinto:
 *  1. «Tres niveles»       — ante un mismo texto, clasificar tres preguntas
 *     (literal / inferencial / crítica) y responder cada una como corresponde:
 *     la literal señalando la línea, la inferencial eligiendo la deducción que
 *     el texto sostiene, la crítica eligiendo la evaluación que juzga el
 *     argumento (y no al autor ni al tema). Tres textos.
 *  2. «El supuesto oculto» — encontrar, entre tres candidatos, la idea que el
 *     autor no argumenta pero necesita que aceptes. Cinco argumentos.
 *  3. «Quién habla»        — identificar a quién le conviene la conclusión y
 *     separar la crítica del argumento del ataque a la persona. Cuatro casos.
 *  4. «Toma postura»       — elegir una postura frente a un texto y sostenerla
 *     con las dos líneas que la respaldan; sin respaldo queda marcada como
 *     opinión sin sustento, no como error de gusto.
 *  5. «Escribe el término» — los seis términos del glosario verbatim de A5.
 *  6. «Completa el texto»  — los huecos verbatim de A6, escribiendo.
 *  + Reto evaluable con el quiz verbatim de A2.
 *
 * Contenido verbatim de LC-III·P01; TODOS los textos que aquí se critican son
 * míos e ilustrativos, con emisores ficticios a propósito (ver
 * `lectura-critica-data.ts` y la nota al pie).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { LECTURA_CRITICA_HUECOS } from "./lectura-critica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LECTURA_CRITICA_FICHA } from "./lectura-critica-ficha";
import {
  TEXTOS,
  TOTAL_PREGUNTAS,
  NIVELES,
  NIVEL_INFO,
  ERROR_POR_NIVEL,
  SUPUESTOS,
  PISTA_SUPUESTO,
  CASOS,
  TOTAL_REACCIONES,
  REACCION_INFO,
  NOTA_EMISOR,
  TEXTO_POSTURA,
  SIN_SUSTENTO,
  NOTA_POSTURA,
  PARES,
  QUIZ,
  HECHOS,
  MARCO,
  LECTURA_A1_TITULO,
  PREGUNTAS_A1,
  PISTAS_A3,
  DATO_PAZ,
  ACTIVIDAD_FINAL_A5,
  FUENTE,
  type Nivel,
  type TipoReaccion,
} from "./lectura-critica-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-lectura-critica-postura-reto";

type Modo = "niveles" | "supuesto" | "emisor" | "postura" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "niveles", label: "Tres niveles", icono: "fa-stairs" },
  { id: "supuesto", label: "El supuesto oculto", icono: "fa-puzzle-piece" },
  { id: "emisor", label: "Quién habla", icono: "fa-user-tie" },
  { id: "postura", label: "Toma postura", icono: "fa-scale-balanced" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const TIPOS_REACCION: TipoReaccion[] = ["argumento", "persona"];

export function LabLecturaCritica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("niveles");

  /* ── sonido y partida ─────────────────────────────────────────────────── */
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
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
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  /* ── MODO 1 · tres niveles ────────────────────────────────────────────── */
  const [txtIdx, setTxtIdx] = useState(0);
  const [clasif, setClasif] = useState<Record<string, Nivel>>({});
  const [selPreg, setSelPreg] = useState<string | null>(null);
  const [shakeCol, setShakeCol] = useState<Nivel | null>(null);
  const [errNivel, setErrNivel] = useState<{ nivel: Nivel } | null>(null);
  const [resp, setResp] = useState<Record<string, boolean>>({});
  const [elegida, setElegida] = useState<Record<string, string>>({});
  const [lineaMal, setLineaMal] = useState<string | null>(null);

  const texto = TEXTOS[txtIdx]!;
  const preguntasLibres = texto.preguntas.filter((p) => !clasif[p.id]);
  const textoClasificado = preguntasLibres.length === 0;
  const textoResuelto = textoClasificado && texto.preguntas.every((p) => resp[p.id]);
  const literalPendiente = texto.preguntas.find((p) => p.nivel === "literal" && !!clasif[p.id] && !resp[p.id]);

  const clasificarPregunta = (pid: string, nivel: Nivel) => {
    if (clasif[pid]) return;
    const p = texto.preguntas.find((x) => x.id === pid);
    if (!p) return;
    if (p.nivel === nivel) {
      setClasif((c) => ({ ...c, [pid]: nivel }));
      setSelPreg(null);
      setErrNivel(null);
      sfxPlace();
    } else {
      setShakeCol(nivel);
      setErrNivel({ nivel });
      sfxNo();
      window.setTimeout(() => setShakeCol(null), 420);
    }
  };

  const clicLinea = (lineaId: string) => {
    if (!literalPendiente) return;
    if (literalPendiente.lineaRespuesta === lineaId) {
      setResp((r) => ({ ...r, [literalPendiente.id]: true }));
      setLineaMal(null);
      sfxPlace();
    } else {
      setLineaMal(lineaId);
      sfxNo();
    }
  };

  const elegirOpcion = (pid: string, opcionId: string, correcta: boolean) => {
    if (resp[pid]) return;
    setElegida((e) => ({ ...e, [pid]: opcionId }));
    if (correcta) {
      setResp((r) => ({ ...r, [pid]: true }));
      sfxPlace();
    } else {
      sfxNo();
    }
  };

  const resetNiveles = () => {
    const ids = new Set(texto.preguntas.map((p) => p.id));
    setClasif((c) => Object.fromEntries(Object.entries(c).filter(([k]) => !ids.has(k))));
    setResp((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !ids.has(k))));
    setElegida((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !ids.has(k))));
    setSelPreg(null);
    setErrNivel(null);
    setLineaMal(null);
  };

  const clasificadas = Object.keys(clasif).length;
  const respondidas = Object.keys(resp).length;
  const clasificarDone = clasificadas >= TOTAL_PREGUNTAS;
  const responderDone = respondidas >= TOTAL_PREGUNTAS;

  /* ── MODO 2 · el supuesto oculto ──────────────────────────────────────── */
  const [sIdx, setSIdx] = useState(0);
  const [supSel, setSupSel] = useState<Record<string, string>>({});
  const [supOk, setSupOk] = useState<Record<string, boolean>>({});
  const arg = SUPUESTOS[sIdx]!;
  const argOk = supOk[arg.id] === true;

  const elegirSupuesto = (opcionId: string, esSupuesto: boolean) => {
    if (argOk) return;
    setSupSel((s) => ({ ...s, [arg.id]: opcionId }));
    if (esSupuesto) {
      setSupOk((s) => ({ ...s, [arg.id]: true }));
      sfxPlace();
    } else {
      sfxNo();
    }
  };

  const resetSupuestos = () => {
    setSupSel({});
    setSupOk({});
    setSIdx(0);
  };
  const supuestoDone = Object.keys(supOk).length >= SUPUESTOS.length;

  /* ── MODO 3 · quién habla y desde dónde ───────────────────────────────── */
  const [cIdx, setCIdx] = useState(0);
  const [intSel, setIntSel] = useState<Record<string, string>>({});
  const [intOk, setIntOk] = useState<Record<string, boolean>>({});
  const [reacUbic, setReacUbic] = useState<Record<string, TipoReaccion>>({});
  const [selReac, setSelReac] = useState<string | null>(null);
  const [shakeReac, setShakeReac] = useState<TipoReaccion | null>(null);
  const caso = CASOS[cIdx]!;
  const casoIntOk = intOk[caso.id] === true;

  const elegirInteres = (opcionId: string, correcto: boolean) => {
    if (casoIntOk) return;
    setIntSel((s) => ({ ...s, [caso.id]: opcionId }));
    if (correcto) {
      setIntOk((s) => ({ ...s, [caso.id]: true }));
      sfxPlace();
    } else {
      sfxNo();
    }
  };

  const ubicarReaccion = (reacId: string, tipo: TipoReaccion) => {
    if (reacUbic[reacId]) return;
    const r = caso.reacciones.find((x) => x.id === reacId);
    if (!r) return;
    if (r.tipo === tipo) {
      setReacUbic((u) => ({ ...u, [reacId]: tipo }));
      setSelReac(null);
      sfxPlace();
    } else {
      setShakeReac(tipo);
      sfxNo();
      window.setTimeout(() => setShakeReac(null), 420);
    }
  };

  const resetEmisor = () => {
    setIntSel({});
    setIntOk({});
    setReacUbic({});
    setSelReac(null);
    setCIdx(0);
  };
  const interesesDone = Object.keys(intOk).length >= CASOS.length;
  const reaccionesDone = Object.keys(reacUbic).length >= TOTAL_REACCIONES;

  /* ── MODO 4 · toma postura ────────────────────────────────────────────── */
  const [posSel, setPosSel] = useState<string | null>(null);
  const [lineasSel, setLineasSel] = useState<string[]>([]);
  const [posOk, setPosOk] = useState<Record<string, boolean>>({});
  const [posMsg, setPosMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const postura = TEXTO_POSTURA.posturas.find((p) => p.id === posSel) ?? null;
  const posturaYaOk = postura ? posOk[postura.id] === true : false;

  const elegirPostura = (id: string) => {
    setPosSel((v) => (v === id ? null : id));
    setLineasSel([]);
    setPosMsg(null);
  };

  const togglaLinea = (lineaId: string) => {
    if (!postura || posturaYaOk) return;
    setPosMsg(null);
    setLineasSel((prev) => {
      if (prev.includes(lineaId)) return prev.filter((x) => x !== lineaId);
      if (prev.length >= 2) return prev;
      return [...prev, lineaId];
    });
  };

  const sostener = () => {
    if (!postura || posturaYaOk || lineasSel.length !== 2) return;
    const bien = postura.apoyo.every((l) => lineasSel.includes(l));
    if (bien) {
      setPosOk((p) => ({ ...p, [postura.id]: true }));
      setPosMsg({ ok: true, texto: postura.porque });
      sfxPlace();
      sfxOk();
    } else {
      setPosMsg({ ok: false, texto: SIN_SUSTENTO });
      setLineasSel([]);
      sfxNo();
    }
  };

  const resetPostura = () => {
    setPosSel(null);
    setLineasSel([]);
    setPosOk({});
    setPosMsg(null);
  };
  const posturaDone = Object.keys(posOk).length >= TEXTO_POSTURA.posturas.length;

  /* ── MODO 5 · escribe el término (A5 verbatim) ────────────────────────── */
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  /* ── MODO 6 · completa el texto (A6 verbatim) ─────────────────────────── */
  const [huecosDone, setHuecosDone] = useState(false);
  const [huecosIntento, setHuecosIntento] = useState(0);
  const resetHuecos = () => {
    setHuecosDone(false);
    setHuecosIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ────────────────────────────────────────────────────────── */
  const todoHecho =
    clasificarDone && responderDone && supuestoDone && interesesDone && reaccionesDone && posturaDone && glosarioDone && huecosDone;

  const objetivos = [
    { txt: `Clasifica las ${TOTAL_PREGUNTAS} preguntas en su nivel de lectura`, done: clasificarDone },
    { txt: "Responde los tres niveles de los tres textos", done: responderDone },
    { txt: `Encuentra el supuesto de los ${SUPUESTOS.length} argumentos`, done: supuestoDone },
    { txt: `Di a quién le conviene cada conclusión (${CASOS.length} casos)`, done: interesesDone },
    { txt: `Separa crítica del argumento y ataque a la persona (${TOTAL_REACCIONES})`, done: reaccionesDone },
    { txt: "Sostén las tres posturas con evidencia del texto", done: posturaDone },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto con los cinco términos", done: huecosDone },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  /* ── arrastre nativo (clasificaciones) ────────────────────────────────── */
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
  });
  /**
   * Las zonas de caída NO usan una fábrica de props (`dropProps(cb)`): pasarle
   * un closure que acaba tocando `audioRef` hace que el lint del React
   * Compiler lo lea como acceso a la ref durante el render. Van escritas a
   * mano en cada columna, que además deja a la vista qué recibe cada una.
   */
  const dragOverProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  };
  const idArrastrado = (e: React.DragEvent): string => {
    e.preventDefault();
    return e.dataTransfer.getData("text/plain");
  };

  const resetActual =
    modo === "niveles"
      ? resetNiveles
      : modo === "supuesto"
        ? resetSupuestos
        : modo === "emisor"
          ? resetEmisor
          : modo === "postura"
            ? resetPostura
            : modo === "glosario"
              ? resetGlosario
              : resetHuecos;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes lcpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes lcpPop { 0%{transform:scale(.72);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .lcp-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .lcp-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .lcp-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .lcp-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .lcp-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .lcp-icobtn:hover { background:rgba(255,255,255,0.12); }

        .lcp-doc { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .lcp-doc:hover { border-color:${T.lineStrong}; color:#fff; }
        .lcp-doc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .lcp-doc[data-done="true"] { color:${OK}; border-color:${OK}66; }

        /* Líneas numeradas de un texto */
        .lcp-linea { display:flex; gap:12px; align-items:flex-start; padding:8px 11px; border-radius:10px;
          border:1px solid transparent; font-size:14.5px; line-height:1.65; color:${T.text}; transition:all .14s; text-align:left; width:100%;
          background:transparent; }
        .lcp-linea[data-clic="true"] { cursor:pointer; }
        .lcp-linea[data-clic="true"]:hover { background:rgba(255,255,255,0.07); border-color:${T.lineStrong}; }
        .lcp-linea[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .lcp-linea[data-hit="true"] { border-color:${OK}; background:${OK}18; }
        .lcp-linea[data-bad="true"] { border-color:${NO}; background:${NO}14; animation:lcpShake .4s; }
        .lcp-linea:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .lcp-num { flex-shrink:0; width:24px; height:24px; border-radius:7px; display:inline-flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:900; background:rgba(255,255,255,0.08); color:${T.text3}; margin-top:2px; }

        /* Fichas arrastrables */
        .lcp-chip { cursor:grab; display:inline-flex; align-items:flex-start; gap:9px; padding:11px 15px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13px; font-weight:700; transition:all .14s;
          user-select:none; max-width:360px; text-align:left; line-height:1.45; }
        .lcp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .lcp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .lcp-chip:active { cursor:grabbing; }

        /* Columnas: su color lo pone el propio nivel desde el JSX. */
        .lcp-col { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px; transition:all .16s; min-height:170px; }
        .lcp-col[data-shake="true"] { animation:lcpShake .4s; border-color:${NO}; }

        /* Opciones de respuesta */
        .lcp-opt { cursor:pointer; display:block; width:100%; text-align:left; padding:11px 14px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13px; font-weight:600; line-height:1.5; transition:all .14s; }
        .lcp-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
        .lcp-opt:disabled { cursor:default; }
        .lcp-opt[data-ok="true"] { border-color:${OK}; background:${OK}18; }
        .lcp-opt[data-bad="true"] { border-color:${NO}; background:${NO}14; }

        .lcp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .lcp-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .lcp-btn:disabled { opacity:.45; cursor:default; }
        .lcp-btn[data-primary="true"] { background:${accent}; color:#04121f; border-color:${accent}; }
        .lcp-paso { cursor:pointer; width:30px; height:30px; border-radius:9px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text3}; font-size:12.5px; font-weight:900; transition:all .14s; }
        .lcp-paso:hover { border-color:${T.lineStrong}; color:#fff; }
        .lcp-paso[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .lcp-paso[data-done="true"] { color:${OK}; border-color:${OK}66; }
        @media (prefers-reduced-motion: reduce){
          .lcp-linea[data-bad="true"], .lcp-col[data-shake="true"] { animation:none; }
          .lcp-chip, .lcp-chip:hover, .lcp-chip[data-sel="true"] { transform:none; }
        }

        /* Cajón de teoría */
        .lcp-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .lcp-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .lcp-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .lcp-drawer[data-open="true"] { transform:translateX(0); }
        .lcp-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .lcp-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .lcp-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .lcp-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .lcp-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .lcp-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .lcp-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (max-width: 900px){ .lcp-grid { grid-template-columns:minmax(0,1fr) !important; } }
      `}</style>

      {/* ── barra de modos y herramientas ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="lcp-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="lcp-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="lcp-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="lcp-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── cajón de teoría ─────────────────────────────────────────────── */}
      <button className="lcp-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="lcp-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="lcp-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="lcp-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="lcp-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="lcp-drawer-body">
          <FichaTeorica data={LECTURA_CRITICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="lcp-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── columna principal ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — tres niveles */}
          {modo === "niveles" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {TEXTOS.map((t, i) => {
                  const listo = t.preguntas.every((p) => !!clasif[p.id] && resp[p.id] === true);
                  return (
                    <button
                      key={t.id}
                      className="lcp-doc"
                      data-on={txtIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setTxtIdx(i);
                        setSelPreg(null);
                        setErrNivel(null);
                        setLineaMal(null);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : t.icono}`} />
                      {t.genero}
                    </button>
                  );
                })}
                <span style={{ fontSize: 12.5, fontWeight: 800, color: responderDone ? OK : T.text3, alignSelf: "center", marginLeft: 4 }}>
                  {respondidas}/{TOTAL_PREGUNTAS} respondidas
                </span>
              </div>

              {/* el texto con líneas numeradas */}
              <div style={{ ...card, padding: "20px 22px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <i className={`fa-solid ${texto.icono}`} style={{ color: accent, fontSize: 15 }} />
                  <span style={{ fontSize: 16, fontWeight: 900 }}>{texto.titulo}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{texto.genero}</span>
                </div>
                <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 14 }}>{texto.credito}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {texto.lineas.map((l) => {
                    const esRespuesta = texto.preguntas.some((p) => p.nivel === "literal" && resp[p.id] === true && p.lineaRespuesta === l.id);
                    const clicable = !!literalPendiente;
                    return (
                      <button
                        key={l.id}
                        className="lcp-linea"
                        data-clic={clicable}
                        data-hit={esRespuesta}
                        data-bad={lineaMal === l.id}
                        disabled={!clicable}
                        onClick={() => clicLinea(l.id)}
                      >
                        <span className="lcp-num" style={esRespuesta ? { background: `${OK}33`, color: OK } : undefined}>
                          {l.n}
                        </span>
                        <span>{l.texto}</span>
                      </button>
                    );
                  })}
                </div>

                {literalPendiente && (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 12,
                      border: `1px solid ${NIVEL_INFO.literal.color}55`,
                      background: `${NIVEL_INFO.literal.color}12`,
                      padding: "11px 15px",
                      fontSize: 12.5,
                      color: T.text2,
                      display: "flex",
                      gap: 11,
                      lineHeight: 1.55,
                    }}
                  >
                    <i className="fa-solid fa-hand-pointer" style={{ color: NIVEL_INFO.literal.color, marginTop: 2 }} />
                    <span>
                      <strong style={{ color: "#fff" }}>Nivel literal: </strong>
                      {literalPendiente.pregunta} Señala la línea que contiene la respuesta.
                      {lineaMal && <span style={{ color: NO, display: "block", marginTop: 5 }}>Esa línea no contiene la respuesta. Vuelve a leer la pregunta y busca el dato exacto.</span>}
                    </span>
                  </div>
                )}
                {textoResuelto && (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 12,
                      border: `1px solid ${OK}55`,
                      background: `${OK}12`,
                      padding: "12px 16px",
                      fontSize: 13,
                      color: T.text2,
                      display: "flex",
                      gap: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
                    <span>{texto.cierre}</span>
                  </div>
                )}
              </div>

              {/* paso 1 — clasificar las tres preguntas */}
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <Eyebrow>Paso 1 · ¿De qué nivel es cada pregunta?</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: textoClasificado ? OK : T.text3 }}>
                    {texto.preguntas.length - preguntasLibres.length}/{texto.preguntas.length}
                  </span>
                </div>
                {preguntasLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> Las tres preguntas están en su nivel. Ahora respóndelas abajo.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {preguntasLibres.map((p) => (
                      <button
                        key={p.id}
                        className="lcp-chip"
                        data-sel={selPreg === p.id}
                        onClick={() => setSelPreg((v) => (v === p.id ? null : p.id))}
                        {...dragProps(p.id)}
                      >
                        <i className="fa-solid fa-circle-question" style={{ fontSize: 11, color: T.text3, marginTop: 3 }} />
                        {p.pregunta}
                      </button>
                    ))}
                  </div>
                )}
                {errNivel && (
                  <div style={{ marginTop: 13, borderRadius: 12, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "11px 15px", display: "flex", gap: 11 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 15, marginTop: 2 }} />
                    <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                      <strong style={{ color: "#fff" }}>Ahí no. </strong>
                      {ERROR_POR_NIVEL[errNivel.nivel]}
                    </span>
                  </div>
                )}
              </div>

              {/* paso 2 — las tres columnas con su forma de responder */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(255px,1fr))", gap: 12 }}>
                {NIVELES.map((nivel) => {
                  const info = NIVEL_INFO[nivel];
                  const dentro = texto.preguntas.filter((p) => clasif[p.id] === nivel);
                  return (
                    <div
                      key={nivel}
                      className="lcp-col"
                      data-shake={shakeCol === nivel}
                      onClick={() => selPreg && clasificarPregunta(selPreg, nivel)}
                      style={{
                        borderColor: `${info.color}44`,
                        backgroundImage: `radial-gradient(120% 90% at 0% 0%, ${info.color}1a 0%, transparent 62%)`,
                      }}
                      {...dragOverProps}
                      onDrop={(e) => {
                        const id = idArrastrado(e);
                        if (id) clasificarPregunta(id, nivel);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                        <i className={`fa-solid ${info.icono}`} style={{ color: info.color }} />
                        <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.descripcion}</div>

                      {dentro.length === 0 ? (
                        <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí la pregunta…</div>
                      ) : (
                        dentro.map((p) => (
                          <div key={p.id} style={{ animation: "lcpPop .25s ease", display: "flex", flexDirection: "column", gap: 9 }}>
                            <div
                              style={{
                                padding: "9px 12px",
                                borderRadius: 11,
                                background: `${info.color}18`,
                                border: `1px solid ${info.color}55`,
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: "#fff",
                                lineHeight: 1.45,
                              }}
                            >
                              {p.pregunta}
                              <div style={{ fontSize: 11.5, fontWeight: 500, color: T.text3, marginTop: 6 }}>{p.porque}</div>
                            </div>

                            {p.nivel === "literal" ? (
                              <>
                              <div style={{ fontSize: 12, color: resp[p.id] ? OK : T.text3, lineHeight: 1.5, display: "flex", gap: 8 }}>
                                <i className={`fa-solid ${resp[p.id] ? "fa-circle-check" : "fa-arrow-up"}`} style={{ marginTop: 2 }} />
                                <span>
                                  {resp[p.id]
                                    ? "Respondida sin interpretar nada: la respuesta estaba escrita, palabra por palabra."
                                    : info.comoSeResponde}
                                </span>
                              </div>
                              {resp[p.id] && (
                                <div
                                  style={{
                                    borderRadius: 11,
                                    border: `1px solid ${OK}44`,
                                    background: `${OK}10`,
                                    padding: "10px 13px",
                                    fontSize: 12,
                                    color: T.text2,
                                    lineHeight: 1.55,
                                    fontStyle: "italic",
                                  }}
                                >
                                  <i className="fa-solid fa-quote-left" style={{ fontSize: 9, marginRight: 7, color: OK }} />
                                  {texto.lineas.find((l) => l.id === p.lineaRespuesta)?.texto}
                                </div>
                              )}
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45 }}>{info.comoSeResponde}</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  {(p.opciones ?? []).map((o) => {
                                    const marcada = elegida[p.id] === o.id;
                                    const buena = resp[p.id] === true && o.correcta;
                                    const mala = marcada && !o.correcta;
                                    return (
                                      <div key={o.id}>
                                        <button
                                          className="lcp-opt"
                                          data-ok={buena}
                                          data-bad={mala}
                                          disabled={resp[p.id] === true}
                                          onClick={() => elegirOpcion(p.id, o.id, o.correcta)}
                                        >
                                          {o.texto}
                                        </button>
                                        {(buena || mala) && (
                                          <div
                                            style={{
                                              marginTop: 6,
                                              fontSize: 11.5,
                                              color: T.text2,
                                              lineHeight: 1.5,
                                              display: "flex",
                                              gap: 8,
                                              padding: "0 4px",
                                            }}
                                          >
                                            <i
                                              className={`fa-solid ${buena ? "fa-circle-check" : "fa-circle-xmark"}`}
                                              style={{ color: buena ? OK : NO, marginTop: 2, flexShrink: 0 }}
                                            />
                                            <span>{o.porque}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* MODO 2 — el supuesto oculto */}
          {modo === "supuesto" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {SUPUESTOS.map((a, i) => (
                  <button key={a.id} className="lcp-paso" data-on={sIdx === i} data-done={supOk[a.id] === true} onClick={() => setSIdx(i)}>
                    {supOk[a.id] === true ? <i className="fa-solid fa-check" /> : i + 1}
                  </button>
                ))}
                <span style={{ fontSize: 12.5, fontWeight: 800, color: supuestoDone ? OK : T.text3, marginLeft: 4 }}>
                  {Object.keys(supOk).length}/{SUPUESTOS.length}
                </span>
              </div>

              <div style={{ ...card, padding: "22px 24px 24px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-puzzle-piece" style={{ marginRight: 8, color: accent }} />
                  {arg.etiqueta}
                </Eyebrow>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  <div style={{ borderRadius: 13, border: `1px solid ${T.line}`, background: T.inset, padding: "13px 16px" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>
                      Premisa
                    </div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.55 }}>{arg.premisa}</div>
                  </div>
                  <div style={{ textAlign: "center", color: supOk[arg.id] ? OK : T.text3, fontSize: 15 }}>
                    <i className="fa-solid fa-arrow-down-long" />
                    <span style={{ fontSize: 11.5, marginLeft: 9, fontWeight: 700 }}>
                      {supOk[arg.id] ? "el puente que faltaba" : "¿qué hace falta aquí para que el paso se sostenga?"}
                    </span>
                  </div>
                  <div
                    style={{
                      borderRadius: 13,
                      border: `1px solid rgba(${color.rgba},0.34)`,
                      background: `rgba(${color.rgba},0.09)`,
                      padding: "13px 16px",
                    }}
                  >
                    <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>
                      Conclusión
                    </div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.55 }}>{arg.conclusion}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 12, lineHeight: 1.55 }}>
                  ¿Cuál de estas tres ideas es la que el autor NO argumenta pero necesita que aceptes?
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {arg.opciones.map((o) => {
                    const marcada = supSel[arg.id] === o.id;
                    const buena = argOk && o.tipo === "supuesto";
                    const mala = marcada && o.tipo !== "supuesto";
                    return (
                      <div key={o.id}>
                        <button className="lcp-opt" data-ok={buena} data-bad={mala} disabled={argOk} onClick={() => elegirSupuesto(o.id, o.tipo === "supuesto")}>
                          {o.texto}
                        </button>
                        {(buena || mala) && (
                          <div style={{ marginTop: 7, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 9, padding: "0 4px" }}>
                            <i className={`fa-solid ${buena ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: buena ? OK : NO, marginTop: 2, flexShrink: 0 }} />
                            <span>{o.porque}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {argOk && (
                  <div
                    style={{
                      marginTop: 16,
                      borderRadius: 13,
                      border: `1px solid ${OK}55`,
                      background: `${OK}12`,
                      padding: "13px 16px",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <i className="fa-solid fa-scissors" style={{ color: OK, fontSize: 15, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>
                      <strong style={{ color: "#fff" }}>Si lo rechazas: </strong>
                      {arg.siLoRechazas}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                  <button
                    className="lcp-btn"
                    data-primary={argOk && sIdx < SUPUESTOS.length - 1}
                    onClick={() => setSIdx((i) => Math.min(i + 1, SUPUESTOS.length - 1))}
                    disabled={sIdx >= SUPUESTOS.length - 1}
                  >
                    Siguiente argumento
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* MODO 3 — quién habla y desde dónde */}
          {modo === "emisor" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {CASOS.map((c, i) => {
                  const listo = intOk[c.id] === true && c.reacciones.every((r) => !!reacUbic[r.id]);
                  return (
                    <button key={c.id} className="lcp-paso" data-on={cIdx === i} data-done={listo} onClick={() => { setCIdx(i); setSelReac(null); }}>
                      {listo ? <i className="fa-solid fa-check" /> : i + 1}
                    </button>
                  );
                })}
                <span style={{ fontSize: 12.5, fontWeight: 800, color: interesesDone && reaccionesDone ? OK : T.text3, marginLeft: 4 }}>
                  {Object.keys(reacUbic).length}/{TOTAL_REACCIONES} reacciones
                </span>
              </div>

              <div style={{ ...card, padding: "20px 22px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6, flexWrap: "wrap" }}>
                  <i className={`fa-solid ${caso.icono}`} style={{ color: accent, fontSize: 16 }} />
                  <span style={{ fontSize: 14.5, fontWeight: 900 }}>{caso.emisor}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{caso.desde}</span>
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: T.text, padding: "12px 16px", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
                  {caso.texto}
                </div>

                <div style={{ marginTop: 18 }}>
                  <Eyebrow>Paso 1 · ¿A quién le conviene que aceptes «{caso.conclusion}»?</Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {caso.intereses.map((o) => {
                      const marcada = intSel[caso.id] === o.id;
                      const buena = casoIntOk && o.correcto;
                      const mala = marcada && !o.correcto;
                      return (
                        <div key={o.id}>
                          <button className="lcp-opt" data-ok={buena} data-bad={mala} disabled={casoIntOk} onClick={() => elegirInteres(o.id, o.correcto)}>
                            {o.texto}
                          </button>
                          {(buena || mala) && (
                            <div style={{ marginTop: 7, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 9, padding: "0 4px" }}>
                              <i className={`fa-solid ${buena ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: buena ? OK : NO, marginTop: 2, flexShrink: 0 }} />
                              <span>{o.porque}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: "18px 22px", opacity: casoIntOk ? 1 : 0.55 }}>
                <Eyebrow>Paso 2 · ¿Cuál de estas dos reacciones critica el argumento?</Eyebrow>
                {!casoIntOk ? (
                  <div style={{ fontSize: 13, color: T.text3, lineHeight: 1.55 }}>
                    Primero decide a quién le conviene la conclusión. Con el interés del emisor a la vista se ve mejor la diferencia entre revisar el
                    argumento y descalificar a quien lo firma.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {caso.reacciones.filter((r) => !reacUbic[r.id]).length === 0 ? (
                      <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                        <i className="fa-solid fa-circle-check" /> Las dos reacciones de este caso están clasificadas.
                      </div>
                    ) : (
                      caso.reacciones
                        .filter((r) => !reacUbic[r.id])
                        .map((r) => (
                          <button key={r.id} className="lcp-chip" data-sel={selReac === r.id} onClick={() => setSelReac((v) => (v === r.id ? null : r.id))} {...dragProps(r.id)}>
                            <i className="fa-solid fa-comment" style={{ fontSize: 11, color: T.text3, marginTop: 3 }} />
                            {r.texto}
                          </button>
                        ))
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(255px,1fr))", gap: 12 }}>
                {TIPOS_REACCION.map((tipo) => {
                  const info = REACCION_INFO[tipo];
                  const dentro = caso.reacciones.filter((r) => reacUbic[r.id] === tipo);
                  return (
                    <div
                      key={tipo}
                      className="lcp-col"
                      data-shake={shakeReac === tipo}
                      onClick={() => selReac && ubicarReaccion(selReac, tipo)}
                      style={{
                        borderColor: `${info.color}44`,
                        backgroundImage: `radial-gradient(120% 90% at 0% 0%, ${info.color}1a 0%, transparent 62%)`,
                      }}
                      {...dragOverProps}
                      onDrop={(e) => {
                        const id = idArrastrado(e);
                        if (id) ubicarReaccion(id, tipo);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                        <i className={`fa-solid ${info.icono}`} style={{ color: info.color }} />
                        <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.descripcion}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        {dentro.length === 0 ? (
                          <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
                        ) : (
                          dentro.map((r) => (
                            <div
                              key={r.id}
                              style={{
                                animation: "lcpPop .25s ease",
                                padding: "9px 12px",
                                borderRadius: 11,
                                background: `${info.color}18`,
                                border: `1px solid ${info.color}55`,
                                lineHeight: 1.45,
                              }}
                            >
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", display: "flex", gap: 7 }}>
                                <i className="fa-solid fa-check" style={{ fontSize: 10, color: info.color, marginTop: 4 }} />
                                <span>{r.texto}</span>
                              </div>
                              <div style={{ fontSize: 11.5, color: T.text3, marginTop: 5, paddingLeft: 17 }}>{r.porque}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  borderRadius: 16,
                  padding: "14px 18px",
                  border: `1px solid ${T.line}`,
                  background: T.glass,
                  fontSize: 12.5,
                  color: T.text2,
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 12,
                }}
              >
                <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 15, marginTop: 2 }} />
                <span>{NOTA_EMISOR}</span>
              </div>
            </>
          )}

          {/* MODO 4 — toma postura */}
          {modo === "postura" && (
            <>
              <div style={{ ...card, padding: "20px 22px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <i className="fa-solid fa-book" style={{ color: accent, fontSize: 15 }} />
                  <span style={{ fontSize: 16, fontWeight: 900 }}>{TEXTO_POSTURA.titulo}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{TEXTO_POSTURA.genero}</span>
                </div>
                <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 14 }}>{TEXTO_POSTURA.credito}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {TEXTO_POSTURA.lineas.map((l) => {
                    const sel = lineasSel.includes(l.id);
                    const usada = postura !== null && posturaYaOk && postura.apoyo.includes(l.id);
                    const clicable = postura !== null && !posturaYaOk;
                    return (
                      <button
                        key={l.id}
                        className="lcp-linea"
                        data-clic={clicable}
                        data-sel={sel}
                        data-hit={usada}
                        disabled={!clicable}
                        onClick={() => togglaLinea(l.id)}
                      >
                        <span className="lcp-num" style={usada ? { background: `${OK}33`, color: OK } : sel ? { background: `rgba(${color.rgba},0.3)`, color: "#fff" } : undefined}>
                          {l.n}
                        </span>
                        <span>{l.texto}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ ...card, padding: "18px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
                  Paso 1 · Elige tu postura frente a este texto
                </Eyebrow>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                  {TEXTO_POSTURA.posturas.map((p) => {
                    const on = posSel === p.id;
                    const listo = posOk[p.id] === true;
                    return (
                      <button
                        key={p.id}
                        className="lcp-btn"
                        onClick={() => elegirPostura(p.id)}
                        style={
                          listo
                            ? { borderColor: OK, background: `${OK}1c`, boxShadow: on ? `0 0 0 2px ${OK}44` : "none" }
                            : on
                              ? { borderColor: p.color, background: `${p.color}1f`, boxShadow: `0 0 18px -7px ${p.color}` }
                              : undefined
                        }
                      >
                        <i className={`fa-solid ${listo ? "fa-circle-check" : p.icono}`} />
                        {p.etiqueta}
                      </button>
                    );
                  })}
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: posturaDone ? OK : T.text3, alignSelf: "center", marginLeft: 4 }}>
                    {Object.keys(posOk).length}/{TEXTO_POSTURA.posturas.length} sostenidas
                  </span>
                </div>

                {!postura ? (
                  <div style={{ fontSize: 13, color: T.text3, lineHeight: 1.6 }}>
                    Las tres son defendibles: ninguna es la «correcta». Elige una y después sostenla con el texto.
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        borderRadius: 13,
                        border: `1px solid ${postura.color}55`,
                        background: `${postura.color}12`,
                        padding: "12px 16px",
                        fontSize: 14,
                        lineHeight: 1.55,
                        marginBottom: 14,
                      }}
                    >
                      «{postura.enunciado}»
                    </div>

                    <Eyebrow>Paso 2 · Señala las DOS líneas del texto que la respaldan</Eyebrow>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12.5, color: T.text3, fontWeight: 700 }}>
                        {posturaYaOk ? "Postura sostenida" : `${lineasSel.length}/2 líneas elegidas`}
                      </span>
                      <button className="lcp-btn" data-primary={lineasSel.length === 2 && !posturaYaOk} onClick={sostener} disabled={posturaYaOk || lineasSel.length !== 2}>
                        <i className="fa-solid fa-gavel" />
                        Sostener la postura
                      </button>
                    </div>

                    {posMsg && (
                      <div
                        style={{
                          marginTop: 14,
                          borderRadius: 13,
                          border: `1px solid ${posMsg.ok ? OK : NO}55`,
                          background: `${posMsg.ok ? OK : NO}12`,
                          padding: "13px 16px",
                          display: "flex",
                          gap: 12,
                        }}
                      >
                        <i className={`fa-solid ${posMsg.ok ? "fa-circle-check" : "fa-circle-exclamation"}`} style={{ color: posMsg.ok ? OK : NO, fontSize: 16, marginTop: 2 }} />
                        <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{posMsg.texto}</span>
                      </div>
                    )}
                  </>
                )}

                <div style={{ marginTop: 16, fontSize: 12, color: T.text3, lineHeight: 1.6, display: "flex", gap: 11 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
                  <span>{NOTA_POSTURA}</span>
                </div>
              </div>
            </>
          )}

          {/* MODO 5 — escribe el término (A5 verbatim) */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y su ejemplo, y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {/* MODO 6 — completa el texto (A6 verbatim) */}
          {modo === "texto" && (
            <CompletaTexto
              key={huecosIntento}
              data={LECTURA_CRITICA_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={huecosDone}
              onCompletado={() => {
                setHuecosDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}
        </div>

        {/* ── columna lateral ─────────────────────────────────────────── */}
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
              {modo === "niveles" && (
                <>
                  Pregúntate cómo tendrías que contestar: si basta <strong style={{ color: T.text }}>copiar</strong>, es literal; si hay que{" "}
                  <strong style={{ color: T.text }}>deducir</strong> lo que el texto no dice, es inferencial; si hay que decidir si el texto{" "}
                  <strong style={{ color: T.text }}>prueba</strong> lo que afirma, es crítica.
                </>
              )}
              {modo === "supuesto" && <>{PISTA_SUPUESTO}</>}
              {modo === "emisor" && (
                <>
                  Saber quién firma <strong style={{ color: T.text }}>orienta la sospecha</strong>, no la resuelve. La crítica que vale responde a las
                  razones del texto; la que solo ataca a quien escribe deja el argumento intacto.
                </>
              )}
              {modo === "postura" && (
                <>
                  Una postura sin líneas que la respalden no está «mal de gusto»: está <strong style={{ color: T.text }}>sin sustento</strong>. Las tres
                  posturas de aquí son defendibles, pero cada una necesita SUS dos líneas.
                </>
              )}
              {modo === "glosario" && (
                <>
                  Estos seis términos son los del glosario de la progresión. Si te atoras, la pista te da la inicial y el número de letras, y el banco te
                  deja tocar el término.
                </>
              )}
              {modo === "texto" && (
                <>
                  Ya no se toca: se escribe. Si te atoras, el botón de pista te da la definición y el banco de palabras te deja tocar el término en vez de
                  teclearlo.
                </>
              )}
            </span>
          </div>

          {/* pistas de la reflexión A3, verbatim */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
              Pistas para tu reflexión escrita
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
              {PISTAS_A3.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          {/* recuadro verbatim de A1 */}
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
        </div>
      </div>

      {/* ── lectura A1 y hechos A4, verbatim ────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: accent }} />
            Lectura A1 · {LECTURA_A1_TITULO}
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: T.text2, lineHeight: 1.65 }}>
            {MARCO.map((p, i) => (
              <p key={i} style={{ margin: 0 }}>
                {p}
              </p>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: T.text3, marginBottom: 10 }}>
              Preguntas de comprensión
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {PREGUNTAS_A1.map((q, i) => (
                <div key={i} style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                  <div style={{ color: T.text, fontWeight: 700 }}>{q.pregunta}</div>
                  <div style={{ color: T.text3, marginTop: 3 }}>{q.respuesta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-check-double" style={{ marginRight: 8, color: accent }} />
            Hechos
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HECHOS.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 11 }}>
                <i
                  className={`fa-solid ${h.verdadero ? "fa-circle-check" : "fa-circle-xmark"}`}
                  style={{ color: h.verdadero ? OK : NO, fontSize: 14, marginTop: 3, flexShrink: 0 }}
                />
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <div style={{ color: T.text }}>{h.enunciado}</div>
                  <div style={{ color: T.text3, marginTop: 3 }}>{h.retro}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}`, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", gap: 11 }}>
            <i className="fa-solid fa-flag-checkered" style={{ color: accent, marginTop: 2 }} />
            <span>
              <strong style={{ color: T.text }}>Para cerrar: </strong>
              {ACTIVIDAD_FINAL_A5}
            </span>
          </div>
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
        mensajeAprobado="Ya no te quedas en lo literal: infieres y evalúas lo que lees."
      />

      {/* ── nota al pie ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 18, display: "flex", gap: 12, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Son <strong>verbatim</strong> de la progresión LC-III-P01: la lectura y el recuadro de A1 con sus preguntas de comprensión, el quiz evaluable de
          A2, las pistas de A3, los hechos de A4, el glosario y la actividad de cierre de A5, y el texto con huecos de A6. En cambio, <strong>todos los
          textos que aquí se leen y se critican</strong> —el boletín escolar, la carta vecinal, la entrada de blog, los cinco argumentos, los cuatro textos
          firmados y el acta de la biblioteca— los escribí para esta práctica y son <strong>ilustrativos</strong>: sus autores, empresas, asociaciones,
          planteles y cifras son <strong>ficticios a propósito</strong>, porque el objetivo es aprender a evaluar un argumento y no a juzgar la credibilidad
          de un medio, una institución o una persona reales. El único dato real y externo es el del recuadro de A1: Octavio Paz recibió el Premio Nobel de
          Literatura en 1990 y publicó El laberinto de la soledad en 1950. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}
