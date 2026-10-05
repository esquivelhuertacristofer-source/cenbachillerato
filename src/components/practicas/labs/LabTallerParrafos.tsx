"use client";

/**
 * Laboratorio — Taller de párrafos.
 * Práctica experimental para LC-I-P04-A2 (Lengua y Comunicación I · tipos de párrafo).
 *
 * El alumno EXPERIMENTA con la estructura del texto. «Taller» es el simulador:
 * arma un párrafo con tarjetas (oración temática, dos de apoyo y cierre), elige el
 * conector que une cada idea con la anterior y un lector ficticio reacciona al
 * instante: su comprensión (medidor), su cara y un diagrama de estructura cambian
 * con cada tarjeta y cada conector. Modos extra de repaso:
 *  · «Arma el texto»: ordena párrafos (introductorio → desarrollo → conclusión).
 *  · «Clasifica los párrafos» por su función.
 *  · «Clasifica los conectores» por su relación (adición / contraste / causa).
 *  · «Completa el texto» (huecos de la progresión).
 *  + Reto de comprensión (pestaña «Reto»). La teoría vive en la pestaña «Teoría».
 *
 * DOM puro (sin three.js). Contenido VERBATIM de las actividades A1/A2/A6 de
 * LC-I·P04; las cifras de comprensión son una simulación.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { TALLER_PARRAFOS_HUECOS } from "./taller-parrafos-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { TALLER_PARRAFOS_FICHA } from "./taller-parrafos-ficha";
import {
  TEXTOS,
  PARRAFOS,
  FUNCION_INFO,
  CONECTORES,
  RELACION_INFO,
  QUIZ,
  DATO_PARRAFOS,
  type Funcion,
  type Relacion,
} from "./tipos-parrafo-data";
import {
  TEMAS_TALLER,
  POSICIONES,
  CONECTOR_DE,
  LECTOR_INFO,
  evaluarParrafo,
  textoParrafo,
  type Evaluacion,
  type TemaTaller,
} from "./taller-parrafos-sim";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-parrafos-reto";
const RUTA_FOTOS = "/media/labs-sim/taller-parrafos";

type Modo = "taller" | "armar" | "tipos" | "conectores" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "taller", label: "Taller del párrafo", icono: "fa-pen-ruler" },
  { id: "armar", label: "Arma el texto", icono: "fa-layer-group" },
  { id: "tipos", label: "Clasifica los párrafos", icono: "fa-paragraph" },
  { id: "conectores", label: "Clasifica los conectores", icono: "fa-link" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "es");

interface EstadoSim {
  slots: (string | null)[];
  con: (Relacion | null)[];
}
const SIM_VACIO: EstadoSim = { slots: [null, null, null, null], con: [null, null, null] };

export function LabTallerParrafos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("taller");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetHuecos = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };
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
  const sfxBlip = () => sonido && audioRef.current?.blip();

  // ── simulador: Taller del párrafo ─────────────────────────────────────
  const [temaIdx, setTemaIdx] = useState(0);
  const [sims, setSims] = useState<Record<string, EstadoSim>>({});
  const [slotSel, setSlotSel] = useState<number | null>(null);
  const [simCompleto, setSimCompleto] = useState(false);
  const [simBest, setSimBest] = useState(0);
  const temaSim: TemaTaller = TEMAS_TALLER[temaIdx]!;
  const sim = sims[temaSim.id] ?? SIM_VACIO;
  const ev: Evaluacion = evaluarParrafo(temaSim, sim.slots, sim.con);
  const simDone = simBest >= 80;

  const confirmaSim = (next: EstadoSim) => {
    setSims((s) => ({ ...s, [temaSim.id]: next }));
    const e = evaluarParrafo(temaSim, next.slots, next.con);
    if (e.completo) {
      setSimCompleto(true);
      if (e.comprension > simBest) {
        setSimBest(e.comprension);
        if (e.comprension >= 80 && simBest < 80) {
          sfxOk();
          persistMejor(armarDone, tiposDone, conectoresDone, true);
        }
      }
    }
  };
  const ponerTarjeta = (id: string) => {
    if (sim.slots.includes(id)) return;
    const libre = slotSel !== null && sim.slots[slotSel] === null ? slotSel : sim.slots.indexOf(null);
    if (libre < 0) return;
    const slots = sim.slots.slice();
    slots[libre] = id;
    setSlotSel(null);
    sfxBlip();
    confirmaSim({ ...sim, slots });
  };
  const quitarTarjeta = (i: number) => {
    const slots = sim.slots.slice();
    slots[i] = null;
    sfxBlip();
    confirmaSim({ ...sim, slots });
  };
  const elegirConector = (i: number, rel: Relacion | null) => {
    const con = sim.con.slice();
    con[i] = rel;
    sfxBlip();
    confirmaSim({ ...sim, con });
  };
  const resetSim = () => {
    setSims((s) => ({ ...s, [temaSim.id]: SIM_VACIO }));
    setSlotSel(null);
  };

  // ── modo Armar (ordenar texto) ────────────────────────────────────────
  const [txtIdx, setTxtIdx] = useState(0);
  const [colocados, setColocados] = useState<Record<string, string[]>>({});
  const [armados, setArmados] = useState<Set<string>>(() => new Set<string>());
  const [selPar, setSelPar] = useState<string | null>(null);
  const [shakePar, setShakePar] = useState(false);

  const texto = TEXTOS[txtIdx]!;
  const ordenActual = colocados[texto.id] ?? [];
  const parrafosLibres = texto.parrafos.filter((p) => !ordenActual.includes(p.id)).sort(porTexto);

  const intentarPar = (parId: string) => {
    if (ordenActual.includes(parId)) return;
    const siguiente = texto.parrafos[ordenActual.length];
    if (siguiente && siguiente.id === parId) {
      const nuevoOrden = [...ordenActual, parId];
      setColocados((c) => ({ ...c, [texto.id]: nuevoOrden }));
      setSelPar(null);
      sfxPlace();
      if (nuevoOrden.length >= texto.parrafos.length) {
        const nuevosArmados = new Set(armados).add(texto.id);
        setArmados(nuevosArmados);
        sfxOk();
        persistMejor(nuevosArmados.size >= TEXTOS.length, tiposDone, conectoresDone, simDone);
      }
    } else {
      setShakePar(true);
      sfxNo();
      window.setTimeout(() => setShakePar(false), 420);
    }
  };
  const resetTexto = () => {
    setColocados((c) => ({ ...c, [texto.id]: [] }));
    setSelPar(null);
  };

  // ── modo Tipos (clasificar párrafos por función) ──────────────────────
  const [ubicPar, setUbicPar] = useState<Record<string, Funcion>>({});
  const [selParCls, setSelParCls] = useState<string | null>(null);
  const [shakeFun, setShakeFun] = useState<Funcion | null>(null);
  const parLibres = PARRAFOS.filter((p) => !ubicPar[p.id]);

  const intentarTipo = (parId: string, fun: Funcion) => {
    const p = PARRAFOS.find((x) => x.id === parId);
    if (!p || ubicPar[parId]) return;
    if (p.funcion === fun) {
      setUbicPar((u) => ({ ...u, [parId]: fun }));
      setSelParCls(null);
      sfxPlace();
      if (Object.keys(ubicPar).length + 1 >= PARRAFOS.length) {
        sfxOk();
        persistMejor(armarDone, true, conectoresDone, simDone);
      }
    } else {
      setShakeFun(fun);
      sfxNo();
      window.setTimeout(() => setShakeFun(null), 420);
    }
  };
  const resetTipos = () => {
    setUbicPar({});
    setSelParCls(null);
  };

  // ── modo Conectores ───────────────────────────────────────────────────
  const [ubicCon, setUbicCon] = useState<Record<string, Relacion>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeRel, setShakeRel] = useState<Relacion | null>(null);
  const conLibres = CONECTORES.filter((c) => !ubicCon[c.id]);

  const intentarCon = (conId: string, rel: Relacion) => {
    const c = CONECTORES.find((x) => x.id === conId);
    if (!c || ubicCon[conId]) return;
    if (c.relacion === rel) {
      setUbicCon((u) => ({ ...u, [conId]: rel }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(ubicCon).length + 1 >= CONECTORES.length) {
        sfxOk();
        persistMejor(armarDone, tiposDone, true, simDone);
      }
    } else {
      setShakeRel(rel);
      sfxNo();
      window.setTimeout(() => setShakeRel(null), 420);
    }
  };
  const resetCon = () => {
    setUbicCon({});
    setSelCon(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const armarDone = armados.size >= TEXTOS.length;
  const tiposDone = Object.keys(ubicPar).length >= PARRAFOS.length;
  const conectoresDone = Object.keys(ubicCon).length >= CONECTORES.length;
  const modosHechos = (simDone ? 1 : 0) + (armarDone ? 1 : 0) + (tiposDone ? 1 : 0) + (conectoresDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  // Persiste la mejor marca al completar un modo (en el handler, no en un efecto).
  const persistMejor = (a: boolean, t: boolean, c: boolean, s: boolean) => {
    const est = (a ? 1 : 0) + (t ? 1 : 0) + (c ? 1 : 0) + (s ? 1 : 0);
    registraEstrellas(Math.min(3, est));
  };

  const objetivos = [
    { txt: "Arma un párrafo completo: tema, dos apoyos y cierre", done: simCompleto },
    { txt: "Lleva al lector a «Entiende todo» con conectores que encajen", done: simDone },
    { txt: "Arma los textos en orden coherente", done: armarDone },
    { txt: "Clasifica los 6 párrafos por su función", done: tiposDone },
    { txt: "Clasifica los 9 conectores por su relación", done: conectoresDone },
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

  const resetActual =
    modo === "taller" ? resetSim : modo === "texto" ? resetHuecos : modo === "armar" ? resetTexto : modo === "tipos" ? resetTipos : resetCon;

  const lectura =
    modo === "taller" ? (
      <>Lector: {LECTOR_INFO[ev.estado].etiqueta} · comprensión {ev.comprension} %</>
    ) : modo === "armar" ? (
      <>Párrafos en su lugar: {ordenActual.length}/{texto.parrafos.length}</>
    ) : modo === "tipos" ? (
      <>Párrafos clasificados: {Object.keys(ubicPar).length}/{PARRAFOS.length}</>
    ) : modo === "conectores" ? (
      <>Conectores clasificados: {Object.keys(ubicCon).length}/{CONECTORES.length}</>
    ) : (
      <>Completa el texto con las palabras que faltan</>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {modo === "taller" && (
            <TallerPanel
              accent={accent}
              temaIdx={temaIdx}
              onTema={(i) => {
                setTemaIdx(i);
                setSlotSel(null);
              }}
              tema={temaSim}
              sim={sim}
              ev={ev}
              slotSel={slotSel}
              onSlot={(i) => (sim.slots[i] ? quitarTarjeta(i) : setSlotSel((s) => (s === i ? null : i)))}
              onTarjeta={ponerTarjeta}
              onConector={elegirConector}
            />
          )}

          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={TALLER_PARRAFOS_HUECOS}
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

          {modo === "armar" && (
            <ArmarPanel
              accent={accent}
              texto={texto}
              txtIdx={txtIdx}
              armados={armados}
              ordenActual={ordenActual}
              parrafosLibres={parrafosLibres}
              selPar={selPar}
              shakePar={shakePar}
              onSelTexto={(i) => setTxtIdx(i)}
              onSelPar={(id) => setSelPar((p) => (p === id ? null : id))}
              onSlot={() => {
                if (selPar) intentarPar(selPar);
              }}
              onDropSlot={(id) => intentarPar(id)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "tipos" && (
            <TiposPanel
              ubicPar={ubicPar}
              selParCls={selParCls}
              shakeFun={shakeFun}
              parLibres={parLibres}
              accent={accent}
              onSelPar={(id) => setSelParCls((p) => (p === id ? null : id))}
              onBin={(fun) => {
                if (selParCls) intentarTipo(selParCls, fun);
              }}
              onDropBin={(parId, fun) => intentarTipo(parId, fun)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "conectores" && (
            <ConectoresPanel
              ubicCon={ubicCon}
              selCon={selCon}
              shakeRel={shakeRel}
              conLibres={conLibres}
              onSelCon={(id) => setSelCon((p) => (p === id ? null : id))}
              onBin={(rel) => {
                if (selCon) intentarCon(selCon, rel);
              }}
              onDropBin={(conId, rel) => intentarCon(conId, rel)}
              dragProps={dragProps}
              dropProps={dropProps}
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
                  <Dato label="Comprensión ahora" value={`${ev.comprension} %`} col={LECTOR_INFO[ev.estado].color} />
                  <Dato label="Mejor párrafo" value={`${simBest} %`} col={simDone ? OK : undefined} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Dominaste el párrafo!" : "Completa los modos para 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Qué observar en el taller" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Cambia una tarjeta o un conector y mira el medidor del lector. Prueba poner una oración fuera de tema, o el conector equivocado, y compara.
                </p>
                {ev.notas.slice(0, 3).map((n, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 8 }} />
                    {n}
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
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Tipos de párrafo" icono="fa-paragraph">
                {(Object.keys(FUNCION_INFO) as Funcion[]).map((f) => (
                  <p key={f} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{FUNCION_INFO[f].label}.</strong> {FUNCION_INFO[f].descripcion}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Conectores" icono="fa-link">
                {(Object.keys(RELACION_INFO) as Relacion[]).map((r) => (
                  <p key={r} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{RELACION_INFO[r].label}.</strong> {RELACION_INFO[r].descripcion} Ej.: «{CONECTOR_DE[r]}».
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_PARRAFOS}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TALLER_PARRAFOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes tpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes tpPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes tpBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
  .tp-card { cursor:grab; display:block; padding:12px 15px; border-radius:13px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:${T.text}; font-size:14.5px; line-height:1.5; text-align:left; transition:all .14s; user-select:none; width:100%; }
  .tp-card:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
  .tp-card[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 16px -5px ${accent}; }
  .tp-card[data-usada="true"] { opacity:.35; cursor:default; }
  .tp-card:active { cursor:grabbing; }
  .tp-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; padding:11px 16px; border-radius:999px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:800; user-select:none;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .tp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .tp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .tp-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:130px; transition:all .16s; }
  .tp-bin[data-shake="true"] { animation:tpShake .4s; }
  .tp-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:60px;
    display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; gap:8px; transition:all .16s; }
  .tp-slot[data-active="true"] { border-color:${accent}; background:rgba(${rgba},0.1); cursor:pointer; }
  .tp-slot[data-shake="true"] { animation:tpShake .4s; border-color:${NO}; }
  .tp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .tp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .tp-q:disabled{ cursor:default; }
  .tp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .tp-btn:hover { border-color:${T.lineStrong}; }
  .tp-prob { cursor:pointer; padding:9px 14px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .tp-prob:hover { border-color:${T.lineStrong}; color:#fff; }
  .tp-prob[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
  .tp-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }

  /* Simulador: el taller y el lector */
  .tp-sim { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(0,1fr); gap:14px; align-items:start; }
  @container lsescena (max-width: 760px) { .tp-sim { grid-template-columns:1fr; } }
  .tp-colizq, .tp-colder { display:flex; flex-direction:column; gap:10px; min-width:0; }
  .tp-pos { display:flex; flex-direction:column; gap:6px; }
  .tp-pos-et { font-size:14px; font-weight:800; color:${T.text2}; display:flex; align-items:center; gap:8px; }
  .tp-colocada { cursor:pointer; text-align:left; width:100%; padding:11px 14px; border-radius:13px; font-size:14.5px; line-height:1.5; color:#fff;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; animation:tpPop .22s ease; }
  .tp-colocada[data-marca="ok"] { border-color:${OK}; background:${OK}14; }
  .tp-colocada[data-marca="mal"] { border-color:${NO}; background:${NO}12; }
  .tp-conectores { display:flex; flex-wrap:wrap; gap:6px; align-items:center; font-size:14px; color:${T.text3}; }
  .tp-con { cursor:pointer; padding:6px 12px; border-radius:999px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:700; }
  .tp-con:hover { border-color:${T.lineStrong}; color:#fff; }
  .tp-con[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); color:#fff; }
  .tp-lector { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; display:flex; flex-direction:column; gap:12px; }
  .tp-lector-cab { display:flex; gap:12px; align-items:center; }
  .tp-retrato { position:relative; flex-shrink:0; width:92px; height:92px; border-radius:50%; overflow:hidden; border:3px solid var(--rc,#8FA3BF);
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,18,36,0.9)); display:flex; align-items:center; justify-content:center; }
  .tp-retrato[data-estado="perdido"] { animation:tpShake .5s 1; }
  .tp-retrato[data-estado="entiende"] { animation:tpBob 1.4s ease-in-out infinite; }
  .tp-retrato > i { font-size:40px; color:var(--rc,#8FA3BF); }
  .tp-retrato img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tp-burbuja { position:relative; flex:1; min-width:0; border-radius:14px; padding:10px 12px; background:${T.inset}; border:1.5px solid var(--rc,#8FA3BF); font-size:14.5px; line-height:1.4; color:#fff; }
  .tp-medidor { position:relative; height:16px; border-radius:9px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .tp-medidor > div { height:100%; border-radius:9px; background:var(--rc,#8FA3BF); transition:width .35s; }
  .tp-medidor > span { position:absolute; top:0; bottom:0; width:2px; background:rgba(255,255,255,0.35); }
  .tp-diag { display:flex; flex-direction:column; align-items:stretch; gap:4px; }
  .tp-diag-b { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; font-size:14px; color:${T.text3}; font-weight:700; }
  .tp-diag-b[data-marca="ok"] { border-style:solid; border-color:var(--bc); background:rgba(255,255,255,0.05); color:#fff; }
  .tp-diag-b[data-marca="mal"] { border-style:solid; border-color:${NO}; background:${NO}12; color:#fff; }
  .tp-diag-f { align-self:center; font-size:14px; color:${T.text3}; font-weight:700; }
  .tp-diag-f[data-marca="ok"] { color:${OK}; }
  .tp-diag-f[data-marca="mal"] { color:${NO}; }
  .tp-parrafo { padding:12px 14px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.inset}; font-size:15px; line-height:1.6; color:#fff; }
  .tp-foto { position:relative; border-radius:14px; overflow:hidden; aspect-ratio:16/6; border:1.5px solid ${T.line};
    background:linear-gradient(135deg, rgba(${rgba},0.28), rgba(8,18,36,0.95)); display:flex; align-items:center; justify-content:center; }
  .tp-foto > i { font-size:34px; color:rgba(255,255,255,0.35); }
  .tp-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .tp-card:focus-visible, .tp-con:focus-visible, .tp-colocada:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }

  /* Identidad del tablero */
  .tp-bin { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .tp-bin:nth-of-type(6n+1) { --tono:188; }
  .tp-bin:nth-of-type(6n+2) { --tono:262; }
  .tp-bin:nth-of-type(6n+3) { --tono:44; }
  .tp-bin:nth-of-type(6n+4) { --tono:152; }
  .tp-bin:nth-of-type(6n+5) { --tono:330; }
  .tp-bin:nth-of-type(6n+6) { --tono:18; }
  .tp-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .tp-bin[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){
    .tp-slot[data-shake="true"], .tp-bin[data-shake="true"], .tp-retrato[data-estado="perdido"], .tp-retrato[data-estado="entiende"] { animation:none; }
    .tp-chip, .tp-chip:hover, .tp-chip[data-sel="true"] { transform:none; transition:none; }
    .tp-medidor > div { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Imagen con respaldo: degradado + ícono detrás; si el archivo no existe, se oculta.
 * ═══════════════════════════════════════════════════════════════════════════ */
function ImagenSim({ src, icono, clase, alt }: { src: string; icono: string; clase: string; alt: string }) {
  const [rota, setRota] = useState(false);
  return (
    <div className={clase}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!rota && (
        <img src={src} alt={alt} loading="lazy" onError={() => setRota(true)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Taller del párrafo» (simulador con lector ficticio)
 * ═══════════════════════════════════════════════════════════════════════════ */
function TallerPanel({
  accent,
  temaIdx,
  onTema,
  tema,
  sim,
  ev,
  slotSel,
  onSlot,
  onTarjeta,
  onConector,
}: {
  accent: string;
  temaIdx: number;
  onTema: (i: number) => void;
  tema: TemaTaller;
  sim: EstadoSim;
  ev: Evaluacion;
  slotSel: number | null;
  onSlot: (i: number) => void;
  onTarjeta: (id: string) => void;
  onConector: (i: number, rel: Relacion | null) => void;
}) {
  const info = LECTOR_INFO[ev.estado];
  const banco = tema.tarjetas.slice().sort(porTexto);
  const armado = textoParrafo(tema, sim.slots, sim.con);
  const frase = ev.estado === "vacio" || ev.notas.length === 0 ? info.frase : ev.notas[0]!;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {TEMAS_TALLER.map((t, i) => (
          <button key={t.id} type="button" className="tp-prob" data-on={temaIdx === i} onClick={() => onTema(i)}>
            {t.titulo}
          </button>
        ))}
      </div>
      <ImagenSim src={`${RUTA_FOTOS}/${tema.foto}.webp`} icono="fa-newspaper" clase="tp-foto" alt="" />

      <div className="tp-sim">
        <div className="tp-colizq">
          {POSICIONES.map((pos, i) => {
            const t = tema.tarjetas.find((x) => x.id === sim.slots[i]);
            const fi = FUNCION_INFO[pos.funcion];
            return (
              <div key={i} className="tp-pos">
                {i > 0 && (
                  <div className="tp-conectores" role="group" aria-label={`Conector antes de ${pos.etiqueta}`}>
                    <span>Conector:</span>
                    <button type="button" className="tp-con" data-on={sim.con[i - 1] === null} onClick={() => onConector(i - 1, null)}>
                      ninguno
                    </button>
                    {(Object.keys(CONECTOR_DE) as Relacion[]).map((r) => (
                      <button key={r} type="button" className="tp-con" data-on={sim.con[i - 1] === r} onClick={() => onConector(i - 1, r)}>
                        {CONECTOR_DE[r]}
                      </button>
                    ))}
                  </div>
                )}
                <div className="tp-pos-et">
                  <VinetaTermino termino={fi.label} color={fi.color} icono={fi.icono} tam={29} radio={8} />
                  {pos.etiqueta}
                </div>
                {t ? (
                  <button type="button" className="tp-colocada" data-marca={ev.posiciones[i]} onClick={() => onSlot(i)} title="Toca para quitar la tarjeta">
                    {t.texto}
                  </button>
                ) : (
                  <button type="button" className="tp-slot" data-active={slotSel === i} onClick={() => onSlot(i)}>
                    <i className="fa-solid fa-hand-pointer" /> {slotSel === i ? "Elige una tarjeta abajo" : "Toca para elegir este lugar"}
                  </button>
                )}
              </div>
            );
          })}
          {armado && (
            <div className="tp-parrafo" aria-live="polite">
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text3, marginBottom: 4 }}>Así lo leería el lector</div>
              {armado}
            </div>
          )}
        </div>

        <div className="tp-colder">
          <div className="tp-lector" style={{ ["--rc" as string]: info.color }}>
            <div className="tp-lector-cab">
              <div className="tp-retrato" data-estado={ev.estado}>
                <i className={`fa-solid ${info.icono}`} aria-hidden />
                <ImagenSimInterna key={info.foto} src={`${RUTA_FOTOS}/${info.foto}.webp`} />
              </div>
              <div className="tp-burbuja" aria-live="polite">
                <strong style={{ display: "block", color: info.color, fontSize: 14.5 }}>{info.etiqueta}</strong>
                {frase}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 5 }}>
                <span>Comprensión del lector</span>
                <span style={{ color: info.color }}>{ev.comprension} % · simulación</span>
              </div>
              <div className="tp-medidor" role="meter" aria-valuenow={ev.comprension} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${ev.comprension}%` }} />
                <span style={{ left: "30%" }} />
                <span style={{ left: "55%" }} />
                <span style={{ left: "80%" }} />
              </div>
            </div>
          </div>

          <div className="tp-lector">
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>
              <i className="fa-solid fa-diagram-project" style={{ color: accent, marginRight: 8 }} />
              Estructura de tu párrafo
            </div>
            <div className="tp-diag">
              {POSICIONES.map((pos, i) => {
                const fi = FUNCION_INFO[pos.funcion];
                return (
                  <div key={i} style={{ display: "contents" }}>
                    {i > 0 && (
                      <span className="tp-diag-f" data-marca={ev.enlaces[i - 1]}>
                        <i className="fa-solid fa-arrow-down" /> {sim.con[i - 1] ? CONECTOR_DE[sim.con[i - 1]!] : "sin conector"}
                      </span>
                    )}
                    <div className="tp-diag-b" data-marca={ev.posiciones[i]} style={{ ["--bc" as string]: fi.color }}>
                      <i className={`fa-solid ${fi.icono}`} style={{ color: fi.color }} />
                      {pos.etiqueta}
                      {ev.posiciones[i] === "ok" && <i className="fa-solid fa-check" style={{ marginLeft: "auto", color: OK }} />}
                      {ev.posiciones[i] === "mal" && <i className="fa-solid fa-xmark" style={{ marginLeft: "auto", color: NO }} />}
                    </div>
                  </div>
                );
              })}
            </div>
            {ev.notas.slice(0, 3).map((n, i) => (
              <div key={i} style={{ fontSize: 14, lineHeight: 1.45, color: T.text2 }}>
                <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 8 }} />
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: "14px 16px" }}>
        <Eyebrow>Tarjetas de oraciones: algunas no sirven</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 10 }}>
          {banco.map((t) => {
            const usada = sim.slots.includes(t.id);
            return (
              <button key={t.id} type="button" className="tp-card" data-usada={usada} disabled={usada} onClick={() => onTarjeta(t.id)}>
                {t.texto}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/** Imagen del retrato: se oculta sola si el archivo aún no existe. */
function ImagenSimInterna({ src }: { src: string }) {
  const [rota, setRota] = useState(false);
  if (rota) return null;
  return <img src={src} alt="" onError={() => setRota(true)} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Arma el texto» (ordenar párrafos)
 * ═══════════════════════════════════════════════════════════════════════════ */
function ArmarPanel({
  accent,
  texto,
  txtIdx,
  armados,
  ordenActual,
  parrafosLibres,
  selPar,
  shakePar,
  onSelTexto,
  onSelPar,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  texto: (typeof TEXTOS)[number];
  txtIdx: number;
  armados: Set<string>;
  ordenActual: string[];
  parrafosLibres: (typeof TEXTOS)[number]["parrafos"];
  selPar: string | null;
  shakePar: boolean;
  onSelTexto: (i: number) => void;
  onSelPar: (id: string) => void;
  onSlot: () => void;
  onDropSlot: (id: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const completado = armados.has(texto.id);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {TEXTOS.map((t, i) => (
          <button key={t.id} className="tp-prob" data-on={txtIdx === i} data-done={armados.has(t.id)} onClick={() => onSelTexto(i)}>
            {armados.has(t.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {t.titulo}
          </button>
        ))}
      </div>

      <Mesa>
        <div>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Párrafos disponibles — arrástralos en orden</Eyebrow>
        {parrafosLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Texto coherente armado! Cambia de texto arriba para armar otro.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {parrafosLibres.map((p) => (
              <button key={p.id} className="tp-card" data-sel={selPar === p.id} onClick={() => onSelPar(p.id)} {...dragProps(p.id)}>
                {p.texto}
              </button>
            ))}
          </div>
        )}
      </div>
        </div>
        <div>
      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
            «{texto.titulo}» — ordena los párrafos
          </Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: completado ? OK : T.text3 }}>
            {completado ? "Texto completo ✓" : `${ordenActual.length}/${texto.parrafos.length} párrafos`}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {texto.parrafos.map((_, i) => {
            const colocadoId = ordenActual[i];
            const par = colocadoId ? texto.parrafos.find((p) => p.id === colocadoId) : null;
            const esActivo = i === ordenActual.length;
            const info = par ? FUNCION_INFO[par.funcion] : null;
            return (
              <div key={i}>
                {i > 0 && (
                  <div style={{ textAlign: "center", color: T.text3, lineHeight: 0.6, margin: "1px 0" }}>
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: 14, opacity: par || i <= ordenActual.length ? 0.7 : 0.2 }} />
                  </div>
                )}
                {par && info ? (
                  <div style={{ animation: "tpPop .25s ease", padding: "12px 15px", borderRadius: 13, border: `1.5px solid ${info.color}`, background: `${info.color}1a` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, background: `${info.color}33`, color: "#fff" }}>{i + 1}</span>
                      <VinetaTermino termino={info.label} color={info.color} icono={info.icono} tam={29} radio={8} />
                      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", color: info.color, textTransform: "uppercase" }}>{info.label}</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: "#fff" }}>{par.texto}</div>
                  </div>
                ) : (
                  <div
                    className="tp-slot"
                    data-active={esActivo}
                    data-shake={esActivo && shakePar}
                    onClick={() => esActivo && onSlot()}
                    {...(esActivo ? dropProps((id) => onDropSlot(id)) : {})}
                  >
                    {esActivo ? (
                      <>
                        <i className="fa-solid fa-arrow-down-to-bracket" /> Suelta aquí el párrafo {i + 1}
                      </>
                    ) : (
                      <span style={{ opacity: 0.4 }}>Párrafo {i + 1}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

        </div>
      </Mesa>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Clasifica los párrafos» (por función)
 * ═══════════════════════════════════════════════════════════════════════════ */
function TiposPanel({
  ubicPar,
  selParCls,
  shakeFun,
  parLibres,
  accent,
  onSelPar,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  ubicPar: Record<string, Funcion>;
  selParCls: string | null;
  shakeFun: Funcion | null;
  parLibres: typeof PARRAFOS;
  accent: string;
  onSelPar: (id: string) => void;
  onBin: (fun: Funcion) => void;
  onDropBin: (parId: string, fun: Funcion) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const funciones: Funcion[] = ["introductorio", "desarrollo", "conclusion"];
  const colocados = Object.keys(ubicPar).length;
  const sel = parLibres.find((p) => p.id === selParCls) ?? null;
  return (
    <>
      <Mesa>
        <div>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Lee cada párrafo y arrástralo a su función</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: colocados >= PARRAFOS.length ? OK : T.text3 }}>{colocados}/{PARRAFOS.length}</span>
        </div>
        {parLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 6 párrafos!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {parLibres.map((p) => (
              <button key={p.id} className="tp-card" data-sel={selParCls === p.id} onClick={() => onSelPar(p.id)} {...dragProps(p.id)}>
                {p.texto}
              </button>
            ))}
          </div>
        )}
        {sel && (
          <div style={{ marginTop: 12, fontSize: 14, color: accent, display: "flex", gap: 8, alignItems: "center" }}>
            <i className="fa-solid fa-magnifying-glass" /> Pista: {sel.pista}
          </div>
        )}
      </div>

        </div>
        <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14 }}>
        {funciones.map((fun) => {
          const info = FUNCION_INFO[fun];
          const dentro = PARRAFOS.filter((p) => ubicPar[p.id] === fun);
          return (
            <div
              key={fun}
              className="tp-bin"
              data-shake={shakeFun === fun}
              onClick={() => onBin(fun)}
              {...dropProps((parId) => onDropBin(parId, fun))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selParCls ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.3 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.map((p) => (
                  <span key={p.id} style={{ animation: "tpPop .25s ease", fontSize: 14, lineHeight: 1.4, color: "#fff", padding: "8px 10px", borderRadius: 9, background: `${info.color}1f`, border: `1px solid ${info.color}55` }}>
                    {p.texto.length > 90 ? p.texto.slice(0, 88) + "…" : p.texto}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Vacío</span>}
              </div>
            </div>
          );
        })}
      </div>
        </div>
      </Mesa>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Clasifica los conectores»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ConectoresPanel({
  ubicCon,
  selCon,
  shakeRel,
  conLibres,
  onSelCon,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  ubicCon: Record<string, Relacion>;
  selCon: string | null;
  shakeRel: Relacion | null;
  conLibres: typeof CONECTORES;
  onSelCon: (id: string) => void;
  onBin: (rel: Relacion) => void;
  onDropBin: (conId: string, rel: Relacion) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const relaciones: Relacion[] = ["adicion", "contraste", "causa"];
  const colocados = Object.keys(ubicCon).length;
  return (
    <>
      <Mesa>
        <div>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Arrastra cada conector a su relación</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: colocados >= CONECTORES.length ? OK : T.text3 }}>{colocados}/{CONECTORES.length}</span>
        </div>
        {conLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 9 conectores!
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {conLibres.map((c) => (
              <button key={c.id} className="tp-chip" data-sel={selCon === c.id} onClick={() => onSelCon(c.id)} {...dragProps(c.id)}>
                {c.texto}
              </button>
            ))}
          </div>
        )}
      </div>

        </div>
        <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14 }}>
        {relaciones.map((rel) => {
          const info = RELACION_INFO[rel];
          const dentro = CONECTORES.filter((c) => ubicCon[c.id] === rel);
          return (
            <div
              key={rel}
              className="tp-bin"
              data-shake={shakeRel === rel}
              onClick={() => onBin(rel)}
              {...dropProps((conId) => onDropBin(conId, rel))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selCon ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 14, color: T.text3 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {dentro.map((c) => (
                  <span key={c.id} style={{ animation: "tpPop .25s ease", fontSize: 14, fontWeight: 800, color: "#fff", padding: "6px 12px", borderRadius: 999, background: `${info.color}26`, border: `1px solid ${info.color}55` }}>
                    {c.texto}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Vacío</span>}
              </div>
            </div>
          );
        })}
      </div>
        </div>
      </Mesa>
    </>
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
        Cinco preguntas sobre la oración temática, los tipos de párrafo y los conectores. Responde y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="tp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="tp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="tp-btn" onClick={reintentar}>
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
