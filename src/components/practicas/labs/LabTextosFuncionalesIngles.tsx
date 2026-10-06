"use client";
// Ancla en el plan de estudios: IN-V-P06-A1 (progresión IN-V-P06).

/**
 * Laboratorio — Correo que funciona: textos funcionales en inglés (IN-V-P06,
 * Inglés V).
 *
 * EXPERIMENTO CENTRAL — «Outbox»: el alumno tiene cuatro correos por mandar,
 * uno por destinatario FICTICIO (una coordinadora, Recursos Humanos de una
 * empresa, el presidente del comité escolar y un amigo). Cada correo arranca
 * como un borrador mal armado. El alumno cambia sus siete piezas (las marcas de
 * A9: Subject · Greeting · Opening · Body · Request · Closing · Sign-off) y ve
 * al instante cómo se mueven tres medidores: claridad, cortesía y registro,
 * completitud. Al pulsar «Send» el sobre viaja y el destinatario RESPONDE:
 *   · lo ignora (sin asunto, nadie lo abre),
 *   · se molesta («Hey!», una orden, «ASAP»…),
 *   · pide aclaraciones (pregunta justo lo que falta: qué, cuándo),
 *   · o concede lo que pides (los tres medidores en 80 o más).
 * Con Tomás, un amigo, lo formal NO suma: le suena frío y pregunta si estás
 * molesto. La retroalimentación explica por qué, en español, citando el inglés.
 *
 * Modos:
 *  1. «Outbox» — el simulador (arriba).
 *  2. «Write your own» — el alumno ESCRIBE su correo (actividad final de A5);
 *     el analizador busca las seis partes, contracciones y palabras informales
 *     y el destinatario responde igual que en la bandeja.
 *  3. «Complete the text» — los correos con huecos A2 y A6, verbatim.
 *  4. «Escribe el término» — las frases clave de A1, A4, A5 y A6.
 *  + Reto «True or False» verbatim de A4 (pestaña «Reto»); toda la teoría en
 *    «Teoría». DOM puro. Personas, escuela y empresa ficticias; los puntajes y
 *    los tiempos de respuesta son una simulación.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino, type ParTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard, type QuizEvaluable } from "./_reto-quiz";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { TEXTOS_FUNCIONALES_INGLES_FICHA } from "./textos-funcionales-ingles-ficha";
import { TEXTOS_FUNCIONALES_HUECOS_A2, TEXTOS_FUNCIONALES_HUECOS_A6 } from "./textos-funcionales-ingles-huecos";
import { LECTURA, AUTOEVALUACIONES, QUIZ_VF, GLOSARIO_A5, VIDEO, ORDEN_A9 } from "./textos-funcionales-ingles-data";
import {
  PIEZAS,
  PIEZA,
  MEDIDORES,
  MISIONES,
  MISION,
  UMBRAL_CONCEDE,
  UMBRAL_MOLESTA,
  CASTIGO_CONTRACCION,
  RUTA_FOTOS,
  VEREDICTO,
  ARRANQUES,
  evaluar,
  opcionDe,
  respuestaDe,
  explicacion,
  analizarCorreo,
  type Eleccion,
  type Medidor,
  type MisionId,
  type PiezaId,
  type Resultado,
  type AnalisisCorreo,
} from "./textos-funcionales-ingles-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-ingles-textos-funcionales-reto";

type Modo = "bandeja" | "escribir" | "texto" | "glosario";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "bandeja", label: "Outbox", icono: "fa-paper-plane" },
  { id: "escribir", label: "Write your own", icono: "fa-pen-nib" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
];

const TONO: Record<"ok" | "medio" | "mal", string> = { ok: OK, medio: AMBAR, mal: NO };
const CARA: Record<Resultado | "espera", { icono: string; color: string; etiqueta: string }> = {
  espera: { icono: "fa-envelope", color: "rgba(255,255,255,0.55)", etiqueta: "Esperando tu correo" },
  concede: { icono: "fa-face-smile-beam", color: OK, etiqueta: "Concede" },
  aclara: { icono: "fa-face-meh", color: AMBAR, etiqueta: "Pide aclaraciones" },
  molesta: { icono: "fa-face-angry", color: NO, etiqueta: "Molesto" },
  ignora: { icono: "fa-envelope-circle-check", color: "rgba(255,255,255,0.45)", etiqueta: "Sin abrir" },
};

/**
 * «Escribe el término»: frases clave del correo. La definición sale verbatim de
 * la progresión (vocabulario de cortesía de A1, retroalimentación de A4, pista
 * de A6, despedidas de A1); el ejemplo es la oración verbatim de A1/A5 con la
 * frase tapada, para que no regale la respuesta.
 */
const PARES: ParTermino[] = [
  { id: "writing", termino: "I am writing to", definicion: "The standard formal opening for stating the purpose of a letter or email. (A4)", ejemplo: "___ request your assistance with our project." },
  { id: "like", termino: "I would like to", definicion: "(Me gustaría...) — expresar un deseo o intención de forma educada (A1)", ejemplo: "___ schedule a meeting at your earliest convenience." },
  { id: "could", termino: "Could you please", definicion: "(¿Podría por favor...?) — hacer una solicitud formal (A1)", ejemplo: "___ send me information about the required entrance exam?" },
  { id: "appreciate", termino: "I would appreciate", definicion: "(Agradecería...) — expresar gratitud anticipada (A1)", ejemplo: "___ any advice about how to best prepare for the application process." },
  { id: "attached", termino: "Please find attached", definicion: "This is a standard phrase to mention an attached file in an email. (A6)", ejemplo: "___ my CV and a cover letter." },
  { id: "forward", termino: "I look forward to hearing from you", definicion: "(Quedo en espera de su respuesta.) — cierre estándar de correo formal (A1)", ejemplo: "Thank you very much for your time. ___." },
  { id: "faithfully", termino: "Yours faithfully", definicion: "Muy formal, para Dear Sir/Madam (A1, Sign-off)", ejemplo: "Dear Sir/Madam, (…) ___, Daniela Ramírez" },
];

/** El reto: el verdadero/falso de A4, verbatim, en la tarjeta de quiz común. */
const QUIZ: QuizEvaluable = {
  titulo: QUIZ_VF.ancla,
  puntajeMinimo: QUIZ_VF.puntajeMinimo,
  reactivos: QUIZ_VF.preguntas.map((p) => ({
    enunciado: p.enunciado,
    opciones: ["True", "False"],
    respuestaCorrecta: p.respuesta ? 0 : 1,
    retroalimentacion: p.retro,
  })),
};

/** Los seis pasos de la actividad final de A5, verbatim. */
const PASOS_A5 = [
  "(1) greeting ('Dear...')",
  "(2) purpose statement ('I am writing to...')",
  "(3) a polite request ('I would like to...' or 'I would appreciate it if...')",
  "(4) a reference to an attachment if appropriate ('Please find attached...')",
  "(5) closing phrase ('I look forward to hearing from you.')",
  "(6) formal sign-off ('Best regards, / Yours sincerely,')",
];

/** Respuestas de la destinataria del modo «Write your own» (ficticia). */
const ORTEGA = {
  para: "Dr. Elena Ortega",
  cargo: "Coordinadora de prácticas · Verdemar Labs (ficticio)",
  concede: "Dear student,\n\nThank you for your clear and polite email. I am happy to help: I have attached the information you requested.\n\nBest regards,\nDr. Elena Ortega",
  aclaraIntro: "Dear student,\n\nThank you for your email. Before I can help you, I need to know:",
  aclaraFin: "Best regards,\nDr. Elena Ortega",
  molesta: "Hello,\n\nPlease write to me in a more professional tone.\n\nE. Ortega",
};

function borradores(): Record<MisionId, Eleccion> {
  return Object.fromEntries(MISIONES.map((m) => [m.id, { ...m.borrador }])) as Record<MisionId, Eleccion>;
}

interface Envio {
  firma: string;
  resultado: Resultado;
  respuesta: string | null;
  porque: string;
  n: number;
}

interface Retro {
  pieza: PiezaId;
  titulo: string;
  texto: string;
  deltas: Record<Medidor, number>;
  color: string;
}

export function LabTextosFuncionalesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("bandeja");

  // ── sonido y partida ──────────────────────────────────────────────────
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
  // En la bandeja se EXPERIMENTA: mandar un correo malo es justo lo que se
  // pide para ver qué pasa, así que suena pero no gasta errores de la partida.
  const sfxEnsayo = (bien: boolean) => sonido && (bien ? audioRef.current?.blip() : audioRef.current?.incorrecto());

  // ── simulador: Outbox ─────────────────────────────────────────────────
  const [misionId, setMisionId] = useState<MisionId>("rivera");
  const [elecciones, setElecciones] = useState<Record<MisionId, Eleccion>>(borradores);
  const [abierta, setAbierta] = useState<PiezaId | null>(null);
  const [retro, setRetro] = useState<Retro | null>(null);
  const [envios, setEnvios] = useState<Partial<Record<MisionId, Envio>>>({});
  const [enviados, setEnviados] = useState(0);
  const [tocoPieza, setTocoPieza] = useState(false);
  const [concedidas, setConcedidas] = useState<MisionId[]>([]);

  const mision = MISION[misionId];
  const eleccion = elecciones[misionId];
  const ev = evaluar(mision, eleccion);
  const bandejaDone = concedidas.length >= 3;

  const elegirMision = (id: MisionId) => {
    setMisionId(id);
    setAbierta(null);
    setRetro(null);
  };

  const elegirOpcion = (pieza: PiezaId, opId: string) => {
    const nueva = { ...eleccion, [pieza]: opId };
    const nuevaEv = evaluar(mision, nueva);
    const op = opcionDe(mision, pieza, nueva);
    const pe = nuevaEv.piezas.find((p) => p.pieza === pieza)!;
    setElecciones((prev) => ({ ...prev, [misionId]: nueva }));
    setTocoPieza(true);
    setAbierta(null);
    const nota = pe.contracciones.length > 0 ? ` Contracción: ${pe.contracciones.map((c) => `«${c}»`).join(", ")} resta ${CASTIGO_CONTRACCION} de cortesía en un correo formal: escríbela completa.` : "";
    const tono = pe.calidad >= 0.99 ? "ok" : pe.calidad >= 0.4 && !op.falla ? "medio" : "mal";
    setRetro({
      pieza,
      titulo: op.texto ? `«${op.texto.split("\n")[0]}»` : `Sin ${PIEZA[pieza].es.toLowerCase()}`,
      texto: op.porque + nota,
      deltas: {
        cla: nuevaEv.medidores.cla - ev.medidores.cla,
        cor: nuevaEv.medidores.cor - ev.medidores.cor,
        com: nuevaEv.medidores.com - ev.medidores.com,
      },
      color: TONO[tono],
    });
    sfxEnsayo(tono === "ok");
  };

  const enviar = () => {
    const respuesta = respuestaDe(mision, ev);
    setEnvios((prev) => ({
      ...prev,
      [misionId]: { firma: JSON.stringify(eleccion), resultado: ev.resultado, respuesta, porque: explicacion(mision, ev), n: (prev[misionId]?.n ?? 0) + 1 },
    }));
    setEnviados((n) => n + 1);
    setAbierta(null);
    setRetro(null);
    if (ev.resultado === "concede") {
      partida.acierto();
      sfxOk();
      if (!concedidas.includes(misionId)) {
        const nuevas = [...concedidas, misionId];
        setConcedidas(nuevas);
        if (nuevas.length >= 3 && concedidas.length < 3) persistMejor(true, escrituraDone, textoDone, glosarioDone);
      }
    } else {
      sfxEnsayo(false);
    }
  };

  const volverBorrador = () => {
    setElecciones((prev) => ({ ...prev, [misionId]: { ...mision.borrador } }));
    setAbierta(null);
    setRetro(null);
  };

  const resetBandeja = () => {
    setElecciones(borradores());
    setEnvios({});
    setAbierta(null);
    setRetro(null);
  };

  // ── modo «Write your own» ─────────────────────────────────────────────
  const [asunto, setAsunto] = useState("");
  const [texto, setTexto] = useState("");
  const [escrituraDone, setEscrituraDone] = useState(false);
  const [enviadoPropio, setEnviadoPropio] = useState<string | null>(null);
  const analisis = analizarCorreo(asunto, texto);
  const revisar = (nuevoAsunto: string, nuevoTexto: string) => {
    const a = analizarCorreo(nuevoAsunto, nuevoTexto);
    if (a.completo && !escrituraDone) {
      setEscrituraDone(true);
      partida.acierto();
      sfxOk();
      persistMejor(bandejaDone, true, textoDone, glosarioDone);
    }
  };
  const cambiarTexto = (nuevo: string) => {
    setTexto(nuevo);
    revisar(asunto, nuevo);
  };
  const cambiarAsunto = (nuevo: string) => {
    setAsunto(nuevo);
    revisar(nuevo, texto);
  };
  const agregarFrase = (frase: string) => {
    const sep = texto === "" || /\s$/.test(texto) ? "" : frase.endsWith(",") ? "\n\n" : " ";
    cambiarTexto(`${texto}${sep}${frase}`);
  };
  const enviarPropio = () => {
    setEnviadoPropio(`${asunto}\u0000${texto}`);
    sfxEnsayo(analisis.resultado === "concede");
  };
  const resetEscritura = () => {
    setAsunto("");
    setTexto("");
    setEscrituraDone(false);
    setEnviadoPropio(null);
  };

  // ── modo «Complete the text» (A2 y A6) ────────────────────────────────
  const [texto2Done, setTexto2Done] = useState(false);
  const [texto6Done, setTexto6Done] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const textoDone = texto2Done && texto6Done;
  const resetTexto = () => {
    setTexto2Done(false);
    setTexto6Done(false);
    setTextoIntento((n) => n + 1);
  };

  // ── glosario ──────────────────────────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const modosHechos = (bandejaDone ? 1 : 0) + (escrituraDone ? 1 : 0) + (textoDone ? 1 : 0) + (glosarioDone ? 1 : 0);
  // Terminar los modos da las estrellas; la tercera completa pide precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  // Persiste la mejor marca al completar un modo (en el handler, no en un efecto).
  const persistMejor = (a: boolean, b: boolean, c: boolean, d: boolean) => {
    const n = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0) + (d ? 1 : 0);
    registraEstrellas(partida.estrellasCon(n, 4));
  };

  const objetivos = [
    { txt: "Envía un correo y lee cómo responde el destinatario", done: enviados > 0, modo: "bandeja" },
    { txt: "Cambia una pieza del correo y mira cómo se mueven los tres medidores", done: tocoPieza, modo: "bandeja" },
    { txt: "Consigue que un destinatario conceda lo que pides", done: concedidas.length >= 1, modo: "bandeja" },
    { txt: "Escríbele a Tomás en el registro correcto y consigue su «sí»", done: concedidas.includes("tomas"), modo: "bandeja" },
    { txt: "Consigue un «sí» en 3 de las 4 misiones de la bandeja", done: bandejaDone, modo: "bandeja" },
    { txt: "Escribe tu propio correo formal con los pasos de la actividad final (A5)", done: escrituraDone, modo: "escribir" },
    { txt: "Completa los dos correos con huecos (A2 y A6)", done: textoDone, modo: "texto" },
    { txt: "Escribe las 7 frases clave del correo", done: glosarioDone, modo: "glosario" },
    { txt: "Consigue 3★ (completa los modos)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el reto «True or False»", done: quizAprobado },
  ];

  const resetActual = modo === "bandeja" ? resetBandeja : modo === "escribir" ? resetEscritura : modo === "glosario" ? resetGlosario : resetTexto;

  const pasosOk = [0, 1, 2, 4, 5].filter((i) => analisis.pasos[i]).length;
  const lectura =
    modo === "bandeja" ? (
      <>
        Claridad {ev.medidores.cla} · Cortesía {ev.medidores.cor} · Completitud {ev.medidores.com}
      </>
    ) : modo === "escribir" ? (
      <>
        {analisis.oraciones} oraciones · {pasosOk}/5 pasos obligatorios
      </>
    ) : modo === "texto" ? (
      <>Completa los dos correos con huecos</>
    ) : (
      <>Escribe la frase clave de cada definición</>
    );

  const envio = envios[misionId];

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
        <div className="tf" style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {modo === "bandeja" && (
            <>
              {/* Bandeja: las cuatro misiones */}
              <div className="tf-bandeja" role="list" aria-label="Correos por enviar">
                {MISIONES.map((m) => {
                  const r = envios[m.id]?.resultado;
                  const cara = CARA[concedidas.includes(m.id) ? "concede" : r ?? "espera"];
                  return (
                    <button key={m.id} type="button" role="listitem" className="tf-mision" data-on={m.id === misionId} onClick={() => elegirMision(m.id)}>
                      <span className="tf-mision-foto">
                        <i className={`fa-solid ${m.icono}`} aria-hidden />
                        <ImgSim src={`${RUTA_FOTOS}/${m.foto}.webp`} />
                      </span>
                      <span className="tf-mision-txt">
                        <strong>{m.para}</strong>
                        <span>
                          {m.proposito} · {m.registro === "formal" ? "formal" : "informal"}
                        </span>
                      </span>
                      <i className={`fa-solid ${cara.icono} tf-mision-cara`} style={{ color: cara.color }} title={cara.etiqueta} aria-label={cara.etiqueta} />
                    </button>
                  );
                })}
              </div>

              {/* La situación */}
              <div className="tf-situacion">
                <span className="tf-sit-foto">
                  <i className={`fa-solid ${mision.icono}`} aria-hidden />
                  <ImgSim key={mision.foto} src={`${RUTA_FOTOS}/${mision.foto}.webp`} />
                </span>
                <div className="tf-sit-txt">
                  <span className="tf-ceja">
                    {mision.proposito} · registro {mision.registro}
                  </span>
                  <strong>
                    Para: {mision.para} <span>· {mision.cargo}</span>
                  </strong>
                  <p>{mision.situacion}</p>
                  <p className="tf-meta">
                    <i className="fa-solid fa-flag-checkered" aria-hidden /> Meta: {mision.meta}
                  </p>
                </div>
              </div>

              <Medidores valores={ev.medidores} formal={mision.registro === "formal"} />

              {/* El correo */}
              <div className="tf-sub">
                <i className="fa-solid fa-sliders" aria-hidden /> Toca una pieza del correo para cambiarla. Los medidores se mueven al instante.
              </div>
              <div className="tf-correo">
                <div className="tf-correo-cab">
                  <span>
                    <strong>To:</strong> {mision.para}
                  </span>
                  <span>
                    <strong>From:</strong> Daniela Ramírez
                  </span>
                </div>
                {PIEZAS.map((p) => {
                  const op = opcionDe(mision, p.id, eleccion);
                  const pe = ev.piezas.find((x) => x.pieza === p.id)!;
                  const col = op.falla ? NO : pe.calidad >= 0.99 ? OK : pe.calidad >= 0.4 ? AMBAR : NO;
                  return (
                    <div key={p.id} className="tf-linea" data-pieza={p.id}>
                      <span className="tf-marca" style={{ ["--mc" as string]: col }}>
                        <i className={`fa-solid ${p.icono}`} aria-hidden /> {p.marca}
                      </span>
                      <button type="button" className="tf-pieza" data-abierta={abierta === p.id} data-vacia={op.texto === ""} onClick={() => setAbierta((x) => (x === p.id ? null : p.id))} aria-label={`${p.marca}: ${op.texto || "vacío"}. Cambiar`}>
                        <span>{op.texto === "" ? `(sin ${p.es.toLowerCase()})` : op.texto}</span>
                        <i className="fa-solid fa-caret-down" aria-hidden />
                      </button>
                      {abierta === p.id && (
                        <div className="tf-opciones">
                          <span className="tf-opciones-tit">
                            {p.marca} · {p.es}: elige otra
                          </span>
                          <div className="tf-opciones-lista">
                            {mision.opciones[p.id].map((o) => (
                              <button key={o.id} type="button" className="tf-op" data-on={op.id === o.id} onClick={() => elegirOpcion(p.id, o.id)}>
                                {o.texto === "" ? `(sin ${p.es.toLowerCase()})` : o.texto}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {retro && retro.pieza === p.id && abierta !== p.id && (
                        <div className="tf-retro" style={{ ["--rc" as string]: retro.color }}>
                          <strong>{retro.titulo}</strong>
                          <span>{retro.texto}</span>
                          <span className="tf-deltas">
                            {MEDIDORES.map((m) => {
                              const d = retro.deltas[m.id];
                              return (
                                <span key={m.id} style={{ color: d > 0 ? OK : d < 0 ? NO : T.text3 }}>
                                  {m.nombre} {d > 0 ? `+${d}` : d}
                                </span>
                              );
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="tf-acciones">
                <button type="button" className="tf-btn tf-btn-pri" onClick={enviar}>
                  <i className="fa-solid fa-paper-plane" aria-hidden /> Send
                </button>
                <button type="button" className="tf-btn" onClick={volverBorrador}>
                  <i className="fa-solid fa-file-pen" aria-hidden /> Volver al borrador
                </button>
              </div>

              {envio && (
                <Respuesta
                  key={envio.n}
                  para={mision.para}
                  foto={mision.foto}
                  icono={mision.icono}
                  resultado={envio.resultado}
                  respuesta={envio.respuesta}
                  porque={envio.porque}
                  cambiado={envio.firma !== JSON.stringify(eleccion)}
                />
              )}
            </>
          )}

          {modo === "escribir" && (
            <EscribeTuCorreo
              asunto={asunto}
              texto={texto}
              analisis={analisis}
              hecho={escrituraDone}
              enviado={enviadoPropio}
              onAsunto={cambiarAsunto}
              onTexto={cambiarTexto}
              onFrase={agregarFrase}
              onEnviar={enviarPropio}
            />
          )}

          {/* MODO — completa el texto (fill_blanks A2 y A6, verbatim) */}
          {modo === "texto" && (
            <>
              <Instruccion icono="fa-envelope-open-text" texto={TEXTOS_FUNCIONALES_HUECOS_A2.ancla} hecho={texto2Done} />
              <CompletaTexto
                key={`a2-${textoIntento}`}
                data={TEXTOS_FUNCIONALES_HUECOS_A2}
                accent={accent}
                rgba={color.rgba}
                completado={texto2Done}
                onCompletado={() => {
                  setTexto2Done(true);
                  sfxOk();
                  if (texto6Done) persistMejor(bandejaDone, escrituraDone, true, glosarioDone);
                }}
                onAcierto={sfxPlace}
                onError={sfxNo}
              />
              <Instruccion icono="fa-briefcase" texto={TEXTOS_FUNCIONALES_HUECOS_A6.ancla} hecho={texto6Done} />
              <CompletaTexto
                key={`a6-${textoIntento}`}
                data={TEXTOS_FUNCIONALES_HUECOS_A6}
                accent={accent}
                rgba={color.rgba}
                completado={texto6Done}
                onCompletado={() => {
                  setTexto6Done(true);
                  sfxOk();
                  if (texto2Done) persistMejor(bandejaDone, escrituraDone, true, glosarioDone);
                }}
                onAcierto={sfxPlace}
                onError={sfxNo}
              />
            </>
          )}

          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y el ejemplo con la frase tapada, y escribe la frase clave del correo (en inglés)."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
                persistMejor(bandejaDone, escrituraDone, textoDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
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
                  <Dato label="Correos enviados" value={`${enviados}`} />
                  <Dato label="«Sí» conseguidos" value={`${concedidas.length}/4`} col={bandejaDone ? OK : undefined} />
                  <Dato label="Medidor más bajo" value={`${Math.min(ev.medidores.cla, ev.medidores.cor, ev.medidores.com)}`} col={Math.min(ev.medidores.cla, ev.medidores.cor, ev.medidores.com) >= UMBRAL_CONCEDE ? OK : undefined} />
                  <Dato label="Contracciones" value={`${ev.contracciones.length}`} col={ev.contracciones.length === 0 ? OK : NO} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Tus correos consiguen lo que piden!" : "Cada modo terminado suma; con los cuatro, la tercera estrella pide 2 errores o menos al escribir."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Cómo decide el destinatario" icono="fa-scale-balanced">
                <ul className="tf-reglas">
                  <li>
                    <strong>Sin asunto</strong> en un correo formal: nadie lo abre.
                  </li>
                  <li>
                    <strong>Una orden o un «Hey!»</strong> a quien no te conoce, o cortesía bajo {UMBRAL_MOLESTA}: se molesta.
                  </li>
                  <li>
                    <strong>Los tres medidores en {UMBRAL_CONCEDE} o más</strong>: concede lo que pides.
                  </li>
                  <li>
                    <strong>Lo demás</strong>: pide aclaraciones, justo sobre la pieza más floja.
                  </li>
                  <li>Cada contracción (I&apos;m, that&apos;s…) resta {CASTIGO_CONTRACCION} de cortesía en un correo formal; con un amigo, no.</li>
                </ul>
                <p style={{ margin: 0, fontSize: 14, color: T.text3 }}>Personas, escuela y empresa son ficticias; puntajes y tiempos de respuesta son una simulación.</p>
              </Bloque>
              <Bloque titulo="Tu correo, tal como sale" icono="fa-envelope">
                <pre className="tf-pre">
                  {[opcionDe(mision, "subject", eleccion).texto || "(sin asunto)", ...PIEZAS.slice(1).map((p) => opcionDe(mision, p.id, eleccion).texto).filter(Boolean)].join("\n\n")}
                </pre>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <div style={{ display: "grid", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 14, color: T.text2 }}>{QUIZ_VF.descripcion}</p>
              <RetoQuizCard
                quiz={QUIZ}
                accent={accent}
                rgba={color.rgba}
                aprobado={quizAprobado}
                onAprobado={() => setQuizAprobado(true)}
                playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxEnsayo(false)) : undefined}
                mensajeAprobado="¡Aprobado! Sabes cómo se escribe un correo formal en inglés."
              />
            </div>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: <Teoria accent={accent} rgba={color.rgba} />,
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas pequeñas
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Imagen con respaldo: si el archivo aún no existe se oculta y queda el degradado + ícono. */
function ImgSim({ src }: { src: string }) {
  const [rota, setRota] = useState(false);
  if (rota) return null;
  return <img src={src} alt="" loading="lazy" onError={() => setRota(true)} />;
}

function Instruccion({ icono, texto, hecho }: { icono: string; texto: string; hecho: boolean }) {
  return (
    <div className="tf-instr">
      <i className={`fa-solid ${hecho ? "fa-circle-check" : icono}`} style={{ color: hecho ? OK : undefined }} aria-hidden />
      <span>{texto}</span>
    </div>
  );
}

/** Los tres medidores, con la marca de «concede» (80). */
function Medidores({ valores, formal }: { valores: Record<Medidor, number>; formal: boolean }) {
  return (
    <div className="tf-medidores">
      {MEDIDORES.map((m) => {
        const v = valores[m.id];
        const col = v >= UMBRAL_CONCEDE ? OK : m.id === "cor" && formal && v < UMBRAL_MOLESTA ? NO : v >= 50 ? AMBAR : NO;
        return (
          <div key={m.id} className="tf-medidor">
            <span className="tf-medidor-nom">
              <i className={`fa-solid ${m.icono}`} aria-hidden /> {m.nombre}
            </span>
            <div className="tf-barra" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={m.nombre}>
              <div style={{ width: `${v}%`, background: col }} />
              <span className="tf-umbral" style={{ left: `${UMBRAL_CONCEDE}%` }} title={`Concede: ${UMBRAL_CONCEDE}`} />
            </div>
            <strong style={{ color: col }}>{v}</strong>
          </div>
        );
      })}
    </div>
  );
}

/** El viaje del sobre y la respuesta del destinatario: la consecuencia. */
function Respuesta({
  para,
  foto,
  icono,
  resultado,
  respuesta,
  porque,
  cambiado,
}: {
  para: string;
  foto: string;
  icono: string;
  resultado: Resultado;
  respuesta: string | null;
  porque: string;
  cambiado: boolean;
}) {
  const v = VEREDICTO[resultado];
  const cara = CARA[resultado];
  const col = TONO[v.tono];
  return (
    <div className="tf-envio" style={{ ["--rc" as string]: col }}>
      <div className="tf-trayecto" aria-hidden>
        <span className="tf-yo">
          <i className="fa-solid fa-user-pen" />
        </span>
        <span className="tf-via">
          <i className="fa-solid fa-envelope tf-sobre" data-resultado={resultado} />
        </span>
        <span className="tf-destino">
          <i className={`fa-solid ${icono}`} />
          <ImgSim src={`${RUTA_FOTOS}/${foto}.webp`} />
          <i className={`fa-solid ${cara.icono} tf-destino-cara`} style={{ color: cara.color }} />
        </span>
      </div>
      <div className="tf-veredicto">
        <i className={`fa-solid ${v.icono}`} style={{ color: col }} aria-hidden />
        <strong>{v.titulo}</strong>
        <span>· {v.tiempo} (simulación)</span>
      </div>
      {respuesta ? (
        <div className="tf-bubble">
          <span className="tf-bubble-de">
            <i className="fa-solid fa-reply" aria-hidden /> {para} respondió:
          </span>
          <pre className="tf-pre">{respuesta}</pre>
        </div>
      ) : (
        <div className="tf-bubble tf-bubble-vacia">
          <i className="fa-solid fa-hourglass-end" aria-hidden /> Tu correo sigue sin abrir en la bandeja de {para}.
        </div>
      )}
      <div className="tf-porque">
        <strong>¿Por qué?</strong> {porque}
      </div>
      {cambiado && (
        <div className="tf-aviso">
          <i className="fa-solid fa-rotate" aria-hidden /> Cambiaste el correo desde este envío: vuelve a pulsar «Send» para ver la nueva respuesta.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 · Write your own (escritura con analizador)
 * ═══════════════════════════════════════════════════════════════════════════ */

function respuestaPropia(a: AnalisisCorreo): string | null {
  if (a.resultado === "ignora") return null;
  if (a.resultado === "molesta") return ORTEGA.molesta;
  if (a.resultado === "concede") return ORTEGA.concede;
  const q: string[] = [];
  if (!a.proposito) q.push("What is the purpose of your email?");
  if (!a.peticion) q.push("What exactly would you like me to do?");
  else if (!a.fecha) q.push("By when do you need it?");
  if (a.oraciones < 5) q.push("Could you give me a few more details?");
  if (a.asunto !== "bien") q.push("Could you use a clearer subject line next time?");
  const lista = (q.length > 0 ? q : ["Could you tell me a little more?"]).slice(0, 3).map((x) => `• ${x}`);
  return `${ORTEGA.aclaraIntro}\n\n${lista.join("\n")}\n\n${ORTEGA.aclaraFin}`;
}

function porquePropio(a: AnalisisCorreo): string {
  if (a.resultado === "ignora") return "Sin asunto, el correo parece spam o se queda al fondo de la bandeja: nadie lo abre.";
  const fallas: string[] = [];
  if (a.contracciones.length > 0) fallas.push(`contracciones (${a.contracciones.join(", ")}): en formal se escriben completas`);
  if (a.informales.length > 0) fallas.push(`palabras informales (${a.informales.join(", ")})`);
  if (a.saludo !== "formal") fallas.push("falta un saludo formal: «Dear Dr. …,» o «Dear Sir/Madam,»");
  if (!a.proposito) fallas.push("falta el propósito: «I am writing to …»");
  if (!a.peticion) fallas.push("falta una petición cortés: «Could you please…», «I would like to…»");
  if (!a.despedida) fallas.push("falta la despedida en su propio renglón: «Best regards,» o «Yours sincerely,»");
  if (!a.cierre) fallas.push("falta el cierre: «I look forward to hearing from you.»");
  if (a.resultado === "concede") return "Asunto claro, saludo formal, propósito, petición cortés, cierre y despedida, sin contracciones: el correo hace fácil decir que sí.";
  return fallas.length > 0 ? `Revisa: ${fallas.join("; ")}.` : "Casi: agrega detalles concretos y una fecha para que los tres medidores lleguen a 80.";
}

function EscribeTuCorreo({
  asunto,
  texto,
  analisis,
  hecho,
  enviado,
  onAsunto,
  onTexto,
  onFrase,
  onEnviar,
}: {
  asunto: string;
  texto: string;
  analisis: AnalisisCorreo;
  hecho: boolean;
  enviado: string | null;
  onAsunto: (t: string) => void;
  onTexto: (t: string) => void;
  onFrase: (f: string) => void;
  onEnviar: () => void;
}) {
  const extras: { ok: boolean; txt: string; valor: string }[] = [
    { ok: analisis.asunto === "bien", txt: "Asunto breve y claro (2 a 10 palabras)", valor: analisis.asunto === "bien" ? "Sí" : analisis.asunto === "vacio" ? "Falta" : analisis.asunto === "largo" ? "Largo" : "Vago" },
    { ok: analisis.contracciones.length === 0, txt: "Sin contracciones (I am, do not…)", valor: `${analisis.contracciones.length}` },
    { ok: analisis.informales.length === 0, txt: "Sin palabras informales (hey, stuff, ASAP…)", valor: `${analisis.informales.length}` },
    { ok: analisis.oraciones >= 5, txt: "5 a 7 oraciones (A5)", valor: `${analisis.oraciones}` },
  ];
  const vigente = enviado === `${asunto}\u0000${texto}`;
  const cara = CARA[enviado !== null ? analisis.resultado : "espera"];
  return (
    <>
      <div className="tf-situacion">
        <span className="tf-sit-foto">
          <i className="fa-solid fa-flask-vial" aria-hidden />
          <ImgSim src={`${RUTA_FOTOS}/escritorio.webp`} />
        </span>
        <div className="tf-sit-txt">
          <span className="tf-ceja">{GLOSARIO_A5.ancla.split(" · ")[0]} · actividad final</span>
          <strong>
            Para: {ORTEGA.para} <span>· {ORTEGA.cargo}</span>
          </strong>
          <p>{GLOSARIO_A5.actividadFinal}</p>
        </div>
      </div>

      <Medidores valores={analisis.medidores} formal />

      <div className="tf-sub">
        <i className="fa-solid fa-hand-pointer" aria-hidden /> Toca una frase para agregarla y completa con tus datos:
      </div>
      <div className="tf-arranques">
        {ARRANQUES.map((f) => (
          <button key={f} type="button" className="tf-chip" onClick={() => onFrase(f)}>
            <i className="fa-solid fa-plus" aria-hidden /> {f}
          </button>
        ))}
      </div>

      <label className="tf-area">
        <span>Subject</span>
        <input type="text" value={asunto} onChange={(e) => onAsunto(e.target.value)} placeholder="Request for Information: Internship Opportunities" spellCheck />
      </label>
      <label className="tf-area">
        <span>Tu correo (inglés)</span>
        <textarea value={texto} onChange={(e) => onTexto(e.target.value)} rows={9} placeholder={"Dear Dr. Ortega,\n\nI am writing to…"} spellCheck />
      </label>

      <div className="tf-panel">
        <div className="tf-panel-tit">
          <i className="fa-solid fa-list-check" aria-hidden /> Los pasos de la actividad final (A5)
        </div>
        <ul className="tf-criterios">
          {PASOS_A5.map((p, i) => {
            const ok = analisis.pasos[i]!;
            const opcional = i === 3;
            return (
              <li key={p} data-ok={ok}>
                <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle"}`} aria-hidden />
                <span>{p}</span>
                <strong>{ok ? "✓" : opcional ? "opcional" : "falta"}</strong>
              </li>
            );
          })}
          {extras.map((c) => (
            <li key={c.txt} data-ok={c.ok}>
              <i className={`fa-solid ${c.ok ? "fa-circle-check" : "fa-circle"}`} aria-hidden />
              <span>{c.txt}</span>
              <strong>{c.valor}</strong>
            </li>
          ))}
        </ul>
        {analisis.contracciones.length > 0 && (
          <p className="tf-nota">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden /> Contracciones: {analisis.contracciones.map((c) => `«${c}»`).join(", ")}. En un correo formal se escriben completas (A1).
          </p>
        )}
        {hecho && (
          <div className="tf-retro" style={{ ["--rc" as string]: OK }}>
            <strong>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 8, color: OK }} aria-hidden />
              ¡Tu correo cumple la actividad final!
            </strong>
            <span>Saludo formal, propósito, petición cortés, cierre y despedida, sin contracciones.</span>
          </div>
        )}
      </div>

      <div className="tf-acciones">
        <button type="button" className="tf-btn tf-btn-pri" onClick={onEnviar}>
          <i className="fa-solid fa-paper-plane" aria-hidden /> Send
        </button>
        <span className="tf-cara-mini" style={{ color: cara.color }}>
          <i className={`fa-solid ${cara.icono}`} aria-hidden /> {ORTEGA.para}: {cara.etiqueta}
        </span>
      </div>

      {enviado !== null && (
        <Respuesta
          key={enviado}
          para={ORTEGA.para}
          foto="escritorio"
          icono="fa-flask-vial"
          resultado={analisis.resultado}
          respuesta={respuestaPropia(analisis)}
          porque={porquePropio(analisis)}
          cambiado={!vigente}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Teoría (todo el texto curricular, verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */

function P({ children, fuerte }: { children: ReactNode; fuerte?: boolean }) {
  return <p style={{ margin: 0, color: fuerte ? T.text : T.text2, lineHeight: 1.6, fontWeight: fuerte ? 700 : 400, whiteSpace: "pre-line" }}>{children}</p>;
}

function Teoria({ accent, rgba }: { accent: string; rgba: string }) {
  return (
    <>
      <Bloque titulo={`${LECTURA.ancla} · ${LECTURA.titulo}`} icono="fa-book-open">
        <P>{LECTURA.intro}</P>
        <P fuerte>{LECTURA.estructuraTitulo}</P>
        {LECTURA.estructura.map((e) => (
          <div key={e.titulo} style={{ display: "grid", gap: 2 }}>
            <P fuerte>{e.titulo}</P>
            {e.detalle && <P>{e.detalle}</P>}
          </div>
        ))}
        <P fuerte>{LECTURA.registroTitulo}</P>
        <div className="tf-tabla" role="table">
          <div role="row" className="tf-tabla-cab">
            {LECTURA.registroCabecera.map((c) => (
              <span key={c} role="columnheader">
                {c}
              </span>
            ))}
          </div>
          {LECTURA.registro.map((fila) => (
            <div key={fila.join("|")} role="row">
              {fila.map((c) => (
                <span key={c} role="cell">
                  {c}
                </span>
              ))}
            </div>
          ))}
        </div>
        <P fuerte>{LECTURA.ejemplo1Titulo}</P>
        <pre className="tf-pre">{LECTURA.ejemplo1}</pre>
        <P fuerte>{LECTURA.ejemplo2Titulo}</P>
        <pre className="tf-pre">{LECTURA.ejemplo2}</pre>
        <P fuerte>{LECTURA.vocabularioTitulo}</P>
        <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
          {LECTURA.vocabulario.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid rgba(${rgba},0.4)`, background: `rgba(${rgba},0.1)`, color: T.text, fontSize: 15 }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} aria-hidden />
          {LECTURA.callout}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: T.text3 }}>Fuente: {LECTURA.fuente}</p>
      </Bloque>

      <Bloque titulo="Preguntas de comprensión" icono="fa-circle-question">
        {LECTURA.preguntas.map((q) => (
          <details key={q.pregunta} className="tf-det">
            <summary>{q.pregunta}</summary>
            <P>{q.respuesta}</P>
          </details>
        ))}
      </Bloque>

      <Bloque titulo={ORDEN_A9.ancla} icono="fa-arrow-down-1-9">
        <P>{ORDEN_A9.instrucciones}</P>
        {ORDEN_A9.pasos.map((p, i) => (
          <div key={p.marca} style={{ display: "grid", gap: 2 }}>
            <P fuerte>
              {i + 1}. {p.marca}
            </P>
            <p style={{ margin: 0, color: accent, fontStyle: "italic", lineHeight: 1.5, whiteSpace: "pre-line" }}>{p.texto}</p>
            <P>{p.explicacion}</P>
          </div>
        ))}
      </Bloque>

      <Bloque titulo={GLOSARIO_A5.ancla} icono="fa-spell-check">
        <P>{GLOSARIO_A5.descripcion}</P>
        {GLOSARIO_A5.terminos.map((g) => (
          <div key={g.termino} style={{ display: "grid", gap: 2 }}>
            <P fuerte>
              {g.termino} <span style={{ color: T.text3, fontWeight: 600 }}>· {g.etiquetas.join(", ")}</span>
            </P>
            <P>{g.definicion}</P>
            <p style={{ margin: 0, color: accent, fontStyle: "italic", lineHeight: 1.5 }}>{g.ejemplo}</p>
          </div>
        ))}
        <P>
          <strong style={{ color: T.text }}>Actividad final: </strong>
          {GLOSARIO_A5.actividadFinal}
        </P>
      </Bloque>

      {AUTOEVALUACIONES.map((a) => (
        <Bloque key={a.ancla} titulo={a.ancla} icono="fa-clipboard-check">
          {"instrucciones" in a && a.instrucciones && <P>{a.instrucciones}</P>}
          <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
            {a.criterios.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <P>{a.escala.map((e) => `${e.valor} · ${e.etiqueta}: ${e.descripcion}`).join("\n")}</P>
          <P fuerte>{a.reflexion}</P>
        </Bloque>
      ))}

      <Bloque titulo={VIDEO.ancla} icono="fa-circle-play">
        <P>{VIDEO.descripcion}</P>
        <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
          {VIDEO.preguntas.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Ficha teórica" icono="fa-book">
        <FichaTeorica data={TEXTOS_FUNCIONALES_INGLES_FICHA} accent={accent} rgba={rgba} defaultOpen />
      </Bloque>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Estilos
 * ═══════════════════════════════════════════════════════════════════════════ */

const css = (accent: string, rgba: string) => `
  @keyframes tfIn { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
  @keyframes tfVuela { 0%{left:0%; opacity:0; transform:translate(-50%,-50%) rotate(-8deg);} 15%{opacity:1;}
    85%{opacity:1;} 100%{left:100%; opacity:0; transform:translate(-50%,-50%) rotate(8deg);} }
  @keyframes tfRebota { 0%,100%{transform:scale(1);} 50%{transform:scale(1.18);} }

  .tf-bandeja { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:8px; }
  .tf-mision { cursor:pointer; display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:14px; text-align:left;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; min-width:0; transition:border-color .15s, background .15s; }
  .tf-mision:hover { border-color:${T.lineStrong}; }
  .tf-mision[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); }
  .tf-mision-foto { position:relative; width:44px; height:44px; flex-shrink:0; border-radius:50%; overflow:hidden;
    background:linear-gradient(135deg, rgba(${rgba},0.45), rgba(8,18,36,0.95)); display:flex; align-items:center; justify-content:center; }
  .tf-mision-foto > i { font-size:18px; color:rgba(255,255,255,0.6); }
  .tf-mision-foto img, .tf-sit-foto img, .tf-destino img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tf-mision-txt { display:flex; flex-direction:column; min-width:0; flex:1; line-height:1.25; }
  .tf-mision-txt strong { font-size:15px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .tf-mision-txt span { font-size:14px; color:${T.text3}; }
  .tf-mision-cara { font-size:20px; flex-shrink:0; }

  .tf-situacion { display:grid; grid-template-columns:minmax(0, 150px) minmax(0,1fr); gap:14px; padding:12px; border-radius:16px;
    border:1px solid ${T.line}; background:${T.glass}; animation:tfIn .25s ease; }
  .tf-sit-foto { position:relative; border-radius:12px; overflow:hidden; min-height:130px;
    background:linear-gradient(160deg, rgba(${rgba},0.4), rgba(8,18,36,0.95)); display:flex; align-items:center; justify-content:center; }
  .tf-sit-foto > i { font-size:42px; color:rgba(255,255,255,0.3); }
  .tf-sit-txt { display:grid; gap:6px; align-content:start; min-width:0; }
  .tf-sit-txt strong { font-size:16px; color:#fff; }
  .tf-sit-txt strong span { font-weight:600; color:${T.text3}; font-size:14px; }
  .tf-sit-txt p { margin:0; font-size:15px; color:${T.text2}; line-height:1.5; }
  .tf-ceja { font-size:13px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; color:${accent}; }
  .tf-meta { color:${T.text} !important; font-weight:700; }
  .tf-meta i { color:${accent}; margin-right:4px; }
  @container lsescena (max-width: 520px) {
    .tf-situacion { grid-template-columns:1fr; }
    .tf-sit-foto { min-height:150px; }
  }

  .tf-medidores { display:grid; gap:8px; padding:12px 14px; border-radius:14px; border:1px solid ${T.line}; background:${T.inset}; }
  .tf-medidor { display:grid; grid-template-columns:minmax(0, 170px) minmax(0,1fr) 40px; gap:10px; align-items:center; }
  .tf-medidor-nom { font-size:14px; font-weight:800; color:${T.text2}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .tf-medidor-nom i { color:${accent}; margin-right:4px; }
  .tf-medidor strong { font-size:17px; font-family:ui-monospace, monospace; text-align:right; }
  .tf-barra { position:relative; height:14px; border-radius:8px; background:rgba(255,255,255,0.08); border:1px solid ${T.line}; }
  .tf-barra > div { height:100%; border-radius:8px; transition:width .4s ease, background .4s; }
  .tf-umbral { position:absolute; top:-4px; bottom:-4px; width:3px; border-radius:2px; background:${OK}; transform:translateX(-50%); }
  @container lsescena (max-width: 460px) {
    .tf-medidor { grid-template-columns:minmax(0,1fr) 40px; }
    .tf-medidor .tf-barra { grid-column:1 / -1; grid-row:2; }
  }

  .tf-sub { font-size:15px; font-weight:800; color:${T.text}; }
  .tf-sub i { color:${accent}; margin-right:6px; }

  .tf-correo { display:grid; gap:10px; padding:14px; border-radius:16px; border:1.5px solid ${T.lineStrong};
    background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025)); }
  .tf-correo-cab { display:flex; flex-wrap:wrap; gap:4px 18px; padding-bottom:8px; border-bottom:1px solid ${T.line}; font-size:14px; color:${T.text2}; }
  .tf-correo-cab strong { color:${T.text}; }
  .tf-linea { display:grid; gap:6px; min-width:0; }
  .tf-marca { justify-self:start; display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:900; letter-spacing:.06em;
    text-transform:uppercase; color:var(--mc); padding:2px 9px; border-radius:999px; border:1px solid var(--mc); }
  .tf-pieza { cursor:pointer; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; width:100%; text-align:left;
    padding:9px 12px; border-radius:10px; border:1.5px dashed ${accent}; background:rgba(${rgba},0.1); color:#fff;
    font-size:16px; line-height:1.45; font-weight:600; white-space:pre-line; }
  .tf-pieza i { color:${accent}; margin-top:4px; font-size:14px; }
  .tf-pieza[data-abierta="true"] { border-style:solid; background:rgba(${rgba},0.24); }
  .tf-pieza[data-vacia="true"] span { color:${T.text3}; font-style:italic; }
  .tf-opciones { display:grid; gap:8px; padding:10px; border-radius:12px; background:${T.inset}; border:1px solid ${T.line}; animation:tfIn .2s ease; }
  .tf-opciones-tit { font-size:14px; font-weight:800; color:${T.text3}; }
  .tf-opciones-lista { display:grid; gap:8px; }
  .tf-op { cursor:pointer; text-align:left; padding:10px 12px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; font-size:15px; font-weight:600; line-height:1.4; white-space:pre-line; transition:border-color .14s; }
  .tf-op:hover { border-color:${accent}; }
  .tf-op[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); }

  .tf-retro { display:grid; gap:4px; padding:10px 12px; border-radius:12px; border:1.5px solid var(--rc); background:${T.glass};
    font-size:15px; line-height:1.5; color:${T.text2}; animation:tfIn .3s ease; }
  .tf-retro strong { color:#fff; }
  .tf-deltas { display:flex; flex-wrap:wrap; gap:4px 14px; font-size:14px; font-weight:800; font-family:ui-monospace, monospace; }

  .tf-acciones { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  .tf-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 18px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:15px; font-weight:800; transition:all .14s; }
  .tf-btn:hover { border-color:${T.lineStrong}; }
  .tf-btn-pri { background:${accent}; color:#04121f; border-color:${accent}; }
  .tf-btn:focus-visible, .tf-pieza:focus-visible, .tf-op:focus-visible, .tf-chip:focus-visible, .tf-mision:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  .tf-cara-mini { font-size:14px; font-weight:800; }

  .tf-envio { display:grid; gap:10px; padding:14px; border-radius:16px; border:1.5px solid var(--rc); background:${T.glass}; }
  .tf-trayecto { display:grid; grid-template-columns:52px minmax(0,1fr) 64px; align-items:center; gap:8px; }
  .tf-yo { width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px;
    background:rgba(${rgba},0.25); color:#fff; }
  .tf-via { position:relative; height:30px; border-bottom:2px dashed ${T.lineStrong}; }
  .tf-sobre { position:absolute; top:50%; left:100%; font-size:24px; color:${accent}; animation:tfVuela .9s ease-in-out 1 both; }
  .tf-destino { position:relative; width:64px; height:64px; border-radius:50%; overflow:visible; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(${rgba},0.45), rgba(8,18,36,0.95)); border:2.5px solid var(--rc); }
  .tf-destino > i:first-child { font-size:22px; color:rgba(255,255,255,0.5); }
  .tf-destino img { border-radius:50%; }
  .tf-destino-cara { position:absolute; right:-8px; bottom:-6px; font-size:24px; background:#0b1626; border-radius:50%; padding:2px;
    animation:tfRebota .5s ease .9s 1 both; }
  .tf-veredicto { display:flex; flex-wrap:wrap; align-items:center; gap:6px 8px; font-size:16px; animation:tfIn .3s ease .7s both; }
  .tf-veredicto strong { color:#fff; }
  .tf-veredicto span { font-size:14px; color:${T.text3}; }
  .tf-bubble { padding:12px 14px; border-radius:14px 14px 14px 4px; background:rgba(255,255,255,0.93); color:#10202f; animation:tfIn .35s ease .9s both; }
  .tf-bubble-de { display:block; font-size:14px; font-weight:800; color:#2a4258; margin-bottom:6px; }
  .tf-bubble .tf-pre { color:#10202f; }
  .tf-bubble-vacia { background:${T.inset}; color:${T.text2}; font-size:15px; border:1px dashed ${T.lineStrong}; }
  .tf-porque { font-size:15px; color:${T.text2}; line-height:1.5; animation:tfIn .3s ease 1s both; }
  .tf-porque strong { color:var(--rc); }
  .tf-aviso { font-size:14px; color:${AMBAR}; line-height:1.45; }
  .tf-pre { margin:0; font-family:inherit; font-size:15px; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; color:${T.text2}; }

  .tf-instr { display:flex; align-items:center; gap:9px; font-size:15px; font-weight:800; color:${T.text}; }
  .tf-instr i { color:${accent}; }

  .tf-arranques { display:flex; flex-wrap:wrap; gap:8px; }
  .tf-chip { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:9px 13px; border-radius:999px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:border-color .14s; }
  .tf-chip:hover { border-color:${accent}; }
  .tf-chip i { color:${accent}; font-size:14px; }
  .tf-area { display:grid; gap:6px; font-size:14px; font-weight:800; color:${T.text2}; }
  .tf-area textarea, .tf-area input { width:100%; box-sizing:border-box; padding:12px 14px; border-radius:12px; border:1.5px solid ${T.lineStrong};
    background:${T.inset}; color:#fff; font-size:16px; line-height:1.55; font-family:inherit; }
  .tf-area textarea { resize:vertical; min-height:180px; }
  .tf-area textarea:focus, .tf-area input:focus { outline:none; border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.25); }
  .tf-panel { display:grid; gap:10px; padding:14px; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; min-width:0; }
  .tf-panel-tit { font-size:14px; font-weight:900; color:${T.text}; letter-spacing:.03em; }
  .tf-panel-tit i { color:${accent}; margin-right:6px; }
  .tf-criterios { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  .tf-criterios li { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:9px; align-items:start; font-size:14px; color:${T.text2}; line-height:1.45; }
  .tf-criterios li i { margin-top:3px; color:${T.text3}; }
  .tf-criterios li[data-ok="true"] i, .tf-criterios li[data-ok="true"] strong { color:${OK}; }
  .tf-criterios li strong { font-family:ui-monospace, monospace; color:${T.text}; }
  .tf-nota { margin:0; font-size:14px; color:#ffd0d0; line-height:1.45; }
  .tf-nota i { color:${NO}; margin-right:4px; }

  .tf-reglas { margin:0; padding-left:20px; display:grid; gap:6px; color:${T.text2}; font-size:15px; line-height:1.5; }
  .tf-reglas strong { color:${T.text}; }
  .tf-tabla { display:grid; gap:2px; border-radius:10px; overflow:hidden; border:1px solid ${T.line}; }
  .tf-tabla > div { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); }
  .tf-tabla span { padding:7px 10px; font-size:14px; color:${T.text2}; background:${T.glass}; overflow-wrap:anywhere; }
  .tf-tabla-cab span { font-weight:900; color:${T.text}; background:rgba(${rgba},0.18); }
  .tf-det { border:1px solid ${T.line}; border-radius:10px; padding:8px 12px; background:${T.glass}; }
  .tf-det summary { cursor:pointer; font-size:15px; font-weight:700; color:${T.text}; line-height:1.45; }
  .tf-det[open] summary { margin-bottom:6px; }

  @media (prefers-reduced-motion: reduce) {
    .tf-sobre, .tf-destino-cara, .tf-veredicto, .tf-bubble, .tf-porque, .tf-retro, .tf-opciones, .tf-situacion { animation:none; }
    .tf-sobre { display:none; }
    .tf-barra > div { transition:none; }
  }
`;
