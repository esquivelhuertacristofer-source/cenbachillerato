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
 * EXPERIMENTO CENTRAL: soltar bolas en el tablero y ver cómo las barras de los
 * cajones se pegan a la curva binomial; al cargar el tablero (p ≠ 0.5) la media
 * observada (cono) y la teórica (banda rosa) se corren juntas hacia un lado.
 *
 * La simulación vive aquí (un intervalo, un solo setState por tick); la escena
 * solo dibuja.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
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
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el tablero en 3D…</span>
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

/* ── Estilos compartidos del panel ────────────────────────────────────── */
const chip = (on: boolean, col: string): React.CSSProperties => ({
  cursor: "pointer",
  padding: "9px 13px",
  borderRadius: 10,
  border: `1px solid ${on ? col : "rgba(255,255,255,0.16)"}`,
  background: on ? `${col}26` : "transparent",
  color: on ? "#fff" : "rgba(255,255,255,0.78)",
  fontSize: 14,
  fontWeight: 800,
});

const cajaTxt: React.CSSProperties = { margin: 0, color: T.text2 };

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
    <Bloque titulo="Antes de simular: ¿cuánto vale P(A)?" icono="fa-bullseye">
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
        {[1, 2, 3].map((s) => (
          <i key={s} className="fa-solid fa-star" style={{ fontSize: 15, color: s <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} aria-hidden />
        ))}
      </div>

      <p style={cajaTxt}>
        Calcula con la regla de Laplace la probabilidad del evento <strong style={{ color: "#fff" }}>{etiquetaEvento}</strong> y escríbela
        antes de dejar que la máquina te la enseñe. Puedes escribirla como decimal (0.5) o como porcentaje (50%).
      </p>

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
            flex: "1 1 140px",
            minWidth: 0,
            padding: "12px 14px",
            borderRadius: 11,
            border: `1px solid ${comprobado ? (estrellas > 0 ? OK : "#FF8A3C") : T.lineStrong}`,
            background: "rgba(2,12,28,0.55)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            ...NUM,
          }}
        />
        <button
          type="button"
          onClick={comprobar}
          disabled={valor.trim() === ""}
          style={{
            cursor: valor.trim() === "" ? "not-allowed" : "pointer",
            padding: "12px 20px",
            borderRadius: 11,
            border: `1px solid ${accent}`,
            background: `rgba(${rgba},0.18)`,
            color: "#fff",
            fontSize: 15,
            fontWeight: 900,
            opacity: valor.trim() === "" ? 0.45 : 1,
          }}
        >
          <i className="fa-solid fa-check" style={{ marginRight: 8 }} aria-hidden />
          Comprobar
        </button>
      </div>

      {comprobado && (
        <div
          style={{
            padding: "13px 15px",
            borderRadius: 12,
            border: `1px solid ${estrellas > 0 ? `${OK}55` : "#FF8A3C55"}`,
            background: estrellas > 0 ? "rgba(52,211,153,0.08)" : "rgba(255,138,60,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            {[1, 2, 3].map((s) => (
              <i key={s} className="fa-solid fa-star" style={{ fontSize: 16, color: s <= estrellas ? "#fbbf24" : "rgba(255,255,255,0.16)" }} aria-hidden />
            ))}
            <span style={{ fontWeight: 900, color: estrellas > 0 ? OK : "#FF8A3C", marginLeft: 4 }}>
              {estrellas === 3 ? "Exacto" : estrellas === 2 ? "Muy cerca" : estrellas === 1 ? "Cerca" : "Vuelve a contar"}
            </span>
          </div>
          <div style={{ color: T.text2 }}>
            La probabilidad teórica es <strong style={{ color: "#fff", ...NUM }}>{teorica.toFixed(4)}</strong>. Tu diferencia fue de{" "}
            <strong style={{ color: "#fff", ...NUM }}>{error.toFixed(4)}</strong>. Las tres estrellas piden un error menor a 0.02.
          </div>
        </div>
      )}
    </Bloque>
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
  const mediaObs = totalCajones > 0 ? g.conteos.reduce((a, c, k) => a + c * k, 0) / totalCajones : 0;

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
  // Las misiones son pegajosas (LabShell las fija con useLogros) y además los
  // logros de la sesión se guardan en estado para no perderse al vaciar el tablero.
  const objetivos = [
    { txt: "Enumerar el espacio muestral Ω y elegir un evento dentro de él", done: cambioEvento },
    { txt: "Mirar el complemento del evento y comprobar que P(A) + P(A') = 1", done: vioComplemento || complemento },
    { txt: "Suelta 25 bolas en el tablero y compara cada barra con la curva rosa", done: soltoCien || g.lanzadas >= 25 },
    { txt: "Soltar al menos 100 bolas en el tablero de Galton", done: soltoCien || g.lanzadas >= 100 },
    { txt: "Cargar el tablero (p ≠ 0.5) y ver cómo se rompe la equiprobabilidad", done: cargoTablero || (sesgoId !== "parejo" && g.lanzadas > 0) },
    { txt: "Llegar a 1000 repeticiones en la ley de los grandes números", done: llegoMil || conv.reps >= 1000 },
    { txt: "Predecir P(A) con la regla de Laplace y ganar estrellas", done: predicho },
    { txt: "Aprobar el reto evaluable (quiz de la actividad A2)", done: ejercicioAprobado },
  ];

  /* ── Lectura en vivo (≤ 10 palabras) ───────────────────────────────── */
  const lectura: ReactNode =
    modo === "laplace"
      ? <>P(A) = {prob.fraccion} · P(A&apos;) = {prob.fraccionComp}</>
      : modo === "galton"
        ? totalCajones === 0
          ? <>Suelta bolas y compara las barras con la curva</>
          : <>{g.lanzadas.toLocaleString("es-MX")} bolas · diferencia máxima {errorMax.toFixed(3)}</>
        : conv.reps === 0
          ? <>Repite el experimento y mira cómo converge</>
          : <>n = {conv.reps.toLocaleString("es-MX")}: {frecConv.toFixed(4)} contra {prob.decimal.toFixed(4)}</>;

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

  const leyendas: Record<Modo, [string, string][]> = {
    laplace: [[accent, "Pertenece al evento"], ["#64748b", "Complemento"]],
    galton: [[modoCol, "Barra observada"], ["#f472b6", "Curva y media teóricas"], ["#fde047", "Media observada"]],
    convergencia: [[accent, "Frecuencia relativa"], ["#f472b6", "P(A) teórica"]],
  };

  /* ── Panel de control por modo ─────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "laplace") {
    control = (
      <>
        <Bloque titulo="Experimento aleatorio" icono="fa-dice">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {EXPERIMENTOS.map((e) => {
              const on = e.id === expId;
              return (
                <button key={e.id} type="button" onClick={() => cambiarExperimento(e.id)} style={chip(on, modoCol)}>
                  <i className={`fa-solid ${e.icono}`} style={{ marginRight: 8, color: on ? modoCol : T.text3 }} aria-hidden />
                  {e.etq}
                </button>
              );
            })}
          </div>
          <p style={cajaTxt}>{exp.descripcion}</p>
        </Bloque>

        <Bloque titulo="Evento (un subconjunto de Ω)" icono="fa-circle-check">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {exp.eventos.map((e) => (
              <button key={e.id} type="button" onClick={() => cambiarEvento(e.id)} style={chip(e.id === eventoId, accent)}>
                {e.etq}
              </button>
            ))}
          </div>
          <button type="button" onClick={alternarComplemento} style={{ ...chip(complemento, "#f472b6"), width: "100%", textAlign: "left", padding: "11px 14px" }}>
            <i className={`fa-solid ${complemento ? "fa-circle-half-stroke" : "fa-circle"}`} style={{ marginRight: 9, color: complemento ? "#f472b6" : T.text3 }} aria-hidden />
            {complemento ? "Viendo el complemento A' (lo que NO es el evento)" : "Ver el complemento A' = 1 − P(A)"}
          </button>
        </Bloque>

        <Bloque titulo="Regla de Laplace" icono="fa-divide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="casos favorables" value={`${prob.favorables} de ${prob.totales}`} col={accent} />
            <Dato label="P(A)" value={prob.fraccion} col={modoCol} />
            <Dato label="decimal" value={prob.decimal.toFixed(4)} />
            <Dato label="P(A′)" value={prob.fraccionComp} col="#f472b6" />
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(4,10,22,0.45)", fontFamily: "ui-monospace, monospace", color: "#fff", ...NUM }}>
            P(A) = {prob.favorables} / {prob.totales} = {prob.fraccion} = {prob.decimal.toFixed(4)}
            <br />
            P(A&apos;) = 1 − {prob.decimal.toFixed(4)} = {prob.decimalComp.toFixed(4)}
          </div>
          <p style={{ ...cajaTxt, color: T.text3 }}>{exp.omegaTexto}. {evento.notacion}</p>
        </Bloque>
      </>
    );
  } else if (modo === "galton") {
    control = (
      <>
        <Bloque titulo="El tablero" icono="fa-chart-column">
          <Deslizador
            label="Filas de clavos"
            icon="fa-bars-staggered"
            colr={modoCol}
            valor={`${filas} → ${filas + 1} cajones`}
            min={FILAS_MIN}
            max={FILAS_MAX}
            step={1}
            value={filas}
            onChange={cambiarFilas}
          />
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>¿El tablero es parejo?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {SESGOS.map((s) => (
              <button key={s.id} type="button" onClick={() => cambiarSesgo(s.id)} style={chip(s.id === sesgoId, modoCol)}>
                p = {s.p}
              </button>
            ))}
          </div>
          <p style={{ ...cajaTxt, color: sesgoId === "parejo" ? T.text2 : "#fbbf24" }}>
            <i className={`fa-solid ${sesgoId === "parejo" ? "fa-scale-balanced" : "fa-triangle-exclamation"}`} style={{ marginRight: 7 }} aria-hidden />
            {sesgo.nota}
          </p>
        </Bloque>

        <Bloque titulo="Soltar bolas" icono="fa-arrow-down">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            <button type="button" onClick={() => soltar(1)} style={chip(false, accent)}>
              <i className="fa-solid fa-circle" style={{ marginRight: 8, fontSize: 10, color: accent }} aria-hidden />1 bola
            </button>
            <button type="button" onClick={() => soltar(25)} style={chip(false, accent)}>
              <i className="fa-solid fa-ellipsis" style={{ marginRight: 8, color: accent }} aria-hidden />25 bolas
            </button>
            <button type="button" onClick={() => simularDeGolpe(500)} style={chip(false, accent)}>
              <i className="fa-solid fa-forward-fast" style={{ marginRight: 8, color: accent }} aria-hidden />500 de golpe
            </button>
            <button
              type="button"
              onClick={() => {
                fijarLogrosGalton();
                setG(galtonVacio(filas));
              }}
              style={chip(false, "rgba(255,255,255,0.3)")}
            >
              <i className="fa-solid fa-trash-can" style={{ marginRight: 8, color: T.text3 }} aria-hidden />
              Vaciar
            </button>
          </div>
          {g.restantes > 0 && (
            <p style={{ ...cajaTxt, color: T.text3 }}>
              <i className="fa-solid fa-hourglass-half" style={{ marginRight: 7, color: modoCol }} aria-hidden />
              Quedan {g.restantes} bolas por soltar.
            </p>
          )}
        </Bloque>

        <Bloque titulo="Frecuencia observada frente a teoría" icono="fa-gauge-high">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="bolas" value={g.lanzadas.toLocaleString("es-MX")} col={accent} />
            <Dato label="cajón modal" value={cajonModal >= 0 ? String(cajonModal) : "—"} col={modoCol} />
            <Dato label="μ teórica = n·p" value={momentos.media.toFixed(2)} col="#f472b6" />
            <Dato label="μ observada" value={totalCajones > 0 ? mediaObs.toFixed(2) : "—"} col="#fde047" />
            <Dato label="error máx." value={totalCajones > 0 ? errorMax.toFixed(4) : "—"} col={errorMax > 0 && errorMax < 0.03 ? OK : undefined} />
            <Dato label="σ = √(n·p·q)" value={momentos.sigma.toFixed(3)} />
          </div>
          <p style={cajaTxt}>
            Con pocas bolas la diferencia entre la barra y la curva es grande; es el azar, no un error del modelo. Con cientos, la barra se pega a la curva.
          </p>
        </Bloque>
      </>
    );
  } else {
    control = (
      <>
        <Bloque titulo="Repetir el experimento" icono="fa-repeat">
          <p style={cajaTxt}>
            Se repite el experimento <strong style={{ color: "#fff" }}>{exp.etq.toLowerCase()}</strong> y se cuenta cuántas veces ocurre{" "}
            <strong style={{ color: "#fff" }}>{evento.etq.toLowerCase()}</strong>. Cámbialos en el primer modo.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            <button
              type="button"
              onClick={() => setCorriendo((c) => !c)}
              disabled={conv.reps >= CONV_MAX_REPS}
              style={{ ...chip(corriendoReal, modoCol), opacity: conv.reps >= CONV_MAX_REPS ? 0.45 : 1 }}
            >
              <i className={`fa-solid ${corriendoReal ? "fa-pause" : "fa-play"}`} style={{ marginRight: 8, color: modoCol }} aria-hidden />
              {corriendoReal ? "Pausar" : conv.reps === 0 ? "Repetir el experimento" : "Continuar"}
            </button>
            <button
              type="button"
              onClick={() => {
                fijarLogrosConv();
                setConv(convVacio());
                setCorriendo(false);
              }}
              style={chip(false, "rgba(255,255,255,0.3)")}
            >
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 8, color: T.text3 }} aria-hidden />
              Empezar de nuevo
            </button>
          </div>
        </Bloque>

        <Bloque titulo="Lecturas" icono="fa-gauge-high">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="repeticiones" value={conv.reps.toLocaleString("es-MX")} col={modoCol} />
            <Dato label="ocurrió" value={conv.exitos.toLocaleString("es-MX")} />
            <Dato label="frecuencia" value={conv.reps > 0 ? frecConv.toFixed(4) : "—"} col={accent} />
            <Dato label="teórica" value={prob.decimal.toFixed(4)} col="#f472b6" />
          </div>
          <p style={cajaTxt}>
            Diferencia actual: <strong style={{ color: conv.reps >= 500 && errorConv < 0.03 ? OK : "#fff", ...NUM }}>{conv.reps > 0 ? errorConv.toFixed(4) : "—"}</strong>.
            Fíjate en que baja a saltos, no de forma pareja: eso también es el azar.
          </p>
          {conv.rachaSin > 0 && (
            <div style={{ padding: "11px 13px", borderRadius: 11, border: "1px solid #f472b644", background: "rgba(244,114,182,0.08)", color: T.text2 }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f472b6", marginRight: 8 }} aria-hidden />
              La racha más larga sin que ocurriera el evento fue de <strong style={{ color: "#fff" }}>{conv.rachaSin}</strong> repeticiones seguidas. Después de esa
              racha el evento NO era «más probable»: cada repetición es independiente de las anteriores. Eso es la falacia del jugador.
            </div>
          )}
        </Bloque>
      </>
    );
  }

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
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
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "laplace" && (
            <BotonHerramienta icono="fa-circle-half-stroke" titulo="Ver el complemento" activo={complemento} onClick={alternarComplemento} />
          )}
          {modo === "galton" && <BotonHerramienta icono="fa-arrow-down" titulo="Soltar 25 bolas" onClick={() => soltar(25)} />}
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      leyenda={
        <>
          {leyendas[modo].map(([c, t]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: c, flexShrink: 0 }} />
              {t}
            </div>
          ))}
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: control,
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <>
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
              <div style={{ marginTop: 20 }}>
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
              </div>
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Azar, frecuencia y probabilidad" icono="fa-dice">
                <p style={cajaTxt}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Lectura A1 — Azar e incertidumbre" icono="fa-book-open">
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={cajaTxt}>{p}</p>
                ))}
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Datos clave" icono="fa-magnifying-glass-chart">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace", ...NUM }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="México: probabilidad y política pública" icono="fa-location-dot">
                <p style={cajaTxt}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que? (quizzes A2/A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
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
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={GALTON_PROBABILIDAD_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                La lectura A1, las preguntas de reflexión, el glosario A5 (con sus ejemplos), los hechos de «¿sabías que?» (quizzes A2/A4) y el
                reto evaluable son <strong>verbatim</strong> del MCCEMS 2025. Las probabilidades clásicas se <strong>cuentan</strong> sobre el
                espacio muestral que se dibuja en pantalla, y las teóricas del tablero se <strong>calculan</strong> con la fórmula binomial
                C(n,k)·p^k·(1−p)^(n−k). Las bolas y las repeticiones usan el generador de números aleatorios del navegador: los resultados son
                distintos en cada corrida, y esa variación es justamente el fenómeno que el laboratorio enseña. El tablero es un modelo{" "}
                <strong>esquemático</strong>: no simula rebotes físicos reales, sino la decisión de cada clavo. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
