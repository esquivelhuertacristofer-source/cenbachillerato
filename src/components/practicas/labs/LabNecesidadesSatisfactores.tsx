"use client";

/**
 * Laboratorio — Necesidades y satisfactores: materiales, personales,
 * familiares y de la comunidad
 * Práctica experimental para CS-II-P01-A4 (Ciencias Sociales II).
 *
 * El alumno ADMINISTRA el mes de una familia FICTICIA («Ramírez Luna»,
 * simulación: todas las cifras son valores de juego). Con 12 fichas elige
 * satisfactores y ve cómo suben o bajan los medidores de cinco necesidades
 * vitales; descubre que un mismo satisfactor cubre varias necesidades y que
 * los pseudo-satisfactores aparentan cubrir una y dañan otra.
 *
 * Modos:
 *  1. «Presupuesto del mes» — el simulador (modelo en necesidades-satisfactores-sim.ts).
 *  2. «¿Necesidad o satisfactor?» — clasifica nueve tarjetas (verbatim).
 *  3. «Empareja necesidad y satisfactor» — pares del glosario A5 (verbatim).
 *  4. «Escribe el término» y 5. «Completa el texto» — refuerzo verbatim.
 *  + Cuestionario de comprensión (V/F verbatim de A4 + A2) en la pestaña Reto.
 *
 * DOM puro (sin three.js): ratón, teclado y táctil (clic-para-seleccionar /
 * clic-para-colocar además del arrastre). Contenido VERBATIM de CS-II·P01,
 * movido a la pestaña «Teoría».
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { NECESIDADES_SATISFACTORES_HUECOS } from "./necesidades-satisfactores-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { NECESIDADES_SATISFACTORES_FICHA } from "./necesidades-satisfactores-ficha";
import {
  TARJETAS,
  CATEGORIA_INFO,
  PAREJAS,
  PARES,
  QUIZ,
  DATO_NECESIDADES,
  type Categoria,
} from "./necesidades-satisfactores-data";
import {
  INGRESO,
  UMBRAL,
  SATISFACTORES,
  NECESIDADES_FAMILIA,
  gasto,
  niveles,
  cubiertas,
  cuantasCubre,
  informe,
  type SatisfactorSim,
} from "./necesidades-satisfactores-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-necesidades-reto";
const RUTA_FOTOS = "/media/labs-sim/necesidades-satisfactores";

type Modo = "presupuesto" | "clasificar" | "emparejar" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "presupuesto", label: "Presupuesto del mes", icono: "fa-wallet" },
  { id: "clasificar", label: "¿Necesidad o satisfactor?", icono: "fa-layer-group" },
  { id: "emparejar", label: "Empareja necesidad y satisfactor", icono: "fa-link" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabNecesidadesSatisfactores({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("presupuesto");

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

  // ── modo presupuesto (el simulador) ────────────────────────────────────
  const [sel, setSel] = useState<string[]>([]);
  const [cerrado, setCerrado] = useState(false);
  const [presupuestoDone, setPresupuestoDone] = useState(false);
  const [vioPseudo, setVioPseudo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const gastado = gasto(sel);
  const nivel = niveles(sel);
  const rep = informe(sel);

  const alternar = (s: SatisfactorSim) => {
    setCerrado(false);
    if (sel.includes(s.id)) {
      sfxClick();
      setAviso(null);
      setSel((v) => v.filter((x) => x !== s.id));
      return;
    }
    if (gastado + s.costo > INGRESO) {
      sfxNo();
      setAviso(`No alcanza: «${s.nombre}» cuesta ${s.costo} y solo te quedan ${INGRESO - gastado}. Quita algo primero.`);
      return;
    }
    sfxClick();
    setAviso(null);
    setSel((v) => [...v, s.id]);
  };
  const cerrarMes = () => {
    if (sel.length === 0) return;
    setCerrado(true);
    if (rep.pseudos.length > 0) setVioPseudo(true);
    if (rep.ok) {
      sfxOk();
      partida.acierto();
      setPresupuestoDone(true);
    } else {
      sfxNo();
    }
  };
  const resetPresupuesto = () => {
    setSel([]);
    setCerrado(false);
    setAviso(null);
  };

  // ── modo clasificar (necesidad / satisfactor) ──────────────────────────
  const [ubicTarj, setUbicTarj] = useState<Record<string, Categoria>>({});
  const [selTarj, setSelTarj] = useState<string | null>(null);
  const [shakeTarj, setShakeTarj] = useState<Categoria | null>(null);
  const [pistaTarj, setPistaTarj] = useState<string | null>(null);
  const tarjLibres = TARJETAS.filter((t) => !ubicTarj[t.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarTarj = (tarjId: string, bin: Categoria) => {
    if (ubicTarj[tarjId]) return;
    const t = TARJETAS.find((x) => x.id === tarjId);
    if (t && t.categoria === bin) {
      setUbicTarj((e) => ({ ...e, [tarjId]: bin }));
      setSelTarj(null);
      setPistaTarj(null);
      sfxPlace();
      if (Object.keys(ubicTarj).length + 1 >= TARJETAS.length) sfxOk();
    } else {
      setShakeTarj(bin);
      setPistaTarj(
        t
          ? t.categoria === "necesidad"
            ? "Esa tarjeta es una carencia, no el medio que la cubre: es una necesidad."
            : "Esa tarjeta es el bien, servicio o relación con que se cubre algo: es un satisfactor."
          : null
      );
      sfxNo();
      window.setTimeout(() => setShakeTarj(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicTarj({});
    setSelTarj(null);
    setPistaTarj(null);
  };

  // ── modo emparejar (necesidad → satisfactor) ───────────────────────────
  const [empPar, setEmpPar] = useState<Record<string, boolean>>({});
  const [selPar, setSelPar] = useState<string | null>(null);
  const [shakePar, setShakePar] = useState<string | null>(null);
  const parLibres = PAREJAS.filter((p) => !empPar[p.id]).slice().sort((a, b) => a.necesidad.localeCompare(b.necesidad, "es"));

  const intentarPar = (chipId: string, rowId: string) => {
    if (empPar[rowId]) return;
    if (chipId === rowId) {
      setEmpPar((e) => ({ ...e, [rowId]: true }));
      setSelPar(null);
      sfxPlace();
      if (Object.keys(empPar).length + 1 >= PAREJAS.length) sfxOk();
    } else {
      setShakePar(rowId);
      sfxNo();
      window.setTimeout(() => setShakePar(null), 420);
    }
  };
  const resetEmparejar = () => {
    setEmpPar({});
    setSelPar(null);
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
  const clasificarDone = Object.keys(ubicTarj).length >= TARJETAS.length;
  const emparejarDone = Object.keys(empPar).length >= PAREJAS.length;
  const modosHechos =
    (presupuestoDone ? 1 : 0) + (clasificarDone ? 1 : 0) + (emparejarDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Cubre las 5 necesidades de la familia con las 12 fichas", done: presupuestoDone },
    { txt: "Compra un pseudo-satisfactor y cierra el mes para ver su efecto", done: vioPseudo },
    { txt: "Clasifica las 9 tarjetas (necesidad / satisfactor)", done: clasificarDone },
    { txt: "Empareja las 4 necesidades con su satisfactor", done: emparejarDone },
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
    modo === "texto" ? resetTexto : modo === "clasificar" ? resetClasificar : modo === "emparejar" ? resetEmparejar : modo === "presupuesto" ? resetPresupuesto : resetGlosario;

  const lectura =
    modo === "presupuesto"
      ? `Quedan ${INGRESO - gastado} fichas · ${cubiertas(sel)} de 5 cubiertas`
      : `${modosHechos}/5 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "presupuesto" && (
        <Presupuesto
          sel={sel}
          gastado={gastado}
          nivel={nivel}
          cerrado={cerrado}
          rep={rep}
          aviso={aviso}
          onAlternar={alternar}
          onCerrar={cerrarMes}
          accent={accent}
        />
      )}

      {modo === "clasificar" && (
        <Mesa>
          <div>
            <div className="ns-hd">
              <Eyebrow>Arrastra cada tarjeta a su categoría</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                {Object.keys(ubicTarj).length}/{TARJETAS.length}
              </span>
            </div>
            {tarjLibres.length === 0 ? (
              <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {TARJETAS.length} tarjetas!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tarjLibres.map((t) => (
                  <button key={t.id} className="ns-chip" data-sel={selTarj === t.id} onClick={() => setSelTarj((v) => (v === t.id ? null : t.id))} {...dragProps(t.id)}>
                    {t.texto}
                  </button>
                ))}
              </div>
            )}
            {pistaTarj && (
              <div className="ns-pista" role="status">
                <i className="fa-solid fa-circle-info" aria-hidden /> {pistaTarj}
              </div>
            )}
          </div>
          <BinsTarjetas selTarj={selTarj} shakeTarj={shakeTarj} ubicTarj={ubicTarj} onMatch={intentarTarj} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "emparejar" && (
        <Mesa>
          <div>
            <div className="ns-hd">
              <Eyebrow>Arrastra cada necesidad a su satisfactor</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: emparejarDone ? OK : T.text3 }}>
                {Object.keys(empPar).length}/{PAREJAS.length}
              </span>
            </div>
            {parLibres.length === 0 ? (
              <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PAREJAS.length} necesidades!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {parLibres.map((p) => (
                  <button key={p.id} className="ns-chip" data-sel={selPar === p.id} onClick={() => setSelPar((v) => (v === p.id ? null : p.id))} {...dragProps(p.id)}>
                    <i className="fa-solid fa-hand-holding-heart" style={{ fontSize: 14, color: T.text3 }} />
                    {p.necesidad}
                  </button>
                ))}
              </div>
            )}
          </div>
          <RowsParejas selPar={selPar} shakePar={shakePar} empPar={empPar} onMatch={intentarPar} dropProps={dropProps} />
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

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={NECESIDADES_SATISFACTORES_HUECOS}
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
  );

  const pistaDe: Record<Modo, string> = {
    presupuesto: "Cada satisfactor mejora uno o varios medidores. Fíjate en cuáles suben con una sola compra, y desconfía de lo que promete mucho por poco.",
    clasificar: "Una necesidad es una carencia de algo indispensable; un satisfactor es el bien, servicio o relación con que se cubre esa necesidad.",
    emparejar: "Cada necesidad se cubre con un satisfactor: la nutrición con el alimento, la hidratación con el agua potable, la salud con los servicios de salud.",
    glosario: "Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
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
              <Bloque titulo="La familia (simulación)" icono="fa-people-roof">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  La familia Ramírez Luna es ficticia: dos adultos y dos adolescentes. Recibe {INGRESO} fichas al mes y sus cinco necesidades parten bajas. Una necesidad cuenta como cubierta desde {UMBRAL} de 100.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Fichas gastadas" value={`${gastado}/${INGRESO}`} col={gastado >= INGRESO ? AMBAR : undefined} />
                  <Dato label="Necesidades cubiertas" value={`${cubiertas(sel)}/5`} col={cubiertas(sel) === 5 ? OK : undefined} />
                </div>
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Distingues necesidades de satisfactores con claridad!" : "Termina todos los modos para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={NECESIDADES_SATISFACTORES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Necesidad y satisfactor" icono="fa-layer-group">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{CATEGORIA_INFO[k].titulo}.</strong> {CATEGORIA_INFO[k].subtitulo}
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_NECESIDADES}</div>
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
  @keyframes nsShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes nsPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .ns-hd { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
  .ns-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:flex-start; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .ns-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .ns-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .ns-chip:active { cursor:grabbing; }
  .ns-pista { margin-top:10px; padding:10px 12px; border-radius:12px; border:1px solid ${NO}66; background:${NO}12; font-size:14px; line-height:1.45; color:#fff; }
  .ns-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; transition:all .16s; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .ns-row[data-shake="true"] { animation:nsShake .4s; border-color:${NO}; }
  .ns-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .ns-slot { flex-shrink:0; min-width:140px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .ns-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .ns-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; transition:all .16s; min-height:150px; }
  .ns-bin[data-shake="true"] { animation:nsShake .4s; border-color:${NO}; }
  .ns-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .ns-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .ns-q:disabled{ cursor:default; }
  .ns-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .ns-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .ns-btn:disabled { opacity:.45; cursor:not-allowed; }
  .ns-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:11px; }
  .ns-sat { position:relative; display:flex; flex-direction:column; text-align:left; border-radius:14px; overflow:hidden; padding:0;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; cursor:pointer; min-width:0; transition:transform .14s, border-color .14s, background .14s; }
  .ns-sat:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .ns-sat[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .ns-foto { position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; font-size:30px;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); color:rgba(255,255,255,0.7); }
  .ns-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .ns-sat-cuerpo { display:flex; flex-direction:column; gap:7px; padding:10px 12px 12px; font-size:14px; line-height:1.4; }
  .ns-sat-cuerpo strong { font-size:14px; font-weight:800; }
  .ns-costo { position:absolute; top:8px; right:8px; padding:3px 9px; border-radius:999px; background:rgba(4,10,22,0.85); color:${AMBAR};
    font-size:14px; font-weight:900; border:1px solid ${AMBAR}66; }
  .ns-tilde { position:absolute; top:8px; left:8px; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    background:${OK}; color:#04121f; font-size:14px; }
  .ns-efs { display:flex; flex-wrap:wrap; gap:5px; }
  .ns-ef { display:inline-flex; align-items:center; gap:5px; padding:2px 8px; border-radius:999px; font-size:14px; font-weight:800;
    background:rgba(255,255,255,0.07); border:1px solid ${T.line}; }
  .ns-medidor { display:grid; grid-template-columns:minmax(0,9.5rem) minmax(0,1fr) 3ch; align-items:center; gap:10px; font-size:14px; font-weight:800; }
  .ns-medidor svg { width:100%; height:22px; display:block; }
  .ns-fichas { display:flex; flex-wrap:wrap; gap:5px; }
  .ns-ficha { width:22px; height:22px; border-radius:50%; border:2px solid ${AMBAR}; background:${AMBAR}; transition:all .2s; }
  .ns-ficha[data-gastada="true"] { background:transparent; opacity:.35; }
  .ns-informe { border-radius:14px; padding:12px 14px; display:grid; gap:7px; font-size:14px; line-height:1.45; }
  @media (prefers-reduced-motion: reduce){
    .ns-row[data-shake="true"], .ns-bin[data-shake="true"] { animation:none; }
  }

  /* Identidad del tablero */
  .ns-bin, .ns-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .ns-bin:nth-of-type(6n+1), .ns-row:nth-of-type(6n+1) { --tono:188; }
  .ns-bin:nth-of-type(6n+2), .ns-row:nth-of-type(6n+2) { --tono:262; }
  .ns-bin:nth-of-type(6n+3), .ns-row:nth-of-type(6n+3) { --tono:44; }
  .ns-bin:nth-of-type(6n+4), .ns-row:nth-of-type(6n+4) { --tono:152; }
  .ns-bin:nth-of-type(6n+5), .ns-row:nth-of-type(6n+5) { --tono:330; }
  .ns-bin:nth-of-type(6n+6), .ns-row:nth-of-type(6n+6) { --tono:18; }
  .ns-bin::before, .ns-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .ns-bin[data-done="true"], .ns-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){
    .ns-chip, .ns-chip:hover, .ns-chip[data-sel="true"], .ns-sat, .ns-sat:hover, .ns-ficha { transform:none; transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador: presupuesto del mes
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono }: { clave: string; icono: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <div className="ns-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} />}
    </div>
  );
}

function Presupuesto({
  sel,
  gastado,
  nivel,
  cerrado,
  rep,
  aviso,
  onAlternar,
  onCerrar,
  accent,
}: {
  sel: string[];
  gastado: number;
  nivel: ReturnType<typeof niveles>;
  cerrado: boolean;
  rep: ReturnType<typeof informe>;
  aviso: string | null;
  onAlternar: (s: SatisfactorSim) => void;
  onCerrar: () => void;
  accent: string;
}) {
  return (
    <>
      <div style={{ ...card, padding: "14px 16px", display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>Familia Ramírez Luna · simulación</Eyebrow>
          <div className="ns-fichas" aria-label={`${INGRESO - gastado} fichas disponibles de ${INGRESO}`}>
            {Array.from({ length: INGRESO }, (_, i) => (
              <span key={i} className="ns-ficha" data-gastada={i < gastado} />
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {NECESIDADES_FAMILIA.map((n) => {
            const v = nivel[n.id];
            const ok = v >= UMBRAL;
            return (
              <div key={n.id} className="ns-medidor">
                <span style={{ color: n.color }}>
                  <i className={`fa-solid ${n.icono}`} aria-hidden style={{ marginRight: 7 }} />
                  {n.nombre}
                </span>
                <svg viewBox="0 0 100 10" preserveAspectRatio="none" role="img" aria-label={`${n.nombre}: ${v} de 100`}>
                  <rect x="0" y="1" width="100" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
                  <rect x="0" y="1" width={v} height="8" rx="4" fill={ok ? OK : n.color} style={{ transition: "width .35s ease" }} />
                  <line x1={UMBRAL} y1="0" x2={UMBRAL} y2="10" stroke="#fff" strokeWidth="0.8" strokeDasharray="1.5 1.2" />
                </svg>
                <span style={{ color: ok ? OK : "#fff", fontVariantNumeric: "tabular-nums" }}>{v}</span>
              </div>
            );
          })}
          <div style={{ fontSize: 14, color: T.text3 }}>La línea punteada marca el nivel de necesidad cubierta ({UMBRAL}).</div>
        </div>
      </div>

      <div className="ns-grid">
        {SATISFACTORES.map((s) => {
          const on = sel.includes(s.id);
          return (
            <button key={s.id} type="button" className="ns-sat" data-sel={on} aria-pressed={on} onClick={() => onAlternar(s)}>
              <Foto clave={s.clave} icono={s.icono} />
              <span className="ns-costo">{s.costo} {s.costo === 1 ? "ficha" : "fichas"}</span>
              {on && (
                <span className="ns-tilde" aria-hidden>
                  <i className="fa-solid fa-check" />
                </span>
              )}
              <span className="ns-sat-cuerpo">
                <strong>{s.nombre}</strong>
                <span className="ns-efs">
                  {NECESIDADES_FAMILIA.filter((n) => (s.efectos[n.id] ?? 0) > 0).map((n) => (
                    <span key={n.id} className="ns-ef" style={{ color: n.color }} title={`Promete ayudar a ${n.nombre}`}>
                      <i className={`fa-solid ${n.icono}`} aria-hidden />+
                    </span>
                  ))}
                  {!s.pseudo && cuantasCubre(s) > 1 && <span style={{ fontSize: 14, color: T.text2 }}>cubre {cuantasCubre(s)} necesidades</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {aviso && (
        <div className="ns-pista" role="status">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden /> {aviso}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="ns-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={onCerrar} disabled={sel.length === 0}>
          <i className="fa-solid fa-calendar-check" aria-hidden />
          Cerrar el mes
        </button>
        <span style={{ fontSize: 14, color: T.text2 }}>Gastaste {gastado} de {INGRESO} fichas.</span>
      </div>

      {cerrado && (
        <div className="ns-informe" role="status" style={{ border: `1px solid ${rep.ok ? OK : AMBAR}66`, background: `${rep.ok ? OK : AMBAR}12` }}>
          <strong style={{ color: rep.ok ? OK : AMBAR }}>
            <i className={`fa-solid ${rep.ok ? "fa-circle-check" : "fa-circle-half-stroke"}`} aria-hidden /> {rep.ok ? "Mes cerrado: la familia cubrió sus necesidades" : "Mes cerrado: quedaron necesidades sin cubrir"}
          </strong>
          {rep.notas.map((n, i) => (
            <span key={i} style={{ color: T.text2 }}>{n}</span>
          ))}
        </div>
      )}
    </>
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

function BinsTarjetas({
  selTarj,
  shakeTarj,
  ubicTarj,
  onMatch,
  dropProps,
}: {
  selTarj: string | null;
  shakeTarj: Categoria | null;
  ubicTarj: Record<string, Categoria>;
  onMatch: (tarjId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["necesidad", "satisfactor"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = TARJETAS.filter((t) => ubicTarj[t.id] === bin);
        return (
          <div
            key={bin}
            className="ns-bin"
            data-shake={shakeTarj === bin}
            onClick={() => selTarj && onMatch(selTarj, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((t) => (
                  <span key={t.id} style={{ animation: "nsPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 12, color: OK, marginTop: 3 }} />
                    {t.texto}
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

function RowsParejas({
  selPar,
  shakePar,
  empPar,
  onMatch,
  dropProps,
}: {
  selPar: string | null;
  shakePar: string | null;
  empPar: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PAREJAS.map((p) => {
        const done = empPar[p.id];
        return (
          <div
            key={p.id}
            className="ns-row"
            data-shake={shakePar === p.id}
            data-done={done}
            onClick={() => !done && selPar && onMatch(selPar, p.id)}
            {...dropProps((id) => onMatch(id, p.id))}
          >
            <div className="ns-slot" data-armed={!done && !!selPar} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "nsPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-hand-holding-heart" />
                  {p.necesidad}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }} /> necesidad
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 160px", minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{p.satisfactor}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{p.ejemplo}</div>
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
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
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
        Cinco afirmaciones sobre las necesidades, los satisfactores y el bienestar social desde el enfoque de derechos. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
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
                    <button key={oi} className="ns-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="ns-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="ns-btn" onClick={reintentar}>
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
