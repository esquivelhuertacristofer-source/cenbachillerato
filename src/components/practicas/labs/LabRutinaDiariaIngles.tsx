"use client";

/**
 * Laboratorio 3D — "Daily routines: el día de Ana".
 * Práctica anclada a IN-II-P01-A2 (fill_blanks «My Daily Routine») de la
 * progresión 1 de Inglés II: «Describe rutinas diarias y actividades
 * cotidianas en casa, la escuela o la comunidad». El marco teórico es la
 * lectura A1, los hechos salen del verdadero/falso A4, el glosario del A5, las
 * estrellas de la clasificación A10 y «Tu turno» de la escritura A3.
 *
 * Tres modos:
 *  (1) Build a day — ordenar las acciones del día en una línea de tiempo y
 *      narrarlas escribiendo el verbo en Present Simple mientras Ana las vive
 *      en la maqueta de su barrio.
 *  (2) What time…? — elegir do/does, poner el reloj según la respuesta y decir
 *      con palabras la hora que marca.
 *  (3) How often? — contar en el calendario semanal y armar con fichas la
 *      oración con el adverbio de frecuencia en su lugar.
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
import { RUTINA_DIARIA_INGLES_FICHA } from "./rutina-diaria-ingles-ficha";
import type { VistaRutina } from "./RutinaDiariaInglesScene";
import {
  type Modo,
  type Ficha,
  type Adverbio,
  type Tiempo,
  type RevisionHora,
  MODOS,
  MODOS_DEF,
  mulberry32,
  baraja,
  estrellasPorErrores,
  horaDigital,
  horaEnIngles,
  hora12Texto,
  parteDelDia,
  explicaHora,
  revisaHoraEscrita,
  ACCIONES,
  oracionCompleta,
  revisaVerbo,
  PREGUNTAS_HORA,
  DECIR_HORA,
  HABITOS,
  ESCALA,
  ADVERBIOS,
  FICHAS_HABITO,
  cuentaDias,
  porcentaje,
  adverbiosAceptados,
  textoFicha,
  oracionFichas,
  revisaFrecuencia,
  CLASIFICA_A10,
  CATEGORIAS_A10,
  INSTRUCCIONES_A10,
  rondaA10,
  A3,
  analizaA3,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  QUIZ_A4,
  GLOSARIO,
  ACTIVIDAD_A5,
  POSICION_IN3,
  HUECOS_A2,
  HUECOS_A6,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
} from "./rutina-diaria-ingles-data";

const RutinaScene = dynamic(() => import("./RutinaDiariaInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-sun fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el barrio de Ana en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-rutina-diaria-ingles-reto";
const WARN = "#FF8A3C";
const N = ACCIONES.length;
const TARJETAS = baraja(ACCIONES, mulberry32(5));
const RONDA_INICIAL = rondaA10(mulberry32(7));
const T_AVANZAR = 1500;

function BotonEscuchar({ texto, col }: { texto: string; col: string }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button className="rd-escuchar" onClick={() => hablarLab(texto)} title="Escuchar en inglés" aria-label={`Escuchar: ${texto}`} style={{ ["--rdc" as string]: col }}>
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );
}

/* ── Tarjeta de estrellas: A10 Present Simple o Present Continuous ────── */
function TiempoCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = CLASIFICA_A10[ronda[pos] ?? 0]!;

  const responder = (t: Tiempo) => {
    if (resuelto !== null) return;
    const ok = t === actual.categoria;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`Es ${actual.categoria}: ${actual.explicacion}`);
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
    setRonda(rondaA10(Math.random));
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
          Present Simple or Present Continuous? (A10)
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>{INSTRUCCIONES_A10}</div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Oración {pos + 1} de {ronda.length} · ¿rutina o algo que pasa ahora?
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <div style={{ fontSize: 16, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>«{actual.texto}»</div>
            <BotonEscuchar texto={actual.texto} col={accent} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIAS_A10.map((c, k) => (
              <button key={c.nombre} className="rd-opt rd-a10" data-on="true" onClick={() => responder(c.nombre)} style={{ ["--rdc" as string]: k === 0 ? OK : "#38bdf8", textAlign: "left" }}>
                <div style={{ fontSize: 12.5 }}>
                  <i className={`fa-solid ${k === 0 ? "fa-repeat" : "fa-person-running"}`} style={{ marginRight: 8 }} />
                  {c.nombre}
                </div>
                <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 700, marginTop: 3 }}>{c.descripcion}</div>
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

/* ── Tu turno: escritura A3 con revisión orientativa ──────────────────── */
function TuTurnoCard({ accent, logrado, onLogrado, playSfx }: { accent: string; logrado: boolean; onLogrado: () => void; playSfx?: (ok: boolean) => void }) {
  const [texto, setTexto] = useState("");
  const [revisado, setRevisado] = useState(false);
  const an = analizaA3(texto);
  const criterios: { t: string; ok: boolean }[] = [
    { t: `Entre ${A3.min} y ${A3.max} palabras (llevas ${an.palabras})`, ok: an.palabras >= A3.min && an.palabras <= A3.max },
    { t: `La hora de al menos 6 actividades con «at» (at 6:30, at half past seven) · llevas ${an.horas}`, ok: an.horas >= 6 },
    { t: `Al menos 2 adverbios de frecuencia (always, usually, sometimes, never…) · llevas ${an.adverbios}`, ok: an.adverbios >= 2 },
    { t: an.erroresI.length ? `Con «I» el verbo va sin -s: revisa «${an.erroresI.join("», «")}»` : "Con «I» el verbo va sin -s (no se detectaron errores de «I + -s»)", ok: an.erroresI.length === 0 },
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
        Tu turno: Writing About My Daily Routine (A3)
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
        className="rd-area"
        aria-label="Tu rutina en inglés"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setRevisado(false);
        }}
        placeholder="I wake up at 6:30. I always have breakfast with my family…"
        rows={6}
        style={{ ["--rdc" as string]: accent }}
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
        <button className="rd-opt rd-a3" data-on="true" onClick={revisar} style={{ ["--rdc" as string]: accent }}>
          <i className="fa-solid fa-spell-check" style={{ marginRight: 8 }} />
          Revisar mi texto
        </button>
        {revisado && <span style={{ fontSize: 12, color: todo ? OK : WARN, fontWeight: 800 }}>{todo ? "¡Listo! Tu texto cumple los criterios que se pueden revisar automáticamente." : "Todavía falta algo: revisa los puntos en naranja."}</span>}
      </div>
      <div style={{ fontSize: 11, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
        Criterios de la actividad: {A3.criterios.join(" · ")}. La revisión automática es orientativa: cuenta palabras, horas y adverbios, y detecta «I + verbo con -s»; tu docente evalúa la claridad y el contenido.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabRutinaDiariaIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("dia");

  // ── Build a day
  const [orden, setOrden] = useState<string[]>([]);
  const [avisoOrden, setAvisoOrden] = useState<string | null>(null);
  const [paso, setPaso] = useState(-1);
  const [escritos, setEscritos] = useState<string[]>([]);
  const [revs, setRevs] = useState<(string | null)[] | null>(null);
  const [burbuja, setBurbuja] = useState<string | null>(null);
  const [avanzando, setAvanzando] = useState(false);
  const [logroOrden, setLogroOrden] = useState(false);
  const [logroNarrado, setLogroNarrado] = useState(false);
  const genDia = useRef(0);

  // ── What time…?
  const [subHora, setSubHora] = useState<"preguntar" | "decir">("preguntar");
  const [qIdx, setQIdx] = useState(0);
  const [avisoAux, setAvisoAux] = useState<string | null>(null);
  const [auxOk, setAuxOk] = useState<Set<string>>(() => new Set());
  const [reloj, setReloj] = useState(0);
  const [pm, setPm] = useState(false);
  const [relojRes, setRelojRes] = useState<{ ok: boolean; msg: string } | null>(null);
  const [relojOk, setRelojOk] = useState<Set<string>>(() => new Set());
  const [dIdx, setDIdx] = useState(0);
  const [horaTxt, setHoraTxt] = useState("");
  const [horaRes, setHoraRes] = useState<RevisionHora | null>(null);
  const [decirOk, setDecirOk] = useState<Set<string>>(() => new Set());
  const [usoTo, setUsoTo] = useState(false);

  // ── How often?
  const [habIdx, setHabIdx] = useState(0);
  const [contados, setContados] = useState<Set<string>>(() => new Set());
  const [avisoConteo, setAvisoConteo] = useState<string | null>(null);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [revFrec, setRevFrec] = useState<string[] | null>(null);
  const [frecOk, setFrecOk] = useState<Set<string>>(() => new Set());
  const [beOk, setBeOk] = useState(false);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [textoA2, setTextoA2] = useState(false);
  const [quizA4, setQuizA4] = useState(false);
  const [textoA6, setTextoA6] = useState(false);
  const [a3Ok, setA3Ok] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
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
      callarLab();
    };
  }, []);

  const despues = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
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

  /* ── Build a day ───────────────────────────────────────────────────── */
  const accion = paso >= 0 && paso < N ? ACCIONES[paso]! : null;

  const tocarTarjeta = (id: string) => {
    if (orden.includes(id) || orden.length >= N) return;
    const esperado = ACCIONES[orden.length]!;
    if (id !== esperado.id) {
      const tocada = ACCIONES.find((a) => a.id === id)!;
      const idxTocada = ACCIONES.indexOf(tocada);
      setAvisoOrden(
        `«${tocada.tarjeta}» todavía no: en la lectura A1 esa acción va en el lugar ${idxTocada + 1}. ${orden.length === 0 ? "Empieza por lo primero que hace al despertar." : `Después de «${ACCIONES[orden.length - 1]!.tarjeta}» viene: ${esperado.es.replace("(Ana habla) ", "")}`}`,
      );
      sfx(false);
      return;
    }
    setAvisoOrden(null);
    const nx = [...orden, id];
    setOrden(nx);
    blip();
    if (nx.length === N) {
      setLogroOrden(true);
      sfx(true);
      setPaso(0);
      setEscritos([]);
      setRevs(null);
    }
  };

  const escribirVerbo = (k: number, v: string) => {
    setEscritos((xs) => {
      const nx = [...xs];
      nx[k] = v;
      return nx;
    });
    if (revs) setRevs((rs) => (rs ? rs.map((r, i) => (i === k ? null : r)) : rs));
  };

  const comprobarVerbos = () => {
    if (!accion || avanzando) return;
    const r = accion.huecos.map((h, k) => revisaVerbo(accion.sujeto, h.base, escritos[k] ?? ""));
    const ok = r.every((x) => x === null);
    setRevs(r);
    sfx(ok);
    if (!ok) return;
    setBurbuja(oracionCompleta(accion));
    setAvanzando(true);
    const gen = genDia.current;
    const siguiente = paso + 1;
    despues(T_AVANZAR, () => {
      if (genDia.current !== gen) return;
      setPaso(siguiente);
      setEscritos([]);
      setRevs(null);
      setBurbuja(null);
      setAvanzando(false);
      if (siguiente >= N) setLogroNarrado(true);
    });
  };

  const reiniciarDia = () => {
    genDia.current += 1;
    setOrden([]);
    setAvisoOrden(null);
    setPaso(-1);
    setEscritos([]);
    setRevs(null);
    setBurbuja(null);
    setAvanzando(false);
  };

  /* ── What time…? ───────────────────────────────────────────────────── */
  const q = PREGUNTAS_HORA[qIdx]!;
  const auxResuelto = auxOk.has(q.id);
  const preguntaTxt = `${q.partes[0]}${auxResuelto ? q.aux : "___"}${q.partes[1]}`;
  const d = DECIR_HORA[dIdx]!;

  const elegirAux = (aux: "do" | "does") => {
    if (auxResuelto) return;
    if (aux === q.aux) {
      setAuxOk((s) => new Set(s).add(q.id));
      setAvisoAux(null);
      sfx(true);
    } else {
      setAvisoAux(`«${aux}» no va aquí. ${q.porque}`);
      sfx(false);
    }
  };
  const irPregunta = (i: number) => {
    setQIdx(i);
    setAvisoAux(null);
    setRelojRes(null);
    blip();
  };
  const moverReloj = (delta: number) => {
    setReloj((m) => (((m + delta) % 720) + 720) % 720);
    setRelojRes(null);
  };
  const alArrastrar = useCallback((m: number) => {
    setReloj((prev) => {
      const h = Math.floor(prev / 60);
      const pmin = prev % 60;
      let nh = h;
      if (pmin >= 45 && m <= 15) nh = (h + 1) % 12;
      else if (pmin <= 15 && m >= 45) nh = (h + 11) % 12;
      return nh * 60 + m;
    });
    setRelojRes(null);
  }, []);
  const comprobarReloj = () => {
    const horaBien = reloj === q.min % 720;
    const pmBien = pm === q.min >= 720;
    const frase = horaEnIngles(q.min);
    if (horaBien && pmBien) {
      setRelojOk((s) => new Set(s).add(q.id));
      setRelojRes({ ok: true, msg: `¡Bien! «${frase}» = ${horaDigital(q.min)} (${parteDelDia(q.min)}). ${explicaHora(q.min)}` });
      sfx(true);
    } else if (horaBien) {
      setRelojRes({ ok: false, msg: `Las manecillas están bien, pero revisa a.m. / p.m.: es ${parteDelDia(q.min)}. a.m. = de la medianoche al mediodía; p.m. = del mediodía a la medianoche.` });
      sfx(false);
    } else {
      setRelojRes({ ok: false, msg: `El reloj marca las ${hora12Texto(reloj)}; eso no es «${frase}». ${explicaHora(q.min)} Recuerda: la manecilla corta (negra) marca la hora y la larga (azul) los minutos.` });
      sfx(false);
    }
  };
  const irDecir = (i: number) => {
    setDIdx(i);
    setHoraTxt("");
    setHoraRes(null);
    blip();
  };
  const comprobarHora = () => {
    const r = revisaHoraEscrita(horaTxt, d.min);
    setHoraRes(r);
    sfx(r.ok);
    if (r.ok) {
      setDecirOk((s) => new Set(s).add(d.id));
      if (r.forma === "to") setUsoTo(true);
    }
  };

  /* ── How often? ────────────────────────────────────────────────────── */
  const hab = HABITOS[habIdx]!;
  const contado = contados.has(hab.id);
  const n = cuentaDias(hab);
  const oracion = oracionFichas(hab, fichas);
  const advElegido = (fichas.find((f) => (ADVERBIOS as string[]).includes(f)) as Adverbio | undefined) ?? null;
  const frecResuelta = frecOk.has(hab.id) && revFrec !== null && revFrec.length === 0;

  const irHabito = (i: number) => {
    setHabIdx(i);
    setFichas([]);
    setRevFrec(null);
    setAvisoConteo(null);
    blip();
  };
  const contar = (k: number) => {
    if (contado) return;
    if (k === n) {
      setContados((s) => new Set(s).add(hab.id));
      setAvisoConteo(null);
      sfx(true);
    } else {
      setAvisoConteo(`No son ${k}. Cuenta otra vez las fichas de color en la fila de «${hab.etq}» (de Mon a Sun).`);
      sfx(false);
    }
  };
  const ponerFicha = (f: Ficha) => {
    if (fichas.includes(f) || frecResuelta) return;
    setFichas((xs) => [...xs, f]);
    setRevFrec(null);
    blip();
  };
  const quitarFicha = (i: number) => {
    if (frecResuelta) return;
    setFichas((xs) => xs.filter((_, k) => k !== i));
    setRevFrec(null);
  };
  const comprobarFrec = () => {
    const errs = revisaFrecuencia(hab, fichas);
    setRevFrec(errs);
    const ok = errs.length === 0;
    sfx(ok);
    if (ok) {
      setFrecOk((s) => new Set(s).add(hab.id));
      if (hab.esBe) setBeOk(true);
    }
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "dia") reiniciarDia();
    if (modo === "hora") {
      setReloj(0);
      setPm(false);
      setRelojRes(null);
      setHoraTxt("");
      setHoraRes(null);
    }
    if (modo === "frecuencia") {
      setFichas([]);
      setRevFrec(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Ordenar las 9 acciones del día de Ana como en la lectura A1", done: logroOrden },
    { t: "Narrar el día completo escribiendo cada verbo en Present Simple", done: logroNarrado },
    { t: "Elegir do o does en las cinco preguntas «What time…?»", done: auxOk.size === PREGUNTAS_HORA.length },
    { t: "Poner el reloj (hora y a.m. / p.m.) para las cinco respuestas", done: relojOk.size === PREGUNTAS_HORA.length },
    { t: "Decir con palabras las cinco horas que marca el reloj", done: decirOk.size === DECIR_HORA.length },
    { t: "Decir una hora con «to» (cuánto falta para la hora siguiente)", done: usoTo },
    { t: "Contar los días y armar la oración de frecuencia de los siete hábitos", done: frecOk.size === HABITOS.length },
    { t: "Colocar el adverbio después de «is» (she is never late)", done: beOk },
    { t: "Clasificar las oraciones de A10 y ganar estrellas", done: identifico },
    { t: "Aprobar el verdadero o falso (A4)", done: quizA4 },
    { t: "Completar los textos A2 y A6", done: textoA2 && textoA6 },
    { t: "Escribir tu propia rutina (A3) y pasar la revisión", done: a3Ok },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaRutina = modo;
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "dia") {
    if (paso < 0) {
      chipVivo = `6:00 a.m. · ordenando el día · ${orden.length}/${N}`;
      pie = "Ana todavía duerme. Toca las tarjetas en el orden de su día (lectura A1): cada una cae en su casilla de la línea de tiempo, al frente de la maqueta.";
    } else if (accion) {
      chipVivo = `${horaDigital(accion.min)} · ${accion.tarjeta}`;
      pie = burbuja ? (
        <>
          <strong style={{ color: OK }}>«{burbuja}»</strong> {accion.sujeto === "I" ? "Aquí habla Ana: con I el verbo va sin -s." : "Con she el verbo lleva -s."}
        </>
      ) : (
        `${accion.es} Escribe ${accion.huecos.length > 1 ? "los verbos" : "el verbo"} en Present Simple: ${accion.sujeto === "I" ? "habla Ana, con «I»." : "cuenta el narrador, con «she»."}`
      );
    } else {
      chipVivo = "10:00 p.m. · el día terminó";
      pie = "Ana ya duerme. Narraste su día completo en Present Simple: releelo abajo en el panel y escúchalo.";
    }
  } else if (modo === "hora") {
    if (subHora === "preguntar") {
      chipVivo = `reloj ${hora12Texto(reloj)} ${pm ? "p.m." : "a.m."} · pregunta ${qIdx + 1}/${PREGUNTAS_HORA.length}`;
      pie = relojRes ? relojRes.msg : auxResuelto ? `Lee la respuesta de Ana y pon el reloj: «${q.respuesta}»` : `Luis pregunta: «${preguntaTxt}» ¿Va do o does?`;
    } else {
      chipVivo = `What time is it? · ${decirOk.size}/${DECIR_HORA.length}`;
      pie = horaRes ? horaRes.msg : `${d.contexto} Mira las manecillas y escribe la hora en inglés, con palabras.`;
    }
  } else {
    chipVivo = `${hab.etq} · ${contado ? `${n}/7 días ≈ ${porcentaje(hab)} %` : "¿cuántos días?"}`;
    pie = !contado
      ? `¿Cuántos días de la semana pasa esto: «Ana ${hab.etq}»? Cuenta las fichas de color de su fila en el calendario.`
      : frecResuelta
        ? `«${oracion}» ${adverbiosAceptados(hab).length > 1 ? `También vale «${adverbiosAceptados(hab).filter((a) => a !== advElegido).join("», «")}»: la escala es aproximada.` : ""}`
        : `${n} de 7 días ≈ ${porcentaje(hab)} %. Arma la oración con las fichas: sujeto, adverbio y verbo en su lugar.`;
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
  if (modo === "dia") {
    control = (
      <>
        {sub(`1 · Ordena el día de Ana (${orden.length}/${N})`)}
        <div className="rd-opts">
          {TARJETAS.map((a) => {
            const puesta = orden.includes(a.id);
            return (
              <button key={a.id} className="rd-opt rd-tarjeta" data-on={puesta} disabled={puesta || orden.length >= N} onClick={() => tocarTarjeta(a.id)} style={{ ["--rdc" as string]: puesta ? OK : modoCol, background: puesta ? `${OK}14` : "transparent" }}>
                <i className={`fa-solid ${puesta ? "fa-check" : a.icono}`} style={{ marginRight: 8, color: puesta ? OK : modoCol }} />
                {a.tarjeta}
                {puesta && <span style={{ marginLeft: 7, color: T.text3, ...NUM }}>#{orden.indexOf(a.id) + 1}</span>}
              </button>
            );
          })}
        </div>
        {avisoOrden && nota(avisoOrden, WARN, "fa-rotate-left")}
        {paso >= 0 && (
          <>
            {sub(paso < N ? `2 · Cuenta el día · acción ${paso + 1} de ${N}` : "2 · El día de Ana, en Present Simple")}
            {accion ? (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${modoCol}44` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span className="rd-pill" style={{ ["--rdc" as string]: modoCol }}>
                    <i className={`fa-solid ${accion.icono}`} style={{ marginRight: 6 }} />
                    {horaDigital(accion.min)}
                    {accion.horaA1 ? " · hora de la lectura A1" : " · hora ilustrativa"}
                  </span>
                  <span style={{ fontSize: 11.5, color: T.text3 }}>{accion.es}</span>
                </div>
                <div style={{ fontSize: 16, color: "#fff", fontWeight: 700, lineHeight: 2.3 }}>
                  {accion.partes.map((parte, i) => (
                    <span key={i}>
                      {parte}
                      {i < accion.huecos.length && (
                        <span style={{ whiteSpace: "nowrap" }}>
                          <input
                            className="rd-in"
                            aria-label={`Verbo «${accion.huecos[i]!.base}»`}
                            data-e={revs ? (revs[i] === null && (escritos[i] ?? "").trim() ? "bien" : revs[i] ? "mal" : "") : ""}
                            value={escritos[i] ?? ""}
                            disabled={avanzando}
                            onChange={(e) => escribirVerbo(i, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                comprobarVerbos();
                              }
                            }}
                            autoComplete="off"
                            spellCheck={false}
                            style={{ width: Math.max(96, accion.huecos[i]!.base.length * 12 + 40) }}
                          />
                          <span style={{ fontSize: 12, color: T.text3, margin: "0 4px" }}>({accion.huecos[i]!.base})</span>
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="rd-opts" style={{ marginTop: 8 }}>
                  <button className="rd-opt rd-comprobar" data-on="true" onClick={comprobarVerbos} disabled={avanzando} style={{ ["--rdc" as string]: modoCol, background: `${modoCol}1f` }}>
                    <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
                    Comprobar
                  </button>
                  {burbuja && <BotonEscuchar texto={burbuja} col={modoCol} />}
                </div>
                {revs && revs.some((r) => r) && nota(revs.filter((r): r is string => !!r).join(" "), WARN, "fa-lightbulb")}
                {burbuja && nota(<>¡Correcto! «{burbuja}»</>, OK, "fa-circle-check")}
              </div>
            ) : (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(52,211,153,0.07)", border: `1px solid ${OK}55` }}>
                <div style={{ display: "grid", gap: 4 }}>
                  {ACCIONES.map((a) => (
                    <div key={a.id} style={{ fontSize: 13, color: "#fff", lineHeight: 1.45 }}>
                      <span style={{ color: T.text3, display: "inline-block", width: 78, ...NUM }}>{horaDigital(a.min)}</span>
                      {oracionCompleta(a)}
                    </div>
                  ))}
                </div>
                <div className="rd-opts" style={{ marginTop: 10 }}>
                  <BotonEscuchar texto={ACCIONES.map((a) => oracionCompleta(a)).join(" ")} col={OK} />
                  <button className="rd-opt" data-on="false" onClick={reiniciarDia} style={{ ["--rdc" as string]: modoCol }}>
                    <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                    Vivir el día otra vez
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {nota("Regla: Present Simple para rutinas. Con he / she / it el verbo lleva -s (-es tras -ch, -sh, -ss, -x, -o; have → has); con I / you / we / they, no.", T.text3)}
      </>
    );
  } else if (modo === "hora") {
    control = (
      <>
        <div className="rd-opts">
          {(
            [
              ["preguntar", "Pregunta y pon el reloj", "fa-comments"],
              ["decir", "Di la hora", "fa-keyboard"],
            ] as const
          ).map(([id, etq, ic]) => (
            <button
              key={id}
              className="rd-opt rd-sub"
              data-on={subHora === id}
              onClick={() => {
                setSubHora(id);
                blip();
              }}
              style={{ ["--rdc" as string]: modoCol, background: subHora === id ? `${modoCol}1f` : "transparent" }}
            >
              <i className={`fa-solid ${ic}`} style={{ marginRight: 8 }} />
              {etq}
            </button>
          ))}
        </div>
        {subHora === "preguntar" ? (
          <>
            {sub("Preguntas")}
            <div className="rd-opts">
              {PREGUNTAS_HORA.map((x, i) => (
                <button key={x.id} className="rd-opt rd-preg" data-on={i === qIdx} onClick={() => irPregunta(i)} style={{ ["--rdc" as string]: modoCol, background: i === qIdx ? `${modoCol}1f` : "transparent" }}>
                  {i + 1}
                  {relojOk.has(x.id) ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} /> : auxOk.has(x.id) ? <i className="fa-solid fa-circle-half-stroke" style={{ marginLeft: 6, color: modoCol }} /> : null}
                </button>
              ))}
            </div>
            {sub("1 · ¿do o does?")}
            <div style={{ fontSize: 16, color: "#fff", fontWeight: 800, marginBottom: 8 }}>{preguntaTxt}</div>
            <div className="rd-opts">
              {(["do", "does"] as const).map((aux) => (
                <button key={aux} className="rd-opt rd-aux" data-on={auxResuelto && aux === q.aux} disabled={auxResuelto} onClick={() => elegirAux(aux)} style={{ ["--rdc" as string]: auxResuelto && aux === q.aux ? OK : modoCol, minWidth: 70 }}>
                  {aux}
                </button>
              ))}
              {auxResuelto && <BotonEscuchar texto={preguntaTxt} col={modoCol} />}
            </div>
            {avisoAux && nota(avisoAux, WARN, "fa-lightbulb")}
            {auxResuelto && nota(q.porque, OK, "fa-circle-check")}
            <div style={{ opacity: auxResuelto ? 1 : 0.4, pointerEvents: auxResuelto ? "auto" : "none" }}>
              {sub("2 · Lee la respuesta y pon el reloj")}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 15, color: "#f9a8d4", fontWeight: 800 }}>Ana: «{auxResuelto ? q.respuesta : "…"}»</div>
                {auxResuelto && <BotonEscuchar texto={q.respuesta} col="#f472b6" />}
              </div>
              <div className="rd-opts" style={{ marginTop: 10 }}>
                {(
                  [
                    [-60, "−1 h"],
                    [-5, "−5 min"],
                    [5, "+5 min"],
                    [60, "+1 h"],
                  ] as const
                ).map(([delta, etq]) => (
                  <button key={etq} className="rd-opt rd-mover" data-on="false" onClick={() => moverReloj(delta)} style={{ ["--rdc" as string]: modoCol }}>
                    {etq}
                  </button>
                ))}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <i className="fa-solid fa-clock" style={{ color: modoCol }} />
                <input type="range" aria-label="Hora del reloj" className="rd-range" min={0} max={715} step={5} value={reloj} onChange={(e) => { setReloj(Number(e.target.value)); setRelojRes(null); }} style={{ ["--rdc" as string]: modoCol }} />
              </label>
              <div className="rd-opts" style={{ marginTop: 10 }}>
                {([false, true] as const).map((v) => (
                  <button key={String(v)} className="rd-opt rd-ampm" data-on={pm === v} onClick={() => { setPm(v); setRelojRes(null); blip(); }} style={{ ["--rdc" as string]: v ? "#a5b4fc" : "#fbbf24", background: pm === v ? (v ? "#a5b4fc22" : "#fbbf2422") : "transparent" }}>
                    <i className={`fa-solid ${v ? "fa-moon" : "fa-sun"}`} style={{ marginRight: 7 }} />
                    {v ? "p.m." : "a.m."}
                  </button>
                ))}
                <button className="rd-opt rd-comprobar" data-on="true" onClick={comprobarReloj} style={{ ["--rdc" as string]: modoCol, background: `${modoCol}1f` }}>
                  <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
                  Comprobar el reloj
                </button>
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 8 }}>También puedes arrastrar el minutero azul directamente sobre el reloj 3D.</div>
              {relojRes && nota(relojRes.msg, relojRes.ok ? OK : WARN, relojRes.ok ? "fa-circle-check" : "fa-lightbulb")}
              {relojRes?.ok && qIdx < PREGUNTAS_HORA.length - 1 && (
                <div className="rd-opts" style={{ marginTop: 10 }}>
                  <button className="rd-opt rd-sig" data-on="true" onClick={() => irPregunta(qIdx + 1)} style={{ ["--rdc" as string]: modoCol }}>
                    Siguiente pregunta
                    <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {sub("Momentos del día de Ana")}
            <div className="rd-opts">
              {DECIR_HORA.map((x, i) => (
                <button key={x.id} className="rd-opt rd-decir" data-on={i === dIdx} onClick={() => irDecir(i)} style={{ ["--rdc" as string]: modoCol, background: i === dIdx ? `${modoCol}1f` : "transparent" }}>
                  {i + 1}
                  {decirOk.has(x.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 800, marginTop: 12 }}>{d.contexto}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: T.text2, fontWeight: 700 }}>It&apos;s</span>
              <input
                className="rd-in rd-hora-in"
                aria-label="Hora en inglés"
                value={horaTxt}
                placeholder="a quarter to eight"
                data-e={horaRes ? (horaRes.ok ? "bien" : "mal") : ""}
                onChange={(e) => {
                  setHoraTxt(e.target.value);
                  setHoraRes(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    comprobarHora();
                  }
                }}
                autoComplete="off"
                spellCheck={false}
                style={{ flex: 1, minWidth: 180 }}
              />
              <button className="rd-opt rd-comprobar" data-on="true" onClick={comprobarHora} style={{ ["--rdc" as string]: modoCol, background: `${modoCol}1f` }}>
                <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
                Comprobar
              </button>
            </div>
            {horaRes && nota(horaRes.msg, horaRes.ok ? OK : WARN, horaRes.ok ? "fa-circle-check" : "fa-lightbulb")}
            {horaRes?.ok && (
              <div className="rd-opts" style={{ marginTop: 8 }}>
                <BotonEscuchar texto={`It's ${horaEnIngles(d.min)}.`} col={modoCol} />
                {dIdx < DECIR_HORA.length - 1 && (
                  <button className="rd-opt rd-sig" data-on="true" onClick={() => irDecir(dIdx + 1)} style={{ ["--rdc" as string]: modoCol }}>
                    Siguiente momento
                    <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                  </button>
                )}
              </div>
            )}
            {nota("Formas válidas: half past seven · a quarter past / to eight · twenty past six · ten to nine · seven forty-five · six oh five · ten o'clock. Puedes agregar in the morning, in the afternoon, in the evening o at night.", T.text3)}
          </>
        )}
      </>
    );
  } else {
    const aceptados = adverbiosAceptados(hab);
    control = (
      <>
        <div className="rd-opts">
          {HABITOS.map((x, i) => (
            <button key={x.id} className="rd-opt rd-habito" data-on={i === habIdx} onClick={() => irHabito(i)} style={{ ["--rdc" as string]: x.color, background: i === habIdx ? `${x.color}22` : "transparent" }} title={x.etq} aria-label={`Hábito: ${x.etq}`}>
              <i className={`fa-solid ${x.icono}`} style={{ color: x.color }} />
              {frecOk.has(x.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 800, marginTop: 12 }}>
          <i className={`fa-solid ${hab.icono}`} style={{ color: hab.color, marginRight: 8 }} />
          Ana {hab.etq}…
        </div>
        {sub("1 · ¿Cuántos días de la semana?")}
        <div className="rd-opts">
          {Array.from({ length: 8 }, (_, k) => (
            <button key={k} className="rd-opt rd-num" data-on={contado && k === n} disabled={contado} onClick={() => contar(k)} style={{ ["--rdc" as string]: contado && k === n ? OK : modoCol, minWidth: 40, ...NUM }}>
              {k}
            </button>
          ))}
        </div>
        {avisoConteo && nota(avisoConteo, WARN, "fa-lightbulb")}
        {contado && nota(`${n} de 7 días ≈ ${porcentaje(hab)} % → en la escala: «${aceptados.join("» o «")}».`, OK, "fa-circle-check")}
        <div style={{ opacity: contado ? 1 : 0.4, pointerEvents: contado ? "auto" : "none" }}>
          {sub("2 · Arma la oración (toca las fichas en orden)")}
          <div className="rd-linea" data-e={revFrec ? (revFrec.length ? "mal" : "bien") : ""}>
            {fichas.length ? (
              fichas.map((f, i) => (
                <button key={f} className="rd-ficha rd-puesta" onClick={() => quitarFicha(i)} disabled={frecResuelta} title="Quitar">
                  {textoFicha(hab, f)}
                </button>
              ))
            ) : (
              <span style={{ fontSize: 12.5, color: T.text3 }}>Tu oración aparece aquí y en el pizarrón 3D. Toca una ficha colocada para quitarla.</span>
            )}
          </div>
          <div className="rd-opts rd-banco" style={{ marginTop: 10 }}>
            {(FICHAS_HABITO[habIdx] ?? []).map((f) => {
              const esAdv = (ADVERBIOS as string[]).includes(f);
              return (
                <button key={f} className="rd-ficha" data-adv={esAdv} disabled={fichas.includes(f) || frecResuelta} onClick={() => ponerFicha(f)}>
                  {textoFicha(hab, f)}
                </button>
              );
            })}
          </div>
          <div className="rd-opts" style={{ marginTop: 10 }}>
            <button className="rd-opt rd-comprobar" data-on="true" onClick={comprobarFrec} disabled={fichas.length === 0 || frecResuelta} style={{ ["--rdc" as string]: modoCol, background: `${modoCol}1f` }}>
              <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
              Comprobar la oración
            </button>
            <button className="rd-opt" data-on="false" onClick={() => { setFichas([]); setRevFrec(null); }} disabled={frecResuelta} style={{ ["--rdc" as string]: modoCol }}>
              <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
              Borrar
            </button>
            {frecResuelta && <BotonEscuchar texto={oracion} col={OK} />}
            {frecResuelta && habIdx < HABITOS.length - 1 && (
              <button className="rd-opt rd-sig" data-on="true" onClick={() => irHabito(habIdx + 1)} style={{ ["--rdc" as string]: modoCol }}>
                Siguiente hábito
                <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
              </button>
            )}
          </div>
          {revFrec && revFrec.length > 0 && nota(revFrec.join(" "), WARN, "fa-lightbulb")}
          {frecResuelta && nota(<>¡Correcto! «{oracion}»</>, OK, "fa-circle-check")}
          {!frecResuelta && frecOk.has(hab.id) && nota("Ya resolviste este hábito; puedes armarlo de otra forma válida.", T.text3)}
        </div>
        <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 4 }}>LECTURA IN-III-P04-A1</div>
          {POSICION_IN3.map((l) => (
            <div key={l} style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
              {l}
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: T.text3, marginTop: 4 }}>{ESCALA.map((e) => `${e.adv} (${e.es}) ${e.pct} %`).join(" · ")}</div>
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes rdPulse { 0%,100%{ box-shadow:0 0 0 0 var(--rdd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .rd-live-dot { animation: rdPulse 1.6s ease-in-out infinite; }
        @keyframes rdShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }
        @media (prefers-reduced-motion: reduce){ .rd-live-dot { animation:none; } .rd-in[data-e="mal"], .rd-linea[data-e="mal"] { animation:none !important; } }
        .rd-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .rd-grid { grid-template-columns: 1fr; } }
        .rd-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .rd-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .rd-icobtn:hover { background:rgba(255,255,255,0.12); }
        .rd-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .rd-tab { cursor:pointer; border:1px solid var(--rdc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .rd-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .rd-tab:hover { background:rgba(255,255,255,0.06); }
        .rd-opts { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }
        .rd-opt { cursor:pointer; border:1px solid var(--rdc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .rd-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .rd-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .rd-opt:disabled { cursor:default; }
        .rd-opt:disabled[data-on="false"] { opacity:0.55; }
        .rd-escuchar { cursor:pointer; border:1px solid var(--rdc); border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; color:#fff; background:rgba(4,10,22,0.45); transition:all .15s; }
        .rd-escuchar:hover { background:rgba(255,255,255,0.08); }
        .rd-pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; border:1px solid var(--rdc); color:#fff; font-size:11.5px; font-weight:800; font-variant-numeric:tabular-nums; }
        .rd-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:700; padding:5px 10px; font-family:inherit; outline:none; transition:all .15s; }
        .rd-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .rd-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .rd-in[data-e="mal"] { border-color:${WARN}; background:${WARN}14; animation:rdShake .35s; }
        .rd-range { flex:1; accent-color: var(--rdc); }
        .rd-linea { min-height:48px; display:flex; flex-wrap:wrap; gap:7px; align-items:center; padding:9px 11px; border-radius:12px; border:1.5px dashed rgba(255,255,255,0.2); background:rgba(4,10,22,0.45); }
        .rd-linea[data-e="bien"] { border-style:solid; border-color:${OK}; }
        .rd-linea[data-e="mal"] { border-style:solid; border-color:${WARN}; animation:rdShake .35s; }
        .rd-ficha { cursor:pointer; border:1.5px solid rgba(255,255,255,0.22); border-radius:9px; padding:7px 11px; font-size:13px; font-weight:800; color:#fff; background:rgba(255,255,255,0.05); transition:all .14s; }
        .rd-ficha[data-adv="true"] { border-color:#a78bfa88; color:#ddd6fe; }
        .rd-ficha:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        .rd-ficha:disabled { opacity:0.3; cursor:default; }
        .rd-puesta { background:rgba(167,139,250,0.16); border-color:#a78bfa; }
        .rd-puesta:disabled { opacity:1; }
        .rd-area { width:100%; box-sizing:border-box; border-radius:12px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:14px; line-height:1.55; padding:12px 14px; font-family:inherit; outline:none; resize:vertical; }
        .rd-area:focus { border-color:var(--rdc); }
        .rd-opt:focus-visible, .rd-tab:focus-visible, .rd-icobtn:focus-visible, .rd-range:focus-visible, .rd-ficha:focus-visible, .rd-escuchar:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .rd-bottom { grid-template-columns: 1fr !important; } }
        .rd-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .rd-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .rd-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .rd-drawer[data-open="true"] { transform:translateX(0); }
        .rd-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .rd-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .rd-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .rd-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .rd-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .rd-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        .rd-guia summary { cursor:pointer; color:${accent}; font-size:11.5px; font-weight:800; }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="rd-tabs">
          {MODOS.map((m) => {
            const dd = MODOS_DEF[m];
            const col = `#${dd.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="rd-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--rdc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="rd-grid">
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
              <RutinaScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                colocados={orden.length}
                paso={paso}
                burbuja={burbuja}
                relojMin={modo === "hora" && subHora === "decir" ? d.min % 720 : reloj}
                pm={modo === "hora" && subHora === "decir" ? d.min >= 720 : pm}
                pregunta={subHora === "preguntar" ? preguntaTxt : horaRes?.ok ? "Thanks!" : "What time is it?"}
                respuesta={subHora === "preguntar" ? (auxResuelto ? q.respuesta : null) : horaRes?.ok ? `It's ${horaTxt.trim().replace(/^(it'?s|it is)\s+/i, "").replace(/[.!]+$/, "")}.` : null}
                contexto={subHora === "decir" ? d.contexto.replace(" What time is it?", "") : null}
                contextoIcono={subHora === "decir" ? (["fa-shower", "fa-mug-hot", "fa-school", "fa-book", "fa-tv"][dIdx] ?? null) : null}
                mostrarDigital={subHora === "preguntar" ? !!relojRes?.ok : !!horaRes?.ok}
                arrastrable={modo === "hora" && subHora === "preguntar" && auxResuelto}
                onMinuto={alArrastrar}
                habitoIdx={habIdx}
                contado={contado}
                oracion={oracion}
                estadoOracion={revFrec ? (revFrec.length ? "mal" : "ok") : null}
                adverbio={advElegido}
                hechosFrec={[...frecOk]}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="rd-live-dot" style={{ ["--rdd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="rd-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="rd-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="rd-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="rd-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-sun" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>What do you do every day?</div>
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
                <div key={i} style={{ fontSize: 12, color: i === 2 ? "#fff" : T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>COMPRENSIÓN</div>
            <div style={{ display: "grid", gap: 8 }}>
              {PREGUNTAS_A1.map((x) => (
                <details key={x.pregunta} className="rd-guia">
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="rd-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div>
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
          Son <strong>verbatim</strong> del material de la plataforma: la lectura A1 con sus preguntas, los textos A2 y A6, la consigna, pistas y criterios de A3, los hechos A4, el glosario A5 y las
          oraciones de A10; la escala y la posición de los adverbios vienen de la lectura IN-III-P04-A1. Llamamos Ana a la estudiante de la lectura A1 (el nombre es el de A2 y A6, cuyo horario es
          un poco distinto). Son <strong>ilustrativos</strong>: las horas que la lectura no fecha (marcadas con ≈), las horas del reloj, el calendario semanal de Ana, los personajes (Ana y Luis) y el
          barrio; el recorrido del sol es esquemático, no astronómico. Los porcentajes de la escala son aproximados, por eso a veces valen dos adverbios. Dos oraciones del día están en primera persona
          («I») para contrastar la -s. Fuente: {FUENTE}
        </span>
      </div>

      <TiempoCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizA4} onAprobado={() => setQuizA4(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Dominas el presente simple y los adverbios de frecuencia." />

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

      <div className="rd-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="rd-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="rd-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="rd-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="rd-drawer-body">
          <FichaTeorica data={RUTINA_DIARIA_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
