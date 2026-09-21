"use client";

/**
 * Laboratorio 3D — "Likes and opinions: la feria de gustos".
 * Práctica anclada a IN-I-P07-A4 (quiz «Likes & opinions — Quiz») de la
 * progresión 7 de Inglés I: «Expresa gustos y opiniones simples en situaciones
 * cotidianas (habla sobre preferencias y razones de forma empática)». El marco
 * teórico es la lectura A1, el diálogo a completar es A2, «Tu turno» es la
 * reflexión A3, los hechos salen del verdadero/falso A5 y el glosario del A6.
 *
 * Tres modos:
 *  (1) Likes survey — escribir «Do you like…?» a seis compañeros, verlos
 *      acercarse o alejarse del puesto, llenar la gráfica 3D y escribir
 *      conclusiones en 3.ª persona (Three students like…, Jorge doesn't like…).
 *  (2) Match the friends — leer perfiles en inglés, sentar a todos donde estén
 *      contentos (cuidado con «I don't mind») y explicar con because.
 *  (3) Give your opinion kindly — responder a la opinión de cada compañero con
 *      una reacción empática, tu gusto (según tu tarjeta) y una razón.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { hablarLab, callarLab, puedeHablarLab } from "./lab-voz";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { GUSTOS_OPINIONES_INGLES_FICHA } from "./gustos-opiniones-ingles-ficha";
import type { RespuestaEncuesta } from "./GustosOpinionesInglesScene";
import {
  type Modo,
  type TemaId,
  type PersonaId,
  type Grado,
  type Aviso,
  type TipoPregunta,
  type Forma,
  type ResultadoMesa,
  type RevisionTurno,
  MODOS,
  MODOS_DEF,
  mulberry32,
  estrellasPorErrores,
  TEMAS,
  TEMA_DEF,
  GRADOS,
  GRADO_DEF,
  COMPANEROS,
  PERSONAS,
  GUSTOS,
  respuestaEncuesta,
  revisaPregunta,
  revisaConclusionNumero,
  revisaConclusionPersona,
  modeloNumero,
  modeloPersona,
  ESCENARIOS,
  perfil,
  revisaMesas,
  revisaPorQue,
  CUPO_MESA,
  TURNOS,
  revisaTurno,
  ADJETIVOS,
  CLASIFICA_GRADO,
  rondaGrado,
  A3,
  analizaA3,
  AUTOEVALUACION_A7,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A6,
  QUIZ_A4,
  HUECOS_A2,
  VIDEO_A8,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
} from "./gustos-opiniones-ingles-data";

const GustosScene = dynamic(() => import("./GustosOpinionesInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-store fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la feria de gustos en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-gustos-opiniones-ingles-reto";
const WARN = "#FF8A3C";
const TIP = "#7dd3fc";
const RONDA_INICIAL = rondaGrado(mulberry32(7));
const ENCUESTAS_META = 2;

const EMPATIA_CHIPS = ["That's cool!", "That's nice!", "I see.", "Really? Why?", "Me too!", "That's fine, everyone is different."];

function BotonEscuchar({ texto, col }: { texto: string; col: string }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button className="go-escuchar" onClick={() => hablarLab(texto)} title="Escuchar en inglés" aria-label={`Escuchar: ${texto}`} style={{ ["--goc" as string]: col }}>
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );
}

function ListaAvisos({ avisos }: { avisos: Aviso[] }) {
  return (
    <>
      {avisos.map((a, i) => (
        <div key={i} style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: a.tipo === "error" ? WARN : TIP, display: "flex", gap: 7 }}>
          <i className={`fa-solid ${a.tipo === "error" ? "fa-lightbulb" : "fa-circle-info"}`} style={{ marginTop: 3 }} />
          <span>{a.texto}</span>
        </div>
      ))}
    </>
  );
}

/* ── Tarjeta de estrellas: ¿qué tanto le gusta? ───────────────────────── */
function GradoCard({
  accent,
  rgba,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  mejor: number;
  onResultado: (e: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = CLASIFICA_GRADO[ronda[pos] ?? 0]!;

  const responder = (g: Grado) => {
    if (resuelto !== null) return;
    const ok = g === actual.g;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      const d = GRADO_DEF[actual.g];
      setAviso(`No es «${GRADO_DEF[g].en}». «${actual.texto}» usa «${d.en}» = ${d.es.toLowerCase()}${actual.g === 2 ? ": es neutro, no es un gusto" : ""}.`);
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
    setRonda(rondaGrado(Math.random));
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
          How much do they like it? (ejemplos de A1, A2, A4 y A6)
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>
        La lectura A1 ordena los gustos en seis grados, de «I love» a «I hate». Coloca cada oración en su grado; con cero errores ganas tres estrellas.
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Oración {pos + 1} de {ronda.length} · {actual.fuente}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <div lang="en" style={{ fontSize: 16, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>
              «{actual.texto}»
            </div>
            <BotonEscuchar texto={actual.texto} col={accent} />
          </div>
          <div className="go-grados">
            {GRADOS.map((g) => {
              const d = GRADO_DEF[g];
              return (
                <button key={g} className="go-opt go-grado" data-on="true" onClick={() => responder(g)} style={{ ["--goc" as string]: d.col, textAlign: "left" }}>
                  <div style={{ fontSize: 12.5 }}>
                    <i className={`fa-solid ${d.icono}`} style={{ marginRight: 7, color: d.col }} />
                    <span lang="en">{d.en}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 700, marginTop: 3 }}>{d.es}</div>
                </button>
              );
            })}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
        </>
      ) : (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 11,
            border: `1px solid ${OK}55`,
            background: "rgba(52,211,153,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>
              Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}
            </span>
          </span>
          <button
            onClick={otra}
            style={{
              cursor: "pointer",
              padding: "9px 14px",
              borderRadius: 10,
              border: `1px solid ${accent}`,
              background: `rgba(${rgba},0.16)`,
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 900,
            }}
          >
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Tu turno: reflexión A3 con revisión orientativa ──────────────────── */
function TuTurnoCard({ accent, logrado, onLogrado, playSfx }: { accent: string; logrado: boolean; onLogrado: () => void; playSfx?: (ok: boolean) => void }) {
  const [texto, setTexto] = useState("");
  const [revisado, setRevisado] = useState(false);
  const an = analizaA3(texto);
  const g = an.grados;
  const criterios: { t: string; ok: boolean }[] = [
    { t: `Entre ${A3.min} y ${A3.max} palabras (llevas ${an.palabras})`, ok: an.palabras >= A3.min && an.palabras <= A3.max },
    { t: `Al menos 8 oraciones de gusto con «I love / I like / I don't like / I hate…» · llevas ${an.gustos}`, ok: an.gustos >= 8 },
    { t: `Una razón con «because» para cada gusto (al menos 8) · llevas ${an.porque}`, ok: an.porque >= 8 },
    {
      t: `Variedad de grados: love ${g.love ? "✓" : "✗"} · like ${g.like ? "✓" : "✗"} · don't like ${g.dislike ? "✓" : "✗"} · hate ${g.hate ? "✓" : "✗"}`,
      ok: g.love && g.like && g.dislike && g.hate,
    },
    {
      t: an.espanol >= 15 ? "Incluye la reflexión en español" : "Falta la reflexión en español (¿en qué se parecen y en qué se diferencian inglés y español?)",
      ok: an.espanol >= 15,
    },
    {
      t: an.errores.length ? `Revisa: ${an.errores.join(", ")}` : "Like + sustantivo o -ing: no se detectaron «I likes», «I no like», «like + verbo base» ni «because is»",
      ok: an.errores.length === 0,
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
        Tu turno: Mis gustos en inglés (A3)
      </Eyebrow>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, lineHeight: 1.5 }}>{A3.prompt}</div>
      <ul style={{ margin: "8px 0 12px", paddingLeft: 18, display: "grid", gap: 3 }}>
        {A3.pistas.map((p) => (
          <li key={p} style={{ fontSize: 12, color: T.text2 }}>
            {p}
          </li>
        ))}
      </ul>
      <textarea
        className="go-area"
        aria-label="Tu texto sobre tus gustos"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setRevisado(false);
        }}
        placeholder="I love tacos because they are delicious. I don't like math because it is difficult… (y al final, tu reflexión en español)"
        rows={7}
        style={{ ["--goc" as string]: accent }}
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
        <button className="go-opt go-a3" data-on="true" onClick={revisar} style={{ ["--goc" as string]: accent }}>
          <i className="fa-solid fa-spell-check" style={{ marginRight: 8 }} />
          Revisar mi texto
        </button>
        {revisado && (
          <span style={{ fontSize: 12, color: todo ? OK : WARN, fontWeight: 800 }}>
            {todo ? "¡Listo! Tu texto cumple los criterios que se pueden revisar automáticamente." : "Todavía falta algo: revisa los puntos en naranja."}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
        Criterios de la actividad: {A3.criterios.join(" · ")}. La revisión automática es orientativa: cuenta oraciones de gusto, «because» y grados, y detecta errores de forma; tu
        docente evalúa la calidad de tus razones y de tu reflexión. Para empezar, la pregunta abierta del video A8: «{VIDEO_A8.abierta}»
      </div>
      <details className="go-guia" style={{ marginTop: 12 }}>
        <summary>Autoevaluación (A7)</summary>
        <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>
          {AUTOEVALUACION_A7.instrucciones} Escala: {AUTOEVALUACION_A7.escala.join(" · ")}.
        </div>
        <ul style={{ margin: "6px 0 0", paddingLeft: 18, display: "grid", gap: 3 }}>
          {AUTOEVALUACION_A7.criterios.map((c) => (
            <li key={c} style={{ fontSize: 12, color: T.text2 }}>
              {c}
            </li>
          ))}
        </ul>
        <div style={{ fontSize: 12, color: "#fff", marginTop: 6 }}>{AUTOEVALUACION_A7.reflexion}</div>
      </details>
    </div>
  );
}

/** Campo de una línea con botón; Enter también envía. */
function Entrada(props: {
  label: string;
  value: string;
  set: (v: string) => void;
  onEnter: () => void;
  placeholder: string;
  estado: Rev;
  disabled?: boolean;
  boton: string;
  icono: string;
  clase: string;
  col: string;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <input
        className="go-in"
        aria-label={props.label}
        value={props.value}
        placeholder={props.placeholder}
        data-e={props.estado ? (props.estado.ok ? "bien" : "mal") : ""}
        disabled={props.disabled}
        onChange={(e) => props.set(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            props.onEnter();
          }
        }}
        autoComplete="off"
        spellCheck={false}
        lang="en"
        style={{ flex: 1, minWidth: 220 }}
      />
      <button
        className={`go-opt ${props.clase}`}
        data-on="true"
        onClick={props.onEnter}
        disabled={props.disabled}
        style={{ ["--goc" as string]: props.col, background: `${props.col}1f` }}
      >
        <i className={`fa-solid ${props.icono}`} style={{ marginRight: 8 }} />
        {props.boton}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

type Rev = { ok: boolean; avisos: Aviso[] } | null;
type Asientos = Partial<Record<PersonaId, TemaId>>;
const clave = (tema: TemaId, p: PersonaId) => `${tema}:${p}`;

export function LabGustosOpinionesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("encuesta");

  // ── Likes survey
  const [temaSel, setTemaSel] = useState<TemaId>("soccer");
  const [sel, setSel] = useState<PersonaId>("ana");
  const [pregTxt, setPregTxt] = useState("");
  const [revPreg, setRevPreg] = useState<Rev>(null);
  const [respuestas, setRespuestas] = useState<Record<string, TipoPregunta>>({});
  const [ultima, setUltima] = useState<RespuestaEncuesta | null>(null);
  const [formas, setFormas] = useState<Set<Forma>>(() => new Set());
  const [numTxt, setNumTxt] = useState("");
  const [perTxt, setPerTxt] = useState("");
  const [revNum, setRevNum] = useState<Rev>(null);
  const [revPer, setRevPer] = useState<Rev>(null);
  const [concluNum, setConcluNum] = useState<Set<TemaId>>(() => new Set());
  const [concluPer, setConcluPer] = useState<Set<TemaId>>(() => new Set());

  // ── Match the friends
  const [escIdx, setEscIdx] = useState(0);
  const [asientos, setAsientos] = useState<Asientos[]>(() => ESCENARIOS.map(() => ({})));
  const [selMesa, setSelMesa] = useState<PersonaId>("ana");
  const [resMesas, setResMesas] = useState<ResultadoMesa[] | null>(null);
  const [avisoMesa, setAvisoMesa] = useState<string | null>(null);
  const [escOk, setEscOk] = useState<Set<number>>(() => new Set());
  const [porqueTxt, setPorqueTxt] = useState("");
  const [revPorque, setRevPorque] = useState<Rev>(null);
  const [porqueOk, setPorqueOk] = useState<Set<number>>(() => new Set());

  // ── Give your opinion kindly
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [respTxt, setRespTxt] = useState("");
  const [revTurno, setRevTurno] = useState<RevisionTurno | null>(null);
  const [mostrada, setMostrada] = useState<string | null>(null);
  const [turnosOk, setTurnosOk] = useState<Set<string>>(() => new Set());

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizOk, setQuizOk] = useState(false);
  const [textoA2, setTextoA2] = useState(false);
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

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Likes survey ──────────────────────────────────────────────────── */
  const dTema = TEMA_DEF[temaSel];
  const respondidos = COMPANEROS.filter((p) => respuestas[clave(temaSel, p)] !== undefined);
  const encuestaCompleta = respondidos.length === COMPANEROS.length;
  const completas = TEMAS.filter((tm) => COMPANEROS.every((p) => respuestas[clave(tm, p)] !== undefined));
  const grafica = Object.fromEntries(
    TEMAS.map((tm) => {
      const rs = COMPANEROS.filter((p) => respuestas[clave(tm, p)] !== undefined).map((p) => GRADO_DEF[GUSTOS[p][tm].g].grupo);
      return [tm, { like: rs.filter((x) => x === "like").length, mind: rs.filter((x) => x === "mind").length, dislike: rs.filter((x) => x === "dislike").length, n: rs.length }];
    }),
  ) as Record<TemaId, { like: number; mind: number; dislike: number; n: number }>;
  const gTema = grafica[temaSel];
  const burbuja = ultima && ultima.tema === temaSel ? respuestaEncuesta(ultima.persona, ultima.tema, respuestas[clave(ultima.tema, ultima.persona)] ?? "do") : null;

  const elegirPersona = useCallback((id: PersonaId) => {
    setSel(id);
    setRevPreg(null);
  }, []);

  const preguntar = () => {
    const r = revisaPregunta(pregTxt, temaSel, sel);
    setRevPreg({ ok: r.ok, avisos: r.avisos });
    sfx(r.ok);
    if (!r.ok) return;
    const nuevas = { ...respuestas, [clave(temaSel, sel)]: r.tipo };
    setRespuestas(nuevas);
    if (r.forma === "ing" || r.forma === "noun") setFormas((s) => new Set(s).add(r.forma));
    setUltima((u) => ({ persona: sel, tema: temaSel, clave: (u?.clave ?? 0) + 1 }));
    const sig = COMPANEROS.find((p) => p !== sel && nuevas[clave(temaSel, p)] === undefined);
    if (sig) setSel(sig);
  };

  const irTema = (tm: TemaId) => {
    setTemaSel(tm);
    setRevPreg(null);
    setNumTxt("");
    setPerTxt("");
    setRevNum(null);
    setRevPer(null);
    const sig = COMPANEROS.find((p) => respuestas[clave(tm, p)] === undefined);
    setSel(sig ?? "ana");
    blip();
  };

  const comprobarNum = () => {
    const r = revisaConclusionNumero(numTxt, temaSel);
    setRevNum(r);
    sfx(r.ok);
    if (r.ok) setConcluNum((s) => new Set(s).add(temaSel));
  };
  const comprobarPer = () => {
    const r = revisaConclusionPersona(perTxt, temaSel);
    setRevPer(r);
    sfx(r.ok);
    if (r.ok) setConcluPer((s) => new Set(s).add(temaSel));
  };

  /* ── Match the friends ─────────────────────────────────────────────── */
  const esc = ESCENARIOS[escIdx]!;
  const asi = asientos[escIdx]!;
  const sentados = COMPANEROS.filter((p) => asi[p]).length;
  const revisado = resMesas !== null;
  const felices = resMesas ? resMesas.filter((r) => r.feliz).length : 0;
  const escResuelto = escOk.has(escIdx);

  const elegirMesa = useCallback((id: PersonaId) => {
    setSelMesa(id);
    setAvisoMesa(null);
  }, []);

  const irEscenario = (i: number) => {
    setEscIdx(i);
    setResMesas(null);
    setAvisoMesa(null);
    setPorqueTxt("");
    setRevPorque(null);
    blip();
  };
  const sentar = (tm: TemaId) => {
    if (escResuelto) return;
    const ocupados = COMPANEROS.filter((p) => asi[p] === tm && p !== selMesa).length;
    if (ocupados >= CUPO_MESA) {
      setAvisoMesa(`La mesa «${esc.mesa[tm]}» ya tiene ${CUPO_MESA} lugares ocupados. Quita a alguien primero.`);
      sfx(false);
      return;
    }
    setAsientos((xs) => xs.map((a, i) => (i === escIdx ? { ...a, [selMesa]: tm } : a)));
    setResMesas(null);
    setAvisoMesa(null);
    const sig = COMPANEROS.find((p) => p !== selMesa && !asi[p]);
    if (sig) setSelMesa(sig);
    blip();
  };
  const levantar = (p: PersonaId) => {
    if (escResuelto) return;
    setAsientos((xs) =>
      xs.map((a, i) => {
        if (i !== escIdx) return a;
        const n = { ...a };
        delete n[p];
        return n;
      }),
    );
    setSelMesa(p);
    setResMesas(null);
  };
  const comprobarMesas = () => {
    const r = revisaMesas(asi);
    setResMesas(r);
    const todos = r.length === COMPANEROS.length && r.every((x) => x.feliz);
    sfx(todos);
    if (todos) setEscOk((s) => new Set(s).add(escIdx));
  };
  const comprobarPorque = () => {
    const r = revisaPorQue(porqueTxt, asi);
    setRevPorque(r);
    sfx(r.ok);
    if (r.ok) setPorqueOk((s) => new Set(s).add(escIdx));
  };

  /* ── Give your opinion kindly ──────────────────────────────────────── */
  const turno = TURNOS[turnoIdx]!;
  const compa = PERSONAS[turno.quien];
  const turnoHecho = turnosOk.has(turno.id);
  const reaccion: "feliz" | "neutral" | "enojo" | null = !revTurno
    ? turnoHecho
      ? "feliz"
      : null
    : revTurno.ok
      ? "feliz"
      : revTurno.rudo
        ? "enojo"
        : revTurno.faltaEmpatia
          ? "neutral"
          : null;
  const escenaRespuesta = reaccion ? (mostrada ?? (turnoHecho ? turno.modelo : null)) : null;

  const irTurno = (i: number) => {
    setTurnoIdx(i);
    setRespTxt("");
    setRevTurno(null);
    setMostrada(null);
    blip();
  };
  const responderTurno = () => {
    const r = revisaTurno(respTxt, turno);
    setRevTurno(r);
    sfx(r.ok);
    setMostrada(respTxt.trim().slice(0, 180));
    if (r.ok) setTurnosOk((s) => new Set(s).add(turno.id));
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "encuesta") {
      setPregTxt("");
      setRevPreg(null);
      setUltima(null);
    }
    if (modo === "mesas" && !escResuelto) {
      setAsientos((xs) => xs.map((a, i) => (i === escIdx ? {} : a)));
      setResMesas(null);
      setAvisoMesa(null);
    }
    if (modo === "opinion") {
      setRespTxt("");
      setRevTurno(null);
      setMostrada(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: `Completar ${ENCUESTAS_META} encuestas: preguntar a los seis compañeros por dos puestos`, done: completas.length >= ENCUESTAS_META },
    { t: "Preguntar con like + sustantivo (karaoke, spicy food) y con like + -ing (playing soccer)", done: formas.has("ing") && formas.has("noun") },
    { t: "Escribir en dos encuestas la conclusión con número (Three students like…)", done: concluNum.size >= ENCUESTAS_META },
    { t: "Escribir en dos encuestas una conclusión sobre una persona (Jorge doesn't like…)", done: concluPer.size >= ENCUESTAS_META },
    { t: "Sentar a todos contentos en los clubes del recreo", done: escOk.has(0) },
    { t: "Formar los grupos del sábado con todos contentos", done: escOk.has(1) },
    { t: "Explicar con because por qué a un amigo le gusta su lugar (en los dos escenarios)", done: porqueOk.size === ESCENARIOS.length },
    { t: "Responder a los seis compañeros con empatía, tu gusto y una razón", done: turnosOk.size === TURNOS.length },
    { t: "Clasificar los grados de gusto y ganar estrellas", done: identifico },
    { t: "Aprobar el quiz A4 y completar el diálogo A2", done: quizOk && textoA2 },
    { t: "Escribir tu texto A3 sobre tus gustos", done: a3Ok },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "encuesta") {
    chipVivo = `${dTema.puesto} · ${gTema.n}/6 · like ${gTema.like} · don't mind ${gTema.mind} · don't like ${gTema.dislike}`;
    if (ultima && ultima.tema === temaSel && burbuja) {
      const pu = PERSONAS[ultima.persona];
      const g = GUSTOS[ultima.persona][temaSel].g;
      pie = (
        <>
          <strong style={{ color: GRADO_DEF[g].col }}>
            {pu.nombre}: «{burbuja}»
          </strong>{" "}
          {g >= 3
            ? `Le gusta (${GRADO_DEF[g].en.replace("I ", "")}): va al puesto ${dTema.puesto} y la barra verde sube.`
            : g === 2
              ? "I don't mind = no le molesta: se queda en la fila; es la barra amarilla, no cuenta como like."
              : `No le gusta (${GRADO_DEF[g].en.replace("I ", "")}): se aleja del puesto y sube la barra roja.`}
        </>
      );
    } else pie = `Encuesta del puesto ${dTema.puesto}: pregúntale a ${PERSONAS[sel].nombre} «Do you like ${dTema.en}?». Toca a un compañero en la escena para elegirlo.`;
  } else if (modo === "mesas") {
    chipVivo = `${esc.titulo} · sentados ${sentados}/6 · ${revisado ? `contentos ${felices}/6` : "sin comprobar"}`;
    pie = revisado ? (
      felices === 6 ? (
        <>
          <strong style={{ color: OK }}>¡Todos contentos!</strong> Cada quien está donde dijo like, really like o love.
        </>
      ) : (
        `${felices} de ${sentados} están contentos. Mira los emojis: la cara seria dice «I don't mind» (no es gusto) y la triste o enojada, «I don't like» o «I hate».`
      )
    ) : (
      `Toca a un amigo, lee su perfil y siéntalo en una mesa. Hay ${CUPO_MESA} lugares por mesa.`
    );
  } else {
    chipVivo = `Turno ${turnoIdx + 1}/6 · ${compa.nombre} · ${turno.tipo === "do" ? "Do you like…?" : turno.tipo === "think" ? "What do you think of…?" : "What's your favorite…?"}`;
    pie =
      reaccion === "feliz" ? (
        <>
          <strong style={{ color: OK }}>{compa.nombre} sonríe:</strong>{" "}
          {turno.diferente ? "reaccionaste con empatía, diste tu gusto distinto y tu razón sin despreciar el suyo." : "coinciden, y lo dijiste con tu razón."}
        </>
      ) : reaccion === "enojo" ? (
        <>
          <strong style={{ color: "#f87171" }}>{compa.nombre} se siente mal:</strong> una palabra de tu respuesta desprecia su gusto.
        </>
      ) : reaccion === "neutral" ? (
        <>
          <strong style={{ color: "#fbbf24" }}>{compa.nombre} no está seguro:</strong> tu gusto es distinto y no hubo una reacción amable antes.
        </>
      ) : (
        <>
          {compa.nombre}: «<span lang="en">{turno.linea}</span>»
        </>
      );
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          color: "#04121f",
          background: accent,
          boxShadow: `0 10px 30px -6px ${accent}`,
        }}
      >
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los controles y la retroalimentación siguen aquí. {typeof pie === "string" ? pie : ""}
      </div>
    </div>
  );

  const sub = (txt: string) => (
    <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>
  );
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const ingles = (texto: string, col: string, extra?: ReactNode) => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        padding: "11px 13px",
        borderRadius: 12,
        background: "rgba(4,10,22,0.5)",
        border: `1px solid ${col}44`,
      }}
    >
      <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 800, lineHeight: 1.45, fontFamily: "ui-rounded, system-ui, sans-serif" }} lang="en">
        {texto}
        {extra}
      </div>
      <BotonEscuchar texto={texto} col={col} />
    </div>
  );
  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "encuesta") {
    const numHecho = concluNum.has(temaSel);
    const perHecho = concluPer.has(temaSel);
    control = (
      <>
        {sub("1 · Elige el puesto de tu encuesta")}
        <div className="go-opts">
          {TEMAS.map((tm) => {
            const d = TEMA_DEF[tm];
            const n = grafica[tm].n;
            const listo = concluNum.has(tm) && concluPer.has(tm);
            return (
              <button
                key={tm}
                className="go-opt go-tema"
                data-on={tm === temaSel}
                onClick={() => irTema(tm)}
                style={{ ["--goc" as string]: d.color, background: tm === temaSel ? `${d.color}22` : "transparent" }}
              >
                <i className={`fa-solid ${d.icono}`} style={{ marginRight: 7, color: d.color }} />
                <span lang="en">{d.puesto}</span>
                <span style={{ marginLeft: 6, color: T.text3, fontWeight: 700 }}>{n}/6</span>
                {listo && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 12 }}>{ingles(`Do you like ${dTema.en}?`, dTema.color)}</div>
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>
          {dTema.tipo === "ing" ? `«${dTema.en}» es verbo + -ing (${dTema.es}).` : `«${dTema.en}» es un sustantivo (${dTema.es}).`} Después de like va un sustantivo o un verbo en
          -ing.
        </div>

        {sub("2 · Elige a un compañero (o tócalo en la escena)")}
        <div className="go-opts">
          {COMPANEROS.map((id) => {
            const p = PERSONAS[id];
            const resp = respuestas[clave(temaSel, id)] !== undefined;
            const g = GUSTOS[id][temaSel].g;
            return (
              <button
                key={id}
                className="go-opt go-persona"
                data-on={sel === id}
                onClick={() => elegirPersona(id)}
                aria-label={`Compañero: ${p.nombre}`}
                style={{ ["--goc" as string]: modoCol, background: sel === id ? `${modoCol}22` : "transparent" }}
              >
                <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: p.camisa, marginRight: 7 }} />
                {p.nombre}
                {resp && <i className={`fa-solid ${GRADO_DEF[g].icono}`} style={{ marginLeft: 7, color: GRADO_DEF[g].col }} />}
              </button>
            );
          })}
        </div>

        {sub(`3 · Pregúntale a ${PERSONAS[sel].nombre}`)}
        <Entrada
          label={`Tu pregunta para ${PERSONAS[sel].nombre}`}
          value={pregTxt}
          set={(v) => {
            setPregTxt(v);
            setRevPreg(null);
          }}
          onEnter={preguntar}
          placeholder="Do you like …?"
          estado={revPreg}
          boton="Preguntar"
          icono="fa-comment"
          clase="go-preguntar"
          col={modoCol}
        />
        {revPreg && revPreg.ok && ultima && burbuja && (
          <div style={{ marginTop: 10 }}>
            {ingles(
              burbuja,
              GRADO_DEF[GUSTOS[ultima.persona][temaSel].g].col,
              <span style={{ display: "block", fontSize: 11.5, color: T.text3, fontWeight: 700, marginTop: 3 }}>— {PERSONAS[ultima.persona].nombre}</span>,
            )}
          </div>
        )}
        {revPreg && <ListaAvisos avisos={revPreg.avisos} />}
        {revPreg?.ok && !encuestaCompleta && (
          <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>
            Ahora elegimos a {PERSONAS[sel].nombre}: puedes volver a enviar tu pregunta (sin su nombre, o con el nombre correcto).
          </div>
        )}

        <div style={{ marginTop: 12, padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 6 }}>HOJA DE LA ENCUESTA · {respondidos.length}/6</div>
          {respondidos.length === 0 ? (
            <div style={{ fontSize: 12, color: T.text3 }}>Todavía no le has preguntado a nadie.</div>
          ) : (
            <div style={{ display: "grid", gap: 4 }}>
              {respondidos.map((p) => {
                const g = GUSTOS[p][temaSel].g;
                return (
                  <div key={p} style={{ fontSize: 12, color: T.text2, display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${GRADO_DEF[g].icono}`} style={{ color: GRADO_DEF[g].col, marginTop: 2 }} />
                    <span>
                      <strong style={{ color: "#fff" }}>{PERSONAS[p].nombre}:</strong>{" "}
                      <span lang="en">«{respuestaEncuesta(p, temaSel, respuestas[clave(temaSel, p)] ?? "do")}»</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ opacity: encuestaCompleta ? 1 : 0.4, pointerEvents: encuestaCompleta ? "auto" : "none" }}>
          {sub("4 · Escribe las conclusiones (3.ª persona)")}
          <div style={{ fontSize: 12, color: T.text2, marginBottom: 6, lineHeight: 1.5 }}>
            {encuestaCompleta
              ? "Con la gráfica: primero cuántos (plural sin -s; con uno, -s) y luego una persona con -s o doesn't."
              : "Pregunta a los seis para desbloquear las conclusiones."}
          </div>
          <Entrada
            label="Conclusión con número"
            value={numTxt}
            set={(v) => {
              setNumTxt(v);
              setRevNum(null);
            }}
            onEnter={comprobarNum}
            placeholder="Three students like …"
            estado={revNum}
            disabled={numHecho}
            boton="Comprobar"
            icono="fa-chart-column"
            clase="go-num"
            col={modoCol}
          />
          {revNum && <ListaAvisos avisos={revNum.avisos} />}
          {numHecho &&
            nota(
              <>
                ¡Correcto! Modelo: «<span lang="en">{modeloNumero(temaSel)}</span>»
              </>,
              OK,
              "fa-circle-check",
            )}
          <div style={{ height: 10 }} />
          <Entrada
            label="Conclusión sobre una persona"
            value={perTxt}
            set={(v) => {
              setPerTxt(v);
              setRevPer(null);
            }}
            onEnter={comprobarPer}
            placeholder="Jorge doesn't like … / Ana loves …"
            estado={revPer}
            disabled={perHecho}
            boton="Comprobar"
            icono="fa-user-pen"
            clase="go-per"
            col={modoCol}
          />
          {revPer && <ListaAvisos avisos={revPer.avisos} />}
          {perHecho && nota(<>¡Correcto! En 3.ª persona el verbo lleva -s (likes, loves, hates) y la negativa es doesn&apos;t + like.</>, OK, "fa-circle-check")}
          {numHecho && perHecho && (
            <div className="go-opts" style={{ marginTop: 8 }}>
              <BotonEscuchar texto={`${modeloNumero(temaSel)} ${modeloPersona(COMPANEROS.find((p) => GUSTOS[p][temaSel].g <= 1) ?? "ana", temaSel)}`} col={OK} />
              {completas.length < ENCUESTAS_META && (
                <span style={{ fontSize: 12, color: T.text2 }}>
                  <i className="fa-solid fa-forward" style={{ marginRight: 6, color: modoCol }} />
                  Elige otro puesto arriba para tu segunda encuesta.
                </span>
              )}
            </div>
          )}
        </div>
        {nota(
          "Grados: love, really like y like cuentan como gusto (barra verde); don't mind es neutro (amarilla); don't like y hate, barra roja. Se aceptan mayúsculas o minúsculas, don't o do not, y números con letra o con cifra.",
          T.text3,
        )}
      </>
    );
  } else if (modo === "mesas") {
    const pSel = PERSONAS[selMesa];
    control = (
      <>
        <div className="go-opts">
          {ESCENARIOS.map((e, i) => (
            <button
              key={e.id}
              className="go-opt go-esc"
              data-on={i === escIdx}
              onClick={() => irEscenario(i)}
              style={{ ["--goc" as string]: modoCol, background: i === escIdx ? `${modoCol}1f` : "transparent" }}
            >
              <i className={`fa-solid ${i === 0 ? "fa-chair" : "fa-calendar-day"}`} style={{ marginRight: 7 }} />
              <span lang="en">{e.titulo}</span>
              <span style={{ marginLeft: 6, color: T.text3, fontWeight: 700 }}>{e.es}</span>
              {escOk.has(i) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>{ingles(esc.consigna, modoCol)}</div>

        {sub("1 · Elige a un amigo y lee su perfil")}
        <div className="go-opts">
          {COMPANEROS.map((id) => {
            const p = PERSONAS[id];
            const tm = asi[id];
            return (
              <button
                key={id}
                className="go-opt go-amigo"
                data-on={selMesa === id}
                onClick={() => elegirMesa(id)}
                aria-label={`Amigo: ${p.nombre}`}
                style={{ ["--goc" as string]: modoCol, background: selMesa === id ? `${modoCol}22` : "transparent" }}
              >
                <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: p.camisa, marginRight: 7 }} />
                {p.nombre}
                {tm && <i className={`fa-solid ${TEMA_DEF[tm].icono}`} style={{ marginLeft: 7, color: TEMA_DEF[tm].color }} />}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, background: "#fffdf5", border: `3px solid ${pSel.camisa}` }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#475569",
              textTransform: "uppercase",
              marginBottom: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>
              <i className="fa-solid fa-id-card" style={{ marginRight: 6, color: pSel.camisa }} />
              Profile · {pSel.nombre}
            </span>
            <BotonEscuchar texto={perfil(selMesa, esc)} col="#334155" />
          </div>
          <div lang="en" style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", lineHeight: 1.5, fontFamily: "ui-rounded, system-ui, sans-serif" }}>
            {perfil(selMesa, esc)}
          </div>
        </div>

        {sub(`2 · Siéntalo en una mesa (${CUPO_MESA} lugares cada una)`)}
        <div style={{ display: "grid", gap: 8 }}>
          {esc.temas.map((tm) => {
            const d = TEMA_DEF[tm];
            const aqui = COMPANEROS.filter((p) => asi[p] === tm);
            const llena = aqui.length >= CUPO_MESA && !aqui.includes(selMesa);
            return (
              <div
                key={tm}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: `1px solid ${d.color}55`,
                  background: `${d.color}0d`,
                }}
              >
                <span style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, minWidth: 150 }}>
                  <i className={`fa-solid ${d.icono}`} style={{ marginRight: 7, color: d.color }} />
                  <span lang="en">{esc.mesa[tm]}</span>
                </span>
                <span style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
                  {aqui.map((p) => {
                    const r = resMesas?.find((x) => x.persona === p);
                    const col = r ? GRADO_DEF[r.g].col : "#fff";
                    return (
                      <button
                        key={p}
                        className="go-pill go-sentado"
                        onClick={() => levantar(p)}
                        disabled={escResuelto}
                        title="Levantar de la mesa"
                        style={{ ["--goc" as string]: r ? col : "rgba(255,255,255,0.3)" }}
                      >
                        {r && <i className={`fa-solid ${GRADO_DEF[r.g].icono}`} style={{ marginRight: 6, color: col }} />}
                        {PERSONAS[p].nombre}
                        {!escResuelto && <i className="fa-solid fa-xmark" style={{ marginLeft: 6, opacity: 0.6 }} />}
                      </button>
                    );
                  })}
                  {Array.from({ length: Math.max(0, CUPO_MESA - aqui.length) }, (_, k) => (
                    <span key={k} className="go-pill" style={{ ["--goc" as string]: "rgba(255,255,255,0.14)", color: T.text3 }}>
                      libre
                    </span>
                  ))}
                </span>
                <button
                  aria-label={`Sentar a ${pSel.nombre} en ${esc.mesa[tm]}`}
                  className="go-opt go-sentar"
                  data-on="true"
                  onClick={() => sentar(tm)}
                  disabled={escResuelto || asi[selMesa] === tm || llena}
                  style={{ ["--goc" as string]: modoCol }}
                >
                  <i className="fa-solid fa-chair" style={{ marginRight: 7 }} />
                  Sentar a {pSel.nombre}
                </button>
              </div>
            );
          })}
        </div>
        {avisoMesa && nota(avisoMesa, WARN, "fa-lightbulb")}
        <div className="go-opts" style={{ marginTop: 10 }}>
          <button
            className="go-opt go-comprobar-mesas"
            data-on="true"
            onClick={comprobarMesas}
            disabled={sentados < COMPANEROS.length || escResuelto}
            style={{ ["--goc" as string]: modoCol, background: `${modoCol}1f` }}
          >
            <i className="fa-solid fa-face-smile" style={{ marginRight: 8 }} />
            {sentados < COMPANEROS.length ? `Faltan ${COMPANEROS.length - sentados} por sentar` : "¿Todos contentos? Comprobar"}
          </button>
        </div>
        {resMesas && (
          <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
            {resMesas.map((r) => (
              <div key={r.persona} style={{ display: "flex", gap: 8, fontSize: 12, lineHeight: 1.45, color: r.feliz ? T.text2 : WARN }}>
                <i className={`fa-solid ${GRADO_DEF[r.g].icono}`} style={{ marginTop: 3, color: GRADO_DEF[r.g].col }} />
                <span>{r.texto}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ opacity: escResuelto ? 1 : 0.4, pointerEvents: escResuelto ? "auto" : "none" }}>
          {sub("3 · Explica con because por qué a un amigo le gusta su lugar")}
          <Entrada
            label="Tu explicación con because"
            value={porqueTxt}
            set={(v) => {
              setPorqueTxt(v);
              setRevPorque(null);
            }}
            onEnter={comprobarPorque}
            placeholder={escResuelto ? "Paola loves drawing because it is relaxing." : "Primero sienta a todos contentos"}
            estado={revPorque}
            disabled={porqueOk.has(escIdx)}
            boton="Comprobar"
            icono="fa-check"
            clase="go-porque"
            col={modoCol}
          />
          {revPorque && <ListaAvisos avisos={revPorque.avisos} />}
          {porqueOk.has(escIdx) && nota("¡Correcto! Nombre + verbo con -s + tema + because + it is + razón del perfil.", OK, "fa-circle-check")}
          {porqueOk.has(escIdx) && escIdx < ESCENARIOS.length - 1 && (
            <div className="go-opts" style={{ marginTop: 8 }}>
              <button className="go-opt go-sig" data-on="true" onClick={() => irEscenario(escIdx + 1)} style={{ ["--goc" as string]: modoCol }}>
                Siguiente escenario
                <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
              </button>
            </div>
          )}
        </div>
        {nota(
          "Contento = like, really like o love. «I don't mind» (no me molesta) es neutro: no basta para pasarla bien. En la explicación usa la razón que el amigo da en su perfil.",
          T.text3,
        )}
      </>
    );
  } else {
    const tj = turno.tarjeta;
    control = (
      <>
        <div className="go-opts">
          {TURNOS.map((tu, i) => (
            <button
              key={tu.id}
              className="go-opt go-turno"
              data-on={i === turnoIdx}
              onClick={() => irTurno(i)}
              aria-label={`Turno ${i + 1}`}
              style={{ ["--goc" as string]: modoCol, background: i === turnoIdx ? `${modoCol}1f` : "transparent" }}
            >
              <i className={`fa-solid ${TEMA_DEF[tu.tema].icono}`} style={{ marginRight: 6, color: TEMA_DEF[tu.tema].color }} />
              {i + 1} · {PERSONAS[tu.quien].nombre}
              {turnosOk.has(tu.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        {sub(`1 · Lee lo que dice ${compa.nombre}`)}
        {ingles(
          turno.linea,
          GRADO_DEF[turno.gradoCompa].col,
          <span style={{ display: "block", fontSize: 11.5, color: T.text3, fontWeight: 700, marginTop: 3 }}>— {compa.nombre}</span>,
        )}
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>
          {turno.tipo === "do"
            ? "Pregunta de sí o no: puedes empezar con Yes, I do. / No, I don't."
            : turno.tipo === "think"
              ? "What do you think of…? pide tu opinión: I like it / I don't mind it / I don't like it…"
              : "What's your favorite…? pide tu favorito: My favorite … is …"}
        </div>

        {sub("2 · Tu tarjeta de papel")}
        <div className="go-tarjeta">
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.1em", color: "#92400e", textTransform: "uppercase", marginBottom: 6 }}>
            <i className="fa-solid fa-note-sticky" style={{ marginRight: 6 }} />
            Tú, en esta conversación
          </div>
          {tj.grado !== null ? (
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>
              <i className={`fa-solid ${GRADO_DEF[tj.grado].icono}`} style={{ marginRight: 7, color: GRADO_DEF[tj.grado].col }} />
              {GRADO_DEF[tj.grado].tu.charAt(0).toUpperCase() + GRADO_DEF[tj.grado].tu.slice(1)} {TEMA_DEF[turno.tema].es}.
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>
              <i className="fa-solid fa-trophy" style={{ marginRight: 7, color: "#d97706" }} />
              Tu favorito: {tj.favorito?.es}.
            </div>
          )}
          {tj.prefiere && (
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937", marginTop: 4 }}>
              <i className="fa-solid fa-hand-point-right" style={{ marginRight: 7, color: "#2563eb" }} />
              Prefieres {tj.prefiere.es}
              {tj.requierePrefer ? " (dilo)." : " (opcional)."}
            </div>
          )}
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937", marginTop: 4 }}>
            <i className="fa-solid fa-comment-dots" style={{ marginRight: 7, color: "#059669" }} />
            Tu razón: es {tj.razonEs}.
          </div>
          {turno.diferente && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9a3412", marginTop: 6 }}>
              <i className="fa-solid fa-heart" style={{ marginRight: 7 }} />
              Tu gusto es distinto al de {compa.nombre}: reacciona con empatía.
            </div>
          )}
        </div>
        <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>REACCIONES AMABLES</div>
          <div className="go-opts">
            {EMPATIA_CHIPS.map((c) => (
              <span key={c} className="go-pill" lang="en" style={{ ["--goc" as string]: "#f472b688" }}>
                {c}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>RAZONES (because it is…)</div>
          <div className="go-opts">
            {ADJETIVOS.map((a) => (
              <span key={a.en} className="go-pill" style={{ ["--goc" as string]: a.pos ? "#34d39966" : "#fb923c66" }}>
                <span lang="en">{a.en}</span>
                <span style={{ color: T.text3, fontWeight: 600, marginLeft: 5 }}>{a.es}</span>
              </span>
            ))}
          </div>
        </div>

        {sub(`3 · Respóndele a ${compa.nombre} en inglés`)}
        <textarea
          className="go-area"
          aria-label={`Tu respuesta para ${compa.nombre}`}
          value={respTxt}
          lang="en"
          onChange={(e) => {
            setRespTxt(e.target.value);
            if (revTurno && !revTurno.ok) setRevTurno(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!turnoHecho) responderTurno();
            }
          }}
          disabled={turnoHecho && !revTurno}
          placeholder={turnoHecho ? "¡Ya respondiste! Pasa al siguiente turno." : "That's cool! … because it is …"}
          rows={3}
          style={{ ["--goc" as string]: modoCol }}
        />
        <div className="go-opts" style={{ marginTop: 8 }}>
          <button
            className="go-opt go-responder"
            data-on="true"
            onClick={responderTurno}
            disabled={turnoHecho || !respTxt.trim()}
            style={{ ["--goc" as string]: modoCol, background: `${modoCol}1f` }}
          >
            <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }} />
            Responder
          </button>
        </div>
        {revTurno && <ListaAvisos avisos={revTurno.avisos} />}
        {turnoHecho && (
          <>
            {nota(<>¡Bien dicho! Una versión modelo:</>, OK, "fa-circle-check")}
            <div style={{ marginTop: 6 }}>{ingles(turno.modelo, OK)}</div>
            {turnoIdx < TURNOS.length - 1 && (
              <div className="go-opts" style={{ marginTop: 8 }}>
                <button className="go-opt go-sig" data-on="true" onClick={() => irTurno(turnoIdx + 1)} style={{ ["--goc" as string]: modoCol }}>
                  Siguiente compañero
                  <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                </button>
              </div>
            )}
          </>
        )}
        {nota(
          "Empatía (A1): «That's fine, everyone is different». Puedes no compartir un gusto: reacciona con amabilidad, di lo que tú prefieres y por qué, sin palabras que desprecien (stupid, weird, gross). Se aceptan mayúsculas o minúsculas, it's o it is, don't o do not.",
          T.text3,
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes goPulse { 0%,100%{ box-shadow:0 0 0 0 var(--god); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .go-live-dot { animation: goPulse 1.6s ease-in-out infinite; }
        @keyframes goShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }
        @media (prefers-reduced-motion: reduce){ .go-live-dot { animation:none; } .go-in[data-e="mal"] { animation:none !important; } }
        .go-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .go-grid { grid-template-columns: 1fr; } }
        .go-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .go-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .go-icobtn:hover { background:rgba(255,255,255,0.12); }
        .go-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .go-tab { cursor:pointer; border:1px solid var(--goc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .go-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .go-tab:hover { background:rgba(255,255,255,0.06); }
        .go-opts { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }
        .go-grados { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:7px; }
        @media (max-width: 640px){ .go-grados { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        .go-opt { cursor:pointer; border:1px solid var(--goc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .go-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .go-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .go-opt:disabled { cursor:default; opacity:0.5; }
        .go-escuchar { cursor:pointer; border:1px solid var(--goc); border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; color:#fff; background:rgba(4,10,22,0.45); transition:all .15s; white-space:nowrap; }
        .go-escuchar:hover { background:rgba(255,255,255,0.08); }
        .go-pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; border:1px solid var(--goc); color:#fff; font-size:11.5px; font-weight:800; background:transparent; }
        button.go-pill { cursor:pointer; }
        button.go-pill:disabled { cursor:default; }
        .go-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:700; padding:8px 11px; font-family:inherit; outline:none; transition:all .15s; }
        .go-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .go-in:disabled { opacity:0.8; }
        .go-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .go-in[data-e="mal"] { border-color:${WARN}; background:${WARN}14; animation:goShake .35s; }
        .go-area { width:100%; box-sizing:border-box; border-radius:12px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:14px; line-height:1.55; padding:12px 14px; font-family:inherit; outline:none; resize:vertical; }
        .go-area:focus { border-color:var(--goc); }
        .go-tarjeta { padding:12px 14px; border-radius:6px 16px 8px 14px; background:linear-gradient(170deg,#fef9c3 0%,#fde68a 100%); box-shadow:0 10px 24px -14px #000; transform:rotate(-0.6deg); }
        .go-opt:focus-visible, .go-tab:focus-visible, .go-icobtn:focus-visible, .go-escuchar:focus-visible, button.go-pill:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .go-bottom { grid-template-columns: 1fr !important; } }
        .go-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .go-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .go-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .go-drawer[data-open="true"] { transform:translateX(0); }
        .go-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .go-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .go-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .go-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .go-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .go-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        .go-guia summary { cursor:pointer; color:${accent}; font-size:11.5px; font-weight:800; }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="go-tabs">
          {MODOS.map((m) => {
            const dd = MODOS_DEF[m];
            const col = `#${dd.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="go-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--goc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }} lang="en">
                  {dd.etq}
                </div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{dd.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="go-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 700px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <GustosScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                temaSel={temaSel}
                seleccion={sel}
                ultima={ultima}
                burbuja={burbuja}
                respondidos={respondidos}
                grafica={grafica}
                onElegir={elegirPersona}
                escIdx={escIdx}
                asientos={asi}
                revisado={revisado}
                selMesa={selMesa}
                onElegirMesa={elegirMesa}
                turnoIdx={turnoIdx}
                respuestaTurno={escenaRespuesta}
                reaccion={reaccion}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px 8px 12px",
                  borderRadius: 999,
                  background: "rgba(4,10,22,0.74)",
                  border: `1px solid ${modoCol}66`,
                  backdropFilter: "blur(10px)",
                  maxWidth: "100%",
                }}
              >
                <span className="go-live-dot" style={{ ["--god" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#fff",
                    fontFamily: "ui-monospace, monospace",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {chipVivo}
                </span>
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                gap: 2,
                padding: 4,
                borderRadius: 12,
                background: "rgba(4,10,22,0.74)",
                border: `1px solid ${T.line}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <button className="go-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button
                className="go-icobtn"
                data-on={sonido}
                onClick={toggleSonido}
                title={sonido ? "Silenciar" : "Activar sonido"}
                aria-label={sonido ? "Silenciar" : "Activar sonido"}
              >
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="go-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "30px 132px 14px 18px",
                background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                <span lang="en">{def.etq}</span> — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            <button className="go-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — <span lang="en">{def.etq}</span>
            </Eyebrow>
            <div style={{ marginTop: 4 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#04121f",
                  background: accent,
                }}
              >
                <i className="fa-solid fa-store" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }} lang="en">
                What do you like? Why?
              </div>
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
                <div key={i} style={{ fontSize: 12, color: i === 1 || i === 2 ? "#fff" : T.text2, lineHeight: 1.55, whiteSpace: "pre-line" }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>COMPRENSIÓN</div>
            <div style={{ display: "grid", gap: 8 }}>
              {PREGUNTAS_A1.map((x) => (
                <details key={x.pregunta} className="go-guia">
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
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 11,
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    borderRadius: 11,
                    background: "rgba(4,10,22,0.4)",
                    border: `1px solid ${accent}25`,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 900,
                      color: "#04121f",
                      background: accent,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="go-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
            Hechos (verdadero o falso, A5)
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
            {HECHOS.map((h, i) => (
              <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                <strong style={{ color: h.respuesta ? OK : WARN }}>{h.respuesta ? "Verdadero" : "Falso"}:</strong> «{h.enunciado}» {h.retro}
              </li>
            ))}
            <li style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
              <strong style={{ color: OK }}>Verdadero:</strong> «{VIDEO_A8.vf.pregunta}» (video A8). Y de sus opciones, la que expresa una preferencia es «
              <span lang="en">{VIDEO_A8.opcion.opciones[VIDEO_A8.opcion.correcta]}</span>».
            </li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A6)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }} lang="en">
                    {gi.termino}.{" "}
                  </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11.5, color: "#fff", lineHeight: 1.4, marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span lang="en">
                      <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                      {gi.ejemplo}
                    </span>
                    <BotonEscuchar texto={gi.ejemplo} col={accent} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A6}
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
          Son <strong>verbatim</strong> del material de la plataforma: la lectura A1 con sus preguntas (sin su recuadro sobre la ENDUTIH, que no trata de este tema), el diálogo A2,
          la consigna, pistas y criterios de A3, el quiz A4, los hechos A5, el glosario A6, los criterios de A7, las preguntas del video A8 y las oraciones de la tarjeta de
          estrellas (A1, A2, A4 y A6). En el diálogo A2 se acepta además «do not» por «don&apos;t»; en el último hueco NO se acepta «yes», que la actividad declara como alternativa
          pero produce «Yes, I yes!», que no es correcto. Son <strong>ilustrativos</strong>: la Feria de Gustos de la Preparatoria Las Jacarandas, los seis compañeros (nombres
          ficticios) con sus gustos, razones y perfiles, las mesas, los diálogos y las tarjetas de papel. La revisión de lo que escribes es orientativa y tolera mayúsculas, signos
          y formas equivalentes (don&apos;t / do not, it&apos;s / it is, números con letra o cifra); marca en azul las formas correctas pero no preferidas en A1 (like to play,
          favourite, football). Fuente: {FUENTE}
        </span>
      </div>

      <GradoCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard
        quiz={QUIZ_A4}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizOk}
        onAprobado={() => setQuizOk(true)}
        playSfx={sfx}
        playPick={blip}
        mensajeAprobado="¡Aprobado! Ya preguntas y respondes sobre gustos con la forma correcta."
      />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el diálogo (A2)
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

      <TuTurnoCard accent={accent} logrado={a3Ok} onLogrado={() => setA3Ok(true)} playSfx={sfx} />

      <div className="go-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="go-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="go-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="go-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="go-drawer-body">
          <FichaTeorica data={GUSTOS_OPINIONES_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
