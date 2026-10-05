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
 *      20 a 500: parámetro y estadístico. EXPERIMENTO CENTRAL: el deslizador
 *      de n levanta una muestra distinta y «Repetir 20 encuestas» dibuja cuánto
 *      se dispersan las medias: con n grande se juntan alrededor de μ.
 *  (3) Descriptiva o inferencial — la tabla de frecuencias de la muestra, los
 *      intervalos que estiman a la escuela y afirmaciones para clasificar.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
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
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el laboratorio en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-variables-estadistica-reto";
const T_ACIERTO = 1700;
const T_ERROR = 2700;
const T_CENSO = 3900;
const REPETICIONES = 20;
const MAX_POR_N = 40;
const COL_N = ["#f472b6", "#fbbf24", "#34d399", "#38bdf8"];
const pct = (x: number, dec = 1) => `${num(x * 100, dec)} %`;

interface Historial {
  n: number;
  media: number;
  p0: number;
}
interface Punto {
  n: number;
  media: number;
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
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [tamanosProbados, setTamanosProbados] = useState<Set<number>>(() => new Set());
  const censoTimer = useRef<number | null>(null);

  // ── Inferencia
  const [revelar, setRevelar] = useState(false);
  const [revelo, setRevelo] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<number, Rama>>({});

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [quizAprobado, setQuizAprobado] = useState(false);
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

  const guardaPuntos = (nuevos: Punto[]) =>
    setPuntos((p) => {
      const todos = [...p, ...nuevos];
      return TAMANOS.flatMap((t) => todos.filter((x) => x.n === t).slice(-MAX_POR_N));
    });

  const tomarMuestra = (tam: number) => {
    const m = muestraAleatoria(tam);
    const r = resumir(m);
    setN(tam);
    setMuestra(m);
    setHistorial((h) => [{ n: tam, media: r.media, p0: r.relativas[0]! }, ...h].slice(0, 8));
    guardaPuntos([{ n: tam, media: r.media }]);
    setTamanosProbados((s) => new Set(s).add(tam));
    blip();
  };

  /** Repite la encuesta muchas veces con el mismo n: dibuja cuánto varía la media. */
  const repetirEncuestas = (tam: number) => {
    const nuevos: Punto[] = [];
    let ultima: number[] = [];
    for (let k = 0; k < REPETICIONES; k++) {
      ultima = muestraAleatoria(tam);
      nuevos.push({ n: tam, media: resumir(ultima).media });
    }
    setN(tam);
    setMuestra(ultima);
    guardaPuntos(nuevos);
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

  const cuantos = (t: number) => puntos.filter((p) => p.n === t).length;

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { txt: string; done: boolean }[] = [
    { txt: "Acertar una variable de cada uno de los cuatro tipos", done: tiposAcertados.size === 4 },
    { txt: `Terminar una ronda de ${POR_RONDA} variables y ganar estrellas`, done: rondaEstrellas !== null },
    { txt: `Hacer el censo de los ${num(N_POBLACION)} estudiantes`, done: censado },
    { txt: "Tomar tres encuestas y comparar su estadístico con el parámetro", done: historial.length >= 3 },
    { txt: "Probar una muestra de 20 y una de 500", done: tamanosProbados.has(20) && tamanosProbados.has(500) },
    { txt: `Repetir ${REPETICIONES} encuestas con n = 20 y con n = 500: ¿cuáles medias quedan más juntas?`, done: cuantos(20) >= REPETICIONES && cuantos(500) >= REPETICIONES },
    { txt: "Revelar la población y compararla con los intervalos", done: revelo },
    { txt: `Clasificar bien las ${AFIRMACIONES.length} afirmaciones`, done: aciertosAfirm === AFIRMACIONES.length },
    { txt: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
  ];

  /* ── Lectura en vivo (≤ 10 palabras) ───────────────────────────────── */
  let lectura: ReactNode = null;
  const dentro = resumen ? PARAMETRO.relativas.filter((p, k) => Math.abs(p - resumen.relativas[k]!) <= margen95(resumen.relativas[k]!, resumen.n)).length : 0;
  if (modo === "variables") {
    lectura = mensaje && envio
      ? mensaje.ok
        ? <>Correcto: {TIPOS_DEF[envio.destino].rama.toLowerCase()} {TIPOS_DEF[envio.destino].etq.toLowerCase()}</>
        : <>No es {TIPOS_DEF[envio.destino].etq.toLowerCase()}: revisa la pista</>
      : tarjeta
        ? <>«{tarjeta.nombre}»: ¿categorías o cantidades?</>
        : <>Ronda terminada con {errores} {errores === 1 ? "error" : "errores"}</>;
  } else if (modo === "poblacion") {
    lectura = censando
      ? <>El censo recorre a todos, fila por fila</>
      : muestra
        ? <>n = {num(muestra.length)}: x̄ = {num(resumen!.media, 2)}{censado ? <> frente a μ = {num(PARAMETRO.media, 2)}</> : <>, μ aún desconocida</>}</>
        : censado
          ? <>Censo: μ = {num(PARAMETRO.media, 2)} hermanos</>
          : <>Nadie sabe cuántos hermanos hay: pregunta</>;
  } else {
    lectura = !resumen
      ? <>Toma una muestra para ver la tabla</>
      : revelar
        ? <>{dentro} de 5 intervalos contienen el valor real</>
        : <>Barras: lo observado. Rayitas: lo que se infiere</>;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los cálculos siguen aquí.</div>
    </div>
  );

  /* ── Panel «Controles» por modo ────────────────────────────────────── */
  const dentroK = (k: number) => resumen !== null && Math.abs(PARAMETRO.relativas[k]! - resumen.relativas[k]!) <= margen95(resumen.relativas[k]!, resumen.n);
  const idxN = Math.max(0, TAMANOS.indexOf(n));

  let controles: ReactNode = null;
  if (modo === "variables") {
    controles = (
      <>
        <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: T.text3, letterSpacing: "0.06em" }}>{tarjeta ? `TARJETA ${idx + 1} DE ${ronda.length}` : "RONDA COMPLETA"}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 2 }}>{tarjeta ? tarjeta.nombre : `${errores} ${errores === 1 ? "error" : "errores"}`}</div>
            {tarjeta && <div style={{ fontSize: 14, color: T.text2, marginTop: 2 }}>{tarjeta.ejemplos}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= mejorEstrellas ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
          </div>
        </div>

        {(["Cualitativa", "Cuantitativa"] as const).map((rama) => (
          <Bloque key={rama} titulo={rama}>
            <div className="ve-clasif">
              {TIPOS.filter((t) => TIPOS_DEF[t].rama === rama).map((t) => {
                const d = TIPOS_DEF[t];
                return (
                  <button key={t} className="ve-bin" disabled={!tarjeta || envio !== null} onClick={() => clasificar(t)} style={{ ["--vec" as string]: d.color }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 900, color: "#fff" }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                      {d.etq}
                    </span>
                    <span style={{ fontSize: 14, color: T.text2, marginTop: 3, textAlign: "left" }}>{d.pregunta}</span>
                  </button>
                );
              })}
            </div>
          </Bloque>
        ))}

        {mensaje && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 11, border: `1px solid ${mensaje.ok ? `${OK}55` : "#FF8A3C55"}`, background: mensaje.ok ? "rgba(52,211,153,0.08)" : "rgba(255,138,60,0.08)", fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            <i className={`fa-solid ${mensaje.ok ? "fa-circle-check" : "fa-rotate-left"}`} style={{ marginRight: 7, color: mensaje.ok ? OK : "#FF8A3C" }} />
            {mensaje.texto}
          </div>
        )}

        {rondaEstrellas !== null && (
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {[1, 2, 3].map((k) => (
                <i key={k} className="fa-solid fa-star" style={{ fontSize: 17, color: k <= rondaEstrellas ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
              ))}
              <span style={{ fontSize: 14, fontWeight: 900, color: OK, marginLeft: 4 }}>
                Ronda con {errores} {errores === 1 ? "error" : "errores"}
              </span>
            </div>
            <button className="ve-opt" data-on="true" onClick={nuevaRonda} style={{ ["--vec" as string]: accent, background: `rgba(${color.rgba},0.16)` }}>
              <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
              Nueva ronda
            </button>
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>Estrellas: 3 sin errores, 2 con uno o dos, 1 con más.</div>
      </>
    );
  } else if (modo === "poblacion") {
    controles = (
      <>
        <Bloque titulo="Experimento: ¿cuánto pesa el tamaño de la muestra?" icono="fa-people-group">
          <button className="ve-toggle" onClick={hacerCenso} disabled={censando || censado} style={{ ["--vec" as string]: modoCol, opacity: censado ? 0.7 : 1 }}>
            <i className={`fa-solid ${censando ? "fa-spinner fa-spin" : censado ? "fa-circle-check" : "fa-clipboard-list"}`} style={{ marginRight: 9, color: modoCol }} />
            {censando ? "Censando a toda la escuela…" : censado ? `Censo hecho: ${num(N_POBLACION)} entrevistas` : `Hacer el censo (${num(N_POBLACION)} entrevistas)`}
          </button>

          <Deslizador
            label="Tamaño de la muestra n"
            icon="fa-hand-pointer"
            colr={accent}
            valor={`n = ${n}`}
            min={0}
            max={TAMANOS.length - 1}
            step={1}
            value={idxN}
            onChange={(v) => tomarMuestra(TAMANOS[v]!)}
            hintL={`${TAMANOS[0]}`}
            hintR={`${TAMANOS[TAMANOS.length - 1]}`}
          />
          <div className="ve-dos">
            <button className="ve-toggle" onClick={() => tomarMuestra(n)} style={{ ["--vec" as string]: accent }}>
              <i className="fa-solid fa-shuffle" style={{ marginRight: 9, color: accent }} />
              Otra de {n}
            </button>
            <button className="ve-toggle" onClick={() => repetirEncuestas(n)} style={{ ["--vec" as string]: "#fbbf24" }}>
              <i className="fa-solid fa-repeat" style={{ marginRight: 9, color: "#fbbf24" }} />
              Repetir {REPETICIONES} veces
            </button>
          </div>
        </Bloque>

        <Bloque titulo="Las medias de tus encuestas" icono="fa-chart-simple">
          <DispersionMedias puntos={puntos} censado={censado} />
          <Comparacion puntos={puntos} />
        </Bloque>

        <Bloque titulo="Parámetro y estadístico" icono="fa-scale-balanced">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="Población · media μ" value={censado ? num(PARAMETRO.media, 2) : "?"} col={modoCol} />
            <Dato label="Muestra · media x̄" value={resumen ? num(resumen.media, 2) : "—"} col={accent} />
            <Dato label="Población · sin hermanos" value={censado ? pct(PARAMETRO.relativas[0]!, 0) : "?"} />
            <Dato label="Muestra · sin hermanos" value={resumen ? pct(resumen.relativas[0]!) : "—"} />
          </div>
        </Bloque>

        {historial.length > 0 && (
          <Bloque titulo="Últimas encuestas" icono="fa-clock-rotate-left">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {historial.map((h, i) => {
                const lejos = censado ? Math.abs(h.media - PARAMETRO.media) : null;
                return (
                  <span key={i} style={{ fontSize: 14, color: T.text2, padding: "4px 9px", borderRadius: 999, border: `1px solid ${lejos !== null && lejos > 0.25 ? "#f8717155" : T.line}`, ...NUM }}>
                    n = {h.n} · x̄ = {num(h.media, 2)}
                    {lejos !== null ? ` (${h.media >= PARAMETRO.media ? "+" : "−"}${num(Math.abs(h.media - PARAMETRO.media), 2)})` : ""}
                  </span>
                );
              })}
            </div>
            {!censado && <div style={{ fontSize: 14, color: T.text3 }}>Haz el censo para saber qué tan lejos quedó cada encuesta.</div>}
          </Bloque>
        )}
      </>
    );
  } else {
    controles = (
      <>
        <Bloque titulo="Tamaño de la muestra" icono="fa-hand-pointer">
          <div className="ve-opts">
            {TAMANOS.map((t) => (
              <button key={t} className="ve-opt" data-on={resumen?.n === t} onClick={() => tomarMuestra(t)} style={{ ["--vec" as string]: accent, background: resumen?.n === t ? `rgba(${color.rgba},0.16)` : "transparent", minWidth: 64, ...NUM }}>
                n = {t}
              </button>
            ))}
          </div>
        </Bloque>

        {resumen && (
          <Bloque titulo="Tabla de frecuencias de la muestra" icono="fa-table">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, fontSize: 14, ...NUM }}>
                <thead>
                  <tr style={{ color: T.text3, fontSize: 13 }}>
                    <th style={{ textAlign: "left", padding: 4 }}>Hermanos</th>
                    <th style={{ padding: 4 }}>f abs.</th>
                    <th style={{ padding: 4 }}>f rel.</th>
                    <th style={{ padding: 4 }}>Escuela 95 %</th>
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
                          <td className="ve-td" style={{ color: dentroK(k) ? OK : "#f87171" }}>
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
            <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
              f relativa = f absoluta ÷ {resumen.n} (descriptiva). Intervalo: f relativa ± 1.96·√(p(1 − p)/n), con corrección por población finita (inferencial).
            </div>
            <button
              className="ve-toggle"
              onClick={() => {
                setRevelar((r) => !r);
                setRevelo(true);
                blip();
              }}
              style={{ ["--vec" as string]: "#fbbf24" }}
            >
              <i className={`fa-solid ${revelar ? "fa-eye-slash" : "fa-eye"}`} style={{ marginRight: 9, color: "#fbbf24" }} />
              {revelar ? "Ocultar la población" : "Revelar la población"}
            </button>
          </Bloque>
        )}

        <Bloque titulo={`¿Descriptiva o inferencial? · ${aciertosAfirm}/${AFIRMACIONES.length}`} icono="fa-circle-question">
          <div style={{ display: "grid", gap: 8 }}>
            {AFIRMACIONES.map((a, i) => {
              const r = respuestas[i];
              const bien = r === a.rama;
              return (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${r ? (bien ? `${OK}55` : "#FF8A3C55") : T.line}` }}>
                  <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.45 }}>{a.texto}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {(["descriptiva", "inferencial"] as Rama[]).map((op) => (
                      <button key={op} className="ve-opt ve-afirm" data-on={r === op} onClick={() => responder(i, op)} style={{ ["--vec" as string]: r === op ? (bien ? OK : "#FF8A3C") : modoCol, background: r === op ? (bien ? "rgba(52,211,153,0.14)" : "rgba(255,138,60,0.12)") : "transparent", padding: "6px 11px" }}>
                        {op === "descriptiva" ? "Descriptiva" : "Inferencial"}
                      </button>
                    ))}
                    {r && <span style={{ fontSize: 14, color: bien ? OK : "#FF8A3C" }}>{bien ? a.porque : "Revisa: ¿se queda en los datos observados o habla de alguien más?"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Bloque>
      </>
    );
  }

  const estilos = (
    <style>{`
      .ve-opts { display:flex; flex-wrap:wrap; gap:7px; }
      .ve-opt { cursor:pointer; border:1px solid var(--vec); border-radius:10px; padding:9px 12px; font-size:14px;
        font-weight:800; color:#fff; background:transparent; transition:all .15s; }
      .ve-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
      .ve-opt:hover { background:rgba(255,255,255,0.06); }
      .ve-clasif { display:grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
      .ve-dos { display:grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap:8px; }
      .ve-bin { cursor:pointer; display:flex; flex-direction:column; align-items:flex-start; padding:11px 13px; border-radius:12px;
        border:1px solid var(--vec); background:rgba(4,10,22,0.45); transition:all .15s; }
      .ve-bin:hover:not(:disabled) { background:rgba(255,255,255,0.07); transform:translateY(-1px); }
      .ve-bin:disabled { cursor:default; opacity:0.55; }
      .ve-opt:focus-visible, .ve-toggle:focus-visible, .ve-bin:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
      .ve-toggle { width:100%; cursor:pointer; border:1px solid var(--vec); border-radius:11px; padding:11px 14px;
        background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
      .ve-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
      .ve-toggle:disabled { cursor:default; }
      .ve-td { padding:6px; text-align:center; border-radius:6px; background:rgba(4,10,22,0.45); color:${T.text2}; font-weight:800; }
    `}</style>
  );

  const parrafo = (txt: string) => <p style={{ margin: 0, color: T.text2, lineHeight: 1.55 }}>{txt}</p>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
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
      leyenda={
        modo !== "variables" ? (
          <>
            {CATEGORIAS.map((c, k) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: COLORES_CAT[k] }} />
                {c} {c === "1" ? "hermano" : "hermanos"}
              </div>
            ))}
          </>
        ) : undefined
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {estilos}
              {controles}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
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
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Los datos al servicio de las decisiones" icono="fa-chart-pie">
                {parrafo(PROBLEMA)}
              </Bloque>
              <Bloque titulo={`Lectura A1 · ${TITULO_A1}`} icono="fa-book-open">
                <div style={{ display: "grid", gap: 10 }}>
                  {LECTURA_A1.map((p, i) => (
                    <div key={i} style={{ color: T.text2, lineHeight: 1.55 }}>
                      {p}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-comments">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {INSTRUCCIONES.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </Bloque>
              <Bloque titulo="¿Sabías que? (lectura A1)" icono="fa-flask-vial">
                {parrafo(SABIAS_A1)}
              </Bloque>
              <Bloque titulo="Actividad del glosario A5" icono="fa-pen-to-square">
                {parrafo(ACTIVIDAD_A5)}
                {parrafo("Las cuatro variables de la actividad están entre las tarjetas del clasificador.")}
              </Bloque>
              <Bloque titulo="Hechos (quiz A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
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
                      <span style={{ color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                      <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                        <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
                        {gi.ejemplo}
                      </div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={VARIABLES_ESTADISTICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La lectura A1, sus preguntas y su recuadro, los hechos del quiz A4, el glosario A5 y el quiz A2 son <strong>verbatim</strong> del material de la plataforma. Las
                variables del clasificador salen de esas mismas actividades. La escuela de 1 500 estudiantes es la del ejemplo del quiz A4; cuántos hermanos tiene cada uno es un{" "}
                <strong>dato ilustrativo</strong> del laboratorio, fijado con semilla. Las muestras usan el generador aleatorio del navegador. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Las medias de las encuestas, una fila por tamaño de muestra ─────────── */
const X0 = 0.8;
const X1 = 2.4;
const xDe = (m: number) => 14 + ((Math.min(X1, Math.max(X0, m)) - X0) / (X1 - X0)) * 292;

function DispersionMedias({ puntos, censado }: { puntos: Punto[]; censado: boolean }) {
  return (
    <svg viewBox="0 0 320 168" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, background: "rgba(2,12,28,0.5)", border: `1px solid ${T.line}` }} role="img" aria-label="Medias de las encuestas por tamaño de muestra">
      {TAMANOS.map((t, r) => {
        const y = 30 + r * 32;
        return (
          <g key={t}>
            <line x1={14} x2={306} y1={y} y2={y} stroke="rgba(255,255,255,0.1)" />
            <text x={16} y={y - 8} fontSize={13} fontWeight={800} fill={COL_N[r]}>
              n = {t}
            </text>
            {puntos
              .filter((p) => p.n === t)
              .map((p, i) => (
                <circle key={i} cx={xDe(p.media)} cy={y + ((i * 7) % 11) - 5} r={3.6} fill={COL_N[r]} fillOpacity={0.75} />
              ))}
          </g>
        );
      })}
      {censado && (
        <g>
          <line x1={xDe(PARAMETRO.media)} x2={xDe(PARAMETRO.media)} y1={8} y2={150} stroke="#fff" strokeDasharray="4 3" strokeWidth={1.6} />
          <text x={xDe(PARAMETRO.media) + 5} y={14} fontSize={13} fontWeight={900} fill="#fff">
            μ = {num(PARAMETRO.media, 2)}
          </text>
        </g>
      )}
      <text x={14} y={163} fontSize={13} fill="#94a3b8">
        {num(X0, 1)}
      </text>
      <text x={306} y={163} fontSize={13} fill="#94a3b8" textAnchor="end">
        {num(X1, 1)} hermanos (media)
      </text>
    </svg>
  );
}

function Comparacion({ puntos }: { puntos: Punto[] }) {
  const rango = (t: number) => {
    const v = puntos.filter((p) => p.n === t).map((p) => p.media);
    return v.length >= 5 ? { min: Math.min(...v), max: Math.max(...v) } : null;
  };
  const filas = TAMANOS.map((t) => ({ t, r: rango(t) })).filter((f) => f.r !== null);
  if (filas.length < 2) {
    return <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5 }}>Pulsa «Repetir 20 veces» con n = 20 y luego con n = 500. Cada punto es la media de una encuesta.</div>;
  }
  return (
    <div style={{ display: "grid", gap: 4, fontSize: 14, color: T.text2, ...NUM }}>
      {filas.map(({ t, r }) => (
        <div key={t}>
          n = {t}: medias de {num(r!.min, 2)} a {num(r!.max, 2)} (ancho {num(r!.max - r!.min, 2)})
        </div>
      ))}
      <div style={{ color: "#fff", fontWeight: 700 }}>Mientras más grande n, más juntas caen las medias.</div>
    </div>
  );
}
