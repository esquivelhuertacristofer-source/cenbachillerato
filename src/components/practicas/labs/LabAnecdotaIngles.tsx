"use client";
// Ancla en el plan de estudios: IN-IV-P07-A1 (progresión IN-IV-P07).

/**
 * Laboratorio — Open mic night: cuenta una anécdota (IN-IV-P07, Inglés IV).
 *
 * EXPERIMENTO CENTRAL — «Open mic»: Leo (personaje FICTICIO) va a contar en el
 * micrófono abierto de un café lo que le pasó en la terminal de Villa Encino.
 * Su borrador está mal armado. El alumno lo edita como un director: toca el
 * conector o el verbo de cada parte y elige otra forma, o sube y baja partes.
 * Cada cambio se nota al instante:
 *   · el medidor de atención del público sube o se desploma;
 *   · las ocho caras del público pasan de encantadas a sacar el celular;
 *   · la curva de atención se vuelve a trazar parte por parte;
 *   · la línea de tiempo enfrenta el ORDEN REAL de los hechos con el ORDEN
 *     NARRADO (líneas cruzadas = el público se pierde).
 * Con «Cuéntala al público» Leo narra parte por parte y el público murmura
 * («Wait, what?», «Ooh… and then what?») con la explicación del porqué.
 * La estructura es la de la progresión: opener → setting (when/where/who) →
 * complication → climax → resolution → reaction, con past continuous de fondo
 * y past simple para los hechos (lectura A1, glosario A5, reto A4).
 *
 * Modos:
 *  1. «Open mic» — el simulador (arriba).
 *  2. «Tell your own» — el alumno ESCRIBE su anécdota (A3); el analizador marca
 *     en color past continuous, past simple y conectores, revisa los 4
 *     criterios verbatim de A3 y el mismo público reacciona a su texto.
 *  3. «Complete the text» — los dos textos con huecos A2 y A6, verbatim.
 *  4. «Escribe el término» — los pares de A9 (glosario A5).
 *  + Reto «True or False» verbatim de A4 (pestaña «Reto»); toda la teoría en
 *    «Teoría». DOM puro. Personas y lugares ficticios; la atención es simulación.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { ANECDOTA_INGLES_FICHA } from "./anecdota-ingles-ficha";
import { ANECDOTA_INGLES_HUECOS_A2, ANECDOTA_INGLES_HUECOS_A6 } from "./anecdota-ingles-huecos";
import { LECTURA, ESCRITURA, QUIZ_VF, GLOSARIO_A5, AUTOEVALUACION, VIDEO, PARES_A9 } from "./anecdota-ingles-data";
import {
  BEATS,
  BEAT,
  RUTA_FOTOS,
  ORDEN_BORRADOR,
  ELECCION_BORRADOR,
  UMBRAL_OVACION,
  PUBLICO,
  CARA_INFO,
  ARRANQUES,
  claveSlot,
  opcionElegida,
  oracionDe,
  evaluar,
  veredictoDe,
  caraDe,
  murmulloDe,
  marcar,
  analizarTexto,
  type BeatId,
  type BeatSim,
  type Calidad,
  type Eleccion,
} from "./anecdota-ingles-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-ingles-anecdota-reto";

type Modo = "escenario" | "escribir" | "texto" | "glosario";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "escenario", label: "Open mic", icono: "fa-microphone" },
  { id: "escribir", label: "Tell your own", icono: "fa-pen-nib" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
];

const COLOR_CALIDAD: Record<Calidad, string> = { 2: OK, 1: AMBAR, 0: NO };

interface Retro {
  beat: BeatId;
  titulo: string;
  texto: string;
  delta: number;
  color: string;
}

export function LabAnecdotaIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("escenario");

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
  // En el escenario se EXPERIMENTA: probar una forma mala es justo lo que se
  // pide, así que suena pero no gasta errores de la partida.
  const sfxEnsayo = (bien: boolean) => sonido && (bien ? audioRef.current?.blip() : audioRef.current?.incorrecto());

  // ── simulador: Open mic ───────────────────────────────────────────────
  const [orden, setOrden] = useState<BeatId[]>(ORDEN_BORRADOR);
  const [eleccion, setEleccion] = useState<Eleccion>(ELECCION_BORRADOR);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [retro, setRetro] = useState<Retro | null>(null);
  const [tocoHueco, setTocoHueco] = useState(false);
  const [movioParte, setMovioParte] = useState(false);
  const [paso, setPaso] = useState<number | null>(null);
  const [funciones, setFunciones] = useState(0);
  const [ultimaFuncion, setUltimaFuncion] = useState<number | null>(null);
  const [mejorFuncion, setMejorFuncion] = useState(0);

  const ev = evaluar(orden, eleccion);
  const veredicto = veredictoDe(ev.final);
  const ovacion = mejorFuncion >= UMBRAL_OVACION;
  const actuando = paso !== null;

  const elegirOpcion = (beat: BeatSim, slotId: string, opId: string) => {
    if (actuando) return;
    const slot = beat.slots.find((s) => s.id === slotId)!;
    const op = slot.opciones.find((o) => o.id === opId)!;
    const nueva = { ...eleccion, [claveSlot(beat.id, slotId)]: opId };
    const nuevaEv = evaluar(orden, nueva);
    setEleccion(nueva);
    setTocoHueco(true);
    setRetro({
      beat: beat.id,
      titulo: `«${op.texto}»`,
      texto: op.porque,
      delta: nuevaEv.final - ev.final,
      color: COLOR_CALIDAD[op.calidad],
    });
    sfxEnsayo(op.calidad === 2);
  };

  const moverParte = (id: BeatId, dir: -1 | 1) => {
    if (actuando) return;
    const i = orden.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= orden.length) return;
    const nuevo = orden.slice();
    [nuevo[i], nuevo[j]] = [nuevo[j]!, nuevo[i]!];
    const nuevaEv = evaluar(nuevo, eleccion);
    const pasoMovido = nuevaEv.pasos.find((p) => p.beat === id)!;
    setOrden(nuevo);
    setMovioParte(true);
    setAbierto(null);
    const delta = nuevaEv.final - ev.final;
    if (pasoMovido.adelantado) {
      setRetro({
        beat: id,
        titulo: `Contaste «${BEAT[id].nombre}» antes que «${BEAT[pasoMovido.adelantado.antesDe].nombre}»`,
        texto: `Por eso el público se pierde: ${pasoMovido.adelantado.porque}`,
        delta,
        color: NO,
      });
      sfxEnsayo(false);
    } else if (nuevaEv.enOrden) {
      setRetro({
        beat: id,
        titulo: "Las partes ya siguen el orden real de los hechos",
        texto: "Apertura → escena → complicación → clímax → resolución → reacción. Con el orden claro el público sigue la historia sin esfuerzo (+5 de atención al final).",
        delta,
        color: OK,
      });
      sfxEnsayo(true);
    } else {
      setRetro({
        beat: id,
        titulo: `«${BEAT[id].nombre}» quedó en un buen lugar`,
        texto: "Esta parte ya no se adelanta a nada, pero otra sigue fuera de orden: mira las líneas rojas de la línea de tiempo.",
        delta,
        color: AMBAR,
      });
      sfxEnsayo(true);
    }
  };

  const contar = () => {
    setAbierto(null);
    setRetro(null);
    setPaso(0);
  };
  const terminarFuncion = () => {
    setPaso(null);
    setFunciones((n) => n + 1);
    setUltimaFuncion(ev.final);
    const mejor = Math.max(mejorFuncion, ev.final);
    setMejorFuncion(mejor);
    if (ev.final >= UMBRAL_OVACION) {
      partida.acierto();
      sfxOk();
      if (mejorFuncion < UMBRAL_OVACION) persistMejor(true, escrituraDone, textoDone, glosarioDone);
    } else {
      sfxEnsayo(false);
    }
  };
  const siguienteParte = () => {
    if (paso === null) return;
    if (paso < orden.length - 1) setPaso(paso + 1);
    else terminarFuncion();
  };
  const resetEscenario = () => {
    setOrden(ORDEN_BORRADOR);
    setEleccion(ELECCION_BORRADOR);
    setAbierto(null);
    setRetro(null);
    setPaso(null);
    setUltimaFuncion(null);
  };

  // ── modo «Tell your own» ──────────────────────────────────────────────
  const [texto, setTexto] = useState("");
  const [escrituraDone, setEscrituraDone] = useState(false);
  const analisis = analizarTexto(texto);
  const cambiarTexto = (nuevo: string) => {
    setTexto(nuevo);
    const a = analizarTexto(nuevo);
    if (a.completo && !escrituraDone) {
      setEscrituraDone(true);
      partida.acierto();
      sfxOk();
      persistMejor(ovacion, true, textoDone, glosarioDone);
    }
  };
  const agregarFrase = (frase: string) => {
    const sep = texto === "" || /\s$/.test(texto) ? "" : " ";
    cambiarTexto(`${texto}${sep}${frase}`);
  };
  const resetEscritura = () => {
    setTexto("");
    setEscrituraDone(false);
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
  const modosHechos = (ovacion ? 1 : 0) + (escrituraDone ? 1 : 0) + (textoDone ? 1 : 0) + (glosarioDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  // Persiste la mejor marca al completar un modo (en el handler, no en un efecto).
  const persistMejor = (a: boolean, b: boolean, c: boolean, d: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0) + (d ? 1 : 0);
    registraEstrellas(Math.min(3, est));
  };

  const objetivos = [
    { txt: "Cambia un conector o un tiempo verbal y mira cómo reacciona el público", done: tocoHueco, modo: "escenario" },
    { txt: "Mueve una parte de la historia y compara el orden narrado con el real", done: movioParte, modo: "escenario" },
    { txt: "Cuenta la anécdota completa en el micrófono abierto", done: funciones > 0, modo: "escenario" },
    { txt: "Logra la ovación de pie: atención del 90 % o más al terminar", done: ovacion, modo: "escenario" },
    { txt: "Escribe tu anécdota y cumple los 4 criterios (80 palabras o más)", done: escrituraDone, modo: "escribir" },
    { txt: "Completa los dos textos de la anécdota", done: textoDone, modo: "texto" },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone, modo: "glosario" },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el reto «True or False»", done: quizAprobado },
  ];

  const resetActual = modo === "escenario" ? resetEscenario : modo === "escribir" ? resetEscritura : modo === "glosario" ? resetGlosario : resetTexto;

  const criteriosOk = analisis.criterios.filter(Boolean).length;
  const lectura =
    modo === "escenario" ? (
      paso !== null ? (
        <>Leo cuenta la parte {paso + 1} de {orden.length} · atención {ev.curva[paso + 1]}%</>
      ) : (
        <>Atención del público: {ev.final}% · {veredicto.titulo}</>
      )
    ) : modo === "escribir" ? (
      <>{analisis.palabras} palabras · {criteriosOk}/4 criterios</>
    ) : modo === "texto" ? (
      <>Completa las dos anécdotas con huecos</>
    ) : (
      <>Escribe el término de cada definición</>
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
        <div className="an" style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {modo === "escenario" && (
            <OpenMic
              accent={accent}
              orden={orden}
              eleccion={eleccion}
              ev={ev}
              paso={paso}
              abierto={abierto}
              retro={retro}
              ultimaFuncion={ultimaFuncion}
              onAbrir={(k) => setAbierto((p) => (p === k ? null : k))}
              onElegir={elegirOpcion}
              onMover={moverParte}
              onContar={contar}
              onSiguiente={siguienteParte}
              onDetener={() => setPaso(null)}
              onBorrador={resetEscenario}
            />
          )}

          {modo === "escribir" && (
            <TellYourOwn texto={texto} analisis={analisis} hecho={escrituraDone} onTexto={cambiarTexto} onFrase={agregarFrase} />
          )}

          {/* MODO — completa el texto (fill_blanks A2 y A6, verbatim) */}
          {modo === "texto" && (
            <>
              <Instruccion icono="fa-clock-rotate-left" texto={`Past continuous y past simple · ${ANECDOTA_INGLES_HUECOS_A2.ancla}`} hecho={texto2Done} />
              <CompletaTexto
                key={`a2-${textoIntento}`}
                data={ANECDOTA_INGLES_HUECOS_A2}
                accent={accent}
                rgba={color.rgba}
                completado={texto2Done}
                onCompletado={() => {
                  setTexto2Done(true);
                  sfxOk();
                  if (texto6Done) persistMejor(ovacion, escrituraDone, true, glosarioDone);
                }}
                onAcierto={sfxPlace}
                onError={sfxNo}
              />
              <Instruccion icono="fa-comment-dots" texto={`Conectores y reacción · ${ANECDOTA_INGLES_HUECOS_A6.ancla}`} hecho={texto6Done} />
              <CompletaTexto
                key={`a6-${textoIntento}`}
                data={ANECDOTA_INGLES_HUECOS_A6}
                accent={accent}
                rgba={color.rgba}
                completado={texto6Done}
                onCompletado={() => {
                  setTexto6Done(true);
                  sfxOk();
                  if (texto2Done) persistMejor(ovacion, escrituraDone, true, glosarioDone);
                }}
                onAcierto={sfxPlace}
                onError={sfxNo}
              />
            </>
          )}

          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES_A9}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y su ejemplo, y escribe el término del glosario que le corresponde (en inglés)."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
                persistMejor(ovacion, escrituraDone, textoDone, true);
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
                  <Dato label="Atención ahora" value={`${ev.final}%`} col={ev.final >= UMBRAL_OVACION ? OK : undefined} />
                  <Dato label="Mejor función" value={funciones > 0 ? `${mejorFuncion}%` : "—"} col={ovacion ? OK : undefined} />
                  <Dato label="Partes en orden" value={ev.enOrden ? "Sí" : "No"} col={ev.enOrden ? OK : NO} />
                  <Dato label="Formas débiles" value={`${ev.regulares + ev.malas}`} col={ev.regulares + ev.malas === 0 ? OK : undefined} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Ya cuentas anécdotas que atrapan!" : "Completa los modos para 2★; la tercera pide 2 errores o menos al escribir."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Cómo reacciona el público" icono="fa-users">
                <p style={{ margin: 0, color: T.text2 }}>
                  La atención empieza en 40 %. Cada forma que enseña la progresión suma; una que se entiende a medias resta un poco; una que rompe la historia
                  (presente, conector equivocado) resta mucho; una parte contada antes de tiempo resta 12. Con todo en orden, +5 al final. Es una{" "}
                  <strong style={{ color: T.text }}>simulación</strong>.
                </p>
              </Bloque>
              <Bloque titulo="La anécdota tal como la contarás" icono="fa-quote-left">
                <p style={{ margin: 0, color: T.text2, lineHeight: 1.6 }}>
                  {orden.map((id) => oracionDe(eleccion, BEAT[id])).join(" ")}
                </p>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: <RetoVF accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxEnsayo(false)) : undefined} />,
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
    <div className="an-instr">
      <i className={`fa-solid ${hecho ? "fa-circle-check" : icono}`} style={{ color: hecho ? OK : undefined }} aria-hidden />
      <span>{texto}</span>
    </div>
  );
}

/** La sala del café: foto (o degradado), murmullo del público y sus ocho caras. */
function Sala({ atencion, foto, titulo, murmullo }: { atencion: number; foto: string; titulo: string; murmullo?: string | null }) {
  const atentos = PUBLICO.filter((p) => {
    const e = caraDe(atencion, p.umbral);
    return e === "encantado" || e === "atento";
  }).length;
  return (
    <div className="an-sala">
      <div className="an-sala-fondo">
        <i className="fa-solid fa-microphone-lines" aria-hidden />
        <ImgSim key={foto} src={`${RUTA_FOTOS}/${foto}.webp`} />
      </div>
      <span className="an-sala-tit">
        <i className="fa-solid fa-mug-hot" aria-hidden /> {titulo}
      </span>
      {murmullo && (
        <div className="an-murmullo" aria-live="polite">
          <i className="fa-solid fa-comment" aria-hidden /> «{murmullo}»
        </div>
      )}
      <div className="an-publico" aria-label={`Público: ${atentos} de ${PUBLICO.length} atentos`}>
        {PUBLICO.map((p, i) => {
          const e = caraDe(atencion, p.umbral);
          const info = CARA_INFO[e];
          return (
            <span key={i} className="an-cara" data-estado={e} title={info.etiqueta} style={{ ["--cc" as string]: info.color, ["--tono" as string]: p.tono }}>
              <i className={`fa-solid ${info.icono}`} aria-hidden />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Medidor({ atencion, etiqueta }: { atencion: number; etiqueta: string }) {
  const col = atencion >= UMBRAL_OVACION ? OK : atencion >= 65 ? AMBAR : atencion >= 40 ? "#FF9F5A" : NO;
  return (
    <div className="an-medidor">
      <span>
        <i className="fa-solid fa-eye" aria-hidden /> {etiqueta}
      </span>
      <div className="an-barra" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={atencion} aria-label={etiqueta}>
        <div style={{ width: `${atencion}%`, background: col }} />
        <span className="an-umbral" style={{ left: `${UMBRAL_OVACION}%` }} title="Ovación: 90 %" />
      </div>
      <strong style={{ color: col }}>{atencion}%</strong>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 · Open mic (el simulador)
 * ═══════════════════════════════════════════════════════════════════════════ */

type Ev = ReturnType<typeof evaluar>;

function OpenMic({
  accent,
  orden,
  eleccion,
  ev,
  paso,
  abierto,
  retro,
  ultimaFuncion,
  onAbrir,
  onElegir,
  onMover,
  onContar,
  onSiguiente,
  onDetener,
  onBorrador,
}: {
  accent: string;
  orden: BeatId[];
  eleccion: Eleccion;
  ev: Ev;
  paso: number | null;
  abierto: string | null;
  retro: Retro | null;
  ultimaFuncion: number | null;
  onAbrir: (clave: string) => void;
  onElegir: (beat: BeatSim, slotId: string, opId: string) => void;
  onMover: (id: BeatId, dir: -1 | 1) => void;
  onContar: () => void;
  onSiguiente: () => void;
  onDetener: () => void;
  onBorrador: () => void;
}) {
  const actuando = paso !== null;
  const pasoActual = actuando ? ev.pasos[paso]! : null;
  const beatActual = pasoActual ? BEAT[pasoActual.beat] : null;
  const atencionVista = actuando ? ev.curva[paso + 1]! : ev.final;
  const foto = beatActual?.evento?.foto ?? "open-mic";
  const fin = ultimaFuncion !== null ? veredictoDe(ultimaFuncion) : null;

  return (
    <>
      <Sala
        atencion={atencionVista}
        foto={foto}
        titulo={beatActual ? `Leo cuenta: ${beatActual.nombre}` : "Café La Lámpara · Open mic night"}
        murmullo={pasoActual ? murmulloDe(pasoActual) : null}
      />
      <Medidor atencion={atencionVista} etiqueta={actuando ? "Atención en este momento" : "Atención al final (simulación)"} />

      {/* Controles de la función */}
      {!actuando ? (
        <div className="an-acciones">
          <button type="button" className="an-btn an-btn-pri" onClick={onContar}>
            <i className="fa-solid fa-play" aria-hidden /> Cuéntala al público
          </button>
          <button type="button" className="an-btn" onClick={onBorrador}>
            <i className="fa-solid fa-file-pen" aria-hidden /> Volver al borrador de Leo
          </button>
        </div>
      ) : (
        <div className="an-funcion" style={{ ["--rc" as string]: pasoActual!.adelantado || pasoActual!.peor.calidad === 0 ? NO : pasoActual!.peor.calidad === 1 ? AMBAR : OK }}>
          <span className="an-funcion-ceja">
            <i className={`fa-solid ${beatActual!.icono}`} aria-hidden /> Parte {paso + 1} de {orden.length} · {beatActual!.es}
          </span>
          <p className="an-funcion-frase">“{oracionDe(eleccion, beatActual!)}”</p>
          <p className="an-funcion-porque">
            <strong>{pasoActual!.delta >= 0 ? `+${pasoActual!.delta}` : pasoActual!.delta} de atención. </strong>
            {pasoActual!.adelantado
              ? `Contaste «${beatActual!.nombre}» antes que «${BEAT[pasoActual!.adelantado.antesDe].nombre}»: ${pasoActual!.adelantado.porque}`
              : pasoActual!.peor.calidad === 2
                ? "Todo en esta parte funciona: el público quiere saber qué sigue."
                : pasoActual!.peor.porque}
          </p>
          <div className="an-acciones">
            <button type="button" className="an-btn an-btn-pri" onClick={onSiguiente}>
              <i className="fa-solid fa-forward-step" aria-hidden /> {paso + 1 >= orden.length ? "Terminar la función" : "Siguiente parte"}
            </button>
            <button type="button" className="an-btn" onClick={onDetener}>
              <i className="fa-solid fa-stop" aria-hidden /> Detener
            </button>
          </div>
        </div>
      )}

      {!actuando && fin && ultimaFuncion !== null && (
        <div className="an-retro" style={{ ["--rc" as string]: fin.color }}>
          <strong>
            <i className={`fa-solid ${fin.icono}`} style={{ marginRight: 8, color: fin.color }} aria-hidden />
            Última función: {fin.titulo} · {ultimaFuncion}%
          </strong>
          <span>{fin.texto}</span>
        </div>
      )}

      {/* Curva de atención + línea de tiempo */}
      <div className="an-graficas">
        <Curva curva={ev.curva} paso={paso} accent={accent} />
        <LineaTiempo orden={orden} paso={paso} />
      </div>

      {/* Las partes de la anécdota, en el orden en que Leo las cuenta */}
      <div className="an-sub">
        <i className="fa-solid fa-sliders" aria-hidden /> Edita la anécdota de Leo: toca una palabra resaltada para cambiarla, o mueve una parte con las flechas.
      </div>
      <div className="an-partes">
        {orden.map((id, pos) => {
          const beat = BEAT[id];
          const pe = ev.pasos[pos]!;
          const enEscena = actuando && paso === pos;
          return (
            <article key={id} className="an-parte" data-adelantado={!!pe.adelantado} data-actual={enEscena}>
              <header>
                <span className="an-num">{pos + 1}</span>
                <i className={`fa-solid ${beat.icono}`} style={{ color: accent }} aria-hidden />
                <span className="an-parte-nom">
                  <strong>{beat.nombre}</strong>
                  <span>{beat.es}</span>
                </span>
                <span className="an-delta" style={{ color: pe.delta > 0 ? OK : pe.delta < -4 ? NO : AMBAR }}>
                  {pe.delta > 0 ? `+${pe.delta}` : pe.delta}
                </span>
                <span className="an-mover">
                  <button type="button" aria-label={`Subir ${beat.nombre}`} disabled={actuando || pos === 0} onClick={() => onMover(id, -1)}>
                    <i className="fa-solid fa-arrow-up" aria-hidden />
                  </button>
                  <button type="button" aria-label={`Bajar ${beat.nombre}`} disabled={actuando || pos === orden.length - 1} onClick={() => onMover(id, 1)}>
                    <i className="fa-solid fa-arrow-down" aria-hidden />
                  </button>
                </span>
              </header>

              <p className="an-frase">
                {beat.plantilla.split(/(\{\w+\})/).map((trozo, k) => {
                  const m = trozo.match(/^\{(\w+)\}$/);
                  if (!m) return <span key={k}>{trozo}</span>;
                  const slot = beat.slots.find((s) => s.id === m[1])!;
                  const op = opcionElegida(eleccion, beat, slot);
                  const clave = claveSlot(beat.id, slot.id);
                  return (
                    <button key={k} type="button" className="an-hueco" data-abierto={abierto === clave} disabled={actuando} onClick={() => onAbrir(clave)} aria-label={`${slot.etiqueta}: ${op.texto}. Cambiar`}>
                      {op.texto}
                      <i className="fa-solid fa-caret-down" aria-hidden />
                    </button>
                  );
                })}
              </p>

              {beat.slots.map((slot) => {
                const clave = claveSlot(beat.id, slot.id);
                if (abierto !== clave || actuando) return null;
                const actual = opcionElegida(eleccion, beat, slot);
                return (
                  <div key={slot.id} className="an-opciones">
                    <span className="an-opciones-tit">{slot.etiqueta}: elige otra forma</span>
                    <div className="an-opciones-lista">
                      {slot.opciones.map((o) => (
                        <button key={o.id} type="button" className="an-op" data-on={actual.id === o.id} onClick={() => onElegir(beat, slot.id, o.id)}>
                          {o.texto}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {pe.adelantado && (
                <div className="an-aviso">
                  <i className="fa-solid fa-triangle-exclamation" aria-hidden /> Va antes que «{BEAT[pe.adelantado.antesDe].nombre}»: {pe.adelantado.porque}
                </div>
              )}

              {retro && retro.beat === id && !actuando && (
                <div className="an-retro" style={{ ["--rc" as string]: retro.color }}>
                  <strong>
                    {retro.titulo} · {retro.delta > 0 ? `+${retro.delta}` : retro.delta} de atención
                  </strong>
                  <span>{retro.texto}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

/** La curva de atención: inicio y después de cada parte. Se traza hasta la parte que se cuenta. */
function Curva({ curva, paso, accent }: { curva: number[]; paso: number | null; accent: string }) {
  const n = curva.length - 1;
  const x = (i: number) => (i / n) * 100;
  const y = (v: number) => 46 - (v / 100) * 42;
  const hasta = paso === null ? n : paso + 1;
  const pts = curva.map((v, i) => `${x(i)},${y(v)}`);
  return (
    <div className="an-panel">
      <div className="an-panel-tit">
        <i className="fa-solid fa-chart-line" aria-hidden /> Curva de atención
      </div>
      <div className="an-curva">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden>
          <line x1="0" x2="100" y1={y(UMBRAL_OVACION)} y2={y(UMBRAL_OVACION)} stroke={OK} strokeDasharray="3 2" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <polyline points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <polyline points={pts.slice(0, hasta + 1).join(" ")} fill="none" stroke={accent} strokeWidth="3.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {curva.map((v, i) => (
          <span
            key={i}
            className="an-punto"
            data-on={i <= hasta}
            style={{ left: `${x(i)}%`, top: `${(y(v) / 50) * 100}%`, background: v >= UMBRAL_OVACION ? OK : v >= 40 ? accent : NO }}
          />
        ))}
      </div>
      <div className="an-curva-pie">
        <span>Inicio: {curva[0]}%</span>
        <span style={{ color: OK }}>Ovación: {UMBRAL_OVACION}%</span>
        <span>Final: {curva[n]}%</span>
      </div>
    </div>
  );
}

/** Orden real de los hechos frente al orden en que Leo los cuenta. */
function LineaTiempo({ orden, paso }: { orden: BeatId[]; paso: number | null }) {
  const reales = BEATS.filter((b) => b.evento).sort((a, b) => a.evento!.orden - b.evento!.orden);
  const narrados = orden.filter((id) => BEAT[id].evento).map((id) => BEAT[id]);
  const n = reales.length;
  const cx = (i: number) => ((i + 0.5) / n) * 100;
  const actualId = paso !== null ? orden[paso] : null;
  return (
    <div className="an-panel">
      <div className="an-panel-tit">
        <i className="fa-solid fa-timeline" aria-hidden /> Orden real vs. orden narrado
      </div>
      <div className="an-lt-fila">
        {reales.map((b) => (
          <div key={b.id} className="an-lt-real" data-actual={actualId === b.id}>
            <span className="an-lt-foto">
              <i className={`fa-solid ${b.icono}`} aria-hidden />
              <ImgSim src={`${RUTA_FOTOS}/${b.evento!.foto}.webp`} />
            </span>
            <span className="an-lt-txt">
              {b.evento!.orden}. {b.evento!.titulo}
            </span>
          </div>
        ))}
      </div>
      <svg className="an-lt-lineas" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
        {narrados.map((b, i) => {
          const bien = b.evento!.orden - 1 === i;
          return (
            <line
              key={b.id}
              x1={cx(b.evento!.orden - 1)}
              y1={0}
              x2={cx(i)}
              y2={30}
              stroke={bien ? OK : NO}
              strokeWidth={bien ? 2 : 3}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="an-lt-fila">
        {narrados.map((b, i) => {
          const bien = b.evento!.orden - 1 === i;
          return (
            <div key={b.id} className="an-lt-narr" data-bien={bien} data-actual={actualId === b.id}>
              <span className="an-lt-num">{b.evento!.orden}</span>
              <span className="an-lt-txt">{b.nombre}</span>
            </div>
          );
        })}
      </div>
      <div className="an-lt-ley">
        Arriba, lo que pasó; abajo, como lo cuenta Leo. <span style={{ color: NO }}>Las líneas rojas</span> se cruzan: el público oye un hecho antes de tiempo.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 · Tell your own (escritura con analizador)
 * ═══════════════════════════════════════════════════════════════════════════ */

function TellYourOwn({
  texto,
  analisis,
  hecho,
  onTexto,
  onFrase,
}: {
  texto: string;
  analisis: ReturnType<typeof analizarTexto>;
  hecho: boolean;
  onTexto: (t: string) => void;
  onFrase: (f: string) => void;
}) {
  const segs = marcar(texto);
  const murmullo =
    texto.trim() === ""
      ? null
      : analisis.completo
        ? "Wow… I couldn't stop listening!"
        : analisis.criterios.filter(Boolean).length >= 2
          ? "Ooh… and then what?"
          : "Hmm, okay…";
  const conteos: { ok: boolean; txt: string; valor: string }[] = [
    { ok: analisis.criterios[0], txt: ESCRITURA.criterios[0]!, valor: `${analisis.continuos}/2` },
    { ok: analisis.criterios[1], txt: ESCRITURA.criterios[1]!, valor: `${analisis.simples}/4` },
    { ok: analisis.criterios[2], txt: ESCRITURA.criterios[2]!, valor: analisis.inesperado ? "Sí" : "Falta" },
    { ok: analisis.criterios[3], txt: ESCRITURA.criterios[3]!, valor: analisis.estructura ? "Sí" : "Falta" },
    { ok: analisis.largo, txt: `Al menos ${ESCRITURA.longitudMinima} palabras`, valor: `${analisis.palabras}/${ESCRITURA.longitudMinima}` },
  ];
  return (
    <>
      <Sala atencion={analisis.atencion} foto="cuaderno" titulo="Tu anécdota frente al público" murmullo={murmullo} />
      <Medidor atencion={analisis.atencion} etiqueta="Atención del público (simulación)" />

      <div className="an-panel">
        <div className="an-panel-tit">
          <i className="fa-solid fa-pen-nib" aria-hidden /> {ESCRITURA.ancla}
        </div>
        <p style={{ margin: 0, fontSize: 15, color: T.text2, lineHeight: 1.55, whiteSpace: "pre-line" }}>{ESCRITURA.prompt}</p>
        <p style={{ margin: 0, fontSize: 14, color: T.text3 }}>El analizador lee inglés: escribe tu anécdota en inglés para que el público reaccione.</p>
      </div>

      <div className="an-sub">
        <i className="fa-solid fa-hand-pointer" aria-hidden /> Toca una frase para agregarla y sigue escribiendo:
      </div>
      <div className="an-arranques">
        {ARRANQUES.map((f) => (
          <button key={f} type="button" className="an-chip" onClick={() => onFrase(f)}>
            <i className="fa-solid fa-plus" aria-hidden /> {f}
          </button>
        ))}
      </div>

      <label className="an-area">
        <span>Tu anécdota (inglés)</span>
        <textarea value={texto} onChange={(e) => onTexto(e.target.value)} rows={7} placeholder="You won't believe what happened to me…" spellCheck />
      </label>

      {texto.trim() !== "" && (
        <div className="an-panel">
          <div className="an-panel-tit">
            <i className="fa-solid fa-highlighter" aria-hidden /> Así lee el público tu texto
          </div>
          <p className="an-marcado">
            {segs.map((s, i) =>
              s.tipo ? (
                <mark key={i} className={`an-m an-m-${s.tipo}`}>
                  {s.t}
                </mark>
              ) : (
                <span key={i}>{s.t}</span>
              )
            )}
          </p>
          <div className="an-leyenda">
            <span><mark className="an-m an-m-continuo">was walking</mark> past continuous ({analisis.continuos})</span>
            <span><mark className="an-m an-m-simple">saw</mark> past simple ({analisis.simples})</span>
            <span><mark className="an-m an-m-conector">suddenly</mark> conector ({analisis.conectores})</span>
          </div>
        </div>
      )}

      <div className="an-panel">
        <div className="an-panel-tit">
          <i className="fa-solid fa-list-check" aria-hidden /> Criterios de evaluación (A3)
        </div>
        <ul className="an-criterios">
          {conteos.map((c) => (
            <li key={c.txt} data-ok={c.ok}>
              <i className={`fa-solid ${c.ok ? "fa-circle-check" : "fa-circle"}`} aria-hidden />
              <span>{c.txt}</span>
              <strong>{c.valor}</strong>
            </li>
          ))}
        </ul>
        <div className="an-extras">
          <span data-ok={analisis.apertura}>
            <i className="fa-solid fa-bullhorn" aria-hidden /> Apertura {analisis.apertura ? "✓" : "(opcional)"}
          </span>
          <span data-ok={analisis.reaccion}>
            <i className="fa-solid fa-heart" aria-hidden /> Reacción {analisis.reaccion ? "✓" : "(opcional)"}
          </span>
          <span data-ok={analisis.conectores >= 3}>
            <i className="fa-solid fa-link" aria-hidden /> 3 conectores {analisis.conectores >= 3 ? "✓" : `(${analisis.conectores})`}
          </span>
        </div>
        {hecho && (
          <div className="an-retro" style={{ ["--rc" as string]: OK }}>
            <strong>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 8, color: OK }} aria-hidden />
              ¡Tu anécdota cumple los criterios!
            </strong>
            <span>Contexto en past continuous, hechos en past simple, un momento inesperado y un desenlace, en ese orden.</span>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto · True or False (A4 verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */

function RetoVF({
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
  const preguntas = QUIZ_VF.preguntas;
  const [resp, setResp] = useState<(boolean | null)[]>(() => preguntas.map(() => null));
  const [comprobado, setComprobado] = useState(false);
  const aciertos = resp.filter((r, i) => r === preguntas[i]!.respuesta).length;
  const pct = Math.round((aciertos / preguntas.length) * 100);
  const aprobadoAhora = pct >= QUIZ_VF.puntajeMinimo;
  const todas = resp.every((r) => r !== null);

  const comprobar = () => {
    setComprobado(true);
    playSfx?.(aprobadoAhora);
    if (aprobadoAhora) onAprobado();
  };
  const reintentar = () => {
    setResp(preguntas.map(() => null));
    setComprobado(false);
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 15, color: T.text }}>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} aria-hidden />
          {QUIZ_VF.ancla}
        </strong>
        {aprobado && (
          <span style={{ fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" aria-hidden /> Aprobado
          </span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 14, color: T.text2 }}>
        {QUIZ_VF.descripcion} Necesitas {QUIZ_VF.puntajeMinimo} % o más.
      </p>
      {preguntas.map((q, qi) => (
        <div key={qi} style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>
            <span style={{ color: accent }}>{qi + 1}.</span> {q.enunciado}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            {[true, false].map((v) => {
              const sel = resp[qi] === v;
              const correcta = q.respuesta === v;
              let borde: string = T.line;
              let fondo: string = T.glass;
              if (comprobado && correcta) {
                borde = OK;
                fondo = `${OK}1c`;
              } else if (comprobado && sel) {
                borde = NO;
                fondo = `${NO}1c`;
              } else if (sel) {
                borde = accent;
                fondo = `rgba(${rgba},0.16)`;
              }
              return (
                <button
                  key={String(v)}
                  type="button"
                  className="an-btn"
                  disabled={comprobado}
                  style={{ borderColor: borde, background: fondo, color: sel || (comprobado && correcta) ? "#fff" : T.text2 }}
                  onClick={() => setResp((p) => p.map((x, i) => (i === qi ? v : x)))}
                >
                  {v ? "True" : "False"}
                </button>
              );
            })}
          </div>
          {comprobado && (
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, padding: "8px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
              <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 8 }} aria-hidden />
              {q.retro}
            </div>
          )}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button type="button" className="an-btn an-btn-pri" onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" aria-hidden /> Comprobar
          </button>
        ) : (
          <button type="button" className="an-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" aria-hidden /> Reintentar
          </button>
        )}
        {comprobado && (
          <span style={{ fontSize: 14, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            {aciertos} / {preguntas.length} correctas ({pct} %)
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Teoría (todo el texto curricular, verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */

function P({ children, fuerte }: { children: ReactNode; fuerte?: boolean }) {
  return <p style={{ margin: 0, color: fuerte ? T.text : T.text2, lineHeight: 1.6, fontWeight: fuerte ? 700 : 400 }}>{children}</p>;
}

function Teoria({ accent, rgba }: { accent: string; rgba: string }) {
  return (
    <>
      <Bloque titulo={`${LECTURA.ancla} · ${LECTURA.titulo}`} icono="fa-book-open">
        <P>{LECTURA.intro}</P>
        <P fuerte>{LECTURA.continuo.titulo}</P>
        <P>{LECTURA.continuo.uso}</P>
        <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
          {LECTURA.continuo.ejemplos.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <P fuerte>The key pattern:</P>
        {LECTURA.patrones.map((p) => (
          <div key={p.patron} style={{ display: "grid", gap: 4 }}>
            <P fuerte>{p.patron}</P>
            <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
              {p.ejemplos.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ))}
        <P fuerte>{LECTURA.anecdotaTitulo}</P>
        <P>{LECTURA.anecdota}</P>
        <P>{LECTURA.gramatica}</P>
        <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid rgba(${rgba},0.4)`, background: `rgba(${rgba},0.1)`, color: T.text, fontSize: 15 }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} aria-hidden />
          {LECTURA.callout}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: T.text3 }}>Fuente: {LECTURA.fuente}</p>
      </Bloque>

      <Bloque titulo="Preguntas de comprensión" icono="fa-circle-question">
        {LECTURA.preguntas.map((q) => (
          <details key={q.pregunta} className="an-det">
            <summary>{q.pregunta}</summary>
            <P>{q.respuesta}</P>
          </details>
        ))}
      </Bloque>

      <Bloque titulo={GLOSARIO_A5.ancla} icono="fa-spell-check">
        {GLOSARIO_A5.terminos.map((g) => (
          <div key={g.termino} style={{ display: "grid", gap: 2 }}>
            <P fuerte>
              {g.termino} <span style={{ color: T.text3, fontWeight: 600 }}>· {g.etiqueta}</span>
            </P>
            <P>{g.definicion}</P>
            <p style={{ margin: 0, color: accent, fontStyle: "italic", lineHeight: 1.5 }}>“{g.ejemplo}”</p>
          </div>
        ))}
        <P>
          <strong style={{ color: T.text }}>Actividad final: </strong>
          {GLOSARIO_A5.actividadFinal}
        </P>
      </Bloque>

      <Bloque titulo={ESCRITURA.ancla} icono="fa-pen-nib">
        <p style={{ margin: 0, color: T.text2, lineHeight: 1.6, whiteSpace: "pre-line" }}>{ESCRITURA.prompt}</p>
        <P fuerte>Pistas</P>
        <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
          {ESCRITURA.pistas.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <P fuerte>Criterios de evaluación</P>
        <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
          {ESCRITURA.criterios.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <P>Longitud mínima: {ESCRITURA.longitudMinima} palabras.</P>
      </Bloque>

      <Bloque titulo={AUTOEVALUACION.ancla} icono="fa-clipboard-check">
        <P>{AUTOEVALUACION.instrucciones}</P>
        <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
          {AUTOEVALUACION.criterios.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <P>{AUTOEVALUACION.escala.map((e) => `${e.valor} · ${e.etiqueta}: ${e.descripcion}`).join("  ")}</P>
        <P fuerte>{AUTOEVALUACION.reflexion}</P>
      </Bloque>

      <Bloque titulo={VIDEO.ancla} icono="fa-circle-play">
        <P>{VIDEO.descripcion}</P>
        <ul style={{ margin: 0, paddingLeft: 20, color: T.text2, lineHeight: 1.6 }}>
          {VIDEO.preguntas.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <P>Opciones de la pregunta sobre el tiempo verbal: {VIDEO.opcionesTiempo.join(" · ")}.</P>
      </Bloque>

      <Bloque titulo="Ficha teórica" icono="fa-book">
        <FichaTeorica data={ANECDOTA_INGLES_FICHA} accent={accent} rgba={rgba} defaultOpen />
      </Bloque>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Estilos
 * ═══════════════════════════════════════════════════════════════════════════ */

const css = (accent: string, rgba: string) => `
  @keyframes anBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
  @keyframes anShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-3px);} 75%{transform:translateX(3px);} }
  @keyframes anIn { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }

  .an-sala { position:relative; border-radius:16px; overflow:hidden; border:1.5px solid ${T.line}; height:clamp(190px, 30vh, 270px);
    background:linear-gradient(160deg, rgba(${rgba},0.32), rgba(40,18,8,0.9) 70%); flex-shrink:0; }
  .an-sala-fondo { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  .an-sala-fondo > i { font-size:64px; color:rgba(255,255,255,0.16); }
  .an-sala-fondo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .an-sala-tit { position:absolute; left:10px; top:10px; max-width:calc(100% - 20px); padding:6px 12px; border-radius:999px;
    background:rgba(2,12,28,.82); color:#fff; font-size:14px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .an-sala-tit i { color:${accent}; margin-right:4px; }
  .an-murmullo { position:absolute; right:10px; top:50px; max-width:calc(100% - 20px); padding:8px 13px; border-radius:14px 14px 4px 14px;
    background:rgba(255,255,255,0.93); color:#10202f; font-size:15px; font-weight:800; animation:anIn .3s ease; }
  .an-murmullo i { color:${accent}; margin-right:4px; }
  .an-publico { position:absolute; left:0; right:0; bottom:0; display:flex; justify-content:center; gap:6px; flex-wrap:wrap;
    padding:30px 8px 10px; background:linear-gradient(180deg, transparent, rgba(2,8,18,.85) 55%); }
  .an-cara { --tono:200; width:38px; height:38px; border-radius:50% 50% 40% 40%; display:flex; align-items:center; justify-content:center;
    background:hsl(var(--tono) 35% 22%); border:2.5px solid var(--cc); color:var(--cc); font-size:19px; transition:border-color .3s, color .3s; }
  .an-cara[data-estado="encantado"] { animation:anBob 1.1s ease-in-out infinite; }
  .an-cara[data-estado="perdido"] { opacity:.75; transform:translateY(4px); }

  .an-medidor { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:10px; align-items:center; font-size:14px; font-weight:800; color:${T.text2}; }
  .an-medidor i { margin-right:4px; }
  .an-medidor strong { font-size:18px; font-family:ui-monospace, monospace; }
  .an-barra { position:relative; height:14px; border-radius:8px; background:${T.inset}; border:1px solid ${T.line}; overflow:visible; }
  .an-barra > div { height:100%; border-radius:8px; transition:width .4s ease, background .4s; }
  .an-umbral { position:absolute; top:-4px; bottom:-4px; width:3px; border-radius:2px; background:${OK}; transform:translateX(-50%); }

  .an-acciones { display:flex; gap:10px; flex-wrap:wrap; }
  .an-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:15px; font-weight:800; transition:all .14s; }
  .an-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .an-btn:disabled { cursor:default; opacity:.6; }
  .an-btn-pri { background:${accent}; color:#04121f; border-color:${accent}; }
  .an-btn:focus-visible, .an-hueco:focus-visible, .an-op:focus-visible, .an-chip:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }

  .an-funcion { display:grid; gap:8px; padding:14px 16px; border-radius:14px; border:1.5px solid var(--rc); background:${T.glass}; animation:anIn .3s ease; }
  .an-funcion-ceja { font-size:14px; font-weight:900; color:var(--rc); letter-spacing:.04em; }
  .an-funcion-ceja i { margin-right:6px; }
  .an-funcion-frase { margin:0; font-size:18px; font-weight:800; color:#fff; line-height:1.4; }
  .an-funcion-porque { margin:0; font-size:15px; color:${T.text2}; line-height:1.5; }
  .an-funcion-porque strong { color:var(--rc); }

  .an-retro { display:grid; gap:4px; padding:12px 14px; border-radius:12px; border:1.5px solid var(--rc); background:${T.glass};
    font-size:15px; line-height:1.5; color:${T.text2}; animation:anIn .3s ease; }
  .an-retro strong { color:#fff; }

  .an-graficas { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:12px; }
  .an-panel { display:grid; gap:10px; padding:14px; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; min-width:0; }
  .an-panel-tit { font-size:14px; font-weight:900; color:${T.text}; letter-spacing:.03em; }
  .an-panel-tit i { color:${accent}; margin-right:6px; }
  .an-curva { position:relative; height:130px; margin:6px 6px 0; }
  .an-curva svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
  .an-punto { position:absolute; width:12px; height:12px; border-radius:50%; transform:translate(-50%,-50%); border:2px solid #0b1626;
    transition:top .4s ease, opacity .3s; }
  .an-punto[data-on="false"] { opacity:.25; }
  .an-curva-pie { display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap; font-size:14px; color:${T.text3}; font-weight:700; }

  .an-lt-fila { display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); gap:6px; }
  .an-lt-real, .an-lt-narr { display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center; min-width:0; }
  .an-lt-foto { position:relative; width:100%; aspect-ratio:1; max-width:72px; border-radius:10px; overflow:hidden; border:1.5px solid ${T.line};
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,18,36,0.95)); display:flex; align-items:center; justify-content:center; }
  .an-lt-foto > i { font-size:20px; color:rgba(255,255,255,0.4); }
  .an-lt-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .an-lt-real[data-actual="true"] .an-lt-foto, .an-lt-narr[data-actual="true"] .an-lt-num { box-shadow:0 0 0 3px ${accent}; }
  .an-lt-txt { font-size:14px; line-height:1.2; color:${T.text2}; font-weight:700; overflow-wrap:anywhere; }
  .an-lt-lineas { width:100%; height:40px; display:block; }
  .an-lt-num { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900;
    color:#04121f; background:${OK}; }
  .an-lt-narr[data-bien="false"] .an-lt-num { background:${NO}; color:#fff; animation:anShake .4s 1; }
  .an-lt-ley { font-size:14px; color:${T.text3}; line-height:1.45; }

  .an-sub { font-size:15px; font-weight:800; color:${T.text}; }
  .an-sub i { color:${accent}; margin-right:6px; }
  .an-partes { display:grid; gap:10px; }
  .an-parte { display:grid; gap:8px; padding:12px 14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft}; min-width:0; }
  .an-parte[data-adelantado="true"] { border-color:${NO}88; }
  .an-parte[data-actual="true"] { border-color:${accent}; box-shadow:0 0 18px -6px ${accent}; }
  .an-parte header { display:flex; align-items:center; gap:9px; flex-wrap:wrap; }
  .an-num { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900;
    background:rgba(${rgba},0.22); color:#fff; flex-shrink:0; }
  .an-parte-nom { display:flex; flex-direction:column; min-width:0; flex:1 1 140px; line-height:1.2; }
  .an-parte-nom strong { font-size:15px; color:#fff; }
  .an-parte-nom span { font-size:14px; color:${T.text3}; }
  .an-delta { font-size:15px; font-weight:900; font-family:ui-monospace, monospace; }
  .an-mover { display:inline-flex; gap:4px; }
  .an-mover button { cursor:pointer; width:38px; height:38px; border-radius:9px; border:1.5px solid ${T.line}; background:${T.inset}; color:#fff; font-size:14px; }
  .an-mover button:hover:not(:disabled) { border-color:${accent}; }
  .an-mover button:disabled { opacity:.3; cursor:default; }
  .an-frase { margin:0; font-size:16px; line-height:1.9; color:#e8f0fb; }
  .an-hueco { cursor:pointer; display:inline-flex; align-items:center; gap:6px; margin:0 2px; padding:2px 10px; border-radius:8px;
    border:1.5px dashed ${accent}; background:rgba(${rgba},0.14); color:#fff; font-size:16px; font-weight:800; line-height:1.5; text-align:left; }
  .an-hueco i { font-size:14px; color:${accent}; }
  .an-hueco[data-abierto="true"] { border-style:solid; background:rgba(${rgba},0.3); }
  .an-hueco:disabled { cursor:default; }
  .an-opciones { display:grid; gap:8px; padding:10px; border-radius:12px; background:${T.inset}; border:1px solid ${T.line}; animation:anIn .2s ease; }
  .an-opciones-tit { font-size:14px; font-weight:800; color:${T.text3}; }
  .an-opciones-lista { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 180px), 1fr)); gap:8px; }
  .an-op { cursor:pointer; text-align:left; padding:10px 12px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; font-size:15px; font-weight:700; line-height:1.35; transition:border-color .14s; }
  .an-op:hover { border-color:${accent}; }
  .an-op[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); }
  .an-aviso { font-size:14px; color:#ffd0d0; line-height:1.45; }
  .an-aviso i { color:${NO}; margin-right:4px; }

  .an-instr { display:flex; align-items:center; gap:9px; font-size:15px; font-weight:800; color:${T.text}; }
  .an-instr i { color:${accent}; }

  .an-arranques { display:flex; flex-wrap:wrap; gap:8px; }
  .an-chip { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:9px 13px; border-radius:999px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:border-color .14s; }
  .an-chip:hover { border-color:${accent}; }
  .an-chip i { color:${accent}; font-size:14px; }
  .an-area { display:grid; gap:6px; font-size:14px; font-weight:800; color:${T.text2}; }
  .an-area textarea { width:100%; box-sizing:border-box; resize:vertical; min-height:150px; padding:12px 14px; border-radius:12px;
    border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:16px; line-height:1.55; font-family:inherit; }
  .an-area textarea:focus { outline:none; border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.25); }
  .an-marcado { margin:0; font-size:16px; line-height:1.8; color:#e8f0fb; white-space:pre-wrap; overflow-wrap:anywhere; }
  .an-m { padding:1px 4px; border-radius:5px; color:#fff; }
  .an-m-continuo { background:rgba(52,211,153,0.3); box-shadow:inset 0 -2px 0 ${OK}; }
  .an-m-simple { background:rgba(91,168,255,0.3); box-shadow:inset 0 -2px 0 #5BA8FF; }
  .an-m-conector { background:rgba(255,199,90,0.3); box-shadow:inset 0 -2px 0 ${AMBAR}; }
  .an-leyenda { display:flex; flex-wrap:wrap; gap:8px 16px; font-size:14px; color:${T.text2}; }
  .an-criterios { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  .an-criterios li { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:9px; align-items:start; font-size:14px; color:${T.text2}; line-height:1.45; }
  .an-criterios li i { margin-top:3px; color:${T.text3}; }
  .an-criterios li[data-ok="true"] i, .an-criterios li[data-ok="true"] strong { color:${OK}; }
  .an-criterios li strong { font-family:ui-monospace, monospace; color:${T.text}; }
  .an-extras { display:flex; flex-wrap:wrap; gap:8px; }
  .an-extras span { font-size:14px; font-weight:700; padding:5px 11px; border-radius:999px; border:1px solid ${T.line}; color:${T.text3}; }
  .an-extras span[data-ok="true"] { color:${OK}; border-color:${OK}66; }

  .an-det { border:1px solid ${T.line}; border-radius:10px; padding:8px 12px; background:${T.glass}; }
  .an-det summary { cursor:pointer; font-size:15px; font-weight:700; color:${T.text}; line-height:1.45; }
  .an-det[open] summary { margin-bottom:6px; }

  @media (prefers-reduced-motion: reduce) {
    .an-cara[data-estado="encantado"], .an-lt-narr[data-bien="false"] .an-lt-num, .an-murmullo, .an-retro, .an-funcion, .an-opciones { animation:none; }
    .an-barra > div, .an-punto, .an-cara { transition:none; }
  }
`;
