"use client";

/**
 * Laboratorio — Formular hipótesis históricas y clasificar fuentes
 * Práctica experimental para CH-II-P02 (Ciencias Históricas II):
 * «Construye hipótesis para cuestionar las interpretaciones del pasado»
 * (análisis de fuentes del siglo XIX mexicano).
 *
 * El alumno trabaja en un TABLERO DE INVESTIGACIÓN. Parte de una pregunta
 * histórica, elige la hipótesis que quiere poner a prueba y consulta evidencia
 * en el archivo (fuentes primarias y secundarias, con imagen) con un
 * presupuesto limitado de consultas. Cada pieza mueve un medidor a favor o en
 * contra de su hipótesis; las fuentes de otro período no mueven nada y gastan
 * una visita. Al final decide si MANTIENE, REFINA o DESCARTA la hipótesis y la
 * retroalimentación explica por qué esa era (o no) la decisión que pedía la
 * evidencia reunida.
 *
 * Modos: Tablero de investigación (simulador) · «¿Primaria o secundaria?» y
 * «Ordena el método» (repasos de arrastre) · «Escribe el término» (glosario A5)
 * · «Completa el texto». El cuestionario V/F (A4) vive en «Reto» y la teoría
 * verbatim en «Teoría».
 *
 * Los hechos son los de los datos de la práctica; las hipótesis alternativas
 * son planteamientos de estudiante y el medidor es una «simulación».
 * DOM puro (sin three.js), accesible con ratón, teclado y táctil.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { HIPOTESIS_HISTORICAS_HUECOS } from "./hipotesis-historicas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { HIPOTESIS_HISTORICAS_FICHA } from "./hipotesis-historicas-ficha";
import {
  FUENTES,
  TIPO_FUENTE_INFO,
  PASOS,
  PARES,
  QUIZ,
  DATO_HIPOTESIS,
  type TipoFuente,
} from "./hipotesis-historicas-data";
import {
  CASOS,
  DECISIONES,
  UMBRAL_MANTENER,
  efectoDe,
  evaluar,
  retroDecision,
  type Caso,
  type Decision,
  type Evidencia,
} from "./hipotesis-historicas-sim";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-hipotesis-historicas-reto";
const RUTA_FOTOS = "/media/labs-sim/hipotesis-historicas";

type Modo = "tablero" | "fuentes" | "metodo" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "tablero", label: "Tablero de investigación", icono: "fa-magnifying-glass-chart" },
  { id: "fuentes", label: "¿Primaria o secundaria?", icono: "fa-layer-group" },
  { id: "metodo", label: "Ordena el método", icono: "fa-list-ol" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

interface Veredicto {
  hipId: string;
  decision: Decision;
  correcto: boolean;
  lineas: string[];
}

export function LabHipotesisHistoricas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("tablero");

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

  // ── simulador: tablero de investigación ────────────────────────────────
  const [casoId, setCasoId] = useState(CASOS[0]!.id);
  const [hipElegida, setHipElegida] = useState<Record<string, string | undefined>>({});
  const [consultadas, setConsultadas] = useState<Record<string, string[]>>({});
  const [descartadas, setDescartadas] = useState<Record<string, string[]>>({});
  const [resolucion, setResolucion] = useState<Record<string, { hipId: string; decision: Decision } | undefined>>({});
  const [veredicto, setVeredicto] = useState<Record<string, Veredicto | undefined>>({});

  const caso: Caso = CASOS.find((c) => c.id === casoId)!;
  const hipId = hipElegida[caso.id];
  const hip = caso.hipotesis.find((h) => h.id === hipId);
  const usadas = consultadas[caso.id] ?? [];
  const quedan = Math.max(0, caso.presupuesto - usadas.length);
  const descartadasCaso = descartadas[caso.id] ?? [];
  const balance = hipId ? evaluar(caso, hipId, usadas) : null;
  const resCaso = resolucion[caso.id];
  const verCaso = veredicto[caso.id];

  const elegirHipotesis = (id: string) => {
    if (descartadasCaso.includes(id)) return;
    setHipElegida((h) => ({ ...h, [caso.id]: id }));
    setVeredicto((v) => ({ ...v, [caso.id]: undefined }));
    sfxBlip();
  };

  const consultar = (ev: Evidencia) => {
    if (!hipId || usadas.includes(ev.id) || quedan <= 0) return;
    setConsultadas((c) => ({ ...c, [caso.id]: [...(c[caso.id] ?? []), ev.id] }));
    setVeredicto((v) => ({ ...v, [caso.id]: undefined }));
    sfxBlip();
  };

  const decidir = (d: Decision) => {
    if (!hip || !balance) return;
    const correcto = d === balance.esperada;
    const lineas = retroDecision(caso, hip, balance, d);
    setVeredicto((v) => ({ ...v, [caso.id]: { hipId: hip.id, decision: d, correcto, lineas } }));
    if (!correcto) {
      sfxNo();
      return;
    }
    sfxPlace();
    if (d === "descartar") {
      setDescartadas((x) => ({ ...x, [caso.id]: [...(x[caso.id] ?? []), hip.id] }));
      setHipElegida((h) => ({ ...h, [caso.id]: undefined }));
    } else {
      setResolucion((r) => ({ ...r, [caso.id]: { hipId: hip.id, decision: d } }));
      sfxOk();
    }
  };

  const resetTablero = () => {
    setHipElegida({});
    setConsultadas({});
    setDescartadas({});
    setResolucion({});
    setVeredicto({});
    setCasoId(CASOS[0]!.id);
    partida.reiniciar();
  };

  const casosResueltos = CASOS.filter((c) => resolucion[c.id]).length;
  const consultasTotal = Object.values(consultadas).reduce((n, l) => n + l.length, 0);

  // ── modo fuentes (clasifica por tipo de fuente) ────────────────────────
  const [ubicFuente, setUbicFuente] = useState<Record<string, TipoFuente>>({});
  const [selFuente, setSelFuente] = useState<string | null>(null);
  const [shakeFuente, setShakeFuente] = useState<TipoFuente | null>(null);
  const fuentesLibres = FUENTES.filter((f) => !ubicFuente[f.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarFuente = (fuenteId: string, bin: TipoFuente) => {
    if (ubicFuente[fuenteId]) return;
    const f = FUENTES.find((x) => x.id === fuenteId);
    if (f && f.tipo === bin) {
      setUbicFuente((e) => ({ ...e, [fuenteId]: bin }));
      setSelFuente(null);
      sfxPlace();
      if (Object.keys(ubicFuente).length + 1 >= FUENTES.length) {
        sfxOk();
        persistMejor(true, metodoDone, glosarioDone);
      }
    } else {
      setShakeFuente(bin);
      sfxNo();
      window.setTimeout(() => setShakeFuente(null), 420);
    }
  };
  const resetFuentes = () => {
    setUbicFuente({});
    setSelFuente(null);
  };

  // ── modo método (ordena los 4 pasos en su secuencia) ───────────────────
  const [ubicPaso, setUbicPaso] = useState<Record<number, string>>({});
  const [selPaso, setSelPaso] = useState<string | null>(null);
  const [shakePaso, setShakePaso] = useState<number | null>(null);
  const colocadosPaso = new Set(Object.values(ubicPaso));
  const pasosLibres = PASOS.filter((p) => !colocadosPaso.has(p.id)).slice().sort((a, b) => a.paso.localeCompare(b.paso, "es"));

  const intentarPaso = (pasoId: string, orden: number) => {
    if (ubicPaso[orden]) return;
    const p = PASOS.find((x) => x.id === pasoId);
    if (p && p.orden === orden) {
      setUbicPaso((e) => ({ ...e, [orden]: pasoId }));
      setSelPaso(null);
      sfxPlace();
      if (Object.keys(ubicPaso).length + 1 >= PASOS.length) {
        sfxOk();
        persistMejor(fuentesDone, true, glosarioDone);
      }
    } else {
      setShakePaso(orden);
      sfxNo();
      window.setTimeout(() => setShakePaso(null), 420);
    }
  };
  const resetMetodo = () => {
    setUbicPaso({});
    setSelPaso(null);
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
  const fuentesDone = Object.keys(ubicFuente).length >= FUENTES.length;
  const metodoDone = Object.keys(ubicPaso).length >= PASOS.length;
  const modosHechos = (fuentesDone ? 1 : 0) + (metodoDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Resuelve el caso de la Revolución con evidencia: mantén o refina tu hipótesis", done: !!resolucion[CASOS[0]!.id] },
    { txt: "Resuelve el caso del Imperio Mexica contrastando dos fuentes", done: !!resolucion[CASOS[1]!.id] },
    { txt: "Clasifica las 8 fuentes en primaria o secundaria", done: fuentesDone },
    { txt: "Ordena los 4 pasos del método histórico", done: metodoDone },
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
    modo === "tablero" ? resetTablero : modo === "texto" ? resetTexto : modo === "fuentes" ? resetFuentes : modo === "metodo" ? resetMetodo : resetGlosario;

  const lectura =
    modo === "tablero" ? (
      hip && balance ? (
        <>Medidor {balance.score >= 0 ? "+" : ""}{balance.score} · Consultas: {quedan}/{caso.presupuesto}</>
      ) : (
        <>Elige una hipótesis para empezar a investigar</>
      )
    ) : modo === "fuentes" ? (
      <>Fuentes clasificadas: {Object.keys(ubicFuente).length}/{FUENTES.length}</>
    ) : modo === "metodo" ? (
      <>Pasos ordenados: {Object.keys(ubicPaso).length}/{PASOS.length}</>
    ) : modo === "glosario" ? (
      <>Repaso de los términos del método histórico</>
    ) : (
      <>Repaso del método en un párrafo</>
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

          {/* ── MODO — tablero de investigación (simulador) ─────────────── */}
          {modo === "tablero" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
              <div className="hh-casos" role="tablist" aria-label="Casos">
                {CASOS.map((c) => (
                  <button key={c.id} type="button" role="tab" aria-selected={c.id === caso.id} className="hh-caso" data-sel={c.id === caso.id} onClick={() => setCasoId(c.id)}>
                    <i className={`fa-solid ${c.icono}`} aria-hidden />
                    <span>{c.titulo}</span>
                    {resolucion[c.id] && <i className="fa-solid fa-circle-check" style={{ color: OK }} aria-hidden />}
                  </button>
                ))}
              </div>

              <div className="hh-pregunta">
                <Foto clave={caso.imagen} icono={caso.icono} alto={150} />
                <div className="hh-pregunta-txt">
                  <strong>{caso.pregunta}</strong>
                  <span>{caso.contexto}</span>
                </div>
              </div>

              <div>
                {instruccion("1. Elige la hipótesis que vas a poner a prueba")}
                <div className="hh-hips">
                  {caso.hipotesis.map((h) => {
                    const desc = descartadasCaso.includes(h.id);
                    const res = resCaso?.hipId === h.id;
                    return (
                      <button key={h.id} type="button" className="hh-hip" data-sel={hipId === h.id} data-desc={desc} data-res={res} disabled={desc || !!resCaso} onClick={() => elegirHipotesis(h.id)}>
                        <i className={`fa-solid ${desc ? "fa-ban" : res ? "fa-circle-check" : "fa-lightbulb"}`} aria-hidden />
                        <span>{h.texto}</span>
                        {desc && <em>descartada</em>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                {instruccion("2. Reúne evidencia en el archivo", `${quedan}/${caso.presupuesto} consultas`)}
                {!hip && !resCaso && <div className="hh-nota">Primero elige una hipótesis: la evidencia se pesa contra ella.</div>}
                <div className="hh-evids">
                  {caso.evidencias.map((ev) => {
                    const hecha = usadas.includes(ev.id);
                    const efecto = hip ? efectoDe(ev, hip.id) : null;
                    const bloqueada = !hecha && (!hip || quedan <= 0 || !!resCaso);
                    return (
                      <button key={ev.id} type="button" className="hh-ev" data-hecha={hecha} data-fuera={hecha && !!ev.fuera} disabled={bloqueada || hecha} onClick={() => consultar(ev)}>
                        <Foto clave={ev.imagen} icono={ev.icono} alto={92} />
                        <span className="hh-ev-tipo" data-tipo={ev.tipo}>{ev.tipo === "primaria" ? "Fuente primaria" : "Fuente secundaria"}</span>
                        <strong>{ev.titulo}</strong>
                        {hecha ? (
                          <>
                            <span className="hh-ev-lec">{ev.lectura}</span>
                            {efecto && (
                              <span className="hh-ev-efecto" data-signo={efecto.v > 0 ? "mas" : efecto.v < 0 ? "menos" : "cero"}>
                                {efecto.v > 0 ? `+${efecto.v} a favor` : efecto.v < 0 ? `${efecto.v} en contra` : "0 · no aporta"}
                                {": "}
                                {efecto.porque}
                              </span>
                            )}
                          </>
                        ) : (
                          <em>Consultar · 1 visita</em>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hh-balanza" aria-live="polite">
                <span className="hh-bal-top">
                  <span>Respaldo de tu hipótesis (simulación)</span>
                  <strong style={{ color: !balance ? T.text3 : balance.score >= UMBRAL_MANTENER ? OK : balance.score < 0 ? NO : AVISO }}>
                    {balance ? `${balance.score >= 0 ? "+" : ""}${balance.score}` : "—"}
                  </strong>
                </span>
                <div className="hh-bal-barra" role="meter" aria-label="Respaldo de la hipótesis" aria-valuemin={-5} aria-valuemax={5} aria-valuenow={balance?.score ?? 0}>
                  <i className="hh-bal-cero" />
                  <i className="hh-bal-umbral" title={`Umbral para mantenerla: +${UMBRAL_MANTENER}`} />
                  {balance && (
                    <div
                      className="hh-bal-fill"
                      style={{
                        left: balance.score >= 0 ? "50%" : `${50 + Math.max(-5, balance.score) * 10}%`,
                        width: `${Math.min(5, Math.abs(balance.score)) * 10}%`,
                        background: balance.score >= UMBRAL_MANTENER ? OK : balance.score < 0 ? NO : AVISO,
                      }}
                    />
                  )}
                </div>
                <span className="hh-bal-pie">
                  <span>En contra</span>
                  <span>Para mantenerla: +{UMBRAL_MANTENER} y 2 fuentes</span>
                  <span>A favor</span>
                </span>
              </div>

              <div>
                {instruccion("3. Decide qué hacer con tu hipótesis")}
                <div className="hh-decisiones">
                  {DECISIONES.map((d) => (
                    <button key={d.id} type="button" className="hh-dec" data-sel={verCaso?.decision === d.id} disabled={!hip || !!resCaso} onClick={() => decidir(d.id)}>
                      <i className={`fa-solid ${d.icono}`} aria-hidden />
                      <strong>{d.etiqueta}</strong>
                      <span>{d.ayuda}</span>
                    </button>
                  ))}
                </div>
              </div>

              {verCaso && (
                <div className="hh-retro" data-ok={verCaso.correcto}>
                  <strong>
                    <i className={`fa-solid ${verCaso.correcto ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden /> Tu decisión: {DECISIONES.find((d) => d.id === verCaso.decision)!.etiqueta.toLowerCase()}
                  </strong>
                  {verCaso.lineas.map((l, i) => (
                    <span key={i}>{l}</span>
                  ))}
                </div>
              )}
              {resCaso && (
                <div className="hh-retro" data-ok="true">
                  <strong>
                    <i className="fa-solid fa-flag-checkered" aria-hidden /> Caso resuelto
                  </strong>
                  <span>
                    {resCaso.decision === "mantener" ? "Mantienes" : "Refinas"}: «{(() => {
                      const h = caso.hipotesis.find((x) => x.id === resCaso.hipId)!;
                      return resCaso.decision === "mantener" ? h.texto : h.refinada;
                    })()}»
                  </span>
                  {casosResueltos < CASOS.length && (
                    <button
                      type="button"
                      className="hh-btn"
                      onClick={() => {
                        const sig = CASOS.find((c) => !resolucion[c.id]);
                        if (sig) setCasoId(sig.id);
                      }}
                    >
                      <i className="fa-solid fa-arrow-right" aria-hidden /> Siguiente caso
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={HIPOTESIS_HISTORICAS_HUECOS}
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

          {/* MODO — fuentes */}
          {modo === "fuentes" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada fuente a su tipo", `${Object.keys(ubicFuente).length}/${FUENTES.length}`, fuentesDone)}
                {fuentesLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {FUENTES.length} fuentes!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {fuentesLibres.map((f) => (
                      <button key={f.id} className="hh-chip" data-sel={selFuente === f.id} onClick={() => setSelFuente((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        {f.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsFuentes selFuente={selFuente} shakeFuente={shakeFuente} ubicFuente={ubicFuente} onMatch={intentarFuente} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO — método (ordenar pasos) */}
          {modo === "metodo" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada paso a su lugar en la secuencia", `${Object.keys(ubicPaso).length}/${PASOS.length}`, metodoDone)}
                {pasosLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Ordenaste los {PASOS.length} pasos del método!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {pasosLibres.map((p) => (
                      <button key={p.id} className="hh-chip" data-sel={selPaso === p.id} onClick={() => setSelPaso((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-shoe-prints" style={{ fontSize: 14, color: T.text3 }} />
                        {p.paso.replace(/^\d+\.\s*/, "")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsMetodo selPaso={selPaso} shakePaso={shakePaso} ubicPaso={ubicPaso} onMatch={intentarPaso} dropProps={dropProps} />
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
                persistMejor(fuentesDone, metodoDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
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
                  <Dato label="Casos resueltos" value={`${casosResueltos}/${CASOS.length}`} col={casosResueltos >= CASOS.length ? OK : undefined} />
                  <Dato label="Consultas usadas" value={`${consultasTotal}`} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Formulas hipótesis como un historiador!" : "Termina los tres modos de repaso para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              {CASOS.map((c) => {
                const r = resolucion[c.id];
                const usadasC = consultadas[c.id] ?? [];
                return (
                  <Bloque key={c.id} titulo={c.titulo} icono={r ? "fa-circle-check" : "fa-folder-open"}>
                    <p style={{ margin: 0, color: T.text2 }}>{c.pregunta}</p>
                    {usadasC.length === 0 ? (
                      <p style={{ margin: 0, color: T.text3 }}>Sin evidencia todavía. Consúltala en el tablero.</p>
                    ) : (
                      usadasC.map((id) => {
                        const ev = c.evidencias.find((e) => e.id === id)!;
                        return (
                          <p key={id} style={{ margin: 0, color: T.text2 }}>
                            <strong style={{ color: T.text }}>{ev.tipo === "primaria" ? "Primaria" : "Secundaria"}.</strong> {ev.titulo}
                          </p>
                        );
                      })
                    )}
                  </Bloque>
                );
              })}
              <Bloque titulo="Pista del modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "tablero" && <>Una hipótesis es <strong style={{ color: T.text }}>provisional</strong>: se mantiene con varias fuentes que coinciden, se refina si falta evidencia y se descarta si las fuentes la contradicen. Una fuente de otro período no sirve.</>}
                  {modo === "fuentes" && <>La fuente <strong style={{ color: T.text }}>primaria</strong> nace en el período estudiado o de un participante directo; la <strong style={{ color: T.text }}>secundaria</strong> lo interpreta después, basándose en las primarias.</>}
                  {modo === "metodo" && <>Sigue la secuencia: <strong style={{ color: T.text }}>observar</strong> la fuente, <strong style={{ color: T.text }}>contextualizar</strong>, <strong style={{ color: T.text }}>formular</strong> la hipótesis y <strong style={{ color: T.text }}>contrastar</strong> con otras fuentes.</>}
                  {modo === "glosario" && <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>}
                  {modo === "texto" && <>Completa cada hueco con el término del método histórico que corresponde.</>}
                </p>
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
              <Bloque titulo="La conversación con el pasado" icono="fa-comments">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_HIPOTESIS}</p>
              </Bloque>
              <Bloque titulo="Los cuatro pasos del método" icono="fa-list-ol">
                {PASOS.map((p) => (
                  <p key={p.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{p.paso}.</strong> {p.descripcion} <em>{p.ejemplo}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Fuentes primarias y secundarias" icono="fa-layer-group">
                {(Object.keys(TIPO_FUENTE_INFO) as TipoFuente[]).map((t) => (
                  <p key={t} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{TIPO_FUENTE_INFO[t].titulo}.</strong> {TIPO_FUENTE_INFO[t].subtitulo}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-spell-check">
                {PARES.map((p) => (
                  <p key={p.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{p.termino}.</strong> {p.definicion} <em>{p.ejemplo}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={HIPOTESIS_HISTORICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas del tablero de investigación
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Ilustración con ícono de respaldo: se ve bien aunque la imagen aún no exista. */
function Foto({ clave, icono, alto }: { clave: string; icono: string; alto: number }) {
  const [ok, setOk] = useState(true);
  return (
    <span className="hh-foto" style={{ height: alto }}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {ok && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setOk(false)} />}
    </span>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes hhShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes hhPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .hh-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .hh-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .hh-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .hh-chip:active { cursor:grabbing; }
  .hh-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .hh-row[data-shake="true"] { animation:hhShake .4s; border-color:${NO}; }
  .hh-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .hh-slot { flex-shrink:0; min-width:150px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .hh-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .hh-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:220px; }
  .hh-bin[data-shake="true"] { animation:hhShake .4s; border-color:${NO}; }
  .hh-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .hh-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .hh-q:disabled{ cursor:default; }
  .hh-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .hh-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }

  /* Tablero de investigación */
  .hh-casos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:8px; }
  .hh-caso { cursor:pointer; display:flex; align-items:center; gap:9px; padding:10px 12px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:${T.text2}; font-size:14.5px; font-weight:800; text-align:left; line-height:1.25; transition:all .14s; }
  .hh-caso span { flex:1; min-width:0; }
  .hh-caso[data-sel="true"] { border-color:${accent}; color:#fff; background:rgba(${rgba},0.18); box-shadow:0 0 14px -6px ${accent}; }
  .hh-pregunta { display:grid; grid-template-columns:minmax(0, 1fr); gap:10px; }
  @container lsescena (min-width: 560px) { .hh-pregunta { grid-template-columns:minmax(0, 0.8fr) minmax(0, 1.2fr); align-items:center; } }
  .hh-pregunta-txt { display:flex; flex-direction:column; gap:6px; font-size:14.5px; line-height:1.45; color:${T.text2}; }
  .hh-pregunta-txt strong { color:#fff; font-size:17px; line-height:1.3; }
  .hh-foto { position:relative; display:flex; align-items:center; justify-content:center; width:100%; border-radius:12px; overflow:hidden;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(2,12,28,0.9)); border:1px solid ${T.line}; }
  .hh-foto i { font-size:30px; color:rgba(255,255,255,0.55); }
  .hh-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hh-hips { display:grid; gap:8px; margin-top:10px; }
  .hh-hip { cursor:pointer; display:flex; gap:11px; align-items:flex-start; padding:12px 14px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; font-size:14.5px; font-weight:600; text-align:left; line-height:1.45; transition:all .14s; }
  .hh-hip i { margin-top:3px; color:${accent}; }
  .hh-hip span { flex:1; min-width:0; overflow-wrap:anywhere; }
  .hh-hip em { font-style:normal; font-size:14px; color:${NO}; font-weight:800; }
  .hh-hip:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .hh-hip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -6px ${accent}; }
  .hh-hip[data-desc="true"] { opacity:.55; text-decoration:line-through; }
  .hh-hip[data-res="true"] { border-color:${OK}; background:${OK}14; }
  .hh-hip:disabled { cursor:default; }
  .hh-nota { margin-top:8px; font-size:14px; color:${T.text3}; line-height:1.45; }
  .hh-evids { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap:10px; margin-top:10px; }
  .hh-ev { cursor:pointer; display:flex; flex-direction:column; align-items:stretch; gap:8px; padding:10px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; font-size:14px; text-align:left; line-height:1.4; transition:all .14s; }
  .hh-ev strong { font-size:14.5px; font-weight:800; line-height:1.3; overflow-wrap:anywhere; }
  .hh-ev em { font-style:normal; font-size:14px; color:${accent}; font-weight:800; }
  .hh-ev:hover:not(:disabled) { border-color:${accent}; transform:translateY(-2px); }
  .hh-ev:disabled { cursor:default; }
  .hh-ev:disabled:not([data-hecha="true"]) { opacity:.5; }
  .hh-ev[data-hecha="true"] { border-color:${OK}66; background:${OK}10; }
  .hh-ev[data-fuera="true"] { border-color:${AVISO}66; background:${AVISO}10; }
  .hh-ev-tipo { align-self:flex-start; font-size:14px; font-weight:800; padding:2px 9px; border-radius:999px; background:${T.inset}; border:1px solid ${T.lineStrong}; color:${T.text2}; }
  .hh-ev-tipo[data-tipo="primaria"] { color:#7CE3B5; }
  .hh-ev-lec { color:${T.text2}; overflow-wrap:anywhere; }
  .hh-ev-efecto { padding:8px 10px; border-radius:10px; font-size:14px; line-height:1.4; overflow-wrap:anywhere; background:${T.inset}; color:${T.text2}; }
  .hh-ev-efecto[data-signo="mas"] { border-left:4px solid ${OK}; }
  .hh-ev-efecto[data-signo="menos"] { border-left:4px solid ${NO}; }
  .hh-ev-efecto[data-signo="cero"] { border-left:4px solid ${AVISO}; }
  .hh-balanza { display:grid; gap:8px; padding:12px 14px; border-radius:13px; border:1px solid ${T.line}; background:rgba(2,12,28,0.5); }
  .hh-bal-top { display:flex; justify-content:space-between; align-items:baseline; gap:10px; font-size:14.5px; color:${T.text2}; font-weight:700; }
  .hh-bal-top strong { font-size:22px; font-weight:900; font-variant-numeric:tabular-nums; font-family:ui-monospace, monospace; }
  .hh-bal-barra { position:relative; height:14px; border-radius:8px; background:rgba(255,255,255,0.12); }
  .hh-bal-fill { position:absolute; top:0; bottom:0; border-radius:8px; transition:left .35s, width .35s, background .35s; }
  .hh-bal-cero { position:absolute; left:50%; top:-3px; width:2px; height:20px; background:rgba(255,255,255,0.7); z-index:1; }
  .hh-bal-umbral { position:absolute; left:80%; top:-3px; width:3px; height:20px; background:${OK}; border-radius:2px; z-index:1; }
  .hh-bal-pie { display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap; font-size:14px; color:${T.text3}; }
  .hh-decisiones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:10px; margin-top:10px; }
  .hh-dec { cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; padding:12px 10px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; text-align:center; line-height:1.3; transition:all .14s; }
  .hh-dec i { font-size:20px; color:${accent}; }
  .hh-dec strong { font-size:15px; }
  .hh-dec span { font-size:14px; color:${T.text2}; }
  .hh-dec:hover:not(:disabled) { border-color:${accent}; transform:translateY(-2px); }
  .hh-dec[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); }
  .hh-dec:disabled { cursor:default; opacity:.55; }
  .hh-retro { display:flex; flex-direction:column; gap:8px; align-items:flex-start; padding:13px 15px; border-radius:13px; font-size:14.5px; line-height:1.5; color:${T.text2};
    border:1.5px solid ${NO}66; background:${NO}10; }
  .hh-retro[data-ok="true"] { border-color:${OK}66; background:${OK}10; }
  .hh-retro strong { color:#fff; font-size:15px; }
  .hh-caso:focus-visible, .hh-hip:focus-visible, .hh-ev:focus-visible, .hh-dec:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }

  /* Identidad del tablero */
  .hh-bin, .hh-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .hh-bin:nth-of-type(6n+1), .hh-row:nth-of-type(6n+1) { --tono:188; }
  .hh-bin:nth-of-type(6n+2), .hh-row:nth-of-type(6n+2) { --tono:262; }
  .hh-bin:nth-of-type(6n+3), .hh-row:nth-of-type(6n+3) { --tono:44; }
  .hh-bin:nth-of-type(6n+4), .hh-row:nth-of-type(6n+4) { --tono:152; }
  .hh-bin:nth-of-type(6n+5), .hh-row:nth-of-type(6n+5) { --tono:330; }
  .hh-bin:nth-of-type(6n+6), .hh-row:nth-of-type(6n+6) { --tono:18; }
  .hh-bin::before, .hh-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .hh-bin[data-done="true"], .hh-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){
    .hh-row[data-shake="true"], .hh-bin[data-shake="true"] { animation:none; }
    .hh-chip, .hh-chip:hover, .hh-chip[data-sel="true"], .hh-ev:hover:not(:disabled), .hh-dec:hover:not(:disabled) { transform:none; transition:none; }
    .hh-bal-fill { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsFuentes({
  selFuente,
  shakeFuente,
  ubicFuente,
  onMatch,
  dropProps,
}: {
  selFuente: string | null;
  shakeFuente: TipoFuente | null;
  ubicFuente: Record<string, TipoFuente>;
  onMatch: (fuenteId: string, bin: TipoFuente) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoFuente[] = ["primaria", "secundaria"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIPO_FUENTE_INFO[bin];
        const dentro = FUENTES.filter((f) => ubicFuente[f.id] === bin);
        return (
          <div
            key={bin}
            className="hh-bin"
            data-shake={shakeFuente === bin}
            onClick={() => selFuente && onMatch(selFuente, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ height: 8 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((f) => (
                  <span key={f.id} style={{ animation: "hhPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {f.texto}
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

function RowsMetodo({
  selPaso,
  shakePaso,
  ubicPaso,
  onMatch,
  dropProps,
}: {
  selPaso: string | null;
  shakePaso: number | null;
  ubicPaso: Record<number, string>;
  onMatch: (pasoId: string, orden: number) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PASOS.map((p) => {
        const colocadoId = ubicPaso[p.orden];
        const done = !!colocadoId;
        const colocado = done ? PASOS.find((x) => x.id === colocadoId) : undefined;
        return (
          <div
            key={p.orden}
            className="hh-row"
            data-shake={shakePaso === p.orden}
            data-done={done}
            onClick={() => !done && selPaso && onMatch(selPaso, p.orden)}
            {...dropProps((id) => onMatch(id, p.orden))}
          >
            <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: done ? "#fff" : T.text3, background: done ? `${OK}22` : T.inset, border: `1.5px solid ${done ? OK : T.line}` }}>
              {p.orden}
            </div>
            <div className="hh-slot" data-armed={!done && !!selPaso} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done && colocado ? (
                <span style={{ animation: "hhPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-shoe-prints" />
                  {colocado.paso.replace(/^\d+\.\s*/, "")}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> paso
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{p.descripcion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{p.ejemplo}</div>
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
        Cinco afirmaciones sobre la formulación de hipótesis históricas y las fuentes primarias y secundarias. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="hh-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="hh-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="hh-btn" onClick={reintentar}>
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
