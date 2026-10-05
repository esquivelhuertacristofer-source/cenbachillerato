"use client";

/**
 * Laboratorio — La reseña crítica: leer para evaluar y comunicar
 * Práctica experimental para LC-III-P06-A1 (Lenguaje y Comunicación III).
 *
 * El experimento central: el alumno ARMA una reseña de una obra FICTICIA
 * («El invierno de las jacarandas», de Irene Calzada Brun) eligiendo una frase
 * para cada parte (ficha, resumen sin spoilers, valoración argumentada,
 * recomendación). La vista previa se actualiza y tres lectores simulados
 * reaccionan: credibilidad, utilidad y ganas de leer suben o bajan, y cada
 * frase explica POR QUÉ (un spoiler o una opinión sin argumento duelen a la
 * vista). Las cifras son «simulación». La lógica vive en `resena-critica-sim.ts`.
 *
 * Modos:
 *  1. «Editor de reseñas» — el simulador (nuevo).
 *  2. «Ordena la estructura» — introducción → síntesis → análisis → valoración
 *     (verbatim de A1), en la mesa de arrastre.
 *  3. «¿Resumen o juicio crítico?» — clasifica ocho frases, en la mesa de arrastre.
 *  4. «Escribe el término» (glosario A5) y 5. «Completa el texto» (fill_blanks).
 *  + Cuestionario de comprensión (V/F verbatim de A4) en la pestaña «Reto».
 *
 * DOM puro (sin three.js): accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de LC-III·P06,
 * que vive en la pestaña «Teoría».
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { RESENA_CRITICA_HUECOS } from "./resena-critica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RESENA_CRITICA_FICHA } from "./resena-critica-ficha";
import {
  ESTRUCTURA,
  FRASES,
  CLASE_INFO,
  PARES,
  QUIZ,
  DATO_RESENA,
  type Clase,
} from "./resena-critica-data";
import {
  FALLAS_GRAVES,
  OBRA,
  PARTES,
  evaluarResena,
  opcionPorId,
  opcionesDe,
  veredictoPublicacion,
  type EvaluacionResena,
  type Parte,
  type Reaccion,
  type Seleccion,
} from "./resena-critica-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-resena-critica-reto";
const RUTA_SIM = "/media/labs-sim/resena-critica";

type Modo = "editor" | "estructura" | "clases" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "editor", label: "Editor de reseñas", icono: "fa-pen-ruler" },
  { id: "estructura", label: "Ordena la estructura de una reseña", icono: "fa-arrow-down-up-across-line" },
  { id: "clases", label: "¿Resumen o juicio crítico?", icono: "fa-scale-balanced" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabResenaCritica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("editor");

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

  // ── modo editor de reseñas (simulador) ─────────────────────────────────
  // Explorar no castiga la partida: solo publicar una reseña floja suena mal.
  const [sel, setSel] = useState<Seleccion>({});
  const [ultima, setUltima] = useState<string | null>(null);
  const [viFalla, setViFalla] = useState(false);
  const [buenaPublicada, setBuenaPublicada] = useState(false);
  const [publicada, setPublicada] = useState<EvaluacionResena | null>(null);
  const evaluacion = evaluarResena(sel);

  const elegirFrase = (parte: Parte, id: string) => {
    setSel((s) => ({ ...s, [parte]: id }));
    setUltima(id);
    setPublicada(null);
    const op = opcionPorId(id);
    if (op?.falla && FALLAS_GRAVES.includes(op.falla)) setViFalla(true);
    if (sonido) audioRef.current?.blip();
  };
  const publicar = () => {
    if (!evaluacion.completa) return;
    setPublicada(evaluacion);
    if (evaluacion.nivel === "excelente") {
      setBuenaPublicada(true);
      sfxOk();
    } else if (sonido) {
      audioRef.current?.incorrecto();
    }
  };
  const resetEditor = () => {
    setSel({});
    setUltima(null);
    setPublicada(null);
  };

  // ── modo estructura (ordena secuencialmente) ───────────────────────────
  const [estrPos, setEstrPos] = useState(0);
  const [selE, setSelE] = useState<string | null>(null);
  const [shakeE, setShakeE] = useState(false);
  const estrLibres = ESTRUCTURA.filter((c) => c.orden >= estrPos).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarEstr = (pasoId: string) => {
    if (estrPos >= ESTRUCTURA.length) return;
    const esperado = ESTRUCTURA[estrPos]!;
    if (pasoId === esperado.id) {
      setEstrPos((p) => p + 1);
      setSelE(null);
      sfxPlace();
      if (estrPos + 1 >= ESTRUCTURA.length) {
        sfxOk();
        persistMejor(true, clasesDone, glosarioDone);
      }
    } else {
      setShakeE(true);
      sfxNo();
      window.setTimeout(() => setShakeE(false), 420);
    }
  };
  const resetEstructura = () => {
    setEstrPos(0);
    setSelE(null);
  };

  // ── modo clases (clasifica resumen / juicio) ────────────────────────────
  const [ubicC, setUbicC] = useState<Record<string, Clase>>({});
  const [selC, setSelC] = useState<string | null>(null);
  const [shakeC, setShakeC] = useState<Clase | null>(null);
  const claseLibres = FRASES.filter((x) => !ubicC[x.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarClase = (itemId: string, bin: Clase) => {
    if (ubicC[itemId]) return;
    const it = FRASES.find((x) => x.id === itemId);
    if (it && it.clase === bin) {
      setUbicC((e) => ({ ...e, [itemId]: bin }));
      setSelC(null);
      sfxPlace();
      if (Object.keys(ubicC).length + 1 >= FRASES.length) {
        sfxOk();
        persistMejor(estructuraDone, true, glosarioDone);
      }
    } else {
      setShakeC(bin);
      sfxNo();
      window.setTimeout(() => setShakeC(null), 420);
    }
  };
  const resetClases = () => {
    setUbicC({});
    setSelC(null);
  };

  // ── modo glosario (lee la definición y ESCRIBE el término) ─────────────
  // El contador hace de `key`: subirlo remonta el componente y deja todas
  // las tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const estructuraDone = estrPos >= ESTRUCTURA.length;
  const clasesDone = Object.keys(ubicC).length >= FRASES.length;
  const modosHechos = (estructuraDone ? 1 : 0) + (clasesDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Elige una frase que falle (spoiler, opinión sin argumento…) y mira cómo reacciona el lector", done: viFalla },
    { txt: "Publica una reseña convincente: credibilidad y utilidad de 70 o más, sin fallas", done: buenaPublicada },
    { txt: "Ordena los 4 componentes de la estructura", done: estructuraDone },
    { txt: "Clasifica las 8 frases en resumen/juicio", done: clasesDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone, modo: "glosario" },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "editor" ? resetEditor : modo === "estructura" ? resetEstructura : modo === "clases" ? resetClases : resetGlosario;

  const lecturaDe: Record<Modo, string> = {
    editor: `Credibilidad ${evaluacion.m.cred} · utilidad ${evaluacion.m.util} · ganas ${evaluacion.m.ganas}`,
    estructura: `Componentes colocados: ${estrPos} de ${ESTRUCTURA.length}`,
    clases: `Frases clasificadas: ${Object.keys(ubicC).length} de ${FRASES.length}`,
    glosario: "Escribe cada término del glosario",
    texto: "Completa las palabras que faltan",
  };

  const pistaDe: Record<Modo, string> = {
    editor: "Elige una frase por parte y mira los tres medidores. Cada frase explica por qué sube o baja. Prueba también las que suenan mal: el lector reacciona.",
    estructura: "Primero presentas la obra y su contexto; luego sintetizas y analizas; al final valoras y recomiendas.",
    clases: "Si la frase dice qué ocurre en la obra es resumen; si emite un juicio con argumentos es crítica.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const escena = (
    <div style={{ color: T.text }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "editor" && (
        <EditorResenas
          sel={sel}
          ultima={ultima}
          ev={evaluacion}
          publicada={publicada}
          onElegir={elegirFrase}
          onPublicar={publicar}
          onReiniciar={resetEditor}
          accent={accent}
        />
      )}

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={RESENA_CRITICA_HUECOS}
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

      {/* MODO — Estructura */}
      {modo === "estructura" && (
        <Mesa>
          <div className="rc-banco">
            <div className="rc-cab">
              <Eyebrow>Ordena la reseña: de la presentación a la recomendación</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: estructuraDone ? OK : T.text3 }}>
                {estrPos}/{ESTRUCTURA.length}
              </span>
            </div>
            <div className="rc-ayuda">
              La reseña va de la <strong>introducción</strong> al <strong>desarrollo</strong> y la <strong>conclusión</strong>. Arrastra el <strong>siguiente componente</strong> al hueco activo.
            </div>
            {estrLibres.length === 0 ? (
              <div className="rc-listo">
                <i className="fa-solid fa-circle-check" /> ¡Reconstruiste la estructura de la reseña!
              </div>
            ) : (
              estrLibres.map((c) => (
                <button key={c.id} className="rc-chip" data-sel={selE === c.id} onClick={() => setSelE((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                  {c.texto}
                </button>
              ))
            )}
          </div>
          <EstructuraOrden selE={selE} shakeE={shakeE} estrPos={estrPos} onMatch={intentarEstr} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO — Resumen o juicio */}
      {modo === "clases" && (
        <Mesa>
          <div className="rc-banco">
            <div className="rc-cab">
              <Eyebrow>Arrastra cada frase a su tipo: resumen o juicio</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: clasesDone ? OK : T.text3 }}>
                {Object.keys(ubicC).length}/{FRASES.length}
              </span>
            </div>
            <div className="rc-ayuda">
              El <strong>resumen</strong> solo describe el contenido; el <strong>juicio crítico</strong> añade valoración, interpretación y argumentación.
            </div>
            {claseLibres.length === 0 ? (
              <div className="rc-listo">
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {FRASES.length} frases!
              </div>
            ) : (
              claseLibres.map((x) => (
                <button key={x.id} className="rc-chip" data-sel={selC === x.id} onClick={() => setSelC((s) => (s === x.id ? null : x.id))} {...dragProps(x.id)}>
                  {x.texto}
                </button>
              ))
            )}
          </div>
          <BinsClase selC={selC} shakeC={shakeC} ubicC={ubicC} onMatch={intentarClase} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO — glosario */}
      {modo === "glosario" && (
        <EscribeTermino
          key={glosIntento}
          pares={PARES}
          accent={accent}
          rgba={color.rgba}
          completado={glosarioDone}
          instrucciones="Lee la definición y escribe el término del glosario que le corresponde."
          onCompletado={() => {
            setGlosarioDone(true);
            sfxOk();
            persistMejor(estructuraDone, clasesDone, true);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
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
      lectura={lecturaDe[modo]}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {bestEstrellas >= 3 ? "¡Reseñas como un crítico literario!" : "Termina los modos de arrastre y escritura para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={RESENA_CRITICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Estructura de la reseña" icono="fa-arrow-down-up-across-line">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {ESTRUCTURA.map((c, i) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{i + 1}. {c.etapa}.</strong> {c.texto}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Resumen o juicio crítico" icono="fa-scale-balanced">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(CLASE_INFO) as Clase[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{CLASE_INFO[k].titulo}.</strong> {CLASE_INFO[k].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Conceptos clave" icono="fa-link">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PARES.map((p) => (
                    <div key={p.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{p.termino}.</strong> {p.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{p.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_RESENA}</div>
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
  @keyframes rcShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes rcPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .rc-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:flex-start; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none;
    max-width:100%; text-align:left; line-height:1.4; }
  .rc-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .rc-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .rc-chip:active { cursor:grabbing; }
  .rc-banco { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; }
  .rc-cab { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
  .rc-ayuda { font-size:14px; color:${T.text2}; line-height:1.5; }
  .rc-ayuda strong { color:#fff; }
  .rc-listo { font-size:14px; color:${OK}; font-weight:700; display:flex; align-items:center; gap:9px; }
  .rc-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .rc-row[data-shake="true"] { animation:rcShake .4s; border-color:${NO}; }
  .rc-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .rc-slot { flex-shrink:0; min-width:min(100%, 170px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .rc-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); color:#fff; }
  .rc-slot[data-shake="true"] { animation:rcShake .4s; border-color:${NO}; }
  .rc-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
  .rc-bin[data-shake="true"] { animation:rcShake .4s; border-color:${NO}; }
  .rc-step { border-radius:13px; border:1.5px solid ${OK}66; background:${OK}0f; padding:13px 16px; display:flex; align-items:center; gap:12px; animation:rcPop .25s ease; }
  .rc-locked { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 16px; display:flex; align-items:center; gap:12px; opacity:0.45; }
  .rc-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .rc-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .rc-q:disabled{ cursor:default; }
  .rc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .rc-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .rc-btn:disabled { opacity:.45; cursor:default; }

  /* Editor de reseñas */
  .rc-ed { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap:16px; align-items:start; }
  .rc-col { display:flex; flex-direction:column; gap:14px; min-width:0; }
  .rc-sticky { position:sticky; top:0; }
  .rc-card { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; display:flex; flex-direction:column; gap:10px; min-width:0; }
  .rc-card h5 { margin:0; font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text2}; display:flex; align-items:center; gap:8px; }
  .rc-card h5 i { color:${accent}; }
  .rc-obra { display:flex; gap:12px; align-items:center; }
  .rc-foto { position:relative; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.8); }
  .rc-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .rc-op { cursor:pointer; text-align:left; width:100%; padding:11px 13px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:${T.text2}; font-size:14px; font-weight:600; line-height:1.45; transition:all .14s; }
  .rc-op:hover { border-color:${T.lineStrong}; color:#fff; }
  .rc-op[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; box-shadow:0 0 14px -6px ${accent}; }
  .rc-op[data-sel="true"][data-falla="true"] { border-color:${NO}; background:${NO}18; box-shadow:0 0 14px -6px ${NO}; }
  .rc-porque { font-size:14px; line-height:1.5; padding:9px 12px; border-radius:11px; border:1px solid ${OK}55; background:${OK}12; color:#fff; display:flex; gap:9px; }
  .rc-porque[data-falla="true"] { border-color:${NO}66; background:${NO}14; }
  .rc-meter { display:grid; gap:4px; }
  .rc-meter-top { display:flex; justify-content:space-between; font-size:14px; font-weight:800; color:${T.text2}; }
  .rc-meter-top strong { font-family:ui-monospace, monospace; }
  .rc-meter-bar { height:12px; border-radius:99px; background:rgba(255,255,255,0.12); overflow:hidden; }
  .rc-meter-bar span { display:block; height:100%; border-radius:99px; transition:width .45s ease, background .3s; }
  .rc-prev { font-size:14px; line-height:1.55; color:#fff; display:flex; flex-direction:column; gap:7px; }
  .rc-prev p { margin:0; }
  .rc-prev .rc-vacio { color:${T.text3}; font-style:italic; }
  .rc-lector { display:flex; gap:10px; align-items:flex-start; padding:10px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; transition:border-color .25s, background .25s; }
  .rc-lector[data-estado="bien"] { border-color:${OK}77; background:${OK}10; }
  .rc-lector[data-estado="mal"] { border-color:${NO}77; background:${NO}10; }
  .rc-lector[data-estado="meh"] { border-color:${AMBAR}66; background:${AMBAR}0d; }
  .rc-lector strong { font-size:14px; color:#fff; }
  .rc-lector small { font-size:14px; color:${T.text3}; display:block; }
  .rc-lector p { margin:3px 0 0; font-size:14px; line-height:1.45; color:${T.text2}; }
  .rc-veredicto { border-radius:13px; padding:12px 14px; font-size:14px; line-height:1.5; display:grid; gap:4px; border:1.5px solid ${NO}77; background:${NO}14; color:#fff; animation:rcPop .25s ease; }
  .rc-veredicto[data-bien="true"] { border-color:${OK}88; background:${OK}16; }
  .rc-veredicto strong { font-size:15px; }
  @media (prefers-reduced-motion: reduce){ .rc-row[data-shake="true"], .rc-bin[data-shake="true"], .rc-slot[data-shake="true"] { animation:none; } .rc-meter-bar span { transition:none; } }

  /* Identidad del tablero */
  .rc-bin, .rc-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .rc-bin:nth-of-type(6n+1), .rc-row:nth-of-type(6n+1) { --tono:188; }
  .rc-bin:nth-of-type(6n+2), .rc-row:nth-of-type(6n+2) { --tono:262; }
  .rc-bin:nth-of-type(6n+3), .rc-row:nth-of-type(6n+3) { --tono:44; }
  .rc-bin:nth-of-type(6n+4), .rc-row:nth-of-type(6n+4) { --tono:152; }
  .rc-bin:nth-of-type(6n+5), .rc-row:nth-of-type(6n+5) { --tono:330; }
  .rc-bin:nth-of-type(6n+6), .rc-row:nth-of-type(6n+6) { --tono:18; }
  .rc-bin::before, .rc-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .rc-bin[data-done="true"], .rc-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  .rc-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .rc-chip:hover { transform:translateY(-2px); }
  .rc-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
  @media (prefers-reduced-motion: reduce){
    .rc-chip, .rc-chip:hover, .rc-chip[data-sel="true"] { transform:none; transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Editor de reseñas (simulador)
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono, tono, tam, radio = 12 }: { clave: string; icono: string; tono: number; tam: number; radio?: number }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div
      className="rc-foto"
      style={{ width: tam, height: tam, borderRadius: radio, background: `linear-gradient(135deg, hsl(${tono} 55% 28%), hsl(${tono + 40} 50% 14%))`, fontSize: Math.round(tam / 2.6) }}
    >
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

function Medidor({ label, valor, col }: { label: string; valor: number; col: string }) {
  return (
    <div className="rc-meter">
      <div className="rc-meter-top">
        <span>{label}</span>
        <strong style={{ color: col }}>{valor}</strong>
      </div>
      <div className="rc-meter-bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor}>
        <span style={{ width: `${valor}%`, background: col }} />
      </div>
    </div>
  );
}

const colorMedidor = (v: number) => (v >= 70 ? OK : v >= 40 ? AMBAR : NO);

const ICONO_ESTADO: Record<Reaccion["estado"], string> = {
  espera: "fa-ellipsis",
  bien: "fa-face-smile-beam",
  meh: "fa-face-meh",
  mal: "fa-face-frown",
};
const CLAVE_LECTOR: Record<Reaccion["id"], { clave: string; icono: string; tono: number }> = {
  dani: { clave: "lector-dani", icono: "fa-user", tono: 200 },
  ibarra: { clave: "lector-ibarra", icono: "fa-user-graduate", tono: 280 },
  memo: { clave: "lector-memo", icono: "fa-user-ninja", tono: 20 },
};

function EditorResenas({
  sel,
  ultima,
  ev,
  publicada,
  onElegir,
  onPublicar,
  onReiniciar,
  accent,
}: {
  sel: Seleccion;
  ultima: string | null;
  ev: EvaluacionResena;
  publicada: EvaluacionResena | null;
  onElegir: (parte: Parte, id: string) => void;
  onPublicar: () => void;
  onReiniciar: () => void;
  accent: string;
}) {
  const ult = opcionPorId(ultima ?? undefined);
  const veredicto = publicada ? veredictoPublicacion(publicada) : null;
  return (
    <div className="rc-ed">
      {/* Columna izquierda: la obra y las cuatro partes */}
      <div className="rc-col">
        <div className="rc-card">
          <div className="rc-obra">
            <Foto clave="portada" icono="fa-book" tono={190} tam={84} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, color: T.text3, fontWeight: 800 }}>Vas a reseñar (obra ficticia)</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>«{OBRA.titulo}»</div>
              <div style={{ fontSize: 14, color: T.text2 }}>{OBRA.autora}</div>
            </div>
          </div>
        </div>

        {PARTES.map((p, i) => {
          const elegida = sel[p.id];
          return (
            <div key={p.id} className="rc-card">
              <h5>
                <i className={`fa-solid ${p.icono}`} aria-hidden /> {i + 1}. {p.titulo}
              </h5>
              <div style={{ fontSize: 14, color: T.text3 }}>{p.pista}</div>
              {opcionesDe(p.id).map((o) => (
                <button key={o.id} type="button" className="rc-op" data-sel={elegida === o.id} data-falla={!!o.falla} aria-pressed={elegida === o.id} onClick={() => onElegir(p.id, o.id)}>
                  {o.texto}
                </button>
              ))}
              {elegida && ultima === elegida && ult && (
                <div className="rc-porque" data-falla={!!ult.falla} role="status">
                  <i className={`fa-solid ${ult.falla ? "fa-triangle-exclamation" : "fa-circle-check"}`} style={{ color: ult.falla ? NO : OK, marginTop: 3 }} aria-hidden />
                  <span>{ult.porque}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Columna derecha: vista previa, medidores y lectores */}
      <div className="rc-col rc-sticky">
        <div className="rc-card">
          <h5>
            <i className="fa-solid fa-newspaper" aria-hidden /> Vista previa publicada
          </h5>
          <div className="rc-prev">
            {PARTES.map((p) => {
              const o = opcionPorId(sel[p.id]);
              return o ? <p key={p.id}>{o.texto}</p> : <p key={p.id} className="rc-vacio">({p.titulo}: aún sin elegir)</p>;
            })}
          </div>
        </div>

        <div className="rc-card">
          <h5>
            <i className="fa-solid fa-gauge-high" aria-hidden /> Lo que nota el lector (simulación)
          </h5>
          <Medidor label="Credibilidad" valor={ev.m.cred} col={colorMedidor(ev.m.cred)} />
          <Medidor label="Utilidad" valor={ev.m.util} col={colorMedidor(ev.m.util)} />
          <Medidor label="Ganas de leerla" valor={ev.m.ganas} col={colorMedidor(ev.m.ganas)} />
          {ev.notas.map((n) => (
            <div key={n} className="rc-porque" data-falla="true">
              <i className="fa-solid fa-circle-exclamation" style={{ color: NO, marginTop: 3 }} aria-hidden />
              <span>{n}</span>
            </div>
          ))}
        </div>

        <div className="rc-card">
          <h5>
            <i className="fa-solid fa-users" aria-hidden /> Tres lectores reaccionan
          </h5>
          {ev.reacciones.map((r) => {
            const f = CLAVE_LECTOR[r.id];
            return (
              <div key={r.id} className="rc-lector" data-estado={r.estado}>
                <Foto clave={f.clave} icono={f.icono} tono={f.tono} tam={44} radio={22} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong>
                    {r.nombre} <i className={`fa-solid ${ICONO_ESTADO[r.estado]}`} aria-hidden />
                  </strong>
                  <small>{r.rol}</small>
                  <p>{r.texto}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="rc-btn" style={{ background: accent, color: "#04121f", border: "none" }} disabled={!ev.completa} onClick={onPublicar}>
            <i className="fa-solid fa-paper-plane" aria-hidden /> Publicar reseña
          </button>
          <button type="button" className="rc-btn" onClick={onReiniciar}>
            <i className="fa-solid fa-eraser" aria-hidden /> Empezar de nuevo
          </button>
        </div>
        {!ev.completa && <div style={{ fontSize: 14, color: T.text3 }}>Elige una frase en cada una de las 4 partes para poder publicar.</div>}
        {veredicto && (
          <div className="rc-veredicto" data-bien={veredicto.bien} role="status">
            <strong>
              <i className={`fa-solid ${veredicto.bien ? "fa-trophy" : "fa-circle-half-stroke"}`} aria-hidden /> {veredicto.titulo}
            </strong>
            <span>{veredicto.texto}</span>
          </div>
        )}
      </div>
    </div>
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

function EstructuraOrden({
  selE,
  shakeE,
  estrPos,
  onMatch,
  dropProps,
}: {
  selE: string | null;
  shakeE: boolean;
  estrPos: number;
  onMatch: (pasoId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      {ESTRUCTURA.map((c, i) => {
        const num = (
          <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${T.lineStrong}`, color: T.text2 }}>
            {i + 1}
          </span>
        );
        if (i < estrPos) {
          // ya colocado
          return (
            <div key={c.id} className="rc-step">
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, background: OK, color: "#04121f" }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>{c.texto}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: OK, border: `1px solid ${OK}55`, borderRadius: 6, padding: "3px 9px", flexShrink: 0 }}>
                {c.etapa}
              </span>
            </div>
          );
        }
        if (i === estrPos) {
          // hueco activo
          return (
            <div
              key={c.id}
              className="rc-slot"
              data-armed={!!selE}
              data-shake={shakeE}
              onClick={() => selE && onMatch(selE)}
              {...dropProps((id) => onMatch(id))}
              style={{ padding: "13px 16px", display: "flex", gap: 12, justifyContent: "flex-start", minHeight: 0 }}
            >
              {num}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-arrow-down" style={{ fontSize: 14 }} />
                <span style={{ fontWeight: 700 }}>Suelta aquí el siguiente componente</span>
              </div>
            </div>
          );
        }
        // bloqueado
        return (
          <div key={c.id} className="rc-locked">
            {num}
            <span style={{ fontSize: 14, color: T.text3 }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 8, fontSize: 14 }} />
              Componente {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BinsClase({
  selC,
  shakeC,
  ubicC,
  onMatch,
  dropProps,
}: {
  selC: string | null;
  shakeC: Clase | null;
  ubicC: Record<string, Clase>;
  onMatch: (itemId: string, bin: Clase) => void;
  dropProps: DropFactory;
}) {
  const bins: Clase[] = ["resumen", "juicio"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12, minWidth: 0 }}>
      {bins.map((bin) => {
        const info = CLASE_INFO[bin];
        const dentro = FRASES.filter((x) => ubicC[x.id] === bin);
        return (
          <div
            key={bin}
            className="rc-bin"
            data-shake={shakeC === bin}
            onClick={() => selC && onMatch(selC, bin)}
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
                dentro.map((x) => (
                  <span key={x.id} style={{ animation: "rcPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2, flexShrink: 0 }} />
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
        Cinco afirmaciones sobre las características y la estructura de la reseña crítica. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="rc-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
                  <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 3 }} />
                  <span>{q.retro}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="rc-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="rc-btn" onClick={reintentar}>
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
