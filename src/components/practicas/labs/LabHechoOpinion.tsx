"use client";

/**
 * Laboratorio — Hecho, idea y opinión
 * Práctica experimental para LC-I-P03-A9 (Lengua y Comunicación I, semestre 1):
 * «Analiza en textos de su elección la información, ideas, pensamientos y
 * opiniones, para comprender su sentido.»
 *
 * EXPERIMENTO CENTRAL: el alumno etiqueta, enunciado por enunciado, tres
 * textos (nota informativa, columna de opinión, anuncio) y VE cómo cambia la
 * decisión del lector. Con sus etiquetas se arman, en vivo:
 *  · la composición del texto (información / idea / opinión),
 *  · un veredicto de lectura («decides con datos», «te empujan», «mixto»),
 *  · un filtro «solo lo comprobable» que apaga todo lo que no es información.
 * Si etiqueta una opinión como información, el texto parece más confiable de
 * lo que es y, al terminar, el laboratorio muestra cómo su veredicto cambió.
 *
 * Modos: «Etiqueta el texto» (simulador) · «Clasifica los enunciados» (A9) ·
 * «Caza la marca» · «Completa el texto» (A5). La teoría verbatim vive en la
 * pestaña «Teoría» y el quiz de A2 en «Reto».
 *
 * DOM puro (sin three.js). Textos, marca y biblioteca FICTICIOS; los datos
 * sobre Juan Rulfo, el Metro y la FIL son reales.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { HECHO_OPINION_HUECOS } from "./hecho-opinion-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { HECHO_OPINION_FICHA } from "./hecho-opinion-ficha";
import {
  TEXTOS,
  CATEGORIAS,
  CATEGORIA_INFO,
  ERROR_POR_LENTE,
  PROPOSITO_INFO,
  ENUNCIADOS,
  INSTRUCCION_A9,
  MARCAS,
  QUIZ,
  HECHOS,
  MARCO,
  DATO_RULFO,
  DEBATE_A6,
  PISTAS_A3,
  FUENTE,
  type Categoria,
  type Proposito,
  type Segmento,
  type TextoAnalizable,
  type Marca,
} from "./hecho-opinion-data";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
const RETO_KEY = "cen-hecho-opinion-reto";
const RUTA_FOTOS = "/media/labs-sim/hecho-opinion-texto";

/** Foto de cabecera de cada texto. */
const FOTO_TEXTO: Record<string, string> = {
  biblioteca: "biblioteca-plaza",
  rulfo: "libros-pupitre",
  anuncio: "cuadernos-mostrador",
};

type Modo = "marcar" | "clasificar" | "marca" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "marcar", label: "Etiqueta el texto", icono: "fa-highlighter" },
  { id: "clasificar", label: "Clasifica los enunciados", icono: "fa-layer-group" },
  { id: "marca", label: "Caza la marca", icono: "fa-magnifying-glass" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const PROPOSITOS: Proposito[] = ["informar", "convencer", "ambas"];

/* ── Simulador: qué lectura deja un conjunto de etiquetas ─────────────── */
type Tono = "datos" | "mixto" | "empuje" | "interpreta";

const TONO_INFO: Record<Tono, { titulo: string; texto: string; color: string; icono: string }> = {
  datos: {
    titulo: "Decides con datos",
    texto: "Casi todo lo que lees se puede comprobar: puedes decidir sin que nadie te empuje.",
    color: "#34D399",
    icono: "fa-magnifying-glass-chart",
  },
  mixto: {
    titulo: "Te informa y te empuja",
    texto: "Hay datos reales y también juicios que buscan convencerte: toma los datos y descuenta la persuasión.",
    color: AVISO,
    icono: "fa-scale-balanced",
  },
  empuje: {
    titulo: "Te empujan a decidir",
    texto: "Pesan más los juicios que los datos: antes de aceptar, busca información aparte que lo compruebe.",
    color: NO,
    icono: "fa-bullhorn",
  },
  interpreta: {
    titulo: "Te dan una lectura",
    texto: "Se apoya en hechos, pero lo central es interpretación de quien escribe: contrástala con otra fuente.",
    color: "#A78BFA",
    icono: "fa-lightbulb",
  },
};

function tonoDe(c: Record<Categoria, number>, total: number): Tono {
  const info = c.informacion / total;
  const op = c.opinion / total;
  if (c.opinion === 0 && info >= 0.5) return "datos";
  if (info >= 0.5 && c.opinion > 0) return "mixto";
  if (op >= 0.3) return "empuje";
  return "interpreta";
}

const cuentaDe = (t: TextoAnalizable, tag: (s: Segmento) => Categoria | undefined): Record<Categoria, number> => {
  const c: Record<Categoria, number> = { informacion: 0, idea: 0, opinion: 0 };
  for (const s of t.segmentos) {
    const x = tag(s);
    if (x) c[x]++;
  }
  return c;
};

export function LabHechoOpinion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("marcar");

  // ── sonido y partida ──────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabSfx();
      await audioRef.current.enable();
      setSonido(true);
    } else {
      audioRef.current?.mute();
      setSonido(false);
    }
  };
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  /* ── MODO 1 · etiquetar el texto ────────────────────────────────────── */
  const [txtIdx, setTxtIdx] = useState(0);
  const [lente, setLente] = useState<Categoria>("informacion");
  const [marcado, setMarcado] = useState<Record<string, Categoria>>({});
  const [nota, setNota] = useState<{ tono: "ok" | "no"; titulo: string; texto: string } | null>(null);
  const [shakeSeg, setShakeSeg] = useState<string | null>(null);
  const [propElegido, setPropElegido] = useState<Record<string, Proposito>>({});
  const [soloDatos, setSoloDatos] = useState(false);
  /** Experimentos hechos al menos una vez (misiones nuevas). */
  const [vioFiltro, setVioFiltro] = useState(false);
  const [vioEngano, setVioEngano] = useState(false);

  const texto: TextoAnalizable = TEXTOS[txtIdx]!;
  const marcadosDelTexto = texto.segmentos.filter((s) => marcado[s.id]).length;
  const textoCompleto = marcadosDelTexto >= texto.segmentos.length;
  const propOkDelTexto = propElegido[texto.id] === texto.proposito;

  const marcarSegmento = (seg: Segmento) => {
    if (marcado[seg.id] === lente) {
      // Segundo toque con el mismo marcador: quita la etiqueta.
      setMarcado((m) => {
        const n = { ...m };
        delete n[seg.id];
        return n;
      });
      setNota(null);
      return;
    }
    setMarcado((m) => ({ ...m, [seg.id]: lente }));
    if (seg.categoria === lente) {
      sfxPlace();
      setNota({ tono: "ok", titulo: CATEGORIA_INFO[lente].titulo, texto: seg.explicacion });
    } else {
      sfxNo();
      setShakeSeg(seg.id);
      window.setTimeout(() => setShakeSeg(null), 420);
      const engano = lente === "informacion" && seg.categoria === "opinion";
      if (engano) setVioEngano(true);
      setNota({
        tono: "no",
        titulo: `Eso no es ${CATEGORIA_INFO[lente].titulo.toLowerCase()}`,
        texto: `${engano ? "Al llamarla información, este texto parece más confiable de lo que es. " : ""}${ERROR_POR_LENTE[lente]}`,
      });
    }
  };

  const elegirProposito = (p: Proposito) => {
    if (propElegido[texto.id] === texto.proposito) return;
    setPropElegido((m) => ({ ...m, [texto.id]: p }));
    if (p === texto.proposito) sfxOk();
    else sfxNo();
  };

  const alternarFiltro = () => {
    setSoloDatos((v) => !v);
    if (!soloDatos && marcadosDelTexto > 0) setVioFiltro(true);
  };

  const resetMarcar = () => {
    const quitar = new Set(texto.segmentos.map((s) => s.id));
    setMarcado((m) => Object.fromEntries(Object.entries(m).filter(([k]) => !quitar.has(k))));
    setPropElegido((m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== texto.id)));
    setNota(null);
    setSoloDatos(false);
  };

  const correctoDe = (t: TextoAnalizable) => t.segmentos.every((s) => marcado[s.id] === s.categoria);
  const propositosDone = TEXTOS.every((t) => propElegido[t.id] === t.proposito);

  /* ── MODO 2 · clasificar los nueve enunciados (A9) ───────────────────── */
  const [ubic, setUbic] = useState<Record<string, Categoria>>({});
  const [selEnun, setSelEnun] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<Categoria | null>(null);
  const enunLibres = ENUNCIADOS.filter((e) => !ubic[e.id]);

  const intentarEnun = (enunId: string, bin: Categoria) => {
    if (ubic[enunId]) return;
    const e = ENUNCIADOS.find((x) => x.id === enunId);
    if (!e) return;
    if (e.categoria === bin) {
      setUbic((u) => ({ ...u, [enunId]: bin }));
      setSelEnun(null);
      sfxPlace();
      if (Object.keys(ubic).length + 1 >= ENUNCIADOS.length) sfxOk();
    } else {
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbic({});
    setSelEnun(null);
  };
  const clasificarDone = Object.keys(ubic).length >= ENUNCIADOS.length;

  /* ── MODO 3 · caza la marca ─────────────────────────────────────────── */
  const [mIdx, setMIdx] = useState(0);
  const [resueltas, setResueltas] = useState<Record<string, boolean>>({});
  const [falloMarca, setFalloMarca] = useState<string | null>(null);
  const item: Marca = MARCAS[mIdx]!;
  const itemResuelto = resueltas[item.id] === true;

  const clicPalabra = (i: number) => {
    if (itemResuelto) return;
    if (!item.sinMarca && item.marcas.includes(i)) {
      setResueltas((r) => ({ ...r, [item.id]: true }));
      setFalloMarca(null);
      sfxPlace();
      if (Object.keys(resueltas).length + 1 >= MARCAS.length) sfxOk();
    } else {
      setFalloMarca(
        item.sinMarca
          ? "Ninguna palabra de esta oración valora nada: todas aportan el dato. Si crees que no hay marca, dilo con el botón de abajo."
          : "Esa palabra no valora: describe. Busca la que califica («mejor», «insoportable»), la que propone («deberíamos») o la que finge certeza («sin duda»).",
      );
      sfxNo();
    }
  };

  const clicSinMarca = () => {
    if (itemResuelto) return;
    if (item.sinMarca) {
      setResueltas((r) => ({ ...r, [item.id]: true }));
      setFalloMarca(null);
      sfxPlace();
      if (Object.keys(resueltas).length + 1 >= MARCAS.length) sfxOk();
    } else {
      setFalloMarca("Sí hay marca: alguna palabra de esta oración está valorando. Léela otra vez y señálala.");
      sfxNo();
    }
  };

  const resetMarcas = () => {
    setResueltas({});
    setFalloMarca(null);
    setMIdx(0);
  };
  const marcasDone = Object.keys(resueltas).length >= MARCAS.length;

  /* ── MODO 4 · completa el texto (A5 verbatim) ────────────────────────── */
  const [huecosDone, setHuecosDone] = useState(false);
  const [huecosIntento, setHuecosIntento] = useState(0);
  const resetHuecos = () => {
    setHuecosDone(false);
    setHuecosIntento((n) => n + 1);
  };

  /* ── reto evaluable ─────────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ──────────────────────────────────────────────────────── */
  const todoHecho = TEXTOS.every(correctoDe) && propositosDone && clasificarDone && marcasDone && huecosDone;
  const objetivos = [
    { txt: "Activa «Solo lo comprobable» en un texto etiquetado y mira cuánto queda", done: vioFiltro },
    { txt: "Llama «información» a una opinión y observa cómo cambia el veredicto del texto", done: vioEngano },
    { txt: `Etiqueta los ${TEXTOS[0]!.segmentos.length} enunciados de la nota informativa`, done: correctoDe(TEXTOS[0]!) },
    { txt: `Etiqueta los ${TEXTOS[1]!.segmentos.length} enunciados de la columna de opinión`, done: correctoDe(TEXTOS[1]!) },
    { txt: `Etiqueta los ${TEXTOS[2]!.segmentos.length} enunciados del anuncio`, done: correctoDe(TEXTOS[2]!) },
    { txt: "Acierta el propósito de los tres textos", done: propositosDone },
    { txt: `Clasifica los ${ENUNCIADOS.length} enunciados de la actividad`, done: clasificarDone },
    { txt: `Caza la marca de las ${MARCAS.length} oraciones`, done: marcasDone },
    { txt: "Completa el texto con los cuatro términos", done: huecosDone, modo: "texto" },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  /* ── arrastre nativo (modo clasificar) ──────────────────────────────── */
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      // El hueco que deja la tarjeta mientras viaja. Por atributo y no por
      // estado: un render por cada gesto de arrastre se nota con 20 tarjetas.
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: React.DragEvent) => {
      // También cuando se suelta FUERA de cualquier zona; si no, la tarjeta se
      // queda medio borrada para siempre.
      e.currentTarget.removeAttribute("data-arrastrando");
      document.querySelectorAll('[data-sobre="true"]').forEach((z) => z.removeAttribute("data-sobre"));
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.setAttribute("data-sobre", "true");
    },
    onDragLeave: (e: React.DragEvent) => {
      // `dragleave` salta también al pasar sobre un HIJO de la zona. Apagar sin
      // comprobar deja la zona parpadeando mientras mueves la mano por dentro.
      const r = e.currentTarget.getBoundingClientRect();
      const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fuera) e.currentTarget.removeAttribute("data-sobre");
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.removeAttribute("data-sobre");
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
    "data-zona": "true" as const,
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  });

  const resetActual = modo === "marcar" ? resetMarcar : modo === "clasificar" ? resetClasificar : modo === "marca" ? resetMarcas : resetHuecos;

  // ── lectura en vivo ──────────────────────────────────────────────────
  const cuentaAlumno = cuentaDe(texto, (s) => marcado[s.id]);
  const lectura =
    modo === "marcar" ? (
      <>
        Etiquetados {marcadosDelTexto}/{texto.segmentos.length} · comprobable {cuentaAlumno.informacion}/{texto.segmentos.length}
      </>
    ) : modo === "clasificar" ? (
      <>Enunciados clasificados: {Object.keys(ubic).length}/{ENUNCIADOS.length}</>
    ) : modo === "marca" ? (
      <>Oraciones resueltas: {Object.keys(resueltas).length}/{MARCAS.length}</>
    ) : (
      <>Completa los cuatro términos</>
    );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      dom
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })),
        valor: modo,
        cambiar: (id) => setModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {/* MODO 1 — etiqueta el texto y mira la decisión */}
          {modo === "marcar" && (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TEXTOS.map((t, i) => {
                  const listo = correctoDe(t) && propElegido[t.id] === t.proposito;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className="hop-doc"
                      data-on={txtIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setTxtIdx(i);
                        setNota(null);
                        setSoloDatos(false);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : t.icono}`} />
                      {t.genero}
                    </button>
                  );
                })}
              </div>

              <div className="hop-lentes" role="group" aria-label="Etiquetas">
                {CATEGORIAS.map((c) => {
                  const info = CATEGORIA_INFO[c];
                  const on = lente === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      className="hop-lente"
                      data-on={on}
                      aria-pressed={on}
                      onClick={() => setLente(c)}
                      style={on ? { borderColor: info.color, background: `${info.color}1f`, boxShadow: `0 0 18px -7px ${info.color}` } : undefined}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 900, color: on ? "#fff" : info.color }}>
                        <i className={`fa-solid ${info.icono}`} />
                        {info.titulo}
                      </span>
                      <span style={{ display: "block", fontSize: 14, lineHeight: 1.35, marginTop: 4, color: on ? T.text2 : T.text3 }}>{info.pregunta}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hop-sim">
                <article className="hop-art">
                  <Foto key={texto.id} clave={FOTO_TEXTO[texto.id] ?? texto.id} icono={texto.icono} />
                  <div className="hop-art-cuerpo">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <VinetaTermino termino={texto.titulo} color={accent} icono={texto.icono} tam={33} radio={9} />
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", minWidth: 0 }}>{texto.titulo}</span>
                    </div>
                    <div style={{ marginTop: 3, fontSize: 14, color: T.text3 }}>
                      {texto.genero} · {texto.credito}
                    </div>
                    <p className="hop-parrafo">
                      {texto.segmentos.map((s) => {
                        const cat = marcado[s.id];
                        const info = cat ? CATEGORIA_INFO[cat] : null;
                        const apagado = soloDatos && cat !== "informacion";
                        return (
                          <span
                            key={s.id}
                            className="hop-seg"
                            role="button"
                            tabIndex={0}
                            aria-label={cat ? `${s.texto} — etiquetado como ${info!.titulo}` : s.texto}
                            data-done={!!cat}
                            data-mal={!!cat && cat !== s.categoria}
                            data-apagado={apagado}
                            data-shake={shakeSeg === s.id}
                            onClick={() => marcarSegmento(s)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                marcarSegmento(s);
                              }
                            }}
                            style={info ? { background: `${info.color}26`, borderBottomColor: info.color } : undefined}
                          >
                            {s.texto}
                            {info && (
                              <span className="hop-badge" style={{ background: `${info.color}33`, color: info.color }}>
                                <i className={`fa-solid ${info.icono}`} />
                                {info.titulo}
                              </span>
                            )}{" "}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </article>

                <Lectura
                  texto={texto}
                  marcado={marcado}
                  soloDatos={soloDatos}
                  onFiltro={alternarFiltro}
                  textoCompleto={textoCompleto}
                  propElegido={propElegido[texto.id]}
                  propOk={propOkDelTexto}
                  onProposito={elegirProposito}
                />
              </div>

              <div className="hop-nota" role="status" aria-live="polite" data-tono={nota?.tono ?? "vacio"}>
                <i className={`fa-solid ${nota ? (nota.tono === "ok" ? "fa-circle-check" : "fa-circle-xmark") : "fa-hand-pointer"}`} />
                <div style={{ minWidth: 0 }}>
                  <strong>{nota ? nota.titulo : "Elige una etiqueta"}</strong>
                  <span>{nota ? nota.texto : "Toca un enunciado del texto para etiquetarlo. Aquí aparece la razón, y a la derecha cambia la lectura del texto."}</span>
                </div>
              </div>
            </>
          )}

          {/* MODO 2 — clasifica los nueve enunciados */}
          {modo === "clasificar" && (
            <Mesa>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
                  <span>Los nueve enunciados de la actividad</span>
                  <span style={{ color: clasificarDone ? OK : T.text3 }}>
                    {Object.keys(ubic).length}/{ENUNCIADOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5 }}>{INSTRUCCION_A9}</div>
                {enunLibres.length === 0 ? (
                  <div style={{ fontSize: 14.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ENUNCIADOS.length} enunciados!
                  </div>
                ) : (
                  enunLibres.map((e) => (
                    <button key={e.id} type="button" className="hop-chip" data-sel={selEnun === e.id} onClick={() => setSelEnun((v) => (v === e.id ? null : e.id))} {...dragProps(e.id)}>
                      <i className="fa-solid fa-quote-left" style={{ fontSize: 14, color: T.text3 }} />
                      {e.texto}
                    </button>
                  ))
                )}
              </div>
              <ColumnasClasificar selEnun={selEnun} shakeBin={shakeBin} ubic={ubic} onMatch={intentarEnun} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO 3 — caza la marca */}
          {modo === "marca" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {MARCAS.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    className="hop-paso"
                    data-on={mIdx === i}
                    data-done={resueltas[m.id] === true}
                    aria-label={`Oración ${i + 1}`}
                    onClick={() => {
                      setMIdx(i);
                      setFalloMarca(null);
                    }}
                  >
                    {resueltas[m.id] === true ? <i className="fa-solid fa-check" /> : i + 1}
                  </button>
                ))}
              </div>

              <div className="hop-caja">
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 8, color: accent }} />
                  Señala la palabra que valora
                </div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, margin: "4px 0 14px" }}>
                  Toca la palabra exacta que delata el juicio de quien escribe. Si la oración sólo da un dato comprobable, usa el botón «No hay marca».
                </div>

                <div style={{ padding: "12px 6px", borderRadius: 14, background: T.inset, border: `1px solid ${T.line}` }}>
                  {item.palabras.map((p, i) => (
                    <button key={`${item.id}-${i}`} type="button" className="hop-word" disabled={itemResuelto} data-hit={itemResuelto && item.marcas.includes(i)} onClick={() => clicPalabra(i)}>
                      {p}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                  <button type="button" className="hop-btn" onClick={clicSinMarca} disabled={itemResuelto}>
                    <i className="fa-solid fa-ban" />
                    No hay marca: es información
                  </button>
                  <button
                    type="button"
                    className="hop-btn"
                    data-primary={itemResuelto && mIdx < MARCAS.length - 1}
                    onClick={() => {
                      setMIdx((i) => Math.min(i + 1, MARCAS.length - 1));
                      setFalloMarca(null);
                    }}
                    disabled={mIdx >= MARCAS.length - 1}
                  >
                    Siguiente oración
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>

                {falloMarca && !itemResuelto && (
                  <div className="hop-nota" data-tono="no" style={{ marginTop: 14 }}>
                    <i className="fa-solid fa-circle-xmark" />
                    <div>
                      <span style={{ marginTop: 0 }}>{falloMarca}</span>
                    </div>
                  </div>
                )}

                {itemResuelto && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="hop-nota" data-tono="ok">
                      <i className="fa-solid fa-circle-check" />
                      <div>
                        <strong>{item.tipo}</strong>
                        <span>{item.porque}</span>
                      </div>
                    </div>
                    {item.reescritura && (
                      <div className="hop-nota" data-tono="vacio">
                        <i className="fa-solid fa-pen-to-square" style={{ color: accent }} />
                        <div>
                          <strong>Cómo se diría sin valorar</strong>
                          <span>{item.reescritura}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO 4 — completa el texto (A5 verbatim) */}
          {modo === "texto" && (
            <CompletaTexto
              key={huecosIntento}
              data={HECHO_OPINION_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={huecosDone}
              onCompletado={() => {
                setHuecosDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}
        </div>
      }
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Enunciados" value={`${Object.keys(marcado).length}`} />
                  <Dato label="Marcas cazadas" value={`${Object.keys(resueltas).length}/${MARCAS.length}`} />
                </div>
              </Bloque>
              <Bloque titulo="Las tres preguntas del lector crítico" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
                  {PISTAS_A3.map((p, i) => (
                    <li key={i} style={{ color: T.text2 }}>
                      {p}
                    </li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Las tres etiquetas" icono="fa-tags">
                {CATEGORIAS.map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: CATEGORIA_INFO[c].color }}>{CATEGORIA_INFO[c].titulo}.</strong> {CATEGORIA_INFO[c].descripcion}
                  </p>
                ))}
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={QUIZ}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Distingues el dato del juicio: ya lees críticamente."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Lectura A1" icono="fa-book-open-reader">
                {MARCO.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    {p}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="¿Sabías que?" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_RULFO}</p>
              </Bloque>
              <Bloque titulo="Hechos" icono="fa-check-double">
                {HECHOS.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <i className={`fa-solid ${h.verdadero ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: h.verdadero ? OK : NO, marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ color: T.text }}>{h.enunciado}</div>
                      <div style={{ color: T.text3, marginTop: 3 }}>{h.retro}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Debate de la progresión" icono="fa-comments">
                <div style={{ fontWeight: 800, color: T.text }}>{DEBATE_A6.tema}</div>
                {DEBATE_A6.posturas.map((p, i) => (
                  <div key={i} className="hop-hecho">
                    <div style={{ fontWeight: 700, color: T.text }}>{p.postura}</div>
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18, color: T.text3 }}>
                      {p.argumentos.map((a, j) => (
                        <li key={j}>{a}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>
                  El anuncio del modo «Etiqueta el texto» es el caso para este debate: las dos posturas son defendibles y aquí no hay una respuesta moral correcta, sino argumentos mejor o peor sostenidos.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={HECHO_OPINION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ margin: "16px 0 0", color: T.text3, fontStyle: "italic" }}>
                Son verbatim de la progresión LC-I-P03: la lectura y el «¿sabías que?» de A1, el quiz de A2, las preguntas de A3, los hechos de A4, el texto con huecos de A5, el debate de A6 y los nueve enunciados de A9. Los tres textos que se etiquetan y las siete oraciones de «Caza la marca» se escribieron para esta práctica: son ilustrativos. La biblioteca de la colonia Las Águilas y la marca «Colibrí» son ficticias a propósito. Los datos externos sí son reales: Juan Rulfo publicó El Llano en llamas (1953) y Pedro Páramo (1955); el Metro de la Ciudad de México abrió en 1969; la Feria Internacional del Libro de Guadalajara se celebra desde 1987. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/** Foto de cabecera: se ve bien aunque el archivo aún no exista. */
function Foto({ clave, icono }: { clave: string; icono: string }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="hop-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {ok && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setOk(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * «Lectura en vivo»: la composición y el veredicto que salen de las etiquetas
 * ═══════════════════════════════════════════════════════════════════════════ */
function Lectura({
  texto,
  marcado,
  soloDatos,
  onFiltro,
  textoCompleto,
  propElegido,
  propOk,
  onProposito,
}: {
  texto: TextoAnalizable;
  marcado: Record<string, Categoria>;
  soloDatos: boolean;
  onFiltro: () => void;
  textoCompleto: boolean;
  propElegido: Proposito | undefined;
  propOk: boolean;
  onProposito: (p: Proposito) => void;
}) {
  const total = texto.segmentos.length;
  const alumno = cuentaDe(texto, (s) => marcado[s.id]);
  const real = cuentaDe(texto, (s) => s.categoria);
  const etiquetados = alumno.informacion + alumno.idea + alumno.opinion;
  const pend = total - etiquetados;
  const mal = texto.segmentos.filter((s) => marcado[s.id] && marcado[s.id] !== s.categoria).length;
  const tAlumno = tonoDe(alumno, total);
  const tReal = tonoDe(real, total);
  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <div className="hop-vivo">
      <div className="hop-caja">
        <div className="hop-caja-t">
          <span>
            <i className="fa-solid fa-chart-simple" />
            Qué hay en el texto
          </span>
          <span style={{ color: T.text }}>
            {etiquetados}/{total} etiquetados
          </span>
        </div>
        <div className="hop-barra" role="img" aria-label="Composición del texto según tus etiquetas">
          {CATEGORIAS.map((c) => (
            <span key={c} style={{ width: pct(alumno[c]), background: CATEGORIA_INFO[c].color }} />
          ))}
        </div>
        <div className="hop-leyenda">
          {CATEGORIAS.map((c) => (
            <span key={c}>
              <i className="fa-solid fa-square" style={{ color: CATEGORIA_INFO[c].color }} /> {CATEGORIA_INFO[c].titulo} {alumno[c]}
            </span>
          ))}
          {pend > 0 && <span style={{ color: T.text3 }}>sin etiquetar {pend}</span>}
        </div>

        {etiquetados === 0 ? (
          <div className="hop-veredicto" data-tono="vacio">
            Aún no hay lectura: etiqueta enunciados y mira qué decisión te deja el texto.
          </div>
        ) : (
          <div className="hop-veredicto" style={{ borderColor: `${TONO_INFO[tAlumno].color}88`, background: `${TONO_INFO[tAlumno].color}12` }}>
            <strong style={{ color: TONO_INFO[tAlumno].color }}>
              <i className={`fa-solid ${TONO_INFO[tAlumno].icono}`} /> {pend > 0 ? "Con lo que llevas: " : ""}
              {TONO_INFO[tAlumno].titulo}
            </strong>
            <span>{TONO_INFO[tAlumno].texto}</span>
          </div>
        )}

        {textoCompleto && tAlumno !== tReal && (
          <div className="hop-veredicto" data-tono="mal">
            <strong style={{ color: NO }}>
              <i className="fa-solid fa-triangle-exclamation" /> Tus etiquetas cambian la decisión
            </strong>
            <span>
              Con {mal} enunciado{mal > 1 ? "s" : ""} mal etiquetado{mal > 1 ? "s" : ""} el texto parece «{TONO_INFO[tAlumno].titulo.toLowerCase()}», pero en realidad «{TONO_INFO[tReal].titulo.toLowerCase()}».
            </span>
          </div>
        )}
        {textoCompleto && tAlumno === tReal && mal === 0 && (
          <div className="hop-veredicto" data-tono="ok">
            <strong style={{ color: OK }}>
              <i className="fa-solid fa-circle-check" /> Lectura correcta
            </strong>
            <span>Tus etiquetas coinciden con las del texto: {real.informacion} comprobable{real.informacion === 1 ? "" : "s"}, {real.idea} idea{real.idea === 1 ? "" : "s"} y {real.opinion} opinion{real.opinion === 1 ? "" : "es"}.</span>
          </div>
        )}

        <button type="button" className="hop-btn" data-on={soloDatos} onClick={onFiltro} style={{ marginTop: 12 }} aria-pressed={soloDatos}>
          <i className={`fa-solid ${soloDatos ? "fa-eye" : "fa-filter"}`} />
          {soloDatos ? "Ver el texto completo" : "Solo lo comprobable"}
        </button>
      </div>

      <div className="hop-caja" style={{ opacity: textoCompleto ? 1 : 0.6 }}>
        <div className="hop-caja-t">
          <span>
            <i className="fa-solid fa-scale-balanced" />
            ¿Quiere informarte o convencerte?
          </span>
        </div>
        {!textoCompleto ? (
          <div style={{ fontSize: 14.5, color: T.text3, lineHeight: 1.5 }}>Etiqueta los {total} enunciados: con el texto entero a la vista podrás juzgar su propósito.</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {PROPOSITOS.map((p) => {
                const elegido = propElegido === p;
                const correcto = propOk && p === texto.proposito;
                const malo = elegido && !propOk;
                return (
                  <button
                    key={p}
                    type="button"
                    className="hop-btn"
                    onClick={() => onProposito(p)}
                    disabled={propOk}
                    style={correcto ? { borderColor: OK, background: `${OK}1c` } : malo ? { borderColor: NO, background: `${NO}1c` } : undefined}
                  >
                    <i className={`fa-solid ${PROPOSITO_INFO[p].icono}`} />
                    {PROPOSITO_INFO[p].titulo}
                  </button>
                );
              })}
            </div>
            {propOk ? (
              <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 10 }}>
                <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3 }} />
                <span>{texto.explicacionProposito}</span>
              </div>
            ) : propElegido ? (
              <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 10 }}>
                <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginTop: 3 }} />
                <span>Todavía no. Mira la barra de arriba: ese reparto entre datos, ideas y juicios delata el propósito.</span>
              </div>
            ) : (
              <div style={{ fontSize: 14.5, color: T.text3 }}>Decide con la barra de composición a la vista.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes hopShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
  @keyframes hopPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }

  .hop-doc { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:10px;
    border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .hop-doc:hover { border-color:${T.lineStrong}; color:#fff; }
  .hop-doc[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
  .hop-doc[data-done="true"] { color:${OK}; border-color:${OK}66; }

  .hop-lentes { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:8px; }
  .hop-lente { cursor:pointer; text-align:left; padding:10px 13px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; transition:all .15s; }
  .hop-lente:hover { border-color:${T.lineStrong}; }
  .hop-lente[data-on="true"] { color:#fff; }

  .hop-sim { display:grid; grid-template-columns:minmax(0,1fr); gap:14px; align-items:start; }
  @container lsescena (min-width: 820px) { .hop-sim { grid-template-columns:minmax(0,1.15fr) minmax(0,1fr); } }

  .hop-art { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; overflow:hidden; min-width:0; }
  .hop-foto { position:relative; width:100%; aspect-ratio:16/7; background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.35); font-size:44px; }
  .hop-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hop-art-cuerpo { padding:14px 16px 16px; }
  .hop-parrafo { margin:12px 0 0; font-size:16px; line-height:2.1; color:${T.text}; overflow-wrap:anywhere; }
  .hop-seg { cursor:pointer; display:inline; border-radius:5px; padding:2px 3px; margin:0 1px; border-bottom:2px dashed rgba(255,255,255,0.22); transition:background .15s, border-color .15s, opacity .2s, filter .2s; }
  .hop-seg:hover { background:rgba(255,255,255,0.09); border-bottom-color:rgba(255,255,255,0.5); }
  .hop-seg:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  .hop-seg[data-done="true"] { border-bottom-style:solid; font-weight:600; }
  .hop-seg[data-mal="true"] { text-decoration:underline wavy ${NO}; text-underline-offset:5px; }
  .hop-seg[data-apagado="true"] { opacity:.18; filter:blur(1.5px); }
  .hop-seg[data-shake="true"] { animation:hopShake .4s; background:${NO}22; border-bottom-color:${NO}; }
  .hop-badge { display:inline-flex; align-items:center; gap:5px; font-size:14px; font-weight:900; padding:0 7px; border-radius:999px; margin-left:5px; vertical-align:middle; animation:hopPop .25s ease; }

  .hop-vivo { display:flex; flex-direction:column; gap:12px; min-width:0; }
  .hop-caja { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; min-width:0; }
  .hop-caja-t { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text2}; margin-bottom:10px; }
  .hop-caja-t i { color:${accent}; margin-right:8px; }
  .hop-barra { display:flex; height:20px; border-radius:10px; overflow:hidden; background:${T.inset}; border:1px solid ${T.line}; }
  .hop-barra > span { display:block; height:100%; transition:width .3s; }
  .hop-leyenda { display:flex; flex-wrap:wrap; gap:6px 14px; margin-top:8px; font-size:14px; color:${T.text2}; }
  .hop-leyenda i { margin-right:5px; }
  .hop-veredicto { margin-top:10px; padding:10px 12px; border-radius:12px; font-size:14.5px; line-height:1.45; color:${T.text2}; border:1.5px solid ${T.line}; background:${T.inset}; display:flex; flex-direction:column; gap:4px; }
  .hop-veredicto strong { font-size:15px; }
  .hop-veredicto[data-tono="ok"] { border-color:${OK}77; background:${OK}12; }
  .hop-veredicto[data-tono="mal"] { border-color:${NO}77; background:${NO}10; }

  .hop-nota { border-radius:14px; padding:12px 16px; border:1.5px solid ${T.line}; background:${T.glass}; display:flex; gap:12px; align-items:flex-start; transition:all .18s; }
  .hop-nota > i { font-size:17px; margin-top:2px; color:${T.text3}; }
  .hop-nota strong { display:block; font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text3}; }
  .hop-nota span { display:block; margin-top:4px; font-size:14.5px; line-height:1.5; color:${T.text2}; }
  .hop-nota[data-tono="ok"] { border-color:${OK}55; background:${OK}12; }
  .hop-nota[data-tono="ok"] > i, .hop-nota[data-tono="ok"] strong { color:${OK}; }
  .hop-nota[data-tono="no"] { border-color:${NO}55; background:${NO}12; }
  .hop-nota[data-tono="no"] > i, .hop-nota[data-tono="no"] strong { color:${NO}; }

  .hop-caja .hop-word, .hop-word { cursor:pointer; display:inline-block; border-radius:7px; padding:3px 5px; margin:2px 1px;
    border:1px solid transparent; background:transparent; color:${T.text}; font-size:17px; line-height:1.7; transition:all .12s; }
  .hop-word:hover:not(:disabled) { background:rgba(255,255,255,0.11); border-color:${T.lineStrong}; }
  .hop-word:disabled { cursor:default; }
  .hop-word[data-hit="true"] { background:#FBBF2433; border-color:#FBBF24; color:#fff; font-weight:800; }

  .hop-chip { cursor:grab; display:flex; align-items:flex-start; gap:8px; padding:10px 14px; border-radius:13px; width:100%;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; transition:all .14s;
    user-select:none; text-align:left; line-height:1.4; overflow-wrap:anywhere; }
  .hop-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .hop-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .hop-chip:active { cursor:grabbing; }
  /* El color de cada columna no es decorativo: lo pone el propio marcador. */
  .hop-bin { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; transition:all .16s; min-height:150px; min-width:0; }
  .hop-bin[data-shake="true"] { animation:hopShake .4s; border-color:${NO}; }
  .hop-bins { display:grid; grid-template-columns:minmax(0,1fr); gap:12px; }

  .hop-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:10px 16px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .hop-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .hop-btn:disabled { opacity:.45; cursor:default; }
  .hop-btn[data-primary="true"], .hop-btn[data-on="true"] { background:${accent}; color:#04121f; border-color:${accent}; }
  .hop-paso { cursor:pointer; width:38px; height:38px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
    color:${T.text3}; font-size:14.5px; font-weight:900; transition:all .14s; }
  .hop-paso:hover { border-color:${T.lineStrong}; color:#fff; }
  .hop-paso[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; }
  .hop-paso[data-done="true"] { color:${OK}; border-color:${OK}66; }
  .hop-hecho { padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; font-size:14.5px; line-height:1.5; }
  @media (prefers-reduced-motion: reduce){
    .hop-seg[data-shake="true"], .hop-bin[data-shake="true"], .hop-badge { animation:none; }
    .hop-barra > span, .hop-seg { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Columnas del modo «Clasifica los enunciados» (A9)
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function ColumnasClasificar({
  selEnun,
  shakeBin,
  ubic,
  onMatch,
  dropProps,
}: {
  selEnun: string | null;
  shakeBin: Categoria | null;
  ubic: Record<string, Categoria>;
  onMatch: (enunId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  return (
    <div className="hop-bins">
      {CATEGORIAS.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = ENUNCIADOS.filter((e) => ubic[e.id] === bin);
        return (
          <div
            key={bin}
            className="hop-bin"
            data-shake={shakeBin === bin}
            onClick={() => selEnun && onMatch(selEnun, bin)}
            style={{ position: "relative", isolation: "isolate", borderColor: `${info.color}44`, backgroundImage: `radial-gradient(120% 90% at 0% 0%, ${info.color}1a 0%, transparent 62%)` }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={info.color} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 10, lineHeight: 1.45 }}>{info.descripcion}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "6px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((e) => (
                  <div key={e.id} style={{ animation: "hopPop .25s ease", padding: "9px 12px", borderRadius: 11, background: `${info.color}18`, border: `1px solid ${info.color}55`, lineHeight: 1.45 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", display: "flex", gap: 7 }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 14, color: info.color, marginTop: 3 }} />
                      <span>{e.texto}</span>
                    </div>
                    <div style={{ fontSize: 14, color: T.text3, marginTop: 5, paddingLeft: 21 }}>{e.explicacion}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
