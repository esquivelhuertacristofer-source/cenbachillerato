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
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Es científica?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
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
          {aviso && <div style={{ marginTop: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
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
  const [drawer, setDrawer] = useState(false);
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
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Encontrar todos los defectos de un manuscrito y dar el dictamen correcto", done: revisionPerfecta },
    { t: "Dictaminar bien los cuatro manuscritos", done: revisados.size === MANUSCRITOS.length },
    { t: "Ver cómo la replicación descubre un estudio que no se sostiene", done: vioNoReplicado },
    { t: "Predecir si cada una de las cuatro afirmaciones es falsable", done: prediccionesOk },
    { t: "Ver una afirmación superar una prueba sin quedar demostrada", done: sobrevivio },
    { t: "Refutar una afirmación con un solo dato", done: refuto },
    { t: "Intentar tres pruebas con el dragón invisible", done: dragonListo },
    { t: "Seguir los dos casos históricos hasta el consenso", done: casosTerminados.size === CASOS.length },
    { t: "Clasificar enunciados y ganar estrellas", done: identifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaNaturaleza = modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "revision") {
    chipVivo = medidos ? (replicaLista && ver ? `${VEREDICTO_DEF[ver].etq.toLowerCase()} · 5 laboratorios` : "replicando en 5 laboratorios…") : dictamen ? `dictamen: ${DICTAMENES.find((d) => d.id === dictamen)!.etq.toLowerCase()}` : `revisando · ${ms.titulo.toLowerCase()}`;
    pie = medidos && replicaLista && ver ? VEREDICTO_DEF[ver].explica : `«${ms.afirmacion}» Marca los defectos que encuentres y da tu dictamen; después, cinco laboratorios independientes intentarán replicarlo.`;
  } else if (modo === "falsabilidad") {
    chipVivo =
      prueba === "metal"
        ? `${metal.etq.toLowerCase()} · ${tempC} °C`
        : prueba === "hervir"
          ? `${lugar.etq.toLowerCase()} · ${num(lugar.altitud)} m`
          : prueba === "cisnes"
            ? `explorando ${REGIONES.find((r) => r.id === regionId)!.etq.toLowerCase()}`
            : `dragón invisible · ${dragonHechas.size} ${dragonHechas.size === 1 ? "prueba" : "pruebas"}`;
    pie = `«${afirmacion.texto}» ${predijo ? afirmacion.prediccion : "Antes de probarla, predice si algún dato podría refutarla."}`;
  } else {
    chipVivo = `${hitoActual.anio} · ${hitoActual.consenso} % acepta la idea nueva`;
    pie = hitoActual.texto;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
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
        {sub("El manuscrito")}
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 900, marginBottom: 6 }}>«{ms.afirmacion}»</div>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 4 }}>
            {ms.ficha.map((f, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
        {sub("1 · Marca los defectos que encuentres (puede no haber ninguno)")}
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
        {sub("2 · Tu dictamen")}
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
        {dictamen && (
          <>
            {sub("3 · Replicación independiente")}
            <div className="nc-opts">
              <button className="nc-toggle" onClick={enviarReplicar} disabled={!!medidos} style={{ ["--ncc" as string]: accent }}>
                <i className={`fa-solid ${medidos && !replicaLista ? "fa-spinner fa-spin" : "fa-paper-plane"}`} style={{ marginRight: 9, color: accent }} />
                {medidos ? (replicaLista ? "Réplicas terminadas" : "Los laboratorios están midiendo…") : "Enviar el estudio a cinco laboratorios"}
              </button>
            </div>
            {medidos && replicaLista && ver && (
              <>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6, ...NUM }}>
                  {medidos.map((v, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 800, padding: "5px 9px", borderRadius: 8, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}`, color: "#fff" }}>
                      Lab {i + 1}: {num(v, ms.unidad === "°C" ? 2 : 1)} {ms.unidad}
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
                <div className="nc-opts" style={{ marginTop: 10 }}>
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
          </>
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
        {sub("La afirmación")}
        <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 900, lineHeight: 1.45 }}>«{afirmacion.texto}»</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{afirmacion.fuente}</div>
        {sub("1 · Predice: ¿algún dato podría refutarla?")}
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

        {sub("2 · Ponla a prueba")}
        <div style={{ opacity: predijo ? 1 : 0.45, pointerEvents: predijo ? "auto" : "none" }}>
          {prueba === "metal" && (
            <>
              <div className="nc-opts">
                {METALES.map((m) => (
                  <button key={m.id} className="nc-opt" data-on={m.id === metalId} onClick={() => { setMetalId(m.id); blip(); }} style={{ ["--ncc" as string]: accent, background: m.id === metalId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                    {m.etq} · α = {num(m.alfa * 1e6)}×10⁻⁶ /°C
                  </button>
                ))}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                <i className="fa-solid fa-fire-flame-curved" style={{ color: "#fb923c" }} />
                <input type="range" aria-label="Temperatura de la barra (°C)" className="nc-range" min={T_AMBIENTE} max={T_MAX} step={10} value={tempC} onChange={(e) => calentar(Number(e.target.value))} style={{ ["--ncc" as string]: "#fb923c" }} />
                <span style={{ width: 64, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{tempC} °C</span>
              </label>
              <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
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
              <button className="nc-toggle" onClick={hervir} disabled={fuego} style={{ marginTop: 10, ["--ncc" as string]: "#fb923c" }}>
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
          {veredictoPrueba && nota(veredictoPrueba.txt, veredictoPrueba.col, "fa-scale-unbalanced")}
        </div>
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
        {sub(`Hito ${hito + 1} de ${caso.hitos.length}`)}
        <div className="nc-linea">
          {caso.hitos.map((h, k) => (
            <button key={k} className="nc-punto" data-estado={k < hito ? "hecho" : k === hito ? "actual" : "pendiente"} onClick={() => { setHito(k); if (k === caso.hitos.length - 1) setCasosTerminados((s) => new Set(s).add(caso.id)); }} aria-label={h.anio} title={h.anio} style={{ ["--ncc" as string]: h.apoya === "nueva" ? modoCol : "#94a3b8" }} />
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${hitoActual.apoya === "nueva" ? modoCol : "#64748b"}55`, background: "rgba(4,10,22,0.45)" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: hitoActual.apoya === "nueva" ? modoCol : "#cbd5e1", marginBottom: 4 }}>
            {hitoActual.anio} · pesa en favor de la idea {hitoActual.apoya === "nueva" ? "nueva" : "establecida"}
          </div>
          <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{hitoActual.texto}</div>
        </div>
        <div className="nc-opts" style={{ marginTop: 10 }}>
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
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Los hechos y fechas son históricos; el peso de cada evidencia y el porcentaje de la comunidad son ilustrativos.</div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes ncPulse { 0%,100%{ box-shadow:0 0 0 0 var(--ncd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .nc-live-dot { animation: ncPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .nc-live-dot { animation:none; } }
        .nc-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .nc-grid { grid-template-columns: 1fr; } }
        .nc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .nc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .nc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .nc-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .nc-tab { cursor:pointer; border:1px solid var(--ncc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .nc-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .nc-tab:hover { background:rgba(255,255,255,0.06); }
        .nc-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .nc-opt { cursor:pointer; border:1px solid var(--ncc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .nc-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .nc-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .nc-opt:disabled { cursor:default; }
        .nc-opt:disabled[data-on="false"] { opacity:0.55; }
        .nc-toggle { width:100%; cursor:pointer; border:1px solid var(--ncc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .nc-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .nc-toggle:disabled { cursor:default; opacity:0.75; }
        .nc-range { flex:1; accent-color: var(--ncc); }
        .nc-linea { display:flex; align-items:center; gap:0; }
        .nc-punto { cursor:pointer; flex:1; height:12px; border:none; background:transparent; position:relative; padding:0; }
        .nc-punto::before { content:""; position:absolute; left:0; right:0; top:5px; height:2px; background:rgba(255,255,255,0.14); }
        .nc-punto::after { content:""; position:absolute; left:50%; top:0; width:12px; height:12px; margin-left:-6px; border-radius:50%; border:2px solid var(--ncc); background:#06121e; transition:all .2s; }
        .nc-punto[data-estado="hecho"]::after { background:var(--ncc); }
        .nc-punto[data-estado="actual"]::after { background:var(--ncc); box-shadow:0 0 0 4px rgba(255,255,255,0.12); transform:scale(1.25); }
        .nc-opt:focus-visible, .nc-tab:focus-visible, .nc-toggle:focus-visible, .nc-icobtn:focus-visible, .nc-range:focus-visible, .nc-punto:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .nc-bottom { grid-template-columns: 1fr !important; } }
        .nc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .nc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .nc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .nc-drawer[data-open="true"] { transform:translateX(0); }
        .nc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .nc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .nc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .nc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .nc-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .nc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="nc-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="nc-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--ncc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="nc-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
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

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="nc-live-dot" style={{ ["--ncd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="nc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="nc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="nc-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>{pie}</div>
            </div>

            <button className="nc-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 12 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-people-group" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Por qué confiar en la ciencia?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 10 }}>{TITULO_A1}</div>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Cómo usar el laboratorio
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Eyebrow>
                <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
                Objetivos de la sesión
              </Eyebrow>
              <span style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="nc-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-landmark" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.45, marginTop: 6, fontStyle: "italic" }}>{NOTA_RECUADRO}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (quiz A4)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
            </div>
          </div>
        </div>
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas y su recuadro, los hechos del quiz A4, el glosario A5, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma. Los
          cuatro manuscritos son <strong>ejemplos didácticos</strong>, no estudios reales, y sus réplicas se simulan con variación aleatoria. Los casos de H. pylori y de la deriva
          continental son históricos. Los puntos de ebullición se calculan con la presión atmosférica estándar de cada altitud. Fuente: {FUENTE}
        </span>
      </div>

      <CientificaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes cómo funciona la ciencia." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="nc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="nc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="nc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="nc-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="nc-drawer-body">
          <FichaTeorica data={NATURALEZA_CIENCIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
