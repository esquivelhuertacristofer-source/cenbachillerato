"use client";

/**
 * Laboratorio 3D — "La ciencia como práctica humana: revisión, falsabilidad y
 * autocorrección".
 * Práctica experimental anclada a CNEYT-I-P01-A2 (quiz «¿Qué sé sobre cómo
 * funciona la ciencia?») y CNEYT-I-P01-A6 (completa el texto); progresión 1 de
 * la UAC CNEYT-I. El marco teórico es la lectura A1, los hechos salen del quiz
 * A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) Revisión y replicación — dictaminar manuscritos y ver qué pasa cuando
 *      cinco laboratorios independientes intentan replicarlos.
 *  (2) Falsabilidad — predecir si una afirmación puede refutarse y ponerla a
 *      prueba en su banco (metal, agua hirviendo, cisnes, dragón invisible).
 *  (3) La ciencia se corrige — dos casos reales en los que la evidencia
 *      acumulada cambió el consenso.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { NATURALEZA_CIENCIA_FICHA } from "./naturaleza-ciencia-ficha";
import type { VistaNaturaleza } from "./NaturalezaCienciaScene";
import {
  type Modo,
  type Defecto,
  type Dictamen,
  type Prueba,
  type MetalId,
  type LugarId,
  type RegionId,
  type PruebaDragonId,
  type Veredicto,
  MODOS,
  MODOS_DEF,
  DEFECTOS,
  DEFECTO_DEF,
  LABS,
  DICTAMENES,
  MANUSCRITOS,
  dictamenCorrecto,
  replicas,
  veredicto,
  VEREDICTO_DEF,
  AFIRMACIONES,
  METALES,
  T_AMBIENTE,
  T_MAX,
  dilatacionMm,
  LUGARES,
  ebullicion,
  REGIONES,
  PRUEBAS_DRAGON,
  ENUNCIADOS,
  rondaEnunciados,
  estrellasPorErrores,
  mulberry32,
  CASOS,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  NOTA_RECUADRO,
  PREGUNTAS,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
  num,
} from "./naturaleza-ciencia-data";

const NaturalezaScene = dynamic(() => import("./NaturalezaCienciaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-microscope fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la comunidad científica en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-naturaleza-ciencia-reto";
const WARN = "#FF8A3C";
const T_REPLICAR = 2800;
const T_HERVIR = 4200;
const RONDA_INICIAL = rondaEnunciados(mulberry32(11));

/* ── Tarjeta de estrellas: ¿es científica? ────────────────────────────── */
function CientificaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ENUNCIADOS[ronda[pos] ?? 0]!;

  const responder = (falsable: boolean) => {
    if (resuelto !== null) return;
    const ok = falsable === actual.falsable;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${actual.falsable ? "Sí es científica" : "No es científica"}: ${actual.porque}`);
      return;
    }
    setAviso(null);
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaEnunciados(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "16px 16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Es científica?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Enunciado {pos + 1} de {ronda.length} · ¿algún dato posible podría refutarlo?
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="nc-opt nc-cient" data-on="true" onClick={() => responder(true)} style={{ ["--ncc" as string]: OK }}>
              <i className="fa-solid fa-flask" style={{ marginRight: 8 }} />
              Falsable: es científica
            </button>
            <button className="nc-opt nc-cient" data-on="true" onClick={() => responder(false)} style={{ ["--ncc" as string]: WARN }}>
              <i className="fa-solid fa-ban" style={{ marginRight: 8 }} />
              No falsable: no es científica
            </button>
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 14, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 14, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabNaturalezaCiencia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("revision");

  // ── Revisión
  const [msIdx, setMsIdx] = useState(0);
  const [marcados, setMarcados] = useState<Defecto[]>([]);
  const [dictamen, setDictamen] = useState<Dictamen | null>(null);
  const [medidos, setMedidos] = useState<number[] | null>(null);
  const [replicaLista, setReplicaLista] = useState(false);
  const [revisados, setRevisados] = useState<Set<string>>(() => new Set());
  const [revisionPerfecta, setRevisionPerfecta] = useState(false);
  const [vioNoReplicado, setVioNoReplicado] = useState(false);

  // ── Falsabilidad
  const [prueba, setPrueba] = useState<Prueba>("metal");
  const [predicciones, setPredicciones] = useState<Partial<Record<Prueba, boolean>>>({});
  const [metalId, setMetalId] = useState<MetalId>("aluminio");
  const [tempC, setTempC] = useState(T_AMBIENTE);
  const [lugarId, setLugarId] = useState<LugarId>("veracruz");
  const [fuego, setFuego] = useState(false);
  const [hervido, setHervido] = useState(false);
  const [regionId, setRegionId] = useState<RegionId>("europa");
  const [regiones, setRegiones] = useState<Set<RegionId>>(() => new Set(["europa"]));
  const [dragonPrueba, setDragonPrueba] = useState<PruebaDragonId | null>(null);
  const [dragonHechas, setDragonHechas] = useState<Set<PruebaDragonId>>(() => new Set());
  const [refuto, setRefuto] = useState(false);
  const [sobrevivio, setSobrevivio] = useState(false);

  // ── Historia
  const [casoIdx, setCasoIdx] = useState(0);
  const [hito, setHito] = useState(0);
  const [casosTerminados, setCasosTerminados] = useState<Set<string>>(() => new Set());

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setIdentifico(true);
      guardaEstrellas(est);
    },
    [guardaEstrellas],
  );

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    const lista = timers.current;
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      lista.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const despues = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Revisión ──────────────────────────────────────────────────────── */
  const ms = MANUSCRITOS[msIdx]!;
  const correcto = dictamenCorrecto(ms);
  const defectosExactos = marcados.length === ms.defectos.length && ms.defectos.every((d) => marcados.includes(d));
  const falsosPositivos = marcados.filter((d) => !ms.defectos.includes(d));
  const omitidos = ms.defectos.filter((d) => !marcados.includes(d));
  const ver: Veredicto | null = medidos ? veredicto(ms, medidos) : null;

  const marcar = (d: Defecto) => {
    if (dictamen) return;
    setMarcados((xs) => (xs.includes(d) ? xs.filter((x) => x !== d) : [...xs, d]));
    blip();
  };
  const dictaminar = (d: Dictamen) => {
    if (dictamen) return;
    setDictamen(d);
    const ok = d === correcto && defectosExactos;
    sfx(ok);
    if (ok) {
      setRevisionPerfecta(true);
      setRevisados((s) => new Set(s).add(ms.id));
    }
  };
  const enviarReplicar = () => {
    if (!dictamen || medidos) return;
    const valores = replicas(ms);
    setMedidos(valores);
    setReplicaLista(false);
    blip();
    despues(T_REPLICAR, () => {
      setReplicaLista(true);
      if (veredicto(ms, valores) === "noReplicado") setVioNoReplicado(true);
    });
  };
  const otroManuscrito = (idx: number) => {
    setMsIdx(idx);
    setMarcados([]);
    setDictamen(null);
    setMedidos(null);
    setReplicaLista(false);
    blip();
  };
  const reintentar = () => {
    setMarcados([]);
    setDictamen(null);
    setMedidos(null);
    setReplicaLista(false);
  };

  /* ── Falsabilidad ──────────────────────────────────────────────────── */
  const afirmacion = AFIRMACIONES.find((a) => a.id === prueba)!;
  const prediccion = predicciones[prueba];
  const predijo = prediccion !== undefined;
  const prediccionesOk = AFIRMACIONES.every((a) => predicciones[a.id] === a.falsable);
  const metal = METALES.find((m) => m.id === metalId)!;
  const lugar = LUGARES.find((l) => l.id === lugarId)!;
  const tEb = ebullicion(lugar.altitud);

  const predecir = (falsable: boolean) => {
    if (predijo) return;
    setPredicciones((p) => ({ ...p, [prueba]: falsable }));
    sfx(falsable === afirmacion.falsable);
  };
  const elegirPrueba = (p: Prueba) => {
    setPrueba(p);
    blip();
  };
  const calentar = (v: number) => {
    setTempC(v);
    if (v >= 200) setSobrevivio(true);
  };
  const hervir = () => {
    if (fuego) return;
    setFuego(true);
    setHervido(false);
    blip();
    const lugarActual = lugarId;
    despues(T_HERVIR, () => {
      setHervido(true);
      if (lugarActual !== "veracruz") setRefuto(true);
      else setSobrevivio(true);
    });
  };
  const cambiarLugar = (id: LugarId) => {
    setLugarId(id);
    setFuego(false);
    setHervido(false);
    blip();
  };
  const explorar = (id: RegionId) => {
    setRegionId(id);
    setRegiones((s) => new Set(s).add(id));
    if (REGIONES.find((r) => r.id === id)!.negros > 0) {
      setRefuto(true);
      sfx(true);
    } else blip();
  };
  const probarDragon = (id: PruebaDragonId) => {
    setDragonPrueba(id);
    setDragonHechas((s) => new Set(s).add(id));
    blip();
  };

  let veredictoPrueba: { txt: string; col: string } | null = null;
  if (prueba === "metal" && tempC > T_AMBIENTE + 30) veredictoPrueba = { txt: `La barra de ${metal.etq.toLowerCase()} se alargó ${num(dilatacionMm(metal.alfa, tempC), 2)} mm: la afirmación supera esta prueba. No queda demostrada para siempre; sigue en pie mientras ningún metal la contradiga.`, col: OK };
  if (prueba === "hervir" && hervido)
    veredictoPrueba =
      lugarId === "veracruz"
        ? { txt: `Al nivel del mar el agua hirvió a ${num(tEb, 1)} °C: la afirmación sobrevive… por ahora. Prueba en otro lugar.`, col: OK }
        : { txt: `En ${lugar.etq} el agua hirvió a ${num(tEb, 1)} °C, no a 100 °C: un solo dato refuta «siempre». La hipótesis se corrige: a 1 atm hierve a 100 °C; con menos presión, a menos.`, col: WARN };
  if (prueba === "cisnes")
    veredictoPrueba = regiones.has("australia")
      ? { txt: "Un cisne negro en Australia refuta «todos los cisnes son blancos». Miles de cisnes blancos no la demostraban; bastó uno negro para refutarla.", col: WARN }
      : { txt: `Cisnes observados: todos blancos en ${[...regiones].map((r) => REGIONES.find((x) => x.id === r)!.etq).join(" y ")}. Eso no demuestra la afirmación: falta buscar en más lugares.`, col: "#fbbf24" };
  if (prueba === "dragon" && dragonHechas.size > 0)
    veredictoPrueba =
      dragonHechas.size >= 3
        ? { txt: "Cada prueba recibe una excusa nueva. Como ningún resultado podría contradecirla, la afirmación no es falsable: no es científica (aunque tampoco podamos «demostrar» que es falsa).", col: WARN }
        : { txt: `Pruebas intentadas: ${dragonHechas.size}. Intenta otra forma de detectarlo.`, col: "#fbbf24" };
  const dragonListo = dragonHechas.size >= 3;

  /* ── Historia ──────────────────────────────────────────────────────── */
  const caso = CASOS[casoIdx]!;
  const hitoActual = caso.hitos[hito]!;
  const alFinal = hito === caso.hitos.length - 1;
  const avanzar = (d: number) => {
    const n = Math.min(caso.hitos.length - 1, Math.max(0, hito + d));
    setHito(n);
    if (n === caso.hitos.length - 1) setCasosTerminados((s) => new Set(s).add(caso.id));
    blip();
  };
  const elegirCaso = (i: number) => {
    setCasoIdx(i);
    setHito(0);
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "revision") reintentar();
    if (modo === "falsabilidad") {
      setTempC(T_AMBIENTE);
      setFuego(false);
      setHervido(false);
      setDragonPrueba(null);
    }
    if (modo === "historia") setHito(0);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { txt: string; done: boolean }[] = [
    { txt: "Encontrar todos los defectos de un manuscrito y dar el dictamen correcto", done: revisionPerfecta },
    { txt: "Dictaminar bien los cuatro manuscritos", done: revisados.size === MANUSCRITOS.length },
    { txt: "Ver cómo la replicación descubre un estudio que no se sostiene", done: vioNoReplicado },
    { txt: "Predecir si cada una de las cuatro afirmaciones es falsable", done: prediccionesOk },
    { txt: "Ver una afirmación superar una prueba sin quedar demostrada", done: sobrevivio },
    { txt: "Refutar una afirmación con un solo dato", done: refuto },
    { txt: "Intentar tres pruebas con el dragón invisible", done: dragonListo },
    { txt: "Seguir los dos casos históricos hasta el consenso", done: casosTerminados.size === CASOS.length },
    { txt: "Clasificar enunciados y ganar estrellas", done: identifico },
    { txt: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Lectura en vivo (≤ 10 palabras) ───────────────────────────────── */
  const vista: VistaNaturaleza = modo;
  let lecturaVivo: ReactNode;
  if (modo === "revision") {
    lecturaVivo = medidos ? (
      replicaLista && ver ? <>{VEREDICTO_DEF[ver].etq} · 5 laboratorios</> : <>Cinco laboratorios están midiendo…</>
    ) : dictamen ? (
      <>Dictamen: {DICTAMENES.find((d) => d.id === dictamen)!.etq.toLowerCase()}</>
    ) : (
      <>Marca los defectos y da tu dictamen</>
    );
  } else if (modo === "falsabilidad") {
    lecturaVivo = !predijo ? (
      <>Primero predice: ¿algo podría refutarla?</>
    ) : prueba === "metal" ? (
      <>
        {tempC} °C: la barra se alarga {num(dilatacionMm(metal.alfa, tempC), 2)} mm
      </>
    ) : prueba === "hervir" ? (
      hervido ? (
        <>
          En {lugar.etq} hirvió a {num(tEb, 1)} °C
        </>
      ) : (
        <>
          {lugar.etq} · {num(lugar.altitud)} m de altitud
        </>
      )
    ) : prueba === "cisnes" ? (
      <>Explorando {REGIONES.find((r) => r.id === regionId)!.etq}</>
    ) : (
      <>
        Pruebas con el dragón: {dragonHechas.size} de 3
      </>
    );
  } else {
    lecturaVivo = (
      <>
        {hitoActual.anio} · {hitoActual.consenso} % acepta la idea nueva
      </>
    );
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí.</div>
    </div>
  );

  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );

  /* ── Panel «Controles» por modo ────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "revision") {
    control = (
      <>
        <div className="nc-opts">
          {MANUSCRITOS.map((m, i) => (
            <button key={m.id} className="nc-opt nc-ms" data-on={i === msIdx} onClick={() => otroManuscrito(i)} style={{ ["--ncc" as string]: modoCol, background: i === msIdx ? `${modoCol}1f` : "transparent" }}>
              {m.titulo}
              {revisados.has(m.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <Bloque titulo="El manuscrito" icono="fa-file-lines">
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 16, color: "#fff", fontWeight: 900, marginBottom: 6 }}>«{ms.afirmacion}»</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
              {ms.ficha.map((f, i) => (
                <li key={i} style={{ color: T.text2, lineHeight: 1.45 }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </Bloque>
        <Bloque titulo="1 · Marca los defectos (puede no haber ninguno)" icono="fa-magnifying-glass">
          <div className="nc-opts">
            {DEFECTOS.map((d) => {
              const on = marcados.includes(d);
              const bien = ms.defectos.includes(d);
              const col = !dictamen ? (on ? WARN : modoCol) : on ? (bien ? OK : WARN) : bien ? WARN : "rgba(255,255,255,0.14)";
              return (
                <button key={d} className="nc-opt nc-def" data-on={on || (!!dictamen && bien)} onClick={() => marcar(d)} disabled={!!dictamen} style={{ ["--ncc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                  <i className={`fa-solid ${DEFECTO_DEF[d].icono}`} style={{ marginRight: 8 }} />
                  {DEFECTO_DEF[d].etq}
                </button>
              );
            })}
          </div>
        </Bloque>
        <Bloque titulo="2 · Tu dictamen" icono="fa-gavel">
          <div className="nc-opts">
            {DICTAMENES.map((d) => {
              const on = dictamen === d.id;
              const col = on ? (d.id === correcto ? OK : WARN) : dictamen && d.id === correcto ? OK : modoCol;
              return (
                <button key={d.id} className="nc-opt nc-dict" data-on={on || (!!dictamen && d.id === correcto)} onClick={() => dictaminar(d.id)} disabled={!!dictamen} style={{ ["--ncc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                  <i className={`fa-solid ${d.icono}`} style={{ marginRight: 8 }} />
                  {d.etq}
                </button>
              );
            })}
          </div>
          {!dictamen && nota("Criterio del laboratorio: sin defectos se acepta, con uno se piden cambios, con dos o más se rechaza.", T.text3)}
          {dictamen &&
            nota(
              <>
                {dictamen === correcto && defectosExactos ? "Revisión impecable. " : dictamen === correcto ? "Dictamen correcto, pero revisa los defectos. " : `El dictamen que corresponde es «${DICTAMENES.find((d) => d.id === correcto)!.etq}». `}
                {omitidos.length > 0 && `Se te pasó: ${omitidos.map((d) => DEFECTO_DEF[d].etq.toLowerCase()).join(", ")}. `}
                {falsosPositivos.length > 0 && `No era un defecto: ${falsosPositivos.map((d) => DEFECTO_DEF[d].etq.toLowerCase()).join(", ")}. `}
                {ms.defectos.map((d) => DEFECTO_DEF[d].explica).join(" ")}
                {ms.defectos.length === 0 && "El estudio tiene muestra suficiente, grupo de control, financiamiento declarado y datos abiertos."}
              </>,
              dictamen === correcto && defectosExactos ? OK : WARN,
              dictamen === correcto && defectosExactos ? "fa-circle-check" : "fa-rotate-left",
            )}
        </Bloque>
        {dictamen && (
          <Bloque titulo="3 · Replicación independiente" icono="fa-flask-vial">
            <button className="nc-toggle" onClick={enviarReplicar} disabled={!!medidos} style={{ ["--ncc" as string]: accent }}>
              <i className={`fa-solid ${medidos && !replicaLista ? "fa-spinner fa-spin" : "fa-paper-plane"}`} style={{ marginRight: 9, color: accent }} />
              {medidos ? (replicaLista ? "Réplicas terminadas" : "Los laboratorios están midiendo…") : "Enviar el estudio a cinco laboratorios"}
            </button>
            {medidos && replicaLista && ver && (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, ...NUM }}>
                  {medidos.map((v, i) => (
                    <span key={i} style={{ fontSize: 14, fontWeight: 800, padding: "5px 9px", borderRadius: 8, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}`, color: "#fff" }}>
                      {LABS[i]}: {num(v, ms.unidad === "°C" ? 2 : 1)} {ms.unidad}
                    </span>
                  ))}
                </div>
                {nota(
                  <>
                    <strong>{VEREDICTO_DEF[ver].etq}.</strong> El artículo decía {num(ms.efectoReportado, ms.unidad === "°C" ? 1 : 0)} {ms.unidad}; las réplicas promedian {num(medidos.reduce((a, b) => a + b, 0) / medidos.length, ms.unidad === "°C" ? 2 : 1)} {ms.unidad}. {VEREDICTO_DEF[ver].explica}
                  </>,
                  VEREDICTO_DEF[ver].color,
                  "fa-flask-vial",
                )}
                <div className="nc-opts">
                  <button className="nc-opt" data-on="true" onClick={() => otroManuscrito((msIdx + 1) % MANUSCRITOS.length)} style={{ ["--ncc" as string]: modoCol }}>
                    <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
                    Siguiente manuscrito
                  </button>
                  {!(dictamen === correcto && defectosExactos) && (
                    <button className="nc-opt" data-on="false" onClick={reintentar} style={{ ["--ncc" as string]: modoCol }}>
                      <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                      Revisar de nuevo
                    </button>
                  )}
                </div>
              </>
            )}
          </Bloque>
        )}
      </>
    );
  } else if (modo === "falsabilidad") {
    control = (
      <>
        <div className="nc-opts">
          {AFIRMACIONES.map((a) => (
            <button key={a.id} className="nc-opt nc-prueba" data-on={a.id === prueba} onClick={() => elegirPrueba(a.id)} style={{ ["--ncc" as string]: modoCol, background: a.id === prueba ? `${modoCol}1f` : "transparent" }}>
              {a.id === "metal" ? "Metales" : a.id === "hervir" ? "Agua hirviendo" : a.id === "cisnes" ? "Cisnes" : "Dragón invisible"}
              {predicciones[a.id] !== undefined && <i className={`fa-solid ${predicciones[a.id] === a.falsable ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginLeft: 7, color: predicciones[a.id] === a.falsable ? OK : WARN }} />}
            </button>
          ))}
        </div>
        <Bloque titulo="La afirmación" icono="fa-quote-left">
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 900, lineHeight: 1.45 }}>«{afirmacion.texto}»</div>
          <div style={{ color: T.text3 }}>{afirmacion.fuente}</div>
        </Bloque>
        <Bloque titulo="1 · Predice: ¿algún dato podría refutarla?" icono="fa-circle-question">
          <div className="nc-opts">
            {[true, false].map((f) => {
              const on = prediccion === f;
              const col = on ? (f === afirmacion.falsable ? OK : WARN) : modoCol;
              return (
                <button key={String(f)} className="nc-opt nc-pred" data-on={on} onClick={() => predecir(f)} disabled={predijo} style={{ ["--ncc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                  {f ? "Sí: es falsable" : "No: nada podría refutarla"}
                </button>
              );
            })}
          </div>
          {predijo && nota(`${prediccion === afirmacion.falsable ? "Bien predicho. " : `En realidad ${afirmacion.falsable ? "sí es falsable" : "no es falsable"}. `}${afirmacion.prediccion}`, prediccion === afirmacion.falsable ? OK : WARN)}
        </Bloque>

        <Bloque titulo="2 · Ponla a prueba" icono="fa-vial">
          <div style={{ opacity: predijo ? 1 : 0.45, pointerEvents: predijo ? "auto" : "none", display: "grid", gap: 12 }}>
            {prueba === "metal" && (
              <>
                <div className="nc-opts">
                  {METALES.map((m) => (
                    <button key={m.id} className="nc-opt" data-on={m.id === metalId} onClick={() => { setMetalId(m.id); blip(); }} style={{ ["--ncc" as string]: accent, background: m.id === metalId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                      {m.etq} · α = {num(m.alfa * 1e6)}×10⁻⁶ /°C
                    </button>
                  ))}
                </div>
                <Deslizador label="Temperatura de la barra" icon="fa-fire-flame-curved" colr="#fb923c" valor={`${tempC} °C`} min={T_AMBIENTE} max={T_MAX} step={10} value={tempC} onChange={calentar} hintL={`${T_AMBIENTE} °C`} hintR={`${T_MAX} °C`} />
                <div style={{ color: T.text2, ...NUM }}>
                  ΔL = α · L₀ · ΔT = {num(metal.alfa * 1e6)}×10⁻⁶ · 1000 mm · {tempC - T_AMBIENTE} °C = <strong style={{ color: "#fff" }}>{num(dilatacionMm(metal.alfa, tempC), 2)} mm</strong>
                </div>
              </>
            )}
            {prueba === "hervir" && (
              <>
                <div className="nc-opts">
                  {LUGARES.map((l) => (
                    <button key={l.id} className="nc-opt nc-lugar" data-on={l.id === lugarId} onClick={() => cambiarLugar(l.id)} style={{ ["--ncc" as string]: accent, background: l.id === lugarId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                      {l.etq} · {num(l.altitud)} m
                    </button>
                  ))}
                </div>
                <button className="nc-toggle" onClick={hervir} disabled={fuego} style={{ ["--ncc" as string]: "#fb923c" }}>
                  <i className={`fa-solid ${fuego && !hervido ? "fa-spinner fa-spin" : "fa-fire-burner"}`} style={{ marginRight: 9, color: "#fb923c" }} />
                  {fuego ? (hervido ? `Hirvió a ${num(tEb, 1)} °C` : "Calentando el agua…") : "Encender la estufa"}
                </button>
              </>
            )}
            {prueba === "cisnes" && (
              <div className="nc-opts">
                {REGIONES.map((r) => (
                  <button key={r.id} className="nc-opt nc-region" data-on={r.id === regionId} onClick={() => explorar(r.id)} style={{ ["--ncc" as string]: accent, background: r.id === regionId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                    <i className="fa-solid fa-binoculars" style={{ marginRight: 8 }} />
                    Explorar {r.etq}
                    {regiones.has(r.id) && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
                  </button>
                ))}
              </div>
            )}
            {prueba === "dragon" && (
              <div style={{ display: "grid", gap: 7 }}>
                {PRUEBAS_DRAGON.map((p) => (
                  <button key={p.id} className="nc-opt nc-dragon" data-on={p.id === dragonPrueba} onClick={() => probarDragon(p.id)} style={{ ["--ncc" as string]: accent, background: p.id === dragonPrueba ? `rgba(${color.rgba},0.16)` : "transparent", textAlign: "left" }}>
                    <i className={`fa-solid ${p.icono}`} style={{ marginRight: 8 }} />
                    {p.etq}
                    {dragonHechas.has(p.id) && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: T.text3 }} />}
                  </button>
                ))}
              </div>
            )}
            {prueba === "dragon" && dragonPrueba && <div style={{ padding: "10px 12px", borderRadius: 12, background: "#fff", color: "#0f172a", fontWeight: 800, lineHeight: 1.4 }}>{PRUEBAS_DRAGON.find((p) => p.id === dragonPrueba)!.excusa}</div>}
            {veredictoPrueba && nota(veredictoPrueba.txt, veredictoPrueba.col, "fa-scale-unbalanced")}
          </div>
        </Bloque>
      </>
    );
  } else {
    control = (
      <>
        <div className="nc-opts">
          {CASOS.map((c, i) => (
            <button key={c.id} className="nc-opt nc-caso" data-on={i === casoIdx} onClick={() => elegirCaso(i)} style={{ ["--ncc" as string]: modoCol, background: i === casoIdx ? `${modoCol}1f` : "transparent" }}>
              {c.etq}
              {casosTerminados.has(c.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <Bloque titulo={`Hito ${hito + 1} de ${caso.hitos.length}`} icono="fa-timeline">
          <div className="nc-linea">
            {caso.hitos.map((h, k) => (
              <button key={k} className="nc-punto" data-estado={k < hito ? "hecho" : k === hito ? "actual" : "pendiente"} onClick={() => { setHito(k); if (k === caso.hitos.length - 1) setCasosTerminados((s) => new Set(s).add(caso.id)); }} aria-label={h.anio} title={h.anio} style={{ ["--ncc" as string]: h.apoya === "nueva" ? modoCol : "#94a3b8" }} />
            ))}
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${hitoActual.apoya === "nueva" ? modoCol : "#64748b"}55`, background: "rgba(4,10,22,0.45)" }}>
            <div style={{ fontWeight: 900, color: hitoActual.apoya === "nueva" ? modoCol : "#cbd5e1", marginBottom: 4 }}>
              {hitoActual.anio} · pesa en favor de la idea {hitoActual.apoya === "nueva" ? "nueva" : "establecida"}
            </div>
            <div style={{ color: "#fff", lineHeight: 1.5 }}>{hitoActual.texto}</div>
          </div>
          <div className="nc-opts">
            <button className="nc-opt" data-on="false" onClick={() => avanzar(-1)} disabled={hito === 0} style={{ ["--ncc" as string]: modoCol }}>
              <i className="fa-solid fa-backward-step" style={{ marginRight: 8 }} />
              Hito anterior
            </button>
            <button className="nc-opt nc-sig" data-on="true" onClick={() => avanzar(1)} disabled={alFinal} style={{ ["--ncc" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente hito
              <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
            </button>
          </div>
          {alFinal && nota(caso.leccion, OK, "fa-lightbulb")}
          <div style={{ color: T.text3, lineHeight: 1.5 }}>Los hechos y fechas son históricos; el peso de cada evidencia y el porcentaje de la comunidad son ilustrativos.</div>
        </Bloque>
      </>
    );
  }

  const estilos = (
    <style>{`
      .nc-opts { display:flex; flex-wrap:wrap; gap:7px; }
      .nc-opt { cursor:pointer; border:1px solid var(--ncc); border-radius:10px; padding:9px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
      .nc-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
      .nc-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
      .nc-opt:disabled { cursor:default; }
      .nc-opt:disabled[data-on="false"] { opacity:0.55; }
      .nc-toggle { width:100%; cursor:pointer; border:1px solid var(--ncc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
      .nc-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
      .nc-toggle:disabled { cursor:default; opacity:0.75; }
      .nc-linea { display:flex; align-items:center; gap:0; }
      .nc-punto { cursor:pointer; flex:1; height:16px; border:none; background:transparent; position:relative; padding:0; }
      .nc-punto::before { content:""; position:absolute; left:0; right:0; top:7px; height:2px; background:rgba(255,255,255,0.14); }
      .nc-punto::after { content:""; position:absolute; left:50%; top:0; width:16px; height:16px; margin-left:-8px; border-radius:50%; border:2px solid var(--ncc); background:#06121e; transition:all .2s; }
      .nc-punto[data-estado="hecho"]::after { background:var(--ncc); }
      .nc-punto[data-estado="actual"]::after { background:var(--ncc); box-shadow:0 0 0 4px rgba(255,255,255,0.12); transform:scale(1.2); }
      .nc-opt:focus-visible, .nc-toggle:focus-visible, .nc-punto:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
    `}</style>
  );

  const lista = (items: string[], ordenada = false) => {
    const Tag = ordenada ? "ol" : "ul";
    return (
      <Tag style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </Tag>
    );
  };

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <NaturalezaScene
            vista={vista}
            modoColor={modoCol}
            resetNonce={resetNonce}
            manuscritoId={ms.id}
            marcados={marcados}
            dictamen={dictamen}
            medidos={medidos}
            prueba={prueba}
            metalId={metalId}
            tempC={predijo ? tempC : T_AMBIENTE}
            lugarId={lugarId}
            fuego={fuego}
            regionId={regionId}
            dragonPrueba={dragonPrueba}
            casoId={caso.id}
            hito={hito}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={lecturaVivo}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {estilos}
              {control}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <div style={{ display: "grid", gap: 18 }}>
              <CientificaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes cómo funciona la ciencia." />
              <div style={{ ...card, padding: "16px 16px 18px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                  Completa el texto (A6)
                </Eyebrow>
                <div style={{ marginTop: 12 }}>
                  <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="¿Por qué confiar en la ciencia?" icono="fa-people-group">
                <p style={{ margin: 0, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo={`Lectura A1 · ${TITULO_A1}`} icono="fa-book-open">
                <div style={{ display: "grid", gap: 10 }}>
                  {LECTURA_A1.map((p, i) => (
                    <div key={i} style={{ color: T.text2, lineHeight: 1.55 }}>
                      {p}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-comments">
                {lista(PREGUNTAS)}
              </Bloque>
              <Bloque titulo="Importante (lectura A1)" icono="fa-landmark">
                <p style={{ margin: 0, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</p>
                <p style={{ margin: 0, fontSize: 14, color: T.text3, lineHeight: 1.45, fontStyle: "italic" }}>{NOTA_RECUADRO}</p>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                {lista(INSTRUCCIONES, true)}
              </Bloque>
              <Bloque titulo="Hechos (quiz A4)" icono="fa-circle-question">
                {lista(HECHOS)}
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                <div style={{ display: "grid", gap: 8 }}>
                  {GLOSARIO.map((gi, i) => (
                    <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                      <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                      <span style={{ color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                      <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                        <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
                        {gi.ejemplo}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
                  <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
                </p>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                {lista(IDEAS)}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={NATURALEZA_CIENCIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La lectura A1 con sus preguntas y su recuadro, los hechos del quiz A4, el glosario A5, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma. Los
                cuatro manuscritos son <strong>ejemplos didácticos</strong>, no estudios reales, y sus réplicas se simulan con variación aleatoria. Los casos de H. pylori y de la deriva
                continental son históricos. Los puntos de ebullición se calculan con la presión atmosférica estándar de cada altitud. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
