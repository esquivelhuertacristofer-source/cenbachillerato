"use client";

/**
 * Laboratorio 3D — "Técnicas de conteo: contar para decidir".
 * Práctica experimental anclada a PM-VI-P11-A2 (ejercicio «Cuenta y calcula:
 * comités, podios y probabilidad»; progresión 4 de la UAC PM-VI "Pensamiento
 * Matemático VI"). El marco teórico es la lectura A1 y el glosario el A5.
 *
 * Tres modos:
 *  (1) Principio multiplicativo — árbol de decisiones por etapas; el total de
 *      hojas es el producto de las opciones.
 *  (2) ¿Importa el orden? — podio frente a comité con los cinco estudiantes
 *      del ejercicio A2. Los arreglos se enumeran uno por uno, y cada comité
 *      aparece resaltado r! veces en la lista de podios.
 *  (3) Con y sin reemplazo — extracciones de una urna, árbol de probabilidades
 *      condicionadas y simulación frente a teoría.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import type { ObjetivoLab } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { TECNICAS_CONTEO_FICHA } from "./tecnicas-conteo-ficha";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  ETAPAS,
  OPCIONES_MAX,
  PERSONAS,
  enumerarPermutaciones,
  enumerarCombinaciones,
  claveConjunto,
  nombresDe,
  factorial,
  permutacionesCuenta,
  combinacionesCuenta,
  fraccion,
  URNAS,
  urnaPorId,
  arbolExtracciones,
  SITUACIONES,
  respuestaSituacion,
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
  RETO_A2,
} from "./tecnicas-conteo-data";

const ConteoScene = dynamic(() => import("./TecnicasConteoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-sitemap fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el laboratorio de conteo en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-tecnicas-conteo-reto";
const N_PERSONAS = PERSONAS.length;
const ANA = 0;

/* ── Tarjeta de estrellas: ¿permutación o combinación? ────────────────── */
function SituacionesCard({
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
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * SITUACIONES.length));
  const [orden, setOrden] = useState<boolean | null>(null);
  const [valor, setValor] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const s = SITUACIONES[idx]!;
  const correcta = respuestaSituacion(s);

  const comprobar = () => {
    if (orden === null || valor.trim() === "") return;
    const n = Number(valor.trim().replace(/\s/g, ""));
    if (!Number.isFinite(n)) return;
    const k = intentos + 1;
    setIntentos(k);
    const ordenBien = orden === s.importaOrden;
    if (ordenBien && n === correcta) {
      const est = Math.max(1, 4 - k);
      setResuelto(est);
      setAviso(null);
      playSfx?.(true);
      onResultado(est);
      return;
    }
    playSfx?.(false);
    setAviso(
      !ordenBien
        ? "Revisa primero la técnica: ¿cambiar el orden produce un resultado distinto?"
        : `La técnica es correcta, pero la cuenta no. ${s.importaOrden ? "P(n,r) = n!/(n−r)!" : "C(n,r) = n!/[r!(n−r)!]"} con n = ${s.n} y r = ${s.r}.`,
    );
  };

  const otra = () => {
    setIdx((i) => (i + 1 + Math.floor(Math.random() * (SITUACIONES.length - 1))) % SITUACIONES.length);
    setOrden(null);
    setValor("");
    setIntentos(0);
    setResuelto(null);
    setAviso(null);
  };

  const boton = (on: boolean, etq: string, onClick: () => void) => (
    <button
      onClick={onClick}
      disabled={resuelto !== null}
      style={{
        cursor: resuelto !== null ? "default" : "pointer",
        padding: "10px 14px",
        borderRadius: 10,
        border: `1px solid ${on ? accent : T.lineStrong}`,
        background: on ? `rgba(${rgba},0.2)` : "transparent",
        color: on ? "#fff" : T.text2,
        fontSize: 14.5,
        fontWeight: 800,
      }}
    >
      {etq}
    </button>
  );

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Permutación o combinación?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, lineHeight: 1.5, marginBottom: 14 }}>{s.texto}</div>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.06em", marginRight: 4 }}>¿IMPORTA EL ORDEN?</span>
          {boton(orden === true, "Sí — permutación", () => setOrden(true))}
          {boton(orden === false, "No — combinación", () => setOrden(false))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") comprobar();
            }}
            disabled={resuelto !== null}
            inputMode="numeric"
            placeholder="¿Cuántas formas?"
            aria-label="Número de formas"
            style={{ flex: "1 1 160px", minWidth: 0, padding: "11px 13px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "rgba(2,12,28,0.55)", color: "#fff", fontSize: 15, fontWeight: 800, ...NUM }}
          />
          {resuelto === null ? (
            <button
              onClick={comprobar}
              disabled={orden === null || valor.trim() === ""}
              style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.18)`, color: "#fff", fontSize: 14, fontWeight: 900, opacity: orden === null || valor.trim() === "" ? 0.45 : 1 }}
            >
              <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
              Comprobar
            </button>
          ) : (
            <button onClick={otra} style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "transparent", color: "#fff", fontSize: 14, fontWeight: 900 }}>
              <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
              Otra situación
            </button>
          )}
        </div>
      </div>

      {aviso && resuelto === null && (
        <div style={{ marginTop: 12, fontSize: 14, color: "#FF8A3C", lineHeight: 1.5 }}>
          <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
          {aviso} Intento {intentos}.
        </div>
      )}
      {resuelto !== null && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 14.5, fontWeight: 900, color: OK, marginLeft: 4 }}>{intentos === 1 ? "Al primer intento" : `En ${intentos} intentos`}</span>
          </div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
            {s.porque}{" "}
            <strong style={{ color: "#fff", ...NUM }}>
              {s.importaOrden ? `P(${s.n},${s.r})` : `C(${s.n},${s.r})`} = {correcta}
            </strong>
            .
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabTecnicasConteo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("multiplicativo");

  // ── Multiplicativo: el ejemplo verbatim de la lectura (3 playeras × 2 pantalones)
  const [opciones, setOpciones] = useState<number[]>([3, 2]);

  // ── Orden
  const [r, setR] = useState(3);
  const [importaOrden, setImportaOrden] = useState(true);
  const [idx, setIdx] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [soloConAna, setSoloConAna] = useState(false);

  // ── Reemplazo
  const [urnaId, setUrnaId] = useState(URNAS[0]!.id);
  const [conReemplazoElegido, setConReemplazo] = useState(false);
  const [primera, setPrimera] = useState<number | null>(null);
  const [segunda, setSegunda] = useState<number | null>(null);
  const [sim, setSim] = useState<{ pares: number; ambas: number }>({ pares: 0, ambas: 0 });

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Logros pegajosos
  const [agregoEtapa, setAgregoEtapa] = useState(false);
  const [movioOpciones, setMovioOpciones] = useState(false);
  /** Cuántos podios ha visto pasar el alumno, a mano o en reproducción. */
  const [podiosRecorridos, setPodiosRecorridos] = useState(0);
  const [vioComite, setVioComite] = useState(false);
  const [filtroAna, setFiltroAna] = useState(false);
  const [extraccionesPor, setExtraccionesPor] = useState<Set<"con" | "sin">>(() => new Set());
  const [simulo, setSimulo] = useState(false);
  const [predicho, setPredicho] = useState(false);

  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
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

  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };

  /* ── Derivados ─────────────────────────────────────────────────────── */
  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  const hojas = opciones.reduce((a, b) => a * b, 1);

  const todos = useMemo(
    () => (importaOrden ? enumerarPermutaciones(N_PERSONAS, r) : enumerarCombinaciones(N_PERSONAS, r)),
    [importaOrden, r],
  );
  const lista = useMemo(() => (soloConAna ? todos.filter((a) => a.includes(ANA)) : todos), [todos, soloConAna]);
  const idxSeguro = lista.length === 0 ? 0 : Math.min(idx, lista.length - 1);
  const arreglo = lista[idxSeguro] ?? [];
  const claveActual = claveConjunto(arreglo);
  const P = permutacionesCuenta(N_PERSONAS, r);
  const C = combinacionesCuenta(N_PERSONAS, r);
  const rFact = factorial(r);
  const conAnaCuenta = todos.filter((a) => a.includes(ANA)).length;

  const urna = urnaPorId(urnaId);
  const conReemplazo = urna.soloConReemplazo || conReemplazoElegido;
  const arbol = arbolExtracciones(urna, conReemplazo);
  const arbolOtro = arbolExtracciones(urna, !conReemplazo);
  const pAmbas = arbol.ambas.num / arbol.ambas.den;
  const esEspecial = (i: number) => i >= urna.total - urna.marcadas;

  /* ── Reproducción automática de arreglos ───────────────────────────── */
  useEffect(() => {
    if (modo !== "orden" || !reproduciendo || lista.length === 0) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % lista.length);
      if (importaOrden) setPodiosRecorridos((n) => n + 1);
    }, 1150);
    return () => window.clearInterval(id);
  }, [modo, reproduciendo, lista.length, importaOrden]);

  /* ── Acciones ──────────────────────────────────────────────────────── */
  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setReproduciendo(false);
    blip();
    bump();
  };

  const cambiarOpcion = (k: number, v: number) => {
    setMovioOpciones(true);
    setOpciones((prev) => prev.map((x, i) => (i === k ? v : x)));
    blip();
  };
  const alternarTercera = () => {
    setOpciones((prev) => (prev.length === 3 ? prev.slice(0, 2) : [...prev, 2]));
    setAgregoEtapa(true);
    blip();
  };

  const moverIdx = (delta: number) => {
    if (lista.length === 0) return;
    if (importaOrden) setPodiosRecorridos((n) => n + 1);
    setIdx((i) => (Math.min(i, lista.length - 1) + delta + lista.length) % lista.length);
    blip();
  };
  const elegirIdx = (i: number) => {
    if (importaOrden && i !== idxSeguro) setPodiosRecorridos((n) => n + 1);
    setIdx(i);
    setReproduciendo(false);
    blip();
  };

  /**
   * Cambia entre podio y comité conservando a las mismas personas: el comité
   * del podio actual (o el primer podio de ese comité) queda seleccionado.
   */
  const cambiarOrden = (conOrden: boolean) => {
    if (conOrden === importaOrden) return;
    const clave = claveConjunto(arreglo);
    const nuevaLista = (conOrden ? enumerarPermutaciones(N_PERSONAS, r) : enumerarCombinaciones(N_PERSONAS, r)).filter((a) => !soloConAna || a.includes(ANA));
    const j = nuevaLista.findIndex((a) => claveConjunto(a) === clave);
    setImportaOrden(conOrden);
    setIdx(Math.max(0, j));
    if (!conOrden) setVioComite(true);
    blip();
  };

  const cambiarR = (nr: number) => {
    setR(nr);
    setIdx(0);
    blip();
  };

  const alternarAna = () => {
    const nuevo = !soloConAna;
    setSoloConAna(nuevo);
    setIdx(0);
    if (nuevo) setFiltroAna(true);
    blip();
  };

  const elegirUrna = (id: string) => {
    setUrnaId(id);
    setPrimera(null);
    setSegunda(null);
    setSim({ pares: 0, ambas: 0 });
    blip();
  };

  const alternarReemplazo = () => {
    if (urna.soloConReemplazo) return;
    setConReemplazo((c) => !c);
    setPrimera(null);
    setSegunda(null);
    setSim({ pares: 0, ambas: 0 });
    blip();
  };

  const extraer = () => {
    const N = urna.total;
    if (primera === null) {
      const i = Math.floor(Math.random() * N);
      setPrimera(i);
      if (sonido) audioRef.current?.blip();
    } else if (segunda === null) {
      let j = Math.floor(Math.random() * (conReemplazo ? N : N - 1));
      if (!conReemplazo && j >= primera) j += 1; // salta la bola que ya salió
      setSegunda(j);
      setExtraccionesPor((s) => new Set(s).add(conReemplazo ? "con" : "sin"));
      if (sonido) {
        if (esEspecial(primera) && esEspecial(j)) audioRef.current?.correcto();
        else audioRef.current?.blip();
      }
    } else {
      setPrimera(null);
      setSegunda(null);
    }
  };

  const simular = (pares: number) => {
    const N = urna.total;
    const K = urna.marcadas;
    let ambas = 0;
    for (let k = 0; k < pares; k++) {
      const a = Math.floor(Math.random() * N);
      let b = Math.floor(Math.random() * (conReemplazo ? N : N - 1));
      if (!conReemplazo && b >= a) b += 1;
      if (a >= N - K && b >= N - K) ambas++;
    }
    setSim((s) => {
      const nx = { pares: s.pares + pares, ambas: s.ambas + ambas };
      if (nx.pares >= 1000) setSimulo(true);
      return nx;
    });
    if (sonido) audioRef.current?.correcto();
  };

  const reiniciar = () => {
    if (modo === "multiplicativo") setOpciones([3, 2]);
    else if (modo === "orden") {
      setIdx(0);
      setReproduciendo(false);
    } else {
      setPrimera(null);
      setSegunda(null);
      setSim({ pares: 0, ambas: 0 });
    }
    bump();
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: ObjetivoLab[] = [
    { txt: "Cambia las opciones de una etapa y mira cómo se multiplican las hojas", done: movioOpciones },
    { txt: "Agregar una tercera etapa al árbol y ver cómo se multiplican las hojas", done: agregoEtapa },
    { txt: "Recorrer al menos 5 podios distintos", done: podiosRecorridos >= 5 },
    { txt: "Pasar del podio al comité con las mismas personas", done: vioComite },
    { txt: "Contar solo los arreglos que incluyen a Ana (inciso c)", done: filtroAna },
    { txt: "Extraer dos veces con reemplazo y dos veces sin reemplazo", done: extraccionesPor.size === 2 },
    { txt: "Simular al menos 1000 pares de extracciones", done: simulo },
    { txt: "Resolver una situación de conteo y ganar estrellas", done: predicho },
    { txt: "Resolver el reto evaluable (ejercicio A2)", done: ejercicioAprobado },
  ];

  /* ── Pie del visor ─────────────────────────────────────────────────── */
  const pie: string =
    modo === "multiplicativo"
      ? `${opciones.map((n, k) => `${n} ${ETAPAS[k]!.nombre.toLowerCase()}`).join(" × ")} = ${hojas} resultados distintos. Cada hoja del árbol es una forma de combinar una opción de cada etapa.`
      : modo === "orden"
        ? importaOrden
          ? `Podio ${idxSeguro + 1} de ${lista.length}: ${nombresDe(arreglo)}. Hay P(5,${r}) = ${Array.from({ length: r }, (_, k) => 5 - k).join(" × ")} = ${P} podios: cada lugar tiene una opción menos que el anterior.`
          : `Comité ${idxSeguro + 1} de ${lista.length}: ${nombresDe(arreglo)}. Hay C(5,${r}) = ${C} comités: cada uno corresponde a ${rFact} podios, porque sus ${r} integrantes se pueden ordenar de ${r}! = ${rFact} formas.`
        : primera === null
          ? `${urna.nota}`
          : segunda === null
            ? `La primera fue ${esEspecial(primera) ? urna.especial : `no ${urna.especial}`}. ${conReemplazo ? "Vuelve a la urna: la segunda extracción tiene las mismas probabilidades." : `Se queda fuera: quedan ${urna.total - 1} en la urna.`}`
            : `Salió ${esEspecial(primera) ? urna.especial : `no ${urna.especial}`} y luego ${esEspecial(segunda) ? urna.especial : `no ${urna.especial}`}. P(las dos ${urna.especiales}) = ${fraccion(arbol.ambas.num, arbol.ambas.den)} ≈ ${pAmbas.toFixed(4)}.`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
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

  /* ── Panel por modo ────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "multiplicativo") {
    control = (
      <>
        <div style={{ display: "grid", gap: 12 }}>
          {opciones.map((n, k) => (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, fontWeight: 800, color: T.text2, marginBottom: 6 }}>
                <span>
                  <i className={`fa-solid ${ETAPAS[k]!.icono}`} style={{ color: ETAPAS[k]!.color, marginRight: 7 }} />
                  Etapa {k + 1}: {ETAPAS[k]!.nombre}
                </span>
                <span style={{ color: ETAPAS[k]!.color, ...NUM }}>{n} opciones</span>
              </div>
              <div className="tc-opts">
                {Array.from({ length: OPCIONES_MAX }, (_, i) => i + 1).map((v) => (
                  <button key={v} className="tc-opt" data-on={v === n} onClick={() => cambiarOpcion(k, v)} style={{ ["--tcc" as string]: ETAPAS[k]!.color, background: v === n ? `${ETAPAS[k]!.color}22` : "transparent", minWidth: 44, ...NUM }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="tc-toggle" data-on={opciones.length === 3} onClick={alternarTercera} style={{ marginTop: 14, ["--tcc" as string]: opciones.length === 3 ? ETAPAS[2]!.color : "rgba(255,255,255,0.2)" }}>
          <i className={`fa-solid ${opciones.length === 3 ? "fa-minus" : "fa-plus"}`} style={{ marginRight: 9, color: ETAPAS[2]!.color }} />
          {opciones.length === 3 ? "Quitar la etapa de zapatos" : "Agregar una tercera etapa: zapatos"}
        </button>

        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", textAlign: "center", ...NUM }}>
            {opciones.map((n, k) => (
              <span key={k}>
                {k > 0 && <span style={{ color: T.text3 }}> × </span>}
                <span style={{ color: ETAPAS[k]!.color }}>{n}</span>
              </span>
            ))}
            <span style={{ color: T.text3 }}> = </span>
            <span style={{ color: accent }}>{hojas}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 14, color: T.text2, lineHeight: 1.55, textAlign: "center" }}>
            Cada etapa multiplica a todas las ramas que ya había, por eso agregar una etapa de 2 opciones duplica el total.
          </div>
        </div>
      </>
    );
  } else if (modo === "orden") {
    control = (
      <>
        <div className="tc-opts">
          <button className="tc-opt" data-on={importaOrden} onClick={() => cambiarOrden(true)} style={{ ["--tcc" as string]: modoCol, background: importaOrden ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-ranking-star" style={{ marginRight: 8, color: modoCol }} />
            Podio — sí importa el orden
          </button>
          <button className="tc-opt" data-on={!importaOrden} onClick={() => cambiarOrden(false)} style={{ ["--tcc" as string]: modoCol, background: !importaOrden ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-people-group" style={{ marginRight: 8, color: modoCol }} />
            Comité — no importa
          </button>
        </div>

        {sub("Lugares a ocupar (r)")}
        <div className="tc-opts">
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} className="tc-opt" data-on={v === r} onClick={() => cambiarR(v)} style={{ ["--tcc" as string]: accent, background: v === r ? `rgba(${color.rgba},0.18)` : "transparent", minWidth: 44, ...NUM }}>
              {v}
            </button>
          ))}
        </div>

        <button className="tc-toggle" data-on={soloConAna} onClick={alternarAna} style={{ marginTop: 12, ["--tcc" as string]: soloConAna ? PERSONAS[ANA]!.color : "rgba(255,255,255,0.2)" }}>
          <i className="fa-solid fa-filter" style={{ marginRight: 9, color: PERSONAS[ANA]!.color }} />
          {soloConAna ? `Solo los que incluyen a Ana: ${conAnaCuenta} de ${todos.length}` : "Mostrar solo los que incluyen a Ana"}
        </button>

        <div style={{ marginTop: 13, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Readout label={`P(5,${r})`} value={String(P)} col={importaOrden ? accent : undefined} />
            <Readout label={`C(5,${r})`} value={String(C)} col={!importaOrden ? accent : undefined} />
            <Readout label={`${r}!`} value={String(rFact)} />
          </div>
          <div style={{ marginTop: 4, fontSize: 14.5, color: "#fff", lineHeight: 1.6, fontFamily: "ui-monospace, monospace", textAlign: "center", ...NUM }}>
            P(5,{r}) = C(5,{r}) × {r}! → {P} = {C} × {rFact}
          </div>
          {soloConAna && (
            <div style={{ marginTop: 6, fontSize: 14, color: T.text2, lineHeight: 1.55, textAlign: "center", ...NUM }}>
              P(Ana incluida) = {conAnaCuenta}/{todos.length} = {fraccion(conAnaCuenta, todos.length)} = {(conAnaCuenta / todos.length).toFixed(2)}
            </div>
          )}
        </div>

        {sub(importaOrden ? "Podio actual" : "Comité actual", <span style={{ color: "#fff", ...NUM }}> — {lista.length === 0 ? 0 : idxSeguro + 1} de {lista.length}</span>)}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="tc-icon" onClick={() => moverIdx(-1)} title="Anterior" aria-label="Anterior">
            <i className="fa-solid fa-backward-step" />
          </button>
          <button className="tc-icon" data-on={reproduciendo} onClick={() => setReproduciendo((p) => !p)} title={reproduciendo ? "Pausar" : "Reproducir"} aria-label={reproduciendo ? "Pausar" : "Reproducir"}>
            <i className={`fa-solid ${reproduciendo ? "fa-pause" : "fa-play"}`} />
          </button>
          <button className="tc-icon" onClick={() => moverIdx(1)} title="Siguiente" aria-label="Siguiente">
            <i className="fa-solid fa-forward-step" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{nombresDe(arreglo)}</span>
        </div>

        {sub(importaOrden ? `Todos los podios · resaltados: los ${rFact} órdenes de este mismo grupo` : "Todos los comités")}
        <div className="tc-lista">
          {lista.map((a, i) => {
            const mismoGrupo = claveConjunto(a) === claveActual;
            const actual = i === idxSeguro;
            return (
              <button
                key={a.join("-")}
                className="tc-item"
                onClick={() => elegirIdx(i)}
                style={{
                  borderColor: actual ? accent : mismoGrupo && importaOrden ? `${modoCol}aa` : T.line,
                  background: actual ? `rgba(${color.rgba},0.22)` : mismoGrupo && importaOrden ? `${modoCol}1c` : "rgba(4,10,22,0.4)",
                }}
              >
                {a.map((p, k) => (
                  <span key={k} style={{ color: PERSONAS[p]!.color }}>
                    {k > 0 && <span style={{ color: T.text3 }}>{importaOrden ? "›" : ","}</span>}
                    {PERSONAS[p]!.inicial}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </>
    );
  } else {
    const fr = (x: { num: number; den: number }) => `${x.num}/${x.den}`;
    control = (
      <>
        <div className="tc-opts">
          {URNAS.map((u) => {
            const on = u.id === urnaId;
            return (
              <button key={u.id} className="tc-opt" data-on={on} onClick={() => elegirUrna(u.id)} style={{ ["--tcc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                {u.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 14.5, color: T.text3, lineHeight: 1.5 }}>{urna.nota}</div>

        <button
          className="tc-toggle"
          data-on={conReemplazo}
          onClick={alternarReemplazo}
          disabled={urna.soloConReemplazo}
          style={{ marginTop: 12, ["--tcc" as string]: conReemplazo ? "#34d399" : "#f87171", opacity: urna.soloConReemplazo ? 0.7 : 1, cursor: urna.soloConReemplazo ? "not-allowed" : "pointer" }}
        >
          <i className={`fa-solid ${conReemplazo ? "fa-rotate-left" : "fa-ban"}`} style={{ marginRight: 9, color: conReemplazo ? "#34d399" : "#f87171" }} />
          {urna.soloConReemplazo ? "Con reemplazo (un dado no puede ser de otra forma)" : conReemplazo ? "Con reemplazo — cambiar a sin reemplazo" : "Sin reemplazo — cambiar a con reemplazo"}
        </button>

        <div className="tc-opts" style={{ marginTop: 12 }}>
          <button className="tc-opt" data-on onClick={extraer} style={{ ["--tcc" as string]: accent, background: `rgba(${color.rgba},0.16)` }}>
            <i className={`fa-solid ${segunda !== null ? "fa-rotate-left" : "fa-hand"}`} style={{ marginRight: 8, color: accent }} />
            {primera === null ? "Sacar la 1.ª" : segunda === null ? "Sacar la 2.ª" : "Devolver todo a la urna"}
          </button>
          <button className="tc-opt" data-on={false} onClick={() => simular(5000)} style={{ ["--tcc" as string]: modoCol }}>
            <i className="fa-solid fa-forward-fast" style={{ marginRight: 8, color: modoCol }} />
            Simular 5 000 pares
          </button>
        </div>

        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
            <i className="fa-solid fa-code-branch" style={{ color: modoCol, marginRight: 8 }} />
            Árbol de probabilidades
          </div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, lineHeight: 1.8, color: "#eaf0fb", ...NUM }}>
            <div>
              P(1.ª {urna.especial}) = <span style={{ color: "#fbbf24" }}>{fr(arbol.p1)}</span>
            </div>
            <div style={{ paddingLeft: 14 }}>
              └ P(2.ª {urna.especial} | 1.ª {urna.especial}) = <span style={{ color: "#fbbf24" }}>{fr(arbol.p2dado1)}</span>
            </div>
            <div style={{ paddingLeft: 14 }}>
              └ P(2.ª {urna.especial} | 1.ª no) = <span style={{ color: T.text2 }}>{fr(arbol.p2dadoNo1)}</span>
            </div>
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.line}`, fontWeight: 900, color: "#fff" }}>
              P(las dos) = {fr(arbol.p1)} × {fr(arbol.p2dado1)} = <span style={{ color: accent }}>{fraccion(arbol.ambas.num, arbol.ambas.den)}</span> ≈ {pAmbas.toFixed(4)}
            </div>
            {!urna.soloConReemplazo && (
              <div style={{ color: T.text3, fontSize: 14.5 }}>
                {conReemplazo ? "Sin" : "Con"} reemplazo sería {fraccion(arbolOtro.ambas.num, arbolOtro.ambas.den)} ≈ {(arbolOtro.ambas.num / arbolOtro.ambas.den).toFixed(4)}
              </div>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 14.5, color: T.text2, lineHeight: 1.5 }}>
            {conReemplazo
              ? "Las dos ramas de la 2.ª extracción valen lo mismo: lo que salió primero no cambia nada. Eventos independientes."
              : "Las ramas de la 2.ª extracción son distintas: dependen de lo que salió primero. Eventos dependientes."}
          </div>
        </div>

        {sim.pares > 0 && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.4)" }}>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Readout label="Pares" value={sim.pares.toLocaleString("es-MX")} />
              <Readout label="Las dos" value={sim.ambas.toLocaleString("es-MX")} col="#fbbf24" />
              <Readout label="Frecuencia" value={(sim.ambas / sim.pares).toFixed(4)} col={accent} />
              <Readout label="Teoría" value={pAmbas.toFixed(4)} col={modoCol} />
            </div>
          </div>
        )}
      </>
    );
  }

  const lectura: ReactNode =
    modo === "multiplicativo"
      ? `${opciones.join(" × ")} = ${hojas} resultados`
      : modo === "orden"
        ? importaOrden
          ? `P(5,${r}) = ${P} podios distintos`
          : `C(5,${r}) = ${C} comités distintos`
        : `P(las dos) = ${fraccion(arbol.ambas.num, arbol.ambas.den)} ≈ ${pAmbas.toFixed(4)}`;

  const sonidoOk = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ConteoScene
            modo={modo}
            opciones={opciones}
            r={r}
            importaOrden={importaOrden}
            arreglo={arreglo}
            urna={urna}
            conReemplazo={conReemplazo}
            primera={primera}
            segunda={segunda}
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
          {modo === "orden" && <BotonHerramienta icono={reproduciendo ? "fa-pause" : "fa-play"} titulo={reproduciendo ? "Pausar" : "Reproducir arreglos"} activo={reproduciendo} onClick={() => setReproduciendo((p) => !p)} />}
          {modo === "reemplazo" && <BotonHerramienta icono="fa-hand" titulo="Extraer" onClick={extraer} />}
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{`
                .tc-opts { display:flex; flex-wrap:wrap; gap:7px; }
                .tc-opt { cursor:pointer; border:1px solid var(--tcc); border-radius:10px; padding:9px 12px; font-size:14px;
                  font-weight:800; color:#fff; background:transparent; transition:all .15s; }
                .tc-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
                .tc-opt:hover { background:rgba(255,255,255,0.06); }
                .tc-toggle { width:100%; cursor:pointer; border:1px solid var(--tcc); border-radius:11px; padding:11px 14px;
                  background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
                .tc-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
                .tc-icon { cursor:pointer; width:40px; height:40px; border-radius:10px; border:1px solid ${T.lineStrong}; background:rgba(4,10,22,0.4);
                  color:#fff; font-size:14px; display:flex; align-items:center; justify-content:center; }
                .tc-icon[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); }
                .tc-lista { display:flex; flex-wrap:wrap; gap:5px; max-height:190px; overflow-y:auto; padding-right:4px; }
                .tc-item { cursor:pointer; border:1px solid; border-radius:8px; padding:5px 8px; font-size:14px; font-weight:900;
                  font-family:ui-monospace, monospace; transition:transform .1s; }
                .tc-item:hover { transform:translateY(-1px); }
              `}</style>
              <Bloque titulo={def.etq} icono={def.icono}>
                {control}
              </Bloque>
              <Bloque titulo="Lo que se lee en la escena" icono="fa-eye">
                <p style={{ margin: 0, color: T.text2 }}>{pie}</p>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <>
              <SituacionesCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sonidoOk} />
              <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={ejercicioAprobado} onAprobado={() => setEjercicioAprobado(true)} playSfx={sonidoOk} />
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Contar para decidir" icono="fa-sitemap">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Lectura A1 — Técnicas de conteo" icono="fa-book-open">
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>{p}</p>
                ))}
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
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
              <Bloque titulo="Contar antes de apostar" icono="fa-ticket">
                <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que? (quiz A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                {GLOSARIO.map((gi, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                    <span style={{ color: T.text2 }}>{gi.definicion}</span>
                    <div style={{ fontSize: 14, color: T.text3, marginTop: 4 }}>
                      <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />
                      {gi.ejemplo}
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TECNICAS_CONTEO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                La lectura A1, las preguntas de reflexión, el glosario A5, los hechos del quiz A4 y el ejercicio A2 son verbatim del MCCEMS 2025. Los podios y comités se enumeran uno por uno y los totales son el tamaño de esas listas; las probabilidades del árbol son fracciones exactas. Las extracciones y la simulación usan el generador aleatorio del navegador. Las situaciones de la tarjeta de estrellas son ejercicios de práctica del laboratorio, no material oficial. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
