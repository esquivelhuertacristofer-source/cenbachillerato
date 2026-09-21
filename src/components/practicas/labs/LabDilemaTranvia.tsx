"use client";

/**
 * Laboratorio 3D — "Dilemas éticos: el tranvía, la vida cotidiana y la balanza
 * de argumentos".
 * Práctica anclada a PFH-II-P02-A2 (quiz «Corrientes éticas: ¿quién tiene
 * razón?») y PFH-II-P02-A6 (completa el texto); progresión 2 de la UAC PFH-II.
 * El marco teórico es la lectura A1, el debate del modo 3 es A3, los hechos
 * salen del quiz A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) El tranvía y sus variantes — decidir, justificar y revisar la propia
 *      consistencia en la palanca, el puente, el lazo y el trasplante.
 *  (2) Dilemas de la vida cotidiana — afectados, hechos y valores, y un
 *      argumento armado con fichas (premisa, razón, conclusión).
 *  (3) Balanza de argumentos — clasificar las intervenciones del debate A3 por
 *      teoría o falacia y armar una intervención propia.
 *
 * Nunca se califica la decisión moral del alumno: se evalúa la coherencia, la
 * estructura del argumento, la teoría que sostiene cada razón y las falacias.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { DILEMA_TRANVIA_FICHA } from "./dilema-tranvia-ficha";
import type { VistaDilema } from "./DilemaTranviaScene";
import {
  type Modo,
  type Variante,
  type Decision,
  type Eleccion,
  type CasoId,
  type Slot,
  type RevisionArgumento,
  type Clase,
  type Lado,
  type RevisionIntervencion,
  type Teoria,
  MODOS,
  MODOS_DEF,
  TEORIAS,
  TEORIA_DEF,
  FALACIA_DEF,
  VARIANTES,
  VARIANTE_DEF,
  N_MIN,
  N_MAX,
  N_INICIAL,
  enRiesgo,
  VEREDICTO_DEF,
  veredictoTeoria,
  RAZONES,
  razonCoherente,
  analizarConsistencia,
  TENDENCIA_ENCUESTAS,
  MORAL_MACHINE,
  CASOS,
  SLOTS,
  revisarArgumento,
  CLASES,
  etiquetaClase,
  esFalacia,
  INTERVENCIONES,
  HABLANTES,
  LADO_DEF,
  pesos,
  revisarIntervencion,
  RAZONES_ESTRELLAS,
  rondaEstrellas,
  estrellasPorErrores,
  mulberry32,
  baraja,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  NOTA_RECUADRO,
  PREGUNTAS,
  REFLEXION,
  HECHOS,
  GLOSARIO,
  DEBATE_A3,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
} from "./dilema-tranvia-data";

const DilemaScene = dynamic(() => import("./DilemaTranviaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-train-tram fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando las vías del dilema en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-dilema-tranvia-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaEstrellas(mulberry32(7));
const SLOTS_VACIOS: Record<Slot, string | null> = { premisa: null, razon: null, conclusion: null };

const plural = (k: number, uno: string, varios: string) => (k === 1 ? `1 ${uno}` : `${k} ${varios}`);

/** Qué pasa en la escena con la decisión (descripción del resultado, no un juicio). */
function resultado(v: Variante, d: Decision, n: number): string {
  const k = enRiesgo(v, n);
  const grupo = plural(k, "trabajador", "trabajadores");
  if (v === "palanca") return d === "actuar" ? `El tranvía se desvía: el trabajador de la vía lateral pierde la vida y se salva${k === 1 ? "" : "n"} ${grupo}.` : `El tranvía sigue de frente: ${k === 1 ? "pierde" : "pierden"} la vida ${grupo} y se salva el de la vía lateral.`;
  if (v === "puente") return d === "actuar" ? `La persona cae a la vía y su cuerpo detiene el tranvía: ella pierde la vida y se salva${k === 1 ? "" : "n"} ${grupo}.` : `El tranvía sigue: ${k === 1 ? "pierde" : "pierden"} la vida ${grupo}; la persona del puente se salva.`;
  if (v === "lazo") return d === "actuar" ? `El tranvía entra al lazo y el cuerpo de la persona lo detiene: ella pierde la vida y se salva${k === 1 ? "" : "n"} ${grupo}.` : `El tranvía sigue de frente: ${k === 1 ? "pierde" : "pierden"} la vida ${grupo}; la persona del lazo se salva.`;
  return d === "actuar" ? "Los órganos de la persona sana salvan a los cinco pacientes; ella pierde la vida." : "La persona sana sale del hospital; los cinco pacientes mueren sin recibir un órgano.";
}

/* ── Tarjeta de estrellas: ¿qué teoría habla? ─────────────────────────── */
function TeoriaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = RAZONES_ESTRELLAS[ronda[pos] ?? 0]!;

  const responder = (t: Teoria) => {
    if (resuelto !== null) return;
    const ok = t === actual.teoria;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es ${TEORIA_DEF[t].etq.toLowerCase()}: esa corriente pregunta «${TEORIA_DEF[t].pregunta}»`);
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
    setRonda(rondaEstrellas(Math.random));
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
          ¿Qué teoría habla?
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
            Razón {pos + 1} de {ronda.length} · ¿desde qué corriente ética se razona?
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TEORIAS.map((t) => (
              <button key={t} className="dt-opt dt-teo" data-on="true" onClick={() => responder(t)} style={{ ["--dtc" as string]: TEORIA_DEF[t].color }}>
                <i className={`fa-solid ${TEORIA_DEF[t].icono}`} style={{ marginRight: 8, color: TEORIA_DEF[t].color }} />
                {TEORIA_DEF[t].etq}
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

export function LabDilemaTranvia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("tranvia");

  // ── Tranvía
  const [variante, setVariante] = useState<Variante>("palanca");
  const [n, setN] = useState(N_INICIAL);
  const [decSel, setDecSel] = useState<Decision | null>(null);
  const [razonSel, setRazonSel] = useState<string | null>(null);
  const [textoRazon, setTextoRazon] = useState("");
  const [elecciones, setElecciones] = useState<Partial<Record<Variante, Eleccion>>>({});
  const [animNonce, setAnimNonce] = useState(0);
  const [vioN1, setVioN1] = useState(false);
  const [vioN10, setVioN10] = useState(false);
  const [analizo, setAnalizo] = useState(false);

  // ── Cotidiano
  const [casoId, setCasoId] = useState<CasoId>("examen");
  const [marcados, setMarcados] = useState<string[]>([]);
  const [afRevisado, setAfRevisado] = useState(false);
  const [hv, setHv] = useState<Record<number, "hecho" | "valor">>({});
  const [slots, setSlots] = useState<Record<Slot, string | null>>(SLOTS_VACIOS);
  const [slotActivo, setSlotActivo] = useState<Slot>("premisa");
  const [revision, setRevision] = useState<RevisionArgumento | null>(null);
  const [casosAnalizados, setCasosAnalizados] = useState<Set<CasoId>>(() => new Set());
  const [logros, setLogros] = useState<Partial<Record<CasoId, ("A" | "B")[]>>>({});

  // ── Diálogo
  const [idx, setIdx] = useState(0);
  const [clasificados, setClasificados] = useState<string[]>([]);
  const [resp, setResp] = useState<{ ok: boolean; txt: string } | null>(null);
  const [ladoInt, setLadoInt] = useState<Lado | null>(null);
  const [propias, setPropias] = useState<string[]>([]);
  const [refutada, setRefutada] = useState<string | null>(null);
  const [refutacion, setRefutacion] = useState("");
  const [revInt, setRevInt] = useState<RevisionIntervencion | null>(null);
  const [intervencionOk, setIntervencionOk] = useState(false);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

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

  /* ── Tranvía ───────────────────────────────────────────────────────── */
  const vdef = VARIANTE_DEF[variante];
  const eleccion = elecciones[variante];
  const razonElegida = RAZONES.find((r) => r.id === (eleccion?.razon ?? razonSel)) ?? null;
  const coherente = eleccion && razonElegida ? razonCoherente(razonElegida, variante, eleccion.decision, eleccion.n) : false;
  const coherentes = VARIANTES.filter((v) => {
    const e = elecciones[v];
    const r = RAZONES.find((x) => x.id === e?.razon);
    return !!e && !!r && razonCoherente(r, v, e.decision, e.n);
  });
  const consistencia = analizarConsistencia(elecciones);

  const elegirVariante = (v: Variante) => {
    setVariante(v);
    const e = elecciones[v];
    setDecSel(e?.decision ?? null);
    setRazonSel(e?.razon ?? null);
    setTextoRazon(e?.texto ?? "");
    blip();
  };
  const cambiarN = (k: number) => {
    setN(k);
    if (elecciones[variante] && vdef.numeroLibre) {
      if (k === N_MIN) setVioN1(true);
      if (k === N_MAX) setVioN10(true);
    }
  };
  const confirmar = () => {
    if (!decSel || !razonSel) return;
    const r = RAZONES.find((x) => x.id === razonSel)!;
    setElecciones((es) => ({ ...es, [variante]: { decision: decSel, razon: razonSel, n, texto: textoRazon.trim() } }));
    setAnimNonce((k) => k + 1);
    sfx(razonCoherente(r, variante, decSel, n));
  };
  const cambiarDecision = () => {
    setElecciones((es) => {
      const nx = { ...es };
      delete nx[variante];
      return nx;
    });
    setAnimNonce((k) => k + 1);
    blip();
  };

  /* ── Cotidiano ─────────────────────────────────────────────────────── */
  const caso = CASOS.find((c) => c.id === casoId)!;
  const casoIdx = CASOS.indexOf(caso);
  const fichasOrden = useMemo(() => baraja(caso.fichas, mulberry32(31 + casoIdx * 17)), [caso, casoIdx]);
  const afectadosReales = caso.afectados.filter((a) => a.afectado).map((a) => a.id);
  const afOk = afRevisado && marcados.length === afectadosReales.length && afectadosReales.every((id) => marcados.includes(id));
  const hvOk = caso.enunciados.every((e, i) => hv[i] === e.tipo);
  const postura = revision?.ok ? revision.postura : null;

  const elegirCaso = (id: CasoId) => {
    setCasoId(id);
    setMarcados([]);
    setAfRevisado(false);
    setHv({});
    setSlots(SLOTS_VACIOS);
    setSlotActivo("premisa");
    setRevision(null);
    blip();
  };
  const toggleAfectado = (id: string) => {
    setMarcados((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
    setAfRevisado(false);
    blip();
  };
  const registrarAnalisis = (af: boolean, hvBien: boolean) => {
    if (af && hvBien) setCasosAnalizados((s) => new Set(s).add(casoId));
  };
  const comprobarAfectados = () => {
    setAfRevisado(true);
    const ok = marcados.length === afectadosReales.length && afectadosReales.every((id) => marcados.includes(id));
    sfx(ok);
    registrarAnalisis(ok, hvOk);
  };
  const clasificarHV = (i: number, tipo: "hecho" | "valor") => {
    const nx = { ...hv, [i]: tipo };
    setHv(nx);
    sfx(caso.enunciados[i]!.tipo === tipo);
    registrarAnalisis(afOk, caso.enunciados.every((e, k) => nx[k] === e.tipo));
  };
  const ponerFicha = (id: string) => {
    if (revision?.ok) return;
    const nx = { ...slots };
    (Object.keys(nx) as Slot[]).forEach((s) => {
      if (nx[s] === id) nx[s] = null;
    });
    nx[slotActivo] = id;
    setSlots(nx);
    setRevision(null);
    const sig = SLOTS.map((s) => s.id).find((s) => !nx[s]);
    if (sig) setSlotActivo(sig);
    blip();
  };
  const revisar = () => {
    const r = revisarArgumento(caso, slots);
    setRevision(r);
    sfx(r.ok);
    if (r.ok && r.postura) {
      const p = r.postura;
      setLogros((l) => ({ ...l, [casoId]: [...new Set([...(l[casoId] ?? []), p])] }));
      setAnimNonce((k) => k + 1);
    }
  };
  const otroArgumento = () => {
    setSlots(SLOTS_VACIOS);
    setSlotActivo("premisa");
    setRevision(null);
    blip();
  };

  /* ── Diálogo ───────────────────────────────────────────────────────── */
  const actual = INTERVENCIONES[idx]!;
  const yaClasificada = clasificados.includes(actual.id);
  const todasClasificadas = clasificados.length === INTERVENCIONES.length;
  const peso = pesos(clasificados);

  const clasificar = (c: Clase) => {
    if (yaClasificada) return;
    if (c === actual.clase) {
      setClasificados((xs) => [...xs, actual.id]);
      setResp({ ok: true, txt: `${esFalacia(c) ? `Falacia: ${FALACIA_DEF[c as "adHominem"].define}` : `${TEORIA_DEF[c as Teoria].etq}.`} ${actual.explica}` });
      sfx(true);
      return;
    }
    let txt: string;
    if (esFalacia(c) && !esFalacia(actual.clase)) txt = "No es una falacia: aporta una razón que se puede discutir. ¿Qué mira: consecuencias, deberes, carácter o relaciones de cuidado?";
    else if (!esFalacia(c) && esFalacia(actual.clase)) txt = "Mira bien: ¿da una razón, o ataca a alguien, exagera consecuencias o reduce las opciones a dos?";
    else if (esFalacia(c)) txt = `Sí es una falacia, pero no ${etiquetaClase(c).toLowerCase()}: ${FALACIA_DEF[c as "adHominem"].define}`;
    else txt = `No es ${TEORIA_DEF[c as Teoria].etq.toLowerCase()}: esa corriente pregunta «${TEORIA_DEF[c as Teoria].pregunta}»`;
    setResp({ ok: false, txt });
    sfx(false);
  };
  const siguienteIntervencion = () => {
    const pendiente = INTERVENCIONES.findIndex((x, k) => k > idx && !clasificados.includes(x.id));
    const cualquiera = INTERVENCIONES.findIndex((x) => !clasificados.includes(x.id));
    setIdx(pendiente >= 0 ? pendiente : cualquiera >= 0 ? cualquiera : idx);
    setResp(null);
    blip();
  };
  const togglePropia = (id: string) => {
    setPropias((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : xs.length >= 3 ? xs : [...xs, id]));
    setRevInt(null);
    blip();
  };
  const revisarInt = () => {
    const r = revisarIntervencion(ladoInt, propias, refutada, refutacion);
    setRevInt(r);
    sfx(r.ok);
    if (r.ok) setIntervencionOk(true);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "tranvia") setAnimNonce((k) => k + 1);
    if (modo === "cotidiano") elegirCaso(casoId);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Decidir las cuatro variantes del tranvía con una razón coherente", done: coherentes.length === VARIANTES.length },
    { t: "Poner 1 y 10 personas en la vía y ver qué teorías cambian su veredicto", done: vioN1 && vioN10 },
    { t: "Analizar tu consistencia entre prever un daño y usar a alguien", done: analizo },
    { t: "Identificar a los afectados y separar hechos de valores en un dilema cotidiano", done: casosAnalizados.size > 0 },
    { t: "Construir argumentos bien formados en dos dilemas distintos", done: Object.keys(logros).length >= 2 },
    { t: "Construir un argumento para cada postura en un mismo dilema", done: Object.values(logros).some((l) => (l?.length ?? 0) >= 2) },
    { t: "Clasificar las 14 intervenciones del debate y detectar sus tres falacias", done: todasClasificadas },
    { t: "Armar tu intervención: tres argumentos y una refutación (A3)", done: intervencionOk },
    { t: "Clasificar razones por teoría y ganar estrellas", done: identifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaDilema = modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "tranvia") {
    chipVivo = eleccion ? `${vdef.etq.toLowerCase()} · ${eleccion.decision === "actuar" ? "decidiste actuar" : "decidiste no actuar"}` : `${vdef.etq.toLowerCase()} · ${plural(enRiesgo(variante, n), "persona", "personas")} en riesgo`;
    pie = eleccion ? `${resultado(variante, eleccion.decision, n)} ${vdef.estructuraTxt}` : vdef.texto;
  } else if (modo === "cotidiano") {
    chipVivo = postura ? `argumento válido · postura ${postura}` : `${caso.etq.toLowerCase()} · ${marcados.length} marcados`;
    pie = postura ? (postura === "A" ? caso.escenaA : caso.escenaB) : caso.situacion;
  } else {
    chipVivo = `${clasificados.length}/${INTERVENCIONES.length} clasificadas · ${peso.fines} vs ${peso.limites}`;
    pie = todasClasificadas ? "La balanza no decide quién tiene razón: muestra cuántas razones bien fundadas hay de cada lado. Las falacias no pesan, y un solo argumento sólido puede valer más que varios débiles." : `${HABLANTES[actual.hablante]}: «${actual.texto}»`;
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
  const caja = (children: ReactNode, borde: string = T.line) => <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${borde}`, background: "rgba(4,10,22,0.45)" }}>{children}</div>;

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "tranvia") {
    control = (
      <>
        <div className="dt-opts">
          {VARIANTES.map((v) => {
            const e = elecciones[v];
            const r = RAZONES.find((x) => x.id === e?.razon);
            const bien = !!e && !!r && razonCoherente(r, v, e.decision, e.n);
            return (
              <button key={v} className="dt-opt dt-var" data-on={v === variante} onClick={() => elegirVariante(v)} style={{ ["--dtc" as string]: modoCol, background: v === variante ? `${modoCol}1f` : "transparent" }}>
                <i className={`fa-solid ${VARIANTE_DEF[v].icono}`} style={{ marginRight: 8 }} />
                {VARIANTE_DEF[v].etq}
                {e && <i className={`fa-solid ${bien ? "fa-circle-check" : "fa-circle-exclamation"}`} style={{ marginLeft: 7, color: bien ? OK : WARN }} />}
              </button>
            );
          })}
        </div>
        {sub("El caso")}
        <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 800, lineHeight: 1.5 }}>{vdef.texto}</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 5, lineHeight: 1.45 }}>{vdef.origen}</div>

        {vdef.numeroLibre ? (
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <i className="fa-solid fa-helmet-safety" style={{ color: "#f97316" }} />
            <span style={{ fontSize: 11.5, color: T.text2, fontWeight: 800, whiteSpace: "nowrap" }}>En la vía principal</span>
            <input type="range" aria-label="Personas en la vía principal" className="dt-range" min={N_MIN} max={N_MAX} step={1} value={n} onChange={(e) => cambiarN(Number(e.target.value))} style={{ ["--dtc" as string]: "#f97316" }} />
            <span style={{ width: 92, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{plural(n, "persona", "personas")}</span>
          </label>
        ) : (
          <div style={{ fontSize: 11.5, color: T.text3, marginTop: 10 }}>En el hospital siempre son cinco pacientes, como en el caso de Thomson.</div>
        )}

        {!eleccion ? (
          <>
            {sub("1 · Tu decisión")}
            <div className="dt-opts">
              {(["actuar", "no"] as Decision[]).map((d) => (
                <button key={d} className="dt-opt dt-dec" data-on={decSel === d} onClick={() => { setDecSel(d); blip(); }} style={{ ["--dtc" as string]: modoCol, background: decSel === d ? `${modoCol}1f` : "transparent" }}>
                  <i className={`fa-solid ${d === "actuar" ? "fa-hand-pointer" : "fa-hand"}`} style={{ marginRight: 8 }} />
                  {d === "actuar" ? vdef.actuar : vdef.noActuar}
                </button>
              ))}
            </div>
            {sub("2 · La razón que de verdad te guía")}
            <div style={{ display: "grid", gap: 6 }}>
              {RAZONES.map((r) => (
                <button key={r.id} className="dt-opt dt-razon" data-on={razonSel === r.id} onClick={() => { setRazonSel(r.id); blip(); }} style={{ ["--dtc" as string]: modoCol, background: razonSel === r.id ? `${modoCol}1f` : "transparent", textAlign: "left", fontWeight: 700 }}>
                  «{r.texto}»
                </button>
              ))}
            </div>
            <textarea className="dt-texto" aria-label="Tu razón con tus palabras" placeholder="Escribe tu razón con tus palabras (opcional): ¿por qué decides así?" value={textoRazon} onChange={(e) => setTextoRazon(e.target.value)} maxLength={400} rows={2} />
            <button className="dt-toggle dt-confirmar" onClick={confirmar} disabled={!decSel || !razonSel} style={{ marginTop: 10, ["--dtc" as string]: accent }}>
              <i className="fa-solid fa-play" style={{ marginRight: 9, color: accent }} />
              {!decSel ? "Elige tu decisión" : !razonSel ? "Elige tu razón" : "Confirmar y ver qué pasa"}
            </button>
            {nota("Aquí no hay respuesta correcta que adivinar: se evalúa que tu razón sostenga tu decisión.", T.text3)}
          </>
        ) : (
          <>
            {sub("Tu decisión y tu razón")}
            {caja(
              <>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>
                  {eleccion.decision === "actuar" ? vdef.actuar : vdef.noActuar} · con {plural(eleccion.n, "persona", "personas")} en riesgo
                </div>
                <div style={{ fontSize: 12, color: T.text2, marginTop: 4, lineHeight: 1.45 }}>«{razonElegida?.texto}»</div>
                {eleccion.texto && <div style={{ fontSize: 12, color: T.text2, marginTop: 6, lineHeight: 1.45, fontStyle: "italic" }}>Con tus palabras: «{eleccion.texto}»</div>}
              </>,
              `${modoCol}55`,
            )}
            {razonElegida &&
              nota(
                <>
                  <strong>{coherente ? "Coherente. " : "Tu razón no sostiene tu decisión. "}</strong>
                  {razonElegida.porque(variante, eleccion.n)}
                  {razonElegida.teoria !== "falacia" && ` (Razón de ${TEORIA_DEF[razonElegida.teoria].etq.toLowerCase()}.)`}
                </>,
                coherente ? OK : WARN,
                coherente ? "fa-circle-check" : "fa-triangle-exclamation",
              )}
            <div className="dt-opts" style={{ marginTop: 10 }}>
              <button className="dt-opt dt-cambiar" data-on="false" onClick={cambiarDecision} style={{ ["--dtc" as string]: modoCol }}>
                <i className="fa-solid fa-pen" style={{ marginRight: 8 }} />
                Cambiar mi decisión o mi razón
              </button>
              <button className="dt-opt" data-on="false" onClick={() => { setAnimNonce((k) => k + 1); blip(); }} style={{ ["--dtc" as string]: modoCol }}>
                <i className="fa-solid fa-rotate-right" style={{ marginRight: 8 }} />
                Repetir la escena
              </button>
            </div>

            {sub(`Cómo razonaría cada teoría · ${plural(enRiesgo(variante, n), "persona", "personas")} en riesgo`)}
            <div style={{ display: "grid", gap: 7 }}>
              {(["utilitarismo", "deontologia", "dobleEfecto", "virtudes", "cuidado"] as const).map((t) => {
                const vt = veredictoTeoria(t, variante, n);
                const vd = VEREDICTO_DEF[vt.v];
                return (
                  <div key={t} className="dt-teoria" style={{ padding: "9px 12px", borderRadius: 11, border: `1px solid ${TEORIA_DEF[t].color}40`, background: "rgba(4,10,22,0.4)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>
                        <i className={`fa-solid ${TEORIA_DEF[t].icono}`} style={{ marginRight: 8, color: TEORIA_DEF[t].color }} />
                        {TEORIA_DEF[t].etq}
                      </span>
                      <span className="dt-veredicto" style={{ fontSize: 10.5, fontWeight: 900, padding: "3px 8px", borderRadius: 999, color: vd.color, border: `1px solid ${vd.color}66` }}>
                        {vd.etq}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, marginTop: 4 }}>{vt.txt}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 8, lineHeight: 1.45 }}>Son lecturas típicas de cada corriente; dentro de cada una hay autores que discrepan. {vdef.numeroLibre && "Mueve el número de personas: ¿qué teorías cambian su veredicto y cuáles no?"}</div>
          </>
        )}

        {sub(`Tu consistencia · ${Object.keys(elecciones).length} de 4 variantes decididas`)}
        <button className="dt-toggle dt-analizar" onClick={() => { setAnalizo(true); blip(); }} disabled={!elecciones.palanca || !elecciones.puente} style={{ ["--dtc" as string]: modoCol }}>
          <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 9, color: modoCol }} />
          {!elecciones.palanca || !elecciones.puente ? "Decide al menos la palanca y el puente para analizar tu consistencia" : "Analizar mi consistencia entre variantes"}
        </button>
        {analizo && consistencia.length > 0 && (
          <div style={{ display: "grid", gap: 7, marginTop: 10 }}>
            {consistencia.map((o, i) => (
              <div key={i} style={{ fontSize: 12, color: "#fff", lineHeight: 1.5, padding: "9px 12px", borderRadius: 10, background: `${modoCol}14`, border: `1px solid ${modoCol}44` }}>
                <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: modoCol }} />
                {o}
              </div>
            ))}
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
              <i className="fa-solid fa-users" style={{ marginRight: 7 }} />
              {TENDENCIA_ENCUESTAS}
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
              <i className="fa-solid fa-earth-americas" style={{ marginRight: 7 }} />
              {MORAL_MACHINE}
            </div>
          </div>
        )}
      </>
    );
  } else if (modo === "cotidiano") {
    control = (
      <>
        <div className="dt-opts">
          {CASOS.map((c) => (
            <button key={c.id} className="dt-opt dt-caso" data-on={c.id === casoId} onClick={() => elegirCaso(c.id)} style={{ ["--dtc" as string]: modoCol, background: c.id === casoId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8 }} />
              {c.etq}
              {(logros[c.id]?.length ?? 0) > 0 && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("La situación")}
        <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 800, lineHeight: 1.5 }}>{caso.situacion}</div>

        {sub("1 · ¿A quiénes afecta la decisión? (marca todos)")}
        <div className="dt-opts">
          {caso.afectados.map((a) => {
            const on = marcados.includes(a.id);
            const col = afRevisado ? (on === a.afectado ? (on ? OK : modoCol) : WARN) : modoCol;
            return (
              <button key={a.id} className="dt-opt dt-afectado" data-on={on} onClick={() => toggleAfectado(a.id)} style={{ ["--dtc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${on ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 8 }} />
                {a.etq}
              </button>
            );
          })}
        </div>
        <button className="dt-toggle dt-comprobar" onClick={comprobarAfectados} style={{ marginTop: 10, ["--dtc" as string]: modoCol }}>
          <i className="fa-solid fa-user-check" style={{ marginRight: 9, color: modoCol }} />
          Comprobar afectados
        </button>
        {afRevisado &&
          nota(
            afOk ? (
              "Todos los afectados identificados. Considerar a todos, incluido tú, es el primer paso de una decisión responsable."
            ) : (
              <>
                {caso.afectados
                  .filter((a) => marcados.includes(a.id) !== a.afectado)
                  .map((a) => `${a.etq}: ${a.afectado ? "sí está afectado" : "no está afectado"}. ${a.porque}`)
                  .join(" ")}
              </>
            ),
            afOk ? OK : WARN,
            afOk ? "fa-circle-check" : "fa-rotate-left",
          )}

        {sub("2 · ¿Hecho o valor?")}
        <div style={{ display: "grid", gap: 7 }}>
          {caso.enunciados.map((e, i) => {
            const r = hv[i];
            const bien = r === e.tipo;
            return (
              <div key={i} style={{ padding: "9px 12px", borderRadius: 11, border: `1px solid ${r ? (bien ? `${OK}55` : `${WARN}66`) : T.line}`, background: "rgba(4,10,22,0.4)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, color: "#fff", fontWeight: 700, lineHeight: 1.4, flex: "1 1 220px" }}>«{e.texto}»</span>
                  <span style={{ display: "flex", gap: 5 }}>
                    {(["hecho", "valor"] as const).map((tp) => (
                      <button key={tp} className="dt-opt dt-hv" data-on={r === tp} onClick={() => clasificarHV(i, tp)} style={{ padding: "6px 10px", ["--dtc" as string]: r === tp ? (bien ? OK : WARN) : modoCol, background: r === tp ? `${bien ? OK : WARN}1f` : "transparent" }}>
                        {tp === "hecho" ? "Hecho" : "Valor"}
                      </button>
                    ))}
                  </span>
                </div>
                {r && <div style={{ fontSize: 11.5, color: bien ? OK : WARN, marginTop: 5, lineHeight: 1.4 }}>{bien ? e.porque : `Revisa: ${e.tipo === "hecho" ? "se puede comprobar, así que es un hecho." : "expresa lo que debería ser, así que es un valor."}`}</div>}
              </div>
            );
          })}
        </div>

        {sub("3 · Arma un argumento con las fichas")}
        <div className="dt-slots">
          {SLOTS.map((s, k) => {
            const f = caso.fichas.find((x) => x.id === slots[s.id]);
            const m = revision?.mensajes.find((x) => x.slot === s.id);
            const col = m ? (m.ok ? OK : WARN) : slotActivo === s.id ? modoCol : "rgba(255,255,255,0.18)";
            return (
              <button key={s.id} className="dt-slot" data-activo={slotActivo === s.id} onClick={() => { setSlotActivo(s.id); blip(); }} style={{ ["--dtc" as string]: col }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.06em", color: col, textTransform: "uppercase" }}>
                  {k + 1} · {s.etq}
                </div>
                <div style={{ fontSize: 12, color: f ? "#fff" : T.text3, fontWeight: f ? 700 : 600, marginTop: 4, lineHeight: 1.4 }}>{f ? f.texto : s.ayuda}</div>
                {m && <div style={{ fontSize: 11, color: col, marginTop: 5, lineHeight: 1.4 }}>{m.txt}</div>}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: T.text3, margin: "10px 0 6px" }}>Toca un espacio y después una ficha. Hay hechos, principios, conclusiones… y falacias.</div>
        <div style={{ display: "grid", gap: 6 }}>
          {fichasOrden.map((f) => {
            const usada = (Object.values(slots) as (string | null)[]).includes(f.id);
            return (
              <button key={f.id} className="dt-opt dt-ficha" data-on={usada} onClick={() => ponerFicha(f.id)} disabled={!!revision?.ok} style={{ ["--dtc" as string]: modoCol, background: usada ? `${modoCol}1f` : "transparent", textAlign: "left", fontWeight: 700 }}>
                <i className="fa-solid fa-puzzle-piece" style={{ marginRight: 8, color: usada ? modoCol : T.text3 }} />
                {f.texto}
              </button>
            );
          })}
        </div>
        <div className="dt-opts" style={{ marginTop: 10 }}>
          <button className="dt-opt dt-revisar" data-on="true" onClick={revisar} disabled={!slots.premisa || !slots.razon || !slots.conclusion || !!revision?.ok} style={{ ["--dtc" as string]: accent, background: `rgba(${color.rgba},0.14)` }}>
            <i className="fa-solid fa-list-check" style={{ marginRight: 8 }} />
            Revisar mi argumento
          </button>
          <button className="dt-opt dt-otro" data-on="false" onClick={otroArgumento} style={{ ["--dtc" as string]: modoCol }}>
            <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
            {revision?.ok ? "Armar otro argumento" : "Vaciar"}
          </button>
        </div>
        {revision &&
          nota(
            revision.ok
              ? `Argumento bien formado. Se revisa la estructura, no la postura: ${(logros[casoId]?.length ?? 0) >= 2 ? "ya armaste un argumento para cada postura. Entender el mejor argumento del otro lado es parte de pensar con rigor." : "prueba ahora a construir el argumento de la postura contraria."}`
              : "Revisa lo marcado en naranja: cada parte del argumento debe cumplir su función.",
            revision.ok ? OK : WARN,
            revision.ok ? "fa-circle-check" : "fa-rotate-left",
          )}
        {caso.nota && <div style={{ fontSize: 11.5, color: T.text3, marginTop: 10, lineHeight: 1.5 }}><i className="fa-solid fa-earth-americas" style={{ marginRight: 7 }} />{caso.nota}</div>}
        <div style={{ fontSize: 11, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>El caso y las fichas son ilustrativos, escritos para el laboratorio.</div>
      </>
    );
  } else {
    const otroLado: Lado | null = ladoInt === "fines" ? "limites" : ladoInt === "limites" ? "fines" : null;
    control = (
      <>
        {caja(
          <>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", color: modoCol }}>DEBATE A3</div>
            <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 900, lineHeight: 1.4, marginTop: 3 }}>{DEBATE_A3.tema}</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 16, display: "grid", gap: 4 }}>
              {DEBATE_A3.reglas.map((r, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>
                  {r}
                </li>
              ))}
            </ul>
          </>,
          `${modoCol}55`,
        )}
        {sub(`Intervención ${idx + 1} de ${INTERVENCIONES.length} · ${HABLANTES[actual.hablante]}`)}
        <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, lineHeight: 1.5 }}>«{actual.texto}»</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{actual.verbatim ? "Argumento guía del debate A3 (verbatim)" : "Intervención escrita para el laboratorio"}</div>
        {sub("¿Desde qué teoría argumenta… o es una falacia?")}
        <div className="dt-opts">
          {CLASES.map((c) => {
            const on = yaClasificada && c === actual.clase;
            const col = esFalacia(c) ? "#f87171" : TEORIA_DEF[c as Teoria].color;
            return (
              <button key={c} className="dt-opt dt-clase" data-on={on || !yaClasificada} onClick={() => clasificar(c)} disabled={yaClasificada} style={{ ["--dtc" as string]: col, background: on ? `${col}24` : "transparent" }}>
                <i className={`fa-solid ${esFalacia(c) ? "fa-ban" : TEORIA_DEF[c as Teoria].icono}`} style={{ marginRight: 7, color: col }} />
                {etiquetaClase(c)}
              </button>
            );
          })}
        </div>
        {resp && nota(resp.txt, resp.ok ? OK : WARN, resp.ok ? "fa-circle-check" : "fa-rotate-left")}
        {yaClasificada && !todasClasificadas && (
          <button className="dt-toggle dt-siguiente" onClick={siguienteIntervencion} style={{ marginTop: 10, ["--dtc" as string]: modoCol }}>
            <i className="fa-solid fa-forward" style={{ marginRight: 9, color: modoCol }} />
            Siguiente intervención
          </button>
        )}
        <div className="dt-progreso" style={{ marginTop: 12 }}>
          {INTERVENCIONES.map((x, k) => {
            const hecho = clasificados.includes(x.id);
            const col = hecho ? (esFalacia(x.clase) ? "#f87171" : TEORIA_DEF[x.clase as Teoria].color) : "rgba(255,255,255,0.14)";
            return <button key={x.id} className="dt-punto" data-actual={k === idx} aria-label={`Intervención ${k + 1}`} onClick={() => { setIdx(k); setResp(null); }} style={{ ["--dtc" as string]: col }} />;
          })}
        </div>
        {nota(
          <>
            Falacias detectadas: {clasificados.filter((id) => esFalacia(INTERVENCIONES.find((x) => x.id === id)!.clase)).length} de 3 · Peso: {LADO_DEF.fines.corto} {peso.fines}, {LADO_DEF.limites.corto.toLowerCase()} {peso.limites}.
          </>,
          T.text3,
          "fa-scale-balanced",
        )}

        {todasClasificadas && (
          <>
            {sub("Arma tu intervención para el debate")}
            <div className="dt-opts">
              {(["fines", "limites"] as Lado[]).map((l) => (
                <button key={l} className="dt-opt dt-lado" data-on={ladoInt === l} onClick={() => { setLadoInt(l); setPropias([]); setRefutada(null); setRevInt(null); blip(); }} style={{ ["--dtc" as string]: modoCol, background: ladoInt === l ? `${modoCol}1f` : "transparent", textAlign: "left" }}>
                  {LADO_DEF[l].etq}
                </button>
              ))}
            </div>
            {ladoInt && otroLado && (
              <>
                <div style={{ fontSize: 11.5, color: T.text2, margin: "10px 0 6px", fontWeight: 800 }}>Elige tres argumentos sólidos de tu postura ({propias.length}/3):</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {INTERVENCIONES.map((x) => (
                    <button key={x.id} className="dt-opt dt-propia" data-on={propias.includes(x.id)} onClick={() => togglePropia(x.id)} style={{ ["--dtc" as string]: modoCol, background: propias.includes(x.id) ? `${modoCol}1f` : "transparent", textAlign: "left", fontWeight: 700 }}>
                      <i className={`fa-solid ${propias.includes(x.id) ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 8 }} />
                      {x.texto}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: T.text2, margin: "12px 0 6px", fontWeight: 800 }}>Elige un argumento de la postura contraria para refutarlo:</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {INTERVENCIONES.filter((x) => !propias.includes(x.id)).map((x) => (
                    <button key={x.id} className="dt-opt dt-refutada" data-on={refutada === x.id} onClick={() => { setRefutada(x.id); setRevInt(null); blip(); }} style={{ ["--dtc" as string]: "#f472b6", background: refutada === x.id ? "#f472b61f" : "transparent", textAlign: "left", fontWeight: 700 }}>
                      <i className={`fa-solid ${refutada === x.id ? "fa-circle-dot" : "fa-circle"}`} style={{ marginRight: 8 }} />
                      {x.texto}
                    </button>
                  ))}
                </div>
                <textarea className="dt-texto" aria-label="Tu refutación" placeholder="Escribe tu refutación: ¿por qué ese argumento no basta? Usa conceptos de tu corriente (consecuencias, deber, dignidad…)." value={refutacion} onChange={(e) => { setRefutacion(e.target.value); setRevInt(null); }} maxLength={600} rows={3} />
                <button className="dt-toggle dt-revisar-int" onClick={revisarInt} style={{ marginTop: 10, ["--dtc" as string]: accent }}>
                  <i className="fa-solid fa-microphone-lines" style={{ marginRight: 9, color: accent }} />
                  Revisar mi intervención
                </button>
                {revInt && nota(revInt.txt, revInt.ok ? OK : WARN, revInt.ok ? "fa-circle-check" : "fa-rotate-left")}
                <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "12px 0 6px" }}>CRITERIOS DE EVALUACIÓN (A3)</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 4 }}>
                  {DEBATE_A3.criterios.map((c, i) => (
                    <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes dtPulse { 0%,100%{ box-shadow:0 0 0 0 var(--dtd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .dt-live-dot { animation: dtPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .dt-live-dot { animation:none; } }
        .dt-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .dt-grid { grid-template-columns: 1fr; } }
        .dt-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .dt-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .dt-icobtn:hover { background:rgba(255,255,255,0.12); }
        .dt-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .dt-tab { cursor:pointer; border:1px solid var(--dtc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .dt-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .dt-tab:hover { background:rgba(255,255,255,0.06); }
        .dt-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .dt-opt { cursor:pointer; border:1px solid var(--dtc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.4; }
        .dt-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .dt-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .dt-opt:disabled { cursor:default; }
        .dt-opt:disabled[data-on="false"] { opacity:0.55; }
        .dt-toggle { width:100%; cursor:pointer; border:1px solid var(--dtc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .dt-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .dt-toggle:disabled { cursor:default; opacity:0.6; }
        .dt-range { flex:1; min-width:0; accent-color: var(--dtc); }
        .dt-texto { width:100%; box-sizing:border-box; margin-top:10px; resize:vertical; border-radius:10px; border:1px solid rgba(255,255,255,0.16); background:rgba(4,10,22,0.55);
          color:#fff; font:inherit; font-size:12.5px; line-height:1.5; padding:9px 12px; }
        .dt-texto::placeholder { color:rgba(255,255,255,0.38); }
        .dt-texto:focus { outline:2px solid ${accent}; outline-offset:1px; }
        .dt-slots { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:8px; }
        @media (max-width: 700px){ .dt-slots { grid-template-columns: 1fr; } }
        .dt-slot { cursor:pointer; text-align:left; border:1px dashed var(--dtc); border-radius:11px; padding:10px 11px; background:rgba(4,10,22,0.45); transition:all .15s; min-height:74px; }
        .dt-slot[data-activo="true"] { border-style:solid; box-shadow:0 0 0 3px rgba(255,255,255,0.05); }
        .dt-progreso { display:flex; gap:5px; flex-wrap:wrap; }
        .dt-punto { cursor:pointer; width:18px; height:18px; border-radius:6px; border:1px solid rgba(255,255,255,0.2); background:var(--dtc); padding:0; }
        .dt-punto[data-actual="true"] { outline:2px solid #fff; outline-offset:1px; }
        .dt-opt:focus-visible, .dt-tab:focus-visible, .dt-toggle:focus-visible, .dt-icobtn:focus-visible, .dt-range:focus-visible, .dt-slot:focus-visible, .dt-punto:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .dt-bottom { grid-template-columns: 1fr !important; } }
        .dt-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .dt-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .dt-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .dt-drawer[data-open="true"] { transform:translateX(0); }
        .dt-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .dt-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .dt-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .dt-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .dt-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .dt-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="dt-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const on = m === modo;
            return (
              <button key={m} className="dt-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--dtc" as string]: d.color, background: on ? `${d.color}1f` : "transparent" }}>
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

      <div className="dt-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
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
              <DilemaScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                variante={variante}
                n={n}
                decision={eleccion?.decision ?? null}
                animNonce={animNonce}
                casoId={casoId}
                marcados={marcados}
                postura={postura}
                actualId={actual.id}
                clasificados={clasificados}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="dt-live-dot" style={{ ["--dtd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span className="dt-chip" style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>
                  {chipVivo}
                </span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="dt-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="dt-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="dt-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div className="dt-pie" style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>
                {pie}
              </div>
            </div>

            <button className="dt-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-scale-balanced" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Cómo decidir cuando los valores chocan?</div>
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
              {REFLEXION.map((q) => (
                <li key={q.ancla} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q.texto} <span style={{ color: T.text3, fontSize: 10.5 }}>({q.ancla})</span>
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
              <span className="dt-objetivos" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="dt-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-train-tram" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.45, marginTop: 6, fontStyle: "italic" }}>{NOTA_RECUADRO}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (quiz A4)
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
              Glosario (A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
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
              <i className="fa-solid fa-ban" style={{ marginRight: 8, color: accent }} />
              Falacias frecuentes
            </Eyebrow>
            <div style={{ display: "grid", gap: 7 }}>
              {(Object.keys(FALACIA_DEF) as (keyof typeof FALACIA_DEF)[]).map((f) => (
                <div key={f} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: "#fff" }}>{FALACIA_DEF[f].etq}.</strong> {FALACIA_DEF[f].define}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas y su recuadro, el quiz A2, el tema, las reglas, los criterios y los nueve argumentos guía del debate A3, los hechos del quiz A4, el glosario A5, el texto A6 y las preguntas de reflexión de A5, A7 y A8 son{" "}
          <strong>verbatim</strong> del material de la plataforma. Las variantes del tranvía son las de la literatura filosófica (Philippa Foot, 1967; Judith Jarvis Thomson, 1976 y 1985); cómo razonaría cada teoría es una{" "}
          <strong>lectura típica</strong>, no la única posible. Los dilemas cotidianos, las fichas, los personajes, las cinco intervenciones que no vienen de A3 y el reparto del agua son <strong>ilustrativos</strong>, escritos para el laboratorio. La tendencia de las encuestas se describe sin cifras; el experimento Moral Machine es Awad y colaboradores, <em>Nature</em> 563, 2018. En ningún modo se califica tu postura moral. Fuente: {FUENTE}
        </span>
      </div>

      <TeoriaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Distingues las grandes corrientes éticas." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="dt-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="dt-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="dt-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="dt-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="dt-drawer-body">
          <FichaTeorica data={DILEMA_TRANVIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
