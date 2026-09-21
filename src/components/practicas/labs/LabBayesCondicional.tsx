"use client";

/**
 * Laboratorio 3D — "Bayes: actualizar creencias con nueva información".
 * Práctica experimental anclada a PM-VI-P06-A2 (ejercicio «calcular
 * probabilidades condicionales en pruebas diagnósticas médicas»; progresión 11
 * de la UAC PM-VI "Pensamiento Matemático VI"). El marco teórico es la lectura
 * A1, los hechos salen del quiz A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) El espacio se reduce — 100 personas; condicionar hunde a quienes no
 *      cumplen la condición. Tabla de doble entrada, P(A|B) frente a P(B|A)
 *      e independencia.
 *  (2) Árbol y regla del producto — árbol de dos etapas con partículas,
 *      probabilidad total, inversión con Bayes y simulación.
 *  (3) Prueba diagnóstica — 1 000 o 10 000 personas; prevalencia,
 *      sensibilidad y especificidad; los positivos se separan en verdaderos y
 *      falsos, y una segunda prueba toma el VPP como nueva prevalencia.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { BAYES_CONDICIONAL_FICHA } from "./bayes-condicional-ficha";
import type { VistaDx } from "./BayesCondicionalScene";
import {
  type Modo,
  type Condicion,
  type CasoEstimacion,
  MODOS,
  MODOS_DEF,
  POBLACIONES,
  poblacionPorId,
  CONDICIONES,
  lecturaCondicional,
  sonIndependientes,
  nABcIndependiente,
  EXPERIMENTOS,
  experimentoPorId,
  calcularArbol,
  simularArbol,
  txtP,
  txtFrac,
  reducir,
  fr,
  PREVALENCIAS,
  SENSIBILIDADES,
  ESPECIFICIDADES,
  ESCENARIOS,
  bayesDx,
  conteosDx,
  conteosDesde,
  poblacionDx,
  COL_DX,
  fmtPct,
  casoAleatorio,
  estrellasPorError,
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
} from "./bayes-condicional-data";

const BayesScene = dynamic(() => import("./BayesCondicionalScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-vial-virus fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el laboratorio de probabilidad condicional en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-bayes-condicional-reto";

/** Número con cuatro cifras significativas, sin ceros de relleno. */
const sig = (x: number) => String(Number(x.toPrecision(4)));
const pctCorto = (x: number) => `${Number((x * 100).toFixed(1))} %`;
const miles = (n: number) => n.toLocaleString("es-MX").replace(/,/g, " ");

/* ── Tarjeta de estrellas: estimar el VPP antes de calcularlo ─────────── */
function EstimaVppCard({
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
  const [caso, setCaso] = useState<CasoEstimacion>(() => casoAleatorio());
  const [valorTxt, setValorTxt] = useState("");
  const [revelado, setRevelado] = useState<{ estimado: number; estrellas: number } | null>(null);

  const b = bayesDx(caso.prevalencia, caso.sensibilidad, caso.especificidad);
  const c = conteosDx(10000, caso.prevalencia, caso.sensibilidad, caso.especificidad);

  const revelar = () => {
    const v = Number(valorTxt.trim().replace(",", ".").replace("%", ""));
    if (valorTxt.trim() === "" || !Number.isFinite(v) || v < 0 || v > 100) return;
    const error = Math.abs(v - b.vpp * 100);
    const est = estrellasPorError(error);
    setRevelado({ estimado: v, estrellas: est });
    playSfx?.(est > 0);
    if (est > 0) onResultado(est);
  };

  const otro = () => {
    setCaso((prev) => casoAleatorio(prev));
    setValorTxt("");
    setRevelado(null);
  };

  const dato = (etq: string, v: string) => (
    <div style={{ flex: "1 1 120px", padding: "10px 12px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: T.text3, letterSpacing: "0.07em", textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", ...NUM }}>{v}</div>
    </div>
  );

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Estima el VPP antes de calcularlo
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
        Una persona sale positiva en esta prueba. ¿Qué probabilidad hay de que de verdad esté enferma? Estima con la intuición o haciendo cuentas: 3 estrellas si te
        equivocas por 2 puntos o menos, 2 hasta 5 puntos y 1 hasta 12.
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {dato("Prevalencia", pctCorto(caso.prevalencia))}
        {dato("Sensibilidad", pctCorto(caso.sensibilidad))}
        {dato("Especificidad", pctCorto(caso.especificidad))}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={valorTxt}
          onChange={(e) => setValorTxt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !revelado) revelar();
          }}
          disabled={revelado !== null}
          inputMode="decimal"
          placeholder="Tu estimación del VPP, en %"
          aria-label="Estimación del VPP en porcentaje"
          style={{ flex: "1 1 200px", minWidth: 0, padding: "11px 13px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "rgba(2,12,28,0.55)", color: "#fff", fontSize: 15, fontWeight: 800, ...NUM }}
        />
        {revelado === null ? (
          <button
            onClick={revelar}
            disabled={valorTxt.trim() === ""}
            style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.18)`, color: "#fff", fontSize: 13, fontWeight: 900, opacity: valorTxt.trim() === "" ? 0.45 : 1 }}
          >
            <i className="fa-solid fa-eye" style={{ marginRight: 8 }} />
            Revelar
          </button>
        ) : (
          <button onClick={otro} style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "transparent", color: "#fff", fontSize: 13, fontWeight: 900 }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otro caso
          </button>
        )}
      </div>

      {revelado && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${revelado.estrellas > 0 ? `${OK}55` : "#FF8A3C55"}`, background: revelado.estrellas > 0 ? "rgba(52,211,153,0.08)" : "rgba(255,138,60,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= revelado.estrellas ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: revelado.estrellas > 0 ? OK : "#FF8A3C", marginLeft: 4, ...NUM }}>
              VPP real: {fmtPct(b.vpp)} · tu estimación: {revelado.estimado} % · diferencia {Math.abs(revelado.estimado - b.vpp * 100).toFixed(1)} puntos
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.6, ...NUM }}>
            En 10 000 personas hay {miles(c.enfermos)} enfermas; la prueba detecta a {miles(c.vp)}. De las {miles(c.sanos)} sanas, {miles(c.fp)} salen positivas por error. Entre los{" "}
            {miles(c.vp + c.fp)} positivos, {miles(c.vp)} están enfermos: VPP = {miles(c.vp)} / {miles(c.vp + c.fp)} = <strong style={{ color: "#fff" }}>{fmtPct(b.vpp)}</strong>.
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabBayesCondicional({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("reducido");

  // ── Espacio reducido
  const [poblacionId, setPoblacionId] = useState(POBLACIONES[0]!.id);
  const [nABc, setNABc] = useState(POBLACIONES[0]!.nABcInicial);
  const [condicion, setCondicion] = useState<Condicion>("ninguna");

  // ── Árbol
  const [experimentoId, setExperimentoId] = useState(EXPERIMENTOS[0]!.id);
  const [invertido, setInvertido] = useState(false);
  const [simHojas, setSimHojas] = useState<number[] | null>(null);

  // ── Diagnóstico
  const [prev, setPrev] = useState(ESCENARIOS[0]!.prevalencia);
  const [sens, setSens] = useState(ESCENARIOS[0]!.sensibilidad);
  const [esp, setEsp] = useState(ESCENARIOS[0]!.especificidad);
  const [tamano, setTamano] = useState<1000 | 10000>(1000);
  const [vistaDx, setVistaDx] = useState<VistaDx>("poblacion");
  const [ronda, setRonda] = useState<1 | 2>(1);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Logros pegajosos
  const [condicionesVistas, setCondicionesVistas] = useState<Set<Condicion>>(() => new Set());
  const [hallaIndependencia, setHallaIndependencia] = useState(false);
  const [simuloArbol, setSimuloArbol] = useState(false);
  const [invirtioArbol, setInvirtioArbol] = useState(false);
  const [positivosA2, setPositivosA2] = useState(false);
  const [prevalenciaBaja, setPrevalenciaBaja] = useState(false);
  const [segundaPrueba, setSegundaPrueba] = useState(false);
  const [estimo, setEstimo] = useState(false);

  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setEstimo(true);
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

  const poblacion = poblacionPorId(poblacionId);
  const nBc = poblacion.total - poblacion.nB;
  const nA = poblacion.nAB + nABc;
  const lectura = lecturaCondicional(poblacion, nABc, condicion);
  const indep = sonIndependientes(poblacion, nABc);
  const nIndep = nABcIndependiente(poblacion);

  const experimento = experimentoPorId(experimentoId);
  const arbol = useMemo(() => calcularArbol(experimento), [experimento]);
  const totalSim = simHojas ? simHojas.reduce((a, b) => a + b, 0) : 0;

  const c1 = useMemo(() => conteosDx(tamano, prev, sens, esp), [tamano, prev, sens, esp]);
  const c2 = useMemo(() => conteosDesde(c1.vp, c1.fp, sens, esp), [c1, sens, esp]);
  const conteos = ronda === 2 ? c2 : c1;
  const categorias = useMemo(() => poblacionDx(conteos, conteos.total * 31 + ronda * 7919), [conteos, ronda]);
  const b1 = bayesDx(prev, sens, esp);
  const b2 = bayesDx(b1.vpp, sens, esp);
  const bActual = ronda === 2 ? b2 : b1;
  const prevActual = ronda === 2 ? b1.vpp : prev;
  const positivosActual = conteos.vp + conteos.fp;
  const escenarioActivo = ESCENARIOS.find((s) => s.prevalencia === prev && s.sensibilidad === sens && s.especificidad === esp);

  /* ── Acciones ──────────────────────────────────────────────────────── */
  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
    bump();
  };

  // Espacio reducido
  const elegirPoblacion = (id: string) => {
    const p = poblacionPorId(id);
    setPoblacionId(id);
    setNABc(p.nABcInicial);
    blip();
  };
  const elegirCondicion = (c: Condicion) => {
    setCondicion(c);
    setCondicionesVistas((s) => new Set(s).add(c));
    blip();
  };
  const cambiarNABc = (v: number) => {
    setNABc(v);
    if (sonIndependientes(poblacion, v)) {
      setHallaIndependencia(true);
      exito();
    }
  };

  // Árbol
  const elegirExperimento = (id: string) => {
    setExperimentoId(id);
    setSimHojas(null);
    blip();
  };
  const alternarInvertido = () => {
    const nuevo = !invertido;
    setInvertido(nuevo);
    if (nuevo) setInvirtioArbol(true);
    blip();
  };
  const simular = (n: number) => {
    const h = simularArbol(experimento, n);
    const base = simHojas ?? [0, 0, 0, 0];
    const nuevo = base.map((x, i) => x + h[i]!);
    setSimHojas(nuevo);
    if (nuevo.reduce((a, b) => a + b, 0) >= 1000) setSimuloArbol(true);
    exito();
  };

  // Diagnóstico
  /** Fija los logros del modo con los valores que acaban de quedar. */
  const fijarLogrosDx = (v: { prev: number; sens: number; esp: number; vista: VistaDx; ronda: 1 | 2 }) => {
    if (v.vista !== "positivos") return;
    if (v.ronda === 1 && v.prev === 0.1 && v.sens === 0.9 && v.esp === 0.95) setPositivosA2(true);
    if (v.prev <= 0.01) setPrevalenciaBaja(true);
  };
  const cambiarParametro = (cual: "prev" | "sens" | "esp", x: number) => {
    const v = { prev, sens, esp, vista: vistaDx, ronda: 1 as const, [cual]: x };
    if (cual === "prev") setPrev(x);
    else if (cual === "sens") setSens(x);
    else setEsp(x);
    setRonda(1);
    fijarLogrosDx(v);
  };
  const elegirEscenario = (id: string) => {
    const s = ESCENARIOS.find((e) => e.id === id);
    if (!s) return;
    setPrev(s.prevalencia);
    setSens(s.sensibilidad);
    setEsp(s.especificidad);
    setRonda(1);
    fijarLogrosDx({ prev: s.prevalencia, sens: s.sensibilidad, esp: s.especificidad, vista: vistaDx, ronda: 1 });
    blip();
  };
  const elegirVista = (v: VistaDx) => {
    setVistaDx(v);
    fijarLogrosDx({ prev, sens, esp, vista: v, ronda });
    if (v === "positivos") exito();
    else blip();
  };
  const aplicarSegunda = () => {
    if (ronda !== 1 || c1.vp + c1.fp === 0) return;
    setRonda(2);
    setVistaDx("prueba");
    setSegundaPrueba(true);
    exito();
  };
  const volverPoblacion = () => {
    setRonda(1);
    setVistaDx("poblacion");
    blip();
  };
  const cambiarTamano = (n: 1000 | 10000) => {
    setTamano(n);
    setRonda(1);
    blip();
  };

  const reiniciar = () => {
    if (modo === "reducido") {
      setCondicion("ninguna");
      setNABc(poblacion.nABcInicial);
    } else if (modo === "arbol") {
      setInvertido(false);
      setSimHojas(null);
    } else {
      setRonda(1);
      setVistaDx("poblacion");
    }
    bump();
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Condicionar a un grupo y ver cómo se reduce el espacio muestral", done: condicionesVistas.has("B") || condicionesVistas.has("Bc") },
    { t: "Comparar P(A|B) con la condición invertida P(B|A)", done: (condicionesVistas.has("B") || condicionesVistas.has("Bc")) && condicionesVistas.has("A") },
    { t: "Encontrar cuántas mujeres deben fumar para que fumar sea independiente de ser hombre", done: hallaIndependencia },
    { t: "Simular al menos 1 000 repeticiones de un árbol", done: simuloArbol },
    { t: "Invertir un árbol con el teorema de Bayes", done: invirtioArbol },
    { t: "Separar los positivos con los datos del ejercicio A2", done: positivosA2 },
    { t: "Ver los positivos con una prevalencia de 1 % o menos", done: prevalenciaBaja },
    { t: "Aplicar una segunda prueba a los positivos", done: segundaPrueba },
    { t: "Estimar un VPP y ganar al menos una estrella", done: estimo },
    { t: "Resolver el reto evaluable (ejercicio A2)", done: ejercicioAprobado },
  ];

  /* ── Textos del visor ──────────────────────────────────────────────── */
  const fraccionLectura = reducir(fr(lectura.favorables, lectura.espacio));
  const valorLectura = lectura.espacio === 0 ? 0 : lectura.favorables / lectura.espacio;
  const notacionB = (t: string) => `${experimento.etapa1}: ${t}`;
  const notacionA = (t: string) => `${experimento.etapa2}: ${t}`;

  const pie: string =
    modo === "reducido"
      ? condicion === "ninguna"
        ? `Sin condición se cuenta entre las ${poblacion.total} personas: ${nA} cumplen «${poblacion.nombreA.toLowerCase()}». ${lectura.notacion} = ${nA}/${poblacion.total} = ${sig(valorLectura)}.`
        : `Solo quedan de pie ${lectura.espacio} personas (${lectura.espacioNombre}); ${lectura.favorables} cumplen lo que se pregunta. ${lectura.notacion} = ${lectura.favorables}/${lectura.espacio} = ${sig(valorLectura)}.`
      : modo === "arbol"
        ? invertido
          ? `Sabemos que ${experimento.etapa2.toLowerCase()} = ${experimento.a}: solo cuentan los caminos dorados. P(${notacionB(experimento.b)} | ${notacionA(experimento.a)}) = ${txtP(experimento, arbol.hojas[0]!.p)} / ${txtP(experimento, arbol.pA)} = ${txtP(experimento, arbol.pBdadoA)}.`
          : `Cada camino multiplica sus ramas; los dos caminos que terminan en «${experimento.a}» se suman: P(${experimento.a}) = ${txtP(experimento, arbol.hojas[0]!.p)} + ${txtP(experimento, arbol.hojas[2]!.p)} = ${txtP(experimento, arbol.pA)}.`
        : vistaDx === "poblacion"
          ? `${ronda === 2 ? "Segunda prueba: la población son los positivos de la primera. " : ""}De ${miles(conteos.total)} personas, ${miles(conteos.enfermos)} están enfermas (${pctCorto(prevActual)}). Todavía nadie se ha hecho la prueba.`
          : vistaDx === "prueba"
            ? `Color = realidad; brillo y altura = resultado. ${miles(conteos.vp)} enfermos y ${miles(conteos.fp)} sanos salieron positivos; ${miles(conteos.fn)} enfermos se le escaparon a la prueba.`
            : `Entre los ${miles(positivosActual)} positivos, ${miles(conteos.vp)} están enfermos y ${miles(conteos.fp)} sanos. VPP = ${fmtPct(bActual.vpp)}: ${bActual.vpp < 0.5 ? "la mayoría de los positivos son falsos." : "la mayoría de los positivos son verdaderos."}`;

  const chipVivo =
    modo === "reducido"
      ? `${lectura.notacion} = ${lectura.favorables}/${lectura.espacio}`
      : modo === "arbol"
        ? invertido
          ? `P(${notacionB(experimento.b)} | ${notacionA(experimento.a)}) = ${txtP(experimento, arbol.pBdadoA)}`
          : `P(${experimento.a}) = ${txtP(experimento, arbol.pA)}`
        : `${ronda === 2 ? "2.ª · " : ""}VPP = ${fmtPct(bActual.vpp)}`;

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

  const sub = (txt: string, extra?: ReactNode) => (
    <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>
      {txt}
      {extra}
    </div>
  );

  const chip = (col: string, txt: ReactNode, forma: "cuadro" | "bola" = "cuadro") => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 999, background: "rgba(4,10,22,0.72)", border: `1px solid ${T.line}`, fontSize: 11, fontWeight: 800, color: "#e2e8f0", whiteSpace: "nowrap" }}>
      <span style={{ width: 9, height: 9, borderRadius: forma === "bola" ? "50%" : 3, background: col }} />
      {txt}
    </span>
  );

  /* ── Panel por modo ────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "reducido") {
    const celda = (n: number, num: boolean, den: boolean, fuerte = false) => (
      <td
        style={{
          padding: "8px 6px",
          textAlign: "center",
          fontWeight: fuerte ? 900 : 800,
          color: num ? "#fff" : T.text2,
          background: num ? `rgba(${color.rgba},0.28)` : "transparent",
          outline: den ? `2px solid ${modoCol}` : "none",
          outlineOffset: -2,
          borderRadius: 6,
          ...NUM,
        }}
      >
        {n}
      </td>
    );
    const esNum = (fila: "B" | "Bc" | "T", colA: "A" | "Ac" | "T") => {
      if (colA !== "A") return false;
      if (condicion === "ninguna") return fila === "T";
      if (condicion === "B" || condicion === "A") return fila === "B";
      return fila === "Bc";
    };
    const esDen = (fila: "B" | "Bc" | "T", colA: "A" | "Ac" | "T") => {
      if (condicion === "ninguna") return fila === "T" && colA === "T";
      if (condicion === "B") return fila === "B" && colA === "T";
      if (condicion === "Bc") return fila === "Bc" && colA === "T";
      return fila === "T" && colA === "A";
    };
    const pAB = poblacion.nAB / poblacion.nB;
    const pABc = nBc === 0 ? 0 : nABc / nBc;
    const pA = nA / poblacion.total;
    const conjunto = condicion === "A" ? `${poblacion.cortoB} ∩ ${poblacion.cortoA}` : condicion === "Bc" ? `${poblacion.cortoA} ∩ ${poblacion.cortoBc}` : `${poblacion.cortoA} ∩ ${poblacion.cortoB}`;
    const condicionante = condicion === "A" ? poblacion.cortoA : condicion === "Bc" ? poblacion.cortoBc : poblacion.cortoB;

    control = (
      <>
        <div className="bc-opts">
          {POBLACIONES.map((p) => {
            const on = p.id === poblacionId;
            return (
              <button key={p.id} className="bc-opt" data-on={on} onClick={() => elegirPoblacion(p.id)} style={{ ["--bcc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                {p.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>{poblacion.nota}</div>

        {sub("¿Qué sabemos de la persona elegida?")}
        <div className="bc-opts">
          {CONDICIONES.map((c) => {
            const on = c === condicion;
            return (
              <button key={c} className="bc-opt" data-on={on} onClick={() => elegirCondicion(c)} style={{ ["--bcc" as string]: accent, background: on ? `rgba(${color.rgba},0.18)` : "transparent", fontFamily: "ui-monospace, monospace" }}>
                {lecturaCondicional(poblacion, nABc, c).notacion}
              </button>
            );
          })}
        </div>

        {poblacion.abcAjustable && (
          <>
            {sub(`${poblacion.nombreBc} que cumplen «${poblacion.nombreA.toLowerCase()}»`, <span style={{ color: "#fff", ...NUM }}> — {nABc} de {nBc}</span>)}
            <input type="range" min={0} max={nBc} step={1} value={nABc} onChange={(e) => cambiarNABc(Number(e.target.value))} aria-label={`${poblacion.nombreBc} que cumplen ${poblacion.nombreA}`} className="bc-range" style={{ ["--bcc" as string]: modoCol }} />
          </>
        )}

        {sub("Tabla de doble entrada")}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, fontSize: 13 }}>
            <thead>
              <tr style={{ color: T.text3, fontSize: 11 }}>
                <th />
                <th style={{ padding: 4 }}>{poblacion.nombreA}</th>
                <th style={{ padding: 4 }}>No</th>
                <th style={{ padding: 4 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11.5, color: "#38bdf8", padding: 4 }}>{poblacion.nombreB}</th>
                {celda(poblacion.nAB, esNum("B", "A"), esDen("B", "A"))}
                {celda(poblacion.nB - poblacion.nAB, false, false)}
                {celda(poblacion.nB, false, esDen("B", "T"), true)}
              </tr>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11.5, color: "#a78bfa", padding: 4 }}>{poblacion.nombreBc}</th>
                {celda(nABc, esNum("Bc", "A"), esDen("Bc", "A"))}
                {celda(nBc - nABc, false, false)}
                {celda(nBc, false, esDen("Bc", "T"), true)}
              </tr>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11.5, color: T.text3, padding: 4 }}>Total</th>
                {celda(nA, esNum("T", "A"), esDen("T", "A"), true)}
                {celda(poblacion.total - nA, false, false, true)}
                {celda(poblacion.total, false, esDen("T", "T"), true)}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: `rgba(${color.rgba},0.5)`, marginRight: 6, verticalAlign: "middle" }} />
          casos favorables
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, border: `2px solid ${modoCol}`, margin: "0 6px 0 14px", verticalAlign: "middle" }} />
          espacio muestral que queda
        </div>

        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5, lineHeight: 1.8, color: "#eaf0fb", textAlign: "center", ...NUM }}>
            {condicion === "ninguna" ? (
              <div>
                {lectura.notacion} = {nA}/{poblacion.total} = <span style={{ color: accent, fontWeight: 900 }}>{sig(valorLectura)}</span>
              </div>
            ) : (
              <>
                <div>
                  {lectura.notacion} = P({conjunto}) / P({condicionante})
                </div>
                <div>
                  = ({lectura.favorables}/{poblacion.total}) / ({lectura.espacio}/{poblacion.total}) = {lectura.favorables}/{lectura.espacio}
                  {fraccionLectura.den !== lectura.espacio && lectura.espacio > 0 ? ` = ${txtFrac(fraccionLectura)}` : ""} ={" "}
                  <span style={{ color: accent, fontWeight: 900 }}>{sig(valorLectura)}</span>
                </div>
              </>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: T.text2, lineHeight: 1.5, textAlign: "center" }}>
            El {poblacion.total} se cancela: dividir probabilidades es lo mismo que contar dentro del grupo que queda.
          </div>
        </div>

        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, border: `1px solid ${indep ? `${OK}66` : T.line}`, background: indep ? "rgba(52,211,153,0.08)" : "rgba(4,10,22,0.4)" }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Readout label={`P(${poblacion.cortoA}|${poblacion.cortoB})`} value={sig(pAB)} size={16} />
            <Readout label={`P(${poblacion.cortoA}|${poblacion.cortoBc})`} value={sig(pABc)} size={16} />
            <Readout label={`P(${poblacion.cortoA})`} value={sig(pA)} size={16} col={indep ? OK : undefined} />
          </div>
          <div style={{ fontSize: 11.5, color: indep ? OK : T.text2, lineHeight: 1.5, textAlign: "center", fontWeight: indep ? 800 : 500 }}>
            {indep
              ? `Independientes: saber si es ${poblacion.cortoB} o ${poblacion.cortoBc} no cambia la probabilidad, P(${poblacion.cortoA}|${poblacion.cortoB}) = P(${poblacion.cortoA}).`
              : poblacion.abcAjustable && nIndep !== null
                ? `Dependientes: las dos probabilidades condicionales son distintas. Mueve el control hasta que coincidan.`
                : `Dependientes: saber el grupo cambia la probabilidad de «${poblacion.nombreA.toLowerCase()}».`}
          </div>
        </div>
      </>
    );
  } else if (modo === "arbol") {
    const e = experimento;
    control = (
      <>
        <div className="bc-opts">
          {EXPERIMENTOS.map((x) => {
            const on = x.id === experimentoId;
            return (
              <button key={x.id} className="bc-opt" data-on={on} onClick={() => elegirExperimento(x.id)} style={{ ["--bcc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                {x.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>{e.nota}</div>

        <button className="bc-toggle" data-on={invertido} onClick={alternarInvertido} style={{ marginTop: 12, ["--bcc" as string]: invertido ? accent : "rgba(255,255,255,0.2)" }}>
          <i className={`fa-solid ${invertido ? "fa-eye" : "fa-arrow-right-arrow-left"}`} style={{ marginRight: 9, color: accent }} />
          {invertido ? `Sabemos que ${e.etapa2.toLowerCase()} = ${e.a} — quitar la información` : `Invertir con Bayes: saber que ${e.etapa2.toLowerCase()} = ${e.a}`}
        </button>

        {sub("Caminos del árbol (regla del producto)")}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: T.text3, fontSize: 10.5, textAlign: "left" }}>
                <th style={{ padding: "4px 6px" }}>Camino</th>
                <th style={{ padding: "4px 6px" }}>Producto</th>
                <th style={{ padding: "4px 6px", textAlign: "right" }}>P</th>
                {simHojas && <th style={{ padding: "4px 6px", textAlign: "right" }}>Simulado</th>}
              </tr>
            </thead>
            <tbody>
              {arbol.hojas.map((h) => {
                const p1 = h.enB ? e.pB : arbol.pBc;
                const p2 = h.enB ? (h.enA ? e.pAdadoB : arbol.pAcDadoB) : h.enA ? e.pAdadoBc : arbol.pAcDadoBc;
                const apagada = invertido && !h.enA;
                return (
                  <tr key={h.k} style={{ borderTop: `1px solid ${T.line}`, opacity: apagada ? 0.4 : 1 }}>
                    <td style={{ padding: "6px", color: h.enA ? "#fbbf24" : T.text2, fontWeight: 800 }}>{h.etq}</td>
                    <td style={{ padding: "6px", fontFamily: "ui-monospace, monospace", color: T.text2, ...NUM }}>
                      {txtP(e, p1)} × {txtP(e, p2)}
                    </td>
                    <td style={{ padding: "6px", textAlign: "right", fontFamily: "ui-monospace, monospace", color: "#fff", fontWeight: 900, ...NUM }}>{txtP(e, h.p)}</td>
                    {simHojas && (
                      <td style={{ padding: "6px", textAlign: "right", fontFamily: "ui-monospace, monospace", color: modoCol, fontWeight: 800, ...NUM }}>{totalSim > 0 ? (simHojas[h.k]! / totalSim).toFixed(4) : "—"}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12`, fontFamily: "ui-monospace, monospace", fontSize: 12, lineHeight: 1.8, color: "#eaf0fb", ...NUM }}>
          <div>
            <span style={{ color: T.text3 }}>Probabilidad total · </span>P({notacionA(e.a)}) = {txtP(e, arbol.hojas[0]!.p)} + {txtP(e, arbol.hojas[2]!.p)} ={" "}
            <span style={{ color: "#fbbf24", fontWeight: 900 }}>{txtP(e, arbol.pA)}</span>
          </div>
          <div style={{ marginTop: 4, paddingTop: 6, borderTop: `1px solid ${T.line}`, color: invertido ? "#fff" : T.text2 }}>
            <span style={{ color: T.text3 }}>Bayes · </span>P({notacionB(e.b)} | {notacionA(e.a)}) = {txtP(e, arbol.hojas[0]!.p)} / {txtP(e, arbol.pA)} ={" "}
            <span style={{ color: accent, fontWeight: 900 }}>{txtP(e, arbol.pBdadoA)}</span>
          </div>
          <div style={{ color: T.text3, fontSize: 11.5 }}>
            Antes de saber nada: P({notacionB(e.b)}) = {txtP(e, e.pB)}
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: arbol.independientes ? OK : T.text2, lineHeight: 1.5, fontWeight: arbol.independientes ? 800 : 500 }}>
          {arbol.independientes
            ? `Las dos ramas de la 2.ª etapa valen ${txtP(e, e.pAdadoB)}: el resultado de la 1.ª no cambia nada. Eventos independientes, y por eso Bayes devuelve P(${e.b}) sin cambios.`
            : `P(${e.a} | ${e.b}) = ${txtP(e, e.pAdadoB)} y P(${e.a} | ${e.bc}) = ${txtP(e, e.pAdadoBc)} son distintas: los eventos son dependientes.`}
        </div>

        <div className="bc-opts" style={{ marginTop: 12 }}>
          <button className="bc-opt" data-on onClick={() => simular(1000)} style={{ ["--bcc" as string]: accent, background: `rgba(${color.rgba},0.16)` }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8, color: accent }} />
            Simular 1 000
          </button>
          <button className="bc-opt" data-on={false} onClick={() => simular(10000)} style={{ ["--bcc" as string]: modoCol }}>
            <i className="fa-solid fa-forward-fast" style={{ marginRight: 8, color: modoCol }} />
            Simular 10 000
          </button>
          {simHojas && (
            <span style={{ alignSelf: "center", fontSize: 12, color: T.text2, ...NUM }}>
              {miles(totalSim)} repeticiones · P({e.a}) simulada ≈ {((simHojas[0]! + simHojas[2]!) / totalSim).toFixed(4)}
            </span>
          )}
        </div>
      </>
    );
  } else {
    const idxDe = (arr: number[], v: number) => Math.max(0, arr.indexOf(v));
    const deslizador = (etq: string, arr: number[], v: number, cual: "prev" | "sens" | "esp", ayuda: string) => (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 800, color: T.text2, marginBottom: 4 }}>
          <span>{etq}</span>
          <span style={{ color: "#fff", ...NUM }}>{pctCorto(v)}</span>
        </div>
        <input type="range" min={0} max={arr.length - 1} step={1} value={idxDe(arr, v)} onChange={(e) => cambiarParametro(cual, arr[Number(e.target.value)]!)} aria-label={etq} className="bc-range" style={{ ["--bcc" as string]: modoCol }} />
        <div style={{ fontSize: 10.5, color: T.text3 }}>{ayuda}</div>
      </div>
    );
    const pasos: { etq: string; vista: VistaDx; icono: string }[] = [
      { etq: "Población", vista: "poblacion", icono: "fa-people-group" },
      { etq: "Aplicar la prueba", vista: "prueba", icono: "fa-vial" },
      { etq: "Solo positivos", vista: "positivos", icono: "fa-filter" },
    ];
    control = (
      <>
        <div className="bc-opts">
          {ESCENARIOS.map((s) => {
            const on = escenarioActivo?.id === s.id;
            return (
              <button key={s.id} className="bc-opt" data-on={on} onClick={() => elegirEscenario(s.id)} style={{ ["--bcc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                {s.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>{escenarioActivo ? escenarioActivo.nota : "Valores elegidos con los controles."}</div>

        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {deslizador("Prevalencia", PREVALENCIAS, prev, "prev", "Qué tan común es la enfermedad en la población.")}
          {deslizador("Sensibilidad · P(positivo | enfermo)", SENSIBILIDADES, sens, "sens", "Qué tan bien detecta la prueba a los enfermos.")}
          {deslizador("Especificidad · P(negativo | sano)", ESPECIFICIDADES, esp, "esp", "Qué tan bien descarta a los sanos.")}
        </div>

        <div className="bc-opts" style={{ marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.06em", marginRight: 4 }}>PERSONAS</span>
          {([1000, 10000] as const).map((n) => (
            <button key={n} className="bc-opt" data-on={tamano === n} onClick={() => cambiarTamano(n)} style={{ ["--bcc" as string]: accent, background: tamano === n ? `rgba(${color.rgba},0.16)` : "transparent", ...NUM }}>
              {miles(n)}
            </button>
          ))}
        </div>

        {sub(ronda === 2 ? "Segunda prueba, a los positivos de la primera" : "Paso a paso")}
        <div className="bc-pasos">
          {pasos.map((p) => (
            <button key={p.vista} className="bc-opt" data-on={vistaDx === p.vista} onClick={() => elegirVista(p.vista)} style={{ ["--bcc" as string]: accent, background: vistaDx === p.vista ? `rgba(${color.rgba},0.18)` : "transparent" }}>
              <i className={`fa-solid ${p.icono}`} style={{ marginRight: 7, color: accent }} />
              {p.etq}
            </button>
          ))}
        </div>
        <div className="bc-opts" style={{ marginTop: 8 }}>
          {ronda === 1 ? (
            <button className="bc-opt" data-on={vistaDx === "positivos"} onClick={aplicarSegunda} disabled={vistaDx !== "positivos" || c1.vp + c1.fp === 0} style={{ ["--bcc" as string]: modoCol, opacity: vistaDx !== "positivos" ? 0.5 : 1, cursor: vistaDx !== "positivos" ? "not-allowed" : "pointer" }}>
              <i className="fa-solid fa-vials" style={{ marginRight: 8, color: modoCol }} />
              Segunda prueba a los {miles(c1.vp + c1.fp)} positivos
            </button>
          ) : (
            <button className="bc-opt" data-on onClick={volverPoblacion} style={{ ["--bcc" as string]: modoCol }}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 8, color: modoCol }} />
              Volver a la población completa
            </button>
          )}
        </div>

        {sub("Conteo de personas", <span style={{ color: "#fff", ...NUM }}> — {miles(conteos.total)}</span>)}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, fontSize: 12.5, ...NUM }}>
            <thead>
              <tr style={{ color: T.text3, fontSize: 10.5 }}>
                <th />
                <th style={{ padding: 4 }}>Positivo</th>
                <th style={{ padding: 4 }}>Negativo</th>
                <th style={{ padding: 4 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th style={{ textAlign: "left", color: COL_DX.vp, fontSize: 11.5, padding: 4 }}>Enfermos</th>
                <td className="bc-td" style={{ background: `${COL_DX.vp}33`, color: "#fff" }}>{miles(conteos.vp)}</td>
                <td className="bc-td">{miles(conteos.fn)}</td>
                <td className="bc-td" style={{ fontWeight: 900 }}>{miles(conteos.enfermos)}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", color: COL_DX.fp, fontSize: 11.5, padding: 4 }}>Sanos</th>
                <td className="bc-td" style={{ background: `${COL_DX.fp}2a`, color: "#fff" }}>{miles(conteos.fp)}</td>
                <td className="bc-td">{miles(conteos.vn)}</td>
                <td className="bc-td" style={{ fontWeight: 900 }}>{miles(conteos.sanos)}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", color: T.text3, fontSize: 11.5, padding: 4 }}>Total</th>
                <td className="bc-td" style={{ fontWeight: 900, outline: `2px solid ${accent}`, outlineOffset: -2 }}>{miles(positivosActual)}</td>
                <td className="bc-td" style={{ fontWeight: 900 }}>{miles(conteos.fn + conteos.vn)}</td>
                <td className="bc-td" style={{ fontWeight: 900 }}>{miles(conteos.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12`, fontFamily: "ui-monospace, monospace", fontSize: 11.8, lineHeight: 1.85, color: "#eaf0fb", ...NUM }}>
          {ronda === 2 && <div style={{ color: T.text3, fontFamily: "inherit" }}>La prevalencia de la 2.ª prueba es el VPP de la 1.ª: {fmtPct(b1.vpp)}</div>}
          <div>
            P(+ ∩ enfermo) = {sig(prevActual)} × {sig(sens)} = {sig(bActual.pVP)}
          </div>
          <div>
            P(+ ∩ sano) = {sig(1 - prevActual)} × {sig(1 - esp)} = {sig(bActual.pFP)}
          </div>
          <div>
            P(+) = {sig(bActual.pVP)} + {sig(bActual.pFP)} = {sig(bActual.pPos)}
          </div>
          <div style={{ marginTop: 4, paddingTop: 6, borderTop: `1px solid ${T.line}`, fontWeight: 900, color: "#fff" }}>
            VPP = {sig(bActual.pVP)} / {sig(bActual.pPos)} = <span style={{ color: accent }}>{fmtPct(bActual.vpp)}</span>
          </div>
          <div style={{ color: T.text3, fontSize: 11 }}>
            Con personas enteras: {miles(conteos.vp)} / {miles(positivosActual)} = {positivosActual === 0 ? "—" : fmtPct(conteos.vp / positivosActual)}
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes bcPulse { 0%,100%{ box-shadow:0 0 0 0 var(--bcd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .bc-live-dot { animation: bcPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .bc-live-dot { animation:none; } }
        .bc-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .bc-grid { grid-template-columns: 1fr; } }
        .bc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .bc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .bc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .bc-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .bc-tab { cursor:pointer; border:1px solid var(--bcc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .bc-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .bc-tab:hover { background:rgba(255,255,255,0.06); }
        .bc-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .bc-pasos { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:7px; }
        @media (max-width: 520px){ .bc-pasos { grid-template-columns: 1fr; } }
        .bc-opt { cursor:pointer; border:1px solid var(--bcc); border-radius:10px; padding:9px 12px; font-size:12px;
          font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .bc-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
        .bc-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .bc-opt:focus-visible, .bc-tab:focus-visible, .bc-toggle:focus-visible, .bc-icobtn:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .bc-toggle { width:100%; cursor:pointer; border:1px solid var(--bcc); border-radius:11px; padding:11px 14px;
          background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .bc-toggle:hover { background:rgba(255,255,255,0.07); }
        .bc-range { width:100%; accent-color: var(--bcc); }
        .bc-td { padding:7px 6px; text-align:center; font-weight:800; color:${T.text2}; border-radius:6px; }
        @media (max-width: 1000px){ .bc-bottom { grid-template-columns: 1fr !important; } }

        .bc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .bc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .bc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .bc-drawer[data-open="true"] { transform:translateX(0); }
        .bc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .bc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .bc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .bc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .bc-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .bc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="bc-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="bc-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--bcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="bc-grid">
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
              <BayesScene
                modo={modo}
                poblacion={poblacion}
                nABc={nABc}
                condicion={condicion}
                experimento={experimento}
                invertido={invertido}
                simHojas={simHojas}
                categorias={categorias}
                vistaDx={vistaDx}
                conteos={conteos}
                ronda={ronda}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="bc-live-dot" style={{ ["--bcd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {modo === "reducido" && (
                  <>
                    {chip("#38bdf8", poblacion.nombreB)}
                    {chip("#a78bfa", poblacion.nombreBc)}
                    {chip("#fb923c", `Cabeza encendida: ${poblacion.nombreA.toLowerCase()}`, "bola")}
                  </>
                )}
                {modo === "arbol" && (
                  <>
                    {chip("#fbbf24", `Termina en «${experimento.a}»`, "bola")}
                    {simHojas && chip(modoCol, "Barra delgada: frecuencia simulada")}
                  </>
                )}
                {modo === "diagnostico" &&
                  (vistaDx === "poblacion" ? (
                    <>
                      {chip(COL_DX.enfermo, "Enferma")}
                      {chip(COL_DX.sano, "Sana")}
                    </>
                  ) : (
                    <>
                      {chip(COL_DX.vp, "Enferma y positiva")}
                      {chip(COL_DX.fn, "Enferma y negativa")}
                      {chip(COL_DX.fp, "Sana y positiva")}
                      {chip(COL_DX.vn, "Sana y negativa")}
                    </>
                  ))}
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="bc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="bc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="bc-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            <button className="bc-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", border: "1px solid #7dd3fc55", borderRadius: 6, padding: "3px 7px" }}>
                {def.fuente === "A2" ? "EJERCICIO A2" : def.fuente === "A4" ? "QUIZ A4 · GLOSARIO A5" : "LECTURA A1"}
              </span>
            </div>
            {control}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-vial-virus" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Actualizar creencias</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1 — Probabilidad condicional y Bayes
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="bc-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
            Datos clave
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere", ...NUM }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-hospital" style={{ marginRight: 8, color: accent }} />
              Un positivo no es una sentencia
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              ¿Sabías que? (quiz A4)
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
          La lectura A1, las preguntas de reflexión, los hechos del quiz A4, el glosario A5 y el ejercicio A2 son <strong>verbatim</strong> del material de la
          plataforma. Las probabilidades del árbol son fracciones exactas y las de la prueba diagnóstica salen de la fórmula de Bayes; los conteos de personas son
          esas mismas probabilidades redondeadas a personas enteras. El número de mujeres que fuman y los escenarios «enfermedad rara» y «prueba excelente» son
          valores del laboratorio, no del material oficial; la segunda prueba supone que las dos pruebas fallan de forma independiente. La simulación usa el
          generador aleatorio del navegador. Fuente: {FUENTE}
        </span>
      </div>

      <EstimaVppCard
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

      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={(ok) => {
          if (!sonido) return;
          if (ok) audioRef.current?.correcto();
          else audioRef.current?.incorrecto();
        }}
      />

      <div className="bc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="bc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="bc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="bc-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="bc-drawer-body">
          <FichaTeorica data={BAYES_CONDICIONAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
