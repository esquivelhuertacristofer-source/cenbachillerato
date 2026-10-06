"use client";

/**
 * Laboratorio — Causalidad histórica: EL CASO DE 1910
 * Práctica experimental para CH-I-P03-A4 (Conciencia Histórica I).
 *
 * El alumno arma su propia explicación de «¿por qué estalló la Revolución
 * Mexicana en 1910?». En el modo «Caso 1910» elige causas de una mesa de
 * candidatas (algunas son consecuencias o pertenecen a otro proceso): cada una
 * aparece en una línea del tiempo SVG, y un medidor dice qué tan sólida es la
 * explicación. Quitar una causa, o meter una que no corresponde, cambia el
 * medidor y se explica por qué. Las reglas viven en `causalidad-historica-sim.ts`.
 *
 * Modos:
 *  0. «Caso 1910»                 — el simulador (experimento central).
 *  1. «¿Qué tipo de causa?»       — clasifica nueve hechos por su alcance temporal.
 *  2. «¿Monocausal o multicausal?» — detecta el error de explicación.
 *  3. «Escribe el término»        — glosario A5 verbatim.
 *  4. «Completa el texto»         — fill_blanks A6 verbatim.
 *  + Cuestionario V/F (A4) en la pestaña «Reto».
 *
 * DOM + SVG (sin three.js). Contenido VERBATIM de CH-I·P03: vive en «Teoría».
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { CAUSALIDAD_HISTORICA_HUECOS } from "./causalidad-historica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { CAUSALIDAD_HISTORICA_FICHA } from "./causalidad-historica-ficha";
import {
  CAUSAS,
  TIPO_CAUSA_INFO,
  EXPLICACIONES,
  EXPLICACION_INFO,
  PARES,
  QUIZ,
  DATO_CAUSALIDAD,
  type TipoCausa,
  type TipoExplicacion,
} from "./causalidad-historica-data";
import { CANDIDATAS, EJE, EVENTO, UMBRAL_SOLIDA, evaluar, mensajeCambio, xDe } from "./causalidad-historica-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-causalidad-historica-reto";
const RUTA_FOTOS = "/media/labs-sim/causalidad-historica";

type Modo = "caso" | "causas" | "explicacion" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "caso", label: "Caso 1910", icono: "fa-timeline" },
  { id: "causas", label: "¿Qué tipo de causa?", icono: "fa-diagram-project" },
  { id: "explicacion", label: "¿Monocausal o multicausal?", icono: "fa-scale-unbalanced" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabCausalidadHistorica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("caso");

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

  // ── CASO 1910 (simulador) ─────────────────────────────────────────────
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [mejorFuerza, setMejorFuerza] = useState(0);
  const [descartes, setDescartes] = useState(0);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const evaluacion = evaluar(elegidas);

  const alternar = (id: string) => {
    const estaba = elegidas.includes(id);
    const nuevas = estaba ? elegidas.filter((x) => x !== id) : [...elegidas, id];
    const c = CANDIDATAS.find((x) => x.id === id)!;
    const ev = evaluar(nuevas);
    setElegidas(nuevas);
    setMensaje(mensajeCambio(id, !estaba));
    if (ev.fuerza > mejorFuerza) setMejorFuerza(ev.fuerza);
    if (estaba && !c.valida) {
      setDescartes((n) => n + 1);
      sfxPlace();
    } else if (!estaba && c.valida) sfxPlace();
    else if (!estaba && !c.valida) sfxNo();
    else sfxClick();
  };
  const resetCaso = () => {
    setElegidas([]);
    setMejorFuerza(0);
    setDescartes(0);
    setMensaje(null);
  };

  // ── modo causas (clasifica por alcance temporal) ───────────────────────
  const [ubicCausa, setUbicCausa] = useState<Record<string, TipoCausa>>({});
  const [selCausa, setSelCausa] = useState<string | null>(null);
  const [shakeCausa, setShakeCausa] = useState<TipoCausa | null>(null);
  const [avisoCausa, setAvisoCausa] = useState<string | null>(null);
  const causasLibres = CAUSAS.filter((c) => !ubicCausa[c.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarCausa = (causaId: string, bin: TipoCausa) => {
    if (ubicCausa[causaId]) return;
    const c = CAUSAS.find((x) => x.id === causaId);
    if (c && c.tipo === bin) {
      setUbicCausa((e) => ({ ...e, [causaId]: bin }));
      setSelCausa(null);
      setAvisoCausa(null);
      sfxPlace();
      if (Object.keys(ubicCausa).length + 1 >= CAUSAS.length) sfxOk();
    } else if (c) {
      const real = TIPO_CAUSA_INFO[c.tipo];
      setAvisoCausa(`No es «${TIPO_CAUSA_INFO[bin].titulo.toLowerCase()}». Es ${real.titulo.toLowerCase()}: ${real.subtitulo.toLowerCase()}`);
      setShakeCausa(bin);
      sfxNo();
      window.setTimeout(() => setShakeCausa(null), 420);
    }
  };
  const resetCausas = () => {
    setUbicCausa({});
    setSelCausa(null);
    setAvisoCausa(null);
  };

  // ── modo explicación (monocausal vs multicausal) ───────────────────────
  const [ubicExpl, setUbicExpl] = useState<Record<string, TipoExplicacion>>({});
  const [selExpl, setSelExpl] = useState<string | null>(null);
  const [shakeExpl, setShakeExpl] = useState<TipoExplicacion | null>(null);
  const [avisoExpl, setAvisoExpl] = useState<string | null>(null);
  const explLibres = EXPLICACIONES.filter((x) => !ubicExpl[x.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarExpl = (explId: string, bin: TipoExplicacion) => {
    if (ubicExpl[explId]) return;
    const x = EXPLICACIONES.find((e) => e.id === explId);
    if (x && x.tipo === bin) {
      setUbicExpl((e) => ({ ...e, [explId]: bin }));
      setSelExpl(null);
      setAvisoExpl(null);
      sfxPlace();
      if (Object.keys(ubicExpl).length + 1 >= EXPLICACIONES.length) sfxOk();
    } else if (x) {
      const real = EXPLICACION_INFO[x.tipo];
      setAvisoExpl(`No es «${EXPLICACION_INFO[bin].titulo.toLowerCase()}». Es ${real.titulo.toLowerCase()}: ${real.subtitulo.toLowerCase()}`);
      setShakeExpl(bin);
      sfxNo();
      window.setTimeout(() => setShakeExpl(null), 420);
    }
  };
  const resetExplicacion = () => {
    setUbicExpl({});
    setSelExpl(null);
    setAvisoExpl(null);
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
  const causasDone = Object.keys(ubicCausa).length >= CAUSAS.length;
  const explicacionDone = Object.keys(ubicExpl).length >= EXPLICACIONES.length;
  const solidaHecha = mejorFuerza >= UMBRAL_SOLIDA;
  const descarteHecho = descartes >= 1;
  const casoDone = solidaHecha && descarteHecho;
  const modosHechos = (casoDone ? 1 : 0) + (causasDone ? 1 : 0) + (explicacionDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Arma una explicación multicausal sólida (70 puntos o más)", done: solidaHecha },
    { txt: "Detecta una causa que no explica el evento y descártala", done: descarteHecho },
    { txt: "Clasifica los 9 hechos por tipo de causa", done: causasDone },
    { txt: "Distingue explicaciones mono y multicausales", done: explicacionDone },
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
  const resetActual =
    modo === "texto" ? resetTexto : modo === "caso" ? resetCaso : modo === "causas" ? resetCausas : modo === "explicacion" ? resetExplicacion : resetGlosario;

  const lecturas: Record<Modo, string> = {
    caso: `Fuerza ${evaluacion.fuerza}/100 · ${elegidas.length} causas`,
    causas: `${Object.keys(ubicCausa).length}/${CAUSAS.length} hechos`,
    explicacion: `${Object.keys(ubicExpl).length}/${EXPLICACIONES.length} explicaciones`,
    glosario: `${modosHechos}/5 modos · ${bestEstrellas}★`,
    texto: `${modosHechos}/5 modos · ${bestEstrellas}★`,
  };

  const pistaDe: Record<Modo, string> = {
    caso: "Una causa siempre ocurre ANTES del evento y se liga a ÉL. Combina condiciones profundas (estructurales) con un detonante (causa contingente).",
    causas: "La causa estructural es profunda y de larga duración; la coyuntural agrava las tensiones a mediano plazo y el detonante (contingente) las hace estallar; la consecuencia es el efecto posterior.",
    explicacion: "Una explicación monocausal usa palabras como «solo», «únicamente» o «exclusivamente». La multicausal combina varios factores.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const escenaUI = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "caso" && <Caso elegidas={elegidas} onAlternar={alternar} evaluacion={evaluacion} mensaje={mensaje} accent={accent} />}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={CAUSALIDAD_HISTORICA_HUECOS}
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

      {modo === "causas" && (
        <Mesa>
          <Banco
            titulo="Lleva cada hecho a su tipo de causa"
            hechas={Object.keys(ubicCausa).length}
            total={CAUSAS.length}
            libres={causasLibres}
            seleccion={selCausa}
            onSel={(id) => setSelCausa((s) => (s === id ? null : id))}
            aviso={avisoCausa}
            dragProps={dragProps}
            fin="¡Clasificaste los 9 hechos!"
          />
          <Bins
            bins={(Object.keys(TIPO_CAUSA_INFO) as TipoCausa[]).map((k) => ({ id: k, info: TIPO_CAUSA_INFO[k] }))}
            items={CAUSAS}
            ubic={ubicCausa}
            shake={shakeCausa}
            seleccion={selCausa}
            onMatch={(id, bin) => intentarCausa(id, bin as TipoCausa)}
            dropProps={dropProps}
          />
        </Mesa>
      )}

      {modo === "explicacion" && (
        <Mesa>
          <Banco
            titulo="Lleva cada explicación: ¿una sola causa o varias?"
            hechas={Object.keys(ubicExpl).length}
            total={EXPLICACIONES.length}
            libres={explLibres}
            seleccion={selExpl}
            onSel={(id) => setSelExpl((s) => (s === id ? null : id))}
            aviso={avisoExpl}
            dragProps={dragProps}
            fin="¡Clasificaste las 7 explicaciones!"
          />
          <Bins
            bins={(Object.keys(EXPLICACION_INFO) as TipoExplicacion[]).map((k) => ({ id: k, info: EXPLICACION_INFO[k], col: k === "monocausal" ? NO : OK }))}
            items={EXPLICACIONES}
            ubic={ubicExpl}
            shake={shakeExpl}
            seleccion={selExpl}
            onMatch={(id, bin) => intentarExpl(id, bin as TipoExplicacion)}
            dropProps={dropProps}
          />
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
                  {bestEstrellas >= 3 ? "¡Piensas la historia con multicausalidad!" : "Termina los cinco modos para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={CAUSALIDAD_HISTORICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Tipos de causa" icono="fa-diagram-project">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(TIPO_CAUSA_INFO) as TipoCausa[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{TIPO_CAUSA_INFO[k].titulo}.</strong> {TIPO_CAUSA_INFO[k].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Monocausal y multicausal" icono="fa-scale-unbalanced">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(EXPLICACION_INFO) as TipoExplicacion[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{EXPLICACION_INFO[k].titulo}.</strong> {EXPLICACION_INFO[k].subtitulo}
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_CAUSALIDAD}</div>
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
  @keyframes cauShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes cauPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes cauFade { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:none;} }
  .cau-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .cau-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .cau-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .cau-chip:active { cursor:grabbing; }
  .cau-bin { position:relative; isolation:isolate; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; transition:all .16s; }
  .cau-bin[data-shake="true"] { animation:cauShake .4s; border-color:${NO}; }
  .cau-bin[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .cau-aviso { margin-top:12px; display:flex; gap:9px; padding:10px 12px; border-radius:11px; border:1px solid ${NO}66; background:${NO}14; color:#fff; font-size:14px; line-height:1.45; animation:cauFade .25s ease; }
  .cau-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .cau-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .cau-q:disabled{ cursor:default; }
  .cau-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .cau-btn:hover { border-color:${T.lineStrong}; }

  /* Caso 1910 */
  .cau-panel { position:relative; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .cau-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap:10px; }
  .cau-foto { position:relative; display:block; overflow:hidden; border-radius:11px; aspect-ratio:16/9; background:linear-gradient(135deg, rgba(${rgba},0.38), rgba(10,20,40,0.9)); }
  .cau-foto > i { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:30px; color:rgba(255,255,255,0.55); }
  .cau-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .cau-cand { position:relative; cursor:pointer; display:flex; flex-direction:column; gap:7px; text-align:left; padding:8px; border-radius:14px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:${T.text}; font-size:14px; line-height:1.4; min-width:0; transition:transform .14s, border-color .14s, background .14s; }
  .cau-cand:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .cau-cand[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.18); box-shadow:0 0 18px -6px ${accent}; }
  .cau-cand strong { font-size:15px; }
  .cau-cand small { font-size:14px; color:${T.text2}; }
  .cau-marca { display:inline-flex; align-items:center; gap:7px; font-size:14px; font-weight:800; color:${T.text3}; }
  .cau-cand[data-sel="true"] .cau-marca { color:${accent}; }
  .cau-medidor-top { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:800; color:${T.text}; flex-wrap:wrap; }
  .cau-barra { position:relative; height:16px; border-radius:9px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .cau-barra > i { display:block; height:100%; border-radius:9px; transition:width .6s cubic-bezier(.2,.8,.2,1), background .4s; }
  .cau-barra > b { position:absolute; top:0; bottom:0; width:2px; background:#fff; opacity:.7; }
  .cau-nota { display:flex; gap:9px; align-items:flex-start; font-size:14px; line-height:1.5; color:${T.text2}; }
  .cau-svg { width:100%; height:auto; display:block; border-radius:12px; background:rgba(2,12,28,0.55); border:1px solid ${T.line}; }
  .cau-svg text { font-family:inherit; }
  @media (prefers-reduced-motion: reduce){
    .cau-bin[data-shake="true"], .cau-aviso { animation:none; }
    .cau-chip, .cau-chip:hover, .cau-chip[data-sel="true"], .cau-cand, .cau-cand:hover { transform:none; transition:none; }
    .cau-barra > i { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Caso 1910: línea del tiempo + medidor + mesa de candidatas
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Imagen con respaldo: gradiente + ícono detrás; si el archivo no existe, se oculta. */
function Foto({ clave, icono }: { clave: string; icono: string }) {
  return (
    <span className="cau-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
    </span>
  );
}

const ALTO_FILA = 30;
const TOP = 46;

/** Línea del tiempo SVG: cada causa elegida es una barra (o un punto) en su época. */
function LineaTiempo({ elegidas }: { elegidas: string[] }) {
  const filas = elegidas.map((id) => CANDIDATAS.find((c) => c.id === id)!).filter(Boolean);
  const alto = TOP + Math.max(filas.length, 2) * ALTO_FILA + 34;
  const xEvento = xDe(EVENTO.anio);
  const marcas = [1800, 1850, 1900];
  return (
    <svg className="cau-svg" viewBox={`0 0 560 ${alto}`} role="img" aria-label="Línea del tiempo de las causas elegidas frente a 1910">
      {/* eje */}
      <line x1={EJE.x0} y1={alto - 26} x2={EJE.x1} y2={alto - 26} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {marcas.map((a) => (
        <g key={a}>
          <line x1={xDe(a)} y1={alto - 31} x2={xDe(a)} y2={alto - 21} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <text x={xDe(a)} y={alto - 5} textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.75)">{a}</text>
        </g>
      ))}
      {/* antes / después del evento */}
      <rect x={xEvento} y="22" width={EJE.x1 - xEvento + 12} height={alto - 50} fill="rgba(255,94,94,0.07)" />
      <text x={EJE.x1 + 6} y="40" textAnchor="end" fontSize="16" fill="rgba(255,150,150,0.9)">después</text>
      {/* el evento */}
      <line x1={xEvento} y1="22" x2={xEvento} y2={alto - 26} stroke={AMBAR} strokeWidth="3" strokeDasharray="6 4" />
      <text x={xEvento - 6} y="18" textAnchor="end" fontSize="18" fontWeight="800" fill={AMBAR}>{EVENTO.etiqueta}</text>

      {filas.length === 0 && (
        <text x="280" y={TOP + 36} textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.6)">Elige causas abajo y aparecerán aquí</text>
      )}
      {filas.map((c, i) => {
        const y = TOP + i * ALTO_FILA + 8;
        const x1 = xDe(c.desde);
        const x2 = Math.max(xDe(c.hasta), x1 + 8);
        const col = c.valida ? (c.tipo === "estructural" ? "#5BC8FF" : "#FFC75A") : NO;
        const despues = c.desde > EVENTO.anio;
        const tx = x1 > 300 ? x1 - 8 : x2 + 8;
        const anchor = x1 > 300 ? "end" : "start";
        return (
          <g key={c.id}>
            {c.valida && c.hasta <= EVENTO.anio && (
              <line x1={x2} y1={y} x2={xEvento} y2={y} stroke={col} strokeWidth="2.5" strokeDasharray="2 5" opacity="0.9" />
            )}
            {c.valida && c.desde < c.hasta ? (
              <rect x={x1} y={y - 7} width={x2 - x1} height="14" rx="7" fill={col} opacity="0.9" />
            ) : (
              <circle cx={x1} cy={y} r="9" fill={col} stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
            )}
            {!c.valida && (
              <g stroke={NO} strokeWidth="3">
                <line x1={x1 - 6} y1={y - 6} x2={x1 + 6} y2={y + 6} />
                <line x1={x1 + 6} y1={y - 6} x2={x1 - 6} y2={y + 6} />
              </g>
            )}
            <text x={tx} y={y + 6} textAnchor={anchor} fontSize="17" fontWeight="700" fill={col}>
              {c.corto}{despues ? " ›" : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Caso({ elegidas, onAlternar, evaluacion, mensaje, accent }: { elegidas: string[]; onAlternar: (id: string) => void; evaluacion: ReturnType<typeof evaluar>; mensaje: string | null; accent: string }) {
  const col = evaluacion.nivel === "solida" ? OK : evaluacion.nivel === "parcial" ? AMBAR : evaluacion.nivel === "vacia" ? T.text3 : NO;
  return (
    <>
      <div className="cau-panel">
        <Eyebrow>
          <i className="fa-solid fa-timeline" style={{ marginRight: 8, color: accent }} aria-hidden />
          ¿Por qué estalló la Revolución Mexicana en 1910?
        </Eyebrow>
        <LineaTiempo elegidas={elegidas} />
        <div>
          <div className="cau-medidor-top">
            <span>Fuerza de tu explicación</span>
            <span style={{ color: col }}>{evaluacion.fuerza} / 100 · {evaluacion.titulo}</span>
          </div>
          <div className="cau-barra" role="img" aria-label={`Fuerza de la explicación: ${evaluacion.fuerza} de 100`}>
            <i style={{ width: `${Math.max(3, evaluacion.fuerza)}%`, background: col }} />
            <b style={{ left: `${UMBRAL_SOLIDA}%` }} />
          </div>
        </div>
        <div className="cau-nota">
          <i className="fa-solid fa-circle-info" aria-hidden style={{ color: accent, marginTop: 3 }} />
          <span>{evaluacion.consejo}</span>
        </div>
        {mensaje && (
          <div className="cau-nota" role="status" key={mensaje}>
            <i className="fa-solid fa-comment-dots" aria-hidden style={{ color: AMBAR, marginTop: 3 }} />
            <span>{mensaje}</span>
          </div>
        )}
      </div>

      <div className="cau-panel">
        <Eyebrow>Candidatas: toca para ponerlas o quitarlas de tu explicación</Eyebrow>
        <div className="cau-grid">
          {CANDIDATAS.map((c) => {
            const dentro = elegidas.includes(c.id);
            return (
              <button key={c.id} type="button" className="cau-cand" data-sel={dentro} aria-pressed={dentro} onClick={() => onAlternar(c.id)}>
                <Foto clave={c.clave} icono={c.icono} />
                <strong>{c.corto}</strong>
                <small>{c.texto}</small>
                <span className="cau-marca">
                  <i className={`fa-solid ${dentro ? "fa-square-check" : "fa-square-plus"}`} aria-hidden />
                  {dentro ? "En tu explicación" : "Añadir a mi explicación"}
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
 * Modos de clasificación (banco + cajas)
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function Banco({
  titulo,
  hechas,
  total,
  libres,
  seleccion,
  onSel,
  aviso,
  dragProps,
  fin,
}: {
  titulo: string;
  hechas: number;
  total: number;
  libres: { id: string; texto: string }[];
  seleccion: string | null;
  onSel: (id: string) => void;
  aviso: string | null;
  dragProps: (id: string) => object;
  fin: string;
}) {
  return (
    <div style={{ ...card, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <Eyebrow>{titulo}</Eyebrow>
        <span style={{ fontSize: 14, fontWeight: 800, color: hechas >= total ? OK : T.text3 }}>
          {hechas}/{total}
        </span>
      </div>
      {libres.length === 0 ? (
        <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
          <i className="fa-solid fa-circle-check" /> {fin}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {libres.map((c) => (
            <button key={c.id} className="cau-chip" data-sel={seleccion === c.id} onClick={() => onSel(c.id)} {...dragProps(c.id)}>
              {c.texto}
            </button>
          ))}
        </div>
      )}
      {aviso && (
        <div className="cau-aviso" role="status">
          <i className="fa-solid fa-circle-info" aria-hidden /> {aviso}
        </div>
      )}
    </div>
  );
}

function Bins({
  bins,
  items,
  ubic,
  shake,
  seleccion,
  onMatch,
  dropProps,
}: {
  bins: { id: string; info: { titulo: string; subtitulo: string; icono: string }; col?: string }[];
  items: { id: string; texto: string }[];
  ubic: Record<string, string>;
  shake: string | null;
  seleccion: string | null;
  onMatch: (id: string, bin: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((b) => {
        const dentro = items.filter((x) => ubic[x.id] === b.id);
        return (
          <div key={b.id} className="cau-bin" data-shake={shake === b.id} onClick={() => seleccion && onMatch(seleccion, b.id)} {...dropProps((id) => onMatch(id, b.id))}>
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={b.info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={b.info.titulo} color={b.col ?? T.text2} icono={b.info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{b.info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{b.info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((x) => (
                  <span key={x.id} style={{ animation: "cauPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 12, color: OK, marginTop: 3 }} />
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
        Cinco afirmaciones sobre causalidad y multicausalidad histórica. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="cau-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="cau-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cau-btn" onClick={reintentar}>
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
