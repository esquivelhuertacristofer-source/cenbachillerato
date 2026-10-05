"use client";

/**
 * Laboratorio — La exposición oral formal: coloquio, simposio y foro
 * Práctica experimental para LC-III-P07-A1 (Lengua y Comunicación III).
 *
 * El experimento central: un ENSAYO de exposición. El alumno planea una charla
 * para un público FICTICIO (28 estudiantes del plantel «Cumbres del Sur»):
 * elige apertura, estructura, apoyos, postura y ajusta ritmo, volumen y
 * duración. Una curva de atención (SVG) sobre la línea del tiempo sube o baja
 * en cada momento —apertura, introducción, tres argumentos, conclusión,
 * preguntas— y el público reacciona diciendo POR QUÉ. Las cifras son
 * «simulación». La lógica vive en `exposicion-oral-sim.ts`.
 *
 * Modos:
 *  1. «Ensayo de exposición» — el simulador (nuevo).
 *  2. «¿Coloquio, simposio o foro?» — clasifica seis escenarios (A1, A5).
 *  3. «Concepto y definición» — empareja concepto y definición (A5, A1).
 *  4. «Escribe el término» (glosario A5) y 5. «Completa el texto» (fill_blanks).
 *  + Cuestionario de comprensión (V/F verbatim de A4 + opción doble de A2) en «Reto».
 *
 * DOM + SVG (sin three.js): accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de LC-III·P07,
 * que vive en la pestaña «Teoría».
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { EXPOSICION_ORAL_HUECOS } from "./exposicion-oral-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { EXPOSICION_ORAL_FICHA } from "./exposicion-oral-ficha";
import {
  ESCENARIOS,
  FORMATO_INFO,
  CONCEPTOS,
  PARES,
  QUIZ,
  DATO_EXPOSICION,
  type Formato,
} from "./exposicion-oral-data";
import {
  APERTURAS,
  APOYOS,
  ESTRUCTURAS,
  POSTURAS,
  PLAN_INICIAL,
  PUBLICO,
  TEMA,
  consejo,
  ensayar,
  firma,
  type Ensayo,
  type Momento,
  type Plan,
} from "./exposicion-oral-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-exposicion-oral-reto";
const RUTA_SIM = "/media/labs-sim/exposicion-oral";

type Modo = "ensayo" | "formatos" | "conceptos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "ensayo", label: "Ensayo de exposición", icono: "fa-person-chalkboard" },
  { id: "formatos", label: "¿Coloquio, simposio o foro?", icono: "fa-people-arrows" },
  { id: "conceptos", label: "Concepto y definición", icono: "fa-diagram-project" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabExposicionOral({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("ensayo");

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

  // ── modo ensayo (simulador) ────────────────────────────────────────────
  // Explorar no castiga la partida: el plan se ve en vivo y solo «dar la
  // exposición» cuenta como ensayo.
  const [plan, setPlan] = useState<Plan>(PLAN_INICIAL);
  const [momento, setMomento] = useState(0);
  const [ensayosFirmas, setEnsayosFirmas] = useState<string[]>([]);
  const [exitoLogrado, setExitoLogrado] = useState(false);
  const [dada, setDada] = useState<Ensayo | null>(null);
  const ensayo = ensayar(plan);

  const cambiarPlan = (cambio: Partial<Plan>) => {
    setPlan((p) => ({ ...p, ...cambio }));
    setDada(null);
    if (sonido && "apertura" in cambio) audioRef.current?.blip();
  };
  const darExposicion = () => {
    setDada(ensayo);
    const f = firma(plan);
    setEnsayosFirmas((a) => (a.includes(f) ? a : [...a, f]));
    if (ensayo.exito) {
      setExitoLogrado(true);
      sfxOk();
    } else if (sonido) {
      audioRef.current?.incorrecto();
    }
  };
  const resetEnsayo = () => {
    setPlan(PLAN_INICIAL);
    setMomento(0);
    setDada(null);
  };

  // ── modo formatos (clasifica por formato de exposición) ────────────────
  const [ubicEsc, setUbicEsc] = useState<Record<string, Formato>>({});
  const [selEsc, setSelEsc] = useState<string | null>(null);
  const [shakeEsc, setShakeEsc] = useState<Formato | null>(null);
  const escLibres = ESCENARIOS.filter((e) => !ubicEsc[e.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarEsc = (escId: string, bin: Formato) => {
    if (ubicEsc[escId]) return;
    const e = ESCENARIOS.find((x) => x.id === escId);
    if (e && e.formato === bin) {
      setUbicEsc((prev) => ({ ...prev, [escId]: bin }));
      setSelEsc(null);
      sfxPlace();
      if (Object.keys(ubicEsc).length + 1 >= ESCENARIOS.length) {
        sfxOk();
        persistMejor(true, conceptosDone, glosarioDone);
      }
    } else {
      setShakeEsc(bin);
      sfxNo();
      window.setTimeout(() => setShakeEsc(null), 420);
    }
  };
  const resetFormatos = () => {
    setUbicEsc({});
    setSelEsc(null);
  };

  // ── modo conceptos (empareja concepto → definición) ────────────────────
  const [empCon, setEmpCon] = useState<Record<string, boolean>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeCon, setShakeCon] = useState<string | null>(null);
  const conLibres = CONCEPTOS.filter((c) => !empCon[c.id]).slice().sort((a, b) => a.concepto.localeCompare(b.concepto, "es"));

  const intentarCon = (chipId: string, rowId: string) => {
    if (empCon[rowId]) return;
    if (chipId === rowId) {
      setEmpCon((prev) => ({ ...prev, [rowId]: true }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(empCon).length + 1 >= CONCEPTOS.length) {
        sfxOk();
        persistMejor(formatosDone, true, glosarioDone);
      }
    } else {
      setShakeCon(rowId);
      sfxNo();
      window.setTimeout(() => setShakeCon(null), 420);
    }
  };
  const resetConceptos = () => {
    setEmpCon({});
    setSelCon(null);
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
  const formatosDone = Object.keys(ubicEsc).length >= ESCENARIOS.length;
  const conceptosDone = Object.keys(empCon).length >= CONCEPTOS.length;
  const modosHechos = (formatosDone ? 1 : 0) + (conceptosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Da la exposición con dos planes distintos y compara dónde cae la atención", done: ensayosFirmas.length >= 2 },
    { txt: "Logra una atención promedio de 70 o más, sin ningún momento bajo 55", done: exitoLogrado },
    { txt: "Clasifica los 6 escenarios por su formato", done: formatosDone },
    { txt: "Empareja los 6 conceptos con su definición", done: conceptosDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "ensayo" ? resetEnsayo : modo === "formatos" ? resetFormatos : modo === "conceptos" ? resetConceptos : resetGlosario;

  const lecturaDe: Record<Modo, string> = {
    ensayo: `Atención media ${ensayo.promedio} · la más baja ${ensayo.minimo}`,
    formatos: `Escenarios clasificados: ${Object.keys(ubicEsc).length} de ${ESCENARIOS.length}`,
    conceptos: `Conceptos emparejados: ${Object.keys(empCon).length} de ${CONCEPTOS.length}`,
    glosario: "Escribe cada término del glosario",
    texto: "Completa las palabras que faltan",
  };

  const pistaDe: Record<Modo, string> = {
    ensayo: "Cambia una decisión a la vez y mira la curva. Toca un momento para ver qué hace el público y por qué. Después pulsa «Dar la exposición».",
    formatos: "El coloquio es un diálogo entre pocos expertos; el simposio reúne exposiciones independientes de varios especialistas; el foro abre la palabra al público.",
    conceptos: "Distingue el proceso (planeación, ejecución, seguimiento) de la lógica argumentativa (introducción, desarrollo, conclusión).",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const escena = (
    <div style={{ color: T.text }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "ensayo" && (
        <PanelEnsayo
          plan={plan}
          ensayo={ensayo}
          momento={momento}
          dada={dada}
          onPlan={cambiarPlan}
          onMomento={setMomento}
          onDar={darExposicion}
          accent={accent}
        />
      )}

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={EXPOSICION_ORAL_HUECOS}
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

      {modo === "formatos" && (
        <Mesa>
          <div className="eo-banco">
            <div className="eo-cab">
              <Eyebrow>Arrastra cada escenario a su formato de exposición oral</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: formatosDone ? OK : T.text3 }}>
                {Object.keys(ubicEsc).length}/{ESCENARIOS.length}
              </span>
            </div>
            {escLibres.length === 0 ? (
              <div className="eo-listo">
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ESCENARIOS.length} escenarios!
              </div>
            ) : (
              escLibres.map((e) => (
                <button key={e.id} className="eo-chip" data-sel={selEsc === e.id} onClick={() => setSelEsc((s) => (s === e.id ? null : e.id))} {...dragProps(e.id)}>
                  {e.texto}
                </button>
              ))
            )}
          </div>
          <BinsFormatos selEsc={selEsc} shakeEsc={shakeEsc} ubicEsc={ubicEsc} onMatch={intentarEsc} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "conceptos" && (
        <Mesa>
          <div className="eo-banco">
            <div className="eo-cab">
              <Eyebrow>Arrastra cada concepto a su definición</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: conceptosDone ? OK : T.text3 }}>
                {Object.keys(empCon).length}/{CONCEPTOS.length}
              </span>
            </div>
            {conLibres.length === 0 ? (
              <div className="eo-listo">
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {CONCEPTOS.length} conceptos!
              </div>
            ) : (
              conLibres.map((c) => (
                <button key={c.id} className="eo-chip" data-sel={selCon === c.id} onClick={() => setSelCon((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                  <i className="fa-solid fa-diagram-project" style={{ fontSize: 14, color: T.text3 }} />
                  {c.concepto}
                </button>
              ))
            )}
          </div>
          <RowsConceptos selCon={selCon} shakeCon={shakeCon} empCon={empCon} onMatch={intentarCon} dropProps={dropProps} />
        </Mesa>
      )}

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
            persistMejor(formatosDone, conceptosDone, true);
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
                  {bestEstrellas >= 3 ? "¡Dominas los formatos de la exposición oral formal!" : "Termina los modos de arrastre y escritura para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={EXPOSICION_ORAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Los tres formatos" icono="fa-people-arrows">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(FORMATO_INFO) as Formato[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{FORMATO_INFO[k].titulo}.</strong> {FORMATO_INFO[k].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Proceso y lógica argumentativa" icono="fa-diagram-project">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CONCEPTOS.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{c.concepto}.</strong> {c.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{c.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-link">
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_EXPOSICION}</div>
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
  @keyframes eoShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes eoPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes eoTrazo { from { stroke-dashoffset:var(--eo-largo); } to { stroke-dashoffset:0; } }
  .eo-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:flex-start; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none;
    max-width:100%; text-align:left; line-height:1.4; }
  .eo-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .eo-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .eo-chip:active { cursor:grabbing; }
  .eo-banco { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; }
  .eo-cab { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
  .eo-listo { font-size:14px; color:${OK}; font-weight:700; display:flex; align-items:center; gap:9px; }
  .eo-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .eo-row[data-shake="true"] { animation:eoShake .4s; border-color:${NO}; }
  .eo-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .eo-slot { flex-shrink:0; min-width:min(100%, 200px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .eo-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .eo-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
  .eo-bin[data-shake="true"] { animation:eoShake .4s; border-color:${NO}; }
  .eo-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .eo-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .eo-q:disabled{ cursor:default; }
  .eo-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .eo-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .eo-btn:disabled { opacity:.45; cursor:default; }

  /* Ensayo de exposición */
  .eo-ens { display:grid; gap:16px; }
  .eo-dos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap:16px; align-items:start; }
  .eo-col { display:flex; flex-direction:column; gap:14px; min-width:0; }
  .eo-sticky { position:sticky; top:0; }
  .eo-card { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; display:flex; flex-direction:column; gap:10px; min-width:0; }
  .eo-card h5 { margin:0; font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text2}; display:flex; align-items:center; gap:8px; }
  .eo-card h5 i { color:${accent}; }
  .eo-foto { position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.8); }
  .eo-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .eo-sala { position:relative; border-radius:15px; overflow:hidden; border:1.5px solid ${T.line}; }
  .eo-sala-txt { position:absolute; left:0; right:0; bottom:0; padding:28px 14px 10px; background:linear-gradient(0deg, rgba(3,8,18,0.92), transparent);
    font-size:14px; color:#fff; font-weight:700; line-height:1.4; }
  .eo-caras { display:flex; flex-wrap:wrap; gap:6px; font-size:18px; }
  .eo-op { cursor:pointer; text-align:left; width:100%; display:flex; gap:10px; align-items:flex-start; padding:11px 13px; border-radius:12px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; font-size:14px; font-weight:600; line-height:1.45; transition:all .14s; }
  .eo-op:hover { border-color:${T.lineStrong}; color:#fff; }
  .eo-op[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; box-shadow:0 0 14px -6px ${accent}; }
  .eo-op i { margin-top:3px; color:${accent}; }
  .eo-chart { width:100%; height:auto; display:block; }
  .eo-chart .eo-linea { stroke-dasharray:var(--eo-largo); animation:eoTrazo .9s ease; }
  .eo-mom { display:flex; flex-wrap:wrap; gap:6px; }
  .eo-mom button { cursor:pointer; padding:7px 10px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:700; }
  .eo-mom button[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); color:#fff; }
  .eo-reac { border-radius:13px; padding:11px 13px; border:1.5px solid ${T.line}; background:${T.inset}; display:grid; gap:6px; font-size:14px; line-height:1.45; }
  .eo-reac[data-nivel="alta"] { border-color:${OK}77; background:${OK}10; }
  .eo-reac[data-nivel="media"] { border-color:${AMBAR}66; background:${AMBAR}0d; }
  .eo-reac[data-nivel="baja"] { border-color:${NO}77; background:${NO}10; }
  .eo-reac ul { margin:0; padding-left:18px; display:grid; gap:3px; color:${T.text2}; }
  .eo-veredicto { border-radius:13px; padding:12px 14px; font-size:14px; line-height:1.5; display:grid; gap:4px; border:1.5px solid ${NO}77; background:${NO}14; color:#fff; animation:eoPop .25s ease; }
  .eo-veredicto[data-bien="true"] { border-color:${OK}88; background:${OK}16; }
  .eo-veredicto strong { font-size:15px; }
  .eo-datos { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px; }
  @media (prefers-reduced-motion: reduce){ .eo-row[data-shake="true"], .eo-bin[data-shake="true"] { animation:none; } .eo-chart .eo-linea { animation:none; } }

  /* Identidad del tablero */
  .eo-bin, .eo-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .eo-bin:nth-of-type(6n+1), .eo-row:nth-of-type(6n+1) { --tono:188; }
  .eo-bin:nth-of-type(6n+2), .eo-row:nth-of-type(6n+2) { --tono:262; }
  .eo-bin:nth-of-type(6n+3), .eo-row:nth-of-type(6n+3) { --tono:44; }
  .eo-bin:nth-of-type(6n+4), .eo-row:nth-of-type(6n+4) { --tono:152; }
  .eo-bin:nth-of-type(6n+5), .eo-row:nth-of-type(6n+5) { --tono:330; }
  .eo-bin:nth-of-type(6n+6), .eo-row:nth-of-type(6n+6) { --tono:18; }
  .eo-bin::before, .eo-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .eo-bin[data-done="true"], .eo-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  .eo-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .eo-chip:hover { transform:translateY(-2px); }
  .eo-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
  @media (prefers-reduced-motion: reduce){
    .eo-chip, .eo-chip:hover, .eo-chip[data-sel="true"] { transform:none; transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Ensayo de exposición (simulador)
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono, tono, ancho, alto, radio = 12 }: { clave: string; icono: string; tono: number; ancho: number | string; alto: number; radio?: number }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div
      className="eo-foto"
      style={{ width: ancho, height: alto, borderRadius: radio, flexShrink: 0, background: `linear-gradient(135deg, hsl(${tono} 55% 28%), hsl(${tono + 40} 50% 14%))`, fontSize: Math.round(Math.min(alto, 120) / 2.4) }}
    >
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

const colorAtencion = (a: number) => (a >= 70 ? OK : a >= 55 ? AMBAR : NO);
const nivelAtencion = (a: number) => (a >= 70 ? "alta" : a >= 55 ? "media" : "baja");

/** Curva de atención sobre la línea del tiempo (SVG). */
function CurvaAtencion({ ensayo, duracion, seleccion, onElegir }: { ensayo: Ensayo; duracion: number; seleccion: number; onElegir: (i: number) => void }) {
  const W = 300;
  const H = 170;
  const x0 = 34;
  const x1 = 288;
  const y0 = 12;
  const y1 = 138;
  const X = (t: number) => x0 + (t / duracion) * (x1 - x0);
  const Y = (a: number) => y1 - (a / 100) * (y1 - y0);
  const pts = ensayo.momentos.map((m) => `${X(m.t).toFixed(1)},${Y(m.atencion).toFixed(1)}`).join(" ");
  const largo = 700;
  return (
    <svg className="eo-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Curva de atención durante la exposición: promedio ${ensayo.promedio} de 100`}>
      <rect x={x0} y={Y(100)} width={x1 - x0} height={Y(70) - Y(100)} fill={`${OK}12`} />
      <rect x={x0} y={Y(55)} width={x1 - x0} height={y1 - Y(55)} fill={`${NO}12`} />
      <line x1={x0} y1={Y(70)} x2={x1} y2={Y(70)} stroke={OK} strokeDasharray="4 4" strokeOpacity={0.6} />
      <line x1={x0} y1={Y(55)} x2={x1} y2={Y(55)} stroke={NO} strokeDasharray="4 4" strokeOpacity={0.6} />
      <text x={x0 - 4} y={Y(70) + 5} textAnchor="end" fontSize={14} fill={OK}>70</text>
      <text x={x0 - 4} y={Y(55) + 5} textAnchor="end" fontSize={14} fill={NO}>55</text>
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke="rgba(255,255,255,0.35)" />
      <text x={x1} y={H - 8} textAnchor="end" fontSize={14} fill="rgba(255,255,255,0.75)">{duracion} min</text>
      <text x={x0} y={H - 8} textAnchor="start" fontSize={14} fill="rgba(255,255,255,0.75)">0</text>
      <polyline key={`${duracion}-${pts}`} className="eo-linea" style={{ ["--eo-largo" as string]: largo }} points={pts} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {ensayo.momentos.map((m, i) => (
        <g
          key={m.id}
          role="button"
          tabIndex={0}
          aria-label={`${m.etiqueta}: atención ${m.atencion}`}
          style={{ cursor: "pointer" }}
          onClick={() => onElegir(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onElegir(i);
            }
          }}
        >
          <circle cx={X(m.t)} cy={Y(m.atencion)} r={i === seleccion ? 10 : 7} fill={colorAtencion(m.atencion)} stroke="#04121f" strokeWidth={2} />
        </g>
      ))}
    </svg>
  );
}

function PanelEnsayo({
  plan,
  ensayo,
  momento,
  dada,
  onPlan,
  onMomento,
  onDar,
  accent,
}: {
  plan: Plan;
  ensayo: Ensayo;
  momento: number;
  dada: Ensayo | null;
  onPlan: (c: Partial<Plan>) => void;
  onMomento: (i: number) => void;
  onDar: () => void;
  accent: string;
}) {
  const m: Momento = ensayo.momentos[Math.min(momento, ensayo.momentos.length - 1)]!;
  const atentos = Math.round((m.atencion / 100) * 12);
  return (
    <div className="eo-ens">
      <div className="eo-sala">
        <Foto clave="salon-grupo" icono="fa-people-group" tono={205} ancho="100%" alto={132} radio={0} />
        <div className="eo-sala-txt">
          <div>Público (ficticio): {PUBLICO}.</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Tema: {TEMA}</div>
        </div>
      </div>

      <div className="eo-dos">
        {/* Plan */}
        <div className="eo-col">
          <div className="eo-card">
            <h5><i className="fa-solid fa-door-open" aria-hidden /> 1. Apertura</h5>
            {APERTURAS.map((o) => (
              <button key={o.id} type="button" className="eo-op" data-sel={plan.apertura === o.id} aria-pressed={plan.apertura === o.id} onClick={() => onPlan({ apertura: o.id })}>
                <i className={`fa-solid ${o.icono}`} aria-hidden />
                <span>{o.texto}</span>
              </button>
            ))}
          </div>
          <div className="eo-card">
            <h5><i className="fa-solid fa-sitemap" aria-hidden /> 2. Estructura</h5>
            {ESTRUCTURAS.map((o) => (
              <button key={o.id} type="button" className="eo-op" data-sel={plan.estructura === o.id} aria-pressed={plan.estructura === o.id} onClick={() => onPlan({ estructura: o.id })}>
                <i className={`fa-solid ${o.icono}`} aria-hidden />
                <span>{o.texto}</span>
              </button>
            ))}
          </div>
          <div className="eo-card">
            <h5><i className="fa-solid fa-display" aria-hidden /> 3. Apoyos</h5>
            {APOYOS.map((o) => (
              <button key={o.id} type="button" className="eo-op" data-sel={plan.apoyos === o.id} aria-pressed={plan.apoyos === o.id} onClick={() => onPlan({ apoyos: o.id })}>
                <i className={`fa-solid ${o.icono}`} aria-hidden />
                <span>{o.texto}</span>
              </button>
            ))}
          </div>
          <div className="eo-card">
            <h5><i className="fa-solid fa-microphone-lines" aria-hidden /> 4. Voz, postura y tiempo</h5>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Foto clave="tarima" icono="fa-person-chalkboard" tono={30} ancho={72} alto={72} />
              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>La zona cómoda es de unas 105 a 145 palabras por minuto y volumen medio. Tu tiempo asignado es de unos 10 minutos (simulación).</div>
            </div>
            {POSTURAS.map((o) => (
              <button key={o.id} type="button" className="eo-op" data-sel={plan.postura === o.id} aria-pressed={plan.postura === o.id} onClick={() => onPlan({ postura: o.id })}>
                <i className={`fa-solid ${o.icono}`} aria-hidden />
                <span>{o.texto}</span>
              </button>
            ))}
            <Deslizador label="Ritmo" icon="fa-gauge-high" colr={accent} valor={`${plan.ritmo} pal/min`} min={70} max={200} step={5} value={plan.ritmo} onChange={(v) => onPlan({ ritmo: v })} hintL="lento" hintR="rápido" />
            <Deslizador label="Volumen" icon="fa-volume-high" colr={accent} valor={`${plan.volumen}`} min={0} max={100} step={5} value={plan.volumen} onChange={(v) => onPlan({ volumen: v })} hintL="bajo" hintR="alto" />
            <Deslizador label="Duración" icon="fa-hourglass-half" colr={accent} valor={`${plan.duracion} min`} min={4} max={20} step={1} value={plan.duracion} onChange={(v) => onPlan({ duracion: v })} hintL="corta" hintR="larga" />
          </div>
        </div>

        {/* Resultado */}
        <div className="eo-col eo-sticky">
          <div className="eo-card">
            <h5><i className="fa-solid fa-chart-line" aria-hidden /> Atención del público (simulación)</h5>
            <CurvaAtencion ensayo={ensayo} duracion={plan.duracion} seleccion={momento} onElegir={onMomento} />
            <div className="eo-mom" role="group" aria-label="Momentos de la exposición">
              {ensayo.momentos.map((x, i) => (
                <button key={x.id} type="button" data-on={i === momento} aria-pressed={i === momento} onClick={() => onMomento(i)}>
                  {x.etiqueta}
                </button>
              ))}
            </div>
            <div className="eo-datos">
              <Dato label="Atención media" value={`${ensayo.promedio}`} col={colorAtencion(ensayo.promedio)} />
              <Dato label="Momento más bajo" value={`${ensayo.minimo}`} col={colorAtencion(ensayo.minimo)} />
            </div>
          </div>

          <div className="eo-card">
            <h5><i className="fa-solid fa-users-viewfinder" aria-hidden /> {m.etiqueta} · minuto {m.t}</h5>
            <div className="eo-caras" aria-label={`${atentos} de 12 personas atentas`}>
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} className="fa-solid fa-user" style={{ color: i < atentos ? colorAtencion(m.atencion) : "rgba(255,255,255,0.18)" }} aria-hidden />
              ))}
            </div>
            <div className="eo-reac" data-nivel={nivelAtencion(m.atencion)} role="status">
              <strong style={{ color: "#fff" }}>Atención {m.atencion}: {m.reaccion}</strong>
              <span>Por qué: {m.razon}</span>
              {m.causas.length > 1 && (
                <ul>
                  {m.causas.map((c) => (
                    <li key={c.texto}>
                      {c.texto} <strong style={{ color: c.delta > 0 ? OK : NO }}>{c.delta > 0 ? `+${c.delta}` : c.delta}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="eo-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={onDar}>
              <i className="fa-solid fa-play" aria-hidden /> Dar la exposición
            </button>
          </div>
          {dada && (
            <div className="eo-veredicto" data-bien={dada.exito} role="status">
              <strong>
                <i className={`fa-solid ${dada.exito ? "fa-trophy" : "fa-circle-half-stroke"}`} aria-hidden /> {dada.exito ? "El grupo te siguió" : "El grupo se dispersó"}: media {dada.promedio}, mínima {dada.minimo}
              </strong>
              <span>{consejo(dada)}</span>
            </div>
          )}
        </div>
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

function BinsFormatos({
  selEsc,
  shakeEsc,
  ubicEsc,
  onMatch,
  dropProps,
}: {
  selEsc: string | null;
  shakeEsc: Formato | null;
  ubicEsc: Record<string, Formato>;
  onMatch: (escId: string, bin: Formato) => void;
  dropProps: DropFactory;
}) {
  const bins: Formato[] = ["coloquio", "simposio", "foro"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12, minWidth: 0 }}>
      {bins.map((bin) => {
        const info = FORMATO_INFO[bin];
        const dentro = ESCENARIOS.filter((e) => ubicEsc[e.id] === bin);
        return (
          <div
            key={bin}
            className="eo-bin"
            data-shake={shakeEsc === bin}
            onClick={() => selEsc && onMatch(selEsc, bin)}
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
                dentro.map((e) => (
                  <span key={e.id} style={{ animation: "eoPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {e.texto}
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

function RowsConceptos({
  selCon,
  shakeCon,
  empCon,
  onMatch,
  dropProps,
}: {
  selCon: string | null;
  shakeCon: string | null;
  empCon: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11, minWidth: 0 }}>
      {CONCEPTOS.map((c) => {
        const done = empCon[c.id];
        return (
          <div
            key={c.id}
            className="eo-row"
            data-shake={shakeCon === c.id}
            data-done={done}
            onClick={() => !done && selCon && onMatch(selCon, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="eo-slot" data-armed={!done && !!selCon} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "eoPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-diagram-project" />
                  {c.concepto}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> concepto
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{c.definicion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{c.ejemplo}</div>
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
        Seis preguntas sobre la exposición oral formal: coloquio, simposio y foro. Elige la respuesta correcta y pulsa «Comprobar».
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
                    <button key={oi} className="eo-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="eo-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="eo-btn" onClick={reintentar}>
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
