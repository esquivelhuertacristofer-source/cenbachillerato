"use client";

/**
 * Laboratorio 3D — "¿Están relacionadas? Independencia y correlación".
 * Práctica experimental anclada a PM-VI-P12-A2 (ejercicio «Tabla de
 * contingencia y dispersión: ¿hay relación?»; progresión 6 de la UAC PM-VI
 * "Pensamiento Matemático VI"). El marco teórico es la lectura A1, los hechos
 * salen del quiz A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) Tabla de contingencia — dos torres de 50 estudiantes con el plano de
 *      lo esperado; observado frente a esperado y comparación de proporciones.
 *  (2) Dispersión y r — tablero donde se agregan y quitan puntos; r, recta de
 *      mínimos cuadrados y rectángulos de productos.
 *  (3) Correlación ≠ causalidad — helado y ahogamientos con la temperatura
 *      como tercer eje; correlación por bandas y correlación parcial.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { CORRELACION_VARIABLES_FICHA } from "./correlacion-variables-ficha";
import {
  type Modo,
  type Punto,
  type VistaCausal,
  type NubeAdivina,
  MODOS,
  MODOS_DEF,
  GRUPO,
  TABLAS,
  calcularTabla,
  NUBES,
  nubePorId,
  estadisticos,
  describirR,
  MAX_PUNTOS,
  SEMANAS,
  analizarSemanas,
  nubeAleatoria,
  estrellasPorErrorR,
  fmt,
  PROBLEMA,
  DEFINICION,
  LECTURA_A1,
  PREGUNTAS,
  INSTRUCCIONES,
  IDEAS,
  GLOSARIO,
  HECHOS,
  DATOS,
  CONTEXTO,
  FUENTE,
  QUIZ_A2,
} from "./correlacion-variables-data";

const CorrelacionScene = dynamic(() => import("./CorrelacionVariablesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el laboratorio de correlación en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-correlacion-variables-reto";
const ANALISIS = analizarSemanas(SEMANAS);
const pct = (x: number) => `${Math.round(x * 100)} %`;

/* ── Tarjeta de estrellas: adivinar r ─────────────────────────────────── */
function MiniNube({ nube, color }: { nube: NubeAdivina; color: string }) {
  const xs = nube.puntos.map((p) => p.x);
  const ys = nube.puntos.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const W = 260;
  const H = 180;
  const px = (x: number) => 14 + ((x - minX) / (maxX - minX || 1)) * (W - 28);
  const py = (y: number) => H - 14 - ((y - minY) / (maxY - minY || 1)) * (H - 28);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Nube de puntos para estimar r" style={{ width: "100%", maxWidth: "100%", height: "auto", borderRadius: 12, background: "rgba(2,12,28,0.6)", border: `1px solid ${T.line}` }}>
      {[0.25, 0.5, 0.75].map((f) => (
        <g key={f}>
          <line x1={W * f} y1={8} x2={W * f} y2={H - 8} stroke="rgba(255,255,255,0.06)" />
          <line x1={8} y1={H * f} x2={W - 8} y2={H * f} stroke="rgba(255,255,255,0.06)" />
        </g>
      ))}
      {nube.puntos.map((p, i) => (
        <circle key={i} cx={px(p.x)} cy={py(p.y)} r={4.2} fill={color} fillOpacity={0.9} />
      ))}
    </svg>
  );
}

function AdivinaRCard({
  accent,
  rgba,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [nube, setNube] = useState<NubeAdivina>(() => nubeAleatoria());
  const [estimado, setEstimado] = useState(0);
  const [revelado, setRevelado] = useState<number | null>(null);

  const revelar = () => {
    const est = estrellasPorErrorR(Math.abs(estimado - nube.r));
    setRevelado(est);
    playSfx?.(est > 0);
    if (est > 0) onResultado(est);
  };
  const otra = () => {
    setNube(nubeAleatoria());
    setEstimado(0);
    setRevelado(null);
  };

  return (
    <div style={{ ...card, padding: "14px", marginTop: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Adivina r a simple vista
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <MiniNube nube={nube} color={accent} />
        </div>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
            Mira la forma de la nube y mueve el control hasta el valor de r que crees que tiene. 3 estrellas si te equivocas por 0.1 o menos, 2 hasta 0.2 y 1 hasta 0.35.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.text3, fontWeight: 800, ...NUM }}>
            <span>−1</span>
            <span style={{ fontSize: 22, color: "#fff", fontWeight: 900 }}>r = {fmt(estimado)}</span>
            <span>+1</span>
          </div>
          <input type="range" min={-1} max={1} step={0.05} value={estimado} onChange={(e) => setEstimado(Number(e.target.value))} disabled={revelado !== null} aria-label="Estimación de r" style={{ width: "100%", accentColor: accent }} />
          <div style={{ marginTop: 12 }}>
            {revelado === null ? (
              <button onClick={revelar} style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.18)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
                <i className="fa-solid fa-eye" style={{ marginRight: 8 }} />
                Revelar
              </button>
            ) : (
              <button onClick={otra} style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "transparent", color: "#fff", fontSize: 14, fontWeight: 900 }}>
                <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
                Otra nube
              </button>
            )}
          </div>
          {revelado !== null && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${revelado > 0 ? `${OK}55` : "#FF8A3C55"}`, background: revelado > 0 ? "rgba(52,211,153,0.08)" : "rgba(255,138,60,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
                {[1, 2, 3].map((k) => (
                  <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= revelado ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
                ))}
                <span style={{ fontSize: 14, fontWeight: 900, color: revelado > 0 ? OK : "#FF8A3C", marginLeft: 4, ...NUM }}>
                  r real = {fmt(nube.r)} · diferencia {fmt(Math.abs(estimado - nube.r))}
                </span>
              </div>
              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
                {describirR(nube.r).replace(/^./, (c) => c.toUpperCase())}. {Math.abs(nube.r) >= 0.8 ? "Los puntos casi forman una recta." : Math.abs(nube.r) < 0.2 ? "No hay recta que describa bien la nube." : "Se adivina una tendencia, pero con mucha dispersión."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabCorrelacionVariables({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("contingencia");

  // ── Contingencia
  const [hF, setHF] = useState(TABLAS[0]!.hombresFutbol);
  const [mF, setMF] = useState(TABLAS[0]!.mujeresFutbol);

  // ── Dispersión
  const [nubeId, setNubeId] = useState(NUBES[0]!.id);
  const [puntos, setPuntos] = useState<Punto[]>(NUBES[0]!.puntos);
  const [editada, setEditada] = useState(false);
  const [mostrarRecta, setMostrarRecta] = useState(true);
  const [mostrarProductos, setMostrarProductos] = useState(false);

  // ── Causalidad
  const [vistaCausal, setVistaCausal] = useState<VistaCausal>("aparente");

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Logros pegajosos
  const [creoAsociacion, setCreoAsociacion] = useState(false);
  const [otraIndependiente, setOtraIndependiente] = useState(false);
  const [agregoPunto, setAgregoPunto] = useState(false);
  const [rFuerte, setRFuerte] = useState(false);
  const [rNegativo, setRNegativo] = useState(false);
  const [vioProductos, setVioProductos] = useState(false);
  const [revelo, setRevelo] = useState(false);
  const [controlo, setControlo] = useState(false);
  const [adivino, setAdivino] = useState(false);

  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setAdivino(true);
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
    };
  }, []);

  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const exito = () => {
    if (sonido) audioRef.current?.correcto();
  };

  /* ── Derivados ─────────────────────────────────────────────────────── */
  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const tabla = calcularTabla(hF, mF);
  const tablaActiva = TABLAS.find((t) => t.hombresFutbol === hF && t.mujeresFutbol === mF);
  const nube = nubePorId(nubeId);
  const est = useMemo(() => estadisticos(puntos), [puntos]);

  /* ── Acciones ──────────────────────────────────────────────────────── */
  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
    bump();
  };

  // Contingencia
  const fijarTabla = (h: number, m: number) => {
    setHF(h);
    setMF(m);
    if (Math.abs(h - m) / GRUPO >= 0.3) setCreoAsociacion(true);
    if (h === m && h !== TABLAS[0]!.hombresFutbol) {
      if (!otraIndependiente) exito();
      setOtraIndependiente(true);
    }
  };

  // Dispersión
  const cargarNube = (id: string) => {
    const n = nubePorId(id);
    setNubeId(id);
    setPuntos(n.puntos);
    setEditada(false);
    blip();
  };
  const redondear = (v: number, dec: number) => Math.round(v * 10 ** dec) / 10 ** dec;
  /** Fija los logros con la nube que acaba de quedar. */
  const fijarNube = (ps: Punto[]) => {
    const r = estadisticos(ps).r;
    if (ps.length >= 4 && r !== null && Math.abs(r) >= 0.9) {
      if (!rFuerte) exito();
      setRFuerte(true);
    }
    if (ps.length >= 4 && r !== null && r <= -0.5) setRNegativo(true);
  };
  const agregar = (p: Punto) => {
    if (puntos.length >= MAX_PUNTOS) return;
    const nueva = [...puntos, { x: redondear(p.x, nube.decX), y: redondear(p.y, nube.decY) }];
    setPuntos(nueva);
    setEditada(true);
    setAgregoPunto(true);
    blip();
    fijarNube(nueva);
  };
  const quitar = (i: number) => {
    const nueva = puntos.filter((_, k) => k !== i);
    setPuntos(nueva);
    setEditada(true);
    blip();
    fijarNube(nueva);
  };
  const vaciar = () => {
    setPuntos([]);
    setEditada(true);
    blip();
  };
  const deshacer = () => {
    const nueva = puntos.slice(0, -1);
    setPuntos(nueva);
    setEditada(true);
    blip();
    fijarNube(nueva);
  };
  const alternarProductos = () => {
    const nuevo = !mostrarProductos;
    setMostrarProductos(nuevo);
    if (nuevo) setVioProductos(true);
    blip();
  };

  // Causalidad
  const elegirVista = (v: VistaCausal) => {
    setVistaCausal(v);
    if (v === "oculta") setRevelo(true);
    if (v === "controlada") setControlo(true);
    exito();
  };

  const reiniciar = () => {
    if (modo === "contingencia") {
      setHF(TABLAS[0]!.hombresFutbol);
      setMF(TABLAS[0]!.mujeresFutbol);
    } else if (modo === "dispersion") {
      setPuntos(nube.puntos);
      setEditada(false);
    } else {
      setVistaCausal("aparente");
    }
    bump();
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Crear una asociación: proporciones que difieran 30 puntos o más", done: creoAsociacion },
    { t: "Encontrar otra tabla independiente distinta de la del ejercicio A2", done: otraIndependiente },
    { t: "Agregar un punto a mano en el tablero de dispersión", done: agregoPunto },
    { t: "Construye una nube que baje: r de −0.5 o menos (al menos 4 puntos)", done: rNegativo },
    { t: "Construir una nube con r ≥ 0.9 o r ≤ −0.9 (al menos 4 puntos)", done: rFuerte },
    { t: "Ver los rectángulos de productos que deciden el signo de r", done: vioProductos },
    { t: "Revelar la temperatura como variable oculta", done: revelo },
    { t: "Controlar la temperatura y comparar la correlación por bandas", done: controlo },
    { t: "Adivinar r y ganar al menos una estrella", done: adivino },
    { t: "Aprobar el reto evaluable (ejercicio A2)", done: ejercicioAprobado },
  ];

  /* ── Textos del visor ──────────────────────────────────────────────── */
  const rTxt = est.r === null ? "—" : fmt(est.r);
  const pie: string =
    modo === "contingencia"
      ? tabla.veredicto === "independientes"
        ? `Fútbol: ${pct(tabla.pH)} de los hombres y ${pct(tabla.pM)} de las mujeres. Las proporciones son iguales: las dos fronteras coinciden con el plano de lo esperado. Sexo y deporte son independientes.`
        : `Fútbol: ${pct(tabla.pH)} de los hombres y ${pct(tabla.pM)} de las mujeres, ${Math.round(tabla.diferencia * 100)} puntos de diferencia. ${tabla.veredicto === "asociadas" ? "Las fronteras se alejan del plano de lo esperado: hay asociación." : "La diferencia es pequeña: casi independientes."}`
      : modo === "dispersion"
        ? est.n < 2
          ? "Toca el tablero para agregar puntos. Con dos o más, aparecen r y la recta."
          : `${est.n} puntos · r = ${rTxt}: ${describirR(est.r)}.${mostrarProductos ? ` Productos que suman ${fmt(est.sumaPos, 1)} y que restan ${fmt(est.sumaNeg, 1)}.` : ""}`
        : vistaCausal === "aparente"
          ? `Solo helado y ahogamientos: r = ${fmt(ANALISIS.rHA ?? 0)}. Parece una relación fuerte… ¿el helado provoca ahogamientos?`
          : vistaCausal === "oculta"
            ? `La temperatura separa las semanas en profundidad: las frescas (azules) quedan al frente con poco helado y pocos ahogamientos; las calurosas (rojas), al fondo con mucho de ambos.`
            : `Dentro de semanas con temperatura parecida la relación casi desaparece (r entre ${fmt(Math.min(...ANALISIS.porBanda.map((b) => b.r ?? 0)))} y ${fmt(Math.max(...ANALISIS.porBanda.map((b) => b.r ?? 0)))}). El calor movía a las dos variables.`;

  const chipVivo = modo === "contingencia" ? `fútbol: ${pct(tabla.pH)} vs ${pct(tabla.pM)}` : modo === "dispersion" ? `r = ${rTxt} · n = ${est.n}` : vistaCausal === "controlada" ? `r parcial = ${fmt(ANALISIS.parcial ?? 0)}` : `r = ${fmt(ANALISIS.rHA ?? 0)}`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION}
      </div>
    </div>
  );

  const sub = (txt: string, extra?: ReactNode) => (
    <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>
      {txt}
      {extra}
    </div>
  );

  const chip = (col: string, txt: ReactNode, forma: "cuadro" | "bola" = "cuadro") => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 999, background: "rgba(4,10,22,0.72)", border: `1px solid ${T.line}`, fontSize: 14, fontWeight: 800, color: "#e2e8f0", whiteSpace: "nowrap" }}>
      <span style={{ width: 9, height: 9, borderRadius: forma === "bola" ? "50%" : 3, background: col }} />
      {txt}
    </span>
  );

  /* ── Panel por modo ────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "contingencia") {
    const celda = (obs: number, esp: number, fuerte = false) => (
      <td className="cv-td" style={{ fontWeight: fuerte ? 900 : 800 }}>
        <div style={{ color: "#fff", fontSize: 14 }}>{obs}</div>
        <div style={{ color: T.text3, fontSize: 14 }}>esp. {fmt(esp, esp % 1 === 0 ? 0 : 1)}</div>
      </td>
    );
    const deslizador = (etq: string, v: number, cual: "h" | "m") => (
      <Deslizador
        label={etq}
        icon="fa-person"
        colr={modoCol}
        valor={`${v} fútbol · ${GRUPO - v} básquet.`}
        min={0}
        max={GRUPO}
        step={1}
        value={v}
        onChange={(n) => {
          if (cual === "h") fijarTabla(n, mF);
          else fijarTabla(hF, n);
        }}
      />
    );
    const vCol = tabla.veredicto === "independientes" ? OK : tabla.veredicto === "casi" ? "#fbbf24" : "#f472b6";
    control = (
      <>
        <div className="cv-opts">
          {TABLAS.map((t) => {
            const on = tablaActiva?.id === t.id;
            return (
              <button
                key={t.id}
                className="cv-opt"
                data-on={on}
                onClick={() => {
                  fijarTabla(t.hombresFutbol, t.mujeresFutbol);
                  blip();
                }}
                style={{ ["--cvc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}
              >
                {t.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>{tablaActiva ? tablaActiva.nota : "Tabla elegida con los controles."}</div>

        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {deslizador("Hombres (50)", hF, "h")}
          {deslizador("Mujeres (50)", mF, "m")}
        </div>

        {sub("Observado y esperado si fueran independientes")}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, fontSize: 14, ...NUM }}>
            <thead>
              <tr style={{ color: T.text3, fontSize: 14 }}>
                <th />
                <th style={{ padding: 4 }}>Fútbol</th>
                <th style={{ padding: 4 }}>Básquetbol</th>
                <th style={{ padding: 4 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th style={{ textAlign: "left", color: "#e2e8f0", fontSize: 14, padding: 4 }}>Hombres</th>
                {celda(tabla.hF, tabla.esperadoF)}
                {celda(tabla.hB, tabla.esperadoB)}
                <td className="cv-td" style={{ fontWeight: 900, color: "#fff" }}>{GRUPO}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", color: "#e2e8f0", fontSize: 14, padding: 4 }}>Mujeres</th>
                {celda(tabla.mF, tabla.esperadoF)}
                {celda(tabla.mB, tabla.esperadoB)}
                <td className="cv-td" style={{ fontWeight: 900, color: "#fff" }}>{GRUPO}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", color: T.text3, fontSize: 14, padding: 4 }}>Total</th>
                <td className="cv-td" style={{ fontWeight: 900, color: "#fff" }}>{tabla.totalF}</td>
                <td className="cv-td" style={{ fontWeight: 900, color: "#fff" }}>{tabla.totalB}</td>
                <td className="cv-td" style={{ fontWeight: 900, color: "#fff" }}>{tabla.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: T.text3, lineHeight: 1.5, ...NUM }}>
          Esperado = total de la fila × total de la columna ÷ total general = {GRUPO} × {tabla.totalF} ÷ {tabla.total} = {fmt(tabla.esperadoF, tabla.esperadoF % 1 === 0 ? 0 : 1)}
        </div>

        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, border: `1px solid ${vCol}66`, background: `${vCol}12` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="Hombres · fútbol" value={pct(tabla.pH)} />
            <Dato label="Mujeres · fútbol" value={pct(tabla.pM)} />
            <Dato label="Diferencia" value={`${Math.round(tabla.diferencia * 100)} pts`} col={vCol} />
          </div>
          <div style={{ fontSize: 14, color: vCol, lineHeight: 1.5, textAlign: "center", fontWeight: 800 }}>
            {tabla.veredicto === "independientes"
              ? "Independientes: la proporción que prefiere fútbol es la misma en los dos grupos."
              : tabla.veredicto === "casi"
                ? "Casi independientes: la diferencia entre proporciones es pequeña."
                : "Asociadas: la preferencia cambia mucho según el grupo."}
          </div>
        </div>
      </>
    );
  } else if (modo === "dispersion") {
    control = (
      <>
        <div className="cv-opts">
          {NUBES.map((n) => {
            const on = n.id === nubeId && !editada;
            return (
              <button key={n.id} className="cv-opt" data-on={on} onClick={() => cargarNube(n.id)} style={{ ["--cvc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                {n.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          {editada ? "Nube modificada por ti. Toca el tablero para agregar puntos y toca un punto para quitarlo." : nube.nota}
        </div>

        <div className="cv-opts" style={{ marginTop: 12 }}>
          <button className="cv-opt" data-on={mostrarRecta} onClick={() => setMostrarRecta((v) => !v)} style={{ ["--cvc" as string]: accent, background: mostrarRecta ? `rgba(${color.rgba},0.16)` : "transparent" }}>
            <i className="fa-solid fa-slash" style={{ marginRight: 8, color: accent }} />
            Recta de mínimos cuadrados
          </button>
          <button className="cv-opt" data-on={mostrarProductos} onClick={alternarProductos} style={{ ["--cvc" as string]: "#34d399", background: mostrarProductos ? "rgba(52,211,153,0.14)" : "transparent" }}>
            <i className="fa-solid fa-vector-square" style={{ marginRight: 8, color: "#34d399" }} />
            Rectángulos de productos
          </button>
        </div>
        <div className="cv-opts" style={{ marginTop: 8 }}>
          <button className="cv-opt" data-on={false} onClick={deshacer} disabled={puntos.length === 0} style={{ ["--cvc" as string]: modoCol, opacity: puntos.length === 0 ? 0.45 : 1 }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
            Quitar el último
          </button>
          <button className="cv-opt" data-on={false} onClick={vaciar} disabled={puntos.length === 0} style={{ ["--cvc" as string]: modoCol, opacity: puntos.length === 0 ? 0.45 : 1 }}>
            <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
            Tablero vacío
          </button>
          <span style={{ alignSelf: "center", fontSize: 14, color: T.text3, ...NUM }}>
            {puntos.length}/{MAX_PUNTOS} puntos
          </span>
        </div>

        <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="r" value={rTxt} col={accent} />
            <Dato label="x̄" value={est.n ? fmt(est.mediaX, 2) : "—"} />
            <Dato label="ȳ" value={est.n ? fmt(est.mediaY, 2) : "—"} />
          </div>
          <div style={{ fontSize: 14, color: "#eaf0fb", fontFamily: "ui-monospace, monospace", textAlign: "center", lineHeight: 1.7, ...NUM }}>
            {est.recta ? (
              <>
                y = {fmt(est.recta.a, 2)} {est.recta.b >= 0 ? "+" : "−"} {fmt(Math.abs(est.recta.b), 3)}·x
              </>
            ) : (
              "Hacen falta dos puntos con x distinta para la recta."
            )}
          </div>
          <div style={{ fontSize: 14, color: T.text2, textAlign: "center", lineHeight: 1.5 }}>{est.n >= 2 ? describirR(est.r).replace(/^./, (c) => c.toUpperCase()) : ""}</div>
        </div>

        {est.n >= 2 && (
          <div style={{ marginTop: 12 }}>
            {sub("Balance de productos (x − x̄)(y − ȳ)")}
            {(() => {
              const tot = est.sumaPos - est.sumaNeg || 1;
              return (
                <>
                  <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", border: `1px solid ${T.line}` }}>
                    <div style={{ width: `${(est.sumaPos / tot) * 100}%`, background: "#34d399" }} />
                    <div style={{ width: `${(-est.sumaNeg / tot) * 100}%`, background: "#f87171" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 5, ...NUM }}>
                    <span style={{ color: "#34d399", fontWeight: 800 }}>suman {fmt(est.sumaPos, 2)}</span>
                    <span style={{ color: T.text2 }}>Σ = {fmt(est.sxy, 2)}</span>
                    <span style={{ color: "#f87171", fontWeight: 800 }}>restan {fmt(est.sumaNeg, 2)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, marginTop: 6, fontFamily: "ui-monospace, monospace", ...NUM }}>
                    r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)² · Σ(y − ȳ)²] = {fmt(est.sxy, 2)} / √({fmt(est.sxx, 2)} × {fmt(est.syy, 2)}) = {rTxt}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </>
    );
  } else {
    const vistas: { v: VistaCausal; etq: string; icono: string }[] = [
      { v: "aparente", etq: "Lo que se ve", icono: "fa-eye" },
      { v: "oculta", etq: "Revelar la temperatura", icono: "fa-temperature-high" },
      { v: "controlada", etq: "Controlar la temperatura", icono: "fa-layer-group" },
    ];
    control = (
      <>
        <div className="cv-pasos">
          {vistas.map((x) => (
            <button key={x.v} className="cv-opt" data-on={vistaCausal === x.v} onClick={() => elegirVista(x.v)} style={{ ["--cvc" as string]: accent, background: vistaCausal === x.v ? `rgba(${color.rgba},0.18)` : "transparent" }}>
              <i className={`fa-solid ${x.icono}`} style={{ marginRight: 7, color: accent }} />
              {x.etq}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          52 semanas ilustrativas generadas por el laboratorio: el helado y los ahogamientos dependen solo de la temperatura, cada uno con su propia variación al azar.
        </div>

        {sub("Correlaciones entre las tres variables")}
        <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="Helado · ahogam." value={fmt(ANALISIS.rHA ?? 0)} col={vistaCausal === "aparente" ? accent : undefined} />
            <Dato label="Temp. · helado" value={vistaCausal === "aparente" ? "?" : fmt(ANALISIS.rTH ?? 0)} />
            <Dato label="Temp. · ahogam." value={vistaCausal === "aparente" ? "?" : fmt(ANALISIS.rTA ?? 0)} />
          </div>
          {vistaCausal !== "aparente" && (
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, textAlign: "center" }}>
              La temperatura se relaciona con las dos variables todavía más fuerte que ellas entre sí.
            </div>
          )}
        </div>

        {vistaCausal === "controlada" && (
          <>
            {sub("Dentro de cada banda de temperatura")}
            <div style={{ display: "grid", gap: 6 }}>
              {ANALISIS.porBanda.map(({ banda, n, r }) => (
                <div key={banda.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 9, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}`, ...NUM }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: banda.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: T.text2 }}>{banda.etq}</span>
                  <span style={{ fontSize: 14, color: T.text3 }}>{n} semanas</span>
                  <span style={{ fontSize: 14, color: "#fff", fontWeight: 900, minWidth: 64, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>r = {r === null ? "—" : fmt(r)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", fontSize: 14, color: T.text2, lineHeight: 1.6, ...NUM }}>
              <strong style={{ color: OK }}>Correlación parcial = {fmt(ANALISIS.parcial ?? 0)}.</strong> Es la correlación entre helado y ahogamientos una vez descontada la temperatura: (r<sub>HA</sub> − r<sub>TH</sub>·r<sub>TA</sub>) / √[(1 − r<sub>TH</sub>²)(1 − r<sub>TA</sub>²)]. Pasa de {fmt(ANALISIS.rHA ?? 0)} a casi cero: el helado no causa ahogamientos.
            </div>
          </>
        )}
      </>
    );
  }

  const CSS_CV = `
        .cv-opts { display:flex; flex-wrap:wrap; gap:8px; }
        .cv-pasos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
        .cv-opt { cursor:pointer; border:1px solid var(--cvc); border-radius:10px; padding:10px 12px; font-size:14px;
          font-weight:800; color:#fff; background:transparent; transition:all .15s; text-align:left; }
        .cv-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.7); }
        .cv-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cv-opt:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .cv-td { padding:6px; text-align:center; border-radius:6px; background:rgba(4,10,22,0.45); color:${T.text2}; }
`;

  const leyendaEscena: ReactNode =
    modo === "contingencia" ? (
      <>
        {chip("#e2e8f0", "Fútbol", "bola")}
        {chip("#fb923c", "Básquetbol", "bola")}
        {chip(accent, "Plano de lo esperado")}
      </>
    ) : modo === "dispersion" ? (
      <>
        {chip("#7dd3fc", "Toca el tablero: agrega · toca un punto: quita", "bola")}
        {mostrarProductos && chip("#34d399", "Suma a r")}
        {mostrarProductos && chip("#f87171", "Resta a r")}
      </>
    ) : vistaCausal !== "aparente" ? (
      <>
        {chip("#60a5fa", "Semanas frescas", "bola")}
        {chip("#f87171", "Semanas calurosas", "bola")}
      </>
    ) : undefined;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <CorrelacionScene
            modo={modo}
            hombresFutbol={hF}
            mujeresFutbol={mF}
            puntos={puntos}
            rangoX={nube.rangoX}
            rangoY={nube.rangoY}
            ejeX={nube.ejeX}
            ejeY={nube.ejeY}
            mostrarRecta={mostrarRecta}
            mostrarProductos={mostrarProductos}
            onAgregar={agregar}
            onQuitar={quitar}
            semanas={SEMANAS}
            vistaCausal={vistaCausal}
            accent={accent}
            modoColor={modoCol}
            resetNonce={resetNonce}
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
      leyenda={leyendaEscena}
      lectura={chipVivo}
      objetivos={objetivos.map((o) => ({ txt: o.t, done: o.done }))}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{`${CSS_CV}`}</style>
              <Bloque titulo={def.etq} icono={def.icono}>
                {control}
              </Bloque>
              <Bloque titulo="Qué estás viendo" icono="fa-eye">
                <div style={{ color: T.text2 }}>{pie}</div>
                <div style={{ fontSize: 14, color: T.text3 }}>{def.subtitulo} · {def.fuente === "A2" ? "ejercicio A2" : "lectura A1"}</div>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <div style={{ display: "grid", gap: 16 }}>
              <AdivinaRCard
                accent={accent}
                rgba={color.rgba}
                mejor={mejorEstrellas}
                onResultado={registraEstrellas}
                playSfx={(ok) => {
                  if (!sonido) return;
                  if (ok) audioRef.current?.correcto();
                  else audioRef.current?.incorrecto();
                }}
              />
              <RetoQuizCard
                quiz={QUIZ_A2}
                accent={accent}
                rgba={color.rgba}
                aprobado={ejercicioAprobado}
                onAprobado={() => setEjercicioAprobado(true)}
                playSfx={
                  sonido
                    ? (ok) => {
                        if (ok) audioRef.current?.correcto();
                        else audioRef.current?.incorrecto();
                      }
                    : undefined
                }
                mensajeAprobado="Sabes distinguir independencia, correlación y causalidad."
              />
            </div>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="¿Están relacionadas?" icono="fa-chart-line">
                <div style={{ color: T.text2 }}>{PROBLEMA}</div>
              </Bloque>
              <Bloque titulo="Lectura A1 — Independencia y correlación" icono="fa-book-open">
                {LECTURA_A1.map((p, i) => (
                  <div key={i} style={{ color: T.text2 }}>
                    {p}
                  </div>
                ))}
                <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR</div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {INSTRUCCIONES.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </Bloque>
              <Bloque titulo="Datos clave" icono="fa-magnifying-glass-chart">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere" }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="El helado no causa ahogamientos" icono="fa-ice-cream">
                <div style={{ color: T.text2 }}>{CONTEXTO}</div>
              </Bloque>
              <Bloque titulo="¿Sabías que? (quiz A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                {GLOSARIO.map((gi, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                    <span style={{ color: T.text2 }}>{gi.definicion}</span>
                    <div style={{ color: T.text3, marginTop: 4 }}>
                      <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />
                      {gi.ejemplo}
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CORRELACION_VARIABLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                La lectura A1, las preguntas de reflexión, los hechos del quiz A4, el glosario A5 y el ejercicio A2 son <strong>verbatim</strong> del MCCEMS 2025. La encuesta y los cinco puntos de estudio y calificación son los del
                ejercicio A2; las nubes de TV, pulso y número de calzado, y las 52 semanas de helado y ahogamientos, son <strong>datos ilustrativos</strong> generados por el laboratorio con semilla fija, no estadísticas reales. El
                coeficiente r, la recta y la correlación parcial se calculan con los puntos que hay en pantalla. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
