"use client";

/**
 * Laboratorio — Tipos de preguntas: científicas, cotidianas y filosóficas.
 * Práctica interactiva para PFH-I-P02 (Pensamiento Filosófico y Humanidades I).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «3 tipos» — clasifica doce preguntas en tres cestas según su tipo:
 *     COTIDIANA / CIENTÍFICA / FILOSÓFICA.
 *  2. «Ramas filosóficas» — clasifica preguntas filosóficas en sus cinco ramas:
 *     ONTOLOGÍA / EPISTEMOLOGÍA / ÉTICA / ESTÉTICA / POLÍTICA.
 *  3. «De cotidiana a filosófica» — empareja cada pregunta cotidiana con su
 *     versión filosófica profundizada.
 *  + Cuestionario de comprensión (verbatim de A1/A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de PFH-I·P02.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { TIPOS_DE_PREGUNTAS_HUECOS } from "./tipos-de-preguntas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { TIPOS_DE_PREGUNTAS_FICHA } from "./tipos-de-preguntas-ficha";
import {
  PREGUNTAS,
  TIPO_INFO,
  PREGUNTAS_RAMA,
  RAMA_INFO,
  PARES,
  QUIZ,
  DATO_PREGUNTAS,
  type TipoPregunta,
  type RamaFilosofica,
} from "./tipos-de-preguntas-data";
import { PREGUNTAS_ENTREVISTA, PRESUPUESTO, SECCIONES, palabras, resumenEntrevista, type ResumenEntrevista } from "./tipos-de-preguntas-sim";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-tipos-de-preguntas-reto";
const RUTA_SIM = "/media/labs-sim/tipos-de-preguntas";

type Modo = "entrevista" | "tipos" | "ramas" | "profundizar" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "entrevista", label: "La entrevista", icono: "fa-microphone-lines" },
  { id: "tipos", label: "3 tipos de preguntas", icono: "fa-layer-group" },
  { id: "ramas", label: "Ramas filosóficas", icono: "fa-code-branch" },
  { id: "profundizar", label: "De cotidiana a filosófica", icono: "fa-arrow-up-right-dots" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabTiposDePreguntas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("entrevista");

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
  const sfxBlip = () => sonido && audioRef.current?.blip();
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── modo tipos (clasifica por tipo de pregunta) ────────────────────────
  const [ubicTipo, setUbicTipo] = useState<Record<string, TipoPregunta>>({});
  const [selTipo, setSelTipo] = useState<string | null>(null);
  const [shakeTipo, setShakeTipo] = useState<TipoPregunta | null>(null);
  const tiposLibres = PREGUNTAS.filter((p) => !ubicTipo[p.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarTipo = (preguntaId: string, bin: TipoPregunta) => {
    if (ubicTipo[preguntaId]) return;
    const p = PREGUNTAS.find((x) => x.id === preguntaId);
    if (p && p.tipo === bin) {
      setUbicTipo((e) => ({ ...e, [preguntaId]: bin }));
      setSelTipo(null);
      sfxPlace();
      if (Object.keys(ubicTipo).length + 1 >= PREGUNTAS.length) {
        sfxOk();
        persistMejor(true, ramasDone, profundizarDone);
      }
    } else {
      setShakeTipo(bin);
      sfxNo();
      window.setTimeout(() => setShakeTipo(null), 420);
    }
  };
  const resetTipos = () => {
    setUbicTipo({});
    setSelTipo(null);
  };

  // ── modo ramas (clasifica pregunta filosófica por su rama) ─────────────
  const [ubicRama, setUbicRama] = useState<Record<string, RamaFilosofica>>({});
  const [selRama, setSelRama] = useState<string | null>(null);
  const [shakeRama, setShakeRama] = useState<RamaFilosofica | null>(null);
  const ramasLibres = PREGUNTAS_RAMA.filter((p) => !ubicRama[p.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarRama = (preguntaId: string, bin: RamaFilosofica) => {
    if (ubicRama[preguntaId]) return;
    const p = PREGUNTAS_RAMA.find((x) => x.id === preguntaId);
    if (p && p.rama === bin) {
      setUbicRama((e) => ({ ...e, [preguntaId]: bin }));
      setSelRama(null);
      sfxPlace();
      if (Object.keys(ubicRama).length + 1 >= PREGUNTAS_RAMA.length) {
        sfxOk();
        persistMejor(tiposDone, true, profundizarDone);
      }
    } else {
      setShakeRama(bin);
      sfxNo();
      window.setTimeout(() => setShakeRama(null), 420);
    }
  };
  const resetRamas = () => {
    setUbicRama({});
    setSelRama(null);
  };

  // ── modo profundizar (empareja cotidiana → filosófica) ─────────────────
  const [empPar, setEmpPar] = useState<Record<string, boolean>>({});
  const [selPar, setSelPar] = useState<string | null>(null);
  const [shakePar, setShakePar] = useState<string | null>(null);
  const paresLibres = PARES.filter((g) => !empPar[g.id]).slice().sort((a, b) => a.cotidiana.localeCompare(b.cotidiana, "es"));

  const intentarPar = (chipId: string, rowId: string) => {
    if (empPar[rowId]) return;
    if (chipId === rowId) {
      setEmpPar((e) => ({ ...e, [rowId]: true }));
      setSelPar(null);
      sfxPlace();
      if (Object.keys(empPar).length + 1 >= PARES.length) {
        sfxOk();
        persistMejor(tiposDone, ramasDone, true);
      }
    } else {
      setShakePar(rowId);
      sfxNo();
      window.setTimeout(() => setShakePar(null), 420);
    }
  };
  const resetProfundizar = () => {
    setEmpPar({});
    setSelPar(null);
  };

  // ── simulador «La entrevista» ──────────────────────────────────────────
  // El estado vive aquí (no en el modo) para que cambiar de modo no borre la
  // entrevista ni descumpla las misiones.
  const [hechas, setHechas] = useState<string[]>([]);
  const ent = resumenEntrevista(hechas);
  const preguntar = (id: string) => {
    if (hechas.includes(id) || hechas.length >= PRESUPUESTO) return;
    const p = PREGUNTAS_ENTREVISTA.find((x) => x.id === id);
    if (!p) return;
    const sigue = [...hechas, id];
    const antes = resumenEntrevista(hechas);
    const despues = resumenEntrevista(sigue);
    setHechas(sigue);
    if (despues.completo && !antes.completo) sfxOk();
    else if (antes.porTipo[p.tipo] === 0) sfxPlace();
    else sfxBlip();
  };
  const resetEntrevista = () => setHechas([]);

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const tiposDone = Object.keys(ubicTipo).length >= PREGUNTAS.length;
  const ramasDone = Object.keys(ubicRama).length >= PREGUNTAS_RAMA.length;
  const profundizarDone = Object.keys(empPar).length >= PARES.length;
  const modosHechos = (tiposDone ? 1 : 0) + (ramasDone ? 1 : 0) + (profundizarDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Usa tus 5 preguntas para entrevistar a Doña Elena y mira cómo cambia cada respuesta", done: ent.usadas >= PRESUPUESTO },
    { txt: "Arma un reporte con datos, explicaciones y reflexiones", done: ent.completo },
    { txt: "Clasifica las 12 preguntas por su tipo", done: tiposDone },
    { txt: "Clasifica las preguntas en sus 5 ramas", done: ramasDone },
    { txt: "Empareja cada pregunta cotidiana con su versión filosófica", done: profundizarDone },
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
    modo === "entrevista" ? resetEntrevista : modo === "texto" ? resetTexto : modo === "tipos" ? resetTipos : modo === "ramas" ? resetRamas : resetProfundizar;

  const lectura =
    modo === "entrevista" ? (
      <>Preguntas: {ent.restantes}/{PRESUPUESTO} · Información: {ent.info}/{ent.infoMax}</>
    ) : modo === "tipos" ? (
      <>Preguntas clasificadas: {Object.keys(ubicTipo).length}/{PREGUNTAS.length}</>
    ) : modo === "ramas" ? (
      <>Preguntas en su rama: {Object.keys(ubicRama).length}/{PREGUNTAS_RAMA.length}</>
    ) : modo === "profundizar" ? (
      <>Pares emparejados: {Object.keys(empPar).length}/{PARES.length}</>
    ) : (
      <>Completa el texto sobre los tipos de preguntas</>
    );

  const pista =
    modo === "entrevista" ? (
      <>Cada tipo de pregunta trae un tipo de respuesta. Elige con cuidado: solo tienes {PRESUPUESTO} preguntas y el reporte necesita datos, explicaciones y reflexiones.</>
    ) : modo === "tipos" ? (
      <>La pregunta <strong style={{ color: T.text }}>cotidiana</strong> tiene respuesta inmediata; la <strong style={{ color: T.text }}>científica</strong> se responde con evidencia empírica; la <strong style={{ color: T.text }}>filosófica</strong> exige reflexión conceptual.</>
    ) : modo === "ramas" ? (
      <>Cada rama pregunta por algo distinto: la <strong style={{ color: T.text }}>ontología</strong> por el ser, la <strong style={{ color: T.text }}>epistemología</strong> por el conocer, la <strong style={{ color: T.text }}>ética</strong> por el bien, la <strong style={{ color: T.text }}>estética</strong> por lo bello y la <strong style={{ color: T.text }}>política</strong> por el poder y la justicia.</>
    ) : modo === "profundizar" ? (
      <>Muchas preguntas cotidianas se vuelven filosóficas cuando profundizamos en ellas: lleva cada pregunta práctica a su versión de fondo.</>
    ) : (
      <>Escribe la palabra que completa cada frase.</>
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

          {modo === "entrevista" && <SimEntrevista hechas={hechas} onPreguntar={preguntar} ent={ent} />}

          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={TIPOS_DE_PREGUNTAS_HUECOS}
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

          {/* MODO — tipos */}
          {modo === "tipos" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada pregunta a su tipo</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: tiposDone ? OK : T.text3 }}>
                    {Object.keys(ubicTipo).length}/{PREGUNTAS.length}
                  </span>
                </div>
                {tiposLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {PREGUNTAS.length} preguntas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {tiposLibres.map((p) => (
                      <button key={p.id} className="tdp-chip" data-sel={selTipo === p.id} onClick={() => setSelTipo((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        {p.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsTipos selTipo={selTipo} shakeTipo={shakeTipo} ubicTipo={ubicTipo} onMatch={intentarTipo} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO — ramas */}
          {modo === "ramas" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada pregunta filosófica a su rama</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: ramasDone ? OK : T.text3 }}>
                    {Object.keys(ubicRama).length}/{PREGUNTAS_RAMA.length}
                  </span>
                </div>
                {ramasLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {PREGUNTAS_RAMA.length} preguntas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {ramasLibres.map((p) => (
                      <button key={p.id} className="tdp-chip" data-sel={selRama === p.id} onClick={() => setSelRama((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-brain" style={{ fontSize: 11, color: T.text3 }} />
                        {p.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsRamas selRama={selRama} shakeRama={shakeRama} ubicRama={ubicRama} onMatch={intentarRama} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO — profundizar */}
          {modo === "profundizar" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada pregunta cotidiana a su versión filosófica</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: profundizarDone ? OK : T.text3 }}>
                    {Object.keys(empPar).length}/{PARES.length}
                  </span>
                </div>
                {paresLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES.length} preguntas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {paresLibres.map((g) => (
                      <button key={g.id} className="tdp-chip" data-sel={selPar === g.id} onClick={() => setSelPar((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <i className="fa-solid fa-mug-hot" style={{ fontSize: 11, color: T.text3 }} />
                        {g.cotidiana}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsProfundizar selPar={selPar} shakePar={shakePar} empPar={empPar} onMatch={intentarPar} dropProps={dropProps} />
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
                  <Dato label="Preguntas" value={`${ent.restantes}/${PRESUPUESTO}`} col={ent.restantes === 0 ? "#FFC75A" : undefined} />
                  <Dato label="Información" value={`${ent.info}/${ent.infoMax}`} col={ent.completo ? OK : undefined} />
                  <Dato label="Datos" value={`${ent.porTipo.cotidiana}`} />
                  <Dato label="Reflexiones" value={`${ent.porTipo.filosofica}`} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Distingues los tipos de preguntas como un filósofo!" : "Termina los modos de arrastre para ganar estrellas; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Pista" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{pista}</p>
              </Bloque>
              <Bloque titulo="Tu entrevista" icono="fa-microphone">
                {hechas.length === 0 ? (
                  <p style={{ margin: 0, color: T.text3 }}>Sin preguntas todavía.</p>
                ) : (
                  hechas.map((id) => {
                    const p = PREGUNTAS_ENTREVISTA.find((x) => x.id === id)!;
                    return (
                      <p key={id} style={{ margin: 0, color: T.text2 }}>
                        <strong style={{ color: T.text }}>{p.texto}</strong> · {TIPO_INFO[p.tipo].titulo}, {palabras(p.respuesta)} palabras.
                      </p>
                    );
                  })
                )}
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
              {(Object.keys(TIPO_INFO) as TipoPregunta[]).map((t) => (
                <Bloque key={t} titulo={`Pregunta ${TIPO_INFO[t].titulo.toLowerCase()}`} icono={TIPO_INFO[t].icono}>
                  <p style={{ margin: 0, color: T.text2 }}>{TIPO_INFO[t].subtitulo}</p>
                </Bloque>
              ))}
              {(Object.keys(RAMA_INFO) as RamaFilosofica[]).map((r) => (
                <Bloque key={r} titulo={RAMA_INFO[r].titulo} icono={RAMA_INFO[r].icono}>
                  <p style={{ margin: 0, color: T.text2 }}>{RAMA_INFO[r].subtitulo}</p>
                </Bloque>
              ))}
              <Bloque titulo="De cotidiana a filosófica" icono="fa-arrow-up-right-dots">
                {PARES.map((g) => (
                  <p key={g.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{g.cotidiana}</strong> → {g.filosofica}. <em>{g.pista}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_PREGUNTAS}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TIPOS_DE_PREGUNTAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador — La entrevista (el tipo de pregunta decide el tipo de respuesta)
 * ═══════════════════════════════════════════════════════════════════════════ */
function FotoSim({ clave, icono, clase }: { clave: string; icono: string; clase: string }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className={clase} aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

const IMG_SECCION: Record<TipoPregunta, string> = {
  cotidiana: "mesa-relojes",
  cientifica: "telescopio",
  filosofica: "reloj-sol",
};

function SimEntrevista({
  hechas,
  onPreguntar,
  ent,
}: {
  hechas: string[];
  onPreguntar: (id: string) => void;
  ent: ResumenEntrevista;
}) {
  const ultima = hechas.length ? PREGUNTAS_ENTREVISTA.find((p) => p.id === hechas[hechas.length - 1]) : undefined;
  const pct = Math.round((ent.info / ent.infoMax) * 100);

  return (
    <div className="tdp-sim">
      <div className="tdp-ent">
        <FotoSim clave="retrato" icono="fa-user-clock" clase="tdp-retrato" />
        <div className="tdp-ent-txt">
          <div className="tdp-ceja">Entrevista para tu reporte · «El tiempo»</div>
          <h3>Doña Elena Duarte, relojera retirada</h3>
          <p>Personaje ficticio de Valle Claro. Tienes {PRESUPUESTO} preguntas: elige bien.</p>
        </div>
        <div className="tdp-pips" aria-label={`${ent.restantes} preguntas restantes`}>
          {Array.from({ length: PRESUPUESTO }, (_, i) => (
            <i key={i} className="fa-solid fa-microphone" data-on={i < ent.restantes} />
          ))}
        </div>
      </div>

      <div className="tdp-medidor" aria-label={`Información reunida ${ent.info} de ${ent.infoMax}`}>
        <div className="tdp-medidor-top">
          <span>Información reunida</span>
          <strong>
            {ent.info}/{ent.infoMax}
          </strong>
        </div>
        <div className="tdp-barra">
          <div style={{ width: `${pct}%` }} data-ok={ent.completo} />
        </div>
      </div>

      <div className="tdp-banco" role="group" aria-label="Preguntas posibles">
        {PREGUNTAS_ENTREVISTA.map((p) => {
          const hecha = hechas.includes(p.id);
          return (
            <button key={p.id} type="button" className="tdp-pregunta" data-hecha={hecha} disabled={hecha || ent.terminada} onClick={() => onPreguntar(p.id)}>
              <i className={`fa-solid ${hecha ? "fa-check" : "fa-comment-dots"}`} aria-hidden />
              <span>{p.texto}</span>
              {hecha && <em>{TIPO_INFO[p.tipo].titulo}</em>}
            </button>
          );
        })}
      </div>

      {hechas.length > 0 && (
        <div className="tdp-charla" aria-live="polite">
          {hechas.map((id) => {
            const p = PREGUNTAS_ENTREVISTA.find((x) => x.id === id)!;
            const n = palabras(p.respuesta);
            return (
              <div key={id} className="tdp-turno" data-tipo={p.tipo} data-ultima={ultima?.id === id}>
                <div className="tdp-q">{p.texto}</div>
                <div className="tdp-a">
                  <p>{p.respuesta}</p>
                  <div className="tdp-largo">
                    <span>{n} palabras</span>
                    <span className="tdp-largo-barra">
                      <span style={{ width: `${Math.min(100, (n / 40) * 100)}%` }} />
                    </span>
                  </div>
                  {ultima?.id === id && (
                    <p className="tdp-porque">
                      <i className={`fa-solid ${TIPO_INFO[p.tipo].icono}`} aria-hidden /> <strong>Pregunta {TIPO_INFO[p.tipo].titulo.toLowerCase()}.</strong> {p.porque}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="tdp-reporte">
        <div className="tdp-reporte-t">
          <i className="fa-solid fa-file-pen" aria-hidden /> Borrador de tu reporte
        </div>
        <div className="tdp-secciones">
          {SECCIONES.map((s) => {
            const citas = hechas.map((id) => PREGUNTAS_ENTREVISTA.find((x) => x.id === id)!).filter((p) => p.tipo === s.tipo);
            return (
              <div key={s.tipo} className="tdp-seccion" data-lleno={citas.length > 0}>
                <div className="tdp-seccion-cab">
                  <FotoSim clave={IMG_SECCION[s.tipo]} icono={s.icono} clase="tdp-mini" />
                  <strong>{s.titulo}</strong>
                </div>
                {citas.length === 0 ? <p className="tdp-vacia">{s.vacia}</p> : citas.map((c) => <p key={c.id}>{c.cita}</p>)}
              </div>
            );
          })}
        </div>
        <div className="tdp-dictamen" data-ok={ent.completo} role="status">
          <i className={`fa-solid ${ent.completo ? "fa-circle-check" : "fa-circle-info"}`} aria-hidden /> {ent.dictamen}
        </div>
      </div>
    </div>
  );
}

function css(accent: string, rgba: string): string {
  return `
    .tdp-sim { display:flex; flex-direction:column; gap:14px; min-width:0; }
    .tdp-ent { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:12px 14px; border-radius:16px;
      border:1px solid rgba(${rgba},0.35); background:rgba(${rgba},0.08); }
    .tdp-retrato { position:relative; flex:0 0 auto; width:76px; height:76px; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center;
      background:linear-gradient(135deg, rgba(${rgba},0.4), rgba(8,19,31,0.9)); border:2px solid ${accent}; }
    .tdp-retrato > i { font-size:30px; color:rgba(255,255,255,0.4); }
    .tdp-retrato img, .tdp-mini img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
    .tdp-ent-txt { flex:1 1 200px; min-width:0; display:grid; gap:3px; }
    .tdp-ceja { font-size:14px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; color:${accent}; }
    .tdp-ent-txt h3 { margin:0; font-size:19px; font-weight:900; color:#fff; }
    .tdp-ent-txt p { margin:0; font-size:15px; color:${T.text2}; line-height:1.4; }
    .tdp-pips { display:inline-flex; gap:8px; }
    .tdp-pips i { font-size:20px; color:rgba(255,255,255,0.18); transition:color .25s, transform .25s; }
    .tdp-pips i[data-on="true"] { color:${accent}; }
    .tdp-medidor { display:grid; gap:6px; }
    .tdp-medidor-top { display:flex; justify-content:space-between; align-items:baseline; font-size:15px; font-weight:800; color:${T.text2}; }
    .tdp-medidor-top strong { font-size:18px; color:#fff; font-variant-numeric:tabular-nums; }
    .tdp-barra { height:14px; border-radius:999px; background:rgba(255,255,255,0.1); overflow:hidden; }
    .tdp-barra > div { height:100%; border-radius:999px; background:linear-gradient(90deg, ${accent}, #8EE3FF); transition:width .5s ease; }
    .tdp-barra > div[data-ok="true"] { background:linear-gradient(90deg, ${OK}, #8EE3B0); }
    .tdp-banco { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap:8px; }
    .tdp-pregunta { cursor:pointer; display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:12px; text-align:left;
      border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:700; line-height:1.35; transition:all .14s; }
    .tdp-pregunta:hover:not(:disabled) { border-color:${accent}; background:rgba(${rgba},0.16); transform:translateY(-1px); }
    .tdp-pregunta:disabled { cursor:default; }
    .tdp-pregunta[data-hecha="true"] { border-color:${OK}66; background:${OK}10; color:${T.text2}; }
    .tdp-pregunta:disabled:not([data-hecha="true"]) { opacity:.45; }
    .tdp-pregunta i { color:${accent}; }
    .tdp-pregunta[data-hecha="true"] i { color:${OK}; }
    .tdp-pregunta span { flex:1; min-width:0; }
    .tdp-pregunta em { font-style:normal; font-size:14px; font-weight:900; color:${OK}; }
    .tdp-charla { display:grid; gap:12px; }
    .tdp-turno { display:grid; gap:6px; animation:tdpPop .3s ease; }
    .tdp-q { justify-self:end; max-width:88%; padding:9px 14px; border-radius:16px 16px 4px 16px; background:rgba(${rgba},0.28);
      color:#fff; font-size:15px; font-weight:700; }
    .tdp-a { justify-self:start; max-width:94%; display:grid; gap:8px; padding:10px 14px; border-radius:16px 16px 16px 4px;
      border:1px solid ${T.line}; background:${T.glass}; }
    .tdp-turno[data-tipo="cientifica"] .tdp-a { border-color:#5BC8FF66; }
    .tdp-turno[data-tipo="filosofica"] .tdp-a { border-color:#C79BFF66; }
    .tdp-a p { margin:0; font-size:15px; line-height:1.5; color:#fff; }
    .tdp-largo { display:flex; align-items:center; gap:10px; font-size:14px; color:${T.text3}; font-weight:700; }
    .tdp-largo-barra { flex:1; min-width:40px; height:6px; border-radius:99px; background:rgba(255,255,255,0.1); overflow:hidden; }
    .tdp-largo-barra > span { display:block; height:100%; background:${accent}; border-radius:99px; }
    .tdp-a p.tdp-porque { font-size:14px; color:${T.text2}; padding-top:6px; border-top:1px solid ${T.line}; }
    .tdp-porque i { color:${accent}; }
    .tdp-reporte { display:grid; gap:10px; padding:14px 16px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
    .tdp-reporte-t { font-size:14px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; color:${T.text3}; display:flex; gap:8px; align-items:center; }
    .tdp-secciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:10px; }
    .tdp-seccion { display:grid; gap:6px; align-content:start; padding:10px 12px; border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; }
    .tdp-seccion[data-lleno="true"] { border-style:solid; border-color:${OK}66; background:${OK}0c; }
    .tdp-seccion p { margin:0; font-size:14px; line-height:1.45; color:#fff; }
    .tdp-seccion p.tdp-vacia { color:${T.text3}; font-style:italic; }
    .tdp-seccion-cab { display:flex; align-items:center; gap:8px; font-size:15px; color:#fff; }
    .tdp-mini { position:relative; flex:0 0 auto; width:34px; height:34px; border-radius:9px; overflow:hidden; display:flex; align-items:center; justify-content:center;
      background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); }
    .tdp-mini > i { font-size:15px; color:rgba(255,255,255,0.55); }
    .tdp-dictamen { display:flex; gap:10px; align-items:flex-start; padding:10px 14px; border-radius:12px; border:1px solid #FFC75A66; background:#FFC75A12;
      font-size:15px; font-weight:700; color:#fff; line-height:1.45; }
    .tdp-dictamen[data-ok="true"] { border-color:${OK}77; background:${OK}14; }
    .tdp-dictamen i { margin-top:3px; color:#FFC75A; }
    .tdp-dictamen[data-ok="true"] i { color:${OK}; }

    @keyframes tdpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
    @keyframes tdpPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
    .tdp-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
      border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:min(360px, 100%); text-align:left; line-height:1.4; }
    .tdp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
    .tdp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
    .tdp-chip:active { cursor:grabbing; }
    .tdp-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
    .tdp-row[data-shake="true"] { animation:tdpShake .4s; border-color:${NO}; }
    .tdp-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
    .tdp-slot { flex-shrink:0; min-width:160px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
      display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
    .tdp-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
    .tdp-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:160px; }
    .tdp-bin[data-shake="true"] { animation:tdpShake .4s; border-color:${NO}; }
    .tdp-q-op { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
      border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
    .tdp-q-op:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
    .tdp-q-op:disabled{ cursor:default; }
    .tdp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
      border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
    .tdp-btn:hover { border-color:${T.lineStrong}; }

    /* Identidad del tablero */
    .tdp-bin, .tdp-row { --tono:188; position:relative;
      background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
    .tdp-bin:nth-of-type(6n+1), .tdp-row:nth-of-type(6n+1) { --tono:188; }
    .tdp-bin:nth-of-type(6n+2), .tdp-row:nth-of-type(6n+2) { --tono:262; }
    .tdp-bin:nth-of-type(6n+3), .tdp-row:nth-of-type(6n+3) { --tono:44; }
    .tdp-bin:nth-of-type(6n+4), .tdp-row:nth-of-type(6n+4) { --tono:152; }
    .tdp-bin:nth-of-type(6n+5), .tdp-row:nth-of-type(6n+5) { --tono:330; }
    .tdp-bin:nth-of-type(6n+6), .tdp-row:nth-of-type(6n+6) { --tono:18; }
    .tdp-bin::before, .tdp-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
      background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
    .tdp-bin[data-done="true"], .tdp-row[data-done="true"] {
      background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
    .tdp-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
    .tdp-chip:hover { transform:translateY(-2px); }
    .tdp-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
    @media (prefers-reduced-motion: reduce){
      .tdp-row[data-shake="true"], .tdp-bin[data-shake="true"] { animation:none; }
      .tdp-chip, .tdp-chip:hover, .tdp-chip[data-sel="true"] { transform:none; transition:none; }
      .tdp-pregunta:hover:not(:disabled) { transform:none; }
      .tdp-turno { animation:none; }
      .tdp-barra > div { transition:none; }
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

function BinsTipos({
  selTipo,
  shakeTipo,
  ubicTipo,
  onMatch,
  dropProps,
}: {
  selTipo: string | null;
  shakeTipo: TipoPregunta | null;
  ubicTipo: Record<string, TipoPregunta>;
  onMatch: (preguntaId: string, bin: TipoPregunta) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoPregunta[] = ["cotidiana", "cientifica", "filosofica"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIPO_INFO[bin];
        const dentro = PREGUNTAS.filter((p) => ubicTipo[p.id] === bin);
        return (
          <div
            key={bin}
            className="tdp-bin"
            data-shake={shakeTipo === bin}
            onClick={() => selTipo && onMatch(selTipo, bin)}
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
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((p) => (
                  <span key={p.id} style={{ animation: "tdpPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {p.texto}
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

function BinsRamas({
  selRama,
  shakeRama,
  ubicRama,
  onMatch,
  dropProps,
}: {
  selRama: string | null;
  shakeRama: RamaFilosofica | null;
  ubicRama: Record<string, RamaFilosofica>;
  onMatch: (preguntaId: string, bin: RamaFilosofica) => void;
  dropProps: DropFactory;
}) {
  const bins: RamaFilosofica[] = ["ontologia", "epistemologia", "etica", "estetica", "politica"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = RAMA_INFO[bin];
        const dentro = PREGUNTAS_RAMA.filter((p) => ubicRama[p.id] === bin);
        return (
          <div
            key={bin}
            className="tdp-bin"
            data-shake={shakeRama === bin}
            onClick={() => selRama && onMatch(selRama, bin)}
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
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((p) => (
                  <span key={p.id} style={{ animation: "tdpPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {p.texto}
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

function RowsProfundizar({
  selPar,
  shakePar,
  empPar,
  onMatch,
  dropProps,
}: {
  selPar: string | null;
  shakePar: string | null;
  empPar: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES.map((g) => {
        const done = empPar[g.id];
        return (
          <div
            key={g.id}
            className="tdp-row"
            data-shake={shakePar === g.id}
            data-done={done}
            onClick={() => !done && selPar && onMatch(selPar, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="tdp-slot" data-armed={!done && !!selPar} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "tdpPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-mug-hot" />
                  {g.cotidiana}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> pregunta cotidiana
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: done ? "#fff" : T.text2, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-brain" style={{ fontSize: 12, color: T.text3 }} />
                {g.filosofica}
              </div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{g.pista}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (soporta V/F y opción múltiple)
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
        Cinco preguntas sobre los tipos de preguntas y las ramas de la filosofía. Elige la respuesta correcta y pulsa «Comprobar».
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
                    <button key={oi} className="tdp-q-op" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="tdp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="tdp-btn" onClick={reintentar}>
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
