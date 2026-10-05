"use client";

/**
 * Laboratorio 3D — "El viaje de un paquete por Internet: seguridad, IA
 * responsable y huella digital".
 * Práctica anclada a CD-I-P10-A2 (quiz «IA, copyleft y ambiente») y
 * CD-I-P10-A6 (completa el texto); progresión 6 de la UAC Cultura Digital I.
 * El marco teórico es la lectura A1, los hechos salen del quiz A4, el glosario
 * del A5, y la reflexión A3 y la autoevaluación A7 se conservan verbatim.
 *
 * Tres modos:
 *  (1) El viaje del paquete — elegir qué se manda y a dónde, predecir los
 *      paquetes, ver la consulta DNS y la ruta, cortar enlaces y cruzar el
 *      Atlántico por el cable MAREA; latencia y huella de red calculadas.
 *  (2) Consulta segura a la IA — elegir el sitio legítimo, quitar datos
 *      personales, ver qué captura un espía con HTTP y con HTTPS, verificar la
 *      respuesta de la IA y declarar su uso.
 *  (3) Vida del dispositivo — años de uso contra huella anual y destino final
 *      del teléfono (cajón, basura o reciclaje con metales recuperados).
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import type { ObjetivoLab } from "./_objetivos";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { PAQUETE_INTERNET_FICHA } from "./paquete-internet-ficha";
import type { VistaPaquete } from "./PaqueteInternetScene";
import {
  type Modo,
  type ContenidoId,
  type DestinoId,
  type RedId,
  type EnlaceId,
  type SitioId,
  type FragmentoId,
  type AfirmacionId,
  type DecisionIA,
  type DeclaracionId,
  type DestinoFinalId,
  type Accion,
  MODOS,
  MODOS_DEF,
  CONTENIDOS,
  DESTINOS,
  REDES,
  ENLACES,
  ENLACES_CORTABLES,
  nodo,
  rutaMasCorta,
  latenciaMs,
  paquetesDe,
  tamano,
  huellaRed,
  errorRelativo,
  CARGA_UTIL,
  MTU,
  V_FIBRA_KM_S,
  FACTOR_CO2_KG_KWH,
  T_DNS,
  T_DATOS,
  T_ENVIO_IA,
  T_RESP_IA,
  T_VUELO,
  SITIOS,
  FRAGMENTOS,
  cifradoDe,
  AFIRMACIONES_IA,
  DECLARACIONES,
  huellaAnual,
  reduccionVsBase,
  ANIOS_BASE,
  ANIOS_MAX,
  CO2_FABRICACION_KG,
  KWH_CARGA_ANIO,
  DESTINOS_FINALES,
  METALES,
  metalesRecuperadosG,
  masa,
  LOTES,
  DATOS_EWASTE,
  ACCIONES,
  APARATOS,
  rondaAparatos,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS,
  REFLEXION_A3,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  AUTOEVAL_A7,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
  num,
} from "./paquete-internet-data";

const PaqueteScene = dynamic(() => import("./PaqueteInternetScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-network-wired fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Conectando la red en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-paquete-internet-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaAparatos(mulberry32(23));

/** Dos cifras significativas, sin notación científica. */
function dos(x: number): string {
  if (x === 0) return "0";
  const d = Math.max(0, 1 - Math.floor(Math.log10(Math.abs(x))));
  return num(x, Math.min(d, 6));
}
const energia = (wh: number) => (wh >= 1 ? `${dos(wh)} Wh` : `${dos(wh * 1000)} mWh`);
const carbono = (g: number) => (g >= 1 ? `${dos(g)} g` : `${dos(g * 1000)} mg`);

/* ── Tarjeta de estrellas: ¿reparar, reutilizar o reciclar? ─────────────── */
function AparatosCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = APARATOS[ronda[pos] ?? 0]!;

  const responder = (a: Accion) => {
    if (resuelto !== null) return;
    const ok = a === actual.accion;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`Mejor ${ACCIONES.find((x) => x.id === actual.accion)!.etq.toLowerCase()}: ${actual.porque}`);
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
    setRonda(rondaAparatos(Math.random));
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
          ¿Reparar, reutilizar o reciclar?
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
            Aparato {pos + 1} de {ronda.length} · en lugar de tirarlo, ¿qué conviene hacer? (actividad A5)
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>{actual.texto}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ACCIONES.map((a) => (
              <button key={a.id} className="pi-opt pi-accion" data-on="true" onClick={() => responder(a.id)} style={{ ["--pic" as string]: a.color }}>
                <i className={`fa-solid ${a.icono}`} style={{ marginRight: 8 }} />
                {a.etq}
              </button>
            ))}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 14, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
          <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.45 }}>Criterio: si falla una pieza reemplazable, se repara; si funciona y ya no lo usas, se reutiliza; si no tiene arreglo o es peligroso, se recicla.</div>
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

interface Envio {
  contenido: ContenidoId;
  destino: DestinoId;
  red: RedId;
  km: number;
  rodeo: boolean;
  conDns: boolean;
  prediccion: number | null;
}

interface EnvioIA {
  sitio: SitioId;
  incluidos: FragmentoId[];
  cifrado: boolean;
}


/* ── Estilos propios (la pantalla la da LabShell) ── */
const estilos = (accent: string) => `
  .pi-opts { display:flex; flex-wrap:wrap; gap:8px; }
  .pi-opt { cursor:pointer; border:1px solid var(--pic); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.4; }
  .pi-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
  .pi-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
  .pi-opt:disabled { cursor:default; }
  .pi-opt:disabled[data-on="false"] { opacity:0.55; }
  .pi-toggle { width:100%; cursor:pointer; border:1px solid var(--pic); border-radius:11px; padding:12px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
  .pi-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
  .pi-toggle:disabled { cursor:default; opacity:0.7; }
  .pi-input { width:min(100%, 160px); box-sizing:border-box; padding:9px 12px; border-radius:10px; border:1px solid ${T.lineStrong}; background:rgba(4,10,22,0.55); color:#fff; font-size:16px; font-weight:800; }
  .pi-input:focus { outline:2px solid ${accent}; outline-offset:1px; }
  .pi-opt:focus-visible, .pi-toggle:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
`;

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabPaqueteInternet({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("viaje");

  // ── Viaje
  const [contenidoId, setContenidoId] = useState<ContenidoId>("foto");
  const [destinoId, setDestinoId] = useState<DestinoId>("qro");
  const [redId, setRedId] = useState<RedId>("wifi");
  const [cortados, setCortados] = useState<EnlaceId[]>([]);
  const [prediccion, setPrediccion] = useState("");
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [fase, setFase] = useState<"listo" | "dns" | "datos" | "llego">("listo");
  const [envioNonce, setEnvioNonce] = useState(0);
  const [resueltos, setResueltos] = useState<DestinoId[]>([]);
  const [envioHecho, setEnvioHecho] = useState(false);
  const [prediccionOk, setPrediccionOk] = useState(false);
  const [cruzoOceano, setCruzoOceano] = useState(false);
  const [vioRodeo, setVioRodeo] = useState(false);

  // ── Consulta
  const [sitio, setSitio] = useState<SitioId | null>(null);
  const [incluidos, setIncluidos] = useState<FragmentoId[]>(() => FRAGMENTOS.map((f) => f.id));
  const [conHttps, setConHttps] = useState(true);
  const [envioIA, setEnvioIA] = useState<EnvioIA | null>(null);
  const [faseIA, setFaseIA] = useState<"listo" | "ida" | "vuelta" | "llego">("listo");
  const [iaNonce, setIaNonce] = useState(0);
  const [respuesta, setRespuesta] = useState(false);
  const [verificadas, setVerificadas] = useState<AfirmacionId[]>([]);
  const [decisiones, setDecisiones] = useState<Partial<Record<AfirmacionId, DecisionIA>>>({});
  const [erroresIA, setErroresIA] = useState(0);
  const [declaracion, setDeclaracion] = useState<DeclaracionId | null>(null);
  const [envioSeguro, setEnvioSeguro] = useState(false);
  const [vioHttp, setVioHttp] = useState(false);

  // ── Dispositivo
  const [anios, setAnios] = useState(ANIOS_BASE);
  const [reparado, setReparado] = useState(false);
  const [destinoFinal, setDestinoFinal] = useState<DestinoFinalId | null>(null);
  const [destinoNonce, setDestinoNonce] = useState(0);
  const [llegoFinal, setLlegoFinal] = useState(false);
  const [lote, setLote] = useState(1);
  const [redujo, setRedujo] = useState(false);
  const [reciclo, setReciclo] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const [detalles, setDetalles] = useState(false);
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
  const limpiarTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
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

  /* ── Viaje ─────────────────────────────────────────────────────────── */
  const contenido = CONTENIDOS.find((c) => c.id === contenidoId)!;
  const destino = DESTINOS.find((d) => d.id === destinoId)!;
  const ruta = rutaMasCorta("casa", destinoId, cortados);
  const rutaBase = rutaMasCorta("casa", destinoId, []);
  const enviando = fase === "dns" || fase === "datos";
  const predNum = Number(prediccion.replace(/\s/g, "").replace(",", "."));
  const predValida = prediccion.trim() !== "" && Number.isFinite(predNum) && predNum > 0;

  const enviar = () => {
    if (enviando || !ruta) return;
    const conDns = !resueltos.includes(destinoId);
    const e: Envio = { contenido: contenidoId, destino: destinoId, red: redId, km: ruta.km, rodeo: !!rutaBase && ruta.km > rutaBase.km + 1, conDns, prediccion: predValida ? predNum : null };
    setEnvio(e);
    setEnvioNonce((k) => k + 1);
    setFase(conDns ? "dns" : "datos");
    blip();
    const tDns = conDns ? T_DNS * 1000 : 0;
    if (conDns)
      despues(tDns, () => {
        setFase("datos");
        setResueltos((r) => (r.includes(e.destino) ? r : [...r, e.destino]));
      });
    despues(tDns + T_DATOS * 1000 + 120, () => {
      setFase("llego");
      setEnvioHecho(true);
      if (e.destino === "mad") setCruzoOceano(true);
      if (e.rodeo) setVioRodeo(true);
      const real = paquetesDe(CONTENIDOS.find((c) => c.id === e.contenido)!.bytes);
      if (e.prediccion !== null && real >= 100) {
        const ok = errorRelativo(e.prediccion, real) <= 0.1;
        if (ok) setPrediccionOk(true);
        sfx(ok);
      } else if (sonido) audioRef.current?.correcto();
    });
  };
  const cambiarContenido = (id: ContenidoId) => {
    if (enviando) return;
    setContenidoId(id);
    setPrediccion("");
    setFase("listo");
    blip();
  };
  const cambiarDestino = (id: DestinoId) => {
    if (enviando) return;
    setDestinoId(id);
    setFase("listo");
    blip();
  };
  const cortar = (id: EnlaceId) => {
    if (enviando) return;
    setCortados((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
    setFase("listo");
    blip();
  };

  /* ── Consulta ──────────────────────────────────────────────────────── */
  const sitioDef = SITIOS.find((s) => s.id === sitio) ?? null;
  const cifradoEfectivo = !!sitioDef && sitioDef.https && conHttps;
  const enviandoIA = faseIA === "ida" || faseIA === "vuelta";
  const mensaje = FRAGMENTOS.filter((f) => incluidos.includes(f.id))
    .map((f) => f.texto)
    .join(" ");
  const envioDef = envioIA ? SITIOS.find((s) => s.id === envioIA.sitio)! : null;
  const mensajeEnviado = envioIA
    ? FRAGMENTOS.filter((f) => envioIA.incluidos.includes(f.id))
        .map((f) => f.texto)
        .join(" ")
    : "";

  const elegirSitio = (id: SitioId) => {
    if (enviandoIA) return;
    setSitio(id);
    setFaseIA("listo");
    blip();
  };
  const alternarFragmento = (id: FragmentoId) => {
    if (enviandoIA) return;
    setIncluidos((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
    blip();
  };
  const enviarIA = () => {
    if (enviandoIA || !sitioDef || !incluidos.includes("pregunta")) return;
    const e: EnvioIA = { sitio: sitioDef.id, incluidos: [...incluidos], cifrado: cifradoEfectivo };
    setEnvioIA(e);
    setIaNonce((k) => k + 1);
    setFaseIA("ida");
    blip();
    const legit = sitioDef.legitimo;
    const sinDatos = FRAGMENTOS.every((f) => f.necesario || !e.incluidos.includes(f.id));
    despues(T_ENVIO_IA * 1000 + 100, () => {
      if (!e.cifrado) setVioHttp(true);
      if (!legit) {
        setFaseIA("llego");
        sfx(false);
        return;
      }
      setFaseIA("vuelta");
      const seguro = e.cifrado && sinDatos;
      if (seguro) setEnvioSeguro(true);
      sfx(seguro);
    });
    if (legit)
      despues((T_ENVIO_IA + T_RESP_IA) * 1000 + 150, () => {
        setFaseIA("llego");
        setRespuesta(true);
      });
  };
  const verificar = (id: AfirmacionId) => {
    setVerificadas((xs) => (xs.includes(id) ? xs : [...xs, id]));
    blip();
  };
  const decidir = (id: AfirmacionId, d: DecisionIA) => {
    if (decisiones[id] === d) return;
    const a = AFIRMACIONES_IA.find((x) => x.id === id)!;
    const ok = (d === "usar") === a.correcta;
    setDecisiones((m) => ({ ...m, [id]: d }));
    if (!ok) setErroresIA((e) => e + 1);
    sfx(ok);
  };
  const declarar = (id: DeclaracionId) => {
    setDeclaracion(id);
    sfx(DECLARACIONES.find((d) => d.id === id)!.correcta);
  };
  const todasDecididas = AFIRMACIONES_IA.every((a) => decisiones[a.id] !== undefined);
  const decisionesOk = AFIRMACIONES_IA.every((a) => decisiones[a.id] === (a.correcta ? "usar" : "descartar"));
  const todasVerificadas = AFIRMACIONES_IA.every((a) => verificadas.includes(a.id));
  const declaracionOk = declaracion !== null && DECLARACIONES.find((d) => d.id === declaracion)!.correcta;
  const iaResponsable = decisionesOk && todasVerificadas && declaracionOk;

  /* ── Dispositivo ───────────────────────────────────────────────────── */
  const huella = huellaAnual(anios);
  const reduccion = reduccionVsBase(anios);
  const cambiarAnios = (a: number) => {
    setAnios(a);
    if (reduccionVsBase(a) >= 0.4) setRedujo(true);
  };
  const reparar = () => {
    if (reparado) return;
    setReparado(true);
    cambiarAnios(Math.min(ANIOS_MAX, anios + 2));
    blip();
  };
  const elegirDestinoFinal = (id: DestinoFinalId) => {
    setDestinoFinal(id);
    setDestinoNonce((k) => k + 1);
    setLlegoFinal(false);
    blip();
    despues(T_VUELO * 1000 + 100, () => {
      setLlegoFinal(true);
      if (id === "reciclaje") setReciclo(true);
      sfx(id === "reciclaje");
    });
  };
  const metales = metalesRecuperadosG(lote);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    limpiarTimers();
    if (modo === "viaje") {
      setCortados([]);
      setPrediccion("");
      setEnvio(null);
      setFase("listo");
      setResueltos([]);
    }
    if (modo === "consulta") {
      setSitio(null);
      setIncluidos(FRAGMENTOS.map((f) => f.id));
      setConHttps(true);
      setEnvioIA(null);
      setFaseIA("listo");
      setRespuesta(false);
      setVerificadas([]);
      setDecisiones({});
      setErroresIA(0);
      setDeclaracion(null);
    }
    if (modo === "dispositivo") {
      setAnios(ANIOS_BASE);
      setReparado(false);
      setDestinoFinal(null);
      setLlegoFinal(false);
      setLote(1);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: ObjetivoLab[] = [
    { txt: "Enviar un archivo: el DNS traduce el nombre y el mensaje viaja en paquetes", done: envioHecho },
    { txt: "Predecir los paquetes de un envío con un error menor al 10 %", done: prediccionOk },
    { txt: "Cruzar el Atlántico por el cable submarino y comparar la latencia", done: cruzoOceano },
    { txt: "Cortar un enlace y ver a los paquetes tomar otra ruta", done: vioRodeo },
    { txt: "Ver lo que captura el espía de la wifi cuando la conexión no va cifrada", done: vioHttp },
    { txt: "Enviar tu consulta al sitio legítimo, con HTTPS y sin datos personales", done: envioSeguro },
    { txt: "Verificar la respuesta de la IA, descartar lo inventado y declarar su uso", done: iaResponsable },
    { txt: "Reducir al menos 40 % la huella anual del teléfono alargando su vida", done: redujo },
    { txt: "Llevar el teléfono al reciclaje formal y ver qué metales se recuperan", done: reciclo },
    { txt: "Clasificar aparatos (reparar, reutilizar o reciclar) y ganar estrellas", done: clasifico },
    { txt: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaPaquete = modo;
  let chipVivo = "";
  let pie: ReactNode = "";
  const envCont = envio ? CONTENIDOS.find((c) => c.id === envio.contenido)! : null;
  const envDest = envio ? DESTINOS.find((d) => d.id === envio.destino)! : null;
  if (modo === "viaje") {
    if (fase === "dns" && envDest) {
      chipVivo = `DNS · ¿${envDest.dominio}?`;
      pie = `Tu celular todavía no conoce la dirección de ${envDest.dominio}: primero pregunta al servidor DNS, que responde ${envDest.ip}.`;
    } else if (fase === "datos" && envCont && envDest) {
      chipVivo = `${num(paquetesDe(envCont.bytes))} ${paquetesDe(envCont.bytes) === 1 ? "paquete" : "paquetes"} → ${envDest.ip}`;
      pie = `${envCont.etq} (${tamano(envCont.bytes)}) partido en paquetes de hasta ${num(MTU)} bytes. Cada uno lleva la IP de destino y su número de orden; en la escena se dibujan unos cuantos.`;
    } else if (fase === "llego" && envio && envCont && envDest) {
      const lat = latenciaMs(envio.km);
      chipVivo = `llegó · ${num(lat, 1)} ms de ida · ${num(envio.km)} km`;
      pie = `Llegaron los ${num(paquetesDe(envCont.bytes))} paquetes a ${nodo(envio.destino).etq}. ${envio.rodeo ? "Como había un enlace cortado, los routers mandaron los paquetes por un rodeo más largo." : "Los routers eligieron la ruta más corta disponible."} La luz tarda al menos ${num(lat, 1)} ms en recorrer ${num(envio.km)} km de fibra.`;
    } else {
      chipVivo = ruta ? `${contenido.etq.toLowerCase()} → ${destino.dominio}` : "sin ruta: la red quedó partida";
      pie = ruta
        ? `Ruta prevista: ${ruta.nodos.map((n) => nodo(n).etq.split(" (")[0]).join(" → ")} · ${num(ruta.km)} km. Elige qué envías, predice los paquetes y presiona «Enviar».`
        : "Cortaste todos los caminos hacia ese destino: ningún router puede entregar los paquetes. Reconecta un enlace.";
    }
  } else if (modo === "consulta") {
    if (faseIA === "ida") {
      chipVivo = envioIA?.cifrado ? "enviando por HTTPS · cifrado" : "enviando por HTTP · sin cifrar";
      pie = envioIA?.cifrado ? "Tus paquetes pasan por la wifi del café cifrados: el espía los captura, pero solo ve bytes sin sentido y el dominio al que te conectas." : "Tus paquetes pasan por la wifi del café sin cifrar: cualquiera en la misma red puede leerlos.";
    } else if (faseIA === "vuelta") {
      chipVivo = "la IA responde…";
      pie = "La respuesta vuelve en paquetes por el mismo camino.";
    } else if (faseIA === "llego" && envioDef && !envioDef.legitimo) {
      chipVivo = "tus datos llegaron a un sitio falso";
      pie = envioDef.explica;
    } else if (respuesta) {
      const n = AFIRMACIONES_IA.filter((a) => decisiones[a.id]).length;
      chipVivo = declaracionOk ? "uso de IA verificado y declarado" : `respuesta de la IA · ${n}/5 revisadas`;
      pie = "La IA devolvió cinco afirmaciones. Verifica cada una antes de decidir si la usas en tu trabajo o la descartas; al final, declara cómo usaste la IA.";
    } else {
      chipVivo = sitioDef ? sitioDef.url.replace(/^https?:\/\//, "") : "elige a dónde mandar la consulta";
      pie = sitioDef ? "Revisa tu mensaje: quita lo que no hace falta compartir y elige la conexión. Después envía la consulta." : "Estás en la wifi pública de un café y quieres preguntarle algo al asistente de IA de tu escuela. Lee cada dirección con cuidado.";
    }
  } else {
    chipVivo = destinoFinal && llegoFinal ? `${DESTINOS_FINALES.find((d) => d.id === destinoFinal)!.etq.toLowerCase()}` : `${anios} ${anios === 1 ? "año" : "años"} · ${num(huella.total, 1)} kg CO₂e/año`;
    pie =
      destinoFinal && llegoFinal
        ? DESTINOS_FINALES.find((d) => d.id === destinoFinal)!.explica
        : `Fabricar el teléfono emite ≈ ${CO2_FABRICACION_KG} kg de CO₂e (ilustrativo); cargarlo, ${num(huella.uso, 1)} kg al año. Entre más años lo uses, más se reparte la fabricación.`;
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
  const lecturas = (items: { label: string; value: string; unit?: string; col?: string }[]) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, marginTop: 10 }}>
      {items.map((x) => (
        <Dato key={x.label} label={x.label} value={x.unit ? `${x.value} ${x.unit}` : x.value} col={x.col} />
      ))}
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "viaje") {
    const huellaEnvio = envio && envCont ? huellaRed(envCont.bytes, envio.red) : null;
    const realEnv = envCont ? paquetesDe(envCont.bytes) : 0;
    const errPred = envio && envio.prediccion !== null ? errorRelativo(envio.prediccion, realEnv) : null;
    control = (
      <>
        {sub("1 · ¿Qué envías?")}
        <div className="pi-opts">
          {CONTENIDOS.map((c) => (
            <button key={c.id} className="pi-opt pi-contenido" data-on={c.id === contenidoId} onClick={() => cambiarContenido(c.id)} disabled={enviando} style={{ ["--pic" as string]: modoCol, background: c.id === contenidoId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8 }} />
              {c.etq} · {tamano(c.bytes)}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{contenido.nota}</div>
        {sub("2 · ¿A qué servidor?")}
        <div className="pi-opts">
          {DESTINOS.map((d) => (
            <button key={d.id} className="pi-opt pi-destino" data-on={d.id === destinoId} onClick={() => cambiarDestino(d.id)} disabled={enviando} style={{ ["--pic" as string]: modoCol, background: d.id === destinoId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${d.icono}`} style={{ marginRight: 8 }} />
              <span style={{ fontFamily: "ui-monospace, monospace" }}>{d.dominio}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{destino.servicio}.</div>
        {sub("3 · ¿Por qué red sale?")}
        <div className="pi-opts">
          {REDES.map((r) => (
            <button key={r.id} className="pi-opt pi-red" data-on={r.id === redId} onClick={() => { if (!enviando) { setRedId(r.id); blip(); } }} disabled={enviando} style={{ ["--pic" as string]: accent, background: r.id === redId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              <i className={`fa-solid ${r.icono}`} style={{ marginRight: 8 }} />
              {r.etq}
            </button>
          ))}
        </div>
        {sub("4 · Predice: ¿cuántos paquetes hacen falta?")}
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, ...NUM }}>
          {tamano(contenido.bytes)} = {num(contenido.bytes)} bytes. Cada paquete mide hasta {num(MTU)} bytes, pero {num(MTU - CARGA_UTIL)} son encabezados IP y TCP: caben {num(CARGA_UTIL)} bytes de datos.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <input className="pi-input" type="text" inputMode="numeric" aria-label="Predicción de paquetes" placeholder="p. ej. 2000" value={prediccion} onChange={(e) => setPrediccion(e.target.value)} disabled={enviando} style={{ ...NUM }} />
          <span style={{ fontSize: 14, color: T.text3 }}>paquetes</span>
        </div>
        <button className="pi-toggle pi-enviar" onClick={enviar} disabled={enviando || !ruta} style={{ marginTop: 12, ["--pic" as string]: modoCol }}>
          <i className={`fa-solid ${enviando ? "fa-spinner fa-spin" : "fa-paper-plane"}`} style={{ marginRight: 9, color: modoCol }} />
          {fase === "dns" ? "Preguntando al DNS…" : fase === "datos" ? "Enviando paquetes…" : !ruta ? "Sin ruta hacia el destino" : `Enviar ${contenido.etq.toLowerCase()} a ${destino.dominio}`}
        </button>
        {fase === "llego" && envio && envCont && envDest && huellaEnvio && (
          <>
            {lecturas([
              { label: "Paquetes", value: num(realEnv), col: modoCol },
              { label: "Distancia", value: num(envio.km), unit: "km" },
              { label: "Latencia de ida", value: num(latenciaMs(envio.km), 1), unit: "ms" },
              { label: "Ida y vuelta", value: num(2 * latenciaMs(envio.km), 1), unit: "ms" },
              { label: "Energía de red", value: energia(huellaEnvio.wh) },
              { label: "CO₂e", value: carbono(huellaEnvio.gCO2) },
            ])}
            <div style={{ fontSize: 14, color: T.text2, marginTop: 8, lineHeight: 1.55, ...NUM }}>
              Paquetes = ⌈{num(envCont.bytes)} ÷ {num(CARGA_UTIL)}⌉ = <strong style={{ color: "#fff" }}>{num(realEnv)}</strong>. Latencia = {num(envio.km)} km ÷ {num(V_FIBRA_KM_S)} km/s ={" "}
              <strong style={{ color: "#fff" }}>{num(latenciaMs(envio.km), 1)} ms</strong>. Energía = {dos(envCont.bytes / 1e9)} GB × {REDES.find((r) => r.id === envio.red)!.kwhPorGb} kWh/GB; CO₂e con {FACTOR_CO2_KG_KWH} kg/kWh (red eléctrica de México, 2024).
            </div>
            {envio.conDns && nota(`Primero el DNS tradujo ${envDest.dominio} a ${envDest.ip}. La respuesta queda guardada un rato: el siguiente envío a ese servidor ya no pregunta.`, "#fbbf24", "fa-address-book")}
            {errPred !== null &&
              (realEnv >= 100
                ? nota(
                    errPred <= 0.1 ? `Buena predicción: te desviaste ${num(errPred * 100, 1)} % del valor real.` : `Predijiste ${num(envio.prediccion!)}; fueron ${num(realEnv)} (error de ${num(errPred * 100, 0)} %). Divide los bytes entre ${num(CARGA_UTIL)} y redondea hacia arriba.`,
                    errPred <= 0.1 ? OK : WARN,
                    errPred <= 0.1 ? "fa-circle-check" : "fa-rotate-left",
                  )
                : nota("Un envío tan pequeño cabe en un solo paquete: prueba tu predicción con el PDF, la foto o el video.", T.text3))}
            {envio.destino === "mad" && nota("Para llegar a Madrid los paquetes cruzan el Atlántico por el cable MAREA (Virginia Beach–Bilbao): más de la mitad de la latencia se va en el océano.", "#67e8f9", "fa-water")}
            {envio.red === "movil" && nota("Por datos móviles el mismo envío gasta unas diez veces más energía de red que por wifi: conviene descargar lo pesado con wifi.", WARN, "fa-tower-cell")}
          </>
        )}
        {sub("5 · Corta enlaces de la red troncal")}
        <div className="pi-opts">
          {ENLACES_CORTABLES.map((e) => {
            const on = cortados.includes(e.id);
            return (
              <button key={e.id} className="pi-opt pi-corte" data-on={on} onClick={() => cortar(e.id)} disabled={enviando} style={{ ["--pic" as string]: on ? "#f87171" : modoCol, background: on ? "rgba(248,113,113,0.14)" : "transparent" }}>
                <i className={`fa-solid ${on ? "fa-link-slash" : "fa-link"}`} style={{ marginRight: 8 }} />
                {e.etq}
              </button>
            );
          })}
        </div>
        {ruta
          ? nota(
              <>
                Ruta actual: {ruta.nodos.map((n) => nodo(n).etq.split(" (")[0]).join(" → ")} · <strong>{num(ruta.km)} km</strong>
                {rutaBase && ruta.km > rutaBase.km + 1 ? ` (${num(ruta.km - rutaBase.km)} km de rodeo)` : ""}.
              </>,
              rutaBase && ruta.km > rutaBase.km + 1 ? "#fbbf24" : T.text2,
              "fa-route",
            )
          : nota("No queda ningún camino hacia ese servidor: la red quedó partida. Reconecta algún enlace.", WARN, "fa-triangle-exclamation")}
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Distancias terrestres en línea recta entre ciudades (la fibra real es más larga, y los routers agregan retardo). El cable MAREA mide {num(ENLACES.find((e) => e.id === "marea")!.km ?? 0)} km. La energía por GB es un promedio de orden de magnitud.
        </div>
      </>
    );
  } else if (modo === "consulta") {
    const sinDatosEnv = envioIA ? FRAGMENTOS.every((f) => f.necesario || !envioIA.incluidos.includes(f.id)) : true;
    control = (
      <>
        {sub("1 · ¿A qué dirección mandas tu consulta?")}
        <div style={{ display: "grid", gap: 7 }}>
          {SITIOS.map((s) => (
            <button key={s.id} className="pi-opt pi-sitio" data-on={s.id === sitio} onClick={() => elegirSitio(s.id)} disabled={enviandoIA} style={{ ["--pic" as string]: modoCol, background: s.id === sitio ? `${modoCol}1f` : "transparent", textAlign: "left" }}>
              <i className={`fa-solid ${s.https ? "fa-lock" : "fa-lock-open"}`} style={{ marginRight: 9, color: s.https ? OK : WARN }} />
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 14 }}>{s.url}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>Tu escuela te dio la dirección tutor-ia.ejemplo.mx. Lee cada dominio completo, de derecha a izquierda. (Direcciones ficticias.)</div>
        {sub("2 · Tu mensaje: toca un fragmento para quitarlo o incluirlo")}
        <div style={{ display: "grid", gap: 7 }}>
          {FRAGMENTOS.map((f) => {
            const on = incluidos.includes(f.id);
            return (
              <button key={f.id} className="pi-opt pi-frag" data-on={on} onClick={() => alternarFragmento(f.id)} disabled={enviandoIA} style={{ ["--pic" as string]: modoCol, background: on ? `${modoCol}14` : "transparent", textAlign: "left", textDecoration: on ? "none" : "line-through" }}>
                <i className={`fa-solid ${on ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 9 }} />
                {f.texto}
              </button>
            );
          })}
        </div>
        {!incluidos.includes("pregunta") && nota("Sin tu pregunta, la IA no sabe qué responder.", WARN)}
        {sub("3 · Conexión")}
        <div className="pi-opts">
          {[true, false].map((h) => {
            const on = conHttps === h;
            return (
              <button key={String(h)} className="pi-opt pi-proto" data-on={on} onClick={() => { if (!enviandoIA) { setConHttps(h); blip(); } }} disabled={enviandoIA} style={{ ["--pic" as string]: h ? OK : WARN, background: on ? `${h ? OK : WARN}1f` : "transparent" }}>
                <i className={`fa-solid ${h ? "fa-lock" : "fa-lock-open"}`} style={{ marginRight: 8 }} />
                {h ? "HTTPS (cifrada)" : "HTTP (sin cifrar)"}
              </button>
            );
          })}
        </div>
        {sitioDef && !sitioDef.https && nota("Esa dirección empieza con http://: aunque elijas HTTPS, ese sitio no cifra la conexión.", WARN, "fa-lock-open")}
        {sitioDef?.https && !conHttps && nota("Demostración: así viajaría tu consulta si el sitio no usara HTTPS.", T.text3)}
        <button className="pi-toggle pi-enviar-ia" onClick={enviarIA} disabled={enviandoIA || !sitioDef || !incluidos.includes("pregunta")} style={{ marginTop: 12, ["--pic" as string]: modoCol }}>
          <i className={`fa-solid ${enviandoIA ? "fa-spinner fa-spin" : "fa-paper-plane"}`} style={{ marginRight: 9, color: modoCol }} />
          {faseIA === "ida" ? "Enviando consulta…" : faseIA === "vuelta" ? "Recibiendo la respuesta…" : !sitioDef ? "Elige primero una dirección" : `Enviar consulta a ${sitioDef.url.replace(/^https?:\/\//, "")}`}
        </button>
        {envioIA && envioDef && (faseIA === "vuelta" || faseIA === "llego") && (
          <>
            {!envioDef.legitimo
              ? nota(<><strong>Tus datos llegaron a un sitio falso.</strong> {envioDef.explica}</>, WARN, "fa-skull-crossbones")
              : nota(
                  <>
                    {envioIA.cifrado && sinDatosEnv ? <strong>Envío seguro. </strong> : <strong>Llegó, pero con riesgos. </strong>}
                    {envioIA.cifrado ? envioDef.explica : "Es la dirección correcta, pero en esta demostración la conexión no iba cifrada."}{" "}
                    {!envioIA.cifrado && `Sin HTTPS, el espía leyó: «${mensajeEnviado}». `}
                    {FRAGMENTOS.filter((f) => !f.necesario && envioIA.incluidos.includes(f.id))
                      .map((f) => f.porque)
                      .join(" ")}
                  </>,
                  envioIA.cifrado && sinDatosEnv ? OK : WARN,
                  envioIA.cifrado && sinDatosEnv ? "fa-shield-halved" : "fa-triangle-exclamation",
                )}
          </>
        )}
        {respuesta && (
          <>
            {sub("4 · Verifica la respuesta de la IA antes de usarla")}
            <div style={{ display: "grid", gap: 9 }}>
              {AFIRMACIONES_IA.map((a, i) => {
                const ver = verificadas.includes(a.id);
                const d = decisiones[a.id];
                const bien = d ? (d === "usar") === a.correcta : null;
                return (
                  <div key={a.id} className="pi-afirm" style={{ padding: "10px 12px", borderRadius: 11, border: `1px solid ${bien === null ? T.line : bien ? `${OK}66` : `${WARN}66`}`, background: "rgba(4,10,22,0.45)" }}>
                    <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.45 }}>
                      <strong style={{ color: modoCol }}>{i + 1}.</strong> {a.texto}
                    </div>
                    {ver && (
                      <div style={{ fontSize: 14, color: a.correcta ? "#86efac" : "#fca5a5", lineHeight: 1.45, marginTop: 6 }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 6 }} />
                        {a.verificacion} <span style={{ color: T.text3 }}>({a.fuente})</span>
                      </div>
                    )}
                    <div className="pi-opts" style={{ marginTop: 8 }}>
                      <button className="pi-opt pi-verificar" data-on={ver} onClick={() => verificar(a.id)} disabled={ver} style={{ ["--pic" as string]: "#fbbf24" }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 7 }} />
                        {ver ? "Verificada" : "Verificar"}
                      </button>
                      <button className="pi-opt pi-usar" data-on={d === "usar"} onClick={() => decidir(a.id, "usar")} style={{ ["--pic" as string]: OK, background: d === "usar" ? `${OK}1f` : "transparent" }}>
                        <i className="fa-solid fa-file-circle-plus" style={{ marginRight: 7 }} />
                        Usar con crédito
                      </button>
                      <button className="pi-opt pi-descartar" data-on={d === "descartar"} onClick={() => decidir(a.id, "descartar")} style={{ ["--pic" as string]: WARN, background: d === "descartar" ? `${WARN}1f` : "transparent" }}>
                        <i className="fa-solid fa-trash-can" style={{ marginRight: 7 }} />
                        Descartar
                      </button>
                    </div>
                    {d && !ver && <div style={{ fontSize: 14, color: WARN, marginTop: 6 }}>Decidiste sin verificar: comprueba antes de confiar.</div>}
                    {bien === false && <div style={{ fontSize: 14, color: WARN, marginTop: 6 }}>{a.correcta ? "Esta afirmación es correcta: puedes usarla citando la fuente." : "Esta afirmación no es cierta: no debe ir en tu trabajo."}</div>}
                  </div>
                );
              })}
            </div>
            {todasDecididas && (
              <>
                {sub("5 · ¿Cómo declaras el uso de IA en tu trabajo?")}
                <div style={{ display: "grid", gap: 7 }}>
                  {DECLARACIONES.map((d) => {
                    const on = declaracion === d.id;
                    const col = on ? (d.correcta ? OK : WARN) : modoCol;
                    return (
                      <button key={d.id} className="pi-opt pi-declara" data-on={on} onClick={() => declarar(d.id)} style={{ ["--pic" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}>
                        {d.texto}
                      </button>
                    );
                  })}
                </div>
                {declaracion && nota(DECLARACIONES.find((d) => d.id === declaracion)!.explica, declaracionOk ? OK : WARN, declaracionOk ? "fa-circle-check" : "fa-rotate-left")}
              </>
            )}
            {iaResponsable && nota(`Uso responsable completo: verificaste las cinco afirmaciones, descartaste las dos falsas y declaraste el uso de IA${erroresIA > 0 ? ` (con ${erroresIA} ${erroresIA === 1 ? "decisión corregida" : "decisiones corregidas"})` : ""}.`, OK, "fa-award")}
          </>
        )}
        {!respuesta && mensaje && sitioDef && faseIA === "listo" && <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.45 }}>Tu mensaje: «{mensaje}»</div>}
      </>
    );
  } else {
    control = (
      <>
        {sub("1 · ¿Cuántos años usas el teléfono?")}
        <Deslizador label="Años de uso" icon="fa-calendar" colr={modoCol} valor={`${anios} ${anios === 1 ? "año" : "años"}`} min={1} max={ANIOS_MAX} step={1} value={anios} onChange={cambiarAnios} hintL="1 año" hintR={`${ANIOS_MAX} años`} />
        <button className="pi-toggle pi-reparar" onClick={reparar} disabled={reparado || anios >= ANIOS_MAX} style={{ marginTop: 10, ["--pic" as string]: "#38bdf8" }}>
          <i className="fa-solid fa-screwdriver-wrench" style={{ marginRight: 9, color: "#38bdf8" }} />
          {reparado ? "Batería cambiada: +2 años de uso" : "Reparar: cambiar la batería gastada (+2 años)"}
        </button>
        {lecturas([
          { label: "Fabricación / año", value: num(huella.fabricacion, 1), unit: "kg" },
          { label: "Carga / año", value: num(huella.uso, 1), unit: "kg" },
          { label: "Total / año", value: num(huella.total, 1), unit: "kg CO₂e", col: modoCol },
          { label: `vs. ${ANIOS_BASE} años`, value: `${reduccion >= 0 ? "−" : "+"}${num(Math.abs(reduccion) * 100, 0)}`, unit: "%", col: reduccion >= 0.4 ? OK : reduccion < 0 ? WARN : undefined },
        ])}
        <div style={{ fontSize: 14, color: T.text2, marginTop: 8, lineHeight: 1.55, ...NUM }}>
          Huella por año = {CO2_FABRICACION_KG} kg ÷ {anios} + {KWH_CARGA_ANIO} kWh × {FACTOR_CO2_KG_KWH} kg/kWh = <strong style={{ color: "#fff" }}>{num(huella.total, 2)} kg CO₂e</strong>
        </div>
        {reduccion >= 0.4
          ? nota(`Usarlo ${anios} años baja ${num(reduccion * 100, 0)} % su huella anual frente a cambiarlo cada ${ANIOS_BASE}: la fabricación pesa mucho más que la carga.`, OK, "fa-leaf")
          : nota("La barra gris (fabricación repartida) es mucho más grande que la amarilla (carga): ¿qué pasa si lo usas más años?", T.text3)}
        {sub("2 · Cuando ya no lo uses, ¿a dónde va?")}
        <div style={{ display: "grid", gap: 7 }}>
          {DESTINOS_FINALES.map((d) => (
            <button key={d.id} className="pi-opt pi-final" data-on={d.id === destinoFinal} onClick={() => elegirDestinoFinal(d.id)} style={{ ["--pic" as string]: d.color, background: d.id === destinoFinal ? `${d.color}1f` : "transparent", textAlign: "left" }}>
              <i className={`fa-solid ${d.icono}`} style={{ marginRight: 9 }} />
              {d.etq}
            </button>
          ))}
        </div>
        {destinoFinal && llegoFinal && nota(DESTINOS_FINALES.find((d) => d.id === destinoFinal)!.explica, DESTINOS_FINALES.find((d) => d.id === destinoFinal)!.color, DESTINOS_FINALES.find((d) => d.id === destinoFinal)!.icono)}
        {destinoFinal === "reciclaje" && llegoFinal && (
          <>
            {sub("3 · ¿Cuánto metal se recupera?")}
            <div className="pi-opts">
              {LOTES.map((l) => (
                <button key={l.n} className="pi-opt pi-lote" data-on={l.n === lote} onClick={() => { setLote(l.n); blip(); }} style={{ ["--pic" as string]: modoCol, background: l.n === lote ? `${modoCol}1f` : "transparent" }}>
                  {l.etq}
                </button>
              ))}
            </div>
            {lecturas(METALES.map((m) => ({ label: m.etq, value: masa(metales[m.id]), col: m.color })))}
            <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>EPA de EE. UU.: por cada millón de celulares reciclados se recuperan unas 35 274 lb de cobre, 772 lb de plata, 75 lb de oro y 33 lb de paladio.</div>
          </>
        )}
        {nota(
          `En 2022 el mundo generó ${DATOS_EWASTE.mundoMt2022} millones de toneladas de basura electrónica y solo el ${num(DATOS_EWASTE.recicladoFormalPct, 1)} % se recolectó y recicló de manera documentada; para 2030 se esperan ${DATOS_EWASTE.mundoMt2030} millones (Global E-waste Monitor 2024).`,
          T.text2,
          "fa-earth-americas",
        )}
      </>
    );
  }

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <style>{estilos(accent)}</style>
          <SceneBoundary fallback={sceneFallback}>
            <PaqueteScene
              vista={vista}
              modoColor={modoCol}
              resetNonce={resetNonce}
              destino={destinoId}
              rutaClave={ruta ? ruta.nodos.join(">") : ""}
              cortados={cortados}
              envioNonce={envioNonce}
              conDns={envio?.conDns ?? false}
              paquetesVisibles={Math.min(24, envCont ? paquetesDe(envCont.bytes) : 1)}
              dnsResuelto={resueltos.includes(destinoId)}
              sitio={sitio}
              iaNonce={iaNonce}
              iaCifrado={envioIA?.cifrado ?? true}
              espiaTexto={mensajeEnviado}
              espiaCifrado={cifradoDe(mensajeEnviado || "vacio", 40)}
              verificadas={verificadas}
              decisiones={decisiones}
              declarado={declaracionOk}
              anios={anios}
              destinoFinal={destinoFinal}
              destinoNonce={destinoNonce}
              lote={lote}
              detalles={detalles}
            />
          </SceneBoundary>
        </>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono="fa-tags" titulo={detalles ? "Ocultar detalles" : "Ver detalles"} activo={detalles} onClick={() => setDetalles((d) => !d)} />
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
              <Bloque titulo={def.etq} icono={def.icono}>
                {control}
              </Bloque>
              <Bloque titulo="Lo que pasa" icono="fa-comment-dots">
                <p style={{ margin: 0, color: "#eaf0fb", ...NUM }}>{pie}</p>
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
              <AparatosCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Usas la tecnología con responsabilidad." />
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
              <Bloque titulo="¿Qué pasa cuando presionas «Enviar»?" icono="fa-network-wired">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Lectura A1" icono="fa-book-open">
                <div style={{ color: "#fff", fontWeight: 800 }}>{TITULO_A1}</div>
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>{p}</p>
                ))}
                <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR</div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => (
                    <li key={i}>
                      {q.pregunta}
                      <details style={{ marginTop: 3 }}>
                        <summary style={{ cursor: "pointer", color: T.text3 }}>Respuesta guía</summary>
                        <span style={{ color: "#bae6fd" }}>{q.guia}</span>
                      </details>
                    </li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                {INSTRUCCIONES.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ color: "#fff", minWidth: 0 }}>{p}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9, color: T.text2 }}>
                  {IDEAS.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Hechos (quiz A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                {GLOSARIO.map((gi, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                    <span style={{ color: T.text2 }}>{gi.definicion}</span>
                    <div style={{ color: T.text3, marginTop: 4 }}>
                      <i className="fa-solid fa-lightbulb" style={{ marginRight: 6, color: accent }} />
                      {gi.ejemplo}
                    </div>
                  </div>
                ))}
                <div style={{ color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
                </div>
              </Bloque>
              <Bloque titulo="Reflexión (A3)" icono="fa-pen-to-square">
                <p style={{ margin: 0, color: T.text2 }}>{REFLEXION_A3}</p>
              </Bloque>
              <Bloque titulo="Autoevaluación (A7)" icono="fa-clipboard-check">
                <p style={{ margin: 0, color: T.text3 }}>
                  {AUTOEVAL_A7.instrucciones} Escala: {AUTOEVAL_A7.escala.join(" · ")}.
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 7, color: T.text2 }}>
                  {AUTOEVAL_A7.criterios.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <p style={{ margin: 0, color: "#fff" }}>{AUTOEVAL_A7.reflexionFinal}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PAQUETE_INTERNET_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                La lectura A1 con sus preguntas, la reflexión A3, los hechos del quiz A4, el glosario A5, la autoevaluación A7, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma. Son{" "}
                <strong>cálculos exactos</strong> del modelo: los paquetes (MTU de 1 500 bytes con 40 de encabezados IP y TCP), la latencia mínima con la luz a 200 000 km/s en la fibra, las distancias en línea recta entre ciudades y los metales recuperables (EPA). Son{" "}
                <strong>ilustrativos, de orden de magnitud</strong>: los tamaños de los archivos (salvo el video HD, ≈ 3 GB/h según Netflix), la energía de red por GB (IEA, Kamiya 2020: 0.1–0.2 kWh/GB para 4G; Aslan et al. 2018 para redes fijas), los 50 kg de CO₂e de
                fabricar un teléfono (informes ambientales de fabricantes, 2023) y los 5 kWh anuales de carga. El factor de emisión es el oficial del Sistema Eléctrico Nacional 2024 (0.444 t CO₂e/MWh). La red está simplificada y fuera de escala; los dominios, direcciones IP (rangos de documentación), el estudio
                «Ramírez y Soto (2021)» y los datos personales son ficticios. Cable MAREA: Virginia Beach–Bilbao, 6 600 km (2017). Basura electrónica: Global E-waste Monitor 2024. Fuente del contenido: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
