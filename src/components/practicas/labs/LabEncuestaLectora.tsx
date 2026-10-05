"use client";

/**
 * Laboratorio — La encuesta lectora de tu comunidad.
 * Práctica interactiva para LC-I-P02 (Lengua y Comunicación I): «Investiga los
 * gustos y las inclinaciones de las personas de su comunidad escolar respecto
 * de la lectura».
 *
 * El alumno recorre la investigación completa, no una parte: construye el
 * instrumento, codifica lo que la gente contestó y lee la gráfica que sale de
 * sus propias decisiones. Cinco modos:
 *
 *  0. «Aplica la encuesta» — SIMULADOR: elige muestra, pregunta y tamaño, aplícala a
 *     una escuela ficticia y mira cuánto se desvían las barras de la verdad.
 *  1. «Arma la encuesta» — decide, una por una, si cada pregunta candidata
 *     entra al cuestionario o se descarta, y recibe el nombre del defecto
 *     (inducida, ambigua, doble, invasiva, supuesto falso).
 *  2. «Levanta los datos» — codifica las nueve respuestas abiertas de la
 *     comunidad asignándoles tipo de texto y soporte; la gráfica crece en vivo.
 *  3. «Lee la gráfica» — interpreta las barras que acaba de producir y
 *     distingue lo que los datos dicen de lo que no autorizan a decir.
 *  4. «Completa el texto» — los huecos verbatim de LC-I-P02-A6.
 *  + Cuestionario evaluable verbatim de LC-I-P02-A2.
 *
 * DOM puro (sin three.js). El fenómeno aquí es una práctica de indagación, no
 * un sistema físico: la escena honesta es el cuestionario, la tabla y la
 * gráfica, no una maqueta decorativa. Accesible con ratón, teclado y táctil.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { ENCUESTA_LECTORA_HUECOS } from "./encuesta-lectora-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { LabShell, Bloque, BotonHerramienta, Dato, Deslizador } from "./_shell";
import { MUESTRAS, PREGUNTAS, VERDAD, aplicarEncuesta, explicaCorrida, etiquetaVeredicto, type Muestra, type Pregunta, type Corrida } from "./encuesta-lectora-sim";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { ENCUESTA_LECTORA_FICHA } from "./encuesta-lectora-ficha";
import {
  CANDIDATAS,
  CANDIDATAS_UTILES,
  PERSONAS,
  TIPO_INFO,
  SOPORTE_INFO,
  TIPOS,
  SOPORTES,
  LECTURA_GRAFICA,
  QUIZ,
  HECHOS,
  PISTAS_ENTREVISTA,
  CALLOUT_A1,
  DATO_MOLEC,
  NOTA_PIE,
  type TipoTexto,
  type Soporte,
  type PreguntaCandidata,
  type PersonaEncuestada,
} from "./encuesta-lectora-data";

const NO = "#FF5E5E";
const ORO = "#FFC75A";
const RETO_KEY = "cen-encuesta-lectora-reto";
const RUTA_FOTOS = "/media/labs-sim/encuesta-lectora-comunidad";

/** Tope del eje de la gráfica: con nueve personas ninguna barra pasa de 4. */
const EJE_MAX = 5;

type Modo = "aplica" | "encuesta" | "campo" | "grafica" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "aplica", label: "Aplica la encuesta", icono: "fa-flask" },
  { id: "encuesta", label: "Arma la encuesta", icono: "fa-clipboard-question" },
  { id: "campo", label: "Levanta los datos", icono: "fa-users" },
  { id: "grafica", label: "Lee la gráfica", icono: "fa-chart-simple" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/** Codificación que el alumno ya acertó para una persona. */
interface Codificacion {
  tipo?: TipoTexto;
  soporte?: Soporte;
}

export function LabEncuestaLectora({ color }: PracticaLabProps) {
  const accent = color.hex;
  const rgba = color.rgba;
  const [modo, setModo] = useState<Modo>("aplica");

  /* ── sonido ─────────────────────────────────────────────────────────── */
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
  const sfxFin = () => sonido && audioRef.current?.correcto();
  const sfxOk = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };

  /* ── modo 0 · Aplica la encuesta (simulador) ────────────────────────── */
  const [muestra, setMuestra] = useState<Muestra>("sorteo");
  const [pregunta, setPregunta] = useState<Pregunta>("abierta");
  const [tamano, setTamano] = useState(30);
  const [corridas, setCorridas] = useState<Corrida[]>([]);

  const ultima = corridas[corridas.length - 1] ?? null;
  const desactualizada = !ultima || ultima.muestra !== muestra || ultima.pregunta !== pregunta || ultima.n !== tamano;

  const aplicar = () => {
    const c = aplicarEncuesta(muestra, pregunta, tamano, corridas.length, corridas.length + 1);
    setCorridas((prev) => [...prev, c]);
    if (c.veredicto === "confiable") {
      partida.acierto();
      if (sonido) audioRef.current?.correcto();
    } else if (sonido) {
      audioRef.current?.blip();
    }
  };
  const reiniciarAplica = () => {
    setCorridas([]);
    setMuestra("sorteo");
    setPregunta("abierta");
    setTamano(30);
  };
  const mejorSesgo = corridas.length ? Math.min(...corridas.map((c) => c.sesgo)) : null;
  const aplicaBiblioteca = corridas.some((c) => c.muestra === "biblioteca");
  const aplicaConfiable = corridas.some((c) => c.veredicto === "confiable" && c.n >= 60);

  /* ── modo 1 · Arma la encuesta ──────────────────────────────────────── */
  // id → decisión acertada ("incluir" | "descartar"). Solo se guarda cuando el
  // alumno decide bien: una decisión equivocada no se registra, se explica.
  const [decididas, setDecididas] = useState<Record<string, "incluir" | "descartar">>({});
  const [sacude, setSacude] = useState<string | null>(null);

  const decidir = (c: PreguntaCandidata, decision: "incluir" | "descartar") => {
    if (decididas[c.id]) return;
    const correcta = c.sirve ? "incluir" : "descartar";
    if (decision === correcta) {
      const siguiente = { ...decididas, [c.id]: decision };
      setDecididas(siguiente);
      sfxOk();
      if (Object.keys(siguiente).length >= CANDIDATAS.length) sfxFin();
    } else {
      setSacude(c.id);
      sfxNo();
      window.setTimeout(() => setSacude(null), 420);
    }
  };
  const reiniciarEncuesta = () => {
    setDecididas({});
    setSacude(null);
  };

  const incluidas = CANDIDATAS.filter((c) => decididas[c.id] === "incluir");
  const encuestaDone = Object.keys(decididas).length >= CANDIDATAS.length;

  /* ── modo 2 · Levanta los datos ─────────────────────────────────────── */
  const [codificado, setCodificado] = useState<Record<string, Codificacion>>({});
  const [sacudePersona, setSacudePersona] = useState<string | null>(null);

  const marcar = (p: PersonaEncuestada, campo: "tipo" | "soporte", valor: TipoTexto | Soporte) => {
    const actual = codificado[p.id] ?? {};
    if (actual[campo]) return;
    const esperado: string = campo === "tipo" ? p.tipo : p.soporte;
    if (valor === esperado) {
      const nuevo: Codificacion = { ...actual, [campo]: valor };
      const siguiente = { ...codificado, [p.id]: nuevo };
      setCodificado(siguiente);
      sfxOk();
      const listas = PERSONAS.filter((x) => {
        const c = siguiente[x.id];
        return c?.tipo && c.soporte;
      }).length;
      if (listas >= PERSONAS.length) sfxFin();
    } else {
      setSacudePersona(`${p.id}-${campo}`);
      sfxNo();
      window.setTimeout(() => setSacudePersona(null), 420);
    }
  };
  const reiniciarCampo = () => {
    setCodificado({});
    setSacudePersona(null);
  };

  const tabuladas = useMemo(
    () => PERSONAS.filter((p) => codificado[p.id]?.tipo && codificado[p.id]?.soporte),
    [codificado],
  );
  const campoDone = tabuladas.length >= PERSONAS.length;

  // La gráfica se alimenta SOLO de lo que el alumno ya codificó: cada acierto
  // mueve una barra, que es lo que hace visible que los datos los produce él.
  const conteoTipo = useMemo(() => {
    const base: Record<TipoTexto, number> = { informativo: 0, narrativo: 0, digital: 0 };
    for (const p of PERSONAS) {
      const t = codificado[p.id]?.tipo;
      if (t) base[t] += 1;
    }
    return base;
  }, [codificado]);
  const conteoSoporte = useMemo(() => {
    const base: Record<Soporte, number> = { papel: 0, pantalla: 0, calle: 0 };
    for (const p of PERSONAS) {
      const s = codificado[p.id]?.soporte;
      if (s) base[s] += 1;
    }
    return base;
  }, [codificado]);

  /* ── modo 3 · Lee la gráfica ────────────────────────────────────────── */
  const [respG, setRespG] = useState<(number | null)[]>(() => LECTURA_GRAFICA.map(() => null));
  const [gIdx, setGIdx] = useState(0);

  const responderG = (iOpcion: number) => {
    if (respG[gIdx] !== null) return;
    const q = LECTURA_GRAFICA[gIdx];
    if (!q) return;
    const siguiente = [...respG];
    siguiente[gIdx] = iOpcion;
    setRespG(siguiente);
    if (iOpcion === q.correcta) sfxOk();
    else sfxNo();
    if (siguiente.every((r) => r !== null)) sfxFin();
  };
  const reiniciarGrafica = () => {
    setRespG(LECTURA_GRAFICA.map(() => null));
    setGIdx(0);
  };
  const graficaDone = respG.every((r) => r !== null);
  const g5Ok = respG[4] === LECTURA_GRAFICA[4]?.correcta;

  /* ── modo 4 · Completa el texto ─────────────────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const reiniciarTexto = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };

  /* ── cuestionario evaluable ─────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ──────────────────────────────────────────────────────── */
  const modosHechos = (encuestaDone ? 1 : 0) + (campoDone ? 1 : 0) + (graficaDone ? 1 : 0) + (textoDone ? 1 : 0);
  const objetivos = [
    { txt: "Aplica tu encuesta solo en la biblioteca y compara con la escuela", done: aplicaBiblioteca },
    { txt: "Logra una encuesta confiable: sorteo, pregunta abierta y 60 personas o más", done: aplicaConfiable },
    { txt: `Decide las ${CANDIDATAS.length} preguntas candidatas`, done: encuestaDone },
    { txt: `Arma un cuestionario con las ${CANDIDATAS_UTILES} preguntas útiles`, done: incluidas.length >= CANDIDATAS_UTILES },
    { txt: "Descarta la pregunta inducida y la del supuesto falso", done: decididas["c3"] === "descartar" && decididas["c12"] === "descartar" },
    { txt: `Codifica las ${PERSONAS.length} respuestas de la comunidad`, done: campoDone },
    { txt: "Registra la lectura que ocurre en la calle", done: Boolean(codificado["p7"]?.soporte) },
    { txt: "Contesta las 5 preguntas de lectura de la gráfica", done: graficaDone },
    { txt: "Reconoce lo que la gráfica NO te dice", done: g5Ok },
    { txt: "Completa el texto sobre tipos de texto", done: textoDone },
    { txt: "Aprueba el cuestionario de la progresión", done: quizAprobado },
    { txt: "Encadena 8 aciertos seguidos sin fallar", done: partida.mejorRacha >= 8 },
  ];

  const reiniciarModo =
    modo === "aplica"
      ? reiniciarAplica
      : modo === "encuesta"
        ? reiniciarEncuesta
        : modo === "campo"
          ? reiniciarCampo
          : modo === "grafica"
            ? reiniciarGrafica
            : reiniciarTexto;

  const lectura =
    modo === "aplica" ? (
      ultima ? (
        <>
          Sesgo {ultima.sesgo} puntos · {etiquetaVeredicto(ultima.veredicto)}
        </>
      ) : (
        <>Diseña tu encuesta y aplícala.</>
      )
    ) : modo === "encuesta" ? (
      <>
        {Object.keys(decididas).length}/{CANDIDATAS.length} decididas · {incluidas.length} incluidas
      </>
    ) : modo === "campo" ? (
      <>
        {tabuladas.length} de {PERSONAS.length} personas tabuladas
      </>
    ) : modo === "grafica" ? (
      <>{campoDone ? `${respG.filter((r) => r !== null).length}/${LECTURA_GRAFICA.length} lecturas contestadas` : "Primero levanta los datos."}</>
    ) : (
      <>Repasa los tipos de texto.</>
    );

  const pistaModo =
    modo === "aplica" ? (
      <>
        Una buena encuesta pregunta a una <strong style={{ color: T.text }}>muestra que se parezca</strong> a la escuela, con una pregunta{" "}
        <strong style={{ color: T.text }}>neutral y medible</strong>, y a suficientes personas.
      </>
    ) : modo === "encuesta" ? (
      <>
        Una buena pregunta <strong style={{ color: T.text }}>no sugiere la respuesta</strong>, significa lo mismo para todos y pregunta{" "}
        <strong style={{ color: T.text }}>una sola cosa</strong>.
      </>
    ) : modo === "campo" ? (
      <>
        El <strong style={{ color: T.text }}>tipo de texto</strong> depende de lo que el texto hace; el <strong style={{ color: T.text }}>soporte</strong>, del medio
        donde aparece.
      </>
    ) : modo === "grafica" ? (
      <>
        Antes de concluir, revisa <strong style={{ color: T.text }}>cuántas personas</strong> hay detrás de cada barra.
      </>
    ) : (
      <>
        Fíjate en <strong style={{ color: T.text }}>qué hace</strong> cada texto: informa, relata o circula en una plataforma.
      </>
    );

  return (
    <LabShell
      accent={accent}
      rgba={rgba}
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
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={reiniciarModo} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <style>{css(accent, rgba)}</style>

          {modo === "aplica" && (
            <PanelAplica
              accent={accent}
              muestra={muestra}
              setMuestra={setMuestra}
              pregunta={pregunta}
              setPregunta={setPregunta}
              tamano={tamano}
              setTamano={setTamano}
              corrida={ultima}
              desactualizada={desactualizada}
              onAplicar={aplicar}
            />
          )}

          {modo === "encuesta" && (
            <PanelEncuesta
              accent={accent}
              rgba={rgba}
              decididas={decididas}
              sacude={sacude}
              incluidas={incluidas.length}
              onDecidir={decidir}
            />
          )}

          {modo === "campo" && (
            <PanelCampo
              accent={accent}
              rgba={rgba}
              codificado={codificado}
              sacudePersona={sacudePersona}
              conteoTipo={conteoTipo}
              conteoSoporte={conteoSoporte}
              tabuladas={tabuladas.length}
              onMarcar={marcar}
            />
          )}

          {modo === "grafica" && (
            <PanelGrafica
              accent={accent}
              rgba={rgba}
              listo={campoDone}
              tabuladas={tabuladas.length}
              conteoTipo={conteoTipo}
              conteoSoporte={conteoSoporte}
              respG={respG}
              gIdx={gIdx}
              onResponder={responderG}
              onIr={(i) => setGIdx(i)}
              onIrACampo={() => setModo("campo")}
            />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={ENCUESTA_LECTORA_HUECOS}
              accent={accent}
              rgba={rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxFin();
              }}
              onAcierto={sfxOk}
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
                <MarcadorPartida partida={partida} accent={accent} rgba={rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Encuestas aplicadas" value={String(corridas.length)} />
                  <Dato label="Mejor sesgo" value={mejorSesgo === null ? "—" : `${mejorSesgo} pts`} col={mejorSesgo !== null && mejorSesgo <= 6 ? OK : undefined} />
                  <Dato label="Modos terminados" value={`${modosHechos}/4`} col={modosHechos >= 4 ? OK : undefined} />
                  <Dato label="Muestra" value={`${tamano} pers.`} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{pistaModo}</p>
              </Bloque>
              <Bloque titulo="Tus encuestas aplicadas" icono="fa-clock-rotate-left">
                {corridas.length === 0 ? (
                  <p style={{ margin: 0, color: T.text3 }}>Todavía no aplicas ninguna. Ve a «Aplica la encuesta».</p>
                ) : (
                  corridas
                    .slice(-6)
                    .reverse()
                    .map((c) => (
                      <p key={c.id} style={{ margin: 0, color: T.text2 }}>
                        <strong style={{ color: c.veredicto === "confiable" ? OK : c.veredicto === "sesgada" ? ORO : NO }}>#{c.id} · {c.sesgo} pts.</strong>{" "}
                        {MUESTRAS.find((m) => m.id === c.muestra)?.etiqueta}, pregunta {PREGUNTAS.find((q) => q.id === c.pregunta)?.etiqueta.toLowerCase()}, {c.n} personas.
                      </p>
                    ))
                )}
              </Bloque>
              <Bloque titulo="Tu entrevista (A3)" icono="fa-microphone-lines">
                {PISTAS_ENTREVISTA.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-quote-left" style={{ color: T.text3, marginRight: 8 }} />
                    {p}
                  </p>
                ))}
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
              rgba={rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={(ok) => (ok ? sfxFin() : sonido && audioRef.current?.incorrecto())}
              playPick={() => sonido && audioRef.current?.blip()}
              mensajeAprobado="Ya sabes investigar lo que lee tu comunidad."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Tipos de texto y soportes (A4)" icono="fa-shapes">
                {[...TIPOS.map((t) => TIPO_INFO[t]), ...SOPORTES.map((s) => SOPORTE_INFO[s])].map((i) => (
                  <p key={i.label} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{i.label}.</strong> {i.definicion} <em>{i.ejemplo}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Hechos de la progresión (A5)" icono="fa-circle-check">
                {HECHOS.map((h, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: h.respuesta ? OK : ORO }}>{h.respuesta ? "VERDADERO" : "FALSO"}.</strong>{" "}
                    <span style={{ color: T.text }}>{h.enunciado}</span> {h.retroalimentacion}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato nacional" icono="fa-chart-pie">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_MOLEC}</p>
              </Bloque>
              <Bloque titulo="Sobre el español" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{CALLOUT_A1}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ENCUESTA_LECTORA_FICHA} accent={accent} rgba={rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Nota" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text3 }}>{NOTA_PIE}</p>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Modo 0 — «Aplica la encuesta»: el simulador
 * ═══════════════════════════════════════════════════════════════════════ */
function FotoMuestra({ foto, icono }: { foto: string; icono: string }) {
  const [rota, setRota] = useState(false);
  return (
    <span className="enl-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!rota && <img src={`${RUTA_FOTOS}/${foto}.webp`} alt="" loading="lazy" onError={() => setRota(true)} />}
    </span>
  );
}

function PanelAplica({
  accent,
  muestra,
  setMuestra,
  pregunta,
  setPregunta,
  tamano,
  setTamano,
  corrida,
  desactualizada,
  onAplicar,
}: {
  accent: string;
  muestra: Muestra;
  setMuestra: (m: Muestra) => void;
  pregunta: Pregunta;
  setPregunta: (p: Pregunta) => void;
  tamano: number;
  setTamano: (n: number) => void;
  corrida: Corrida | null;
  desactualizada: boolean;
  onAplicar: () => void;
}) {
  const preguntaActual = PREGUNTAS.find((p) => p.id === pregunta)!;
  return (
    <>
      <div className="enl-paso">
        <div className="enl-paso-t">
          <span className="enl-num">1</span> ¿A quién le preguntas? <em>Prepa Valle Claro (escuela ficticia)</em>
        </div>
        <div className="enl-opciones" role="radiogroup" aria-label="Muestra">
          {MUESTRAS.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={muestra === m.id} className="enl-muestra" data-on={muestra === m.id} onClick={() => setMuestra(m.id)}>
              <FotoMuestra foto={m.foto} icono={m.icono} />
              <strong>{m.etiqueta}</strong>
              <span>{m.detalle}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="enl-paso">
        <div className="enl-paso-t">
          <span className="enl-num">2</span> ¿Cómo preguntas?
        </div>
        <div className="enl-chips" role="radiogroup" aria-label="Pregunta">
          {PREGUNTAS.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={pregunta === p.id} className="enl-op" data-on={pregunta === p.id} onClick={() => setPregunta(p.id)} style={pregunta === p.id ? { background: accent, borderColor: accent, color: "#04121f" } : undefined}>
              <i className={`fa-solid ${p.icono}`} /> {p.etiqueta}
            </button>
          ))}
        </div>
        <div className="enl-cita">«{preguntaActual.texto}»</div>
      </div>

      <div className="enl-paso">
        <div className="enl-paso-t">
          <span className="enl-num">3</span> ¿A cuántas personas?
        </div>
        <Deslizador label="Tamaño de la muestra" icon="fa-users" colr={accent} valor={`${tamano} personas`} min={10} max={200} step={10} value={tamano} onChange={setTamano} hintL="10" hintR="200" />
      </div>

      <button type="button" className="enl-aplicar" onClick={onAplicar} style={{ background: accent }}>
        <i className={`fa-solid ${corrida && !desactualizada ? "fa-dice" : "fa-paper-plane"}`} />
        {corrida && !desactualizada ? "Aplicar otra vez (les toca a otras personas)" : "Aplicar la encuesta"}
      </button>

      {corrida && (
        <div className="enl-resultado" data-viejo={desactualizada}>
          <div className="enl-paso-t">
            <i className="fa-solid fa-chart-column" style={{ color: accent }} /> Resultado de la encuesta #{corrida.id} <em>simulación</em>
          </div>
          {desactualizada && (
            <div className="enl-aviso-viejo">
              <i className="fa-solid fa-rotate" /> Cambiaste el diseño: aplica de nuevo para ver cómo cambian las barras.
            </div>
          )}
          <GraficaSim c={corrida} accent={accent} />
          <div className="enl-leyenda">
            <span><i className="enl-sw" style={{ background: accent }} /> Tu encuesta</span>
            <span><i className="enl-sw enl-sw-real" /> Lo que pasa en la escuela</span>
          </div>
          <Medidor sesgo={corrida.sesgo} />
          <div className="enl-porque">
            {explicaCorrida(corrida).map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Medidor({ sesgo }: { sesgo: number }) {
  const pos = Math.min(100, (sesgo / 30) * 100);
  const v = sesgo <= 6 ? "confiable" : sesgo <= 14 ? "sesgada" : "enganosa";
  const col = v === "confiable" ? OK : v === "sesgada" ? ORO : NO;
  return (
    <div className="enl-medidor">
      <div className="enl-med-t">
        <span>Sesgo: qué tanto se aleja tu encuesta de la escuela</span>
        <strong style={{ color: col }}>
          {sesgo} pts · {etiquetaVeredicto(v)}
        </strong>
      </div>
      <div className="enl-med-barra" role="img" aria-label={`Sesgo ${sesgo} puntos`}>
        <span style={{ width: "20%", background: OK }} />
        <span style={{ width: "26.7%", background: ORO }} />
        <span style={{ width: "53.3%", background: NO }} />
        <i style={{ left: `${pos}%` }} />
      </div>
    </div>
  );
}

function GraficaSim({ c, accent }: { c: Corrida; accent: string }) {
  const grupos: { k: string; label: string; tu: number | null; real: number; col: string }[] = [
    { k: "gusto", label: "Por gusto", tu: c.gusto, real: VERDAD.gusto, col: accent },
    ...TIPOS.map((t) => ({ k: t, label: TIPO_INFO[t].corto, tu: c.tipo ? c.tipo[t] : null, real: VERDAD.tipo[t], col: TIPO_INFO[t].color })),
  ];
  const BASE = 180;
  const alto = (v: number) => (v / 100) * 150;
  return (
    <svg viewBox="0 0 360 214" role="img" aria-label="Barras: tu encuesta frente a la escuela" className="enl-svg">
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1="0" x2="360" y1={BASE - alto(v)} y2={BASE - alto(v)} stroke="rgba(255,255,255,0.12)" strokeDasharray={v === 0 ? undefined : "3 4"} />
        </g>
      ))}
      {grupos.map((g, i) => {
        const gx = i * 90;
        return (
          <g key={g.k}>
            {g.tu !== null ? (
              <>
                <rect className="enl-rect" x={gx + 8} width={34} y={BASE - alto(g.tu)} height={alto(g.tu)} rx={4} fill={g.col} />
                <text x={gx + 25} y={BASE - alto(g.tu) - 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">
                  {g.tu}%
                </text>
              </>
            ) : (
              <text x={gx + 25} y={BASE - 8} textAnchor="middle" fontSize="14" fontWeight="800" fill={NO}>
                sin dato
              </text>
            )}
            <rect className="enl-rect" x={gx + 46} width={34} y={BASE - alto(g.real)} height={alto(g.real)} rx={4} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeDasharray="4 3" />
            <text x={gx + 63} y={BASE - alto(g.real) - 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="rgba(255,255,255,0.75)">
              {g.real}%
            </text>
            <text x={gx + 45} y={204} textAnchor="middle" fontSize="14" fontWeight="800" fill="rgba(255,255,255,0.85)">
              {g.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function css(accent: string, rgba: string): string {
  return `
  @keyframes enlShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes enlPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .enl-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:10px 16px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .enl-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .enl-btn:disabled { opacity:.45; cursor:default; }
  .enl-btn[data-si="true"]:hover { border-color:${OK}; background:${OK}18; }
  .enl-btn[data-no="true"]:hover { border-color:${ORO}; background:${ORO}18; }

  .enl-ficha { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glassSoft}; padding:15px 17px; transition:all .16s; }
  .enl-ficha[data-shake="true"] { animation:enlShake .4s; border-color:${NO}; }
  .enl-ficha[data-ok="true"] { border-color:${OK}55; background:${OK}10; }
  .enl-ficha[data-out="true"] { border-color:${ORO}55; background:${ORO}0e; }
  .enl-ficha[data-done="true"] { animation:enlPop .25s ease; }

  .enl-op { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:999px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .enl-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; transform:translateY(-1px); }
  .enl-op:disabled { cursor:default; }
  .enl-op[data-on="true"] { color:#04121f; }
  .enl-fila[data-shake="true"] { animation:enlShake .4s; }

  .enl-graf { position:relative; }
  .enl-barra { height:26px; border-radius:0 8px 8px 0; transition:width .45s cubic-bezier(.4,0,.2,1); min-width:2px; }
  .enl-rejilla { position:absolute; top:0; bottom:0; width:1px; background:${T.line}; }

  .enl-opt { cursor:pointer; display:flex; align-items:center; gap:12px; width:100%; text-align:left;
    border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
    font-size:15px; font-weight:600; padding:11px 14px; transition:all .14s; }
  .enl-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
  .enl-opt:disabled { cursor:default; }
  .enl-opt[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
  .enl-opt[data-bad="true"] { border-color:${NO}; background:${NO}1c; color:#fff; }
  .enl-bullet { flex-shrink:0; width:28px; height:28px; border-radius:8px; display:flex; align-items:center;
    justify-content:center; font-size:14px; font-weight:900; border:1px solid ${T.line}; color:${T.text3}; }
  .enl-divider { height:1px; background:${T.line}; margin:16px 0; }
  .enl-badge { display:inline-flex; align-items:center; gap:7px; padding:4px 10px; border-radius:999px;
    font-size:14px; font-weight:800; letter-spacing:.02em; }

  /* Simulador */
  .enl-paso { display:grid; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glassSoft}; min-width:0; }
  .enl-paso-t { font-size:15px; font-weight:900; color:${T.text}; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .enl-paso-t em { font-style:normal; font-size:14px; font-weight:700; color:${T.text3}; }
  .enl-num { width:26px; height:26px; border-radius:50%; background:rgba(${rgba},0.25); border:1px solid ${accent}; display:inline-flex;
    align-items:center; justify-content:center; font-size:14px; font-weight:900; color:#fff; }
  .enl-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:10px; }
  .enl-muestra { cursor:pointer; display:grid; gap:6px; align-content:start; text-align:left; padding:8px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; transition:all .14s; min-width:0; }
  .enl-muestra strong { color:${T.text}; font-size:14px; line-height:1.25; }
  .enl-muestra span { line-height:1.3; }
  .enl-muestra:hover { border-color:${T.lineStrong}; }
  .enl-muestra[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 16px -6px ${accent}; }
  .enl-foto { position:relative; display:flex; align-items:center; justify-content:center; aspect-ratio:16/9; border-radius:10px; overflow:hidden;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); color:rgba(255,255,255,0.55); font-size:26px; }
  .enl-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .enl-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .enl-cita { padding:10px 14px; border-radius:12px; background:${T.inset}; border:1px dashed ${T.line}; font-size:15px; font-style:italic; color:${T.text}; }
  .enl-aplicar { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:10px; padding:14px 18px; border-radius:14px;
    border:none; color:#04121f; font-size:16px; font-weight:900; }
  .enl-aplicar:hover { filter:brightness(1.08); }
  .enl-resultado { display:grid; gap:12px; padding:14px; border-radius:16px; border:1px solid rgba(${rgba},0.4); background:rgba(${rgba},0.07); min-width:0; }
  .enl-resultado[data-viejo="true"] .enl-svg { opacity:.45; }
  .enl-aviso-viejo { padding:8px 12px; border-radius:10px; background:${ORO}1c; border:1px solid ${ORO}66; color:${ORO}; font-size:14px; font-weight:700; }
  .enl-svg { width:100%; height:auto; display:block; }
  .enl-rect { transition:y .45s cubic-bezier(.4,0,.2,1), height .45s cubic-bezier(.4,0,.2,1); }
  .enl-leyenda { display:flex; flex-wrap:wrap; gap:6px 18px; font-size:14px; color:${T.text2}; }
  .enl-sw { display:inline-block; width:14px; height:14px; border-radius:4px; margin-right:7px; vertical-align:-2px; }
  .enl-sw-real { background:rgba(255,255,255,0.12); border:1.5px dashed rgba(255,255,255,0.7); }
  .enl-medidor { display:grid; gap:8px; }
  .enl-med-t { display:flex; justify-content:space-between; gap:8px 14px; flex-wrap:wrap; font-size:14px; color:${T.text2}; }
  .enl-med-t strong { font-size:15px; font-weight:900; }
  .enl-med-barra { position:relative; display:flex; height:14px; border-radius:999px; overflow:visible; }
  .enl-med-barra span { height:100%; opacity:.75; }
  .enl-med-barra span:first-child { border-radius:999px 0 0 999px; }
  .enl-med-barra span:nth-child(3) { border-radius:0 999px 999px 0; }
  .enl-med-barra i { position:absolute; top:-5px; width:6px; height:24px; margin-left:-3px; border-radius:3px; background:#fff; box-shadow:0 0 8px rgba(0,0,0,.6);
    transition:left .45s cubic-bezier(.4,0,.2,1); }
  .enl-porque p { margin:0 0 6px; font-size:15px; line-height:1.5; color:${T.text2}; }

  @media (prefers-reduced-motion: reduce){
    .enl-ficha[data-shake="true"], .enl-fila[data-shake="true"], .enl-ficha[data-done="true"] { animation:none; }
    .enl-op:hover:not(:disabled) { transform:none; }
    .enl-barra, .enl-rect, .enl-med-barra i { transition:none; }
  }
  `;
}


/* ═══════════════════════════════════════════════════════════════════════
 * Modo 1 — «Arma la encuesta»
 * ═══════════════════════════════════════════════════════════════════════ */
function PanelEncuesta({
  accent,
  rgba,
  decididas,
  sacude,
  incluidas,
  onDecidir,
}: {
  accent: string;
  rgba: string;
  decididas: Record<string, "incluir" | "descartar">;
  sacude: string | null;
  incluidas: number;
  onDecidir: (c: PreguntaCandidata, d: "incluir" | "descartar") => void;
}) {
  const resueltas = Object.keys(decididas).length;
  const listo = resueltas >= CANDIDATAS.length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
            Decide qué preguntas entran a tu cuestionario
          </Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: listo ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {resueltas}/{CANDIDATAS.length} decididas · {incluidas}/{CANDIDATAS_UTILES} incluidas
          </span>
        </div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginTop: 4 }}>
          Vas a preguntar a gente de tu escuela qué lee, cuándo y para qué. Estas doce preguntas llegaron al borrador; seis sirven y seis tienen un
          defecto. Decide una por una: si aciertas, la tarjeta se queda con la explicación.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CANDIDATAS.map((c) => {
          const dec = decididas[c.id];
          const dentro = dec === "incluir";
          const fuera = dec === "descartar";
          return (
            <div key={c.id} className="enl-ficha" data-shake={sacude === c.id} data-ok={dentro} data-out={fuera} data-done={Boolean(dec)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <i
                  className={`fa-solid ${dentro ? "fa-circle-check" : fuera ? "fa-circle-minus" : "fa-comment-dots"}`}
                  style={{ color: dentro ? OK : fuera ? ORO : T.text3, fontSize: 16, marginTop: 2 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>«{c.texto}»</div>

                  {!dec && (
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      <button className="enl-btn" data-si="true" onClick={() => onDecidir(c, "incluir")}>
                        <i className="fa-solid fa-plus" /> Incluir en la encuesta
                      </button>
                      <button className="enl-btn" data-no="true" onClick={() => onDecidir(c, "descartar")}>
                        <i className="fa-solid fa-xmark" /> Descartar
                      </button>
                    </div>
                  )}

                  {sacude === c.id && (
                    <div role="status" style={{ marginTop: 10, fontSize: 14, color: NO, lineHeight: 1.5 }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
                      Todavía no. Vuelve a leerla: ¿le sugiere a la persona qué contestar?, ¿significa lo mismo para todos?, ¿pregunta una sola
                      cosa?, ¿sirve para saber qué lee?
                    </div>
                  )}

                  {dec && (
                    <div style={{ marginTop: 10 }}>
                      <span
                        className="enl-badge"
                        style={{
                          background: dentro ? `${OK}1e` : `${ORO}1e`,
                          color: dentro ? OK : ORO,
                          border: `1px solid ${dentro ? OK : ORO}44`,
                        }}
                      >
                        <i className={`fa-solid ${dentro ? "fa-check" : "fa-ban"}`} />
                        {dentro ? "Entra al cuestionario" : `Descartada · ${c.defecto ?? "con defecto"}`}
                      </span>
                      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginTop: 8 }}>{c.porque}</div>
                      {c.arreglo && (
                        <div style={{ fontSize: 14, color: accent, lineHeight: 1.55, marginTop: 6 }}>
                          <i className="fa-solid fa-wrench" style={{ marginRight: 7 }} />
                          {c.arreglo}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {listo && (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${OK}55`,
            background: `${OK}12`,
            padding: "16px 18px",
            fontSize: 14,
            color: T.text,
            lineHeight: 1.55,
          }}
        >
          <i className="fa-solid fa-clipboard-check" style={{ color: OK, marginRight: 9 }} />
          Tu cuestionario quedó con {incluidas} preguntas. Con ese instrumento ya puedes salir a preguntar: pasa a{" "}
          <strong style={{ color: `rgb(${rgba})` }}>«Levanta los datos»</strong> para trabajar lo que contestaron nueve personas de la escuela.
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Gráfica de frecuencias (compartida por los modos 2 y 3)
 * ═══════════════════════════════════════════════════════════════════════ */
function Grafica({
  conteoTipo,
  conteoSoporte,
  tabuladas,
  compacta,
}: {
  conteoTipo: Record<TipoTexto, number>;
  conteoSoporte: Record<Soporte, number>;
  tabuladas: number;
  compacta?: boolean;
}) {
  const filas: { key: string; label: string; color: string; icono: string; valor: number }[] = [
    ...TIPOS.map((t) => ({ key: `t-${t}`, label: TIPO_INFO[t].corto, color: TIPO_INFO[t].color, icono: TIPO_INFO[t].icono, valor: conteoTipo[t] })),
    ...SOPORTES.map((s) => ({
      key: `s-${s}`,
      label: SOPORTE_INFO[s].corto,
      color: SOPORTE_INFO[s].color,
      icono: SOPORTE_INFO[s].icono,
      valor: conteoSoporte[s],
    })),
  ];

  const bloque = (titulo: string, desde: number, hasta: number) => (
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, textTransform: "uppercase", marginBottom: 9 }}>
        {titulo}
      </div>
      <div className="enl-graf" style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
        {/* Rejilla del eje: se dibuja EXACTAMENTE sobre la pista de las barras
            (de 114px por la izquierda a 34px por la derecha), para que la marca
            del 4 caiga donde termina una barra que vale 4. */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 114, right: 35, pointerEvents: "none" }} aria-hidden>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="enl-rejilla" style={{ left: `${(n / EJE_MAX) * 100}%` }} />
          ))}
        </div>
        {filas.slice(desde, hasta).map((f) => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <div
              style={{
                width: 104,
                flexShrink: 0,
                fontSize: 14,
                fontWeight: 700,
                color: T.text2,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <i className={`fa-solid ${f.icono}`} style={{ color: f.color, fontSize: 14 }} />
              {f.label}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="enl-barra"
                style={{
                  width: `${(f.valor / EJE_MAX) * 100}%`,
                  background: `linear-gradient(90deg, ${f.color}dd 0%, ${f.color}77 100%)`,
                  boxShadow: f.valor > 0 ? `0 0 18px -8px ${f.color}` : "none",
                }}
                role="img"
                aria-label={`${f.label}: ${f.valor} personas`}
              />
            </div>
            <span
              style={{
                width: 25,
                flexShrink: 0,
                textAlign: "right",
                fontSize: 14,
                fontWeight: 800,
                color: f.valor > 0 ? f.color : T.text3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {f.valor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ ...card, padding: compacta ? "16px 20px" : "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <Eyebrow>
          <i className="fa-solid fa-chart-simple" style={{ marginRight: 8 }} />
          Resultados de tu encuesta · {tabuladas} de {PERSONAS.length} personas tabuladas
        </Eyebrow>
        <span style={{ fontSize: 14, color: T.text3 }}>Eje horizontal: número de personas (0 a {EJE_MAX})</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {bloque("Tipo de texto que más lee", 0, 3)}
        {bloque("Soporte donde lo lee", 3, 6)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Modo 2 — «Levanta los datos»
 * ═══════════════════════════════════════════════════════════════════════ */
function PanelCampo({
  accent,
  rgba,
  codificado,
  sacudePersona,
  conteoTipo,
  conteoSoporte,
  tabuladas,
  onMarcar,
}: {
  accent: string;
  rgba: string;
  codificado: Record<string, Codificacion>;
  sacudePersona: string | null;
  conteoTipo: Record<TipoTexto, number>;
  conteoSoporte: Record<Soporte, number>;
  tabuladas: number;
  onMarcar: (p: PersonaEncuestada, campo: "tipo" | "soporte", valor: TipoTexto | Soporte) => void;
}) {
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>
          <i className="fa-solid fa-users" style={{ marginRight: 8, color: accent }} />
          Nueve personas de la escuela ya contestaron
        </Eyebrow>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
          Contestaron con sus propias palabras, así que todavía no se pueden contar. Tu trabajo es{" "}
          <strong style={{ color: `rgb(${rgba})` }}>codificar</strong> cada respuesta: decidir qué tipo de texto es y en qué soporte lo lee. Cada
          acierto mueve una barra de la gráfica.
        </div>
      </div>

      <Grafica conteoTipo={conteoTipo} conteoSoporte={conteoSoporte} tabuladas={tabuladas} compacta />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PERSONAS.map((p) => {
          const c = codificado[p.id] ?? {};
          const listo = Boolean(c.tipo && c.soporte);
          return (
            <div key={p.id} className="enl-ficha" data-ok={listo} data-done={listo}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: 11,
                    background: `rgba(${rgba},0.16)`,
                    border: `1px solid rgba(${rgba},0.3)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: accent,
                    fontSize: 15,
                  }}
                >
                  <i className={`fa-solid ${p.icono}`} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{p.nombre}</span>
                    <span style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>{p.rol}</span>
                    {listo && (
                      <span className="enl-badge" style={{ background: `${OK}1e`, color: OK, border: `1px solid ${OK}44`, marginLeft: "auto" }}>
                        <i className="fa-solid fa-check" /> Tabulada
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginTop: 6, fontStyle: "italic" }}>«{p.respuesta}»</div>

                  {/* fila tipo */}
                  <div className="enl-fila" data-shake={sacudePersona === `${p.id}-tipo`} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 11 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase", width: 74 }}>
                      Tipo
                    </span>
                    {TIPOS.map((t) => {
                      const on = c.tipo === t;
                      const info = TIPO_INFO[t];
                      return (
                        <button
                          key={t}
                          className="enl-op"
                          data-on={on}
                          disabled={Boolean(c.tipo)}
                          onClick={() => onMarcar(p, "tipo", t)}
                          title={info.definicion}
                          style={on ? { background: info.color, borderColor: info.color, color: "#04121f" } : undefined}
                        >
                          <i className={`fa-solid ${info.icono}`} />
                          {info.corto}
                        </button>
                      );
                    })}
                  </div>

                  {/* fila soporte */}
                  <div className="enl-fila" data-shake={sacudePersona === `${p.id}-soporte`} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase", width: 74 }}>
                      Soporte
                    </span>
                    {SOPORTES.map((s) => {
                      const on = c.soporte === s;
                      const info = SOPORTE_INFO[s];
                      return (
                        <button
                          key={s}
                          className="enl-op"
                          data-on={on}
                          disabled={Boolean(c.soporte)}
                          onClick={() => onMarcar(p, "soporte", s)}
                          title={info.ejemplo}
                          style={on ? { background: info.color, borderColor: info.color, color: "#04121f" } : undefined}
                        >
                          <i className={`fa-solid ${info.icono}`} />
                          {info.corto}
                        </button>
                      );
                    })}
                  </div>

                  {listo && <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, marginTop: 9 }}>{p.porque}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tabuladas >= PERSONAS.length && (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${OK}55`,
            background: `${OK}12`,
            padding: "16px 18px",
            fontSize: 14,
            color: T.text,
            lineHeight: 1.55,
          }}
        >
          <i className="fa-solid fa-table-list" style={{ color: OK, marginRight: 9 }} />
          Tabla completa: nueve respuestas abiertas convertidas en datos contables. Ahora pasa a{" "}
          <strong style={{ color: `rgb(${rgba})` }}>«Lee la gráfica»</strong> e interpreta lo que produjiste.
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Modo 3 — «Lee la gráfica»
 * ═══════════════════════════════════════════════════════════════════════ */
function PanelGrafica({
  accent,
  rgba,
  listo,
  tabuladas,
  conteoTipo,
  conteoSoporte,
  respG,
  gIdx,
  onResponder,
  onIr,
  onIrACampo,
}: {
  accent: string;
  rgba: string;
  listo: boolean;
  tabuladas: number;
  conteoTipo: Record<TipoTexto, number>;
  conteoSoporte: Record<Soporte, number>;
  respG: (number | null)[];
  gIdx: number;
  onResponder: (i: number) => void;
  onIr: (i: number) => void;
  onIrACampo: () => void;
}) {
  const q = LECTURA_GRAFICA[gIdx];
  const dada = respG[gIdx] ?? null;
  const contestadas = respG.filter((r) => r !== null).length;
  const aciertos = respG.reduce<number>((acc, r, i) => acc + (r !== null && r === LECTURA_GRAFICA[i]?.correcta ? 1 : 0), 0);

  return (
    <>
      <Grafica conteoTipo={conteoTipo} conteoSoporte={conteoSoporte} tabuladas={tabuladas} />

      {!listo ? (
        <div style={{ ...card, padding: "22px 24px", textAlign: "center" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: ORO, fontSize: 22 }} />
          <div style={{ fontSize: 14, color: T.text, fontWeight: 800, marginTop: 10 }}>La gráfica todavía está incompleta</div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginTop: 7, maxWidth: 520, marginInline: "auto" }}>
            Llevas {tabuladas} de {PERSONAS.length} respuestas codificadas. Interpretar una gráfica a medias es justo el error que se busca evitar:
            termina de levantar los datos y regresa.
          </div>
          <button className="enl-btn" onClick={onIrACampo} style={{ marginTop: 14 }}>
            <i className="fa-solid fa-users" /> Ir a «Levanta los datos»
          </button>
        </div>
      ) : (
        <div style={{ ...card, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              Interpreta tus resultados
            </Eyebrow>
            <span style={{ fontSize: 14, fontWeight: 800, color: contestadas >= LECTURA_GRAFICA.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
              {contestadas}/{LECTURA_GRAFICA.length} contestadas · {aciertos} correctas
            </span>
          </div>

          {/* navegación entre preguntas */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
            {LECTURA_GRAFICA.map((_, i) => {
              const r = respG[i];
              const ok = r !== null && r === LECTURA_GRAFICA[i]?.correcta;
              const mal = r !== null && !ok;
              return (
                <button
                  key={i}
                  className="enl-op"
                  data-on={gIdx === i}
                  onClick={() => onIr(i)}
                  aria-label={`Pregunta ${i + 1}`}
                  style={
                    gIdx === i
                      ? { background: accent, borderColor: accent, color: "#04121f" }
                      : ok
                        ? { borderColor: `${OK}88`, color: OK }
                        : mal
                          ? { borderColor: `${NO}88`, color: NO }
                          : undefined
                  }
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {q && (
            <>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, lineHeight: 1.45, marginBottom: 12 }}>
                <span style={{ color: accent }}>{gIdx + 1}.</span> {q.enunciado}
              </div>
              <div role="radiogroup" aria-label={q.enunciado} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.opciones.map((op, j) => {
                  const esCorrecta = dada !== null && j === q.correcta;
                  const esFallo = dada !== null && dada === j && j !== q.correcta;
                  return (
                    <button
                      key={j}
                      className="enl-opt"
                      role="radio"
                      aria-checked={dada === j}
                      data-ok={esCorrecta}
                      data-bad={esFallo}
                      disabled={dada !== null}
                      onClick={() => onResponder(j)}
                    >
                      <span className="enl-bullet">{String.fromCharCode(65 + j)}</span>
                      <span style={{ flex: 1 }}>{op}</span>
                      {esCorrecta && <i className="fa-solid fa-circle-check" style={{ color: OK }} />}
                      {esFallo && <i className="fa-solid fa-circle-xmark" style={{ color: NO }} />}
                    </button>
                  );
                })}
              </div>

              {dada !== null && (
                <div
                  role="status"
                  style={{
                    marginTop: 13,
                    borderRadius: 12,
                    border: `1px solid ${T.line}`,
                    background: T.inset,
                    padding: "12px 15px",
                    fontSize: 14,
                    color: T.text2,
                    lineHeight: 1.55,
                  }}
                >
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
                  {q.explica}
                </div>
              )}

              {dada !== null && gIdx < LECTURA_GRAFICA.length - 1 && (
                <button className="enl-btn" onClick={() => onIr(gIdx + 1)} style={{ marginTop: 14 }}>
                  Siguiente pregunta <i className="fa-solid fa-arrow-right" />
                </button>
              )}
            </>
          )}

          {contestadas >= LECTURA_GRAFICA.length && (
            <div
              style={{
                marginTop: 16,
                borderRadius: 14,
                border: `1px solid ${OK}55`,
                background: `${OK}12`,
                padding: "14px 16px",
                fontSize: 14,
                color: T.text,
                lineHeight: 1.55,
              }}
            >
              <i className="fa-solid fa-flag-checkered" style={{ color: OK, marginRight: 9 }} />
              Cerraste el ciclo de la investigación: preguntaste, registraste, contaste e interpretaste. Lo que sigue es tuyo:{" "}
              <span style={{ color: `rgb(${rgba})` }}>entrevista de verdad a alguien de tu comunidad</span> y compara sus respuestas con esta tabla.
            </div>
          )}
        </div>
      )}
    </>
  );
}
