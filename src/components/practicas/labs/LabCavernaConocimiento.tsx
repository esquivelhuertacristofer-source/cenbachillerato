"use client";

/**
 * Laboratorio 3D — "La caverna y el conocimiento: sombras, sentidos y certeza".
 * Práctica anclada a PFH-I-P06-A2 (quiz «Conocimiento y Verdad») y
 * PFH-I-P06-A6 (completa el texto); progresión 6 de Pensamiento Filosófico y
 * Humanidades I. Marco teórico: lectura A1; hechos del quiz A4; glosario A5;
 * reflexión A3, autoevaluación A7 y pregunta del video A8.
 *
 * Tres modos:
 *  (1) La caverna — proyectar sombras desde el fuego y descubrir que objetos
 *      distintos dan la misma sombra; luego el ascenso del prisionero liberado
 *      y las cuatro formas de conocimiento (Platón, República VII).
 *  (2) Los sentidos engañan — la habitación de Ames: predecir, medir, rodear
 *      y explicar el engaño de la percepción.
 *  (3) Escalera de la certeza — elegir veredicto y razones, subir la creencia
 *      por grados de justificación y verificar: conocimiento, acierto por
 *      suerte o el reloj parado.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabShell, Bloque, Dato, BotonHerramienta, Deslizador } from "./_shell";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { CAVERNA_CONOCIMIENTO_FICHA } from "./caverna-conocimiento-ficha";
import type { VistaCaverna } from "./CavernaConocimientoScene";
import {
  type Modo,
  type Pose,
  type Solido,
  type Silueta,
  type Forma,
  type Prediccion,
  type Veredicto,
  type CasoId,
  type FuenteClasif,
  MODOS,
  MODOS_DEF,
  CUEVA,
  SOLIDOS,
  SILUETAS,
  OBJ_Z_MIN,
  OBJ_Z_MAX,
  OBJ_Z_INICIAL,
  FUEGO_Y_MIN,
  FUEGO_Y_MAX,
  FUEGO_X_MAX,
  UMBRAL_MISMA,
  sombraObjeto,
  coincidencia,
  aumento,
  altoPoli,
  FORMAS,
  ETAPAS,
  REGRESO,
  AMES,
  medirPersona,
  PREDICCIONES,
  EXPLICACIONES_AMES,
  FUENTES_CORRIGEN,
  FUENTE_DEF,
  VEREDICTOS,
  CASOS,
  NIVELES,
  justificacion,
  resultado as calcularResultado,
  RESULTADO_DEF,
  PREGUNTA_RELOJ,
  OPCIONES_RELOJ,
  FUENTES_CLASIF,
  AFIRMACIONES_FUENTE,
  rondaFuentes,
  tirarMoneda,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  REFLEXION_A3,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  AUTOEVALUACION_A7,
  REFLEXION_FINAL_A7,
  PREGUNTA_A8,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
  num,
} from "./caverna-conocimiento-data";

const CavernaScene = dynamic(() => import("./CavernaConocimientoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-fire fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Encendiendo el fuego de la caverna…</span>
    </div>
  ),
});

const RETO_KEY = "cen-caverna-conocimiento-reto";
const WARN = "#FF8A3C";
const NO_COL = "#f87171";
const RONDA_INICIAL = rondaFuentes(mulberry32(17));
const POSE_INICIAL: Pose = { solido: "cubo", giro: 30, inclina: 0, objZ: OBJ_Z_INICIAL, fuegoX: 0, fuegoY: CUEVA.objetoY };
const SIN_HALLAZGOS: Record<Silueta, Solido[]> = { cuadrado: [], circulo: [], triangulo: [] };

function IconoSilueta({ s, col, size = 22 }: { s: Silueta; col: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block" }}>
      {s === "cuadrado" && <rect x="4" y="4" width="16" height="16" fill={col} />}
      {s === "circulo" && <circle cx="12" cy="12" r="9" fill={col} />}
      {s === "triangulo" && <polygon points="3,21 21,21 12,3" fill={col} />}
    </svg>
  );
}

/** Las cuatro formas de conocimiento apiladas: la del prisionero se enciende al subir. */
function LineaDividida({ activa, hechas, etapa }: { activa: Forma; hechas: Set<number>; etapa: number }) {
  const orden: Forma[] = ["noesis", "dianoia", "pistis", "eikasia"];
  const etapaDe = (fm: Forma) => ETAPAS.findIndex((e) => e.forma === fm);
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {orden.map((id, k) => {
        const fd = FORMAS.find((x) => x.id === id)!;
        const inteligible = fd.region === "inteligible";
        const aqui = id === activa;
        const col = inteligible ? "#fde68a" : "#94a3b8";
        return (
          <div key={id}>
            {(k === 0 || k === 2) && (
              <div style={{ fontSize: 14, fontWeight: 900, color: col, margin: k === 0 ? "0 0 4px" : "8px 0 4px" }}>{inteligible ? "Conocimiento de lo inteligible" : "Opinión (dóxa): lo visible"}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", borderRadius: 10, border: `1px solid ${aqui ? col : "rgba(255,255,255,0.12)"}`, background: aqui ? `${col}22` : "rgba(4,10,22,0.4)", color: aqui ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 800 }}>
              <span>{fd.etq}</span>
              <span style={{ color: aqui ? col : hechas.has(etapaDe(id)) ? OK : "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                {aqui ? <><i className="fa-solid fa-person-hiking" style={{ marginRight: 6 }} />aquí · etapa {etapa + 1}</> : hechas.has(etapaDe(id)) ? <i className="fa-solid fa-circle-check" /> : ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Tarjeta de estrellas: ¿de dónde viene lo que sabes? ──────────────── */
function FuenteCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = AFIRMACIONES_FUENTE[ronda[pos] ?? 0]!;

  const responder = (f: FuenteClasif) => {
    if (resuelto !== null) return;
    const ok = f === actual.fuente;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es ${FUENTE_DEF[f].etq.toLowerCase()}. Pista: ${FUENTE_DEF[actual.fuente].que}`);
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
    setRonda(rondaFuentes(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };
  const anterior = pos > 0 ? AFIRMACIONES_FUENTE[ronda[pos - 1] ?? 0] : null;

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿De dónde viene lo que sabes?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>Afirmación {pos + 1} de {ronda.length} · ¿de qué fuente proviene?</div>
          <div className="cav-afirmacion" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            «{actual.texto}»
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FUENTES_CLASIF.map((f) => (
              <button key={f} className="cav-opt cav-fuente" data-on="true" data-fuente={f} onClick={() => responder(f)} style={{ ["--cavc" as string]: FUENTE_DEF[f].color }}>
                <i className={`fa-solid ${FUENTE_DEF[f].icono}`} style={{ marginRight: 8 }} />
                {FUENTE_DEF[f].etq}
              </button>
            ))}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 14, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
          {!aviso && anterior && (
            <div style={{ marginTop: 10, fontSize: 14, color: OK, lineHeight: 1.5 }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />
              Anterior: {FUENTE_DEF[anterior.fuente].etq}. {anterior.porque}
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 14, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda
          </button>
        </div>
      )}
      <div style={{ marginTop: 12, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
        Percepción: {FUENTE_DEF.percepcion.que} Razón: {FUENTE_DEF.razon.que} Testimonio: {FUENTE_DEF.testimonio.que} Autoridad: {FUENTE_DEF.autoridad.que}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabCavernaConocimiento({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("caverna");
  const [sub, setSub] = useState<"sombras" | "ascenso">("sombras");

  // ── Sombras
  const [pose, setPose] = useState<Pose>(POSE_INICIAL);
  const [silueta, setSilueta] = useState<Silueta>("cuadrado");
  const [ojo, setOjo] = useState(false);
  const [hallazgos, setHallazgos] = useState<Record<Silueta, Solido[]>>(SIN_HALLAZGOS);
  const [duplico, setDuplico] = useState(false);
  const [movioPose, setMovioPose] = useState(false);

  // ── Ascenso
  const [etapa, setEtapa] = useState(0);
  const [adapta, setAdapta] = useState(0);
  const [formaElegida, setFormaElegida] = useState<Forma | null>(null);
  const [etapasOk, setEtapasOk] = useState<Set<number>>(() => new Set());

  // ── Ames
  const [vistaAmes, setVistaAmes] = useState(0);
  const [betoX, setBetoX] = useState(AMES.xBetoMin);
  const [prediccion, setPrediccion] = useState<Prediccion | null>(null);
  const [regla, setRegla] = useState(false);
  const [rodeo, setRodeo] = useState(false);
  const [paseo, setPaseo] = useState(false);
  const [explicacion, setExplicacion] = useState<string | null>(null);
  const [fuentesSel, setFuentesSel] = useState<string[]>([]);
  const [fuentesComprobadas, setFuentesComprobadas] = useState(false);

  // ── Escalera
  const [casoIdx, setCasoIdx] = useState(0);
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [verificado, setVerificado] = useState(false);
  const [moneda, setMoneda] = useState<"aguila" | "sol" | null>(null);
  const [respReloj, setRespReloj] = useState<string | null>(null);
  const [logroConocimiento, setLogroConocimiento] = useState(false);
  const [casosVerificados, setCasosVerificados] = useState<Set<CasoId>>(() => new Set());

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
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
    const sfxA = audioRef.current;
    if (sonido) {
      sfxA.mute();
      setSonido(false);
    } else {
      await sfxA.enable();
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

  /* ── Sombras ───────────────────────────────────────────────────────── */
  const sombra = useMemo(() => sombraObjeto(pose), [pose]);
  const coinc = useMemo(() => coincidencia(sombra, silueta), [sombra, silueta]);
  const coincide = coinc >= UMBRAL_MISMA;
  const altoSombra = altoPoli(sombra);
  const aum = aumento(pose.objZ);
  const aumRel = aum / aumento(OBJ_Z_INICIAL);
  const sil = SILUETAS.find((s) => s.id === silueta)!;
  const solidoDef = SOLIDOS.find((s) => s.id === pose.solido)!;

  const registrar = (nueva: Pose, s: Silueta) => {
    if (coincidencia(sombraObjeto(nueva), s) >= UMBRAL_MISMA && !hallazgos[s].includes(nueva.solido)) {
      sfx(true);
      setHallazgos((h) => (h[s].includes(nueva.solido) ? h : { ...h, [s]: [...h[s], nueva.solido] }));
    }
    if (aumento(nueva.objZ) / aumento(OBJ_Z_INICIAL) >= 2) setDuplico(true);
  };
  const cambiarPose = (parcial: Partial<Pose>) => {
    const nueva = { ...pose, ...parcial };
    setPose(nueva);
    setMovioPose(true);
    registrar(nueva, silueta);
  };
  const elegirSilueta = (s: Silueta) => {
    setSilueta(s);
    registrar(pose, s);
    blip();
  };
  const dosObjetos = SILUETAS.some((s) => hallazgos[s.id].length >= 2);
  const tresSombras = SILUETAS.every((s) => hallazgos[s.id].length >= 2);

  /* ── Ascenso ───────────────────────────────────────────────────────── */
  const et = ETAPAS[etapa]!;
  const deslumbra = et.brillo * Math.pow(1 - adapta / 100, 1.4);
  const puedeVer = deslumbra < 0.3;
  const clasificar = (f: Forma) => {
    if (!puedeVer || etapasOk.has(etapa)) return;
    setFormaElegida(f);
    const ok = f === et.forma;
    sfx(ok);
    if (ok) setEtapasOk((s) => new Set(s).add(etapa));
  };
  const irEtapa = (k: number) => {
    setEtapa(k);
    setAdapta(0);
    setFormaElegida(null);
    blip();
  };

  /* ── Ames ──────────────────────────────────────────────────────────── */
  const ana = medirPersona(AMES.xAna);
  const beto = medirPersona(betoX);
  const enMirilla = vistaAmes <= 5;
  const cambiarVistaAmes = (v: number) => {
    setVistaAmes(v);
    if (v >= 45) setRodeo(true);
  };
  const moverBeto = (x: number) => {
    setBetoX(x);
    if (vistaAmes <= 5 && x >= AMES.xBetoMax - 0.05) setPaseo(true);
  };
  const explicOk = EXPLICACIONES_AMES.find((e) => e.id === explicacion)?.ok === true;
  const fuentesCorrectas = FUENTES_CORRIGEN.every((f) => fuentesSel.includes(f.id) === f.ok);

  /* ── Escalera ──────────────────────────────────────────────────────── */
  const caso = CASOS[casoIdx]!;
  const just = justificacion(caso, veredicto, elegidas);
  const res = verificado && veredicto ? calcularResultado(caso, veredicto, just.nivel, moneda) : null;
  const relojOk = OPCIONES_RELOJ.find((o) => o.id === respReloj)?.ok === true;

  const elegirVeredicto = (v: Veredicto) => {
    if (verificado) return;
    setVeredicto(v);
    blip();
  };
  const alternar = (id: string) => {
    if (verificado) return;
    setElegidas((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
    blip();
  };
  const verificar = () => {
    if (!veredicto || verificado) return;
    const m = caso.id === "volado" ? tirarMoneda(Math.random) : null;
    setMoneda(m);
    setVerificado(true);
    const r = calcularResultado(caso, veredicto, just.nivel, m);
    if (r === "conocimiento") setLogroConocimiento(true);
    setCasosVerificados((s) => new Set(s).add(caso.id));
    sfx(r === "conocimiento" || r === "gettier");
  };
  const reintentarCaso = () => {
    setVerificado(false);
    setMoneda(null);
    setRespReloj(null);
    blip();
  };
  const elegirCaso = (i: number) => {
    setCasoIdx(i);
    setVeredicto(null);
    setElegidas([]);
    setVerificado(false);
    setMoneda(null);
    setRespReloj(null);
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "caverna" && sub === "sombras") setPose(POSE_INICIAL);
    if (modo === "caverna" && sub === "ascenso") irEtapa(0);
    if (modo === "ames") {
      setVistaAmes(0);
      setBetoX(AMES.xBetoMin);
      setRegla(false);
    }
    if (modo === "escalera") elegirCaso(casoIdx);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { txt: string; done: boolean }[] = [
    { txt: "Gira, inclina o acerca la figura al fuego y mira cómo cambia su sombra en la pared", done: movioPose },
    { txt: "Encontrar dos objetos distintos que proyecten la misma sombra", done: dosObjetos },
    { txt: "Descubrir dos objetos para cada una de las tres sombras", done: tresSombras },
    { txt: "Hacer una sombra dos veces más grande acercando el objeto al fuego", done: duplico },
    { txt: "Acompañar al prisionero liberado hasta el Sol e identificar las cuatro formas de conocimiento", done: etapasOk.size === ETAPAS.length },
    { txt: "Predecir desde la mirilla y medir a Ana y a Beto con la regla", done: prediccion !== null && regla },
    { txt: "Rodear la habitación de Ames y explicar por qué engaña a la percepción", done: rodeo && explicOk && fuentesComprobadas && fuentesCorrectas },
    { txt: "Llevar una creencia hasta el conocimiento (verdadera y justificada)", done: logroConocimiento },
    { txt: "Analizar el reloj parado: ¿conocimiento o suerte?", done: relojOk },
    { txt: "Clasificar afirmaciones por su fuente y ganar estrellas", done: identifico },
    { txt: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaCaverna = modo === "caverna" ? sub : modo;
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "caverna" && sub === "sombras") {
    chipVivo = `${solidoDef.etq.toLowerCase()} · coincide ${num(coinc * 100)} % con ${sil.etq.toLowerCase()}`;
    pie = ojo
      ? `Así la ven los prisioneros: solo una mancha oscura de ${num(altoSombra, 2)} m. Desde aquí no hay manera de saber si la produce un ${solidoDef.etq.toLowerCase()} u otro objeto.`
      : `La figura mide 0.60 m, pero su sombra ${num(altoSombra, 2)} m: está a ${num(CUEVA.fuegoZ - pose.objZ, 1)} m del fuego y la pared a ${num(CUEVA.fuegoZ - CUEVA.muroZ, 1)} m, así que se amplía ${num(aum, 2)} veces. ${coincide ? `Esta sombra es ${sil.etq.toLowerCase()}: un prisionero no podría distinguirla de la de otro objeto.` : "Gira, inclina o acerca la figura hasta que su sombra coincida con la silueta punteada."}`;
  } else if (modo === "caverna") {
    chipVivo = `etapa ${etapa + 1} de 4 · ${etapasOk.has(etapa) ? FORMAS.find((f) => f.id === et.forma)!.etq.toLowerCase() : puedeVer ? "¿qué forma de conocimiento?" : "deslumbrado…"}`;
    pie = `${et.narra} (${et.pasaje})`;
  } else if (modo === "ames") {
    chipVivo = enMirilla ? `mirilla · Ana parece medir ${num(ana.aparente, 2)} m y Beto ${num(beto.aparente, 2)} m` : `vista real · Ana a ${num(ana.distancia, 1)} m · Beto a ${num(beto.distancia, 1)} m`;
    pie = enMirilla
      ? `Por la mirilla ves con un solo ojo un cuarto «rectangular». Ana ocupa ${num(ana.angulo, 1)}° de tu campo visual y Beto ${num(beto.angulo, 1)}°. ${regla ? "Pero las reglas dicen que ambos miden 1.60 m." : "¿Quién es más alto?"}`
      : `El cuarto real no es rectangular: la esquina izquierda está ${num(AMES.K, 1)} veces más lejos de la mirilla que la derecha, y su piso y su techo están inclinados. Beto está a ${num(beto.distancia, 1)} m y Ana a ${num(ana.distancia, 1)} m: por eso se ve más pequeño.`;
  } else {
    chipVivo = res ? `${RESULTADO_DEF[res].etq.toLowerCase()}` : veredicto ? `escalón ${just.nivel} · ${NIVELES[just.nivel]!.etq.toLowerCase()}` : "elige un veredicto";
    pie = res ? `«${caso.afirmacion}» ${RESULTADO_DEF[res].explica}` : `«${caso.afirmacion}» ${veredicto ? NIVELES[just.nivel]!.que : caso.contexto}`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const subt = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "caverna") {
    const pestañas = (
      <div className="cav-opts" style={{ marginBottom: 4 }}>
        {(
          [
            ["sombras", "1 · Las sombras", "fa-cloud"],
            ["ascenso", "2 · El ascenso", "fa-person-hiking"],
          ] as const
        ).map(([id, etq, ic]) => (
          <button key={id} className="cav-opt cav-sub" data-on={sub === id} onClick={() => { setSub(id); blip(); }} style={{ ["--cavc" as string]: modoCol, background: sub === id ? `${modoCol}1f` : "transparent" }}>
            <i className={`fa-solid ${ic}`} style={{ marginRight: 8 }} />
            {etq}
          </button>
        ))}
      </div>
    );
    if (sub === "sombras") {
      control = (
        <>
          {pestañas}
          {subt("1 · La sombra que ven los prisioneros")}
          <div className="cav-opts">
            {SILUETAS.map((s) => {
              const on = s.id === silueta;
              const n = hallazgos[s.id].length;
              return (
                <button key={s.id} className="cav-opt cav-silueta" data-on={on} data-silueta={s.id} onClick={() => elegirSilueta(s.id)} style={{ ["--cavc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <IconoSilueta s={s.id} col={on ? "#fef3c7" : "rgba(255,255,255,0.55)"} size={18} />
                  {s.etq}
                  <span style={{ fontSize: 14, color: n >= 2 ? OK : T.text3, ...NUM }}>
                    {Math.min(n, 2)}/2{n >= 2 && <i className="fa-solid fa-circle-check" style={{ marginLeft: 5 }} />}
                  </span>
                </button>
              );
            })}
          </div>
          {subt("2 · El objeto que llevan detrás del tabique")}
          <div className="cav-opts">
            {SOLIDOS.map((s) => {
              const on = s.id === pose.solido;
              const ya = hallazgos[silueta].includes(s.id);
              return (
                <button key={s.id} className="cav-opt cav-solido" data-on={on} data-solido={s.id} onClick={() => { cambiarPose({ solido: s.id }); blip(); }} style={{ ["--cavc" as string]: accent, background: on ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                  <i className={`fa-solid ${s.icono}`} style={{ marginRight: 7 }} />
                  {s.etq}
                  {ya && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>Figura de madera: {solidoDef.detalle}.</div>
          <Deslizador label="Girar" icon="fa-rotate" colr={modoCol} valor={`${pose.giro}°`} min={0} max={180} step={5} value={pose.giro} onChange={(v) => cambiarPose({ giro: v })} />
          <Deslizador label="Inclinar" icon="fa-arrows-up-down" colr={modoCol} valor={`${pose.inclina}°`} min={0} max={90} step={5} value={pose.inclina} onChange={(v) => cambiarPose({ inclina: v })} />
          <Deslizador label="Acercar al fuego" icon="fa-arrows-left-right" colr={"#fb923c"} valor={`×${num(aumRel, 2)}`} min={OBJ_Z_MIN} max={OBJ_Z_MAX} step={0.1} value={pose.objZ} onChange={(v) => cambiarPose({ objZ: v })} />
          {subt("3 · Mueve el fuego")}
          <Deslizador label="Altura" icon="fa-fire" colr={"#fb923c"} valor={`${num(pose.fuegoY, 1)} m`} min={FUEGO_Y_MIN} max={FUEGO_Y_MAX} step={0.1} value={pose.fuegoY} onChange={(v) => cambiarPose({ fuegoY: v })} />
          <Deslizador label="Hacia un lado" icon="fa-left-right" colr={"#fb923c"} valor={`${num(pose.fuegoX, 1)} m`} min={-FUEGO_X_MAX} max={FUEGO_X_MAX} step={0.1} value={pose.fuegoX} onChange={(v) => cambiarPose({ fuegoX: v })} />
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 11, border: `1px solid ${coincide ? OK : T.line}`, background: coincide ? "rgba(52,211,153,0.08)" : "rgba(4,10,22,0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 14, color: T.text2, fontWeight: 800 }}>Coincidencia de forma con {sil.etq.toLowerCase()}</span>
              <span className="cav-coinc" style={{ fontSize: 15, fontWeight: 900, color: coincide ? OK : "#fff", ...NUM }}>{num(coinc * 100)} %</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginTop: 7, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, width: `${Math.max(0, Math.min(100, coinc * 100))}%`, background: coincide ? OK : modoCol, transition: "width .2s" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${UMBRAL_MISMA * 100}%`, width: 2, background: "#fff" }} />
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginTop: 6, lineHeight: 1.45 }}>
              Se compara la forma sin importar tamaño ni lugar: la sombra y la silueta se llevan a la misma área y se mide qué parte comparten. Desde {num(UMBRAL_MISMA * 100)} % son indistinguibles a simple vista.
            </div>
          </div>
          {coincide
            ? nota(`¡Coincide! Encontrados para ${sil.etq.toLowerCase()}: ${hallazgos[silueta].map((x) => SOLIDOS.find((s) => s.id === x)!.etq.toLowerCase()).join(" y ") || solidoDef.etq.toLowerCase()}. ${hallazgos[silueta].length >= 2 ? "Dos objetos distintos, una sola sombra: mirando solo la pared es imposible saber cuál es." : "Busca otro objeto distinto que dé la misma sombra."}`, OK, "fa-circle-check")
            : nota(sil.pista, T.text3, "fa-lightbulb")}
          <div className="cav-opts" style={{ marginTop: 10 }}>
            <button className="cav-toggle" data-on={ojo} onClick={() => { setOjo((o) => !o); blip(); }} style={{ ["--cavc" as string]: modoCol }}>
              <i className={`fa-solid ${ojo ? "fa-video" : "fa-eye"}`} style={{ marginRight: 9, color: modoCol }} />
              {ojo ? "Volver a la vista de toda la caverna" : "Ver la pared desde el lugar de los prisioneros"}
            </button>
          </div>
        </>
      );
    } else {
      control = (
        <>
          {pestañas}
          {subt(`Etapa ${etapa + 1} de 4 · ${et.titulo}`)}
          <div className="cav-linea">
            {ETAPAS.map((e, k) => (
              <button key={k} className="cav-punto" data-estado={etapasOk.has(k) ? "hecho" : k === etapa ? "actual" : "pendiente"} onClick={() => (k === 0 || etapasOk.has(k - 1) ? irEtapa(k) : undefined)} aria-label={e.titulo} title={e.titulo} style={{ ["--cavc" as string]: modoCol }} />
            ))}
          </div>
          <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: "rgba(4,10,22,0.45)" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: modoCol, marginBottom: 4 }}>{et.pasaje}</div>
            <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{et.narra}</div>
          </div>
          {et.brillo > 0 && (
            <>
              <Deslizador label="Acostumbrar la vista" icon="fa-eye" colr={"#fde68a"} valor={`${adapta} %`} min={0} max={100} step={5} value={adapta} onChange={(v) => setAdapta(v)} />
              {!puedeVer && nota("La luz lo deslumbra: todavía no distingue nada. Platón insiste en que hace falta tiempo para acostumbrarse (515e–516a).", "#fde68a", "fa-sun")}
            </>
          )}
          {subt("¿A qué forma de conocimiento corresponde? (línea dividida, 509d–511e)")}
          <div style={{ display: "grid", gap: 7, opacity: puedeVer ? 1 : 0.45, pointerEvents: puedeVer ? "auto" : "none" }}>
            {FORMAS.map((f) => {
              const on = formaElegida === f.id;
              const bien = f.id === et.forma;
              const hecho = etapasOk.has(etapa);
              const col = hecho && bien ? OK : on && !bien ? WARN : modoCol;
              return (
                <button key={f.id} className="cav-opt cav-forma" data-on={on || (hecho && bien)} data-forma={f.id} onClick={() => clasificar(f.id)} disabled={hecho} style={{ ["--cavc" as string]: col, textAlign: "left", background: on || (hecho && bien) ? `${col}1f` : "transparent" }}>
                  <span style={{ fontWeight: 900 }}>{f.etq}</span> <span style={{ color: T.text3, fontWeight: 700 }}>({f.griego})</span>
                  <div style={{ fontSize: 14, color: T.text2, fontWeight: 600, marginTop: 3 }}>{f.que}</div>
                </button>
              );
            })}
          </div>
          {formaElegida && (etapasOk.has(etapa) ? nota(et.porque, OK, "fa-circle-check") : nota(`Todavía no. ${FORMAS.find((f) => f.id === formaElegida)!.que} ¿Eso es lo que está viendo en esta etapa?`, WARN, "fa-rotate-left"))}
          <div className="cav-opts" style={{ marginTop: 10 }}>
            <button className="cav-opt" data-on="false" onClick={() => irEtapa(etapa - 1)} disabled={etapa === 0} style={{ ["--cavc" as string]: modoCol }}>
              <i className="fa-solid fa-backward-step" style={{ marginRight: 8 }} />
              Etapa anterior
            </button>
            <button className="cav-opt cav-sig" data-on="true" onClick={() => irEtapa(etapa + 1)} disabled={etapa === ETAPAS.length - 1 || !etapasOk.has(etapa)} style={{ ["--cavc" as string]: modoCol, background: `${modoCol}1f` }}>
              {etapa === 0 ? "Liberar al prisionero" : etapa === 1 ? "Subir hacia la salida" : "Mirar el Sol"}
              <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
            </button>
          </div>
          {etapasOk.size === ETAPAS.length && nota(<>Las dos primeras formas son opinión (dóxa); las dos últimas, conocimiento de lo inteligible (533e–534a). {REGRESO}</>, OK, "fa-lightbulb")}
          <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
            Platón pide aplicar la imagen de la caverna a lo dicho antes sobre la línea (517b). La correspondencia etapa por etapa es la lectura más difundida entre los comentaristas, no una tabla que él escriba literalmente.
          </div>
        </>
      );
    }
  } else if (modo === "ames") {
    const vistas: [number, string, string][] = [
      [0, "Mirar por la mirilla", "fa-eye"],
      [50, "Rodear la habitación", "fa-person-walking"],
      [100, "Verla desde arriba", "fa-arrow-down"],
    ];
    control = (
      <>
        <div className="cav-opts">
          {vistas.map(([v, etq, ic]) => (
            <button key={v} className="cav-opt cav-vista" data-on={vistaAmes === v} onClick={() => { cambiarVistaAmes(v); blip(); }} style={{ ["--cavc" as string]: modoCol, background: vistaAmes === v ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${ic}`} style={{ marginRight: 8 }} />
              {etq}
            </button>
          ))}
        </div>
        <Deslizador label="Punto de vista" icon="fa-camera" colr={modoCol} valor={vistaAmes <= 5 ? "mirilla" : `${vistaAmes} %`} min={0} max={100} step={1} value={vistaAmes} onChange={cambiarVistaAmes} />
        {subt("1 · Desde la mirilla, ¿quién es más alto?")}
        <div className="cav-opts">
          {PREDICCIONES.map((pr) => (
            <button key={pr.id} className="cav-opt cav-pred" data-on={prediccion === pr.id} onClick={() => { if (!prediccion) { setPrediccion(pr.id); blip(); } }} disabled={prediccion !== null} style={{ ["--cavc" as string]: prediccion === pr.id ? (pr.id === "iguales" ? OK : WARN) : modoCol, background: prediccion === pr.id ? `${modoCol}1f` : "transparent" }}>
              {pr.etq}
            </button>
          ))}
        </div>
        {prediccion &&
          nota(
            prediccion === "ana"
              ? "Es lo que ve casi todo el mundo: Ana parece casi el doble de alta. Ahora mide."
              : prediccion === "iguales"
                ? "Buena sospecha. ¿Pero lo sabes o lo crees? Compruébalo con la regla."
                : "Curioso: por la mirilla Beto se ve mucho más pequeño. Mide para salir de dudas.",
            T.text2,
            "fa-comment",
          )}
        {subt("2 · Mide con la regla (la razón contra la apariencia)")}
        <button className="cav-toggle" onClick={() => { setRegla(true); blip(); }} disabled={regla || !prediccion} style={{ ["--cavc" as string]: "#fde68a" }}>
          <i className="fa-solid fa-ruler-vertical" style={{ marginRight: 9, color: "#fde68a" }} />
          {regla ? "Reglas colocadas: Ana 1.60 m · Beto 1.60 m" : prediccion ? "Colocar una regla junto a cada uno" : "Primero haz tu predicción"}
        </button>
        {regla && nota(`Miden lo mismo. Por la mirilla Ana ocupa ${num(ana.angulo, 1)}° de tu vista y Beto ${num(beto.angulo, 1)}°: la diferencia está en la distancia, no en la estatura. Rodea la habitación para ver por qué.`, OK, "fa-ruler")}
        {subt("3 · Pide a Beto que camine hacia la derecha (míralo por la mirilla)")}
        <Deslizador label="Beto camina" icon="fa-person-walking" colr={"#60a5fa"} valor={`${num(beto.distancia, 1)} m`} min={AMES.xBetoMin} max={AMES.xBetoMax} step={0.05} value={betoX} onChange={moverBeto} />
        {nota(`Beto parece medir ${num(beto.aparente, 2)} m ${enMirilla ? "(visto por la mirilla)" : "si el cuarto fuera rectangular"}. ${paseo ? "Viste cómo «crecía» al acercarse a la esquina derecha sin cambiar de estatura." : ""}`, paseo ? OK : T.text2, "fa-person")}
        {subt("4 · ¿Por qué engaña?")}
        <div style={{ display: "grid", gap: 7, opacity: rodeo && regla ? 1 : 0.45, pointerEvents: rodeo && regla ? "auto" : "none" }}>
          {EXPLICACIONES_AMES.map((e) => {
            const on = explicacion === e.id;
            const col = on ? (e.ok ? OK : WARN) : modoCol;
            return (
              <button key={e.id} className="cav-opt cav-explic" data-on={on} data-ok={e.ok} onClick={() => { if (!explicOk) { setExplicacion(e.id); sfx(e.ok); } }} style={{ ["--cavc" as string]: col, textAlign: "left", background: on ? `${col}1f` : "transparent" }}>
                {e.etq}
              </button>
            );
          })}
        </div>
        {!(rodeo && regla) && nota("Mide a los dos y rodea la habitación antes de explicar.", T.text3)}
        {explicacion && nota(EXPLICACIONES_AMES.find((e) => e.id === explicacion)!.explica, explicOk ? OK : WARN, explicOk ? "fa-circle-check" : "fa-rotate-left")}
        {explicOk && (
          <>
            {subt("5 · ¿Qué corrigió el error? (elige todas las que apliquen)")}
            <div className="cav-opts">
              {FUENTES_CORRIGEN.map((f) => {
                const on = fuentesSel.includes(f.id);
                const col = fuentesComprobadas ? (on === f.ok ? (on ? OK : "rgba(255,255,255,0.14)") : WARN) : on ? modoCol : "rgba(255,255,255,0.14)";
                return (
                  <button key={f.id} className="cav-opt cav-corrige" data-on={on} data-ok={f.ok} onClick={() => { setFuentesSel((xs) => (xs.includes(f.id) ? xs.filter((x) => x !== f.id) : [...xs, f.id])); setFuentesComprobadas(false); blip(); }} style={{ ["--cavc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                    {f.etq}
                  </button>
                );
              })}
            </div>
            <button className="cav-toggle" onClick={() => { setFuentesComprobadas(true); sfx(fuentesCorrectas); }} disabled={fuentesSel.length === 0} style={{ marginTop: 10, ["--cavc" as string]: modoCol }}>
              <i className="fa-solid fa-check-double" style={{ marginRight: 9, color: modoCol }} />
              Comprobar
            </button>
            {fuentesComprobadas &&
              nota(
                fuentesCorrectas
                  ? "Así es: otra percepción (verlo desde fuera) y la razón (medir y calcular) corrigieron a la primera impresión. La percepción y la razón se complementan (lectura A1). Que muchos visitantes vean lo mismo no lo hace verdadero."
                  : "Revisa: la mayoría de los visitantes ve lo mismo que tú y se equivoca igual, y la primera impresión es justo lo que falló.",
                fuentesCorrectas ? OK : WARN,
                fuentesCorrectas ? "fa-circle-check" : "fa-rotate-left",
              )}
          </>
        )}
      </>
    );
  } else {
    control = (
      <>
        <div className="cav-opts">
          {CASOS.map((c, i) => (
            <button key={c.id} className="cav-opt cav-caso" data-on={i === casoIdx} onClick={() => elegirCaso(i)} style={{ ["--cavc" as string]: modoCol, background: i === casoIdx ? `${modoCol}1f` : "transparent" }}>
              {c.etq}
              {casosVerificados.has(c.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>{caso.contexto}</div>
          <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 900, marginTop: 6 }}>«{caso.afirmacion}»</div>
        </div>
        {subt("1 · Tu veredicto (creencia)")}
        <div className="cav-opts">
          {VEREDICTOS.map((v) => (
            <button key={v.id} className="cav-opt cav-veredicto" data-on={veredicto === v.id} onClick={() => elegirVeredicto(v.id)} disabled={verificado} style={{ ["--cavc" as string]: modoCol, background: veredicto === v.id ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${v.icono}`} style={{ marginRight: 8 }} />
              {v.etq}
            </button>
          ))}
        </div>
        {subt("2 · Elige tus razones (justificación)")}
        <div style={{ display: "grid", gap: 7 }}>
          {caso.evidencias.map((e) => {
            const on = elegidas.includes(e.id);
            const fd = FUENTE_DEF[e.fuente];
            const malo = verificado && on && (e.calidad === "enganosa" || (e.apoya !== null && e.apoya !== veredicto));
            return (
              <button key={e.id} className="cav-opt cav-razon" data-on={on} data-razon={e.id} onClick={() => alternar(e.id)} disabled={verificado} style={{ ["--cavc" as string]: on ? (malo ? WARN : fd.color) : "rgba(255,255,255,0.14)", textAlign: "left", background: on ? `${fd.color}14` : "transparent" }}>
                <span style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${on ? "fa-square-check" : "fa-square"}`} style={{ marginTop: 2, color: on ? fd.color : "rgba(255,255,255,0.35)" }} />
                  <span style={{ minWidth: 0 }}>
                    {e.texto}
                    <span style={{ display: "block", fontSize: 14, color: fd.color, marginTop: 3 }}>
                      <i className={`fa-solid ${fd.icono}`} style={{ marginRight: 5 }} />
                      {fd.etq}
                    </span>
                    {verificado && on && <span style={{ display: "block", fontSize: 14, color: malo ? WARN : T.text2, fontWeight: 600, marginTop: 4 }}>{e.explica}</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {veredicto && !verificado && (
          <>
            {just.enganosas.length > 0 && nota(`Una razón engañosa derrumba el escalón: «${just.enganosas[0]!.texto}» ${just.enganosas[0]!.explica}`, WARN, "fa-triangle-exclamation")}
            {just.enganosas.length === 0 && just.contrarias.length > 0 && nota(`Esta razón apoya otro veredicto: «${just.contrarias[0]!.texto}»`, WARN, "fa-code-compare")}
            {just.enganosas.length === 0 && just.contrarias.length === 0 && just.sinPeso.length > 0 && nota(`«${just.sinPeso[0]!.texto}» ${just.sinPeso[0]!.explica}`, T.text2)}
            {just.nivel === 2 && nota("Tienes una razón sólida. Para una justificación fuerte busca otra de una fuente distinta.", "#fbbf24", "fa-stairs")}
          </>
        )}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: T.text2, fontWeight: 800 }}>Escalón:</span>
          {NIVELES.map((n, i) => (
            <span key={i} style={{ fontSize: 14, fontWeight: 800, padding: "4px 8px", borderRadius: 7, border: `1px solid ${i === just.nivel && veredicto ? modoCol : T.line}`, color: i === just.nivel && veredicto ? "#fff" : T.text3, background: i === just.nivel && veredicto ? `${modoCol}26` : "transparent" }}>
              {i} {n.etq}
            </span>
          ))}
        </div>
        {subt("3 · Verifica: ¿corresponde a los hechos?")}
        {!verificado ? (
          <button className="cav-toggle cav-verificar" onClick={verificar} disabled={!veredicto} style={{ ["--cavc" as string]: modoCol }}>
            <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 9, color: modoCol }} />
            {veredicto ? (caso.id === "volado" ? "Echar el volado" : caso.id === "reloj" ? "Revisar la hora en el teléfono" : "Consultar los datos del INEGI") : "Primero elige un veredicto"}
          </button>
        ) : (
          res && (
            <>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${RESULTADO_DEF[res].color}66`, background: "rgba(4,10,22,0.45)" }}>
                <div className="cav-resultado" style={{ fontSize: 14, fontWeight: 900, color: RESULTADO_DEF[res].color }}>
                  {RESULTADO_DEF[res].etq}
                </div>
                <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, marginTop: 4 }}>
                  {caso.id === "volado" && moneda ? `Cayó ${moneda === "aguila" ? "águila" : "sol"}. ` : ""}
                  {caso.id === "censo" ? "El Censo 2020 contó 126 014 024 habitantes: la afirmación corresponde a los hechos. " : ""}
                  {RESULTADO_DEF[res].explica}
                </div>
                {caso.id === "volado" && veredicto === "nosabe" && res === "conocimiento" && <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>Lo que sabías era justamente que el resultado no podía saberse: probabilidad 1/2. Reconocer los límites de lo que sabes también es conocimiento.</div>}
              </div>
              {res === "gettier" && (
                <>
                  {subt(PREGUNTA_RELOJ)}
                  <div style={{ display: "grid", gap: 7 }}>
                    {OPCIONES_RELOJ.map((o) => {
                      const on = respReloj === o.id;
                      const col = on ? (o.ok ? OK : WARN) : modoCol;
                      return (
                        <button key={o.id} className="cav-opt cav-reloj" data-on={on} data-ok={o.ok} onClick={() => { if (!relojOk) { setRespReloj(o.id); sfx(o.ok); } }} style={{ ["--cavc" as string]: col, textAlign: "left", background: on ? `${col}1f` : "transparent" }}>
                          {o.etq}
                        </button>
                      );
                    })}
                  </div>
                  {respReloj && nota(OPCIONES_RELOJ.find((o) => o.id === respReloj)!.explica, relojOk ? OK : WARN, relojOk ? "fa-circle-check" : "fa-rotate-left")}
                </>
              )}
              <div className="cav-opts" style={{ marginTop: 10 }}>
                <button className="cav-opt" data-on="false" onClick={reintentarCaso} style={{ ["--cavc" as string]: modoCol }}>
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                  Cambiar mis razones
                </button>
                <button className="cav-opt" data-on="true" onClick={() => elegirCaso((casoIdx + 1) % CASOS.length)} style={{ ["--cavc" as string]: modoCol, background: `${modoCol}1f` }}>
                  Siguiente caso
                  <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                </button>
              </div>
            </>
          )
        )}
        <div style={{ marginTop: 12, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Criterio del laboratorio (didáctico): una razón sólida sube a «creencia fundada»; dos sólidas de fuentes distintas y ninguna engañosa, a «creencia justificada». Pregunta del video A8: {PREGUNTA_A8}
        </div>
      </>
    );
  }

  const deslumbraVisor = modo === "caverna" && sub === "ascenso" ? deslumbra : 0;

  const verdadVal = res ? (res !== "falsa" && res !== "errorJustificado" ? "sí" : "no") : "?";
  const extra: ReactNode =
    modo === "caverna" && sub === "ascenso" ? (
      <Bloque titulo="Línea dividida: dónde está el prisionero" icono="fa-layer-group">
        <LineaDividida activa={et.forma} hechas={etapasOk} etapa={etapa} />
      </Bloque>
    ) : modo === "escalera" ? (
      <Bloque titulo="Las tres condiciones del conocimiento" icono="fa-stairs">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
          <Dato label="Creencia" value={veredicto ? "sí" : "aún no"} col={veredicto ? OK : "#94a3b8"} />
          <Dato label="Justificación" value={veredicto ? `escalón ${just.nivel} de 3` : "—"} col={veredicto && just.nivel === 3 ? OK : "#94a3b8"} />
          <Dato label="Verdad" value={verdadVal} col={verdadVal === "sí" ? OK : verdadVal === "no" ? NO_COL : "#94a3b8"} />
          <Dato label="Resultado" value={res ? RESULTADO_DEF[res].etq : "sin verificar"} col={res ? RESULTADO_DEF[res].color : "#94a3b8"} />
        </div>
      </Bloque>
    ) : null;

  const css = `
    .cav-opts { display:flex; flex-wrap:wrap; gap:8px; }
    .cav-opt { cursor:pointer; border:1px solid var(--cavc); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.4; }
    .cav-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
    .cav-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
    .cav-opt:disabled { cursor:default; }
    .cav-opt:disabled[data-on="false"] { opacity:0.55; }
    .cav-toggle { width:100%; cursor:pointer; border:1px solid var(--cavc); border-radius:11px; padding:12px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
    .cav-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
    .cav-toggle:disabled { cursor:default; opacity:0.7; }
    .cav-linea { display:flex; align-items:center; gap:0; }
    .cav-punto { cursor:pointer; flex:1; height:16px; border:none; background:transparent; position:relative; padding:0; }
    .cav-punto::before { content:""; position:absolute; left:0; right:0; top:7px; height:2px; background:rgba(255,255,255,0.14); }
    .cav-punto::after { content:""; position:absolute; left:50%; top:1px; width:14px; height:14px; margin-left:-7px; border-radius:50%; border:2px solid var(--cavc); background:#06121e; transition:all .2s; }
    .cav-punto[data-estado="hecho"]::after { background:var(--cavc); }
    .cav-punto[data-estado="actual"]::after { background:var(--cavc); box-shadow:0 0 0 4px rgba(255,255,255,0.12); transform:scale(1.25); }
    .cav-opt:focus-visible, .cav-toggle:focus-visible, .cav-punto:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
    .cav-glare { position:absolute; inset:0; pointer-events:none; transition:opacity .35s ease; background:radial-gradient(90% 80% at 55% 38%, #fffef5 0%, #fff7d6 45%, rgba(255,240,200,0.92) 100%); }
    .cav-guia summary { cursor:pointer; color:${accent}; font-weight:800; }
  `;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <div style={{ position: "relative", height: "100%" }}>
          <style>{css}</style>
          <SceneBoundary fallback={sceneFallback}>
            <CavernaScene
              vista={vista}
              modoColor={modoCol}
              resetNonce={resetNonce}
              pose={pose}
              silueta={silueta}
              coincide={coincide}
              ojoPrisionero={ojo}
              etapa={etapa}
              vistaAmes={vistaAmes / 100}
              betoX={betoX}
              regla={regla}
              casoId={caso.id}
              veredicto={veredicto}
              elegidas={elegidas}
              nivel={veredicto ? just.nivel : 0}
              verificado={verificado}
              moneda={moneda}
              resultado={res}
            />
          </SceneBoundary>
          <div className="cav-glare" style={{ opacity: deslumbraVisor }} />
        </div>
      }
      modos={{ opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })), valor: modo, cambiar: (id) => cambiarModo(id as Modo) }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={chipVivo}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={`Qué pasa · ${def.etq}`} icono="fa-eye">
                <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}12`, color: "#fff", lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 900, color: modoCol, marginBottom: 4 }}>
                    <i className={`fa-solid ${def.icono}`} style={{ marginRight: 8 }} />
                    {chipVivo}
                  </div>
                  {pie}
                </div>
              </Bloque>
              {extra}
              <Bloque titulo="Controles" icono="fa-sliders">
                {control}
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
              <FuenteCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes distinguir las fuentes y el problema de la verdad." />
              <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
                <Eyebrow>
                  <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                  Completa el texto (A6)
                </Eyebrow>
                <div style={{ marginTop: 12 }}>
                  <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
                </div>
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
              <Bloque titulo="¿Lo sé o lo creo?" icono="fa-fire">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Lectura A1" icono="fa-book-open">
                <div style={{ fontWeight: 800, color: "#fff" }}>{TITULO_A1}</div>
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    {p}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                {PREGUNTAS_A1.map((q, i) => (
                  <details key={i} className="cav-guia" style={{ color: T.text2 }}>
                    <summary>{q.pregunta}</summary>
                    <div style={{ marginTop: 5, paddingLeft: 12 }}>{q.guia}</div>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </Bloque>
              <Bloque titulo="Hechos (quiz A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => (
                    <li key={i}>
                      <strong style={{ color: h.respuesta ? OK : WARN }}>{h.respuesta ? "Verdadero" : "Falso"}:</strong> «{h.enunciado}» {h.retro}
                    </li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                {GLOSARIO.map((gi, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <strong style={{ color: accent }}>{gi.termino}. </strong>
                    <span style={{ color: T.text2 }}>{gi.definicion}</span>
                    <div style={{ color: T.text3, marginTop: 4 }}>
                      <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                      {gi.ejemplo}
                    </div>
                  </div>
                ))}
                <div style={{ color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
                </div>
              </Bloque>
              <Bloque titulo="Para escribir (reflexión A3)" icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text2 }}>{REFLEXION_A3}</p>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Autoevaluación (A7)" icono="fa-clipboard-check">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {AUTOEVALUACION_A7.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
                <div style={{ color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Para cerrar:</strong> {REFLEXION_FINAL_A7}
                </div>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CAVERNA_CONOCIMIENTO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La lectura A1 y sus preguntas, el quiz A2, la reflexión A3, los hechos del quiz A4, el glosario A5, el texto A6, la autoevaluación A7 y la pregunta del video A8 son <strong>verbatim</strong> del
                material de la plataforma. Las sombras se <strong>calculan</strong> proyectando desde el fuego cada punto de la figura sobre la pared; la coincidencia de forma es un criterio del laboratorio. La
                alegoría se resume, no se cita literalmente (Platón, <em>República</em> VII, 514a–517c; línea dividida en VI, 509d–511e). La habitación de Ames (Adelbert Ames Jr., 1946) se construye con una
                transformación proyectiva exacta; sus medidas son <strong>ilustrativas</strong>. Los casos de la escalera son <strong>ejemplos didácticos</strong>, salvo el dato del Censo de Población y Vivienda
                2020 del INEGI (126 014 024 habitantes) y el reloj parado de Bertrand Russell (<em>Human Knowledge</em>, 1948). Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
