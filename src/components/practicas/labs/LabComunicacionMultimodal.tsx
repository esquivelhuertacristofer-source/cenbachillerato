"use client";

/**
 * Laboratorio — Comunicación digital multimodal: SIMULADOR de una publicación.
 * Práctica experimental para CD-III-P01-A2 (Cultura Digital III).
 *
 * El alumno no solo clasifica modos semióticos: COMPONE una publicación para
 * una campaña FICTICIA (jornada de reciclaje en la colonia «Los Pinos»). Elige
 * un canal y un público, combina texto, imagen, audio, color y diseño espacial
 * y una tarjeta de vista previa cambia en vivo mientras tres medidores
 * (claridad, alcance, accesibilidad; valores de simulación) responden. La
 * retroalimentación dice cómo cada modo suma o contradice el significado de
 * los demás: la idea de la comunicación multimodal.
 *
 * Modos extra (conservados): «¿Texto, imagen, audio o video?» (clasificar, en
 * Mesa), «Identidad digital y algoritmos» (emparejar, en Mesa),
 * «Escribe el término» y «Completa el texto» (verbatim de la progresión), y el
 * cuestionario V/F (A4) en la pestaña Reto. La teoría verbatim vive en la
 * pestaña Teoría. Lógica pura en `comunicacion-multimodal-sim.ts`.
 */

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { COMUNICACION_MULTIMODAL_HUECOS } from "./comunicacion-multimodal-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { COMUNICACION_MULTIMODAL_FICHA } from "./comunicacion-multimodal-ficha";
import { FondoTermino, VinetaTermino } from "./_vineta";
import {
  ELEMENTOS,
  MODALIDAD_INFO,
  CONCEPTOS,
  PARES,
  QUIZ,
  DATO_MULTIMODAL,
  type Modalidad,
} from "./comunicacion-multimodal-data";
import {
  ESCENARIOS,
  MIN_MODOS_PUBLICAR,
  SELECCION_INICIAL,
  SLOTS,
  UMBRAL,
  evaluar,
  type Escenario,
  type Resultado,
  type Seleccion,
  type SlotId,
} from "./comunicacion-multimodal-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-comunicacion-multimodal-reto";
const RUTA_FOTOS = "/media/labs-sim/comunicacion-multimodal";

type Modo = "campana" | "modalidad" | "conceptos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "campana", label: "Compón la campaña", icono: "fa-bullhorn" },
  { id: "modalidad", label: "¿Texto, imagen, audio o video?", icono: "fa-shapes" },
  { id: "conceptos", label: "Identidad digital y algoritmos", icono: "fa-user-shield" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabComunicacionMultimodal({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("campana");

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
  const sfxClick = () => sonido && audioRef.current?.blip();

  // ── modo campaña (simulador) ──────────────────────────────────────────
  const [escId, setEscId] = useState(ESCENARIOS[0]!.id);
  const [sel, setSel] = useState<Seleccion>(SELECCION_INICIAL);
  const [publicados, setPublicados] = useState(0);
  const [eficazDone, setEficazDone] = useState(false);
  const [ultima, setUltima] = useState<{ ok: boolean; r: Resultado } | null>(null);
  const escenario = ESCENARIOS.find((e) => e.id === escId)!;
  const resultado = evaluar(sel, escenario);

  const elegir = (slot: SlotId, id: string) => {
    sfxClick();
    setSel((s) => ({ ...s, [slot]: id }));
    setUltima(null);
  };
  const cambiarEscenario = (id: string) => {
    sfxClick();
    setEscId(id);
    setUltima(null);
  };
  const publicar = () => {
    if (resultado.modos < MIN_MODOS_PUBLICAR) return;
    setPublicados((n) => n + 1);
    setUltima({ ok: resultado.eficaz, r: resultado });
    if (resultado.eficaz) {
      partida.acierto();
      setEficazDone(true);
      if (sonido) audioRef.current?.correcto();
    } else {
      sfxNo();
    }
  };
  const resetCampana = () => {
    setSel(SELECCION_INICIAL);
    setUltima(null);
  };

  // arrastre nativo
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      // El hueco que deja la tarjeta mientras viaja. Por atributo y no por
      // estado: un render por cada gesto de arrastre se nota con 20 tarjetas.
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: DragEvent) => {
      // También cuando se suelta FUERA de cualquier zona; si no, la tarjeta se
      // queda medio borrada para siempre.
      e.currentTarget.removeAttribute("data-arrastrando");
      document.querySelectorAll('[data-sobre="true"]').forEach((z) => z.removeAttribute("data-sobre"));
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      e.currentTarget.setAttribute("data-sobre", "true");
    },
    onDragLeave: (e: DragEvent) => {
      // `dragleave` salta también al pasar sobre un HIJO de la zona. Apagar sin
      // comprobar deja la zona parpadeando mientras mueves la mano por dentro.
      const r = e.currentTarget.getBoundingClientRect();
      const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fuera) e.currentTarget.removeAttribute("data-sobre");
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      e.currentTarget.removeAttribute("data-sobre");
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
    "data-zona": "true" as const,
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  });

  // ── modo modalidad (clasifica por modo semiótico) ──────────────────────
  const [ubicMod, setUbicMod] = useState<Record<string, Modalidad>>({});
  const [selMod, setSelMod] = useState<string | null>(null);
  const [shakeMod, setShakeMod] = useState<Modalidad | null>(null);
  const modLibres = ELEMENTOS.filter((e) => !ubicMod[e.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarMod = (elemId: string, bin: Modalidad) => {
    if (ubicMod[elemId]) return;
    const el = ELEMENTOS.find((x) => x.id === elemId);
    if (el && el.modalidad === bin) {
      setUbicMod((e) => ({ ...e, [elemId]: bin }));
      setSelMod(null);
      sfxPlace();
      if (Object.keys(ubicMod).length + 1 >= ELEMENTOS.length) sfxOk();
    } else {
      setShakeMod(bin);
      sfxNo();
      window.setTimeout(() => setShakeMod(null), 420);
    }
  };
  const resetModalidad = () => {
    setUbicMod({});
    setSelMod(null);
  };

  // ── modo conceptos (empareja concepto → definición) ────────────────────
  const [empCon, setEmpCon] = useState<Record<string, boolean>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeCon, setShakeCon] = useState<string | null>(null);
  const conLibres = CONCEPTOS.filter((c) => !empCon[c.id]).slice().sort((a, b) => a.concepto.localeCompare(b.concepto, "es"));

  const intentarCon = (chipId: string, rowId: string) => {
    if (empCon[rowId]) return;
    if (chipId === rowId) {
      setEmpCon((e) => ({ ...e, [rowId]: true }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(empCon).length + 1 >= CONCEPTOS.length) sfxOk();
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
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const modalidadDone = Object.keys(ubicMod).length >= ELEMENTOS.length;
  const conceptosDone = Object.keys(empCon).length >= CONCEPTOS.length;
  const modosHechos = (eficazDone ? 1 : 0) + (modalidadDone ? 1 : 0) + (conceptosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar todos los modos vale 2★; la tercera se gana con precisión.
  const estrellas = Math.min(3, partida.estrellasCon(modosHechos, 5));

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Publica una pieza con al menos 4 modos (texto, imagen, audio, color, diseño)", done: publicados > 0 },
    { txt: `Logra claridad, alcance y accesibilidad de ${UMBRAL} o más`, done: eficazDone },
    { txt: "Clasifica los 8 elementos por modo semiótico", done: modalidadDone },
    { txt: "Empareja los 5 conceptos con su definición", done: conceptosDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const resetActual = modo === "texto" ? resetTexto : modo === "modalidad" ? resetModalidad : modo === "conceptos" ? resetConceptos : modo === "campana" ? resetCampana : resetGlosario;

  const lectura =
    modo === "campana"
      ? `Claridad ${resultado.claridad} · Alcance ${resultado.alcance} · Acceso ${resultado.acc}`
      : `${modosHechos}/5 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "campana" && (
        <Campana
          accent={accent}
          escenario={escenario}
          onEscenario={cambiarEscenario}
          sel={sel}
          onElegir={elegir}
          resultado={resultado}
          ultima={ultima}
          onPublicar={publicar}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={COMUNICACION_MULTIMODAL_HUECOS}
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

      {modo === "modalidad" && (
        <Mesa>
          <div className="cm-banco">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <Eyebrow>Arrastra cada elemento a su modo</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: modalidadDone ? OK : T.text3 }}>
                {Object.keys(ubicMod).length}/{ELEMENTOS.length}
              </span>
            </div>
            {modLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ELEMENTOS.length} elementos!
              </div>
            ) : (
              modLibres.map((el) => (
                <button key={el.id} className="cm-chip" data-sel={selMod === el.id} onClick={() => setSelMod((s) => (s === el.id ? null : el.id))} {...dragProps(el.id)}>
                  {el.texto}
                </button>
              ))
            )}
          </div>
          <BinsModalidad selMod={selMod} shakeMod={shakeMod} ubicMod={ubicMod} onMatch={intentarMod} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "conceptos" && (
        <Mesa>
          <div className="cm-banco">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <Eyebrow>Arrastra cada concepto a su definición</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: conceptosDone ? OK : T.text3 }}>
                {Object.keys(empCon).length}/{CONCEPTOS.length}
              </span>
            </div>
            {conLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {CONCEPTOS.length} conceptos!
              </div>
            ) : (
              conLibres.map((c) => (
                <button key={c.id} className="cm-chip" data-sel={selCon === c.id} onClick={() => setSelCon((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                  <i className="fa-solid fa-user-shield" style={{ fontSize: 14, color: T.text3 }} />
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
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}
    </div>
  );

  const pista: Record<Modo, string> = {
    campana: "Cada modo aporta algo distinto, pero el significado nace de cómo se combinan. Prueba un cambio a la vez y mira qué medidor se mueve y qué dice la retroalimentación.",
    modalidad: "El significado emerge de la interacción entre modos: texto, imagen, audio e imagen en movimiento (video).",
    conceptos: "Ante un contenido digital pregúntate quién lo produjo, con qué objetivo y qué algoritmos deciden que lo veas.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
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
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
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
                  {bestEstrellas >= 3 ? "¡Lees los medios digitales con mirada crítica!" : "Termina los cinco modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pista[modo]}</div>
              </Bloque>
              {modo === "campana" && (
                <Bloque titulo="Cómo leer los medidores" icono="fa-chart-simple">
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    <strong style={{ color: T.text }}>Claridad:</strong> si el mensaje se entiende. <strong style={{ color: T.text }}>Alcance:</strong> a cuánta gente llega en este canal. <strong style={{ color: T.text }}>Accesibilidad:</strong> si lo perciben personas con distintas capacidades. Todas las cifras son de simulación.
                  </div>
                </Bloque>
              )}
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
                <FichaTeorica data={COMUNICACION_MULTIMODAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Modos semióticos" icono="fa-shapes">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(MODALIDAD_INFO) as Modalidad[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{MODALIDAD_INFO[k].titulo}.</strong> {MODALIDAD_INFO[k].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Identidad digital y algoritmos" icono="fa-user-shield">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CONCEPTOS.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{c.concepto}.</strong> {c.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{c.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-spell-check">
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_MULTIMODAL}</div>
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
  @keyframes cmShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes cmPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes cmBar { 0%,100%{transform:scaleY(.35);} 50%{transform:scaleY(1);} }
  .cm-banco { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; min-width:0; }
  .cm-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:flex-start; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .cm-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .cm-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .cm-chip[data-arrastrando="true"] { opacity:.4; }
  .cm-chip:active { cursor:grabbing; }
  .cm-row { position:relative; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .cm-row[data-shake="true"] { animation:cmShake .4s; border-color:${NO}; }
  .cm-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .cm-row[data-sobre="true"], .cm-bin[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.12); }
  .cm-slot { flex-shrink:0; min-width:min(100%, 200px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .cm-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .cm-bin { position:relative; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:140px; }
  .cm-bin[data-shake="true"] { animation:cmShake .4s; border-color:${NO}; }
  .cm-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .cm-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .cm-q:disabled{ cursor:default; }
  .cm-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .cm-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .cm-btn:disabled { opacity:.45; cursor:not-allowed; }
  .cm-btn-main { background:${accent}; color:#04121f; border-color:transparent; }

  /* Simulador */
  .cm-esc { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:10px; }
  .cm-esc-b { cursor:pointer; display:flex; flex-direction:column; gap:8px; text-align:left; padding:8px; border-radius:14px; border:1.5px solid ${T.line};
    background:${T.glass}; color:${T.text}; font-size:14px; font-weight:800; min-width:0; transition:border-color .14s, background .14s; }
  .cm-esc-b[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); }
  .cm-esc-b span { padding:0 4px 4px; line-height:1.3; }
  .cm-sim { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:14px; align-items:start; }
  .cm-panel { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; min-width:0; }
  .cm-slotrow { display:grid; gap:7px; }
  .cm-slotrow h5 { margin:0; font-size:14px; font-weight:900; color:${T.text}; display:flex; align-items:center; gap:8px; }
  .cm-opts { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 120px), 1fr)); gap:7px; }
  .cm-opt { cursor:pointer; display:flex; flex-direction:column; align-items:flex-start; gap:3px; padding:9px 10px; border-radius:11px; border:1.5px solid ${T.line};
    background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:700; text-align:left; line-height:1.3; min-width:0; transition:border-color .14s, background .14s; }
  .cm-opt:hover { border-color:${T.lineStrong}; color:#fff; }
  .cm-opt[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); color:#fff; }
  .cm-opt i { color:${accent}; }
  .cm-foto { position:relative; overflow:hidden; border-radius:12px; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(${rgba},0.35) 0%, rgba(8,19,31,0.9) 100%); }
  .cm-foto > i { font-size:30px; color:rgba(255,255,255,0.5); }
  .cm-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .cm-barra { height:12px; border-radius:7px; background:${T.inset}; border:1px solid ${T.line}; position:relative; overflow:hidden; }
  .cm-barra > i { display:block; height:100%; border-radius:7px; transition:width .5s cubic-bezier(.2,.8,.2,1), background .5s; }
  .cm-barra > b { position:absolute; top:0; bottom:0; width:2px; background:#fff; opacity:.7; }
  .cm-ondas { display:inline-flex; align-items:flex-end; gap:3px; height:18px; }
  .cm-ondas i { width:4px; height:100%; border-radius:2px; background:currentColor; transform-origin:bottom; animation:cmBar .9s ease-in-out infinite; }
  .cm-ondas i:nth-child(2) { animation-delay:.15s; } .cm-ondas i:nth-child(3) { animation-delay:.3s; } .cm-ondas i:nth-child(4) { animation-delay:.45s; }
  .cm-nota { display:flex; gap:9px; align-items:flex-start; font-size:14px; line-height:1.45; padding:9px 11px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  .cm-nota[data-t="suma"] { border-color:${OK}55; }
  .cm-nota[data-t="resta"] { border-color:${NO}55; }
  .cm-pop { animation:cmPop .28s ease; }
  @media (prefers-reduced-motion: reduce){
    .cm-row[data-shake="true"], .cm-bin[data-shake="true"], .cm-pop, .cm-ondas i { animation:none; }
    .cm-chip, .cm-chip:hover, .cm-chip[data-sel="true"] { transform:none; transition:none; }
    .cm-barra > i { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador: componer la publicación
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Foto de la escena con respaldo (gradiente + ícono) si el archivo aún no existe. */
function FotoSim({ clave, icono, ratio = "16 / 9", alt = "" }: { clave: string; icono: string; ratio?: string; alt?: string }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="cm-foto" style={{ aspectRatio: ratio }}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {ok && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt={alt} loading="lazy" onError={() => setOk(false)} />}
    </div>
  );
}

const PALETA: Record<string, { bg: string; fg: string; sub: string }> = {
  pastel: { bg: "#F1E9FB", fg: "#D8C8F0", sub: "#E4D8F5" },
  contraste: { bg: "#FFD60A", fg: "#111111", sub: "#1F1F1F" },
  neon: { bg: "#FF1FBF", fg: "#00FF9C", sub: "#B6FF00" },
};

const TITULAR = "Limpiemos juntos el parque";
const PARRAFO =
  "El sábado, vecinas y vecinos de la colonia Los Pinos (ficticia) se reunirán en el parque para recoger residuos, separar materiales reciclables y sembrar árboles. Se pide traer guantes, bolsas y agua; habrá herramientas para quien no pueda llevarlas. La jornada empieza a las diez de la mañana y termina al mediodía.";

function Vista({ sel }: { sel: Seleccion }) {
  const p = PALETA[sel.color]!;
  const d = sel.diseno;
  const apretado = d === "apretado";
  const jerarquia = d === "jerarquia";
  const centrado = d === "centrado";

  const texto =
    sel.texto === "sin" ? (
      <div style={{ fontSize: 14, fontStyle: "italic", opacity: 0.45 }}>(sin texto)</div>
    ) : sel.texto === "titular" ? (
      <div style={{ fontSize: jerarquia ? 26 : centrado ? 17 : 16, fontWeight: 900, lineHeight: apretado ? 1 : 1.15, color: p.fg }}>{TITULAR}</div>
    ) : (
      <div style={{ fontSize: 14, lineHeight: apretado ? 1.05 : 1.45, color: p.sub }}>{PARRAFO}</div>
    );

  const imagen =
    sel.imagen === "sin" ? (
      <div style={{ fontSize: 14, fontStyle: "italic", opacity: 0.45 }}>(sin imagen)</div>
    ) : sel.imagen === "foto" ? (
      <div style={{ width: apretado ? "70%" : "100%", marginTop: apretado ? -6 : 0 }}>
        <FotoSim clave="foto-jornada" icono="fa-people-group" ratio={jerarquia ? "16 / 9" : "2 / 1"} />
      </div>
    ) : (
      <div style={{ fontSize: jerarquia ? 64 : 40, color: p.fg, lineHeight: 1, marginTop: apretado ? -6 : 0 }}>
        <i className="fa-solid fa-recycle" aria-hidden />
      </div>
    );

  const audio =
    sel.audio === "sin" ? null : (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: p.fg, padding: "4px 10px", borderRadius: 99, border: `1.5px solid ${p.fg}` }}>
        <span className="cm-ondas" aria-hidden>
          <i /><i /><i /><i />
        </span>
        {sel.audio === "locucion" ? "Locución" : "Música"}
      </div>
    );

  return (
    <div
      role="img"
      aria-label="Vista previa de la publicación"
      style={{
        background: p.bg,
        borderRadius: 16,
        padding: apretado ? 6 : jerarquia ? 16 : 14,
        display: "flex",
        flexDirection: "column",
        gap: apretado ? 0 : jerarquia ? 12 : 9,
        alignItems: centrado ? "center" : "stretch",
        textAlign: centrado ? "center" : "left",
        minHeight: 230,
        justifyContent: centrado ? "center" : "flex-start",
        transition: "background .3s",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      {jerarquia ? (
        <>
          {texto}
          {imagen}
          {audio}
        </>
      ) : (
        <>
          {imagen}
          {texto}
          {audio}
        </>
      )}
    </div>
  );
}

function Medidor({ etiqueta, valor, icono }: { etiqueta: string; valor: number; icono: string }) {
  const col = valor >= UMBRAL ? OK : valor >= 45 ? AMBAR : NO;
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: T.text }}>
        <span>
          <i className={`fa-solid ${icono}`} aria-hidden style={{ color: col, marginRight: 7 }} />
          {etiqueta}
        </span>
        <span style={{ color: col, fontVariantNumeric: "tabular-nums" }}>{valor}</span>
      </div>
      <div className="cm-barra" role="img" aria-label={`${etiqueta}: ${valor} de 100`}>
        <i style={{ width: `${valor}%`, background: col }} />
        <b style={{ left: `${UMBRAL}%` }} />
      </div>
    </div>
  );
}

function deltaTxt(e: { claridad?: number; alcance?: number; acc?: number }): string {
  const partes: string[] = [];
  const f = (n: number | undefined, nombre: string) => {
    if (n) partes.push(`${nombre} ${n > 0 ? "+" : ""}${n}`);
  };
  f(e.claridad, "claridad");
  f(e.alcance, "alcance");
  f(e.acc, "accesib.");
  return partes.join(" · ");
}

function Campana({
  accent,
  escenario,
  onEscenario,
  sel,
  onElegir,
  resultado,
  ultima,
  onPublicar,
}: {
  accent: string;
  escenario: Escenario;
  onEscenario: (id: string) => void;
  sel: Seleccion;
  onElegir: (slot: SlotId, id: string) => void;
  resultado: Resultado;
  ultima: { ok: boolean; r: Resultado } | null;
  onPublicar: () => void;
}) {
  const faltan = MIN_MODOS_PUBLICAR - resultado.modos;
  const masBajo = (
    [
      ["claridad", resultado.claridad],
      ["alcance", resultado.alcance],
      ["accesibilidad", resultado.acc],
    ] as [string, number][]
  ).sort((a, b) => a[1] - b[1])[0]!;
  return (
    <>
      <div className="cm-panel">
        <Eyebrow>Campaña ficticia · «Jornada de reciclaje, colonia Los Pinos» (simulación)</Eyebrow>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          Elige dónde se va a publicar y combina los modos. La tarjeta cambia en vivo y los medidores te dicen cómo le va a la publicación (valores de simulación).
        </div>
        <div className="cm-esc" role="tablist" aria-label="Canal y público">
          {ESCENARIOS.map((e) => (
            <button key={e.id} type="button" role="tab" aria-selected={e.id === escenario.id} className="cm-esc-b" data-on={e.id === escenario.id} onClick={() => onEscenario(e.id)}>
              <FotoSim clave={e.foto} icono={e.icono} ratio="16 / 9" />
              <span>{e.titulo}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Canal:</strong> {escenario.canal}. <strong style={{ color: T.text }}>Público:</strong> {escenario.publico}. <strong style={{ color: accent }}>{escenario.necesidad}</strong>
        </div>
      </div>

      <div className="cm-sim">
        <div className="cm-panel">
          <Eyebrow>Tus decisiones</Eyebrow>
          {SLOTS.map((s) => (
            <div key={s.id} className="cm-slotrow">
              <h5>
                <i className={`fa-solid ${s.icono}`} aria-hidden style={{ color: accent }} /> {s.titulo}
              </h5>
              <div className="cm-opts">
                {s.opciones.map((o) => (
                  <button key={o.id} type="button" className="cm-opt" data-on={sel[s.id] === o.id} aria-pressed={sel[s.id] === o.id} onClick={() => onElegir(s.id, o.id)}>
                    <i className={`fa-solid ${o.icono}`} aria-hidden />
                    {o.nombre}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="cm-panel">
          <Eyebrow>Vista previa · simulación</Eyebrow>
          <Vista sel={sel} />
          <Medidor etiqueta="Claridad" valor={resultado.claridad} icono="fa-eye" />
          <Medidor etiqueta="Alcance" valor={resultado.alcance} icono="fa-bullhorn" />
          <Medidor etiqueta="Accesibilidad" valor={resultado.acc} icono="fa-universal-access" />
          <div style={{ fontSize: 14, color: T.text3 }}>La raya blanca marca {UMBRAL}: una publicación eficaz llega ahí en los tres.</div>
        </div>
      </div>

      <div className="cm-panel">
        <Eyebrow>Cómo se combinan tus modos</Eyebrow>
        <div style={{ display: "grid", gap: 7 }}>
          {SLOTS.map((s) => {
            const o = s.opciones.find((x) => x.id === sel[s.id])!;
            return (
              <div key={s.id} className="cm-nota" data-t="neutro">
                <i className={`fa-solid ${o.icono}`} aria-hidden style={{ color: accent, marginTop: 3 }} />
                <span>
                  <strong style={{ color: T.text }}>{s.titulo}: {o.nombre}.</strong> {o.detalle} <span style={{ color: T.text3 }}>({deltaTxt(o.efecto) || "sin efecto"})</span>
                </span>
              </div>
            );
          })}
          {resultado.notas.map((n) => (
            <div key={n.clave} className="cm-nota cm-pop" data-t={n.tono}>
              <i className={`fa-solid ${n.tono === "suma" ? "fa-circle-plus" : "fa-circle-minus"}`} aria-hidden style={{ color: n.tono === "suma" ? OK : NO, marginTop: 3 }} />
              <span>
                {n.texto} <span style={{ color: T.text3 }}>({deltaTxt(n.delta)})</span>
              </span>
            </div>
          ))}
        </div>
        <button type="button" className="cm-btn cm-btn-main" disabled={faltan > 0} onClick={onPublicar}>
          <i className="fa-solid fa-paper-plane" aria-hidden /> Publicar la pieza
        </button>
        {faltan > 0 && <div style={{ fontSize: 14, color: AMBAR }}>Una pieza multimodal combina al menos {MIN_MODOS_PUBLICAR} modos: agrega texto, imagen o audio.</div>}
        {ultima && (
          <div className="cm-pop" style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 700, color: ultima.ok ? OK : AMBAR }}>
            <i className={`fa-solid ${ultima.ok ? "fa-trophy" : "fa-circle-half-stroke"}`} aria-hidden style={{ marginRight: 8 }} />
            {ultima.ok
              ? "Publicación eficaz: los modos se complementan y el mensaje llega claro a este público."
              : `Todavía no llega: lo más débil es la ${masBajo[0]} (${masBajo[1]}). Cambia un modo y compara.`}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de los modos de arrastre (reciben los manejadores como props)
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
};

function BinsModalidad({
  selMod,
  shakeMod,
  ubicMod,
  onMatch,
  dropProps,
}: {
  selMod: string | null;
  shakeMod: Modalidad | null;
  ubicMod: Record<string, Modalidad>;
  onMatch: (elemId: string, bin: Modalidad) => void;
  dropProps: DropFactory;
}) {
  const bins: Modalidad[] = ["texto", "imagen", "audio", "video"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = MODALIDAD_INFO[bin];
        const dentro = ELEMENTOS.filter((el) => ubicMod[el.id] === bin);
        return (
          <div
            key={bin}
            className="cm-bin"
            data-shake={shakeMod === bin}
            onClick={() => selMod && onMatch(selMod, bin)}
            style={{ isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((el) => (
                  <span key={el.id} style={{ animation: "cmPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {el.texto}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {CONCEPTOS.map((c) => {
        const done = empCon[c.id];
        return (
          <div
            key={c.id}
            className="cm-row"
            data-shake={shakeCon === c.id}
            data-done={done}
            onClick={() => !done && selCon && onMatch(selCon, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="cm-slot" data-armed={!done && !!selCon} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "cmPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-user-shield" />
                  {c.concepto}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> concepto
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{c.definicion}</div>
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
        Cinco afirmaciones sobre la comunicación multimodal, la identidad digital y los algoritmos. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="cm-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="cm-btn cm-btn-main" onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cm-btn" onClick={reintentar}>
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
