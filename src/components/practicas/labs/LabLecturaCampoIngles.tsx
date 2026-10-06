"use client";

/**
 * Laboratorio — Lee como experto: comprensión lectora en inglés de textos
 * breves de un campo. Práctica experimental para IN-V-P05 (Inglés V · «Lee y
 * analiza textos breves vinculados con el campo temático o el campo de
 * estudio»).
 *
 * EXPERIMENTO CENTRAL — «Read & decide», el lector-detective con reloj. Cuatro
 * textos breves de campos distintos (un aviso de laboratorio, un aviso de
 * biblioteca, un instructivo de invernadero y un folleto turístico, todos
 * ficticios) y una tarea real que depende de leerlos bien. Cada texto llega
 * tapado y hay 45 s de lectura: leerlo entero costaría más. El alumno elige
 * herramientas que cuestan tiempo —skimming (subtítulos y topic sentences),
 * lupa de scanning (números, conectores o la palabra de la tarea), lectura
 * detallada por oración y pista de contexto para palabras técnicas y falsos
 * cognados— y decide. La decisión tiene consecuencia visible (el guante, la
 * laptop, la planta, el autobús) y se señala la oración que la decidía; sólo
 * cuenta «con evidencia» si esa oración se leyó. Modelo determinista en
 * `lectura-campo-ingles-sim.ts`.
 *
 * Modos:
 *  · «Read & decide»: el simulador.
 *  · «Fact check»: el texto de práctica de A1 (verbatim) se vuelve un boletín
 *    escolar: idea principal, una cifra, dos hechos y una opinión; un
 *    verificador revisa cada línea y la credibilidad baja con cada error.
 *  · «Escribe el término»: las tres estrategias y los cinco verbos Tier 2 de A1.
 *  · «Completa el texto»: el fill_blanks A6, verbatim.
 *  + Reto (A2 + A4 verbatim) en la pestaña «Reto»; la teoría vive en «Teoría».
 *
 * DOM puro (sin three.js). Personas, escuela, empresa y lugares ficticios.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LECTURA_CAMPO_INGLES_FICHA } from "./lectura-campo-ingles-ficha";
import { LECTURA_CAMPO_INGLES_HUECOS } from "./lectura-campo-ingles-huecos";
import {
  LECTURA_A1,
  COMPRENSION_A1,
  ORACIONES_BIO,
  SENALES_A1,
  PARES_ESTRATEGIAS,
  CONSIGNA_A3,
  RETO_QUIZ,
  GLOSARIO_A5,
  ACTIVIDAD_FINAL_A5,
  RELACIONAR_A9,
  AUTOEVALUACION_A7,
  VIDEO_A8,
} from "./lectura-campo-ingles-data";
import {
  CASOS,
  CASO,
  COSTO,
  PRESUPUESTO,
  LENTES,
  PROPOSITOS,
  VEREDICTO_BIO,
  SENALES_BIO,
  IDEAS_PRINCIPALES,
  CIFRAS,
  BOLETIN_VACIO,
  HECHOS_POR_BOLETIN,
  CASTIGO_ERROR,
  estadoInicial,
  tiempoUsado,
  puedePagar,
  costoLeerTodo,
  visibilidad,
  tokensConBrillo,
  hallazgos,
  evaluar,
  textoDe,
  boletinCompleto,
  verificar,
  type Boletin,
  type Caso,
  type CasoId,
  type EstadoCaso,
  type Lente,
  type OpcionDecision,
  type OpcionId,
  type Proposito,
} from "./lectura-campo-ingles-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-lectura-campo-ingles-reto";
const RUTA_FOTOS = "/media/labs-sim/lectura-campo-ingles";

type Modo = "caso" | "hechos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "caso", label: "Read & decide", icono: "fa-magnifying-glass" },
  { id: "hechos", label: "Fact check", icono: "fa-clipboard-check" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

type LenteBio = "skim" | "numeros" | "senales";

const LENTES_BIO: { id: LenteBio; etiqueta: string; icono: string }[] = [
  { id: "skim", etiqueta: "Skim", icono: "fa-forward-fast" },
  { id: "numeros", etiqueta: "Numbers", icono: "fa-hashtag" },
  { id: "senales", etiqueta: "Signal words", icono: "fa-highlighter" },
];

function porCaso<V>(f: () => V): Record<CasoId, V> {
  return Object.fromEntries(CASOS.map((c) => [c.id, f()])) as Record<CasoId, V>;
}

const escapa = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function LabLecturaCampoIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const rgba = color.rgba;
  const [modo, setModo] = useState<Modo>("caso");

  // ── sonido y partida ─────────────────────────────────────────────────
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
  // Todos los aciertos y fallos del laboratorio pasan por aquí: la partida se lleva en un solo lugar.
  const sfxOk = () => {
    if (sonido) audioRef.current?.correcto();
  };
  const sfxNo = () => {
    partida.error();
    if (sonido) audioRef.current?.incorrecto();
  };
  const sfxBien = () => {
    partida.acierto();
    if (sonido) audioRef.current?.blip();
  };
  const sfxBlip = () => {
    if (sonido) audioRef.current?.blip();
  };

  // ── modo 1: Read & decide (simulador) ────────────────────────────────
  const [casoId, setCasoId] = useState<CasoId>("lab");
  const [estados, setEstados] = useState<Record<CasoId, EstadoCaso>>(() => porCaso(estadoInicial));
  const [mejores, setMejores] = useState<Record<CasoId, { correcta: boolean; conEvidencia: boolean } | null>>(() => porCaso(() => null));
  const [palabraAbierta, setPalabraAbierta] = useState<string | null>(null);
  const [palabrasResueltas, setPalabrasResueltas] = useState<string[]>([]);
  const [propositosOk, setPropositosOk] = useState<CasoId[]>([]);
  const [decisiones, setDecisiones] = useState(0);
  const [usoSkim, setUsoSkim] = useState(false);
  const [usoLente, setUsoLente] = useState(false);
  const [aviso, setAviso] = useState<{ txt: string; tono: "ok" | "no" | "info" } | null>(null);

  const caso = CASO[casoId];
  const est = estados[casoId];
  const usado = tiempoUsado(est);
  const restante = PRESUPUESTO - usado;
  const resultado = evaluar(caso, est);
  const casosConEvidencia = CASOS.filter((c) => mejores[c.id]?.correcta && mejores[c.id]?.conEvidencia).length;
  const brillos = hallazgos(caso, est);

  const cambiarEstado = (f: (e: EstadoCaso) => EstadoCaso) => setEstados((s) => ({ ...s, [casoId]: f(s[casoId]) }));

  const elegirCaso = (id: CasoId) => {
    setCasoId(id);
    setPalabraAbierta(null);
    setAviso(null);
  };
  const skim = () => {
    if (est.skim || !puedePagar(est, COSTO.skim)) return;
    cambiarEstado((e) => ({ ...e, skim: true }));
    setUsoSkim(true);
    setAviso({ txt: `Skimming (−${COSTO.skim} s): ya ves los subtítulos y la primera oración de cada párrafo, la topic sentence.`, tono: "info" });
    sfxBlip();
  };
  const usarLente = (l: Lente) => {
    if (est.lentes.includes(l) || !puedePagar(est, COSTO.lente)) return;
    const despues = { ...est, lentes: [...est.lentes, l] };
    const n = hallazgos(caso, despues) - hallazgos(caso, est);
    cambiarEstado(() => despues);
    setUsoLente(true);
    setAviso({ txt: `Lupa (−${COSTO.lente} s): ${n} palabra${n === 1 ? "" : "s"} brilla${n === 1 ? "" : "n"} en el texto. Brillar no es leer: la oración sigue tapada.`, tono: "info" });
    sfxBlip();
  };
  const leer = (oracionId: string) => {
    if (visibilidad(caso, est, oracionId) !== "oculta" || !puedePagar(est, COSTO.leer)) return;
    cambiarEstado((e) => ({ ...e, leidas: [...e.leidas, oracionId] }));
    setAviso({ txt: `Lectura detallada (−${COSTO.leer} s).`, tono: "info" });
    sfxBlip();
  };
  const abrirPalabra = (pid: string) => {
    if (est.abiertas.includes(pid)) {
      setPalabraAbierta(pid);
      return;
    }
    if (!puedePagar(est, COSTO.contexto)) return;
    cambiarEstado((e) => ({ ...e, abiertas: [...e.abiertas, pid] }));
    setPalabraAbierta(pid);
    setAviso({ txt: `Pista de contexto (−${COSTO.contexto} s): se abre la oración donde aparece la palabra.`, tono: "info" });
    sfxBlip();
  };
  const elegirSignificado = (pid: string, idx: number) => {
    const pal = caso.palabras.find((p) => p.id === pid);
    if (!pal || palabrasResueltas.includes(pid) || (est.intentos[pid] ?? []).includes(idx)) return;
    cambiarEstado((e) => ({ ...e, intentos: { ...e.intentos, [pid]: [...(e.intentos[pid] ?? []), idx] } }));
    if (pal.opciones[idx]?.ok) {
      setPalabrasResueltas((r) => [...r, pid]);
      sfxBien();
    } else {
      sfxNo();
    }
  };
  const decidir = (op: OpcionDecision) => {
    if (est.decision) return;
    const despues: EstadoCaso = { ...est, decision: op.id };
    const r = evaluar(caso, despues)!;
    cambiarEstado(() => despues);
    setDecisiones((d) => d + 1);
    setPalabraAbierta(null);
    setAviso(null);
    setMejores((m) => {
      const previo = m[casoId];
      const mejor = previo && previo.correcta && previo.conEvidencia ? previo : { correcta: r.correcta, conEvidencia: r.conEvidencia };
      return { ...m, [casoId]: mejor };
    });
    if (r.correcta) {
      sfxBien();
      if (r.conEvidencia) sfxOk();
    } else {
      sfxNo();
    }
  };
  const elegirProposito = (p: Proposito) => {
    if (!est.decision || est.proposito === caso.proposito) return;
    cambiarEstado((e) => ({ ...e, proposito: p }));
    if (p === caso.proposito) {
      if (!propositosOk.includes(casoId)) setPropositosOk((x) => [...x, casoId]);
      sfxBien();
    } else {
      sfxNo();
    }
  };
  const reintentarCaso = () => {
    cambiarEstado(() => estadoInicial());
    setPalabraAbierta(null);
    setAviso(null);
  };
  const resetCasos = () => {
    setCasoId("lab");
    setEstados(porCaso(estadoInicial));
    setMejores(porCaso(() => null));
    setPalabraAbierta(null);
    setPalabrasResueltas([]);
    setPropositosOk([]);
    setDecisiones(0);
    setAviso(null);
  };

  // ── modo 2: Fact check (texto de práctica de A1) ─────────────────────
  const [lentesBio, setLentesBio] = useState<LenteBio[]>([]);
  const [boletin, setBoletin] = useState<Boletin>(BOLETIN_VACIO);
  const [revisado, setRevisado] = useState(false);
  const [publicaciones, setPublicaciones] = useState(0);
  const [boletinOk, setBoletinOk] = useState(false);
  const revision = verificar(boletin);
  const completo = boletinCompleto(boletin);

  const toggleLenteBio = (l: LenteBio) => {
    setLentesBio((ls) => (ls.includes(l) ? ls.filter((x) => x !== l) : [...ls, l]));
    sfxBlip();
  };
  const editar = (f: (b: Boletin) => Boletin) => {
    setBoletin((b) => f(b));
    setRevisado(false);
    sfxBlip();
  };
  const marcarHecho = (id: string) =>
    editar((b) => {
      if (b.hechos.includes(id)) return { ...b, hechos: b.hechos.filter((h) => h !== id) };
      const hechos = [...b.hechos, id].slice(-HECHOS_POR_BOLETIN);
      return { ...b, hechos, opinion: b.opinion === id ? null : b.opinion };
    });
  const marcarOpinion = (id: string) =>
    editar((b) => ({ ...b, opinion: b.opinion === id ? null : id, hechos: b.hechos.filter((h) => h !== id) }));
  const publicar = () => {
    if (!completo) return;
    setRevisado(true);
    setPublicaciones((n) => n + 1);
    if (revision.publicado) {
      setBoletinOk(true);
      sfxBien();
      sfxOk();
    } else {
      sfxNo();
    }
  };
  const resetHechos = () => {
    setLentesBio([]);
    setBoletin(BOLETIN_VACIO);
    setRevisado(false);
    setPublicaciones(0);
    setBoletinOk(false);
  };

  // ── modo 3: escribe el término ───────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosarioIntento, setGlosarioIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosarioIntento((n) => n + 1);
  };

  // ── modo 4: completa el texto (A6) ───────────────────────────────────
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  // ── reto (A2 + A4) ───────────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ─────────────────────────────────────────────────────────
  const modosHechos = (casosConEvidencia >= CASOS.length ? 1 : 0) + (boletinOk ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  const estrellas = partida.estrellasCon(modosHechos, 4);
  const totalPalabras = CASOS.reduce((n, c) => n + c.palabras.length, 0);

  const objetivos = [
    { txt: "Usa skimming en un texto: subtítulos y primeras oraciones", done: usoSkim, modo: "caso" },
    { txt: "Usa la lupa de scanning para encontrar un dato sin leerlo todo", done: usoLente, modo: "caso" },
    { txt: "Toma una decisión y mira su consecuencia", done: decisiones > 0, modo: "caso" },
    { txt: "Deduce por el contexto 4 palabras difíciles", done: palabrasResueltas.length >= 4, modo: "caso" },
    { txt: "Identifica el propósito del autor en 2 textos", done: propositosOk.length >= 2, modo: "caso" },
    { txt: "Resuelve los 4 casos bien y leyendo la oración clave", done: casosConEvidencia >= CASOS.length, modo: "caso" },
    { txt: "Publica el boletín y lee qué dice el verificador", done: publicaciones > 0, modo: "hechos" },
    { txt: "Publica el boletín con 100 de credibilidad", done: boletinOk, modo: "hechos" },
    { txt: "Escribe en inglés las 3 estrategias y los 5 verbos académicos", done: glosarioDone, modo: "glosario" },
    { txt: "Completa el análisis del texto (A6)", done: textoDone, modo: "texto" },
    { txt: "Aprueba el reto de opción múltiple y verdadero o falso (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "caso" ? resetCasos : modo === "hechos" ? resetHechos : modo === "glosario" ? resetGlosario : resetTexto;

  const lectura =
    modo === "caso" ? (
      resultado ? (
        <>
          {resultado.correcta ? "Good call" : "Wrong call"} · {resultado.conEvidencia ? "with evidence" : "key sentence unread"}
        </>
      ) : (
        <>
          Reading clock: {restante} s left
        </>
      )
    ) : modo === "hechos" ? (
      revisado ? <>Credibility {revision.credibilidad}/100</> : <>Build the newsletter, then publish</>
    ) : modo === "glosario" ? (
      <>Write each strategy or verb in English</>
    ) : (
      <>Fill in the missing words</>
    );

  const palabra = palabraAbierta ? caso.palabras.find((p) => p.id === palabraAbierta) ?? null : null;
  const intentosPalabra = palabra ? est.intentos[palabra.id] ?? [] : [];
  const palabraResuelta = palabra ? palabrasResueltas.includes(palabra.id) : false;
  const ultimoIntento = intentosPalabra.length > 0 ? palabra?.opciones[intentosPalabra[intentosPalabra.length - 1]!] : undefined;

  const marcarBio = (texto: string) => {
    const pats: string[] = [];
    if (lentesBio.includes("senales")) pats.push(...SENALES_BIO.map(escapa));
    if (lentesBio.includes("numeros")) pats.push("\\d+%?");
    if (pats.length === 0) return texto;
    const re = new RegExp(`(${pats.join("|")})`, "g");
    return texto.split(re).map((parte, i) =>
      i % 2 === 1 ? (
        <mark key={i} className={/\d/.test(parte) ? "lc-m-num" : "lc-m-sen"}>
          {parte}
        </mark>
      ) : (
        <span key={i}>{parte}</span>
      )
    );
  };

  return (
    <LabShell
      accent={accent}
      rgba={rgba}
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
        <div className="lc" style={{ ["--lc-a" as string]: accent, ["--lc-r" as string]: rgba }}>
          <style>{CSS}</style>

          {modo === "caso" && (
            <div className="lc-col">
              <p className="lc-intro">
                <i className="fa-solid fa-user-secret" aria-hidden /> Cuatro textos breves, cuatro tareas reales <span>(simulación)</span>. Cada
                texto llega tapado y tienes {PRESUPUESTO} s de lectura: leerlo entero costaría {costoLeerTodo(caso)} s. Elige tus herramientas,
                decide y mira qué pasa.
              </p>

              <div className="lc-casos" role="tablist" aria-label="Textos">
                {CASOS.map((c, i) => {
                  const m = mejores[c.id];
                  const estado = !m ? "pend" : m.correcta && m.conEvidencia ? "ok" : m.correcta ? "suerte" : "mal";
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="tab"
                      aria-selected={c.id === casoId}
                      className="lc-caso"
                      data-on={c.id === casoId}
                      data-estado={estado}
                      onClick={() => elegirCaso(c.id)}
                    >
                      <span className="lc-caso-ico">
                        <i className={`fa-solid ${c.icono}`} aria-hidden />
                      </span>
                      <span className="lc-caso-txt">
                        <strong>Case {i + 1}</strong>
                        <span>{c.campo}</span>
                      </span>
                      <i
                        className={`fa-solid ${estado === "ok" ? "fa-circle-check" : estado === "suerte" ? "fa-dice" : estado === "mal" ? "fa-circle-xmark" : "fa-circle"}`}
                        aria-hidden
                      />
                    </button>
                  );
                })}
              </div>

              {/* La tarea y el reloj */}
              <section className="lc-tarea">
                <div className="lc-foto">
                  <i className={`fa-solid ${caso.icono}`} aria-hidden />
                  <ImgSim key={caso.id} src={`${RUTA_FOTOS}/caso-${caso.id}.webp`} />
                  <span className="lc-tag">{caso.escena}</span>
                </div>
                <div className="lc-tarea-txt">
                  <span className="lc-ceja">Your task · {caso.fuente}</span>
                  <p className="lc-tarea-q">{caso.tarea}</p>
                  <div className="lc-reloj-fila">
                    <Reloj usado={usado} />
                    <div className="lc-reloj-txt">
                      <strong style={{ color: restante <= 8 ? NO : restante <= 20 ? AMBAR : OK }}>{restante} s</strong>
                      <span>de lectura disponibles</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Herramientas */}
              <section className="lc-paso">
                <h3>
                  <span className="lc-num">1</span> Reading tools <small>Cada una cuesta tiempo</small>
                </h3>
                <div className="lc-herr">
                  <button type="button" className="lc-h" data-on={est.skim} disabled={est.skim || !puedePagar(est, COSTO.skim)} onClick={skim}>
                    <i className="fa-solid fa-forward-fast" aria-hidden />
                    <span>
                      <strong>Skim</strong>
                      <em>Subtítulos + topic sentences · {COSTO.skim} s</em>
                    </span>
                  </button>
                  {LENTES.map((l) => {
                    const on = est.lentes.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        className="lc-h"
                        data-on={on}
                        disabled={on || !puedePagar(est, COSTO.lente)}
                        onClick={() => usarLente(l.id)}
                      >
                        <i className={`fa-solid ${l.icono}`} aria-hidden />
                        <span>
                          <strong>
                            Scan: {l.id === "clave" ? `«${caso.claveEtiqueta}»` : l.etiqueta}
                          </strong>
                          <em>
                            {l.ayuda} · {COSTO.lente} s
                          </em>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="lc-nota">
                  <i className="fa-solid fa-hand-pointer" aria-hidden /> Toca una oración tapada para leerla con detalle ({COSTO.leer} s).
                  {brillos > 0 && <> Brillan {brillos} palabras.</>}
                </p>
                {aviso && (
                  <p className="lc-aviso" data-tono={aviso.tono}>
                    {aviso.txt}
                  </p>
                )}
              </section>

              {/* El documento */}
              <section className="lc-doc" aria-label="Texto">
                <h4 className="lc-doc-tit">{caso.titulo}</h4>
                {caso.parrafos.map((p, pi) => (
                  <div key={pi} className="lc-parrafo">
                    {est.skim ? <h5>{p.titulo}</h5> : <span className="lc-sub-oculto" aria-hidden />}
                    <p>
                      {p.oraciones.map((o) => {
                        const vis = visibilidad(caso, est, o.id);
                        const toks = tokensConBrillo(caso, est, o.texto);
                        const clave = resultado && caso.claves.includes(o.id);
                        if (vis === "oculta" && !resultado) {
                          const pagable = puedePagar(est, COSTO.leer);
                          return (
                            <button
                              key={o.id}
                              type="button"
                              className="lc-or-oculta"
                              disabled={!pagable}
                              onClick={() => leer(o.id)}
                              aria-label={`Leer esta oración con detalle (${COSTO.leer} segundos)`}
                            >
                              {toks.map((x, k) =>
                                x.brilla ? (
                                  <mark key={k} className="lc-brillo">
                                    {x.t}
                                  </mark>
                                ) : (
                                  <span key={k} className="lc-bloque" style={{ width: `${Math.max(1.2, x.t.length * 0.52)}em` }} />
                                )
                              )}
                            </button>
                          );
                        }
                        return (
                          <span key={o.id} className="lc-or" data-vis={vis} data-clave={clave || undefined}>
                            {toks.map((x, k) => {
                              const dificil = caso.palabras.some((pw) => pw.oracionId === o.id && pw.palabra.toLowerCase().split(" ").includes(x.t.toLowerCase().replace(/[^\p{L}]/gu, "")));
                              return (
                                <span key={k} className={`${x.brilla ? "lc-brillo-txt" : ""} ${dificil ? "lc-dificil" : ""}`.trim() || undefined}>
                                  {x.t}{" "}
                                </span>
                              );
                            })}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                ))}
              </section>

              {/* Pista de contexto */}
              <section className="lc-paso">
                <h3>
                  <span className="lc-num">2</span> Guess from context <small>Palabras difíciles · {COSTO.contexto} s c/u</small>
                </h3>
                <div className="lc-palabras">
                  {caso.palabras.map((pw) => {
                    const resuelta = palabrasResueltas.includes(pw.id);
                    const abierta = est.abiertas.includes(pw.id);
                    return (
                      <button
                        key={pw.id}
                        type="button"
                        className="lc-palabra"
                        data-on={palabraAbierta === pw.id}
                        data-ok={resuelta}
                        disabled={!abierta && !puedePagar(est, COSTO.contexto)}
                        onClick={() => abrirPalabra(pw.id)}
                      >
                        <strong>{pw.palabra}</strong>
                        <span>{pw.tipo === "falso" ? "¿falso cognado?" : "técnica"}</span>
                      </button>
                    );
                  })}
                </div>
                {palabra && (
                  <div className="lc-tarjeta">
                    <p className="lc-tarjeta-or">
                      «{textoDe(caso, palabra.oracionId)}»
                    </p>
                    <span className="lc-ceja">¿Qué significa «{palabra.palabra}» aquí?</span>
                    <div className="lc-ops">
                      {palabra.opciones.map((op, i) => {
                        const probada = intentosPalabra.includes(i);
                        return (
                          <button
                            key={op.es}
                            type="button"
                            className="lc-op"
                            data-c={probada ? (op.ok ? "ok" : "mal") : undefined}
                            disabled={probada || palabraResuelta}
                            onClick={() => elegirSignificado(palabra.id, i)}
                          >
                            {op.es}
                          </button>
                        );
                      })}
                    </div>
                    {ultimoIntento && (
                      <div className="lc-retro" style={{ ["--rc" as string]: ultimoIntento.ok ? OK : NO }}>
                        <strong>
                          <i className={`fa-solid ${ultimoIntento.ok ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden />{" "}
                          {ultimoIntento.ok ? "Bien deducido" : "Así no se lee aquí"}
                        </strong>
                        <span>{ultimoIntento.porque}</span>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* La decisión y su consecuencia */}
              <section className="lc-paso">
                <h3>
                  <span className="lc-num">3</span> Decide <small>Una sola oportunidad por lectura</small>
                </h3>
                <Escenario caso={caso} opcion={resultado?.opcion ?? null} />
                <div className="lc-ops">
                  {caso.opciones.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      className="lc-op lc-op-dec"
                      data-c={est.decision === op.id ? (op.ok ? "ok" : "mal") : undefined}
                      disabled={est.decision !== null}
                      onClick={() => decidir(op)}
                    >
                      <span className="lc-letra">{op.id.toUpperCase()}</span> {op.texto}
                    </button>
                  ))}
                </div>

                {resultado && (
                  <div className="lc-resultado">
                    <div className="lc-retro" style={{ ["--rc" as string]: resultado.correcta ? OK : NO }}>
                      <strong>
                        <i className={`fa-solid ${resultado.correcta ? "fa-circle-check" : "fa-triangle-exclamation"}`} aria-hidden />{" "}
                        {resultado.opcion.consecuencia}
                      </strong>
                      <span>{resultado.opcion.porque}</span>
                    </div>
                    <div className="lc-decisiva">
                      <span className="lc-ceja">
                        <i className="fa-solid fa-quote-left" aria-hidden /> The sentence{caso.claves.length > 1 ? "s" : ""} that decided it
                      </span>
                      {caso.claves.map((k) => (
                        <p key={k}>«{textoDe(caso, k)}»</p>
                      ))}
                      <p className="lc-evidencia" data-ok={resultado.conEvidencia}>
                        <i className={`fa-solid ${resultado.conEvidencia ? "fa-eye" : "fa-eye-slash"}`} aria-hidden />{" "}
                        {resultado.conEvidencia
                          ? `La leíste antes de decidir. Usaste ${resultado.usado} de ${PRESUPUESTO} s.`
                          : resultado.correcta
                            ? "Acertaste sin leer la oración clave: fue suerte. Vuelve a intentarlo leyéndola."
                            : "No leíste la oración clave antes de decidir."}
                      </p>
                    </div>

                    <div className="lc-proposito">
                      <span className="lc-ceja">Author&apos;s purpose · ¿Para qué se escribió este texto?</span>
                      <div className="lc-ops">
                        {PROPOSITOS.map((p) => {
                          const elegido = est.proposito === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className="lc-op"
                              data-c={elegido ? (p.id === caso.proposito ? "ok" : "mal") : undefined}
                              disabled={est.proposito === caso.proposito}
                              onClick={() => elegirProposito(p.id)}
                            >
                              <i className={`fa-solid ${p.icono}`} aria-hidden /> <strong>{p.en}</strong> · {p.es}
                            </button>
                          );
                        })}
                      </div>
                      {est.proposito && (
                        <p className="lc-nota" style={{ color: est.proposito === caso.proposito ? OK : AMBAR }}>
                          {est.proposito === caso.proposito ? caso.propositoPorque : "Fíjate en el título y en el tipo de texto: ¿avisa de un riesgo, informa, da pasos o quiere convencerte?"}
                        </p>
                      )}
                    </div>

                    <button type="button" className="lc-btn" onClick={reintentarCaso}>
                      <i className="fa-solid fa-rotate-left" aria-hidden /> Read this text again
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}

          {modo === "hechos" && (
            <div className="lc-col">
              <div className="lc-foto lc-foto-ancha">
                <i className="fa-solid fa-newspaper" aria-hidden />
                <ImgSim src={`${RUTA_FOTOS}/boletin.webp`} />
                <span className="lc-tag">School eco-newsletter · fact check</span>
              </div>
              <p className="lc-intro">
                El boletín ecológico de tu escuela <span>(ficticio)</span> publicará un recuadro con el texto de práctica de la lectura A1. Elige
                la idea principal, la cifra clave, {HECHOS_POR_BOLETIN} hechos y 1 opinión. Un verificador revisa cada línea: cada error baja{" "}
                {CASTIGO_ERROR} puntos de credibilidad.
              </p>

              <div className="lc-herr">
                {LENTES_BIO.map((l) => (
                  <button key={l.id} type="button" className="lc-h" data-on={lentesBio.includes(l.id)} aria-pressed={lentesBio.includes(l.id)} onClick={() => toggleLenteBio(l.id)}>
                    <i className={`fa-solid ${l.icono}`} aria-hidden />
                    <span>
                      <strong>{l.etiqueta}</strong>
                      <em>{l.id === "skim" ? "Sólo topic sentences" : l.id === "numeros" ? "Cifras y %" : "argue, according to…"}</em>
                    </span>
                  </button>
                ))}
              </div>

              <section className="lc-doc" aria-label="Texto de práctica de A1">
                <h4 className="lc-doc-tit">Biodiversity in Mexico</h4>
                {[0, 1, 2].map((pi) => (
                  <div key={pi} className="lc-bio-par">
                    {ORACIONES_BIO.filter((o) => o.parrafo === pi).map((o, k) => {
                      const atenuada = lentesBio.includes("skim") && k > 0;
                      const esHecho = boletin.hechos.includes(o.id);
                      const esOpinion = boletin.opinion === o.id;
                      const v = VEREDICTO_BIO[o.id];
                      const sello = revisado && (esHecho || esOpinion) && v ? (esHecho ? v.tipo === "hecho" : v.tipo === "opinion") : null;
                      return (
                        <div key={o.id} className="lc-bio" data-atenuada={atenuada} data-sel={esHecho ? "hecho" : esOpinion ? "opinion" : undefined}>
                          <p>{marcarBio(o.texto)}</p>
                          <div className="lc-bio-bot">
                            <button type="button" className="lc-mini" data-on={esHecho} aria-pressed={esHecho} onClick={() => marcarHecho(o.id)}>
                              <i className="fa-solid fa-check-double" aria-hidden /> Fact
                            </button>
                            <button type="button" className="lc-mini" data-on={esOpinion} aria-pressed={esOpinion} onClick={() => marcarOpinion(o.id)}>
                              <i className="fa-solid fa-comment" aria-hidden /> Opinion
                            </button>
                            {sello !== null && (
                              <span className="lc-sello" data-ok={sello}>
                                <i className={`fa-solid ${sello ? "fa-stamp" : "fa-xmark"}`} aria-hidden /> {sello ? "Verified" : "Correction"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </section>

              <section className="lc-boletin" data-estado={revisado ? (revision.publicado ? "ok" : "mal") : "borrador"}>
                <span className="lc-ceja">
                  <i className="fa-solid fa-newspaper" aria-hidden /> Newsletter draft
                </span>

                <div className="lc-slot">
                  <strong>The main idea of the text is…</strong>
                  <div className="lc-ops">
                    {IDEAS_PRINCIPALES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="lc-op"
                        data-sel={boletin.idea === m.id}
                        data-c={revisado && boletin.idea === m.id ? (m.ok ? "ok" : "mal") : undefined}
                        onClick={() => editar((b) => ({ ...b, idea: m.id }))}
                      >
                        {m.texto}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lc-slot">
                  <strong>Forest cover lost (according to CONABIO):</strong>
                  <div className="lc-chips">
                    {CIFRAS.map((x) => (
                      <button
                        key={x.id}
                        type="button"
                        className="lc-chip"
                        data-sel={boletin.cifra === x.id}
                        data-c={revisado && boletin.cifra === x.id ? (x.ok ? "ok" : "mal") : undefined}
                        onClick={() => editar((b) => ({ ...b, cifra: x.id }))}
                      >
                        {x.texto}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lc-slot">
                  <strong>
                    Facts box ({boletin.hechos.length}/{HECHOS_POR_BOLETIN}) · Opinion box ({boletin.opinion ? 1 : 0}/1)
                  </strong>
                  <ul className="lc-lista">
                    {boletin.hechos.map((h) => (
                      <li key={h}>
                        <i className="fa-solid fa-check-double" aria-hidden /> {ORACIONES_BIO.find((o) => o.id === h)?.texto}
                      </li>
                    ))}
                    {boletin.opinion && (
                      <li>
                        <i className="fa-solid fa-comment" aria-hidden /> {ORACIONES_BIO.find((o) => o.id === boletin.opinion)?.texto}
                      </li>
                    )}
                    {boletin.hechos.length === 0 && !boletin.opinion && <li className="lc-vacio">Marca oraciones del texto con «Fact» u «Opinion».</li>}
                  </ul>
                </div>

                <button type="button" className="lc-publicar" disabled={!completo || revisado} onClick={publicar}>
                  <i className="fa-solid fa-paper-plane" aria-hidden />
                  {revisado ? "Change something to publish again" : completo ? "Publish the newsletter" : "Complete the four parts"}
                </button>

                {revisado && (
                  <div className="lc-verif">
                    <div className="lc-medidor">
                      <span>Credibility</span>
                      <div className="lc-barra">
                        <div style={{ width: `${revision.credibilidad}%`, background: revision.credibilidad >= 100 ? OK : revision.credibilidad >= 60 ? AMBAR : NO }} />
                      </div>
                      <strong>{revision.credibilidad}/100</strong>
                    </div>
                    <p className="lc-gran-sello" data-ok={revision.publicado}>
                      <i className={`fa-solid ${revision.publicado ? "fa-stamp" : "fa-triangle-exclamation"}`} aria-hidden />{" "}
                      {revision.publicado ? "PUBLISHED" : "CORRECTION NEEDED"}
                    </p>
                    {revision.revisiones.map((r, i) => (
                      <div key={i} className="lc-retro" style={{ ["--rc" as string]: r.ok ? OK : NO }}>
                        <strong>
                          <i className={`fa-solid ${r.ok ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden /> {r.campo}
                        </strong>
                        <span>{r.porque}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {modo === "glosario" && (
            <div className="lc-caja">
              <h3 className="lc-caja-tit">
                <i className="fa-solid fa-spell-check" aria-hidden /> Estrategias y verbos académicos · IN-V-P05-A1
              </h3>
              <EscribeTermino
                key={glosarioIntento}
                pares={PARES_ESTRATEGIAS}
                accent={accent}
                rgba={rgba}
                completado={glosarioDone}
                instrucciones="Lee la definición o la traducción y la oración de la lectura A1 con el hueco, y escribe el término en inglés. Se ignoran acentos y mayúsculas."
                onCompletado={() => {
                  setGlosarioDone(true);
                  sfxOk();
                }}
                onAcierto={sfxBien}
                onError={sfxNo}
              />
            </div>
          )}

          {modo === "texto" && (
            <div className="lc-caja">
              <h3 className="lc-caja-tit">
                <i className="fa-solid fa-solar-panel" aria-hidden /> Analyzing a text in English (A6)
              </h3>
              <CompletaTexto
                key={`a6-${textoIntento}`}
                data={LECTURA_CAMPO_INGLES_HUECOS}
                accent={accent}
                rgba={rgba}
                completado={textoDone}
                onCompletado={() => {
                  setTextoDone(true);
                  sfxOk();
                }}
                onAcierto={sfxBien}
                onError={sfxNo}
              />
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
                <MarcadorPartida partida={partida} accent={accent} rgba={rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Casos con evidencia" value={`${casosConEvidencia}/${CASOS.length}`} col={casosConEvidencia >= CASOS.length ? OK : undefined} />
                  <Dato label="Palabras deducidas" value={`${palabrasResueltas.length}/${totalPalabras}`} />
                  <Dato label="Propósitos" value={`${propositosOk.length}/${CASOS.length}`} />
                  <Dato label="Estrellas" value={`${estrellas}/3`} col={estrellas >= 3 ? AMBAR : undefined} />
                </div>
              </Bloque>
              <Bloque titulo="Cómo funciona el reloj" icono="fa-stopwatch">
                <p style={{ margin: 0, color: T.text2 }}>
                  Cada texto tiene <strong style={{ color: T.text }}>{PRESUPUESTO} s</strong> de lectura. Skimming cuesta {COSTO.skim} s, cada lente de
                  la lupa {COSTO.lente} s, leer una oración con detalle {COSTO.leer} s y la pista de contexto {COSTO.contexto} s. Leer todo con detalle
                  no cabe: primero skimming para ubicarte, luego scanning para encontrar el dato y, al final, lectura detallada sólo de la oración
                  que decide.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  Un caso cuenta <strong style={{ color: OK }}>con evidencia</strong> si leíste la oración clave antes de decidir. Acertar sin leerla
                  es <strong style={{ color: AMBAR }}>suerte</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Tus casos" icono="fa-folder-open">
                {CASOS.map((c, i) => {
                  const m = mejores[c.id];
                  return (
                    <p key={c.id} style={{ margin: 0, color: T.text2 }}>
                      <strong style={{ color: T.text }}>
                        Case {i + 1} · {c.campoEs}:
                      </strong>{" "}
                      {!m ? "sin decidir" : m.correcta && m.conEvidencia ? "resuelto con evidencia" : m.correcta ? "acertado por suerte" : "decisión equivocada"}
                    </p>
                  );
                })}
              </Bloque>
              <Bloque titulo="Palabras que deduciste" icono="fa-language">
                {palabrasResueltas.length === 0 ? (
                  <p style={{ margin: 0, color: T.text3 }}>Todavía ninguna. Usa «Guess from context» en un texto.</p>
                ) : (
                  CASOS.flatMap((c) => c.palabras)
                    .filter((pw) => palabrasResueltas.includes(pw.id))
                    .map((pw) => (
                      <p key={pw.id} style={{ margin: 0, color: T.text2 }}>
                        <strong style={{ color: T.text }}>{pw.palabra}</strong> = {pw.opciones.find((o) => o.ok)?.es}
                        {pw.tipo === "falso" && <span style={{ color: AMBAR }}> (falso cognado)</span>}
                      </p>
                    ))
                )}
              </Bloque>
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
              rgba={rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Ya eliges la estrategia según la tarea: skimming para la idea general, scanning para el dato y lectura detallada para entender."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo={`Lectura A1 · ${LECTURA_A1.titulo}`} icono="fa-book-open-reader">
                <div style={{ color: T.text2, whiteSpace: "pre-line", lineHeight: 1.6 }}>{LECTURA_A1.texto}</div>
                <p style={{ margin: 0, color: T.text3 }}>Fuente: {LECTURA_A1.fuente}</p>
              </Bloque>
              <Bloque titulo="Importante" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{LECTURA_A1.callout}</p>
              </Bloque>
              <Bloque titulo="Preguntas de comprensión · A1" icono="fa-circle-question">
                {COMPRENSION_A1.map((c, i) => (
                  <details key={i} className="lc-det">
                    <summary>{c.pregunta}</summary>
                    <p>{c.guia}</p>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="Palabras señal · A1" icono="fa-highlighter">
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Opinión:</strong> {SENALES_A1.opinion.join(", ")}
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Hechos:</strong> {SENALES_A1.hecho.join(", ")}
                </p>
              </Bloque>
              <Bloque titulo="Glosario · A5 (y A9)" icono="fa-spell-check">
                {GLOSARIO_A5.map((g) => (
                  <div key={g.termino} className="lc-glos">
                    <strong>{g.termino}</strong>
                    <span>{g.definicion}</span>
                    <em>{g.ejemplo}</em>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Actividad final:</strong> {ACTIVIDAD_FINAL_A5}
                </p>
                <p style={{ margin: 0, color: T.text3 }}>A9 · {RELACIONAR_A9.instrucciones}</p>
              </Bloque>
              <Bloque titulo={`La tarea que viene · A3`} icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text }}>{CONSIGNA_A3.titulo}</p>
                <p style={{ margin: 0, color: T.text2, whiteSpace: "pre-line" }}>{CONSIGNA_A3.prompt}</p>
                {CONSIGNA_A3.pistas.map((p) => (
                  <p key={p} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                    {p}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>
                  Criterios: {CONSIGNA_A3.criterios.join(" · ")} · Mínimo {CONSIGNA_A3.longitudMinima} palabras.
                </p>
              </Bloque>
              <Bloque titulo={`Video · A8 · ${VIDEO_A8.titulo}`} icono="fa-circle-play">
                <p style={{ margin: 0, color: T.text2 }}>{VIDEO_A8.descripcion}</p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                  {VIDEO_A8.abierta}
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                  {VIDEO_A8.multiple.pregunta}{" "}
                  <strong style={{ color: OK }}>{VIDEO_A8.multiple.opciones[VIDEO_A8.multiple.correcta]}</strong>
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  {VIDEO_A8.verdaderoFalso.enunciado} <strong style={{ color: OK }}>{VIDEO_A8.verdaderoFalso.respuesta ? "Verdadero" : "Falso"}</strong>
                </p>
              </Bloque>
              <Bloque titulo="Autoevaluación · A7" icono="fa-list-check">
                <p style={{ margin: 0, color: T.text3 }}>
                  {AUTOEVALUACION_A7.instrucciones} Escala: {AUTOEVALUACION_A7.escala.join(" · ")}.
                </p>
                {AUTOEVALUACION_A7.criterios.map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-regular fa-square-check" style={{ color: accent, marginRight: 8 }} aria-hidden />
                    {c}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>{AUTOEVALUACION_A7.reflexion}</p>
              </Bloque>
              <Bloque titulo="Qué es verbatim" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text3 }}>
                  <strong style={{ color: T.text2 }}>Verbatim de IN-V-P05:</strong> la lectura A1 con su texto de práctica, sus preguntas y su nota;
                  el reto de opción múltiple (A2) y verdadero o falso (A4); la consigna de A3; el glosario (A5, que A9 reconstruye); el texto con
                  huecos (A6); la autoevaluación (A7) y las preguntas del video (A8). <strong style={{ color: T.text2 }}>Escrito para este
                  laboratorio:</strong> los cuatro textos de los casos, sus tareas y sus consecuencias, el boletín y el verificador. Escuela, empresa,
                  personas y lugares son <strong style={{ color: T.text2 }}>ficticios</strong> y los segundos son una simulación. Inglés
                  estadounidense estándar.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={LECTURA_CAMPO_INGLES_FICHA} accent={accent} rgba={rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Reloj de lectura: el anillo se vacía con cada herramienta.
 * ═══════════════════════════════════════════════════════════════════════════ */
function Reloj({ usado }: { usado: number }) {
  const r = 26;
  const L = 2 * Math.PI * r;
  const frac = Math.min(1, usado / PRESUPUESTO);
  const col = PRESUPUESTO - usado <= 8 ? NO : PRESUPUESTO - usado <= 20 ? AMBAR : OK;
  return (
    <svg className="lc-reloj" viewBox="0 0 64 64" role="img" aria-label={`Quedan ${PRESUPUESTO - usado} segundos de lectura`}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke={col}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={L}
        strokeDashoffset={L * frac}
        transform="rotate(-90 32 32)"
        style={{ transition: "stroke-dashoffset .45s ease, stroke .3s" }}
      />
      <line x1="32" y1="32" x2="32" y2="16" stroke="#fff" strokeWidth="3" strokeLinecap="round" transform={`rotate(${frac * 360} 32 32)`} />
      <circle cx="32" cy="32" r="3" fill="#fff" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Escenario de la consecuencia: lo que pasa por haber leído (o no) bien.
 * Antes de decidir se ve el estado neutro; después, el resultado de la opción.
 * ═══════════════════════════════════════════════════════════════════════════ */
function Escenario({ caso, opcion }: { caso: Caso; opcion: OpcionDecision | null }) {
  const id: OpcionId | null = opcion?.id ?? null;
  const ok = opcion?.ok ?? null;
  const pie =
    opcion === null ? "¿Qué pasará? Depende de lo que leas." : ok ? "Leíste bien: así sale." : "Así sale cuando se lee mal.";
  return (
    <figure className="lc-esc" data-ok={ok === null ? undefined : ok}>
      <svg viewBox="0 0 320 150" role="img" aria-label={opcion ? opcion.consecuencia : "Escena antes de decidir"}>
        <rect x="0" y="0" width="320" height="150" fill="rgba(255,255,255,0.02)" />
        {caso.id === "lab" && <EscLab id={id} ok={ok} />}
        {caso.id === "biblioteca" && <EscBiblio id={id} ok={ok} />}
        {caso.id === "invernadero" && <EscPlanta id={id} ok={ok} />}
        {caso.id === "autobus" && <EscBus id={id} ok={ok} />}
      </svg>
      <figcaption>{pie}</figcaption>
    </figure>
  );
}

function Marca({ ok }: { ok: boolean | null }) {
  if (ok === null) return null;
  return ok ? (
    <g className="lc-pop">
      <circle cx="290" cy="30" r="18" fill={OK} />
      <path d="M281 30 l6 7 l12 -14" fill="none" stroke="#04121f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ) : (
    <g className="lc-pop">
      <path d="M290 10 L310 46 L270 46 Z" fill={NO} />
      <rect x="288" y="22" width="4" height="13" rx="2" fill="#fff" />
      <circle cx="290" cy="40" r="2.4" fill="#fff" />
    </g>
  );
}

function EscLab({ id, ok }: { id: OpcionId | null; ok: boolean | null }) {
  const guante = id === "a" ? "#4FA3FF" : id === "b" ? "#34D399" : id === "c" ? "#E2B48C" : "#6B8197";
  return (
    <g>
      <rect x="0" y="128" width="320" height="22" fill="#1d3347" />
      {/* vaso de precipitados con ácido */}
      <path d="M190 62 h56 v6 h-4 v52 a6 6 0 0 1 -6 6 h-36 a6 6 0 0 1 -6 -6 v-52 h-4 z" fill="rgba(255,255,255,0.08)" stroke="#9fc3dd" strokeWidth="2" />
      <rect x="198" y="94" width="40" height="30" rx="4" fill="#F5D76E" opacity="0.75" />
      {/* mano / guante */}
      <g>
        <rect x="70" y="70" width="64" height="56" rx="16" fill={guante} />
        {[70, 86, 102, 118].map((x, i) => (
          <rect key={x} x={x} y={i === 0 || i === 3 ? 40 : 30} width="14" height="48" rx="7" fill={guante} />
        ))}
        <rect x="128" y="82" width="14" height="38" rx="7" fill={guante} transform="rotate(-35 135 100)" />
      </g>
      {/* salpicadura */}
      {ok === false && (
        <g className="lc-gotas">
          <circle cx="100" cy="88" r="6" fill="#F5D76E" stroke={NO} strokeWidth="2" />
          <circle cx="117" cy="104" r="4.5" fill="#F5D76E" stroke={NO} strokeWidth="2" />
          <circle cx="86" cy="108" r="3.5" fill="#F5D76E" stroke={NO} strokeWidth="2" />
          <path d="M160 70 q12 -10 22 0" fill="none" stroke="#F5D76E" strokeWidth="3" strokeDasharray="4 4" />
        </g>
      )}
      {ok === true && <path d="M150 96 h30" stroke={OK} strokeWidth="3" strokeDasharray="5 5" />}
      <Marca ok={ok} />
    </g>
  );
}

function EscBiblio({ id, ok }: { id: OpcionId | null; ok: boolean | null }) {
  const pantalla = ok === true ? "#5BC8FF" : id === "b" ? "#1a2633" : "#2a3b4d";
  return (
    <g>
      <rect x="0" y="118" width="320" height="32" fill="#3a2a1e" />
      {id !== "c" ? (
        <g>
          <rect x="112" y="46" width="96" height="62" rx="5" fill={pantalla} stroke="#9fc3dd" strokeWidth="2" className={ok ? "lc-brilla-svg" : undefined} />
          <rect x="100" y="108" width="120" height="9" rx="3" fill="#9fc3dd" />
          {ok === true && (
            <g>
              <rect x="124" y="58" width="50" height="6" rx="3" fill="#04121f" opacity="0.6" />
              <rect x="124" y="70" width="70" height="6" rx="3" fill="#04121f" opacity="0.6" />
              <rect x="124" y="82" width="38" height="6" rx="3" fill="#04121f" opacity="0.6" />
              <rect x="232" y="94" width="34" height="22" rx="3" fill="#FFC75A" />
              <circle cx="242" cy="104" r="5" fill="#04121f" opacity="0.5" />
            </g>
          )}
          {id === "b" && (
            <g stroke={NO} strokeWidth="6" strokeLinecap="round">
              <line x1="140" y1="60" x2="180" y2="96" />
              <line x1="180" y1="60" x2="140" y2="96" />
            </g>
          )}
        </g>
      ) : (
        <g>
          {[
            ["#C0504D", 0],
            ["#4F81BD", 1],
            ["#9BBB59", 2],
            ["#8064A2", 3],
          ].map(([c, i]) => (
            <rect key={String(i)} x={110 + Number(i) * 4} y={98 - Number(i) * 18} width="90" height="16" rx="2" fill={String(c)} />
          ))}
          <path d="M225 60 h40 l14 16 l-14 16 h-40 z" fill={AMBAR} />
          <circle cx="234" cy="76" r="4" fill="#04121f" />
          <rect x="244" y="70" width="22" height="12" rx="2" fill="#04121f" opacity="0.5" />
        </g>
      )}
      <Marca ok={ok} />
    </g>
  );
}

function EscPlanta({ id, ok }: { id: OpcionId | null; ok: boolean | null }) {
  const alto = id === null ? 38 : ok ? 88 : id === "a" ? 26 : 40;
  const hoja = id === null ? "#5FBF6A" : ok ? "#34D399" : id === "a" ? "#9A6B3F" : "#C9B54A";
  const caida = ok === false ? 28 : 0;
  const base = 112;
  const hojas = ok ? [0.35, 0.55, 0.75, 0.95] : [0.6, 0.95];
  return (
    <g>
      <rect x="0" y="140" width="320" height="10" fill="#2c2117" />
      <path d="M128 148 L192 148 L202 108 L118 108 Z" fill="#B5653A" />
      <ellipse cx="160" cy="110" rx="40" ry="6" fill="#4a3424" />
      <line x1="160" y1={base} x2="160" y2={base - alto} stroke={ok === false ? "#8C7A4A" : "#3FA34D"} strokeWidth="5" strokeLinecap="round" className="lc-tallo" />
      {hojas.map((f, i) => {
        const y = base - alto * f;
        const lado = i % 2 === 0 ? -1 : 1;
        return (
          <ellipse
            key={i}
            cx={160 + lado * 16}
            cy={y + caida * 0.3}
            rx="16"
            ry="7"
            fill={hoja}
            transform={`rotate(${lado * (ok === false ? 50 : -20)} ${160 + lado * 16} ${y + caida * 0.3})`}
          />
        );
      })}
      {ok === true && <circle cx="160" cy={base - alto - 6} r="6" fill="#FF6B5A" />}
      {id === "a" && (
        <g fill="#9A6B3F">
          <circle cx="128" cy="132" r="3" />
          <circle cx="196" cy="134" r="3" />
        </g>
      )}
      <Marca ok={ok} />
    </g>
  );
}

function EscBus({ id, ok }: { id: OpcionId | null; ok: boolean | null }) {
  const lejos = ok === false;
  const hora = id === "a" ? "7:55" : id === "b" ? "8:25" : id === "c" ? "8:40" : "?";
  return (
    <g>
      <rect x="0" y="112" width="320" height="26" fill="#2b3440" />
      <line x1="0" y1="125" x2="320" y2="125" stroke="#FFC75A" strokeWidth="2" strokeDasharray="12 10" />
      {/* parada */}
      <rect x="30" y="58" width="5" height="56" fill="#9fc3dd" />
      <rect x="18" y="50" width="30" height="14" rx="3" fill="#9fc3dd" />
      {/* reloj de llegada */}
      <g>
        <circle cx="38" cy="26" r="22" fill="#0b2233" stroke="#9fc3dd" strokeWidth="2" />
        <text x="38" y="31" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">
          {hora}
        </text>
      </g>
      {/* persona: se queda en la parada si el autobús se fue */}
      {!ok && (
        <g>
          <circle cx="60" cy="74" r="7" fill="#E2B48C" />
          <rect x="53" y="82" width="14" height="28" rx="5" fill={lejos ? NO : "#8FA7BF"} />
        </g>
      )}
      {/* autobús */}
      <g className={ok ? "lc-arranca" : undefined} transform={lejos ? "translate(232 74) scale(0.6)" : "translate(80 62)"}>
        <rect x="0" y="0" width="120" height="48" rx="9" fill="#FFC75A" />
        {[10, 34, 58, 82].map((x) => (
          <rect key={x} x={x} y="8" width="18" height="16" rx="3" fill="#0b2233" />
        ))}
        <rect x="104" y="8" width="10" height="24" rx="2" fill="#0b2233" />
        <circle cx="24" cy="50" r="8" fill="#111" />
        <circle cx="96" cy="50" r="8" fill="#111" />
        {ok && <circle cx="43" cy="14" r="5" fill="#E2B48C" />}
      </g>
      {lejos && (
        <g fill="rgba(255,255,255,0.25)">
          <circle cx="222" cy="104" r="5" />
          <circle cx="210" cy="108" r="4" />
          <circle cx="200" cy="110" r="3" />
        </g>
      )}
      <Marca ok={ok} />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Imagen con respaldo: si el archivo aún no existe se oculta y queda el
 * degradado con el ícono que va detrás.
 * ═══════════════════════════════════════════════════════════════════════════ */
function ImgSim({ src }: { src: string }) {
  const [rota, setRota] = useState(false);
  if (rota) return null;
  return <img src={src} alt="" loading="lazy" onError={() => setRota(true)} />;
}

const CSS = `
.lc { display:flex; flex-direction:column; gap:14px; min-width:0; color:${T.text}; font-size:15px; }
.lc-col { display:flex; flex-direction:column; gap:14px; min-width:0; }
.lc-intro { margin:0; color:${T.text2}; font-size:15px; line-height:1.5; }
.lc-intro i { color:var(--lc-a); margin-right:6px; }
.lc-intro span { color:${T.text3}; }
.lc-ceja { font-size:14px; font-weight:900; letter-spacing:.05em; text-transform:uppercase; color:var(--lc-a); display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

.lc-casos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
.lc-caso { cursor:pointer; display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:10px; align-items:center; padding:10px 12px;
  border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; text-align:left; transition:all .15s; }
.lc-caso:hover { border-color:${T.lineStrong}; }
.lc-caso[data-on="true"] { border-color:var(--lc-a); background:rgba(var(--lc-r),0.14); }
.lc-caso-ico { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(var(--lc-r),0.25); font-size:16px; }
.lc-caso-txt { display:flex; flex-direction:column; min-width:0; }
.lc-caso-txt strong { font-size:15px; }
.lc-caso-txt span { font-size:14px; color:${T.text3}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.lc-caso > i { font-size:17px; color:${T.text3}; }
.lc-caso[data-estado="ok"] > i { color:${OK}; }
.lc-caso[data-estado="suerte"] > i { color:${AMBAR}; }
.lc-caso[data-estado="mal"] > i { color:${NO}; }

.lc-tarea { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap:12px; align-items:stretch; }
.lc-foto { position:relative; min-height:150px; border-radius:16px; overflow:hidden; border:1.5px solid ${T.line}; display:flex; align-items:center;
  justify-content:center; background:radial-gradient(90% 90% at 30% 20%, rgba(var(--lc-r),0.35) 0%, transparent 60%), linear-gradient(135deg, #11283d 0%, #08131f 100%); }
.lc-foto-ancha { aspect-ratio:16/6; }
.lc-foto > i { font-size:54px; color:rgba(255,255,255,0.16); }
.lc-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.lc-tag { position:absolute; left:10px; bottom:10px; padding:5px 11px; border-radius:999px; background:rgba(2,12,28,.82); color:${T.text2};
  font-size:14px; font-weight:700; max-width:calc(100% - 20px); }
.lc-tarea-txt { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1.5px solid rgba(var(--lc-r),0.5);
  background:rgba(var(--lc-r),0.08); }
.lc-tarea-q { margin:0; font-size:18px; font-weight:800; line-height:1.4; color:#fff; }
.lc-reloj-fila { display:flex; align-items:center; gap:12px; margin-top:auto; }
.lc-reloj { width:64px; height:64px; flex-shrink:0; }
.lc-reloj-txt { display:flex; flex-direction:column; }
.lc-reloj-txt strong { font-size:24px; font-weight:900; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; }
.lc-reloj-txt span { font-size:14px; color:${T.text3}; }

.lc-paso { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
.lc-paso h3 { margin:0; display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:17px; font-weight:900; }
.lc-paso h3 small { font-size:14px; font-weight:600; color:${T.text3}; }
.lc-num { width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:var(--lc-a);
  color:#04121f; font-size:15px; font-weight:900; }

.lc-herr { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:8px; }
.lc-h { cursor:pointer; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; border:1.5px solid ${T.line};
  background:${T.inset}; color:${T.text}; text-align:left; transition:all .15s; min-width:0; }
.lc-h:hover:not(:disabled) { border-color:var(--lc-a); }
.lc-h:disabled { cursor:default; opacity:.55; }
.lc-h[data-on="true"] { opacity:1; border-color:var(--lc-a); background:rgba(var(--lc-r),0.18); }
.lc-h > i { font-size:19px; color:var(--lc-a); width:24px; text-align:center; flex-shrink:0; }
.lc-h span { display:flex; flex-direction:column; min-width:0; }
.lc-h strong { font-size:15px; }
.lc-h em { font-size:14px; font-style:normal; color:${T.text3}; }
.lc-nota { margin:0; font-size:14px; color:${T.text2}; line-height:1.5; }
.lc-nota i { color:var(--lc-a); margin-right:6px; }
.lc-aviso { margin:0; padding:9px 12px; border-radius:11px; font-size:14px; line-height:1.45; color:${T.text2}; border:1px solid rgba(var(--lc-r),0.4);
  background:rgba(var(--lc-r),0.08); animation:lcPop .3s ease; }

.lc-doc { display:flex; flex-direction:column; gap:12px; padding:18px; border-radius:14px; background:#f4efe3; color:#1d2633;
  box-shadow:0 14px 34px -18px rgba(0,0,0,0.8); }
.lc-doc-tit { margin:0; font-size:18px; font-weight:900; color:#0f1b2a; letter-spacing:.01em; }
.lc-parrafo h5 { margin:0 0 6px; font-size:15px; font-weight:900; color:#5a3d12; }
.lc-sub-oculto { display:block; width:38%; height:12px; margin:2px 0 8px; border-radius:6px; background:#d8ceb8; }
.lc-parrafo p { margin:0; font-size:16px; line-height:1.85; }
.lc-or-oculta { cursor:pointer; display:inline; padding:0; margin:0 4px 0 0; border:none; background:none; font:inherit; color:inherit; text-align:left;
  border-radius:6px; }
.lc-or-oculta:hover:not(:disabled) .lc-bloque { background:#bfae8a; }
.lc-or-oculta:focus-visible { outline:2px solid var(--lc-a); }
.lc-or-oculta:disabled { cursor:not-allowed; }
.lc-bloque { display:inline-block; height:.8em; margin:0 .28em 0 0; border-radius:4px; background:#d8ceb8; vertical-align:middle; transition:background .15s; }
.lc-brillo, .lc-brillo-txt { background:#FFE066; color:#1d2633; border-radius:4px; padding:0 3px; font-weight:800; }
.lc-brillo { margin-right:.28em; }
.lc-or { animation:lcPop .3s ease; }
.lc-or[data-vis="skim"] { color:#4a3b1c; font-style:italic; }
.lc-or[data-vis="oculta"] { color:#7a6c50; }
.lc-or[data-clave="true"] { background:rgba(52,211,153,0.28); border-radius:4px; box-shadow:0 0 0 2px rgba(52,211,153,0.5); }
.lc-dificil { text-decoration:underline dotted #b0471d; text-decoration-thickness:2px; text-underline-offset:3px; }

.lc-palabras { display:flex; flex-wrap:wrap; gap:8px; }
.lc-palabra { cursor:pointer; display:flex; flex-direction:column; align-items:flex-start; gap:1px; padding:9px 14px; border-radius:12px;
  border:1.5px dashed ${T.lineStrong}; background:${T.inset}; color:#fff; }
.lc-palabra strong { font-size:16px; }
.lc-palabra span { font-size:14px; color:${T.text3}; }
.lc-palabra[data-on="true"] { border-style:solid; border-color:var(--lc-a); background:rgba(var(--lc-r),0.14); }
.lc-palabra[data-ok="true"] { border-style:solid; border-color:${OK}; }
.lc-palabra:disabled { cursor:not-allowed; opacity:.5; }
.lc-tarjeta { display:flex; flex-direction:column; gap:10px; padding:13px; border-radius:14px; border:1.5px solid rgba(var(--lc-r),0.45); background:rgba(var(--lc-r),0.06); }
.lc-tarjeta-or { margin:0; font-size:16px; line-height:1.55; color:#fff; font-style:italic; }

.lc-ops { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 190px), 1fr)); gap:8px; }
.lc-op { cursor:pointer; text-align:left; padding:10px 13px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft};
  color:#fff; font-size:15px; font-weight:700; line-height:1.4; transition:all .14s; }
.lc-op:hover:not(:disabled) { border-color:var(--lc-a); }
.lc-op:disabled { cursor:default; }
.lc-op i { color:var(--lc-a); }
.lc-op[data-sel="true"] { border-color:var(--lc-a); background:rgba(var(--lc-r),0.2); }
.lc-op[data-c="ok"] { border-color:${OK}; background:${OK}22; }
.lc-op[data-c="mal"] { border-color:${NO}; background:${NO}1c; animation:lcShake .4s; }
.lc-op-dec { display:flex; align-items:center; gap:10px; }
.lc-letra { width:28px; height:28px; border-radius:8px; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center;
  background:rgba(var(--lc-r),0.3); font-weight:900; }

.lc-esc { margin:0; display:flex; flex-direction:column; gap:6px; padding:8px; border-radius:14px; border:1.5px solid ${T.line};
  background:linear-gradient(180deg, #0f2a40 0%, #0a1826 100%); transition:border-color .3s; }
.lc-esc[data-ok="true"] { border-color:${OK}aa; }
.lc-esc[data-ok="false"] { border-color:${NO}aa; }
.lc-esc svg { width:100%; height:auto; max-height:220px; display:block; }
.lc-esc figcaption { font-size:14px; color:${T.text2}; text-align:center; }
.lc-pop { animation:lcPop .4s ease; transform-box:fill-box; transform-origin:center; }
.lc-gotas { animation:lcPop .5s ease; }
.lc-tallo { transition:all .6s ease; }
.lc-arranca { animation:lcArranca 2.4s ease-in .8s forwards; }
.lc-brilla-svg { filter:drop-shadow(0 0 8px #5BC8FF); }

.lc-resultado { display:flex; flex-direction:column; gap:10px; }
.lc-retro { display:flex; flex-direction:column; gap:6px; align-items:flex-start; padding:12px 14px; border-radius:13px; font-size:14.5px;
  line-height:1.5; color:${T.text2}; border:1.5px solid var(--rc); background:${T.glass}; }
.lc-retro strong { color:#fff; font-size:15px; }
.lc-retro strong i { color:var(--rc); }
.lc-decisiva { display:flex; flex-direction:column; gap:6px; padding:12px 14px; border-radius:13px; border:1px solid rgba(52,211,153,0.45); background:rgba(52,211,153,0.07); }
.lc-decisiva p { margin:0; font-size:15px; line-height:1.5; color:#fff; font-style:italic; }
.lc-decisiva .lc-ceja { color:${OK}; }
.lc-decisiva p.lc-evidencia { font-style:normal; font-size:14px; color:${AMBAR}; }
.lc-decisiva p.lc-evidencia[data-ok="true"] { color:${OK}; }
.lc-proposito { display:flex; flex-direction:column; gap:8px; }
.lc-btn { cursor:pointer; align-self:flex-start; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
  border:1.5px solid var(--lc-a); background:rgba(var(--lc-r),0.16); color:#fff; font-size:15px; font-weight:800; }

.lc-bio-par { display:flex; flex-direction:column; gap:8px; }
.lc-bio-par + .lc-bio-par { padding-top:10px; border-top:1px dashed #cdbf9f; }
.lc-bio { display:flex; flex-direction:column; gap:6px; padding:6px 8px; border-radius:10px; transition:opacity .2s, background .2s; }
.lc-bio p { margin:0; font-size:15px; line-height:1.6; }
.lc-bio[data-atenuada="true"] { opacity:.32; }
.lc-bio[data-sel="hecho"] { background:rgba(79,163,255,0.16); }
.lc-bio[data-sel="opinion"] { background:rgba(255,143,171,0.2); }
.lc-bio-bot { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.lc-mini { cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; border:1.5px solid #b9a982;
  background:#fffaf0; color:#33415a; font-size:14px; font-weight:800; }
.lc-mini[data-on="true"] { background:#1d2633; color:#fff; border-color:#1d2633; }
.lc-sello { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:8px; font-size:14px; font-weight:900;
  border:2px solid #0f8a5f; color:#0f8a5f; transform:rotate(-3deg); animation:lcPop .3s ease; }
.lc-sello[data-ok="false"] { border-color:#c0392b; color:#c0392b; }
.lc-m-sen { background:#ffb3c7; color:#1d2633; border-radius:4px; padding:0 2px; font-weight:800; }
.lc-m-num { background:#FFE066; color:#1d2633; border-radius:4px; padding:0 2px; font-weight:800; }

.lc-boletin { display:flex; flex-direction:column; gap:12px; padding:14px; border-radius:16px; border:1.5px solid ${T.lineStrong}; background:${T.glass}; }
.lc-boletin[data-estado="ok"] { border-color:${OK}; }
.lc-boletin[data-estado="mal"] { border-color:${NO}; }
.lc-slot { display:flex; flex-direction:column; gap:8px; }
.lc-slot > strong { font-size:15px; }
.lc-chips { display:flex; flex-wrap:wrap; gap:6px; }
.lc-chip { cursor:pointer; padding:7px 14px; border-radius:999px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px;
  font-weight:800; font-family:ui-monospace, monospace; }
.lc-chip[data-sel="true"] { border-color:var(--lc-a); background:rgba(var(--lc-r),0.22); }
.lc-chip[data-c="ok"] { border-color:${OK}; background:${OK}22; }
.lc-chip[data-c="mal"] { border-color:${NO}; background:${NO}1c; }
.lc-lista { margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:6px; }
.lc-lista li { font-size:14px; line-height:1.5; color:${T.text2}; padding:8px 10px; border-radius:10px; background:${T.inset}; }
.lc-lista li i { color:var(--lc-a); margin-right:6px; }
.lc-lista li.lc-vacio { color:${T.text3}; }
.lc-publicar { cursor:pointer; align-self:flex-start; display:inline-flex; align-items:center; gap:9px; padding:11px 18px; border-radius:12px;
  border:none; background:var(--lc-a); color:#04121f; font-size:15px; font-weight:900; }
.lc-publicar:disabled { cursor:default; background:${T.inset}; color:${T.text3}; border:1px solid ${T.line}; }
.lc-verif { display:flex; flex-direction:column; gap:8px; }
.lc-medidor { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:10px; align-items:center; font-size:14px; font-weight:800; color:${T.text2}; }
.lc-medidor strong { font-size:17px; font-family:ui-monospace, monospace; color:#fff; }
.lc-barra { height:14px; border-radius:8px; background:${T.glassSoft}; border:1px solid ${T.line}; overflow:hidden; }
.lc-barra > div { height:100%; border-radius:8px; transition:width .5s ease; }
.lc-gran-sello { margin:0; align-self:flex-start; padding:6px 14px; border-radius:10px; border:3px solid ${NO}; color:${NO}; font-size:17px;
  font-weight:900; letter-spacing:.08em; transform:rotate(-2deg); animation:lcPop .35s ease; }
.lc-gran-sello[data-ok="true"] { border-color:${OK}; color:${OK}; }

.lc-caja { display:flex; flex-direction:column; gap:12px; padding:16px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
.lc-caja-tit { margin:0; font-size:16px; font-weight:900; display:flex; align-items:center; gap:8px; }
.lc-caja-tit i { color:var(--lc-a); }

.lc-det { border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; padding:10px 13px; }
.lc-det summary { cursor:pointer; font-weight:700; color:${T.text2}; line-height:1.45; }
.lc-det p { margin:9px 0 0; color:${T.text3}; }
.lc-glos { display:flex; flex-direction:column; gap:3px; padding:10px 12px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; }
.lc-glos strong { color:#fff; }
.lc-glos span { color:${T.text2}; }
.lc-glos em { color:${T.text3}; font-style:normal; }

@keyframes lcShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
@keyframes lcPop { 0%{transform:scale(.94);opacity:.4;} 100%{transform:scale(1);opacity:1;} }
@keyframes lcArranca { from { transform:translate(80px, 62px); } to { transform:translate(360px, 62px); } }
@media (max-width: 560px) {
  .lc-doc { padding:14px; }
  .lc-tarea-q { font-size:17px; }
  .lc-foto-ancha { aspect-ratio:16/9; }
}
@media (prefers-reduced-motion: reduce) {
  .lc-op[data-c="mal"], .lc-pop, .lc-gotas, .lc-or, .lc-aviso, .lc-sello, .lc-gran-sello, .lc-arranca { animation:none; }
  .lc-tallo, .lc-barra > div, .lc-bloque { transition:none; }
}
`;
