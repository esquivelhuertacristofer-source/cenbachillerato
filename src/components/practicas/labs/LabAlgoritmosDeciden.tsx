"use client";

/**
 * Laboratorio — Los algoritmos deciden por nosotros
 * Práctica experimental para CD-I-P04-A1 (Cultura Digital I).
 *
 * Tema: los algoritmos de RECOMENDACIÓN que deciden el contenido que vemos
 * (NO los algoritmos de programación). El alumno EXPERIMENTA con un feed:
 *
 *  · «Simula tu algoritmo» (modo principal): «Rumbo» es una plataforma FICTICIA
 *    y Dani una usuaria ficticia. El alumno ajusta qué señales pesan (emoción,
 *    parecido a su historial, fiabilidad, variedad), qué datos usa el algoritmo
 *    y con qué objetivo se entrenó. Ocho videos se reordenan al instante y tres
 *    medidores (tiempo, burbuja de filtro, desinformación; marcados como
 *    simulación) muestran qué se gana y qué se pierde, con el porqué.
 *  · Tres modos de clasificar (verbatim de la lectura A1): decisiones por
 *    plataforma, causa y efecto, y los pasos con que se arma el feed.
 *  · «Completa el texto» (verbatim de la progresión).
 *  · Reto: cuestionario de comprensión (opción múltiple verbatim de A2).
 *
 * DOM puro (sin three.js): ratón, teclado y táctil. Contenido curricular
 * VERBATIM de CD-I·P04 (vive en «Teoría»). Plataforma, canales y cifras del
 * simulador: FICTICIOS.
 */

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato, Deslizador } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { ALGORITMOS_DECIDEN_HUECOS } from "./algoritmos-deciden-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { ALGORITMOS_DECIDEN_FICHA } from "./algoritmos-deciden-ficha";
import {
  DECISIONES,
  PLATAFORMA_INFO,
  PARES_CAUSA,
  PASOS_FEED,
  GLOSARIO,
  QUIZ,
  DATO_ALGORITMOS,
  type Plataforma,
} from "./algoritmos-deciden-data";
import {
  TEMAS,
  OBJETIVOS,
  PRESETS,
  DEFECTO,
  PANTALLA,
  ordenar,
  medir,
  veredicto,
  explicar,
  type Config,
  type Objetivo,
  type Tema,
  type Posicion,
} from "./algoritmos-deciden-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
const RETO_KEY = "cen-algoritmos-deciden-reto";
const RUTA_IMG = "/media/labs-sim/algoritmos-deciden";

type Modo = "sim" | "plataformas" | "causa" | "feed" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "sim", label: "Simula tu algoritmo", icono: "fa-sliders" },
  { id: "plataformas", label: "¿Qué decide cada algoritmo?", icono: "fa-layer-group" },
  { id: "causa", label: "Causa y efecto", icono: "fa-arrows-turn-to-dots" },
  { id: "feed", label: "¿Cómo arma tu feed?", icono: "fa-list-ol" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const TONO_TEMA: Record<Tema, number> = { deportes: 150, ciencia: 200, cocina: 30, noticias: 350, musica: 270 };

const nivelEmo = (n: number) => (n >= 75 ? "Emoción alta" : n >= 45 ? "Emoción media" : "Emoción baja");

export function LabAlgoritmosDeciden({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("sim");

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
  const sfxBlip = () => sonido && audioRef.current?.blip();

  // ── simulador del feed ────────────────────────────────────────────────
  const [cfg, setCfg] = useState<Config>(DEFECTO);
  const [hEmo, setHEmo] = useState(false);
  const [hSano, setHSano] = useState(false);
  const orden = ordenar(cfg);
  const med = medir(orden);
  const vere = veredicto(med);
  const porques = explicar(cfg, orden, med);

  const ajustar = (parcial: Partial<Config>) => {
    const n = { ...cfg, ...parcial };
    setCfg(n);
    const m = medir(ordenar(n));
    // Los hitos se guardan: cambiar de modo o de ajuste no los des-cumple.
    if (n.emo >= 90 && m.desinfo >= 50) setHEmo(true);
    if (m.desinfo === 0 && m.burbuja <= 45) setHSano(true);
    sfxBlip();
  };
  const resetSim = () => setCfg(DEFECTO);

  // ── modo plataformas (clasifica cada decisión por plataforma) ──────────
  const [ubicPlat, setUbicPlat] = useState<Record<string, Plataforma>>({});
  const [selPlat, setSelPlat] = useState<string | null>(null);
  const [shakePlat, setShakePlat] = useState<Plataforma | null>(null);
  const platLibres = DECISIONES.filter((d) => !ubicPlat[d.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarPlat = (decisionId: string, bin: Plataforma) => {
    if (ubicPlat[decisionId]) return;
    const d = DECISIONES.find((x) => x.id === decisionId);
    if (d && d.plataforma === bin) {
      setUbicPlat((e) => ({ ...e, [decisionId]: bin }));
      setSelPlat(null);
      sfxPlace();
      if (Object.keys(ubicPlat).length + 1 >= DECISIONES.length) {
        sfxOk();
        persistMejor(true, causaDone, feedDone);
      }
    } else {
      setShakePlat(bin);
      sfxNo();
      window.setTimeout(() => setShakePlat(null), 420);
    }
  };
  const resetPlat = () => {
    setUbicPlat({});
    setSelPlat(null);
  };

  // ── modo causa (empareja concepto → efecto) ────────────────────────────
  const [empCausa, setEmpCausa] = useState<Record<string, boolean>>({});
  const [selCausa, setSelCausa] = useState<string | null>(null);
  const [shakeCausa, setShakeCausa] = useState<string | null>(null);
  const causaLibres = PARES_CAUSA.filter((c) => !empCausa[c.id]).slice().sort((a, b) => a.concepto.localeCompare(b.concepto, "es"));

  const intentarCausa = (chipId: string, rowId: string) => {
    if (empCausa[rowId]) return;
    if (chipId === rowId) {
      setEmpCausa((e) => ({ ...e, [rowId]: true }));
      setSelCausa(null);
      sfxPlace();
      if (Object.keys(empCausa).length + 1 >= PARES_CAUSA.length) {
        sfxOk();
        persistMejor(platDone, true, feedDone);
      }
    } else {
      setShakeCausa(rowId);
      sfxNo();
      window.setTimeout(() => setShakeCausa(null), 420);
    }
  };
  const resetCausa = () => {
    setEmpCausa({});
    setSelCausa(null);
  };

  // ── modo feed (ordena los pasos) ───────────────────────────────────────
  const [colocados, setColocados] = useState<string[]>([]);
  const [selPaso, setSelPaso] = useState<string | null>(null);
  const [shakeFeed, setShakeFeed] = useState(false);
  const pasosLibres = PASOS_FEED.filter((p) => !colocados.includes(p.id)).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarPaso = (pasoId: string) => {
    if (colocados.includes(pasoId)) return;
    const siguiente = PASOS_FEED[colocados.length];
    if (siguiente && siguiente.id === pasoId) {
      const nuevo = [...colocados, pasoId];
      setColocados(nuevo);
      setSelPaso(null);
      sfxPlace();
      if (nuevo.length >= PASOS_FEED.length) {
        sfxOk();
        persistMejor(platDone, causaDone, true);
      }
    } else {
      setShakeFeed(true);
      sfxNo();
      window.setTimeout(() => setShakeFeed(false), 420);
    }
  };
  const resetFeed = () => {
    setColocados([]);
    setSelPaso(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const platDone = Object.keys(ubicPlat).length >= DECISIONES.length;
  const causaDone = Object.keys(empCausa).length >= PARES_CAUSA.length;
  const feedDone = colocados.length >= PASOS_FEED.length;
  const modosHechos = (platDone ? 1 : 0) + (causaDone ? 1 : 0) + (feedDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Sube la reacción emocional al 90 % o más y mira cuánta desinformación llega al feed", done: hEmo },
    { txt: "Arma un feed sin desinformación y con burbuja baja, y mira qué le pasa al tiempo en la plataforma", done: hSano },
    { txt: "Clasifica las 4 decisiones por plataforma", done: platDone },
    { txt: "Empareja las 5 ideas con su efecto", done: causaDone },
    { txt: "Ordena los 5 pasos del feed", done: feedDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

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

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "texto" ? resetTexto : modo === "sim" ? resetSim : modo === "plataformas" ? resetPlat : modo === "causa" ? resetCausa : resetFeed;

  const lectura =
    modo === "sim" ? (
      <>Tiempo {med.tiempo} · Burbuja {med.burbuja} · Engañosos {med.enganosos}/{PANTALLA}</>
    ) : modo === "plataformas" ? (
      <>Decisiones clasificadas: {Object.keys(ubicPlat).length}/{DECISIONES.length}</>
    ) : modo === "causa" ? (
      <>Ideas emparejadas: {Object.keys(empCausa).length}/{PARES_CAUSA.length}</>
    ) : modo === "feed" ? (
      <>Pasos ordenados: {colocados.length}/{PASOS_FEED.length}</>
    ) : (
      <>Completa el párrafo sobre los algoritmos</>
    );

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
      <span>{txt}</span>
      {n && <span style={{ fontSize: 15, fontWeight: 900, color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
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

          {modo === "sim" && (
            <SimuladorFeed cfg={cfg} orden={orden} med={med} vere={vere} porques={porques} accent={accent} onPreset={(c) => ajustar(c)} />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={ALGORITMOS_DECIDEN_HUECOS}
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

          {modo === "plataformas" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada decisión a la plataforma cuyo algoritmo la toma", `${Object.keys(ubicPlat).length}/${DECISIONES.length}`, platDone)}
                {platLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {DECISIONES.length} decisiones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {platLibres.map((d) => (
                      <button key={d.id} className="ad-chip" data-sel={selPlat === d.id} onClick={() => setSelPlat((s) => (s === d.id ? null : d.id))} {...dragProps(d.id)}>
                        {d.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsPlataformas selPlat={selPlat} shakePlat={shakePlat} ubicPlat={ubicPlat} onMatch={intentarPlat} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "causa" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada idea a lo que provoca o significa", `${Object.keys(empCausa).length}/${PARES_CAUSA.length}`, causaDone)}
                {causaLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES_CAUSA.length} ideas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {causaLibres.map((c) => (
                      <button key={c.id} className="ad-chip" data-sel={selCausa === c.id} onClick={() => setSelCausa((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                        <i className="fa-solid fa-arrows-turn-to-dots" style={{ fontSize: 14, color: T.text3 }} />
                        {c.concepto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsCausa selCausa={selCausa} shakeCausa={shakeCausa} empCausa={empCausa} onMatch={intentarCausa} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "feed" && (
            <Mesa>
              <div>
                {instruccion("Arrastra los pasos en el orden en que el algoritmo arma tu feed", `${colocados.length}/${PASOS_FEED.length}`, feedDone)}
                {pasosLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Ordenaste los {PASOS_FEED.length} pasos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {pasosLibres.map((p) => (
                      <button key={p.id} className="ad-chip" data-sel={selPaso === p.id} onClick={() => setSelPaso((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-list-ol" style={{ fontSize: 14, color: T.text3 }} />
                        {p.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <ListaFeed colocados={colocados} selPaso={selPaso} shakeFeed={shakeFeed} onPlace={intentarPaso} dropProps={dropProps} />
            </Mesa>
          )}
        </div>
      }
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Qué mira el algoritmo" icono="fa-sliders">
                <Deslizador label="Reacción emocional" icon="fa-fire" colr="#FF8A5B" valor={`${cfg.emo} %`} min={0} max={100} step={5} value={cfg.emo} onChange={(v) => ajustar({ emo: v })} hintL="ignora" hintR="premia lo que enciende" />
                <Deslizador label="Parecido a lo que ya viste" icon="fa-clone" colr="#B58CFF" valor={`${cfg.afi} %`} min={0} max={100} step={5} value={cfg.afi} onChange={(v) => ajustar({ afi: v })} hintL="ignora" hintR="más de lo mismo" />
                <Deslizador label="Fiabilidad de la fuente" icon="fa-shield-halved" colr={OK} valor={`${cfg.cal} %`} min={0} max={100} step={5} value={cfg.cal} onChange={(v) => ajustar({ cal: v })} hintL="ignora" hintR="premia lo verificable" />
                <Deslizador label="Variedad de temas" icon="fa-shuffle" colr="#5BC8FF" valor={`${cfg.div} %`} min={0} max={100} step={5} value={cfg.div} onChange={(v) => ajustar({ div: v })} hintL="repite tema" hintR="castiga repetir" />
              </Bloque>

              <Bloque titulo="Qué datos usa" icono="fa-database">
                <button type="button" className="ad-toggle" aria-pressed={cfg.historial} onClick={() => ajustar({ historial: !cfg.historial })}>
                  <i className={`fa-solid ${cfg.historial ? "fa-toggle-on" : "fa-toggle-off"}`} aria-hidden />
                  <span>Historial de lo que Dani ya vio</span>
                </button>
                <button type="button" className="ad-toggle" aria-pressed={cfg.emociones} onClick={() => ajustar({ emociones: !cfg.emociones })}>
                  <i className={`fa-solid ${cfg.emociones ? "fa-toggle-on" : "fa-toggle-off"}`} aria-hidden />
                  <span>Lectura de pausas y reacciones</span>
                </button>
              </Bloque>

              <Bloque titulo="Con qué se entrenó" icono="fa-bullseye">
                {(Object.keys(OBJETIVOS) as Objetivo[]).map((o) => (
                  <button key={o} type="button" className="ad-toggle" data-radio="true" aria-pressed={cfg.objetivo === o} onClick={() => ajustar({ objetivo: o })}>
                    <i className={`fa-solid ${OBJETIVOS[o].icono}`} aria-hidden />
                    <span>
                      <strong>{OBJETIVOS[o].etiqueta}</strong>
                      <em>{OBJETIVOS[o].explica}</em>
                    </span>
                  </button>
                ))}
              </Bloque>

              <Bloque titulo="Lo que se ve en la pantalla de Dani (simulación)" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Tiempo en la plataforma" value={`${med.tiempo}`} col={med.tiempo >= 75 ? AVISO : undefined} />
                  <Dato label="Burbuja de filtro" value={`${med.burbuja}`} col={med.burbuja >= 65 ? NO : med.burbuja <= 45 ? OK : undefined} />
                  <Dato label="Engañosos en pantalla" value={`${med.enganosos}/${PANTALLA}`} col={med.enganosos > 0 ? NO : OK} />
                  <Dato label="Temas distintos" value={`${med.temas}`} />
                </div>
              </Bloque>

              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Entiendes cómo el algoritmo decide por ti!" : "Termina los modos de clasificar para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
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
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Los algoritmos <strong style={{ color: T.text }}>no son neutrales</strong>: cada plataforma decide qué ves con un objetivo específico.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  El objetivo suele ser <strong style={{ color: T.text }}>maximizar tu tiempo</strong> en la plataforma; por eso promueven contenido emocional que puede amplificar la <strong style={{ color: T.text }}>desinformación</strong>.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  El algoritmo mide lo que haces, aprende tus preferencias y arma tu feed. Buscar fuentes diversas evita la <strong style={{ color: T.text }}>burbuja de filtro</strong>.
                </p>
              </Bloque>
              <Bloque titulo={`Glosario: ${GLOSARIO.termino}`} icono="fa-book-open">
                <p style={{ margin: 0, color: T.text2 }}>{GLOSARIO.definicion}</p>
                <p style={{ margin: 0, color: T.text3, fontStyle: "italic" }}>{GLOSARIO.ejemplo}</p>
              </Bloque>
              <Bloque titulo="Cómo funciona el simulador" icono="fa-calculator">
                <p style={{ margin: 0, color: T.text2 }}>
                  «Rumbo», Dani y los canales son ficticios y las cifras son una simulación. Cada video recibe un puntaje: el promedio de su emoción, su parecido al historial y su fiabilidad, ponderado por los deslizadores. El objetivo de entrenamiento cambia esos pesos, y la variedad resta puntos a un tema repetido. Los medidores se calculan con los {PANTALLA} primeros videos, los que caben en la pantalla.
                </p>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_ALGORITMOS}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ALGORITMOS_DECIDEN_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador: el feed de Dani, sus tres medidores y el porqué
 * ═══════════════════════════════════════════════════════════════════════════ */
function Medidor({ etiqueta, valor, col, nota, sim }: { etiqueta: string; valor: number; col: string; nota: string; sim?: boolean }) {
  return (
    <div className="ad-med">
      <div className="ad-med-top">
        <span>{etiqueta}{sim ? <em> · simulación</em> : null}</span>
        <strong style={{ color: col }}>{valor}</strong>
      </div>
      <div className="ad-med-barra" role="img" aria-label={`${etiqueta}: ${valor} de 100`}>
        <div style={{ width: `${Math.max(2, valor)}%`, background: col }} />
      </div>
      <span className="ad-med-nota">{nota}</span>
    </div>
  );
}

function TarjetaClip({ p, idx, pantalla }: { p: Posicion; idx: number; pantalla: boolean }) {
  const c = p.clip;
  const tono = TONO_TEMA[c.tema];
  return (
    <article className="ad-clip" data-fuera={!pantalla} data-engano={c.fiab < 50}>
      <div className="ad-img" style={{ background: `linear-gradient(135deg, hsl(${tono} 55% 28%) 0%, hsl(${tono} 45% 14%) 100%)` }}>
        <i className={`fa-solid ${TEMAS[c.tema].icono}`} aria-hidden />
        <img
          src={`${RUTA_IMG}/${c.clave}.webp`}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="ad-pos">{idx + 1}</span>
      </div>
      <div className="ad-clip-cuerpo">
        <h4>{c.titulo}</h4>
        <span className="ad-canal">{c.canal}</span>
        <div className="ad-chips">
          <span>{TEMAS[c.tema].nombre}</span>
          <span data-alto={c.emo >= 75}>{nivelEmo(c.emo)}</span>
          <span data-mal={c.fiab < 50}>{c.fiab < 50 ? "Sin fuente fiable" : "Cita fuentes"}</span>
        </div>
        <span className="ad-puntaje">Puntaje {Math.round(p.puntaje)} · {c.nota}</span>
      </div>
    </article>
  );
}

function SimuladorFeed({
  cfg,
  orden,
  med,
  vere,
  porques,
  accent,
  onPreset,
}: {
  cfg: Config;
  orden: Posicion[];
  med: ReturnType<typeof medir>;
  vere: ReturnType<typeof veredicto>;
  porques: string[];
  accent: string;
  onPreset: (c: Config) => void;
}) {
  const colVere = vere.id === "sano" ? OK : vere.id === "engancha" ? NO : AVISO;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <div className="ad-intro">
        <span><i className="fa-solid fa-user" aria-hidden /> Dani (ficticia) usa «Rumbo» y ve sobre todo deportes y videos que la indignan. Tú diseñas el algoritmo.</span>
      </div>

      <div className="ad-presets" role="group" aria-label="Algoritmos de prueba">
        <span>Prueba un algoritmo:</span>
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className="ad-preset" data-on={JSON.stringify(p.cfg) === JSON.stringify(cfg)} style={{ ["--ada" as string]: accent }} onClick={() => onPreset(p.cfg)}>
            <i className={`fa-solid ${p.icono}`} aria-hidden /> {p.etiqueta}
          </button>
        ))}
      </div>

      <div className="ad-meds">
        <Medidor etiqueta="Tiempo en la plataforma" valor={med.tiempo} col={med.tiempo >= 75 ? AVISO : accent} nota="Lo que le conviene a la plataforma" sim />
        <Medidor etiqueta="Burbuja de filtro" valor={med.burbuja} col={med.burbuja >= 65 ? NO : med.burbuja <= 45 ? OK : AVISO} nota={`${med.temas} ${med.temas === 1 ? "tema" : "temas"} en pantalla`} sim />
        <Medidor etiqueta="Desinformación" valor={med.desinfo} col={med.desinfo > 0 ? NO : OK} nota={`${med.enganosos} de ${PANTALLA} engañosos`} sim />
      </div>

      <div className="ad-vere" style={{ borderColor: `${colVere}88`, background: `${colVere}14` }}>
        <i className={`fa-solid ${vere.id === "sano" ? "fa-seedling" : vere.id === "engancha" ? "fa-fire" : "fa-scale-balanced"}`} style={{ color: colVere }} aria-hidden />
        <strong>{vere.texto}</strong>
      </div>

      <div>
        <div className="ad-sub">Pantalla de Dani: los {PANTALLA} primeros</div>
        <div className="ad-grid">
          {orden.slice(0, PANTALLA).map((p, i) => (
            <TarjetaClip key={p.clip.id} p={p} idx={i} pantalla />
          ))}
        </div>
      </div>

      <div>
        <div className="ad-sub">Más abajo (casi nadie llega)</div>
        <div className="ad-grid">
          {orden.slice(PANTALLA).map((p, i) => (
            <TarjetaClip key={p.clip.id} p={p} idx={i + PANTALLA} pantalla={false} />
          ))}
        </div>
      </div>

      <div className="ad-porque">
        <div className="ad-sub" style={{ marginBottom: 6 }}><i className="fa-solid fa-circle-question" aria-hidden /> Por qué quedó así</div>
        <ul>
          {porques.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes adShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes adPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .ad-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .ad-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .ad-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .ad-chip:active { cursor:grabbing; }
  .ad-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .ad-row[data-shake="true"] { animation:adShake .4s; border-color:${NO}; }
  .ad-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .ad-slot { flex:0 1 200px; min-width:0; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .ad-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .ad-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
  .ad-bin[data-shake="true"] { animation:adShake .4s; border-color:${NO}; }
  .ad-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .ad-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .ad-q:disabled{ cursor:default; }
  .ad-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .ad-btn:hover { border-color:${T.lineStrong}; }
  @media (prefers-reduced-motion: reduce){ .ad-row[data-shake="true"], .ad-bin[data-shake="true"] { animation:none; } .ad-chip, .ad-chip:hover, .ad-chip[data-sel="true"] { transform:none; transition:none; } }

  /* Simulador */
  .ad-intro { padding:11px 14px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; font-size:14.5px; color:${T.text2}; line-height:1.45; }
  .ad-intro i { color:${accent}; margin-right:6px; }
  .ad-presets { display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .ad-preset { cursor:pointer; display:inline-flex; align-items:center; gap:8px; min-height:40px; padding:8px 14px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; }
  .ad-preset:hover { border-color:var(--ada); }
  .ad-preset[data-on="true"] { border-color:var(--ada); background:rgba(${rgba},0.22); }
  .ad-meds { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 190px), 1fr)); gap:10px; }
  .ad-med { display:grid; gap:6px; padding:11px 13px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; min-width:0; }
  .ad-med-top { display:flex; justify-content:space-between; align-items:baseline; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .ad-med-top em { font-style:normal; font-weight:600; color:${T.text3}; }
  .ad-med-top strong { font-size:20px; font-weight:900; font-variant-numeric:tabular-nums; font-family:ui-monospace, monospace; }
  .ad-med-barra { height:9px; border-radius:6px; background:${T.inset}; overflow:hidden; }
  .ad-med-barra > div { height:100%; border-radius:6px; transition:width .35s, background .35s; }
  .ad-med-nota { font-size:14px; color:${T.text3}; line-height:1.35; }
  .ad-vere { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:13px; border:1.5px solid ${T.line}; font-size:15px; line-height:1.4; color:#fff; }
  .ad-vere i { font-size:20px; flex-shrink:0; }
  .ad-sub { font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text3}; margin-bottom:8px; }
  .ad-sub i { color:${accent}; margin-right:6px; }
  .ad-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap:10px; }
  .ad-clip { display:flex; flex-direction:column; border-radius:14px; overflow:hidden; border:1.5px solid ${accent}77; background:${T.glass}; min-width:0; transition:opacity .25s; }
  .ad-clip[data-fuera="true"] { border-color:${T.line}; opacity:.62; }
  .ad-img { position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .ad-img > i { font-size:28px; color:rgba(255,255,255,0.45); }
  .ad-img > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
  .ad-pos { position:absolute; left:8px; top:8px; min-width:26px; height:26px; padding:0 7px; border-radius:13px; background:rgba(2,12,28,.85); color:#fff; font-size:14px; font-weight:900; display:flex; align-items:center; justify-content:center; }
  .ad-clip-cuerpo { display:flex; flex-direction:column; gap:6px; padding:10px 12px 12px; min-width:0; }
  .ad-clip-cuerpo h4 { margin:0; font-size:15px; line-height:1.3; color:#fff; font-weight:800; overflow-wrap:anywhere; }
  .ad-canal { font-size:14px; color:${T.text3}; overflow-wrap:anywhere; }
  .ad-chips { display:flex; flex-wrap:wrap; gap:6px; }
  .ad-chips span { padding:3px 9px; border-radius:99px; border:1px solid ${T.line}; background:${T.inset}; font-size:14px; color:${T.text2}; font-weight:700; }
  .ad-chips span[data-alto="true"] { border-color:#FF8A5B88; color:#FFB08F; }
  .ad-chips span[data-mal="true"] { border-color:${NO}88; color:#FF9B9B; }
  .ad-puntaje { font-size:14px; color:${T.text3}; line-height:1.35; }
  .ad-porque { padding:12px 14px; border-radius:13px; border:1.5px solid rgba(${rgba},0.4); background:rgba(${rgba},0.08); }
  .ad-porque ul { margin:0; padding-left:20px; display:grid; gap:6px; font-size:14.5px; line-height:1.5; color:${T.text2}; }
  .ad-toggle { cursor:pointer; display:flex; align-items:flex-start; gap:12px; width:100%; padding:11px 13px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; text-align:left; line-height:1.35; transition:all .14s; }
  .ad-toggle + .ad-toggle { margin-top:2px; }
  .ad-toggle > i { font-size:20px; margin-top:1px; color:${T.text3}; flex-shrink:0; }
  .ad-toggle[aria-pressed="true"] { border-color:${accent}; background:rgba(${rgba},0.18); }
  .ad-toggle[aria-pressed="true"] > i { color:${accent}; }
  .ad-toggle span { display:flex; flex-direction:column; gap:3px; min-width:0; }
  .ad-toggle em { font-style:normal; font-weight:500; font-size:14px; color:${T.text2}; }
  .ad-preset:focus-visible, .ad-toggle:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  @media (prefers-reduced-motion: reduce){ .ad-med-barra > div, .ad-clip { transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
};

function BinsPlataformas({
  selPlat,
  shakePlat,
  ubicPlat,
  onMatch,
  dropProps,
}: {
  selPlat: string | null;
  shakePlat: Plataforma | null;
  ubicPlat: Record<string, Plataforma>;
  onMatch: (decisionId: string, bin: Plataforma) => void;
  dropProps: DropFactory;
}) {
  const bins: Plataforma[] = ["youtube", "instagram", "tiktok", "google"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = PLATAFORMA_INFO[bin];
        const dentro = DECISIONES.filter((d) => ubicPlat[d.id] === bin);
        return (
          <div
            key={bin}
            className="ad-bin"
            data-shake={shakePlat === bin}
            onClick={() => selPlat && onMatch(selPlat, bin)}
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
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((d) => (
                  <span key={d.id} style={{ animation: "adPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {d.texto}
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

function RowsCausa({
  selCausa,
  shakeCausa,
  empCausa,
  onMatch,
  dropProps,
}: {
  selCausa: string | null;
  shakeCausa: string | null;
  empCausa: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES_CAUSA.map((c) => {
        const done = empCausa[c.id];
        return (
          <div
            key={c.id}
            className="ad-row"
            data-shake={shakeCausa === c.id}
            data-done={done}
            onClick={() => !done && selCausa && onMatch(selCausa, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="ad-slot" data-armed={!done && !!selCausa} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "adPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-arrows-turn-to-dots" />
                  {c.concepto}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> idea
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{c.efecto}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{c.ejemplo}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListaFeed({
  colocados,
  selPaso,
  shakeFeed,
  onPlace,
  dropProps,
}: {
  colocados: string[];
  selPaso: string | null;
  shakeFeed: boolean;
  onPlace: (pasoId: string) => void;
  dropProps: DropFactory;
}) {
  const siguiente = colocados.length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PASOS_FEED.map((p, idx) => {
        const done = colocados.includes(p.id);
        const esActivo = idx === siguiente;
        return (
          <div
            key={p.id}
            className="ad-row"
            data-shake={esActivo && shakeFeed}
            data-done={done}
            onClick={() => esActivo && selPaso && onPlace(selPaso)}
            {...dropProps((id) => esActivo && onPlace(id))}
          >
            <div
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 900,
                color: done ? "#fff" : T.text3,
                border: `1.5px solid ${done ? OK : T.line}`,
                background: done ? `${OK}1a` : T.inset,
              }}
            >
              {idx + 1}
            </div>
            <div className="ad-slot" data-armed={esActivo && !!selPaso} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "adPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-list-ol" />
                  {p.texto}
                </span>
              ) : esActivo ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> suelta el paso {idx + 1}
                </span>
              ) : (
                <span style={{ opacity: 0.6 }}>paso {idx + 1}</span>
              )}
            </div>
            <div style={{ flex: "1 1 160px", minWidth: 0 }}>
              <div style={{ fontSize: 14, color: done ? T.text2 : T.text3, lineHeight: 1.45 }}>{done ? p.detalle : " "}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (A2, opción múltiple verbatim)
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
        <strong style={{ fontSize: 15, color: T.text }}>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </strong>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco preguntas sobre los algoritmos de recomendación y la burbuja de filtro. Elige la opción correcta y pulsa «Comprobar».
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
                    <button key={oi} className="ad-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="ad-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="ad-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14.5, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
