"use client";

/**
 * Laboratorio 3D — "Telling a story: secuencia, conectores y coherencia".
 * Práctica anclada a IN-III-P07-A10 («Tell the story in order», ordenar
 * secuencia) y a IN-III-P07-A4 (verdadero/falso evaluable); progresión 7 de la
 * UAC Inglés III. El marco teórico es la lectura A1, el texto con huecos es el
 * A2, el glosario el A5 y las pistas de escritura las del A3. Inspiración:
 * IN-IV-P01 e IN-IV-P07 (past continuous con while/when, anécdotas).
 *
 * Tres modos:
 *  (1) Put the story in order — viñetas 3D desordenadas que se intercambian y
 *      se reproducen; la reproducción se detiene donde el orden deja de tener
 *      sentido y explica por qué (la causa va antes que el efecto).
 *  (2) Connect the events — elegir el conector y escribir el verbo en pasado;
 *      la línea del tiempo 3D muestra la relación (secuencia, sorpresa, causa,
 *      consecuencia, simultaneidad, interrupción).
 *  (3) Tell your version — escribir una oración por viñeta de una anécdota
 *      muda; validación tolerante de verbos en pasado y conectores, y
 *      reproducción del relato del alumno en el teatrino.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import type { ObjetivoLab } from "./_objetivos";
import { hablarLab, callarLab } from "./lab-voz";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { RELATO_SECUENCIA_INGLES_FICHA } from "./relato-secuencia-ingles-ficha";
import type { EstadoVineta } from "./RelatoSecuenciaInglesScene";
import {
  type Modo,
  type Primero,
  type RevisionOrden,
  type RevisionRelato,
  type Relacion,
  type ItemConectar,
  type EscenaId,
  MODOS,
  MODOS_DEF,
  HISTORIAS,
  revisarOrden,
  barajar,
  ITEMS,
  EVENTO_INICIAL,
  RELACION_DEF,
  oracionCompleta,
  revisarVerbo,
  conectorCorrecto,
  ESCENAS_RELATO,
  revisarRelato,
  ENUNCIADOS_ORDEN,
  rondaOrden,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  GLOSARIO,
  ACTIVIDAD_A5,
  PROMPT_A3,
  PISTAS_A3,
  QUIZ_A4,
  HECHOS,
  HUECOS_A2,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
} from "./relato-secuencia-ingles-data";

const RelatoScene = dynamic(() => import("./RelatoSecuenciaInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-masks-theater fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Montando el teatrino en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-relato-secuencia-ingles-reto";
const WARN = "#FF8A3C";
const T_ESCENA = 3400;

/** Qué relación dibuja la línea del tiempo para cada conector (para la vista previa al tocarlo). */
const RELACION_DE_CONECTOR: Record<string, Relacion> = {
  first: "inicio",
  then: "secuencia",
  "after that": "secuencia",
  later: "despues",
  suddenly: "sorpresa",
  while: "mientras",
  when: "interrupcion",
  so: "consecuencia",
  because: "causa",
  finally: "cierre",
  "in the end": "cierre",
};
const RONDA_INICIAL = rondaOrden(mulberry32(7));

/* ── Tarjeta de estrellas: ¿qué pasó primero? ─────────────────────────── */
function PrimeroCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ENUNCIADOS_ORDEN[ronda[pos] ?? 0]!;

  const responder = (r: Primero) => {
    if (resuelto !== null) return;
    const ok = r === actual.primero;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(actual.porque);
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
    setRonda(rondaOrden(Math.random));
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
          ¿Qué pasó primero?
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
            Oración {pos + 1} de {ronda.length} · en el tiempo real, ¿qué ocurrió antes?
          </div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="rs-opt rs-primero" data-on="true" onClick={() => responder("A")} style={{ ["--rsc" as string]: "#38bdf8" }}>
              <strong style={{ marginRight: 6 }}>A</strong> {actual.a}
            </button>
            <button className="rs-opt rs-primero" data-on="true" onClick={() => responder("B")} style={{ ["--rsc" as string]: "#f472b6" }}>
              <strong style={{ marginRight: 6 }}>B</strong> {actual.b}
            </button>
            <button className="rs-opt rs-primero" data-on="true" onClick={() => responder("igual")} style={{ ["--rsc" as string]: "#c084fc" }}>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 7 }} />
              Al mismo tiempo (una acción en progreso)
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

export function LabRelatoSecuenciaIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("orden");

  // ── Put the story in order
  const [histIdx, setHistIdx] = useState(0);
  const [ordenes, setOrdenes] = useState<Record<string, number[]>>(() => Object.fromEntries(HISTORIAS.map((h) => [h.id, [...h.ordenInicial]])));
  const [sel, setSel] = useState<number | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [paso, setPaso] = useState<number | null>(null);
  const [resultado, setResultado] = useState<RevisionOrden | null>(null);
  const [historiasOk, setHistoriasOk] = useState<Set<string>>(() => new Set());
  const [vioIncoherencia, setVioIncoherencia] = useState(false);

  // ── Connect the events
  const [hechos, setHechos] = useState(0);
  const [conSel, setConSel] = useState<string | null>(null);
  const [verbo, setVerbo] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [retro, setRetro] = useState<{ okC: boolean; okV: boolean; msgC: string; msgV: string } | null>(null);
  const [erroresCon, setErroresCon] = useState(0);
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [probo, setProbo] = useState(false);

  // ── Tell your version
  const [textos, setTextos] = useState<string[]>(() => ESCENAS_RELATO.map(() => ""));
  const [revision, setRevision] = useState<RevisionRelato | null>(null);
  const [focoEsc, setFocoEsc] = useState<number | null>(null);
  const [relatoOk, setRelatoOk] = useState(false);
  const [reprodujoRelato, setReprodujoRelato] = useState(false);
  const [verEjemplo, setVerEjemplo] = useState(false);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const [voz, setVoz] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
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
    const sfxObj = audioRef.current;
    if (sonido) {
      sfxObj.mute();
      setSonido(false);
    } else {
      await sfxObj.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    const lista = timers.current;
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      lista.forEach((t) => window.clearTimeout(t));
      try {
        callarLab();
      } catch {
        /* noop */
      }
    };
  }, []);

  const despues = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const cancelarTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.length = 0;
  };
  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };
  const decir = (texto: string) => {
    if (voz) hablarLab(texto);
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Put the story in order ────────────────────────────────────────── */
  const historia = HISTORIAS[histIdx]!;
  const orden = ordenes[historia.id] ?? historia.ordenInicial;

  const detener = () => {
    cancelarTimers();
    setReproduciendo(false);
    setPaso(null);
  };
  const intercambiar = (a: number, b: number) => {
    if (reproduciendo || a === b || b < 0 || b >= orden.length) return;
    setOrdenes((o) => {
      const arr = [...(o[historia.id] ?? historia.ordenInicial)];
      [arr[a], arr[b]] = [arr[b]!, arr[a]!];
      return { ...o, [historia.id]: arr };
    });
    setResultado(null);
    setPaso(null);
    blip();
  };
  const tocarVineta = (slot: number) => {
    if (modo === "escribir") {
      setFocoEsc(slot);
      return;
    }
    if (reproduciendo) return;
    if (sel === null) {
      setSel(slot);
      blip();
      return;
    }
    if (sel === slot) {
      setSel(null);
      return;
    }
    intercambiar(sel, slot);
    setSel(null);
  };
  const reproducir = () => {
    if (reproduciendo) return;
    const h = historia;
    const ord = [...orden];
    const rev = revisarOrden(h, ord);
    cancelarTimers();
    setSel(null);
    setResultado(null);
    setReproduciendo(true);
    const ultimaPos = rev.coherente ? ord.length - 1 : rev.posicion!;
    for (let k = 0; k <= ultimaPos; k++) {
      despues(k * T_ESCENA + 300, () => {
        setPaso(k);
        if (!rev.coherente && k === rev.posicion) {
          setReproduciendo(false);
          setResultado(rev);
          setVioIncoherencia(true);
          sfx(false);
        } else {
          decir(h.pasos[ord[k]!]!.texto);
          blip();
        }
      });
    }
    if (rev.coherente) {
      despues(ord.length * T_ESCENA + 300, () => {
        setReproduciendo(false);
        setPaso(null);
        setResultado(rev);
        setHistoriasOk((s) => new Set(s).add(h.id));
        sfx(true);
        if (h.epilogo) decir(h.epilogo);
      });
    }
  };
  const mezclar = () => {
    detener();
    let arr = barajar(orden, Math.random);
    for (let i = 0; i < 8 && revisarOrden(historia, arr).coherente; i++) arr = barajar(orden, Math.random);
    setOrdenes((o) => ({ ...o, [historia.id]: arr }));
    setResultado(null);
    setSel(null);
    blip();
  };
  const elegirHistoria = (i: number) => {
    detener();
    setHistIdx(i);
    setSel(null);
    setResultado(null);
    blip();
  };

  /* ── Connect the events ────────────────────────────────────────────── */
  const itemActual = hechos < ITEMS.length ? ITEMS[hechos]! : null;
  const comprobarItem = () => {
    if (!itemActual || !conSel) return;
    const okC = conectorCorrecto(itemActual, conSel);
    const rv = revisarVerbo(itemActual, verbo, intentos + 1);
    const msgC = okC ? RELACION_DEF[itemActual.relacion].regla : (itemActual.porQueNo[conSel] ?? `«${conSel}» no expresa la relación de esta oración.`);
    if (okC && rv.ok) {
      sfx(true);
      const frase = oracionCompleta(itemActual);
      decir(frase);
      setUltimo(`${frase} — ${RELACION_DEF[itemActual.relacion].regla}`);
      setHechos((h) => h + 1);
      setConSel(null);
      setVerbo("");
      setIntentos(0);
      setRetro(null);
      return;
    }
    sfx(false);
    setErroresCon((e) => e + 1);
    setIntentos((n) => n + 1);
    setRetro({ okC, okV: rv.ok, msgC, msgV: rv.msg });
  };

  /* ── Tell your version ─────────────────────────────────────────────── */
  const escribir = (i: number, v: string) => {
    setTextos((xs) => xs.map((x, k) => (k === i ? v : x)));
  };
  const revisarMiRelato = () => {
    const r = revisarRelato(textos);
    setRevision(r);
    setFocoEsc(null);
    if (r.relatoOk) setRelatoOk(true);
    sfx(r.relatoOk);
  };
  const reproducirRelato = () => {
    if (!revision?.todasOk || reproduciendo) return;
    cancelarTimers();
    const frases = [...textos];
    setReproduciendo(true);
    for (let k = 0; k < frases.length; k++) {
      despues(k * T_ESCENA + 300, () => {
        setPaso(k);
        decir(frases[k]!);
        blip();
      });
    }
    despues(frases.length * T_ESCENA + 300, () => {
      setReproduciendo(false);
      setPaso(null);
      setReprodujoRelato(true);
      setFocoEsc(null);
      sfx(true);
    });
  };

  const cambiarModo = (m: Modo) => {
    detener();
    setSel(null);
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    detener();
    if (modo === "orden") {
      setOrdenes((o) => ({ ...o, [historia.id]: [...historia.ordenInicial] }));
      setResultado(null);
      setSel(null);
    }
    if (modo === "conectar") {
      setHechos(0);
      setConSel(null);
      setVerbo("");
      setIntentos(0);
      setRetro(null);
      setUltimo(null);
    }
    if (modo === "escribir") {
      setRevision(null);
      setFocoEsc(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const idxEspera = ITEMS.findIndex((it) => it.id === "espera");
  const idxTelefono = ITEMS.findIndex((it) => it.id === "telefono");
  const objetivos: ObjetivoLab[] = [
    { txt: "Reproducir completa y en orden la historia del camión perdido (A10)", done: historiasOk.has("camion") },
    { txt: "Ver dónde se rompe la coherencia de un relato desordenado", done: vioIncoherencia },
    { txt: "Encontrar un orden válido para la visita a la abuela (A1)", done: historiasOk.has("abuela") },
    // Misión nueva (experimento central): el conector que eliges cambia cómo entra el evento a la línea del tiempo.
    { txt: "Toca un conector que NO sea el correcto y mira cómo la línea del tiempo dibuja otra relación", done: probo || hechos >= ITEMS.length },
    { txt: "Distinguir because (causa) de so (consecuencia)", done: hechos > idxEspera },
    { txt: "Relacionar acciones simultáneas con while y when", done: hechos > idxTelefono },
    { txt: "Conectar los nueve eventos del día en el tianguis", done: hechos === ITEMS.length },
    { txt: "Escribir tu versión: cinco escenas con verbo en pasado y al menos cuatro conectores", done: relatoOk },
    { txt: "Reproducir tu propia versión en el teatrino", done: reprodujoRelato },
    { txt: "Ganar estrellas en «¿Qué pasó primero?»", done: identifico },
    { txt: "Aprobar el verdadero/falso evaluable (A4)", done: quizAprobado },
    { txt: "Completar el texto de Carlos (A2)", done: textoOk },
  ];

  /* ── Datos para la escena ──────────────────────────────────────────── */
  let escenas: EscenaId[] = [];
  let estados: EstadoVineta[] = [];
  let rotulos: string[] = [];
  let burbuja: string | null = null;
  let foco: number | null = null;
  if (modo === "orden") {
    escenas = orden.map((i) => historia.pasos[i]!.escena);
    rotulos = orden.map((i) => historia.pasos[i]!.rotulo);
    estados = orden.map((_, slot): EstadoVineta => {
      if (resultado && !resultado.coherente && slot === resultado.posicion) return "error";
      if (reproduciendo && slot === paso) return "activo";
      if (resultado?.coherente) return "ok";
      if ((reproduciendo || resultado) && paso !== null && slot < paso) return "hecho";
      if (sel === slot) return "sel";
      return "normal";
    });
    if (paso !== null) {
      burbuja = historia.pasos[orden[paso]!]!.texto;
      foco = paso;
    }
  } else if (modo === "escribir") {
    escenas = ESCENAS_RELATO.map((e) => e.escena);
    rotulos = ESCENAS_RELATO.map((e) => e.titulo);
    estados = ESCENAS_RELATO.map((_, i): EstadoVineta => {
      if (reproduciendo && paso === i) return "activo";
      if (revision) return revision.oraciones[i]!.ok ? "ok" : "error";
      if (focoEsc === i) return "sel";
      return "pendiente";
    });
    if (paso !== null) {
      burbuja = textos[paso] ?? null;
      foco = paso;
    } else foco = focoEsc;
  }
  const activa = paso;
  // Vista previa del conector tocado (todavía sin comprobar): la ficha entra como ESE conector la dibuja.
  const previa: ItemConectar | null = modo === "conectar" && itemActual && conSel ? { ...itemActual, conector: conSel, relacion: RELACION_DE_CONECTOR[conSel.toLowerCase()] ?? itemActual.relacion } : null;

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "orden") {
    const rotPos = resultado?.posicion ?? null;
    chipVivo = reproduciendo
      ? `viñeta ${(paso ?? 0) + 1} de ${orden.length} · ${paso !== null ? historia.pasos[orden[paso]!]!.marca : "…"}`
      : resultado
        ? resultado.coherente
          ? "historia coherente · reproducida completa"
          : `se rompe en la viñeta ${(rotPos ?? 0) + 1}`
        : sel !== null
          ? `viñeta ${sel + 1} seleccionada · toca otra`
          : `${historia.etq.toLowerCase()} · ${orden.length} viñetas`;
    pie =
      resultado && !resultado.coherente && resultado.paso !== null && resultado.falta !== null
        ? `«${historia.pasos[resultado.paso]!.texto}» no puede ir en la viñeta ${(resultado.posicion ?? 0) + 1}: todavía no pasa «${historia.pasos[resultado.falta]!.texto}».`
        : resultado?.coherente
          ? `Orden coherente. ${historia.epilogo ? `«${historia.epilogo}» ` : ""}Cada evento aparece después de lo que lo provoca.`
          : paso !== null
            ? historia.pasos[orden[paso]!]!.explicacion
            : historia.instrucciones;
  } else if (modo === "conectar") {
    chipVivo = itemActual ? `${hechos}/${ITEMS.length} eventos conectados · siguiente: ${RELACION_DEF[itemActual.relacion].etq.toLowerCase()}?` : `${ITEMS.length}/${ITEMS.length} eventos conectados`;
    pie = ultimo ?? `«${EVENTO_INICIAL.texto}» Elige el conector y escribe el verbo en pasado: la línea del tiempo muestra qué relación expresa cada conector.`;
  } else {
    const okN = revision ? revision.oraciones.filter((o) => o.ok).length : 0;
    chipVivo = reproduciendo ? `tu relato · viñeta ${(paso ?? 0) + 1} de ${ESCENAS_RELATO.length}` : revision ? `${okN}/${ESCENAS_RELATO.length} escenas · ${revision.conectores.length} conectores` : `escribiendo · viñeta ${(focoEsc ?? 0) + 1}`;
    pie = reproduciendo && paso !== null ? `«${textos[paso]}»` : "Mira cada viñeta y cuéntala en inglés, en pasado, con un conector. Toca una viñeta o su casilla para acercar la cámara.";
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
  const botonVoz = (
    <button className="rs-opt" data-on={voz} onClick={() => setVoz((v) => !v)} style={{ ["--rsc" as string]: modoCol, background: voz ? `${modoCol}1f` : "transparent" }}>
      <i className={`fa-solid ${voz ? "fa-comment-dots" : "fa-comment-slash"}`} style={{ marginRight: 8 }} />
      {voz ? "Narración en voz alta: sí" : "Narración en voz alta: no"}
    </button>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "orden") {
    control = (
      <>
        <div className="rs-opts">
          {HISTORIAS.map((h, i) => (
            <button key={h.id} className="rs-opt rs-hist" data-on={i === histIdx} onClick={() => elegirHistoria(i)} style={{ ["--rsc" as string]: modoCol, background: i === histIdx ? `${modoCol}1f` : "transparent" }}>
              {h.etq}
              {historiasOk.has(h.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 8 }}>{historia.ancla}</div>
        {sub("1 · Ordena: toca dos viñetas para intercambiarlas (o usa las flechas)")}
        <div style={{ display: "grid", gap: 6 }}>
          {orden.map((i, slot) => {
            const p = historia.pasos[i]!;
            const estado = estados[slot];
            const col = estado === "error" ? WARN : estado === "ok" ? OK : sel === slot ? modoCol : estado === "activo" ? "#fff" : T.line;
            return (
              <div key={p.escena} className="rs-card" data-sel={sel === slot} style={{ borderColor: col }}>
                <span className="rs-num" style={{ background: sel === slot || estado === "activo" ? modoCol : "rgba(255,255,255,0.08)", color: sel === slot || estado === "activo" ? "#04121f" : "#fff" }}>
                  {slot + 1}
                </span>
                <button className="rs-card-txt" onClick={() => tocarVineta(slot)} disabled={reproduciendo} aria-label={`Viñeta ${slot + 1}: ${p.texto}`}>
                  <span style={{ color: modoCol, fontWeight: 900, marginRight: 6 }}>{p.marca !== "—" ? p.marca : ""}</span>
                  {p.marca !== "—" ? p.texto.slice(p.marca.length).replace(/^,?\s*/, "") : p.texto}
                </button>
                <button className="rs-mini" onClick={() => intercambiar(slot, slot - 1)} disabled={reproduciendo || slot === 0} aria-label={`Subir viñeta ${slot + 1}`}>
                  <i className="fa-solid fa-arrow-up" />
                </button>
                <button className="rs-mini" onClick={() => intercambiar(slot, slot + 1)} disabled={reproduciendo || slot === orden.length - 1} aria-label={`Bajar viñeta ${slot + 1}`}>
                  <i className="fa-solid fa-arrow-down" />
                </button>
              </div>
            );
          })}
        </div>
        {sub("2 · Reproduce la historia")}
        <div className="rs-opts">
          <button className="rs-toggle rs-play" onClick={reproducir} disabled={reproduciendo} style={{ ["--rsc" as string]: modoCol }}>
            <i className={`fa-solid ${reproduciendo ? "fa-spinner fa-spin" : "fa-play"}`} style={{ marginRight: 9, color: modoCol }} />
            {reproduciendo ? "Reproduciendo…" : "Play the story"}
          </button>
        </div>
        <div className="rs-opts" style={{ marginTop: 8 }}>
          <button className="rs-opt" data-on="false" onClick={mezclar} disabled={reproduciendo} style={{ ["--rsc" as string]: modoCol }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Mezclar de nuevo
          </button>
          {botonVoz}
        </div>
        {resultado && !resultado.coherente && resultado.paso !== null && resultado.falta !== null &&
          nota(
            <>
              <strong>Se rompe la coherencia en la viñeta {(resultado.posicion ?? 0) + 1}.</strong> «{historia.pasos[resultado.paso]!.texto}» no puede ir ahí: todavía no pasa «{historia.pasos[resultado.falta]!.texto}». {historia.pasos[resultado.paso]!.porQue}
            </>,
            WARN,
            "fa-triangle-exclamation",
          )}
        {resultado?.coherente && (
          <>
            {nota(<>¡Historia coherente! Cada evento aparece después de lo que lo provoca. {historia.epilogo && <em>«{historia.epilogo}»</em>}</>, OK, "fa-circle-check")}
            <ul style={{ margin: "10px 0 0", paddingLeft: 16, display: "grid", gap: 6 }}>
              {orden.map((i) => (
                <li key={i} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: "#fff" }}>{historia.pasos[i]!.marca}</strong> — {historia.pasos[i]!.explicacion}
                </li>
              ))}
            </ul>
            {historia.id === "abuela" && nota("Hay dos órdenes válidos: «Then she told me old stories» y «Suddenly, we saw our neighbors» pueden intercambiarse, porque ninguno provoca al otro. Lo que no puede cambiar es lo que depende de otra cosa.", "#7dd3fc", "fa-lightbulb")}
          </>
        )}
      </>
    );
  } else if (modo === "conectar") {
    control = (
      <>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>Sofía&apos;s Sunday.</strong> {EVENTO_INICIAL.texto}
        </div>
        {itemActual ? (
          <>
            {sub(`Oración ${hechos + 1} de ${ITEMS.length}`)}
            <div className="rs-frase">
              {itemActual.partes.map((pt, k) =>
                typeof pt === "string" ? (
                  <span key={k}>{pt}</span>
                ) : pt.hueco === "C" ? (
                  <span key={k} className="rs-hueco" data-lleno={!!conSel} style={{ ["--rsc" as string]: retro && !retro.okC ? WARN : modoCol }}>
                    {conSel ?? "____"}
                  </span>
                ) : (
                  <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <input
                      className="rs-verbo"
                      aria-label={`Verbo en pasado (${itemActual.base})`}
                      value={verbo}
                      onChange={(e) => setVerbo(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") comprobarItem();
                      }}
                      placeholder="past"
                      style={{ borderColor: retro && !retro.okV ? WARN : modoCol }}
                    />
                    <span style={{ color: T.text3, fontSize: 14 }}>({itemActual.base})</span>
                  </span>
                ),
              )}
            </div>
            {sub("1 · Elige el conector")}
            <div className="rs-opts">
              {itemActual.opciones.map((o) => (
                <button
                  key={o}
                  className="rs-opt rs-con"
                  data-on={conSel === o}
                  onClick={() => {
                    setConSel(o);
                    if (itemActual && o !== itemActual.conector) setProbo(true);
                    blip();
                  }}
                  style={{ ["--rsc" as string]: modoCol, background: conSel === o ? `${modoCol}1f` : "transparent" }}
                >
                  {o}
                </button>
              ))}
            </div>
            {sub("2 · Escribe el verbo en pasado y comprueba")}
            <button className="rs-toggle rs-comprobar" onClick={comprobarItem} disabled={!conSel || !verbo.trim()} style={{ ["--rsc" as string]: modoCol }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 9, color: modoCol }} />
              Comprobar la oración
            </button>
            {retro && (
              <>
                {nota(<>{retro.okC ? "Conector correcto. " : "Conector: "}{retro.msgC}</>, retro.okC ? OK : WARN, retro.okC ? "fa-circle-check" : "fa-link-slash")}
                {nota(<>{retro.okV ? "Verbo correcto: " : "Verbo: "}{retro.msgV}</>, retro.okV ? OK : WARN, retro.okV ? "fa-circle-check" : "fa-pen")}
              </>
            )}
          </>
        ) : (
          nota(`¡Historia conectada! Nueve eventos con ${erroresCon === 0 ? "cero errores" : `${erroresCon} ${erroresCon === 1 ? "error" : "errores"}`}.`, OK, "fa-flag-checkered")
        )}
        {ultimo && nota(ultimo, "#7dd3fc", "fa-timeline")}
        {hechos > 0 && (
          <>
            {sub("La historia hasta ahora")}
            <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 5 }}>
              <li style={{ fontSize: 14, color: T.text2 }}>{EVENTO_INICIAL.texto}</li>
              {ITEMS.slice(0, hechos).map((it) => (
                <li key={it.id} style={{ fontSize: 14, color: "#fff", lineHeight: 1.4 }}>
                  {oracionCompleta(it)} <span style={{ color: RELACION_DEF[it.relacion].color, fontSize: 14, fontWeight: 800 }}>· {RELACION_DEF[it.relacion].etq.toLowerCase()}</span>
                </li>
              ))}
            </ol>
          </>
        )}
        <div className="rs-opts" style={{ marginTop: 10 }}>
          {botonVoz}
        </div>
      </>
    );
  } else {
    control = (
      <>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>The runaway dog.</strong> Escribe una oración en inglés por viñeta: en pasado y con un conector (first, then, after that, later, suddenly, while, when, because, so, finally, in the end). Puedes narrar en primera persona («I…»).
        </div>
        {ESCENAS_RELATO.map((esc, i) => {
          const r = revision?.oraciones[i];
          return (
            <div key={esc.escena} className="rs-escribe" style={{ borderColor: r ? (r.ok ? `${OK}88` : `${WARN}88`) : focoEsc === i ? modoCol : T.line }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="rs-num" style={{ background: focoEsc === i ? modoCol : "rgba(255,255,255,0.08)", color: focoEsc === i ? "#04121f" : "#fff" }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{esc.titulo}</span>
                <span style={{ fontSize: 14, color: T.text3 }}>{esc.guia}</span>
              </div>
              <input
                className="rs-input"
                aria-label={`Oración de la viñeta ${i + 1}`}
                value={textos[i] ?? ""}
                onChange={(e) => escribir(i, e.target.value)}
                onFocus={() => setFocoEsc(i)}
                placeholder={`Sugerencia: ${esc.sugeridos.join(" / ")}…`}
              />
              {verEjemplo && <div style={{ fontSize: 14, color: "#c4b5fd", marginTop: 4 }}>Ejemplo: {esc.ejemplo}</div>}
              {r && (
                <div style={{ marginTop: 5, display: "grid", gap: 3 }}>
                  {r.ok && (
                    <div style={{ fontSize: 14, color: OK }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
                      Pasado: «{r.verbo}»{r.continuo ? " · past continuous" : ""}
                      {r.conectores.length > 0 ? ` · conector: ${r.conectores.join(", ")}` : ""}
                    </div>
                  )}
                  {r.errores.map((e, k) => (
                    <div key={k} style={{ fontSize: 14, color: WARN, lineHeight: 1.45 }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
                      {e}
                    </div>
                  ))}
                  {r.consejos.map((e, k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text3, lineHeight: 1.45 }}>
                      <i className="fa-solid fa-lightbulb" style={{ marginRight: 6 }} />
                      {e}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="rs-opts" style={{ marginTop: 12 }}>
          <button className="rs-toggle rs-revisar" onClick={revisarMiRelato} disabled={reproduciendo || textos.every((x) => !x.trim())} style={{ ["--rsc" as string]: modoCol, width: "auto", flex: 1 }}>
            <i className="fa-solid fa-spell-check" style={{ marginRight: 9, color: modoCol }} />
            Revisar mi relato
          </button>
          <button className="rs-toggle rs-play" onClick={reproducirRelato} disabled={reproduciendo || !revision?.todasOk} style={{ ["--rsc" as string]: modoCol, width: "auto", flex: 1 }}>
            <i className={`fa-solid ${reproduciendo ? "fa-spinner fa-spin" : "fa-play"}`} style={{ marginRight: 9, color: modoCol }} />
            {reproduciendo ? "Reproduciendo…" : "Play my story"}
          </button>
        </div>
        {revision && (
          <>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>Conectores distintos ({revision.conectores.length}/4):</span>
              {revision.conectores.map((c) => (
                <span key={c} style={{ fontSize: 14, fontWeight: 800, padding: "3px 8px", borderRadius: 999, border: `1px solid ${modoCol}`, color: "#fff" }}>
                  {c}
                </span>
              ))}
            </div>
            {revision.relatoOk
              ? nota("¡Relato coherente! Cada escena en pasado y al menos cuatro conectores en su lugar. Pulsa «Play my story» para verlo en el teatrino.", OK, "fa-circle-check")
              : revision.todasOk
                ? nota("Todas las escenas están en pasado. Te faltan conectores distintos: usa al menos cuatro (por ejemplo First, While, Suddenly, After that, In the end).", WARN, "fa-link")
                : nota("Corrige las escenas marcadas y vuelve a revisar.", WARN, "fa-pen")}
          </>
        )}
        <div className="rs-opts" style={{ marginTop: 10 }}>
          <button className="rs-opt" data-on={verEjemplo} onClick={() => setVerEjemplo((v) => !v)} style={{ ["--rsc" as string]: modoCol }}>
            <i className="fa-solid fa-eye" style={{ marginRight: 8 }} />
            {verEjemplo ? "Ocultar ejemplos" : "Ver un ejemplo por escena"}
          </button>
          {botonVoz}
        </div>
        {sub("Pistas de la reflexión escrita (A3)")}
        <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 5 }}>
          {PISTAS_A3.map((p, i) => (
            <li key={i} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
              {p}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          <strong style={{ color: T.text2 }}>Reto A3:</strong> {PROMPT_A3}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .rs-opts { display:flex; flex-wrap:wrap; gap:8px; }
        .rs-opt { cursor:pointer; border:1px solid var(--rsc); border-radius:10px; padding:9px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; text-align:left; }
        .rs-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .rs-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .rs-opt:disabled { cursor:default; opacity:0.55; }
        .rs-toggle { width:100%; cursor:pointer; border:1px solid var(--rsc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
        .rs-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .rs-toggle:disabled { cursor:default; opacity:0.5; }
        .rs-card { display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:11px; border:1px solid; background:rgba(4,10,22,0.4); transition:all .2s; }
        .rs-card[data-sel="true"] { background:rgba(255,255,255,0.07); }
        .rs-num { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; flex-shrink:0; }
        .rs-card-txt { flex:1; min-width:0; cursor:pointer; border:none; background:transparent; color:#fff; font-size:14px; line-height:1.4; text-align:left; padding:4px 2px; }
        .rs-card-txt:disabled { cursor:default; }
        .rs-mini { cursor:pointer; width:34px; height:34px; border-radius:8px; border:1px solid rgba(255,255,255,0.14); background:transparent; color:#fff; font-size:14px; flex-shrink:0; }
        .rs-mini:hover:not(:disabled) { background:rgba(255,255,255,0.08); }
        .rs-mini:disabled { opacity:0.3; cursor:default; }
        .rs-frase { font-size:15px; line-height:2.1; color:#fff; font-weight:700; padding:10px 14px; border-radius:12px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; }
        .rs-hueco { display:inline-block; min-width:70px; text-align:center; padding:0 8px; border-bottom:2px solid var(--rsc); color:var(--rsc); font-weight:900; }
        .rs-hueco[data-lleno="true"] { color:#fff; }
        .rs-verbo { width:120px; max-width:100%; padding:5px 9px; border-radius:8px; border:1px solid; background:rgba(2,8,20,0.7); color:#fff; font-size:14px; font-weight:800; }
        .rs-escribe { margin-top:10px; padding:10px 12px; border-radius:12px; border:1px solid; background:rgba(4,10,22,0.4); }
        .rs-input { width:100%; box-sizing:border-box; margin-top:7px; padding:8px 10px; border-radius:9px; border:1px solid rgba(255,255,255,0.16); background:rgba(2,8,20,0.7); color:#fff; font-size:14px; }
        .rs-input:focus, .rs-verbo:focus { outline:2px solid ${accent}; outline-offset:1px; }
        .rs-opt:focus-visible, .rs-toggle:focus-visible, .rs-card-txt:focus-visible, .rs-mini:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <RelatoScene
              vista={modo}
              modoColor={modoCol}
              resetNonce={resetNonce}
              clave={modo === "orden" ? historia.id : "relato"}
              escenas={escenas}
              estados={estados}
              rotulos={rotulos}
              activa={activa}
              foco={foco}
              burbuja={burbuja}
              onVineta={tocarVineta}
              hechos={hechos}
              previa={previa}
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
            <BotonHerramienta icono={voz ? "fa-comment-dots" : "fa-comment-slash"} titulo={voz ? "Narración en voz alta: sí" : "Narración en voz alta: no"} activo={voz} onClick={() => setVoz((v) => !v)} />
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
          </>
        }
        leyenda={
          <>
            <span style={{ color: "#fff", fontWeight: 800 }}>
              <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 8 }} />
              {def.etq}
            </span>
            <span style={{ color: T.text2 }}>{def.subtitulo}</span>
          </>
        }
        lectura={chipVivo}
        objetivos={objetivos}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Cuaderno",
            icono: "fa-pen",
            contenido: (
              <>
                <Bloque titulo={`${def.etq} · lo que pasa`} icono={def.icono}>
                  <div style={{ ...NUM, color: "#e6eefb", lineHeight: 1.5, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>{pie}</div>
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
                <PrimeroCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

                <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes cómo se narra una secuencia en inglés." />

                <div style={{ ...card, padding: "18px 16px 20px", marginTop: 22 }}>
                  <Eyebrow>
                    <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                    Completa el texto (A2)
                  </Eyebrow>
                  <div style={{ marginTop: 12 }}>
                    <CompletaTexto
                      data={HUECOS_A2}
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
                <Bloque titulo="¿Qué pasó y en qué orden?" icono="fa-masks-theater">
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
                </Bloque>

                <Bloque titulo="Lectura A1" icono="fa-book-open">
                  <div style={{ color: "#fff", fontWeight: 800, lineHeight: 1.4 }}>{TITULO_A1}</div>
                  <div style={{ display: "grid", gap: 9 }}>
                    {LECTURA_A1.map((p, i) => (
                      <div key={i} style={{ color: T.text2, lineHeight: 1.55, whiteSpace: "pre-line" }}>
                        {p}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>COMPRENSIÓN</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {PREGUNTAS_A1.map((q, i) => (
                      <details key={i} style={{ color: T.text2, lineHeight: 1.45 }}>
                        <summary style={{ cursor: "pointer", color: "#fff" }}>{q.pregunta}</summary>
                        <div style={{ marginTop: 4, paddingLeft: 12 }}>{q.guia}</div>
                      </details>
                    ))}
                  </div>
                </Bloque>

                <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                  <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                    {INSTRUCCIONES.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                </Bloque>

                <Bloque titulo="Hechos (verdadero/falso de Inglés IV)" icono="fa-circle-question">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2, lineHeight: 1.45 }}>
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
                        <div style={{ color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                          <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
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
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9, color: T.text2, lineHeight: 1.45 }}>
                    {IDEAS.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Bloque>

                <Bloque titulo="Qué es verbatim y qué es ilustrativo" icono="fa-circle-info">
                  <div style={{ color: T.text3, lineHeight: 1.5 }}>
                    Son <strong>verbatim</strong> del material de la plataforma: la lectura A1 con sus preguntas y su historia de ejemplo, la historia del camión con sus marcas y explicaciones (A10), el texto de Carlos (A2), las pistas y el
                    reto de escritura (A3), el verdadero/falso (A4), el glosario (A5) y los hechos de Inglés IV (IN-IV-P01-A4 e IN-IV-P07-A4). Son <strong>material didáctico escrito para este lab</strong>: la historia de Sofía en el tianguis,
                    la anécdota del perro suelto (inspirada en IN-IV-P07-A6), las explicaciones de por qué un orden es incoherente y el banco «¿Qué pasó primero?». Los personajes y lugares son ficticios. La revisión automática de tu relato es
                    orientativa: reconoce los verbos y conectores más comunes, no sustituye la lectura de tu docente. Fuente: {FUENTE}
                  </div>
                </Bloque>

                <FichaTeorica data={RELATO_SECUENCIA_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </>
            ),
          },
        ]}
      />
    </>
  );
}
