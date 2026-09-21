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

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
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
      <span style={{ fontSize: 13, fontWeight: 600 }}>Encendiendo el centro de datos en 3D…</span>
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
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Situación {pos + 1} de {ronda.length} · ¿qué concepto de la progresión describe?
          </div>
          <div className="cn-situacion" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            «{actual.texto}»
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 8 }}>
            {CONCEPTOS.map((c) => (
              <button key={c} className="cn-opt cn-concepto" data-on="true" onClick={() => responder(c)} style={{ ["--cnc" as string]: accent }}>
                {CONCEPTO_ETQ[c]}
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
  const [drawer, setDrawer] = useState(false);
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
  const dato = (etq: string, valor: string, col = "#fff") => (
    <div className="cn-dato">
      <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );
  const slider = (etq: string, unidad: string, min: number, max: number, paso: number, valor: number, onChange: (v: number) => void, col: string, icono: string, marca?: string) => (
    <label style={{ display: "grid", gridTemplateColumns: "20px minmax(0,1fr) 78px", alignItems: "center", gap: 10, marginTop: 10 }}>
      <i className={`fa-solid ${icono}`} style={{ color: col }} />
      <span style={{ display: "grid", gap: 3 }}>
        <span style={{ fontSize: 11, color: T.text2, fontWeight: 700 }}>
          {etq}
          {marca && <span style={{ color: T.text3, fontWeight: 600 }}> · {marca}</span>}
        </span>
        <input type="range" aria-label={`${etq} (${unidad})`} className="cn-range" min={min} max={max} step={paso} value={valor} onChange={(e) => onChange(Number(e.target.value))} style={{ ["--cnc" as string]: col }} />
      </span>
      <span style={{ textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>
        {valor} {unidad}
      </span>
    </label>
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
        <div style={{ fontSize: 11.5, color: T.text2, marginTop: 8, lineHeight: 1.5, ...NUM }}>
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
        <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
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
          <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 900 }}>
            <i className={`fa-solid ${app.icono}`} style={{ marginRight: 8, color: app.color }} />
            {app.etq} · empresa con sede en {app.sede}
          </div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 4, lineHeight: 1.45 }}>
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
                {app.necesita[k] && <span style={{ marginLeft: 6, fontSize: 10, color: OK, fontWeight: 900 }}>la necesita</span>}
              </span>
              {pide ? (
                <button role="switch" aria-checked={on} aria-label={PERMISO_DEF[k].etq} className="cn-switch" data-on={on} disabled={corriendo} onClick={() => togglePermiso(k)}>
                  <span />
                </button>
              ) : (
                <span style={{ fontSize: 11, color: T.text3 }}>no lo pide</span>
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
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 8, ...NUM }}>
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
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>
                    <i className={`fa-solid ${INFERENCIA_DEF[i].icono}`} style={{ marginRight: 8, color: modoCol }} />
                    {INFERENCIA_DEF[i].etq}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, marginTop: 3 }}>{INFERENCIA_DEF[i].explica}</div>
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
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginTop: 3, lineHeight: 1.4 }}>{POLITICA_DEF[p].explica}</div>
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
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, color: "#fff", ...NUM }}>
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
                <span key={b} style={{ fontSize: 10.5, color: T.text2 }}>
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cnPulse { 0%,100%{ box-shadow:0 0 0 0 var(--cnd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .cn-live-dot { animation: cnPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .cn-live-dot { animation:none; } }
        .cn-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .cn-grid { grid-template-columns: 1fr; } }
        .cn-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cn-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .cn-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cn-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .cn-tab { cursor:pointer; border:1px solid var(--cnc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .cn-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .cn-tab:hover { background:rgba(255,255,255,0.06); }
        .cn-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .cn-opt { cursor:pointer; border:1px solid var(--cnc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .cn-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .cn-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cn-opt:disabled { cursor:default; }
        .cn-opt:disabled[data-on="false"] { opacity:0.5; }
        .cn-toggle { width:100%; cursor:pointer; border:1px solid var(--cnc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .cn-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .cn-toggle:disabled { cursor:default; opacity:0.6; }
        .cn-range { width:100%; accent-color: var(--cnc); }
        .cn-datos { display:grid; grid-template-columns: repeat(auto-fit,minmax(118px,1fr)); gap:8px; }
        .cn-dato { padding:9px 11px; border-radius:10px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; min-width:0; }
        .cn-tabla { display:grid; gap:4px; font-size:12px; }
        .cn-fila { display:grid; grid-template-columns: minmax(0,1.5fr) repeat(3,minmax(0,1fr)); gap:8px; padding:7px 10px; border-radius:8px; background:rgba(4,10,22,0.35); color:${T.text2}; font-variant-numeric:tabular-nums; }
        .cn-fila[data-on="true"] { background:rgba(56,189,248,0.12); color:#fff; font-weight:800; }
        .cn-cab { background:transparent; font-size:9.5px; font-weight:900; letter-spacing:0.06em; text-transform:uppercase; color:${T.text3}; }
        .cn-permiso { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 10px; border-radius:10px; background:rgba(4,10,22,0.35); margin-top:6px; }
        .cn-permiso[data-pide="false"] { opacity:0.6; }
        .cn-permiso-etq { font-size:12.5px; font-weight:800; color:#fff; min-width:0; }
        .cn-seg { display:flex; border:1px solid rgba(255,255,255,0.16); border-radius:9px; overflow:hidden; flex-shrink:0; }
        .cn-seg-btn { cursor:pointer; border:none; background:transparent; color:rgba(255,255,255,0.7); font-size:11px; font-weight:800; padding:6px 9px; }
        .cn-seg-btn[data-on="true"] { background:${MODOS_DEF.huella.color}; color:#1a0b2e; }
        .cn-seg-btn:disabled { cursor:default; }
        .cn-switch { cursor:pointer; width:40px; height:22px; border-radius:999px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.1); position:relative; flex-shrink:0; transition:all .15s; }
        .cn-switch span { position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:#cbd5e1; transition:all .15s; }
        .cn-switch[data-on="true"] { background:${MODOS_DEF.huella.color}; border-color:${MODOS_DEF.huella.color}; }
        .cn-switch[data-on="true"] span { left:20px; background:#fff; }
        .cn-switch:disabled { cursor:default; opacity:0.6; }
        .cn-inferencia { padding:9px 12px; border-radius:10px; background:rgba(4,10,22,0.45); border:1px solid rgba(192,132,252,0.3); }
        .cn-barra { display:flex; height:12px; border-radius:6px; overflow:hidden; background:rgba(255,255,255,0.08); margin-top:4px; }
        .cn-barra span { display:block; height:100%; transition:width .5s ease; }
        .cn-opt:focus-visible, .cn-tab:focus-visible, .cn-toggle:focus-visible, .cn-icobtn:focus-visible, .cn-range:focus-visible, .cn-switch:focus-visible, .cn-seg-btn:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .cn-bottom { grid-template-columns: 1fr !important; } }
        .cn-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .cn-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .cn-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .cn-drawer[data-open="true"] { transform:translateX(0); }
        .cn-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .cn-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .cn-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .cn-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .cn-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .cn-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="cn-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="cn-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--cnc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="cn-grid">
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

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="cn-live-dot" style={{ ["--cnd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span className="cn-chip" style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>
                  {chipVivo}
                </span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="cn-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="cn-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="cn-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div className="cn-pie" style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>
                {pie}
              </div>
            </div>

            <button className="cn-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-cloud" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Dónde está la nube y a quién afecta?</div>
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

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #c084fc55", background: "rgba(192,132,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: 8, color: "#c084fc" }} />
              Mis datos: ¿quién los tiene? (A3)
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.55 }}>{REFLEXION_A3.prompt}</div>
            <ul style={{ margin: "10px 0 0", paddingLeft: 16, display: "grid", gap: 6 }}>
              {REFLEXION_A3.pistas.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 10, lineHeight: 1.5 }}>
              <strong style={{ color: "#fff" }}>Autoevaluación (A7):</strong> {REFLEXION_A7}
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
              <span className="cn-conteo" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} className="cn-objetivo" data-done={o.done} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="cn-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-landmark" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.45, marginTop: 6, fontStyle: "italic" }}>{NOTA_RECUADRO}</div>
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
                    <i className="fa-solid fa-location-arrow" style={{ marginRight: 6, color: accent }} />
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
          La lectura A1 con sus preguntas y su recuadro, la reflexión A3, la pregunta de la autoevaluación A7, los hechos del quiz A4, el glosario A5, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la
          plataforma; las situaciones de la tarjeta de estrellas son ejemplos elaborados para el laboratorio. <strong>Cifras reales:</strong> uso de internet por ámbito y edad, conexión por celular (97.3 %) y por
          computadora (36.2 %) de la ENDUTIH 2025 (INEGI, publicada el 16 de junio de 2026) y razones de no uso de la ENDUTIH 2024; factor de emisión de la red eléctrica 2024 (CRE/SEMARNAT); PUE promedio mundial
          1.56 (Uptime Institute, 2024); rango de 18 a 27 °C (ASHRAE); 50–100 L de agua por persona al día (OMS); reidentificación con 4 puntos de ubicación (de Montjoye y colaboradores, 2013). <strong>Modelos
          ilustrativos:</strong> el centro de datos usa física simplificada (calor latente del agua y compresores con una fracción del rendimiento de Carnot) y una distribución de horas por temperatura parecida a la
          de Querétaro, no datos de una instalación real; las apps, sus sedes, los permisos y el conteo de paquetes son un modelo didáctico; en la brecha digital, solo el porcentaje de uso de internet de cada
          grupo es real y el resto de los parámetros (equipo, habilidades, plazo, efecto de cada medida) son estimaciones para razonar. Fuente del contenido: {FUENTE}
        </span>
      </div>

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

      <div className="cn-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="cn-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="cn-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="cn-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cn-drawer-body">
          <FichaTeorica data={CENTRO_DATOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
