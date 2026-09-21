"use client";

/**
 * Laboratorio 3D — "Places to visit: Rincón del Colibrí".
 * Práctica de la progresión 3 de Inglés III: «Describe lugares conocidos y
 * actividades que se pueden realizar ahí (da información y recomendaciones
 * básicas)». Sin lectura en la progresión: el marco teórico sale de los
 * glosarios A1 y A5; los textos a completar de A2 y A6; los hechos del
 * verdadero/falso A3 y A4; el reto de las preguntas del video A8; las
 * estrellas del relacionar A9 y «Tu turno» de la actividad final de A5.
 *
 * Tres modos:
 *  (1) Describe the place — armar con fichas oraciones verdaderas sobre la
 *      maqueta de cada lugar (there is / there are / it has / you can / you
 *      can't + preposiciones de lugar), revisadas contra lo que hay.
 *  (2) Guidebook — leer una guía turística en inglés, llevar a cada visitante
 *      al lugar que cumple TODO lo que pide y señalar la oración que lo prueba.
 *  (3) Recommend it — escribir una recomendación con su razón; el turista
 *      viaja al lugar y reacciona según encaje con sus intereses.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { hablarLab, callarLab, puedeHablarLab } from "./lab-voz";
import { FichaTeorica } from "./_ficha";
import { CompletaTexto } from "./_mecanica-huecos";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { LUGARES_RECOMENDACIONES_INGLES_FICHA } from "./lugares-recomendaciones-ingles-ficha";
import type { VistaLugares } from "./LugaresRecomendacionesInglesScene";
import {
  type Modo,
  type LugarId,
  type Apertura,
  type Prep,
  type TipoOracion,
  type RevisionOracion,
  type RevisionRec,
  type FormaRec,
  type JuicioTurista,
  MODOS,
  MODOS_DEF,
  mulberry32,
  estrellasPorErrores,
  LUGARES,
  LUGAR_IDS,
  lugar,
  APERTURAS,
  APERTURA_ES,
  PREPS_A1,
  TIPO_DEF,
  TIPOS_ENTRADA,
  armaOracion,
  revisaOracion,
  VISITANTES_GUIA,
  TAG_GUIA_ES,
  juzgaGuia,
  evidenciasValidas,
  TURISTAS,
  TAG_RAZON_ES,
  FORMA_REC_DEF,
  revisaRecomendacion,
  reaccionTurista,
  razonRelevante,
  analizaA5,
  A5_CONSIGNA,
  A5_MIN,
  PAREJAS_A9,
  DEFINICIONES_A9,
  INSTRUCCIONES_A9,
  rondaA9,
  GLOSARIO_A1,
  GLOSARIO_A5,
  TITULO_A1,
  ACTIVIDAD_A1,
  HECHOS_A3,
  HECHOS_A4,
  HUECOS_A2,
  HUECOS_A6,
  A7,
  QUIZ_A8,
  PREGUNTA_ABIERTA_A8,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
} from "./lugares-recomendaciones-ingles-data";

const LugaresScene = dynamic(() => import("./LugaresRecomendacionesInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-map-location-dot fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando Rincón del Colibrí en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-lugares-recomendaciones-ingles-reto";
const WARN = "#FF8A3C";
/** Ámbar: inglés correcto, pero con una observación. */
const AMBAR = "#fbbf24";
const N_ENTRADAS = 4;
const RONDA_INICIAL = rondaA9(mulberry32(13));

type Cuerpo = { tipo: "s" | "a"; i: number } | null;
type Entrada = { tipos: TipoOracion[]; oraciones: string[] };
const ENTRADAS_VACIAS = Object.fromEntries(LUGAR_IDS.map((id) => [id, { tipos: [], oraciones: [] }])) as unknown as Record<LugarId, Entrada>;

function BotonEscuchar({ texto, col }: { texto: string; col: string }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button className="lr-escuchar" onClick={() => hablarLab(texto)} title="Escuchar en inglés" aria-label={`Escuchar: ${texto}`} style={{ ["--lrc" as string]: col }}>
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );
}

/* ── Tarjeta de estrellas: A9 relaciona los conceptos clave ───────────── */
function RelacionaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const pareja = PAREJAS_A9[ronda.orden[pos] ?? 0]!;

  const responder = (d: number) => {
    if (resuelto !== null) return;
    const def = DEFINICIONES_A9[d]!;
    const ok = def === pareja.derecha;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      const duena = PAREJAS_A9.find((x) => x.derecha === def);
      setAviso(
        duena
          ? `Esa definición es de «${duena.izquierda}», no de «${pareja.izquierda}».${(duena.izquierda === "opposite" && pareja.izquierda === "in front of") || (duena.izquierda === "in front of" && pareja.izquierda === "opposite") ? " Pista: opposite habla del otro lado de una calle o espacio; in front of, de estar enfrente (facing)." : ""}`
          : def.startsWith("At the back")
            ? "Esa definición es de «behind» (detrás de)."
            : "Esa definición es de «can» (posibilidad), no de una preposición.",
      );
      return;
    }
    setAviso(null);
    if (pos + 1 >= ronda.orden.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaA9(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Relaciona los conceptos clave (A9)
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>{INSTRUCCIONES_A9}</div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Concepto {pos + 1} de {ronda.orden.length} · cero errores = 3 estrellas
          </div>
          <div style={{ fontSize: 17, color: "#fff", fontWeight: 900, lineHeight: 1.45, marginBottom: 12 }}>{pareja.izquierda}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 8 }}>
            {ronda.defs.map((d) => (
              <button key={d} className="lr-opt lr-a9" data-on="true" onClick={() => responder(d)} style={{ ["--lrc" as string]: accent, textAlign: "left", fontWeight: 700 }}>
                {DEFINICIONES_A9[d]}
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

/* ── Tu turno: actividad final del glosario A5 con revisión orientativa ── */
function TuTurnoCard({ accent, logrado, onLogrado, playSfx }: { accent: string; logrado: boolean; onLogrado: () => void; playSfx?: (ok: boolean) => void }) {
  const [texto, setTexto] = useState("");
  const [revisado, setRevisado] = useState(false);
  const an = analizaA5(texto);
  const criterios: { t: string; ok: boolean }[] = [
    { t: `Al menos ${A5_MIN} palabras (llevas ${an.palabras})`, ok: an.palabras >= A5_MIN },
    { t: `Usa there is / there are al menos 2 veces · llevas ${an.thereIsAre}`, ok: an.thereIsAre >= 2 },
    { t: `Al menos 3 preposiciones de lugar distintas · llevas ${an.preps.length}${an.preps.length ? ` (${an.preps.join(", ")})` : ""}`, ok: an.preps.length >= 3 },
    { t: `Una recomendación con «you should» + verbo base · llevas ${an.should}`, ok: an.should >= 1 },
    { t: an.errores.length ? `Revisa: ${an.errores.join("; ")}` : "Sin errores detectables de there is / there are ni de should", ok: an.errores.length === 0 },
  ];
  const todo = criterios.every((c) => c.ok);
  const revisar = () => {
    setRevisado(true);
    playSfx?.(todo);
    if (todo && !logrado) onLogrado();
  };
  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
        Tu turno: un lugar de tu comunidad (A5)
      </Eyebrow>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, lineHeight: 1.5 }}>{A5_CONSIGNA}</div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, margin: "6px 0 12px" }}>
        Idea (A1): {ACTIVIDAD_A1}
      </div>
      <textarea
        className="lr-area lr-a5"
        aria-label="Tu descripción en inglés"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setRevisado(false);
        }}
        placeholder="My favorite place in my town is… There is… It is next to… You should visit it because…"
        rows={6}
        style={{ ["--lrc" as string]: accent }}
      />
      <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
        {criterios.map((c) => (
          <div key={c.t} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: c.ok ? OK : revisado ? WARN : T.text2, lineHeight: 1.4 }}>
            <i className={`fa-solid ${c.ok ? "fa-circle-check" : revisado ? "fa-circle-exclamation" : "fa-circle"}`} style={{ marginTop: 2 }} />
            {c.t}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
        <button className="lr-opt lr-a5btn" data-on="true" onClick={revisar} style={{ ["--lrc" as string]: accent }}>
          <i className="fa-solid fa-spell-check" style={{ marginRight: 8 }} />
          Revisar mi texto
        </button>
        {revisado && <span style={{ fontSize: 12, color: todo ? OK : WARN, fontWeight: 800 }}>{todo ? "¡Listo! Tu texto cumple los criterios que se pueden revisar automáticamente." : "Todavía falta algo: revisa los puntos en naranja."}</span>}
      </div>
      <div style={{ fontSize: 11, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
        La revisión automática es orientativa: cuenta palabras, there is / there are, preposiciones de lugar y recomendaciones con you should, y detecta errores frecuentes. Tu docente evalúa si la descripción es clara y
        si el lugar existe en tu comunidad.
      </div>
    </div>
  );
}

/* ── Autoevaluación A7 ────────────────────────────────────────────────── */
function AutoevaluacionCard({ accent }: { accent: string }) {
  const [valores, setValores] = useState<(number | null)[]>(() => A7.criterios.map(() => null));
  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-clipboard-check" style={{ marginRight: 8, color: accent }} />
        Autoevaluación (A7)
      </Eyebrow>
      <div style={{ fontSize: 12.5, color: T.text2, marginBottom: 12 }}>{A7.instrucciones}</div>
      <div style={{ display: "grid", gap: 12 }}>
        {A7.criterios.map((c, i) => (
          <div key={c}>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, marginBottom: 6 }}>{c}</div>
            <div className="lr-opts">
              {A7.escala.map((e) => (
                <button
                  key={e.valor}
                  className="lr-opt"
                  data-on={valores[i] === e.valor}
                  title={e.descripcion}
                  onClick={() => setValores((vs) => vs.map((v, k) => (k === i ? e.valor : v)))}
                  style={{ ["--lrc" as string]: accent, background: valores[i] === e.valor ? `${accent}22` : "transparent" }}
                >
                  {e.valor} · {e.etiqueta}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: T.text2, marginTop: 12 }}>
        <strong style={{ color: "#fff" }}>Reflexión final:</strong> {A7.reflexion}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabLugaresRecomendacionesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("describir");
  const [errorNonce, setErrorNonce] = useState(0);

  // ── Describe the place
  const [lugarIdx, setLugarIdx] = useState(0);
  const [ap, setAp] = useState<Apertura | null>(null);
  const [cuerpo, setCuerpo] = useState<Cuerpo>(null);
  const [ubicIdx, setUbicIdx] = useState<number | null>(null);
  const [rev, setRev] = useState<RevisionOracion | null>(null);
  const [revNonce, setRevNonce] = useState(0);
  const [entradas, setEntradas] = useState<Record<LugarId, Entrada>>(ENTRADAS_VACIAS);
  const [preps, setPreps] = useState<Set<Prep>>(() => new Set());

  // ── Guidebook
  const [visitaIdx, setVisitaIdx] = useState(0);
  const [guiaTab, setGuiaTab] = useState<LugarId>("plaza");
  const [elegidos, setElegidos] = useState<Partial<Record<string, LugarId>>>({});
  const [guiaResueltos, setGuiaResueltos] = useState<Partial<Record<string, LugarId>>>({});
  const [evidOk, setEvidOk] = useState<Set<string>>(() => new Set());
  const [avisoEvid, setAvisoEvid] = useState<string | null>(null);
  const [viajeNonce, setViajeNonce] = useState(0);

  // ── Recommend it
  const [turistaIdx, setTuristaIdx] = useState(0);
  const [textos, setTextos] = useState<string[]>(() => TURISTAS.map(() => ""));
  const [revRec, setRevRec] = useState<RevisionRec | null>(null);
  const [visita, setVisita] = useState<{ lugar: LugarId; j: JuicioTurista; relevante: boolean } | null>(null);
  const [felices, setFelices] = useState<Partial<Record<string, LugarId>>>({});
  const [formas, setFormas] = useState<Set<FormaRec>>(() => new Set());

  // ── Evaluables
  const [estrellasOk, setEstrellasOk] = useState(false);
  const [quizOk, setQuizOk] = useState(false);
  const [textoA2, setTextoA2] = useState(false);
  const [textoA6, setTextoA6] = useState(false);
  const [a5Ok, setA5Ok] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setEstrellasOk(true);
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
  const fallo = () => {
    sfx(false);
    setErrorNonce((n) => n + 1);
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Describe the place ────────────────────────────────────────────── */
  const l = LUGARES[lugarIdx]!;
  const entrada = entradas[l.id];
  const sust = cuerpo?.tipo === "s" ? (l.sustantivos[cuerpo.i] ?? null) : null;
  const act = cuerpo?.tipo === "a" ? (l.actividades[cuerpo.i] ?? null) : null;
  const esCan = ap === "You can" || ap === "You can't";
  const ubic = ubicIdx !== null && !esCan ? (l.ubicaciones[ubicIdx] ?? null) : null;
  const borrador = armaOracion(ap, sust, act, ubic);
  const completos = LUGAR_IDS.filter((id) => TIPOS_ENTRADA.every((t) => entradas[id].tipos.includes(t)));
  const hayCant = LUGAR_IDS.some((id) => entradas[id].tipos.includes("cant"));
  const prepsA1 = PREPS_A1.filter((x) => preps.has(x));
  const colEstado = (e: "ok" | "valida" | "mal") => (e === "ok" ? OK : e === "valida" ? AMBAR : WARN);

  const limpiarArmado = () => {
    setAp(null);
    setCuerpo(null);
    setUbicIdx(null);
  };
  const irLugar = (i: number) => {
    setLugarIdx(i);
    limpiarArmado();
    setRev(null);
    blip();
  };
  const tocarFicha = (f: () => void) => {
    f();
    setRev(null);
    blip();
  };
  const comprobarOracion = () => {
    const r = revisaOracion(l, ap, sust, act, ubic);
    setRev(r);
    setRevNonce((n) => n + 1);
    if (r.estado === "mal") {
      fallo();
      return;
    }
    sfx(true);
    const tipo = r.tipo;
    if (r.estado === "ok") {
      setEntradas((es) => {
        const e = es[l.id];
        return { ...es, [l.id]: { tipos: tipo && !e.tipos.includes(tipo) ? [...e.tipos, tipo] : e.tipos, oraciones: e.oraciones.includes(r.oracion) ? e.oraciones : [...e.oraciones, r.oracion] } };
      });
      if (r.prep) {
        const pr = r.prep;
        setPreps((s) => new Set(s).add(pr));
      }
      limpiarArmado();
    }
  };

  /* ── Guidebook ─────────────────────────────────────────────────────── */
  const v = VISITANTES_GUIA[visitaIdx]!;
  const elegido = elegidos[v.id] ?? null;
  const juicio = elegido ? juzgaGuia(v, elegido) : null;
  const resueltoGuia = guiaResueltos[v.id] ?? null;
  const nResueltosGuia = Object.keys(guiaResueltos).length;
  const lugarTab = lugar(guiaTab);

  const irVisitante = (i: number) => {
    setVisitaIdx(i);
    setAvisoEvid(null);
    const r = guiaResueltos[VISITANTES_GUIA[i]!.id];
    if (r) setGuiaTab(r);
    blip();
  };
  const tocarLugar = useCallback((id: LugarId) => {
    setGuiaTab(id);
  }, []);
  const llevar = (id: LugarId) => {
    if (resueltoGuia) return;
    const j = juzgaGuia(v, id);
    setElegidos((e) => ({ ...e, [v.id]: id }));
    setViajeNonce((n) => n + 1);
    setAvisoEvid(null);
    if (j.ok) {
      setGuiaResueltos((g) => ({ ...g, [v.id]: id }));
      sfx(true);
    } else fallo();
  };
  const elegirEvidencia = (k: number) => {
    if (!resueltoGuia || evidOk.has(v.id)) return;
    const validas = evidenciasValidas(v, resueltoGuia);
    if (validas.includes(k)) {
      setEvidOk((s) => new Set(s).add(v.id));
      setAvisoEvid(null);
      sfx(true);
    } else {
      setAvisoEvid(`Esa oración es cierta, pero no prueba que ahí haya ${TAG_GUIA_ES[v.clave]}. Busca la que lo dice directamente.`);
      fallo();
    }
  };

  /* ── Recommend it ──────────────────────────────────────────────────── */
  const t = TURISTAS[turistaIdx]!;
  const nFelices = Object.keys(felices).length;
  const formasValidas = [...formas];

  const irTurista = (i: number) => {
    setTuristaIdx(i);
    setRevRec(null);
    setVisita(null);
    blip();
  };
  const enviar = () => {
    const texto = textos[turistaIdx] ?? "";
    const r = revisaRecomendacion(texto);
    setRevRec(r);
    if (r.estado === "mal" || !r.lugar) {
      setVisita(null);
      fallo();
      return;
    }
    const j = reaccionTurista(t, r.lugar);
    const relevante = razonRelevante(texto, r.lugar, t);
    setVisita({ lugar: r.lugar, j, relevante });
    setViajeNonce((n) => n + 1);
    if (j.reaccion === "feliz" && relevante) {
      const dest = r.lugar;
      setFelices((f) => ({ ...f, [t.id]: dest }));
      if (r.forma) {
        const fo = r.forma;
        setFormas((s) => new Set(s).add(fo));
      }
      sfx(true);
    } else sfx(j.reaccion === "feliz");
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "describir") {
      limpiarArmado();
      setRev(null);
    }
    if (modo === "guia") setAvisoEvid(null);
    if (modo === "recomendar") {
      setRevRec(null);
      setVisita(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: `Completar la entrada de ${N_ENTRADAS} lugares: singular, plural y You can`, done: completos.length >= N_ENTRADAS },
    { t: "Ubicar cosas con 4 preposiciones de lugar distintas del glosario A1", done: prepsA1.length >= 4 },
    { t: "Advertir una regla del lugar con You can't (busca el letrero)", done: hayCant },
    { t: `Llevar a los ${VISITANTES_GUIA.length} visitantes al lugar que cumple todo lo que piden`, done: nResueltosGuia === VISITANTES_GUIA.length },
    { t: `Señalar en la guía la oración que lo prueba (${VISITANTES_GUIA.length} evidencias)`, done: evidOk.size === VISITANTES_GUIA.length },
    { t: `Recomendar un lugar a los ${TURISTAS.length} turistas con una razón que les importe`, done: nFelices === TURISTAS.length },
    { t: "Usar 3 formas distintas de recomendar (You should, I recommend, Don't miss…)", done: formas.size >= 3 },
    { t: "Relacionar los conceptos de A9 y ganar estrellas", done: estrellasOk },
    { t: "Aprobar el reto de las preguntas del video A8", done: quizOk },
    { t: "Completar los textos A2 y A6", done: textoA2 && textoA6 },
    { t: "Describir un lugar de tu comunidad (A5) y pasar la revisión", done: a5Ok },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaLugares = modo;
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "describir") {
    chipVivo = `${l.nombre} · ${TIPOS_ENTRADA.filter((x) => entrada.tipos.includes(x)).length}/3 · ${completos.length}/${N_ENTRADAS} entradas`;
    pie = rev ? (
      <>
        <strong style={{ color: colEstado(rev.estado) }}>{rev.titulo}.</strong> {rev.msg}
      </>
    ) : borrador ? (
      `Tu oración: «${borrador}» Compárala con la maqueta y pulsa «Comprobar».`
    ) : (
      `Mira la maqueta de ${l.es}: ¿qué hay y cuántos? ¿Qué se puede hacer ahí? Arma una oración con las fichas.`
    );
  } else if (modo === "guia") {
    chipVivo = `${v.nombre} · ${nResueltosGuia}/${VISITANTES_GUIA.length} visitantes`;
    pie = juicio ? (
      <>
        <strong style={{ color: juicio.ok ? OK : WARN }}>{juicio.ok ? `${lugar(elegido!).nombre}: ¡sí!` : `${lugar(elegido!).nombre}: no.`}</strong> {juicio.msg} {juicio.cita ? `La guía: «${juicio.cita}»` : ""}
      </>
    ) : (
      `${v.nombre} pregunta en la oficina de turismo: «${v.pide}» Lee la guía y elige el lugar (puedes tocar las maquetas del mapa).`
    );
  } else {
    chipVivo = `${t.nombre} · ${nFelices}/${TURISTAS.length} felices`;
    pie = visita ? (
      <>
        <strong style={{ color: visita.j.reaccion === "feliz" ? OK : visita.j.reaccion === "meh" ? AMBAR : WARN }}>«{visita.j.linea}»</strong> {visita.j.msg}
      </>
    ) : revRec && revRec.estado === "mal" ? (
      (revRec.errores[0] ?? "")
    ) : (
      `${t.nombre}: «${t.dice}» Escribe qué lugar le recomiendas y por qué.`
    );
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y la retroalimentación siguen aquí. {typeof pie === "string" ? pie : ""}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );

  const guiaCompleta = (
    <div style={{ display: "grid", gap: 8 }}>
      {LUGARES.map((x) => (
        <div key={x.id} style={{ padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${x.color}33` }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: x.color, marginBottom: 3 }}>
            <i className={`fa-solid ${x.icono}`} style={{ marginRight: 6 }} />
            {x.nombre}
          </div>
          <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{x.guia.join(" ")}</div>
        </div>
      ))}
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "describir") {
    control = (
      <>
        <div className="lr-opts">
          {LUGARES.map((x, i) => {
            const hecho = completos.includes(x.id);
            return (
              <button key={x.id} className="lr-opt lr-lugar" data-on={i === lugarIdx} onClick={() => irLugar(i)} style={{ ["--lrc" as string]: x.color, background: i === lugarIdx ? `${x.color}22` : "transparent" }}>
                <i className={`fa-solid ${x.icono}`} style={{ marginRight: 6, color: x.color }} />
                {x.nombre}
                {hecho ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} /> : entradas[x.id].tipos.length ? <i className="fa-solid fa-circle-half-stroke" style={{ marginLeft: 6, color: x.color }} /> : null}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {(["sg", "pl", "can", "cant"] as TipoOracion[]).map((x) => {
            const on = entrada.tipos.includes(x);
            return (
              <span key={x} className="lr-pill" style={{ ["--lrc" as string]: on ? OK : "rgba(255,255,255,0.2)", color: on ? "#fff" : T.text2 }}>
                <i className={`fa-solid ${on ? "fa-circle-check" : "fa-circle"}`} style={{ marginRight: 6, color: on ? OK : T.text3 }} />
                {TIPO_DEF[x].etq}
                {x === "cant" ? " (extra)" : ""}
              </span>
            );
          })}
        </div>

        {sub("1 · ¿Cómo empieza?")}
        <div className="lr-opts">
          {APERTURAS.map((a) => (
            <button key={a} className="lr-ficha lr-ap" data-sel={ap === a} onClick={() => tocarFicha(() => setAp(a))} title={APERTURA_ES[a]}>
              {a}
            </button>
          ))}
        </div>
        {sub("2 · ¿Qué hay? (sustantivo) · ¿Qué se puede hacer? (verbo)")}
        <div className="lr-opts">
          {l.sustantivos.map((x, i) => (
            <button key={x.texto} className="lr-ficha lr-sust" data-tipo="s" data-sel={cuerpo?.tipo === "s" && cuerpo.i === i} onClick={() => tocarFicha(() => setCuerpo({ tipo: "s", i }))}>
              {x.texto}
            </button>
          ))}
        </div>
        <div className="lr-opts" style={{ marginTop: 7 }}>
          {l.actividades.map((x, i) => (
            <button key={x.texto} className="lr-ficha lr-act" data-tipo="a" data-sel={cuerpo?.tipo === "a" && cuerpo.i === i} onClick={() => tocarFicha(() => setCuerpo({ tipo: "a", i }))}>
              {x.texto}
            </button>
          ))}
        </div>
        {sub("3 · ¿Dónde está? (opcional, con There is / There are / It has)")}
        <div className="lr-opts" style={{ opacity: esCan ? 0.4 : 1 }}>
          {l.ubicaciones.map((x, i) => (
            <button key={x.texto} className="lr-ficha lr-ubic" data-tipo="u" data-sel={ubicIdx === i} disabled={esCan} onClick={() => tocarFicha(() => setUbicIdx(ubicIdx === i ? null : i))}>
              {x.texto}
            </button>
          ))}
        </div>
        {esCan && nota("Con You can / You can't dices qué se puede hacer; la ubicación va con There is / There are / It has.", T.text3)}

        <div className="lr-linea" data-e={rev ? rev.estado : ""} style={{ marginTop: 14 }}>
          {borrador ? <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{borrador}</span> : <span style={{ fontSize: 12.5, color: T.text3 }}>Tu oración aparece aquí y sobre la maqueta.</span>}
        </div>
        <div className="lr-opts" style={{ marginTop: 10 }}>
          <button className="lr-opt lr-comprobar" data-on="true" onClick={comprobarOracion} disabled={!ap} style={{ ["--lrc" as string]: modoCol, background: `${modoCol}1f` }}>
            <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
            Comprobar con la maqueta
          </button>
          <button className="lr-opt lr-borrar" data-on="false" onClick={() => tocarFicha(limpiarArmado)} style={{ ["--lrc" as string]: modoCol }}>
            <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
            Borrar
          </button>
          {rev && rev.estado !== "mal" && <BotonEscuchar texto={rev.oracion} col={colEstado(rev.estado)} />}
        </div>
        {rev && nota(<><strong>{rev.titulo}.</strong> {rev.msg}</>, colEstado(rev.estado), rev.estado === "ok" ? "fa-circle-check" : rev.estado === "valida" ? "fa-circle-info" : "fa-lightbulb")}
        {entrada.oraciones.length > 0 && (
          <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${l.color}44` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: l.color, letterSpacing: "0.06em" }}>
                <i className="fa-solid fa-book-atlas" style={{ marginRight: 6 }} />
                TU ENTRADA DE LA GUÍA · {l.nombre.toUpperCase()}
              </span>
              <BotonEscuchar texto={entrada.oraciones.join(" ")} col={l.color} />
            </div>
            <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.55 }}>{entrada.oraciones.join(" ")}</div>
          </div>
        )}
        {nota(
          <>
            Preposiciones de A1 usadas: {PREPS_A1.map((x) => (preps.has(x) ? `✓ ${x}` : `○ ${x}`)).join(" · ")}. There is + singular · There are + plural · It has sirve para los dos. First floor = planta baja (inglés de EE. UU.).
          </>,
          T.text3,
        )}
      </>
    );
  } else if (modo === "guia") {
    control = (
      <>
        <div className="lr-opts">
          {VISITANTES_GUIA.map((x, i) => (
            <button key={x.id} className="lr-opt lr-vis" data-on={i === visitaIdx} onClick={() => irVisitante(i)} style={{ ["--lrc" as string]: x.ropa, background: i === visitaIdx ? `${x.ropa}26` : "transparent" }}>
              <i className="fa-solid fa-user" style={{ marginRight: 6, color: x.ropa }} />
              {x.nombre}
              {evidOk.has(x.id) ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} /> : guiaResueltos[x.id] ? <i className="fa-solid fa-circle-half-stroke" style={{ marginLeft: 6, color: x.ropa }} /> : null}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${v.ropa}66` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>{v.nombre}:</span> «{v.pide}»
            </div>
            <BotonEscuchar texto={v.pide} col={v.ropa} />
          </div>
          <details className="lr-guia" style={{ marginTop: 6 }}>
            <summary>Ver en español</summary>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 4 }}>{v.es}</div>
          </details>
        </div>

        {sub("1 · Lee la guía turística y elige el lugar")}
        <div className="lr-opts">
          {LUGARES.map((x) => (
            <button key={x.id} className="lr-opt lr-tab" data-on={guiaTab === x.id} onClick={() => tocarFicha(() => setGuiaTab(x.id))} style={{ ["--lrc" as string]: x.color, background: guiaTab === x.id ? `${x.color}22` : "transparent" }}>
              <i className={`fa-solid ${x.icono}`} style={{ marginRight: 6, color: x.color }} />
              {x.nombre}
              {elegido === x.id && juicio ? <i className={`fa-solid ${juicio.ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginLeft: 6, color: juicio.ok ? OK : WARN }} /> : null}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.5)", border: `1px solid ${lugarTab.color}55` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>
              <i className={`fa-solid ${lugarTab.icono}`} style={{ marginRight: 8, color: lugarTab.color }} />
              {lugarTab.nombre}
            </span>
            <BotonEscuchar texto={lugarTab.guia.join(" ")} col={lugarTab.color} />
          </div>
          <div style={{ display: "grid", gap: 5 }}>
            {lugarTab.guia.map((o) => {
              const cita = juicio?.cita === o && elegido === lugarTab.id;
              return (
                <div key={o} style={{ fontSize: 13, lineHeight: 1.5, color: cita ? (juicio?.ok ? OK : WARN) : "#e2e8f0", fontWeight: cita ? 800 : 500 }}>
                  <i className="fa-solid fa-angle-right" style={{ marginRight: 7, color: cita ? (juicio?.ok ? OK : WARN) : lugarTab.color, fontSize: 11 }} />
                  {o}
                </div>
              );
            })}
          </div>
          <div className="lr-opts" style={{ marginTop: 10 }}>
            <button className="lr-opt lr-llevar" data-on={!resueltoGuia} disabled={!!resueltoGuia} onClick={() => llevar(lugarTab.id)} style={{ ["--lrc" as string]: modoCol, background: resueltoGuia ? "transparent" : `${modoCol}1f` }}>
              <i className="fa-solid fa-person-walking-arrow-right" style={{ marginRight: 8 }} />
              Llevar a {v.nombre} a {lugarTab.nombre}
            </button>
          </div>
        </div>
        {juicio && nota(<>{juicio.msg} {juicio.cita && <em>«{juicio.cita}»</em>}</>, juicio.ok ? OK : WARN, juicio.ok ? "fa-circle-check" : "fa-lightbulb")}

        <div style={{ opacity: resueltoGuia ? 1 : 0.4, pointerEvents: resueltoGuia ? "auto" : "none" }}>
          {sub("2 · ¿Qué oración de la guía lo prueba?")}
          <div style={{ fontSize: 12.5, color: T.text2, marginBottom: 8 }}>{v.preguntaEvidencia}</div>
          <div style={{ display: "grid", gap: 6 }}>
            {(resueltoGuia ? lugar(resueltoGuia).guia : []).map((o, k) => {
              const bien = evidOk.has(v.id) && resueltoGuia !== null && evidenciasValidas(v, resueltoGuia).includes(k);
              return (
                <button key={o} className="lr-opt lr-evid" data-on={!evidOk.has(v.id) || bien} disabled={evidOk.has(v.id)} onClick={() => elegirEvidencia(k)} style={{ ["--lrc" as string]: bien ? OK : modoCol, textAlign: "left", fontWeight: 700, background: bien ? `${OK}14` : "transparent" }}>
                  {o}
                </button>
              );
            })}
          </div>
          {avisoEvid && nota(avisoEvid, WARN, "fa-lightbulb")}
          {evidOk.has(v.id) && nota(`¡Exacto! Esa oración prueba que ${lugar(resueltoGuia!).nombre} ofrece ${TAG_GUIA_ES[v.clave]}.`, OK, "fa-circle-check")}
          {evidOk.has(v.id) && visitaIdx < VISITANTES_GUIA.length - 1 && (
            <div className="lr-opts" style={{ marginTop: 10 }}>
              <button className="lr-opt lr-sig" data-on="true" onClick={() => irVisitante(visitaIdx + 1)} style={{ ["--lrc" as string]: modoCol }}>
                Siguiente visitante
                <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
              </button>
            </div>
          )}
        </div>
        {nota("Lee con cuidado: el lugar correcto cumple TODO lo que pide el visitante, y la guía lo dice claramente. Si la guía no menciona algo, no lo supongas.", T.text3)}
      </>
    );
  } else {
    const colReac = visita ? (visita.j.reaccion === "feliz" ? OK : visita.j.reaccion === "meh" ? AMBAR : WARN) : modoCol;
    control = (
      <>
        <div className="lr-opts">
          {TURISTAS.map((x, i) => (
            <button key={x.id} className="lr-opt lr-tur" data-on={i === turistaIdx} onClick={() => irTurista(i)} style={{ ["--lrc" as string]: x.ropa, background: i === turistaIdx ? `${x.ropa}26` : "transparent" }}>
              <i className="fa-solid fa-user" style={{ marginRight: 6, color: x.ropa }} />
              {x.nombre}
              {felices[x.id] && <i className="fa-solid fa-face-smile" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${t.ropa}66` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>{t.nombre}:</span> «{t.dice}»
            </div>
            <BotonEscuchar texto={t.dice} col={t.ropa} />
          </div>
          <details className="lr-guia" style={{ marginTop: 6 }}>
            <summary>Ver en español</summary>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 4 }}>{t.es}</div>
          </details>
          {felices[t.id] && <div style={{ fontSize: 12, color: OK, marginTop: 6, fontWeight: 800 }}>Ya disfruta {lugar(felices[t.id]!).es}. Puedes probar otra recomendación.</div>}
        </div>
        {sub(`Tu recomendación para ${t.nombre}`)}
        <textarea
          className="lr-area lr-rec-in"
          aria-label="Tu recomendación en inglés"
          value={textos[turistaIdx] ?? ""}
          data-e={revRec ? revRec.estado : ""}
          onChange={(e) => {
            const val = e.target.value;
            setTextos((ts) => ts.map((x, k) => (k === turistaIdx ? val : x)));
            setRevRec(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          placeholder="You should visit the… because you can…"
          rows={3}
          spellCheck={false}
          style={{ ["--lrc" as string]: modoCol }}
        />
        <div className="lr-opts" style={{ marginTop: 10 }}>
          <button className="lr-opt lr-enviar" data-on="true" onClick={enviar} style={{ ["--lrc" as string]: modoCol, background: `${modoCol}1f` }}>
            <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }} />
            Recomendar
          </button>
          {revRec && revRec.estado !== "mal" && <BotonEscuchar texto={revRec.oracion} col={colReac} />}
          {visita && felices[t.id] && turistaIdx < TURISTAS.length - 1 && (
            <button className="lr-opt lr-sig" data-on="true" onClick={() => irTurista(turistaIdx + 1)} style={{ ["--lrc" as string]: modoCol }}>
              Siguiente turista
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          )}
        </div>
        {revRec && revRec.estado === "mal" && (
          <div style={{ marginTop: 10, display: "grid", gap: 5 }}>
            {revRec.errores.map((e) => (
              <div key={e} style={{ fontSize: 12, color: WARN, lineHeight: 1.5 }}>
                <i className="fa-solid fa-lightbulb" style={{ marginRight: 7 }} />
                {e}
              </div>
            ))}
          </div>
        )}
        {revRec && revRec.estado !== "mal" && revRec.notas.map((x) => <div key={x}>{nota(x, AMBAR, "fa-circle-info")}</div>)}
        {visita && nota(<><strong>«{visita.j.linea}»</strong> {visita.j.msg}</>, colReac, visita.j.reaccion === "feliz" ? "fa-face-grin-stars" : visita.j.reaccion === "meh" ? "fa-face-meh" : "fa-face-frown")}
        {visita && visita.j.reaccion === "feliz" && !visita.relevante &&
          nota(`A ${t.nombre} le gustó el lugar, pero tu razón no menciona lo que busca (${t.quiere.map((q) => TAG_RAZON_ES[q]).join(", ")}). Reescribe la razón para que le importe: así sí cuenta.`, AMBAR, "fa-circle-info")}
        <details className="lr-guia" style={{ marginTop: 12 }}>
          <summary>Consultar la guía turística</summary>
          <div style={{ marginTop: 8 }}>{guiaCompleta}</div>
        </details>
        <details className="lr-guia" style={{ marginTop: 8 }}>
          <summary>Ver ejemplos de recomendación</summary>
          <div style={{ fontSize: 12.5, color: T.text2, marginTop: 6, display: "grid", gap: 4 }}>
            <span>«You should visit the waterfall because you can swim in the natural pool.»</span>
            <span>«I recommend the museum. There is an elevator, and you can see a big mural.»</span>
            <span>«Don&apos;t miss the viewpoint! It&apos;s a quiet place to watch the sunset.»</span>
          </div>
        </details>
        {nota(
          <>
            Formas usadas con turistas felices: {(Object.keys(FORMA_REC_DEF) as FormaRec[]).map((f) => (formasValidas.includes(f) ? `✓ ${FORMA_REC_DEF[f]}` : `○ ${FORMA_REC_DEF[f]}`)).join(" · ")}. Se aceptan contracciones (it&apos;s, don&apos;t); no importan las mayúsculas ni la
            puntuación.
          </>,
          T.text3,
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes lrPulse { 0%,100%{ box-shadow:0 0 0 0 var(--lrd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .lr-live-dot { animation: lrPulse 1.6s ease-in-out infinite; }
        @keyframes lrShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }
        @media (prefers-reduced-motion: reduce){ .lr-live-dot { animation:none; } .lr-area[data-e="mal"], .lr-linea[data-e="mal"] { animation:none !important; } }
        .lr-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .lr-grid { grid-template-columns: 1fr; } }
        .lr-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .lr-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .lr-icobtn:hover { background:rgba(255,255,255,0.12); }
        .lr-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .lr-tab-modo { cursor:pointer; border:1px solid var(--lrc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .lr-tab-modo[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .lr-tab-modo:hover { background:rgba(255,255,255,0.06); }
        .lr-opts { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }
        .lr-opt { cursor:pointer; border:1px solid var(--lrc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.35; }
        .lr-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .lr-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .lr-opt:disabled { cursor:default; }
        .lr-opt:disabled[data-on="false"] { opacity:0.5; }
        .lr-escuchar { cursor:pointer; border:1px solid var(--lrc); border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; color:#fff; background:rgba(4,10,22,0.45); transition:all .15s; }
        .lr-escuchar:hover { background:rgba(255,255,255,0.08); }
        .lr-pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; border:1px solid var(--lrc); font-size:11px; font-weight:800; }
        .lr-linea { min-height:48px; display:flex; flex-wrap:wrap; gap:7px; align-items:center; padding:9px 13px; border-radius:12px; border:1.5px dashed rgba(255,255,255,0.2); background:rgba(4,10,22,0.45); }
        .lr-linea[data-e="ok"] { border-style:solid; border-color:${OK}; }
        .lr-linea[data-e="valida"] { border-style:solid; border-color:${AMBAR}; }
        .lr-linea[data-e="mal"] { border-style:solid; border-color:${WARN}; animation:lrShake .35s; }
        .lr-ficha { cursor:pointer; border:1.5px solid rgba(255,255,255,0.22); border-radius:9px; padding:7px 11px; font-size:13px; font-weight:800; color:#fff; background:rgba(255,255,255,0.05); transition:all .14s; }
        .lr-ap { border-color:#38bdf888; color:#bae6fd; }
        .lr-ficha[data-tipo="s"] { border-color:#f472b688; color:#fbcfe8; }
        .lr-ficha[data-tipo="a"] { border-color:#34d39988; color:#bbf7d0; }
        .lr-ficha[data-tipo="u"] { border-color:#a78bfa88; color:#ddd6fe; }
        .lr-ficha:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        .lr-ficha[data-sel="true"] { background:rgba(251,191,36,0.18); border-color:#fbbf24; color:#fff; }
        .lr-ficha:disabled { cursor:default; }
        .lr-area { width:100%; box-sizing:border-box; border-radius:12px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:14px; line-height:1.55; padding:12px 14px; font-family:inherit; outline:none; resize:vertical; }
        .lr-area:focus { border-color:var(--lrc); }
        .lr-area[data-e="ok"] { border-color:${OK}; }
        .lr-area[data-e="valida"] { border-color:${AMBAR}; }
        .lr-area[data-e="mal"] { border-color:${WARN}; animation:lrShake .35s; }
        .lr-opt:focus-visible, .lr-tab-modo:focus-visible, .lr-icobtn:focus-visible, .lr-ficha:focus-visible, .lr-escuchar:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .lr-bottom { grid-template-columns: 1fr !important; } }
        .lr-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .lr-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .lr-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .lr-drawer[data-open="true"] { transform:translateX(0); }
        .lr-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .lr-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .lr-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .lr-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .lr-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .lr-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        .lr-guia summary { cursor:pointer; color:${accent}; font-size:11.5px; font-weight:800; }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="lr-tabs">
          {MODOS.map((m) => {
            const dd = MODOS_DEF[m];
            const col = `#${dd.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="lr-tab-modo" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--lrc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{dd.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{dd.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lr-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 60vh, 680px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <LugaresScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                errorNonce={errorNonce}
                lugarIdx={lugarIdx}
                resalta={rev?.resalta ?? null}
                resaltaEstado={rev?.estado ?? null}
                resaltaNonce={revNonce}
                oracion={rev ? rev.oracion : borrador}
                hechos={entrada.tipos}
                visitaIdx={visitaIdx}
                guiaElegido={elegido}
                guiaOk={juicio ? juicio.ok : null}
                guiaResueltos={guiaResueltos}
                guiaTab={guiaTab}
                viajeNonce={viajeNonce}
                onTocarLugar={tocarLugar}
                turistaIdx={turistaIdx}
                destino={visita?.lugar ?? null}
                reaccion={visita?.j.reaccion ?? null}
                lineaReaccion={visita?.j.linea ?? ""}
                felices={felices}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="lr-live-dot" style={{ ["--lrd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="lr-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="lr-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="lr-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="lr-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 4 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-map-location-dot" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>What can I do here?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Guía rápida (glosario A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {GLOSARIO_A5.map((g) => (
                <div key={g.termino} style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
                  <strong style={{ color: "#fff" }}>{g.termino}</strong> — {g.definicion}
                  <div style={{ color: "#bae6fd", marginTop: 2 }}>
                    <i className="fa-solid fa-quote-left" style={{ marginRight: 6, fontSize: 10 }} />
                    {g.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "14px 0 6px" }}>PARA PENSAR (VIDEO A8)</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>{PREGUNTA_ABIERTA_A8}</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="lr-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
            Hechos (verdadero o falso, A3 y A4)
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
            {[...HECHOS_A3, ...HECHOS_A4].map((h, i) => (
              <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                <strong style={{ color: h.respuesta ? OK : WARN }}>{h.respuesta ? "Verdadero" : "Falso"}:</strong> «{h.enunciado}» {h.retro}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A1 · {TITULO_A1})
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO_A1.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11.5, color: "#fff", lineHeight: 1.4, marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>
                      <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                      {gi.ejemplo}
                    </span>
                    <BotonEscuchar texto={gi.ejemplo} col={accent} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad (A1):</strong> {ACTIVIDAD_A1}
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
          Son <strong>verbatim</strong> del material de la plataforma: los glosarios A1 y A5 (con los que se arma el marco teórico, porque la progresión no tiene lectura), los textos A2 y A6, los hechos A3 y A4, la autoevaluación
          A7, las preguntas del video A8 (su retroalimentación y el mínimo de 100 % son del laboratorio), los conceptos de A9 y la consigna de «Tu turno» (actividad final de A5). En el hueco 2 de A2 el laboratorio también
          acepta «opposite», que la definición del glosario A1 hace igual de válida. Son <strong>ilustrativos y ficticios</strong>: el pueblo de Rincón del Colibrí, sus siete lugares, la guía turística, los precios (30 y
          40 pesos), los 200 y 300 escalones, los horarios y todas las personas. La temporada de tortugas y los campamentos tortugueros sí existen en las costas de México, pero este campamento es inventado. En
          «Describe the place» cada oración se revisa contra las piezas de la maqueta; en «Recommend it» la revisión es automática y tolerante (mayúsculas, puntuación, contracciones): se aceptan en ámbar las formas
          correctas pero menos naturales para recomendar («You can visit…», «Visit the…», «You must…») y solo cuenta como error el inglés incorrecto o una razón falsa. Fuente: {FUENTE}
        </span>
      </div>

      <RelacionaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A8} accent={accent} rgba={color.rgba} aprobado={quizOk} onAprobado={() => setQuizOk(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes cómo recomendar y qué incluir al describir un lugar." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A2)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto
            data={HUECOS_A2}
            accent={accent}
            rgba={color.rgba}
            completado={textoA2}
            onCompletado={() => {
              setTextoA2(true);
              sfx(true);
            }}
            onAcierto={blip}
            onError={() => sfx(false)}
          />
        </div>
      </div>

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
            completado={textoA6}
            onCompletado={() => {
              setTextoA6(true);
              sfx(true);
            }}
            onAcierto={blip}
            onError={() => sfx(false)}
          />
        </div>
      </div>

      <TuTurnoCard accent={accent} logrado={a5Ok} onLogrado={() => setA5Ok(true)} playSfx={sfx} />

      <AutoevaluacionCard accent={accent} />

      <div className="lr-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="lr-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="lr-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="lr-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="lr-drawer-body">
          <FichaTeorica data={LUGARES_RECOMENDACIONES_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
