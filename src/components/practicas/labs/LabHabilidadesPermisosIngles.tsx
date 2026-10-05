"use client";

/**
 * Laboratorio 3D — "Can you…? May I…? El centro comunitario".
 * Práctica anclada a IN-II-P03-A2 (quiz «Using Can and Can't Correctly») de la
 * progresión 3 de Inglés II: «Expresa habilidades y pide o da permiso en
 * situaciones cotidianas». El marco teórico es la lectura A1, los hechos salen
 * del verdadero/falso A4, el glosario del A5, el texto a completar del A6 y
 * «Tu turno» de la escritura A3.
 *
 * Tres modos:
 *  (1) Can you…? — escribir preguntas de habilidad a seis candidatos, verlos
 *      intentarlo, formar los equipos de tres clubes y escribir su aviso en
 *      3.ª persona.
 *  (2) May I…? Can I…? — armar con fichas la petición de permiso adecuada al
 *      interlocutor (adulto o amigo), entender la respuesta y actuar.
 *  (3) Read the signs — leer el letrero del espacio, decidir si la persona
 *      puede y escribir la regla con can / can't.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import type { ObjetivoLab } from "./_objetivos";
import { hablarLab, callarLab, puedeHablarLab } from "./lab-voz";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { HABILIDADES_PERMISOS_INGLES_FICHA } from "./habilidades-permisos-ingles-ficha";
import type { IntentoClub, VistaHP } from "./HabilidadesPermisosInglesScene";
import {
  type Modo,
  type HabilidadId,
  type FichaP,
  type RevisionPermiso,
  type RevisionRegla,
  type Uso,
  MODOS,
  MODOS_DEF,
  mulberry32,
  estrellasPorErrores,
  LUGAR_DEF,
  HABILIDAD_DEF,
  HABILIDADES_ORDEN,
  CANDIDATOS,
  persona,
  MISIONES,
  frasePuesto,
  respuestaCorta,
  notaTercera,
  revisaPregunta,
  revisaAviso,
  avisoModelo,
  SITUACIONES,
  FICHAS_SITUACION,
  textoFichaP,
  peticion,
  revisaPermiso,
  REGISTRO_DEF,
  CASOS,
  revisaRegla,
  tipoLinea,
  horaCorta,
  CLASIFICA_USO,
  USOS,
  rondaUso,
  A3,
  analizaA3,
  AUTOEVALUACION_A7,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  QUIZ_A2,
  HUECOS_A6,
  FUENTE,
  NAHUATL_DATO,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
} from "./habilidades-permisos-ingles-data";

const HabScene = dynamic(() => import("./HabilidadesPermisosInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-people-roof fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el centro comunitario en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-habilidades-permisos-ingles-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaUso(mulberry32(9));
const PREGUNTAS_META = 8;

function BotonEscuchar({ texto, col }: { texto: string; col: string }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button className="hp-escuchar" onClick={() => hablarLab(texto)} title="Escuchar en inglés" aria-label={`Escuchar: ${texto}`} style={{ ["--hpc" as string]: col }}>
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );
}

/* ── Tarjeta de estrellas: ¿habilidad o permiso? ──────────────────────── */
function UsoCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = CLASIFICA_USO[ronda[pos] ?? 0]!;

  const responder = (u: Uso) => {
    if (resuelto !== null) return;
    const ok = u === actual.uso;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`Es ${actual.uso === "Ability" ? "habilidad (ability)" : "permiso (permission)"}: ${actual.explicacion}`);
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
    setRonda(rondaUso(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "18px 16px 20px", marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Ability or permission? (ejemplos de A1, A2 y A5)
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>
        La lectura A1 dice que «can» tiene dos usos: habilidad (algo que sabemos hacer) y permiso (algo que tenemos permitido). Clasifica cada ejemplo; con cero errores ganas tres estrellas.
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Ejemplo {pos + 1} de {ronda.length} · {actual.fuente}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <div style={{ fontSize: 16, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>«{actual.texto}»</div>
            <BotonEscuchar texto={actual.texto} col={accent} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {USOS.map((c, k) => (
              <button key={c.nombre} className="hp-opt hp-uso" data-on="true" onClick={() => responder(c.nombre)} style={{ ["--hpc" as string]: k === 0 ? "#fbbf24" : "#38bdf8", textAlign: "left" }}>
                <div style={{ fontSize: 14 }}>
                  <i className={`fa-solid ${k === 0 ? "fa-person-running" : "fa-hand"}`} style={{ marginRight: 8 }} />
                  {c.nombre} · {c.es}
                </div>
                <div style={{ fontSize: 14, color: T.text3, fontWeight: 700, marginTop: 3 }}>{c.descripcion}</div>
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

/* ── Tu turno: escritura A3 con revisión orientativa ──────────────────── */
function TuTurnoCard({ accent, logrado, onLogrado, playSfx }: { accent: string; logrado: boolean; onLogrado: () => void; playSfx?: (ok: boolean) => void }) {
  const [texto, setTexto] = useState("");
  const [revisado, setRevisado] = useState(false);
  const an = analizaA3(texto);
  const criterios: { t: string; ok: boolean }[] = [
    { t: `Entre ${A3.min} y ${A3.max} palabras (llevas ${an.palabras})`, ok: an.palabras >= A3.min && an.palabras <= A3.max },
    { t: `Al menos 5 oraciones con «I can…» (3 habilidades + 2 permisos) · llevas ${an.afirmativas}`, ok: an.afirmativas >= 5 },
    { t: `Al menos 3 con «I can't…» o «I cannot…» (2 habilidades + 1 prohibición) · llevas ${an.negativas}`, ok: an.negativas >= 3 },
    { t: `Dónde o quién da el permiso (at school, at home, in class, my parents…) al menos 2 veces · llevas ${an.contextos}`, ok: an.contextos >= 2 },
    { t: an.errores.length ? `Revisa: ${an.errores.join(", ")}` : "Can + verbo base: no se detectaron «cans», «can to», «can + -s» ni «do … can»", ok: an.errores.length === 0 },
  ];
  const todo = criterios.every((c) => c.ok);
  const revisar = () => {
    setRevisado(true);
    playSfx?.(todo);
    if (todo && !logrado) onLogrado();
  };
  return (
    <div style={{ ...card, padding: "18px 16px 20px", marginTop: 18 }}>
      <Eyebrow>
        <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
        Tu turno: Things I Can and Cannot Do (A3)
      </Eyebrow>
      <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, lineHeight: 1.5 }}>{A3.prompt}</div>
      <ul style={{ margin: "8px 0 12px", paddingLeft: 18, display: "grid", gap: 3 }}>
        {A3.pistas.map((p) => (
          <li key={p} style={{ fontSize: 14, color: T.text2 }}>
            {p}
          </li>
        ))}
      </ul>
      <textarea
        className="hp-area"
        aria-label="Tu texto en inglés"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setRevisado(false);
        }}
        placeholder="I can swim and I can cook tacos. I can't play the piano…"
        rows={6}
        style={{ ["--hpc" as string]: accent }}
      />
      <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
        {criterios.map((c) => (
          <div key={c.t} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: c.ok ? OK : revisado ? WARN : T.text2, lineHeight: 1.4 }}>
            <i className={`fa-solid ${c.ok ? "fa-circle-check" : revisado ? "fa-circle-exclamation" : "fa-circle"}`} style={{ marginTop: 2 }} />
            {c.t}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
        <button className="hp-opt hp-a3" data-on="true" onClick={revisar} style={{ ["--hpc" as string]: accent }}>
          <i className="fa-solid fa-spell-check" style={{ marginRight: 8 }} />
          Revisar mi texto
        </button>
        {revisado && <span style={{ fontSize: 14, color: todo ? OK : WARN, fontWeight: 800 }}>{todo ? "¡Listo! Tu texto cumple los criterios que se pueden revisar automáticamente." : "Todavía falta algo: revisa los puntos en naranja."}</span>}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
        Criterios de la actividad: {A3.criterios.join(" · ")}. La revisión automática es orientativa: cuenta palabras y oraciones con «I can» / «I can&apos;t» y detecta errores de forma; tu docente evalúa si distingues habilidad y permiso y la claridad del texto.
      </div>
      <details className="hp-guia" style={{ marginTop: 12 }}>
        <summary>Autoevaluación (A7)</summary>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>
          {AUTOEVALUACION_A7.instrucciones} Escala: {AUTOEVALUACION_A7.escala.join(" · ")}.
        </div>
        <ul style={{ margin: "6px 0 0", paddingLeft: 18, display: "grid", gap: 3 }}>
          {AUTOEVALUACION_A7.criterios.map((c) => (
            <li key={c} style={{ fontSize: 14, color: T.text2 }}>
              {c}
            </li>
          ))}
        </ul>
        <div style={{ fontSize: 14, color: "#fff", marginTop: 6 }}>{AUTOEVALUACION_A7.reflexion}</div>
      </details>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

type Conocido = Record<string, Partial<Record<HabilidadId, boolean>>>;
type Aviso = { ok: boolean; msg: string } | null;

export function LabHabilidadesPermisosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("club");

  // ── Can you…?
  const [sel, setSel] = useState<string>("ximena");
  const [pregTxt, setPregTxt] = useState("");
  const [revPreg, setRevPreg] = useState<Aviso>(null);
  const [conocido, setConocido] = useState<Conocido>({});
  const [intento, setIntento] = useState<IntentoClub | null>(null);
  const [preguntasOk, setPreguntasOk] = useState<Set<string>>(() => new Set());
  const [misionIdx, setMisionIdx] = useState(0);
  const [equipos, setEquipos] = useState<(string | null)[][]>(() => MISIONES.map((m) => m.puestos.map(() => null)));
  const [avisoRecluta, setAvisoRecluta] = useState<Aviso>(null);
  const [avisoTxt, setAvisoTxt] = useState("");
  const [revAviso, setRevAviso] = useState<Aviso>(null);
  const [avisosOk, setAvisosOk] = useState<Set<number>>(() => new Set());

  // ── May I…?
  const [sitIdx, setSitIdx] = useState(0);
  const [fichas, setFichas] = useState<FichaP[]>([]);
  const [revP, setRevP] = useState<RevisionPermiso | null>(null);
  const [pasoP, setPasoP] = useState(0);
  const [avisoPaso, setAvisoPaso] = useState<string | null>(null);
  const [pedidas, setPedidas] = useState<Set<string>>(() => new Set());
  const [cortes, setCortes] = useState<Set<string>>(() => new Set());
  const [entendidas, setEntendidas] = useState<Set<string>>(() => new Set());

  // ── Read the signs
  const [casoIdx, setCasoIdx] = useState(0);
  const [decididos, setDecididos] = useState<Set<string>>(() => new Set());
  const [avisoDec, setAvisoDec] = useState<string | null>(null);
  const [reglaTxt, setReglaTxt] = useState("");
  const [revRegla, setRevRegla] = useState<RevisionRegla | null>(null);
  const [reglasOk, setReglasOk] = useState<Set<string>>(() => new Set());
  // Lo que el alumno supuso en el letrero cuando se equivocó (la persona se encoge de hombros).
  const [suposicion, setSuposicion] = useState<boolean | null>(null);
  // Experimento central: equivocarse a propósito y ver la reacción en la escena.
  const [vioError, setVioError] = useState(false);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizOk, setQuizOk] = useState(false);
  const [textoA6, setTextoA6] = useState(false);
  const [a3Ok, setA3Ok] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
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

  /* ── Can you…? ─────────────────────────────────────────────────────── */
  const pSel = persona(sel);
  const mision = MISIONES[misionIdx]!;
  const equipo = equipos[misionIdx]!;
  const equipoCompleto = equipo.every((x) => x !== null);
  const avisoHecho = avisosOk.has(misionIdx);
  const burbujaClub = intento ? respuestaCorta(persona(intento.persona), intento.habilidad) : null;
  const insignias: Record<string, string[]> = {};
  equipos.forEach((eq, i) =>
    eq.forEach((id) => {
      if (id) insignias[id] = [...(insignias[id] ?? []), MISIONES[i]!.color];
    }),
  );

  const elegirPersona = useCallback((id: string) => {
    setSel(id);
    setPregTxt("");
    setRevPreg(null);
    setAvisoRecluta(null);
  }, []);

  const preguntar = () => {
    const r = revisaPregunta(pregTxt, pSel);
    if (!r.ok) {
      setRevPreg({ ok: false, msg: r.msg });
      setVioError(true);
      sfx(false);
      return;
    }
    const puede = !!pSel.puede?.[r.h];
    setConocido((c) => ({ ...c, [sel]: { ...(c[sel] ?? {}), [r.h]: puede } }));
    setPreguntasOk((s) => new Set(s).add(`${sel}:${r.h}`));
    setIntento((prev) => ({ persona: sel, habilidad: r.h, clave: (prev?.clave ?? 0) + 1 }));
    setRevPreg({ ok: true, msg: `«${respuestaCorta(pSel, r.h)}»${r.nota ? ` · ${r.nota}` : ""}` });
    setAvisoRecluta(null);
    sfx(true);
  };

  const reclutar = (slot: number) => {
    if (avisoHecho) return;
    const puesto = mision.puestos[slot]!;
    const otro = equipo.findIndex((x, k) => x === sel && k !== slot);
    if (otro >= 0) {
      setAvisoRecluta({ ok: false, msg: `${pSel.nombre} ya está en otro puesto de este equipo: cada puesto necesita a una persona distinta.` });
      sfx(false);
      return;
    }
    const sinPreguntar = puesto.filter((h) => conocido[sel]?.[h] === undefined);
    if (sinPreguntar.length) {
      setAvisoRecluta({ ok: false, msg: `Todavía no sabes si ${pSel.nombre} puede. Primero pregúntale: ${sinPreguntar.map((h) => `«Can you ${HABILIDAD_DEF[h].frase}?»`).join(" y ")}` });
      sfx(false);
      return;
    }
    const noPuede = puesto.filter((h) => conocido[sel]?.[h] === false);
    if (noPuede.length) {
      setAvisoRecluta({ ok: false, msg: `${pSel.nombre} can't ${noPuede.map((h) => HABILIDAD_DEF[h].frase).join(" and ")}: te respondió «No, I can't». Este puesto necesita a alguien que diga «Yes, I can».` });
      sfx(false);
      return;
    }
    setEquipos((eqs) => eqs.map((eq, i) => (i === misionIdx ? eq.map((x, k) => (k === slot ? sel : x)) : eq)));
    setAvisoRecluta({ ok: true, msg: `${pSel.nombre} se une al equipo: «${pSel.nombre} can ${frasePuesto(puesto)}.»` });
    setRevAviso(null);
    sfx(true);
  };
  const quitarRecluta = (slot: number) => {
    if (avisoHecho) return;
    setEquipos((eqs) => eqs.map((eq, i) => (i === misionIdx ? eq.map((x, k) => (k === slot ? null : x)) : eq)));
    setRevAviso(null);
  };
  const comprobarAviso = () => {
    const r = revisaAviso(avisoTxt, mision, equipo as string[]);
    if (r.ok) {
      setRevAviso({ ok: true, msg: `¡Aviso publicado! En 3.ª persona, can no cambia y el verbo va en forma base: «${avisoModelo(mision, equipo as string[])}»` });
      setAvisosOk((s) => new Set(s).add(misionIdx));
      sfx(true);
    } else {
      setRevAviso({ ok: false, msg: r.msg });
      sfx(false);
    }
  };
  const irMision = (i: number) => {
    setMisionIdx(i);
    setAvisoTxt("");
    setRevAviso(null);
    setAvisoRecluta(null);
    blip();
  };

  /* ── May I…? ───────────────────────────────────────────────────────── */
  const sit = SITUACIONES[sitIdx]!;
  const npc = persona(sit.quien);
  const peticionTxt = peticion(sit, fichas);

  const irSituacion = (i: number) => {
    setSitIdx(i);
    setFichas([]);
    setRevP(null);
    setPasoP(0);
    setAvisoPaso(null);
    blip();
  };
  const ponerFicha = (f: FichaP) => {
    if (pasoP > 0 || fichas.includes(f)) return;
    setFichas((xs) => [...xs, f]);
    setRevP(null);
    blip();
  };
  const quitarFicha = (i: number) => {
    if (pasoP > 0) return;
    setFichas((xs) => xs.filter((_, k) => k !== i));
    setRevP(null);
  };
  const comprobarPeticion = () => {
    const r = revisaPermiso(sit, fichas);
    setRevP(r);
    const ok = r.errores.length === 0;
    sfx(ok);
    if (!ok) {
      setVioError(true);
      return;
    }
    setPedidas((s) => new Set(s).add(sit.id));
    if (r.cortesAdulto) setCortes((s) => new Set(s).add(sit.id));
    setPasoP(1);
    setAvisoPaso(null);
  };
  const decidirPuedes = (si: boolean) => {
    if (pasoP !== 1) return;
    if (si === sit.permitido) {
      setPasoP(2);
      setAvisoPaso(null);
      sfx(true);
    } else {
      setAvisoPaso(
        sit.permitido
          ? `${npc.nombre} dijo «${sit.respuesta}». «Sure, go ahead» / «Yes, you can» significan que SÍ te da permiso → «Yes, I can.»`
          : `${npc.nombre} dijo «${sit.respuesta}». «Sorry, you can't…» significa que NO te da permiso → «No, I can't.»`,
      );
      sfx(false);
    }
  };
  const contestar = (k: number) => {
    if (pasoP !== 2) return;
    if (k === sit.correcta) {
      setPasoP(3);
      setAvisoPaso(null);
      setEntendidas((s) => new Set(s).add(sit.id));
      sfx(true);
    } else {
      setAvisoPaso(`No es «${sit.opciones[k]}». Relee lo que dijo ${npc.nombre}: «${sit.respuesta}»`);
      sfx(false);
    }
  };

  /* ── Read the signs ────────────────────────────────────────────────── */
  const caso = CASOS[casoIdx]!;
  const pCaso = persona(caso.quien);
  const decidido = decididos.has(caso.id);
  const reglaHecha = reglasOk.has(caso.id);
  const Pron = pCaso.genero === "he" ? "He" : "She";

  const irCaso = (i: number) => {
    setCasoIdx(i);
    setSuposicion(null);
    setAvisoDec(null);
    setReglaTxt("");
    setRevRegla(null);
    blip();
  };
  const decidir = (puede: boolean) => {
    if (decidido) return;
    if (puede === caso.puede) {
      setDecididos((s) => new Set(s).add(caso.id));
      setAvisoDec(null);
      setSuposicion(null);
      sfx(true);
    } else {
      setSuposicion(puede);
      setVioError(true);
      setAvisoDec(`${puede ? "No puede" : "Sí puede"}. ${caso.porque}`);
      sfx(false);
    }
  };
  const comprobarRegla = () => {
    const r = revisaRegla(reglaTxt, caso);
    setRevRegla(r);
    sfx(r.ok);
    if (r.ok) setReglasOk((s) => new Set(s).add(caso.id));
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "club") {
      setIntento(null);
      setPregTxt("");
      setRevPreg(null);
      setAvisoRecluta(null);
    }
    if (modo === "permiso") {
      setFichas([]);
      setRevP(null);
      setPasoP(0);
      setAvisoPaso(null);
    }
    if (modo === "letreros") {
      setSuposicion(null);
      setReglaTxt("");
      setRevRegla(null);
      setAvisoDec(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const adultos = SITUACIONES.filter((s) => persona(s.quien).adulto);
  const objetivos: ObjetivoLab[] = [
    // Misión del experimento central: equivocarse a propósito y ver cómo reacciona la persona.
    { txt: "Equivócate a propósito (una pregunta, una petición o un letrero) y mira cómo reacciona la persona", done: vioError },
    { txt: `Hacer ${PREGUNTAS_META} preguntas distintas y correctas con «Can you…?»`, done: preguntasOk.size >= PREGUNTAS_META },
    { txt: "Formar los tres equipos con personas que dijeron «Yes, I can»", done: equipos.every((eq) => eq.every((x) => x !== null)) },
    { txt: "Escribir el aviso de cada club en 3.ª persona (Itzel can cook)", done: avisosOk.size === MISIONES.length },
    { txt: "Pedir permiso con la estructura correcta en las seis situaciones", done: pedidas.size === SITUACIONES.length },
    { txt: `Pedir permiso a los ${adultos.length} adultos con May I o con please`, done: adultos.every((s) => cortes.has(s.id)) },
    { txt: "Entender las seis respuestas: si puedes y dónde o cuándo", done: entendidas.size === SITUACIONES.length },
    { txt: "Leer los ocho letreros y decidir qué pueden y qué no pueden hacer", done: decididos.size === CASOS.length },
    { txt: "Escribir las ocho reglas con can o can't", done: reglasOk.size === CASOS.length },
    { txt: "Clasificar habilidad o permiso y ganar estrellas", done: identifico },
    { txt: "Aprobar el quiz A2 y completar el texto A6", done: quizOk && textoA6 },
    { txt: "Escribir tu texto A3 sobre lo que puedes y no puedes hacer", done: a3Ok },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaHP = modo;
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "club") {
    chipVivo = `${mision.club} · ${equipo.filter(Boolean).length}/${equipo.length} · preguntas ${preguntasOk.size}`;
    if (revPreg && !revPreg.ok) {
      pie = (
        <>
          <strong style={{ color: WARN }}>{pSel.nombre}: «Sorry? I don&apos;t understand.»</strong> {revPreg.msg}
        </>
      );
    } else if (intento && intento.persona === sel) {
      const pi = persona(intento.persona);
      const puede = !!pi.puede?.[intento.habilidad];
      pie = (
        <>
          <strong style={{ color: puede ? OK : WARN }}>{pi.nombre}: «{respuestaCorta(pi, intento.habilidad)}»</strong> {puede ? `Lo intenta en ${LUGAR_DEF[HABILIDAD_DEF[intento.habilidad].espacio].es.toLowerCase()} y le sale bien.` : `Lo intenta en ${LUGAR_DEF[HABILIDAD_DEF[intento.habilidad].espacio].es.toLowerCase()}, pero no sabe.`} En tu libreta: «{notaTercera(pi, intento.habilidad)}»
        </>
      );
    } else pie = `Elegiste a ${pSel.nombre}. Escríbele una pregunta con «Can you…?» sobre una habilidad que necesita el club: ${mision.cartel}`;
  } else if (modo === "permiso") {
    chipVivo = `${LUGAR_DEF[sit.lugar].en} · ${npc.nombre} · ${pasoP >= 3 ? "listo" : ["arma tu petición", "¿puedes?", "entiende la respuesta"][pasoP]}`;
    pie =
      pasoP === 0
        ? `${sit.deseo} Pídele permiso a ${npc.nombre} (${npc.adulto ? `${npc.rol?.es}: un adulto` : "tu amigo" + (npc.genero === "she" ? "a" : "")}).`
        : pasoP < 3
          ? `${npc.nombre}: «${sit.respuesta}»`
          : `${sit.porque} ${sit.destino !== sit.lugar ? `Vas a ${LUGAR_DEF[sit.destino].es.toLowerCase()}.` : ""}`;
  } else {
    chipVivo = `${LUGAR_DEF[caso.lugar].en}${caso.hora ? ` · ${horaCorta(caso.hora)}` : ""} · letrero ${casoIdx + 1}/${CASOS.length}`;
    pie = decidido ? (
      <>
        <strong style={{ color: caso.puede ? OK : WARN }}>
          {Pron} {caso.puede ? "can" : "can't"}.
        </strong>{" "}
        {caso.porque}
      </>
    ) : (
      `${caso.deseo} Lee el letrero de ${LUGAR_DEF[caso.lugar].es.toLowerCase()}: ¿puede o no puede?`
    );
  }

  if (modo === "permiso" && pasoP === 0 && revP && revP.errores.length > 0) {
    pie = (
      <>
        <strong style={{ color: WARN }}>{npc.nombre}: «Sorry? I didn&apos;t understand.»</strong> {revP.errores.join(" ")}
      </>
    );
  }
  if (modo === "letreros" && !decidido && suposicion !== null && avisoDec) {
    pie = (
      <>
        <strong style={{ color: WARN }}>
          {Pron} {suposicion ? "can" : "can't"}? No.
        </strong>{" "}
        {avisoDec}
      </>
    );
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y la retroalimentación siguen aquí. {typeof pie === "string" ? pie : ""}</div>
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
  if (modo === "club") {
    const lib = conocido[sel] ?? {};
    control = (
      <>
        <div className="hp-opts">
          {MISIONES.map((m, i) => (
            <button key={m.id} className="hp-opt hp-mision" data-on={i === misionIdx} onClick={() => irMision(i)} style={{ ["--hpc" as string]: m.color, background: i === misionIdx ? `${m.color}22` : "transparent" }}>
              <i className={`fa-solid ${m.icono}`} style={{ marginRight: 7, color: m.color }} />
              {m.club}
              {avisosOk.has(i) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${mision.color}55` }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: mision.color, letterSpacing: "0.08em" }}>CARTEL DEL CLUB · {mision.es.toUpperCase()}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.4 }}>«{mision.cartel}»</div>
            <BotonEscuchar texto={mision.cartel} col={mision.color} />
          </div>
        </div>

        {sub("1 · Elige a una persona (o tócala en la escena)")}
        <div className="hp-opts">
          {CANDIDATOS.map((id) => {
            const p = persona(id);
            return (
              <button key={id} className="hp-opt hp-persona" data-on={sel === id} onClick={() => elegirPersona(id)} aria-label={`Persona: ${p.nombre}`} style={{ ["--hpc" as string]: modoCol, background: sel === id ? `${modoCol}22` : "transparent" }}>
                <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: p.camisa, marginRight: 7 }} />
                {p.nombre}
              </button>
            );
          })}
        </div>

        {sub(`2 · Pregúntale a ${pSel.nombre}`)}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="hp-in"
            aria-label={`Tu pregunta para ${pSel.nombre}`}
            value={pregTxt}
            placeholder="Can you …?"
            data-e={revPreg ? (revPreg.ok ? "bien" : "mal") : ""}
            onChange={(e) => {
              setPregTxt(e.target.value);
              setRevPreg(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                preguntar();
              }
            }}
            autoComplete="off"
            spellCheck={false}
            style={{ flex: 1, minWidth: 0, width: "100%" }}
          />
          <button className="hp-opt hp-preguntar" data-on="true" onClick={preguntar} style={{ ["--hpc" as string]: modoCol, background: `${modoCol}1f` }}>
            <i className="fa-solid fa-comment" style={{ marginRight: 8 }} />
            Preguntar
          </button>
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>Habilidades: {HABILIDADES_ORDEN.map((h) => `${HABILIDAD_DEF[h].frase} (${HABILIDAD_DEF[h].es})`).join(" · ")}</div>
        {revPreg && nota(revPreg.msg, revPreg.ok ? OK : WARN, revPreg.ok ? "fa-circle-check" : "fa-lightbulb")}
        {revPreg?.ok && intento && (
          <div className="hp-opts" style={{ marginTop: 6 }}>
            <BotonEscuchar texto={`Can you ${HABILIDAD_DEF[intento.habilidad].frase}? ${respuestaCorta(persona(intento.persona), intento.habilidad)}`} col={modoCol} />
          </div>
        )}
        <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 4 }}>TU LIBRETA · {pSel.nombre.toUpperCase()}</div>
          {Object.keys(lib).length === 0 ? (
            <div style={{ fontSize: 14, color: T.text3 }}>Todavía no le has preguntado nada.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {HABILIDADES_ORDEN.filter((h) => lib[h] !== undefined).map((h) => (
                <span key={h} className="hp-pill" style={{ ["--hpc" as string]: lib[h] ? OK : WARN }}>
                  <i className={`fa-solid ${lib[h] ? "fa-check" : "fa-xmark"}`} style={{ marginRight: 6, color: lib[h] ? OK : WARN }} />
                  {notaTercera(pSel, h)}
                </span>
              ))}
            </div>
          )}
        </div>

        {sub("3 · Forma el equipo")}
        <div style={{ display: "grid", gap: 8 }}>
          {mision.puestos.map((pu, k) => {
            const quien = equipo[k];
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 10px", borderRadius: 10, border: `1px solid ${quien ? `${OK}66` : T.line}`, background: quien ? `${OK}10` : "transparent" }}>
                <span style={{ fontSize: 14, color: "#fff", fontWeight: 800, flex: 1, minWidth: 160 }}>
                  {pu.map((h) => (
                    <i key={h} className={`fa-solid ${HABILIDAD_DEF[h].icono}`} style={{ marginRight: 6, color: mision.color }} />
                  ))}
                  Someone who can {frasePuesto(pu)}
                </span>
                {quien ? (
                  <button className="hp-opt hp-quitar" data-on="true" onClick={() => quitarRecluta(k)} disabled={avisoHecho} title="Quitar del equipo" style={{ ["--hpc" as string]: OK }}>
                    <i className="fa-solid fa-user-check" style={{ marginRight: 7, color: OK }} />
                    {persona(quien).nombre}
                  </button>
                ) : (
                  <button className="hp-opt hp-reclutar" data-on="true" onClick={() => reclutar(k)} style={{ ["--hpc" as string]: modoCol }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: 7 }} />
                    Invitar a {pSel.nombre}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {avisoRecluta && nota(avisoRecluta.msg, avisoRecluta.ok ? OK : WARN, avisoRecluta.ok ? "fa-circle-check" : "fa-lightbulb")}

        <div style={{ opacity: equipoCompleto ? 1 : 0.4, pointerEvents: equipoCompleto ? "auto" : "none" }}>
          {sub("4 · Escribe el aviso del club (3.ª persona)")}
          <div style={{ fontSize: 14, color: T.text2, marginBottom: 6 }}>Di quién está en el equipo y qué puede hacer cada quien en su puesto.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="hp-in"
              aria-label="Aviso del club en inglés"
              value={avisoTxt}
              placeholder={equipoCompleto ? `${persona(equipo[0]!).nombre} can …` : "Primero forma el equipo"}
              data-e={revAviso ? (revAviso.ok ? "bien" : "mal") : ""}
              disabled={avisoHecho}
              onChange={(e) => {
                setAvisoTxt(e.target.value);
                setRevAviso(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  comprobarAviso();
                }
              }}
              autoComplete="off"
              spellCheck={false}
              style={{ flex: 1, minWidth: 0, width: "100%" }}
            />
            <button className="hp-opt hp-aviso" data-on="true" onClick={comprobarAviso} disabled={avisoHecho} style={{ ["--hpc" as string]: modoCol, background: `${modoCol}1f` }}>
              <i className="fa-solid fa-thumbtack" style={{ marginRight: 8 }} />
              Publicar aviso
            </button>
          </div>
          {revAviso && nota(revAviso.msg, revAviso.ok ? OK : WARN, revAviso.ok ? "fa-circle-check" : "fa-lightbulb")}
          {avisoHecho && (
            <div className="hp-opts" style={{ marginTop: 8 }}>
              <BotonEscuchar texto={avisoModelo(mision, equipo as string[])} col={OK} />
              {misionIdx < MISIONES.length - 1 && (
                <button className="hp-opt hp-sig" data-on="true" onClick={() => irMision(misionIdx + 1)} style={{ ["--hpc" as string]: modoCol }}>
                  Siguiente club
                  <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                </button>
              )}
            </div>
          )}
        </div>
        {nota(<>Regla: can no cambia con ningún sujeto y va seguido del verbo en forma base. Pregunta: Can you swim? · Respuesta corta: Yes, I can. / No, I can&apos;t. · {NAHUATL_DATO}</>, T.text3)}
      </>
    );
  } else if (modo === "permiso") {
    const banco = FICHAS_SITUACION[sitIdx] ?? [];
    control = (
      <>
        <div className="hp-opts">
          {SITUACIONES.map((s, i) => (
            <button key={s.id} className="hp-opt hp-sit" data-on={i === sitIdx} onClick={() => irSituacion(i)} aria-label={`Situación ${i + 1}`} style={{ ["--hpc" as string]: modoCol, background: i === sitIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${LUGAR_DEF[s.lugar].icono}`} style={{ marginRight: 6, color: LUGAR_DEF[s.lugar].color }} />
              {i + 1}
              {entendidas.has(s.id) ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} /> : pedidas.has(s.id) ? <i className="fa-solid fa-circle-half-stroke" style={{ marginLeft: 6, color: modoCol }} /> : null}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${modoCol}44` }}>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>{sit.deseo}</div>
          <div style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>
            Le hablas a <strong style={{ color: npc.adulto ? "#c4b5fd" : "#fde68a" }}>{npc.nombre}</strong> · {npc.adulto ? `${npc.rol?.es} (adulto)` : `tu amig${npc.genero === "she" ? "a" : "o"}`}
          </div>
        </div>

        {sub("1 · Arma tu petición (toca las fichas en orden)")}
        <div className="hp-linea" data-e={revP ? (revP.errores.length ? "mal" : "bien") : ""}>
          {fichas.length ? (
            fichas.map((f, i) => (
              <button key={f} className="hp-ficha hp-puesta" onClick={() => quitarFicha(i)} disabled={pasoP > 0} title="Quitar">
                {textoFichaP(sit, f)}
              </button>
            ))
          ) : (
            <span style={{ fontSize: 14, color: T.text3 }}>Tu petición aparece aquí. Toca una ficha colocada para quitarla.</span>
          )}
        </div>
        {fichas.length > 0 && <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, marginTop: 6 }}>«{peticionTxt}»</div>}
        <div className="hp-opts" style={{ marginTop: 10 }}>
          {banco.map((f) => (
            <button key={f} className="hp-ficha" data-modal={f === "May" || f === "Can"} disabled={fichas.includes(f) || pasoP > 0} onClick={() => ponerFicha(f)}>
              {textoFichaP(sit, f)}
            </button>
          ))}
        </div>
        <div className="hp-opts" style={{ marginTop: 10 }}>
          <button className="hp-opt hp-pedir" data-on="true" onClick={comprobarPeticion} disabled={fichas.length === 0 || pasoP > 0} style={{ ["--hpc" as string]: modoCol, background: `${modoCol}1f` }}>
            <i className="fa-solid fa-hand" style={{ marginRight: 8 }} />
            Pedir permiso
          </button>
          <button
            className="hp-opt"
            data-on="false"
            onClick={() => {
              setFichas([]);
              setRevP(null);
            }}
            disabled={pasoP > 0}
            style={{ ["--hpc" as string]: modoCol }}
          >
            <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
            Borrar
          </button>
          {pasoP > 0 && <BotonEscuchar texto={peticionTxt} col={modoCol} />}
        </div>
        {revP && revP.errores.length > 0 && nota(revP.errores.join(" "), WARN, "fa-lightbulb")}
        {revP && revP.errores.length === 0 && revP.registro && (
          <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, border: `1px solid ${revP.cortesAdulto || !npc.adulto ? OK : "#fbbf24"}55`, background: "rgba(4,10,22,0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="hp-pill" style={{ ["--hpc" as string]: "#38bdf8" }}>
                Cortesía: {REGISTRO_DEF[revP.registro].es} · {REGISTRO_DEF[revP.registro].etq}
              </span>
            </div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>{revP.notaRegistro}</div>
          </div>
        )}

        <div style={{ opacity: pasoP >= 1 ? 1 : 0.4, pointerEvents: pasoP >= 1 ? "auto" : "none" }}>
          {sub(`2 · Lee la respuesta de ${npc.nombre}`)}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 15, color: npc.adulto ? "#c4b5fd" : "#fde68a", fontWeight: 800, lineHeight: 1.4 }}>
              {npc.nombre}: «{pasoP >= 1 ? sit.respuesta : "…"}»
            </div>
            {pasoP >= 1 && <BotonEscuchar texto={sit.respuesta} col={modoCol} />}
          </div>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, marginTop: 10 }}>{sit.puedes}</div>
          <div className="hp-opts" style={{ marginTop: 6 }}>
            {[
              [true, "Yes, I can."],
              [false, "No, I can't."],
            ].map(([v, etq]) => {
              const bien = pasoP >= 2 && v === sit.permitido;
              return (
                <button key={String(v)} className="hp-opt hp-puedes" data-on={bien} disabled={pasoP !== 1} onClick={() => decidirPuedes(v as boolean)} style={{ ["--hpc" as string]: bien ? OK : modoCol, background: bien ? `${OK}1f` : "transparent" }}>
                  {etq as string}
                </button>
              );
            })}
          </div>
          <div style={{ opacity: pasoP >= 2 ? 1 : 0.4, pointerEvents: pasoP >= 2 ? "auto" : "none" }}>
            <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, marginTop: 12 }}>{sit.pregunta}</div>
            <div className="hp-opts" style={{ marginTop: 6 }}>
              {sit.opciones.map((o, k) => {
                const bien = pasoP >= 3 && k === sit.correcta;
                return (
                  <button key={o} className="hp-opt hp-comp" data-on={bien} disabled={pasoP !== 2} onClick={() => contestar(k)} style={{ ["--hpc" as string]: bien ? OK : modoCol, background: bien ? `${OK}1f` : "transparent" }}>
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
          {avisoPaso && nota(avisoPaso, WARN, "fa-lightbulb")}
          {pasoP >= 3 && nota(<>¡Entendido! {sit.porque}</>, OK, "fa-circle-check")}
          {pasoP >= 3 && sitIdx < SITUACIONES.length - 1 && (
            <div className="hp-opts" style={{ marginTop: 8 }}>
              <button className="hp-opt hp-sig" data-on="true" onClick={() => irSituacion(sitIdx + 1)} style={{ ["--hpc" as string]: modoCol }}>
                Siguiente situación
                <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
              </button>
            </div>
          )}
        </div>
        {nota("Para pedir permiso: Can I + verbo base…? (cortés) · Can I…, please? (más amable) · May I…? (formal, ideal con adultos). Para darlo: Sure, go ahead / Yes, you can. Para negarlo: Sorry, you can't…", T.text3)}
      </>
    );
  } else {
    control = (
      <>
        <div className="hp-opts">
          {CASOS.map((c, i) => (
            <button key={c.id} className="hp-opt hp-caso" data-on={i === casoIdx} onClick={() => irCaso(i)} aria-label={`Letrero ${i + 1}`} style={{ ["--hpc" as string]: modoCol, background: i === casoIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${LUGAR_DEF[c.lugar].icono}`} style={{ marginRight: 6, color: LUGAR_DEF[c.lugar].color }} />
              {i + 1}
              {reglasOk.has(c.id) ? <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} /> : decididos.has(c.id) ? <i className="fa-solid fa-circle-half-stroke" style={{ marginLeft: 6, color: modoCol }} /> : null}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "#fffdf5", border: "3px solid #1f2937" }}>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>
            <i className={`fa-solid ${LUGAR_DEF[caso.lugar].icono}`} style={{ marginRight: 6, color: LUGAR_DEF[caso.lugar].color }} />
            {LUGAR_DEF[caso.lugar].en}
          </div>
          {LUGAR_DEF[caso.lugar].letrero.map((l) => {
            const tipo = tipoLinea(l);
            const col = tipo === "no" ? "#dc2626" : tipo === "si" ? "#059669" : "#334155";
            return (
              <div key={l} style={{ fontSize: 14.5, fontWeight: 900, color: col, lineHeight: 1.5 }}>
                <i className={`fa-solid ${tipo === "no" ? "fa-ban" : tipo === "si" ? "fa-circle-check" : l.startsWith("Open") ? "fa-clock" : "fa-circle-info"}`} style={{ marginRight: 7 }} />
                {l}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.4 }}>{caso.deseo}</div>
          <BotonEscuchar texto={caso.deseo} col={modoCol} />
        </div>

        {sub(`1 · ¿Puede ${pCaso.nombre} hacerlo?`)}
        <div className="hp-opts">
          {[true, false].map((v) => {
            const bien = decidido && v === caso.puede;
            return (
              <button key={String(v)} className="hp-opt hp-decide" data-on={bien} disabled={decidido} onClick={() => decidir(v)} style={{ ["--hpc" as string]: bien ? (v ? OK : "#f87171") : modoCol, background: bien ? `${v ? OK : "#f87171"}1f` : "transparent", minWidth: 96 }}>
                <i className={`fa-solid ${v ? "fa-circle-check" : "fa-ban"}`} style={{ marginRight: 7 }} />
                {Pron} {v ? "can" : "can't"}
              </button>
            );
          })}
        </div>
        {avisoDec && nota(avisoDec, WARN, "fa-lightbulb")}
        {decidido && nota(caso.porque, OK, "fa-circle-check")}

        <div style={{ opacity: decidido ? 1 : 0.4, pointerEvents: decidido ? "auto" : "none" }}>
          {sub("2 · Escribe la regla con can o can't")}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="hp-in"
              aria-label="La regla en inglés"
              value={reglaTxt}
              placeholder={`${pCaso.nombre} …`}
              data-e={revRegla ? (revRegla.ok ? "bien" : "mal") : ""}
              disabled={reglaHecha}
              onChange={(e) => {
                setReglaTxt(e.target.value);
                setRevRegla(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  comprobarRegla();
                }
              }}
              autoComplete="off"
              spellCheck={false}
              style={{ flex: 1, minWidth: 0, width: "100%" }}
            />
            <button className="hp-opt hp-regla" data-on="true" onClick={comprobarRegla} disabled={reglaHecha} style={{ ["--hpc" as string]: modoCol, background: `${modoCol}1f` }}>
              <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
              Comprobar
            </button>
          </div>
          {revRegla && !revRegla.ok && nota(revRegla.msg, WARN, "fa-lightbulb")}
          {reglaHecha && nota(<>¡Correcto! Por ejemplo: «{caso.modelo}» (can&apos;t = cannot).</>, OK, "fa-circle-check")}
          {reglaHecha && (
            <div className="hp-opts" style={{ marginTop: 8 }}>
              <BotonEscuchar texto={caso.modelo} col={OK} />
              {casoIdx < CASOS.length - 1 && (
                <button className="hp-opt hp-sig" data-on="true" onClick={() => irCaso(casoIdx + 1)} style={{ ["--hpc" as string]: modoCol }}>
                  Siguiente letrero
                  <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                </button>
              )}
            </div>
          )}
        </div>
        {nota("Los letreros con «No …» prohíben: No food allowed = you can't eat here. Los que dicen «can» dan permiso: Visitors can use the Wi-Fi. Se acepta can't, cannot o can not.", T.text3)}
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes hpShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }
        @media (prefers-reduced-motion: reduce){ .hp-in[data-e="mal"], .hp-linea[data-e="mal"] { animation:none !important; } }
        .hp-opts { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .hp-opt { cursor:pointer; border:1px solid var(--hpc); border-radius:10px; padding:9px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .hp-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .hp-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .hp-opt:disabled { cursor:default; }
        .hp-opt:disabled[data-on="false"] { opacity:0.55; }
        .hp-escuchar { cursor:pointer; border:1px solid var(--hpc); border-radius:999px; padding:6px 12px; font-size:14px; font-weight:800; color:#fff; background:rgba(4,10,22,0.45); transition:all .15s; }
        .hp-escuchar:hover { background:rgba(255,255,255,0.08); }
        .hp-pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; border:1px solid var(--hpc); color:#fff; font-size:14px; font-weight:800; }
        .hp-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:700; padding:8px 11px; font-family:inherit; outline:none; transition:all .15s; max-width:100%; }
        .hp-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .hp-in:disabled { opacity:0.8; }
        .hp-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .hp-in[data-e="mal"] { border-color:${WARN}; background:${WARN}14; animation:hpShake .35s; }
        .hp-linea { min-height:48px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:9px 11px; border-radius:12px; border:1.5px dashed rgba(255,255,255,0.2); background:rgba(4,10,22,0.45); }
        .hp-linea[data-e="bien"] { border-style:solid; border-color:${OK}; }
        .hp-linea[data-e="mal"] { border-style:solid; border-color:${WARN}; animation:hpShake .35s; }
        .hp-ficha { cursor:pointer; border:1.5px solid rgba(255,255,255,0.22); border-radius:9px; padding:7px 11px; font-size:14px; font-weight:800; color:#fff; background:rgba(255,255,255,0.05); transition:all .14s; }
        .hp-ficha[data-modal="true"] { border-color:#38bdf888; color:#bae6fd; }
        .hp-ficha:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        .hp-ficha:disabled { opacity:0.3; cursor:default; }
        .hp-puesta { background:rgba(56,189,248,0.16); border-color:#38bdf8; }
        .hp-puesta:disabled { opacity:1; }
        .hp-area { width:100%; box-sizing:border-box; border-radius:12px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; line-height:1.55; padding:12px 14px; font-family:inherit; outline:none; resize:vertical; }
        .hp-area:focus { border-color:var(--hpc); }
        .hp-opt:focus-visible, .hp-ficha:focus-visible, .hp-escuchar:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .hp-guia summary { cursor:pointer; color:${accent}; font-size:14px; font-weight:800; }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <HabScene
              vista={vista}
              modoColor={modoCol}
              resetNonce={resetNonce}
              seleccion={sel}
              intento={intento}
              burbujaClub={burbujaClub}
              insignias={insignias}
              misionIdx={misionIdx}
              onElegir={elegirPersona}
              preguntaMala={!!revPreg && !revPreg.ok}
              sitIdx={sitIdx}
              pasoP={pasoP}
              registro={revP && revP.errores.length === 0 ? revP.registro : null}
              peticionTxt={pasoP === 0 && fichas.length ? peticionTxt : null}
              peticionMala={!!revP && revP.errores.length > 0 && pasoP === 0}
              casoIdx={casoIdx}
              estadoCaso={decidido ? "decidido" : suposicion !== null ? "mal" : "leer"}
              suposicion={suposicion}
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
                  <div style={{ color: "#e6eefb", lineHeight: 1.5, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>{pie}</div>
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
                <UsoCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

                <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizOk} onAprobado={() => setQuizOk(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ya usas can y can't con la forma correcta." />

                <div style={{ ...card, padding: "18px 16px 20px", marginTop: 18 }}>
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

                <TuTurnoCard accent={accent} logrado={a3Ok} onLogrado={() => setA3Ok(true)} playSfx={sfx} />
              </>
            ),
          },
          {
            id: "teoria",
            etiqueta: "Teoría",
            icono: "fa-book-open",
            contenido: (
              <>
                <Bloque titulo="What can you do? Can I…?" icono="fa-people-roof">
                  <div style={{ color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
                </Bloque>

                <Bloque titulo="Lectura A1" icono="fa-book-open">
                  <div style={{ color: "#fff", fontWeight: 800, lineHeight: 1.4 }}>{TITULO_A1}</div>
                  <div style={{ display: "grid", gap: 9 }}>
                    {LECTURA_A1.map((p, i) => (
                      <div key={i} style={{ color: i === 1 || i === 2 ? "#fff" : T.text2, lineHeight: 1.55, whiteSpace: "pre-line" }}>
                        {p}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>COMPRENSIÓN</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {PREGUNTAS_A1.map((x) => (
                      <details key={x.pregunta} className="hp-guia">
                        <summary>{x.pregunta}</summary>
                        <div style={{ color: T.text2, lineHeight: 1.45, marginTop: 4, paddingLeft: 12 }}>{x.respuesta}</div>
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

                <Bloque titulo="Hechos (verdadero o falso, A4)" icono="fa-circle-question">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2, lineHeight: 1.45 }}>
                    {HECHOS.map((h, i) => (
                      <li key={i}>
                        <strong style={{ color: h.respuesta ? OK : WARN }}>{h.respuesta ? "Verdadero" : "Falso"}:</strong> «{h.enunciado}» {h.retro}
                      </li>
                    ))}
                  </ul>
                </Bloque>

                <Bloque titulo="Glosario (A5)" icono="fa-book">
                  <div style={{ display: "grid", gap: 8 }}>
                    {GLOSARIO.map((gi, i) => (
                      <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                        <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                        <span style={{ color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                        <div style={{ color: "#fff", lineHeight: 1.4, marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span>
                            <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                            {gi.ejemplo}
                          </span>
                          <BotonEscuchar texto={gi.ejemplo} col={accent} />
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
                    Son <strong>verbatim</strong> del material de la plataforma: la lectura A1 con sus preguntas, los ejemplos de la tarjeta de estrellas (A1, A2 y A5), el quiz A2, la consigna, pistas y criterios de A3,
                    los hechos A4, el glosario A5, el texto A6 y los criterios de A7. En el último hueco de A6 se aceptan además «May» y «Could», que también son correctas aunque la actividad no las declara. Son{" "}
                    <strong>ilustrativos</strong>: el Centro Comunitario Los Fresnos, sus letreros y horarios, las personas y sus habilidades (nombres ficticios), las situaciones de permiso y sus respuestas. El
                    dato de hablantes de náhuatl es real (INEGI, Censo de Población y Vivienda 2020). La revisión de lo que escribes tolera mayúsculas, signos y las formas can&apos;t / cannot / can not. Fuente: {FUENTE}
                  </div>
                </Bloque>

                <FichaTeorica data={HABILIDADES_PERMISOS_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </>
            ),
          },
        ]}
      />
    </>
  );
}
