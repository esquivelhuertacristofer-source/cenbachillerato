"use client";

/**
 * Laboratorio — Personajes y escenarios: TALLER DE ESCENA
 * Práctica experimental para LC-II-P04-A4 (Lengua y Comunicación II).
 *
 * El alumno ya no solo clasifica: escribe una escena. En el «Taller de escena»
 * elige cómo es Marisol (personaje FICTICIO: rasgo y motivación), dónde está
 * (escenario con imagen) y qué hace; el fragmento de relato cambia a la vista,
 * un medidor dice qué tan coherente es su conducta con su caracterización y
 * otro cuánta tensión le pone el escenario. Las reglas son tablas pequeñas y
 * deterministas en `personajes-escenarios-sim.ts`.
 *
 * Modos:
 *  0. «Taller de escena»        — el simulador (experimento central).
 *  1. «¿Qué tipo de personaje?» — clasifica nueve descripciones por su ROL.
 *  2. «¿Qué tipo de escenario?» — clasifica nueve ambientes. Si falla, se explica por qué.
 *  3. «Escribe el término»      — glosario A5 verbatim.
 *  4. «Completa el texto»       — fill_blanks A6 verbatim.
 *  + Cuestionario V/F (A4 + arquetipo de A2) en la pestaña «Reto».
 *
 * DOM puro (sin three.js). Contenido curricular VERBATIM de LC-II·P04: vive en
 * la pestaña «Teoría».
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { PERSONAJES_ESCENARIOS_HUECOS } from "./personajes-escenarios-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { PERSONAJES_ESCENARIOS_FICHA } from "./personajes-escenarios-ficha";
import {
  PERSONAJES,
  TIPO_PERSONAJE_INFO,
  ESCENARIOS,
  TIPO_ESCENARIO_INFO,
  PARES,
  QUIZ,
  DATO_ESCENARIO,
  type TipoPersonaje,
  type TipoEscenario,
} from "./personajes-escenarios-data";
import {
  ACCIONES,
  AMBIENTES,
  INICIAL,
  MOTIVOS,
  NOMBRE,
  RASGOS,
  UMBRAL_COHERENTE,
  coherenciaDe,
  escenaDe,
  tensionDe,
  type Ambiente,
  type Seleccion,
} from "./personajes-escenarios-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-personajes-escenarios-reto";
const RUTA_FOTOS = "/media/labs-sim/personajes-escenarios";

type Modo = "taller" | "personajes" | "escenarios" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "taller", label: "Taller de escena", icono: "fa-pen-nib" },
  { id: "personajes", label: "¿Qué tipo de personaje?", icono: "fa-masks-theater" },
  { id: "escenarios", label: "¿Qué tipo de escenario?", icono: "fa-mountain-sun" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabPersonajesEscenarios({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("taller");

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

  // ── TALLER DE ESCENA (simulador) ──────────────────────────────────────
  const [sel, setSel] = useState<Seleccion>(INICIAL);
  const [mejorCoh, setMejorCoh] = useState(() => coherenciaDe(INICIAL));
  const [visitados, setVisitados] = useState<Ambiente[]>([INICIAL.ambiente]);
  const escena = escenaDe(sel);

  const elegir = (cambio: Partial<Seleccion>) => {
    const nueva = { ...sel, ...cambio };
    setSel(nueva);
    const c = coherenciaDe(nueva);
    if (c > mejorCoh) setMejorCoh(c);
    setVisitados((v) => (v.includes(nueva.ambiente) ? v : [...v, nueva.ambiente]));
    if (cambio.ambiente === undefined || cambio.ambiente === sel.ambiente) {
      if (c > coherenciaDe(sel)) sfxPlace();
      else if (c < coherenciaDe(sel)) sfxNo();
      else sfxClick();
    } else sfxClick();
  };
  const resetTaller = () => {
    setSel(INICIAL);
    setMejorCoh(coherenciaDe(INICIAL));
    setVisitados([INICIAL.ambiente]);
  };

  // ── modo personajes (clasifica por rol) ────────────────────────────────
  const [ubicPers, setUbicPers] = useState<Record<string, TipoPersonaje>>({});
  const [selPers, setSelPers] = useState<string | null>(null);
  const [shakePers, setShakePers] = useState<TipoPersonaje | null>(null);
  const [avisoPers, setAvisoPers] = useState<string | null>(null);
  const persLibres = PERSONAJES.filter((p) => !ubicPers[p.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarPers = (persId: string, bin: TipoPersonaje) => {
    if (ubicPers[persId]) return;
    const p = PERSONAJES.find((x) => x.id === persId);
    if (p && p.tipo === bin) {
      setUbicPers((e) => ({ ...e, [persId]: bin }));
      setSelPers(null);
      setAvisoPers(null);
      sfxPlace();
      if (Object.keys(ubicPers).length + 1 >= PERSONAJES.length) sfxOk();
    } else if (p) {
      const real = TIPO_PERSONAJE_INFO[p.tipo];
      setAvisoPers(`No es «${TIPO_PERSONAJE_INFO[bin].titulo}». Es ${real.titulo.toLowerCase()}: ${real.subtitulo.toLowerCase()}`);
      setShakePers(bin);
      sfxNo();
      window.setTimeout(() => setShakePers(null), 420);
    }
  };
  const resetPersonajes = () => {
    setUbicPers({});
    setSelPers(null);
    setAvisoPers(null);
  };

  // ── modo escenarios (clasifica por ambiente) ───────────────────────────
  const [ubicEsc, setUbicEsc] = useState<Record<string, TipoEscenario>>({});
  const [selEsc, setSelEsc] = useState<string | null>(null);
  const [shakeEsc, setShakeEsc] = useState<TipoEscenario | null>(null);
  const [avisoEsc, setAvisoEsc] = useState<string | null>(null);
  const escLibres = ESCENARIOS.filter((s) => !ubicEsc[s.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarEsc = (escId: string, bin: TipoEscenario) => {
    if (ubicEsc[escId]) return;
    const s = ESCENARIOS.find((x) => x.id === escId);
    if (s && s.tipo === bin) {
      setUbicEsc((e) => ({ ...e, [escId]: bin }));
      setSelEsc(null);
      setAvisoEsc(null);
      sfxPlace();
      if (Object.keys(ubicEsc).length + 1 >= ESCENARIOS.length) sfxOk();
    } else if (s) {
      const real = TIPO_ESCENARIO_INFO[s.tipo];
      setAvisoEsc(`No es «${TIPO_ESCENARIO_INFO[bin].titulo}». Es ${real.titulo.toLowerCase()}: ${real.subtitulo.toLowerCase()}`);
      setShakeEsc(bin);
      sfxNo();
      window.setTimeout(() => setShakeEsc(null), 420);
    }
  };
  const resetEscenarios = () => {
    setUbicEsc({});
    setSelEsc(null);
    setAvisoEsc(null);
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
  const personajesDone = Object.keys(ubicPers).length >= PERSONAJES.length;
  const escenariosDone = Object.keys(ubicEsc).length >= ESCENARIOS.length;
  const coherenteHecho = mejorCoh >= UMBRAL_COHERENTE;
  const tresEscenarios = visitados.length >= AMBIENTES.length;
  const tallerDone = coherenteHecho && tresEscenarios;
  const modosHechos = (tallerDone ? 1 : 0) + (personajesDone ? 1 : 0) + (escenariosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Corrige a Marisol: que su conducta sea coherente (75 % o más)", done: coherenteHecho },
    { txt: "Lleva la misma escena a los 3 escenarios y compara la tensión", done: tresEscenarios },
    { txt: "Clasifica los 9 personajes por su rol", done: personajesDone },
    { txt: "Clasifica los 9 escenarios por su ambiente", done: escenariosDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
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
    modo === "texto" ? resetTexto : modo === "taller" ? resetTaller : modo === "personajes" ? resetPersonajes : modo === "escenarios" ? resetEscenarios : resetGlosario;

  const lecturas: Record<Modo, string> = {
    taller: `Coherencia ${escena.coherencia} % · tensión ${escena.tension}/5`,
    personajes: `${Object.keys(ubicPers).length}/${PERSONAJES.length} personajes`,
    escenarios: `${Object.keys(ubicEsc).length}/${ESCENARIOS.length} escenarios`,
    glosario: `${modosHechos}/5 modos · ${bestEstrellas}★`,
    texto: `${modosHechos}/5 modos · ${bestEstrellas}★`,
  };

  const pistaDe: Record<Modo, string> = {
    taller: "Cambia UNA cosa a la vez y mira qué se mueve: el carácter y la acción cambian la coherencia; el escenario cambia la tensión.",
    personajes: "El protagonista lleva la historia; el antagonista se le opone; el secundario acompaña sin ser el centro.",
    escenarios: "El escenario histórico usa épocas reales; el fantástico, elementos sobrenaturales; el realista, la vida cotidiana.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const escenaUI = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "taller" && <Taller sel={sel} escena={escena} onElegir={elegir} accent={accent} />}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={PERSONAJES_ESCENARIOS_HUECOS}
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

      {modo === "personajes" && (
        <Mesa>
          <div style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Lleva cada personaje a su rol</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: personajesDone ? OK : T.text3 }}>
                {Object.keys(ubicPers).length}/{PERSONAJES.length}
              </span>
            </div>
            {persLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 9 personajes!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {persLibres.map((p) => (
                  <button key={p.id} className="pe-chip" data-sel={selPers === p.id} onClick={() => setSelPers((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                    {p.texto}
                  </button>
                ))}
              </div>
            )}
            {avisoPers && <div className="pe-aviso" role="status"><i className="fa-solid fa-circle-info" aria-hidden /> {avisoPers}</div>}
          </div>
          <BinsPersonajes selPers={selPers} shakePers={shakePers} ubicPers={ubicPers} onMatch={intentarPers} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "escenarios" && (
        <Mesa>
          <div style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Lleva cada escenario a su ambiente</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: escenariosDone ? OK : T.text3 }}>
                {Object.keys(ubicEsc).length}/{ESCENARIOS.length}
              </span>
            </div>
            {escLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 9 escenarios!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {escLibres.map((s) => (
                  <button key={s.id} className="pe-chip" data-sel={selEsc === s.id} onClick={() => setSelEsc((x) => (x === s.id ? null : s.id))} {...dragProps(s.id)}>
                    {s.texto}
                  </button>
                ))}
              </div>
            )}
            {avisoEsc && <div className="pe-aviso" role="status"><i className="fa-solid fa-circle-info" aria-hidden /> {avisoEsc}</div>}
          </div>
          <BinsEscenarios selEsc={selEsc} shakeEsc={shakeEsc} ubicEsc={ubicEsc} onMatch={intentarEsc} dropProps={dropProps} />
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

  return (
    <LabShell
      dom
      accent={accent}
      rgba={color.rgba}
      escena={escenaUI}
      modos={{ opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })), valor: modo, cambiar: (id) => setModo(id as Modo) }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lecturas[modo]}
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
                  {bestEstrellas >= 3 ? "¡Dominas a los personajes y sus escenarios!" : "Termina los cinco modos para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={PERSONAJES_ESCENARIOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Tipos de personaje" icono="fa-masks-theater">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(TIPO_PERSONAJE_INFO) as TipoPersonaje[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{TIPO_PERSONAJE_INFO[k].titulo}.</strong> {TIPO_PERSONAJE_INFO[k].subtitulo}
                      <div style={{ fontStyle: "italic", color: T.text3 }}>{TIPO_PERSONAJE_INFO[k].ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Tipos de escenario" icono="fa-mountain-sun">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(TIPO_ESCENARIO_INFO) as TipoEscenario[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{TIPO_ESCENARIO_INFO[k].titulo}.</strong> {TIPO_ESCENARIO_INFO[k].subtitulo}
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_ESCENARIO}</div>
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
  @keyframes peShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes pePop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes peFade { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:none;} }
  .pe-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .pe-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .pe-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .pe-chip:active { cursor:grabbing; }
  .pe-bin { position:relative; isolation:isolate; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; min-height:150px; transition:all .16s; }
  .pe-bin[data-shake="true"] { animation:peShake .4s; border-color:${NO}; }
  .pe-bin[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .pe-aviso { margin-top:12px; display:flex; gap:9px; padding:10px 12px; border-radius:11px; border:1px solid ${NO}66; background:${NO}14; color:#fff; font-size:14px; line-height:1.45; animation:peFade .25s ease; }
  .pe-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .pe-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .pe-q:disabled{ cursor:default; }
  .pe-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .pe-btn:hover { border-color:${T.lineStrong}; }

  /* Taller de escena */
  .pe-panel { position:relative; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .pe-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:10px; }
  .pe-foto { position:relative; display:block; overflow:hidden; border-radius:11px; background:linear-gradient(135deg, rgba(${rgba},0.38), rgba(10,20,40,0.9)); }
  .pe-foto > i { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:30px; color:rgba(255,255,255,0.55); }
  .pe-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .pe-opcion { position:relative; cursor:pointer; display:flex; flex-direction:column; gap:7px; text-align:left; padding:8px; border-radius:14px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:${T.text}; font-size:14px; line-height:1.35; min-width:0; transition:transform .14s, border-color .14s, background .14s; }
  .pe-opcion:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .pe-opcion[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.18); box-shadow:0 0 18px -6px ${accent}; }
  .pe-opcion strong { font-size:14px; }
  .pe-opcion small { font-size:14px; color:${T.text2}; }
  .pe-opcion .pe-foto { aspect-ratio:16/9; }
  .pe-opcion .pe-foto[data-cuadrada="true"] { aspect-ratio:1/1; max-height:110px; }
  .pe-pill { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:10px 14px; border-radius:999px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .pe-pill:hover { color:#fff; border-color:${T.lineStrong}; }
  .pe-pill[data-sel="true"] { color:#fff; border-color:${accent}; background:rgba(${rgba},0.2); }
  .pe-vineta { position:relative; overflow:hidden; border-radius:16px; border:1px solid ${T.line}; min-height:210px; display:flex; align-items:flex-end;
    background:linear-gradient(135deg, rgba(${rgba},0.3), rgba(8,16,30,0.95)); }
  .pe-vineta > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .pe-vineta-txt { position:relative; width:100%; padding:46px 16px 14px; background:linear-gradient(0deg, rgba(3,8,18,0.95) 0%, rgba(3,8,18,0.8) 60%, transparent 100%);
    font-size:15px; line-height:1.5; color:#fff; animation:peFade .3s ease; }
  .pe-vineta-ceja { position:absolute; top:10px; left:10px; right:10px; display:flex; gap:8px; flex-wrap:wrap; }
  .pe-tag { display:inline-flex; align-items:center; gap:7px; font-size:14px; font-weight:800; padding:5px 10px; border-radius:9px; background:rgba(4,10,22,0.78); border:1px solid ${T.line}; color:#fff; }
  .pe-medidor { display:grid; gap:5px; }
  .pe-medidor-top { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:800; color:${T.text}; }
  .pe-barra { height:14px; border-radius:8px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .pe-barra > i { display:block; height:100%; border-radius:8px; transition:width .6s cubic-bezier(.2,.8,.2,1), background .4s; }
  .pe-linea { display:flex; gap:9px; align-items:flex-start; font-size:14px; line-height:1.45; color:${T.text2}; }
  .pe-bloq { font-size:13px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:${T.text3}; margin:0; }
  @media (prefers-reduced-motion: reduce){
    .pe-bin[data-shake="true"], .pe-aviso, .pe-vineta-txt { animation:none; }
    .pe-chip, .pe-chip:hover, .pe-chip[data-sel="true"], .pe-opcion, .pe-opcion:hover { transform:none; transition:none; }
    .pe-barra > i { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Taller de escena
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Imagen con respaldo: gradiente + ícono detrás; si el archivo no existe, se oculta. */
function Foto({ clave, icono, cuadrada }: { clave: string; icono: string; cuadrada?: boolean }) {
  return (
    <span className="pe-foto" data-cuadrada={cuadrada ?? false} aria-hidden>
      <i className={`fa-solid ${icono}`} />
      <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
    </span>
  );
}

function Medidor({ etiqueta, texto, frac, col }: { etiqueta: string; texto: string; frac: number; col: string }) {
  return (
    <div className="pe-medidor">
      <div className="pe-medidor-top">
        <span>{etiqueta}</span>
        <span style={{ color: col }}>{texto}</span>
      </div>
      <div className="pe-barra" role="img" aria-label={`${etiqueta}: ${texto}`}>
        <i style={{ width: `${Math.max(4, Math.min(100, frac * 100))}%`, background: col }} />
      </div>
    </div>
  );
}

function Taller({ sel, escena, onElegir, accent }: { sel: Seleccion; escena: ReturnType<typeof escenaDe>; onElegir: (c: Partial<Seleccion>) => void; accent: string }) {
  const amb = AMBIENTES.find((a) => a.id === sel.ambiente)!;
  const ras = RASGOS.find((r) => r.id === sel.rasgo)!;
  const colCoh = escena.coherencia >= UMBRAL_COHERENTE ? OK : escena.coherencia >= 40 ? AMBAR : NO;
  const colTen = escena.tension >= 4 ? NO : escena.tension >= 3 ? AMBAR : OK;
  return (
    <>
      <div className="pe-vineta">
        <img src={`${RUTA_FOTOS}/${amb.clave}.webp`} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
        <div className="pe-vineta-ceja">
          <span className="pe-tag"><i className={`fa-solid ${amb.icono}`} aria-hidden /> {amb.tipo}: {amb.label}</span>
          <span className="pe-tag"><i className={`fa-solid ${ras.icono}`} aria-hidden /> {NOMBRE} · {ras.label.toLowerCase()}</span>
        </div>
        <p className="pe-vineta-txt" key={`${sel.rasgo}${sel.motivo}${sel.accion}${sel.ambiente}`} style={{ margin: 0 }}>
          {escena.texto}
        </p>
      </div>

      <div className="pe-panel">
        <Medidor etiqueta="Coherencia con su carácter" texto={`${escena.coherencia} %`} frac={escena.coherencia / 100} col={colCoh} />
        <Medidor etiqueta="Tensión que pone el escenario" texto={`${escena.tension} / 5`} frac={escena.tension / 5} col={colTen} />
        <div style={{ display: "grid", gap: 6 }}>
          {escena.lineas.map((l, i) => (
            <div key={i} className="pe-linea">
              <i className={`fa-solid ${l.nivel === 2 ? "fa-circle-check" : l.nivel === 1 ? "fa-circle-half-stroke" : "fa-circle-xmark"}`} aria-hidden style={{ color: l.nivel === 2 ? OK : l.nivel === 1 ? AMBAR : NO, marginTop: 3 }} />
              <span>{l.txt}</span>
            </div>
          ))}
          <div className="pe-linea">
            <i className="fa-solid fa-mountain-sun" aria-hidden style={{ color: accent, marginTop: 3 }} />
            <span><strong style={{ color: T.text }}>El escenario aporta:</strong> {escena.aporta}</span>
          </div>
        </div>
      </div>

      <div className="pe-panel">
        <h5 className="pe-bloq">1 · ¿Cómo es {NOMBRE}?</h5>
        <div className="pe-grid">
          {RASGOS.map((r) => (
            <button key={r.id} type="button" className="pe-opcion" data-sel={sel.rasgo === r.id} aria-pressed={sel.rasgo === r.id} onClick={() => onElegir({ rasgo: r.id })}>
              <Foto clave={r.clave} icono={r.icono} cuadrada />
              <strong>{r.label}</strong>
              <small>{r.frase}</small>
            </button>
          ))}
        </div>
        <h5 className="pe-bloq">2 · ¿Qué la mueve?</h5>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MOTIVOS.map((m) => (
            <button key={m.id} type="button" className="pe-pill" data-sel={sel.motivo === m.id} aria-pressed={sel.motivo === m.id} onClick={() => onElegir({ motivo: m.id })}>
              <i className={`fa-solid ${m.icono}`} aria-hidden /> {m.label}
            </button>
          ))}
        </div>
        <h5 className="pe-bloq">3 · ¿Qué hace en la escena?</h5>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ACCIONES.map((a) => (
            <button key={a.id} type="button" className="pe-pill" data-sel={sel.accion === a.id} aria-pressed={sel.accion === a.id} onClick={() => onElegir({ accion: a.id })}>
              <i className={`fa-solid ${a.icono}`} aria-hidden /> {a.label}
            </button>
          ))}
        </div>
        <h5 className="pe-bloq">4 · ¿Dónde ocurre? (la barra es la tensión de esa acción allí)</h5>
        <div className="pe-grid">
          {AMBIENTES.map((a) => {
            const t = tensionDe(a.id, sel.accion);
            return (
              <button key={a.id} type="button" className="pe-opcion" data-sel={sel.ambiente === a.id} aria-pressed={sel.ambiente === a.id} onClick={() => onElegir({ ambiente: a.id })}>
                <Foto clave={a.clave} icono={a.icono} />
                <strong>{a.label}</strong>
                <small>{a.tipo}</small>
                <span className="pe-barra" aria-label={`Tensión ${t} de 5`}>
                  <i style={{ width: `${t * 20}%`, background: t >= 4 ? NO : t >= 3 ? AMBAR : OK }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo de clasificación
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

const COLUMNAS: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 12 };

function BinsPersonajes({
  selPers,
  shakePers,
  ubicPers,
  onMatch,
  dropProps,
}: {
  selPers: string | null;
  shakePers: TipoPersonaje | null;
  ubicPers: Record<string, TipoPersonaje>;
  onMatch: (persId: string, bin: TipoPersonaje) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoPersonaje[] = ["protagonista", "antagonista", "secundario"];
  return (
    <div style={COLUMNAS}>
      {bins.map((bin) => {
        const info = TIPO_PERSONAJE_INFO[bin];
        const dentro = PERSONAJES.filter((p) => ubicPers[p.id] === bin);
        return (
          <div key={bin} className="pe-bin" data-shake={shakePers === bin} onClick={() => selPers && onMatch(selPers, bin)} {...dropProps((id) => onMatch(id, bin))}>
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
                  <span key={p.id} style={{ animation: "pePop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 12, color: OK, marginTop: 3 }} />
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

function BinsEscenarios({
  selEsc,
  shakeEsc,
  ubicEsc,
  onMatch,
  dropProps,
}: {
  selEsc: string | null;
  shakeEsc: TipoEscenario | null;
  ubicEsc: Record<string, TipoEscenario>;
  onMatch: (escId: string, bin: TipoEscenario) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoEscenario[] = ["realista", "fantastico", "historico"];
  return (
    <div style={COLUMNAS}>
      {bins.map((bin) => {
        const info = TIPO_ESCENARIO_INFO[bin];
        const dentro = ESCENARIOS.filter((s) => ubicEsc[s.id] === bin);
        return (
          <div key={bin} className="pe-bin" data-shake={shakeEsc === bin} onClick={() => selEsc && onMatch(selEsc, bin)} {...dropProps((id) => onMatch(id, bin))}>
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
                dentro.map((s) => (
                  <span key={s.id} style={{ animation: "pePop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 12, color: OK, marginTop: 3 }} />
                    {s.texto}
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
        Cinco afirmaciones sobre personajes y escenarios. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="pe-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
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
          <button className="pe-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="pe-btn" onClick={reintentar}>
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
