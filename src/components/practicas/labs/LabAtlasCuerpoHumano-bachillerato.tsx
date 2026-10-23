"use client";

/**
 * Laboratorio 3D insignia — «Atlas del cuerpo humano» (UVEG bachillerato).
 *
 * Puerto y ampliación del atlas de NEM básica: casi 1,900 piezas con su forma
 * real (Z-Anatomy, CC BY-SA 4.0, derivado de BodyParts3D). Lo que lo hace
 * grande se conserva —tocar cualquier pieza y saber qué es, encender y apagar
 * sistemas, desarmar el cuerpo, ver una pieza sola o esconderla— y se le suma
 * lo que pide bachillerato:
 *
 *   · CORTES en los planos sagital, frontal y transversal;
 *   · seis modos: Explorar (libre) y cinco sistemas (locomotor, digestivo,
 *     circulatorio, respiratorio y nervioso), cada uno con su «Predice», un
 *     experimento con consecuencia visible y «Función → estructura»;
 *   · fisiología en movimiento: latido con gasto cardiaco (FC × VS) y
 *     respiración con ventilación pulmonar (FR × VC);
 *   · recorridos que se trazan al tocar en orden: el bolo y la sangre.
 *
 * El plan 2025 no tiene una progresión de anatomía: es práctica libre.
 */

import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta, Deslizador } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { NOMBRES, type IdSistema } from "./atlas-cuerpo-nombres";
import { SISTEMA_INFO, funcionDe } from "./atlas-cuerpo-datos";
import {
  type Modo, type ModoHueso, MODOS, modoPorId, RETOS_FUNCION, RECORRIDOS, PREDICE, QUIZ_ATLAS, esParada,
  FC_MIN, FC_MAX, FC_INICIO, FC_META, VS_ML, gastoCardiaco,
  FR_MIN, FR_MAX, FR_INICIO, VC_MIN, VC_MAX, VC_INICIO, VENT_META, ventilacion,
} from "./atlas-cuerpo-modos";
import { ATLAS_CUERPO_FICHA } from "./atlas-cuerpo-ficha";
import { TarjetaPredice } from "./atlas-cuerpo-predice";
import type { Aislar, AtlasEscenaProps, EjeCorte, ModoVista, Pieza } from "./atlas-cuerpo-escena";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-atlas-cuerpo-humano-3d-reto";

function Cargando({ texto, pct }: { texto: string; pct?: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.7)", pointerEvents: "none" }}>
      <i className="fa-solid fa-person fa-fade" style={{ fontSize: 34, color: "#f3b54a" }} aria-hidden />
      <span style={{ fontSize: 15, fontWeight: 700 }}>{texto}</span>
      {pct !== undefined && (
        <span style={{ width: 200, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <span style={{ display: "block", height: "100%", width: `${Math.max(4, Math.min(100, pct))}%`, background: "#f3b54a", transition: "width .3s" }} />
        </span>
      )}
    </div>
  );
}

const AtlasCuerpoEscena = dynamic<AtlasEscenaProps>(() => import("./atlas-cuerpo-escena"), {
  ssr: false,
  loading: () => <Cargando texto="Preparando el atlas anatómico…" />,
});

/** Sistemas del riel, en el orden en que conviene verlos. */
const ORDEN: IdSistema[] = ["esqueleto", "musculos", "circulatorio", "respiratorio", "digestivo", "urinario", "nervioso", "sentidos", "endocrino", "linfatico"];
/** Piezas del oído, escondidas dentro del hueso y del encéfalo: se muestran con su sistema solo. */
const OCULTAS_OIDO = /^(Malleus|Incus|Stapes|Cochlea|Vestibule|Tympanic membrane)$/;
const ARCHIVO_DE: Partial<Record<IdSistema, string>> = { esqueleto: "huesos", musculos: "músculos", circulatorio: "corazón y vasos", respiratorio: "pulmones", digestivo: "órganos digestivos", nervioso: "encéfalo y nervios" };

const sinAcentos = (s: string) => s.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase();
const INDICE = Object.entries(NOMBRES)
  .filter(([, n]) => n.s !== "reproductor")
  .map(([clave, n]) => ({ clave, n, plano: sinAcentos(`${n.es} ${n.c ?? ""}`) }));

const PULMON_O_CORAZON = /lobe of (left|right) lung|^(Left|Right) (ventricle|atrium)$/;
const ENFOQUE_MODO: Record<Modo, string> = {
  explorar: "todo",
  locomotor: "todo",
  digestivo: "sistema:digestivo",
  circulatorio: "claves:Left ventricle|Right ventricle|Left atrium|Right atrium|Aortic arch|Superior vena cava|Pulmonary trunk|Middle lobe of right lung",
  respiratorio: "sistema:respiratorio",
  nervioso: "claves:Frontal lobe|Parietal lobe|Occipital lobe|Temporal lobe|Cerebellum|Medulla oblongata",
};

function piezaDeClave(clave: string): Pieza | null {
  const n = NOMBRES[clave];
  return n ? { id: `${n.s}:${clave}`, clave, lado: null, sistema: n.s } : null;
}
const nombreDe = (clave: string) => NOMBRES[clave]?.es ?? clave;

// ── Sistemas encendidos (y los ya pedidos, que no se sueltan) ───────────────
type EstadoSistemas = { visibles: Record<IdSistema, boolean>; cargar: IdSistema[] };
type AccionSistemas = { tipo: "solo"; sistemas: IdSistema[] } | { tipo: "alternar"; s: IdSistema } | { tipo: "mostrar"; s: IdSistema[] };
function reductorSistemas(e: EstadoSistemas, a: AccionSistemas): EstadoSistemas {
  const visibles = { ...e.visibles };
  if (a.tipo === "solo") for (const s of Object.keys(visibles) as IdSistema[]) visibles[s] = a.sistemas.includes(s);
  else if (a.tipo === "alternar") visibles[a.s] = !visibles[a.s];
  else for (const s of a.s) visibles[s] = true;
  const cargar = [...e.cargar];
  for (const s of Object.keys(visibles) as IdSistema[]) if (visibles[s] && !cargar.includes(s)) cargar.push(s);
  return { visibles, cargar };
}
const INICIALES = MODOS[0]!.sistemas;
const INICIO_SISTEMAS: EstadoSistemas = {
  visibles: Object.fromEntries(Object.keys(SISTEMA_INFO).map((s) => [s, INICIALES.includes(s as IdSistema)])) as Record<IdSistema, boolean>,
  cargar: INICIALES,
};

type Mensaje = { tipo: "bien" | "mal" | "info"; texto: string } | null;
type Actividad = "recorrido" | "funcion";

/** Una vez que la condición se cumple, se queda cumplida (cambiar de modo no la deshace). */
function useLatch(cond: boolean): boolean {
  const [l, setL] = useState(false);
  if (cond && !l) setL(true);
  return l || cond;
}

export function LabAtlasCuerpoHumano({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  // ── Estado del atlas ──────────────────────────────────────────────────────
  const [modo, setModo] = useState<Modo>("explorar");
  const cfg = modoPorId(modo);
  const [sis, despachar] = useReducer(reductorSistemas, INICIO_SISTEMAS);
  const [hueso, setHueso] = useState<ModoHueso>("rayos");
  const [seleccion, setSeleccion] = useState<Pieza | null>(null);
  const [hover, setHover] = useState<Pieza | null>(null);
  const [aislar, setAislar] = useState<Aislar>(false);
  const [separar, setSeparar] = useState(0);
  const [vista, setVista] = useState<ModoVista>("cuerpo");
  const [enfoque, setEnfoque] = useState<{ a: string; n: number }>({ a: "todo", n: 0 });
  const [ocultas, setOcultas] = useState<string[]>([]);
  const [corte, setCorte] = useState<{ eje: EjeCorte | null; pos: number }>({ eje: null, pos: 0.5 });
  const [opMusculo, setOpMusculo] = useState(1);
  const [listo, setListo] = useState(false);
  const [conteo, setConteo] = useState(0);
  const [carga, setCarga] = useState<{ activo: boolean; pct: number }>({ activo: false, pct: 0 });
  const [busca, setBusca] = useState("");

  // ── Fisiología ────────────────────────────────────────────────────────────
  const [fc, setFc] = useState(FC_INICIO);
  const [latiendo, setLatiendo] = useState(true);
  const [fr, setFr] = useState(FR_INICIO);
  const [vc, setVc] = useState(VC_INICIO);
  const [respirando, setRespirando] = useState(true);
  const [fase, setFase] = useState<"inspiracion" | "espiracion" | null>(null);
  const fasesVistas = useRef(0);

  // ── Actividades ───────────────────────────────────────────────────────────
  const [actividad, setActividad] = useState<Actividad>("funcion");
  const [rutas, setRutas] = useState<Partial<Record<Modo, string[]>>>({});
  const [funcionIdx, setFuncionIdx] = useState<Partial<Record<Modo, number>>>({});
  const [mensaje, setMensaje] = useState<Mensaje>(null);
  const [predice, setPredice] = useState<Partial<Record<Modo, string>>>({});
  const [comprobado, setComprobado] = useState<Partial<Record<Modo, boolean>>>({});
  const [sistemasTocados, setSistemasTocados] = useState<IdSistema[]>([]);
  const [aislo, setAislo] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [vioTalamo, setVioTalamo] = useState(false);
  const [aprobado, setAprobado] = useState(false);

  // ── Sonido ────────────────────────────────────────────────────────────────
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const toggleSonido = async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  };
  useEffect(() => () => {
    audioRef.current?.dispose();
    audioRef.current = null;
  }, []);
  const sfx = (t: "blip" | "bien" | "mal") => {
    if (!sonido) return;
    const a = audioRef.current;
    if (t === "blip") a?.blip();
    else if (t === "bien") a?.correcto();
    else a?.incorrecto();
  };

  const ir = (a: string) => setEnfoque((e) => ({ a, n: e.n + 1 }));
  const comprobar = (m: Modo) => setComprobado((c) => (c[m] ? c : { ...c, [m]: true }));

  // ── Cambiar de modo ───────────────────────────────────────────────────────
  const cambiarModo = (m: Modo) => {
    const c = modoPorId(m);
    setModo(m);
    despachar({ tipo: "solo", sistemas: c.sistemas });
    setHueso(c.hueso);
    setSeleccion(null);
    setAislar(false);
    setVista("cuerpo");
    setSeparar(0);
    setCorte({ eje: null, pos: 0.5 });
    setOcultas([]);
    setOpMusculo(1);
    setMensaje(null);
    setActividad(RECORRIDOS[m] ? "recorrido" : "funcion");
    ir(ENFOQUE_MODO[m]);
    sfx("blip");
  };

  // ── Recorrido y función → estructura ──────────────────────────────────────
  const recorrido = RECORRIDOS[modo];
  const retos = RETOS_FUNCION[modo];
  const ruta = rutas[modo] ?? [];
  const idxFuncion = funcionIdx[modo] ?? 0;
  const actividadActiva: Actividad | null = recorrido && (actividad === "recorrido" || !retos) ? "recorrido" : retos ? "funcion" : null;

  const evaluarRecorrido = (p: Pieza) => {
    if (!recorrido) return;
    const i = ruta.length;
    if (i >= recorrido.paradas.length) return;
    const parada = recorrido.paradas[i]!;
    if (esParada(parada, p.clave)) {
      const nueva = [...ruta, p.id];
      setRutas((r) => ({ ...r, [modo]: nueva }));
      setMensaje({ tipo: "bien", texto: `${parada.nombre}: ${parada.ocurre}` });
      if (modo === "digestivo" && nueva.length >= 5) comprobar("digestivo");
      if (modo === "circulatorio" && nueva.length >= 5) comprobar("circulatorio");
      sfx("bien");
      return;
    }
    if (recorrido.paradas.slice(0, i).some((x) => esParada(x, p.clave))) {
      setMensaje({ tipo: "info", texto: `${nombreDe(p.clave)} ya está en el recorrido. ${parada.pista}` });
      return;
    }
    setMensaje({ tipo: "mal", texto: `Tocaste ${nombreDe(p.clave)}: no es la siguiente parada. ${parada.pista}` });
    sfx("mal");
  };

  const evaluarFuncion = (p: Pieza) => {
    if (!retos || idxFuncion >= retos.length) return;
    const r = retos[idxFuncion]!;
    if (r.tocar.includes(p.clave)) {
      setFuncionIdx((f) => ({ ...f, [modo]: idxFuncion + 1 }));
      setMensaje({ tipo: "bien", texto: r.bien });
      sfx("bien");
      return;
    }
    const suya = funcionDe(p.clave);
    setMensaje({ tipo: "mal", texto: `Tocaste ${nombreDe(p.clave)}${suya ? ` — ${suya.split(":").slice(-1)[0]!.trim()}` : ""} Esa no es. Pista: ${r.pista}` });
    sfx("mal");
  };

  // ── Tocar una pieza ───────────────────────────────────────────────────────
  const elegir = (p: Pieza | null) => {
    setSeleccion(p);
    if (!p) {
      setAislar((a) => (a === "resaltadas" ? a : false));
      return;
    }
    // El oído queda dentro del hueso y del encéfalo: se muestra solo con su sistema.
    setAislar((a) => (a === "pieza" ? a : OCULTAS_OIDO.test(p.clave) ? "sistema" : false));
    if (modo === "explorar") {
      setSistemasTocados((s) => (s.includes(p.sistema) ? s : [...s, p.sistema]));
      if (corte.eje === "transversal" && PULMON_O_CORAZON.test(p.clave)) comprobar("explorar");
      ir(p.id);
    }
    if (modo === "locomotor" && /triceps brachii/.test(p.clave)) comprobar("locomotor");
    if (modo === "nervioso" && corte.eje === "sagital") {
      if (p.clave === "Corpus callosum") comprobar("nervioso");
      if (p.clave === "Thalamus") setVioTalamo(true);
    }
    if (actividadActiva === "recorrido") evaluarRecorrido(p);
    else if (actividadActiva === "funcion") evaluarFuncion(p);
    else sfx("blip");
  };

  const elegirClave = (clave: string) => {
    const p = piezaDeClave(clave);
    if (!p) return;
    despachar({ tipo: "mostrar", s: [p.sistema] });
    if (p.sistema !== "esqueleto" && hueso === "solido") setHueso("rayos");
    setAislar(false);
    setVista("cuerpo");
    setSeleccion(p);
    if (modo === "explorar") setSistemasTocados((s) => (s.includes(p.sistema) ? s : [...s, p.sistema]));
    ir(p.id);
  };

  const onFase = (f: "inspiracion" | "espiracion") => {
    setFase(f);
    if (modo === "respiratorio") {
      fasesVistas.current += 1;
      if (fasesVistas.current >= 3) comprobar("respiratorio");
    }
  };

  // ── Corte ─────────────────────────────────────────────────────────────────
  const ponerCorte = (eje: EjeCorte | null, pos?: number) => {
    const inicial = eje === "transversal" ? 0.72 : eje === "frontal" ? 0.55 : 0.5;
    setCorte((c) => ({ eje, pos: pos ?? (eje === c.eje ? c.pos : inicial) }));
    if (eje) setVista("cuerpo");
    const dir = eje === "sagital" ? "lado" : eje === "frontal" ? "frente" : eje === "transversal" ? "oblicua" : "frente";
    // En los modos de cuerpo entero se encuadra la cara cortada; en los de sistema, el sistema.
    if (eje && ENFOQUE_MODO[modo] === "todo") ir(`corte:${eje}`);
    else ir(`${ENFOQUE_MODO[modo]}@${dir}`);
  };

  // ── Valores en vivo ───────────────────────────────────────────────────────
  const gc = gastoCardiaco(fc);
  const vent = ventilacion(fr, vc);
  const latido = modo === "circulatorio" || (modo === "explorar" && sis.visibles.circulatorio) ? (latiendo ? fc : null) : null;
  const respiracion = modo === "respiratorio" && respirando ? { fr, vc } : modo === "explorar" && respirando && sis.visibles.respiratorio ? { fr: FR_INICIO, vc: VC_INICIO } : null;

  // Capas translúcidas: músculo en locomotor; en circulatorio los pulmones dejan
  // ver el corazón y solo se vuelven sólidos (y tocables) cuando son la parada.
  const enPulmones = modo === "circulatorio" && actividadActiva === "recorrido" && recorrido?.paradas[ruta.length]?.nombre === "Pulmones";
  const opacidades: Partial<Record<IdSistema, number>> =
    modo === "locomotor" ? { musculos: opMusculo } : modo === "circulatorio" ? { respiratorio: enPulmones ? 0.9 : 0.22 } : {};

  // En el viaje del bolo, el hígado y la vesícula tapan el estómago y el duodeno.
  const translucidas = useMemo(() => (modo === "digestivo" && actividadActiva === "recorrido" ? ["Liver", "Gallbladder"] : []), [modo, actividadActiva]);

  // ── Misiones (se quedan cumplidas al cambiar de modo) ─────────────────────
  const predOk = (m: Modo) => !!predice[m] && !!comprobado[m];
  const bajoCapa = useLatch(modo === "locomotor" && opMusculo <= 0.35);
  const fcAlta = useLatch(modo === "circulatorio" && latiendo && fc >= FC_META);
  const ventAlta = useLatch(modo === "respiratorio" && respirando && vent >= VENT_META);
  const recorridoListo = (m: Modo) => (rutas[m]?.length ?? 0) >= (RECORRIDOS[m]?.paradas.length ?? Infinity);
  const funcionLista = (m: Modo) => (funcionIdx[m] ?? 0) >= (RETOS_FUNCION[m]?.length ?? Infinity);

  const objetivos = [
    { txt: "Predice: ¿qué rodea al corazón en un corte transversal? Compruébalo", done: predOk("explorar"), modo: "explorar" },
    { txt: `Localiza órganos de 4 sistemas distintos tocándolos (${Math.min(4, sistemasTocados.length)}/4)`, done: sistemasTocados.length >= 4, modo: "explorar" },
    { txt: "Aísla una pieza para verla sola y oculta otra con «Ocultar»", done: aislo && oculto, modo: "explorar" },
    { txt: "Predice qué músculo estira el codo y compruébalo", done: predOk("locomotor"), modo: "locomotor" },
    { txt: "Baja la capa muscular hasta ver los huesos que mueve", done: bajoCapa, modo: "locomotor" },
    { txt: "Relaciona 4 funciones con su hueso, músculo o tendón", done: funcionLista("locomotor"), modo: "locomotor" },
    { txt: "Predice dónde se absorben los nutrientes y compruébalo", done: predOk("digestivo"), modo: "digestivo" },
    { txt: "Sigue el viaje del bolo de la boca al colon sigmoide", done: recorridoListo("digestivo"), modo: "digestivo" },
    { txt: "Relaciona 4 funciones digestivas con su órgano", done: funcionLista("digestivo"), modo: "digestivo" },
    { txt: "Predice a dónde va la sangre del ventrículo derecho", done: predOk("circulatorio"), modo: "circulatorio" },
    { txt: `Sube la frecuencia a ${FC_META} lpm: ¿cuánto bombea por minuto?`, done: fcAlta, modo: "circulatorio" },
    { txt: "Sigue el viaje de la sangre de las cavas a la aorta", done: recorridoListo("circulatorio"), modo: "circulatorio" },
    { txt: "Relaciona 3 funciones con su cámara o vaso", done: funcionLista("circulatorio"), modo: "circulatorio" },
    { txt: "Predice qué hace el diafragma al contraerse y compruébalo", done: predOk("respiratorio"), modo: "respiratorio" },
    { txt: `Respira como al correr: ventilación de ${VENT_META} L/min o más`, done: ventAlta, modo: "respiratorio" },
    { txt: "Relaciona 4 funciones respiratorias con su estructura", done: funcionLista("respiratorio"), modo: "respiratorio" },
    { txt: "Predice qué une los hemisferios y compruébalo con un corte", done: predOk("nervioso"), modo: "nervioso" },
    { txt: "Con el corte sagital, localiza el tálamo", done: vioTalamo, modo: "nervioso" },
    { txt: "Relaciona 4 funciones con su parte del encéfalo", done: funcionLista("nervioso"), modo: "nervioso" },
    { txt: "Aprueba el reto de estructura y función", done: aprobado },
  ];

  // ── Buscador ──────────────────────────────────────────────────────────────
  const resultados = useMemo(() => {
    const q = sinAcentos(busca.trim());
    if (q.length < 2) return [];
    return INDICE.filter((x) => x.plano.includes(q))
      .sort((a, b) => a.plano.indexOf(q) - b.plano.indexOf(q) || a.n.es.length - b.n.es.length)
      .slice(0, 7);
  }, [busca]);

  // ── Lectura en vivo (≤ 10 palabras) ───────────────────────────────────────
  let lectura: ReactNode;
  if (modo === "circulatorio") lectura = latiendo ? <>{fc} lpm · gasto cardiaco {gc.toFixed(1)} L/min</> : <>Corazón en pausa · {conteo.toLocaleString("es-MX")} piezas</>;
  else if (modo === "respiratorio") lectura = respirando ? <>{fase === "espiracion" ? "Espiración: el diafragma sube" : "Inspiración: el diafragma baja"} · {vent.toFixed(1)} L/min</> : <>Respiración en pausa · {vent.toFixed(1)} L/min</>;
  else if (modo === "digestivo" && recorrido) lectura = <>Bolo: parada {Math.min(ruta.length, recorrido.paradas.length)} de {recorrido.paradas.length}{ruta.length ? ` · ${recorrido.paradas[ruta.length - 1]!.nombre}` : ""}</>;
  else if (modo === "locomotor") lectura = <>Capa muscular al {Math.round(opMusculo * 100)} % · {conteo.toLocaleString("es-MX")} piezas</>;
  else lectura = <>{conteo.toLocaleString("es-MX")} piezas a la vista{corte.eje ? ` · corte ${corte.eje}` : ""}</>;

  // ── Ficha de la pieza seleccionada ────────────────────────────────────────
  const fichaPieza = seleccion ? (() => {
    const n = NOMBRES[seleccion.clave] ?? { es: seleccion.clave, s: seleccion.sistema };
    const inf = SISTEMA_INFO[seleccion.sistema];
    const fn = funcionDe(seleccion.clave);
    const lado = /\.l$/.test(seleccion.id) ? "izquierdo" : /\.r$/.test(seleccion.id) ? "derecho" : null;
    return (
      <Bloque titulo="Pieza seleccionada" icono="fa-hand-pointer">
        <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${inf.color}55`, background: `${inf.color}12`, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", background: inf.color, color: "#141821", fontSize: 15, flexShrink: 0 }}>
              <i className={`fa-solid ${inf.icono}`} aria-hidden />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{n.es}</div>
              <div style={{ fontSize: 14, color: T.text2 }}>
                {inf.nombre}
                {lado ? ` · lado ${lado}` : ""}
                {n.c ? ` · ${n.c}` : ""}
              </div>
            </div>
          </div>
          {fn && <div style={{ color: "#eaf0fb", lineHeight: 1.55 }}>{fn}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <BotonPanel
              icono={aislar === "pieza" ? "fa-people-group" : "fa-cube"}
              fuerte={aislar !== "pieza"}
              color={accent}
              onClick={() => {
                const nuevo = aislar === "pieza" ? false : "pieza";
                setAislar(nuevo);
                if (nuevo) setAislo(true);
                ir(seleccion.id);
              }}
            >
              {aislar === "pieza" ? "Ver todo otra vez" : "Verla sola"}
            </BotonPanel>
            <BotonPanel
              icono="fa-eye-slash"
              color={accent}
              onClick={() => {
                setOcultas((o) => (o.includes(seleccion.id) ? o : [...o, seleccion.id]));
                setOculto(true);
                setSeleccion(null);
                setAislar(false);
              }}
            >
              Ocultar
            </BotonPanel>
            <BotonPanel icono="fa-magnifying-glass-plus" color={accent} onClick={() => ir(seleccion.id)}>
              Acercar
            </BotonPanel>
          </div>
        </div>
      </Bloque>
    );
  })() : null;

  // ── Bloques por modo ──────────────────────────────────────────────────────
  const bloqueRecorrido = recorrido ? (
    <div style={{ display: "grid", gap: 8 }}>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
        {recorrido.paradas.map((pa, i) => {
          const hecho = i < ruta.length;
          const actual = i === ruta.length;
          return (
            <li key={pa.nombre} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 8px", borderRadius: 9, background: actual ? `${recorrido.color}1f` : "transparent", border: `1px solid ${actual ? `${recorrido.color}66` : "transparent"}` }}>
              <span style={{ width: 24, height: 24, borderRadius: 99, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, background: hecho ? recorrido.color : "rgba(255,255,255,0.08)", color: hecho ? "#04121f" : T.text2 }}>
                {hecho ? <i className="fa-solid fa-check" aria-hidden /> : i + 1}
              </span>
              <span style={{ fontSize: 14, fontWeight: actual ? 800 : 600, color: hecho || actual ? "#fff" : T.text2 }}>{actual ? `¿Siguiente parada? (${i + 1})` : hecho ? pa.nombre : "· · ·"}</span>
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={() => { setRutas((r) => ({ ...r, [modo]: [] })); setMensaje(null); }} style={estiloBotonSecundario}>
        <i className="fa-solid fa-rotate-left" aria-hidden /> Empezar el recorrido de nuevo
      </button>
    </div>
  ) : null;

  const bloqueFuncion = retos ? (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 4 }} aria-label={`Función ${Math.min(idxFuncion + 1, retos.length)} de ${retos.length}`}>
        {retos.map((_, i) => (
          <span key={i} style={{ flex: 1, height: 5, borderRadius: 99, background: i < idxFuncion ? OK : i === idxFuncion ? cfg.color : "rgba(255,255,255,0.14)" }} />
        ))}
      </div>
      {idxFuncion < retos.length ? (
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>
          <i className="fa-solid fa-hand-pointer" aria-hidden style={{ color: cfg.color, marginRight: 8 }} />
          {retos[idxFuncion]!.pide}
        </div>
      ) : (
        <div style={{ fontSize: 15, fontWeight: 800, color: OK }}>
          <i className="fa-solid fa-circle-check" aria-hidden /> Relacionaste todas las funciones de este sistema.
        </div>
      )}
    </div>
  ) : null;

  const avisoMensaje = mensaje ? (
    <div aria-live="polite" style={{ padding: "10px 12px", borderRadius: 10, fontSize: 14, lineHeight: 1.5, color: "#eaf0fb", background: mensaje.tipo === "bien" ? "rgba(52,211,153,0.12)" : mensaje.tipo === "mal" ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.06)", border: `1px solid ${mensaje.tipo === "bien" ? "rgba(52,211,153,0.45)" : mensaje.tipo === "mal" ? "rgba(248,113,113,0.4)" : T.line}` }}>
      <i className={`fa-solid ${mensaje.tipo === "bien" ? "fa-circle-check" : mensaje.tipo === "mal" ? "fa-circle-xmark" : "fa-circle-info"}`} aria-hidden style={{ marginRight: 7, color: mensaje.tipo === "bien" ? OK : mensaje.tipo === "mal" ? "#f87171" : T.text2 }} />
      {mensaje.texto}
    </div>
  ) : null;

  let experimento: ReactNode = null;
  if (modo === "explorar") {
    experimento = (
      <Bloque titulo="Busca y desarma" icono="fa-magnifying-glass">
        <div style={{ position: "relative" }}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden style={{ position: "absolute", left: 13, top: 15, color: T.text3, fontSize: 14 }} />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Busca: fémur, aorta, tálamo…"
            aria-label="Buscar una pieza del cuerpo"
            style={{ width: "100%", height: 44, padding: "0 12px 0 36px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "rgba(4,10,22,0.55)", color: "#fff", fontSize: 15, outline: "none" }}
          />
        </div>
        {resultados.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
            {resultados.map((r) => (
              <li key={r.clave}>
                <button type="button" className="acl-fila" onClick={() => { elegirClave(r.clave); setBusca(""); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 44, padding: "6px 10px", borderRadius: 9, border: "none", background: "transparent", color: "#fff", textAlign: "left", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: SISTEMA_INFO[r.n.s].color, flexShrink: 0 }} />
                  <span style={{ minWidth: 0 }}>
                    {r.n.es}
                    {r.n.c && <span style={{ display: "block", fontSize: 13, color: T.text3, fontWeight: 500 }}>{r.n.c}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Segmentado
          opciones={[{ id: "cuerpo", etq: "Cuerpo armado", icono: "fa-person" }, { id: "piezas", etq: "Todas las piezas", icono: "fa-table-cells" }]}
          valor={vista}
          color={accent}
          onCambio={(v) => {
            setVista(v as ModoVista);
            setAislar(false);
            if (v === "piezas") setCorte((c) => ({ ...c, eje: null }));
            ir(v === "piezas" ? "piezas" : "todo");
          }}
        />
        {vista === "cuerpo" && (
          <Deslizador label="Separar las piezas" icon="fa-up-right-and-down-left-from-center" colr={accent} valor={`${Math.round(separar * 100)} %`} min={0} max={100} step={1} value={Math.round(separar * 100)} onChange={(v) => setSeparar(v / 100)} hintL="armado" hintR="desarmado" />
        )}
      </Bloque>
    );
  } else if (modo === "locomotor") {
    experimento = (
      <Bloque titulo="Capas del aparato locomotor" icono="fa-layer-group">
        <Deslizador label="Capa muscular" icon="fa-dumbbell" colr={cfg.color} valor={`${Math.round(opMusculo * 100)} %`} min={0} max={100} step={1} value={Math.round(opMusculo * 100)} onChange={(v) => setOpMusculo(v / 100)} hintL="solo hueso" hintR="músculo completo" />
        <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
          {opMusculo <= 0.35
            ? "Debajo de cada músculo hay un hueso: el músculo se ancla con tendones a dos huesos y, al acortarse, acerca uno al otro. Por eso cada movimiento tiene su antagonista."
            : "Vuelve transparente la capa muscular para ver en qué huesos se ancla cada músculo."}
        </p>
      </Bloque>
    );
  } else if (modo === "circulatorio") {
    experimento = (
      <Bloque titulo="El latido" icono="fa-heart-pulse">
        <Deslizador label="Frecuencia cardiaca" icon="fa-heart" colr={cfg.color} valor={`${fc} lpm`} min={FC_MIN} max={FC_MAX} step={1} value={fc} onChange={setFc} hintL="reposo profundo" hintR="ejercicio intenso" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
          <Dato label="volumen sistólico" value={`${VS_ML} mL`} />
          <Dato label="gasto cardiaco" value={`${gc.toFixed(1)} L/min`} col={fc >= FC_META ? "#fca5a5" : "#fff"} />
        </div>
        <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
          Gasto cardiaco = FC × VS = {fc} × {VS_ML} mL = <strong style={{ color: "#fff" }}>{gc.toFixed(2)} L/min</strong>. {fc >= FC_META ? "Al correr los músculos piden más oxígeno: el corazón responde latiendo más rápido." : "En reposo, unos 5 L por minuto: toda tu sangre pasa por el corazón cada minuto."}
        </p>
      </Bloque>
    );
  } else if (modo === "respiratorio") {
    experimento = (
      <Bloque titulo="La ventilación" icono="fa-lungs">
        <Deslizador label="Frecuencia respiratoria" icon="fa-wind" colr={cfg.color} valor={`${fr} rpm`} min={FR_MIN} max={FR_MAX} step={1} value={fr} onChange={setFr} hintL="sueño" hintR="ejercicio" />
        <Deslizador label="Volumen corriente" icon="fa-lungs" colr="#7dd3fc" valor={`${vc} mL`} min={VC_MIN} max={VC_MAX} step={50} value={vc} onChange={setVc} hintL="superficial" hintR="profunda" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
          <Dato label="fase" value={!respirando ? "en pausa" : fase === "espiracion" ? "espiración" : "inspiración"} col={fase === "espiracion" ? "#7dd3fc" : "#fca5a5"} />
          <Dato label="ventilación" value={`${vent.toFixed(1)} L/min`} col={vent >= VENT_META ? "#86efac" : "#fff"} />
        </div>
        <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
          Ventilación = FR × VC = {fr} × {(vc / 1000).toFixed(2)} L = <strong style={{ color: "#fff" }}>{vent.toFixed(1)} L/min</strong>. Mira el diafragma: en la inspiración baja y los pulmones se expanden; en la espiración sube.
        </p>
      </Bloque>
    );
  } else if (modo === "nervioso") {
    experimento = (
      <Bloque titulo="Corte del encéfalo" icono="fa-scissors">
        <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>Un corte sagital por la línea media separa los dos hemisferios y deja ver lo que hay entre ellos: el cuerpo calloso, el tálamo y los ventrículos.</p>
        <button type="button" onClick={() => ponerCorte("sagital", 0.5)} style={{ ...estiloBotonSecundario, borderColor: `${cfg.color}88`, background: `${cfg.color}1a` }}>
          <i className="fa-solid fa-scissors" aria-hidden /> Cortar por la línea media
        </button>
      </Bloque>
    );
  }

  const tieneAmbas = !!recorrido && !!retos;

  // ── Herramientas comunes del atlas ────────────────────────────────────────
  const herramientasAtlas = (
    <Bloque titulo="Herramientas del atlas" icono="fa-toolbox">
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>Corte anatómico</div>
      <Segmentado
        opciones={[
          { id: "ninguno", etq: "Sin corte" },
          { id: "sagital", etq: "Sagital" },
          { id: "frontal", etq: "Frontal" },
          { id: "transversal", etq: "Transversal" },
        ]}
        valor={corte.eje ?? "ninguno"}
        color={accent}
        onCambio={(v) => ponerCorte(v === "ninguno" ? null : (v as EjeCorte))}
      />
      {corte.eje && (
        <Deslizador
          label={corte.eje === "transversal" ? "Altura del corte" : corte.eje === "sagital" ? "Posición (derecha → izquierda)" : "Profundidad (atrás → adelante)"}
          icon="fa-scissors"
          colr={accent}
          valor={`${Math.round(corte.pos * 100)} %`}
          min={0}
          max={100}
          step={1}
          value={Math.round(corte.pos * 100)}
          onChange={(v) => setCorte((c) => ({ ...c, pos: v / 100 }))}
          hintL={corte.eje === "transversal" ? "pies" : corte.eje === "sagital" ? "derecha" : "espalda"}
          hintR={corte.eje === "transversal" ? "cabeza" : corte.eje === "sagital" ? "izquierda" : "frente"}
        />
      )}
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginTop: 4 }}>Los huesos se ven</div>
      <Segmentado
        opciones={[{ id: "solido", etq: "Sólidos" }, { id: "rayos", etq: "Rayos X" }, { id: "oculto", etq: "Ocultos" }]}
        valor={hueso}
        color={accent}
        onCambio={(v) => {
          setHueso(v as ModoHueso);
          despachar({ tipo: "mostrar", s: ["esqueleto"] });
        }}
      />
      {modo !== "explorar" && (
        <Deslizador label="Separar las piezas" icon="fa-up-right-and-down-left-from-center" colr={accent} valor={`${Math.round(separar * 100)} %`} min={0} max={100} step={1} value={Math.round(separar * 100)} onChange={(v) => setSeparar(v / 100)} hintL="armado" hintR="desarmado" />
      )}
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginTop: 4 }}>Sistemas (capas)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 6 }}>
        {ORDEN.map((s) => {
          const inf = SISTEMA_INFO[s];
          const on = sis.visibles[s];
          return (
            <button
              key={s}
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => despachar({ tipo: "alternar", s })}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 9, minHeight: 42, padding: "6px 10px", borderRadius: 10, border: `1px solid ${on ? `${inf.color}88` : T.line}`, background: on ? `${inf.color}1c` : "rgba(4,10,22,0.4)", color: on ? "#fff" : T.text3, fontSize: 14, fontWeight: 700, textAlign: "left" }}
            >
              <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: on ? inf.color : "rgba(255,255,255,0.08)", color: on ? "#141821" : T.text3, fontSize: 12 }}>
                <i className={`fa-solid ${inf.icono}`} aria-hidden />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>{inf.corto}</span>
              <i className={`fa-solid ${on ? "fa-eye" : "fa-eye-slash"}`} aria-hidden style={{ fontSize: 13 }} />
            </button>
          );
        })}
      </div>
      {ocultas.length > 0 && (
        <button type="button" onClick={() => setOcultas([])} style={estiloBotonSecundario}>
          <i className="fa-solid fa-eye" aria-hidden /> Mostrar las {ocultas.length} piezas ocultas
        </button>
      )}
    </Bloque>
  );

  // ── Pantalla ──────────────────────────────────────────────────────────────
  const archivoEnCarga = (() => {
    const s = cfg.sistemas.find((x) => x !== "esqueleto" && ARCHIVO_DE[x]);
    return s ? ARCHIVO_DE[s] : "piezas";
  })();

  const escena = (
    <div className="acl-raiz" style={{ position: "absolute", inset: 0 }}>
      {/* Veinte misiones no caben en la fila de puntos del shell en un celular:
          se achican y envuelven solo dentro de este laboratorio. */}
      <style>{CSS_ATLAS}</style>
    <SceneBoundary
      fallback={
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 28, textAlign: "center", color: T.text2 }}>
          <i className="fa-solid fa-person" style={{ fontSize: 32, color: accent }} aria-hidden />
          <div style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>Este equipo no pudo abrir la escena 3D</div>
          <div style={{ fontSize: 14, maxWidth: 420, lineHeight: 1.5 }}>Las fichas de cada sistema, el reto y la teoría siguen disponibles en el panel.</div>
        </div>
      }
    >
      <AtlasCuerpoEscena
        visibles={sis.visibles}
        cargar={sis.cargar}
        hueso={hueso}
        seleccion={seleccion?.id ?? null}
        resaltadas={[]}
        aislar={aislar}
        separar={separar}
        modo={vista}
        enfoque={enfoque}
        ocultas={ocultas}
        corte={corte}
        opacidades={opacidades}
        translucidas={translucidas}
        latido={latido}
        respiracion={respiracion}
        ruta={recorrido ? ruta : []}
        rutaColor={recorrido?.color ?? accent}
        acento={cfg.color}
        onSeleccion={elegir}
        onHover={setHover}
        onListo={() => setListo(true)}
        onConteo={setConteo}
        onFase={onFase}
        onProgreso={(activo, pct) => setCarga((c) => (c.activo === activo && c.pct === pct ? c : { activo, pct }))}
      />
      {!listo && <Cargando texto="Cargando casi 1,900 piezas anatómicas…" pct={carga.pct} />}
      {listo && carga.activo && (
        <div style={{ position: "absolute", left: "50%", top: 72, transform: "translateX(-50%)", padding: "7px 14px", borderRadius: 99, background: "rgba(4,10,22,0.85)", border: `1px solid ${T.line}`, fontSize: 14, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
          <i className="fa-solid fa-circle-notch fa-spin" aria-hidden style={{ color: cfg.color }} /> Cargando {archivoEnCarga}… {Math.round(carga.pct)} %
        </div>
      )}
    </SceneBoundary>
    </div>
  );

  const leyenda = (
    <>
      {hover ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "#fff" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: SISTEMA_INFO[hover.sistema].color }} />
          {nombreDe(hover.clave)}
        </div>
      ) : (
        <div style={{ color: T.text2, fontWeight: 700 }}>
          <i className="fa-solid fa-hand-pointer" aria-hidden style={{ marginRight: 6, color: cfg.color }} />
          Toca una pieza para saber qué es
        </div>
      )}
      <div style={{ color: T.text3, fontSize: 13 }}>
        Modelos: Z-Anatomy · <span title="Creative Commons Atribución-CompartirIgual 4.0">CC BY-SA 4.0</span>
      </div>
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={escena}
      leyenda={leyenda}
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.etiqueta, icono: m.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "circulatorio" && <BotonHerramienta icono={latiendo ? "fa-pause" : "fa-heart-pulse"} titulo={latiendo ? "Detener el latido" : "Reanudar el latido"} activo={latiendo} onClick={() => setLatiendo((v) => !v)} />}
          {modo === "respiratorio" && <BotonHerramienta icono={respirando ? "fa-pause" : "fa-lungs"} titulo={respirando ? "Detener la respiración" : "Reanudar la respiración"} activo={respirando} onClick={() => setRespirando((v) => !v)} />}
          <BotonHerramienta icono="fa-person" titulo="Vista de frente" onClick={() => ir(`${ENFOQUE_MODO[modo]}@frente`)} />
          <BotonHerramienta icono="fa-person-walking" titulo="Vista de lado" onClick={() => ir(`${ENFOQUE_MODO[modo]}@lado`)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar el modo" onClick={() => cambiarModo(modo)} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "atlas",
          etiqueta: "Atlas",
          icono: "fa-person",
          contenido: (
            <>
              <style>{`.acl-fila:hover, .acl-chip:hover { background: rgba(255,255,255,0.09) !important; }`}</style>
              <p style={{ margin: "0 0 14px", color: T.text2, lineHeight: 1.5 }}>{cfg.intro}</p>
              <TarjetaPredice
                p={PREDICE[modo]}
                color={cfg.color}
                eleccion={predice[modo] ?? null}
                comprobado={!!comprobado[modo]}
                onElegir={(id) => { setPredice((x) => ({ ...x, [modo]: id })); sfx("blip"); }}
              />
              <div style={{ height: 20 }} />
              {experimento}
              {(recorrido || retos) && (
                <Bloque titulo={tieneAmbas ? "Actividad" : recorrido ? recorrido.titulo : "Función → estructura"} icono={actividadActiva === "recorrido" ? "fa-route" : "fa-link"}>
                  {tieneAmbas && (
                    <Segmentado
                      opciones={[{ id: "recorrido", etq: recorrido!.titulo, icono: "fa-route" }, { id: "funcion", etq: "Función → estructura", icono: "fa-link" }]}
                      valor={actividadActiva ?? "recorrido"}
                      color={cfg.color}
                      onCambio={(v) => { setActividad(v as Actividad); setMensaje(null); }}
                    />
                  )}
                  {actividadActiva === "recorrido" ? bloqueRecorrido : bloqueFuncion}
                  {avisoMensaje}
                </Bloque>
              )}
              {fichaPieza}
              {herramientasAtlas}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={QUIZ_ATLAS}
              accent={accent}
              rgba={color.rgba}
              aprobado={aprobado}
              onAprobado={() => setAprobado(true)}
              mensajeAprobado="¡Aprobado! Relacionas la estructura de los órganos con su función."
              playSfx={sonido ? (ok) => sfx(ok ? "bien" : "mal") : undefined}
              playPick={sonido ? () => sfx("blip") : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: <Teoria accent={accent} rgba={color.rgba} onParte={(k) => elegirClave(k)} />,
        },
      ]}
    />
  );
}

// ── Piezas de interfaz ──────────────────────────────────────────────────────
const CSS_ATLAS = `
.ls:has(.acl-raiz) .ls-mision-ceja { flex-wrap: wrap; row-gap: 5px; }
.ls:has(.acl-raiz) .ls-puntos { flex-wrap: wrap; gap: 3px; }
.ls:has(.acl-raiz) .ls-puntos span { width: 10px; }
.ls:has(.acl-raiz) .ls-mision { min-width: 0; }
@media (max-width: 560px) {
  .ls:has(.acl-raiz) .ls-puntos span { width: 7px; height: 4px; }
}
`;

const estiloBotonSecundario: CSSProperties = {
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minHeight: 42,
  padding: "8px 14px",
  borderRadius: 10,
  border: `1px solid ${T.lineStrong}`,
  background: "rgba(4,10,22,0.5)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 800,
};

function BotonPanel({ icono, children, onClick, fuerte, color }: { icono: string; children: ReactNode; onClick: () => void; fuerte?: boolean; color: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...estiloBotonSecundario, minHeight: 40, padding: "7px 12px", border: fuerte ? "none" : estiloBotonSecundario.border, background: fuerte ? color : estiloBotonSecundario.background, color: fuerte ? "#04121f" : "#fff" }}
    >
      <i className={`fa-solid ${icono}`} aria-hidden />
      {children}
    </button>
  );
}

function Segmentado({ opciones, valor, onCambio, color }: { opciones: { id: string; etq: string; icono?: string }[]; valor: string; onCambio: (id: string) => void; color: string }) {
  return (
    <div role="radiogroup" style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: 3, borderRadius: 11, background: "rgba(255,255,255,0.06)" }}>
      {opciones.map((o) => {
        const on = o.id === valor;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onCambio(o.id)}
            style={{ cursor: "pointer", flex: "1 1 auto", minHeight: 38, padding: "6px 10px", borderRadius: 8, border: "none", background: on ? color : "transparent", color: on ? "#04121f" : T.text2, fontSize: 14, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, whiteSpace: "nowrap" }}
          >
            {o.icono && <i className={`fa-solid ${o.icono}`} aria-hidden />}
            {o.etq}
          </button>
        );
      })}
    </div>
  );
}

const lista14: CSSProperties = { margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2 };

function Teoria({ accent, rgba, onParte }: { accent: string; rgba: string; onParte: (clave: string) => void }) {
  return (
    <>
      <Bloque titulo="Cómo usar el atlas" icono="fa-circle-info">
        <ol style={lista14}>
          <li>Arrastra para girar, pellizca o usa la rueda para acercar. Toca cualquier pieza para ver su nombre y su función.</li>
          <li>Cambia de modo arriba: Explorar es libre; cada sistema trae su «Predice», un experimento y «Función → estructura».</li>
          <li>Usa los cortes sagital, frontal y transversal para ver por dentro, como en una tomografía.</li>
          <li>Con «Verla sola» la pieza gira aislada; con «Ocultar» la quitas para ver lo que tapa.</li>
        </ol>
      </Bloque>
      {(["esqueleto", "musculos", "digestivo", "circulatorio", "respiratorio", "nervioso", "urinario", "endocrino", "linfatico", "sentidos"] as IdSistema[]).map((s) => {
        const inf = SISTEMA_INFO[s];
        return (
          <Bloque key={s} titulo={inf.nombre} icono={inf.icono}>
            <div style={{ color: T.text2, lineHeight: 1.55 }}>{inf.que}</div>
            {inf.partes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {inf.partes.map((k) => (
                  <button key={k} type="button" className="acl-chip" onClick={() => onParte(k)} style={{ cursor: "pointer", minHeight: 34, padding: "4px 11px", borderRadius: 99, border: `1px solid ${inf.color}55`, background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, fontWeight: 600 }}>
                    {NOMBRES[k]?.es ?? k}
                  </button>
                ))}
              </div>
            )}
            <ul style={lista14}>
              {inf.datos.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            {inf.enlace && (
              <div style={{ fontSize: 14, color: "#eaf0fb", lineHeight: 1.5 }}>
                <i className="fa-solid fa-link" aria-hidden style={{ color: inf.color, marginRight: 7 }} />
                {inf.enlace}
              </div>
            )}
          </Bloque>
        );
      })}
      <Bloque titulo="Ficha teórica" icono="fa-book">
        <FichaTeorica data={ATLAS_CUERPO_FICHA} accent={accent} rgba={rgba} defaultOpen />
      </Bloque>
      <Bloque titulo="Créditos y licencia de los modelos" icono="fa-scale-balanced">
        <div style={{ color: T.text2, lineHeight: 1.55 }}>
          Modelos 3D: <strong style={{ color: "#fff" }}>«Z-Anatomy, the libre 3D atlas of anatomy»</strong> (Gauthier Kervyn y colaboradores), con licencia{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.es" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
            Creative Commons Atribución-CompartirIgual 4.0 (CC BY-SA 4.0)
          </a>
          , derivado de <strong style={{ color: "#fff" }}>«BodyParts3D»</strong>, © The Database Center for Life Science (CC BY-SA 2.1 Japón).
        </div>
        <div style={{ color: T.text2, lineHeight: 1.55 }}>
          Cambios: se redujo el número de polígonos, se comprimieron con Draco, se separaron por sistema y se recolorearon por tejido. Los modelos así modificados se comparten bajo la misma licencia CC BY-SA 4.0. Nombres en español: Terminologia Anatomica (TA2).
        </div>
        <a href="/media/atlas-cuerpo/LICENCIA.txt" target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: 800 }}>
          <i className="fa-solid fa-file-lines" aria-hidden style={{ marginRight: 6 }} />
          Ver el archivo de licencia de los modelos
        </a>
      </Bloque>
    </>
  );
}
