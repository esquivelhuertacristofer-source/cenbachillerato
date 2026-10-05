"use client";

/**
 * Laboratorio 3D — "People, clothes and weather: la plaza de la colonia".
 * Práctica anclada a IN-I-P06-A4 (quiz «People, clothes & weather») y
 * IN-I-P06-A2 (completa el texto); progresión 6 de la UAC IN-I. El marco
 * teórico es la lectura A1, los hechos salen del verdadero/falso A5 y el
 * glosario del A6.
 *
 * Tres modos:
 *  (1) What's the weather like? — cambiar el cielo de la plaza y, en el reto
 *      del reportero, ESCRIBIR en inglés el clima que marca la escena.
 *  (2) Dress for the weather — leer un pronóstico en inglés, vestir a una
 *      persona y ver en la calle si pasa frío, calor o se moja; después armar
 *      con fichas «… is wearing … because it is …».
 *  (3) Who is it? — identificar a una persona por su descripción y escribir
 *      la descripción de otra, con retroalimentación de gramática y de
 *      lenguaje respetuoso.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { hablarLab, callarLab } from "./lab-voz";
import { LabShell, Bloque, BotonHerramienta, Deslizador } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { CLIMA_VESTIMENTA_INGLES_FICHA } from "./clima-vestimenta-ingles-ficha";
import type { VistaClima } from "./ClimaVestimentaInglesScene";
import {
  type Modo,
  type Condicion,
  type Reporte,
  type ResultadoClima,
  type PrendaId,
  type Atuendo,
  type Ficha,
  type Aviso,
  type ResultadoDescripcion,
  MODOS,
  MODOS_DEF,
  CONDICIONES,
  CONDICION_DEF,
  TEMP_DEF,
  palabraTemp,
  fraseClima,
  nuevoReporte,
  revisarClima,
  T_MIN,
  T_MAX,
  T_MAX_NIEVE,
  aFahrenheit,
  signo,
  PRENDA_DEF,
  PRONOSTICOS,
  OPCIONES_RANURA,
  ATUENDO_VACIO,
  evaluarAtuendo,
  fichasOracion,
  oracionObjetivo,
  revisarOracion,
  PERSONAS,
  persona,
  RONDAS_QUIEN,
  porQueNo,
  evaluarDescripcion,
  peloEn,
  ropaEn,
  ENUNCIADOS,
  rondaEnunciados,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A6,
  PISTAS_A3,
  REFLEXION_A3,
  IDEAS_IN2,
  MODELO_IN2,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A4,
  HUECOS_A2,
  type PalabraTemp,
} from "./clima-vestimenta-ingles-data";

const ClimaScene = dynamic(() => import("./ClimaVestimentaInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-cloud-sun-rain fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la plaza de la colonia en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-clima-vestimenta-ingles-reto";
const WARN = "#FF8A3C";
const ORDEN_PARADA = ["guadalupe", "carmen", "diego", "sofia", "ernesto", "mateo"];
const RONDA_INICIAL = rondaEnunciados(mulberry32(11));
const REPORTE_INICIAL = nuevoReporte(mulberry32(7));

const ES_CONDICION: Record<Condicion, string> = { sunny: "hace sol", cloudy: "está nublado", rainy: "está lloviendo", windy: "hace viento", foggy: "hay niebla", snowing: "está nevando" };
const ES_TEMP: Record<PalabraTemp, string> = { cold: "hace frío", cool: "está fresco", warm: "está templado", hot: "hace calor" };

/* ── Tarjeta de estrellas: ¿describe o juzga? ─────────────────────────── */
function DescribeCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ENUNCIADOS[ronda[pos] ?? 0]!;

  const responder = (describe: boolean) => {
    if (resuelto !== null) return;
    const ok = describe === actual.describe;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${actual.describe ? "Describe" : "Juzga"}: ${actual.porque}`);
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
          ¿Describe o juzga?
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
            Oración {pos + 1} de {ronda.length} · ¿dice algo que se observa o da una opinión sobre la persona?
          </div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="cv-opt cv-dj" data-on="true" onClick={() => responder(true)} style={{ ["--cvc" as string]: OK }}>
              <i className="fa-solid fa-eye" style={{ marginRight: 8 }} />
              Describe: se observa
            </button>
            <button className="cv-opt cv-dj" data-on="true" onClick={() => responder(false)} style={{ ["--cvc" as string]: WARN }}>
              <i className="fa-solid fa-gavel" style={{ marginRight: 8 }} />
              Juzga: es una opinión
            </button>
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

export function LabClimaVestimentaIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("clima");

  // ── Clima
  const [condicion, setCondicion] = useState<Condicion>("sunny");
  const [tempC, setTempC] = useState(26);
  const [vistos, setVistos] = useState<Set<Condicion>>(() => new Set(["sunny"]));
  const [retoActivo, setRetoActivo] = useState(false);
  const [reporte, setReporte] = useState<Reporte>(REPORTE_INICIAL);
  const [textoClima, setTextoClima] = useState("");
  const [resClima, setResClima] = useState<ResultadoClima | null>(null);
  const [reportesOk, setReportesOk] = useState(0);

  // ── Vestir
  const [fIdx, setFIdx] = useState(0);
  const [atuendo, setAtuendo] = useState<Atuendo>(ATUENDO_VACIO);
  const [revisado, setRevisado] = useState(false);
  const [categorias, setCategorias] = useState<Set<string>>(() => new Set());
  const [vestidos, setVestidos] = useState<Set<string>>(() => new Set());
  const [puestas, setPuestas] = useState<Ficha[]>([]);
  const [avisosOracion, setAvisosOracion] = useState<Aviso[] | null>(null);
  const [oracionOk, setOracionOk] = useState(false);

  // ── Quién
  const [ronda, setRonda] = useState(0);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [identificadas, setIdentificadas] = useState<Set<string>>(() => new Set());
  const [describirId, setDescribirId] = useState<string>("diego");
  const [textoDesc, setTextoDesc] = useState("");
  const [resDesc, setResDesc] = useState<ResultadoDescripcion | null>(null);
  const [descritas, setDescritas] = useState<Set<string>>(() => new Set());
  const [enTuTurno, setEnTuTurno] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
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
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      callarLab();
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
  /**
   * Pronunciación con la voz de la plataforma (`lab-voz.ts`).
   *
   * Lo único propio de este laboratorio es la preparación del texto, que sí se
   * queda: aquí se dicen temperaturas, y «−5 °C» tal cual no se lee. Se
   * escribe con palabras antes de mandarlo a hablar, y es ESA frase —la que de
   * veras suena— la que está grabada.
   */
  const hablar = (texto: string) =>
    hablarLab(
      texto
        .replace(/−(\d)/g, "minus $1")
        .replace(/-(\d)/g, "minus $1")
        .replace(/°C/g, " degrees Celsius")
        .replace(/°F/g, " degrees Fahrenheit")
    );

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Clima ─────────────────────────────────────────────────────────── */
  const condEscena = retoActivo ? reporte.condicion : condicion;
  const tempEscena = retoActivo ? reporte.tempC : tempC;
  const elegirCondicion = (c: Condicion) => {
    setCondicion(c);
    if (c === "snowing" && tempC > T_MAX_NIEVE) setTempC(0);
    setVistos((s) => new Set(s).add(c));
    blip();
  };
  const empezarReto = () => {
    setRetoActivo(true);
    setReporte((r) => nuevoReporte(Math.random, r));
    setTextoClima("");
    setResClima(null);
    blip();
  };
  const comprobarClima = () => {
    const r = revisarClima(textoClima, reporte);
    setResClima(r);
    sfx(r.ok);
    if (r.ok) setReportesOk((n) => n + 1);
  };
  const siguienteReporte = () => {
    setReporte((r) => nuevoReporte(Math.random, r));
    setTextoClima("");
    setResClima(null);
    blip();
  };
  const salirReto = () => {
    setRetoActivo(false);
    setResClima(null);
    blip();
  };

  /* ── Vestir ────────────────────────────────────────────────────────── */
  const f = PRONOSTICOS[fIdx]!;
  const quien = persona(f.personaId);
  const resAtuendo = evaluarAtuendo(atuendo, f);
  const fichas = resAtuendo.ok ? fichasOracion(atuendo, f) : [];
  const libres = fichas.filter((x) => !puestas.some((p) => p.k === x.k));

  const cambiarAtuendo = (nuevo: Atuendo) => {
    setAtuendo(nuevo);
    setRevisado(false);
    setPuestas([]);
    setAvisosOracion(null);
    blip();
  };
  const ponerPrenda = (id: PrendaId) => {
    const r = PRENDA_DEF[id].ranura;
    if (r === "extra") cambiarAtuendo({ ...atuendo, extras: atuendo.extras.includes(id) ? atuendo.extras.filter((x) => x !== id) : [...atuendo.extras, id] });
    else cambiarAtuendo({ ...atuendo, [r]: atuendo[r] === id ? null : id });
  };
  const revisarAtuendo = () => {
    setRevisado(true);
    sfx(resAtuendo.ok);
    if (resAtuendo.ok) {
      setCategorias((s) => new Set(s).add(f.categoria));
      setVestidos((s) => new Set(s).add(f.id));
    }
  };
  const elegirPronostico = (i: number) => {
    setFIdx(i);
    setAtuendo(ATUENDO_VACIO);
    setRevisado(false);
    setPuestas([]);
    setAvisosOracion(null);
    blip();
  };
  const comprobarOracion = () => {
    const av = revisarOracion(
      puestas.map((p) => p.w),
      atuendo,
      f,
    );
    setAvisosOracion(av);
    sfx(av.length === 0);
    if (av.length === 0) setOracionOk(true);
  };

  /* ── Quién ─────────────────────────────────────────────────────────── */
  const rq = RONDAS_QUIEN[ronda]!;
  const correcta = persona(rq.personaId);
  const elegida = seleccion ? persona(seleccion) : null;
  const acierto = seleccion ? seleccion === rq.personaId : null;
  const elegirPersona = (id: string) => {
    if (enTuTurno) {
      setDescribirId(id);
      setResDesc(null);
      blip();
      return;
    }
    if (seleccion === rq.personaId) return;
    setSeleccion(id);
    const ok = id === rq.personaId;
    sfx(ok);
    if (ok) setIdentificadas((s) => new Set(s).add(id));
  };
  const siguienteRonda = () => {
    setRonda((r) => (r + 1) % RONDAS_QUIEN.length);
    setSeleccion(null);
    blip();
  };
  const dq = persona(describirId);
  const comprobarDescripcion = () => {
    const r = evaluarDescripcion(textoDesc, dq);
    setResDesc(r);
    sfx(r.ok);
    if (r.ok) setDescritas((s) => new Set(s).add(dq.id));
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "clima") {
      setCondicion("sunny");
      setTempC(26);
      setRetoActivo(false);
      setResClima(null);
      setTextoClima("");
    }
    if (modo === "vestir") {
      setAtuendo(ATUENDO_VACIO);
      setRevisado(false);
      setPuestas([]);
      setAvisosOracion(null);
    }
    if (modo === "quien") {
      setSeleccion(null);
      setResDesc(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { txt: string; done: boolean }[] = [
    { txt: "Ver la plaza con los seis tipos de clima", done: vistos.size === CONDICIONES.length },
    { txt: "Escribir en inglés tres reportes del clima correctos", done: reportesOk >= 3 },
    { txt: "Vestir bien a alguien para frío, para lluvia y para calor", done: categorias.size === 3 },
    { txt: "Armar la oración «… is wearing … because it is …»", done: oracionOk },
    { txt: "Identificar a las seis personas por su descripción", done: identificadas.size === PERSONAS.length },
    { txt: "Escribir la descripción correcta y respetuosa de dos personas", done: descritas.size >= 2 },
    { txt: "Clasificar oraciones en «describe» o «juzga» y ganar estrellas", done: clasifico },
    { txt: "Aprobar el quiz evaluable (A4)", done: quizAprobado },
    { txt: "Completar el texto (A2)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaClima = modo;
  let pie = "";
  if (modo === "clima") {
    if (retoActivo) {
      pie = resClima?.ok ? `Correct! ${fraseClima(reporte.condicion, reporte.tempC)}` : "Mira el cielo y el termómetro de la plaza y escribe cómo está el clima en inglés: It is … and it is …";
    } else {
      pie = `${fraseClima(condicion, tempC)} — En español: ${ES_CONDICION[condicion]} y ${ES_TEMP[palabraTemp(tempC)]}.`;
    }
  } else if (modo === "vestir") {
    pie = revisado
      ? resAtuendo.ok
        ? `${quien.nombre} sale a la calle cómod${quien.pron === "she" ? "a" : "o"}: la ropa va con el pronóstico. Ahora arma la oración.`
        : `${quien.nombre} sale a la calle y ${resAtuendo.problema === "mojado" ? "se moja" : resAtuendo.problema === "calor" ? "se acalora" : "tiembla de frío"}. ${[...resAtuendo.prendas.filter((p) => p.estado === "mal").map((p) => p.razon), ...resAtuendo.faltan.map((x) => x.texto)][0] ?? ""}`
      : `«${f.texto}» Elige la ropa de ${quien.nombre} y revisa el atuendo.`;
  } else if (enTuTurno) {
    pie = `Escribe cómo es ${dq.nombre} y qué lleva puesto. Describe lo que se ve: estatura, cabello, ropa. Sin opiniones.`;
  } else {
    pie = `«${rq.texto}»`;
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
  const escuchar = (texto: string, etq = "Escuchar") => (
    <button className="cv-listen" onClick={() => hablar(texto)} title="Escuchar en inglés" aria-label={`${etq}: ${texto}`}>
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      {etq}
    </button>
  );
  const ingles = (texto: string, extra?: ReactNode) => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, padding: "11px 13px", borderRadius: 12, background: "rgba(4,10,22,0.5)", border: `1px solid ${modoCol}44` }}>
      <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 800, lineHeight: 1.45, fontFamily: "ui-rounded, system-ui, sans-serif" }} lang="en">
        {texto}
        {extra}
      </div>
      {escuchar(texto)}
    </div>
  );
  const listaAvisos = (xs: Aviso[]) =>
    xs.map((a, i) => (
      <div key={i} style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: a.tipo === "error" ? WARN : "#7dd3fc", display: "flex", gap: 7 }}>
        <i className={`fa-solid ${a.tipo === "error" ? "fa-triangle-exclamation" : "fa-lightbulb"}`} style={{ marginTop: 3 }} />
        <span>{a.texto}</span>
      </div>
    ));

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "clima") {
    control = (
      <>
        {sub("1 · Explora: cambia el cielo de la plaza")}
        <div className="cv-opts" style={{ opacity: retoActivo ? 0.45 : 1, pointerEvents: retoActivo ? "none" : "auto" }}>
          {CONDICIONES.map((c) => (
            <button key={c} className="cv-opt cv-cond" data-on={c === condicion} onClick={() => elegirCondicion(c)} disabled={retoActivo} style={{ ["--cvc" as string]: modoCol, background: c === condicion ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${CONDICION_DEF[c].icono}`} style={{ marginRight: 8 }} />
              <span lang="en">{c}</span>
              {vistos.has(c) && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, opacity: retoActivo ? 0.45 : 1, pointerEvents: retoActivo ? "none" : "auto" }}>
          <Deslizador label="temperatura de la plaza" icon="fa-temperature-half" colr={TEMP_DEF[palabraTemp(tempC)].col} valor={`${signo(tempC)} °C · ${aFahrenheit(tempC)} °F`} min={T_MIN} max={condicion === "snowing" ? T_MAX_NIEVE : T_MAX} step={1} value={tempC} onChange={setTempC} hintL="frío" hintR="calor" />
        </div>
        {condicion === "snowing" && !retoActivo && nota("La nieve solo cae con el aire cerca o por debajo de 0 °C: con nieve el termómetro no pasa de 2 °C.", T.text3, "fa-snowflake")}
        <div className="cv-escala">
          {(Object.keys(TEMP_DEF) as PalabraTemp[]).map((k) => (
            <div key={k} data-on={!retoActivo && palabraTemp(tempC) === k} style={{ ["--cvc" as string]: TEMP_DEF[k].col }}>
              <strong lang="en">{k}</strong>
              <span>{TEMP_DEF[k].es}</span>
              <small>{TEMP_DEF[k].rango}</small>
            </div>
          ))}
        </div>
        {!retoActivo && <div style={{ marginTop: 10 }}>{ingles(fraseClima(condicion, tempC))}</div>}

        {sub("2 · Reto del reportero: escribe tú el clima")}
        {!retoActivo ? (
          <>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>La plaza cambiará a un clima al azar. Sin ver las palabras, escribe en inglés cómo está el cielo y la temperatura (por ejemplo: It&apos;s cloudy and cool).</div>
            <div className="cv-opts" style={{ marginTop: 10 }}>
              <button className="cv-toggle" onClick={empezarReto} style={{ ["--cvc" as string]: accent }}>
                <i className="fa-solid fa-microphone-lines" style={{ marginRight: 9, color: accent }} />
                Empezar el reto del reportero · correctos {reportesOk}/3
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginBottom: 8 }}>
              Reporte en vivo desde la plaza. El termómetro marca <strong style={{ color: "#fff", ...NUM }}>{signo(reporte.tempC)} °C</strong>. What&apos;s the weather like?
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                className="cv-input"
                aria-label="Tu reporte del clima en inglés"
                placeholder="It is …"
                value={textoClima}
                disabled={!!resClima?.ok}
                lang="en"
                spellCheck={false}
                onChange={(e) => {
                  setTextoClima(e.target.value);
                  if (resClima && !resClima.ok) setResClima(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && textoClima.trim() && !resClima?.ok) comprobarClima();
                }}
              />
              {!resClima?.ok ? (
                <button className="cv-opt cv-comprobar" data-on="true" onClick={comprobarClima} disabled={!textoClima.trim()} style={{ ["--cvc" as string]: accent, background: `rgba(${color.rgba},0.18)` }}>
                  <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
                  Comprobar
                </button>
              ) : (
                <button className="cv-opt cv-sig" data-on="true" onClick={siguienteReporte} style={{ ["--cvc" as string]: OK, background: `${OK}1f` }}>
                  <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
                  Otro reporte
                </button>
              )}
            </div>
            {resClima && resClima.ok && nota(<>¡Correcto! Reportes correctos: {reportesOk}/3. Una versión modelo: <span lang="en">{fraseClima(reporte.condicion, reporte.tempC)}</span></>, OK, "fa-circle-check")}
            {resClima && listaAvisos(resClima.avisos)}
            <div className="cv-opts" style={{ marginTop: 10 }}>
              <button className="cv-opt" data-on="false" onClick={salirReto} style={{ ["--cvc" as string]: modoCol }}>
                <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }} />
                Volver a explorar
              </button>
            </div>
            {nota("Se aceptan mayúsculas o minúsculas, «it's» o «it is», «rainy» o «raining», y el orden que quieras.", T.text3)}
          </>
        )}
      </>
    );
  } else if (modo === "vestir") {
    const resaltar = (id: PrendaId) => resAtuendo.prendas.find((p) => p.id === id);
    control = (
      <>
        <div className="cv-opts">
          {PRONOSTICOS.map((x, i) => (
            <button key={x.id} className="cv-opt cv-pron" data-on={i === fIdx} onClick={() => elegirPronostico(i)} style={{ ["--cvc" as string]: modoCol, background: i === fIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${CONDICION_DEF[x.condicion].icono}`} style={{ marginRight: 7 }} />
              {x.lugar.split(",")[0]}
              {vestidos.has(x.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub(`El pronóstico · ${f.lugar}, ${f.cuando}`)}
        {ingles(f.texto)}
        <div style={{ fontSize: 14, color: T.text2, marginTop: 8, lineHeight: 1.5 }}>
          Viste a <strong style={{ color: "#fff" }}>{quien.nombre}</strong> <span lang="en">({quien.pron})</span>. Elige una prenda de arriba, una de abajo y calzado; los complementos son opcionales.
        </div>
        {(["top", "bottom", "shoes", "extra"] as const).map((r) => (
          <div key={r}>
            {sub(r === "top" ? "Arriba" : r === "bottom" ? "Abajo" : r === "shoes" ? "Calzado" : "Complementos (puedes elegir varios)")}
            <div className="cv-opts">
              {OPCIONES_RANURA[r].map((id) => {
                const on = r === "extra" ? atuendo.extras.includes(id) : atuendo[r] === id;
                const j = revisado && on ? resaltar(id) : undefined;
                const col = j ? (j.estado === "bien" ? OK : j.estado === "mal" ? WARN : "#fbbf24") : modoCol;
                return (
                  <button key={id} className="cv-opt cv-prenda" data-on={on} onClick={() => ponerPrenda(id)} style={{ ["--cvc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                    <span className="cv-dot" style={{ background: PRENDA_DEF[id].col }} />
                    <span lang="en">{PRENDA_DEF[id].en}</span>
                    <span style={{ color: T.text3, fontWeight: 600, marginLeft: 6 }}>{PRENDA_DEF[id].es}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <button className="cv-toggle" onClick={revisarAtuendo} disabled={!resAtuendo.completo || revisado} style={{ marginTop: 14, ["--cvc" as string]: accent }}>
          <i className="fa-solid fa-door-open" style={{ marginRight: 9, color: accent }} />
          {revisado ? `${quien.nombre} ya salió a la calle` : resAtuendo.completo ? `Revisar el atuendo: ${quien.nombre} sale a la calle` : "Elige arriba, abajo y calzado para revisar"}
        </button>
        {revisado && (
          <>
            <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
              {resAtuendo.prendas.map((p) => (
                <div key={p.id} style={{ display: "flex", gap: 8, fontSize: 14, lineHeight: 1.45, color: T.text2 }}>
                  <i className={`fa-solid ${p.estado === "bien" ? "fa-circle-check" : p.estado === "mal" ? "fa-circle-xmark" : "fa-circle-minus"}`} style={{ marginTop: 3, color: p.estado === "bien" ? OK : p.estado === "mal" ? WARN : "#fbbf24" }} />
                  <span>
                    <strong style={{ color: "#fff" }} lang="en">
                      {PRENDA_DEF[p.id].en}
                    </strong>{" "}
                    — {p.razon}
                  </span>
                </div>
              ))}
              {resAtuendo.faltan.map((x, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, lineHeight: 1.45, color: WARN }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: 3 }} />
                  <span>{x.texto}</span>
                </div>
              ))}
            </div>
            {!resAtuendo.ok && nota("Cambia lo que haga falta: la persona regresa bajo el toldo y puedes revisar otra vez.", T.text3, "fa-rotate-left")}
            {resAtuendo.ok && (
              <>
                {sub("3 · Arma la oración con fichas")}
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginBottom: 8 }}>
                  Di qué lleva puesto {quien.nombre} y por qué. Toca las fichas en orden; toca una colocada para quitarla. Hay fichas que sobran.
                </div>
                <div className="cv-linea" aria-label="Tu oración">
                  {puestas.length === 0 && <span style={{ color: T.text3, fontSize: 14 }}>Tu oración aparece aquí…</span>}
                  {puestas.map((p) => (
                    <button key={p.k} className="cv-ficha cv-puesta" onClick={() => { setPuestas((xs) => xs.filter((x) => x.k !== p.k)); setAvisosOracion(null); }} disabled={avisosOracion?.length === 0} lang="en">
                      {p.w}
                    </button>
                  ))}
                  {puestas.length > 0 && <span style={{ color: "#fff", fontWeight: 900 }}>.</span>}
                </div>
                <div className="cv-opts" style={{ marginTop: 8 }}>
                  {libres.map((p) => (
                    <button key={p.k} className="cv-ficha cv-libre" onClick={() => { setPuestas((xs) => [...xs, p]); setAvisosOracion(null); blip(); }} disabled={avisosOracion?.length === 0} lang="en">
                      {p.w}
                    </button>
                  ))}
                </div>
                <div className="cv-opts" style={{ marginTop: 10 }}>
                  <button className="cv-opt cv-comp-or" data-on="true" onClick={comprobarOracion} disabled={puestas.length === 0 || avisosOracion?.length === 0} style={{ ["--cvc" as string]: accent, background: `rgba(${color.rgba},0.18)` }}>
                    <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
                    Comprobar la oración
                  </button>
                  <button className="cv-opt" data-on="false" onClick={() => { setPuestas([]); setAvisosOracion(null); }} style={{ ["--cvc" as string]: modoCol }}>
                    <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
                    Borrar
                  </button>
                </div>
                {avisosOracion && avisosOracion.length === 0 && (
                  <div style={{ marginTop: 10 }}>
                    {ingles(`${puestas.map((p) => p.w).join(" ")}.`)}
                    {nota("¡Oración correcta! «is wearing» dice lo que lleva puesto ahora y «because» da la razón.", OK, "fa-circle-check")}
                  </div>
                )}
                {avisosOracion && avisosOracion.length > 0 && listaAvisos(avisosOracion)}
                {avisosOracion && avisosOracion.length > 0 && oracionObjetivo(atuendo, f).length > 0 && nota("Recuerda la estructura: sujeto + is wearing + prendas + because it is + clima.", T.text3)}
              </>
            )}
          </>
        )}
        <div style={{ marginTop: 12, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>Las temperaturas de los pronósticos son valores típicos ilustrativos de cada ciudad y temporada, no mediciones de un día real.</div>
      </>
    );
  } else {
    control = (
      <>
        <div className="cv-tabs2">
          <button className="cv-opt cv-sub" data-on={!enTuTurno} onClick={() => { setEnTuTurno(false); blip(); }} style={{ ["--cvc" as string]: modoCol, background: !enTuTurno ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 8 }} />
            1 · Who is it? ({identificadas.size}/6)
          </button>
          <button className="cv-opt cv-sub" data-on={enTuTurno} onClick={() => { setEnTuTurno(true); setSeleccion(null); blip(); }} style={{ ["--cvc" as string]: modoCol, background: enTuTurno ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-pen" style={{ marginRight: 8 }} />
            2 · Your turn ({descritas.size}/2)
          </button>
        </div>
        {!enTuTurno ? (
          <>
            {sub(`Descripción ${ronda + 1} de ${RONDAS_QUIEN.length}`)}
            {ingles(rq.texto)}
            <div style={{ fontSize: 14, color: T.text2, marginTop: 8 }}>Toca a la persona en la escena o elige su número:</div>
            <div className="cv-opts" style={{ marginTop: 8 }}>
              {ORDEN_PARADA.map((id, k) => {
                const on = seleccion === id;
                const col = on ? (acierto ? OK : WARN) : modoCol;
                return (
                  <button key={id} className="cv-opt cv-num" data-on={on} onClick={() => elegirPersona(id)} aria-label={`Persona ${k + 1}`} style={{ ["--cvc" as string]: col, background: on ? `${col}1f` : "transparent", minWidth: 44 }}>
                    {k + 1}
                    {identificadas.has(id) && <i className="fa-solid fa-check" style={{ marginLeft: 6, color: OK }} />}
                  </button>
                );
              })}
            </div>
            {elegida && acierto && (
              <>
                {nota(
                  <>
                    <strong lang="en">Yes! It is {correcta.nombre}.</strong> Rasgos que coinciden: <span lang="en">{peloEn(correcta)}</span> y <span lang="en">{ropaEn(correcta)}</span>.
                    {correcta.silla ? " Fíjate: la descripción no necesita mencionar la silla de ruedas para identificarlo; su cabello y su ropa bastan." : ""}
                  </>,
                  OK,
                  "fa-circle-check",
                )}
                <div className="cv-opts" style={{ marginTop: 10 }}>
                  <button className="cv-opt cv-sig-ronda" data-on="true" onClick={siguienteRonda} style={{ ["--cvc" as string]: modoCol, background: `${modoCol}1f` }}>
                    Siguiente descripción
                    <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
                  </button>
                </div>
              </>
            )}
            {elegida && !acierto && nota(<>No es la persona {ORDEN_PARADA.indexOf(elegida.id) + 1}. {porQueNo(rq.texto, elegida).join(" ")} Lee la descripción otra vez y elige de nuevo.</>, WARN, "fa-circle-xmark")}
          </>
        ) : (
          <>
            {sub("Elige a quién describir (toca a la persona o su número)")}
            <div className="cv-opts">
              {ORDEN_PARADA.map((id, k) => {
                const on = describirId === id;
                return (
                  <button key={id} className="cv-opt cv-desc-num" data-on={on} onClick={() => elegirPersona(id)} aria-label={`Describir a la persona ${k + 1}`} style={{ ["--cvc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent", minWidth: 44 }}>
                    {k + 1}
                    {descritas.has(id) && <i className="fa-solid fa-check" style={{ marginLeft: 6, color: OK }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 14, color: T.text2, marginTop: 10, lineHeight: 1.5 }}>
              Describe en inglés a la persona {ORDEN_PARADA.indexOf(dq.id) + 1}: <strong style={{ color: "#fff" }}>{dq.nombre}</strong> <span lang="en">({dq.pron})</span>. Menciona al menos tres rasgos, entre ellos su cabello y su ropa.
            </div>
            <textarea
              className="cv-input cv-area"
              aria-label="Tu descripción en inglés"
              placeholder={dq.pron === "she" ? "She is … She has … hair. She is wearing …" : "He is … He has … hair. He is wearing …"}
              value={textoDesc}
              rows={3}
              lang="en"
              spellCheck={false}
              onChange={(e) => {
                setTextoDesc(e.target.value);
                setResDesc(null);
              }}
            />
            <div className="cv-opts" style={{ marginTop: 8 }}>
              <button className="cv-opt cv-comp-desc" data-on="true" onClick={comprobarDescripcion} disabled={!textoDesc.trim()} style={{ ["--cvc" as string]: accent, background: `rgba(${color.rgba},0.18)` }}>
                <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
                Comprobar mi descripción
              </button>
              {textoDesc.trim() && escuchar(textoDesc, "Escuchar mi texto")}
            </div>
            {resDesc && (
              <div style={{ marginTop: 10 }}>
                {resDesc.ok && nota(<>¡Descripción aceptada! Es correcta y respetuosa. Personas descritas: {descritas.size}/2.</>, OK, "fa-circle-check")}
                {resDesc.bien.length > 0 && (
                  <div className="cv-opts" style={{ marginTop: 8 }}>
                    {resDesc.bien.map((b) => (
                      <span key={b} className="cv-chip" style={{ ["--cvc" as string]: OK }} lang="en">
                        <i className="fa-solid fa-check" style={{ marginRight: 5 }} />
                        {b}
                      </span>
                    ))}
                  </div>
                )}
                {listaAvisos([...resDesc.mal.map((t): Aviso => ({ tipo: "error", texto: t })), ...resDesc.gramatica, ...resDesc.juicios.map((j): Aviso => ({ tipo: j.grave ? "error" : "consejo", texto: j.texto })), ...resDesc.faltan.map((t): Aviso => ({ tipo: "error", texto: t })), ...resDesc.nose.map((t): Aviso => ({ tipo: "consejo", texto: t }))])}
              </div>
            )}
            {sub("Pistas (escritura A3)")}
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 4 }}>
              {PISTAS_A3.map((p, i) => (
                <li key={i} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }} lang="en">
                  {p}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 14, color: T.text3, marginTop: 8, lineHeight: 1.5 }}>{REFLEXION_A3}</div>
          </>
        )}
        <div style={{ marginTop: 12, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>Las seis personas son ficticias. Desde la parada no se distingue el color de ojos, así que no cuenta a favor ni en contra.</div>
      </>
    );
  }

  /* Lectura corta sobre la escena (≤ 10 palabras). */
  let lectura: ReactNode;
  if (modo === "clima") {
    lectura = retoActivo ? `Termómetro: ${signo(reporte.tempC)} °C. Escribe el clima en inglés` : fraseClima(condicion, tempC);
  } else if (modo === "vestir") {
    lectura = revisado ? (resAtuendo.ok ? `${quien.nombre} va cómod${quien.pron === "she" ? "a" : "o"}: arma la oración` : resAtuendo.problema === "mojado" ? `${quien.nombre} se moja` : resAtuendo.problema === "calor" ? `${quien.nombre} se acalora` : `${quien.nombre} tiembla de frío`) : `${f.lugar.split(",")[0]} · ${signo(f.tempC)} °C: viste a ${quien.nombre}`;
  } else {
    lectura = enTuTurno ? `Describe a ${dq.nombre} en inglés` : "Lee la descripción y toca a la persona";
  }

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ClimaScene
            vista={vista}
            modoColor={modoCol}
            resetNonce={resetNonce}
            condicion={condEscena}
            tempC={tempEscena}
            pronosticoId={f.id}
            atuendo={atuendo}
            revisado={revisado}
            okAtuendo={resAtuendo.ok}
            problema={resAtuendo.problema}
            orden={ORDEN_PARADA}
            seleccion={enTuTurno ? null : seleccion}
            seleccionOk={acierto}
            describir={enTuTurno ? describirId : null}
            onElegirPersona={elegirPersona}
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
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Cuaderno",
          icono: "fa-pen-to-square",
          contenido: (
            <>
              <style>{cssCv(accent, color.rgba, modoCol)}</style>
              <Bloque titulo={`${def.etq}: qué estás viendo`} icono={def.icono}>
                <p style={{ margin: 0, color: T.text2, ...NUM }}>{pie}</p>
              </Bloque>
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
              <DescribeCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ya describes personas, ropa y clima en inglés." />
              <div style={{ ...card, padding: "20px 18px 22px", marginTop: 22 }}>
                <Eyebrow>
                  <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                  Completa el texto (A2)
                </Eyebrow>
                <div style={{ marginTop: 12 }}>
                  <CompletaTexto data={HUECOS_A2} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
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
              <Bloque titulo="La parada de la colonia" icono="fa-people-roof">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Lectura A1" icono="fa-book-open">
                <strong style={{ color: "#fff" }}>{TITULO_A1}</strong>
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2, whiteSpace: "pre-line" }}>{p}</p>
                ))}
              </Bloque>
              <Bloque titulo="Preguntas de comprensión" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS_A1.map((q, i) => (
                    <li key={i}>
                      {q.pregunta}
                      <details className="cv-guia">
                        <summary>Respuesta guía</summary>
                        <span style={{ color: "#fff" }} lang="en">{q.guia}</span>
                      </details>
                    </li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Infografía IN-II-P04-A1 (Inglés II)" icono="fa-map-location-dot">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS_IN2.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
                <p style={{ margin: 0, color: T.text3 }}>
                  Oraciones modelo del mapa: <span lang="en" style={{ color: "#fff" }}>{MODELO_IN2.join(" · ")}</span>
                </p>
              </Bloque>
              <Bloque titulo="Hechos (verdadero o falso A5)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((hh, i) => (
                    <li key={i}>
                      <strong style={{ color: hh.respuesta ? OK : WARN }}>{hh.respuesta ? "Verdadero" : "Falso"}:</strong> {hh.enunciado} <span style={{ color: T.text3 }}>{hh.retro}</span>
                    </li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A6)" icono="fa-book">
                {GLOSARIO.map((gi, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontWeight: 900, color: accent }} lang="en">{gi.termino}. </span>
                    <span style={{ color: T.text2 }}>{gi.definicion}</span>
                    <div style={{ color: T.text3, marginTop: 4 }} lang="en">
                      <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                      {gi.ejemplo}
                    </div>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A6}
                </p>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CLIMA_VESTIMENTA_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La lectura A1 con sus preguntas, el quiz A4, el texto A2, los hechos A5, el glosario A6 y las pistas de escritura A3 son <strong>verbatim</strong> de IN-I-P06; los extractos y las oraciones modelo de la infografía IN-II-P04-A1 también. Las seis personas, la colonia y sus nombres son <strong>ficticios</strong>. Las temperaturas de los pronósticos son valores típicos <strong>ilustrativos</strong> de cada ciudad y temporada, y los rangos hot / warm / cool / cold son una convención del laboratorio: el inglés no fija grados exactos. La revisión automática de lo que escribes reconoce el vocabulario de la progresión; si una oración correcta no se acepta, consúltala con tu docente. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

const cssCv = (accent: string, rgba: string, modoCol: string) => `
  .cv-tabs2 { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:8px; }
  .cv-opts { display:flex; flex-wrap:wrap; gap:8px; }
  .cv-opt { cursor:pointer; border:1px solid var(--cvc); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; display:inline-flex; align-items:center; text-align:left; }
  .cv-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
  .cv-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
  .cv-opt:disabled { cursor:default; opacity:0.55; }
  .cv-dot { width:12px; height:12px; border-radius:50%; margin-right:7px; border:1px solid rgba(255,255,255,0.35); flex-shrink:0; }
  .cv-toggle { width:100%; cursor:pointer; border:1px solid var(--cvc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
  .cv-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
  .cv-toggle:disabled { cursor:default; opacity:0.6; }
  .cv-escala { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; margin-top:12px; }
  .cv-escala > div { border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:8px 8px; text-align:center; display:flex; flex-direction:column; gap:2px; transition:all .15s; }
  .cv-escala > div[data-on="true"] { border-color:var(--cvc); background:rgba(255,255,255,0.06); box-shadow:0 0 14px -6px var(--cvc); }
  .cv-escala strong { font-size:15px; color:var(--cvc); }
  .cv-escala span { font-size:14px; color:rgba(255,255,255,0.7); }
  .cv-escala small { font-size:14px; color:rgba(255,255,255,0.5); }
  .cv-input { flex:1; min-width:180px; border-radius:10px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:16px; font-weight:700; padding:9px 12px; font-family:inherit; outline:none; transition:all .15s; }
  .cv-input:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.18); }
  .cv-area { width:100%; margin-top:8px; resize:vertical; line-height:1.5; box-sizing:border-box; }
  .cv-listen { cursor:pointer; flex-shrink:0; border:1px solid rgba(255,255,255,0.18); border-radius:9px; padding:8px 10px; font-size:14px; font-weight:800; color:#e0f2fe; background:rgba(56,189,248,0.1); transition:all .15s; }
  .cv-listen:hover { background:rgba(56,189,248,0.22); }
  .cv-linea { min-height:46px; display:flex; flex-wrap:wrap; align-items:center; gap:6px; padding:8px 10px; border-radius:12px; border:1.5px dashed ${modoCol}77; background:rgba(4,10,22,0.45); }
  .cv-ficha { cursor:pointer; border-radius:9px; padding:8px 11px; font-size:14px; font-weight:800; font-family:ui-rounded, system-ui, sans-serif; transition:all .12s; }
  .cv-libre { border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.05); color:#fff; }
  .cv-libre:hover:not(:disabled) { border-color:${modoCol}; background:${modoCol}22; transform:translateY(-1px); }
  .cv-puesta { border:1px solid ${modoCol}; background:${modoCol}26; color:#fff; }
  .cv-ficha:disabled { cursor:default; opacity:0.8; }
  .cv-chip { display:inline-flex; align-items:center; font-size:14px; font-weight:800; padding:4px 9px; border-radius:999px; border:1px solid var(--cvc); color:var(--cvc); background:rgba(52,211,153,0.08); }
  .cv-opt:focus-visible, .cv-toggle:focus-visible, .cv-ficha:focus-visible, .cv-listen:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  .cv-guia summary { cursor:pointer; font-size:14px; color:rgba(255,255,255,0.55); font-weight:800; margin-top:3px; }
`;
