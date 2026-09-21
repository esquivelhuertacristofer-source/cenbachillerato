"use client";

/**
 * Laboratorio 3D — "Contaminantes químicos y plásticos".
 * Progresión 10 de la UAC CNEYT-IV (actividades CNEYT-IV-P07-A*). Propósito:
 * «Evalúa el impacto de los contaminantes químicos y los plásticos en el
 * ambiente.» Anclado al quiz verdadero/falso A2 y al texto A6; el marco teórico
 * es la lectura A1, los hechos salen del quiz A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) Plástico en el mar — elegir una resina (código 1–7), tirarla en la playa
 *      o al mar, ver si flota o se hunde, dejar pasar el tiempo y pasar la red.
 *  (2) Biomagnificación — el DDT y el metilmercurio suben eslabón por eslabón;
 *      la edad del atún (bioacumulación) y la ingesta semanal de una persona.
 *  (3) ¿A dónde va tu residuo? — reciclaje, composta, relleno o río.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { CONTAMINANTES_PLASTICOS_FICHA } from "./contaminantes-plasticos-ficha";
import type { VistaContaminantes } from "./ContaminantesPlasticosScene";
import {
  type Modo,
  type ResinaId,
  type Lugar,
  type ContamId,
  type PescadoId,
  type ObjetoId,
  type DestinoId,
  type TipoContam,
  MODOS,
  MODOS_DEF,
  RESINAS,
  DENS_MAR,
  MALLA_MM,
  ZONA_DEF,
  CLASE_DEF,
  T_BIO,
  aniosDeSlider,
  tiempoTxt,
  tamTxt,
  pedazosTxt,
  flota,
  estadoPlastico,
  CADENAS,
  ppmNivel,
  ppmTxt,
  factorTxt,
  factorDesdeAgua,
  EDAD_ATUN_REF,
  PESCADOS,
  PORCION_G,
  LIMITE_HG,
  ingestaSemanal,
  OBJETOS,
  DESTINOS,
  RESULTADO_DEF,
  T_COMPOSTA_MIN,
  T_COMPOSTA_MAX,
  T_COMPOSTA_INDUSTRIAL,
  desenlace,
  TIPO_CONTAM_DEF,
  CONTAMINANTES,
  rondaContaminantes,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  NOTA_RECUADRO,
  PREGUNTAS,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
  num,
} from "./contaminantes-plasticos-data";

const ContaminantesScene = dynamic(() => import("./ContaminantesPlasticosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-water fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la costa y la cadena alimenticia en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-contaminantes-plasticos-reto";
const WARN = "#FF8A3C";
const T_CAIDA = 1800;
const T_RED = 3300;
const T_LLEGADA = 3200;
const RONDA_INICIAL = rondaContaminantes(mulberry32(7));
const TIPOS: TipoContam[] = ["metal", "cop", "micro"];
const ORIGEN_TXT: Record<string, string> = { A2: "quiz A2", texto: "libro de texto", FDA: "FDA", ilustrativo: "ilustrativo", ingesta: "ingesta" };

/* ── Tarjeta de estrellas: ¿qué tipo de contaminante es? ──────────────── */
function ClasificaCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = CONTAMINANTES[ronda[pos] ?? 0]!;

  const responder = (tipo: TipoContam) => {
    if (resuelto !== null) return;
    const ok = tipo === actual.tipo;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es ${TIPO_CONTAM_DEF[tipo].etq.toLowerCase()}. Pista: ${actual.porque}`);
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
    setRonda(rondaContaminantes(Math.random));
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
          ¿Qué tipo de contaminante es?
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
            Contaminante {pos + 1} de {ronda.length} · clasifícalo en uno de los tres grupos de la lectura A1
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>{actual.texto}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TIPOS.map((tp) => (
              <button key={tp} className="cp-opt cp-clasif" data-on="true" onClick={() => responder(tp)} style={{ ["--cpc" as string]: TIPO_CONTAM_DEF[tp].color }}>
                <i className={`fa-solid ${TIPO_CONTAM_DEF[tp].icono}`} style={{ marginRight: 8 }} />
                {TIPO_CONTAM_DEF[tp].etq}
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

export function LabContaminantesPlasticos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("oceano");

  // ── Océano
  const [resinaId, setResinaId] = useState<ResinaId>("pet");
  const [lugar, setLugar] = useState<Lugar>("mar");
  const [prediccion, setPrediccion] = useState<boolean | null>(null);
  const [tirado, setTirado] = useState(false);
  const [cayo, setCayo] = useState(false);
  const [sliderT, setSliderT] = useState(0);
  const [bio, setBio] = useState(false);
  const [redNonce, setRedNonce] = useState(0);
  const [redEnCurso, setRedEnCurso] = useState(false);
  const [redCaptura, setRedCaptura] = useState<number | null>(null);
  const [vioHundirse, setVioHundirse] = useState(false);
  const [vioMicro, setVioMicro] = useState(false);
  const [vioRedEscapa, setVioRedEscapa] = useState(false);

  // ── Cadena
  const [contamId, setContamId] = useState<ContamId>("ddt");
  const [paso, setPaso] = useState(0);
  const [edadAtun, setEdadAtun] = useState(EDAD_ATUN_REF);
  const [edadJoven, setEdadJoven] = useState(false);
  const [edadVieja, setEdadVieja] = useState(false);
  const [pescadoId, setPescadoId] = useState<PescadoId>("albacora");
  const [porciones, setPorciones] = useState(2);
  const [peso, setPeso] = useState(60);
  const [vioCimaDdt, setVioCimaDdt] = useState(false);
  const [vioExcede, setVioExcede] = useState(false);

  // ── Destino
  const [objetoId, setObjetoId] = useState<ObjetoId>("pet");
  const [destinoId, setDestinoId] = useState<DestinoId | null>(null);
  const [envioNonce, setEnvioNonce] = useState(0);
  const [llego, setLlego] = useState(false);
  const [tempComposta, setTempComposta] = useState(25);
  const [cicloPet, setCicloPet] = useState(false);
  const [plaSi, setPlaSi] = useState(false);
  const [plaNo, setPlaNo] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
  const tiroId = useRef(0);
  const envioId = useRef(0);
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

  /* ── Océano ────────────────────────────────────────────────────────── */
  const resina = RESINAS.find((r) => r.id === resinaId)!;
  const tAnios = aniosDeSlider(sliderT);
  const est = estadoPlastico(resina, lugar, tirado ? tAnios : 0, bio);
  const clase = CLASE_DEF[est.clase];
  const seHunde = !flota(resina);

  const limpiarTiro = () => {
    tiroId.current += 1;
    setTirado(false);
    setCayo(false);
    setSliderT(0);
    setRedCaptura(null);
    setRedEnCurso(false);
    setPrediccion(null);
  };
  const elegirResina = (id: ResinaId) => {
    setResinaId(id);
    limpiarTiro();
    blip();
  };
  const elegirLugar = (l: Lugar) => {
    setLugar(l);
    limpiarTiro();
    blip();
  };
  const tirar = () => {
    if (tirado) return;
    setTirado(true);
    if (sonido) audioRef.current?.gota();
    const id = ++tiroId.current;
    const hunde = lugar === "mar" && !flota(resina);
    despues(T_CAIDA, () => {
      if (tiroId.current !== id) return;
      setCayo(true);
      if (hunde) setVioHundirse(true);
      if (prediccion !== null && lugar === "mar") sfx(prediccion === flota(resina));
    });
  };
  const moverTiempo = (s: number) => {
    setSliderT(s);
    setRedCaptura(null);
    const e = estadoPlastico(resina, lugar, aniosDeSlider(s), bio);
    if (e.clase === "micro" || e.clase === "nano") setVioMicro(true);
  };
  const cambiarBio = () => {
    setBio((b) => !b);
    setRedCaptura(null);
    blip();
  };
  const pasarRed = () => {
    if (!tirado || lugar !== "mar" || redEnCurso) return;
    const captura = est.captura;
    const id = tiroId.current;
    setRedNonce((k) => k + 1);
    setRedEnCurso(true);
    setRedCaptura(null);
    blip();
    despues(T_RED, () => {
      if (tiroId.current !== id) return;
      setRedEnCurso(false);
      setRedCaptura(captura);
      if (captura < 0.5) setVioRedEscapa(true);
      sfx(captura >= 0.5);
    });
  };

  /* ── Cadena ────────────────────────────────────────────────────────── */
  const cadena = CADENAS[contamId];
  const niveles = cadena.niveles;
  const ultimo = niveles.length - 1;
  const iAtun = niveles.findIndex((n) => n.tipo === "atun");
  const pescado = PESCADOS.find((p) => p.id === pescadoId)!;
  const ingesta = ingestaSemanal(pescado.ppm, porciones, peso);
  const excede = ingesta > LIMITE_HG;

  const elegirContam = (c: ContamId) => {
    setContamId(c);
    setPaso(0);
    blip();
  };
  const avanzarCadena = () => {
    if (paso >= ultimo) {
      setPaso(0);
      blip();
      return;
    }
    const n = paso + 1;
    setPaso(n);
    if (sonido) audioRef.current?.gota();
    if (contamId === "ddt" && n === ultimo) setVioCimaDdt(true);
  };
  const moverEdad = (v: number) => {
    setEdadAtun(v);
    if (v <= 2) setEdadJoven(true);
    if (v >= 10) setEdadVieja(true);
  };
  const actualizaIngesta = (pid: PescadoId, por: number, pk: number) => {
    const p = PESCADOS.find((x) => x.id === pid)!;
    if (ingestaSemanal(p.ppm, por, pk) > LIMITE_HG) setVioExcede(true);
  };

  /* ── Destino ───────────────────────────────────────────────────────── */
  const objeto = OBJETOS.find((o) => o.id === objetoId)!;
  const des = destinoId ? desenlace(objetoId, destinoId, tempComposta) : null;
  const res = des ? RESULTADO_DEF[des.tipo] : null;

  const registraDesenlace = (o: ObjetoId, d: DestinoId, tc: number) => {
    const x = desenlace(o, d, tc);
    if (o === "pet" && x.tipo === "ciclo") setCicloPet(true);
    if (o === "pla" && x.tipo === "degrada") setPlaSi(true);
    if (o === "pla" && x.tipo !== "degrada") setPlaNo(true);
  };
  const elegirObjeto = (o: ObjetoId) => {
    envioId.current += 1;
    setObjetoId(o);
    setDestinoId(null);
    setLlego(false);
    blip();
  };
  const enviar = (d: DestinoId) => {
    const id = ++envioId.current;
    setDestinoId(d);
    setEnvioNonce((k) => k + 1);
    setLlego(false);
    blip();
    const o = objetoId;
    despues(T_LLEGADA, () => {
      if (envioId.current !== id) return;
      setLlego(true);
      const x = desenlace(o, d, tempComposta);
      sfx(x.tipo === "ciclo" || x.tipo === "degrada");
      registraDesenlace(o, d, tempComposta);
    });
  };
  const moverTemp = (v: number) => {
    setTempComposta(v);
    if (llego && destinoId === "composta") registraDesenlace(objetoId, "composta", v);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "oceano") limpiarTiro();
    if (modo === "cadena") setPaso(0);
    if (modo === "destino") {
      envioId.current += 1;
      setDestinoId(null);
      setLlego(false);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Tirar al mar un plástico más denso que el agua de mar y verlo hundirse", done: vioHundirse },
    { t: "Dejar pasar el tiempo hasta que un plástico se vuelva microplástico", done: vioMicro },
    { t: "Pasar la red de superficie y ver que se escapa más de la mitad del plástico", done: vioRedEscapa },
    { t: "Seguir el DDT eslabón por eslabón hasta el águila pescadora", done: vioCimaDdt },
    { t: "Comparar el mercurio de un atún joven (≤ 2 años) y uno viejo (≥ 10 años)", done: edadJoven && edadVieja },
    { t: "Encontrar una dieta que rebase la ingesta tolerable de metilmercurio", done: vioExcede },
    { t: "Reciclar una botella de PET y cerrar el ciclo", done: cicloPet },
    { t: "Comprobar dónde sí y dónde no se degrada el vaso de PLA", done: plaSi && plaNo },
    { t: "Clasificar contaminantes y ganar estrellas", done: clasifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaContaminantes = modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "oceano") {
    if (!tirado) {
      chipVivo = `${resina.codigo} ${resina.sigla} · ${num(resina.densidad, 2)} g/cm³ · listo para tirar`;
      pie = `${resina.objeto} de ${resina.sigla} (${resina.densTxt} g/cm³). El agua de mar tiene ${num(DENS_MAR, 3)} g/cm³: ¿flotará o se hundirá? Elige dónde tirarlo.`;
    } else {
      chipVivo = `${resina.sigla} · ${ZONA_DEF[est.zona].etq.toLowerCase()} · ${tiempoTxt(tAnios)} · ${tamTxt(est.L)}`;
      pie = !cayo
        ? lugar === "mar"
          ? "Cae al mar…"
          : "Cae en la arena…"
        : `${est.hundidoPorBio ? "Las algas y bacterias que lo cubrieron lo volvieron más pesado y se hundió. " : ""}${ZONA_DEF[est.zona].explica} Pedazos de ${tamTxt(est.L)} (${clase.etq.toLowerCase()}), ${pedazosTxt(est.pedazos)}: la masa de plástico sigue ahí.`;
    }
  } else if (modo === "cadena") {
    const nv = niveles[paso]!;
    const ppm = ppmNivel(cadena, paso, edadAtun);
    chipVivo = ppm !== null ? `${cadena.etq} · ${nv.etq.toLowerCase()} · ${ppmTxt(ppm)} ppm` : `${cadena.etq} · persona · ${num(ingesta, 2)} µg/kg por semana`;
    if (paso === 0) pie = `${cadena.porque} El contaminante empieza disuelto en el agua a ${ppmTxt(nv.ppm!)} ppm. Avanza eslabón por eslabón.`;
    else if (ppm !== null) {
      const prev = ppmNivel(cadena, paso - 1, edadAtun)!;
      pie = `${nv.etq} ${paso === 1 ? `absorbe el contaminante del ${niveles[0]!.etq.toLowerCase()}` : `se alimenta de ${niveles[paso - 1]!.etq.toLowerCase()}`}: la concentración sube ×${factorTxt(ppm / prev)} y ya es ${factorTxt(factorDesdeAgua(cadena, paso, edadAtun)!)} veces la del agua.${paso === ultimo ? ` ${cadena.efecto}` : ""}`;
    } else pie = `Una persona que come ${porciones} ${porciones === 1 ? "porción" : "porciones"} de ${pescado.etq.toLowerCase()} a la semana y pesa ${peso} kg recibe ${num(ingesta, 2)} µg de metilmercurio por kilogramo: ${excede ? "rebasa" : "no rebasa"} el límite de ${num(LIMITE_HG, 1)}.`;
  } else {
    chipVivo = destinoId ? (llego && res && des ? `${res.etq.toLowerCase()} · ${des.plazo}` : "en camino…") : `${objeto.etq.toLowerCase()} · elige un destino`;
    pie = destinoId && llego && des ? `${des.titulo}. ${des.texto}` : destinoId ? `${objeto.etq} va hacia: ${DESTINOS.find((d) => d.id === destinoId)!.etq.toLowerCase()}.` : `${objeto.etq} (${objeto.material}). ¿A dónde lo mandas?`;
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
  const dato = (etq: string, valor: string, col = "#fff") => (
    <div style={{ flex: "1 1 120px", padding: "9px 11px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 13.5, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "oceano") {
    control = (
      <>
        {sub("1 · Elige un plástico por su código de resina")}
        <div className="cp-opts">
          {RESINAS.map((r) => (
            <button key={r.id} className="cp-opt cp-resina" data-on={r.id === resinaId} onClick={() => elegirResina(r.id)} style={{ ["--cpc" as string]: modoCol, background: r.id === resinaId ? `${modoCol}1f` : "transparent" }}>
              <span className="cp-codigo" style={{ borderColor: r.color }}>
                {r.codigo}
              </span>
              {r.sigla}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "11px 13px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 900 }}>
            {resina.objeto} · {resina.nombre}
          </div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 4, lineHeight: 1.45, ...NUM }}>
            Densidad {resina.densTxt} g/cm³ · agua de mar {num(DENS_MAR, 3)} g/cm³. {resina.reciclaje}
          </div>
        </div>
        {sub("2 · Predice y elige dónde tirarlo")}
        <div className="cp-opts">
          {[true, false].map((f) => {
            const on = prediccion === f;
            const col = on && cayo && lugar === "mar" ? (f === flota(resina) ? OK : WARN) : modoCol;
            return (
              <button key={String(f)} className="cp-opt cp-pred" data-on={on} disabled={tirado} onClick={() => { setPrediccion(f); blip(); }} style={{ ["--cpc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${f ? "fa-arrow-up" : "fa-arrow-down"}`} style={{ marginRight: 8 }} />
                {f ? "Creo que flota" : "Creo que se hunde"}
              </button>
            );
          })}
        </div>
        <div className="cp-opts" style={{ marginTop: 7 }}>
          {(["playa", "mar"] as const).map((l) => (
            <button key={l} className="cp-opt cp-lugar" data-on={l === lugar} onClick={() => elegirLugar(l)} style={{ ["--cpc" as string]: accent, background: l === lugar ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              <i className={`fa-solid ${l === "playa" ? "fa-umbrella-beach" : "fa-water"}`} style={{ marginRight: 8 }} />
              {l === "playa" ? "En la playa" : "Al mar"}
            </button>
          ))}
        </div>
        <button className="cp-toggle cp-tirar" onClick={tirar} disabled={tirado} style={{ marginTop: 10, ["--cpc" as string]: modoCol }}>
          <i className={`fa-solid ${tirado && !cayo ? "fa-spinner fa-spin" : "fa-hand-holding-droplet"}`} style={{ marginRight: 9, color: modoCol }} />
          {tirado ? (cayo ? (lugar === "playa" ? "Quedó en la arena, al sol" : seHunde ? "Se hundió hasta el fondo" : "Flota en la superficie") : "Cayendo…") : `Tirar ${resina.objeto.toLowerCase()} ${lugar === "playa" ? "en la playa" : "al mar"}`}
        </button>
        {cayo && lugar === "mar" && nota(`${prediccion === null ? "" : prediccion === flota(resina) ? "Bien predicho. " : "Tu predicción falló. "}${resina.nota}`, prediccion === null || prediccion === flota(resina) ? (seHunde ? "#7dd3fc" : OK) : WARN, seHunde ? "fa-arrow-down" : "fa-arrow-up")}

        {sub("3 · Deja pasar el tiempo")}
        <div style={{ opacity: tirado ? 1 : 0.45, pointerEvents: tirado ? "auto" : "none" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="fa-solid fa-hourglass-half" style={{ color: modoCol }} />
            <input type="range" aria-label="Tiempo transcurrido (años)" className="cp-range" min={0} max={100} step={1} value={sliderT} disabled={!tirado} onChange={(e) => moverTiempo(Number(e.target.value))} style={{ ["--cpc" as string]: modoCol }} />
            <span style={{ width: 96, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{tiempoTxt(tAnios)}</span>
          </label>
          <div style={{ fontSize: 10.5, color: T.text3, marginTop: 2 }}>Escala logarítmica: de un mes a mil años.</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
            {dato("Dónde está", ZONA_DEF[est.zona].etq)}
            {dato("Pedazos típicos", tamTxt(est.L), clase.color)}
            {dato("Clase", clase.etq, clase.color)}
            {dato("Cuántos", pedazosTxt(est.pedazos))}
          </div>
          {lugar === "mar" && !seHunde && (
            <label style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10, fontSize: 12, color: T.text2, cursor: "pointer" }}>
              <input type="checkbox" checked={bio} onChange={cambiarBio} aria-label="Considerar bioincrustación" style={{ accentColor: modoCol }} />
              Considerar la bioincrustación: algas y bacterias lo cubren y lo hunden (en el modelo, a los {Math.round(T_BIO * 12)} meses)
            </label>
          )}
        </div>

        {sub("4 · Pasa la red de superficie")}
        <button className="cp-toggle cp-red" onClick={pasarRed} disabled={!tirado || !cayo || lugar !== "mar" || redEnCurso} style={{ ["--cpc" as string]: accent }}>
          <i className={`fa-solid ${redEnCurso ? "fa-spinner fa-spin" : "fa-border-all"}`} style={{ marginRight: 9, color: accent }} />
          {lugar !== "mar" ? "La red se pasa en el mar" : redEnCurso ? "Arrastrando la red…" : `Arrastrar una red de manta (malla de ${num(MALLA_MM, 3)} mm)`}
        </button>
        {redCaptura !== null &&
          nota(
            <>
              <strong>La red atrapó ≈ {num(redCaptura * 100, 0)} % del plástico.</strong>{" "}
              {est.zona === "fondo"
                ? "Todo está en el fondo: una red de superficie no toca nada."
                : redCaptura >= 0.5
                  ? "Los pedazos todavía son más grandes que la malla. Deja pasar más tiempo o prueba un plástico que se hunda."
                  : `Los pedazos (${tamTxt(est.L)}) ya son más finos que la malla y se escapan por los huecos.`}{" "}
              Por eso limpiar el océano con redes no basta: hay que evitar que el plástico llegue.
            </>,
            redCaptura >= 0.5 ? "#fbbf24" : WARN,
            "fa-border-all",
          )}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          Las densidades son reales. La velocidad de fragmentación es un modelo ilustrativo: sólo el orden de magnitud y que la playa fragmenta más rápido que la superficie y ésta más que el fondo están
          respaldados. Los «450 años» del PET que cita la lectura A1 son una estimación: nadie lo ha medido, y fragmentarse no es desaparecer.
        </div>
      </>
    );
  } else if (modo === "cadena") {
    const nombreSiguiente = paso < ultimo ? niveles[paso + 1]!.etq : "";
    control = (
      <>
        <div className="cp-opts">
          {(["ddt", "hg"] as const).map((c) => (
            <button key={c} className="cp-opt cp-contam" data-on={c === contamId} onClick={() => elegirContam(c)} style={{ ["--cpc" as string]: modoCol, background: c === contamId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${c === "ddt" ? "fa-spray-can" : "fa-temperature-low"}`} style={{ marginRight: 8 }} />
              {CADENAS[c].etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.text2, marginTop: 8, lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>{cadena.nombre}.</strong> {cadena.porque}
        </div>
        {sub(`Eslabón ${paso + 1} de ${niveles.length}`)}
        <button className="cp-toggle cp-avanzar" onClick={avanzarCadena} style={{ ["--cpc" as string]: modoCol }}>
          <i className={`fa-solid ${paso >= ultimo ? "fa-rotate-left" : "fa-arrow-up"}`} style={{ marginRight: 9, color: modoCol }} />
          {paso >= ultimo ? "Volver a empezar la cadena" : `Siguiente eslabón: ${nombreSiguiente.toLowerCase()} ${paso === 0 ? "absorbe del agua" : `come ${niveles[paso]!.etq.toLowerCase()}`}`}
        </button>
        <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
          {niveles.map((n, i) => {
            const ppm = ppmNivel(cadena, i, edadAtun);
            const visto = i <= paso;
            return (
              <div key={`${contamId}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 9, background: i === paso ? `${modoCol}1a` : "rgba(4,10,22,0.35)", border: `1px solid ${i === paso ? `${modoCol}66` : T.line}`, fontSize: 12, ...NUM }}>
                <span style={{ flex: 1, color: visto ? "#fff" : T.text3, fontWeight: 800 }}>{n.etq}</span>
                <span style={{ color: visto ? "#fff" : T.text3, fontWeight: 900 }}>{visto ? (ppm !== null ? `${ppmTxt(ppm)} ppm` : `${num(ingesta, 2)} µg/kg/sem`) : "?"}</span>
                <span style={{ width: 92, textAlign: "right", fontSize: 10.5, color: T.text3 }}>{visto && ppm !== null && i > 0 ? `×${factorTxt(factorDesdeAgua(cadena, i, edadAtun)!)} vs agua` : ORIGEN_TXT[n.origen]}</span>
              </div>
            );
          })}
        </div>
        {paso === ultimo && nota(cadena.efecto, "#fbbf24", "fa-landmark")}
        {contamId === "ddt" && <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Agua, peces pequeños y águila: cifras del quiz A2. Zooplancton y peces grandes: valores del mismo ejemplo clásico de libro de texto (estuario de Long Island, años 60).</div>}
        {contamId === "hg" && (
          <>
            {sub("Bioacumulación: la edad del atún")}
            <div style={{ opacity: paso >= iAtun ? 1 : 0.45, pointerEvents: paso >= iAtun ? "auto" : "none" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className="fa-solid fa-fish" style={{ color: modoCol }} />
                <input type="range" aria-label="Edad del atún (años)" className="cp-range" min={1} max={12} step={1} value={edadAtun} disabled={paso < iAtun} onChange={(e) => moverEdad(Number(e.target.value))} style={{ ["--cpc" as string]: modoCol }} />
                <span style={{ width: 70, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{edadAtun} años</span>
              </label>
              {nota(
                `Un atún de ${edadAtun} años tiene ≈ ${ppmTxt(ppmNivel(cadena, iAtun, edadAtun)!)} ppm. Come lo mismo que uno joven, pero ha acumulado metilmercurio durante más tiempo: eso es bioacumulación, dentro de un solo organismo. La biomagnificación es el salto entre eslabones.`,
                T.text2,
                "fa-clock",
              )}
              {paso < iAtun && <div style={{ fontSize: 11, color: T.text3, marginTop: 6 }}>Avanza la cadena hasta el atún para mover la edad.</div>}
            </div>
            {sub("¿Cuánto recibe una persona?")}
            <div className="cp-opts">
              {PESCADOS.map((p) => (
                <button key={p.id} className="cp-opt cp-pescado" data-on={p.id === pescadoId} onClick={() => { setPescadoId(p.id); actualizaIngesta(p.id, porciones, peso); blip(); }} style={{ ["--cpc" as string]: accent, background: p.id === pescadoId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                  {p.etq} · {ppmTxt(p.ppm)} ppm
                </button>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <span style={{ width: 128, fontSize: 11.5, color: T.text2 }}>Porciones de {PORCION_G} g por semana</span>
              <input type="range" aria-label="Porciones por semana" className="cp-range" min={0} max={7} step={1} value={porciones} onChange={(e) => { const v = Number(e.target.value); setPorciones(v); actualizaIngesta(pescadoId, v, peso); }} style={{ ["--cpc" as string]: accent }} />
              <span style={{ width: 40, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{porciones}</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span style={{ width: 128, fontSize: 11.5, color: T.text2 }}>Peso corporal</span>
              <input type="range" aria-label="Peso corporal (kg)" className="cp-range" min={40} max={90} step={5} value={peso} onChange={(e) => { const v = Number(e.target.value); setPeso(v); actualizaIngesta(pescadoId, porciones, v); }} style={{ ["--cpc" as string]: accent }} />
              <span style={{ width: 40, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{peso} kg</span>
            </label>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
              {ppmTxt(pescado.ppm)} mg/kg × 1000 µg/mg × {PORCION_G / 1000} kg × {porciones} ÷ {peso} kg = <strong style={{ color: excede ? WARN : OK }}>{num(ingesta, 2)} µg/kg por semana</strong>
            </div>
            <div className="cp-barra" aria-hidden>
              <div style={{ width: `${Math.min(100, (ingesta / (LIMITE_HG * 2)) * 100)}%`, background: excede ? WARN : OK }} />
              <span style={{ left: "50%" }} />
            </div>
            <div style={{ fontSize: 10.5, color: T.text3, display: "flex", justifyContent: "space-between", marginTop: 3, ...NUM }}>
              <span>0</span>
              <span>límite {num(LIMITE_HG, 1)}</span>
              <span>{num(LIMITE_HG * 2, 1)}</span>
            </div>
            {nota(
              excede
                ? `Rebasa la ingesta semanal tolerable de ${num(LIMITE_HG, 1)} µg/kg (JECFA, FAO/OMS). El pez espada es un depredador grande y longevo: una sola porción puede bastar.`
                : `Por debajo del límite de ${num(LIMITE_HG, 1)} µg/kg por semana. Cambia el pescado, las porciones o el peso para encontrar una dieta que lo rebase.`,
              excede ? WARN : OK,
              excede ? "fa-triangle-exclamation" : "fa-circle-check",
            )}
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
              Mercurio en pescado: promedios de la FDA (1990–2012), casi todo como metilmercurio. Agua, plancton y la curva de la edad del atún: valores ilustrativos del orden de magnitud real. Es un ejercicio, no una recomendación médica; en el embarazo el cuidado es mayor.
            </div>
          </>
        )}
      </>
    );
  } else {
    control = (
      <>
        {sub("1 · El residuo")}
        <div className="cp-opts">
          {OBJETOS.map((o) => (
            <button key={o.id} className="cp-opt cp-objeto" data-on={o.id === objetoId} onClick={() => elegirObjeto(o.id)} style={{ ["--cpc" as string]: modoCol, background: o.id === objetoId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${o.icono}`} style={{ marginRight: 8 }} />
              {o.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.text2, marginTop: 8 }}>{objeto.material}</div>
        {sub("2 · ¿A dónde lo mandas?")}
        <div className="cp-opts">
          {DESTINOS.map((d) => (
            <button key={d.id} className="cp-opt cp-destino" data-on={d.id === destinoId} onClick={() => enviar(d.id)} style={{ ["--cpc" as string]: d.color, background: d.id === destinoId ? `${d.color}1f` : "transparent" }}>
              <i className={`fa-solid ${d.icono}`} style={{ marginRight: 8 }} />
              {d.etq}
            </button>
          ))}
        </div>
        {sub("Temperatura de la composta")}
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-temperature-half" style={{ color: "#fb923c" }} />
          <input type="range" aria-label="Temperatura de la composta (°C)" className="cp-range" min={T_COMPOSTA_MIN} max={T_COMPOSTA_MAX} step={1} value={tempComposta} onChange={(e) => moverTemp(Number(e.target.value))} style={{ ["--cpc" as string]: "#fb923c" }} />
          <span style={{ width: 56, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{tempComposta} °C</span>
        </label>
        <div style={{ fontSize: 10.5, color: T.text3, marginTop: 2 }}>Composta casera: 20–40 °C · planta de compostaje industrial: ≈ {T_COMPOSTA_INDUSTRIAL} °C.</div>
        {destinoId && !llego && nota("En camino…", T.text2, "fa-truck-arrow-right")}
        {llego && des && res && (
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${res.color}66`, background: "rgba(4,10,22,0.45)" }}>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: res.color, marginBottom: 4 }}>
              <i className={`fa-solid ${res.icono}`} style={{ marginRight: 7 }} />
              {res.etq} · {des.titulo}
            </div>
            <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>{des.texto}</div>
          </div>
        )}
        {objetoId === "pla" && nota(plaSi && plaNo ? "Ya lo viste: el PLA sólo se desintegra con el calor de la composta industrial." : "Prueba el vaso de PLA en la composta a menos de 50 °C y a 58 °C, y en otro destino.", plaSi && plaNo ? OK : T.text3, "fa-leaf")}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          Los desenlaces describen lo que ocurre normalmente en México; cada municipio y cada planta es distinto. La desintegración del PLA entre 50 y 58 °C es una transición ilustrativa; a 58 °C la norma EN 13432 exige al menos 90 % en 12 semanas.
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cpPulse { 0%,100%{ box-shadow:0 0 0 0 var(--cpd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .cp-live-dot { animation: cpPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .cp-live-dot { animation:none; } }
        .cp-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .cp-grid { grid-template-columns: 1fr; } }
        .cp-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cp-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .cp-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cp-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .cp-tab { cursor:pointer; border:1px solid var(--cpc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .cp-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .cp-tab:hover { background:rgba(255,255,255,0.06); }
        .cp-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .cp-opt { cursor:pointer; border:1px solid var(--cpc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; display:inline-flex; align-items:center; }
        .cp-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .cp-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cp-opt:disabled { cursor:default; }
        .cp-opt:disabled[data-on="false"] { opacity:0.55; }
        .cp-codigo { display:inline-flex; align-items:center; justify-content:center; width:19px; height:19px; margin-right:7px; border:1.5px solid; border-radius:5px; font-size:10.5px; font-weight:900; }
        .cp-toggle { width:100%; cursor:pointer; border:1px solid var(--cpc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .cp-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .cp-toggle:disabled { cursor:default; opacity:0.75; }
        .cp-range { flex:1; accent-color: var(--cpc); }
        .cp-barra { position:relative; height:10px; border-radius:6px; background:rgba(255,255,255,0.08); margin-top:10px; overflow:hidden; }
        .cp-barra > div { height:100%; border-radius:6px; transition:width .3s ease, background .3s ease; }
        .cp-barra > span { position:absolute; top:0; bottom:0; width:2px; background:#fff; }
        .cp-opt:focus-visible, .cp-tab:focus-visible, .cp-toggle:focus-visible, .cp-icobtn:focus-visible, .cp-range:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .cp-bottom { grid-template-columns: 1fr !important; } }
        .cp-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .cp-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .cp-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .cp-drawer[data-open="true"] { transform:translateX(0); }
        .cp-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .cp-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .cp-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .cp-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .cp-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .cp-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="cp-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="cp-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--cpc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="cp-grid">
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
              <ContaminantesScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                resinaId={resinaId}
                lugar={lugar}
                tirado={tirado}
                tAnios={tAnios}
                bio={bio}
                redNonce={redNonce}
                contamId={contamId}
                paso={paso}
                edadAtun={edadAtun}
                ingesta={ingesta}
                objetoId={objetoId}
                destinoId={destinoId}
                envioNonce={envioNonce}
                tempComposta={tempComposta}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="cp-live-dot" style={{ ["--cpd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="cp-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="cp-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="cp-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="cp-teoria-fab" onClick={() => setDrawer(true)}>
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
                <i className="fa-solid fa-bottle-water" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿A dónde va lo que tiramos?</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="cp-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-droplet" style={{ marginRight: 8, color: accent }} />
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
                    <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
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
          La lectura A1 con sus preguntas y su recuadro, los hechos del quiz A4, el glosario A5, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la plataforma (la
          precisión bajo el recuadro no lo es). Son <strong>datos reales</strong>: las densidades de las resinas, la malla de 0.333 mm de la red de manta, las clases de tamaño de los
          plásticos, el mercurio promedio en pescado comercial (FDA, 1990–2012) y la ingesta semanal tolerable de metilmercurio de 1.6 µg/kg (JECFA, FAO/OMS). Son{" "}
          <strong>modelos ilustrativos</strong>: la velocidad de fragmentación, el efecto de la bioincrustación, el mercurio del agua y del plancton, la curva con la edad del atún y la
          desintegración del PLA entre 50 y 58 °C. La cadena del DDT combina las cifras del quiz A2 con el ejemplo clásico de libro de texto. Fuente: {FUENTE}
        </span>
      </div>

      <ClasificaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes qué pasa con los plásticos y los contaminantes." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="cp-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="cp-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="cp-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="cp-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cp-drawer-body">
          <FichaTeorica data={CONTAMINANTES_PLASTICOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
