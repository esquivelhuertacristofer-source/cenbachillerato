"use client";

/**
 * Laboratorio 3D — "Estadística: variables, población y muestra".
 * Práctica experimental anclada a PM-VI-P01-A2 (quiz «¿Cuánto sabes sobre
 * estadística descriptiva e inferencial, tipos de variables y fuentes de
 * datos?»; progresión 1 de la UAC PM-VI "Pensamiento Matemático VI"). El marco
 * teórico es la lectura A1, los hechos salen del quiz A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) Tipos de variables — una máquina clasificadora en 3D: nominal, ordinal,
 *      discreta o continua. Da las estrellas.
 *  (2) Población y muestra — censo de 1 500 estudiantes contra encuestas de
 *      20 a 500: parámetro y estadístico.
 *  (3) Descriptiva o inferencial — la tabla de frecuencias de la muestra, los
 *      intervalos que estiman a la escuela y afirmaciones para clasificar.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { VARIABLES_ESTADISTICA_FICHA } from "./variables-estadistica-ficha";
import type { Envio } from "./VariablesEstadisticaScene";
import {
  type Modo,
  type TipoVar,
  type Rama,
  MODOS,
  MODOS_DEF,
  TIPOS,
  TIPOS_DEF,
  RONDA_INICIAL,
  POR_RONDA,
  rondaVariables,
  estrellasPorErrores,
  N_POBLACION,
  CATEGORIAS,
  COLORES_CAT,
  TAMANOS,
  muestraAleatoria,
  resumir,
  PARAMETRO,
  margen95,
  AFIRMACIONES,
  TITULO_A1,
  LECTURA_A1,
  SABIAS_A1,
  PREGUNTAS,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  num,
} from "./variables-estadistica-data";

const VariablesScene = dynamic(() => import("./VariablesEstadisticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-shapes fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el laboratorio en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-variables-estadistica-reto";
const T_ACIERTO = 1700;
const T_ERROR = 2700;
const T_CENSO = 3900;
const pct = (x: number, dec = 1) => `${num(x * 100, dec)} %`;

interface Historial {
  n: number;
  media: number;
  p0: number;
}

export function LabVariablesEstadistica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("variables");

  // ── Clasificador
  const [ronda, setRonda] = useState(RONDA_INICIAL);
  const [idx, setIdx] = useState(0);
  const [conteos, setConteos] = useState([0, 0, 0, 0]);
  const [errores, setErrores] = useState(0);
  const [fallosTarjeta, setFallosTarjeta] = useState(0);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [rondaEstrellas, setRondaEstrellas] = useState<number | null>(null);
  const [tiposAcertados, setTiposAcertados] = useState<Set<TipoVar>>(() => new Set());
  const nonceRef = useRef(0);
  const timer = useRef<number | null>(null);

  // ── Población
  const [censoNonce, setCensoNonce] = useState(0);
  const [censando, setCensando] = useState(false);
  const [censado, setCensado] = useState(false);
  const [n, setN] = useState(200);
  const [muestra, setMuestra] = useState<number[] | null>(null);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [tamanosProbados, setTamanosProbados] = useState<Set<number>>(() => new Set());
  const censoTimer = useRef<number | null>(null);

  // ── Inferencia
  const [revelar, setRevelar] = useState(false);
  const [revelo, setRevelo] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<number, Rama>>({});

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const { mejorEstrellas, registraEstrellas } = useEstrellas(RETO_KEY);

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
      if (timer.current !== null) window.clearTimeout(timer.current);
      if (censoTimer.current !== null) window.clearTimeout(censoTimer.current);
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
  const tarjeta = idx < ronda.length ? ronda[idx]! : null;

  const seleccion = useMemo(() => {
    const s = new Uint8Array(N_POBLACION);
    if (muestra) for (const i of muestra) s[i] = 1;
    return s;
  }, [muestra]);
  const resumen = useMemo(() => (muestra ? resumir(muestra) : null), [muestra]);

  /* ── Acciones: clasificador ────────────────────────────────────────── */
  const clasificar = (tipo: TipoVar) => {
    if (!tarjeta || envio) return;
    const ok = tipo === tarjeta.tipo;
    nonceRef.current += 1;
    setEnvio({ destino: tipo, ok, nonce: nonceRef.current });
    sfx(ok);
    if (ok) {
      const ultima = idx + 1 >= ronda.length;
      const erroresRonda = errores;
      setMensaje({ ok: true, texto: `${tarjeta.nombre}: ${TIPOS_DEF[tipo].rama.toLowerCase()} ${TIPOS_DEF[tipo].etq.toLowerCase()}. ${tarjeta.porque}` });
      timer.current = window.setTimeout(() => {
        setConteos((c) => c.map((v, i) => (TIPOS[i] === tipo ? v + 1 : v)));
        setTiposAcertados((s) => new Set(s).add(tipo));
        setIdx((i) => i + 1);
        setFallosTarjeta(0);
        setEnvio(null);
        if (ultima) {
          const est = estrellasPorErrores(erroresRonda);
          setRondaEstrellas(est);
          registraEstrellas(est);
        }
      }, T_ACIERTO);
    } else {
      const fallos = fallosTarjeta + 1;
      setErrores((e) => e + 1);
      setFallosTarjeta(fallos);
      const rama = TIPOS_DEF[tarjeta.tipo].rama;
      setMensaje({
        ok: false,
        texto:
          fallos >= 2
            ? `No es ${TIPOS_DEF[tipo].etq.toLowerCase()}. ${tarjeta.porque}`
            : TIPOS_DEF[tipo].rama !== rama
              ? `No es ${TIPOS_DEF[tipo].etq.toLowerCase()}. Pregúntate primero: ¿«${tarjeta.nombre}» da categorías o cantidades?`
              : `Vas por la rama correcta (${rama.toLowerCase()}), pero no es ${TIPOS_DEF[tipo].etq.toLowerCase()}. ${rama === "Cualitativa" ? "¿Sus categorías tienen un orden?" : "¿Se cuenta o se mide?"}`,
      });
      timer.current = window.setTimeout(() => setEnvio(null), T_ERROR);
    }
  };

  const nuevaRonda = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setRonda(rondaVariables());
    setIdx(0);
    setConteos([0, 0, 0, 0]);
    setErrores(0);
    setFallosTarjeta(0);
    setEnvio(null);
    setMensaje(null);
    setRondaEstrellas(null);
    blip();
  };

  /* ── Acciones: población ───────────────────────────────────────────── */
  const hacerCenso = () => {
    if (censando || censado) return;
    setCensoNonce((k) => k + 1);
    setCensando(true);
    blip();
    censoTimer.current = window.setTimeout(() => {
      setCensado(true);
      setCensando(false);
    }, T_CENSO);
  };

  const tomarMuestra = (tam: number) => {
    const m = muestraAleatoria(tam);
    const r = resumir(m);
    setMuestra(m);
    setHistorial((h) => [{ n: tam, media: r.media, p0: r.relativas[0]! }, ...h].slice(0, 8));
    setTamanosProbados((s) => new Set(s).add(tam));
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    if (m === "inferencia" && !muestra) tomarMuestra(n);
    blip();
  };

  const reiniciar = () => {
    if (modo === "variables") nuevaRonda();
    if (modo === "poblacion") {
      setMuestra(null);
    }
    if (modo === "inferencia") setRevelar(false);
    setResetNonce((k) => k + 1);
  };

  const responder = (i: number, r: Rama) => {
    setRespuestas((prev) => ({ ...prev, [i]: r }));
    sfx(AFIRMACIONES[i]!.rama === r);
  };
  const aciertosAfirm = AFIRMACIONES.filter((a, i) => respuestas[i] === a.rama).length;

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Acertar una variable de cada uno de los cuatro tipos", done: tiposAcertados.size === 4 },
    { t: `Terminar una ronda de ${POR_RONDA} variables y ganar estrellas`, done: rondaEstrellas !== null },
    { t: `Hacer el censo de los ${num(N_POBLACION)} estudiantes`, done: censado },
    { t: "Tomar tres encuestas y comparar su estadístico con el parámetro", done: historial.length >= 3 },
    { t: "Probar una muestra de 20 y una de 500", done: tamanosProbados.has(20) && tamanosProbados.has(500) },
    { t: "Revelar la población y compararla con los intervalos", done: revelo },
    { t: `Clasificar bien las ${AFIRMACIONES.length} afirmaciones`, done: aciertosAfirm === AFIRMACIONES.length },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
  ];

  /* ── Textos del visor ──────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "variables") {
    chipVivo = tarjeta ? `tarjeta ${idx + 1}/${ronda.length} · errores ${errores}` : `ronda completa · errores ${errores}`;
    pie = tarjeta ? `«${tarjeta.nombre}» (${tarjeta.ejemplos}). ¿Categorías o cantidades?` : `Ronda terminada con ${errores} ${errores === 1 ? "error" : "errores"}.`;
  } else if (modo === "poblacion") {
    chipVivo = muestra ? `muestra n = ${num(muestra.length)} · x̄ = ${num(resumen!.media, 2)}` : censado ? `censo · μ = ${num(PARAMETRO.media, 2)}` : `población N = ${num(N_POBLACION)}`;
    pie = censando
      ? "El censo recorre a todos los estudiantes, fila por fila."
      : muestra
        ? `La encuesta preguntó a ${num(muestra.length)} de ${num(N_POBLACION)}: en promedio tienen ${num(resumen!.media, 2)} hermanos y ${pct(resumen!.relativas[0]!)} no tiene hermanos.${censado ? ` En toda la escuela: ${num(PARAMETRO.media, 2)} y ${pct(PARAMETRO.relativas[0]!)}.` : ""}`
        : censado
          ? `Censo completo: en promedio ${num(PARAMETRO.media, 2)} hermanos por estudiante. Ese es el parámetro de la población.`
          : "Cada estudiante tiene un número de hermanos. Nadie lo sabe hasta preguntarles.";
  } else {
    chipVivo = resumen ? `n = ${num(resumen.n)} · 5 intervalos al 95 %` : "sin muestra";
    const dentro = resumen ? PARAMETRO.relativas.filter((p, k) => Math.abs(p - resumen.relativas[k]!) <= margen95(resumen.relativas[k]!, resumen.n)).length : 0;
    pie = !resumen
      ? "Toma una muestra para construir la tabla de frecuencias."
      : revelar
        ? `El dorado es el valor de toda la escuela: ${dentro} de 5 intervalos lo contienen.`
        : `Las barras describen a los ${num(resumen.n)} encuestados (descriptiva). Las líneas blancas estiman a los ${num(N_POBLACION)} (inferencial).`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los cálculos siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;

  /* ── Panel por modo ────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "variables") {
    control = (
      <>
        <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: T.text3, letterSpacing: "0.06em" }}>{tarjeta ? `TARJETA ${idx + 1} DE ${ronda.length}` : "RONDA COMPLETA"}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 2 }}>{tarjeta ? tarjeta.nombre : `${errores} ${errores === 1 ? "error" : "errores"}`}</div>
            {tarjeta && <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>{tarjeta.ejemplos}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejorEstrellas ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
          </div>
        </div>

        {(["Cualitativa", "Cuantitativa"] as const).map((rama) => (
          <div key={rama}>
            {sub(rama)}
            <div className="ve-clasif">
              {TIPOS.filter((t) => TIPOS_DEF[t].rama === rama).map((t) => {
                const d = TIPOS_DEF[t];
                return (
                  <button key={t} className="ve-bin" disabled={!tarjeta || envio !== null} onClick={() => clasificar(t)} style={{ ["--vec" as string]: d.color }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 900, color: "#fff" }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                      {d.etq}
                    </span>
                    <span style={{ fontSize: 11, color: T.text3, marginTop: 3, textAlign: "left" }}>{d.pregunta}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {mensaje && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 11, border: `1px solid ${mensaje.ok ? `${OK}55` : "#FF8A3C55"}`, background: mensaje.ok ? "rgba(52,211,153,0.08)" : "rgba(255,138,60,0.08)", fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
            <i className={`fa-solid ${mensaje.ok ? "fa-circle-check" : "fa-rotate-left"}`} style={{ marginRight: 7, color: mensaje.ok ? OK : "#FF8A3C" }} />
            {mensaje.texto}
          </div>
        )}

        {rondaEstrellas !== null && (
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {[1, 2, 3].map((k) => (
                <i key={k} className="fa-solid fa-star" style={{ fontSize: 16, color: k <= rondaEstrellas ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
              ))}
              <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>
                Ronda con {errores} {errores === 1 ? "error" : "errores"}
              </span>
            </div>
            <button className="ve-opt" data-on="true" onClick={nuevaRonda} style={{ ["--vec" as string]: accent, background: `rgba(${color.rgba},0.16)` }}>
              <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
              Nueva ronda
            </button>
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>Estrellas: 3 sin errores, 2 con uno o dos, 1 con más.</div>
      </>
    );
  } else if (modo === "poblacion") {
    control = (
      <>
        <button className="ve-toggle" onClick={hacerCenso} disabled={censando || censado} style={{ ["--vec" as string]: modoCol, opacity: censado ? 0.7 : 1 }}>
          <i className={`fa-solid ${censando ? "fa-spinner fa-spin" : censado ? "fa-circle-check" : "fa-clipboard-list"}`} style={{ marginRight: 9, color: modoCol }} />
          {censando ? "Censando a toda la escuela…" : censado ? `Censo hecho: ${num(N_POBLACION)} entrevistas` : `Hacer el censo (${num(N_POBLACION)} entrevistas)`}
        </button>

        {sub("Encuesta: tamaño de la muestra (n)")}
        <div className="ve-opts">
          {TAMANOS.map((t) => (
            <button key={t} className="ve-opt" data-on={t === n} onClick={() => setN(t)} style={{ ["--vec" as string]: accent, background: t === n ? `rgba(${color.rgba},0.16)` : "transparent", minWidth: 56, ...NUM }}>
              {t}
            </button>
          ))}
        </div>
        <button className="ve-toggle" onClick={() => tomarMuestra(n)} style={{ marginTop: 12, ["--vec" as string]: accent }}>
          <i className="fa-solid fa-hand-pointer" style={{ marginRight: 9, color: accent }} />
          {muestra ? `Tomar otra muestra de ${n}` : `Encuestar a ${n} estudiantes al azar`}
        </button>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
          <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}10` }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: T.text3, letterSpacing: "0.06em" }}>POBLACIÓN · PARÁMETRO</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Readout label="Media μ" value={censado ? num(PARAMETRO.media, 2) : "?"} col={modoCol} size={17} />
              <Readout label="Sin hermanos" value={censado ? pct(PARAMETRO.relativas[0]!, 0) : "?"} size={17} />
            </div>
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.08)` }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: T.text3, letterSpacing: "0.06em" }}>MUESTRA · ESTADÍSTICO</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Readout label="Media x̄" value={resumen ? num(resumen.media, 2) : "—"} col={accent} size={17} />
              <Readout label="Sin hermanos" value={resumen ? pct(resumen.relativas[0]!) : "—"} size={17} />
            </div>
          </div>
        </div>

        {historial.length > 0 && (
          <>
            {sub("Encuestas tomadas (la más reciente primero)")}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {historial.map((h, i) => {
                const lejos = censado ? Math.abs(h.media - PARAMETRO.media) : null;
                return (
                  <span key={i} style={{ fontSize: 11, color: T.text2, padding: "4px 9px", borderRadius: 999, border: `1px solid ${lejos !== null && lejos > 0.25 ? "#f8717155" : T.line}`, ...NUM }}>
                    n = {h.n} · x̄ = {num(h.media, 2)}
                    {lejos !== null ? ` (${h.media >= PARAMETRO.media ? "+" : "−"}${num(Math.abs(h.media - PARAMETRO.media), 2)})` : ""}
                  </span>
                );
              })}
            </div>
            {!censado && <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3 }}>Haz el censo para saber qué tan lejos quedó cada encuesta.</div>}
          </>
        )}
      </>
    );
  } else {
    const dentro = (k: number) => resumen !== null && Math.abs(PARAMETRO.relativas[k]! - resumen.relativas[k]!) <= margen95(resumen.relativas[k]!, resumen.n);
    control = (
      <>
        <div className="ve-opts">
          {TAMANOS.map((t) => (
            <button key={t} className="ve-opt" data-on={resumen?.n === t} onClick={() => { setN(t); tomarMuestra(t); }} style={{ ["--vec" as string]: accent, background: resumen?.n === t ? `rgba(${color.rgba},0.16)` : "transparent", minWidth: 56, ...NUM }}>
              n = {t}
            </button>
          ))}
        </div>

        {resumen && (
          <>
            {sub("Tabla de frecuencias de la muestra")}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, fontSize: 12.5, ...NUM }}>
                <thead>
                  <tr style={{ color: T.text3, fontSize: 10.5 }}>
                    <th style={{ textAlign: "left", padding: 4 }}>Hermanos</th>
                    <th style={{ padding: 4 }}>f absoluta</th>
                    <th style={{ padding: 4 }}>f relativa</th>
                    <th style={{ padding: 4 }}>Escuela (95 %)</th>
                    {revelar && <th style={{ padding: 4 }}>Real</th>}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIAS.map((c, k) => {
                    const p = resumen.relativas[k]!;
                    const me = margen95(p, resumen.n);
                    return (
                      <tr key={c}>
                        <td style={{ padding: "6px 4px", color: COLORES_CAT[k], fontWeight: 900 }}>{c}</td>
                        <td className="ve-td">{resumen.conteos[k]}</td>
                        <td className="ve-td" style={{ color: "#fff" }}>
                          {pct(p)}
                        </td>
                        <td className="ve-td">
                          {pct(Math.max(0, p - me), 0)} – {pct(Math.min(1, p + me), 0)}
                        </td>
                        {revelar && (
                          <td className="ve-td" style={{ color: dentro(k) ? OK : "#f87171" }}>
                            {pct(PARAMETRO.relativas[k]!, 0)}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ padding: "6px 4px", color: T.text3, fontWeight: 900 }}>Total</td>
                    <td className="ve-td" style={{ fontWeight: 900 }}>
                      {resumen.n}
                    </td>
                    <td className="ve-td">100 %</td>
                    <td className="ve-td" />
                    {revelar && <td className="ve-td" />}
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
              f relativa = f absoluta ÷ {resumen.n} (descriptiva). Intervalo: f relativa ± 1.96·√(p(1 − p)/n), con corrección por población finita (inferencial).
            </div>
            <button
              className="ve-toggle"
              onClick={() => {
                setRevelar((r) => !r);
                setRevelo(true);
                blip();
              }}
              style={{ marginTop: 12, ["--vec" as string]: "#fbbf24" }}
            >
              <i className={`fa-solid ${revelar ? "fa-eye-slash" : "fa-eye"}`} style={{ marginRight: 9, color: "#fbbf24" }} />
              {revelar ? "Ocultar la población" : "Revelar la población"}
            </button>
          </>
        )}

        {sub(`¿Descriptiva o inferencial? · ${aciertosAfirm}/${AFIRMACIONES.length}`)}
        <div style={{ display: "grid", gap: 8 }}>
          {AFIRMACIONES.map((a, i) => {
            const r = respuestas[i];
            const bien = r === a.rama;
            return (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${r ? (bien ? `${OK}55` : "#FF8A3C55") : T.line}` }}>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.45 }}>{a.texto}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {(["descriptiva", "inferencial"] as Rama[]).map((op) => (
                    <button key={op} className="ve-opt ve-afirm" data-on={r === op} onClick={() => responder(i, op)} style={{ ["--vec" as string]: r === op ? (bien ? OK : "#FF8A3C") : modoCol, background: r === op ? (bien ? "rgba(52,211,153,0.14)" : "rgba(255,138,60,0.12)") : "transparent", padding: "6px 11px" }}>
                      {op === "descriptiva" ? "Descriptiva" : "Inferencial"}
                    </button>
                  ))}
                  {r && <span style={{ fontSize: 11.5, color: bien ? OK : "#FF8A3C" }}>{bien ? a.porque : "Revisa: ¿se queda en los datos observados o habla de alguien más?"}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes vePulse { 0%,100%{ box-shadow:0 0 0 0 var(--ved); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ve-live-dot { animation: vePulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .ve-live-dot { animation:none; } }
        .ve-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ve-grid { grid-template-columns: 1fr; } }
        .ve-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ve-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ve-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ve-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ve-tab { cursor:pointer; border:1px solid var(--vec); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .ve-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ve-tab:hover { background:rgba(255,255,255,0.06); }
        .ve-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .ve-opt { cursor:pointer; border:1px solid var(--vec); border-radius:10px; padding:9px 12px; font-size:12px;
          font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .ve-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
        .ve-opt:hover { background:rgba(255,255,255,0.06); }
        .ve-clasif { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:8px; }
        .ve-bin { cursor:pointer; display:flex; flex-direction:column; align-items:flex-start; padding:11px 13px; border-radius:12px;
          border:1px solid var(--vec); background:rgba(4,10,22,0.45); transition:all .15s; }
        .ve-bin:hover:not(:disabled) { background:rgba(255,255,255,0.07); transform:translateY(-1px); }
        .ve-bin:disabled { cursor:default; opacity:0.55; }
        .ve-opt:focus-visible, .ve-tab:focus-visible, .ve-toggle:focus-visible, .ve-icobtn:focus-visible, .ve-bin:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .ve-toggle { width:100%; cursor:pointer; border:1px solid var(--vec); border-radius:11px; padding:11px 14px;
          background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ve-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ve-toggle:disabled { cursor:default; }
        .ve-td { padding:6px; text-align:center; border-radius:6px; background:rgba(4,10,22,0.45); color:${T.text2}; font-weight:800; }
        @media (max-width: 1000px){ .ve-bottom { grid-template-columns: 1fr !important; } }

        .ve-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ve-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ve-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ve-drawer[data-open="true"] { transform:translateX(0); }
        .ve-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ve-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ve-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ve-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ve-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ve-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ve-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ve-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--vec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="ve-grid">
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
              <VariablesScene
                modo={modo}
                tarjeta={tarjeta}
                envio={envio}
                conteos={conteos}
                censoNonce={censoNonce}
                censado={censado}
                seleccion={seleccion}
                resumen={resumen}
                revelar={revelar}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="ve-live-dot" style={{ ["--ved" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
              {modo !== "variables" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CATEGORIAS.map((c, k) => (
                    <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 999, background: "rgba(4,10,22,0.72)", border: `1px solid ${T.line}`, fontSize: 11, fontWeight: 800, color: "#e2e8f0", whiteSpace: "nowrap" }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: COLORES_CAT[k] }} />
                      {c} {c === "1" ? "hermano" : "hermanos"}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ve-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ve-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ve-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="ve-teoria-fab" onClick={() => setDrawer(true)}>
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
            </div>
            {control}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-chart-pie" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Los datos al servicio de las decisiones</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 10 }}>{TITULO_A1}</div>
            <div style={{ display: "grid", gap: 9, marginBottom: 12, maxHeight: 440, overflowY: "auto", paddingRight: 6 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ve-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
              ¿Sabías que? (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{SABIAS_A1}</div>
          </div>

          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.4)" }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: 8, color: accent }} />
              Actividad del glosario A5
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{ACTIVIDAD_A5}</div>
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5, marginTop: 8 }}>
              <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
              Las cuatro variables de la actividad están entre las tarjetas del clasificador.
            </div>
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
          La lectura A1, sus preguntas y su recuadro, los hechos del quiz A4, el glosario A5 y el quiz A2 son <strong>verbatim</strong> del material de la plataforma. Las
          variables del clasificador salen de esas mismas actividades. La escuela de 1 500 estudiantes es la del ejemplo del quiz A4; cuántos hermanos tiene cada uno es un{" "}
          <strong>dato ilustrativo</strong> del laboratorio, fijado con semilla. Las muestras usan el generador aleatorio del navegador. Fuente: {FUENTE}
        </span>
      </div>

      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sfx}
        playPick={() => {
          if (sonido) audioRef.current?.blip();
        }}
        mensajeAprobado="¡Aprobado! Ya distingues variables, poblaciones y muestras."
      />

      <div className="ve-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ve-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ve-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ve-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ve-drawer-body">
          <FichaTeorica data={VARIABLES_ESTADISTICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
