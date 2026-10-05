"use client";

/**
 * Laboratorio — Leer y escribir: un diálogo.
 * Práctica interactiva para LC-I-P01 (Lengua y Comunicación I, 1.er semestre):
 * «Reflexiona sobre los vínculos entre la escritura y la lectura para dar
 * sentido a la necesidad humana por comunicar información, ideas, pensamientos
 * u opiniones.»
 *
 * Por qué NO es un laboratorio 3D: el fenómeno de esta progresión no es un
 * objeto en el espacio, es una SECUENCIA —leer alimenta lo que escribes y lo
 * escrito cambia cómo vuelves a leer—. Eso se representa con el tiempo y con el
 * texto, no con geometría; una escena tridimensional aquí sería decoración.
 * DOM puro: ligero, accesible con ratón, teclado y pantalla táctil.
 *
 * Seis modos (el primero, un SIMULADOR: comentas el borrador de una autora ficticia
 * y ella lo reescribe), y varios piden piden PRODUCIR, no reconocer:
 *  0. «Dialoga con la autora» — comenta una frase de su borrador; si nombras lo que
 *     le falta, ella la reescribe y un lector nuevo entiende más (barras SVG).
 *  1. «El circuito del sentido» — reconstruye paso a paso tres situaciones
 *     reales (una carta vecinal, un diario, una exposición) y ve cómo se
 *     alternan leer y escribir hasta cerrar la vuelta.
 *  2. «¿Qué hace este texto?» — clasifica doce textos según la función que la
 *     lectura A1 les atribuye: imaginar, activar la crítica, procesar
 *     emociones o transformar la realidad.
 *  3. «Escribe el término» — el glosario A5, escrito de memoria.
 *  4. «Completa el texto» — los huecos verbatim de A6.
 *  5. «Tu cuaderno» — la reflexión escrita A3, con contador de palabras y
 *     detección del vocabulario del tema.
 *  + Reto evaluable (A2), hechos verdadero/falso (A4) y la mesa de debate (A7),
 *    los tres verbatim.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto, normaliza } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { LECTURA_ESCRITURA_HUECOS } from "./lectura-escritura-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { LabShell, Bloque, BotonHerramienta, Dato, Mesa } from "./_shell";
import { VinetaTermino } from "./_vineta";
import { FRASES, COMENTARIOS, DIMENSIONES, AUTORA, calidad, promedio, veredictoLector, respuestaAutora, type Comentario, type Dimension } from "./lectura-escritura-dialogo";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LECTURA_ESCRITURA_FICHA } from "./lectura-escritura-ficha";
import {
  CIRCUITOS,
  ACTO_INFO,
  TEXTOS,
  FUNCION_INFO,
  GLOSARIO,
  CUADERNO,
  RAICES_TEMA,
  DEBATE,
  HECHOS,
  RETO_QUIZ,
  DATO_LENGUAS,
  COMPRENSION_A1,
  type Funcion,
} from "./lectura-escritura-data";
const NO = "#FF5E5E";
const RETO_KEY = "cen-lectura-escritura-dialogo-reto";
const RUTA_FOTOS = "/media/labs-sim/lectura-escritura-dialogo";

type Modo = "dialogo" | "circuito" | "funciones" | "glosario" | "texto" | "cuaderno";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "dialogo", label: "Dialoga con la autora", icono: "fa-comments" },
  { id: "circuito", label: "El circuito del sentido", icono: "fa-rotate" },
  { id: "funciones", label: "¿Qué hace este texto?", icono: "fa-layer-group" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
  { id: "cuaderno", label: "Tu cuaderno", icono: "fa-pen-nib" },
];

/** Palabras de verdad: se ignoran los espacios de sobra y los saltos de línea. */
function cuentaPalabras(s: string): number {
  const limpio = s.trim();
  return limpio === "" ? 0 : limpio.split(/\s+/).length;
}

/** Etiquetas del vocabulario del tema que aparecen en un escrito. */
function vocabularioUsado(s: string): string[] {
  const t = normaliza(s);
  if (!t) return [];
  return RAICES_TEMA.filter((g) => g.raices.some((r) => t.includes(r))).map((g) => g.etiqueta);
}

interface Intercambio {
  n: number;
  frase: string;
  comentario: Comentario;
  ok: boolean;
  texto: string;
}

export function LabLecturaEscritura({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("dialogo");

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

  /** El pie del laboratorio: la última explicación, siempre a la vista. */
  const [pie, setPie] = useState<{ ok: boolean; txt: string } | null>(null);

  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = (txt?: string) => {
    partida.error();
    if (txt) setPie({ ok: false, txt });
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = (txt?: string) => {
    partida.acierto();
    if (txt) setPie({ ok: true, txt });
    return sonido && audioRef.current?.blip();
  };

  // ── modo 0: dialoga con la autora (simulador) ─────────────────────────
  const [fraseSel, setFraseSel] = useState<string | null>(null);
  const [revisadas, setRevisadas] = useState<Record<string, boolean>>({});
  const [conversa, setConversa] = useState<Intercambio[]>([]);
  const nRevisadas = Object.keys(revisadas).length;
  const dims = calidad(revisadas);
  const total = promedio(dims);

  const comentar = (c: Comentario) => {
    const f = FRASES.find((x) => x.id === fraseSel);
    if (!f) return;
    const r = respuestaAutora(f, c, Boolean(revisadas[f.id]));
    setConversa((prev) => [...prev, { n: prev.length + 1, frase: f.id, comentario: c, ok: r.ok, texto: r.texto }]);
    if (r.ok) {
      const sig = { ...revisadas, [f.id]: true };
      setRevisadas(sig);
      partida.acierto();
      if (sonido) audioRef.current?.blip();
      if (Object.keys(sig).length >= FRASES.length && sonido) audioRef.current?.correcto();
      const libre = FRASES.find((x) => !sig[x.id]);
      setFraseSel(libre ? libre.id : null);
    } else {
      partida.error();
      if (sonido) audioRef.current?.incorrecto();
    }
  };
  const resetDialogo = () => {
    setFraseSel(null);
    setRevisadas({});
    setConversa([]);
  };

  // ── modo 1: el circuito del sentido ───────────────────────────────────
  const [circIdx, setCircIdx] = useState(0);
  const [colocados, setColocados] = useState<Record<string, string[]>>({});
  const [armados, setArmados] = useState<string[]>([]);
  const [selPaso, setSelPaso] = useState<string | null>(null);
  const [shakePaso, setShakePaso] = useState(false);

  const circuito = CIRCUITOS[circIdx]!;
  const ordenActual = colocados[circuito.id] ?? [];
  const pasosLibres = circuito.pasos
    .filter((p) => !ordenActual.includes(p.id))
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarPaso = (pasoId: string) => {
    if (ordenActual.includes(pasoId)) return;
    const siguiente = circuito.pasos[ordenActual.length];
    if (siguiente && siguiente.id === pasoId) {
      const nuevoOrden = [...ordenActual, pasoId];
      setColocados((c) => ({ ...c, [circuito.id]: nuevoOrden }));
      setSelPaso(null);
      sfxPlace(siguiente.porque);
      if (nuevoOrden.length >= circuito.pasos.length) {
        if (!armados.includes(circuito.id)) setArmados((a) => [...a, circuito.id]);
        setPie({ ok: true, txt: circuito.cierre });
        sfxOk();
      }
    } else {
      setShakePaso(true);
      const esperado = circuito.pasos[ordenActual.length];
      sfxNo(
        esperado
          ? `Todavía no. Piensa qué tiene que pasar ANTES: ¿de dónde sale lo que se escribe o se lee en este momento de la situación?`
          : "Ese paso no va aquí."
      );
      window.setTimeout(() => setShakePaso(false), 420);
    }
  };
  const resetCircuito = () => {
    setColocados((c) => ({ ...c, [circuito.id]: [] }));
    setSelPaso(null);
    setPie(null);
  };

  // ── modo 2: ¿qué hace este texto? ─────────────────────────────────────
  const [ubicTexto, setUbicTexto] = useState<Record<string, Funcion>>({});
  const [selTexto, setSelTexto] = useState<string | null>(null);
  const [shakeFun, setShakeFun] = useState<Funcion | null>(null);
  const textosLibres = TEXTOS.filter((t) => !ubicTexto[t.id]);

  const intentarFuncion = (textoId: string, fun: Funcion) => {
    if (ubicTexto[textoId]) return;
    const t = TEXTOS.find((x) => x.id === textoId);
    if (!t) return;
    if (t.funcion === fun) {
      setUbicTexto((u) => ({ ...u, [textoId]: fun }));
      setSelTexto(null);
      sfxPlace(t.porque);
      if (Object.keys(ubicTexto).length + 1 >= TEXTOS.length) sfxOk();
    } else {
      setShakeFun(fun);
      sfxNo(
        `Ahí no: «${FUNCION_INFO[fun].label}» es ${FUNCION_INFO[fun].descripcion.toLowerCase()}. Vuelve a leer el texto y pregúntate qué te pide hacer.`
      );
      window.setTimeout(() => setShakeFun(null), 420);
    }
  };
  const resetFunciones = () => {
    setUbicTexto({});
    setSelTexto(null);
    setPie(null);
  };

  // ── modo 3: escribe el término ────────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosarioIntento, setGlosarioIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosarioIntento((n) => n + 1);
    setPie(null);
  };

  // ── modo 4: completa el texto ─────────────────────────────────────────
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
    setPie(null);
  };

  // ── modo 5: tu cuaderno ───────────────────────────────────────────────
  const [cuaderno, setCuaderno] = useState("");
  const [autoevaluacion, setAutoevaluacion] = useState<boolean[]>(() => [false, false, false]);
  const palabras = cuentaPalabras(cuaderno);
  const vocab = vocabularioUsado(cuaderno);
  const cuadernoLargo = palabras >= CUADERNO.minimo;
  const cuadernoVocab = vocab.length >= 3;
  const resetCuaderno = () => {
    setCuaderno("");
    setAutoevaluacion([false, false, false]);
    setPie(null);
  };

  // ── hechos (A4) ───────────────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosResueltos = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length;
  const hechosDone = hechosResueltos >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxPlace(h.retro);
    else sfxNo(h.retro);
  };

  // ── debate (A7) ───────────────────────────────────────────────────────
  const [postura, setPostura] = useState<string | null>(null);
  const [argumento, setArgumento] = useState("");
  const [puntoValido, setPuntoValido] = useState<string | null>(null);
  const argumentoDone = postura !== null && cuentaPalabras(argumento) >= DEBATE.minimoPalabras;
  const debateCerrado = argumentoDone && puntoValido !== null;

  // ── reto evaluable (A2) ───────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const circuitosDone = armados.length >= CIRCUITOS.length;
  const funcionesDone = Object.keys(ubicTexto).length >= TEXTOS.length;

  const objetivos = [
    { txt: "Comenta una frase del borrador y mira cómo la autora la reescribe", done: nRevisadas >= 1 },
    { txt: "Lleva las 5 frases del borrador a su versión revisada", done: nRevisadas >= FRASES.length },
    { txt: "Arma los 3 circuitos del sentido", done: circuitosDone },
    { txt: "Clasifica los 12 textos por su función", done: funcionesDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
    { txt: "Completa el texto de la práctica social", done: textoDone },
    { txt: `Escribe tu reflexión (${CUADERNO.minimo} palabras o más)`, done: cuadernoLargo },
    { txt: "Usa 3 palabras del tema en tu reflexión", done: cuadernoVocab },
    { txt: "Acierta los 5 hechos verdadero o falso", done: hechosDone },
    { txt: "Toma postura y escribe tu argumento", done: argumentoDone },
    { txt: "Reconoce un punto válido de la otra postura", done: debateCerrado },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "dialogo"
      ? resetDialogo
      : modo === "circuito"
        ? resetCircuito
        : modo === "funciones"
          ? resetFunciones
          : modo === "glosario"
            ? resetGlosario
            : modo === "texto"
              ? resetTexto
              : resetCuaderno;

  const lectura =
    modo === "dialogo" ? (
      <>
        {nRevisadas}/{FRASES.length} frases revisadas · lector: {total}/100
      </>
    ) : modo === "circuito" ? (
      <>
        {ordenActual.length}/{circuito.pasos.length} pasos del circuito
      </>
    ) : modo === "funciones" ? (
      <>
        {Object.keys(ubicTexto).length}/{TEXTOS.length} textos clasificados
      </>
    ) : modo === "glosario" ? (
      <>Escribe cada término del glosario.</>
    ) : modo === "texto" ? (
      <>Completa el texto de la práctica.</>
    ) : (
      <>
        {palabras} palabras · mínimo {CUADERNO.minimo}
      </>
    );

  const pistaModo =
    modo === "dialogo" ? (
      <>
        Un buen comentario <strong style={{ color: T.text }}>nombra lo que le falta</strong> a la frase: no la alaba ni ataca a la autora.
      </>
    ) : modo === "circuito" ? (
      <>
        Un circuito se cierra cuando lo leído vuelve a la escritura y lo escrito cambia la lectura. Coloca los pasos en el orden en que{" "}
        <strong style={{ color: T.text }}>tendrían que ocurrir</strong>.
      </>
    ) : modo === "funciones" ? (
      <>
        Pregúntate qué te <strong style={{ color: T.text }}>pide hacer</strong> el texto: ¿imaginar, desconfiar y comprobar, entenderte, o mover algo en el
        mundo?
      </>
    ) : modo === "glosario" ? (
      <>
        Recordar el término enseña más que reconocerlo entre opciones. Si te atoras, usa la pista o el{" "}
        <strong style={{ color: T.text }}>banco de términos</strong>.
      </>
    ) : modo === "texto" ? (
      <>
        Lee el párrafo completo antes de escribir: el contexto decide la palabra. Pulsa <strong style={{ color: T.text }}>Enter</strong> para comprobar cada hueco.
      </>
    ) : (
      <>
        Aquí no hay respuesta correcta, hay texto tuyo: escribe al menos <strong style={{ color: T.text }}>{CUADERNO.minimo} palabras</strong> y usa el
        vocabulario del tema.
      </>
    );

  // arrastre nativo (ratón) + clic para seleccionar y clic para colocar (táctil)
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {modo === "dialogo" && (
            <DialogoPanel
              accent={accent}
              fraseSel={fraseSel}
              revisadas={revisadas}
              conversa={conversa}
              dims={dims}
              total={total}
              onSelFrase={(id) => setFraseSel((s) => (s === id ? null : id))}
              onComentar={comentar}
            />
          )}

          {modo === "circuito" && (
            <CircuitoPanel
              accent={accent}
              circuito={circuito}
              circIdx={circIdx}
              armados={armados}
              ordenActual={ordenActual}
              pasosLibres={pasosLibres}
              selPaso={selPaso}
              shakePaso={shakePaso}
              onSelCircuito={(i) => {
                setCircIdx(i);
                setSelPaso(null);
                setPie(null);
              }}
              onSelPaso={(id) => setSelPaso((p) => (p === id ? null : id))}
              onSlot={() => {
                if (selPaso) intentarPaso(selPaso);
              }}
              onDropSlot={(id) => intentarPaso(id)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "funciones" && (
            <FuncionesPanel
              accent={accent}
              ubicTexto={ubicTexto}
              selTexto={selTexto}
              shakeFun={shakeFun}
              textosLibres={textosLibres}
              onSelTexto={(id) => setSelTexto((s) => (s === id ? null : id))}
              onBin={(fun) => {
                if (selTexto) intentarFuncion(selTexto, fun);
              }}
              onDropBin={(id, fun) => intentarFuncion(id, fun)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Glosario de la progresión · LC-I-P01-A5
              </Eyebrow>
              <EscribeTermino
                key={glosarioIntento}
                pares={GLOSARIO}
                accent={accent}
                rgba={color.rgba}
                completado={glosarioDone}
                instrucciones="Lee la definición y su ejemplo, y escribe el término que le corresponde. Se ignoran acentos y mayúsculas."
                onCompletado={() => {
                  setGlosarioDone(true);
                  setPie({ ok: true, txt: "Completaste el glosario de memoria: esos cinco términos son los que sostienen toda la progresión." });
                  sfxOk();
                }}
                onAcierto={() => sfxPlace()}
                onError={() => sfxNo()}
              />
            </div>
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={LECTURA_ESCRITURA_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({ ok: true, txt: "Texto completo. Ese párrafo resume el vínculo: leer construye significado ajeno, escribir crea significado propio." });
                sfxOk();
              }}
              onAcierto={() => sfxPlace()}
              onError={() => sfxNo()}
            />
          )}

          {modo === "cuaderno" && (
            <CuadernoPanel
              accent={accent}
              rgba={color.rgba}
              valor={cuaderno}
              palabras={palabras}
              vocab={vocab}
              autoevaluacion={autoevaluacion}
              onEscribir={setCuaderno}
              onAuto={(i) => setAutoevaluacion((prev) => prev.map((v, j) => (j === i ? !v : v)))}
            />
          )}

          {/* Pie: la última explicación, siempre a la vista */}
          {modo !== "dialogo" && modo !== "cuaderno" && (
            <div
              role="status"
              aria-live="polite"
              style={{
                borderRadius: 14,
                border: `1px solid ${pie ? (pie.ok ? `${OK}55` : `${NO}55`) : T.line}`,
                background: pie ? (pie.ok ? `${OK}12` : `${NO}12`) : T.glass,
                padding: "13px 16px",
                fontSize: 15,
                lineHeight: 1.55,
                color: T.text2,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                transition: "all .2s",
              }}
            >
              <i
                className={`fa-solid ${pie ? (pie.ok ? "fa-circle-check" : "fa-circle-exclamation") : "fa-comment-dots"}`}
                style={{ color: pie ? (pie.ok ? OK : NO) : T.text3, fontSize: 15, marginTop: 2 }}
              />
              <span>{pie ? pie.txt : "Aquí aparecerá la explicación de cada movimiento: por qué ese paso va en ese lugar y qué hace cada texto."}</span>
            </div>
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
                  <Dato label="Frases revisadas" value={`${nRevisadas}/${FRASES.length}`} col={nRevisadas >= FRASES.length ? OK : undefined} />
                  <Dato label="Lector nuevo" value={`${total}/100`} col={total >= 70 ? OK : undefined} />
                  <Dato label="Circuitos" value={`${armados.length}/${CIRCUITOS.length}`} />
                  <Dato label="Textos" value={`${Object.keys(ubicTexto).length}/${TEXTOS.length}`} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{pistaModo}</p>
              </Bloque>
              <Bloque titulo="Tu conversación con la autora" icono="fa-comments">
                {conversa.length === 0 ? (
                  <p style={{ margin: 0, color: T.text3 }}>Todavía no comentas nada. Ve a «Dialoga con la autora».</p>
                ) : (
                  conversa
                    .slice(-6)
                    .reverse()
                    .map((c) => (
                      <p key={c.n} style={{ margin: 0, color: T.text2 }}>
                        <strong style={{ color: c.ok ? OK : NO }}>#{c.n} · {COMENTARIOS.find((x) => x.id === c.comentario)?.etiqueta}.</strong> {c.texto}
                      </p>
                    ))
                )}
              </Bloque>
              <Bloque titulo="Lectura A1 · para pensar" icono="fa-book-open-reader">
                {COMPRENSION_A1.map((c, i) => (
                  <details key={i} style={{ borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 13px" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 700, color: T.text2, lineHeight: 1.45 }}>{c.pregunta}</summary>
                    <p style={{ margin: "9px 0 0", color: T.text3, lineHeight: 1.5 }}>{c.guia}</p>
                  </details>
                ))}
              </Bloque>
            </>
          ),
        },
        {
          id: "debate",
          etiqueta: "Debate",
          icono: "fa-scale-balanced",
          contenido: (
            <>
              <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />
              <DebateCard
                accent={accent}
                rgba={color.rgba}
                postura={postura}
                argumento={argumento}
                puntoValido={puntoValido}
                onPostura={(id) => {
                  setPostura(id);
                  setPuntoValido(null);
                }}
                onArgumento={setArgumento}
                onPuntoValido={(txt) => {
                  setPuntoValido(txt);
                  setPie({ ok: true, txt: "Reconocer un punto válido de la postura contraria es la tercera regla del debate: se discute la idea, no a la persona." });
                }}
              />
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={RETO_QUIZ}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Entendiste el vínculo: leer y escribir se retroalimentan."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="¿Sabías?" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_LENGUAS}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={LECTURA_ESCRITURA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Nota" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text3, lineHeight: 1.6 }}>
                  <strong style={{ color: T.text2 }}>Verbatim de la progresión LC-I-P01:</strong> la lectura y el dato del INALI (A1), el reto evaluable (A2), la
                  consigna del cuaderno y sus criterios (A3), los hechos verdadero/falso (A4), el glosario (A5), el texto con huecos (A6) y el debate con sus
                  reglas y argumentos guía (A7).{" "}
                  <strong style={{ color: T.text2 }}>Escrito para este laboratorio (ilustrativo):</strong> la autora y su borrador, los tres circuitos del sentido
                  y los doce textos que se clasifican. Son situaciones verosímiles de un bachillerato mexicano, sin personas ni instituciones reales; las cifras
                  del borrador son una simulación. La cifra de 68 lenguas nacionales y las más de 30 variantes del náhuatl provienen del catálogo del INALI,
                  citado en la propia actividad. En el debate no hay respuesta correcta: el laboratorio no califica tu postura, solo te pide sostenerla y
                  reconocer un punto válido de la contraria.
                </p>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 0 — Dialoga con la autora: el simulador
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono }: { clave: string; icono: string }) {
  const [rota, setRota] = useState(false);
  return (
    <span className="lec-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!rota && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setRota(true)} />}
    </span>
  );
}

function DialogoPanel({
  accent,
  fraseSel,
  revisadas,
  conversa,
  dims,
  total,
  onSelFrase,
  onComentar,
}: {
  accent: string;
  fraseSel: string | null;
  revisadas: Record<string, boolean>;
  conversa: Intercambio[];
  dims: Record<Dimension, number>;
  total: number;
  onSelFrase: (id: string) => void;
  onComentar: (c: Comentario) => void;
}) {
  const ultima = conversa[conversa.length - 1] ?? null;
  const veredicto = veredictoLector(total);
  const nRev = Object.keys(revisadas).length;
  return (
    <>
      <div className="lec-autora">
        <Foto clave="autora-escritorio" icono="fa-user-pen" />
        <div>
          <strong>{AUTORA.nombre}</strong>
          <span>{AUTORA.rol}</span>
          <span>Versión {nRev + 1} del borrador · «{AUTORA.titulo}»</span>
        </div>
      </div>

      <div className="lec-paso">
        <div className="lec-paso-t">
          <span className="lec-num">1</span> Lee el borrador y toca la frase que quieres comentar
        </div>
        <div className="lec-borrador" role="list">
          {FRASES.map((f) => {
            const rev = Boolean(revisadas[f.id]);
            return (
              <button key={f.id} type="button" role="listitem" className="lec-frase" data-sel={fraseSel === f.id} data-rev={rev} onClick={() => onSelFrase(f.id)}>
                {rev && <span className="lec-antes">Antes: {f.original}</span>}
                <span className="lec-texto">{rev ? f.revisada : f.original}</span>
                {rev && (
                  <span className="lec-etq">
                    <i className="fa-solid fa-pen" /> reescrita
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lec-paso">
        <div className="lec-paso-t">
          <span className="lec-num">2</span> Escribe tu comentario al margen
        </div>
        <div className="lec-chips" role="group" aria-label="Tu comentario">
          {COMENTARIOS.map((c) => (
            <button key={c.id} type="button" className="lec-prob" disabled={!fraseSel} onClick={() => onComentar(c.id)} title={c.ejemplo}>
              <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8 }} />
              {c.etiqueta}
            </button>
          ))}
        </div>
        {!fraseSel && <div className="lec-nota">Primero toca una frase del borrador.</div>}
      </div>

      {ultima && (
        <div className="lec-respuesta" data-ok={ultima.ok} role="status" aria-live="polite">
          <i className={`fa-solid ${ultima.ok ? "fa-pen-nib" : "fa-comment-dots"}`} />
          <div>
            <strong>{AUTORA.nombre} responde</strong>
            <p>{ultima.texto}</p>
          </div>
        </div>
      )}

      <div className="lec-paso">
        <div className="lec-paso-t">
          <i className={`fa-solid ${veredicto.icono}`} style={{ color: total >= 70 ? OK : accent }} /> {veredicto.texto} <em>simulación</em>
        </div>
        <LectorSvg dims={dims} total={total} />
      </div>
    </>
  );
}

function LectorSvg({ dims, total }: { dims: Record<Dimension, number>; total: number }) {
  return (
    <svg viewBox="0 0 360 232" className="lec-svg" role="img" aria-label={`Qué tanto entiende un lector nuevo: ${total} de 100`}>
      {DIMENSIONES.map((d, i) => {
        const y = i * 34 + 6;
        const ancho = (dims[d.id] / 100) * 190;
        return (
          <g key={d.id}>
            <text x={0} y={y + 17} fontSize="14" fontWeight="800" fill="rgba(255,255,255,0.88)">
              {d.label}
            </text>
            <rect x={104} y={y} width={190} height={22} rx={6} fill="rgba(255,255,255,0.08)" />
            <rect className="lec-rect" x={104} y={y} width={ancho} height={22} rx={6} fill={d.color} />
            <text x={302} y={y + 17} fontSize="14" fontWeight="800" fill="#fff">
              {dims[d.id]}
            </text>
          </g>
        );
      })}
      <text x={0} y={216} fontSize="14" fontWeight="800" fill="rgba(255,255,255,0.88)">
        Lector nuevo
      </text>
      <rect x={104} y={199} width={190} height={22} rx={6} fill="rgba(255,255,255,0.08)" />
      <rect className="lec-rect" x={104} y={199} width={(total / 100) * 190} height={22} rx={6} fill={total >= 70 ? OK : "#fff"} fillOpacity={total >= 70 ? 1 : 0.7} />
      <line x1={104 + 0.7 * 190} x2={104 + 0.7 * 190} y1={194} y2={226} stroke="#fff" strokeDasharray="3 3" />
      <text x={302} y={216} fontSize="14" fontWeight="900" fill="#fff">
        {total}
      </text>
    </svg>
  );
}

function css(accent: string, rgba: string): string {
  return `
  @keyframes lecShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes lecPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .lec-card { cursor:grab; display:block; padding:12px 15px; border-radius:13px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:${T.text}; font-size:15px; line-height:1.5; text-align:left; transition:all .14s; user-select:none; width:100%; }
  .lec-card:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
  .lec-card[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 16px -5px ${accent}; }
  .lec-card:active { cursor:grabbing; }
  .lec-chip { cursor:grab; display:flex; align-items:flex-start; gap:9px; padding:11px 15px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:600; transition:all .14s;
    user-select:none; text-align:left; line-height:1.45; }
  .lec-mazo { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap:10px; align-items:stretch; }
  .lec-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .lec-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .lec-chip:active { cursor:grabbing; }
  .lec-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:170px; transition:all .16s; }
  .lec-bin[data-shake="true"] { animation:lecShake .4s; }
  .lec-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:58px;
    display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; gap:8px; transition:all .16s; }
  .lec-slot[data-active="true"] { border-color:${accent}; background:rgba(${rgba},0.1); cursor:pointer; }
  .lec-slot[data-shake="true"] { animation:lecShake .4s; border-color:${NO}; }
  .lec-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .lec-btn:hover { border-color:${T.lineStrong}; }
  .lec-prob { cursor:pointer; padding:9px 14px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .lec-prob:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
  .lec-prob:disabled { opacity:.45; cursor:default; }
  .lec-prob[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
  .lec-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }
  .lec-vf { cursor:pointer; padding:9px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .lec-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
  .lec-vf:disabled { cursor:default; opacity:.85; }
  .lec-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
  .lec-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }
  .lec-ta { width:100%; min-height:190px; resize:vertical; border-radius:13px; border:1.5px solid ${T.lineStrong};
    background:${T.inset}; color:#fff; font-size:15px; line-height:1.7; padding:14px 16px; font-family:inherit; outline:none; transition:all .15s; }
  .lec-ta:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.18); }
  .lec-ta::placeholder { color:rgba(255,255,255,0.28); }
  .lec-check { cursor:pointer; display:flex; align-items:flex-start; gap:11px; text-align:left; width:100%;
    border:1px solid ${T.line}; background:${T.glass}; border-radius:11px; padding:10px 13px; color:${T.text2};
    font-size:14px; line-height:1.45; transition:all .14s; }
  .lec-check:hover { border-color:${T.lineStrong}; color:#fff; }
  .lec-check[data-on="true"] { border-color:${OK}66; background:${OK}12; color:#fff; }
  .lec-postura { cursor:pointer; text-align:left; width:100%; border:1.5px solid ${T.line}; background:${T.glass};
    border-radius:14px; padding:14px 16px; color:${T.text2}; font-size:14px; line-height:1.5; transition:all .15s; }
  .lec-postura:hover { border-color:${T.lineStrong}; color:#fff; }
  .lec-postura[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; box-shadow:0 0 18px -7px ${accent}; }
  .lec-divider { height:1px; background:${T.line}; margin:18px 0; }

  /* Simulador: la autora y su borrador */
  .lec-autora { display:flex; align-items:center; gap:14px; padding:10px 14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glassSoft}; }
  .lec-autora > div { display:grid; gap:2px; min-width:0; }
  .lec-autora strong { font-size:16px; color:${T.text}; }
  .lec-autora span { font-size:14px; color:${T.text2}; }
  .lec-foto { position:relative; flex:0 0 96px; width:96px; aspect-ratio:16/9; border-radius:10px; overflow:hidden; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); color:rgba(255,255,255,0.55); font-size:24px; }
  .lec-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .lec-paso { display:grid; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glassSoft}; min-width:0; }
  .lec-paso-t { font-size:15px; font-weight:900; color:${T.text}; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .lec-paso-t em { font-style:normal; font-size:14px; font-weight:700; color:${T.text3}; }
  .lec-num { width:26px; height:26px; border-radius:50%; background:rgba(${rgba},0.25); border:1px solid ${accent}; display:inline-flex;
    align-items:center; justify-content:center; font-size:14px; font-weight:900; color:#fff; }
  .lec-borrador { display:grid; gap:8px; }
  .lec-frase { cursor:pointer; display:grid; gap:4px; text-align:left; padding:11px 14px; border-radius:12px; border:1.5px solid ${T.line};
    background:${T.inset}; color:${T.text}; font-size:16px; line-height:1.5; font-family:Georgia, 'Times New Roman', serif; transition:all .15s; }
  .lec-frase:hover { border-color:${T.lineStrong}; }
  .lec-frase[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 16px -6px ${accent}; }
  .lec-frase[data-rev="true"] { border-color:${OK}66; background:${OK}10; animation:lecPop .3s ease; }
  .lec-antes { font-size:14px; color:${T.text3}; text-decoration:line-through; font-family:inherit; }
  .lec-etq { font-size:14px; font-weight:800; color:${OK}; font-family:system-ui, sans-serif; }
  .lec-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .lec-nota { font-size:14px; color:${T.text3}; }
  .lec-respuesta { display:flex; gap:12px; padding:12px 14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; animation:lecPop .25s ease; }
  .lec-respuesta[data-ok="true"] { border-color:${OK}66; background:${OK}12; }
  .lec-respuesta i { margin-top:4px; font-size:18px; color:${accent}; }
  .lec-respuesta[data-ok="true"] i { color:${OK}; }
  .lec-respuesta strong { font-size:15px; color:${T.text}; }
  .lec-respuesta p { margin:4px 0 0; font-size:15px; line-height:1.5; color:${T.text2}; }
  .lec-svg { width:100%; height:auto; display:block; }
  .lec-rect { transition:width .5s cubic-bezier(.4,0,.2,1); }

  /* Identidad del tablero: cada cesta con su tono */
  .lec-bin { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .lec-bin:nth-of-type(4n+1) { --tono:262; }
  .lec-bin:nth-of-type(4n+2) { --tono:198; }
  .lec-bin:nth-of-type(4n+3) { --tono:336; }
  .lec-bin:nth-of-type(4n+4) { --tono:142; }
  .lec-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .lec-bin[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }

  @media (prefers-reduced-motion: reduce){
    .lec-slot[data-shake="true"], .lec-bin[data-shake="true"], .lec-frase[data-rev="true"], .lec-respuesta { animation:none; }
    .lec-chip, .lec-chip:hover, .lec-chip[data-sel="true"] { transform:none; }
    .lec-rect { transition:none; }
  }
  `;
}


/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — El circuito del sentido
 * ═══════════════════════════════════════════════════════════════════════════ */
function CircuitoPanel({
  accent,
  circuito,
  circIdx,
  armados,
  ordenActual,
  pasosLibres,
  selPaso,
  shakePaso,
  onSelCircuito,
  onSelPaso,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  circuito: (typeof CIRCUITOS)[number];
  circIdx: number;
  armados: string[];
  ordenActual: string[];
  pasosLibres: (typeof CIRCUITOS)[number]["pasos"];
  selPaso: string | null;
  shakePaso: boolean;
  onSelCircuito: (i: number) => void;
  onSelPaso: (id: string) => void;
  onSlot: () => void;
  onDropSlot: (id: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const completado = armados.includes(circuito.id);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {CIRCUITOS.map((c, i) => (
          <button key={c.id} className="lec-prob" data-on={circIdx === i} data-done={armados.includes(c.id)} onClick={() => onSelCircuito(i)}>
            {armados.includes(c.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {c.titulo}
          </button>
        ))}
      </div>

      <Mesa>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Pasos sueltos — colócalos en orden</Eyebrow>
        {pasosLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Circuito cerrado! Cambia de situación arriba para armar otra.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pasosLibres.map((p) => (
              <button key={p.id} className="lec-card" data-sel={selPaso === p.id} onClick={() => onSelPaso(p.id)} {...dragProps(p.id)}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginRight: 9,
                    padding: "2px 9px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: ACTO_INFO[p.acto].color,
                    background: `${ACTO_INFO[p.acto].color}1f`,
                    border: `1px solid ${ACTO_INFO[p.acto].color}55`,
                  }}
                >
                  <i className={`fa-solid ${ACTO_INFO[p.acto].icono}`} style={{ fontSize: 14 }} />
                  {ACTO_INFO[p.acto].label}
                </span>
                {p.texto}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-rotate" style={{ marginRight: 8, color: accent }} />
            «{circuito.titulo}» — ordena la secuencia
          </Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: completado ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {completado ? "Circuito cerrado ✓" : `${ordenActual.length}/${circuito.pasos.length} pasos`}
          </span>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.6, color: T.text2 }}>{circuito.contexto}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {circuito.pasos.map((_, i) => {
            const colocadoId = ordenActual[i];
            const paso = colocadoId ? circuito.pasos.find((p) => p.id === colocadoId) : null;
            const esActivo = i === ordenActual.length;
            const info = paso ? ACTO_INFO[paso.acto] : null;
            return (
              <div key={i}>
                {i > 0 && (
                  <div style={{ textAlign: "center", color: T.text3, lineHeight: 0.6, margin: "2px 0" }}>
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: 14, opacity: i <= ordenActual.length ? 0.7 : 0.2 }} />
                  </div>
                )}
                {paso && info ? (
                  <div style={{ animation: "lecPop .25s ease", padding: "12px 15px", borderRadius: 13, border: `1.5px solid ${info.color}`, background: `${info.color}18` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, background: `${info.color}33`, color: "#fff" }}>
                        {i + 1}
                      </span>
                      <VinetaTermino termino={info.label} color={info.color} icono={info.icono} tam={29} radio={8} />
                      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", color: info.color, textTransform: "uppercase" }}>{info.label}</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.55, color: "#fff" }}>{paso.texto}</div>
                    <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.text2, display: "flex", gap: 8 }}>
                      <i className="fa-solid fa-arrow-turn-down" style={{ color: info.color, fontSize: 14, marginTop: 3 }} />
                      <span>{paso.porque}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="lec-slot"
                    data-active={esActivo}
                    data-shake={esActivo && shakePaso}
                    onClick={() => esActivo && onSlot()}
                    {...(esActivo ? dropProps((id) => onDropSlot(id)) : {})}
                  >
                    {esActivo ? (
                      <>
                        <i className="fa-solid fa-arrow-down-to-bracket" /> Suelta aquí el paso {i + 1}
                      </>
                    ) : (
                      <span style={{ opacity: 0.4 }}>Paso {i + 1}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {completado && (
          <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", fontSize: 14, lineHeight: 1.55, color: T.text2, display: "flex", gap: 11 }}>
            <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
            <span>{circuito.cierre}</span>
          </div>
        )}
      </div>
      </Mesa>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — ¿Qué hace este texto?
 * ═══════════════════════════════════════════════════════════════════════════ */
function FuncionesPanel({
  accent,
  ubicTexto,
  selTexto,
  shakeFun,
  textosLibres,
  onSelTexto,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  accent: string;
  ubicTexto: Record<string, Funcion>;
  selTexto: string | null;
  shakeFun: Funcion | null;
  textosLibres: typeof TEXTOS;
  onSelTexto: (id: string) => void;
  onBin: (fun: Funcion) => void;
  onDropBin: (id: string, fun: Funcion) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const funciones: Funcion[] = ["imaginar", "critica", "procesar", "transformar"];
  const colocados = Object.keys(ubicTexto).length;
  return (
    <>
      <Mesa>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>
            <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
            Lleva cada texto a lo que ese texto hace
          </Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: colocados >= TEXTOS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {colocados}/{TEXTOS.length}
          </span>
        </div>
        {textosLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {TEXTOS.length} textos!
          </div>
        ) : (
          <div className="lec-mazo">
            {textosLibres.map((t) => (
              <button key={t.id} className="lec-chip" data-sel={selTexto === t.id} onClick={() => onSelTexto(t.id)} {...dragProps(t.id)}>
                <i className="fa-solid fa-file-lines" style={{ fontSize: 14, color: T.text3, marginTop: 3 }} />
                {t.texto}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 14 }}>
        {funciones.map((fun) => {
          const info = FUNCION_INFO[fun];
          const dentro = TEXTOS.filter((t) => ubicTexto[t.id] === fun);
          return (
            <div
              key={fun}
              className="lec-bin"
              data-shake={shakeFun === fun}
              data-done={dentro.length >= 3}
              onClick={() => onBin(fun)}
              {...dropProps((id) => onDropBin(id, fun))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selTexto ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", lineHeight: 1.25 }}>{info.label}</div>
                  <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.35, marginTop: 2 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.length === 0 ? (
                  <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Arrastra aquí…</span>
                ) : (
                  dentro.map((t) => (
                    <span
                      key={t.id}
                      style={{
                        animation: "lecPop .25s ease",
                        display: "inline-flex",
                        alignItems: "flex-start",
                        gap: 7,
                        fontSize: 14,
                        lineHeight: 1.45,
                        color: "#fff",
                        padding: "8px 11px",
                        borderRadius: 10,
                        background: `${info.color}1f`,
                        border: `1px solid ${info.color}55`,
                      }}
                    >
                      <i className="fa-solid fa-check" style={{ fontSize: 14, color: info.color, marginTop: 3 }} />
                      {t.texto}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      </Mesa>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 5 — Tu cuaderno (reflexión escrita A3, verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */
function CuadernoPanel({
  accent,
  rgba,
  valor,
  palabras,
  vocab,
  autoevaluacion,
  onEscribir,
  onAuto,
}: {
  accent: string;
  rgba: string;
  valor: string;
  palabras: number;
  vocab: string[];
  autoevaluacion: boolean[];
  onEscribir: (s: string) => void;
  onAuto: (i: number) => void;
}) {
  const largoOk = palabras >= CUADERNO.minimo;
  const excedido = palabras > CUADERNO.maximo;
  const vocabOk = vocab.length >= 3;
  // De los cuatro criterios verbatim de la actividad, el único que una máquina
  // puede comprobar sin mentir es «Usa vocabulario del tema estudiado»: se
  // busca en el texto. Los otros tres —experiencia concreta, conexión explícita
  // y coherencia— los valora el propio alumno al releerse, porque fingir que el
  // laboratorio los evalúa sería peor que no evaluarlos.
  const autoCriterios = [CUADERNO.criterios[0]!, CUADERNO.criterios[1]!, CUADERNO.criterios[3]!];

  return (
    <div style={{ ...card, padding: "20px 24px" }}>
      <Eyebrow>
        <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
        Tu cuaderno · {CUADERNO.ancla}
      </Eyebrow>

      <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.65, color: T.text2 }}>{CUADERNO.prompt}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {CUADERNO.pistas.map((p, i) => (
          <span
            key={i}
            style={{
              fontSize: 14,
              lineHeight: 1.4,
              color: T.text3,
              border: `1px solid ${T.line}`,
              background: T.inset,
              borderRadius: 999,
              padding: "6px 12px",
            }}
          >
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 7, color: accent, fontSize: 14 }} />
            {p}
          </span>
        ))}
      </div>

      <textarea
        className="lec-ta"
        value={valor}
        aria-label="Tu reflexión sobre leer y escribir"
        placeholder="Escribe aquí tu reflexión. Nadie la califica: es tu texto."
        onChange={(e) => onEscribir(e.target.value)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
            color: excedido ? "#FF8A3C" : largoOk ? OK : T.text3,
          }}
        >
          <i className={`fa-solid ${largoOk && !excedido ? "fa-circle-check" : "fa-pen"}`} style={{ marginRight: 7 }} />
          {palabras} palabra{palabras === 1 ? "" : "s"} · mínimo {CUADERNO.minimo}, máximo {CUADERNO.maximo}
        </span>
        {excedido && <span style={{ fontSize: 14, color: "#FF8A3C" }}>Te pasaste del máximo: recorta lo que no aporte.</span>}
      </div>

      <div className="lec-divider" />

      <Eyebrow>Criterios de evaluación de la actividad</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 10 }}>
        {autoCriterios.map((c, i) => (
          <button key={c} type="button" className="lec-check" data-on={autoevaluacion[i] === true} onClick={() => onAuto(i)}>
            <i className={`fa-solid ${autoevaluacion[i] ? "fa-square-check" : "fa-square"}`} style={{ marginTop: 2, color: autoevaluacion[i] ? OK : T.text3 }} />
            <span>
              {c}
              <span style={{ display: "block", fontSize: 14, color: T.text3, marginTop: 2 }}>Lo marcas tú al releerte.</span>
            </span>
          </button>
        ))}

        <div className="lec-check" data-on={vocabOk} style={{ cursor: "default" }}>
          <i className={`fa-solid ${vocabOk ? "fa-square-check" : "fa-square"}`} style={{ marginTop: 2, color: vocabOk ? OK : T.text3 }} />
          <span>
            {CUADERNO.criterios[2]}
            <span style={{ display: "block", fontSize: 14, color: T.text3, marginTop: 2 }}>
              {vocab.length === 0
                ? "Lo comprueba el laboratorio: aún no aparece vocabulario del tema."
                : `Lo comprueba el laboratorio. Detectado: ${vocab.join(", ")}.`}
            </span>
          </span>
        </div>
      </div>

      <p style={{ margin: "14px 0 0", fontSize: 14, color: T.text3, lineHeight: 1.55, borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: `rgba(${rgba},0.9)` }} />
        Lo que escribas aquí se queda en tu navegador mientras dure la sesión: el laboratorio no lo envía ni lo califica. Cópialo
        a tu cuaderno o a la actividad si quieres conservarlo.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero/falso (A4, verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */
function HechosCard({
  accent,
  respuestas,
  onResponder,
}: {
  accent: string;
  respuestas: (boolean | null)[];
  onResponder: (i: number, valor: boolean) => void;
}) {
  const aciertos = respuestas.filter((r, i) => r !== null && r === HECHOS[i]!.respuesta).length;
  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
          Hechos · verdadero o falso (LC-I-P01-A4)
        </Eyebrow>
        <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 800, color: aciertos >= HECHOS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {aciertos}/{HECHOS.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {HECHOS.map((h, i) => {
          const r = respuestas[i];
          const resuelto = r !== null && r === h.respuesta;
          const fallado = r !== null && r !== h.respuesta;
          return (
            <div
              key={i}
              style={{
                borderRadius: 13,
                border: `1px solid ${resuelto ? `${OK}55` : fallado ? `${NO}55` : T.line}`,
                background: resuelto ? `${OK}0f` : fallado ? `${NO}0f` : T.inset,
                padding: "13px 16px",
                transition: "all .18s",
              }}
            >
              <div style={{ fontSize: 14, lineHeight: 1.5, color: T.text, marginBottom: 10, display: "flex", gap: 10 }}>
                <span style={{ color: accent, fontWeight: 900 }}>{i + 1}.</span>
                <span>{h.enunciado}</span>
              </div>
              <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    className="lec-vf"
                    disabled={resuelto}
                    data-on={resuelto && h.respuesta === v}
                    data-bad={fallado && r === v}
                    onClick={() => onResponder(i, v)}
                  >
                    <i className={`fa-solid ${v ? "fa-check" : "fa-xmark"}`} style={{ marginRight: 7 }} />
                    {v ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {resuelto && (
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: 1, minWidth: 220 }}>{h.retro}</span>
                )}
                {fallado && (
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: 1, minWidth: 220 }}>
                    {h.retro} <em style={{ color: T.text3 }}>Inténtalo de nuevo.</em>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Mesa de debate (A7, verbatim). No hay postura correcta.
 * ═══════════════════════════════════════════════════════════════════════════ */
function DebateCard({
  accent,
  rgba,
  postura,
  argumento,
  puntoValido,
  onPostura,
  onArgumento,
  onPuntoValido,
}: {
  accent: string;
  rgba: string;
  postura: string | null;
  argumento: string;
  puntoValido: string | null;
  onPostura: (id: string) => void;
  onArgumento: (s: string) => void;
  onPuntoValido: (txt: string) => void;
}) {
  const elegida = DEBATE.posturas.find((p) => p.id === postura) ?? null;
  const contraria = DEBATE.posturas.find((p) => p.id !== postura) ?? null;
  const palabras = cuentaPalabras(argumento);

  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
        Mesa de debate · {DEBATE.ancla}
      </Eyebrow>

      <div style={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.45, marginBottom: 6 }}>{DEBATE.tema}</div>
      <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, marginBottom: 16 }}>
        Aquí no hay respuesta correcta y el laboratorio no califica tu postura. Lo que se practica es sostenerla con razones y
        reconocer lo que la otra postura tiene de válido.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
        {DEBATE.posturas.map((p) => (
          <button key={p.id} type="button" className="lec-postura" data-on={postura === p.id} onClick={() => onPostura(p.id)}>
            <span style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <i className={`fa-solid ${postura === p.id ? "fa-circle-dot" : "fa-circle"}`} style={{ marginTop: 3, fontSize: 14, color: postura === p.id ? accent : T.text3 }} />
              <span>{p.texto}</span>
            </span>
          </button>
        ))}
      </div>

      {elegida && contraria && (
        <>
          <div className="lec-divider" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            <div style={{ borderRadius: 14, border: `1px solid rgba(${rgba},0.3)`, background: `rgba(${rgba},0.07)`, padding: "14px 16px" }}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 9 }}>
                Argumentos guía de tu postura
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
                {elegida.argumentos.map((a) => (
                  <li key={a} style={{ fontSize: 14, lineHeight: 1.5, color: T.text2 }}>{a}</li>
                ))}
              </ul>
            </div>

            <div style={{ borderRadius: 14, border: `1px solid ${T.line}`, background: T.inset, padding: "14px 16px" }}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: T.text3, marginBottom: 9 }}>
                La postura contraria
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: T.text2, marginBottom: 11 }}>{contraria.texto}</div>
              <div style={{ fontSize: 14, color: T.text3, marginBottom: 8 }}>
                Regla 3 del debate: «{DEBATE.reglas[2]}» Elige el punto que sí te parece válido.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {contraria.argumentos.map((a) => (
                  <button key={a} type="button" className="lec-check" data-on={puntoValido === a} onClick={() => onPuntoValido(a)}>
                    <i className={`fa-solid ${puntoValido === a ? "fa-square-check" : "fa-square"}`} style={{ marginTop: 2, color: puntoValido === a ? OK : T.text3 }} />
                    <span>{a}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 8 }}>
              Tu argumento propio <span style={{ color: T.text3, fontWeight: 600 }}>(al menos {DEBATE.minimoPalabras} palabras)</span>
            </div>
            <textarea
              className="lec-ta"
              style={{ minHeight: 120 }}
              value={argumento}
              aria-label="Tu argumento en el debate"
              placeholder="Escribe una razón tuya, distinta de las de arriba, que sostenga tu postura."
              onChange={(e) => onArgumento(e.target.value)}
            />
            <div style={{ marginTop: 9, fontSize: 14, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: palabras >= DEBATE.minimoPalabras ? OK : T.text3 }}>
              <i className={`fa-solid ${palabras >= DEBATE.minimoPalabras ? "fa-circle-check" : "fa-pen"}`} style={{ marginRight: 7 }} />
              {palabras} palabra{palabras === 1 ? "" : "s"}
            </div>
          </div>
        </>
      )}

      <div className="lec-divider" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        <div style={{ flex: "1 1 240px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>Reglas</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            {DEBATE.reglas.map((r) => (
              <li key={r} style={{ fontSize: 14, lineHeight: 1.5, color: T.text2 }}>{r}</li>
            ))}
          </ul>
        </div>
        <div style={{ flex: "1 1 240px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>Criterios de evaluación</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            {DEBATE.criterios.map((c) => (
              <li key={c} style={{ fontSize: 14, lineHeight: 1.5, color: T.text2 }}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
