"use client";

/**
 * Laboratorio 3D — "Azar, frecuencia y probabilidad: el tablero de Galton".
 * Práctica experimental anclada a PM-VI-P05-A1 (lectura «Probabilidad: azar,
 * incertidumbre y toma de decisiones informadas»; progresión 2 de la UAC PM-VI
 * "Pensamiento Matemático VI"). Su A2 es un quiz de opción múltiple, así que el
 * quiz viaja completo como reto evaluable y el marco teórico sale de la
 * lectura A1 y del glosario A5.
 *
 * Tres modos, que son los tres enfoques de la lectura puestos uno al lado del
 * otro:
 *  (1) Probabilidad clásica — el espacio muestral Ω se enumera objeto por
 *      objeto y P(A) = favorables/posibles se cuenta sobre lo que se ve, con
 *      su complemento.
 *  (2) Tablero de Galton — la probabilidad frecuentista: al soltar bolas, la
 *      frecuencia relativa de cada cajón se compara con la binomial teórica.
 *      Cargar el tablero (p ≠ 0.5) rompe la equiprobabilidad y muestra dónde
 *      deja de aplicar la regla de Laplace.
 *  (3) Ley de los grandes números — el mismo experimento del modo 1, repetido
 *      miles de veces, con la frecuencia relativa acercándose a la teórica.
 *
 * La simulación vive aquí (un intervalo, un solo setState por tick); la escena
 * solo dibuja.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { GALTON_PROBABILIDAD_FICHA } from "./galton-probabilidad-ficha";
import type { Vuelo } from "./GaltonProbabilidadScene";
import {
  type Modo,
  type ExperimentoId,
  type EventoDef,
  type PuntoConvergencia,
  MODOS,
  MODOS_DEF,
  EXPERIMENTOS,
  experimentoPorId,
  eventoPorId,
  probClasica,
  SESGOS,
  sesgoPorId,
  binomial,
  momentosBinomial,
  FILAS_MIN,
  FILAS_MAX,
  CONV_MAX_REPS,
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
} from "./galton-probabilidad-data";

const GaltonScene = dynamic(() => import("./GaltonProbabilidadScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dice fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el tablero en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-galton-reto";

/** Cuántas bolas pueden estar cayendo a la vez. */
const MAX_VUELOS = 12;

/* ── Estado de la simulación del tablero ──────────────────────────────── */
interface EstadoGalton {
  vuelos: Vuelo[];
  conteos: number[];
  lanzadas: number;
  /** Bolas pendientes de soltar. */
  restantes: number;
}

const galtonVacio = (filas: number): EstadoGalton => ({
  vuelos: [],
  conteos: Array<number>(filas + 1).fill(0),
  lanzadas: 0,
  restantes: 0,
});

/** Una ruta: en cada fila, 1 si la bola se va a la derecha. */
function rutaAleatoria(filas: number, p: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < filas; i++) out.push(Math.random() < p ? 1 : 0);
  return out;
}

/* ── Estado de la simulación de convergencia ──────────────────────────── */
interface EstadoConv {
  reps: number;
  exitos: number;
  traza: PuntoConvergencia[];
  /** La racha más larga de repeticiones seguidas sin que ocurra el evento. */
  rachaSin: number;
  rachaActual: number;
}

const convVacio = (): EstadoConv => ({ reps: 0, exitos: 0, traza: [], rachaSin: 0, rachaActual: 0 });

/* ── Tarjeta de predicción: las estrellas se ganan por precisión ───────── */
function PrediccionCard({
  accent,
  rgba,
  teorica,
  etiquetaEvento,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  teorica: number;
  etiquetaEvento: string;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [valor, setValor] = useState("");
  const [comprobado, setComprobado] = useState(false);
  const [estrellas, setEstrellas] = useState(0);
  const [error, setError] = useState(0);

  const comprobar = () => {
    const raw = valor.trim().replace(",", ".");
    const esPorcentaje = raw.endsWith("%");
    const num = Number(raw.replace("%", ""));
    if (!Number.isFinite(num)) return;
    const pred = esPorcentaje || num > 1 ? num / 100 : num;
    const err = Math.abs(pred - teorica);
    const est = err <= 0.02 ? 3 : err <= 0.05 ? 2 : err <= 0.12 ? 1 : 0;
    setError(err);
    setEstrellas(est);
    setComprobado(true);
    playSfx?.(est > 0);
    if (est > 0) onResultado(est);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Antes de simular: ¿cuánto vale P(A)?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((s) => (
            <i key={s} className="fa-solid fa-star" style={{ fontSize: 13, color: s <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Calcula con la regla de Laplace la probabilidad del evento <strong style={{ color: "#fff" }}>{etiquetaEvento}</strong> y escríbela
        antes de dejar que la máquina te la enseñe. Puedes escribirla como decimal (0.5) o como porcentaje (50%).
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setComprobado(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") comprobar();
          }}
          placeholder="P(A) = …"
          inputMode="decimal"
          aria-label="Tu predicción de P(A)"
          style={{
            flex: "1 1 160px",
            minWidth: 0,
            padding: "12px 14px",
            borderRadius: 11,
            border: `1px solid ${comprobado ? (estrellas > 0 ? OK : "#FF8A3C") : T.lineStrong}`,
            background: "rgba(2,12,28,0.55)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 800,
            ...NUM,
          }}
        />
        <button
          onClick={comprobar}
          disabled={valor.trim() === ""}
          style={{
            cursor: valor.trim() === "" ? "not-allowed" : "pointer",
            padding: "12px 20px",
            borderRadius: 11,
            border: `1px solid ${accent}`,
            background: `rgba(${rgba},0.18)`,
            color: "#fff",
            fontSize: 13,
            fontWeight: 900,
            opacity: valor.trim() === "" ? 0.45 : 1,
          }}
        >
          <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
          Comprobar
        </button>
      </div>

      {comprobado && (
        <div
          style={{
            marginTop: 14,
            padding: "13px 15px",
            borderRadius: 12,
            border: `1px solid ${estrellas > 0 ? `${OK}55` : "#FF8A3C55"}`,
            background: estrellas > 0 ? "rgba(52,211,153,0.08)" : "rgba(255,138,60,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            {[1, 2, 3].map((s) => (
              <i key={s} className="fa-solid fa-star" style={{ fontSize: 15, color: s <= estrellas ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: estrellas > 0 ? OK : "#FF8A3C", marginLeft: 4 }}>
              {estrellas === 3 ? "Exacto" : estrellas === 2 ? "Muy cerca" : estrellas === 1 ? "Cerca" : "Vuelve a contar"}
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
            La probabilidad teórica es <strong style={{ color: "#fff", ...NUM }}>{teorica.toFixed(4)}</strong>. Tu diferencia fue de{" "}
            <strong style={{ color: "#fff", ...NUM }}>{error.toFixed(4)}</strong>. Las tres estrellas piden un error menor a 0.02.
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabGaltonProbabilidad({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("laplace");

  // ── Modo 1: probabilidad clásica
  const [expId, setExpId] = useState<ExperimentoId>("dado");
  const [eventoId, setEventoId] = useState<string>("par");
  const [complemento, setComplemento] = useState(false);

  // ── Modo 2: tablero de Galton
  const [filas, setFilas] = useState(8);
  const [sesgoId, setSesgoId] = useState("parejo");
  const [g, setG] = useState<EstadoGalton>(() => galtonVacio(8));

  // ── Modo 3: ley de los grandes números
  const [conv, setConv] = useState<EstadoConv>(convVacio);
  const [corriendo, setCorriendo] = useState(false);

  // ── Comunes
  const [playing, setPlaying] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // Logros de la sesión. Son pegajosos a propósito: si se derivaran del estado
  // actual, apagar el complemento o vaciar el tablero desmarcaría un objetivo
  // que el alumno sí cumplió.
  const [cambioEvento, setCambioEvento] = useState(false);
  const [vioComplemento, setVioComplemento] = useState(false);
  const [soltoCien, setSoltoCien] = useState(false);
  const [cargoTablero, setCargoTablero] = useState(false);
  const [llegoMil, setLlegoMil] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const idVuelo = useRef(0);

  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const [predicho, setPredicho] = useState(false);
  const registraEstrellas = useCallback(
    (est: number) => {
      setPredicho(true);
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

  /* ── Derivados ─────────────────────────────────────────────────────── */
  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  const exp = experimentoPorId(expId);
  const eventoBase = eventoPorId(exp, eventoId);
  /** El evento que se está mirando: el elegido, o su complemento. */
  const evento: EventoDef = useMemo(
    () =>
      complemento
        ? {
            id: `${eventoBase.id}-comp`,
            etq: `NO ${eventoBase.etq.toLowerCase()}`,
            notacion: `A' = el complemento de ${eventoBase.notacion.replace(/^A = /, "")}`,
            pertenece: (r) => !eventoBase.pertenece(r),
          }
        : eventoBase,
    [complemento, eventoBase],
  );
  const prob = useMemo(() => probClasica(exp, evento), [exp, evento]);

  const sesgo = sesgoPorId(sesgoId);
  const teorica = useMemo(() => binomial(filas, sesgo.p), [filas, sesgo.p]);
  const momentos = useMemo(() => momentosBinomial(filas, sesgo.p), [filas, sesgo.p]);
  const duracionVuelo = 420 + filas * 95;

  const totalCajones = g.conteos.reduce((a, b) => a + b, 0);
  /** El mayor |frecuencia observada − probabilidad teórica| entre los cajones. */
  const errorMax = useMemo(() => {
    if (totalCajones === 0) return 0;
    let m = 0;
    for (let k = 0; k < g.conteos.length; k++) {
      m = Math.max(m, Math.abs((g.conteos[k] ?? 0) / totalCajones - (teorica[k] ?? 0)));
    }
    return m;
  }, [g.conteos, teorica, totalCajones]);
  const cajonModal = totalCajones > 0 ? g.conteos.indexOf(Math.max(...g.conteos)) : -1;

  const frecConv = conv.reps > 0 ? conv.exitos / conv.reps : 0;
  const errorConv = Math.abs(frecConv - prob.decimal);

  /* ── Simulación del tablero: un intervalo, un setState por tick ────── */
  const activoGalton = g.restantes > 0 || g.vuelos.length > 0;
  useEffect(() => {
    if (modo !== "galton" || !activoGalton || !playing) return;
    const id = window.setInterval(() => {
      setG((prev) => {
        const ahora = performance.now();
        const vivos: Vuelo[] = [];
        let conteos = prev.conteos;
        let clonado = false;
        let lanzadas = prev.lanzadas;

        for (const v of prev.vuelos) {
          if (ahora - v.t0 >= duracionVuelo) {
            if (!clonado) {
              conteos = [...prev.conteos];
              clonado = true;
            }
            const k = v.pasos.reduce((a, b) => a + b, 0);
            conteos[k] = (conteos[k] ?? 0) + 1;
            lanzadas++;
          } else {
            vivos.push(v);
          }
        }

        let restantes = prev.restantes;
        if (restantes > 0 && vivos.length < MAX_VUELOS) {
          vivos.push({ id: idVuelo.current++, pasos: rutaAleatoria(filas, sesgo.p), t0: ahora });
          restantes--;
        }

        if (!clonado && restantes === prev.restantes && vivos.length === prev.vuelos.length) return prev;
        return { vuelos: vivos, conteos, lanzadas, restantes };
      });
    }, 70);
    return () => window.clearInterval(id);
  }, [modo, activoGalton, playing, duracionVuelo, filas, sesgo.p]);

  /* ── Simulación de la convergencia ─────────────────────────────────── */
  // Al llegar al tope el intervalo se desmonta solo: no hace falta apagar
  // `corriendo` desde un efecto (eso sería un render en cascada).
  const corriendoReal = corriendo && conv.reps < CONV_MAX_REPS;
  useEffect(() => {
    if (modo !== "convergencia" || !corriendoReal) return;
    const id = window.setInterval(() => {
      setConv((prev) => {
        if (prev.reps >= CONV_MAX_REPS) return prev;
        // El lote crece con n para que el avance sea parejo en escala log.
        const lote = Math.max(1, Math.min(250, Math.ceil(prev.reps * 0.13)));
        let exitos = prev.exitos;
        let racha = prev.rachaActual;
        let rachaSin = prev.rachaSin;
        const n = exp.omega.length;
        for (let i = 0; i < lote && prev.reps + i < CONV_MAX_REPS; i++) {
          const r = exp.omega[Math.floor(Math.random() * n)]!;
          if (evento.pertenece(r)) {
            exitos++;
            racha = 0;
          } else {
            racha++;
            if (racha > rachaSin) rachaSin = racha;
          }
        }
        const reps = Math.min(prev.reps + lote, CONV_MAX_REPS);
        return {
          reps,
          exitos,
          rachaSin,
          rachaActual: racha,
          traza: [...prev.traza, { n: reps, frecuencia: exitos / reps }],
        };
      });
    }, 45);
    return () => window.clearInterval(id);
  }, [modo, corriendoReal, exp, evento]);

  /* ── Acciones ──────────────────────────────────────────────────────── */
  const bump = () => setResetNonce((n) => n + 1);

  /** Antes de vaciar el tablero, guarda lo que el alumno ya logró en él. */
  const fijarLogrosGalton = () => {
    if (g.lanzadas >= 100) setSoltoCien(true);
    if (sesgoId !== "parejo" && g.lanzadas > 0) setCargoTablero(true);
  };
  /** Antes de reiniciar la convergencia, guarda si ya llegó a 1000. */
  const fijarLogrosConv = () => {
    if (conv.reps >= 1000) setLlegoMil(true);
  };
  const alternarComplemento = () => {
    setComplemento((c) => !c);
    setVioComplemento(true);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPlaying(true);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  const cambiarExperimento = (id: ExperimentoId) => {
    const nuevo = experimentoPorId(id);
    setExpId(id);
    setEventoId(nuevo.eventos[0]!.id);
    setComplemento(false);
    fijarLogrosConv();
    setConv(convVacio());
    setCorriendo(false);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  const cambiarEvento = (id: string) => {
    setEventoId(id);
    setCambioEvento(true);
    fijarLogrosConv();
    setConv(convVacio());
    setCorriendo(false);
    if (sonido) audioRef.current?.blip();
  };

  const cambiarFilas = (n: number) => {
    fijarLogrosGalton();
    setFilas(n);
    setG(galtonVacio(n));
    bump();
  };

  const cambiarSesgo = (id: string) => {
    fijarLogrosGalton();
    setSesgoId(id);
    setG(galtonVacio(filas));
    if (sonido) audioRef.current?.blip();
  };

  const soltar = (cuantas: number) => {
    setG((prev) => ({ ...prev, restantes: prev.restantes + cuantas }));
    setPlaying(true);
    if (sonido) audioRef.current?.blip();
  };

  /** Añade de golpe, sin animar: útil para llegar a cientos de bolas. */
  const simularDeGolpe = (cuantas: number) => {
    setG((prev) => {
      const conteos = [...prev.conteos];
      for (let i = 0; i < cuantas; i++) {
        const k = rutaAleatoria(filas, sesgo.p).reduce((a, b) => a + b, 0);
        conteos[k] = (conteos[k] ?? 0) + 1;
      }
      return { ...prev, conteos, lanzadas: prev.lanzadas + cuantas };
    });
    if (sonido) audioRef.current?.correcto();
  };

  const reiniciar = () => {
    if (modo === "galton") {
      fijarLogrosGalton();
      setG(galtonVacio(filas));
    } else if (modo === "convergencia") {
      fijarLogrosConv();
      setConv(convVacio());
      setCorriendo(false);
    } else {
      setComplemento(false);
    }
    setPlaying(true);
    bump();
  };

  /* ── Objetivos de la sesión ────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Enumerar el espacio muestral Ω y elegir un evento dentro de él", done: cambioEvento },
    { t: "Mirar el complemento del evento y comprobar que P(A) + P(A') = 1", done: vioComplemento || complemento },
    { t: "Soltar al menos 100 bolas en el tablero de Galton", done: soltoCien || g.lanzadas >= 100 },
    { t: "Cargar el tablero (p ≠ 0.5) y ver cómo se rompe la equiprobabilidad", done: cargoTablero || (sesgoId !== "parejo" && g.lanzadas > 0) },
    { t: "Llegar a 1000 repeticiones en la ley de los grandes números", done: llegoMil || conv.reps >= 1000 },
    { t: "Predecir P(A) con la regla de Laplace y ganar estrellas", done: predicho },
    { t: "Aprobar el reto evaluable (quiz de la actividad A2)", done: ejercicioAprobado },
  ];

  /* ── Pie del visor ─────────────────────────────────────────────────── */
  const pie: string =
    modo === "laplace"
      ? `${evento.etq}. De los ${prob.totales} resultados del espacio muestral, ${prob.favorables} son favorables: P(A) = ${prob.fraccion} = ${prob.decimal.toFixed(4)}. Su complemento vale ${prob.fraccionComp} = ${prob.decimalComp.toFixed(4)}.`
      : modo === "galton"
        ? totalCajones === 0
          ? `${sesgo.nota} Suelta bolas para empezar a comparar la frecuencia observada con la curva teórica.`
          : `${g.lanzadas} bolas. El cajón más poblado es el ${cajonModal} (la teoría espera μ = n·p = ${momentos.media.toFixed(2)}). La mayor diferencia entre lo observado y lo teórico es de ${errorMax.toFixed(4)}.`
        : conv.reps === 0
          ? `Cada repetición saca un resultado de Ω al azar y pregunta si pertenece al evento. La probabilidad teórica es ${prob.decimal.toFixed(4)}.`
          : `${conv.reps.toLocaleString("es-MX")} repeticiones: el evento ocurrió ${conv.exitos.toLocaleString("es-MX")} veces. Frecuencia relativa ${frecConv.toFixed(4)} frente a la teórica ${prob.decimal.toFixed(4)} — diferencia de ${errorConv.toFixed(4)}.`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION}
      </div>
    </div>
  );

  /* ── Panel de control por modo ─────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "laplace") {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Experimento aleatorio</div>
        <div className="gl-opts">
          {EXPERIMENTOS.map((e) => {
            const on = e.id === expId;
            return (
              <button key={e.id} className="gl-opt" data-on={on} onClick={() => cambiarExperimento(e.id)} style={{ ["--glc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                <i className={`fa-solid ${e.icono}`} style={{ marginRight: 8, color: on ? modoCol : T.text3 }} />
                {e.etq}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>Evento (un subconjunto de Ω)</div>
        <div className="gl-opts">
          {exp.eventos.map((e) => {
            const on = e.id === eventoId;
            return (
              <button key={e.id} className="gl-opt" data-on={on} onClick={() => cambiarEvento(e.id)} style={{ ["--glc" as string]: accent, background: on ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                {e.etq}
              </button>
            );
          })}
        </div>

        <button className="gl-toggle" data-on={complemento} onClick={alternarComplemento} style={{ marginTop: 13, ["--glc" as string]: complemento ? "#f472b6" : "rgba(255,255,255,0.2)" }}>
          <i className={`fa-solid ${complemento ? "fa-circle-half-stroke" : "fa-circle"}`} style={{ marginRight: 9, color: complemento ? "#f472b6" : T.text3 }} />
          {complemento ? "Viendo el complemento A' (lo que NO es el evento)" : "Ver el complemento A' = 1 − P(A)"}
        </button>

        <div style={{ marginTop: 13, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
            <i className="fa-solid fa-divide" style={{ color: modoCol, marginRight: 8 }} />
            Regla de Laplace
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{exp.descripcion}</div>
          <div style={{ marginTop: 10, fontSize: 13, color: "#fff", lineHeight: 1.6, padding: "10px 12px", borderRadius: 9, background: "rgba(4,10,22,0.45)", fontFamily: "ui-monospace, monospace", ...NUM }}>
            P(A) = {prob.favorables} / {prob.totales} = {prob.fraccion} = {prob.decimal.toFixed(4)}
            <br />
            P(A&apos;) = 1 − {prob.decimal.toFixed(4)} = {prob.decimalComp.toFixed(4)}
          </div>
          <div style={{ marginTop: 9, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>{evento.notacion}</div>
        </div>
      </>
    );
  } else if (modo === "galton") {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>
          Filas de clavos: <span style={{ color: "#fff", ...NUM }}>{filas}</span> → {filas + 1} cajones
        </div>
        <input
          type="range"
          min={FILAS_MIN}
          max={FILAS_MAX}
          step={1}
          value={filas}
          onChange={(e) => cambiarFilas(Number(e.target.value))}
          aria-label="Número de filas de clavos"
          style={{ width: "100%", accentColor: modoCol }}
        />

        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>¿El tablero es parejo?</div>
        <div className="gl-opts">
          {SESGOS.map((s) => {
            const on = s.id === sesgoId;
            return (
              <button key={s.id} className="gl-opt" data-on={on} onClick={() => cambiarSesgo(s.id)} style={{ ["--glc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                p = {s.p}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 9, fontSize: 11.5, color: sesgoId === "parejo" ? T.text2 : "#fbbf24", lineHeight: 1.5 }}>
          <i className={`fa-solid ${sesgoId === "parejo" ? "fa-scale-balanced" : "fa-triangle-exclamation"}`} style={{ marginRight: 7 }} />
          {sesgo.nota}
        </div>

        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>Soltar bolas</div>
        <div className="gl-opts">
          <button className="gl-opt" data-on={false} onClick={() => soltar(1)} style={{ ["--glc" as string]: accent }}>
            <i className="fa-solid fa-circle" style={{ marginRight: 8, fontSize: 9, color: accent }} />1 bola
          </button>
          <button className="gl-opt" data-on={false} onClick={() => soltar(25)} style={{ ["--glc" as string]: accent }}>
            <i className="fa-solid fa-ellipsis" style={{ marginRight: 8, color: accent }} />25 bolas
          </button>
          <button className="gl-opt" data-on={false} onClick={() => simularDeGolpe(500)} style={{ ["--glc" as string]: accent }}>
            <i className="fa-solid fa-forward-fast" style={{ marginRight: 8, color: accent }} />500 de golpe
          </button>
          <button className="gl-opt" data-on={false} onClick={() => {
              fijarLogrosGalton();
              setG(galtonVacio(filas));
            }} style={{ ["--glc" as string]: "rgba(255,255,255,0.2)" }}>
            <i className="fa-solid fa-trash-can" style={{ marginRight: 8, color: T.text3 }} />
            Vaciar
          </button>
        </div>
        {g.restantes > 0 && (
          <div style={{ marginTop: 9, fontSize: 11.5, color: T.text3 }}>
            <i className="fa-solid fa-hourglass-half" style={{ marginRight: 7, color: modoCol }} />
            Quedan {g.restantes} bolas por soltar.
          </div>
        )}

        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", marginBottom: 7 }}>
            <i className="fa-solid fa-chart-column" style={{ color: modoCol, marginRight: 8 }} />
            Frecuencia observada frente a teoría
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Readout label="Bolas" value={g.lanzadas.toLocaleString("es-MX")} col={accent} />
            <Readout label="Cajón modal" value={cajonModal >= 0 ? String(cajonModal) : "—"} col={modoCol} />
            <Readout label="μ = n·p" value={momentos.media.toFixed(2)} />
            <Readout label="Error máx." value={totalCajones > 0 ? errorMax.toFixed(4) : "—"} col={errorMax > 0 && errorMax < 0.03 ? OK : undefined} />
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>
            σ = √(n·p·q) = {momentos.sigma.toFixed(3)}. Con pocas bolas la diferencia entre la barra y la curva es grande; es el azar, no un error del modelo.
          </div>
        </div>
      </>
    );
  } else {
    control = (
      <>
        <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 13 }}>
          Se repite el experimento <strong style={{ color: "#fff" }}>{exp.etq.toLowerCase()}</strong> y se cuenta cuántas veces ocurre{" "}
          <strong style={{ color: "#fff" }}>{evento.etq.toLowerCase()}</strong>. Cámbialos en el primer modo.
        </div>

        <div className="gl-opts">
          <button className="gl-opt" data-on={corriendoReal} onClick={() => setCorriendo((c) => !c)} disabled={conv.reps >= CONV_MAX_REPS} style={{ ["--glc" as string]: modoCol, background: corriendoReal ? `${modoCol}1f` : "transparent", opacity: conv.reps >= CONV_MAX_REPS ? 0.45 : 1 }}>
            <i className={`fa-solid ${corriendoReal ? "fa-pause" : "fa-play"}`} style={{ marginRight: 8, color: modoCol }} />
            {corriendoReal ? "Pausar" : conv.reps === 0 ? "Repetir el experimento" : "Continuar"}
          </button>
          <button
            className="gl-opt"
            data-on={false}
            onClick={() => {
              fijarLogrosConv();
              setConv(convVacio());
              setCorriendo(false);
            }}
            style={{ ["--glc" as string]: "rgba(255,255,255,0.2)" }}
          >
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 8, color: T.text3 }} />
            Empezar de nuevo
          </button>
        </div>

        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Readout label="Repeticiones" value={conv.reps.toLocaleString("es-MX")} col={modoCol} />
            <Readout label="Ocurrió" value={conv.exitos.toLocaleString("es-MX")} />
            <Readout label="Frecuencia" value={conv.reps > 0 ? frecConv.toFixed(4) : "—"} col={accent} />
            <Readout label="Teórica" value={prob.decimal.toFixed(4)} col="#f472b6" />
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
            Diferencia actual: <strong style={{ color: conv.reps >= 500 && errorConv < 0.03 ? OK : "#fff", ...NUM }}>{conv.reps > 0 ? errorConv.toFixed(4) : "—"}</strong>.
            Fíjate en que baja a saltos, no de forma pareja: eso también es el azar.
          </div>
        </div>

        {conv.rachaSin > 0 && (
          <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, border: "1px solid #f472b644", background: "rgba(244,114,182,0.08)", fontSize: 11.5, color: T.text2, lineHeight: 1.55 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f472b6", marginRight: 8 }} />
            La racha más larga sin que ocurriera el evento fue de <strong style={{ color: "#fff" }}>{conv.rachaSin}</strong> repeticiones seguidas. Después de esa
            racha el evento NO era «más probable»: cada repetición es independiente de las anteriores. Eso es la falacia del jugador.
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes glPulse { 0%,100%{ box-shadow:0 0 0 0 var(--gld); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .gl-live-dot { animation: glPulse 1.6s ease-in-out infinite; }
        .gl-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .gl-grid { grid-template-columns: 1fr; } }
        .gl-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .gl-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .gl-icobtn:hover { background:rgba(255,255,255,0.12); }
        .gl-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .gl-tab { cursor:pointer; border:1px solid var(--glc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .gl-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .gl-tab:hover { background:rgba(255,255,255,0.06); }
        .gl-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .gl-opt { cursor:pointer; border:1px solid var(--glc); border-radius:10px; padding:9px 12px; font-size:12px;
          font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .gl-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
        .gl-opt:hover { background:rgba(255,255,255,0.06); }
        .gl-toggle { width:100%; cursor:pointer; border:1px solid var(--glc); border-radius:11px; padding:11px 14px;
          background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .gl-toggle:hover { background:rgba(255,255,255,0.07); }
        @media (max-width: 1000px){ .gl-bottom { grid-template-columns: 1fr !important; } }

        .gl-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .gl-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .gl-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .gl-drawer[data-open="true"] { transform:translateX(0); }
        .gl-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .gl-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .gl-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .gl-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .gl-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .gl-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="gl-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="gl-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--glc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="gl-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
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
              <GaltonScene
                modo={modo}
                exp={exp}
                evento={evento}
                filas={filas}
                p={sesgo.p}
                conteos={g.conteos}
                teorica={teorica}
                vuelos={g.vuelos}
                duracionVuelo={duracionVuelo}
                traza={conv.traza}
                probTeorica={prob.decimal}
                playing={playing}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="gl-live-dot" style={{ ["--gld" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", ...NUM }}>
                {modo === "laplace"
                  ? `P(A) = ${prob.fraccion}`
                  : modo === "galton"
                    ? `${g.lanzadas.toLocaleString("es-MX")} BOLAS`
                    : `n = ${conv.reps.toLocaleString("es-MX")}`}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="gl-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="gl-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              {modo === "laplace" && (
                <button className="gl-icobtn" data-on={complemento} onClick={alternarComplemento} title="Ver el complemento">
                  <i className="fa-solid fa-circle-half-stroke" />
                </button>
              )}
              {modo === "galton" && (
                <button className="gl-icobtn" onClick={() => soltar(25)} title="Soltar 25 bolas">
                  <i className="fa-solid fa-arrow-down" />
                </button>
              )}
              <button className="gl-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="gl-icobtn" onClick={reiniciar} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            <button className="gl-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Panel de control del modo */}
          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", border: "1px solid #7dd3fc55", borderRadius: 6, padding: "3px 7px" }}>
                {def.fuente === "A5" ? "GLOSARIO A5" : "LECTURA A1"}
              </span>
            </div>
            {control}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-dice" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Azar, frecuencia y probabilidad</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ancla A1 — lectura + reflexión */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1 — Azar e incertidumbre
            </Eyebrow>
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

          {/* Cómo usar */}
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

          {/* Objetivos de la sesión */}
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

      {/* ── Datos + ideas clave ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="gl-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
            Datos clave
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", ...NUM }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />
              México: probabilidad y política pública
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              ¿Sabías que? (quizzes A2/A4)
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

      {/* Nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1, las preguntas de reflexión, el glosario A5 (con sus ejemplos), los hechos de «¿sabías que?» (quizzes A2/A4) y el
          reto evaluable son <strong>verbatim</strong> del MCCEMS 2025. Las probabilidades clásicas se <strong>cuentan</strong> sobre el
          espacio muestral que se dibuja en pantalla, y las teóricas del tablero se <strong>calculan</strong> con la fórmula binomial
          C(n,k)·p^k·(1−p)^(n−k). Las bolas y las repeticiones usan el generador de números aleatorios del navegador: los resultados son
          distintos en cada corrida, y esa variación es justamente el fenómeno que el laboratorio enseña. El tablero es un modelo{" "}
          <strong>esquemático</strong>: no simula rebotes físicos reales, sino la decisión de cada clavo. Fuente: {FUENTE}
        </span>
      </div>

      {/* ── Reto de predicción: estrellas por precisión ────────────────── */}
      <PrediccionCard
        accent={accent}
        rgba={color.rgba}
        teorica={prob.decimal}
        etiquetaEvento={evento.etq}
        mejor={mejorEstrellas}
        onResultado={registraEstrellas}
        playSfx={(ok) => {
          if (!sonido) return;
          if (ok) audioRef.current?.correcto();
          else audioRef.current?.incorrecto();
        }}
      />

      {/* ── Reto evaluable: el quiz verbatim de la actividad A2 ────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        mensajeAprobado="Distingues la probabilidad clásica de la frecuentista y sabes qué garantiza la ley de los grandes números."
        playSfx={() => {
          if (sonido) audioRef.current?.correcto();
        }}
        playPick={() => {
          if (sonido) audioRef.current?.blip();
        }}
      />

      {/* ── Cajón de teoría ───────────────────────────────────────────── */}
      <div className="gl-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="gl-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="gl-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="gl-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="gl-drawer-body">
          <FichaTeorica data={GALTON_PROBABILIDAD_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
