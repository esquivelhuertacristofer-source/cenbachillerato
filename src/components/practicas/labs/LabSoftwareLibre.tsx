"use client";

/**
 * Laboratorio 3D — "Software libre y alternativas".
 * Práctica experimental anclada a CD-I-P09-A2 (quiz «Software libre — Opción
 * múltiple») y CD-I-P09-A6 (completa el texto); progresión 4 de la UAC CD-I.
 * El marco teórico es la lectura A1, los hechos salen del quiz A4, el glosario
 * del A5, y los paneles citan la reflexión A3 y el video A8.
 *
 * Tres modos:
 *  (1) La caja de las libertades — predecir qué libertades concede cada una de
 *      seis licencias reales y abrir la caja; con GPL y MIT, ver qué pasa con
 *      una versión modificada (copyleft frente a permisiva).
 *  (2) Cápsula del tiempo — guardar cuatro archivos en 2007 en formato abierto
 *      o cerrado, decidir de quién depende cada formato y abrirlos en 2026 sin
 *      el programa original.
 *  (3) Equipa la sala — predecir si comprar o suscribirse cuesta más, calcular
 *      el costo de licencias de una sala de cómputo y dejar de pagar las
 *      suscripciones para ver qué pasa con los archivos.
 */

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { SOFTWARE_LIBRE_FICHA } from "./software-libre-ficha";
import type { FaseCapsula } from "./SoftwareLibreScene";
import {
  type Modo,
  type LicenciaId,
  type EntregableId,
  type FormatoId,
  type Dependencia,
  type NecesidadId,
  type Ruta,
  type PrediccionCosto,
  type Categoria,
  MODOS,
  MODOS_DEF,
  LIBERTADES,
  LICENCIAS,
  ENTREGA_DEF,
  esLibre,
  ENTREGABLES,
  FORMATOS,
  formatosDe,
  DEPENDENCIAS,
  RESULTADO_DEF,
  ANIO_GUARDADO,
  ANIO_HOY,
  NECESIDADES,
  RUTA_DEF,
  TC_MXN,
  EQ_MIN,
  EQ_MAX,
  ANIOS_MAX,
  costoUSD,
  mesEquilibrio,
  PRED_EQUIPOS,
  PRED_ANIOS,
  PRED_OPCIONES,
  CATEGORIAS,
  PROGRAMAS,
  rondaProgramas,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS,
  REFLEXION_A3,
  SAAS_A8,
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
} from "./software-libre-data";

const SoftwareScene = dynamic(() => import("./SoftwareLibreScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-box-open fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la caja de las libertades en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-software-libre-reto";
const WARN = "#FF8A3C";
const T_CAPSULA = 2800;
const RONDA_INICIAL = rondaProgramas(mulberry32(7));
const PRED_VACIA = [false, false, false, false];
const OBJ_CLASIFICADOS = 6;

/* ── Datos derivados (constantes) ─────────────────────────────────────── */
const OFI = NECESIDADES.find((n) => n.id === "ofimatica")!;
const OFI_COMPRA = OFI.opciones.find((o) => o.ruta === "compra")!;
const OFI_SUSC = OFI.opciones.find((o) => o.ruta === "suscripcion")!;
const PRED_COMPRA_USD = costoUSD(OFI_COMPRA, PRED_EQUIPOS, PRED_ANIOS);
const PRED_SUSC_USD = costoUSD(OFI_SUSC, PRED_EQUIPOS, PRED_ANIOS);
const PRED_CORRECTA: PrediccionCosto = Math.abs(PRED_COMPRA_USD - PRED_SUSC_USD) / Math.max(PRED_COMPRA_USD, PRED_SUSC_USD) < 0.1 ? "igual" : PRED_SUSC_USD > PRED_COMPRA_USD ? "suscripcion" : "compra";
const MES_EQUILIBRIO = mesEquilibrio(OFI_COMPRA.unico, OFI_SUSC.mensual);
const RUTAS_INICIALES: Record<NecesidadId, Ruta> = { so: "compra", ofimatica: "suscripcion", imagen: "suscripcion" };
const FORMATO_INICIAL: Record<EntregableId, FormatoId> = { tarea: "pages", foto: "psd", logo: "cdr", animacion: "swf" };

/* ── Tarjeta de estrellas: ¿libre, gratis o de pago? ──────────────────── */
function LibreGratisCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = PROGRAMAS[ronda[pos] ?? 0]!;

  const responder = (c: Categoria) => {
    if (resuelto !== null) return;
    const ok = c === actual.cat;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es «${CATEGORIAS.find((x) => x.id === c)!.etq.toLowerCase()}». Pista: ${actual.porque}`);
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
    setRonda(rondaProgramas(Math.random));
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
          ¿Libre, gratis o de pago?
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
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Programa {pos + 1} de {ronda.length} · ¿en qué categoría va?
          </div>
          <div style={{ fontSize: 17, color: "#fff", fontWeight: 900, lineHeight: 1.4, marginBottom: 12 }} className="sl-programa">
            {actual.nombre}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIAS.map((c) => (
              <button key={c.id} className="sl-opt sl-cat" data-on="true" onClick={() => responder(c.id)} style={{ ["--slc" as string]: c.color }}>
                <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8, color: c.color }} />
                {c.etq}
              </button>
            ))}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 14, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
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
    </div>
  );
}

/* ── Gráfica: costo acumulado de ofimática por año (compra vs suscripción vs libre) ── */
function GraficaCosto({ equipos, anios }: { equipos: number; anios: number }) {
  const W = 340;
  const H = 200;
  const PL = 10;
  const PR = 10;
  const PT = 22;
  const PB = 40;
  const compra = OFI_COMPRA.unico * equipos * TC_MXN;
  const suscA = (t: number) => OFI_SUSC.mensual * 12 * t * equipos * TC_MXN;
  const ymax = Math.max(compra, suscA(ANIOS_MAX)) * 1.05;
  const x = (t: number) => PL + (t / ANIOS_MAX) * (W - PL - PR);
  const y = (v: number) => H - PB - (v / ymax) * (H - PB - PT);
  const cruce = OFI_COMPRA.unico / (OFI_SUSC.mensual * 12);
  const cSusc = RUTA_DEF.suscripcion.color;
  const cCompra = RUTA_DEF.compra.color;
  const cLibre = RUTA_DEF.libre.color;
  const vSusc = suscA(anios);
  const suscGana = vSusc > compra;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Costo acumulado de ofimática por año" style={{ display: "block", maxWidth: "100%" }}>
        <line x1={PL} y1={y(0)} x2={W - PR} y2={y(0)} stroke="rgba(255,255,255,0.25)" />
        <line x1={PL} y1={y(compra)} x2={W - PR} y2={y(compra)} stroke={cCompra} strokeWidth={3} />
        <line x1={x(0)} y1={y(0)} x2={x(ANIOS_MAX)} y2={y(suscA(ANIOS_MAX))} stroke={cSusc} strokeWidth={3} />
        <line x1={PL} y1={y(0) - 2} x2={W - PR} y2={y(0) - 2} stroke={cLibre} strokeWidth={3} strokeDasharray="6 4" />
        <circle cx={x(cruce)} cy={y(compra)} r={6} fill="#fff" stroke="#04121f" strokeWidth={2} />
        <line x1={x(anios)} y1={PT - 6} x2={x(anios)} y2={y(0)} stroke="rgba(255,255,255,0.6)" strokeDasharray="4 4" />
        <circle cx={x(anios)} cy={y(vSusc)} r={6} fill={cSusc} stroke="#fff" strokeWidth={2} />
        <text x={x(anios) + (anios > ANIOS_MAX / 2 ? -8 : 8)} y={Math.max(PT, y(vSusc) - 10)} textAnchor={anios > ANIOS_MAX / 2 ? "end" : "start"} fill="#fff" fontSize={14} fontWeight={800}>
          ${num(vSusc)}
        </text>
        <text x={PL} y={H - 8} fill="#94a3b8" fontSize={14}>0</text>
        <text x={W - PR} y={H - 8} fill="#94a3b8" fontSize={14} textAnchor="end">{ANIOS_MAX} años</text>
        <text x={x(anios)} y={H - 22} fill="#fff" fontSize={14} fontWeight={800} textAnchor="middle">{anios} {anios === 1 ? "año" : "años"}</text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", color: T.text2 }}>
        <span><span style={{ display: "inline-block", width: 14, height: 4, background: cCompra, marginRight: 6, verticalAlign: "middle" }} />Comprar (una vez)</span>
        <span><span style={{ display: "inline-block", width: 14, height: 4, background: cSusc, marginRight: 6, verticalAlign: "middle" }} />Suscripción</span>
        <span><span style={{ display: "inline-block", width: 14, height: 4, background: cLibre, marginRight: 6, verticalAlign: "middle" }} />Libre</span>
      </div>
      <div style={{ marginTop: 8, color: suscGana ? "#fbbf24" : OK, fontWeight: 700 }}>
        {suscGana
          ? `A ${anios} ${anios === 1 ? "año" : "años"} la suscripción ya costó más que comprar. Se cruzan en el mes ${MES_EQUILIBRIO}.`
          : `A ${anios} ${anios === 1 ? "año" : "años"} la suscripción aún es más barata que comprar. Se cruzan en el mes ${MES_EQUILIBRIO}: sigue subiendo los años.`}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabSoftwareLibre({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("licencias");

  // ── Licencias
  const [licId, setLicId] = useState<LicenciaId>("gpl");
  const [pred, setPred] = useState<boolean[]>(PRED_VACIA);
  const [revelada, setRevelada] = useState(false);
  const [derivada, setDerivada] = useState(false);
  const [abiertas, setAbiertas] = useState<Set<LicenciaId>>(() => new Set());
  const [prediccionPerfecta, setPrediccionPerfecta] = useState(false);
  const [derivadas, setDerivadas] = useState<Set<LicenciaId>>(() => new Set());

  // ── Formatos
  const [entregable, setEntregable] = useState<EntregableId>("tarea");
  const [formatoSel, setFormatoSel] = useState<Record<EntregableId, FormatoId>>(FORMATO_INICIAL);
  const [predDep, setPredDep] = useState<Partial<Record<FormatoId, Dependencia>>>({});
  const [fase, setFase] = useState<FaseCapsula>("cerrada");
  const [archivo, setArchivo] = useState<Partial<Record<EntregableId, FormatoId>>>({});
  const [rescate, setRescate] = useState(false);

  // ── Costos
  const [equipos, setEquipos] = useState(20);
  const [anios, setAnios] = useState(1);
  const [rutas, setRutas] = useState<Record<NecesidadId, Ruta>>(RUTAS_INICIALES);
  const [sinPago, setSinPago] = useState(false);
  const [predCosto, setPredCosto] = useState<PrediccionCosto | null>(null);
  const [vioSinPago, setVioSinPago] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
  const capsulaTimer = useRef<number | null>(null);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setClasifico(true);
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
      if (capsulaTimer.current !== null) window.clearTimeout(capsulaTimer.current);
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

  /* ── Licencias ─────────────────────────────────────────────────────── */
  const lic = LICENCIAS.find((l) => l.id === licId)!;
  const aciertos = lic.libertades.filter((v, i) => v === pred[i]).length;

  const elegirLicencia = (id: LicenciaId) => {
    setLicId(id);
    setPred(PRED_VACIA);
    setRevelada(false);
    setDerivada(false);
    blip();
  };
  const alternarPuerta = (i: number) => {
    if (revelada) return;
    setPred((p) => p.map((v, k) => (k === i ? !v : v)));
    blip();
  };
  const abrirCaja = () => {
    if (revelada) return;
    setRevelada(true);
    setAbiertas((s) => new Set(s).add(licId));
    const perfecta = lic.libertades.every((v, i) => v === pred[i]);
    if (perfecta) setPrediccionPerfecta(true);
    sfx(perfecta);
  };
  const reintentarCaja = () => {
    setPred(PRED_VACIA);
    setRevelada(false);
    setDerivada(false);
    blip();
  };
  const verDerivada = () => {
    setDerivada(true);
    setDerivadas((s) => new Set(s).add(licId));
    blip();
  };

  /* ── Formatos ──────────────────────────────────────────────────────── */
  const formatoId = formatoSel[entregable];
  const fmt = FORMATOS.find((f) => f.id === formatoId)!;
  const miPred = predDep[formatoId];
  const clasificadosOk = FORMATOS.filter((f) => predDep[f.id] === f.dependencia).length;
  const archivoIntegro = ENTREGABLES.every((e) => {
    const fid = archivo[e.id];
    return !!fid && FORMATOS.find((f) => f.id === fid)!.resultado === "integro";
  });

  const cerrarCapsula = () => {
    if (capsulaTimer.current !== null) window.clearTimeout(capsulaTimer.current);
    capsulaTimer.current = null;
    setFase("cerrada");
  };
  const elegirEntregable = (e: EntregableId) => {
    setEntregable(e);
    cerrarCapsula();
    blip();
  };
  const elegirFormato = (id: FormatoId) => {
    setFormatoSel((s) => ({ ...s, [entregable]: id }));
    cerrarCapsula();
    blip();
  };
  const predecirDep = (d: Dependencia) => {
    if (miPred) return;
    setPredDep((p) => ({ ...p, [formatoId]: d }));
    sfx(d === fmt.dependencia);
  };
  const abrirCapsula = () => {
    if (!miPred || fase !== "cerrada") return;
    setFase("abriendo");
    blip();
    const e = entregable;
    const f = fmt;
    capsulaTimer.current = window.setTimeout(() => {
      capsulaTimer.current = null;
      setFase("abierta");
      setArchivo((a) => ({ ...a, [e]: f.id }));
      if (f.rescate) setRescate(true);
    }, T_CAPSULA);
  };

  /* ── Costos ────────────────────────────────────────────────────────── */
  const opcionDe = (id: NecesidadId) => {
    const n = NECESIDADES.find((x) => x.id === id)!;
    return n.opciones.find((o) => o.ruta === rutas[id]) ?? n.opciones[0]!;
  };
  const costosMXN = NECESIDADES.map((n) => costoUSD(opcionDe(n.id), equipos, anios) * TC_MXN);
  const totalMXN = costosMXN.reduce((a, b) => a + b, 0);
  const haySusc = NECESIDADES.some((n) => rutas[n.id] === "suscripcion");
  const libreTotalMXN = 0;
  const prediccionComprobada = predCosto !== null && anios >= PRED_ANIOS && equipos >= PRED_EQUIPOS;

  const elegirRuta = (id: NecesidadId, r: Ruta) => {
    setRutas((s) => ({ ...s, [id]: r }));
    blip();
  };
  const predecirCosto = (p: PrediccionCosto) => {
    if (predCosto) return;
    setPredCosto(p);
    sfx(p === PRED_CORRECTA);
  };
  const comprobarPrediccion = () => {
    setEquipos(PRED_EQUIPOS);
    setAnios(PRED_ANIOS);
    setRutas((s) => ({ ...s, ofimatica: "suscripcion" }));
    blip();
  };
  const alternarPago = () => {
    const nuevo = !sinPago;
    setSinPago(nuevo);
    if (nuevo && haySusc) setVioSinPago(true);
    sfx(!nuevo);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "licencias") reintentarCaja();
    if (modo === "formatos") cerrarCapsula();
    if (modo === "costos") {
      setSinPago(false);
      setRutas(RUTAS_INICIALES);
      setAnios(1);
      setEquipos(20);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Predecir sin errores las cuatro puertas de una licencia", done: prediccionPerfecta },
    { t: "Abrir la caja de las seis licencias", done: abiertas.size === LICENCIAS.length },
    { t: "Comparar la versión modificada bajo GPL y bajo MIT", done: derivadas.has("gpl") && derivadas.has("mit") },
    { t: `Clasificar bien de quién dependen ${OBJ_CLASIFICADOS} formatos`, done: clasificadosOk >= OBJ_CLASIFICADOS },
    { t: "Rescatar con software libre un archivo de formato cerrado", done: rescate },
    { t: "Armar un archivo escolar que llegue íntegro a 2026", done: archivoIntegro },
    { t: "En la sala, mueve los años hasta pasar el cruce de Office: ¿cuándo deja de ser barata la suscripción?", done: modo === "costos" && anios >= 2 },
    { t: "Predecir qué cuesta más a 5 años y comprobarlo en la sala", done: prediccionComprobada },
    { t: "Dejar de pagar las suscripciones y ver qué pasa con los archivos", done: vioSinPago },
    { t: "Clasificar programas y ganar estrellas", done: clasifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "licencias") {
    chipVivo = revelada ? `${lic.etq.toLowerCase()} · ${lic.libertades.filter(Boolean).length}/4 libertades · ${esLibre(lic) ? "libre" : "no libre"}` : `${lic.etq.toLowerCase()} · prediciendo`;
    pie = revelada ? (derivada && lic.derivada ? lic.derivada.explica : lic.resumen) : `${lic.ejemplo} usa la ${lic.etq}. Toca las puertas que crees que esta licencia deja abrir y después abre la caja.`;
  } else if (modo === "formatos") {
    const ent = ENTREGABLES.find((e) => e.id === entregable)!;
    chipVivo = fase === "abriendo" ? `viajando de ${ANIO_GUARDADO} a ${ANIO_HOY}…` : fase === "abierta" ? `${fmt.ext} · ${RESULTADO_DEF[fmt.resultado].etq.toLowerCase()}` : `${ent.etq.toLowerCase()} · ${fmt.ext} · ${ANIO_GUARDADO}`;
    pie = fase === "abierta" ? fmt.explica : fase === "abriendo" ? `Pasan ${ANIO_HOY - ANIO_GUARDADO} años. ${fmt.destinoOriginal}` : `Guardaste la ${ent.etq.toLowerCase()} en ${ANIO_GUARDADO} como ${fmt.ext} con ${fmt.original}. ${miPred ? "Ábrela hoy sin el programa original." : "¿De quién depende poder abrirla hoy?"}`;
  } else {
    chipVivo = `${equipos} equipos · ${anios} ${anios === 1 ? "año" : "años"} · $${num(totalMXN)} MXN${sinPago ? " · sin pagar" : ""}`;
    pie = sinPago
      ? haySusc
        ? "Dejaste de pagar: las pantallas de suscripción se bloquean. Lo que pagaste ya no se recupera, y tus archivos quedan atados a lo que el proveedor permita. Lo libre y lo comprado siguen funcionando."
        : "No elegiste ninguna suscripción: al dejar de pagar no cambia nada en la sala."
      : `Licencias de ${equipos} equipos durante ${anios} ${anios === 1 ? "año" : "años"}: $${num(totalMXN)} MXN. Con software libre, $${num(libreTotalMXN)} en licencias (la capacitación y el soporte cuestan en cualquier ruta).`;
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

  const sub = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "licencias") {
    control = (
      <>
        <div className="sl-opts">
          {LICENCIAS.map((l) => (
            <button key={l.id} className="sl-opt sl-lic" data-on={l.id === licId} onClick={() => elegirLicencia(l.id)} style={{ ["--slc" as string]: l.color, background: l.id === licId ? `${l.color}1f` : "transparent" }}>
              {l.etq}
              {abiertas.has(l.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>
            {lic.etq} <span style={{ color: lic.color, fontWeight: 800, fontSize: 14 }}>· {revelada ? lic.tipo : "tipo oculto hasta abrir"}</span>
          </div>
          <div style={{ fontSize: 14, color: T.text2, marginTop: 4, lineHeight: 1.45 }}>
            Ejemplo real: <strong style={{ color: "#fff" }}>{lic.ejemplo}</strong> · {lic.precioDetalle}
          </div>
        </div>
        {sub("1 · Predice: ¿qué puertas deja abrir esta licencia?")}
        <div className="sl-puertas">
          {LIBERTADES.map((L, i) => {
            const on = pred[i] ?? false;
            const real = lic.libertades[i]!;
            const col = !revelada ? (on ? L.color : "rgba(255,255,255,0.14)") : on === real ? OK : WARN;
            return (
              <button key={L.n} className="sl-opt sl-puerta" data-on={on} onClick={() => alternarPuerta(i)} disabled={revelada} aria-pressed={on} style={{ ["--slc" as string]: col, background: on ? `${L.color}1c` : "transparent", textAlign: "left" }}>
                <i className={`fa-solid ${L.icono}`} style={{ marginRight: 8, color: L.color }} />
                {L.n} · {L.etq}
                <span style={{ float: "right", marginLeft: 8, color: on ? "#fff" : T.text3 }}>
                  <i className={`fa-solid ${on ? "fa-lock-open" : "fa-lock"}`} />
                </span>
              </button>
            );
          })}
        </div>
        {!revelada && (
          <button className="sl-toggle" onClick={abrirCaja} style={{ marginTop: 10, ["--slc" as string]: lic.color }}>
            <i className="fa-solid fa-box-open" style={{ marginRight: 9, color: lic.color }} />
            Abrir la caja según la licencia
          </button>
        )}
        {revelada && (
          <>
            {nota(<>{aciertos === 4 ? "Predicción perfecta. " : `Acertaste ${aciertos} de 4 puertas. `}{lic.resumen}</>, aciertos === 4 ? OK : WARN, aciertos === 4 ? "fa-circle-check" : "fa-rotate-left")}
            <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
              {LIBERTADES.map((L, i) => {
                const real = lic.libertades[i]!;
                const bien = real === pred[i];
                return (
                  <div key={L.n} style={{ fontSize: 14, lineHeight: 1.45, color: T.text2, padding: "7px 10px", borderRadius: 9, background: "rgba(4,10,22,0.45)", border: `1px solid ${bien ? `${OK}44` : `${WARN}55`}` }}>
                    <strong style={{ color: real ? OK : "#f87171" }}>
                      <i className={`fa-solid ${real ? "fa-lock-open" : "fa-lock"}`} style={{ marginRight: 6 }} />
                      {L.n} · {L.corto}:
                    </strong>{" "}
                    {lic.porque[i]}
                    {!bien && <span style={{ color: WARN }}> (predijiste {pred[i] ? "abierta" : "cerrada"})</span>}
                  </div>
                );
              })}
            </div>
            {nota(<><strong>{ENTREGA_DEF[lic.entrega].etq}.</strong> {ENTREGA_DEF[lic.entrega].explica}</>, T.text2, ENTREGA_DEF[lic.entrega].icono)}
            {lic.entrega === "servidor" && nota(<>Video A8 — «{SAAS_A8.pregunta}» {SAAS_A8.respuesta}.</>, "#d8b4fe", "fa-circle-play")}
            <div className="sl-opts" style={{ marginTop: 12 }}>
              {lic.derivada && (
                <button className="sl-opt sl-derivada" data-on="true" onClick={verDerivada} disabled={derivada} style={{ ["--slc" as string]: lic.color, background: `${lic.color}1f` }}>
                  <i className="fa-solid fa-code-branch" style={{ marginRight: 8 }} />
                  Una empresa modifica y distribuye su versión
                </button>
              )}
              <button className="sl-opt" data-on="false" onClick={reintentarCaja} style={{ ["--slc" as string]: modoCol }}>
                <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                Predecir de nuevo
              </button>
            </div>
            {derivada && lic.derivada && nota(lic.derivada.explica, lic.derivada.libre ? OK : "#fbbf24", "fa-code-branch")}
          </>
        )}
      </>
    );
  } else if (modo === "formatos") {
    control = (
      <>
        <div className="sl-opts">
          {ENTREGABLES.map((e) => {
            const fid = archivo[e.id];
            const res = fid ? FORMATOS.find((f) => f.id === fid)!.resultado : null;
            return (
              <button key={e.id} className="sl-opt sl-ent" data-on={e.id === entregable} onClick={() => elegirEntregable(e.id)} style={{ ["--slc" as string]: modoCol, background: e.id === entregable ? `${modoCol}1f` : "transparent" }}>
                <i className={`fa-solid ${e.icono}`} style={{ marginRight: 7 }} />
                {e.etq}
                {res && <i className="fa-solid fa-circle" style={{ marginLeft: 7, fontSize: 14, color: RESULTADO_DEF[res].color }} />}
              </button>
            );
          })}
        </div>
        {sub(`1 · ¿En qué formato la guardaste en ${ANIO_GUARDADO}?`)}
        <div className="sl-opts">
          {formatosDe(entregable).map((f) => (
            <button key={f.id} className="sl-opt sl-fmt" data-on={f.id === formatoId} onClick={() => elegirFormato(f.id)} style={{ ["--slc" as string]: accent, background: f.id === formatoId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              <span style={{ fontFamily: "ui-monospace, monospace", marginRight: 6 }}>{f.ext}</span>
              <span style={{ fontWeight: 700, color: T.text2 }}>{f.nombre}</span>
              {predDep[f.id] && <i className={`fa-solid ${predDep[f.id] === f.dependencia ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginLeft: 7, color: predDep[f.id] === f.dependencia ? OK : WARN }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>
          Guardado con <strong style={{ color: T.text2 }}>{fmt.original}</strong>.
        </div>
        {sub("2 · ¿De quién depende poder abrirlo?")}
        <div style={{ display: "grid", gap: 7 }}>
          {DEPENDENCIAS.map((d) => {
            const on = miPred === d.id;
            const col = on ? (d.id === fmt.dependencia ? OK : WARN) : miPred && d.id === fmt.dependencia ? OK : modoCol;
            return (
              <button key={d.id} className="sl-opt sl-dep" data-on={on || (!!miPred && d.id === fmt.dependencia)} onClick={() => predecirDep(d.id)} disabled={!!miPred} style={{ ["--slc" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}>
                <i className={`fa-solid ${d.icono}`} style={{ marginRight: 8, color: d.color }} />
                {d.etq}
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text3, marginTop: 3 }}>{d.explica}</div>
              </button>
            );
          })}
        </div>
        {miPred && nota(<>{miPred === fmt.dependencia ? "Bien clasificado. " : `Depende ${DEPENDENCIAS.find((d) => d.id === fmt.dependencia)!.etq.toLowerCase()}. `}{fmt.especificacion}</>, miPred === fmt.dependencia ? OK : WARN)}
        {sub(`3 · Ábrelo en ${ANIO_HOY} sin el programa original`)}
        <button className="sl-toggle sl-abrir" onClick={abrirCapsula} disabled={!miPred || fase !== "cerrada"} style={{ ["--slc" as string]: modoCol }}>
          <i className={`fa-solid ${fase === "abriendo" ? "fa-spinner fa-spin" : fase === "abierta" ? "fa-check" : "fa-hourglass-end"}`} style={{ marginRight: 9, color: modoCol }} />
          {fase === "abriendo" ? `Viajando a ${ANIO_HOY}…` : fase === "abierta" ? `Abierto en ${ANIO_HOY}` : miPred ? "Abrir la cápsula" : "Primero decide de quién depende"}
        </button>
        {fase === "abierta" && (
          <>
            <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
              {fmt.lectores.map((l) => (
                <div key={l.programa} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, color: T.text2, lineHeight: 1.4, padding: "7px 10px", borderRadius: 9, background: "rgba(4,10,22,0.45)", border: `1px solid ${RESULTADO_DEF[l.resultado].color}44` }}>
                  <i className="fa-solid fa-circle" style={{ fontSize: 14, marginTop: 5, color: RESULTADO_DEF[l.resultado].color }} />
                  <span>
                    <strong style={{ color: "#fff" }}>{l.programa}</strong>
                    {l.libre && <span style={{ color: OK, fontWeight: 800 }}> (libre)</span>} — <span style={{ color: RESULTADO_DEF[l.resultado].color }}>{RESULTADO_DEF[l.resultado].etq}</span>. {l.nota}
                  </span>
                </div>
              ))}
            </div>
            {nota(<><strong>¿Y el programa original?</strong> {fmt.destinoOriginal}</>, T.text2, "fa-clock-rotate-left")}
            {nota(fmt.explica, RESULTADO_DEF[fmt.resultado].color, fmt.resultado === "integro" ? "fa-circle-check" : "fa-triangle-exclamation")}
          </>
        )}
        <div style={{ marginTop: 12, fontSize: 14, color: T.text2, ...NUM }}>
          Formatos bien clasificados: <strong style={{ color: "#fff" }}>{clasificadosOk}</strong> de {FORMATOS.length} · archivo escolar:{" "}
          {ENTREGABLES.map((e) => {
            const fid = archivo[e.id];
            const fx = fid ? FORMATOS.find((f) => f.id === fid) : undefined;
            return (
              <span key={e.id} style={{ marginRight: 6, color: fx ? RESULTADO_DEF[fx.resultado].color : T.text3, fontFamily: "ui-monospace, monospace" }}>
                {fx ? fx.ext : "—"}
              </span>
            );
          })}
        </div>
      </>
    );
  } else {
    control = (
      <>
        {sub(`Antes de calcular · ${PRED_EQUIPOS} equipos durante ${PRED_ANIOS} años`)}
        <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, marginBottom: 8, lineHeight: 1.45 }}>¿Qué cuesta más en ofimática: comprar {OFI_COMPRA.producto} o suscribirse a {OFI_SUSC.producto}?</div>
        <div className="sl-opts">
          {PRED_OPCIONES.map((o) => {
            const on = predCosto === o.id;
            const col = on ? (o.id === PRED_CORRECTA ? OK : WARN) : predCosto && o.id === PRED_CORRECTA ? OK : modoCol;
            return (
              <button key={o.id} className="sl-opt sl-predc" data-on={on || (!!predCosto && o.id === PRED_CORRECTA)} onClick={() => predecirCosto(o.id)} disabled={!!predCosto} style={{ ["--slc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                {o.etq}
              </button>
            );
          })}
        </div>
        {predCosto && (
          <>
            {nota(
              <>
                {predCosto === PRED_CORRECTA ? "Bien predicho. " : "No. "}
                Comprar: {PRED_EQUIPOS} × US${num(OFI_COMPRA.unico, 2)} = US${num(PRED_COMPRA_USD, 2)}. Suscribirse: {PRED_EQUIPOS} × US${num(OFI_SUSC.mensual)} × 12 × {PRED_ANIOS} = US${num(PRED_SUSC_USD)}. Por equipo, la suscripción ya cuesta más que la compra a partir del mes {MES_EQUILIBRIO} (US${num(OFI_COMPRA.unico, 2)} ÷ US${num(OFI_SUSC.mensual)} al mes). A cambio incluye versiones nuevas y servicios en la nube.
              </>,
              predCosto === PRED_CORRECTA ? OK : WARN,
            )}
            {!prediccionComprobada && (
              <button className="sl-toggle sl-comprobar" onClick={comprobarPrediccion} style={{ marginTop: 10, ["--slc" as string]: modoCol }}>
                <i className="fa-solid fa-school" style={{ marginRight: 9, color: modoCol }} />
                Comprobarlo en la sala: {PRED_EQUIPOS} equipos y {PRED_ANIOS} años
              </button>
            )}
          </>
        )}
        {sub("La sala")}
        <Deslizador label="Número de equipos" icon="fa-desktop" colr={modoCol} valor={`${equipos} equipos`} min={EQ_MIN} max={EQ_MAX} step={5} value={equipos} onChange={setEquipos} />
        <Deslizador label="Años de uso" icon="fa-calendar" colr={modoCol} valor={`${anios} ${anios === 1 ? "año" : "años"}`} min={1} max={ANIOS_MAX} step={1} value={anios} onChange={setAnios} />
        {sub("Ofimática: lo que llevas gastado, año tras año")}
        <GraficaCosto equipos={equipos} anios={anios} />
        {NECESIDADES.map((n, k) => {
          const o = opcionDe(n.id);
          return (
            <div key={n.id}>
              {sub(`${n.etq} · $${num(costosMXN[k]!)} MXN`)}
              <div className="sl-opts">
                {n.opciones.map((op) => {
                  const on = rutas[n.id] === op.ruta;
                  const col = RUTA_DEF[op.ruta].color;
                  return (
                    <button key={op.ruta} className="sl-opt sl-ruta" data-on={on} onClick={() => elegirRuta(n.id, op.ruta)} style={{ ["--slc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                      <i className={`fa-solid ${RUTA_DEF[op.ruta].icono}`} style={{ marginRight: 7, color: col }} />
                      {op.producto}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 14, color: T.text3, marginTop: 5, lineHeight: 1.45 }}>{o.precio}</div>
              {sinPago && nota(o.sinPago, o.ruta === "suscripcion" ? "#f87171" : OK, o.ruta === "suscripcion" ? "fa-lock" : "fa-circle-check")}
            </div>
          );
        })}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, marginTop: 14 }}>
          <Dato label="Total en licencias" value={`$${num(totalMXN)} MXN`} col="#fff" />
          <Dato label="Con software libre" value={`$${num(libreTotalMXN)} MXN`} col={OK} />
        </div>
        <div style={{ color: T.text3, marginTop: 6 }}>≈ US${num(totalMXN / TC_MXN)} · tipo de cambio ilustrativo de {num(TC_MXN, 2)} pesos por dólar</div>
        <button className="sl-toggle sl-pago" onClick={alternarPago} style={{ marginTop: 10, ["--slc" as string]: sinPago ? OK : "#f87171" }}>
          <i className={`fa-solid ${sinPago ? "fa-credit-card" : "fa-ban"}`} style={{ marginRight: 9, color: sinPago ? OK : "#f87171" }} />
          {sinPago ? "Volver a pagar" : "Dejar de pagar las suscripciones"}
        </button>
        {sinPago && !haySusc && nota("Elige al menos una suscripción para ver el efecto de dejar de pagar.", "#fbbf24")}
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Precios de lista en EUA, uno por equipo. Muchas empresas ofrecen licencias educativas gratuitas o con descuento, pero suelen terminar cuando dejas la escuela. El software libre no cobra licencias; la capacitación y el soporte técnico cuestan en cualquier ruta.
        </div>
      </>
    );
  }

  const css = `
    .sl-opts { display:flex; flex-wrap:wrap; gap:8px; }
    .sl-puertas { display:grid; gap:8px; }
    .sl-opt { cursor:pointer; border:1px solid var(--slc); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
    .sl-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
    .sl-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
    .sl-opt:disabled { cursor:default; }
    .sl-opt:disabled[data-on="false"] { opacity:0.55; }
    .sl-toggle { width:100%; cursor:pointer; border:1px solid var(--slc); border-radius:11px; padding:12px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
    .sl-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
    .sl-toggle:disabled { cursor:default; opacity:0.6; }
    .sl-opt:focus-visible, .sl-toggle:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  `;

  const caja = (borde: string, fondo: string): React.CSSProperties => ({ borderRadius: 14, padding: "14px 16px", border: `1px solid ${borde}`, background: fondo });

  return (
    <>
      <style>{css}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <SoftwareScene
              vista={modo}
              modoColor={modoCol}
              resetNonce={resetNonce}
              licenciaId={licId}
              prediccion={pred}
              revelada={revelada}
              derivada={derivada}
              formatoId={formatoId}
              fase={fase}
              archivo={archivo}
              equipos={equipos}
              anios={anios}
              rutas={rutas}
              sinPago={sinPago}
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
        lectura={chipVivo}
        objetivos={objetivos.map((o) => ({ txt: o.t, done: o.done }))}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Controles",
            icono: "fa-sliders",
            contenido: (
              <Bloque titulo={`${def.etq} — ${def.subtitulo}`} icono={def.icono}>
                <div style={{ color: T.text2, ...NUM }}>{pie}</div>
                {control}
              </Bloque>
            ),
          },
          {
            id: "reto",
            etiqueta: "Reto",
            icono: "fa-trophy",
            contenido: (
              <>
                <LibreGratisCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
                <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Conoces las libertades del software libre." />
                <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
                  <Eyebrow>
                    <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                    Completa el texto (A6)
                  </Eyebrow>
                  <div style={{ marginTop: 12 }}>
                    <CompletaTexto
                      data={HUECOS_A6}
                      accent={accent}
                      rgba={color.rgba}
                      completado={textoOk}
                      onCompletado={() => {
                        setTextoOk(true);
                        sfx(true);
                      }}
                      onAcierto={blip}
                      onError={() => sfx(false)}
                    />
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
                <Bloque titulo="¿Qué programas instala tu escuela?" icono="fa-lock-open">
                  <div style={{ color: T.text2 }}>{PROBLEMA}</div>
                </Bloque>
                <Bloque titulo="Lectura A1" icono="fa-book-open">
                  <div style={caja("#7dd3fc55", "rgba(125,211,252,0.07)")}>
                    <div style={{ color: "#fff", fontWeight: 800, marginBottom: 10 }}>{TITULO_A1}</div>
                    <div style={{ display: "grid", gap: 9 }}>
                      {LECTURA_A1.map((p, i) => (
                        <div key={i} style={{ color: T.text2 }}>{p}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                    {PREGUNTAS.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                    <li>
                      <strong style={{ color: "#fff" }}>Reflexión A3:</strong> {REFLEXION_A3}
                    </li>
                  </ul>
                </Bloque>
                <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                  <div style={{ display: "grid", gap: 9 }}>
                    {INSTRUCCIONES.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ color: "#fff", minWidth: 0 }}>{p}</div>
                      </div>
                    ))}
                  </div>
                </Bloque>
                <Bloque titulo="Mapa de alternativas libres" icono="fa-map">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,210px),1fr))", gap: 8 }}>
                    {[
                      ["Windows / macOS", "GNU/Linux (Ubuntu, Debian, Linux Mint)"],
                      ["Microsoft Office", "LibreOffice (Writer, Calc, Impress)"],
                      ["Adobe Photoshop", "GIMP · Krita"],
                      ["Adobe Illustrator / CorelDRAW", "Inkscape"],
                      ["Autodesk Maya / 3ds Max", "Blender"],
                      ["Google Chrome", "Firefox"],
                    ].map(([priv, libre]) => (
                      <div key={priv} style={{ lineHeight: 1.4, padding: "8px 10px", borderRadius: 9, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                        <div style={{ color: T.text3 }}>{priv}</div>
                        <div style={{ color: "#fff", fontWeight: 800 }}>
                          <i className="fa-solid fa-arrow-right" style={{ marginRight: 6, color: OK }} />
                          {libre}
                        </div>
                      </div>
                    ))}
                  </div>
                </Bloque>
                <Bloque titulo="Hechos (quiz A4)" icono="fa-circle-question">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                    {HECHOS.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </Bloque>
                <Bloque titulo="Glosario (A5)" icono="fa-book">
                  <div style={{ display: "grid", gap: 8 }}>
                    {GLOSARIO.map((gi, i) => (
                      <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                        <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                        <span style={{ color: T.text2 }}>{gi.definicion}</span>
                        <div style={{ color: T.text3, marginTop: 4 }}>
                          <i className="fa-solid fa-laptop-code" style={{ marginRight: 6, color: accent }} />
                          {gi.ejemplo}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: T.text2 }}>
                    <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
                  </div>
                </Bloque>
                <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9, color: T.text2 }}>
                    {IDEAS.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Bloque>
                <Bloque titulo="Ficha teórica" icono="fa-book">
                  <FichaTeorica data={SOFTWARE_LIBRE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
                <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                  La lectura A1 con sus preguntas, la reflexión A3, los hechos del quiz A4, el glosario A5, la pregunta del video A8, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma. Las
                  seis licencias, los programas de ejemplo, los formatos y lo que pasó con sus programas son <strong>reales</strong> (textos de las licencias, estándares ISO/W3C, avisos de Adobe, Apple y Microsoft). Lo que
                  cada lector logra abrir resume el comportamiento típico; un archivo concreto puede variar. Los precios son de lista en EUA con su año; el tipo de cambio y «un usuario por equipo» son <strong>ilustrativos</strong>, y
                  no incluyen descuentos educativos. Fuente: {FUENTE}
                </p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
