"use client";

/**
 * Laboratorio 3D — "Plans and purposes: la colonia que planeamos".
 * Práctica anclada a IN-IV-P05-A2 (fill_blanks «Fill in the Future: Be Going
 * To and Will») de la progresión 5 de Inglés IV: «Habla sobre planes y
 * propósitos personales o comunitarios (expresa lo que se piensa hacer y por
 * qué es importante)». El marco teórico es la lectura A1; los hechos salen del
 * verdadero/falso A4, el glosario del A5, las estrellas del relacionar A8, el
 * reto de las preguntas del video A9 y «Tu turno» de la reflexión A3.
 *
 * Tres modos:
 *  (1) Plan or decision? — en un carrusel de ocho situaciones, identificar el
 *      tipo de futuro y elegir la forma del verbo; la escena muestra la
 *      consecuencia.
 *  (2) Community project — proponer con «We could…» y armar con fichas el plan
 *      completo (quién + be going to + qué + cuándo + por qué); cada plan
 *      correcto transforma la maqueta de la colonia.
 *  (3) My goals — escribir metas personales en una agenda de cinco fechas, con
 *      la estructura pedida y su propósito, con revisión tolerante.
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
import { PLANES_FUTURO_INGLES_FICHA } from "./planes-futuro-ingles-ficha";
import type { VistaPlanes } from "./PlanesFuturoInglesScene";
import {
  type Modo,
  type TipoFuturo,
  type NivelOpcion,
  type Pieza,
  type Conector,
  type ZonaId,
  type RevisionMeta,
  MODOS,
  MODOS_DEF,
  mulberry32,
  estrellasPorErrores,
  SITUACIONES,
  ORDEN_OPCIONES,
  TIPOS,
  TIPOS_DEF,
  fraseSituacion,
  explicaTipo,
  PROYECTOS,
  PROPUESTAS,
  propuestaBien,
  explicaPropuesta,
  FICHAS_PROYECTO,
  textoPieza,
  conectorDe,
  oracionPlan,
  revisaPlan,
  HITOS,
  ESTRUCTURAS,
  revisaMeta,
  PAREJAS_A8,
  DEFINICIONES_A8,
  INSTRUCCIONES_A8,
  rondaA8,
  A3,
  analizaA3,
  A7,
  QUIZ_A9,
  TITULO_A1,
  LECTURA_A1,
  CALLOUT_A1,
  PREGUNTAS_A1,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  HUECOS_A2,
  HUECOS_A6,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
} from "./planes-futuro-ingles-data";

const PlanesScene = dynamic(() => import("./PlanesFuturoInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-seedling fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la colonia en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-planes-futuro-ingles-reto";
const WARN = "#FF8A3C";
/** Ámbar: inglés correcto, pero no la forma más natural para la situación. */
const AMBAR = "#fbbf24";
const N_SIT = SITUACIONES.length;
const RONDA_INICIAL = rondaA8(mulberry32(9));

function BotonEscuchar({ texto, col }: { texto: string; col: string }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button className="pf-escuchar" onClick={() => hablarLab(texto)} title="Escuchar en inglés" aria-label={`Escuchar: ${texto}`} style={{ ["--pfc" as string]: col }}>
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );
}

/* ── Tarjeta de estrellas: A8 relaciona los conceptos clave ───────────── */
function RelacionaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const pareja = PAREJAS_A8[ronda.orden[pos] ?? 0]!;

  const responder = (d: number) => {
    if (resuelto !== null) return;
    const def = DEFINICIONES_A8[d]!;
    const ok = def === pareja.derecha;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      const duena = PAREJAS_A8.find((x) => x.derecha === def);
      setAviso(duena ? `Esa definición es de «${duena.izquierda}», no de «${pareja.izquierda}».` : "Esa definición es de las expresiones de tiempo (next year, soon…), no de una estructura de plan.");
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
    setRonda(rondaA8(Math.random));
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
          Relaciona los conceptos clave (A8)
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>{INSTRUCCIONES_A8}</div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Concepto {pos + 1} de {ronda.orden.length} · cero errores = 3 estrellas
          </div>
          <div style={{ fontSize: 17, color: "#fff", fontWeight: 900, lineHeight: 1.45, marginBottom: 12 }}>{pareja.izquierda}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 8 }}>
            {ronda.defs.map((d) => (
              <button key={d} className="pf-opt pf-a8" data-on="true" onClick={() => responder(d)} style={{ ["--pfc" as string]: accent, textAlign: "left", fontWeight: 700 }}>
                {DEFINICIONES_A8[d]}
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

/* ── Tu turno: reflexión escrita A3 con revisión orientativa ──────────── */
function TuTurnoCard({ accent, logrado, onLogrado, playSfx }: { accent: string; logrado: boolean; onLogrado: () => void; playSfx?: (ok: boolean) => void }) {
  const [texto, setTexto] = useState("");
  const [revisado, setRevisado] = useState(false);
  const an = analizaA3(texto);
  const errores = [...an.erroresBe, ...an.erroresVerbo, ...(an.gonna ? ["gonna"] : [])];
  const criterios: { t: string; ok: boolean }[] = [
    { t: `Al menos ${A3.min} palabras (llevas ${an.palabras})`, ok: an.palabras >= A3.min },
    { t: `Al menos 3 planes con be going to (am / is / are going to + verbo base) · llevas ${an.goingTo}`, ok: an.goingTo >= 3 },
    { t: `Al menos 2 razones con «because» · llevas ${an.because}`, ok: an.because >= 2 },
    {
      t: errores.length ? `Revisa: «${errores.join("», «")}» (falta el verbo be, el verbo no está en forma base o es la forma informal «gonna»)` : "Sin errores detectables de be going to (be + going to + verbo base, sin «gonna»)",
      ok: errores.length === 0,
    },
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
        Tu turno: {A3.titulo} (A3)
      </Eyebrow>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, lineHeight: 1.5, whiteSpace: "pre-line" }}>{A3.prompt}</div>
      <ul style={{ margin: "8px 0 12px", paddingLeft: 18, display: "grid", gap: 3 }}>
        {A3.pistas.map((p) => (
          <li key={p} style={{ fontSize: 12, color: T.text2 }}>
            {p}
          </li>
        ))}
      </ul>
      <textarea
        className="pf-area"
        aria-label="Tus planes en inglés"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setRevisado(false);
        }}
        placeholder="After bachillerato, I am going to study… because…"
        rows={6}
        style={{ ["--pfc" as string]: accent }}
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
        <button className="pf-opt pf-a3" data-on="true" onClick={revisar} style={{ ["--pfc" as string]: accent }}>
          <i className="fa-solid fa-spell-check" style={{ marginRight: 8 }} />
          Revisar mi texto
        </button>
        {revisado && <span style={{ fontSize: 12, color: todo ? OK : WARN, fontWeight: 800 }}>{todo ? "¡Listo! Tu texto cumple los criterios que se pueden revisar automáticamente." : "Todavía falta algo: revisa los puntos en naranja."}</span>}
      </div>
      <div style={{ fontSize: 11, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
        Criterios de la actividad: {A3.criterios.join(" · ")}. La revisión automática es orientativa y funciona con textos en inglés: cuenta palabras, planes con be going to y razones con because, y detecta errores
        frecuentes; tu docente evalúa si los planes son concretos y si el texto tiene coherencia.
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
            <div className="pf-opts">
              {A7.escala.map((e) => (
                <button
                  key={e.valor}
                  className="pf-opt"
                  data-on={valores[i] === e.valor}
                  title={e.descripcion}
                  onClick={() => setValores((vs) => vs.map((v, k) => (k === i ? e.valor : v)))}
                  style={{ ["--pfc" as string]: accent, background: valores[i] === e.valor ? `${accent}22` : "transparent" }}
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

export function LabPlanesFuturoIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("situaciones");
  const [errorNonce, setErrorNonce] = useState(0);

  // ── Plan or decision?
  const [sitIdx, setSitIdx] = useState(0);
  const [tipoOk, setTipoOk] = useState<Set<string>>(() => new Set());
  const [avisoTipo, setAvisoTipo] = useState<string | null>(null);
  const [formaElegida, setFormaElegida] = useState<Record<string, string>>({});
  const [resForma, setResForma] = useState<{ nivel: NivelOpcion; msg: string } | null>(null);

  // ── Community project
  const [zonaIdx, setZonaIdx] = useState(0);
  const [propuestas, setPropuestas] = useState<Set<ZonaId>>(() => new Set());
  const [avisoProp, setAvisoProp] = useState<string | null>(null);
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [revPlan, setRevPlan] = useState<string[] | null>(null);
  const [planes, setPlanes] = useState<Partial<Record<ZonaId, string>>>({});
  const [conectoresPlan, setConectoresPlan] = useState<Set<Conector>>(() => new Set());

  // ── My goals
  const [hitoIdx, setHitoIdx] = useState(0);
  const [textos, setTextos] = useState<string[]>(() => HITOS.map(() => ""));
  const [revMeta, setRevMeta] = useState<RevisionMeta | null>(null);
  const [metas, setMetas] = useState<(string | null)[]>(() => HITOS.map(() => null));
  const [conectoresMeta, setConectoresMeta] = useState<(Conector | null)[]>(() => HITOS.map(() => null));

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizOk, setQuizOk] = useState(false);
  const [textoA2, setTextoA2] = useState(false);
  const [textoA6, setTextoA6] = useState(false);
  const [a3Ok, setA3Ok] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
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

  /* ── Plan or decision? ─────────────────────────────────────────────── */
  const sit = SITUACIONES[sitIdx]!;
  const tipoResuelto = tipoOk.has(sit.id);
  const formaResuelta = sit.id in formaElegida;
  const opcionElegida = sit.opciones.find((o) => o.texto === formaElegida[sit.id]) ?? null;
  const colNivel = (n: NivelOpcion) => (n === "ok" ? OK : n === "valida" ? AMBAR : WARN);
  const icoNivel = (n: NivelOpcion) => (n === "ok" ? "fa-circle-check" : n === "valida" ? "fa-circle-info" : "fa-lightbulb");
  const frase = fraseSituacion(sit, formaElegida[sit.id] ?? null);

  const irSituacion = (i: number) => {
    setSitIdx(i);
    setAvisoTipo(null);
    setResForma(null);
    blip();
  };
  const elegirTipo = (t: TipoFuturo) => {
    if (tipoResuelto) return;
    if (sit.tipos.includes(t)) {
      setTipoOk((s) => new Set(s).add(sit.id));
      setAvisoTipo(null);
      sfx(true);
    } else {
      setAvisoTipo(explicaTipo(sit, t));
      fallo();
    }
  };
  const elegirForma = (k: number) => {
    if (formaResuelta || !tipoResuelto) return;
    const o = sit.opciones[k]!;
    setResForma({ nivel: o.nivel, msg: o.porque });
    // «valida» es inglés correcto: avanza y cuenta igual que la forma recomendada.
    if (o.nivel !== "mal") {
      setFormaElegida((f) => ({ ...f, [sit.id]: o.texto }));
      sfx(true);
    } else fallo();
  };

  /* ── Community project ─────────────────────────────────────────────── */
  const pr = PROYECTOS[zonaIdx]!;
  const propuesto = propuestas.has(pr.id);
  const planeado = pr.id in planes;
  const oracionArmada = oracionPlan(pr, piezas);
  const planResuelto = revPlan !== null && revPlan.length === 0;

  const irZona = (i: number) => {
    setZonaIdx(i);
    setPiezas([]);
    setRevPlan(null);
    setAvisoProp(null);
    blip();
  };
  const proponer = (texto: string, ok: boolean) => {
    if (propuesto) return;
    if (ok) {
      setPropuestas((s) => new Set(s).add(pr.id));
      setAvisoProp(null);
      sfx(true);
    } else {
      setAvisoProp(explicaPropuesta(pr, texto));
      fallo();
    }
  };
  const ponerPieza = (x: Pieza) => {
    if (piezas.includes(x) || planResuelto) return;
    setPiezas((xs) => [...xs, x]);
    setRevPlan(null);
    blip();
  };
  const quitarPieza = (i: number) => {
    if (planResuelto) return;
    setPiezas((xs) => xs.filter((_, k) => k !== i));
    setRevPlan(null);
  };
  const comprobarPlan = () => {
    const errs = revisaPlan(pr, piezas);
    setRevPlan(errs);
    if (errs.length) {
      fallo();
      return;
    }
    sfx(true);
    const texto = oracionPlan(pr, piezas);
    setPlanes((ps) => ({ ...ps, [pr.id]: texto }));
    const c = piezas.map(conectorDe).find((x) => x !== null);
    if (c) setConectoresPlan((s) => new Set(s).add(c));
  };
  const otraVersion = () => {
    setPiezas([]);
    setRevPlan(null);
    blip();
  };

  /* ── My goals ──────────────────────────────────────────────────────── */
  const hito = HITOS[hitoIdx]!;
  const est = ESTRUCTURAS[hito.estructura];
  const nMetas = metas.filter((m) => m !== null).length;
  const conectoresMetaSet = new Set(conectoresMeta.filter((c): c is Conector => c !== null));

  const irHito = (i: number) => {
    setHitoIdx(i);
    setRevMeta(null);
    blip();
  };
  const comprobarMeta = () => {
    const r = revisaMeta(textos[hitoIdx] ?? "", hito);
    setRevMeta(r);
    if (!r.ok) {
      fallo();
      return;
    }
    sfx(true);
    setMetas((ms) => ms.map((m, k) => (k === hitoIdx ? r.oracion : m)));
    setConectoresMeta((cs) => cs.map((c, k) => (k === hitoIdx ? r.conector : c)));
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "situaciones") {
      setAvisoTipo(null);
      setResForma(null);
    }
    if (modo === "comunidad") {
      setPiezas([]);
      setRevPlan(null);
      setAvisoProp(null);
    }
    if (modo === "metas") setRevMeta(null);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Identificar el tipo de futuro de las 8 situaciones", done: tipoOk.size === N_SIT },
    { t: "Elegir la forma correcta del verbo en las 8 situaciones", done: Object.keys(formaElegida).length === N_SIT },
    { t: "Proponer los 5 proyectos de la colonia con «We could + verbo»", done: propuestas.size === PROYECTOS.length },
    { t: "Armar el plan completo de los 5 proyectos y transformar la colonia", done: Object.keys(planes).length === PROYECTOS.length },
    { t: "Explicar un plan con cada conector: to, so that y because", done: conectoresPlan.size === 3 },
    { t: "Escribir las 5 metas de tu agenda (next week → in five years)", done: nMetas === HITOS.length },
    { t: "Usar to, so that y because en tus metas escritas", done: conectoresMetaSet.size === 3 },
    { t: "Relacionar los conceptos de A8 y ganar estrellas", done: identifico },
    { t: "Aprobar el reto de las preguntas del video A9", done: quizOk },
    { t: "Completar los textos A2 y A6", done: textoA2 && textoA6 },
    { t: "Escribir tus planes (A3) y pasar la revisión", done: a3Ok },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaPlanes = modo;
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "situaciones") {
    chipVivo = `situación ${sitIdx + 1}/${N_SIT} · ${Object.keys(formaElegida).length}/${N_SIT} resueltas`;
    pie = formaResuelta ? (
      <>
        <strong style={{ color: opcionElegida ? colNivel(opcionElegida.nivel) : OK }}>«{frase}»</strong> {sit.consecuencia}
      </>
    ) : resForma && resForma.nivel === "mal" ? (
      resForma.msg
    ) : tipoResuelto ? (
      `Es ${TIPOS_DEF[sit.tipos[0]!].etq.toLowerCase()}. Ahora elige la forma del verbo que completa lo que dice ${sit.hablante === "Tú" ? "tu personaje" : sit.hablante}.`
    ) : (
      `${sit.contexto} ¿Qué tipo de futuro es?`
    );
  } else if (modo === "comunidad") {
    chipVivo = `${pr.lugar} · ${Object.keys(planes).length}/${PROYECTOS.length} planes`;
    pie = planResuelto ? (
      <>
        <strong style={{ color: OK }}>«{oracionArmada}»</strong> Plan anunciado con be going to: {pr.lugar.toLowerCase()} se transforma.
      </>
    ) : revPlan && revPlan.length ? (
      revPlan[0]
    ) : propuesto ? (
      `Propuesta aceptada: «${propuestaBien(pr)}» El holograma muestra la idea. Arma el plan con las fichas para hacerlo realidad.`
    ) : (
      `${pr.problema} Propón un proyecto con «We could…».`
    );
  } else {
    chipVivo = `${hito.tiempo} · ${nMetas}/${HITOS.length} metas`;
    pie = revMeta?.ok ? (
      <>
        <strong style={{ color: OK }}>«{revMeta.oracion}»</strong> La bandera de «{hito.tiempo}» se levanta.
      </>
    ) : revMeta ? (
      revMeta.errores[0]
    ) : (
      `Escribe una meta para «${hito.tiempo}» (${hito.es}) con ${est.molde} y explica por qué con to, so that o because.`
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

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "situaciones") {
    control = (
      <>
        <div className="pf-opts">
          {SITUACIONES.map((x, i) => (
            <button key={x.id} className="pf-opt pf-sit" data-on={i === sitIdx} onClick={() => irSituacion(i)} title={x.titulo} aria-label={`Situación ${i + 1}: ${x.titulo}`} style={{ ["--pfc" as string]: modoCol, background: i === sitIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${x.icono}`} style={{ marginRight: 6 }} />
              {i + 1}
              {x.id in formaElegida ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} /> : tipoOk.has(x.id) ? <i className="fa-solid fa-circle-half-stroke" style={{ marginLeft: 6, color: modoCol }} /> : null}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${modoCol}44` }}>
          <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 900, marginBottom: 4 }}>
            <i className={`fa-solid ${sit.icono}`} style={{ color: modoCol, marginRight: 8 }} />
            {sit.titulo}
          </div>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{sit.contexto}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <div style={{ fontSize: 15.5, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>{sit.hablante}:</span> «{frase}»
            </div>
            {formaResuelta && <BotonEscuchar texto={frase} col={OK} />}
          </div>
          {formaResuelta && <div style={{ fontSize: 11.5, color: T.text3, marginTop: 4 }}>{sit.es}</div>}
        </div>
        {sub("1 · ¿Qué tipo de futuro es?")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 7 }}>
          {TIPOS.map((t) => {
            const d = TIPOS_DEF[t];
            const bien = tipoResuelto && sit.tipos.includes(t);
            return (
              <button key={t} className="pf-opt pf-tipo" data-on={bien || !tipoResuelto} disabled={tipoResuelto} onClick={() => elegirTipo(t)} style={{ ["--pfc" as string]: bien ? OK : d.color, textAlign: "left", background: bien ? `${OK}14` : "transparent" }}>
                <i className={`fa-solid ${bien ? "fa-check" : d.icono}`} style={{ marginRight: 8, color: bien ? OK : d.color }} />
                {d.etq}
              </button>
            );
          })}
        </div>
        {avisoTipo && nota(avisoTipo, WARN, "fa-lightbulb")}
        {tipoResuelto && nota(`${sit.tipos.map((t) => TIPOS_DEF[t].etq).join(" / ")} → en inglés: ${[...new Set(sit.tipos.map((t) => TIPOS_DEF[t].forma))].join(" o ")}.`, OK, "fa-circle-check")}
        <div style={{ opacity: tipoResuelto ? 1 : 0.4, pointerEvents: tipoResuelto ? "auto" : "none" }}>
          {sub("2 · Elige la forma del verbo")}
          <div className="pf-opts">
            {(ORDEN_OPCIONES[sitIdx] ?? []).map((k) => {
              const o = sit.opciones[k]!;
              const elegida = formaElegida[sit.id] === o.texto;
              return (
                <button key={o.texto} className="pf-opt pf-forma" data-on={elegida || !formaResuelta} disabled={formaResuelta} onClick={() => elegirForma(k)} style={{ ["--pfc" as string]: elegida ? colNivel(o.nivel) : modoCol, background: elegida ? `${colNivel(o.nivel)}14` : "transparent", fontSize: 13.5 }}>
                  {o.texto}
                </button>
              );
            })}
          </div>
          {resForma && nota(resForma.msg, colNivel(resForma.nivel), icoNivel(resForma.nivel))}
          {!resForma && opcionElegida && nota(opcionElegida.porque, colNivel(opcionElegida.nivel), icoNivel(opcionElegida.nivel))}
          {formaResuelta && sitIdx < N_SIT - 1 && (
            <div className="pf-opts" style={{ marginTop: 10 }}>
              <button className="pf-opt pf-sig" data-on="true" onClick={() => irSituacion(sitIdx + 1)} style={{ ["--pfc" as string]: modoCol }}>
                Siguiente situación
                <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
              </button>
            </div>
          )}
        </div>
        {nota("Regla (A1): be going to para planes ya decididos y predicciones con evidencia; will para decisiones en el momento, promesas y opiniones; present continuous para citas con fecha y hora (A4).", T.text3)}
      </>
    );
  } else if (modo === "comunidad") {
    control = (
      <>
        <div className="pf-opts">
          {PROYECTOS.map((x, i) => (
            <button key={x.id} className="pf-opt pf-zona" data-on={i === zonaIdx} onClick={() => irZona(i)} style={{ ["--pfc" as string]: x.color, background: i === zonaIdx ? `${x.color}22` : "transparent" }}>
              <i className={`fa-solid ${x.icono}`} style={{ marginRight: 6, color: x.color }} />
              {x.lugar}
              {x.id in planes ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} /> : propuestas.has(x.id) ? <i className="fa-solid fa-circle-half-stroke" style={{ marginLeft: 6, color: x.color }} /> : null}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: T.text2, marginTop: 12, lineHeight: 1.5 }}>
          <i className={`fa-solid ${pr.icono}`} style={{ color: pr.color, marginRight: 8 }} />
          {pr.problema}
        </div>
        {sub("1 · Propón el proyecto en la junta de vecinos")}
        <div className="pf-opts">
          {(PROPUESTAS[zonaIdx] ?? []).map((o) => (
            <button key={o.texto} className="pf-opt pf-prop" data-on={!propuesto || o.ok} disabled={propuesto} onClick={() => proponer(o.texto, o.ok)} style={{ ["--pfc" as string]: propuesto && o.ok ? OK : modoCol, background: propuesto && o.ok ? `${OK}14` : "transparent", fontSize: 13 }}>
              {o.texto}
            </button>
          ))}
        </div>
        {avisoProp && nota(avisoProp, WARN, "fa-lightbulb")}
        {propuesto && nota("¡Propuesta aceptada! «We could + verbo base» es una propuesta amable (A5). Ahora conviértela en plan: ya lo decidieron, así que va be going to.", OK, "fa-circle-check")}
        <div style={{ opacity: propuesto ? 1 : 0.4, pointerEvents: propuesto ? "auto" : "none" }}>
          {sub("2 · Arma el plan: quién + be going to + qué + cuándo + por qué")}
          <div className="pf-linea" data-e={revPlan ? (revPlan.length ? "mal" : "bien") : ""}>
            {piezas.length ? (
              piezas.map((x, i) => (
                <button key={x} className="pf-ficha pf-puesta" onClick={() => quitarPieza(i)} disabled={planResuelto} title="Quitar">
                  {textoPieza(pr, x)}
                </button>
              ))
            ) : (
              <span style={{ fontSize: 12.5, color: T.text3 }}>Tu plan aparece aquí y sobre la maqueta. Toca una ficha colocada para quitarla.</span>
            )}
          </div>
          <div className="pf-opts pf-banco" style={{ marginTop: 10 }}>
            {(FICHAS_PROYECTO[zonaIdx] ?? []).map((x) => {
              const tipo = x === "S" ? "s" : x === "am" || x === "is" || x === "are" ? "be" : x === "T" || x === "Tx" ? "t" : x === "to" || x === "so" || x === "because" ? "c" : x.startsWith("R") ? "r" : "a";
              return (
                <button key={x} className="pf-ficha" data-tipo={tipo} disabled={piezas.includes(x) || planResuelto} onClick={() => ponerPieza(x)}>
                  {textoPieza(pr, x)}
                </button>
              );
            })}
          </div>
          <div className="pf-opts" style={{ marginTop: 10 }}>
            <button className="pf-opt pf-comprobar" data-on="true" onClick={comprobarPlan} disabled={piezas.length === 0 || planResuelto} style={{ ["--pfc" as string]: modoCol, background: `${modoCol}1f` }}>
              <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
              Comprobar el plan
            </button>
            <button className="pf-opt pf-borrar" data-on="false" onClick={otraVersion} disabled={piezas.length === 0 && !planResuelto} style={{ ["--pfc" as string]: modoCol }}>
              <i className={`fa-solid ${planResuelto ? "fa-arrows-rotate" : "fa-eraser"}`} style={{ marginRight: 8 }} />
              {planResuelto ? "Otra versión" : "Borrar"}
            </button>
            {planResuelto && <BotonEscuchar texto={oracionArmada} col={OK} />}
            {planResuelto && zonaIdx < PROYECTOS.length - 1 && (
              <button className="pf-opt pf-sig" data-on="true" onClick={() => irZona(zonaIdx + 1)} style={{ ["--pfc" as string]: modoCol }}>
                Siguiente lugar
                <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
              </button>
            )}
          </div>
          {revPlan && revPlan.length > 0 && nota(revPlan.join(" "), WARN, "fa-lightbulb")}
          {planResuelto && nota(<>¡Plan anunciado! «{oracionArmada}» {conectoresPlan.size < 3 ? `Conectores usados: ${[...conectoresPlan].join(", ")}. Prueba «Otra versión» con otro conector.` : "Ya usaste los tres conectores."}</>, OK, "fa-circle-check")}
          {!planResuelto && planeado && nota(`Ya planeaste este lugar: «${planes[pr.id]}». Puedes armar otra versión con otro conector.`, T.text3)}
        </div>
        {nota(
          <>
            <strong style={{ color: "#fff" }}>Conectores:</strong> to + verbo base (to make it safe) · so that + oración con can (so that children can play) · because + la causa (because there is trash everywhere). El «cuándo» puede ir al principio con coma.
          </>,
          T.text3,
        )}
      </>
    );
  } else {
    control = (
      <>
        <div className="pf-opts">
          {HITOS.map((x, i) => (
            <button key={x.id} className="pf-opt pf-hito" data-on={i === hitoIdx} onClick={() => irHito(i)} style={{ ["--pfc" as string]: x.color, background: i === hitoIdx ? `${x.color}22` : "transparent" }}>
              <i className={`fa-solid ${x.icono}`} style={{ marginRight: 6, color: x.color }} />
              {x.tiempo}
              {metas[i] !== null && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${hito.color}55` }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className="pf-pill" style={{ ["--pfc" as string]: hito.color }}>
              <i className="fa-solid fa-clock" style={{ marginRight: 6 }} />
              {hito.tiempo} = {hito.es}
            </span>
            <span className="pf-pill" style={{ ["--pfc" as string]: modoCol }}>
              <i className="fa-solid fa-diagram-project" style={{ marginRight: 6 }} />
              {est.molde}
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 8 }}>
            Estructura: <strong style={{ color: "#fff" }}>{est.etq}</strong> — {est.es}. Y di <strong style={{ color: "#fff" }}>por qué</strong>: to + verbo, so that o because.
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "10px 0 5px" }}>IDEAS (O ESCRIBE LA TUYA)</div>
          <div style={{ display: "grid", gap: 4 }}>
            {hito.ideas.map((idea) => (
              <div key={idea.es} style={{ fontSize: 12, color: T.text2, lineHeight: 1.4 }}>
                <i className={`fa-solid ${idea.icono}`} style={{ color: hito.color, width: 18 }} />
                {idea.es}
              </div>
            ))}
          </div>
        </div>
        {sub(`Tu meta para «${hito.tiempo}»`)}
        <textarea
          className="pf-area pf-meta-in"
          aria-label="Tu meta en inglés"
          value={textos[hitoIdx] ?? ""}
          data-e={revMeta ? (revMeta.ok ? "bien" : "mal") : ""}
          onChange={(e) => {
            const v = e.target.value;
            setTextos((ts) => ts.map((t, k) => (k === hitoIdx ? v : t)));
            setRevMeta(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              comprobarMeta();
            }
          }}
          placeholder={`${hito.tiempo.charAt(0).toUpperCase()}${hito.tiempo.slice(1)}, ${est.molde.replace(" + verbo", "")}…`}
          rows={3}
          spellCheck={false}
          style={{ ["--pfc" as string]: hito.color }}
        />
        <div className="pf-opts" style={{ marginTop: 10 }}>
          <button className="pf-opt pf-comprobar" data-on="true" onClick={comprobarMeta} style={{ ["--pfc" as string]: modoCol, background: `${modoCol}1f` }}>
            <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
            Revisar mi meta
          </button>
          {revMeta?.ok && <BotonEscuchar texto={revMeta.oracion} col={OK} />}
          {revMeta?.ok && hitoIdx < HITOS.length - 1 && (
            <button className="pf-opt pf-sig" data-on="true" onClick={() => irHito(hitoIdx + 1)} style={{ ["--pfc" as string]: modoCol }}>
              Siguiente fecha
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          )}
        </div>
        {revMeta && !revMeta.ok && (
          <div style={{ marginTop: 10, display: "grid", gap: 5 }}>
            {revMeta.errores.map((e) => (
              <div key={e} style={{ fontSize: 12, color: WARN, lineHeight: 1.5 }}>
                <i className="fa-solid fa-lightbulb" style={{ marginRight: 7 }} />
                {e}
              </div>
            ))}
          </div>
        )}
        {revMeta?.ok && nota(<>¡Meta guardada! «{revMeta.oracion}» {revMeta.conector ? `Propósito con «${revMeta.conector}».` : ""}</>, OK, "fa-circle-check")}
        {revMeta?.ok && revMeta.sugerencias.map((x) => <div key={x}>{nota(x, AMBAR, "fa-circle-info")}</div>)}
        {!revMeta && metas[hitoIdx] && nota(`Ya guardaste: «${metas[hitoIdx]}». Si la reescribes con otro conector, se actualiza.`, T.text3)}
        <details className="pf-guia" style={{ marginTop: 12 }}>
          <summary>Ver un ejemplo</summary>
          <div style={{ fontSize: 12.5, color: T.text2, marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            «{hito.ejemplo}» <BotonEscuchar texto={hito.ejemplo} col={hito.color} />
          </div>
        </details>
        {nota(
          <>
            Conectores en tus metas: {(["to", "so that", "because"] as Conector[]).map((c) => (conectoresMetaSet.has(c) ? `✓ ${c}` : `○ ${c}`)).join(" · ")}. Se aceptan contracciones (I&apos;m = I am, I&apos;ll = I will); no importan las mayúsculas ni la
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
        @keyframes pfPulse { 0%,100%{ box-shadow:0 0 0 0 var(--pfd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .pf-live-dot { animation: pfPulse 1.6s ease-in-out infinite; }
        @keyframes pfShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }
        @media (prefers-reduced-motion: reduce){ .pf-live-dot { animation:none; } .pf-area[data-e="mal"], .pf-linea[data-e="mal"] { animation:none !important; } }
        .pf-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .pf-grid { grid-template-columns: 1fr; } }
        .pf-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .pf-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .pf-icobtn:hover { background:rgba(255,255,255,0.12); }
        .pf-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .pf-tab { cursor:pointer; border:1px solid var(--pfc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .pf-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .pf-tab:hover { background:rgba(255,255,255,0.06); }
        .pf-opts { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }
        .pf-opt { cursor:pointer; border:1px solid var(--pfc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.35; }
        .pf-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .pf-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .pf-opt:disabled { cursor:default; }
        .pf-opt:disabled[data-on="false"] { opacity:0.5; }
        .pf-escuchar { cursor:pointer; border:1px solid var(--pfc); border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; color:#fff; background:rgba(4,10,22,0.45); transition:all .15s; }
        .pf-escuchar:hover { background:rgba(255,255,255,0.08); }
        .pf-pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; border:1px solid var(--pfc); color:#fff; font-size:11.5px; font-weight:800; }
        .pf-linea { min-height:48px; display:flex; flex-wrap:wrap; gap:7px; align-items:center; padding:9px 11px; border-radius:12px; border:1.5px dashed rgba(255,255,255,0.2); background:rgba(4,10,22,0.45); }
        .pf-linea[data-e="bien"] { border-style:solid; border-color:${OK}; }
        .pf-linea[data-e="mal"] { border-style:solid; border-color:${WARN}; animation:pfShake .35s; }
        .pf-ficha { cursor:pointer; border:1.5px solid rgba(255,255,255,0.22); border-radius:9px; padding:7px 11px; font-size:13px; font-weight:800; color:#fff; background:rgba(255,255,255,0.05); transition:all .14s; }
        .pf-ficha[data-tipo="s"] { border-color:#f472b688; color:#fbcfe8; }
        .pf-ficha[data-tipo="be"] { border-color:#38bdf888; color:#bae6fd; }
        .pf-ficha[data-tipo="t"] { border-color:#a78bfa88; color:#ddd6fe; }
        .pf-ficha[data-tipo="c"] { border-color:#fbbf2488; color:#fde68a; }
        .pf-ficha[data-tipo="r"] { border-color:#34d39988; color:#bbf7d0; }
        .pf-ficha:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        .pf-ficha:disabled { opacity:0.3; cursor:default; }
        .pf-puesta { background:rgba(251,191,36,0.14); border-color:#fbbf24; }
        .pf-puesta:disabled { opacity:1; }
        .pf-area { width:100%; box-sizing:border-box; border-radius:12px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:14px; line-height:1.55; padding:12px 14px; font-family:inherit; outline:none; resize:vertical; }
        .pf-area:focus { border-color:var(--pfc); }
        .pf-area[data-e="bien"] { border-color:${OK}; }
        .pf-area[data-e="mal"] { border-color:${WARN}; animation:pfShake .35s; }
        .pf-opt:focus-visible, .pf-tab:focus-visible, .pf-icobtn:focus-visible, .pf-ficha:focus-visible, .pf-escuchar:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .pf-bottom { grid-template-columns: 1fr !important; } }
        .pf-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .pf-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .pf-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .pf-drawer[data-open="true"] { transform:translateX(0); }
        .pf-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .pf-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .pf-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .pf-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .pf-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .pf-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        .pf-guia summary { cursor:pointer; color:${accent}; font-size:11.5px; font-weight:800; }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="pf-tabs">
          {MODOS.map((m) => {
            const dd = MODOS_DEF[m];
            const col = `#${dd.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="pf-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--pfc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="pf-grid">
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
              <PlanesScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                errorNonce={errorNonce}
                sitIdx={sitIdx}
                sitResueltas={Object.keys(formaElegida)}
                frase={frase}
                fraseEstado={opcionElegida ? (opcionElegida.nivel === "valida" ? "valida" : "ok") : resForma?.nivel === "mal" || avisoTipo ? "mal" : tipoResuelto ? "tipo" : "pendiente"}
                hablante={sit.hablante === "Tú" ? "You" : sit.hablante}
                zonaIdx={zonaIdx}
                propuestas={[...propuestas]}
                planeados={Object.keys(planes)}
                oracionPlan={oracionArmada || (planeado ? (planes[pr.id] ?? "") : "")}
                estadoPlan={revPlan ? (revPlan.length ? "mal" : "ok") : piezas.length === 0 && planeado ? "ok" : null}
                hitoIdx={hitoIdx}
                metas={metas}
                estadoMeta={revMeta ? (revMeta.ok ? "ok" : "mal") : null}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="pf-live-dot" style={{ ["--pfd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="pf-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="pf-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="pf-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="pf-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-seedling" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>What are you going to do, and why?</div>
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
                <div key={i} style={{ fontSize: 12, color: i === 1 || i === 2 ? "#fff" : T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
              <div style={{ fontSize: 11.5, color: "#bae6fd", lineHeight: 1.5, padding: "8px 10px", borderRadius: 9, background: "rgba(56,189,248,0.08)", border: "1px solid #38bdf833" }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
                {CALLOUT_A1}
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>COMPRENSIÓN</div>
            <div style={{ display: "grid", gap: 8 }}>
              {PREGUNTAS_A1.map((x) => (
                <details key={x.pregunta} className="pf-guia">
                  <summary>{x.pregunta}</summary>
                  <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45, marginTop: 4, paddingLeft: 12 }}>{x.respuesta}</div>
                </details>
              ))}
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="pf-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
            Hechos (verdadero o falso, A4)
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
            {HECHOS.map((h, i) => (
              <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                {h}
              </li>
            ))}
          </ul>
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
          Son <strong>verbatim</strong> del material de la plataforma: la lectura A1 con su recuadro y sus preguntas, los textos A2 y A6, la consigna, pistas y criterios de A3, los hechos A4, el glosario A5, la
          autoevaluación A7, los conceptos de A8 y los enunciados y opciones de las preguntas cerradas del video A9 (su retroalimentación y el mínimo de 100 % son del laboratorio). Son{" "}
          <strong>ilustrativos</strong>: las ocho situaciones, los cinco proyectos, las metas y sus ideas, los personajes (Diego, Doña Lupe, Sofía, Carmen) y la colonia, que son ficticios; los 32 °C del salón
          también. En las situaciones se acepta todo el inglés correcto: la forma que recomienda la lectura A1 se marca en verde y las otras formas válidas (por ejemplo, «It will rain» con nubes a la vista o
          «I&apos;m going to call you» como promesa) en ámbar, con la explicación de por qué la recomendada suena más natural; solo cuenta como error la forma que no encaja (present simple o pasado
          para hablar del futuro, will para una cita ya fijada). El present continuous de la cita viene de A4. En My goals también se aceptan oraciones correctas con otra estructura («I hope I
          will…», will sin «I think», for + sustantivo, gonna) con una sugerencia de la estructura que se practica; la revisión es automática y orientativa. Fuente: {FUENTE}
        </span>
      </div>

      <RelacionaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A9} accent={accent} rgba={color.rgba} aprobado={quizOk} onAprobado={() => setQuizOk(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Distingues cuándo va be going to y cuándo will." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A2)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A2} accent={accent} rgba={color.rgba} completado={textoA2} onCompletado={() => { setTextoA2(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoA6} onCompletado={() => { setTextoA6(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <TuTurnoCard accent={accent} logrado={a3Ok} onLogrado={() => setA3Ok(true)} playSfx={sfx} />

      <AutoevaluacionCard accent={accent} />

      <div className="pf-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="pf-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="pf-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="pf-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="pf-drawer-body">
          <FichaTeorica data={PLANES_FUTURO_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
