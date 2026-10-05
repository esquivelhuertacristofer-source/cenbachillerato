"use client";

/**
 * Laboratorio — Leer en voz alta
 * Práctica experimental para LC-I-P07 (Lengua y Comunicación I, semestre 1):
 * «Practica la lectura en voz alta de algunos textos para luego emitir
 * opiniones al respecto.»
 *
 * El problema honesto de este tema: la lectura en voz alta ocurre FUERA de la
 * pantalla. Este laboratorio no graba al alumno ni juzga su voz —no puede, y
 * fingir que sí sería mentirle—. Lo que sí es manipulable y evaluable es todo
 * lo que se decide ANTES y DESPUÉS de leer:
 *
 *  1. «Marca la partitura» — sobre tres textos reales, colocar dónde va la
 *     pausa breve, la pausa larga, el énfasis y el cambio de entonación, y ver
 *     por qué la puntuación o el sentido lo piden justo ahí.
 *  2. «Ajusta el ritmo» — decidir la velocidad (palabras por minuto) y la
 *     duración de las pausas de cuatro fragmentos según a quién van dirigidos,
 *     con la duración estimada en pantalla y un botón para oír la diferencia.
 *  3. «Juzga la lectura» — seis lecturas ajenas descritas por escrito:
 *     diagnosticar qué elemento falló y elegir la opinión FUNDAMENTADA, que es
 *     literalmente lo que pide el propósito de la progresión.
 *  4. «Escribe el término» — el glosario verbatim de A5, tecleado de memoria.
 *  5. «Completa el texto» — los huecos verbatim de A6.
 *  + Reto evaluable con el quiz verbatim de A2.
 *
 * El apoyo de voz sale de `lab-voz.ts`, con `es-MX-DaliaNeural` —la voz de la
 * plataforma— grabada de antemano, y cae al sintetizador del navegador si una
 * frase no tuviera clip. Es APOYO, no evaluación: sirve para comparar dos
 * maneras de leer el mismo texto. Se pide solo en manejadores y se calla al
 * desmontar.
 *
 * DOM puro (sin three.js): aquí el fenómeno es el texto y la voz; una escena
 * 3D sería decoración. Contenido verbatim de LC-I·P07 (ver la nota al pie).
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, NUM } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Deslizador } from "./_shell";
import { OyenteEscena, OndaLectura, MelodiaPartitura, FotoLectura } from "./LecturaOyente";
import { hablarLab, callarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { LECTURA_VOZ_ALTA_HUECOS } from "./lectura-voz-alta-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LECTURA_VOZ_ALTA_FICHA } from "./lectura-voz-alta-ficha";
import {
  TEXTOS,
  PUNTOS_TOTALES,
  MARCAS,
  MARCA_INFO,
  lecturaDe,
  lecturaCorridaDe,
  FRAGMENTOS,
  PPM_BASE,
  PPM_MIN,
  PPM_MAX,
  PAUSA_MIN,
  PAUSA_MAX,
  palabrasDe,
  duracionEstimada,
  LECTURAS,
  ELEMENTOS,
  ELEMENTO_INFO,
  PARES,
  ACTIVIDAD_FINAL_A5,
  QUIZ,
  HECHOS,
  DEBATE_A7,
  PISTAS_A3,
  CRITERIOS_A3,
  PREGUNTAS_A1,
  DATO_PAZ,
  FUENTE,
  type Marca,
  type PuntoTexto,
  type Elemento,
} from "./lectura-voz-alta-data";
import { VinetaTermino } from "./_vineta";
import { oyente } from "./lectura-voz-alta-sim";

const NO = "#FF5E5E";
const RETO_KEY = "cen-lectura-en-voz-alta-reto";

type Modo = "partitura" | "ritmo" | "juicio" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "partitura", label: "Marca la partitura", icono: "fa-highlighter" },
  { id: "ritmo", label: "Ajusta el ritmo", icono: "fa-gauge-high" },
  { id: "juicio", label: "Juzga la lectura", icono: "fa-user-check" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/* ── Apoyo de voz ──────────────────────────────────────────────────────── */
/**
 * ÉSTE ES EL ÚNICO LABORATORIO EN ESPAÑOL de los que tienen botón de voz: lo
 * que se oye aquí son los textos de LC-I·P07, no inglés. Su voz es por tanto
 * `es-MX-DaliaNeural`, la de la plataforma —la misma de los 211 videos y de la
 * narración de las lecturas— y no la locutora inglesa de los otros 17.
 *
 * El `rate` NO es decoración: el modo «Ajusta el ritmo» existe justamente para
 * oír la diferencia entre 110 y 190 palabras por minuto, y «Escuchar de
 * corrido» va deprisa a propósito para que se note qué se pierde sin
 * puntuación. `hablarLab` lo aplica al clip con `playbackRate`.
 */
const hablar = (texto: string, rate: number) => hablarLab(texto, { idioma: "es", rate });
const callarVoz = callarLab;

/** Etiqueta honesta de la velocidad: orienta sin dar la respuesta. */
function zonaDe(ppm: number): string {
  if (ppm < 110) return "muy pausado";
  if (ppm < 140) return "pausado";
  if (ppm < 170) return "ágil";
  return "acelerado";
}

export function LabLecturaVozAlta({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("partitura");

  /* ── sonido y partida ─────────────────────────────────────────────────── */
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(
    () => () => {
      audioRef.current?.dispose();
      callarVoz();
    },
    []
  );
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

  /* ═══ MODO 1 · Marca la partitura ═════════════════════════════════════ */
  const [txtIdx, setTxtIdx] = useState(0);
  const [marca, setMarca] = useState<Marca>("pausaBreve");
  const [puestos, setPuestos] = useState<Record<string, true>>({});
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [falloPart, setFalloPart] = useState<{ marca: Marca; hayOtro: boolean; esFinal: boolean } | null>(null);
  const [shakeTok, setShakeTok] = useState<number | null>(null);

  const texto = TEXTOS[txtIdx]!;
  const puntoPorToken = useMemo(() => {
    const m = new Map<number, PuntoTexto>();
    for (const p of texto.puntos) m.set(p.token, p);
    return m;
  }, [texto]);

  const puestosDelTexto = texto.puntos.filter((p) => puestos[p.id]).length;
  const textoListo = puestosDelTexto >= texto.puntos.length;

  const clicToken = (i: number) => {
    const punto = puntoPorToken.get(i);
    if (punto && puestos[punto.id]) return;
    if (punto && punto.marca === marca) {
      setPuestos((prev) => ({ ...prev, [punto.id]: true }));
      setUltimo(punto.id);
      setFalloPart(null);
      sfxPlace();
      if (puestosDelTexto + 1 >= texto.puntos.length) sfxOk();
      return;
    }
    setFalloPart({ marca, hayOtro: !!punto, esFinal: i === texto.tokens.length - 1 });
    setUltimo(null);
    setShakeTok(i);
    sfxNo();
    window.setTimeout(() => setShakeTok(null), 420);
  };

  const resetPartitura = () => {
    const quitar = new Set(texto.puntos.map((p) => p.id));
    setPuestos((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !quitar.has(k))));
    setUltimo(null);
    setFalloPart(null);
  };

  const partituraDone = Object.keys(puestos).length >= PUNTOS_TOTALES;
  const puntoUltimo = ultimo ? texto.puntos.find((p) => p.id === ultimo) : undefined;

  /* ═══ MODO 2 · Ajusta el ritmo ════════════════════════════════════════ */
  const [fragIdx, setFragIdx] = useState(0);
  const [ppm, setPpm] = useState<Record<string, number>>({});
  const [pausa, setPausa] = useState<Record<string, number>>({});
  const [ritmoOk, setRitmoOk] = useState<Record<string, true>>({});
  const [avisoRitmo, setAvisoRitmo] = useState<string | null>(null);

  const frag = FRAGMENTOS[fragIdx]!;
  const ppmActual = ppm[frag.id] ?? frag.ppmInicial;
  const pausaActual = pausa[frag.id] ?? frag.pausaInicial;
  const fragListo = ritmoOk[frag.id] === true;
  const ritmoDone = FRAGMENTOS.every((f) => ritmoOk[f.id]);

  const comprobarRitmo = () => {
    if (fragListo) return;
    const vBien = ppmActual >= frag.ppmMin && ppmActual <= frag.ppmMax;
    const pBien = pausaActual >= frag.pausaMin && pausaActual <= frag.pausaMax;
    if (vBien && pBien) {
      setRitmoOk((prev) => ({ ...prev, [frag.id]: true }));
      setAvisoRitmo(null);
      sfxPlace();
      if (FRAGMENTOS.filter((f) => ritmoOk[f.id]).length + 1 >= FRAGMENTOS.length) sfxOk();
      return;
    }
    const partes: string[] = [];
    if (!vBien) partes.push(ppmActual < frag.ppmMin ? "vas demasiado lento para este texto" : "vas demasiado rápido para este texto");
    if (!pBien) partes.push(pausaActual < frag.pausaMin ? "tus silencios son demasiado cortos" : "tus silencios son demasiado largos");
    setAvisoRitmo(`Todavía no: ${partes.join(" y ")}. Relee para quién es esta lectura y vuelve a ajustar.`);
    sfxNo();
  };

  const [rapidoVisto, setRapidoVisto] = useState(false);
  const [lentoVisto, setLentoVisto] = useState(false);
  const cambiarPpm = (v: number) => {
    setPpm((prev) => ({ ...prev, [frag.id]: v }));
    if (v > frag.ppmMax + 20) setRapidoVisto(true);
    if (v < frag.ppmMin - 20) setLentoVisto(true);
  };
  const [oidoCorrido, setOidoCorrido] = useState(false);
  const [oidoPuntuado, setOidoPuntuado] = useState(false);

  const escucharFragmento = () => hablar(frag.texto, ppmActual / PPM_BASE);

  const resetRitmo = () => {
    setRapidoVisto(false);
    setLentoVisto(false);
    setPpm((prev) => ({ ...prev, [frag.id]: frag.ppmInicial }));
    setPausa((prev) => ({ ...prev, [frag.id]: frag.pausaInicial }));
    setRitmoOk((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== frag.id)));
    setAvisoRitmo(null);
    callarVoz();
  };

  /* ═══ MODO 3 · Juzga la lectura ═══════════════════════════════════════ */
  const [lecIdx, setLecIdx] = useState(0);
  const [diag, setDiag] = useState<Record<string, true>>({});
  const [opi, setOpi] = useState<Record<string, true>>({});
  const [opElegida, setOpElegida] = useState<Record<string, number>>({});
  const [avisoDiag, setAvisoDiag] = useState<string | null>(null);

  const lectura = LECTURAS[lecIdx]!;
  const diagListo = diag[lectura.id] === true;
  const opiListo = opi[lectura.id] === true;
  const diagDone = LECTURAS.every((l) => diag[l.id]);
  const opiDone = LECTURAS.every((l) => opi[l.id]);

  const elegirElemento = (e: Elemento) => {
    if (diagListo) return;
    if (e === lectura.elemento) {
      setDiag((prev) => ({ ...prev, [lectura.id]: true }));
      setAvisoDiag(null);
      sfxPlace();
      return;
    }
    setAvisoDiag(
      `«${ELEMENTO_INFO[e].titulo}» no es lo que falló aquí. ${ELEMENTO_INFO[e].pista} Vuelve a la descripción y busca qué fue lo que el oyente sí notó.`
    );
    sfxNo();
  };

  const elegirOpinion = (j: number) => {
    if (opiListo) return;
    const op = lectura.opciones[j];
    if (!op) return;
    setOpElegida((prev) => ({ ...prev, [lectura.id]: j }));
    if (op.ok) {
      setOpi((prev) => ({ ...prev, [lectura.id]: true }));
      sfxPlace();
      if (LECTURAS.filter((l) => opi[l.id]).length + 1 >= LECTURAS.length) sfxOk();
      return;
    }
    sfxNo();
  };

  const resetJuicio = () => {
    setDiag((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== lectura.id)));
    setOpi((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== lectura.id)));
    setOpElegida((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== lectura.id)));
    setAvisoDiag(null);
  };

  /* ═══ MODO 4 · Escribe el término ═════════════════════════════════════ */
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  /* ═══ MODO 5 · Completa el texto ══════════════════════════════════════ */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos de la sesión ───────────────────────────────────────────── */
  const todoHecho = partituraDone && ritmoDone && diagDone && opiDone && glosarioDone && textoDone;
  const objetivos = [
    { txt: "Escucha la lectura de corrido y con puntuación", done: oidoCorrido && oidoPuntuado },
    { txt: "Lee muy rápido y muy lento y mira a la oyente", done: rapidoVisto && lentoVisto },
    { txt: `Marca los ${TEXTOS[0]!.puntos.length} puntos de la nota informativa`, done: TEXTOS[0]!.puntos.every((p) => !!puestos[p.id]) },
    { txt: `Marca los ${TEXTOS[1]!.puntos.length} puntos del texto literario`, done: TEXTOS[1]!.puntos.every((p) => !!puestos[p.id]) },
    { txt: `Marca los ${TEXTOS[2]!.puntos.length} puntos del relato con diálogo`, done: TEXTOS[2]!.puntos.every((p) => !!puestos[p.id]) },
    { txt: `Ajusta el ritmo de los ${FRAGMENTOS.length} fragmentos`, done: ritmoDone },
    { txt: `Diagnostica las ${LECTURAS.length} lecturas ajenas`, done: diagDone },
    { txt: `Emite las ${LECTURAS.length} opiniones fundamentadas`, done: opiDone },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto con los cuatro elementos", done: textoDone },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  const resetActual = modo === "partitura" ? resetPartitura : modo === "ritmo" ? resetRitmo : modo === "juicio" ? resetJuicio : modo === "glosario" ? resetGlosario : resetTexto;

  const consejo: ReactNode =
    modo === "partitura" ? (
      <>
        La puntuación es la partitura: la <strong style={{ color: T.text }}>coma</strong> pide silencio corto, el <strong style={{ color: T.text }}>punto</strong>{" "}
        y los <strong style={{ color: T.text }}>dos puntos</strong> piden respiración, y los signos de interrogación y exclamación piden que el tono se mueva. El
        énfasis no lo marca ningún signo: lo decides tú, en la palabra que trae lo nuevo.
      </>
    ) : modo === "ritmo" ? (
      <>
        No hay una velocidad «correcta» para todo: hay una adecuada <strong style={{ color: T.text }}>para este texto y para quien lo escucha</strong>. Mira
        qué hace la oyente cuando cambias el ritmo. Los intervalos son orientativos, no una norma.
      </>
    ) : modo === "juicio" ? (
      <>
        Una opinión fundamentada tiene tres piezas: <strong style={{ color: T.text }}>qué se escuchó</strong>,{" "}
        <strong style={{ color: T.text }}>qué elemento explica eso</strong> y <strong style={{ color: T.text }}>qué efecto tuvo</strong> en quien escucha. Sin
        las tres, es un «me gustó» con más palabras.
      </>
    ) : modo === "glosario" ? (
      <>Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>
    ) : (
      <>Aquí se escribe. El botón de pista te da la definición y el banco de palabras te deja tocar el término en vez de teclearlo.</>
    );

  const lecturaVivo =
    modo === "ritmo"
      ? `Oyente: ${oyente(frag, ppmActual, pausaActual).total} % de comprensión`
      : modo === "partitura"
        ? `Marcas: ${puestosDelTexto} de ${texto.puntos.length}`
        : modo === "juicio"
          ? `Lecturas diagnosticadas: ${Object.keys(diag).length} de ${LECTURAS.length}`
          : undefined;

  const duracion = duracionEstimada(frag, ppmActual, pausaActual);

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
          <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lecturaVivo}
      objetivos={objetivos}
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-pen-ruler",
          contenido: (
            <>
              <Bloque titulo="Qué practicas aquí" icono="fa-lightbulb">
                <div style={{ color: T.text2, lineHeight: 1.55 }}>{consejo}</div>
              </Bloque>
              <Bloque titulo="¿Sabías?" icono="fa-circle-info">
                <div style={{ color: T.text2, lineHeight: 1.55 }}>{DATO_PAZ}</div>
              </Bloque>
              <Bloque titulo="Tarea fuera de la pantalla" icono="fa-microphone-lines">
                <div style={{ color: T.text2, lineHeight: 1.55 }}>{ACTIVIDAD_FINAL_A5}</div>
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
              mensajeAprobado="Sabes qué hace cada elemento de la voz y qué convierte un comentario en una opinión fundamentada."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Ficha teórica" icono="fa-book-open">
                <FichaTeorica data={LECTURA_VOZ_ALTA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16, marginTop: 20 }}>
                <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-check-double" style={{ marginRight: 8, color: accent }} />
            Hechos
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HECHOS.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 11 }}>
                <i className={`fa-solid ${h.verdadero ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: h.verdadero ? OK : NO, fontSize: 14, marginTop: 3, flexShrink: 0 }} />
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                  <div style={{ color: T.text }}>{h.enunciado}</div>
                  <div style={{ color: T.text3, marginTop: 3 }}>{h.retro}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
            Debate de la progresión
          </Eyebrow>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1.5, marginBottom: 14 }}>{DEBATE_A7.tema}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {DEBATE_A7.posturas.map((p, i) => (
              <div key={i} style={{ borderRadius: 13, border: `1px solid ${T.line}`, background: T.inset, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.5 }}>{p.postura}</div>
                <ul style={{ margin: "8px 0 0", paddingLeft: 17, fontSize: 14, color: T.text3, lineHeight: 1.55 }}>
                  {p.argumentos.map((a, j) => (
                    <li key={j}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 14, color: T.text3, marginTop: 12, lineHeight: 1.5 }}>
            Las dos posturas son defendibles: {DEBATE_A7.reglas.join(" ")}
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
            Comprensión de la lectura
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {PREGUNTAS_A1.map((p, i) => (
              <div key={i}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1.5 }}>{p.pregunta}</div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, marginTop: 4 }}>{p.respuesta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* criterios y preguntas de A3: con qué se juzga una lectura */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
            Criterios para opinar
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
            {CRITERIOS_A3.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <div className="lva-divider" />
          <Eyebrow>
            <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
            Preguntas para prepararte
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
            {PISTAS_A3.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
              </div>
              <Bloque titulo="Qué es verbatim y qué es ilustrativo" icono="fa-quote-right">
                <div style={{ color: T.text3, lineHeight: 1.6 }}>
                  <span>
          Son <strong>verbatim</strong> de la progresión LC-I-P07: la lectura y el «¿sabías que?» de A1 con sus preguntas de comprensión, el quiz evaluable de
          A2, las pistas y los criterios de A3, los hechos de A4, el glosario de A5 con sus ejemplos, el texto con huecos de A6 y el debate de A7. Los{" "}
          <strong>tres textos que se marcan</strong>, los <strong>cuatro fragmentos de ritmo</strong> y las <strong>seis lecturas ajenas</strong> los escribí
          para esta práctica, porque la progresión pide «textos de su elección» y no trae ninguno: son <strong>ilustrativos</strong>, y los nombres de quienes
          leen son ficticios a propósito, para no atribuir a nadie real una lectura. Los intervalos de velocidad y de pausa son{" "}
          <strong>orientativos</strong>: parten de que una lectura en voz alta para público suele moverse alrededor de 120–150 palabras por minuto, más despacio
          que una conversación, y se mueven desde ahí según el texto; no son una norma y se pueden discutir. Sí son verificables los datos externos: la primera
          línea del Metro de la Ciudad de México se inauguró en 1969 y Octavio Paz recibió el Premio Nobel de Literatura en 1990. La descripción de la
          entonación —ascendente en las preguntas que se responden con sí o no, descendente en las que empiezan con «qué» o «cuántas»— es la descripción
          estándar de la prosodia del español. <strong>Este laboratorio no graba ni califica tu voz</strong>: el botón «Escuchar» usa el sintetizador del
          navegador y sirve para comparar dos maneras de leer. Fuente: {FUENTE}.
        </span>
                </div>
              </Bloque>
            </>
          ),
        },
      ]}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <style>{`
        @keyframes lvaShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes lvaPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .lva-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .lva-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .lva-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .lva-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .lva-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .lva-icobtn:hover { background:rgba(255,255,255,0.12); }

        /* Selector de texto / fragmento / lectura */
        .lva-doc { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .lva-doc:hover { border-color:${T.lineStrong}; color:#fff; }
        .lva-doc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .lva-doc[data-done="true"] { color:${OK}; border-color:${OK}66; }

        /* Los cuatro marcadores de voz */
        .lva-marca { cursor:pointer; flex:1; min-width:min(100%, 168px); text-align:left; padding:12px 14px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; transition:all .15s; }
        .lva-marca:hover { border-color:${T.lineStrong}; }
        .lva-marca[data-on="true"] { color:#fff; }

        /* La partitura */
        .lva-parrafo { font-size:16px; line-height:2.3; color:${T.text}; margin:0; }
        .lva-tok { cursor:pointer; display:inline-block; border-radius:6px; padding:1px 3px;
          border-bottom:2px dashed rgba(255,255,255,0.16); transition:background .14s, border-color .14s, color .14s; }
        .lva-tok:hover { background:rgba(255,255,255,0.10); border-bottom-color:rgba(255,255,255,0.45); }
        .lva-tok:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .lva-tok[data-done="true"] { cursor:default; border-bottom-style:solid; font-weight:800; }
        .lva-tok[data-done="true"]:hover { background:inherit; }
        .lva-tok[data-shake="true"] { animation:lvaShake .4s; background:${NO}22; border-bottom-color:${NO}; }
        .lva-sil { display:inline-block; font-weight:900; font-size:17px; margin:0 2px; animation:lvaPop .25s ease; }
        .lva-flecha { display:inline-block; font-weight:900; font-size:14px; margin-left:2px; vertical-align:super; animation:lvaPop .25s ease; }

        /* Controles de ritmo */
        .lva-slider { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:99px;
          background:linear-gradient(90deg, rgba(${color.rgba},0.55), rgba(255,255,255,0.14)); outline:none; cursor:pointer; }
        .lva-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:${accent}; border:2px solid #04121f; box-shadow:0 0 14px -3px ${accent}; cursor:grab; }
        .lva-slider::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:${accent}; border:2px solid #04121f; cursor:grab; }
        .lva-gauge { position:relative; height:12px; border-radius:99px; background:${T.inset}; border:1px solid ${T.line}; overflow:hidden; }
        .lva-gauge-zona { position:absolute; top:0; bottom:0; background:${OK}44; border-left:1px solid ${OK}; border-right:1px solid ${OK}; }
        .lva-gauge-aguja { position:absolute; top:-4px; bottom:-4px; width:3px; border-radius:2px; background:${accent}; box-shadow:0 0 10px ${accent}; }

        /* Opciones de opinión y elementos */
        .lva-elem { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:10px 14px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .lva-elem:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .lva-elem:disabled { cursor:default; }
        .lva-op { cursor:pointer; display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left; padding:13px 15px;
          border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:14px; font-weight:600; line-height:1.5; transition:all .14s; }
        .lva-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .lva-op:disabled { cursor:default; }

        .lva-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .lva-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .lva-btn:disabled { opacity:.45; cursor:default; }
        .lva-btn[data-primary="true"] { background:${accent}; color:#04121f; border-color:${accent}; }
        .lva-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){
          .lva-tok[data-shake="true"] { animation:none; }
          .lva-sil, .lva-flecha { animation:none; }
        }

        /* Oyente y onda */
        .lva-oyente { display:flex; gap:14px; align-items:center; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; padding:12px; }
        .lva-medidor { height:12px; border-radius:99px; background:rgba(255,255,255,0.12); overflow:hidden; }
        .lva-medidor > div { height:100%; transition:width .3s, background .3s; }

      `}</style>
          {/* MODO 1 — marca la partitura */}
          {modo === "partitura" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {TEXTOS.map((t, i) => {
                  const listo = t.puntos.every((p) => !!puestos[p.id]);
                  return (
                    <button
                      key={t.id}
                      className="lva-doc"
                      data-on={txtIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setTxtIdx(i);
                        setUltimo(null);
                        setFalloPart(null);
                        callarVoz();
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : t.icono}`} />
                      {t.genero}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {MARCAS.map((m) => {
                  const info = MARCA_INFO[m];
                  const on = marca === m;
                  return (
                    <button
                      key={m}
                      className="lva-marca"
                      data-on={on}
                      aria-pressed={on}
                      onClick={() => setMarca(m)}
                      style={on ? { borderColor: info.color, background: `${info.color}1f`, boxShadow: `0 0 18px -7px ${info.color}` } : undefined}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 900, color: on ? "#fff" : info.color }}>
                        <i className={`fa-solid ${info.icono}`} />
                        {info.titulo}
                        <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 900, color: info.color }}>{info.simbolo}</span>
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.45, marginTop: 5, color: on ? T.text2 : T.text3 }}>{info.descripcion}</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ ...card, padding: "20px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <VinetaTermino termino={texto.titulo} color={accent} icono={texto.icono} tam={33} radio={9} />
                    <span style={{ fontSize: 16, fontWeight: 900 }}>{texto.titulo}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{texto.genero}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: textoListo ? OK : T.text3, ...NUM }}>
                    {puestosDelTexto}/{texto.puntos.length} marcas
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>{texto.intencion}</div>

                <p className="lva-parrafo">
                  {texto.tokens.map((tok, i) => {
                    const punto = puntoPorToken.get(i);
                    const colocado = punto && puestos[punto.id] ? punto : undefined;
                    const info = colocado ? MARCA_INFO[colocado.marca] : null;
                    const esPausa = colocado ? colocado.marca === "pausaBreve" || colocado.marca === "pausaLarga" : false;
                    return (
                      <span key={i}>
                        <span
                          className="lva-tok"
                          role="button"
                          tabIndex={colocado ? -1 : 0}
                          aria-label={colocado ? `${tok} — ${info!.titulo}` : tok}
                          data-done={!!colocado}
                          data-shake={shakeTok === i}
                          onClick={() => clicToken(i)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              clicToken(i);
                            }
                          }}
                          style={
                            colocado && !esPausa
                              ? { background: `${info!.color}2e`, borderBottomColor: info!.color, color: "#fff" }
                              : colocado
                                ? { borderBottomColor: info!.color }
                                : undefined
                          }
                        >
                          {tok}
                        </span>
                        {colocado && esPausa && (
                          <span className="lva-sil" style={{ color: info!.color }}>
                            {info!.simbolo}
                          </span>
                        )}
                        {colocado && colocado.marca === "entonacion" && (
                          <span className="lva-flecha" style={{ color: info!.color }}>
                            {colocado.direccion === "baja" ? "↘" : "↗"}
                          </span>
                        )}{" "}
                      </span>
                    );
                  })}
                </p>

                {puntoUltimo && (
                  <div
                    style={{
                      marginTop: 18,
                      borderRadius: 13,
                      border: `1px solid ${MARCA_INFO[puntoUltimo.marca].color}66`,
                      background: `${MARCA_INFO[puntoUltimo.marca].color}14`,
                      padding: "13px 16px",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <i className={`fa-solid ${MARCA_INFO[puntoUltimo.marca].icono}`} style={{ color: MARCA_INFO[puntoUltimo.marca].color, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                      <strong style={{ color: "#fff" }}>{MARCA_INFO[puntoUltimo.marca].titulo} en «{texto.tokens[puntoUltimo.token]}».</strong> {puntoUltimo.razon}
                    </div>
                  </div>
                )}

                {falloPart && (
                  <div style={{ marginTop: 18, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                      {falloPart.hayOtro ? (
                        <>
                          <strong style={{ color: "#fff" }}>Aquí sí pasa algo, pero no es «{MARCA_INFO[falloPart.marca].titulo.toLowerCase()}».</strong> Mira el
                          signo que acompaña a esa palabra y prueba con otro marcador.
                        </>
                      ) : falloPart.esFinal ? (
                        <>
                          <strong style={{ color: "#fff" }}>Es el final del texto.</strong> La pausa de cierre se da por hecha: no hace falta marcarla, porque
                          después ya no viene nada que el oyente tenga que separar.
                        </>
                      ) : (
                        <>
                          <strong style={{ color: "#fff" }}>Ahí no va nada.</strong> {MARCA_INFO[falloPart.marca].errorGenerico}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {textoListo && (
                  <div style={{ marginTop: 18, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                      Partitura completa. Ahora léela tú en voz alta respetando tus marcas: eso es lo que el laboratorio no puede hacer por ti.
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
                  <FotoLectura clave="lectura-publico" icono="fa-book-open-reader" alto={88} />
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>Cómo suena tu lectura: sin marcas es una línea monótona</div>
                  <MelodiaPartitura tokens={texto.tokens} puntos={texto.puntos} puestos={puestos} />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <button className="lva-btn" onClick={() => { setOidoCorrido(true); hablar(lecturaCorridaDe(texto), 1.3); }} title="Sin puntuación y deprisa">
                    <i className="fa-solid fa-forward" />
                    Escuchar de corrido
                  </button>
                  <button className="lva-btn" data-primary onClick={() => { setOidoPuntuado(true); hablar(lecturaDe(texto), 0.9); }} title="Con su puntuación y a ritmo de lectura">
                    <i className="fa-solid fa-volume-high" />
                    Escuchar con la puntuación
                  </button>
                  <button className="lva-btn" onClick={callarVoz} title="Detener la voz">
                    <i className="fa-solid fa-volume-xmark" />
                    Detener
                  </button>
                </div>
                <div style={{ fontSize: 14, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
                  La voz es la del navegador y sirve para comparar, no para calificarte. Si tu equipo no tiene voz en español, los botones no sonarán: el resto
                  del laboratorio funciona igual.
                </div>
              </div>
            </>
          )}

          {/* MODO 2 — ajusta el ritmo */}
          {modo === "ritmo" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {FRAGMENTOS.map((f, i) => (
                  <button
                    key={f.id}
                    className="lva-doc"
                    data-on={fragIdx === i}
                    data-done={ritmoOk[f.id] === true}
                    onClick={() => {
                      setFragIdx(i);
                      setAvisoRitmo(null);
                      callarVoz();
                    }}
                  >
                    <i className={`fa-solid ${ritmoOk[f.id] ? "fa-circle-check" : f.icono}`} />
                    {f.titulo}
                  </button>
                ))}
              </div>

              <div style={{ ...card, padding: "20px 24px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
                  {f2(frag.genero)}
                </Eyebrow>
                <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.8, color: T.text }}>{frag.texto}</p>
                <div style={{ borderRadius: 12, border: `1px solid rgba(${color.rgba},0.28)`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px", display: "flex", gap: 11 }}>
                  <i className="fa-solid fa-user-group" style={{ color: accent, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{frag.proposito}</span>
                </div>

                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  <FotoLectura clave="oyente-aula" icono="fa-ear-listen" alto={96} />
                  <OyenteEscena frag={frag} ppm={ppmActual} pausa={pausaActual} />
                  <OndaLectura frag={frag} ppm={ppmActual} pausa={pausaActual} />
                  <div style={{ fontSize: 14, color: T.text3 }}>Barras = palabras, huecos dorados = silencios. Oyente ficticia y cifras de simulación.</div>
                </div>

                <div className="lva-divider" />

                <div style={{ display: "grid", gap: 4 }}>
                  <Deslizador
                    label="Velocidad de lectura"
                    icon="fa-gauge-high"
                    colr="#5BC8FF"
                    valor={`${ppmActual} ppm · ${zonaDe(ppmActual)}`}
                    min={PPM_MIN}
                    max={PPM_MAX}
                    step={5}
                    value={ppmActual}
                    onChange={cambiarPpm}
                    hintL={`${PPM_MIN} · muy pausado`}
                    hintR={`acelerado · ${PPM_MAX}`}
                  />
                  <Deslizador
                    label="Duración de cada pausa fuerte"
                    icon="fa-pause"
                    colr="#FFC75A"
                    valor={`${pausaActual.toFixed(1)} s`}
                    min={PAUSA_MIN}
                    max={PAUSA_MAX}
                    step={0.1}
                    value={pausaActual}
                    onChange={(v) => setPausa((prev) => ({ ...prev, [frag.id]: v }))}
                  />
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 18, fontSize: 14, color: T.text2 }}>
                  <span>
                    <strong style={{ color: T.text, ...NUM }}>{palabrasDe(frag.texto)}</strong> palabras
                  </span>
                  <span>·</span>
                  <span>
                    <strong style={{ color: T.text, ...NUM }}>{frag.pausas}</strong> pausas fuertes
                  </span>
                  <span>·</span>
                  <span>
                    duración estimada{" "}
                    <strong style={{ color: accent, ...NUM }}>
                      {Math.floor(duracion / 60) > 0 ? `${Math.floor(duracion / 60)} min ` : ""}
                      {(duracion % 60).toFixed(1)} s
                    </strong>
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <button className="lva-btn" onClick={escucharFragmento} title="Oír el fragmento a esa velocidad">
                    <i className="fa-solid fa-volume-high" />
                    Escuchar a {ppmActual} ppm
                  </button>
                  <button className="lva-btn" onClick={callarVoz} title="Detener la voz">
                    <i className="fa-solid fa-volume-xmark" />
                    Detener
                  </button>
                  <button className="lva-btn" data-primary onClick={comprobarRitmo} disabled={fragListo}>
                    <i className="fa-solid fa-circle-check" />
                    Comprobar el ajuste
                  </button>
                </div>

                {avisoRitmo && !fragListo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{avisoRitmo}</div>
                  </div>
                )}

                {fragListo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                      <strong style={{ color: "#fff" }}>
                        Intervalo orientativo: {frag.ppmMin}–{frag.ppmMax} palabras/min y pausas de {frag.pausaMin.toFixed(1)}–{frag.pausaMax.toFixed(1)} s.
                      </strong>{" "}
                      {frag.razon}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO 3 — juzga la lectura */}
          {modo === "juicio" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {LECTURAS.map((l, i) => {
                  const listo = diag[l.id] === true && opi[l.id] === true;
                  return (
                    <button
                      key={l.id}
                      className="lva-doc"
                      data-on={lecIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setLecIdx(i);
                        setAvisoDiag(null);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-user"}`} />
                      {l.lector}
                    </button>
                  );
                })}
              </div>

              <div style={{ ...card, padding: "20px 24px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-ear-listen" style={{ marginRight: 8, color: accent }} />
                  Paso 1 · ¿Qué elemento falló?
                </Eyebrow>
                <div style={{ fontSize: 14, color: T.text3, marginBottom: 12 }}>{lectura.contexto}</div>
                <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.75, color: T.text }}>{lectura.descripcion}</p>

                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {ELEMENTOS.map((e) => {
                    const info = ELEMENTO_INFO[e];
                    const acertado = diagListo && e === lectura.elemento;
                    return (
                      <button
                        key={e}
                        className="lva-elem"
                        disabled={diagListo}
                        onClick={() => elegirElemento(e)}
                        style={acertado ? { borderColor: OK, background: `${OK}1c`, color: "#fff" } : undefined}
                      >
                        <i className={`fa-solid ${info.icono}`} style={{ color: acertado ? OK : info.color }} />
                        {info.titulo}
                      </button>
                    );
                  })}
                </div>

                {avisoDiag && !diagListo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{avisoDiag}</div>
                  </div>
                )}

                {diagListo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                      <strong style={{ color: "#fff" }}>{ELEMENTO_INFO[lectura.elemento].titulo}. </strong>
                      {lectura.porQue}
                    </div>
                  </div>
                )}

                <div className="lva-divider" />

                <Eyebrow>
                  <i className="fa-solid fa-comment-dots" style={{ marginRight: 8, color: accent }} />
                  Paso 2 · ¿Cuál de las tres opiniones está fundamentada?
                </Eyebrow>
                {!diagListo && <div style={{ fontSize: 14, color: T.text3, marginBottom: 12 }}>Primero diagnostica el elemento: sin eso, la opinión no tiene en qué apoyarse.</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: diagListo ? 1 : 0.45 }}>
                  {lectura.opciones.map((op, j) => {
                    const elegida = opElegida[lectura.id] === j;
                    // Resuelto el caso, se explican las TRES: saber por qué las otras
                    // dos no están fundamentadas enseña tanto como acertar.
                    const mostrar = elegida || opiListo;
                    const buena = opiListo && op.ok;
                    return (
                      <div key={j}>
                        <button
                          className="lva-op"
                          disabled={!diagListo || opiListo}
                          onClick={() => elegirOpinion(j)}
                          style={
                            buena
                              ? { borderColor: OK, background: `${OK}16`, color: "#fff" }
                              : elegida && !op.ok
                                ? { borderColor: NO, background: `${NO}12`, color: "#fff" }
                                : undefined
                          }
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 900,
                              border: `1px solid ${T.line}`,
                              color: T.text3,
                            }}
                          >
                            {String.fromCharCode(65 + j)}
                          </span>
                          <span style={{ flex: 1 }}>{op.txt}</span>
                        </button>
                        {mostrar && (
                          <div
                            style={{
                              marginTop: 7,
                              marginLeft: 14,
                              fontSize: 14,
                              color: T.text2,
                              lineHeight: 1.55,
                              borderLeft: `2px solid ${op.ok ? OK : NO}`,
                              paddingLeft: 12,
                            }}
                          >
                            {op.porQue}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* MODO 4 — escribe el término */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y su ejemplo y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {/* MODO 5 — completa el texto */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={LECTURA_VOZ_ALTA_HUECOS}
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
        </div>
      }
    />
  );
}

/** Primera letra en mayúscula, para los encabezados de género. */
function f2(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
