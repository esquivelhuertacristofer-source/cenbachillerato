"use client";

/**
 * Laboratorio 3D — "Archivo de fuentes históricas: crítica, corroboración y
 * uso ético de la evidencia".
 * Práctica anclada a CH-III-P02 (Conciencia Histórica III, progresión 2:
 * «Examina de manera crítica las evidencias y evalúa su validez…»). Reto
 * evaluable: los reactivos del video A1 y el verdadero/falso A4; texto A6;
 * hechos A2; glosario A5; debate A3; reflexión A7.
 *
 * Tres modos sobre un expediente de la expropiación petrolera de 1938:
 *  (1) Ficha de procedencia — examinar con la lupa cada zona de cuatro
 *      documentos (y su reverso) y llenar autor, fecha y lugar, destinatario,
 *      intención y cercanía al hecho.
 *  (2) Corroborar — tender hilos entre siete fuentes y tres afirmaciones en un
 *      tablero de corcho, dictaminar (incluida la suspensión del juicio) y
 *      desenmascarar la carta con anacronismos.
 *  (3) Uso ético e interpretación — reconstruir el contexto de una foto
 *      recortada y mal fechada en redes, reescribir la publicación con cita, y
 *      armar una interpretación argumentada en la balanza de la evidencia.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { ARCHIVO_FUENTES_FICHA } from "./archivo-fuentes-ficha";
import type { VistaArchivo } from "./ArchivoFuentesScene";
import {
  type Modo,
  type SoporteId,
  type ZonaId,
  type CampoId,
  type FuenteId,
  type Relacion,
  type Hilos,
  type VeredictoId,
  MODOS,
  MODOS_DEF,
  CASO_TITULO,
  CONTEXTO,
  ZONAS,
  ZONA_DEF,
  CAMPOS,
  CAMPO_DEF,
  DOCUMENTOS,
  ordenOpciones,
  FUENTES_TABLERO,
  FUENTE_DEF,
  FRAGMENTOS_FALSA,
  AFIRMACIONES,
  VEREDICTOS,
  hilosErroneos,
  POST,
  PIE_ORIGINAL,
  PROBLEMAS_POST,
  CRITERIOS_REESCRITURA,
  PREGUNTA_INTERP,
  TESIS,
  PESO_INTERP,
  PESO_MINIMO,
  MAX_SOSTIENEN,
  CONCLUSIONES,
  evaluarInterpretacion,
  ITEMS_CONFIABLE,
  rondaConfiable,
  estrellasPorErrores,
  mulberry32,
  PROGRESION,
  TITULO_LECTURA,
  LECTURA,
  REFLEXION_A7,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  DEBATE_A3,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ,
  HUECOS_A6,
} from "./archivo-fuentes-data";

const ArchivoScene = dynamic(() => import("./ArchivoFuentesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-box-archive fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Abriendo el archivo en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-archivo-fuentes-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaConfiable(mulberry32(5));

type PasoEtica = "post" | "interp";

/* ── Tarjeta de estrellas: ¿sirve para ESTA pregunta? ─────────────────── */
function ConfiableCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = ITEMS_CONFIABLE[ronda[pos] ?? 0]!;

  const responder = (sirve: boolean) => {
    if (resuelto !== null) return;
    const ok = sirve === actual.sirve;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${actual.sirve ? "Sí sirve" : "No sirve"} para esta pregunta: ${actual.porque}`);
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
    setRonda(rondaConfiable(Math.random));
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
          ¿Sirve para esta pregunta?
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
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 8 }}>
            Caso {pos + 1} de {ronda.length} · la misma fuente puede servir para una pregunta y no para otra
          </div>
          <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: T.text2 }}>
              <i className="fa-solid fa-file-lines" style={{ marginRight: 7, color: accent }} />
              Fuente: <strong style={{ color: "#fff" }}>{actual.fuente}</strong>
            </div>
            <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              {actual.pregunta}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="af-opt af-conf" data-on="true" onClick={() => responder(true)} style={{ ["--afc" as string]: OK }}>
              <i className="fa-solid fa-thumbs-up" style={{ marginRight: 8 }} />
              Sirve como evidencia
            </button>
            <button className="af-opt af-conf" data-on="true" onClick={() => responder(false)} style={{ ["--afc" as string]: WARN }}>
              <i className="fa-solid fa-thumbs-down" style={{ marginRight: 8 }} />
              No es buena evidencia para esto
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

type Respuestas = Partial<Record<CampoId, number>>;

export function LabArchivoFuentes({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("ficha");

  // ── Ficha
  const [docIdx, setDocIdx] = useState(0);
  const [volteado, setVolteado] = useState(false);
  const [zona, setZona] = useState<ZonaId | null>(null);
  const [vistas, setVistas] = useState<Partial<Record<SoporteId, ZonaId[]>>>({});
  const [respuestas, setRespuestas] = useState<Partial<Record<SoporteId, Respuestas>>>({});
  const [comprobadas, setComprobadas] = useState<Partial<Record<SoporteId, boolean>>>({});
  const [fichados, setFichados] = useState<SoporteId[]>([]);

  // ── Corroborar
  const [afIdx, setAfIdx] = useState(0);
  const [hilosPor, setHilosPor] = useState<Partial<Record<string, Hilos>>>({});
  const [hilosRevisados, setHilosRevisados] = useState<Partial<Record<string, boolean>>>({});
  const [veredictos, setVeredictos] = useState<Partial<Record<string, VeredictoId>>>({});
  const [fuenteSel, setFuenteSel] = useState<FuenteId | null>(null);
  const [lupaFalsa, setLupaFalsa] = useState(false);
  const [fragSel, setFragSel] = useState<number | null>(null);
  const [examinados, setExaminados] = useState<number[]>([]);
  const [avisoFrag, setAvisoFrag] = useState<{ txt: string; ok: boolean } | null>(null);

  // ── Ética
  const [paso, setPaso] = useState<PasoEtica>("post");
  const [problemas, setProblemas] = useState<string[]>([]);
  const [problemasRevisados, setProblemasRevisados] = useState(false);
  const [sinRecorte, setSinRecorte] = useState(0);
  const [fotoVolteada, setFotoVolteada] = useState(false);
  const [vioReverso, setVioReverso] = useState(false);
  const [borrador, setBorrador] = useState("");
  const [publicado, setPublicado] = useState<string | null>(null);
  const [tesis, setTesis] = useState<string | null>(null);
  const [sostienen, setSostienen] = useState<FuenteId[]>([]);
  const [matiz, setMatiz] = useState<FuenteId | null>(null);
  const [conclusion, setConclusion] = useState<string | null>(null);
  const [interpRevisada, setInterpRevisada] = useState(false);
  const [interpLista, setInterpLista] = useState(false);

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

  /* ── Ficha ─────────────────────────────────────────────────────────── */
  const doc = DOCUMENTOS[docIdx]!;
  const vistasDoc = vistas[doc.id] ?? [];
  const resp = respuestas[doc.id] ?? {};
  const comprobada = !!comprobadas[doc.id];
  const erroresFicha = CAMPOS.filter((c) => resp[c] !== undefined && resp[c] !== 0);
  const fichaLlena = CAMPOS.every((c) => resp[c] !== undefined);
  const fichaCompleta = fichados.includes(doc.id);
  const docExaminado = DOCUMENTOS.some((d) => (vistas[d.id] ?? []).length === ZONAS.length);

  const examinar = (z: ZonaId) => {
    setZona(z);
    setVolteado(z === "reverso");
    setVistas((v) => {
      const xs = v[doc.id] ?? [];
      return xs.includes(z) ? v : { ...v, [doc.id]: [...xs, z] };
    });
    blip();
  };
  const voltear = () => {
    const nv = !volteado;
    setVolteado(nv);
    if (nv) examinar("reverso");
    else setZona(null);
  };
  const elegirCampo = (c: CampoId, opcion: number) => {
    if (fichaCompleta) return;
    setRespuestas((r) => ({ ...r, [doc.id]: { ...(r[doc.id] ?? {}), [c]: opcion } }));
    setComprobadas((x) => ({ ...x, [doc.id]: false }));
    blip();
  };
  const comprobarFicha = () => {
    setComprobadas((x) => ({ ...x, [doc.id]: true }));
    const ok = CAMPOS.every((c) => resp[c] === 0);
    sfx(ok);
    if (ok) setFichados((f) => (f.includes(doc.id) ? f : [...f, doc.id]));
  };
  const cambiarDoc = (i: number) => {
    setDocIdx(i);
    setZona(null);
    setVolteado(false);
    blip();
  };

  /* ── Corroborar ────────────────────────────────────────────────────── */
  const af = AFIRMACIONES[afIdx]!;
  const hilos = hilosPor[af.id] ?? {};
  const revisado = !!hilosRevisados[af.id];
  const errHilos = hilosErroneos(af, hilos);
  const hilosOk = revisado && errHilos.length === 0;
  const veredicto = veredictos[af.id] ?? null;
  const resueltas = AFIRMACIONES.filter((a) => hilosRevisados[a.id] && hilosErroneos(a, hilosPor[a.id] ?? {}).length === 0 && veredictos[a.id] === a.veredicto);
  const anacronismos = FRAGMENTOS_FALSA.map((f, i) => ({ f, i })).filter((x) => x.f.anacronismo);
  const hallados = anacronismos.filter((x) => examinados.includes(x.i)).length;
  const falsaDescubierta = hallados === anacronismos.length;

  const tender = (f: FuenteId, rel: Relacion | null) => {
    setHilosPor((h) => {
      const actual = { ...(h[af.id] ?? {}) };
      if (rel) actual[f] = rel;
      else delete actual[f];
      return { ...h, [af.id]: actual };
    });
    setHilosRevisados((r) => ({ ...r, [af.id]: false }));
    setVeredictos((v) => ({ ...v, [af.id]: undefined }));
    setFuenteSel(f);
    blip();
  };
  const revisarHilos = () => {
    setHilosRevisados((r) => ({ ...r, [af.id]: true }));
    sfx(errHilos.length === 0);
  };
  const dictaminar = (v: VeredictoId) => {
    if (!hilosOk) return;
    setVeredictos((x) => ({ ...x, [af.id]: v }));
    sfx(v === af.veredicto);
  };
  const cambiarAf = (i: number) => {
    setAfIdx(i);
    setFuenteSel(null);
    blip();
  };
  const abrirFalsa = () => {
    setLupaFalsa((v) => !v);
    setFragSel(null);
    setAvisoFrag(null);
    blip();
  };
  const decidirFragmento = (i: number, anacronismo: boolean) => {
    const fr = FRAGMENTOS_FALSA[i]!;
    setFragSel(i);
    const ok = anacronismo === fr.anacronismo;
    sfx(ok);
    if (ok) {
      setExaminados((xs) => (xs.includes(i) ? xs : [...xs, i]));
      setAvisoFrag({ txt: `${fr.anacronismo ? "Anacronismo. " : "Posible en 1938. "}${fr.explica}`, ok: true });
    } else {
      setAvisoFrag({ txt: `${fr.anacronismo ? "Mira de nuevo: esto sí es imposible para la fecha." : "No es imposible para 1938."} ${fr.explica}`, ok: false });
    }
  };

  /* ── Ética ─────────────────────────────────────────────────────────── */
  const problemasOk = problemasRevisados && PROBLEMAS_POST.every((p) => problemas.includes(p.id) === p.correcto);
  const criterios = CRITERIOS_REESCRITURA.map((c) => ({ c, ok: c.cumple(borrador) }));
  const reescrituraLista = criterios.every((x) => x.ok);
  const contextoListo = problemasOk && sinRecorte >= 100 && vioReverso;
  const evalInterp = useMemo(() => evaluarInterpretacion(tesis, sostienen, matiz, conclusion), [tesis, sostienen, matiz, conclusion]);

  const alternarProblema = (id: string) => {
    setProblemas((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
    setProblemasRevisados(false);
    blip();
  };
  const revisarProblemas = () => {
    setProblemasRevisados(true);
    sfx(PROBLEMAS_POST.every((p) => problemas.includes(p.id) === p.correcto));
  };
  const voltearFoto = () => {
    setFotoVolteada((v) => !v);
    setVioReverso(true);
    blip();
  };
  const publicar = () => {
    if (!reescrituraLista) return;
    setPublicado(borrador.trim());
    sfx(true);
  };
  const alternarSostiene = (f: FuenteId) => {
    setSostienen((xs) => (xs.includes(f) ? xs.filter((x) => x !== f) : xs.length >= MAX_SOSTIENEN ? xs : [...xs, f]));
    if (matiz === f) setMatiz(null);
    setInterpRevisada(false);
    blip();
  };
  const elegirMatiz = (f: FuenteId) => {
    setMatiz((m) => (m === f ? null : f));
    setSostienen((xs) => xs.filter((x) => x !== f));
    setInterpRevisada(false);
    blip();
  };
  const revisarInterp = () => {
    setInterpRevisada(true);
    sfx(evalInterp.lista);
    if (evalInterp.lista) setInterpLista(true);
  };
  const cambiarPaso = (p: PasoEtica) => {
    setPaso(p);
    blip();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "ficha") {
      setZona(null);
      setVolteado(false);
    }
    if (modo === "corroborar") {
      setLupaFalsa(false);
      setFragSel(null);
      setFuenteSel(null);
    }
    if (modo === "etica") {
      setSinRecorte(0);
      setFotoVolteada(false);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Examina tres zonas de un documento y mira qué campos de la ficha se desbloquean", done: Object.values(vistas).some((z) => (z?.length ?? 0) >= 3) },
    { t: "Examinar con la lupa las seis zonas de un documento, incluido el reverso", done: docExaminado },
    { t: "Llenar correctamente la ficha de procedencia de los cuatro documentos", done: fichados.length === DOCUMENTOS.length },
    { t: "Tender bien los hilos y dictaminar las tres afirmaciones del tablero", done: resueltas.length === AFIRMACIONES.length },
    { t: "Descubrir los dos anacronismos de la carta del ingeniero", done: falsaDescubierta },
    { t: "Reconstruir el contexto de la foto: problemas, recorte y reverso", done: contextoListo },
    { t: "Reescribir la publicación con fecha, lugar, hecho, crédito y aclaración", done: publicado !== null },
    { t: "Armar una interpretación argumentada con evidencias de peso y un matiz", done: interpLista },
    { t: "Decidir si una fuente sirve para una pregunta y ganar estrellas", done: identifico },
    { t: "Aprobar el reto evaluable (A1 y A4)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaArchivo = modo === "ficha" ? "ficha" : modo === "corroborar" ? "tablero" : paso === "post" ? "foto" : "balanza";
  let chipVivo = "";
  let pie = "";
  if (modo === "ficha") {
    chipVivo = fichaCompleta ? `${doc.etq.toLowerCase()} · fichado` : zona ? `lupa · ${ZONA_DEF[zona].etq.toLowerCase()}` : `${doc.etq.toLowerCase()} · ${vistasDoc.length}/6 zonas`;
    pie = zona ? doc.pistas[zona] : `${doc.descripcion} Elige una zona para examinarla con la lupa; cada campo de la ficha se desbloquea al examinar la zona donde está la respuesta.`;
  } else if (modo === "corroborar") {
    if (lupaFalsa) {
      chipVivo = `carta del ingeniero · ${hallados}/${anacronismos.length} anacronismos`;
      pie = fragSel !== null ? `«${FRAGMENTOS_FALSA[fragSel]!.texto}» ${FRAGMENTOS_FALSA[fragSel]!.explica}` : "Revisa cada fragmento: ¿es posible para el 19 de marzo de 1938 o delata que la carta es falsa o está mal fechada?";
    } else {
      const n = Object.keys(hilos).length;
      chipVivo = `${n} ${n === 1 ? "hilo" : "hilos"} · ${veredicto ? VEREDICTOS.find((v) => v.id === veredicto)!.etq.toLowerCase() : "sin dictamen"}`;
      pie = veredicto === af.veredicto ? af.explica : fuenteSel ? `${FUENTE_DEF[fuenteSel].etq}: ${FUENTE_DEF[fuenteSel].resumen}` : `«${af.texto}» Tiende un hilo verde desde cada fuente que la corrobora y uno rojo desde cada fuente que la contradice.`;
    }
  } else if (paso === "post") {
    chipVivo = publicado ? "publicación corregida" : fotoVolteada ? "reverso de la foto" : `recorte · ${sinRecorte} % recuperado`;
    pie = publicado ? "La corrección muestra la foto completa, su fecha, su lugar y su crédito: cualquiera puede verificarla." : fotoVolteada ? `Pie original: «${PIE_ORIGINAL}» (ilustrativo)` : `«${POST.texto}» — ${POST.cuenta} (${POST.aviso.toLowerCase()}). ¿Qué dejó fuera el recorte?`;
  } else {
    chipVivo = `peso ${evalInterp.peso}/${PESO_MINIMO} · ${evalInterp.tipos} ${evalInterp.tipos === 1 ? "tipo" : "tipos"} de fuente`;
    pie = interpLista ? "Tesis debatible, evidencias independientes de varios tipos, un matiz honesto y una conclusión que reconoce lo que no se sabe." : `${PREGUNTA_INTERP} Elige una tesis, pon en la balanza hasta tres evidencias que la sostengan y una que la matice.`;
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

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "ficha") {
    control = (
      <>
        <div className="af-opts">
          {DOCUMENTOS.map((d, i) => (
            <button key={d.id} className="af-opt af-doc" data-on={i === docIdx} onClick={() => cambiarDoc(i)} style={{ ["--afc" as string]: modoCol, background: i === docIdx ? `${modoCol}1f` : "transparent" }}>
              {d.etq}
              {fichados.includes(d.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("1 · Examina el documento con la lupa")}
        <div className="af-opts">
          {ZONAS.map((z) => (
            <button key={z} className="af-opt af-zona" data-on={zona === z} onClick={() => examinar(z)} style={{ ["--afc" as string]: modoCol, background: zona === z ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${ZONA_DEF[z].icono}`} style={{ marginRight: 7 }} />
              {ZONA_DEF[z].etq}
              {vistasDoc.includes(z) && <i className="fa-solid fa-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
          <button className="af-opt" data-on={volteado} onClick={voltear} style={{ ["--afc" as string]: accent }}>
            <i className="fa-solid fa-repeat" style={{ marginRight: 7 }} />
            {volteado ? "Ver el anverso" : "Voltear el documento"}
          </button>
        </div>
        {zona && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${modoCol}44` }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: modoCol, marginBottom: 4 }}>
              <i className={`fa-solid ${ZONA_DEF[zona].icono}`} style={{ marginRight: 6 }} />
              {ZONA_DEF[zona].etq} — lo que dice
            </div>
            <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{doc.zonas[zona]}</div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 6, color: modoCol }} />
              {doc.pistas[zona]}
            </div>
          </div>
        )}
        {sub("2 · Llena la ficha de procedencia")}
        <div style={{ display: "grid", gap: 10 }}>
          {CAMPOS.map((c) => {
            const cd = CAMPO_DEF[c];
            const desbloqueado = vistasDoc.includes(cd.zona) || fichaCompleta;
            const elegido = resp[c];
            return (
              <div key={c} style={{ opacity: desbloqueado ? 1 : 0.5 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
                  {cd.etq} <span style={{ color: T.text3, fontWeight: 700 }}>· {cd.pregunta}</span>
                  {!desbloqueado && (
                    <span style={{ color: T.text3, fontWeight: 700 }}>
                      {" "}
                      — examina «{ZONA_DEF[cd.zona].etq}»
                    </span>
                  )}
                </div>
                <div className="af-opts">
                  {ordenOpciones(doc.id, c).map((o) => {
                    const on = elegido === o;
                    const col = comprobada && on ? (o === 0 ? OK : WARN) : modoCol;
                    return (
                      <button
                        key={o}
                        className="af-opt af-campo"
                        data-campo={c}
                        data-on={on}
                        disabled={!desbloqueado || fichaCompleta}
                        onClick={() => elegirCampo(c, o)}
                        style={{ ["--afc" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}
                      >
                        {doc.campos[c][o]}
                      </button>
                    );
                  })}
                </div>
                {comprobada && elegido !== undefined && nota(elegido === 0 ? doc.porque[c] : `Revisa: ${doc.porque[c]}`, elegido === 0 ? OK : WARN, elegido === 0 ? "fa-circle-check" : "fa-rotate-left")}
              </div>
            );
          })}
        </div>
        <div className="af-opts" style={{ marginTop: 12 }}>
          <button className="af-toggle" onClick={comprobarFicha} disabled={!fichaLlena || fichaCompleta} style={{ ["--afc" as string]: accent }}>
            <i className={`fa-solid ${fichaCompleta ? "fa-circle-check" : "fa-clipboard-check"}`} style={{ marginRight: 9, color: fichaCompleta ? OK : accent }} />
            {fichaCompleta ? "Ficha correcta y archivada" : fichaLlena ? "Comprobar la ficha" : "Llena los cinco campos para comprobar"}
          </button>
        </div>
        {comprobada && !fichaCompleta && erroresFicha.length > 0 && nota(`${erroresFicha.length} ${erroresFicha.length === 1 ? "campo no coincide" : "campos no coinciden"} con lo que muestra el documento. Vuelve a examinar la zona y corrige.`, WARN)}
        {fichaCompleta && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.07)" }}>
            <div style={{ fontSize: 14, color: OK, fontWeight: 900, marginBottom: 4 }}>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 6 }} />
              Valoración de la fuente
            </div>
            <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>
              <strong>Útil para:</strong> {doc.util}
            </div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 3 }}>
              <strong style={{ color: "#fbbf24" }}>Cuidado:</strong> {doc.cuidado}
            </div>
            {fichados.length < DOCUMENTOS.length && (
              <button className="af-opt" data-on="true" style={{ ["--afc" as string]: modoCol, marginTop: 8 }} onClick={() => cambiarDoc(DOCUMENTOS.findIndex((d) => !fichados.includes(d.id)))}>
                <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
                Siguiente documento sin fichar
              </button>
            )}
          </div>
        )}
      </>
    );
  } else if (modo === "corroborar") {
    control = (
      <>
        <div className="af-opts">
          {AFIRMACIONES.map((a, i) => (
            <button key={a.id} className="af-opt af-af" data-on={i === afIdx && !lupaFalsa} onClick={() => { cambiarAf(i); setLupaFalsa(false); }} style={{ ["--afc" as string]: modoCol, background: i === afIdx && !lupaFalsa ? `${modoCol}1f` : "transparent" }}>
              Afirmación {i + 1}
              {resueltas.some((r) => r.id === a.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
          <button className="af-opt af-falsa" data-on={lupaFalsa} onClick={abrirFalsa} style={{ ["--afc" as string]: "#f87171", background: lupaFalsa ? "rgba(248,113,113,0.12)" : "transparent" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 7 }} />
            Carta del ingeniero
            {falsaDescubierta && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
          </button>
        </div>

        {lupaFalsa ? (
          <>
            {sub("Revisa cada fragmento con la lupa")}
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginBottom: 8 }}>
              La carta dice haberse escrito en Tampico el 19 de marzo de 1938, al día siguiente del anuncio. Para cada fragmento decide: ¿era posible en esa fecha?
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {FRAGMENTOS_FALSA.map((fr, i) => {
                const hecho = examinados.includes(i);
                return (
                  <div key={i} className="af-frag" data-on={fragSel === i} style={{ ["--afc" as string]: hecho ? (fr.anacronismo ? "#f87171" : OK) : modoCol }}>
                    <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, lineHeight: 1.45, marginBottom: 6 }}>
                      «{fr.texto}»
                      {hecho && <i className={`fa-solid ${fr.anacronismo ? "fa-triangle-exclamation" : "fa-check"}`} style={{ marginLeft: 7, color: fr.anacronismo ? "#f87171" : OK }} />}
                    </div>
                    {!hecho && (
                      <div className="af-opts">
                        <button className="af-opt af-posible" data-on="false" onClick={() => decidirFragmento(i, false)} style={{ ["--afc" as string]: OK }}>
                          Posible en 1938
                        </button>
                        <button className="af-opt af-anacr" data-on="false" onClick={() => decidirFragmento(i, true)} style={{ ["--afc" as string]: "#f87171" }}>
                          Imposible: anacronismo
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {avisoFrag && nota(avisoFrag.txt, avisoFrag.ok ? OK : WARN, avisoFrag.ok ? "fa-circle-check" : "fa-rotate-left")}
            {falsaDescubierta && nota("Dos anacronismos bastan para descartarla como evidencia de 1938: o es una falsificación o se escribió mucho después con una fecha falsa. No la uses para sostener ni para refutar ninguna afirmación.", OK, "fa-ban")}
          </>
        ) : (
          <>
            {sub("La afirmación")}
            <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 900, lineHeight: 1.45 }}>«{af.texto}»</div>
            {sub("1 · Tiende un hilo desde cada fuente")}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 14, color: T.text3, marginBottom: 8 }}>
              <span>
                <i className="fa-solid fa-link" style={{ marginRight: 6, color: "#22c55e" }} />
                hilo verde: la corrobora
              </span>
              <span>
                <i className="fa-solid fa-link-slash" style={{ marginRight: 6, color: "#ef4444" }} />
                hilo rojo: la contradice
              </span>
              <span>sin hilo: no dice nada sobre ella</span>
            </div>
            <div style={{ display: "grid", gap: 7 }}>
              {FUENTES_TABLERO.map((f) => {
                const rel = hilos[f] ?? null;
                const mal = revisado && errHilos.includes(f);
                const bien = revisado && !errHilos.includes(f);
                return (
                  <div key={f} className="af-fila" data-on={fuenteSel === f} data-mal={mal} style={{ ["--afc" as string]: mal ? WARN : bien && rel ? OK : "rgba(255,255,255,0.12)" }}>
                    <button className="af-fuente" onClick={() => { setFuenteSel(f); blip(); }} title={FUENTE_DEF[f].resumen}>
                      <i className={`fa-solid ${FUENTE_DEF[f].icono}`} style={{ marginRight: 7, color: modoCol }} />
                      {FUENTE_DEF[f].corta}
                      <span style={{ display: "block", fontSize: 14, color: T.text3, fontWeight: 700, marginTop: 2 }}>{FUENTE_DEF[f].tipo}</span>
                    </button>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="af-hilo" data-rel="corrobora" data-f={f} data-on={rel === "corrobora"} onClick={() => tender(f, rel === "corrobora" ? null : "corrobora")} title="Corrobora" aria-label={`${FUENTE_DEF[f].corta}: corrobora`}>
                        <i className="fa-solid fa-link" />
                      </button>
                      <button className="af-hilo" data-rel="contradice" data-f={f} data-on={rel === "contradice"} onClick={() => tender(f, rel === "contradice" ? null : "contradice")} title="Contradice" aria-label={`${FUENTE_DEF[f].corta}: contradice`}>
                        <i className="fa-solid fa-link-slash" />
                      </button>
                    </div>
                    {mal && <div style={{ gridColumn: "1 / -1", fontSize: 14, color: WARN, lineHeight: 1.45 }}>{af.nota[f] ?? "Esta fuente no dice nada sobre la afirmación."}</div>}
                  </div>
                );
              })}
            </div>
            {fuenteSel && (
              <div style={{ marginTop: 8, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: modoCol }} />
                {FUENTE_DEF[fuenteSel].etq}: {FUENTE_DEF[fuenteSel].resumen}
              </div>
            )}
            <div className="af-opts" style={{ marginTop: 10 }}>
              <button className="af-toggle" onClick={revisarHilos} style={{ ["--afc" as string]: accent }}>
                <i className={`fa-solid ${hilosOk ? "fa-circle-check" : "fa-diagram-project"}`} style={{ marginRight: 9, color: hilosOk ? OK : accent }} />
                {hilosOk ? "Hilos correctos" : "Revisar los hilos"}
              </button>
            </div>
            {revisado && errHilos.length > 0 && nota(`${errHilos.length} ${errHilos.length === 1 ? "hilo no corresponde" : "hilos no corresponden"}: lee la nota de cada fuente marcada y corrige.`, WARN)}
            {hilosOk && (
              <>
                {sub("2 · Tu dictamen sobre la afirmación")}
                <div className="af-opts">
                  {VEREDICTOS.map((v) => {
                    const on = veredicto === v.id;
                    const col = on ? (v.id === af.veredicto ? OK : WARN) : modoCol;
                    return (
                      <button key={v.id} className="af-opt af-ver" data-on={on} onClick={() => dictaminar(v.id)} style={{ ["--afc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                        <i className={`fa-solid ${v.icono}`} style={{ marginRight: 7 }} />
                        {v.etq}
                      </button>
                    );
                  })}
                </div>
                {veredicto && nota(veredicto === af.veredicto ? af.explica : `Aún no. Piensa cuántas fuentes independientes lo sostienen, de qué tipo son y si alguna tiene interés o solo predice. ${veredicto === "refutada" ? "Refutar exige evidencia sólida en contra, no una sola voz local." : ""}`, veredicto === af.veredicto ? OK : WARN, veredicto === af.veredicto ? "fa-lightbulb" : "fa-rotate-left")}
                {veredicto === af.veredicto && afIdx < AFIRMACIONES.length - 1 && (
                  <button className="af-opt" data-on="true" style={{ ["--afc" as string]: modoCol, marginTop: 8 }} onClick={() => cambiarAf(afIdx + 1)}>
                    <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
                    Siguiente afirmación
                  </button>
                )}
              </>
            )}
          </>
        )}
      </>
    );
  } else {
    control = (
      <>
        <div className="af-opts">
          <button className="af-opt af-paso" data-on={paso === "post"} onClick={() => cambiarPaso("post")} style={{ ["--afc" as string]: modoCol, background: paso === "post" ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-mobile-screen" style={{ marginRight: 7 }} />
            La foto viral
            {publicado && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
          </button>
          <button className="af-opt af-paso" data-on={paso === "interp"} onClick={() => cambiarPaso("interp")} style={{ ["--afc" as string]: modoCol, background: paso === "interp" ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-scale-balanced" style={{ marginRight: 7 }} />
            Tu interpretación
            {interpLista && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
          </button>
        </div>
        {paso === "post" ? (
          <>
            {sub("La publicación")}
            <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 14, color: T.text3, fontWeight: 800 }}>
                {POST.cuenta} · {POST.aviso}
              </div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, lineHeight: 1.45, marginTop: 4 }}>{POST.texto}</div>
            </div>
            {sub("1 · ¿Qué está mal? Marca todo lo que aplique")}
            <div style={{ display: "grid", gap: 6 }}>
              {PROBLEMAS_POST.map((p) => {
                const on = problemas.includes(p.id);
                const bien = on === p.correcto;
                const col = problemasRevisados ? (bien ? (on ? OK : "rgba(255,255,255,0.14)") : WARN) : on ? modoCol : "rgba(255,255,255,0.14)";
                return (
                  <div key={p.id}>
                    <button className="af-opt af-prob" data-on={on} onClick={() => alternarProblema(p.id)} style={{ ["--afc" as string]: col, background: on ? `${col}1f` : "transparent", width: "100%", textAlign: "left" }}>
                      <i className={`fa-${on ? "solid" : "regular"} fa-square${on ? "-check" : ""}`} style={{ marginRight: 8 }} />
                      {p.texto}
                    </button>
                    {problemasRevisados && !bien && <div style={{ fontSize: 14, color: WARN, margin: "4px 2px 0", lineHeight: 1.45 }}>{p.explica}</div>}
                  </div>
                );
              })}
            </div>
            <div className="af-opts" style={{ marginTop: 8 }}>
              <button className="af-toggle" onClick={revisarProblemas} disabled={problemas.length === 0} style={{ ["--afc" as string]: accent }}>
                <i className={`fa-solid ${problemasOk ? "fa-circle-check" : "fa-list-check"}`} style={{ marginRight: 9, color: problemasOk ? OK : accent }} />
                {problemasOk ? "Diagnóstico correcto" : "Revisar mi diagnóstico"}
              </button>
            </div>
            {problemasOk && nota(PROBLEMAS_POST.filter((p) => p.correcto).map((p) => p.explica).join(" "), OK, "fa-circle-check")}

            {sub("2 · Reconstruye el contexto")}
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-crop-simple" style={{ color: modoCol }} />
              <input type="range" aria-label="Recuperar la foto completa (%)" className="af-range" min={0} max={100} step={5} value={sinRecorte} onChange={(e) => { setSinRecorte(Number(e.target.value)); if (fotoVolteada) setFotoVolteada(false); }} style={{ ["--afc" as string]: modoCol }} />
              <span style={{ width: 46, textAlign: "right", fontSize: 14, color: "#fff", fontWeight: 800 }}>{sinRecorte} %</span>
            </label>
            <div className="af-opts" style={{ marginTop: 8 }}>
              <button className="af-opt af-voltear-foto" data-on={fotoVolteada} onClick={voltearFoto} style={{ ["--afc" as string]: modoCol }}>
                <i className="fa-solid fa-repeat" style={{ marginRight: 7 }} />
                {fotoVolteada ? "Ver la imagen" : "Voltear la foto: pie y sello"}
                {vioReverso && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
              </button>
            </div>
            {sinRecorte >= 100 && nota("Completa, la escena cambia de sentido: un letrero de colecta, una mesa con canastas y aves, y la fachada de Bellas Artes. Los brazos en alto sostienen donativos, no puños.", OK, "fa-expand")}
            {vioReverso && nota(`Pie original (ilustrativo): «${PIE_ORIGINAL}»`, T.text2, "fa-stamp")}

            {sub("3 · Reescribe la publicación con contexto y cita")}
            <textarea className="af-texto" aria-label="Tu publicación corregida" rows={5} value={borrador} disabled={publicado !== null} onChange={(e) => setBorrador(e.target.value)} placeholder="Ejemplo de inicio: Esta foto no es de 2017…" />
            <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
              {criterios.map(({ c, ok }) => (
                <div key={c.id} className="af-crit" data-ok={ok} style={{ fontSize: 14, color: ok ? OK : T.text2, lineHeight: 1.4 }}>
                  <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle"}`} style={{ marginRight: 7, fontSize: 14, color: ok ? OK : "rgba(255,255,255,0.25)" }} />
                  {c.etq}
                  {!ok && <span style={{ color: T.text3 }}> — {c.ayuda}</span>}
                </div>
              ))}
            </div>
            <div className="af-opts" style={{ marginTop: 10 }}>
              <button className="af-toggle af-publicar" onClick={publicar} disabled={!reescrituraLista || publicado !== null} style={{ ["--afc" as string]: accent }}>
                <i className={`fa-solid ${publicado ? "fa-circle-check" : "fa-paper-plane"}`} style={{ marginRight: 9, color: publicado ? OK : accent }} />
                {publicado ? "Corrección publicada" : reescrituraLista ? "Publicar la corrección" : "Cumple todos los criterios para publicar"}
              </button>
            </div>
            {publicado && (
              <div className="af-opts" style={{ marginTop: 8 }}>
                <button className="af-opt" data-on="true" onClick={() => cambiarPaso("interp")} style={{ ["--afc" as string]: modoCol }}>
                  <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
                  Ahora arma tu interpretación
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {sub("La pregunta")}
            <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, lineHeight: 1.45 }}>{PREGUNTA_INTERP}</div>
            {sub("1 · Tesis")}
            <div style={{ display: "grid", gap: 6 }}>
              {TESIS.map((t) => {
                const on = tesis === t.id;
                const col = interpRevisada && on ? (t.correcta ? OK : WARN) : modoCol;
                return (
                  <button key={t.id} className="af-opt af-tesis" data-on={on} onClick={() => { setTesis(t.id); setInterpRevisada(false); blip(); }} style={{ ["--afc" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}>
                    {t.texto}
                  </button>
                );
              })}
            </div>
            {sub(`2 · Evidencias: hasta ${MAX_SOSTIENEN} que sostienen y 1 que matiza`)}
            <div style={{ display: "grid", gap: 6 }}>
              {FUENTES_TABLERO.map((f) => {
                const s = sostienen.includes(f);
                const m = matiz === f;
                return (
                  <div key={f} className="af-fila" data-on={s || m} style={{ ["--afc" as string]: s ? modoCol : m ? "#fbbf24" : "rgba(255,255,255,0.12)" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", minWidth: 0 }}>
                      <i className={`fa-solid ${FUENTE_DEF[f].icono}`} style={{ marginRight: 7, color: modoCol }} />
                      {FUENTE_DEF[f].corta}
                      <span style={{ display: "block", fontSize: 14, color: T.text3, fontWeight: 700, marginTop: 2 }}>
                        {FUENTE_DEF[f].tipo}
                        {interpRevisada && ` · peso para esta pregunta: ${PESO_INTERP[f]}`}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="af-mini af-sost" data-f={f} data-on={s} onClick={() => alternarSostiene(f)} disabled={!s && sostienen.length >= MAX_SOSTIENEN} style={{ ["--afc" as string]: modoCol }}>
                        Sostiene
                      </button>
                      <button className="af-mini af-matiz" data-f={f} data-on={m} onClick={() => elegirMatiz(f)} style={{ ["--afc" as string]: "#fbbf24" }}>
                        Matiza
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {sub("3 · Conclusión")}
            <div style={{ display: "grid", gap: 6 }}>
              {CONCLUSIONES.map((c) => {
                const on = conclusion === c.id;
                const col = interpRevisada && on ? (c.correcta ? OK : WARN) : modoCol;
                return (
                  <button key={c.id} className="af-opt af-concl" data-on={on} onClick={() => { setConclusion(c.id); setInterpRevisada(false); blip(); }} style={{ ["--afc" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}>
                    {c.texto}
                  </button>
                );
              })}
            </div>
            <div className="af-opts" style={{ marginTop: 10 }}>
              <button className="af-toggle af-revisar-interp" onClick={revisarInterp} disabled={!tesis || sostienen.length === 0 || !matiz || !conclusion} style={{ ["--afc" as string]: accent }}>
                <i className={`fa-solid ${interpLista && evalInterp.lista ? "fa-circle-check" : "fa-scale-balanced"}`} style={{ marginRight: 9, color: interpLista && evalInterp.lista ? OK : accent }} />
                {!tesis || sostienen.length === 0 || !matiz || !conclusion ? "Elige tesis, evidencias, matiz y conclusión" : "Poner a prueba mi interpretación"}
              </button>
            </div>
            {interpRevisada && !evalInterp.lista && nota(evalInterp.mensajes.join(" ") || "Revisa tus elecciones.", WARN, "fa-rotate-left")}
            {interpRevisada && evalInterp.lista && (
              <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.07)" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: OK, letterSpacing: "0.06em", marginBottom: 6 }}>TU INTERPRETACIÓN ARGUMENTADA</div>
                <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6 }}>
                  {TESIS.find((t) => t.id === tesis)!.texto} Lo sostienen {sostienen.map((f) => `${FUENTE_DEF[f].corta.toLowerCase()} (${FUENTE_DEF[f].tipo.toLowerCase()})`).join(", ")}: fuentes independientes de {evalInterp.tipos} tipos distintos. Como matiz, {matiz === "boletin" ? "el boletín de la compañía sostiene que las manifestaciones fueron organizadas" : "el diario oficialista exagera la unanimidad"}. {CONCLUSIONES.find((c) => c.id === conclusion)!.texto}
                </div>
                {evalInterp.mensajes.length > 0 && <div style={{ fontSize: 14, color: T.text2, marginTop: 6 }}>{evalInterp.mensajes.join(" ")}</div>}
              </div>
            )}
          </>
        )}
      </>
    );
  }

  const tesisSel = TESIS.find((t) => t.id === tesis);

  /* ── Medidor: el experimento central del lab ───────────────────────── */
  const camposAbiertos = CAMPOS.filter((c) => vistasDoc.includes(CAMPO_DEF[c].zona)).length;
  const aFavor = FUENTES_TABLERO.filter((f) => hilos[f] === "corrobora");
  const enContra = FUENTES_TABLERO.filter((f) => hilos[f] === "contradice");
  const tiposFavor = new Set(aFavor.map((f) => FUENTE_DEF[f].tipo)).size;
  let medidores: { etq: string; val: number; max: number; col: string; txt: string }[];
  if (modo === "ficha") {
    medidores = [
      { etq: "Zonas examinadas", val: vistasDoc.length, max: ZONAS.length, col: modoCol, txt: `${vistasDoc.length} de ${ZONAS.length}` },
      { etq: "Campos de la ficha que ya puedes llenar", val: camposAbiertos, max: CAMPOS.length, col: OK, txt: `${camposAbiertos} de ${CAMPOS.length}` },
    ];
  } else if (modo === "corroborar" && !lupaFalsa) {
    medidores = [
      { etq: "Fuentes que la corroboran", val: aFavor.length, max: 4, col: "#22c55e", txt: `${aFavor.length} (${tiposFavor} ${tiposFavor === 1 ? "tipo" : "tipos"})` },
      { etq: "Fuentes que la contradicen", val: enContra.length, max: 4, col: "#ef4444", txt: `${enContra.length}` },
    ];
  } else if (modo === "corroborar") {
    medidores = [{ etq: "Anacronismos descubiertos", val: hallados, max: anacronismos.length, col: "#f87171", txt: `${hallados} de ${anacronismos.length}` }];
  } else if (paso === "post") {
    medidores = [{ etq: "Foto completa recuperada", val: sinRecorte, max: 100, col: modoCol, txt: `${sinRecorte} %` }];
  } else {
    medidores = [
      { etq: "Peso de tus evidencias", val: Math.min(evalInterp.peso, PESO_MINIMO), max: PESO_MINIMO, col: evalInterp.peso >= PESO_MINIMO ? OK : "#fbbf24", txt: `${evalInterp.peso} de ${PESO_MINIMO}` },
      { etq: "Tipos de fuente distintos", val: Math.min(evalInterp.tipos, 2), max: 2, col: evalInterp.tipos >= 2 ? OK : "#fbbf24", txt: `${evalInterp.tipos} (mínimo 2)` },
    ];
  }
  const consecuencia =
    modo === "ficha"
      ? "Examina más zonas: cada una abre el campo de la ficha donde está la respuesta."
      : modo === "corroborar" && !lupaFalsa
        ? "Una sola fuente no corrobora: mira si tus hilos verdes vienen de tipos de fuente distintos."
        : modo === "corroborar"
          ? "Con dos anacronismos la carta deja de servir como evidencia de 1938."
          : paso === "post"
            ? "Al recuperar la foto completa cambia lo que la imagen dice."
            : "Una conclusión es más sólida cuando el peso sube con fuentes independientes de varios tipos.";

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ArchivoScene
            vista={vista}
            modoColor={modoCol}
            resetNonce={resetNonce}
            docId={doc.id}
            volteado={volteado}
            zona={zona}
            zonasVistas={vistasDoc}
            fichaCompleta={fichaCompleta}
            afirmacionId={af.id}
            hilos={hilos}
            fuenteSel={fuenteSel}
            veredicto={veredicto}
            lupaFalsa={lupaFalsa}
            fragSel={fragSel}
            examinados={examinados}
            sinRecorte={sinRecorte}
            fotoVolteada={fotoVolteada}
            publicado={publicado}
            tesisOk={tesisSel ? tesisSel.correcta : null}
            sostienen={sostienen}
            matiz={matiz}
            peso={evalInterp.peso}
            lista={interpLista && evalInterp.lista}
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
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar vista" onClick={reiniciar} />
        </>
      }
      lectura={chipVivo}
      objetivos={objetivos.map((o) => ({ txt: o.t, done: o.done }))}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Cuaderno",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{`
        .af-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .af-opt { cursor:pointer; border:1px solid var(--afc); border-radius:10px; padding:9px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.35; }
        .af-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .af-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .af-opt:disabled { cursor:default; }
        .af-opt:disabled[data-on="false"] { opacity:0.55; }
        .af-toggle { width:100%; cursor:pointer; border:1px solid var(--afc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
        .af-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .af-toggle:disabled { cursor:default; opacity:0.7; }
        .af-range { flex:1; accent-color: var(--afc); }
        .af-fila { display:grid; grid-template-columns: minmax(0,1fr) auto; gap:8px; align-items:center; padding:7px 9px; border-radius:11px; border:1px solid var(--afc); background:rgba(4,10,22,0.35); transition:all .15s; }
        .af-fila[data-on="true"] { background:rgba(255,255,255,0.05); }
        .af-fuente { cursor:pointer; border:none; background:transparent; color:#fff; font-size:14px; font-weight:800; text-align:left; padding:2px; min-width:0; }
        .af-hilo { cursor:pointer; width:34px; height:30px; border-radius:8px; border:1px solid rgba(255,255,255,0.16); background:transparent; color:rgba(255,255,255,0.6); font-size:14px; transition:all .15s; }
        .af-hilo[data-rel="corrobora"][data-on="true"] { background:#22c55e; border-color:#22c55e; color:#04121f; }
        .af-hilo[data-rel="contradice"][data-on="true"] { background:#ef4444; border-color:#ef4444; color:#fff; }
        .af-hilo:hover { border-color:rgba(255,255,255,0.4); }
        .af-mini { cursor:pointer; border:1px solid rgba(255,255,255,0.16); border-radius:8px; padding:6px 9px; font-size:14px; font-weight:800; color:rgba(255,255,255,0.75); background:transparent; transition:all .15s; }
        .af-mini[data-on="true"] { border-color:var(--afc); background:var(--afc); color:#04121f; }
        .af-mini:disabled { opacity:0.4; cursor:default; }
        .af-frag { padding:9px 11px; border-radius:11px; border:1px solid var(--afc); background:rgba(4,10,22,0.35); }
        .af-frag[data-on="true"] { background:rgba(255,255,255,0.05); }
        .af-texto { width:100%; box-sizing:border-box; border-radius:11px; border:1.5px solid rgba(255,255,255,0.18); background:rgba(2,12,28,0.55); color:#fff; font-size:14px; line-height:1.5; padding:10px 12px; font-family:inherit; resize:vertical; outline:none; }
        .af-debate summary { cursor:pointer; font-size:14px; font-weight:800; color:#fff; }
              `}</style>
              <Bloque titulo={`Medidor · ${def.etq}`} icono="fa-gauge-high">
                <div style={{ display: "grid", gap: 10 }}>
                  {medidores.map((md) => (
                    <div key={md.etq} style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 800, color: "#fff" }}>
                        <span>{md.etq}</span>
                        <span style={{ fontFamily: "ui-monospace, monospace", color: md.col }}>{md.txt}</span>
                      </div>
                      <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                        <div style={{ width: `${md.max > 0 ? Math.min(100, (md.val / md.max) * 100) : 0}%`, height: "100%", background: md.col, transition: "width 200ms ease" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{consecuencia}</div>
                </div>
              </Bloque>
              <Bloque titulo="Lo que ves" icono="fa-eye">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{pie}</div>
              </Bloque>
              <Bloque titulo={def.etq} icono={def.icono}>
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
              <ConfiableCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes corroborar y validar evidencias." />
              <div style={{ ...card, padding: "20px 20px 22px", marginTop: 22 }}>
                <Eyebrow>
                  <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                  Completa el texto (A6)
                </Eyebrow>
                <div style={{ marginTop: 12 }}>
                  <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
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
              <Bloque titulo={`Expediente: ${CASO_TITULO.toLowerCase()}`} icono="fa-box-archive">
                <div style={{ color: T.text2 }}>{PROBLEMA}</div>
                <div style={{ color: T.text3, fontStyle: "italic" }}>Progresión 2: «{PROGRESION}»</div>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Lectura de la progresión" icono="fa-book-open">
                <div style={{ fontWeight: 800, color: "#fff" }}>{TITULO_LECTURA}</div>
                {LECTURA.map((p, i) => (
                  <div key={i} style={{ color: T.text2 }}>
                    {p.texto}
                    <span style={{ display: "block", fontSize: 14, color: T.text3, marginTop: 2 }}>— {p.fuente}</span>
                  </div>
                ))}
                <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR (A7)</div>
                <div style={{ color: T.text2 }}>{REFLEXION_A7}</div>
              </Bloque>
              <Bloque titulo="Contexto histórico (hechos verificables)" icono="fa-landmark">
                <div style={{ display: "grid", gap: 8 }}>
                  {CONTEXTO.map((c, i) => (
                    <div key={i}>
                      <strong style={{ color: accent }}>{c.anio}</strong>
                      <div style={{ color: T.text2 }}>{c.texto}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Hechos (quiz A2)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                {GLOSARIO.map((gi, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <strong style={{ color: accent }}>{gi.termino}. </strong>
                    <span style={{ color: T.text2 }}>{gi.definicion}</span>
                    <div style={{ color: T.text3, marginTop: 4 }}>
                      <i className="fa-solid fa-feather-pointed" style={{ marginRight: 6, color: accent }} aria-hidden />
                      {gi.ejemplo}
                    </div>
                  </div>
                ))}
                <div style={{ color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
                </div>
              </Bloque>
              <Bloque titulo="Debate (A3)" icono="fa-comments">
                <div style={{ fontWeight: 800, color: "#fff" }}>{DEBATE_A3.tema}</div>
                {DEBATE_A3.posturas.map((p, i) => (
                  <details key={i} className="af-debate" style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <summary>{p.postura}</summary>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 6, color: T.text2 }}>
                      {p.argumentos.map((a, k) => <li key={k}>{a}</li>)}
                    </ul>
                  </details>
                ))}
                <div style={{ color: T.text3 }}>En el expediente conviven un testimonio oral de 1988 y documentos escritos de 1938: pruébalos en la tarjeta de estrellas y en el tablero.</div>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ARCHIVO_FUENTES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La progresión, los reactivos del video A1, los hechos del quiz A2, el debate A3, el quiz A4, el glosario A5, el texto A6, la pregunta de reflexión A7 y los párrafos de la lectura son <strong>verbatim</strong> del material de la plataforma (la lectura toma textos de A2 y A5 y de CH-III-P03-A1 y CH-III-P04-A1; A1 no trae retroalimentación, así que se usa la del reactivo equivalente de A2 o la definición de A5). El caso de la expropiación petrolera y la línea de contexto son <strong>históricos</strong>. La carta, la nota del diario «El Pueblo en Marcha», el boletín de la «Compañía Petrolera del Golfo», el telegrama, la fotografía recreada, su pie, el testimonio oral, la carta del ingeniero y la publicación de redes son <strong>ilustrativos</strong>: personas, medios, compañía y archivos ficticios, verosímiles para 1938. Los pesos de la balanza son un criterio didáctico. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
