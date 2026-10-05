"use client";

/**
 * Laboratorio — Asking and answering about processes in English
 * Práctica experimental para IN-V-P03-A4 (Inglés V · A2+/B1).
 *
 * EXPERIMENTO CENTRAL: «Give instructions». Un personaje FICTICIO (Marta en la
 * cocina, Tomás en el taller) sigue AL PIE DE LA LETRA las instrucciones en
 * inglés que elige el alumno (conectores First/Then/After that/Finally,
 * imperativos). Si el orden, el conector o la forma verbal fallan, el resultado
 * se ve mal (derrames, olla quemada, entrega incompleta) y se explica la regla
 * en español. Al terminar, el informe se redacta en voz pasiva. La lógica vive
 * en `procesos-ingles-sim.ts`; la «calidad» es un valor de simulación.
 *
 * Modos (los cuatro de siempre se conservan, en `Mesa`, porque las misiones y
 * las estrellas dependen de ellos):
 *  0. «Give instructions» — el simulador.
 *  1. «Order the process» — ordena los cinco eslabones del sistema de agua (A1).
 *  2. «Classify the structure» — clasifica diez estructuras por su función.
 *  3. «Match structure and meaning» — empareja el glosario A5.
 *  4. «Complete the text» — escribir (fill_blanks verbatim).
 *  + Reto: cuestionario V/F verbatim de A4. Teoría: ficha y datos verbatim.
 *
 * DOM puro (sin three.js). Contenido VERBATIM de IN-V·P03.
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { PROCESOS_INGLES_HUECOS } from "./procesos-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { PROCESOS_INGLES_FICHA } from "./procesos-ingles-ficha";
import {
  PASOS,
  ESTRUCTURAS,
  FUNCION_INFO,
  PARES,
  QUIZ,
  DATO_PROCESOS,
  type Funcion,
} from "./procesos-ingles-data";
import {
  RECETAS,
  recetaDe,
  estadoInicial,
  opcionesPaso,
  elegirPaso,
  opcionesInforme,
  elegirInforme,
  type Estado,
  type Opcion,
  type OpcionInforme,
  type Receta,
} from "./procesos-ingles-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-procesos-ingles-reto";
const RUTA_SIM = "/media/labs-sim/procesos-ingles";

type Modo = "sim" | "orden" | "clasifica" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "sim", label: "Give instructions", icono: "fa-person-chalkboard" },
  { id: "orden", label: "Order the process", icono: "fa-arrow-down-up-across-line" },
  { id: "clasifica", label: "Classify the structure", icono: "fa-table-columns" },
  { id: "glosario", label: "Match structure and meaning", icono: "fa-book-open" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

export function LabProcesosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("sim");

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
  // y todos los fallos del laboratorio, así que la partida se lleva aquí.
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

  // ── modo Simulador (Marta / Tomás siguen las instrucciones) ────────────
  const [sim, setSim] = useState<Estado>(() => estadoInicial(RECETAS[0]!.id));
  const receta = recetaDe(sim.receta);
  const dioPaso = (o: Opcion) => {
    const nx = elegirPaso(receta, sim, o);
    setSim(nx);
    if (o.tipo === "bien") {
      sfxPlace();
      if (nx.final === "bien") sfxOk();
    } else {
      sfxNo();
    }
  };
  const dioInforme = (o: OpcionInforme) => {
    setSim(elegirInforme(sim, o));
    if (o.correcta) sfxPlace();
    else sfxNo();
  };
  const cambiarReceta = (id: string) => setSim(estadoInicial(id));
  const resetSim = () => setSim(estadoInicial(sim.receta));
  const simDone = sim.final === "bien";
  const informeDone = sim.final === "bien" && sim.informe >= receta.pasos.length && sim.informeFallas === 0;

  // ── modo Orden (ordena secuencialmente los pasos) ──────────────────────
  const [ordenPos, setOrdenPos] = useState(0);
  const [selO, setSelO] = useState<string | null>(null);
  const [shakeO, setShakeO] = useState(false);
  const ordenLibres = PASOS.filter((p) => p.orden >= ordenPos).slice().sort((a, b) => a.conector.localeCompare(b.conector, "es"));

  const intentarOrden = (pasoId: string) => {
    if (ordenPos >= PASOS.length) return;
    const esperado = PASOS[ordenPos]!;
    if (pasoId === esperado.id) {
      setOrdenPos((p) => p + 1);
      setSelO(null);
      sfxPlace();
      if (ordenPos + 1 >= PASOS.length) {
        sfxOk();
        persistMejor(true, clasificaDone, glosarioDone);
      }
    } else {
      setShakeO(true);
      sfxNo();
      window.setTimeout(() => setShakeO(false), 420);
    }
  };
  const resetOrden = () => {
    setOrdenPos(0);
    setSelO(null);
  };

  // ── modo Clasifica (clasifica en 4 funciones) ──────────────────────────
  const [ubicadoC, setUbicadoC] = useState<Record<string, Funcion>>({});
  const [selC, setSelC] = useState<string | null>(null);
  const [shakeC, setShakeC] = useState<Funcion | null>(null);
  const clasificaLibres = ESTRUCTURAS.filter((x) => !ubicadoC[x.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarClasifica = (itemId: string, bin: Funcion) => {
    if (ubicadoC[itemId]) return;
    const it = ESTRUCTURAS.find((x) => x.id === itemId);
    if (it && it.funcion === bin) {
      setUbicadoC((e) => ({ ...e, [itemId]: bin }));
      setSelC(null);
      sfxPlace();
      if (Object.keys(ubicadoC).length + 1 >= ESTRUCTURAS.length) {
        sfxOk();
        persistMejor(ordenDone, true, glosarioDone);
      }
    } else {
      setShakeC(bin);
      sfxNo();
      window.setTimeout(() => setShakeC(null), 420);
    }
  };
  const resetClasifica = () => {
    setUbicadoC({});
    setSelC(null);
  };

  // ── modo Glosario (empareja estructura → definición) ───────────────────
  const [empGlos, setEmpGlos] = useState<Record<string, boolean>>({});
  const [selGlos, setSelGlos] = useState<string | null>(null);
  const [shakeGlos, setShakeGlos] = useState<string | null>(null);
  const glosLibres = PARES.filter((g) => !empGlos[g.id]).slice().sort((a, b) => a.termino.localeCompare(b.termino, "es"));

  const intentarGlos = (chipId: string, rowId: string) => {
    if (empGlos[rowId]) return;
    if (chipId === rowId) {
      setEmpGlos((e) => ({ ...e, [rowId]: true }));
      setSelGlos(null);
      sfxPlace();
      if (Object.keys(empGlos).length + 1 >= PARES.length) {
        sfxOk();
        persistMejor(ordenDone, clasificaDone, true);
      }
    } else {
      setShakeGlos(rowId);
      sfxNo();
      window.setTimeout(() => setShakeGlos(null), 420);
    }
  };
  const resetGlosario = () => {
    setEmpGlos({});
    setSelGlos(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const ordenDone = ordenPos >= PASOS.length;
  const clasificaDone = Object.keys(ubicadoC).length >= ESTRUCTURAS.length;
  const glosarioDone = Object.keys(empGlos).length >= PARES.length;
  const modosHechos = (ordenDone ? 1 : 0) + (clasificaDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Dale instrucciones a Marta o a Tomás hasta terminar su proceso", done: simDone },
    { txt: "Redacta el informe del proceso en voz pasiva sin fallas", done: informeDone },
    { txt: "Ordena los 5 pasos del proceso con sus conectores", done: ordenDone },
    { txt: "Clasifica las 10 estructuras por su función", done: clasificaDone },
    { txt: "Empareja las 6 estructuras del glosario", done: glosarioDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "sim" ? resetSim : modo === "orden" ? resetOrden : modo === "clasifica" ? resetClasifica : resetGlosario;

  const lectura =
    modo === "sim"
      ? sim.final === "no"
        ? `${receta.personaje}: paso ${Math.min(sim.paso + 1, receta.pasos.length)} de ${receta.pasos.length} · calidad ${sim.calidad}`
        : `Proceso terminado · calidad ${sim.calidad} (simulación)`
      : `${modosHechos}/4 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={PROCESOS_INGLES_HUECOS}
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

      {/* MODO 0 — Give instructions */}
      {modo === "sim" && (
        <SimInstrucciones accent={accent} receta={receta} estado={sim} onReceta={cambiarReceta} onPaso={dioPaso} onInforme={dioInforme} onReiniciar={resetSim} />
      )}

      {/* MODO 1 — Order the process */}
      {modo === "orden" && (
        <Mesa>
          <div className="prc-panel">
            <div className="prc-cab">
              <Eyebrow>Order the water purification process</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: ordenDone ? OK : T.text3 }}>
                {ordenPos}/{PASOS.length}
              </span>
            </div>
            <div className="prc-nota">
              Arrastra el <strong style={{ color: T.text2 }}>siguiente paso</strong> al hueco activo, siguiendo los conectores: First → Then → After that → Finally → As a result.
            </div>
            {ordenLibres.length === 0 ? (
              <div className="prc-ok">
                <i className="fa-solid fa-circle-check" /> ¡Reconstruiste el proceso completo!
              </div>
            ) : (
              <div className="prc-chips">
                {ordenLibres.map((p) => (
                  <button key={p.id} className="prc-chip" data-sel={selO === p.id} onClick={() => setSelO((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                    {p.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ProcesoOrden selO={selO} shakeO={shakeO} ordenPos={ordenPos} onMatch={intentarOrden} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO 2 — Classify the structure */}
      {modo === "clasifica" && (
        <Mesa>
          <div className="prc-panel">
            <div className="prc-cab">
              <Eyebrow>Arrastra cada estructura a su función</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: clasificaDone ? OK : T.text3 }}>
                {Object.keys(ubicadoC).length}/{ESTRUCTURAS.length}
              </span>
            </div>
            <div className="prc-nota">
              ¿La frase pregunta por un <strong style={{ color: T.text2 }}>proceso</strong>, por una <strong style={{ color: T.text2 }}>razón</strong>, pide una <strong style={{ color: T.text2 }}>explicación</strong> o describe con <strong style={{ color: T.text2 }}>voz pasiva</strong>?
            </div>
            {clasificaLibres.length === 0 ? (
              <div className="prc-ok">
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {ESTRUCTURAS.length} estructuras!
              </div>
            ) : (
              <div className="prc-chips">
                {clasificaLibres.map((x) => (
                  <button key={x.id} className="prc-chip" data-sel={selC === x.id} onClick={() => setSelC((s) => (s === x.id ? null : x.id))} {...dragProps(x.id)}>
                    {x.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <BinsFuncion selC={selC} shakeC={shakeC} ubicadoC={ubicadoC} onMatch={intentarClasifica} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO 3 — Glosario */}
      {modo === "glosario" && (
        <Mesa>
          <div className="prc-panel">
            <div className="prc-cab">
              <Eyebrow>Arrastra cada estructura a su definición</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: glosarioDone ? OK : T.text3 }}>
                {Object.keys(empGlos).length}/{PARES.length}
              </span>
            </div>
            {glosLibres.length === 0 ? (
              <div className="prc-ok">
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste las 6 estructuras!
              </div>
            ) : (
              <div className="prc-chips">
                {glosLibres.map((g) => (
                  <button key={g.id} className="prc-chip" data-sel={selGlos === g.id} onClick={() => setSelGlos((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                    <i className="fa-solid fa-quote-left" style={{ fontSize: 14, color: T.text3 }} />
                    {g.termino}
                  </button>
                ))}
              </div>
            )}
          </div>
          <RowsGlosario selGlos={selGlos} shakeGlos={shakeGlos} empGlos={empGlos} onMatch={intentarGlos} dropProps={dropProps} />
        </Mesa>
      )}
    </div>
  );

  const pistaDe: Record<Modo, React.ReactNode> = {
    sim: (
      <>
        Las instrucciones usan el verbo en forma base: <strong style={{ color: T.text }}>Pour milk</strong>, no «pouring» ni «to pour». Los conectores van en orden: <strong style={{ color: T.text }}>First, Then, After that, Finally</strong>. Y el informe del proceso va en voz pasiva.
      </>
    ),
    orden: (
      <>
        Los conectores marcan el orden: <strong style={{ color: T.text }}>First</strong> (primero), <strong style={{ color: T.text }}>Then</strong> (luego), <strong style={{ color: T.text }}>After that</strong> (después), <strong style={{ color: T.text }}>Finally</strong> (finalmente) y <strong style={{ color: T.text }}>As a result</strong> (como resultado).
      </>
    ),
    clasifica: (
      <>
        <strong style={{ color: T.text }}>How/What</strong> preguntan por el proceso; <strong style={{ color: T.text }}>Why</strong> por la razón; <strong style={{ color: T.text }}>Can/Could you explain</strong> piden una explicación; <strong style={{ color: T.text }}>is/are + participio</strong> es voz pasiva.
      </>
    ),
    glosario: <>Lee primero la definición y su ejemplo; luego suelta la estructura en inglés que le corresponde.</>,
    texto: <>Escribe la palabra o estructura que falta en cada hueco.</>,
  };

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
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "sim" ? "Reiniciar la simulación" : "Reiniciar este modo"} onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Ya describes procesos en inglés con soltura!" : "Termina los modos de ordenar, clasificar y emparejar para ganar estrellas; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{pistaDe[modo]}</div>
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
                <FichaTeorica data={PROCESOS_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Estructuras clave" icono="fa-link">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PARES.map((p) => (
                    <div key={p.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{p.termino}</strong> {p.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{p.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_PROCESOS}</div>
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
  @keyframes prcShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes prcPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .prc-panel { border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:10px; min-width:0; }
  .prc-cab { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
  .prc-cab p { margin:0; }
  .prc-nota { font-size:14px; color:${T.text3}; line-height:1.5; }
  .prc-ok { font-size:14px; color:${OK}; font-weight:700; display:flex; align-items:center; gap:9px; }
  .prc-chips { display:flex; flex-wrap:wrap; gap:10px; }
  .prc-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:flex-start; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .prc-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .prc-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .prc-chip:active { cursor:grabbing; }
  .prc-chip[data-arrastrando="true"] { opacity:.4; }
  .prc-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; transition:all .16s; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .prc-row[data-shake="true"] { animation:prcShake .4s; border-color:${NO}; }
  .prc-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .prc-row[data-sobre="true"], .prc-fslot[data-sobre="true"], .prc-bin[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.12); }
  .prc-slot { flex:0 1 190px; min-width:0; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; text-align:center; }
  .prc-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .prc-bins { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:12px; }
  .prc-bin { position:relative; isolation:isolate; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; transition:all .16s; min-height:150px; }
  .prc-bin[data-shake="true"] { animation:prcShake .4s; border-color:${NO}; }
  .prc-fslot { border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:12px 14px; transition:all .16s;
    display:flex; align-items:center; gap:12px; color:${T.text3}; font-size:14px; cursor:pointer; }
  .prc-fslot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); color:#fff; }
  .prc-fslot[data-shake="true"] { animation:prcShake .4s; border-color:${NO}; }
  .prc-step { border-radius:13px; border:1.5px solid ${OK}66; background:${OK}0f; padding:12px 14px; display:flex; align-items:flex-start; gap:12px; animation:prcPop .25s ease; }
  .prc-locked { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; display:flex; align-items:center; gap:12px; opacity:0.5; }
  .prc-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .prc-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .prc-q:disabled{ cursor:default; }
  .prc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 16px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .prc-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .prc-btn:disabled { opacity:.45; cursor:not-allowed; }
  .prc-btn[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); }

  /* Simulador */
  .prc-foto { position:relative; overflow:hidden; border-radius:16px; border:1px solid ${T.line}; aspect-ratio:16/9; max-height:240px; width:100%;
    background:linear-gradient(135deg, rgba(${rgba},0.28) 0%, rgba(8,19,31,0.9) 100%); display:flex; align-items:center; justify-content:center; }
  .prc-foto > i { font-size:54px; color:rgba(255,255,255,0.22); }
  .prc-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .prc-voz { position:absolute; left:10px; right:10px; bottom:10px; display:flex; gap:10px; align-items:flex-start; padding:10px 12px; border-radius:12px;
    background:rgba(4,10,22,0.82); border:1px solid ${T.line}; backdrop-filter:blur(6px); font-size:14px; line-height:1.4; color:#fff; }
  .prc-voz[data-ok="false"] { border-color:${NO}99; }
  .prc-voz[data-ok="true"] { border-color:${OK}88; }
  .prc-pasos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 110px), 1fr)); gap:8px; }
  .prc-paso { display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px 6px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset};
    font-size:14px; font-weight:800; color:${T.text3}; text-align:center; min-width:0; }
  .prc-paso i { font-size:20px; }
  .prc-paso[data-hecho="true"] { color:#fff; animation:prcPop .3s ease; }
  .prc-barra { height:12px; border-radius:7px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .prc-barra > i { display:block; height:100%; border-radius:7px; transition:width .6s cubic-bezier(.2,.8,.2,1), background .6s; }
  .prc-opts { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap:10px; }
  .prc-opt { cursor:pointer; text-align:left; padding:12px 14px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
    font-size:15px; font-weight:700; line-height:1.4; transition:all .14s; min-width:0; }
  .prc-opt:hover { border-color:${accent}; background:rgba(${rgba},0.14); transform:translateY(-2px); }
  .prc-retro { display:flex; flex-direction:column; gap:6px; padding:12px 14px; border-radius:13px; font-size:14px; line-height:1.5; animation:prcPop .25s ease; }
  @media (prefers-reduced-motion: reduce){
    .prc-row[data-shake="true"], .prc-bin[data-shake="true"], .prc-fslot[data-shake="true"] { animation:none; }
    .prc-chip, .prc-chip:hover, .prc-chip[data-sel="true"], .prc-opt:hover { transform:none; transition:none; }
    .prc-paso[data-hecho="true"], .prc-retro, .prc-step { animation:none; }
    .prc-barra > i { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador «Give instructions»
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Foto de la escena con respaldo: degradado + icono detrás; si falla, se oculta. */
function Foto({ clave, icono, children }: { clave: string; icono: string; children?: React.ReactNode }) {
  const [falla, setFalla] = useState<string | null>(null);
  return (
    <div className="prc-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {falla !== clave && <img key={clave} src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(clave)} />}
      {children}
    </div>
  );
}

function SimInstrucciones({
  accent,
  receta,
  estado,
  onReceta,
  onPaso,
  onInforme,
  onReiniciar,
}: {
  accent: string;
  receta: Receta;
  estado: Estado;
  onReceta: (id: string) => void;
  onPaso: (o: Opcion) => void;
  onInforme: (o: OpcionInforme) => void;
  onReiniciar: () => void;
}) {
  const n = receta.pasos.length;
  const enInforme = estado.final === "bien" && estado.informe < n;
  const cerrado = estado.final === "bien" && estado.informe >= n;
  const mala = estado.ultimo && !estado.ultimo.ok;
  const clave =
    estado.final === "bien"
      ? receta.id === "chocolate" ? "bebida-lista" : "bici-lista"
      : mala
        ? receta.id === "chocolate" ? "cocina-derrame" : "taller-desorden"
        : receta.id === "chocolate" ? "cocina-inicio" : "taller-inicio";
  const colCal = estado.calidad >= 70 ? OK : estado.calidad >= 40 ? AMBAR : NO;
  const voz = estado.ultimo ? estado.ultimo.efecto : receta.meta;

  return (
    <>
      <div className="prc-panel">
        <Eyebrow>Elige el proceso · simulación con personajes ficticios</Eyebrow>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RECETAS.map((r) => (
            <button key={r.id} className="prc-btn" data-on={r.id === receta.id} onClick={() => onReceta(r.id)}>
              <i className={`fa-solid ${r.icono}`} aria-hidden /> {r.nombre} · {r.personaje}
            </button>
          ))}
        </div>
      </div>

      <Foto clave={clave} icono={receta.icono}>
        <div className="prc-voz" data-ok={estado.ultimo ? String(estado.ultimo.ok) : undefined} role="status">
          <i className={`fa-solid ${estado.ultimo ? (estado.ultimo.ok ? "fa-circle-check" : "fa-triangle-exclamation") : "fa-comment"}`} aria-hidden style={{ color: estado.ultimo ? (estado.ultimo.ok ? OK : NO) : accent, marginTop: 3 }} />
          <span>
            <strong>{receta.personaje}:</strong> {voz}
          </span>
        </div>
      </Foto>

      <div className="prc-panel">
        <div className="prc-pasos" role="list" aria-label="Pasos del proceso">
          {receta.pasos.map((p, i) => {
            const hecho = i < estado.paso;
            return (
              <div key={p.id} role="listitem" className="prc-paso" data-hecho={hecho} style={hecho ? { borderColor: p.color, background: `${p.color}22` } : undefined}>
                <i className={`fa-solid ${hecho ? p.icono : "fa-circle-question"}`} aria-hidden style={{ color: hecho ? p.color : T.text3 }} />
                <span>{hecho ? p.conector : `Paso ${i + 1}`}</span>
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.text2, flexWrap: "wrap", gap: 6 }}>
            <span>Calidad del resultado · simulación</span>
            <strong style={{ color: colCal }}>{estado.calidad}/100{estado.manchas > 0 ? ` · ${estado.manchas} desastre${estado.manchas > 1 ? "s" : ""}` : ""}</strong>
          </div>
          <div className="prc-barra" role="img" aria-label={`Calidad ${estado.calidad} de 100`}>
            <i style={{ width: `${estado.calidad}%`, background: colCal }} />
          </div>
        </div>
      </div>

      {estado.final === "no" && (
        <div className="prc-panel">
          <Eyebrow>
            What do you tell {receta.personaje}? · paso {estado.paso + 1} de {n}
          </Eyebrow>
          <div className="prc-nota">Elige la instrucción correcta: con su conector, en el orden del proceso y con la forma verbal de una orden.</div>
          <div className="prc-opts">
            {opcionesPaso(receta, estado).map((o) => (
              <button key={`${estado.turno}-${o.id}`} className="prc-opt" onClick={() => onPaso(o)}>
                {o.texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {estado.final === "temprano" && (
        <div className="prc-panel" style={{ borderColor: `${NO}88` }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: NO }}>
            <i className="fa-solid fa-circle-xmark" aria-hidden /> {receta.personaje} entregó el proceso incompleto.
          </div>
          <button className="prc-btn" onClick={onReiniciar}>
            <i className="fa-solid fa-rotate-left" aria-hidden /> Try again
          </button>
        </div>
      )}

      {enInforme && (
        <div className="prc-panel">
          <Eyebrow>
            Write the report · {estado.informe + 1} de {n}
          </Eyebrow>
          <div className="prc-nota">
            El proceso quedó listo. Ahora describe lo que se hizo <strong style={{ color: T.text2 }}>en voz pasiva</strong>: elige la frase correcta para este paso («{receta.pasos[estado.informe]!.esp}»).
          </div>
          <div className="prc-opts">
            {opcionesInforme(receta, estado.informe, estado.turno).map((o) => (
              <button key={`${estado.turno}-${o.id}`} className="prc-opt" onClick={() => onInforme(o)}>
                {o.texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {cerrado && (
        <div className="prc-panel" style={{ borderColor: `${OK}88` }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-trophy" aria-hidden /> {receta.resultado}
          </div>
          <div className="prc-nota">{receta.resultadoEsp} Informe en voz pasiva: {estado.informeFallas === 0 ? "sin fallas." : `${estado.informeFallas} corrección(es).`}</div>
          <button className="prc-btn" onClick={() => onReceta(receta.id === RECETAS[0]!.id ? RECETAS[1]!.id : RECETAS[0]!.id)}>
            <i className="fa-solid fa-forward" aria-hidden /> Try the other process
          </button>
        </div>
      )}

      {estado.ultimo && (
        <div className="prc-retro" style={{ background: estado.ultimo.ok ? `${OK}12` : `${NO}12`, border: `1px solid ${estado.ultimo.ok ? OK : NO}55`, color: T.text2 }}>
          <strong style={{ color: estado.ultimo.ok ? OK : NO }}>{estado.ultimo.ok ? "Bien hecho" : "Por qué salió mal"}</strong>
          <span>{estado.ultimo.regla}</span>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function ProcesoOrden({
  selO,
  shakeO,
  ordenPos,
  onMatch,
  dropProps,
}: {
  selO: string | null;
  shakeO: boolean;
  ordenPos: number;
  onMatch: (pasoId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      {PASOS.map((p, i) => {
        const num = (
          <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${T.lineStrong}`, color: T.text2 }}>
            {i + 1}
          </span>
        );
        if (i < ordenPos) {
          // ya colocado
          return (
            <div key={p.id} className="prc-step">
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, background: OK, color: "#04121f", marginTop: 1 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{p.texto}</div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{p.traduccion}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: OK, border: `1px solid ${OK}55`, borderRadius: 6, padding: "3px 9px", flexShrink: 0 }}>
                {p.conector}
              </span>
            </div>
          );
        }
        if (i === ordenPos) {
          // hueco activo
          return (
            <div
              key={p.id}
              className="prc-fslot"
              data-armed={!!selO}
              data-shake={shakeO}
              onClick={() => selO && onMatch(selO)}
              {...dropProps((id) => onMatch(id))}
            >
              {num}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-arrow-down" style={{ fontSize: 14 }} />
                <span style={{ fontWeight: 700 }}>Drop the next step here</span>
              </div>
            </div>
          );
        }
        // bloqueado
        return (
          <div key={p.id} className="prc-locked">
            {num}
            <span style={{ fontSize: 14, color: T.text3 }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 8, fontSize: 14 }} />
              Step {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BinsFuncion({
  selC,
  shakeC,
  ubicadoC,
  onMatch,
  dropProps,
}: {
  selC: string | null;
  shakeC: Funcion | null;
  ubicadoC: Record<string, Funcion>;
  onMatch: (itemId: string, bin: Funcion) => void;
  dropProps: DropFactory;
}) {
  const bins: Funcion[] = ["proceso", "razon", "explicacion", "pasiva"];
  return (
    <div className="prc-bins">
      {bins.map((bin) => {
        const info = FUNCION_INFO[bin];
        const dentro = ESTRUCTURAS.filter((x) => ubicadoC[x.id] === bin);
        return (
          <div key={bin} className="prc-bin" data-shake={shakeC === bin} onClick={() => selC && onMatch(selC, bin)} {...dropProps((id) => onMatch(id, bin))}>
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 10, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "6px 0" }}>Drop here…</div>
              ) : (
                dentro.map((x) => (
                  <span key={x.id} style={{ animation: "prcPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {x.texto}
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

function RowsGlosario({
  selGlos,
  shakeGlos,
  empGlos,
  onMatch,
  dropProps,
}: {
  selGlos: string | null;
  shakeGlos: string | null;
  empGlos: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11, minWidth: 0 }}>
      {PARES.map((g) => {
        const done = empGlos[g.id];
        return (
          <div
            key={g.id}
            className="prc-row"
            data-shake={shakeGlos === g.id}
            data-done={done}
            onClick={() => !done && selGlos && onMatch(selGlos, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="prc-slot" data-armed={!done && !!selGlos} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "prcPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-quote-left" />
                  {g.termino}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> structure
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{g.definicion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{g.ejemplo}</div>
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
        Cinco afirmaciones sobre cómo formular y responder preguntas en inglés acerca de procesos. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 9 }}>
                {q.opciones.map((op, oi) => {
                  const sel = elegida === oi;
                  const esCorrecta = oi === q.correcta;
                  let borde = T.line;
                  let fondo = T.glass;
                  let colorTxt = T.text2;
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
                    <button key={oi} className="prc-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="prc-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="prc-btn" onClick={reintentar}>
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
