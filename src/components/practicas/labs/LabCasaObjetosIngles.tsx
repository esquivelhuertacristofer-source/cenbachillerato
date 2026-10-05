"use client";

/**
 * Laboratorio 3D — "Objects and spaces: describe el aula y la casa".
 * Práctica anclada a IN-I-P03-A4 (quiz «Describing objects — Quiz») y
 * IN-I-P03-A2 (completa el texto «Describe it!»); progresión 3 de la UAC
 * Inglés I. El marco teórico es la lectura A1, los hechos salen del
 * verdadero/falso A5, el glosario del A6, «Tu turno» del A3 y la
 * autoevaluación del A7.
 *
 * Tres modos:
 *  (1) Find it — leer una instrucción en inglés («Find the small round red
 *      clock») y hacer clic en el objeto del aula; los distractores cambian en
 *      un solo rasgo.
 *  (2) Lost and found — ESCRIBIR la descripción de tu objeto perdido; el
 *      encargado busca en el estante exactamente lo que escribiste.
 *  (3) Arrange the room — seguir instrucciones con preposiciones de lugar y
 *      armar oraciones con There is / There are que el cuarto confirma.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { hablarLab, callarLab } from "./lab-voz";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { CASA_OBJETOS_INGLES_FICHA } from "./casa-objetos-ingles-ficha";
import {
  type Modo,
  type Objeto,
  type MovibleId,
  type SpotId,
  type Categoria,
  MODOS,
  MODOS_DEF,
  mulberry32,
  estrellasPorErrores,
  generaAula,
  rondaBuscar,
  instruccionBuscar,
  nucleo,
  conArticulo,
  rasgosDe,
  nombreEs,
  diferenciasEs,
  PASOS_BUSCAR,
  generaEstante,
  coincide,
  analizaDescripcion,
  preguntaFaltante,
  respuestaVarios,
  respuestaNinguno,
  respuestaOtro,
  respuestaTuyo,
  erroresContraTuyo,
  SALUDO_ENCARGADO,
  CAMPO_ES,
  MOVIBLES,
  MOVIBLE_DEF,
  nombreMovible,
  SPOTS_MARCADOS,
  spot,
  REGLA_PREP,
  generaInstrucciones,
  instruccionEn,
  confirmacionEn,
  PASOS_ACOMODAR,
  analizaHay,
  verificaHay,
  fraseHayEn,
  FICHAS_HAY,
  FRASES_META,
  CATEGORIAS,
  PALABRAS,
  rondaPalabras,
  TITULO_A1,
  LECTURA_A1,
  NOTA_ORDEN,
  PREGUNTAS_A1,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A6,
  A3,
  A7,
  QUIZ_A4,
  HUECOS_A2,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
} from "./casa-objetos-ingles-data";

const CasaScene = dynamic(() => import("./CasaObjetosInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-couch fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el aula y la casa en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-casa-objetos-ingles-reto";
const WARN = "#FF8A3C";
const AULA_INICIAL = generaAula(mulberry32(7));
const RONDA_INICIAL = rondaBuscar(AULA_INICIAL, mulberry32(8));
const ESTANTE_INICIAL = generaEstante(mulberry32(21));
const INSTR_INICIAL = generaInstrucciones(mulberry32(5));
const UBIC_INICIAL = Object.fromEntries(MOVIBLES.map((m) => [m, "rug"])) as Record<MovibleId, SpotId>;
const PALABRAS_INICIAL = rondaPalabras(mulberry32(13));

/* ── Voz (opcional) ───────────────────────────────────────────────────── */
function Escuchar({ texto, col }: { texto: string; col: string }) {
  return (
    <button className="co-listen" onClick={() => hablarLab(texto)} title="Escuchar en inglés" aria-label={`Escuchar: ${texto}`} style={{ ["--coc" as string]: col }}>
      <i className="fa-solid fa-volume-high" />
    </button>
  );
}

/* ── Tarjeta de estrellas: ¿tamaño, forma, color u objeto? ─────────────── */
function ClasificaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(PALABRAS_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = PALABRAS[ronda[pos] ?? 0]!;

  const responder = (cat: Categoria) => {
    if (resuelto !== null) return;
    const ok = cat === actual.cat;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      const def = CATEGORIAS.find((c) => c.id === actual.cat)!;
      setAviso(`«${actual.w}» (${actual.es}) indica ${def.etq.toLowerCase()} (${def.en}), no ${CATEGORIAS.find((c) => c.id === cat)!.etq.toLowerCase()}.`);
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
    setRonda(rondaPalabras(Math.random));
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
          Size, shape or color?
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
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>Palabra {pos + 1} de {ronda.length} · ¿qué indica esta palabra?</div>
          <div className="co-palabra" style={{ fontSize: 26, color: "#fff", fontWeight: 900, lineHeight: 1.2, marginBottom: 12, letterSpacing: "0.02em" }}>
            {actual.w}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIAS.map((c) => (
              <button key={c.id} className="co-opt co-cat" data-on="true" onClick={() => responder(c.id)} style={{ ["--coc" as string]: c.color }}>
                <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8, color: c.color }} />
                {c.etq} <span style={{ color: T.text3, fontWeight: 700 }}>· {c.en}</span>
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

/* ── Tu turno (A3) ────────────────────────────────────────────────────── */
const VOCAB_TEMA = new Set([...PALABRAS.map((p) => p.w), "brown", "pink", "gray", "grey", "clock", "box", "ball", "bed", "book", "books", "chairs", "table", "rug", "there", "on", "under", "in", "next", "between", "front", "near"]);

function TuTurno({ accent }: { accent: string }) {
  const [texto, setTexto] = useState("");
  const palabras = texto.trim() ? texto.trim().split(/\s+/) : [];
  const n = palabras.length;
  const tema = [...new Set(palabras.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).filter((w) => VOCAB_TEMA.has(w)))];
  const col = n < A3.min ? T.text3 : n > A3.max ? WARN : OK;
  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
        Tu turno (A3) · Describo mi espacio en inglés
      </Eyebrow>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{A3.prompt}</div>
      <ul style={{ margin: "10px 0 0", paddingLeft: 16, display: "grid", gap: 4 }}>
        {A3.pistas.map((p, i) => (
          <li key={i} style={{ fontSize: 14, color: T.text3, lineHeight: 1.45 }}>
            {p}
          </li>
        ))}
      </ul>
      <textarea className="co-area" value={texto} onChange={(e) => setTexto(e.target.value)} rows={6} placeholder="In my room there is a big blue bed. There are two small white lamps next to it…" aria-label="Tu descripción (A3)" />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 8, fontSize: 14 }}>
        <span style={{ color: col, fontWeight: 800 }}>
          {n} palabras · mínimo {A3.min}, máximo {A3.max}
        </span>
        <span style={{ color: T.text3 }}>Vocabulario del tema que usaste: {tema.length ? tema.join(", ") : "—"}</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>CRITERIOS DE EVALUACIÓN</div>
      <ul style={{ margin: "6px 0 0", paddingLeft: 16, display: "grid", gap: 4 }}>
        {A3.criterios.map((c, i) => (
          <li key={i} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
            {c}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 8, fontSize: 14, color: T.text3 }}>Esta escritura la revisa tu docente; el contador solo te ayuda a medir la extensión.</div>
    </div>
  );
}

/* ── Autoevaluación (A7) ──────────────────────────────────────────────── */
function Autoevaluacion({ accent, rgba }: { accent: string; rgba: string }) {
  const [niveles, setNiveles] = useState<(number | null)[]>(() => A7.criterios.map(() => null));
  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
        Self-check (A7)
      </Eyebrow>
      <div style={{ fontSize: 14, color: T.text2, marginBottom: 12 }}>{A7.instrucciones}</div>
      <div style={{ display: "grid", gap: 12 }}>
        {A7.criterios.map((c, i) => (
          <div key={i}>
            <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, marginBottom: 6 }}>{c}</div>
            <div className="co-opts">
              {A7.escala.map((e) => {
                const on = niveles[i] === e.valor;
                return (
                  <button
                    key={e.valor}
                    className="co-opt"
                    data-on={on}
                    title={e.descripcion}
                    onClick={() => setNiveles((xs) => xs.map((x, k) => (k === i ? e.valor : x)))}
                    style={{ ["--coc" as string]: accent, background: on ? `rgba(${rgba},0.18)` : "transparent" }}
                  >
                    {e.valor} · {e.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 14, color: T.text3 }}>
        <strong style={{ color: T.text2 }}>Reflexión final:</strong> {A7.reflexion}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

type Resp = { ok: boolean; titulo?: string; en?: string; errores: string[]; notas: string[] };

export function LabCasaObjetosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("buscar");

  // ── Find it
  const [aula, setAula] = useState<Objeto[]>(AULA_INICIAL);
  const [ronda, setRonda] = useState<string[]>(RONDA_INICIAL);
  const [paso, setPaso] = useState(0);
  const [hallados, setHallados] = useState<string[]>([]);
  const [erroresRonda, setErroresRonda] = useState(0);
  const [fallo, setFallo] = useState<{ id: string; n: number } | null>(null);
  const [avisoBuscar, setAvisoBuscar] = useState<Resp | null>(null);
  const [numeros, setNumeros] = useState(false);
  const [totalHallados, setTotalHallados] = useState(0);
  const [rondaPerfecta, setRondaPerfecta] = useState(false);

  // ── Lost and found
  const [estante, setEstante] = useState(ESTANTE_INICIAL);
  const [idxTuyo, setIdxTuyo] = useState(0);
  const [recuperados, setRecuperados] = useState<string[]>([]);
  const [texto, setTexto] = useState("");
  const [coinciden, setCoinciden] = useState<string[]>([]);
  const [equivocado, setEquivocado] = useState<string | null>(null);
  const [burbuja, setBurbuja] = useState(SALUDO_ENCARGADO);
  const [respPerdidos, setRespPerdidos] = useState<Resp | null>(null);
  const [vioAmbigua, setVioAmbigua] = useState(false);
  const [totalRecuperados, setTotalRecuperados] = useState(0);
  const [pista, setPista] = useState(false);

  // ── Arrange the room
  const [instr, setInstr] = useState(INSTR_INICIAL);
  const [pasoA, setPasoA] = useState(0);
  const [ubic, setUbic] = useState<Record<MovibleId, SpotId>>(UBIC_INICIAL);
  const [sel, setSel] = useState<MovibleId | null>(null);
  const [intento, setIntento] = useState<{ obj: MovibleId; spot: SpotId; n: number } | null>(null);
  const [avisoA, setAvisoA] = useState<Resp | null>(null);
  const [instrHechas, setInstrHechas] = useState(false);
  const [textoHay, setTextoHay] = useState("");
  const [frases, setFrases] = useState<string[]>([]);
  const [usoAre, setUsoAre] = useState(false);
  const [respHay, setRespHay] = useState<Resp | null>(null);
  const [marcaFrase, setMarcaFrase] = useState<{ spot: SpotId; texto: string; ok: boolean } | null>(null);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

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

  /* ── Find it ───────────────────────────────────────────────────────── */
  const buscadoId = ronda[paso] ?? null;
  const buscado = buscadoId ? (aula.find((o) => o.id === buscadoId) ?? null) : null;
  const rondaTerminada = paso >= ronda.length;

  const elegirAula = (id: string) => {
    if (!buscado) return;
    const o = aula.find((x) => x.id === id);
    if (!o) return;
    if (hallados.includes(id)) {
      setAvisoBuscar({ ok: false, titulo: "Ese ya lo encontraste.", errores: [], notas: [] });
      return;
    }
    if (id === buscado.id) {
      sfx(true);
      setHallados((h) => [...h, id]);
      setTotalHallados((t) => t + 1);
      setAvisoBuscar({ ok: true, titulo: "¡Correcto!", en: `Yes! That's the ${nucleo(rasgosDe(o))}.`, errores: [], notas: [] });
      if (paso + 1 >= ronda.length && erroresRonda === 0) setRondaPerfecta(true);
      setPaso((p) => p + 1);
    } else {
      sfx(false);
      setErroresRonda((e) => e + 1);
      setFallo((f) => ({ id, n: (f?.n ?? 0) + 1 }));
      setAvisoBuscar({ ok: false, titulo: "Ese no es.", en: `That's the ${nucleo(rasgosDe(o))}.`, errores: [diferenciasEs(o, buscado)], notas: [] });
    }
  };
  const otraRondaBuscar = () => {
    const nueva = generaAula(Math.random);
    setAula(nueva);
    setRonda(rondaBuscar(nueva, Math.random));
    setPaso(0);
    setHallados([]);
    setErroresRonda(0);
    setFallo(null);
    setAvisoBuscar(null);
    blip();
  };

  /* ── Lost and found ────────────────────────────────────────────────── */
  const tuyoId = estante.tuyos[idxTuyo] ?? null;
  const tuyo = tuyoId ? (estante.objetos.find((o) => o.id === tuyoId) ?? null) : null;

  const describir = () => {
    if (!tuyo) return;
    const a = analizaDescripcion(texto);
    setEquivocado(null);
    if (!a.ok || !a.rasgos) {
      sfx(false);
      setCoinciden([]);
      setBurbuja("Sorry, I don't understand. Can you describe it again?");
      setRespPerdidos({ ok: false, titulo: "Revisa tu oración:", errores: a.errores, notas: a.notas });
      return;
    }
    const d = a.rasgos;
    const disponibles = estante.objetos.filter((o) => !recuperados.includes(o.id));
    const hay = disponibles.filter((o) => coincide(o, d));
    if (hay.length === 0) {
      sfx(false);
      setCoinciden([]);
      setBurbuja(respuestaNinguno(d));
      setRespPerdidos({ ok: false, titulo: "No hay nada así en el estante.", errores: [erroresContraTuyo(d, tuyo) || "Mira bien tu objeto: ¿coinciden el tamaño, la forma y el color?"], notas: a.notas });
      return;
    }
    if (hay.length > 1) {
      blip();
      setCoinciden(hay.map((o) => o.id));
      setVioAmbigua(true);
      const falta = preguntaFaltante(hay);
      setBurbuja(respuestaVarios(d, hay));
      const errorTuyo = erroresContraTuyo(d, tuyo);
      setRespPerdidos({
        ok: false,
        titulo: `Tu descripción coincide con ${hay.length} objetos (se iluminan en amarillo).`,
        errores: [errorTuyo || `Te falta decir ${CAMPO_ES[falta.campo]}: agrégalo para que el encargado sepa cuál es.`],
        notas: a.notas,
      });
      return;
    }
    const unico = hay[0]!;
    if (unico.id !== tuyo.id) {
      sfx(false);
      setCoinciden([]);
      setEquivocado(unico.id);
      setBurbuja(respuestaOtro(unico));
      setRespPerdidos({ ok: false, titulo: "El encargado encontró otro objeto (se ilumina en naranja).", errores: [erroresContraTuyo(d, tuyo)], notas: a.notas });
      return;
    }
    sfx(true);
    setCoinciden([]);
    setRecuperados((r) => [...r, tuyo.id]);
    setTotalRecuperados((t) => t + 1);
    setBurbuja(respuestaTuyo(tuyo));
    setRespPerdidos({ ok: true, titulo: "¡Recuperado!", en: `It's ${conArticulo(rasgosDe(tuyo))}.`, errores: [], notas: a.notas });
    setIdxTuyo((i) => i + 1);
    setTexto("");
    setPista(false);
  };
  const otraRondaPerdidos = () => {
    setEstante(generaEstante(Math.random));
    setIdxTuyo(0);
    setRecuperados([]);
    setTexto("");
    setCoinciden([]);
    setEquivocado(null);
    setBurbuja(SALUDO_ENCARGADO);
    setRespPerdidos(null);
    setPista(false);
    blip();
  };

  /* ── Arrange the room ──────────────────────────────────────────────── */
  const insActual = instr[pasoA] ?? null;
  const libre = pasoA >= PASOS_ACOMODAR;

  const pickMovible = (m: MovibleId) => {
    setSel((s) => (s === m ? null : m));
    blip();
  };
  const colocar = (s: SpotId) => {
    if (!sel) {
      setAvisoA({ ok: false, titulo: "Primero elige un objeto: haz clic en él (o en su botón) y luego en el lugar.", errores: [], notas: [] });
      return;
    }
    const obj = sel;
    const ocupado = MOVIBLES.some((m) => m !== obj && ubic[m] === s);
    if (ocupado) {
      sfx(false);
      setAvisoA({ ok: false, titulo: "Ese lugar ya está ocupado. Elige otro.", errores: [], notas: [] });
      return;
    }
    if (libre) {
      setUbic((u) => ({ ...u, [obj]: s }));
      setSel(null);
      blip();
      setAvisoA({ ok: true, titulo: "Movido.", en: confirmacionEn({ obj, spot: s }).replace("Great! ", ""), errores: [], notas: [] });
      return;
    }
    if (!insActual) return;
    if (obj === insActual.obj && s === insActual.spot) {
      sfx(true);
      setUbic((u) => ({ ...u, [obj]: s }));
      setSel(null);
      setMarcaFrase({ spot: s, texto: confirmacionEn(insActual), ok: true });
      setAvisoA({ ok: true, titulo: "¡Correcto!", en: confirmacionEn(insActual), errores: [], notas: [`${spot(s).en} = ${spot(s).es}.`] });
      if (pasoA + 1 >= PASOS_ACOMODAR) setInstrHechas(true);
      setPasoA((p) => p + 1);
      return;
    }
    sfx(false);
    setIntento((i) => ({ obj, spot: s, n: (i?.n ?? 0) + 1 }));
    setSel(null);
    setMarcaFrase(null);
    const errores: string[] = [];
    if (obj !== insActual.obj) errores.push(`La instrucción pide mover ${MOVIBLE_DEF[insActual.obj].es} («${nombreMovible(insActual.obj)}»), no ${MOVIBLE_DEF[obj].es} («${nombreMovible(obj)}»).`);
    if (s !== insActual.spot) {
      const p = spot(insActual.spot);
      errores.push(`Lo llevaste ${spot(s).en} (${spot(s).es}), pero la instrucción dice «${p.en}»: ${p.es}. ${REGLA_PREP[p.prep] ?? ""}`);
    }
    setAvisoA({ ok: false, titulo: "Así no: regresa al tapete.", errores, notas: [] });
  };
  const otraRondaAcomodar = () => {
    setInstr(generaInstrucciones(Math.random));
    setPasoA(0);
    setUbic(UBIC_INICIAL);
    setSel(null);
    setIntento(null);
    setAvisoA(null);
    setMarcaFrase(null);
    setRespHay(null);
    blip();
    setResetNonce((k) => k + 1);
  };

  const comprobarHay = () => {
    const a = analizaHay(textoHay);
    if (!a.ok || !a.frase) {
      sfx(false);
      setMarcaFrase(null);
      setRespHay({ ok: false, titulo: "Revisa la oración:", errores: a.errores, notas: a.notas });
      return;
    }
    const canon = fraseHayEn(a.frase);
    const falso = verificaHay(a.frase, ubic);
    if (falso) {
      sfx(false);
      setMarcaFrase({ spot: a.frase.spot, texto: canon, ok: false });
      setRespHay({ ok: false, titulo: "La oración está bien escrita, pero el cuarto no la confirma:", errores: [falso], notas: a.notas });
      return;
    }
    sfx(true);
    setMarcaFrase({ spot: a.frase.spot, texto: canon, ok: true });
    if (frases.includes(canon)) {
      setRespHay({ ok: true, titulo: "Correcta, pero ya la tenías. Describe otra cosa del cuarto.", en: canon, errores: [], notas: a.notas });
      return;
    }
    setFrases((f) => [...f, canon]);
    if (a.frase.verbo === "are") setUsoAre(true);
    setRespHay({ ok: true, titulo: "¡Correcta y verdadera!", en: canon, errores: [], notas: a.notas });
    setTextoHay("");
  };
  const ponerFicha = (f: string) => {
    setTextoHay((t) => (t.trim() ? `${t.trim()} ${f}` : f));
    blip();
  };
  const borrarUltima = () => setTextoHay((t) => t.trim().split(/\s+/).slice(0, -1).join(" "));

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "buscar") otraRondaBuscar();
    if (modo === "perdidos") otraRondaPerdidos();
    if (modo === "acomodar") otraRondaAcomodar();
    else setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { txt: string; done: boolean }[] = [
    { txt: "Encontrar 6 objetos del aula siguiendo la instrucción en inglés", done: totalHallados >= PASOS_BUSCAR },
    { txt: "Terminar una ronda de Find it sin errores", done: rondaPerfecta },
    { txt: "Recuperar 3 objetos perdidos describiéndolos en inglés", done: totalRecuperados >= 3 },
    { txt: "Ver que una descripción incompleta coincide con varios objetos", done: vioAmbigua },
    { txt: "Seguir las 5 instrucciones para acomodar la recámara", done: instrHechas },
    { txt: `Escribir ${FRASES_META} oraciones con There is / There are que el cuarto confirme`, done: frases.length >= FRASES_META },
    { txt: "Usar «There are» con un plural correcto", done: usoAre },
    { txt: "Clasificar palabras y ganar estrellas", done: identifico },
    { txt: "Aprobar el quiz evaluable (A4)", done: quizAprobado },
    { txt: "Completar el texto (A2)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let pie: ReactNode = "";
  if (modo === "buscar") {
    pie = buscado ? (
      <>
        <strong style={{ color: "#fff" }}>«{instruccionBuscar(buscado)}»</strong> Haz clic en el objeto del aula. {avisoBuscar && !avisoBuscar.ok && avisoBuscar.errores[0]}
      </>
    ) : (
      "¡Encontraste los seis! Pide otra ronda: el aula se vuelve a acomodar con otros colores, formas y tamaños."
    );
  } else if (modo === "perdidos") {
    pie = (
      <>
        <strong style={{ color: "#fff" }}>Encargado: «{burbuja}»</strong> {tuyo ? "Describe en inglés el objeto que señala la flecha. Amarillo: coincide con lo que dijiste; naranja: el encargado encontró otro." : "Recuperaste todo. Pide otra ronda."}
      </>
    );
  } else {
    pie = insActual ? (
      <>
        <strong style={{ color: "#fff" }}>«{instruccionEn(insActual)}»</strong> {sel ? "Ahora haz clic en el lugar numerado." : "Haz clic en el objeto y luego en el lugar."}
      </>
    ) : (
      "Cuarto acomodado. Describe lo que hay con There is / There are, o mueve objetos libremente y descríbelos."
    );
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles siguen aquí.</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;

  const respuesta = (r: Resp | null) =>
    r && (
      <div className="co-resp" data-ok={r.ok} style={{ marginTop: 12, padding: "11px 13px", borderRadius: 12, border: `1px solid ${r.ok ? OK : WARN}55`, background: r.ok ? "rgba(52,211,153,0.07)" : "rgba(255,138,60,0.07)" }}>
        {r.titulo && (
          <div style={{ fontSize: 14, fontWeight: 900, color: r.ok ? OK : WARN }}>
            <i className={`fa-solid ${r.ok ? "fa-circle-check" : "fa-circle-exclamation"}`} style={{ marginRight: 7 }} />
            {r.titulo}
          </div>
        )}
        {r.en && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="co-en" style={{ fontSize: 14, color: "#fff", fontWeight: 800 }}>
              {r.en}
            </span>
            <Escuchar texto={r.en} col={r.ok ? OK : WARN} />
          </div>
        )}
        {r.errores.filter(Boolean).map((e, i) => (
          <div key={`e${i}`} style={{ marginTop: 6, fontSize: 14, color: "#fed7aa", lineHeight: 1.5 }}>
            {e}
          </div>
        ))}
        {r.notas.map((n, i) => (
          <div key={`n${i}`} style={{ marginTop: 6, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 6, color: "#fbbf24" }} />
            {n}
          </div>
        ))}
      </div>
    );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "buscar") {
    control = (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {ronda.map((id, i) => (
              <span key={id} title={`Objeto ${i + 1}`} style={{ width: 26, height: 8, borderRadius: 4, background: i < paso ? OK : i === paso ? modoCol : "rgba(255,255,255,0.14)" }} />
            ))}
          </div>
          <span style={{ fontSize: 14, color: T.text3, fontWeight: 800 }}>Errores en la ronda: {erroresRonda}</span>
        </div>
        {sub("La instrucción")}
        {buscado ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}14` }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: modoCol }} />
            <span className="co-instr" style={{ fontSize: 17, color: "#fff", fontWeight: 900, flex: 1 }}>
              {instruccionBuscar(buscado)}
            </span>
            <Escuchar texto={instruccionBuscar(buscado)} col={modoCol} />
          </div>
        ) : (
          <div style={{ fontSize: 14, color: OK, fontWeight: 800 }}>
            <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
            Ronda completa {erroresRonda === 0 ? "sin errores" : `con ${erroresRonda} ${erroresRonda === 1 ? "error" : "errores"}`}.
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>Haz clic en el objeto dentro del aula. Puedes girar la cámara y acercarte con la rueda del ratón.</div>
        {respuesta(avisoBuscar)}
        {sub("Sin ratón: elige por número")}
        <button className="co-toggle" onClick={() => setNumeros((v) => !v)} data-on={numeros} style={{ ["--coc" as string]: modoCol }}>
          <i className={`fa-solid ${numeros ? "fa-eye-slash" : "fa-hashtag"}`} style={{ marginRight: 9, color: modoCol }} />
          {numeros ? "Ocultar los números" : "Mostrar un número en cada objeto"}
        </button>
        {numeros && (
          <div className="co-opts" style={{ marginTop: 10 }}>
            {aula.map((o, i) => (
              <button key={o.id} className="co-opt co-num" data-on={hallados.includes(o.id)} disabled={!buscado} onClick={() => elegirAula(o.id)} style={{ ["--coc" as string]: hallados.includes(o.id) ? OK : modoCol, minWidth: 40 }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
        <div className="co-opts" style={{ marginTop: 14 }}>
          <button className="co-opt co-otra" data-on={rondaTerminada} onClick={otraRondaBuscar} style={{ ["--coc" as string]: modoCol, background: rondaTerminada ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda (acomodar el aula de nuevo)
          </button>
        </div>
      </>
    );
  } else if (modo === "perdidos") {
    control = (
      <>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {estante.tuyos.map((id, i) => (
            <span key={id} style={{ fontSize: 14, fontWeight: 900, padding: "4px 9px", borderRadius: 999, border: `1px solid ${recuperados.includes(id) ? OK : i === idxTuyo ? modoCol : "rgba(255,255,255,0.14)"}`, color: recuperados.includes(id) ? OK : i === idxTuyo ? "#fff" : T.text3 }}>
              {recuperados.includes(id) && <i className="fa-solid fa-check" style={{ marginRight: 5 }} />}
              Objeto {i + 1}
            </span>
          ))}
        </div>
        {sub("El encargado dice")}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, background: "#ffffff", color: "#0f172a" }}>
          <i className="fa-solid fa-comment" style={{ color: "#0f766e" }} />
          <span className="co-burbuja" style={{ fontSize: 14, fontWeight: 800, flex: 1 }}>
            {burbuja}
          </span>
          <Escuchar texto={burbuja} col="#0f766e" />
        </div>
        {tuyo ? (
          <>
            {sub("Describe tu objeto en inglés")}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="co-in"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") describir();
                }}
                placeholder="It's a big round red lunch box."
                aria-label="Descripción de tu objeto en inglés"
                autoComplete="off"
                spellCheck={false}
              />
              <button className="co-go" onClick={describir} disabled={!texto.trim()} style={{ ["--coc" as string]: modoCol }}>
                <i className="fa-solid fa-paper-plane" style={{ marginRight: 7 }} />
                Decir
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
              Estructura: <strong style={{ color: T.text2 }}>It&apos;s a + tamaño + forma + color + objeto.</strong> Objetos del estante: lunch box, pencil case, backpack, ball, notebook. Mayúsculas, puntos y «it&apos;s / it is» dan igual.
            </div>
            <button className="co-link" onClick={() => setPista((v) => !v)}>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 6 }} />
              {pista ? `Pista: es ${nombreEs(rasgosDe(tuyo), false)}.` : "¿No distingues el color o la forma? Ver pista en español"}
            </button>
          </>
        ) : (
          <div style={{ marginTop: 12, fontSize: 14, color: OK, fontWeight: 800 }}>
            <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
            Recuperaste tus cuatro objetos.
          </div>
        )}
        {respuesta(respPerdidos)}
        <div className="co-opts" style={{ marginTop: 14 }}>
          <button className="co-opt" data-on={!tuyo} onClick={otraRondaPerdidos} style={{ ["--coc" as string]: modoCol, background: !tuyo ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda (otro estante)
          </button>
        </div>
      </>
    );
  } else {
    control = (
      <>
        {sub(libre ? "Parte A · completada: mueve lo que quieras" : `Parte A · instrucción ${pasoA + 1} de ${PASOS_ACOMODAR}`)}
        {insActual ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}14` }}>
            <i className="fa-solid fa-hand-point-right" style={{ color: modoCol }} />
            <span className="co-instr" style={{ fontSize: 16, color: "#fff", fontWeight: 900, flex: 1 }}>
              {instruccionEn(insActual)}
            </span>
            <Escuchar texto={instruccionEn(insActual)} col={modoCol} />
          </div>
        ) : (
          <div style={{ fontSize: 14, color: OK, fontWeight: 800 }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
            Seguiste las cinco instrucciones.
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, fontWeight: 800 }}>1 · Elige el objeto</div>
        <div className="co-opts" style={{ marginTop: 6 }}>
          {MOVIBLES.map((m) => (
            <button key={m} className="co-opt co-mov" data-on={sel === m} onClick={() => pickMovible(m)} style={{ ["--coc" as string]: "#fbbf24", background: sel === m ? "rgba(251,191,36,0.16)" : "transparent" }}>
              {nombreMovible(m)}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, fontWeight: 800 }}>2 · Elige el lugar (los números del cuarto)</div>
        <div className="co-opts" style={{ marginTop: 6 }}>
          {SPOTS_MARCADOS.map((s, i) => (
            <button key={s} className="co-opt co-spot" data-on={sel !== null} onClick={() => colocar(s)} aria-label={`Lugar ${i + 1}`} style={{ ["--coc" as string]: modoCol, minWidth: 40 }}>
              {i + 1}
            </button>
          ))}
        </div>
        {respuesta(avisoA)}

        {sub(`Parte B · describe el cuarto (${frases.length}/${FRASES_META})`)}
        <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, marginBottom: 8 }}>Toca las fichas en orden o escribe la oración. El cuarto comprueba si es verdad.</div>
        {FICHAS_HAY.map((g) => (
          <div key={g.grupo} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ width: 78, fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{g.grupo}</span>
            {g.fichas.map((f) => (
              <button key={f} className="co-ficha" onClick={() => ponerFicha(f)}>
                {f}
              </button>
            ))}
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            className="co-in"
            value={textoHay}
            onChange={(e) => setTextoHay(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") comprobarHay();
            }}
            placeholder="There is a lamp on the desk."
            aria-label="Oración con There is o There are"
            autoComplete="off"
            spellCheck={false}
          />
          <button className="co-go" onClick={comprobarHay} disabled={!textoHay.trim()} style={{ ["--coc" as string]: modoCol }}>
            <i className="fa-solid fa-check" style={{ marginRight: 7 }} />
            Comprobar
          </button>
        </div>
        <div className="co-opts" style={{ marginTop: 6 }}>
          <button className="co-link" onClick={borrarUltima}>
            <i className="fa-solid fa-delete-left" style={{ marginRight: 6 }} />
            Borrar la última palabra
          </button>
          <button className="co-link" onClick={() => setTextoHay("")}>
            <i className="fa-solid fa-eraser" style={{ marginRight: 6 }} />
            Borrar todo
          </button>
        </div>
        {respuesta(respHay)}
        {frases.length > 0 && (
          <div style={{ marginTop: 10, display: "grid", gap: 5 }}>
            {frases.map((f) => (
              <div key={f} style={{ fontSize: 14, color: "#fff", display: "flex", alignItems: "center", gap: 7 }}>
                <i className="fa-solid fa-circle-check" style={{ color: OK }} />
                {f}
              </div>
            ))}
          </div>
        )}
        <div className="co-opts" style={{ marginTop: 14 }}>
          <button className="co-opt" data-on={libre} onClick={otraRondaAcomodar} style={{ ["--coc" as string]: modoCol }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otras instrucciones (todo al tapete)
          </button>
        </div>
      </>
    );
  }

  /* Lectura corta sobre la escena (≤ 10 palabras). */
  let lectura: ReactNode;
  if (modo === "buscar") {
    lectura = buscado ? `«${instruccionBuscar(buscado)}»` : "¡Ronda completa! Pide otra en el panel";
  } else if (modo === "perdidos") {
    lectura = tuyo ? "Describe en inglés el objeto de la flecha" : "Recuperaste los cuatro objetos";
  } else {
    lectura = insActual ? `«${instruccionEn(insActual)}»` : `${frases.length} de ${FRASES_META} oraciones confirmadas`;
  }

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <CasaScene
            vista={modo}
            modoColor={modoCol}
            resetNonce={resetNonce}
            aula={aula}
            halladosAula={hallados}
            falloAula={fallo}
            numerosAula={numeros}
            onPickAula={elegirAula}
            estante={estante.objetos}
            tuyoId={tuyoId}
            coinciden={coinciden}
            equivocadoId={equivocado}
            recuperados={recuperados}
            burbuja={burbuja}
            ubic={ubic}
            seleccion={sel}
            intento={intento}
            marcaFrase={marcaFrase}
            onPickMovible={pickMovible}
            onPickSpot={colocar}
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
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Cuaderno",
          icono: "fa-pen-to-square",
          contenido: (
            <>
              <style>{cssCo(accent, color.rgba)}</style>
              <Bloque titulo={`${def.etq}: qué hacer`} icono={def.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{pie}</p>
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
              <ClasificaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ya describes objetos en inglés." />
              <div style={{ ...card, padding: "20px 18px 22px", marginTop: 22 }}>
                <Eyebrow>
                  <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                  Completa el texto (A2) · Describe it!
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
              <TuTurno accent={accent} />
              <Autoevaluacion accent={accent} rgba={color.rgba} />
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="What does it look like? Where is it?" icono="fa-house-chimney">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Lectura A1" icono="fa-book-open">
                <strong style={{ color: "#fff" }}>{TITULO_A1}</strong>
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>{p}</p>
                ))}
                <div style={{ color: "#fde68a", padding: "9px 11px", borderRadius: 10, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
                  {NOTA_ORDEN}
                </div>
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                {PREGUNTAS_A1.map((q, i) => (
                  <details key={i} className="co-guia">
                    <summary style={{ color: T.text2 }}>
                      <i className="fa-solid fa-circle-question" style={{ marginRight: 6, color: "#7dd3fc" }} />
                      {q.pregunta}
                    </summary>
                    <div style={{ color: T.text3, marginTop: 4, paddingLeft: 20 }}>Respuesta guía: {q.guia}</div>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Hechos (verdadero o falso, A5)" icono="fa-circle-question">
                {HECHOS.map((hh, i) => (
                  <div key={i} style={{ color: T.text2, display: "flex", gap: 8 }}>
                    <span style={{ flexShrink: 0, fontSize: 14, fontWeight: 900, padding: "2px 7px", borderRadius: 6, height: "fit-content", color: "#04121f", background: hh.verdadero ? OK : WARN }}>{hh.verdadero ? "V" : "F"}</span>
                    <span>
                      «{hh.enunciado}» <span style={{ color: T.text3 }}>{hh.retro}</span>
                    </span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Glossary (A6)" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 900, color: accent }}>{g.termino}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, border: `1px solid ${T.line}`, borderRadius: 6, padding: "1px 6px" }}>{g.etiqueta}</span>
                    </div>
                    <div style={{ color: T.text2, marginTop: 3 }}>{g.definicion}</div>
                    <div style={{ color: "#fff", marginTop: 4 }}>
                      <i className="fa-solid fa-quote-left" style={{ color: accent, marginRight: 6 }} />
                      {g.ejemplo}
                    </div>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A6}
                </p>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CASA_OBJETOS_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La lectura A1 con sus preguntas, el texto A2, la consigna A3, el quiz A4, los hechos A5, el glosario A6 y la autoevaluación A7 son <strong>verbatim</strong> del material de la plataforma. El aula, el estante de objetos perdidos, la recámara, los objetos con sus colores y tamaños y todas las instrucciones son <strong>ilustrativos</strong> y se generan al azar; las oraciones en inglés siguen el inglés estadounidense estándar. El orden tamaño → forma → color es el de las gramáticas de referencia (Cambridge Dictionary, «Adjectives: order»); la lectura A1 propone color antes de forma, que se acepta con una nota. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

const cssCo = (accent: string, rgba: string) => `
  .co-opts { display:flex; flex-wrap:wrap; gap:8px; }
  .co-opt { cursor:pointer; border:1px solid var(--coc); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; text-align:left; }
  .co-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
  .co-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
  .co-opt:disabled { cursor:default; opacity:0.5; }
  .co-toggle { width:100%; cursor:pointer; border:1px solid var(--coc); border-radius:11px; padding:10px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
  .co-toggle:hover { background:rgba(255,255,255,0.07); }
  .co-listen { cursor:pointer; flex-shrink:0; width:36px; height:36px; border-radius:9px; border:1px solid var(--coc); background:transparent; color:var(--coc); font-size:14px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
  .co-listen:hover { background:rgba(255,255,255,0.1); }
  .co-in { flex:1; min-width:0; border-radius:10px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:16px; font-weight:700; padding:10px 12px; font-family:inherit; outline:none; transition:all .15s; }
  .co-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.18); }
  .co-area { width:100%; margin-top:12px; border-radius:12px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; line-height:1.55; padding:11px 13px; font-family:inherit; outline:none; resize:vertical; box-sizing:border-box; }
  .co-area:focus { border-color:${accent}; }
  .co-go { cursor:pointer; flex-shrink:0; border:none; border-radius:10px; padding:0 15px; background:var(--coc); color:#1e1b2e; font-size:14px; font-weight:900; transition:all .15s; }
  .co-go:disabled { opacity:0.4; cursor:not-allowed; }
  .co-go:hover:not(:disabled) { filter:brightness(1.08); }
  .co-ficha { cursor:pointer; border:1px solid rgba(255,255,255,0.16); border-radius:8px; padding:6px 10px; font-size:14px; font-weight:800; color:#fff; background:rgba(4,10,22,0.45); transition:all .12s; }
  .co-ficha:hover { border-color:#fbbf24; background:rgba(251,191,36,0.12); }
  .co-link { cursor:pointer; border:none; background:transparent; color:${T.text3}; font-size:14px; font-weight:800; padding:8px 0 0; text-align:left; }
  .co-link:hover { color:#fff; }
  .co-opt:focus-visible, .co-toggle:focus-visible, .co-listen:focus-visible, .co-go:focus-visible, .co-ficha:focus-visible, .co-link:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  .co-guia summary { cursor:pointer; list-style:none; }
  .co-guia summary::-webkit-details-marker { display:none; }
`;
