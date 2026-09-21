"use client";

/**
 * Laboratorio 3D — "Preguntas al pasado: categorías históricas y diversidad de
 * discursos".
 * Progresión ancla CH-I-P01 (Conciencia Histórica I): «Plantea preguntas a
 * partir de problemáticas actuales en diversos contextos, implementando los
 * conceptos y categorías históricas para el análisis». Integra CH-I-P04
 * («Reconoce el valor de la diversidad de discursos para la construcción de
 * explicaciones históricas») como tercer modo. Marco teórico: lectura
 * CH-I-P01-A1; evaluables: quiz A2 y los textos A6 de P01 y P04.
 *
 * Tres modos:
 *  (1) Del presente al pasado — excavar estratos de tiempo bajo una
 *      problemática actual, clasificar preguntas (fértil, cerrada, anacrónica)
 *      y escribir una pregunta propia.
 *  (2) Categorías en el tiempo — ubicar evidencias en su siglo sobre una
 *      espiral y nombrar la relación entre ellas.
 *  (3) Muchas voces — identificar qué aporta y qué omite cada discurso y tejer
 *      una explicación que integre varios.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { PREGUNTAS_PASADO_FICHA } from "./preguntas-pasado-ficha";

/** Periodos de la espiral (mismos colores que la escena), para la leyenda del visor. */
const PERIODOS_ESPIRAL = [
  { etq: "Mesoamérica · hasta 1521", color: "#b45309" },
  { etq: "Virreinato · 1521–1821", color: "#7c3aed" },
  { etq: "México independiente · 1821–hoy", color: "#0d9488" },
];
import {
  type Modo,
  type ProblemaId,
  type TipoPregunta,
  type Relacion,
  type CasoVocesId,
  type Categoria,
  type Analisis,
  MODOS,
  MODOS_DEF,
  CATEGORIAS,
  CATEGORIA_DEF,
  ESTRATOS,
  PROBLEMAS,
  TIPOS_PREGUNTA,
  analizarPregunta,
  INICIOS,
  EVIDENCIAS,
  SIGLOS,
  sigloDe,
  romano,
  explicaSiglo,
  PROCESO_COLOR,
  PROCESO_ETQ,
  RELACIONES,
  RELACION_DEF,
  VINCULOS,
  CASOS_VOCES,
  ordenOpciones,
  evaluarExplicacion,
  textoExplicacion,
  PREGUNTAS_CATEGORIA,
  rondaCategorias,
  estrellasPorErrores,
  mulberry32,
  baraja,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS,
  VIDEO_P01,
  VIDEO_P04,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_P01,
  HUECOS_P04,
} from "./preguntas-pasado-data";

const PreguntasScene = dynamic(() => import("./PreguntasPasadoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-person-digging fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando las capas del tiempo en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-preguntas-pasado-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaCategorias(mulberry32(7));

/** Orden fijo y barajado de las fichas de cada problemática (las fértiles no van primero). */
const ORDEN_FICHAS: Record<ProblemaId, number[]> = {
  agua: baraja([0, 1, 2, 3, 4, 5], mulberry32(3)),
  lengua: baraja([0, 1, 2, 3, 4, 5], mulberry32(5)),
  migracion: baraja([0, 1, 2, 3, 4, 5], mulberry32(9)),
};

const PISTA_TIPO: Record<TipoPregunta, string> = {
  fertil: "Fíjate otra vez: esta sí abre el análisis y se ubica en un tiempo y un lugar.",
  cerrada: "Pista: ¿se puede responder con un solo dato o con sí/no?",
  anacronica: "Pista: ¿usa una idea, una ley o una tecnología que no existía en esa época?",
};

/* ── Tarjeta de estrellas: ¿qué categoría usa? ───────────────────────── */
function CategoriaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = PREGUNTAS_CATEGORIA[ronda[pos] ?? 0]!;

  const responder = (c: Categoria) => {
    if (resuelto !== null) return;
    const ok = c === actual.categoria;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es «${CATEGORIA_DEF[c].etq}» (${CATEGORIA_DEF[c].pregunta}). Fíjate en qué busca responder la pregunta por encima de todo.`);
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
    setRonda(rondaCategorias(Math.random));
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
          ¿Qué categoría histórica usa?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Pregunta {pos + 1} de {ronda.length} · ¿qué categoría es la central?
          </div>
          <div className="pp-cat-q" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            {actual.texto}
          </div>
          <div className="pp-opts">
            {CATEGORIAS.map((c) => (
              <button key={c} className="pp-opt pp-cat" data-on="true" onClick={() => responder(c)} style={{ ["--ppc" as string]: CATEGORIA_DEF[c].color }}>
                <i className={`fa-solid ${CATEGORIA_DEF[c].icono}`} style={{ marginRight: 8, color: CATEGORIA_DEF[c].color }} />
                {CATEGORIA_DEF[c].etq}
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

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabPreguntasPasado({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("excavar");

  // ── Excavar
  const [problemaId, setProblemaId] = useState<ProblemaId>("agua");
  const [profundidad, setProfundidad] = useState<Record<ProblemaId, number>>({ agua: 0, lengua: 0, migracion: 0 });
  const [estratoSel, setEstratoSel] = useState<number | null>(null);
  const [elecciones, setElecciones] = useState<Record<string, TipoPregunta>>({});
  const [pregunta, setPregunta] = useState("");
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [preguntaFertil, setPreguntaFertil] = useState(false);

  // ── Espiral
  const [paso, setPaso] = useState<"ubicar" | "relacionar">("ubicar");
  const [evId, setEvId] = useState<string>(EVIDENCIAS[0]!.id);
  const [ubicadas, setUbicadas] = useState<string[]>([]);
  const [avisoSiglo, setAvisoSiglo] = useState<{ txt: string; ok: boolean } | null>(null);
  const [vincIdx, setVincIdx] = useState(0);
  const [respVinc, setRespVinc] = useState<Record<string, Relacion>>({});
  const [vincOk, setVincOk] = useState<string[]>([]);

  // ── Voces
  const [casoId, setCasoId] = useState<CasoVocesId>("canal");
  const [vozSel, setVozSel] = useState<string | null>(null);
  const [respAporta, setRespAporta] = useState<Record<string, number>>({});
  const [respOmite, setRespOmite] = useState<Record<string, number>>({});
  const [incluidas, setIncluidas] = useState<Record<CasoVocesId, string[]>>({ canal: [], sismo: [] });
  const [guia, setGuia] = useState<Record<CasoVocesId, number | null>>({ canal: null, sismo: null });

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoP01, setTextoP01] = useState(false);
  const [textoP04, setTextoP04] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
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
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
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
  const modoCol = def.color;

  /* ── Excavar ───────────────────────────────────────────────────────── */
  const problema = PROBLEMAS.find((p) => p.id === problemaId)!;
  const prof = profundidad[problemaId];
  const fichaKey = (pid: ProblemaId, i: number) => `${pid}-${i}`;
  const fichasBien = (pid: ProblemaId) => PROBLEMAS.find((p) => p.id === pid)!.fichas.every((f, i) => elecciones[fichaKey(pid, i)] === f.tipo);

  const excavar = () => {
    if (prof >= ESTRATOS.length) return;
    setProfundidad((p) => ({ ...p, [problemaId]: prof + 1 }));
    setEstratoSel(prof);
    blip();
  };
  const rellenar = () => {
    setProfundidad((p) => ({ ...p, [problemaId]: 0 }));
    setEstratoSel(null);
    blip();
  };
  const elegirProblema = (id: ProblemaId) => {
    setProblemaId(id);
    const pr = profundidad[id];
    setEstratoSel(pr > 0 ? pr - 1 : null);
    setAnalisis(null);
    blip();
  };
  const clasificarFicha = (i: number, t: TipoPregunta) => {
    const k = fichaKey(problemaId, i);
    if (elecciones[k] === problema.fichas[i]!.tipo) return;
    setElecciones((e) => ({ ...e, [k]: t }));
    sfx(t === problema.fichas[i]!.tipo);
  };
  const revisarPregunta = () => {
    const a = analizarPregunta(pregunta, problema);
    setAnalisis(a);
    sfx(a.veredicto === "fertil");
    if (a.veredicto === "fertil") setPreguntaFertil(true);
  };
  const agregarInicio = (s: string) => {
    setPregunta((p) => {
      const base = p.trimEnd();
      if (!base) return `${s} `;
      return `${base} ${s} `;
    });
    setAnalisis(null);
  };

  /* ── Espiral ───────────────────────────────────────────────────────── */
  const evidencia = EVIDENCIAS.find((e) => e.id === evId)!;
  const vinculo = VINCULOS[vincIdx]!;
  const respV = respVinc[vinculo.id];
  const vinculoResuelto = vincOk.includes(vinculo.id);

  const ubicar = (siglo: number) => {
    if (ubicadas.includes(evidencia.id)) return;
    const ok = sigloDe(evidencia.anio) === siglo;
    sfx(ok);
    if (!ok) {
      setAvisoSiglo({ txt: `No es el siglo ${romano(siglo)}. ${explicaSiglo(evidencia.anio)}`, ok: false });
      return;
    }
    const nuevas = [...ubicadas, evidencia.id];
    setUbicadas(nuevas);
    setAvisoSiglo({ txt: `Bien: ${explicaSiglo(evidencia.anio)}`, ok: true });
    const siguiente = EVIDENCIAS.find((e) => !nuevas.includes(e.id));
    if (siguiente) setEvId(siguiente.id);
  };
  const elegirEvidencia = (id: string) => {
    setEvId(id);
    setAvisoSiglo(null);
    blip();
  };
  const nombrarRelacion = (r: Relacion) => {
    if (vinculoResuelto) return;
    setRespVinc((x) => ({ ...x, [vinculo.id]: r }));
    const ok = r === vinculo.correcta;
    sfx(ok);
    if (ok) setVincOk((xs) => [...xs, vinculo.id]);
  };
  const irVinculo = (i: number) => {
    setVincIdx((i + VINCULOS.length) % VINCULOS.length);
    blip();
  };

  /* ── Voces ─────────────────────────────────────────────────────────── */
  const caso = CASOS_VOCES.find((c) => c.id === casoId)!;
  const voz = caso.voces.find((v) => v.id === vozSel) ?? null;
  const identificada = (id: string) => {
    const v = CASOS_VOCES.flatMap((c) => c.voces).find((x) => x.id === id)!;
    return respAporta[id] === v.aportaOk && respOmite[id] === v.omiteOk;
  };
  const identificadasCaso = caso.voces.filter((v) => identificada(v.id)).map((v) => v.id);
  const incl = incluidas[casoId];
  const rubrica = evaluarExplicacion(caso, incl, identificadasCaso, guia[casoId]);
  const rubricaOk = Object.values(rubrica).every(Boolean);
  const explicacionesOk = CASOS_VOCES.filter((c) => {
    const ids = c.voces.filter((v) => identificada(v.id)).map((v) => v.id);
    return Object.values(evaluarExplicacion(c, incluidas[c.id], ids, guia[c.id])).every(Boolean);
  }).length;

  const escucharVoz = (id: string) => {
    setVozSel(id);
    blip();
  };
  const elegirCaso = (id: CasoVocesId) => {
    setCasoId(id);
    setVozSel(null);
    blip();
  };
  const responderAporta = (v: (typeof caso.voces)[number], i: number) => {
    if (respAporta[v.id] === v.aportaOk) return;
    setRespAporta((x) => ({ ...x, [v.id]: i }));
    sfx(i === v.aportaOk);
  };
  const responderOmite = (v: (typeof caso.voces)[number], i: number) => {
    if (respOmite[v.id] === v.omiteOk) return;
    setRespOmite((x) => ({ ...x, [v.id]: i }));
    sfx(i === v.omiteOk);
  };
  const alternarIncluida = (id: string) => {
    setIncluidas((x) => {
      const cur = x[casoId];
      return { ...x, [casoId]: cur.includes(id) ? cur.filter((y) => y !== id) : [...cur, id] };
    });
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "excavar") rellenar();
    if (modo === "voces") setVozSel(null);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const problemasCompletos = PROBLEMAS.filter((p) => profundidad[p.id] >= ESTRATOS.length).length;
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Excavar las cinco capas de tiempo de una problemática", done: problemasCompletos >= 1 },
    { t: "Excavar las tres problemáticas hasta Mesoamérica", done: problemasCompletos === PROBLEMAS.length },
    { t: "Distinguir preguntas fértiles, cerradas y anacrónicas (6 fichas de una problemática)", done: PROBLEMAS.some((p) => fichasBien(p.id)) },
    { t: "Escribir una pregunta histórica fértil con al menos tres categorías", done: preguntaFertil },
    { t: `Ubicar las ${EVIDENCIAS.length} evidencias en su siglo`, done: ubicadas.length === EVIDENCIAS.length },
    { t: `Nombrar las ${VINCULOS.length} relaciones de la espiral`, done: vincOk.length === VINCULOS.length },
    { t: "Identificar qué aporta y qué omite cada voz de un caso", done: CASOS_VOCES.some((c) => c.voces.every((v) => identificada(v.id))) },
    { t: "Tejer una explicación que integre y contraste al menos tres voces", done: explicacionesOk >= 1 },
    { t: "Clasificar preguntas por su categoría y ganar estrellas", done: clasifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar los dos textos (A6 de P01 y de P04)", done: textoP01 && textoP04 },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "excavar") {
    const est = estratoSel !== null ? ESTRATOS[estratoSel]! : null;
    chipVivo = `${problema.etq.toLowerCase()} · ${prof}/${ESTRATOS.length} capas${est ? ` · ${est.etq.toLowerCase()}` : ""}`;
    pie = estratoSel !== null && estratoSel < prof ? `${problema.pistas[estratoSel]!.anio} — ${problema.pistas[estratoSel]!.texto}` : `Hoy: ${problema.presente} Excava para buscar pistas en capas más antiguas.`;
  } else if (modo === "espiral") {
    if (paso === "ubicar") {
      chipVivo = ubicadas.length === EVIDENCIAS.length ? `${EVIDENCIAS.length}/${EVIDENCIAS.length} evidencias ubicadas` : `${evidencia.anio} · ¿qué siglo? · ${ubicadas.length}/${EVIDENCIAS.length}`;
      pie = ubicadas.length === EVIDENCIAS.length ? "Todas las evidencias están en la espiral. Pasa a nombrar las relaciones entre ellas." : `${evidencia.etq}: ${evidencia.texto} Recuerda: el siglo N va del año (N−1)01 al N00.`;
    } else {
      chipVivo = `vínculo ${vincIdx + 1}/${VINCULOS.length} · ${vinculoResuelto ? RELACION_DEF[vinculo.correcta].etq.toLowerCase() : "¿qué relación?"}`;
      pie = vinculoResuelto ? vinculo.porque : vinculo.texto;
    }
  } else {
    chipVivo = `${caso.etq.toLowerCase()} · ${identificadasCaso.length}/${caso.voces.length} voces · ${incl.length} en la explicación`;
    pie = voz ? `${voz.quien} (voz ilustrativa): «${voz.dice}»` : `${caso.fecha}. ${caso.contexto} Toca una voz para escucharla.`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const recuadro = (children: ReactNode, borde: string = T.line) => <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${borde}` }}>{children}</div>;

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "excavar") {
    control = (
      <>
        <div className="pp-opts">
          {PROBLEMAS.map((p) => (
            <button key={p.id} className="pp-opt pp-problema" data-on={p.id === problemaId} onClick={() => elegirProblema(p.id)} style={{ ["--ppc" as string]: modoCol, background: p.id === problemaId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${p.icono}`} style={{ marginRight: 8 }} />
              {p.etq}
              {profundidad[p.id] >= ESTRATOS.length && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("La problemática de hoy")}
        <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{problema.presente}</div>

        {sub(`1 · Excava capas de tiempo (${prof}/${ESTRATOS.length})`)}
        <div className="pp-opts">
          <button className="pp-toggle pp-excavar" onClick={excavar} disabled={prof >= ESTRATOS.length} style={{ ["--ppc" as string]: modoCol, width: "auto", flex: 1 }}>
            <i className="fa-solid fa-person-digging" style={{ marginRight: 9, color: modoCol }} />
            {prof >= ESTRATOS.length ? "Llegaste a Mesoamérica" : `Excavar: ${ESTRATOS[prof]!.etq}`}
          </button>
          <button className="pp-opt" data-on="false" onClick={rellenar} disabled={prof === 0} style={{ ["--ppc" as string]: modoCol }}>
            <i className="fa-solid fa-trowel" style={{ marginRight: 8 }} />
            Rellenar
          </button>
        </div>
        <div className="pp-estratos">
          {ESTRATOS.map((e, i) => (
            <button key={e.id} className="pp-estrato" data-on={estratoSel === i} disabled={i >= prof} onClick={() => { setEstratoSel(i); blip(); }} style={{ ["--ppc" as string]: e.color }}>
              <span style={{ fontWeight: 900 }}>{e.etq}</span>
              <span style={{ fontSize: 10, color: T.text3 }}>{i < prof ? problema.pistas[i]!.anio : "sin excavar"}</span>
            </button>
          ))}
        </div>
        {estratoSel !== null && estratoSel < prof && (
          <div style={{ marginTop: 10 }}>
            {recuadro(
              <>
                <div style={{ fontSize: 11, fontWeight: 900, color: modoCol, marginBottom: 4 }}>
                  {ESTRATOS[estratoSel]!.etq} · {problema.pistas[estratoSel]!.anio}
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{problema.pistas[estratoSel]!.titulo}</div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>{problema.pistas[estratoSel]!.texto}</div>
              </>,
              `${modoCol}55`,
            )}
          </div>
        )}

        {sub("2 · ¿Qué tipo de pregunta es?")}
        <div style={{ display: "grid", gap: 8 }}>
          {ORDEN_FICHAS[problemaId].map((i) => {
            const f = problema.fichas[i]!;
            const k = fichaKey(problemaId, i);
            const elegida = elecciones[k];
            const bien = elegida === f.tipo;
            return (
              <div key={k} className="pp-ficha" data-estado={elegida === undefined ? "nueva" : bien ? "bien" : "mal"}>
                <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>{f.texto}</div>
                <div className="pp-opts" style={{ marginTop: 8 }}>
                  {TIPOS_PREGUNTA.map((t) => {
                    const on = elegida === t.id;
                    const col = on ? (bien ? OK : WARN) : t.color;
                    return (
                      <button key={t.id} className="pp-opt pp-tipo" data-on={on} disabled={bien} onClick={() => clasificarFicha(i, t.id)} style={{ ["--ppc" as string]: col, background: on ? `${col}1f` : "transparent", padding: "6px 10px", fontSize: 11.5 }}>
                        <i className={`fa-solid ${t.icono}`} style={{ marginRight: 6 }} />
                        {t.etq}
                      </button>
                    );
                  })}
                </div>
                {elegida !== undefined && !bien && nota(PISTA_TIPO[f.tipo], WARN, "fa-rotate-left")}
                {bien && (
                  <div style={{ marginTop: 8, fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>
                    <span style={{ color: OK, fontWeight: 900 }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
                      {f.tipo === "fertil" ? `Fértil · ${CATEGORIA_DEF[f.categoria!].etq}. ` : `${TIPOS_PREGUNTA.find((t) => t.id === f.tipo)!.etq}. `}
                    </span>
                    {f.porque}
                    {f.mejor && (
                      <div style={{ marginTop: 5, color: "#fff" }}>
                        <i className="fa-solid fa-seedling" style={{ marginRight: 6, color: OK }} />
                        Versión fértil: {f.mejor}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sub("3 · Escribe tu propia pregunta histórica")}
        <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 8, lineHeight: 1.45 }}>
          Parte de la problemática de hoy y usa las pistas que excavaste. Video A8: «{VIDEO_P01}»
        </div>
        <div className="pp-opts" style={{ marginBottom: 8 }}>
          {INICIOS.map((s) => (
            <button key={s} className="pp-chip" onClick={() => agregarInicio(s)}>
              + {s}
            </button>
          ))}
        </div>
        <textarea
          className="pp-texto"
          aria-label="Tu pregunta histórica"
          value={pregunta}
          onChange={(e) => {
            setPregunta(e.target.value);
            setAnalisis(null);
          }}
          rows={3}
          placeholder="Por ejemplo: ¿Por qué…, desde el siglo…, …?"
        />
        <button className="pp-toggle pp-revisar" onClick={revisarPregunta} disabled={pregunta.trim().length === 0} style={{ ["--ppc" as string]: accent, marginTop: 8 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 9, color: accent }} />
          Revisar mi pregunta
        </button>
        {analisis && (
          <div style={{ marginTop: 10 }}>
            {recuadro(
              <>
                <div style={{ fontSize: 13, fontWeight: 900, color: analisis.veredicto === "fertil" ? OK : analisis.veredicto === "casi" ? "#fbbf24" : WARN }}>
                  {analisis.veredicto === "fertil"
                    ? "Pregunta fértil: abre el análisis y combina categorías."
                    : analisis.veredicto === "casi"
                      ? "Vas bien: le falta poco para ser una pregunta fértil."
                      : analisis.veredicto === "cerrada"
                        ? "Parece una pregunta cerrada."
                        : analisis.veredicto === "anacronica"
                          ? "Cuidado: posible anacronismo."
                          : "Pregunta demasiado corta."}
                </div>
                {analisis.categorias.length > 0 && (
                  <div className="pp-opts" style={{ marginTop: 8 }}>
                    {analisis.categorias.map((c) => (
                      <span key={c} className="pp-tag" style={{ ["--ppc" as string]: CATEGORIA_DEF[c].color }}>
                        <i className={`fa-solid ${CATEGORIA_DEF[c].icono}`} style={{ marginRight: 6 }} />
                        {CATEGORIA_DEF[c].etq}
                      </span>
                    ))}
                  </div>
                )}
                {analisis.consejos.length > 0 && (
                  <ul style={{ margin: "8px 0 0", paddingLeft: 16, display: "grid", gap: 4 }}>
                    {analisis.consejos.map((c, i) => (
                      <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{ fontSize: 10.5, color: T.text3, marginTop: 8 }}>Revisión automática orientativa (busca palabras clave): compártela con tu docente para una valoración completa.</div>
              </>,
              analisis.veredicto === "fertil" ? `${OK}66` : T.line,
            )}
          </div>
        )}
      </>
    );
  } else if (modo === "espiral") {
    control = (
      <>
        <div className="pp-opts">
          <button className="pp-opt pp-paso" data-on={paso === "ubicar"} onClick={() => { setPaso("ubicar"); blip(); }} style={{ ["--ppc" as string]: modoCol, background: paso === "ubicar" ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-location-crosshairs" style={{ marginRight: 8 }} />1 · Ubicar evidencias ({ubicadas.length}/{EVIDENCIAS.length})
          </button>
          <button className="pp-opt pp-paso" data-on={paso === "relacionar"} onClick={() => { setPaso("relacionar"); blip(); }} style={{ ["--ppc" as string]: modoCol, background: paso === "relacionar" ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-link" style={{ marginRight: 8 }} />2 · Nombrar relaciones ({vincOk.length}/{VINCULOS.length})
          </button>
        </div>
        {paso === "ubicar" ? (
          <>
            {sub("Evidencias")}
            <div className="pp-opts">
              {EVIDENCIAS.map((e) => (
                <button key={e.id} className="pp-chip pp-ev" data-on={e.id === evId} onClick={() => elegirEvidencia(e.id)} style={{ ["--ppc" as string]: PROCESO_COLOR[e.proceso] }}>
                  {e.anio}
                  {ubicadas.includes(e.id) && <i className="fa-solid fa-check" style={{ marginLeft: 6, color: OK }} />}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              {recuadro(
                <>
                  <div style={{ fontSize: 10.5, fontWeight: 900, color: PROCESO_COLOR[evidencia.proceso], letterSpacing: "0.06em" }}>{PROCESO_ETQ[evidencia.proceso].toUpperCase()}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginTop: 2 }}>
                    {evidencia.anio} · {evidencia.etq}
                  </div>
                  <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 4 }}>{evidencia.texto}</div>
                </>,
                `${PROCESO_COLOR[evidencia.proceso]}55`,
              )}
            </div>
            {sub(ubicadas.includes(evidencia.id) ? "Ya está en la espiral" : "¿En qué siglo va?")}
            <div className="pp-siglos">
              {SIGLOS.map((s) => {
                const puesta = ubicadas.includes(evidencia.id);
                const correcto = sigloDe(evidencia.anio) === s.n;
                return (
                  <button key={s.n} className="pp-opt pp-siglo" data-on={puesta && correcto} disabled={puesta} onClick={() => ubicar(s.n)} style={{ ["--ppc" as string]: puesta && correcto ? OK : modoCol, background: puesta && correcto ? `${OK}1f` : "transparent" }}>
                    {s.romano}
                  </button>
                );
              })}
            </div>
            {avisoSiglo && nota(avisoSiglo.txt, avisoSiglo.ok ? OK : WARN, avisoSiglo.ok ? "fa-circle-check" : "fa-rotate-left")}
          </>
        ) : (
          <>
            {sub(`Vínculo ${vincIdx + 1} de ${VINCULOS.length}`)}
            <div className="pp-opts">
              {VINCULOS.map((v, i) => (
                <button key={v.id} className="pp-chip pp-vinc" data-on={i === vincIdx} onClick={() => irVinculo(i)} style={{ ["--ppc" as string]: modoCol }}>
                  {i + 1}
                  {vincOk.includes(v.id) && <i className="fa-solid fa-check" style={{ marginLeft: 6, color: OK }} />}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>{recuadro(<div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5, fontWeight: 700 }}>{vinculo.texto}</div>, `${modoCol}55`)}</div>
            {sub("¿Qué relación une a estas evidencias?")}
            <div className="pp-opts">
              {RELACIONES.map((r) => {
                const on = respV === r;
                const col = on ? (r === vinculo.correcta ? OK : WARN) : RELACION_DEF[r].color;
                return (
                  <button key={r} className="pp-opt pp-rel" data-on={on} disabled={vinculoResuelto} onClick={() => nombrarRelacion(r)} style={{ ["--ppc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                    <i className={`fa-solid ${RELACION_DEF[r].icono}`} style={{ marginRight: 8 }} />
                    {RELACION_DEF[r].etq}
                  </button>
                );
              })}
            </div>
            {respV && !vinculoResuelto && nota(`«${RELACION_DEF[respV].etq}» significa: ${RELACION_DEF[respV].define} ¿Es eso lo que describe el vínculo? Vuelve a leerlo.`, WARN, "fa-rotate-left")}
            {vinculoResuelto && (
              <>
                {nota(
                  <>
                    <strong>{RELACION_DEF[vinculo.correcta].etq}.</strong> {vinculo.porque}
                  </>,
                  OK,
                  "fa-circle-check",
                )}
                <button className="pp-opt pp-sigvinc" data-on="true" onClick={() => irVinculo(vincIdx + 1)} style={{ ["--ppc" as string]: modoCol, marginTop: 10 }}>
                  Siguiente vínculo
                  <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
                </button>
              </>
            )}
          </>
        )}
      </>
    );
  } else {
    control = (
      <>
        <div className="pp-opts">
          {CASOS_VOCES.map((c) => (
            <button key={c.id} className="pp-opt pp-caso" data-on={c.id === casoId} onClick={() => elegirCaso(c.id)} style={{ ["--ppc" as string]: modoCol, background: c.id === casoId ? `${modoCol}1f` : "transparent" }}>
              {c.etq} · {c.fecha}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginTop: 10 }}>{caso.contexto}</div>
        {sub("1 · Escucha cada voz")}
        <div className="pp-voces">
          {caso.voces.map((v) => (
            <button key={v.id} className="pp-voz" data-on={v.id === vozSel} onClick={() => escucharVoz(v.id)} style={{ ["--ppc" as string]: v.color }}>
              <i className={`fa-solid ${v.icono}`} style={{ color: v.color, fontSize: 14 }} />
              <span>{v.quien}</span>
              {identificada(v.id) && <i className="fa-solid fa-circle-check" style={{ color: OK, marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
        {voz && (
          <div style={{ marginTop: 10 }}>
            {recuadro(
              <>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", color: T.text3 }}>VOZ ILUSTRATIVA · {voz.quien.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5, marginTop: 4, fontStyle: "italic" }}>«{voz.dice}»</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, margin: "12px 0 6px" }}>¿QUÉ APORTA ESTE DISCURSO?</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {ordenOpciones(voz.id, voz.aporta.length, 17).map((i) => {
                    const on = respAporta[voz.id] === i;
                    const col = on ? (i === voz.aportaOk ? OK : WARN) : voz.color;
                    return (
                      <button key={i} className="pp-opt pp-aporta" data-on={on} disabled={respAporta[voz.id] === voz.aportaOk} onClick={() => responderAporta(voz, i)} style={{ ["--ppc" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}>
                        {voz.aporta[i]}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, margin: "12px 0 6px" }}>¿QUÉ OMITE O DEJA FUERA?</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {ordenOpciones(voz.id, voz.omite.length, 41).map((i) => {
                    const on = respOmite[voz.id] === i;
                    const col = on ? (i === voz.omiteOk ? OK : WARN) : voz.color;
                    return (
                      <button key={i} className="pp-opt pp-omite" data-on={on} disabled={respOmite[voz.id] === voz.omiteOk} onClick={() => responderOmite(voz, i)} style={{ ["--ppc" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}>
                        {voz.omite[i]}
                      </button>
                    );
                  })}
                </div>
                {respAporta[voz.id] !== undefined && respAporta[voz.id] !== voz.aportaOk && nota("Eso no aparece en lo que dice esta voz: busca qué información solo ella podría darte.", WARN, "fa-rotate-left")}
                {respOmite[voz.id] !== undefined && respOmite[voz.id] !== voz.omiteOk && nota("Esa información sí está en su testimonio. Piensa qué perspectiva queda fuera de su mirada.", WARN, "fa-rotate-left")}
                {identificada(voz.id) && nota("Bien leído: todo discurso ilumina una parte del proceso y deja otras en la sombra. Eso no lo invalida; obliga a cruzarlo con otras voces.", OK, "fa-circle-check")}
              </>,
              `${voz.color}66`,
            )}
          </div>
        )}

        {sub("2 · Teje una explicación")}
        <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 6 }}>Elige la pregunta que guía tu explicación:</div>
        <div style={{ display: "grid", gap: 6 }}>
          {caso.guias.map((g, i) => (
            <button key={i} className="pp-opt pp-guia" data-on={guia[casoId] === i} onClick={() => { setGuia((x) => ({ ...x, [casoId]: i })); blip(); }} style={{ ["--ppc" as string]: accent, background: guia[casoId] === i ? `rgba(${color.rgba},0.16)` : "transparent", textAlign: "left" }}>
              {g.texto}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, margin: "10px 0 6px" }}>Toca las voces que integras (tiende un hilo hacia la fogata):</div>
        <div className="pp-opts">
          {caso.voces.map((v) => {
            const on = incl.includes(v.id);
            return (
              <button key={v.id} className="pp-chip pp-incluir" data-on={on} onClick={() => alternarIncluida(v.id)} style={{ ["--ppc" as string]: v.color }}>
                <i className={`fa-solid ${on ? "fa-link" : "fa-plus"}`} style={{ marginRight: 6, color: v.color }} />
                {v.quien}
              </button>
            );
          })}
        </div>
        {incl.length > 0 && <div style={{ marginTop: 10 }}>{recuadro(<div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>{textoExplicacion(caso, incl)}</div>, `${accent}44`)}</div>}
        <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
          {(
            [
              ["inclusion", "Inclusión: integra al menos tres voces"],
              ["diversidad", "Diversidad: tres tipos de discurso distintos, con al menos una voz subalterna"],
              ["contraste", "Contraste: cruza una voz institucional (oficial, técnica o prensa) con voces de quienes vivieron el proceso"],
              ["fundamentacion", "Fundamentación: de cada voz integrada identificaste qué aporta y qué omite"],
              ["pertinencia", "Pertinencia: elegiste una pregunta guía y al menos una voz que la responde directamente"],
            ] as const
          ).map(([k, t]) => (
            <div key={k} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <i className={`fa-solid ${rubrica[k] ? "fa-square-check" : "fa-square"}`} style={{ marginTop: 2, color: rubrica[k] ? OK : "rgba(255,255,255,0.25)" }} />
              <span style={{ fontSize: 11.5, color: rubrica[k] ? "#fff" : T.text2, lineHeight: 1.4 }}>{t}</span>
            </div>
          ))}
        </div>
        {rubricaOk
          ? nota("Explicación integradora. No existe una única versión correcta: tu explicación es más sólida porque reúne y contrasta discursos que por separado cuentan solo una parte.", OK, "fa-circle-check")
          : nota("Aquí no se califica qué voz tiene la razón, sino si tu explicación incluye, contrasta y fundamenta varias voces.", T.text3)}
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 10, lineHeight: 1.45 }}>Video A8 (P04): «{VIDEO_P04}»</div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes ppPulse { 0%,100%{ box-shadow:0 0 0 0 var(--ppd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .pp-live-dot { animation: ppPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .pp-live-dot { animation:none; } }
        .pp-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .pp-grid { grid-template-columns: 1fr; } }
        .pp-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .pp-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .pp-icobtn:hover { background:rgba(255,255,255,0.12); }
        .pp-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .pp-tab { cursor:pointer; border:1px solid var(--ppc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .pp-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .pp-tab:hover { background:rgba(255,255,255,0.06); }
        .pp-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .pp-opt { cursor:pointer; border:1px solid var(--ppc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.35; }
        .pp-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .pp-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .pp-opt:disabled { cursor:default; }
        .pp-opt:disabled[data-on="false"] { opacity:0.5; }
        .pp-chip { cursor:pointer; border:1px solid rgba(255,255,255,0.16); border-radius:999px; padding:6px 11px; font-size:11.5px; font-weight:800; color:rgba(255,255,255,0.82); background:rgba(4,10,22,0.35); transition:all .15s; }
        .pp-chip[data-on="true"] { border-color:var(--ppc); color:#fff; background:rgba(255,255,255,0.08); }
        .pp-chip:hover { background:rgba(255,255,255,0.08); }
        .pp-tag { display:inline-flex; align-items:center; border:1px solid var(--ppc); color:#fff; border-radius:999px; padding:4px 10px; font-size:11px; font-weight:800; }
        .pp-toggle { width:100%; cursor:pointer; border:1px solid var(--ppc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .pp-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .pp-toggle:disabled { cursor:default; opacity:0.6; }
        .pp-estratos { display:grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap:5px; margin-top:10px; }
        @media (max-width: 520px){ .pp-estratos { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        .pp-estrato { cursor:pointer; display:flex; flex-direction:column; gap:2px; align-items:flex-start; padding:7px 8px; border-radius:9px; border:1px solid rgba(255,255,255,0.12); border-left:4px solid var(--ppc); background:rgba(4,10,22,0.4); color:#fff; font-size:11px; text-align:left; min-width:0; }
        .pp-estrato[data-on="true"] { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.4); border-left-color:var(--ppc); }
        .pp-estrato:disabled { cursor:default; opacity:0.45; }
        .pp-ficha { padding:11px 12px; border-radius:11px; border:1px solid rgba(255,255,255,0.1); background:rgba(4,10,22,0.35); }
        .pp-ficha[data-estado="bien"] { border-color:rgba(52,211,153,0.4); }
        .pp-ficha[data-estado="mal"] { border-color:rgba(255,138,60,0.45); }
        .pp-texto { width:100%; box-sizing:border-box; resize:vertical; border-radius:11px; border:1px solid rgba(255,255,255,0.18); background:rgba(4,10,22,0.55); color:#fff; font-size:13px; line-height:1.5; padding:10px 12px; font-family:inherit; }
        .pp-texto:focus { outline:2px solid ${accent}; outline-offset:1px; }
        .pp-siglos { display:grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap:6px; }
        .pp-siglo { text-align:center; font-size:13px; }
        .pp-voces { display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:6px; }
        .pp-voz { cursor:pointer; display:flex; align-items:center; gap:8px; padding:9px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:rgba(4,10,22,0.4); color:#fff; font-size:11.5px; font-weight:800; text-align:left; transition:all .15s; }
        .pp-voz[data-on="true"] { border-color:var(--ppc); background:rgba(255,255,255,0.08); }
        .pp-voz:hover { background:rgba(255,255,255,0.07); }
        .pp-opt:focus-visible, .pp-tab:focus-visible, .pp-toggle:focus-visible, .pp-icobtn:focus-visible, .pp-chip:focus-visible, .pp-estrato:focus-visible, .pp-voz:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .pp-bottom { grid-template-columns: 1fr !important; } }
        .pp-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .pp-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .pp-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .pp-drawer[data-open="true"] { transform:translateX(0); }
        .pp-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .pp-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .pp-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .pp-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .pp-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .pp-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="pp-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const on = m === modo;
            return (
              <button key={m} className="pp-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--ppc" as string]: d.color, background: on ? `${d.color}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? d.color : "inherit" }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pp-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <PreguntasScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                problemaId={problemaId}
                profundidad={prof}
                estratoSel={estratoSel}
                ubicadas={ubicadas}
                evidenciaActual={paso === "ubicar" && ubicadas.length < EVIDENCIAS.length ? evId : null}
                vinculoId={paso === "relacionar" ? vinculo.id : null}
                vinculoResuelto={vinculoResuelto}
                casoId={casoId}
                vozSel={vozSel}
                identificadas={identificadasCaso}
                incluidas={incl}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="pp-live-dot" style={{ ["--ppd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chipVivo}</span>
              </div>
              {modo === "espiral" && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {PERIODOS_ESPIRAL.map((p) => (
                    <span key={p.etq} style={{ padding: "3px 10px", borderRadius: 999, background: `${p.color}dd`, color: "#fff", fontSize: 10.5, fontWeight: 800 }}>
                      {p.etq}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="pp-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="pp-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="pp-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            <button className="pp-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 12 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-magnifying-glass-location" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Qué le preguntamos al pasado?</div>
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
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
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
              <span className="pp-objetivos-n" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} className="pp-objetivo" data-done={o.done} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="pp-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-play" style={{ marginRight: 8, color: accent }} />
              Preguntas de los videos (A8)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              <strong style={{ color: "#fff" }}>Cómo plantear preguntas históricas:</strong> {VIDEO_P01}
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginTop: 6 }}>
              <strong style={{ color: "#fff" }}>La diversidad de discursos en la historia:</strong> {VIDEO_P04}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (V/F A4 de P01 y de P04)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5 de P01 y de P04)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-landmark" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
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
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
              Categorías históricas
            </Eyebrow>
            <div style={{ display: "grid", gap: 7 }}>
              {CATEGORIAS.map((c) => (
                <div key={c} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>
                  <i className={`fa-solid ${CATEGORIA_DEF[c].icono}`} style={{ marginRight: 7, color: CATEGORIA_DEF[c].color }} />
                  <strong style={{ color: "#fff" }}>{CATEGORIA_DEF[c].etq}:</strong> {CATEGORIA_DEF[c].pregunta}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas, el quiz A2, los hechos, el glosario, los dos textos A6 y las preguntas de los videos A8 son <strong>verbatim</strong> del material de la plataforma
          (en el glosario se corrigió la errata «prejudicio»). Las pistas de cada capa y las evidencias de la espiral son <strong>hechos históricos verificables</strong>; las fichas de preguntas
          y los vínculos son ejemplos didácticos. Las <strong>voces del modo «Muchas voces» son ilustrativas</strong>: personajes verosímiles basados en hechos documentados, no citas de
          personas reales. La revisión automática de tu pregunta es orientativa. Fuente: {FUENTE}
        </span>
      </div>

      <CategoriaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ubicas el pasado en el tiempo y en el espacio." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6 · coordenadas espacio-temporales)
        </Eyebrow>
        <div className="pp-huecos-p01" style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_P01} accent={accent} rgba={color.rgba} completado={textoP01} onCompletado={() => { setTextoP01(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6 de P04 · fuentes y sesgo)
        </Eyebrow>
        <div className="pp-huecos-p04" style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_P04} accent={accent} rgba={color.rgba} completado={textoP04} onCompletado={() => { setTextoP04(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="pp-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="pp-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="pp-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="pp-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="pp-drawer-body">
          <FichaTeorica data={PREGUNTAS_PASADO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
