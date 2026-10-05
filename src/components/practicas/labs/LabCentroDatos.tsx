"use client";

/**
 * Laboratorio 3D — "Centros de datos y la huella de la nube".
 * Práctica anclada a CD-I-P03-A2 (quiz «Datos, poder y colonialismo digital»)
 * y CD-I-P03-A6 (completa el texto); progresión 3 de la UAC CD-I (Ciudadanía
 * digital). El marco teórico es la lectura A1, la reflexión sale de A3 y A7,
 * los hechos del quiz A4 y el glosario del A5; la tarjeta de estrellas se
 * inspira en la actividad A9 de relacionar conceptos.
 *
 * Tres modos:
 *  (1) Dentro de la nube — elegir cómo enfriar un campus de centros de datos
 *      en un clima como el de Querétaro y presentar un diseño que cumpla un
 *      límite de agua y de PUE.
 *  (2) Tu huella de datos — decidir los permisos de cinco apps, vivir un día y
 *      ver qué datos salen, a quién llegan y qué se puede inferir.
 *  (3) Brecha digital — predecir quién queda fuera de un trámite solo en línea
 *      (acceso real de la ENDUTIH 2025) y diseñar la política pública.
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
import { CENTRO_DATOS_FICHA } from "./centro-datos-ficha";
import type { VistaCentro } from "./CentroDatosScene";
import {
  type Modo,
  type Enfriamiento,
  type AppId,
  type Permisos,
  type PermisoBool,
  type Ubic,
  type Politica,
  type GrupoId,
  type Concepto,
  type ResumenDia,
  MODOS,
  MODOS_DEF,
  ENFRIAMIENTOS,
  ENFRIAMIENTO_DEF,
  enfriamiento,
  pueInstantaneo,
  anual,
  RETO_CENTRO,
  T_RECOM_MIN,
  T_RECOM_MAX,
  T_SET_MIN,
  T_SET_MAX,
  T_EXT_MIN,
  T_EXT_MAX,
  IT_MIN,
  IT_MAX,
  FACTOR_EMISION,
  LITROS_PERSONA_DIA,
  APPS,
  APPS_ORDEN,
  PERMISO_DEF,
  PERMISOS_BOOL,
  PERMISOS_TODO,
  PERMISOS_NADA,
  funciona,
  sobrantes,
  resumenDia,
  DESTINO_DEF,
  INFERENCIA_DEF,
  T_DIA,
  GRUPOS,
  GRUPOS_ORDEN,
  POLITICAS_ORDEN,
  POLITICA_DEF,
  MAX_POLITICAS,
  BARRERAS,
  BARRERA_DEF,
  resultados,
  META_BRECHA,
  CONCEPTOS,
  CONCEPTO_ETQ,
  SITUACIONES,
  rondaSituaciones,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  NOTA_RECUADRO,
  PREGUNTAS,
  REFLEXION_A3,
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
} from "./centro-datos-data";

const CentroScene = dynamic(() => import("./CentroDatosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-server fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Encendiendo el centro de datos en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-centro-datos-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaSituaciones(mulberry32(7));

const copiaPermisos = (p: Record<AppId, Permisos>): Record<AppId, Permisos> => ({
  mapas: { ...p.mapas },
  videos: { ...p.videos },
  mensajes: { ...p.mensajes },
  tienda: { ...p.tienda },
  juego: { ...p.juego },
});

/* ── Tarjeta de estrellas: ¿qué concepto es? ──────────────────────────── */
function ConceptoCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = SITUACIONES[ronda[pos] ?? 0]!;

  const responder = (c: Concepto) => {
    if (resuelto !== null) return;
    const ok = c === actual.concepto;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es «${CONCEPTO_ETQ[c]}». Pista: ${actual.porque}`);
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
    setRonda(rondaSituaciones(Math.random));
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
          ¿Qué concepto es? (inspirado en A9)
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
            Situación {pos + 1} de {ronda.length} · ¿qué concepto de la progresión describe?
          </div>
          <div className="cn-situacion" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            «{actual.texto}»
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))", gap: 8 }}>
            {CONCEPTOS.map((c) => (
              <button key={c} className="cn-opt cn-concepto" data-on="true" onClick={() => responder(c)} style={{ ["--cnc" as string]: accent }}>
                {CONCEPTO_ETQ[c]}
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

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabCentroDatos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("centro");

  // ── Centro de datos
  const [tipo, setTipo] = useState<Enfriamiento>("torre");
  const [tExt, setTExt] = useState(24);
  const [tSet, setTSet] = useState(22);
  const [itMW, setItMW] = useState(30);
  const [tiposVistos, setTiposVistos] = useState<Set<Enfriamiento>>(() => new Set(["torre"]));
  const [dictamenCentro, setDictamenCentro] = useState<{ ok: boolean; txt: string } | null>(null);
  const [retoCentro, setRetoCentro] = useState(false);

  // ── Huella
  const [permisos, setPermisos] = useState<Record<AppId, Permisos>>(() => copiaPermisos(PERMISOS_TODO));
  const [appSel, setAppSel] = useState<AppId>("mapas");
  const [diaNonce, setDiaNonce] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [ultimoDia, setUltimoDia] = useState<ResumenDia | null>(null);
  const [diaTodo, setDiaTodo] = useState(false);
  const [diaNada, setDiaNada] = useState(false);
  const [diaMinimo, setDiaMinimo] = useState(false);
  const [explicaPermiso, setExplicaPermiso] = useState<string | null>(null);

  // ── Brecha
  const [prediccion, setPrediccion] = useState<GrupoId | null>(null);
  const [politicas, setPoliticas] = useState<Politica[]>([]);
  const [lanzado, setLanzado] = useState(false);
  const [vioBase, setVioBase] = useState(false);
  const [metaBrecha, setMetaBrecha] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
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

  /* ── Centro ────────────────────────────────────────────────────────── */
  const est = enfriamiento(tipo, tExt, tSet);
  const pueAhora = pueInstantaneo(tipo, tExt, tSet);
  const anio = anual(tipo, itMW, tSet);
  const anioReto = anual(tipo, RETO_CENTRO.itMW, tSet);
  const enRango = tSet >= T_RECOM_MIN && tSet <= T_RECOM_MAX;
  const comparativa = ENFRIAMIENTOS.map((e) => ({ e, a: anual(e, itMW, tSet) }));

  const elegirTipo = (e: Enfriamiento) => {
    setTipo(e);
    setTiposVistos((s) => new Set(s).add(e));
    setDictamenCentro(null);
    blip();
  };
  const presentarDiseno = () => {
    const fallas: string[] = [];
    if (!enRango) fallas.push(`la temperatura del pasillo frío (${tSet} °C) está fuera del rango recomendado de ${T_RECOM_MIN} a ${T_RECOM_MAX} °C, así que los servidores corren riesgo`);
    if (anioReto.pue > RETO_CENTRO.pueMax) fallas.push(`el PUE anual (${num(anioReto.pue, 2)}) supera ${num(RETO_CENTRO.pueMax, 2)}: gasta demasiada electricidad fuera de los servidores`);
    if (anioReto.aguaM3 > RETO_CENTRO.aguaMaxM3) fallas.push(`el agua (${num(anioReto.aguaM3)} m³ al año) supera el límite de ${num(RETO_CENTRO.aguaMaxM3)} m³ del acuífero`);
    const ok = fallas.length === 0;
    sfx(ok);
    if (ok) {
      setRetoCentro(true);
      setDictamenCentro({
        ok: true,
        txt: `Aprobado. Con ${ENFRIAMIENTO_DEF[tipo].corto.toLowerCase()} y el pasillo frío a ${tSet} °C, el campus de ${RETO_CENTRO.itMW} MW tendría un PUE anual de ${num(anioReto.pue, 2)} y usaría ${num(anioReto.aguaM3)} m³ de agua al año. ${tSet >= 24 ? "Subir la temperatura dentro del rango recomendado alarga las horas de enfriamiento libre: ahorra agua y energía a la vez." : ""}`,
      });
    } else setDictamenCentro({ ok: false, txt: `El municipio lo rechaza: ${fallas.join("; ")}.` });
  };

  /* ── Huella ────────────────────────────────────────────────────────── */
  const app = APPS[appSel];
  const pApp = permisos[appSel];
  const estadoApp = funciona(app, pApp);
  const sobraApp = sobrantes(app, pApp);
  const previo = resumenDia(permisos);

  const setUbic = (u: Ubic) => {
    if (corriendo) return;
    setPermisos((p) => ({ ...p, [appSel]: { ...p[appSel], ubicacion: u } }));
    setExplicaPermiso(app.porque.ubicacion ?? null);
    blip();
  };
  const togglePermiso = (k: PermisoBool) => {
    if (corriendo || !app.pide[k]) return;
    setPermisos((p) => ({ ...p, [appSel]: { ...p[appSel], [k]: !p[appSel][k] } }));
    setExplicaPermiso(app.porque[k] ?? null);
    blip();
  };
  const todoPermitido = () => {
    if (corriendo) return;
    setPermisos(copiaPermisos(PERMISOS_TODO));
    setExplicaPermiso(null);
    blip();
  };
  const todoNegado = () => {
    if (corriendo) return;
    setPermisos(copiaPermisos(PERMISOS_NADA));
    setExplicaPermiso(null);
    blip();
  };
  const vivirDia = () => {
    if (corriendo) return;
    const foto = copiaPermisos(permisos);
    const r = resumenDia(foto);
    setDiaNonce((n) => n + 1);
    setCorriendo(true);
    setUltimoDia(null);
    blip();
    despues(T_DIA + 1200, () => {
      setCorriendo(false);
      setUltimoDia(r);
      const esTodo = APPS_ORDEN.every((id) => {
        const a = foto[id];
        const pide = APPS[id].pide;
        return a.ubicacion === pide.ubicacion && PERMISOS_BOOL.every((k) => a[k] === pide[k]);
      });
      const esNada = APPS_ORDEN.every((id) => foto[id].ubicacion === "no" && PERMISOS_BOOL.every((k) => !foto[id][k]));
      if (esTodo) setDiaTodo(true);
      if (esNada) setDiaNada(true);
      if (r.appsRotas.length === 0 && r.sobrantes === 0) setDiaMinimo(true);
      sfx(r.appsRotas.length === 0 && r.sobrantes === 0);
    });
  };

  /* ── Brecha ────────────────────────────────────────────────────────── */
  const res = resultados(politicas);
  const minimo = Math.min(...res.map((r) => r.completa));
  const maximo = Math.max(...res.map((r) => r.completa));
  const peor = res.reduce((a, b) => (b.completa < a.completa ? b : a));
  const resBase = resultados([]);
  const peorBase = resBase.reduce((a, b) => (b.completa < a.completa ? b : a)).grupo;

  const predecir = (g: GrupoId) => {
    if (prediccion) return;
    setPrediccion(g);
    sfx(g === peorBase);
  };
  const togglePolitica = (p: Politica) => {
    setPoliticas((xs) => (xs.includes(p) ? xs.filter((x) => x !== p) : xs.length >= MAX_POLITICAS ? xs : [...xs, p]));
    setLanzado(false);
    blip();
  };
  const lanzar = () => {
    if (!prediccion) return;
    setLanzado(true);
    blip();
    const pol = [...politicas];
    const r = resultados(pol);
    despues(2600, () => {
      if (pol.length === 0) setVioBase(true);
      const min = Math.min(...r.map((x) => x.completa));
      if (min >= META_BRECHA) {
        setMetaBrecha(true);
        sfx(true);
      }
    });
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "centro") {
      setTExt(24);
      setTSet(22);
      setItMW(30);
      setDictamenCentro(null);
    }
    if (modo === "huella" && !corriendo) {
      setUltimoDia(null);
      setDiaNonce(0);
    }
    if (modo === "brecha") {
      setPoliticas([]);
      setLanzado(false);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Elige el enfriamiento adiabático y sube el pasillo frío a 25–27 °C: mira cuánta agua te ahorras al año", done: tipo === "adiabatico" && tSet >= 25 && tSet <= T_RECOM_MAX },
    { t: "Probar los tres sistemas de enfriamiento y comparar agua contra electricidad", done: tiposVistos.size === ENFRIAMIENTOS.length },
    { t: `Presentar un campus de ${RETO_CENTRO.itMW} MW que cumpla el límite de agua y de PUE`, done: retoCentro },
    { t: "Vivir un día aceptando todo lo que piden las apps", done: diaTodo },
    { t: "Vivir un día negando todos los permisos y descubrir qué dato sigue saliendo", done: diaNada },
    { t: "Vivir un día con mínimo privilegio: todas las apps funcionan y no sobra ningún permiso", done: diaMinimo },
    { t: "Predecir qué grupo queda más fuera y lanzar el trámite solo en línea", done: vioBase && prediccion !== null },
    { t: `Diseñar medidas con las que todos los grupos lleguen al ${num(META_BRECHA * 100)} %`, done: metaBrecha },
    { t: "Relacionar situaciones con conceptos y ganar estrellas", done: clasifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaCentro = modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "centro") {
    chipVivo = `PUE ${num(pueAhora, 2)} · ${num((itMW * est.litrosPorMWh) / 1000, 1)} m³/h de agua`;
    const regimen =
      est.regimen === "libre"
        ? "Hoy basta el aire o el agua de afuera: enfriamiento libre, sin compresor."
        : est.regimen === "evaporativo"
          ? "Hace calor: el aire se enfría evaporando agua, sin compresor."
          : est.regimen === "mixto"
            ? "El enfriamiento libre ya no alcanza y un compresor ayuda."
            : `El compresor trabaja todo el tiempo (COP ${num(est.cop ?? 0, 1)}: mueve ${num(est.cop ?? 0, 1)} kWh de calor por cada kWh que consume).`;
    pie = `${regimen} ${enRango ? "" : `Con ${tSet} °C en el pasillo frío los servidores están fuera del rango recomendado.`} Al año: PUE ${num(anio.pue, 2)}, ${num(anio.aguaM3)} m³ de agua y ${num(anio.co2t)} t de CO₂e.`;
  } else if (modo === "huella") {
    chipVivo = corriendo ? "viviendo el día…" : ultimoDia ? `${num(ultimoDia.total)} paquetes · ${ultimoDia.inferencias.length} cosas que saben de ti` : `${num(previo.total)} paquetes previstos · ${app.etq.toLowerCase()}`;
    pie = corriendo
      ? "Cada cubo es un envío: rojo ubicación, amarillo contactos, verde fotos, azul micrófono, rosa rastreo y blanco atención (qué miras y cuánto)."
      : ultimoDia
        ? `${num(ultimoDia.extranjero, 0)} % de tus datos llegó a empresas con sede fuera de México. ${ultimoDia.appsRotas.length > 0 ? `Sin los permisos que necesitan no funcionaron: ${ultimoDia.appsRotas.map((a) => APPS[a].etq.toLowerCase()).join(", ")}.` : "Todas las apps funcionaron."}`
        : `${app.uso} Decide sus permisos y vive el día.`;
  } else {
    chipVivo = lanzado ? `el grupo más bajo completa ${num(minimo * 100)} %` : `${politicas.length} de ${MAX_POLITICAS} medidas elegidas`;
    pie = lanzado
      ? `${GRUPOS[peor.grupo].etq}: ${num(peor.completa * 100)} % completó. La distancia entre el grupo que más y el que menos completó es de ${num((maximo - minimo) * 100)} puntos.`
      : prediccion
        ? "Elige hasta tres medidas (o ninguna, para ver el trámite solo en línea) y lánzalo."
        : "Un programa abre su registro solo en línea, con formulario para computadora y 5 días de plazo. Antes de lanzarlo, predice qué grupo queda más fuera.";
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
  const dato = (etq: string, valor: string, col = "#fff") => <Dato label={etq} value={valor} col={col} />;
  const slider = (etq: string, unidad: string, min: number, max: number, paso: number, valor: number, onChange: (v: number) => void, col: string, icono: string, marca?: string) => (
    <Deslizador label={etq} icon={icono} colr={col} valor={`${valor} ${unidad}`} min={min} max={max} step={paso} value={valor} onChange={onChange} hintL={marca} />
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "centro") {
    control = (
      <>
        {sub("1 · Sistema de enfriamiento")}
        <div className="cn-opts">
          {ENFRIAMIENTOS.map((e) => (
            <button key={e} className="cn-opt cn-tipo" data-on={e === tipo} onClick={() => elegirTipo(e)} style={{ ["--cnc" as string]: modoCol, background: e === tipo ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${ENFRIAMIENTO_DEF[e].icono}`} style={{ marginRight: 8 }} />
              {ENFRIAMIENTO_DEF[e].etq}
              {tiposVistos.has(e) && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {nota(ENFRIAMIENTO_DEF[tipo].explica, T.text2, "fa-lightbulb")}
        {sub("2 · Condiciones")}
        {slider("Temperatura exterior", "°C", T_EXT_MIN, T_EXT_MAX, 1, tExt, (v) => setTExt(v), "#fb923c", "fa-sun", "Querétaro: mínima promedio de enero 6 °C, máxima de mayo 30 °C")}
        {slider("Pasillo frío (entrada a servidores)", "°C", T_SET_MIN, T_SET_MAX, 1, tSet, (v) => { setTSet(v); setDictamenCentro(null); }, enRango ? "#38bdf8" : "#ef4444", "fa-temperature-arrow-down", `recomendado ${T_RECOM_MIN}–${T_RECOM_MAX} °C`)}
        {slider("Carga de los servidores", "MW", IT_MIN, IT_MAX, 5, itMW, (v) => setItMW(v), "#facc15", "fa-microchip")}
        <div className="cn-datos" style={{ marginTop: 14 }}>
          {dato("PUE ahora", num(pueAhora, 2), modoCol)}
          {dato("PUE anual", num(anio.pue, 2), modoCol)}
          {dato("Agua al año", `${num(anio.aguaM3)} m³`, "#38bdf8")}
          {dato("CO₂e al año", `${num(anio.co2t)} t`, "#cbd5e1")}
        </div>
        <div style={{ fontSize: 14, color: T.text2, marginTop: 8, lineHeight: 1.5, ...NUM }}>
          PUE = energía total ÷ energía de los servidores = {num(anio.totalMWh)} MWh ÷ {num(anio.itMWh)} MWh = <strong style={{ color: "#fff" }}>{num(anio.pue, 2)}</strong>. El agua alcanzaría para{" "}
          <strong style={{ color: "#fff" }}>{num(anio.personasAgua)}</strong> personas con {LITROS_PERSONA_DIA} L diarios. Emisiones con {num(FACTOR_EMISION, 3)} t CO₂e/MWh (red eléctrica de México, 2024).
        </div>
        {sub("Comparación anual con estas mismas condiciones")}
        <div className="cn-tabla" role="table" aria-label="Comparación de sistemas de enfriamiento">
          <div className="cn-fila cn-cab" role="row">
            <span role="columnheader">Sistema</span>
            <span role="columnheader">PUE</span>
            <span role="columnheader">Agua (m³)</span>
            <span role="columnheader">MWh</span>
          </div>
          {comparativa.map(({ e, a }) => (
            <div key={e} className="cn-fila" role="row" data-on={e === tipo}>
              <span role="cell">{ENFRIAMIENTO_DEF[e].corto}</span>
              <span role="cell">{tiposVistos.has(e) ? num(a.pue, 2) : "?"}</span>
              <span role="cell">{tiposVistos.has(e) ? num(a.aguaM3) : "?"}</span>
              <span role="cell">{tiposVistos.has(e) ? num(a.totalMWh) : "?"}</span>
            </div>
          ))}
        </div>
        {tiposVistos.size === ENFRIAMIENTOS.length && nota("No hay enfriamiento gratis: la torre ahorra electricidad a cambio de mucha agua; el sistema por aire casi no usa agua pero gasta más electricidad (y esa electricidad también usa agua en las centrales). En clima seco, el aire exterior con evaporación gana en ambos, pero solo si los servidores aceptan aire más cálido.", OK, "fa-scale-balanced")}
        {sub(`3 · Reto: campus de ${RETO_CENTRO.itMW} MW en un municipio con acuífero en déficit`)}
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          El municipio pide <strong style={{ color: "#fff" }}>PUE anual ≤ {num(RETO_CENTRO.pueMax, 2)}</strong>, <strong style={{ color: "#fff" }}>agua ≤ {num(RETO_CENTRO.aguaMaxM3)} m³ al año</strong> y servidores dentro del rango recomendado. Con tu diseño actual a {RETO_CENTRO.itMW} MW: PUE {num(anioReto.pue, 2)} y {num(anioReto.aguaM3)} m³.
        </div>
        <div className="cn-opts" style={{ marginTop: 10 }}>
          <button className="cn-toggle cn-presentar" onClick={presentarDiseno} style={{ ["--cnc" as string]: accent }}>
            <i className="fa-solid fa-file-signature" style={{ marginRight: 9, color: accent }} />
            Presentar el diseño al municipio
          </button>
        </div>
        {dictamenCentro && nota(dictamenCentro.txt, dictamenCentro.ok ? OK : WARN, dictamenCentro.ok ? "fa-circle-check" : "fa-circle-xmark")}
      </>
    );
  } else if (modo === "huella") {
    control = (
      <>
        <div className="cn-opts">
          {APPS_ORDEN.map((id) => {
            const a = APPS[id];
            const f = funciona(a, permisos[id]);
            const s = sobrantes(a, permisos[id]).length;
            return (
              <button key={id} className="cn-opt cn-app" data-on={id === appSel} onClick={() => { setAppSel(id); setExplicaPermiso(null); blip(); }} style={{ ["--cnc" as string]: a.color, background: id === appSel ? `${a.color}1f` : "transparent" }}>
                <i className={`fa-solid ${a.icono}`} style={{ marginRight: 8, color: a.color }} />
                {a.etq}
                {!f.ok ? <i className="fa-solid fa-triangle-exclamation" style={{ marginLeft: 7, color: WARN }} /> : s === 0 ? <i className="fa-solid fa-shield-halved" style={{ marginLeft: 7, color: OK }} /> : <span style={{ marginLeft: 7, color: T.text3 }}>{s}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>
            <i className={`fa-solid ${app.icono}`} style={{ marginRight: 8, color: app.color }} />
            {app.etq} · empresa con sede en {app.sede}
          </div>
          <div style={{ fontSize: 14, color: T.text2, marginTop: 4, lineHeight: 1.45 }}>
            {app.uso} La usas {app.minutos} minutos al día. {app.anuncios ? "Vive de la publicidad." : "No vive de la publicidad."}
          </div>
        </div>
        {sub("Permisos (lo que la app pide al instalarla)")}
        <div className="cn-permiso">
          <span className="cn-permiso-etq">
            <i className={`fa-solid ${PERMISO_DEF.ubicacion.icono}`} style={{ color: PERMISO_DEF.ubicacion.color, marginRight: 8 }} />
            Ubicación
          </span>
          <div className="cn-seg" role="radiogroup" aria-label="Ubicación">
            {(["siempre", "uso", "no"] as Ubic[]).map((u) => (
              <button key={u} role="radio" aria-checked={pApp.ubicacion === u} className="cn-seg-btn cn-ubic" data-on={pApp.ubicacion === u} disabled={corriendo} onClick={() => setUbic(u)}>
                {u === "siempre" ? "Siempre" : u === "uso" ? "Al usarla" : "No"}
              </button>
            ))}
          </div>
        </div>
        {PERMISOS_BOOL.map((k) => {
          const pide = app.pide[k];
          const on = pApp[k];
          return (
            <div key={k} className="cn-permiso" data-pide={pide}>
              <span className="cn-permiso-etq">
                <i className={`fa-solid ${PERMISO_DEF[k].icono}`} style={{ color: pide ? PERMISO_DEF[k].color : T.text3, marginRight: 8 }} />
                {PERMISO_DEF[k].etq}
                {app.necesita[k] && <span style={{ marginLeft: 6, fontSize: 14, color: OK, fontWeight: 900 }}>la necesita</span>}
              </span>
              {pide ? (
                <button role="switch" aria-checked={on} aria-label={PERMISO_DEF[k].etq} className="cn-switch" data-on={on} disabled={corriendo} onClick={() => togglePermiso(k)}>
                  <span />
                </button>
              ) : (
                <span style={{ fontSize: 14, color: T.text3 }}>no lo pide</span>
              )}
            </div>
          );
        })}
        {explicaPermiso && nota(explicaPermiso, T.text2, "fa-lightbulb")}
        {nota(
          !estadoApp.ok ? `Así no funciona: le falta ${estadoApp.falta.join(" y ").toLowerCase()}.` : sobraApp.length > 0 ? `Funciona, pero le sobran ${sobraApp.length} ${sobraApp.length === 1 ? "permiso" : "permisos"}: ${sobraApp.map((x) => PERMISO_DEF[x].etq.toLowerCase()).join(", ")}.` : "Mínimo privilegio: funciona con lo indispensable.",
          !estadoApp.ok ? WARN : sobraApp.length > 0 ? "#fbbf24" : OK,
          !estadoApp.ok ? "fa-triangle-exclamation" : sobraApp.length > 0 ? "fa-circle-exclamation" : "fa-shield-halved",
        )}
        <div className="cn-opts" style={{ marginTop: 12 }}>
          <button className="cn-opt" data-on="false" onClick={todoPermitido} disabled={corriendo} style={{ ["--cnc" as string]: modoCol }}>
            <i className="fa-solid fa-check-double" style={{ marginRight: 8 }} />
            Aceptar todo (como al instalar)
          </button>
          <button className="cn-opt" data-on="false" onClick={todoNegado} disabled={corriendo} style={{ ["--cnc" as string]: modoCol }}>
            <i className="fa-solid fa-ban" style={{ marginRight: 8 }} />
            Negar todo
          </button>
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 8, ...NUM }}>
          Con esta configuración: {num(previo.total)} paquetes al día · {previo.sobrantes} permisos sobrantes · {previo.appsRotas.length} apps que no funcionan
        </div>
        <button className="cn-toggle cn-vivir" onClick={vivirDia} disabled={corriendo} style={{ marginTop: 10, ["--cnc" as string]: accent }}>
          <i className={`fa-solid ${corriendo ? "fa-spinner fa-spin" : "fa-play"}`} style={{ marginRight: 9, color: accent }} />
          {corriendo ? "Viviendo el día…" : "Vivir el día con estos permisos"}
        </button>
        {ultimoDia && (
          <>
            {sub("Resultado del día")}
            <div className="cn-datos">
              {dato("Paquetes", num(ultimoDia.total), modoCol)}
              {dato(DESTINO_DEF.anunciantes.etq, num(ultimoDia.porDestino.anunciantes), DESTINO_DEF.anunciantes.color)}
              {dato(DESTINO_DEF.corredor.etq, num(ultimoDia.porDestino.corredor), DESTINO_DEF.corredor.color)}
              {dato("A empresas extranjeras", `${num(ultimoDia.extranjero)} %`, "#fbbf24")}
            </div>
            {sub("Lo que se puede saber de ti")}
            <div style={{ display: "grid", gap: 7 }}>
              {ultimoDia.inferencias.map((i) => (
                <div key={i} className="cn-inferencia">
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>
                    <i className={`fa-solid ${INFERENCIA_DEF[i].icono}`} style={{ marginRight: 8, color: modoCol }} />
                    {INFERENCIA_DEF[i].etq}
                  </div>
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, marginTop: 3 }}>{INFERENCIA_DEF[i].explica}</div>
                </div>
              ))}
            </div>
            {ultimoDia.appsRotas.length > 0 && nota(`Negar un permiso indispensable también tiene costo: ${ultimoDia.appsRotas.map((a) => APPS[a].etq.toLowerCase()).join(" y ")} no pudieron cumplir su función.`, WARN, "fa-triangle-exclamation")}
            {ultimoDia.appsRotas.length === 0 && ultimoDia.sobrantes === 0 && nota("Mínimo privilegio logrado: todas las apps funcionaron y nadie recibió un permiso que no necesitaba. Aun así, tu atención siguió registrándose y la mensajería conoce tus contactos.", OK, "fa-shield-halved")}
          </>
        )}
      </>
    );
  } else {
    control = (
      <>
        {sub("1 · Predice: ¿qué grupo queda más fuera del trámite solo en línea?")}
        <div className="cn-opts">
          {GRUPOS_ORDEN.map((g) => {
            const on = prediccion === g;
            const col = on ? (g === peorBase ? OK : WARN) : prediccion && g === peorBase ? OK : modoCol;
            return (
              <button key={g} className="cn-opt cn-pred" data-on={on || (!!prediccion && g === peorBase)} disabled={!!prediccion} onClick={() => predecir(g)} style={{ ["--cnc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${GRUPOS[g].icono}`} style={{ marginRight: 8 }} />
                {GRUPOS[g].etq} · {num(GRUPOS[g].acceso * 100, 1)} % usa internet
              </button>
            );
          })}
        </div>
        {prediccion &&
          nota(
            prediccion === peorBase
              ? "Bien predicho: a partir de los 75 años solo 30.3 % usa internet (ENDUTIH 2025). Lanza el trámite para ver qué más los deja fuera."
              : `Lánzalo y compruébalo: el grupo con menor acceso es el de 75 años y más (30.3 % usa internet, ENDUTIH 2025), pero el equipo y las habilidades también cuentan.`,
            prediccion === peorBase ? OK : "#fbbf24",
          )}
        {sub(`2 · Elige hasta ${MAX_POLITICAS} medidas (${politicas.length}/${MAX_POLITICAS})`)}
        <div style={{ display: "grid", gap: 7, opacity: prediccion ? 1 : 0.45, pointerEvents: prediccion ? "auto" : "none" }}>
          {POLITICAS_ORDEN.map((p) => {
            const on = politicas.includes(p);
            const lleno = !on && politicas.length >= MAX_POLITICAS;
            return (
              <button key={p} className="cn-opt cn-politica" data-on={on} disabled={lleno} onClick={() => togglePolitica(p)} style={{ ["--cnc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent", textAlign: "left" }}>
                <i className={`fa-solid ${POLITICA_DEF[p].icono}`} style={{ marginRight: 8, color: on ? modoCol : undefined }} />
                {POLITICA_DEF[p].etq}
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text2, marginTop: 3, lineHeight: 1.4 }}>{POLITICA_DEF[p].explica}</div>
              </button>
            );
          })}
        </div>
        <button className="cn-toggle cn-lanzar" onClick={lanzar} disabled={!prediccion} style={{ marginTop: 12, ["--cnc" as string]: accent }}>
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 9, color: accent }} />
          {politicas.length === 0 ? "Lanzar el trámite solo en línea" : `Lanzar el trámite con ${politicas.length} ${politicas.length === 1 ? "medida" : "medidas"}`}
        </button>
        {lanzado && (
          <>
            {sub("Quién completó el trámite y qué dejó fuera al resto")}
            <div style={{ display: "grid", gap: 9 }}>
              {res.map((r) => (
                <div key={r.grupo}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#fff", ...NUM }}>
                    <span>{GRUPOS[r.grupo].etq}</span>
                    <span style={{ color: r.completa >= META_BRECHA ? OK : WARN }}>{num(r.completa * 100)} %</span>
                  </div>
                  <div className="cn-barra" aria-label={`Resultado de ${GRUPOS[r.grupo].etq}`}>
                    {BARRERAS.map((b) => (
                      <span key={b} title={`${BARRERA_DEF[b].etq}: ${num(r.barreras[b] * 100, 1)} %`} style={{ width: `${r.barreras[b] * 100}%`, background: BARRERA_DEF[b].color }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
              {BARRERAS.map((b) => (
                <span key={b} style={{ fontSize: 14, color: T.text2 }}>
                  <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: BARRERA_DEF[b].color, marginRight: 5 }} />
                  {BARRERA_DEF[b].etq}
                </span>
              ))}
            </div>
            {nota(
              minimo >= META_BRECHA
                ? `Meta cumplida: ningún grupo queda por debajo de ${num(META_BRECHA * 100)} %. ${politicas.includes("ventanilla") && politicas.includes("promotores") ? "Fíjate: hizo falta una alternativa presencial y acompañamiento; ninguna combinación solo digital lo logra." : ""}`
                : politicas.length === 0
                  ? `Solo en línea, apenas ${num(peor.completa * 100)} % del grupo «${GRUPOS[peor.grupo].etq}» completó. Incluso en la ciudad, el requisito de computadora deja fuera a muchas personas que sí usan internet.`
                  : `Aún no: el grupo «${GRUPOS[peor.grupo].etq}» se queda en ${num(peor.completa * 100)} %. Mira su barra: ¿qué barrera domina y qué medida la atiende?`,
              minimo >= META_BRECHA ? OK : WARN,
              minimo >= META_BRECHA ? "fa-circle-check" : "fa-magnifying-glass-chart",
            )}
          </>
        )}
      </>
    );
  }

  const css = `
    .cn-opts { display:flex; flex-wrap:wrap; gap:8px; }
    .cn-opt { cursor:pointer; border:1px solid var(--cnc); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
    .cn-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
    .cn-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
    .cn-opt:disabled { cursor:default; }
    .cn-opt:disabled[data-on="false"] { opacity:0.5; }
    .cn-toggle { width:100%; cursor:pointer; border:1px solid var(--cnc); border-radius:11px; padding:12px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
    .cn-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
    .cn-toggle:disabled { cursor:default; opacity:0.6; }
    .cn-datos { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
    .cn-tabla { display:grid; gap:4px; font-size:14px; }
    .cn-fila { display:grid; grid-template-columns: minmax(0,1.5fr) repeat(3,minmax(0,1fr)); gap:8px; padding:7px 10px; border-radius:8px; background:rgba(4,10,22,0.35); color:${T.text2}; font-variant-numeric:tabular-nums; }
    .cn-fila[data-on="true"] { background:rgba(56,189,248,0.12); color:#fff; font-weight:800; }
    .cn-cab { background:transparent; font-size:13px; font-weight:900; letter-spacing:0.06em; text-transform:uppercase; color:${T.text3}; }
    .cn-permiso { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 10px; border-radius:10px; background:rgba(4,10,22,0.35); margin-top:6px; }
    .cn-permiso[data-pide="false"] { opacity:0.6; }
    .cn-permiso-etq { font-size:14px; font-weight:800; color:#fff; min-width:0; }
    .cn-seg { display:flex; border:1px solid rgba(255,255,255,0.16); border-radius:9px; overflow:hidden; flex-shrink:0; }
    .cn-seg-btn { cursor:pointer; border:none; background:transparent; color:rgba(255,255,255,0.7); font-size:14px; font-weight:800; padding:8px 10px; }
    .cn-seg-btn[data-on="true"] { background:${MODOS_DEF.huella.color}; color:#1a0b2e; }
    .cn-seg-btn:disabled { cursor:default; }
    .cn-switch { cursor:pointer; width:44px; height:24px; border-radius:999px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.1); position:relative; flex-shrink:0; transition:all .15s; }
    .cn-switch span { position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#cbd5e1; transition:all .15s; }
    .cn-switch[data-on="true"] { background:${MODOS_DEF.huella.color}; border-color:${MODOS_DEF.huella.color}; }
    .cn-switch[data-on="true"] span { left:22px; background:#fff; }
    .cn-switch:disabled { cursor:default; opacity:0.6; }
    .cn-inferencia { padding:9px 12px; border-radius:10px; background:rgba(4,10,22,0.45); border:1px solid rgba(192,132,252,0.3); }
    .cn-barra { display:flex; height:12px; border-radius:6px; overflow:hidden; background:rgba(255,255,255,0.08); margin-top:4px; }
    .cn-barra span { display:block; height:100%; transition:width .5s ease; }
    .cn-opt:focus-visible, .cn-toggle:focus-visible, .cn-switch:focus-visible, .cn-seg-btn:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
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
            <CentroScene
              vista={vista}
              modoColor={modoCol}
              resetNonce={resetNonce}
              tipo={tipo}
              tExt={tExt}
              tSet={tSet}
              itMW={itMW}
              permisos={permisos}
              appSel={appSel}
              diaNonce={diaNonce}
              politicas={politicas}
              lanzado={lanzado}
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
                <ConceptoCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
                <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes quién controla tus datos y por qué importa." />
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
                <Bloque titulo="¿Dónde está la nube y a quién afecta?" icono="fa-cloud">
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
                  </ul>
                </Bloque>
                <Bloque titulo="Mis datos: ¿quién los tiene? (A3)" icono="fa-pen-to-square">
                  <div style={caja("#c084fc55", "rgba(192,132,252,0.07)")}>
                    <div style={{ color: "#fff" }}>{REFLEXION_A3.prompt}</div>
                    <ul style={{ margin: "10px 0 0", paddingLeft: 18, display: "grid", gap: 6, color: T.text2 }}>
                      {REFLEXION_A3.pistas.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                    <div style={{ color: T.text2, marginTop: 10 }}>
                      <strong style={{ color: "#fff" }}>Autoevaluación (A7):</strong> {REFLEXION_A7}
                    </div>
                  </div>
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
                <Bloque titulo="Importante (lectura A1)" icono="fa-landmark">
                  <div style={caja(`${accent}33`, `rgba(${color.rgba},0.07)`)}>
                    <div style={{ color: T.text2 }}>{RECUADRO_A1}</div>
                    <div style={{ fontSize: 14, color: T.text3, marginTop: 6, fontStyle: "italic" }}>{NOTA_RECUADRO}</div>
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
                          <i className="fa-solid fa-location-arrow" style={{ marginRight: 6, color: accent }} />
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
                  <FichaTeorica data={CENTRO_DATOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
                <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                  La lectura A1 con sus preguntas y su recuadro, la reflexión A3, la pregunta de la autoevaluación A7, los hechos del quiz A4, el glosario A5, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la
                  plataforma; las situaciones de la tarjeta de estrellas son ejemplos elaborados para el laboratorio. <strong>Cifras reales:</strong> uso de internet por ámbito y edad, conexión por celular (97.3 %) y por
                  computadora (36.2 %) de la ENDUTIH 2025 (INEGI, publicada el 16 de junio de 2026) y razones de no uso de la ENDUTIH 2024; factor de emisión de la red eléctrica 2024 (CRE/SEMARNAT); PUE promedio mundial
                  1.56 (Uptime Institute, 2024); rango de 18 a 27 °C (ASHRAE); 50–100 L de agua por persona al día (OMS); reidentificación con 4 puntos de ubicación (de Montjoye y colaboradores, 2013). <strong>Modelos
                  ilustrativos:</strong> el centro de datos usa física simplificada (calor latente del agua y compresores con una fracción del rendimiento de Carnot) y una distribución de horas por temperatura parecida a la
                  de Querétaro, no datos de una instalación real; las apps, sus sedes, los permisos y el conteo de paquetes son un modelo didáctico; en la brecha digital, solo el porcentaje de uso de internet de cada
                  grupo es real y el resto de los parámetros (equipo, habilidades, plazo, efecto de cada medida) son estimaciones para razonar. Fuente del contenido: {FUENTE}
                </p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
