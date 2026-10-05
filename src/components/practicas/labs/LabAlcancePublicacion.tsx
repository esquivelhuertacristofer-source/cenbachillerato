"use client";

/**
 * Laboratorio 3D — "Difusión digital: el alcance de una publicación".
 * Práctica de la progresión 2 de Cultura Digital III (CD-III-P02), anclada a la
 * simulación A2 «Diseña una campaña digital inclusiva con perspectiva de
 * género». El reto evaluable es el verdadero/falso A4; el texto, el A6; el
 * glosario, el A5.
 *
 * Tres modos:
 *  (1) Cascada de compartidos — publicar desde una cuenta, en un formato y a
 *      una hora; ver la cascada en una red de 150 cuentas y distinguir alcance,
 *      impresiones e interacción (y calcular la tasa de interacción).
 *  (2) Campaña comunitaria — audiencia, máximo dos canales, accesibilidad e
 *      indicadores de impacto para un caso de género, salud o ambiente.
 *  (3) Rumor contra dato — un rumor que se comparte 70 % más que la verdad;
 *      decidir quién lo desmiente, cuándo y qué frenos activar.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { ALCANCE_PUBLICACION_FICHA } from "./alcance-publicacion-ficha";
import {
  type Modo,
  type OrigenId,
  type FormatoId,
  type ResultadoCascada,
  type SegmentoId,
  type CanalId,
  type AccesoId,
  type FuenteId,
  type ResultadoRumor,
  type Metrica,
  MODOS,
  MODOS_DEF,
  ORIGENES,
  FORMATOS,
  ACTIVIDAD_HORA,
  horaEtq,
  LLAMADO,
  simularCascada,
  metricasAl,
  tasaInteraccion,
  TOLERANCIA_TASA,
  N_HABITANTES,
  grado,
  SEGMENTOS,
  CANALES,
  ACCESOS,
  SUBGRUPOS,
  CASOS,
  META_COBERTURA,
  META_ACCESIBLE,
  MAX_CANALES,
  coberturaSegmento,
  coberturaAudiencia,
  RUMOR,
  FUENTES,
  FACTOR_FALSO,
  EFECTO_PAUSA,
  SALTOS_LIMITE,
  simularRumor,
  rumorAl,
  METRICAS,
  METRICA_DEF,
  DATOS_METRICA,
  rondaMetricas,
  estrellasPorErrores,
  mulberry32,
  PROPOSITO,
  CONTENIDOS_PROGRESION,
  SIMULACION_A2,
  REFLEXION_A3,
  VIDEO_A8,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A4,
  HUECOS_A6,
  num,
  pct,
} from "./alcance-publicacion-data";

const AlcanceScene = dynamic(() => import("./AlcancePublicacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-share-nodes fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la red de la comunidad en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-alcance-publicacion-reto";
const WARN = "#FF8A3C";
const META_ALCANCE = 75;
const RONDA_INICIAL = rondaMetricas(mulberry32(13));
/** Reloj y semilla: solo se usan dentro de manejadores de eventos. */
const ahora = () => performance.now();
const semillaNueva = () => Math.floor(Math.random() * 4294967296) >>> 0;

/* ── Tarjeta de estrellas: ¿qué mide este dato? ───────────────────────── */
function MetricaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = DATOS_METRICA[ronda[pos] ?? 0]!;

  const responder = (m: Metrica) => {
    if (resuelto !== null) return;
    const ok = m === actual.metrica;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es «${METRICAS.find((x) => x.id === m)!.etq.toLowerCase()}». ${actual.porque}`);
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
    setRonda(rondaMetricas(Math.random));
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
          ¿Qué mide este dato?
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
            Dato {pos + 1} de {ronda.length} · ¿es alcance, impresiones, interacción o impacto?
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {METRICAS.map((m) => (
              <button key={m.id} className="ap-opt ap-metrica" data-on="true" onClick={() => responder(m.id)} style={{ ["--apc" as string]: m.color }} title={METRICA_DEF[m.id]}>
                <i className={`fa-solid ${m.icono}`} style={{ marginRight: 8, color: m.color }} />
                {m.etq}
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

/* ── Medidor horizontal ───────────────────────────────────────────────── */
function Barra({ etq, valor, max, col, sufijo, meta }: { etq: string; valor: number; max: number; col: string; sufijo?: string; meta?: number }) {
  const f = Math.max(0, Math.min(1, valor / max));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,150px) 1fr 64px", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.25 }}>{etq}</span>
      <div style={{ position: "relative", height: 10, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: `${f * 100}%`, background: col, borderRadius: 99, transition: "width .25s" }} />
        {meta !== undefined && <div style={{ position: "absolute", top: -2, bottom: -2, left: `${(meta / max) * 100}%`, width: 2, background: "#fff", opacity: 0.7 }} />}
      </div>
      <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", textAlign: "right", ...NUM }}>
        {sufijo === "%" ? `${num(valor)} %` : num(valor)}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabAlcancePublicacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("cascada");

  // ── Cascada
  const [origen, setOrigen] = useState<OrigenId>("tu");
  const [formato, setFormato] = useState<FormatoId>("imagen");
  const [hora, setHora] = useState(15);
  const [llamado, setLlamado] = useState(false);
  const [cascada, setCascada] = useState<ResultadoCascada | null>(null);
  const [nonceCascada, setNonceCascada] = useState(0);
  const [relojCascada, setRelojCascada] = useState(0);
  const [historial, setHistorial] = useState<{ origen: OrigenId; formato: FormatoId; hora: number; llamado: boolean; alcance: number; impresiones: number; reacciones: number }[]>([]);
  const [origenesProbados, setOrigenesProbados] = useState<Set<OrigenId>>(() => new Set());
  const [mitad, setMitad] = useState(false);
  const [tasaTxt, setTasaTxt] = useState("");
  const [tasaEstado, setTasaEstado] = useState<"nada" | "ok" | "mal">("nada");
  const [tasaOk, setTasaOk] = useState(false);

  // ── Campaña
  const [casoIdx, setCasoIdx] = useState(0);
  const [audiencia, setAudiencia] = useState<SegmentoId[]>([]);
  const [canales, setCanales] = useState<CanalId[]>([]);
  const [accesos, setAccesos] = useState<AccesoId[]>([]);
  const [indicadores, setIndicadores] = useState<string[]>([]);
  const [lanzada, setLanzada] = useState(false);
  const [nonceCampana, setNonceCampana] = useState(0);
  const [avisoCanal, setAvisoCanal] = useState<string | null>(null);
  const [campanaOk, setCampanaOk] = useState(false);
  const [accesibleOk, setAccesibleOk] = useState(false);
  const [indicadoresOk, setIndicadoresOk] = useState(false);

  // ── Rumor
  const [fuente, setFuente] = useState<FuenteId>("ninguna");
  const [retraso, setRetraso] = useState(3);
  const [pausa, setPausa] = useState(false);
  const [limite, setLimite] = useState(false);
  const [rumor, setRumor] = useState<ResultadoRumor | null>(null);
  const [nonceRumor, setNonceRumor] = useState(0);
  const [relojRumor, setRelojRumor] = useState(0);
  const [configRumor, setConfigRumor] = useState<{ fuente: FuenteId; retraso: number; pausa: boolean; limite: boolean } | null>(null);
  const [vioSinFreno, setVioSinFreno] = useState(false);
  const [frenado, setFrenado] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const intervalos = useRef<{ cascada: number | null; rumor: number | null }>({ cascada: null, rumor: null });
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
    const iv = intervalos.current;
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      if (iv.cascada !== null) window.clearInterval(iv.cascada);
      if (iv.rumor !== null) window.clearInterval(iv.rumor);
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

  /* ── Cascada ───────────────────────────────────────────────────────── */
  const origenDef = ORIGENES.find((o) => o.id === origen)!;
  const formatoDef = FORMATOS.find((f) => f.id === formato)!;
  const corriendoCascada = cascada !== null && relojCascada < cascada.duracion;
  const terminadaCascada = cascada !== null && !corriendoCascada;
  const vivo = cascada ? (terminadaCascada ? { alcance: cascada.alcance, impresiones: cascada.impresiones, reacciones: cascada.reacciones, compartidos: cascada.compartidos, oleada: cascada.oleadas } : metricasAl(cascada.eventos, relojCascada)) : null;
  const tasaReal = cascada ? tasaInteraccion(cascada.reacciones, cascada.alcance) : 0;

  const detenerCascada = () => {
    if (intervalos.current.cascada !== null) window.clearInterval(intervalos.current.cascada);
    intervalos.current.cascada = null;
  };
  const lanzarPublicacion = () => {
    if (corriendoCascada) return;
    const cfg = { origen: origenDef.nodo, formato, hora, llamado };
    const res = simularCascada(cfg, mulberry32(semillaNueva()));
    detenerCascada();
    setCascada(res);
    setNonceCascada((n) => n + 1);
    setRelojCascada(0);
    setTasaTxt("");
    setTasaEstado("nada");
    blip();
    const inicio = ahora();
    const origenActual = origen;
    const registro = { origen, formato, hora, llamado, alcance: res.alcance, impresiones: res.impresiones, reacciones: res.reacciones };
    intervalos.current.cascada = window.setInterval(() => {
      const t = (ahora() - inicio) / 1000;
      setRelojCascada(t);
      if (t >= res.duracion) {
        detenerCascada();
        setOrigenesProbados((s) => new Set(s).add(origenActual));
        setHistorial((h) => [registro, ...h].slice(0, 4));
        if (res.alcance >= META_ALCANCE) {
          setMitad(true);
          sfx(true);
        }
      }
    }, 100);
  };
  const cambiarCascada = (fn: () => void) => {
    fn();
    blip();
  };
  const comprobarTasa = () => {
    if (!cascada || !terminadaCascada || cascada.alcance === 0) return;
    const v = Number(tasaTxt.replace(",", ".").replace("%", "").trim());
    if (!Number.isFinite(v) || tasaTxt.trim() === "") return;
    const ok = Math.abs(v - tasaReal) <= TOLERANCIA_TASA;
    setTasaEstado(ok ? "ok" : "mal");
    sfx(ok);
    if (ok) setTasaOk(true);
  };

  /* ── Campaña ───────────────────────────────────────────────────────── */
  const caso = CASOS[casoIdx]!;
  const accSet = new Set(accesos);
  const audienciaCorrecta = audiencia.length === caso.audiencia.length && caso.audiencia.every((s) => audiencia.includes(s));
  const faltan = caso.audiencia.filter((s) => !audiencia.includes(s));
  const sobran = audiencia.filter((s) => !caso.audiencia.includes(s));
  const cobGeneral = coberturaAudiencia(caso.audiencia, canales, accSet);
  const cobCiegas = coberturaAudiencia(caso.audiencia, canales, accSet, "ciegas");
  const cobSordas = coberturaAudiencia(caso.audiencia, canales, accSet, "sordas");
  const indicadoresElegidos = caso.indicadores.filter((i) => indicadores.includes(i.id));

  const invalidar = () => {
    setLanzada(false);
  };
  const elegirCaso = (i: number) => {
    setCasoIdx(i);
    setAudiencia([]);
    setCanales([]);
    setIndicadores([]);
    setLanzada(false);
    setAvisoCanal(null);
    blip();
  };
  const toggleAudiencia = (s: SegmentoId) => {
    setAudiencia((xs) => (xs.includes(s) ? xs.filter((x) => x !== s) : [...xs, s]));
    invalidar();
    blip();
  };
  const toggleCanal = (c: CanalId) => {
    if (canales.includes(c)) {
      setCanales((xs) => xs.filter((x) => x !== c));
      setAvisoCanal(null);
    } else if (canales.length >= MAX_CANALES) {
      setAvisoCanal("La simulación A2 pide máximo dos plataformas: quita una antes de elegir otra.");
      sfx(false);
      return;
    } else {
      setCanales((xs) => [...xs, c]);
      setAvisoCanal(null);
    }
    invalidar();
    blip();
  };
  const toggleAcceso = (a: AccesoId) => {
    setAccesos((xs) => (xs.includes(a) ? xs.filter((x) => x !== a) : [...xs, a]));
    invalidar();
    blip();
  };
  const toggleIndicador = (id: string) => {
    let nuevos: string[];
    if (indicadores.includes(id)) nuevos = indicadores.filter((x) => x !== id);
    else if (indicadores.length >= 2) nuevos = [indicadores[1]!, id];
    else nuevos = [...indicadores, id];
    setIndicadores(nuevos);
    blip();
    if (nuevos.length === 2) {
      const ok = nuevos.every((n) => caso.indicadores.find((x) => x.id === n)!.tipo === "impacto");
      sfx(ok);
      if (ok) setIndicadoresOk(true);
    }
  };
  const lanzarCampana = () => {
    if (canales.length === 0 || audiencia.length === 0) return;
    setLanzada(true);
    setNonceCampana((n) => n + 1);
    const ok = audienciaCorrecta && cobGeneral >= META_COBERTURA;
    const okAcc = ok && cobCiegas >= META_ACCESIBLE && cobSordas >= META_ACCESIBLE;
    if (ok) setCampanaOk(true);
    if (okAcc) setAccesibleOk(true);
    sfx(ok);
  };

  // Diagnóstico de la campaña
  const debil = [...caso.audiencia].map((s) => ({ s, c: coberturaSegmento(s, canales, accSet) })).sort((a, b) => a.c - b.c)[0];
  const mejorCanalPara = (s: SegmentoId) => [...CANALES].sort((a, b) => b.cobertura[s] - a.cobertura[s])[0]!;

  /* ── Rumor ─────────────────────────────────────────────────────────── */
  const fuenteDef = FUENTES.find((f) => f.id === fuente)!;
  const corriendoRumor = rumor !== null && relojRumor < rumor.duracion;
  const terminadoRumor = rumor !== null && !corriendoRumor;
  const vivoRumor = rumor ? (terminadoRumor ? { cree: rumor.cree, dato: rumor.dato, corregidas: rumor.corregidas, sinEnterarse: rumor.sinEnterarse } : rumorAl(rumor.eventos, relojRumor)) : null;

  const detenerRumor = () => {
    if (intervalos.current.rumor !== null) window.clearInterval(intervalos.current.rumor);
    intervalos.current.rumor = null;
  };
  const soltarRumor = () => {
    if (corriendoRumor) return;
    const cfg = { fuente, retraso, pausa, limite };
    const res = simularRumor(cfg, mulberry32(semillaNueva()));
    detenerRumor();
    setRumor(res);
    setConfigRumor(cfg);
    setNonceRumor((n) => n + 1);
    setRelojRumor(0);
    blip();
    const inicio = ahora();
    intervalos.current.rumor = window.setInterval(() => {
      const t = (ahora() - inicio) / 1000;
      setRelojRumor(t);
      if (t >= res.duracion) {
        detenerRumor();
        if (cfg.fuente === "ninguna" && !cfg.pausa && !cfg.limite) setVioSinFreno(true);
        if (res.dato > res.cree) {
          setFrenado(true);
          sfx(true);
        } else if (cfg.fuente !== "ninguna") sfx(false);
      }
    }, 100);
  };

  /* ── Modo y reinicio ───────────────────────────────────────────────── */
  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "cascada") {
      detenerCascada();
      setCascada(null);
      setRelojCascada(0);
    }
    if (modo === "campana") {
      setAudiencia([]);
      setCanales([]);
      setAccesos([]);
      setIndicadores([]);
      setLanzada(false);
    }
    if (modo === "rumor") {
      detenerRumor();
      setRumor(null);
      setRelojRumor(0);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { txt: string; done: boolean }[] = [
    { txt: "Publica desde una cuenta y mira cómo la cascada se propaga por la red", done: cascada !== null },
    { txt: "Publicar desde dos cuentas de origen distintas y comparar su alcance", done: origenesProbados.size >= 2 },
    { txt: `Llegar a más de la mitad de la comunidad (alcance de ${META_ALCANCE} cuentas o más)`, done: mitad },
    { txt: "Calcular la tasa de interacción de una publicación", done: tasaOk },
    { txt: "Diseñar una campaña con la audiencia correcta que llegue al 70 % con máximo dos canales", done: campanaOk },
    { txt: "Hacer que la campaña llegue también al 50 % de las personas ciegas y sordas de la audiencia", done: accesibleOk },
    { txt: "Elegir dos indicadores de impacto (no de vanidad)", done: indicadoresOk },
    { txt: "Soltar el rumor sin desmentido ni frenos y ver hasta dónde llega", done: vioSinFreno },
    { txt: "Lograr que el dato verificado llegue a más personas que el rumor", done: frenado },
    { txt: "Clasificar datos por lo que miden y ganar estrellas", done: clasifico },
    { txt: "Aprobar el verdadero o falso (A4)", done: quizAprobado },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let pie: ReactNode = "";
  if (modo === "cascada") {
    if (vivo && cascada) {
      pie = corriendoCascada
        ? `Cada pulso es una impresión: la publicación aparece en la pantalla de un contacto conectado. Azul = la vio, amarillo = reaccionó, verde = la compartió y la mostró a sus contactos.`
        : `La cascada se apagó en ${cascada.oleadas} ${cascada.oleadas === 1 ? "oleada" : "oleadas"}: ${cascada.alcance} cuentas distintas la vieron (alcance), apareció ${cascada.impresiones} veces (impresiones) y hubo ${cascada.reacciones} interacciones. ${cascada.impresiones > cascada.alcance ? `Hay ${cascada.impresiones - cascada.alcance} impresiones repetidas: personas que la vieron de más de un contacto.` : ""}`;
    } else {
      pie = `${origenDef.nota} A las ${horaEtq(hora)} está conectado ${pct(ACTIVIDAD_HORA[hora] ?? 0)} de la comunidad (curva ilustrativa). Lanza la publicación para ver la cascada.`;
    }
  } else if (modo === "campana") {
    pie = lanzada
      ? `Los arcos más gruesos son los canales que más llegan a cada grupo. Las personas iluminadas reciben y entienden el mensaje; los íconos marcan si llega a la persona ciega y a la persona sorda de cada grupo.`
      : `${caso.planteamiento} Marca la audiencia, elige máximo dos canales y la accesibilidad; después lanza la campaña.`;
  } else {
    if (rumor && vivoRumor) {
      pie = corriendoRumor
        ? "Rojo = recibió primero el rumor y lo cree. Cian = recibió primero el dato verificado. Morado = creyó el rumor y el desmentido lo corrigió."
        : rumor.dato > rumor.cree
          ? `El dato verificado llegó a ${rumor.dato} personas y el rumor se quedó en ${rumor.cree}. Quien ya conoce el dato no reenvía el rumor: cada persona informada es un corte en la cadena.`
          : `El rumor ganó: ${rumor.cree} personas lo creen y el dato llegó a ${rumor.dato}. ${configRumor?.fuente === "ninguna" ? "Nadie lo desmintió." : "Prueba desmentir antes, desde una fuente con más contactos, o activa algún freno."}`;
    } else {
      pie = `${RUMOR.texto} Circula en tres grupos de WhatsApp. En el modelo se comparte ${num((FACTOR_FALSO - 1) * 100)} % más que el dato verificado, como encontraron Vosoughi, Roy y Aral (2018).`;
    }
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
  if (modo === "cascada") {
    control = (
      <>
        {sub("1 · ¿Desde qué cuenta publicas?")}
        <div className="ap-opts">
          {ORIGENES.map((o) => (
            <button key={o.id} className="ap-opt ap-origen" data-on={o.id === origen} disabled={corriendoCascada} onClick={() => cambiarCascada(() => setOrigen(o.id))} style={{ ["--apc" as string]: modoCol, background: o.id === origen ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${o.icono}`} style={{ marginRight: 8 }} />
              {o.etq}
              {origenesProbados.has(o.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{origenDef.nota}</div>
        {sub("2 · Formato")}
        <div className="ap-opts">
          {FORMATOS.map((f) => (
            <button key={f.id} className="ap-opt ap-formato" data-on={f.id === formato} disabled={corriendoCascada} onClick={() => cambiarCascada(() => setFormato(f.id))} style={{ ["--apc" as string]: accent, background: f.id === formato ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              <i className={`fa-solid ${f.icono}`} style={{ marginRight: 8 }} />
              {f.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>
          {formatoDef.nota} En el modelo, de cada 100 personas que la ven, {num(formatoDef.comparte * 100 * (llamado ? LLAMADO : 1), 1)} la comparten y {num(formatoDef.reacciona * 100)} reaccionan.
        </div>
        {sub("3 · Hora de publicación")}
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-clock" style={{ color: "#fbbf24" }} />
          <input type="range" aria-label="Hora de publicación (h)" className="ap-range" min={0} max={23} step={1} value={hora} disabled={corriendoCascada} onChange={(e) => setHora(Number(e.target.value))} style={{ ["--apc" as string]: "#fbbf24" }} />
          <span style={{ width: 118, textAlign: "right", fontSize: 14, color: "#fff", fontWeight: 800, ...NUM }}>
            {horaEtq(hora)} · {pct(ACTIVIDAD_HORA[hora] ?? 0)} en línea
          </span>
        </label>
        <div className="ap-horas" aria-hidden>
          {ACTIVIDAD_HORA.map((a, h) => (
            <span key={h} style={{ height: `${a * 100}%`, background: h === hora ? "#fbbf24" : "rgba(251,191,36,0.28)" }} />
          ))}
        </div>
        <button className="ap-toggle" data-on={llamado} disabled={corriendoCascada} onClick={() => cambiarCascada(() => setLlamado((v) => !v))} style={{ marginTop: 10, ["--apc" as string]: llamado ? OK : "rgba(255,255,255,0.2)" }}>
          <i className={`fa-solid ${llamado ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 9, color: llamado ? OK : T.text3 }} />
          Incluir un llamado a la acción («compártelo con tu grupo»)
        </button>
        <button className="ap-lanzar" onClick={lanzarPublicacion} disabled={corriendoCascada} style={{ marginTop: 12, ["--apc" as string]: modoCol }}>
          <i className={`fa-solid ${corriendoCascada ? "fa-spinner fa-spin" : "fa-paper-plane"}`} style={{ marginRight: 9 }} />
          {corriendoCascada ? "La publicación se está difundiendo…" : cascada ? "Publicar de nuevo" : "Publicar"}
        </button>

        {vivo && (
          <>
            {sub(corriendoCascada ? "Métricas en vivo" : "Resultado")}
            <div style={{ display: "grid", gap: 8 }}>
              <Barra etq="Alcance (cuentas distintas)" valor={vivo.alcance} max={300} col="#60a5fa" meta={META_ALCANCE} />
              <Barra etq="Impresiones (veces mostrada)" valor={vivo.impresiones} max={300} col="#a78bfa" />
              <Barra etq="Interacciones" valor={vivo.reacciones} max={300} col="#fbbf24" />
              <Barra etq="De ellas, compartidos" valor={vivo.compartidos} max={300} col={OK} />
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>La línea blanca marca la meta: {META_ALCANCE} cuentas, la mitad de la red.</div>
          </>
        )}
        {terminadaCascada && cascada && (
          <>
            {nota(
              cascada.alcance >= META_ALCANCE
                ? `¡Llegó a más de la mitad de la comunidad! ${origen === "tu" ? "Lo lograste desde una cuenta pequeña: esta vez varias personas compartieron en cadena." : `Publicar desde «${origenDef.etq}» dio a la cascada un arranque de ${grado(origenDef.nodo)} contactos repartidos en varios grupos.`}`
                : ACTIVIDAD_HORA[hora]! < 0.3
                  ? `A las ${horaEtq(hora)} casi nadie está conectado: la publicación no llega a pantallas que no se miran.`
                  : origen === "tu"
                    ? "Tu cuenta tiene 11 contactos, casi todos del mismo salón: aunque algunos compartan, la cascada rara vez sale del grupo."
                    : "Faltó empuje: prueba un formato que se comparta más, un llamado a la acción o la hora de más conexión. Recuerda que el azar también pesa: la misma publicación no llega igual dos veces.",
              cascada.alcance >= META_ALCANCE ? OK : "#fbbf24",
              cascada.alcance >= META_ALCANCE ? "fa-circle-check" : "fa-lightbulb",
            )}
            {sub("Calcula la tasa de interacción por alcance")}
            {cascada.alcance === 0 ? (
              <div style={{ fontSize: 14, color: T.text3 }}>Con alcance 0 no hay tasa que calcular: publica de nuevo.</div>
            ) : (
              <>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, ...NUM }}>
                  Tasa = interacciones ÷ alcance × 100 = {cascada.reacciones} ÷ {cascada.alcance} × 100 = ¿?
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    className="ap-input"
                    aria-label="Tasa de interacción (%)"
                    inputMode="decimal"
                    value={tasaTxt}
                    onChange={(e) => {
                      setTasaTxt(e.target.value);
                      setTasaEstado("nada");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") comprobarTasa();
                    }}
                    placeholder="%"
                    style={{ borderColor: tasaEstado === "ok" ? OK : tasaEstado === "mal" ? WARN : T.lineStrong }}
                  />
                  <button className="ap-opt" data-on="true" onClick={comprobarTasa} style={{ ["--apc" as string]: modoCol }}>
                    <i className="fa-solid fa-calculator" style={{ marginRight: 8 }} />
                    Comprobar
                  </button>
                </div>
                {tasaEstado === "ok" && nota(`Correcto: ${num(tasaReal, 1)} %. Ojo: algunas plataformas calculan la tasa sobre impresiones (${num(tasaInteraccion(cascada.reacciones, cascada.impresiones), 1)} % aquí); siempre di sobre qué base la calculas.`, OK, "fa-circle-check")}
                {tasaEstado === "mal" && nota("Revisa: divide las interacciones entre el alcance (no entre las impresiones) y multiplica por 100.", WARN, "fa-rotate-left")}
              </>
            )}
          </>
        )}
        {historial.length > 1 && (
          <>
            {sub("Comparación de tus publicaciones")}
            <div className="ap-tabla-wrap">
              <table className="ap-tabla">
                <thead>
                  <tr>
                    <th>Origen</th>
                    <th>Formato</th>
                    <th>Hora</th>
                    <th>Alcance</th>
                    <th>Impr.</th>
                    <th>Inter.</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h, i) => (
                    <tr key={i}>
                      <td>{ORIGENES.find((o) => o.id === h.origen)!.etq}</td>
                      <td>
                        {FORMATOS.find((f) => f.id === h.formato)!.etq}
                        {h.llamado ? " + llamado" : ""}
                      </td>
                      <td>{horaEtq(h.hora)}</td>
                      <td>{h.alcance}</td>
                      <td>{h.impresiones}</td>
                      <td>{h.reacciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </>
    );
  } else if (modo === "campana") {
    control = (
      <>
        <div className="ap-opts">
          {CASOS.map((c, i) => (
            <button key={c.id} className="ap-opt ap-caso" data-on={i === casoIdx} onClick={() => elegirCaso(i)} style={{ ["--apc" as string]: modoCol, background: i === casoIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8 }} />
              {c.etq}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "11px 13px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: modoCol, marginBottom: 4 }}>CASO · {caso.tema.toUpperCase()}</div>
          <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{caso.planteamiento}</div>
          <div style={{ fontSize: 14, color: T.text3, marginTop: 5 }}>{caso.fuente}</div>
        </div>

        {sub("1 · Audiencia objetivo: ¿a quiénes va dirigida?")}
        <div className="ap-opts">
          {SEGMENTOS.map((s) => {
            const on = audiencia.includes(s.id);
            return (
              <button key={s.id} className="ap-opt ap-seg" data-on={on} onClick={() => toggleAudiencia(s.id)} style={{ ["--apc" as string]: s.color, background: on ? `${s.color}22` : "transparent" }}>
                <i className={`fa-solid ${s.icono}`} style={{ marginRight: 8, color: s.color }} />
                {s.etq}
              </button>
            );
          })}
        </div>

        {sub(`2 · Canales (máximo ${MAX_CANALES})`)}
        <div style={{ display: "grid", gap: 7 }}>
          {CANALES.map((c) => {
            const on = canales.includes(c.id);
            return (
              <button key={c.id} className="ap-opt ap-canal" data-on={on} onClick={() => toggleCanal(c.id)} style={{ ["--apc" as string]: c.color, background: on ? `${c.color}22` : "transparent", textAlign: "left" }}>
                <i className={c.icono.startsWith("fa-brands") ? c.icono : `fa-solid ${c.icono}`} style={{ marginRight: 8, color: c.color, width: 16 }} />
                {c.etq}
                <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.text3, marginTop: 3, marginLeft: 24 }}>{c.nota}</span>
              </button>
            );
          })}
        </div>
        {avisoCanal && nota(avisoCanal, WARN, "fa-triangle-exclamation")}

        {sub("3 · Accesibilidad")}
        <div style={{ display: "grid", gap: 7 }}>
          {ACCESOS.map((a) => {
            const on = accesos.includes(a.id);
            return (
              <button key={a.id} className="ap-toggle ap-acceso" data-on={on} onClick={() => toggleAcceso(a.id)} style={{ ["--apc" as string]: on ? OK : "rgba(255,255,255,0.14)" }}>
                <i className={`fa-solid ${on ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 9, color: on ? OK : T.text3 }} />
                <i className={`fa-solid ${a.icono}`} style={{ marginRight: 7, color: "#c4b5fd" }} />
                {a.etq}
                {on && <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.text2, marginTop: 3, marginLeft: 44 }}>{a.explica}</span>}
              </button>
            );
          })}
        </div>

        {sub("4 · Indicadores: ¿cómo sabrás si funcionó? (elige dos)")}
        <div style={{ display: "grid", gap: 7 }}>
          {caso.indicadores.map((ind) => {
            const on = indicadores.includes(ind.id);
            const evaluado = indicadores.length === 2 && on;
            const col = evaluado ? (ind.tipo === "impacto" ? OK : WARN) : on ? modoCol : "rgba(255,255,255,0.14)";
            return (
              <button key={ind.id} className="ap-opt ap-indicador" data-on={on} onClick={() => toggleIndicador(ind.id)} style={{ ["--apc" as string]: col, background: on ? `${col}1c` : "transparent", textAlign: "left" }}>
                {ind.etq}
                {evaluado && (
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: col, marginTop: 3 }}>
                    {ind.tipo === "impacto" ? "Impacto" : ind.tipo === "alcance" ? "Alcance, no impacto" : "Métrica de vanidad"}: {ind.porque}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {indicadoresElegidos.length === 2 &&
          nota(
            indicadoresElegidos.every((i) => i.tipo === "impacto") ? "Tus dos indicadores miden el cambio que busca la campaña." : "Al menos uno de tus indicadores no mide el impacto: cámbialo por uno que mida lo que la campaña quiere lograr.",
            indicadoresElegidos.every((i) => i.tipo === "impacto") ? OK : WARN,
          )}

        <button className="ap-lanzar" onClick={lanzarCampana} disabled={canales.length === 0 || audiencia.length === 0} style={{ marginTop: 14, ["--apc" as string]: modoCol }}>
          <i className="fa-solid fa-bullhorn" style={{ marginRight: 9 }} />
          {canales.length === 0 || audiencia.length === 0 ? "Elige audiencia y al menos un canal" : "Lanzar la campaña"}
        </button>

        {lanzada && (
          <>
            {sub("Resultado sobre la audiencia del caso")}
            <div style={{ display: "grid", gap: 8 }}>
              {caso.audiencia.map((s) => {
                const seg = SEGMENTOS.find((x) => x.id === s)!;
                return <Barra key={s} etq={seg.etq} valor={coberturaSegmento(s, canales, accSet) * 100} max={100} col={seg.color} sufijo="%" meta={META_COBERTURA * 100} />;
              })}
              <Barra etq="Toda la audiencia" valor={cobGeneral * 100} max={100} col={modoCol} sufijo="%" meta={META_COBERTURA * 100} />
              {SUBGRUPOS.map((sg) => (
                <Barra key={sg.id} etq={sg.etq} valor={(sg.id === "ciegas" ? cobCiegas : cobSordas) * 100} max={100} col="#c4b5fd" sufijo="%" meta={META_ACCESIBLE * 100} />
              ))}
            </div>
            {!audienciaCorrecta &&
              nota(
                <>
                  {faltan.length > 0 && `Te faltó en la audiencia: ${faltan.map((s) => SEGMENTOS.find((x) => x.id === s)!.etq.toLowerCase()).join(", ")}. `}
                  {sobran.length > 0 && `No son la audiencia principal de este caso: ${sobran.map((s) => SEGMENTOS.find((x) => x.id === s)!.etq.toLowerCase()).join(", ")}. `}
                  {caso.porqueAudiencia}
                </>,
                WARN,
                "fa-users-viewfinder",
              )}
            {audienciaCorrecta && nota(`Audiencia correcta. ${caso.porqueAudiencia}`, OK, "fa-users-viewfinder")}
            {cobGeneral >= META_COBERTURA
              ? nota(`La campaña llega a ${pct(cobGeneral)} de la audiencia con ${canales.length} ${canales.length === 1 ? "canal" : "canales"}.`, OK, "fa-circle-check")
              : debil &&
                nota(
                  `Llega a ${pct(cobGeneral)}, por debajo de la meta de 70 %. El grupo más desatendido es «${SEGMENTOS.find((x) => x.id === debil.s)!.etq.toLowerCase()}» (${pct(debil.c)}); el canal que más llega a ese grupo es ${mejorCanalPara(debil.s).etq.toLowerCase()}.${accesos.includes("claro") ? "" : " Además, sin lenguaje claro parte de quien lo ve no entiende qué hacer."}`,
                  WARN,
                  "fa-lightbulb",
                )}
            {cobCiegas < META_ACCESIBLE &&
              nota(
                `Solo llega a ${pct(cobCiegas)} de las personas ciegas o con baja visión: ${canales.includes("cartel") ? "un cartel no se puede leer con lector de pantalla; " : ""}${accesos.includes("alt") ? "" : "a las imágenes les falta texto alternativo; "}la radio y el audio sí les llegan.`,
                WARN,
                "fa-eye-low-vision",
              )}
            {cobSordas < META_ACCESIBLE &&
              nota(
                `Solo llega a ${pct(cobSordas)} de las personas sordas: ${canales.includes("radio") ? "la radio no les llega; " : ""}${canales.includes("tiktok") && !accesos.includes("subtitulos") ? "el video no tiene subtítulos revisados; " : ""}los mensajes escritos o con subtítulos sí.`,
                WARN,
                "fa-ear-deaf",
              )}
            <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>Coberturas ilustrativas por canal y grupo en una comunidad de 1 000 personas; si eliges dos canales, se combinan suponiendo que son independientes.</div>
          </>
        )}
      </>
    );
  } else {
    control = (
      <>
        <div style={{ padding: "11px 13px", borderRadius: 12, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.35)" }}>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: "#fb7185", marginBottom: 4 }}>EL RUMOR</div>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>{RUMOR.texto}</div>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: "#22d3ee", margin: "10px 0 4px" }}>EL DATO VERIFICADO</div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>{RUMOR.dato}</div>
        </div>

        {sub("1 · ¿Quién lo desmiente?")}
        <div className="ap-opts">
          {FUENTES.map((f) => (
            <button key={f.id} className="ap-opt ap-fuente" data-on={f.id === fuente} disabled={corriendoRumor} onClick={() => { setFuente(f.id); blip(); }} style={{ ["--apc" as string]: f.id === "ninguna" ? "#94a3b8" : "#22d3ee", background: f.id === fuente ? "rgba(34,211,238,0.12)" : "transparent" }}>
              <i className={`fa-solid ${f.icono}`} style={{ marginRight: 8 }} />
              {f.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{fuenteDef.nota}</div>

        {fuente !== "ninguna" && (
          <>
            {sub("2 · ¿Cuánto tarda en salir el desmentido?")}
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-hourglass-half" style={{ color: "#22d3ee" }} />
              <input type="range" aria-label="Retraso del desmentido (oleadas)" className="ap-range" min={1} max={6} step={1} value={retraso} disabled={corriendoRumor} onChange={(e) => setRetraso(Number(e.target.value))} style={{ ["--apc" as string]: "#22d3ee" }} />
              <span style={{ width: 118, textAlign: "right", fontSize: 14, color: "#fff", fontWeight: 800, ...NUM }}>
                {retraso} {retraso === 1 ? "oleada" : "oleadas"} después
              </span>
            </label>
          </>
        )}

        {sub(`${fuente !== "ninguna" ? "3" : "2"} · Frenos`)}
        <div style={{ display: "grid", gap: 7 }}>
          <button className="ap-toggle ap-freno" data-on={pausa} disabled={corriendoRumor} onClick={() => { setPausa((v) => !v); blip(); }} style={{ ["--apc" as string]: pausa ? OK : "rgba(255,255,255,0.14)" }}>
            <i className={`fa-solid ${pausa ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 9, color: pausa ? OK : T.text3 }} />
            Pausa para verificar antes de reenviar
            <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.text3, marginTop: 3, marginLeft: 22 }}>
              La comunidad aprendió a preguntar «¿quién lo dice? ¿dónde más se publica?». En el modelo, reduce {num((1 - EFECTO_PAUSA) * 100)} % los reenvíos del rumor (valor ilustrativo).
            </span>
          </button>
          <button className="ap-toggle ap-freno" data-on={limite} disabled={corriendoRumor} onClick={() => { setLimite((v) => !v); blip(); }} style={{ ["--apc" as string]: limite ? OK : "rgba(255,255,255,0.14)" }}>
            <i className={`fa-solid ${limite ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 9, color: limite ? OK : T.text3 }} />
            Límite de reenvío de mensajes «reenviados muchas veces»
            <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.text3, marginTop: 3, marginLeft: 22 }}>
              Como el que WhatsApp aplicó en 2020: tras {SALTOS_LIMITE} reenvíos, solo a un chat a la vez. La cadena ya llega muy reenviada. Aplica a todos los mensajes, también al dato.
            </span>
          </button>
        </div>

        <button className="ap-lanzar" onClick={soltarRumor} disabled={corriendoRumor} style={{ marginTop: 14, ["--apc" as string]: modoCol }}>
          <i className={`fa-solid ${corriendoRumor ? "fa-spinner fa-spin" : "fa-play"}`} style={{ marginRight: 9 }} />
          {corriendoRumor ? "Los mensajes se están difundiendo…" : rumor ? "Soltar el rumor de nuevo" : "Soltar el rumor"}
        </button>

        {vivoRumor && rumor && (
          <>
            {sub(corriendoRumor ? "En vivo" : "Resultado")}
            <div style={{ display: "grid", gap: 8 }}>
              <Barra etq="Recibieron primero el rumor" valor={vivoRumor.cree} max={N_HABITANTES} col="#f43f5e" />
              <Barra etq="Recibieron el dato verificado" valor={vivoRumor.dato} max={N_HABITANTES} col="#22d3ee" />
              <Barra etq="De ellas, se corrigieron" valor={vivoRumor.corregidas} max={N_HABITANTES} col="#a78bfa" />
              <Barra etq="No se enteraron" valor={vivoRumor.sinEnterarse} max={N_HABITANTES} col="#475569" />
            </div>
            {terminadoRumor && (
              <>
                <svg viewBox="0 0 300 90" className="ap-serie" role="img" aria-label="Evolución del rumor y del dato por oleada">
                  {[0, 50, 100, 147].map((v) => (
                    <line key={v} x1="0" x2="300" y1={85 - (v / 147) * 80} y2={85 - (v / 147) * 80} stroke="rgba(255,255,255,0.08)" />
                  ))}
                  {[0, 1].map((k) => (
                    <polyline
                      key={k}
                      fill="none"
                      stroke={k === 0 ? "#f43f5e" : "#22d3ee"}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      points={rumor.serie.map((p, i) => `${(i / Math.max(1, rumor.serie.length - 1)) * 300},${85 - (p[k]! / 147) * 80}`).join(" ")}
                    />
                  ))}
                </svg>
                <div style={{ fontSize: 14, color: T.text3, marginTop: 2 }}>Personas por oleada: rojo, rumor; cian, dato verificado.</div>
                {nota(
                  rumor.dato > rumor.cree
                    ? `Frenaste el rumor. ${configRumor?.pausa ? "La pausa para verificar bajó sus reenvíos. " : ""}${configRumor?.limite ? "El límite cortó la cadena que ya venía muy reenviada. " : ""}${configRumor && configRumor.fuente !== "ninguna" ? `Desmentir desde «${FUENTES.find((f) => f.id === configRumor.fuente)!.etq.toLowerCase()}» ` : ""}sirvió porque quien recibe primero el dato ya no reenvía el rumor.`
                    : configRumor?.fuente === "ninguna"
                      ? "Sin desmentido, nadie recibe el dato: el rumor solo se detiene cuando se agota solo."
                      : `El rumor ganó. ${configRumor && configRumor.retraso >= 3 ? "El desmentido salió tarde, cuando el rumor ya había llegado a muchos. " : ""}${configRumor?.fuente === "vecina" ? "Una vecina con pocos contactos y poca autoridad llega a poca gente. " : ""}${!configRumor?.pausa && !configRumor?.limite ? "Ningún freno bajó los reenvíos del rumor. " : ""}`,
                  rumor.dato > rumor.cree ? OK : WARN,
                  rumor.dato > rumor.cree ? "fa-shield-halved" : "fa-triangle-exclamation",
                )}
              </>
            )}
          </>
        )}
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Probabilidades ilustrativas. Lo real: lo falso tuvo 70 % más probabilidad de compartirse (Vosoughi, Roy y Aral, Science, 2018) y WhatsApp reportó 70 % menos reenvíos de los mensajes muy reenviados tras su límite de 2020.
        </div>
      </>
    );
  }

  const itemsLeyenda: [string, string][] =
    modo === "cascada"
      ? [["#3b4a60", "Aún no la ve"], ["#60a5fa", "La vio"], ["#fbbf24", "Reaccionó"], [OK, "La compartió"]]
      : modo === "rumor"
        ? [["#3b4a60", "Sin enterarse"], ["#f43f5e", "Cree el rumor"], ["#22d3ee", "Recibió el dato"], ["#a78bfa", "Se corrigió"]]
        : [["#475569", "No le llega"], [accent, "Le llega y entiende"]];
  const leyenda = (
    <>
      {itemsLeyenda.map(([c, t]) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dbe4f3" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: c, flexShrink: 0 }} />
          {t}
        </div>
      ))}
    </>
  );

  /* Lectura corta sobre la escena (≤ 10 palabras). */
  let lectura: ReactNode;
  if (modo === "cascada") {
    lectura =
      cascada && vivo
        ? corriendoCascada
          ? `Alcance ${vivo.alcance} · impresiones ${vivo.impresiones}`
          : `Llegó a ${cascada.alcance} de ${N_HABITANTES + 2} cuentas (${pct(cascada.alcance / 149)})`
        : `${origenDef.etq} · ${formatoDef.etq} · ${horaEtq(hora)}: publica y mira`;
  } else if (modo === "campana") {
    lectura = lanzada ? `Llega a ${pct(cobGeneral)} de la audiencia` : `${canales.length} de ${MAX_CANALES} canales elegidos`;
  } else {
    lectura = rumor && vivoRumor ? `Rumor ${vivoRumor.cree} · dato verificado ${vivoRumor.dato}` : `Desmentido: ${fuenteDef.etq.toLowerCase()}`;
  }

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <AlcanceScene
            vista={modo}
            modoColor={modoCol}
            resetNonce={resetNonce}
            origenNodo={origenDef.nodo}
            eventosCascada={cascada?.eventos ?? null}
            nonceCascada={nonceCascada}
            audienciaCaso={caso.audiencia}
            canales={canales}
            accesos={accesos}
            lanzada={lanzada}
            nonceCampana={nonceCampana}
            fuenteNodo={fuenteDef.nodo}
            eventosRumor={rumor?.eventos ?? null}
            nonceRumor={nonceRumor}
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
      leyenda={leyenda}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{CSS_AP}</style>
              <Bloque titulo={`${def.etq}: qué estás viendo`} icono={def.icono}>
                <p style={{ margin: 0, color: T.text2, ...NUM }}>{pie}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>{leyenda}</div>
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
              <MetricaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes qué hace inclusivo y de calidad a un contenido." />
              <div style={{ ...card, padding: "20px 18px 22px", marginTop: 22 }}>
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
              <Bloque titulo="¿Publicar es comunicar?" icono="fa-bullhorn">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Simulación A2" icono="fa-people-arrows">
                <strong style={{ color: "#fff" }}>{SIMULACION_A2.titulo}</strong>
                <p style={{ margin: 0, color: T.text2 }}>{SIMULACION_A2.descripcion}</p>
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {SIMULACION_A2.instrucciones.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
                <p style={{ margin: 0, color: T.text3, fontStyle: "italic" }}>
                  En el modo Campaña comunitaria practicas los pasos 1, 2 y 4 y la accesibilidad; el mensaje (paso 3) y los obstáculos (paso 5) se trabajan en la actividad.
                </p>
              </Bloque>
              <Bloque titulo="Propósito y contenidos" icono="fa-landmark">
                <strong style={{ color: "#fff" }}>{PROPOSITO}</strong>
                <p style={{ margin: 0, color: T.text2 }}>{CONTENIDOS_PROGRESION}</p>
              </Bloque>
              <Bloque titulo="Para reflexionar (A2, A3 y video A8)" icono="fa-comments">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {[...SIMULACION_A2.preguntas, REFLEXION_A3, VIDEO_A8.abierta].map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                {GLOSARIO.map((gi, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                    <span style={{ color: T.text2 }}>{gi.definicion}</span>
                    <div style={{ color: T.text3, marginTop: 4 }}>
                      <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                      {gi.ejemplo}
                    </div>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
                </p>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}`, color: T.text2 }}>
                  <strong style={{ color: T.text3 }}>Del video A8: </strong>«{VIDEO_A8.vf}»
                </div>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ALCANCE_PUBLICACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Son <strong>verbatim</strong> del material de la plataforma: el propósito y los contenidos de la progresión, la simulación A2, la reflexión A3, el verdadero o falso A4, el glosario A5, el texto A6 y las preguntas del video A8. Es <strong>modelo ilustrativo</strong>: la red de 150 cuentas, la curva de conexión por hora, las probabilidades de ver, reaccionar y compartir, la cobertura de cada canal por grupo y el efecto de la accesibilidad y de la pausa para verificar; los casos de dengue y de acopio son didácticos. Son <strong>datos reales</strong>: uso de internet 83.1 % (86.9 % urbano, 68.5 % rural; INEGI, ENDUTIH 2024), 6 179 890 personas con discapacidad (INEGI, Censo 2020), el 70 % de ventaja de lo falso (Vosoughi, Roy y Aral, 2018), el límite de reenvíos de WhatsApp (2020) y el contraste 4.5:1 de WCAG 2.2. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

const CSS_AP = `
  .ap-opts { display:flex; flex-wrap:wrap; gap:8px; }
  .ap-opt { cursor:pointer; border:1px solid var(--apc); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; text-align:left; }
  .ap-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
  .ap-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
  .ap-opt:disabled { cursor:default; opacity:0.6; }
  .ap-toggle { width:100%; cursor:pointer; border:1px solid var(--apc); border-radius:11px; padding:10px 13px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:800; text-align:left; transition:all .15s; }
  .ap-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
  .ap-toggle:disabled { cursor:default; opacity:0.6; }
  .ap-lanzar { width:100%; cursor:pointer; border:none; border-radius:12px; padding:13px 16px; background:var(--apc); color:#04121f; font-size:15px; font-weight:900; transition:all .15s; }
  .ap-lanzar:hover:not(:disabled) { filter:brightness(1.1); }
  .ap-lanzar:disabled { cursor:default; opacity:0.55; }
  .ap-range { flex:1; accent-color: var(--apc); min-width:0; }
  .ap-horas { display:flex; align-items:flex-end; gap:2px; height:26px; margin-top:6px; padding:0 2px; }
  .ap-horas span { flex:1; border-radius:2px 2px 0 0; min-height:2px; }
  .ap-input { width:110px; padding:9px 11px; border-radius:10px; border:1px solid; background:rgba(4,10,22,0.5); color:#fff; font-size:16px; font-weight:800; font-variant-numeric: tabular-nums; }
  .ap-tabla-wrap { overflow-x:auto; }
  .ap-tabla { width:100%; border-collapse:collapse; font-size:14px; font-variant-numeric: tabular-nums; }
  .ap-tabla th { text-align:left; color:${T.text3}; font-weight:800; padding:5px 6px; border-bottom:1px solid ${T.line}; white-space:nowrap; }
  .ap-tabla td { color:${T.text2}; padding:6px; border-bottom:1px solid rgba(255,255,255,0.05); }
  .ap-serie { width:100%; height:auto; margin-top:12px; border-radius:10px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; }
  .ap-opt:focus-visible, .ap-toggle:focus-visible, .ap-range:focus-visible, .ap-lanzar:focus-visible, .ap-input:focus-visible { outline:2px solid #fff; outline-offset:2px; }
`;
