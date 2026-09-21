"use client";

/**
 * Laboratorio 3D — "Método científico: el experimento controlado y la
 * medición".
 * Práctica experimental anclada a CNEYT-I-P06-A2 (quiz «Pasos del método
 * científico») y CNEYT-I-P06-A6 (ejercicio «Medición: conversión de
 * unidades»); progresión 9 de la UAC CNEYT-I. El marco teórico es la lectura
 * A1, los hechos salen del quiz A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) Experimento controlado — de la observación a la conclusión con tres
 *      grupos de plantas bajo distintas horas de luz; controles que se pueden
 *      romper y un experimento que se puede replicar.
 *  (2) Réplicas y análisis — cinco plantas por nivel de luz: la variación
 *      natural y por qué el promedio de varias muestras es más confiable.
 *  (3) Medición — cinta, regla y calibrador vernier: lectura, incertidumbre y
 *      cifras significativas.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { METODO_CIENTIFICO_FICHA } from "./metodo-cientifico-ficha";
import type { VistaMetodo } from "./MetodoCientificoScene";
import {
  type Modo,
  type Grupo,
  type Diseno,
  type Conclusion,
  type Instrumento,
  type ResultadoLectura,
  type TipoVariable,
  MODOS,
  MODOS_DEF,
  GRUPOS,
  COLOR_GRUPO,
  DIAS,
  LUZ_MAX,
  AGUA_BASE,
  HIPOTESIS,
  DISENO_INICIAL,
  revisarDiseno,
  CONCLUSIONES,
  conclusionCorrecta,
  altura,
  vigores,
  mulberry32,
  REPLICAS,
  NIVELES_LUZ,
  media,
  desviacion,
  INSTRUMENTOS,
  OBJETOS,
  lectura,
  decimalesCm,
  cifrasSignificativas,
  evaluarLectura,
  CASOS_VARIABLES,
  estrellasPorErrores,
  TITULO_A1,
  LECTURA_A1,
  SABIAS_A1,
  PASOS,
  OBSERVACION,
  PREGUNTA_EXP,
  PREGUNTAS,
  HECHOS,
  GLOSARIO,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  RETO_A6,
  num,
} from "./metodo-cientifico-data";

const MetodoScene = dynamic(() => import("./MetodoCientificoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-seedling fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el invernadero en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-metodo-cientifico-reto";
const T_CRECER = 5600;
const WARN = "#FF8A3C";

const VIGOR_INICIAL = vigores(3, mulberry32(31));
const REPLICAS_INICIALES = vigores(NIVELES_LUZ.length * REPLICAS, mulberry32(77));

const TIPO_ETQ: Record<TipoVariable, string> = { independiente: "Independiente", dependiente: "Dependiente", control: "De control" };

/* ── Tarjeta de estrellas: ¿qué variable es? ──────────────────────────── */
function VariablesCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const [resp, setResp] = useState<Record<number, TipoVariable>>({});
  const [errores, setErrores] = useState(0);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const caso = CASOS_VARIABLES[idx]!;

  const elegir = (i: number, t: TipoVariable) => {
    if (resuelto !== null || resp[i] === caso.variables[i]!.tipo) return;
    const ok = caso.variables[i]!.tipo === t;
    const nuevas = { ...resp, [i]: t };
    setResp(nuevas);
    playSfx?.(ok);
    const err = ok ? errores : errores + 1;
    if (!ok) setErrores(err);
    if (caso.variables.every((v, k) => nuevas[k] === v.tipo)) {
      const est = estrellasPorErrores(err);
      setResuelto(est);
      onResultado(est);
    }
  };
  const otro = () => {
    setIdx((k) => (k + 1) % CASOS_VARIABLES.length);
    setResp({});
    setErrores(0);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Qué variable es?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
        Experimento {idx + 1} de {CASOS_VARIABLES.length} · pistas de la reflexión A3
      </div>
      <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, lineHeight: 1.5, marginBottom: 12 }}>{caso.experimento}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {caso.variables.map((v, i) => {
          const r = resp[i];
          const bien = r === v.tipo;
          return (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${r ? (bien ? `${OK}55` : `${WARN}55`) : T.line}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#fff", fontWeight: 800, flex: "1 1 180px" }}>{v.texto}</span>
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["independiente", "dependiente", "control"] as TipoVariable[]).map((t) => (
                  <button
                    key={t}
                    className="mc-opt mc-var"
                    data-on={r === t}
                    onClick={() => elegir(i, t)}
                    style={{ ["--mcc" as string]: r === t ? (bien ? OK : WARN) : accent, background: r === t ? (bien ? "rgba(52,211,153,0.14)" : "rgba(255,138,60,0.12)") : "transparent", padding: "6px 10px" }}
                  >
                    {TIPO_ETQ[t]}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      {errores > 0 && resuelto === null && <div style={{ marginTop: 10, fontSize: 12, color: WARN }}>Errores: {errores}. La independiente se cambia a propósito, la dependiente se mide y la de control se mantiene igual.</div>}
      {resuelto !== null && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>{errores === 0 ? "Sin errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otro} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
            <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
            Otro experimento
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

type Estado = "diseno" | "creciendo" | "terminado";

export function LabMetodoCientifico({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("experimento");

  // ── Experimento
  const [hipotesisId, setHipotesisId] = useState<string | null>(null);
  const [luz, setLuz] = useState<Record<Grupo, number>>(DISENO_INICIAL.luz);
  const [riegoIgual, setRiegoIgual] = useState(true);
  const [tempIgual, setTempIgual] = useState(true);
  const [estado, setEstado] = useState<Estado>("diseno");
  const [vigorGrupo, setVigorGrupo] = useState<number[]>(VIGOR_INICIAL);
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);
  const [corridas, setCorridas] = useState(0);
  const crecerTimer = useRef<number | null>(null);

  // ── Réplicas
  const [vigorReplicas, setVigorReplicas] = useState<number[]>(REPLICAS_INICIALES);
  const [replicas, setReplicas] = useState<1 | 5>(1);
  const [vioReplicas, setVioReplicas] = useState<Set<number>>(() => new Set([1]));

  // ── Medición
  const [objetoId, setObjetoId] = useState(OBJETOS[0]!.id);
  const [instrumento, setInstrumento] = useState<Instrumento>("regla");
  const [lupa, setLupa] = useState(false);
  const [lecturaTxt, setLecturaTxt] = useState("");
  const [resultado, setResultado] = useState<ResultadoLectura | null>(null);
  const [lecturasOk, setLecturasOk] = useState<Set<Instrumento>>(() => new Set());

  // ── Logros
  const [hipotesisOk, setHipotesisOk] = useState(false);
  const [concluyoControlado, setConcluyoControlado] = useState(false);
  const [detectoRoto, setDetectoRoto] = useState(false);
  const [replico, setReplico] = useState(false);
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [retoAprobado, setRetoAprobado] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
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
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      if (crecerTimer.current !== null) window.clearTimeout(crecerTimer.current);
    };
  }, []);

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

  /* ── Derivados del experimento ─────────────────────────────────────── */
  const diseno: Diseno = useMemo(
    () => ({
      luz,
      agua: { A: AGUA_BASE, B: AGUA_BASE, C: riegoIgual ? AGUA_BASE : 400 },
      temperatura: { A: 22, B: 22, C: tempIgual ? 22 : 29 },
    }),
    [luz, riegoIgual, tempIgual],
  );
  const revision = revisarDiseno(diseno);
  const finales = useMemo(() => Object.fromEntries(GRUPOS.map((g, i) => [g, altura(diseno.luz[g], diseno.agua[g], diseno.temperatura[g], DIAS, vigorGrupo[i] ?? 1)])) as Record<Grupo, number>, [diseno, vigorGrupo]);
  const correcta = conclusionCorrecta(diseno, finales);
  const invertido = GRUPOS.some((g) => GRUPOS.some((h) => luz[g] > luz[h] && finales[g] < finales[h]));
  const hipotesis = HIPOTESIS.find((h) => h.id === hipotesisId) ?? null;

  const pasoActual = !hipotesisOk ? 2 : estado === "diseno" ? 3 : estado === "creciendo" ? 3 : conclusion === null ? 5 : conclusion === correcta ? 6 : 5;

  /* ── Acciones: experimento ─────────────────────────────────────────── */
  const nuevoDiseno = () => {
    if (crecerTimer.current !== null) window.clearTimeout(crecerTimer.current);
    setEstado("diseno");
    setConclusion(null);
  };

  const elegirHipotesis = (id: string) => {
    const h = HIPOTESIS.find((x) => x.id === id)!;
    setHipotesisId(id);
    if (h.falsable) setHipotesisOk(true);
    sfx(h.falsable);
  };

  const cambiarLuz = (g: Grupo, v: number) => {
    setLuz((prev) => ({ ...prev, [g]: v }));
    nuevoDiseno();
  };

  const regar = (nuevaReplica = false) => {
    if (estado === "creciendo") return;
    setVigorGrupo(vigores(3));
    setEstado("creciendo");
    setConclusion(null);
    setCorridas((k) => k + 1);
    if (nuevaReplica) setReplico(true);
    blip();
    crecerTimer.current = window.setTimeout(() => setEstado("terminado"), T_CRECER);
  };

  const concluir = (c: Conclusion) => {
    if (estado !== "terminado") return;
    setConclusion(c);
    const ok = c === correcta;
    sfx(ok);
    if (ok && revision.control === "ok" && c === "apoya") setConcluyoControlado(true);
    if (ok && revision.control === "roto") setDetectoRoto(true);
  };

  /* ── Acciones: réplicas y medición ─────────────────────────────────── */
  const elegirReplicas = (r: 1 | 5) => {
    setReplicas(r);
    setVioReplicas((s) => new Set(s).add(r));
    blip();
  };

  const comprobarLectura = () => {
    const obj = OBJETOS.find((o) => o.id === objetoId)!;
    const r = evaluarLectura(lecturaTxt, obj.mm, instrumento);
    setResultado(r);
    sfx(r === "ok");
    if (r === "ok" && objetoId === "hoja") setLecturasOk((s) => new Set(s).add(instrumento));
  };
  const elegirInstrumento = (i: Instrumento) => {
    setInstrumento(i);
    setLecturaTxt("");
    setResultado(null);
    blip();
  };
  const elegirObjeto = (id: string) => {
    setObjetoId(id);
    setLecturaTxt("");
    setResultado(null);
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "experimento") {
      nuevoDiseno();
      setLuz(DISENO_INICIAL.luz);
      setRiegoIgual(true);
      setTempIgual(true);
    }
    if (modo === "medicion") setLupa(false);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Elegir una hipótesis que pueda refutarse", done: hipotesisOk },
    { t: "Completar un experimento controlado y concluir que los datos apoyan la hipótesis", done: concluyoControlado },
    { t: "Romper un control y reconocer que ya no se puede concluir", done: detectoRoto },
    { t: "Replicar el experimento", done: replico },
    { t: "Comparar una planta por grupo con cinco réplicas", done: vioReplicas.has(1) && vioReplicas.has(5) },
    { t: "Medir la hoja con los tres instrumentos", done: lecturasOk.size === 3 },
    { t: "Identificar las variables de un experimento y ganar estrellas", done: identifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Resolver la conversión de unidades (A6)", done: retoAprobado },
  ];

  /* ── Réplicas: lecturas ────────────────────────────────────────────── */
  const filas = NIVELES_LUZ.map((h, fila) => {
    const alturas = Array.from({ length: REPLICAS }, (_, k) => altura(h, AGUA_BASE, 22, DIAS, vigorReplicas[fila * REPLICAS + k] ?? 1)).slice(0, replicas);
    return { luz: h, media: media(alturas), sd: desviacion(alturas) };
  });
  const invertidos = filas.slice(1).filter((f, i) => f.media < filas[i]!.media).length;

  /* ── Medición: lecturas ────────────────────────────────────────────── */
  const objeto = OBJETOS.find((o) => o.id === objetoId)!;
  const inst = INSTRUMENTOS[instrumento];
  const lecturaEsperada = lectura(objeto.mm, instrumento) / 10;
  const decEsperados = decimalesCm(instrumento);

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaMetodo = modo === "experimento" ? "invernadero" : modo === "replicas" ? "replicas" : "medicion";
  let chipVivo = "";
  let pie = "";
  if (modo === "experimento") {
    chipVivo = estado === "creciendo" ? "regando · 21 días" : estado === "terminado" ? `día ${DIAS} · ${revision.control === "ok" ? "controles intactos" : "control roto"}` : `diseño · ${revision.control === "ok" ? "controles intactos" : revision.control === "roto" ? "control roto" : "sin variable independiente"}`;
    pie = estado === "terminado" ? `Alturas finales: A ${num(finales.A, 1)} cm, B ${num(finales.B, 1)} cm, C ${num(finales.C, 1)} cm. ${revision.detalle}` : revision.detalle;
  } else if (modo === "replicas") {
    chipVivo = `${replicas} ${replicas === 1 ? "planta" : "plantas"} por nivel · ${DIAS} días`;
    pie =
      replicas === 1
        ? invertidos > 0
          ? `Con una sola planta por nivel, ${invertidos === 1 ? "un nivel con más luz quedó" : `${invertidos} niveles con más luz quedaron`} por debajo del anterior: la variación natural confunde.`
          : "Con una sola planta por nivel el orden salió bien, pero no sabes cuánto variaría con otras plantas."
        : `Con cinco plantas por nivel, el promedio (x̄) y la variación (s) muestran qué diferencias son reales. ${invertidos === 0 ? "Los promedios crecen con la luz." : "Aun así, entre 12 y 16 h la diferencia es pequeña frente a la variación."}`;
  } else {
    chipVivo = `${inst.etq.toLowerCase()} · ±${num(inst.resolucionMm / 10, instrumento === "vernier" ? 2 : instrumento === "regla" ? 1 : 0)} cm`;
    pie = `${objeto.etq} sobre ${inst.etq.toLowerCase()}. ${inst.detalle} Reporta la lectura en centímetros con los decimales que permite el instrumento.`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los cálculos siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "experimento") {
    control = (
      <>
        <div className="mc-pasos">
          {PASOS.map((p, i) => (
            <span key={p.etq} className="mc-paso" data-estado={i < pasoActual ? "hecho" : i === pasoActual ? "actual" : "pendiente"} title={`${p.etq}: ${p.texto}`}>
              <b>{i + 1}</b> {p.etq}
            </span>
          ))}
        </div>

        {sub("1–2 · Observación y pregunta")}
        <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
          <i className="fa-solid fa-eye" style={{ marginRight: 7, color: modoCol }} />
          {OBSERVACION} <strong style={{ color: "#fff" }}>{PREGUNTA_EXP}</strong>
        </div>

        {sub("3 · Hipótesis")}
        <div style={{ display: "grid", gap: 7 }}>
          {HIPOTESIS.map((h) => {
            const on = h.id === hipotesisId;
            return (
              <button key={h.id} className="mc-hip" data-on={on} onClick={() => elegirHipotesis(h.id)} style={{ ["--mcc" as string]: on ? (h.falsable ? OK : WARN) : "rgba(255,255,255,0.14)" }}>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 800 }}>«{h.texto}»</span>
                {on && <span style={{ fontSize: 11.5, color: h.falsable ? OK : WARN, marginTop: 4 }}>{h.falsable ? "Falsable: " : "No falsable: "}{h.porque}</span>}
              </button>
            );
          })}
        </div>

        {sub("4 · Experimentación: variable independiente (horas de luz)")}
        <div style={{ opacity: hipotesisOk ? 1 : 0.45, pointerEvents: hipotesisOk ? "auto" : "none" }}>
          {GRUPOS.map((g) => (
            <label key={g} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span style={{ width: 70, fontSize: 12, fontWeight: 900, color: COLOR_GRUPO[g] }}>Grupo {g}</span>
              <input type="range" aria-label={`Horas de luz del grupo ${g}`} className="mc-range" min={0} max={LUZ_MAX} step={1} value={luz[g]} onChange={(e) => cambiarLuz(g, Number(e.target.value))} style={{ ["--mcc" as string]: COLOR_GRUPO[g] }} />
              <span style={{ width: 44, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>{luz[g]} h</span>
            </label>
          ))}
          {sub("Variables de control")}
          <div className="mc-opts">
            <button className="mc-opt" data-on={riegoIgual} onClick={() => { setRiegoIgual((v) => !v); nuevoDiseno(); }} style={{ ["--mcc" as string]: riegoIgual ? OK : WARN, background: riegoIgual ? "rgba(52,211,153,0.12)" : "rgba(255,138,60,0.12)" }}>
              <i className="fa-solid fa-droplet" style={{ marginRight: 8 }} />
              {riegoIgual ? `Mismo riego: ${AGUA_BASE} ml` : "Grupo C con 400 ml"}
            </button>
            <button className="mc-opt" data-on={tempIgual} onClick={() => { setTempIgual((v) => !v); nuevoDiseno(); }} style={{ ["--mcc" as string]: tempIgual ? OK : WARN, background: tempIgual ? "rgba(52,211,153,0.12)" : "rgba(255,138,60,0.12)" }}>
              <i className="fa-solid fa-temperature-half" style={{ marginRight: 8 }} />
              {tempIgual ? "Misma temperatura: 22 °C" : "Grupo C a 29 °C"}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.5, color: revision.control === "ok" ? OK : WARN }}>
            <i className={`fa-solid ${revision.control === "ok" ? "fa-circle-check" : "fa-triangle-exclamation"}`} style={{ marginRight: 6 }} />
            {revision.detalle}
          </div>
          <button className="mc-toggle" onClick={() => regar(false)} disabled={estado === "creciendo"} style={{ marginTop: 12, ["--mcc" as string]: accent }}>
            <i className={`fa-solid ${estado === "creciendo" ? "fa-spinner fa-spin" : "fa-droplet"}`} style={{ marginRight: 9, color: accent }} />
            {estado === "creciendo" ? "Las plantas están creciendo…" : estado === "terminado" ? "Volver a sembrar y regar 21 días" : "Sembrar y regar 21 días"}
          </button>
        </div>

        {estado === "terminado" && (
          <>
            {sub("5 · Análisis de datos (variable dependiente: altura)")}
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {GRUPOS.map((g) => (
                <Readout key={g} label={`${g} · ${luz[g]} h`} value={num(finales[g], 1)} unit="cm" col={COLOR_GRUPO[g]} size={17} />
              ))}
            </div>
            {corridas > 1 && replico && <div style={{ marginTop: 6, fontSize: 11.5, color: T.text2 }}><i className="fa-solid fa-flask-vial" style={{ marginRight: 7, color: modoCol }} />Réplica número {corridas - 1}: plantas nuevas, alturas un poco distintas. Si la conclusión se repite, el resultado es más confiable.</div>}
            {invertido && <div style={{ marginTop: 6, fontSize: 11.5, color: "#fde68a", lineHeight: 1.5 }}><i className="fa-solid fa-shuffle" style={{ marginRight: 7 }} />Un grupo con más luz quedó más bajo que otro con menos: con una sola planta por grupo, la variación natural puede invertir el orden. Lo verás en el modo Réplicas.</div>}
            {sub("6 · Conclusión")}
            <div className="mc-opts">
              {CONCLUSIONES.map((c) => {
                const on = conclusion === c.id;
                const ok = on && c.id === correcta;
                return (
                  <button key={c.id} className="mc-opt mc-concl" data-on={on} onClick={() => concluir(c.id)} style={{ ["--mcc" as string]: on ? (ok ? OK : WARN) : modoCol, background: on ? (ok ? "rgba(52,211,153,0.14)" : "rgba(255,138,60,0.12)") : "transparent" }}>
                    {c.texto}
                  </button>
                );
              })}
            </div>
            {conclusion && (
              <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: conclusion === correcta ? OK : WARN }}>
                {conclusion === correcta
                  ? correcta === "apoya"
                    ? "Correcto: con los controles intactos, el grupo con más luz creció más. Los datos apoyan la hipótesis, aunque siempre de forma provisional."
                    : correcta === "noConcluyente"
                      ? revision.control === "roto"
                        ? "Correcto: cambiaron dos variables a la vez, así que no puedes atribuir la diferencia a la luz."
                        : "Correcto: la diferencia es menor que la variación natural entre plantas."
                      : "Correcto: los datos contradicen la hipótesis; habría que rechazarla o modificarla."
                  : revision.control === "roto"
                    ? "Revisa el diseño: además de la luz cambió otra variable. ¿Puedes saber cuál causó la diferencia?"
                    : "Compara la altura del grupo con más luz contra la del grupo con menos luz."}
              </div>
            )}
            {conclusion === correcta && (
              <>
                {sub("7 · Comunicación y replicación")}
                <button className="mc-toggle" onClick={() => regar(true)} style={{ ["--mcc" as string]: modoCol }}>
                  <i className="fa-solid fa-flask-vial" style={{ marginRight: 9, color: modoCol }} />
                  Otro laboratorio replica el experimento con plantas nuevas
                </button>
              </>
            )}
          </>
        )}
      </>
    );
  } else if (modo === "replicas") {
    control = (
      <>
        {sub("Plantas por nivel de luz")}
        <div className="mc-opts">
          {([1, 5] as const).map((r) => (
            <button key={r} className="mc-opt" data-on={replicas === r} onClick={() => elegirReplicas(r)} style={{ ["--mcc" as string]: modoCol, background: replicas === r ? `${modoCol}1f` : "transparent" }}>
              {r === 1 ? "Una planta" : "Cinco réplicas"}
            </button>
          ))}
          <button className="mc-opt" data-on="false" onClick={() => { setVigorReplicas(vigores(NIVELES_LUZ.length * REPLICAS)); blip(); }} style={{ ["--mcc" as string]: accent }}>
            <i className="fa-solid fa-seedling" style={{ marginRight: 8, color: accent }} />
            Sembrar plantas nuevas
          </button>
        </div>
        {sub("Resultados a los 21 días")}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, fontSize: 12.5, ...NUM }}>
            <thead>
              <tr style={{ color: T.text3, fontSize: 10.5 }}>
                <th style={{ textAlign: "left", padding: 4 }}>Luz</th>
                <th style={{ padding: 4 }}>{replicas === 1 ? "Altura" : "Promedio x̄"}</th>
                {replicas === 5 && <th style={{ padding: 4 }}>Variación s</th>}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => {
                const baja = i > 0 && f.media < filas[i - 1]!.media;
                return (
                  <tr key={f.luz}>
                    <td style={{ padding: "6px 4px", fontWeight: 900, color: "#fde68a" }}>{f.luz} h</td>
                    <td className="mc-td" style={{ color: baja ? "#f87171" : "#fff" }}>
                      {num(f.media, 1)} cm{baja ? " ↓" : ""}
                    </td>
                    {replicas === 5 && <td className="mc-td">± {num(f.sd, 1)} cm</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
          x̄ = suma de las alturas ÷ 5. s mide cuánto se alejan las plantas de su promedio. Una diferencia entre niveles menor que s puede deberse al azar.
        </div>
      </>
    );
  } else {
    const msg: Record<ResultadoLectura, string> = {
      ok: `Correcto: ${num(lecturaEsperada, decEsperados)} ± ${num(inst.resolucionMm / 10, decEsperados)} cm, con ${cifrasSignificativas(num(lecturaEsperada, decEsperados))} cifras significativas.`,
      sobran: "Ese instrumento no puede dar tantos decimales: los dígitos de más no son confiables.",
      faltan: "El instrumento permite leer una cifra más. Acércate al extremo del objeto.",
      valor: "Revisa dónde termina el objeto sobre la escala.",
      vacio: "Escribe la lectura en centímetros (por ejemplo, 8.5).",
    };
    control = (
      <>
        {sub("Objeto")}
        <div className="mc-opts">
          {OBJETOS.map((o) => (
            <button key={o.id} className="mc-opt" data-on={o.id === objetoId} onClick={() => elegirObjeto(o.id)} style={{ ["--mcc" as string]: modoCol, background: o.id === objetoId ? `${modoCol}1f` : "transparent" }}>
              {o.etq}
            </button>
          ))}
        </div>
        {sub("Instrumento")}
        <div className="mc-opts">
          {(Object.keys(INSTRUMENTOS) as Instrumento[]).map((k) => (
            <button key={k} className="mc-opt mc-inst" data-on={k === instrumento} onClick={() => elegirInstrumento(k)} style={{ ["--mcc" as string]: accent, background: k === instrumento ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              <i className={`fa-solid ${INSTRUMENTOS[k].icono}`} style={{ marginRight: 8, color: accent }} />
              {INSTRUMENTOS[k].etq}
              {lecturasOk.has(k) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 8, color: OK }} />}
            </button>
          ))}
        </div>
        <button className="mc-toggle" onClick={() => { setLupa((v) => !v); blip(); }} style={{ marginTop: 10, ["--mcc" as string]: modoCol }}>
          <i className={`fa-solid ${lupa ? "fa-magnifying-glass-minus" : "fa-magnifying-glass-plus"}`} style={{ marginRight: 9, color: modoCol }} />
          {lupa ? "Ver el instrumento completo" : "Acercar la vista al extremo del objeto"}
        </button>
        {sub("Tu lectura")}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            aria-label="Lectura en centímetros"
            inputMode="decimal"
            value={lecturaTxt}
            onChange={(e) => setLecturaTxt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") comprobarLectura();
            }}
            placeholder="0.0"
            style={{ width: 120, padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "rgba(4,10,22,0.6)", color: "#fff", fontSize: 15, fontWeight: 800, ...NUM }}
          />
          <span style={{ fontSize: 13, color: T.text2, fontWeight: 800 }}>cm</span>
          <button className="mc-opt" data-on="true" onClick={comprobarLectura} style={{ ["--mcc" as string]: accent, background: `rgba(${color.rgba},0.16)` }}>
            <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
            Comprobar lectura
          </button>
        </div>
        {resultado && (
          <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5, color: resultado === "ok" ? OK : WARN, ...NUM }}>
            <i className={`fa-solid ${resultado === "ok" ? "fa-circle-check" : "fa-rotate-left"}`} style={{ marginRight: 7 }} />
            {msg[resultado]}
          </div>
        )}
        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}10` }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Readout label="Resolución" value={`±${num(inst.resolucionMm, instrumento === "vernier" ? 1 : 0)}`} unit="mm" col={modoCol} size={16} />
            <Readout label="Decimales en cm" value={String(decEsperados)} size={16} />
            <Readout label="Cifras que puedes dar" value={lecturasOk.has(instrumento) || resultado === "ok" ? String(cifrasSignificativas(num(lecturaEsperada, decEsperados))) : "?"} size={16} />
          </div>
          <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, textAlign: "center" }}>Ningún instrumento da el valor exacto: cada uno lo acota con su incertidumbre.</div>
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes mcPulse { 0%,100%{ box-shadow:0 0 0 0 var(--mcd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .mc-live-dot { animation: mcPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .mc-live-dot { animation:none; } }
        .mc-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .mc-grid { grid-template-columns: 1fr; } }
        .mc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .mc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .mc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .mc-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .mc-tab { cursor:pointer; border:1px solid var(--mcc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .mc-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .mc-tab:hover { background:rgba(255,255,255,0.06); }
        .mc-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .mc-opt { cursor:pointer; border:1px solid var(--mcc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .mc-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.7); }
        .mc-opt:hover { background:rgba(255,255,255,0.06); }
        .mc-hip { cursor:pointer; display:flex; flex-direction:column; align-items:flex-start; text-align:left; padding:10px 12px; border-radius:11px; border:1px solid var(--mcc); background:rgba(4,10,22,0.45); transition:all .15s; }
        .mc-hip:hover { background:rgba(255,255,255,0.06); }
        .mc-pasos { display:flex; flex-wrap:wrap; gap:5px; }
        .mc-paso { font-size:10.5px; font-weight:800; padding:4px 8px; border-radius:999px; border:1px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.5); white-space:nowrap; }
        .mc-paso b { color:inherit; margin-right:2px; }
        .mc-paso[data-estado="hecho"] { border-color:${OK}66; color:${OK}; background:rgba(52,211,153,0.08); }
        .mc-paso[data-estado="actual"] { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.18); }
        .mc-opt:focus-visible, .mc-tab:focus-visible, .mc-toggle:focus-visible, .mc-icobtn:focus-visible, .mc-hip:focus-visible, .mc-range:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .mc-toggle { width:100%; cursor:pointer; border:1px solid var(--mcc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .mc-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .mc-toggle:disabled { cursor:default; opacity:0.7; }
        .mc-range { flex:1; accent-color: var(--mcc); }
        .mc-td { padding:6px; text-align:center; border-radius:6px; background:rgba(4,10,22,0.45); color:${T.text2}; font-weight:800; }
        @media (max-width: 1000px){ .mc-bottom { grid-template-columns: 1fr !important; } }
        .mc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .mc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .mc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .mc-drawer[data-open="true"] { transform:translateX(0); }
        .mc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .mc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .mc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .mc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .mc-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .mc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="mc-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="mc-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--mcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="mc-grid">
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
              <MetodoScene
                vista={vista}
                diseno={diseno}
                vigorGrupo={vigorGrupo}
                diaObjetivo={estado === "diseno" ? 0 : DIAS}
                vigorReplicas={vigorReplicas}
                replicas={replicas}
                objetoId={objetoId}
                instrumento={instrumento}
                lupa={lupa}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="mc-live-dot" style={{ ["--mcd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="mc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="mc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="mc-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="mc-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              {hipotesis && modo === "experimento" && <span style={{ fontSize: 11, color: T.text3, fontStyle: "italic" }}>Hipótesis: «{hipotesis.texto}»</span>}
            </div>
            {control}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-flask" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Conocimiento confiable</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="mc-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-water" style={{ marginRight: 8, color: accent }} />
              ¿Sabías que? (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{SABIAS_A1}</div>
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
          La lectura A1, sus preguntas y su recuadro, los hechos del quiz A4, el glosario A5, el quiz A2 y el ejercicio A6 son <strong>verbatim</strong> del material de la
          plataforma. La hipótesis de las plantas y la luz es la del quiz A2. El crecimiento de las plantas es un <strong>modelo ilustrativo</strong> (más luz y un riego
          adecuado dan más crecimiento, con ±8 % de variación natural entre plantas), no datos de una especie real. Fuente: {FUENTE}
        </span>
      </div>

      <VariablesCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Conoces los pasos del método científico." />

      <RetoNumericoCard reto={RETO_A6} accent={accent} aprobado={retoAprobado} onAprobado={() => setRetoAprobado(true)} playSfx={sfx} />

      <div className="mc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="mc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="mc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="mc-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="mc-drawer-body">
          <FichaTeorica data={METODO_CIENTIFICO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
