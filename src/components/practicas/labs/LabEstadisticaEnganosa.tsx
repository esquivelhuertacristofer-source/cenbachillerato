"use client";

/**
 * Laboratorio 3D — "Estadísticas que engañan".
 * Práctica experimental anclada a PM-VI-P08-A2 (quiz verdadero/falso «Lectura
 * crítica de estadísticas en medios y contextos sociales»; progresión 8 de la
 * UAC PM-VI "Pensamiento Matemático VI"). El marco teórico es la infografía
 * A1, los hechos salen del quiz A4 y el glosario del A5.
 *
 * Tres modos y ocho vistas, una por truco:
 *  (1) Gráficas que engañan — eje truncado, íconos escalados en 3D y escala
 *      logarítmica.
 *  (2) ¿Cuánto cambió? — puntos porcentuales contra porcentaje de cambio,
 *      riesgo relativo contra absoluto y porcentajes de bases distintas.
 *  (3) ¿Qué tan típico? — media contra mediana en ingresos sesgados y margen
 *      de error de una encuesta electoral.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { ESTADISTICA_ENGANOSA_FICHA } from "./estadistica-enganosa-ficha";
import {
  type Modo,
  type Vista,
  type Escalado,
  type CasoCambio,
  MODOS,
  MODOS_DEF,
  VISTAS_DEF,
  CASOS_BARRAS,
  leerBarras,
  ejeMaximo,
  CASOS_VOLUMEN,
  razonIcono,
  CURVAS,
  DIAS,
  casos,
  CASOS_PUNTOS,
  cambios,
  CASOS_RIESGO,
  leerRiesgo,
  pctFino,
  BASES,
  aumento,
  PCT_SEGURIDAD_MAX,
  PCT_IGUALA,
  NOTA_BASES,
  hogares,
  media,
  mediana,
  parteDecilSuperior,
  RICO_1,
  RICO_MIN,
  RICO_MAX,
  ENCUESTA,
  TAMANOS_ENCUESTA,
  margenPuntos,
  empateTecnico,
  N_ROMPE_EMPATE,
  casoCambioAleatorio,
  estrellasPorIntentos,
  num,
  conSigno,
  TITULO_A1,
  PUNTOS_CLAVE,
  CONTEXTO_A1,
  PREGUNTAS,
  ACTIVIDAD_A1,
  HECHOS,
  GLOSARIO,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
} from "./estadistica-enganosa-data";

const EnganosaScene = dynamic(() => import("./EstadisticaEnganosaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-magnifying-glass-chart fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando las gráficas en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-estadistica-enganosa-reto";
const SUBE = "#34d399";
const BAJA = "#f87171";

/** Lee un número escrito por el alumno: acepta coma decimal, signo menos tipográfico y «%». */
function leerNumero(txt: string): number | null {
  const limpio = txt.replace(/[−–]/g, "-").replace(",", ".").replace(/[%\s]/g, "");
  if (limpio === "" || limpio === "-" || limpio === "+") return null;
  const v = Number(limpio);
  return Number.isFinite(v) ? v : null;
}

/* ── Tarjeta de estrellas: calcula los dos cambios ────────────────────── */
function CambiosCard({
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
  const [caso, setCaso] = useState<CasoCambio>({ tema: "La tasa de interés de un crédito", a: 12.5, b: 15 });
  const [pts, setPts] = useState("");
  const [pct, setPct] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const real = cambios(caso.a, caso.b);

  const comprobar = () => {
    if (resuelto !== null) return;
    const p = leerNumero(pts);
    const c = leerNumero(pct);
    if (p === null || c === null) {
      setAviso("Escribe los dos números (usa el signo menos si bajó).");
      return;
    }
    const k = intentos + 1;
    setIntentos(k);
    const okP = Math.abs(p - real.puntos) <= 0.05;
    const okC = Math.abs(c - real.porcentaje) <= 0.5;
    if (okP && okC) {
      const est = estrellasPorIntentos(k);
      setResuelto(est);
      setAviso(null);
      playSfx?.(true);
      onResultado(est);
    } else {
      playSfx?.(false);
      setAviso(
        !okP && !okC
          ? "Los dos valores están fuera. Puntos: b − a. Porcentaje: (b − a) ÷ a × 100."
          : !okP
            ? "El porcentaje va bien; revisa los puntos: es la resta b − a, sin dividir."
            : "Los puntos van bien; revisa el porcentaje: divide la diferencia entre el valor de antes.",
      );
    }
  };
  const otro = () => {
    setCaso(casoCambioAleatorio());
    setPts("");
    setPct("");
    setIntentos(0);
    setResuelto(null);
    setAviso(null);
  };

  const campo = (etq: string, val: string, set: (v: string) => void, unidad: string) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 160px", minWidth: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.04em" }}>{etq}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          aria-label={etq}
          inputMode="decimal"
          value={val}
          disabled={resuelto !== null}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") comprobar();
          }}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "rgba(4,10,22,0.6)", color: "#fff", fontSize: 15, fontWeight: 800, ...NUM }}
        />
        <span style={{ fontSize: 14, color: T.text2, fontWeight: 800, whiteSpace: "nowrap" }}>{unidad}</span>
      </span>
    </label>
  );

  return (
    <div style={{ ...card, padding: "14px", marginTop: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Calcula los dos cambios del titular
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.5, marginBottom: 14, ...NUM }}>
        {caso.tema} pasó de {num(caso.a, Number.isInteger(caso.a) ? 0 : 1)} % a {num(caso.b, Number.isInteger(caso.b) ? 0 : 1)} %.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {campo("¿Cuántos puntos porcentuales cambió?", pts, setPts, "puntos")}
        {campo("¿Qué porcentaje de cambio fue?", pct, setPct, "%")}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        {resuelto === null ? (
          <button onClick={comprobar} style={{ cursor: "pointer", padding: "10px 16px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
            <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
            Comprobar cambios
          </button>
        ) : (
          <button onClick={otro} style={{ cursor: "pointer", padding: "10px 16px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
            <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
            Otro titular
          </button>
        )}
      </div>
      {aviso && (
        <div style={{ marginTop: 12, fontSize: 14, color: "#FF8A3C", lineHeight: 1.5 }}>
          <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
          {aviso} {intentos > 0 ? `Intento ${intentos}.` : ""}
        </div>
      )}
      {resuelto !== null && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 14, fontWeight: 900, color: OK, marginLeft: 4 }}>{intentos === 1 ? "Al primer intento" : `En ${intentos} intentos`}</span>
          </div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, fontFamily: "ui-monospace, monospace", ...NUM }}>
            {num(caso.b, 1)} − {num(caso.a, 1)} = {conSigno(real.puntos, 1)} puntos · {conSigno(real.puntos, 1)} ÷ {num(caso.a, 1)} = {conSigno(real.porcentaje, 1)} %
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabEstadisticaEnganosa({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("graficas");
  const [vistaPorModo, setVistaPorModo] = useState<Record<Modo, Vista>>({ graficas: "truncado", cambios: "puntos", tipico: "mediana" });
  const vista = vistaPorModo[modo];

  // Gráficas
  const [casoBarrasId, setCasoBarrasId] = useState(CASOS_BARRAS[0]!.id);
  const casoBarras = CASOS_BARRAS.find((c) => c.id === casoBarrasId)!;
  const [ejeMin, setEjeMin] = useState(CASOS_BARRAS[0]!.ejeTruncado);
  const [casoVolId, setCasoVolId] = useState(CASOS_VOLUMEN[0]!.id);
  const casoVolumen = CASOS_VOLUMEN.find((c) => c.id === casoVolId)!;
  const [escalado, setEscalado] = useState<Escalado>("alto");
  const [log, setLog] = useState(false);
  // Cambios
  const [casoPuntosId, setCasoPuntosId] = useState(CASOS_PUNTOS[0]!.id);
  const casoPuntos = CASOS_PUNTOS.find((c) => c.id === casoPuntosId)!;
  const [casoRiesgoId, setCasoRiesgoId] = useState(CASOS_RIESGO[0]!.id);
  const casoRiesgo = CASOS_RIESGO.find((c) => c.id === casoRiesgoId)!;
  const [pctSeguridad, setPctSeguridad] = useState(BASES.seguridad.pct);
  // Típico
  const [ricoMayor, setRicoMayor] = useState(RICO_1);
  const [nEncuesta, setNEncuesta] = useState(1000);

  // Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Logros pegajosos
  const [movioEje, setMovioEje] = useState(false);
  const [ejeACero, setEjeACero] = useState(false);
  const [vioVolumen, setVioVolumen] = useState(false);
  const [vioLog, setVioLog] = useState(false);
  const [puntosVistos, setPuntosVistos] = useState<Set<string>>(() => new Set([CASOS_PUNTOS[0]!.id]));
  const [riesgosVistos, setRiesgosVistos] = useState<Set<string>>(() => new Set([CASOS_RIESGO[0]!.id]));
  const [igualoBases, setIgualoBases] = useState(false);
  const [movioRico, setMovioRico] = useState(false);
  const [rompioEmpate, setRompioEmpate] = useState(false);
  const [calculo, setCalculo] = useState(false);

  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setCalculo(true);
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

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Acciones ──────────────────────────────────────────────────────── */
  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const cambiarVista = (v: Vista) => {
    setVistaPorModo((prev) => ({ ...prev, [modo]: v }));
    blip();
  };
  const elegirCasoBarras = (id: string) => {
    const c = CASOS_BARRAS.find((x) => x.id === id)!;
    setCasoBarrasId(id);
    setEjeMin(c.ejeTruncado);
    blip();
  };
  const ponerEje = (v: number) => {
    if (v !== ejeMin) setMovioEje(true);
    setEjeMin(v);
    if (v === 0) setEjeACero(true);
  };
  const elegirEscalado = (e: Escalado) => {
    setEscalado(e);
    if (e === "tres") setVioVolumen(true);
    blip();
  };
  const elegirLog = (v: boolean) => {
    setLog(v);
    if (v) setVioLog(true);
    blip();
  };
  const elegirPuntos = (id: string) => {
    setCasoPuntosId(id);
    setPuntosVistos((s) => new Set(s).add(id));
    blip();
  };
  const elegirRiesgo = (id: string) => {
    setCasoRiesgoId(id);
    setRiesgosVistos((s) => new Set(s).add(id));
    blip();
  };
  const moverSeguridad = (v: number) => {
    setPctSeguridad(v);
    if (Math.abs(v - PCT_IGUALA) < 1e-9) setIgualoBases(true);
  };
  const moverRico = (v: number) => {
    setRicoMayor(v);
    if (Math.abs(v - RICO_1) >= 20_000) setMovioRico(true);
  };
  const elegirN = (n: number) => {
    setNEncuesta(n);
    if (!empateTecnico(n)) setRompioEmpate(true);
    blip();
  };
  const reiniciar = () => {
    if (vista === "truncado") setEjeMin(casoBarras.ejeTruncado);
    if (vista === "volumen") setEscalado("alto");
    if (vista === "log") setLog(false);
    if (vista === "bases") setPctSeguridad(BASES.seguridad.pct);
    if (vista === "mediana") setRicoMayor(RICO_1);
    if (vista === "margen") setNEncuesta(1000);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Arrastra el deslizador del eje y mira cómo cambia la altura de las barras", done: movioEje },
    { t: "Llevar el eje de una gráfica truncada a cero", done: ejeACero },
    { t: "Escalar un ícono en sus tres dimensiones", done: vioVolumen },
    { t: "Pasar las curvas a escala logarítmica", done: vioLog },
    { t: "Comparar puntos y porcentaje en dos titulares", done: puntosVistos.size >= 2 },
    { t: "Comparar riesgo relativo y absoluto en dos casos", done: riesgosVistos.size >= 2 },
    { t: `Igualar en pesos el aumento de salud (${num(PCT_IGUALA)} % de seguridad)`, done: igualoBases },
    { t: "Mover al hogar más rico y ver que la mediana no cambia", done: movioRico },
    { t: "Romper el empate técnico con una encuesta más grande", done: rompioEmpate },
    { t: "Calcular los dos cambios de un titular y ganar estrellas", done: calculo },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
  ];

  /* ── Lecturas de la vista actual ───────────────────────────────────── */
  const lb = leerBarras(casoBarras, ejeMin);
  const iv = razonIcono(casoVolumen, escalado);
  const cp = cambios(casoPuntos.a, casoPuntos.b);
  const decP = Number.isInteger(casoPuntos.a) && Number.isInteger(casoPuntos.b) ? 0 : 1;
  const lr = leerRiesgo(casoRiesgo);
  const aSalud = aumento(BASES.salud.base, BASES.salud.pct);
  const aSeg = aumento(BASES.seguridad.base, pctSeguridad);
  const hs = hogares(ricoMayor);
  const med = media(hs);
  const mdn = mediana(hs);
  const bajoMedia = hs.filter((v) => v < med).length;
  const top10 = parteDecilSuperior(hs);
  const me = margenPuntos(nEncuesta);
  const empate = empateTecnico(nEncuesta);
  const uP = casoPuntos.unidad === "%" ? " %" : "";

  let chipVivo = "";
  let pie = "";
  let leyenda: [string, string][] = [];
  switch (vista) {
    case "truncado":
      chipVivo = `se ve ×${num(lb.razonVisual, 2)} · real ${conSigno(lb.cambioReal, 1)} %`;
      pie =
        ejeMin > 0
          ? `Con el eje desde ${num(ejeMin, casoBarras.dec)} la barra de «${casoBarras.b.etq}» mide ${num(lb.razonVisual, 2)} veces la otra, pero el valor solo cambió ${conSigno(lb.cambioReal, 1)} %.`
          : `Con el eje desde cero, la altura cuenta la verdad: ${conSigno(lb.cambioReal, 1)} %.`;
      leyenda = [
        ["#64748b", casoBarras.a.etq],
        [modoCol, casoBarras.b.etq],
        ...(ejeMin > 0 ? ([[BAJA, "Eje cortado"]] as [string, string][]) : []),
      ];
      break;
    case "volumen":
      chipVivo = `dato ×${num(iv.razonDato, 2)} · volumen ×${num(iv.razonVisible, iv.razonVisible < 10 ? 2 : 0)}`;
      pie =
        escalado === "tres"
          ? `El dato creció ${num(iv.razonDato, 2)} veces, pero al escalar el ícono a lo alto, a lo ancho y a lo hondo su volumen crece ${num(iv.razonVisible, iv.razonVisible < 10 ? 2 : 0)} veces.`
          : `Solo la altura crece: el ícono mide ${num(iv.razonDato, 2)} veces lo que el otro, igual que el dato.`;
      leyenda = [["#fbbf24", "Mismo dato, dos dibujos"]];
      break;
    case "log":
      chipVivo = log ? "escala logarítmica" : "escala lineal";
      pie = log
        ? "En escala logarítmica las dos curvas son rectas: crecen de forma exponencial, y la más inclinada crece más rápido."
        : `En escala lineal las curvas parecen planas durante semanas y luego se disparan hasta ${num(casos(CURVAS[0], DIAS))} casos.`;
      leyenda = CURVAS.map((c) => [c.color, c.etq]);
      break;
    case "puntos":
      chipVivo = `${conSigno(cp.puntos, decP)} puntos · ${conSigno(cp.porcentaje, 1)} %`;
      pie = `De ${num(casoPuntos.a, decP)}${uP} a ${num(casoPuntos.b, decP)}${uP}: ${conSigno(cp.puntos, decP)} ${casoPuntos.diferencia}, que son ${conSigno(cp.porcentaje, 1)} % respecto al valor de antes. Las dos cifras son ciertas.`;
      leyenda = [
        ["#64748b", "Antes"],
        [modoCol, "Después"],
        [cp.puntos >= 0 ? SUBE : BAJA, "Cambio"],
      ];
      break;
    case "riesgo":
      chipVivo = `relativo ${conSigno(lr.relativo, 0)} % · absoluto ${lr.absolutoPuntos >= 0 ? "+" : "−"}${pctFino(Math.abs(lr.absolutoPuntos) / 100).replace(" %", "")} pts`;
      pie = `El riesgo ${lr.relativo > 0 ? "sube" : "baja"} ${num(Math.abs(lr.relativo))} % en términos relativos, pero en ${num(lr.personas)} personas pasa de ${num(lr.casosAntes)} a ${num(lr.casosDespues)} ${lr.casosDespues === 1 ? "caso" : "casos"}.`;
      leyenda = [
        [BAJA, "Caso antes"],
        [modoCol, "Caso después"],
      ];
      break;
    case "bases":
      chipVivo = `salud +$${num(aSalud)} M · seguridad +$${num(aSeg)} M`;
      pie =
        Math.abs(aSeg - aSalud) < 1e-6
          ? `Con ${num(pctSeguridad, 1)} % sobre $400,000 millones, seguridad sube lo mismo que salud con 20 %: $20,000 millones.`
          : `Salud sube 20 % y seguridad ${num(pctSeguridad, 1)} %, pero en pesos son $${num(aSalud)} M contra $${num(aSeg)} M.`;
      leyenda = [
        [BASES.salud.color, "Salud"],
        [BASES.seguridad.color, "Seguridad"],
        ["#fbbf24", "Aumento · bloque = $10,000 M"],
      ];
      break;
    case "mediana":
      chipVivo = `media $${num(med)} · mediana $${num(mdn)}`;
      pie = `${bajoMedia} de 20 hogares ganan menos que la media. El 10 % más rico concentra el ${num(top10 * 100, 1)} % del ingreso; la mediana, $${num(mdn)}, describe mejor al hogar típico.`;
      leyenda = [
        ["#fbbf24", "10 % más rico"],
        ["#64748b", "Bajo la media"],
        [accent, "Media"],
        [modoCol, "Mediana"],
      ];
      break;
    case "margen":
      chipVivo = `n = ${num(nEncuesta)} · ±${num(me, 1)} puntos`;
      pie = empate
        ? `A va entre ${num(ENCUESTA.a - me, 1)} % y ${num(ENCUESTA.a + me, 1)} %; B, entre ${num(ENCUESTA.b - me, 1)} % y ${num(ENCUESTA.b + me, 1)} %. Los rangos se tocan: empate técnico.`
        : `Con ±${num(me, 1)} puntos los intervalos ya no se tocan: la ventaja de A es mayor que el error de la encuesta.`;
      leyenda = [
        ["#f472b6", "Candidato A"],
        ["#60a5fa", "Candidato B"],
        [BAJA, "Zona de empate"],
      ];
      break;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${VISTAS_DEF[vista].icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{VISTAS_DEF[vista].etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los cálculos siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;

  const chip = (col: string, txt: ReactNode) => (
    <span key={String(txt)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 999, background: "rgba(4,10,22,0.72)", border: `1px solid ${T.line}`, fontSize: 14, fontWeight: 800, color: "#e2e8f0", whiteSpace: "nowrap" }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, background: col }} />
      {txt}
    </span>
  );

  const opciones = (lista: { id: string; etq: string }[], actual: string, destino: "barras" | "volumen" | "puntos" | "riesgo") => (
    <div className="ee-opts">
      {lista.map((c) => (
        <button
          key={c.id}
          className="ee-opt"
          data-on={c.id === actual}
          onClick={() => (destino === "barras" ? elegirCasoBarras(c.id) : destino === "volumen" ? setCasoVolId(c.id) : destino === "puntos" ? elegirPuntos(c.id) : elegirRiesgo(c.id))}
          style={{ ["--eec" as string]: modoCol, background: c.id === actual ? `${modoCol}1f` : "transparent" }}
        >
          {c.etq}
        </button>
      ))}
    </div>
  );

  const alterna = (items: { etq: string; on: boolean; icono: string }[], destino: "escalado" | "log") => (
    <div className="ee-opts">
      {items.map((it, i) => (
        <button
          key={it.etq}
          className="ee-opt"
          data-on={it.on}
          onClick={() => (destino === "escalado" ? elegirEscalado(i === 0 ? "alto" : "tres") : elegirLog(i === 1))}
          style={{ ["--eec" as string]: modoCol, background: it.on ? `${modoCol}1f` : "transparent" }}
        >
          <i className={`fa-solid ${it.icono}`} style={{ marginRight: 8, color: modoCol }} />
          {it.etq}
        </button>
      ))}
    </div>
  );

  const titular = (txt: string, fuente: string) => (
    <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 11, border: `1px dashed ${modoCol}77`, background: "rgba(4,10,22,0.45)", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <i className="fa-solid fa-newspaper" style={{ color: modoCol, marginTop: 3 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontStyle: "italic" }}>{txt}</div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 3 }}>Titular de ejemplo · datos: {fuente}</div>
      </div>
    </div>
  );

  const lecturas = (children: ReactNode, nota?: ReactNode) => (
    <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>{children}</div>
      {nota && <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, textAlign: "center" }}>{nota}</div>}
    </div>
  );

  const deslizador = (etq: string, valor: number, min: number, max: number, paso: number, onCambio: (v: number) => void, fmt: string) => (
    <div style={{ marginTop: 12 }}>
      <Deslizador label={etq} colr={modoCol} valor={fmt} min={min} max={max} step={paso} value={valor} onChange={onCambio} />
    </div>
  );

  /* ── Panel de la vista ─────────────────────────────────────────────── */
  let control: ReactNode = null;
  switch (vista) {
    case "truncado": {
      const maxEje = ejeMaximo(casoBarras);
      control = (
        <>
          {sub("Gráfica")}
          {opciones(CASOS_BARRAS, casoBarrasId, "barras")}
          {titular(casoBarras.titular, casoBarras.fuente)}
          {deslizador(
            "Dónde empieza el eje",
            ejeMin,
            0,
            maxEje,
            maxEje / 200,
            (v) => ponerEje(v <= maxEje / 200 ? 0 : v),
            `${casoBarras.prefijo ?? ""}${num(ejeMin, ejeMin > 0 && casoBarras.dec === 0 ? 0 : casoBarras.dec + (ejeMin > 0 ? 1 : 0))}`,
          )}
          <div className="ee-opts" style={{ marginTop: 10 }}>
            <button className="ee-opt" data-on={ejeMin === 0} onClick={() => ponerEje(0)} style={{ ["--eec" as string]: SUBE, background: ejeMin === 0 ? `${SUBE}1f` : "transparent" }}>
              <i className="fa-solid fa-arrow-down-long" style={{ marginRight: 8, color: SUBE }} />
              Eje desde cero
            </button>
            <button className="ee-opt" data-on={ejeMin === casoBarras.ejeTruncado} onClick={() => ponerEje(casoBarras.ejeTruncado)} style={{ ["--eec" as string]: BAJA, background: ejeMin === casoBarras.ejeTruncado ? `${BAJA}1f` : "transparent" }}>
              <i className="fa-solid fa-scissors" style={{ marginRight: 8, color: BAJA }} />
              Eje del titular ({casoBarras.prefijo ?? ""}
              {num(casoBarras.ejeTruncado, casoBarras.dec)})
            </button>
          </div>
          {lecturas(
            <>
              <Dato label="Cambio real" value={`${conSigno(lb.cambioReal, 1)} %`} col={accent} />
              <Dato label="Altura B ÷ A" value={`×${num(lb.razonVisual, 2)}`} />
              <Dato label="Exageración" value={`×${num(lb.exageracion, 1)}`} col={lb.exageracion > 1.5 ? BAJA : SUBE} />
            </>,
            <>
              Cambio real = ({num(casoBarras.b.v, casoBarras.dec)} − {num(casoBarras.a.v, casoBarras.dec)}) ÷ {num(casoBarras.a.v, casoBarras.dec)}. La altura solo cuenta la verdad si el eje empieza en cero.
            </>,
          )}
          {casoBarras.id === "pib" && ejeMin === casoBarras.ejeTruncado && (
            <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
              <i className="fa-solid fa-ruler" style={{ marginRight: 6, color: modoCol }} />
              La infografía dice que la barra final «parece el doble de alta»; medida con el eje desde $9,700 mide 5 veces la inicial.
            </div>
          )}
        </>
      );
      break;
    }
    case "volumen":
      control = (
        <>
          {sub("Dato")}
          {opciones(CASOS_VOLUMEN, casoVolId, "volumen")}
          {sub("Cómo se dibuja el ícono más grande")}
          {alterna(
            [
              { etq: "Solo más alto", on: escalado === "alto", icono: "fa-up-down" },
              { etq: "En sus 3 dimensiones", on: escalado === "tres", icono: "fa-cube" },
            ],
            "escalado",
          )}
          {lecturas(
            <>
              <Dato label="El dato creció" value={`×${num(iv.razonDato, 2)}`} col={accent} />
              <Dato label="Lo que se ve" value={`×${num(iv.razonVisible, iv.razonVisible < 10 ? 2 : 0)}`} col={escalado === "tres" && iv.razonDato > 1.2 ? BAJA : undefined} />
            </>,
            escalado === "tres" ? `Lado ×${num(iv.razonDato, 2)} → volumen ×${num(iv.razonDato, 2)}³ = ×${num(iv.razonVisible, iv.razonVisible < 10 ? 2 : 0)}.` : "Crecer solo a lo alto conserva la proporción del dato.",
          )}
        </>
      );
      break;
    case "log":
      control = (
        <>
          {sub("Escala del eje vertical")}
          {alterna(
            [
              { etq: "Lineal", on: !log, icono: "fa-grip-lines" },
              { etq: "Logarítmica", on: log, icono: "fa-chart-line" },
            ],
            "log",
          )}
          {lecturas(
            <>
              {CURVAS.map((c) => (
                <Dato key={c.id} label={`${c.etq.split(":")[0]} · día ${DIAS}`} value={num(casos(c, DIAS))} col={c.color} />
              ))}
            </>,
            log ? "Cada marca vale 10 veces la anterior. Una recta en escala logarítmica es crecimiento exponencial, no lineal." : "Cada marca suma 50 000. Aquí no se distingue qué país crecía más rápido en las primeras semanas.",
          )}
          <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
            <i className="fa-solid fa-tag" style={{ marginRight: 6, color: modoCol }} />
            La escala logarítmica no engaña por sí misma: engaña cuando no se etiqueta.
          </div>
        </>
      );
      break;
    case "puntos":
      control = (
        <>
          {sub("Titular")}
          {opciones(CASOS_PUNTOS, casoPuntosId, "puntos")}
          {titular(casoPuntos.titular, casoPuntos.fuente)}
          {lecturas(
            <>
              <Dato label="Diferencia" value={`${conSigno(cp.puntos, decP)}${casoPuntos.unidad === "%" ? " pts" : ""}`} col={accent} />
              <Dato label="Porcentaje de cambio" value={`${conSigno(cp.porcentaje, 1)} %`} />
            </>,
            <span style={{ fontFamily: "ui-monospace, monospace" }}>
              {num(casoPuntos.b, decP)} − {num(casoPuntos.a, decP)} = {conSigno(cp.puntos, decP)} · {conSigno(cp.puntos, decP)} ÷ {num(casoPuntos.a, decP)} = {conSigno(cp.porcentaje, 1)} %
            </span>,
          )}
          {casoPuntos.id === "homicidios" && (
            <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 6, color: modoCol }} />
              Esta tasa no es un porcentaje: la diferencia se mide en homicidios por cada 100 000 habitantes. Es el caso de la actividad de la infografía A1.
            </div>
          )}
        </>
      );
      break;
    case "riesgo":
      control = (
        <>
          {sub("Caso")}
          {opciones(CASOS_RIESGO, casoRiesgoId, "riesgo")}
          {titular(casoRiesgo.titular, casoRiesgo.fuente)}
          {lecturas(
            <>
              <Dato label="Riesgo relativo" value={`${conSigno(lr.relativo, 0)} %`} col={accent} />
              <Dato label="Antes" value={pctFino(casoRiesgo.antes)} />
              <Dato label="Después" value={pctFino(casoRiesgo.despues)} />
            </>,
            `Riesgo absoluto: ${pctFino(casoRiesgo.antes)} → ${pctFino(casoRiesgo.despues)}, una diferencia de ${num(Math.abs(lr.casosDespues - lr.casosAntes))} ${Math.abs(lr.casosDespues - lr.casosAntes) === 1 ? "caso" : "casos"} por cada ${num(lr.personas)} personas.`,
          )}
        </>
      );
      break;
    case "bases":
      control = (
        <>
          {titular("«Salud aumentó 20 % y seguridad solo 3 %»", "Infografía A1")}
          {deslizador("Aumento del presupuesto de seguridad", pctSeguridad, 0, PCT_SEGURIDAD_MAX, 0.5, moverSeguridad, `${num(pctSeguridad, 1)} %`)}
          {lecturas(
            <>
              <Dato label="Salud +20 %" value={`$${num(aSalud)} M`} col={BASES.salud.color} />
              <Dato label={`Seguridad +${num(pctSeguridad, 1)} %`} value={`$${num(aSeg)} M`} col={BASES.seguridad.color} />
            </>,
            <span style={{ fontFamily: "ui-monospace, monospace" }}>
              100 000 × 0.20 = 20 000 · 400 000 × {num(pctSeguridad / 100, 3)} = {num(aSeg)}
            </span>,
          )}
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 11, border: "1px solid #fbbf2455", background: "rgba(251,191,36,0.07)", fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
            <i className="fa-solid fa-pen-ruler" style={{ marginRight: 7, color: "#fbbf24" }} />
            <strong style={{ color: "#fff" }}>Nota del laboratorio. </strong>
            {NOTA_BASES}
          </div>
        </>
      );
      break;
    case "mediana":
      control = (
        <>
          {deslizador("Ingreso mensual del hogar más rico", ricoMayor, RICO_MIN, RICO_MAX, 1000, moverRico, `$${num(ricoMayor)}`)}
          {lecturas(
            <>
              <Dato label="Media" value={`$${num(med)}`} col={accent} />
              <Dato label="Mediana" value={`$${num(mdn)}`} col={modoCol} />
              <Dato label="10 % más rico" value={`${num(top10 * 100, 1)} %`} />
            </>,
            `Media = suma de los 20 ingresos ÷ 20. Mediana = promedio de los hogares 10.º y 11.º al ordenarlos. ${bajoMedia} hogares quedan bajo la media.`,
          )}
          <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 6, color: modoCol }} />
            Con el valor inicial, los dos hogares más ricos concentran el 36.5 % del ingreso, la cifra de la ENIGH 2022 que cita la infografía A1.
          </div>
        </>
      );
      break;
    case "margen":
      control = (
        <>
          {titular(`«A ${ENCUESTA.a} %, B ${ENCUESTA.b} %: A va adelante»`, "Quiz A2")}
          {sub("Personas encuestadas (n)")}
          <div className="ee-opts">
            {TAMANOS_ENCUESTA.map((n) => (
              <button key={n} className="ee-opt" data-on={n === nEncuesta} onClick={() => elegirN(n)} style={{ ["--eec" as string]: accent, background: n === nEncuesta ? `rgba(${color.rgba},0.16)` : "transparent", minWidth: 58, ...NUM }}>
                {num(n)}
              </button>
            ))}
          </div>
          {lecturas(
            <>
              <Dato label="Margen de error" value={`±${num(me, 1)} pts`} col={accent} />
              <Dato label="Veredicto" value={empate ? "Empate" : "A adelante"} col={empate ? BAJA : SUBE} />
            </>,
            <span style={{ fontFamily: "ui-monospace, monospace" }}>ME = 1.96 · √(0.25 / {num(nEncuesta)}) × 100 = ±{num(me, 2)}</span>,
          )}
          <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5, ...NUM }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 6, color: modoCol }} />
            Con n ≈ 1 000 el margen es de ±3 puntos, como en las encuestas de la infografía. Para que 2 puntos de ventaja no se toquen hacen falta al menos {num(N_ROMPE_EMPATE)} personas.
          </div>
        </>
      );
      break;
  }

  const CSS_EE = `
        .ee-vtabs { display:flex; flex-wrap:wrap; gap:6px; padding:4px; border-radius:12px; background:rgba(4,10,22,0.5); border:1px solid ${T.line}; margin-bottom:6px; }
        .ee-vtab { cursor:pointer; flex:1 1 130px; border:none; border-radius:9px; padding:10px; font-size:14px; font-weight:900;
          color:rgba(255,255,255,0.7); background:transparent; transition:all .15s; }
        .ee-vtab[data-on="true"] { background:var(--eec); color:#04121f; }
        .ee-vtab:hover:not([data-on="true"]) { background:rgba(255,255,255,0.07); }
        .ee-opts { display:flex; flex-wrap:wrap; gap:8px; }
        .ee-opt { cursor:pointer; border:1px solid var(--eec); border-radius:10px; padding:10px 12px; font-size:14px;
          font-weight:800; color:#fff; background:transparent; transition:all .15s; text-align:left; }
        .ee-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.7); }
        .ee-opt:hover { background:rgba(255,255,255,0.06); }
        .ee-opt:focus-visible, .ee-vtab:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
`;

  const leyendaEscena: ReactNode = leyenda.length ? <>{leyenda.map(([c, t]) => chip(c, t))}</> : undefined;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EnganosaScene
            vista={vista}
            casoBarras={casoBarras}
            ejeMin={ejeMin}
            casoVolumen={casoVolumen}
            escalado={escalado}
            log={log}
            casoPuntos={casoPuntos}
            casoRiesgo={casoRiesgo}
            pctSeguridad={pctSeguridad}
            ricoMayor={ricoMayor}
            nEncuesta={nEncuesta}
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
              <style>{`${CSS_EE}`}</style>
              <Bloque titulo={def.etq} icono={def.icono}>
                <div className="ee-vtabs" role="tablist">
                  {def.vistas.map((v) => (
                    <button key={v} type="button" role="tab" aria-selected={v === vista} className="ee-vtab" data-on={v === vista} onClick={() => cambiarVista(v)} style={{ ["--eec" as string]: modoCol }}>
                      <i className={`fa-solid ${VISTAS_DEF[v].icono}`} style={{ marginRight: 7 }} aria-hidden />
                      {VISTAS_DEF[v].etq}
                    </button>
                  ))}
                </div>
                {control}
              </Bloque>
              <Bloque titulo="Qué estás viendo" icono="fa-eye">
                <div style={{ color: T.text2, ...NUM }}>{pie}</div>
                <div style={{ fontSize: 14, color: T.text3 }}>
                  {def.etq} — {VISTAS_DEF[vista].etq}
                </div>
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
              <CambiosCard
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
                aprobado={quizAprobado}
                onAprobado={() => setQuizAprobado(true)}
                playSfx={(ok) => {
                  if (!sonido) return;
                  if (ok) audioRef.current?.correcto();
                  else audioRef.current?.incorrecto();
                }}
                playPick={() => {
                  if (sonido) audioRef.current?.blip();
                }}
                mensajeAprobado="¡Aprobado! Ya detectas cuándo una estadística engaña."
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
              <Bloque titulo="Leer una estadística con ojo crítico" icono="fa-magnifying-glass-chart">
                <div style={{ color: T.text2 }}>{PROBLEMA}</div>
              </Bloque>
              <Bloque titulo="Infografía A1" icono="fa-book-open">
                <div style={{ fontWeight: 800, color: "#fff" }}>{TITULO_A1}</div>
                {PUNTOS_CLAVE.map((p, i) => (
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
              <Bloque titulo="Contexto mexicano (infografía A1)" icono="fa-flag">
                {CONTEXTO_A1.map((p, i) => (
                  <div key={i} style={{ color: T.text2 }}>
                    {p}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Actividad de la infografía" icono="fa-pen-to-square">
                <div style={{ color: T.text2 }}>{ACTIVIDAD_A1}</div>
                <div style={{ color: T.text3 }}>
                  <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />
                  El inciso (b) está en «¿Cuánto cambió?» → «Puntos o %» → «Homicidios de 28 a 21».
                </div>
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
                <FichaTeorica data={ESTADISTICA_ENGANOSA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Los puntos clave, el contexto, las preguntas y la actividad de la infografía A1, los hechos del quiz A4, el glosario A5 y el quiz A2 son <strong>verbatim</strong> del material de la plataforma. Los valores de las barras,
                los tanques, los riesgos, los presupuestos y la encuesta son los de esas actividades. Las dos curvas de contagios, los 20 hogares (calibrados para que el 10 % más rico concentre el 36.5 %) y la ubicación de los casos
                entre las figuras son <strong>datos ilustrativos</strong>. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
