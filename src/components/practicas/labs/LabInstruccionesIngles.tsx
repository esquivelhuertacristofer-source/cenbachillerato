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
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { hablarLab, callarLab, puedeHablarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { INSTRUCCIONES_INGLES_HUECOS } from "./instrucciones-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
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
  GLOSARIO_A5,
  TAREA_A5,
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
const RUTA_FOTOS = "/media/labs-sim/instrucciones-ingles";

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
  const [reaccion, setReaccion] = useState<"ok" | "mal" | null>(null);

  const indActual = INDIRECTAS[indIdx] ?? INDIRECTAS[0]!;

  const irA = (i: number) => {
    const q = INDIRECTAS[i];
    if (!q) return;
    cancelaAvance();
    setIndIdx(i);
    setReaccion(null);
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
      setReaccion("ok");
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
      setReaccion("mal");
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
    setReaccion(null);
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


  const lectura =
    modo === "ejecuta" ? (
      <>Tareas cumplidas: {nTareas}/{TAREAS.length}</>
    ) : modo === "ambigua" ? (
      <>Precisas elegidas: {nPrecisas}/{PARES.length} · explicadas: {nFaltas}/{PARES.length}</>
    ) : modo === "secuencia" ? (
      <>Procedimientos reparados: {secuenciasOk}/{PROCEDIMIENTOS.length}</>
    ) : modo === "pregunta" ? (
      <>Preguntas indirectas armadas: {nIndirectas}/{INDIRECTAS.length}</>
    ) : (
      <>Texto de la receta</>
    );

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div className="ins-instr">
      <span>{txt}</span>
      {n && <span style={{ color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
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
          <style>{css(accent, color.rgba)}</style>

          {/* MODO 1 */}
          {modo === "ejecuta" && (
            <>
              <PantallaPlataforma desenlace={desenlace} accent={accent} />

              {instruccion(`Tarea ${tareaIdx + 1} de ${TAREAS.length} · la máquina obedece literalmente`, `${nTareas}/${TAREAS.length}`, nTareas >= TAREAS.length)}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TAREAS.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    className="ins-ficha"
                    data-on={i === tareaIdx}
                    onClick={() => {
                      cancelaAvance();
                      setTareaIdx(i);
                      setDesenlace(null);
                    }}
                    style={tareasHechas[t.id] ? { borderColor: OK, color: "#fff" } : undefined}
                  >
                    <i className={`fa-solid ${tareasHechas[t.id] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 14, color: tareasHechas[t.id] ? OK : T.text3 }} />
                    {i + 1}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 15, color: T.text, fontWeight: 700, lineHeight: 1.5 }}>
                <i className="fa-solid fa-bullseye" style={{ color: accent, marginRight: 9 }} />
                {tareaActual.meta}
              </div>

              <FilaFichas titulo="Verbo (imperativo)" icono="fa-bolt">
                {VERBOS.map((v) => (
                  <button key={v} type="button" className="ins-ficha" data-on={verbo === v} onClick={() => setVerbo(v)}>
                    {v}
                  </button>
                ))}
              </FilaFichas>

              <FilaFichas titulo="Qué (objeto directo)" icono="fa-hand-pointer">
                {OBJETOS.map((o) => (
                  <button key={o.id} type="button" className="ins-ficha" data-on={objetoSel === o.id} onClick={() => setObjetoSel(o.id)}>
                    {o.texto}
                  </button>
                ))}
              </FilaFichas>

              <FilaFichas titulo="Dónde (detalle, opcional)" icono="fa-location-dot">
                {DETALLES.map((d) => (
                  <button key={d.id} type="button" className="ins-ficha" data-on={detalleSel === d.id} onClick={() => setDetalleSel(d.id)}>
                    {d.texto || d.etiqueta}
                  </button>
                ))}
              </FilaFichas>

              <div className="ins-orden">
                <i className="fa-solid fa-quote-left" style={{ color: accent, fontSize: 15 }} />
                <span className="ins-orden-txt">{fraseActual}</span>
                <BotonEscuchar texto={fraseActual} onPlay={contarEscucha} />
                <button type="button" className="ins-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={correr}>
                  <i className="fa-solid fa-play" />
                  Ejecutar
                </button>
              </div>

              {desenlace && (
                <div className="ins-res" data-clase={desenlace.clase} role="status">
                  <i
                    className={`fa-solid ${desenlace.clase === "exito" ? "fa-circle-check" : desenlace.clase === "ambigua" ? "fa-triangle-exclamation" : "fa-circle-xmark"}`}
                    style={{ color: desenlace.clase === "exito" ? OK : desenlace.clase === "ambigua" ? AMBAR : NO, fontSize: 16, marginTop: 2 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.5 }}>{desenlace.mensaje}</div>
                    <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.55, marginTop: 6 }}>{desenlace.leccion}</div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button type="button" className="ins-btn" onClick={() => setAyudaTarea((a) => ({ ...a, [tareaActual.id]: true }))} disabled={!!ayudaTarea[tareaActual.id]}>
                  <i className="fa-solid fa-lightbulb" />
                  Ver una instrucción que sí funciona
                </button>
                {ayudaTarea[tareaActual.id] && <span className="ins-mono">{tareaActual.ejemplo}</span>}
              </div>
            </>
          )}

          {/* MODO 2 */}
          {modo === "ambigua" && (
            <>
              {instruccion("Elige la instrucción que no admite otra lectura", `${nPrecisas}/${PARES.length} elegidas · ${nFaltas}/${PARES.length} explicadas`, nFaltas >= PARES.length)}
              <div className="ins-nota">
                Las dos frases de cada par son inglés correcto y las dos se entienden. Solo una se puede <strong style={{ color: T.text2 }}>obedecer sin preguntar</strong>. Después de elegirla,
                di qué dato le falta a la otra.
              </div>

              {PARES.map((par) => {
                const elegida = !!parElegida[par.id];
                const faltaOk = !!parFalta[par.id];
                return (
                  <div key={par.id} className="ins-par" data-shake={shakePar === par.id} data-done={faltaOk}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%, 240px),1fr))", gap: 11 }}>
                      {(["a", "b"] as const).map((lado) => {
                        const texto = lado === "a" ? par.a : par.b;
                        const esPrecisa = par.precisa === lado;
                        const res = elegida ? (esPrecisa ? "bien" : "mal") : undefined;
                        return (
                          <button key={lado} type="button" className="ins-opt" data-res={res} disabled={elegida} onClick={() => elegirPrecisa(par.id, lado)}>
                            <span
                              style={{
                                width: 24,
                                height: 24,
                                flexShrink: 0,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
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
                        <div style={{ fontSize: 14.5, color: T.text2, fontWeight: 700, marginBottom: 9 }}>
                          <i className="fa-solid fa-circle-question" style={{ color: accent, marginRight: 8 }} />
                          ¿Qué dato le falta a «{par.precisa === "a" ? par.b : par.a}»?
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {FALTAS.map((f) => {
                            const info = FALTA_INFO[f];
                            const marca = faltaOk && par.falta === f ? "bien" : undefined;
                            return (
                              <button key={f} type="button" className="ins-falta" data-res={marca} disabled={faltaOk} onClick={() => elegirFalta(par.id, f)}>
                                <i className={`fa-solid ${info.icono}`} style={{ fontSize: 14 }} />
                                {info.etq}
                              </button>
                            );
                          })}
                        </div>
                        {faltaOk && (
                          <div style={{ marginTop: 11, display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 15, marginTop: 2 }} />
                            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                              <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.55 }}>{par.porque}</div>
                              <div className="ins-nota" style={{ marginTop: 5 }}>
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
              {instruccion("Los conectores están en orden. Los pasos, no.", `${secuenciasOk}/${PROCEDIMIENTOS.length} reparados`, secuenciasOk >= PROCEDIMIENTOS.length)}
              <div className="ins-nota">
                First, Then, After that, Next y Finally ya están donde deben. Aun así, la secuencia no funciona: ejecútala al pie de la letra y verás por qué. Intercambia dos pasos tocándolos
                (o arrastrando uno sobre otro) hasta que cada paso caiga bajo su conector.
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
              {instruccion("De la pregunta directa a la pregunta indirecta", `${nIndirectas}/${INDIRECTAS.length}`, nIndirectas >= INDIRECTAS.length)}
              <div className="ins-nota">
                Para <strong style={{ color: T.text2 }}>pedir</strong> instrucciones con cortesía no se usa la pregunta directa: después de «Could you tell me…» o «Do you know…» el orden vuelve a ser
                el de una oración normal. Toca las fichas en el orden correcto; algunas sobran.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {INDIRECTAS.map((q, i) => (
                  <button key={q.id} type="button" className="ins-ficha" data-on={i === indIdx} onClick={() => irA(i)}>
                    <i className={`fa-solid ${indHechas[q.id] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 14, color: indHechas[q.id] ? OK : T.text3 }} />
                    {i + 1}
                  </button>
                ))}
              </div>

              <Foto clave={`ind-${indActual.id}`} icono="fa-person-circle-question" alt={indActual.contexto} />
              <div className="ins-nota">{indActual.contexto}</div>

              <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                <span className="ins-etq">Pregunta directa</span>
                <span className="ins-mono" style={{ color: T.text2 }}>{indActual.directa}</span>
                <BotonEscuchar texto={indActual.directa} onPlay={contarEscucha} />
              </div>

              <div className="ins-frase" data-shake={indShake}>
                <span className="ins-mono" style={{ fontSize: 16, fontWeight: 900, color: accent }}>{indActual.apertura}</span>
                {piezas.map((p, i) => (
                  <button
                    key={i}
                    type="button"
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
                    <button key={f} type="button" className="ins-ficha" disabled={puesta || !!indHechas[indActual.id]} style={puesta ? { opacity: 0.32 } : undefined} onClick={() => ponerFicha(f)}>
                      {f}
                    </button>
                  );
                })}
              </div>

              {reaccion && (
                <div className="ins-burbuja" data-ok={reaccion === "ok"} role="status">
                  <i className={`fa-solid ${reaccion === "ok" ? "fa-face-smile" : "fa-face-confused"}`} style={{ fontSize: 22, color: reaccion === "ok" ? OK : AMBAR }} />
                  <span>
                    {reaccion === "ok"
                      ? "La persona sonríe y te explica con calma: la pregunta cortés y bien armada se entiende a la primera."
                      : "La persona frunce el ceño: «Sorry? I didn't get that.» El orden de las palabras no era el de una oración normal."}
                  </span>
                </div>
              )}

              {indRegla && (
                <div className="ins-res" data-clase={indHechas[indActual.id] ? "exito" : "ambigua"}>
                  <i
                    className={`fa-solid ${indHechas[indActual.id] ? "fa-circle-check" : "fa-lightbulb"}`}
                    style={{ color: indHechas[indActual.id] ? OK : AMBAR, fontSize: 16, marginTop: 2 }}
                  />
                  <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                    {indHechas[indActual.id] && (
                      <div className="ins-mono" style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                        {fraseIndirecta(indActual, indActual.solucion)}
                      </div>
                    )}
                    <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.55 }}>{indActual.regla}</div>
                    {indHechas[indActual.id] && <div className="ins-nota" style={{ marginTop: 5, fontStyle: "italic" }}>{indActual.traduccion}</div>}
                  </div>
                  {indHechas[indActual.id] && <BotonEscuchar texto={fraseIndirecta(indActual, indActual.solucion)} onPlay={contarEscucha} />}
                </div>
              )}
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
      }
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Tareas" value={`${nTareas}/${TAREAS.length}`} col={nTareas >= TAREAS.length ? OK : undefined} />
                  <Dato label="Pares" value={`${nFaltas}/${PARES.length}`} col={nFaltas >= PARES.length ? OK : undefined} />
                  <Dato label="Secuencias" value={`${secuenciasOk}/${PROCEDIMIENTOS.length}`} col={secuenciasOk >= PROCEDIMIENTOS.length ? OK : undefined} />
                  <Dato label="Indirectas" value={`${nIndirectas}/${INDIRECTAS.length}`} col={nIndirectas >= INDIRECTAS.length ? OK : undefined} />
                </div>
                {mejorEstrellas >= 3 && (
                  <p style={{ margin: 0, color: OK, fontWeight: 700 }}>
                    <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
                    Ya das instrucciones que solo se pueden leer de una forma.
                  </p>
                )}
              </Bloque>
              <Bloque titulo="Qué mover en este modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "ejecuta" && (
                    <>
                      La máquina lee la pantalla de arriba abajo. Si tu frase alcanza a varios elementos, obedece el <strong style={{ color: T.text }}>primero</strong> que encuentra —y el primer
                      botón es el rojo—. Añade el color, el nombre exacto o el lugar.
                    </>
                  )}
                  {modo === "ambigua" && (
                    <>
                      Pregúntale a la frase: <strong style={{ color: T.text }}>How much? Which one? Where exactly? How long? In what order? With what?</strong> Si alguna se queda sin respuesta,
                      ahí está el hueco.
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
                      Regla de oro: después de «Could you tell me» o «Do you know», <strong style={{ color: T.text }}>sujeto antes que verbo</strong> y sin «do/does». Para sí/no, empieza con «if».
                    </>
                  )}
                  {modo === "texto" && (
                    <>
                      Este es el texto de la actividad <strong style={{ color: T.text }}>A2</strong>, tal cual. Escribe el conector o el verbo en imperativo; no se distinguen mayúsculas.
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
              quiz={QUIZ_A3}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={(ok) => (ok ? sfxOk() : sfxNo())}
              mensajeAprobado="Ya distingues el imperativo, la negación y cada conector de secuencia."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={INSTRUCCIONES_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo={`Lectura A1 · ${INSTRUCCIONES_INGLES_FICHA.ancla}`} icono="fa-book-open-reader">
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>{p}</p>
                ))}
              </Bloque>
              <Bloque titulo="Did you know? (A1)" icono="fa-scroll">
                <p style={{ margin: 0, color: T.text2 }}>{RECUADRO_A1}</p>
              </Bloque>
              <Bloque titulo="Comprensión de la lectura A1" icono="fa-circle-question">
                {PREGUNTAS_A1.map((p) => (
                  <p key={p.pregunta} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{p.pregunta}</strong> {p.respuesta}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Hechos comprobados (A4)" icono="fa-circle-check">
                {HECHOS_A4.map((h) => (
                  <p key={h.enunciado} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: h.respuesta ? OK : NO }}>{h.respuesta ? "TRUE" : "FALSE"}</strong> {h.enunciado} <em style={{ color: T.text3 }}>{h.retro}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-spell-check">
                {GLOSARIO_A5.map((g) => (
                  <p key={g.termino} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{g.termino}.</strong> {g.definicion} <em>{g.ejemplo}</em>
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>{TAREA_A5}</p>
              </Bloque>
              <Bloque titulo="Nota sobre la práctica" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text3 }}>
                  {NOTA_PRACTICA} Fuente: {INSTRUCCIONES_INGLES_FICHA.fuente}.
                </p>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Imagen con respaldo: gradiente + ícono detrás; si la imagen no existe, se oculta.
 * ═══════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono, alt }: { clave: string; icono: string; alt: string }) {
  const [fallo, setFallo] = useState<string | null>(null);
  return (
    <div className="ins-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {fallo !== clave && <img key={clave} src={`${RUTA_FOTOS}/${clave}.webp`} alt={alt} loading="lazy" onError={() => setFallo(clave)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Piezas de presentación
 * ═══════════════════════════════════════════════════════════════════════ */

function FilaFichas({ titulo, icono, children }: { titulo: string; icono: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="ins-etq" style={{ marginBottom: 8 }}>
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
    <div className="ins-proc" data-done={listo}>
      <Foto clave={`proc-${proc.id}`} icono={proc.icono} alt={proc.titulo} />
      <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
        <VinetaTermino termino={proc.titulo} color={accent} icono={proc.icono} tam={35} radio={10} />
        <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{proc.titulo}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: listo ? OK : T.text3 }}>
          {puestos}/{proc.pasos.length} en su sitio
        </span>
      </div>
      <div className="ins-nota">{proc.contexto}</div>

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
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.45 }}>{paso.texto}</div>
                <div className="ins-nota" style={{ marginTop: 3, fontStyle: "italic" }}>{paso.traduccion}</div>
                {esFallo && sim?.fallo && (
                  <div style={{ fontSize: 14, color: NO, lineHeight: 1.45, marginTop: 6, fontWeight: 700 }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
                    {sim.fallo}
                  </div>
                )}
              </div>
              <i className="fa-solid fa-grip-vertical" style={{ color: T.text3, fontSize: 14, marginTop: 3 }} />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="ins-btn" onClick={onCorrer}>
          <i className="fa-solid fa-person-running" />
          Ejecutar al pie de la letra
        </button>
        {sim && !sim.pasoFallo && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14.5, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" />
            {proc.exito}
          </span>
        )}
        {sim && sim.pasoFallo && (
          <span style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.5 }}>
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
        {el.clase === "archivo" && <i className="fa-solid fa-file-lines" style={{ fontSize: 14, opacity: 0.8 }} />}
        {el.clase === "campo" && <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 14, opacity: 0.8 }} />}
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
          <div className="ins-etq" style={{ marginBottom: 2 }}>My files</div>
          {lista.map((e) => pinta(e.id))}
        </div>
      </div>
      <div className="ins-pie">{pinta("btn-send")}</div>
      <div
        style={{
          padding: "10px 14px",
          borderTop: `1px solid ${T.line}`,
          fontSize: 14,
          color: T.text3,
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "rgba(2,12,28,0.5)",
        }}
      >
        <span style={{ width: 8, height: 8, flexShrink: 0, borderRadius: "50%", background: accent, boxShadow: `0 0 10px ${accent}` }} />
        <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{desenlace ? desenlace.mensaje : "Waiting for your instruction…"}</span>
      </div>
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes insShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes insPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .ins-instr { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; font-size:15px; font-weight:800; color:${T.text}; }
  .ins-nota { font-size:14px; color:${T.text3}; line-height:1.55; }
  .ins-etq { font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text3}; }
  .ins-mono { font-size:15px; font-weight:700; color:${T.text2}; font-family:ui-monospace,"SFMono-Regular",Menlo,monospace; overflow-wrap:anywhere; }
  .ins-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 16px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; font-family:inherit; transition:all .14s; }
  .ins-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .ins-btn:disabled { opacity:.45; cursor:default; }
  .ins-escuchar { cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:8px; flex-shrink:0;
    border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; font-family:inherit; transition:all .14s; }
  .ins-escuchar:hover { border-color:${accent}; color:#fff; background:rgba(${rgba},0.14); }
  .ins-ficha { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:10px 14px; border-radius:11px; max-width:100%; text-align:left;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; font-size:14.5px; font-weight:700;
    transition:all .14s; user-select:none; font-family:ui-monospace,"SFMono-Regular",Menlo,monospace; }
  .ins-ficha:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; transform:translateY(-2px); }
  .ins-ficha[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); color:#fff; box-shadow:0 0 16px -5px ${accent}; }
  .ins-orden { display:flex; align-items:center; gap:12px; flex-wrap:wrap; border-radius:13px; border:1.5px solid rgba(${rgba},0.4); background:rgba(${rgba},0.09); padding:14px 16px; }
  .ins-orden-txt { flex:1 1 200px; min-width:0; font-size:16px; font-weight:800; color:#fff; overflow-wrap:anywhere; font-family:ui-monospace,"SFMono-Regular",Menlo,monospace; }
  .ins-res { display:flex; gap:11px; align-items:flex-start; flex-wrap:wrap; border-radius:13px; padding:13px 16px; border:1.5px solid ${NO}66; background:${NO}12; }
  .ins-res[data-clase="exito"] { border-color:${OK}66; background:${OK}12; }
  .ins-res[data-clase="ambigua"] { border-color:${AMBAR}66; background:${AMBAR}12; }
  .ins-burbuja { display:flex; align-items:center; gap:12px; border-radius:16px; padding:13px 16px; font-size:15px; line-height:1.5; color:${T.text2};
    border:1.5px solid ${AMBAR}66; background:${AMBAR}12; }
  .ins-burbuja[data-ok="true"] { border-color:${OK}66; background:${OK}12; }
  .ins-foto { position:relative; width:100%; aspect-ratio:16/9; max-height:190px; border-radius:14px; overflow:hidden; border:1px solid ${T.line};
    background:linear-gradient(135deg, rgba(${rgba},0.25) 0%, rgba(8,22,44,0.95) 100%); display:flex; align-items:center; justify-content:center; }
  .ins-foto i { font-size:44px; color:rgba(255,255,255,0.28); }
  .ins-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }

  /* pantalla simulada */
  .ins-pantalla { border-radius:16px; border:1.5px solid ${T.lineStrong}; background:linear-gradient(180deg,#081a31 0%,#04101f 100%);
    overflow:hidden; box-shadow:0 18px 44px -24px rgba(0,0,0,0.8); }
  .ins-topbar { display:flex; align-items:center; gap:10px; padding:11px 14px; border-bottom:1px solid ${T.line}; background:rgba(255,255,255,0.03); flex-wrap:wrap; }
  .ins-marca { font-size:14px; font-weight:900; letter-spacing:.04em; color:${accent}; }
  .ins-cuerpo { display:grid; grid-template-columns:minmax(0,0.8fr) minmax(0,2fr); gap:0; }
  .ins-menu { border-right:1px solid ${T.line}; padding:12px 10px; display:flex; flex-direction:column; align-items:flex-start; gap:7px; }
  .ins-lista { padding:12px 14px; display:flex; flex-direction:column; align-items:flex-start; gap:8px; }
  .ins-pie { padding:11px 14px; border-top:1px solid ${T.line}; display:flex; justify-content:flex-end; background:rgba(255,255,255,0.02); }
  .ins-el { border-radius:9px; border:1.5px solid transparent; padding:8px 12px; font-size:14px; font-weight:700;
    display:inline-flex; align-items:center; gap:8px; transition:all .2s; }
  .ins-el[data-tipo="boton"] { color:#04121f; }
  .ins-el[data-tipo="menu"], .ins-el[data-tipo="archivo"] { background:rgba(255,255,255,0.05); border-color:${T.line}; color:${T.text2}; }
  .ins-el[data-tipo="campo"] { background:rgba(2,12,28,0.7); border-color:${T.line}; color:${T.text3}; flex:1; min-width:0; font-weight:600; }
  .ins-el[data-hl="cand"] { border-color:${AMBAR}; box-shadow:0 0 0 2px ${AMBAR}44; }
  .ins-el[data-hl="mal"] { border-color:${NO}; box-shadow:0 0 22px -4px ${NO}; transform:scale(1.04); }
  .ins-el[data-hl="bien"] { border-color:${OK}; box-shadow:0 0 22px -4px ${OK}; transform:scale(1.04); }

  /* pares */
  .ins-par { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; }
  .ins-par[data-shake="true"] { animation:insShake .4s; border-color:${NO}; }
  .ins-par[data-done="true"] { border-color:${OK}66; background:${OK}0d; }
  .ins-opt { cursor:pointer; text-align:left; width:100%; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; font-family:inherit;
    color:${T.text2}; font-size:15px; font-weight:700; padding:12px 14px; transition:all .14s; line-height:1.45; display:flex; gap:10px; align-items:flex-start; }
  .ins-opt:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
  .ins-opt:disabled { cursor:default; }
  .ins-opt[data-res="bien"] { border-color:${OK}; background:${OK}1a; color:#fff; }
  .ins-opt[data-res="mal"] { border-color:${NO}66; background:${NO}12; }
  .ins-falta { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:9px 13px; border-radius:10px; font-family:inherit;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .ins-falta:hover:not(:disabled) { border-color:${accent}; color:#fff; background:rgba(${rgba},0.14); }
  .ins-falta:disabled { cursor:default; }
  .ins-falta[data-res="bien"] { border-color:${OK}; background:${OK}1c; color:#fff; }

  /* secuencia */
  .ins-proc { display:flex; flex-direction:column; gap:12px; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; }
  .ins-proc[data-done="true"] { border-color:${OK}55; }
  .ins-paso { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glassSoft}; padding:12px 14px; display:flex; gap:12px;
    align-items:flex-start; transition:all .16s; cursor:grab; }
  .ins-paso:hover { border-color:${T.lineStrong}; }
  .ins-paso:active { cursor:grabbing; }
  .ins-paso[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 16px -5px ${accent}; }
  .ins-paso[data-ok="true"] { border-color:${OK}66; background:${OK}0f; }
  .ins-paso[data-fallo="true"] { border-color:${NO}; background:${NO}12; animation:insShake .4s; }
  .ins-conector { flex-shrink:0; min-width:76px; text-align:center; font-size:14px; font-weight:900; letter-spacing:.04em;
    text-transform:uppercase; color:${accent}; border:1px solid rgba(${rgba},0.45); background:rgba(${rgba},0.12);
    border-radius:8px; padding:5px 8px; }

  /* preguntas indirectas */
  .ins-slot { min-width:96px; min-height:44px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; font-family:inherit;
    display:inline-flex; align-items:center; justify-content:center; padding:6px 12px; font-size:15px; font-weight:800; color:${T.text3};
    transition:all .16s; cursor:pointer; }
  .ins-slot[data-full="true"] { border-style:solid; border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; animation:insPop .2s ease; }
  .ins-slot[data-ok="true"] { border-color:${OK}; background:${OK}1a; color:#fff; }
  .ins-frase { display:flex; align-items:center; gap:9px; flex-wrap:wrap; }
  .ins-frase[data-shake="true"] { animation:insShake .45s; }
  .ins-ficha:focus-visible, .ins-opt:focus-visible, .ins-paso:focus-visible, .ins-slot:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  @media (max-width: 520px){ .ins-cuerpo { grid-template-columns:minmax(0,1fr); } .ins-menu { border-right:none; border-bottom:1px solid ${T.line}; } }
  @media (prefers-reduced-motion: reduce){
    .ins-par[data-shake="true"], .ins-paso[data-fallo="true"], .ins-frase[data-shake="true"], .ins-slot[data-full="true"] { animation:none; }
    .ins-ficha:hover { transform:none; }
  }
`;
