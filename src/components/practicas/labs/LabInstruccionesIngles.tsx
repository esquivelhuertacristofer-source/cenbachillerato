"use client";

/**
 * Laboratorio — Instructions that work (IN-III-P06, Inglés III).
 *
 * «Pide, da y entiende instrucciones más completas: orienta a otra persona
 * para hacer algo o llegar a un lugar.»
 *
 * La tesis: una instrucción no es correcta porque se entienda, sino porque no
 * admite otra lectura. Por eso aquí todo lo que el alumno dice lo ejecuta algo
 * literal, y la imprecisión se paga con un resultado equivocado que se ve.
 *
 * Cinco modos:
 *  1. «Da la instrucción» — arma verbo + objeto + detalle y una pantalla de
 *     diez elementos obedece al pie de la letra. Si la frase alcanza a más de
 *     un elemento, la máquina toma el primero que encuentra (y el primero es
 *     el botón rojo de borrar).
 *  2. «Precisa o ambigua» — seis pares; elegir la precisa y decir qué dato le
 *     falta a la otra (cuánto / cuál / dónde / cuánto tiempo / en qué orden /
 *     con qué).
 *  3. «Arregla la secuencia» — los conectores ya están en orden perfecto y los
 *     pasos no; la simulación literal enseña que el orden de los conectores no
 *     basta.
 *  4. «Pide que te orienten» — preguntas indirectas (Could you tell me… / Do
 *     you know…), que invierten el orden respecto a la pregunta directa.
 *  5. «Completa el texto» — el fill_blanks A2, verbatim.
 *
 * DOM puro (sin three.js), accesible con ratón, teclado y táctil. Interfaz y
 * explicaciones en español de México; el lenguaje meta, en inglés
 * estadounidense estándar.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { hablarLab, callarLab, puedeHablarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { INSTRUCCIONES_INGLES_HUECOS } from "./instrucciones-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { INSTRUCCIONES_INGLES_FICHA } from "./instrucciones-ingles-ficha";
import {
  VERBOS,
  ELEMENTOS,
  OBJETOS,
  DETALLES,
  TAREAS,
  PARES,
  FALTAS,
  FALTA_INFO,
  PROCEDIMIENTOS,
  INDIRECTAS,
  QUIZ_A3,
  HECHOS_A4,
  LECTURA_A1,
  PREGUNTAS_A1,
  RECUADRO_A1,
  NOTA_PRACTICA,
  ejecutar,
  fraseDe,
  fraseIndirecta,
  simular,
  elementoPorId,
  type Verbo,
  type Desenlace,
  type Falta,
  type Procedimiento,
  type ResultadoSim,
} from "./instrucciones-ingles-data";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-instrucciones-ingles-reto";
const META_ESCUCHAS = 4;

type Modo = "ejecuta" | "ambigua" | "secuencia" | "pregunta" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "ejecuta", label: "Da la instrucción", icono: "fa-terminal" },
  { id: "ambigua", label: "Precisa o ambigua", icono: "fa-scale-unbalanced" },
  { id: "secuencia", label: "Arregla la secuencia", icono: "fa-list-ol" },
  { id: "pregunta", label: "Pide que te orienten", icono: "fa-circle-question" },
  { id: "texto", label: "Completa el texto", icono: "fa-keyboard" },
];

function BotonEscuchar({ texto, onPlay }: { texto: string; onPlay: () => void }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button
      type="button"
      className="ins-escuchar"
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

const ORDEN_INICIAL: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const p of PROCEDIMIENTOS) out[p.id] = p.inicial.slice();
  return out;
})();

/** Cuántos pasos están ya en su ranura correcta. */
function bienColocados(proc: Procedimiento, orden: string[]): number {
  return proc.pasos.reduce((acc, p, i) => acc + (orden[i] === p.id ? 1 : 0), 0);
}

export function LabInstruccionesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("ejecuta");

  /* ── sonido y teoría ─────────────────────────────────────────────── */
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  useEffect(() => () => {
    callarLab();
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
  /** Un fallo que es parte de la lección: suena, pero no gasta estrella. */
  const sfxLeccion = () => sonido && audioRef.current?.incorrecto();

  // Un solo temporizador de avance automático para todo el laboratorio: si el
  // alumno navega a mano antes de que salte, se cancela. Sin esto, el avance
  // pendiente de la pregunta anterior borraba las fichas recién colocadas.
  const avanceRef = useRef<number | null>(null);
  const cancelaAvance = () => {
    if (avanceRef.current !== null) {
      window.clearTimeout(avanceRef.current);
      avanceRef.current = null;
    }
  };
  useEffect(() => () => {
    if (avanceRef.current !== null) window.clearTimeout(avanceRef.current);
  }, []);

  const [escuchas, setEscuchas] = useState(0);
  const contarEscucha = () => setEscuchas((n) => n + 1);

  /* ── MODO 1 — Da la instrucción ──────────────────────────────────── */
  const [verbo, setVerbo] = useState<Verbo>("Click");
  const [objetoSel, setObjetoSel] = useState<string>("o-button");
  const [detalleSel, setDetalleSel] = useState<string>("d-nada");
  const [tareaIdx, setTareaIdx] = useState(0);
  const [tareasHechas, setTareasHechas] = useState<Record<string, boolean>>({});
  const [desenlace, setDesenlace] = useState<Desenlace | null>(null);
  const [ambiguaVista, setAmbiguaVista] = useState(false);
  const [ayudaTarea, setAyudaTarea] = useState<Record<string, boolean>>({});

  const tareaActual = TAREAS[tareaIdx] ?? TAREAS[0]!;
  const fraseActual = fraseDe(verbo, objetoSel, detalleSel);

  const correr = () => {
    const d = ejecutar(verbo, objetoSel, detalleSel, tareaActual.objetivo);
    setDesenlace(d);
    if (d.clase === "exito") {
      setTareasHechas((prev) => ({ ...prev, [tareaActual.id]: true }));
      sfxBien();
      const siguiente = TAREAS.findIndex((t, i) => i > tareaIdx && !tareasHechas[t.id]);
      if (siguiente >= 0) {
        cancelaAvance();
        avanceRef.current = window.setTimeout(() => {
          avanceRef.current = null;
          setTareaIdx(siguiente);
        }, 900);
      }
    } else if (d.clase === "ambigua" && !ambiguaVista) {
      // El primer choque con la ambigüedad es la lección del laboratorio:
      // se explica, suena, pero no descuenta la tercera estrella.
      setAmbiguaVista(true);
      sfxLeccion();
    } else {
      sfxNo();
    }
  };

  const resetEjecuta = () => {
    setTareasHechas({});
    setTareaIdx(0);
    setDesenlace(null);
    setAyudaTarea({});
    setVerbo("Click");
    setObjetoSel("o-button");
    setDetalleSel("d-nada");
  };

  /* ── MODO 2 — Precisa o ambigua ──────────────────────────────────── */
  const [parElegida, setParElegida] = useState<Record<string, boolean>>({});
  const [parFalta, setParFalta] = useState<Record<string, boolean>>({});
  const [shakePar, setShakePar] = useState<string | null>(null);

  const elegirPrecisa = (parId: string, lado: "a" | "b") => {
    const par = PARES.find((p) => p.id === parId);
    if (!par || parElegida[parId]) return;
    if (par.precisa === lado) {
      setParElegida((e) => ({ ...e, [parId]: true }));
      sfxBien();
    } else {
      setShakePar(parId);
      sfxNo();
      window.setTimeout(() => setShakePar(null), 420);
    }
  };
  const elegirFalta = (parId: string, falta: Falta) => {
    const par = PARES.find((p) => p.id === parId);
    if (!par || parFalta[parId]) return;
    if (par.falta === falta) {
      setParFalta((e) => ({ ...e, [parId]: true }));
      sfxBien();
    } else {
      setShakePar(parId);
      sfxNo();
      window.setTimeout(() => setShakePar(null), 420);
    }
  };
  const resetAmbigua = () => {
    setParElegida({});
    setParFalta({});
  };

  /* ── MODO 3 — Arregla la secuencia ───────────────────────────────── */
  const [ordenes, setOrdenes] = useState<Record<string, string[]>>(() => ({ ...ORDEN_INICIAL }));
  const [selPaso, setSelPaso] = useState<{ proc: string; id: string } | null>(null);
  const [sims, setSims] = useState<Record<string, ResultadoSim | null>>({});
  const [falloVisto, setFalloVisto] = useState(false);

  const intercambiar = (procId: string, idA: string, idB: string) => {
    const proc = PROCEDIMIENTOS.find((p) => p.id === procId);
    if (!proc || idA === idB) return;
    const actual = ordenes[procId] ?? proc.inicial;
    const i = actual.indexOf(idA);
    const j = actual.indexOf(idB);
    if (i < 0 || j < 0) return;
    const siguiente = actual.slice();
    siguiente[i] = idB;
    siguiente[j] = idA;
    const antes = bienColocados(proc, actual);
    const despues = bienColocados(proc, siguiente);
    setOrdenes((o) => ({ ...o, [procId]: siguiente }));
    setSims((s) => ({ ...s, [procId]: null }));
    setSelPaso(null);
    if (despues > antes) sfxBien();
    else if (despues < antes) sfxNo();
    if (despues >= proc.pasos.length) {
      setSims((s) => ({ ...s, [procId]: simular(proc, siguiente) }));
      sfxOk();
    }
  };

  const correrSecuencia = (proc: Procedimiento) => {
    const orden = ordenes[proc.id] ?? proc.inicial;
    const r = simular(proc, orden);
    setSims((s) => ({ ...s, [proc.id]: r }));
    if (r.pasoFallo) {
      setFalloVisto(true);
      sfxLeccion();
    } else {
      sfxOk();
    }
  };

  const resetSecuencia = () => {
    setOrdenes({ ...ORDEN_INICIAL });
    setSims({});
    setSelPaso(null);
  };

  /* ── MODO 4 — Pide que te orienten ───────────────────────────────── */
  const [indIdx, setIndIdx] = useState(0);
  const [indHechas, setIndHechas] = useState<Record<string, boolean>>({});
  const [piezas, setPiezas] = useState<(string | null)[]>(() => INDIRECTAS[0]!.solucion.map(() => null));
  const [indShake, setIndShake] = useState(false);
  const [indRegla, setIndRegla] = useState(false);

  const indActual = INDIRECTAS[indIdx] ?? INDIRECTAS[0]!;

  const irA = (i: number) => {
    const q = INDIRECTAS[i];
    if (!q) return;
    cancelaAvance();
    setIndIdx(i);
    setPiezas(indHechas[q.id] ? q.solucion.slice() : q.solucion.map(() => null));
    setIndRegla(!!indHechas[q.id]);
  };

  const ponerFicha = (texto: string) => {
    if (indHechas[indActual.id]) return;
    const hueco = piezas.indexOf(null);
    if (hueco < 0) return;
    const siguiente = piezas.slice();
    siguiente[hueco] = texto;
    setPiezas(siguiente);
    if (siguiente.some((p) => p === null)) return;
    // Lleno: se comprueba al instante.
    const bien = siguiente.every((p, i) => p === indActual.solucion[i]);
    if (bien) {
      setIndHechas((h) => ({ ...h, [indActual.id]: true }));
      setIndRegla(true);
      sfxBien();
      const sig = INDIRECTAS.findIndex((q, i) => i > indIdx && !indHechas[q.id]);
      if (sig >= 0) {
        avanceRef.current = window.setTimeout(() => {
          avanceRef.current = null;
          irA(sig);
        }, 1400);
      }
    } else {
      setIndShake(true);
      setIndRegla(true);
      sfxNo();
      window.setTimeout(() => {
        setIndShake(false);
        setPiezas(indActual.solucion.map(() => null));
      }, 600);
    }
  };

  const quitarFicha = (i: number) => {
    if (indHechas[indActual.id]) return;
    setPiezas((prev) => prev.map((p, k) => (k === i ? null : p)));
  };

  const resetPregunta = () => {
    setIndHechas({});
    setIndIdx(0);
    setPiezas(INDIRECTAS[0]!.solucion.map(() => null));
    setIndRegla(false);
  };

  /* ── MODO 5 — Completa el texto ──────────────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  const resetActual =
    modo === "ejecuta"
      ? resetEjecuta
      : modo === "ambigua"
        ? resetAmbigua
        : modo === "secuencia"
          ? resetSecuencia
          : modo === "pregunta"
            ? resetPregunta
            : resetTexto;

  /* ── progreso ────────────────────────────────────────────────────── */
  const nTareas = Object.values(tareasHechas).filter(Boolean).length;
  const nPrecisas = Object.values(parElegida).filter(Boolean).length;
  const nFaltas = Object.values(parFalta).filter(Boolean).length;
  const nIndirectas = Object.values(indHechas).filter(Boolean).length;
  const secuenciasOk = PROCEDIMIENTOS.filter((p) => bienColocados(p, ordenes[p.id] ?? p.inicial) >= p.pasos.length).length;

  const objetivos = [
    { txt: "Completa las 4 tareas de la plataforma con instrucciones precisas", done: nTareas >= TAREAS.length },
    { txt: "Comprueba qué hace la máquina con una instrucción ambigua", done: ambiguaVista },
    { txt: "Elige la instrucción precisa en los 6 pares", done: nPrecisas >= PARES.length },
    { txt: "Di qué dato le falta a las 6 instrucciones ambiguas", done: nFaltas >= PARES.length },
    { txt: "Ejecuta una secuencia mal ordenada y mira el desastre", done: falloVisto },
    { txt: "Repara los 2 procedimientos desordenados", done: secuenciasOk >= PROCEDIMIENTOS.length },
    { txt: "Arma las 6 preguntas indirectas", done: nIndirectas >= INDIRECTAS.length },
    { txt: "Completa el texto de la receta (A2)", done: textoDone },
    { txt: "Aprueba el quiz de imperativos y conectores (A3)", done: quizAprobado },
    { txt: `Escucha ${META_ESCUCHAS} frases en inglés`, done: escuchas >= META_ESCUCHAS },
  ];

  const { mejorEstrellas } = useEstrellas(RETO_KEY);

  /* ── arrastre nativo (modo 3) ────────────────────────────────────── */
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
    "data-zona": "true" as const,
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes insShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes insPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        @keyframes insPulso { 0%,100%{ box-shadow:0 0 0 0 currentColor; } 50%{ box-shadow:0 0 0 7px transparent; } }
        .ins-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .ins-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .ins-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ins-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ins-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .ins-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ins-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .ins-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .ins-btn:disabled { opacity:.45; cursor:default; }
        .ins-escuchar { cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:8px; flex-shrink:0;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text3}; font-size:11px; font-weight:800; transition:all .14s; }
        .ins-escuchar:hover { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.14); }
        .ins-divider { height:1px; background:${T.line}; margin:18px 0; }

        /* fichas de la frase */
        .ins-ficha { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:9px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; font-size:13px; font-weight:700;
          transition:all .14s; user-select:none; font-family:ui-monospace,"SFMono-Regular",Menlo,monospace; }
        .ins-ficha:hover { border-color:${T.lineStrong}; color:#fff; transform:translateY(-2px); }
        .ins-ficha[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); color:#fff; box-shadow:0 0 16px -5px ${accent}; }

        /* pantalla simulada */
        .ins-pantalla { border-radius:16px; border:1.5px solid ${T.lineStrong}; background:linear-gradient(180deg,#081a31 0%,#04101f 100%);
          overflow:hidden; box-shadow:0 18px 44px -24px rgba(0,0,0,0.8); }
        .ins-topbar { display:flex; align-items:center; gap:10px; padding:11px 14px; border-bottom:1px solid ${T.line}; background:rgba(255,255,255,0.03); flex-wrap:wrap; }
        .ins-marca { font-size:12.5px; font-weight:900; letter-spacing:.04em; color:${accent}; }
        .ins-cuerpo { display:grid; grid-template-columns:minmax(120px,0.8fr) minmax(0,2fr); gap:0; }
        .ins-menu { border-right:1px solid ${T.line}; padding:12px 10px; display:flex; flex-direction:column; gap:7px; }
        .ins-lista { padding:12px 14px; display:flex; flex-direction:column; gap:8px; }
        .ins-pie { padding:11px 14px; border-top:1px solid ${T.line}; display:flex; justify-content:flex-end; background:rgba(255,255,255,0.02); }
        .ins-el { border-radius:9px; border:1.5px solid transparent; padding:8px 12px; font-size:12.5px; font-weight:700;
          display:inline-flex; align-items:center; gap:8px; transition:all .2s; }
        .ins-el[data-tipo="boton"] { color:#04121f; }
        .ins-el[data-tipo="menu"], .ins-el[data-tipo="archivo"] { background:rgba(255,255,255,0.05); border-color:${T.line}; color:${T.text2}; }
        .ins-el[data-tipo="campo"] { background:rgba(2,12,28,0.7); border-color:${T.line}; color:${T.text3}; flex:1; min-width:120px; font-weight:600; }
        .ins-el[data-hl="cand"] { border-color:${AMBAR}; box-shadow:0 0 0 2px ${AMBAR}44; }
        .ins-el[data-hl="mal"] { border-color:${NO}; box-shadow:0 0 22px -4px ${NO}; transform:scale(1.04); }
        .ins-el[data-hl="bien"] { border-color:${OK}; box-shadow:0 0 22px -4px ${OK}; transform:scale(1.04); }

        /* tarjetas de par */
        .ins-par { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px 18px; transition:all .16s; }
        .ins-par[data-shake="true"] { animation:insShake .4s; border-color:${NO}; }
        .ins-par[data-done="true"] { border-color:${OK}66; background:${OK}0d; }
        .ins-opt { cursor:pointer; text-align:left; width:100%; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:13.5px; font-weight:700; padding:12px 14px; transition:all .14s; line-height:1.45; display:flex; gap:10px; align-items:flex-start; }
        .ins-opt:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .ins-opt:disabled { cursor:default; }
        .ins-opt[data-res="bien"] { border-color:${OK}; background:${OK}1a; color:#fff; }
        .ins-opt[data-res="mal"] { border-color:${NO}66; background:${NO}12; }
        .ins-falta { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:8px 13px; border-radius:10px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .ins-falta:hover:not(:disabled) { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.14); }
        .ins-falta:disabled { cursor:default; }
        .ins-falta[data-res="bien"] { border-color:${OK}; background:${OK}1c; color:#fff; }

        /* pasos de la secuencia */
        .ins-paso { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; display:flex; gap:12px;
          align-items:flex-start; transition:all .16s; cursor:grab; }
        .ins-paso:hover { border-color:${T.lineStrong}; }
        .ins-paso:active { cursor:grabbing; }
        .ins-paso[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -5px ${accent}; }
        .ins-paso[data-ok="true"] { border-color:${OK}66; background:${OK}0f; }
        .ins-paso[data-fallo="true"] { border-color:${NO}; background:${NO}12; animation:insShake .4s; }
        .ins-conector { flex-shrink:0; min-width:76px; text-align:center; font-size:11px; font-weight:900; letter-spacing:.05em;
          text-transform:uppercase; color:${accent}; border:1px solid rgba(${color.rgba},0.45); background:rgba(${color.rgba},0.12);
          border-radius:8px; padding:5px 8px; }

        /* preguntas indirectas */
        .ins-slot { min-width:96px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; padding:6px 12px; font-size:14px; font-weight:800; color:${T.text3};
          transition:all .16s; cursor:pointer; }
        .ins-slot[data-full="true"] { border-style:solid; border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; animation:insPop .2s ease; }
        .ins-slot[data-ok="true"] { border-color:${OK}; background:${OK}1a; color:#fff; }
        .ins-frase { display:flex; align-items:center; gap:9px; flex-wrap:wrap; }
        .ins-frase[data-shake="true"] { animation:insShake .45s; }

        /* cajón de teoría */
        .ins-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ins-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ins-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ins-drawer[data-open="true"] { transform:translateX(0); }
        .ins-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ins-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ins-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ins-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ins-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ins-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .ins-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (max-width: 900px){ .ins-cuerpo { grid-template-columns:1fr; } .ins-menu { border-right:none; border-bottom:1px solid ${T.line}; } }
        @media (prefers-reduced-motion: reduce){
          .ins-par[data-shake="true"], .ins-paso[data-fallo="true"], .ins-frase[data-shake="true"], .ins-slot[data-full="true"] { animation:none; }
          .ins-ficha:hover { transform:none; }
        }
      `}</style>

      {/* barra de modos */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="ins-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="ins-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="ins-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="ins-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* cajón de teoría */}
      <button className="ins-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="ins-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ins-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ins-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ins-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ins-drawer-body">
          <FichaTeorica data={INSTRUCCIONES_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── columna principal ───────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 */}
          {modo === "ejecuta" && (
            <>
              <PantallaPlataforma desenlace={desenlace} accent={accent} />

              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <Eyebrow>
                    Tarea {tareaIdx + 1} de {TAREAS.length} · la máquina obedece literalmente
                  </Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: nTareas >= TAREAS.length ? OK : T.text3 }}>
                    {nTareas}/{TAREAS.length} tareas
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {TAREAS.map((t, i) => (
                    <button
                      key={t.id}
                      className="ins-ficha"
                      data-on={i === tareaIdx}
                      onClick={() => {
                        cancelaAvance();
                        setTareaIdx(i);
                        setDesenlace(null);
                      }}
                      style={tareasHechas[t.id] ? { borderColor: OK, color: "#fff" } : undefined}
                    >
                      <i className={`fa-solid ${tareasHechas[t.id] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 11, color: tareasHechas[t.id] ? OK : T.text3 }} />
                      {i + 1}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 14, color: T.text, fontWeight: 700, lineHeight: 1.5, marginBottom: 16 }}>
                  <i className="fa-solid fa-bullseye" style={{ color: accent, marginRight: 9 }} />
                  {tareaActual.meta}
                </div>

                <FilaFichas titulo="Verbo (imperativo)" icono="fa-bolt">
                  {VERBOS.map((v) => (
                    <button key={v} className="ins-ficha" data-on={verbo === v} onClick={() => setVerbo(v)}>
                      {v}
                    </button>
                  ))}
                </FilaFichas>

                <FilaFichas titulo="Qué (objeto directo)" icono="fa-hand-pointer">
                  {OBJETOS.map((o) => (
                    <button key={o.id} className="ins-ficha" data-on={objetoSel === o.id} onClick={() => setObjetoSel(o.id)}>
                      {o.texto}
                    </button>
                  ))}
                </FilaFichas>

                <FilaFichas titulo="Dónde (detalle, opcional)" icono="fa-location-dot">
                  {DETALLES.map((d) => (
                    <button key={d.id} className="ins-ficha" data-on={detalleSel === d.id} onClick={() => setDetalleSel(d.id)}>
                      {d.texto || d.etiqueta}
                    </button>
                  ))}
                </FilaFichas>

                <div
                  style={{
                    marginTop: 16,
                    borderRadius: 13,
                    border: `1.5px solid rgba(${color.rgba},0.4)`,
                    background: `rgba(${color.rgba},0.09)`,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <i className="fa-solid fa-quote-left" style={{ color: accent, fontSize: 13 }} />
                  <span style={{ flex: 1, minWidth: 200, fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: 'ui-monospace,"SFMono-Regular",Menlo,monospace' }}>
                    {fraseActual}
                  </span>
                  <BotonEscuchar texto={fraseActual} onPlay={contarEscucha} />
                  <button className="ins-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={correr}>
                    <i className="fa-solid fa-play" />
                    Ejecutar
                  </button>
                </div>

                {desenlace && (
                  <div
                    style={{
                      marginTop: 13,
                      borderRadius: 13,
                      border: `1.5px solid ${desenlace.clase === "exito" ? OK : desenlace.clase === "ambigua" ? AMBAR : NO}66`,
                      background: `${desenlace.clase === "exito" ? OK : desenlace.clase === "ambigua" ? AMBAR : NO}12`,
                      padding: "13px 16px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <i
                        className={`fa-solid ${desenlace.clase === "exito" ? "fa-circle-check" : desenlace.clase === "ambigua" ? "fa-triangle-exclamation" : "fa-circle-xmark"}`}
                        style={{ color: desenlace.clase === "exito" ? OK : desenlace.clase === "ambigua" ? AMBAR : NO, fontSize: 15, marginTop: 2 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", lineHeight: 1.5 }}>{desenlace.mensaje}</div>
                        <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, marginTop: 6 }}>{desenlace.leccion}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 13, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="ins-btn" onClick={() => setAyudaTarea((a) => ({ ...a, [tareaActual.id]: true }))} disabled={!!ayudaTarea[tareaActual.id]}>
                    <i className="fa-solid fa-lightbulb" />
                    Ver una instrucción que sí funciona
                  </button>
                  {ayudaTarea[tareaActual.id] && (
                    <span style={{ fontSize: 13, color: T.text2, fontFamily: 'ui-monospace,"SFMono-Regular",Menlo,monospace' }}>{tareaActual.ejemplo}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* MODO 2 */}
          {modo === "ambigua" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <Eyebrow>Elige la instrucción que no admite otra lectura</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: nFaltas >= PARES.length ? OK : T.text3 }}>
                    {nPrecisas}/{PARES.length} elegidas · {nFaltas}/{PARES.length} explicadas
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55 }}>
                  Las dos frases de cada par son inglés correcto y las dos se entienden. Solo una se puede <strong style={{ color: T.text2 }}>obedecer sin preguntar</strong>. Después de
                  elegirla, di qué dato le falta a la otra.
                </div>
              </div>

              {PARES.map((par) => {
                const elegida = !!parElegida[par.id];
                const faltaOk = !!parFalta[par.id];
                return (
                  <div key={par.id} className="ins-par" data-shake={shakePar === par.id} data-done={faltaOk}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 11 }}>
                      {(["a", "b"] as const).map((lado) => {
                        const texto = lado === "a" ? par.a : par.b;
                        const esPrecisa = par.precisa === lado;
                        const res = elegida ? (esPrecisa ? "bien" : "mal") : undefined;
                        return (
                          <button key={lado} className="ins-opt" data-res={res} disabled={elegida} onClick={() => elegirPrecisa(par.id, lado)}>
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                flexShrink: 0,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 900,
                                border: `1.5px solid ${elegida ? (esPrecisa ? OK : NO) : T.line}`,
                                color: elegida ? (esPrecisa ? OK : NO) : T.text3,
                                marginTop: 1,
                              }}
                            >
                              {elegida ? <i className={`fa-solid ${esPrecisa ? "fa-check" : "fa-xmark"}`} /> : lado.toUpperCase()}
                            </span>
                            <span style={{ flex: 1 }}>{texto}</span>
                          </button>
                        );
                      })}
                    </div>

                    {elegida && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 12.5, color: T.text2, fontWeight: 700, marginBottom: 9 }}>
                          <i className="fa-solid fa-circle-question" style={{ color: accent, marginRight: 8 }} />
                          ¿Qué dato le falta a «{par.precisa === "a" ? par.b : par.a}»?
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {FALTAS.map((f) => {
                            const info = FALTA_INFO[f];
                            const marca = faltaOk && par.falta === f ? "bien" : undefined;
                            return (
                              <button key={f} className="ins-falta" data-res={marca} disabled={faltaOk} onClick={() => elegirFalta(par.id, f)}>
                                <i className={`fa-solid ${info.icono}`} style={{ fontSize: 11 }} />
                                {info.etq}
                              </button>
                            );
                          })}
                        </div>
                        {faltaOk && (
                          <div style={{ marginTop: 11, display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 14, marginTop: 2 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{par.porque}</div>
                              <div style={{ fontSize: 11.5, color: T.text3, marginTop: 5 }}>
                                Pregunta que resuelve: <strong style={{ color: accent }}>{FALTA_INFO[par.falta].pregunta}</strong>
                              </div>
                            </div>
                            <BotonEscuchar texto={par.precisa === "a" ? par.a : par.b} onPlay={contarEscucha} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* MODO 3 */}
          {modo === "secuencia" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <Eyebrow>Los conectores están en orden. Los pasos, no.</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: secuenciasOk >= PROCEDIMIENTOS.length ? OK : T.text3 }}>
                    {secuenciasOk}/{PROCEDIMIENTOS.length} reparados
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55 }}>
                  First, Then, After that, Next y Finally ya están donde deben. Aun así, la secuencia no funciona: prueba a ejecutarla al pie de la letra y verás
                  por qué. Intercambia dos pasos tocándolos (o arrastrando uno sobre otro) hasta que cada paso caiga bajo su conector.
                </div>
              </div>

              {PROCEDIMIENTOS.map((proc) => (
                <BloqueProcedimiento
                  key={proc.id}
                  proc={proc}
                  orden={ordenes[proc.id] ?? proc.inicial}
                  sim={sims[proc.id] ?? null}
                  selId={selPaso?.proc === proc.id ? selPaso.id : null}
                  accent={accent}
                  onToque={(id) => {
                    if (!selPaso || selPaso.proc !== proc.id) setSelPaso({ proc: proc.id, id });
                    else if (selPaso.id === id) setSelPaso(null);
                    else intercambiar(proc.id, selPaso.id, id);
                  }}
                  onSoltar={(origen, destino) => intercambiar(proc.id, origen, destino)}
                  onCorrer={() => correrSecuencia(proc)}
                  dragProps={dragProps}
                  dropProps={dropProps}
                />
              ))}
            </>
          )}

          {/* MODO 4 */}
          {modo === "pregunta" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <Eyebrow>De la pregunta directa a la pregunta indirecta</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: nIndirectas >= INDIRECTAS.length ? OK : T.text3 }}>
                    {nIndirectas}/{INDIRECTAS.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 12 }}>
                  Para <strong style={{ color: T.text2 }}>pedir</strong> instrucciones con cortesía no se usa la pregunta directa: después de «Could you tell me…» o «Do you know…» el
                  orden vuelve a ser el de una oración normal. Toca las fichas en el orden correcto; algunas sobran.
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {INDIRECTAS.map((q, i) => (
                    <button key={q.id} className="ins-ficha" data-on={i === indIdx} onClick={() => irA(i)}>
                      <i className={`fa-solid ${indHechas[q.id] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 11, color: indHechas[q.id] ? OK : T.text3 }} />
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ ...card, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginBottom: 12 }}>{indActual.contexto}</div>

                <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap", marginBottom: 18 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: T.text3 }}>Pregunta directa</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.text2, fontFamily: 'ui-monospace,"SFMono-Regular",Menlo,monospace' }}>{indActual.directa}</span>
                  <BotonEscuchar texto={indActual.directa} onPlay={contarEscucha} />
                </div>

                <div className="ins-frase" data-shake={indShake} style={{ marginBottom: 18 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: accent, fontFamily: 'ui-monospace,"SFMono-Regular",Menlo,monospace' }}>{indActual.apertura}</span>
                  {piezas.map((p, i) => (
                    <button
                      key={i}
                      className="ins-slot"
                      data-full={p !== null}
                      data-ok={!!indHechas[indActual.id]}
                      aria-label={`Hueco ${i + 1} de ${piezas.length}`}
                      onClick={() => quitarFicha(i)}
                    >
                      {p ?? `${i + 1}`}
                    </button>
                  ))}
                  <span style={{ fontSize: 20, fontWeight: 900, color: accent }}>?</span>
                </div>

                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {indActual.fichas.map((f) => {
                    const puesta = piezas.includes(f);
                    return (
                      <button key={f} className="ins-ficha" disabled={puesta || !!indHechas[indActual.id]} style={puesta ? { opacity: 0.32 } : undefined} onClick={() => ponerFicha(f)}>
                        {f}
                      </button>
                    );
                  })}
                </div>

                {indRegla && (
                  <div
                    style={{
                      marginTop: 18,
                      borderRadius: 13,
                      border: `1.5px solid ${indHechas[indActual.id] ? OK : AMBAR}66`,
                      background: `${indHechas[indActual.id] ? OK : AMBAR}12`,
                      padding: "13px 16px",
                      display: "flex",
                      gap: 11,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <i
                      className={`fa-solid ${indHechas[indActual.id] ? "fa-circle-check" : "fa-lightbulb"}`}
                      style={{ color: indHechas[indActual.id] ? OK : AMBAR, fontSize: 15, marginTop: 2 }}
                    />
                    <div style={{ flex: 1, minWidth: 220 }}>
                      {indHechas[indActual.id] && (
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: "#fff", marginBottom: 6, fontFamily: 'ui-monospace,"SFMono-Regular",Menlo,monospace' }}>
                          {fraseIndirecta(indActual, indActual.solucion)}
                        </div>
                      )}
                      <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{indActual.regla}</div>
                      {indHechas[indActual.id] && <div style={{ fontSize: 12, color: T.text3, marginTop: 5, fontStyle: "italic" }}>{indActual.traduccion}</div>}
                    </div>
                    {indHechas[indActual.id] && <BotonEscuchar texto={fraseIndirecta(indActual, indActual.solucion)} onPlay={contarEscucha} />}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO 5 */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={INSTRUCCIONES_INGLES_HUECOS}
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

        {/* ── columna lateral ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
            {mejorEstrellas >= 3 && (
              <div style={{ marginTop: 11, fontSize: 12, color: OK, fontWeight: 700 }}>
                <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
                Ya das instrucciones que solo se pueden leer de una forma.
              </div>
            )}
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
              {modo === "ejecuta" && (
                <>
                  La máquina lee la pantalla de arriba abajo. Si tu frase alcanza a varios elementos, obedece el{" "}
                  <strong style={{ color: T.text }}>primero</strong> que encuentra —y el primer botón es el rojo—. Añade el color, el nombre exacto o el lugar.
                </>
              )}
              {modo === "ambigua" && (
                <>
                  Pregúntale a la frase: <strong style={{ color: T.text }}>How much? Which one? Where exactly? How long? In what order? With what?</strong> Si alguna se queda
                  sin respuesta, ahí está el hueco.
                </>
              )}
              {modo === "secuencia" && (
                <>
                  Un conector solo <em>anuncia</em> el lugar del paso; no lo coloca. Pregúntate qué necesita cada paso para tener sentido:{" "}
                  <strong style={{ color: T.text }}>no puedes colar lo que no reposó</strong>.
                </>
              )}
              {modo === "pregunta" && (
                <>
                  Regla de oro: después de «Could you tell me» o «Do you know», <strong style={{ color: T.text }}>sujeto antes que verbo</strong> y sin «do/does». Para sí/no,
                  empieza con «if».
                </>
              )}
              {modo === "texto" && (
                <>
                  Este es el texto de la actividad <strong style={{ color: T.text }}>A2</strong>, tal cual. Escribe el conector o el verbo en imperativo; no se distinguen mayúsculas.
                </>
              )}
            </span>
          </div>

          {/* Hechos verbatim A4 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 8, color: accent }} />
              Hechos comprobados (A4)
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {HECHOS_A4.map((h) => (
                <div key={h.enunciado} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  <span
                    style={{
                      display: "inline-block",
                      marginRight: 8,
                      padding: "1px 7px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 900,
                      color: h.respuesta ? OK : NO,
                      border: `1px solid ${h.respuesta ? OK : NO}66`,
                      background: `${h.respuesta ? OK : NO}14`,
                    }}
                  >
                    {h.respuesta ? "TRUE" : "FALSE"}
                  </span>
                  {h.enunciado}
                  <div style={{ fontSize: 11.5, color: T.text3, marginTop: 3, fontStyle: "italic" }}>{h.retro}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas de comprensión A1 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Comprensión de la lectura A1
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {PREGUNTAS_A1.map((p) => (
                <div key={p.pregunta} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  <strong style={{ color: T.text }}>{p.pregunta}</strong>
                  <div style={{ marginTop: 3, color: T.text3 }}>{p.respuesta}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recuadro verbatim A1 */}
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
            <i className="fa-solid fa-scroll" style={{ color: accent, fontSize: 15, marginTop: 2 }} />
            <span>{RECUADRO_A1}</span>
          </div>
        </div>
      </div>

      <RetoQuizCard
        quiz={QUIZ_A3}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={(ok) => (ok ? sfxOk() : sfxNo())}
        mensajeAprobado="Ya distingues el imperativo, la negación y cada conector de secuencia."
      />

      {/* Lectura A1 completa + nota al pie */}
      <div style={{ ...card, padding: "20px 24px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
          Lectura A1 · {INSTRUCCIONES_INGLES_FICHA.ancla}
        </Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {LECTURA_A1.map((p, i) => (
            <p key={i} style={{ margin: 0, fontSize: 13.5, color: T.text2, lineHeight: 1.65 }}>
              {p}
            </p>
          ))}
        </div>
        <div className="ins-divider" />
        <p style={{ margin: 0, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
          {NOTA_PRACTICA} Fuente: {INSTRUCCIONES_INGLES_FICHA.fuente}.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Piezas de presentación
 * ═══════════════════════════════════════════════════════════════════════ */

function FilaFichas({ titulo, icono, children }: { titulo: string; icono: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>
        <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
        {titulo}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

/** Un procedimiento con sus conectores fijos y sus pasos intercambiables. */
function BloqueProcedimiento({
  proc,
  orden,
  sim,
  selId,
  accent,
  onToque,
  onSoltar,
  onCorrer,
  dragProps,
  dropProps,
}: {
  proc: Procedimiento;
  orden: string[];
  sim: ResultadoSim | null;
  selId: string | null;
  accent: string;
  onToque: (id: string) => void;
  onSoltar: (origen: string, destino: string) => void;
  onCorrer: () => void;
  dragProps: (id: string) => { draggable: boolean; onDragStart: (e: React.DragEvent) => void };
  dropProps: (onDrop: (id: string) => void) => { onDragOver: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void };
}) {
  const puestos = bienColocados(proc, orden);
  const listo = puestos >= proc.pasos.length;
  return (
    <div style={{ ...card, padding: "18px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6, flexWrap: "wrap" }}>
        <VinetaTermino termino={proc.titulo} color={accent} icono={proc.icono} tam={35} radio={10} />
        <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{proc.titulo}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12.5, fontWeight: 800, color: listo ? OK : T.text3 }}>
          {puestos}/{proc.pasos.length} en su sitio
        </span>
      </div>
      <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>{proc.contexto}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {proc.pasos.map((ranura, i) => {
          const idAqui = orden[i] ?? "";
          const paso = proc.pasos.find((p) => p.id === idAqui);
          if (!paso) return null;
          const enSuSitio = idAqui === ranura.id;
          const esFallo = sim?.pasoFallo === idAqui;
          return (
            <div
              key={`${proc.id}-${i}`}
              className="ins-paso"
              data-sel={selId === idAqui}
              data-ok={enSuSitio}
              data-fallo={esFallo}
              role="button"
              tabIndex={0}
              aria-label={`${ranura.conector}: ${paso.texto}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).click();
                }
              }}
              onClick={() => onToque(idAqui)}
              {...dragProps(idAqui)}
              {...dropProps((id) => onSoltar(id, idAqui))}
            >
              <span className="ins-conector">{ranura.conector}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", lineHeight: 1.45 }}>{paso.texto}</div>
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{paso.traduccion}</div>
                {esFallo && sim?.fallo && (
                  <div style={{ fontSize: 12, color: NO, lineHeight: 1.45, marginTop: 6, fontWeight: 700 }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
                    {sim.fallo}
                  </div>
                )}
              </div>
              <i className="fa-solid fa-grip-vertical" style={{ color: T.text3, fontSize: 13, marginTop: 3 }} />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
        <button className="ins-btn" onClick={onCorrer}>
          <i className="fa-solid fa-person-running" />
          Ejecutar al pie de la letra
        </button>
        {sim && !sim.pasoFallo && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" />
            {proc.exito}
          </span>
        )}
        {sim && sim.pasoFallo && (
          <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            Se ejecutaron <strong style={{ color: T.text }}>{sim.okHasta}</strong> de {proc.pasos.length} pasos antes del desastre.
          </span>
        )}
      </div>
    </div>
  );
}

/** La pantalla de la plataforma escolar: diez elementos que obedecen literalmente. */
function PantallaPlataforma({ desenlace, accent }: { desenlace: Desenlace | null; accent: string }) {
  const marca = (id: string): string | undefined => {
    if (!desenlace) return undefined;
    if (desenlace.elegido === id) return desenlace.clase === "exito" ? "bien" : "mal";
    if (desenlace.candidatos.includes(id)) return "cand";
    return undefined;
  };

  const pinta = (id: string) => {
    const el = elementoPorId(id);
    if (!el) return null;
    const fondo = el.color === "rojo" ? "#e2584f" : el.color === "azul" ? "#3f93e8" : el.color === "verde" ? "#3faa74" : undefined;
    return (
      <span key={id} className="ins-el" data-tipo={el.clase} data-hl={marca(id)} style={fondo ? { background: fondo } : undefined}>
        {el.clase === "archivo" && <i className="fa-solid fa-file-lines" style={{ fontSize: 11, opacity: 0.8 }} />}
        {el.clase === "campo" && <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 11, opacity: 0.8 }} />}
        {el.etiqueta}
      </span>
    );
  };

  const menu = ELEMENTOS.filter((e) => e.zona === "menu");
  const lista = ELEMENTOS.filter((e) => e.zona === "lista");

  return (
    <div className="ins-pantalla">
      <div className="ins-topbar">
        <span className="ins-marca">
          <i className="fa-solid fa-graduation-cap" style={{ marginRight: 7 }} />
          School Platform
        </span>
        {pinta("campo-buscar")}
        {pinta("btn-delete")}
        {pinta("btn-upload")}
      </div>
      <div className="ins-cuerpo">
        <nav className="ins-menu" aria-label="Menu">
          {menu.map((e) => pinta(e.id))}
        </nav>
        <div className="ins-lista">
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: T.text3, marginBottom: 2 }}>My files</div>
          {lista.map((e) => pinta(e.id))}
        </div>
      </div>
      <div className="ins-pie">{pinta("btn-send")}</div>
      <div
        style={{
          padding: "9px 14px",
          borderTop: `1px solid ${T.line}`,
          fontSize: 11.5,
          color: T.text3,
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "rgba(2,12,28,0.5)",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 10px ${accent}` }} />
        {desenlace ? desenlace.mensaje : "Waiting for your instruction…"}
      </div>
    </div>
  );
}
