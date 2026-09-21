"use client";

/**
 * Laboratorio 3D — "Lógica matemática y compuertas".
 * Práctica experimental de la progresión 1 de PM-I (códigos PM-I-P03), anclada
 * al ejercicio A2 «Tabla de verdad de proposiciones compuestas» (reto
 * evaluable) y al quiz A4. El marco teórico es la lectura A1, los hechos salen
 * del V/F A5, el texto del A6 y las reglas de los conectivos del A9.
 *
 * Tres modos:
 *  (1) Circuito de conectivos — interruptores p y q, la compuerta de cada
 *      conectivo y un foco: predecir cada fila de la tabla y nombrar la regla.
 *  (2) Tabla de verdad — llenar la tabla de una expresión columna por columna,
 *      probar cada fila en su árbol de compuertas y clasificarla.
 *  (3) Condicional y razonamientos — cuatro mundos posibles comprueban qué
 *      formas del condicional equivalen a la original y qué razonamientos son
 *      válidos (modus ponens/tollens) o falacias.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { RetoNumericoCard } from "./_reto-numerico";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { LOGICA_COMPUERTAS_FICHA } from "./logica-compuertas-ficha";
import {
  type Modo,
  type Conectivo,
  type Var,
  type Clase,
  type Forma,
  type Argumento,
  type TipoEnunciado,
  MODOS,
  MODOS_DEF,
  CONECTIVOS,
  CONECTIVO_DEF,
  REGLAS_A9,
  ORDEN_REGLAS,
  explicaRegla,
  FILAS,
  FILAS_NEG,
  claveFila,
  vf,
  evaluar,
  texto,
  columnas,
  clasificar,
  CLASES,
  EXPRESIONES,
  LECTURA_PQ,
  SITUACIONES,

  FORMA_DEF,
  equivaleAOriginal,
  ARGUMENTOS,
  ARGUMENTO_DEF,
  esValido,
  ENUNCIADOS,
  TIPOS_ENUNCIADO,
  rondaEnunciados,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  PREGUNTAS,
  HECHOS,
  GLOSARIO,
  REFLEXION_A3,
  AUTOEVALUACION_A7,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A4,
  HUECOS_A6,
  RETO_A2,
} from "./logica-compuertas-data";

const LogicaScene = dynamic(() => import("./LogicaCompuertasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-microchip fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Armando el circuito lógico en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-logica-compuertas-reto";
const WARN = "#FF8A3C";
const AMBAR = "#fbbf24";
const RONDA_INICIAL = rondaEnunciados(mulberry32(7));

type Celdas = (boolean | null)[][];
const celdasVacias = (nCols: number): Celdas => FILAS.map(() => Array.from({ length: nCols }, () => null));

/* ── Tarjeta de estrellas: ¿es proposición? ───────────────────────────── */
function ProposicionCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ENUNCIADOS[ronda[pos] ?? 0]!;

  const responder = (t: TipoEnunciado) => {
    if (resuelto !== null) return;
    const ok = t === actual.tipo;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${TIPOS_ENUNCIADO.find((x) => x.id === actual.tipo)!.etq}: ${actual.porque}`);
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
          ¿Es proposición?
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
            Enunciado {pos + 1} de {ronda.length} · ¿tiene valor de verdad? ¿usa conectivos?
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TIPOS_ENUNCIADO.map((t) => (
              <button key={t.id} className="lc-opt lc-prop" data-on="true" onClick={() => responder(t.id)} style={{ ["--lcc" as string]: t.id === "no" ? WARN : t.id === "simple" ? "#38bdf8" : "#a78bfa" }}>
                <i className={`fa-solid ${t.icono}`} style={{ marginRight: 8 }} />
                {t.etq}
              </button>
            ))}
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

export function LabLogicaCompuertas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("circuito");

  // ── Circuito
  const [conectivo, setConectivo] = useState<Conectivo>("and");
  const [pV, setPV] = useState(true);
  const [qV, setQV] = useState(true);
  const [registros, setRegistros] = useState<Record<Conectivo, Record<string, boolean>>>({ neg: {}, and: {}, or: {}, imp: {}, bic: {} });
  const [pulsoC, setPulsoC] = useState(0);
  const [reglaOk, setReglaOk] = useState<Set<Conectivo>>(() => new Set());
  const [reglaMsg, setReglaMsg] = useState<{ c: Conectivo; idx: number; ok: boolean; parcial: boolean; txt: string } | null>(null);
  const [tablaPerfecta, setTablaPerfecta] = useState(false);

  // ── Tabla
  const [exprId, setExprId] = useState(EXPRESIONES[0]!.id);
  const [celdas, setCeldas] = useState<Record<string, Celdas>>(() => Object.fromEntries(EXPRESIONES.map((x) => [x.id, celdasVacias(columnas(x.expr).length)])));
  const [probadas, setProbadas] = useState<Record<string, boolean[]>>(() => Object.fromEntries(EXPRESIONES.map((x) => [x.id, FILAS.map(() => false)])));
  const [fila, setFila] = useState(0);
  const [pulsoT, setPulsoT] = useState(0);
  const [erroresT, setErroresT] = useState<Record<string, number>>({});
  const [clasif, setClasif] = useState<Record<string, Clase>>({});
  const [clasesLogradas, setClasesLogradas] = useState<Set<Clase>>(() => new Set());
  const [tablaA2, setTablaA2] = useState(false);
  const [deMorganOk, setDeMorganOk] = useState(false);

  // ── Razonar
  const [sitId, setSitId] = useState(SITUACIONES[0]!.id);
  const [sub, setSub] = useState<"formas" | "argumentos">("formas");
  const [forma, setForma] = useState<Forma>("reciproca");
  const [predForma, setPredForma] = useState<Record<string, Partial<Record<Forma, boolean>>>>({});
  const [argumento, setArgumento] = useState<Argumento>("ponens");
  const [predArg, setPredArg] = useState<Record<string, Partial<Record<Argumento, boolean>>>>({});
  const [argProbados, setArgProbados] = useState<Set<string>>(() => new Set());
  const [pulsoR, setPulsoR] = useState(0);
  const [formasOk, setFormasOk] = useState(false);
  const [argsOk, setArgsOk] = useState(false);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [retoOk, setRetoOk] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

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
    };
  }, []);

  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const chispa = () => {
    if (sonido) audioRef.current?.chispa();
  };
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Circuito ──────────────────────────────────────────────────────── */
  const cDef = CONECTIVO_DEF[conectivo];
  const filasC = conectivo === "neg" ? FILAS_NEG : FILAS;
  const regC = registros[conectivo];
  const qEf = conectivo === "neg" ? true : qV;
  const claveActual = claveFila(pV, qEf);
  const revelado = regC[claveActual] !== undefined;
  const salidaC = evaluar(cDef.expr, pV, qEf);
  const tablaCompletaC = filasC.every(([p, q]) => regC[claveFila(p, q)] !== undefined);
  const aciertosC = filasC.filter(([p, q]) => regC[claveFila(p, q)] === evaluar(cDef.expr, p, q)).length;

  const elegirConectivo = (c: Conectivo) => {
    setConectivo(c);
    setReglaMsg(null);
    blip();
  };
  const toggle = useCallback(
    (v: Var) => {
      if (v === "p") setPV((x) => !x);
      else setQV((x) => !x);
      if (sonido) audioRef.current?.blip();
    },
    [sonido],
  );
  const ponerFila = (p: boolean, q: boolean) => {
    setPV(p);
    if (conectivo !== "neg") setQV(q);
    blip();
  };
  const predecir = (v: boolean) => {
    if (revelado) return;
    const nuevo = { ...regC, [claveActual]: v };
    setRegistros((r) => ({ ...r, [conectivo]: nuevo }));
    setPulsoC((k) => k + 1);
    sfx(v === salidaC);
    chispa();
    const completa = filasC.every(([p, q]) => nuevo[claveFila(p, q)] !== undefined);
    if (completa && filasC.every(([p, q]) => nuevo[claveFila(p, q)] === evaluar(cDef.expr, p, q))) setTablaPerfecta(true);
  };
  const elegirRegla = (idx: number) => {
    const r = explicaRegla(conectivo, idx);
    setReglaMsg({ c: conectivo, idx, ...r });
    sfx(r.ok);
    if (r.ok) setReglaOk((s) => new Set(s).add(conectivo));
  };
  const limpiarConectivo = () => {
    setRegistros((r) => ({ ...r, [conectivo]: {} }));
    setReglaMsg(null);
  };

  /* ── Tabla ─────────────────────────────────────────────────────────── */
  const ex = EXPRESIONES.find((x) => x.id === exprId)!;
  const cols = columnas(ex.expr);
  const tabla = celdas[ex.id]!;
  const probadasEx = probadas[ex.id]!;
  const verdad = (r: number, c: number) => evaluar(cols[c]!, FILAS[r]![0], FILAS[r]![1]);
  const filaLlena = (r: number) => tabla[r]!.every((v) => v !== null);
  const filaBien = (r: number) => tabla[r]!.every((v, c) => v === verdad(r, c));
  const tablaCompleta = FILAS.every((_, r) => probadasEx[r] && filaBien(r));
  const claseReal = clasificar(ex.expr);
  const marcas: Record<string, boolean | null> = Object.fromEntries(cols.map((c, k) => [texto(c), tabla[fila]![k] ?? null]));

  const elegirExpr = (id: string) => {
    setExprId(id);
    setFila(0);
    blip();
  };
  const tocarCelda = (r: number, c: number) => {
    setCeldas((all) => {
      const t = all[ex.id]!.map((row) => [...row]);
      const v = t[r]![c];
      t[r]![c] = v === null ? true : !v;
      return { ...all, [ex.id]: t };
    });
    setProbadas((all) => {
      const pr = [...all[ex.id]!];
      pr[r] = false;
      return { ...all, [ex.id]: pr };
    });
    setFila(r);
    blip();
  };
  const probarFila = () => {
    if (!filaLlena(fila)) return;
    const malas = tabla[fila]!.filter((v, c) => v !== verdad(fila, c)).length;
    const pr = [...probadasEx];
    pr[fila] = true;
    setProbadas((all) => ({ ...all, [ex.id]: pr }));
    setPulsoT((k) => k + 1);
    if (malas > 0) setErroresT((e) => ({ ...e, [ex.id]: (e[ex.id] ?? 0) + malas }));
    sfx(malas === 0);
    chispa();
    const completa = FILAS.every((_, r) => (r === fila ? malas === 0 : pr[r] && filaBien(r)));
    if (completa) {
      if (ex.id === "a2") setTablaA2(true);
      if (ex.id === "demorgan") setDeMorganOk(true);
    }
  };
  const clasificarExpr = (cl: Clase) => {
    if (!tablaCompleta) return;
    setClasif((c) => ({ ...c, [ex.id]: cl }));
    const ok = cl === claseReal;
    sfx(ok);
    if (ok) setClasesLogradas((s) => new Set(s).add(cl));
  };
  const limpiarTabla = () => {
    setCeldas((all) => ({ ...all, [ex.id]: celdasVacias(cols.length) }));
    setProbadas((all) => ({ ...all, [ex.id]: FILAS.map(() => false) }));
    setClasif((c) => {
      const n = { ...c };
      delete n[ex.id];
      return n;
    });
    setFila(0);
  };

  /* ── Razonar ───────────────────────────────────────────────────────── */
  const sit = SITUACIONES.find((s) => s.id === sitId)!;
  const predF = predForma[sitId] ?? {};
  const formaRevelada = predF[forma] !== undefined;
  const predA = predArg[sitId] ?? {};
  const argPredicho = predA[argumento] !== undefined;
  const argProbado = argProbados.has(`${sitId}-${argumento}`);
  const aDef = ARGUMENTO_DEF[argumento];
  const hechoTxt = (h: "p" | "np" | "q" | "nq") => sit.hechos[h];

  const predecirForma = (equivale: boolean) => {
    if (formaRevelada) return;
    const nuevo = { ...predF, [forma]: equivale };
    setPredForma((x) => ({ ...x, [sitId]: nuevo }));
    setPulsoR((k) => k + 1);
    sfx(equivale === equivaleAOriginal(forma));
    const tres: Forma[] = ["reciproca", "inversa", "contrapositiva"];
    if (tres.every((f) => nuevo[f] === equivaleAOriginal(f))) setFormasOk(true);
  };
  const predecirArg = (valido: boolean) => {
    if (argPredicho) return;
    setPredArg((x) => ({ ...x, [sitId]: { ...predA, [argumento]: valido } }));
    sfx(valido === esValido(argumento));
  };
  const probarArg = () => {
    if (!argPredicho) return;
    const nuevos = new Set(argProbados).add(`${sitId}-${argumento}`);
    setArgProbados(nuevos);
    setPulsoR((k) => k + 1);
    chispa();
    if (ARGUMENTOS.every((a) => predA[a] === esValido(a) && nuevos.has(`${sitId}-${a}`))) setArgsOk(true);
  };
  const elegirSituacion = (id: string) => {
    setSitId(id);
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "circuito") limpiarConectivo();
    if (modo === "tabla") limpiarTabla();
    if (modo === "razonar") {
      setPredForma((x) => ({ ...x, [sitId]: {} }));
      setPredArg((x) => ({ ...x, [sitId]: {} }));
      setArgProbados((s) => new Set([...s].filter((k) => !k.startsWith(`${sitId}-`))));
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Predecir sin errores la tabla completa de un conectivo", done: tablaPerfecta },
    { t: "Asociar los cinco conectivos con su regla de verdad (A9)", done: reglaOk.size === CONECTIVOS.length },
    { t: "Construir y comprobar la tabla de (p ∧ q) → (p ∨ q) del ejercicio A2", done: tablaA2 },
    { t: "Clasificar una tautología, una contradicción y una contingencia", done: clasesLogradas.size === 3 },
    { t: "Verificar la ley de De Morgan con su tabla de verdad", done: deMorganOk },
    { t: "Predecir bien si la recíproca, la inversa y la contrapositiva equivalen a la original", done: formasOk },
    { t: "Clasificar las cuatro formas de razonamiento y probarlas en los cuatro mundos", done: argsOk },
    { t: "Clasificar enunciados y ganar estrellas", done: identifico },
    { t: "Resolver el reto de la tabla de verdad (A2)", done: retoOk },
    { t: "Aprobar el quiz evaluable (A4)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "circuito") {
    chipVivo = `${texto(cDef.expr)} · p=${vf(pV)}${conectivo === "neg" ? "" : ` q=${vf(qV)}`} → ${revelado ? vf(salidaC) : "?"}`;
    pie = revelado ? cDef.comentario[claveActual] : `«${cDef.frase}» ¿Se enciende el foco? Predice antes de cerrar el circuito.`;
  } else if (modo === "tabla") {
    const [pp, qq] = FILAS[fila]!;
    chipVivo = `${texto(ex.expr)} · fila ${claveFila(pp, qq)} ${probadasEx[fila] ? `→ ${vf(evaluar(ex.expr, pp, qq))}` : "· sin probar"}`;
    pie = tablaCompleta ? ex.nota : `«${ex.lectura}» (${LECTURA_PQ}). Llena la fila ${claveFila(pp, qq)} y pruébala: la señal avanza compuerta por compuerta.`;
  } else if (sub === "formas") {
    chipVivo = `${sit.etq.toLowerCase()} · ${FORMA_DEF[forma].simbolo} ${formaRevelada ? (equivaleAOriginal(forma) ? "equivale a p → q" : "no equivale a p → q") : "vs p → q"}`;
    pie = formaRevelada ? explicaForma(forma, sit.ejemplos) : `Original: «${sit.formas.original}» ${FORMA_DEF[forma].etq}: «${sit.formas[forma]}» ¿Dice lo mismo en los cuatro mundos?`;
  } else {
    chipVivo = `${aDef.etq.toLowerCase()} · ${argProbado ? (aDef.valido ? "válido" : "falacia") : "sin probar"}`;
    pie = argProbado ? aDef.explica : `P1: «${sit.formas.original}» P2: «${hechoTxt(aDef.hecho2)}» Conclusión: «${hechoTxt(aDef.concl)}»`;
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

  const sub_ = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const celdaVF = (v: boolean | null, extra?: ReactNode) => (
    <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900, color: v === null ? T.text3 : v ? "#fde68a" : "#cbd5e1" }}>
      {v === null ? "?" : vf(v)}
      {extra}
    </span>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "circuito") {
    control = (
      <>
        <div className="lc-opts">
          {CONECTIVOS.map((c) => {
            const d = CONECTIVO_DEF[c];
            const on = c === conectivo;
            return (
              <button key={c} className="lc-opt lc-con" data-on={on} onClick={() => elegirConectivo(c)} style={{ ["--lcc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, marginRight: 7 }}>{texto(d.expr)}</span>
                {d.nombre.split(" (")[0]}
                {reglaOk.has(c) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
              </button>
            );
          })}
        </div>
        {sub_("La situación")}
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, marginBottom: 6 }}>«{cDef.frase}»</div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
            <strong style={{ color: "#fff" }}>p</strong>: {cDef.p.si.toLowerCase()}
            {cDef.q && (
              <>
                {" · "}
                <strong style={{ color: "#fff" }}>q</strong>: {cDef.q.si.toLowerCase()}
              </>
            )}
            {" · "}el foco se enciende si {cDef.foco}.
          </div>
        </div>
        {sub_("1 · Pon los interruptores (también puedes tocar las palancas en 3D)")}
        <div className="lc-opts">
          <button className="lc-toggle lc-sw" data-var="p" onClick={() => toggle("p")} style={{ ["--lcc" as string]: pV ? AMBAR : "#64748b" }}>
            <i className={`fa-solid ${pV ? "fa-toggle-on" : "fa-toggle-off"}`} style={{ marginRight: 9, color: pV ? AMBAR : "#94a3b8" }} />p = {vf(pV)} · {pV ? cDef.p.si : cDef.p.no}
          </button>
          {cDef.q && (
            <button className="lc-toggle lc-sw" data-var="q" onClick={() => toggle("q")} style={{ ["--lcc" as string]: qV ? AMBAR : "#64748b" }}>
              <i className={`fa-solid ${qV ? "fa-toggle-on" : "fa-toggle-off"}`} style={{ marginRight: 9, color: qV ? AMBAR : "#94a3b8" }} />q = {vf(qV)} · {qV ? cDef.q.si : cDef.q.no}
            </button>
          )}
        </div>
        {sub_("2 · Predice: ¿se enciende el foco?")}
        <div className="lc-opts">
          {[true, false].map((v) => {
            const on = regC[claveActual] === v;
            const col = on ? (v === salidaC ? OK : WARN) : modoCol;
            return (
              <button key={String(v)} className="lc-opt lc-pred" data-on={on} disabled={revelado} onClick={() => predecir(v)} style={{ ["--lcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${v ? "fa-lightbulb" : "fa-power-off"}`} style={{ marginRight: 8 }} />
                {v ? "Sí: la compuesta es V" : "No: la compuesta es F"}
              </button>
            );
          })}
        </div>
        {revelado && nota(`${regC[claveActual] === salidaC ? "Bien predicho. " : `No: el foco ${salidaC ? "sí se enciende" : "se queda apagado"}. `}${cDef.comentario[claveActual]}`, regC[claveActual] === salidaC ? OK : WARN, regC[claveActual] === salidaC ? "fa-circle-check" : "fa-rotate-left")}

        {sub_(`3 · Tabla de verdad de ${texto(cDef.expr)} (toca una fila para ir a ella)`)}
        <div className="lc-tabla-wrap">
          <table className="lc-tabla">
            <thead>
              <tr>
                <th>p</th>
                {cDef.q && <th>q</th>}
                <th>{texto(cDef.expr)}</th>
                <th>tu predicción</th>
              </tr>
            </thead>
            <tbody>
              {filasC.map(([p, q]) => {
                const k = claveFila(p, q);
                const reg = regC[k];
                const real = evaluar(cDef.expr, p, q);
                return (
                  <tr key={k} className="lc-fila" data-actual={k === claveActual} onClick={() => ponerFila(p, q)}>
                    <td>{celdaVF(p)}</td>
                    {cDef.q && <td>{celdaVF(q)}</td>}
                    <td>{celdaVF(reg === undefined ? null : real)}</td>
                    <td>{reg === undefined ? <span style={{ color: T.text3 }}>—</span> : <span style={{ color: reg === real ? OK : WARN, fontWeight: 900 }}>{vf(reg)} {reg === real ? "✓" : "✗"}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>
          Filas: {Object.keys(regC).length}/{filasC.length} · aciertos: {aciertosC}
          {Object.keys(regC).length > 0 && (
            <button className="lc-link" onClick={limpiarConectivo}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 5 }} />
              Volver a llenar
            </button>
          )}
        </div>

        {tablaCompletaC && (
          <>
            {sub_("4 · ¿Qué regla describe tu tabla? (A9)")}
            <div style={{ display: "grid", gap: 6 }}>
              {ORDEN_REGLAS.map((idx) => {
                const elegida = reglaMsg?.c === conectivo && reglaMsg.idx === idx;
                const correcta = REGLAS_A9[idx] === cDef.regla;
                const hecho = reglaOk.has(conectivo);
                const col = elegida ? (reglaMsg!.ok ? OK : reglaMsg!.parcial ? AMBAR : WARN) : hecho && correcta ? OK : modoCol;
                return (
                  <button key={idx} className="lc-opt lc-regla" data-on={elegida || (hecho && correcta)} disabled={hecho} onClick={() => elegirRegla(idx)} style={{ ["--lcc" as string]: col, textAlign: "left", background: elegida ? `${col}1f` : "transparent" }}>
                    {REGLAS_A9[idx]}
                  </button>
                );
              })}
            </div>
            {reglaMsg?.c === conectivo && nota(reglaMsg.txt, reglaMsg.ok ? OK : reglaMsg.parcial ? AMBAR : WARN, reglaMsg.ok ? "fa-circle-check" : "fa-circle-exclamation")}
          </>
        )}
      </>
    );
  } else if (modo === "tabla") {
    const erroresEx = erroresT[ex.id] ?? 0;
    control = (
      <>
        <div className="lc-opts">
          {EXPRESIONES.map((x) => {
            const on = x.id === exprId;
            const hecha = FILAS.every((_, r) => probadas[x.id]![r] && celdas[x.id]![r]!.every((v, c) => v === evaluar(columnas(x.expr)[c]!, FILAS[r]![0], FILAS[r]![1])));
            return (
              <button key={x.id} className="lc-opt lc-expr" data-on={on} onClick={() => elegirExpr(x.id)} style={{ ["--lcc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                <span style={{ fontFamily: "ui-monospace, monospace" }}>{texto(x.expr)}</span>
                {hecha && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: clasif[x.id] === clasificar(x.expr) ? OK : T.text3 }} />}
              </button>
            );
          })}
        </div>
        {sub_("La proposición")}
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 900, fontFamily: "ui-monospace, monospace", marginBottom: 6 }}>{texto(ex.expr)}</div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
            «{ex.lectura}» <span style={{ color: T.text3 }}>({LECTURA_PQ})</span>
          </div>
        </div>
        {sub_("1 · Toca cada casilla para poner V o F; luego prueba la fila")}
        <div className="lc-tabla-wrap">
          <table className="lc-tabla">
            <thead>
              <tr>
                <th>p</th>
                <th>q</th>
                {cols.map((c, k) => (
                  <th key={k} style={{ color: k === cols.length - 1 ? modoCol : undefined }}>
                    {texto(c)}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {FILAS.map(([p, q], r) => (
                <tr key={r} className="lc-fila" data-actual={r === fila} onClick={() => setFila(r)}>
                  <td>{celdaVF(p)}</td>
                  <td>{celdaVF(q)}</td>
                  {cols.map((_, c) => {
                    const v = tabla[r]![c]!;
                    const probada = probadasEx[r]!;
                    const bien = v === verdad(r, c);
                    return (
                      <td key={c}>
                        <button
                          className="lc-celda"
                          aria-label={`Fila ${claveFila(p, q)}, columna ${texto(cols[c]!)}`}
                          data-estado={!probada || v === null ? "libre" : bien ? "bien" : "mal"}
                          onClick={(e) => {
                            e.stopPropagation();
                            tocarCelda(r, c);
                          }}
                        >
                          {v === null ? "·" : vf(v)}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ whiteSpace: "nowrap" }}>{probadasEx[r] ? <i className={`fa-solid ${filaBien(r) ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: filaBien(r) ? OK : WARN }} /> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lc-opts" style={{ marginTop: 10 }}>
          <button className="lc-toggle lc-probar" onClick={probarFila} disabled={!filaLlena(fila)} style={{ ["--lcc" as string]: AMBAR, width: "auto", flex: 1 }}>
            <i className="fa-solid fa-bolt" style={{ marginRight: 9, color: AMBAR }} />
            {filaLlena(fila) ? `Probar la fila ${claveFila(FILAS[fila]![0], FILAS[fila]![1])} en el circuito` : `Llena la fila ${claveFila(FILAS[fila]![0], FILAS[fila]![1])} para probarla`}
          </button>
          <button className="lc-opt" data-on="false" onClick={() => setFila((f) => (f + 1) % FILAS.length)} style={{ ["--lcc" as string]: modoCol }}>
            Siguiente fila
            <i className="fa-solid fa-arrow-down" style={{ marginLeft: 8 }} />
          </button>
        </div>
        {probadasEx[fila] &&
          !filaBien(fila) &&
          nota(`En la fila ${claveFila(FILAS[fila]![0], FILAS[fila]![1])} el circuito no coincide con tu tabla en: ${cols.filter((_, c) => tabla[fila]![c] !== verdad(fila, c)).map((c) => texto(c)).join(", ")}. Mira la compuerta marcada en rojo, corrige la casilla y vuelve a probar.`, WARN, "fa-triangle-exclamation")}
        {!tablaCompleta && nota(`Filas comprobadas: ${FILAS.filter((_, r) => probadasEx[r] && filaBien(r)).length}/4 · casillas que el circuito corrigió: ${erroresEx}. Calcula primero las partes pequeñas y al final la proposición completa.`, T.text3)}

        {sub_("2 · Clasifica la proposición")}
        <div className="lc-opts" style={{ opacity: tablaCompleta ? 1 : 0.45, pointerEvents: tablaCompleta ? "auto" : "none" }}>
          {CLASES.map((c) => {
            const on = clasif[ex.id] === c.id;
            const col = on ? (c.id === claseReal ? OK : WARN) : modoCol;
            return (
              <button key={c.id} className="lc-opt lc-clase" data-on={on} disabled={!tablaCompleta} onClick={() => clasificarExpr(c.id)} style={{ ["--lcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                {c.etq} <span style={{ color: T.text3, fontWeight: 700 }}>({c.explica})</span>
              </button>
            );
          })}
        </div>
        {tablaCompleta && clasif[ex.id] && nota(clasif[ex.id] === claseReal ? `Correcto. ${ex.nota}` : `Revisa la última columna: tiene ${FILAS.filter(([p, q]) => evaluar(ex.expr, p, q)).length} de 4 filas en V.`, clasif[ex.id] === claseReal ? OK : WARN, clasif[ex.id] === claseReal ? "fa-circle-check" : "fa-rotate-left")}
        {tablaCompleta && !clasif[ex.id] && nota("Tabla comprobada. ¿La última columna es siempre V, siempre F o varía?", AMBAR, "fa-circle-question")}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3 }}>
          Clases logradas: {clasesLogradas.size}/3 {[...clasesLogradas].map((c) => CLASES.find((x) => x.id === c)!.etq).join(" · ")}
        </div>
      </>
    );
  } else {
    const tres: Forma[] = ["reciproca", "inversa", "contrapositiva"];
    control = (
      <>
        <div className="lc-opts">
          {SITUACIONES.map((s) => (
            <button key={s.id} className="lc-opt lc-sit" data-on={s.id === sitId} onClick={() => elegirSituacion(s.id)} style={{ ["--lcc" as string]: modoCol, background: s.id === sitId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${s.icono}`} style={{ marginRight: 8 }} />
              {s.etq}
            </button>
          ))}
        </div>
        <div className="lc-subtabs">
          {(["formas", "argumentos"] as const).map((k) => (
            <button key={k} className="lc-subtab" data-on={sub === k} onClick={() => { setSub(k); blip(); }} style={{ ["--lcc" as string]: modoCol }}>
              <i className={`fa-solid ${k === "formas" ? "fa-arrows-rotate" : "fa-scale-balanced"}`} style={{ marginRight: 8 }} />
              {k === "formas" ? "Formas del condicional" : "¿Válido o falacia?"}
            </button>
          ))}
        </div>

        {sub === "formas" ? (
          <>
            {sub_("La condición original")}
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>
                <span style={{ fontFamily: "ui-monospace, monospace", color: "#38bdf8", marginRight: 8 }}>p → q</span>«{sit.formas.original}»
              </div>
            </div>
            {sub_("1 · Elige una forma")}
            <div className="lc-opts">
              {tres.map((f) => {
                const pr = predF[f];
                return (
                  <button key={f} className="lc-opt lc-forma" data-on={f === forma} onClick={() => { setForma(f); blip(); }} style={{ ["--lcc" as string]: modoCol, background: f === forma ? `${modoCol}1f` : "transparent" }}>
                    <span style={{ fontFamily: "ui-monospace, monospace", marginRight: 7 }}>{FORMA_DEF[f].simbolo}</span>
                    {FORMA_DEF[f].etq}
                    {pr !== undefined && <i className={`fa-solid ${pr === equivaleAOriginal(f) ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginLeft: 7, color: pr === equivaleAOriginal(f) ? OK : WARN }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: "rgba(4,10,22,0.45)" }}>
              <div style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>
                {FORMA_DEF[forma].etq.toUpperCase()} · {FORMA_DEF[forma].como}
              </div>
              <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 800, marginTop: 4 }}>«{sit.formas[forma]}»</div>
            </div>
            {sub_("2 · Predice: ¿dice lo mismo que la original?")}
            <div className="lc-opts">
              {[true, false].map((v) => {
                const on = predF[forma] === v;
                const col = on ? (v === equivaleAOriginal(forma) ? OK : WARN) : modoCol;
                return (
                  <button key={String(v)} className="lc-opt lc-equiv" data-on={on} disabled={formaRevelada} onClick={() => predecirForma(v)} style={{ ["--lcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                    {v ? "Sí: es equivalente" : "No: no es equivalente"}
                  </button>
                );
              })}
            </div>
            {formaRevelada && nota(`${predF[forma] === equivaleAOriginal(forma) ? "Bien predicho. " : "Mira los focos de los mundos. "}${explicaForma(forma, sit.ejemplos)}`, predF[forma] === equivaleAOriginal(forma) ? OK : WARN, "fa-lightbulb")}
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3 }}>
              Formas predichas en «{sit.etq}»: {tres.filter((f) => predF[f] !== undefined).length}/3 · aciertos: {tres.filter((f) => predF[f] === equivaleAOriginal(f)).length}
            </div>
          </>
        ) : (
          <>
            {sub_("1 · Elige un razonamiento")}
            <div className="lc-opts">
              {ARGUMENTOS.map((a) => {
                const pr = predA[a];
                return (
                  <button key={a} className="lc-opt lc-arg" data-on={a === argumento} onClick={() => { setArgumento(a); blip(); }} style={{ ["--lcc" as string]: modoCol, background: a === argumento ? `${modoCol}1f` : "transparent" }}>
                    {ARGUMENTO_DEF[a].etq}
                    {pr !== undefined && <i className={`fa-solid ${pr === esValido(a) ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginLeft: 7, color: pr === esValido(a) ? OK : WARN }} />}
                    {argProbados.has(`${sitId}-${a}`) && <i className="fa-solid fa-bolt" style={{ marginLeft: 6, color: AMBAR }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: "rgba(4,10,22,0.45)", display: "grid", gap: 5 }}>
              <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{aDef.forma}</div>
              <div style={{ fontSize: 13, color: "#fff" }}>
                <strong style={{ color: modoCol }}>P1.</strong> {sit.formas.original}
              </div>
              <div style={{ fontSize: 13, color: "#fff" }}>
                <strong style={{ color: modoCol }}>P2.</strong> {hechoTxt(aDef.hecho2)}
              </div>
              <div style={{ fontSize: 13, color: "#fff", borderTop: `1px solid ${T.line}`, paddingTop: 5 }}>
                <strong style={{ color: modoCol }}>∴</strong> {hechoTxt(aDef.concl)}
              </div>
            </div>
            {sub_("2 · Predice")}
            <div className="lc-opts">
              {[true, false].map((v) => {
                const on = predA[argumento] === v;
                const col = on ? (v === esValido(argumento) ? OK : WARN) : modoCol;
                return (
                  <button key={String(v)} className="lc-opt lc-valido" data-on={on} disabled={argPredicho} onClick={() => predecirArg(v)} style={{ ["--lcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                    <i className={`fa-solid ${v ? "fa-circle-check" : "fa-triangle-exclamation"}`} style={{ marginRight: 8 }} />
                    {v ? "Válido" : "Falacia"}
                  </button>
                );
              })}
            </div>
            {sub_("3 · Ponlo a prueba en los cuatro mundos")}
            <button className="lc-toggle lc-mundos" onClick={probarArg} disabled={!argPredicho} style={{ ["--lcc" as string]: AMBAR }}>
              <i className="fa-solid fa-earth-americas" style={{ marginRight: 9, color: AMBAR }} />
              {argPredicho ? (argProbado ? "Repetir la prueba en los mundos" : "Descartar mundos y buscar un contraejemplo") : "Primero haz tu predicción"}
            </button>
            {argProbado &&
              nota(
                <>
                  <strong>{aDef.valido ? "Válido." : "Falacia."}</strong> {predA[argumento] === aDef.valido ? "Tu predicción fue correcta. " : "Tu predicción no coincidió. "}
                  {aDef.explica}
                  {!aDef.valido && sit.ejemplos.FV && ` En «${sit.etq}» el contraejemplo es: ${sit.ejemplos.FV} (${sit.p.no} y ${sit.q.si}).`}
                </>,
                aDef.valido ? OK : WARN,
                aDef.valido ? "fa-circle-check" : "fa-bug",
              )}
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3 }}>
              Razonamientos en «{sit.etq}»: {ARGUMENTOS.filter((a) => predA[a] === esValido(a) && argProbados.has(`${sitId}-${a}`)).length}/4 bien clasificados y probados
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes lcPulse { 0%,100%{ box-shadow:0 0 0 0 var(--lcd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        @keyframes lcAparece { from { opacity:0; transform:scale(.6); } to { opacity:1; transform:none; } }
        .lc-live-dot { animation: lcPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .lc-live-dot { animation:none; } }
        .lc-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .lc-grid { grid-template-columns: 1fr; } }
        .lc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .lc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .lc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .lc-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .lc-tab { cursor:pointer; border:1px solid var(--lcc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .lc-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .lc-tab:hover { background:rgba(255,255,255,0.06); }
        .lc-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .lc-opt { cursor:pointer; border:1px solid var(--lcc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .lc-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .lc-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .lc-opt:disabled { cursor:default; }
        .lc-opt:disabled[data-on="false"] { opacity:0.55; }
        .lc-toggle { width:100%; cursor:pointer; border:1px solid var(--lcc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .lc-opts .lc-sw { width:auto; flex:1 1 220px; }
        .lc-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .lc-toggle:disabled { cursor:default; opacity:0.6; }
        .lc-subtabs { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:12px; padding:4px; border-radius:12px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; }
        .lc-subtab { cursor:pointer; border:none; border-radius:9px; padding:9px 10px; font-size:12.5px; font-weight:900; color:rgba(255,255,255,0.65); background:transparent; transition:all .15s; }
        .lc-subtab[data-on="true"] { background:color-mix(in srgb, var(--lcc) 22%, transparent); color:#fff; box-shadow: inset 0 0 0 1px var(--lcc); }
        .lc-tabla-wrap { overflow-x:auto; border-radius:12px; border:1px solid ${T.line}; }
        .lc-tabla { width:100%; border-collapse:collapse; font-size:12.5px; }
        .lc-tabla th { padding:8px 8px; font-size:11.5px; font-weight:900; color:rgba(255,255,255,0.75); font-family:ui-monospace, monospace; background:rgba(4,10,22,0.6); border-bottom:1px solid ${T.line}; white-space:nowrap; }
        .lc-tabla td { padding:5px 8px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.05); }
        .lc-fila { cursor:pointer; transition:background .15s; }
        .lc-fila:hover { background:rgba(255,255,255,0.04); }
        .lc-fila[data-actual="true"] { background:rgba(251,191,36,0.09); box-shadow: inset 3px 0 0 ${AMBAR}; }
        .lc-celda { cursor:pointer; min-width:38px; height:30px; border-radius:8px; border:1px solid rgba(255,255,255,0.18); background:rgba(4,10,22,0.55); color:#fff; font-family:ui-monospace, monospace; font-weight:900; font-size:13px; transition:all .15s; }
        .lc-celda:hover { border-color:${AMBAR}; }
        .lc-celda[data-estado="bien"] { border-color:${OK}; background:rgba(52,211,153,0.14); }
        .lc-celda[data-estado="mal"] { border-color:${WARN}; background:rgba(255,138,60,0.18); }
        .lc-link { cursor:pointer; margin-left:10px; border:none; background:transparent; color:${accent}; font-size:11.5px; font-weight:800; padding:0; }
        .lc-opt:focus-visible, .lc-tab:focus-visible, .lc-toggle:focus-visible, .lc-icobtn:focus-visible, .lc-celda:focus-visible, .lc-subtab:focus-visible, .lc-link:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .lc-bottom { grid-template-columns: 1fr !important; } }
        .lc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .lc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .lc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .lc-drawer[data-open="true"] { transform:translateX(0); }
        .lc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .lc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .lc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .lc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .lc-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .lc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="lc-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="lc-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--lcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="lc-grid">
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
              <LogicaScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                conectivo={conectivo}
                p={pV}
                q={qEf}
                revelado={revelado}
                pulso={pulsoC}
                onToggle={toggle}
                expresionId={ex.id}
                fila={fila}
                probada={probadasEx[fila]!}
                marcas={marcas}
                pulsoTabla={pulsoT}
                situacionId={sitId}
                sub={sub}
                forma={forma}
                formaRevelada={formaRevelada}
                argumento={argumento}
                argProbado={argProbado}
                pulsoRazonar={pulsoR}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="lc-live-dot" style={{ ["--lcd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="lc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="lc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="lc-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="lc-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-microchip" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Cuándo es verdadera una proposición compuesta?</div>
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
                  {q.pregunta}
                  <details style={{ marginTop: 3 }}>
                    <summary style={{ cursor: "pointer", fontSize: 11, color: "#7dd3fc", fontWeight: 800 }}>Respuesta guía</summary>
                    <span style={{ fontSize: 11.5, color: T.text2 }}>{q.guia}</span>
                  </details>
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
              <span className="lc-obj-cuenta" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} className="lc-obj" data-done={o.done} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="lc-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-medal" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (verdadero o falso A5)
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
              Glosario
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <span style={{ fontSize: 10, color: T.text3, marginLeft: 6 }}>({gi.origen})</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.35)" }}>
            <Eyebrow>
              <i className="fa-solid fa-newspaper" style={{ marginRight: 8, color: accent }} />
              Analiza un argumento real (reflexión A3)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{REFLEXION_A3.prompt}</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 16, display: "grid", gap: 4 }}>
              {REFLEXION_A3.pistas.map((x, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2 }}>
                  {x}
                </li>
              ))}
            </ul>
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
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-clipboard-check" style={{ marginRight: 8, color: accent }} />
              Autoevaluación (A7)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 6 }}>
              {AUTOEVALUACION_A7.criterios.map((x, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {x}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 11.5, color: T.text3, marginTop: 8, fontStyle: "italic" }}>{AUTOEVALUACION_A7.reflexion}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas y su recuadro, el ejercicio A2, la reflexión A3, el quiz A4, los hechos A5, el texto A6, los criterios A7 y las reglas de los conectivos (con sus distractores) de A9 son{" "}
          <strong>verbatim</strong> del material de la plataforma; el reto A2 se califica por los conteos de su tabla. Los valores de cada cable, fila y mundo se <strong>calculan</strong> con las reglas de la
          lógica proposicional, no se escriben a mano. Las situaciones cotidianas (la promesa del cine, el semáforo, el descuento) son <strong>ilustrativas</strong>; las compuertas siguen la simbología
          habitual de la electrónica digital (la del condicional se arma como ¬p ∨ q). Fuente: {FUENTE}
        </span>
      </div>

      <ProposicionCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={retoOk} onAprobado={() => setRetoOk(true)} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Dominas los conectivos lógicos." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="lc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="lc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="lc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="lc-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="lc-drawer-body">
          <FichaTeorica data={LOGICA_COMPUERTAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/** Explica, mundo por mundo, si una forma del condicional coincide con la original. */
function explicaForma(f: Forma, ejemplos: Record<string, string | null>): string {
  if (equivaleAOriginal(f)) return `La ${FORMA_DEF[f].etq.toLowerCase()} enciende exactamente los mismos focos que la original en los cuatro mundos: dicen lo mismo. Por eso, para probar «si p entonces q» basta probar «si no q entonces no p».`;
  const difs = FILAS.filter(([p, q]) => evaluar(FORMA_DEF[f].expr, p, q) !== evaluar(FORMA_DEF.original.expr, p, q)).map(([p, q]) => {
    const k = claveFila(p, q);
    const ej = ejemplos[k];
    return `en el mundo ${k} la original es ${vf(evaluar(FORMA_DEF.original.expr, p, q))} y la ${FORMA_DEF[f].etq.toLowerCase()} es ${vf(evaluar(FORMA_DEF[f].expr, p, q))}${ej ? ` (ej.: ${ej})` : ""}`;
  });
  return `No equivale: ${difs.join("; ")}. La recíproca y la inversa son equivalentes entre sí, pero no a la original.`;
}


