"use client";

/**
 * Laboratorio — Rules: Must, Mustn't and Have To
 * Práctica experimental para IN-III-P05-A1 (Inglés III).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar (uso · forma · estructura) y,
 * al final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «Obligation, prohibition or no obligation?» — clasifica diez reglas en
 *     cuatro columnas según su modal (must / mustn't / have to / don't have to).
 *     El USO: distingue obligación, prohibición y «no es necesario».
 *  2. «Complete the rule» — arrastra la forma modal correcta a cada hueco de
 *     cinco reglas, evitando los distractores incorrectos (musts, must to,
 *     have, haves to). La FORMA en contexto.
 *  3. «Match the structure» — empareja cada estructura del glosario A5 con su
 *     definición (must/mustn't, have to/has to, don't have to, y reglas de
 *     escuela / hogar / comunidad).
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de IN-III·P05.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { REGLAS_INGLES_HUECOS } from "./reglas-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { REGLAS_INGLES_FICHA } from "./reglas-ingles-ficha";
import {
  ORACIONES,
  MODAL_INFO,
  HUECOS,
  DISTRACTORES_HUECO,
  PARES,
  QUIZ,
  DATO_REGLAS,
  type Modal,
} from "./reglas-ingles-data";
import { SITUACIONES, MODALES, resolver, resumenDia, formaModal, fraseCompleta, type Dia, type Veredicto } from "./reglas-ingles-sim";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-reglas-ingles-reto";
const RUTA_SIM = "/media/labs-sim/reglas-ingles";

type Modo = "reglas" | "clasificar" | "completar" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "reglas", label: "Mia's school day", icono: "fa-school" },
  { id: "clasificar", label: "Obligation or prohibition?", icono: "fa-layer-group" },
  { id: "completar", label: "Complete the rule", icono: "fa-pen-fancy" },
  { id: "glosario", label: "Match the structure", icono: "fa-book-open" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

/** Fichas del modo «completar»: formas correctas + distractores. */
const FICHAS_HUECO: { id: string; label: string }[] = [
  ...HUECOS.map((h) => ({ id: h.id, label: h.resp })),
  ...DISTRACTORES_HUECO.map((d, i) => ({ id: `xd-${i}`, label: d })),
];

export function LabReglasIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("reglas");

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

  // ── modo clasificar (clasifica por modal) ──────────────────────────────
  const [ubicado, setUbicado] = useState<Record<string, Modal>>({});
  const [selOracion, setSelOracion] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<Modal | null>(null);
  const oracionesLibres = ORACIONES.filter((o) => !ubicado[o.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarClasificar = (oracionId: string, bin: Modal) => {
    if (ubicado[oracionId]) return;
    const o = ORACIONES.find((x) => x.id === oracionId);
    if (o && o.modal === bin) {
      setUbicado((e) => ({ ...e, [oracionId]: bin }));
      setSelOracion(null);
      sfxPlace();
      if (Object.keys(ubicado).length + 1 >= ORACIONES.length) {
        sfxOk();
        persistMejor(true, completarDone, glosarioDone);
      }
    } else {
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicado({});
    setSelOracion(null);
  };

  // ── modo completar (arrastra al hueco) ─────────────────────────────────
  const [completado, setCompletado] = useState<Record<string, boolean>>({});
  const [selFicha, setSelFicha] = useState<string | null>(null);
  const [shakeHueco, setShakeHueco] = useState<string | null>(null);
  const fichasLibres = FICHAS_HUECO.filter((f) => !completado[f.id]).slice().sort((a, b) => a.label.localeCompare(b.label, "es"));

  const intentarCompletar = (chipId: string, rowId: string) => {
    if (completado[rowId]) return;
    if (chipId === rowId) {
      setCompletado((e) => ({ ...e, [rowId]: true }));
      setSelFicha(null);
      sfxPlace();
      if (Object.keys(completado).length + 1 >= HUECOS.length) {
        sfxOk();
        persistMejor(clasificarDone, true, glosarioDone);
      }
    } else {
      setShakeHueco(rowId);
      sfxNo();
      window.setTimeout(() => setShakeHueco(null), 420);
    }
  };
  const resetCompletar = () => {
    setCompletado({});
    setSelFicha(null);
  };

  // ── modo glosario (empareja estructura → definición) ───────────────────
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
        persistMejor(clasificarDone, completarDone, true);
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

  // ── simulador «Mia's school day» ───────────────────────────────────────
  // El estado vive aquí (no en el modo) para que cambiar de modo no borre
  // lo decidido ni descumpla las misiones.
  const [elegidas, setElegidas] = useState<Record<string, Modal>>({});
  const [vistas, setVistas] = useState<Record<string, Modal>>({});
  const [actualSit, setActualSit] = useState(SITUACIONES[0]!.id);
  const [comparo, setComparo] = useState(false);
  const dia = resumenDia(elegidas);
  const decidir = (sitId: string, m: Modal) => {
    const sit = SITUACIONES.find((x) => x.id === sitId);
    if (!sit) return;
    setVistas((v) => ({ ...v, [sitId]: m }));
    if (elegidas[sitId]) {
      // Ya decidió: lo demás es solo mirar qué habría pasado.
      if (m !== elegidas[sitId]) setComparo(true);
      return;
    }
    setElegidas((e) => ({ ...e, [sitId]: m }));
    if (resolver(sit, m).puntos > 0) sfxPlace();
    else sfxNo();
  };
  const resetReglas = () => {
    setElegidas({});
    setVistas({});
    setActualSit(SITUACIONES[0]!.id);
    setComparo(false);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const clasificarDone = Object.keys(ubicado).length >= ORACIONES.length;
  const completarDone = Object.keys(completado).length >= HUECOS.length;
  const glosarioDone = Object.keys(empGlos).length >= PARES.length;
  const modosHechos = (clasificarDone ? 1 : 0) + (completarDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Escribe la regla de las 6 situaciones de Mia y mira qué le pasa", done: dia.decididas >= SITUACIONES.length },
    { txt: "Prueba otro modal en una situación ya resuelta y compara el resultado", done: comparo },
    { txt: "Clasifica las 10 reglas por su modal (must / mustn't / have to / don't have to)", done: clasificarDone },
    { txt: "Completa los 5 huecos con la forma correcta", done: completarDone },
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
  const resetActual =
    modo === "reglas" ? resetReglas : modo === "texto" ? resetTexto : modo === "clasificar" ? resetClasificar : modo === "completar" ? resetCompletar : resetGlosario;

  const lectura =
    modo === "reglas" ? (
      <>Warnings {dia.avisos}/3 · Minutes wasted {dia.minutos} · Decided {dia.decididas}/{SITUACIONES.length}</>
    ) : modo === "clasificar" ? (
      <>Reglas clasificadas: {Object.keys(ubicado).length}/{ORACIONES.length}</>
    ) : modo === "completar" ? (
      <>Huecos completos: {Object.keys(completado).length}/{HUECOS.length}</>
    ) : modo === "glosario" ? (
      <>Estructuras emparejadas: {Object.keys(empGlos).length}/{PARES.length}</>
    ) : (
      <>Completa el texto con las formas modales</>
    );

  const pista =
    modo === "reglas" ? (
      <>Elige el modal que escribe la regla y mira qué hace Mia. Después prueba otro modal: verás qué habría pasado.</>
    ) : modo === "clasificar" ? (
      <><strong style={{ color: T.text }}>must</strong> = obligación fuerte; <strong style={{ color: T.text }}>mustn&apos;t</strong> = prohibido; <strong style={{ color: T.text }}>have to</strong> = obligación externa; <strong style={{ color: T.text }}>don&apos;t have to</strong> = no es necesario (es opcional).</>
    ) : modo === "completar" ? (
      <>Recuerda: <strong style={{ color: T.text }}>must</strong> y <strong style={{ color: T.text }}>mustn&apos;t</strong> van con el verbo base (sin <strong style={{ color: T.text }}>to</strong> ni <strong style={{ color: T.text }}>-s</strong>); en 3ª persona <strong style={{ color: T.text }}>have to</strong> → <strong style={{ color: T.text }}>has to</strong>.</>
    ) : modo === "glosario" ? (
      <>Lee la definición y su ejemplo; luego suelta la estructura que le corresponde (casa, escuela o comunidad).</>
    ) : (
      <>Escribe la forma modal que completa cada frase.</>
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

          {modo === "reglas" && (
            <SimReglas
              elegidas={elegidas}
              vistas={vistas}
              actual={actualSit}
              onActual={setActualSit}
              onElegir={decidir}
              dia={dia}
            />
          )}

          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={REGLAS_INGLES_HUECOS}
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

          {/* MODO — Obligation, prohibition or no obligation? */}
          {modo === "clasificar" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada regla a su modal</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                    {Object.keys(ubicado).length}/{ORACIONES.length}
                  </span>
                </div>
                {oracionesLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {ORACIONES.length} reglas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {oracionesLibres.map((o) => (
                      <button key={o.id} className="rul-chip" data-sel={selOracion === o.id} onClick={() => setSelOracion((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                        {o.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsClasificar selOracion={selOracion} shakeBin={shakeBin} ubicado={ubicado} onMatch={intentarClasificar} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO — Complete the rule */}
          {modo === "completar" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra la forma correcta a cada hueco</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: completarDone ? OK : T.text3 }}>
                    {Object.keys(completado).length}/{HUECOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.5 }}>
                  Cuidado: hay formas <strong style={{ color: T.text2 }}>incorrectas</strong> (musts, must to, have, haves to) que no encajan en ningún hueco.
                </div>
                {fichasLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Completaste los {HUECOS.length} huecos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {fichasLibres.map((f) => (
                      <button key={f.id} className="rul-chip-sm" data-sel={selFicha === f.id} onClick={() => setSelFicha((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsCompletar selFicha={selFicha} shakeHueco={shakeHueco} completado={completado} onMatch={intentarCompletar} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO — Match the structure */}
          {modo === "glosario" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada estructura a su definición</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: glosarioDone ? OK : T.text3 }}>
                    {Object.keys(empGlos).length}/{PARES.length}
                  </span>
                </div>
                {glosLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES.length} estructuras!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {glosLibres.map((g) => (
                      <button key={g.id} className="rul-chip" data-sel={selGlos === g.id} onClick={() => setSelGlos((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <i className="fa-solid fa-quote-left" style={{ fontSize: 11, color: T.text3 }} />
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
      }
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Warnings" value={`${dia.avisos}/3`} col={dia.avisos >= 3 ? "#FF5E5E" : undefined} />
                  <Dato label="Minutes wasted" value={`${dia.minutos}`} col={dia.minutos > 0 ? "#FFC75A" : undefined} />
                  <Dato label="Rules" value={`${dia.puntos}/${dia.puntosMax}`} col={dia.decididas >= SITUACIONES.length ? OK : undefined} />
                  <Dato label="Decided" value={`${dia.decididas}/${SITUACIONES.length}`} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "You know the rules in English!" : "Termina los modos de arrastre para ganar estrellas; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Pista" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{pista}</p>
              </Bloque>
              <Bloque titulo="El día de Mia" icono="fa-calendar-day">
                {SITUACIONES.map((s) => {
                  const e = elegidas[s.id];
                  const r = e ? resolver(s, e) : null;
                  return (
                    <p key={s.id} style={{ margin: 0, color: T.text2 }}>
                      <strong style={{ color: T.text }}>{s.lugar}.</strong>{" "}
                      {r && e ? `${fraseCompleta(s, e)} → ${VEREDICTO_TXT[r.veredicto]}` : "Sin decidir todavía."}
                    </p>
                  );
                })}
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              {(Object.keys(MODAL_INFO) as Modal[]).map((m) => (
                <Bloque key={m} titulo={MODAL_INFO[m].titulo} icono={MODAL_INFO[m].icono}>
                  <p style={{ margin: 0, color: T.text2 }}>{MODAL_INFO[m].subtitulo}</p>
                  <p style={{ margin: 0, color: T.text3, fontStyle: "italic" }}>{MODAL_INFO[m].ejemplo}</p>
                </Bloque>
              ))}
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_REGLAS}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={REGLAS_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

const VEREDICTO_TXT: Record<Veredicto, string> = {
  seguro: "safe",
  matiz: "safe, with a nuance",
  sancion: "warning",
  esfuerzo: "wasted effort",
  perdida: "missed out",
};

const VEREDICTO_CARA: Record<Veredicto, { icono: string; col: string; titulo: string }> = {
  seguro: { icono: "fa-face-smile-beam", col: "#34D399", titulo: "Safe day" },
  matiz: { icono: "fa-face-smile", col: "#8EE3B0", titulo: "Safe, with a nuance" },
  sancion: { icono: "fa-face-frown", col: "#FF5E5E", titulo: "A warning!" },
  esfuerzo: { icono: "fa-face-tired", col: "#FFC75A", titulo: "Wasted effort" },
  perdida: { icono: "fa-face-meh", col: "#FFC75A", titulo: "Missed out" },
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador — Mia's school day (el alumno escribe la regla; Mia actúa)
 * ═══════════════════════════════════════════════════════════════════════════ */
function FotoSim({ clave, icono }: { clave: string; icono: string }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className="rul-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

function SimReglas({
  elegidas,
  vistas,
  actual,
  onActual,
  onElegir,
  dia,
}: {
  elegidas: Record<string, Modal>;
  vistas: Record<string, Modal>;
  actual: string;
  onActual: (id: string) => void;
  onElegir: (id: string, m: Modal) => void;
  dia: Dia;
}) {
  const sit = SITUACIONES.find((s) => s.id === actual) ?? SITUACIONES[0]!;
  const primera = elegidas[sit.id];
  const vista = vistas[sit.id];
  const res = vista ? resolver(sit, vista) : null;
  const cara = res ? VEREDICTO_CARA[res.veredicto] : null;
  const idx = SITUACIONES.findIndex((s) => s.id === sit.id);
  const siguiente = SITUACIONES[(idx + 1) % SITUACIONES.length]!;
  const finDia = dia.decididas >= SITUACIONES.length;

  return (
    <div className="rul-sim">
      <div className="rul-medidores">
        <div className="rul-med">
          <span>Warnings</span>
          <span className="rul-pips" aria-label={`${dia.avisos} de 3 avisos`}>
            {[0, 1, 2].map((i) => (
              <i key={i} className="fa-solid fa-triangle-exclamation" data-on={i < dia.avisos} />
            ))}
          </span>
        </div>
        <div className="rul-med">
          <span>Minutes wasted</span>
          <strong>{dia.minutos}</strong>
        </div>
        <div className="rul-med">
          <span>Safe rules</span>
          <strong>
            {dia.puntos}/{dia.puntosMax}
          </strong>
        </div>
      </div>

      <div className="rul-ruta" role="tablist" aria-label="Mia's day">
        {SITUACIONES.map((s) => {
          const e = elegidas[s.id];
          const v = e ? resolver(s, e).veredicto : null;
          return (
            <button key={s.id} type="button" role="tab" aria-selected={s.id === sit.id} className="rul-est" data-on={s.id === sit.id} data-v={v ?? "nada"} onClick={() => onActual(s.id)}>
              <i className={`fa-solid ${s.icono}`} aria-hidden />
              <span>{s.lugar}</span>
            </button>
          );
        })}
      </div>

      <div className="rul-sit">
        <FotoSim clave={sit.imagen} icono={sit.icono} />
        <div className="rul-sit-txt">
          <div className="rul-sit-ceja">
            {sit.lugar} · {idx + 1}/{SITUACIONES.length}
          </div>
          <h3>{sit.titulo}</h3>
          <p>{sit.contexto}</p>
        </div>
      </div>

      <div className="rul-regla">
        <div className="rul-regla-t">Write the rule</div>
        <div className="rul-frase">
          <span>{sit.antes}</span>
          <span className="rul-hueco" data-lleno={!!vista}>
            {vista ? formaModal(sit, vista) : "…"}
          </span>
          <span>{sit.despues}</span>
        </div>
        <div className="rul-opciones">
          {MODALES.map((m) => (
            <button key={m} type="button" className="rul-op" data-on={vista === m} onClick={() => onElegir(sit.id, m)}>
              {formaModal(sit, m)}
            </button>
          ))}
        </div>
      </div>

      {res && cara && vista ? (
        <div className="rul-result" data-v={res.veredicto} role="status">
          <div className="rul-cara" style={{ color: cara.col, borderColor: cara.col }}>
            <i className={`fa-solid ${cara.icono}`} aria-hidden />
          </div>
          <div className="rul-result-txt">
            <div className="rul-result-ceja" style={{ color: cara.col }}>
              {cara.titulo}
              <span>{vista === primera ? "Tu decisión cuenta" : "Vista previa: no cambia tu puntaje"}</span>
            </div>
            <p className="rul-narra">{res.texto}</p>
            <p className="rul-explica">{res.explica}</p>
            <button type="button" className="rul-btn" onClick={() => onActual(siguiente.id)}>
              Next situation <i className="fa-solid fa-arrow-right" aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <div className="rul-vacio">Elige un modal y mira qué hace Mia.</div>
      )}

      {finDia && (
        <div className="rul-fin" data-limpio={dia.limpio}>
          <i className={`fa-solid ${dia.limpio ? "fa-trophy" : "fa-flag-checkered"}`} aria-hidden />
          <span>
            {dia.limpio
              ? "Perfect day: no warnings and no wasted time."
              : `Day over: ${dia.avisos} warning${dia.avisos === 1 ? "" : "s"}, ${dia.minutos} minutes wasted (simulación). Prueba otros modales para ver qué habría pasado.`}
          </span>
        </div>
      )}
    </div>
  );
}

function css(accent: string, rgba: string): string {
  return `
    .rul-sim { display:flex; flex-direction:column; gap:14px; min-width:0; }
    .rul-medidores { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap:10px; }
    .rul-med { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 14px; border-radius:12px;
      border:1px solid ${T.line}; background:${T.glass}; font-size:14px; font-weight:800; color:${T.text2}; }
    .rul-med strong { font-size:19px; color:#fff; font-variant-numeric:tabular-nums; }
    .rul-pips { display:inline-flex; gap:6px; }
    .rul-pips i { font-size:17px; color:rgba(255,255,255,0.2); transition:color .25s, transform .25s; }
    .rul-pips i[data-on="true"] { color:${NO}; transform:scale(1.2); }
    .rul-ruta { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; scrollbar-width:thin; }
    .rul-est { cursor:pointer; flex:0 0 auto; display:inline-flex; align-items:center; gap:8px; padding:9px 12px; border-radius:12px;
      border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; }
    .rul-est:hover { color:#fff; border-color:${T.lineStrong}; }
    .rul-est[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; }
    .rul-est[data-v="seguro"], .rul-est[data-v="matiz"] { box-shadow:inset 0 -3px 0 ${OK}; }
    .rul-est[data-v="sancion"] { box-shadow:inset 0 -3px 0 ${NO}; }
    .rul-est[data-v="esfuerzo"], .rul-est[data-v="perdida"] { box-shadow:inset 0 -3px 0 #FFC75A; }
    .rul-sit { display:grid; grid-template-columns:minmax(0, 1fr) minmax(0, 1.2fr); gap:14px; align-items:stretch; }
    @container lsescena (max-width: 620px) { .rul-sit { grid-template-columns:1fr; } }
    .rul-foto { position:relative; min-height:150px; border-radius:16px; overflow:hidden; display:flex; align-items:center; justify-content:center;
      background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); border:1px solid ${T.line}; }
    .rul-foto > i { font-size:44px; color:rgba(255,255,255,0.35); }
    .rul-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
    .rul-sit-txt { display:grid; gap:6px; align-content:center; }
    .rul-sit-ceja { font-size:14px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:${accent}; }
    .rul-sit-txt h3 { margin:0; font-size:20px; font-weight:900; color:#fff; }
    .rul-sit-txt p { margin:0; font-size:15px; line-height:1.5; color:${T.text2}; }
    .rul-regla { display:grid; gap:10px; padding:14px 16px; border-radius:16px; border:1px solid rgba(${rgba},0.35); background:rgba(${rgba},0.08); }
    .rul-regla-t { font-size:14px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:${T.text3}; }
    .rul-frase { display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:20px; font-weight:800; color:#fff; line-height:1.4; }
    .rul-hueco { min-width:70px; text-align:center; padding:2px 12px; border-radius:10px; border:2px dashed ${T.lineStrong}; color:${T.text3}; }
    .rul-hueco[data-lleno="true"] { border-style:solid; border-color:${accent}; color:${accent}; background:rgba(${rgba},0.14); }
    .rul-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 130px), 1fr)); gap:8px; }
    .rul-op { cursor:pointer; padding:12px 10px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
      font-size:16px; font-weight:900; transition:all .14s; }
    .rul-op:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.1); transform:translateY(-1px); }
    .rul-op[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.24); }
    .rul-result { display:flex; gap:14px; align-items:flex-start; padding:14px 16px; border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass};
      animation:rulPop .3s ease; }
    .rul-result[data-v="seguro"], .rul-result[data-v="matiz"] { border-color:${OK}77; background:${OK}10; }
    .rul-result[data-v="sancion"] { border-color:${NO}77; background:${NO}10; }
    .rul-result[data-v="esfuerzo"], .rul-result[data-v="perdida"] { border-color:#FFC75A77; background:#FFC75A10; }
    .rul-cara { flex:0 0 auto; width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center;
      font-size:30px; border:2px solid; background:rgba(0,0,0,0.25); }
    .rul-result-txt { display:grid; gap:8px; min-width:0; }
    .rul-result-ceja { display:flex; flex-wrap:wrap; gap:4px 12px; align-items:baseline; font-size:16px; font-weight:900; }
    .rul-result-ceja span { font-size:14px; font-weight:700; color:${T.text3}; }
    .rul-narra { margin:0; font-size:16px; font-weight:700; color:#fff; line-height:1.45; }
    .rul-explica { margin:0; font-size:15px; color:${T.text2}; line-height:1.5; }
    .rul-vacio { padding:14px 16px; border-radius:16px; border:1.5px dashed ${T.line}; font-size:15px; color:${T.text3}; text-align:center; }
    .rul-fin { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:14px; border:1px solid #FFC75A66; background:#FFC75A12;
      font-size:15px; font-weight:700; color:#fff; line-height:1.45; }
    .rul-fin[data-limpio="true"] { border-color:${OK}77; background:${OK}14; }
    .rul-fin i { font-size:22px; color:#FFC75A; }
    .rul-fin[data-limpio="true"] i { color:${OK}; }

    @keyframes rulShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
    @keyframes rulPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
    .rul-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
      border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:min(360px, 100%); text-align:left; line-height:1.4; }
    .rul-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
    .rul-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
    .rul-chip:active { cursor:grabbing; }
    .rul-chip-sm { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
      border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
    .rul-chip-sm:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
    .rul-chip-sm[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
    .rul-chip-sm:active { cursor:grabbing; }
    .rul-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
    .rul-row[data-shake="true"] { animation:rulShake .4s; border-color:${NO}; }
    .rul-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
    .rul-slot { flex-shrink:0; min-width:110px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
      display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
    .rul-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
    .rul-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
    .rul-bin[data-shake="true"] { animation:rulShake .4s; border-color:${NO}; }
    .rul-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
      border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
    .rul-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
    .rul-q:disabled{ cursor:default; }
    .rul-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px; justify-self:start;
      border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
    .rul-btn:hover { border-color:${T.lineStrong}; }

    /* Identidad del tablero */
    .rul-bin, .rul-row { --tono:188; position:relative;
      background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
    .rul-bin:nth-of-type(6n+1), .rul-row:nth-of-type(6n+1) { --tono:188; }
    .rul-bin:nth-of-type(6n+2), .rul-row:nth-of-type(6n+2) { --tono:262; }
    .rul-bin:nth-of-type(6n+3), .rul-row:nth-of-type(6n+3) { --tono:44; }
    .rul-bin:nth-of-type(6n+4), .rul-row:nth-of-type(6n+4) { --tono:152; }
    .rul-bin:nth-of-type(6n+5), .rul-row:nth-of-type(6n+5) { --tono:330; }
    .rul-bin:nth-of-type(6n+6), .rul-row:nth-of-type(6n+6) { --tono:18; }
    .rul-bin::before, .rul-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
      background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
    .rul-bin[data-done="true"], .rul-row[data-done="true"] {
      background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
    .rul-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
    .rul-chip:hover { transform:translateY(-2px); }
    .rul-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
    @media (prefers-reduced-motion: reduce){
      .rul-row[data-shake="true"], .rul-bin[data-shake="true"] { animation:none; }
      .rul-chip, .rul-chip:hover, .rul-chip[data-sel="true"] { transform:none; transition:none; }
      .rul-op:hover, .rul-result { transform:none; animation:none; }
      .rul-pips i[data-on="true"] { transform:none; }
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsClasificar({
  selOracion,
  shakeBin,
  ubicado,
  onMatch,
  dropProps,
}: {
  selOracion: string | null;
  shakeBin: Modal | null;
  ubicado: Record<string, Modal>;
  onMatch: (oracionId: string, bin: Modal) => void;
  dropProps: DropFactory;
}) {
  const bins: Modal[] = ["must", "mustnt", "haveto", "donthaveto"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = MODAL_INFO[bin];
        const dentro = ORACIONES.filter((o) => ubicado[o.id] === bin);
        return (
          <div
            key={bin}
            className="rul-bin"
            data-shake={shakeBin === bin}
            onClick={() => selOracion && onMatch(selOracion, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 4, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ fontSize: 14, color: T.text3, fontStyle: "italic", marginBottom: 12 }}>{info.ejemplo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((o) => (
                  <span key={o.id} style={{ animation: "rulPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {o.texto}
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

function RowsCompletar({
  selFicha,
  shakeHueco,
  completado,
  onMatch,
  dropProps,
}: {
  selFicha: string | null;
  shakeHueco: string | null;
  completado: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {HUECOS.map((h) => {
        const done = completado[h.id];
        return (
          <div
            key={h.id}
            className="rul-row"
            data-shake={shakeHueco === h.id}
            data-done={done}
            onClick={() => !done && selFicha && onMatch(selFicha, h.id)}
            {...dropProps((id) => onMatch(id, h.id))}
          >
            <div style={{ fontSize: 14.5, color: done ? "#fff" : T.text2, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              {h.antes && <span>{h.antes}</span>}
              {done ? (
                <span style={{ animation: "rulPop .25s ease", fontWeight: 900, color: OK }}>{h.resp}</span>
              ) : (
                <span className="rul-slot" data-armed={!!selFicha} style={{ minWidth: 110 }}>
                  <i className="fa-solid fa-arrow-down" style={{ fontSize: 11 }} />
                </span>
              )}
              <span>{h.despues}</span>
            </div>
            {!done && (
              <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic", flexShrink: 0, maxWidth: 220, lineHeight: 1.4 }}>{h.pista}</span>
            )}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES.map((g) => {
        const done = empGlos[g.id];
        return (
          <div
            key={g.id}
            className="rul-row"
            data-shake={shakeGlos === g.id}
            data-done={done}
            onClick={() => !done && selGlos && onMatch(selGlos, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="rul-slot" data-armed={!done && !!selGlos} style={{ minWidth: 200, ...(done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : {}) }}>
              {done ? (
                <span style={{ animation: "rulPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7, lineHeight: 1.35 }}>
                  <i className="fa-solid fa-quote-left" />
                  {g.termino}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> estructura
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
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
    <div style={{ display: "grid", gap: 14 }}>
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
        Cinco afirmaciones sobre las reglas con must, mustn&apos;t y have to. Decide si son verdaderas o falsas y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="rul-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
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
          <button className="rul-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="rul-btn" onClick={reintentar}>
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
