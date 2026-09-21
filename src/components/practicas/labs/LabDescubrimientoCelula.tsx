"use client";

/**
 * Laboratorio 3D — "El descubrimiento de la célula: microscopios y teoría
 * celular". Progresión 2 de la UAC CNEYT-VI (actividades CNEYT-VI-P10).
 * Anclado al ejercicio A2 «La escala de la célula y la cronología del
 * descubrimiento» (reto numérico); el marco teórico es la lectura A1, los
 * hechos salen del quiz A4, el glosario del A5 y el texto del A6.
 *
 * Tres modos:
 *  (1) Microscopios de la historia — la misma muestra con el ojo, el
 *      microscopio de Hooke, la lente de Leeuwenhoek, el acromático del siglo
 *      XIX, el óptico moderno y el electrónico: aumento contra resolución.
 *  (2) Mide como microscopista — revólver, oculares y calibrador: aumento
 *      total y tamaño real, y la cuenta de celdas de Hooke.
 *  (3) Construye la teoría celular — ordenar los hitos del A2, colocar cada
 *      evidencia en su postulado y repetir el experimento de Pasteur.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { DESCUBRIMIENTO_CELULA_FICHA } from "./descubrimiento-celula-ficha";
import type { VistaDescubrimiento } from "./DescubrimientoCelulaScene";
import {
  type Modo,
  type InstrumentoId,
  type MuestraId,
  type ObjetivoX,
  type OcularX,
  type Pilar,
  type FasePasteur,
  type Visor,
  MODOS,
  MODOS_DEF,
  INSTRUMENTOS,
  instrumento,
  MUESTRAS,
  muestra as muestraDe,
  estadoRasgo,
  resolucionEfectiva,
  campoUm,
  aumentoUtil,
  abbeUm,
  LIMITE_OJO_UM,
  longitud,
  num,
  OBJETIVOS_REV,
  OCULARES,
  MISIONES,
  HITOS,
  PILARES,
  PILAR_DEF,
  ORDEN_A2C,
  ORDEN_CORRECTO,
  T_HERVIR,
  T_REPOSO,
  T_ROTO,
  VISORES,
  OBJETOS,
  visorMinimo,
  porqueVisor,
  rondaObjetos,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  RETO_A2,
  HUECOS_A6,
} from "./descubrimiento-celula-data";

const DescubrimientoScene = dynamic(() => import("./DescubrimientoCelulaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-microscope fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando los microscopios en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-descubrimiento-celula-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaObjetos(mulberry32(7));

/* ── Tarjeta de estrellas: ¿con qué lo verías? ────────────────────────── */
function VisorCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = OBJETOS[ronda[pos] ?? 0]!;

  const responder = (v: Visor) => {
    if (resuelto !== null) return;
    const ok = v === visorMinimo(actual.um);
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(porqueVisor(actual.um));
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
    setRonda(rondaObjetos(Math.random));
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
          ¿Con qué lo verías?
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
            Objeto {pos + 1} de {ronda.length} · ¿cuál es el instrumento más sencillo con el que lo verías?
          </div>
          <div className="dc-objeto" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            {actual.texto}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {VISORES.map((v) => (
              <button key={v.id} className="dc-opt dc-visor" data-on="true" onClick={() => responder(v.id)} style={{ ["--dcc" as string]: accent }}>
                <i className={`fa-solid ${v.icono}`} style={{ marginRight: 8 }} />
                {v.etq}
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

export function LabDescubrimientoCelula({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("instrumentos");

  // ── Instrumentos
  const [insId, setInsId] = useState<InstrumentoId>("hooke");
  const [ajustes, setAjustes] = useState<Record<string, number>>({ hooke: 1, leeuwenhoek: 0, acromatico: 0, moderno: 2, electronico: 0, ojo: 0 });
  const [muestraId, setMuestraId] = useState<MuestraId>("corcho");
  const [hookeCorcho, setHookeCorcho] = useState(false);
  const [leeuwBacterias, setLeeuwBacterias] = useState(false);
  const [fagosOptico, setFagosOptico] = useState(false);
  const [fagosTem, setFagosTem] = useState(false);
  const [vistosModerno, setVistosModerno] = useState<Set<string>>(() => new Set());

  // ── Medición
  const [misionIdx, setMisionIdx] = useState(0);
  const [objetivo, setObjetivo] = useState<ObjetivoX>(4);
  const [ocular, setOcular] = useState<OcularX>(10);
  const [calibrador, setCalibrador] = useState(10);
  const [respuesta, setRespuesta] = useState("");
  const [resueltas, setResueltas] = useState<Set<string>>(() => new Set());
  const [avisoMision, setAvisoMision] = useState<{ txt: string; ok: boolean } | null>(null);

  // ── Teoría
  const [sub, setSub] = useState<"templo" | "pasteur">("templo");
  const [ordenados, setOrdenados] = useState<string[]>([]);
  const [avisoOrden, setAvisoOrden] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [colocados, setColocados] = useState<string[]>([]);
  const [errorNonce, setErrorNonce] = useState(0);
  const [avisoPilar, setAvisoPilar] = useState<{ txt: string; ok: boolean } | null>(null);
  const [fase, setFase] = useState<FasePasteur>("listo");
  const [pred, setPred] = useState<{ recto?: boolean; cisne?: boolean; roto?: boolean }>({});
  const [pasteurOk, setPasteurOk] = useState(false);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [retoOk, setRetoOk] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

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
    const sfxx = audioRef.current;
    if (sonido) {
      sfxx.mute();
      setSonido(false);
    } else {
      await sfxx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    const lista = timers.current;
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      lista.forEach((t) => window.clearTimeout(t));
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

  /* ── Instrumentos ──────────────────────────────────────────────────── */
  const ins = instrumento(insId);
  const ajIdx = Math.min(ins.ajustes.length - 1, ajustes[insId] ?? 0);
  const aj = ins.ajustes[ajIdx]!;
  const mu = muestraDe(muestraId);
  const efectiva = resolucionEfectiva(aj);
  const campo = campoUm(aj.aumento);
  const estados = mu.rasgos.map((r) => ({ r, e: estadoRasgo(r, aj) }));

  const registrar = (i: InstrumentoId, idx: number, m: MuestraId) => {
    const ii = instrumento(i);
    const a = ii.ajustes[Math.min(ii.ajustes.length - 1, idx)]!;
    const mm = muestraDe(m);
    const est = (id: string) => {
      const r = mm.rasgos.find((x) => x.id === id);
      return r ? estadoRasgo(r, a) : null;
    };
    if (i === "hooke" && m === "corcho" && est("celdas") === "visible") setHookeCorcho(true);
    if (i === "leeuwenhoek" && m === "estanque" && est("bacterias") !== "borroso") setLeeuwBacterias(true);
    if ((i === "moderno" || i === "acromatico") && m === "bacterias" && est("fagos") === "borroso" && est("bacteria") !== "borroso") setFagosOptico(true);
    if (i === "electronico" && m === "bacterias" && est("fagos") === "visible") setFagosTem(true);
    if (i === "moderno") setVistosModerno((s) => new Set(s).add(a.id));
  };
  const elegirIns = (i: InstrumentoId) => {
    setInsId(i);
    registrar(i, ajustes[i] ?? 0, muestraId);
    blip();
  };
  const elegirAjuste = (idx: number) => {
    setAjustes((s) => ({ ...s, [insId]: idx }));
    registrar(insId, idx, muestraId);
    blip();
  };
  const elegirMuestra = (m: MuestraId) => {
    setMuestraId(m);
    registrar(insId, ajIdx, m);
    blip();
  };
  const vacio = vistosModerno.has("10x100") && vistosModerno.has("20x100");

  /* ── Medición ──────────────────────────────────────────────────────── */
  const mision = MISIONES[misionIdx]!;
  const revSel = OBJETIVOS_REV.find((o) => o.x === objetivo)!;
  const aumentoTotal = objetivo * ocular;
  const m1Resuelta = resueltas.has("m1");
  const ajusteListo = objetivo === mision.objetivo && ocular === mision.ocular;

  const cambiarMision = (i: number) => {
    setMisionIdx(i);
    setRespuesta("");
    setAvisoMision(null);
    setCalibrador(10);
    blip();
  };
  const comprobarMision = () => {
    const valor = Number(respuesta.trim().replace(/\s/g, "").replace(",", "."));
    if (respuesta.trim() === "" || Number.isNaN(valor)) return;
    if (!ajusteListo) {
      setAvisoMision({ txt: `Primero coloca el objetivo de ${mision.objetivo}× y el ocular de ${mision.ocular}×, como pide la misión.`, ok: false });
      sfx(false);
      return;
    }
    const ok = Math.abs(valor - mision.respuesta) <= mision.tolerancia;
    sfx(ok);
    if (ok) {
      setResueltas((s) => new Set(s).add(mision.id));
      setAvisoMision({ txt: `¡Correcto! ${mision.explica}`, ok: true });
    } else {
      const pista =
        mision.pide === "aumento"
          ? "El ocular vuelve a aumentar la imagen del objetivo: los aumentos se multiplican, no se suman."
          : mision.pide === "hooke"
            ? "Si en 1/18 de pulgada caben 60 celdas, en la pulgada completa caben 18 veces más."
            : `Mide en milímetros, divide entre el aumento total (${num(aumentoTotal)}×) y convierte a µm multiplicando por 1000.`;
      setAvisoMision({ txt: `Aún no. ${pista}`, ok: false });
    }
  };

  /* ── Teoría ────────────────────────────────────────────────────────── */
  const ordenListo = ordenados.length === ORDEN_CORRECTO.length;
  const tocarOrden = (id: string) => {
    if (ordenListo || ordenados.includes(id)) return;
    const esperado = ORDEN_CORRECTO[ordenados.length];
    if (id === esperado) {
      const nuevo = [...ordenados, id];
      setOrdenados(nuevo);
      setAvisoOrden(null);
      sfx(true);
    } else {
      const h = ORDEN_A2C.find((x) => x.id === id)!;
      setAvisoOrden(`«${h.texto}» (${h.anio}) no es el siguiente: busca un hito más antiguo.`);
      sfx(false);
    }
  };
  const colocar = (p: Pilar) => {
    if (!seleccionado) return;
    const h = HITOS.find((x) => x.id === seleccionado)!;
    if (h.pilar === p) {
      setColocados((c) => [...c, h.id]);
      setAvisoPilar({ txt: `${PILAR_DEF[p].etq}. ${h.porque}`, ok: true });
      setSeleccionado(null);
      sfx(true);
    } else {
      setErrorNonce((n) => n + 1);
      setAvisoPilar({ txt: `No sostiene la «${PILAR_DEF[p].etq.toLowerCase()}». Pregúntate: ¿esta evidencia muestra de qué están hechos los seres vivos, qué hace una célula o de dónde sale una célula?`, ok: false });
      sfx(false);
    }
  };
  const completo = colocados.length === HITOS.length;

  const predecir = (k: "recto" | "cisne" | "roto", v: boolean) => {
    setPred((s) => ({ ...s, [k]: v }));
    blip();
  };
  const hervir = () => {
    if (fase !== "listo" || pred.recto === undefined || pred.cisne === undefined) return;
    setFase("hirviendo");
    blip();
    despues(T_HERVIR, () => {
      setFase("reposo");
      despues(T_REPOSO, () => setFase("fin"));
    });
  };
  const romper = () => {
    if (fase !== "fin" || pred.roto === undefined) return;
    setFase("roto");
    blip();
    despues(T_ROTO, () => {
      setFase("finRoto");
      setPasteurOk(true);
    });
  };
  const reiniciarPasteur = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setFase("listo");
    setPred({});
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "medicion") {
      setRespuesta("");
      setAvisoMision(null);
      setCalibrador(10);
    }
    if (modo === "teoria" && sub === "pasteur") reiniciarPasteur();
    if (modo === "teoria" && sub === "templo") {
      setSeleccionado(null);
      setAvisoPilar(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Ver las celdas del corcho con el microscopio de Hooke", done: hookeCorcho },
    { t: "Distinguir bacterias vivas con la lente de Leeuwenhoek", done: leeuwBacterias },
    { t: "Comprobar que la luz no resuelve los bacteriófagos y los electrones sí", done: fagosOptico && fagosTem },
    { t: "Pasar de 1000× a 2000× y descubrir el aumento vacío", done: vacio },
    { t: `Resolver las ${MISIONES.length} misiones de medición`, done: resueltas.size === MISIONES.length },
    { t: "Ordenar los hitos del ejercicio A2 (inciso c)", done: ordenListo },
    { t: "Levantar los tres pilares de la teoría celular", done: completo },
    { t: "Refutar la generación espontánea con el experimento de Pasteur", done: pasteurOk },
    { t: "Clasificar objetos por instrumento y ganar estrellas", done: identifico },
    { t: "Resolver el reto de escala (A2)", done: retoOk },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaDescubrimiento = modo === "teoria" && sub === "pasteur" ? "pasteur" : modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "instrumentos") {
    chipVivo = `${ins.corto.toLowerCase()} · ${num(aj.aumento)}× · resuelve ${longitud(efectiva)}`;
    const vistos = estados.filter((x) => x.e !== "borroso").map((x) => minuscula(x.r.etq.split(" (")[0]!));
    const noVistos = estados.filter((x) => x.e === "borroso").map((x) => minuscula(x.r.etq.split(" (")[0]!));
    pie = `A ${num(aj.aumento)}× el detalle más fino que distingues mide ${longitud(efectiva)}${aj.resUm > LIMITE_OJO_UM / aj.aumento ? " (lo limita el instrumento)" : " (lo limita tu ojo: falta aumento)"}. ${vistos.length ? `Distingues: ${vistos.join(", ")}.` : "No distingues ningún detalle de la muestra."}${noVistos.length ? ` Borroso: ${noVistos.join(", ")}.` : ""}`;
  } else if (modo === "medicion") {
    chipVivo = `ocular ${ocular}× · objetivo ${objetivo}×${m1Resuelta ? ` = ${num(aumentoTotal)}×` : ""}`;
    pie = mision.enunciado;
  } else if (sub === "templo") {
    chipVivo = ordenListo ? `${colocados.length}/${HITOS.length} evidencias · ${PILARES.filter((p) => colocados.filter((id) => HITOS.find((h) => h.id === id)!.pilar === p).length === 3).length}/3 pilares` : `ordenando hitos · ${ordenados.length}/4`;
    const sel = seleccionado ? HITOS.find((h) => h.id === seleccionado)! : null;
    pie = !ordenListo
      ? "Toca los cuatro hitos del ejercicio A2 del más antiguo al más reciente: cada uno se clava en la línea del tiempo."
      : completo
        ? "Con los tres pilares en pie, la teoría celular queda completa: la célula es la unidad estructural, funcional y de origen de todos los seres vivos."
        : sel
          ? `${sel.etqAnio} · ${sel.quien}: ${sel.que}`
          : "Elige una evidencia y decide qué postulado sostiene.";
  } else {
    chipVivo =
      fase === "listo"
        ? "matraces listos · predice"
        : fase === "hirviendo"
          ? "hirviendo el caldo…"
          : fase === "reposo"
            ? "reposo de 30 días…"
            : fase === "fin"
              ? "día 30 · recto turbio, cisne claro"
              : fase === "roto"
                ? "cuello roto · esperando…"
                : "cuello roto · el caldo se enturbió";
    pie =
      fase === "fin" || fase === "roto"
        ? "El aire entra a los dos matraces, pero en el cuello de cisne el polvo con microbios se queda en la curva. ¿Qué pasa si el polvo llega al caldo?"
        : fase === "finRoto"
          ? "Al romper el cuello, el polvo cae al caldo y aparecen microbios: vienen de otros microbios del aire, no del caldo. La vida no surge espontáneamente."
          : "Pasteur hirvió caldo nutritivo en matraces abiertos al aire. Si la vida surgiera sola del caldo, los dos se enturbiarían.";
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

  const sub8 = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const lectura = (etq: string, valor: string, col = "#fff") => (
    <div style={{ flex: "1 1 120px", padding: "9px 11px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "instrumentos") {
    control = (
      <>
        {sub8("1 · Instrumento")}
        <div className="dc-opts">
          {INSTRUMENTOS.map((x) => (
            <button key={x.id} className="dc-opt dc-ins" data-on={x.id === insId} onClick={() => elegirIns(x.id)} style={{ ["--dcc" as string]: modoCol, background: x.id === insId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${x.icono}`} style={{ marginRight: 7 }} />
              {x.corto} · {x.anio}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 8 }}>{ins.descripcion}</div>
        {sub8("2 · Muestra")}
        <div className="dc-opts">
          {MUESTRAS.map((m) => (
            <button key={m.id} className="dc-opt dc-muestra" data-on={m.id === muestraId} onClick={() => elegirMuestra(m.id)} style={{ ["--dcc" as string]: accent, background: m.id === muestraId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              <i className={`fa-solid ${m.icono}`} style={{ marginRight: 7 }} />
              {m.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginTop: 6 }}>{mu.historia}</div>
        {sub8("3 · Aumento")}
        <div className="dc-opts">
          {ins.ajustes.map((a, k) => (
            <button key={a.id} className="dc-opt dc-aj" data-on={k === ajIdx} onClick={() => elegirAjuste(k)} disabled={ins.ajustes.length === 1} style={{ ["--dcc" as string]: modoCol, background: k === ajIdx ? `${modoCol}1f` : "transparent" }}>
              {a.etq}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
          {lectura("Aumento", `${num(aj.aumento)}×`)}
          {lectura(`Resolución del instrumento${aj.estimado ? " (est.)" : ""}`, aj.resUm > 0 ? longitud(aj.resUm) : "—")}
          {lectura("Detalle mínimo visible", longitud(efectiva), modoCol)}
          {lectura("Campo de visión", longitud(campo))}
        </div>
        {aj.na !== undefined && (
          <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
            Aumento = {aj.ocular}× · {aj.objetivo}× = <strong style={{ color: "#fff" }}>{num(aj.aumento)}×</strong>; d = λ/(2·AN) = 550 nm/(2 · {aj.na}) = <strong style={{ color: "#fff" }}>{longitud(aj.resUm)}</strong>
          </div>
        )}
        {sub8("¿Qué alcanzas a distinguir?")}
        <div style={{ display: "grid", gap: 6 }}>
          {estados.map(({ r, e }) => (
            <div key={r.id} className="dc-rasgo" data-estado={e} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${e === "borroso" ? "rgba(255,255,255,0.1)" : `${OK}44`}` }}>
              <i className={`fa-solid ${e === "borroso" ? "fa-eye-slash" : e === "grande" ? "fa-expand" : "fa-circle-check"}`} style={{ marginTop: 2, color: e === "borroso" ? T.text3 : OK }} />
              <span style={{ fontSize: 12, color: e === "borroso" ? T.text2 : "#fff", lineHeight: 1.4 }}>
                {r.etq}
                <span style={{ color: T.text3 }}> — {e === "borroso" ? `menor que ${longitud(efectiva)}: se ve borroso` : e === "grande" ? "se distingue, pero no cabe entero en el campo" : "se distingue"}</span>
              </span>
            </div>
          ))}
        </div>
        {insId === "moderno" && aj.na !== undefined && aj.aumento > aumentoUtil(aj.na) &&
          nota(`Aumento vacío: con AN ${aj.na} el aumento útil llega a unas ${num(aumentoUtil(aj.na))}×. A ${num(aj.aumento)}× la imagen es más grande, pero el detalle mínimo sigue en ${longitud(efectiva)}: no aparece nada nuevo.`, "#fbbf24", "fa-magnifying-glass-plus")}
        {insId === "electronico" && nota("Los electrones tienen una longitud de onda miles de veces menor que la luz: por eso separan detalles de nanómetros. A cambio, la muestra debe estar fijada, cortada muy fina y en vacío, y la imagen no tiene color.", T.text2, "fa-bolt")}
        {insId === "ojo" && nota("A simple vista la lámina entera es un puntito: la célula (≈ 20 µm) es cinco veces más pequeña que lo mínimo que distingue el ojo.", T.text2, "fa-eye")}
      </>
    );
  } else if (modo === "medicion") {
    control = (
      <>
        <div className="dc-opts">
          {MISIONES.map((m, i) => (
            <button key={m.id} className="dc-opt dc-mision" data-on={i === misionIdx} onClick={() => cambiarMision(i)} style={{ ["--dcc" as string]: modoCol, background: i === misionIdx ? `${modoCol}1f` : "transparent" }}>
              {m.titulo}
              {resueltas.has(m.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}`, fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.5 }}>{mision.enunciado}</div>
        {sub8("1 · Gira el revólver")}
        <div className="dc-opts">
          {OBJETIVOS_REV.map((o) => (
            <button key={o.x} className="dc-opt dc-obj" data-on={o.x === objetivo} onClick={() => { setObjetivo(o.x); blip(); }} style={{ ["--dcc" as string]: o.color, background: o.x === objetivo ? `${o.color}22` : "transparent" }}>
              Objetivo {o.x}× · AN {o.na}
            </button>
          ))}
        </div>
        {sub8("2 · Ocular")}
        <div className="dc-opts">
          {OCULARES.map((o) => (
            <button key={o} className="dc-opt dc-ocu" data-on={o === ocular} onClick={() => { setOcular(o); blip(); }} style={{ ["--dcc" as string]: modoCol, background: o === ocular ? `${modoCol}1f` : "transparent" }}>
              Ocular {o}×
            </button>
          ))}
        </div>
        {!ajusteListo && nota(`La misión pide objetivo ${mision.objetivo}× y ocular ${mision.ocular}×.`, T.text3)}
        {mision.realUm !== undefined && (
          <>
            {sub8("3 · Mide en la imagen")}
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-ruler-horizontal" style={{ color: "#f87171" }} />
              <input type="range" aria-label="Abertura del calibrador (mm)" className="dc-range" min={0} max={120} step={0.5} value={calibrador} onChange={(e) => setCalibrador(Number(e.target.value))} style={{ ["--dcc" as string]: "#f87171" }} />
              <span style={{ width: 62, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{num(calibrador, 1)} mm</span>
            </label>
            <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6, lineHeight: 1.45 }}>Abre las líneas rojas hasta que toquen los bordes del objeto. La regla blanca de la imagen también está en milímetros.</div>
          </>
        )}
        {sub8(mision.realUm !== undefined ? "4 · Calcula" : "3 · Calcula")}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: T.text2, fontWeight: 800 }}>{mision.etqRespuesta}:</span>
          <input
            className="dc-num"
            type="number"
            inputMode="decimal"
            aria-label={`${mision.etqRespuesta} (${mision.unidad})`}
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") comprobarMision();
            }}
          />
          <span style={{ fontSize: 13, color: T.text2, fontWeight: 900 }}>{mision.unidad}</span>
          <button className="dc-opt dc-comprobar" data-on="true" onClick={comprobarMision} disabled={respuesta.trim() === ""} style={{ ["--dcc" as string]: accent, background: `rgba(${color.rgba},0.18)` }}>
            <i className="fa-solid fa-check" style={{ marginRight: 7 }} />
            Comprobar
          </button>
        </div>
        {avisoMision && nota(avisoMision.txt, avisoMision.ok ? OK : WARN, avisoMision.ok ? "fa-circle-check" : "fa-rotate-left")}
        {avisoMision?.ok && misionIdx < MISIONES.length - 1 && (
          <div className="dc-opts" style={{ marginTop: 10 }}>
            <button className="dc-opt dc-sig" data-on="true" onClick={() => cambiarMision(misionIdx + 1)} style={{ ["--dcc" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente misión
              <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
            </button>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
          {lectura("Aumento total", m1Resuelta ? `${num(aumentoTotal)}×` : "¿?")}
          {lectura("Límite del objetivo", longitud(abbeUm(revSel.na)))}
          {lectura("Campo real", m1Resuelta ? longitud(campoUm(aumentoTotal)) : "¿?")}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>El tamaño «en la imagen» es el de la imagen aumentada vista a 25 cm del ojo, que es como se define el aumento de un microscopio.</div>
      </>
    );
  } else {
    control = (
      <>
        <div className="dc-opts">
          <button className="dc-opt dc-sub" data-on={sub === "templo"} onClick={() => { setSub("templo"); blip(); }} style={{ ["--dcc" as string]: modoCol, background: sub === "templo" ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-landmark" style={{ marginRight: 7 }} />
            Los postulados
            {completo && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
          </button>
          <button className="dc-opt dc-sub" data-on={sub === "pasteur"} onClick={() => { setSub("pasteur"); blip(); }} style={{ ["--dcc" as string]: modoCol, background: sub === "pasteur" ? `${modoCol}1f` : "transparent" }}>
            <i className="fa-solid fa-flask" style={{ marginRight: 7 }} />
            Experimento de Pasteur
            {pasteurOk && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
          </button>
        </div>
        {sub === "templo" ? (
          <>
            {sub8(`1 · Ordena del más antiguo al más reciente (A2 c) · ${ordenados.length}/4`)}
            <div style={{ display: "grid", gap: 6 }}>
              {ORDEN_A2C.map((h) => {
                const k = ordenados.indexOf(h.id);
                return (
                  <button key={h.id} className="dc-opt dc-orden" data-on={k >= 0} onClick={() => tocarOrden(h.id)} disabled={k >= 0} style={{ ["--dcc" as string]: k >= 0 ? OK : modoCol, textAlign: "left", background: k >= 0 ? "rgba(52,211,153,0.10)" : "transparent" }}>
                    {k >= 0 ? <span style={{ fontWeight: 900, color: OK, marginRight: 8 }}>{k + 1}.</span> : <i className="fa-regular fa-circle" style={{ marginRight: 8 }} />}
                    {h.texto}
                    {k >= 0 && <span style={{ color: T.text3 }}> · {h.anio}</span>}
                  </button>
                );
              })}
            </div>
            {avisoOrden && nota(avisoOrden, WARN)}
            {ordenListo && nota("Orden correcto: 1665 → 1838 → 1839 → 1855. Pasaron 173 años entre Hooke y Schleiden: los microscopios tuvieron que mejorar mucho.", OK, "fa-circle-check")}
            <div style={{ opacity: ordenListo ? 1 : 0.45, pointerEvents: ordenListo ? "auto" : "none" }}>
              {sub8(`2 · Elige una evidencia · ${colocados.length}/${HITOS.length}`)}
              <div style={{ display: "grid", gap: 6 }}>
                {HITOS.filter((h) => !colocados.includes(h.id)).map((h) => (
                  <button key={h.id} className="dc-opt dc-hito" data-on={h.id === seleccionado} onClick={() => { setSeleccionado(h.id); setAvisoPilar(null); blip(); }} style={{ ["--dcc" as string]: modoCol, textAlign: "left", background: h.id === seleccionado ? `${modoCol}1f` : "transparent" }}>
                    <strong>{h.etqAnio} · {h.quien}.</strong> <span style={{ fontWeight: 600 }}>{h.que}</span>
                  </button>
                ))}
                {completo && <div style={{ fontSize: 12, color: OK, fontWeight: 800 }}>Todas las evidencias están en su pilar.</div>}
              </div>
              {sub8("3 · ¿Qué postulado sostiene?")}
              <div style={{ display: "grid", gap: 6 }}>
                {PILARES.map((p) => (
                  <button key={p} className="dc-opt dc-pilar" data-on={!!seleccionado} onClick={() => colocar(p)} disabled={!seleccionado} style={{ ["--dcc" as string]: PILAR_DEF[p].color, textAlign: "left" }}>
                    <i className={`fa-solid ${PILAR_DEF[p].icono}`} style={{ marginRight: 8, color: PILAR_DEF[p].color }} />
                    <strong>{PILAR_DEF[p].etq}:</strong> <span style={{ fontWeight: 600 }}>{PILAR_DEF[p].postulado}</span>
                  </button>
                ))}
              </div>
              {avisoPilar && nota(avisoPilar.txt, avisoPilar.ok ? OK : WARN, avisoPilar.ok ? "fa-circle-check" : "fa-rotate-left")}
            </div>
          </>
        ) : (
          <>
            {sub8("1 · Predice: después de hervir y dejar reposar 30 días…")}
            {(["recto", "cisne"] as const).map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 800, width: 150 }}>{k === "recto" ? "Matraz de cuello recto" : "Matraz de cuello de cisne"}</span>
                {[true, false].map((v) => {
                  const on = pred[k] === v;
                  return (
                    <button key={String(v)} className={`dc-opt dc-pred-${k}`} data-on={on} onClick={() => predecir(k, v)} disabled={fase !== "listo"} style={{ ["--dcc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                      {v ? "Se enturbia" : "Sigue claro"}
                    </button>
                  );
                })}
              </div>
            ))}
            <button className="dc-toggle" onClick={hervir} disabled={fase !== "listo" || pred.recto === undefined || pred.cisne === undefined} style={{ ["--dcc" as string]: "#fb923c", marginTop: 6 }}>
              <i className={`fa-solid ${fase === "hirviendo" || fase === "reposo" ? "fa-spinner fa-spin" : "fa-fire-burner"}`} style={{ marginRight: 9, color: "#fb923c" }} />
              {fase === "listo" ? "Hervir los caldos y dejarlos reposar" : fase === "hirviendo" ? "Hirviendo…" : fase === "reposo" ? "Reposando 30 días…" : "Caldos hervidos y en reposo"}
            </button>
            {(fase === "fin" || fase === "roto" || fase === "finRoto") &&
              nota(
                `${pred.recto === true && pred.cisne === false ? "Predijiste bien. " : "Revisa tu predicción. "}El de cuello recto se enturbió: el polvo del aire, con microbios, cayó al caldo. El de cuello de cisne sigue claro aunque el aire entra: el polvo se queda atrapado en la curva.`,
                pred.recto === true && pred.cisne === false ? OK : WARN,
                "fa-flask",
              )}
            {(fase === "fin" || fase === "roto" || fase === "finRoto") && (
              <>
                {sub8("2 · Predice: si rompemos el cuello de cisne…")}
                <div className="dc-opts">
                  {[true, false].map((v) => {
                    const on = pred.roto === v;
                    return (
                      <button key={String(v)} className="dc-opt dc-pred-roto" data-on={on} onClick={() => predecir("roto", v)} disabled={fase !== "fin"} style={{ ["--dcc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                        {v ? "Se enturbia" : "Sigue claro"}
                      </button>
                    );
                  })}
                </div>
                <button className="dc-toggle" onClick={romper} disabled={fase !== "fin" || pred.roto === undefined} style={{ ["--dcc" as string]: "#f87171", marginTop: 8 }}>
                  <i className={`fa-solid ${fase === "roto" ? "fa-spinner fa-spin" : "fa-hammer"}`} style={{ marginRight: 9, color: "#f87171" }} />
                  {fase === "fin" ? "Romper el cuello de cisne" : fase === "roto" ? "Esperando unos días…" : "Cuello roto"}
                </button>
              </>
            )}
            {fase === "finRoto" &&
              nota(
                `${pred.roto === true ? "Bien predicho. " : "No era así. "}En pocos días el caldo se enturbió: los microbios llegaron desde el aire. Nada nació del caldo: la vida celular viene de vida celular previa.`,
                pred.roto === true ? OK : WARN,
                "fa-circle-check",
              )}
            {fase !== "listo" && (
              <div className="dc-opts" style={{ marginTop: 10 }}>
                <button className="dc-opt" data-on="false" onClick={reiniciarPasteur} style={{ ["--dcc" as string]: modoCol }}>
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                  Repetir el experimento
                </button>
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Experimento histórico de Louis Pasteur (1859–1862). Los tiempos de la animación y la rapidez con que se enturbia el caldo son ilustrativos.</div>
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes dcPulse { 0%,100%{ box-shadow:0 0 0 0 var(--dcd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .dc-live-dot { animation: dcPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .dc-live-dot { animation:none; } }
        .dc-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .dc-grid { grid-template-columns: 1fr; } }
        .dc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .dc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .dc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .dc-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .dc-tab { cursor:pointer; border:1px solid var(--dcc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .dc-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .dc-tab:hover { background:rgba(255,255,255,0.06); }
        .dc-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .dc-opt { cursor:pointer; border:1px solid var(--dcc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; line-height:1.4; }
        .dc-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .dc-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .dc-opt:disabled { cursor:default; }
        .dc-opt:disabled[data-on="false"] { opacity:0.55; }
        .dc-toggle { width:100%; cursor:pointer; border:1px solid var(--dcc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .dc-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .dc-toggle:disabled { cursor:default; opacity:0.6; }
        .dc-range { flex:1; accent-color: var(--dcc); }
        .dc-num { width:110px; box-sizing:border-box; border-radius:10px; border:1px solid ${T.line}; background:${T.inset}; color:#fff; font-size:15px; font-weight:900; text-align:center; padding:8px 10px; outline:none; }
        .dc-num:focus { border-color:${accent}; }
        .dc-opt:focus-visible, .dc-tab:focus-visible, .dc-toggle:focus-visible, .dc-icobtn:focus-visible, .dc-range:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .dc-bottom { grid-template-columns: 1fr !important; } }
        .dc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .dc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .dc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .dc-drawer[data-open="true"] { transform:translateX(0); }
        .dc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .dc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .dc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .dc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .dc-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .dc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="dc-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="dc-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--dcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="dc-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 60vh, 680px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <DescubrimientoScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                instrumentoId={insId}
                ajusteId={aj.id}
                muestraId={muestraId}
                objetivo={objetivo}
                ocular={ocular}
                misionId={mision.id}
                calibradorMm={calibrador}
                ordenados={ordenados}
                colocados={colocados}
                seleccionado={seleccionado}
                errorNonce={errorNonce}
                fasePasteur={fase}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="dc-live-dot" style={{ ["--dcd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span className="dc-chip" style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>
                  {chipVivo}
                </span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="dc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="dc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="dc-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div className="dc-pie" style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>
                {pie}
              </div>
            </div>

            <button className="dc-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-microscope" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Cómo se vio lo invisible?</div>
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
              <span className="dc-contador" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} className="dc-objetivo" data-done={o.done} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="dc-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
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
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5)
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-microscope" style={{ marginRight: 6, color: accent }} />
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
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas, los hechos del quiz A4, el glosario A5, el ejercicio A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma. Las
          fechas y los aportes históricos (Hooke, Leeuwenhoek, Schleiden, Schwann, Remak, Virchow, Pasteur, Engelmann, Knoll y Ruska) son reales. Las imágenes del ocular son{" "}
          <strong>modelos</strong> dibujados a escala con tamaños típicos reales; el desenfoque sigue la resolución efectiva (instrumento y ojo) y el límite de Abbe d = λ/(2·AN) con
          λ = 550 nm. El microscopio de Utrecht de Leeuwenhoek (266×, 1.35 µm) es una medición; las resoluciones de Hooke, de las lentes menores de Leeuwenhoek y del acromático del
          siglo XIX son estimaciones. El campo supone un número de campo de 18 mm. Los tiempos del experimento de Pasteur son ilustrativos. Fuente: {FUENTE}
        </span>
      </div>

      <VisorCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={retoOk} onAprobado={() => setRetoOk(true)} playSfx={sfx} />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="dc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="dc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="dc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="dc-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="dc-drawer-body">
          <FichaTeorica data={DESCUBRIMIENTO_CELULA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/** Primera letra en minúscula, sin tocar nombres propios internos (E. coli, T4). */
function minuscula(t: string): string {
  return t.charAt(0).toLowerCase() + t.slice(1);
}
