"use client";

/**
 * Laboratorio 3D — «Jerarquía de operaciones».
 * Pensamiento Matemático I, progresión 7 (actividades PM-I-P10-A1 … A9).
 * Propósito: «Aplica los elementos de la aritmética para resolver cálculos
 * combinados con números reales.»
 *
 * Tres modos:
 *  (1) Torre de pasos — el alumno elige qué operación va primero; cada acierto
 *      baja un renglón (como en el cuaderno) y cada error muestra el resultado
 *      equivocado que produce y por qué. También se puede ver como árbol.
 *  (2) ¿Quién tiene razón? — la misma expresión leída por dos máquinas o
 *      personas con reglas distintas (calculadora básica, hoja de cálculo,
 *      multiplicación implícita…); predice, mira sus árboles y reescríbela.
 *  (3) Constructor — signos y paréntesis para llegar a una meta; cada resultado
 *      cae en la recta numérica.
 *
 * Evaluables verbatim: ejercicios A2 y A6 (RetoNumericoCard), quiz A4
 * (RetoQuizCard), ordenar pasos A9. Hechos: V/F A5 y A8. Marco teórico: A1.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { JERARQUIA_OPERACIONES_FICHA } from "./jerarquia-operaciones-ficha";
import {
  type Modo,
  type OpBin,
  type Rechazo,
  type Categoria,
  MODOS,
  MODOS_DEF,
  CATEGORIA_DEF,
  EXPRESIONES,
  CASOS,
  RETOS_CONSTRUCTOR,
  AGRUPACIONES,
  OPS,
  BANCO_PRIMERO,
  leer,
  reproducir,
  resolverTodo,
  porQueNo,
  serializar,
  textoTok,
  textoNodo,
  valorTexto,
  escritoDe,
  textoConstructor,
  valorConstructor,
  qDeTexto,
  igualQ,
  restaQ,
  claveQ,
  fmtQ,

  categoriaDe,
  buscar,
  listos,
  rondaPrimero,
  mulberry32,
  estrellasPorErrores,
  PASOS_A9,
  INSTRUCCIONES_A9,
  ORDEN_INICIAL_A9,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  HECHOS,
  GLOSARIO_LAB,
  REFLEXION_A3,
  AUTOEVAL_A7,
  FUENTE,
  PROPOSITO,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A4,
  RETO_A2,
  RETO_A6,
  type Nodo,
} from "./jerarquia-operaciones-data";

const JerarquiaScene = dynamic(() => import("./JerarquiaOperacionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-layer-group fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Armando la torre de operaciones en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-jerarquia-operaciones-reto";
const WARN = "#FF8A3C";
const T_PASO_AUTO = 1100;
const RONDA_INICIAL = rondaPrimero(mulberry32(7));
const OPS_INICIALES: OpBin[] = ["+", "+", "+"];

const catCol = (c: Categoria) => CATEGORIA_DEF[c].color;

/** Una expresión escrita con sus operaciones como botones. */
function TiraExpresion({ arbol, onElegir, marcado, clase, deshabilitada }: { arbol: Nodo; onElegir?: (id: string) => void; marcado?: string | null; clase: string; deshabilitada?: boolean }) {
  const tv = serializar(arbol);
  const toks = tv.map((x) => x.tok);
  return (
    <div className="jo-tira">
      {tv.map((x, i) => {
        const txt = textoTok(x.tok, i === 0, toks[i + 1]);
        const esOp = x.tok.t === "op" || x.tok.t === "pot" || x.tok.t === "raiz";
        if (esOp && !(x.tok.t === "op" && x.tok.implicita)) {
          const cat = categoriaDe(buscar(arbol, x.nodo)!);
          const on = marcado === x.nodo;
          return (
            <button key={i} className={`jo-op ${clase}`} data-idx={i} disabled={deshabilitada} onClick={() => onElegir?.(x.nodo)} aria-label={`Operación ${txt} (posición ${i + 1})`} style={{ ["--joc" as string]: on ? WARN : catCol(cat) }}>
              {txt}
            </button>
          );
        }
        return (
          <span key={i} className={`jo-tk ${x.tok.t === "abre" || x.tok.t === "cierra" ? "jo-par" : ""}`} style={x.tok.t === "abre" || x.tok.t === "cierra" ? { color: catCol("agrupacion") } : undefined}>
            {txt}
          </span>
        );
      })}
    </div>
  );
}

/* ── Tarjeta de estrellas: ¿qué va primero? ─────────────────────────────── */
function PrimeroCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [marcado, setMarcado] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const texto = BANCO_PRIMERO[ronda[pos] ?? 0]!;
  const arbol = useMemo(() => leer(texto), [texto]);

  const elegir = (id: string) => {
    if (resuelto !== null) return;
    const ok = listos(arbol).includes(id);
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setMarcado(id);
      setAviso(porQueNo(arbol, id)?.razon ?? "Esa todavía no.");
      return;
    }
    setAviso(null);
    setMarcado(null);
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaPrimero(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setMarcado(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Qué va primero?
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
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 8 }}>
            Expresión {pos + 1} de {ronda.length} · toca la operación que se hace primero
          </div>
          <div className="jo-primero">
            <TiraExpresion arbol={arbol} onElegir={elegir} marcado={marcado} clase="jo-pri-op" />
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

/* ── Ordena los pasos (A9) ──────────────────────────────────────────────── */
function OrdenaA9Card({ accent, completado, onCompletado, playSfx, playPick }: { accent: string; completado: boolean; onCompletado: () => void; playSfx?: (ok: boolean) => void; playPick?: () => void }) {
  const [orden, setOrden] = useState<number[]>(ORDEN_INICIAL_A9);
  const [comprobado, setComprobado] = useState(false);
  const bien = orden.every((v, i) => v === i);
  const mover = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= orden.length) return;
    setOrden((o) => {
      const n = [...o];
      [n[i], n[j]] = [n[j]!, n[i]!];
      return n;
    });
    setComprobado(false);
    playPick?.();
  };
  const comprobar = () => {
    setComprobado(true);
    playSfx?.(bien);
    if (bien) onCompletado();
  };
  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-arrow-down-1-9" style={{ marginRight: 8, color: accent }} />
        Ordena los pasos (A9)
      </Eyebrow>
      <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{INSTRUCCIONES_A9}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {orden.map((k, i) => {
          const paso = PASOS_A9[k]!;
          const ok = comprobado && k === i;
          const mal = comprobado && k !== i;
          return (
            <div key={k} className="jo-a9" style={{ borderColor: ok ? `${OK}88` : mal ? `${WARN}88` : T.line }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: ok ? OK : mal ? WARN : accent, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, ...NUM }}>{paso.texto}</div>
                {comprobado && bien && (
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, marginTop: 3 }}>
                    <strong style={{ color: OK }}>{paso.marca}</strong> {paso.explicacion}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <button className="jo-mini" onClick={() => mover(i, -1)} disabled={i === 0 || completado} aria-label={`Subir paso ${i + 1}`}>
                  <i className="fa-solid fa-chevron-up" />
                </button>
                <button className="jo-mini" onClick={() => mover(i, 1)} disabled={i === orden.length - 1 || completado} aria-label={`Bajar paso ${i + 1}`}>
                  <i className="fa-solid fa-chevron-down" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
        <button className="jo-comprobar" onClick={comprobar} disabled={completado} style={{ background: accent }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
          Comprobar el orden
        </button>
        {comprobado && !bien && <span style={{ fontSize: 12, color: WARN, fontWeight: 700 }}>Los pasos en naranja no van ahí. Piensa qué se puede hacer primero en 8 + 3 × (10 − 6)² ÷ 4.</span>}
        {completado && (
          <span style={{ fontSize: 12.5, color: OK, fontWeight: 800 }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
            Orden correcto: el resultado es 20.
          </span>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabJerarquiaOperaciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("pasos");

  // ── Torre de pasos
  const [exprIdx, setExprIdx] = useState(0);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [error, setError] = useState<{ id: string; r: Rechazo } | null>(null);
  const [erroresExpr, setErroresExpr] = useState(0);
  const [verArbol, setVerArbol] = useState(false);
  const [resueltas, setResueltas] = useState<Set<string>>(() => new Set());
  const [vioErronea, setVioErronea] = useState(false);
  const [a9Hecho, setA9Hecho] = useState(false);
  const [realesSinError, setRealesSinError] = useState(false);

  // ── ¿Quién tiene razón?
  const [casoIdx, setCasoIdx] = useState(0);
  const [prediccion, setPrediccion] = useState<string | null>(null);
  const [pasoAuto, setPasoAuto] = useState(0);
  const [reescrita, setReescrita] = useState<number | null>(null);
  const [revisados, setRevisados] = useState<Set<string>>(() => new Set());
  const [acertados, setAcertados] = useState<Set<string>>(() => new Set());
  const [reescritos, setReescritos] = useState<Set<string>>(() => new Set());
  const corrida = useRef(0);

  // ── Constructor
  const [retoIdx, setRetoIdx] = useState(0);
  const [ops, setOps] = useState<OpBin[]>(OPS_INICIALES);
  const [grupo, setGrupo] = useState("g0");
  const [hallados, setHallados] = useState<string[]>(() => {
    const v = valorConstructor(RETOS_CONSTRUCTOR[0]!.numeros, OPS_INICIALES, "g0");
    return v ? [claveQ(v)] : [];
  });
  const [metas, setMetas] = useState<Set<string>>(() => new Set());
  const [maxDistintos, setMaxDistintos] = useState(1);
  const [verPista, setVerPista] = useState(false);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizOk, setQuizOk] = useState(false);
  const [ordenOk, setOrdenOk] = useState(false);
  const [a2Ok, setA2Ok] = useState(false);
  const [a6Ok, setA6Ok] = useState(false);

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

  /* ── Torre de pasos ────────────────────────────────────────────────── */
  const expr = EXPRESIONES[exprIdx]!;
  const arbol0 = useMemo(() => leer(expr.texto), [expr.texto]);
  const totalPasos = useMemo(() => resolverTodo(arbol0).length, [arbol0]);
  const pasos = useMemo(() => reproducir(arbol0, elegidos), [arbol0, elegidos]);
  const actual = pasos.length ? pasos[pasos.length - 1]!.despues : arbol0;
  const terminado = actual.k === "num";
  const ultimo = pasos[pasos.length - 1];

  const elegir = (id: string) => {
    if (terminado) return;
    const r = porQueNo(actual, id);
    if (r) {
      setError({ id, r });
      setErroresExpr((e) => e + 1);
      if (r.erronea) setVioErronea(true);
      sfx(false);
      return;
    }
    const nuevos = [...elegidos, id];
    const rep = reproducir(arbol0, nuevos);
    if (rep.length !== nuevos.length) return;
    setElegidos(nuevos);
    setError(null);
    const fin = rep[rep.length - 1]!.despues.k === "num";
    if (fin) {
      sfx(true);
      setResueltas((s) => new Set(s).add(expr.id));
      if (expr.id === "a9") setA9Hecho(true);
      if (expr.reales && erroresExpr === 0) setRealesSinError(true);
    } else blip();
  };
  const cambiarExpr = (i: number) => {
    setExprIdx(i);
    setElegidos([]);
    setError(null);
    setErroresExpr(0);
    blip();
  };
  const reiniciarExpr = () => {
    setElegidos([]);
    setError(null);
    setErroresExpr(0);
  };

  const errorTexto = error ? (error.r.erronea ? `Si la haces primero: ${error.r.erronea.expresion} = ${error.r.erronea.valor}${error.r.erronea.coincide ? " (esta vez coincide)" : ""}` : "Todavía no se puede hacer esa operación") : null;

  /* ── ¿Quién tiene razón? ───────────────────────────────────────────── */
  const caso = CASOS[casoIdx]!;
  const lecturas = useMemo(
    () =>
      (["izq", "der"] as const).map((lado) => {
        const maq = lado === "izq" ? caso.izq : caso.der;
        const a = leer(escritoDe(caso, lado), maq.lectura, lado);
        return { lado, maq, valor: valorTexto(a), pasos: resolverTodo(a).length };
      }),
    [caso],
  );
  const maxAuto = Math.max(...lecturas.map((l) => l.pasos));
  const opcionesValor = [...new Set(lecturas.map((l) => l.valor))];
  const revelado = prediccion !== null;
  const autoListo = revelado && pasoAuto >= maxAuto;

  const predecir = (v: string) => {
    if (revelado) return;
    setPrediccion(v);
    setRevisados((s) => new Set(s).add(caso.id));
    const ok = v === caso.respuesta;
    if (ok) setAcertados((s) => new Set(s).add(caso.id));
    sfx(ok);
    const token = ++corrida.current;
    for (let k = 1; k <= maxAuto + 1; k++)
      despues(T_PASO_AUTO * k, () => {
        if (corrida.current === token) setPasoAuto(k);
      });
  };
  const cambiarCaso = (i: number) => {
    corrida.current++;
    setCasoIdx(i);
    setPrediccion(null);
    setPasoAuto(0);
    setReescrita(null);
    blip();
  };
  const reescribir = (i: number) => {
    if (reescrita === caso.correcta) return;
    setReescrita(i);
    const ok = i === caso.correcta;
    sfx(ok);
    if (ok) setReescritos((s) => new Set(s).add(caso.id));
  };
  const valoresOpcion = (texto: string) => lecturas.map((l) => valorTexto(leer(texto, l.maq.lectura, "o")));

  /* ── Constructor ───────────────────────────────────────────────────── */
  const reto = RETOS_CONSTRUCTOR[retoIdx]!;
  const textoC = textoConstructor(reto.numeros, ops, grupo);
  const vC = valorConstructor(reto.numeros, ops, grupo);
  const metaQ = qDeTexto(reto.meta);
  const logrado = !!vC && igualQ(vC, metaQ);

  const probar = (nOps: OpBin[], nGrupo: string, idx: number, reiniciaHallados: boolean) => {
    const r = RETOS_CONSTRUCTOR[idx]!;
    const v = valorConstructor(r.numeros, nOps, nGrupo);
    const clave = v ? claveQ(v) : null;
    const base = reiniciaHallados ? [] : hallados;
    const nuevos = clave && !base.includes(clave) ? [...base, clave] : base;
    setHallados(nuevos);
    setMaxDistintos((m) => Math.max(m, nuevos.length));
    if (v && igualQ(v, qDeTexto(r.meta))) {
      if (!metas.has(r.id)) sfx(true);
      setMetas((s) => new Set(s).add(r.id));
    } else blip();
  };
  const cambiarOp = (i: number, op: OpBin) => {
    const n = ops.map((o, k) => (k === i ? op : o));
    setOps(n);
    probar(n, grupo, retoIdx, true);
  };
  const cambiarGrupo = (g: string) => {
    setGrupo(g);
    probar(ops, g, retoIdx, false);
  };
  const cambiarReto = (i: number) => {
    setRetoIdx(i);
    setOps(OPS_INICIALES);
    setGrupo("g0");
    setVerPista(false);
    probar(OPS_INICIALES, "g0", i, true);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "pasos") reiniciarExpr();
    if (modo === "razon") cambiarCaso(casoIdx);
    if (modo === "constructor") cambiarReto(retoIdx);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Elegir una operación fuera de orden y ver qué resultado equivocado produce", done: vioErronea },
    { t: "Resolver en la torre la expresión del A9: 8 + 3 × (10 − 6)² ÷ 4", done: a9Hecho },
    { t: "Resolver sin errores una expresión con signos, fracciones, decimales o raíces", done: realesSinError },
    { t: "Revisar los cinco casos de «¿Quién tiene razón?»", done: revisados.size === CASOS.length },
    { t: "Reescribir los cinco casos para que no haya dos lecturas", done: reescritos.size === CASOS.length },
    { t: "Alcanzar tres metas en el constructor", done: metas.size >= 3 },
    { t: "Encontrar cuatro resultados distintos cambiando solo los paréntesis", done: maxDistintos >= 4 },
    { t: "Ganar estrellas en «¿Qué va primero?»", done: identifico },
    { t: "Ordenar los pasos del A9", done: ordenOk },
    { t: "Aprobar el quiz A4", done: quizOk },
    { t: "Resolver los ejercicios A2 y A6", done: a2Ok && a6Ok },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "pasos") {
    chipVivo = terminado ? `${expr.etq} = ${valorTexto(arbol0)} · ${pasos.length} pasos` : error ? `✗ no toca todavía · paso ${pasos.length + 1} de ${totalPasos}` : `paso ${pasos.length + 1} de ${totalPasos} · ${textoNodo(actual)}`;
    pie = error ? error.r.razon : ultimo ? `${ultimo.texto}. ${ultimo.porque}` : `${expr.origen}. Toca la operación que va primero; en la escalera de la izquierda se enciende el nivel que usaste.`;
  } else if (modo === "razon") {
    chipVivo = autoListo ? lecturas.map((l) => `${l.maq.etq.split(":")[0]}: ${l.valor}`).join(" · ") : revelado ? "las dos lecturas calculan paso a paso…" : `¿cuánto vale ${caso.expresion}?`;
    pie = autoListo ? caso.leccion : revelado ? lecturas.map((l) => `${l.maq.etq}: ${l.maq.explica}`).join(" ") : caso.situacion;
  } else {
    chipVivo = `${textoC} = ${vC ? fmtQ(vC, true) : "sin valor"}`;
    const difQ = vC ? restaQ(vC, metaQ) : null;
    pie = logrado ? `¡Meta alcanzada! ${textoC} = ${reto.meta}. Los paréntesis cambiaron qué operación se hace primero.` : `Meta: ${reto.meta}. ${difQ ? `Te ${difQ.n > 0 ? "pasas por" : "faltan"} ${fmtQ({ n: Math.abs(difQ.n), d: difQ.d }, true)}.` : ""} Cada resultado distinto con los mismos signos queda marcado en la recta.`;
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
  if (modo === "pasos") {
    const pasoA9 = expr.id === "a9" && ultimo ? PASOS_A9[pasos.length - 1] : undefined;
    control = (
      <>
        <div className="jo-opts">
          {EXPRESIONES.map((e, i) => (
            <button key={e.id} className="jo-opt jo-expr" data-on={i === exprIdx} onClick={() => cambiarExpr(i)} style={{ ["--joc" as string]: modoCol, background: i === exprIdx ? `${modoCol}1f` : "transparent", ...NUM }}>
              {e.etq}
              {resueltas.has(e.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub(terminado ? "Resuelta" : "Toca la operación que va primero")}
        {terminado ? (
          <div className="jo-tira" style={{ fontSize: 26 }}>
            <span className="jo-tk" style={{ color: OK }}>
              {expr.etq} = {valorTexto(arbol0)}
            </span>
          </div>
        ) : (
          <TiraExpresion arbol={actual} onElegir={elegir} marcado={error?.id ?? null} clase="jo-paso-op" />
        )}
        <div className="jo-leyenda">
          {(["agrupacion", "potencia", "multiplicacion", "suma"] as Categoria[]).map((c, i) => (
            <span key={c} style={{ ["--joc" as string]: catCol(c) }}>
              {i + 1}. {CATEGORIA_DEF[c].etq}
            </span>
          ))}
        </div>
        {error &&
          nota(
            <>
              <strong>Todavía no.</strong> {error.r.razon}
              {error.r.erronea && (
                <>
                  {" "}
                  {error.r.erronea.nota ? `${error.r.erronea.expresion} = ${error.r.erronea.valor}. ${error.r.erronea.nota}` : error.r.erronea.coincide ? `Hacerla primero daría ${error.r.erronea.expresion} = ${error.r.erronea.valor}: esta vez coincide, pero la regla es de izquierda a derecha y no siempre coincide (18 ÷ 3 × 2 = 12, no 3).` : `Hacerla primero daría ${error.r.erronea.expresion} = ${error.r.erronea.valor}, en lugar de ${valorTexto(arbol0)}.`}
                </>
              )}
              {error.r.toca && ` Lo que toca: «${error.r.toca}».`}
            </>,
            WARN,
            "fa-triangle-exclamation",
          )}
        {!error && ultimo && nota(<>{ultimo.texto}. {pasoA9 ? `${pasoA9.marca} ${pasoA9.explicacion}` : ultimo.porque}</>, catCol(ultimo.categoria), "fa-circle-check")}
        {pasos.length > 0 && (
          <>
            {sub("Pasos hechos")}
            <ol className="jo-lista">
              {pasos.map((p, k) => (
                <li key={k} style={{ ["--joc" as string]: catCol(p.categoria) }}>
                  <span style={{ ...NUM }}>{p.texto}</span>
                  <span style={{ color: T.text3 }}> · {CATEGORIA_DEF[p.categoria].etq.toLowerCase()}</span>
                </li>
              ))}
            </ol>
          </>
        )}
        {terminado &&
          nota(
            <>
              {expr.etq} = <strong>{valorTexto(arbol0)}</strong> {erroresExpr === 0 ? "sin ningún error." : `con ${erroresExpr} ${erroresExpr === 1 ? "intento fuera de orden" : "intentos fuera de orden"}.`} {expr.reales && erroresExpr > 0 ? "Vuelve a intentarla sin errores para cumplir el objetivo." : ""}
            </>,
            OK,
            "fa-flag-checkered",
          )}
        <div className="jo-opts" style={{ marginTop: 12 }}>
          <button className="jo-opt" data-on={verArbol} onClick={() => { setVerArbol((v) => !v); blip(); }} style={{ ["--joc" as string]: modoCol, background: verArbol ? `${modoCol}1f` : "transparent" }}>
            <i className={`fa-solid ${verArbol ? "fa-layer-group" : "fa-diagram-project"}`} style={{ marginRight: 8 }} />
            {verArbol ? "Ver la torre de pasos" : "Ver como árbol"}
          </button>
          {(pasos.length > 0 || error) && (
            <button className="jo-opt" data-on="false" onClick={reiniciarExpr} style={{ ["--joc" as string]: modoCol }}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
              Empezar de nuevo
            </button>
          )}
          {terminado && (
            <button className="jo-opt jo-sig" data-on="true" onClick={() => cambiarExpr((exprIdx + 1) % EXPRESIONES.length)} style={{ ["--joc" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente expresión
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          )}
        </div>
      </>
    );
  } else if (modo === "razon") {
    const opValores = reescrita !== null ? valoresOpcion(caso.opciones[reescrita]!) : null;
    control = (
      <>
        <div className="jo-opts">
          {CASOS.map((c, i) => (
            <button key={c.id} className="jo-opt jo-caso" data-on={i === casoIdx} onClick={() => cambiarCaso(i)} style={{ ["--joc" as string]: modoCol, background: i === casoIdx ? `${modoCol}1f` : "transparent" }}>
              {c.etq}
              {reescritos.has(c.id) ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} /> : revisados.has(c.id) ? <i className="fa-solid fa-eye" style={{ marginLeft: 7, color: T.text3 }} /> : null}
            </button>
          ))}
        </div>
        {sub("La situación")}
        <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{caso.situacion}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "10px 0 2px", fontFamily: "ui-rounded, 'Segoe UI', system-ui, sans-serif", ...NUM }}>{caso.expresion}</div>
        {sub(`1 · Predice: ${caso.pregunta}`)}
        <div className="jo-opts">
          {opcionesValor.map((v) => {
            const on = prediccion === v;
            const col = revelado ? (v === caso.respuesta ? OK : on ? WARN : "rgba(255,255,255,0.14)") : modoCol;
            return (
              <button key={v} className="jo-opt jo-pred" data-on={on || (revelado && v === caso.respuesta)} disabled={revelado} onClick={() => predecir(v)} style={{ ["--joc" as string]: col, background: on ? `${col}1f` : "transparent", fontSize: 16, minWidth: 64, ...NUM }}>
                {v}
              </button>
            );
          })}
        </div>
        {revelado && nota(<>{prediccion === caso.respuesta ? "Bien predicho. " : `La respuesta es ${caso.respuesta}. `}{autoListo ? caso.leccion : "Mira en la escena cómo resuelve cada lectura su propio árbol…"}</>, prediccion === caso.respuesta ? OK : WARN, prediccion === caso.respuesta ? "fa-circle-check" : "fa-circle-xmark")}
        {revelado && (
          <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            {lecturas.map((l) => (
              <div key={l.lado} style={{ padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${autoListo ? (l.valor === caso.respuesta ? OK : WARN) : T.line}55`, fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                <strong style={{ color: "#fff" }}>{l.maq.etq}</strong> · <span style={{ ...NUM }}>{escritoDe(caso, l.lado)}</span> = <strong style={{ color: autoListo ? (l.valor === caso.respuesta ? OK : WARN) : "#fff" }}>{autoListo ? l.valor : "…"}</strong>
                <div>{l.maq.explica}</div>
              </div>
            ))}
          </div>
        )}
        {autoListo && (
          <>
            {sub("2 · Reescríbelo sin ambigüedad")}
            <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 8 }}>{caso.intencion}</div>
            <div className="jo-opts">
              {caso.opciones.map((o, i) => {
                const on = reescrita === i;
                const col = on ? (i === caso.correcta ? OK : WARN) : modoCol;
                return (
                  <button key={o} className="jo-opt jo-rees" data-on={on} disabled={reescritos.has(caso.id)} onClick={() => reescribir(i)} style={{ ["--joc" as string]: col, background: on ? `${col}1f` : "transparent", fontSize: 14, ...NUM }}>
                    {o}
                  </button>
                );
              })}
            </div>
            {reescrita !== null &&
              opValores &&
              nota(
                <>
                  {lecturas.map((l, k) => `${l.maq.etq.split(":")[0]}: ${opValores[k]}`).join(" · ")}.{" "}
                  {reescrita === caso.correcta ? `Las dos lecturas dan ${caso.meta}: ya no hay discusión.` : opValores.every((v) => v === opValores[0]) ? `Las dos coinciden, pero en ${opValores[0]}, no en ${caso.meta}.` : `Todavía dan resultados distintos; busca una escritura que dé ${caso.meta} en las dos.`}
                </>,
                reescrita === caso.correcta ? OK : WARN,
                reescrita === caso.correcta ? "fa-circle-check" : "fa-rotate-left",
              )}
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>{caso.fuente}</div>
            {reescritos.has(caso.id) && casoIdx < CASOS.length - 1 && (
              <div className="jo-opts" style={{ marginTop: 10 }}>
                <button className="jo-opt jo-sig" data-on="true" onClick={() => cambiarCaso(casoIdx + 1)} style={{ ["--joc" as string]: modoCol, background: `${modoCol}1f` }}>
                  Siguiente caso
                  <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                </button>
              </div>
            )}
          </>
        )}
        <div style={{ marginTop: 12, fontSize: 11.5, color: T.text3 }}>
          Predicciones acertadas: {acertados.size} de {revisados.size} casos revisados
        </div>
      </>
    );
  } else {
    control = (
      <>
        <div className="jo-opts">
          {RETOS_CONSTRUCTOR.map((r, i) => (
            <button key={r.id} className="jo-opt jo-reto" data-on={i === retoIdx} onClick={() => cambiarReto(i)} style={{ ["--joc" as string]: modoCol, background: i === retoIdx ? `${modoCol}1f` : "transparent", ...NUM }}>
              Meta {r.meta}
              {metas.has(r.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("1 · Elige los signos")}
        <div className="jo-constructor">
          {reto.numeros.map((n, i) => (
            <div key={i} style={{ display: "contents" }}>
              <span className="jo-num" style={{ ...NUM }}>{n}</span>
              {i < ops.length && (
                <div className="jo-seg" role="radiogroup" aria-label={`Signo ${i + 1}`}>
                  {OPS.map((o) => (
                    <button key={o} className="jo-segop" data-on={ops[i] === o} onClick={() => cambiarOp(i, o)} aria-label={`Signo ${i + 1}: ${o}`} style={{ ["--joc" as string]: catCol(o === "×" || o === "÷" ? "multiplicacion" : "suma") }}>
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {sub("2 · Elige dónde van los paréntesis")}
        <div className="jo-opts">
          {AGRUPACIONES.map((g) => (
            <button key={g.id} className="jo-opt jo-grupo" data-on={grupo === g.id} onClick={() => cambiarGrupo(g.id)} aria-label={`Agrupación ${g.etq}`} style={{ ["--joc" as string]: catCol("agrupacion"), background: grupo === g.id ? "rgba(56,189,248,0.14)" : "transparent", fontFamily: "ui-monospace, monospace" }}>
              {g.id === "g0" ? "sin paréntesis" : g.etq}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.5)", border: `1px solid ${logrado ? OK : T.line}` }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "ui-rounded, 'Segoe UI', system-ui, sans-serif", ...NUM }}>
            {textoC} = <span style={{ color: logrado ? OK : modoCol }}>{vC ? fmtQ(vC, true) : "sin valor"}</span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 4 }}>
            Meta: <strong style={{ color: "#fde047" }}>{reto.meta}</strong> · resultados distintos con estos signos: <strong style={{ color: "#fff" }}>{hallados.length}</strong>
          </div>
        </div>
        {logrado && nota(`¡Meta alcanzada! Con los mismos números, los paréntesis deciden qué se hace primero.`, OK, "fa-flag-checkered")}
        {!logrado && (
          <div className="jo-opts" style={{ marginTop: 10 }}>
            <button className="jo-opt" data-on={verPista} onClick={() => setVerPista(true)} style={{ ["--joc" as string]: "#fde047" }}>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 8 }} />
              Pista
            </button>
          </div>
        )}
        {verPista && !logrado && nota(reto.pista, "#fde047", "fa-lightbulb")}
        {nota(`Consejo: deja los signos fijos y recorre las siete agrupaciones; cada resultado nuevo se clava en la recta. Metas logradas: ${metas.size} de ${RETOS_CONSTRUCTOR.length}.`, T.text3)}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes joPulse { 0%,100%{ box-shadow:0 0 0 0 var(--jod); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .jo-live-dot { animation: joPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .jo-live-dot { animation:none; } }
        .jo-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .jo-grid { grid-template-columns: 1fr; } }
        .jo-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .jo-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .jo-icobtn:hover { background:rgba(255,255,255,0.12); }
        .jo-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .jo-tab { cursor:pointer; border:1px solid var(--joc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .jo-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .jo-tab:hover { background:rgba(255,255,255,0.06); }
        .jo-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .jo-opt { cursor:pointer; border:1px solid var(--joc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .jo-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .jo-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .jo-opt:disabled { cursor:default; }
        .jo-opt:disabled[data-on="false"] { opacity:0.55; }
        .jo-tira { display:flex; flex-wrap:wrap; align-items:center; gap:5px; padding:12px 14px; border-radius:12px; background:rgba(4,10,22,0.5); border:1px solid ${T.line};
          font-family:ui-rounded,'Segoe UI',system-ui,sans-serif; font-variant-numeric:tabular-nums; }
        .jo-tk { font-size:22px; font-weight:900; color:#fff; padding:0 1px; }
        .jo-par { font-size:25px; }
        .jo-op { cursor:pointer; min-width:38px; height:38px; padding:0 8px; border-radius:10px; border:1.5px solid var(--joc); background:color-mix(in srgb, var(--joc) 18%, transparent);
          color:#fff; font-size:20px; font-weight:900; transition:transform .12s, background .15s; font-family:inherit; }
        .jo-op:hover:not(:disabled) { transform:translateY(-2px); background:color-mix(in srgb, var(--joc) 34%, transparent); }
        .jo-op:disabled { cursor:default; opacity:.6; }
        .jo-primero .jo-tira { justify-content:center; }
        .jo-leyenda { display:flex; flex-wrap:wrap; gap:6px 12px; margin-top:10px; }
        .jo-leyenda span { font-size:11px; font-weight:800; color:rgba(255,255,255,0.7); display:inline-flex; align-items:center; gap:6px; }
        .jo-leyenda span::before { content:""; width:10px; height:10px; border-radius:3px; background:var(--joc); }
        .jo-lista { margin:0; padding-left:20px; display:grid; gap:5px; }
        .jo-lista li { font-size:12.5px; color:#fff; font-weight:700; }
        .jo-lista li::marker { color:var(--joc); font-weight:900; }
        .jo-constructor { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
        .jo-num { font-size:22px; font-weight:900; color:#fff; padding:6px 10px; border-radius:10px; background:rgba(4,10,22,0.55); border:1px solid ${T.line}; font-family:ui-rounded,'Segoe UI',system-ui,sans-serif; }
        .jo-seg { display:inline-grid; grid-template-columns:repeat(2,1fr); gap:3px; }
        .jo-segop { cursor:pointer; width:30px; height:26px; border-radius:7px; border:1px solid rgba(255,255,255,0.14); background:transparent; color:rgba(255,255,255,0.7); font-size:15px; font-weight:900; }
        .jo-segop[data-on="true"] { border-color:var(--joc); background:color-mix(in srgb, var(--joc) 30%, transparent); color:#fff; }
        .jo-a9 { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:12px; background:rgba(4,10,22,0.45); border:1px solid; }
        .jo-mini { cursor:pointer; width:28px; height:22px; border-radius:6px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:10px; }
        .jo-mini:disabled { opacity:.3; cursor:default; }
        .jo-comprobar { cursor:pointer; border:none; border-radius:12px; font-size:13.5px; font-weight:800; padding:12px 18px; color:#04121f; }
        .jo-comprobar:disabled { opacity:.45; cursor:default; }
        .jo-opt:focus-visible, .jo-tab:focus-visible, .jo-icobtn:focus-visible, .jo-op:focus-visible, .jo-segop:focus-visible, .jo-mini:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .jo-bottom { grid-template-columns: 1fr !important; } }
        .jo-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .jo-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .jo-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .jo-drawer[data-open="true"] { transform:translateX(0); }
        .jo-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .jo-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .jo-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .jo-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .jo-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .jo-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        .jo-details summary { cursor:pointer; font-size:12px; color:#fff; font-weight:700; line-height:1.45; }
        .jo-details div { font-size:11.5px; color:${T.text2}; margin:5px 0 0 14px; }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="jo-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="jo-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--joc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="jo-grid">
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
              <JerarquiaScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                exprId={expr.id}
                elegidos={elegidos}
                errorId={error?.id ?? null}
                errorTexto={errorTexto}
                verArbol={verArbol}
                onElegir={elegir}
                casoId={caso.id}
                pasoAuto={pasoAuto}
                revelado={revelado}
                retoId={reto.id}
                ops={ops}
                grupo={grupo}
                hallados={hallados}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="jo-live-dot" style={{ ["--jod" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="jo-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="jo-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="jo-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="jo-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-layer-group" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿14 o 20? El orden importa</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Propósito:</strong> {PROPOSITO}
            </div>
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
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PREGUNTAS DE COMPRENSIÓN</div>
            <div style={{ display: "grid", gap: 8 }}>
              {PREGUNTAS_A1.map((q, i) => (
                <details key={i} className="jo-details">
                  <summary>{q.pregunta}</summary>
                  <div>{q.guia}</div>
                </details>
              ))}
            </div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="jo-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: 8, color: accent }} />
              Para escribir (reflexión A3)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{REFLEXION_A3}</div>
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginTop: 8, fontStyle: "italic" }}>Autoevaluación A7: «{AUTOEVAL_A7}»</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (verdadero o falso A5 y video A8)
            </Eyebrow>
            <div style={{ display: "grid", gap: 7 }}>
              {HECHOS.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ flexShrink: 0, minWidth: 22, textAlign: "center", fontSize: 11, fontWeight: 900, padding: "2px 6px", borderRadius: 6, color: "#04121f", background: h.respuesta ? OK : WARN }}>{h.respuesta ? "V" : "F"}</span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                    <strong style={{ color: "#fff" }}>{h.enunciado}</strong> {h.retro} <span style={{ color: T.text3 }}>({h.origen})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario del laboratorio
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO_LAB.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
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
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45, ...NUM }}>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas, los ejercicios A2 y A6, el quiz A4, los enunciados de verdadero o falso A5, la pregunta V/F del video A8, los pasos A9 y los textos de la reflexión A3 y la
          autoevaluación A7 son <strong>verbatim</strong> del material de la plataforma. Las expresiones de práctica, los casos y las metas del constructor son del laboratorio; todos sus resultados
          se calculan con <strong>aritmética exacta de fracciones</strong> (sin redondeo). Las lecturas de las máquinas son reglas reales: ejecución inmediata en calculadoras básicas de cuatro
          operaciones; en Excel la negación tiene prioridad sobre el exponente (documentación de Microsoft); la discusión de 6 ÷ 2(1 + 2) fue pública en 2019. La cuenta de la pizza y las personas de
          los casos son ilustrativas. El glosario es del laboratorio (la progresión no trae glosario). Fuente: {FUENTE}
        </span>
      </div>

      <PrimeroCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <OrdenaA9Card accent={accent} completado={ordenOk} onCompletado={() => setOrdenOk(true)} playSfx={sfx} playPick={blip} />

      <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizOk} onAprobado={() => setQuizOk(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Dominas el orden de las operaciones." />

      <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={a2Ok} onAprobado={() => setA2Ok(true)} playSfx={sfx} />
      <RetoNumericoCard reto={RETO_A6} accent={accent} aprobado={a6Ok} onAprobado={() => setA6Ok(true)} playSfx={sfx} />

      <div className="jo-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="jo-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="jo-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="jo-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="jo-drawer-body">
          <FichaTeorica data={JERARQUIA_OPERACIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
