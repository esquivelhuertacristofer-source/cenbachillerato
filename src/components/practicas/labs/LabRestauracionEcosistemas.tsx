"use client";

/**
 * Laboratorio 3D — "Políticas de conservación y restauración de ecosistemas
 * en México".
 * Práctica anclada a CNEYT-III-P07-A2 (verdadero o falso «Conservación en
 * México») y CNEYT-III-P07-A6 (completa el texto); progresión 11 de la UAC
 * CNEYT-III. El marco teórico es la lectura A1, los hechos salen del quiz A4,
 * el glosario del A5, la reflexión final de la autoevaluación A7 y el
 * contrarreloj se inspira en el reto cronometrado A10.
 *
 * Tres modos:
 *  (1) Plan de conservación — asignar instrumentos reales a las ocho zonas de
 *      una cuenca ilustrativa con presupuesto limitado y simular 30 años.
 *  (2) Restaurar una parcela — sucesión secundaria con tiempos de recuperación
 *      publicados; técnica, distancia al bosque, uso previo y fuego.
 *  (3) Casos de México — vaquita marina, Cabo Pulmo y mariposa monarca: línea
 *      de tiempo con datos medidos y diagnóstico.
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
import { RESTAURACION_ECOSISTEMAS_FICHA } from "./restauracion-ecosistemas-ficha";
import {
  type Modo,
  type InstrumentoId,
  type Estrategia,
  type Atributo,
  type CasoId,
  type CondicionesParcela,
  MODOS,
  MODOS_DEF,
  INSTRUMENTOS,
  CALIDAD_DEF,
  ZONAS,
  PRESUPUESTO,
  ANIOS_PLAN,
  META_COB,
  META_BIO,
  META_COM,
  BONO_CORREDOR,
  PLAN_INICIAL,
  opcionesDe,
  opcionDe,
  costoPlan,
  indicadores,
  cumpleMetas,
  ESTRATEGIAS,
  DIST_MIN,
  DIST_MAX,
  DIST_PASO,
  USO_MAX,
  ANIOS_SUC,
  ATRIBUTOS,
  ATRIBUTO_DEF,
  estadoParcela,
  etapaDe,
  ETAPA_DEF,
  aniosHasta,
  PREDICCION_OPCIONES,
  CASOS,
  textoValor,
  SITUACIONES,
  SEGUNDOS_POR_SITUACION,
  rondaSituaciones,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  NOTA_A1,
  PREGUNTAS,
  REFLEXION_A7,
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
} from "./restauracion-ecosistemas-data";

const RestauracionScene = dynamic(() => import("./RestauracionEcosistemasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-seedling fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la cuenca en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-restauracion-ecosistemas-reto";
const WARN = "#FF8A3C";
const PASO_MS = 100;
const ANIOS_POR_SEGUNDO = 5;
const RONDA_INICIAL = rondaSituaciones(mulberry32(7));
/** Condición de referencia de la literatura: regeneración natural junto a bosque maduro. */
const REFERENCIA: CondicionesParcela = { estrategia: "pasiva", distancia: 100, uso: 0, fuego: false };

/* ── Tarjeta de estrellas: contrarreloj «¿Qué instrumento usarías?» ────── */
function ContrarrelojCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const [activo, setActivo] = useState(false);
  const [restante, setRestante] = useState(SEGUNDOS_POR_SITUACION);
  const limite = useRef(0);
  const item = ronda[pos] ?? ronda[0]!;
  const sit = SITUACIONES[item.idx]!;

  const avanzar = useCallback(
    (ok: boolean, txt: string | null) => {
      const errs = errores + (ok ? 0 : 1);
      setErrores(errs);
      setAviso(txt);
      if (pos + 1 >= ronda.length) {
        const est = estrellasPorErrores(errs);
        setResuelto(est);
        setActivo(false);
        onResultado(est);
      } else {
        setPos((p) => p + 1);
        limite.current = Date.now() + SEGUNDOS_POR_SITUACION * 1000;
        setRestante(SEGUNDOS_POR_SITUACION);
      }
    },
    [errores, pos, ronda.length, onResultado],
  );

  useEffect(() => {
    if (!activo || resuelto !== null) return;
    const id = window.setInterval(() => {
      const quedan = Math.max(0, (limite.current - Date.now()) / 1000);
      setRestante(quedan);
      if (quedan <= 0) {
        playSfx?.(false);
        avanzar(false, `Se acabó el tiempo. Era ${INSTRUMENTOS[sit.correcto].etq}: ${sit.porque}`);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [activo, resuelto, avanzar, playSfx, sit]);

  const empezar = () => {
    limite.current = Date.now() + SEGUNDOS_POR_SITUACION * 1000;
    setRestante(SEGUNDOS_POR_SITUACION);
    setActivo(true);
  };
  const responder = (id: InstrumentoId) => {
    if (!activo || resuelto !== null) return;
    const ok = id === sit.correcto;
    playSfx?.(ok);
    avanzar(ok, ok ? null : `No era ${INSTRUMENTOS[id].corto}: era ${INSTRUMENTOS[sit.correcto].etq}. ${sit.porque}`);
  };
  const otra = () => {
    setRonda(rondaSituaciones(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
    limite.current = Date.now() + SEGUNDOS_POR_SITUACION * 1000;
    setRestante(SEGUNDOS_POR_SITUACION);
    setActivo(true);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-stopwatch" style={{ marginRight: 8, color: accent }} />
          Contrarreloj: ¿qué instrumento usarías?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        !activo ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, maxWidth: 560 }}>
              Seis situaciones reales, {SEGUNDOS_POR_SITUACION} segundos cada una (como el reto contrarreloj A10). Elige el instrumento que mejor resuelve cada caso: sin errores ganas tres estrellas.
            </div>
            <button className="re-opt re-empezar" data-on="true" onClick={empezar} style={{ ["--rec" as string]: accent, background: `rgba(${rgba},0.16)` }}>
              <i className="fa-solid fa-play" style={{ marginRight: 8 }} />
              Empezar contrarreloj
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>
                Situación {pos + 1} de {ronda.length}
              </span>
              <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${(restante / SEGUNDOS_POR_SITUACION) * 100}%`, height: "100%", background: restante < 5 ? WARN : accent, transition: "width .2s linear" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 900, color: restante < 5 ? WARN : "#fff", width: 34, textAlign: "right", ...NUM }}>{Math.ceil(restante)} s</span>
            </div>
            <div className="re-situacion" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
              «{sit.texto}»
            </div>
            <div className="re-opts">
              {item.opciones.map((id) => (
                <button key={id} className="re-opt re-cr" data-on="true" onClick={() => responder(id)} style={{ ["--rec" as string]: INSTRUMENTOS[id].color }}>
                  <i className={`fa-solid ${INSTRUMENTOS[id].icono}`} style={{ marginRight: 8, color: INSTRUMENTOS[id].color }} />
                  {INSTRUMENTOS[id].etq}
                </button>
              ))}
            </div>
            {aviso && <div style={{ marginTop: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso}</div>}
          </>
        )
      ) : (
        <>
          {aviso && <div style={{ marginBottom: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso}</div>}
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
        </>
      )}
    </div>
  );
}

/* ── Medidor con meta ─────────────────────────────────────────────────── */
function Medidor({ etq, valor, meta, icono, col }: { etq: string; valor: number; meta: number; icono: string; col: string }) {
  const ok = valor >= meta;
  return (
    <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${ok ? `${OK}55` : T.line}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: T.text2 }}>
          <i className={`fa-solid ${icono}`} style={{ marginRight: 6, color: col }} />
          {etq}
        </span>
        <span style={{ fontSize: 15, fontWeight: 900, color: ok ? OK : "#fff", ...NUM }}>{num(valor)}</span>
      </div>
      <div style={{ position: "relative", height: 7, marginTop: 7, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${Math.min(100, valor)}%`, height: "100%", borderRadius: 99, background: ok ? OK : col, transition: "width .15s linear" }} />
        <div title={`Meta ${meta}`} style={{ position: "absolute", left: `${meta}%`, top: -3, width: 2, height: 13, background: "#fff" }} />
      </div>
      <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Meta: {meta} o más</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabRestauracionEcosistemas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("politicas");

  // ── Plan
  const [plan, setPlan] = useState<InstrumentoId[]>(PLAN_INICIAL);
  const [zonaSel, setZonaSel] = useState(0);
  const [anio, setAnio] = useState(0);
  const [simulando, setSimulando] = useState(false);
  const [avisoPlan, setAvisoPlan] = useState<string | null>(null);
  const [planCompleto, setPlanCompleto] = useState(false);
  const [metasOk, setMetasOk] = useState(false);
  const [conecto, setConecto] = useState(false);
  const [vioMalUbicado, setVioMalUbicado] = useState(false);

  // ── Sucesión
  const [estrategia, setEstrategia] = useState<Estrategia>("pasiva");
  const [distancia, setDistancia] = useState(100);
  const [uso, setUso] = useState(10);
  const [fuego, setFuego] = useState(false);
  const [anioSuc, setAnioSuc] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [prediccion, setPrediccion] = useState<Atributo | null>(null);
  const [prediccionOk, setPrediccionOk] = useState(false);
  const [acahualNatural, setAcahualNatural] = useState(false);
  const [vioEstancada, setVioEstancada] = useState(false);
  const [rescato, setRescato] = useState(false);

  // ── Casos
  const [casoId, setCasoId] = useState<CasoId>("vaquita");
  const [hito, setHito] = useState(0);
  const [vistos, setVistos] = useState<Set<CasoId>>(() => new Set());
  const [elegidos, setElegidos] = useState<Partial<Record<CasoId, string>>>({});
  const [diagnosticados, setDiagnosticados] = useState<Set<CasoId>>(() => new Set());

  // ── Evaluables
  const [contrarreloj, setContrarreloj] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setContrarreloj(true);
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
  const sfx = useCallback(
    (ok: boolean) => {
      if (!sonido) return;
      if (ok) audioRef.current?.correcto();
      else audioRef.current?.incorrecto();
    },
    [sonido],
  );

  /* ── Relojes de simulación ─────────────────────────────────────────── */
  const indFinal = indicadores(plan, ANIOS_PLAN);
  const metasFinal = cumpleMetas(indFinal);
  const costo = costoPlan(plan);
  // Los relojes avanzan con el tiempo real (no por tics): 5 años por segundo.
  const desdeSuc = useRef(0);
  useEffect(() => {
    if (!simulando) return;
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setAnio(Math.min(ANIOS_PLAN, ((Date.now() - t0) / 1000) * ANIOS_POR_SEGUNDO));
    }, PASO_MS);
    return () => window.clearInterval(id);
  }, [simulando]);
  const terminoSim = simulando && anio >= ANIOS_PLAN;
  useEffect(() => {
    if (!terminoSim) return;
    const id = window.setTimeout(() => {
      setSimulando(false);
      if (plan.every((i) => i !== "ninguno")) setPlanCompleto(true);
      if (metasFinal.cob && metasFinal.bio && metasFinal.com && costo <= PRESUPUESTO) {
        setMetasOk(true);
        sfx(true);
      }
      if (indFinal.conectado) setConecto(true);
      if (ZONAS.some((z, k) => plan[k] !== "ninguno" && (opcionDe(z, plan[k]!).calidad === "cara" || opcionDe(z, plan[k]!).calidad === "mala"))) setVioMalUbicado(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [terminoSim, plan, metasFinal.cob, metasFinal.bio, metasFinal.com, costo, indFinal.conectado, sfx]);

  useEffect(() => {
    if (!corriendo) return;
    const t0 = Date.now();
    const d0 = desdeSuc.current;
    const id = window.setInterval(() => {
      setAnioSuc(Math.min(ANIOS_SUC, d0 + ((Date.now() - t0) / 1000) * ANIOS_POR_SEGUNDO));
    }, PASO_MS);
    return () => window.clearInterval(id);
  }, [corriendo]);
  const llegoAlFinal = corriendo && anioSuc >= ANIOS_SUC;
  useEffect(() => {
    if (!llegoAlFinal) return;
    const id = window.setTimeout(() => setCorriendo(false), 0);
    return () => window.clearTimeout(id);
  }, [llegoAlFinal]);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Plan ──────────────────────────────────────────────────────────── */
  const zona = ZONAS[zonaSel]!;
  const instSel = plan[zonaSel] ?? "ninguno";
  const ind = indicadores(plan, anio);
  const simulado = anio >= ANIOS_PLAN && !simulando;

  const asignar = (id: InstrumentoId) => {
    const nuevo = [...plan];
    nuevo[zonaSel] = id;
    const c = costoPlan(nuevo);
    if (c > PRESUPUESTO) {
      setAvisoPlan(`Con ${INSTRUMENTOS[id].corto} el plan costaría ${c} de ${PRESUPUESTO}: libera presupuesto en otra zona.`);
      sfx(false);
      return;
    }
    setAvisoPlan(null);
    setPlan(nuevo);
    setAnio(0);
    setSimulando(false);
    blip();
  };
  const elegirZona = useCallback((k: number) => {
    setZonaSel(k);
  }, []);
  const simular = () => {
    setAnio(0);
    setSimulando(true);
    blip();
  };
  const replanear = () => {
    setAnio(0);
    setSimulando(false);
  };

  /* ── Sucesión ──────────────────────────────────────────────────────── */
  const condiciones: CondicionesParcela = { estrategia, distancia, uso, fuego };
  const est = estadoParcela(condiciones, anioSuc);
  const etapa = etapaDe(est.biomasa);
  const est40 = estadoParcela(condiciones, 40);

  const bosqueJoven = etapa === "acahual" || etapa === "bosque";
  const logroNatural = estrategia === "pasiva" && distancia <= 300 && bosqueJoven;
  const logroEstancada = estrategia === "pasiva" && distancia >= 1500 && anioSuc >= 40 && est.biomasa < 0.3;
  const logroRescate = (estrategia === "activa" || estrategia === "nucleacion") && distancia >= 1500 && anioSuc >= 40 && bosqueJoven;
  useEffect(() => {
    if (!logroNatural && !logroEstancada && !logroRescate) return;
    const id = window.setTimeout(() => {
      if (logroNatural) setAcahualNatural(true);
      if (logroEstancada) setVioEstancada(true);
      if (logroRescate) setRescato(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [logroNatural, logroEstancada, logroRescate]);

  const tiempos = ATRIBUTOS.map((a) => ({ a, t: aniosHasta(REFERENCIA, a, 0.9) }));
  const predecir = (a: Atributo) => {
    if (prediccion && prediccion === "suelo") return;
    setPrediccion(a);
    const ok = a === "suelo";
    if (ok) setPrediccionOk(true);
    sfx(ok);
  };
  const correr = () => {
    const desde = anioSuc >= ANIOS_SUC ? 0 : anioSuc;
    if (anioSuc >= ANIOS_SUC) setAnioSuc(0);
    desdeSuc.current = desde;
    setCorriendo((c) => !c);
    blip();
  };

  /* ── Casos ─────────────────────────────────────────────────────────── */
  const caso = CASOS.find((c) => c.id === casoId)!;
  const hitoActual = caso.hitos[hito]!;
  const alFinal = vistos.has(casoId) || hito === caso.hitos.length - 1;
  const elegido = elegidos[casoId];
  const diagElegido = caso.diagnosticos.find((d) => d.id === elegido);
  const irHito = (k: number) => {
    const n = Math.min(caso.hitos.length - 1, Math.max(0, k));
    setHito(n);
    if (n === caso.hitos.length - 1) setVistos((s) => new Set(s).add(casoId));
    blip();
  };
  const elegirCaso = (id: CasoId) => {
    setCasoId(id);
    setHito(0);
    blip();
  };
  const diagnosticar = (id: string) => {
    if (diagnosticados.has(casoId)) return;
    setElegidos((e) => ({ ...e, [casoId]: id }));
    const ok = caso.diagnosticos.find((d) => d.id === id)!.correcto;
    if (ok) setDiagnosticados((s) => new Set(s).add(casoId));
    sfx(ok);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setCorriendo(false);
    blip();
  };
  const reiniciar = () => {
    if (modo === "politicas") {
      setPlan(PLAN_INICIAL);
      setAnio(0);
      setSimulando(false);
      setAvisoPlan(null);
    }
    if (modo === "sucesion") {
      setAnioSuc(0);
      setCorriendo(false);
    }
    if (modo === "casos") setHito(0);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Simular 30 años un plan con instrumento en las ocho zonas", done: planCompleto },
    { t: "Cumplir las tres metas de la cuenca sin pasarte del presupuesto", done: metasOk },
    { t: "Unir la sierra y la selva con un corredor biológico", done: conecto },
    { t: "Descubrir un instrumento caro o mal ubicado y entender por qué", done: vioMalUbicado },
    { t: "Llevar a acahual un potrero cercano al bosque solo con regeneración natural", done: acahualNatural },
    { t: "Ver estancarse la regeneración natural lejos del bosque y rescatarla con nucleación o plantación", done: vioEstancada && rescato },
    { t: "Predecir qué se recupera primero en la sucesión", done: prediccionOk },
    { t: "Diagnosticar bien los tres casos de México", done: diagnosticados.size === CASOS.length },
    { t: "Completar el contrarreloj de instrumentos y ganar estrellas", done: contrarreloj },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "politicas") {
    chipVivo = `año ${num(anio)} · bosque ${num(ind.cobertura)} % · biodiversidad ${num(ind.biodiversidad)} · presupuesto ${costo}/${PRESUPUESTO}`;
    pie = simulado
      ? `A los 30 años: cobertura forestal ${num(indFinal.cobertura, 1)} % (meta ${META_COB}), biodiversidad ${num(indFinal.biodiversidad, 1)} (meta ${META_BIO}) y bienestar de las comunidades ${num(indFinal.comunidades)} (meta ${META_COM}). ${indFinal.conectado ? `El corredor une la sierra y la selva: +${BONO_CORREDOR} de biodiversidad por conectividad.` : "La sierra y la selva siguen aisladas."}`
      : simulando
        ? `Pasan los años: los árboles crecen donde se protege o restaura y desaparecen donde avanza el desmonte; las aves siguen a la biodiversidad y las lanchas a la pesca.`
        : `${zona.etq}: ${zona.ficha} Instrumento: ${INSTRUMENTOS[instSel].etq}. Toca las zonas del mapa para planear.`;
  } else if (modo === "sucesion") {
    chipVivo = `año ${num(anioSuc)} · ${ETAPA_DEF[etapa].etq.toLowerCase()} · biomasa ${num(est.biomasa * 100)} %`;
    pie = `${ETAPA_DEF[etapa].explica} ${estrategia === "ganado" ? "Mientras siga el ganado no hay sucesión." : `Llega ${num(est.semillas * 100)} % de la lluvia de semillas de un sitio junto al bosque; la sucesión arranca tras ${est.retraso < 1.5 ? "cerca de un año" : `unos ${num(est.retraso)} años`}.`}`;
  } else {
    chipVivo = `${caso.etq.toLowerCase()} · ${hitoActual.anio} · ${textoValor(caso, hito)}`;
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
  if (modo === "politicas") {
    const pct = Math.min(100, (costo / PRESUPUESTO) * 100);
    control = (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: T.text3, whiteSpace: "nowrap" }}>PRESUPUESTO</span>
          <div style={{ flex: 1, height: 9, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: costo > 90 ? WARN : modoCol, transition: "width .2s" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", ...NUM }}>
            {costo} / {PRESUPUESTO}
          </span>
        </div>
        {sub("1 · Elige una zona (también puedes tocarla en el mapa)")}
        <div className="re-opts">
          {ZONAS.map((z, k) => {
            const i = plan[k] ?? "ninguno";
            return (
              <button key={z.id} className="re-opt re-zona" data-on={k === zonaSel} onClick={() => { setZonaSel(k); blip(); }} style={{ ["--rec" as string]: modoCol, background: k === zonaSel ? `${modoCol}1f` : "transparent" }}>
                {z.etq}
                <i className={`fa-solid ${INSTRUMENTOS[i].icono}`} style={{ marginLeft: 7, color: i === "ninguno" ? "rgba(255,255,255,0.3)" : INSTRUMENTOS[i].color }} />
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, color: "#fff", fontWeight: 900 }}>{zona.etq}</span>
            <span style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>
              {zona.tenencia}
              {zona.ha > 0 ? ` · ${num(zona.ha)} ha` : ""}
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 5 }}>{zona.ficha}</div>
        </div>
        {sub("2 · Asígnale un instrumento")}
        <div style={{ display: "grid", gap: 7 }}>
          {opcionesDe(zona).map((id) => {
            const ins = INSTRUMENTOS[id];
            const on = instSel === id;
            return (
              <button key={id} className="re-opt re-inst" data-on={on} onClick={() => asignar(id)} disabled={simulando} style={{ ["--rec" as string]: ins.color, background: on ? `${ins.color}1f` : "transparent", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                <i className={`fa-solid ${ins.icono}`} style={{ color: ins.color, width: 16, textAlign: "center" }} />
                <span style={{ flex: 1 }}>
                  {ins.etq}
                  <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: T.text3, marginTop: 2 }}>{ins.quien}</span>
                </span>
                <span style={{ fontSize: 12, fontWeight: 900, ...NUM }}>{ins.costo}</span>
              </button>
            );
          })}
        </div>
        {nota(INSTRUMENTOS[instSel].def, T.text2, "fa-book")}
        {avisoPlan && nota(avisoPlan, WARN, "fa-triangle-exclamation")}
        {sub("3 · Simula 30 años")}
        <div className="re-opts">
          <button className="re-toggle re-simular" onClick={simular} disabled={simulando} style={{ ["--rec" as string]: accent, flex: 1 }}>
            <i className={`fa-solid ${simulando ? "fa-spinner fa-spin" : "fa-forward"}`} style={{ marginRight: 9, color: accent }} />
            {simulando ? `Simulando… año ${num(anio)}` : simulado ? "Simular otra vez" : "Simular 30 años"}
          </button>
          {simulado && (
            <button className="re-opt" data-on="false" onClick={replanear} style={{ ["--rec" as string]: modoCol }}>
              <i className="fa-solid fa-pen-ruler" style={{ marginRight: 8 }} />
              Volver al año 0
            </button>
          )}
        </div>
        <div className="re-medidores" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 12 }}>
          <Medidor etq="Cobertura forestal %" valor={ind.cobertura} meta={META_COB} icono="fa-tree" col="#22c55e" />
          <Medidor etq="Biodiversidad" valor={ind.biodiversidad} meta={META_BIO} icono="fa-dove" col="#a3e635" />
          <Medidor etq="Comunidades" valor={ind.comunidades} meta={META_COM} icono="fa-people-roof" col="#fbbf24" />
        </div>
        {simulado && (
          <>
            {sub("Resultado por zona")}
            <div style={{ display: "grid", gap: 7 }}>
              {ZONAS.map((z, k) => {
                const i = plan[k] ?? "ninguno";
                const o = opcionDe(z, i);
                const q = CALIDAD_DEF[o.calidad];
                return (
                  <div key={z.id} className="re-resultado" style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${q.color}44`, background: "rgba(4,10,22,0.4)" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>
                      <i className={`fa-solid ${q.icono}`} style={{ marginRight: 7, color: q.color }} />
                      {z.etq} · {INSTRUMENTOS[i].corto} <span style={{ color: q.color, fontWeight: 800 }}>— {q.etq}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, marginTop: 3 }}>{o.porque}</div>
                  </div>
                );
              })}
            </div>
            {nota(
              metasFinal.cob && metasFinal.bio && metasFinal.com
                ? "Plan exitoso: cumple las tres metas con el presupuesto disponible. Hay más de una forma de lograrlo; compara con otro plan."
                : `Todavía no: ${[!metasFinal.cob && "falta cobertura forestal", !metasFinal.bio && "falta biodiversidad", !metasFinal.com && "las comunidades no están mejor"].filter(Boolean).join(", ")}. Revisa las zonas en rojo y naranja: el mismo presupuesto rinde más donde el instrumento es adicional y aceptado.`,
              metasFinal.cob && metasFinal.bio && metasFinal.com ? OK : WARN,
              metasFinal.cob && metasFinal.bio && metasFinal.com ? "fa-circle-check" : "fa-rotate-left",
            )}
          </>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>La cuenca, sus zonas, los costos y los resultados son un modelo didáctico; los instrumentos, las instituciones y los principios que lo explican son reales.</div>
      </>
    );
  } else if (modo === "sucesion") {
    control = (
      <>
        {sub("1 · Predice antes de empezar")}
        <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, marginBottom: 8 }}>Si un potrero junto a la selva se deja regenerar solo, ¿qué llega primero al 90 % del bosque maduro?</div>
        <div className="re-opts">
          {PREDICCION_OPCIONES.map((o) => {
            const on = prediccion === o.id;
            const col = on ? (o.id === "suelo" ? OK : WARN) : modoCol;
            return (
              <button key={o.id} className="re-opt re-pred" data-on={on} onClick={() => predecir(o.id)} disabled={prediccionOk} style={{ ["--rec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                {o.etq}
              </button>
            );
          })}
        </div>
        {prediccion &&
          nota(
            <>
              {prediccion === "suelo" ? "Bien predicho. " : "No: prueba otra opción. "}
              Junto al bosque, al 90 %: {tiempos.map((x) => `${ATRIBUTO_DEF[x.a].etq.split(" (")[0]!.toLowerCase()} ${x.t === null ? "más de 200" : `≈ ${num(x.t)}`} años`).join(" · ")}. El suelo y la riqueza vuelven pronto; la composición del bosque original tarda más de un siglo.
            </>,
            prediccion === "suelo" ? OK : WARN,
            prediccion === "suelo" ? "fa-circle-check" : "fa-circle-xmark",
          )}
        {sub("2 · Técnica de restauración")}
        <div className="re-opts">
          {ESTRATEGIAS.map((e) => (
            <button key={e.id} className="re-opt re-estr" data-on={e.id === estrategia} onClick={() => { setEstrategia(e.id); blip(); }} style={{ ["--rec" as string]: modoCol, background: e.id === estrategia ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${e.icono}`} style={{ marginRight: 8 }} />
              {e.etq} <span style={{ color: T.text3, marginLeft: 5 }}>{e.costo}</span>
            </button>
          ))}
        </div>
        {nota(ESTRATEGIAS.find((e) => e.id === estrategia)!.explica, T.text2, "fa-book")}
        {sub("3 · Condiciones del sitio")}
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-tree" style={{ color: "#4ade80", width: 16 }} />
          <input type="range" aria-label="Distancia al bosque maduro (m)" className="re-range" min={DIST_MIN} max={DIST_MAX} step={DIST_PASO} value={distancia} onChange={(e) => setDistancia(Number(e.target.value))} style={{ ["--rec" as string]: "#4ade80" }} />
          <span style={{ width: 84, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>{num(distancia)} m</span>
        </label>
        <div style={{ fontSize: 10.5, color: T.text3, margin: "2px 0 8px 26px" }}>Distancia al bosque maduro más cercano</div>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-cow" style={{ color: "#d4a373", width: 16 }} />
          <input type="range" aria-label="Años de uso como potrero (años)" className="re-range" min={0} max={USO_MAX} step={5} value={uso} onChange={(e) => setUso(Number(e.target.value))} style={{ ["--rec" as string]: "#d4a373" }} />
          <span style={{ width: 84, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>{uso} años</span>
        </label>
        <div style={{ fontSize: 10.5, color: T.text3, margin: "2px 0 8px 26px" }}>Años que fue potrero: más uso, suelo más compactado y más pasto invasor</div>
        <button className="re-toggle re-fuego" onClick={() => { setFuego((f) => !f); blip(); }} style={{ ["--rec" as string]: fuego ? "#fb923c" : "rgba(255,255,255,0.2)" }}>
          <i className={`fa-solid ${fuego ? "fa-fire" : "fa-fire-extinguisher"}`} style={{ marginRight: 9, color: fuego ? "#fb923c" : T.text3 }} />
          {fuego ? "Quemas recurrentes: SÍ (toca para evitarlas)" : "Quemas recurrentes: NO (toca para permitirlas)"}
        </button>
        {sub("4 · Deja pasar el tiempo")}
        <div className="re-opts" style={{ alignItems: "center" }}>
          <button className="re-toggle re-correr" onClick={correr} style={{ ["--rec" as string]: accent, width: "auto", flex: "0 0 auto" }}>
            <i className={`fa-solid ${corriendo ? "fa-pause" : "fa-play"}`} style={{ marginRight: 9, color: accent }} />
            {corriendo ? "Pausar" : anioSuc >= ANIOS_SUC ? "Volver a empezar" : "Correr 60 años"}
          </button>
          <input type="range" aria-label="Año de la sucesión (años)" className="re-range" min={0} max={ANIOS_SUC} step={1} value={Math.round(anioSuc)} onChange={(e) => { setCorriendo(false); setAnioSuc(Number(e.target.value)); }} style={{ ["--rec" as string]: accent }} />
          <span style={{ width: 60, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>año {num(anioSuc)}</span>
        </div>
        <div style={{ display: "grid", gap: 7, marginTop: 12 }}>
          {ATRIBUTOS.map((a) => {
            const v = est[a];
            const t90 = aniosHasta(condiciones, a, 0.9);
            return (
              <div key={a}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: T.text2, fontWeight: 800 }}>
                  <span>
                    <i className={`fa-solid ${ATRIBUTO_DEF[a].icono}`} style={{ marginRight: 6, color: ATRIBUTO_DEF[a].color }} />
                    {ATRIBUTO_DEF[a].etq}
                  </span>
                  <span style={{ color: "#fff", ...NUM }}>{num(v * 100)} %</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)", marginTop: 4, overflow: "hidden" }}>
                  <div style={{ width: `${v * 100}%`, height: "100%", background: ATRIBUTO_DEF[a].color, transition: "width .12s linear" }} />
                </div>
                <div style={{ fontSize: 10.5, color: T.text3, marginTop: 2 }}>
                  Con estas condiciones llega al 90 % {t90 === null ? "en más de 200 años (o nunca)" : `en ≈ ${num(t90)} años`} · referencia: {ATRIBUTO_DEF[a].ref}
                </div>
              </div>
            );
          })}
        </div>
        {nota(
          estrategia === "ganado"
            ? "Con ganado y quemas el potrero no cambia: la sucesión empieza cuando se quita la causa del daño."
            : estrategia === "pasiva" && distancia >= 1500
              ? `A ${num(distancia)} m del bosque solo llega ${num(est.semillas * 100)} % de las semillas: a los 40 años la biomasa apenas es ${num(est40.biomasa * 100)} %. Aquí la regeneración natural se estanca; prueba nucleación o plantación.`
              : estrategia === "pasiva"
                ? `Cerca del bosque, aves y murciélagos traen semillas: sin gastar en plantar, a los 40 años la biomasa llega a ${num(est40.biomasa * 100)} %.`
                : estrategia === "activa"
                  ? `Plantar acelera el arranque aunque el bosque esté lejos (biomasa a los 40 años: ${num(est40.biomasa * 100)} %), pero una plantación de pocas especies no alcanza la riqueza ni la composición de la regeneración natural cerca del bosque. Es la opción más cara.`
                  : `Las islas de árboles atraen dispersores y siembran el resto de la parcela: biomasa a los 40 años ${num(est40.biomasa * 100)} %, con menos costo que plantar todo.`,
          estrategia === "ganado" || (estrategia === "pasiva" && distancia >= 1500) ? WARN : OK,
          "fa-lightbulb",
        )}
        {fuego && nota("Las quemas recurrentes matan plántulas y rebrotes y empobrecen el suelo: la parcela no pasa de un matorral pobre.", WARN, "fa-fire")}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Los tiempos de referencia (selva neotropical que se regenera junto a bosque maduro) son publicados; el efecto de la distancia, el uso previo, el fuego y la técnica es ilustrativo, basado en tendencias reportadas.</div>
      </>
    );
  } else {
    const serie = caso.hitos.map((h, k) => ({ h, k })).filter((x) => x.h.valor !== null);
    const maxV = Math.max(...serie.map((x) => x.h.valor!));
    control = (
      <>
        <div className="re-opts">
          {CASOS.map((c) => (
            <button key={c.id} className="re-opt re-caso" data-on={c.id === casoId} onClick={() => elegirCaso(c.id)} style={{ ["--rec" as string]: modoCol, background: c.id === casoId ? `${modoCol}1f` : "transparent" }}>
              {c.etq}
              {diagnosticados.has(c.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 8, lineHeight: 1.45 }}>
          <i className="fa-solid fa-location-dot" style={{ marginRight: 6 }} />
          {caso.lugar} · {caso.instrumentos}
        </div>
        {sub(`Hito ${hito + 1} de ${caso.hitos.length}`)}
        <div className="re-linea">
          {caso.hitos.map((h, k) => (
            <button key={k} className="re-punto" data-estado={k < hito ? "hecho" : k === hito ? "actual" : "pendiente"} onClick={() => irHito(k)} aria-label={h.anio} title={h.anio} style={{ ["--rec" as string]: h.tipo === "politica" ? modoCol : h.tipo === "amenaza" ? "#f87171" : "#fbbf24" }} />
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${hitoActual.tipo === "politica" ? modoCol : hitoActual.tipo === "amenaza" ? "#f87171" : "#fbbf24"}55`, background: "rgba(4,10,22,0.45)" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: hitoActual.tipo === "politica" ? modoCol : hitoActual.tipo === "amenaza" ? "#f87171" : "#fbbf24", marginBottom: 4 }}>
            {hitoActual.anio} · {hitoActual.tipo === "politica" ? "política o instrumento" : hitoActual.tipo === "amenaza" ? "amenaza" : "dato medido"}
          </div>
          <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{hitoActual.texto}</div>
        </div>
        <div className="re-opts" style={{ marginTop: 10 }}>
          <button className="re-opt" data-on="false" onClick={() => irHito(hito - 1)} disabled={hito === 0} style={{ ["--rec" as string]: modoCol }}>
            <i className="fa-solid fa-backward-step" style={{ marginRight: 8 }} />
            Hito anterior
          </button>
          <button className="re-opt re-sig" data-on="true" onClick={() => irHito(hito + 1)} disabled={hito === caso.hitos.length - 1} style={{ ["--rec" as string]: modoCol, background: `${modoCol}1f` }}>
            Siguiente hito
            <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
          </button>
        </div>
        {sub(`${caso.variable} (${caso.unidad})`)}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 104, padding: "0 2px" }}>
          {serie.map(({ h, k }) => {
            const alto = Math.max(3, (h.valor! / maxV) * 78);
            const visto = k <= hito;
            return (
              <div key={k} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 9.5, fontWeight: 900, color: visto ? "#fff" : T.text3, ...NUM }}>{visto ? (h.valorTxt ?? num(h.valor!, caso.id === "vaquita" ? 0 : 2)) : "?"}</span>
                <div style={{ width: "100%", height: visto ? alto : 3, borderRadius: 4, background: k === hito ? modoCol : visto ? `${modoCol}88` : "rgba(255,255,255,0.1)", transition: "height .3s" }} />
                <span style={{ fontSize: 9, color: T.text3, whiteSpace: "nowrap" }}>{h.anio}</span>
              </div>
            );
          })}
        </div>
        {sub("Diagnóstico")}
        <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 8 }}>{caso.pregunta}</div>
        {!alFinal ? (
          nota("Recorre la línea de tiempo hasta el último hito para diagnosticar con todos los datos.", T.text3, "fa-lock")
        ) : (
          <div style={{ display: "grid", gap: 7 }}>
            {caso.diagnosticos.map((d) => {
              const on = elegido === d.id;
              const col = on ? (d.correcto ? OK : WARN) : modoCol;
              return (
                <button key={d.id} className="re-opt re-diag" data-on={on} onClick={() => diagnosticar(d.id)} disabled={diagnosticados.has(casoId)} style={{ ["--rec" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left", lineHeight: 1.4 }}>
                  {d.texto}
                </button>
              );
            })}
          </div>
        )}
        {diagElegido && nota(diagElegido.porque, diagElegido.correcto ? OK : WARN, diagElegido.correcto ? "fa-circle-check" : "fa-circle-xmark")}
        {diagElegido?.correcto && nota(caso.leccion, "#fff", "fa-lightbulb")}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Fuente: {caso.fuente}</div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes rePulse { 0%,100%{ box-shadow:0 0 0 0 var(--red); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .re-live-dot { animation: rePulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .re-live-dot { animation:none; } }
        .re-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .re-grid { grid-template-columns: 1fr; } }
        .re-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .re-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .re-icobtn:hover { background:rgba(255,255,255,0.12); }
        .re-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .re-tab { cursor:pointer; border:1px solid var(--rec); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .re-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .re-tab:hover { background:rgba(255,255,255,0.06); }
        .re-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .re-opt { cursor:pointer; border:1px solid var(--rec); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .re-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .re-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .re-opt:disabled { cursor:default; }
        .re-opt:disabled[data-on="false"] { opacity:0.55; }
        .re-toggle { width:100%; cursor:pointer; border:1px solid var(--rec); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .re-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .re-toggle:disabled { cursor:default; opacity:0.75; }
        .re-range { flex:1; min-width:120px; accent-color: var(--rec); }
        .re-linea { display:flex; align-items:center; gap:0; }
        .re-punto { cursor:pointer; flex:1; height:12px; border:none; background:transparent; position:relative; padding:0; }
        .re-punto::before { content:""; position:absolute; left:0; right:0; top:5px; height:2px; background:rgba(255,255,255,0.14); }
        .re-punto::after { content:""; position:absolute; left:50%; top:0; width:12px; height:12px; margin-left:-6px; border-radius:50%; border:2px solid var(--rec); background:#06121e; transition:all .2s; }
        .re-punto[data-estado="hecho"]::after { background:var(--rec); }
        .re-punto[data-estado="actual"]::after { background:var(--rec); box-shadow:0 0 0 4px rgba(255,255,255,0.12); transform:scale(1.25); }
        .re-opt:focus-visible, .re-tab:focus-visible, .re-toggle:focus-visible, .re-icobtn:focus-visible, .re-range:focus-visible, .re-punto:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .re-bottom { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px){ .re-medidores { grid-template-columns: 1fr !important; } }
        .re-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .re-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .re-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .re-drawer[data-open="true"] { transform:translateX(0); }
        .re-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .re-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .re-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .re-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .re-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .re-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="re-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="re-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--rec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="re-grid">
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
              <RestauracionScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                plan={plan}
                anio={anio}
                zonaSel={zonaSel}
                onZona={elegirZona}
                condiciones={condiciones}
                anioSuc={anioSuc}
                casoId={casoId}
                hito={hito}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="re-live-dot" style={{ ["--red" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="re-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="re-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="re-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="re-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-scale-balanced" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Qué instrumento, dónde y para qué?</div>
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
            <div style={{ fontSize: 11, color: "#7dd3fc", lineHeight: 1.45, marginBottom: 12, fontStyle: "italic" }}>{NOTA_A1}</div>
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
              <span className="re-objetivos" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="re-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-landmark" style={{ marginRight: 8, color: accent }} />
              Para pensar (autoevaluación A7)
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.55, fontWeight: 700 }}>{REFLEXION_A7}</div>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.45, marginTop: 6, fontStyle: "italic" }}>Pista del laboratorio: compara la vaquita marina con Cabo Pulmo, y el costo social de decretar un área sin acuerdo con quienes viven en ella.</div>
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
                    <i className="fa-solid fa-leaf" style={{ marginRight: 6, color: accent }} />
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
          La lectura A1 con sus preguntas, los hechos del quiz A4, el glosario A5, el quiz A2, el texto A6 y la reflexión A7 son <strong>verbatim</strong> del material de la plataforma; la nota de
          actualización de las ANP es de la CONANP (2025). La cuenca del modo «Plan de conservación» es un <strong>modelo didáctico</strong>: sus zonas, costos y resultados son ilustrativos, aunque
          los instrumentos, las instituciones y los principios (adicionalidad, participación, conectividad, distancia a la fuente de semillas) son reales. En «Restaurar una parcela», los tiempos de
          referencia son de Poorter et al. (2016, Nature; 2021, Science) y Rozendaal et al. (2019, Science Advances), y la comparación con la plantación sigue a Crouzeilles et al. (2017); el efecto
          de la distancia, el uso previo, el fuego y la técnica es ilustrativo. Los datos de los casos son publicados (NOAA Fisheries, CIRVA y cruceros 2024–2025; Aburto-Oropeza et al. 2011; WWF
          México y CONANP); las lanchas y los tocones de sus escenas son ilustrativos. Fuente del material: {FUENTE}
        </span>
      </div>

      <ContrarrelojCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Conoces las políticas de conservación de México." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="re-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="re-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="re-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="re-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="re-drawer-body">
          <FichaTeorica data={RESTAURACION_ECOSISTEMAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
