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
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { LECTURA_CRITICA_HUECOS } from "./lectura-critica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
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
import { VinetaTermino } from "./_vineta";
import {
  COLUMNAS,
  MARCA_INFO,
  ERROR_MARCA,
  solidez,
  type ColumnaOpinion,
  type Decision,
  type Marca,
  type OpcionDecision,
} from "./lectura-critica-columna";

const NO = "#FF5E5E";
const RETO_KEY = "cen-lectura-critica-postura-reto";
const RUTA_SIM = "/media/labs-sim/lectura-critica-postura";

type Modo = "columna" | "niveles" | "supuesto" | "emisor" | "postura" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "columna", label: "Lee la columna", icono: "fa-newspaper" },
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

  /* ── MODO 0 · lee la columna (simulador) ──────────────────────────────── */
  const [colIdx, setColIdx] = useState(0);
  const [marcasCol, setMarcasCol] = useState<Record<string, Marca>>({});
  const [selFrase, setSelFrase] = useState<string | null>(null);
  const [malMarca, setMalMarca] = useState<string | null>(null);
  const [decElegida, setDecElegida] = useState<Record<string, Decision>>({});
  const [decOk, setDecOk] = useState<Record<string, boolean>>({});
  const columna = COLUMNAS[colIdx]!;
  const columnaMarcada = columna.frases.every((f) => !!marcasCol[f.id]);
  const sol = solidez(columna, marcasCol);
  const columna1Marcada = COLUMNAS[0]!.frases.every((f) => !!marcasCol[f.id]);
  const columnasDone = COLUMNAS.every((c) => decOk[c.id] === true);

  const marcarFrase = (marca: Marca) => {
    if (!selFrase || marcasCol[selFrase]) return;
    const f = columna.frases.find((x) => x.id === selFrase);
    if (!f) return;
    if (f.marca === marca) {
      setMarcasCol((m) => ({ ...m, [f.id]: marca }));
      setSelFrase(null);
      setMalMarca(null);
      sfxPlace();
    } else {
      setMalMarca(f.id);
      sfxNo();
    }
  };

  const decidir = (op: OpcionDecision) => {
    if (decOk[columna.id]) return;
    setDecElegida((d) => ({ ...d, [columna.id]: op.id }));
    if (op.correcta) {
      setDecOk((d) => ({ ...d, [columna.id]: true }));
      sfxPlace();
      sfxOk();
    } else {
      sfxNo();
    }
  };

  const resetColumna = () => {
    const ids = new Set(COLUMNAS.flatMap((c) => c.frases.map((f) => f.id)));
    setMarcasCol((m) => Object.fromEntries(Object.entries(m).filter(([k]) => !ids.has(k))));
    setDecElegida({});
    setDecOk({});
    setSelFrase(null);
    setMalMarca(null);
    setColIdx(0);
  };

  /* ── objetivos ────────────────────────────────────────────────────────── */
  const todoHecho =
    clasificarDone && responderDone && supuestoDone && interesesDone && reaccionesDone && posturaDone && glosarioDone && huecosDone;

  const objetivos = [
    { txt: "Marca cada frase de la columna sobre las tabletas", done: columna1Marcada },
    { txt: "Decide qué hacer con la conclusión de las dos columnas", done: columnasDone },
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
    modo === "columna"
      ? resetColumna
      : modo === "niveles"
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

  const lectura =
    modo === "columna" ? (
      <>Solidez: {sol === null ? "sin medir" : `${sol} %`} · Frases: {Object.keys(marcasCol).length}/{COLUMNAS.reduce((n, c) => n + c.frases.length, 0)}</>
    ) : modo === "niveles" ? (
      <>Respondidas: {respondidas}/{TOTAL_PREGUNTAS}</>
    ) : modo === "supuesto" ? (
      <>Supuestos hallados: {Object.keys(supOk).length}/{SUPUESTOS.length}</>
    ) : modo === "emisor" ? (
      <>Reacciones clasificadas: {Object.keys(reacUbic).length}/{TOTAL_REACCIONES}</>
    ) : modo === "postura" ? (
      <>Posturas sostenidas: {Object.keys(posOk).length}/{TEXTO_POSTURA.posturas.length}</>
    ) : (
      <>Repaso de los términos de la lectura crítica</>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <style>{`
        @keyframes lcpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes lcpPop { 0%{transform:scale(.72);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .lcp-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .lcp-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .lcp-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .lcp-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .lcp-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .lcp-icobtn:hover { background:rgba(255,255,255,0.12); }

        .lcp-doc { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
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
          font-size:14px; font-weight:900; background:rgba(255,255,255,0.08); color:${T.text3}; margin-top:2px; }

        /* Fichas arrastrables */
        .lcp-chip { cursor:grab; display:inline-flex; align-items:flex-start; gap:9px; padding:11px 15px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s;
          user-select:none; max-width:100%; text-align:left; line-height:1.45; }
        .lcp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .lcp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .lcp-chip:active { cursor:grabbing; }

        /* Columnas: su color lo pone el propio nivel desde el JSX. */
        .lcp-col { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px; transition:all .16s; min-height:170px; }
        .lcp-col[data-shake="true"] { animation:lcpShake .4s; border-color:${NO}; }

        /* Opciones de respuesta */
        .lcp-opt { cursor:pointer; display:block; width:100%; text-align:left; padding:11px 14px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:600; line-height:1.5; transition:all .14s; }
        .lcp-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
        .lcp-opt:disabled { cursor:default; }
        .lcp-opt[data-ok="true"] { border-color:${OK}; background:${OK}18; }
        .lcp-opt[data-bad="true"] { border-color:${NO}; background:${NO}14; }

        .lcp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .lcp-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .lcp-btn:disabled { opacity:.45; cursor:default; }
        .lcp-btn[data-primary="true"] { background:${accent}; color:#04121f; border-color:${accent}; }
        .lcp-paso { cursor:pointer; width:30px; height:30px; border-radius:9px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text3}; font-size:14px; font-weight:900; transition:all .14s; }
        .lcp-paso:hover { border-color:${T.lineStrong}; color:#fff; }
        .lcp-paso[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .lcp-paso[data-done="true"] { color:${OK}; border-color:${OK}66; }
        @media (prefers-reduced-motion: reduce){
          .lcp-linea[data-bad="true"], .lcp-col[data-shake="true"] { animation:none; }
          .lcp-chip, .lcp-chip:hover, .lcp-chip[data-sel="true"] { transform:none; }
        }

        .lcp-foto { position:relative; width:100%; aspect-ratio:16/9; max-height:200px; border-radius:12px; overflow:hidden; margin-bottom:12px;
          background:linear-gradient(135deg, rgba(${color.rgba},0.28), rgba(255,255,255,0.04)); display:flex; align-items:center; justify-content:center; }
        .lcp-foto > i { font-size:38px; color:rgba(255,255,255,0.35); }
        .lcp-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .lcp-por { margin:4px 0 4px 36px; font-size:14px; line-height:1.5; color:${T.text2}; }
        .lcp-marcas { margin:6px 0 6px 36px; display:flex; flex-direction:column; gap:8px; }
        .lcp-marcas-fila { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
        .lcp-conclusion { margin-top:8px; padding:12px 14px; border-radius:12px; border:1.5px solid ${accent}88; background:rgba(${color.rgba},0.1);
          font-size:15px; font-weight:800; line-height:1.5; display:flex; flex-direction:column; gap:4px; }
        .lcp-conclusion span { font-size:14px; font-weight:700; color:${T.text3}; }
        .lcp-vis { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px 14px; }
        .lcp-medidor { margin-top:6px; }
        .lcp-medidor-cab { display:flex; justify-content:space-between; gap:10px; font-size:15px; font-weight:800; color:${T.text}; margin-bottom:6px; }
        .lcp-medidor-barra { position:relative; height:12px; border-radius:8px; background:linear-gradient(90deg,#FF8A5E 0%,#FFC75A 50%,${OK} 100%); }
        .lcp-medidor-barra > i { position:absolute; top:-5px; width:6px; height:22px; margin-left:-3px; border-radius:3px; background:#fff; box-shadow:0 0 0 2px #04121f; transition:left .5s ease; }
        .lcp-medidor-pie { display:flex; justify-content:space-between; gap:10px; margin-top:6px; font-size:14px; color:${T.text3}; }
        @media (prefers-reduced-motion: reduce){ .lcp-medidor-barra > i { transition:none; } }
          `}</style>

          {/* MODO 0 — lee la columna */}
          {modo === "columna" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {COLUMNAS.map((c, i) => {
                  const listo = decOk[c.id] === true;
                  return (
                    <button
                      key={c.id}
                      className="lcp-doc"
                      data-on={colIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setColIdx(i);
                        setSelFrase(null);
                        setMalMarca(null);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-newspaper"}`} />
                      Columna {i + 1}
                    </button>
                  );
                })}
              </div>

              <ArgumentoVisual col={columna} marcas={marcasCol} sol={sol} />

              <div style={{ ...card, padding: "18px 20px" }}>
                <div className="lcp-foto">
                  <i className="fa-solid fa-newspaper" aria-hidden />
                  <img
                    src={`${RUTA_SIM}/${columna.imagen}.webp`}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.3 }}>{columna.titulo}</div>
                <div style={{ fontSize: 14, color: T.text3, margin: "4px 0 12px" }}>
                  Por {columna.firma} · {columna.diario}
                </div>
                <div style={{ fontSize: 14, color: T.text2, marginBottom: 10, lineHeight: 1.5 }}>
                  Toca una frase y dile al medidor qué es.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {columna.frases.map((f, i) => {
                    const m = marcasCol[f.id];
                    const sel = selFrase === f.id;
                    const info = m ? MARCA_INFO[m] : null;
                    return (
                      <div key={f.id}>
                        <button
                          className="lcp-linea"
                          data-clic={!m}
                          data-sel={sel}
                          disabled={!!m}
                          onClick={() => {
                            setSelFrase((v) => (v === f.id ? null : f.id));
                            setMalMarca(null);
                          }}
                          style={info ? { borderColor: `${info.color}66`, background: `${info.color}14` } : undefined}
                        >
                          <span className="lcp-num" style={info ? { background: `${info.color}33`, color: info.color } : undefined}>
                            {info ? <i className={`fa-solid ${info.icono}`} /> : i + 1}
                          </span>
                          <span>{f.texto}</span>
                        </button>
                        {m && info && (
                          <div className="lcp-por">
                            <strong style={{ color: info.color }}>{info.etiqueta}. </strong>
                            {f.porque}
                          </div>
                        )}
                        {sel && !m && (
                          <div className="lcp-marcas">
                            <div className="lcp-marcas-fila">
                              {(Object.keys(MARCA_INFO) as Marca[]).map((k) => (
                                <button key={k} className="lcp-btn" onClick={() => marcarFrase(k)} style={{ borderColor: `${MARCA_INFO[k].color}88` }}>
                                  <i className={`fa-solid ${MARCA_INFO[k].icono}`} style={{ color: MARCA_INFO[k].color }} />
                                  {MARCA_INFO[k].etiqueta}
                                </button>
                              ))}
                            </div>
                            {malMarca === f.id && (
                              <div role="alert" style={{ color: NO, fontSize: 14, lineHeight: 1.5 }}>
                                {ERROR_MARCA[f.marca]}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="lcp-conclusion">
                    <span>Conclusión del autor</span>
                    {columna.conclusion}
                  </div>
                </div>
              </div>

              {columnaMarcada && (
                <div style={{ ...card, padding: "18px 20px" }}>
                  <Eyebrow>
                    <i className="fa-solid fa-gavel" style={{ marginRight: 8, color: accent }} />
                    El medidor marca {sol ?? 0} %: ¿qué haces con la conclusión?
                  </Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {columna.decision.map((op) => {
                      const marcada = decElegida[columna.id] === op.id;
                      const buena = decOk[columna.id] === true && op.correcta;
                      const mala = marcada && !op.correcta;
                      return (
                        <div key={op.id}>
                          <button className="lcp-opt" data-ok={buena} data-bad={mala} disabled={decOk[columna.id] === true} onClick={() => decidir(op)}>
                            {op.texto}
                          </button>
                          {(buena || mala) && (
                            <div style={{ marginTop: 7, fontSize: 14, color: T.text2, lineHeight: 1.55, display: "flex", gap: 9, padding: "0 4px" }}>
                              <i className={`fa-solid ${buena ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: buena ? OK : NO, marginTop: 3, flexShrink: 0 }} />
                              <span>{op.porque}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {decOk[columna.id] === true && (
                    <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "12px 16px", fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                      {columna.cierre}
                      {colIdx < COLUMNAS.length - 1 && (
                        <div style={{ marginTop: 10 }}>
                          <button
                            className="lcp-btn"
                            data-primary="true"
                            onClick={() => {
                              setColIdx(colIdx + 1);
                              setSelFrase(null);
                              setMalMarca(null);
                            }}
                          >
                            Leer la columna {colIdx + 2}
                            <i className="fa-solid fa-arrow-right" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

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
                <span style={{ fontSize: 14, fontWeight: 800, color: responderDone ? OK : T.text3, alignSelf: "center", marginLeft: 4 }}>
                  {respondidas}/{TOTAL_PREGUNTAS} respondidas
                </span>
              </div>

              {/* el texto con líneas numeradas */}
              <div style={{ ...card, padding: "20px 22px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <VinetaTermino termino={texto.titulo} color={accent} icono={texto.icono} tam={33} radio={9} />
                  <span style={{ fontSize: 16, fontWeight: 900 }}>{texto.titulo}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{texto.genero}</span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, marginBottom: 14 }}>{texto.credito}</div>

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
                      fontSize: 14,
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
                      fontSize: 14,
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

              <Mesa>
              {/* paso 1 — clasificar las tres preguntas */}
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <Eyebrow>Paso 1 · ¿De qué nivel es cada pregunta?</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: textoClasificado ? OK : T.text3 }}>
                    {texto.preguntas.length - preguntasLibres.length}/{texto.preguntas.length}
                  </span>
                </div>
                {preguntasLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
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
                        <i className="fa-solid fa-circle-question" style={{ fontSize: 14, color: T.text3, marginTop: 3 }} />
                        {p.pregunta}
                      </button>
                    ))}
                  </div>
                )}
                {errNivel && (
                  <div style={{ marginTop: 13, borderRadius: 12, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "11px 15px", display: "flex", gap: 11 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 15, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
                      <strong style={{ color: "#fff" }}>Ahí no. </strong>
                      {ERROR_POR_NIVEL[errNivel.nivel]}
                    </span>
                  </div>
                )}
              </div>

              {/* paso 2 — las tres columnas con su forma de responder */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,255px),1fr))", gap: 12 }}>
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
                        <VinetaTermino termino={info.titulo} color={info.color} icono={info.icono} tam={29} radio={8} />
                        <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
                      </div>
                      <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.descripcion}</div>

                      {dentro.length === 0 ? (
                        <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí la pregunta…</div>
                      ) : (
                        dentro.map((p) => (
                          <div key={p.id} style={{ animation: "lcpPop .25s ease", display: "flex", flexDirection: "column", gap: 9 }}>
                            <div
                              style={{
                                padding: "9px 12px",
                                borderRadius: 11,
                                background: `${info.color}18`,
                                border: `1px solid ${info.color}55`,
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#fff",
                                lineHeight: 1.45,
                              }}
                            >
                              {p.pregunta}
                              <div style={{ fontSize: 14, fontWeight: 500, color: T.text3, marginTop: 6 }}>{p.porque}</div>
                            </div>

                            {p.nivel === "literal" ? (
                              <>
                              <div style={{ fontSize: 14, color: resp[p.id] ? OK : T.text3, lineHeight: 1.5, display: "flex", gap: 8 }}>
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
                                    fontSize: 14,
                                    color: T.text2,
                                    lineHeight: 1.55,
                                    fontStyle: "italic",
                                  }}
                                >
                                  <i className="fa-solid fa-quote-left" style={{ fontSize: 14, marginRight: 7, color: OK }} />
                                  {texto.lineas.find((l) => l.id === p.lineaRespuesta)?.texto}
                                </div>
                              )}
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45 }}>{info.comoSeResponde}</div>
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
                                              fontSize: 14,
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
              </Mesa>
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
                <span style={{ fontSize: 14, fontWeight: 800, color: supuestoDone ? OK : T.text3, marginLeft: 4 }}>
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
                    <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>
                      Premisa
                    </div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.55 }}>{arg.premisa}</div>
                  </div>
                  <div style={{ textAlign: "center", color: supOk[arg.id] ? OK : T.text3, fontSize: 15 }}>
                    <i className="fa-solid fa-arrow-down-long" />
                    <span style={{ fontSize: 14, marginLeft: 9, fontWeight: 700 }}>
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
                    <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>
                      Conclusión
                    </div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.55 }}>{arg.conclusion}</div>
                  </div>
                </div>

                <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.55 }}>
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
                          <div style={{ marginTop: 7, fontSize: 14, color: T.text2, lineHeight: 1.55, display: "flex", gap: 9, padding: "0 4px" }}>
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
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
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
                <span style={{ fontSize: 14, fontWeight: 800, color: interesesDone && reaccionesDone ? OK : T.text3, marginLeft: 4 }}>
                  {Object.keys(reacUbic).length}/{TOTAL_REACCIONES} reacciones
                </span>
              </div>

              <div style={{ ...card, padding: "20px 22px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6, flexWrap: "wrap" }}>
                  <i className={`fa-solid ${caso.icono}`} style={{ color: accent, fontSize: 16 }} />
                  <span style={{ fontSize: 14.5, fontWeight: 900 }}>{caso.emisor}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{caso.desde}</span>
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
                            <div style={{ marginTop: 7, fontSize: 14, color: T.text2, lineHeight: 1.55, display: "flex", gap: 9, padding: "0 4px" }}>
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

              <Mesa>
              <div style={{ ...card, padding: "18px 22px", opacity: casoIntOk ? 1 : 0.55 }}>
                <Eyebrow>Paso 2 · ¿Cuál de estas dos reacciones critica el argumento?</Eyebrow>
                {!casoIntOk ? (
                  <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55 }}>
                    Primero decide a quién le conviene la conclusión. Con el interés del emisor a la vista se ve mejor la diferencia entre revisar el
                    argumento y descalificar a quien lo firma.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {caso.reacciones.filter((r) => !reacUbic[r.id]).length === 0 ? (
                      <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                        <i className="fa-solid fa-circle-check" /> Las dos reacciones de este caso están clasificadas.
                      </div>
                    ) : (
                      caso.reacciones
                        .filter((r) => !reacUbic[r.id])
                        .map((r) => (
                          <button key={r.id} className="lcp-chip" data-sel={selReac === r.id} onClick={() => setSelReac((v) => (v === r.id ? null : r.id))} {...dragProps(r.id)}>
                            <i className="fa-solid fa-comment" style={{ fontSize: 14, color: T.text3, marginTop: 3 }} />
                            {r.texto}
                          </button>
                        ))
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,255px),1fr))", gap: 12 }}>
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
                        <VinetaTermino termino={info.titulo} color={info.color} icono={info.icono} tam={29} radio={8} />
                        <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
                      </div>
                      <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.descripcion}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        {dentro.length === 0 ? (
                          <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
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
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", display: "flex", gap: 7 }}>
                                <i className="fa-solid fa-check" style={{ fontSize: 14, color: info.color, marginTop: 4 }} />
                                <span>{r.texto}</span>
                              </div>
                              <div style={{ fontSize: 14, color: T.text3, marginTop: 5, paddingLeft: 17 }}>{r.porque}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              </Mesa>

              <div
                style={{
                  borderRadius: 16,
                  padding: "14px 18px",
                  border: `1px solid ${T.line}`,
                  background: T.glass,
                  fontSize: 14,
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
                  <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{TEXTO_POSTURA.genero}</span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, marginBottom: 14 }}>{TEXTO_POSTURA.credito}</div>

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
                  <span style={{ fontSize: 14, fontWeight: 800, color: posturaDone ? OK : T.text3, alignSelf: "center", marginLeft: 4 }}>
                    {Object.keys(posOk).length}/{TEXTO_POSTURA.posturas.length} sostenidas
                  </span>
                </div>

                {!postura ? (
                  <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.6 }}>
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
                      <span style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>
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
                        <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{posMsg.texto}</span>
                      </div>
                    )}
                  </>
                )}

                <div style={{ marginTop: 16, fontSize: 14, color: T.text3, lineHeight: 1.6, display: "flex", gap: 11 }}>
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
      }
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Solidez" value={sol === null ? "sin medir" : `${sol} %`} col={sol !== null && sol >= 60 ? OK : undefined} />
                  <Dato label="Errores" value={String(partida.errores)} />
                </div>
              </Bloque>
              <Bloque titulo="Cómo leerlo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "columna" && (
                <>
                  Una frase pesa por lo que se puede <strong style={{ color: T.text }}>comprobar</strong>: busca quién lo midió y dónde verlo. Las opiniones no
                  suman ni restan.
                </>
              )}
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
                </p>
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
              quiz={QUIZ}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Ya no te quedas en lo literal: infieres y evalúas lo que lees."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo={`Lectura A1 · ${LECTURA_A1_TITULO}`} icono="fa-book-open">
                {MARCO.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    {p}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Preguntas de comprensión" icono="fa-circle-question">
                {PREGUNTAS_A1.map((q, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{q.pregunta}</strong> {q.respuesta}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_PAZ}</p>
              </Bloque>
              <Bloque titulo="Hechos" icono="fa-check-double">
                {HECHOS.map((h, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <i className={`fa-solid ${h.verdadero ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: h.verdadero ? OK : NO, marginRight: 8 }} />
                    <strong style={{ color: T.text }}>{h.enunciado}</strong> {h.retro}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Pistas para tu reflexión escrita" icono="fa-pen-nib">
                {PISTAS_A3.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    {p}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Para cerrar" icono="fa-flag-checkered">
                <p style={{ margin: 0, color: T.text2 }}>{ACTIVIDAD_FINAL_A5}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={LECTURA_CRITICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Sobre los textos" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>
                  Son verbatim de LC-III-P01: la lectura y el recuadro de A1, el quiz de A2, las pistas de A3, los hechos de A4, el glosario y el cierre de A5 y
                  el texto con huecos de A6. Los textos que se critican aquí (las columnas, el boletín, los argumentos y los casos) son ilustrativos: sus autores,
                  diarios, planteles y cifras son ficticios a propósito (las cifras son simulación). El único dato real es el de Octavio Paz. Fuente: {FUENTE}
                </p>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Pilares del argumento + medidor de solidez (reaccionan a cada marca).
 * ═══════════════════════════════════════════════════════════════════════════ */
function ArgumentoVisual({ col, marcas, sol }: { col: ColumnaOpinion; marcas: Record<string, Marca>; sol: number | null }) {
  const premisas = col.frases.filter((f) => f.peso > 0);
  const anchos = premisas.map((f) => 22 + f.peso * 10);
  const total = anchos.reduce((n, w) => n + w, 0) + (premisas.length - 1) * 14;
  const xs = anchos.map((_, i) => (340 - total) / 2 + anchos.slice(0, i).reduce((n, w) => n + w + 14, 0));
  const caida = sol === null ? 0 : Math.round((100 - sol) * 0.6);
  const colorTecho = sol === null ? "#7C8DA6" : `hsl(${Math.round(sol * 1.2)} 70% 52%)`;
  const base = 150;
  const alto = 100;
  return (
    <div className="lcp-vis" aria-live="polite">
      <svg viewBox="0 0 340 160" role="img" aria-label="Pilares del argumento" style={{ width: "100%", maxHeight: 220 }}>
        <rect x="14" y={base} width="312" height="6" rx="3" fill="rgba(255,255,255,0.16)" />
        {premisas.map((f, i) => {
          const w = anchos[i]!;
          const px = xs[i]!;
          const m = marcas[f.id];
          const k = !m ? (alto - 0) / alto : m === "dato" ? (alto - caida) / alto : 0.28;
          const fill = !m ? "rgba(255,255,255,0.05)" : m === "dato" ? OK : "#FF8A5E";
          return (
            <g key={f.id}>
              <rect
                x={px}
                y={base - alto}
                width={w}
                height={alto}
                rx="4"
                fill={fill}
                fillOpacity={m === "dato" ? 0.85 : m ? 0.55 : 1}
                stroke={m ? "none" : "rgba(255,255,255,0.35)"}
                strokeDasharray={m ? undefined : "5 4"}
                style={{ transformBox: "fill-box", transformOrigin: "bottom", transform: `scaleY(${k})`, transition: "transform .5s ease, fill .3s" }}
              />
              {m === "sinfuente" && (
                <polyline
                  points={`${px + 3},${base - 12} ${px + w / 2},${base - 22} ${px + w / 2 - 6},${base - 30} ${px + w - 3},${base - 40}`}
                  fill="none"
                  stroke="#2b1208"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}
        <g style={{ transform: `translateY(${caida}px)`, transition: "transform .5s ease" }}>
          <rect x="14" y={base - alto - 14} width="312" height="14" rx="4" fill={colorTecho} style={{ transition: "fill .4s" }} />
        </g>
      </svg>
      <div className="lcp-medidor">
        <div className="lcp-medidor-cab">
          <span>Solidez del argumento</span>
          <strong style={{ color: sol === null ? T.text3 : sol >= 60 ? OK : sol >= 40 ? "#FFC75A" : "#FF8A5E" }}>{sol === null ? "sin medir" : `${sol} %`}</strong>
        </div>
        <div className="lcp-medidor-barra">
          {sol !== null && <i style={{ left: `${sol}%` }} />}
        </div>
        <div className="lcp-medidor-pie">
          <span>nada se comprueba</span>
          <span>todo se comprueba</span>
        </div>
      </div>
    </div>
  );
}
