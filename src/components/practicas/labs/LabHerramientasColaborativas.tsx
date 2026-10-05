"use client";

/**
 * Laboratorio — Trabajar juntos en la nube: herramientas colaborativas
 * Práctica interactiva para CD-II-P02 (Ciudadanía Digital II).
 *
 * El alumno no solo clasifica herramientas: organiza UNA SEMANA de proyecto de
 * un equipo FICTICIO de 4 estudiantes (Ana, Beto, Carla y Diego, cada uno con
 * un horario y una necesidad distinta). Elige la herramienta para cada
 * necesidad, define permisos e historial de versiones del documento, y una
 * línea de tiempo (lunes a viernes) muestra qué pasa cada día mientras tres
 * medidores (avance, conflictos, participación; valores de simulación) reaccionan.
 * El modelo vive en `herramientas-colaborativas-sim.ts`.
 *
 * Modos extra (verbatim de CD-II·P02):
 *  · «¿Qué herramienta uso?», «Funciones de la nube», «Buenas prácticas vs.
 *    errores» (arrastrar/clasificar, dentro de <Mesa>) y «Completa el texto».
 *  + Cuestionario V/F (A4) en la pestaña Reto.
 *
 * DOM + SVG (sin three.js): accesible por ratón, teclado y táctil
 * (clic-para-seleccionar / clic-para-colocar).
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { HERRAMIENTAS_COLABORATIVAS_HUECOS } from "./herramientas-colaborativas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { HERRAMIENTAS_COLABORATIVAS_FICHA } from "./herramientas-colaborativas-ficha";
import {
  TAREAS,
  CATEGORIA_INFO,
  FUNCIONES,
  ACCIONES,
  JUICIO_INFO,
  QUIZ,
  DATO_NUBE,
  type Categoria,
  type Juicio,
} from "./herramientas-colaborativas-data";
import {
  EQUIPO,
  NECESIDADES,
  PERMISOS_INFO,
  DIAS,
  DIAS_CORTOS,
  META,
  simular,
  type Decisiones,
  type NecesidadId,
  type Permisos,
  type EventoDia,
} from "./herramientas-colaborativas-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-herramientas-colaborativas-reto";
const FOTOS = "/media/labs-sim/herramientas-colaborativas";

type Modo = "semana" | "herramienta" | "funciones" | "practicas" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "semana", label: "Semana de proyecto", icono: "fa-calendar-week" },
  { id: "herramienta", label: "¿Qué herramienta uso?", icono: "fa-cloud" },
  { id: "funciones", label: "Funciones de la nube", icono: "fa-arrows-rotate" },
  { id: "practicas", label: "Buenas prácticas vs. errores", icono: "fa-scale-balanced" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const DECISIONES_INICIO: Decisiones = { eleccion: {}, permisos: "todos", historial: false };

export function LabHerramientasColaborativas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("semana");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
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
  // Los tres ayudantes son el único punto por el que pasan todos los aciertos
  // y todos los fallos de los modos de clasificar, así que la partida se lleva aquí.
  // `sfxOk` no cuenta: marca el fin de un modo, no una respuesta suelta.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };
  // El simulador explora: sus decisiones suenan pero no restan estrellas.
  const sfxSim = (ok: boolean) => sonido && (ok ? audioRef.current?.blip() : audioRef.current?.incorrecto());

  // ── simulador de la semana ─────────────────────────────────────────────
  const [dec, setDec] = useState<Decisiones>(DECISIONES_INICIO);
  const [metaLograda, setMetaLograda] = useState(false);
  const resultado = simular(dec);
  const todasDecididas = resultado.decididas === NECESIDADES.length;

  const aplicarDecisiones = (nueva: Decisiones) => {
    setDec(nueva);
    if (simular(nueva).meta) setMetaLograda(true);
  };
  const elegir = (necesidad: NecesidadId, opcion: string) => {
    const n = NECESIDADES.find((x) => x.id === necesidad);
    sfxSim(!!n?.opciones.find((o) => o.id === opcion)?.ok);
    aplicarDecisiones({ ...dec, eleccion: { ...dec.eleccion, [necesidad]: opcion } });
  };
  const cambiarPermisos = (p: Permisos) => {
    sfxSim(p === "roles");
    aplicarDecisiones({ ...dec, permisos: p });
  };
  const cambiarHistorial = (h: boolean) => {
    sfxSim(h);
    aplicarDecisiones({ ...dec, historial: h });
  };
  const resetSemana = () => {
    setDec(DECISIONES_INICIO);
  };

  // ── modo herramienta (clasifica cada tarea por categoría) ───────────────
  const [ubicTarea, setUbicTarea] = useState<Record<string, Categoria>>({});
  const [selTarea, setSelTarea] = useState<string | null>(null);
  const [shakeCat, setShakeCat] = useState<Categoria | null>(null);
  const tareasLibres = TAREAS.filter((t) => !ubicTarea[t.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarTarea = (tareaId: string, bin: Categoria) => {
    if (ubicTarea[tareaId]) return;
    const t = TAREAS.find((x) => x.id === tareaId);
    if (t && t.categoria === bin) {
      setUbicTarea((e) => ({ ...e, [tareaId]: bin }));
      setSelTarea(null);
      sfxPlace();
      if (Object.keys(ubicTarea).length + 1 >= TAREAS.length) {
        sfxOk();
        persistMejor(true, funcionesDone, practicasDone);
      }
    } else {
      setShakeCat(bin);
      sfxNo();
      window.setTimeout(() => setShakeCat(null), 420);
    }
  };
  const resetTareas = () => {
    setUbicTarea({});
    setSelTarea(null);
  };

  // ── modo funciones (empareja función → descripción) ─────────────────────
  const [empFunc, setEmpFunc] = useState<Record<string, boolean>>({});
  const [selFunc, setSelFunc] = useState<string | null>(null);
  const [shakeFunc, setShakeFunc] = useState<string | null>(null);
  const funcLibres = FUNCIONES.filter((f) => !empFunc[f.id]).slice().sort((a, b) => a.funcion.localeCompare(b.funcion, "es"));

  const intentarFunc = (chipId: string, rowId: string) => {
    if (empFunc[rowId]) return;
    if (chipId === rowId) {
      setEmpFunc((e) => ({ ...e, [rowId]: true }));
      setSelFunc(null);
      sfxPlace();
      if (Object.keys(empFunc).length + 1 >= FUNCIONES.length) {
        sfxOk();
        persistMejor(herramientaDone, true, practicasDone);
      }
    } else {
      setShakeFunc(rowId);
      sfxNo();
      window.setTimeout(() => setShakeFunc(null), 420);
    }
  };
  const resetFunciones = () => {
    setEmpFunc({});
    setSelFunc(null);
  };

  // ── modo prácticas (clasifica acción en buena práctica / error) ─────────
  const [ubicAccion, setUbicAccion] = useState<Record<string, Juicio>>({});
  const [selAccion, setSelAccion] = useState<string | null>(null);
  const [shakeJuicio, setShakeJuicio] = useState<Juicio | null>(null);
  const accionesLibres = ACCIONES.filter((a) => !ubicAccion[a.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarAccion = (accionId: string, bin: Juicio) => {
    if (ubicAccion[accionId]) return;
    const a = ACCIONES.find((x) => x.id === accionId);
    if (a && a.juicio === bin) {
      setUbicAccion((e) => ({ ...e, [accionId]: bin }));
      setSelAccion(null);
      sfxPlace();
      if (Object.keys(ubicAccion).length + 1 >= ACCIONES.length) {
        sfxOk();
        persistMejor(herramientaDone, funcionesDone, true);
      }
    } else {
      setShakeJuicio(bin);
      sfxNo();
      window.setTimeout(() => setShakeJuicio(null), 420);
    }
  };
  const resetAcciones = () => {
    setUbicAccion({});
    setSelAccion(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const herramientaDone = Object.keys(ubicTarea).length >= TAREAS.length;
  const funcionesDone = Object.keys(empFunc).length >= FUNCIONES.length;
  const practicasDone = Object.keys(ubicAccion).length >= ACCIONES.length;
  const modosHechos = (herramientaDone ? 1 : 0) + (funcionesDone ? 1 : 0) + (practicasDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Elige una herramienta para cada una de las 6 necesidades del equipo", done: todasDecididas },
    { txt: "Logra la entrega del viernes: avance 70 o más, máximo 2 conflictos y participación 60 o más", done: metaLograda },
    { txt: "Clasifica las 8 tareas por herramienta", done: herramientaDone },
    { txt: "Empareja las 4 funciones de la nube", done: funcionesDone },
    { txt: "Clasifica las 8 acciones: buena práctica o error", done: practicasDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  // arrastre nativo
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
    "data-zona": "true" as const,
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  });

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual =
    modo === "texto" ? resetTexto : modo === "herramienta" ? resetTareas : modo === "funciones" ? resetFunciones : modo === "practicas" ? resetAcciones : resetSemana;

  const lectura =
    modo === "semana"
      ? `${resultado.decididas}/${NECESIDADES.length} · avance ${resultado.avance} · conflictos ${resultado.conflictos}`
      : `${modosHechos}/4 · ${bestEstrellas}★`;

  const pistaDe: Record<Modo, string> = {
    semana: "Cada necesidad tiene tres herramientas. Piensa en quién la usa y desde dónde: no todos tienen computadora ni el mismo horario.",
    herramienta: "Para escribir juntos usa un documento; para lluvia de ideas un pizarrón; para organizar tareas un tablero kanban.",
    funciones: "La nube ofrece edición simultánea, historial de versiones, comentarios y sincronización entre dispositivos.",
    practicas: "Define roles, nombra bien los archivos y comenta para sugerir: así el trabajo en equipo fluye sin perder información.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "semana" && (
        <Semana
          accent={accent}
          dec={dec}
          resultado={resultado}
          onElegir={elegir}
          onPermisos={cambiarPermisos}
          onHistorial={cambiarHistorial}
          onReiniciar={resetSemana}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={HERRAMIENTAS_COLABORATIVAS_HUECOS}
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

      {modo === "herramienta" && (
        <Mesa>
          <div className="hcol-panel">
            <Banco titulo="Arrastra cada tarea a la herramienta adecuada" hechas={Object.keys(ubicTarea).length} total={TAREAS.length} done={herramientaDone} fin={`¡Clasificaste las ${TAREAS.length} tareas!`}>
              {tareasLibres.map((t) => (
                <button key={t.id} className="hcol-chip" data-sel={selTarea === t.id} onClick={() => setSelTarea((s) => (s === t.id ? null : t.id))} {...dragProps(t.id)}>
                  {t.texto}
                </button>
              ))}
            </Banco>
          </div>
          <BinsTareas selTarea={selTarea} shakeCat={shakeCat} ubicTarea={ubicTarea} onMatch={intentarTarea} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "funciones" && (
        <Mesa>
          <div className="hcol-panel">
            <Banco titulo="Arrastra cada función a su descripción" hechas={Object.keys(empFunc).length} total={FUNCIONES.length} done={funcionesDone} fin={`¡Emparejaste las ${FUNCIONES.length} funciones!`}>
              {funcLibres.map((f) => (
                <button key={f.id} className="hcol-chip" data-sel={selFunc === f.id} onClick={() => setSelFunc((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                  <i className="fa-solid fa-cloud" style={{ fontSize: 14, color: T.text3 }} />
                  {f.funcion}
                </button>
              ))}
            </Banco>
          </div>
          <RowsFunciones selFunc={selFunc} shakeFunc={shakeFunc} empFunc={empFunc} onMatch={intentarFunc} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "practicas" && (
        <Mesa>
          <div className="hcol-panel">
            <Banco titulo="Arrastra cada acción a su cesta" hechas={Object.keys(ubicAccion).length} total={ACCIONES.length} done={practicasDone} fin={`¡Clasificaste las ${ACCIONES.length} acciones!`}>
              {accionesLibres.map((a) => (
                <button key={a.id} className="hcol-chip" data-sel={selAccion === a.id} onClick={() => setSelAccion((s) => (s === a.id ? null : a.id))} {...dragProps(a.id)}>
                  {a.texto}
                </button>
              ))}
            </Banco>
          </div>
          <BinsAcciones selAccion={selAccion} shakeJuicio={shakeJuicio} ubicAccion={ubicAccion} onMatch={intentarAccion} dropProps={dropProps} />
        </Mesa>
      )}
    </div>
  );

  return (
    <LabShell
      dom
      accent={accent}
      rgba={color.rgba}
      escena={escena}
      modos={{ opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })), valor: modo, cambiar: (id) => setModo(id as Modo) }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="La semana (simulación)" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Avance" value={`${resultado.avance} / 100`} col={resultado.avance >= META.avance ? OK : undefined} />
                  <Dato label="Conflictos" value={`${resultado.conflictos}`} col={resultado.conflictos <= META.conflictos ? OK : NO} />
                  <Dato label="Participación" value={`${resultado.participacion} / 100`} col={resultado.participacion >= META.participacion ? OK : undefined} />
                  <Dato label="Necesidades" value={`${resultado.decididas} / ${NECESIDADES.length}`} />
                </div>
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Colaboras en la nube como un profesional!" : "Termina los tres modos de clasificar para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pistaDe[modo]}</div>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-clipboard-question",
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Teoría de la práctica" icono="fa-book-open">
                <FichaTeorica data={HERRAMIENTAS_COLABORATIVAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Tipos de herramienta colaborativa" icono="fa-cloud">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((c) => (
                    <div key={c} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{CATEGORIA_INFO[c].titulo}.</strong> {CATEGORIA_INFO[c].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Funciones de la nube" icono="fa-arrows-rotate">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {FUNCIONES.map((f) => (
                    <div key={f.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{f.funcion}.</strong> {f.descripcion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{f.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Buenas prácticas y errores" icono="fa-scale-balanced">
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {ACCIONES.map((a) => (
                    <div key={a.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: a.juicio === "buena" ? OK : NO }}>{JUICIO_INFO[a.juicio].titulo}:</strong> {a.texto}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_NUBE}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Estilos
 * ═══════════════════════════════════════════════════════════════════════════ */
const ESTILOS = (accent: string, rgba: string) => `
  @keyframes hcolShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes hcolPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .hcol-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:11px; }
  .hcol-grid-s { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap:10px; }
  .hcol-panel { position:relative; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px;
    display:flex; flex-direction:column; gap:11px; min-width:0; }
  .hcol-panel[data-done="true"] { border-color:${OK}66; }
  .hcol-card { position:relative; display:flex; flex-direction:column; gap:7px; text-align:left; padding:12px 13px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:14px; line-height:1.45; cursor:pointer;
    transition:transform .14s, border-color .14s, background .14s; min-width:0; }
  .hcol-card:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .hcol-card[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .hcol-card[data-tono="ok"] { border-color:${OK}88; background:${OK}14; }
  .hcol-card[data-tono="mal"] { border-color:${NO}88; background:${NO}12; }
  .hcol-card[data-tono="medio"] { border-color:${AMBAR}88; background:${AMBAR}12; }
  .hcol-card h5 { margin:0; font-size:15px; font-weight:800; }
  .hcol-tag { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:700; padding:3px 9px; border-radius:8px;
    border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  .hcol-foto { position:relative; width:100%; aspect-ratio:1/1; border-radius:12px; overflow:hidden; display:flex; align-items:center;
    justify-content:center; background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); color:rgba(255,255,255,0.55); font-size:34px; }
  .hcol-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hcol-banner { position:relative; width:100%; aspect-ratio:16/6; border-radius:14px; overflow:hidden; display:flex; align-items:center;
    justify-content:center; background:linear-gradient(135deg, rgba(${rgba},0.3), rgba(8,19,31,0.9)); color:rgba(255,255,255,0.5); font-size:40px; }
  .hcol-banner img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hcol-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; max-width:100%;
    text-align:left; line-height:1.4; transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .hcol-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .hcol-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .hcol-chip:active { cursor:grabbing; }
  .hcol-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .hcol-row[data-shake="true"] { animation:hcolShake .4s; border-color:${NO}; }
  .hcol-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .hcol-slot { flex-shrink:0; min-width:min(100%, 170px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .hcol-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .hcol-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:150px; }
  .hcol-bin[data-shake="true"] { animation:hcolShake .4s; border-color:${NO}; }
  .hcol-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .hcol-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .hcol-q:disabled{ cursor:default; }
  .hcol-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .hcol-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .hcol-btn:disabled { opacity:.45; cursor:not-allowed; }
  .hcol-barra { height:12px; border-radius:7px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .hcol-barra > i { display:block; height:100%; border-radius:7px; transition:width .7s cubic-bezier(.2,.8,.2,1), background .7s; }
  .hcol-pop { animation:hcolPop .28s ease; }
  @media (prefers-reduced-motion: reduce){
    .hcol-row[data-shake="true"], .hcol-bin[data-shake="true"], .hcol-pop { animation:none; }
    .hcol-chip, .hcol-chip:hover, .hcol-chip[data-sel="true"], .hcol-card, .hcol-card:hover { transform:none; transition:none; }
    .hcol-barra > i { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Foto con respaldo: gradiente + ícono detrás; si la imagen no existe se oculta. */
function Foto({ clave, icono, banner }: { clave: string; icono: string; banner?: boolean }) {
  const [falla, setFalla] = useState(false);
  return (
    <div className={banner ? "hcol-banner" : "hcol-foto"} aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!falla && (
        <img src={`${FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} />
      )}
    </div>
  );
}

function Banco({ titulo, hechas, total, done, fin, children }: { titulo: string; hechas: number; total: number; done: boolean; fin: string; children: React.ReactNode }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <Eyebrow>{titulo}</Eyebrow>
        <span style={{ fontSize: 14, fontWeight: 800, color: done ? OK : T.text3 }}>
          {hechas}/{total}
        </span>
      </div>
      {done ? (
        <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
          <i className="fa-solid fa-circle-check" /> {fin}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{children}</div>
      )}
    </>
  );
}

function colorMedidor(frac: number, buenoAlto: boolean) {
  const bueno = buenoAlto ? frac : 1 - frac;
  return bueno >= 0.6 ? OK : bueno >= 0.35 ? AMBAR : NO;
}

function Medidor({ etiqueta, valor, max, buenoAlto, icono, meta }: { etiqueta: string; valor: number; max: number; buenoAlto: boolean; icono: string; meta: string }) {
  const frac = Math.max(0, Math.min(1, valor / max));
  const col = colorMedidor(frac, buenoAlto);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, color: T.text2, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 800, color: T.text }}>
          <i className={`fa-solid ${icono}`} aria-hidden style={{ color: col, marginRight: 7 }} />
          {etiqueta}
        </span>
        <span>
          <strong style={{ color: col }}>{valor}</strong> · {meta}
        </span>
      </div>
      <div className="hcol-barra" role="img" aria-label={`${etiqueta}: ${valor}`}>
        <i style={{ width: `${Math.max(2, frac * 100)}%`, background: col }} />
      </div>
    </div>
  );
}

const COLOR_TONO: Record<EventoDia["tono"], string> = { ok: OK, medio: AMBAR, mal: NO };
const ICONO_TONO: Record<EventoDia["tono"], string> = { ok: "fa-circle-check", medio: "fa-triangle-exclamation", mal: "fa-circle-xmark" };

/** Línea de tiempo SVG: avance acumulado de lunes a viernes. */
function LineaSemana({ dias }: { dias: ReturnType<typeof simular>["dias"] }) {
  const x = (i: number) => 50 + i * 100;
  const y = (v: number) => 130 - (v / 100) * 110;
  const puntos = dias.map((d, i) => `${x(i)},${y(d.avance)}`).join(" ");
  const yMeta = y(META.avance);
  return (
    <svg viewBox="0 0 500 170" role="img" aria-label="Avance del proyecto de lunes a viernes (simulación)" style={{ width: "100%", height: "auto", borderRadius: 12, background: "rgba(2,12,28,0.55)", border: `1px solid ${T.line}` }}>
      <line x1="20" x2="480" y1={yMeta} y2={yMeta} stroke={OK} strokeOpacity="0.6" strokeDasharray="6 6" />
      <polyline points={puntos} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinejoin="round" />
      {dias.map((d, i) => {
        const peor = d.eventos.reduce<EventoDia["tono"] | null>((acc, e) => (acc === "mal" || e.tono === "mal" ? "mal" : acc === "medio" || e.tono === "medio" ? "medio" : "ok"), null);
        const col = peor ? COLOR_TONO[peor] : "rgba(255,255,255,0.25)";
        return (
          <g key={d.dia}>
            <circle cx={x(i)} cy={y(d.avance)} r="11" fill={col} stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
            <text x={x(i)} y="162" textAnchor="middle" fontSize="22" fontWeight="800" fill="rgba(255,255,255,0.85)">
              {DIAS_CORTOS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 · Semana de proyecto (simulador)
 * ═══════════════════════════════════════════════════════════════════════════ */
function Semana({
  accent,
  dec,
  resultado,
  onElegir,
  onPermisos,
  onHistorial,
  onReiniciar,
}: {
  accent: string;
  dec: Decisiones;
  resultado: ReturnType<typeof simular>;
  onElegir: (n: NecesidadId, o: string) => void;
  onPermisos: (p: Permisos) => void;
  onHistorial: (h: boolean) => void;
  onReiniciar: () => void;
}) {
  const completa = resultado.decididas === NECESIDADES.length;
  const eligioDocumento = dec.eleccion.escribir === "documento";
  return (
    <>
      <div className="hcol-panel">
        <Eyebrow>Una semana de proyecto · equipo ficticio</Eyebrow>
        <Foto clave="equipo-mesa" icono="fa-people-group" banner />
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
          Cuatro estudiantes deben entregar un informe el viernes. Elige la herramienta que resuelve cada necesidad; la línea de tiempo muestra qué pasa cada día.
        </div>
        <div className="hcol-grid-s">
          {EQUIPO.map((p) => (
            <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Foto clave={p.foto} icono={p.icono} />
              <strong style={{ fontSize: 15, color: T.text }}>{p.nombre}</strong>
              <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.4 }}>{p.rasgo}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hcol-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Tablero del proyecto</Eyebrow>
          <span className="hcol-tag">
            <i className="fa-solid fa-flask" aria-hidden /> Simulación: cifras de juego
          </span>
        </div>
        <Medidor etiqueta="Avance" valor={resultado.avance} max={100} buenoAlto icono="fa-bars-progress" meta={`meta ${META.avance}+`} />
        <Medidor etiqueta="Conflictos" valor={resultado.conflictos} max={8} buenoAlto={false} icono="fa-burst" meta={`máx. ${META.conflictos}`} />
        <Medidor etiqueta="Participación" valor={resultado.participacion} max={100} buenoAlto icono="fa-hands-holding-circle" meta={`meta ${META.participacion}+`} />
        <LineaSemana dias={resultado.dias} />
      </div>

      {NECESIDADES.map((n) => {
        const elegida = dec.eleccion[n.id];
        return (
          <div key={n.id} className="hcol-panel" data-done={!!elegida}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
              <i className={`fa-solid ${n.icono}`} aria-hidden style={{ marginRight: 8, color: accent }} />
              {DIAS[n.dia]}: {n.titulo}
            </div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{n.situacion}</div>
            <div className="hcol-grid">
              {n.opciones.map((o) => {
                const sel = elegida === o.id;
                return (
                  <button key={o.id} className="hcol-card" data-sel={sel} aria-pressed={sel} onClick={() => onElegir(n.id, o.id)}>
                    <span style={{ fontWeight: 700 }}>
                      <i className={`fa-solid ${o.icono}`} aria-hidden style={{ marginRight: 8, color: accent }} />
                      {o.titulo}
                    </span>
                  </button>
                );
              })}
            </div>
            {dec.eleccion[n.id] &&
              resultado.dias[n.dia]!.eventos
                .filter((e) => e.necesidad === n.id)
                .map((e) => (
                  <div key={e.necesidad} className="hcol-pop" style={{ fontSize: 14, lineHeight: 1.5, color: COLOR_TONO[e.tono], display: "flex", gap: 9 }}>
                    <i className={`fa-solid ${ICONO_TONO[e.tono]}`} aria-hidden style={{ marginTop: 3 }} />
                    <span style={{ color: T.text2 }}>
                      {e.texto}{" "}
                      <strong style={{ color: COLOR_TONO[e.tono] }}>
                        (avance {e.av >= 0 ? "+" : ""}
                        {e.av} · conflictos +{e.co} · participación {e.pa >= 0 ? "+" : ""}
                        {e.pa})
                      </strong>
                    </span>
                  </div>
                ))}
            {n.id === "escribir" && eligioDocumento && (
              <div className="hcol-panel hcol-pop" style={{ background: T.inset }}>
                <Eyebrow>Permisos y versiones del documento</Eyebrow>
                <div className="hcol-grid">
                  {PERMISOS_INFO.map((p) => (
                    <button key={p.id} className="hcol-card" data-sel={dec.permisos === p.id} aria-pressed={dec.permisos === p.id} onClick={() => onPermisos(p.id)}>
                      <span style={{ fontWeight: 700 }}>
                        <i className={`fa-solid ${p.icono}`} aria-hidden style={{ marginRight: 8, color: accent }} />
                        {p.titulo}
                      </span>
                      <span style={{ color: T.text2 }}>{p.detalle}</span>
                    </button>
                  ))}
                </div>
                <button className="hcol-card" data-sel={dec.historial} aria-pressed={dec.historial} onClick={() => onHistorial(!dec.historial)}>
                  <span style={{ fontWeight: 700 }}>
                    <i className={`fa-solid ${dec.historial ? "fa-clock-rotate-left" : "fa-ban"}`} aria-hidden style={{ marginRight: 8, color: accent }} />
                    Historial de versiones: {dec.historial ? "activado" : "apagado"}
                  </span>
                  <span style={{ color: T.text2 }}>Permite recuperar cualquier versión anterior del archivo.</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div className="hcol-panel" data-done={resultado.meta}>
        <Eyebrow>Viernes · resultado de la semana</Eyebrow>
        {!completa ? (
          <div style={{ fontSize: 14, color: AMBAR }}>
            <i className="fa-solid fa-lock" aria-hidden /> Elige una herramienta para las {NECESIDADES.length} necesidades y verás cómo terminó la semana.
          </div>
        ) : (
          <div className="hcol-pop" style={{ fontSize: 15, fontWeight: 800, color: resultado.meta ? OK : AMBAR }}>
            <i className={`fa-solid ${resultado.meta ? "fa-trophy" : "fa-circle-half-stroke"}`} aria-hidden style={{ marginRight: 8 }} />
            {resultado.meta
              ? "Entrega lograda: el equipo trabajó junto y sin perder información."
              : `Entrega con problemas: busca avance ${META.avance}+, máximo ${META.conflictos} conflictos y participación ${META.participacion}+. Cambia una herramienta o los permisos y compara.`}
          </div>
        )}
        <div className="hcol-grid">
          {resultado.dias.map((d) =>
            d.eventos.length > 0 ? (
              <div key={d.dia} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
                <strong style={{ color: T.text }}>{d.dia}</strong> · avance {d.avance}, conflictos {d.conflictos}
              </div>
            ) : null
          )}
        </div>
        <button className="hcol-btn" onClick={onReiniciar}>
          <i className="fa-solid fa-rotate-left" aria-hidden /> Probar otra combinación
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de los modos de clasificar (componentes hijos: reciben los manejadores
 * como props, así el linter no rastrea el acceso al ref de audio hasta el render
 * del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsTareas({
  selTarea,
  shakeCat,
  ubicTarea,
  onMatch,
  dropProps,
}: {
  selTarea: string | null;
  shakeCat: Categoria | null;
  ubicTarea: Record<string, Categoria>;
  onMatch: (tareaId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["documento", "presentacion", "hoja", "pizarron", "gestion", "comunicacion"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = TAREAS.filter((t) => ubicTarea[t.id] === bin);
        return (
          <div
            key={bin}
            className="hcol-bin"
            data-shake={shakeCat === bin}
            onClick={() => selTarea && onMatch(selTarea, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((t) => (
                  <span key={t.id} style={{ animation: "hcolPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 12, color: OK, marginTop: 3 }} />
                    {t.texto}
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

function RowsFunciones({
  selFunc,
  shakeFunc,
  empFunc,
  onMatch,
  dropProps,
}: {
  selFunc: string | null;
  shakeFunc: string | null;
  empFunc: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {FUNCIONES.map((f) => {
        const done = empFunc[f.id];
        return (
          <div
            key={f.id}
            className="hcol-row"
            data-shake={shakeFunc === f.id}
            data-done={done}
            onClick={() => !done && selFunc && onMatch(selFunc, f.id)}
            {...dropProps((id) => onMatch(id, f.id))}
          >
            <div className="hcol-slot" data-armed={!done && !!selFunc} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "hcolPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-cloud" />
                  {f.funcion}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }} /> función
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{f.descripcion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{f.ejemplo}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinsAcciones({
  selAccion,
  shakeJuicio,
  ubicAccion,
  onMatch,
  dropProps,
}: {
  selAccion: string | null;
  shakeJuicio: Juicio | null;
  ubicAccion: Record<string, Juicio>;
  onMatch: (accionId: string, bin: Juicio) => void;
  dropProps: DropFactory;
}) {
  const bins: Juicio[] = ["buena", "error"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = JUICIO_INFO[bin];
        const dentro = ACCIONES.filter((a) => ubicAccion[a.id] === bin);
        return (
          <div
            key={bin}
            className="hcol-bin"
            data-shake={shakeJuicio === bin}
            onClick={() => selAccion && onMatch(selAccion, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={bin === "buena" ? OK : NO} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((a) => (
                  <span key={a.id} style={{ animation: "hcolPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 12, color: OK, marginTop: 3 }} />
                    {a.texto}
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
 * Cuestionario de comprensión
 * ═══════════════════════════════════════════════════════════════════════════ */
function QuizCard({
  accent,
  rgba,
  aprobado,
  onAprobado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [resp, setResp] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [comprobado, setComprobado] = useState(false);

  const aciertos = resp.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const total = QUIZ.length;
  const todas = resp.every((r) => r !== null);
  const aprobadoAhora = aciertos === total;

  const elegir = (qi: number, oi: number) => {
    if (comprobado) return;
    setResp((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  };
  const comprobar = () => {
    setComprobado(true);
    const ok = aciertos === total;
    playSfx?.(ok);
    if (ok) onAprobado();
  };
  const reintentar = () => {
    setResp(QUIZ.map(() => null));
    setComprobado(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cuatro afirmaciones sobre la nube y las herramientas colaborativas. Decide si son verdaderas o falsas y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 9 }}>
                {q.opciones.map((op, oi) => {
                  const sel = elegida === oi;
                  const esCorrecta = oi === q.correcta;
                  let borde: string = T.line;
                  let fondo: string = T.glass;
                  let colorTxt: string = T.text2;
                  if (comprobado && esCorrecta) {
                    borde = OK;
                    fondo = `${OK}1c`;
                    colorTxt = "#fff";
                  } else if (comprobado && sel && !esCorrecta) {
                    borde = NO;
                    fondo = `${NO}1c`;
                    colorTxt = "#fff";
                  } else if (!comprobado && sel) {
                    borde = accent;
                    fondo = `rgba(${rgba},0.16)`;
                    colorTxt = "#fff";
                  }
                  return (
                    <button key={oi} className="hcol-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
                        {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                    </button>
                  );
                })}
              </div>
              {comprobado && (
                <div style={{ marginTop: 9, fontSize: 14, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                  <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
                  <span>{q.retro}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="hcol-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="hcol-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
