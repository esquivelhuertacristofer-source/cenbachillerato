"use client";

/**
 * Laboratorio 3D — "Ágora: ciudadanía y democracia".
 * Práctica anclada a CS-I-P02-A4 (quiz «Ciudadanía — Quiz»); progresión 2 de la
 * UAC CS-I («Analiza el devenir del concepto de ciudadanía, para la
 * conformación de un Estado democrático e incluyente»). El marco teórico es la
 * lectura A1, el modo 3 es el debate estructurado A2, los hechos salen del
 * verdadero/falso A5 y el glosario del A6.
 *
 * Tres modos:
 *  (1) ¿Quién entra al ágora? — predecir, época por época (Atenas → paridad),
 *      qué grupos tenían derechos políticos y verlos entrar o quedarse fuera.
 *  (2) Asamblea vecinal — elegir condiciones de la convocatoria y procedimiento
 *      de decisión, y ver quién participa, quién gana y quién queda excluido.
 *  (3) Debate estructurado — clasificar hechos, valores y falacias, y armar una
 *      intervención con las reglas de A2 desde la postura que el alumno elija.
 *
 * Regla: nunca se califica la postura política ni la decisión de la asamblea;
 * se evalúa la estructura, la inclusión y la distinción hecho/valor/falacia.
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
import { AGORA_CIUDADANIA_FICHA } from "./agora-ciudadania-ficha";
import type { VistaAgora, Lanzamiento } from "./AgoraCiudadaniaScene";
import {
  type Modo,
  type Condicion,
  type Procedimiento,
  type ResultadoAsamblea,
  type Ganador,
  type TipoAfirmacion,
  type Falacia,
  type Intervencion,
  type Hueco,
  type Postura,
  type Revision,
  MODOS,
  MODOS_DEF,
  EPOCAS,
  porcentajeEntra,
  ART_34_VIGENTE,
  rondaCiudadania,
  estrellasPorErrores,
  mulberry32,
  CONDICIONES,
  PROCEDIMIENTOS,
  CASOS,
  OPCIONES,
  COLOR_OPCION,
  resolverAsamblea,
  DEBATE_A2,
  ARGUMENTOS,
  REPLICA_FALAZ,
  TIPOS,
  FALACIAS,
  AFIRMACIONES,
  PROPUESTAS,
  HUECOS_DEBATE,
  INTERVENCION_VACIA,
  revisarIntervencion,
  pct,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  NOTA_RECUADRO,
  PREGUNTAS,
  REFLEXION,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A6,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A4,
  HUECOS_A1,
} from "./agora-ciudadania-data";

const AgoraScene = dynamic(() => import("./AgoraCiudadaniaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-landmark-dome fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Construyendo el ágora en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-agora-ciudadania-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaCiudadania(mulberry32(7));

/* ── Tarjeta de estrellas: ¿tenía ciudadanía? ─────────────────────────── */
function CiudadaniaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const q = ronda[pos] ?? ronda[0]!;
  const epoca = EPOCAS[q.epoca]!;
  const grupo = epoca.grupos[q.grupo]!;

  const responder = (entra: boolean) => {
    if (resuelto !== null) return;
    const ok = entra === grupo.entra;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${grupo.entra ? "Sí podía participar" : "No podía participar"}: ${grupo.porque}`);
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
    setRonda(rondaCiudadania(Math.random));
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
          ¿Tenía ciudadanía?
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
            Caso {pos + 1} de {ronda.length} · ¿podía votar o participar en las decisiones políticas?
          </div>
          <div style={{ fontSize: 13, color: accent, fontWeight: 900, marginBottom: 2 }}>{epoca.titulo}</div>
          <div style={{ fontSize: 15.5, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>{grupo.etq}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="ag-opt ag-est" data-v="si" data-on="true" onClick={() => responder(true)} style={{ ["--agc" as string]: OK }}>
              <i className="fa-solid fa-door-open" style={{ marginRight: 8 }} />
              Sí, entraba al ágora
            </button>
            <button className="ag-opt ag-est" data-v="no" data-on="true" onClick={() => responder(false)} style={{ ["--agc" as string]: WARN }}>
              <i className="fa-solid fa-ban" style={{ marginRight: 8 }} />
              No, quedaba fuera
            </button>
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

function etiquetaGanador(casoIdx: number, g: Ganador): string {
  const caso = CASOS[casoIdx]!;
  if (g === "nada") return `Sin acuerdo: ${caso.statusQuo.toLowerCase()}`;
  if (g === "mixta") return `Propuesta mixta: ${caso.mixta.toLowerCase()}`;
  return `${g} · ${caso.opciones[g]}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabAgoraCiudadania({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("agora");

  // ── Ágora
  const [epocaIdx, setEpocaIdx] = useState(0);
  const [predicciones, setPredicciones] = useState<Record<string, Record<string, boolean>>>({});
  const [reveladas, setReveladas] = useState<Set<string>>(() => new Set());
  const [sinErrores, setSinErrores] = useState<Set<string>>(() => new Set());
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});

  // ── Asamblea
  const [casoIdx, setCasoIdx] = useState(0);
  const [condiciones, setCondiciones] = useState<Condicion[]>([]);
  const [proc, setProc] = useState<Procedimiento>("mayoria");
  const [resultado, setResultado] = useState<ResultadoAsamblea | null>(null);
  const [celebrada, setCelebrada] = useState(0);
  const [historial, setHistorial] = useState<Record<string, Partial<Record<Procedimiento, { ganador: Ganador; participacion: number; ignoradas: number }>>>>({});
  const [vioExcluidos, setVioExcluidos] = useState(false);
  const [vioInclusion, setVioInclusion] = useState(false);

  // ── Debate
  const [paso, setPaso] = useState<"clasificar" | "intervencion">("clasificar");
  const [clasIdx, setClasIdx] = useState(0);
  const [clasErrores, setClasErrores] = useState(0);
  const [clasAviso, setClasAviso] = useState<{ txt: string; ok: boolean } | null>(null);
  const [lanz, setLanz] = useState<Lanzamiento | null>(null);
  const [pendienteFalacia, setPendienteFalacia] = useState<string | null>(null);
  const [falaciasOk, setFalaciasOk] = useState<Set<string>>(() => new Set());
  const [intervencion, setIntervencion] = useState<Intervencion>(INTERVENCION_VACIA);
  const [pronunciada, setPronunciada] = useState(0);
  const [revision, setRevision] = useState<{ revisiones: Revision[]; reglas: boolean[]; criterios: boolean[] } | null>(null);
  const [intervencionOk, setIntervencionOk] = useState(false);
  const [posturasOk, setPosturasOk] = useState<Set<Postura>>(() => new Set());

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
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
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Ágora ─────────────────────────────────────────────────────────── */
  const epoca = EPOCAS[epocaIdx]!;
  const pred = predicciones[epoca.id] ?? {};
  const revelada = reveladas.has(epoca.id);
  const predijoTodo = epoca.grupos.every((g) => pred[g.id] !== undefined);
  const erroresEpoca = epoca.grupos.filter((g) => pred[g.id] !== undefined && pred[g.id] !== g.entra).length;
  const respuesta = respuestas[epoca.id];

  const predecir = (grupoId: string, entra: boolean) => {
    if (revelada) return;
    setPredicciones((p) => ({ ...p, [epoca.id]: { ...(p[epoca.id] ?? {}), [grupoId]: entra } }));
    blip();
  };
  const abrirAgora = () => {
    if (revelada || !predijoTodo) return;
    setReveladas((s) => new Set(s).add(epoca.id));
    const ok = erroresEpoca === 0;
    if (ok) setSinErrores((s) => new Set(s).add(epoca.id));
    sfx(ok);
  };
  const elegirEpoca = (i: number) => {
    setEpocaIdx(i);
    blip();
  };
  const repetirEpoca = () => {
    setReveladas((s) => {
      const n = new Set(s);
      n.delete(epoca.id);
      return n;
    });
    setPredicciones((p) => ({ ...p, [epoca.id]: {} }));
    setRespuestas((r) => {
      const n = { ...r };
      delete n[epoca.id];
      return n;
    });
  };
  const responderPregunta = (k: number) => {
    if (respuesta !== undefined || !epoca.pregunta) return;
    setRespuestas((r) => ({ ...r, [epoca.id]: k }));
    sfx(k === epoca.pregunta.correcta);
  };
  const preguntasOk = EPOCAS.filter((e) => e.pregunta).every((e) => respuestas[e.id] === e.pregunta!.correcta);

  /* ── Asamblea ──────────────────────────────────────────────────────── */
  const caso = CASOS[casoIdx]!;
  const limpiarAsamblea = () => setResultado(null);
  const elegirCaso = (i: number) => {
    setCasoIdx(i);
    limpiarAsamblea();
    blip();
  };
  const toggleCondicion = (c: Condicion) => {
    setCondiciones((xs) => (xs.includes(c) ? xs.filter((x) => x !== c) : [...xs, c]));
    limpiarAsamblea();
    blip();
  };
  const elegirProc = (p: Procedimiento) => {
    setProc(p);
    limpiarAsamblea();
    blip();
  };
  const celebrar = () => {
    const r = resolverAsamblea(caso, condiciones, proc);
    setResultado(r);
    setCelebrada((k) => k + 1);
    setHistorial((h) => ({ ...h, [caso.id]: { ...(h[caso.id] ?? {}), [proc]: { ganador: r.ganador, participacion: r.participacion, ignoradas: r.minoriasIgnoradas.length } } }));
    if (r.excluidos.some((id) => !caso.grupos.find((g) => g.id === id)!.soloVoz)) setVioExcluidos(true);
    if (r.excluidos.length === 0) setVioInclusion(true);
    blip();
  };
  const hist = historial[caso.id] ?? {};
  const comparoCaso = (id: string) => {
    const h = Object.values(historial[id] ?? {});
    return h.length >= 3 && new Set(h.map((x) => x!.ganador)).size >= 2;
  };
  const comparo = CASOS.some((c) => comparoCaso(c.id));

  /* ── Debate ────────────────────────────────────────────────────────── */
  const afirmacion = AFIRMACIONES[clasIdx] ?? null;
  const clasificoTodo = clasIdx >= AFIRMACIONES.length;
  const nFalacias = AFIRMACIONES.filter((a) => a.tipo === "falacia").length;

  const clasificar = (tipo: TipoAfirmacion) => {
    if (!afirmacion || pendienteFalacia) return;
    const ok = tipo === afirmacion.tipo;
    setLanz((l) => ({ id: afirmacion.id, tipo, ok, nonce: (l?.nonce ?? 0) + 1 }));
    sfx(ok);
    const def2 = TIPOS.find((t) => t.id === afirmacion.tipo)!;
    if (!ok) {
      setClasErrores((e) => e + 1);
      setClasAviso({ txt: `No es ${TIPOS.find((t) => t.id === tipo)!.etq.toLowerCase()}: es ${def2.etq.toLowerCase()}. ${afirmacion.porque}`, ok: false });
      return;
    }
    if (afirmacion.tipo === "falacia") {
      setPendienteFalacia(afirmacion.id);
      setClasAviso({ txt: `Bien: es una falacia. ${afirmacion.porque} Ahora nómbrala.`, ok: true });
      return;
    }
    setClasAviso({ txt: `Bien: es ${def2.etq.toLowerCase()}. ${afirmacion.porque}${afirmacion.fuente ? ` (${afirmacion.fuente})` : ""}`, ok: true });
    setClasIdx((i) => i + 1);
  };
  const nombrarFalacia = (f: Falacia) => {
    const af = AFIRMACIONES.find((a) => a.id === pendienteFalacia);
    if (!af) return;
    const ok = f === af.falacia;
    sfx(ok);
    const d = FALACIAS.find((x) => x.id === af.falacia)!;
    if (!ok) {
      setClasErrores((e) => e + 1);
      setClasAviso({ txt: `No: es «${d.etq}». ${d.explica}`, ok: false });
      return;
    }
    setFalaciasOk((s) => new Set(s).add(af.id));
    setClasAviso({ txt: `Exacto: ${d.etq}. ${d.explica}`, ok: true });
    setPendienteFalacia(null);
    setClasIdx((i) => i + 1);
  };
  const reiniciarClasificacion = () => {
    setClasIdx(0);
    setClasErrores(0);
    setClasAviso(null);
    setPendienteFalacia(null);
    setLanz(null);
  };

  const ponerFicha = (h: Hueco, id: string) => {
    setIntervencion((iv) => ({ ...iv, [h]: iv[h] === id ? null : id }));
    setRevision(null);
    blip();
  };
  const elegirPostura = (p: Postura) => {
    setIntervencion((iv) => ({ ...iv, postura: p }));
    setRevision(null);
    blip();
  };
  const completa = !!intervencion.postura && HUECOS_DEBATE.every((h) => !!intervencion[h.id]);
  const pronunciar = () => {
    if (!completa) return;
    const r = revisarIntervencion(intervencion);
    setRevision(r);
    setPronunciada((k) => k + 1);
    const todas = r.reglas.every(Boolean);
    sfx(todas);
    if (todas) {
      setIntervencionOk(true);
      setPosturasOk((s) => new Set(s).add(intervencion.postura!));
    }
  };
  const nuevaIntervencion = () => {
    setIntervencion(INTERVENCION_VACIA);
    setRevision(null);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "agora") repetirEpoca();
    if (modo === "asamblea") limpiarAsamblea();
    if (modo === "debate") {
      if (paso === "clasificar") reiniciarClasificacion();
      else nuevaIntervencion();
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Abrir el ágora en las ocho épocas, de Atenas a la paridad", done: reveladas.size === EPOCAS.length },
    { t: "Predecir sin errores quién entra en al menos tres épocas", done: sinErrores.size >= 3 },
    { t: "Descubrir qué cambió en 1917 y en 2014–2019, aunque la multitud no cambie", done: preguntasOk },
    { t: "Celebrar una asamblea en la que un grupo con derecho a votar no pudo asistir", done: vioExcluidos },
    { t: "Lograr que todos los grupos de vecinos participen en la asamblea", done: vioInclusion },
    { t: "Comparar tres procedimientos en un mismo caso y ver cambiar el resultado", done: comparo },
    { t: `Clasificar las ${AFIRMACIONES.length} afirmaciones y nombrar las ${nFalacias} falacias`, done: clasificoTodo && falaciasOk.size === nFalacias },
    { t: "Pronunciar una intervención que cumpla las cuatro reglas del debate (A2)", done: intervencionOk },
    { t: "Predecir quién tenía ciudadanía y ganar estrellas", done: identifico },
    { t: "Aprobar el quiz evaluable (A4)", done: quizAprobado },
    { t: "Completar el texto de la lectura (A1)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaAgora = modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "agora") {
    chipVivo = revelada ? `${epoca.etq.toLowerCase()} · ${pct(porcentajeEntra(epoca))} con derechos políticos` : `${epoca.etq.toLowerCase()} · predice quién entra (${Object.keys(pred).length}/${epoca.grupos.length})`;
    pie = revelada ? `${epoca.como} ${epoca.cambio}` : epoca.norma;
  } else if (modo === "asamblea") {
    chipVivo = resultado ? `${pct(resultado.participacion)} participa · ${resultado.ganador === "nada" ? "sin acuerdo" : resultado.ganador === "mixta" ? "propuesta mixta" : `gana ${resultado.ganador}`}` : `${caso.etq.toLowerCase()} · ${PROCEDIMIENTOS.find((p) => p.id === proc)!.etq.toLowerCase()}`;
    pie = resultado ? resultado.explica : `${caso.problema} Ajusta la convocatoria, elige el procedimiento y celebra la asamblea.`;
  } else if (paso === "clasificar") {
    chipVivo = clasificoTodo ? `clasificación completa · ${clasErrores} ${clasErrores === 1 ? "error" : "errores"}` : `afirmación ${clasIdx + 1} de ${AFIRMACIONES.length} · hecho, valor o falacia`;
    pie = clasAviso?.txt ?? "Lee la tarjeta que flota sobre el podio y échala en la urna que le corresponde: hecho, valor o falacia.";
  } else {
    const llenos = HUECOS_DEBATE.filter((h) => !!intervencion[h.id]).length;
    chipVivo = revision ? `intervención · ${revision.reglas.filter(Boolean).length}/4 reglas cumplidas` : `armando la intervención · ${llenos}/${HUECOS_DEBATE.length} fichas`;
    pie = revision ? (revision.reglas.every(Boolean) ? "Intervención bien estructurada: argumento, dato, reconocimiento, réplica y propuesta. Tu postura no se califica: se evalúa cómo la sostienes." : "Revisa las fichas marcadas: la estructura aún no cumple todas las reglas del debate.") : `«${DEBATE_A2.tema}» Elige tu postura y coloca una ficha en cada hueco del pizarrón.`;
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
  const caja = (children: ReactNode, borde = T.line) => <div style={{ padding: "11px 13px", borderRadius: 12, background: "rgba(4,10,22,0.42)", border: `1px solid ${borde}` }}>{children}</div>;

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "agora") {
    control = (
      <>
        <div className="ag-linea">
          {EPOCAS.map((e, i) => (
            <button key={e.id} className="ag-epoca" data-on={i === epocaIdx} data-hecha={reveladas.has(e.id)} onClick={() => elegirEpoca(i)} style={{ ["--agc" as string]: modoCol }}>
              <span className="ag-punto" />
              <span style={{ fontSize: 11, fontWeight: 900 }}>{e.etq}</span>
              {reveladas.has(e.id) && <span style={{ fontSize: 10, color: sinErrores.has(e.id) ? OK : T.text3, ...NUM }}>{pct(porcentajeEntra(e))}</span>}
            </button>
          ))}
        </div>
        {sub(`${epoca.titulo} · la norma`)}
        {caja(<div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>{epoca.norma}</div>, `${modoCol}44`)}
        {sub(revelada ? "Resultado de tu predicción" : "1 · Predice: ¿quién podía votar o participar?")}
        <div style={{ display: "grid", gap: 7 }}>
          {epoca.grupos.map((g) => {
            const v = pred[g.id];
            const bien = v === g.entra;
            return (
              <div key={g.id} className="ag-grupo" style={{ borderColor: revelada ? (bien ? `${OK}66` : `${WARN}88`) : T.line }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ width: 11, height: 11, borderRadius: 4, background: g.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff", flex: 1, minWidth: 140 }}>
                    {g.etq} <span style={{ color: T.text3, fontWeight: 700, ...NUM }}>· {g.n}</span>
                  </span>
                  {[true, false].map((entra) => {
                    const on = v === entra;
                    const col = revelada ? (entra === g.entra ? OK : on ? WARN : "rgba(255,255,255,0.14)") : entra ? "#22c55e" : "#ef4444";
                    return (
                      <button key={String(entra)} className="ag-opt ag-pred" data-g={g.id} data-v={entra ? "si" : "no"} data-on={on || (revelada && entra === g.entra)} disabled={revelada} onClick={() => predecir(g.id, entra)} style={{ ["--agc" as string]: col, background: on ? `${col}24` : "transparent", padding: "6px 10px" }}>
                        <i className={`fa-solid ${entra ? "fa-door-open" : "fa-ban"}`} style={{ marginRight: 6 }} />
                        {entra ? "Entra" : "Fuera"}
                      </button>
                    );
                  })}
                </div>
                {revelada && (
                  <div style={{ marginTop: 6, fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                    <i className={`fa-solid ${bien ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginRight: 6, color: bien ? OK : WARN }} />
                    {g.porque}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!revelada ? (
          <button className="ag-toggle ag-abrir" onClick={abrirAgora} disabled={!predijoTodo} style={{ marginTop: 12, ["--agc" as string]: modoCol }}>
            <i className="fa-solid fa-door-open" style={{ marginRight: 9, color: modoCol }} />
            {predijoTodo ? "Abrir el ágora" : `Predice los ${epoca.grupos.length} grupos para abrir el ágora`}
          </button>
        ) : (
          <>
            {nota(
              <>
                {erroresEpoca === 0 ? "Predicción perfecta. " : `${erroresEpoca} ${erroresEpoca === 1 ? "grupo mal predicho" : "grupos mal predichos"}. `}
                <strong>{epoca.como}</strong> {epoca.cambio}
              </>,
              erroresEpoca === 0 ? OK : WARN,
              erroresEpoca === 0 ? "fa-circle-check" : "fa-rotate-left",
            )}
            <div style={{ marginTop: 10, fontSize: 11.5, color: T.text3 }}>
              <i className="fa-solid fa-chair" style={{ marginRight: 6, color: "#f472b6" }} />
              Tribuna: {epoca.notaTribuna}
            </div>
            {epoca.pregunta && (
              <>
                {sub("2 · ¿Qué cambió?")}
                <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, marginBottom: 8 }}>{epoca.pregunta.texto}</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {epoca.pregunta.opciones.map((o, k) => {
                    const on = respuesta === k;
                    const col = respuesta === undefined ? modoCol : k === epoca.pregunta!.correcta ? OK : on ? WARN : "rgba(255,255,255,0.14)";
                    return (
                      <button key={k} className="ag-opt ag-preg" data-k={k} data-on={on || (respuesta !== undefined && k === epoca.pregunta!.correcta)} disabled={respuesta !== undefined} onClick={() => responderPregunta(k)} style={{ ["--agc" as string]: col, textAlign: "left", background: on ? `${col}1f` : "transparent" }}>
                        {o}
                      </button>
                    );
                  })}
                </div>
                {respuesta !== undefined && nota(epoca.pregunta.explica, respuesta === epoca.pregunta.correcta ? OK : WARN, "fa-lightbulb")}
              </>
            )}
            <div className="ag-opts" style={{ marginTop: 12 }}>
              {epocaIdx < EPOCAS.length - 1 && (
                <button className="ag-opt ag-sig" data-on="true" onClick={() => elegirEpoca(epocaIdx + 1)} style={{ ["--agc" as string]: modoCol, background: `${modoCol}1f` }}>
                  Siguiente época: {EPOCAS[epocaIdx + 1]!.etq}
                  <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
                </button>
              )}
              <button className="ag-opt" data-on="false" onClick={repetirEpoca} style={{ ["--agc" as string]: modoCol }}>
                <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                Predecir de nuevo
              </button>
            </div>
          </>
        )}
        {reveladas.size > 1 && (
          <>
            {sub("Población con derechos políticos (multitud ilustrativa de 40)")}
            <div className="ag-barras">
              {EPOCAS.map((e) => {
                const on = reveladas.has(e.id);
                const p = porcentajeEntra(e);
                return (
                  <div key={e.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 9.5, color: on ? "#fff" : T.text3, fontWeight: 800, ...NUM }}>{on ? pct(p) : "?"}</span>
                    <div style={{ width: "100%", height: 64, display: "flex", alignItems: "flex-end" }}>
                      <div style={{ width: "100%", height: on ? `${p * 100}%` : "6%", borderRadius: "4px 4px 0 0", background: on ? (e.id === epoca.id ? modoCol : `${modoCol}88`) : "rgba(255,255,255,0.08)", transition: "height .5s" }} />
                    </div>
                    <span style={{ fontSize: 9, color: T.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{e.etq}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {epoca.id === "paridad" && revelada && <div style={{ marginTop: 12, fontSize: 11.5, color: T.text2, lineHeight: 1.5, fontStyle: "italic" }}>{ART_34_VIGENTE}</div>}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Normas, fechas y artículos son históricos (las citas marcadas como paráfrasis no son textuales). La composición de la multitud y la tribuna es ilustrativa y aproximada, no censal.</div>
      </>
    );
  } else if (modo === "asamblea") {
    const res = resultado;
    const maxVotos = res ? Math.max(1, ...OPCIONES.map((o) => res.votos[o])) : 1;
    control = (
      <>
        <div className="ag-opts">
          {CASOS.map((c, i) => (
            <button key={c.id} className="ag-opt ag-caso" data-on={i === casoIdx} onClick={() => elegirCaso(i)} style={{ ["--agc" as string]: modoCol, background: i === casoIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8 }} />
              {c.etq}
              {comparoCaso(c.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("El problema")}
        {caja(
          <>
            <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.5, marginBottom: 8 }}>{caso.problema}</div>
            <div style={{ display: "grid", gap: 4 }}>
              {OPCIONES.map((o) => (
                <div key={o} style={{ fontSize: 12, color: T.text2 }}>
                  <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 5, marginRight: 8, textAlign: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: COLOR_OPCION[o] }}>{o}</span>
                  {caso.opciones[o]}
                </div>
              ))}
            </div>
          </>,
          `${modoCol}44`,
        )}
        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: "pointer", fontSize: 12, fontWeight: 800, color: T.text2 }}>Los vecinos: qué necesita cada grupo</summary>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {caso.grupos.map((g) => {
              const cond = CONDICIONES.find((c) => c.id === g.barrera);
              return (
                <div key={g.id} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, paddingLeft: 10, borderLeft: `3px solid ${g.color}` }}>
                  <strong style={{ color: "#fff" }}>
                    {g.etq} ({g.n}
                    {g.soloVoz ? ", menores: voz sin voto" : ""})
                  </strong>{" "}
                  · afectación {g.afectacion} · prefiere {g.prefs.join(" > ")}. {g.necesidad}
                  {cond && (
                    <span style={{ color: T.text3 }}>
                      {" "}
                      Necesita: {cond.etq.toLowerCase()}.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </details>
        {sub("1 · La convocatoria (quién puede asistir)")}
        <div style={{ display: "grid", gap: 6 }}>
          {CONDICIONES.map((c) => {
            const on = condiciones.includes(c.id);
            return (
              <button key={c.id} className="ag-toggle ag-cond" data-c={c.id} data-on={on} onClick={() => toggleCondicion(c.id)} style={{ ["--agc" as string]: on ? modoCol : "rgba(255,255,255,0.14)", padding: "8px 12px" }}>
                <i className={`fa-solid ${on ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 9, color: on ? modoCol : T.text3 }} />
                <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8, color: T.text3 }} />
                <span style={{ fontWeight: 800 }}>{on ? c.etq : c.sin}</span>
              </button>
            );
          })}
        </div>
        {sub("2 · El procedimiento")}
        <div className="ag-opts">
          {PROCEDIMIENTOS.map((p) => (
            <button key={p.id} className="ag-opt ag-proc" data-p={p.id} data-on={p.id === proc} onClick={() => elegirProc(p.id)} style={{ ["--agc" as string]: modoCol, background: p.id === proc ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${p.icono}`} style={{ marginRight: 8 }} />
              {p.etq}
              {hist[p.id] && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: T.text3 }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>{PROCEDIMIENTOS.find((p) => p.id === proc)!.etq}:</strong> {PROCEDIMIENTOS.find((p) => p.id === proc)!.regla} ({PROCEDIMIENTOS.find((p) => p.id === proc)!.sesiones})
        </div>
        <button className="ag-toggle ag-celebrar" onClick={celebrar} style={{ marginTop: 12, ["--agc" as string]: modoCol }}>
          <i className="fa-solid fa-gavel" style={{ marginRight: 9, color: modoCol }} />
          {res ? "Celebrar de nuevo" : "Celebrar la asamblea"}
        </button>
        {res && (
          <>
            {sub("3 · Resultado")}
            {caja(
              <>
                <div style={{ fontSize: 13.5, fontWeight: 900, color: COLOR_OPCION[res.ganador], marginBottom: 8 }}>
                  <i className="fa-solid fa-flag-checkered" style={{ marginRight: 8 }} />
                  {etiquetaGanador(casoIdx, res.ganador)}
                </div>
                <div style={{ display: "grid", gap: 5 }}>
                  {OPCIONES.map((o) => (
                    <div key={o} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, ...NUM }}>
                      <span style={{ width: 14, fontWeight: 900, color: COLOR_OPCION[o] }}>{o}</span>
                      <div style={{ flex: 1, height: 9, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ width: `${(res.votos[o] / maxVotos) * 100}%`, height: "100%", background: res.descartadas.includes(o) && proc === "consulta" ? "#475569" : COLOR_OPCION[o] }} />
                      </div>
                      <span style={{ width: 70, textAlign: "right", color: T.text2 }}>
                        {res.votos[o]} {res.votos[o] === 1 ? "voto" : "votos"}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 9 }}>{res.explica}</div>
              </>,
              `${COLOR_OPCION[res.ganador]}55`,
            )}
            <div className="ag-metricas">
              {[
                { etq: "Participación adulta", v: `${pct(res.participacion)}`, sub: `${res.adultosPresentes} de ${res.adultos}`, ok: res.participacion >= 0.8 },
                { etq: "Grupos con voz", v: `${res.voces.length} de ${caso.grupos.length}`, sub: res.excluidos.length ? "hay grupos fuera" : "nadie quedó fuera", ok: res.excluidos.length === 0 },
                { etq: "Minorías muy afectadas", v: res.minoriasIgnoradas.length ? `${res.minoriasIgnoradas.length} ignorada${res.minoriasIgnoradas.length > 1 ? "s" : ""}` : "respetadas", sub: "¿quedó alguna con su peor opción?", ok: res.minoriasIgnoradas.length === 0 },
                { etq: "Apoyo en la colonia", v: pct(res.apoyo), sub: "1.ª o 2.ª opción de los adultos", ok: res.apoyo >= 0.5 },
              ].map((m) => (
                <div key={m.etq} className="ag-metrica" style={{ borderColor: m.ok ? `${OK}44` : `${WARN}55` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase" }}>{m.etq}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: m.ok ? OK : WARN, marginTop: 3, ...NUM }}>{m.v}</div>
                  <div style={{ fontSize: 10.5, color: T.text3 }}>{m.sub}</div>
                </div>
              ))}
            </div>
            {res.excluidos.some((id) => !caso.grupos.find((g) => g.id === id)!.soloVoz) &&
              nota(
                <>
                  <strong>Tenían derecho a votar, pero no pudieron asistir:</strong>{" "}
                  {res.excluidos
                    .filter((id) => !caso.grupos.find((g) => g.id === id)!.soloVoz)
                    .map((id) => caso.grupos.find((g) => g.id === id)!.etq.toLowerCase())
                    .join(", ")}
                  . Su ciudadanía formal está intacta; la sustantiva, no.
                </>,
                WARN,
                "fa-user-slash",
              )}
            {res.excluidos.some((id) => caso.grupos.find((g) => g.id === id)!.soloVoz) && nota("Las y los jóvenes no fueron invitados: sin voto, pero con voz, también podrían haber participado (A5).", T.text3, "fa-user-graduate")}
            {res.minoriasIgnoradas.length > 0 && nota(<>Quedaron con su peor opción, siendo de los más afectados: {res.minoriasIgnoradas.map((id) => caso.grupos.find((g) => g.id === id)!.etq.toLowerCase()).join(", ")}.</>, WARN, "fa-scale-unbalanced")}
          </>
        )}
        {Object.keys(hist).length > 0 && (
          <>
            {sub("Comparación en este caso")}
            <div style={{ display: "grid", gap: 4 }}>
              {PROCEDIMIENTOS.filter((p) => hist[p.id]).map((p) => {
                const h = hist[p.id]!;
                return (
                  <div key={p.id} style={{ display: "flex", gap: 8, fontSize: 11.5, color: T.text2, alignItems: "center", flexWrap: "wrap", ...NUM }}>
                    <span style={{ width: 150, fontWeight: 800, color: "#fff" }}>{p.etq}</span>
                    <span style={{ flex: 1, minWidth: 120, color: COLOR_OPCION[h.ganador] }}>{h.ganador === "nada" ? "sin acuerdo" : h.ganador === "mixta" ? "propuesta mixta" : `${h.ganador} · ${caso.opciones[h.ganador]}`}</span>
                    <span>{pct(h.participacion)} participa</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>No hay un procedimiento «correcto»: cada uno equilibra rapidez, participación y protección de minorías de forma distinta. La colonia, sus vecinos y sus preferencias son ilustrativos.</div>
      </>
    );
  } else {
    control = (
      <>
        <div className="ag-opts">
          {(["clasificar", "intervencion"] as const).map((ps, i) => (
            <button key={ps} className="ag-opt ag-paso" data-p={ps} data-on={paso === ps} onClick={() => { setPaso(ps); blip(); }} style={{ ["--agc" as string]: modoCol, background: paso === ps ? `${modoCol}1f` : "transparent" }}>
              {i + 1} · {ps === "clasificar" ? "Hecho, valor o falacia" : "Tu intervención"}
              {(ps === "clasificar" ? clasificoTodo : intervencionOk) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("Debate A2")}
        {caja(
          <>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 900, lineHeight: 1.45 }}>«{DEBATE_A2.tema}»</div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>Tiempo de argumentación sugerido: {DEBATE_A2.tiempoMinutos} minutos · modalidad escrita</div>
          </>,
          `${modoCol}44`,
        )}
        {paso === "clasificar" ? (
          <>
            {sub(`Afirmación ${Math.min(clasIdx + 1, AFIRMACIONES.length)} de ${AFIRMACIONES.length}`)}
            {afirmacion ? (
              <>
                {caja(<div style={{ fontSize: 14, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>«{afirmacion.texto}»</div>)}
                {!pendienteFalacia ? (
                  <div className="ag-opts" style={{ marginTop: 10 }}>
                    {TIPOS.map((t) => (
                      <button key={t.id} className="ag-opt ag-tipo" data-t={t.id} data-on="true" onClick={() => clasificar(t.id)} style={{ ["--agc" as string]: t.color }}>
                        <i className={`fa-solid ${t.icono}`} style={{ marginRight: 8, color: t.color }} />
                        {t.etq}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    {sub("¿Qué falacia es?")}
                    <div style={{ display: "grid", gap: 6 }}>
                      {FALACIAS.map((f) => (
                        <button key={f.id} className="ag-opt ag-fal" data-f={f.id} data-on="true" onClick={() => nombrarFalacia(f.id)} style={{ ["--agc" as string]: "#f87171", textAlign: "left" }}>
                          {f.etq}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div style={{ marginTop: 10, display: "grid", gap: 3 }}>
                  {TIPOS.map((t) => (
                    <div key={t.id} style={{ fontSize: 11, color: T.text3 }}>
                      <strong style={{ color: t.color }}>{t.etq}:</strong> {t.explica}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              nota(
                <>
                  Clasificaste las {AFIRMACIONES.length} afirmaciones con {clasErrores} {clasErrores === 1 ? "error" : "errores"}. Los hechos se comprueban, los valores se argumentan y las falacias se desarman. Ahora úsalos en tu intervención.
                </>,
                OK,
                "fa-circle-check",
              )
            )}
            {clasAviso && nota(clasAviso.txt, clasAviso.ok ? OK : WARN, clasAviso.ok ? "fa-circle-check" : "fa-circle-xmark")}
            <div className="ag-opts" style={{ marginTop: 10 }}>
              {clasificoTodo && (
                <button className="ag-opt" data-on="true" onClick={() => { setPaso("intervencion"); blip(); }} style={{ ["--agc" as string]: modoCol, background: `${modoCol}1f` }}>
                  Armar mi intervención
                  <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
                </button>
              )}
              <button className="ag-opt" data-on="false" onClick={reiniciarClasificacion} style={{ ["--agc" as string]: modoCol }}>
                <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                Empezar de nuevo
              </button>
            </div>
          </>
        ) : (
          <>
            {sub("Reglas del debate (A2)")}
            <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
              {DEBATE_A2.reglas.map((r, i) => (
                <li key={i} style={{ fontSize: 11.5, color: revision ? (revision.reglas[i] ? OK : WARN) : T.text2, lineHeight: 1.4 }}>
                  {r}
                  {revision && <i className={`fa-solid ${revision.reglas[i] ? "fa-check" : "fa-xmark"}`} style={{ marginLeft: 6 }} />}
                </li>
              ))}
            </ol>
            {sub("1 · Tu postura (tú eliges; no se califica)")}
            <div style={{ display: "grid", gap: 6 }}>
              {(["si", "no"] as const).map((p, i) => {
                const on = intervencion.postura === p;
                const col = p === "si" ? "#2dd4bf" : "#fb923c";
                return (
                  <button key={p} className="ag-opt ag-postura" data-p={p} data-on={on} onClick={() => elegirPostura(p)} style={{ ["--agc" as string]: col, textAlign: "left", background: on ? `${col}1f` : "transparent" }}>
                    {DEBATE_A2.posturas[i]}
                    {posturasOk.has(p) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
                  </button>
                );
              })}
            </div>
            {intervencion.postura &&
              HUECOS_DEBATE.map((h, hi) => {
                let fichas: { id: string; texto: string }[] = [];
                if (h.id === "argumento" || h.id === "reconoce") fichas = ARGUMENTOS.map((a) => ({ id: a.id, texto: a.texto }));
                if (h.id === "dato") fichas = AFIRMACIONES.filter((a) => ["h1", "h2", "h3", "h4", "v2", "f2"].includes(a.id)).map((a) => ({ id: a.id, texto: a.texto }));
                if (h.id === "replica") fichas = [...ARGUMENTOS.filter((a) => a.postura !== intervencion.postura).map((a) => ({ id: a.id, texto: a.replica })), { id: "falaz", texto: REPLICA_FALAZ }];
                if (h.id === "propuesta") fichas = PROPUESTAS.map((p) => ({ id: p.id, texto: p.texto }));
                const rev = revision?.revisiones.find((r) => r.hueco === h.id);
                return (
                  <div key={h.id}>
                    {sub(`${hi + 2} · ${h.etq}`)}
                    <div style={{ fontSize: 11, color: T.text3, marginBottom: 6 }}>{h.ayuda}</div>
                    <div style={{ display: "grid", gap: 5 }}>
                      {fichas.map((f) => {
                        const on = intervencion[h.id] === f.id;
                        const col = on && rev ? (rev.ok ? OK : WARN) : modoCol;
                        return (
                          <button key={f.id} className="ag-ficha" data-h={h.id} data-id={f.id} data-on={on} onClick={() => ponerFicha(h.id, f.id)} style={{ ["--agc" as string]: col, background: on ? `${col}1c` : "transparent" }}>
                            <i className={`fa-solid ${on ? "fa-circle-dot" : "fa-circle"}`} style={{ marginRight: 8, color: on ? col : T.text3, fontSize: 10 }} />
                            {f.texto}
                          </button>
                        );
                      })}
                    </div>
                    {rev && nota(rev.nota, rev.ok ? OK : WARN, rev.ok ? "fa-circle-check" : "fa-circle-exclamation")}
                  </div>
                );
              })}
            <button className="ag-toggle ag-pronunciar" onClick={pronunciar} disabled={!completa} style={{ marginTop: 14, ["--agc" as string]: modoCol }}>
              <i className="fa-solid fa-microphone-lines" style={{ marginRight: 9, color: modoCol }} />
              {completa ? "Tomar la palabra" : "Completa tu postura y las cinco fichas para tomar la palabra"}
            </button>
            {revision && (
              <>
                {sub("Criterios de evaluación (A2)")}
                <div style={{ display: "grid", gap: 5 }}>
                  {DEBATE_A2.criterios.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: revision.criterios[i] ? OK : WARN, lineHeight: 1.4 }}>
                      <i className={`fa-solid ${revision.criterios[i] ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginRight: 7 }} />
                      {c}
                    </div>
                  ))}
                </div>
                {revision.reglas.every(Boolean) &&
                  nota(posturasOk.size < 2 ? "Intervención sólida. Reto extra: arma ahora la de la postura contraria; entender el otro lado fortalece cualquier argumento." : "Sostuviste con buena estructura las dos posturas: eso es deliberar, no solo opinar.", OK, "fa-lightbulb")}
                <div className="ag-opts" style={{ marginTop: 10 }}>
                  <button className="ag-opt" data-on="false" onClick={nuevaIntervencion} style={{ ["--agc" as string]: modoCol }}>
                    <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
                    Nueva intervención
                  </button>
                </div>
              </>
            )}
          </>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Tema, posturas, reglas, argumentos guía y criterios son verbatim de A2. Las réplicas, las propuestas y las afirmaciones a clasificar son del laboratorio (salvo la cifra del CONEVAL, del recuadro de A1).</div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes agPulse { 0%,100%{ box-shadow:0 0 0 0 var(--agd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ag-live-dot { animation: agPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .ag-live-dot { animation:none; } }
        .ag-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ag-grid { grid-template-columns: 1fr; } }
        .ag-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ag-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ag-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ag-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ag-tab { cursor:pointer; border:1px solid var(--agc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .ag-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ag-tab:hover { background:rgba(255,255,255,0.06); }
        .ag-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .ag-opt { cursor:pointer; border:1px solid var(--agc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.4; }
        .ag-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .ag-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ag-opt:disabled { cursor:default; }
        .ag-opt:disabled[data-on="false"] { opacity:0.5; }
        .ag-ficha { cursor:pointer; width:100%; text-align:left; border:1px solid var(--agc); border-radius:10px; padding:8px 11px; font-size:11.5px; font-weight:600; color:#fff; background:transparent; transition:all .15s; line-height:1.4; }
        .ag-ficha[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.72); }
        .ag-ficha:hover { background:rgba(255,255,255,0.06); }
        .ag-toggle { width:100%; cursor:pointer; border:1px solid var(--agc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ag-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ag-toggle:disabled { cursor:default; opacity:0.6; }
        .ag-grupo { padding:9px 11px; border-radius:11px; border:1px solid; background:rgba(4,10,22,0.35); }
        .ag-linea { display:grid; grid-template-columns: repeat(8, minmax(0,1fr)); gap:4px; }
        .ag-epoca { cursor:pointer; position:relative; display:flex; flex-direction:column; align-items:center; gap:3px; padding:18px 2px 6px; border:none; border-radius:9px; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ag-epoca:hover { background:rgba(255,255,255,0.05); }
        .ag-epoca[data-on="true"] { background:rgba(255,255,255,0.07); color:#fff; }
        .ag-epoca::before { content:""; position:absolute; left:0; right:0; top:10px; height:2px; background:rgba(255,255,255,0.14); }
        .ag-punto { position:absolute; top:4px; left:50%; width:14px; height:14px; margin-left:-7px; border-radius:50%; border:2px solid var(--agc); background:#06121e; transition:all .2s; }
        .ag-epoca[data-hecha="true"] .ag-punto { background:var(--agc); }
        .ag-epoca[data-on="true"] .ag-punto { box-shadow:0 0 0 4px rgba(255,255,255,0.14); transform:scale(1.2); }
        .ag-barras { display:flex; gap:5px; align-items:flex-end; padding:8px 8px 6px; border-radius:11px; background:rgba(4,10,22,0.4); border:1px solid ${T.line}; }
        .ag-metricas { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:7px; margin-top:10px; }
        .ag-metrica { padding:9px 11px; border-radius:11px; border:1px solid; background:rgba(4,10,22,0.4); }
        .ag-opt:focus-visible, .ag-tab:focus-visible, .ag-toggle:focus-visible, .ag-icobtn:focus-visible, .ag-epoca:focus-visible, .ag-ficha:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .ag-bottom { grid-template-columns: 1fr !important; } }
        .ag-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ag-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ag-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .ag-drawer[data-open="true"] { transform:translateX(0); }
        .ag-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ag-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ag-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ag-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ag-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ag-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ag-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ag-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--agc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="ag-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 60vh, 680px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <AgoraScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                epocaIdx={epocaIdx}
                revelada={revelada}
                prediccion={pred}
                casoId={caso.id}
                condiciones={condiciones}
                celebrada={celebrada}
                resultado={resultado}
                paso={paso}
                afirmacionId={pendienteFalacia ?? afirmacion?.id ?? null}
                lanzamiento={lanz}
                intervencion={intervencion}
                pronunciada={pronunciada}
                revisionOk={revision ? revision.reglas : null}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="ag-live-dot" style={{ ["--agd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ag-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ag-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ag-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="ag-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-landmark-dome" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Quién es «el pueblo»?</div>
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
              <span className="ag-objetivos" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ag-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-column" style={{ marginRight: 8, color: accent }} />
              Recuadro (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.45, marginTop: 6, fontStyle: "italic" }}>{NOTA_RECUADRO}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (verdadero o falso, A5)
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
              Glosario (A6)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-landmark" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A6}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
          <div style={{ ...card, padding: "18px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: 8, color: accent }} />
              Para escribir después
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {REFLEXION.map((r) => (
                <div key={r.ancla} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: accent }}>{r.ancla}.</strong> {r.texto}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas y su recuadro, el tema, las posturas, las reglas, los argumentos guía y los criterios del debate A2, las preguntas de A3, A7 y A8, el quiz A4, los hechos A5 y el
          glosario A6 son <strong>verbatim</strong> del material de la plataforma; el texto con huecos usa frases verbatim de A1. Las normas, artículos y fechas del ágora son <strong>históricos</strong>: ley de
          Pericles (451 a. C.), Constitución de Cádiz (1812, arts. 18, 22 y 25, parafraseados), Constitución de 1857 (arts. 2 y 34), Constitución de 1917, reforma municipal de 1947, reforma al art. 34 del 17 de
          octubre de 1953 y primer voto federal de las mujeres el 3 de julio de 1955, reforma al art. 34 del 22 de diciembre de 1969, reforma al COFIPE del 30 de junio de 2005, reformas de paridad del 10 de
          febrero de 2014 y del 6 de junio de 2019, y Cámara de Diputados 2021–2024 con 250 mujeres y 250 hombres. Son <strong>ilustrativos</strong>: la composición de la multitud de 40 personas y de la tribuna
          (aproximadas, no censales), la colonia, sus vecinos y los tres casos de asamblea, y las réplicas, propuestas y afirmaciones del debate. Fuente: {FUENTE}
        </span>
      </div>

      <CiudadaniaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Entiendes el devenir de la ciudadanía." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (lectura A1)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A1} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="ag-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ag-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ag-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ag-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ag-drawer-body">
          <FichaTeorica data={AGORA_CIUDADANIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
